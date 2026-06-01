import { cn, getInitials } from "@/lib/utils"

interface AvatarProps {
  name: string
  src?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const SIZES = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
  xl: "h-14 w-14 text-lg",
}

const COLORS = [
  "bg-signal/20 text-signal",
  "bg-blue/20 text-blue",
  "bg-green/20 text-green",
  "bg-amber/20 text-amber",
]

function colorFromName(name: string): string {
  const idx = name.charCodeAt(0) % COLORS.length
  return COLORS[idx]
}

export default function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover", SIZES[size], className)}
      />
    )
  }
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium font-poppins flex-shrink-0",
        SIZES[size],
        colorFromName(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
