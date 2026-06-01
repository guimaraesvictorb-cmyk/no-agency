"use client"

import { useState } from "react"
import { AtSign, Globe, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

interface SocialConn {
  platform: "instagram" | "facebook"
  connected: boolean
  pageName?: string
  pageId?: string
  expiresAt?: string
}

const INITIAL: SocialConn[] = [
  { platform: "instagram", connected: true, pageName: "slr.engenharia", pageId: "111222333", expiresAt: "2026-08-15" },
  { platform: "facebook",  connected: true, pageName: "SLR Engenharia", pageId: "444555666", expiresAt: "2026-08-15" },
]

const SETTINGS = [
  { id: "auto", label: "Auto-aprovação após 5 dias sem resposta", description: "Posts aprovados automaticamente se o cliente não responder", on: true },
  { id: "peak", label: "Publicar no horário de pico", description: "IA determina o melhor horário com base nos dados da conta", on: true },
  { id: "notify", label: "Notificar cliente após publicação", description: "Enviar e-mail com link do post publicado", on: false },
]

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="relative flex-shrink-0 w-10 rounded-full transition-colors"
      style={{ height: "22px", background: on ? "var(--signal)" : "var(--ink-4)" }}>
      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration
-150"
        style={{ left: on ? "calc(100% - 18px)" : "2px" }} />
    </button>
  )
}

export default function MidiasSociaisPage() {
  const [connections, setConnections] = useState(INITIAL)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [settings, setSettings] = useState(SETTINGS)

  async function handleReconnect(platform: string) {
    setConnecting(platform)
    await new Promise((r) => setTimeout(r, 1500))
    setConnecting(null)
  }

  function handleDisconnect(platform: string) {
    setConnections((prev) =>
      prev.map((c) => c.platform === platform ? { ...c, connected: false, pageName: undefined } : c)
    )
  }

  function handleConnect(platform: string) {
    setConnections((prev) =>
      prev.map((c) => c.platform === platform
        ? { ...c, connected: true, pageName: platform === "instagram" ? "slr.engenharia" : "SLR Engenharia", pageId: "111222333", expiresAt: "2026-08-15" }
        : c
      )
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Mídias Sociais</h1>
        <p className="text-[13px] text-stone">Conecte as páginas do cliente para publicação automática.</p>
      </div>

      {/* Connection cards */}
      <div className="space-y-3">
        {connections.map((conn) => {
          const isIG = conn.platform === "instagram"
          const label = isIG ? "Instagram" : "Facebook"
          const Icon = isIG ? AtSign : Globe
          const isConnecting = connecting === conn.platform

          return (
            <div key={conn.platform} className="flex items-center gap-4 px-5 py-4 rounded-xl"
              style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
              <div className="p-3 rounded-xl flex-shrink-0"
                style={{ background: isIG ? "rgba(168,85,247,0.12)" : "rgba(99,102,241,0.12)" }}>
                <Icon size={22} style={{ color: isIG ? "#A855F7" : "#6366F1" }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-semibold text-white">{label}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={conn.connected
                      ? { background: "rgba(16,185,129,0.15)", color: "#10B981" }
                      : { background: "rgba(138,133,130,0.15)", color: "#8A8582" }
                    }>
                    {conn.connected ? "Conectado" : "Desconectado"}
                  </span>
                </div>
                {conn.connected && conn.pageName ? (
                  <div className="text-[12px] text-stone">@{conn.pageName} · ID: {conn.pageId}</div>
                ) : (
                  <div className="text-[12px] text-stone">Nenhuma conta conectada</div>
                )}
                {conn.connected && conn.expiresAt && (
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] text-stone/50">
                    <CheckCircle size={10} style={{ color: "#10B981" }} />
                    Token válido até {new Date(conn.expiresAt).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {conn.connected ? (
                  <>
                    <button
                      onClick={() => handleReconnect(conn.platform)}
                      disabled={!!isConnecting}
                      className="p-2 rounded-lg text-stone hover:text-white transition-colors"
                      style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
                      title="Reconectar">
                      <RefreshCw size={13} className={isConnecting ? "animate-spin" : ""} />
                    </button>
                    <button
                      onClick={() => handleDisconnect(conn.platform)}
                      className="px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors"
                      style={{ background: "rgba(214,64,69,0.1)", border: "1px solid rgba(214,64,69,0.3)", color: "var(--signal)" }}>
                      Desconectar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(conn.platform)}
                    className="px-4 py-2 rounded-lg text-[12px] font-bold text-white"
                    style={{ background: "var(--signal)" }}>
                    Conectar
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Publish settings */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
        <div className="text-[13px] font-semibold text-white">Configurações de Publicação</div>
        {settings.map((s, i) => (
          <div key={s.id} className="flex items-center justify-between gap-4 pt-4"
            style={i > 0 ? { borderTop: "1px solid var(--border)" } : {}}>
            <div>
              <div className="text-[13px] font-medium text-white">{s.label}</div>
              <div className="text-[11px] text-stone mt-0.5">{s.description}</div>
            </div>
            <Toggle on={s.on} onToggle={() => setSettings((prev) => prev.map((x) => x.id === s.id ? { ...x, on: !x.on } : x))} />
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
        <div>
          <div className="text-[12px] font-semibold" style={{ color: "#F59E0B" }}>Atenção</div>
          <p className="text-[12px] text-stone mt-0.5">
            A conexão com Meta usa o token de acesso de longa duração. Tokens expiram após 60 dias e precisam ser renovados.
          </p>
        </div>
      </div>
    </div>
  )
}
