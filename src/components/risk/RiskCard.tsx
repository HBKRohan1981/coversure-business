"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Meter, METER_COLOR, type MeterLevel } from "@/components/score/Meter";
import { DeterminationTrail } from "@/components/common/DeterminationTrail";
import { cn } from "@/lib/utils";
import { SEVERITY_LABELS } from "@/lib/language";
import type { Risk, Severity } from "@/lib/types";

export interface RiskCardProps {
  risk: Risk;
}

/**
 * Severity -> Meter level. 1 = relatively well protected, 4 = high
 * attention. Visual mapping only — does not touch severity/risk logic.
 */
const SEVERITY_LEVEL: Record<Severity, MeterLevel> = {
  good: 1,
  review: 2,
  attention: 3,
  high: 4,
};

/**
 * Expandable risk card. Collapsed: severity meter + title + short summary.
 * Expanded: why we flagged this / evidence / what you can do, plus the
 * determination trail. Simplest expand/collapse (useState + chevron) per
 * the D4 brief — no new shadcn primitive.
 */
export function RiskCard({ risk }: RiskCardProps) {
  const [open, setOpen] = useState(false);
  const level = SEVERITY_LEVEL[risk.severity];
  const color = METER_COLOR[level];

  return (
    <Card className="overflow-hidden rounded-[18px] border-line shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-4 p-4 text-left"
      >
        <span className="flex shrink-0 flex-col items-start gap-1.5 pt-0.5">
          <Meter level={level} />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color }}
          >
            {SEVERITY_LABELS[risk.severity]}
          </span>
        </span>
        <span className="flex-1">
          <span className="block font-semibold text-midnight">
            {risk.title}
          </span>
          <span className="mt-1 block text-sm text-ink/80">{risk.why}</span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-electric transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="space-y-4 px-4 pb-4">
          <Separator />

          <section className="space-y-1.5">
            <h4 className="text-sm font-semibold text-midnight">
              Why we flagged this
            </h4>
            <p className="text-sm text-ink/80">{risk.why}</p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-semibold text-midnight">Evidence</h4>
            <ul className="space-y-1.5">
              {risk.evidence.map((item, i) => (
                <li
                  key={i}
                  className="rounded-lg border-l-2 border-electric/35 bg-app-bg px-3 py-2 text-[12.5px] text-muted-ink"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-semibold text-midnight">
              What you can do
            </h4>
            <p className="text-sm text-ink/80">{risk.whatYouCanDo}</p>
          </section>

          <DeterminationTrail determination={risk.determination} />
        </div>
      )}
    </Card>
  );
}
