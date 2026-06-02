"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

interface Connection {
  id: string
  platform: string
  page_id: string
  page_name: string
  token_expires_at: string | null
  connected_at: string
}

export default function SocialPageClientSimple({
  clientId,
  clientName,
}: {
  clientId: string
  clientName: string
}) {
  const searchParams = useSearchParams()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/social-connections?client_id=${clientId}`)
      const data = await res.json()
      if (data.connections) setConnections(data.connections)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    if (success === "true") {
      showToast("success", "Conta conectada com sucesso!")
      load()
      window.history.replaceState({}, "", "/midias-sociais")
    } else if (error) {
      const msgs: Record<string, string> = {
        cancelled:      "Conexão cancelada.",
        no_pages:       "Nenhuma página encontrada. Verifique se sua conta tem uma Página do Facebook.",
        token:          "Erro ao conectar. Tente novamente.",
        not_configured: "Plataforma ainda não configurada. Fale com a No Agency.",
        state:          "Sessão expirada. Tente novamente.",
      }
      showToast("error", msgs[error] ?? "Erro ao conectar. Tente novamente.")
      window.history.replaceState({}, "", "/midias-sociais")
    }
  }, [searchParams, load])

  const fbConn  = connections.find((c) => c.platform === "facebook")
  const igConn  = connections.find((c) => c.platform === "instagram")
  const isConnected = !!(fbConn || igConn)

  function handleConnect() {
    window.location.href = `/api/oauth/meta?client_id=${clientId}`
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[13px] font-semibold text-white"
          style={{
            background: toast.type === "success" ? "rgba(16,185,129,0.95)" : "rgba(214,64,69,0.95)",
          }}
        >
          {toast.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Mídias Sociais</h1>
        <p className="text-[13px] text-stone">Conecte sua conta para publicação automática.</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-stone text-[13px]">Verificando conexão...</div>
      ) : isConnected ? (
        /* Connected state */
        <div className="rounded-2xl p-6 space-y-4"
          style={{ background: "var(--ink-2)", border: "1px solid rgba(16,185,129,0.3)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(16,185,129,0.15)" }}>
              <CheckCircle size={20} style={{ color: "#10B981" }} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-white">Conta conectada</div>
              <div className="text-[12px] text-stone">{clientName}</div>
            </div>
          </div>

          {fbConn && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold"
                style={{ background: "rgba(99,102,241,0.15)", color: "#6366F1" }}>f</div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-white">{fbConn.page_name}</div>
                <div className="text-[11px] text-stone">Página do Facebook</div>
              </div>
              <CheckCircle size={14} style={{ color: "#10B981" }} />
            </div>
          )}

          {igConn && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold"
                style={{ background: "rgba(168,85,247,0.15)", color: "#A855F7" }}>ig</div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-white">@{igConn.page_name}</div>
                <div className="text-[11px] text-stone">Instagram Business</div>
              </div>
              <CheckCircle size={14} style={{ color: "#10B981" }} />
            </div>
          )}

          {(fbConn?.token_expires_at || igConn?.token_expires_at) && (
            <div className="text-[11px] text-stone/60 text-center">
              Conexão válida até{" "}
              {new Date(
                (fbConn?.token_expires_at ?? igConn?.token_expires_at)!
              ).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
          )}

          <button
            onClick={handleConnect}
            className="w-full py-3 rounded-xl text-[12px] font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--ink-3)", border: "1px solid var(--border)", color: "var(--stone)" }}
          >
            <RefreshCw size={12} className="inline mr-1.5" />
            Reconectar conta
          </button>
        </div>
      ) : (
        /* Disconnected state */
        <div className="rounded-2xl p-8 flex flex-col items-center text-center space-y-5"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.12)" }}>
            <span className="text-[32px] font-black" style={{ color: "#6366F1" }}>f</span>
          </div>
          <div>
            <div className="text-[16px] font-bold text-white mb-1">Conecte sua conta</div>
            <p className="text-[13px] text-stone max-w-xs">
              Vincule sua Página do Facebook e perfil do Instagram para que a No Agency possa publicar seus conteúdos automaticamente.
            </p>
          </div>
          <button
            onClick={handleConnect}
            className="w-full py-3.5 rounded-xl text-[13px] font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: "#1877F2" }}
          >
            Conectar conta Facebook
          </button>
          <p className="text-[11px] text-stone/50">
            Você será redirecionado para o Facebook para autorizar o acesso.
          </p>
        </div>
      )}
    </div>
  )
}
