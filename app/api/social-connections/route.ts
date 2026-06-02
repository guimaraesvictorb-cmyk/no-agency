import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

function adminDb() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function verifyAccess(userId: string, clientId: string): Promise<boolean> {
  const { data: profile } = await adminDb()
    .from("profiles").select("role").eq("id", userId).maybeSingle()
  if (profile?.role === "admin") return true

  const { data } = await adminDb()
    .from("clients").select("id").eq("id", clientId)
    .or(`profile_id.eq.${userId},user_id.eq.${userId}`).maybeSingle()
  return !!data
}

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const client_id = req.nextUrl.searchParams.get("client_id")
  if (!client_id) return NextResponse.json({ error: "client_id obrigatório" }, { status: 400 })

  const hasAccess = await verifyAccess(user.id, client_id)
  if (!hasAccess) return NextResponse.json({ error: "Sem acesso" }, { status: 403 })

  const { data, error } = await adminDb()
    .from("social_connections")
    .select("id, platform, page_id, page_name, is_active, connected_at, token_expires_at")
    .eq("client_id", client_id)
    .eq("is_active", true)
    .order("connected_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ connections: data ?? [] })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { connection_id, client_id } = await req.json()
  if (!connection_id || !client_id) return NextResponse.json({ error: "Parâmetros faltando" }, { status: 400 })

  const hasAccess = await verifyAccess(user.id, client_id)
  if (!hasAccess) return NextResponse.json({ error: "Sem acesso" }, { status: 403 })

  const { error } = await adminDb()
    .from("social_connections")
    .update({ is_active: false })
    .eq("id", connection_id)
    .eq("client_id", client_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
