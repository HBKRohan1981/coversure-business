"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProvenanceTag } from "@/components/common/ProvenanceTag";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
import { ASSESSMENT_NOTE } from "@/lib/language";
import { demoCompany } from "@/lib/demo-data";

interface FactRow {
  label: string;
  value: string;
  source?: string;
}

export default function AnalysisPage() {
  const { profile } = demoCompany;

  // Industry and location are profile-level facts too (drawn from the
  // documents), just not modelled with a `source` in profile.facts — shown
  // as the same FACT rows so the panel reads as one consistent picture.
  const factRows: FactRow[] = [
    { label: "Industry", value: profile.industry },
    { label: "Location", value: profile.location },
    ...profile.facts.map((f) => ({ label: f.label, value: f.value, source: f.source })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <p className="kicker">Business Assessment &middot; {profile.name}</p>
      <h1 className="h-panel mt-2 text-midnight">We understand your business</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-ink">
        We&apos;ve put together a picture of {profile.name} from what you
        shared &mdash; here&apos;s what stands out.
      </p>
      <p className="mt-2 text-[12.5px] italic text-muted-ink">{ASSESSMENT_NOTE}</p>

      {/* Business profile — one fact-card panel, not scattered cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
        className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-soft"
      >
        <div className="border-b border-line px-6 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-royal">
            Business profile
          </p>
        </div>
        <dl className="divide-y divide-line">
          {factRows.map((f) => (
            <div
              key={f.label}
              className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
            >
              <dt className="w-full shrink-0 text-[13.5px] text-muted-ink sm:w-[34%]">
                {f.label}
              </dt>
              <dd className="flex flex-1 flex-wrap items-center justify-between gap-2.5">
                <span className="text-[15px] font-semibold text-midnight">
                  {f.value}
                </span>
                <span className="flex items-center gap-2">
                  <ProvenanceTag kind="FACT" />
                  {f.source && (
                    <span className="text-[12px] text-muted-ink">{f.source}</span>
                  )}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
        className="mt-8"
      >
        <h2 className="text-[15px] font-semibold text-midnight">What we found</h2>
        <Card className="mt-3 rounded-2xl border-line shadow-soft">
          <CardContent className="grid gap-2.5 px-6 py-5 sm:grid-cols-2">
            {profile.findings.map((finding) => (
              <div key={finding} className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-electric"
                />
                <span className="text-[13.5px] text-ink">{finding}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-6">
        <AssessmentDisclaimer />
      </div>

      <div className="mt-8 flex justify-end">
        <Button asChild size="lg" className="gap-2">
          <Link href="/app/portfolio">
            View your Protection Portfolio
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
