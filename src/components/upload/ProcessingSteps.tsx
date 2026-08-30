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
    <ul className="space-y-3">
      {steps.map((step, i) => {
        const done = i < completedCount;
        const active = i === completedCount;
        return (
          <li key={step} className="flex items-center gap-3">
            <motion.span
              initial={false}
              animate={{
                backgroundColor: done ? "#1E56FF" : "#E2E8F0",
                scale: active ? 1.08 : 1,
              }}
              transition={{ duration: 0.25 }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            >
              {done && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  <Check className="h-3.5 w-3.5 text-white" aria-hidden />
                </motion.span>
              )}
            </motion.span>
            <span
              className={cn(
                "text-sm",
                done ? "font-medium text-midnight" : "text-slate-500"
              )}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
