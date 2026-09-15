import test from "node:test";
import assert from "node:assert/strict";
import {
  categoryScore,
  deriveCategoryWeights,
  businessProtectionScore,
  completeness,
} from "../lib/engine/scoring.ts";

const near = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

// ------------------------------------------------------------------- categoryScore (§6)
test("categoryScore: weighted mean over scored lines only", () => {
  const s = categoryScore([
    { weight: 3, lineScore: 79, inScoreCore: true },
    { weight: 3, lineScore: 90, inScoreCore: true },
  ]);
  assert.ok(near(s, (3 * 79 + 3 * 90) / 6), `score ${s}`);
});

test("categoryScore: excludes lines not in the score core (unavailable / compliance)", () => {
  const s = categoryScore([
    { weight: 2, lineScore: 0, inScoreCore: true }, // GMC not-identified
    { weight: 3, lineScore: null, inScoreCore: false }, // GPA unavailable
    { weight: 3, lineScore: null, inScoreCore: false }, // WC compliance strip
  ]);
  assert.equal(s, 0); // only the GMC line counts
});

test("categoryScore: returns null when the category has no scored lines", () => {
  const s = categoryScore([{ weight: 2, lineScore: null, inScoreCore: false }]);
  assert.equal(s, null);
});

// ------------------------------------------------------- deriveCategoryWeights (Table D)
test("deriveCategoryWeights: normalises summed line materiality per category", () => {
  const w = deriveCategoryWeights("Manufacturing");
  // property raw = 3+3+3 = 9; total mfg raw = 32 → 9/32 = 0.28125 (within [0.12,0.32])
  assert.ok(near(w.property, 9 / 32), `property ${w.property}`);
  assert.ok(near(w.people, 9 / 32), `people ${w.people}`);
});

test("deriveCategoryWeights: clamps a tiny category up to its floor so it never vanishes", () => {
  const w = deriveCategoryWeights("Manufacturing");
  // cyber raw = 1 → 1/32 = 0.03125, below the 0.05 floor → clamped up
  assert.ok(near(w.cyber, 0.05), `cyber ${w.cyber}`);
});

// -------------------------------------------------- businessProtectionScore (§6 roll-up)
test("businessProtectionScore: weighted mean over categories that have a score", () => {
  const overall = businessProtectionScore([
    { key: "property", weight: 0.3, score: 80 },
    { key: "cyber", weight: 0.1, score: 0 },
    { key: "other", weight: 0.08, score: null }, // no scored lines → excluded
  ]);
  assert.ok(near(overall, (0.3 * 80 + 0.1 * 0) / (0.3 + 0.1)), `overall ${overall}`);
});

test("businessProtectionScore: a zero-scored category drags the overall (conservative posture)", () => {
  const withGap = businessProtectionScore([
    { key: "property", weight: 0.3, score: 90 },
    { key: "business-continuity", weight: 0.3, score: 0 },
  ]);
  assert.ok(withGap < 90, `expected drag, got ${withGap}`);
  assert.ok(near(withGap, 45), `overall ${withGap}`);
});

// --------------------------------------------------------------------- completeness (§6)
test("completeness: confirmed / total over material lines; unavailable counts against", () => {
  const c = completeness([
    { weight: 3, countsAgainstCompleteness: false }, // confirmed
    { weight: 3, countsAgainstCompleteness: false }, // confirmed
    { weight: 3, countsAgainstCompleteness: true }, // GPA unavailable
    { weight: 0, countsAgainstCompleteness: false }, // N/A line — not expected, excluded
  ]);
  assert.equal(c.total, 3);
  assert.equal(c.confirmed, 2);
  assert.ok(near(c.ratio, 2 / 3), `ratio ${c.ratio}`);
});

test("completeness: below the cutoff the score is flagged provisional", () => {
  const c = completeness([
    { weight: 3, countsAgainstCompleteness: false },
    { weight: 3, countsAgainstCompleteness: true },
    { weight: 3, countsAgainstCompleteness: true },
  ]);
  assert.equal(c.provisional, true); // 1/3 < 0.70
});
