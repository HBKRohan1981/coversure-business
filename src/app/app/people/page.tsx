"use client";

import { motion } from "framer-motion";
import { ScoreBand } from "@/components/score/ScoreBand";
import { BenefitMatrix } from "@/components/people/BenefitMatrix";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
import { demoCompany } from "@/lib/demo-data";

/**
 * People & Benefits (Screen 8) — second pillar of the CoverSure story:
 * "CoverSure understands my people" -> "how can I better protect and look
 * after my people?" Converges into Recommendations -> CoverSure can help,
 * same as Business Protection. All figures come from demoCompany.benefits;
 * nothing here is hardcoded.
 *
 * Presented with the same authoritative ScoreBand treatment used on
 * Business Protection / Overview, so this page visibly belongs to the same
 * CoverSure Business family rather than reading as a separate HR/benefits
 * product.
 */
export default function PeoplePage() {
  const { benefits } = demoCompany;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="cs-container px-0">
        <p className="kicker">People &amp; Benefits</p>
        <h1 className="h-section mt-1 text-midnight">Look after your people</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-ink">
          Meaningful employee benefits don&apos;t have to be complicated.
        </p>

        {/* Employee Protection Score + Benefits Score — the same
            authoritative score-band treatment as Business Protection /
            Overview, side by side on wider screens. */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <ScoreBand
            value={benefits.peopleScore}
            label="People Score"
            title="Employee Protection Score"
            caption={`Across ${benefits.employees} employees, based on the information reviewed.`}
          />
          <ScoreBand
            value={benefits.benefitsScore}
            label="Benefits Score"
            title="Benefits Score"
            caption="How broad your current employee benefits are, based on what's been identified in the documents reviewed."
          />
        </div>

        <p className="mt-6 max-w-2xl text-sm text-muted-ink">
          Your employees have personal accident protection in place, and there
          may be an opportunity to broaden benefits and health support based on
          the information reviewed.
        </p>

        {/* Already provided / Potential opportunities */}
        <div className="mt-12">
          <BenefitMatrix items={benefits.items} />
        </div>

        <div className="mt-8">
          <AssessmentDisclaimer />
        </div>
      </div>
    </motion.div>
  );
}
