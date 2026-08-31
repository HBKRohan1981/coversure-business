import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EvidenceCalloutProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

/**
 * Signature PI/D&O evidence block: electric left-border callout on the app
 * background. See .superpowers/sdd/pido-design-reference.md, "Provenance /
 * reasoning" -> `.evidence`. Purely presentational — renders whatever
 * content it is given, no data of its own.
 */
export function EvidenceCallout({ children, label, className }: EvidenceCalloutProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-l-2 border-l-[rgba(30,86,255,.35)] bg-app-bg px-[11px] py-2 text-[12.2px] text-muted-ink",
        className
      )}
    >
      {label && <b className="font-semibold text-midnight">{label} </b>}
      {children}
    </div>
  );
}
