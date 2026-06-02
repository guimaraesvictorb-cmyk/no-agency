"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn, getInitials } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { updateProfile } from "@/app/actions/profile"
import { useSelectedClient } from "@/lib/context/ClientContext"
import LogoCluster from "@/components/ui/LogoCluster"
import type { Profile } from "@/lib/types"

type ClientOption = { id: string; name: string; plan: string; status: string }
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  Star,
  BarChart3,
  Share2,
  Images,
  LogOut,
  Users,
  Pencil,
  X,
  Check,
  ShieldCheck,
  Settings,
  Wand2,
} from "lucide-react"

// ─── Navigation config ───────────────────────────────────────────────────────

const NAV_ADMIN = [
  {
    section: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard",     icon: LayoutDashboard },
      { href: "/feedback",  label: "Feedback & NPS", icon: Star },
    ],
  },
  {
    section: "Relatórios",
    items: [
      { href: "/relatorio", label: "Relatório Semanal", icon: BarChart3 },
    ],
  },
  {
    section: "Integrações",
    items: [
      { href: "/midias-sociais", label: "Mídias Sociais", icon: Share2 },
    ],
  },
  {
    section: "Gestão",
    items: [
      { href: "/admin",         label: "Clientes",      icon: Users    },
      { href: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
]

const NAV_CLIENT = [
  {
    section: "Principal",
    items: [
      { href: "/dashboard",  label: "Dashboard",       icon: LayoutDashboard },
      { href: "/historia",   label: "Minha História",  icon: Sparkles        },
      { href: "/criativo",   label: "Gerar Criativos", icon: Wand2           },
      { href: "/calendario", label: "Calendário",      icon: CalendarDays    },
      { href: "/relatorio",  label: "Relatório",       icon: BarChart3       },
    ],
  },
  {
    section: "Integrações",
    items: [
      { href: "/midias-sociais", label: "Mídias Sociais", icon: Share2 },
    ],
  },
  {
    section: "Mídia",
    items: [
      { href: "/pasta-de-midias", label: "Pasta de Mídias", icon: Images   },
      { href: "/configuracoes",   label: "Configurações",   icon: Settings },
    ],
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function Sidebar({ profile, clients = [] }: { profile: Profile; clients?: ClientOption[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState(profile.full_name ?? "")
  const [isPending, startTransition] = useTransition()
  const [showClientMenu, setShowClientMenu] = useState(false)
  const { client: selectedClient, setClient } = useSelectedClient()

  const isAdmin = profile.role === "admin"
  const NAV = isAdmin ? NAV_ADMIN : NAV_CLIENT
  const displayName = profile.full_name ?? profile.email.split("@")[0]

  if (!selectedClient && clients.length > 0 && typeof window !== "undefined") {
    setClient(clients[0])
  }

  const activeClient = selectedClient ?? (clients[0] ?? null)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  function handleSaveName() {
    startTransition(async () => {
      await updateProfile({ full_name: editName.trim() || displayName })
      setEditOpen(false)
    })
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-60 flex flex-col z-30"
      style={{ background: "var(--ink-2)", borderRight: "1px solid var(--border)" }}
    >
      {/* Brand */}
      <div
        className="px-5 py-6 flex items-center gap-2.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
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
      <div
        className="px-5 py-4 relative"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {editOpen ? (
          <div className="flex flex-col gap-2">
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName()
                if (e.key === "Escape") setEditOpen(false)
              }}
              className="w-full px-3 py-2 rounded-lg text-[12px] text-white focus:outline-none"
              style={{ background: "var(--ink-3)", border: "1px solid var(--signal)" }}
              placeholder="Seu nome"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveName}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold text-white transition-opacity disabled:opacity-50"
                style={{ background: "var(--signal)" }}
              >
                <Check size={11} />
                {isPending ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => setEditOpen(false)}
                className="px-3 py-1.5 rounded-lg text-[11px] text-stone hover:text-white transition-colors"
                style={{ background: "var(--ink-3)" }}
              >
                <X size={11} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 group">
            <div className="w-[38px] h-[38px] rounded-full bg-signal flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {getInitials(displayName)}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-white truncate">{displayName}</span>
                {isAdmin && (
                  <ShieldCheck size={12} className="text-signal flex-shrink-0" />
                )}
              </div>
              <div className="text-[10px] text-stone tracking-wide">
                {isAdmin ? "Administrador" : (activeClient?.name ?? "Cliente")}
              </div>
            </div>
            <button
              onClick={() => { setEditName(profile.full_name ?? ""); setEditOpen(true) }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-ink-3 text-stone hover:text-white"
              aria-label="Editar nome"
            >
              <Pencil size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Client selector — visible for all users with multiple clients */}
      {clients.length > 1 && (
        <div className="px-3 py-3 relative" style={{ borderBottom: "1px solid var(--border)" }}>
          <button
            onClick={() => setShowClientMenu(!showClientMenu)}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-ink-3 transition-colors"
            style={{ background: "rgba(214,64,69,0.10)", border: "1px solid rgba(214,64,69,0.22)" }}
          >
            <div className="text-[9px] text-signal uppercase tracking-[1.5px] font-semibold">Empresa</div>
            <div className="text-[13px] font-bold text-white mt-0.5 flex items-center justify-between">
              {activeClient?.name ?? "Selecionar cliente"}
              <svg className={cn("w-3 h-3 text-stone transition-transform", showClientMenu && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {activeClient && (
              <div className="text-[10px] text-stone mt-0.5 capitalize">{activeClient.plan} · {activeClient.status}</div>
            )}
          </button>

          {showClientMenu && (
            <div
              className="absolute left-3 right-3 top-full mt-1 rounded-xl shadow-modal overflow-hidden z-50"
              style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
            >
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setClient(c); setShowClientMenu(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-ink-4 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-signal/20 flex items-center justify-center text-signal text-[10px] font-bold flex-shrink-0">
                    {getInitials(c.name)}
                  </div>
                  <span className="text-[12px] font-medium text-white flex-1 truncate">{c.name}</span>
                  {activeClient?.id === c.id && <span className="text-signal text-xs flex-shrink-0">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar space-y-0.5">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <div className="text-[9px] text-stone/60 uppercase tracking-[2px] font-semibold px-2 py-3">
              {section}
            </div>
            {items.map(({ href, label, icon: Icon }) => {
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
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[12px] text-stone hover:text-white transition-colors"
        >
          <LogOut size={14} />
          Sair da conta
        </button>
      </div>
    </aside>
  )
}
