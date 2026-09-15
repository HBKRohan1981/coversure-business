// Validation for the Input & Data Acquisition Schema V1. Pure data checks;
// no scoring behaviour touched. Engine's other suites are the reference baseline.
import test from "node:test";
import assert from "node:assert/strict";
import {
  INPUT_FIELDS,
  ENGINE_EXPOSURE_LINES,
  EXPOSURE_TRIGGERS,
} from "../lib/engine/input-schema-v1.ts";

// Known engine symbols (mirrors src/lib/engine/types.ts) — a field may only claim
// a mapping to one of these. Keeps the matrix honest: no field invents an input.
const ENGINE_FIELDS = {
  EngineBusinessProfile: new Set(["name", "industry", "turnover", "employees", "fixedAssets", "inventory", "avgCTC"]),
  ExtractedPolicy: new Set(["key", "line", "type", "insurer", "policyNumber", "sumInsured", "premium", "startDate", "renewalDate", "basisOfValuation", "subLimits", "addOns", "exclusions", "deductible", "relatedAssetKeys"]),
  ExtractedAsset: new Set(["key", "name", "type", "category", "location", "declaredValue", "valuationBasis"]),
  QuantitativeLineInput: new Set(["key", "category", "mode", "weight", "policyFound", "confirmedAbsent", "C", "R", "checklist", "adverse"]),
  ComplianceLineInput: new Set(["key", "category", "mode", "weight", "compliance"]),
  PresenceLineInput: new Set(["key", "category", "mode", "weight", "presence"]),
};

const VALID_STATUS = new Set([
  "covered", "review", "potential-gap", "not-identified", "confirmed-absent", "unavailable",
  "unconfirmed", "n/a",
]);

test("field names are unique", () => {
  const seen = new Set();
  for (const f of INPUT_FIELDS) {
    assert.ok(!seen.has(f.field), `duplicate field ${f.field}`);
    seen.add(f.field);
  }
});

test("every engine exposure line has at least one line-specific input field", () => {
  for (const line of ENGINE_EXPOSURE_LINES) {
    const has = INPUT_FIELDS.some((f) => f.line === line);
    assert.ok(has, `no input fields mapped for line ${line}`);
  }
});

test("every mandatory field is obtainable — a source to extract from OR a corporate question", () => {
  for (const f of INPUT_FIELDS) {
    if (f.mandatory !== "mandatory") continue;
    const obtainable = f.canAIExtract !== "no" || f.corporateQuestion !== null;
    assert.ok(obtainable, `mandatory field ${f.field} has no way to obtain it`);
  }
});

test("no field references a non-existent engine input", () => {
  const re = /(EngineBusinessProfile|ExtractedPolicy|ExtractedAsset|QuantitativeLineInput|ComplianceLineInput|PresenceLineInput)\.([A-Za-z]+)/g;
  for (const f of INPUT_FIELDS) {
    if (!f.engineMapping) continue;
    for (const m of f.engineMapping.matchAll(re)) {
      const [, type, member] = m;
      assert.ok(ENGINE_FIELDS[type].has(member), `${f.field}: ${type}.${member} is not a real engine field`);
    }
  }
});

test("status-if-unavailable uses only valid engine states", () => {
  for (const f of INPUT_FIELDS) {
    assert.ok(VALID_STATUS.has(f.statusIfUnavailable), `${f.field}: bad status ${f.statusIfUnavailable}`);
  }
});

test("a missing input never DEFAULTS to confirmed-absent (absence must be positively evidenced)", () => {
  // "No policy found ≠ confirmed absence." confirmed-absent is only ever set by
  // positive evidence at assessment time — never as the fallback for a missing field.
  for (const f of INPUT_FIELDS) {
    assert.notEqual(f.statusIfUnavailable, "confirmed-absent", `${f.field} must not default to confirmed-absent`);
  }
});

test("benchmark inputs fall back to 'unavailable' (reproducibility rule §4), never 'not-identified'", () => {
  for (const f of INPUT_FIELDS) {
    if (f.category !== "benchmark") continue;
    assert.notEqual(
      f.statusIfUnavailable,
      "not-identified",
      `${f.field}: a missing benchmark fact is a data gap (unavailable), not an absent policy`
    );
  }
});

test("coverage-terms fall back to 'unconfirmed' (tri-state, excluded from the denominator §5b)", () => {
  for (const f of INPUT_FIELDS) {
    if (f.category !== "coverage-terms") continue;
    assert.equal(f.statusIfUnavailable, "unconfirmed", `${f.field}: coverage term must be unconfirmed when missing`);
  }
});

test("question fields are coherent: a question implies a trigger; 'no' implies no question", () => {
  for (const f of INPUT_FIELDS) {
    if (f.corporateQuestionRequired === "no") {
      assert.equal(f.corporateQuestion, null, `${f.field}: marked no-question but has question text`);
    } else {
      assert.ok(f.corporateQuestion, `${f.field}: ${f.corporateQuestionRequired} but no question text`);
      assert.ok(f.whenToAsk, `${f.field}: ${f.corporateQuestionRequired} but no when-to-ask trigger`);
    }
  }
});

test("dynamic triggers reference only real engine lines", () => {
  for (const t of EXPOSURE_TRIGGERS) {
    for (const line of t.enablesLines) {
      assert.ok(ENGINE_EXPOSURE_LINES.includes(line), `trigger ${t.signal} → unknown line ${line}`);
    }
  }
});

test("evidence discipline: any field required as evidence names an evidence example", () => {
  for (const f of INPUT_FIELDS) {
    if (!f.evidenceRequired) continue;
    assert.ok(f.evidenceExample && f.evidenceExample.length > 0, `${f.field}: evidence required but no example`);
  }
});
