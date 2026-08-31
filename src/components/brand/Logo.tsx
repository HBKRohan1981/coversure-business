import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "reverse";
  className?: string;
}

/**
 * CoverSure logo — the official brand asset (shield emblem + COVERSURE wordmark).
 * Served from /public/coversure-logo.png. `variant="reverse"` renders it white
 * for dark backgrounds (e.g. the internal admin header). Height is controlled by
 * the wrapper's className (default h-8 / 32px, matching the CoverSure logo spec);
 * the image scales to it via h-full w-auto.
 */
export const Logo = forwardRef<
  HTMLDivElement,
  LogoProps & React.HTMLAttributes<HTMLDivElement>
>(({ variant = "default", className, ...rest }, ref) => {
  return (
    <div ref={ref} className={cn("inline-flex items-center h-8", className)} {...rest}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, exact-ratio, no optimization needed */}
      <img
        src="/coversure-logo.png"
        alt="CoverSure"
        draggable={false}
        className={cn(
          "h-full w-auto select-none",
          variant === "reverse" && "[filter:brightness(0)_invert(1)]"
        )}
      />
    </div>
  );
});
Logo.displayName = "Logo";
