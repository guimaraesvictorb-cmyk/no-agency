import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"

// ─── Brief score ──────────────────────────────────────────────────────────────

function calcBriefScore(brief: Record<string, unknown> | null): number {
  if (!brief) return 0
  const checks: [string, number, "string" | "array"][] = [
    ["company_name", 8, "string"],
    ["segment", 8, "string"],
    ["city", 5, "string"],
    ["differentials", 12, "string"],
    ["ideal_client_age", 5, "string"],
    ["ideal_client_gender", 5, "string"],
    ["ideal_client_pain", 12, "string"],
    ["ideal_client_dream", 12, "string"],
    ["tone_avoid", 8, "string"],
    ["tone_example", 8, "string"],
    ["ai_notes", 2, "string"],
    ["tone_adjectives", 8, "array"],
    ["content_themes", 7, "array"],
  ]
  let score = 0
  for (const [field, pts, type] of checks) {
    const val = brief[field]
    if (type === "string" && typeof val === "string" && val.trim().length > 2) score += pts
    if (type === "array" && Array.isArray(val) && val.length > 0) score += pts
  }
  return Math.min(score, 100)
}

function BriefScoreCard({ score }: { score: number }) {
  const color = score >= 70 ? "var(--green)" : score >= 40 ? "var(--amber)" : "var(--signal)"
  const label = score >= 70 ? "Ótimo" : score >= 40 ? "Incompleto" : "Fraco"
  const tip = score < 40
    ? "Preencha Minha História para melhorar a qualidade dos posts gerados."
    : score < 70
    ? "Continue preenchendo os campos para posts ainda melhores."
    : "Seu briefing está excelente! A IA tem tudo que precisa."

  const circumference = 2 * Math.PI * 28
  const dashoffset = circumference * (1 - score / 100)

  return (
    <div className="relative overflow-hidden rounded-xl px-5 py-5"
      style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color }} />
      <div className="text-[11px] uppercase tracking-wide mb-3" style={{ color: "var(--stone)" }}>Nota do Briefing</div>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--ink-3)" strokeWidth="6" />
            <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="6"
              strokeDasharray={circumference} strokeDashoffset={dashoffset}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bebas text-[20px] leading-none" style={{ color }}>{score}</span>
          </div>
        </div>
        <div>
          <div className="font-semibold text-[14px] mb-1" style={{ color: "var(--cream)" }}>
            {label}
          </div>
          <div className="text-[11px] leading-snug" style={{ color: "var(--stone)" }}>{tip}</div>
          {score < 100 && (
            <Link href="/historia"
              className="inline-block mt-2 text-[11px] font-bold"
              style={{ color: "var(--signal)" }}>
              Completar agora →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function UpsellBlock({ plan }: { plan: string }) {
  const isStarter = !plan || plan === "starter"
  const isGrowth = plan === "growth"
  if (!isStarter && !isGrowth) return null

  const items = [
    isStarter && {
      icon: "⚡",
      title: "Upgrade para Growth",
      desc: "LinkedIn, relatórios avançados e mais redes sociais.",
      cta: "Ver planos",
    },
    {
      icon: "📘",
      title: "Branding Book",
      desc: "Manual da sua marca com paleta, tipografia e voz. Incluso no Pro.",
      cta: "Saber mais",
    },
    {
      icon: "🌐",
      title: "Landing Page",
      desc: "Página de apresentação profissional integrada ao seu perfil.",
      cta: "Ver exemplo",
    },
  ].filter(Boolean) as { icon: string; title: string; desc: string; cta: string }[]

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
      <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "var(--signal)" }}>NOVO</span>
        <div className="text-[13px] font-semibold" style={{ color: "var(--cream)" }}>Expanda sua presença</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-x" style={{ borderColor: "var(--border)" }}>
        {items.map((item) => (
          <div key={item.title} className="px-5 py-4">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--cream)" }}>{item.title}</div>
            <div className="text-[11px] mb-3 leading-snug" style={{ color: "var(--stone)" }}>{item.desc}</div>
            <button className="text-[11px] font-bold" style={{ color: "var(--signal)" }}>
              {item.cta} →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Shared components ────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: {
  label: string; value: string; sub: string; accent: "red" | "green" | "amber" | "blue"
}) {
  const bar = { red: "var(--signal)", green: "var(--green)", amber: "var(--amber)", blue: "var(--blue)" }[accent]
  return (
    <div className="relative overflow-hidden rounded-xl px-5 py-5"
      style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: bar }} />
      <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: "var(--stone)" }}>{label}</div>
      <div className="font-bebas text-[40px] leading-none mb-1" style={{ color: "var(--cream)" }}>{value}</div>
      <div className="text-[11px]" style={{ color: bar }}>↑ {sub}</div>
    </div>
  )
}

// ─── Admin plan badges ────────────────────────────────────────────────────────

const PLAN_STYLES: Record<string, { bg: string; color: string }> = {
  starter: { bg: "rgba(122,119,115,0.12)", color: "#7A7773" },
  growth:  { bg: "rgba(99,102,241,0.12)",  color: "#6366F1" },
  pro:     { bg: "rgba(214,64,69,0.12)",   color: "var(--signal)" },
}

function PlanBadge({ plan }: { plan: string }) {
  const s = PLAN_STYLES[plan?.toLowerCase()] ?? PLAN_STYLES.starter
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize"
      style={{ background: s.bg, color: s.color }}>
      {plan ?? "—"}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  const active = status === "active"
  return (
    <span className="flex items-center gap-1.5 text-[12px]"
      style={{ color: active ? "#10B981" : "var(--stone)" }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ background: active ? "#10B981" : "var(--stone)" }} />
      {active ? "Ativo" : "Inativo"}
    </span>
  )
}

// ─── Admin dashboard ──────────────────────────────────────────────────────────

async function AdminDashboard({ fullName }: { fullName: string }) {
  const supabase = await createClient()

  const [{ data: clients }, { data: posts }, { data: npsRows }] = await Promise.all([
    supabase.from("clients").select("id, name, status, plan").order("name", { ascending: true }),
    supabase.from("posts").select("id, status, caption, platform, client_id, scheduled_for, created_at").order("created_at", { ascending: false }),
    supabase.from("nps_responses").select("id, score, comment, client_id, created_at").order("created_at", { ascending: false }).limit(5),
  ])

  const activeClients  = (clients ?? []).filter((c) => c.status === "active").length
  const pendingPosts   = (posts ?? []).filter((p) => p.status === "sent_for_approval")
  const scheduledPosts = (posts ?? []).filter((p) => p.status === "approved" || p.status === "scheduled")

  const npsScores = (npsRows ?? []).map((n) => n.score)
  const avgNps = npsScores.length
    ? Math.round(npsScores.reduce((a, b) => a + b, 0) / npsScores.length * 10) / 10
    : 0

  const clientMap = Object.fromEntries((clients ?? []).map((c) => [c.id, c.name]))
  const pendingByClient = (clients ?? []).map((c) => ({
    ...c,
    pendingCount: pendingPosts.filter((p) => p.client_id === c.id).length,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bebas text-[40px] leading-none mb-1" style={{ color: "var(--cream)" }}>Bom dia, {fullName} 👋</h1>
        <p className="text-[13px]" style={{ color: "var(--stone)" }}>Administrador · No Agency</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Clientes ativos"    value={String(activeClients)}         sub="100% ativos"  accent="green" />
        <StatCard label="Aguard. aprovação"  value={String(pendingPosts.length)}   sub="prazo 5 dias" accent="amber" />
        <StatCard label="NPS médio"          value={avgNps ? `${avgNps}/10` : "—"} sub="este mês"     accent="blue"  />
      </div>

      {(clients ?? []).length > 0 && (
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="text-[13px] font-semibold" style={{ color: "var(--cream)" }}>Clientes</div>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--stone)" }}>{activeClients} de {(clients ?? []).length} ativos</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Cliente", "Plano", "Status", "Pendentes"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--stone)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingByClient.map((c, i) => (
                  <tr key={c.id} style={i < pendingByClient.length - 1 ? { borderBottom: "1px solid var(--border)" } : {}}>
                    <td className="px-5 py-3.5 text-[13px] font-semibold" style={{ color: "var(--cream)" }}>{c.name}</td>
                    <td className="px-5 py-3.5"><PlanBadge plan={c.plan} /></td>
                    <td className="px-5 py-3.5"><StatusDot status={c.status} /></td>
                    <td className="px-5 py-3.5 text-[13px]">
                      {c.pendingCount > 0
                        ? <span className="font-bold" style={{ color: "var(--amber)" }}>{c.pendingCount}</span>
                        : <span style={{ color: "var(--stone)" }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <div className="text-[13px] font-semibold flex items-center gap-2" style={{ color: "var(--cream)" }}>
                Posts para aprovar
                {pendingPosts.length > 0 && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(245,158,11,0.12)", color: "var(--amber)" }}>
                    {pendingPosts.length} pendentes
                  </span>
                )}
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: "var(--stone)" }}>Aguardando aprovação do cliente</div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {pendingPosts.length === 0 ? (
              <p className="text-center text-sm py-6" style={{ color: "var(--stone)" }}>Nenhuma aprovação pendente 🎉</p>
            ) : pendingPosts.slice(0, 4).map((post) => (
              <div key={post.id} className="flex items-center gap-3.5 px-4 py-3.5 rounded-lg"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
                  style={{ background: "rgba(245,158,11,0.10)" }}>
                  ⏳
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate" style={{ color: "var(--cream)" }}>
                    {(post.caption ?? "").split("\n")[0].replace(/[*#]/g, "")}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: "var(--stone)" }}>
                    {clientMap[post.client_id] ?? "—"} · {post.platform}
                  </div>
                </div>
                <span className="text-[9px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
                  style={{ background: "rgba(245,158,11,0.12)", color: "var(--amber)" }}>
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

        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="text-[13px] font-semibold" style={{ color: "var(--cream)" }}>Próximos posts agendados</div>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--stone)" }}>Em ordem de publicação</div>
          </div>
          <div className="p-4 space-y-2">
            {scheduledPosts.length === 0 ? (
              <p className="text-center text-sm py-6" style={{ color: "var(--stone)" }}>Nenhum post agendado</p>
            ) : scheduledPosts.slice(0, 4).map((post) => (
              <div key={post.id} className="flex items-center gap-3.5 px-4 py-3.5 rounded-lg"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
                  style={{ background: "rgba(16,185,129,0.10)" }}>
                  ✅
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate" style={{ color: "var(--cream)" }}>
                    {(post.caption ?? "").split("\n")[0].replace(/[*#]/g, "")}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: "var(--stone)" }}>
                    {clientMap[post.client_id] ?? "—"} ·{" "}
                    {post.scheduled_for
                      ? new Date(post.scheduled_for).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                      : "—"}
                  </div>
                </div>
                <span className="text-[9px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.12)", color: "var(--green)" }}>
                  Agendado
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {npsRows && npsRows.length > 0 && (
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="text-[13px] font-semibold" style={{ color: "var(--cream)" }}>Feedbacks recentes</div>
            <Link href="/feedback" className="text-[11px] text-signal hover:underline">Ver todos</Link>
          </div>
          <div className="p-4 space-y-3">
            {npsRows.map((nps) => {
              const cat = nps.score >= 9 ? "promoter" : nps.score >= 7 ? "passive" : "detractor"
              const clr = cat === "promoter" ? "var(--green)" : cat === "passive" ? "var(--amber)" : "var(--signal)"
              const bg  = cat === "promoter" ? "rgba(16,185,129,0.12)" : cat === "passive" ? "rgba(245,158,11,0.12)" : "rgba(214,64,69,0.12)"
              return (
                <div key={nps.id} className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0"
                    style={{ background: bg, color: clr }}>
                    {nps.score}
                  </div>
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold" style={{ color: "var(--cream)" }}>
                      {clientMap[nps.client_id] ?? "Cliente"}
                    </div>
                    {nps.comment && (
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--stone)" }}>"{nps.comment}"</div>
                    )}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--stone)" }}>
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
        <h1 className="font-bebas text-[36px] leading-none" style={{ color: "var(--cream)" }}>Sua conta está sendo configurada</h1>
        <p className="text-[14px] max-w-sm" style={{ color: "var(--stone)" }}>
          Em breve você terá acesso ao seu painel. Entre em contato com a No Agency para agilizar o processo.
        </p>
      </div>
    )
  }

  const [{ data: posts }, { data: brief }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, status, caption, platform, scheduled_for, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("dna_briefs")
      .select("*")
      .eq("client_id", client.id)
      .maybeSingle(),
  ])

  const pendingPosts   = (posts ?? []).filter((p) => p.status === "sent_for_approval")
  const scheduledPosts = (posts ?? []).filter((p) => p.status === "approved" || p.status === "scheduled")
  const publishedMonth = (posts ?? []).filter((p) => {
    if (p.status !== "published") return false
    const d = new Date(p.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const briefScore = calcBriefScore(brief as Record<string, unknown> | null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bebas text-[40px] leading-none mb-1" style={{ color: "var(--cream)" }}>
          Olá, {client.name} 👋
        </h1>
        <p className="text-[13px]" style={{ color: "var(--stone)" }}>Plano {client.plan} · Bem-vindo à No Agency</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Posts este mês"    value={String(publishedMonth)}         sub="publicados"    accent="red"   />
        <StatCard label="Aguard. aprovação" value={String(pendingPosts.length)}    sub="precisam de ok" accent="amber" />
        <StatCard label="Agendados"         value={String(scheduledPosts.length)}  sub="a publicar"    accent="green" />
      </div>

      {/* Briefing score + upsell */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BriefScoreCard score={briefScore} />
        <UpsellBlock plan={client.plan} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Posts para aprovar */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="text-[13px] font-semibold" style={{ color: "var(--cream)" }}>Posts para aprovar</div>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--stone)" }}>Sua aprovação é necessária antes da publicação</div>
          </div>
          <div className="p-4 space-y-2">
            {pendingPosts.length === 0 ? (
              <p className="text-center text-sm py-6" style={{ color: "var(--stone)" }}>Nenhuma aprovação pendente 🎉</p>
            ) : pendingPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="flex items-center gap-3.5 px-4 py-3.5 rounded-lg"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
                  style={{ background: "rgba(245,158,11,0.10)" }}>
                  ⏳
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate" style={{ color: "var(--cream)" }}>
                    {(post.caption ?? "").split("\n")[0].replace(/[*#]/g, "")}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: "var(--stone)" }}>{post.platform}</div>
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
            <div className="text-[13px] font-semibold" style={{ color: "var(--cream)" }}>Próximos posts</div>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--stone)" }}>Conteúdo aprovado e agendado</div>
          </div>
          <div className="p-4 space-y-2">
            {scheduledPosts.length === 0 ? (
              <p className="text-center text-sm py-6" style={{ color: "var(--stone)" }}>Nenhum post agendado ainda</p>
            ) : scheduledPosts.slice(0, 4).map((post) => (
              <div key={post.id} className="flex items-center gap-3.5 px-4 py-3.5 rounded-lg"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
                  style={{ background: "rgba(16,185,129,0.10)" }}>
                  📅
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate" style={{ color: "var(--cream)" }}>
                    {(post.caption ?? "").split("\n")[0].replace(/[*#]/g, "")}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: "var(--stone)" }}>
                    {post.scheduled_for
                      ? new Date(post.scheduled_for).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" })
                      : "—"}
                  </div>
                </div>
                <span className="text-[9px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.12)", color: "var(--green)" }}>
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
    const name = profile.full_name ?? profile.email.split("@")[0]
    return <AdminDashboard fullName={name} />
  }

  return <ClientDashboard userId={profile.id} />
}
