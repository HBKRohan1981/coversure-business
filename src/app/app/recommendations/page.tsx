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
      <h1 className="text-2xl font-semibold text-midnight sm:text-3xl">
        Your top priorities
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        You don&apos;t need to fix everything at once. We&apos;ve prioritised what
        matters most.
      </p>

      <div className="mt-8 flex max-w-3xl flex-col gap-5 md:mt-10 md:gap-6">
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
    </motion.div>
  );
}
