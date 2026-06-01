import Link from "next/link"
import { mockDashboardStats, mockPosts, mockClients, mockNpsResponses } from "@/lib/mock-data"
import { formatRelativeTime } from "@/lib/utils"

const PIPELINE_STEPS = [
  { label: "DNA Brief", icon: "✓", done: true },
  { label: "Mídias", icon: "✓", done: true },
  { label: "Calendário", icon: "✓", done: true },
  { label: "Gerado", icon: "✓", done: true },
  { label: "Aprovação", icon: "⏳", active: true },
  { label: "Agendado", icon: "📲" },
  { label: "Publicado", icon: "🚀" },
]

function PipelineBar() {
  return (
    <div className="flex mb-6">
      {PIPELINE_STEPS.map((step, i) => (
        <div
          key={step.label}
          className={`flex-1 text-center py-3.5 px-2 text-[10px] font-semibold uppercase tracking-wide transition-all
            ${i === 0 ? "rounded-l-lg" : ""}
            ${i === PIPELINE_STEPS.length - 1 ? "rounded-r-lg" : ""}
            ${step.done
              ? "border border-green/25 text-green"
              : step.active
              ? "text-white border border-signal/35"
              : "text-stone border border-white/5"
            }`}
          style={step.done
            ? { background: "rgba(16,185,129,0.08)" }
            : step.active
            ? { background: "rgba(214,64,69,0.14)" }
            : { background: "var(--ink-2)" }
          }
        >
          <div className="text-base mb-1">{step.icon}</div>
          {step.label}
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, accent }: {
  label: string
  value: string
  sub: string
  accent: "red" | "green" | "amber" | "blue"
}) {
  const colors = {
    red: { bar: "var(--signal)", delta: "var(--signal)" },
    green: { bar: "var(--green)", delta: "var(--green)" },
    amber: { bar: "var(--amber)", delta: "var(--amber)" },
    blue: { bar: "var(--blue)", delta: "var(--blue)" },
  }
  const c = colors[accent]
  return (
    <div className="relative overflow-hidden rounded-xl px-5 py-5"
      style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: c.bar }} />
      <div className="text-[11px] text-stone uppercase tracking-wide mb-2">{label}</div>
      <div className="font-bebas text-[40px] leading-none text-white mb-1">{value}</div>
      <div className="text-[11px] flex items-center gap-1" style={{ color: c.delta }}>↑ {sub}</div>
    </div>
  )
}

export default function DashboardPage() {
  const stats = mockDashboardStats
  const pendingPosts = mockPosts.filter((p) => p.status === "sent_for_approval")
  const scheduledPosts = mockPosts.filter((p) => p.status === "approved" || p.status === "scheduled")
  const clientMap = Object.fromEntries(mockClients.map((c) => [c.id, c.name]))

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Bom dia, Victor 👋</h1>
        <p className="text-[13px] text-stone">
          Semana de 01 a 07 de Junho · Plano Growth · Instagram + Facebook
        </p>
      </div>

      {/* Pipeline */}
      <PipelineBar />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Posts este mês" value={`${stats.posts_published_month}/20`} sub="2 publicados hoje" accent="red" />
        <StatCard label="Clientes ativos" value={String(stats.active_clients)} sub="100% ativos" accent="green" />
        <StatCard label="Aguardando aprovação" value={String(stats.pending_approvals)} sub="Prazo: 5 dias" accent="amber" />
        <StatCard label="NPS do mês" value={`${stats.avg_nps}/10`} sub="Promotor" accent="blue" />
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Posts para aprovar */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <div className="text-[13px] font-semibold text-white flex items-center gap-2">
                Posts para aprovar
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(245,158,11,0.15)", color: "var(--amber)" }}>
                  {pendingPosts.length} pendentes
                </span>
              </div>
              <div className="text-[12px] text-stone mt-0.5">Auto-aprovação em 5 dias sem resposta</div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {pendingPosts.length === 0 ? (
              <p className="text-center text-sm text-stone py-6">Nenhuma aprovação pendente 🎉</p>
            ) : pendingPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-3.5 px-4 py-3.5 rounded-lg"
                style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
                <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-xl"
                  style={{ background: "rgba(214,64,69,0.12)" }}>
                  🏗️
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white truncate">{post.caption.split("\n")[0].replace(/[*#]/g, "")}</div>
                  <div className="text-[11px] text-stone mt-0.5">{clientMap[post.client_id]} · Feed · {post.platform === "instagram_facebook" ? "IG + FB" : post.platform}</div>
                </div>
                <span className="text-[9px] font-semibold px-2 py-1 rounded-full flex-shrink-0 flex items-center gap-1"
                  style={{ background: "rgba(245,158,11,0.13)", color: "var(--amber)" }}>
                  <span className="w-1 h-1 rounded-full bg-current" />
                  Pendente
                </span>
              </div>
            ))}
            <Link href="/calendario" className="block w-full py-3 text-center text-[12px] font-bold uppercase tracking-widest text-white rounded-lg transition-opacity hover:opacity-90 mt-1"
              style={{ background: "var(--signal)" }}>
              Ver e aprovar posts →
            </Link>
          </div>
        </div>

        {/* Próximos posts */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <div className="text-[13px] font-semibold text-white">Próximos posts agendados</div>
              <div className="text-[12px] text-stone mt-0.5">Semana de 01–07 de Junho</div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {scheduledPosts.length === 0 ? (
              <p className="text-center text-sm text-stone py-6">Nenhum post agendado ainda</p>
            ) : scheduledPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-3.5 px-4 py-3.5 rounded-lg"
                style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
                <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-xl"
                  style={{ background: "rgba(16,185,129,0.12)" }}>
                  ✅
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white truncate">{post.caption.split("\n")[0].replace(/[*#]/g, "")}</div>
                  <div className="text-[11px] text-stone mt-0.5">
                    {clientMap[post.client_id]} · {post.scheduled_for ? new Date(post.scheduled_for).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—"}
                  </div>
                </div>
                <span className="text-[9px] font-semibold px-2 py-1 rounded-full flex-shrink-0 flex items-center gap-1"
                  style={{ background: "rgba(16,185,129,0.13)", color: "var(--green)" }}>
                  <span className="w-1 h-1 rounded-full bg-current" />
                  {post.status === "approved" ? "Aprovado" : "Agendado"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NPS recent */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="text-[13px] font-semibold text-white">Feedbacks recentes</div>
        </div>
        <div className="p-4 space-y-3">
          {mockNpsResponses.slice(0, 3).map((nps) => (
            <div key={nps.id} className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className={`w-[38px] h-[38px] rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0 ${
                nps.category === "promoter" ? "text-green" : nps.category === "passive" ? "text-amber" : "text-signal"
              }`}
                style={{ background: nps.category === "promoter" ? "rgba(16,185,129,0.18)" : nps.category === "passive" ? "rgba(245,158,11,0.18)" : "rgba(214,64,69,0.18)" }}>
                {nps.score}
              </div>
              <div className="flex-1">
                <div className="text-[12px] font-semibold text-white">{clientMap[nps.client_id]}</div>
                {nps.comment && <div className="text-[11px] text-stone mt-0.5">"{nps.comment}"</div>}
              </div>
              <div className="text-[11px] text-stone/60">{formatRelativeTime(nps.created_at)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
