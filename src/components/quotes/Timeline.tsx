import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RequestStage } from "@/lib/types";

const STEPS: { key: RequestStage; label: string }[] = [
  { key: "requirement-identified", label: "Requirement identified" },
  { key: "request-submitted", label: "Request submitted" },
  { key: "options-prepared", label: "Options being prepared" },
  { key: "quote-received", label: "Quote received" },
  { key: "decision", label: "Decision" },
  { key: "activated", label: "Activated" },
];

export interface TimelineProps {
  stage: RequestStage;
  className?: string;
}

/**
 * Workflow tracker for a single request (Screen 14) — the six RequestStage
 * steps in order, with everything up to and including the request's current
 * stage marked done/current and the rest shown as upcoming. Step order and
 * stage semantics come straight from RequestStage (src/lib/types.ts); only
 * the display labels are defined here.
 */
export function Timeline({ stage, className }: TimelineProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === stage);

  return (
    <ol className={cn("flex items-start overflow-x-auto pb-1", className)}>
      {STEPS.map((step, i) => {
        const isCurrent = i === currentIndex;
        const isDone = i < currentIndex;
        const isUpcoming = i > currentIndex;
        const connectorDone = i < currentIndex;

        return (
          <li key={step.key} className="flex shrink-0 items-start">
            <div className="flex w-[6.75rem] flex-col items-center gap-1.5 text-center sm:w-28">
              {isUpcoming ? (
                <Circle className="size-5 shrink-0 text-slate-300" aria-hidden />
              ) : (
                <CheckCircle2
                  className={cn(
                    "size-5 shrink-0",
                    isCurrent ? "text-electric" : "text-royal"
                  )}
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "px-1 text-xs leading-tight",
                  isCurrent
                    ? "font-semibold text-midnight"
                    : isDone
                    ? "text-slate-600"
                    : "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "mt-2.5 h-px w-6 shrink-0 sm:w-9",
                  connectorDone ? "bg-royal" : "bg-slate-200"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
