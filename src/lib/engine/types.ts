/**
 * CoverSure Business — Risk Assessment Engine: canonical schema (spec §3).
 *
 * This is the extraction target + assessment vocabulary for the *real* engine that
 * replaces the demo's authored scores. See docs/risk-assessment-engine.md (v0.2).
 *
 * Design invariants encoded here:
 *  - Provenance travels with every extracted value (`Extracted<T>`).
 *  - Coverage terms are TRI-STATE (`TermState`) and unconfirmed is NEVER coerced to absent.
 *  - Not every line is a sum-insured ratio (`AssessmentMode`).
 *  - `LineStatus` distinguishes not-identified (undocumented) from confirmed-absent
 *    (evidenced) from unavailable (a fact WE lack) — the conservative posture (§5f).
 */

/** A value read from a document, carrying its provenance. `confidence` is 0..1. */
export type Extracted<T> = { value: T; sourceRef: string; confidence: number };

/** Tri-state coverage term. NEVER default `unconfirmed` → `absent` (§8 tri-state integrity). */
export type TermState = "present" | "absent" | "unconfirmed";

/** How a line's adequacy is judged (spec §4 / calibration Table A2). */
export type AssessmentMode = "quantitative" | "compliance" | "presence";

/**
 * Per-line assessment outcome (spec §5c / calibration Table E).
 *  - covered        line_adequacy ≥ 0.90
 *  - review         0.55 ≤ line_adequacy < 0.90
 *  - potential-gap  line_adequacy < 0.55 (policy present but materially short)
 *  - not-identified material line, no policy in docs — scored 0; narrative "not identified
 *                   in the documents reviewed" (NEVER asserted as absent)
 *  - confirmed-absent absence positively evidenced (exclusion / confirmation) — scored 0
 *  - unavailable    a fact WE lack (e.g. CTC) blocks assessment — excluded from the score
 *                   core, counted against completeness
 */
export type LineStatus =
  | "covered"
  | "review"
  | "potential-gap"
  | "not-identified"
  | "confirmed-absent"
  | "unavailable";

/** Exposure lines the engine knows about (spec §3 / calibration Table A). */
export type ExposureLineKey =
  | "property-fire"
  | "stock"
  | "bi"
  | "machinery"
  | "marine"
  | "liability"
  | "product-liability"
  | "pi"
  | "do"
  | "cyber"
  | "gpa"
  | "gmc"
  | "gtl"
  | "wc"
  | "motor-tp"
  | "motor-od";

/** Score categories (calibration Table D). */
export type CategoryKey =
  | "property"
  | "business-continuity"
  | "liability"
  | "cyber"
  | "people"
  | "other";

// ---------------------------------------------------------------------------
// Extraction target (Stage 2 output). Provenance-carrying, tri-state terms.
// ---------------------------------------------------------------------------

export type ValuationBasis = "reinstatement" | "market-value" | "agreed-value" | "unknown";

export interface ExtractedPolicy {
  key: string;
  line: ExposureLineKey;
  type: string;
  insurer: string;
  policyNumber: string;
  sumInsured: Extracted<number>; // INR; for GMC see §5d normalisation
  premium: Extracted<number>;
  startDate: Extracted<string>;
  renewalDate: Extracted<string>;
  basisOfValuation?: ValuationBasis;
  subLimits: Extracted<Record<string, number>>;
  addOns: Record<string, TermState>; // tri-state per checklist item
  exclusions: Record<string, TermState>;
  deductible?: Extracted<number>;
  relatedAssetKeys: string[];
}

export interface ExtractedAsset {
  key: string;
  name: string;
  type: string;
  category: "immovable" | "movable";
  location: string;
  declaredValue: Extracted<number>;
  valuationBasis?: "reinstatement" | "cost" | "market";
}

export interface EngineBusinessProfile {
  name: string;
  industry: string;
  turnover: Extracted<number>; // INR
  employees: Extracted<number>;
  fixedAssets: Extracted<number>; // INR (reinstatement basis for buildings + plant)
  inventory: Extracted<number>; // INR (cost/market)
  avgCTC?: Extracted<number>; // needed for GPA/GTL benchmarks; absent → those go unconfirmed
}

// ---------------------------------------------------------------------------
// Adequacy inputs (Stage 5). Pure-function argument shapes.
// ---------------------------------------------------------------------------

/** A sentinel used across the engine when a value cannot be computed from captured facts. */
export const UNCONFIRMED = "unconfirmed" as const;
export type Unconfirmed = typeof UNCONFIRMED;

/** A benchmark recommended-cover value, or `unconfirmed` when a required fact is unheld (§4, §5a). */
export type Benchmark = number | Unconfirmed;

/** A tri-state coverage-checklist item with its materiality weight (calibration Table C). */
export interface ChecklistItem {
  key: string;
  weight: number;
  state: TermState;
}

/** An adverse term that penalises coverage only when confirmed-present (calibration Table C). */
export interface AdverseTerm {
  key: string;
  penalty: number; // 0..1
  state: TermState;
}

/** Per-line assessment input, discriminated by assessment mode. */
export type LineInput =
  | QuantitativeLineInput
  | ComplianceLineInput
  | PresenceLineInput;

export interface QuantitativeLineInput {
  key: ExposureLineKey;
  category: CategoryKey;
  mode: "quantitative";
  weight: number; // materiality wᵢ (0..3)
  /** true when a policy for this line was found in the documents. */
  policyFound: boolean;
  /** true when absence is positively evidenced (exclusion / client confirmation). */
  confirmedAbsent?: boolean;
  /** identified sum insured for the line (INR). null when no policy found. */
  C: number | null;
  /** recommended benchmark; `unconfirmed` when a required fact is unheld. */
  R: Benchmark;
  checklist: ChecklistItem[];
  adverse: AdverseTerm[];
}

export interface ComplianceLineInput {
  key: ExposureLineKey;
  category: CategoryKey;
  mode: "compliance";
  weight: number;
  compliance: "pass" | "fail" | Unconfirmed;
}

export interface PresenceLineInput {
  key: ExposureLineKey;
  category: CategoryKey;
  mode: "presence";
  weight: number;
  presence: TermState;
}

// ---------------------------------------------------------------------------
// Adequacy outputs (Stage 5). Reproducibility trail travels with each line.
// ---------------------------------------------------------------------------

export interface LineAssessment {
  key: ExposureLineKey;
  category: CategoryKey;
  mode: AssessmentMode;
  weight: number;
  status: LineStatus;
  /** 0..100, or null when excluded from the score core (unavailable / not-folded compliance). */
  lineScore: number | null;
  /** true when this line participates in category roll-up. */
  inScoreCore: boolean;
  /** true when this line counts against the completeness indicator (§6). */
  countsAgainstCompleteness: boolean;
  // --- quantitative reproducibility trail (present for quantitative lines) ---
  siRatio?: number | null;
  siAdequacy?: number | Unconfirmed;
  coverageAdequacy?: number | Unconfirmed;
  lineAdequacy?: number | null;
  overInsured?: boolean;
  // --- compliance / presence ---
  compliance?: "pass" | "fail" | Unconfirmed;
  presence?: TermState;
}

// ---------------------------------------------------------------------------
// Scoring outputs (Stage 6).
// ---------------------------------------------------------------------------

export interface CategoryAssessment {
  key: CategoryKey;
  weight: number; // W_cat (derived + clamped, or fixed)
  score: number | null; // null when the category has no scored lines
}

export interface Completeness {
  confirmed: number;
  total: number;
  ratio: number; // 0..1
  provisional: boolean; // ratio < threshold
}

export interface BusinessAssessment {
  overall: number; // 0..100
  categories: CategoryAssessment[];
  lines: LineAssessment[];
  completeness: Completeness;
  scoringVersion: string;
  calibrationVersion: string;
}
