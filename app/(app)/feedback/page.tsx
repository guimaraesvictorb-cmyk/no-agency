import { Star, Meh, Frown, MessageSquare } from "lucide-react"
import { mockNpsResponses, mockClients } from "@/lib/mock-data"
import { calcNpsScore, formatDate } from "@/lib/utils"
import type { NpsCategory } from "@/lib/types"

const CATEGORY: Record<NpsCategory, { label: string; color: string; bg: string; icon: typeof Star; range: string }> = {
  promoter:  { label: "Promotores",  color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: Star,  range: "9-10" },
  passive:   { label: "Neutros",     color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: Meh,   range: "7-8" },
  detractor: { label: "Detratores",  color: "#D64045", bg: "rgba(214,64,69,0.12)",   icon: Frown, range: "0-6" },
}

function NpsGauge({ score }: { score: number }) {
  const pct = Math.min(Math.max((score + 100) / 200, 0), 1)
  const color = score >= 50 ? "#10B981" : score >= 0 ? "#F59E0B" : "#D64045"
  const label = score >= 50 ? "Zona de Excelência" : score >= 0 ? "Zona de Qualidade" : "Zona Crítica"
  return (
    <div className="flex flex-col items-center py-2">
      <div className="text-[11px] uppercase tracking-widest text-stone mb-3">NPS Score</div>
      <div className="font-bebas text-[80px] leading-none" style={{ color }}>{score}</div>
      <div className="text-[12px] font-semibold mt-1" style={{ color }}>{label}</div>
      <div className="w-full mt-4 h-2 rounded-full overflow-hidden" style={{ background: "var(--ink-3)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct * 100}%`, background: color }} />
      </div>
      <div className="flex justify-between w-full text-[10px] text-stone mt-1">
        <span>-100</span><span>0</span><span>+100</span>
      </div>
    </div>
  )
}

export default function FeedbackPage() {
  const scores = mockNpsResponses.map((r) => r.score)
  const npsScore = calcNpsScore(scores)
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length

  const byCategory = {
    promoter:  mockNpsResponses.filter((r) => r.category === "promoter"),
    passive:   mockNpsResponses.filter((r) => r.category === "passive"),
    detractor: mockNpsResponses.filter((r) => r.category === "detractor"),
  }
  const total = mockNpsResponses.length
  const clientMap = Object.fromEntries(mockClients.map((c) => [c.id, c.name]))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Feedback & NPS</h1>
        <p className="text-[13px] text-stone">Satisfação dos seus clientes com o serviço No Agency</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* NPS Gauge */}
        <div className="rounded-xl p-5" style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <NpsGauge score={npsScore} />
        </div>

        {/* Distribution */}
        <div className="md:col-span-2 rounded-xl p-5 space-y-4" style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="text-[13px] font-semibold text-white">Distribuição de Respostas</div>
          <div className="space-y-3">
            {(["promoter","passive","detractor"] as NpsCategory[]).map((cat) => {
              const cfg = CATEGORY[cat]
              const count = byCategory[cat].length
              const pct = total ? (count / total) * 100 : 0
              const Icon = cfg.icon
              return (
                <div key={cat} className="flex items-center gap-3">
                  <Icon size={13} style={{ color: cfg.color }} />
                  <div className="w-24 text-[12px] text-stone">{cfg.label}</div>
                  <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: "var(--ink-3)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: cfg.color }} />
                  </div>
                  <div className="text-[12px] text-white w-5 text-right">{count}</div>
                  <div className="text-[11px] text-stone w-10 text-right">{pct.toFixed(0)}%</div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <div>
              <div className="font-bebas text-[32px] leading-none text-white">{avg.toFixed(1)}</div>
              <div className="text-[11px] text-stone">Média</div>
            </div>
            <div>
              <div className="font-bebas text-[32px] leading-none text-white">{total}</div>
              <div className="text-[11px] text-stone">Respostas</div>
            </div>
            <div>
              <div className="font-bebas text-[32px] leading-none" style={{ color: "#10B981" }}>
                {((byCategory.promoter.length / total) * 100).toFixed(0)}%
              </div>
              <div className="text-[11px] text-stone">Promotores</div>
            </div>
          </div>
        </div>
      </div>

      {/* Responses list */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
        <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
          <MessageSquare size={15} style={{ color: "var(--signal)" }} />
          <div className="text-[13px] font-semibold text-white">Todas as Respostas</div>
        </div>
        <div className="p-4 space-y-2">
          {mockNpsResponses.map((nps) => {
            const cfg = CATEGORY[nps.category]
            return (
              <div key={nps.id} className="flex items-start gap-3.5 px-4 py-3.5 rounded-lg"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[15px] flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {nps.score}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-white">{clientMap[nps.client_id]}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label.replace(/s$/, "")}
                    </span>
                  </div>
                  {nps.comment && (
                    <p className="text-[12px] text-stone italic">"{nps.comment}"</p>
                  )}
                  <div className="text-[10px] text-stone/50 mt-1">
                    {nps.trigger === "monthly" ? "Pesquisa mensal" : nps.trigger === "onboarding" ? "Onboarding" : "Pós-aprovação"}
                  </div>
                </div>
                <div className="text-[11px] text-stone/50 flex-shrink-0">{formatDate(nps.created_at)}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
