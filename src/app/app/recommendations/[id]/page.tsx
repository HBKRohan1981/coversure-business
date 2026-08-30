import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
 */
export default function RecommendationDetailPage({
  params,
}: RecommendationDetailPageProps) {
  const reco = demoCompany.recommendations.find((r) => r.id === params.id);

  if (!reco) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-midnight text-sm font-semibold text-white">
            {reco.index}
          </span>
          <h1 className="pt-1 text-2xl font-semibold leading-snug text-midnight sm:text-3xl">
            {reco.title}
          </h1>
        </div>
        <PriorityBadge priority={reco.priority} className="mt-1.5" />
      </div>

      {/* Why this matters */}
      <section className="mt-8 space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Why this matters
        </h2>
        <p className="text-base text-slate-700">{reco.why}</p>
      </section>

      {/* What we found */}
      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          What we found
        </h2>
        <Card className="border-slate-200">
          <CardContent className="space-y-2.5 py-5">
            {reco.found.map((item) => (
              <div key={item.label} className="flex items-start gap-2.5 text-sm">
                {item.present ? (
                  <CheckCircle2
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-royal"
                  />
                ) : (
                  <XCircle
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-slate-400"
                  />
                )}
                <span
                  className={item.present ? "text-slate-700" : "text-slate-500"}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* What could be considered */}
      <section className="mt-8 space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          What could be considered
        </h2>
        <p className="text-base text-slate-700">{reco.couldBeConsidered}</p>
      </section>

      {/* CoverSure can help */}
      <section className="mt-8 space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          CoverSure can help
        </h2>
        <Card className="border-electric/20 bg-electric/5">
          <CardContent className="py-5">
            <p className="text-base text-slate-700">{reco.coversureCanHelp}</p>
          </CardContent>
        </Card>
      </section>

      {/* Determination trail */}
      <div className="mt-6">
        <DeterminationTrail
          determination={reco.determination}
          recommendationTitle={reco.title}
        />
      </div>

      {/* CTAs */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button asChild size="lg" className="bg-electric hover:bg-electric/90">
          <Link href={`/app/fix/${reco.id}`}>
            Fix this with CoverSure
            <ArrowRight className="size-4" />
          </Link>
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="border-royal text-royal hover:bg-royal/5 hover:text-royal"
            >
              Talk to a CoverSure specialist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>We&apos;ll be in touch</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600">
              A CoverSure specialist will reach out to talk through{" "}
              {reco.title.toLowerCase()} and what could work for your business,
              subject to underwriting and policy terms.
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
