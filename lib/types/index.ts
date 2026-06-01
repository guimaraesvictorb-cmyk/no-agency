export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PostStatus =
  | "draft"
  | "generated"
  | "sent_for_approval"
  | "approved"
  | "rejected"
  | "scheduled"
  | "published"
  | "auto_approved"

export type NpsCategory = "promoter" | "passive" | "detractor"
export type NpsTrigger = "onboarding" | "post_approval" | "monthly"
export type ClientStatus = "active" | "onboarding" | "paused" | "churned"
export type SocialPlatform = "instagram" | "facebook" | "instagram_facebook"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: "admin" | "manager" | "viewer"
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  profile_id: string
  name: string
  logo_url: string | null
  status: ClientStatus
  plan: "starter" | "growth" | "pro"
  onboarding_completed_at: string | null
  settings: Json
  created_at: string
  updated_at: string
}

export interface DnaBrief {
  id: string
  client_id: string
  // Block 1 — Empresa
  company_name: string
  segment: string
  city: string
  differentials: string
  // Block 2 — Cliente Ideal
  ideal_client_age: string
  ideal_client_gender: string
  ideal_client_pain: string
  ideal_client_dream: string
  // Block 3 — Tom de Voz
  tone_adjectives: string[]
  tone_avoid: string
  tone_example: string
  // Block 4 — Operacional
  posting_days: string[]
  posting_frequency: number
  platform: SocialPlatform
  content_themes: string[]
  ai_notes: string | null
  version: number
  created_at: string
  updated_at: string
}

export interface SocialConnection {
  id: string
  client_id: string
  platform: SocialPlatform
  page_id: string
  page_name: string
  access_token_encrypted: string
  token_expires_at: string | null
  is_active: boolean
  connected_at: string
}

export interface PostBatch {
  id: string
  client_id: string
  week_reference: string
  status: "draft" | "sent_for_approval" | "approved" | "published"
  approval_sent_at: string | null
  approved_at: string | null
  posts_count: number
  created_at: string
}

export interface Post {
  id: string
  client_id: string
  batch_id: string | null
  status: PostStatus
  platform: SocialPlatform
  caption: string
  image_url: string | null
  image_prompt: string | null
  scheduled_for: string | null
  published_at: string | null
  rejection_reason: string | null
  ai_generation_metadata: Json
  created_at: string
  updated_at: string
}

export interface ApprovalToken {
  id: string
  client_id: string
  batch_id: string
  token_hash: string
  expires_at: string
  used_at: string | null
  created_at: string
}

export interface NpsResponse {
  id: string
  client_id: string
  score: number
  category: NpsCategory
  trigger: NpsTrigger
  comment: string | null
  created_at: string
}

export interface MediaFile {
  id: string
  client_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  tags: string[]
  uploaded_at: string
}

export interface Report {
  id: string
  client_id: string
  week_reference: string
  metrics: {
    reach: number
    impressions: number
    engagement_rate: number
    new_followers: number
    posts_published: number
    top_post_url: string | null
  }
  ai_insights: string | null
  sent_at: string | null
  created_at: string
}

// Dashboard aggregates
export interface DashboardStats {
  total_clients: number
  active_clients: number
  posts_this_week: number
  pending_approvals: number
  avg_nps: number
  posts_published_month: number
}

export interface PipelineColumn {
  id: PostStatus
  label: string
  posts: Post[]
}
