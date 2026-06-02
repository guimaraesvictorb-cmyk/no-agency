import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/types"

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, created_at, updated_at")
    .eq("id", user.id)
    .single()

  return data as Profile | null
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile()
  if (!profile) throw new Error("Não autenticado")
  if (profile.role !== "admin") throw new Error("Acesso negado")
  return profile
}
