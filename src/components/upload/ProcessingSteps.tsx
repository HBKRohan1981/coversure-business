"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProcessingStepsProps {
  steps: string[];
  onComplete: () => void;
}

/** Fixed tick interval — deterministic, no Math.random / Date.now(). */
const STEP_INTERVAL_MS = 700;

/**
 * Sequential checklist: each step ticks (checkmark fades/scales in) roughly
 * STEP_INTERVAL_MS after the previous one. `onComplete` fires exactly once,
 * after the last step ticks.
 */
export function ProcessingSteps({ steps, onComplete }: ProcessingStepsProps) {
  const [completedCount, setCompletedCount] = useState(0);
  const firedRef = useRef(false);

  // Advance one step at a time on a fixed timer.
  useEffect(() => {
    if (completedCount >= steps.length) return;
    const timer = setTimeout(() => {
      setCompletedCount((c) => c + 1);
    }, STEP_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [completedCount, steps.length]);

  // Fire onComplete exactly once, when the last step ticks.
  useEffect(() => {
    if (steps.length > 0 && completedCount === steps.length && !firedRef.current) {
      firedRef.current = true;
      onComplete();
    }
  }, [completedCount, steps.length, onComplete]);

  return (
    <ul className="space-y-4">
      {steps.map((step, i) => {
        const done = i < completedCount;
        const active = i === completedCount;
        return (
          <li key={step} className="flex items-center gap-3.5">
            <span className="flex size-6 shrink-0 items-center justify-center">
              {done ? (
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex size-6 items-center justify-center rounded-full bg-electric"
                >
                  <Check className="h-3.5 w-3.5 text-white" aria-hidden />
                </motion.span>
              ) : active ? (
                <span
                  aria-hidden
                  className="size-5 animate-spin rounded-full border-2 border-[rgba(30,86,255,.18)] border-t-electric"
                />
              ) : (
                <span aria-hidden className="size-2 rounded-full bg-line" />
              )}
            </span>
            <span
              className={cn(
                "text-[14.5px] transition-colors",
                done && "font-medium text-midnight",
                active && "font-medium text-ink",
                !done && !active && "text-muted-ink"
              )}
            >
              {active && (
                <span aria-hidden className="mr-1.5 font-semibold text-electric">
                  &rarr;
                </span>
              )}
              {step}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
