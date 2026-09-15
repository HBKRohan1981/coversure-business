# CoverSure Business — Assessment Calibration Tables (Starter v0.2)

**Status:** Starter defaults — **every number here is a proposal for CoverSure broking to correct.**
**Companion to:** `docs/risk-assessment-engine.md` (v0.2).
**Market context:** India, SME / mid-market commercial insurance, all amounts INR.
**v0.2 changes:** added assessment mode per line (Table A2); split Property benchmark
(building+plant vs stock); marked CTC-dependent benchmarks as unconfirmed-if-missing; tri-state
coverage terms + penalty floor (Table C note); expanded thresholds (Table E); corrected worked check.

> These tables are the calibration layer the engine reads. They are deliberately explicit so a
> broker can argue with each cell. Nothing is settled — react to it, don't trust it.

**Legend — materiality weight `w`:** `0` = N/A · `1` = low · `2` = medium · `3` = high.
`—` in benchmark cells = "no sum-insured sizing" (compliance/presence mode — see Table A2).

---

## Table A — Industry → exposure line materiality (`wᵢ`)

| Exposure line | Mfg | Warehouse/Logistics | Trading/Wholesale | Retail | IT/ITES | Prof. Services | Healthcare | Hospitality | Construction |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Property / Fire (bldg+plant) | 3 | 3 | 2 | 3 | 1 | 1 | 3 | 3 | 2 |
| Stock / Inventory | 3 | 3 | 3 | 3 | 0 | 0 | 2 | 2 | 1 |
| Business Interruption | 3 | 2 | 2 | 2 | 2 | 1 | 3 | 3 | 2 |
| Machinery Breakdown | 3 | 1 | 0 | 1 | 0 | 0 | 2 | 1 | 2 |
| Marine / Transit | 2 | 3 | 3 | 2 | 0 | 0 | 1 | 0 | 2 |
| Liability (CGL / Public) | 2 | 2 | 2 | 3 | 1 | 1 | 3 | 3 | 3 |
| Product Liability | 3 | 1 | 2 | 2 | 0 | 0 | 2 | 2 | 0 |
| Professional Indemnity | 0 | 0 | 0 | 0 | 3 | 3 | 3 | 0 | 2 |
| Directors & Officers (D&O) | 1 | 1 | 1 | 1 | 2 | 2 | 2 | 1 | 1 |
| Cyber | 1 | 1 | 1 | 2 | 3 | 3 | 3 | 2 | 1 |
| Group Personal Accident | 3 | 3 | 2 | 2 | 2 | 2 | 3 | 3 | 3 |
| Group Health (GMC) | 2 | 2 | 2 | 2 | 3 | 3 | 2 | 2 | 2 |
| Group Term Life | 1 | 1 | 1 | 1 | 2 | 2 | 1 | 1 | 1 |
| Workmen's / Employees' Comp | 3 | 3 | 1 | 1 | 1 | 1 | 2 | 2 | 3 |
| Motor Fleet | 2 | 3 | 2 | 1 | 0 | 0 | 1 | 1 | 2 |

⚙️ Confirm industries + weights; note Stock is now split out from buildings+plant (see Table B).

---

## Table A2 — Assessment mode per line (NEW)

Not every line is scored by a sum-insured ratio. This sets *how* each line's adequacy is judged.

| Line | Mode | How adequacy is judged |
|---|---|---|
| Property/Fire, Stock, BI, Machinery, Marine | quantitative | SI adequacy × coverage adequacy |
| Liability, Product, PI, Cyber | quantitative | SI adequacy × coverage adequacy |
| GPA, GMC, GTL | quantitative | SI adequacy (per-life) × coverage adequacy |
| Workmen's / Employees' Comp | **compliance** | statutory pass / fail / unconfirmed → Compliance strip |
| Motor Fleet (Third-Party) | **compliance** | statutory pass / fail / unconfirmed |
| Motor Fleet (Own-Damage) | quantitative | Σ IDV adequacy |
| D&O | **presence** (or quantitative if sized) | exists / not / unconfirmed |

⚙️ Decide whether compliance-mode lines also fold into the 0–100 score or sit only in the strip.

---

## Table B — Recommended-cover benchmark `Rᵢ` (quantitative lines only)

| Line | Benchmark `R` formula | Requires fact | If fact missing |
|---|---|---|---|
| Property / Fire (bldg+plant) | Σ **reinstatement** value of buildings + plant + machinery | asset register (reinstatement) | unconfirmed |
| Stock / Inventory | declared stock value at **cost/market** (declaration/floater) | inventory value | unconfirmed |
| Business Interruption | **Gross Profit × indemnity period** | turnover + GP-margin (B1) | unconfirmed |
| Machinery Breakdown | value of plant & machinery | asset register | unconfirmed |
| Marine / Transit | single-carry = largest consignment; annual = goods turnover | consignment / turnover | proxy = turnover ÷ 12 × 1.5 ⚙️ |
| Liability (CGL) | turnover band → limit (B2) | turnover | unconfirmed |
| Product Liability | turnover band → limit (B2, +1 band if exporter) | turnover | unconfirmed |
| Professional Indemnity | max(turnover band, largest contract × 2) | turnover / contract | unconfirmed |
| D&O | turnover band → limit (B2), cap ₹25 Cr SME | turnover | presence-only |
| Cyber | revenue band → limit (B3) | revenue | unconfirmed |
| Group Personal Accident | **≥ 3× annual CTC/life**, floor ₹10 L | **avgCTC** | **unconfirmed** (do not guess) |
| Group Health (GMC) | per-life SI norm ≥ ₹5 L (headline = **lowest grade**, §5d) | per-life SI | unconfirmed |
| Group Term Life | **≥ 3× annual salary**, floor ₹25 L | **avgCTC/salary** | **unconfirmed** |
| Workmen's / Emp. Comp | — (compliance mode) | — | — |
| Motor Fleet (OD) | Σ IDV of vehicles | vehicle IDV | unconfirmed |

**Reproducibility rule:** a benchmark whose required fact is not captured returns **unconfirmed** —
the line becomes `unavailable` and routes to broker confirmation, it is **never** scored against a
guessed number. (This is the GPA/CTC fix — P0-5.)

### Table B1 — Gross-profit margins (BI sizing) ⚙️
| Industry | GP margin | | Industry | GP margin |
|---|:--:|---|---|:--:|
| Manufacturing | 25% | | Professional Services | 50% |
| Warehouse/Logistics | 30% | | Healthcare | 40% |
| Trading/Wholesale | 12% | | Hospitality | 35% |
| Retail | 20% | | Construction | 18% |
| IT/ITES | 45% | | | |

### Table B2 — Liability / D&O limit by turnover ⚙️
| Annual turnover | Recommended aggregate limit |
|---|---|
| < ₹10 Cr | ₹1 Cr |
| ₹10 – 50 Cr | ₹3 Cr |
| ₹50 – 100 Cr | ₹5 – 10 Cr |
| ₹100 – 250 Cr | ₹10 – 15 Cr |
| ₹250 – 500 Cr | ₹15 – 25 Cr |
| > ₹500 Cr | ₹25 Cr + |

### Table B3 — Cyber limit by revenue ⚙️
| Annual revenue | Recommended limit | Data-heavy (+1 band) |
|---|---|---|
| < ₹50 Cr | ₹1 – 3 Cr | ₹5 Cr |
| ₹50 – 250 Cr | ₹5 Cr | ₹10 Cr |
| ₹250 – 1000 Cr | ₹10 – 25 Cr | ₹25 Cr + |

**"Data-heavy" is a rule, not a judgement ⚙️:** `industry ∈ {Healthcare, IT/ITES, Retail, Fintech}`
**OR** handles-PII flag **OR** e-commerce revenue share > 30%. (P1-9.)

---

## Table C — Coverage / terms checklists (per line)

**Tri-state scoring (v0.2):** each item is `present | absent | unconfirmed`.
```
denom          = Σ weight over items present OR absent      (unconfirmed EXCLUDED, → completeness)
coverage_score = Σ(present · weight) / denom
term_penalty   = clamp( Π(1 − penalty) for adverse terms confirmed-present , floor 0.5 ⚙️ )
coverage_adequacy = coverage_score × term_penalty
```

### C1 — Property / Fire
| Required coverage / add-on | Weight | | Adverse term | Penalty |
|---|:--:|---|---|:--:|
| Reinstatement value clause | 0.30 | | Market-value basis (not reinstatement) | 0.30 |
| STFI (flood/storm) not excluded | 0.20 | | Under-declaration / average clause risk | 0.25 |
| Earthquake add-on (geo-dependent) | 0.15 | | Named-perils only | 0.20 |
| Escalation clause | 0.15 | | High excess (> 5% of SI) | 0.10 |
| Terrorism add-on | 0.10 | | | |
| Debris removal / architect fees | 0.10 | | | |

### C2 — Business Interruption
| Required | Weight | | Adverse term | Penalty |
|---|:--:|---|---|:--:|
| Gross-profit basis (not standing charges only) | 0.35 | | Indemnity period < 6 months | 0.30 |
| Indemnity period ≥ 12 months | 0.30 | | GP under-declared vs financials | 0.25 |
| Supplier / customer extension | 0.20 | | | |
| Denial-of-access / utilities extension | 0.15 | | | |

### C3 — Liability (CGL / Product)
| Required | Weight | | Adverse term | Penalty |
|---|:--:|---|---|:--:|
| Public liability | 0.30 | | Pollution fully excluded | 0.20 |
| Product liability (if product business) | 0.25 | | Product recall excluded | 0.15 |
| Legal costs in addition to limit | 0.20 | | Low per-event sub-limit (< 25% agg.) | 0.15 |
| Sudden & accidental pollution | 0.15 | | | |
| Adequate per-event sub-limit | 0.10 | | | |

### C4 — Group Health (GMC)
| Required | Weight | | Adverse term | Penalty |
|---|:--:|---|---|:--:|
| PED covered from day 1 | 0.25 | | Room-rent cap (proportionate deduction) | 0.20 |
| Maternity cover (adequate limit) | 0.20 | | Copay > 0% | 0.15 |
| Room rent — no cap / adequate | 0.20 | | Disease-wise sub-limits | 0.15 |
| Day-care procedures | 0.15 | | Maternity waiting > 9 months | 0.10 |
| Pre / post hospitalisation | 0.10 | | | |
| Family definition adequate (self+family) | 0.10 | | | |

### C5 — Group Personal Accident
| Required | Weight |
|---|:--:|
| Death + Permanent Total Disability | 0.40 |
| Permanent Partial Disability | 0.25 |
| Temporary Total Disability / weekly benefit | 0.20 |
| Medical extension / worldwide | 0.15 |

### C6 — Cyber
| Required | Weight |
|---|:--:|
| First-party (data restoration + BI) | 0.25 |
| Third-party liability | 0.25 |
| Ransomware / cyber extortion | 0.20 |
| Breach response & notification costs | 0.15 |
| Regulatory defence costs | 0.15 |

⚙️ PI, D&O, Marine, Machinery Breakdown, Motor-OD checklists to be added — same shape.

---

## Table D — Category mapping + category weights `W_cat`

| Category | Lines mapped | `W_cat` default (fixed) | Derived clamp `[min, max]` ⚙️ |
|---|---|:--:|:--:|
| Property | Property/Fire, Stock, Machinery Breakdown | 0.22 | [0.12, 0.32] |
| Business Continuity | Business Interruption, Marine/Transit | 0.20 | [0.10, 0.30] |
| Liability | CGL, Product, D&O, PI | 0.18 | [0.08, 0.28] |
| Cyber | Cyber | 0.12 | [0.05, 0.25] |
| People | GPA, GMC, GTL, WC | 0.20 | [0.10, 0.30] |
| Other | Motor Fleet, misc | 0.08 | [0.04, 0.15] |

**Default = derived** (normalised Σ of the business's mapped line weights) **clamped to [min, max]**
so no category vanishes or dominates (P1-8). Fixed weights are the fallback. ⚙️

---

## Table E — Thresholds, gates & combiner settings

| Parameter | Starter value ⚙️ |
|---|---|
| `covered` threshold | line_adequacy ≥ 0.90 |
| `review` band | 0.55 ≤ line_adequacy < 0.90 |
| `potential-gap` band | 0 < line_adequacy < 0.55 |
| `not-identified` | material line, no policy in docs — **scored 0**; narrative "not identified in documents reviewed" (never asserted absent) |
| `confirmed-absent` | absence **positively evidenced** (exclusion / client confirmation) — **scored 0**; narrative = confirmed gap |
| `unavailable` | a fact WE lack (e.g. CTC) blocks assessment — excluded from score core, counts against completeness |
| SI cap for scoring | si_ratio capped at 1.0 (flag if > 1.15) |
| Over-insurance flag | si_ratio > 1.15 → surfaced finding (not penalised) — esp. review for stock ⚙️ |
| Line combiner | si_adequacy × coverage_adequacy (**multiplicative** — validate vs min/avg, P1-10) |
| Adverse-term penalty floor | term_penalty ≥ 0.50 (P1-12) |
| Extraction confidence gate | field confidence < 0.70 → broker-confirm + counts vs completeness |
| Completeness "provisional" cutoff | score shown provisional if completeness < 0.70 |
| Score tone bands | ≥70 good · 40–69 attention · <40 high |
| **Not-identified posture (DECIDED)** | **Conservative / evidence-based: not-identified & confirmed-absent = 0 (scored); `unavailable` = data gap, excluded from core.** |

---

## Table F — Risk severity mapping

`severity = f(gap = 1 − line_adequacy, materiality wᵢ)`; a **compliance fail** = high at `w ≥ 2`.

| Gap ↓ / Materiality → | w = 1 (low) | w = 2 (med) | w = 3 (high) |
|---|:--:|:--:|:--:|
| gap ≥ 0.7 | attention | high | high |
| 0.4 ≤ gap < 0.7 | review | attention | high |
| 0.1 ≤ gap < 0.4 | review | review | attention |
| gap < 0.1 | good | good | review |

---

## Worked check — ABC Manufacturing (corrected v0.2)

Mfg, ₹82 Cr turnover, ₹24 Cr assets, ₹9.4 Cr inventory, 187 employees, **no CTC captured**.

| Line | mode·w | R | C | SI adeq | Cov adeq | line_adeq | status | score |
|---|:--:|---|---|:--:|:--:|:--:|---|:--:|
| Property/Fire (bldg+plant) | q·3 | ~₹24 Cr | ₹20 Cr | 0.83 | ~0.95 | **0.79** | **Review** | ~79 |
| Stock/Inventory | q·3 | ₹9.4 Cr (cost) | via fire | ~1.0 | ok | high | Covered | ~90 |
| Business Interruption | q·3 | GP(₹20.5Cr)×12mo | 0 | 0 | — | 0 | Not-identified | 0 |
| Liability | q·2 | ₹5 Cr | ₹1 Cr | 0.20 | ~0.8 | ~0.16 | Potential-gap | ~16 |
| Cyber | q·1 | ₹3 Cr | 0 | 0 | — | 0 | Not-identified | 0 |
| GPA | q·3 | **needs CTC** | ₹2 L/life | **unconf.** | 0.8 | — | Unavailable | excl. |
| GMC | q·2 | ₹5 L/life | none | 0 | — | 0 | Not-identified | 0 |
| Workmen's Comp | **comp·3** | — | unknown | — | — | — | Confirm (strip) | — |

Overall still lands **low 60s** with BI + Cyber dominant. **Changes from v0.1:** Property = Review
(not Covered — honest under-insurance surfaces); GPA = Unavailable (no CTC, not a guessed 0.13); WC =
compliance-mode (out of the SI curve). **Re-basing the demo narrative on this honest output is a
product decision** — see engine spec §5f / §10.

---

## What I need from CoverSure to lock v1

1. Table A/A2 — industries, line weights, **and assessment mode per line**.
2. Table B — benchmark formulas + B1/B2/B3; confirm the **reproducibility rule** (missing fact → unconfirmed).
3. Table C — checklist items/weights/penalties; confirm **tri-state** handling + **penalty floor 0.5**.
4. Table D/E — derived-vs-fixed weights + clamps; the 0.90/0.55 thresholds. *(Not-identified posture is DECIDED — conservative.)*
5. Table F — severity grid + compliance-fail severity.
6. GMC normalisation (lowest-grade vs weighted-avg) and whether compliance lines score or sit in the strip.

Give me marked-up answers and I'll fold them into versioned config + the engine stub.
