"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import LogoCluster from "@/components/ui/LogoCluster"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(
        authError.message === "Email not confirmed"
          ? "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada."
          : authError.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : authError.message
      )
      setLoading(false)
      return
    }

    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen flex font-poppins">
      {/* ── LEFT — red brand panel ── */}
      <div
        className="hidden lg:flex w-[52%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: "var(--signal)" }}
      >
        {/* Diagonal texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(-45deg,rgba(0,0,0,.06) 0,rgba(0,0,0,.06) 1px,transparent 1px,transparent 40px)",
          }}
        />

        {/* Top content */}
        <div className="relative z-10">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-16">
            <LogoCluster size={44} variant="red" />
            <div className="w-px h-8 bg-white/30" />
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1 text-white font-bold text-sm tracking-wide">
                NO <span className="w-1 h-1 rounded-full bg-ink inline-block" />
              </div>
              <div className="text-white font-light text-sm tracking-wide">AGENCY</div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-bebas text-[86px] leading-[0.9] text-white mb-6">
            SEU FEED<br />
            ATIVO.<br />
            <span className="text-white/35">TODO DIA.</span>
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-[360px]">
            Bem-vindo à sua plataforma de social media gerenciada por IA. Tudo que você precisa para aparecer — sem agência, sem esforço.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-12">
          {[
            { n: "30×", l: "Posts por mês" },
            { n: "15min", l: "Trabalho seu" },
            { n: "R$0", l: "Custo extra" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-bebas text-[44px] text-white leading-none">{s.n}</div>
              <div className="text-white/55 text-[11px] uppercase tracking-widest mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT — form ── */}
      <div className="flex-1 bg-ink-2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-signal rounded-lg flex items-center justify-center">
              <LogoCluster size={20} variant="red" />
            </div>
            <span className="font-bebas text-xl text-cream tracking-widest">NO AGENCY</span>
          </div>

          <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-stone hover:text-white transition-colors mb-8">
            <ArrowLeft size={13} />
            Voltar ao site
          </Link>

          <h2 className="font-bebas text-[38px] text-white leading-none mb-1">Entrar na plataforma</h2>
          <p className="text-stone text-[13px] mb-9">Acesse sua conta No Agency</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold tracking-[1.5px] uppercase text-stone mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-ink-3 border border-ink-border text-white px-4 py-3.5 text-sm rounded-lg outline-none placeholder:text-stone/50 focus:border-signal transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-[1.5px] uppercase text-stone mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-ink-3 border border-ink-border text-white px-4 py-3.5 text-sm rounded-lg outline-none placeholder:text-stone/50 focus:border-signal transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-signal bg-signal/10 border border-signal/20 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-signal hover:bg-signal-dark text-white py-4 text-[13px] font-bold tracking-widest uppercase rounded-lg transition-all hover:-translate-y-px active:translate-y-0 disabled:opacity-60 mt-2"
            >
              {loading ? "Acessando..." : "Acessar minha plataforma →"}
            </button>
          </form>

          <a href="#" className="block text-center text-[12px] text-stone hover:text-white transition-colors mt-5">
            Esqueci minha senha
          </a>
        </div>
      </div>
    </div>
  )
}
