"use client"

import { useState, useEffect } from "react"
import { ExternalLink, CheckCircle, Lock, Wifi, WifiOff } from "lucide-react"

type PlatformKey = "instagram" | "facebook" | "linkedin" | "google" | "tiktok"

type PlatformConfig = {
  key: PlatformKey
  name: string
  icon: string
  desc: string
  plans: string[]
  color: string
  comingSoon?: boolean
}

const PLATFORMS: PlatformConfig[] = [
  {
    key: "instagram",
    name: "Instagram",
    icon: "📸",
    desc: "Feed, Stories e Reels. A rede principal para conteúdo visual.",
    plans: ["starter", "growth", "pro"],
    color: "#E1306C",
  },
  {
    key: "facebook",
    name: "Facebook",
    icon: "👥",
    desc: "Feed, grupos e anúncios. Alcance uma audiência mais ampla.",
    plans: ["starter", "growth", "pro"],
    color: "#1877F2",
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    desc: "Rede profissional. Ideal para B2B e posicionamento de autoridade.",
    plans: ["growth", "pro"],
    color: "#0A66C2",
  },
  {
    key: "google",
    name: "Google Meu Negócio",
    icon: "🔍",
    desc: "Atualizações no perfil do Google. Aparece nas buscas locais.",
    plans: ["pro"],
    color: "#EA4335",
  },
  {
    key: "tiktok",
    name: "TikTok",
    icon: "🎵",
    desc: "Vídeos curtos com alto alcance orgânico. O formato do momento.",
    plans: ["pro"],
    color: "#000000",
    comingSoon: true,
  },
]

type Connection = {
  platform: PlatformKey
  connected: boolean
  page_name?: string
}

function PlatformCard({ platform, connection, plan, onConnect, onDisconnect }: {
  platform: PlatformConfig
  connection: Connection | null
  plan: string
  onConnect: (key: PlatformKey) => void
  onDisconnect: (key: PlatformKey) => void
}) {
  const isAvailable = platform.plans.includes(plan?.toLowerCase() ?? "starter")
  const isConnected = connection?.connected ?? false

  return (
    <div className="rounded-xl p-5 transition-all"
      style={{
        background: "var(--ink-2)",
        border: `1px solid ${isConnected ? `${platform.color}30` : "var(--border)"}`,
        opacity: !isAvailable ? 0.65 : 1,
      }}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${platform.color}12` }}>
          {platform.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[14px] font-semibold"
              style={{ color: "var(--cream)", textDecoration: !isAvailable ? "line-through" : "none" }}>
              {platform.name}
            </span>
            {platform.comingSoon && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}>
                EM BREVE
              </span>
            )}
            {isConnected && (
              <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(16,185,129,0.12)", color: "var(--green)" }}>
                <CheckCircle size={9} /> CONECTADO
              </span>
            )}
          </div>
          <p className="text-[12px] mb-3 leading-snug" style={{ color: "var(--stone)" }}>{platform.desc}</p>

          {isConnected && connection?.page_name && (
            <div className="flex items-center gap-1.5 text-[11px] mb-3" style={{ color: "var(--stone)" }}>
              <Wifi size={11} />{connection.page_name}
            </div>
          )}

          {isAvailable && !platform.comingSoon && (
            isConnected ? (
              <button onClick={() => onDisconnect(platform.key)}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                style={{ background: "rgba(214,64,69,0.08)", border: "1px solid rgba(214,64,69,0.18)", color: "var(--signal)" }}>
                <WifiOff size={12} /> Desconectar
              </button>
            ) : (
              <button onClick={() => onConnect(platform.key)}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity"
                style={{ background: platform.color }}>
                <ExternalLink size={12} /> Conectar {platform.name}
              </button>
            )
          )}

          {!isAvailable && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "var(--stone)" }}>
              <Lock size={11} />
              Disponível no plano <span className="font-bold capitalize ml-1">{platform.plans[0]}</span>{" "}ou superior
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SocialPageClientSimple({ clientId, clientName, plan = "starter" }: {
  clientId: string
  clientName: string
  plan?: string
}) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/social-connections?client_id=${clientId}`)
        const data = await res.json()
        setConnections(data.connections ?? [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [clientId])

  function handleConnect(key: PlatformKey) {
    if (key === "instagram" || key === "facebook") {
      window.location.href = `/api/oauth/meta?client_id=${clientId}`
    }
  }

  function handleDisconnect(key: PlatformKey) {
    setConnections((prev) => prev.filter((c) => c.platform !== key))
  }

  const connectedCount = connections.filter((c) => c.connected).length
  const availableCount = PLATFORMS.filter((p) => p.plans.includes(plan?.toLowerCase() ?? "starter")).length

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-bebas text-[40px] leading-none mb-1" style={{ color: "var(--cream)" }}>Mídias Sociais</h1>
        <p className="text-[13px]" style={{ color: "var(--stone)" }}>
          {clientName} · {connectedCount} de {availableCount} redes conectadas
        </p>
      </div>

      {plan?.toLowerCase() === "starter" && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl"
          style={{ background: "rgba(214,64,69,0.05)", border: "1px solid rgba(214,64,69,0.15)" }}>
          <div className="text-xl flex-shrink-0">🚀</div>
          <div>
            <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--cream)" }}>Amplie sua divulgação</div>
            <div className="text-[12px] leading-snug mb-3" style={{ color: "var(--stone)" }}>
              Faça um upgrade de plano para publicar no LinkedIn, Google Meu Negócio e TikTok — e alcançar muito mais clientes.
            </div>
            <button className="text-[12px] font-bold px-4 py-2 rounded-lg text-white"
              style={{ background: "var(--signal)" }}>
              Ver planos disponíveis
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16" style={{ color: "var(--stone)" }}>
          <div className="w-5 h-5 border-2 rounded-full border-t-transparent animate-spin mr-3"
            style={{ borderColor: "var(--stone)" }} />
          <span className="text-[13px]">Carregando conexões...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {PLATFORMS.map((p) => (
            <PlatformCard key={p.key} platform={p}
              connection={connections.find((c) => c.platform === p.key) ?? null}
              plan={plan} onConnect={handleConnect} onDisconnect={handleDisconnect} />
          ))}
        </div>
      )}

      <div className="px-4 py-3 rounded-xl text-[11px] leading-snug"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)", color: "var(--stone)" }}>
        🔒 A No Agency nunca armazena suas senhas. As conexões são feitas via login oficial de cada plataforma (OAuth) e podem ser revogadas a qualquer momento.
      </div>
    </div>
  )
}
