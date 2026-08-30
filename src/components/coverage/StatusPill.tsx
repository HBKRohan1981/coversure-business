import type { CSSProperties } from "react";
import { cva } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/language";
import { TONE_COLOR } from "@/lib/score";
import type { CoverageStatus } from "@/lib/types";

const statusPillVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
);

/** Which semantic tone bucket each coverage status renders in. */
type StatusTone = "good" | "attention" | "high" | "neutral";

const STATUS_TONE: Record<CoverageStatus, StatusTone> = {
  covered: "good",
  review: "attention",
  "not-identified": "high",
  "potential-gap": "high",
  unavailable: "neutral",
};

// Restrained tints derived from the shared TONE_COLOR palette (src/lib/score.ts)
// so covered/review/gap statuses stay visually consistent with score tones.
function toneStyle(tone: StatusTone): CSSProperties | undefined {
  if (tone === "neutral") return undefined;
  const hex = TONE_COLOR[tone];
  return {
    backgroundColor: `${hex}1F`, // ~12% tint
    color: hex,
    borderColor: `${hex}4D`, // ~30% tint
  };
}

export interface StatusPillProps {
  status: CoverageStatus;
  className?: string;
}

/** Small pill showing a coverage status, labelled via STATUS_LABELS. */
export function StatusPill({ status, className }: StatusPillProps) {
  const tone = STATUS_TONE[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        statusPillVariants(),
        tone === "neutral" && "bg-slate-100 text-slate-600 border-slate-200",
        className
      )}
      style={toneStyle(tone)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
