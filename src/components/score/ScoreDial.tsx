"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";
import { scoreTone } from "@/lib/score";

const TONE_COLOR: Record<ReturnType<typeof scoreTone>, string> = {
  good: "#4FBF6B", // restrained emerald/mint tone
  attention: "#D69A2D", // restrained amber
  high: "#C24545", // restrained red
};

export interface ScoreDialProps {
  value: number;
  max?: number;
  label?: string;
  size?: number;
}

export function ScoreDial({ value, max = 100, label, size = 160 }: ScoreDialProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const tone = scoreTone(clamped);
  const color = TONE_COLOR[tone];

  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, clamped, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [clamped]);

  const strokeWidth = Math.max(8, size * 0.075);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = clamped / max;
  const dashOffset = circumference * (1 - fraction);
  const center = size / 2;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#001965"
          strokeOpacity={0.1}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-midnight font-semibold" style={{ fontSize: size * 0.28 }}>
          {display}
        </span>
        {label ? (
          <span className="text-muted-foreground text-xs mt-0.5">{label}</span>
        ) : null}
      </div>
    </div>
  );
}
