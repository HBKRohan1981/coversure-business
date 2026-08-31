"use client";

import { scoreTone, TONE_COLOR } from "@/lib/score";

export interface CategoryScoreBarProps {
  label: string;
  score: number;
}

/** Thin category score bar — calm PI/D&O look, colour by scoreTone. */
export function CategoryScoreBar({ label, score }: CategoryScoreBarProps) {
  const clamped = Math.max(0, Math.min(score, 100));
  const color = TONE_COLOR[scoreTone(clamped)];

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-sm font-semibold text-midnight">{clamped}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
