import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-[10px] border-[1.5px] border-line bg-white px-[13px] py-[11px] text-[14.5px] text-ink transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink placeholder:text-muted-ink focus-visible:outline-none focus-visible:border-electric focus-visible:ring-[3px] focus-visible:ring-[rgba(30,86,255,.12)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
