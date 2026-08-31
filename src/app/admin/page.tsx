"use client";

import Link from "next/link";
import {
  Users,
  ClipboardCheck,
  Lightbulb,
  Inbox,
  TrendingUp,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/store";
import { demoCompany } from "@/lib/demo-data";
import type { QuoteRequest, RequestStage } from "@/lib/types";

/** Display labels for RequestStage — mirrors src/components/quotes/Timeline.tsx. */
const STAGE_LABELS: Record<RequestStage, string> = {
  "requirement-identified": "Requirement identified",
  "request-submitted": "Request submitted",
  "options-prepared": "Options being prepared",
  "quote-received": "Quote received",
  decision: "Decision",
  activated: "Activated",
};

/**
 * `submittedAt` is a fixed, stored ISO string (never Date.now() / an argless
 * `new Date()`), so formatting that stored value here stays deterministic.
 */
function formatSubmittedAt(iso: string): string {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} · ${timePart}`;
}

interface MetricTileProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  note?: string;
}

/** One cell of the metrics panel — hairline-grouped, midnight number over an
 * uppercase muted kicker label. Reused across the row via a shared bg-line
 * gap so the cells read as one panel rather than five floating cards. */
function MetricTile({ icon: Icon, label, value, note }: MetricTileProps) {
  return (
    <div className="flex flex-col gap-2 bg-white p-5">
      <div className="flex items-center gap-2 text-muted-ink">
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="text-[11px] font-semibold uppercase tracking-[.12em]">
          {label}
        </span>
      </div>
      <span className="text-2xl font-bold text-midnight">{value}</span>
      {note && <span className="text-xs text-muted-ink">{note}</span>}
    </div>
  );
}

/**
 * Admin pipeline (Screen 15) — the internal ops view of the same commercial
 * loop the customer app demonstrates: SME -> Assessment -> Recommendation ->
 * Contact -> Request -> CoverSure action.
 *
 * Per the "Admin data principle": there is no separate fictional admin
 * dataset. ABC Manufacturing's score/priorities/recommendations come from
 * demoCompany (the SAME single source of truth the customer app reads), and
 * every request row comes from the LIVE, persisted useSession.submittedRequests
 * — the same store the customer's Fix flow (E8) writes to. Because both the
 * customer app and /admin read one shared localStorage-backed store on the
 * same origin, a request submitted via the Fix flow shows up here without
 * any additional plumbing.
 */
export default function AdminPipelinePage() {
  const submittedRequests = useSession((s) => s.submittedRequests);
  const { profile, scores, recommendations } = demoCompany;

  const topPriority =
    recommendations.find((r) => r.priority === "high") ?? recommendations[0];

  const openOpportunities =
    recommendations.length -
    new Set(
      submittedRequests
        .filter((r) => r.stage === "activated")
        .map((r) => r.recommendationId)
    ).size;

  return (
    <div>
      <p className="kicker">Internal · Admin</p>
      <h1 className="mt-1 text-2xl font-semibold text-midnight sm:text-3xl">
        SME Pipeline
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-ink">
        Internal view of assessed businesses and the requests they&apos;ve
        raised with CoverSure — from assessment through to activation.
      </p>

      {/* ---------------------------------------------------------- */}
      {/* Metrics row — all derived from demoCompany + the live store */}
      {/* ---------------------------------------------------------- */}
      <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-soft sm:grid-cols-2 lg:grid-cols-5">
        <MetricTile icon={Users} label="SMEs assessed" value={1} />
        <MetricTile
          icon={ClipboardCheck}
          label="Assessments completed"
          value={1}
        />
        <MetricTile
          icon={Lightbulb}
          label="Recommendations identified"
          value={recommendations.length}
        />
        <MetricTile
          icon={Inbox}
          label="Quote requests"
          value={submittedRequests.length}
          note="Live from submitted requests"
        />
        <MetricTile
          icon={TrendingUp}
          label="Open opportunities"
          value={Math.max(openOpportunities, 0)}
          note="Recommendations not yet activated — indicative"
        />
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Pipeline table — PI/D&O table look, same as CoverageTable   */}
      {/* ---------------------------------------------------------- */}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-line shadow-soft">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="h-auto bg-midnight px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                Business
              </TableHead>
              <TableHead className="h-auto bg-midnight px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                Protection score
              </TableHead>
              <TableHead className="h-auto bg-midnight px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                Priority / recommendation
              </TableHead>
              <TableHead className="h-auto bg-midnight px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                Solution requested
              </TableHead>
              <TableHead className="h-auto bg-midnight px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                Contact
              </TableHead>
              <TableHead className="h-auto bg-midnight px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                Phone / email
              </TableHead>
              <TableHead className="h-auto bg-midnight px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                Preferred contact
              </TableHead>
              <TableHead className="h-auto whitespace-nowrap bg-midnight px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                Request date
              </TableHead>
              <TableHead className="h-auto bg-midnight px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
                Stage / status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submittedRequests.length === 0 ? (
              <EmptyStateRow
                profileName={profile.name}
                score={scores.overall}
                topPriorityTitle={topPriority.title}
                topPriorityPriority={topPriority.priority}
              />
            ) : (
              submittedRequests.map((request, index) => (
                <RequestRow key={request.id} request={request} index={index} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AssessmentDisclaimer className="mt-8" />
    </div>
  );
}

function RequestRow({
  request,
  index,
}: {
  request: QuoteRequest;
  index: number;
}) {
  const recommendation = demoCompany.recommendations.find(
    (r) => r.id === request.recommendationId
  );

  return (
    <TableRow
      className={cn(
        "border-line hover:bg-transparent",
        index % 2 === 1 && "bg-app-bg"
      )}
    >
      <TableCell className="px-4 py-3 font-semibold text-midnight">
        <Link
          href="/admin/abc-manufacturing"
          className="flex items-center gap-1.5 hover:text-royal"
        >
          {demoCompany.profile.name}
          <ArrowRight className="size-3.5 shrink-0" aria-hidden />
        </Link>
      </TableCell>
      <TableCell className="px-4 py-3">
        <span className="font-semibold text-midnight">
          {demoCompany.scores.overall}
        </span>
        <span className="text-muted-ink">/100</span>
      </TableCell>
      <TableCell className="px-4 py-3">
        {recommendation ? (
          <div className="flex flex-col gap-1">
            <span className="text-ink">{recommendation.title}</span>
            <PriorityBadge
              priority={recommendation.priority}
              className="w-fit"
            />
          </div>
        ) : (
          <span className="text-muted-ink">—</span>
        )}
      </TableCell>
      <TableCell className="px-4 py-3 text-ink">{request.solution}</TableCell>
      <TableCell className="px-4 py-3 text-ink">
        {request.contactName}
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex flex-col gap-1 text-muted-ink">
          <span className="flex items-center gap-1.5">
            <Phone className="size-3.5 shrink-0 text-muted-ink" aria-hidden />
            {request.phone}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="size-3.5 shrink-0 text-muted-ink" aria-hidden />
            {request.email}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-ink">
        {request.preferredContact}
      </TableCell>
      <TableCell className="whitespace-nowrap px-4 py-3 text-muted-ink">
        {formatSubmittedAt(request.submittedAt)}
      </TableCell>
      <TableCell className="px-4 py-3">
        <span className="inline-flex items-center rounded-full border border-royal/30 bg-royal/5 px-2.5 py-0.5 text-xs font-medium text-royal">
          {STAGE_LABELS[request.stage]}
        </span>
      </TableCell>
    </TableRow>
  );
}

/**
 * Empty state — no requests yet. Still surfaces ABC Manufacturing as an
 * assessed SME already in the funnel (score + top priority from
 * demoCompany), rather than leaving the pipeline blank.
 */
function EmptyStateRow({
  profileName,
  score,
  topPriorityTitle,
  topPriorityPriority,
}: {
  profileName: string;
  score: number;
  topPriorityTitle: string;
  topPriorityPriority: "high" | "medium" | "low";
}) {
  return (
    <TableRow className="border-line hover:bg-transparent">
      <TableCell className="px-4 py-3 font-semibold text-midnight">
        <Link
          href="/admin/abc-manufacturing"
          className="flex items-center gap-1.5 hover:text-royal"
        >
          {profileName}
          <ArrowRight className="size-3.5 shrink-0" aria-hidden />
        </Link>
      </TableCell>
      <TableCell className="px-4 py-3">
        <span className="font-semibold text-midnight">{score}</span>
        <span className="text-muted-ink">/100</span>
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="text-ink">{topPriorityTitle}</span>
          <PriorityBadge priority={topPriorityPriority} className="w-fit" />
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-muted-ink" colSpan={6}>
        Awaiting request — assessed and in the funnel, no quote request
        submitted yet.
      </TableCell>
    </TableRow>
  );
}
