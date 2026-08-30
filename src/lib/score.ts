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
