import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill } from "@/components/coverage/StatusPill";
import type { CoverageLine } from "@/lib/types";

export interface CoverageTableProps {
  lines: CoverageLine[];
}

/**
 * Coverage summary table: Protection | Current status | Cover identified.
 * Status is rendered via StatusPill (careful-language labels from
 * STATUS_LABELS); this component adds no wording of its own.
 */
export function CoverageTable({ lines }: CoverageTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Protection</TableHead>
          <TableHead>Current status</TableHead>
          <TableHead>Cover identified</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line) => (
          <TableRow key={line.key}>
            <TableCell className="font-medium text-midnight">
              {line.label}
            </TableCell>
            <TableCell>
              <StatusPill status={line.status} />
            </TableCell>
            <TableCell className="text-slate-600">
              {line.coverIdentified}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
