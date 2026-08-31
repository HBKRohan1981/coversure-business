import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Provenance } from "@/lib/types";

/**
 * PI/D&O "source pill" treatment (see .superpowers/sdd/pido-design-reference.md,
 * "Provenance / reasoning"). Mapping kept to the product's 3 kinds:
 * FACT -> src-doc (royal on royal-tint), ASSESSMENT -> src-ai (amber on
 * amber-tint, an inference), RECOMMENDATION -> src-user (mint-tinted).
 */
const provenanceTagVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap",
  {
    variants: {
      kind: {
        FACT: "bg-[rgba(30,86,255,.12)] text-royal",
        ASSESSMENT: "bg-[#fff4e5] text-amber",
        RECOMMENDATION: "bg-[rgba(162,250,163,.4)] text-[#14532d]",
      } satisfies Record<Provenance, string>,
    },
    defaultVariants: {
      kind: "FACT",
    },
  }
);

export interface ProvenanceTagProps extends VariantProps<typeof provenanceTagVariants> {
  kind: Provenance;
  className?: string;
}

/** Small uppercase source pill marking a piece of copy as FACT / ASSESSMENT / RECOMMENDATION. */
export function ProvenanceTag({ kind, className }: ProvenanceTagProps) {
  return (
    <span className={cn(provenanceTagVariants({ kind }), className)}>
      {kind}
    </span>
  );
}
