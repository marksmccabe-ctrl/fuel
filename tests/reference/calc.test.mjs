// Unit tests for the reference calculator, on numbers worked by hand from tests/reference/RULES.md.
// Run: node --test tests/reference/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadAthletes, athleteFor, fullRide, product } from '../fixtures/load.mjs';
import {
  BAND_TABLE, OZ_ML, SALT_MG_PER_G, HARD_MAX_PCT, expected, bandFor, rideMinutes, minGels, gelTimes, gelFit, gelWindow,
  caffeineAims, caffeinePlan, dayHours, dayWindow, freeMarks, dayRooms, caffeineTimes, startCounts, dayAllocate, hourMinutes, blendSplit, gridFluid, gridFromSingle, sweatBox, SWEAT_LEVELS, capsOf, CONC_CEIL, r19Hours, r19Bottles, mixedHours, topUpKind, topUpCount, scoopsCount, scoopsText, concentrationPct, powderGrams, bottleCarbs,
} from './calc.js';

const athletes = loadAthletes();
// The hand-worked numbers below (R5 on) were done on a fluid of the sweat rate itself. Since item 39 the grid blends with the Hot box
// above 62 °F, so these cases plan on a flat grid (every box the athlete's own sweat rate) unless a case gives its own grid (sweatGrid).
const flat = oz => ({ level: 'normal', own: Object.fromEntries(['cold', 'mild', 'hot'].flatMap(b => ['recovery', 'z2', 'hard'].map(e => [`${b}.${e}`, oz]))) });
const calcRaw = input => expected(athleteFor(athletes, input), fullRide(athletes, input));
const calc = input => input.sweatGrid || input.rawSweat ? calcRaw(input) : calcRaw(Object.assign({}, input, { sweatGrid: flat(athletes[input.athlete].sweatOzPerHr) }));
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
  // item 39, Test A's single 34 oz/hr migrated: Heavy (32) with Moderate · Steady 34; at 65 °F (no weather) the Moderate box (item 56)
  const mig = calcRaw({ athlete: 'A', durationMin: 150 });
  near(mig.perHour.fluidOz, 34);
  near(mig.perHour.sodiumMg, 1024 * 34 * 29.5735 / 1000);                   // sodium follows the fluid
  assert.deepEqual(mig.sweat, { band: 'mild', own: true });
  near(calcRaw({ athlete: 'A', durationMin: 150, effort: 'recovery' }).perHour.fluidOz, 32);                         // Moderate · Recovery: auto
  near(calcRaw({ athlete: 'A', durationMin: 150, weather: { feelsLikeF: 103, wbgtF: 84 } }).perHour.fluidOz, 48);   // auto Hot = 32 × 1.5
  near(calcRaw({ athlete: 'A', durationMin: 150, weather: { feelsLikeF: 40, wbgtF: null } }).perHour.fluidOz, 32);  // auto Cold = the level
  // the flat grid (every box 34): the old hand numbers
  const mod = calc({ athlete: 'A', durationMin: 150 });
  near(mod.perHour.sodiumMg, 1024 * 34 * 29.5735 / 1000);                  // 1029.63 mg/hr
  near(mod.perHour.sodiumMg, 1029.631);
  assert.equal(mod.perHour.fluidOz, 34);
  assert.equal(mod.perHour.carbsG, 85);
  near(mod.totals.sodiumMg, 1029.631 * 2.5);
  const hot = calc({ athlete: 'A', durationMin: 150, weather: { feelsLikeF: 103, wbgtF: 84 } });
  assert.equal(hot.perHour.fluidOz, 34);                                    // item 39: an own Hot box never gets the +50%
  assert.equal(hot.perHour.carbsG, 85);                                     // heat carbs off by default
  assert.equal(calc({ athlete: 'A', durationMin: 150, weather: { wbgtF: 84 }, heatLowerCarbs: true }).perHour.carbsG, 72.25);  // 85 × 0.85
  assert.equal(calc({ athlete: 'A', durationMin: 150, weather: { wbgtF: 84 }, fluidOverrideOzHr: 40 }).perHour.fluidOz, 40);
  const cold = calc({ athlete: 'A', durationMin: 150, weather: { feelsLikeF: 40, wbgtF: null } });
  assert.equal(cold.perHour.fluidOz, 34);                                   // [J3] cold: × 1.0
  assert.equal(cold.strength.suggestPct, 8);
});

test('R4a sweat grid (item 39; item 56 by band): levels, own boxes, migration', () => {
  for (const [lv, v] of Object.entries(SWEAT_LEVELS)) {                     // each level fills the auto boxes: Cold = Mild = level, Hot × 1.5
    const g = { level: lv, own: {} };
    for (const e of ['recovery', 'z2', 'hard']) { assert.equal(sweatBox(g, 'cold', e).oz, v); assert.equal(sweatBox(g, 'mild', e).oz, v); assert.equal(sweatBox(g, 'hot', e).oz, v * 1.5); }
  }
  const g = { level: 'normal', own: { 'hot.z2': 34 } };
  assert.deepEqual(sweatBox({ level: 'heavy', own: g.own }, 'hot', 'z2'), { oz: 34, own: true });     // an own box survives a level change
  near(gridFluid(g, 'steady', 'Cold'), 24); near(gridFluid(g, 'steady', 'Moderate'), 24);   // item 56: one box per band, no blending
  near(gridFluid(g, 'steady', 'Hot'), 34);                                  // own Hot: no +50%
  near(gridFluid(g, 'hard', 'Hot'), 36);                                    // auto Hot: 24 × 1.5
  const g2 = { level: 'normal', own: { 'cold.z2': 20, 'mild.z2': 27.1 } };  // item 56's golden rider
  near(gridFluid(g2, 'steady', 'Cold'), 20); near(gridFluid(g2, 'steady', 'Moderate'), 27.1); near(gridFluid(g2, 'hard', 'Moderate'), 24);
  assert.deepEqual(gridFromSingle(24), { level: 'normal', own: {} });
  assert.deepEqual(gridFromSingle(34), { level: 'heavy', own: { 'mild.z2': 34 } });
  assert.deepEqual(gridFromSingle(19), { level: 'light', own: { 'mild.z2': 19 } });
  assert.deepEqual(gridFromSingle(20), { level: 'normal', own: { 'mild.z2': 20 } });  // a tie goes to Normal
});

test('R5 strength limits', () => {
  assert.deepEqual(calc({ athlete: 'A', durationMin: 60 }).strength, { suggestPct: 6, limitPct: 8, bottleLimitPct: 8, caps: { Cold: 8, Moderate: 6, Hot: 3 } });
  assert.deepEqual(calc({ athlete: 'A', durationMin: 60, strengthLimitPct: 7 }).strength, { suggestPct: 7, limitPct: 7, bottleLimitPct: 7, caps: { Cold: 8, Moderate: 6, Hot: 3 } });
  assert.deepEqual(calc({ athlete: 'A', durationMin: 60, strengthLimitPct: 10 }).strength.limitPct, 10);       // item 56: up to 12
  assert.deepEqual(calc({ athlete: 'A', durationMin: 60, strengthLimitPct: 14 }).strength.limitPct, CONC_CEIL);
  assert.deepEqual(capsOf({ caps: { cold: 14, mod: 9, hot: 7 } }), { Cold: 12, Moderate: 8, Hot: 6 });           // Settings: Cold ≤ 12, Moderate ≤ 8, Hot ≤ 6
  assert.equal(calc({ athlete: 'A', durationMin: 60, weather: { feelsLikeF: 40 }, caps: { cold: 12 } }).strength.suggestPct, 12);
  assert.equal(calc({ athlete: 'A', durationMin: 60, weather: { feelsLikeF: 40 }, caps: { cold: 12 } }).strength.limitPct, 12);
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
  // item 52: R18.3 replaced the slots. g22: auto from = 90, to = 270, 2 doses at 90 + 45 → 120 and 90 + 135 → 210 (halves round down on the
  // 30-min grid); 6 gels by the hours with the caffeine doses among them
  const g22 = calc({ athlete: 'A', durationMin: 330, bike: 'tri', caffeine: { mode: 'every' } });
  assert.deepEqual(g22.caffeine.timesMin, [120, 210]);
  assert.equal(g22.gels.count, 6);
  assert.equal(g22.gels.carbsG, 4 * 25 + 2 * 22);
  assert.equal(g22.gelSodiumMg, 4 * 50 + 2 * 60);
  assert.equal(calc({ athlete: 'A', durationMin: 120, caffeine: { mode: 'long', longHrs: 3 } }).caffeine, null);
});

test('R18 the ride-day plan: hours, windows, rooms, caffeine times, gels per hour, minutes', () => {
  const H = dayHours(330);
  assert.equal(H.length, 6); assert.equal(H[5].frac, 0.5);
  assert.deepEqual(dayWindow(H[0], 20, 330), { lo: 20, hi: 50, end: false });  // the first gel at 20, 10 min before the hour
  assert.deepEqual(dayWindow(H[1], 20, 330), { lo: 65, hi: 110, end: false }); // 5 min into the hour
  assert.deepEqual(dayWindow(H[4], 20, 330), { lo: 245, hi: 285, end: false }); // item 57: 15 min before 5:00, the last mark
  assert.deepEqual(dayWindow(H[5], 20, 330), { lo: 300, hi: 300, end: true });  // item 57: the last ½ takes a gel at 5:00, 30 min before the finish
  { const H6 = dayHours(320); assert.deepEqual(dayWindow(H6[4], 20, 320), { lo: 245, hi: 290, end: true }); const w = dayWindow(H6[5], 20, 320); assert.ok(w.hi < w.lo); } // a 5:20 ride: 4:50, then none
  assert.deepEqual(freeMarks({ lo: 20, hi: 50 }, []), [20, 35, 50]);
  assert.deepEqual(freeMarks({ lo: 20, hi: 50 }, [30]), [45]);                 // 15 min from the caffeine gel
  assert.deepEqual(dayRooms(H, 20, 330, [150, 240]).rooms, [3, 4, 3, 3, 4, 1]);   // 4:00's hour: caffeine + 4:15, 4:30, 4:45; 3:50 is 10 min from it; item 57: the last ½ takes 5:00
  const C = o => caffeineTimes(Object.assign({ D: 330, firstMin: 20, startTime: '07:00', noneAfter: '14:00', maxMg: 200, doseMg: 100 }, o));
  assert.deepEqual(C({ fromMin: 120 }).times, [150, 240]);                    // the PDF's ride: from 2:00 → 2:30 and 4:00
  assert.deepEqual(C({}).times, [120, 210]);                                  // Auto: from 1:30
  const late = C({ fromMin: 120, startTime: '11:00' });                        // 11:00 + 4:00 = 15:00, after 14:00
  assert.deepEqual([late.times, late.dropped], [[150], [{ t: 240, why: 'late' }]]);
  const cap = caffeineTimes({ D: 600, firstMin: 20, startTime: '07:00', noneAfter: '23:00', maxMg: 100, doseMg: 75 });
  assert.deepEqual([cap.asked, cap.times, cap.dropped.length], [4, [300], 3]);  // one 75 mg dose under 100 mg: (90 + 540) / 2 = 315 → 300
  const none = caffeineTimes({ D: 100, firstMin: 20, fromMin: 90, maxMg: 200, doseMg: 75 });
  assert.deepEqual([none.times, none.dropped], [[], [{ why: 'window' }]]);      // to = 40 < from
  assert.deepEqual(startCounts([1, 1, 1], [1, 1, 1], 4, [3, 3, 3], [0, 0, 0]), [1, 2, 1]);   // round(4/3) = 1, round(8/3) = 3, 4
  assert.deepEqual(startCounts([1, 1, 1], [1, 1, 1], 4, [3, 3, 3], [0, 0, 2]), [1, 1, 2]);   // the caffeine hour takes one from hour 2
  assert.deepEqual(startCounts([0, 0], [1, 0.5], 3, [1, 3], [0, 0]), [1, 2]);              // no gap: by the fractions; room 1 passes one on
  // one 1 L bottle over 2 hours at 6% (60 g most), 60 g/hr, 30 g gels: one gel an hour, the bottle carries 60 g
  const one = dayAllocate({ hours: dayHours(120), rooms: [3, 3], cafN: [0, 0], cafCarbs: 0, gelA: { carbsG: 30 }, gelB: null, T: 60, S: 6, L: 8,
    bottles: [{ start: 0, end: 120, ml: 1000 }], minN: 0 });
  assert.deepEqual([one.plain, one.carbs.map(x => Math.round(x)), one.short], [[1, 1], [60], 0]);
  assert.deepEqual(hourMinutes({ lo: 20, hi: 50 }, 2, [], []).map(x => x.t), [30, 45]);   // 27.5 → 30, 42.5 → 45
  assert.deepEqual(hourMinutes({ lo: 125, hi: 170 }, 1, [150], [150]).map(x => [x.t, x.caf]), [[135, false], [150, true]]);  // round 147.5 → 150 is taken: 15 min off
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
