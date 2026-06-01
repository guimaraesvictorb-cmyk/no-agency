import { BarChart3, Eye, TrendingUp, UserPlus, FileText, Sparkles, Download, Send } from "lucide-react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { mockReport, mockClients } from "@/lib/mock-data"
import { formatDate } from "@/lib/utils"

function MetricCard({ label, value, unit, icon: Icon, color }: {
  label: string
  value: number
  unit?: string
  icon: typeof BarChart3
  color: string
}) {
  return (
    <div className="bg-ink-3 border border-border rounded-xl p-4">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${color}`}>
        <Icon size={16} />
      </div>
      <div className="text-2xl font-semibold text-cream">
        {value.toLocaleString("pt-BR")}{unit && <span className="text-base text-stone ml-1">{unit}</span>}
      </div>
      <div className="text-xs text-stone mt-0.5">{label}</div>
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
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={18} className="text-signal" />
            <h2 className="text-lg font-semibold text-cream">Relatório Semanal</h2>
          </div>
          <p className="text-sm text-stone">
            {client?.name} · Semana {r.week_reference} · {formatDate(r.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Download size={14} />
            PDF
          </Button>
          <Button size="sm">
            <Send size={14} />
            Enviar ao Cliente
          </Button>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard label="Alcance" value={m.reach} icon={Eye} color="bg-blue/15 text-blue" />
        <MetricCard label="Impressões" value={m.impressions} icon={BarChart3} color="bg-signal/15 text-signal" />
        <MetricCard label="Taxa de Engajamento" value={m.engagement_rate} unit="%" icon={TrendingUp} color="bg-green/15 text-green" />
        <MetricCard label="Novos Seguidores" value={m.new_followers} icon={UserPlus} color="bg-amber/15 text-amber" />
        <MetricCard label="Posts Publicados" value={m.posts_published} icon={FileText} color="bg-ink-4 text-stone" />
      </div>

      {/* Top post */}
      <Card>
        <h3 className="text-sm font-semibold text-cream mb-3">Post de Maior Desempenho</h3>
        <div className="flex items-center gap-4 p-3 bg-ink-3 rounded-xl border border-border">
          <div className="w-16 h-16 bg-ink-4 rounded-lg overflow-hidden flex-shrink-0">
            <div className="w-full h-full flex items-center justify-center text-stone text-xl">📸</div>
          </div>
          <div>
            <div className="text-sm text-cream font-medium">Post de bastidores de produção</div>
            <div className="text-xs text-stone mt-0.5">2× mais engajamento que a média histórica</div>
            {m.top_post_url && (
              <a href={m.top_post_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-signal hover:underline mt-1 block">
                Ver no Instagram →
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* AI Insights */}
      <Card className="border-signal/20 bg-signal/5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-signal/15 rounded-lg flex-shrink-0">
            <Sparkles size={16} className="text-signal" />
          </div>
          <div>
            <div className="text-sm font-semibold text-cream mb-2">Análise da IA</div>
            <p className="text-sm text-cream/80 leading-relaxed">{r.ai_insights}</p>
          </div>
        </div>
      </Card>

      {/* Benchmark comparison */}
      <Card>
        <h3 className="text-sm font-semibold text-cream mb-4">Comparativo com Benchmarks</h3>
        <div className="space-y-4">
          {[
            { label: "Taxa de Engajamento", yours: m.engagement_rate, benchmark: 3.5, unit: "%" },
            { label: "Alcance / Post", yours: Math.round(m.reach / m.posts_published), benchmark: 1200, unit: "" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs text-stone mb-1.5">
                <span>{item.label}</span>
                <span>Você: <strong className="text-cream">{item.yours}{item.unit}</strong> · Média: {item.benchmark}{item.unit}</span>
              </div>
              <div className="relative h-2 bg-ink-3 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-blue/40 rounded-full"
                  style={{ width: `${Math.min((item.benchmark / Math.max(item.yours, item.benchmark)) * 100, 100)}%` }} />
                <div className="absolute left-0 top-0 h-full bg-green rounded-full"
                  style={{ width: `${Math.min((item.yours / Math.max(item.yours, item.benchmark)) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
