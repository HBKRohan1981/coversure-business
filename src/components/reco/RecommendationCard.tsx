import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import type { Recommendation } from "@/lib/types";

export interface RecommendationCardProps {
  reco: Recommendation;
}

/**
 * Premium recommendation summary card for the recommendations list.
 * Index badge + title + priority, the "why", the recommended solution,
 * and a CTA into the recommendation detail page.
 */
export function RecommendationCard({ reco }: RecommendationCardProps) {
  return (
    <Card className="flex flex-col gap-4 border-slate-200 p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-midnight text-sm font-semibold text-white">
            {reco.index}
          </span>
          <h3 className="pt-1.5 font-semibold leading-snug text-midnight">
            {reco.title}
          </h3>
        </div>
        <PriorityBadge priority={reco.priority} className="mt-1.5 shrink-0" />
      </div>

      <p className="text-sm text-slate-600">{reco.why}</p>

      <p className="text-sm font-medium text-royal">
        Recommended: {reco.recommended}
      </p>

      <Button asChild className="mt-1 self-start bg-electric hover:bg-electric/90">
        <Link href={`/app/recommendations/${reco.id}`}>
          Explore Solution
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </Card>
  );
}
