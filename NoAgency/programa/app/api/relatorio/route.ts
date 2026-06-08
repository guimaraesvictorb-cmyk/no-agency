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
  const from = req.nextUrl.searchParams.get("from")
  const to   = req.nextUrl.searchParams.get("to")

  if (!client_id || !from || !to)
    return NextResponse.json({ error: "Parâmetros obrigatórios: client_id, from, to" }, { status: 400 })

  const hasAccess = await verifyAccess(user.id, client_id)
  if (!hasAccess) return NextResponse.json({ error: "Sem acesso" }, { status: 403 })

  const db = adminDb()

  const [{ data: posts }, { data: nps }] = await Promise.all([
    db.from("posts")
      .select("id, status, platform, scheduled_for, created_at")
      .eq("client_id", client_id)
      .gte("created_at", from)
      .lte("created_at", to),
    db.from("nps_responses")
      .select("id, score, created_at")
      .eq("client_id", client_id)
      .gte("created_at", from)
      .lte("created_at", to),
  ])

  const allPosts = posts ?? []
  const published  = allPosts.filter((p) => p.status === "published").length
  const scheduled  = allPosts.filter((p) => p.status === "approved" || p.status === "scheduled").length
  const pending    = allPosts.filter((p) => p.status === "sent_for_approval").length
  const total      = allPosts.length

  const npsScores  = (nps ?? []).map((n) => n.score)
  const avgNps     = npsScores.length
    ? Math.round(npsScores.reduce((a, b) => a + b, 0) / npsScores.length * 10) / 10
    : null

  const byPlatform: Record<string, number> = {}
  allPosts.forEach((p) => {
    const pl = p.platform ?? "outros"
    byPlatform[pl] = (byPlatform[pl] ?? 0) + 1
  })

  return NextResponse.json({
    period: { from, to },
    metrics: {
      published,
      scheduled,
      pending,
      total,
      avg_nps: avgNps,
      nps_count: npsScores.length,
    },
    by_platform: byPlatform,
  })
}
