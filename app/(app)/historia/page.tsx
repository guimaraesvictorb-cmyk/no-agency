"use client"

import { useState } from "react"
import { Sparkles, Building2, Users, MessageCircle, Settings, Save, RefreshCw } from "lucide-react"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { mockDnaBrief } from "@/lib/mock-data"
import { DAYS_PT } from "@/lib/utils"

const BLOCKS = [
  { id: "empresa", label: "Empresa", icon: Building2, color: "text-signal" },
  { id: "cliente", label: "Cliente Ideal", icon: Users, color: "text-blue" },
  { id: "tom", label: "Tom de Voz", icon: MessageCircle, color: "text-green" },
  { id: "operacional", label: "Operacional", icon: Settings, color: "text-amber" },
]

export default function HistoriaPage() {
  const [brief, setBrief] = useState(mockDnaBrief)
  const [activeBlock, setActiveBlock] = useState("empresa")
  const [saving, setSaving] = useState(false)
  const [newTheme, setNewTheme] = useState("")

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

  const removeTheme = (theme: string) => {
    setBrief((prev) => ({ ...prev, content_themes: prev.content_themes.filter((t) => t !== theme) }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-signal" />
            <h2 className="text-lg font-semibold text-cream">DNA da Marca</h2>
            <Badge variant="info">v{brief.version}</Badge>
          </div>
          <p className="text-sm text-stone">
            O documento vivo que alimenta toda a geração de conteúdo com IA.
          </p>
        </div>
        <Button onClick={handleSave} loading={saving} size="sm">
          <Save size={14} />
          Salvar
        </Button>
      </div>

      {/* Block tabs */}
      <div className="flex gap-2 flex-wrap">
        {BLOCKS.map((block) => {
          const Icon = block.icon
          return (
            <button
              key={block.id}
              onClick={() => setActiveBlock(block.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeBlock === block.id
                  ? "bg-ink-2 border border-border text-cream"
                  : "text-stone hover:text-cream hover:bg-ink-3"
              }`}
            >
              <Icon size={14} className={block.color} />
              {block.label}
            </button>
          )
        })}
      </div>

      {/* Block: Empresa */}
      {activeBlock === "empresa" && (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-signal" />
            <h3 className="font-semibold text-cream">Bloco 1 — Empresa</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome da Empresa"
              value={brief.company_name}
              onChange={(e) => setBrief((p) => ({ ...p, company_name: e.target.value }))}
            />
            <Input
              label="Segmento / Nicho"
              value={brief.segment}
              onChange={(e) => setBrief((p) => ({ ...p, segment: e.target.value }))}
            />
            <Input
              label="Cidade"
              value={brief.city}
              onChange={(e) => setBrief((p) => ({ ...p, city: e.target.value }))}
            />
          </div>
          <Textarea
            label="Diferenciais Competitivos"
            value={brief.differentials}
            onChange={(e) => setBrief((p) => ({ ...p, differentials: e.target.value }))}
            rows={4}
            hint="Descreva o que torna sua empresa única no mercado."
          />
        </Card>
      )}

      {/* Block: Cliente Ideal */}
      {activeBlock === "cliente" && (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-blue" />
            <h3 className="font-semibold text-cream">Bloco 2 — Cliente Ideal</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Faixa Etária"
              value={brief.ideal_client_age}
              onChange={(e) => setBrief((p) => ({ ...p, ideal_client_age: e.target.value }))}
              placeholder="Ex: 28-45 anos"
            />
            <Input
              label="Gênero"
              value={brief.ideal_client_gender}
              onChange={(e) => setBrief((p) => ({ ...p, ideal_client_gender: e.target.value }))}
              placeholder="Ex: Feminino, Masculino ou Qualquer"
            />
          </div>
          <Textarea
            label="Maior Dor / Problema"
            value={brief.ideal_client_pain}
            onChange={(e) => setBrief((p) => ({ ...p, ideal_client_pain: e.target.value }))}
            rows={3}
            hint="O que mantém seu cliente acordado à noite?"
          />
          <Textarea
            label="Sonho / Desejo"
            value={brief.ideal_client_dream}
            onChange={(e) => setBrief((p) => ({ ...p, ideal_client_dream: e.target.value }))}
            rows={3}
            hint="O que seu cliente quer conquistas com seu produto/serviço?"
          />
        </Card>
      )}

      {/* Block: Tom de Voz */}
      {activeBlock === "tom" && (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle size={16} className="text-green" />
            <h3 className="font-semibold text-cream">Bloco 3 — Tom de Voz</h3>
          </div>
          <div>
            <label className="text-sm font-medium text-cream/80 block mb-2">Adjetivos do Tom</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {brief.tone_adjectives.map((adj) => (
                <button
                  key={adj}
                  onClick={() =>
                    setBrief((p) => ({ ...p, tone_adjectives: p.tone_adjectives.filter((a) => a !== adj) }))
                  }
                  className="bg-green/10 text-green border border-green/20 text-xs px-2.5 py-1 rounded-full hover:bg-signal/10 hover:text-signal hover:border-signal/20 transition-colors"
                >
                  {adj} ×
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-ink-3 border border-border rounded-lg px-3 py-2 text-sm text-cream placeholder:text-stone focus:outline-none focus:border-stone"
                placeholder="Adicionar adjetivo..."
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
          </div>
          <Textarea
            label="O que evitar no tom"
            value={brief.tone_avoid}
            onChange={(e) => setBrief((p) => ({ ...p, tone_avoid: e.target.value }))}
            rows={2}
          />
          <Textarea
            label="Exemplo de frase ideal"
            value={brief.tone_example}
            onChange={(e) => setBrief((p) => ({ ...p, tone_example: e.target.value }))}
            rows={3}
            hint="Escreva uma frase que capture perfeitamente o tom da marca."
          />
        </Card>
      )}

      {/* Block: Operacional */}
      {activeBlock === "operacional" && (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={16} className="text-amber" />
            <h3 className="font-semibold text-cream">Bloco 4 — Operacional</h3>
          </div>

          <div>
            <label className="text-sm font-medium text-cream/80 block mb-2">Dias de Postagem</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(DAYS_PT).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => toggleDay(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    brief.posting_days.includes(key)
                      ? "bg-signal text-cream"
                      : "bg-ink-3 text-stone border border-border hover:border-stone/40"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-cream/80 block mb-1.5">Frequência Semanal</label>
              <input
                type="number"
                min={1}
                max={7}
                value={brief.posting_frequency}
                onChange={(e) => setBrief((p) => ({ ...p, posting_frequency: parseInt(e.target.value) }))}
                className="w-full bg-ink-3 border border-border rounded-lg px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-stone"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-cream/80 block mb-1.5">Plataforma</label>
              <select
                value={brief.platform}
                onChange={(e) => setBrief((p) => ({ ...p, platform: e.target.value as any }))}
                className="w-full bg-ink-3 border border-border rounded-lg px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-stone"
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="instagram_facebook">Instagram + Facebook</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-cream/80 block mb-2">Temas de Conteúdo</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {brief.content_themes.map((theme) => (
                <span
                  key={theme}
                  className="flex items-center gap-1 bg-ink-3 border border-border text-xs text-cream px-2.5 py-1 rounded-full"
                >
                  {theme}
                  <button onClick={() => removeTheme(theme)} className="text-stone hover:text-signal">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addTheme() }}
                className="flex-1 bg-ink-3 border border-border rounded-lg px-3 py-2 text-sm text-cream placeholder:text-stone focus:outline-none focus:border-stone"
                placeholder="Novo tema..."
              />
              <Button onClick={addTheme} size="sm" variant="secondary">Adicionar</Button>
            </div>
          </div>

          <Textarea
            label="Notas para a IA"
            value={brief.ai_notes ?? ""}
            onChange={(e) => setBrief((p) => ({ ...p, ai_notes: e.target.value }))}
            rows={3}
            hint="Instruções especiais que a IA deve considerar na geração de conteúdo."
          />
        </Card>
      )}

      {/* AI Generate preview */}
      <Card className="border-signal/20 bg-signal/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-signal/15 rounded-lg">
            <RefreshCw size={16} className="text-signal" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-cream">Gerar Conteúdo com IA</div>
            <div className="text-xs text-stone">Baseado no DNA atual, a IA vai criar os posts da próxima semana.</div>
          </div>
          <Button variant="primary" size="sm">
            <Sparkles size={14} />
            Gerar Agora
          </Button>
        </div>
      </Card>
    </div>
  )
}
