"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, Clock, CheckCircle, Star, Download } from "lucide-react"

type Period = "semana" | "mes" | "3meses" | "6meses"

interface Metrics {
  published: number
  scheduled: number
  pending: number
  total: number
  avg_nps: number | null
  nps_count: number
}

function getPeriodDates(p: Period): { from: string; to: string; label: string } {
  const now = new Date()
  const to = now.toISOString().split("T")[0]

  const map: Record<Period, { days: number; label: string }> = {
    semana:  { days: 7,   label: "Últimos 7 dias"   },
    mes:     { days: 30,  label: "Último mês"        },
    "3meses":{ days: 90,  label: "Últimos 3 meses"   },
    "6meses":{ days: 180, label: "Últimos 6 meses"   },
  }

  const { days, label } = map[p]
  const fromDate = new Date(now)
  fromDate.setDate(fromDate.getDate() - days)
  return { from: fromDate.toISOString().split("T")[0], to, label }
}

function StatCard({
  label, value, icon: Icon, bar, sub,
}: {
  label: string; value: string; icon: typeof FileText; bar: string; sub?: string
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
      <div className="font-bebas text-[44px] leading-none text-white">{value}</div>
      {sub && <div className="text-[11px] text-stone mt-1">{sub}</div>}
    </div>
  )
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "semana",  label: "7 dias"   },
  { key: "mes",     label: "1 mês"    },
  { key: "3meses",  label: "3 meses"  },
  { key: "6meses",  label: "6 meses"  },
]

export default function RelatorioCliente({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [period, setPeriod] = useState<Period>("mes")
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (p: Period) => {
    setLoading(true)
    const { from, to } = getPeriodDates(p)
    try {
      const res = await fetch(`/api/relatorio?client_id=${clientId}&from=${from}&to=${to}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.metrics) setMetrics(data.metrics)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => { load(period) }, [period, load])

  const { label } = getPeriodDates(period)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Relatório</h1>
          <p className="text-[13px] text-stone">{clientName} · {label}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-semibold text-white hover:opacity-80 transition-opacity"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}
        >
          <Download size={13} />
          PDF
        </button>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-all"
            style={period === p.key
              ? { background: "var(--signal)", color: "white" }
              : { background: "var(--ink-2)", border: "1px solid var(--border)", color: "var(--stone)" }
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Metrics */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[110px] rounded-xl animate-pulse"
              style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }} />
          ))}
        </div>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Publicados"  value={String(metrics.published)} icon={CheckCircle} bar="#10B981" sub="no período" />
            <StatCard label="Agendados"   value={String(metrics.scheduled)} icon={Clock}        bar="#6366F1" sub="próximos"   />
            <StatCard label="Pendentes"   value={String(metrics.pending)}   icon={FileText}     bar="#F59E0B" sub="sua aprovação" />
            <StatCard
              label="NPS médio"
              value={metrics.avg_nps != null ? `${metrics.avg_nps}/10` : "—"}
              icon={Star}
              bar="#D64045"
              sub={metrics.nps_count > 0 ? `${metrics.nps_count} avaliações` : "sem avaliações"}
            />
          </div>

          {/* Summary card */}
          {metrics.total > 0 ? (
            <div className="rounded-xl p-5"
              style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
              <div className="text-[13px] font-semibold text-white mb-3">Resumo do período</div>
              <div className="space-y-3">
                {[
                  { label: "Publicados",   value: metrics.published, total: metrics.total, color: "#10B981" },
                  { label: "Agendados",    value: metrics.scheduled, total: metrics.total, color: "#6366F1" },
                  { label: "Pendentes",    value: metrics.pending,   total: metrics.total, color: "#F59E0B" },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span className="text-stone">{row.label}</span>
                      <span className="text-white font-semibold">{row.value} <span className="text-stone font-normal">de {row.total}</span></span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--ink-3)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${row.total > 0 ? (row.value / row.total) * 100 : 0}%`, background: row.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="text-4xl">📊</div>
              <p className="text-[14px] font-semibold text-white">Nenhum post encontrado nesse período</p>
              <p className="text-[13px] text-stone">Os dados vão aparecer aqui assim que os primeiros posts forem criados.</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
