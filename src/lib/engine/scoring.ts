/**
 * CoverSure Business — Scoring engine (spec §6). Pure, deterministic functions.
 *
 * line scores → category scores (derived + clamped weights) → Business Protection
 * Score, plus a completeness indicator so a half-evidenced score never reads as
 * authoritative as a fully-evidenced one.
 */

import {
  CATEGORY_OF_LINE,
  CATEGORY_WEIGHT_CLAMPS,
  COMPLETENESS_PROVISIONAL_CUTOFF,
  INDUSTRY_LINE_WEIGHTS,
} from "./calibration.ts";
import type { CategoryAssessment, CategoryKey, Completeness } from "./types.ts";

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/** Subset of a line assessment the scorer needs. */
interface ScorableLine {
  weight: number;
  lineScore: number | null;
  inScoreCore: boolean;
}

/**
 * Category score (§6): weighted mean of line scores over SCORED lines only.
 * Returns null when the category has no scored line (→ counted in completeness, not the core).
 */
export function categoryScore(lines: ScorableLine[]): number | null {
  let num = 0;
  let den = 0;
  for (const l of lines) {
    if (!l.inScoreCore || l.lineScore === null) continue;
    num += l.weight * l.lineScore;
    den += l.weight;
  }
  if (den === 0) return null;
  return num / den;
}

/**
 * Derived category weights (Table D): normalise the summed line materiality per
 * category for THIS business, then clamp each to [min, max] so no category
 * vanishes or dominates. Weights are NOT re-normalised after clamping — the
 * business roll-up divides by ΣW, so absolute scale does not matter.
 */
export function deriveCategoryWeights(industry: string): Record<string, number> {
  const lineWeights =
    INDUSTRY_LINE_WEIGHTS[industry] ?? INDUSTRY_LINE_WEIGHTS.Manufacturing;

  const rawByCategory: Record<string, number> = {};
  let total = 0;
  for (const [line, w] of Object.entries(lineWeights)) {
    const cat = CATEGORY_OF_LINE[line];
    if (!cat) continue;
    rawByCategory[cat] = (rawByCategory[cat] ?? 0) + w;
    total += w;
  }

  const out: Record<string, number> = {};
  for (const [cat, clamps] of Object.entries(CATEGORY_WEIGHT_CLAMPS)) {
    const normalised = total > 0 ? (rawByCategory[cat] ?? 0) / total : 0;
    out[cat] = clamp(normalised, clamps.min, clamps.max);
  }
  return out;
}

/**
 * Business Protection Score (§6): weighted mean of category scores over
 * categories that have a score. Categories with no scored lines are excluded.
 */
export function businessProtectionScore(categories: CategoryAssessment[]): number {
  let num = 0;
  let den = 0;
  for (const c of categories) {
    if (c.score === null) continue;
    num += c.weight * c.score;
    den += c.weight;
  }
  if (den === 0) return 0;
  return num / den;
}

/** Subset of a line assessment the completeness indicator needs. */
interface CompletenessLine {
  weight: number;
  countsAgainstCompleteness: boolean;
}

/**
 * Completeness (§6): confirmed / total expected data points. "Expected" = material
 * lines (weight > 0). "Confirmed" = those NOT flagged against completeness
 * (unavailable / unconfirmed lines are the shortfall).
 */
export function completeness(lines: CompletenessLine[]): Completeness {
  let total = 0;
  let confirmed = 0;
  for (const l of lines) {
    if (l.weight <= 0) continue; // N/A for this business — not an expected data point
    total += 1;
    if (!l.countsAgainstCompleteness) confirmed += 1;
  }
  const ratio = total === 0 ? 1 : confirmed / total;
  return {
    confirmed,
    total,
    ratio,
    provisional: ratio < COMPLETENESS_PROVISIONAL_CUTOFF,
  };
}

export type { CategoryKey };
