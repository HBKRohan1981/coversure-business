import type { CSSProperties } from "react";
import { cva } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TONE_COLOR } from "@/lib/score";
import type { Priority } from "@/lib/types";

const priorityBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
);

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

/** Which semantic tone bucket each priority renders in. */
type PriorityTone = "high" | "attention" | "neutral";

const PRIORITY_TONE: Record<Priority, PriorityTone> = {
  high: "high",
  medium: "attention",
  low: "neutral",
};

// Reuses the shared TONE_COLOR palette (src/lib/score.ts) so "high" priority
// reads with the same red as a "high" score tone, etc. — one source of truth.
function toneStyle(tone: PriorityTone): CSSProperties | undefined {
  if (tone === "neutral") return undefined;
  const hex = TONE_COLOR[tone];
  return {
    backgroundColor: `${hex}1F`, // ~12% tint
    color: hex,
    borderColor: `${hex}4D`, // ~30% tint
  };
}

export interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

/** Small badge showing a recommendation's priority (high/medium/low). */
export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const tone = PRIORITY_TONE[priority];
  return (
    <Badge
      variant="outline"
      className={cn(
        priorityBadgeVariants(),
        tone === "neutral" && "bg-slate-100 text-slate-600 border-slate-200",
        className
      )}
      style={toneStyle(tone)}
    >
      {PRIORITY_LABEL[priority]}
    </Badge>
  );
}
