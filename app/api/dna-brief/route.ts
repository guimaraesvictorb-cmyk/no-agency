import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const client_id = req.nextUrl.searchParams.get("client_id")
  if (!client_id) return NextResponse.json({ error: "client_id obrigatório" }, { status: 400 })

  const { data, error } = await supabase
    .from("dna_briefs")
    .select("*")
    .eq("client_id", client_id)
    .order("version", { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ brief: data ?? null })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const body = await req.json()
  const { client_id, ...fields } = body

  if (!client_id) return NextResponse.json({ error: "client_id obrigatório" }, { status: 400 })

  // Check if brief exists for this client
  const { data: existing } = await supabase
    .from("dna_briefs")
    .select("id, version")
    .eq("client_id", client_id)
    .order("version", { ascending: false })
    .limit(1)
    .single()

  let result
  if (existing) {
    // Update existing brief
    const { data, error } = await supabase
      .from("dna_briefs")
      .update({ ...fields, version: existing.version + 1, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single()
    result = { data, error }
  } else {
    // Create new brief
    const { data, error } = await supabase
      .from("dna_briefs")
      .insert({ client_id, ...fields, version: 1 })
      .select()
      .single()
    result = { data, error }
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
  return NextResponse.json({ brief: result.data })
}
