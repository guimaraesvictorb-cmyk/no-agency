"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight, CheckCircle, Sparkles, CalendarDays,
  Send, BarChart3, Zap, Star, Menu, X,
} from "lucide-react"
import LogoCluster from "@/components/ui/LogoCluster"

// ─── Navbar ──────────────────────────────────────────────────────────────────
function NavBar() {
  const [open, setOpen] = useState(false)
  const links = [
    { label: "Como funciona", href: "#como-funciona" },
    { label: "Planos", href: "#planos" },
    { label: "Resultados", href: "#resultados" },
  ]
  return (
    <nav className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <LogoCluster size={30} variant="dark" />
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1 text-white font-bold text-[13px]">
              NO <span className="w-1 h-1 rounded-full bg-signal inline-block" />
            </div>
            <div className="text-white font-light text-[13px]">AGENCY</div>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href}
              className="text-[13px] text-stone hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login"
            className="text-[13px] text-stone hover:text-white transition-colors">
            Entrar
          </Link>
          <a href="#contato"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "var(--signal)" }}>
            Começar Agora <ArrowRight size={13} />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-stone hover:text-white">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-5 pb-5 space-y-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block py-3 text-[14px] text-stone hover:text-white transition-colors"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {l.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)}
              className="block text-center py-3 rounded-lg text-[13px] text-white"
              style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
              Entrar na plataforma
            </Link>
            <a href="#contato" onClick={() => setOpen(false)}
              className="block text-center py-3 rounded-lg text-[13px] font-bold text-white"
              style={{ background: "var(--signal)" }}>
              Começar Agora →
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-5 pt-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "var(--signal)" }} />

      <div className="max-w-4xl mx-auto text-center relative z-10 py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-8"
          style={{ background: "rgba(214,64,69,0.12)", border: "1px solid rgba(214,64,69,0.3)", color: "var(--signal)" }}>
          <Sparkles size={12} />
          Gestão de Social Media com IA
        </div>

        {/* Headline */}
        <h1 className="font-bebas text-[64px] sm:text-[80px] md:text-[108px] leading-none tracking-wide mb-6 text-white">
          ZERO ESFORÇO.<br />
          <span style={{ color: "var(--signal)" }}>RESULTADO REAL.</span>
        </h1>

        <p className="text-[15px] md:text-[18px] max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--stone)" }}>
          A IA cria, agenda e publica conteúdo personalizado para o Instagram e Facebook do seu negócio.
          Você só aprova — em 2 cliques, no celular.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="#contato"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[14px] font-bold text-white transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0"
            style={{ background: "var(--signal)" }}>
            Começar Agora
            <ArrowRight size={16} />
          </a>
          <a href="#como-funciona"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[14px] font-medium text-white transition-colors hover:opacity-80"
            style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
            Ver como funciona
          </a>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 mt-14">
          {[
            { value: "+50", label: "clientes ativos" },
            { value: "8h", label: "economizadas/semana" },
            { value: "4.9★", label: "avaliação média" },
          ].map((s, i) => (
            <div key={s.label} className="text-center relative">
              {i > 0 && (
                <div className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 w-px h-6"
                  style={{ background: "var(--border)" }} />
              )}
              <div className="font-bebas text-[32px] sm:text-[40px] leading-none text-white">{s.value}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--stone)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function MarqueeBar() {
  const items = ["Instagram", "Facebook", "Conteúdo com IA", "Aprovação em 2 cliques", "Relatórios Automáticos", "Zero Esforço", "Resultado Real"]
  return (
    <div className="py-3 overflow-hidden" style={{ background: "var(--signal)" }}>
      <div className="flex gap-8 animate-marquee">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="font-bebas text-[15px] tracking-widest whitespace-nowrap flex-shrink-0 text-white opacity-90">
            {item} <span className="opacity-50">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { n: "01", icon: Sparkles,    title: "DNA da Marca",          desc: "Em 3 minutos, você preenche o DNA do negócio: tom de voz, público e temas. A IA aprende." },
    { n: "02", icon: CalendarDays, title: "IA Cria o Conteúdo",   desc: "Todo mês, a IA gera posts completos: texto, sugestão de imagem, hashtags e horário ideal." },
    { n: "03", icon: CheckCircle,  title: "Você Aprova",          desc: "Recebe um link por e-mail. Aprova os posts em 2 cliques, no celular, sem precisar logar." },
    { n: "04", icon: Send,         title: "Publicação Automática", desc: "Posts aprovados são publicados automaticamente no Instagram e Facebook no horário certo." },
    { n: "05", icon: BarChart3,    title: "Relatório Semanal",    desc: "Todo final de semana, você recebe um relatório com alcance, engajamento e insights da IA." },
  ]
  return (
    <section id="como-funciona" className="py-20 md:py-28 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-bebas text-[48px] md:text-[60px] text-white tracking-wide mb-3">COMO FUNCIONA</h2>
          <p className="text-[14px] md:text-[16px] max-w-lg mx-auto" style={{ color: "var(--stone)" }}>
            Um fluxo completo de gestão de conteúdo, do zero à publicação, sem você precisar fazer nada.
          </p>
        </div>

        {/* Steps — vertical on mobile, horizontal on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.n} className="rounded-2xl p-5 text-center transition-all hover:border-stone/40"
                style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
                <div className="font-bebas text-[32px] leading-none mb-3" style={{ color: "var(--signal)" }}>{step.n}</div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(214,64,69,0.12)" }}>
                  <Icon size={17} style={{ color: "var(--signal)" }} />
                </div>
                <h3 className="font-semibold text-white text-[13px] mb-2">{step.title}</h3>
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--stone)" }}>{step.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Plans ────────────────────────────────────────────────────────────────────
function PlansSection() {
  const plans = [
    {
      name: "Starter",
      price: "R$ 397",
      setup: "R$ 500",
      posts: "8 posts/mês",
      platform: "Instagram OU Facebook",
      features: ["DNA Brief básico", "Aprovação via e-mail", "Relatório mensal", "Suporte por e-mail"],
      highlight: false,
    },
    {
      name: "Growth",
      price: "R$ 697",
      setup: "R$ 800",
      posts: "12 posts/mês",
      platform: "Instagram + Facebook",
      features: ["DNA Brief completo", "Aprovação com comentários", "Relatório semanal", "NPS mensal", "Suporte WhatsApp"],
      highlight: true,
    },
    {
      name: "Pro",
      price: "R$ 1.197",
      setup: "R$ 1.200",
      posts: "20 posts/mês",
      platform: "Instagram + Facebook",
      features: ["DNA Brief avançado + Reels", "Aprovação prioritária", "Relatório semanal + insights", "NPS + análise de sentimento", "Gerente dedicado"],
      highlight: false,
    },
  ]

  return (
    <section id="planos" className="py-20 md:py-28 px-5" style={{ background: "rgba(26,26,26,0.4)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-bebas text-[48px] md:text-[60px] text-white tracking-wide mb-3">PLANOS</h2>
          <p className="text-[14px] md:text-[16px]" style={{ color: "var(--stone)" }}>
            Setup único + mensalidade. Sem contrato de fidelidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-2xl p-6 relative flex flex-col"
              style={plan.highlight
                ? { background: "rgba(214,64,69,0.07)", border: "1px solid rgba(214,64,69,0.4)" }
                : { background: "var(--ink-2)", border: "1px solid var(--border)" }
              }>
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold text-white"
                  style={{ background: "var(--signal)" }}>
                  Mais Popular
                </div>
              )}
              <div className="font-bebas text-[24px] text-white mb-1">{plan.name}</div>
              <div className="flex items-end gap-1 mb-0.5">
                <span className="font-bebas text-[40px] leading-none text-white">{plan.price}</span>
                <span className="text-[13px] mb-1" style={{ color: "var(--stone)" }}>/mês</span>
              </div>
              <div className="text-[12px] mb-4" style={{ color: "var(--stone)" }}>+ {plan.setup} setup único</div>

              <div className="text-[13px] font-semibold text-white mb-0.5">{plan.posts}</div>
              <div className="text-[12px] mb-5" style={{ color: "var(--stone)" }}>{plan.platform}</div>

              <div className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[13px] text-white/80">
                    <CheckCircle size={13} style={{ color: "#10B981", flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>

              <a href="#contato"
                className="block text-center py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90"
                style={plan.highlight
                  ? { background: "var(--signal)" }
                  : { background: "var(--ink-3)", border: "1px solid var(--border)" }
                }>
                Contratar
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Results ──────────────────────────────────────────────────────────────────
function ResultsSection() {
  const results = [
    { metric: "+340%", label: "Aumento de alcance orgânico", client: "Cliente de Engenharia" },
    { metric: "4.8%", label: "Taxa de engajamento média", client: "Cliente de Moda" },
    { metric: "8h", label: "Economizadas por semana", client: "Cliente de Design" },
    { metric: "NPS 71", label: "Score médio dos clientes", client: "Todos os clientes" },
  ]

  return (
    <section id="resultados" className="py-20 md:py-28 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-bebas text-[48px] md:text-[60px] text-white tracking-wide mb-3">RESULTADOS</h2>
          <p className="text-[14px] md:text-[16px]" style={{ color: "var(--stone)" }}>
            Números reais de clientes que já usam a plataforma.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((r) => (
            <div key={r.metric} className="rounded-2xl p-5 text-center transition-all hover:border-stone/40"
              style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
              <div className="font-bebas text-[44px] leading-none mb-2" style={{ color: "var(--signal)" }}>{r.metric}</div>
              <div className="text-[13px] text-white mb-1">{r.label}</div>
              <div className="text-[11px]" style={{ color: "var(--stone)" }}>{r.client}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    { text: "Antes eu perdia 2 dias por semana tentando criar conteúdo. Agora recebo os posts prontos e aprovo em 5 minutos. O engajamento dobrou.", name: "Luciana M.", role: "Setor de Moda", score: 10 },
    { text: "Pensava que IA não capturaria o jeito da minha marca. Errei. Os posts parecem escritos por alguém que me conhece há anos.", name: "Carlos F.", role: "Setor Industrial", score: 9 },
    { text: "Exatamente o que minha empresa precisava. Presença digital profissional sem ter que contratar uma equipe inteira.", name: "André W.", role: "Setor de Design", score: 9 },
  ]

  return (
    <section className="py-20 md:py-28 px-5" style={{ background: "rgba(26,26,26,0.4)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-bebas text-[48px] md:text-[60px] text-white tracking-wide mb-3">DEPOIMENTOS</h2>
          <p className="text-[14px] md:text-[16px]" style={{ color: "var(--stone)" }}>
            O que nossos clientes dizem.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl p-6 flex flex-col"
              style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.score >= 10 ? 5 : 4 }).map((_, i) => (
                  <Star key={i} size={13} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                ))}
              </div>
              <p className="text-[13px] leading-relaxed flex-1 mb-5 italic" style={{ color: "rgba(240,235,227,0.8)" }}>
                "{t.text}"
              </p>
              <div>
                <div className="text-[13px] font-semibold text-white">{t.name}</div>
                <div className="text-[11px]" style={{ color: "var(--stone)" }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CtaSection() {
  return (
    <section id="contato" className="py-20 md:py-28 px-5">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(214,64,69,0.15)" }}>
          <Zap size={26} style={{ color: "var(--signal)" }} />
        </div>
        <h2 className="font-bebas text-[48px] md:text-[60px] text-white tracking-wide leading-none mb-4">
          PRONTO PARA<br />COMEÇAR?
        </h2>
        <p className="text-[14px] md:text-[16px] mb-8" style={{ color: "var(--stone)" }}>
          Setup em 3 minutos. Primeiro lote de posts em 24 horas. Sem burocracia.
        </p>

        <div className="rounded-2xl p-5 space-y-3"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          {[
            { type: "text",  placeholder: "Nome do negócio" },
            { type: "email", placeholder: "Seu e-mail" },
            { type: "tel",   placeholder: "WhatsApp" },
          ].map((f) => (
            <input key={f.placeholder}
              type={f.type}
              placeholder={f.placeholder}
              className="w-full px-4 py-3.5 text-[13px] text-white placeholder:text-stone/50 rounded-xl outline-none focus:border-signal transition-colors"
              style={{ background: "var(--ink-3)", border: "1px solid var(--ink-border)" }}
            />
          ))}
          <button
            className="w-full py-4 rounded-xl text-[14px] font-bold text-white transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0"
            style={{ background: "var(--signal)" }}>
            Quero Começar Agora →
          </button>
          <p className="text-[11px]" style={{ color: "var(--stone)" }}>
            Entraremos em contato em até 2 horas.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="px-5 py-8" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2.5">
          <LogoCluster size={24} variant="dark" />
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1 text-white font-bold text-[11px]">
              NO <span className="w-1 h-1 rounded-full bg-signal inline-block" />
            </div>
            <div className="text-white font-light text-[11px]">AGENCY</div>
          </div>
        </div>
        <div className="flex gap-6">
          {["Privacidade", "Termos"].map((l) => (
            <a key={l} href="#" className="text-[12px] text-stone hover:text-white transition-colors">{l}</a>
          ))}
          <Link href="/login" className="text-[12px] text-stone hover:text-white transition-colors">Entrar</Link>
        </div>
        <div className="text-[11px]" style={{ color: "rgba(138,133,130,0.5)" }}>
          © 2026 No Agency. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ background: "var(--ink)", color: "var(--cream)" }}>
      <NavBar />
      <HeroSection />
      <MarqueeBar />
      <HowItWorksSection />
      <PlansSection />
      <ResultsSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
