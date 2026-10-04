// The reference calculator for the answer sheet (q34). Written from tests/reference/RULES.md only: it never imports, reads or copies the
// app's code. Pure functions, no I/O. Each line says which rule (R1 … R16) it implements.
//
// Readings chosen where RULES.md (or the task brief) leaves room. Each is marked "Reading:" below, next to the code it changes:
//  - R3: weather.fluidFactor is the factor actually applied, so it is null when a fluid override is typed (the override replaces it).
//  - R3: no WBGT and no feels-like number → Moderate on the feels-like basis (comparisons with a missing number are false).
//  - R6.2: a gel with 0 (or negative) carbs ends the rounding loop (it would never cover anything).
//  - R6.3/R6.2: comparisons are exact (no epsilon), as the rules are written.
//  - R6.4: the minimum is not capped by the R7 fit count ("at least").
//  - R6.5: the "No gels: N g/hr short" figure is for the S-held bottles of the plain plan / plain water; null with My bottles.
//  - R8: a dose dropped for the clock or the mg cap does not use its slot; the clock check comes before the cap check. With no gel slots
//    (gels off, or no gels in the plan) no dose can be placed. If the caffeinated gel has no caffeine value, doses are placed without
//    the mg cap and mg reads null.
//  - R8: rides of 150 min or less aim at the first gel time F, which the first gel slot always wins.
//  - R9: a top-up product whose sodium is missing gets count null ("left out", nothing sized). With 'none' chosen the gap is still given.
//    Reason order: 'none chosen' → 'sodium unknown' → 'product sodium unknown' → 'gap ≤ 25 mg'.
//  - R12: a water "refill" only counts when there is at least one plain water bottle (n > 0).
//  - R14: the products checked are those the brief lists (main gel and second gel whatever gels.on says, the caffeinated gel when the
//    caffeine mode is not 'off', the drink mix) plus the blend partner, which is a drink mix in the plan too. The same set feeds
//    unknown.carbs and unknown.sodium.
//  - R11: scoopsText uses the singular for 0 < scoops ≤ 1 and "0 scoops" for nothing.

import { product } from '../fixtures/load.mjs';   // plain product lookup by id (no I/O at call time)

// R1 · Units and constants
export const OZ_ML = 29.5735;          // R1: 1 fl oz in mL
export const SALT_MG_PER_G = 393.4;    // R1: table salt, mg sodium per g
export const HARD_MAX_PCT = 8;         // R1: "Never above 8%."

// R3 · The band table, as data (WBGT and feels-like edges in °F; strength %; fluid and heat-carbs factors).
export const BAND_TABLE = {
  wbgt: { hot: 80, cold: 60 },             // R3: Hot ≥ 80, Cold < 60 (WBGT)
  feelsLike: { hot: 85, cold: 65 },        // R3: Hot ≥ 85, Cold < 65 (feels-like, no forecast WBGT)
  Hot: { pct: 3, fluid: 1.5, carbsHeat: 0.85 },
  Moderate: { pct: 6, fluid: 1, carbsHeat: 1 },
  Cold: { pct: 8, fluid: 1, carbsHeat: 1 },  // R3 [J3]: cold reduces nothing (× 1.0)
};

const isNum = v => typeof v === 'number' && Number.isFinite(v);   // R14: a missing key, null, '' or non-number = missing
const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const r4 = x => Math.round(x * 1e4) / 1e4 + 0;                       // 4 decimals; "+ 0" turns -0 into 0

// Round every number in a plain object/array to 4 decimals; NaN/Infinity never leave this file (they become null).
function roundAll(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? r4(v) : null;
  if (Array.isArray(v)) return v.map(roundAll);
  if (isObj(v)) { const o = {}; for (const [k, x] of Object.entries(v)) o[k] = roundAll(x); return o; }
  return v;
}

// 'HH:MM' → minutes after midnight (null when not a time).
function clockMin(s) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s ?? ''));
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

// ---------------------------------------------------------------- R1, R10, R11 helpers

// R1: strength = carbs ÷ (fill oz × 29.5735) × 100, in % (g per 100 mL).
export function concentrationPct(carbsG, fillOz) {
  if (!isNum(carbsG) || !isNum(fillOz) || fillOz <= 0) return null;
  return carbsG / (fillOz * OZ_ML) * 100;
}

// R10: powder grams = bottle carbs ÷ (label carbs ÷ label serving grams).
export function powderGrams(carbsG, product) {
  if (!product || !isNum(carbsG) || !isNum(product.carbsG) || !isNum(product.servingG) || product.carbsG <= 0 || product.servingG <= 0) return null;
  return carbsG / (product.carbsG / product.servingG);
}

// R10/A4: bottle carbs = Σ (powder grams × that product's carbs per gram). Products without carbs per serving (table salt, electrolytes)
// add 0 carbs: powder grams are never carbs.
export function bottleCarbs(items) {
  let sum = 0;
  for (const { grams, product } of items || []) {
    if (!product || !isNum(grams) || !isNum(product.carbsG) || !isNum(product.servingG) || product.servingG <= 0) continue;
    sum += grams * (product.carbsG / product.servingG);
  }
  return sum;
}

// R11: scoops = powder grams ÷ grams per scoop, from the exact grams, to the nearest quarter (q34). No scoop size → null (grams only).
export function scoopsCount(grams, scoopG) {
  if (!isNum(grams) || !isNum(scoopG) || scoopG <= 0) return null;
  return Math.round(grams / scoopG * 4) / 4;
}

// R11 display: "1¾ scoops", "½ scoop", "2 scoops", "1 scoop"; '' when no scoop size is saved.
export function scoopsText(grams, scoopG) {
  const q = scoopsCount(grams, scoopG);
  if (q === null) return '';
  const whole = Math.floor(q);
  const frac = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾' }[q - whole];
  const num = (whole > 0 ? String(whole) : '') + frac || '0';
  return `${num} ${q > 0 && q <= 1 ? 'scoop' : 'scoops'}`;   // Reading: singular for 0 < q ≤ 1
}

// ---------------------------------------------------------------- R2, R3

// R2: time mode = the minutes typed; distance mode = max(5, round(miles ÷ mph × 60)).
export function rideMinutes(ride) {
  if (isNum(ride.durationMin)) return ride.durationMin;
  const d = ride.distance;
  if (isObj(d) && isNum(d.miles) && isNum(d.mph) && d.mph > 0) return Math.max(5, Math.round(d.miles / d.mph * 60));
  return null;
}

// R3: WBGT when the forecast gives one, else feels-like. Humidity counts only through the WBGT.
export function bandFor(weather) {
  const w = weather || {};
  if (isNum(w.wbgtF)) {
    const t = w.wbgtF;
    return { band: t >= BAND_TABLE.wbgt.hot ? 'Hot' : t < BAND_TABLE.wbgt.cold ? 'Cold' : 'Moderate', basis: 'WBGT' };
  }
  const t = w.feelsLikeF;  // Reading: not a number → both comparisons false → Moderate
  return { band: t >= BAND_TABLE.feelsLike.hot ? 'Hot' : t < BAND_TABLE.feelsLike.cold ? 'Cold' : 'Moderate', basis: 'feels-like' };
}

// ---------------------------------------------------------------- R6.4, R7

// R6.4: at least ceil((whole hours + 1 if the minutes past the last whole hour are 20 or more) × gels per hour).
// 2:30 → 3, 5:04 → 5, 1:15 → 1, 1:19 → 1, 1:20 → 2 (at 1/hr). The product is cleaned of float noise (0.7 × 10) before ceil.
export function minGels(durationMin, perHr) {
  if (!isNum(durationMin) || !isNum(perHr) || perHr <= 0) return 0;
  const whole = Math.floor(durationMin / 60);
  const past = durationMin - whole * 60;
  const x = (whole + (past >= 20 ? 1 : 0)) * perHr;
  return Math.ceil(Math.round(x * 1e9) / 1e9);
}

// R7: the window. First gel F = the first-gel time, or the ride's end if shorter; last = 30 min before the finish, not before F.
export function gelWindow(firstMin, durationMin) {
  const F = Math.min(isNum(firstMin) ? firstMin : 20, durationMin);  // R7: default 20 min
  const last = Math.max(F, durationMin - 30);                          // R7: no later than 30 min before the finish
  return { firstMin: F, latestMin: last };
}

// R7: times for n gels. Evenly spaced from F to last; each rounded to 5 min; pulled back to the last 5-min mark before `last` if over;
// each at least 5 min after the one before.
export function gelTimes(firstMin, durationMin, n) {
  const { firstMin: F, latestMin: last } = gelWindow(firstMin, durationMin);
  const times = [];
  for (let k = 0; k < n; k++) {
    const t = n > 1 ? F + k * (last - F) / (n - 1) : F;            // R7: evenly spaced
    let r = Math.round(t / 5) * 5;                                 // R7: rounded to 5 min
    if (r > last) r = Math.floor(last / 5) * 5;                    // R7: never after the latest time (when it can be helped)
    if (k > 0 && r <= times[k - 1]) r = times[k - 1] + 5;          // R7: at least 5 min after the previous gel
    times.push(r);
  }
  return times;
}

// R7: the most gels that fit = the largest n whose times all stay at or before the latest time.
export function gelFit(firstMin, durationMin) {
  const { firstMin: F, latestMin: last } = gelWindow(firstMin, durationMin);
  for (let n = Math.floor((last - F) / 5) + 2; n >= 1; n--) {
    if (gelTimes(firstMin, durationMin, n).every(t => t <= last)) return n;
  }
  return 1;
}

// ---------------------------------------------------------------- R8

// R8: the aims. ≤ 150 min: the first gel slot (aimed at F). Longer: first aim = min(90, max(F, minutes − 150)), then +150 while the
// aim is at least 45 min before the finish.
export function caffeineAims(durationMin, firstGelMin) {
  if (durationMin <= 150) return [firstGelMin];
  const aims = [];
  for (let a = Math.min(90, Math.max(firstGelMin, durationMin - 150)); a <= durationMin - 45; a += 150) aims.push(a);
  return aims;
}

// R8: place the aims on the gel slots `times` (R7 times of the final count). Each aim takes the nearest unused slot (earlier on a tie);
// a dose whose clock time (start + slot, wrapping at 24 h) is strictly after `noneAfter` is left out; a dose that would pass `maxMg`
// is left out. Returns { doses: [{aimMin, slotMin, slot (index)}], mg, droppedLate, droppedCap }.
export function caffeinePlan({ aims, times, startTime, noneAfter, maxMg, doseMg }) {
  const start = clockMin(startTime) ?? 0;
  const cutoff = clockMin(noneAfter);
  const used = new Set();
  const doses = [];
  let mg = 0, droppedLate = 0, droppedCap = 0;
  for (const aim of aims) {
    let best = -1;
    for (let i = 0; i < times.length; i++) {                       // R8: nearest slot not already used; times ascend, so strict <
      if (used.has(i)) continue;                                   //     keeps the earlier slot on a tie
      if (best < 0 || Math.abs(times[i] - aim) < Math.abs(times[best] - aim)) best = i;
    }
    if (best < 0) continue;                                        // Reading: no slot left → no dose (not counted as dropped)
    const clock = (start + times[best]) % 1440;                    // R8: clock time of the slot, wrapping at 24 h
    if (cutoff !== null && clock > cutoff) { droppedLate++; continue; }          // R8: after the "none after" time (strictly)
    if (isNum(doseMg) && isNum(maxMg) && mg + doseMg > maxMg) { droppedCap++; continue; }  // R8: per-ride mg limit
    used.add(best);
    doses.push({ aimMin: aim, slotMin: times[best], slot: best });
    if (isNum(doseMg)) mg += doseMg;
  }
  return { doses, mg: isNum(doseMg) ? mg : null, droppedLate, droppedCap };
}

// ---------------------------------------------------------------- R9

// R9 blend: carbs split between the mix (sA mg sodium per g carbs) and a lower-sodium partner (sB) so the bottle sodium stays within
// `budget` (= sodium target − gel sodium). Without a partner (sB null) or when not needed, the mix carries everything.
export function blendSplit(bottleCarbsG, budget, sA, sB) {
  let fromMix = bottleCarbsG;
  if (isNum(sB) && bottleCarbsG * sA > budget && sA > sB) {
    fromMix = Math.min(bottleCarbsG, Math.max(0, (budget - bottleCarbsG * sB) / (sA - sB)));   // R9: clamp to [0, bottle carbs]
  }
  const fromPartner = bottleCarbsG - fromMix;
  return { fromMix, fromPartner, sodiumMg: fromMix * sA + fromPartner * (isNum(sB) ? sB : 0) };
}

// R9: kind of top-up unit. unit 'g' → grams (table salt); swallowed → whole capsules; otherwise dissolved half units.
export function topUpKind(p) {
  if (!p) return 'none';
  if (p.unit === 'g') return 'grams';
  return p.swallow ? 'capsule' : 'half-units';
}

// R9: the ride's top-up count for a gap (mg) once the gap is > 25 mg.
export function topUpCount(kind, gapMg, unitMg) {
  if (kind === 'grams') return gapMg / unitMg;                     // R9: table salt, exact grams ([J8] shown to 0.1 g)
  if (kind === 'capsule') return Math.round(gapMg / unitMg);       // R9: whole capsules, round(gap ÷ mg per capsule)
  if (kind === 'half-units') return Math.round(gapMg / unitMg * 2) / 2;   // R9: half units, within ¼ unit of the exact amount
  return 0;
}

// ---------------------------------------------------------------- the whole ride

export function expected(athlete, ride) {
  // R2 · Ride length
  const durationMin = rideMinutes(ride);
  const hours = durationMin / 60;                                                  // R2: H = minutes ÷ 60

  // R3 · Weather band
  const { band, basis } = bandFor(ride.weather);
  const row = BAND_TABLE[band];
  const override = isNum(ride.fluidOverrideOzHr) ? ride.fluidOverrideOzHr : null;
  const fluidFactor = override === null ? row.fluid : null;                        // Reading: factor applied; none with an override
  const carbsFactor = band === 'Hot' && ride.heatLowerCarbs ? row.carbsHeat : 1;   // R3/R4: × 0.85 only Hot + "lower carbs in heat"

  // R4 · Targets
  const carbsPerHr = athlete.carbsGPerHr[ride.effort] * carbsFactor;               // R4: g/hr for the effort
  const fluidPerHr = override !== null ? override : athlete.sweatOzPerHr * row.fluid;   // R4: sweat × band factor, or the override
  const sodiumPerHr = athlete.sweatSodiumMgPerL * fluidPerHr * OZ_ML / 1000;       // R4: mg/L × litres per hour
  const fluidTotal = fluidPerHr * hours, carbsTotal = carbsPerHr * hours, sodiumTotal = sodiumPerHr * hours;   // R4: × H

  // R5 · Strength limits
  const typed = isNum(ride.strengthLimitPct) ? ride.strengthLimitPct : null;
  const S = Math.min(HARD_MAX_PCT, typed !== null ? typed : row.pct);              // R5: suggested S
  const L = Math.min(HARD_MAX_PCT, typed !== null ? typed : HARD_MAX_PCT);         // R5: hard limit L (8% when none typed)

  // R12 · Cages and plain water
  const bike = (athlete.bikes || []).find(b => b.id === ride.bikeId);
  const cages = bike && isNum(bike.cages) ? bike.cages : 2;                        // R12: no bike → 2 cages
  const maxStartBottles = cages;                                                   // R12/A6: never more than the cages at the start
  const askedWater = isNum(ride.water?.n) ? ride.water.n : 0;
  const nWater = Math.max(0, Math.min(askedWater, cages - 1));                     // R12: never the last cage
  const refill = nWater > 0 && !!ride.water?.refill;                               // Reading: refill only counts with a water bottle
  const waterOzPerHr = refill ? null
    : nWater === 0 ? 0
      : Math.min(nWater * athlete.planBottleOz, 2 / 3 * fluidTotal) / hours;       // R12: n × size ÷ H, ≤ 2/3 of the fluid
  const mixedOzPerHr = waterOzPerHr === null ? null : fluidPerHr - waterOzPerHr;   // R12: the mixed bottles carry the rest
  const myBottles = isObj(ride.myBottles);
  const bottleLimitPct = nWater > 0 || myBottles ? S : L;                          // R5/R6.3: S with water or My bottles, else L

  // R14 · Missing label values
  const g = ride.gels || {};
  const caf = ride.caffeine || {};
  const cafModeOn = !!caf.mode && caf.mode !== 'off';
  const gelA = product(athlete, g.gel);
  const gelB = g.second ? product(athlete, g.second) : null;
  const gelC = cafModeOn && caf.gel ? product(athlete, caf.gel) : null;
  const mix = product(athlete, ride.drinkMix);
  const partner = ride.blendPartner ? product(athlete, ride.blendPartner) : null;
  const checked = [];                                                              // Reading: see the header (R14)
  for (const p of [gelA, gelB, gelC, mix, partner]) if (p && !checked.includes(p)) checked.push(p);
  const unknown = {
    carbs: checked.filter(p => !isNum(p.carbsG)).map(p => p.name),                // R14: no carbs value
    sodium: checked.filter(p => !isNum(p.sodiumMg)).map(p => p.name),             // R14: no sodium value
  };
  const refused = unknown.carbs.length ? { reason: 'carbs unknown', products: unknown.carbs } : null;   // R14: plan refused

  // R7 · Gel window and fit (independent of the products)
  const gelsAllowed = g.on !== false;                                              // R6.5: "No gels" → gels.on false
  const win = gelWindow(g.firstMin, durationMin);
  const fitCount = gelFit(g.firstMin, durationMin);                                // R7: the most gels that fit
  const minCount = gelsAllowed ? minGels(durationMin, isNum(g.minPerHr) ? g.minPerHr : 1) : 0;   // R6.4

  // R8 · Is caffeine on for this ride? ("Long rides only" = rides of at least the set hours)
  const cafActive = cafModeOn && !(caf.mode === 'long' && durationMin < (isNum(caf.longHrs) ? caf.longHrs : 0) * 60);

  // The plan proper needs: no refusal, no My bottles, and a known mixed fluid (no water refill).
  const planned = !refused && !myBottles && mixedOzPerHr !== null;

  let count = null, timesMin = null, gelCarbsG = null, bottlesCarbsG = null, noGelsShortGPerHr = null;
  let gelList = null, cafOut = null;

  if (planned) {
    const mixedMlRide = mixedOzPerHr * hours * OZ_ML;                              // R1: the mixed fluid of the whole ride, mL
    const bottleAtS = S * mixedOzPerHr * OZ_ML / 100;                              // R6.1: g/hr the bottles carry at S
    if (gelsAllowed) {
      const seq = k => (gelB && k % 2 === 1 ? gelB : gelA);                       // R6.2: A, B, A, B … (B = second gel when set)
      const seqCarbs = n => { let s = 0; for (let k = 0; k < n; k++) s += seq(k).carbsG; return s; };
      // R6.1: the gap to cover with gels
      let toCover = Math.max(0, carbsPerHr - bottleAtS) * hours;
      // R6.2: rounding loop
      const rounding = g.rounding || 'nearest';
      count = 0;
      for (;;) {
        const c = seq(count).carbsG;
        if (!(c > 0)) break;                                                       // Reading: a 0-carb gel never covers anything
        const take = rounding === 'up' ? toCover > 0                               // R6.2 up: while anything is left
          : rounding === 'down' ? c <= toCover                                     // R6.2 down: only while all its carbs fit
            : c / 2 <= toCover;                                                    // R6.2 nearest: while half its carbs ≤ what is left
        if (!take) break;
        toCover -= c;
        count++;
      }
      // R6.3: hold loop — while the bottles would be over the limit and R7 has room, one more gel
      const strength = n => Math.max(0, carbsTotal - seqCarbs(n)) / mixedMlRide * 100;   // R1: % over the whole ride's mixed fluid
      while (count < fitCount && strength(count) > bottleLimitPct) count++;
      // R6.4: minimum gels
      count = Math.max(count, minCount);
      // R7: times of the final count
      timesMin = gelTimes(g.firstMin, durationMin, count);
      // R8: caffeine swaps on the R7 slots
      gelList = Array.from({ length: count }, (_, k) => seq(k));
      if (cafActive) {
        const aims = caffeineAims(durationMin, win.firstMin);
        const doseMg = gelC && isNum(gelC.caffeineMg) ? gelC.caffeineMg : null;
        const plan = gelC ? caffeinePlan({ aims, times: timesMin, startTime: ride.startTime, noneAfter: caf.noneAfter, maxMg: caf.maxMg, doseMg })
          : { doses: [], mg: 0, droppedLate: 0, droppedCap: 0 };                   // no caffeinated gel chosen → nothing to swap in
        for (const d of plan.doses) gelList[d.slot] = gelC;                        // R8: the caffeinated gel replaces that slot's gel
        cafOut = cafBlock(aims, plan, doseMg, caf);
      }
      gelCarbsG = gelList.reduce((s, p) => s + p.carbsG, 0);
      bottlesCarbsG = Math.max(0, carbsTotal - gelCarbsG);                         // R6.6: the bottles carry the rest, never below 0
    } else {
      // R6.5: no gels at all; the bottles carry at most what S allows; the plan shows the shortfall
      count = 0;
      timesMin = [];
      gelList = [];
      gelCarbsG = 0;
      bottlesCarbsG = Math.min(carbsTotal, bottleAtS * hours);
      noGelsShortGPerHr = Math.max(0, carbsPerHr - bottleAtS);
      if (cafActive) {                                                             // Reading: no gel slots → no doses
        const aims = caffeineAims(durationMin, win.firstMin);
        const doseMg = gelC && isNum(gelC.caffeineMg) ? gelC.caffeineMg : null;
        cafOut = cafBlock(aims, caffeinePlan({ aims, times: [], startTime: ride.startTime, noneAfter: caf.noneAfter, maxMg: caf.maxMg, doseMg }), doseMg, caf);
      }
    }
  } else if (!refused && cafActive) {
    // My bottles or water refill: R6 count is not given here, so the aims are known but the slots are not.
    const doseMg = gelC && isNum(gelC.caffeineMg) ? gelC.caffeineMg : null;
    cafOut = { aimsMin: caffeineAims(durationMin, win.firstMin), doses: null, count: null, mg: null, doseMg,
      maxMg: isNum(caf.maxMg) ? caf.maxMg : null, noneAfter: caf.noneAfter ?? null, droppedLate: null, droppedCap: null };
  }

  // R9 · Sodium
  let gelSodiumMg = null, mixSodiumMg = null, gapMg = null;
  if (planned) {
    if (gelList.every(p => isNum(p.sodiumMg))) gelSodiumMg = gelList.reduce((s, p) => s + p.sodiumMg, 0);   // R9: sodium from the gels
    const sA = mix && isNum(mix.sodiumMg) && isNum(mix.carbsG) && mix.carbsG > 0 ? mix.sodiumMg / mix.carbsG : null;   // mg per g carbs
    const sB = partner ? (isNum(partner.sodiumMg) && isNum(partner.carbsG) && partner.carbsG > 0 ? partner.sodiumMg / partner.carbsG : null) : null;
    if (bottlesCarbsG === 0) mixSodiumMg = 0;                                      // no powder, no powder sodium
    else if (sA !== null && !partner) mixSodiumMg = bottlesCarbsG * sA;            // R9: powder grams × sodium per g = carbs × sA
    else if (sA !== null && sB !== null && gelSodiumMg !== null) {
      mixSodiumMg = blendSplit(bottlesCarbsG, sodiumTotal - gelSodiumMg, sA, sB).sodiumMg;   // R9: blend with the partner
    }
    if (gelSodiumMg !== null && mixSodiumMg !== null) gapMg = sodiumTotal - gelSodiumMg - mixSodiumMg;   // R9: gap
  }

  // R9 / R14 · Top-up
  let topUp = null;
  if (!refused) {
    const tp = ride.topUp && ride.topUp !== 'none' ? product(athlete, ride.topUp) : null;
    const kind = topUpKind(tp);
    const unitMg = tp && isNum(tp.sodiumMg) ? tp.sodiumMg : null;
    const sodiumKnown = unknown.sodium.length === 0;
    let reason = null, n = null, gap = sodiumKnown ? gapMg : null;                 // R14: no sizing from a guess
    if (kind === 'none') { reason = 'none chosen'; n = 0; }
    else if (!sodiumKnown) reason = 'sodium unknown';                              // R14: sodium totals read "unknown"
    else if (unitMg === null) reason = 'product sodium unknown';                   // R14: top-up left out
    else if (gap === null) n = null;                                               // not computable here (My bottles / refill)
    else if (gap <= 25) { reason = 'gap ≤ 25 mg'; n = 0; }                         // R9: only when the gap is more than 25 mg
    else n = topUpCount(kind, gap, unitMg);                                        // R9: grams / capsules / half units
    topUp = { productId: ride.topUp ?? 'none', kind, reason, unitMg, gapMg: gap, count: n };
  }

  return roundAll({
    refused,
    durationMin,
    hours,
    weather: { band, basis, fluidFactor, carbsFactor },
    strength: { suggestPct: S, limitPct: L, bottleLimitPct },
    perHour: { fluidOz: fluidPerHr, carbsG: carbsPerHr, sodiumMg: sodiumPerHr },
    totals: { fluidOz: fluidTotal, carbsG: carbsTotal, sodiumMg: sodiumTotal },
    cages,
    maxStartBottles,
    water: { n: nWater, refill, ozPerHr: waterOzPerHr },
    mixedFluidOzPerHr: mixedOzPerHr,
    gels: { allowed: gelsAllowed, count, minCount, firstMin: win.firstMin, latestMin: win.latestMin, fitCount, timesMin, carbsG: gelCarbsG },
    bottlesCarbsG,
    noGelsShortGPerHr,
    caffeine: cafOut,
    topUp,
    mixSodiumMg,
    gelSodiumMg,
    unknown,
  });
}

// R8 output block.
function cafBlock(aims, plan, doseMg, caf) {
  return {
    aimsMin: aims,
    doses: plan.doses.map(d => ({ aimMin: d.aimMin, slotMin: d.slotMin })),
    count: plan.doses.length,
    mg: plan.mg,
    doseMg,
    maxMg: isNum(caf.maxMg) ? caf.maxMg : null,
    noneAfter: caf.noneAfter ?? null,
    droppedLate: plan.droppedLate,
    droppedCap: plan.droppedCap,
  };
}

