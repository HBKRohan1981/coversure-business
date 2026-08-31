"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { demoCompany } from "@/lib/demo-data";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile } = demoCompany;

  const [businessName, setBusinessName] = useState(profile.name);
  const [industry, setIndustry] = useState(profile.industry);
  const [location, setLocation] = useState(profile.location);
  const [turnover, setTurnover] = useState(profile.turnover);
  const [employees, setEmployees] = useState(String(profile.employees));

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    router.push("/onboarding/upload");
  }

  const fieldLabel = "text-[13.5px] font-medium text-midnight";

  return (
    <div className="cs-form">
      <p className="kicker">Business Assessment</p>
      <h1 className="h-panel mt-2 text-midnight">
        Let&apos;s understand your business
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-ink">
        Tell us a little about your business. You can upload your documents
        and we&apos;ll do the heavy lifting.
      </p>

      <Card className="mt-8 rounded-2xl border-line shadow-soft">
        <CardContent className="px-[30px] py-[30px] sm:px-[34px] sm:py-[34px]">
          <form onSubmit={handleContinue} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="businessName" className={fieldLabel}>
                Business name
              </Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry" className={fieldLabel}>
                  Industry
                </Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className={fieldLabel}>
                  Location
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="turnover" className={fieldLabel}>
                  Annual turnover
                </Label>
                <Input
                  id="turnover"
                  value={turnover}
                  onChange={(e) => setTurnover(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employees" className={fieldLabel}>
                  Number of employees
                </Label>
                <Input
                  id="employees"
                  type="number"
                  inputMode="numeric"
                  value={employees}
                  onChange={(e) => setEmployees(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/onboarding/upload"
                className="text-sm font-medium text-royal underline-offset-4 hover:underline"
              >
                Upload your documents instead
              </Link>
              <Button type="submit" size="lg" className="gap-2 sm:w-auto">
                Continue
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
