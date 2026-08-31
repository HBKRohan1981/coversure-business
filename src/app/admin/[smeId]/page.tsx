"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  CalendarClock,
  FileText,
  CheckCircle2,
  Mail,
  Phone,
  Inbox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoverageTable } from "@/components/coverage/CoverageTable";
import { CategoryScoreBar } from "@/components/score/CategoryScoreBar";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
import { SEVERITY_LABELS } from "@/lib/language";
import { TONE_COLOR } from "@/lib/score";
import { useSession } from "@/lib/store";
import { demoCompany } from "@/lib/demo-data";
import type { RequestStage, Severity } from "@/lib/types";

export interface AdminSmeDetailPageProps {
  params: { smeId: string };
}

/** Same tone mapping RiskCard uses, kept local since this view stays a
 * compact list rather than the full expandable RiskCard. */
const SEVERITY_TONE: Record<Severity, keyof typeof TONE_COLOR | "neutral"> = {
  high: "high",
  attention: "attention",
  review: "neutral",
  good: "good",
};

function severityColor(severity: Severity): string {
  const tone = SEVERITY_TONE[severity];
  return tone === "neutral" ? "#64748B" : TONE_COLOR[tone];
}

/** Display labels for RequestStage — mirrors src/app/admin/page.tsx and
 * src/components/quotes/Timeline.tsx. */
const STAGE_LABELS: Record<RequestStage, string> = {
  "requirement-identified": "Requirement identified",
  "request-submitted": "Request submitted",
  "options-prepared": "Options being prepared",
  "quote-received": "Quote received",
  decision: "Decision",
  activated: "Activated",
};

/** Representative analysed-document categories — mirrors the categories
 * shown on the customer Documents screen (src/app/app/documents/page.tsx),
 * kept static/representative here per the G2 brief. */
const DOCUMENT_CATEGORIES = [
  { key: "financials", title: "Financials", status: "Analysed" },
  { key: "insurance", title: "Insurance policies", status: "Analysed" },
  { key: "benefits", title: "Employee benefits", status: "Analysed" },
];

/**
 * `submittedAt` is a fixed, stored ISO string (never Date.now() / an
 * argless `new Date()`), so formatting that stored value here stays
 * deterministic. Mirrors src/app/admin/page.tsx.
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

interface StatTileProps {
  label: string;
  value: string | number;
}

function StatTile({ label, value }: StatTileProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-midnight">{value}</p>
    </div>
  );
}

/**
 * Admin SME drill-down (Screen 15 detail) — the ops view of the full
 * commercial loop for one assessed business: profile -> documents ->
 * assessment -> coverage -> risks -> recommendations -> requests
 * (SME -> assessment -> risk/gap -> recommendation -> contact -> request
 * -> status). Lightweight MVP ops view, not a CRM: read-only, no editing
 * workflows.
 *
 * Per the "Admin data principle": only ABC Manufacturing exists in this
 * prototype. Its profile/scores/coverage/risks/recommendations come from
 * demoCompany (the same single source of truth the customer app reads),
 * and the Requests section reads the LIVE, persisted
 * useSession.submittedRequests — the same store the customer's Fix flow
 * (E8) writes to. Any other :smeId is not a real SME in this demo, so it
 * 404s rather than fabricating data.
 */
export default function AdminSmeDetailPage({ params }: AdminSmeDetailPageProps) {
  if (params.smeId !== "abc-manufacturing") {
    notFound();
  }

  const submittedRequests = useSession((s) => s.submittedRequests);
  const uploadedDocs = useSession((s) => s.uploadedDocs);
  const { profile, coverage, scores, risks, recommendations } = demoCompany;

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-royal"
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        Back to pipeline
      </Link>

      {/* ---------------------------------------------------------- */}
      {/* 1. Business profile                                         */}
      {/* ---------------------------------------------------------- */}
      <div className="mt-4">
        <h1 className="text-2xl font-semibold text-midnight sm:text-3xl">
          {profile.name}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <Building2 className="size-4 shrink-0 text-slate-400" aria-hidden />
            {profile.industry}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden />
            {profile.location}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarClock className="size-4 shrink-0 text-slate-400" aria-hidden />
            {profile.yearsOperating} years operating
          </span>
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <StatTile label="Annual turnover" value={profile.turnover} />
        <StatTile label="Employees" value={profile.employees} />
        <StatTile label="Fixed assets" value={profile.fixedAssets} />
        <StatTile label="Inventory" value={profile.inventory} />
      </div>

      {/* ---------------------------------------------------------- */}
      {/* 2. Documents                                                */}
      {/* ---------------------------------------------------------- */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-midnight">Documents</h2>
        <p className="mt-1 text-sm text-slate-600">
          Categories analysed as part of the assessment.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {DOCUMENT_CATEGORIES.map((cat) => (
            <Card key={cat.key} className="border-slate-200">
              <CardContent className="flex items-center justify-between gap-2 p-4">
                <span className="flex items-center gap-2 text-sm font-medium text-midnight">
                  <FileText className="size-4 shrink-0 text-slate-400" aria-hidden />
                  {cat.title}
                </span>
                <Badge
                  variant="outline"
                  className="gap-1 border-mint bg-mint/15 text-midnight"
                >
                  <CheckCircle2 className="size-3.5 text-royal" aria-hidden />
                  {cat.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        {uploadedDocs.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            Plus {uploadedDocs.length} document
            {uploadedDocs.length === 1 ? "" : "s"} shared this session.
          </p>
        )}
      </section>

      {/* ---------------------------------------------------------- */}
      {/* 3. Assessment                                               */}
      {/* ---------------------------------------------------------- */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-midnight">Assessment</h2>
        <p className="mt-1 text-sm text-slate-600">
          Indicative scores at a glance — Business Protection and People &amp;
          Benefits.
        </p>
        <Card className="mt-3 border-slate-200">
          <CardContent className="grid gap-5 p-5 sm:grid-cols-3">
            <CategoryScoreBar label="Protection Score" score={scores.overall} />
            <CategoryScoreBar label="People Score" score={demoCompany.benefits.peopleScore} />
            <CategoryScoreBar label="Benefits Score" score={demoCompany.benefits.benefitsScore} />
          </CardContent>
        </Card>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* 4. Coverage                                                 */}
      {/* ---------------------------------------------------------- */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-midnight">Coverage</h2>
        <p className="mt-1 text-sm text-slate-600">
          Cover identified in the documents reviewed.
        </p>
        <Card className="mt-3 border-slate-200">
          <CardContent className="p-0">
            <CoverageTable lines={coverage} />
          </CardContent>
        </Card>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* 5. Risks                                                    */}
      {/* ---------------------------------------------------------- */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-midnight">Risks</h2>
        <p className="mt-1 text-sm text-slate-600">
          Gaps and areas that may warrant review.
        </p>
        <Card className="mt-3 border-slate-200">
          <CardContent className="divide-y divide-slate-100 p-0">
            {risks.map((risk) => {
              const color = severityColor(risk.severity);
              return (
                <div key={risk.key} className="flex items-start gap-3 p-4">
                  <span
                    aria-hidden
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-midnight">
                        {risk.title}
                      </span>
                      <span
                        className="rounded-full border px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${color}1F`,
                          color,
                          borderColor: `${color}4D`,
                        }}
                      >
                        {SEVERITY_LABELS[risk.severity]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{risk.why}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* 6. Recommendations                                         */}
      {/* ---------------------------------------------------------- */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-midnight">
          Recommendations
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          What CoverSure identified as worth exploring.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {recommendations.map((reco) => (
            <Card key={reco.id} className="border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-400">
                    {reco.index}
                  </span>
                  <PriorityBadge priority={reco.priority} />
                </div>
                <CardTitle className="text-base text-midnight">
                  {reco.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-slate-600">
                {reco.recommended}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* 7. Requests                                                 */}
      {/* ---------------------------------------------------------- */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-midnight">Requests</h2>
        <p className="mt-1 text-sm text-slate-600">
          Live requests this business has raised with CoverSure, including
          the contact details they shared.
        </p>
        <Card className="mt-3 border-slate-200">
          <CardContent className="p-0">
            {submittedRequests.length === 0 ? (
              <div className="flex items-center gap-2 p-6 text-sm text-slate-500">
                <Inbox className="size-4 shrink-0 text-slate-400" aria-hidden />
                No requests yet
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {submittedRequests.map((request) => {
                  const recommendation = recommendations.find(
                    (r) => r.id === request.recommendationId
                  );
                  return (
                    <div key={request.id} className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-midnight">
                            {request.solution}
                          </p>
                          <p className="text-xs text-slate-500">
                            {recommendation
                              ? `From: ${recommendation.title}`
                              : "Recommendation not found"}
                          </p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-royal/30 bg-royal/5 px-2.5 py-0.5 text-xs font-medium text-royal">
                          {STAGE_LABELS[request.stage]}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        <span className="font-medium text-slate-700">
                          {request.contactName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarClock
                            className="size-3.5 shrink-0 text-slate-400"
                            aria-hidden
                          />
                          {formatSubmittedAt(request.submittedAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3.5 shrink-0 text-slate-400" aria-hidden />
                          {request.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3.5 shrink-0 text-slate-400" aria-hidden />
                          {request.email}
                        </span>
                        <span>
                          Preferred contact: {request.preferredContact}
                        </span>
                      </div>

                      {request.note && (
                        <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          &ldquo;{request.note}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <AssessmentDisclaimer className="mt-8" />
    </div>
  );
}
