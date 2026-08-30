"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, HeartHandshake, Search, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PILLARS = [
  {
    icon: Search,
    title: "Understand",
    description: "We build a complete picture of your business — financials, existing protection and risk profile.",
  },
  {
    icon: ShieldCheck,
    title: "Protect",
    description: "Identify gaps and prioritise what needs attention.",
  },
  {
    icon: HeartHandshake,
    title: "Look After Your People",
    description:
      "Provide meaningful employee protection, health and wellbeing benefits.",
  },
] as const;

const JOURNEY_STEPS = ["Understand", "Assess", "Prioritise", "Protect", "Manage"] as const;

function scrollToHow(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  document.getElementById("how")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Soft brand-colour glow, decorative only */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 right-[-10%] h-[420px] w-[420px] rounded-full bg-electric/10 blur-3xl" />
          <div className="absolute top-20 left-[-10%] h-[320px] w-[320px] rounded-full bg-mint/20 blur-3xl" />
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center md:py-32">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-4xl font-bold tracking-tight text-midnight sm:text-5xl md:text-6xl"
          >
            CoverSure Business
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
            className="mt-4 text-xl font-medium text-royal sm:text-2xl"
          >
            AI-powered protection for businesses and their people
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
            className="mt-6 max-w-2xl text-base text-slate-600 sm:text-lg"
          >
            Assess business risks, identify protection gaps, provide employee
            benefits, and manage insurance and wellbeing — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.24 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link
              href="/onboarding"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 gap-2 bg-electric px-8 text-base text-white shadow-md hover:bg-royal"
              )}
            >
              Assess My Business
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#how"
              onClick={scrollToHow}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 border-midnight/15 px-8 text-base text-midnight hover:bg-midnight/5"
              )}
            >
              See How It Works
            </a>
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section id="how" className="border-t border-slate-100 bg-slate-50/60 py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-midnight sm:text-3xl">
              One platform, three commitments
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="border-slate-200 p-8 text-center transition-shadow hover:shadow-lg"
              >
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-electric/10 text-electric">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-midnight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Journey strip */}
      <section className="border-t border-slate-100 py-16">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between sm:gap-2">
            {JOURNEY_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-midnight text-sm font-semibold text-white">
                    {i + 1}
                  </div>
                  <span className="whitespace-nowrap text-sm font-medium text-midnight sm:text-base">
                    {step}
                  </span>
                </div>
                {i < JOURNEY_STEPS.length - 1 ? (
                  <ArrowRight
                    className="hidden size-4 shrink-0 text-slate-300 sm:block"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 text-sm text-slate-400">
          <Logo className="h-6 opacity-70" />
          <span>© 2026 CoverSure</span>
        </div>
      </footer>
    </div>
  );
}
