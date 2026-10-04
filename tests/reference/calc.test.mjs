// Unit tests for the reference calculator, on numbers worked by hand from tests/reference/RULES.md.
// Run: node --test tests/reference/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadAthletes, athleteFor, fullRide, product } from '../fixtures/load.mjs';
import {
  BAND_TABLE, OZ_ML, SALT_MG_PER_G, HARD_MAX_PCT, expected, bandFor, rideMinutes, minGels, gelTimes, gelFit, gelWindow,
  caffeineAims, caffeinePlan, blendSplit, topUpKind, topUpCount, scoopsCount, scoopsText, concentrationPct, powderGrams, bottleCarbs,
} from './calc.js';

const athletes = loadAthletes();
const calc = input => expected(athleteFor(athletes, input), fullRide(athletes, input));
const near = (a, b, tol = 1e-3) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);
const A = athletes.A;
const mixA = product(A, 'tA-mix');

test('R1 constants and the R3 band table', () => {
  assert.equal(OZ_ML, 29.5735);
  assert.equal(SALT_MG_PER_G, 393.4);
  assert.equal(HARD_MAX_PCT, 8);
  assert.deepEqual(BAND_TABLE, {
    wbgt: { hot: 80, cold: 60 }, feelsLike: { hot: 85, cold: 65 },
    Hot: { pct: 3, fluid: 1.5, carbsHeat: 0.85 }, Moderate: { pct: 6, fluid: 1, carbsHeat: 1 }, Cold: { pct: 8, fluid: 1, carbsHeat: 1 },
  });
});

test('R3 band edges: WBGT when given, else feels-like', () => {
  assert.deepEqual(bandFor({ wbgtF: 80 }), { band: 'Hot', basis: 'WBGT' });
  assert.deepEqual(bandFor({ wbgtF: 79 }), { band: 'Moderate', basis: 'WBGT' });
  assert.deepEqual(bandFor({ wbgtF: 60 }), { band: 'Moderate', basis: 'WBGT' });
  assert.deepEqual(bandFor({ wbgtF: 59.9 }), { band: 'Cold', basis: 'WBGT' });
  assert.deepEqual(bandFor({ feelsLikeF: 85, wbgtF: null }), { band: 'Hot', basis: 'feels-like' });
  assert.deepEqual(bandFor({ feelsLikeF: 84, wbgtF: null }), { band: 'Moderate', basis: 'feels-like' });
  assert.deepEqual(bandFor({ feelsLikeF: 65, wbgtF: null }), { band: 'Moderate', basis: 'feels-like' });
  assert.deepEqual(bandFor({ feelsLikeF: 64, wbgtF: null }), { band: 'Cold', basis: 'feels-like' });
  // Humidity only through the WBGT: hot dry (feels 92, WBGT 79) is Moderate; hot humid (feels 103, WBGT 84) is Hot.
  assert.equal(bandFor({ feelsLikeF: 92, wbgtF: 79 }).band, 'Moderate');
  assert.equal(bandFor({ feelsLikeF: 103, wbgtF: 84 }).band, 'Hot');
});

test('R2 ride length: time and distance mode', () => {
  assert.equal(rideMinutes({ durationMin: 150 }), 150);
  assert.equal(rideMinutes({ distance: { miles: 100, mph: 18 } }), 333);   // 333.33 → 333
  assert.equal(rideMinutes({ distance: { miles: 1, mph: 20 } }), 5);       // 3 min → at least 5
  assert.equal(calc({ athlete: 'A', distance: { miles: 100, mph: 18 } }).durationMin, 333);
});

test('R4 targets for Test A (Moderate and Hot)', () => {
  const mod = calc({ athlete: 'A', durationMin: 150 });
  near(mod.perHour.sodiumMg, 1024 * 34 * 29.5735 / 1000);                  // 1029.63 mg/hr
  near(mod.perHour.sodiumMg, 1029.631);
  assert.equal(mod.perHour.fluidOz, 34);
  assert.equal(mod.perHour.carbsG, 85);
  near(mod.totals.sodiumMg, 1029.631 * 2.5);
  const hot = calc({ athlete: 'A', durationMin: 150, weather: { feelsLikeF: 103, wbgtF: 84 } });
  assert.equal(hot.perHour.fluidOz, 51);                                    // 34 × 1.5
  assert.equal(hot.perHour.carbsG, 85);                                     // heat carbs off by default
  assert.equal(calc({ athlete: 'A', durationMin: 150, weather: { wbgtF: 84 }, heatLowerCarbs: true }).perHour.carbsG, 72.25);  // 85 × 0.85
  assert.equal(calc({ athlete: 'A', durationMin: 150, weather: { wbgtF: 84 }, fluidOverrideOzHr: 40 }).perHour.fluidOz, 40);
  const cold = calc({ athlete: 'A', durationMin: 150, weather: { feelsLikeF: 40, wbgtF: null } });
  assert.equal(cold.perHour.fluidOz, 34);                                   // [J3] cold: × 1.0
  assert.equal(cold.strength.suggestPct, 8);
});

test('R5 strength limits', () => {
  assert.deepEqual(calc({ athlete: 'A', durationMin: 60 }).strength, { suggestPct: 6, limitPct: 8, bottleLimitPct: 8 });
  assert.deepEqual(calc({ athlete: 'A', durationMin: 60, strengthLimitPct: 7 }).strength, { suggestPct: 7, limitPct: 7, bottleLimitPct: 7 });
  assert.deepEqual(calc({ athlete: 'A', durationMin: 60, strengthLimitPct: 10 }).strength, { suggestPct: 8, limitPct: 8, bottleLimitPct: 8 });
  assert.equal(calc({ athlete: 'A', durationMin: 60, bike: 'tri', water: { n: 1 } }).strength.bottleLimitPct, 6);   // plain water → S
});

test('R6.4 minimum gels', () => {
  assert.equal(minGels(150, 1), 3);   // 2:30 → 2 + 1
  assert.equal(minGels(304, 1), 5);   // 5:04 → 5 + 0
  assert.equal(minGels(75, 1), 1);    // 1:15 → 1 + 0
  assert.equal(minGels(79, 1), 1);    // 1:19 → 19 min past the hour is under 20 → 1 + 0
  assert.equal(minGels(80, 1), 2);    // 1:20 → 1 + 1
  assert.equal(minGels(150, 1.5), 5); // ceil(3 × 1.5)
  assert.equal(minGels(19, 1), 0);
});

test('R7 gel times and fit', () => {
  assert.deepEqual(gelTimes(20, 150, 3), [20, 70, 120]);
  assert.deepEqual(gelWindow(20, 150), { firstMin: 20, latestMin: 120 });
  assert.equal(gelFit(20, 150), 21);                                        // every 5 min from 20 to 120
  assert.deepEqual(gelTimes(20, 300, 5), [20, 85, 145, 210, 270]);          // 82.5 → 85, 207.5 → 210
  assert.deepEqual(gelTimes(20, 60, 3), [20, 25, 30]);
  assert.equal(gelFit(20, 60), 3);
  assert.deepEqual(gelWindow(20, 15), { firstMin: 15, latestMin: 15 });     // shorter than the first-gel time
  assert.equal(gelFit(20, 15), 1);
  assert.deepEqual(gelTimes(20, 333, 6), [20, 75, 135, 190, 245, 300]);     // 303 → 305 > last → 300
});

test('R6 gel count: rounding rules, hold loop, gels off', () => {
  // g02 by hand: bottles at 6% carry 60.33 g/hr; gap 24.67 × 2.5 = 61.67 g.
  const base = { athlete: 'A', durationMin: 150, gels: { minPerHr: 0 } };
  assert.equal(calc({ ...base, gels: { minPerHr: 0, rounding: 'nearest' } }).gels.count, 2);   // 36.67, 11.67 < 12.5
  assert.equal(calc({ ...base, gels: { minPerHr: 0, rounding: 'up' } }).gels.count, 3);
  assert.equal(calc({ ...base, gels: { minPerHr: 0, rounding: 'down' } }).gels.count, 2);      // 25 > 11.67
  const g02 = calc({ athlete: 'A', durationMin: 150 });
  assert.equal(g02.gels.count, 3);                                          // minimum 3
  assert.equal(g02.bottlesCarbsG, 137.5);                                   // 212.5 − 75
  // Cold: S = 8 leaves 11.4 g, nearest takes none, then the hold at L = 8 (212.5 g in 2513.75 mL = 8.45%) adds one.
  assert.equal(calc({ athlete: 'A', durationMin: 150, weather: { feelsLikeF: 40 }, gels: { minPerHr: 0 } }).gels.count, 1);
  // Plain water (g18): mixed 22.8 oz/hr; rounding gives 4; 112.5 g in 57 oz = 6.67% > S = 6 → hold adds a 5th.
  const g18 = calc({ athlete: 'A', durationMin: 150, bike: 'road', water: { n: 1 } });
  near(g18.water.ozPerHr, 11.2);
  assert.equal(g18.gels.count, 5);
  assert.ok(concentrationPct(g18.bottlesCarbsG, 22.8 * 2.5) <= 6);
  // No gels (g21): bottles carry 60.3299 g/hr × 2.5, short 24.6701 g/hr.
  const g21 = calc({ athlete: 'A', durationMin: 150, gels: { on: false } });
  assert.equal(g21.gels.count, 0);
  near(g21.noGelsShortGPerHr, 85 - 6 * 34 * 29.5735 / 100);
  near(g21.bottlesCarbsG, 6 * 34 * 29.5735 / 100 * 2.5);
});

test('R8 caffeine aims, slots and cut-offs', () => {
  assert.deepEqual(caffeineAims(330, 20), [90, 240]);
  assert.deepEqual(caffeineAims(150, 20), [20]);                            // ≤ 2.5 h: the first gel slot
  assert.deepEqual(caffeineAims(240, 20), [90]);                            // 240 > 195
  assert.deepEqual(caffeineAims(600, 20), [90, 240, 390, 540]);             // 540 ≤ 555
  const times = [20, 75, 130, 190, 245, 300];
  const at = (startTime, maxMg) => caffeinePlan({ aims: [90, 240], times, startTime, noneAfter: '14:00', maxMg, doseMg: 75 });
  assert.deepEqual(at('08:00', 200).doses.map(d => d.slotMin), [75, 245]);
  const late = at('11:00', 200);                                            // 11:00 + 245 = 15:05 > 14:00
  assert.deepEqual([late.doses.map(d => d.slotMin), late.droppedLate, late.mg], [[75], 1, 75]);
  const cap = at('08:00', 100);                                             // 75 + 75 > 100
  assert.deepEqual([cap.doses.length, cap.droppedCap], [1, 1]);
  assert.equal(caffeinePlan({ aims: [90], times: [80, 100], startTime: '08:00', noneAfter: '14:00', maxMg: 200, doseMg: 75 }).doses[0].slotMin, 80);  // tie → earlier
  assert.equal(caffeinePlan({ aims: [90], times: [80, 100], startTime: '08:00', noneAfter: '09:20', maxMg: 200, doseMg: 75 }).droppedLate, 0);  // 09:20 is not after 09:20
  const g22 = calc({ athlete: 'A', durationMin: 330, bike: 'tri', caffeine: { mode: 'every' } });
  assert.deepEqual(g22.caffeine.doses, [{ aimMin: 90, slotMin: 75 }, { aimMin: 240, slotMin: 245 }]);
  assert.equal(g22.gels.carbsG, 4 * 25 + 2 * 22);
  assert.equal(g22.gelSodiumMg, 4 * 50 + 2 * 60);
  assert.equal(calc({ athlete: 'A', durationMin: 120, caffeine: { mode: 'long', longHrs: 3 } }).caffeine, null);
});

test('R9 sodium: blend split, gap and top-up counts', () => {
  // Blend: 200 g bottle carbs, mix 10 mg/g, partner 0 mg/g, budget 1350 mg → 135 g from the mix, 65 g from the partner.
  assert.deepEqual(blendSplit(200, 1350, 10, 0), { fromMix: 135, fromPartner: 65, sodiumMg: 1350 });
  assert.deepEqual(blendSplit(100, 1350, 10, 0), { fromMix: 100, fromPartner: 0, sodiumMg: 1000 });  // under budget: no split
  assert.deepEqual(blendSplit(100, -50, 10, 0), { fromMix: 0, fromPartner: 100, sodiumMg: 0 });      // clamped at 0
  // Capsules (g25): 1544.45 − 100 (2 gels) − 775 (77.5 g × 10) = 669.45 mg → round(3.11) = 3 capsules.
  assert.equal(topUpCount('capsule', 669.4465, 215), 3);
  const g25 = calc({ athlete: 'A', durationMin: 90, topUp: 'tA-cap' });
  near(g25.topUp.gapMg, 1029.631 * 1.5 - 100 - 775);
  assert.equal(g25.topUp.count, 3);
  // Half sticks (g32): 1049.08 / 500 = 2.098 → 2.
  assert.equal(topUpCount('half-units', 1049.0774, 500), 2);
  assert.equal(topUpCount('half-units', 1150, 500), 2.5);
  // Table salt: exact grams.
  near(topUpCount('grams', 52.8728, 393.4), 0.1344, 1e-4);
  assert.equal(topUpKind(product(A, 'tA-cap')), 'capsule');
  assert.equal(topUpKind(product(A, 'tA-stick')), 'half-units');
  assert.equal(topUpKind(product(A, 'tA-salt')), 'grams');
  assert.equal(calc({ athlete: 'A', durationMin: 60, topUp: 'none' }).topUp.reason, 'none chosen');
});

test('R10 / R1 / R11 powder, strength and scoops', () => {
  near(concentrationPct(36, 20), 36 / (20 * 29.5735) * 100);               // 6.0866%
  near(concentrationPct(36, 20), 6.0866);
  assert.equal(powderGrams(54, mixA), 60);                                  // 54 ÷ (36/40)
  assert.equal(bottleCarbs([{ grams: 60, product: mixA }, { grams: 2, product: product(A, 'tA-salt') }]), 54);  // salt adds no carbs
  assert.equal(scoopsCount(35, 20), 1.75);
  assert.equal(scoopsCount(35, 0), null);
  assert.equal(scoopsText(26, 20), '1¼ scoops');
  assert.equal(scoopsText(35, 20), '1¾ scoops');
  assert.equal(scoopsText(10, 20), '½ scoop');
  assert.equal(scoopsText(20, 20), '1 scoop');
  assert.equal(scoopsText(40, 20), '2 scoops');
  assert.equal(scoopsText(40, undefined), '');
});

test('R14 missing values: refuse on carbs, "unknown" on sodium', () => {
  const g27 = calc({ athlete: 'A', durationMin: 120, productPatches: [{ id: 'tA-gel', carbsG: null }] });
  assert.deepEqual(g27.refused, { reason: 'carbs unknown', products: ['Test Gel'] });
  const g28 = calc({ athlete: 'A', durationMin: 120, productPatches: [{ id: 'tA-mix', sodiumMg: null }] });
  assert.equal(g28.refused, null);
  assert.deepEqual(g28.unknown.sodium, ['Test Carb Drink Mix']);
  assert.equal(g28.mixSodiumMg, null);
  assert.deepEqual([g28.topUp.reason, g28.topUp.gapMg, g28.topUp.count], ['sodium unknown', null, null]);
  const noCapNa = calc({ athlete: 'A', durationMin: 120, productPatches: [{ id: 'tA-cap', sodiumMg: null }] });
  assert.equal(noCapNa.topUp.reason, 'product sodium unknown');
});

test('R12 cages and plain water', () => {
  assert.equal(calc({ athlete: 'A', durationMin: 60, bike: { id: 'one', name: 'One', cages: 1 }, water: { n: 2 } }).water.n, 0);
  assert.equal(calc({ athlete: 'A', durationMin: 60, bike: 'nope' }).cages, 2);   // no bike → 2 cages
  const g16 = calc({ athlete: 'A', durationMin: 180, bike: 'tri', water: { n: 2 } });
  near(g16.water.ozPerHr, 56 / 3);                                          // 2 × 28 oz over 3 h (< 2/3 of 102)
  near(g16.mixedFluidOzPerHr, 34 - 56 / 3);
  const capped = calc({ athlete: 'A', durationMin: 60, bike: 'tri', water: { n: 2 } });
  near(capped.water.ozPerHr, 2 / 3 * 34);                                   // 56 oz > 2/3 × 34 oz
});

test('build-golden --check passes', () => {
  const script = fileURLToPath(new URL('./build-golden.mjs', import.meta.url));
  const r = spawnSync(process.execPath, [script, '--check'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});
