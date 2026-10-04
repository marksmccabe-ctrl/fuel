// The answer sheet, part 2: the always-true rules on 2,000 random athletes and rides per run (fast-check, fixed seed). Replay another
// seed with ANSWER_SEED=<n>; change the count with ANSWER_RUNS=<n>.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { athleteFor, fullRide } from '../fixtures/load.mjs';
import { expected } from '../reference/calc.js';
import { openApp } from './harness.mjs';
import { appCase } from './app-input.mjs';
import { alwaysTrue, RULES } from './rules.mjs';
import { reportAggregate } from './report.mjs';
import { randomRides, describe, DEFAULT_SEED } from './random-rides.mjs';

const N = +(process.env.ANSWER_RUNS || 2000), SEED = +(process.env.ANSWER_SEED || DEFAULT_SEED);
let app, byRule;

before(async () => {
  const cases = randomRides(N, SEED).map(c => ({ athlete: athleteFor(c.athletes, c.input), ride: fullRide(c.athletes, c.input) }));
  app = await openApp();
  const out = await app.run(cases.map(c => appCase(c.athlete, c.ride)));
  byRule = {};
  cases.forEach((c, k) => {
    const exp = expected(c.athlete, c.ride);
    const label = describe(k, c.athlete, c.ride, exp.durationMin);
    for (const r of alwaysTrue({ label, athlete: c.athlete, ride: c.ride, exp, app: out[k] })) {
      const g = byRule[r.id] ||= { title: RULES[r.id], pass: 0, fail: [], judgment: {}, warned: [] };
      if (r.status === 'pass') g.pass++;
      else if (r.status === 'fail') g.fail.push(r.msg);
      else if (r.status === 'warned') g.warned.push(r.msg);
      else (g.judgment[r.j] ||= []).push(r.msg);
    }
  });
});
after(async () => { if (app) await app.close(); });

test(`always-true rules on ${N} random rides (seed ${SEED})`, async t => {
  assert.ok(byRule && Object.keys(byRule).length, 'no results');
  await reportAggregate(t, byRule, N);
});

test('the app page ran without script errors', () => {
  assert.deepEqual(app.pageErrors, [], 'page errors while planning the random rides');
});
