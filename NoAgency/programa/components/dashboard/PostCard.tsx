"use client"

import { cn, POST_STATUS_LABELS, POST_STATUS_COLORS, formatDate, getPlatformLabel } from "@/lib/utils"
import type { Post } from "@/lib/types"
import Badge from "@/components/ui/Badge"
import { AtSign, Globe, Clock, CheckCircle, XCircle } from "lucide-react"

interface PostCardProps {
  post: Post
  clientName?: string
}

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "instagram") return <AtSign size={12} />
  if (platform === "facebook") return <Globe size={12} />
  return (
    <div className="flex gap-0.5">
      <AtSign size={12} />
      <Globe size={12} />
    </div>
  )
}

function statusVariant(status: string): "default" | "success" | "warning" | "error" | "info" | "neutral" {
  const map: Record<string, "default" | "success" | "warning" | "error" | "info" | "neutral"> = {
    draft: "neutral",
    generated: "info",
    sent_for_approval: "warning",
    approved: "success",
    rejected: "error",
    scheduled: "info",
    published: "success",
    auto_approved: "success",
  }
  return map[status] ?? "default"
}

export default function PostCard({ post, clientName }: PostCardProps) {
  return (
    <div className="bg-ink-3 border border-border rounded-lg p-3 space-y-2.5 hover:border-stone/40 transition-colors cursor-pointer">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        {clientName && (
          <span className="text-[10px] font-medium text-stone truncate">{clientName}</span>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-stone">
            <PlatformIcon platform={post.platform} />
          </span>
          <Badge variant={statusVariant(post.status)}>
            {POST_STATUS_LABELS[post.status]}
          </Badge>
        </div>
      </div>

      {/* Image */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post preview"
          className="w-full h-28 object-cover rounded-lg"
        />
      )}

      {/* Caption preview */}
      <p className="text-xs text-cream/80 line-clamp-3 leading-relaxed">
        {post.caption || <span className="italic text-stone">Aguardando geração de conteúdo...</span>}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        {post.scheduled_for ? (
          <div className="flex items-center gap-1 text-[10px] text-stone">
            <Clock size={10} />
            {formatDate(post.scheduled_for, { day: "2-digit", month: "short" })}
          </div>
        ) : (
          <div className="text-[10px] text-stone">Sem data</div>
        )}
        {post.status === "sent_for_approval" && (
          <div className="flex gap-1">
            <button className="p-1 rounded text-green hover:bg-green/10 transition-colors" title="Aprovar">
              <CheckCircle size={14} />
            </button>
            <button className="p-1 rounded text-signal hover:bg-signal/10 transition-colors" title="Rejeitar">
              <XCircle size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
