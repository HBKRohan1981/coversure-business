"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill } from "@/components/coverage/StatusPill";
import { demoCompany } from "@/lib/demo-data";
import { useSession } from "@/lib/store";
import { formatEmployees } from "@/lib/format";
import { portfolioCounts, renewalBuckets } from "@/lib/portfolio";
import type { Asset } from "@/lib/types";

/**
 * Common legal-entity suffixes trimmed for a cleaner headline/intro line.
 * Display-only — the underlying name is still read straight from
 * demoCompany.profile.name wherever the full legal name is shown.
 */
function displayName(legalName: string): string {
  return legalName
    .replace(/\s+(pvt\.?\s*ltd\.?|private limited|ltd\.?|limited)\.?\s*$/i, "")
    .trim();
}

/**
 * Readable renewal date. `renewalDate` is always a fixed, stored ISO string
 * (never Date.now() / an argless `new Date()`), so parsing that fixed value
 * here for display stays deterministic across renders and sessions.
 */
function formatRenewalDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Portfolio-status rollup — a calm, restrained tone system distinct from the
 * per-item StatusPill palette (which uses the same danger tone for both
 * "potential gap" and "not identified"). At the portfolio level those two
 * are kept visually distinct: potential gap reads as soft-red, "not
 * identified" as a neutral slate — nothing here implies inadequacy, only
 * that information is or isn't identified.
 */
const STATUS_TONE_STYLE = {
  mint: "border-mint/50 bg-mint/20 text-midnight",
  amber: "border-amber/30 bg-amber/10 text-amber",
  danger: "border-danger/25 bg-danger/10 text-danger",
  slate: "border-line bg-line/50 text-muted-ink",
} as const;

const STATUS_DOT_STYLE = {
  mint: "bg-mint",
  amber: "bg-amber",
  danger: "bg-danger",
  slate: "bg-muted-ink",
} as const;

type StatusTone = keyof typeof STATUS_TONE_STYLE;

/**
 * Portfolio (Screen — hero product & control centre). This is the system of
 * record: everything protecting the business, in one place. Risk assessment
 * / gaps / recommendations (the /app/protection page) are an intelligence
 * layer ON TOP of this data — this page never restates a score, it shows
 * what's held and what's coming up.
 *
 * Every number on this page is derived from demoCompany + session
 * addedAssets via src/lib/portfolio.ts selectors — nothing is hardcoded.
 *
 * Sections below (Header, Top facts, Portfolio status, Policies) are the
 * scope of this task. #assets and #renewals are placeholder anchors for
 * later tasks (I3/I4/I6) to slot Assets / Add-asset / Renewals content
 * into; Share and Insights (I5) will add further sections after those.
 */
export default function PortfolioPage() {
  const addedAssets = useSession((s) => s.addedAssets);
  const { profile, policies, benefits, asOfDate } = demoCompany;

  // Canonical asset list: seeded demo assets + anything added this session.
  const assets: Asset[] = [...demoCompany.assets, ...addedAssets];

  const counts = portfolioCounts(assets);
  const buckets = renewalBuckets(policies, asOfDate);
  const upcomingRenewals = buckets.d30.length + buckets.d60.length + buckets.d90.length;

  // "Not identified" and "unavailable" (session-added assets marked "not
  // sure") both mean no coverage could be identified — folded into one
  // slate segment so counts.covered + counts.review + counts.potentialGap +
  // notIdentifiedCount always accounts for every asset.
  const notIdentifiedCount = counts.notIdentified + counts.unavailable;

  const assetNameByKey = new Map(assets.map((a) => [a.key, a.name]));

  const topFacts = [
    { label: "Policies", value: policies.length },
    { label: "Assets", value: assets.length },
    { label: "People", value: formatEmployees(benefits.employees) },
    { label: "Upcoming renewals", value: upcomingRenewals },
    { label: "Items requiring attention", value: counts.attention },
  ];

  const statusSegments: { key: string; label: string; count: number; tone: StatusTone }[] = [
    { key: "covered", label: "Adequately identified", count: counts.covered, tone: "mint" },
    { key: "review", label: "Review recommended", count: counts.review, tone: "amber" },
    { key: "potential-gap", label: "Potential gap", count: counts.potentialGap, tone: "danger" },
    { key: "not-identified", label: "Not identified", count: notIdentifiedCount, tone: "slate" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="cs-container px-0">
        {/* -------------------------------------------------------------- */}
        {/* Header — restrained control-centre framing, not a dark ScoreBand */}
        {/* -------------------------------------------------------------- */}
        <section id="header" className="scroll-mt-24">
          <p className="kicker">Protection Portfolio</p>
          <h1 className="h-section mt-1 text-midnight">Your Protection Portfolio</h1>
          <p className="mt-2 text-base font-medium text-midnight">{profile.name}</p>
          <p className="mt-2 max-w-2xl text-sm text-muted-ink">
            Everything protecting {displayName(profile.name)} — policies, assets, people and
            renewals — in one place.
          </p>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Top facts — a stat row, not chunky cards                        */}
        {/* -------------------------------------------------------------- */}
        <section className="mt-8">
          <div className="flex flex-wrap divide-x divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
            {topFacts.map((fact) => (
              <div key={fact.label} className="flex-1 min-w-[140px] px-6 py-5">
                <p className="text-2xl font-semibold text-midnight sm:text-3xl">{fact.value}</p>
                <p className="kicker mt-1.5">{fact.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Portfolio status — calm status segments, not a score              */}
        {/* -------------------------------------------------------------- */}
        <section id="status" className="mt-14 scroll-mt-24">
          <p className="kicker">Portfolio status</p>
          <h2 className="h-section mt-1 text-midnight">Where things stand</h2>

          <div className="mt-6 flex flex-wrap gap-3">
            {statusSegments.map((segment) => (
              <div
                key={segment.key}
                className={cn(
                  "flex items-center gap-2.5 rounded-full border px-4 py-2",
                  STATUS_TONE_STYLE[segment.tone]
                )}
              >
                <span
                  aria-hidden
                  className={cn("size-2 shrink-0 rounded-full", STATUS_DOT_STYLE[segment.tone])}
                />
                <span className="text-sm font-medium">{segment.label}</span>
                <span className="text-sm font-semibold">{segment.count}</span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-muted-ink">
            Indicative status based on the information in your portfolio.
          </p>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Policies — PI/D&O table                                          */}
        {/* -------------------------------------------------------------- */}
        <section id="policies" className="mt-14 scroll-mt-24">
          <p className="kicker">Policies</p>
          <h2 className="h-section mt-1 text-midnight">Policies</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-ink">
            The policies identified in the documents you shared, and the assets each one
            relates to.
          </p>

          <div className="mt-6 overflow-x-auto rounded-xl border border-line shadow-soft">
            <Table>
              <TableHeader>
                <TableRow className="border-line hover:bg-transparent">
                  <TableHead className="h-auto bg-midnight py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                    Policy type
                  </TableHead>
                  <TableHead className="h-auto bg-midnight py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                    Insurer
                  </TableHead>
                  <TableHead className="h-auto bg-midnight py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                    Policy no.
                  </TableHead>
                  <TableHead className="h-auto bg-midnight py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                    Sum insured
                  </TableHead>
                  <TableHead className="h-auto bg-midnight py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                    Premium
                  </TableHead>
                  <TableHead className="h-auto bg-midnight py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                    Renewal date
                  </TableHead>
                  <TableHead className="h-auto bg-midnight py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                    Status
                  </TableHead>
                  <TableHead className="h-auto bg-midnight py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                    Related assets
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy, i) => {
                  const relatedAssetNames = policy.relatedAssetKeys
                    .map((key) => assetNameByKey.get(key))
                    .filter((name): name is string => Boolean(name));

                  return (
                    <TableRow
                      key={policy.key}
                      className={cn("border-line hover:bg-transparent", i % 2 === 1 && "bg-app-bg")}
                    >
                      <TableCell className="font-semibold text-midnight">{policy.type}</TableCell>
                      <TableCell className="text-ink/80">{policy.insurer}</TableCell>
                      <TableCell className="text-muted-ink">{policy.policyNumber}</TableCell>
                      <TableCell className="text-muted-ink">{policy.sumInsured}</TableCell>
                      <TableCell className="text-muted-ink">{policy.premium}</TableCell>
                      <TableCell className="text-muted-ink">
                        {formatRenewalDate(policy.renewalDate)}
                      </TableCell>
                      <TableCell>
                        <StatusPill status={policy.status} />
                      </TableCell>
                      <TableCell className="text-muted-ink">
                        {relatedAssetNames.length > 0 ? relatedAssetNames.join(", ") : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Placeholder anchors for later tasks — headings only for now.     */}
        {/* I3 slots an asset inventory table into #assets; I4 adds the      */}
        {/* add-asset flow alongside it; I6 slots a renewal timeline into    */}
        {/* #renewals. I5 (Share / Insights) adds further sections after.    */}
        {/* -------------------------------------------------------------- */}
        <section id="assets" className="mt-14 scroll-mt-24">
          <p className="kicker">Assets</p>
          <h2 className="h-section mt-1 text-midnight">Assets</h2>
        </section>

        <section id="renewals" className="mt-14 scroll-mt-24">
          <p className="kicker">Renewals</p>
          <h2 className="h-section mt-1 text-midnight">Renewals</h2>
        </section>
      </div>
    </motion.div>
  );
}
