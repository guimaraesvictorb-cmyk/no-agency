"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Search, X, FileText, CalendarDays, Star } from "lucide-react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":       "Dashboard",
  "/historia":        "Sua História",
  "/calendario":      "Calendário Editorial",
  "/feedback":        "NPS & Feedback",
  "/relatorio":       "Relatório Semanal",
  "/midias-sociais":  "Mídias Sociais",
  "/pasta-de-midias": "Pasta de Mídias",
  "/criativo":        "Gerar Criativos",
  "/admin":           "Gestão de Clientes",
  "/configuracoes":   "Configurações",
}

type SearchResult = {
  id: string
  type: "post"
  title: string
  sub: string
}

type Notification = {
  id: string
  icon: React.ReactNode
  title: string
  sub: string
  time: string
}

export default function Topbar({ role }: { role: string }) {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? "No Agency"

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  // Close notifications on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Cmd+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true) }
      if (e.key === "Escape") { setSearchOpen(false); setNotifOpen(false) }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      const supabase = createClient()
      const { data: posts } = await supabase
        .from("posts")
        .select("id, caption, platform, status")
        .ilike("caption", `%${searchQuery}%`)
        .limit(6)
      setSearchResults(
        (posts ?? []).map((p) => ({
          id: p.id,
          type: "post" as const,
          title: p.caption.split("\n")[0].replace(/[*#]/g, "").slice(0, 60),
          sub: `${p.platform} · ${p.status}`,
        }))
      )
      setSearching(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load notifications
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const notifs: Notification[] = []

      const { data: pending } = await supabase
        .from("posts")
        .select("id, caption, created_at")
        .eq("status", "sent_for_approval")
        .order("created_at", { ascending: false })
        .limit(5)

      for (const p of pending ?? []) {
        notifs.push({
          id: p.id,
          icon: <FileText size={14} className="text-amber-400" />,
          title: "Post aguardando aprovação",
          sub: p.caption.split("\n")[0].replace(/[*#]/g, "").slice(0, 50),
          time: new Date(p.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        })
      }

      if (role === "admin") {
        const { data: nps } = await supabase
          .from("nps_responses")
          .select("id, score, comment, created_at")
          .order("created_at", { ascending: false })
          .limit(3)

        for (const n of nps ?? []) {
          notifs.push({
            id: `nps-${n.id}`,
            icon: <Star size={14} className="text-blue-400" />,
            title: `NPS recebido: ${n.score}/10`,
            sub: n.comment?.slice(0, 50) ?? "Sem comentário",
            time: new Date(n.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
          })
        }
      }

      setNotifications(notifs)
      setUnread(notifs.length)
    }
    load()
  }, [role])

  return (
    <>
      <header className="h-14 bg-ink-2/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
        <h1 className="text-sm font-semibold text-cream">{title}</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-stone hover:text-cream hover:bg-ink-3 transition-colors"
          >
            <Search size={14} />
            <span className="hidden sm:inline text-[11px]">Buscar</span>
            <kbd className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded font-mono text-stone/60"
              style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
              ⌘K
            </kbd>
          </button>

          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg text-stone hover:text-cream hover:bg-ink-3 transition-colors"
            >
              <Bell size={16} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-signal rounded-full" />
              )}
            </button>

            {notifOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-modal overflow-hidden"
                style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px solid var(--border)" }}>
                  <span className="text-[13px] font-semibold text-white">Notificações</span>
                  {unread > 0 && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(214,64,69,0.15)", color: "var(--signal)" }}>
                      {unread} novas
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-stone text-[12px]">Tudo em dia ✓</div>
                  ) : notifications.map((n) => (
                    <div key={n.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-ink-3 transition-colors"
                      style={{ borderBottom: "1px solid var(--border)" }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(255,255,255,0.06)" }}>
                        {n.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-white">{n.title}</div>
                        <div className="text-[11px] text-stone truncate">{n.sub}</div>
                      </div>
                      <span className="text-[10px] text-stone/50 flex-shrink-0">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
        >
          <div
            className="w-full max-w-xl rounded-2xl shadow-modal overflow-hidden mx-4"
            style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: "1px solid var(--border)" }}>
              <Search size={16} className="text-stone flex-shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar posts, clientes..."
                className="flex-1 bg-transparent text-[14px] text-white placeholder:text-stone focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-stone hover:text-white">
                  <X size={14} />
                </button>
              )}
              <kbd className="text-[10px] px-2 py-1 rounded font-mono text-stone"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                ESC
              </kbd>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {searching && (
                <div className="text-center py-6 text-stone text-[12px]">Buscando...</div>
              )}
              {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="text-center py-6 text-stone text-[12px]">Nenhum resultado encontrado</div>
              )}
              {!searching && searchResults.map((r) => (
                <a key={r.id} href="/calendario"
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-ink-3 transition-colors"
                  style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(214,64,69,0.12)" }}>
                    <FileText size={13} className="text-signal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-white truncate">{r.title}</div>
                    <div className="text-[11px] text-stone">{r.sub}</div>
                  </div>
                </a>
              ))}
              {!searchQuery && (
                <div className="px-4 py-4">
                  <div className="text-[10px] text-stone/60 uppercase tracking-widest mb-3">Navegar</div>
                  {[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Calendário Editorial", href: "/calendario" },
                    { label: "Feedback & NPS", href: "/feedback" },
                    { label: "Relatório Semanal", href: "/relatorio" },
                  ].map((item) => (
                    <a key={item.href} href={item.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 py-2 text-[13px] text-stone hover:text-white transition-colors">
                      <CalendarDays size={13} />
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
