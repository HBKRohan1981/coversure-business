/**
 * Synthetic business profiles for pressure-testing Path C (diagnostic only).
 * See docs/diagnostic-27-vs-64.md. These are NOT the demo's canonical data.
 */

import type { LineInput } from "../types.ts";
import { compliance, notIdentified, q, unavailable } from "./_builders.ts";

export interface SyntheticProfile {
  name: string;
  industry: string;
  lines: LineInput[];
}

/**
 * 1) IT / ITES — high cyber/PI/D&O materiality, moderate people, low physical assets.
 *    Policies across the relevant lines with MIXED adequacy; one gap (GTL).
 */
export const itItes: SyntheticProfile = {
  name: "IT / ITES (mixed adequacy)",
  industry: "IT/ITES",
  lines: [
    q({ key: "property-fire", category: "property", weight: 1, si: 1.0, cov: 0.9 }),
    q({ key: "bi", category: "business-continuity", weight: 2, si: 0.4, cov: 0.7 }),
    q({ key: "liability", category: "liability", weight: 1, si: 0.9, cov: 0.9 }),
    q({ key: "pi", category: "liability", weight: 3, si: 0.6, cov: 0.7 }),
    q({ key: "do", category: "liability", weight: 2, si: 0.8, cov: 0.9 }),
    q({ key: "cyber", category: "cyber", weight: 3, si: 0.7, cov: 0.8 }),
    q({ key: "gpa", category: "people", weight: 2, si: 0.5, cov: 0.85 }),
    q({ key: "gmc", category: "people", weight: 3, si: 0.8, cov: 0.85 }),
    notIdentified({ key: "gtl", category: "people", weight: 2 }),
    compliance({ key: "wc", category: "people", weight: 1, state: "pass" }),
  ],
};

/**
 * 2) Well-covered manufacturer — strong Property/Fire, BI, Liability, Product;
 *    good SI adequacy, good terms, broad + complete documentation.
 *    Expected: high adequacy + high breadth + high completeness.
 */
export const wellCoveredMfg: SyntheticProfile = {
  name: "Well-covered manufacturer",
  industry: "Manufacturing",
  lines: [
    q({ key: "property-fire", category: "property", weight: 3, si: 1.0, cov: 0.95 }),
    q({ key: "stock", category: "property", weight: 3, si: 1.0, cov: 0.95 }),
    q({ key: "machinery", category: "property", weight: 3, si: 0.95, cov: 0.95 }),
    q({ key: "bi", category: "business-continuity", weight: 3, si: 0.95, cov: 0.9 }),
    q({ key: "marine", category: "business-continuity", weight: 2, si: 0.9, cov: 0.9 }),
    q({ key: "liability", category: "liability", weight: 2, si: 1.0, cov: 0.9 }),
    q({ key: "product-liability", category: "liability", weight: 3, si: 0.95, cov: 0.9 }),
    q({ key: "do", category: "liability", weight: 1, si: 0.9, cov: 0.9 }),
    q({ key: "cyber", category: "cyber", weight: 1, si: 0.9, cov: 0.85 }),
    q({ key: "gpa", category: "people", weight: 3, si: 1.0, cov: 0.9 }),
    q({ key: "gmc", category: "people", weight: 2, si: 0.95, cov: 0.9 }),
    q({ key: "gtl", category: "people", weight: 1, si: 0.9, cov: 0.9 }),
    compliance({ key: "wc", category: "people", weight: 3, state: "pass" }),
    q({ key: "motor-od", category: "other", weight: 2, si: 0.95, cov: 0.9 }),
  ],
};

/**
 * 3) Underinsured but well-documented manufacturer — policies across essentially all
 *    material lines (high breadth + completeness) but significant SI shortfalls.
 *    Expected: high breadth, low/moderate adequacy — breadth cannot compensate.
 */
export const underinsuredMfg: SyntheticProfile = {
  name: "Underinsured well-documented manufacturer",
  industry: "Manufacturing",
  lines: [
    q({ key: "property-fire", category: "property", weight: 3, si: 0.4, cov: 0.9 }),
    q({ key: "stock", category: "property", weight: 3, si: 0.5, cov: 0.9 }),
    q({ key: "machinery", category: "property", weight: 3, si: 0.5, cov: 0.85 }),
    q({ key: "bi", category: "business-continuity", weight: 3, si: 0.3, cov: 0.8 }),
    q({ key: "marine", category: "business-continuity", weight: 2, si: 0.5, cov: 0.85 }),
    q({ key: "liability", category: "liability", weight: 2, si: 0.2, cov: 0.8 }),
    q({ key: "product-liability", category: "liability", weight: 3, si: 0.4, cov: 0.8 }),
    q({ key: "do", category: "liability", weight: 1, si: 0.5, cov: 0.85 }),
    q({ key: "cyber", category: "cyber", weight: 1, si: 0.5, cov: 0.8 }),
    q({ key: "gpa", category: "people", weight: 3, si: 0.4, cov: 0.85 }),
    q({ key: "gmc", category: "people", weight: 2, si: 0.5, cov: 0.85 }),
    q({ key: "gtl", category: "people", weight: 1, si: 0.4, cov: 0.85 }),
    compliance({ key: "wc", category: "people", weight: 3, state: "pass" }),
    q({ key: "motor-od", category: "other", weight: 2, si: 0.6, cov: 0.85 }),
  ],
};

/**
 * 4) Sparse-documentation SME — a good Property/Fire policy, little/no evidence for
 *    other material lines. One line (GPA) is present-but-unsizeable (unavailable);
 *    the rest are not-identified.
 *    Expected: reasonable adequacy on identified cover, but low breadth →
 *    breadth-limited / guarded, NOT "simply poorly insured".
 */
export const sparseSme: SyntheticProfile = {
  name: "Sparse-documentation SME",
  industry: "Manufacturing",
  lines: [
    q({ key: "property-fire", category: "property", weight: 3, si: 0.95, cov: 0.95 }),
    notIdentified({ key: "stock", category: "property", weight: 3 }),
    notIdentified({ key: "bi", category: "business-continuity", weight: 3 }),
    notIdentified({ key: "liability", category: "liability", weight: 2 }),
    notIdentified({ key: "cyber", category: "cyber", weight: 1 }),
    unavailable({ key: "gpa", category: "people", weight: 3 }),
    notIdentified({ key: "gmc", category: "people", weight: 2 }),
    compliance({ key: "wc", category: "people", weight: 3, state: "unconfirmed" }),
  ],
};

export const SYNTHETIC_PROFILES: SyntheticProfile[] = [
  itItes,
  wellCoveredMfg,
  underinsuredMfg,
  sparseSme,
];
