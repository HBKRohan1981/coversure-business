# CoverSure Business — Input & Data Acquisition Matrix (V1)

**Status:** V1 data-acquisition specification (2026-09-15). **No scoring change.**
**Scope:** Defines *everything the current assessment engine may need* and *where to get it*.
**Source of truth:** the existing engine (`src/lib/engine/`) + calibration
(`assessment-calibration-starter.md`) + spec (`risk-assessment-engine.md`). Nothing here
invents a benchmark, threshold, penalty or scoring rule; where the engine/calibration does not
define something, it is marked **OPEN**.
**Machine-readable companion:** [`src/lib/engine/input-schema-v1.ts`](../src/lib/engine/input-schema-v1.ts)
(`INPUT_FIELDS`, **107 fields**) — the complete field-level record with all columns; validated by
`src/test/input-schema-v1.test.mjs`.

> **Product principle: extract first, ask later.** Obtain information from every available source
> before asking the corporate anything. A corporate question is a *fallback* for what cannot be
> reliably established from documents/public information.

---

## 1. How this maps to the current engine (what is coded vs proposed)

The engine assesses **per-line adequacy** (`assessLine`) from three input kinds, then rolls up
(`assessBusiness` v0.2 / `assessBusinessPathC` v0.3-proto). Critically:

| Input kind | Engine consumes | Status in code |
|---|---|---|
| **Existing-policy facts** | `ExtractedPolicy.*` (SI, dates, deductible, add-ons, exclusions…) | **Schema coded**; extraction (Stage 2) not built |
| **Benchmark `R`** | `QuantitativeLineInput.R` (a *number* or `"unconfirmed"`) | **R is an INPUT** — the R *formulas* (Table B/B2/B3) are **⚙️ proposals, not coded** (Stage 3) |
| **Coverage terms** | `QuantitativeLineInput.checklist[]` / `adverse[]` (tri-state) | **Shape coded**; the *item lists + weights* (Table C1–C6) are **⚙️ proposals, not coded** |
| **Materiality + mode** | `INDUSTRY_LINE_WEIGHTS`, Table A2 | **Coded** for Manufacturing + IT/ITES only |

So most fields below feed a **coded input slot** whose **calibration is still ⚙️**. That is why
**82 of 107 fields carry an OPEN marker** — the acquisition target is clear; the downstream
formula/weight is a broker/product decision.

---

## 2. Column glossary

The full 22-column record lives in `INPUT_FIELDS`. Columns: Assessment Line · Category · Field Name ·
Description · Why Required · Data Type · Preferred Source · Secondary Sources · Can AI Extract ·
Extraction Method · Evidence Required · Evidence Example · Confidence Required · Corporate Question
Required · Corporate Question · When to Ask · Mandatory · Assessment Impact · Current Engine Mapping ·
Status if Unavailable · Open Issue. The tables in this doc show the decision-critical subset; the
`.ts` is authoritative for the rest.

## 3. Source hierarchy (priority order)

The engine records **source + confidence** on every fact; higher tiers outrank lower ones, and an
**inferred fact is never equal to documentary evidence**.

- **Tier 1 — primary company / policy evidence:** insurance policy · policy schedule · endorsement ·
  policy wording · claims MIS · financial statements · annual report · employee census · asset
  register · vehicle list.
- **Tier 2 — company-published:** company website · investor presentation · company profile.
- **Tier 3 — external / public:** MCA filings · contracts · other public sources (only where actually available).
- **Tier 4 — corporate answer:** the fallback when a fact cannot be reliably established elsewhere.

## 4. Extraction vs derivation vs inference vs unknown

Every fact is tagged by how it was obtained (`extractionMethod` + `confidenceRequired`):

| Mode | Meaning | Example | Handling |
|---|---|---|---|
| **Explicitly stated** | Read directly | AR states turnover ₹125 Cr | Extract; high confidence |
| **Derived** | Deterministic calc from evidence | GP = revenue × margin | Calculate; retain underlying evidence |
| **Inferred** | Signal, not statement | Website ⇒ handles PII | Mark as inference + confidence; **never a confirmed fact** |
| **Unknown** | No reliable evidence | — | Ask corporate **only if material** |

**The system must never silently convert inference into confirmed fact.**

## 5. State handling (engine terminology — do not collapse)

| State | Meaning | Engine encoding |
|---|---|---|
| **identified** | Relevant policy/evidence found | status `covered`/`review`/`potential-gap` |
| **not-identified** | Exposure exists, protection not found in reviewed docs | `not-identified` (scored 0 in the conservative signal) |
| **unavailable** | Insufficient information to assess (a fact WE lack) | `unavailable` (excluded from adequacy core; hits Evidence Completeness) |
| **confirmed-absent** | Positive evidence of absence (exclusion / confirmation) | `confirmed-absent` (distinct; only ever set by evidence) |
| **unconfirmed** | Evidence exists but insufficient to conclude | tri-state `unconfirmed` (excluded from the coverage denominator) |

> **No policy found ≠ confirmed absence of insurance.** A missing input therefore *defaults* to
> `not-identified` (policy lines), `unavailable` (benchmark facts) or `unconfirmed` (coverage terms)
> — **never** `confirmed-absent`. (Enforced by `input-schema-v1.test.mjs`.)

---

## 6. Business-level information (drives which lines are relevant)

18 fields. These determine applicable lines/modes and supply shared benchmark facts. Mandatory ×3
(`industry`, `annual_turnover`, `employee_count`).

| Field | Type | Preferred → Secondary | AI? | Corp Q? | Mand. | Impact | Engine mapping | If unavailable |
|---|---|---|---|:--:|---|---|---|---|
| industry | enum | annual-report → website/profile/MCA | yes | cond. | **M** | exposure-class | `EngineBusinessProfile.industry` | unconfirmed |
| business_activity_description | string | website → AR/profile | yes | no | imp | exposure-class | — (OPEN) | unconfirmed |
| annual_turnover | currency | financials → AR/IP/MCA | yes | cond. | **M** | benchmark | `EngineBusinessProfile.turnover` | unavailable |
| employee_count | number | census → AR/financials | yes | cond. | **M** | exposure-class | `EngineBusinessProfile.employees` | unconfirmed |
| fixed_assets_value | currency | asset-register → financials | yes | cond. | imp | benchmark | `EngineBusinessProfile.fixedAssets` | unavailable |
| inventory_value | currency | financials → AR/asset-reg | yes | cond. | imp | benchmark | `EngineBusinessProfile.inventory` | unavailable |
| avg_ctc | currency | census → financials | partial | cond. | imp | benchmark | `EngineBusinessProfile.avgCTC` | unavailable |
| gross_profit_margin | % | financials → AR | partial | no | opt | benchmark | `calibration.GP_MARGIN[industry]` | unavailable |
| num_locations | number | AR → website/asset-reg | partial | cond. | imp | exposure-class | — (OPEN) | unconfirmed |
| location_addresses | array | asset-reg → AR/website/schedule | partial | cond. | opt | exposure-class | — (OPEN) | unconfirmed |
| manufacturing_activity | boolean | AR → website | yes | cond. | imp | exposure-class | INDUSTRY_LINE_WEIGHTS select | unconfirmed |
| export_activity | boolean | AR → financials/website | yes | cond. | opt | benchmark | product-liability band | unconfirmed |
| professional_services | boolean | website → AR | yes | cond. | imp | exposure-class | INDUSTRY_LINE_WEIGHTS select (pi) | unconfirmed |
| sensitive_data_exposure | boolean | website → AR/contracts | partial (**inference**) | cond. | imp | benchmark | cyber data-heavy trigger | unconfirmed |
| ecommerce_revenue_share | % | AR → IP/website | partial | no | opt | benchmark | cyber data-heavy trigger | unconfirmed |
| vehicles_operated | boolean | vehicle-list → asset-reg | yes | cond. | opt | exposure-class | INDUSTRY_LINE_WEIGHTS select (motor) | unconfirmed |
| years_operating | number | MCA → AR/website | yes | no | opt | none | `BusinessProfile.yearsOperating` (demo) | unconfirmed |

---

## 7. Common inputs (apply per identified policy / asset)

Rather than repeat 18 fields × 13 lines, these are defined **once** and apply to every quantitative
line that has an identified policy or a mapped asset.

### 7.1 Existing-policy fields — `ExtractedPolicy.*` (12)
`policy_insurer`, `policy_number`, `policy_type`, `policy_line`, **`policy_sum_insured`** (→ C in
si-adequacy §5a), `policy_premium`, `policy_start_date`, `policy_renewal_date`,
`policy_valuation_basis` (market-value → average-clause risk §5a), `policy_sub_limits`,
`policy_deductible` (high-excess adverse term), `policy_related_asset_keys` (de-dup, Stage 4 OPEN).
Preferred source: **policy schedule → wording → endorsement**. If a policy is *referenced but not
provided* → `not-identified` until the document is supplied.

### 7.2 Asset fields — `ExtractedAsset.*` (6)
`asset_name`, `asset_type`, `asset_category` (immovable/movable), `asset_location`,
`asset_declared_value`, `asset_valuation_basis` (reinstatement/cost/market). Preferred source:
**asset register → financials → schedule**.

---

## 8. Per-line inputs

For each line: **mode** (Table A2), **benchmark inputs** (feed `R`), and **coverage terms** (feed
`checklist`/`adverse`). Existing-policy inputs are the §7.1 common set. Full attributes in the `.ts`.

### 8.1 Property / Fire — *quantitative* (13 fields)
Benchmark `R` = Σ reinstatement value of buildings + plant (Table B).

| Field | Cat | Feeds | Engine mapping | If unavail. |
|---|---|---|---|---|
| property_building_value | benchmark | R | `QuantitativeLineInput.R` (Table B, ⚙️) | unavailable |
| property_plant_machinery_value | benchmark | R | `QuantitativeLineInput.R` | unavailable |
| property_building_ownership | exposure | line relevance | — (OPEN) | unconfirmed |
| property_term_reinstatement_clause | coverage | checklist | `ExtractedPolicy.addOns[...]` | unconfirmed |
| property_term_stfi | coverage | checklist | `addOns['stfi']` | unconfirmed |
| property_term_earthquake | coverage | checklist | `addOns['earthquake']` | unconfirmed |
| property_term_escalation | coverage | checklist | `addOns['escalation']` | unconfirmed |
| property_term_terrorism | coverage | checklist | `addOns['terrorism']` | unconfirmed |
| property_term_debris_removal | coverage | checklist | `addOns['debris-removal']` | unconfirmed |
| property_adverse_market_value_basis | coverage | adverse | `exclusions[...]` | unconfirmed |
| property_adverse_underdeclaration | coverage | adverse | `exclusions[...]` | unconfirmed |
| property_adverse_named_perils | coverage | adverse | `exclusions[...]` | unconfirmed |
| property_adverse_high_excess | coverage | adverse | `ExtractedPolicy.deductible` | unconfirmed |

*(Coverage-term item weights + adverse penalties are Table C1 — ⚙️ proposals, not coded.)*

### 8.2 Stock / Inventory — *quantitative* (1)
`stock_declared_value` → `R` (cost/market). **OPEN:** de-dup vs fire declaration + cost/market basis (Stage 4).

### 8.3 Business Interruption — *quantitative* (8)
`bi_gross_profit` (→ R = GP × indemnity), **`bi_indemnity_period` (the one ALWAYS-ASK field** — no
document reliably states it), + C2 coverage terms (`bi_term_gross_profit_basis`,
`bi_term_indemnity_12mo`, `bi_term_supplier_customer_ext`, `bi_term_denial_of_access`) and adverse
(`bi_adverse_indemnity_lt_6mo`, `bi_adverse_gp_underdeclared`). **OPEN:** BI R formula not coded.

### 8.4 Machinery Breakdown — *quantitative* (2)
`machinery_value` → R; `machinery_coverage_checklist` **OPEN** (Table C: "⚙️ to be added").

### 8.5 Marine / Transit — *quantitative* (2)
`marine_largest_consignment` → R (single-carry vs annual, ⚙️); `marine_coverage_checklist` **OPEN**.

### 8.6 Liability / CGL — *quantitative* (9)
`liability_turnover_band` → R (Table B2, ⚙️) + C3 terms (`public_liability`, `product_liability`,
`legal_costs_in_addition`, `sudden_pollution`, `adequate_per_event_sublimit`) and adverse
(`pollution_excluded`, `product_recall_excluded`, `low_per_event_sublimit`).

### 8.7 Product Liability — *quantitative* (2)
`product_liability_turnover_band` → R (Table B2 + exporter uplift, ⚙️); coverage checklist shares
CGL product items — **OPEN** (not separated in Table C).

### 8.8 Professional Indemnity — *quantitative* (3)
`pi_turnover_band`, `pi_largest_contract_value` → R = max(turnover band, contract×2) (⚙️);
`pi_coverage_checklist` **OPEN**.

### 8.9 Directors & Officers — *presence* (or quantitative if sized) (2)
`do_presence` → `PresenceLineInput.presence`; `do_turnover_band` → R if sized. **OPEN:** presence-vs-quantitative + bands.

### 8.10 Cyber — *quantitative* (6)
`cyber_revenue_band` → R (Table B3 + data-heavy +1 band, ⚙️) + C6 terms (`first_party`,
`third_party`, `ransomware`, `breach_response`, `regulatory_defence`). Data-heavy trigger uses
`sensitive_data_exposure` / `ecommerce_revenue_share` / industry set — **not coded**.

### 8.11 Group Personal Accident — *quantitative* (5)
`gpa_per_life_si` → C; R = ≥3× CTC floor ₹10L **needs `avg_ctc`** (else `unavailable`, per
reproducibility rule §4). C5 terms (`death_ptd`, `ppd`, `ttd_weekly`, `medical_extension`).

### 8.12 Group Health (GMC) — *quantitative* (12)
`gmc_per_life_si_lowest_grade` → C (headline = lowest grade, §5d); `gmc_grade_spread` (structural
finding, — OPEN); C4 terms (`ped_day1`, `maternity`, `room_rent_no_cap`, `day_care`,
`pre_post_hosp`, `family_definition`) and adverse (`room_rent_cap`, `copay`, `disease_sublimits`,
`maternity_waiting`). **OPEN:** lowest-grade vs headcount-weighted headline (§5d); ₹5L norm.

### 8.13 Group Term Life — *quantitative* (2)
`gtl_per_life_si` → C; R = ≥3× salary floor ₹25L **needs `avg_ctc`**; `gtl_coverage_checklist` **OPEN**.

### 8.14 Workmen's / Employees' Comp — *compliance* (1)
`wc_statutory_status` → `ComplianceLineInput.compliance` (pass/fail/unconfirmed → Compliance strip).
**OPEN:** whether WC folds into the 0–100 score (`COMPLIANCE_FOLDS_INTO_SCORE=false`).

### 8.15 Motor Fleet — Third-Party *compliance* (1) + Own-Damage *quantitative* (2)
`motor_tp_statutory_status` → compliance; `motor_od_total_idv` → R = Σ IDV; `motor_od_coverage_checklist` **OPEN**.

### 8.16 Claims — listed source, **not an engine input**
`claims_history` (claims MIS) — captured for provenance but **the current engine consumes no claims
data**; status `n/a`. **OPEN — requires product/engine decision.**

---

## 9. Document → field mapping

Which documents *potentially* provide which fields (a mapping, not a guarantee any document contains everything):

| Document | Potentially provides |
|---|---|
| **Policy schedule** | insurer, policy number, type, line, **sum insured**, premium, dates, deductible, sub-limits, related assets |
| **Policy wording** | coverage terms (C1–C6 add-ons), exclusions, valuation basis, extensions |
| **Endorsement** | amendments to any of the above |
| **Financial statements** | turnover, gross profit / margin, inventory value, fixed-asset values, employee count |
| **Annual report** | industry, business activity, locations, employees, export/overseas, turnover, major risks, subsidiaries |
| **Asset register** | buildings, plant & machinery, equipment, values, valuation basis, locations, ownership |
| **Employee census** | employee count, avg CTC/salary, dependents, grade split (for GMC/GPA/GTL) |
| **Vehicle list** | vehicles operated, IDV per vehicle (motor OD/TP) |
| **Company website** | business activity, professional-services signal, PII signal (inference), locations |
| **Investor presentation / profile** | turnover, segments, e-commerce share, geographic presence |
| **MCA filings** | industry (principal activity), incorporation date, directors |
| **Contracts** | largest contract value (PI), building ownership/lease |
| **Claims MIS** | loss history (not yet consumed by the engine) |

---

## 10. Corporate-question design & dynamic questioning

**Rule:** `Field → sources checked → unresolved → question`. Ask in **plain language**, never jargon,
and **only if** documents/public info did not resolve it. Examples already in the schema
(`corporateQuestion`): *"What is your approximate annual turnover?"* not *"What's your CGL limit?"*;
*"If your business had to stop after a major incident, roughly how long to get back to normal?"* not
*"What's your BI sum insured requirement?"*.

**Dynamic triggers** (`EXPOSURE_TRIGGERS`) — a line's questions fire only when its signal is present
**and** the fact is unresolved:

| Signal | Enables lines |
|---|---|
| `manufacturing_activity` | product-liability, machinery |
| `employee_count > 0` | gpa, gmc, gtl, wc |
| `sensitive_data_exposure` | cyber |
| `professional_services` | pi |
| `vehicles_operated` | motor-tp, motor-od |
| `export_activity` | product-liability (band uplift) |

Lines whose exposure is clearly irrelevant are never questioned.

## 11. Evidence requirements (FACT → EVIDENCE → ASSESSMENT)

Every material extracted field retains: **document name · page/section · extracted value · source
text/table reference · extraction confidence** (`confidenceRequired`; the engine's
`CONFIDENCE_GATE = 0.70` routes low-confidence facts to broker-confirm and counts them against
Evidence Completeness). This preserves the engine's determination trail and reproducibility (spec §1–2).

## 12. What V1 deliberately does NOT do

No scoring change · no new benchmarks · no invented calibration values or penalties · no Protection
Score redesign · no questionnaire UI · **no new insurance lines** (only the 16 the engine knows) · no
assuming absent facts · no turning website signals into confirmed facts. Undefined items are marked
**OPEN — requires product/engine/broker decision**.

---

## 13. Final summary

### 13.1 Corporate questions — initial set (derived, not assumed)
From 107 fields: **1 field is unavoidable-ask** (`bi_indemnity_period` — no document reliably states
recovery time), **51 are conditional** (asked only when extraction fails), **55 are never asked**
(document-only or non-blocking). So the **minimum forced question set ≈ 1**; a realistic first-pass
questionnaire is the small subset of conditionals that documents rarely contain:

1. Recovery time after a major incident *(BI indemnity period — always)*
2. Average employee salary/CTC *(only if GPA/GTL material and census lacks it)*
3. Largest single client contract value *(only if PI material)*
4. Confirmation of sensitive-data handling *(only if cyber material and it was inferred, not evidenced)*
5. Confirmation of the exposure signals not settled by website/docs *(manufacturing / professional-services / vehicles / export)*

Everything else (turnover, employees, industry, asset & policy values, coverage terms) is
**document-first** and only escalates to a question on extraction failure.

### 13.2 Highest-value documents (ranked by fields unlocked)
| Rank | Document | Preferred-source fields | Unlocks |
|---|---|--:|---|
| 1 | **Policy schedule + wording** | 67 | all existing-policy facts + every C1–C6 coverage term |
| 2 | **Asset register** | 12 | property/machinery reinstatement values, asset base, locations |
| 3 | **Financial statements** | 11 | turnover, GP margin, inventory, fixed assets, employees |
| 4 | **Annual report** | 5 (+ many secondary) | industry, activity, locations, export/overseas, turnover |
| 5 | **Employee census** | 2 | employee count, avg CTC (unlocks GPA/GTL benchmarks) |
| 6 | **Vehicle list** | 2 | motor TP/OD |

Policy documents unlock the most *fields*; financials + annual report + asset register unlock the
most *exposure/benchmark intelligence and line selection*.

### 13.3 Information gaps (hard to establish without corporate input)
- `bi_indemnity_period` — forward-looking; always corporate.
- `avg_ctc` — frequently absent from public docs → blocks GPA/GTL (→ `unavailable`, the ABC pattern).
- `pi_largest_contract_value` — usually only in contracts/corporate.
- `num_locations` / `location_addresses` / `property_building_ownership` — **no EngineBusinessProfile field** (OPEN).
- `sensitive_data_exposure` — typically **inference only**; confirmation needs corporate.
- `claims_history` — **not an engine input** at all.

### 13.4 Open calibration questions (separate from data acquisition)
These are engine/broker decisions, **not** acquisition gaps (see `assessment-calibration-starter.md` §10):
benchmark bands B2/B3 + BI/PI/marine/motor R formulas · coverage checklists **C1–C6 item weights** and
the **missing PI/D&O/Marine/Machinery/Motor-OD/GTL checklists** · stock de-dup & cost/market basis ·
GMC headline (lowest-grade vs weighted) + ₹5L norm · deterministic cyber "data-heavy" trigger ·
whether compliance lines fold into the score · exporter band uplift · reinstatement-vs-book asset value.
**82 of 107 fields carry an OPEN marker** tied to one of these.

---

## 14. Target flow (product principle)

> **Minimum effort from the corporate. Maximum intelligence from available information.**

```
Public/company info + uploaded documents
        ↓  AI extraction (Stage 2 — not yet built)
   Evidence + confidence  (FACT → EVIDENCE)
        ↓  Exposure determination (industry + signals → lines/modes)
   Identify missing MATERIAL information (per this matrix)
        ↓  Ask ONLY necessary corporate questions (dynamic triggers)
   Assessment (existing engine: adequacy · breadth · Evidence Completeness · flags)
```

The corporate should **not** need to know what policies, sums insured, coverage terms or benchmarks
apply — CoverSure derives those from available information and the calibrated engine.

**Cross-refs:** `risk-assessment-engine.md` (v0.2 spec) · `assessment-calibration-starter.md` (⚙️
tables) · `risk-assessment-engine-v0.3-proposal.md` (multi-dimensional direction) ·
`input-schema-v1.ts` (machine-readable master, 107 fields).
