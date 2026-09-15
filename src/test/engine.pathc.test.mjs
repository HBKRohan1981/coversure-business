// v0.3 Path C PROTOTYPE — two-number model (adequacy + breadth) + completeness guard.
// Separate suite; the v0.2 engine and its 51 tests are the untouched reference.
import test from "node:test";
import assert from "node:assert/strict";
import { assessBusinessPathC } from "../lib/engine/pathc.ts";
import { assessBusiness } from "../lib/engine/engine.ts";
import { abcLines, abcIndustry } from "../lib/engine/__fixtures__/abc.ts";

const near = (a, b, eps = 0.6) => Math.abs(a - b) <= eps;

// Small helpers to build minimal lines for the edge cases.
const quant = (key, category, weight, o) => ({
  key,
  category,
  mode: "quantitative",
  weight,
  policyFound: o.policyFound ?? false,
  C: o.C ?? null,
  R: o.R ?? 10_000_000,
  checklist: o.checklist ?? [{ key: "c", weight: 1, state: "present" }],
  adverse: o.adverse ?? [],
});

// ------------------------------------------------------------------ ABC under Path C
const abc = assessBusinessPathC(abcLines, abcIndustry);

test("ABC · adequacy score reflects only the cover ABC actually holds (~56)", () => {
  assert.ok(near(abc.adequacyScore, 56), `adequacy ${abc.adequacyScore}`);
});

test("ABC · breadth: 4 of 8 material lines carry a policy", () => {
  assert.equal(abc.breadth.covered, 4); // property-fire, stock, liability, gpa
  assert.equal(abc.breadth.material, 8);
  assert.ok(near(abc.breadth.ratio, 0.5, 1e-9));
});

test("ABC · completeness (data quality) is preserved from v0.2 at 6/8", () => {
  assert.equal(abc.completeness.confirmed, 6);
  assert.equal(abc.completeness.total, 8);
});

test("ABC · guarded score (adequacy × breadth) reproduces the v0.2 headline ~27", () => {
  const v02 = assessBusiness(abcLines, abcIndustry).overall;
  assert.ok(near(abc.guardedScore, v02, 2), `guarded ${abc.guardedScore} vs v0.2 ${v02}`);
  assert.ok(near(abc.guardedScore, 28, 1.5), `guarded ${abc.guardedScore}`);
});

test("ABC · guard flags: breadth-limited (0.5 < 0.6), not provisional, cover exists", () => {
  assert.equal(abc.flags.breadthLimited, true);
  assert.equal(abc.flags.provisional, false); // completeness 0.75 ≥ 0.70
  assert.equal(abc.flags.noIdentifiedCover, false);
});

// -------------------------------------------------- EDGE 1: zero cover (the guard's job)
test("EDGE zero-cover: adequacy is null and guarded is 0 — never a vacuous 100", () => {
  const lines = [
    quant("property-fire", "property", 3, { policyFound: false }),
    quant("bi", "business-continuity", 3, { policyFound: false }),
    quant("liability", "liability", 2, { policyFound: false }),
  ];
  const r = assessBusinessPathC(lines, abcIndustry);
  assert.equal(r.adequacyScore, null);
  assert.equal(r.guardedScore, 0);
  assert.equal(r.flags.noIdentifiedCover, true);
  assert.equal(r.breadth.ratio, 0);
  // completeness stays HIGH: we are certain there is no cover (not-identified is a
  // determined state, not a data gap) — proving completeness ≠ breadth.
  assert.equal(r.completeness.ratio, 1);
});

// ------------------------------------------- EDGE 2: broad cover we cannot size (guard)
test("EDGE all-unavailable: cover exists (breadth 1.0) but adequacy null + provisional", () => {
  const lines = [
    quant("property-fire", "property", 3, { policyFound: true, C: 1e7, R: "unconfirmed" }),
    quant("liability", "liability", 2, { policyFound: true, C: 1e7, R: "unconfirmed" }),
  ];
  const r = assessBusinessPathC(lines, abcIndustry);
  assert.equal(r.breadth.ratio, 1); // policies are in place
  assert.equal(r.adequacyScore, null); // but none can be assessed
  assert.equal(r.guardedScore, 0);
  assert.equal(r.flags.provisional, true); // completeness 0 < 0.70
  assert.equal(r.flags.noIdentifiedCover, true);
});

// -------------------------------------------------------- EDGE 3: full, adequate cover
test("EDGE fully-covered: adequacy high, breadth 1.0, guarded ≈ adequacy, no flags", () => {
  const lines = [
    quant("property-fire", "property", 3, { policyFound: true, C: 1e7, R: 1e7 }),
    quant("liability", "liability", 2, { policyFound: true, C: 1e7, R: 1e7 }),
  ];
  const r = assessBusinessPathC(lines, abcIndustry);
  assert.ok(near(r.adequacyScore, 100), `adequacy ${r.adequacyScore}`);
  assert.equal(r.breadth.ratio, 1);
  assert.ok(near(r.guardedScore, 100), `guarded ${r.guardedScore}`);
  assert.equal(r.flags.breadthLimited, false);
  assert.equal(r.flags.noIdentifiedCover, false);
});

// -------------------------------------- EDGE 4: thin cover everywhere (breadth ≠ adequacy)
test("EDGE thin-but-broad: full breadth but low adequacy — adequacy carries the truth", () => {
  const lines = [
    quant("property-fire", "property", 3, { policyFound: true, C: 2e6, R: 1e7 }), // si 0.2
    quant("liability", "liability", 2, { policyFound: true, C: 2e6, R: 1e7 }), // si 0.2
  ];
  const r = assessBusinessPathC(lines, abcIndustry);
  assert.equal(r.breadth.ratio, 1); // everything has a policy
  assert.ok(r.adequacyScore < 30, `adequacy ${r.adequacyScore}`); // but all thin
  assert.equal(r.flags.breadthLimited, false); // breadth is fine; the problem is adequacy
});
