export type ScoreTone = "good" | "attention" | "high";

/**
 * Maps a 0-100 score to a semantic tone band.
 * >=70 good, 40-69 attention, <40 high (attention needed).
 */
export function scoreTone(n: number): ScoreTone {
  if (n >= 70) return "good";
  if (n >= 40) return "attention";
  return "high";
}

/**
 * Single source of truth for tone → colour. Shared by any component that
 * renders a semantic score/status tone (ScoreDial, CategoryScoreBar, and the
 * status/priority atoms in src/components/coverage & src/components/common).
 */
export const TONE_COLOR: Record<ScoreTone, string> = {
  good: "#3F9D5C", // calm forest-green (mint hue family, text-safe contrast)
  attention: "#B45309", // brand amber token — matches the desaturated meter palette
  high: "#C0392B", // brand danger token — matches the desaturated meter palette
};
