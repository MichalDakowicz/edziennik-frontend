import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25 dark:text-destructive",
        outline: "border-border text-foreground bg-transparent",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/25",
        warning:
          "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-500 hover:bg-amber-500/25",
        danger:
          "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25",
        info:
          "border-transparent bg-primary/15 text-primary dark:text-primary/80 hover:bg-primary/25",
        neutral:
          "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }