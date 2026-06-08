import type { Post, PostStatus } from "@/lib/types"
import PostCard from "./PostCard"
import { mockClients } from "@/lib/mock-data"

const COLUMNS: { id: PostStatus; label: string; color: string }[] = [
  { id: "draft", label: "Rascunho", color: "bg-ink-4/50" },
  { id: "generated", label: "Gerado", color: "bg-blue/10" },
  { id: "sent_for_approval", label: "Aguardando Aprovação", color: "bg-amber/10" },
  { id: "approved", label: "Aprovado", color: "bg-green/10" },
  { id: "scheduled", label: "Agendado", color: "bg-blue/15" },
  { id: "published", label: "Publicado", color: "bg-green/15" },
]

interface PipelineProps {
  posts: Post[]
}

export default function Pipeline({ posts }: PipelineProps) {
  const clientMap = Object.fromEntries(mockClients.map((c) => [c.id, c.name]))

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
      {COLUMNS.map((col) => {
        const colPosts = posts.filter((p) => p.status === col.id)
        return (
          <div key={col.id} className="flex-shrink-0 w-64">
            <div className={`rounded-xl border border-border p-3 h-full ${col.color}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-cream">{col.label}</h3>
                <span className="text-[10px] bg-ink-3 text-stone px-1.5 py-0.5 rounded-full font-medium">
                  {colPosts.length}
                </span>
              </div>
              <div className="space-y-2">
                {colPosts.length === 0 ? (
                  <div className="text-[11px] text-stone/50 text-center py-4 italic">Vazio</div>
                ) : (
                  colPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      clientName={clientMap[post.client_id]}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
