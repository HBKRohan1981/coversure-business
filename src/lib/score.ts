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
  good: "#4FBF6B", // restrained emerald/mint tone
  attention: "#D69A2D", // restrained amber
  high: "#C24545", // restrained red
};
