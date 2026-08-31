import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-[3px] focus:ring-[rgba(30,86,255,.12)]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-electric/10 text-electric",
        secondary:
          "border-transparent bg-mint/25 text-midnight",
        destructive:
          "border-transparent bg-danger/10 text-danger",
        outline: "border-line bg-transparent text-ink",
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
