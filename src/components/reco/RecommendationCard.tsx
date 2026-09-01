import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/lib/types";

export interface RecommendationCardProps {
  reco: Recommendation;
}

/**
 * Premium recommendation summary card for the recommendations list (and the
 * dashboard's priorities view). PI/D&O `.exp-card` treatment: a high-priority
 * recommendation gets a heavier electric-tinted 2px border plus a small
 * "Priority" flag ribbon so it visually leads the list without any new
 * copy — everything still comes straight off `reco`.
 */
export function RecommendationCard({ reco }: RecommendationCardProps) {
  const isHigh = reco.priority === "high";

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-[18px] p-6 shadow-soft transition-shadow hover:shadow-soft-lg sm:p-7",
        isHigh ? "border-2 border-[rgba(30,86,255,.55)] pt-9 sm:pt-10" : "border-line"
      )}
    >
      {isHigh && (
        <span className="absolute -top-px left-6 rounded-b-[6px] bg-midnight px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[.1em] text-mint sm:left-7">
          Priority
        </span>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className="select-none text-[32px] font-bold leading-none text-electric/25 sm:text-[36px]"
          >
            {reco.index}
          </span>
          <h3 className="pt-1 text-lg font-semibold leading-snug text-midnight">
            {reco.title}
          </h3>
        </div>
        <PriorityBadge priority={reco.priority} className="mt-1.5 shrink-0" />
      </div>

      <p className="mt-4 text-sm text-ink/80">{reco.why}</p>

      <p className="mt-3 text-sm font-medium text-royal">
        Recommended: {reco.recommended}
      </p>

      <Button asChild className="mt-5">
        <Link href={`/app/recommendations/${reco.id}`}>
          View details
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </Card>
  );
}
