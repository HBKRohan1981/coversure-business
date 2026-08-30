import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "reverse";
  className?: string;
}

/**
 * CoverSure wordmark: an inline SVG shield (three converging segments, currentColor)
 * next to the all-caps "COVERSURE" wordmark. No image assets.
 */
export function Logo({ variant = "default", className }: LogoProps) {
  const colorClass = variant === "reverse" ? "text-white" : "text-midnight";

  return (
    <div className={cn("flex items-center gap-2 h-8", colorClass, className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="h-8 w-8 shrink-0"
        aria-hidden="true"
      >
        {/* Three converging segments forming a shield, meeting at the base point */}
        <path d="M6 6 L13 6 L16 29 Q5 17 6 6 Z" fill="currentColor" opacity="0.45" />
        <path d="M13 6 L19 6 L16 29 Z" fill="currentColor" opacity="0.75" />
        <path d="M19 6 L26 6 Q27 17 16 29 Z" fill="currentColor" opacity="1" />
      </svg>
      <span className="font-sans font-semibold tracking-wide text-lg leading-none whitespace-nowrap">
        COVERSURE
      </span>
    </div>
  );
}
