"use client"

import { useState } from "react"
import { Sparkles, Building2, Users, MessageCircle, Settings, Save, RefreshCw, CheckCircle, X } from "lucide-react"
import { mockDnaBrief } from "@/lib/mock-data"
import { DAYS_PT } from "@/lib/utils"

const GENERATED_PREVIEW = [
  "Construção de excelência: por que a SLR Engenharia é referência em SP 🏗️",
  "Bastidores de obra: veja como cada detalhe é pensado para durar décadas 🔧",
  "Da planta à realidade — o processo que garante a entrega no prazo ✅",
  "Engenharia de alto padrão não é custo, é investimento no futuro da sua empresa 💼",
  "5 perguntas que todo cliente deve fazer antes de contratar uma construtora 🏢",
]

function GenerateModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"loading" | "done">("loading")

  useState(() => {
    const t = setTimeout(() => setStep("done"), 2200)
    return () => clearTimeout(t)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,10,0.8)", backdropFilter: "blur(8px)" }}
      onClick={step === "done" ? onClose : undefined}>
      <div className="rounded-2xl p-6 w-full max-w-md"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}>
        {step === "loading" ? (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-signal/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-signal animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={20} style={{ color: "var(--signal)" }} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-[15px] font-semibold text-white mb-1">Gerando conteúdo...</div>
              <div className="text-[12px] text-stone">A IA está criando os posts com base no DNA da marca</div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} style={{ color: "#10B981" }} />
                <span className="text-[13px] font-semibold text-white">
                  {GENERATED_PREVIEW.length} posts gerados!
                </span>
              </div>
              <button onClick={onClose} className="text-stone hover:text-white"><X size={16} /></button>
            </div>
            <div className="space-y-2 mb-5">
              {GENERATED_PREVIEW.map((caption, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                  <span className="text-[11px] font-bold text-stone w-5 flex-shrink-0 mt-0.5">#{i + 1}</span>
                  <span className="text-[12px] text-white leading-snug">{caption}</span>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-stone mb-4">
              Os posts foram adicionados ao Calendário Editorial para revisão.
            </p>
            <button onClick={onClose}
              className="w-full py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest text-white"
              style={{ background: "var(--signal)" }}>
              Ver no Calendário →
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const BLOCKS = [
  { id: "empresa", label: "Empresa", icon: Building2, accent: "var(--signal)" },
  { id: "cliente", label: "Cliente Ideal", icon: Users, accent: "var(--blue)" },
  { id: "tom", label: "Tom de Voz", icon: MessageCircle, accent: "var(--green)" },
  { id: "operacional", label: "Operacional", icon: Settings, accent: "var(--amber)" },
]

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-stone mb-2">
      {children}
    </label>
  )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 text-[13px] text-white placeholder:text-stone/40 rounded-lg outline-none focus:border-signal transition-colors"
      style={{ background: "var(--ink-3)", border: "1px solid var(--ink-border)" }}
    />
  )
}

function TextArea({ value, onChange, rows = 3, hint }: { value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-3 text-[13px] text-white placeholder:text-stone/40 rounded-lg outline-none focus:border-signal transition-colors resize-none"
        style={{ background: "var(--ink-3)", border: "1px solid var(--ink-border)" }}
      />
      {hint && <p className="text-[11px] text-stone mt-1">{hint}</p>}
    </div>
  )
}

export default function HistoriaPage() {
  const [brief, setBrief] = useState(mockDnaBrief)
  const [activeBlock, setActiveBlock] = useState("empresa")
  const [saving, setSaving] = useState(false)
  const [newTheme, setNewTheme] = useState("")
  const [showGenerate, setShowGenerate] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
  }

  const toggleDay = (day: string) => {
    setBrief((prev) => ({
      ...prev,
      posting_days: prev.posting_days.includes(day)
        ? prev.posting_days.filter((d) => d !== day)
        : [...prev.posting_days, day],
    }))
  }

  const addTheme = () => {
    if (!newTheme.trim()) return
    setBrief((prev) => ({ ...prev, content_themes: [...prev.content_themes, newTheme.trim()] }))
    setNewTheme("")
  }

  const activeBlockData = BLOCKS.find((b) => b.id === activeBlock)!

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Sua História</h1>
          <p className="text-[13px] text-stone">
            O DNA da marca alimenta toda geração de conteúdo com IA ·{" "}
            <span className="text-white/60">v{brief.version}</span>
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-px disabled:opacity-50"
          style={{ background: "var(--signal)" }}
        >
          {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {/* Block tabs */}
      <div className="flex gap-2">
        {BLOCKS.map((block) => {
          const Icon = block.icon
          const active = activeBlock === block.id
          return (
            <button
              key={block.id}
              onClick={() => setActiveBlock(block.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-semibold transition-all"
              style={active
                ? { background: "rgba(214,64,69,0.14)", border: "1px solid rgba(214,64,69,0.3)", color: "var(--cream)" }
                : { background: "var(--ink-2)", border: "1px solid var(--border)", color: "var(--stone)" }
              }
            >
              <Icon size={13} style={{ color: active ? block.accent : "var(--stone)" }} />
              {block.label}
            </button>
          )
        })}
      </div>

      {/* Active block */}
      <div className="rounded-xl p-6 space-y-5"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <activeBlockData.icon size={15} style={{ color: activeBlockData.accent }} />
          <span className="text-[13px] font-semibold text-white">
            {activeBlock === "empresa" && "Bloco 1 — Empresa"}
            {activeBlock === "cliente" && "Bloco 2 — Cliente Ideal"}
            {activeBlock === "tom" && "Bloco 3 — Tom de Voz"}
            {activeBlock === "operacional" && "Bloco 4 — Operacional"}
          </span>
        </div>

        {activeBlock === "empresa" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Nome da Empresa</FieldLabel>
                <TextInput value={brief.company_name} onChange={(v) => setBrief((p) => ({ ...p, company_name: v }))} />
              </div>
              <div>
                <FieldLabel>Segmento / Nicho</FieldLabel>
                <TextInput value={brief.segment} onChange={(v) => setBrief((p) => ({ ...p, segment: v }))} />
              </div>
              <div>
                <FieldLabel>Cidade</FieldLabel>
                <TextInput value={brief.city} onChange={(v) => setBrief((p) => ({ ...p, city: v }))} />
              </div>
            </div>
            <div>
              <FieldLabel>Diferenciais Competitivos</FieldLabel>
              <TextArea
                value={brief.differentials}
                onChange={(v) => setBrief((p) => ({ ...p, differentials: v }))}
                rows={4}
                hint="Descreva o que torna sua empresa única no mercado."
              />
            </div>
          </div>
        )}

        {activeBlock === "cliente" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Faixa Etária</FieldLabel>
                <TextInput value={brief.ideal_client_age} onChange={(v) => setBrief((p) => ({ ...p, ideal_client_age: v }))} placeholder="Ex: 28-45 anos" />
              </div>
              <div>
                <FieldLabel>Gênero</FieldLabel>
                <TextInput value={brief.ideal_client_gender} onChange={(v) => setBrief((p) => ({ ...p, ideal_client_gender: v }))} placeholder="Ex: Masculino, Feminino ou Qualquer" />
              </div>
            </div>
            <div>
              <FieldLabel>Maior Dor / Problema</FieldLabel>
              <TextArea
                value={brief.ideal_client_pain}
                onChange={(v) => setBrief((p) => ({ ...p, ideal_client_pain: v }))}
                rows={3}
                hint="O que mantém seu cliente acordado à noite?"
              />
            </div>
            <div>
              <FieldLabel>Sonho / Desejo</FieldLabel>
              <TextArea
                value={brief.ideal_client_dream}
                onChange={(v) => setBrief((p) => ({ ...p, ideal_client_dream: v }))}
                rows={3}
                hint="O que seu cliente quer conquistar com seu produto/serviço?"
              />
            </div>
          </div>
        )}

        {activeBlock === "tom" && (
          <div className="space-y-4">
            <div>
              <FieldLabel>Adjetivos do Tom</FieldLabel>
              <div className="flex flex-wrap gap-2 mb-3">
                {brief.tone_adjectives.map((adj) => (
                  <button
                    key={adj}
                    onClick={() => setBrief((p) => ({ ...p, tone_adjectives: p.tone_adjectives.filter((a) => a !== adj) }))}
                    className="text-[11px] font-semibold px-3 py-1 rounded-full transition-colors"
                    style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "var(--green)" }}
                  >
                    {adj} ×
                  </button>
                ))}
              </div>
              <input
                className="w-full px-4 py-3 text-[13px] text-white placeholder:text-stone/40 rounded-lg outline-none focus:border-signal transition-colors"
                style={{ background: "var(--ink-3)", border: "1px solid var(--ink-border)" }}
                placeholder="Adicionar adjetivo... (Enter para confirmar)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (val) {
                      setBrief((p) => ({ ...p, tone_adjectives: [...p.tone_adjectives, val] }));
                      (e.target as HTMLInputElement).value = ""
                    }
                  }
                }}
              />
            </div>
            <div>
              <FieldLabel>O que evitar no tom</FieldLabel>
              <TextArea value={brief.tone_avoid} onChange={(v) => setBrief((p) => ({ ...p, tone_avoid: v }))} rows={2} />
            </div>
            <div>
              <FieldLabel>Exemplo de frase ideal</FieldLabel>
              <TextArea
                value={brief.tone_example}
                onChange={(v) => setBrief((p) => ({ ...p, tone_example: v }))}
                rows={3}
                hint="Escreva uma frase que capture perfeitamente o tom da marca."
              />
            </div>
          </div>
        )}

        {activeBlock === "operacional" && (
          <div className="space-y-5">
            <div>
              <FieldLabel>Dias de Postagem</FieldLabel>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(DAYS_PT).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleDay(key)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                    style={brief.posting_days.includes(key)
                      ? { background: "var(--signal)", color: "var(--cream)", border: "1px solid var(--signal)" }
                      : { background: "var(--ink-3)", color: "var(--stone)", border: "1px solid var(--border)" }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Frequência Semanal</FieldLabel>
                <input
                  type="number" min={1} max={7}
                  value={brief.posting_frequency}
                  onChange={(e) => setBrief((p) => ({ ...p, posting_frequency: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 text-[13px] text-white rounded-lg outline-none focus:border-signal transition-colors"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--ink-border)" }}
                />
              </div>
              <div>
                <FieldLabel>Plataforma</FieldLabel>
                <select
                  value={brief.platform}
                  onChange={(e) => setBrief((p) => ({ ...p, platform: e.target.value as any }))}
                  className="w-full px-4 py-3 text-[13px] text-white rounded-lg outline-none focus:border-signal transition-colors"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--ink-border)" }}
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram_facebook">Instagram + Facebook</option>
                </select>
              </div>
            </div>

            <div>
              <FieldLabel>Temas de Conteúdo</FieldLabel>
              <div className="flex flex-wrap gap-2 mb-3">
                {brief.content_themes.map((theme) => (
                  <span key={theme} className="flex items-center gap-1 text-[11px] px-3 py-1 rounded-full"
                    style={{ background: "var(--ink-3)", border: "1px solid var(--border)", color: "var(--cream)" }}>
                    {theme}
                    <button onClick={() => setBrief((p) => ({ ...p, content_themes: p.content_themes.filter((t) => t !== theme) }))}
                      className="text-stone hover:text-signal ml-0.5">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addTheme() }}
                  className="flex-1 px-4 py-3 text-[13px] text-white placeholder:text-stone/40 rounded-lg outline-none focus:border-signal transition-colors"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--ink-border)" }}
                  placeholder="Novo tema..."
                />
                <button onClick={addTheme}
                  className="px-4 py-3 rounded-lg text-[12px] font-semibold text-white transition-colors"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                  Adicionar
                </button>
              </div>
            </div>

            <div>
              <FieldLabel>Notas para a IA</FieldLabel>
              <TextArea
                value={brief.ai_notes ?? ""}
                onChange={(v) => setBrief((p) => ({ ...p, ai_notes: v }))}
                rows={3}
                hint="Instruções especiais que a IA deve considerar na geração de conteúdo."
              />
            </div>
          </div>
        )}
      </div>

      {/* AI Generate */}
      <div className="flex items-center gap-4 px-5 py-4 rounded-xl"
        style={{ background: "rgba(214,64,69,0.08)", border: "1px solid rgba(214,64,69,0.22)" }}>
        <div className="p-2.5 rounded-lg" style={{ background: "rgba(214,64,69,0.15)" }}>
          <Sparkles size={16} style={{ color: "var(--signal)" }} />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-white">Gerar Conteúdo com IA</div>
          <div className="text-[11px] text-stone">Baseado no DNA atual, a IA vai criar os posts da próxima semana.</div>
        </div>
        <button onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
          style={{ background: "var(--signal)" }}>
          <Sparkles size={13} />
          Gerar Agora
        </button>
      </div>

      {showGenerate && <GenerateModal onClose={() => setShowGenerate(false)} />}
    </div>
  )
}
