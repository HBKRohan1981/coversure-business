"use client";

import Link from "next/link";
import {
  Building2,
  Calendar,
  ClipboardList,
  Mail,
  MessageCircle,
  Phone,
  StickyNote,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Timeline } from "@/components/quotes/Timeline";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
import { useSession } from "@/lib/store";
import { demoCompany } from "@/lib/demo-data";
import type { QuoteRequest } from "@/lib/types";

/** Icon for the request's preferred contact method — falls back to Phone. */
function contactMethodIcon(method: string) {
  if (method === "Email") return Mail;
  if (method === "WhatsApp") return MessageCircle;
  return Phone;
}

/**
 * `submittedAt` is always a fixed, stored ISO string (never Date.now() /
 * an argless `new Date()`), so parsing that fixed value here for display
 * stays deterministic across renders and sessions.
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

function RequestCard({ request }: { request: QuoteRequest }) {
  const recommendation = demoCompany.recommendations.find(
    (r) => r.id === request.recommendationId
  );
  const ContactIcon = contactMethodIcon(request.preferredContact);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3 px-6 pb-5 pt-6 sm:px-7">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[.1em] text-muted-ink">
            <Building2 className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{demoCompany.profile.name}</span>
          </div>
          <h3 className="mt-1.5 text-base font-semibold text-midnight">
            {request.solution}
          </h3>
          {recommendation && (
            <p className="mt-0.5 text-sm text-muted-ink">
              From: {recommendation.title}
            </p>
          )}
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-app-bg px-3 py-1 text-xs font-medium text-muted-ink">
          <Calendar className="size-3.5" aria-hidden />
          {formatSubmittedAt(request.submittedAt)}
        </span>
      </div>

      <div className="space-y-6 border-t border-line px-6 py-6 sm:px-7">
        <Timeline stage={request.stage} />

        {/* Contact details — the commercially useful part: what the admin
            needs to act on this lead, without an email chain. */}
        <div className="rounded-xl border border-line bg-app-bg px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-royal">
            Contact details
          </p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-ink">
              <User className="size-4 shrink-0 text-muted-ink" aria-hidden />
              <span className="truncate">{request.contactName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink">
              <ContactIcon className="size-4 shrink-0 text-muted-ink" aria-hidden />
              <span>Prefers {request.preferredContact}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink">
              <Phone className="size-4 shrink-0 text-muted-ink" aria-hidden />
              <span>{request.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink">
              <Mail className="size-4 shrink-0 text-muted-ink" aria-hidden />
              <span className="truncate">{request.email}</span>
            </div>
          </div>
          {request.note && (
            <div className="mt-3 flex items-start gap-2 border-t border-line pt-3 text-sm text-muted-ink">
              <StickyNote
                className="mt-0.5 size-4 shrink-0 text-muted-ink"
                aria-hidden
              />
              <span>{request.note}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Quotes & Requests tracker (Screen 14) — closes the commercial loop.
 * Consumes the persisted QuoteRequest[] (useSession.submittedRequests,
 * now WITH contact info) as a modern workflow tracker rather than an
 * email chain: each request shows its solution, the recommendation it
 * came from (demoCompany.recommendations), a Timeline of the six
 * RequestStage steps, and the contact details captured at submission.
 * "Manage continuously" (final story beat) is represented here + Admin,
 * per the Phase F+ directives — no servicing/renewal engine is built.
 */
export default function QuotesPage() {
  const submittedRequests = useSession((s) => s.submittedRequests);

  return (
    <div className="cs-container px-0">
      <p className="kicker">Quotes &amp; Requests</p>
      <h1 className="h-section mt-1 text-midnight">Quotes &amp; Requests</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-ink">
        Track what you&apos;ve asked CoverSure to help with, from request
        through to activation.
      </p>

      {submittedRequests.length === 0 ? (
        <Card className="mt-8 rounded-2xl border-line shadow-soft">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-app-bg text-muted-ink">
              <ClipboardList className="size-6" aria-hidden />
            </span>
            <h2 className="text-lg font-semibold text-midnight">
              No requests yet
            </h2>
            <p className="max-w-sm text-sm text-muted-ink">
              Explore your priorities to find where CoverSure can help.
            </p>
            <Link
              href="/app/recommendations"
              className="mt-2 text-sm font-medium text-royal hover:text-electric"
            >
              Explore your priorities &rarr;
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-5">
          {submittedRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}

      <AssessmentDisclaimer className="mt-10" />
    </div>
  );
}
