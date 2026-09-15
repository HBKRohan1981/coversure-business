/**
 * CoverSure Business — Input & Data Acquisition Schema V1 (machine-readable).
 *
 * Companion to docs/input-data-acquisition-matrix-v1.md. This is the structured,
 * field-level record of everything the assessment engine MAY need, and where each
 * field should come from — encoding the product principle "extract first, ask later".
 *
 * IMPORTANT — this is a DATA-ACQUISITION spec, not scoring logic:
 *  - It introduces NO benchmarks, thresholds, penalties or scoring rules.
 *  - `engineMapping` names the EXACT existing engine symbol a field feeds, or is null.
 *  - Where the current engine/calibration does not define something, `openIssue`
 *    carries an "OPEN — …" marker. Nothing here is invented.
 *
 * Types are REUSED from ./types.ts wherever possible.
 */

import type { ExposureLineKey, LineStatus, TermState } from "./types.ts";

/** Assessment line an input belongs to, plus cross-cutting buckets. */
export type InputLine =
  | ExposureLineKey
  | "business" // business-level profile / exposure indicators
  | "common-policy" // fields present on ANY identified policy (ExtractedPolicy shape)
  | "common-asset"; // fields present on ANY asset (ExtractedAsset shape)

export type FieldCategory =
  | "business-profile"
  | "exposure"
  | "benchmark"
  | "existing-policy"
  | "coverage-terms"
  | "claims"
  | "employee"
  | "asset";

export type DataType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "currency"
  | "percentage"
  | "enum"
  | "array"
  | "tri-state"; // present | absent | unconfirmed (engine TermState)

/** Sources, tagged to the tier hierarchy in the matrix doc (§4). */
export type Source =
  // Tier 1 — primary company / policy evidence
  | "insurance-policy"
  | "policy-schedule"
  | "endorsement"
  | "policy-wording"
  | "claims-mis"
  | "financial-statements"
  | "annual-report"
  | "employee-census"
  | "asset-register"
  | "vehicle-list"
  // Tier 2 — company-published information
  | "company-website"
  | "investor-presentation"
  | "company-profile"
  // Tier 3 — external / public
  | "mca-filings"
  | "contracts"
  | "external-public"
  // Tier 4 — corporate-provided answer (fallback)
  | "corporate";

export type Extractable = "yes" | "partial" | "no";
export type ExtractionMethod = "text" | "table" | "ocr" | "calculation" | "inference" | "none";
export type Confidence = "high" | "medium" | "low";
export type QuestionRequired = "yes" | "conditional" | "no";
export type Mandatory = "mandatory" | "important" | "optional";
export type AssessmentImpact =
  | "benchmark"
  | "si-adequacy"
  | "coverage-adequacy"
  | "exposure-classification"
  | "completeness"
  | "none";

/** Status the engine assigns to the line/fact when this input cannot be obtained. */
export type UnavailableStatus = LineStatus | "unconfirmed" | "n/a";

export interface InputField {
  line: InputLine;
  category: FieldCategory;
  field: string; // machine-readable name (snake_case)
  description: string;
  whyRequired: string;
  dataType: DataType;
  preferredSource: Source;
  secondarySources: Source[];
  canAIExtract: Extractable;
  extractionMethod: ExtractionMethod;
  evidenceRequired: boolean;
  evidenceExample: string;
  confidenceRequired: Confidence;
  corporateQuestionRequired: QuestionRequired;
  corporateQuestion: string | null; // plain-English, no jargon; null when never asked
  whenToAsk: string | null; // trigger condition
  mandatory: Mandatory;
  assessmentImpact: AssessmentImpact;
  engineMapping: string | null; // exact engine symbol, or null when none exists
  statusIfUnavailable: UnavailableStatus;
  openIssue: string | null; // "OPEN — …" when calibration/spec is incomplete
}

// Shorthand helpers keep the large array readable without inventing anything.
const T1_POLICY: Source[] = ["policy-schedule", "policy-wording", "endorsement"];

/** A coverage-term (tri-state checklist) field feeding QuantitativeLineInput.checklist/adverse. */
function term(
  line: ExposureLineKey,
  field: string,
  description: string,
  mapping: string,
  opts: Partial<InputField> = {}
): InputField {
  return {
    line,
    category: "coverage-terms",
    field,
    description,
    whyRequired: "Coverage-terms adequacy (spec §5b) — tri-state checklist item.",
    dataType: "tri-state",
    preferredSource: "policy-wording",
    secondarySources: ["policy-schedule", "endorsement"],
    canAIExtract: "partial",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "Clause/exclusion text in the wording or schedule, with page ref.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "no",
    corporateQuestion: null,
    whenToAsk: null,
    mandatory: "important",
    assessmentImpact: "coverage-adequacy",
    engineMapping: mapping,
    statusIfUnavailable: "unconfirmed", // tri-state unconfirmed → excluded from denominator
    openIssue: "OPEN — item weight/penalty is a ⚙️ calibration proposal (Table C), not yet coded.",
    ...opts,
  };
}

// ---------------------------------------------------------------------------
// 1) BUSINESS-LEVEL — determines which lines are relevant + shared benchmark facts
// ---------------------------------------------------------------------------

const BUSINESS: InputField[] = [
  {
    line: "business",
    category: "business-profile",
    field: "industry",
    description: "Primary industry classification of the business.",
    whyRequired:
      "Selects applicable lines, materiality weights (INDUSTRY_LINE_WEIGHTS) and assessment modes (Table A2).",
    dataType: "enum",
    preferredSource: "annual-report",
    secondarySources: ["company-website", "company-profile", "mca-filings", "financial-statements"],
    canAIExtract: "yes",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "'Principal business activity' in the annual report / MCA master data.",
    confidenceRequired: "high",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "What does your business mainly do?",
    whenToAsk: "Only if industry cannot be classified from documents/website.",
    mandatory: "mandatory",
    assessmentImpact: "exposure-classification",
    engineMapping: "EngineBusinessProfile.industry",
    statusIfUnavailable: "unconfirmed",
    openIssue:
      "OPEN — only Manufacturing + IT/ITES weight columns coded; other industries fall back to Manufacturing.",
  },
  {
    line: "business",
    category: "exposure",
    field: "business_activity_description",
    description: "Free-text description of what the business actually does.",
    whyRequired: "Refines line relevance beyond the coarse industry label.",
    dataType: "string",
    preferredSource: "company-website",
    secondarySources: ["annual-report", "company-profile", "investor-presentation"],
    canAIExtract: "yes",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "'About us' / business-overview section.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "no",
    corporateQuestion: null,
    whenToAsk: null,
    mandatory: "important",
    assessmentImpact: "exposure-classification",
    engineMapping: null,
    openIssue: "OPEN — free-text → line-relevance mapping not defined in the engine.",
    statusIfUnavailable: "unconfirmed",
  },
  {
    line: "business",
    category: "benchmark",
    field: "annual_turnover",
    description: "Annual revenue / turnover (INR).",
    whyRequired:
      "Benchmark input for BI, Liability/CGL, Product, PI, D&O, Cyber (Table B / B2 / B3).",
    dataType: "currency",
    preferredSource: "financial-statements",
    secondarySources: ["annual-report", "investor-presentation", "mca-filings"],
    canAIExtract: "yes",
    extractionMethod: "table",
    evidenceRequired: true,
    evidenceExample: "Revenue from operations line in the audited P&L, with page ref.",
    confidenceRequired: "high",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "What is your approximate annual turnover?",
    whenToAsk: "Only if not found in financials/annual report.",
    mandatory: "mandatory",
    assessmentImpact: "benchmark",
    engineMapping: "EngineBusinessProfile.turnover → QuantitativeLineInput.R (Table B2/B3)",
    statusIfUnavailable: "unavailable",
    openIssue: "OPEN — B2/B3 turnover/revenue→limit bands are ⚙️ proposals, not coded (Stage 3).",
  },
  {
    line: "business",
    category: "employee",
    field: "employee_count",
    description: "Total number of employees.",
    whyRequired: "Gates people lines (GPA/GMC/GTL/WC) relevance; sizing context.",
    dataType: "number",
    preferredSource: "employee-census",
    secondarySources: ["annual-report", "financial-statements", "mca-filings"],
    canAIExtract: "yes",
    extractionMethod: "table",
    evidenceRequired: true,
    evidenceExample: "Headcount in the census / directors' report.",
    confidenceRequired: "high",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "How many people do you employ?",
    whenToAsk: "If no census and not stated in the annual report.",
    mandatory: "mandatory",
    assessmentImpact: "exposure-classification",
    engineMapping: "EngineBusinessProfile.employees",
    statusIfUnavailable: "unconfirmed",
    openIssue: null,
  },
  {
    line: "business",
    category: "benchmark",
    field: "fixed_assets_value",
    description: "Book/declared value of fixed assets (buildings + plant + machinery), INR.",
    whyRequired: "Reinstatement benchmark for Property/Fire + Machinery (Table B).",
    dataType: "currency",
    preferredSource: "asset-register",
    secondarySources: ["financial-statements", "annual-report"],
    canAIExtract: "yes",
    extractionMethod: "table",
    evidenceRequired: true,
    evidenceExample: "Fixed-asset schedule / balance-sheet note.",
    confidenceRequired: "high",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "What would it cost today to rebuild your premises and replace your equipment?",
    whenToAsk: "If asset register/financials do not give a reinstatement basis.",
    mandatory: "important",
    assessmentImpact: "benchmark",
    engineMapping: "EngineBusinessProfile.fixedAssets → QuantitativeLineInput.R (property-fire)",
    statusIfUnavailable: "unavailable",
    openIssue:
      "OPEN — book value ≠ reinstatement value; reinstatement sizing rule not coded (Stage 3).",
  },
  {
    line: "business",
    category: "benchmark",
    field: "inventory_value",
    description: "Declared stock / inventory value at cost/market (INR).",
    whyRequired: "Benchmark for the Stock line (declaration/floater, valued at cost).",
    dataType: "currency",
    preferredSource: "financial-statements",
    secondarySources: ["annual-report", "asset-register"],
    canAIExtract: "yes",
    extractionMethod: "table",
    evidenceRequired: true,
    evidenceExample: "Inventories line in the balance sheet.",
    confidenceRequired: "high",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "What is the typical value of stock/inventory you hold?",
    whenToAsk: "If not in financials.",
    mandatory: "important",
    assessmentImpact: "benchmark",
    engineMapping: "EngineBusinessProfile.inventory → QuantitativeLineInput.R (stock)",
    statusIfUnavailable: "unavailable",
    openIssue: null,
  },
  {
    line: "business",
    category: "benchmark",
    field: "avg_ctc",
    description: "Average annual CTC / salary per employee (INR).",
    whyRequired: "Required for GPA (≥3× CTC) and GTL (≥3× salary) benchmarks (Table B).",
    dataType: "currency",
    preferredSource: "employee-census",
    secondarySources: ["financial-statements"],
    canAIExtract: "partial",
    extractionMethod: "calculation",
    evidenceRequired: true,
    evidenceExample: "Payroll/census total ÷ headcount, or per-grade CTC table.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "What is the average annual salary (CTC) across your employees?",
    whenToAsk: "When GPA/GTL are material and CTC is not in the census/financials.",
    mandatory: "important",
    assessmentImpact: "benchmark",
    engineMapping: "EngineBusinessProfile.avgCTC → GPA/GTL R",
    statusIfUnavailable: "unavailable", // reproducibility rule: missing fact → R unconfirmed → line unavailable
    openIssue: null,
  },
  {
    line: "business",
    category: "benchmark",
    field: "gross_profit_margin",
    description: "Gross-profit margin used to size Business Interruption.",
    whyRequired: "BI benchmark = Gross Profit × indemnity period (Table B / B1).",
    dataType: "percentage",
    preferredSource: "financial-statements",
    secondarySources: ["annual-report"],
    canAIExtract: "partial",
    extractionMethod: "calculation",
    evidenceRequired: true,
    evidenceExample: "Derived from P&L, or industry default GP_MARGIN[industry].",
    confidenceRequired: "medium",
    corporateQuestionRequired: "no",
    corporateQuestion: null,
    whenToAsk: null,
    mandatory: "optional",
    assessmentImpact: "benchmark",
    engineMapping: "calibration.GP_MARGIN[industry] (coded) → BI R (R computation not coded)",
    statusIfUnavailable: "unavailable",
    openIssue: "OPEN — BI R = GP × indemnity period not coded (Stage 3).",
  },
  {
    line: "business",
    category: "exposure",
    field: "num_locations",
    description: "Number of physical locations/sites.",
    whyRequired: "Property/BI exposure spread; multi-location scaling.",
    dataType: "number",
    preferredSource: "annual-report",
    secondarySources: ["company-website", "asset-register", "company-profile"],
    canAIExtract: "partial",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "Plant/office locations note or 'Contact us' page.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "How many locations does your business operate from?",
    whenToAsk: "If not derivable from documents/website.",
    mandatory: "important",
    assessmentImpact: "exposure-classification",
    engineMapping: null,
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — location count is not an EngineBusinessProfile field.",
  },
  {
    line: "business",
    category: "exposure",
    field: "location_addresses",
    description: "Addresses/geo of sites (for peril zone e.g. earthquake/flood).",
    whyRequired: "Geo-dependent coverage relevance (earthquake add-on, STFI).",
    dataType: "array",
    preferredSource: "asset-register",
    secondarySources: ["annual-report", "company-website", "policy-schedule"],
    canAIExtract: "partial",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "Address list on schedule or asset register.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "What are the addresses of your main sites?",
    whenToAsk: "If earthquake/flood relevance cannot be established.",
    mandatory: "optional",
    assessmentImpact: "exposure-classification",
    engineMapping: null,
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — peril-zone mapping not defined in the engine.",
  },
  {
    line: "business",
    category: "exposure",
    field: "manufacturing_activity",
    description: "Whether the business manufactures/processes goods.",
    whyRequired: "Triggers Product Liability + Machinery relevance.",
    dataType: "boolean",
    preferredSource: "annual-report",
    secondarySources: ["company-website", "company-profile"],
    canAIExtract: "yes",
    extractionMethod: "inference",
    evidenceRequired: true,
    evidenceExample: "Description of manufacturing operations / plant.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "Do you manufacture or process any physical products?",
    whenToAsk: "If not clear from documents/website.",
    mandatory: "important",
    assessmentImpact: "exposure-classification",
    engineMapping: "informs INDUSTRY_LINE_WEIGHTS selection (product-liability, machinery)",
    statusIfUnavailable: "unconfirmed",
    openIssue: null,
  },
  {
    line: "business",
    category: "exposure",
    field: "export_activity",
    description: "Whether the business exports goods.",
    whyRequired: "Product Liability band uplift (Table B, +1 band if exporter).",
    dataType: "boolean",
    preferredSource: "annual-report",
    secondarySources: ["financial-statements", "company-website"],
    canAIExtract: "yes",
    extractionMethod: "inference",
    evidenceRequired: true,
    evidenceExample: "Export revenue in segment note / 'export' mention.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "Do you export products outside India?",
    whenToAsk: "If Product Liability is material and export status is unclear.",
    mandatory: "optional",
    assessmentImpact: "benchmark",
    engineMapping: "informs product-liability R band (Table B)",
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — exporter band uplift not coded.",
  },
  {
    line: "business",
    category: "exposure",
    field: "professional_services",
    description: "Whether the business provides professional/advisory services.",
    whyRequired: "Triggers Professional Indemnity relevance.",
    dataType: "boolean",
    preferredSource: "company-website",
    secondarySources: ["annual-report", "company-profile"],
    canAIExtract: "yes",
    extractionMethod: "inference",
    evidenceRequired: true,
    evidenceExample: "Services described as advisory/consulting/professional.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "Do you provide professional advice or services clients rely on?",
    whenToAsk: "If PI relevance cannot be established from documents.",
    mandatory: "important",
    assessmentImpact: "exposure-classification",
    engineMapping: "informs INDUSTRY_LINE_WEIGHTS selection (pi)",
    statusIfUnavailable: "unconfirmed",
    openIssue: null,
  },
  {
    line: "business",
    category: "exposure",
    field: "sensitive_data_exposure",
    description: "Whether the business handles sensitive customer/employee data (PII).",
    whyRequired: "Cyber 'data-heavy' trigger (Table B3 note): PII flag → +1 band.",
    dataType: "boolean",
    preferredSource: "company-website",
    secondarySources: ["annual-report", "contracts"],
    canAIExtract: "partial",
    extractionMethod: "inference",
    evidenceRequired: true,
    evidenceExample:
      "Privacy policy / data-handling statement — recorded as INFERENCE with confidence, never a confirmed fact.",
    confidenceRequired: "low",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "Do you store personal or sensitive information about customers or staff?",
    whenToAsk: "When Cyber is material and PII handling is only inferred, not evidenced.",
    mandatory: "important",
    assessmentImpact: "benchmark",
    engineMapping: "informs cyber 'data-heavy' band (Table B3) — trigger not coded",
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — deterministic data-heavy trigger (industry set / PII / e-com share) not coded.",
  },
  {
    line: "business",
    category: "exposure",
    field: "ecommerce_revenue_share",
    description: "Share of revenue from e-commerce.",
    whyRequired: "Cyber data-heavy trigger (e-commerce share > 30%, Table B3 note).",
    dataType: "percentage",
    preferredSource: "annual-report",
    secondarySources: ["investor-presentation", "company-website"],
    canAIExtract: "partial",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "Segment/channel revenue split.",
    confidenceRequired: "low",
    corporateQuestionRequired: "no",
    corporateQuestion: null,
    whenToAsk: null,
    mandatory: "optional",
    assessmentImpact: "benchmark",
    engineMapping: "informs cyber data-heavy trigger (Table B3)",
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — 30% threshold is a ⚙️ proposal, not coded.",
  },
  {
    line: "business",
    category: "exposure",
    field: "vehicles_operated",
    description: "Whether the business owns/operates vehicles.",
    whyRequired: "Triggers Motor (TP compliance + OD) relevance.",
    dataType: "boolean",
    preferredSource: "vehicle-list",
    secondarySources: ["asset-register", "financial-statements"],
    canAIExtract: "yes",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "Vehicle list / motor policy / asset register 'vehicles'.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "Does your business own or operate any vehicles?",
    whenToAsk: "If no vehicle list/motor policy found.",
    mandatory: "optional",
    assessmentImpact: "exposure-classification",
    engineMapping: "informs INDUSTRY_LINE_WEIGHTS selection (motor-tp, motor-od)",
    statusIfUnavailable: "unconfirmed",
    openIssue: null,
  },
  {
    line: "business",
    category: "business-profile",
    field: "years_operating",
    description: "Years the business has been operating.",
    whyRequired: "Context only (demo profile field); no current scoring impact.",
    dataType: "number",
    preferredSource: "mca-filings",
    secondarySources: ["annual-report", "company-website"],
    canAIExtract: "yes",
    extractionMethod: "text",
    evidenceRequired: false,
    evidenceExample: "Incorporation date on MCA master data.",
    confidenceRequired: "low",
    corporateQuestionRequired: "no",
    corporateQuestion: null,
    whenToAsk: null,
    mandatory: "optional",
    assessmentImpact: "none",
    engineMapping: "BusinessProfile.yearsOperating (demo type only)",
    statusIfUnavailable: "unconfirmed",
    openIssue: null,
  },
];

// ---------------------------------------------------------------------------
// 2) COMMON existing-policy fields — apply to EVERY identified policy (ExtractedPolicy)
// ---------------------------------------------------------------------------

const policyField = (
  field: string,
  description: string,
  mapping: string,
  opts: Partial<InputField> = {}
): InputField => ({
  line: "common-policy",
  category: "existing-policy",
  field,
  description,
  whyRequired: "Identifies/among-assesses an existing policy on a line.",
  dataType: "string",
  preferredSource: "policy-schedule",
  secondarySources: ["insurance-policy", "endorsement", "policy-wording"],
  canAIExtract: "yes",
  extractionMethod: "text",
  evidenceRequired: true,
  evidenceExample: "Value read from the policy schedule with page ref.",
  confidenceRequired: "high",
  corporateQuestionRequired: "conditional",
  corporateQuestion: "Can you share the policy document for this cover?",
  whenToAsk: "If a policy is referenced but its schedule/wording was not provided.",
  mandatory: "important",
  assessmentImpact: "none",
  engineMapping: mapping,
  statusIfUnavailable: "not-identified",
  openIssue: null,
  ...opts,
});

const COMMON_POLICY: InputField[] = [
  policyField("policy_insurer", "Insurer name.", "ExtractedPolicy.insurer"),
  policyField("policy_number", "Policy number.", "ExtractedPolicy.policyNumber"),
  policyField("policy_type", "Policy/product type.", "ExtractedPolicy.type", {
    assessmentImpact: "exposure-classification",
  }),
  policyField("policy_line", "Exposure line this policy maps to.", "ExtractedPolicy.line", {
    extractionMethod: "inference",
    assessmentImpact: "exposure-classification",
  }),
  policyField("policy_sum_insured", "Sum insured / limit (INR).", "ExtractedPolicy.sumInsured", {
    dataType: "currency",
    whyRequired: "C in SI-adequacy (spec §5a): si_ratio = C / R.",
    assessmentImpact: "si-adequacy",
    corporateQuestion: "What is the sum insured / cover limit on this policy?",
    statusIfUnavailable: "unconfirmed",
  }),
  policyField("policy_premium", "Premium (INR).", "ExtractedPolicy.premium", {
    dataType: "currency",
    whyRequired: "Context / provenance; no current scoring impact.",
    assessmentImpact: "none",
    corporateQuestionRequired: "no",
    corporateQuestion: null,
    mandatory: "optional",
  }),
  policyField("policy_start_date", "Policy inception date.", "ExtractedPolicy.startDate", {
    dataType: "date",
  }),
  policyField("policy_renewal_date", "Policy renewal/expiry date.", "ExtractedPolicy.renewalDate", {
    dataType: "date",
    whyRequired: "Renewal bucketing (portfolio.ts 30/60/90).",
  }),
  policyField(
    "policy_valuation_basis",
    "Basis of valuation (reinstatement / market-value / agreed / unknown).",
    "ExtractedPolicy.basisOfValuation",
    {
      dataType: "enum",
      whyRequired: "Market-value basis where reinstatement expected → average-clause risk (§5a).",
      assessmentImpact: "coverage-adequacy",
    }
  ),
  policyField("policy_sub_limits", "Sub-limits map.", "ExtractedPolicy.subLimits", {
    dataType: "array",
    whyRequired: "Per-peril / per-event sub-limit adequacy.",
    assessmentImpact: "coverage-adequacy",
    openIssue: "OPEN — sub-limit adequacy rule not coded.",
  }),
  policyField("policy_deductible", "Deductible / excess (INR).", "ExtractedPolicy.deductible", {
    dataType: "currency",
    whyRequired: "High-excess adverse term (Table C1).",
    assessmentImpact: "coverage-adequacy",
    mandatory: "optional",
  }),
  policyField(
    "policy_related_asset_keys",
    "Assets this policy covers (for de-dup/overlap).",
    "ExtractedPolicy.relatedAssetKeys",
    {
      dataType: "array",
      whyRequired: "Coverage mapping + de-duplication of overlapping cover (spec §4).",
      assessmentImpact: "exposure-classification",
      extractionMethod: "inference",
      openIssue: "OPEN — coverage de-dup/overlap resolution not coded (Stage 4).",
    }
  ),
];

// ---------------------------------------------------------------------------
// 3) COMMON asset fields — ExtractedAsset (property / machinery / stock / marine / motor)
// ---------------------------------------------------------------------------

const assetField = (
  field: string,
  description: string,
  mapping: string,
  opts: Partial<InputField> = {}
): InputField => ({
  line: "common-asset",
  category: "asset",
  field,
  description,
  whyRequired: "Builds the exposure base + reinstatement/declared values for benchmarks.",
  dataType: "string",
  preferredSource: "asset-register",
  secondarySources: ["financial-statements", "policy-schedule"],
  canAIExtract: "partial",
  extractionMethod: "table",
  evidenceRequired: true,
  evidenceExample: "Row in the fixed-asset register with value + location.",
  confidenceRequired: "medium",
  corporateQuestionRequired: "conditional",
  corporateQuestion: "Can you share your asset register?",
  whenToAsk: "If asset values cannot be established from documents.",
  mandatory: "important",
  assessmentImpact: "benchmark",
  engineMapping: mapping,
  statusIfUnavailable: "unavailable",
  openIssue: null,
  ...opts,
});

const COMMON_ASSET: InputField[] = [
  assetField("asset_name", "Asset name.", "ExtractedAsset.name", {
    assessmentImpact: "none",
    dataType: "string",
  }),
  assetField("asset_type", "Asset type (factory/warehouse/machinery/…).", "ExtractedAsset.type", {
    assessmentImpact: "exposure-classification",
  }),
  assetField(
    "asset_category",
    "immovable | movable.",
    "ExtractedAsset.category",
    { dataType: "enum", assessmentImpact: "exposure-classification" }
  ),
  assetField("asset_location", "Asset location.", "ExtractedAsset.location", {
    assessmentImpact: "exposure-classification",
  }),
  assetField("asset_declared_value", "Declared value (INR).", "ExtractedAsset.declaredValue", {
    dataType: "currency",
  }),
  assetField(
    "asset_valuation_basis",
    "reinstatement | cost | market (stock = cost/market).",
    "ExtractedAsset.valuationBasis",
    { dataType: "enum", assessmentImpact: "benchmark" }
  ),
];

// ---------------------------------------------------------------------------
// 4) PER-LINE benchmark inputs + coverage terms
//    (existing-policy inputs are the COMMON_POLICY set applied per identified policy)
// ---------------------------------------------------------------------------

// Benchmark-input helper.
const bench = (
  line: ExposureLineKey,
  field: string,
  description: string,
  question: string | null,
  opts: Partial<InputField> = {}
): InputField => ({
  line,
  category: "benchmark",
  field,
  description,
  whyRequired: "Recommended-cover benchmark R for the line (spec §5a, Table B).",
  dataType: "currency",
  preferredSource: "financial-statements",
  secondarySources: ["annual-report", "asset-register"],
  canAIExtract: "partial",
  extractionMethod: "calculation",
  evidenceRequired: true,
  evidenceExample: "Underlying figure(s) the benchmark is computed from, with source ref.",
  confidenceRequired: "medium",
  corporateQuestionRequired: question ? "conditional" : "no",
  corporateQuestion: question,
  whenToAsk: question ? "When the line is material and the fact is not in documents." : null,
  mandatory: "important",
  assessmentImpact: "benchmark",
  engineMapping: "QuantitativeLineInput.R (Table B — R computation not coded, Stage 3)",
  statusIfUnavailable: "unavailable", // reproducibility rule §4: missing fact → R unconfirmed → unavailable
  openIssue: "OPEN — R formula/bands are ⚙️ calibration proposals, not coded.",
  ...opts,
});

const PROPERTY: InputField[] = [
  bench(
    "property-fire",
    "property_building_value",
    "Reinstatement value of buildings (INR).",
    "What would it cost today to rebuild your buildings?",
    { preferredSource: "asset-register" }
  ),
  bench(
    "property-fire",
    "property_plant_machinery_value",
    "Reinstatement value of plant & machinery (INR).",
    "What would it cost to replace your plant and machinery?",
    { preferredSource: "asset-register" }
  ),
  {
    line: "property-fire",
    category: "exposure",
    field: "property_building_ownership",
    description: "Owned vs leased/occupied premises.",
    whyRequired: "Determines whose building SI applies / occupier exposure.",
    dataType: "enum",
    preferredSource: "asset-register",
    secondarySources: ["contracts", "annual-report"],
    canAIExtract: "partial",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "Lease/title reference or asset register ownership flag.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "Do you own or rent your premises?",
    whenToAsk: "If ownership is unclear and property is material.",
    mandatory: "optional",
    assessmentImpact: "exposure-classification",
    engineMapping: null,
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — ownership/occupancy modifier not defined in the engine.",
  },
  term("property-fire", "property_term_reinstatement_clause", "Reinstatement value clause present.", "ExtractedPolicy.addOns['reinstatement-clause']"),
  term("property-fire", "property_term_stfi", "STFI (storm/flood/inundation) not excluded.", "ExtractedPolicy.addOns['stfi']"),
  term("property-fire", "property_term_earthquake", "Earthquake add-on (geo-dependent).", "ExtractedPolicy.addOns['earthquake']"),
  term("property-fire", "property_term_escalation", "Escalation clause.", "ExtractedPolicy.addOns['escalation']"),
  term("property-fire", "property_term_terrorism", "Terrorism add-on.", "ExtractedPolicy.addOns['terrorism']"),
  term("property-fire", "property_term_debris_removal", "Debris removal / architect fees.", "ExtractedPolicy.addOns['debris-removal']"),
  term("property-fire", "property_adverse_market_value_basis", "Adverse: market-value (not reinstatement) basis.", "ExtractedPolicy.exclusions['market-value-basis']"),
  term("property-fire", "property_adverse_underdeclaration", "Adverse: under-declaration / average-clause risk.", "ExtractedPolicy.exclusions['under-declaration']"),
  term("property-fire", "property_adverse_named_perils", "Adverse: named-perils only.", "ExtractedPolicy.exclusions['named-perils-only']"),
  term("property-fire", "property_adverse_high_excess", "Adverse: high excess (> 5% of SI).", "ExtractedPolicy.deductible"),
];

const STOCK: InputField[] = [
  bench(
    "stock",
    "stock_declared_value",
    "Declared stock value at cost/market (INR).",
    "What is the typical value of stock/inventory you hold?",
    {
      preferredSource: "financial-statements",
      engineMapping: "QuantitativeLineInput.R (stock) ← inventory_value",
      openIssue: "OPEN — stock de-dup vs fire declaration + cost/market basis rule not coded (Stage 4).",
    }
  ),
];

const BI: InputField[] = [
  bench(
    "bi",
    "bi_gross_profit",
    "Gross profit for BI sizing (INR).",
    "Roughly what is your annual gross profit?",
    { openIssue: "OPEN — BI R = GP × indemnity period not coded." }
  ),
  {
    line: "bi",
    category: "benchmark",
    field: "bi_indemnity_period",
    description: "Time to return to normal operations after a major incident (months).",
    whyRequired: "Indemnity-period multiplier in the BI benchmark (Table B).",
    dataType: "number",
    preferredSource: "corporate",
    secondarySources: ["policy-schedule"],
    canAIExtract: "no",
    extractionMethod: "none",
    evidenceRequired: false,
    evidenceExample: "Corporate estimate; or indemnity period stated on an existing BI schedule.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "yes",
    corporateQuestion:
      "If your business had to stop after a major incident, roughly how long would it take to get back to normal?",
    whenToAsk: "Whenever BI is material (rarely stated in documents).",
    mandatory: "important",
    assessmentImpact: "benchmark",
    engineMapping: "QuantitativeLineInput.R (bi) — not coded",
    statusIfUnavailable: "unavailable",
    openIssue: "OPEN — indemnity-period default/prompt not coded.",
  },
  term("bi", "bi_term_gross_profit_basis", "Gross-profit basis (not standing charges only).", "ExtractedPolicy.addOns['gross-profit-basis']"),
  term("bi", "bi_term_indemnity_12mo", "Indemnity period ≥ 12 months.", "ExtractedPolicy.addOns['indemnity-12mo']"),
  term("bi", "bi_term_supplier_customer_ext", "Supplier / customer extension.", "ExtractedPolicy.addOns['supplier-customer-extension']"),
  term("bi", "bi_term_denial_of_access", "Denial-of-access / utilities extension.", "ExtractedPolicy.addOns['denial-of-access']"),
  term("bi", "bi_adverse_indemnity_lt_6mo", "Adverse: indemnity period < 6 months.", "ExtractedPolicy.exclusions['indemnity-lt-6mo']"),
  term("bi", "bi_adverse_gp_underdeclared", "Adverse: GP under-declared vs financials.", "ExtractedPolicy.exclusions['gp-under-declared']"),
];

const MACHINERY: InputField[] = [
  bench(
    "machinery",
    "machinery_value",
    "Value of plant & machinery (INR).",
    "What is the value of your plant and machinery?",
    { preferredSource: "asset-register" }
  ),
  {
    line: "machinery",
    category: "coverage-terms",
    field: "machinery_coverage_checklist",
    description: "Machinery Breakdown coverage checklist.",
    whyRequired: "Coverage-terms adequacy.",
    dataType: "tri-state",
    preferredSource: "policy-wording",
    secondarySources: T1_POLICY,
    canAIExtract: "partial",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "Machinery breakdown wording.",
    confidenceRequired: "low",
    corporateQuestionRequired: "no",
    corporateQuestion: null,
    whenToAsk: null,
    mandatory: "optional",
    assessmentImpact: "coverage-adequacy",
    engineMapping: "QuantitativeLineInput.checklist",
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — Machinery Breakdown checklist not defined (Table C: '⚙️ to be added').",
  },
];

const MARINE: InputField[] = [
  bench(
    "marine",
    "marine_largest_consignment",
    "Largest single consignment / annual goods turnover (INR).",
    "What is the value of your largest single shipment, and roughly your annual goods moved?",
    { openIssue: "OPEN — single-carry vs annual basis + turnover÷12×1.5 proxy is ⚙️, not coded." }
  ),
  {
    line: "marine",
    category: "coverage-terms",
    field: "marine_coverage_checklist",
    description: "Marine / Transit coverage checklist.",
    whyRequired: "Coverage-terms adequacy.",
    dataType: "tri-state",
    preferredSource: "policy-wording",
    secondarySources: T1_POLICY,
    canAIExtract: "partial",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "Marine policy wording.",
    confidenceRequired: "low",
    corporateQuestionRequired: "no",
    corporateQuestion: null,
    whenToAsk: null,
    mandatory: "optional",
    assessmentImpact: "coverage-adequacy",
    engineMapping: "QuantitativeLineInput.checklist",
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — Marine checklist not defined (Table C: '⚙️ to be added').",
  },
];

const LIABILITY: InputField[] = [
  bench(
    "liability",
    "liability_turnover_band",
    "Turnover → CGL aggregate limit band (Table B2).",
    "What is your approximate annual turnover?",
    {
      extractionMethod: "calculation",
      engineMapping: "QuantitativeLineInput.R (liability) ← annual_turnover (Table B2)",
      openIssue: "OPEN — B2 turnover→limit bands are ⚙️ proposals, not coded.",
    }
  ),
  term("liability", "liability_term_public_liability", "Public liability present.", "ExtractedPolicy.addOns['public-liability']"),
  term("liability", "liability_term_product_liability", "Product liability present (if product business).", "ExtractedPolicy.addOns['product-liability']"),
  term("liability", "liability_term_legal_costs_in_addition", "Legal costs in addition to limit.", "ExtractedPolicy.addOns['legal-costs-in-addition']"),
  term("liability", "liability_term_sudden_pollution", "Sudden & accidental pollution.", "ExtractedPolicy.addOns['sudden-accidental-pollution']"),
  term("liability", "liability_term_adequate_per_event_sublimit", "Adequate per-event sub-limit.", "ExtractedPolicy.addOns['adequate-per-event-sublimit']"),
  term("liability", "liability_adverse_pollution_excluded", "Adverse: pollution fully excluded.", "ExtractedPolicy.exclusions['pollution-excluded']"),
  term("liability", "liability_adverse_product_recall_excluded", "Adverse: product recall excluded.", "ExtractedPolicy.exclusions['product-recall-excluded']"),
  term("liability", "liability_adverse_low_per_event_sublimit", "Adverse: low per-event sub-limit (< 25% agg).", "ExtractedPolicy.exclusions['low-per-event-sublimit']"),
];

const PRODUCT_LIABILITY: InputField[] = [
  bench(
    "product-liability",
    "product_liability_turnover_band",
    "Turnover → product-liability limit band (Table B2, +1 band if exporter).",
    "What is your approximate annual turnover?",
    {
      extractionMethod: "calculation",
      engineMapping: "QuantitativeLineInput.R (product-liability) ← annual_turnover + export_activity",
      openIssue: "OPEN — B2 bands + exporter uplift are ⚙️, not coded.",
    }
  ),
  {
    line: "product-liability",
    category: "coverage-terms",
    field: "product_liability_coverage_checklist",
    description: "Product-liability coverage checklist (shares CGL product items).",
    whyRequired: "Coverage-terms adequacy.",
    dataType: "tri-state",
    preferredSource: "policy-wording",
    secondarySources: T1_POLICY,
    canAIExtract: "partial",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "CGL/product wording (recall, product liability sub-limit).",
    confidenceRequired: "low",
    corporateQuestionRequired: "no",
    corporateQuestion: null,
    whenToAsk: null,
    mandatory: "optional",
    assessmentImpact: "coverage-adequacy",
    engineMapping: "QuantitativeLineInput.checklist (Table C3 product items)",
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — dedicated Product-liability checklist not separated from CGL (Table C).",
  },
];

const PI: InputField[] = [
  bench(
    "pi",
    "pi_turnover_band",
    "max(turnover band, largest contract × 2) (Table B).",
    "What is your approximate annual turnover?",
    {
      extractionMethod: "calculation",
      engineMapping: "QuantitativeLineInput.R (pi) ← annual_turnover / largest_contract",
      openIssue: "OPEN — PI R formula bands are ⚙️, not coded.",
    }
  ),
  bench(
    "pi",
    "pi_largest_contract_value",
    "Value of the largest single client contract (INR).",
    "What is the value of your largest single client contract or engagement?",
    {
      preferredSource: "contracts",
      secondarySources: ["annual-report", "corporate"],
      engineMapping: "QuantitativeLineInput.R (pi) input",
    }
  ),
  {
    line: "pi",
    category: "coverage-terms",
    field: "pi_coverage_checklist",
    description: "Professional Indemnity coverage checklist.",
    whyRequired: "Coverage-terms adequacy.",
    dataType: "tri-state",
    preferredSource: "policy-wording",
    secondarySources: T1_POLICY,
    canAIExtract: "partial",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "PI wording.",
    confidenceRequired: "low",
    corporateQuestionRequired: "no",
    corporateQuestion: null,
    whenToAsk: null,
    mandatory: "optional",
    assessmentImpact: "coverage-adequacy",
    engineMapping: "QuantitativeLineInput.checklist",
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — PI checklist not defined (Table C: '⚙️ to be added').",
  },
];

const DO: InputField[] = [
  bench(
    "do",
    "do_turnover_band",
    "Turnover → D&O limit band, cap ₹25 Cr SME (Table B2).",
    "What is your approximate annual turnover?",
    {
      extractionMethod: "calculation",
      mandatory: "optional",
      engineMapping: "QuantitativeLineInput.R (do) OR presence-mode (Table A2)",
      openIssue: "OPEN — D&O presence-vs-quantitative choice + bands are ⚙️, not coded.",
    }
  ),
  {
    line: "do",
    category: "existing-policy",
    field: "do_presence",
    description: "Whether a D&O policy exists (presence mode).",
    whyRequired: "Presence-mode assessment for advisory D&O (Table A2).",
    dataType: "tri-state",
    preferredSource: "policy-schedule",
    secondarySources: ["insurance-policy"],
    canAIExtract: "yes",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "D&O schedule, or confirmed absence.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "Do you have Directors & Officers cover in place?",
    whenToAsk: "If no D&O document found and it is material.",
    mandatory: "optional",
    assessmentImpact: "exposure-classification",
    engineMapping: "PresenceLineInput.presence",
    statusIfUnavailable: "not-identified",
    openIssue: null,
  },
];

const CYBER: InputField[] = [
  bench(
    "cyber",
    "cyber_revenue_band",
    "Revenue → cyber limit band (Table B3), +1 band if data-heavy.",
    "What is your approximate annual turnover?",
    {
      extractionMethod: "calculation",
      mandatory: "optional",
      engineMapping: "QuantitativeLineInput.R (cyber) ← annual_turnover + data-heavy trigger",
      openIssue: "OPEN — B3 bands + data-heavy trigger are ⚙️, not coded.",
    }
  ),
  term("cyber", "cyber_term_first_party", "First-party (data restoration + BI).", "ExtractedPolicy.addOns['cyber-first-party']"),
  term("cyber", "cyber_term_third_party", "Third-party liability.", "ExtractedPolicy.addOns['cyber-third-party']"),
  term("cyber", "cyber_term_ransomware", "Ransomware / cyber extortion.", "ExtractedPolicy.addOns['ransomware']"),
  term("cyber", "cyber_term_breach_response", "Breach response & notification costs.", "ExtractedPolicy.addOns['breach-response']"),
  term("cyber", "cyber_term_regulatory_defence", "Regulatory defence costs.", "ExtractedPolicy.addOns['regulatory-defence']"),
];

const GPA: InputField[] = [
  bench(
    "gpa",
    "gpa_per_life_si",
    "Per-life sum insured on the GPA policy (INR).",
    "What is the personal-accident cover amount per employee?",
    {
      preferredSource: "policy-schedule",
      whyRequired: "C for GPA SI-adequacy vs ≥3× CTC benchmark (Table B).",
      assessmentImpact: "si-adequacy",
      engineMapping: "QuantitativeLineInput.C (gpa); R ← avg_ctc",
      statusIfUnavailable: "unconfirmed",
      openIssue: "OPEN — 3×CTC floor ₹10L benchmark not coded; needs avg_ctc (else unavailable).",
    }
  ),
  term("gpa", "gpa_term_death_ptd", "Death + Permanent Total Disability.", "ExtractedPolicy.addOns['death-ptd']"),
  term("gpa", "gpa_term_ppd", "Permanent Partial Disability.", "ExtractedPolicy.addOns['ppd']"),
  term("gpa", "gpa_term_ttd_weekly", "Temporary Total Disability / weekly benefit.", "ExtractedPolicy.addOns['ttd-weekly']"),
  term("gpa", "gpa_term_medical_extension", "Medical extension / worldwide.", "ExtractedPolicy.addOns['medical-extension']"),
];

const GMC: InputField[] = [
  bench(
    "gmc",
    "gmc_per_life_si_lowest_grade",
    "Lowest-grade per-life SI (headline C for GMC, §5d).",
    "What is the health-cover amount per employee (lowest grade)?",
    {
      preferredSource: "policy-schedule",
      whyRequired: "GMC headline SI = lowest grade's per-life SI (spec §5d).",
      assessmentImpact: "si-adequacy",
      engineMapping: "QuantitativeLineInput.C (gmc); R = per-life ≥ ₹5L norm",
      statusIfUnavailable: "unconfirmed",
      openIssue: "OPEN — lowest-grade vs headcount-weighted headline is ⚙️ (§5d); ₹5L norm not coded.",
    }
  ),
  {
    line: "gmc",
    category: "benchmark",
    field: "gmc_grade_spread",
    description: "Min→max per-life SI across grades (structural finding).",
    whyRequired: "Grade spread surfaced as a structural finding, not scored down (§5d).",
    dataType: "array",
    preferredSource: "policy-schedule",
    secondarySources: ["employee-census"],
    canAIExtract: "partial",
    extractionMethod: "table",
    evidenceRequired: true,
    evidenceExample: "Grade→SI table on the GMC schedule.",
    confidenceRequired: "low",
    corporateQuestionRequired: "no",
    corporateQuestion: null,
    whenToAsk: null,
    mandatory: "optional",
    assessmentImpact: "none",
    engineMapping: null,
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — grade-spread finding not coded.",
  },
  term("gmc", "gmc_term_family_definition", "Family definition adequate (self + family).", "ExtractedPolicy.addOns['family-definition']", {
    openIssue: "OPEN — family definition is a ⚙️ coverage item (§5d); weighting not coded.",
  }),
  term("gmc", "gmc_term_ped_day1", "PED covered from day 1.", "ExtractedPolicy.addOns['ped-day-1']"),
  term("gmc", "gmc_term_maternity", "Maternity cover (adequate limit).", "ExtractedPolicy.addOns['maternity']"),
  term("gmc", "gmc_term_room_rent_no_cap", "Room rent — no cap / adequate.", "ExtractedPolicy.addOns['room-rent-no-cap']"),
  term("gmc", "gmc_term_day_care", "Day-care procedures.", "ExtractedPolicy.addOns['day-care']"),
  term("gmc", "gmc_term_pre_post_hosp", "Pre / post hospitalisation.", "ExtractedPolicy.addOns['pre-post-hospitalisation']"),
  term("gmc", "gmc_adverse_room_rent_cap", "Adverse: room-rent cap (proportionate deduction).", "ExtractedPolicy.exclusions['room-rent-cap']"),
  term("gmc", "gmc_adverse_copay", "Adverse: copay > 0%.", "ExtractedPolicy.exclusions['copay']"),
  term("gmc", "gmc_adverse_disease_sublimits", "Adverse: disease-wise sub-limits.", "ExtractedPolicy.exclusions['disease-sublimits']"),
  term("gmc", "gmc_adverse_maternity_waiting", "Adverse: maternity waiting > 9 months.", "ExtractedPolicy.exclusions['maternity-waiting']"),
];

const GTL: InputField[] = [
  bench(
    "gtl",
    "gtl_per_life_si",
    "Per-life sum assured on the GTL policy (INR).",
    "What is the life-cover amount per employee?",
    {
      preferredSource: "policy-schedule",
      whyRequired: "C for GTL SI-adequacy vs ≥3× salary benchmark (Table B).",
      assessmentImpact: "si-adequacy",
      engineMapping: "QuantitativeLineInput.C (gtl); R ← avg_ctc/salary",
      statusIfUnavailable: "unconfirmed",
      openIssue: "OPEN — 3×salary floor ₹25L benchmark not coded; needs avg_ctc (else unavailable).",
    }
  ),
  {
    line: "gtl",
    category: "coverage-terms",
    field: "gtl_coverage_checklist",
    description: "Group Term Life coverage checklist.",
    whyRequired: "Coverage-terms adequacy.",
    dataType: "tri-state",
    preferredSource: "policy-wording",
    secondarySources: T1_POLICY,
    canAIExtract: "partial",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "GTL wording.",
    confidenceRequired: "low",
    corporateQuestionRequired: "no",
    corporateQuestion: null,
    whenToAsk: null,
    mandatory: "optional",
    assessmentImpact: "coverage-adequacy",
    engineMapping: "QuantitativeLineInput.checklist",
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — GTL checklist not defined (Table C).",
  },
];

const WC: InputField[] = [
  {
    line: "wc",
    category: "existing-policy",
    field: "wc_statutory_status",
    description: "Workmen's / Employees' Comp statutory compliance status.",
    whyRequired: "Compliance-mode pass/fail/unconfirmed (spec §5e); feeds Compliance strip.",
    dataType: "enum",
    preferredSource: "policy-schedule",
    secondarySources: ["insurance-policy", "contracts"],
    canAIExtract: "partial",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "WC policy schedule, or evidence of statutory coverage.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "Do you have Workmen's Compensation cover for your employees?",
    whenToAsk: "If no WC document found.",
    mandatory: "important",
    assessmentImpact: "completeness",
    engineMapping: "ComplianceLineInput.compliance",
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — whether WC folds into the 0–100 score is ⚙️ (COMPLIANCE_FOLDS_INTO_SCORE=false).",
  },
];

const MOTOR_TP: InputField[] = [
  {
    line: "motor-tp",
    category: "existing-policy",
    field: "motor_tp_statutory_status",
    description: "Motor Third-Party statutory compliance status.",
    whyRequired: "Compliance-mode pass/fail/unconfirmed (Table A2); Compliance strip.",
    dataType: "enum",
    preferredSource: "insurance-policy",
    secondarySources: ["vehicle-list", "policy-schedule"],
    canAIExtract: "partial",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "Motor TP policy on each vehicle.",
    confidenceRequired: "medium",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "Are all your vehicles insured for third-party liability?",
    whenToAsk: "When vehicles_operated = yes and TP status is unclear.",
    mandatory: "important",
    assessmentImpact: "completeness",
    engineMapping: "ComplianceLineInput.compliance",
    statusIfUnavailable: "unconfirmed",
    openIssue: null,
  },
];

const MOTOR_OD: InputField[] = [
  bench(
    "motor-od",
    "motor_od_total_idv",
    "Sum of IDV across vehicles (INR).",
    "What is the total insured value of your vehicle fleet?",
    {
      preferredSource: "vehicle-list",
      secondarySources: ["insurance-policy", "asset-register"],
      engineMapping: "QuantitativeLineInput.R (motor-od) ← Σ vehicle IDV",
      openIssue: "OPEN — Σ IDV sizing not coded.",
    }
  ),
  {
    line: "motor-od",
    category: "coverage-terms",
    field: "motor_od_coverage_checklist",
    description: "Motor Own-Damage coverage checklist.",
    whyRequired: "Coverage-terms adequacy.",
    dataType: "tri-state",
    preferredSource: "policy-wording",
    secondarySources: T1_POLICY,
    canAIExtract: "partial",
    extractionMethod: "text",
    evidenceRequired: true,
    evidenceExample: "Motor OD wording.",
    confidenceRequired: "low",
    corporateQuestionRequired: "no",
    corporateQuestion: null,
    whenToAsk: null,
    mandatory: "optional",
    assessmentImpact: "coverage-adequacy",
    engineMapping: "QuantitativeLineInput.checklist",
    statusIfUnavailable: "unconfirmed",
    openIssue: "OPEN — Motor-OD checklist not defined (Table C).",
  },
];

// ---------------------------------------------------------------------------
// Claims — a listed source, but NOT currently an engine input.
// ---------------------------------------------------------------------------

const CLAIMS: InputField[] = [
  {
    line: "business",
    category: "claims",
    field: "claims_history",
    description: "Claims MIS / loss history across lines.",
    whyRequired:
      "Would inform severity/exposure, but the current engine has NO claims input.",
    dataType: "array",
    preferredSource: "claims-mis",
    secondarySources: ["insurance-policy", "corporate"],
    canAIExtract: "partial",
    extractionMethod: "table",
    evidenceRequired: true,
    evidenceExample: "Claims MIS spreadsheet (date, line, paid, status).",
    confidenceRequired: "medium",
    corporateQuestionRequired: "conditional",
    corporateQuestion: "Can you share your claims history for the last few years?",
    whenToAsk: "When available; not blocking (engine does not yet consume it).",
    mandatory: "optional",
    assessmentImpact: "none",
    engineMapping: null,
    statusIfUnavailable: "n/a",
    openIssue: "OPEN — claims are not an engine input; consumption rule requires product/engine decision.",
  },
];

// ---------------------------------------------------------------------------
// Master list
// ---------------------------------------------------------------------------

export const INPUT_FIELDS: InputField[] = [
  ...BUSINESS,
  ...COMMON_POLICY,
  ...COMMON_ASSET,
  ...PROPERTY,
  ...STOCK,
  ...BI,
  ...MACHINERY,
  ...MARINE,
  ...LIABILITY,
  ...PRODUCT_LIABILITY,
  ...PI,
  ...DO,
  ...CYBER,
  ...GPA,
  ...GMC,
  ...GTL,
  ...WC,
  ...MOTOR_TP,
  ...MOTOR_OD,
  ...CLAIMS,
];

/** Every exposure line the engine knows (from calibration CATEGORY_OF_LINE). */
export const ENGINE_EXPOSURE_LINES: ExposureLineKey[] = [
  "property-fire",
  "stock",
  "bi",
  "machinery",
  "marine",
  "liability",
  "product-liability",
  "pi",
  "do",
  "cyber",
  "gpa",
  "gmc",
  "gtl",
  "wc",
  "motor-tp",
  "motor-od",
];

/**
 * Dynamic-questioning triggers (§10 of the matrix). Each maps a business-level
 * signal to the lines it makes relevant; questions for those lines fire only when
 * the signal is present AND the field is unresolved from documents.
 */
export const EXPOSURE_TRIGGERS: { signal: string; enablesLines: ExposureLineKey[] }[] = [
  { signal: "manufacturing_activity", enablesLines: ["product-liability", "machinery"] },
  { signal: "employee_count>0", enablesLines: ["gpa", "gmc", "gtl", "wc"] },
  { signal: "sensitive_data_exposure", enablesLines: ["cyber"] },
  { signal: "professional_services", enablesLines: ["pi"] },
  { signal: "vehicles_operated", enablesLines: ["motor-tp", "motor-od"] },
  { signal: "export_activity", enablesLines: ["product-liability"] },
];

/** TermState re-export for consumers that model tri-state coverage inputs. */
export type { TermState };
