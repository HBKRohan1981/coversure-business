"use client";

import { motion } from "framer-motion";
import { RecommendationCard } from "@/components/reco/RecommendationCard";
import { demoCompany } from "@/lib/demo-data";

export default function RecommendationsPage() {
  const { recommendations } = demoCompany;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="cs-container px-0">
        <p className="kicker">Recommendations</p>
        <h1 className="h-section mt-1 text-midnight">Your top priorities</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-ink">
          You don&apos;t need to fix everything at once. We&apos;ve prioritised what
          matters most.
        </p>

        <div className="mt-10 flex max-w-3xl flex-col gap-6 md:mt-12 md:gap-7">
          {recommendations.map((reco, i) => (
            <motion.div
              key={reco.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 * i }}
            >
              <RecommendationCard reco={reco} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
