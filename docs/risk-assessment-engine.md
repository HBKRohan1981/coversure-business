# CoverSure Business — Risk Assessment Engine Specification

**Status:** Draft v0.2 (design spec) — engine stub BUILT (`src/lib/engine/`). This remains the
**reference baseline**. A proposed **v0.3 direction** (multi-dimensional: Adequacy + Breadth +
Evidence Completeness + flags) is documented in `risk-assessment-engine-v0.3-proposal.md`; it does
not change this v0.2 definition.
**Scope:** The real assessment engine that replaces the demo's authored scores.
**Owner:** CoverSure product + broking. Calibration values marked ⚙️ need CoverSure sign-off.
**v0.2 changelog:** added assessment modes (not everything is SI-scored); tri-state coverage terms;
"unconfirmed ≠ absent" reproducibility rule; score-completeness indicator; GMC normalisation;
inventory/double-count handling; combiner-function guardrails; corrected worked example. See §12.

> This document specifies how CoverSure Business turns uploaded documents + a business
> profile into a **Business Protection Score**, a set of **protection gaps**, and an
> **adequacy assessment of existing policies** (sum insured *and* coverage terms).
> It is the logic behind the demo screens — the demo hardcodes these outputs; this
> engine derives them.

---

## 1. Design principles

1. **AI extracts, the engine assesses.** LLM/OCR models are used **only** to read documents into a
   structured schema and to write narrative prose. The **risk score, adequacy ratios, and gaps are
   computed deterministically** — never asked of an LLM. Every number is reproducible.
2. **Everything is evidence-backed.** Every output carries a
   `FACT → EVIDENCE → ASSESSMENT → RECOMMENDATION` determination trail. No citation → no claim.
3. **Unconfirmed ≠ absent — conservative, evidence-based posture (DECIDED).** "Not identified in the
   documents reviewed" is a *documentation state* and is **never** narrated as confirmed absence.
   The posture is **conservative**: the engine gives **no score credit for protection it cannot
   evidence**, so a material line that is not-identified scores **0** (§5f). A separate
   **`confirmed-absent`** state is used only where absence is positively evidenced (an explicit
   policy exclusion, or client/broker confirmation) — it also scores 0, differing only in that its
   narrative may state a confirmed gap. `unconfirmed` inputs are never coerced to `absent`.
4. **Benchmarks must be computable from captured facts.** A benchmark that needs a fact we don't
   hold (e.g. GPA needing CTC) returns **`unconfirmed`**, not a guessed number. No phantom precision.
5. **A score carries its own completeness.** Every score ships with a **completeness indicator**
   ("based on N of M expected data points confirmed") so a half-evidenced 64 never reads as
   authoritative as a fully-evidenced 64 (§6).
6. **Careful, advisory language.** Never "underinsured / inadequate / required / not protected".
   Use "potential gap identified", "may warrant review", "not identified in the documents reviewed",
   "indicative; subject to underwriting".
7. **Deterministic & versioned.** No `Date.now()` in scoring; fixed `asOfDate`; every score records
   `scoring_version`, `extraction_version`, `calibration_version`.
8. **Human-in-the-loop.** Low-confidence / unconfirmed extractions and every client-facing score pass
   a broker QA gate before finalisation.

---

## 2. End-to-end pipeline

```
1. INTAKE       business profile (industry, turnover, headcount, PAYROLL/CTC, assets, locations)
                + document upload (policy schedules, financials, asset register, ...)
        │
2. EXTRACTION   AI/OCR → canonical structured facts; each field {value, sourceRef, confidence}
        │        coverage terms extracted as present | absent | unconfirmed (tri-state)
        │
3. EXPOSURE     which lines are material for THIS business + how each is assessed (assessmentMode)
        │        + recommended-cover benchmark R (quantitative lines only)
        │
4. COVERAGE MAP match extracted policies → exposure lines; de-duplicate overlapping cover
        │
5. ADEQUACY     per line, by mode: quantitative (SI × coverage) | compliance | presence → status
        │
6. SCORING      line scores → category scores (derived, clamped) → Business Protection Score
        │        + completeness indicator
        │
7. GENERATE     risks + protection gaps + prioritised recommendations + trails
```

Stages 3–7 are **pure deterministic functions**. Stage 2 is the AI boundary.

---

## 3. Canonical data model (extraction target)

Provenance travels with every value; coverage terms are **tri-state**:

```ts
type Extracted<T> = { value: T; sourceRef: string; confidence: number }; // 0..1
type TermState = "present" | "absent" | "unconfirmed";   // NEVER default unconfirmed → absent
type AssessmentMode = "quantitative" | "compliance" | "presence";
type LineStatus =
  | "covered" | "review" | "potential-gap"
  | "not-identified"     // no policy found in docs; scored 0; narrative "not identified in documents reviewed"
  | "confirmed-absent"   // absence positively evidenced (exclusion / confirmation); scored 0; narrative = confirmed gap
  | "unavailable";       // a fact WE lack (e.g. CTC) blocks assessment; excluded from score core, hits completeness

interface ExtractedPolicy {
  key: string;
  line: ExposureLineKey;              // property | fire | bi | liability | marine | gpa | gmc | cyber | do | pi | wc | motor ...
  type: string;
  insurer: string;
  policyNumber: string;
  sumInsured: Extracted<number>;       // INR; for GMC see §5d normalisation
  premium: Extracted<number>;
  startDate: Extracted<string>;
  renewalDate: Extracted<string>;
  basisOfValuation?: "reinstatement" | "market-value" | "agreed-value" | "unknown";
  subLimits: Extracted<Record<string, number>>;
  addOns: Record<string, TermState>;   // tri-state per checklist item
  exclusions: Record<string, TermState>;
  deductible?: Extracted<number>;
  relatedAssetKeys: string[];
}

interface ExtractedAsset {
  key: string; name: string; type: string;
  category: "immovable" | "movable";
  location: string;
  declaredValue: Extracted<number>;
  valuationBasis?: "reinstatement" | "cost" | "market";   // stock/inventory = cost/market, not reinstatement
}

interface BusinessProfile {
  // ... industry, turnover, employees, fixedAssets, inventory ...
  avgCTC?: Extracted<number>;           // needed for GPA/GTL benchmarks; if absent → those go unconfirmed
}
```

**Extraction confidence gate ⚙️:** field `confidence < 0.70` → surfaced as "needs confirmation",
routed to broker QA, and counted against completeness (§6) — never scored as a hard fact.

---

## 4. Stage 3–4 — Exposure model, assessment mode, coverage mapping

For a business, the engine decides per line: **is it material** (weight `wᵢ`), **how is it
assessed** (`assessmentMode`), and for quantitative lines **the benchmark `R`**.

### Assessment modes (not everything is a sum-insured ratio)
| Mode | Lines | How adequacy is judged |
|---|---|---|
| **quantitative** | property, fire, BI, machinery, marine, liability, product, PI, D&O, cyber, GPA, GMC, GTL | SI adequacy × coverage adequacy (§5a–c) |
| **compliance** | Workmen's/Employees' Comp, Motor Third-Party | statutory pass/fail — present & compliant, or a **compliance gap** (§5e). Not forced onto a 0–100 SI curve. |
| **presence** | D&O (for entities where it's advisory not sized) | exists / does not exist / unconfirmed |

Compliance-mode lines are scored **pass (100) / fail (0) / unconfirmed**, and are also surfaced in a
dedicated **Compliance strip** so a statutory miss reads as a compliance issue, not a coverage
opinion. ⚙️ Decide whether compliance lines also fold into the 0–100 score or sit only in the strip.

### Coverage mapping + de-duplication (fixes double-count)
An asset's coverage is the **union** of policies that name it; overlapping SIs are **not summed**.
Where two policies cover the same asset (demo: Property + Fire both on the factory), the engine
takes the **governing cover per peril** and records the relationship once. Inventory/stock is mapped
to its **declaration/floater** cover, valued at **cost/market**, and is **excluded from the
reinstatement benchmark** used for buildings + plant (§5a note). ⚙️ Confirm stock treatment.

The industry → {applicable lines, weights, modes, benchmark formulas} mapping is the biggest
**calibration deliverable** — see `assessment-calibration-starter.*` Tables A/B.

---

## 5. Stage 5 — Adequacy (existing-policy: sum insured **and** coverage)

### 5a. Sum-Insured adequacy (quantitative lines)
```
C  = identified sum insured for the line (INR)
R  = recommended benchmark (Stage 3), computed ONLY from captured facts
     → if R needs a fact we don't hold (e.g. CTC): si_adequacy = UNCONFIRMED, not a number
si_ratio     = clamp(C / R, 0 .. 1.2)
si_adequacy  = min(si_ratio, 1)
```
**Buildings + plant** are benchmarked on **reinstatement value**; **stock** is a separate
declaration line valued at cost/market (not folded into the reinstatement `R`). If
`basisOfValuation = "market-value"` where reinstatement is expected → apply an average/under-insurance
penalty even when `C ≈ R` (market-value SI can trigger the average clause at claim).

### 5b. Coverage / terms adequacy — tri-state
Each line has a weighted checklist. Each item is `present | absent | unconfirmed`:
```
denom          = Σ weightₖ   over items that are present OR absent      (unconfirmed items EXCLUDED)
coverage_score = Σ (present ? weightₖ : 0) / denom
term_penalty   = clamp( Π(1 − penaltyⱼ) for adverse terms confirmed-present , floor = 0.5 )
coverage_adequacy = coverage_score × term_penalty
```
- **Unconfirmed items are excluded from the denominator** — they neither credit nor penalise; they
  count against completeness (§6) and route to broker confirmation.
- **Penalty floor 0.5 ⚙️** stops a stack of adverse terms from zeroing an otherwise-sized policy
  (needs validation — §10 combiner testing).

### 5c. Line adequacy + status (quantitative)
```
line_adequacy = si_adequacy × coverage_adequacy      // multiplicative: a big SI shortfall is NOT
                                                      // offset by good terms (⚙️ validate vs min/avg)
status:
  material line, no policy found         → "not-identified"    (scored 0; "not identified in documents reviewed")
  absence positively evidenced           → "confirmed-absent"  (scored 0; narrative = confirmed gap)
  si_adequacy or coverage UNCONFIRMED    → "unavailable"       (data gap — excluded from score core, hits completeness §6)
  line_adequacy ≥ 0.90                   → "covered"
  0.55 ≤ line_adequacy < 0.90            → "review"
  0 < line_adequacy < 0.55               → "potential-gap"

line_score = line_adequacy × 100        // not-identified & confirmed-absent → 0 (conservative posture, §5f)
```

### 5d. GMC normalisation (per-life, banded)
GMC has no single SI. Normalise as:
- **Headline SI = lowest grade's per-life SI** (conservative). `C_gmc = min(grade SIs)`.
- **Grade spread** (min→max) surfaced as a *structural finding*, not scored down.
- **Family definition** (self / +spouse+kids / +parents) is a **coverage-checklist item**, tri-state.
⚙️ Confirm "lowest grade" vs "headcount-weighted average" as the headline.

### 5e. Compliance-mode adequacy (WC, Motor TP)
```
pass       → policy present AND statutory conditions met  → 100
fail       → statutory line absent or non-compliant       → compliance gap (severity from line materiality)
unconfirmed→ cannot determine from documents              → broker confirm
```
No SI ratio. Output feeds the Compliance strip (and the score only if ⚙️ decided in §4).

### 5f. "Not-identified" posture — DECIDED: conservative / evidence-based
A material line with no policy in the documents is **not-identified**, and:
- **Scoring:** it scores **0** for the assessment. The engine gives no credit for protection it
  cannot evidence, so a not-identified material line pulls the score down. (`unavailable` — a fact
  *we* lack — is different: excluded from the score core, counted against completeness §6.)
- **Narrative:** it is **never** equated with confirmed absence. Wording stays "not identified in the
  documents reviewed"; the client can resolve it by supplying the policy (→ assessed as cover) or by
  confirming it does not exist (→ `confirmed-absent`).
- **`confirmed-absent`** is the distinct state for *positively evidenced* absence (an explicit
  exclusion in a schedule, or an on-record client/broker confirmation). It also scores 0, but its
  narrative may state a confirmed gap.

Both `not-identified` and `confirmed-absent` score 0; they differ only in narrative certainty and in
how the client resolves them. This posture is conservative by design — the score reflects only
evidenced protection.

---

## 6. Stage 6 — Scoring

```
category_score  S_cat = Σ(wᵢ · line_scoreᵢ) / Σ(wᵢ)     over SCORED lines in the category
                        (unavailable/unconfirmed lines excluded from core; counted in completeness)
category weight W_cat  = normalised Σ of the category's line weights for THIS business,
                        clamped to [W_min, W_max] ⚙️ so no category vanishes or dominates
Business Protection Score = Σ(W_cat · S_cat) / Σ(W_cat)
```
- A `not-identified` or `confirmed-absent` material line contributes `line_score = 0` at its weight →
  pulls the score down (conservative posture §5f; this is why ABC's missing BI/Cyber fall out of the
  math). `unavailable` lines are excluded from the core and counted against completeness instead.
- Tone bands (reuse demo `scoreTone`): ≥70 good · 40–69 attention · <40 high.

### Completeness indicator (new)
```
completeness = confirmed_expected_datapoints / total_expected_datapoints   // 0..1
```
Displayed alongside the score ("Assessment based on 12 of 17 expected data points confirmed"). Below
a threshold ⚙️ the score is shown as **provisional** pending broker confirmation. Reproducibility: the
full derivation (per-line C, R, si_adequacy, coverage_adequacy, term states, weights, versions) is
persisted so any score recomputes and explains line-by-line.

---

## 7. Stage 7 — Risks, protection gaps, recommendations

- Any material line with status `review / potential-gap / not-identified`, or a **compliance fail**,
  emits a **risk**. **Severity** = f(gap `1 − line_adequacy`, materiality `wᵢ`) — see calibration Table F.
- Each risk carries a determination trail and, where actionable, a recommendation with
  **"Secure with CoverSure"** (gaps) or **"Review with CoverSure"** (adequacy reviews).
- AI writes prose; **trigger, severity, evidence are deterministic**.

---

## 8. Guardrails (enforced in code)

- Language allow/deny list (extend demo `language.ts`): block absolute words; require hedged phrasing.
- Determinism: fixed `asOfDate`; renewal buckets 30/60/90 as in demo `portfolio.ts`.
- Provenance required: a score line with no `sourceRef` is a build-time error.
- Tri-state integrity: `unconfirmed` may never be coerced to `absent` in scoring.
- Broker QA gate before any client-facing finalisation.

---

## 9. Worked example — ABC Manufacturing (corrected)

Profile: mfg, ₹82 Cr turnover, ₹24 Cr fixed assets, ₹9.4 Cr inventory, 187 employees.

| Line | mode · `w` | `R` | `C` | SI adeq | Cov adeq | line_adeq | **status** | score |
|---|---|---|---|---|---|---|---|---|
| Property/Fire (bldg+plant) | quant · 3 | ~₹24 Cr | ₹20 Cr | 0.83 | ~0.95 | **0.79** | **Review** | ~79 |
| Stock/inventory | quant · 2 | ₹9.4 Cr (cost) | covered (fire) | ~1.0 | ok | high | Covered | ~90 |
| Business Interruption | quant · 3 | GP × 12mo | none | 0 | — | 0 | Not-identified | 0 |
| Liability | quant · 2 | ₹5 Cr | ₹1 Cr | 0.20 | ~0.8 | ~0.16 | Potential-gap | ~16 |
| Cyber | quant · 1 | ₹3 Cr | none | 0 | — | 0 | Not-identified | 0 |
| GPA | quant · 3 | **needs CTC** | ₹2 L/life | **unconfirmed** | 0.8 | — | Unavailable | excl. |
| GMC | quant · 2 | ₹5 L/life | none | 0 | — | 0 | Not-identified | 0 |
| Workmen's Comp | **compliance** · 3 | — | unknown | — | — | — | Confirm (strip) | — |

**Key corrections vs v0.1:** Property is **Review (0.79), not Covered** — the honest engine surfaces
the ₹20 Cr-vs-₹24 Cr under-insurance the demo painted as clean cover. GPA is **Unavailable** (no CTC)
rather than a guessed 0.13. WC is **compliance-mode**, not SI-scored. Roll-up still lands the overall
in the low 60s with BI + Cyber dominant — but note **re-basing the demo narrative on honest output is
a product decision** (§5f, §10).

---

## 10. Open calibration & product decisions ⚙️

1. **[DECIDED] Not-identified posture (§5f):** conservative / evidence-based — not-identified &
   confirmed-absent score **0**; narrative never asserts absence; `confirmed-absent` added as a
   distinct evidenced state. (Locked; no longer open.)
2. Whether compliance-mode lines (WC, Motor TP) fold into the 0–100 score or sit only in the strip.
3. GMC headline SI: lowest-grade vs headcount-weighted average; family-definition weighting.
4. Stock/inventory: valuation basis + exclusion from reinstatement benchmark; de-dup rule confirmation.
5. Combiner validation (reference businesses): `si × coverage` multiplicative vs min vs weighted-avg;
   adverse-term **penalty floor** (starter 0.5).
6. Category-weight clamps `[W_min, W_max]`; whether weights are derived (recommended) or fixed.
7. Deterministic "data-heavy" Cyber trigger (industry set / PII flag / e-commerce share).
8. Extraction-confidence gate (0.70) and the completeness threshold below which a score is "provisional".
9. Benchmark bands (liability/PI/D&O/cyber, GMC/GPA per-life) — broker validation.
10. Whether over-insurance (`si_ratio > 1`) is a flagged finding (esp. stock).

---

## 11. Build sequence (suggested)

1. Canonical schema + `Extracted<T>` + `TermState` + `AssessmentMode` (§3).
2. AI extraction service (documents → schema; tri-state terms; confidence + source refs).
3. Exposure catalog + modes + benchmark functions (calibration tables) — with the reproducibility
   guard (unhold-able fact → unconfirmed).
4. Adequacy engine (§5, all modes) — pure, unit-tested against fixtures incl. the ABC case above.
5. Scoring + completeness + risk/gap generation (§6–7) — pure, unit-tested.
6. Wire to demo UI (types align; swap authored `demoCompany` for engine output).
7. Broker QA console + Compliance strip + guardrail lint.

---

## 12. v0.2 changelog (from P0/P1 review)

- **P0-6/§4:** added `assessmentMode` (quantitative/compliance/presence); WC/Motor now compliance-mode.
- **P0-3/§5b:** coverage terms are tri-state; unconfirmed excluded from denominator.
- **P0-4/§5f:** "not-identified" defined as a documentation state; **posture DECIDED — conservative:
  not-identified scores 0, narrative never equates it with absence, `confirmed-absent` added as a
  distinct evidenced state.**
- **P0-5/§4–5a:** benchmark reproducibility rule — un-computable benchmark → unconfirmed (GPA/CTC).
- **P0-1/§4,§5a:** inventory valued at cost + excluded from reinstatement benchmark; overlap de-dup.
- **P0-2/§9:** worked example corrected — Property = Review (0.79); demo re-basing flagged as a decision.
- **P0-7/§5d:** GMC normalisation defined (lowest-grade headline + grade-spread finding + family term).
- **P0-add/§6:** score-completeness indicator.
- **P1-8/§6:** derived category weights with min/max clamps.
- **P1-9/§10:** deterministic "data-heavy" Cyber criteria (open).
- **P1-10,12/§5b–c,§10:** combiner-function validation + adverse-term penalty floor.
