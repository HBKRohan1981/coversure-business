import { cva } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/language";
import type { CoverageStatus } from "@/lib/types";

const statusPillVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
);

// Restrained PI/D&O-style tint per coverage status — colour as signal, not
// decoration. Kept as fixed Tailwind classes (not derived from TONE_COLOR)
// since status has its own 4-way vocabulary distinct from the 3-way score
// tone bucket.
const STATUS_STYLE: Record<CoverageStatus, string> = {
  covered: "border-mint/50 bg-mint/25 text-midnight",
  review: "border-amber/30 bg-amber/10 text-amber",
  "not-identified": "border-danger/25 bg-danger/10 text-danger",
  "potential-gap": "border-danger/25 bg-danger/10 text-danger",
  unavailable: "border-line bg-line/50 text-muted-ink",
};

export interface StatusPillProps {
  status: CoverageStatus;
  className?: string;
}

/** Small pill showing a coverage status, labelled via STATUS_LABELS. */
export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusPillVariants(), STATUS_STYLE[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
