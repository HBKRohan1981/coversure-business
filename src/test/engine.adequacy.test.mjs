import test from "node:test";
import assert from "node:assert/strict";
import {
  siAssessment,
  coverageAdequacy,
  statusFromLineAdequacy,
  assessLine,
} from "../lib/engine/adequacy.ts";

const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

// ---------------------------------------------------------------- siAssessment (§5a)
test("siAssessment: C/R ratio, capped at 1.0 for adequacy", () => {
  const r = siAssessment(20, 24); // ABC property
  assert.ok(near(r.ratio, 20 / 24), `ratio ${r.ratio}`);
  assert.ok(near(r.adequacy, 20 / 24), `adequacy ${r.adequacy}`);
  assert.equal(r.overInsured, false);
});

test("siAssessment: adequacy is min(ratio, 1) — full cover is 1.0 not more", () => {
  const r = siAssessment(30, 24);
  assert.equal(r.adequacy, 1);
});

test("siAssessment: si_ratio is clamped to 1.2 and over-insurance is flagged above 1.15", () => {
  const r = siAssessment(40, 24); // ratio 1.667 → clamped to 1.2
  assert.ok(near(r.ratio, 1.2), `ratio ${r.ratio}`);
  assert.equal(r.adequacy, 1);
  assert.equal(r.overInsured, true);
});

test("siAssessment: unconfirmed benchmark yields unconfirmed adequacy (no guessed number)", () => {
  const r = siAssessment(200000, "unconfirmed"); // GPA, no CTC
  assert.equal(r.adequacy, "unconfirmed");
  assert.equal(r.ratio, null);
});

test("siAssessment: no policy (C null) is a zero-cover ratio, not unconfirmed", () => {
  const r = siAssessment(null, 30000000);
  assert.equal(r.adequacy, 0);
});

// ------------------------------------------------------- coverageAdequacy (§5b tri-state)
test("coverageAdequacy: unconfirmed items are excluded from the denominator", () => {
  // present 0.6 + absent 0.2 counted; unconfirmed 0.2 excluded → 0.6 / 0.8 = 0.75
  const cov = coverageAdequacy(
    [
      { key: "a", weight: 0.6, state: "present" },
      { key: "b", weight: 0.2, state: "absent" },
      { key: "c", weight: 0.2, state: "unconfirmed" },
    ],
    []
  );
  assert.ok(near(cov, 0.75), `cov ${cov}`);
});

test("coverageAdequacy: adverse terms multiply the penalty only when confirmed-present", () => {
  // coverage_score 1.0; one adverse present penalty 0.1 → term_penalty 0.9
  const cov = coverageAdequacy(
    [{ key: "a", weight: 1, state: "present" }],
    [
      { key: "x", penalty: 0.1, state: "present" },
      { key: "y", penalty: 0.3, state: "absent" }, // not present → ignored
      { key: "z", penalty: 0.3, state: "unconfirmed" }, // not present → ignored
    ]
  );
  assert.ok(near(cov, 0.9), `cov ${cov}`);
});

test("coverageAdequacy: term penalty is floored at 0.5 (P1-12)", () => {
  // two adverse present 0.3 and 0.3 → product 0.49 → floored to 0.5
  const cov = coverageAdequacy(
    [{ key: "a", weight: 1, state: "present" }],
    [
      { key: "x", penalty: 0.3, state: "present" },
      { key: "y", penalty: 0.3, state: "present" },
    ]
  );
  assert.ok(near(cov, 0.5), `cov ${cov}`);
});

test("coverageAdequacy: all-unconfirmed checklist (denom 0) is unconfirmed, never a false 0", () => {
  const cov = coverageAdequacy(
    [{ key: "a", weight: 1, state: "unconfirmed" }],
    []
  );
  assert.equal(cov, "unconfirmed");
});

// --------------------------------------------------------- statusFromLineAdequacy (§5c)
test("statusFromLineAdequacy: bands are covered ≥0.90, review ≥0.55, else potential-gap", () => {
  assert.equal(statusFromLineAdequacy(0.95), "covered");
  assert.equal(statusFromLineAdequacy(0.9), "covered");
  assert.equal(statusFromLineAdequacy(0.79), "review");
  assert.equal(statusFromLineAdequacy(0.55), "review");
  assert.equal(statusFromLineAdequacy(0.16), "potential-gap");
  assert.equal(statusFromLineAdequacy(0), "potential-gap");
});

// ----------------------------------------------------------------- assessLine (§5c, §5f)
const quantBase = {
  key: "liability",
  category: "liability",
  mode: "quantitative",
  weight: 2,
};

test("assessLine: material line with no policy is not-identified, scored 0, in core", () => {
  const a = assessLine({
    ...quantBase,
    key: "bi",
    category: "business-continuity",
    weight: 3,
    policyFound: false,
    C: null,
    R: 246000000,
    checklist: [],
    adverse: [],
  });
  assert.equal(a.status, "not-identified");
  assert.equal(a.lineScore, 0);
  assert.equal(a.inScoreCore, true);
  assert.equal(a.countsAgainstCompleteness, false);
});

test("assessLine: positively-evidenced absence is confirmed-absent, scored 0, in core", () => {
  const a = assessLine({
    ...quantBase,
    policyFound: false,
    confirmedAbsent: true,
    C: null,
    R: 50000000,
    checklist: [],
    adverse: [],
  });
  assert.equal(a.status, "confirmed-absent");
  assert.equal(a.lineScore, 0);
  assert.equal(a.inScoreCore, true);
});

test("assessLine: unconfirmed benchmark → unavailable, excluded from core, hits completeness", () => {
  const a = assessLine({
    ...quantBase,
    key: "gpa",
    category: "people",
    weight: 3,
    policyFound: true,
    C: 200000,
    R: "unconfirmed",
    checklist: [{ key: "ptd", weight: 1, state: "present" }],
    adverse: [],
  });
  assert.equal(a.status, "unavailable");
  assert.equal(a.lineScore, null);
  assert.equal(a.inScoreCore, false);
  assert.equal(a.countsAgainstCompleteness, true);
});

test("assessLine: quantitative line multiplies si × coverage and bands the status", () => {
  const a = assessLine({
    ...quantBase,
    policyFound: true,
    C: 10000000, // ₹1 Cr
    R: 50000000, // ₹5 Cr → si 0.20
    checklist: [{ key: "cov", weight: 1, state: "present" }],
    adverse: [], // coverage 1.0
  });
  assert.ok(near(a.lineAdequacy, 0.2), `line_adeq ${a.lineAdequacy}`);
  assert.equal(a.status, "potential-gap");
  assert.equal(a.lineScore, 20);
  assert.equal(a.inScoreCore, true);
});

test("assessLine: compliance mode does not fold into score core by default (sits in strip)", () => {
  const pass = assessLine({
    key: "wc",
    category: "people",
    mode: "compliance",
    weight: 3,
    compliance: "pass",
  });
  assert.equal(pass.inScoreCore, false);
  assert.equal(pass.compliance, "pass");
  assert.equal(pass.countsAgainstCompleteness, false);

  const unconf = assessLine({
    key: "wc",
    category: "people",
    mode: "compliance",
    weight: 3,
    compliance: "unconfirmed",
  });
  assert.equal(unconf.status, "unavailable");
  assert.equal(unconf.countsAgainstCompleteness, true);
});
