"use client";

import { scoreTone } from "@/lib/score";

const TONE_COLOR: Record<ReturnType<typeof scoreTone>, string> = {
  good: "#4FBF6B",
  attention: "#D69A2D",
  high: "#C24545",
};

export interface CategoryScoreBarProps {
  label: string;
  score: number;
}

export function CategoryScoreBar({ label, score }: CategoryScoreBarProps) {
  const clamped = Math.max(0, Math.min(score, 100));
  const color = TONE_COLOR[scoreTone(clamped)];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-midnight">{label}</span>
        <span className="text-sm font-semibold text-midnight">{clamped}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-midnight/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
