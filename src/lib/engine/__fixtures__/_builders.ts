/**
 * Fixture-only builders (NOT engine code). Construct LineInputs with a precise
 * target sum-insured adequacy (`si`, 0..1) and coverage adequacy (`cov`, 0.5..1):
 *   - si is set via C/R (C = si × R_BASE).
 *   - cov is set via a single adverse term with penalty (1 − cov), over a fully
 *     present checklist, so coverage_adequacy = cov exactly (respecting the 0.5 floor).
 * This lets a fixture say "property at si 0.4, terms 0.9" and get exactly that.
 */

import type {
  CategoryKey,
  ComplianceLineInput,
  ExposureLineKey,
  QuantitativeLineInput,
  TermState,
} from "../types.ts";

const R_BASE = 1_000_000_000; // ₹100 Cr reference so C/R lands the target si

interface QArgs {
  key: ExposureLineKey;
  category: CategoryKey;
  weight: number;
  si: number; // 0..1 target sum-insured adequacy
  cov: number; // 0.5..1 target coverage adequacy
}

/** An identified, assessed quantitative policy at a precise si × cov. */
export function q({ key, category, weight, si, cov }: QArgs): QuantitativeLineInput {
  return {
    key,
    category,
    mode: "quantitative",
    weight,
    policyFound: true,
    C: Math.round(si * R_BASE),
    R: R_BASE,
    checklist: [{ key: "core-cover", weight: 1, state: "present" }],
    adverse:
      cov < 1
        ? [{ key: "adverse-terms", penalty: Math.round((1 - cov) * 1000) / 1000, state: "present" as TermState }]
        : [],
  };
}

/** A material line with no policy in the documents reviewed → not-identified. */
export function notIdentified(a: {
  key: ExposureLineKey;
  category: CategoryKey;
  weight: number;
}): QuantitativeLineInput {
  return {
    ...a,
    mode: "quantitative",
    policyFound: false,
    C: null,
    R: R_BASE,
    checklist: [],
    adverse: [],
  };
}

/** Absence positively evidenced (exclusion / confirmation) → confirmed-absent. */
export function confirmedAbsent(a: {
  key: ExposureLineKey;
  category: CategoryKey;
  weight: number;
}): QuantitativeLineInput {
  return { ...notIdentified(a), confirmedAbsent: true };
}

/** A policy exists but a fact we lack blocks assessment (e.g. no CTC) → unavailable. */
export function unavailable(a: {
  key: ExposureLineKey;
  category: CategoryKey;
  weight: number;
}): QuantitativeLineInput {
  return {
    ...a,
    mode: "quantitative",
    policyFound: true,
    C: 200_000,
    R: "unconfirmed",
    checklist: [{ key: "core-cover", weight: 1, state: "present" }],
    adverse: [],
  };
}

/** A compliance-mode line (WC / Motor-TP). */
export function compliance(a: {
  key: ExposureLineKey;
  category: CategoryKey;
  weight: number;
  state: "pass" | "fail" | "unconfirmed";
}): ComplianceLineInput {
  return { key: a.key, category: a.category, mode: "compliance", weight: a.weight, compliance: a.state };
}
