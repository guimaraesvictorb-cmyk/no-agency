import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import SupportButton from "@/components/ui/SupportButton"
import { ClientProvider } from "@/lib/context/ClientContext"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const [profile, { data: clients }] = await Promise.all([
    getCurrentProfile(),
    supabase.from("clients").select("id, name, plan, status").order("name", { ascending: true }),
  ])

  if (!profile) redirect("/login")

  return (
    <ClientProvider>
      <div className="min-h-screen bg-ink flex">
        <Sidebar profile={profile} clients={clients ?? []} />
        <div className="flex-1 ml-60 flex flex-col min-h-screen">
          <Topbar role={profile.role} />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
        <SupportButton />
      </div>
    </ClientProvider>
  )
}
