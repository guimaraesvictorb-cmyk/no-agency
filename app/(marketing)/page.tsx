import Link from "next/link"
import { ArrowRight, CheckCircle, Sparkles, CalendarDays, Send, BarChart3, Shield, Zap, Star } from "lucide-react"

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 glass border-b border-border/30">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-signal rounded-lg flex items-center justify-center">
          <span className="text-cream font-bebas text-lg">N</span>
        </div>
        <span className="font-bebas text-xl text-cream tracking-widest">NO AGENCY</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm text-stone">
        <a href="#como-funciona" className="hover:text-cream transition-colors">Como funciona</a>
        <a href="#planos" className="hover:text-cream transition-colors">Planos</a>
        <a href="#resultados" className="hover:text-cream transition-colors">Resultados</a>
      </div>
      <Link
        href="/login"
        className="bg-signal text-cream px-4 py-2 rounded-lg text-sm font-medium hover:bg-signal-dark transition-colors"
      >
        Entrar →
      </Link>
    </nav>
  )
}

function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-signal/5 via-transparent to-transparent" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-signal/10 border border-signal/20 text-signal text-sm px-4 py-2 rounded-full mb-8">
          <Sparkles size={14} />
          Gestão de Social Media com IA
        </div>
        <h1 className="font-bebas text-6xl md:text-8xl text-cream leading-none tracking-wide mb-6">
          ZERO ESFORÇO.<br />
          <span className="text-signal">RESULTADO REAL.</span>
        </h1>
        <p className="text-stone text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          A IA cria, agenda e publica conteúdo personalizado para o Instagram e Facebook do seu negócio.
          Você só aprova — em 2 cliques, no celular.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#planos"
            className="inline-flex items-center justify-center gap-2 bg-signal text-cream px-8 py-4 rounded-xl text-base font-medium hover:bg-signal-dark transition-all hover:scale-105 active:scale-100"
          >
            Começar Agora
            <ArrowRight size={18} />
          </a>
          <a
            href="#como-funciona"
            className="inline-flex items-center justify-center gap-2 bg-ink-2 border border-border text-cream px-8 py-4 rounded-xl text-base font-medium hover:bg-ink-3 transition-colors"
          >
            Ver como funciona
          </a>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-8 mt-12 text-sm text-stone">
          {[
            { value: "+50", label: "clientes ativos" },
            { value: "8h", label: "economizadas/semana" },
            { value: "4.9★", label: "avaliação média" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-cream">{s.value}</div>
              <div className="text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MarqueeBar() {
  const items = ["Instagram", "Facebook", "Conteúdo com IA", "Aprovação em 2 cliques", "Relatórios Automáticos", "Zero Esforço", "Resultado Real"]
  return (
    <div className="bg-signal py-3 overflow-hidden">
      <div className="flex gap-8 animate-[marquee_20s_linear_infinite]">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-cream font-bebas text-lg tracking-widest whitespace-nowrap flex-shrink-0">
            {item} ·
          </span>
        ))}
      </div>
    </div>
  )
}

function HowItWorksSection() {
  const steps = [
    { n: "01", icon: Sparkles, title: "DNA da Marca", desc: "Em 3 minutos, você preenche o DNA do negócio: tom de voz, público, temas. A IA aprende." },
    { n: "02", icon: CalendarDays, title: "IA Cria o Conteúdo", desc: "Todo mês, a IA gera posts completos: texto, sugestão de imagem, hashtags e horário ideal." },
    { n: "03", icon: CheckCircle, title: "Você Aprova", desc: "Recebe um link por e-mail. Aprova os posts em 2 cliques, no celular, sem precisar logar." },
    { n: "04", icon: Send, title: "Publicação Automática", desc: "Posts aprovados são publicados automaticamente no Instagram e Facebook no horário certo." },
    { n: "05", icon: BarChart3, title: "Relatório Semanal", desc: "Todo final de semana, você recebe um relatório com alcance, engajamento e insights da IA." },
  ]

  return (
    <section id="como-funciona" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-bebas text-5xl text-cream tracking-wide mb-4">COMO FUNCIONA</h2>
          <p className="text-stone text-lg max-w-xl mx-auto">Um fluxo completo de gestão de conteúdo, do zero à publicação, sem você precisar fazer nada.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.n} className="bg-ink-2 border border-border rounded-2xl p-5 text-center hover:border-stone/40 transition-colors">
                <div className="text-signal font-bebas text-3xl mb-3">{step.n}</div>
                <div className="w-10 h-10 bg-signal/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={18} className="text-signal" />
                </div>
                <h3 className="font-semibold text-cream text-sm mb-2">{step.title}</h3>
                <p className="text-xs text-stone leading-relaxed">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

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
    <section id="planos" className="py-24 px-6 bg-ink-2/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-bebas text-5xl text-cream tracking-wide mb-4">PLANOS</h2>
          <p className="text-stone text-lg">Setup único + mensalidade. Sem contrato de fidelidade.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 border relative ${
                plan.highlight
                  ? "bg-signal/5 border-signal/40"
                  : "bg-ink-2 border-border"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal text-cream text-xs font-semibold px-4 py-1 rounded-full">
                  Mais Popular
                </div>
              )}
              <div className="font-bebas text-2xl text-cream mb-1">{plan.name}</div>
              <div className="text-3xl font-bold text-cream mb-1">{plan.price}<span className="text-sm font-normal text-stone">/mês</span></div>
              <div className="text-xs text-stone mb-4">+ {plan.setup} setup</div>
              <div className="text-sm font-medium text-cream mb-1">{plan.posts}</div>
              <div className="text-xs text-stone mb-5">{plan.platform}</div>
              <div className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-cream/80">
                    <CheckCircle size={14} className="text-green flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <a
                href="#contato"
                className={`block text-center py-3 rounded-xl text-sm font-medium transition-all ${
                  plan.highlight
                    ? "bg-signal text-cream hover:bg-signal-dark"
                    : "bg-ink-3 border border-border text-cream hover:bg-ink-4"
                }`}
              >
                Contratar
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ResultsSection() {
  const results = [
    { metric: "+340%", label: "Aumento de alcance orgânico", client: "Cutelaria Ferreira" },
    { metric: "4.8%", label: "Taxa de engajamento média", client: "Evidence Ballet" },
    { metric: "8h", label: "Economizadas por semana", client: "W2G Design" },
    { metric: "NPS 71", label: "Score médio dos clientes", client: "Todos os clientes" },
  ]

  return (
    <section id="resultados" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-bebas text-5xl text-cream tracking-wide mb-4">RESULTADOS</h2>
          <p className="text-stone text-lg">Números reais de clientes que já usam a plataforma.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((r) => (
            <div key={r.metric} className="bg-ink-2 border border-border rounded-2xl p-5 text-center hover:border-stone/40 transition-colors">
              <div className="font-bebas text-4xl text-signal mb-2">{r.metric}</div>
              <div className="text-sm text-cream mb-1">{r.label}</div>
              <div className="text-xs text-stone">{r.client}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const testimonials = [
    { text: "Antes eu perdia 2 dias por semana tentando criar conteúdo. Agora recebo os posts prontos e aprovo em 5 minutos. O engajamento dobrou.", name: "Luciana M.", role: "Evidence Ballet", score: 10 },
    { text: "Pensava que IA não capturaria o jeito da minha marca. Errei. Os posts parecem escritos por alguém que me conhece há anos.", name: "Carlos F.", role: "Cutelaria Ferreira", score: 9 },
    { text: "Exatamente o que minha empresa precisava. Presença digital profissional sem ter que contratar uma equipe.", name: "André W.", role: "W2G Design", score: 9 },
  ]

  return (
    <section className="py-24 px-6 bg-ink-2/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-bebas text-5xl text-cream tracking-wide mb-4">DEPOIMENTOS</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-ink-2 border border-border rounded-2xl p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.score > 9 ? 5 : 4 }).map((_, i) => (
                  <Star key={i} size={14} className="text-amber fill-amber" />
                ))}
              </div>
              <p className="text-sm text-cream/80 italic leading-relaxed mb-4">"{t.text}"</p>
              <div className="text-sm font-medium text-cream">{t.name}</div>
              <div className="text-xs text-stone">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section id="contato" className="py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-signal/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Zap size={28} className="text-signal" />
        </div>
        <h2 className="font-bebas text-5xl text-cream tracking-wide mb-4">PRONTO PARA COMEÇAR?</h2>
        <p className="text-stone text-lg mb-8">
          Setup em 3 minutos. Primeiro lote de posts em 24 horas. Sem burocracia.
        </p>
        <div className="bg-ink-2 border border-border rounded-2xl p-6 space-y-3">
          <input
            type="text"
            placeholder="Nome do negócio"
            className="w-full bg-ink-3 border border-border rounded-xl px-4 py-3 text-sm text-cream placeholder:text-stone focus:outline-none focus:border-stone"
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            className="w-full bg-ink-3 border border-border rounded-xl px-4 py-3 text-sm text-cream placeholder:text-stone focus:outline-none focus:border-stone"
          />
          <input
            type="tel"
            placeholder="WhatsApp"
            className="w-full bg-ink-3 border border-border rounded-xl px-4 py-3 text-sm text-cream placeholder:text-stone focus:outline-none focus:border-stone"
          />
          <button className="w-full bg-signal text-cream py-4 rounded-xl text-base font-medium hover:bg-signal-dark transition-all hover:scale-[1.02] active:scale-100">
            Quero Começar Agora →
          </button>
          <p className="text-xs text-stone">Entraremos em contato em até 2 horas.</p>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-signal rounded flex items-center justify-center">
            <span className="text-cream font-bebas text-sm">N</span>
          </div>
          <span className="font-bebas text-base text-cream tracking-widest">NO AGENCY</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-cream transition-colors">Privacidade</a>
          <a href="#" className="hover:text-cream transition-colors">Termos</a>
          <Link href="/login" className="hover:text-cream transition-colors">Entrar</Link>
        </div>
        <div className="text-xs text-stone/50">© 2026 No Agency. Todos os direitos reservados.</div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="bg-ink text-cream">
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
