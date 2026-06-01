"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { mockPosts, mockClients } from "@/lib/mock-data"
import { POST_STATUS_LABELS } from "@/lib/utils"
import type { Post } from "@/lib/types"

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES_PT = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
]
const DAY_NAMES = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]

function statusDot(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-ink-4",
    generated: "bg-blue",
    sent_for_approval: "bg-amber",
    approved: "bg-green",
    rejected: "bg-signal",
    scheduled: "bg-blue",
    published: "bg-green",
    auto_approved: "bg-green",
  }
  return colors[status] ?? "bg-stone"
}

export default function CalendarioPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const postsByDay: Record<number, Post[]> = {}
  mockPosts.forEach((post) => {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg text-stone hover:text-cream hover:bg-ink-3 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-base font-semibold text-cream min-w-[180px] text-center">
            {MONTH_NAMES_PT[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg text-stone hover:text-cream hover:bg-ink-3 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <Button size="sm">
          <Plus size={14} />
          Novo Post
        </Button>
      </div>

      <Card padding="none">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAY_NAMES.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-stone">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-r border-b border-border/50 bg-ink/30" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const posts = postsByDay[day] ?? []
            const isToday = isCurrentMonth && day === today
            return (
              <div
                key={day}
                className={`min-h-[100px] border-r border-b border-border/50 p-1.5 ${
                  isToday ? "bg-signal/5" : ""
                }`}
              >
                <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? "bg-signal text-cream" : "text-stone"
                }`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {posts.slice(0, 2).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="w-full text-left group"
                    >
                      <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-ink-3 hover:bg-ink-4 transition-colors border border-border/60">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot(post.status)}`} />
                        <span className="text-[10px] text-cream/80 truncate leading-tight">
                          {clientMap[post.client_id]}
                        </span>
                      </div>
                    </button>
                  ))}
                  {posts.length > 2 && (
                    <div className="text-[10px] text-stone px-1.5">+{posts.length - 2} mais</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Post detail side panel (modal-like) */}
      {selectedPost && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-ink-2 border border-border rounded-2xl p-6 max-w-md w-full shadow-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Badge variant={
                  selectedPost.status === "published" || selectedPost.status === "approved" ? "success" :
                  selectedPost.status === "sent_for_approval" ? "warning" :
                  selectedPost.status === "rejected" ? "error" : "info"
                }>
                  {POST_STATUS_LABELS[selectedPost.status]}
                </Badge>
                <div className="text-xs text-stone mt-1">{clientMap[selectedPost.client_id]}</div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-stone hover:text-cream">×</button>
            </div>
            {selectedPost.image_url && (
              <img src={selectedPost.image_url} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
            )}
            <p className="text-sm text-cream/90 leading-relaxed whitespace-pre-line">{selectedPost.caption}</p>
            {selectedPost.scheduled_for && (
              <div className="mt-3 text-xs text-stone">
                Agendado: {new Date(selectedPost.scheduled_for).toLocaleString("pt-BR")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
