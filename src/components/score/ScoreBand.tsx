import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ScoreBandProps {
  value: number;
  max?: number;
  /** Small uppercase label under the number. Defaults to "Out of {max}". */
  label?: string;
  title?: string;
  caption?: string;
  children?: ReactNode;
  className?: string;
}

const SIZE = 132;
const STROKE = 11;

/**
 * Authoritative dark score band — donut ring on a midnight -> royal
 * gradient, big white number + mint label, with a title/caption slot on the
 * right. Shared "hero" moment for a score, per the PI/D&O reference
 * (`.gap-hero`): AUTHORITATIVE, not a colourful gauge. Presentational only —
 * `value`/`max` only drive ring geometry, no score logic lives here.
 */
export function ScoreBand({
  value,
  max = 100,
  label,
  title,
  caption,
  children,
  className,
}: ScoreBandProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = max > 0 ? clamped / max : 0;
  const dashOffset = circumference * (1 - fraction);
  const center = SIZE / 2;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-8 rounded-2xl bg-gradient-to-br from-midnight to-royal p-[34px] text-white shadow-soft-lg sm:flex-row",
        className
      )}
    >
      <div
        className="relative inline-flex shrink-0 items-center justify-center"
        style={{ width: SIZE, height: SIZE }}
      >
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.18}
            strokeWidth={STROKE}
            className="text-white"
          />
          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="text-mint transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[30px] font-bold leading-none text-white">
            {clamped}
          </span>
          <span className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-mint">
            {label ?? `Out of ${max}`}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        {title ? (
          <h3 className="text-lg font-semibold text-white sm:text-xl">
            {title}
          </h3>
        ) : null}
        {caption ? (
          <p className={cn("text-sm text-white/80", title && "mt-1.5")}>
            {caption}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
