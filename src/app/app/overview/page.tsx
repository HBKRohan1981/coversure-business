"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { ScoreBand } from "@/components/score/ScoreBand";
import { demoCompany } from "@/lib/demo-data";
import { scoreTone, TONE_COLOR, type ScoreTone } from "@/lib/score";

/** Business-protection tiles shown under the pillar band, in a fixed display order. */
const PROTECTION_TILE_KEYS = ["property", "business-continuity", "liability", "cyber"] as const;

/** Short tile status label per tone band (careful, non-absolute language). */
const TILE_TONE_LABEL: Record<ScoreTone, string> = {
  good: "Good",
  attention: "Review",
  high: "Needs attention",
};

/**
 * Common legal-entity suffixes trimmed for a cleaner headline. Display-only —
 * the underlying name is still read straight from demoCompany.profile.name.
 */
function displayName(legalName: string): string {
  return legalName.replace(/\s+(pvt\.?\s*ltd\.?|private limited|ltd\.?|limited)\.?\s*$/i, "").trim();
}

/**
 * Overview (Screen 12) — the home that ties the whole CoverSure Business
 * story together. Two pillars, presented as authoritative score bands:
 *   Business Protection (what could put my business at risk?)
 *   People & Benefits (how can I better protect and look after my people?)
 * ...converging into one prioritised list -> CoverSure can help.
 * Every number below is read from demoCompany; nothing is hardcoded here.
 */
export default function OverviewPage() {
  const { profile, scores, benefits, recommendations } = demoCompany;

  const protectionTiles = PROTECTION_TILE_KEYS.map((key) => {
    const category = scores.categories.find((c) => c.key === key);
    return category ? { ...category, tone: scoreTone(category.score) } : null;
  }).filter((t): t is NonNullable<typeof t> => t !== null);

  const attentionCount = protectionTiles.filter((t) => t.tone !== "good").length;

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
          Good morning, {displayName(profile.name)}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-ink">
          Here&apos;s where things stand today — your business protection, your
          people, and what may be worth prioritising next.
        </p>

        {/* ---------------------------------------------------------- */}
        {/* Two pillars, as authoritative score bands                   */}
        {/* ---------------------------------------------------------- */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Pillar 1 — Business Protection */}
          <div>
            <ScoreBand
              value={scores.overall}
              label="Protection Score"
              title="Business Protection"
              caption={
                attentionCount > 0
                  ? `${attentionCount} ${
                      attentionCount === 1 ? "priority" : "priorities"
                    } may need attention based on the information reviewed.`
                  : "Your business appears relatively well protected based on the information reviewed."
              }
            />

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {protectionTiles.map((tile) => (
                <Link
                  key={tile.key}
                  href="/app/protection#risks"
                  className="flex items-center justify-between gap-2 rounded-lg border border-line bg-white px-3 py-2.5 text-left transition-colors hover:border-royal/40 hover:bg-royal/5"
                >
                  <span className="text-sm font-medium text-midnight">
                    {tile.label}
                  </span>
                  <span
                    className="flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: TONE_COLOR[tile.tone] }}
                  >
                    <span
                      aria-hidden
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: TONE_COLOR[tile.tone] }}
                    />
                    {TILE_TONE_LABEL[tile.tone]}
                  </span>
                </Link>
              ))}
            </div>

            <Link
              href="/app/protection"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-royal transition-colors hover:text-electric"
            >
              View Business Protection
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Pillar 2 — People & Benefits */}
          <div>
            <ScoreBand
              value={benefits.peopleScore}
              label="People Score"
              title="People & Benefits"
              caption={`Benefits score ${benefits.benefitsScore} out of 100 across ${benefits.employees} employees, with opportunities to broaden support based on the information reviewed.`}
            />

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-line bg-white px-3 py-2.5">
                <p className="text-xs text-muted-ink">Employee Protection</p>
                <p className="text-lg font-semibold text-midnight">
                  {benefits.peopleScore}
                  <span className="text-xs font-normal text-muted-ink">/100</span>
                </p>
              </div>
              <div className="rounded-lg border border-line bg-white px-3 py-2.5">
                <p className="text-xs text-muted-ink">Benefits</p>
                <p className="text-lg font-semibold text-midnight">
                  {benefits.benefitsScore}
                  <span className="text-xs font-normal text-muted-ink">/100</span>
                </p>
              </div>
            </div>

            <Link
              href="/app/people"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-royal transition-colors hover:text-electric"
            >
              View People &amp; Benefits
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Your priorities — where both pillars converge                */}
        {/* ---------------------------------------------------------- */}
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="kicker">Priorities</p>
              <h2 className="mt-1 text-xl font-semibold text-midnight sm:text-2xl">
                Your priorities
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-ink">
                Business protection and people &amp; benefits together, prioritised
                so you know what may be worth looking at first.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="gap-2 border-royal text-royal hover:bg-royal/5 hover:text-royal"
            >
              <Link href="/app/recommendations">
                Review priorities
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
            {recommendations.map((reco) => (
              <Link
                key={reco.id}
                href={`/app/recommendations/${reco.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-app-bg/60 sm:px-6"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-midnight text-sm font-semibold text-white">
                  {reco.index}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="truncate font-semibold text-midnight">
                      {reco.title}
                    </h3>
                    <PriorityBadge priority={reco.priority} className="shrink-0" />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-ink">
                    {reco.recommended}
                  </p>
                </div>
                <ArrowRight
                  aria-hidden
                  className="size-4 shrink-0 text-muted-ink"
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
