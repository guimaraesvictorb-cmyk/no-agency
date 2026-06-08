"use client"

import { useState } from "react"
import { MessageCircle, X, Send, Phone, Mail } from "lucide-react"

export default function SupportButton() {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [msg, setMsg] = useState("")

  function handleSend() {
    if (!msg.trim()) return
    const text = encodeURIComponent(`Suporte No Agency: ${msg}`)
    window.open(`https://wa.me/5511999999999?text=${text}`, "_blank")
    setSent(true)
    setMsg("")
    setTimeout(() => { setSent(false); setOpen(false) }, 2000)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="rounded-2xl shadow-modal overflow-hidden w-80"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ background: "var(--signal)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-white">Suporte No Agency</div>
                <div className="text-[10px] text-white/70">Resposta em até 1h</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-[13px] font-semibold text-white">Mensagem enviada!</div>
                <div className="text-[11px] text-stone mt-1">Redirecionando para o WhatsApp...</div>
              </div>
            ) : (
              <>
                {/* Quick options */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[11px] font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)" }}
                  >
                    <Phone size={13} className="text-green-400" />
                    WhatsApp
                  </a>
                  <a
                    href="mailto:suporte@noagency.com.br"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[11px] font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)" }}
                  >
                    <Mail size={13} className="text-blue-400" />
                    E-mail
                  </a>
                </div>

                {/* Message input */}
                <div>
                  <textarea
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Descreva o que precisa de ajuda..."
                    rows={3}
                    className="w-full rounded-lg px-3 py-2.5 text-[12px] text-white placeholder:text-stone resize-none focus:outline-none"
                    style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.metaKey) handleSend()
                    }}
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={!msg.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-bold text-white transition-opacity disabled:opacity-40"
                  style={{ background: "var(--signal)" }}
                >
                  <Send size={13} />
                  Enviar via WhatsApp
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full shadow-modal flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ background: "var(--signal)" }}
        aria-label="Suporte"
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageCircle size={22} className="text-white" />
        )}
      </button>
    </div>
  )
}
