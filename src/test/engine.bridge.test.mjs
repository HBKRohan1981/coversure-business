import test from "node:test";
import assert from "node:assert/strict";
import {
  toCoverageStatus,
  overallScore,
  toCategoryScores,
} from "../lib/engine/bridge.ts";
import { assessBusiness } from "../lib/engine/engine.ts";
import { abcLines, abcIndustry } from "../lib/engine/__fixtures__/abc.ts";

const DEMO_STATUSES = new Set([
  "covered",
  "review",
  "not-identified",
  "potential-gap",
  "unavailable",
]);

test("toCoverageStatus: passes through the statuses the demo enum already has", () => {
  for (const s of ["covered", "review", "not-identified", "potential-gap", "unavailable"]) {
    assert.equal(toCoverageStatus(s), s);
  }
});

test("toCoverageStatus: confirmed-absent (engine-only) collapses onto not-identified for the demo enum", () => {
  const mapped = toCoverageStatus("confirmed-absent");
  assert.equal(mapped, "not-identified");
  assert.ok(DEMO_STATUSES.has(mapped), "must be a valid demo CoverageStatus");
});

test("toCoverageStatus: every engine LineStatus maps to a valid demo CoverageStatus", () => {
  const all = [
    "covered",
    "review",
    "potential-gap",
    "not-identified",
    "confirmed-absent",
    "unavailable",
  ];
  for (const s of all) assert.ok(DEMO_STATUSES.has(toCoverageStatus(s)), `bad map for ${s}`);
});

const result = assessBusiness(abcLines, abcIndustry);

test("overallScore: rounds the engine's overall to the demo's integer score", () => {
  assert.equal(overallScore(result), 27);
  assert.equal(Number.isInteger(overallScore(result)), true);
});

test("toCategoryScores: emits labelled integer category scores the demo can render", () => {
  const cats = toCategoryScores(result);
  const byKey = Object.fromEntries(cats.map((c) => [c.key, c]));
  assert.equal(byKey["property"].label, "Property");
  assert.equal(Number.isInteger(byKey["property"].score), true);
  assert.equal(byKey["business-continuity"].score, 0); // BI not identified
  // GPA is unavailable + WC in strip, so People reflects only the not-identified GMC (0).
  assert.equal(byKey["people"].score, 0);
});
