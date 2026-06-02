import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"
import AdminClientList from "./AdminClientList"

export default async function AdminPage() {
  await requireAdmin().catch(() => redirect("/dashboard"))

  const supabase = await createClient()

  const [{ data: clients }, { data: users }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, status, plan, user_id, created_at, updated_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at"),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Gestão de Clientes</h1>
        <p className="text-[13px] text-stone">Gerencie todos os clientes e acessos da plataforma</p>
      </div>

      <AdminClientList
        clients={clients ?? []}
        users={users ?? []}
      />
    </div>
  )
}
