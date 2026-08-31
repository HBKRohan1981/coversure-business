import { DISCLAIMER } from "@/lib/language";
import { cn } from "@/lib/utils";

export interface AssessmentDisclaimerProps {
  className?: string;
}

/**
 * Subtle, small-print disclaimer surfaced on assessment/recommendation
 * screens. Text comes from DISCLAIMER (src/lib/language.ts) — never
 * hardcoded here. Styled as the PI/D&O `.disclaimer` note: dashed hairline,
 * app-bg tint — restrained, not an alert.
 */
export function AssessmentDisclaimer({ className }: AssessmentDisclaimerProps) {
  return (
    <p
      className={cn(
        "rounded-lg border border-dashed border-line bg-app-bg px-4 py-3 text-[12.5px] text-muted-ink",
        className
      )}
    >
      {DISCLAIMER}
    </p>
  );
}
