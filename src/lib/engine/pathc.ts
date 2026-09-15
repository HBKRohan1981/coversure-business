/**
 * CoverSure Business — v0.3 Path C PROTOTYPE: two-number model + completeness guard.
 *
 * Motivation (see docs/diagnostic-27-vs-64.md): the v0.2 single score folds two
 * different questions into one number, and "not-identified scored 0" makes absence
 * dominate the headline (~28 of ABC's 37-point gap vs the demo). Path C SEPARATES:
 *
 *   • adequacyScore — how good is the cover you actually hold? (identified, assessed
 *                     lines only; not-identified / confirmed-absent excluded)
 *   • breadth       — how much of your material exposure carries a policy at all?
 *   • completeness  — data quality (unchanged from v0.2; unavailable/unconfirmed)
 *
 * The conservative NARRATIVE posture is preserved: not-identified lines still surface
 * as gaps (they simply live in `breadth`, not as score-0 drags), and guard flags stop
 * a high adequacy over thin breadth from reading as reassuring.
 *
 * This module is PURELY ADDITIVE — it reuses the v0.2 pure functions and never
 * mutates the v0.2 orchestrator. The v0.2 Business Protection Score remains the
 * reference model (calibration SCORE_MODEL).
 */

import { assessLine } from "./adequacy.ts";
import {
  businessProtectionScore,
  categoryScore,
  completeness,
  deriveCategoryWeights,
} from "./scoring.ts";
import {
  BREADTH_GUARD_CUTOFF,
  CALIBRATION_VERSION,
  COMPLETENESS_PROVISIONAL_CUTOFF,
  SCORING_VERSION,
} from "./calibration.ts";
import type {
  CategoryAssessment,
  CategoryKey,
  Completeness,
  LineAssessment,
  LineInput,
} from "./types.ts";

const CATEGORY_ORDER: CategoryKey[] = [
  "property",
  "business-continuity",
  "liability",
  "cyber",
  "people",
  "other",
];

export interface Breadth {
  /** material lines carrying a policy in place. */
  covered: number;
  /** material lines (weight > 0). */
  material: number;
  ratio: number; // 0..1
}

export interface PathCFlags {
  /** completeness below cutoff — too little could be assessed to trust the number. */
  provisional: boolean;
  /** breadth below cutoff — good at what you have, but you don't have much. */
  breadthLimited: boolean;
  /** no identified, assessable cover at all — adequacyScore is null. */
  noIdentifiedCover: boolean;
}

export interface PathCAssessment {
  /** Quality of identified cover, 0..100. null when nothing identified is assessable. */
  adequacyScore: number | null;
  breadth: Breadth;
  completeness: Completeness;
  /** adequacy × breadth — a single guarded number that reproduces the v0.2 signal. */
  guardedScore: number;
  flags: PathCFlags;
  /** per-category adequacy over identified, assessed lines only. */
  categories: CategoryAssessment[];
  lines: LineAssessment[];
  scoringVersion: string;
  calibrationVersion: string;
}

/** A line whose adequacy we can score: an identified policy that was assessed. */
function isIdentifiedScorable(line: LineAssessment): boolean {
  return (
    line.lineScore !== null &&
    (line.status === "covered" ||
      line.status === "review" ||
      line.status === "potential-gap")
  );
}

/** A line that carries a policy in place (even if inadequate or unsized). */
function hasIdentifiedCover(line: LineAssessment): boolean {
  if (line.mode === "compliance") return line.compliance === "pass";
  if (line.mode === "presence") return line.presence === "present";
  // quantitative: policyFound is implied by any status other than the no-policy ones.
  return line.status !== "not-identified" && line.status !== "confirmed-absent";
}

/**
 * Assess a business under the v0.3 Path C prototype (§ diagnostic).
 * Reuses the v0.2 per-line assessment verbatim; only the roll-up differs.
 */
export function assessBusinessPathC(lines: LineInput[], industry: string): PathCAssessment {
  const assessed: LineAssessment[] = lines.map(assessLine);
  const weights = deriveCategoryWeights(industry);

  // --- adequacy: category roll-up over identified, assessed lines only ---
  const scorable = assessed.filter(isIdentifiedScorable);
  const byCategory = new Map<CategoryKey, LineAssessment[]>();
  for (const line of scorable) {
    const bucket = byCategory.get(line.category) ?? [];
    bucket.push(line);
    byCategory.set(line.category, bucket);
  }
  const categories: CategoryAssessment[] = [];
  for (const key of CATEGORY_ORDER) {
    const bucket = byCategory.get(key);
    if (!bucket || bucket.length === 0) continue;
    categories.push({ key, weight: weights[key] ?? 0, score: categoryScore(bucket) });
  }
  const adequacyScore = categories.length === 0 ? null : businessProtectionScore(categories);

  // --- breadth: material lines carrying a policy / material lines ---
  const material = assessed.filter((l) => l.weight > 0);
  const covered = material.filter(hasIdentifiedCover).length;
  const breadth: Breadth = {
    covered,
    material: material.length,
    ratio: material.length === 0 ? 0 : covered / material.length,
  };

  // --- completeness: unchanged from v0.2 (data quality) ---
  const comp = completeness(assessed);

  // --- guarded single number: adequacy × breadth (0 when no adequacy) ---
  const guardedScore = adequacyScore === null ? 0 : adequacyScore * breadth.ratio;

  const flags: PathCFlags = {
    provisional: comp.ratio < COMPLETENESS_PROVISIONAL_CUTOFF,
    breadthLimited: breadth.ratio < BREADTH_GUARD_CUTOFF,
    noIdentifiedCover: adequacyScore === null,
  };

  return {
    adequacyScore,
    breadth,
    completeness: comp,
    guardedScore,
    flags,
    categories,
    lines: assessed,
    scoringVersion: SCORING_VERSION,
    calibrationVersion: CALIBRATION_VERSION,
  };
}
