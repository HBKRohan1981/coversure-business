import { cn } from "@/lib/utils";

export type MeterLevel = 1 | 2 | 3 | 4;

/**
 * Desaturated 4-step severity palette (PI/D&O reference: risk meter).
 * Fixed, restrained colour per step — colour as signal, not decoration.
 */
export const METER_COLOR: Record<MeterLevel, string> = {
  1: "#7fd6a0",
  2: "#f2c14e",
  3: "#ef9645",
  4: "#e5484d",
};

const LEVELS: MeterLevel[] = [1, 2, 3, 4];

export interface MeterProps {
  /** How many of the 4 segments are lit, 1 (low) .. 4 (high). */
  level: MeterLevel;
  /** Show a small uppercase "Low ... High" label row beneath the segments. */
  showLabels?: boolean;
  className?: string;
}

/**
 * 4-segment severity meter (shared — risk severity). Each segment has a
 * fixed, desaturated colour; segments up to `level` are lit with that
 * segment's own colour, the rest stay an unlit hairline pill. Restrained by
 * design: no glow, no saturation ramp beyond the reference palette.
 */
export function Meter({ level, showLabels = false, className }: MeterProps) {
  return (
    <div className={cn("inline-flex w-[92px] flex-col gap-1.5", className)}>
      <div className="flex items-center gap-1" role="img" aria-label={`Severity level ${level} of 4`}>
        {LEVELS.map((seg) => (
          <span
            key={seg}
            aria-hidden
            className={cn("h-1.5 flex-1 rounded-full", seg > level && "bg-line")}
            style={seg <= level ? { backgroundColor: METER_COLOR[seg] } : undefined}
          />
        ))}
      </div>
      {showLabels ? (
        <div className="flex items-center justify-between text-[9.5px] font-semibold uppercase tracking-wider text-muted-ink">
          <span>Low</span>
          <span>High</span>
        </div>
      ) : null}
    </div>
  );
}
