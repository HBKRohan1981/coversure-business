"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuoteRequest } from "./types";

interface SubmitInput { recommendationId: string; solution: string; contactPerson: string; phone: string; email: string; preferredContact: string; note?: string; }
interface SessionState {
  onboardingComplete: boolean;
  uploadedDocs: string[];
  submittedRequests: QuoteRequest[];
  reviewedFlags: string[];
  completeOnboarding: () => void;
  addUploadedDoc: (name: string) => void;
  submitRequest: (input: SubmitInput) => string; // returns new request id
  toggleReviewed: (flagKey: string) => void;
  resetDemo: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      onboardingComplete: false,
      uploadedDocs: [],
      submittedRequests: [],
      reviewedFlags: [],
      completeOnboarding: () => set({ onboardingComplete: true }),
      addUploadedDoc: (name) => set((s) => ({ uploadedDocs: [...new Set([...s.uploadedDocs, name])] })),
      submitRequest: (input) => {
        const id = `req-${get().submittedRequests.length + 1}-${input.recommendationId}`;
        const req: QuoteRequest = { id, recommendationId: input.recommendationId, solution: input.solution, stage: "request-submitted", submittedAt: "2026-08-29T10:00:00.000Z" };
        set((s) => ({ submittedRequests: [...s.submittedRequests, req] }));
        return id;
      },
      toggleReviewed: (flagKey) => set((s) => ({ reviewedFlags: s.reviewedFlags.includes(flagKey) ? s.reviewedFlags.filter(f => f !== flagKey) : [...s.reviewedFlags, flagKey] })),
      resetDemo: () => set({ onboardingComplete: false, uploadedDocs: [], submittedRequests: [], reviewedFlags: [] }),
    }),
    { name: "coversure-business-session" }
  )
);
