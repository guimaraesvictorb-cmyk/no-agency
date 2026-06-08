import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function verifyClientAccess(userId: string, clientId: string): Promise<boolean> {
  const { data } = await adminClient()
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .or(`profile_id.eq.${userId},user_id.eq.${userId}`)
    .maybeSingle()

  if (data) return true

  const { data: profile } = await adminClient()
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  return profile?.role === "admin"
}

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const client_id = req.nextUrl.searchParams.get("client_id")
  if (!client_id) return NextResponse.json({ error: "client_id obrigatório" }, { status: 400 })

  const hasAccess = await verifyClientAccess(user.id, client_id)
  if (!hasAccess) return NextResponse.json({ error: "Sem acesso" }, { status: 403 })

  const { data, error } = await adminClient()
    .from("dna_briefs")
    .select("*")
    .eq("client_id", client_id)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ brief: data ?? null })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const body = await req.json()
  const { client_id, ...fields } = body
  if (!client_id) return NextResponse.json({ error: "client_id obrigatório" }, { status: 400 })

  const hasAccess = await verifyClientAccess(user.id, client_id)
  if (!hasAccess) return NextResponse.json({ error: "Sem acesso" }, { status: 403 })

  const db = adminClient()

  const { data: existing } = await db
    .from("dna_briefs")
    .select("id, version")
    .eq("client_id", client_id)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle()

  let result
  if (existing) {
    const { data, error } = await db
      .from("dna_briefs")
      .update({ ...fields, version: existing.version + 1, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single()
    result = { data, error }
  } else {
    const { data, error } = await db
      .from("dna_briefs")
      .insert({ client_id, ...fields, version: 1 })
      .select()
      .single()
    result = { data, error }
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
  return NextResponse.json({ brief: result.data })
}
