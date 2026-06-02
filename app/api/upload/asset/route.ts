import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

const BUCKET = "client-assets"

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

async function ensureBucket() {
  const { error } = await adminDb().storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ["image/*"],
    fileSizeLimit: 5 * 1024 * 1024,
  })
  // Ignore "already exists" error
  if (error && !error.message.includes("already exists")) throw error
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const client_id = formData.get("client_id") as string | null
  const tag = (formData.get("tag") as string | null) ?? "biblioteca"

  if (!file || !client_id)
    return NextResponse.json({ error: "file e client_id obrigatórios" }, { status: 400 })

  const hasAccess = await verifyAccess(user.id, client_id)
  if (!hasAccess) return NextResponse.json({ error: "Sem acesso" }, { status: 403 })

  await ensureBucket()

  const ext = file.name.split(".").pop() ?? "jpg"
  const path = `${client_id}/${tag}/${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const db = adminDb()

  const { error: uploadError } = await db.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(path)

  const { data: mediaFile, error: dbError } = await db
    .from("media_files")
    .insert({
      client_id,
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
      tags: [tag],
    })
    .select()
    .single()

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ file: mediaFile })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { media_file_id, client_id } = await req.json()
  if (!media_file_id || !client_id)
    return NextResponse.json({ error: "Parâmetros faltando" }, { status: 400 })

  const hasAccess = await verifyAccess(user.id, client_id)
  if (!hasAccess) return NextResponse.json({ error: "Sem acesso" }, { status: 403 })

  const db = adminDb()

  // Get the file to find storage path
  const { data: mf } = await db
    .from("media_files")
    .select("file_url")
    .eq("id", media_file_id)
    .eq("client_id", client_id)
    .maybeSingle()

  if (mf?.file_url) {
    // Extract path from public URL
    const url = new URL(mf.file_url)
    const pathStart = url.pathname.indexOf(`/object/public/${BUCKET}/`)
    if (pathStart !== -1) {
      const storagePath = url.pathname.slice(pathStart + `/object/public/${BUCKET}/`.length)
      await db.storage.from(BUCKET).remove([storagePath])
    }
  }

  await db.from("media_files").delete().eq("id", media_file_id)

  return NextResponse.json({ success: true })
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
    .from("media_files")
    .select("id, file_name, file_url, file_type, file_size, tags, uploaded_at")
    .eq("client_id", client_id)
    .order("uploaded_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ files: data ?? [] })
}
