import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-cream/80">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-ink-3 border border-border rounded-lg px-3 py-2.5 text-sm text-cream placeholder:text-stone",
            "focus:outline-none focus:border-stone focus:bg-ink-2 transition-colors",
            error && "border-signal focus:border-signal",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-signal">{error}</p>}
        {hint && !error && <p className="text-xs text-stone">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export default Input
