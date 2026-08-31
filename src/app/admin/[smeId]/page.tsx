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
import { Meter, METER_COLOR, type MeterLevel } from "@/components/score/Meter";
import { Timeline } from "@/components/quotes/Timeline";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
import { SEVERITY_LABELS } from "@/lib/language";
import { useSession } from "@/lib/store";
import { demoCompany } from "@/lib/demo-data";
import type { Severity } from "@/lib/types";

export interface AdminSmeDetailPageProps {
  params: { smeId: string };
}

/** Severity -> Meter level, same mapping RiskCard uses (src/components/risk/RiskCard.tsx):
 * 1 = relatively well protected, 4 = high attention. Visual mapping only. */
const SEVERITY_LEVEL: Record<Severity, MeterLevel> = {
  good: 1,
  review: 2,
  attention: 3,
  high: 4,
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
    <div className="rounded-lg border border-line bg-app-bg px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-ink">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-midnight">{value}</p>
    </div>
  );
}

interface SectionHeadProps {
  kicker: string;
  title: string;
  description?: string;
}

/** Shared section header — kicker + title, matching the customer app's
 * section-head convention (e.g. src/app/app/protection/page.tsx). */
function SectionHead({ kicker, title, description }: SectionHeadProps) {
  return (
    <div>
      <p className="kicker">{kicker}</p>
      <h2 className="mt-1 text-lg font-semibold text-midnight">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-muted-ink">{description}</p>
      )}
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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-ink hover:text-royal"
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        Back to pipeline
      </Link>

      {/* ---------------------------------------------------------- */}
      {/* 1. Business profile                                         */}
      {/* ---------------------------------------------------------- */}
      <div className="mt-4">
        <p className="kicker">Internal · SME profile</p>
        <h1 className="mt-1 text-2xl font-semibold text-midnight sm:text-3xl">
          {profile.name}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-ink">
          <span className="flex items-center gap-1.5">
            <Building2 className="size-4 shrink-0 text-muted-ink" aria-hidden />
            {profile.industry}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0 text-muted-ink" aria-hidden />
            {profile.location}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarClock className="size-4 shrink-0 text-muted-ink" aria-hidden />
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
      <section className="mt-10">
        <SectionHead
          kicker="Documents"
          title="Documents"
          description="Categories analysed as part of the assessment."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {DOCUMENT_CATEGORIES.map((cat) => (
            <Card key={cat.key}>
              <CardContent className="flex items-center justify-between gap-2 p-4">
                <span className="flex items-center gap-2 text-sm font-medium text-midnight">
                  <FileText className="size-4 shrink-0 text-muted-ink" aria-hidden />
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
          <p className="mt-2 text-xs text-muted-ink">
            Plus {uploadedDocs.length} document
            {uploadedDocs.length === 1 ? "" : "s"} shared this session.
          </p>
        )}
      </section>

      {/* ---------------------------------------------------------- */}
      {/* 3. Assessment                                               */}
      {/* ---------------------------------------------------------- */}
      <section className="mt-10">
        <SectionHead
          kicker="Assessment"
          title="Assessment"
          description="Indicative scores at a glance — Business Protection and People & Benefits."
        />
        <Card className="mt-3">
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
      <section className="mt-10">
        <SectionHead
          kicker="Coverage"
          title="Coverage"
          description="Cover identified in the documents reviewed."
        />
        <div className="mt-3">
          <CoverageTable lines={coverage} />
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* 5. Risks                                                    */}
      {/* ---------------------------------------------------------- */}
      <section className="mt-10">
        <SectionHead
          kicker="Risks"
          title="Risks"
          description="Gaps and areas that may warrant review."
        />
        <Card className="mt-3">
          <CardContent className="divide-y divide-line p-0">
            {risks.map((risk) => {
              const level = SEVERITY_LEVEL[risk.severity];
              const color = METER_COLOR[level];
              return (
                <div key={risk.key} className="flex items-start gap-4 p-4">
                  <Meter level={level} className="mt-1 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-midnight">
                        {risk.title}
                      </span>
                      <span
                        className="rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          backgroundColor: `${color}1F`,
                          color,
                          borderColor: `${color}4D`,
                        }}
                      >
                        {SEVERITY_LABELS[risk.severity]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-ink">{risk.why}</p>
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
      <section className="mt-10">
        <SectionHead
          kicker="Recommendations"
          title="Recommendations"
          description="What CoverSure identified as worth exploring."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {recommendations.map((reco) => (
            <Card key={reco.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-ink">
                    {reco.index}
                  </span>
                  <PriorityBadge priority={reco.priority} />
                </div>
                <CardTitle className="text-base text-midnight">
                  {reco.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-ink">
                {reco.recommended}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* 7. Requests                                                 */}
      {/* ---------------------------------------------------------- */}
      <section className="mt-10">
        <SectionHead
          kicker="Requests"
          title="Requests"
          description="Live requests this business has raised with CoverSure, including the contact details they shared."
        />
        <Card className="mt-3">
          <CardContent className="p-0">
            {submittedRequests.length === 0 ? (
              <div className="flex items-center gap-2 p-6 text-sm text-muted-ink">
                <Inbox className="size-4 shrink-0 text-muted-ink" aria-hidden />
                No requests yet
              </div>
            ) : (
              <div className="divide-y divide-line">
                {submittedRequests.map((request) => {
                  const recommendation = recommendations.find(
                    (r) => r.id === request.recommendationId
                  );
                  return (
                    <div key={request.id} className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-midnight">
                            {request.solution}
                          </p>
                          <p className="text-xs text-muted-ink">
                            {recommendation
                              ? `From: ${recommendation.title}`
                              : "Recommendation not found"}
                          </p>
                        </div>
                        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-app-bg px-3 py-1 text-xs font-medium text-muted-ink">
                          <CalendarClock className="size-3.5 shrink-0" aria-hidden />
                          {formatSubmittedAt(request.submittedAt)}
                        </span>
                      </div>

                      <div className="mt-4">
                        <Timeline stage={request.stage} />
                      </div>

                      <div className="mt-4 rounded-xl border border-line bg-app-bg px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-royal">
                          Contact details
                        </p>
                        <div className="mt-2.5 grid gap-2 text-sm text-ink sm:grid-cols-2">
                          <span className="font-medium text-midnight">
                            {request.contactName}
                          </span>
                          <span>Prefers {request.preferredContact}</span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="size-3.5 shrink-0 text-muted-ink" aria-hidden />
                            {request.phone}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Mail className="size-3.5 shrink-0 text-muted-ink" aria-hidden />
                            {request.email}
                          </span>
                        </div>
                        {request.note && (
                          <p className="mt-3 border-t border-line pt-3 text-sm text-muted-ink">
                            &ldquo;{request.note}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <AssessmentDisclaimer className="mt-10" />
    </div>
  );
}
