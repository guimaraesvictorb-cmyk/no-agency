import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"
import CriativoClient from "./CriativoClient"

export default async function CriativoPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/login")

  const supabase = await createClient()

  // Load clients for selector
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, plan, status")
    .order("name")

  return <CriativoClient profile={profile} clients={clients ?? []} />
}
