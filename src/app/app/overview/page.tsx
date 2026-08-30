"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Shield, HeartHandshake } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { ScoreDial } from "@/components/score/ScoreDial";
import { demoCompany } from "@/lib/demo-data";
import { scoreTone, TONE_COLOR, type ScoreTone } from "@/lib/score";

/** Business-protection tiles shown on the pillar card, in a fixed display order. */
const PROTECTION_TILE_KEYS = ["property", "business-continuity", "liability", "cyber"] as const;

/** Short tile status label per tone band (careful, non-absolute language). */
const TILE_TONE_LABEL: Record<ScoreTone, string> = {
  good: "Good",
  attention: "Review",
  high: "Needs attention",
};

/**
 * Overview (Screen 12) — the home that ties the whole CoverSure Business
 * story together. Two pillars, side by side:
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
      {/* Header */}
      <h1 className="text-2xl font-semibold text-midnight sm:text-3xl">
        Good morning, {profile.name}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Here&apos;s where things stand today — your business protection, your
        people, and what may be worth prioritising next.
      </p>

      {/* ------------------------------------------------------------ */}
      {/* Two pillars                                                  */}
      {/* ------------------------------------------------------------ */}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {/* Pillar 1 — Business Protection */}
        <Card className="group relative flex flex-col gap-5 border-slate-200 p-6 shadow-sm transition-shadow hover:shadow-md">
          <Link
            href="/app/protection"
            className="absolute inset-0 z-10 rounded-xl"
            aria-label="Go to Business Protection"
          />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-midnight/5 text-midnight">
                <Shield aria-hidden className="size-4" />
              </span>
              <h2 className="font-semibold text-midnight">
                Business Protection
              </h2>
            </div>
            <ArrowUpRight
              aria-hidden
              className="size-4 text-slate-400 transition-colors group-hover:text-royal"
            />
          </div>

          <div className="flex items-center gap-5">
            <ScoreDial value={scores.overall} label="out of 100" size={104} />
            <p className="text-sm text-slate-600">
              {attentionCount > 0 ? (
                <>
                  <span className="font-semibold text-midnight">
                    {attentionCount}{" "}
                    {attentionCount === 1 ? "priority" : "priorities"}
                  </span>{" "}
                  may need attention based on the information reviewed.
                </>
              ) : (
                "Your business appears relatively well protected based on the information reviewed."
              )}
            </p>
          </div>

          <div className="relative z-20 grid grid-cols-2 gap-2.5">
            {protectionTiles.map((tile) => (
              <Link
                key={tile.key}
                href="/app/protection#risks"
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-left transition-colors hover:border-royal/40 hover:bg-royal/5"
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

          <p className="relative z-20 mt-auto text-sm font-medium">
            <span className="inline-flex items-center gap-1 text-royal">
              View business protection
              <ArrowRight className="size-3.5" />
            </span>
          </p>
        </Card>

        {/* Pillar 2 — People & Benefits */}
        <Card className="group relative flex flex-col gap-5 border-slate-200 p-6 shadow-sm transition-shadow hover:shadow-md">
          <Link
            href="/app/people"
            className="absolute inset-0 z-10 rounded-xl"
            aria-label="Go to People & Benefits"
          />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-midnight/5 text-midnight">
                <HeartHandshake aria-hidden className="size-4" />
              </span>
              <h2 className="font-semibold text-midnight">
                People &amp; Benefits
              </h2>
            </div>
            <ArrowUpRight
              aria-hidden
              className="size-4 text-slate-400 transition-colors group-hover:text-royal"
            />
          </div>

          <div className="flex items-center gap-5">
            <ScoreDial value={benefits.peopleScore} label="out of 100" size={104} />
            <p className="text-sm text-slate-600">
              Across{" "}
              <span className="font-semibold text-midnight">
                {benefits.employees} employees
              </span>
              , with opportunities to broaden benefits based on the
              information reviewed.
            </p>
          </div>

          <div className="relative z-20 grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-slate-200 px-3 py-2.5">
              <p className="text-xs text-slate-500">Employee Protection</p>
              <p className="text-lg font-semibold text-midnight">
                {benefits.peopleScore}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5">
              <p className="text-xs text-slate-500">Benefits</p>
              <p className="text-lg font-semibold text-midnight">
                {benefits.benefitsScore}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </p>
            </div>
          </div>

          <p className="relative z-20 mt-auto text-sm font-medium">
            <span className="inline-flex items-center gap-1 text-royal">
              View people &amp; benefits
              <ArrowRight className="size-3.5" />
            </span>
          </p>
        </Card>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Your priorities — where both pillars converge                */}
      {/* ------------------------------------------------------------ */}
      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-midnight sm:text-2xl">
              Your priorities
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
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

        <div className="mt-6 flex flex-col gap-3">
          {recommendations.map((reco) => (
            <Link
              key={reco.id}
              href={`/app/recommendations/${reco.id}`}
              className="block"
            >
              <Card className="flex items-center gap-4 border-slate-200 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
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
                  <p className="mt-0.5 truncate text-sm text-slate-600">
                    {reco.recommended}
                  </p>
                </div>
                <ArrowRight
                  aria-hidden
                  className="size-4 shrink-0 text-slate-400"
                />
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
