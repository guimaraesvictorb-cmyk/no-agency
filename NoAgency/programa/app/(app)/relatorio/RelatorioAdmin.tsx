"use client"

import { useState } from "react"
import { Eye, TrendingUp, UserPlus, FileText, Sparkles, Download, Send, CheckCircle, X } from "lucide-react"
import { mockReport, mockClients } from "@/lib/mock-data"
import { formatDate } from "@/lib/utils"

function MetricCard({ label, value, unit, icon: Icon, bar }: {
  label: string
  value: number
  unit?: string
  icon: typeof Eye
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

function SendModal({ client, onClose }: { client: string; onClose: () => void }) {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  async function handleSend() {
    setSending(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,10,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="rounded-2xl p-6 w-full max-w-sm"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(16,185,129,0.15)" }}>
              <CheckCircle size={28} style={{ color: "#10B981" }} />
            </div>
            <div className="font-bebas text-[32px] text-white leading-none mb-1">Enviado!</div>
            <p className="text-[13px] text-stone">Relatório enviado para {client} com sucesso.</p>
            <button onClick={onClose}
              className="mt-5 w-full py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest text-white"
              style={{ background: "var(--signal)" }}>
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-semibold text-white">Enviar Relatório</div>
              <button onClick={onClose} className="text-stone hover:text-white"><X size={16} /></button>
            </div>
            <p className="text-[13px] text-stone mb-4">
              O relatório semanal será enviado por e-mail para <strong className="text-white">{client}</strong>.
            </p>
            <div className="p-3 rounded-lg mb-5 text-[12px] text-stone"
              style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
              <div className="text-white font-semibold mb-1">Conteúdo incluído:</div>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Métricas da semana (alcance, impressões, engajamento)</li>
                <li>Post de maior desempenho</li>
                <li>Análise da IA e recomendações</li>
                <li>Comparativo com benchmarks do segmento</li>
              </ul>
            </div>
            <button onClick={handleSend} disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest text-white transition-all disabled:opacity-60"
              style={{ background: "var(--signal)" }}>
              {sending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</>
              ) : (
                <><Send size={13} /> Confirmar Envio</>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function RelatorioAdmin() {
  const r = mockReport
  const m = r.metrics
  const client = mockClients.find((c) => c.id === r.client_id)
  const [showSendModal, setShowSendModal] = useState(false)

  function handlePdf() {
    window.print()
  }

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
          <button onClick={handlePdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-semibold text-white transition-colors hover:opacity-80"
            style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
            <Download size={13} />
            PDF
          </button>
          <button onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: "var(--signal)" }}>
            <Send size={13} />
            Enviar ao Cliente
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Alcance" value={m.reach} icon={Eye} bar="#6366F1" />
        <MetricCard label="Impressões" value={m.impressions} icon={TrendingUp} bar="#D64045" />
        <MetricCard label="Engajamento" value={m.engagement_rate} unit="%" icon={TrendingUp} bar="#10B981" />
        <MetricCard label="Novos Seguidores" value={m.new_followers} icon={UserPlus} bar="#F59E0B" />
        <MetricCard label="Posts Publicados" value={m.posts_published} icon={FileText} bar="#8A8582" />
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
                <span>Você: <strong className="text-white">{item.yours}{item.unit}</strong>{" · "}Média: {item.benchmark}{item.unit}</span>
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

      {showSendModal && <SendModal client={client?.name ?? "Cliente"} onClose={() => setShowSendModal(false)} />}
    </div>
  )
}
