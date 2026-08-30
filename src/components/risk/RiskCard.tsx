"use client";

import { useState, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DeterminationTrail } from "@/components/common/DeterminationTrail";
import { cn } from "@/lib/utils";
import { SEVERITY_LABELS } from "@/lib/language";
import { TONE_COLOR } from "@/lib/score";
import type { Risk, Severity } from "@/lib/types";

export interface RiskCardProps {
  risk: Risk;
}

/** Which semantic tone bucket each risk severity renders in. */
type SeverityTone = "good" | "attention" | "high" | "neutral";

const SEVERITY_TONE: Record<Severity, SeverityTone> = {
  high: "high",
  attention: "attention",
  review: "neutral",
  good: "good",
};

function toneColor(tone: SeverityTone): string {
  if (tone === "neutral") return "#64748B"; // slate-500
  return TONE_COLOR[tone];
}

/**
 * Expandable risk card. Collapsed: severity dot + title + short summary.
 * Expanded: why we flagged this / evidence / what you can do, plus the
 * determination trail. Simplest expand/collapse (useState + chevron) per
 * the D4 brief — no new shadcn primitive.
 */
export function RiskCard({ risk }: RiskCardProps) {
  const [open, setOpen] = useState(false);
  const color = toneColor(SEVERITY_TONE[risk.severity]);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <span
          aria-hidden
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="flex-1">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-midnight">{risk.title}</span>
            <span
              className="rounded-full border px-2 py-0.5 text-xs font-medium"
              style={severityBadgeStyle(color)}
            >
              {SEVERITY_LABELS[risk.severity]}
            </span>
          </span>
          <span className="mt-1 block text-sm text-slate-600">
            {risk.why}
          </span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform",
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
            <p className="text-sm text-slate-600">{risk.why}</p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-semibold text-midnight">Evidence</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
              {risk.evidence.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-semibold text-midnight">
              What you can do
            </h4>
            <p className="text-sm text-slate-600">{risk.whatYouCanDo}</p>
          </section>

          <DeterminationTrail determination={risk.determination} />
        </div>
      )}
    </Card>
  );
}

function severityBadgeStyle(hex: string): CSSProperties {
  return {
    backgroundColor: `${hex}1F`, // ~12% tint
    color: hex,
    borderColor: `${hex}4D`, // ~30% tint
  };
}
