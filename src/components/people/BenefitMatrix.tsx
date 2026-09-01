import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BenefitItem } from "@/lib/types";

export interface BenefitMatrixProps {
  items: BenefitItem[];
  /** Where "Secure with CoverSure" leads — the employee recommendation convergence. */
  recommendationHref?: string;
}

const CATEGORY_ORDER: BenefitItem["category"][] = [
  "Protection",
  "Health",
  "Wellbeing",
  "Family",
];

interface OpportunityCopy {
  notIdentified: string;
  why: string;
}

/**
 * Concise, benefit-specific "why CoverSure recommends this" copy for each
 * opportunity item in demoCompany.benefits.items. UI content, not part of
 * the dataset — kept brief, warm and non-absolute per the approved language
 * rules (src/lib/language.ts).
 */
const OPPORTUNITY_COPY: Record<string, OpportunityCopy> = {
  "Group Health": {
    notIdentified: "No group health benefit was identified in the information reviewed.",
    why: "Provides broader health protection for employees and their families, beyond personal accident cover alone.",
  },
  "Doctor consultations": {
    notIdentified: "No provision for doctor consultations was identified.",
    why: "Gives employees faster, easier access to a doctor when they need one.",
  },
  "Specialist consultations": {
    notIdentified: "No provision for specialist consultations was identified.",
    why: "Helps employees get timely specialist advice for concerns that need more than a general check-up.",
  },
  "Diagnostics": {
    notIdentified: "No diagnostics benefit was identified.",
    why: "Makes routine tests and scans easier to access, supporting earlier attention and peace of mind.",
  },
  "Medicines": {
    notIdentified: "No medicine benefit was identified.",
    why: "Can ease the everyday cost of prescribed medicines for employees and their families.",
  },
  "Nutrition": {
    notIdentified: "No nutrition support was identified.",
    why: "Can help employees build healthier everyday habits, supporting longer-term wellbeing.",
  },
  "Preventive health": {
    notIdentified: "No preventive health support was identified.",
    why: "Encourages regular check-ups that can help catch potential health concerns early.",
  },
  "Wellness support": {
    notIdentified: "No wellness support was identified.",
    why: "Supports day-to-day mental and physical wellbeing, which can help with morale and retention.",
  },
  "Family health support": {
    notIdentified: "No family health support was identified.",
    why: "Extends health support to employees' families, who often matter to them as much as their own cover.",
  },
  "Family benefits": {
    notIdentified: "No family benefits were identified.",
    why: "Recognises employees' families as part of the picture, which can be as meaningful as the cover itself.",
  },
};

const DEFAULT_COPY: OpportunityCopy = {
  notIdentified: "This wasn't identified in the information reviewed.",
  why: "Could potentially help broaden the protection and support available to your employees.",
};

function groupByCategory(items: BenefitItem[]): Partial<Record<BenefitItem["category"], BenefitItem[]>> {
  const grouped: Partial<Record<BenefitItem["category"], BenefitItem[]>> = {};
  for (const item of items) {
    (grouped[item.category] ??= []).push(item);
  }
  return grouped;
}

/**
 * Reusable "what's provided vs what could help" matrix for the People &
 * Benefits screen, restyled to the same PI/D&O visual family as Business
 * Protection: "Already provided" reads as a restrained mint-check list
 * inside one hairline-grouped panel (de-cardified, per the coverage/category
 * panels elsewhere); "Potential opportunities" keeps a card per item — each
 * carries its own "why" and a CTA into the employee recommendation
 * convergence — since that richer content benefits from a card boundary.
 */
export function BenefitMatrix({
  items,
  recommendationHref = "/app/recommendations/reco-employee",
}: BenefitMatrixProps) {
  const provided = items.filter((item) => item.provided);
  const opportunities = items.filter((item) => !item.provided);
  const providedByCategory = groupByCategory(provided);
  const opportunitiesByCategory = groupByCategory(opportunities);
  const providedCategories = CATEGORY_ORDER.filter(
    (category) => providedByCategory[category]?.length
  );
  const opportunityCategories = CATEGORY_ORDER.filter(
    (category) => opportunitiesByCategory[category]?.length
  );

  return (
    <div className="space-y-12">
      {/* Already provided */}
      <section>
        <p className="kicker">Already provided</p>
        <h2 className="mt-1 text-lg font-semibold text-midnight sm:text-xl">
          What&apos;s already in place
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-ink">
          Benefits identified in the information reviewed for your employees today.
        </p>

        <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
          <div className="divide-y divide-line">
            {providedCategories.map((category) => (
              <div key={category} className="px-6 py-5 sm:px-8">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-ink">
                  {category}
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {providedByCategory[category]!.map((item) => (
                    <li key={item.label} className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-mint"
                      >
                        <Check className="size-3 text-midnight" strokeWidth={3} />
                      </span>
                      <span className="text-sm font-medium text-ink">
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Potential opportunities */}
      <section>
        <p className="kicker">Potential opportunities</p>
        <h2 className="mt-1 text-lg font-semibold text-midnight sm:text-xl">
          Where you could broaden support
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-ink">
          Areas that may be worth exploring to look after your people a little further.
        </p>

        <div className="mt-6 space-y-8">
          {opportunityCategories.map((category) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-ink">
                {category}
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {opportunitiesByCategory[category]!.map((item) => {
                  const copy = OPPORTUNITY_COPY[item.label] ?? DEFAULT_COPY;
                  return (
                    <Card
                      key={item.label}
                      className="flex flex-col p-5 transition-shadow hover:shadow-soft-lg"
                    >
                      <h4 className="font-semibold text-midnight">{item.label}</h4>
                      <p className="mt-1.5 text-sm text-muted-ink">
                        {copy.notIdentified}
                      </p>
                      <p className="mt-3 text-sm text-ink/80">
                        <span className="font-medium text-midnight">
                          Why consider it:{" "}
                        </span>
                        {copy.why}
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-4 gap-2 self-start border-royal text-royal hover:bg-royal/5 hover:text-royal"
                      >
                        <Link href={recommendationHref}>
                          Secure with CoverSure
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
