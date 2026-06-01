"use client"

import { useState } from "react"
import { CheckCircle, XCircle, MessageSquare, AtSign, Globe, Clock } from "lucide-react"
import LogoCluster from "@/components/ui/LogoCluster"
import { mockPosts } from "@/lib/mock-data"

type Decision = "approved" | "rejected" | null

export default function AprovacaoPage() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const posts = mockPosts.filter((p) => p.status === "sent_for_approval")

  function decide(postId: string, decision: Decision) {
    setDecisions((prev) => ({ ...prev, [postId]: decision }))
  }

  async function handleSubmit() {
    if (posts.some((p) => !decisions[p.id])) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitted(true)
  }

  const allDecided = posts.length > 0 && posts.every((p) => decisions[p.id])
  const approved = Object.values(decisions).filter((d) => d === "approved").length
  const rejected = Object.values(decisions).filter((d) => d === "rejected").length

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--ink)" }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(16,185,129,0.15)" }}>
            <CheckCircle size={32} style={{ color: "#10B981" }} />
          </div>
          <h2 className="font-bebas text-[48px] text-white leading-none mb-2">Enviado!</h2>
          <p className="text-[13px] text-stone">
            {approved} post{approved !== 1 ? "s" : ""} aprovado{approved !== 1 ? "s" : ""}
            {rejected > 0 && `, ${rejected} rejeitado${rejected !== 1 ? "s" : ""}`}.
          </p>
          <p className="text-[11px] text-stone/50 mt-4">
            Obrigado pelo seu feedback. Nossa equipe irá processar suas respostas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: "var(--ink)" }}>
      <div className="max-w-xl mx-auto">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2.5 mb-5">
            <LogoCluster size={32} variant="dark" />
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1 text-white font-bold text-[13px]">
                NO <span className="w-1 h-1 rounded-full bg-signal inline-block" />
              </div>
              <div className="text-white font-light text-[13px]">AGENCY</div>
            </div>
          </div>
          <h1 className="font-bebas text-[40px] text-white leading-none text-center mb-1">
            Aprovação de Conteúdo
          </h1>
          <p className="text-[13px] text-stone text-center">
            Revise os posts da semana e aprove ou solicite alterações.
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-stone/50">
            <Clock size={11} />
            Link válido por 7 dias
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[12px] text-stone">
            {Object.keys(decisions).length} de {posts.length} avaliados
          </span>
          <div className="flex gap-3">
            {approved > 0 && (
              <span className="text-[12px] font-semibold" style={{ color: "#10B981" }}>
                ✓ {approved} aprovado{approved !== 1 ? "s" : ""}
              </span>
            )}
            {rejected > 0 && (
              <span className="text-[12px] font-semibold" style={{ color: "var(--signal)" }}>
                ✗ {rejected} rejeitado{rejected !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="h-1 rounded-full mb-6" style={{ background: "var(--ink-3)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${posts.length ? (Object.keys(decisions).length / posts.length) * 100 : 0}%`, background: "var(--signal)" }} />
        </div>

        {/* Posts */}
        <div className="space-y-5">
          {posts.map((post) => {
            const decision = decisions[post.id]
            return (
              <div key={post.id} className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: "var(--ink-2)",
                  border: decision === "approved"
                    ? "1px solid rgba(16,185,129,0.4)"
                    : decision === "rejected"
                    ? "1px solid rgba(214,64,69,0.4)"
                    : "1px solid var(--border)",
                }}>
                {post.image_url && (
                  <img src={post.image_url} alt="" className="w-full max-h-80 object-cover" />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 mb-3 text-[11px] text-stone">
                    {post.platform.includes("instagram") && <AtSign size={11} />}
                    {post.platform.includes("facebook") && <Globe size={11} />}
                    <span>{post.platform === "instagram_facebook" ? "Instagram + Facebook" : post.platform}</span>
                    {post.scheduled_for && (
                      <>
                        <span className="mx-1 text-stone/30">·</span>
                        <Clock size={10} />
                        <span>{new Date(post.scheduled_for).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                      </>
                    )}
                  </div>

                  <p className="text-[13px] text-white/90 whitespace-pre-line leading-relaxed mb-4">
                    {post.caption}
                  </p>

                  {/* Approve / Reject buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => decide(post.id, "approved")}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-all"
                      style={decision === "approved"
                        ? { background: "#10B981", color: "#0A0A0A", border: "1px solid #10B981" }
                        : { background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }
                      }>
                      <CheckCircle size={15} />
                      Aprovar
                    </button>
                    <button
                      onClick={() => decide(post.id, "rejected")}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-all"
                      style={decision === "rejected"
                        ? { background: "var(--signal)", color: "var(--cream)", border: "1px solid var(--signal)" }
                        : { background: "rgba(214,64,69,0.1)", color: "var(--signal)", border: "1px solid rgba(214,64,69,0.3)" }
                      }>
                      <XCircle size={15} />
                      Pedir Alteração
                    </button>
                  </div>

                  {decision === "rejected" && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-stone">
                        <MessageSquare size={11} />
                        O que precisa mudar?
                      </div>
                      <textarea
                        value={comments[post.id] ?? ""}
                        onChange={(e) => setComments((p) => ({ ...p, [post.id]: e.target.value }))}
                        placeholder="Descreva o que você quer ajustar..."
                        rows={3}
                        className="w-full px-4 py-3 text-[13px] text-white placeholder:text-stone/40 rounded-lg outline-none focus:border-signal resize-none"
                        style={{ background: "var(--ink-3)", border: "1px solid rgba(214,64,69,0.3)" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit */}
        {posts.length > 0 && (
          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={!allDecided || submitting}
              className="w-full py-4 rounded-xl text-[13px] font-bold uppercase tracking-widest text-white transition-all disabled:opacity-40"
              style={{ background: "var(--signal)" }}>
              {submitting
                ? "Enviando..."
                : allDecided
                ? "Enviar Respostas →"
                : `Avalie todos os ${posts.length} posts para continuar`}
            </button>
            {!allDecided && (
              <p className="text-[11px] text-stone text-center mt-2">
                {posts.length - Object.keys(decisions).length} post{posts.length - Object.keys(decisions).length !== 1 ? "s" : ""} sem avaliação
              </p>
            )}
          </div>
        )}

        <div className="text-center mt-10 text-[11px] text-stone/30">
          Powered by No Agency · IA Social Media Management
        </div>
      </div>
    </div>
  )
}
