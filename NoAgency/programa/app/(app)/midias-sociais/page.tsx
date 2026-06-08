import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"
import SocialPageClient from "./SocialPageClient"
import SocialPageClientSimple from "./SocialPageClientSimple"

export default async function MidiasSociaisPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/login")

  const metaConfigured = !!(process.env.META_APP_ID && process.env.META_APP_SECRET)

  // Admin / manager: full technical view
  if (profile.role === "admin" || profile.role === "manager") {
    return (
      <Suspense fallback={null}>
        <SocialPageClient metaConfigured={metaConfigured} />
      </Suspense>
    )
  }

  // Client: simple connect view
  const supabase = await createClient()
  const { data: client } = await supabase
    .from("clients")
    .select("id, name, plan")
    .or(`profile_id.eq.${profile.id},user_id.eq.${profile.id}`)
    .limit(1)
    .maybeSingle()

  if (!client) redirect("/dashboard")

  return (
    <Suspense fallback={null}>
      <SocialPageClientSimple clientId={client.id} clientName={client.name} plan={client.plan ?? "starter"} />
    </Suspense>
  )
}
