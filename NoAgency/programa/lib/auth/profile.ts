import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/types"

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) return null

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle()

  if (data) return data as Profile

  // Profile missing — auto-create from auth metadata to prevent redirect loops
  const fallback: Profile = {
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "",
    avatar_url: null,
    role: "manager",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  await supabase.from("profiles").upsert(fallback, { onConflict: "id" })

  return fallback
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile()
  if (!profile) throw new Error("Não autenticado")
  if (profile.role !== "admin") throw new Error("Acesso negado")
  return profile
}
