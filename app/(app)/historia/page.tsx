"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Sparkles, Building2, Users, MessageCircle, Settings,
  Save, RefreshCw, CheckCircle, X, AlertCircle, ExternalLink,
  ImageIcon, Upload, Trash2,
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

// ─── Empty brief factory ──────────────────────────────────────────────────────

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

// ─── Modal de geração ─────────────────────────────────────────────────────────

function GenerateModal({
  posts,
  loading,
  error,
  onClose,
}: {
  posts: GeneratedPost[]
  loading: boolean
  error: string | null
  onClose: () => void
}) {
  const router = useRouter()
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(8px)" }}
      onClick={!loading ? onClose : undefined}
    >
      <div
        className="rounded-2xl p-6 w-full max-w-lg"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="flex flex-col items-center py-10 gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-signal/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-signal animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={20} className="text-signal" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-[15px] font-semibold text-white">Gerando conteúdo com IA...</div>
              <div className="text-[12px] text-stone">Claude está criando posts baseados no DNA da marca</div>
            </div>
          </div>
        )}

        {!loading && error && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-signal" />
                <span className="text-[13px] font-semibold text-white">Erro na geração</span>
              </div>
              <button onClick={onClose} className="text-stone hover:text-white"><X size={16} /></button>
            </div>
            <p className="text-[13px] text-stone mb-4">{error}</p>
            {error.includes("ANTHROPIC_API_KEY") && (
              <div className="p-3 rounded-lg text-[12px] text-amber-400 mb-4"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                Adicione a chave em <code className="font-mono">.env.local</code>:<br />
                <code className="font-mono text-[11px]">ANTHROPIC_API_KEY=sk-ant-...</code>
              </div>
            )}
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
                <CheckCircle size={16} className="text-green" />
                <span className="text-[13px] font-semibold text-white">
                  {posts.length} posts gerados e salvos!
                </span>
              </div>
              <button onClick={onClose} className="text-stone hover:text-white"><X size={16} /></button>
            </div>

            <div className="space-y-2 mb-5 max-h-72 overflow-y-auto">
              {posts.map((post, i) => (
                <div key={post.id} className="p-3 rounded-lg space-y-1.5"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-bold text-stone w-5 flex-shrink-0 mt-0.5">#{i + 1}</span>
                    <span className="text-[12px] text-white leading-snug flex-1">
                      {post.caption.split("\n")[0].slice(0, 120)}
                      {post.caption.length > 120 ? "..." : ""}
                    </span>
                  </div>
                  {post.scheduled_for && (
                    <div className="text-[10px] text-stone ml-7">
                      📅 {new Date(post.scheduled_for).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                    </div>
                  )}
                  {post.image_prompt && (
                    <div className="text-[10px] text-stone/60 ml-7 italic truncate">
                      🖼 {post.image_prompt.slice(0, 80)}...
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[12px] text-stone mb-4">
              Os posts foram adicionados ao Calendário Editorial com status "gerado" — revise antes de enviar para aprovação.
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
      className="w-full px-4 py-3 text-[13px] text-white placeholder:text-stone/40 rounded-lg outline-none transition-colors"
      style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
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
        className="w-full px-4 py-3 text-[13px] text-white placeholder:text-stone/40 rounded-lg outline-none resize-none transition-colors"
        style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
      />
      {hint && <p className="text-[11px] text-stone mt-1">{hint}</p>}
    </div>
  )
}

// ─── Blocks config ────────────────────────────────────────────────────────────

const BLOCKS = [
  { id: "empresa",     label: "Empresa",      icon: Building2,     accent: "var(--signal)" },
  { id: "cliente",     label: "Cliente Ideal", icon: Users,         accent: "var(--blue)"   },
  { id: "tom",         label: "Tom de Voz",    icon: MessageCircle, accent: "var(--green)"  },
  { id: "operacional", label: "Operacional",   icon: Settings,      accent: "var(--amber)"  },
  { id: "arquivos",    label: "Arquivos",      icon: ImageIcon,     accent: "#A855F7"        },
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

  // Media files state
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)

  // Generate state
  const [genLoading, setGenLoading] = useState(false)
  const [genPosts, setGenPosts] = useState<GeneratedPost[]>([])
  const [genError, setGenError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const loadMediaFiles = useCallback(async (clientId: string) => {
    try {
      const res = await fetch(`/api/upload/asset?client_id=${clientId}`)
      const data = await res.json()
      if (data.files) setMediaFiles(data.files)
    } catch {}
  }, [])

  async function handleUpload(file: File, tag: "logo" | "biblioteca") {
    if (!selectedClient) return
    const setUploading = tag === "logo" ? setUploadingLogo : setUploadingImg
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
    await fetch("/api/upload/asset", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media_file_id: id, client_id: selectedClient.id }),
    })
    setMediaFiles((prev) => prev.filter((f) => f.id !== id))
  }

  // Load brief when client changes
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
      if (!res.ok) {
        setGenError(json.error ?? "Erro na geração")
      } else {
        setGenPosts(json.posts ?? [])
      }
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

  // No client selected
  if (!selectedClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="text-5xl">🏢</div>
        <h1 className="font-bebas text-[36px] text-white">Selecione um cliente</h1>
        <p className="text-stone text-[14px] max-w-sm">
          Use o seletor na barra lateral para escolher o cliente que deseja configurar.
        </p>
      </div>
    )
  }

  if (loadingBrief) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-stone">
          <RefreshCw size={18} className="animate-spin" />
          <span className="text-[13px]">Carregando DNA da marca...</span>
        </div>
      </div>
    )
  }

  if (!brief) return null

  const activeBlockData = BLOCKS.find((b) => b.id === activeBlock)!

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Sua História</h1>
          <p className="text-[13px] text-stone">
            {selectedClient.name} · DNA da marca para geração de conteúdo com IA
            {(brief.version ?? 0) > 0 && (
              <span className="text-white/40 ml-1">v{brief.version}</span>
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
            {activeBlock === "empresa"     && "Bloco 1 — Empresa"}
            {activeBlock === "cliente"     && "Bloco 2 — Cliente Ideal"}
            {activeBlock === "tom"         && "Bloco 3 — Tom de Voz"}
            {activeBlock === "operacional" && "Bloco 4 — Operacional"}
            {activeBlock === "arquivos"    && "Bloco 5 — Arquivos da Marca"}
          </span>
        </div>

        {activeBlock === "empresa" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Nome da Empresa</FieldLabel>
                <TextInput value={brief.company_name ?? ""} onChange={(v) => update("company_name", v)} />
              </div>
              <div>
                <FieldLabel>Segmento / Nicho</FieldLabel>
                <TextInput value={brief.segment ?? ""} onChange={(v) => update("segment", v)} placeholder="Ex: Construção civil, Moda feminina" />
              </div>
              <div>
                <FieldLabel>Cidade</FieldLabel>
                <TextInput value={brief.city ?? ""} onChange={(v) => update("city", v)} placeholder="Ex: São Paulo, SP" />
              </div>
            </div>
            <div>
              <FieldLabel>Diferenciais Competitivos</FieldLabel>
              <TextArea
                value={brief.differentials ?? ""}
                onChange={(v) => update("differentials", v)}
                rows={4}
                hint="O que torna sua empresa única? Tecnologia, atendimento, preço, localização?"
              />
            </div>
          </div>
        )}

        {activeBlock === "cliente" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Faixa Etária</FieldLabel>
                <TextInput value={brief.ideal_client_age ?? ""} onChange={(v) => update("ideal_client_age", v)} placeholder="Ex: 28-45 anos" />
              </div>
              <div>
                <FieldLabel>Gênero</FieldLabel>
                <TextInput value={brief.ideal_client_gender ?? ""} onChange={(v) => update("ideal_client_gender", v)} placeholder="Masculino, Feminino ou Qualquer" />
              </div>
            </div>
            <div>
              <FieldLabel>Maior Dor / Problema</FieldLabel>
              <TextArea
                value={brief.ideal_client_pain ?? ""}
                onChange={(v) => update("ideal_client_pain", v)}
                rows={3}
                hint="O que mantém seu cliente acordado à noite? O que eles mais temem?"
              />
            </div>
            <div>
              <FieldLabel>Sonho / Desejo</FieldLabel>
              <TextArea
                value={brief.ideal_client_dream ?? ""}
                onChange={(v) => update("ideal_client_dream", v)}
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
                {(brief.tone_adjectives ?? []).map((adj) => (
                  <button
                    key={adj}
                    onClick={() => update("tone_adjectives", (brief.tone_adjectives ?? []).filter((a) => a !== adj))}
                    className="text-[11px] font-semibold px-3 py-1 rounded-full transition-colors"
                    style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "var(--green)" }}
                  >
                    {adj} ×
                  </button>
                ))}
              </div>
              <input
                className="w-full px-4 py-3 text-[13px] text-white placeholder:text-stone/40 rounded-lg outline-none transition-colors"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
                placeholder="Adicionar adjetivo (Enter para confirmar)..."
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
            </div>
            <div>
              <FieldLabel>O que evitar no tom</FieldLabel>
              <TextArea value={brief.tone_avoid ?? ""} onChange={(v) => update("tone_avoid", v)} rows={2} hint="Gírias, palavrões, termos técnicos demais, humor inadequado..." />
            </div>
            <div>
              <FieldLabel>Exemplo de frase ideal da marca</FieldLabel>
              <TextArea
                value={brief.tone_example ?? ""}
                onChange={(v) => update("tone_example", v)}
                rows={3}
                hint="Uma frase que capture perfeitamente o tom que você quer transmitir."
              />
            </div>
          </div>
        )}

        {activeBlock === "arquivos" && (() => {
          const logos = mediaFiles.filter((f) => f.tags.includes("logo"))
          const biblioteca = mediaFiles.filter((f) => f.tags.includes("biblioteca"))
          return (
            <div className="space-y-6">
              {/* Logos */}
              <div>
                <FieldLabel>Logos da Marca</FieldLabel>
                <p className="text-[11px] text-stone mb-3">
                  Envie todas as variações — cor, versão horizontal, quadrado, fundo claro/escuro. PNG, SVG ou JPG.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {logos.map((logo) => (
                    <div key={logo.id} className="relative group rounded-xl overflow-hidden flex flex-col"
                      style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                      <div className="aspect-square flex items-center justify-center p-3"
                        style={{ background: "rgba(255,255,255,0.04)" }}>
                        <img
                          src={logo.file_url}
                          alt={logo.file_name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="px-2 py-1.5">
                        <div className="text-[10px] text-stone truncate">{logo.file_name}</div>
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
                  {/* Add logo button */}
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl aspect-square transition-colors"
                      style={{ background: "var(--ink-3)", border: "2px dashed var(--border)" }}>
                      {uploadingLogo ? (
                        <RefreshCw size={16} className="text-stone animate-spin" />
                      ) : (
                        <>
                          <Upload size={16} className="text-stone" />
                          <span className="text-[10px] text-stone">Adicionar logo</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      multiple
                      className="hidden"
                      disabled={uploadingLogo}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files ?? [])
                        for (const file of files) {
                          await handleUpload(file, "logo")
                        }
                        e.target.value = ""
                      }}
                    />
                  </label>
                </div>
                {logos.length === 0 && !uploadingLogo && (
                  <p className="text-[11px] text-stone/50 mt-2 text-center">
                    Sem logos — a IA vai descrever o visual no briefing de design.
                  </p>
                )}
              </div>

              {/* Biblioteca */}
              <div>
                <FieldLabel>Biblioteca de Imagens</FieldLabel>
                <p className="text-[11px] text-stone mb-3">
                  Fotos do produto, equipe, espaço — a IA prioriza essas imagens ao gerar criativos.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {biblioteca.map((img) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square"
                      style={{ background: "var(--ink-3)" }}>
                      <img
                        src={img.file_url}
                        alt={img.file_name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleDeleteFile(img.id)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(214,64,69,0.85)" }}
                      >
                        <X size={11} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {/* Add more button */}
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl aspect-square transition-colors"
                      style={{ background: "var(--ink-3)", border: "2px dashed var(--border)" }}>
                      {uploadingImg ? (
                        <RefreshCw size={16} className="text-stone animate-spin" />
                      ) : (
                        <>
                          <Upload size={16} className="text-stone" />
                          <span className="text-[10px] text-stone">Adicionar</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploadingImg}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files ?? [])
                        for (const file of files) {
                          await handleUpload(file, "biblioteca")
                        }
                        e.target.value = ""
                      }}
                    />
                  </label>
                </div>
                {biblioteca.length === 0 && !uploadingImg && (
                  <p className="text-[11px] text-stone/50 mt-2 text-center">
                    Sem imagens — a IA vai gerar tudo com prompts detalhados.
                  </p>
                )}
              </div>
            </div>
          )
        })()}

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
                    style={(brief.posting_days ?? []).includes(key)
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
                <FieldLabel>Posts por semana</FieldLabel>
                <input
                  type="number" min={1} max={7}
                  value={brief.posting_frequency ?? 3}
                  onChange={(e) => update("posting_frequency", parseInt(e.target.value))}
                  className="w-full px-4 py-3 text-[13px] text-white rounded-lg outline-none transition-colors"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
                />
              </div>
              <div>
                <FieldLabel>Plataforma</FieldLabel>
                <select
                  value={brief.platform ?? "instagram_facebook"}
                  onChange={(e) => update("platform", e.target.value as SocialPlatform)}
                  className="w-full px-4 py-3 text-[13px] text-white rounded-lg outline-none transition-colors"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
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
                {(brief.content_themes ?? []).map((theme) => (
                  <span key={theme}
                    className="flex items-center gap-1 text-[11px] px-3 py-1 rounded-full"
                    style={{ background: "var(--ink-3)", border: "1px solid var(--border)", color: "var(--cream)" }}>
                    {theme}
                    <button
                      onClick={() => update("content_themes", (brief.content_themes ?? []).filter((t) => t !== theme))}
                      className="text-stone hover:text-signal ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addTheme() }}
                  className="flex-1 px-4 py-3 text-[13px] text-white placeholder:text-stone/40 rounded-lg outline-none transition-colors"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
                  placeholder="Novo tema... (Enter para adicionar)"
                />
                <button onClick={addTheme}
                  className="px-4 py-3 rounded-lg text-[12px] font-semibold text-white transition-colors"
                  style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                  + Adicionar
                </button>
              </div>
            </div>

            <div>
              <FieldLabel>Notas para a IA</FieldLabel>
              <TextArea
                value={brief.ai_notes ?? ""}
                onChange={(v) => update("ai_notes", v)}
                rows={3}
                hint="Instruções especiais: produtos em destaque, datas importantes, o que NÃO mencionar..."
              />
            </div>
          </div>
        )}
      </div>

      {/* AI Generate CTA */}
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-xl"
        style={{ background: "rgba(214,64,69,0.08)", border: "1px solid rgba(214,64,69,0.22)" }}
      >
        <div className="p-2.5 rounded-lg" style={{ background: "rgba(214,64,69,0.15)" }}>
          <Sparkles size={16} className="text-signal" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-white">Gerar Conteúdo com IA</div>
          <div className="text-[11px] text-stone">
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
