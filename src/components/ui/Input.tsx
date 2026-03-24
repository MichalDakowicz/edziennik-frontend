import * as React from "react"
import { cn } from "../../utils/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative group w-full overflow-hidden rounded-xl">
        <input
          type={type}
          className={cn(
            "w-full px-5 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-0 focus:border-outline-variant/50 transition-all text-on-surface placeholder-outline/50 font-medium outline-none",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
