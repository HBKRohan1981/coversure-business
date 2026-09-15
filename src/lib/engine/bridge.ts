/**
 * CoverSure Business — Engine → demo-type bridge.
 *
 * The demo (Phase I) ships AUTHORED data typed by src/lib/types.ts. This is the
 * seam that lets the engine drive those same shapes when we swap authored →
 * derived. It maps engine vocabulary onto the demo's public types without
 * changing them.
 *
 * The one enum mismatch: the engine's `LineStatus` adds `confirmed-absent`
 * (positively-evidenced absence, §5f). The demo's `CoverageStatus` has no such
 * member, so it collapses onto `not-identified` — both render as a gap; the
 * evidenced-vs-undocumented distinction lives in the narrative, not the status.
 */

import type { CoverageStatus } from "../types.ts";
import type { BusinessAssessment, CategoryKey, LineStatus } from "./types.ts";

/** Map an engine LineStatus to the demo's CoverageStatus enum. */
export function toCoverageStatus(status: LineStatus): CoverageStatus {
  switch (status) {
    case "confirmed-absent":
      return "not-identified"; // demo enum has no confirmed-absent; both read as a gap
    case "covered":
    case "review":
    case "potential-gap":
    case "not-identified":
    case "unavailable":
      return status;
  }
}

/** Presentation labels for the score categories (mirrors the demo's authored labels). */
export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  property: "Property",
  "business-continuity": "Business Continuity",
  liability: "Liability",
  cyber: "Cyber",
  people: "People",
  other: "Other",
};

/** The demo renders an integer overall score. */
export function overallScore(assessment: BusinessAssessment): number {
  return Math.round(assessment.overall);
}

export interface BridgeCategoryScore {
  key: CategoryKey;
  label: string;
  score: number;
}

/**
 * Labelled integer category scores the demo can render. Categories with no scored
 * lines (score null) are omitted — the demo lists only assessed categories.
 */
export function toCategoryScores(assessment: BusinessAssessment): BridgeCategoryScore[] {
  const out: BridgeCategoryScore[] = [];
  for (const c of assessment.categories) {
    if (c.score === null) continue;
    out.push({ key: c.key, label: CATEGORY_LABELS[c.key], score: Math.round(c.score) });
  }
  return out;
}
