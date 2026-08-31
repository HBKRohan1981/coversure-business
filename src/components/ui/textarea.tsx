import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[84px] w-full resize-y rounded-[10px] border-[1.5px] border-line bg-white px-[13px] py-[11px] text-[14.5px] text-ink placeholder:text-muted-ink focus-visible:outline-none focus-visible:border-electric focus-visible:ring-[3px] focus-visible:ring-[rgba(30,86,255,.12)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
