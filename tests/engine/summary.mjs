// `npm run answers:summary`: runs the golden rides and the random rides once and prints a Markdown summary (pass/fail per rule,
// judgment calls with counts and an example). Used for QUEUE_LOG.md and for a quick look; `npm test` is what CI runs.
import { readFileSync } from 'node:fs';
import { loadAthletes, athleteFor, fullRide } from '../fixtures/load.mjs';
import { expected } from '../reference/calc.js';
import { openApp } from './harness.mjs';
import { appCase } from './app-input.mjs';
import { alwaysTrue, goldenChecks, screenChecks, RULES } from './rules.mjs';
import { randomRides, describe, DEFAULT_SEED } from './random-rides.mjs';

const N = +(process.env.ANSWER_RUNS || 2000), SEED = +(process.env.ANSWER_SEED || DEFAULT_SEED);
const golden = JSON.parse(readFileSync(new URL('../golden/rides.json', import.meta.url), 'utf8'));
const athletes = loadAthletes();
const app = await openApp();
const lines = [];

const gr = golden.rides.map(g => ({ g, athlete: athleteFor(athletes, g.input), ride: fullRide(athletes, g.input) }));
const gout = await app.run(gr.map(x => appCase(x.athlete, x.ride)), { display: true });
let gPass = 0, gFail = 0; const gJ = {}, gFails = [];
gr.forEach((x, k) => {
  const ctx = { label: `${x.g.id} "${x.g.name}"`, athlete: x.athlete, ride: x.ride, exp: x.g.expected, app: gout[k], checks: x.g.checks || [] };
  for (const c of [...alwaysTrue(ctx), ...goldenChecks(ctx), ...screenChecks(ctx)]) {
    if (c.status === 'pass' || c.status === 'warned') gPass++;
    else if (c.status === 'fail') { gFail++; gFails.push(`${c.id}: ${c.msg}`); }
    else (gJ[c.j] ||= []).push(c.msg);
  }
});
lines.push(`### Golden rides (${gr.length}): ${gPass} checks pass, ${gFail} fail`);
gFails.forEach(m => lines.push(`- FAIL ${m}`));
for (const [j, l] of Object.entries(gJ).sort()) lines.push(`- ${j} (judgment, ${l.length}): ${l[0]}`);

const cases = randomRides(N, SEED).map(c => ({ athlete: athleteFor(c.athletes, c.input), ride: fullRide(c.athletes, c.input) }));
const rout = await app.run(cases.map(c => appCase(c.athlete, c.ride)));
const by = {};
cases.forEach((c, k) => {
  const exp = expected(c.athlete, c.ride);
  for (const r of alwaysTrue({ label: describe(k, c.athlete, c.ride, exp.durationMin), athlete: c.athlete, ride: c.ride, exp, app: rout[k] })) {
    const g = by[r.id] ||= { pass: 0, warned: 0, fail: [], j: {} };
    if (r.status === 'pass') g.pass++; else if (r.status === 'warned') g.warned++; else if (r.status === 'fail') g.fail.push(r.msg); else (g.j[r.j] ||= []).push(r.msg);
  }
});
lines.push('', `### ${N} random rides (seed ${SEED})`, '', '| rule | pass | fail | judgment calls | warned |', '|---|---|---|---|---|');
for (const [id, g] of Object.entries(by)) lines.push(`| ${id} ${RULES[id]} | ${g.pass} | ${g.fail.length} | ${Object.entries(g.j).map(([j, l]) => `${j}: ${l.length}`).join(', ') || '—'} | ${g.warned || '—'} |`);
for (const [id, g] of Object.entries(by)) if (g.fail.length) { lines.push('', `${id} failures, first 3:`); g.fail.slice(0, 3).forEach(m => lines.push(`- ${m}`)); }
for (const [id, g] of Object.entries(by)) for (const [j, l] of Object.entries(g.j)) lines.push(`- ${id} ${j} example: ${l[0]}`);
if (app.pageErrors.length) lines.push('', `Page errors: ${app.pageErrors.join(' | ')}`);
await app.close();
console.log(lines.join('\n'));
