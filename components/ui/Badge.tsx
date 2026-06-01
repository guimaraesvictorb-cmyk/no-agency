import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "success" | "warning" | "error" | "info" | "neutral"
}

export default function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium font-poppins",
        variant === "default" && "bg-ink-3 text-stone",
        variant === "success" && "bg-green/15 text-green",
        variant === "warning" && "bg-amber/15 text-amber",
        variant === "error" && "bg-signal/15 text-signal",
        variant === "info" && "bg-blue/15 text-blue",
        variant === "neutral" && "bg-ink-4 text-cream/70",
        className
      )}
    >
      {children}
    </span>
  )
}
