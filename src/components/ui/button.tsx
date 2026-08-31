import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-[15px] font-semibold transition-all duration-150 active:scale-[.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[rgba(30,86,255,.12)] disabled:pointer-events-none disabled:opacity-[.45] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-electric text-white shadow-[0_6px_18px_rgba(30,86,255,.32)] hover:bg-royal",
        destructive:
          "bg-danger text-white shadow-sm hover:bg-danger/90",
        outline:
          "border-[1.5px] border-[rgba(0,50,200,.35)] bg-transparent text-royal hover:bg-[rgba(0,50,200,.06)]",
        secondary:
          "bg-mint text-midnight hover:brightness-95",
        ghost: "bg-transparent text-royal hover:bg-[rgba(0,50,200,.06)] hover:text-royal",
        link: "text-royal underline-offset-4 hover:underline",
      },
      size: {
        default: "px-[26px] py-[13px]",
        sm: "px-4 py-2 text-sm",
        lg: "px-8 py-[15px] text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
