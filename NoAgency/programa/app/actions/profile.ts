"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { full_name: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: data.full_name, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/", "layout")
}

export async function updateClientStatus(clientId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") throw new Error("Acesso negado")

  const { error } = await supabase
    .from("clients")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", clientId)

  if (error) throw new Error(error.message)
  revalidatePath("/admin")
}

export async function deleteClientRecord(clientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") throw new Error("Acesso negado")

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)

  if (error) throw new Error(error.message)
  revalidatePath("/admin")
}

export async function createClient_(data: {
  name: string
  plan: string
  user_email?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") throw new Error("Acesso negado")

  const { error } = await supabase
    .from("clients")
    .insert({
      profile_id: user.id,
      name: data.name,
      plan: data.plan,
      status: "onboarding",
    })

  if (error) throw new Error(error.message)
  revalidatePath("/admin")
}
