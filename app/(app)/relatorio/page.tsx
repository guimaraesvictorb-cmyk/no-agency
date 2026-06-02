import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"
import RelatorioAdmin from "./RelatorioAdmin"
import RelatorioCliente from "./RelatorioCliente"

export default async function RelatorioPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/login")

  if (profile.role === "admin" || profile.role === "manager") {
    return <RelatorioAdmin />
  }

  const supabase = await createClient()
  const { data: client } = await supabase
    .from("clients")
    .select("id, name")
    .or(`profile_id.eq.${profile.id},user_id.eq.${profile.id}`)
    .limit(1)
    .maybeSingle()

  if (!client) redirect("/dashboard")

  return <RelatorioCliente clientId={client.id} clientName={client.name} />
}
