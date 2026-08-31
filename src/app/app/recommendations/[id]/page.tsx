import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { DeterminationTrail } from "@/components/common/DeterminationTrail";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
import { demoCompany } from "@/lib/demo-data";

export interface RecommendationDetailPageProps {
  params: { id: string };
}

/**
 * Recommendation detail (Screen 10) — the "why this matters" deepening step
 * of the highest-priority journey (Assessment -> Recommendation -> Fix with
 * CoverSure). Every section renders directly off the matched recommendation
 * object in demoCompany.recommendations; nothing here is hardcoded copy.
 *
 * Presented inside one PI/D&O `.panel` so the narrative reads as a single
 * professional brief (what matters -> why -> what CoverSure recommends ->
 * what you can do) rather than a stack of separate cards.
 */
export default function RecommendationDetailPage({
  params,
}: RecommendationDetailPageProps) {
  const reco = demoCompany.recommendations.find((r) => r.id === params.id);

  if (!reco) {
    notFound();
  }

  return (
    <div className="cs-narrow px-0">
      {/* Panel */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        {/* Panel head */}
        <div className="px-6 pb-6 pt-7 sm:px-9 sm:pt-8">
          <p className="kicker">Recommendation</p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-4">
              <span
                aria-hidden
                className="select-none pt-1 text-[30px] font-bold leading-none text-electric/25 sm:text-[34px]"
              >
                {reco.index}
              </span>
              <h1 className="h-panel pt-1 text-midnight">{reco.title}</h1>
            </div>
            <PriorityBadge priority={reco.priority} className="mt-1.5" />
          </div>
        </div>

        <div className="divide-y divide-line border-t border-line">
          {/* Why this matters */}
          <section className="px-6 py-6 sm:px-9">
            <h2 className="kicker">Why this matters</h2>
            <p className="mt-2.5 text-base leading-relaxed text-ink/90">
              {reco.why}
            </p>
          </section>

          {/* What we found */}
          <section className="px-6 py-6 sm:px-9">
            <h2 className="kicker">What we found</h2>
            <div className="mt-3 space-y-2.5">
              {reco.found.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-2.5 text-sm"
                >
                  {item.present ? (
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-mint">
                      <Check aria-hidden className="size-3 text-midnight" />
                    </span>
                  ) : (
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#fdecea]">
                      <X aria-hidden className="size-3 text-danger" />
                    </span>
                  )}
                  <span
                    className={
                      item.present ? "text-ink" : "text-muted-ink"
                    }
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* What could be considered */}
          <section className="px-6 py-6 sm:px-9">
            <h2 className="kicker">What could be considered</h2>
            <p className="mt-2.5 text-base leading-relaxed text-ink/90">
              {reco.couldBeConsidered}
            </p>
          </section>

          {/* CoverSure can help */}
          <section className="px-6 py-6 sm:px-9">
            <h2 className="kicker">CoverSure can help</h2>
            <div className="mt-3 rounded-xl border border-[rgba(162,250,163,.45)] bg-[rgba(162,250,163,.14)] px-5 py-4">
              <p className="text-base leading-relaxed text-ink/90">
                {reco.coversureCanHelp}
              </p>
            </div>
          </section>

          {/* Determination trail — quiet transparency affordance, tinted footer */}
          <div className="bg-app-bg/60 px-6 py-5 sm:px-9">
            <DeterminationTrail
              determination={reco.determination}
              recommendationTitle={reco.title}
            />
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
          <Link href={`/app/fix/${reco.id}`}>
            Fix this with CoverSure
            <ArrowRight className="size-4" />
          </Link>
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg">
              Talk to a CoverSure specialist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>We&apos;ll be in touch</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-ink">
              A CoverSure specialist will reach out to talk through the &ldquo;
              {reco.title}&rdquo; recommendation and what could work for your
              business, subject to underwriting and policy terms.
            </p>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8">
        <AssessmentDisclaimer />
      </div>
    </div>
  );
}
