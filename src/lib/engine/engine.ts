/**
 * CoverSure Business — Engine orchestrator (spec §5–6).
 *
 * Ties the pure adequacy + scoring functions into one deterministic pass:
 *   LineInput[] → per-line assessment → category scores (derived weights)
 *              → Business Protection Score + completeness indicator.
 *
 * No Date.now(), no I/O — fully reproducible and versioned.
 */

import { assessLine } from "./adequacy.ts";
import {
  businessProtectionScore,
  categoryScore,
  completeness,
  deriveCategoryWeights,
} from "./scoring.ts";
import { CALIBRATION_VERSION, SCORING_VERSION } from "./calibration.ts";
import type {
  BusinessAssessment,
  CategoryAssessment,
  CategoryKey,
  LineAssessment,
  LineInput,
} from "./types.ts";

/** Category order for stable, presentation-friendly output. */
const CATEGORY_ORDER: CategoryKey[] = [
  "property",
  "business-continuity",
  "liability",
  "cyber",
  "people",
  "other",
];

/**
 * Assess a whole business from its per-line inputs (§5–6).
 * Categories with no scored lines are omitted from `categories` (and excluded from
 * the roll-up); the lines that made them empty are reflected in `completeness`.
 */
export function assessBusiness(lines: LineInput[], industry: string): BusinessAssessment {
  const assessed: LineAssessment[] = lines.map(assessLine);
  const weights = deriveCategoryWeights(industry);

  const linesByCategory = new Map<CategoryKey, LineAssessment[]>();
  for (const line of assessed) {
    const bucket = linesByCategory.get(line.category) ?? [];
    bucket.push(line);
    linesByCategory.set(line.category, bucket);
  }

  const categories: CategoryAssessment[] = [];
  for (const key of CATEGORY_ORDER) {
    const bucket = linesByCategory.get(key);
    if (!bucket || bucket.length === 0) continue; // no exposure modelled for this business
    categories.push({
      key,
      weight: weights[key] ?? 0,
      score: categoryScore(bucket),
    });
  }

  return {
    overall: businessProtectionScore(categories),
    categories,
    lines: assessed,
    completeness: completeness(assessed),
    scoringVersion: SCORING_VERSION,
    calibrationVersion: CALIBRATION_VERSION,
  };
}
