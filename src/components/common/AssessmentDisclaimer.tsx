import { DISCLAIMER } from "@/lib/language";
import { cn } from "@/lib/utils";

export interface AssessmentDisclaimerProps {
  className?: string;
}

/**
 * Subtle, small-print disclaimer surfaced on assessment/recommendation
 * screens. Text comes from DISCLAIMER (src/lib/language.ts) — never
 * hardcoded here.
 */
export function AssessmentDisclaimer({ className }: AssessmentDisclaimerProps) {
  return (
    <p
      className={cn(
        "rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500",
        className
      )}
    >
      {DISCLAIMER}
    </p>
  );
}
