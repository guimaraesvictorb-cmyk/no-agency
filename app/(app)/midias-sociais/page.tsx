"use client"

import { useState } from "react"
import { AtSign, Globe, CheckCircle, AlertCircle, Link, Unlink, RefreshCw } from "lucide-react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"

interface ConnectionStatus {
  platform: "instagram" | "facebook"
  connected: boolean
  pageName?: string
  pageId?: string
  expiresAt?: string
}

const INITIAL_CONNECTIONS: ConnectionStatus[] = [
  {
    platform: "instagram",
    connected: true,
    pageName: "cutelaria.ferreira",
    pageId: "123456789",
    expiresAt: "2026-08-15",
  },
  {
    platform: "facebook",
    connected: true,
    pageName: "Cutelaria Ferreira",
    pageId: "987654321",
    expiresAt: "2026-08-15",
  },
]

export default function MidiasSociaisPage() {
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS)
  const [connecting, setConnecting] = useState<string | null>(null)

  async function handleConnect(platform: string) {
    setConnecting(platform)
    await new Promise((r) => setTimeout(r, 1500))
    setConnecting(null)
  }

  async function handleDisconnect(platform: string) {
    setConnections((prev) =>
      prev.map((c) => (c.platform === platform ? { ...c, connected: false, pageName: undefined } : c))
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-cream mb-1">Conexões de Redes Sociais</h2>
        <p className="text-sm text-stone">Conecte as páginas do cliente para publicação automática.</p>
      </div>

      <div className="space-y-4">
        {connections.map((conn) => {
          const Icon = conn.platform === "instagram" ? AtSign : Globe
          const label = conn.platform === "instagram" ? "Instagram" : "Facebook"
          const isConnecting = connecting === conn.platform

          return (
            <Card key={conn.platform} padding="lg">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  conn.platform === "instagram"
                    ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                    : "bg-blue/15"
                }`}>
                  <Icon size={24} className={conn.platform === "instagram" ? "text-purple-400" : "text-blue"} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-cream">{label}</span>
                    {conn.connected ? (
                      <Badge variant="success">Conectado</Badge>
                    ) : (
                      <Badge variant="neutral">Desconectado</Badge>
                    )}
                  </div>
                  {conn.connected && conn.pageName ? (
                    <div className="text-sm text-stone mt-0.5">
                      @{conn.pageName} · ID: {conn.pageId}
                    </div>
                  ) : (
                    <div className="text-sm text-stone mt-0.5">Nenhuma conta conectada</div>
                  )}
                  {conn.connected && conn.expiresAt && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-stone/60">
                      <CheckCircle size={10} className="text-green" />
                      Token válido até {new Date(conn.expiresAt).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {conn.connected ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConnect(conn.platform)}
                        loading={isConnecting}
                        title="Reconectar"
                      >
                        <RefreshCw size={14} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDisconnect(conn.platform)}
                      >
                        <Unlink size={14} />
                        Desconectar
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(conn.platform)}
                      loading={isConnecting}
                    >
                      <Link size={14} />
                      Conectar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Publishing settings */}
      <Card padding="lg">
        <h3 className="text-sm font-semibold text-cream mb-4">Configurações de Publicação</h3>
        <div className="space-y-4">
          {[
            { label: "Auto-aprovação após 48h sem resposta", description: "Posts aprovados automaticamente se o cliente não responder", defaultOn: true },
            { label: "Publicar no horário de pico", description: "IA determina o melhor horário com base nos dados da conta", defaultOn: true },
            { label: "Notificar cliente após publicação", description: "Enviar e-mail com link do post publicado", defaultOn: false },
          ].map((setting) => {
            const [enabled, setEnabled] = useState(setting.defaultOn)
            return (
              <div key={setting.label} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-cream">{setting.label}</div>
                  <div className="text-xs text-stone mt-0.5">{setting.description}</div>
                </div>
                <button
                  onClick={() => setEnabled(!enabled)}
                  className={`relative w-10 h-5.5 rounded-full transition-colors ${enabled ? "bg-signal" : "bg-ink-4"}`}
                  style={{ height: "22px" }}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-cream shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-amber/5 border border-amber/20 rounded-xl">
        <AlertCircle size={16} className="text-amber flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-medium text-amber">Atenção</div>
          <p className="text-xs text-stone mt-0.5">
            A conexão com Meta usa o token de acesso de longa duração. Tokens expiram após 60 dias e precisam ser renovados.
          </p>
        </div>
      </div>
    </div>
  )
}
