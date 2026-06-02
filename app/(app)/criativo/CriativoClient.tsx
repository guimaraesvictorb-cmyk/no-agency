"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSelectedClient } from "@/lib/context/ClientContext"
import LogoCluster from "@/components/ui/LogoCluster"
import {
  Mic, MicOff, Send, Sparkles, ChevronDown, ChevronUp,
  Calendar, Check, Copy, RefreshCw, ArrowLeft, Layers,
} from "lucide-react"
import type { Profile } from "@/lib/types"

// ─── Types ───────────────────────────────────────────────────────────────────

type ClientOption = { id: string; name: string; plan: string; status: string }

type CopyVariation = {
  headline: string
  corpo: string
  cta: string
  hashtags_post: string[]
  hashtags_comentario: string[]
}

type DesignBrief = {
  formato: string
  estilo: string
  paleta: string
  composicao: string
  imagem: string
  texto_criativo: string
  mood: string
  prompt_imagem: string
}

type GeneratedPost = {
  numero: number
  tipo: string
  objetivo: string
  plataforma: string
  data_sugerida: string
  conceito: string
  copy_a: CopyVariation
  copy_b?: CopyVariation
  copy_c?: CopyVariation
  design: DesignBrief
  saved?: boolean
}

type InterviewAnswers = {
  objetivo: string
  volume: string
  foco: string
  autoridade: string
  tom: string
}

// ─── Interview questions ──────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: "objetivo",
    text: "Qual o objetivo principal?",
    options: [
      { value: "leads",       label: "🎯 Captar clientes / leads" },
      { value: "awareness",   label: "📣 Alcance e awareness" },
      { value: "engajamento", label: "🔥 Engajamento e comunidade" },
      { value: "vendas",      label: "💰 Vender produto ou serviço" },
      { value: "autoridade",  label: "👑 Posicionamento e autoridade" },
    ],
  },
  {
    id: "volume",
    text: "Quantos posts no planejamento?",
    options: [
      { value: "6",  label: "📆 6 posts — 2 semanas"      },
      { value: "12", label: "📅 12 posts — 1 mês"         },
      { value: "20", label: "📊 20 posts — 1 mês intenso" },
      { value: "30", label: "🚀 30 posts — trimestre"     },
      { value: "36", label: "⚡ 36 posts — 3× por semana" },
    ],
  },
  {
    id: "foco",
    text: "Qual o foco do período?",
    options: [
      { value: "institucional", label: "🏛️ Posicionamento institucional" },
      { value: "produto",       label: "🛒 Produto ou serviço específico" },
      { value: "promocao",      label: "🎉 Promoção ou desconto"          },
      { value: "lancamento",    label: "🚀 Lançamento de novidade"         },
      { value: "captacao",      label: "🎯 Captação de leads"              },
    ],
  },
  {
    id: "autoridade",
    text: "Há quanto tempo a empresa está no mercado?",
    options: [
      { value: "menos_1", label: "🌱 Menos de 1 ano"   },
      { value: "1_3",     label: "📈 1 a 3 anos"       },
      { value: "4_7",     label: "💪 4 a 7 anos"       },
      { value: "8_15",    label: "🏆 8 a 15 anos"      },
      { value: "mais_15", label: "👑 Mais de 15 anos"  },
    ],
  },
  {
    id: "tom",
    text: "Tom da campanha?",
    options: [
      { value: "urgente",      label: "🔥 Urgente e direto"         },
      { value: "educativo",    label: "💡 Educativo e informativo"  },
      { value: "descontraido", label: "😊 Leve e descontraído"      },
      { value: "premium",      label: "💎 Premium e aspiracional"   },
      { value: "humano",       label: "🤝 Humano e próximo"         },
    ],
  },
]

// ─── TIPO badge colors ────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  educativo:    { label: "Educativo",   color: "var(--blue)",   bg: "rgba(59,130,246,0.12)"  },
  bastidores:   { label: "Bastidores",  color: "var(--amber)",  bg: "rgba(245,158,11,0.12)"  },
  prova_social: { label: "Prova Social",color: "var(--green)",  bg: "rgba(16,185,129,0.12)"  },
  pergunta:     { label: "Pergunta",    color: "#A78BFA",       bg: "rgba(167,139,250,0.12)" },
  autoridade:   { label: "Autoridade",  color: "var(--signal)", bg: "rgba(214,64,69,0.12)"   },
  oferta:       { label: "Oferta",      color: "var(--amber)",  bg: "rgba(245,158,11,0.12)"  },
  manifesto:    { label: "Manifesto",   color: "var(--signal)", bg: "rgba(214,64,69,0.12)"   },
}

function tipoBadge(tipo: string) {
  const cfg = TIPO_CONFIG[tipo] ?? { label: tipo, color: "var(--stone)", bg: "rgba(120,113,108,0.12)" }
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

// ─── Phone mockup ─────────────────────────────────────────────────────────────

function PhoneMockup({ post, variation }: { post: GeneratedPost; variation: "a" | "b" | "c" }) {
  const copy = variation === "a" ? post.copy_a : variation === "b" ? post.copy_b : post.copy_c
  if (!copy) return null

  const isStories = post.design.formato === "1080x1920"

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden rounded-2xl"
      style={{
        width: isStories ? "100px" : "140px",
        height: isStories ? "178px" : "140px",
        background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
        border: "2px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header bar */}
      <div className="flex items-center gap-1 px-2 py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-3.5 h-3.5 rounded-full bg-signal/80 flex items-center justify-center text-[6px] font-bold text-white">
          {post.plataforma === "facebook" ? "f" : "ig"}
        </div>
        <span className="text-[7px] text-white/60 font-medium truncate">
          {post.plataforma === "facebook" ? "facebook" : "instagram"}
        </span>
      </div>

      {/* Post preview area */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-2 py-2 gap-1"
        style={{ minHeight: isStories ? "130px" : "90px" }}>
        {/* Color mood overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(circle at 50% 30%, var(--signal), transparent 70%)" }} />

        {/* Headline preview */}
        <p className="relative text-[7px] text-white font-bold text-center leading-tight z-10 line-clamp-3">
          {copy.headline}
        </p>

        {/* CTA chip */}
        <div className="relative z-10 mt-auto px-2 py-0.5 rounded-full text-[6px] font-bold text-white"
          style={{ background: "var(--signal)" }}>
          {copy.cta.split(" ").slice(0, 3).join(" ")}
        </div>
      </div>

      {/* Format badge */}
      <div className="absolute top-1.5 right-1.5 text-[6px] font-bold px-1 py-0.5 rounded"
        style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.5)" }}>
        {post.design.formato}
      </div>
    </div>
  )
}

// ─── Copy card ────────────────────────────────────────────────────────────────

function CopyCard({ copy, label }: { copy: CopyVariation; label: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const text = `${copy.headline}\n\n${copy.corpo}\n\n${copy.cta}\n\n${copy.hashtags_post.join(" ")}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-stone uppercase tracking-widest">Variação {label}</span>
        <button onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-stone hover:text-white transition-colors">
          {copied ? <Check size={11} className="text-green" /> : <Copy size={11} />}
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>

      {/* Headline */}
      <div className="px-4 py-3 rounded-lg"
        style={{ background: "var(--ink-3)", borderLeft: "3px solid var(--signal)" }}>
        <div className="text-[9px] text-stone uppercase tracking-wide mb-1">Gancho</div>
        <p className="text-[13px] font-bold text-white leading-snug">{copy.headline}</p>
      </div>

      {/* Body */}
      <div className="px-4 py-3 rounded-lg" style={{ background: "var(--ink-3)" }}>
        <div className="text-[9px] text-stone uppercase tracking-wide mb-2">Copy</div>
        <p className="text-[12px] text-white/90 leading-relaxed whitespace-pre-line">{copy.corpo}</p>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-stone uppercase tracking-wide">CTA:</span>
        <span className="text-[12px] font-semibold text-signal">{copy.cta}</span>
      </div>

      {/* Hashtags */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap gap-1">
          {copy.hashtags_post.map((h) => (
            <span key={h} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(214,64,69,0.1)", color: "var(--signal)" }}>
              {h}
            </span>
          ))}
        </div>
        <div className="text-[9px] text-stone/50">
          No 1º comentário: {copy.hashtags_comentario.join(" ")}
        </div>
      </div>
    </div>
  )
}

// ─── Design brief accordion ───────────────────────────────────────────────────

function DesignBriefAccordion({ design }: { design: DesignBrief }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function copyPrompt() {
    navigator.clipboard.writeText(design.prompt_imagem)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-ink-3 transition-colors"
        style={{ background: "var(--ink-3)" }}
      >
        <div className="flex items-center gap-2">
          <Layers size={13} className="text-stone" />
          <span className="text-[12px] font-semibold text-white">Briefing de Design</span>
        </div>
        {open ? <ChevronUp size={14} className="text-stone" /> : <ChevronDown size={14} className="text-stone" />}
      </button>

      {open && (
        <div className="px-4 py-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)" }}>
          {[
            { label: "Formato",     value: design.formato    },
            { label: "Estilo",      value: design.estilo     },
            { label: "Paleta",      value: design.paleta     },
            { label: "Composição",  value: design.composicao },
            { label: "Imagem",      value: design.imagem     },
            { label: "Texto na arte", value: design.texto_criativo },
            { label: "Mood",        value: design.mood       },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-3">
              <span className="text-[10px] text-stone uppercase tracking-wide flex-shrink-0 w-20 pt-0.5">{label}</span>
              <span className="text-[12px] text-white/80 leading-snug flex-1">{value}</span>
            </div>
          ))}

          {/* Image prompt */}
          <div className="mt-3 rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between px-3 py-2"
              style={{ background: "rgba(214,64,69,0.08)", borderBottom: "1px solid var(--border)" }}>
              <span className="text-[10px] font-bold text-signal uppercase tracking-wide">
                Prompt p/ Geração de Imagem
              </span>
              <button onClick={copyPrompt}
                className="flex items-center gap-1 text-[10px] text-stone hover:text-white transition-colors">
                {copied ? <Check size={10} className="text-green" /> : <Copy size={10} />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <div className="px-3 py-2.5">
              <p className="text-[11px] text-white/70 italic leading-relaxed font-mono">{design.prompt_imagem}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  plan,
  onSave,
}: {
  post: GeneratedPost
  plan: string
  onSave: (post: GeneratedPost) => void
}) {
  const variations = plan === "starter" ? ["a"] : plan === "growth" ? ["a", "b"] : ["a", "b", "c"]
  const [activeVar, setActiveVar] = useState<"a" | "b" | "c">("a")
  const [saving, setSaving] = useState(false)

  const varLabels: Record<string, string> = {
    a: "A — Emocional",
    b: "B — Racional",
    c: "C — Prova Social",
  }

  async function handleSave() {
    setSaving(true)
    await onSave(post)
    setSaving(false)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "var(--ink-2)", border: `1px solid ${post.saved ? "var(--green)" : "var(--border)"}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bebas text-[16px] text-white flex-shrink-0"
            style={{ background: "rgba(214,64,69,0.15)" }}>
            {post.numero}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-white">Post {post.numero}</span>
              {tipoBadge(post.tipo)}
            </div>
            <div className="text-[10px] text-stone mt-0.5">
              📅 {new Date(post.data_sugerida).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
              {" · "}
              {post.plataforma === "instagram_facebook" ? "IG + FB" : post.plataforma}
            </div>
          </div>
        </div>

        {post.saved ? (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(16,185,129,0.1)" }}>
            <Check size={12} />
            No Planner
          </span>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-[11px] font-bold text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: "var(--signal)" }}
          >
            {saving ? <RefreshCw size={11} className="animate-spin" /> : <Calendar size={11} />}
            {saving ? "Salvando..." : "Add ao Planner"}
          </button>
        )}
      </div>

      {/* Conceito */}
      <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
        <div className="text-[9px] text-stone uppercase tracking-widest mb-1">Conceito</div>
        <p className="text-[12px] text-white/80 italic leading-snug">{post.conceito}</p>
      </div>

      {/* Main content: phone + copy */}
      <div className="flex gap-5 px-5 py-5 flex-1">
        {/* Phone mockup stack */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <PhoneMockup post={post} variation={activeVar} />
          {variations.length > 1 && (
            <div className="flex gap-1 justify-center">
              {variations.map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveVar(v as "a" | "b" | "c")}
                  className="w-6 h-1.5 rounded-full transition-all"
                  style={{ background: activeVar === v ? "var(--signal)" : "var(--border)" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Copy with variation tabs */}
        <div className="flex-1 min-w-0">
          {variations.length > 1 && (
            <div className="flex gap-1 mb-4">
              {variations.map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveVar(v as "a" | "b" | "c")}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                  style={activeVar === v
                    ? { background: "rgba(214,64,69,0.14)", border: "1px solid rgba(214,64,69,0.3)", color: "var(--cream)" }
                    : { background: "var(--ink-3)", border: "1px solid var(--border)", color: "var(--stone)" }
                  }
                >
                  {varLabels[v]}
                </button>
              ))}
            </div>
          )}

          {activeVar === "a" && post.copy_a && <CopyCard copy={post.copy_a} label="A — Emocional" />}
          {activeVar === "b" && post.copy_b && <CopyCard copy={post.copy_b} label="B — Racional" />}
          {activeVar === "c" && post.copy_c && <CopyCard copy={post.copy_c} label="C — Prova Social" />}
        </div>
      </div>

      {/* Design brief */}
      <div className="px-5 pb-5">
        <DesignBriefAccordion design={post.design} />
      </div>
    </div>
  )
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function GeneratingScreen({ clientName }: { clientName: string }) {
  const steps = [
    "Lendo DNA da marca...",
    "Definindo estratégia de conteúdo...",
    "Gerando hooks de alta conversão...",
    "Criando variações A/B/C...",
    "Montando briefings de design...",
    "Organizando cronograma...",
  ]
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s))
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-2 border-signal/20 absolute inset-0" />
        <div className="w-20 h-20 rounded-full border-2 border-t-signal animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <LogoCluster size={32} variant="red" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="font-bebas text-[28px] text-white">NOVA está trabalhando</h2>
        <p className="text-stone text-[13px]">Criando o planejamento de {clientName}...</p>
      </div>

      <div className="space-y-2 w-64">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3 transition-all duration-500"
            style={{ opacity: i <= step ? 1 : 0.2 }}>
            <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: i < step ? "var(--green)" : i === step ? "var(--signal)" : "var(--ink-3)" }}>
              {i < step
                ? <Check size={9} className="text-white" />
                : i === step
                ? <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                : <div className="w-1.5 h-1.5 rounded-full bg-stone" />
              }
            </div>
            <span className="text-[12px]" style={{ color: i <= step ? "var(--cream)" : "var(--stone)" }}>
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Interview chat ───────────────────────────────────────────────────────────

function InterviewChat({
  clientName,
  onComplete,
}: {
  clientName: string
  onComplete: (answers: InterviewAnswers) => void
}) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<InterviewAnswers>>({})
  const [listening, setListening] = useState(false)
  const [messages, setMessages] = useState<{ from: "nova" | "user"; text: string }[]>([
    { from: "nova", text: `Sou a NOVA, sua Diretora Criativa. Vou montar o planejamento de **${clientName}**.` },
    { from: "nova", text: QUESTIONS[0].text },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function startListening() {
    type RecognitionInstance = {
      lang: string; continuous: boolean; interimResults: boolean;
      onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      onerror: (() => void) | null; onend: (() => void) | null;
      start: () => void; stop: () => void;
    }
    type RecognitionCtor = { new(): RecognitionInstance }
    const w = window as unknown as Record<string, unknown>
    const Ctor = (w.SpeechRecognition || w.webkitSpeechRecognition) as RecognitionCtor | undefined
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = "pt-BR"
    recognition.continuous = false
    recognition.interimResults = false
    recognitionRef.current = recognition

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)[0][0].transcript.trim()
      if (!transcript) { setListening(false); return }
      // Try to match transcript to current question options
      const currentQ = QUESTIONS[step]
      const match = currentQ.options.find((o) =>
        o.label.toLowerCase().includes(transcript.toLowerCase()) ||
        transcript.toLowerCase().includes(o.value.toLowerCase())
      ) ?? currentQ.options[0]
      handleChoiceSelect(match.value, match.label)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
    setListening(true)
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  function handleChoiceSelect(value: string, label: string) {
    const key = QUESTIONS[step].id as keyof InterviewAnswers
    const newAnswers = { ...answers, [key]: value }
    setAnswers(newAnswers)
    setMessages((prev) => [...prev, { from: "user", text: label }])
    advance(newAnswers, step)
  }

  function advance(currentAnswers: Partial<InterviewAnswers>, currentStep: number) {
    const nextStep = currentStep + 1
    if (nextStep < QUESTIONS.length) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { from: "nova", text: QUESTIONS[nextStep].text }])
        setStep(nextStep)
      }, 350)
    } else {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          from: "nova",
          text: "Perfeito. Gerando o planejamento agora... ✨",
        }])
        setTimeout(() => onComplete(currentAnswers as InterviewAnswers), 900)
      }, 350)
    }
  }

  const isComplete = step >= QUESTIONS.length

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 160px)" }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-1 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
            {msg.from === "nova" && (
              <div className="w-8 h-8 rounded-full bg-signal flex items-center justify-center flex-shrink-0 mt-0.5">
                <LogoCluster size={18} variant="dark" />
              </div>
            )}
            <div
              className="px-4 py-3 rounded-2xl max-w-[85%] text-[13px] leading-relaxed whitespace-pre-line"
              style={msg.from === "nova"
                ? { background: "var(--ink-2)", border: "1px solid var(--border)", color: "var(--cream)", borderTopLeftRadius: 4 }
                : { background: "var(--signal)", color: "white", borderTopRightRadius: 4 }
              }
              dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
            />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Choice buttons */}
      {!isComplete && (
        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="grid grid-cols-1 gap-2">
            {QUESTIONS[step].options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChoiceSelect(opt.value, opt.label)}
                className="text-left px-4 py-3 rounded-xl text-[13px] text-white transition-all hover:border-signal"
                style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Progress + mic */}
          <div className="flex items-center gap-2 mt-3">
            {QUESTIONS.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all"
                style={{ background: i < step ? "var(--signal)" : i === step ? "rgba(214,64,69,0.4)" : "var(--ink-3)" }} />
            ))}
            <span className="text-[10px] text-stone">{step + 1}/{QUESTIONS.length}</span>
            <button
              onClick={listening ? stopListening : startListening}
              className="ml-1 p-1.5 rounded-lg transition-all"
              style={{
                background: listening ? "rgba(214,64,69,0.2)" : "transparent",
                border: `1px solid ${listening ? "var(--signal)" : "transparent"}`,
              }}
              title="Responder pelo microfone"
            >
              {listening
                ? <MicOff size={13} className="text-signal animate-pulse" />
                : <Mic size={13} className="text-stone/60 hover:text-stone" />
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type Stage = "interview" | "generating" | "results"

export default function CriativoClient({ profile, clients }: { profile: Profile; clients: ClientOption[] }) {
  const { client: selectedClient } = useSelectedClient()
  const [stage, setStage] = useState<Stage>("interview")
  const [posts, setPosts] = useState<GeneratedPost[]>([])
  const [error, setError] = useState<string | null>(null)
  const [brief, setBrief] = useState<Record<string, unknown> | null>(null)

  const activeClient = selectedClient ?? clients[0] ?? null

  // Load brief
  useEffect(() => {
    if (!activeClient?.id) return
    fetch(`/api/dna-brief?client_id=${activeClient.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.brief) setBrief(d.brief) })
      .catch(() => {})
  }, [activeClient?.id])

  const handleInterviewComplete = useCallback(async (answers: InterviewAnswers) => {
    setStage("generating")
    setError(null)

    try {
      const res = await fetch("/api/criativo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          answers,
          client_id: activeClient?.id,
          plano: activeClient?.plan ?? "pro",
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erro na geração")
      setPosts(json.posts ?? [])
      setStage("results")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro desconhecido")
      setStage("interview")
    }
  }, [brief, activeClient])

  async function handleSavePost(post: GeneratedPost) {
    if (!activeClient?.id) return
    try {
      const res = await fetch("/api/posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: activeClient.id,
          brief: {
            ...brief,
            platform: post.plataforma,
            posting_days: [],
            posting_frequency: 1,
          },
          posts_override: [{
            caption: `${post.copy_a.headline}\n\n${post.copy_a.corpo}\n\n${post.copy_a.cta}\n\n${post.copy_a.hashtags_post.join(" ")}`,
            image_prompt: post.design.prompt_imagem,
            scheduled_for: post.data_sugerida,
          }],
        }),
      })

      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => p.numero === post.numero ? { ...p, saved: true } : p)
        )
      }
    } catch {}
  }

  async function handleSaveAll() {
    for (const post of posts) {
      if (!post.saved) await handleSavePost(post)
    }
  }

  if (!activeClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="text-5xl">🎨</div>
        <h1 className="font-bebas text-[36px] text-white">Selecione um cliente</h1>
        <p className="text-stone text-[14px]">Use o seletor na barra lateral para escolher o cliente.</p>
      </div>
    )
  }

  const savedCount = posts.filter((p) => p.saved).length
  const plan = activeClient.plan ?? "pro"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {stage === "results" && (
              <button onClick={() => { setStage("interview"); setPosts([]) }}
                className="p-1.5 rounded-lg text-stone hover:text-white hover:bg-ink-3 transition-colors">
                <ArrowLeft size={16} />
              </button>
            )}
            <h1 className="font-bebas text-[40px] text-white leading-none">Criativo</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: "rgba(214,64,69,0.12)", border: "1px solid rgba(214,64,69,0.2)" }}>
              <LogoCluster size={14} variant="red" />
              <span className="text-[10px] font-bold text-signal uppercase tracking-widest">NOVA</span>
            </div>
          </div>
          <p className="text-[13px] text-stone ml-8">
            {stage === "interview" && `Entrevista criativa · ${activeClient.name}`}
            {stage === "generating" && "Gerando planejamento..."}
            {stage === "results" && `${posts.length} posts gerados · Plano ${plan.charAt(0).toUpperCase() + plan.slice(1)} · ${activeClient.name}`}
          </p>
        </div>

        {stage === "results" && (
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-stone">{savedCount}/{posts.length} no planner</span>
            <button
              onClick={handleSaveAll}
              disabled={savedCount === posts.length}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-bold text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              style={{ background: "var(--signal)" }}
            >
              <Calendar size={13} />
              Salvar todos no Planner
            </button>
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-[13px] flex items-center gap-3"
          style={{ background: "rgba(214,64,69,0.1)", border: "1px solid rgba(214,64,69,0.25)", color: "var(--signal)" }}>
          <Sparkles size={14} />
          {error}
          {error.includes("ANTHROPIC_API_KEY") && (
            <span className="ml-auto text-[11px] font-mono">Adicione ANTHROPIC_API_KEY no .env.local</span>
          )}
        </div>
      )}

      {/* Stage content */}
      {stage === "interview" && (
        <InterviewChat clientName={activeClient.name} onComplete={handleInterviewComplete} />
      )}

      {stage === "generating" && (
        <GeneratingScreen clientName={activeClient.name} />
      )}

      {stage === "results" && (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.numero}
              post={post}
              plan={plan}
              onSave={handleSavePost}
            />
          ))}
        </div>
      )}
    </div>
  )
}
