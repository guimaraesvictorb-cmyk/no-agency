import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"

// ─── Pipeline bar ────────────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { label: "DNA Brief",  done: true },
  { label: "Mídias",     done: true },
  { label: "Calendário", done: true },
  { label: "Gerado",     done: true },
  { label: "Aprovação",  active: true },
  { label: "Agendado" },
  { label: "Publicado" },
]

function PipelineBar() {
  return (
    <div className="flex mb-6">
      {PIPELINE_STEPS.map((step, i) => (
        <div
          key={step.label}
          className={`flex-1 text-center py-3 px-1 text-[9px] font-semibold uppercase tracking-wide
            ${i === 0 ? "rounded-l-lg" : ""}
            ${i === PIPELINE_STEPS.length - 1 ? "rounded-r-lg" : ""}
            ${step.done ? "border border-green/25 text-green" : step.active ? "text-white border border-signal/35" : "text-stone border border-white/5"}`}
          style={
            step.done ? { background: "rgba(16,185,129,0.08)" }
            : step.active ? { background: "rgba(214,64,69,0.14)" }
            : { background: "var(--ink-2)" }
          }
        >
          {step.label}
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, accent }: {
  label: string; value: string; sub: string; accent: "red"|"green"|"amber"|"blue"
}) {
  const bar = { red: "var(--signal)", green: "var(--green)", amber: "var(--amber)", blue: "var(--blue)" }[accent]
  return (
    <div className="relative overflow-hidden rounded-xl px-5 py-5"
      style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: bar }} />
      <div className="text-[11px] text-stone uppercase tracking-wide mb-2">{label}</div>
      <div className="font-bebas text-[40px] leading-none text-white mb-1">{value}</div>
      <div className="text-[11px]" style={{ color: bar }}>↑ {sub}</div>
    </div>
  )
}

// ─── Admin dashboard ─────────────────────────────────────────────────────────

async function AdminDashboard({ userId }: { userId: string }) {
  const supabase = await createClient()

  const [{ data: clients }, { data: posts }, { data: npsRows }] = await Promise.all([
    supabase.from("clients").select("id, name, status, plan").eq("profile_id", userId),
    supabase.from("posts").select("id, status, caption, platform, client_id, scheduled_for, created_at").order("created_at", { ascending: false }),
    supabase.from("nps_responses").select("id, score, comment, client_id, created_at").order("created_at", { ascending: false }).limit(5),
  ])

  const activeClients = (clients ?? []).filter((c) => c.status === "active").length
  const pendingPosts  = (posts ?? []).filter((p) => p.status === "sent_for_approval")
  const scheduledPosts = (posts ?? []).filter((p) => p.status === "approved" || p.status === "scheduled")
  const publishedMonth = (posts ?? []).filter((p) => {
    if (p.status !== "published") return false
    const d = new Date(p.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const npsScores = (npsRows ?? []).map((n) => n.score)
  const avgNps = npsScores.length
    ? Math.round(npsScores.reduce((a, b) => a + b, 0) / npsScores.length * 10) / 10
    : 0

  const clientMap = Object.fromEntries((clients ?? []).map((c) => [c.id, c.name]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Bom dia, Victor 👋</h1>
        <p className="text-[13px] text-stone">Administrador · No Agency</p>
      </div>

      <PipelineBar />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Posts este mês"     value={`${publishedMonth}/20`}       sub="publicações"      accent="red"   />
        <StatCard label="Clientes ativos"    value={String(activeClients)}         sub="100% ativos"      accent="green" />
        <StatCard label="Aguard. aprovação"  value={String(pendingPosts.length)}   sub="prazo 5 dias"     accent="amber" />
        <StatCard label="NPS médio"          value={avgNps ? `${avgNps}/10` : "—"} sub="este mês"         accent="blue"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Posts para aprovar */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <div className="text-[13px] font-semibold text-white flex items-center gap-2">
                Posts para aprovar
                {pendingPosts.length > 0 && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(245,158,11,0.15)", color: "var(--amber)" }}>
                    {pendingPosts.length} pendentes
                  </span>
                )}
              </div>
              <div className="text-[12px] text-stone mt-0.5">Auto-aprovação em 5 dias sem resposta</div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {pendingPosts.length === 0 ? (
              <p className="text-center text-sm text-stone py-6">Nenhuma aprovação pendente 🎉</p>
            ) : pendingPosts.slice(0, 4).map((post) => (
              <div key={post.id} className="flex items-center gap-3.5 px-4 py-3.5 rounded-lg"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
                  style={{ background: "rgba(214,64,69,0.12)" }}>
                  🏗️
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-white truncate">
                    {post.caption.split("\n")[0].replace(/[*#]/g, "")}
                  </div>
                  <div className="text-[11px] text-stone mt-0.5">
                    {clientMap[post.client_id] ?? "—"} · {post.platform}
                  </div>
                </div>
                <span className="text-[9px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
                  style={{ background: "rgba(245,158,11,0.13)", color: "var(--amber)" }}>
                  Pendente
                </span>
              </div>
            ))}
            <Link href="/calendario"
              className="block w-full py-3 text-center text-[12px] font-bold uppercase tracking-widest text-white rounded-lg mt-1 hover:opacity-90 transition-opacity"
              style={{ background: "var(--signal)" }}>
              Ver e aprovar posts →
            </Link>
          </div>
        </div>

        {/* Próximos posts */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="text-[13px] font-semibold text-white">Próximos posts agendados</div>
            <div className="text-[12px] text-stone mt-0.5">Em ordem de publicação</div>
          </div>
          <div className="p-4 space-y-2">
            {scheduledPosts.length === 0 ? (
              <p className="text-center text-sm text-stone py-6">Nenhum post agendado</p>
            ) : scheduledPosts.slice(0, 4).map((post) => (
              <div key={post.id} className="flex items-center gap-3.5 px-4 py-3.5 rounded-lg"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
                  style={{ background: "rgba(16,185,129,0.12)" }}>
                  ✅
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-white truncate">
                    {post.caption.split("\n")[0].replace(/[*#]/g, "")}
                  </div>
                  <div className="text-[11px] text-stone mt-0.5">
                    {clientMap[post.client_id] ?? "—"} ·{" "}
                    {post.scheduled_for
                      ? new Date(post.scheduled_for).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                      : "—"}
                  </div>
                </div>
                <span className="text-[9px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.13)", color: "var(--green)" }}>
                  Agendado
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NPS recente — admin only */}
      {npsRows && npsRows.length > 0 && (
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="text-[13px] font-semibold text-white">Feedbacks recentes</div>
            <Link href="/feedback" className="text-[11px] text-signal hover:underline">Ver todos</Link>
          </div>
          <div className="p-4 space-y-3">
            {npsRows.map((nps) => {
              const cat = nps.score >= 9 ? "promoter" : nps.score >= 7 ? "passive" : "detractor"
              return (
                <div key={nps.id} className="flex items-start gap-3 py-2.5"
                  style={{ borderBottom: "1px solid var(--border)" }}>
                  <div
                    className={`w-[38px] h-[38px] rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0 ${
                      cat === "promoter" ? "text-green" : cat === "passive" ? "text-amber" : "text-signal"
                    }`}
                    style={{
                      background: cat === "promoter"
                        ? "rgba(16,185,129,0.18)"
                        : cat === "passive"
                        ? "rgba(245,158,11,0.18)"
                        : "rgba(214,64,69,0.18)",
                    }}
                  >
                    {nps.score}
                  </div>
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold text-white">
                      {clientMap[nps.client_id] ?? "Cliente"}
                    </div>
                    {nps.comment && (
                      <div className="text-[11px] text-stone mt-0.5">"{nps.comment}"</div>
                    )}
                  </div>
                  <div className="text-[11px] text-stone/60">
                    {new Date(nps.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Client dashboard ─────────────────────────────────────────────────────────

async function ClientDashboard({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, plan, status")
    .eq("user_id", userId)
    .single()

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="text-5xl">🚀</div>
        <h1 className="font-bebas text-[36px] text-white">Sua conta está sendo configurada</h1>
        <p className="text-stone text-[14px] max-w-sm">
          Em breve você terá acesso ao seu painel. Entre em contato com a No Agency para agilizar o processo.
        </p>
      </div>
    )
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, status, caption, platform, scheduled_for, created_at")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false })

  const pendingPosts   = (posts ?? []).filter((p) => p.status === "sent_for_approval")
  const scheduledPosts = (posts ?? []).filter((p) => p.status === "approved" || p.status === "scheduled")
  const publishedMonth = (posts ?? []).filter((p) => {
    if (p.status !== "published") return false
    const d = new Date(p.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bebas text-[40px] text-white leading-none mb-1">
          Olá, {client.name} 👋
        </h1>
        <p className="text-[13px] text-stone">Plano {client.plan} · Bem-vindo à No Agency</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Posts este mês"   value={String(publishedMonth)}       sub="publicados"    accent="red"   />
        <StatCard label="Aguard. aprovação" value={String(pendingPosts.length)} sub="precisam de ok" accent="amber" />
        <StatCard label="Agendados"         value={String(scheduledPosts.length)} sub="a publicar"  accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Posts para aprovar */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="text-[13px] font-semibold text-white">Posts para aprovar</div>
            <div className="text-[12px] text-stone mt-0.5">Sua aprovação é necessária antes da publicação</div>
          </div>
          <div className="p-4 space-y-2">
            {pendingPosts.length === 0 ? (
              <p className="text-center text-sm text-stone py-6">Nenhuma aprovação pendente 🎉</p>
            ) : pendingPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="flex items-center gap-3.5 px-4 py-3.5 rounded-lg"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
                  style={{ background: "rgba(245,158,11,0.12)" }}>
                  ⏳
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-white truncate">
                    {post.caption.split("\n")[0].replace(/[*#]/g, "")}
                  </div>
                  <div className="text-[11px] text-stone mt-0.5">{post.platform}</div>
                </div>
              </div>
            ))}
            <Link href="/calendario"
              className="block w-full py-3 text-center text-[12px] font-bold uppercase tracking-widest text-white rounded-lg mt-1 hover:opacity-90 transition-opacity"
              style={{ background: "var(--signal)" }}>
              Ver calendário →
            </Link>
          </div>
        </div>

        {/* Próximos posts */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="text-[13px] font-semibold text-white">Próximos posts</div>
          </div>
          <div className="p-4 space-y-2">
            {scheduledPosts.length === 0 ? (
              <p className="text-center text-sm text-stone py-6">Nenhum post agendado ainda</p>
            ) : scheduledPosts.slice(0, 4).map((post) => (
              <div key={post.id} className="flex items-center gap-3.5 px-4 py-3.5 rounded-lg"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
                  style={{ background: "rgba(16,185,129,0.12)" }}>
                  📅
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-white truncate">
                    {post.caption.split("\n")[0].replace(/[*#]/g, "")}
                  </div>
                  <div className="text-[11px] text-stone mt-0.5">
                    {post.scheduled_for
                      ? new Date(post.scheduled_for).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" })
                      : "—"}
                  </div>
                </div>
                <span className="text-[9px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.13)", color: "var(--green)" }}>
                  Agendado
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/login")

  if (profile.role === "admin" || profile.role === "manager") {
    return <AdminDashboard userId={profile.id} />
  }

  return <ClientDashboard userId={profile.id} />
}
