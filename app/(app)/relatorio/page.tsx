import { Eye, TrendingUp, UserPlus, FileText, Sparkles, Download, Send } from "lucide-react"
import { mockReport, mockClients } from "@/lib/mock-data"
import { formatDate } from "@/lib/utils"

function MetricCard({ label, value, unit, icon: Icon, color, bar }: {
  label: string
  value: number
  unit?: string
  icon: typeof Eye
  color: string
  bar: string
}) {
  return (
    <div className="relative overflow-hidden rounded-xl px-5 py-5"
      style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: bar }} />
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg" style={{ background: `${bar}22` }}>
          <Icon size={13} style={{ color: bar }} />
        </div>
        <span className="text-[11px] uppercase tracking-wide text-stone">{label}</span>
      </div>
      <div className="font-bebas text-[44px] leading-none text-white">
        {value.toLocaleString("pt-BR")}
        {unit && <span className="text-[24px] text-stone ml-1">{unit}</span>}
      </div>
    </div>
  )
}

export default function RelatorioPage() {
  const r = mockReport
  const m = r.metrics
  const client = mockClients.find((c) => c.id === r.client_id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Relatório Semanal</h1>
          <p className="text-[13px] text-stone">
            {client?.name} · Semana {r.week_reference} · {formatDate(r.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-semibold text-white transition-colors"
            style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
            <Download size={13} />
            PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-bold text-white"
            style={{ background: "var(--signal)" }}>
            <Send size={13} />
            Enviar ao Cliente
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Alcance" value={m.reach} icon={Eye} color="text-blue" bar="#6366F1" />
        <MetricCard label="Impressões" value={m.impressions} icon={TrendingUp} color="text-signal" bar="#D64045" />
        <MetricCard label="Engajamento" value={m.engagement_rate} unit="%" icon={TrendingUp} color="text-green" bar="#10B981" />
        <MetricCard label="Novos Seguidores" value={m.new_followers} icon={UserPlus} color="text-amber" bar="#F59E0B" />
        <MetricCard label="Posts Publicados" value={m.posts_published} icon={FileText} color="text-stone" bar="#8A8582" />
      </div>

      {/* Top post */}
      <div className="rounded-xl p-5" style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
        <div className="text-[13px] font-semibold text-white mb-3">Post de Maior Desempenho</div>
        <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: "rgba(16,185,129,0.12)" }}>
            📸
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-white mb-0.5">Post de bastidores de produção</div>
            <div className="text-[12px] text-stone">2× mais engajamento que a média histórica</div>
            {m.top_post_url && (
              <a href={m.top_post_url} target="_blank" rel="noopener noreferrer"
                className="text-[12px] mt-1 inline-block hover:underline"
                style={{ color: "var(--signal)" }}>
                Ver no Instagram →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="flex items-start gap-4 p-5 rounded-xl"
        style={{ background: "rgba(214,64,69,0.08)", border: "1px solid rgba(214,64,69,0.22)" }}>
        <div className="p-2.5 rounded-lg flex-shrink-0" style={{ background: "rgba(214,64,69,0.15)" }}>
          <Sparkles size={15} style={{ color: "var(--signal)" }} />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white mb-2">Análise da IA</div>
          <p className="text-[13px] leading-relaxed" style={{ color: "rgba(240,235,227,0.8)" }}>{r.ai_insights}</p>
        </div>
      </div>

      {/* Benchmark */}
      <div className="rounded-xl p-5" style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
        <div className="text-[13px] font-semibold text-white mb-4">Comparativo com Benchmarks</div>
        <div className="space-y-5">
          {[
            { label: "Taxa de Engajamento", yours: m.engagement_rate, benchmark: 3.5, unit: "%" },
            { label: "Alcance / Post", yours: Math.round(m.reach / m.posts_published), benchmark: 1200, unit: "" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-[12px] text-stone mb-2">
                <span>{item.label}</span>
                <span>
                  Você: <strong className="text-white">{item.yours}{item.unit}</strong>
                  {" · "}Média: {item.benchmark}{item.unit}
                </span>
              </div>
              <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "var(--ink-3)" }}>
                <div className="absolute left-0 top-0 h-full rounded-full" style={{
                  width: `${Math.min((item.benchmark / Math.max(item.yours, item.benchmark)) * 100, 100)}%`,
                  background: "rgba(99,102,241,0.4)",
                }} />
                <div className="absolute left-0 top-0 h-full rounded-full" style={{
                  width: `${Math.min((item.yours / Math.max(item.yours, item.benchmark)) * 100, 100)}%`,
                  background: "#10B981",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
