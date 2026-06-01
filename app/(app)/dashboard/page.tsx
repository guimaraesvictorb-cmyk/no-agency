import { Users, FileText, Clock, TrendingUp, CheckSquare, Send } from "lucide-react"
import StatCard from "@/components/dashboard/StatCard"
import Pipeline from "@/components/dashboard/Pipeline"
import Card from "@/components/ui/Card"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import { mockDashboardStats, mockPosts, mockClients, mockNpsResponses } from "@/lib/mock-data"
import { formatRelativeTime } from "@/lib/utils"

export default function DashboardPage() {
  const stats = mockDashboardStats
  const pendingPosts = mockPosts.filter((p) => p.status === "sent_for_approval")

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Clientes Ativos"
          value={stats.active_clients}
          icon={Users}
          accent="signal"
          trend={{ value: 12, label: "vs. mês ant." }}
        />
        <StatCard
          label="Posts esta Semana"
          value={stats.posts_this_week}
          icon={FileText}
          accent="blue"
        />
        <StatCard
          label="Aguardando Aprovação"
          value={stats.pending_approvals}
          icon={Clock}
          accent="amber"
        />
        <StatCard
          label="NPS Médio"
          value={stats.avg_nps.toFixed(1)}
          icon={TrendingUp}
          accent="green"
          trend={{ value: 5, label: "vs. mês ant." }}
        />
      </div>

      {/* Pipeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-cream">Pipeline de Conteúdo</h2>
          <span className="text-xs text-stone">{mockPosts.length} posts no total</span>
        </div>
        <Pipeline posts={mockPosts} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending approvals */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare size={16} className="text-amber" />
            <h3 className="text-sm font-semibold text-cream">Aprovações Pendentes</h3>
            {pendingPosts.length > 0 && (
              <Badge variant="warning" className="ml-auto">{pendingPosts.length}</Badge>
            )}
          </div>
          {pendingPosts.length === 0 ? (
            <p className="text-sm text-stone text-center py-4">Nenhuma aprovação pendente 🎉</p>
          ) : (
            <div className="space-y-3">
              {pendingPosts.map((post) => {
                const client = mockClients.find((c) => c.id === post.client_id)
                return (
                  <div key={post.id} className="flex items-start gap-3 p-3 bg-ink-3 rounded-lg border border-border">
                    <Avatar name={client?.name ?? "?"} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-cream">{client?.name}</div>
                      <p className="text-xs text-stone line-clamp-2 mt-0.5">{post.caption}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button className="text-xs bg-green/10 text-green border border-green/20 px-2 py-1 rounded hover:bg-green/20 transition-colors">
                        ✓
                      </button>
                      <button className="text-xs bg-signal/10 text-signal border border-signal/20 px-2 py-1 rounded hover:bg-signal/20 transition-colors">
                        ✗
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Recent NPS */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-green" />
            <h3 className="text-sm font-semibold text-cream">Feedback Recente</h3>
          </div>
          <div className="space-y-3">
            {mockNpsResponses.slice(0, 4).map((nps) => {
              const client = mockClients.find((c) => c.id === nps.client_id)
              return (
                <div key={nps.id} className="flex items-start gap-3">
                  <div
                    className={`text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      nps.category === "promoter"
                        ? "bg-green/15 text-green"
                        : nps.category === "passive"
                        ? "bg-amber/15 text-amber"
                        : "bg-signal/15 text-signal"
                    }`}
                  >
                    {nps.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-cream">{client?.name}</div>
                    {nps.comment && (
                      <p className="text-xs text-stone mt-0.5 line-clamp-2">{nps.comment}</p>
                    )}
                    <div className="text-[10px] text-stone/60 mt-1">{formatRelativeTime(nps.created_at)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Clients overview */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Send size={16} className="text-signal" />
          <h3 className="text-sm font-semibold text-cream">Clientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="pb-2 text-xs font-medium text-stone">Cliente</th>
                <th className="pb-2 text-xs font-medium text-stone">Plano</th>
                <th className="pb-2 text-xs font-medium text-stone">Status</th>
                <th className="pb-2 text-xs font-medium text-stone">Posts (mês)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockClients.map((client) => {
                const posts = mockPosts.filter((p) => p.client_id === client.id && p.status === "published")
                return (
                  <tr key={client.id} className="hover:bg-ink-3/50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={client.name} size="sm" />
                        <span className="text-sm font-medium text-cream">{client.name}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant={client.plan === "pro" ? "info" : client.plan === "growth" ? "warning" : "neutral"}>
                        {client.plan.charAt(0).toUpperCase() + client.plan.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={client.status === "active" ? "success" : client.status === "onboarding" ? "warning" : "neutral"}>
                        {client.status === "active" ? "Ativo" : client.status === "onboarding" ? "Onboarding" : client.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-cream">{posts.length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
