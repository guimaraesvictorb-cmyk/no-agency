"use client"

import { Bell, Search } from "lucide-react"
import { usePathname } from "next/navigation"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/historia": "Sua História",
  "/calendario": "Calendário Editorial",
  "/feedback": "NPS & Feedback",
  "/relatorio": "Relatório Semanal",
  "/midias-sociais": "Mídias Sociais",
  "/pasta-de-midias": "Pasta de Mídias",
}

export default function Topbar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? "No Agency"

  return (
    <header className="h-14 bg-ink-2/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-sm font-semibold text-cream">{title}</h1>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-stone hover:text-cream hover:bg-ink-3 transition-colors">
          <Search size={16} />
        </button>
        <button className="relative p-2 rounded-lg text-stone hover:text-cream hover:bg-ink-3 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-signal rounded-full" />
        </button>
      </div>
    </header>
  )
}
