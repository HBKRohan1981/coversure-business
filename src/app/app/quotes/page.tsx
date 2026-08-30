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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
              <Building2 className="size-3.5 shrink-0" aria-hidden />
              <span>{demoCompany.profile.name}</span>
            </div>
            <CardTitle className="mt-1 text-base text-midnight">
              {request.solution}
            </CardTitle>
            {recommendation && (
              <p className="mt-1 text-sm text-slate-500">
                From: {recommendation.title}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className="gap-1 border-slate-200 text-slate-500"
          >
            <Calendar className="size-3.5" aria-hidden />
            {formatSubmittedAt(request.submittedAt)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <Timeline stage={request.stage} />

        {/* Contact details — the commercially useful part: what the admin
            needs to act on this lead, without an email chain. */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Contact details
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <User className="size-4 shrink-0 text-slate-400" aria-hidden />
              <span className="truncate">{request.contactName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <ContactIcon className="size-4 shrink-0 text-slate-400" aria-hidden />
              <span>Prefers {request.preferredContact}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Phone className="size-4 shrink-0 text-slate-400" aria-hidden />
              <span>{request.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Mail className="size-4 shrink-0 text-slate-400" aria-hidden />
              <span className="truncate">{request.email}</span>
            </div>
          </div>
          {request.note && (
            <div className="mt-3 flex items-start gap-2 border-t border-slate-200 pt-3 text-sm text-slate-600">
              <StickyNote
                className="mt-0.5 size-4 shrink-0 text-slate-400"
                aria-hidden
              />
              <span>{request.note}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
    <div>
      <h1 className="text-2xl font-semibold text-midnight sm:text-3xl">
        Quotes &amp; Requests
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Track what you&apos;ve asked CoverSure to help with, from request
        through to activation.
      </p>

      {submittedRequests.length === 0 ? (
        <Card className="mt-8 border-slate-200">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ClipboardList className="size-6" aria-hidden />
            </span>
            <h2 className="text-lg font-semibold text-midnight">
              No requests yet
            </h2>
            <p className="max-w-sm text-sm text-slate-500">
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
