# Diagnostic — the ABC "27 vs 64" gap, and the Path C prototype

**Status:** Decision-support analysis (2026-09-15). Not a spec change.
**Fixture:** `src/lib/engine/__fixtures__/abc.ts` (unchanged).
**Engine under test:** v0.2 stub in `src/lib/engine/` (unchanged — 51 reference tests).

> The v0.2 conservative engine scores ABC Manufacturing **27.4** overall. The demo
> ships an authored **64**. This documents exactly what drives the 37-point gap, and
> prototypes one candidate evolution (Path C). **The 27.4 is preserved deliberately
> as evidence of what the current v0.2 algorithm does** — it is not erased by the
> prototype; the prototype runs alongside it.

---

## 1. The v0.2 result (reference — do not erase)

`assessBusiness(abcLines, "Manufacturing").overall = 27.4` → asserted as `27` in
`src/test/engine.abc.test.mjs`. Per-category contribution (`W·S / ΣW`):

| Category | Weight | Engine S | Contributes | Demo S (authored) |
|---|--:|--:|--:|--:|
| Property | 0.28 | 82.5 | **24.3** | 82 |
| Liability | 0.19 | 16 | 3.1 | 56 |
| Business-Continuity | 0.16 | **0** | 0 | 38 |
| Cyber | 0.05 | **0** | 0 | 25 |
| People | 0.28 | **0** | 0 | 67 |
| Other | — | (no lines in fixture) | — | 72 |

Property alone carries the score; three categories sit at exactly 0.

**The demo's 64 is authored, not derived** — a plain average of its own category
scores is 56.7, weighted ≈ 58. Nobody computed 64; it was chosen as a headline.

---

## 2. What drives the 37-point gap

Marginal Δ from 27.4, each driver isolated (one change at a time):

| Driver | Δ | Result | Type |
|---|--:|--:|---|
| **Not-identified scored 0 → excluded instead** | **+28.5** | 55.9 | **Posture (architectural)** |
| Combiner: multiplicative → `avg(si,cov)` | +9.2 | 36.6 | Calibration (⚙️ open, §10.5) |
| 'Other'/Motor populated (fixture has none) | +4.5 | 31.9 | Fixture breadth |
| Combiner: multiplicative → `min(si,cov)` | +2.0 | 29.4 | Calibration |
| GPA sized with a real CTC | +1 to +2.5 | ~29 | Data (PA is genuinely thin) |
| Weights: derived vs fixed | derived is +4.5 *favorable* (fixed → 22.9) | — | Not a driver |

Drivers interact, so they don't sum to 37 — but the ranking is unambiguous:
**one decision (how a material line with no policy enters the score) is worth ~28
points; everything else combined is ≤ ~13.**

### The mechanism
`category_score` is a weighted **average over scored lines**, and not-identified
lines enter that average at **score 0, full weight** — actively dragging their
category to 0. Whether a zero-line is *in* or *out* of that average swings the
headline ~28 points.

### The real finding — two questions collapsed into one number
- *"How good is the cover you actually have?"* → **≈ 56** (identified policies).
- *"How much of your exposure carries cover at all?"* → **4 of 8 material lines**
  (GPA thin: ₹2 L/life ≈ 0.11 adequacy vs a 3× CTC benchmark).

v0.2's 27 is a hybrid dominated by absence. The demo's 64 rewards *presence*
("PA in place" → People 67) without benchmarking adequacy — the exact honesty the
engine exists to remove. **Neither number alone tells the truth.**

---

## 3. Are the drivers intentional?

- **Score-0-for-not-identified (+28):** intentional and *DECIDED* (§5f). But it was
  decided as a *narrative* rule; its ~28-point **headline dominance was never
  quantified**. This is the decision to revisit.
- **Multiplicative combiner (+9 vs avg):** flagged `⚙️` open (§10.5), never validated.
  Genuinely punitive; defensible for SI (you can't out-term a missing ₹4 Cr) but
  worth a deliberate call.
- **Derived weights:** already *favorable* to ABC. Leave alone.
- **GPA unavailable:** correctly small — PA cover is genuinely thin. Working as intended.

---

## 4. Path C prototype — two-number model + completeness guard (v0.3, PROTOTYPE)

Implemented additively in `src/lib/engine/pathc.ts` (`assessBusinessPathC`), reusing
the v0.2 per-line assessment verbatim; **only the roll-up differs**. Tested in
`src/test/engine.pathc.test.mjs`. Feature flag: `calibration.SCORE_MODEL` (still
`"v0.2"` — Path C is opt-in, never gates the reference model).

**Three axes, separated:**
- **`adequacyScore`** — quality of identified, *assessed* cover (`covered`/`review`/
  `potential-gap`). not-identified & confirmed-absent excluded (they are breadth
  gaps); unavailable excluded (data gap). `null` when nothing identified is assessable.
- **`breadth`** — material lines carrying a policy / material lines.
- **`completeness`** — data quality, unchanged from v0.2 (unavailable/unconfirmed).
- **Guard flags** — `provisional` (completeness < 0.70), `breadthLimited`
  (breadth < 0.60 ⚙️), `noIdentifiedCover` (nothing to score).
- **`guardedScore = adequacyScore × breadth`** — a single guarded number that
  **reproduces the v0.2 signal**, showing Path C *decomposes* the conservative posture
  rather than discarding it.

### ABC under Path C
| Metric | Value | Reading |
|---|--:|---|
| adequacyScore | **~56** | The cover ABC holds is moderate (Property strong, Liability thin) |
| breadth | **4 / 8 (0.50)** | Half of ABC's material exposure has no policy |
| completeness | 6 / 8 (0.75) | We could assess most of it (GPA + WC outstanding) |
| guardedScore | **~28** | ≈ v0.2's 27.4 — the conservative signal, preserved |
| flags | `breadthLimited: true` | High-ish adequacy cannot read as reassuring — half the lines are missing |

### Edge cases (why two numbers beat one)
| Business | adequacy | breadth | completeness | guarded | key flag |
|---|--:|--:|--:|--:|---|
| **Zero cover** (all not-identified) | `null` | 0.0 | **1.0** | 0 | `noIdentifiedCover` |
| **All unavailable** (cover exists, unsized) | `null` | **1.0** | 0.0 | 0 | `provisional` |
| **Fully covered, adequate** | ~100 | 1.0 | 1.0 | ~100 | none |
| **Thin but broad** (policies everywhere, all short) | <30 | 1.0 | high | <30 | none — adequacy carries it |

- **Zero-cover** proves the guard: adequacy is `null` (not a vacuous 100), guarded is
  0, and completeness is *high* (we're certain there's nothing) — demonstrating
  **completeness ≠ breadth**.
- **All-unavailable** shows the completeness guard: lots of cover, but nothing we can
  vouch for → `provisional`, guarded 0.
- **Thin-but-broad** shows adequacy catching what breadth alone would miss.

---

## 5. Decision paths (unchanged framing, now with prototype evidence)

| Path | ABC becomes | Cost |
|---|--:|---|
| **A. 27 is correct** | 27 | Honest but harsh single headline; needs narrative reframe |
| **B. Calibration too punitive** | ~30–37 | Softer combiner only closes ~1/3; posture still dominates |
| **C. Two-number model (this prototype)** | adequacy 56 · breadth 0.50 · guarded 28 | Preserves conservative narrative + the v0.2 signal (as `guardedScore`); needs a UI that shows both numbers and honours the guard flags |

**Recommendation:** decide the posture question first (A vs C) — it is 76% of the gap
and a "what does the headline *mean*" decision, not a tuning knob. Path C keeps the
conservative signal (guardedScore ≈ v0.2) while separating "good at what you have"
from "you're missing half your lines," which is what the data is pointing at. The
combiner (B) is a real but secondary cleanup worth doing regardless.

---

## 6. Path C pressure-test — 4 synthetic profiles (2026-09-15)

Fixtures in `src/lib/engine/__fixtures__/synthetic.ts` (built via `_builders.ts`);
invariant suite in `src/test/engine.pathc.pressure.test.mjs`. v0.2 engine + its 51
tests untouched; Path C formula unchanged. IT/ITES category weights added to
`calibration.INDUSTRY_LINE_WEIGHTS` (additive — Manufacturing unaffected).

| Business | Adequacy | Breadth | Evidence Compl. | Guarded | Flag | v0.2 overall |
|---|--:|--:|--:|--:|---|--:|
| IT / ITES (mixed) | 58.7 | 90% | 100% | 52.8 | — | 53.5 |
| Well-covered mfg | 87.7 | 100% | 100% | 87.7 | — | 87.7 |
| Underinsured mfg | 36.8 | 100% | 100% | 36.8 | — | 36.8 |
| Sparse-doc SME | **90** | **25%** | 75% | 22.5 | breadthLimited | 13.2 |

**All 7 invariants pass:** (1) breadth↑@const-adequacy → guarded↑; (2) adequacy↑@const-breadth
→ guarded↑; (3) broad-but-inadequate stays low; (4) excellent-cover-on-a-narrow-base ≠ high
headline; (5) zero cover ≠ vacuous high score (`adequacyScore: null`, guarded 0); (6) unavailable
≠ absent; (7) not-identified ≠ confirmed-absent.

### Structural findings

- **A — v0.2 ≡ Path C when documentation is complete.** Well-covered (87.7 = 87.7) and
  underinsured (36.8 = 36.8) match *exactly*: with no not-identified/unavailable lines,
  breadth = 100% and `guarded = adequacy × 1.0 = v0.2 overall`. The models **diverge only on
  missing lines** — by design. The Sparse SME is where they split: v0.2 = **13** (excellent
  property cover reads as near-uninsured) vs Path C **adequacy 90 / breadth 25%** (good cover,
  narrow) — materially more honest.
- **B — `completeness` ≠ documentation completeness.** The Sparse SME reports completeness
  **75%** because 5 lines are `not-identified` (a *determined* state that does not hit
  completeness) and only GPA+WC are `unavailable`. Completeness measures *"could we assess what
  we found,"* not *"how complete is the documentation."* → motivates the v0.3 rename to
  **Evidence Completeness** and an extraction-side decision on not-identified vs unavailable.
- **C — `guardedScore` must not stand alone.** Sparse guarded (22.5) is *below* underinsured
  guarded (36.8) despite the SME's identified cover (adequacy 90) being far better than the
  underinsured firm's (37). Multiplication collapses "excellent-but-narrow" and "thin-but-broad"
  toward the same low number and can even mis-rank them. The `breadthLimited` flag + the
  two-number display rescue the reading — so guarded is a fine internal signal, never a lone
  headline.

## 7. Outcome

Reviewed and **decided: adopt Path C as the proposed v0.3 direction** — two first-class
dimensions (Adequacy + Breadth) + Evidence Completeness + semantic flags; `guardedScore`
retained as an internal continuity bridge, never the standalone headline. The v0.2 single
Business Protection Score **remains the reference baseline** (unchanged). See
[risk-assessment-engine-v0.3-proposal.md](risk-assessment-engine-v0.3-proposal.md).
