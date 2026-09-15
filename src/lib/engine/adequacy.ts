/**
 * CoverSure Business — Adequacy engine (spec §5). Pure, deterministic functions.
 *
 * Existing-policy adequacy is two-axis: sum insured AND coverage terms. Every
 * function is reproducible from captured facts; a benchmark we cannot compute
 * returns `unconfirmed` rather than a guessed number (§4 reproducibility rule).
 */

import {
  ADEQUACY_BANDS,
  COMPLIANCE_FOLDS_INTO_SCORE,
  OVER_INSURED_FLAG,
  PRESENCE_FOLDS_INTO_SCORE,
  SI_RATIO_CAP,
  TERM_PENALTY_FLOOR,
} from "./calibration.ts";
import type {
  AdverseTerm,
  Benchmark,
  ChecklistItem,
  LineAssessment,
  LineInput,
  LineStatus,
  Unconfirmed,
} from "./types.ts";

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

export interface SiAssessment {
  adequacy: number | Unconfirmed;
  ratio: number | null;
  overInsured: boolean;
}

/**
 * Sum-insured adequacy (§5a).
 *   si_ratio    = clamp(C / R, 0 .. 1.2)
 *   si_adequacy = min(si_ratio, 1)
 * An unconfirmed benchmark propagates as unconfirmed (never scored against a guess).
 */
export function siAssessment(C: number | null, R: Benchmark): SiAssessment {
  if (R === "unconfirmed") return { adequacy: "unconfirmed", ratio: null, overInsured: false };
  if (R <= 0) return { adequacy: "unconfirmed", ratio: null, overInsured: false };
  const identified = C ?? 0;
  const ratio = clamp(identified / R, 0, SI_RATIO_CAP);
  return {
    adequacy: Math.min(ratio, 1),
    ratio,
    overInsured: identified / R > OVER_INSURED_FLAG,
  };
}

/**
 * Coverage/terms adequacy (§5b), tri-state.
 *   denom          = Σ weight over items present OR absent (unconfirmed EXCLUDED)
 *   coverage_score = Σ(present · weight) / denom
 *   term_penalty   = clamp(Π(1 − penalty) for adverse present, floor, 1)
 *   coverage_adequacy = coverage_score × term_penalty
 * When every checklist item is unconfirmed (denom 0), returns `unconfirmed`.
 */
export function coverageAdequacy(
  checklist: ChecklistItem[],
  adverse: AdverseTerm[],
  floor: number = TERM_PENALTY_FLOOR
): number | Unconfirmed {
  let denom = 0;
  let present = 0;
  for (const item of checklist) {
    if (item.state === "unconfirmed") continue;
    denom += item.weight;
    if (item.state === "present") present += item.weight;
  }
  if (denom === 0) return "unconfirmed";
  const coverageScore = present / denom;

  let penaltyProduct = 1;
  for (const term of adverse) {
    if (term.state === "present") penaltyProduct *= 1 - term.penalty;
  }
  const termPenalty = clamp(penaltyProduct, floor, 1);

  return coverageScore * termPenalty;
}

/** Line-adequacy → status band (§5c). Applies only to a present, computable quantitative line. */
export function statusFromLineAdequacy(a: number): LineStatus {
  if (a >= ADEQUACY_BANDS.covered) return "covered";
  if (a >= ADEQUACY_BANDS.review) return "review";
  return "potential-gap";
}

const round = (n: number) => Math.round(n);

/**
 * Assess one line by its mode (§5c, §5e, §5f). Returns the status, score, and the
 * reproducibility trail. Conservative posture: not-identified & confirmed-absent
 * score 0 (in core); unavailable is excluded from the core and hits completeness.
 */
export function assessLine(input: LineInput): LineAssessment {
  if (input.mode === "compliance") {
    // Compliance strip (WC, Motor-TP). Statutory pass/fail/unconfirmed (§5e).
    const status: LineStatus =
      input.compliance === "pass"
        ? "covered"
        : input.compliance === "fail"
        ? "confirmed-absent"
        : "unavailable";
    const folds = COMPLIANCE_FOLDS_INTO_SCORE;
    const lineScore = folds ? (input.compliance === "pass" ? 100 : input.compliance === "fail" ? 0 : null) : null;
    return {
      key: input.key,
      category: input.category,
      mode: "compliance",
      weight: input.weight,
      status,
      lineScore,
      inScoreCore: folds && input.compliance !== "unconfirmed",
      countsAgainstCompleteness: input.compliance === "unconfirmed",
      compliance: input.compliance,
    };
  }

  if (input.mode === "presence") {
    const status: LineStatus =
      input.presence === "present"
        ? "covered"
        : input.presence === "absent"
        ? "not-identified"
        : "unavailable";
    const folds = PRESENCE_FOLDS_INTO_SCORE;
    const lineScore = folds ? (input.presence === "present" ? 100 : input.presence === "absent" ? 0 : null) : null;
    return {
      key: input.key,
      category: input.category,
      mode: "presence",
      weight: input.weight,
      status,
      lineScore,
      inScoreCore: folds && input.presence !== "unconfirmed",
      countsAgainstCompleteness: input.presence === "unconfirmed",
      presence: input.presence,
    };
  }

  // --- quantitative ---
  const base = {
    key: input.key,
    category: input.category,
    mode: "quantitative" as const,
    weight: input.weight,
  };

  // Conservative posture (§5f): evidenced/undocumented absence both score 0.
  if (input.confirmedAbsent) {
    return {
      ...base,
      status: "confirmed-absent",
      lineScore: 0,
      inScoreCore: true,
      countsAgainstCompleteness: false,
      siAdequacy: 0,
      coverageAdequacy: 0,
      lineAdequacy: 0,
      siRatio: null,
    };
  }
  if (!input.policyFound) {
    return {
      ...base,
      status: "not-identified",
      lineScore: 0,
      inScoreCore: true,
      countsAgainstCompleteness: false,
      siAdequacy: 0,
      coverageAdequacy: 0,
      lineAdequacy: 0,
      siRatio: null,
    };
  }

  const si = siAssessment(input.C, input.R);
  const cov = coverageAdequacy(input.checklist, input.adverse);

  // A data gap we hold on either axis → unavailable (excluded from core, §5c/§6).
  if (si.adequacy === "unconfirmed" || cov === "unconfirmed") {
    return {
      ...base,
      status: "unavailable",
      lineScore: null,
      inScoreCore: false,
      countsAgainstCompleteness: true,
      siAdequacy: si.adequacy,
      coverageAdequacy: cov,
      lineAdequacy: null,
      siRatio: si.ratio,
      overInsured: si.overInsured,
    };
  }

  const lineAdequacy = si.adequacy * cov;
  return {
    ...base,
    status: statusFromLineAdequacy(lineAdequacy),
    lineScore: round(lineAdequacy * 100),
    inScoreCore: true,
    countsAgainstCompleteness: false,
    siAdequacy: si.adequacy,
    coverageAdequacy: cov,
    lineAdequacy,
    siRatio: si.ratio,
    overInsured: si.overInsured,
  };
}
