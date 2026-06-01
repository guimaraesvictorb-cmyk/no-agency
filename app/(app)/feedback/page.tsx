import { TrendingUp, Star, Meh, Frown, MessageSquare } from "lucide-react"
import Card from "@/components/ui/Card"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import { mockNpsResponses, mockClients } from "@/lib/mock-data"
import { calcNpsScore, formatDate } from "@/lib/utils"
import type { NpsCategory } from "@/lib/types"

function NpsGauge({ score }: { score: number }) {
  const angle = ((score + 100) / 200) * 180 - 90
  const color = score >= 50 ? "#2ECC71" : score >= 0 ? "#F39C12" : "#D64045"
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-20 overflow-hidden">
        <div className="absolute inset-0 rounded-t-full bg-ink-3 border border-border" style={{ borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }} />
        <div
          className="absolute bottom-0 left-1/2 w-1 h-16 origin-bottom rounded-full transition-transform duration-700"
          style={{ background: color, transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-ink-2 border-2 border-stone" />
      </div>
      <div className="text-3xl font-bold mt-2" style={{ color }}>{score}</div>
      <div className="text-xs text-stone mt-0.5">NPS Score</div>
    </div>
  )
}

const CATEGORY_CONFIG: Record<NpsCategory, { label: string; color: string; icon: typeof Star; range: string }> = {
  promoter: { label: "Promotores", color: "text-green", icon: Star, range: "9-10" },
  passive: { label: "Neutros", color: "text-amber", icon: Meh, range: "7-8" },
  detractor: { label: "Detratores", color: "text-signal", icon: Frown, range: "0-6" },
}

export default function FeedbackPage() {
  const scores = mockNpsResponses.map((r) => r.score)
  const npsScore = calcNpsScore(scores)
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length

  const promoters = mockNpsResponses.filter((r) => r.category === "promoter")
  const passives = mockNpsResponses.filter((r) => r.category === "passive")
  const detractors = mockNpsResponses.filter((r) => r.category === "detractor")

  const clientMap = Object.fromEntries(mockClients.map((c) => [c.id, c.name]))

  const total = mockNpsResponses.length

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 flex flex-col items-center justify-center py-6">
          <NpsGauge score={npsScore} />
        </Card>

        <Card className="md:col-span-2">
          <h3 className="text-sm font-semibold text-cream mb-4">Distribuição de Respostas</h3>
          <div className="space-y-3">
            {(["promoter", "passive", "detractor"] as NpsCategory[]).map((cat) => {
              const config = CATEGORY_CONFIG[cat]
              const count = cat === "promoter" ? promoters.length : cat === "passive" ? passives.length : detractors.length
              const pct = total ? (count / total) * 100 : 0
              const Icon = config.icon
              return (
                <div key={cat} className="flex items-center gap-3">
                  <Icon size={14} className={config.color} />
                  <div className="w-24 text-xs text-stone">{config.label}</div>
                  <div className="flex-1 bg-ink-3 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: cat === "promoter" ? "var(--green)" : cat === "passive" ? "var(--amber)" : "var(--signal)",
                      }}
                    />
                  </div>
                  <div className="text-xs text-cream w-8 text-right">{count}</div>
                  <div className="text-xs text-stone w-12 text-right">{pct.toFixed(0)}%</div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-6 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-xl font-semibold text-cream">{avg.toFixed(1)}</div>
              <div className="text-xs text-stone">Média</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-cream">{total}</div>
              <div className="text-xs text-stone">Respostas</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-green">{((promoters.length / total) * 100).toFixed(0)}%</div>
              <div className="text-xs text-stone">Promotores</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Responses list */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={16} className="text-signal" />
          <h3 className="text-sm font-semibold text-cream">Todas as Respostas</h3>
        </div>
        <div className="space-y-3">
          {mockNpsResponses.map((nps) => {
            const config = CATEGORY_CONFIG[nps.category]
            return (
              <div key={nps.id} className="flex items-start gap-3 p-3 bg-ink-3 rounded-xl border border-border">
                <div className={`text-sm font-bold w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-ink-4 ${config.color}`}>
                  {nps.score}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar name={clientMap[nps.client_id] ?? "?"} size="sm" />
                    <span className="text-sm font-medium text-cream">{clientMap[nps.client_id]}</span>
                    <Badge variant={nps.category === "promoter" ? "success" : nps.category === "passive" ? "warning" : "error"}>
                      {config.label.replace("s", "")}
                    </Badge>
                    <span className="text-xs text-stone ml-auto">{formatDate(nps.created_at)}</span>
                  </div>
                  {nps.comment && (
                    <p className="text-sm text-cream/70 italic">"{nps.comment}"</p>
                  )}
                  <div className="text-xs text-stone/60 mt-1">
                    Gatilho: {nps.trigger === "monthly" ? "Mensal" : nps.trigger === "onboarding" ? "Onboarding" : "Pós-aprovação"}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
