import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreDial } from "@/components/score/ScoreDial";
import { BenefitMatrix } from "@/components/people/BenefitMatrix";
import { AssessmentDisclaimer } from "@/components/common/AssessmentDisclaimer";
import { demoCompany } from "@/lib/demo-data";

/**
 * People & Benefits (Screen 8) — second pillar of the CoverSure story:
 * "CoverSure understands my people" -> "how can I better protect and look
 * after my people?" Converges into Recommendations -> CoverSure can help,
 * same as Business Protection. All figures come from demoCompany.benefits;
 * nothing here is hardcoded.
 */
export default function PeoplePage() {
  const { benefits } = demoCompany;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight sm:text-3xl">
        Look after your people
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Meaningful employee benefits don&apos;t have to be complicated.
      </p>

      {/* Header stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Users aria-hidden className="size-5 text-royal" />
            <span className="text-3xl font-semibold text-midnight">
              {benefits.employees}
            </span>
            <span className="text-sm text-slate-500">Employees</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
            <ScoreDial value={benefits.peopleScore} size={112} />
            <span className="text-sm text-slate-500">
              Employee Protection Score
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
            <ScoreDial value={benefits.benefitsScore} size={112} />
            <span className="text-sm text-slate-500">Benefits Score</span>
          </CardContent>
        </Card>
      </div>

      <p className="mt-4 max-w-2xl text-sm text-slate-600">
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
  );
}
