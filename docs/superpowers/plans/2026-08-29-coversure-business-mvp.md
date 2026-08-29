# CoverSure Business MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, interactive, no-backend Next.js prototype of CoverSure Business that walks a viewer from business onboarding through a Business Assessment to prioritised recommendations and a captured lead, in ~5 minutes.

**Architecture:** Next.js 14 App Router with a single canonical demo dataset (`ABC Manufacturing Pvt. Ltd.`) as the source of truth for every screen. Static assessment data is imported directly; a small persisted Zustand store holds only user-driven session progress (onboarding done, uploaded docs, submitted requests, reviewed flags). Screens compose a shared, reusable component library. No backend, no real APIs — outcomes are simulated deterministically.

**Tech Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · lucide-react · recharts · framer-motion · zustand · DM Sans (`next/font/google`).

## Global Constraints

- **Location:** everything lives in `D:\CoverSure Business` (this repo). Do NOT touch `D:\claritygmc-foundation`.
- **Next.js:** version `14.2.x`, App Router (`src/app`), TypeScript, `@/*` path alias → `src/*`.
- **No backend / no external calls at runtime.** No fetch to insurer APIs; never imply a live insurer connection. All data is simulated.
- **Single source of truth:** every business number comes from `src/lib/demo-data.ts`. No screen hardcodes figures that also appear in the dataset.
- **Brand colours (exact):** `midnight #001965`, `royal #0032C8`, `electric #1E56FF`, `mint #A2FAA3`. Wire as Tailwind theme tokens; never use off-brand primaries.
- **Font:** DM Sans (Regular 400 / Medium 500 / Semibold 600 / Bold 700) via `next/font/google`. No system-font substitution for brand text.
- **Insurance language (hard rule):** never render absolute claims ("underinsured", "not protected", "required"). Only approved phrasing from `src/lib/language.ts` (e.g. "Potential gap identified", "may warrant review", "Not identified in the documents reviewed", "Indicative assessment", "subject to underwriting and policy terms").
- **Customer-facing framing:** the concept is **"Business Assessment"** — CoverSure understands your business. AI is a quiet capability, never the headline. Do not label customer screens "AI analysis".
- **Determination trail:** score categories, risks, and recommendations each carry a `determination` (Facts → Evidence → Assessment → Recommendation) surfaced via a "How did we determine this?" affordance. This is a core feature, not polish.
- **Build priority:** the critical vertical slice (Phase E) must be built and made excellent before secondary screens (Phase F), admin (Phase G), and the responsive/polish pass (Phase H).
- **No scope expansion:** execute this plan as written. Do NOT independently add features, screens, product concepts, or "improvements" beyond the approved spec. If something seems missing or ambiguous, flag it for review — do not invent scope.
- **Execution sequence:** run A → B → C → D → E, then STOP at the hard review checkpoint after Task E9. Do not begin F/G/H until that review passes.
- **Testing philosophy:** the "brain" (types + demo-data invariants) is built test-first with a real Node test that must fail then pass. UI is verified by `tsc --noEmit`, `next build`, and a documented manual click-through — there is no DOM test harness in this prototype. Commit after every task.
- **Commits:** frequent, conventional-commit style, one per task minimum. Author `Rohan <rohan@coversure.in>`.

---

## File structure (what each file owns)

```
src/
  app/
    layout.tsx                  Root layout: DM Sans, <html> theme, base metadata
    globals.css                 Tailwind layers + CSS vars (brand tokens as HSL)
    page.tsx                    Landing (Screen 1)
    onboarding/
      layout.tsx                Light chrome (logo bar only) for the funnel
      page.tsx                  Onboarding form (Screen 2)
      upload/page.tsx           Upload + processing animation (Screen 3)
      analysis/page.tsx         Business Assessment reveal (Screen 4)
    app/
      layout.tsx                AppShell: persistent sidebar/topbar nav + account menu
      overview/page.tsx         Dashboard (Screen 12)
      protection/page.tsx       Consolidated Score+Coverage+Risks (Screens 5-7), #score/#coverage/#risks
      people/page.tsx           People & Benefits (Screen 8)
      recommendations/page.tsx  Priorities (Screen 9)
      recommendations/[id]/page.tsx  Recommendation detail (Screen 10)
      fix/[id]/page.tsx         Fix with CoverSure + form + confirmation (Screen 11)
      documents/page.tsx        Documents repository (Screen 13)
      quotes/page.tsx           Quotes & Requests tracker (Screen 14)
    admin/
      layout.tsx                Separate admin chrome
      page.tsx                  Pipeline: metrics + SME table (Screen 15)
      [smeId]/page.tsx          SME drill-down (Screen 15 detail)
  components/
    ui/                         shadcn primitives (button, card, dialog, tabs, table, progress, tooltip, select, separator, avatar, input, textarea, label, sheet)
    brand/Logo.tsx              Shield motif + wordmark (light + reverse)
    score/ScoreDial.tsx         Radial gauge
    score/CategoryScoreBar.tsx  Horizontal category score
    coverage/CoverageTable.tsx  Existing-protection table
    coverage/StatusPill.tsx     Coverage status pill
    risk/RiskCard.tsx           Expandable risk card
    common/PriorityBadge.tsx    High/Medium/Low badge
    common/ProvenanceTag.tsx    FACT/ASSESSMENT/RECOMMENDATION tag
    common/DeterminationTrail.tsx  "How did we determine this?" reveal
    common/AssessmentDisclaimer.tsx  Reused indicative-assessment footer
    reco/RecommendationCard.tsx Priority card
    people/BenefitMatrix.tsx    Existing vs potential benefits
    quotes/Timeline.tsx         Request status timeline
    upload/UploadDropzone.tsx   Drag-and-drop dropzone (simulated)
    upload/ProcessingSteps.tsx  Animated checklist
    nav/AppNav.tsx              Sidebar + mobile drawer nav
    nav/AccountMenu.tsx         Business/account menu
  lib/
    types.ts                    All domain types (Provenance, CoverageStatus, Severity, Determination, etc.)
    demo-data.ts                ABC Manufacturing canonical dataset
    language.ts                 Approved phrasing + status labels
    format.ts                   Currency/number formatting (₹ Cr / L)
    store.ts                    Zustand persisted session store
    utils.ts                    cn() classname helper (shadcn)
  test/
    demo-data.invariants.test.mjs   Node test asserting dataset invariants
scripts/
  verify.mjs                    Runs tsc --noEmit + invariant test
```

---

## Phase A — Project scaffold & foundations

### Task A1: Scaffold the Next.js app into the existing (non-empty) repo

**Files:**
- Create: full Next.js app skeleton in repo root
- Preserve: existing `docs/`, `.git/`, `.gitignore`

**Interfaces:**
- Produces: a running `next dev` app, `src/app/layout.tsx`, `src/app/page.tsx`, `@/*` alias, `tailwind.config.ts`, `src/app/globals.css`.

- [ ] **Step 1: Relocate docs so create-next-app sees an allowed dir**

`create-next-app` refuses a non-empty directory unless only allowlisted files are present (`.git`, `.gitignore` are allowed; `docs/` is not).

```bash
cd "/d/CoverSure Business"
mv docs ../_coversure_docs_tmp
```

- [ ] **Step 2: Scaffold**

```bash
cd "/d/CoverSure Business"
npx --yes create-next-app@14.2.5 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```
Expected: creates `src/app/{layout.tsx,page.tsx,globals.css}`, `tailwind.config.ts`, `next.config.mjs`, `package.json`, `tsconfig.json`. It reuses the existing `.git`.

- [ ] **Step 3: Restore docs**

```bash
cd "/d/CoverSure Business"
mv ../_coversure_docs_tmp docs
```

- [ ] **Step 4: Verify it runs**

```bash
cd "/d/CoverSure Business" && npm run build
```
Expected: build succeeds (compiles the default starter page).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js 14 app (App Router, TS, Tailwind)"
```

### Task A2: Install remaining dependencies

**Files:** Modify: `package.json`

**Interfaces:**
- Produces: `framer-motion`, `zustand`, `recharts`, `lucide-react`, `react-dropzone` available; shadcn CLI usable.

- [ ] **Step 1: Install**

```bash
cd "/d/CoverSure Business"
npm install framer-motion zustand recharts lucide-react react-dropzone
```

- [ ] **Step 2: Verify build still succeeds**

```bash
npm run build
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: add framer-motion, zustand, recharts, lucide-react, react-dropzone"
```

### Task A3: Brand tokens, DM Sans, and global styles

**Files:**
- Modify: `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`

**Interfaces:**
- Produces: Tailwind colours `midnight`, `royal`, `electric`, `mint` (+ neutral scale via shadcn HSL vars), DM Sans as the default sans font, base page background/foreground.

- [ ] **Step 1: Extend Tailwind theme** — add to `theme.extend.colors` in `tailwind.config.ts`:

```ts
colors: {
  midnight: "#001965",
  royal: "#0032C8",
  electric: "#1E56FF",
  mint: "#A2FAA3",
  // shadcn tokens (background, foreground, card, border, etc.) added in Task A4
},
fontFamily: {
  sans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
},
```

- [ ] **Step 2: Load DM Sans** in `src/app/layout.tsx`:

```tsx
import { DM_Sans } from "next/font/google";
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-dm-sans" });
// on <html>: className={`${dmSans.variable}`}   on <body>: className="font-sans bg-white text-slate-900 antialiased"
```
Set `metadata = { title: "CoverSure Business", description: "AI-powered protection for businesses and their people" }`.

- [ ] **Step 3: Verify** — `npm run build` PASS; run `npm run dev` and confirm the starter page renders in DM Sans (spot check).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: brand colour tokens and DM Sans typography"
```

### Task A4: Initialise shadcn/ui and add primitives

**Files:** Create: `src/components/ui/*`, `src/lib/utils.ts`, `components.json`; Modify: `globals.css`, `tailwind.config.ts` (shadcn HSL vars).

**Interfaces:**
- Produces: `cn()` in `@/lib/utils`; components `button card dialog tabs table progress tooltip select separator avatar input textarea label sheet badge` under `@/components/ui/*`.

- [ ] **Step 1: Init** (accept defaults; base colour slate):

```bash
cd "/d/CoverSure Business"
npx --yes shadcn@latest init -d
```

- [ ] **Step 2: Add primitives**

```bash
npx --yes shadcn@latest add button card dialog tabs table progress tooltip select separator avatar input textarea label sheet badge
```

- [ ] **Step 3: Verify** — `npm run build` PASS.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: init shadcn/ui and add base primitives"
```

---

## Phase B — The brain: types, demo data, language, invariants (test-first)

### Task B1: Domain types

**Files:** Create: `src/lib/types.ts`

**Interfaces:**
- Produces: the exact types every later task consumes. Copy verbatim.

- [ ] **Step 1: Write `src/lib/types.ts`**

```ts
export type Provenance = "FACT" | "ASSESSMENT" | "RECOMMENDATION";
export type CoverageStatus = "covered" | "review" | "not-identified" | "potential-gap" | "unavailable";
export type Severity = "high" | "attention" | "review" | "good";
export type Priority = "high" | "medium" | "low";
export type RequestStage = "requirement-identified" | "request-submitted" | "options-prepared" | "quote-received" | "decision" | "activated";

export interface Fact { label: string; value: string; source?: string; }

export interface Determination {
  facts: string[];        // business attributes found
  evidence: string[];     // what documents did / did not show
  assessment: string;     // indicative inference (careful language)
  recommendationRef?: string; // recommendation id this points to
}

export interface BusinessProfile {
  name: string; industry: string; location: string;
  turnover: string; employees: number; fixedAssets: string; inventory: string; yearsOperating: number;
  facts: Fact[];          // labelled FACTs with source
  findings: string[];     // "What we found" bullets
}

export interface CoverageLine {
  key: string; label: string; status: CoverageStatus; coverIdentified: string; // e.g. "₹20 Cr" or "—"
}

export interface CategoryScore {
  key: string; label: string; score: number; // 0-100
  determination: Determination;
}

export interface Scores {
  overall: number;               // 0-100
  categories: CategoryScore[];
  whyBullets: string[];
}

export interface Risk {
  key: string; title: string; severity: Severity;
  why: string; evidence: string[]; whatYouCanDo: string;
  determination: Determination;
}

export interface BenefitItem { label: string; provided: boolean; category: "Protection" | "Health" | "Wellbeing" | "Family"; }
export interface Benefits { peopleScore: number; benefitsScore: number; employees: number; items: BenefitItem[]; }

export interface Recommendation {
  id: string; index: string;   // "01"
  title: string; priority: Priority;
  why: string; recommended: string;
  found: { label: string; present: boolean }[];
  couldBeConsidered: string;
  coversureCanHelp: string;
  determination: Determination;
}

export interface QuoteRequest {
  id: string; recommendationId: string; solution: string;
  stage: RequestStage; submittedAt: string; // ISO string, static
}

export interface DemoCompany {
  profile: BusinessProfile;
  coverage: CoverageLine[];
  scores: Scores;
  risks: Risk[];
  benefits: Benefits;
  recommendations: Recommendation[];
  seededRequests: QuoteRequest[];
}
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit` PASS.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: domain types for demo dataset"`

### Task B2: Write the invariant test FIRST (must fail)

**Files:** Create: `src/test/demo-data.invariants.test.mjs`

**Interfaces:**
- Consumes: `@/lib/demo-data` (not yet created — test must fail on import).
- Produces: `node --test` suite guarding dataset integrity.

- [ ] **Step 1: Write the failing test** (uses Node's built-in test runner; imports the not-yet-existing dataset via a relative path so it runs without a bundler):

```js
import test from "node:test";
import assert from "node:assert/strict";
import { demoCompany } from "../lib/demo-data.ts";

const STATUSES = new Set(["covered","review","not-identified","potential-gap","unavailable"]);
const SEVERITIES = new Set(["high","attention","review","good"]);

test("overall and category scores are 0-100", () => {
  const s = demoCompany.scores;
  assert.ok(s.overall >= 0 && s.overall <= 100);
  for (const c of s.categories) assert.ok(c.score >= 0 && c.score <= 100, `${c.key} out of range`);
});

test("coverage statuses are valid enum members", () => {
  for (const c of demoCompany.coverage) assert.ok(STATUSES.has(c.status), `${c.key} bad status`);
});

test("risk severities are valid", () => {
  for (const r of demoCompany.risks) assert.ok(SEVERITIES.has(r.severity), `${r.key} bad severity`);
});

test("every recommendation has a determination and a unique id", () => {
  const ids = new Set();
  for (const r of demoCompany.recommendations) {
    assert.ok(r.id && !ids.has(r.id), `dup id ${r.id}`); ids.add(r.id);
    assert.ok(r.determination && r.determination.assessment.length > 0);
  }
  assert.equal(demoCompany.recommendations.length, 3);
});

test("determination recommendationRefs resolve to a real recommendation", () => {
  const recIds = new Set(demoCompany.recommendations.map(r => r.id));
  const withRef = [...demoCompany.scores.categories, ...demoCompany.risks].filter(x => x.determination.recommendationRef);
  for (const x of withRef) assert.ok(recIds.has(x.determination.recommendationRef), `bad ref ${x.determination.recommendationRef}`);
});

test("headline numbers are present and consistent", () => {
  assert.equal(demoCompany.profile.employees, 187);
  assert.equal(demoCompany.benefits.employees, 187);
  assert.equal(demoCompany.scores.overall, 64);
  assert.equal(demoCompany.benefits.peopleScore, 67);
  assert.equal(demoCompany.benefits.benefitsScore, 43);
});
```

- [ ] **Step 2: Run — expect failure**

```bash
cd "/d/CoverSure Business"
node --test --experimental-strip-types src/test/demo-data.invariants.test.mjs
```
Expected: FAIL — cannot find module `../lib/demo-data.ts`.

> Note: `--experimental-strip-types` (Node 20.6+/22) lets `node --test` import the `.ts` dataset directly. If the local Node is older, the executor should instead run the test via `npx tsx --test src/test/demo-data.invariants.test.mjs`; record whichever command passes in `scripts/verify.mjs` (Task B5).

- [ ] **Step 3: Commit the failing test**

```bash
git add -A && git commit -m "test: demo-data invariants (red)"
```

### Task B3: Author the canonical demo dataset

**Files:** Create: `src/lib/demo-data.ts`

**Interfaces:**
- Consumes: types from `@/lib/types`.
- Produces: `export const demoCompany: DemoCompany`.

- [ ] **Step 1: Write `src/lib/demo-data.ts`** with the exact spec figures. Full object (fill determinations for all six categories, all risks, all three recommendations):

```ts
import type { DemoCompany } from "./types";

export const demoCompany: DemoCompany = {
  profile: {
    name: "ABC Manufacturing Pvt. Ltd.",
    industry: "Manufacturing",
    location: "Maharashtra",
    turnover: "₹82 Cr",
    employees: 187,
    fixedAssets: "₹24 Cr",
    inventory: "₹9.4 Cr",
    yearsOperating: 12,
    facts: [
      { label: "Annual turnover", value: "₹82 Cr", source: "Audited financials FY24" },
      { label: "Employees", value: "187", source: "Employee register" },
      { label: "Fixed assets", value: "₹24 Cr", source: "Balance sheet" },
      { label: "Inventory", value: "₹9.4 Cr", source: "Balance sheet" },
      { label: "Years in business", value: "12", source: "Incorporation records" },
    ],
    findings: [
      "Physical manufacturing operations",
      "Significant fixed asset base",
      "Material inventory exposure",
      "187 employees",
      "Existing property/fire insurance",
      "Employee personal accident coverage",
      "No business interruption cover identified",
      "No cyber cover identified",
    ],
  },
  coverage: [
    { key: "property", label: "Property", status: "covered", coverIdentified: "₹20 Cr" },
    { key: "fire", label: "Fire", status: "covered", coverIdentified: "₹20 Cr" },
    { key: "pa", label: "Employee PA", status: "covered", coverIdentified: "₹2L / employee" },
    { key: "liability", label: "Liability", status: "review", coverIdentified: "₹1 Cr" },
    { key: "bi", label: "Business Interruption", status: "not-identified", coverIdentified: "—" },
    { key: "cyber", label: "Cyber", status: "not-identified", coverIdentified: "—" },
  ],
  scores: {
    overall: 64,
    whyBullets: [
      "Strong property protection identified",
      "Employee PA already in place",
      "No business interruption protection identified",
      "Cyber protection not identified",
      "Liability coverage may warrant review",
    ],
    categories: [
      { key: "property", label: "Property", score: 82, determination: {
        facts: ["Manufacturing site with significant fixed assets (₹24 Cr)"],
        evidence: ["Property cover ₹20 Cr identified", "Fire cover ₹20 Cr identified"],
        assessment: "Property and fire protection appear well established." } },
      { key: "business-continuity", label: "Business Continuity", score: 38, determination: {
        facts: ["Operations depend on physical assets and inventory (₹9.4 Cr)"],
        evidence: ["No business interruption cover identified in documents reviewed"],
        assessment: "A disruption could affect revenue and fixed expenses; business interruption protection may warrant review.",
        recommendationRef: "reco-business-continuity" } },
      { key: "liability", label: "Liability", score: 56, determination: {
        facts: ["₹82 Cr turnover; manufacturing operations"],
        evidence: ["Liability cover ₹1 Cr identified"],
        assessment: "Current liability protection may warrant review relative to business scale." } },
      { key: "cyber", label: "Cyber", score: 25, determination: {
        facts: ["187 employees", "Manufacturing business", "Customer and vendor data handled"],
        evidence: ["No cyber policy identified in uploaded documents"],
        assessment: "Cyber exposure may warrant review.",
        recommendationRef: "reco-cyber" } },
      { key: "people", label: "People", score: 67, determination: {
        facts: ["187 employees", "Employee PA ₹2L per employee in place"],
        evidence: ["No group health identified"],
        assessment: "Employee protection is present with opportunities to broaden health benefits.",
        recommendationRef: "reco-employee" } },
      { key: "other", label: "Other", score: 72, determination: {
        facts: ["Established 12-year operating history"],
        evidence: ["Core asset protections identified"],
        assessment: "Remaining areas appear reasonably addressed based on information provided." } },
    ],
  },
  risks: [
    { key: "business-continuity", title: "Business continuity", severity: "high",
      why: "Your operations depend significantly on physical assets, but business interruption protection was not identified.",
      evidence: ["Manufacturing operation", "Fixed assets ₹24 Cr", "Inventory ₹9.4 Cr", "No BI cover in documents reviewed"],
      whatYouCanDo: "Review suitable business interruption options with CoverSure.",
      determination: { facts: ["Physical-asset-dependent operations","Inventory ₹9.4 Cr"], evidence: ["No BI cover identified"], assessment: "Business interruption protection may warrant review.", recommendationRef: "reco-business-continuity" } },
    { key: "employee", title: "Employee protection", severity: "attention",
      why: "Employee PA is present, but broader employee protection opportunities may exist.",
      evidence: ["Employee PA ₹2L per employee identified", "No group health identified"],
      whatYouCanDo: "Explore enhanced employee protection and health benefits.",
      determination: { facts: ["187 employees","PA in place"], evidence: ["No group health identified"], assessment: "Broader employee protection may warrant review.", recommendationRef: "reco-employee" } },
    { key: "liability", title: "Liability", severity: "review",
      why: "Current liability protection may warrant review based on your business scale and operations.",
      evidence: ["Liability cover ₹1 Cr identified", "₹82 Cr turnover"],
      whatYouCanDo: "Review liability limits with CoverSure.",
      determination: { facts: ["₹82 Cr turnover"], evidence: ["Liability cover ₹1 Cr"], assessment: "Liability limits may warrant review." } },
    { key: "cyber", title: "Cyber", severity: "high",
      why: "No cyber protection was identified in the documents reviewed.",
      evidence: ["Customer/vendor data handled", "No cyber policy identified"],
      whatYouCanDo: "Explore cyber protection options.",
      determination: { facts: ["Data handled","187 employees"], evidence: ["No cyber policy identified"], assessment: "Cyber exposure may warrant review.", recommendationRef: "reco-cyber" } },
    { key: "property", title: "Property", severity: "good",
      why: "Property and fire protection were identified.",
      evidence: ["Property ₹20 Cr", "Fire ₹20 Cr"],
      whatYouCanDo: "Maintain current cover; review periodically.",
      determination: { facts: ["Fixed assets ₹24 Cr"], evidence: ["Property & fire ₹20 Cr each"], assessment: "Property protection appears well established." } },
  ],
  benefits: {
    peopleScore: 67, benefitsScore: 43, employees: 187,
    items: [
      { label: "Personal Accident", provided: true, category: "Protection" },
      { label: "Group Health", provided: false, category: "Protection" },
      { label: "Doctor consultations", provided: false, category: "Health" },
      { label: "Specialist consultations", provided: false, category: "Health" },
      { label: "Diagnostics", provided: false, category: "Health" },
      { label: "Medicines", provided: false, category: "Health" },
      { label: "Nutrition", provided: false, category: "Wellbeing" },
      { label: "Preventive health", provided: false, category: "Wellbeing" },
      { label: "Wellness support", provided: false, category: "Wellbeing" },
      { label: "Family health support", provided: false, category: "Family" },
      { label: "Family benefits", provided: false, category: "Family" },
    ],
  },
  recommendations: [
    { id: "reco-business-continuity", index: "01", title: "Protect business continuity", priority: "high",
      why: "Your business has significant operational assets and inventory, but we could not identify business interruption protection.",
      recommended: "Business Interruption Protection",
      found: [
        { label: "Manufacturing operation", present: true },
        { label: "₹82 Cr annual turnover", present: true },
        { label: "Significant fixed assets", present: true },
        { label: "Material inventory", present: true },
        { label: "Business interruption protection", present: false },
      ],
      couldBeConsidered: "Business Interruption cover can potentially help protect against financial losses following an insured interruption, subject to policy terms and underwriting.",
      coversureCanHelp: "We can help you review suitable options and obtain quotes.",
      determination: { facts: ["Manufacturing operation","₹82 Cr turnover","Significant fixed assets","Material inventory"], evidence: ["Business interruption protection not identified"], assessment: "Business interruption protection may warrant review." } },
    { id: "reco-employee", index: "02", title: "Strengthen employee protection", priority: "high",
      why: "Your 187 employees have personal accident protection, but there may be an opportunity to provide broader protection and health benefits.",
      recommended: "Enhanced Employee Protection + Health",
      found: [
        { label: "187 employees", present: true },
        { label: "Personal accident protection", present: true },
        { label: "Group health", present: false },
      ],
      couldBeConsidered: "Broader employee protection and group health benefits can potentially improve wellbeing and retention, subject to policy terms and underwriting.",
      coversureCanHelp: "We can help you review suitable options and obtain quotes.",
      determination: { facts: ["187 employees","PA in place"], evidence: ["No group health identified"], assessment: "Broader employee protection may warrant review." } },
    { id: "reco-cyber", index: "03", title: "Review cyber exposure", priority: "medium",
      why: "Your business handles operational and business data, but cyber protection was not identified in the documents reviewed.",
      recommended: "Cyber Protection",
      found: [
        { label: "Operational & business data handled", present: true },
        { label: "Cyber protection", present: false },
      ],
      couldBeConsidered: "Cyber cover can potentially help respond to data and systems incidents, subject to policy terms and underwriting.",
      coversureCanHelp: "We can help you review suitable options and obtain quotes.",
      determination: { facts: ["Data handled","187 employees"], evidence: ["No cyber policy identified"], assessment: "Cyber exposure may warrant review." } },
  ],
  seededRequests: [],
};
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit` PASS.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: canonical ABC Manufacturing demo dataset"`

### Task B4: Make the invariant test pass (green)

**Files:** none new — run the Task B2 test against the Task B3 dataset.

- [ ] **Step 1: Run**

```bash
cd "/d/CoverSure Business"
node --test --experimental-strip-types src/test/demo-data.invariants.test.mjs
```
Expected: PASS (all tests). If Node lacks type-strip, use `npx tsx --test src/test/demo-data.invariants.test.mjs`.

- [ ] **Step 2: If any assertion fails**, fix the dataset (not the test) until green.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "test: demo-data invariants pass (green)"`

### Task B5: Language constants, formatting, and verify script

**Files:** Create: `src/lib/language.ts`, `src/lib/format.ts`, `scripts/verify.mjs`; Modify: `package.json` (scripts).

**Interfaces:**
- Produces: `STATUS_LABELS`, `SEVERITY_LABELS`, `DISCLAIMER`, `APPROVED_PHRASES` from `@/lib/language`; `formatEmployees`, passthrough currency helpers from `@/lib/format`; `npm run verify`, `npm run test:data`.

- [ ] **Step 1: Write `src/lib/language.ts`**

```ts
import type { CoverageStatus, Severity } from "./types";
export const STATUS_LABELS: Record<CoverageStatus,string> = {
  "covered": "Covered",
  "review": "Review recommended",
  "not-identified": "Not identified",
  "potential-gap": "Potential gap",
  "unavailable": "Information unavailable",
};
export const SEVERITY_LABELS: Record<Severity,string> = {
  high: "High attention", attention: "Attention", review: "Review", good: "Relatively well protected",
};
export const DISCLAIMER =
  "This assessment is indicative and based on the information provided. Final coverage requirements are subject to underwriting, policy terms and conditions.";
export const ASSESSMENT_NOTE = "Based on the information provided and documents reviewed.";
```

- [ ] **Step 2: Write `src/lib/format.ts`**

```ts
export const formatEmployees = (n: number) => n.toLocaleString("en-IN");
```

- [ ] **Step 3: Write `scripts/verify.mjs`** (runs typecheck + data test; use whichever data-test command passed in B4):

```js
import { execSync } from "node:child_process";
const run = (c) => { console.log(`$ ${c}`); execSync(c, { stdio: "inherit" }); };
run("npx tsc --noEmit");
run("node --test --experimental-strip-types src/test/demo-data.invariants.test.mjs");
console.log("verify: OK");
```

- [ ] **Step 4: Add scripts** to `package.json`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test:data": "node --test --experimental-strip-types src/test/demo-data.invariants.test.mjs",
  "verify": "node scripts/verify.mjs"
}
```

- [ ] **Step 5: Verify** — `npm run verify` PASS.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: language constants, formatting, verify script"`

---

## Phase C — Session store & app shell

### Task C1: Persisted Zustand session store

**Files:** Create: `src/lib/store.ts`

**Interfaces:**
- Consumes: `QuoteRequest`, `RequestStage` from `@/lib/types`; `demoCompany` from `@/lib/demo-data`.
- Produces: `useSession()` hook with state `{ onboardingComplete, uploadedDocs, submittedRequests, reviewedFlags }` and actions `completeOnboarding()`, `addUploadedDoc(name)`, `submitRequest(input)`, `toggleReviewed(flagKey)`, `resetDemo()`.

- [ ] **Step 1: Write `src/lib/store.ts`**

```ts
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
```

> Note: `submittedAt` is a fixed ISO string — `Date.now()`/`new Date()` are intentionally avoided so the demo is deterministic.

- [ ] **Step 2: Verify** — `npx tsc --noEmit` PASS.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: persisted session store"`

### Task C2: App shell (persistent nav) — functional, not yet polished

**Files:** Create: `src/app/app/layout.tsx`, `src/components/nav/AppNav.tsx`, `src/components/nav/AccountMenu.tsx`, `src/components/brand/Logo.tsx`

**Interfaces:**
- Consumes: `Logo`.
- Produces: `AppShell` layout wrapping `/app/*` with a left sidebar (desktop) / top bar + `Sheet` drawer (mobile). Nav items: Overview `/app/overview`, Business Protection `/app/protection`, People & Benefits `/app/people`, Documents `/app/documents`, Recommendations `/app/recommendations`, Quotes & Requests `/app/quotes`. Active link highlighted via `usePathname()`. Account menu shows "ABC Manufacturing" with a dropdown (Reset demo → `resetDemo()` then route to `/`).

- [ ] **Step 1: Write `Logo.tsx`** — inline SVG shield (three converging segments) in `currentColor`, plus wordmark "COVERSURE" (semibold, tracking-wide). Props: `{ variant?: "default" | "reverse"; className?: string }`. Default uses `text-midnight`; reverse uses `text-white`. Minimum height 32px enforced via default `h-8`.
- [ ] **Step 2: Write `AppNav.tsx`** (client): array of `{href,label,icon}` using lucide icons (`LayoutDashboard, ShieldCheck, Users, FileText, ListChecks, ClipboardList`); render as sidebar list; highlight active. Export a `MobileNav` using shadcn `Sheet`.
- [ ] **Step 3: Write `AccountMenu.tsx`** (client): avatar + "ABC Manufacturing" + dropdown with "Reset demo".
- [ ] **Step 4: Write `src/app/app/layout.tsx`**: grid `md:grid-cols-[260px_1fr]`; sidebar (Logo + AppNav) hidden below md; mobile top bar with MobileNav + AccountMenu; `<main className="p-6 md:p-10 max-w-6xl mx-auto">{children}</main>`.
- [ ] **Step 5: Add temporary placeholder pages** so routes resolve: create minimal `src/app/app/overview/page.tsx`, `.../protection/page.tsx`, `.../people/page.tsx`, `.../documents/page.tsx`, `.../recommendations/page.tsx`, `.../quotes/page.tsx` each returning an `<h1>` with the screen name. (Real content in later phases.)
- [ ] **Step 6: Verify** — `npm run build` PASS; `npm run dev`, confirm `/app/overview` renders with working nav and active highlighting.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: app shell with persistent nav and account menu"`

---

## Phase D — Shared components for the critical path

> Each task: build the component, render it on a temporary `/app/overview` scratch or via the screen that first needs it, verify with `npm run build` + visual spot-check, commit. No DOM unit tests (prototype).

### Task D1: Score components

**Files:** Create: `src/components/score/ScoreDial.tsx`, `src/components/score/CategoryScoreBar.tsx`

**Interfaces:**
- Produces: `<ScoreDial value={number} max={100} label?={string} size?={number} />` — radial gauge (recharts `RadialBarChart` or an SVG arc) with large centre number and count-up via framer-motion; colour bands: `>=70 mint`/green, `40-69 amber`, `<40 red-ish` but rendered in brand-tinted tones. `<CategoryScoreBar label score />` — labelled horizontal bar with score and colour band.

- [ ] **Step 1:** Implement both. Colour helper `scoreTone(n): "good"|"attention"|"high"` shared (put in `src/lib/score.ts`): `n>=70?"good":n>=40?"attention":"high"`.
- [ ] **Step 2:** Verify build + render `ScoreDial value={64}` and the six `CategoryScoreBar`s on the scratch overview page.
- [ ] **Step 3:** Commit — `feat: ScoreDial and CategoryScoreBar`.

### Task D2: Status/priority/provenance atoms

**Files:** Create: `src/components/coverage/StatusPill.tsx`, `src/components/common/PriorityBadge.tsx`, `src/components/common/ProvenanceTag.tsx`

**Interfaces:**
- Produces: `<StatusPill status={CoverageStatus} />` using `STATUS_LABELS`; tones: covered→mint/green, review→amber, not-identified/potential-gap→slate/red-tint, unavailable→slate. `<PriorityBadge priority />`. `<ProvenanceTag kind={Provenance} />` small uppercase tag (FACT=slate, ASSESSMENT=royal, RECOMMENDATION=mint).

- [ ] **Step 1:** Implement using shadcn `Badge` + `cva` variants. Labels for status come from `@/lib/language`.
- [ ] **Step 2:** Verify build + render each variant.
- [ ] **Step 3:** Commit — `feat: StatusPill, PriorityBadge, ProvenanceTag`.

### Task D3: DeterminationTrail ("How did we determine this?")

**Files:** Create: `src/components/common/DeterminationTrail.tsx`

**Interfaces:**
- Consumes: `Determination` from `@/lib/types`; `ProvenanceTag`; shadcn `Dialog` (or `Collapsible`/details).
- Produces: `<DeterminationTrail determination={Determination} triggerLabel?="How did we determine this?" recommendationTitle?={string} />`. Renders a trigger button that opens a panel with four labelled layers — **Facts** (list), **Evidence** (list), **Assessment** (paragraph), **Recommendation** (links to `/app/recommendations/[recommendationRef]` when present, showing `recommendationTitle`). Each layer headed by the matching `ProvenanceTag`.

- [ ] **Step 1:** Implement as a shadcn `Dialog` with a subtle text trigger (`<button className="text-electric text-sm underline-offset-2 hover:underline">`). Facts→FACT tag, Evidence→FACT tag (document-derived), Assessment→ASSESSMENT tag, Recommendation→RECOMMENDATION tag with `Link`.
- [ ] **Step 2:** Verify build + open the trail for the Cyber category (should read Facts: 187 employees / Manufacturing / data handled; Evidence: no cyber policy identified; Assessment: cyber exposure may warrant review; Recommendation → Review cyber exposure).
- [ ] **Step 3:** Commit — `feat: DeterminationTrail transparency component`.

### Task D4: Coverage table, risk card, disclaimer

**Files:** Create: `src/components/coverage/CoverageTable.tsx`, `src/components/risk/RiskCard.tsx`, `src/components/common/AssessmentDisclaimer.tsx`

**Interfaces:**
- Produces: `<CoverageTable lines={CoverageLine[]} />` (shadcn `Table`: Protection | Current status (`StatusPill`) | Cover identified). `<RiskCard risk={Risk} />` expandable (shadcn `Collapsible` or Accordion) → severity indicator + Why we flagged this / Evidence / What you can do + `DeterminationTrail`. `<AssessmentDisclaimer />` renders `DISCLAIMER`.

- [ ] **Step 1:** Implement all three. Risk severity dot uses `scoreTone`-style colours mapped from `Severity`.
- [ ] **Step 2:** Verify build + render CoverageTable with `demoCompany.coverage` and RiskCards with `demoCompany.risks`.
- [ ] **Step 3:** Commit — `feat: CoverageTable, RiskCard, AssessmentDisclaimer`.

### Task D5: Recommendation card, upload dropzone, processing steps

**Files:** Create: `src/components/reco/RecommendationCard.tsx`, `src/components/upload/UploadDropzone.tsx`, `src/components/upload/ProcessingSteps.tsx`

**Interfaces:**
- Produces:
  - `<RecommendationCard reco={Recommendation} />` — index, title, `PriorityBadge`, why, "Recommended: …", CTA "Explore Solution" → `/app/recommendations/[id]`.
  - `<UploadDropzone category label onFiles={(names)=>void} />` — `react-dropzone`; accepts multiple; on drop, lists filenames (no real upload) and calls `onFiles`.
  - `<ProcessingSteps steps={string[]} onComplete={()=>void} />` — framer-motion sequential checklist that ticks each step ~700ms apart, then calls `onComplete`. Steps come from the caller.

- [ ] **Step 1:** Implement all three.
- [ ] **Step 2:** Verify build + render.
- [ ] **Step 3:** Commit — `feat: RecommendationCard, UploadDropzone, ProcessingSteps`.

---

## Phase E — CRITICAL VERTICAL SLICE (highest priority; make it excellent)

> Order: Landing → Onboarding → Upload+processing → Assessment reveal → Protection (score+coverage+risks) → Priorities → Recommendation detail → Fix → confirmation → request captured. After Phase E, do a focused polish pass on THIS path before Phase F.

### Task E1: Landing (Screen 1)

**Files:** Create/replace: `src/app/page.tsx`; Create: `src/app/(marketing)/layout.tsx` is NOT used — landing uses root layout with its own header.

**Interfaces:** Consumes `Logo`. Primary CTA routes to `/onboarding`.

- [ ] **Step 1:** Build hero: "CoverSure Business" + "AI-powered protection for businesses and their people" + supporting copy (from spec) + primary CTA **Assess My Business** (`Link href="/onboarding"`) + secondary **See How It Works** (anchor to pillars). Three pillars (Understand / Protect / Look After Your People) as cards. Journey strip: `Understand → Assess → Prioritise → Protect → Manage`. Premium, whitespace-rich, brand blues + mint accents; subtle motion on hero.
- [ ] **Step 2:** Verify build + `/` renders; CTA navigates to `/onboarding`.
- [ ] **Step 3:** Commit — `feat: landing page (Screen 1)`.

### Task E2: Onboarding form (Screen 2)

**Files:** Create: `src/app/onboarding/layout.tsx` (light chrome: Logo bar + subtle progress), `src/app/onboarding/page.tsx`

**Interfaces:** Consumes `useSession`. Continue routes to `/onboarding/upload`.

- [ ] **Step 1:** Title "Let's understand your business" + subheading (spec). Minimal fields (Business name, Industry, Location, Annual turnover, Number of employees) using shadcn `Input`/`Select` — **prefilled with ABC Manufacturing values** and editable (full journey pre-loaded). "Upload your documents instead" link → `/onboarding/upload`. CTA **Continue** → `/onboarding/upload`.
- [ ] **Step 2:** Verify build + navigation.
- [ ] **Step 3:** Commit — `feat: onboarding form (Screen 2)`.

### Task E3: Upload + processing animation (Screen 3)

**Files:** Create: `src/app/onboarding/upload/page.tsx`

**Interfaces:** Consumes `UploadDropzone`, `ProcessingSteps`, `useSession`.

- [ ] **Step 1:** Title "Give us the information you already have". Three `UploadDropzone` cards (Financials / Existing insurance / People), multi-file, each `onFiles` → `addUploadedDoc`. Below: an **Analyse** button (or auto-trigger when any file dropped) that shows "Reading your documents…" then `ProcessingSteps` with steps: Identifying business information → Understanding financial position → Reviewing existing insurance → Mapping employee protection → Assessing potential risks. `onComplete` → `completeOnboarding()` then route `/onboarding/analysis`. To keep the demo pre-loaded, if the user clicks Analyse without dropping files, seed a default doc set.
- [ ] **Step 2:** Verify build + full run reaches `/onboarding/analysis`.
- [ ] **Step 3:** Commit — `feat: document upload and processing animation (Screen 3)`.

### Task E4: Business Assessment reveal (Screen 4)

**Files:** Create: `src/app/onboarding/analysis/page.tsx`

**Interfaces:** Consumes `demoCompany.profile`, `ProvenanceTag`, `AssessmentDisclaimer`.

- [ ] **Step 1:** Title "We understand your business". Profile card grid (Industry, Location, Turnover ₹82 Cr, Employees 187, Fixed assets ₹24 Cr, Inventory ₹9.4 Cr, Years 12) with subtle FACT tags. "What we found" list from `profile.findings`. `ASSESSMENT_NOTE` subtle. Primary CTA **Continue to your assessment** → `/app/protection` (this is the payoff hand-off into the app). Framing is "assessment", never "AI analysis".
- [ ] **Step 2:** Verify build + navigation to `/app/protection`.
- [ ] **Step 3:** Commit — `feat: Business Assessment reveal (Screen 4)`.

### Task E5: Consolidated Protection page — Score + Coverage + Risks (Screens 5-7)

**Files:** Replace placeholder: `src/app/app/protection/page.tsx`

**Interfaces:** Consumes `ScoreDial`, `CategoryScoreBar`, `CoverageTable`, `RiskCard`, `DeterminationTrail`, `AssessmentDisclaimer`, `demoCompany`.

- [ ] **Step 1:** One page, three anchored sections in order:
  - `#score` — heading "Your Business Protection Score", central `ScoreDial value={64}`, supporting message, six `CategoryScoreBar`s, "Why your score looks this way" (`scores.whyBullets`), and a `DeterminationTrail` on each category (esp. Cyber, Business Continuity). CTA "See what needs attention" scrolls to `#risks`.
  - `#coverage` — heading "What you already have", `CoverageTable`, `AssessmentDisclaimer`.
  - `#risks` — heading "What could put your business at risk?", `RiskCard` list (5 risks), each expandable with its `DeterminationTrail`.
  - Add an in-page section nav (sticky sub-tabs linking to the three anchors); ensure hash deep-links (`/app/protection#risks`) scroll correctly.
- [ ] **Step 2:** Verify build + all three deep-links scroll; determination trails open.
- [ ] **Step 3:** Commit — `feat: consolidated protection page — score, coverage, risks (Screens 5-7)`.

### Task E6: Priorities (Screen 9)

**Files:** Replace placeholder: `src/app/app/recommendations/page.tsx`

**Interfaces:** Consumes `RecommendationCard`, `demoCompany.recommendations`.

- [ ] **Step 1:** Title "Your top priorities" + subheading (spec). Three large `RecommendationCard`s (01/02/03) in priority order, each CTA → `/app/recommendations/[id]`.
- [ ] **Step 2:** Verify build + each card navigates to its detail.
- [ ] **Step 3:** Commit — `feat: priorities screen (Screen 9)`.

### Task E7: Recommendation detail (Screen 10)

**Files:** Create: `src/app/app/recommendations/[id]/page.tsx`

**Interfaces:** Consumes `demoCompany.recommendations` (lookup by `params.id`), `DeterminationTrail`, `AssessmentDisclaimer`. 404 via `notFound()` if id unknown.

- [ ] **Step 1:** Sections: title, "Why this matters" (`why`), "What we found" (✓/✕ from `found`), "What could be considered" (`couldBeConsidered`), "CoverSure can help" (`coversureCanHelp`), a `DeterminationTrail`, `AssessmentDisclaimer`. Primary CTA **Fix this with CoverSure** → `/app/fix/[id]`; secondary "Talk to a CoverSure specialist" (opens a simple dialog).
- [ ] **Step 2:** Verify build + `/app/recommendations/reco-cyber` renders and CTA routes to `/app/fix/reco-cyber`.
- [ ] **Step 3:** Commit — `feat: recommendation detail (Screen 10)`.

### Task E8: Fix with CoverSure + form + confirmation (Screen 11)

**Files:** Create: `src/app/app/fix/[id]/page.tsx`

**Interfaces:** Consumes `demoCompany.recommendations`, `useSession.submitRequest`.

- [ ] **Step 1:** Title "Let's fix it" + selected recommendation summary. "What happens next?" 5 steps (Review requirement → Compare options → Get quotes → Choose solution → CoverSure manages). Form fields: **What would you like help with?** (`Input`, prefilled from `reco.recommended`, editable), Contact person, Phone, Email, Preferred contact method (`Select`: Phone/Email/WhatsApp), Optional note (`Textarea`). Do NOT collect company/industry/employees. CTA **Request Options** → validate required (person/phone/email) → `submitRequest({recommendationId: reco.id, solution: <help-with value>, ...})` → show confirmation state "We've got it / A CoverSure specialist will review your requirement…" with a link to `/app/quotes`.
- [ ] **Step 2:** Verify build + submitting adds a request to the store (check via `/app/quotes` in E-follow or temporarily log).
- [ ] **Step 3:** Commit — `feat: fix with CoverSure lead capture (Screen 11)`.

### Task E9: Critical-path polish pass + fresh-session acceptance

**Files:** touch as needed across Phase E screens.

- [ ] **Step 1:** Walk the full path `/` → onboarding → upload → analysis → protection → recommendations → detail → fix → confirmation. Tighten spacing, transitions, copy, empty/hover/focus states, and ensure the ABC Manufacturing numbers are identical everywhere (they come from `demoCompany`). Confirm insurance language compliance on every screen.

- [ ] **Step 2: Fresh-session end-to-end acceptance (required).** Clear the persisted store first (browser: clear `localStorage` key `coversure-business-session`, or click account menu → Reset demo), then complete the journey **from a clean state**:
  `Landing → Assess My Business → onboarding → upload → processing → analysis → protection → recommendation → Fix with CoverSure → submit request → confirmation.`
  Every step must be reachable and functional starting from nothing pre-populated.

- [ ] **Step 3: Commercial-workflow acceptance (required).** After submitting the request in Step 2, verify the request is written to the **persisted** session state — confirm `localStorage["coversure-business-session"]` contains the new entry in `submittedRequests` (recommendationId, solution, stage `request-submitted`) AND that it renders on `/app/quotes`. This is the exact data the Admin pipeline reads; the end-to-end admin-visibility confirmation is completed in Task G1 (which must surface this request) and re-checked in H2. Record in the commit message that the persisted request was verified.

- [ ] **Step 4:** `npm run verify` PASS + `npm run build` PASS.
- [ ] **Step 5:** Commit — `polish: critical vertical slice end-to-end + fresh-session acceptance`.

---

## 🚦 HARD REVIEW CHECKPOINT (after E9 — do not proceed to Phase F without approval)

Execution must STOP here and present the critical slice for human review. Phase E is the real product test. The reviewer assesses:

1. Does the product immediately communicate what CoverSure Business is?
2. Is the onboarding sufficiently simple?
3. Does the document / Business Assessment step feel believable?
4. Is the Protection Score useful rather than gimmicky?
5. Can the reviewer understand *why* a risk was identified (determination trail)?
6. Are recommendations genuinely prioritised?
7. Does "Fix with CoverSure" feel like the natural next step?
8. Does the lead capture feel frictionless?
9. Does the whole experience feel like a business protection *platform*, not an insurance comparison site?
10. Does it look credible enough to put in front of someone at GFF 2026?

Only after the reviewer confirms E is excellent does execution continue with F → G → H.

---

## Phase F — Secondary screens

### Task F1: Overview dashboard (Screen 12)

**Files:** Replace placeholder: `src/app/app/overview/page.tsx`

**Interfaces:** Consumes `demoCompany`, `ScoreDial`/small tiles, `useSession` (priorities count).

- [ ] **Step 1:** Header "Good morning, ABC Manufacturing"; overall 64/100; "3 priorities need attention". Business tiles: Property 🟢 Good, Business Continuity 🔴 Needs attention, Liability 🟠 Review, Cyber 🔴 Needs attention (tones from category scores). People: Employee Protection 67, Benefits 43. Priorities list (1 Business continuity, 2 Employee protection, 3 Cyber) → CTA "Review priorities" → `/app/recommendations`. Deep links from tiles to `/app/protection#...`.
- [ ] **Step 2:** Verify build + links.
- [ ] **Step 3:** Commit — `feat: overview dashboard (Screen 12)`.

### Task F2: People & Benefits (Screen 8)

**Files:** Replace placeholder: `src/app/app/people/page.tsx`; Create: `src/components/people/BenefitMatrix.tsx`

**Interfaces:** Consumes `demoCompany.benefits`.

- [ ] **Step 1:** Title "Look after your people" + subheading. 187 employees; Employee Protection Score 67/100 (`ScoreDial`). `BenefitMatrix`: categories Protection/Health/Wellbeing/Family, each item ✓ provided vs opportunity. "Already provided" (Personal Accident) vs "Potential opportunities" (Group Health, Teleconsultation, Diagnostics, Wellness). CTA "Explore Employee Benefits" → `/app/recommendations/reco-employee`.
- [ ] **Step 2:** Verify build.
- [ ] **Step 3:** Commit — `feat: people & benefits (Screen 8) + BenefitMatrix`.

### Task F3: Quotes & Requests tracker (Screen 14)

**Files:** Replace placeholder: `src/app/app/quotes/page.tsx`; Create: `src/components/quotes/Timeline.tsx`

**Interfaces:** Consumes `useSession.submittedRequests`, `demoCompany.recommendations` (to resolve solution titles).

- [ ] **Step 1:** `Timeline` stages: Requirement identified ✓ → Request submitted ✓ → Options being prepared ○ → Quote received ○ → Decision ○ → Activated ○. List each submitted request (from store) as a card with its solution and a `Timeline` at "Request submitted". Empty state when no requests: "No requests yet — explore your priorities" → `/app/recommendations`. Modern workflow feel, not email.
- [ ] **Step 2:** Verify build + a request submitted in E8 appears here.
- [ ] **Step 3:** Commit — `feat: quotes & requests tracker (Screen 14) + Timeline`.

### Task F4: Documents repository (Screen 13)

**Files:** Replace placeholder: `src/app/app/documents/page.tsx`

**Interfaces:** Consumes `useSession.uploadedDocs`; static analysed-doc list.

- [ ] **Step 1:** Cards: Financials ✓ Analysed, Insurance policies ✓ 4 documents analysed, Employee benefits ✓ Analysed. Show which documents contributed to the assessment. Allow Upload (reuse `UploadDropzone` → `addUploadedDoc`), View (dialog stub), Replace (re-drop), and processing status. List `uploadedDocs` from the store.
- [ ] **Step 2:** Verify build.
- [ ] **Step 3:** Commit — `feat: documents repository (Screen 13)`.

---

## Phase G — Admin (light pipeline, Screen 15)

### Task G1: Admin pipeline list

**Files:** Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`; Create: `src/lib/admin-data.ts` (a small set of SMEs including ABC Manufacturing, reusing `demoCompany` for ABC).

**Interfaces:** Produces `adminSmes: {id,name,score,priorities,status,opportunity}[]`; ABC Manufacturing's row derives score/priorities from `demoCompany`.

- [ ] **Step 1:** Separate admin chrome (distinct header "CoverSure Business — SME Pipeline", clearly internal). Metrics row: SMEs assessed, Assessments completed, Recommendations accepted, Quote requests (include live count from `useSession.submittedRequests` for ABC), Purchases, Revenue opportunity. Table: Business | Score | Priorities | Status | Opportunity, rows link to `/admin/[smeId]`.
- [ ] **Step 2:** Verify build + `/admin` renders, ABC row present, quote-request metric reflects submitted requests. **Commercial-workflow closure:** confirm a request submitted via the E8 Fix flow (persisted in `submittedRequests`) is visible in the admin pipeline — this completes the SME → Assessment → Recommendation → Request → CoverSure action loop begun at E9 Step 3.
- [ ] **Step 3:** Commit — `feat: admin pipeline list (Screen 15)`.

### Task G2: SME drill-down

**Files:** Create: `src/app/admin/[smeId]/page.tsx`

**Interfaces:** Consumes `adminSmes`, `demoCompany` (for ABC), `useSession.submittedRequests`.

- [ ] **Step 1:** For ABC Manufacturing: sections Business profile, Documents, Extracted information (facts), Risks, Recommendations, Quote requests (from store), Activity. Demonstrate the loop **SME → Assessment → Recommendation → Request → CoverSure action**: allow a small status change on a request (advance stage `request-submitted → options-prepared`) via a select that updates a local admin state (does not need to write back to the customer store for the demo, but may). No full CRUD.
- [ ] **Step 2:** Verify build + drill-down renders and a request stage can be advanced.
- [ ] **Step 3:** Commit — `feat: admin SME drill-down (Screen 15 detail)`.

---

## Phase H — Responsive pass & final verification

### Task H1: Responsive pass

**Files:** touch screens/components as needed.

- [ ] **Step 1:** Test desktop / tablet / mobile widths. Sidebar → drawer on mobile; tables scroll within `overflow-x-auto`; ScoreDial and card grids reflow; hero and pillars stack. Fix overflow and tap-target issues.
- [ ] **Step 2:** `npm run build` PASS.
- [ ] **Step 3:** Commit — `polish: responsive pass across breakpoints`.

### Task H2: Final verification & manual click-through

**Files:** none (verification only).

- [ ] **Step 1:** `npm run verify` PASS (tsc + data invariants).
- [ ] **Step 2:** `npm run build` PASS.
- [ ] **Step 3:** Manual interaction checklist — confirm each works: Landing CTA · onboarding · file-upload simulation · processing animation · continue buttons · dashboard navigation · scorecard drill-down · risk expansion · determination trail · recommendation drill-down · employee-benefits navigation · Fix with CoverSure · quote/request submission · confirmation · documents navigation · admin navigation · deep links `/app/protection#{score,coverage,risks}`.
- [ ] **Step 4:** Confirm insurance-language compliance (grep for banned words):

```bash
cd "/d/CoverSure Business"
grep -rniE "underinsured|not protected|is required|must buy" src && echo "FOUND BANNED LANGUAGE — fix" || echo "language OK"
```
Expected: "language OK".

- [ ] **Step 5:** Commit — `chore: final verification pass`.

---

## Self-review notes (spec coverage)

- Screens 1–15: E1 (1), E2 (2), E3 (3), E4 (4), E5 (5,6,7), F2 (8), E6 (9), E7 (10), E8 (11), F1 (12), F4 (13), F3 (14), G1/G2 (15). ✅
- Determination trail (§8.1): D3 + surfaced in E5, E7. ✅
- Business Assessment framing (§ terminology): E3/E4 + Global Constraints. ✅
- Insurance language guardrails (§8): B5 + H2 grep. ✅
- Consolidated `/app/protection` with deep links (§5): E5. ✅
- Fix form incl. "What would you like help with?" (Screen 11): E8. ✅
- Critical-path priority ordering (§12): Phases ordered E before F/G/H; E9 polish gate. ✅
- Admin in scope, no full editing (§13): G1/G2. ✅
- Session persistence (§ scope): C1. ✅
- Testing/verification (§11): B2/B4 invariants + B5 verify + H2. ✅
