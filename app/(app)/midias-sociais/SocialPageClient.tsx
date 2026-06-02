"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useSelectedClient } from "@/lib/context/ClientContext"
import { AtSign, Globe, RefreshCw, AlertCircle, CheckCircle, ExternalLink } from "lucide-react"

interface Connection {
  id: string
  platform: "instagram" | "facebook"
  page_id: string
  page_name: string
  is_active: boolean
  connected_at: string
  token_expires_at: string | null
}

interface Setting {
  id: string
  label: string
  description: string
  on: boolean
}

const DEFAULT_SETTINGS: Setting[] = [
  { id: "auto",   label: "Auto-aprovação após 5 dias sem resposta", description: "Posts aprovados automaticamente se o cliente não responder", on: true  },
  { id: "peak",   label: "Publicar no horário de pico",             description: "IA determina o melhor horário com base nos dados da conta",  on: true  },
  { id: "notify", label: "Notificar cliente após publicação",        description: "Enviar e-mail com link do post publicado",                    on: false },
]

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex-shrink-0 w-10 rounded-full transition-colors"
      style={{ height: "22px", background: on ? "var(--signal)" : "var(--ink-4)" }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-150"
        style={{ left: on ? "calc(100% - 18px)" : "2px" }}
      />
    </button>
  )
}

function SetupCard() {
  return (
    <div className="rounded-xl p-6 space-y-4"
      style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)" }}>
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
        <div>
          <div className="text-[13px] font-semibold text-white mb-1">Configuração necessária</div>
          <p className="text-[12px] text-stone">
            Para conectar contas Meta, configure as variáveis de ambiente{" "}
            <code className="text-amber text-[11px] bg-ink-3 px-1.5 py-0.5 rounded">META_APP_ID</code>{" "}
            e{" "}
            <code className="text-amber text-[11px] bg-ink-3 px-1.5 py-0.5 rounded">META_APP_SECRET</code>{" "}
            no Vercel.
          </p>
        </div>
      </div>
      <ol className="space-y-2 text-[12px] text-stone pl-2">
        <li className="flex gap-2"><span className="text-signal font-bold">1.</span> Acesse <span className="text-white">developers.facebook.com</span> e crie um app do tipo "Business"</li>
        <li className="flex gap-2"><span className="text-signal font-bold">2.</span> Adicione o produto "Instagram Graph API" e "Facebook Login"</li>
        <li className="flex gap-2"><span className="text-signal font-bold">3.</span> Em "Configurações &gt; Básico", copie o App ID e o App Secret</li>
        <li className="flex gap-2"><span className="text-signal font-bold">4.</span> Adicione como URI de redirecionamento: <code className="text-amber text-[11px] bg-ink-3 px-1 py-0.5 rounded">seudominio.com/api/oauth/meta/callback</code></li>
        <li className="flex gap-2"><span className="text-signal font-bold">5.</span> Cole as chaves em Vercel → Settings → Environment Variables</li>
      </ol>
      <a
        href="https://developers.facebook.com/apps"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-white"
        style={{ background: "var(--signal)" }}
      >
        <ExternalLink size={12} />
        Abrir Meta for Developers
      </a>
    </div>
  )
}

export default function SocialPageClient({ metaConfigured }: { metaConfigured: boolean }) {
  const { client: selectedClient } = useSelectedClient()
  const searchParams = useSearchParams()

  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(false)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const loadConnections = useCallback(async (clientId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/social-connections?client_id=${clientId}`)
      const data = await res.json()
      if (data.connections) setConnections(data.connections)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedClient?.id) loadConnections(selectedClient.id)
  }, [selectedClient?.id, loadConnections])

  // Handle OAuth callback result
  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    if (success === "true") {
      showToast("success", "Conta Meta conectada com sucesso!")
      if (selectedClient?.id) loadConnections(selectedClient.id)
      window.history.replaceState({}, "", "/midias-sociais")
    } else if (error) {
      const msgs: Record<string, string> = {
        cancelled:      "Conexão cancelada.",
        invalid:        "Parâmetros inválidos.",
        state:          "Sessão expirada. Tente novamente.",
        auth:           "Erro de autenticação.",
        no_pages:       "Nenhuma página encontrada nessa conta.",
        token:          "Erro ao obter token. Verifique o Meta App.",
        not_configured: "Meta não configurado. Adicione META_APP_ID e META_APP_SECRET no Vercel.",
      }
      showToast("error", msgs[error] ?? "Erro desconhecido.")
      window.history.replaceState({}, "", "/midias-sociais")
    }
  }, [searchParams, selectedClient?.id, loadConnections])

  async function handleDisconnect(conn: Connection) {
    if (!selectedClient?.id) return
    setDisconnecting(conn.id)
    try {
      const res = await fetch("/api/social-connections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: conn.id, client_id: selectedClient.id }),
      })
      if (res.ok) {
        setConnections((prev) => prev.filter((c) => c.id !== conn.id))
        showToast("success", `${conn.platform === "instagram" ? "Instagram" : "Facebook"} desconectado.`)
      }
    } finally {
      setDisconnecting(null)
    }
  }

  function handleConnect() {
    if (!selectedClient?.id) return
    window.location.href = `/api/oauth/meta?client_id=${selectedClient.id}`
  }

  const igConn = connections.find((c) => c.platform === "instagram")
  const fbConn = connections.find((c) => c.platform === "facebook")

  type PlatformSlot = {
    platform: "instagram" | "facebook"
    label: string
    conn: Connection | undefined
    color: string
    bg: string
    Icon: typeof AtSign
  }

  const platforms: PlatformSlot[] = [
    { platform: "instagram", label: "Instagram", conn: igConn, color: "#A855F7", bg: "rgba(168,85,247,0.12)", Icon: AtSign },
    { platform: "facebook",  label: "Facebook",  conn: fbConn, color: "#6366F1", bg: "rgba(99,102,241,0.12)", Icon: Globe  },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[13px] font-semibold text-white"
          style={{
            background: toast.type === "success" ? "rgba(16,185,129,0.95)" : "rgba(214,64,69,0.95)",
            border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.4)" : "rgba(214,64,69,0.4)"}`,
          }}
        >
          {toast.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Mídias Sociais</h1>
        <p className="text-[13px] text-stone">
          {selectedClient
            ? `Conexões para ${selectedClient.name}`
            : "Conecte as páginas do cliente para publicação automática."}
        </p>
      </div>

      {!metaConfigured ? (
        <SetupCard />
      ) : (
        <>
          {/* Connection cards */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-10 text-stone text-[13px]">Carregando conexões...</div>
            ) : (
              platforms.map(({ platform, label, conn, color, bg, Icon }) => (
                <div
                  key={platform}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl"
                  style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}
                >
                  <div className="p-3 rounded-xl flex-shrink-0" style={{ background: bg }}>
                    <Icon size={22} style={{ color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-semibold text-white">{label}</span>
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={
                          conn
                            ? { background: "rgba(16,185,129,0.15)", color: "#10B981" }
                            : { background: "rgba(138,133,130,0.15)", color: "#8A8582" }
                        }
                      >
                        {conn ? "Conectado" : "Desconectado"}
                      </span>
                    </div>
                    {conn ? (
                      <>
                        <div className="text-[12px] text-stone">
                          @{conn.page_name} · ID: {conn.page_id}
                        </div>
                        {conn.token_expires_at && (
                          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-stone/50">
                            <CheckCircle size={10} style={{ color: "#10B981" }} />
                            Token válido até{" "}
                            {new Date(conn.token_expires_at).toLocaleDateString("pt-BR", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[12px] text-stone">Nenhuma conta conectada</div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {conn ? (
                      <button
                        onClick={() => handleDisconnect(conn)}
                        disabled={disconnecting === conn.id}
                        className="px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50"
                        style={{
                          background: "rgba(214,64,69,0.1)",
                          border: "1px solid rgba(214,64,69,0.3)",
                          color: "var(--signal)",
                        }}
                      >
                        {disconnecting === conn.id ? (
                          <RefreshCw size={11} className="animate-spin" />
                        ) : (
                          "Desconectar"
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Connect button */}
          {!loading && (
            <button
              onClick={handleConnect}
              disabled={!selectedClient}
              className="w-full py-3 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: "var(--signal)" }}
            >
              <RefreshCw size={14} />
              {connections.length > 0 ? "Reconectar conta Meta" : "Conectar conta Meta"}
            </button>
          )}
        </>
      )}

      {/* Publish settings */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}
      >
        <div className="text-[13px] font-semibold text-white">Configurações de Publicação</div>
        {settings.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-4 pt-4"
            style={i > 0 ? { borderTop: "1px solid var(--border)" } : {}}
          >
            <div>
              <div className="text-[13px] font-medium text-white">{s.label}</div>
              <div className="text-[11px] text-stone mt-0.5">{s.description}</div>
            </div>
            <Toggle
              on={s.on}
              onToggle={() =>
                setSettings((prev) => prev.map((x) => (x.id === s.id ? { ...x, on: !x.on } : x)))
              }
            />
          </div>
        ))}
      </div>

      {/* Warning */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
      >
        <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
        <div>
          <div className="text-[12px] font-semibold" style={{ color: "#F59E0B" }}>Atenção</div>
          <p className="text-[12px] text-stone mt-0.5">
            Tokens Meta de longa duração expiram após 60 dias. Reconecte a conta antes do vencimento para manter a publicação automática funcionando.
          </p>
        </div>
      </div>
    </div>
  )
}
