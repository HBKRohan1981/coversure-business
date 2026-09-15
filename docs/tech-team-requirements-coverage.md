# Tech-Team Requirements — Coverage Map

**Responds to:** "Business Risk Analysis Platform — Consolidated meeting notes & requirements (11 Sep 2026)".
**As of:** 2026-09-15 · branch `feat/portfolio-phase-i`.
**Legend:** 🟢 delivered · 🟡 partial / proposed (needs sign-off) · 🔴 not built (needs discussion + build).

> Scope note: what we have built is the **assessment engine (the brain)** + the **data-acquisition
> spec**. Several requirements are **product / frontend / ops** (upload UX, async POC, dashboards,
> approvals, email links) — those are out of the engine's scope and flagged for the app build.

---

## Section 1 — Requirements from Rohan

| # | Requirement | Status | Where it's answered | What's still needed |
|---|---|:--:|---|---|
| **1.1** | Risk logic + weightages | 🟡 | `coversure-input-data-matrix-v1.xlsx` → **Risk Logic & Weightages** sheet; `risk-assessment-engine.md`; coded in `adequacy.ts`/`scoring.ts` | Methodology is CODED. Final **weightages need broker sign-off** (only Manufacturing + IT/ITES coded; other industries are proposals). |
| **1.2** | Actions per risk + "Needs attention" order | 🟡 | xlsx → **Actions & Priority** sheet (severity grid + action-per-status + ordering rule) | This is the **spec/proposal**. The **engine generation of the list (Stage 7) is not built** and severity grid needs sign-off. |
| **1.3** | Field-level list per document (**Excel**) | 🟢 | **`coversure-input-data-matrix-v1.xlsx`** → Master Matrix (107 fields) + Fields-by-Document; also `input-data-acquisition-matrix-v1.md` / `input-schema-v1.ts` | Delivered in Excel. Gap: **wellness/OPD/doctor/lab benefit fields are not engine lines** (tied to 1.5). |
| **1.4** | 2–3 sample document sets | 🔴 | — | Not produced. **Best if the team supplies real anonymised sets**; we can generate clearly-labelled DUMMY sets for extraction testing if preferred. |
| **1.5** | Final ~15 benefit checklist | 🟡 | xlsx → **Benefit Checklist** sheet (proposed ~15) | **Proposal — needs confirmation.** Engine scores only GMC/GPA/GTL/WC today; the rest are "catalog only". |
| **1.6** | Mandatory vs optional documents | 🟢 | xlsx → **Documents** sheet | Delivered. Note the engine **never hard-blocks** — missing docs lower *Evidence Completeness* rather than stop the run (matches your "don't block the user" decision). |

## Sections 2–5 — input flow, missing-data, dashboard, decisions

These are largely **product / frontend / ops**. Engine alignment:

| Item | Status | Note |
|---|:--:|---|
| Classification "relevant vs not relevant, no tiering" | 🟢 | Matches engine `EXPOSURE_TRIGGERS` (only relevant lines assessed) and the no-tier design. |
| "Do not block the user" on missing data | 🟢 | Directly supported by engine states: `unavailable` / `not-identified` / `unconfirmed` (nothing blocks). |
| "Documents go for approval, numbers do not" | 🟡 | Engine has the confidence gate / broker-QA concept; the **approval workflow itself is an app/ops build**. |
| Async POC (24–48h), email-link prompts, prefill review | 🔴 | Ops/app workflow — not engine. |
| Portfolio dashboard, asset↔policy mapping, selective PDF sharing | 🔴 | Frontend — not in this backend. Asset↔policy mapping is spec'd (Stage 4) but not built. |
| "Needs attention" ordering in the UI | 🟡 | Ordering rule proposed (1.2); generation is Stage 7 (not built). |

---

## What the team gets right now
- **`coversure-input-data-matrix-v1.xlsx`** — the Excel they asked for (1.3), plus 1.1, 1.2, 1.5, 1.6 as sheets.
- **`ENGINE-HANDOFF.md`** — module map, built-vs-not pipeline, how to run tests, roadmap.
- The engine + 82 passing tests (`npm run verify`).

## Open items to discuss before building
1. **Broker sign-off on calibration** (`assessment-calibration-starter.md`) — unlocks final weightages (1.1), benchmark bands, coverage-checklist weights. This is the single biggest unlock.
2. **Confirm the ~15 benefit list (1.5)** and decide which non-GMC/GPA/GTL benefits should be *scored* vs *catalogued* (wellness/OPD/etc.).
3. **Sample document sets (1.4)** — real anonymised (preferred) or we generate dummies.
4. **Stage 7** (risk/action/priority generation) — build once severity grid is signed off (1.2).
5. **Wellness/OPD scope** — currently not engine lines; product decision.
6. **App/ops workflows** (async POC, approvals, email prompts, dashboards) — separate frontend/ops track.
