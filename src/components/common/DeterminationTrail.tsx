"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProvenanceTag } from "@/components/common/ProvenanceTag";
import { EvidenceCallout } from "@/components/common/EvidenceCallout";
import type { Determination } from "@/lib/types";

export interface DeterminationTrailProps {
  determination: Determination;
  triggerLabel?: string;
  recommendationTitle?: string;
}

/**
 * "How did we determine this?" transparency panel.
 *
 * Renders the Facts -> Evidence -> Assessment -> Recommendation trail
 * behind a subtle text trigger, in the PI/D&O provenance/reasoning
 * treatment (source pills + evidence callouts) rather than a generic
 * dialog/debug log. Core product feature — surfaces exactly what is on
 * the `determination` object, nothing more, nothing fabricated.
 */
export function DeterminationTrail({
  determination,
  triggerLabel = "How did we determine this?",
  recommendationTitle,
}: DeterminationTrailProps) {
  const { facts, evidence, assessment, recommendationRef } = determination;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-[13.5px] font-medium text-electric underline-offset-2 hover:underline"
        >
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg gap-0 rounded-2xl border-line p-0 shadow-soft-lg">
        <DialogHeader className="space-y-1 border-b border-line px-7 pb-5 pt-7 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-electric">
            Determination trail
          </p>
          <DialogTitle className="text-lg font-semibold text-midnight">
            How we determined this
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-7 py-6">
          <div className="space-y-6">
            {/* Facts */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2">
                <ProvenanceTag kind="FACT" />
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-muted-ink">
                  Facts
                </h3>
              </div>
              <ul className="space-y-1.5">
                {facts.map((fact, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[14px] leading-relaxed text-ink"
                  >
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-line" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="border-t border-line" />

            {/* Evidence */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2">
                <ProvenanceTag kind="FACT" />
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-muted-ink">
                  Evidence
                </h3>
              </div>
              <div className="space-y-2">
                {evidence.map((item, i) => (
                  <EvidenceCallout key={i}>{item}</EvidenceCallout>
                ))}
              </div>
            </section>

            <div className="border-t border-line" />

            {/* Assessment */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2">
                <ProvenanceTag kind="ASSESSMENT" />
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-muted-ink">
                  Assessment
                </h3>
              </div>
              <p className="text-[14px] leading-relaxed text-ink">{assessment}</p>
            </section>

            {recommendationRef && (
              <>
                <div className="border-t border-line" />
                <section className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <ProvenanceTag kind="RECOMMENDATION" />
                    <h3 className="text-[12px] font-semibold uppercase tracking-wide text-muted-ink">
                      Recommendation
                    </h3>
                  </div>
                  <Link
                    href={`/app/recommendations/${recommendationRef}`}
                    className="group flex items-center justify-between rounded-lg border border-line px-3.5 py-2.5 text-[14px] font-medium text-royal transition-colors hover:bg-[rgba(0,50,200,.06)]"
                  >
                    <span>{recommendationTitle ?? "View recommendation"}</span>
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-royal transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </section>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
