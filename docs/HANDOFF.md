# CoverSure Business — Session Handoff / Context Trail

**Purpose:** Continuity note so a fresh Claude Code session rooted in `D:\CoverSure Business` can pick
up without re-deriving context. Written 2026-09-15.

---

## 1. What this product is

**CoverSure Business** — a premium B2B "AI-powered protection for businesses and their people" MVP.
SME / mid-market **multi-line commercial insurance** protection platform (property, fire, business
interruption, liability, cyber, employee benefits, etc.). India, INR.

- **Repo:** `D:\CoverSure Business` — greenfield, **owned fully by this workstream** (we write freely).
- **Stack:** Next.js 14.2.5 (App Router) · TypeScript · Tailwind 3.4 · shadcn/ui (**CLI pinned 2.10.0**,
  NOT @latest which is v4/Tailwind-v4-only) · zustand 5 (persisted) · framer-motion 13 · recharts 3 ·
  lucide-react · DM Sans. Simulated data, **no backend**, localStorage persistence.
- **Canonical demo data:** `demoCompany` = **ABC Manufacturing Pvt. Ltd.** (₹82 Cr turnover, ₹24 Cr
  fixed assets, ₹9.4 Cr inventory, 187 employees). One source of truth in `src/lib/demo-data.ts`;
  pure derivation in `src/lib/portfolio.ts`.
- **PI/D&O visual design system** (midnight `#001965` / royal `#0032C8` / electric `#1E56FF` / mint
  `#A2FAA3`), authoritative dark ScoreBand, `.cs-container`/`.cs-narrow`/`.cs-form`, real CoverSure
  logo at `public/coversure-logo.png`.

## 2. ⚠️ CoverSure Business ≠ ClarityGMC

These are **two different products** — do not conflate them:
- **CoverSure Business** — this repo. SME multi-line protection.
- **ClarityGMC** (`D:\claritygmc-foundation`) — a *separate* group-health renewal-intelligence engine
  (claims MIS, employee census, rules/recommendations, board packs). **Read-only** for us; a VS Code
  executor owns its writes. Never import ClarityGMC logic into CoverSure or vice versa.

## 3. Current build state

- **Branch:** `feat/portfolio-phase-i` — **NOT merged** (deliberately, pending review).
- **Deployed:** https://coversure-business.vercel.app — currently serving the **Phase I** build
  (Protection Portfolio is the hero product).
- **Phase I** = Protection Portfolio as the system-of-record hero: `/app/portfolio` (policies, assets,
  asset↔policy relationships, renewals 30/60/90, add-asset, share), `/app/insights`, reworked
  overview/nav, service-first CTAs ("Secure with CoverSure" / "Review with CoverSure").

## 4. Assessment engine design (the recent work)

Design of the **real** risk-assessment engine that will replace the demo's *authored* scores. Two docs
(both `.md` + `.xlsx`), committed v0.2 as **`8af4692`**:
- `docs/risk-assessment-engine.md` (+ `.xlsx`, 7 sheets) — the engine spec.
- `docs/assessment-calibration-starter.md` (+ `.xlsx`, 17 sheets) — starter calibration tables.

**Core logic:** AI/OCR extraction is the *only* AI-for-facts boundary → then deterministic:
exposure model (which lines are material + benchmark `R`) → coverage mapping (de-dup overlaps) →
**adequacy = Sum-Insured adequacy × Coverage/terms adequacy** → scoring (line → category (derived,
clamped) → **Business Protection Score** + **completeness indicator**) → risks / gaps / recommendations.
Every output carries a `FACT → EVIDENCE → ASSESSMENT → RECOMMENDATION` trail.

**Existing-policy adequacy** is a first-class, two-axis model: **sum insured** *and* **coverage terms**
(tri-state `present | absent | unconfirmed`). `assessmentMode` per line: `quantitative` |
`compliance` (WC, Motor-TP — statutory pass/fail) | `presence` (D&O).

### DECIDED — posture (locked 2026-09-15)
**Conservative / evidence-based:**
- `not-identified` (no policy found in docs) → **scored 0** (no credit for unevidenced protection).
- Narrative **never** equates not-identified with confirmed absence ("not identified in the documents
  reviewed").
- `confirmed-absent` — **new distinct state** for positively-evidenced absence (explicit exclusion or
  client/broker confirmation); also scored 0, but narrative may state a confirmed gap.
- `unavailable` — a fact *we* lack (e.g. CTC) → excluded from score core, counts against completeness.

### Still open (⚙️ calibration only — need CoverSure broking)
Benchmark bands (liability/PI/D&O/cyber, GMC/GPA per-life), coverage-checklist weights + adverse-term
penalties, category-weight clamps, deterministic "data-heavy" Cyber trigger, combiner-function
validation (si×coverage multiplicative vs min/avg; penalty floor 0.5). All flagged ⚙️ in the tables.

## 5. Next steps (pick one)

- **(a)** CoverSure broking marks up the calibration workbook with real numbers → fold into versioned
  config.
- **(b)** **Build the engine stub** — `Extracted<T>` / `TermState` / `LineStatus` / `AssessmentMode`
  schema + pure adequacy + scoring functions, **unit-tested** (include the corrected ABC worked example
  as a fixture), wired behind the demo's existing types so it can replace authored `demoCompany`.

*(The user's last message queued "build the engine stub with unit tests" — option (b).)*

## 6. Guardrails (non-negotiable)

- Insurance language: never "underinsured / inadequate / required / not protected"; use "potential gap
  identified", "may warrant review", "not identified in the documents reviewed", "subject to
  underwriting".
- Determinism: no `Date.now()` in scoring; fixed `asOfDate` (`2026-09-01` in demo).
- shadcn CLI stays pinned at **2.10.0**; never `@latest`.
- Never bypass permission/classifier blocks by splitting destructive commands.

## 7. Chronological trail of the design conversation

1. Reviewed the deployed Phase I site (live, correct).
2. User asked for the **real** assessment logic (not the demo). Initially I mistakenly explored
   ClarityGMC — corrected: the two are separate products.
3. Wrote the engine spec + starter calibration tables (v0.1), then Excel versions.
4. User gave a **P0/P1/P2 review**; I folded all P0/P1 into **v0.2** (assessment modes, tri-state
   terms, reproducibility rule, inventory/de-dup, GMC normalisation, completeness indicator, derived
   category clamps, combiner validation, corrected ABC example).
5. User **decided the posture** (conservative/evidence-based, above) and had me **commit all four**
   files as v0.2 (`8af4692`).
6. User is moving to a new session rooted in this repo (this handoff).
