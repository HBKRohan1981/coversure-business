export type Provenance = "FACT" | "ASSESSMENT" | "RECOMMENDATION";
export type CoverageStatus = "covered" | "review" | "not-identified" | "potential-gap" | "unavailable";
export type Severity = "high" | "attention" | "review" | "good";
export type Priority = "high" | "medium" | "low";
export type RequestStage = "requirement-identified" | "request-submitted" | "options-prepared" | "quote-received" | "decision" | "activated";

export interface Fact { label: string; value: string; source?: string; }

export interface Determination {
  facts: string[];        // business attributes found
  evidence: string[];     // what documents did / did not show
  assessment: string;     // indicative inference (careful language)
  recommendationRef?: string; // recommendation id this points to
}

export interface BusinessProfile {
  name: string; industry: string; location: string;
  turnover: string; employees: number; fixedAssets: string; inventory: string; yearsOperating: number;
  facts: Fact[];          // labelled FACTs with source
  findings: string[];     // "What we found" bullets
}

export interface CoverageLine {
  key: string; label: string; status: CoverageStatus; coverIdentified: string; // e.g. "₹20 Cr" or "—"
}

export interface CategoryScore {
  key: string; label: string; score: number; // 0-100
  determination: Determination;
}

export interface Scores {
  overall: number;               // 0-100
  categories: CategoryScore[];
  whyBullets: string[];
}

export interface Risk {
  key: string; title: string; severity: Severity;
  why: string; evidence: string[]; whatYouCanDo: string;
  determination: Determination;
}

export interface BenefitItem { label: string; provided: boolean; category: "Protection" | "Health" | "Wellbeing" | "Family"; }
export interface Benefits { peopleScore: number; benefitsScore: number; employees: number; items: BenefitItem[]; }

export interface Recommendation {
  id: string; index: string;   // "01"
  title: string; priority: Priority;
  why: string; recommended: string;
  found: { label: string; present: boolean }[];
  couldBeConsidered: string;
  coversureCanHelp: string;
  determination: Determination;
}

export interface QuoteRequest {
  id: string; recommendationId: string; solution: string;
  stage: RequestStage; submittedAt: string; // ISO string, static
  contactName: string; phone: string; email: string;
  preferredContact: string; // "Phone" | "Email" | "WhatsApp" (kept as string for simplicity)
  note?: string;
}

export interface DemoCompany {
  profile: BusinessProfile;
  coverage: CoverageLine[];
  scores: Scores;
  risks: Risk[];
  benefits: Benefits;
  recommendations: Recommendation[];
  seededRequests: QuoteRequest[];
}
