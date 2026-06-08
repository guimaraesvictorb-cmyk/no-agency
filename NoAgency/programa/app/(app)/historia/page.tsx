"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Sparkles, Building2, Users, MessageCircle, Sliders,
  Save, RefreshCw, CheckCircle, X, AlertCircle, ExternalLink,
  ImageIcon, Upload, HelpCircle,
} from "lucide-react"
import { useSelectedClient } from "@/lib/context/ClientContext"
import { DAYS_PT } from "@/lib/utils"
import type { DnaBrief, SocialPlatform } from "@/lib/types"

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaFile = {
  id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  tags: string[]
  uploaded_at: string
}

type GeneratedPost = {
  id: string
  caption: string
  image_prompt: string
  status: string
  scheduled_for: string | null
  platform: string
}

// ─── Empty brief ──────────────────────────────────────────────────────────────

function emptyBrief(client_id: string): Partial<DnaBrief> & { client_id: string } {
  return {
    client_id,
    company_name: "",
    segment: "",
    city: "",
    differentials: "",
    ideal_client_age: "",
    ideal_client_gender: "",
    ideal_client_pain: "",
    ideal_client_dream: "",
    tone_adjectives: [],
    tone_avoid: "",
    tone_example: "",
    posting_days: ["seg", "qua", "sex"],
    posting_frequency: 3,
    platform: "instagram_facebook",
    content_themes: [],
    ai_notes: "",
    version: 0,
  }
}

// ─── Content pillars ──────────────────────────────────────────────────────────

const CONTENT_PILLARS = [
  { id: "educativo",     label: "Educativo",     desc: "Dicas, curiosidades e conteúdo de valor" },
  { id: "vendas",        label: "Vendas",         desc: "Promoções, ofertas e CTA direto"         },
  { id: "bastidores",    label: "Bastidores",     desc: "Por trás do negócio, equipe, processo"   },
  { id: "depoimentos",   label: "Depoimentos",    desc: "Clientes satisfeitos e resultados"        },
  { id: "engajamento",   label: "Engajamento",    desc: "Perguntas, enquetes e interação"          },
  { id: "inspiracional", label: "Inspiracional",  desc: "Frases, histórias e motivação"            },
]

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function Tip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-block ml-1.5">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(!open)}
        className="align-middle opacity-50 hover:opacity-100 transition-opacity"
      >
        <HelpCircle size={13} style={{ color: "var(--stone)" }} />
      </button>
      {open && (
        <div className="absolute left-6 top-0 z-50 w-56 rounded-xl px-3 py-2.5 text-[11px] leading-snug shadow-card"
          style={{ background: "var(--cream)", color: "var(--ink)", border: "1px solid var(--border)" }}>
          {text}
        </div>
      )}
    </div>
  )
}

// ─── Generate modal ───────────────────────────────────────────────────────────

function GenerateModal({ posts, loading, error, onClose }: {
  posts: GeneratedPost[]
  loading: boolean
  error: string | null
  onClose: () => void
}) {
  const router = useRouter()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
      onClick={!loading ? onClose : undefined}>
      <div className="rounded-2xl p-6 w-full max-w-lg shadow-modal"
        style={{ background: "var(--ink)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}>
        {loading && (
          <div className="flex flex-col items-center py-10 gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: "rgba(214,64,69,0.20)" }} />
              <div className="absolute inset-0 rounded-full border-2 border-t-signal animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={20} className="text-signal" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-[15px] font-semibold" style={{ color: "var(--cream)" }}>Gerando conteúdo com IA...</div>
              <div className="text-[12px]" style={{ color: "var(--stone)" }}>Claude está criando posts baseados no DNA da marca</div>
            </div>
          </div>
        )}

        {!loading && error && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-signal" />
                <span className="text-[13px] font-semibold" style={{ color: "var(--cream)" }}>Erro na geração</span>
              </div>
              <button onClick={onClose} style={{ color: "var(--stone)" }}><X size={16} /></button>
            </div>
            <p className="text-[13px] mb-4" style={{ color: "var(--stone)" }}>{error}</p>
            <button onClick={onClose} className="w-full py-3 rounded-xl text-[12px] font-bold text-white"
              style={{ background: "var(--signal)" }}>
              Fechar
            </button>
          </>
        )}

        {!loading && !error && posts.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-[13px] font-semibold" style={{ color: "var(--cream)" }}>
                  {posts.length} posts gerados e salvos!
                </span>
              </div>
              <button onClick={onClose} style={{ color: "var(--stone)" }}><X size={16} /></button>
            </div>
            <div className="space-y-2 mb-5 max-h-72 overflow-y-auto">
              {posts.map((post, i) => (
                <div key={post.id} className="p-3 rounded-lg space-y-1.5"
                  style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-bold w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--stone)" }}>#{i + 1}</span>
                    <span className="text-[12px] leading-snug flex-1" style={{ color: "var(--cream)" }}>
                      {post.caption.split("\n")[0].slice(0, 120)}{post.caption.length > 120 ? "..." : ""}
                    </span>
                  </div>
                  {post.scheduled_for && (
                    <div className="text-[10px] ml-7" style={{ color: "var(--stone)" }}>
                      📅 {new Date(post.scheduled_for).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[12px] mb-4" style={{ color: "var(--stone)" }}>
              Os posts foram adicionados ao Calendário Editorial — revise antes de aprovar.
            </p>
            <button
              onClick={() => { onClose(); router.push("/calendario") }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest text-white"
              style={{ background: "var(--signal)" }}
            >
              <ExternalLink size={13} />
              Ver no Calendário
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Field components ─────────────────────────────────────────────────────────

function FieldLabel({ children, tip }: { children: React.ReactNode; tip?: string }) {
  return (
    <label className="flex items-center text-[11px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ color: "var(--stone)" }}>
      {children}
      {tip && <Tip text={tip} />}
    </label>
  )
}

function TextInput({
  value, onChange, placeholder, example,
}: { value: string; onChange: (v: string) => void; placeholder?: string; example?: string }) {
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-[13px] rounded-lg outline-none transition-colors"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)", color: "var(--cream)" }}
      />
      {example && (
        <p className="text-[10px] mt-1.5 italic" style={{ color: "var(--stone)" }}>Ex: {example}</p>
      )}
    </div>
  )
}

function TextArea({
  value, onChange, rows = 3, hint, example,
}: { value: string; onChange: (v: string) => void; rows?: number; hint?: string; example?: string }) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-3 text-[13px] rounded-lg outline-none resize-none transition-colors"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)", color: "var(--cream)" }}
      />
      {hint && <p className="text-[11px] mt-1.5" style={{ color: "var(--stone)" }}>{hint}</p>}
      {example && <p className="text-[10px] mt-1 italic" style={{ color: "var(--stone)" }}>Ex: "{example}"</p>}
    </div>
  )
}

// ─── Blocks config ────────────────────────────────────────────────────────────

const BLOCKS = [
  { id: "empresa",      label: "Empresa",       icon: Building2,   accent: "var(--signal)" },
  { id: "cliente",      label: "Cliente Ideal",  icon: Users,       accent: "var(--blue)"   },
  { id: "tom",          label: "Tom de Voz",     icon: MessageCircle, accent: "var(--green)" },
  { id: "preferencias", label: "Preferências",   icon: Sliders,     accent: "var(--amber)"  },
  { id: "arquivos",     label: "Arquivos",        icon: ImageIcon,   accent: "#A855F7"        },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HistoriaPage() {
  const { client: selectedClient } = useSelectedClient()
  const [brief, setBrief] = useState<ReturnType<typeof emptyBrief> | null>(null)
  const [activeBlock, setActiveBlock] = useState("empresa")
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [newTheme, setNewTheme] = useState("")
  const [loadingBrief, setLoadingBrief] = useState(false)

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBranding, setUploadingBranding] = useState(false)

  const [genLoading, setGenLoading] = useState(false)
  const [genPosts, setGenPosts] = useState<GeneratedPost[]>([])
  const [genError, setGenError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const loadMediaFiles = useCallback(async (clientId: string) => {
    try {
      const res = await fetch(`/api/upload/asset?client_id=${clientId}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.files) setMediaFiles(data.files)
    } catch {}
  }, [])

  async function handleUpload(file: File, tag: "logo" | "brandingbook") {
    if (!selectedClient) return
    const setUploading = tag === "logo" ? setUploadingLogo : setUploadingBranding
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("client_id", selectedClient.id)
      form.append("tag", tag)
      const res = await fetch("/api/upload/asset", { method: "POST", body: form })
      const data = await res.json()
      if (data.file) setMediaFiles((prev) => [data.file, ...prev])
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteFile(id: string) {
    if (!selectedClient) return
    const res = await fetch("/api/upload/asset", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media_file_id: id, client_id: selectedClient.id }),
    })
    if (res.ok) setMediaFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const loadBrief = useCallback(async (clientId: string) => {
    setLoadingBrief(true)
    try {
      const res = await fetch(`/api/dna-brief?client_id=${clientId}`)
      const json = await res.json()
      setBrief(json.brief ?? emptyBrief(clientId))
    } catch {
      setBrief(emptyBrief(clientId))
    } finally {
      setLoadingBrief(false)
    }
  }, [])

  useEffect(() => {
    if (selectedClient?.id) {
      loadBrief(selectedClient.id)
      loadMediaFiles(selectedClient.id)
    }
  }, [selectedClient?.id, loadBrief, loadMediaFiles])

  async function handleSave() {
    if (!brief || !selectedClient) return
    setSaving(true)
    try {
      const res = await fetch("/api/dna-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...brief, client_id: selectedClient.id }),
      })
      const json = await res.json()
      if (json.brief) setBrief(json.brief)
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerate() {
    if (!brief || !selectedClient) return
    setGenLoading(true)
    setGenPosts([])
    setGenError(null)
    setShowModal(true)
    try {
      const res = await fetch("/api/posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, client_id: selectedClient.id }),
      })
      const json = await res.json()
      if (!res.ok) setGenError(json.error ?? "Erro na geração")
      else setGenPosts(json.posts ?? [])
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : "Erro de rede")
    } finally {
      setGenLoading(false)
    }
  }

  const toggleDay = (day: string) => {
    if (!brief) return
    setBrief((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        posting_days: prev.posting_days?.includes(day)
          ? prev.posting_days.filter((d) => d !== day)
          : [...(prev.posting_days ?? []), day],
      }
    })
  }

  const togglePillar = (pillar: string) => {
    if (!brief) return
    const current = (brief.content_themes ?? [])
    setBrief((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        content_themes: current.includes(pillar)
          ? current.filter((p) => p !== pillar)
          : [...current, pillar],
      }
    })
  }

  const addTheme = () => {
    if (!newTheme.trim() || !brief) return
    setBrief((prev) => {
      if (!prev) return prev
      return { ...prev, content_themes: [...(prev.content_themes ?? []), newTheme.trim()] }
    })
    setNewTheme("")
  }

  const update = (field: string, value: unknown) => {
    setBrief((prev) => prev ? { ...prev, [field]: value } : prev)
  }

  if (!selectedClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="text-5xl">🏢</div>
        <h1 className="font-bebas text-[36px]" style={{ color: "var(--cream)" }}>Selecione um cliente</h1>
        <p className="text-[14px] max-w-sm" style={{ color: "var(--stone)" }}>
          Use o seletor na barra lateral para escolher o cliente que deseja configurar.
        </p>
      </div>
    )
  }

  if (loadingBrief) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3" style={{ color: "var(--stone)" }}>
          <RefreshCw size={18} className="animate-spin" />
          <span className="text-[13px]">Carregando DNA da marca...</span>
        </div>
      </div>
    )
  }

  if (!brief) return null

  const activeBlockData = BLOCKS.find((b) => b.id === activeBlock)!

  const logos     = mediaFiles.filter((f) => f.tags.includes("logo"))
  const branding  = mediaFiles.filter((f) => f.tags.includes("brandingbook"))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bebas text-[40px] leading-none mb-1" style={{ color: "var(--cream)" }}>Sua História</h1>
          <p className="text-[13px]" style={{ color: "var(--stone)" }}>
            {selectedClient.name} · DNA da marca para geração de conteúdo com IA
            {(brief.version ?? 0) > 0 && (
              <span className="ml-1 opacity-40"> v{brief.version}</span>
            )}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-px disabled:opacity-50"
          style={{ background: savedOk ? "var(--green)" : "var(--signal)" }}
        >
          {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Salvando..." : savedOk ? "Salvo!" : "Salvar"}
        </button>
      </div>

      {/* Block tabs */}
      <div className="flex gap-2 flex-wrap">
        {BLOCKS.map((block) => {
          const Icon = block.icon
          const active = activeBlock === block.id
          return (
            <button
              key={block.id}
              onClick={() => setActiveBlock(block.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-semibold transition-all"
              style={active
                ? { background: "rgba(214,64,69,0.10)", border: "1px solid rgba(214,64,69,0.25)", color: "var(--cream)" }
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
          <span className="text-[13px] font-semibold" style={{ color: "var(--cream)" }}>
            {activeBlock === "empresa"      && "Bloco 1 — Empresa"}
            {activeBlock === "cliente"      && "Bloco 2 — Cliente Ideal"}
            {activeBlock === "tom"          && "Bloco 3 — Tom de Voz"}
            {activeBlock === "preferencias" && "Bloco 4 — Preferências de Conteúdo"}
            {activeBlock === "arquivos"     && "Bloco 5 — Arquivos da Marca"}
          </span>
        </div>

        {/* ── Empresa ── */}
        {activeBlock === "empresa" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel tip="Nome exato como aparece nas redes e para os clientes.">Nome da Empresa</FieldLabel>
                <TextInput
                  value={brief.company_name ?? ""}
                  onChange={(v) => update("company_name", v)}
                  example="Bella Hair Studio"
                />
              </div>
              <div>
                <FieldLabel tip="Quanto mais específico, melhor o conteúdo. Evite genérico como 'serviços'.">Segmento / Nicho</FieldLabel>
                <TextInput
                  value={brief.segment ?? ""}
                  onChange={(v) => update("segment", v)}
                  example="Salão de beleza especializado em coloração"
                />
              </div>
              <div>
                <FieldLabel tip="Cidade e estado. Ajuda na linguagem regional e referências locais.">Cidade</FieldLabel>
                <TextInput
                  value={brief.city ?? ""}
                  onChange={(v) => update("city", v)}
                  example="Belo Horizonte, MG"
                />
              </div>
            </div>
            <div>
              <FieldLabel tip="O que você faz de diferente que nenhum concorrente faz igual? Seja específico — 'bom atendimento' não é diferencial.">
                Diferenciais Competitivos
              </FieldLabel>
              <TextArea
                value={brief.differentials ?? ""}
                onChange={(v) => update("differentials", v)}
                rows={4}
                example="Única no bairro com técnica de coloração vegana certificada. Atendimento com hora marcada, sem espera. 10 anos de experiência com cabelos cacheados."
              />
            </div>
          </div>
        )}

        {/* ── Cliente Ideal ── */}
        {activeBlock === "cliente" && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg text-[12px] leading-snug"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", color: "var(--blue)" }}>
              💡 Quanto mais você conhece quem está do outro lado, mais certeiro é o conteúdo. Responda como se estivesse descrevendo uma pessoa real.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel tip="A faixa etária define linguagem, referências e o tom. '18-65 anos' é amplo demais.">Faixa Etária</FieldLabel>
                <TextInput
                  value={brief.ideal_client_age ?? ""}
                  onChange={(v) => update("ideal_client_age", v)}
                  example="30 a 50 anos"
                />
              </div>
              <div>
                <FieldLabel tip="Pode ser mais de um perfil. Ser específico ajuda a calibrar a linguagem.">Gênero principal</FieldLabel>
                <TextInput
                  value={brief.ideal_client_gender ?? ""}
                  onChange={(v) => update("ideal_client_gender", v)}
                  example="Predominantemente feminino"
                />
              </div>
            </div>
            <div>
              <FieldLabel tip="O que deixa seu cliente acordado à noite? Qual problema ele está tentando resolver quando te procura?">
                Maior Dor / Problema
              </FieldLabel>
              <TextArea
                value={brief.ideal_client_pain ?? ""}
                onChange={(v) => update("ideal_client_pain", v)}
                rows={3}
                example="Insegurança com a aparência em reuniões profissionais. Já foi mal atendida em outros salões e tem medo de desperdiçar dinheiro."
              />
            </div>
            <div>
              <FieldLabel tip="O que seu cliente quer sentir depois de usar seu serviço? Qual transformação ele busca?">
                Sonho / Desejo
              </FieldLabel>
              <TextArea
                value={brief.ideal_client_dream ?? ""}
                onChange={(v) => update("ideal_client_dream", v)}
                rows={3}
                example="Quer se sentir confiante e bem-cuidada. Quer ter um visual que combine com sua personalidade sem precisar se preocupar com o resultado."
              />
            </div>
          </div>
        )}

        {/* ── Tom de Voz ── */}
        {activeBlock === "tom" && (
          <div className="space-y-4">
            <div>
              <FieldLabel tip="3 a 5 adjetivos que descrevem como sua marca fala. São a personalidade escrita da marca.">
                Adjetivos do Tom
              </FieldLabel>
              <div className="flex flex-wrap gap-2 mb-3">
                {(brief.tone_adjectives ?? []).map((adj) => (
                  <button
                    key={adj}
                    onClick={() => update("tone_adjectives", (brief.tone_adjectives ?? []).filter((a) => a !== adj))}
                    className="text-[11px] font-semibold px-3 py-1 rounded-full transition-colors"
                    style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.22)", color: "var(--green)" }}
                  >
                    {adj} ×
                  </button>
                ))}
              </div>
              <input
                className="w-full px-4 py-3 text-[13px] rounded-lg outline-none transition-colors"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)", color: "var(--cream)" }}
                placeholder="Digite um adjetivo e pressione Enter... (ex: Acolhedor)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (val) {
                      update("tone_adjectives", [...(brief.tone_adjectives ?? []), val]);
                      (e.target as HTMLInputElement).value = ""
                    }
                  }
                }}
              />
              <p className="text-[10px] mt-1.5 italic" style={{ color: "var(--stone)" }}>Ex: Acolhedor, Especialista, Descontraído, Inspirador</p>
            </div>
            <div>
              <FieldLabel tip="Palavras ou estilos que não combinam com sua marca. A IA vai evitar tudo isso.">
                O que evitar no tom
              </FieldLabel>
              <TextArea
                value={brief.tone_avoid ?? ""}
                onChange={(v) => update("tone_avoid", v)}
                rows={2}
                example="Gírias de internet, linguagem muito técnica, tom agressivo de vendas, palavrões"
              />
            </div>
            <div>
              <FieldLabel tip="Uma legenda de post ou frase que você escreveria que captura exatamente o jeito da sua marca. Isso é o guia mais preciso para a IA.">
                Exemplo de frase ideal da marca
              </FieldLabel>
              <TextArea
                value={brief.tone_example ?? ""}
                onChange={(v) => update("tone_example", v)}
                rows={3}
                example="Seu cabelo conta sua história ✨ Aqui cada detalhe é tratado com cuidado porque beleza não é padrão — é expressão. Agende seu horário e venha se descobrir."
              />
            </div>
          </div>
        )}

        {/* ── Preferências de Conteúdo ── */}
        {activeBlock === "preferencias" && (
          <div className="space-y-5">
            <div>
              <FieldLabel tip="Pilares são os grandes temas dos seus posts. Escolha os que mais representam sua comunicação.">
                Pilares de Conteúdo
              </FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_PILLARS.map((p) => {
                  const active = (brief.content_themes ?? []).includes(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePillar(p.id)}
                      className="flex flex-col items-start px-3 py-3 rounded-xl text-left transition-all"
                      style={active
                        ? { background: "rgba(214,64,69,0.10)", border: "1px solid rgba(214,64,69,0.28)" }
                        : { background: "var(--ink-3)", border: "1px solid var(--border)" }
                      }
                    >
                      <span className="text-[12px] font-semibold mb-0.5" style={{ color: active ? "var(--signal)" : "var(--cream)" }}>
                        {p.label}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--stone)" }}>{p.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <FieldLabel tip="Temas específicos além dos pilares — produtos, datas, serviços que você quer destacar.">
                Temas Específicos
              </FieldLabel>
              <div className="flex flex-wrap gap-2 mb-3">
                {(brief.content_themes ?? [])
                  .filter((t) => !CONTENT_PILLARS.find((p) => p.id === t))
                  .map((theme) => (
                    <span key={theme}
                      className="flex items-center gap-1 text-[11px] px-3 py-1 rounded-full"
                      style={{ background: "var(--ink-3)", border: "1px solid var(--border)", color: "var(--cream)" }}>
                      {theme}
                      <button
                        onClick={() => update("content_themes", (brief.content_themes ?? []).filter((t) => t !== theme))}
                        style={{ color: "var(--stone)" }}
                        className="hover:text-signal ml-0.5"
                      >×</button>
                    </span>
                  ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addTheme() }}
                  className="flex-1 px-4 py-3 text-[13px] rounded-lg outline-none transition-colors"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--border)", color: "var(--cream)" }}
                  placeholder="Ex: Promoção de aniversário, lançamento de produto..."
                />
                <button onClick={addTheme}
                  className="px-4 py-3 rounded-lg text-[12px] font-semibold transition-colors"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--border)", color: "var(--cream)" }}>
                  + Adicionar
                </button>
              </div>
            </div>

            <div>
              <FieldLabel tip="Quais dias seus seguidores estão mais ativos? Seg/Qua/Sex é uma boa base para começar.">
                Dias de Postagem
              </FieldLabel>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(DAYS_PT).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleDay(key)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                    style={(brief.posting_days ?? []).includes(key)
                      ? { background: "var(--signal)", color: "#ffffff", border: "1px solid var(--signal)" }
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
                <FieldLabel tip="Quantidade de posts por semana. 3x é o mínimo recomendado para algoritmos de feed.">
                  Posts por semana
                </FieldLabel>
                <input
                  type="number" min={1} max={7}
                  value={brief.posting_frequency ?? 3}
                  onChange={(e) => update("posting_frequency", parseInt(e.target.value))}
                  className="w-full px-4 py-3 text-[13px] rounded-lg outline-none transition-colors"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--border)", color: "var(--cream)" }}
                />
              </div>
              <div>
                <FieldLabel tip="A plataforma principal onde seus clientes estão. Afeta o formato e o comprimento dos posts.">
                  Plataforma principal
                </FieldLabel>
                <select
                  value={brief.platform ?? "instagram_facebook"}
                  onChange={(e) => update("platform", e.target.value as SocialPlatform)}
                  className="w-full px-4 py-3 text-[13px] rounded-lg outline-none transition-colors"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--border)", color: "var(--cream)" }}
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram_facebook">Instagram + Facebook</option>
                </select>
              </div>
            </div>

            <div>
              <FieldLabel tip="Instruções especiais para a IA: produtos em destaque, o que NÃO mencionar, datas importantes, campanhas ativas.">
                Instruções para a IA
              </FieldLabel>
              <TextArea
                value={brief.ai_notes ?? ""}
                onChange={(v) => update("ai_notes", v)}
                rows={3}
                example="Destacar lançamento do novo serviço de progressiva este mês. Não mencionar o concorrente X. Evitar imagens com modelos — usar sempre fotos reais do espaço."
              />
            </div>
          </div>
        )}

        {/* ── Arquivos ── */}
        {activeBlock === "arquivos" && (
          <div className="space-y-6">
            {/* Logos */}
            <div>
              <FieldLabel tip="Envie todas as variações da logo: cor, fundo claro, fundo escuro, horizontal, quadrado. A IA usa para descrever a identidade visual nos criativos.">
                Logo da Marca
              </FieldLabel>
              <p className="text-[11px] mb-3" style={{ color: "var(--stone)" }}>
                PNG, SVG ou JPG. Envie todas as variações — a IA prioriza usar o logo correto para cada fundo.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {logos.map((logo) => (
                  <div key={logo.id} className="relative group rounded-xl overflow-hidden flex flex-col"
                    style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                    <div className="aspect-square flex items-center justify-center p-3"
                      style={{ background: "rgba(0,0,0,0.03)" }}>
                      <img src={logo.file_url} alt={logo.file_name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="px-2 py-1.5">
                      <div className="text-[10px] truncate" style={{ color: "var(--stone)" }}>{logo.file_name}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(logo.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(214,64,69,0.85)" }}
                    >
                      <X size={11} className="text-white" />
                    </button>
                  </div>
                ))}
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl aspect-square transition-colors"
                    style={{ background: "var(--ink-3)", border: "2px dashed var(--border)" }}>
                    {uploadingLogo ? (
                      <RefreshCw size={16} className="text-stone animate-spin" />
                    ) : (
                      <>
                        <Upload size={16} style={{ color: "var(--stone)" }} />
                        <span className="text-[10px]" style={{ color: "var(--stone)" }}>Adicionar logo</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" multiple className="hidden"
                    disabled={uploadingLogo}
                    onChange={async (e) => {
                      for (const file of Array.from(e.target.files ?? [])) await handleUpload(file, "logo")
                      e.target.value = ""
                    }} />
                </label>
              </div>
            </div>

            {/* Branding Book */}
            <div>
              <FieldLabel tip="Manual da marca: PDF com paleta de cores, fontes, regras de uso do logo. Quanto mais completo, mais consistente o visual gerado.">
                Branding Book
              </FieldLabel>
              <p className="text-[11px] mb-3" style={{ color: "var(--stone)" }}>
                PDF ou imagens do manual da marca — paleta, tipografia, regras de uso. A IA usa para criar criativos consistentes.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {branding.map((img) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square"
                    style={{ background: "var(--ink-3)" }}>
                    {img.file_type?.includes("pdf") ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
                        <div className="text-2xl">📄</div>
                        <div className="text-[10px] truncate w-full text-center" style={{ color: "var(--stone)" }}>{img.file_name}</div>
                      </div>
                    ) : (
                      <img src={img.file_url} alt={img.file_name} className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => handleDeleteFile(img.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(214,64,69,0.85)" }}
                    >
                      <X size={11} className="text-white" />
                    </button>
                  </div>
                ))}
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl aspect-square transition-colors"
                    style={{ background: "var(--ink-3)", border: "2px dashed var(--border)" }}>
                    {uploadingBranding ? (
                      <RefreshCw size={16} className="text-stone animate-spin" />
                    ) : (
                      <>
                        <Upload size={16} style={{ color: "var(--stone)" }} />
                        <span className="text-[10px]" style={{ color: "var(--stone)" }}>Adicionar</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*,application/pdf" multiple className="hidden"
                    disabled={uploadingBranding}
                    onChange={async (e) => {
                      for (const file of Array.from(e.target.files ?? [])) await handleUpload(file, "brandingbook")
                      e.target.value = ""
                    }} />
                </label>
              </div>
              {branding.length === 0 && !uploadingBranding && (
                <p className="text-[11px] mt-2 text-center" style={{ color: "rgba(122,119,115,0.5)" }}>
                  Sem branding book — a IA vai gerar baseado nas descrições do briefing.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Generate CTA */}
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-xl"
        style={{ background: "rgba(214,64,69,0.06)", border: "1px solid rgba(214,64,69,0.18)" }}
      >
        <div className="p-2.5 rounded-lg" style={{ background: "rgba(214,64,69,0.12)" }}>
          <Sparkles size={16} className="text-signal" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold" style={{ color: "var(--cream)" }}>Gerar Conteúdo com IA</div>
          <div className="text-[11px]" style={{ color: "var(--stone)" }}>
            Claude vai criar {(brief.posting_frequency ?? 3) * 2} posts com copy, prompt de imagem e datas sugeridas.
            Salve o DNA antes de gerar.
          </div>
        </div>
        <button
          onClick={() => { handleSave().then(handleGenerate) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity flex-shrink-0"
          style={{ background: "var(--signal)" }}
        >
          <Sparkles size={13} />
          Gerar Agora
        </button>
      </div>

      {showModal && (
        <GenerateModal
          posts={genPosts}
          loading={genLoading}
          error={genError}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
