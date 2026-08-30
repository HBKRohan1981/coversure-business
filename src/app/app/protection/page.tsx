"use client";

import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreDial } from "@/components/score/ScoreDial";
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
      {/* Sticky sub-nav */}
      <nav
        className="sticky top-0 z-10 -mx-6 mb-10 flex gap-1 border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur md:-mx-10 md:px-10"
        aria-label="Protection page sections"
      >
        {SECTION_NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-midnight"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* ---------------------------------------------------------------- */}
      {/* #score — Your Business Protection Score                          */}
      {/* ---------------------------------------------------------------- */}
      <section id="score" className="scroll-mt-24">
        <h1 className="text-2xl font-semibold text-midnight sm:text-3xl">
          Your Business Protection Score
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Based on the information provided and documents reviewed, here&apos;s an
          indicative view of how {profile.name} is protected today.
        </p>

        <div className="mt-8 grid gap-10 md:grid-cols-[auto_1fr] md:items-start">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <ScoreDial value={scores.overall} label="out of 100" size={180} />
            <p className="max-w-[220px] text-center text-sm text-slate-600 md:text-left">
              {OVERALL_SCORE_MESSAGE[overallTone]}
            </p>
          </div>

          <div className="space-y-5">
            {scores.categories.map((category) => (
              <div key={category.key} className="space-y-1.5">
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
        </div>

        <Card className="mt-8 border-slate-200">
          <CardContent className="space-y-3 py-5">
            <h2 className="text-sm font-semibold text-midnight">
              Why your score looks this way
            </h2>
            <ul className="space-y-2">
              {scores.whyBullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-electric"
                  />
                  {bullet}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

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

      {/* ---------------------------------------------------------------- */}
      {/* #coverage — What you already have                                */}
      {/* ---------------------------------------------------------------- */}
      <section id="coverage" className="mt-16 scroll-mt-24">
        <h2 className="text-2xl font-semibold text-midnight sm:text-3xl">
          What you already have
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          A summary of the protection identified in the documents you shared.
        </p>

        <Card className="mt-6 border-slate-200">
          <CardContent className="p-0">
            <CoverageTable lines={coverage} />
          </CardContent>
        </Card>

        <div className="mt-4">
          <AssessmentDisclaimer />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* #risks — What could put your business at risk?                   */}
      {/* ---------------------------------------------------------------- */}
      <section id="risks" className="mt-16 scroll-mt-24">
        <h2 className="text-2xl font-semibold text-midnight sm:text-3xl">
          What could put your business at risk?
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Potential areas for attention, based on the information provided. Expand
          each to see why we flagged it.
        </p>

        <div className="mt-6 space-y-3">
          {risks.map((risk) => (
            <RiskCard key={risk.key} risk={risk} />
          ))}
        </div>
      </section>
    </motion.div>
  );
}
