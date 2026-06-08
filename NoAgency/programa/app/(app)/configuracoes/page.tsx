"use client"

import { useState, useEffect, useTransition } from "react"
import { updateProfile } from "@/app/actions/profile"
import { createClient } from "@/lib/supabase/client"
import { Check, Copy, LogOut, KeyRound, User, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [passwordSent, setPasswordSent] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? "")
        setUserId(user.id)
      }
    })
    supabase.from("profiles").select("full_name").maybeSingle().then(({ data }) => {
      if (data?.full_name) setFullName(data.full_name)
    })
  }, [])

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

  async function handlePasswordReset() {
    if (!email) return
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    setPasswordSent(true)
    setTimeout(() => setPasswordSent(false), 5000)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  function handleCopyId() {
    navigator.clipboard.writeText(userId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Configurações</h1>
        <p className="text-[13px] text-stone">Gerencie seu perfil e preferências</p>
      </div>

      <div className="rounded-xl p-6 space-y-5"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-white pb-3"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <User size={14} className="text-signal" />
          Perfil
        </div>

        <div>
          <label className="text-[10px] text-stone uppercase tracking-wide block mb-1.5">Nome de exibição</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
            placeholder="Seu nome"
            className="w-full px-3 py-2.5 rounded-lg text-[13px] text-white focus:outline-none"
            style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
          />
        </div>

        <div>
          <label className="text-[10px] text-stone uppercase tracking-wide block mb-1.5">E-mail</label>
          <input
            value={email}
            readOnly
            className="w-full px-3 py-2.5 rounded-lg text-[13px] text-stone cursor-default"
            style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
          />
        </div>

        <div>
          <label className="text-[10px] text-stone uppercase tracking-wide block mb-1.5">ID da conta</label>
          <div className="flex gap-2">
            <input
              value={userId}
              readOnly
              className="flex-1 px-3 py-2.5 rounded-lg text-[11px] text-stone font-mono cursor-default truncate"
              style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
            />
            <button
              onClick={handleCopyId}
              className="px-3 py-2.5 rounded-lg text-stone hover:text-white transition-colors flex-shrink-0"
              style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
              title="Copiar ID"
            >
              {copied ? <Check size={13} className="text-green" /> : <Copy size={13} />}
            </button>
          </div>
          <p className="text-[10px] text-stone/50 mt-1">Use este ID para vincular sua conta a clientes na plataforma.</p>
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

      <div className="rounded-xl p-6 space-y-4"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-white pb-3"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <Shield size={14} className="text-signal" />
          Segurança
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] text-white">Redefinir senha</div>
            <div className="text-[11px] text-stone mt-0.5">Enviaremos um link para {email || "seu e-mail"}</div>
          </div>
          <button
            onClick={handlePasswordReset}
            disabled={passwordSent}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: passwordSent ? "rgba(16,185,129,0.15)" : "var(--ink-3)", border: "1px solid var(--border)", color: passwordSent ? "var(--green)" : undefined }}
          >
            <KeyRound size={13} />
            {passwordSent ? "Email enviado!" : "Redefinir"}
          </button>
        </div>
      </div>

      <div className="rounded-xl p-6"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
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
