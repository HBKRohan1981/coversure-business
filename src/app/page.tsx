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
    <div className="flex min-h-screen flex-col bg-app-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-white/94 backdrop-blur-md">
        <div className="cs-container flex items-center justify-between py-4">
          <Logo />
        </div>
      </header>

      {/* Hero — authoritative midnight -> royal gradient band, PI/D&O hero treatment */}
      <section className="bg-gradient-to-br from-midnight to-royal">
        <div className="cs-container flex flex-col items-center py-24 text-center md:py-32">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="eyebrow-pill"
          >
            AI-powered protection
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.06 }}
            className="h-hero mt-5 text-white"
          >
            CoverSure Business
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
            className="mt-6 max-w-2xl text-base text-white/80 sm:text-lg"
          >
            AI-powered protection for businesses and their people. Assess
            business risks, identify protection gaps, provide employee benefits,
            and manage insurance and wellbeing — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.24 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link href="/onboarding" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
              Assess My Business
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#how"
              onClick={scrollToHow}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/30 text-white hover:bg-white/10 hover:text-white"
              )}
            >
              See How It Works
            </a>
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section id="how" className="border-t border-line py-20">
        <div className="cs-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="kicker">How it works</p>
            <h2 className="h-section mt-2 text-midnight">
              One platform, three commitments
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="rounded-2xl p-8 text-center transition-shadow hover:shadow-soft-lg"
              >
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-electric/10 text-electric">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-midnight">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted-ink">
                  {description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Journey strip */}
      <section className="border-t border-line py-16">
        <div className="cs-container">
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
                    className="hidden size-4 shrink-0 text-line sm:block"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-8">
        <div className="cs-container flex items-center justify-between text-sm text-muted-ink">
          <Logo className="h-6 opacity-70" />
          <span>© 2026 CoverSure</span>
        </div>
      </footer>
    </div>
  );
}
