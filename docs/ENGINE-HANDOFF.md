# CoverSure Business — Assessment Engine: Tech Handover

**Date:** 2026-09-15 · **Branch:** `feat/portfolio-phase-i` (NOT merged, NOT pushed) ·
**Baseline commit:** `986a368` · **Latest:** `6c11d62`.
**Status:** Backend engine **stub + specs**, fully tested, **NOT wired into the app and NOT deployed.**

> One-line summary: we have built a **pure, deterministic scoring engine (v0.2)** with a tested
> **prototype of a next-gen model (v0.3 Path C)**, plus a complete **input/data-acquisition
> specification**. It is a self-contained library under `src/lib/engine/` with **82 passing tests**.
> The live site still runs on the old **authored demo data** — nothing here touches production yet.

---

## 1. What runs today vs what we built

| | Live site (`coversure-business.vercel.app`) | This handover |
|---|---|---|
| Scores | **Authored/hardcoded** in `src/lib/demo-data.ts` (e.g. overall 64) | **Computed** by the engine from structured inputs |
| Wired into UI? | Yes (Phase I screens) | **No** — engine is not imported by any page/component/store |
| Deployed? | Yes | **No** (branch not pushed/merged) |

The engine is a **parallel, unwired library**. Swapping the demo onto engine output is a deliberate
**product decision that has not been made** (see §6).

---

## 2. Module map (`src/lib/engine/`, ~2,770 LOC)

| File | LOC | Responsibility |
|---|--:|---|
| `types.ts` | 230 | Canonical schema: `Extracted<T>`, `TermState`, `AssessmentMode`, `LineStatus`, `ExposureLineKey`, `ExtractedPolicy`, `ExtractedAsset`, `EngineBusinessProfile`, line I/O types. |
| `calibration.ts` | 154 | All ⚙️ tunables in one place: score bands, SI caps, penalty floor, confidence gate, category-weight clamps, `INDUSTRY_LINE_WEIGHTS` (Manufacturing + IT/ITES), `GP_MARGIN`, `SCORE_MODEL` flag. |
| `adequacy.ts` | 213 | **Stage 5** pure functions: `siAssessment`, `coverageAdequacy` (tri-state), `assessLine` (per-line status + score). |
| `scoring.ts` | 113 | **Stage 6** pure functions: `categoryScore`, `deriveCategoryWeights`, `businessProtectionScore`, `completeness`. |
| `engine.ts` | 72 | v0.2 orchestrator `assessBusiness(lines, industry)` → single Business Protection Score. |
| `pathc.ts` | 158 | v0.3 **prototype** `assessBusinessPathC` → Adequacy + Breadth + Evidence Completeness + guard flags. |
| `bridge.ts` | 64 | Maps engine output → the demo's public types (the seam for wiring into UI). |
| `index.ts` | 32 | Public barrel export. |
| `input-schema-v1.ts` | 1,383 | Machine-readable **Input & Data Acquisition** spec: `INPUT_FIELDS` (107 fields), `EXPOSURE_TRIGGERS`, `ENGINE_EXPOSURE_LINES`. |
| `__fixtures__/` | 347 | `abc.ts` (corrected worked example), `synthetic.ts` (4 pressure-test profiles), `_builders.ts` (fixture helpers). |

**Tests (`src/test/`, ~800 LOC, 82 tests):** `engine.adequacy` (15), `engine.scoring` (9),
`engine.abc` (12), `engine.bridge` (5), `engine.pathc` (9), `engine.pathc.pressure` (11),
`input-schema-v1` (11) + 10 pre-existing demo-data invariants.

---

## 3. Architecture — the intended pipeline

```
1 INTAKE      business profile + uploaded documents
2 EXTRACTION  AI/OCR → structured facts (Extracted<T>, tri-state terms)   ← NOT BUILT (the AI boundary)
3 EXPOSURE    which lines are material + benchmark R per line             ← NOT BUILT (R-computation)
4 COVERAGE    map policies → lines, de-dup overlaps                        ← NOT BUILT
5 ADEQUACY    per line: SI adequacy × coverage adequacy → status          ← BUILT (adequacy.ts)
6 SCORING     line → category → Business Protection Score + completeness   ← BUILT (scoring.ts, engine.ts)
7 GENERATE    risks / gaps / recommendations + narrative                   ← NOT BUILT
```

**Built = Stages 5–6** (pure, deterministic, `100%` reproducible, no `Date.now()`, no I/O).
**Design principle:** AI extracts facts; the **engine computes every number deterministically** — the
score is never asked of an LLM. Each fact carries `FACT → EVIDENCE → ASSESSMENT` provenance.

**Critical for the tech team:** the engine consumes the benchmark `R`, the coverage `checklist[]`, and
`adverse[]` **as inputs**. The formulas that *produce* them (benchmark bands, checklist weights) are
**specified in `docs/assessment-calibration-starter.md` as ⚙️ proposals but are NOT in code.** Building
Stage 3 (compute `R` from facts) and encoding Table C checklists is the main remaining engine work.

---

## 4. Two scoring models (both tested; v0.2 is the reference)

- **v0.2 — `assessBusiness`** (active, `SCORE_MODEL = "v0.2"`): one conservative Business Protection
  Score. Not-identified material lines score 0 (pull the score down). This is the **reference
  baseline** — 51 of the 82 tests pin it; do not change it without a versioned decision.
- **v0.3 Path C — `assessBusinessPathC`** (prototype, opt-in): three dimensions —
  **Protection Adequacy · Protection Breadth · Evidence Completeness** — plus guard flags
  (`breadthLimited`, `noIdentifiedCover`, `provisional`). A `guardedScore = adequacy × breadth`
  reproduces the v0.2 number when documentation is complete (continuity bridge). Proposed as the
  customer-facing direction but **not adopted** — see `docs/risk-assessment-engine-v0.3-proposal.md`.

---

## 5. How to run

```bash
npm run verify        # tsc --noEmit + all 82 tests (the gate)
npm test              # all tests
npm run test:engine   # engine tests only
```

Tests use Node's built-in runner with `--experimental-strip-types` (imports `.ts` directly; needs a
recent Node — validated on v24). `tsconfig` has `allowImportingTsExtensions: true` for this.

---

## 6. Decisions & invariants to preserve

1. **Conservative posture:** `not-identified` ≠ `confirmed-absent`; a missing input NEVER defaults to
   `confirmed-absent`; `unavailable` (a fact we lack) is distinct and excluded from the adequacy core;
   tri-state `unconfirmed` is never coerced to `absent`. (Enforced by tests.)
2. **Determinism & provenance:** no LLM in the number path; every fact carries source + confidence;
   `CONFIDENCE_GATE = 0.70` routes low-confidence facts to broker review.
3. **`completeness` ≠ documentation completeness** — it means "how much could we assess." v0.3 renames
   it **Evidence Completeness** (rationale in the diagnostic).
4. **Demo re-basing is an unmade product decision:** honest engine output for the demo company is ~27
   (v0.2) vs the authored 64 — do not silently swap the UI. See `docs/diagnostic-27-vs-64.md`.
5. **Calibration is starter/⚙️:** `82 of 107` input fields and most benchmark/checklist values await
   **broker sign-off** — they are proposals, not settled values.

---

## 7. What is NOT built (the roadmap)

| Item | Where specified |
|---|---|
| **Stage 2 — AI/OCR extraction** (documents → `Extracted<T>` schema, tri-state terms, confidence) | spec §2–3 |
| **Stage 3 — benchmark R computation** (Table B/B2/B3 formulas → `R`) + exposure catalog | calibration Tables B, `input-schema-v1.ts` |
| **Coverage checklists in code** (Table C1–C6 item weights; PI/D&O/Marine/Machinery/Motor-OD/GTL checklists undefined) | calibration Table C |
| **Stage 4 — coverage mapping / de-dup** of overlapping policies | spec §4 |
| **Stage 7 — risk/gap/recommendation generation + narrative** | spec §7 |
| **UI wiring** (engine → screens via `bridge.ts`) | — |
| **Claims ingestion** (claims MIS is not currently an engine input) | matrix §8.16 |
| **Broker calibration sign-off** (unlocks the 82 OPEN items) | calibration §10 |

---

## 8. Documentation index (`docs/`)

| File | Purpose |
|---|---|
| `risk-assessment-engine.md` | v0.2 engine **spec** (the reference design). |
| `assessment-calibration-starter.md` | All ⚙️ calibration tables (A–F) for broker sign-off. |
| `input-data-acquisition-matrix-v1.md` | Field-level "extract first, ask later" data-acquisition spec. |
| `risk-assessment-engine-v0.3-proposal.md` | Proposed multi-dimensional scoring direction. |
| `diagnostic-27-vs-64.md` | Why honest output diverges from the demo; Path C pressure-test evidence. |
| `ENGINE-HANDOFF.md` | **This document.** |

---

## 9. Repo / deploy state

- Branch `feat/portfolio-phase-i`, **4 commits ahead of `origin`, not pushed, not merged to `main`.**
- Engine commits: `986a368` (v0.2 + Path C + diagnostic + v0.3 proposal), `6c11d62` (input matrix).
- Production (`coversure-business.vercel.app`) unaffected — still Phase I authored data.
- **To hand over to the team:** `git push` the branch → gives a Vercel preview URL and makes the code
  reviewable; merge to `main` only after the demo-rebasing decision (§6.4).

---

## 10. Suggested first tasks for the tech team

1. Read this doc → `risk-assessment-engine.md` → run `npm run verify` (see 82 green).
2. Get **broker sign-off on `assessment-calibration-starter.md`** — this unlocks Stage 3 + checklists.
3. Decide **v0.2 vs v0.3 Path C** as the customer-facing model (`risk-assessment-engine-v0.3-proposal.md`).
4. Build **Stage 2 (extraction)** against the `input-schema-v1.ts` contract and **Stage 3 (R computation)**.
5. Only then wire into the UI via `bridge.ts` — and make the demo-rebasing call first.
