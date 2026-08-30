"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-midnight sm:text-4xl">
        Let&apos;s understand your business
      </h1>
      <p className="mt-3 text-base text-slate-600">
        Tell us a little about your business. You can upload your documents
        and we&apos;ll do the heavy lifting.
      </p>

      <Card className="mt-8 border-slate-200">
        <CardHeader className="pb-0" />
        <CardContent className="pt-6">
          <form onSubmit={handleContinue} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="turnover">Annual turnover</Label>
                <Input
                  id="turnover"
                  value={turnover}
                  onChange={(e) => setTurnover(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employees">Number of employees</Label>
                <Input
                  id="employees"
                  type="number"
                  inputMode="numeric"
                  value={employees}
                  onChange={(e) => setEmployees(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/onboarding/upload"
                className="text-sm font-medium text-royal underline-offset-4 hover:underline"
              >
                Upload your documents instead
              </Link>
              <Button
                type="submit"
                size="lg"
                className="h-12 gap-2 bg-electric px-8 text-base text-white shadow-md hover:bg-royal sm:w-auto"
              >
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
