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
import { Card, CardContent } from "@/components/ui/card";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
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

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  note?: string;
}

function MetricCard({ icon: Icon, label, value, note }: MetricCardProps) {
  return (
    <Card className="border-slate-200">
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-slate-500">
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="text-xs font-medium uppercase tracking-wide">
            {label}
          </span>
        </div>
        <span className="text-2xl font-semibold text-midnight">{value}</span>
        {note && <span className="text-xs text-slate-500">{note}</span>}
      </CardContent>
    </Card>
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
      <h1 className="text-2xl font-semibold text-midnight sm:text-3xl">
        SME Pipeline
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Internal view of assessed businesses and the requests they&apos;ve
        raised with CoverSure — from assessment through to activation.
      </p>

      {/* ---------------------------------------------------------- */}
      {/* Metrics row — all derived from demoCompany + the live store */}
      {/* ---------------------------------------------------------- */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard icon={Users} label="SMEs assessed" value={1} />
        <MetricCard
          icon={ClipboardCheck}
          label="Assessments completed"
          value={1}
        />
        <MetricCard
          icon={Lightbulb}
          label="Recommendations identified"
          value={recommendations.length}
        />
        <MetricCard
          icon={Inbox}
          label="Quote requests"
          value={submittedRequests.length}
          note="Live from submitted requests"
        />
        <MetricCard
          icon={TrendingUp}
          label="Open opportunities"
          value={Math.max(openOpportunities, 0)}
          note="Recommendations not yet activated — indicative"
        />
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Pipeline table                                              */}
      {/* ---------------------------------------------------------- */}
      <Card className="mt-8 border-slate-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Protection score</th>
                  <th className="px-4 py-3">Priority / recommendation</th>
                  <th className="px-4 py-3">Solution requested</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Phone / email</th>
                  <th className="px-4 py-3">Preferred contact</th>
                  <th className="px-4 py-3">Request date</th>
                  <th className="px-4 py-3">Stage / status</th>
                </tr>
              </thead>
              <tbody>
                {submittedRequests.length === 0 ? (
                  <EmptyStateRow
                    profileName={profile.name}
                    score={scores.overall}
                    topPriorityTitle={topPriority.title}
                    topPriorityPriority={topPriority.priority}
                  />
                ) : (
                  submittedRequests.map((request) => (
                    <RequestRow key={request.id} request={request} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AssessmentDisclaimer className="mt-8" />
    </div>
  );
}

function RequestRow({ request }: { request: QuoteRequest }) {
  const recommendation = demoCompany.recommendations.find(
    (r) => r.id === request.recommendationId
  );

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
      <td className="px-4 py-3 font-medium text-midnight">
        <Link
          href="/admin/abc-manufacturing"
          className="flex items-center gap-1.5 hover:text-royal"
        >
          {demoCompany.profile.name}
          <ArrowRight className="size-3.5 shrink-0" aria-hidden />
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className="font-semibold text-midnight">
          {demoCompany.scores.overall}
        </span>
        <span className="text-slate-400">/100</span>
      </td>
      <td className="px-4 py-3">
        {recommendation ? (
          <div className="flex flex-col gap-1">
            <span className="text-slate-700">{recommendation.title}</span>
            <PriorityBadge
              priority={recommendation.priority}
              className="w-fit"
            />
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-slate-700">{request.solution}</td>
      <td className="px-4 py-3 text-slate-700">{request.contactName}</td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1 text-slate-600">
          <span className="flex items-center gap-1.5">
            <Phone className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            {request.phone}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            {request.email}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-700">{request.preferredContact}</td>
      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
        {formatSubmittedAt(request.submittedAt)}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center rounded-full border border-royal/30 bg-royal/5 px-2.5 py-0.5 text-xs font-medium text-royal">
          {STAGE_LABELS[request.stage]}
        </span>
      </td>
    </tr>
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
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-3 font-medium text-midnight">
        <Link
          href="/admin/abc-manufacturing"
          className="flex items-center gap-1.5 hover:text-royal"
        >
          {profileName}
          <ArrowRight className="size-3.5 shrink-0" aria-hidden />
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className="font-semibold text-midnight">{score}</span>
        <span className="text-slate-400">/100</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="text-slate-700">{topPriorityTitle}</span>
          <PriorityBadge priority={topPriorityPriority} className="w-fit" />
        </div>
      </td>
      <td className="px-4 py-3 text-slate-400" colSpan={6}>
        Awaiting request — assessed and in the funnel, no quote request
        submitted yet.
      </td>
    </tr>
  );
}
