import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; label: string }
  accent?: "signal" | "green" | "amber" | "blue"
}

const ACCENT_COLORS = {
  signal: "text-signal bg-signal/10",
  green: "text-green bg-green/10",
  amber: "text-amber bg-amber/10",
  blue: "text-blue bg-blue/10",
}

export default function StatCard({ label, value, icon: Icon, trend, accent = "signal" }: StatCardProps) {
  return (
    <div className="bg-ink-2 border border-border rounded-xl p-4 flex items-start gap-4">
      <div className={cn("p-2.5 rounded-lg", ACCENT_COLORS[accent])}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-semibold text-cream">{value}</div>
        <div className="text-xs text-stone mt-0.5">{label}</div>
        {trend && (
          <div className={cn("text-xs mt-1", trend.value >= 0 ? "text-green" : "text-signal")}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </div>
    </div>
  )
}
