import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Provenance } from "@/lib/types";

const provenanceTagVariants = cva(
  "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap",
  {
    variants: {
      kind: {
        FACT: "bg-slate-100 text-slate-600 border-slate-200",
        ASSESSMENT: "bg-royal/10 text-royal border-royal/20",
        RECOMMENDATION: "bg-mint/20 text-emerald-700 border-mint/50",
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

/** Small uppercase tag marking a piece of copy as FACT / ASSESSMENT / RECOMMENDATION. */
export function ProvenanceTag({ kind, className }: ProvenanceTagProps) {
  return (
    <Badge variant="outline" className={cn(provenanceTagVariants({ kind }), className)}>
      {kind}
    </Badge>
  );
}
