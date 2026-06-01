"use client"

import { useState } from "react"
import { CheckCircle, XCircle, MessageSquare, AtSign, Globe, Clock } from "lucide-react"
import Button from "@/components/ui/Button"
import { mockPosts } from "@/lib/mock-data"

type Decision = "approved" | "rejected" | null

export default function AprovacaoPage() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // In real app: fetch posts by token from API
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
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green" />
          </div>
          <h2 className="text-2xl font-semibold text-cream mb-2">Enviado!</h2>
          <p className="text-stone">
            {approved} post{approved !== 1 ? "s" : ""} aprovado{approved !== 1 ? "s" : ""}
            {rejected > 0 && `, ${rejected} rejeitado${rejected !== 1 ? "s" : ""}`}.
          </p>
          <p className="text-xs text-stone/60 mt-4">Obrigado pelo seu feedback. Nossa equipe irá processar suas respostas.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-signal rounded-lg flex items-center justify-center">
              <span className="text-cream font-bebas text-lg">N</span>
            </div>
            <span className="font-bebas text-xl text-cream tracking-wide">NO AGENCY</span>
          </div>
          <h1 className="text-2xl font-semibold text-cream mb-2">Aprovação de Conteúdo</h1>
          <p className="text-stone text-sm">
            Revise os posts da semana e aprove ou solicite alterações.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-stone/60">
            <Clock size={12} />
            Link válido por 7 dias
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-6 text-sm">
          <span className="text-stone">{Object.keys(decisions).length} de {posts.length} avaliados</span>
          <div className="flex gap-3">
            {approved > 0 && <span className="text-green">✓ {approved} aprovado{approved !== 1 ? "s" : ""}</span>}
            {rejected > 0 && <span className="text-signal">✗ {rejected} rejeitado{rejected !== 1 ? "s" : ""}</span>}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => {
            const decision = decisions[post.id]
            return (
              <div
                key={post.id}
                className={`bg-ink-2 border rounded-2xl overflow-hidden transition-all ${
                  decision === "approved"
                    ? "border-green/40"
                    : decision === "rejected"
                    ? "border-signal/40"
                    : "border-border"
                }`}
              >
                {post.image_url && (
                  <img src={post.image_url} alt="" className="w-full max-h-80 object-cover" />
                )}
                <div className="p-5">
                  {/* Platform */}
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-stone">
                    {post.platform.includes("instagram") && <AtSign size={12} />}
                    {post.platform.includes("facebook") && <Globe size={12} />}
                    <span>{post.platform === "instagram_facebook" ? "Instagram + Facebook" : post.platform}</span>
                    {post.scheduled_for && (
                      <>
                        <span className="mx-1">·</span>
                        <Clock size={10} />
                        <span>{new Date(post.scheduled_for).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                      </>
                    )}
                  </div>

                  {/* Caption */}
                  <p className="text-sm text-cream/90 whitespace-pre-line leading-relaxed mb-4">
                    {post.caption}
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => decide(post.id, "approved")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all border ${
                        decision === "approved"
                          ? "bg-green text-ink border-green"
                          : "bg-green/10 text-green border-green/30 hover:bg-green/20"
                      }`}
                    >
                      <CheckCircle size={16} />
                      Aprovar
                    </button>
                    <button
                      onClick={() => decide(post.id, "rejected")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all border ${
                        decision === "rejected"
                          ? "bg-signal text-cream border-signal"
                          : "bg-signal/10 text-signal border-signal/30 hover:bg-signal/20"
                      }`}
                    >
                      <XCircle size={16} />
                      Pedir Alteração
                    </button>
                  </div>

                  {/* Comment box for rejected */}
                  {decision === "rejected" && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 mb-1.5 text-xs text-stone">
                        <MessageSquare size={12} />
                        O que precisa mudar?
                      </div>
                      <textarea
                        value={comments[post.id] ?? ""}
                        onChange={(e) => setComments((p) => ({ ...p, [post.id]: e.target.value }))}
                        placeholder="Descreva o que você quer ajustar..."
                        rows={3}
                        className="w-full bg-ink-3 border border-signal/30 rounded-lg px-3 py-2.5 text-sm text-cream placeholder:text-stone focus:outline-none focus:border-signal resize-none"
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
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={!allDecided}
              size="lg"
              className="w-full"
            >
              {allDecided ? "Enviar Respostas" : `Avalie todos os ${posts.length} posts para continuar`}
            </Button>
            {!allDecided && (
              <p className="text-xs text-stone text-center mt-2">
                {posts.length - Object.keys(decisions).length} post{posts.length - Object.keys(decisions).length !== 1 ? "s" : ""} sem avaliação
              </p>
            )}
          </div>
        )}

        <div className="text-center mt-8 text-xs text-stone/40">
          Powered by No Agency · IA Social Media Management
        </div>
      </div>
    </div>
  )
}
