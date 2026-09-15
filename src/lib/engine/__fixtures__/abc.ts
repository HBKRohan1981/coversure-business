/**
 * ABC Manufacturing — corrected worked example as an engine fixture
 * (docs/risk-assessment-engine.md §9 / calibration "Worked check").
 *
 * Profile: mfg, ₹82 Cr turnover, ₹24 Cr fixed assets, ₹9.4 Cr inventory, 187 employees,
 * NO CTC captured. INR amounts are raw (₹1 Cr = 10,000,000; ₹1 L = 100,000).
 *
 * This is the honest, evidence-based input the engine assesses. It reproduces the
 * worked example's line-level statuses exactly; the roll-up it yields is the honest
 * conservative output (see abc test for the divergence-from-demo note).
 */

import type { LineInput } from "../types.ts";

const CR = 10_000_000;
const L = 100_000;

export const abcIndustry = "Manufacturing";

export const abcLines: LineInput[] = [
  {
    // Property/Fire (bldg+plant): C ₹20 Cr vs R ₹24 Cr reinstatement → honest under-insurance.
    key: "property-fire",
    category: "property",
    mode: "quantitative",
    weight: 3,
    policyFound: true,
    C: 20 * CR,
    R: 24 * CR, // Σ reinstatement value of buildings + plant (Table B)
    checklist: [
      { key: "reinstatement-clause", weight: 0.3, state: "present" },
      { key: "stfi", weight: 0.2, state: "present" },
      { key: "earthquake-addon", weight: 0.15, state: "present" },
      { key: "escalation", weight: 0.15, state: "present" },
      { key: "terrorism-addon", weight: 0.1, state: "present" },
      { key: "debris-removal", weight: 0.1, state: "present" },
    ],
    adverse: [{ key: "high-excess", penalty: 0.1, state: "present" }],
  },
  {
    // Stock/Inventory: declared at cost, covered via the fire declaration. C ≈ R.
    key: "stock",
    category: "property",
    mode: "quantitative",
    weight: 3,
    policyFound: true,
    C: 9.4 * CR,
    R: 9.4 * CR, // declared stock value at cost/market (Table B)
    checklist: [
      { key: "declaration-floater-basis", weight: 0.6, state: "present" },
      { key: "seasonal-increase-clause", weight: 0.4, state: "present" },
    ],
    adverse: [{ key: "under-declaration-risk", penalty: 0.1, state: "present" }],
  },
  {
    // Business Interruption: no policy found → not-identified. R = GP × 12mo = 82Cr × 25% = ₹20.5 Cr.
    key: "bi",
    category: "business-continuity",
    mode: "quantitative",
    weight: 3,
    policyFound: false,
    C: null,
    R: 20.5 * CR,
    checklist: [],
    adverse: [],
  },
  {
    // Liability: C ₹1 Cr vs R ₹5 Cr (turnover band) → si 0.20; coverage 0.80.
    key: "liability",
    category: "liability",
    mode: "quantitative",
    weight: 2,
    policyFound: true,
    C: 1 * CR,
    R: 5 * CR,
    checklist: [
      { key: "public-liability", weight: 0.3, state: "present" },
      { key: "product-liability", weight: 0.25, state: "present" },
      { key: "legal-costs-in-addition", weight: 0.2, state: "absent" },
      { key: "sudden-accidental-pollution", weight: 0.15, state: "present" },
      { key: "adequate-per-event-sublimit", weight: 0.1, state: "present" },
    ],
    adverse: [],
  },
  {
    // Cyber: no policy found → not-identified. R = ₹3 Cr (worked example).
    key: "cyber",
    category: "cyber",
    mode: "quantitative",
    weight: 1,
    policyFound: false,
    C: null,
    R: 3 * CR,
    checklist: [],
    adverse: [],
  },
  {
    // GPA: policy present (₹2 L/life) BUT benchmark needs avgCTC, which is NOT captured
    // → R unconfirmed → unavailable (never scored against a guessed number).
    key: "gpa",
    category: "people",
    mode: "quantitative",
    weight: 3,
    policyFound: true,
    C: 2 * L,
    R: "unconfirmed",
    checklist: [
      { key: "death-ptd", weight: 0.4, state: "present" },
      { key: "ppd", weight: 0.25, state: "present" },
      { key: "ttd-weekly", weight: 0.2, state: "present" },
      { key: "medical-extension", weight: 0.15, state: "absent" },
    ],
    adverse: [],
  },
  {
    // GMC: no group health policy found → not-identified. R = ₹5 L/life norm.
    key: "gmc",
    category: "people",
    mode: "quantitative",
    weight: 2,
    policyFound: false,
    C: null,
    R: 5 * L,
    checklist: [],
    adverse: [],
  },
  {
    // Workmen's Comp: compliance-mode, statutory status not determinable from docs → strip.
    key: "wc",
    category: "people",
    mode: "compliance",
    weight: 3,
    compliance: "unconfirmed",
  },
];
