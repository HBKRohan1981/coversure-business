import type { CoverageStatus, Severity } from "./types";

export const STATUS_LABELS: Record<CoverageStatus, string> = {
  "covered": "Covered",
  "review": "Review recommended",
  "not-identified": "Not identified",
  "potential-gap": "Potential gap",
  "unavailable": "Information unavailable",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  high: "High attention",
  attention: "Attention",
  review: "Review",
  good: "Relatively well protected",
};

export const DISCLAIMER =
  "This assessment is indicative and based on the information provided. Final coverage requirements are subject to underwriting, policy terms and conditions.";

export const ASSESSMENT_NOTE = "Based on the information provided and documents reviewed.";
