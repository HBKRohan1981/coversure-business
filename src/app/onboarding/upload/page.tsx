"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, FileSearch } from "lucide-react";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { ProcessingSteps } from "@/components/upload/ProcessingSteps";
import { useSession } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Exact processing checklist copy — approved language, "understanding" framing. */
const STEPS = [
  "Identifying business information",
  "Understanding financial position",
  "Reviewing existing insurance",
  "Mapping employee protection",
  "Assessing potential risks",
];

/**
 * Default document set seeded when Analyse is clicked with nothing dropped,
 * so the demo journey always reaches the assessment — never a dead end.
 */
const DEFAULT_DOCS = [
  "Audited Financials FY24.pdf",
  "Current Policy Schedule.pdf",
  "Employee Census.xlsx",
];

type Stage = "upload" | "processing";

export default function UploadPage() {
  const router = useRouter();
  const addUploadedDoc = useSession((s) => s.addUploadedDoc);
  const completeOnboarding = useSession((s) => s.completeOnboarding);

  const [stage, setStage] = useState<Stage>("upload");
  const [hasFiles, setHasFiles] = useState(false);

  function handleFiles(names: string[]) {
    if (names.length === 0) return;
    names.forEach((name) => addUploadedDoc(name));
    setHasFiles(true);
  }

  function handleAnalyse() {
    if (!hasFiles) {
      DEFAULT_DOCS.forEach((name) => addUploadedDoc(name));
    }
    setStage("processing");
  }

  function handleDone() {
    completeOnboarding();
    router.push("/onboarding/analysis");
  }

  return (
    <AnimatePresence mode="wait">
      {stage === "upload" ? (
        <motion.div
          key="upload"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <p className="kicker">Business Assessment</p>
          <h1 className="h-panel mt-2 text-midnight">
            Give us the information you already have
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-ink">
            We&apos;ll read what you share and build a picture of your
            business as it stands today. Nothing here is required &mdash;
            share what&apos;s on hand.
          </p>

          <div className="mt-8 space-y-4">
            <UploadDropzone
              category="financials"
              label="Upload audited financials or financial statements."
              onFiles={handleFiles}
            />
            <UploadDropzone
              category="insurance"
              label="Upload current policies, schedules or policy documents."
              onFiles={handleFiles}
            />
            <UploadDropzone
              category="people"
              label="Upload employee/benefit information if available."
              onFiles={handleFiles}
            />
          </div>

          <div className="mt-8 flex items-center justify-end border-t border-line pt-6">
            <Button type="button" size="lg" onClick={handleAnalyse} className="gap-2">
              Analyse
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="processing"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex size-14 items-center justify-center rounded-2xl border border-line bg-white shadow-soft"
          >
            <FileSearch className="size-6 text-royal" aria-hidden />
          </motion.div>

          <p className="kicker mt-5">Business Assessment</p>
          <h1 className="h-panel mt-2 text-midnight">
            Reading your documents&hellip;
          </h1>
          <p className="mt-2 text-[14.5px] text-muted-ink">
            We&apos;re putting together a picture of your business.
          </p>

          <Card className="mt-8 w-full rounded-2xl border-line text-left shadow-soft">
            <CardContent className="px-7 py-7">
              <ProcessingSteps steps={STEPS} onComplete={handleDone} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
