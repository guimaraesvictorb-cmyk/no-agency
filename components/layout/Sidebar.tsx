"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn, getInitials } from "@/lib/utils"
import LogoCluster from "@/components/ui/LogoCluster"
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  Star,
  BarChart3,
  Share2,
  Images,
  LogOut,
} from "lucide-react"

const NAV = [
  {
    section: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: "2" },
      { href: "/historia", label: "Sua História", icon: Sparkles, pill: "85%" },
      { href: "/calendario", label: "Calendário Editorial", icon: CalendarDays, badge: "3" },
      { href: "/feedback", label: "Feedback & NPS", icon: Star },
    ],
  },
  {
    section: "Relatórios",
    items: [
      { href: "/relatorio", label: "Relatório Semanal", icon: BarChart3 },
    ],
  },
  {
    section: "Configurações",
    items: [
      { href: "/midias-sociais", label: "Mídias Sociais", icon: Share2 },
      { href: "/pasta-de-midias", label: "Pasta de Mídias", icon: Images },
    ],
  },
]

const CLIENTS = [
  { id: "client-001", name: "SLR Engenharia", plan: "Growth", renewal: "01 Dez 2026" },
  { id: "client-002", name: "SLR Properties", plan: "Growth", renewal: "01 Dez 2026" },
]

export default function Sidebar({ userName = "Victor G." }: { userName?: string }) {
  const pathname = usePathname()
  const [activeClient, setActiveClient] = useState(CLIENTS[0])
  const [showClientMenu, setShowClientMenu] = useState(false)

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-30"
      style={{ background: "var(--ink-2)", borderRight: "1px solid var(--border)" }}>

      {/* Brand */}
      <div className="px-5 py-6 flex items-center gap-2.5"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <LogoCluster size={28} variant="dark" />
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1 text-white font-bold text-[13px]">
            NO <span className="w-1 h-1 rounded-full bg-signal inline-block" />
          </div>
          <div className="text-white font-light text-[13px]">AGENCY</div>
          <div className="text-stone text-[9px] uppercase tracking-widest mt-0.5">AI-Powered</div>
        </div>
      </div>

      {/* User info */}
      <div className="px-5 py-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="w-[38px] h-[38px] rounded-full bg-signal flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {getInitials(userName)}
        </div>
        <div className="overflow-hidden">
          <div className="text-[13px] font-semibold text-white truncate">{userName}</div>
          <div className="text-[10px] text-stone tracking-wide">Instagram · Facebook</div>
        </div>
      </div>

      {/* Client / Plan badge */}
      <div className="px-3 py-3 relative" style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => setShowClientMenu(!showClientMenu)}
          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-ink-3 transition-colors"
          style={{ background: "rgba(214,64,69,0.10)", border: "1px solid rgba(214,64,69,0.22)" }}
        >
          <div className="text-[9px] text-signal uppercase tracking-[1.5px] font-semibold">Plano ativo</div>
          <div className="text-[13px] font-bold text-white mt-0.5 flex items-center justify-between">
            {activeClient.name}
            <svg className={cn("w-3 h-3 text-stone transition-transform", showClientMenu && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="text-[10px] text-stone mt-0.5">{activeClient.plan} · Renova {activeClient.renewal}</div>
        </button>

        {showClientMenu && (
          <div className="absolute left-3 right-3 top-full mt-1 rounded-xl shadow-modal overflow-hidden z-50"
            style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
            {CLIENTS.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActiveClient(c); setShowClientMenu(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-ink-4 transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-full bg-signal/20 flex items-center justify-center text-signal text-[10px] font-bold flex-shrink-0">
                  {getInitials(c.name)}
                </div>
                <span className="text-[12px] font-medium text-white">{c.name}</span>
                {activeClient.id === c.id && <span className="ml-auto text-signal text-xs">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar space-y-0.5">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <div className="text-[9px] text-stone/60 uppercase tracking-[2px] font-semibold px-2 py-3">
              {section}
            </div>
            {items.map(({ href, label, icon: Icon, badge, pill }) => {
              const active = pathname === href || pathname.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150 relative mb-0.5",
                    active
                      ? "text-white"
                      : "text-stone hover:text-white hover:bg-ink-3"
                  )}
                  style={active ? { background: "rgba(214,64,69,0.14)" } : {}}
                >
                  {active && (
                    <span className="absolute left-0 top-[25%] bottom-[25%] w-[3px] bg-signal rounded-r-sm" />
                  )}
                  <Icon size={16} className={active ? "text-signal" : "text-stone"} />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="bg-signal text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                  {pill && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(245,158,11,0.15)", color: "var(--amber)" }}>
                      {pill}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
        <button className="flex items-center gap-2 text-[12px] text-stone hover:text-white transition-colors">
          <LogOut size={14} />
          Sair da conta
        </button>
      </div>
    </aside>
  )
}
