// Item 100 (fred, Nov 5): the crew on the Plan's front page. The app's own crewDay / crewOf (five friends a day, chosen from the local
// date alone) and its first names (CREW_NAMES, in FW.FRIENDS order: the bundle ships the drawings only), run in the real page (index.html,
// Firebase off, no network, as rider.test.mjs opens it) through a read-only hook. The kit's q100 test checks the screens; this checks the rule.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const SRC = fileURLToPath(new URL('../../index.html', import.meta.url));
const URL0 = 'file://' + SRC;
const HOOK = `Object.defineProperty(window,'__crew',{configurable:true,get(){ return {crewDay, crewOf, CREW_NAMES}; }});\n`;
function pageSource() {
  let s = readFileSync(SRC, 'utf8');
  const cfg = /const FIREBASE_CONFIG = \{[\s\S]*?\n\};/;
  if (!cfg.test(s)) throw new Error('crew test: FIREBASE_CONFIG block not found in index.html');
  s = s.replace(cfg, 'const FIREBASE_CONFIG = null;');
  const k = s.indexOf("\n'use strict';\n");
  if (k < 0) throw new Error("crew test: the main script's 'use strict' line was not found");
  const at = k + "\n'use strict';".length;
  return s.slice(0, at) + '\n' + HOOK + s.slice(at);
}

let browser, page;
const errors = [];
before(async () => {
  const body = pageSource();
  browser = await chromium.launch();
  // a time zone with daylight saving: the day number must not slip at the change
  const ctx = await browser.newContext({ serviceWorkers: 'block', timezoneId: 'America/Indiana/Indianapolis', locale: 'en-US', viewport: { width: 390, height: 844 } });
  page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', r => { const u = r.request().url(); if (u === URL0) return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body }); return u.startsWith('file:') ? r.continue() : r.abort(); });
  await page.goto(URL0);
  await page.waitForFunction(() => !!window.__crew && !!window.FW);
});
after(async () => { if (browser) await browser.close(); });

const NAMES = ['Ryan', 'Dustin', 'Chelsea', 'Bobby', 'Anne', 'Heather', 'Luke', 'Mark', 'Maria', 'Rob', 'Marc', 'Katie', 'Bentley', 'John', 'Steve', 'Julia', 'Chiara', 'Rob', 'Paul'];

test('first names: one per FW.FRIENDS entry, in its order, first names only', async () => {
  const r = await page.evaluate(() => ({ names: window.__crew.CREW_NAMES, n: FW.FRIENDS.length }));
  assert.deepEqual(r.names, NAMES);
  assert.equal(r.names.length, r.n);
  r.names.forEach(s => assert.match(s, /^[A-Z][a-z]+$/, s));
});

test('the day number is the local date alone (any clock time, across daylight saving)', async () => {
  const r = await page.evaluate(() => { const C = window.__crew, D = (y, m, d, h, mi) => C.crewDay(new Date(y, m, d, h, mi));
    const out = { same: [], step: [] };
    for (const [y, m, d] of [[2026, 2, 8], [2026, 10, 1], [2026, 9, 29], [2027, 0, 1]]) out.same.push([D(y, m, d, 0, 0), D(y, m, d, 0, 30), D(y, m, d, 12, 0), D(y, m, d, 23, 59)]);
    for (let t = new Date(2026, 0, 1, 12); t.getFullYear() < 2028; t.setDate(t.getDate() + 1)) { const a = C.crewDay(t), n = new Date(t); n.setDate(n.getDate() + 1); out.step.push(C.crewDay(n) - a); }
    return out; });
  r.same.forEach(L => assert.equal(new Set(L).size, 1, JSON.stringify(L)));
  assert.ok(r.step.every(x => x === 1), 'consecutive dates are consecutive day numbers (2026-2027)');
});

test('five different friends a day; each comes round 5 days in 19, every 3 or 4 days, never two days running; never both Robs', async () => {
  const days = await page.evaluate(() => { const C = window.__crew, L = []; for (let d = 19000; d < 22000; d++) L.push(C.crewOf(d)); return L; });
  days.forEach(L => { assert.equal(L.length, 5); assert.equal(new Set(L).size, 5); L.forEach(i => assert.ok(Number.isInteger(i) && i >= 0 && i < 19)); assert.ok(!(L.includes(9) && L.includes(17)), 'both Robs: ' + L); });
  for (let s = 0; s + 19 <= days.length; s += 7) { const c = new Array(19).fill(0); days.slice(s, s + 19).forEach(L => L.forEach(i => c[i]++)); assert.deepEqual(c, new Array(19).fill(5), 'window at ' + s); }
  for (let i = 0; i < 19; i++) { const on = days.map((L, d) => L.includes(i) ? d : -1).filter(d => d >= 0);
    for (let k = 1; k < on.length; k++) { const g = on[k] - on[k - 1]; assert.ok(g === 3 || g === 4, `friend ${i}: a gap of ${g} days`); } }
});

test('the same five for the same date, a different five the next day', async () => {
  const r = await page.evaluate(() => { const C = window.__crew; return [C.crewOf(C.crewDay(new Date(2026, 9, 29, 8))), C.crewOf(C.crewDay(new Date(2026, 9, 29, 22))), C.crewOf(C.crewDay(new Date(2026, 9, 30, 8)))]; });
  assert.deepEqual(r[0], r[1]);
  assert.ok(r[2].every(i => !r[0].includes(i)), 'no friend two days running');
});

test('no page errors', () => { assert.deepEqual(errors, []); });
