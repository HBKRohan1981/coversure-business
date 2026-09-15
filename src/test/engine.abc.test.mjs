import test from "node:test";
import assert from "node:assert/strict";
import { assessBusiness } from "../lib/engine/engine.ts";
import { abcLines, abcIndustry } from "../lib/engine/__fixtures__/abc.ts";

const near = (a, b, eps = 1e-4) => Math.abs(a - b) <= eps;

const result = assessBusiness(abcLines, abcIndustry);
const byKey = Object.fromEntries(result.lines.map((l) => [l.key, l]));

// ---------------------------------------------------------------- line-level fidelity
// The worked example pins these; the fixture reproduces them exactly.

test("ABC · Property/Fire: honest under-insurance surfaces as Review (not the demo's Covered)", () => {
  const p = byKey["property-fire"];
  assert.ok(near(p.siAdequacy, 20 / 24), `si ${p.siAdequacy}`); // ₹20 Cr / ₹24 Cr = 0.8333
  assert.ok(near(p.coverageAdequacy, 0.9), `cov ${p.coverageAdequacy}`);
  assert.ok(near(p.lineAdequacy, 0.75), `line ${p.lineAdequacy}`);
  assert.equal(p.status, "review"); // 0.55 ≤ 0.75 < 0.90
  assert.equal(p.lineScore, 75);
});

test("ABC · Stock: covered via the fire declaration", () => {
  const s = byKey["stock"];
  assert.equal(s.siAdequacy, 1); // C ≈ R
  assert.equal(s.status, "covered"); // line_adequacy 0.90 ≥ 0.90
  assert.equal(s.lineScore, 90);
});

test("ABC · Business Interruption: not identified in documents, scored 0, pulls the score down", () => {
  const b = byKey["bi"];
  assert.equal(b.status, "not-identified");
  assert.equal(b.lineScore, 0);
  assert.equal(b.inScoreCore, true);
});

test("ABC · Liability: materially short SI → potential-gap at ~0.16", () => {
  const l = byKey["liability"];
  assert.ok(near(l.siAdequacy, 0.2), `si ${l.siAdequacy}`); // ₹1 Cr / ₹5 Cr
  assert.ok(near(l.coverageAdequacy, 0.8), `cov ${l.coverageAdequacy}`);
  assert.ok(near(l.lineAdequacy, 0.16), `line ${l.lineAdequacy}`);
  assert.equal(l.status, "potential-gap");
  assert.equal(l.lineScore, 16);
});

test("ABC · Cyber: not identified, scored 0", () => {
  assert.equal(byKey["cyber"].status, "not-identified");
  assert.equal(byKey["cyber"].lineScore, 0);
});

test("ABC · GPA: no CTC captured → Unavailable, not a guessed number; excluded from the core", () => {
  const g = byKey["gpa"];
  assert.equal(g.siAdequacy, "unconfirmed");
  assert.equal(g.status, "unavailable");
  assert.equal(g.lineScore, null);
  assert.equal(g.inScoreCore, false);
  assert.equal(g.countsAgainstCompleteness, true);
});

test("ABC · GMC: not identified, scored 0", () => {
  assert.equal(byKey["gmc"].status, "not-identified");
  assert.equal(byKey["gmc"].lineScore, 0);
});

test("ABC · Workmen's Comp: compliance-mode, sits in the strip, not the SI curve", () => {
  const w = byKey["wc"];
  assert.equal(w.mode, "compliance");
  assert.equal(w.inScoreCore, false);
  assert.equal(w.countsAgainstCompleteness, true); // unconfirmed
});

// ------------------------------------------------------------------- completeness (§6)
test("ABC · completeness: 6 of 8 material lines confirmed (GPA + WC outstanding)", () => {
  assert.equal(result.completeness.total, 8);
  assert.equal(result.completeness.confirmed, 6);
  assert.ok(near(result.completeness.ratio, 6 / 8), `ratio ${result.completeness.ratio}`);
});

// -------------------------------------------------------------- overall roll-up (§6, §5f)
test("ABC · overall: deterministic and reproducible", () => {
  const again = assessBusiness(abcLines, abcIndustry);
  assert.equal(again.overall, result.overall);
  assert.ok(result.overall >= 0 && result.overall <= 100);
});

test("ABC · overall: honest conservative output lands in the high band, NOT the demo's authored 64", () => {
  // Four material lines at/near 0 (BI, Cyber, GMC not-identified; GPA unavailable) drag the
  // roll-up far below the demo's authored 64. Re-basing the demo narrative on this honest
  // output is a product decision (spec §5f / §10). Pinned here as the engine's real output.
  assert.equal(Math.round(result.overall), 27);
  assert.ok(result.overall < 40, `expected high-band, got ${result.overall}`);
});

test("ABC · overall: the not-identified lines are the dominant drag (their categories score 0)", () => {
  const cat = Object.fromEntries(result.categories.map((c) => [c.key, c]));
  assert.equal(cat["business-continuity"].score, 0); // BI
  assert.equal(cat["cyber"].score, 0); // Cyber
  assert.equal(cat["people"].score, 0); // GMC 0; GPA excluded; WC in strip
});
