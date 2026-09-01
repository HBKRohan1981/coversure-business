"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreBand } from "@/components/score/ScoreBand";
import { demoCompany } from "@/lib/demo-data";
import { useSession } from "@/lib/store";
import { formatEmployees } from "@/lib/format";
import { deriveInsights, portfolioCounts, renewalBuckets } from "@/lib/portfolio";
import type { Asset } from "@/lib/types";

/**
 * Common legal-entity suffixes trimmed for a cleaner headline. Display-only —
 * the underlying name is still read straight from demoCompany.profile.name.
 */
function displayName(legalName: string): string {
  return legalName.replace(/\s+(pvt\.?\s*ltd\.?|private limited|ltd\.?|limited)\.?\s*$/i, "").trim();
}

/**
 * Overview — executive summary (Task I7). Per
 * .superpowers/sdd/portfolio-phase-i.md the Protection Portfolio is the HERO
 * product; Overview's job is to lead the reader into it. Layout, in order of
 * visual weight:
 *   1. Protection Portfolio — strongest prominence, derived top-line facts.
 *   2. What needs attention — a preview of the insights intelligence layer.
 *   3. Business Protection score + People & Benefits score — present as
 *      secondary intelligence pillars, clearly subordinate to the portfolio.
 * Every number below is read from demoCompany (+ session addedAssets) via
 * the same src/lib/portfolio.ts selectors /app/portfolio and /app/insights
 * use — nothing here is a second, independently-invented portfolio score.
 */
export default function OverviewPage() {
  const addedAssets = useSession((s) => s.addedAssets);
  const { profile, policies, benefits, scores, asOfDate } = demoCompany;

  const assets: Asset[] = [...demoCompany.assets, ...addedAssets];
  const counts = portfolioCounts(assets);
  const buckets = renewalBuckets(policies, asOfDate);
  const upcomingRenewals = buckets.d30.length + buckets.d60.length + buckets.d90.length;
  const insights = deriveInsights(demoCompany, assets);

  const portfolioFacts = [
    { label: "Policies", value: policies.length },
    { label: "Assets", value: assets.length },
    { label: "People", value: formatEmployees(benefits.employees) },
    { label: "Upcoming renewals", value: upcomingRenewals },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="cs-container px-0">
        {/* Header */}
        <p className="kicker">Overview</p>
        <h1 className="mt-1 text-2xl font-semibold text-midnight sm:text-3xl">
          Your Business Protection
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-ink">
          Good morning, {displayName(profile.name)}. Here&apos;s a summary of your
          protection portfolio, what may need attention, and the intelligence
          behind it.
        </p>

        {/* ---------------------------------------------------------- */}
        {/* Protection Portfolio — the HERO, strongest visual prominence */}
        {/* ---------------------------------------------------------- */}
        <section className="mt-8">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-midnight to-royal p-8 text-white shadow-soft-lg sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mint">
                  Protection Portfolio
                </p>
                <h2 className="mt-1.5 text-xl font-semibold text-white sm:text-2xl">
                  Everything protecting {displayName(profile.name)}
                </h2>
                <p className="mt-2 max-w-xl text-sm text-white/80">
                  Policies, assets, people and renewals — in one place. This is
                  your system of record for what&apos;s protected today.
                </p>
              </div>
              <Button asChild size="lg" className="gap-2 bg-mint text-midnight hover:bg-mint/90">
                <Link href="/app/portfolio">
                  View Portfolio
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {portfolioFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3.5"
                >
                  <p className="text-2xl font-semibold text-white sm:text-3xl">
                    {fact.value}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70">
                    {fact.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* What needs attention — preview of the insights layer         */}
        {/* ---------------------------------------------------------- */}
        <section className="mt-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white px-6 py-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="kicker">Insights</p>
              <h3 className="mt-1 text-base font-semibold text-midnight">
                What needs attention
              </h3>
              <p className="mt-1 text-sm text-muted-ink">
                {insights.length > 0
                  ? `${insights.length} ${
                      insights.length === 1 ? "observation" : "observations"
                    } from your portfolio, including ${counts.attention} item${
                      counts.attention === 1 ? "" : "s"
                    } that may warrant a closer look.`
                  : "Nothing needs your attention right now, based on the information reviewed."}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="shrink-0 gap-2 border-royal text-royal hover:bg-royal/5 hover:text-royal"
            >
              <Link href="/app/insights">
                Review insights
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Secondary intelligence — the two score pillars                */}
        {/* ---------------------------------------------------------- */}
        <section className="mt-10">
          <p className="kicker">Intelligence layer</p>
          <h2 className="mt-1 text-lg font-semibold text-midnight">
            How protected you are
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-ink">
            Risk assessment and people scores, derived from your portfolio and
            business profile — a layer of intelligence on top of what you
            already have.
          </p>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            {/* Business Protection score */}
            <div>
              <ScoreBand
                value={scores.overall}
                label="Protection Score"
                title="Business Protection"
                caption="Based on the information in your portfolio and business profile."
              />
              <Link
                href="/app/protection"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-royal transition-colors hover:text-electric"
              >
                View Risk Assessment
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* People & Benefits score */}
            <div>
              <ScoreBand
                value={benefits.peopleScore}
                label="People Score"
                title="People & Benefits"
                caption={`Benefits score ${benefits.benefitsScore} out of 100 across ${benefits.employees} employees, with opportunities to broaden support based on the information reviewed.`}
              />
              <Link
                href="/app/people"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-royal transition-colors hover:text-electric"
              >
                View People &amp; Benefits
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
