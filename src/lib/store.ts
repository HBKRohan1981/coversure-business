"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Asset, AssetCategory, QuoteRequest } from "./types";

interface SubmitInput { recommendationId: string; solution: string; contactName: string; phone: string; email: string; preferredContact: string; note?: string; }
interface AddAssetInput {
  type: string;
  name: string;
  category: AssetCategory;
  location: string;
  value: string;
  acquisitionDate?: string;
  insured: "yes" | "no" | "notsure";
  linkedPolicyKey?: string;
}
interface SessionState {
  onboardingComplete: boolean;
  uploadedDocs: string[];
  submittedRequests: QuoteRequest[];
  reviewedFlags: string[];
  addedAssets: Asset[];
  completeOnboarding: () => void;
  addUploadedDoc: (name: string) => void;
  submitRequest: (input: SubmitInput) => string; // returns new request id
  toggleReviewed: (flagKey: string) => void;
  addAsset: (input: AddAssetInput) => void;
  resetDemo: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      onboardingComplete: false,
      uploadedDocs: [],
      submittedRequests: [],
      reviewedFlags: [],
      addedAssets: [],
      completeOnboarding: () => set({ onboardingComplete: true }),
      addUploadedDoc: (name) => set((s) => ({ uploadedDocs: [...new Set([...s.uploadedDocs, name])] })),
      submitRequest: (input) => {
        const id = `req-${get().submittedRequests.length + 1}-${input.recommendationId}`;
        const req: QuoteRequest = {
          id, recommendationId: input.recommendationId, solution: input.solution,
          stage: "request-submitted", submittedAt: "2026-08-29T10:00:00.000Z",
          contactName: input.contactName, phone: input.phone, email: input.email,
          preferredContact: input.preferredContact, note: input.note,
        };
        set((s) => ({ submittedRequests: [...s.submittedRequests, req] }));
        return id;
      },
      toggleReviewed: (flagKey) => set((s) => ({ reviewedFlags: s.reviewedFlags.includes(flagKey) ? s.reviewedFlags.filter(f => f !== flagKey) : [...s.reviewedFlags, flagKey] })),
      addAsset: (input) => {
        const insuranceStatus =
          input.insured === "yes" ? "covered" : input.insured === "no" ? "potential-gap" : "unavailable";
        const asset: Asset = {
          key: `asset-${get().addedAssets.length + 1}`,
          name: input.name,
          type: input.type,
          category: input.category,
          location: input.location,
          value: input.value,
          insuranceStatus,
          relatedPolicyKeys: input.insured === "yes" && input.linkedPolicyKey ? [input.linkedPolicyKey] : [],
          acquisitionDate: input.acquisitionDate,
        };
        set((s) => ({ addedAssets: [...s.addedAssets, asset] }));
      },
      resetDemo: () => set({ onboardingComplete: false, uploadedDocs: [], submittedRequests: [], reviewedFlags: [], addedAssets: [] }),
    }),
    { name: "coversure-business-session" }
  )
);
