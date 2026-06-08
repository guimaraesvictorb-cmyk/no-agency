import { cn } from "@/lib/utils"

interface LogoClusterProps {
  size?: number
  variant?: "light" | "dark" | "red"
  className?: string
}

export default function LogoCluster({ size = 28, variant = "light", className }: LogoClusterProps) {
  const main = variant === "dark" ? "#FFFFFF" : variant === "red" ? "#FFFFFF" : "#0A0A0A"
  const accent = "#D64045"
  const dim = variant === "dark" ? "rgba(255,255,255,0.6)" : variant === "red" ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.45)"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      className={cn(className)}
      aria-label="No Agency logo"
    >
      {/* Center */}
      <circle cx="22" cy="22" r="7.5" fill={main} />
      {/* Top */}
      <circle cx="22" cy="9" r="4.8" fill={main} opacity="0.85" />
      {/* Bottom — accent */}
      <circle cx="22" cy="35" r="4.8" fill={accent} />
      {/* Top-right */}
      <circle cx="33" cy="15.5" r="4.8" fill={main} opacity="0.6" />
      {/* Top-left */}
      <circle cx="11" cy="15.5" r="4.8" fill={main} opacity="0.6" />
      {/* Bottom-right */}
      <circle cx="33" cy="28.5" r="4.8" fill={main} opacity="0.6" />
      {/* Bottom-left */}
      <circle cx="11" cy="28.5" r="4.8" fill={main} opacity="0.6" />
    </svg>
  )
}
