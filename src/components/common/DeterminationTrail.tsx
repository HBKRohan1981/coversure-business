"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProvenanceTag } from "@/components/common/ProvenanceTag";
import type { Determination } from "@/lib/types";

export interface DeterminationTrailProps {
  determination: Determination;
  triggerLabel?: string;
  recommendationTitle?: string;
}

/**
 * "How did we determine this?" transparency panel.
 * Renders the Facts -> Evidence -> Assessment -> Recommendation trail behind
 * a subtle text trigger. Core product feature — surfaces exactly what is on
 * the `determination` object, nothing more.
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
          className="text-electric text-sm underline-offset-2 hover:underline"
        >
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>How we determined this</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-2">
            <ProvenanceTag kind="FACT" />
            <h3 className="text-sm font-semibold text-midnight">Facts</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
              {facts.map((fact, i) => (
                <li key={i}>{fact}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <ProvenanceTag kind="FACT" />
            <h3 className="text-sm font-semibold text-midnight">Evidence</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
              {evidence.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <ProvenanceTag kind="ASSESSMENT" />
            <h3 className="text-sm font-semibold text-midnight">Assessment</h3>
            <p className="text-sm text-slate-600">{assessment}</p>
          </section>

          {recommendationRef && (
            <section className="space-y-2 border-t border-slate-100 pt-4">
              <ProvenanceTag kind="RECOMMENDATION" />
              <h3 className="text-sm font-semibold text-midnight">
                Recommendation
              </h3>
              <Link
                href={`/app/recommendations/${recommendationRef}`}
                className="text-electric text-sm underline-offset-2 hover:underline"
              >
                {recommendationTitle ?? "View recommendation"}
              </Link>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
