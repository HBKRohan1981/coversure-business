"use client";

import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScoreBand } from "@/components/score/ScoreBand";
import { CategoryScoreBar } from "@/components/score/CategoryScoreBar";
import { CoverageTable } from "@/components/coverage/CoverageTable";
import { RiskCard } from "@/components/risk/RiskCard";
import { DeterminationTrail } from "@/components/common/DeterminationTrail";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
import { demoCompany } from "@/lib/demo-data";
import { scoreTone, type ScoreTone } from "@/lib/score";

/** Sticky in-page section nav — three anchors, in the same order as the page. */
const SECTION_NAV = [
  { href: "#score", label: "Score" },
  { href: "#coverage", label: "Coverage" },
  { href: "#risks", label: "Risks" },
] as const;

/** Careful, non-absolute supporting copy for the overall score, by tone band. */
const OVERALL_SCORE_MESSAGE: Record<ScoreTone, string> = {
  good: "Your business appears relatively well protected based on the information reviewed.",
  attention:
    "Your business has solid protection in some areas, with a few that may warrant attention.",
  high: "Several areas may warrant your attention based on the information reviewed.",
};

/** Look up a recommendation's title for a determination's recommendationRef. */
function recommendationTitleFor(recommendationRef?: string): string | undefined {
  if (!recommendationRef) return undefined;
  return demoCompany.recommendations.find((r) => r.id === recommendationRef)?.title;
}

export default function ProtectionPage() {
  const { profile, scores, coverage, risks } = demoCompany;
  const overallTone = scoreTone(scores.overall);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Sticky sub-nav — understated pills, hash deep-links unchanged */}
      <nav
        className="sticky top-0 z-10 -mx-6 mb-10 flex gap-2 border-b border-line bg-white/95 px-6 py-3 backdrop-blur md:-mx-10 md:px-10"
        aria-label="Protection page sections"
      >
        {SECTION_NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full border border-line px-4 py-1.5 text-[13px] font-medium text-muted-ink transition-colors hover:border-electric hover:bg-electric/5 hover:text-midnight"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="cs-container px-0">
        {/* -------------------------------------------------------------- */}
        {/* #score — Your Business Protection Score                        */}
        {/* -------------------------------------------------------------- */}
        <section id="score" className="scroll-mt-24">
          {/* The visual heading now lives inside the score band; keep an
              accessible h1 for document structure without duplicating it
              on screen. */}
          <h1 className="sr-only">Your Business Protection Score</h1>

          <p className="kicker">Business protection · {profile.name}</p>

          <div className="mt-4">
            <ScoreBand
              value={scores.overall}
              label="Protection Score"
              title="Your Business Protection Score"
              caption={OVERALL_SCORE_MESSAGE[overallTone]}
            />
          </div>

          {/* Category breakdown + "why" — one hairline-grouped panel,
              not six floating cards. */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
            <div className="border-b border-line px-6 py-5 sm:px-8">
              <p className="kicker">Category breakdown</p>
              <h2 className="mt-1 text-lg font-semibold text-midnight">
                How each area scores
              </h2>
            </div>

            <div className="divide-y divide-line px-6 sm:px-8">
              {scores.categories.map((category) => (
                <div key={category.key} className="space-y-2 py-5">
                  <CategoryScoreBar label={category.label} score={category.score} />
                  <DeterminationTrail
                    determination={category.determination}
                    recommendationTitle={recommendationTitleFor(
                      category.determination.recommendationRef
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-line bg-app-bg/60 px-6 py-5 sm:px-8">
              <h3 className="text-sm font-semibold text-midnight">
                Why your score looks this way
              </h3>
              <ul className="mt-3 space-y-2">
                {scores.whyBullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2.5 text-sm text-ink/80"
                  >
                    <span
                      aria-hidden
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-electric"
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              asChild
              variant="outline"
              className="gap-2 border-royal text-royal hover:bg-royal/5 hover:text-royal"
            >
              <a href="#risks">
                See what needs attention
                <ArrowDown className="size-4" />
              </a>
            </Button>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* #coverage — What you already have                                */}
        {/* -------------------------------------------------------------- */}
        <section id="coverage" className="mt-20 scroll-mt-24">
          <p className="kicker">Coverage</p>
          <h2 className="h-section mt-1 text-midnight">What you already have</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-ink">
            A summary of the protection identified in the documents you shared.
          </p>

          <div className="mt-6">
            <CoverageTable lines={coverage} />
          </div>

          <div className="mt-4">
            <AssessmentDisclaimer />
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* #risks — What could put your business at risk?                   */}
        {/* -------------------------------------------------------------- */}
        <section id="risks" className="mt-20 scroll-mt-24">
          <p className="kicker">Risks</p>
          <h2 className="h-section mt-1 text-midnight">
            What could put your business at risk?
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-ink">
            Potential areas for attention, based on the information provided. Expand
            each to see why we flagged it.
          </p>

          <div className="mt-6 space-y-3">
            {risks.map((risk) => (
              <RiskCard key={risk.key} risk={risk} />
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
