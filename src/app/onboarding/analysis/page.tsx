"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  MapPin,
  IndianRupee,
  Users,
  Landmark,
  Package,
  CalendarClock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProvenanceTag } from "@/components/common/ProvenanceTag";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
import { ASSESSMENT_NOTE } from "@/lib/language";
import { demoCompany } from "@/lib/demo-data";

/** Icon per fact label — purely presentational, keyed off profile.facts labels. */
const FACT_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "Annual turnover": IndianRupee,
  Employees: Users,
  "Fixed assets": Landmark,
  Inventory: Package,
  "Years in business": CalendarClock,
};

interface FactCardProps {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}

function FactCard({ label, value, icon: Icon }: FactCardProps) {
  return (
    <Card className="border-slate-200">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-royal/10 text-royal">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <ProvenanceTag kind="FACT" />
          </div>
          <p className="mt-0.5 truncate text-base font-semibold text-midnight">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalysisPage() {
  const { profile } = demoCompany;

  // Industry and location are profile-level facts too (drawn from the
  // documents), just not modelled with a `source` in profile.facts — shown
  // with the same FACT treatment so the grid reads as one consistent picture.
  const headlineFacts: FactCardProps[] = [
    { label: "Industry", value: profile.industry, icon: Building2 },
    { label: "Location", value: profile.location, icon: MapPin },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-royal">
        {profile.name}
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-midnight sm:text-4xl">
        We understand your business
      </h1>
      <p className="mt-3 text-base text-slate-600">
        We&apos;ve put together a picture of {profile.name} from what you
        shared &mdash; here&apos;s what stands out.
      </p>
      <p className="mt-1 text-xs italic text-slate-400">{ASSESSMENT_NOTE}</p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
        className="mt-8 grid grid-cols-2 gap-3"
      >
        {headlineFacts.map((f) => (
          <FactCard key={f.label} {...f} />
        ))}
        {profile.facts.map((f) => (
          <FactCard
            key={f.label}
            label={f.label}
            value={f.value}
            icon={FACT_ICONS[f.label] ?? Building2}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
        className="mt-8"
      >
        <h2 className="text-lg font-semibold text-midnight">What we found</h2>
        <Card className="mt-3 border-slate-200">
          <CardContent className="grid gap-2.5 py-5 sm:grid-cols-2">
            {profile.findings.map((finding) => (
              <div key={finding} className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-electric"
                />
                <span className="text-sm text-slate-700">{finding}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-6">
        <AssessmentDisclaimer />
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          asChild
          size="lg"
          className="h-12 gap-2 bg-electric px-8 text-base text-white shadow-md hover:bg-royal"
        >
          <Link href="/app/protection">
            Continue to your assessment
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
