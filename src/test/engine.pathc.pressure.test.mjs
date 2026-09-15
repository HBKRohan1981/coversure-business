// Path C pressure-test — 4 synthetic profiles + 7 invariants. Diagnostic suite.
// v0.2 engine + its 51 tests untouched; Path C formula unchanged.
import test from "node:test";
import assert from "node:assert/strict";
import { assessBusinessPathC } from "../lib/engine/pathc.ts";
import { assessBusiness } from "../lib/engine/engine.ts";
import { assessLine } from "../lib/engine/adequacy.ts";
import {
  itItes,
  wellCoveredMfg,
  underinsuredMfg,
  sparseSme,
} from "../lib/engine/__fixtures__/synthetic.ts";
import { q, notIdentified, confirmedAbsent } from "../lib/engine/__fixtures__/_builders.ts";

const run = (p) => assessBusinessPathC(p.lines, p.industry);
const IT = run(itItes);
const WELL = run(wellCoveredMfg);
const UNDER = run(underinsuredMfg);
const SPARSE = run(sparseSme);

// -------------------------------------------------- fixture-level expected behaviour
test("Well-covered mfg: high adequacy + high breadth + high completeness, no flags", () => {
  assert.ok(WELL.adequacyScore >= 85, `adequacy ${WELL.adequacyScore}`);
  assert.ok(WELL.breadth.ratio >= 0.95, `breadth ${WELL.breadth.ratio}`);
  assert.ok(WELL.completeness.ratio >= 0.95, `completeness ${WELL.completeness.ratio}`);
  assert.ok(WELL.guardedScore >= 80, `guarded ${WELL.guardedScore}`);
  assert.equal(WELL.flags.breadthLimited, false);
  assert.equal(WELL.flags.provisional, false);
  assert.equal(WELL.flags.noIdentifiedCover, false);
});

test("Underinsured mfg: high breadth but low adequacy → low guarded (breadth can't compensate)", () => {
  assert.ok(UNDER.breadth.ratio >= 0.95, `breadth ${UNDER.breadth.ratio}`);
  assert.ok(UNDER.adequacyScore < 50, `adequacy ${UNDER.adequacyScore}`);
  assert.ok(UNDER.guardedScore < 50, `guarded ${UNDER.guardedScore}`);
  assert.equal(UNDER.flags.breadthLimited, false); // breadth is fine; adequacy is the problem
});

test("Sparse SME: strong adequacy on identified cover, but breadth-limited (not 'poorly insured')", () => {
  assert.ok(SPARSE.adequacyScore >= 80, `adequacy ${SPARSE.adequacyScore}`);
  assert.ok(SPARSE.breadth.ratio <= 0.35, `breadth ${SPARSE.breadth.ratio}`);
  assert.equal(SPARSE.flags.breadthLimited, true);
  assert.equal(SPARSE.flags.noIdentifiedCover, false); // it DOES have good cover, just narrow
});

test("IT/ITES: mixed adequacy, broad cover, one identified gap (GTL not-identified)", () => {
  const gtl = IT.lines.find((l) => l.key === "gtl");
  assert.equal(gtl.status, "not-identified");
  assert.ok(IT.breadth.ratio >= 0.85, `breadth ${IT.breadth.ratio}`);
  assert.ok(IT.adequacyScore > 40 && IT.adequacyScore < 80, `adequacy ${IT.adequacyScore}`);
});

// =================================== 7 INVARIANTS ===================================

// 1) breadth ↑ (adequacy held constant) → guarded ↑
test("INV1: increasing breadth at constant adequacy improves the guarded result", () => {
  const covered = () => q({ key: "property-fire", category: "property", weight: 1, si: 1, cov: 0.8 }); // score 80
  const A = assessBusinessPathC(
    [covered(), notIdentified({ key: "cyber", category: "cyber", weight: 1 })],
    "Manufacturing"
  );
  const B = assessBusinessPathC(
    [covered(), q({ key: "cyber", category: "cyber", weight: 1, si: 1, cov: 0.8 })], // both score 80
    "Manufacturing"
  );
  assert.equal(Math.round(A.adequacyScore), Math.round(B.adequacyScore)); // adequacy held (~80)
  assert.ok(B.breadth.ratio > A.breadth.ratio, "breadth should increase");
  assert.ok(B.guardedScore > A.guardedScore, `guarded ${A.guardedScore} → ${B.guardedScore}`);
});

// 2) adequacy ↑ (breadth held constant) → guarded ↑
test("INV2: increasing adequacy at constant breadth improves the guarded result", () => {
  const A = assessBusinessPathC(
    [q({ key: "property-fire", category: "property", weight: 1, si: 1, cov: 0.5 })], // score 50
    "Manufacturing"
  );
  const B = assessBusinessPathC(
    [q({ key: "property-fire", category: "property", weight: 1, si: 1, cov: 0.9 })], // score 90
    "Manufacturing"
  );
  assert.equal(A.breadth.ratio, B.breadth.ratio); // both 1.0
  assert.ok(B.adequacyScore > A.adequacyScore, "adequacy should increase");
  assert.ok(B.guardedScore > A.guardedScore, `guarded ${A.guardedScore} → ${B.guardedScore}`);
});

// 3) broad but inadequate stays low
test("INV3: broad-but-inadequate cover remains low-scoring", () => {
  assert.ok(UNDER.breadth.ratio >= 0.95);
  assert.ok(UNDER.guardedScore < 50, `guarded ${UNDER.guardedScore}`);
});

// 4) excellent cover on only one/two lines does not get a high headline
test("INV4: excellent cover on a narrow base does not produce a high headline", () => {
  // SPARSE has excellent property cover but nothing else.
  assert.ok(SPARSE.adequacyScore >= 80, "identified cover is genuinely good");
  assert.ok(SPARSE.guardedScore < 40, `headline (guarded) must stay low: ${SPARSE.guardedScore}`);
  assert.equal(SPARSE.flags.breadthLimited, true);
});

// 5) zero identified cover never yields a vacuous high score
test("INV5: zero identified cover never produces a vacuous high score", () => {
  const r = assessBusinessPathC(
    [
      notIdentified({ key: "property-fire", category: "property", weight: 3 }),
      notIdentified({ key: "liability", category: "liability", weight: 2 }),
    ],
    "Manufacturing"
  );
  assert.equal(r.adequacyScore, null);
  assert.equal(r.guardedScore, 0);
  assert.equal(r.flags.noIdentifiedCover, true);
});

// 6) unavailable is not treated as absent
test("INV6: unavailable info is not treated as absent", () => {
  const gpa = SPARSE.lines.find((l) => l.key === "gpa");
  assert.equal(gpa.status, "unavailable");
  assert.notEqual(gpa.status, "not-identified");
  assert.notEqual(gpa.status, "confirmed-absent");
  assert.equal(gpa.countsAgainstCompleteness, true); // it's a data gap, not a coverage gap
  // it is excluded from adequacy (can't assess) — NOT scored 0 like an absence would be
  assert.equal(gpa.lineScore, null);
  assert.equal(gpa.inScoreCore, false);
});

// 7) not-identified is never narrated/encoded as confirmed absence
test("INV7: not-identified is a distinct state from confirmed-absent", () => {
  const ni = assessLine(notIdentified({ key: "bi", category: "business-continuity", weight: 3 }));
  const ca = assessLine(confirmedAbsent({ key: "bi", category: "business-continuity", weight: 3 }));
  assert.equal(ni.status, "not-identified");
  assert.equal(ca.status, "confirmed-absent");
  assert.notEqual(ni.status, ca.status); // the engine keeps the distinction
});
