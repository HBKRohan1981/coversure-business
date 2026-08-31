"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

interface JourneyStep {
  href: string;
  label: string;
}

/** Three-step linear onboarding funnel — route-aware (preserves the E9 fix). */
const STEPS: JourneyStep[] = [
  { href: "/onboarding", label: "Business" },
  { href: "/onboarding/upload", label: "Documents" },
  { href: "/onboarding/analysis", label: "Assessment" },
];

const STEP_BY_ROUTE: Record<string, { step: number }> = {
  "/onboarding": { step: 1 },
  "/onboarding/upload": { step: 2 },
  "/onboarding/analysis": { step: 3 },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { step: currentStep } = STEP_BY_ROUTE[pathname] ?? STEP_BY_ROUTE["/onboarding"];

  return (
    <div className="flex min-h-screen flex-col bg-app-bg">
      {/* Understated logo bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/94 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center px-6">
          <Logo />
        </div>
      </header>

      {/* Journey stepper — route-aware, three steps */}
      <div className="sticky top-16 z-20 border-b border-line bg-white/94 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-2 overflow-x-auto px-6 py-3">
          {STEPS.map((s, i) => {
            const stepNum = i + 1;
            const state: "now" | "done" | "upcoming" =
              stepNum === currentStep ? "now" : stepNum < currentStep ? "done" : "upcoming";

            return (
              <div key={s.href} className="flex items-center gap-2 whitespace-nowrap">
                {i > 0 && <span className="text-line">—</span>}
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors",
                    state === "now" && "bg-midnight text-white",
                    state === "done" && "text-royal",
                    state === "upcoming" && "text-muted-ink"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      state === "now" && "bg-electric text-white",
                      state === "done" && "bg-mint text-midnight",
                      state === "upcoming" && "bg-line text-muted-ink"
                    )}
                  >
                    {stepNum}
                  </span>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <main className="flex flex-1 justify-center px-6 py-12 md:py-16">
        <div className="w-full max-w-[640px]">{children}</div>
      </main>
    </div>
  );
}
