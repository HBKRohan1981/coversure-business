/**
 * CoverSure Business — Engine calibration (starter v0.2).
 *
 * Every value here is a ⚙️ proposal for CoverSure broking to correct
 * (docs/assessment-calibration-starter.md). Centralised + versioned so the pure
 * functions stay policy-free and a broker can edit ONE file.
 */

export const CALIBRATION_VERSION = "0.2.0-starter";
export const SCORING_VERSION = "0.1.0-stub";

/**
 * Active headline score model. v0.2 (single conservative Business Protection Score)
 * remains the reference; "v0.3-pathC" is a PROTOTYPE two-number model (adequacy +
 * breadth) evaluated in parallel — see engine/pathc.ts. The v0.2 orchestrator is
 * never gated by this flag; callers opt into Path C explicitly.
 */
export const SCORE_MODEL: "v0.2" | "v0.3-pathC" = "v0.2";

/**
 * Path C breadth guard ⚙️: below this fraction of material lines carrying a policy,
 * the adequacy score is flagged `breadthLimited` — a strong "good at what you have,
 * but you don't have much" signal so a high adequacy over thin breadth cannot read
 * as reassuring.
 */
export const BREADTH_GUARD_CUTOFF = 0.6;

/** Line-adequacy → status bands (calibration Table E). */
export const ADEQUACY_BANDS = {
  covered: 0.9, // line_adequacy ≥ 0.90
  review: 0.55, // 0.55 ≤ line_adequacy < 0.90
  // below `review` → potential-gap
} as const;

/** Sum-insured ratio caps (spec §5a, Table E). */
export const SI_RATIO_CAP = 1.2; // clamp C/R to [0, 1.2]
export const OVER_INSURED_FLAG = 1.15; // si_ratio > 1.15 → surfaced finding (not penalised)

/** Adverse-term penalty floor — stops a stack of adverse terms zeroing a sized policy (§5b, P1-12). */
export const TERM_PENALTY_FLOOR = 0.5;

/** Extraction-confidence gate (§3): below this a field is broker-confirm + counts vs completeness. */
export const CONFIDENCE_GATE = 0.7;

/** Completeness ratio below which a score is shown as provisional (§6, Table E). */
export const COMPLETENESS_PROVISIONAL_CUTOFF = 0.7;

/**
 * Whether compliance-mode lines (WC, Motor-TP) fold into the 0–100 score or sit
 * only in the Compliance strip. OPEN decision (spec §4 / Table A2). Default: strip only.
 */
export const COMPLIANCE_FOLDS_INTO_SCORE = false;

/**
 * Whether presence-mode lines (advisory D&O) fold into the 0–100 score.
 * Default: advisory only, not scored.
 */
export const PRESENCE_FOLDS_INTO_SCORE = false;

/** Score tone bands (reuse of demo scoreTone; §6). */
export const TONE_BANDS = { good: 70, attention: 40 } as const;

/** Category weight clamps [min, max] (calibration Table D, P1-8). */
export const CATEGORY_WEIGHT_CLAMPS: Record<
  string,
  { min: number; max: number; fixed: number }
> = {
  property: { min: 0.12, max: 0.32, fixed: 0.22 },
  "business-continuity": { min: 0.1, max: 0.3, fixed: 0.2 },
  liability: { min: 0.08, max: 0.28, fixed: 0.18 },
  cyber: { min: 0.05, max: 0.25, fixed: 0.12 },
  people: { min: 0.1, max: 0.3, fixed: 0.2 },
  other: { min: 0.04, max: 0.15, fixed: 0.08 },
};

/** Which exposure lines map into which score category (calibration Table D). */
export const CATEGORY_OF_LINE: Record<string, string> = {
  "property-fire": "property",
  stock: "property",
  machinery: "property",
  bi: "business-continuity",
  marine: "business-continuity",
  liability: "liability",
  "product-liability": "liability",
  do: "liability",
  pi: "liability",
  cyber: "cyber",
  gpa: "people",
  gmc: "people",
  gtl: "people",
  wc: "people",
  "motor-tp": "other",
  "motor-od": "other",
};

/**
 * Industry → per-line materiality weight `wᵢ` (calibration Table A).
 * Only the Manufacturing column is populated for the stub; other industries
 * fall back to it until broking supplies the full grid.
 */
export const INDUSTRY_LINE_WEIGHTS: Record<string, Record<string, number>> = {
  Manufacturing: {
    "property-fire": 3,
    stock: 3,
    bi: 3,
    machinery: 3,
    marine: 2,
    liability: 2,
    "product-liability": 3,
    pi: 0,
    do: 1,
    cyber: 1,
    gpa: 3,
    gmc: 2,
    gtl: 1,
    wc: 3,
    // "Motor Fleet" is a single Table A materiality (2). It is assessed as two lines
    // — motor-tp (compliance) + motor-od (quantitative) — but for CATEGORY-WEIGHT
    // derivation the fleet must count once, so the TP sub-view carries 0 here.
    "motor-tp": 0,
    "motor-od": 2,
  },
  "IT/ITES": {
    "property-fire": 1,
    stock: 0,
    bi: 2,
    machinery: 0,
    marine: 0,
    liability: 1,
    "product-liability": 0,
    pi: 3,
    do: 2,
    cyber: 3,
    gpa: 2,
    gmc: 3,
    gtl: 2,
    wc: 1,
    "motor-tp": 0,
    "motor-od": 0,
  },
};

/** Gross-profit margins for BI sizing (calibration Table B1). */
export const GP_MARGIN: Record<string, number> = {
  Manufacturing: 0.25,
  "Warehouse/Logistics": 0.3,
  "Trading/Wholesale": 0.12,
  Retail: 0.2,
  "IT/ITES": 0.45,
  "Professional Services": 0.5,
  Healthcare: 0.4,
  Hospitality: 0.35,
  Construction: 0.18,
};
