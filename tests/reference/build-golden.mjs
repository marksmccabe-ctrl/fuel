// Fills tests/golden/rides.json "expected" from the reference calculator (tests/reference/calc.js, the written rules only).
//   node tests/reference/build-golden.mjs           rewrite every ride's "expected"
//   node tests/reference/build-golden.mjs --check   write nothing; exit 1 and list the rides whose stored "expected" is stale
import { readFileSync, writeFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { loadAthletes, athleteFor, fullRide } from '../fixtures/load.mjs';
import { expected } from './calc.js';

const file = new URL('../golden/rides.json', import.meta.url);
const data = JSON.parse(readFileSync(file, 'utf8'));
const athletes = loadAthletes();

// JSON round trip so a fresh result compares exactly like the stored one.
const fresh = input => JSON.parse(JSON.stringify(expected(athleteFor(athletes, input), fullRide(athletes, input))));

if (process.argv.includes('--check')) {
  const stale = data.rides.filter(r => !isDeepStrictEqual(r.expected, fresh(r.input))).map(r => r.id);
  if (stale.length) {
    console.log(`Stale expected (run node tests/reference/build-golden.mjs): ${stale.join(', ')}`);
    process.exit(1);
  }
  console.log(`All ${data.rides.length} golden rides match the reference calculator.`);
} else {
  // Keep "_about" (and any other top-level key) and the ride order. Each ride keeps every key it has, unchanged, in the order
  // id, name, note?, checks?, (any other keys, in their own order), input, expected — only "expected" is rewritten.
  const first = ['id', 'name', 'note', 'checks'];
  const out = { ...data, rides: data.rides.map(r => {
    const ride = {};
    for (const k of first) if (r[k] !== undefined) ride[k] = r[k];
    for (const [k, v] of Object.entries(r)) if (!first.includes(k) && k !== 'input' && k !== 'expected') ride[k] = v;
    ride.input = r.input;
    ride.expected = fresh(r.input);
    return ride;
  }) };
  writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote expected for ${out.rides.length} rides to tests/golden/rides.json`);
}
