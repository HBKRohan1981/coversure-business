"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/components/coverage/StatusPill";
import { Meter, type MeterLevel } from "@/components/score/Meter";
import { demoCompany } from "@/lib/demo-data";
import { useSession } from "@/lib/store";
import { formatEmployees } from "@/lib/format";
import { daysUntil, deriveInsights, portfolioCounts, renewalBuckets, type Insight } from "@/lib/portfolio";
import type { Asset, AssetCategory, Policy, Severity } from "@/lib/types";

/**
 * Severity -> Meter level, same mapping used on /app/insights and RiskCard
 * (src/components/risk/RiskCard.tsx). Visual mapping only.
 */
const SEVERITY_LEVEL: Record<Severity, MeterLevel> = {
  good: 1,
  review: 2,
  attention: 3,
  high: 4,
};

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
 * Asset type options offered in "Add asset". Category is derived from type
 * (no separate category toggle) — property-like types are immovable,
 * everything else (vehicles/machinery/equipment/other) is movable.
 */
const ASSET_TYPE_OPTIONS: { value: string; category: AssetCategory }[] = [
  { value: "Factory", category: "immovable" },
  { value: "Warehouse", category: "immovable" },
  { value: "Office", category: "immovable" },
  { value: "Other property", category: "immovable" },
  { value: "Vehicles", category: "movable" },
  { value: "Machinery", category: "movable" },
  { value: "Equipment", category: "movable" },
  { value: "Other", category: "movable" },
];

type InsuredChoice = "yes" | "no" | "notsure";

const INSURED_OPTIONS: { value: InsuredChoice; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "notsure", label: "Not sure" },
];

const CATEGORY_LABEL: Record<AssetCategory, string> = {
  immovable: "Immovable",
  movable: "Movable",
};

const fieldLabel = "text-[13.5px] font-medium text-midnight";

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
  const policyLabelByKey = new Map(
    policies.map((p) => [p.key, `${p.type} · ${p.insurer}`])
  );

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

  // CoverSure Insights summary — the top 2-3 most attention-worthy
  // observations from the same deriveInsights selector /app/insights uses,
  // ranked by severity (ties keep deriveInsights' own order). Nothing here
  // is hardcoded; it disappears entirely once there is nothing to surface.
  const SEVERITY_RANK: Record<Severity, number> = { high: 0, attention: 1, review: 2, good: 3 };
  const insights = deriveInsights(demoCompany, assets);
  const topInsights: Insight[] = [...insights]
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
    .slice(0, 3);

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
        {/* CoverSure Insights — a restrained preview of the intelligence     */}
        {/* layer (I5's /app/insights), not a restatement of the score.       */}
        {/* Sourced from the same deriveInsights selector; disappears when    */}
        {/* there is nothing to surface.                                      */}
        {/* -------------------------------------------------------------- */}
        {topInsights.length > 0 && (
          <section id="insights" className="mt-14 scroll-mt-24">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="kicker">CoverSure Insights</p>
                <h2 className="h-section mt-1 text-midnight">What needs attention?</h2>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/app/insights">View all insights</Link>
              </Button>
            </div>

            <div className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white shadow-soft">
              {topInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <Meter level={SEVERITY_LEVEL[insight.severity]} className="mt-1" />
                    <div className="min-w-0">
                      <p className="font-semibold text-midnight">{insight.title}</p>
                      <p className="mt-0.5 text-sm text-muted-ink">{insight.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
        {/* Assets — the asset -> insurance coverage -> policy relationship. */}
        {/* Grouped by category (immovable/movable); each row shows the     */}
        {/* related policy (or "Coverage not identified") rather than       */}
        {/* treating assets and policies as unrelated lists.                */}
        {/* -------------------------------------------------------------- */}
        <section id="assets" className="mt-14 scroll-mt-24">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="kicker">Assets</p>
              <h2 className="h-section mt-1 text-midnight">Assets</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-ink">
                Your business assets and the coverage identified for each.
              </p>
            </div>
            <AddAssetDialog policies={policies} />
          </div>

          <div className="mt-6 space-y-8">
            {(["immovable", "movable"] as AssetCategory[]).map((category) => {
              const groupAssets = assets.filter((a) => a.category === category);
              if (groupAssets.length === 0) return null;
              return (
                <AssetGroup
                  key={category}
                  label={CATEGORY_LABEL[category]}
                  assets={groupAssets}
                  policyLabelByKey={policyLabelByKey}
                />
              );
            })}
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Renewals — 30/60/90-day windows, nearest emphasised subtly.       */}
        {/* Only d30/d60/d90 are grouped; "later" policies get a one-line    */}
        {/* note rather than a group, so the section stays about what's      */}
        {/* actually coming up.                                              */}
        {/* -------------------------------------------------------------- */}
        <section id="renewals" className="mt-14 scroll-mt-24">
          <p className="kicker">Renewals</p>
          <h2 className="h-section mt-1 text-midnight">Upcoming renewals</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-ink">
            Stay ahead of your policy renewals — review coverage before each one.
          </p>

          <div className="mt-6 space-y-8">
            <RenewalGroup
              label="Next 30 days"
              policies={buckets.d30}
              asOfDate={asOfDate}
              assetNameByKey={assetNameByKey}
            />
            <RenewalGroup
              label="Next 60 days"
              policies={buckets.d60}
              asOfDate={asOfDate}
              assetNameByKey={assetNameByKey}
            />
            <RenewalGroup
              label="Next 90 days"
              policies={buckets.d90}
              asOfDate={asOfDate}
              assetNameByKey={assetNameByKey}
            />
          </div>

          {buckets.later.length > 0 && (
            <p className="mt-4 text-xs text-muted-ink">Other policies renew later.</p>
          )}
        </section>
      </div>
    </motion.div>
  );
}

/**
 * One category subgroup of the Assets section — a restrained divided list
 * (not a wall of cards). Each row surfaces the asset -> policy relationship
 * directly: the related policy label(s), or "Coverage not identified" when
 * relatedPolicyKeys is empty (never invents a policy). Assets with a gap
 * (not-identified / potential-gap) get the signature service CTA.
 */
function AssetGroup({
  label,
  assets,
  policyLabelByKey,
}: {
  label: string;
  assets: Asset[];
  policyLabelByKey: Map<string, string>;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-ink">
        {label}
      </p>
      <div className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white shadow-soft">
        {assets.map((asset) => {
          const hasGap =
            asset.insuranceStatus === "not-identified" ||
            asset.insuranceStatus === "potential-gap";
          const relatedLabels = asset.relatedPolicyKeys
            .map((key) => policyLabelByKey.get(key))
            .filter((l): l is string => Boolean(l));
          const relationship =
            relatedLabels.length > 0 ? relatedLabels.join(", ") : "Coverage not identified";

          return (
            <div
              key={asset.key}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-midnight">{asset.name}</p>
                <p className="mt-0.5 text-sm text-muted-ink">
                  {asset.type} · {asset.location}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <span className="text-sm font-medium text-midnight">{asset.value}</span>
                <StatusPill status={asset.insuranceStatus} />
                <span
                  className={cn(
                    "text-sm",
                    relatedLabels.length > 0 ? "text-ink/80" : "text-muted-ink"
                  )}
                >
                  {relationship}
                </span>
                {hasGap && (
                  <Button asChild size="sm" variant="outline">
                    <Link href="/app/recommendations">Secure with CoverSure</Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * One 30/60/90-day renewal window (Renewals section). A restrained divided
 * list, matching AssetGroup's pattern. Days-until is recomputed per row from
 * the fixed, stored renewalDate + demoCompany.asOfDate (daysUntil in
 * portfolio.ts) — never derived from the current wall-clock time. Renewals
 * due within 30 days get a subtle amber accent; this only ever applies
 * within the "Next 30 days" group since daysUntil > 30 by construction in
 * the other two buckets.
 */
function RenewalGroup({
  label,
  policies,
  asOfDate,
  assetNameByKey,
}: {
  label: string;
  policies: Policy[];
  asOfDate: string;
  assetNameByKey: Map<string, string>;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-ink">
        {label}
      </p>

      {policies.length === 0 ? (
        <p className="mt-3 rounded-xl border border-line bg-white px-5 py-4 text-sm text-muted-ink shadow-soft">
          None in this window.
        </p>
      ) : (
        <div className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white shadow-soft">
          {policies.map((policy) => {
            const days = daysUntil(policy.renewalDate, asOfDate);
            const dueSoon = days <= 30;
            const relatedAssetNames = policy.relatedAssetKeys
              .map((key) => assetNameByKey.get(key))
              .filter((name): name is string => Boolean(name));

            return (
              <div
                key={policy.key}
                className={cn(
                  "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
                  dueSoon && "bg-amber/5"
                )}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-midnight">{policy.type}</p>
                  <p className="mt-0.5 text-sm text-muted-ink">{policy.insurer}</p>
                  <p className="mt-0.5 text-sm text-muted-ink">
                    {relatedAssetNames.length > 0 ? relatedAssetNames.join(", ") : "—"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <span className="text-sm text-muted-ink">{policy.sumInsured}</span>
                  <span className="text-sm text-muted-ink">
                    {formatRenewalDate(policy.renewalDate)}
                  </span>
                  <span className={cn("text-sm font-medium", dueSoon ? "text-amber" : "text-ink/80")}>
                    in {days} day{days === 1 ? "" : "s"}
                  </span>
                  <StatusPill status={policy.status} />
                  <Button asChild size="sm" variant="outline">
                    <Link href="/app/portfolio#policies">Review renewal</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * "Add asset" dialog — the persisted store interaction (I1's useSession.addAsset).
 * A new asset added here shows up in the Assets section immediately (session
 * state) and survives a refresh (zustand `persist` -> localStorage). Category
 * is derived from the chosen asset type; the "insured" branch decides whether
 * a policy link is offered or a careful gap/uncertainty note is shown —
 * mirrors the guardrail language in the portfolio spec, never invents a
 * policy or claims inadequacy.
 */
function AddAssetDialog({ policies }: { policies: Policy[] }) {
  const addAsset = useSession((s) => s.addAsset);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [value, setValue] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [insured, setInsured] = useState<InsuredChoice>("notsure");
  const [linkedPolicyKey, setLinkedPolicyKey] = useState("");
  const [errors, setErrors] = useState<{ type?: boolean; name?: boolean }>({});

  function resetForm() {
    setType("");
    setName("");
    setLocation("");
    setValue("");
    setAcquisitionDate("");
    setInsured("notsure");
    setLinkedPolicyKey("");
    setErrors({});
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetForm();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors = {
      type: type.trim().length === 0,
      name: name.trim().length === 0,
    };
    setErrors(nextErrors);
    if (nextErrors.type || nextErrors.name) return;

    const category: AssetCategory =
      ASSET_TYPE_OPTIONS.find((opt) => opt.value === type)?.category ?? "movable";

    addAsset({
      type,
      name: name.trim(),
      category,
      location: location.trim(),
      value: value.trim(),
      acquisitionDate: acquisitionDate.trim().length > 0 ? acquisitionDate : undefined,
      insured,
      linkedPolicyKey: insured === "yes" && linkedPolicyKey ? linkedPolicyKey : undefined,
    });

    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="size-4" />
          Add asset
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add a business asset</DialogTitle>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="asset-type" className={fieldLabel}>
              Asset type
            </Label>
            <Select value={type} onValueChange={(v) => setType(v)}>
              <SelectTrigger
                id="asset-type"
                aria-invalid={errors.type || undefined}
                className={errors.type ? "border-danger" : undefined}
              >
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-danger">Please select an asset type.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset-name" className={fieldLabel}>
              Asset name
            </Label>
            <Input
              id="asset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={errors.name || undefined}
              className={errors.name ? "border-danger" : undefined}
            />
            {errors.name && (
              <p className="text-xs text-danger">Please add an asset name.</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="asset-location" className={fieldLabel}>
                Location
              </Label>
              <Input
                id="asset-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-value" className={fieldLabel}>
                Estimated value
              </Label>
              <Input
                id="asset-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. ₹2 Cr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset-acquisition" className={fieldLabel}>
              Acquisition date (optional)
            </Label>
            <Input
              id="asset-acquisition"
              type="date"
              value={acquisitionDate}
              onChange={(e) => setAcquisitionDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className={fieldLabel}>Is this asset already insured?</Label>
            <div className="flex gap-2">
              {INSURED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInsured(opt.value)}
                  className={cn(
                    "flex-1 rounded-[10px] border-[1.5px] px-3 py-2 text-sm font-medium transition-colors",
                    insured === opt.value
                      ? "border-electric bg-electric text-white"
                      : "border-line bg-white text-ink hover:bg-app-bg"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {insured === "yes" && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="asset-linked-policy" className={fieldLabel}>
                  Link an existing policy (optional)
                </Label>
                <Select value={linkedPolicyKey} onValueChange={(v) => setLinkedPolicyKey(v)}>
                  <SelectTrigger id="asset-linked-policy">
                    <SelectValue placeholder="Select a policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.map((p) => (
                      <SelectItem key={p.key} value={p.key}>
                        {p.type} · {p.insurer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {insured === "no" && (
              <p className="mt-2 rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-xs text-danger">
                Potential protection gap identified.
              </p>
            )}

            {insured === "notsure" && (
              <p className="mt-2 rounded-lg border border-line bg-line/50 px-3 py-2 text-xs text-muted-ink">
                Coverage could not be confirmed from the information currently available.
              </p>
            )}
          </div>

          <div className="flex justify-end border-t border-line pt-5">
            <Button type="submit">Add asset</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
