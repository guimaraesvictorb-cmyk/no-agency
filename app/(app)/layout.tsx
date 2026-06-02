import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import SupportButton from "@/components/ui/SupportButton"
import { ClientProvider } from "@/lib/context/ClientContext"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/login")

  // Load clients for the sidebar selector
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, plan, status")
    .order("name", { ascending: true })

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
