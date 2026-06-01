"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { mockPosts, mockClients } from "@/lib/mock-data"
import type { Post } from "@/lib/types"

function NewPostModal({ onClose, onAdd }: { onClose: () => void; onAdd: (post: Post) => void }) {
  const [clientId, setClientId] = useState(mockClients[0].id)
  const [caption, setCaption] = useState("")
  const [platform, setPlatform] = useState("instagram_facebook")
  const [date, setDate] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!caption.trim() || !date) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    const newPost: Post = {
      id: `post-new-${Date.now()}`,
      client_id: clientId,
      batch_id: null,
      caption,
      platform: platform as any,
      status: "draft",
      image_url: null,
      scheduled_for: new Date(date).toISOString(),
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
      style={{ background: "rgba(10,10,10,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="rounded-2xl p-6 w-full max-w-md"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="text-[15px] font-semibold text-white">Novo Post</div>
          <button onClick={onClose} className="text-stone hover:text-white"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-stone mb-2">Cliente</label>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)}
              className="w-full px-4 py-3 text-[13px] text-white rounded-lg outline-none"
              style={{ background: "var(--ink-3)", border: "1px solid var(--ink-border)" }}>
              {mockClients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-stone mb-2">Plataforma</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-3 text-[13px] text-white rounded-lg outline-none"
              style={{ background: "var(--ink-3)", border: "1px solid var(--ink-border)" }}>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="instagram_facebook">Instagram + Facebook</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-stone mb-2">Data de Agendamento</label>
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required
              className="w-full px-4 py-3 text-[13px] text-white rounded-lg outline-none"
              style={{ background: "var(--ink-3)", border: "1px solid var(--ink-border)", colorScheme: "dark" }} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-stone mb-2">Legenda</label>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} required rows={4}
              placeholder="Escreva a legenda do post..."
              className="w-full px-4 py-3 text-[13px] text-white placeholder:text-stone/40 rounded-lg outline-none resize-none"
              style={{ background: "var(--ink-3)", border: "1px solid var(--ink-border)" }} />
          </div>
          <button type="submit" disabled={saving || !caption.trim() || !date}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest text-white transition-all disabled:opacity-50"
            style={{ background: "var(--signal)" }}>
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
            ) : (
              <><Plus size={13} /> Criar Post</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES_PT = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
]
const DAY_NAMES = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  draft:             { bg: "rgba(58,58,58,0.7)",      text: "#8A8582", dot: "#3A3A3A" },
  generated:         { bg: "rgba(99,102,241,0.15)",   text: "#6366F1", dot: "#6366F1" },
  sent_for_approval: { bg: "rgba(245,158,11,0.15)",   text: "#F59E0B", dot: "#F59E0B" },
  approved:          { bg: "rgba(16,185,129,0.15)",   text: "#10B981", dot: "#10B981" },
  rejected:          { bg: "rgba(214,64,69,0.15)",    text: "#D64045", dot: "#D64045" },
  scheduled:         { bg: "rgba(99,102,241,0.15)",   text: "#6366F1", dot: "#6366F1" },
  published:         { bg: "rgba(16,185,129,0.15)",   text: "#10B981", dot: "#10B981" },
  auto_approved:     { bg: "rgba(16,185,129,0.15)",   text: "#10B981", dot: "#10B981" },
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  generated: "Gerado",
  sent_for_approval: "Aguardando",
  approved: "Aprovado",
  rejected: "Rejeitado",
  scheduled: "Agendado",
  published: "Publicado",
  auto_approved: "Auto-aprovado",
}

export default function CalendarioPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showNewPost, setShowNewPost] = useState(false)
  const [posts, setPosts] = useState(mockPosts)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-bebas text-[40px] text-white leading-none">Calendário Editorial</h1>
            <p className="text-[13px] text-stone">{MONTH_NAMES_PT[month]} {year}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth}
              className="p-2 rounded-lg text-stone hover:text-white transition-colors"
              style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextMonth}
              className="p-2 rounded-lg text-stone hover:text-white transition-colors"
              style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <button onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
          style={{ background: "var(--signal)" }}>
          <Plus size={13} />
          Novo Post
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {(["sent_for_approval","approved","scheduled","published"] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s].dot }} />
            <span className="text-[11px] text-stone">{STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
        {/* Day names */}
        <div className="grid grid-cols-7" style={{ borderBottom: "1px solid var(--border)" }}>
          {DAY_NAMES.map((d) => (
            <div key={d} className="py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-stone">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} className="min-h-[110px]" style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "rgba(10,10,10,0.3)" }} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const posts = postsByDay[day] ?? []
            const isToday = isCurrentMonth && day === today
            return (
              <div key={day} className="min-h-[110px] p-2"
                style={{
                  borderRight: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                  background: isToday ? "rgba(214,64,69,0.05)" : undefined,
                }}>
                <div className={`text-[11px] font-semibold mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "text-white" : "text-stone"}`}
                  style={isToday ? { background: "var(--signal)" } : {}}>
                  {day}
                </div>
                <div className="space-y-1">
                  {posts.slice(0, 2).map((post) => {
                    const sc = STATUS_COLORS[post.status] ?? STATUS_COLORS.draft
                    return (
                      <button key={post.id} onClick={() => setSelectedPost(post)} className="w-full text-left">
                        <div className="flex items-center gap-1 px-1.5 py-1 rounded-md transition-opacity hover:opacity-80"
                          style={{ background: sc.bg, border: `1px solid ${sc.dot}22` }}>
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc.dot }} />
                          <span className="text-[10px] truncate font-medium" style={{ color: sc.text }}>
                            {clientMap[post.client_id]?.split(" ")[1] ?? clientMap[post.client_id]}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                  {(postsByDay[day] ?? []).length > 2 && (
                    <div className="text-[10px] text-stone px-1">+{(postsByDay[day] ?? []).length - 2} mais</div>
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
          style={{ background: "rgba(10,10,10,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedPost(null)}>
          <div className="rounded-2xl p-6 max-w-md w-full"
            style={{ background: "var(--ink-2)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
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
                <div className="text-[11px] text-stone mt-1.5">{clientMap[selectedPost.client_id]}</div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-stone hover:text-white text-xl leading-none">×</button>
            </div>
            {selectedPost.image_url && (
              <img src={selectedPost.image_url} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
            )}
            <p className="text-[13px] text-white/90 leading-relaxed whitespace-pre-line">{selectedPost.caption}</p>
            {selectedPost.scheduled_for && (
              <div className="mt-3 text-[11px] text-stone">
                Agendado: {new Date(selectedPost.scheduled_for).toLocaleString("pt-BR")}
              </div>
            )}
          </div>
        </div>
      )}

      {showNewPost && (
        <NewPostModal
          onClose={() => setShowNewPost(false)}
          onAdd={(post) => setPosts((prev) => [...prev, post])}
        />
      )}
    </div>
  )
}
