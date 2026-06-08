import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PostStatus, NpsCategory, ClientStatus } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("pt-BR", opts ?? { day: "2-digit", month: "short", year: "numeric" })
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return "agora"
  if (mins < 60) return `há ${mins}min`
  if (hours < 24) return `há ${hours}h`
  if (days === 1) return "ontem"
  if (days < 7) return `há ${days} dias`
  return formatDate(d)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Rascunho",
  generated: "Gerado",
  sent_for_approval: "Aguardando Aprovação",
  approved: "Aprovado",
  rejected: "Rejeitado",
  scheduled: "Agendado",
  published: "Publicado",
  auto_approved: "Auto-aprovado",
}

export const POST_STATUS_COLORS: Record<PostStatus, string> = {
  draft: "bg-ink-4 text-stone",
  generated: "bg-blue/20 text-blue",
  sent_for_approval: "bg-amber/20 text-amber",
  approved: "bg-green/20 text-green",
  rejected: "bg-signal/20 text-signal",
  scheduled: "bg-blue/30 text-blue",
  published: "bg-green/30 text-green",
  auto_approved: "bg-green/20 text-green",
}

export const NPS_COLORS: Record<NpsCategory, string> = {
  promoter: "text-green",
  passive: "text-amber",
  detractor: "text-signal",
}

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Ativo",
  onboarding: "Onboarding",
  paused: "Pausado",
  churned: "Encerrado",
}

export function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    instagram_facebook: "Instagram + Facebook",
  }
  return labels[platform] ?? platform
}

export function getPlanLabel(plan: string): string {
  const labels: Record<string, string> = {
    starter: "Starter",
    growth: "Growth",
    pro: "Pro",
  }
  return labels[plan] ?? plan
}

export function calcNpsScore(scores: number[]): number {
  if (!scores.length) return 0
  const promoters = scores.filter((s) => s >= 9).length
  const detractors = scores.filter((s) => s <= 6).length
  return Math.round(((promoters - detractors) / scores.length) * 100)
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export const DAYS_PT: Record<string, string> = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
}
