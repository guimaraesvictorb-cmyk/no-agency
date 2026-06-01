"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Share2,
  Images,
  LogOut,
} from "lucide-react"
import Avatar from "@/components/ui/Avatar"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/historia", label: "Sua História", icon: Sparkles },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/feedback", label: "NPS & Feedback", icon: MessageSquare },
  { href: "/relatorio", label: "Relatório", icon: BarChart3 },
  { href: "/midias-sociais", label: "Mídias Sociais", icon: Share2 },
  { href: "/pasta-de-midias", label: "Pasta de Mídias", icon: Images },
]

const CLIENTS = [
  { id: "client-001", name: "SLR Engenharia" },
  { id: "client-002", name: "SLR Properties" },
]

interface SidebarProps {
  userName?: string
}

export default function Sidebar({ userName = "Victor G." }: SidebarProps) {
  const [activeClient, setActiveClient] = useState(CLIENTS[0])
  const [showClientMenu, setShowClientMenu] = useState(false)
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-ink-2 border-r border-border flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-signal rounded-lg flex items-center justify-center">
            <span className="text-cream font-bebas text-lg">N</span>
          </div>
          <div>
            <span className="font-bebas text-xl text-cream tracking-wide">NO AGENCY</span>
            <div className="text-[10px] text-stone -mt-0.5 font-medium">SOCIAL IA</div>
          </div>
        </div>
      </div>

      {/* Client selector */}
      <div className="px-3 py-3 border-b border-border relative">
        <button
          onClick={() => setShowClientMenu(!showClientMenu)}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-ink-3 transition-colors group"
        >
          <Avatar name={activeClient.name} size="sm" />
          <div className="flex-1 text-left">
            <div className="text-xs font-medium text-cream truncate">{activeClient.name}</div>
            <div className="text-[10px] text-stone">Cliente ativo</div>
          </div>
          <svg className={cn("w-3.5 h-3.5 text-stone transition-transform", showClientMenu && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showClientMenu && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-ink-3 border border-border rounded-xl shadow-modal z-50 overflow-hidden">
            {CLIENTS.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActiveClient(c); setShowClientMenu(false) }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-ink-4 transition-colors text-left",
                  activeClient.id === c.id && "bg-ink-4"
                )}
              >
                <Avatar name={c.name} size="sm" />
                <span className="text-xs font-medium text-cream">{c.name}</span>
                {activeClient.id === c.id && <span className="ml-auto text-signal text-xs">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-ink-3 text-cream border border-border"
                  : "text-stone hover:text-cream hover:bg-ink-3"
              )}
            >
              <Icon
                size={16}
                className={cn(active ? "text-signal" : "text-stone group-hover:text-cream")}
              />
              {label}
              {href === "/dashboard" && (
                <span className="ml-auto bg-signal text-cream text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  2
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-ink-3 transition-colors cursor-pointer group">
          <Avatar name={userName} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-cream truncate">{userName}</div>
            <div className="text-[10px] text-stone">Manager</div>
          </div>
          <button
            className="text-stone hover:text-signal transition-colors p-1"
            title="Sair"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
