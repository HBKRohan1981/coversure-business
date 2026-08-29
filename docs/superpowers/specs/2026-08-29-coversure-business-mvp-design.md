# CoverSure Business — Interactive MVP — Design Spec

**Date:** 2026-08-29
**Status:** Approved (design), pending spec review
**Location:** `D:\CoverSure Business` (standalone project, separate from claritygmc)

---

## 1. Purpose & success criterion

Build a polished, interactive **MVP/prototype** for **CoverSure Business** — a B2B business-protection and employee-benefits platform for SMEs. It must be convincing enough to demo to SME owners, CFOs, HR leaders, banks/NBFCs, manufacturers, ecosystem partners, investors, and internal CoverSure leadership, and understandable in ~5 minutes.

The product narrative the prototype must land:
> AI understands the business → identifies risks and gaps → recommends what should be done → CoverSure provides and manages the solutions.

It is **not** an insurance chatbot and **not** a product catalogue. It should feel like a modern B2B SaaS operating platform.

**Customer-facing terminology:** the concept presented to the user is **"Business Assessment"** — CoverSure *understands your business*. AI quietly powers it but is never framed as the product. Avoid "AI analysis / AI experiment" language in customer-facing UI; "AI" may appear only as a subtle capability note, not as the headline.

The experience answers five questions: (1) What do I have? (2) What could go wrong? (3) Where are my protection gaps? (4) What should I do? (5) Can CoverSure help me fix it?

A first-time viewer should be able to answer: *What is CoverSure Business? Why is it different? Why would I use it? How does CoverSure make money?*

**Money model (must be legible, never pushy):** CoverSure earns through the insurance, employee-benefits, wellness and related solutions the SME adopts and manages via the platform.

---

## 2. Scope decisions (locked)

| Decision | Choice |
|---|---|
| Location | Brand-new separate project at `D:\CoverSure Business` |
| Stack | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui |
| Demo flow | Full journey, pre-loaded — onboarding/upload interactive but always resolve to the ABC Manufacturing demo state |
| Admin view (Screen 15) | Light version: metrics + SME table + one drill-down (no full editing workflows) |
| Session state | Persist within session via `localStorage` |
| Backend | None. All data simulated. No pretence of a live insurer API. |
| Responsive priority | Desktop-first, degrades gracefully to tablet/mobile |

---

## 3. Architecture & foundations

- **Next.js 14 App Router**, TypeScript, Tailwind, **shadcn/ui**, `lucide-react` icons, `recharts` for score/benefit visuals, `framer-motion` for the processing animation and transitions.
- **Brand tokens** wired into the Tailwind theme:
  - `midnight #001965`, `royal #0032C8`, `electric #1E56FF` (primary blues)
  - `mint #A2FAA3` (secondary accent — health/positive outcomes)
  - Neutrals for surfaces/borders/text; generous whitespace.
- **Typography:** DM Sans (Regular/Medium/Semibold/Bold) via `next/font/google`.
- **Logo:** a small `Logo` component rendering the CoverSure shield motif (three-segment converging shield) + all-caps wordmark, with light and reverse (on-dark) variants.
- **No backend.** A single canonical demo dataset (`ABC Manufacturing Pvt. Ltd.`) is the source of truth for every screen so numbers never contradict.

**New dependencies beyond the shadcn/Tailwind base:** `framer-motion`, `zustand`.

---

## 4. Data model (the "brain")

One typed module, `lib/demo-data.ts`, holds the assessment as structured objects, mirroring the FACT / ASSESSMENT / RECOMMENDATION distinction so the UI can label provenance.

```ts
type Provenance = 'FACT' | 'ASSESSMENT' | 'RECOMMENDATION';
type CoverageStatus = 'covered' | 'review' | 'not-identified' | 'potential-gap' | 'unavailable';
type Severity = 'high' | 'attention' | 'review' | 'good';
```

- **`businessProfile`** — FACTs, each with a `source` doc reference:
  - Name: ABC Manufacturing Pvt. Ltd. · Industry: Manufacturing · Location: Maharashtra
  - Turnover ₹82 Cr · Employees 187 · Fixed assets ₹24 Cr · Inventory ₹9.4 Cr · Years operating 12
  - "What we found" bullets (physical operations, fixed-asset base, inventory exposure, existing property/fire, employee PA, no BI identified, no cyber identified).
- **`coverage[]`** — Property (Covered, ₹20 Cr), Fire (Covered, ₹20 Cr), Employee PA (Covered, ₹2L/employee), Liability (Review, ₹1 Cr), Business Interruption (Not identified, —), Cyber (Not identified, —).
- **`scores`** — overall **64/100**; categories: Property **82**, Business Continuity **38**, Liability **56**, Cyber **25**, People **67**, Other **72**. Plus "why your score looks this way" bullets.
- **`risks[]`** (5–7) — each: title, severity (🔴 high / 🟠 attention/review / 🟢 good), "why we flagged this", "evidence", "what you can do". Includes Business continuity (high), Employee protection (attention), Liability (review), Cyber (high), Property (good).
- **`benefits`** — People score **67**, Benefits score **43**; categories Protection / Health / Wellbeing / Family; existing (✓ Personal Accident) vs. potential opportunities (Group Health, Teleconsultation, Diagnostics, Wellness).
- **`recommendations[]`** (3, prioritised):
  1. Protect business continuity — High — Business Interruption Protection.
  2. Strengthen employee protection — High — Enhanced Employee Protection + Health.
  3. Review cyber exposure — Medium — Cyber Protection.
  Each has: why, what-we-found (✓/✕ list), "what could be considered", "CoverSure can help", and links to a detail page + fix flow.
- **`requests[]`** — quote/request tracker state (the **only mutable slice**), timeline stages: Requirement identified → Request submitted → Options being prepared → Quote received → Decision → Activated.

**Session store (Zustand, persisted to `localStorage`):** `onboardingComplete`, `uploadedDocs`, `submittedRequests`, `reviewedFlags`. Static demo data is imported directly; only user-driven actions mutate the store.

---

## 5. Routing / information architecture

```
/                          Landing (Screen 1)
/onboarding                Business onboarding (2)
/onboarding/upload         Document upload + processing animation (3)
/onboarding/analysis       Business Assessment reveal (4) — "We understand your business"
/app/overview              Dashboard (12) — post-assessment home
/app/protection            Score (5) + Existing protection (6) + Risk assessment (7)
/app/people                People & Benefits (8)
/app/recommendations       Priorities (9)
/app/recommendations/[id]  Recommendation detail (10)
/app/fix/[id]              Fix with CoverSure + request form (11)
/app/documents             Documents repository (13)
/app/quotes                Quotes & Requests tracker (14)
/admin                     Light internal pipeline view (15)
```

- `/app/*` shares a **persistent layout** with the main nav: Overview, Business Protection, People & Benefits, Documents, Recommendations, Quotes & Requests, plus a business/account menu.
- Landing + onboarding use lighter chrome (no app sidebar).
- Full journey is pre-loaded: onboarding/upload are interactive but always resolve to the ABC Manufacturing state.
- **`/app/protection` stays consolidated** (one page, not three routes). It presents a single narrative — *Your Protection → Score → What you have → What we found → What needs attention*. Sections are ordered **Score, then Existing protection (coverage), then Risks**, and are **deep-linkable**:
  ```
  /app/protection#score
  /app/protection#coverage
  /app/protection#risks
  ```

---

## 6. Reusable component library

Built once, used across screens:
`ScoreDial` (radial gauge), `CategoryScoreBar`, `CoverageTable`, `RiskCard` (expandable → why / evidence / what you can do), `RecommendationCard`, `PriorityBadge`, `StatusPill` (covered / review / not-identified / potential-gap / unavailable), `ProvenanceTag` (FACT / ASSESSMENT / RECOMMENDATION), `DeterminationTrail` (the "How did we determine this?" reveal — see §8.1), `BenefitMatrix` (existing vs potential), `Timeline` (quote tracker), `UploadDropzone` (drag-and-drop, multi-file), `ProcessingSteps` (animated checklist), `AssessmentDisclaimer` (reused footer), `Logo`, `AppNav`/`AppShell`.
Plus shadcn primitives: Card, Dialog, Tabs, Button, Table, Progress, Tooltip, Select, Separator, Avatar.

---

## 7. Screen-by-screen requirements

Each screen follows the source product brief. Key intent per screen:

1. **Landing** — Hero "CoverSure Business / AI-powered protection for businesses and their people"; primary CTA **Assess My Business**, secondary **See How It Works**; three pillars (Understand / Protect / Look After Your People); journey strip *Understand → Assess → Prioritise → Protect → Manage*.
2. **Onboarding** — minimal fields (name, industry, location, turnover, employees) + "Upload your documents instead"; CTA Continue.
3. **Upload** — beautiful drag-and-drop, three cards (Financials / Existing insurance / People), multi-file; then realistic processing: "Reading your documents…" → animated ✓ steps (identifying business info → understanding financials → reviewing existing insurance → mapping employee protection → assessing risks). Not a generic spinner.
4. **Business Assessment reveal** ("We understand your business") — generated business profile (demo data) + "What we found" list + subtle note "Based on the information provided and documents reviewed." Customer-facing framing is *assessment*, not "AI analysis".
5. **Business Protection Score** — large central **64/100**; category scores with intuitive indicators; "why your score looks this way"; CTA **See What Needs Attention**.
6. **Existing protection** — coverage table with careful language (Covered / Review recommended / Not identified / Potential gap / Information unavailable) + indicative-assessment note.
7. **Risk assessment** — 5–7 expandable risk cards with severity indicators; expand → why flagged / evidence / what you can do.
8. **People & Benefits** — 187 employees, Employee Protection Score 67/100; benefit categories (Protection/Health/Wellbeing/Family); existing vs potential; CTA Explore Employee Benefits.
9. **Priorities** — strongest commercial screen; three large recommendation cards (01/02/03) with priority, why, recommended solution, CTA Explore Solution.
10. **Recommendation detail** — why this matters / what we found (✓/✕) / what could be considered / CoverSure can help; primary CTA **Fix this with CoverSure**, secondary Talk to a specialist.
11. **Fix with CoverSure** — "Let's fix it"; what-happens-next 5 steps; request form: **What would you like help with?** (pre-populated from the recommendation, e.g. "Business Continuity Protection"), contact person, phone, email, preferred contact method, optional note. Do **not** re-collect company name / industry / employee count (already captured). Confirmation "We've got it". The submitted request feeds the Quotes tracker (screen 14) and the admin pipeline (screen 15).
12. **Overview dashboard** — "Good morning, ABC Manufacturing"; 64/100; 3 priorities; Business tiles (Property good / Business Continuity needs attention / Liability review / Cyber needs attention); People (Employee Protection 67, Benefits 43); priorities list; CTA Review priorities.
13. **Documents** — repository: Financials ✓ Analysed, Insurance policies ✓ 4 documents analysed, Employee benefits ✓ Analysed; upload/view/replace/status; show which docs contributed.
14. **Quotes & Requests** — status tracker with modern workflow timeline (not email); stages per §4.
15. **Admin (light)** — separate `/admin` route: metrics (SMEs assessed, assessments completed, recommendations accepted, quote requests, purchases, revenue opportunity), SME table (Business | Score | Priorities | Status | Opportunity), and one SME drill-down (profile / documents / extracted info / risks / recommendations / quote requests / activity). No full edit workflows.

---

## 8. Insurance-language guardrails

A single constants file (`lib/language.ts`) holds approved phrasing and every status label. **Never** render absolute claims ("You are underinsured", "You are not protected", "This insurance is required"). **Always** use: "Potential gap identified", "Coverage may warrant review", "Based on the information provided…", "Not identified in the documents reviewed", "Indicative assessment", "Final coverage is subject to underwriting and policy terms". `AssessmentDisclaimer` is reused on protection/risk/recommendation screens.

The UI subtly surfaces the FACT / ASSESSMENT / RECOMMENDATION distinction via `ProvenanceTag` where useful.

### 8.1 "How did we determine this?" — determination trail (core feature, not polish)

Every score category, risk, and recommendation exposes a **"How did we determine this?"** affordance that reveals the reasoning chain in four labelled layers:

```
Facts        → what was found (business attributes, from the profile)
Evidence     → what the documents did / did not show
Assessment   → the indicative inference (careful language)
Recommendation → the suggested action
```

Example — *Why is Cyber 25/100?*
- **Facts:** 187 employees · manufacturing business · customer/vendor data handled
- **Evidence:** No cyber policy identified in uploaded documents
- **Assessment:** Cyber exposure may warrant review
- **Recommendation:** Explore cyber protection

This is a first-class product feature: it makes the assessment feel trustworthy and lays the conceptual foundation for the eventual production AI architecture. The data model carries a `determination` object (`facts[]`, `evidence[]`, `assessment`, `recommendationRef`) on each score category, risk, and recommendation, rendered by the `DeterminationTrail` component (drawer/expandable). It is available on the Protection score/coverage/risk sections and on recommendation detail.

---

## 9. Interaction requirements (must actually work)

Landing CTA · onboarding · file-upload simulation · processing animation · continue buttons · dashboard navigation · scorecard drill-down · risk expansion · recommendation drill-down · employee-benefits navigation · "Fix with CoverSure" · quote/request submission · confirmation · documents navigation · admin navigation. Simulated data where no real backend exists; no pretence of a connected insurer API.

---

## 10. Responsive & polish

Desktop-first (persistent sidebar), collapsing to top bar + drawer on tablet/mobile; relative units, flex/grid. Motion only where it reinforces meaning (processing sequence, score count-up, card expand). Clean, sophisticated, trustworthy, minimal, data-rich but easy to read — closer to a financial/business operating platform than an insurance website. Avoid generic-AI-chatbot aesthetics, excessive gradients, cartoon illustrations, product-catalogue feel.

---

## 11. Testing / verification

No backend logic, so verification is:
- `tsc --noEmit` type-check passes and `next build` succeeds.
- A demo-data invariant check (script): all scores in 0–100, every recommendation `id` resolves to a detail route, every coverage status is a valid enum member, benefit categories non-empty.
- Manual click-through of the §9 interaction checklist; confirm the dev server renders each route in §5 before claiming done.
- Wire an npm `verify` script (type-check + invariant check).

---

## 12. Build priority — critical vertical slice first

The implementation plan **must** treat the core diagnosis-to-action journey as the highest-priority vertical slice and make it excellent before spending effort on navigation polish, admin UI, document repository, account settings, or secondary states.

**Critical path (build and perfect this first):**
```
Business → Documents → Business Assessment → Protection Score
        → Coverage + Risks → Top Priorities → Recommendation
        → Fix with CoverSure → Lead captured
```
If that journey is excellent, we have an MVP. The determination trail (§8.1) is part of this slice, not deferred polish. Everything else (admin, documents repository, account menu, deep responsive edge cases) is layered on **after** the critical path is solid.

---

## 13. Out of scope (YAGNI)

Deferred for this MVP (prototype simulates their outcomes, does not implement them):
- Real authentication
- OCR / production document processing
- Real insurer APIs
- Payments
- Automated underwriting
- **Full admin editing workflows** (create/update/delete of records)
- Multi-tenant data, i18n

**Explicitly IN scope (not deferred):** the lightweight admin/pipeline view (§7 screen 15). It must demonstrate the end-to-end business loop **SME → Assessment → Recommendation → Request → CoverSure action**, proving this is a business platform and not merely an assessment tool. It needs read + a small amount of status change to tell that story, but not full CRUD editing.
