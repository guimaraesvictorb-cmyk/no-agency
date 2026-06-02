import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createHmac } from "crypto"

function signState(payload: object): string {
  const json = JSON.stringify(payload)
  const sig = createHmac("sha256", process.env.APPROVAL_TOKEN_SECRET!)
    .update(json).digest("hex")
  return Buffer.from(JSON.stringify({ json, sig })).toString("base64url")
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL("/login", req.url))

  const client_id = req.nextUrl.searchParams.get("client_id")
  if (!client_id) return NextResponse.json({ error: "client_id obrigatório" }, { status: 400 })

  const META_APP_ID = process.env.META_APP_ID
  if (!META_APP_ID || !process.env.META_APP_SECRET) {
    return NextResponse.redirect(
      new URL("/midias-sociais?error=not_configured", req.url)
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get("host")}`
  const redirectUri = `${baseUrl}/api/oauth/meta/callback`
  const state = signState({ client_id, user_id: user.id, ts: Date.now() })

  const scope = [
    "pages_show_list",
    "pages_read_engagement",
    "instagram_basic",
    "instagram_content_publish",
    "pages_manage_posts",
    "pages_manage_metadata",
  ].join(",")

  const oauthUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth")
  oauthUrl.searchParams.set("client_id", META_APP_ID)
  oauthUrl.searchParams.set("redirect_uri", redirectUri)
  oauthUrl.searchParams.set("state", state)
  oauthUrl.searchParams.set("scope", scope)
  oauthUrl.searchParams.set("response_type", "code")

  return NextResponse.redirect(oauthUrl.toString())
}
