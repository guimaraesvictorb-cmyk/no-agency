"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

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
    await new Promise((r) => setTimeout(r, 800))
    // Demo: always go to dashboard
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex w-1/2 bg-ink-2 border-r border-border flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-signal/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-signal/3 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-signal rounded-xl flex items-center justify-center">
            <span className="text-cream font-bebas text-2xl">N</span>
          </div>
          <div>
            <div className="font-bebas text-2xl text-cream tracking-widest">NO AGENCY</div>
            <div className="text-xs text-stone font-medium -mt-0.5">SOCIAL IA</div>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="font-bebas text-5xl text-cream leading-tight tracking-wide">
              GESTÃO DE REDES SOCIAIS<br />
              <span className="text-signal">COM INTELIGÊNCIA</span><br />
              ARTIFICIAL
            </h1>
            <p className="text-stone mt-4 text-lg leading-relaxed max-w-sm">
              Conteúdo criado, aprovado e publicado automaticamente. Zero esforço, resultado real.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "3min", label: "Setup por cliente" },
              { value: "100%", label: "IA gerada" },
              { value: "0", label: "Esforço necessário" },
            ].map((stat) => (
              <div key={stat.label} className="bg-ink-3 border border-border rounded-xl p-3">
                <div className="text-xl font-bold text-cream">{stat.value}</div>
                <div className="text-xs text-stone mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-ink-3 border border-border rounded-2xl p-4 relative z-10">
          <div className="flex gap-1 mb-2">
            {[1,2,3,4,5].map((i) => <span key={i} className="text-amber text-sm">★</span>)}
          </div>
          <p className="text-sm text-cream/80 italic">"Economizei 8 horas por semana e os posts ficaram muito mais profissionais."</p>
          <div className="text-xs text-stone mt-2">— Evidence Ballet, cliente desde fev/2026</div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-ink">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <div className="w-8 h-8 bg-signal rounded-lg flex items-center justify-center">
              <span className="text-cream font-bebas text-lg">N</span>
            </div>
            <span className="font-bebas text-2xl text-cream tracking-wide">NO AGENCY</span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-cream">Bem-vindo de volta</h2>
            <p className="text-stone mt-1 text-sm">Entre para gerenciar seus clientes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="você@noagency.com.br"
              required
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-cream/80 block">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-ink-3 border border-border rounded-lg px-3 py-2.5 text-sm text-cream placeholder:text-stone focus:outline-none focus:border-stone pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-cream"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-signal bg-signal/10 border border-signal/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Link href="#" className="text-xs text-stone hover:text-cream transition-colors">
                Esqueceu a senha?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Entrar
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-stone/60">
              Plataforma exclusiva para gestores No Agency
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
