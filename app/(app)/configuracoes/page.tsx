"use client"

import { useState, useTransition } from "react"
import { updateProfile } from "@/app/actions/profile"
import { createClient } from "@/lib/supabase/client"
import { Check, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  // Load current profile on mount
  useState(() => {
    createClient()
      .from("profiles")
      .select("full_name, email, role")
      .single()
      .then(({ data }) => {
        if (data?.full_name) setFullName(data.full_name)
      })
  })

  function handleSave() {
    if (!fullName.trim()) { setError("Informe seu nome"); return }
    startTransition(async () => {
      try {
        await updateProfile({ full_name: fullName.trim() })
        setSaved(true)
        setError("")
        setTimeout(() => setSaved(false), 2500)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erro ao salvar")
      }
    })
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Configurações</h1>
        <p className="text-[13px] text-stone">Gerencie seu perfil e preferências</p>
      </div>

      {/* Profile card */}
      <div className="rounded-xl p-6 space-y-5"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
        <div className="text-[13px] font-semibold text-white pb-3"
          style={{ borderBottom: "1px solid var(--border)" }}>
          Perfil
        </div>

        <div>
          <label className="text-[10px] text-stone uppercase tracking-wide block mb-1.5">
            Nome de exibição
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
            placeholder="Seu nome"
            className="w-full px-3 py-2.5 rounded-lg text-[13px] text-white focus:outline-none"
            style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
          />
        </div>

        {error && <p className="text-[11px] text-signal">{error}</p>}

        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-bold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
          style={{ background: saved ? "var(--green)" : "var(--signal)" }}
        >
          <Check size={13} />
          {isPending ? "Salvando..." : saved ? "Salvo!" : "Salvar alterações"}
        </button>
      </div>

      {/* Account card */}
      <div className="rounded-xl p-6 space-y-4"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
        <div className="text-[13px] font-semibold text-white pb-3"
          style={{ borderBottom: "1px solid var(--border)" }}>
          Conta
        </div>
        <div className="text-[12px] text-stone">
          Para alterar e-mail ou senha, acesse as opções de segurança.
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[12px] text-stone hover:text-white transition-colors"
        >
          <LogOut size={14} />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
