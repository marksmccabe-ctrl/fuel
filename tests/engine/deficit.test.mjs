// Item 92 (fred, Oct 15): "Ride fueling NEVER changes because of a deficit. No code in the plan, the Crunch or Adjust reads deficits."
// Three proofs, every run:
// 1. The same plans with and without. Two pages of the real app (harness.mjs: no network, a fixed clock): one with nothing, one with a
//    current deficit (started Mon Sep 21, 8 weeks, 0.75 lb a week), four weigh-ins, the Profile weight the newest one set and the reminder
//    days. Every golden ride (with what Results shows, the copy too), 200 random rides and the runs (the four scenarios and 100 random ones)
//    are planned by the app's own engine on both pages: the results must be identical.
// 2. Static: the app's main script, scanned (comments out, string text blanked, template ${} code kept). Nothing the plan's math reaches
//    (compute, legPlan, computeRun, planTotals, computeRide, readInputs, readRunInputs and Adjust's pin math) may name a deficit, a weigh-in
//    or the Profile weight; nor anything the Crunch (both Calculate handlers), recrunch / recrunchQuiet and every adj* / pin* function
//    reach, except through the screen and storage functions in BARRIER, which only draw or store after the plan is made (none hands
//    anything back to it). "Reach" is by name, so it over-counts (any function a body names, used or not): a pass is strict.
// 3. A tripwire: deficit and weigh-in code may live only in wgh* / dfc* functions and in the HOMES listed below (storage and sync, Back up /
//    Restore, the Journal, Volume, Settings › You and the races' aero estimate, which read the Profile weight). A new place fails here: if
//    it is not on the plan's path, add it to HOMES; this test still proves the plan can't reach it.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadAthletes, athleteFor, fullRide } from '../fixtures/load.mjs';
import { openApp } from './harness.mjs';
import { appCase } from './app-input.mjs';
import { randomRides, DEFAULT_SEED } from './random-rides.mjs';

const athletes = loadAthletes();
const golden = JSON.parse(readFileSync(new URL('../golden/rides.json', import.meta.url), 'utf8'));
const HTML = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

// the page with a deficit: the clock is Sat Oct 3 2026 (harness.mjs), so this one is current (week 2 of 8)
const WEIGHINS = [['2026-09-21', '06:40', 187.3, ''], ['2026-09-24', '06:45', 186.9, 'before'], ['2026-09-28', '06:42', 186.1, ''], ['2026-10-01', '18:10', 185.7, 'after']]
  .map(([date, time, lb, when], i) => ({ id: 'wq' + i, date, time, lb, when, note: '', createdAt: 1790000000000 + i, updatedAt: 1790000000000 + i }));
const WITH = { 'bluebird.weights.v1': WEIGHINS, 'bluebird.settings.v2': { weightLb: 185.7,
  volume: { deficits: [{ id: 'dq1', start: '2026-09-21', weeks: 8, pace: 0.75, startLb: 187.3, goalLb: 181.3, createdAt: 1790000000000 }], weighDays: [1, 4] } } };

// the runs (as tests/engine/run.test.mjs builds them): four scenarios and 100 random runs on a fixed seed
const EFF = { easy: 'recovery', steady: 'z2', hard: 'hard' }, CARBS = { easy: 45, steady: 60, hard: 75 };
function runCase(o) {
  const a = athleteFor(athletes, { athlete: o.athlete || 'A' }), ride = fullRide(athletes, { athlete: o.athlete || 'A', durationMin: o.durMin || 60, weather: o.weather || {}, fluidLimits: o.limits || null, topUp: o.topUp });
  const c = appCase(a, ride);
  c.i = Object.assign({}, c.i, { sport: 'run', intensity: EFF[o.effort], mode: o.mode || 'time', durMin: o.durMin || 60, miles: o.miles || 0, paceSec: o.pace || 510,
    aid: Object.assign({ mode: 'none', every: 2, list: [], water: true, drink: false, gels: false, powder: false }, o.aid || {}), carry: o.carry, carbsHr: CARBS[o.effort], sweat: o.grid || c.i.sweat });
  return c;
}
function runs() {
  const out = [runCase({ effort: 'steady', durMin: 105, pace: 510, aid: { mode: 'every', every: 2 }, carry: { kind: 'flasks', n: 2, ml: 500 } }),
    runCase({ effort: 'hard', durMin: 210, pace: 450, carry: { kind: 'vest', n: 2, ml: 500 } }),
    runCase({ effort: 'steady', durMin: 90, pace: 510, weather: { feelsLikeF: 85, airF: 85 }, aid: { mode: 'every', every: 3 }, carry: { kind: 'handheld', n: 1, ml: 500 } }),
    runCase({ effort: 'hard', durMin: 120, pace: 450, carry: { kind: 'handheld', n: 1, ml: 500 } })];
  let s = 20261092; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648, pick = L => L[Math.floor(rnd() * L.length)];
  for (let k = 0; k < 100; k++) { const kind = pick(['handheld', 'flasks', 'vest', 'belt']);
    out.push(runCase({ athlete: rnd() < 0.7 ? 'A' : 'B', effort: pick(['easy', 'steady', 'steady', 'hard']), mode: rnd() < 0.4 ? 'distance' : 'time', durMin: 20 + Math.round(rnd() * 280), miles: Math.round((2 + rnd() * 30) * 10) / 10,
      pace: 360 + Math.round(rnd() * 360), weather: { feelsLikeF: 25 + Math.round(rnd() * 80) }, aid: { mode: pick(['none', 'every', 'list']), every: pick([1, 1.5, 2, 3, 5]), list: [3.1, 6.2, 9.3], water: rnd() < 0.9, drink: rnd() < 0.3, powder: rnd() < 0.4 },
      carry: { kind, n: 1 + Math.floor(rnd() * (kind === 'handheld' ? 2 : 4)), ml: pick([250, 300, 500, 600]) }, topUp: rnd() < 0.2 ? 'none' : undefined })); }
  return out;
}

const GOLD = golden.rides.map(g => ({ id: g.id, name: g.name, c: appCase(athleteFor(athletes, g.input), fullRide(athletes, g.input)) }));
const RAND = randomRides(200, DEFAULT_SEED).map(r => appCase(athleteFor(r.athletes, r.input), fullRide(r.athletes, r.input)));
const RUNS = runs();
let A, B, out = {};

before(async () => {
  A = await openApp(); B = await openApp({ storage: WITH });
  for (const [k, P] of [['a', A], ['b', B]]) out[k] = { gold: await P.run(GOLD.map(x => x.c), { display: true }), rand: await P.run(RAND), runs: await P.runs(RUNS),
    state: await P.evaluate(() => { const E = window.__eng, x = E.item92; return { deficits: (E.settings.volume && E.settings.volume.deficits) || null, weightLb: E.settings.weightLb ?? null, weighins: x.weighins ? x.weighins.length : null, current: x.current ? x.current.id : null }; }) };
});
after(async () => { if (A) await A.close(); if (B) await B.close(); });

test('the page with a deficit has it: current, four weigh-ins, the Profile weight from the newest; the other page has none', () => {
  assert.equal(out.b.state.current, 'dq1', JSON.stringify(out.b.state));
  assert.equal(out.b.state.weighins, 4); assert.equal(out.b.state.weightLb, 185.7);
  assert.equal(out.a.state.current, null); assert.equal(out.a.state.weighins, 0); assert.equal(out.a.state.deficits, null);
});
test(`every golden ride (${GOLD.length}, with what Results shows and its copy) is planned the same with and without a deficit and weigh-ins`, () => {
  assert.ok(GOLD.length >= 25);
  GOLD.forEach((g, k) => { const x = out.a.gold[k]; assert.ok(!x.crash && !(x.display && x.display.crash), `${g.id}: ${x.crash || (x.display && x.display.crash)}`); assert.deepEqual(out.b.gold[k], out.a.gold[k], `${g.id} ${g.name}: the plan changed with a deficit`); });
});
test('200 random rides are planned the same with and without a deficit and weigh-ins', () => {
  assert.equal(RAND.length, 200);
  RAND.forEach((c, k) => assert.deepEqual(out.b.rand[k], out.a.rand[k], `random ride #${k}: the plan changed with a deficit`));
});
test('the runs (4 scenarios, 100 random) are planned the same with and without a deficit and weigh-ins', () => {
  assert.equal(RUNS.length, 104);
  RUNS.forEach((c, k) => { assert.ok(!out.a.runs[k].crash, String(out.a.runs[k].crash)); assert.deepEqual(out.b.runs[k], out.a.runs[k], `run #${k}: the plan changed with a deficit`); });
});
test('both app pages ran without script errors', () => { assert.deepEqual(A.pageErrors, []); assert.deepEqual(B.pageErrors, []); });

/* ---------- the static proofs ---------- */
// the scanner: comments out, string text blanked (the same length, so every position keeps its line), template text blanked, ${} code kept
function cleanJs(src) {
  const out = src.split(''), n = src.length; let last = '';
  const KW = new Set(['return', 'typeof', 'case', 'in', 'of', 'new', 'delete', 'void', 'throw', 'else', 'do', 'yield', 'await', 'instanceof']);
  const blank = (a, b) => { for (let k = a; k < b; k++) if (out[k] !== '\n') out[k] = ' '; };
  const regexOk = () => !(last === 'id' || last === 'num' || last === ')' || last === ']' || last === '}');
  function template(k) { while (k < n) { const c = src[k]; if (c === '\\') { blank(k, k + 2); k += 2; continue; } if (c === '`') return k + 1; if (c === '$' && src[k + 1] === '{') { k = code(k + 2, true); continue; } if (c !== '\n') out[k] = ' '; k++; } return k; }
  function code(k, inTpl) { let depth = 0;
    while (k < n) { const c = src[k], d = src[k + 1];
      if (c === '/' && d === '/') { const e = src.indexOf('\n', k), end = e < 0 ? n : e; blank(k, end); k = end; continue; }
      if (c === '/' && d === '*') { const e = src.indexOf('*/', k + 2), end = e < 0 ? n : e + 2; blank(k, end); k = end; continue; }
      if (c === '\'' || c === '"') { let j = k + 1; while (j < n && src[j] !== c && src[j] !== '\n') { if (src[j] === '\\') j++; j++; } blank(k + 1, j); k = j + 1; last = 'id'; continue; }
      if (c === '`') { k = template(k + 1); last = 'id'; continue; }
      if (c === '/' && regexOk()) { let j = k + 1, cls = false; while (j < n) { const x = src[j]; if (x === '\\') { j += 2; continue; } if (x === '\n') break; if (cls) { if (x === ']') cls = false; } else if (x === '[') cls = true; else if (x === '/') break; j++; } blank(k + 1, j); k = j + 1; while (/[a-z]/i.test(src[k] || '')) k++; last = 'id'; continue; }
      if (/[A-Za-z_$]/.test(c)) { let j = k + 1; while (j < n && /[\w$]/.test(src[j])) j++; last = KW.has(src.slice(k, j)) ? 'kw' : 'id'; k = j; continue; }
      if (/[0-9]/.test(c)) { let j = k + 1; while (j < n && /[\w.]/.test(src[j])) j++; last = 'num'; k = j; continue; }
      if (c === '{') depth++; if (c === '}') { if (inTpl && depth === 0) return k + 1; depth--; }
      if (!/\s/.test(c)) last = c; k++; }
    return k; }
  code(0, false); return out.join('');
}
// the top-level units of the app's one strict-mode function: function declarations, each const / let declarator, every other statement
function scan(html) {
  const a = html.indexOf("<script>\n(function(){\n'use strict';"); if (a < 0) throw new Error('the main script was not found');
  const s0 = a + '<script>\n'.length, raw = html.slice(s0, html.indexOf('</script>', s0)), line0 = html.slice(0, s0).split('\n').length, c = cleanJs(raw), n = c.length, U = [];
  const skip = j => { const st = [c[j]]; j++; while (j < n && st.length) { const x = c[j]; if ('([{'.includes(x)) st.push(x); else if (')]}'.includes(x)) st.pop(); j++; } return j; };
  const stmtEnd = j => { while (j < n) { const x = c[j]; if ('([{'.includes(x)) { j = skip(j); continue; } if (x === ';' || x === '\n' || x === '}') return j; j++; } return j; };
  let k = c.indexOf('{') + 1;
  while (k < n) {
    while (k < n && /[\s;]/.test(c[k])) k++; if (k >= n || c[k] === '}') break;
    const rest = c.slice(k, k + 200); let m = /^(async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(/.exec(rest);
    if (m) { let j = skip(k + m[0].length - 1); while (c[j] !== '{') j++; j = skip(j); U.push({ name: m[2], start: k, text: c.slice(k, j) }); k = j; continue; }
    m = /^(const|let|var)\s+/.exec(rest);
    if (m) { const e = stmtEnd(k), body = c.slice(k + m[0].length, e); let depth = 0, from = 0; const parts = [];
      for (let q = 0; q < body.length; q++) { const x = body[q]; if ('([{'.includes(x)) depth++; else if (')]}'.includes(x)) depth--; else if (x === ',' && depth === 0) { parts.push([from, q]); from = q + 1; } }
      parts.push([from, body.length]); parts.forEach(([p, q]) => { const t = body.slice(p, q), nm = /^\s*([A-Za-z_$][\w$]*)/.exec(t); U.push({ name: nm ? nm[1] : null, start: k + m[0].length + p, text: t }); });
      k = e + 1; continue; }
    const e = stmtEnd(k); U.push({ name: null, start: k, text: c.slice(k, e) }); k = e + 1;
  }
  U.forEach(u => { u.line = line0 + raw.slice(0, u.start).split('\n').length - 1; u.raw = raw.slice(u.start, u.start + u.text.length); }); /* (raw: the source as written, strings and all) */
  return U;
}
// the names a unit uses: not a property after a dot, not an object literal's key
function names(text) { const out = new Set(), re = /[A-Za-z_$][\w$]*/g; let m;
  while ((m = re.exec(text))) { const p = text[m.index - 1]; if ((p === '.' && text[m.index - 2] !== '.') || /[0-9]/.test(p || '')) continue;
    let i = m.index - 1, j = m.index + m[0].length; while (i >= 0 && /\s/.test(text[i])) i--; while (j < text.length && /\s/.test(text[j])) j++;
    if ((text[i] === '{' || text[i] === ',') && text[j] === ':' && text[j + 1] !== ':') continue; out.add(m[0]); }
  return out; }
const namesOf = u => u.names || (u.names = names(u.text));
function reach(U, roots, rootUnits, barrier = []) { const by = new Map(); U.forEach(u => { if (u.name) by.set(u.name, (by.get(u.name) || []).concat([u])); });
  const seen = new Set(), via = new Map(), q = [], go = (u, f) => { if (seen.has(u) || (u.name && barrier.includes(u.name))) return; seen.add(u); via.set(u, f); q.push(u); };
  roots.forEach(r => (by.get(r) || []).forEach(u => go(u, null))); rootUnits.forEach(u => go(u, null));
  while (q.length) { const u = q.shift(); for (const id of namesOf(u)) (by.get(id) || []).forEach(v => go(v, u)); }
  return { seen, path: u => { const p = []; for (let x = u; x; x = via.get(x)) p.push(x.name || 'the statement on line ' + x.line); return p.join(' ← '); } }; }

// what names a deficit, a weigh-in or the Profile weight (which the newest weigh-in sets)
const ITEM92 = /\b(?:wgh|dfc)[A-Z]\w*|\bwghList\b|KEYS\.weights\b|\bdeficits\b|\bweighDays\b|\bsettings\.weightLb\b|\b(?:DFC|WGH)_\w+|\bWGH\b/;
const OWN = /^(?:wgh|dfc|WGH|DFC)/; // item 92's own functions and constants
const MATH = ['compute', 'legPlan', 'computeRun', 'planTotals', 'computeRide', 'readInputs', 'readRunInputs', 'pinVals', 'carbRange', 'keepRidePins', 'rideKeep'];
// screen and storage functions the Crunch and Adjust call once the plan is made; each only draws or stores (none returns into the plan):
const BARRIER = ['updateSummaries', /* redraws Plan's and Settings' summary lines */ 'save', /* writes this device's storage and queues the sync */
  'toast', /* a message */ 'planSheetOpen', 'setSheetOpen', 'setSheetClose' /* open and close the sheets (Adjust's own sheet closes an open Settings sheet) */];
// where deficit and weigh-in code may live besides item 92's own functions
const HOMES = ['volNorm', 'renderProfileRows', 'renderAbout', 'rfAeroPrefill', /* Settings › You, the races' aero estimate: the Profile weight */
  'jhWeighs', 'jhDeficits', 'renderJournal', 'jnePick', /* the Journal */ 'backupData', 'restoreAll', /* Back up / Restore */
  'syncBeforeSave', 'syncFromCloud', 'syncMergeDocs', 'syncPlan', 'syncApply', 'syncFlush', 'syncReplace', 'syncBoot', /* sync */
  'volViewHTML', 'vwkHTML', 'volSeasonHTML', 'volAction', 'volSheetDraw', 'volSheetAct', 'volOffHTML', 'volRender' /* Volume (volRender: the card above the panel when there is no training to show) */];
const HOME_STMTS = [/^dfcBoot\(\)/, /^\$\('journalList'\)\.addEventListener\('click', e=>\{ const w=e\.target\.closest\('\[data-wgh-open\]'\)/, /^\$\('pWeight'\)\.addEventListener\('change'/, /^typeSave\(\['pWeight'\]/];
const U = scan(HTML), byName = n => U.filter(u => u.name === n);
const CRUNCH = U.filter(u => !u.name && /^\$\('calcBtn'\)\.addEventListener\('click'/.test(u.raw));
const ADJ = [...new Set(U.filter(u => u.name && /^(adj|pin)[A-Z]/.test(u.name)).map(u => u.name))];

test('the scan finds the app: its engine, the Crunch handlers, Adjust, and item 92’s own code', () => {
  assert.ok(U.length > 2000, `only ${U.length} top-level units`);
  for (const n of [...MATH, 'recrunch', 'recrunchQuiet', ...BARRIER, ...HOMES]) assert.ok(byName(n).length, `${n} not found in index.html`);
  assert.equal(CRUNCH.length, 2, 'the two Calculate handlers (ride and run)');
  assert.ok(ADJ.length >= 10 && ADJ.includes('adjOpen') && ADJ.includes('adjReset'), ADJ.join(', '));
  assert.ok(U.filter(u => u.name && OWN.test(u.name)).length >= 40, 'item 92’s wgh* / dfc* code');
});
test('nothing the plan’s math reaches names a deficit, a weigh-in or the Profile weight', () => {
  const R = reach(U, MATH, []), bad = [...R.seen].filter(u => ITEM92.test(u.text) || (u.name && OWN.test(u.name)));
  assert.ok(R.seen.size > 100, `the plan reaches only ${R.seen.size} units: the scan lost it`);
  assert.deepEqual(bad.map(u => `${R.path(u)} names ${u.text.match(ITEM92)[0]}`), []);
});
test('nothing the Crunch, recrunch or any adj* / pin* function reaches names one either (the screen and storage calls in BARRIER aside)', () => {
  const R = reach(U, ['recrunch', 'recrunchQuiet', ...ADJ], CRUNCH, BARRIER), bad = [...R.seen].filter(u => ITEM92.test(u.text) || (u.name && OWN.test(u.name)));
  assert.ok(R.seen.size > 300 && [...R.seen].some(u => u.name === 'render') && [...R.seen].some(u => u.name === 'computeRun'), `the Crunch reaches only ${R.seen.size} units`);
  assert.deepEqual(bad.map(u => `${R.path(u)} names ${(u.text.match(ITEM92) || [u.name])[0]}`), []);
  for (const b of BARRIER) for (const u of R.seen) { const re = new RegExp(`(?:=|return|\\?|:)\\s*${b}\\(`); assert.ok(!re.test(u.text), `${u.name || 'line ' + u.line} uses what ${b}() returns`); }
});
test('tripwire: deficit and weigh-in code lives only in wgh* / dfc* functions and the homes listed here', () => {
  const stray = U.filter(u => ITEM92.test(u.text) && !(u.name && (OWN.test(u.name) || HOMES.includes(u.name))) && !(!u.name && HOME_STMTS.some(re => re.test(u.raw.trim()))));
  assert.deepEqual(stray.map(u => `${u.name || 'a statement'} on line ${u.line} names ${u.text.match(ITEM92)[0]}`), [], 'deficit or weigh-in code in a new place');
  const R = reach(U, MATH, []), C = reach(U, ['recrunch', 'recrunchQuiet', ...ADJ], CRUNCH, BARRIER);
  const homes = U.filter(u => u.name && (OWN.test(u.name) || HOMES.includes(u.name)));
  assert.deepEqual(homes.filter(u => R.seen.has(u) || C.seen.has(u)).map(u => u.name), [], 'a home of deficit or weigh-in code is on the plan’s path');
});
test('the troubleshooting copy leaves out the Profile weight and the deficits; no AI prompt has a weight', () => {
  const m = /const DBG_DROP_SET=\[([^\]]*)\]/.exec(HTML); assert.ok(m, 'DBG_DROP_SET');
  const drop = m[1].split(',').map(s => s.trim().replace(/'/g, '')); assert.ok(drop.includes('weightLb') && drop.includes('volume'), drop.join(','));
  const fill = /function aiFill\(kind\)\{[\s\S]*?\n  let s=/.exec(HTML); assert.ok(fill && !/weight|weigh|deficit|wgh|dfc/i.test(fill[0]), 'aiFill names a weight');
  for (const id of ['aiPromptRaces', 'aiPromptRacesAdd', 'aiPromptVolume', 'aiPromptVolumeAdd']) { const p = new RegExp(`<script type="text/plain" id="${id}">([\\s\\S]*?)</script>`).exec(HTML); assert.ok(p, id); assert.ok(!/\{\{[^}]*(WEIGHT|DEFICIT)[^}]*\}\}/i.test(p[1]), `${id} has a weight placeholder`); }
});
test('fred has no push notifications', () => {
  assert.ok(!/Notification\s*\.\s*requestPermission|new\s+Notification\s*\(|showNotification\s*\(|pushManager|PushManager/.test(HTML), 'index.html asks for notifications');
  assert.ok(!/addEventListener\(\s*['"]push['"]|showNotification/.test(readFileSync(new URL('../../sw.js', import.meta.url), 'utf8')), 'sw.js handles pushes');
});
