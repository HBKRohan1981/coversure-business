import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill } from "@/components/coverage/StatusPill";
import { cn } from "@/lib/utils";
import type { CoverageLine } from "@/lib/types";

export interface CoverageTableProps {
  lines: CoverageLine[];
}

/**
 * Coverage summary table: Protection | Current status | Cover identified.
 * PI/D&O table look — midnight header, hairline rows, alternating tint.
 * Status is rendered via StatusPill (careful-language labels from
 * STATUS_LABELS); this component adds no wording of its own.
 */
export function CoverageTable({ lines }: CoverageTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line shadow-soft">
      <Table>
        <TableHeader>
          <TableRow className="border-line hover:bg-transparent">
            <TableHead className="h-auto bg-midnight py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
              Protection
            </TableHead>
            <TableHead className="h-auto bg-midnight py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
              Current status
            </TableHead>
            <TableHead className="h-auto bg-midnight py-3 text-[12px] font-semibold uppercase tracking-wide text-white">
              Cover identified
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line, i) => (
            <TableRow
              key={line.key}
              className={cn(
                "border-line hover:bg-transparent",
                i % 2 === 1 && "bg-app-bg"
              )}
            >
              <TableCell className="font-semibold text-midnight">
                {line.label}
              </TableCell>
              <TableCell>
                <StatusPill status={line.status} />
              </TableCell>
              <TableCell className="text-muted-ink">
                {line.coverIdentified}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
