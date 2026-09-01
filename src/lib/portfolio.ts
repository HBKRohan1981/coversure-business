import type { Asset, DemoCompany, Policy, Severity } from "./types";

/** Pure derivation over demoCompany (+ session-added assets). No hardcoded facts, no Date.now(). */

export type PortfolioAsset = Asset;

export interface PortfolioCounts {
  covered: number;
  review: number;
  potentialGap: number;
  notIdentified: number;
  unavailable: number;
  attention: number;
}

export function portfolioCounts(assets: Asset[]): PortfolioCounts {
  const counts: PortfolioCounts = {
    covered: 0,
    review: 0,
    potentialGap: 0,
    notIdentified: 0,
    unavailable: 0,
    attention: 0,
  };
  for (const asset of assets) {
    switch (asset.insuranceStatus) {
      case "covered":
        counts.covered += 1;
        break;
      case "review":
        counts.review += 1;
        break;
      case "potential-gap":
        counts.potentialGap += 1;
        break;
      case "not-identified":
        counts.notIdentified += 1;
        break;
      case "unavailable":
        counts.unavailable += 1;
        break;
    }
  }
  counts.attention = counts.review + counts.potentialGap + counts.notIdentified + counts.unavailable;
  return counts;
}

export function daysUntil(dateIso: string, asOfIso: string): number {
  return Math.round((new Date(dateIso).getTime() - new Date(asOfIso).getTime()) / 86400000);
}

export interface RenewalBuckets {
  d30: Policy[];
  d60: Policy[];
  d90: Policy[];
  later: Policy[];
}

export function renewalBuckets(policies: Policy[], asOfIso: string): RenewalBuckets {
  const buckets: RenewalBuckets = { d30: [], d60: [], d90: [], later: [] };
  for (const policy of policies) {
    const days = daysUntil(policy.renewalDate, asOfIso);
    if (days >= 0 && days <= 30) buckets.d30.push(policy);
    else if (days > 30 && days <= 60) buckets.d60.push(policy);
    else if (days > 60 && days <= 90) buckets.d90.push(policy);
    else buckets.later.push(policy);
  }
  return buckets;
}

export interface Insight {
  id: string;
  kind: "gap" | "review" | "renewal" | "change";
  title: string;
  detail: string;
  severity: Severity;
  recommendationRef?: string;
  href?: string;
  actionLabel?: string;
}

export function deriveInsights(company: DemoCompany, assets: Asset[]): Insight[] {
  const insights: Insight[] = [];

  // Recommendation-backed insights: risks with a determination.recommendationRef.
  const recIds = new Set(company.recommendations.map((r) => r.id));
  for (const risk of company.risks) {
    const ref = risk.determination.recommendationRef;
    if (!ref || !recIds.has(ref)) continue;
    const isGap = risk.severity === "high";
    insights.push({
      id: `risk-${risk.key}`,
      kind: isGap ? "gap" : "review",
      title: risk.title,
      detail: risk.why,
      severity: risk.severity,
      recommendationRef: ref,
      href: `/app/recommendations/${ref}`,
      actionLabel: isGap ? "Secure with CoverSure" : "Review with CoverSure",
    });
  }

  // Asset gaps: assets without identified coverage.
  const gapAssets = assets.filter(
    (a) => a.insuranceStatus === "not-identified" || a.insuranceStatus === "potential-gap"
  );
  if (gapAssets.length > 0) {
    insights.push({
      id: "asset-gaps",
      kind: "gap",
      title: "Assets without identified coverage",
      detail: `${gapAssets.length} asset(s) do not have identifiable insurance coverage.`,
      severity: "attention",
      href: "/app/portfolio",
      actionLabel: "Review assets",
    });
  }

  // Policy review: policies flagged for adequacy review.
  const reviewPolicies = company.policies.filter((p) => p.status === "review");
  if (reviewPolicies.length > 0) {
    insights.push({
      id: "policy-review",
      kind: "review",
      title: "Coverage may warrant review",
      detail: `${reviewPolicies.length} policy/policies may warrant a coverage adequacy review.`,
      severity: "review",
      href: "/app/portfolio",
      actionLabel: "Review coverage",
    });
  }

  // Nearest renewal: policy with the smallest positive daysUntil.
  let nearest: { policy: Policy; days: number } | null = null;
  for (const policy of company.policies) {
    const days = daysUntil(policy.renewalDate, company.asOfDate);
    if (days < 0) continue;
    if (!nearest || days < nearest.days) nearest = { policy, days };
  }
  if (nearest) {
    insights.push({
      id: `renewal-${nearest.policy.key}`,
      kind: "renewal",
      title: "Upcoming renewal",
      detail: `${nearest.policy.type} renews in ${nearest.days} days.`,
      severity: nearest.days <= 30 ? "attention" : "good",
      href: "/app/portfolio",
      actionLabel: "Review renewal",
    });
  }

  return insights;
}
