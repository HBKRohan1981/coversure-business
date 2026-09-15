# Risk Assessment Engine — Proposed v0.3 Direction (multi-dimensional assessment)

**Status:** PROPOSED design decision (2026-09-15). Not implemented in the scoring core.
**Baseline:** v0.2 (`docs/risk-assessment-engine.md`) remains the reference implementation
and its 51 tests are unchanged. v0.3 is a **direction**, adopted from the Path C diagnostic;
the scoring definition does not change until v0.3 is formally built.
**Evidence:** `docs/diagnostic-27-vs-64.md` — the ABC 27-vs-64 decomposition, the Path C
prototype, and the 4-profile / 7-invariant pressure-test.
**Prototype:** `src/lib/engine/pathc.ts` (`assessBusinessPathC`) + tests
`src/test/engine.pathc*.test.mjs`, gated by `calibration.SCORE_MODEL` (still `"v0.2"`).

---

## 1. Why v0.3

The v0.2 engine folds two different questions into one number, and its conservative
"not-identified scores 0" posture makes *absence* dominate the headline (~28 of ABC's
37-point gap vs the demo). The pressure-test confirmed the single score cannot
distinguish businesses with fundamentally different risk profiles:

| Business | v0.2 single score | What's actually true |
|---|--:|---|
| Underinsured mfg | 37 | Thin cover on **everything** — exposed at every claim |
| Sparse-doc SME | 13 | **Excellent** cover on property, undocumented elsewhere |

v0.2 ranks the well-protected-but-narrow SME (13) *below* the thinly-protected-everywhere
manufacturer (37). v0.3 fixes this by measuring the axes separately.

---

## 2. The v0.3 assessment model — dimensions as first-class citizens

Four reported dimensions replace the single Business Protection Score for customer-facing
representation. All are computed **deterministically** from the same v0.2 per-line
assessment (`assessLine`) — v0.3 changes only the **roll-up and presentation**.

### 2.1 Protection Adequacy — "how good is the cover you actually hold?"
Weighted mean of line scores over lines with an **identified, assessed** policy
(`covered` / `review` / `potential-gap`). Excludes:
- `not-identified` / `confirmed-absent` — these are *breadth* gaps, not adequacy of held cover;
- `unavailable` — a data gap, cannot be assessed.

`null` when nothing identified is assessable (→ handled by the `noIdentifiedCover` flag).

### 2.2 Protection Breadth — "how much of your material exposure carries a policy at all?"
Material lines carrying a policy in place ÷ material lines (weight > 0). A line "carries a
policy" when it is anything other than `not-identified` / `confirmed-absent` (quantitative),
`pass` (compliance), or `present` (presence).

### 2.3 Evidence Completeness — "how much could we actually assess from the documents?"
The v0.2 `completeness` metric, **renamed** (§5). Confirmed data points ÷ expected data
points, where the shortfall is `unavailable` / `unconfirmed` lines. **This is not
documentation completeness** — see §5.

### 2.4 Assessment Flags — semantic states, not decoration (§4.3)
`breadthLimited`, `noIdentifiedCover`, `provisional` (and future flags) are **assessment
states** that change how the numbers must be read and narrated — not cosmetic UI hints.

---

## 3. Adopted decisions (v0.3 direction)

1. **Protection Adequacy and Protection Breadth are separate first-class dimensions.** Neither
   substitutes for the other; both are always reported.
2. **`guardedScore = adequacy × breadth` is retained as an internal / conservative diagnostic
   and continuity bridge to v0.2 — never the standalone customer-facing headline.** It equals
   the v0.2 overall exactly when documentation is complete (finding A), so it preserves the
   conservative signal for internal comparison, QA, and regression, but as a lone number it
   mis-ranks "excellent-but-narrow" vs "thin-but-broad" (finding C).
3. **Assessment flags are semantically meaningful states.** A result is incomplete without its
   flags; narrative and any headline treatment must honour them (e.g. a high adequacy under
   `breadthLimited` reads "strong where covered, but most exposure is uncovered/undocumented,"
   never "well protected").
4. **The conservative posture is preserved (unchanged from v0.2 §5f):**
   - `not-identified` ≠ `confirmed-absent` — distinct states; not-identified is never narrated
     as confirmed absence.
   - `not-identified` scores **0 where it participates in the conservative signal** (the v0.2
     overall and `guardedScore`); it is *excluded* from Protection Adequacy (which is about held
     cover) but *counted* against Protection Breadth.
   - `unavailable` remains distinct, excluded from the adequacy core, and counted against
     Evidence Completeness — never coerced to `absent`.
5. **Rename `completeness` → Evidence Completeness (a.k.a. Assessment Completeness).** The
   sparse-SME case proved the current metric does not mean documentation completeness (§5).
6. **Do not change the v0.2 engine or its tests yet.** v0.2 stays the reference baseline.
7. **Record the Path C findings + this direction in the design docs** (this file +
   `diagnostic-27-vs-64.md`).
8. **Do not commit any v0.3 scoring changes yet.** This is a documented direction only.

---

## 4. Target product representation

The customer-facing headline is a **row of dimensions plus a flag**, never a single number:

```
Protection Adequacy | Protection Breadth | Evidence Completeness | Assessment Flag
```

**Worked example (Sparse-doc SME):**

> **90% Adequacy · 25% Breadth · 75% Evidence Completeness · Breadth Limited**

Read as: *"The cover we could identify is strong (90%), but it spans only a quarter of your
material exposures, and we could assess three-quarters of what was expected."* — an honest,
non-alarming statement that neither flatters (the old authored 64) nor implies the business is
simply badly insured (the v0.2 13).

**The four profiles under this representation:**

| Business | Adequacy | Breadth | Evidence Compl. | Flag |
|---|--:|--:|--:|---|
| Well-covered mfg | 88% | 100% | 100% | — |
| IT / ITES | 59% | 90% | 100% | — |
| Underinsured mfg | 37% | 100% | 100% | — |
| Sparse-doc SME | 90% | 25% | 75% | Breadth Limited |

`guardedScore` (internal) may appear in broker/QA views as the v0.2 continuity value; it is
not shown as the customer headline.

---

## 5. Terminology: `completeness` → Evidence Completeness

The Sparse-doc SME reports 75% completeness while carrying policies on only 1 of 8 material
lines, because `not-identified` lines are a *determined* state that does not count against
completeness — only `unavailable` / `unconfirmed` do. So the metric answers *"could we assess
what we found?"*, not *"is the documentation complete?"*.

- **v0.3 label:** **Evidence Completeness** (or Assessment Completeness).
- **Code:** the field stays `completeness` in v0.2 (untouched); a v0.3 implementation renames
  it and updates callers. No code change now.
- **Coupled decision (see §6):** because breadth and completeness both hinge on whether a
  missing line is `not-identified` vs `unavailable`, the extraction layer must set that state
  deliberately — "we received no document for this line" is arguably `unavailable` (unknown),
  not `not-identified` (determined absence-in-docs).

---

## 6. Open items for a v0.3 implementation (not decided here)

1. **Breadth weighting.** Breadth is currently a **line count** (covered ÷ material). Should a
   missing *high-materiality* line hurt breadth more than a low one (materiality-weighted
   breadth)? Likely yes.
2. **`unavailable` in breadth.** It currently counts as "cover in place" (a policy exists we
   can't size). For sparse docs ("no document received") that is ambiguous — the state may need
   splitting into *policy-exists-unsizeable* (breadth: yes) vs *no-evidence* (breadth: unknown),
   which also feeds §5.
3. **Adequacy's own coverage note.** Sparse-SME adequacy (90%) rests on a **single** category.
   Adequacy should carry "based on N of M categories/lines" so a narrow-but-high adequacy is
   self-evidently thin.
4. **Headline scalar, if ever required.** If a single number is unavoidable, `min(adequacy,
   breadth×100)` or a breadth-gated band separates the pressure-test cases better than the
   product `guardedScore`. Prefer the multi-dimensional row.
5. **Flag thresholds ⚙️.** `BREADTH_GUARD_CUTOFF` (0.60) and the provisional cutoff (0.70) need
   broking calibration against real portfolios.
6. **Narrative bindings.** Each flag needs an approved hedged-language template (extend
   `language.ts`) so the representation reads consistently.

---

## 7. What stays the reference (v0.2)

- `assessBusiness` (single Business Protection Score), all v0.2 types, calibration, and the 51
  reference tests — **unchanged**.
- `SCORE_MODEL = "v0.2"` remains active; Path C is opt-in via `assessBusinessPathC`.
- `guardedScore ≡ v0.2 overall` when documentation is complete — the continuity guarantee that
  lets v0.3 ship without discarding the conservative baseline.

**Cross-refs:** `risk-assessment-engine.md` (v0.2 spec) · `assessment-calibration-starter.md`
(⚙️ tables) · `diagnostic-27-vs-64.md` (evidence).
