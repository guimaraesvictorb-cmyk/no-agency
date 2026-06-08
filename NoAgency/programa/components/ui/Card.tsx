import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: "none" | "sm" | "md" | "lg"
  hover?: boolean
}

export default function Card({ children, className, padding = "md", hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-ink-2 border border-border rounded-xl",
        padding === "none" && "",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-6",
        hover && "transition-all duration-200 hover:border-stone/40 hover:shadow-card-hover cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  )
}
