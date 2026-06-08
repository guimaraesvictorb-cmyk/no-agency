"use client"

import { useState, useTransition } from "react"
import { updateClientStatus, deleteClientRecord, createClient_ } from "@/app/actions/profile"
import { getInitials } from "@/lib/utils"
import {
  Plus, MoreVertical, CheckCircle2, PauseCircle, XCircle, Trash2, X, Check,
} from "lucide-react"

type Client = {
  id: string
  name: string
  status: string
  plan: string
  user_id: string | null
  created_at: string
}

type User = {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

const STATUS_CONFIG = {
  active:      { label: "Ativo",       color: "var(--green)",  bg: "rgba(16,185,129,0.12)",  icon: CheckCircle2 },
  onboarding:  { label: "Onboarding",  color: "var(--amber)",  bg: "rgba(245,158,11,0.12)",  icon: PauseCircle  },
  paused:      { label: "Pausado",     color: "var(--stone)",  bg: "rgba(120,113,108,0.15)", icon: PauseCircle  },
  churned:     { label: "Banido",      color: "var(--signal)", bg: "rgba(214,64,69,0.12)",   icon: XCircle      },
}

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  growth:  "Growth",
  pro:     "Pro",
}

export default function AdminClientList({ clients, users }: { clients: Client[]; users: User[] }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newPlan, setNewPlan] = useState("growth")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const linkedUserIds = new Set(clients.map((c) => c.user_id).filter(Boolean))
  const unlinkedUsers = users.filter((u) => u.role !== "admin" && !linkedUserIds.has(u.id))

  function changeStatus(clientId: string, status: string) {
    startTransition(async () => {
      await updateClientStatus(clientId, status)
      setOpenMenu(null)
    })
  }

  function handleDelete(clientId: string) {
    startTransition(async () => {
      await deleteClientRecord(clientId)
      setConfirmDelete(null)
    })
  }

  function handleCreate() {
    if (!newName.trim()) { setError("Informe o nome do cliente"); return }
    startTransition(async () => {
      await createClient_({ name: newName.trim(), plan: newPlan })
      setNewName("")
      setNewPlan("growth")
      setNewClientOpen(false)
      setError("")
    })
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
          const count = clients.filter((c) => c.status === status).length
          const Icon = cfg.icon
          return (
            <div key={status} className="rounded-xl px-4 py-4"
              style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: cfg.color }} />
                <span className="text-[11px] text-stone uppercase tracking-wide">{cfg.label}</span>
              </div>
              <div className="font-bebas text-[32px] text-white leading-none">{count}</div>
            </div>
          )
        })}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-white">{clients.length} cliente{clients.length !== 1 ? "s" : ""}</h2>
        <button
          onClick={() => setNewClientOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold text-white hover:opacity-90 transition-opacity"
          style={{ background: "var(--signal)" }}
        >
          <Plus size={14} />
          Novo cliente
        </button>
      </div>

      {/* New client form */}
      {newClientOpen && (
        <div className="rounded-xl p-5 space-y-4"
          style={{ background: "var(--ink-2)", border: "1px solid var(--signal)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-white">Cadastrar novo cliente</span>
            <button onClick={() => setNewClientOpen(false)} className="text-stone hover:text-white">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-stone uppercase tracking-wide block mb-1.5">Nome da empresa</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: SLR Engenharia"
                className="w-full px-3 py-2.5 rounded-lg text-[13px] text-white focus:outline-none"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
              />
            </div>
            <div>
              <label className="text-[10px] text-stone uppercase tracking-wide block mb-1.5">Plano</label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-[13px] text-white focus:outline-none"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
              >
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          </div>
          {error && <p className="text-[11px] text-signal">{error}</p>}
          <button
            onClick={handleCreate}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-bold text-white disabled:opacity-50 hover:opacity-90"
            style={{ background: "var(--signal)" }}
          >
            <Check size={13} />
            {isPending ? "Criando..." : "Criar cliente"}
          </button>
        </div>
      )}

      {/* Client list */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
        {clients.length === 0 ? (
          <div className="text-center py-16 text-stone">
            <div className="text-4xl mb-3">🏢</div>
            <div className="text-[14px] font-semibold text-white mb-1">Nenhum cliente cadastrado</div>
            <div className="text-[12px]">Clique em "Novo cliente" para começar</div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Cliente", "Plano", "Status", "Usuário vinculado", "Desde", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] text-stone uppercase tracking-wide font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const cfg = STATUS_CONFIG[client.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.onboarding
                const linkedUser = users.find((u) => u.id === client.user_id)
                return (
                  <tr key={client.id} className="hover:bg-ink-3 transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-signal/20 flex items-center justify-center text-signal text-[11px] font-bold flex-shrink-0">
                          {getInitials(client.name)}
                        </div>
                        <span className="text-[13px] font-semibold text-white">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full"
                        style={{ background: "rgba(214,64,69,0.12)", color: "var(--signal)" }}>
                        {PLAN_LABELS[client.plan] ?? client.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {linkedUser ? (
                        <div>
                          <div className="text-[12px] text-white">{linkedUser.full_name ?? linkedUser.email.split("@")[0]}</div>
                          <div className="text-[10px] text-stone">{linkedUser.email}</div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone italic">Sem acesso vinculado</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[11px] text-stone">
                      {new Date(client.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-5 py-4 relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === client.id ? null : client.id)}
                        className="p-1.5 rounded hover:bg-ink-4 text-stone hover:text-white transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {openMenu === client.id && (
                        <div
                          className="absolute right-4 top-full mt-1 w-48 rounded-xl shadow-modal overflow-hidden z-10"
                          style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
                        >
                          <button
                            onClick={() => changeStatus(client.id, "active")}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] hover:bg-ink-4 transition-colors text-left"
                            style={{ color: "var(--green)" }}
                          >
                            <CheckCircle2 size={13} /> Ativar
                          </button>
                          <button
                            onClick={() => changeStatus(client.id, "paused")}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-stone hover:bg-ink-4 hover:text-white transition-colors text-left"
                          >
                            <PauseCircle size={13} /> Pausar
                          </button>
                          <button
                            onClick={() => changeStatus(client.id, "churned")}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] hover:bg-ink-4 transition-colors text-left"
                            style={{ color: "var(--signal)" }}
                          >
                            <XCircle size={13} /> Banir
                          </button>
                          <div style={{ borderTop: "1px solid var(--border)" }} />
                          <button
                            onClick={() => { setConfirmDelete(client.id); setOpenMenu(null) }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] hover:bg-signal/10 transition-colors text-left"
                            style={{ color: "var(--signal)" }}
                          >
                            <Trash2 size={13} /> Excluir permanentemente
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Unlinked users section */}
      {unlinkedUsers.length > 0 && (
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="text-[13px] font-semibold text-white">Usuários sem cliente vinculado</div>
            <div className="text-[11px] text-stone mt-0.5">Contas criadas mas ainda não associadas a um cliente</div>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {unlinkedUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 rounded-full bg-stone/20 flex items-center justify-center text-stone text-[11px] font-bold flex-shrink-0">
                  {getInitials(u.full_name ?? u.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-white">{u.full_name ?? u.email.split("@")[0]}</div>
                  <div className="text-[10px] text-stone">{u.email} · {u.role}</div>
                </div>
                <span className="text-[10px] text-stone">
                  {new Date(u.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm space-y-4"
            style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
            <div className="text-[16px] font-bold text-white">Excluir cliente?</div>
            <p className="text-[13px] text-stone">
              Esta ação é irreversível. Todos os posts, DNA briefs e dados do cliente serão perdidos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-stone hover:text-white transition-colors"
                style={{ border: "1px solid var(--border)" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-lg text-[12px] font-bold text-white disabled:opacity-50"
                style={{ background: "var(--signal)" }}
              >
                {isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
