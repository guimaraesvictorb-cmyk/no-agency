"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, X, AlertCircle, TrendingUp } from "lucide-react"
import { mockPosts, mockClients } from "@/lib/mock-data"
import type { Post } from "@/lib/types"

// ─── New special post modal ───────────────────────────────────────────────────

function NewPostModal({ day, month, year, onClose, onAdd }: {
  day: number
  month: number
  year: number
  onClose: () => void
  onAdd: (post: Post) => void
}) {
  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  const [type, setType] = useState<"data_comemorativa" | "conquista" | "oferta" | "outro">("data_comemorativa")
  const [caption, setCaption] = useState("")
  const [platform, setPlatform] = useState("instagram_facebook")
  const [saving, setSaving] = useState(false)

  const TYPE_OPTIONS = [
    { id: "data_comemorativa", label: "Data comemorativa",  emoji: "🎉" },
    { id: "conquista",         label: "Conquista / Marco",  emoji: "🏆" },
    { id: "oferta",            label: "Oferta especial",    emoji: "💎" },
    { id: "outro",             label: "Outro",              emoji: "✏️" },
  ] as const

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!caption.trim()) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    const newPost: Post = {
      id: `post-new-${Date.now()}`,
      client_id: mockClients[0].id,
      batch_id: null,
      caption: `[${TYPE_OPTIONS.find((t) => t.id === type)?.label}]\n${caption}`,
      platform: platform as Post["platform"],
      status: "draft",
      image_url: null,
      scheduled_for: new Date(`${dateStr}T12:00:00`).toISOString(),
      published_at: null,
      rejection_reason: null,
      image_prompt: null,
      ai_generation_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    onAdd(newPost)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="rounded-2xl p-6 w-full max-w-md shadow-modal"
        style={{ background: "var(--ink)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[15px] font-semibold" style={{ color: "var(--cream)" }}>Adicionar post especial</div>
            <div className="text-[11px] mt-0.5" style={{ color: "var(--stone)" }}>
              {new Date(`${dateStr}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>
          <button onClick={onClose} style={{ color: "var(--stone)" }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ color: "var(--stone)" }}>
              Tipo de post
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-medium text-left transition-all"
                  style={type === opt.id
                    ? { background: "rgba(214,64,69,0.10)", border: "1px solid rgba(214,64,69,0.28)", color: "var(--cream)" }
                    : { background: "var(--ink-2)", border: "1px solid var(--border)", color: "var(--stone)" }
                  }
                >
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ color: "var(--stone)" }}>
              Plataforma
            </label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-3 text-[13px] rounded-lg outline-none"
              style={{ background: "var(--ink-2)", border: "1px solid var(--border)", color: "var(--cream)" }}>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="instagram_facebook">Instagram + Facebook</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ color: "var(--stone)" }}>
              Descrição do post
            </label>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} required rows={3}
              placeholder="Descreva o que quer comunicar. A IA vai criar o post a partir disso."
              className="w-full px-4 py-3 text-[13px] rounded-lg outline-none resize-none"
              style={{ background: "var(--ink-2)", border: "1px solid var(--border)", color: "var(--cream)" }} />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg text-[11px] leading-snug"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", color: "var(--blue)" }}>
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            Este post vai entrar na esteira normal de geração e aprovação — você vai revisar antes de publicar.
          </div>

          <button type="submit" disabled={saving || !caption.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest text-white transition-all disabled:opacity-50"
            style={{ background: "var(--signal)" }}>
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adicionando...</>
            ) : (
              <><Plus size={13} /> Adicionar ao Calendário</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Approval warning ─────────────────────────────────────────────────────────

function ApprovalWarning({ daysLate }: { daysLate: number }) {
  if (daysLate < 3) return null
  const level = daysLate >= 7 ? "critical" : daysLate >= 5 ? "high" : "medium"
  const cfg = {
    medium:   { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.20)", text: "var(--amber)", msg: `${daysLate} dias sem aprovação — o atraso pode afetar o calendário desta semana.` },
    high:     { bg: "rgba(214,64,69,0.08)",  border: "rgba(214,64,69,0.20)",  text: "var(--signal)", msg: `${daysLate} dias sem aprovação — posts podem perder as datas ideais de publicação.` },
    critical: { bg: "rgba(214,64,69,0.12)", border: "rgba(214,64,69,0.30)",  text: "var(--signal)", msg: `Atenção: ${daysLate} dias sem aprovação. O calendário editorial está comprometido.` },
  }[level]
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <AlertCircle size={15} style={{ color: cfg.text, flexShrink: 0 }} />
      <span className="text-[12px] font-medium" style={{ color: cfg.text }}>{cfg.msg}</span>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate() }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay() }

const MONTH_NAMES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const DAY_NAMES = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  draft:             { bg: "rgba(122,119,115,0.12)", text: "var(--stone)",  dot: "var(--stone)"  },
  generated:         { bg: "rgba(99,102,241,0.12)",  text: "#6366F1",       dot: "#6366F1"        },
  sent_for_approval: { bg: "rgba(245,158,11,0.12)",  text: "var(--amber)",  dot: "var(--amber)"  },
  approved:          { bg: "rgba(16,185,129,0.12)",   text: "var(--green)",  dot: "var(--green)"  },
  rejected:          { bg: "rgba(214,64,69,0.12)",   text: "var(--signal)", dot: "var(--signal)" },
  scheduled:         { bg: "rgba(99,102,241,0.12)",  text: "#6366F1",       dot: "#6366F1"        },
  published:         { bg: "rgba(16,185,129,0.12)",   text: "var(--green)",  dot: "var(--green)"  },
}

const STATUS_LABELS: Record<string, string> = {
  draft:             "Rascunho",
  generated:         "Gerado",
  sent_for_approval: "Aguardando",
  approved:          "Aprovado",
  rejected:          "Rejeitado",
  scheduled:         "Agendado",
  published:         "Publicado",
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [newPostDay, setNewPostDay] = useState<number | null>(null)
  const [posts, setPosts] = useState(mockPosts)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay    = getFirstDayOfMonth(year, month)

  const postsByDay: Record<number, Post[]> = {}
  posts.forEach((post) => {
    if (!post.scheduled_for) return
    const d = new Date(post.scheduled_for)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      postsByDay[day] = [...(postsByDay[day] ?? []), post]
    }
  })

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const clientMap = Object.fromEntries(mockClients.map((c) => [c.id, c.name]))
  const today = now.getDate()
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month

  // Calculate days since oldest pending post
  const pendingPosts = posts.filter((p) => p.status === "sent_for_approval")
  const oldestPending = pendingPosts.reduce((oldest, p) => {
    const d = new Date(p.created_at).getTime()
    return d < oldest ? d : oldest
  }, Infinity)
  const daysPending = oldestPending === Infinity ? 0 : Math.floor((Date.now() - oldestPending) / 86400000)

  return (
    <div className="space-y-5">
      {/* Approval warning */}
      {daysPending >= 3 && <ApprovalWarning daysLate={daysPending} />}

      {/* Upgrade CTA */}
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl"
        style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
        <TrendingUp size={15} style={{ color: "#6366F1", flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <span className="text-[12px]" style={{ color: "var(--cream)" }}>
            Amplie seu alcance: adicione{" "}
            <span className="font-semibold">Instagram Stories, Reels e TikTok</span> ao seu plano.
          </span>
        </div>
        <button className="text-[11px] font-bold whitespace-nowrap px-3 py-1.5 rounded-lg text-white"
          style={{ background: "#6366F1" }}>
          Ver planos
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-bebas text-[40px] leading-none" style={{ color: "var(--cream)" }}>Calendário Editorial</h1>
            <p className="text-[13px]" style={{ color: "var(--stone)" }}>{MONTH_NAMES_PT[month]} {year}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth}
              className="p-2 rounded-lg transition-colors hover:bg-ink-3"
              style={{ background: "var(--ink-2)", border: "1px solid var(--border)", color: "var(--stone)" }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextMonth}
              className="p-2 rounded-lg transition-colors hover:bg-ink-3"
              style={{ background: "var(--ink-2)", border: "1px solid var(--border)", color: "var(--stone)" }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {(["sent_for_approval","approved","scheduled","published"] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s].dot }} />
            <span className="text-[11px]" style={{ color: "var(--stone)" }}>{STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
        {/* Day names */}
        <div className="grid grid-cols-7" style={{ borderBottom: "1px solid var(--border)" }}>
          {DAY_NAMES.map((d) => (
            <div key={d} className="py-3 text-center text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--stone)" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} className="min-h-[110px]"
              style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--ink-3)" }} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dayPosts = postsByDay[day] ?? []
            const isToday = isCurrentMonth && day === today
            return (
              <div key={day}
                className="min-h-[110px] p-2 group relative"
                style={{
                  borderRight: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                  background: isToday ? "rgba(214,64,69,0.04)" : undefined,
                }}>
                <div className="flex items-start justify-between mb-1.5">
                  <div className={`text-[11px] font-semibold w-6 h-6 flex items-center justify-center rounded-full`}
                    style={isToday
                      ? { background: "var(--signal)", color: "#ffffff" }
                      : { color: "var(--stone)" }
                    }>
                    {day}
                  </div>
                  {/* Per-day add button */}
                  <button
                    onClick={() => setNewPostDay(day)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded"
                    style={{ background: "rgba(214,64,69,0.10)", color: "var(--signal)" }}
                    title="Adicionar post especial"
                  >
                    <Plus size={11} />
                  </button>
                </div>
                <div className="space-y-1">
                  {dayPosts.slice(0, 2).map((post) => {
                    const sc = STATUS_COLORS[post.status] ?? STATUS_COLORS.draft
                    return (
                      <button key={post.id} onClick={() => setSelectedPost(post)} className="w-full text-left">
                        <div className="flex items-center gap-1 px-1.5 py-1 rounded-md transition-opacity hover:opacity-80"
                          style={{ background: sc.bg, border: `1px solid ${sc.dot}22` }}>
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc.dot }} />
                          <span className="text-[10px] truncate font-medium" style={{ color: sc.text }}>
                            {clientMap[post.client_id]?.split(" ")[0] ?? "Post"}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                  {dayPosts.length > 2 && (
                    <div className="text-[10px] px-1" style={{ color: "var(--stone)" }}>+{dayPosts.length - 2} mais</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Post detail modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedPost(null)}>
          <div className="rounded-2xl p-6 max-w-md w-full shadow-modal"
            style={{ background: "var(--ink)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: (STATUS_COLORS[selectedPost.status] ?? STATUS_COLORS.draft).bg,
                    color: (STATUS_COLORS[selectedPost.status] ?? STATUS_COLORS.draft).text,
                  }}>
                  {STATUS_LABELS[selectedPost.status]}
                </span>
                <div className="text-[11px] mt-1.5" style={{ color: "var(--stone)" }}>{clientMap[selectedPost.client_id]}</div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-xl leading-none" style={{ color: "var(--stone)" }}>×</button>
            </div>
            {selectedPost.image_url && (
              <img src={selectedPost.image_url} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
            )}
            <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: "var(--cream)" }}>{selectedPost.caption}</p>
            {selectedPost.scheduled_for && (
              <div className="mt-3 text-[11px]" style={{ color: "var(--stone)" }}>
                Agendado: {new Date(selectedPost.scheduled_for).toLocaleString("pt-BR")}
              </div>
            )}
            {selectedPost.status === "sent_for_approval" && (
              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white"
                  style={{ background: "var(--green)" }}>
                  ✓ Aprovar
                </button>
                <button className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white"
                  style={{ background: "var(--signal)" }}>
                  ✕ Recusar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New special post modal */}
      {newPostDay !== null && (
        <NewPostModal
          day={newPostDay}
          month={month}
          year={year}
          onClose={() => setNewPostDay(null)}
          onAdd={(post) => {
            setPosts((prev) => [...prev, post])
            setNewPostDay(null)
          }}
        />
      )}
    </div>
  )
}
