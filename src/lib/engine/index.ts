/**
 * CoverSure Business — Risk Assessment Engine (stub, v0.2).
 *
 * Public barrel. The engine turns extracted facts into a Business Protection
 * Score, per-line adequacy, and a completeness indicator — deterministically
 * (spec: docs/risk-assessment-engine.md). Stage 2 (AI extraction) and Stage 7
 * (narrative) are out of scope for this stub; everything here is pure.
 */

export * from "./types.ts";
export * from "./calibration.ts";
export {
  siAssessment,
  coverageAdequacy,
  statusFromLineAdequacy,
  assessLine,
} from "./adequacy.ts";
export {
  categoryScore,
  deriveCategoryWeights,
  businessProtectionScore,
  completeness,
} from "./scoring.ts";
export { assessBusiness } from "./engine.ts";
export { assessBusinessPathC } from "./pathc.ts";
export type { PathCAssessment, Breadth, PathCFlags } from "./pathc.ts";
export {
  toCoverageStatus,
  overallScore,
  toCategoryScores,
  CATEGORY_LABELS,
} from "./bridge.ts";
