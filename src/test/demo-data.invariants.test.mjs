import test from "node:test";
import assert from "node:assert/strict";
import { demoCompany } from "../lib/demo-data.ts";

const STATUSES = new Set(["covered","review","not-identified","potential-gap","unavailable"]);
const SEVERITIES = new Set(["high","attention","review","good"]);

test("overall and category scores are 0-100", () => {
  const s = demoCompany.scores;
  assert.ok(s.overall >= 0 && s.overall <= 100);
  for (const c of s.categories) assert.ok(c.score >= 0 && c.score <= 100, `${c.key} out of range`);
});

test("coverage statuses are valid enum members", () => {
  for (const c of demoCompany.coverage) assert.ok(STATUSES.has(c.status), `${c.key} bad status`);
});

test("risk severities are valid", () => {
  for (const r of demoCompany.risks) assert.ok(SEVERITIES.has(r.severity), `${r.key} bad severity`);
});

test("every recommendation has a determination and a unique id", () => {
  const ids = new Set();
  for (const r of demoCompany.recommendations) {
    assert.ok(r.id && !ids.has(r.id), `dup id ${r.id}`); ids.add(r.id);
    assert.ok(r.determination && r.determination.assessment.length > 0);
  }
  assert.equal(demoCompany.recommendations.length, 3);
});

test("determination recommendationRefs resolve to a real recommendation", () => {
  const recIds = new Set(demoCompany.recommendations.map(r => r.id));
  const withRef = [...demoCompany.scores.categories, ...demoCompany.risks].filter(x => x.determination.recommendationRef);
  for (const x of withRef) assert.ok(recIds.has(x.determination.recommendationRef), `bad ref ${x.determination.recommendationRef}`);
});

test("headline numbers are present and consistent", () => {
  assert.equal(demoCompany.profile.employees, 187);
  assert.equal(demoCompany.benefits.employees, 187);
  assert.equal(demoCompany.scores.overall, 64);
  assert.equal(demoCompany.benefits.peopleScore, 67);
  assert.equal(demoCompany.benefits.benefitsScore, 43);
});
