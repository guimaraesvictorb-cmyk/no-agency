import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createHmac } from "crypto"

function adminDb() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function verifyState(encoded: string): { client_id: string; user_id: string; ts: number } | null {
  try {
    const { json, sig } = JSON.parse(Buffer.from(encoded, "base64url").toString())
    const expected = createHmac("sha256", process.env.APPROVAL_TOKEN_SECRET!)
      .update(json).digest("hex")
    if (sig !== expected) return null
    const data = JSON.parse(json)
    if (Date.now() - data.ts > 10 * 60 * 1000) return null
    return data
  } catch {
    return null
  }
}

async function exchangeForLongToken(shortToken: string) {
  const url = new URL("https://graph.facebook.com/v19.0/oauth/access_token")
  url.searchParams.set("grant_type", "fb_exchange_token")
  url.searchParams.set("client_id", process.env.META_APP_ID!)
  url.searchParams.set("client_secret", process.env.META_APP_SECRET!)
  url.searchParams.set("fb_exchange_token", shortToken)

  const res = await fetch(url.toString())
  const data = await res.json()
  if (!data.access_token) throw new Error(data.error?.message ?? "Token exchange failed")

  const expiresAt = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000).toISOString()
    : null
  return { token: data.access_token as string, expiresAt: expiresAt as string | null }
}

async function fetchShortToken(code: string, redirectUri: string) {
  const url = new URL("https://graph.facebook.com/v19.0/oauth/access_token")
  url.searchParams.set("client_id", process.env.META_APP_ID!)
  url.searchParams.set("client_secret", process.env.META_APP_SECRET!)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("code", code)

  const res = await fetch(url.toString())
  const data = await res.json()
  if (!data.access_token) throw new Error(data.error?.message ?? "Short token failed")
  return data.access_token as string
}

type MetaPage = {
  id: string
  name: string
  access_token: string
  instagram_business_account?: { id: string }
}

async function fetchPages(userToken: string): Promise<MetaPage[]> {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${encodeURIComponent(userToken)}`
  )
  const data = await res.json()
  return (data.data ?? []) as MetaPage[]
}

async function fetchIGUsername(igId: string, pageToken: string): Promise<string | null> {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${igId}?fields=username&access_token=${encodeURIComponent(pageToken)}`
  )
  const data = await res.json()
  return (data.username as string | undefined) ?? null
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get("code")
  const stateParam = searchParams.get("state")
  const errParam = searchParams.get("error")

  const failUrl = (reason: string) =>
    new URL(`/midias-sociais?error=${reason}`, req.url)

  if (errParam) return NextResponse.redirect(failUrl("cancelled"))
  if (!code || !stateParam) return NextResponse.redirect(failUrl("invalid"))

  const state = verifyState(stateParam)
  if (!state) return NextResponse.redirect(failUrl("state"))

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== state.user_id) return NextResponse.redirect(failUrl("auth"))

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get("host")}`
  const redirectUri = `${baseUrl}/api/oauth/meta/callback`

  try {
    const shortToken = await fetchShortToken(code, redirectUri)
    const { token: longToken, expiresAt } = await exchangeForLongToken(shortToken)
    const pages = await fetchPages(longToken)

    if (pages.length === 0) return NextResponse.redirect(failUrl("no_pages"))

    const db = adminDb()

    for (const page of pages) {
      // Remove old connection for this client+platform before inserting fresh
      await db.from("social_connections").delete()
        .eq("client_id", state.client_id).eq("platform", "facebook").eq("page_id", page.id)

      await db.from("social_connections").insert({
        client_id: state.client_id,
        platform: "facebook",
        page_id: page.id,
        page_name: page.name,
        access_token_encrypted: page.access_token,
        token_expires_at: expiresAt,
        is_active: true,
      })

      if (page.instagram_business_account) {
        const igId = page.instagram_business_account.id
        const username = await fetchIGUsername(igId, page.access_token)

        await db.from("social_connections").delete()
          .eq("client_id", state.client_id).eq("platform", "instagram").eq("page_id", igId)

        await db.from("social_connections").insert({
          client_id: state.client_id,
          platform: "instagram",
          page_id: igId,
          page_name: username ?? page.name,
          access_token_encrypted: page.access_token,
          token_expires_at: expiresAt,
          is_active: true,
        })
      }
    }

    return NextResponse.redirect(new URL("/midias-sociais?success=true", req.url))
  } catch (err) {
    console.error("[meta-callback]", err)
    return NextResponse.redirect(failUrl("token"))
  }
}
