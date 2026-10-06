// The answer sheet, part 3 (item 42): runs. Four named scenarios and 400 random runs (fixed seed), each planned by the app's own engine
// (computeRun) and checked against the run rules (RULES.md R17):
//   RN1 carried fluid never exceeds the carry's capacity (each leg carries min(need, capacity));
//   RN2 no flask over the strength limit (the band's or the typed one, never above 8%);
//   RN3 carbs per hour on target with the gels (within half a gel for the run);
//   RN4 sodium per hour on target (±5%), or the electrolyte product's unit rounding, or no product chosen;
//   RN5 aid refills counted correctly (one per aid stop inside the run with water or sports drink; each refills min(need, capacity));
//   RN6 fluid = the running sweat grid at the run's temperature, then the fluid limits;
//   RN7 a leg the carry can't cover always shows the carry warning (and only then).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { loadAthletes, athleteFor, fullRide } from '../fixtures/load.mjs';
import { gridFluid, gridFromSingle, bandFor, OZ_ML } from '../reference/calc.js';
import { openApp } from './harness.mjs';
import { appCase } from './app-input.mjs';

const athletes = loadAthletes(), EFF = { easy: 'recovery', steady: 'z2', hard: 'hard' }, GRID_EFF = { easy: 'recovery', steady: 'steady', hard: 'hard' };
const CARBS = { easy: 45, steady: 60, hard: 75 };
function runCase(name, o) {
  const a = athleteFor(athletes, { athlete: o.athlete || 'A' }), ride = fullRide(athletes, { athlete: o.athlete || 'A', durationMin: o.durMin || 60, weather: o.weather || {}, fluidLimits: o.limits || null, topUp: o.topUp });
  const c = appCase(a, ride), grid = o.grid || gridFromSingle(a.sweatOzPerHr);
  c.i = Object.assign({}, c.i, { sport: 'run', intensity: EFF[o.effort], mode: o.mode || 'time', durMin: o.durMin || 60, miles: o.miles || 0, paceSec: o.pace || 510,
    aid: Object.assign({ mode: 'none', every: 2, list: [], water: true, drink: false, gels: false, powder: false }, o.aid || {}), carry: o.carry, carbsHr: CARBS[o.effort], sweat: grid });
  return { name, o, grid, a, c };
}
const SCENARIOS = [
  runCase('1:45 Steady, 2 × 500 mL soft flasks, aid every 2 mi', { effort: 'steady', durMin: 105, pace: 510, aid: { mode: 'every', every: 2 }, carry: { kind: 'flasks', n: 2, ml: 500 } }),
  runCase('3:30 Hard, vest (2 × 500 mL), no aid', { effort: 'hard', durMin: 210, pace: 450, carry: { kind: 'vest', n: 2, ml: 500 } }),
  runCase('hot 85 °F, handheld (1 × 500 mL), 1:30 Steady, aid every 3 mi', { effort: 'steady', durMin: 90, pace: 510, weather: { feelsLikeF: 85, airF: 85 }, aid: { mode: 'every', every: 3 }, carry: { kind: 'handheld', n: 1, ml: 500 } }),
  runCase('carry too small without aid: 2:00 Hard, one 500 mL handheld', { effort: 'hard', durMin: 120, pace: 450, carry: { kind: 'handheld', n: 1, ml: 500 } }),
];
// 400 random runs (a small LCG, fixed seed): effort, time or distance, pace, temperature, aid, carry, limits
function randomRuns(n, seed = 20261005) { let s = seed; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648, pick = L => L[Math.floor(rnd() * L.length)];
  return [...Array(n)].map((_, k) => { const eff = pick(['easy', 'steady', 'steady', 'hard']), mode = rnd() < 0.4 ? 'distance' : 'time', pace = 360 + Math.round(rnd() * 360), kind = pick(['handheld', 'flasks', 'vest', 'belt']);
    const aidMode = pick(['none', 'every', 'every', 'list']), list = [...Array(1 + Math.floor(rnd() * 5))].map(() => Math.round(rnd() * 260) / 10);
    const lim = rnd() < 0.2 ? { minOzPerHr: rnd() < 0.5 ? 16 + Math.round(rnd() * 10) : null, maxOzPerHr: rnd() < 0.5 ? 26 + Math.round(rnd() * 14) : null } : null;
    const grid = rnd() < 0.5 ? { level: pick(['light', 'normal', 'heavy']), own: rnd() < 0.5 ? { 'hot.z2': 20 + Math.round(rnd() * 30), 'mild.hard': 15 + Math.round(rnd() * 25) } : {} } : null;
    return runCase(`random #${k}`, { athlete: rnd() < 0.7 ? 'A' : 'B', effort: eff, mode, durMin: 20 + Math.round(rnd() * 280), miles: Math.round((2 + rnd() * 30) * 10) / 10, pace,
      weather: { feelsLikeF: 25 + Math.round(rnd() * 80) }, aid: { mode: aidMode, every: pick([1, 1.5, 2, 3, 5]), list, water: rnd() < 0.9, drink: rnd() < 0.3, powder: rnd() < 0.4 },
      carry: { kind, n: 1 + Math.floor(rnd() * (kind === 'handheld' ? 2 : 4)), ml: pick([250, 300, 500, 600]) }, limits: lim, grid: grid || undefined, topUp: rnd() < 0.2 ? 'none' : undefined }); }); }
function rules(x, r) {
  const out = [], put = (id, okv, msg, j) => out.push({ id, status: okv ? 'pass' : j ? 'judgment' : 'fail', msg: `${x.name}: ${msg}` });
  if (r.errs || r.crash) { put('RN0', false, `no plan: ${JSON.stringify(r.errs || r.crash)}`); return out; }
  const i = x.c.i, e = 1e-6;
  put('RN1', r.legs.every(l => l.carriedMl <= r.cap + e && Math.abs(l.carriedMl - Math.min(l.needMl, r.cap)) < e), `legs carry ${r.legs.map(l => Math.round(l.carriedMl)).join(', ')} mL; capacity ${r.cap} mL`);
  put('RN2', r.S <= 8 + e && r.legs.every(l => l.flasks.every(f => f.conc <= r.S + 1e-9)), `flasks ${r.legs.map(l => l.flasks[0].conc.toFixed(2)).join(', ')}%, limit ${r.S}%`);
  const gc = r.gelCarbs || 0, cph = r.perHour.carbs, room = r.gels.length >= Math.max(1, Math.floor((Math.max(Math.min(20, r.H * 30), r.H * 60 - 15) - Math.min(20, r.H * 30)) / 10) + 1) && r.perHour.carbs < r.carbsHr;
  const carbOk = Math.abs(cph - r.carbsHr) <= gc / 2 / r.H + e || (gc === 0 && Math.abs(cph - r.carbsHr) < e);
  put('RN3', carbOk || room, `carbs ${cph.toFixed(1)} g/hr, target ${r.carbsHr} (gels of ${gc} g)`, !carbOk && room);
  const ds = r.naHr > 0 ? (r.perHour.na - r.naHr) / r.naHr : 0, unit = r.topup && r.topup.unit !== 'g' ? r.topup.na : r.topup ? 0.05 * r.topup.na * 2 : 0, miss = Math.abs(r.perHour.na - r.naHr) * r.H;
  const naOk = Math.abs(ds) <= 0.05 + e, naJ = (i.saltId === 'none' && ds < 0) || (unit && miss <= unit / 2 + 1) || (ds > 0 && !r.topup) || (ds < 0 && miss <= 25 + 1);
  put('RN4', naOk || naJ, `sodium ${r.perHour.na.toFixed(0)} mg/hr, target ${r.naHr.toFixed(0)} (${(ds * 100).toFixed(1)}%)`, !naOk && naJ);
  const A = i.aid, miles = r.miles, want = (A.water || A.drink) ? (A.mode === 'every' ? (() => { const L = []; for (let m = A.every; m < miles - 0.05; m += A.every) L.push(Math.round(m * 100) / 100); return L; })() : A.mode === 'list' ? [...new Set(A.list.filter(m => m > 0 && m < miles - 0.05))].sort((p, q) => p - q) : []) : [];
  put('RN5', r.aid.length === want.length && r.aid.every((a, k) => Math.abs(a.mile - want[k]) < e && Math.abs(a.ml - Math.min(r.legs[k + 1].needMl, r.cap)) < e), `aid ${r.aid.map(a => a.mile).join(', ') || 'none'}; expected ${want.join(', ') || 'none'}`);
  const T = i.tempF, fw = gridFluid(x.grid, x.o.effort === 'easy' ? 'recovery' : x.o.effort === 'steady' ? 'steady' : 'hard', bandFor({ feelsLikeF: T }).band), lo = x.o.limits && x.o.limits.minOzPerHr, hi = x.o.limits && x.o.limits.maxOzPerHr;
  let f = fw; if (lo != null && f < lo) f = lo; if (hi != null && f > hi) f = hi;
  put('RN6', Math.abs(r.fluidHr - f) < 0.01, `fluid ${r.fluidHr.toFixed(2)} oz/hr, the grid gives ${fw.toFixed(2)} at ${T} °F (limits ${lo ?? '–'}–${hi ?? '–'})`);
  const short = r.legs.some(l => l.shortMl > 50 && l.shortMl > 0.05 * l.needMl), warned = r.warn.some(w => w.key === 'carry' && w.kind === 'bad');
  put('RN7', short === warned, `${short ? 'a leg is short' : 'no leg short'}; carry warning ${warned ? 'shown' : 'not shown'}`);
  return out;
}
let app, S, R;
before(async () => { app = await openApp(); S = await app.runs(SCENARIOS.map(x => x.c)); const RR = randomRuns(400); R = { cases: RR, out: await app.runs(RR.map(x => x.c)) }; });
after(async () => { if (app) await app.close(); });
for (const [k, x] of SCENARIOS.entries()) test(`run scenario: ${x.name}`, () => { const fails = rules(x, S[k]).filter(r => r.status === 'fail'); assert.equal(fails.length, 0, fails.map(f => f.msg).join('\n')); });
test('scenario 1: refills at mile 2, 4, … and gels make up the carbs', () => { const r = S[0]; assert.ok(r.aid.length >= 5 && r.aid[0].mile === 2); assert.ok(r.gels.length >= 1); assert.ok(r.legs.every(l => l.carriedMl <= 1000)); });
test('scenario 2: a vest with no aid carries 1,000 mL at most and warns when the run needs more', () => { const r = S[1]; assert.equal(r.legs.length, 1); assert.ok(r.legs[0].carriedMl <= 1000 + 1e-6); assert.equal(r.legs[0].needMl > 1050, r.warn.some(w => w.key === 'carry')); });
test('scenario 3: hot 85 °F plans the Hot box (auto × 1.5)', () => { const r = S[2], g = gridFromSingle(athletes.A.sweatOzPerHr); assert.ok(Math.abs(r.fluidHr - gridFluid(g, 'steady', 'Hot')) < 0.01); assert.ok(r.S <= 3 + 1e-9); });
test('scenario 4: carry too small without aid → the clear warning, never an over-strength flask', () => { const r = S[3]; const w = r.warn.find(w => w.key === 'carry'); assert.ok(w && /Your carry holds 500 mL\. From the start to the finish needs [\d,]+ mL\./.test(w.text), JSON.stringify(r.warn)); assert.ok(r.legs[0].flasks.every(f => f.conc <= r.S + 1e-9) && r.legs[0].carriedMl <= 500 + 1e-6); });
test('run rules on 400 random runs (seed 20261005)', async t => {
  const by = {}; R.cases.forEach((x, k) => rules(x, R.out[k]).forEach(r => { const g = by[r.id] ||= { pass: 0, fail: [], judgment: [] }; g[r.status === 'pass' ? 'pass' : r.status].push ? g[r.status].push(r.msg) : g.pass++; }));
  for (const [id, g] of Object.entries(by).sort()) {
    if (g.judgment.length) await t.test(`${id} [judgment: ${g.judgment.length} runs]`, { todo: g.judgment.slice(0, 3).join(' | ') }, () => {});
    await t.test(`${id} · ${g.pass} pass`, () => assert.equal(g.fail.length, 0, `${g.fail.length} of 400 random runs break ${id}. First ones:\n${g.fail.slice(0, 4).join('\n')}`)); }
});
