"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DeterminationTrail } from "@/components/common/DeterminationTrail";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
import { Meter, type MeterLevel } from "@/components/score/Meter";
import { demoCompany } from "@/lib/demo-data";
import { useSession } from "@/lib/store";
import { deriveInsights, type Insight } from "@/lib/portfolio";
import { SEVERITY_LABELS } from "@/lib/language";
import type { Asset, Recommendation, Severity } from "@/lib/types";

/**
 * Severity -> Meter level, same mapping RiskCard (src/components/risk/RiskCard.tsx)
 * and the admin SME view use. Visual mapping only — does not touch severity
 * or insight-derivation logic.
 */
const SEVERITY_LEVEL: Record<Severity, MeterLevel> = {
  good: 1,
  review: 2,
  attention: 3,
  high: 4,
};

interface InsightGroupDef {
  id: string;
  label: string;
  heading: string;
  intro: string;
  insights: Insight[];
}

/**
 * Insights (Screen — the "what needs attention?" intelligence layer). Reads
 * deriveInsights(demoCompany, assets) — the same selector Task I1 built over
 * demoCompany + session-added assets — and never invents its own facts,
 * counts or copy. Every insight here can be traced back to a risk, an asset,
 * a policy or a renewal date already visible on the Portfolio; where an
 * insight carries a recommendationRef, the matching recommendation's
 * determination (FACT -> EVIDENCE -> ASSESSMENT -> RECOMMENDATION) is
 * surfaced inline via DeterminationTrail, so the bridge from observation to
 * service action is explicit rather than an unexplained AI claim.
 */
export default function InsightsPage() {
  const addedAssets = useSession((s) => s.addedAssets);
  const assets: Asset[] = [...demoCompany.assets, ...addedAssets];
  const insights = deriveInsights(demoCompany, assets);

  const recoById = new Map<string, Recommendation>(
    demoCompany.recommendations.map((r) => [r.id, r])
  );

  // Bucket every insight into exactly one restrained section, in priority
  // order — a gap or a high-severity item always reads as "needs attention"
  // first, even if its `kind` happens to also read as a review/renewal.
  const placed = new Set<string>();
  function take(predicate: (insight: Insight) => boolean): Insight[] {
    const matched = insights.filter((i) => !placed.has(i.id) && predicate(i));
    matched.forEach((i) => placed.add(i.id));
    return matched;
  }

  const groups: InsightGroupDef[] = [
    {
      id: "attention",
      label: "Needs attention",
      heading: "Needs attention",
      intro: "Gaps and higher-severity observations worth looking at first.",
      insights: take((i) => i.kind === "gap" || i.severity === "high"),
    },
    {
      id: "review",
      label: "Review",
      heading: "Coverage under review",
      intro: "Areas that may warrant a closer look at adequacy.",
      insights: take((i) => i.kind === "review"),
    },
    {
      id: "upcoming",
      label: "Upcoming",
      heading: "Upcoming renewals",
      intro: "Renewals coming up across your policies.",
      insights: take((i) => i.kind === "renewal"),
    },
    {
      id: "portfolio",
      label: "Portfolio",
      heading: "Portfolio",
      intro: "Other observations from your protection portfolio.",
      insights: take(() => true),
    },
  ];

  const visibleGroups = groups.filter((g) => g.insights.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="cs-container px-0">
        <section id="header" className="scroll-mt-24">
          <p className="kicker">Insights</p>
          <h1 className="h-section mt-1 text-midnight">What needs attention?</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-ink">
            Intelligent observations from your protection portfolio.
          </p>
        </section>

        {visibleGroups.length === 0 ? (
          <div className="mt-10 rounded-xl border border-line bg-white px-5 py-8 text-center shadow-soft">
            <p className="text-sm text-muted-ink">
              Nothing needs your attention right now.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            {visibleGroups.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-24">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-ink">
                  {group.label}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-midnight">{group.heading}</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-ink">{group.intro}</p>

                <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white shadow-soft">
                  {group.insights.map((insight) => (
                    <InsightRow
                      key={insight.id}
                      insight={insight}
                      recommendation={
                        insight.recommendationRef
                          ? recoById.get(insight.recommendationRef)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <AssessmentDisclaimer className="mt-10" />
      </div>
    </motion.div>
  );
}

/**
 * One insight row — a calm hairline row, not a card-shaped AI callout. A
 * small severity meter is the only "signal" chrome; title/detail come
 * straight from the Insight (deriveInsights' careful, non-absolute
 * language). When the insight is backed by a recommendation, the trail
 * behind it (facts -> evidence -> assessment -> recommendation) is one click
 * away via DeterminationTrail, so the observation is always traceable
 * before the service CTA is offered.
 */
function InsightRow({
  insight,
  recommendation,
}: {
  insight: Insight;
  recommendation?: Recommendation;
}) {
  const level = SEVERITY_LEVEL[insight.severity];

  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-4">
        <span className="flex w-[92px] shrink-0 flex-col items-start gap-1.5 pt-0.5">
          <Meter level={level} />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-ink">
            {SEVERITY_LABELS[insight.severity]}
          </span>
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-midnight">{insight.title}</p>
          <p className="mt-1 text-sm text-ink/80">{insight.detail}</p>
          {recommendation && (
            <div className="mt-2">
              <DeterminationTrail
                determination={recommendation.determination}
                recommendationTitle={recommendation.title}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:justify-end">
        {insight.actionLabel && insight.href && (
          <Button asChild size="sm" variant="outline">
            <Link href={insight.href}>{insight.actionLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
