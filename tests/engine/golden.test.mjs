// The answer sheet, part 1: the golden rides (tests/golden/rides.json). For each ride the app's real engine plans it in Chromium and every
// rule is checked against the expected values the independent reference calculator wrote (tests/reference/calc.js).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadAthletes, athleteFor, fullRide } from '../fixtures/load.mjs';
import { expected } from '../reference/calc.js';
import { openApp } from './harness.mjs';
import { appCase } from './app-input.mjs';
import { alwaysTrue, goldenChecks, screenChecks } from './rules.mjs';
import { reportChecks } from './report.mjs';

const golden = JSON.parse(readFileSync(new URL('../golden/rides.json', import.meta.url), 'utf8'));
const athletes = loadAthletes();
const rides = golden.rides.map(g => ({ g, athlete: athleteFor(athletes, g.input), ride: fullRide(athletes, g.input) }));
let app, results;

before(async () => {
  app = await openApp();
  results = await app.run(rides.map(x => appCase(x.athlete, x.ride)), { display: true });
});
after(async () => { if (app) await app.close(); });

test('the answer sheet is complete (about 25 golden rides or more, every one with expected answers)', () => {
  assert.ok(golden.rides.length >= 25, `only ${golden.rides.length} golden rides`);
  for (const g of golden.rides) assert.ok(g.expected, `${g.id} has no expected answers: run npm run golden:build`);
});

test('the golden answers still match the reference calculator (rebuild with npm run golden:build)', () => {
  for (const { g, athlete, ride } of rides) assert.deepEqual(expected(athlete, ride), g.expected, `${g.id} ${g.name}: tests/golden/rides.json is out of date with tests/reference/calc.js`);
});

for (const [k, x] of rides.entries()) {
  test(`${x.g.id} · ${x.g.name}`, async t => {
    const ctx = { label: `${x.g.id} "${x.g.name}" (${x.athlete.name})`, athlete: x.athlete, ride: x.ride, exp: x.g.expected, app: results[k], checks: x.g.checks || [] };
    await reportChecks(t, [...alwaysTrue(ctx), ...goldenChecks(ctx), ...screenChecks(ctx)]);
  });
}

test('the app page ran without script errors', () => {
  assert.deepEqual(app.pageErrors, [], 'page errors while planning the golden rides');
});
