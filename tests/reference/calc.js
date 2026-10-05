// The reference calculator for the answer sheet (q34). Written from tests/reference/RULES.md only: it never imports, reads or copies the
// app's code. Pure functions, no I/O. Each line says which rule (R1 … R16) it implements.
//
// Readings chosen where RULES.md (or the task brief) leaves room. Each is marked "Reading:" below, next to the code it changes:
//  - R3: weather.fluidFactor is null: since item 39 the sweat grid (R4a) sets the fluid, not the band table.
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

// R4a (item 39) · The sweat grid: levels, the auto rule and the band centres used to blend.
export const SWEAT_LEVELS = { light: 16, normal: 24, heavy: 32 };                 // R4a: the starting levels, oz/hr
export const SWEAT_HOT = 1.5;                                                       // R4a: auto Hot boxes = level × 1.5; Cold and Mild = level
export const SWEAT_CENTRES = { cold: 40, mild: 62, hot: 85 };                      // R4a: °F; below 40 Cold, above 85 Hot
const SWEAT_EFFORT = { recovery: 'recovery', steady: 'z2', hard: 'hard' };

// R4a: a single sweat rate (an athlete without a grid) → the closest level, with Mild · Steady set to the number when it differs
export function gridFromSingle(oz) {
  let level = 'normal';
  for (const k of Object.keys(SWEAT_LEVELS)) if (Math.abs(SWEAT_LEVELS[k] - oz) < Math.abs(SWEAT_LEVELS[level] - oz) - 1e-9) level = k;
  return { level, own: Math.abs(SWEAT_LEVELS[level] - oz) > 0.05 ? { 'mild.z2': Math.round(oz * 10) / 10 } : {} };
}

// R4a: one box: the athlete's own number (as typed, no heat increase) or auto from the level
export function sweatBox(grid, band, effKey) {
  const auto = SWEAT_LEVELS[grid.level] * (band === 'hot' ? SWEAT_HOT : 1);
  const own = grid.own && grid.own[`${band}.${effKey}`];
  return isNum(own) && own > 0 ? { oz: own, own: true } : { oz: auto, own: false };
}

// R4a: the ride's fluid from the grid at temperature t: linear between the neighbouring band centres
export function gridFluid(grid, effort, t) {
  const e = SWEAT_EFFORT[effort] || 'z2', C = SWEAT_CENTRES, box = b => sweatBox(grid, b, e).oz;
  if (t <= C.cold) return box('cold');
  if (t >= C.hot) return box('hot');
  if (t < C.mild) { const w = (t - C.cold) / (C.mild - C.cold); return box('cold') * (1 - w) + box('mild') * w; }
  const w = (t - C.mild) / (C.hot - C.mild); return box('mild') * (1 - w) + box('hot') * w;
}
// R4a: the row the ride's temperature sits in (for the label): Cold under 50, Mild 50–75, Hot over 75
export function sweatBandOf(t) { return t < 50 ? 'cold' : t <= 75 ? 'mild' : 'hot'; }

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
// each at least 5 min after the one before (R7b, item 49: 15 min on a ride planned hour by hour).
export function gelTimes(firstMin, durationMin, n, gap = 5) {
  const { firstMin: F, latestMin: last } = gelWindow(firstMin, durationMin);
  const times = [];
  for (let k = 0; k < n; k++) {
    const t = n > 1 ? F + k * (last - F) / (n - 1) : F;            // R7: evenly spaced
    let r = Math.round(t / 5) * 5;                                 // R7: rounded to 5 min
    if (r > last) r = Math.floor(last / 5) * 5;                    // R7: never after the latest time (when it can be helped)
    if (k > 0 && r < times[k - 1] + gap) r = times[k - 1] + gap;   // R7: at least 5 min (R7b: 15) after the previous gel
    times.push(r);
  }
  return times;
}

// R7: the most gels that fit = the largest n whose times all stay at or before the latest time (R7b: 15 min apart).
export function gelFit(firstMin, durationMin, gap = 5) {
  const { firstMin: F, latestMin: last } = gelWindow(firstMin, durationMin);
  for (let n = Math.floor((last - F) / gap) + 2; n >= 1; n--) {
    if (gelTimes(firstMin, durationMin, n, gap).every(t => t <= last)) return n;
  }
  return 1;
}

// ---------------------------------------------------------------- R4b, R7b (item 49: hour by hour)

// R4b: the hours of a ride planned hour by hour, or null (R4: one temperature). weather.hourly = {startF, endF, hoursF: [one per ride hour]}
export function rideHours(athlete, ride, durationMin, grid, fMin, fMax) {
  const Hh = (ride.weather || {}).hourly;
  if (!Hh || !Array.isArray(Hh.hoursF) || isNum(ride.fluidOverrideOzHr)) return null;          // R4b: a typed override → one fluid
  const n = Math.ceil(durationMin / 60 - 1e-9);
  if (n < 2 || Hh.hoursF.length !== n || !Hh.hoursF.every(isNum)) return null;                // R4b: every ride hour, at least 2
  const startF = isNum(Hh.startF) ? Hh.startF : Hh.hoursF[0], endF = isNum(Hh.endF) ? Hh.endF : Hh.hoursF[n - 1];
  const all = [startF, endF, ...Hh.hoursF], spread = Math.max(...all) - Math.min(...all);
  if (spread < 8 - 1e-9) return null;                                                           // R4b: under 8 °F, one temperature
  const hours = Hh.hoursF.map((t, k) => {
    const frac = k < n - 1 ? 1 : (durationMin - 60 * k) / 60;                                   // R4b: the last hour pro-rated
    const want = gridFluid(grid, ride.effort, t);                                               // R4b: the grid at the hour's feels-like
    let oz = want, limit = null;
    if (fMin !== null && oz < fMin) { oz = fMin; limit = 'floor'; }                             // R4b: the limits, each hour on its own
    if (fMax !== null && oz > fMax) { oz = fMax; limit = 'ceiling'; }
    return { frac, tempF: t, want, fluidOz: oz, limit, sodiumMg: athlete.sweatSodiumMgPerL * oz * OZ_ML / 1000 };   // R4b: sodium follows
  });
  return { startF, endF, spread, hours };
}

// R7b: gel times on a ride planned hour by hour. gaps[k] = hour k's R6b gap (g). Every hour the same per hour (within 1%) → R7 at 15 min.
export function hourGelTimes(firstMin, durationMin, n, hours, gaps) {
  const T = gaps.reduce((a, x) => a + x, 0), per = gaps.map((x, k) => x / hours[k].frac);
  if (n <= 0) return [];
  if (!(T > 1e-9) || per.every(x => Math.abs(x - per[0]) <= 0.01 * Math.max(1, per[0]))) return gelTimes(firstMin, durationMin, n, 15);
  // gels per hour, a running total: by the end of hour k, round(n × gaps so far ÷ all gaps); all n by the last hour
  let acc = 0, prev = 0;
  const count = gaps.map((x, k) => { acc += x; const by = k === gaps.length - 1 ? n : Math.min(n, Math.round(n * acc / T + 1e-9)); const c = Math.max(0, by - prev); prev = Math.max(prev, by); return c; });
  // inside each hour, evenly: start + (j + ½) × minutes ÷ count, to 5 min
  const t = []; let a0 = 0;
  hours.forEach((h, k) => { const len = h.frac * 60; for (let j = 0; j < count[k]; j++) t.push(Math.round((a0 + (j + 0.5) * len / count[k]) / 5) * 5); a0 += len; });
  // the window: first-gel time to the nearest 5 min, the last 5-min mark at or before 30 min from the finish, 15 min apart (forward, then back)
  const { firstMin: F, latestMin: last } = gelWindow(firstMin, durationMin), lo = Math.round(F / 5) * 5, hi = Math.max(lo, Math.floor(last / 5) * 5);
  for (let j = 0; j < t.length; j++) t[j] = Math.max(t[j], lo, j ? t[j - 1] + 15 : lo);
  for (let j = t.length - 1; j >= 0; j--) t[j] = Math.min(t[j], j < t.length - 1 ? t[j + 1] - 15 : hi);
  return t.map(x => Math.max(0, Math.min(durationMin, x)));
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

// ---------------------------------------------------------------- R18 (item 52: the ride-day plan)

// R18.1: the clock hours of a D-minute ride, and the hour a time belongs to
export function dayHours(D) {
  const out = [];
  for (let a = 0; a < D - 1e-9; a += 60) { const b = Math.min(D, a + 60); out.push({ k: out.length, a, b, frac: (b - a) / 60 }); }
  return out;
}
export const hourOf = (t, n) => Math.min(n - 1, Math.max(0, Math.floor(t / 60 + 1e-9)));

// R18.2: an hour's window (first and latest 5-min marks a gel may take)
export function dayWindow(h, firstMin, D) {
  const F = Math.min(isNum(firstMin) ? firstMin : 20, D);
  const latest = Math.floor(Math.max(F, D - 30) / 5 + 1e-9) * 5;
  const first = Math.min(Math.round(F / 5) * 5, latest);
  const lo = Math.max(h.a + (h.a > 0 ? 5 : 0), first);
  const hi = Math.min(h.b < D - 1e-9 ? h.b - 10 : latest, latest);
  return { lo, hi };
}
// R18.2: the window's free marks: from its start, each 15 min after the last one taken and 15 min from every caffeine time
export function freeMarks(win, cafTimes) {
  const out = [];
  if (!(win.hi >= win.lo - 1e-9)) return out;
  for (let t = win.lo; t <= win.hi + 1e-9; t += 5) {
    if (out.length && t - out[out.length - 1] < 15 - 1e-9) continue;
    if (cafTimes.some(c => Math.abs(c - t) < 15 - 1e-9)) continue;
    out.push(t);
  }
  return out;
}
// R18.2: rooms = each hour's caffeine doses + its free marks
export function dayRooms(hours, firstMin, D, cafTimes) {
  const wins = hours.map(h => dayWindow(h, firstMin, D));
  const cafPer = hours.map(() => []);
  cafTimes.forEach(t => cafPer[hourOf(t, hours.length)].push(t));
  const rooms = hours.map((h, k) => cafPer[k].length + freeMarks(wins[k], cafTimes).length);
  return { wins, cafPer, rooms };
}

// 'HH:MM' + minutes → minutes after midnight on a 24 h clock (the minutes rounded)
const clockPlus = (start, m) => { const s = clockMin(start); return s === null ? null : (s + Math.round(m)) % 1440; };

// R18.3: the caffeine times
export function caffeineTimes({ D, firstMin, fromMin, startTime, noneAfter, maxMg, doseMg }) {
  const out = { times: [], dropped: [], from: null, to: null, asked: 0 };
  const F0 = Math.min(isNum(firstMin) ? firstMin : 20, D);
  const auto = D <= 150 ? F0 : Math.min(90, Math.max(F0, D - 150));                            // R8's first aim
  const from = isNum(fromMin) && fromMin >= 0 ? fromMin : auto, to = D - 60;
  out.from = from; out.to = to;
  if (to < from - 1e-9) { out.asked = 1; out.dropped.push({ why: 'window' }); return out; }
  let n = 1 + Math.floor((to - from) / 150 + 1e-9);
  out.asked = n;
  if (isNum(doseMg) && doseMg > 0) {                                                            // the per-ride limit
    const byMg = Math.floor((isNum(maxMg) ? maxMg : 0) / doseMg + 1e-9);
    while (n > byMg) { out.dropped.push({ why: 'cap' }); n--; }
  }
  const W = to - from;
  if (n > 1) { const fit = Math.max(1, Math.min(n, Math.floor(W / 45 + 1e-9))); while (n > fit) { out.dropped.push({ why: 'window' }); n--; } }
  const grid = step => {
    const lo = Math.ceil(from / step - 1e-9) * step, hi = Math.floor(to / step + 1e-9) * step, t = [];
    if (hi < lo - 1e-9) return null;
    for (let j = 0; j < n; j++) {
      let x = Math.min(hi, Math.max(lo, Math.round((from + (j + 0.5) * W / n) / step - 1e-9) * step));   // a half rounds down
      if (j && x < t[j - 1] + 45 - 1e-9) x = Math.ceil((t[j - 1] + 45) / step - 1e-9) * step;
      t.push(x);
    }
    return { t, hi };
  };
  const last5 = Math.floor(to / 5 + 1e-9) * 5;
  let g = grid(30), t;
  if (g && g.t[g.t.length - 1] <= g.hi + 1e-9) t = g.t;
  else { g = grid(5); t = g ? g.t : [Math.max(0, last5)]; }
  t = t.filter(x => { if (x > last5 + 1e-9) { out.dropped.push({ why: 'window' }); return false; } return true; });
  const cut = clockMin(noneAfter);
  if (startTime && cut !== null) t = t.filter(x => { const c = clockPlus(startTime, x); if (c !== null && c > cut) { out.dropped.push({ t: x, why: 'late' }); return false; } return true; });
  out.times = t;
  return out;
}

// R18.4: the gels per hour (running total of the weights, rooms, caffeine) → total gels per hour
export function startCounts(weights, fracs, n, rooms, cafN) {
  const w = weights.some(x => x > 1e-9) ? weights : fracs, T = w.reduce((a, x) => a + x, 0);
  let acc = 0, prev = 0;
  const c = w.map((x, k) => {
    acc += x;
    const by = k === w.length - 1 ? n : Math.min(n, Math.round(n * acc / (T || 1) + 1e-9));
    const v = Math.max(0, by - prev); prev = Math.max(prev, by); return v;
  });
  const near = (k, ok) => { for (let d = 1; d < c.length; d++) for (const j of [k - d, k + d]) if (j >= 0 && j < c.length && ok(j)) return j; return -1; };
  for (let k = 0; k < c.length; k++) while (c[k] > rooms[k]) { const j = near(k, j2 => c[j2] < rooms[j2]); if (j < 0) break; c[k]--; c[j]++; }
  for (let k = 0; k < c.length; k++) while (c[k] < cafN[k]) { const j = near(k, j2 => c[j2] > cafN[j2]); if (j >= 0) c[j]--; c[k]++; }
  return c;
}

// R18.6: one plan of plain gels per hour → each bottle's carbs, what is short, each hour's miss
export function dayEvaluate(plain, ctx) {
  const { hours, cafN, cafCarbs, gelA, gelB, T, S, L, bottles } = ctx, half = (gelA && gelA.carbsG > 0 ? gelA.carbsG : 0) / 2;
  const g = hours.map((h, k) => cafN[k] * cafCarbs);
  let j = 0;
  plain.forEach((n, k) => { for (let m = 0; m < n; m++, j++) g[k] += (gelB && j % 2 === 1 ? gelB : gelA).carbsG || 0; });
  const ov = (x, h) => Math.max(0, Math.min(h.b, x.end) - Math.max(h.a, x.start));
  const carbs = [], out = [], over = [], aboveS = [];
  let carry = 0;
  for (let q = bottles.length - 1; q >= 0; q--) {
    const x = bottles[q], most = L * x.ml / 100;                                  // the hard limit
    let gin = 0; hours.forEach((h, k) => { const o = ov(x, h); if (o > 0) gin += g[k] * o / ((h.b - h.a) || 1); });
    const want = T * (x.end - x.start) / 60 - gin + carry;
    carbs[q] = Math.min(Math.max(0, want), most); over[q] = want - most; carry = Math.max(0, want - most); out[q] = carry;
    aboveS[q] = Math.max(0, carbs[q] - (S * x.ml / 100 + half));                 // over today's strength, half a gel allowed
  }
  const miss = hours.map((h, k) => { let t = g[k]; bottles.forEach((x, q) => { const o = ov(x, h); if (o > 0) t += carbs[q] * o / ((x.end - x.start) || 1); }); return t - T * h.frac; });
  return { g, carbs, out, over, aboveS, above: aboveS.reduce((a, x) => a + x, 0), short: carry, miss, ss: miss.reduce((a, x) => a + x * x, 0) };
}
const r20 = x => Math.round(x * 20) / 20;
const beyond = (miss, k0 = 0, k1 = miss.length - 1) => { let s = 0; for (let k = k0; k <= k1; k++) s += Math.max(0, Math.abs(miss[k]) - 5); return s; };

// R18.6: the plan of plain gels per hour with each bottle its own strength
export function dayAllocate(ctx) {
  const { hours, rooms, cafN, bottles, minN } = ctx, n = hours.length, nCaf = cafN.reduce((a, x) => a + x, 0);
  const key = (e, c) => [r20(e.short), r20(beyond(e.miss)), r20(e.above), c.reduce((a, x) => a + x, 0) + nCaf, e.ss];
  const beats = (x, y) => { for (let k = 0; k < 4; k++) { if (x[k] < y[k]) return true; if (x[k] > y[k]) return false; } return x[4] < y[4] - 0.5; };
  const same4 = (x, y) => x[0] === y[0] && x[1] === y[1] && x[2] === y[2] && x[3] === y[3];
  const hk = t => hourOf(t, n);
  // the start: groups of hours that share a bottle, from the last group back
  const link = hours.map((h, k) => k < n - 1 && bottles.some(x => x.start < h.b - 1e-9 && x.end > h.b + 1e-9));
  const groups = []; let g0 = 0;
  hours.forEach((h, k) => { if (!link[k]) { groups.push([g0, k]); g0 = k + 1; } });
  let plain = hours.map(() => 0);
  const setG = (g, kk) => { for (let k = g[0]; k <= g[1]; k++) { const w = hours[k].frac >= 1 - 1e-9 ? kk : Math.round(kk * hours[k].frac); plain[k] = Math.max(0, Math.min(rooms[k], Math.max(cafN[k], w)) - cafN[k]); } };
  for (let gi = groups.length - 1; gi >= 0; gi--) {
    const g = groups[gi], first = bottles.findIndex(x => { const k = hk(x.start); return k >= g[0] && k <= g[1]; });
    const kmax = Math.max(0, ...rooms.slice(g[0], g[1] + 1));
    const inG = bottles.map((x, q) => q).filter(q => { const k = hk(bottles[q].start); return k >= g[0] && k <= g[1]; });
    let best = null, bestK = 0;
    for (let kk = 0; kk <= kmax; kk++) {
      setG(g, kk); const e = dayEvaluate(plain, ctx), k = [first >= 0 ? r20(e.out[first]) : 0, r20(beyond(e.miss, g[0], g[1])), r20(inG.reduce((a, q) => a + e.aboveS[q], 0))];
      if (!best || k[0] < best[0] || (k[0] === best[0] && (k[1] < best[1] || (k[1] === best[1] && k[2] < best[2])))) { best = k; bestK = kk; }
    }
    setG(g, bestK);
  }
  // up to the minimum: the add with the best key
  for (let it = 0; it < 100 && plain.reduce((a, x) => a + x, 0) + nCaf < minN; it++) {
    let bc = null, bk = null;
    for (let b = 0; b < n; b++) if (plain[b] + cafN[b] < rooms[b]) {
      const c = plain.slice(); c[b]++; const k = key(dayEvaluate(c, ctx), c);
      if (!bk || beats(k, bk) || (same4(k, bk) && k[4] < bk[4] - 1e-9)) { bk = k; bc = c; }
    }
    if (!bc) break;
    plain = bc;
  }
  // then one step at a time
  let E = dayEvaluate(plain, ctx), K = key(E, plain);
  for (let it = 0; it < 300; it++) {
    const tot = plain.reduce((a, x) => a + x, 0) + nCaf, cand = [];
    for (let a = 0; a < n; a++) if (plain[a] > 0) for (let b = 0; b < n; b++) if (b !== a && plain[b] + cafN[b] < rooms[b]) { const c = plain.slice(); c[a]--; c[b]++; cand.push(c); }
    const has = k => plain[k] + cafN[k] < rooms[k];
    for (let b = 0; b < n; b++) if (has(b)) { const c = plain.slice(); c[b]++; cand.push(c); }
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n && has(b) && has(a); b++) { const c = plain.slice(); for (let k = a; k <= b; k++) c[k]++; cand.push(c); }
    if (tot - 1 >= minN) for (let a = 0; a < n; a++) if (plain[a] > 0) { const c = plain.slice(); c[a]--; cand.push(c); }
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n && plain[b] > 0 && plain[a] > 0; b++) {
      if (tot - (b - a + 1) < minN) break;
      const c = plain.slice(); for (let k = a; k <= b; k++) c[k]--; cand.push(c);
    }
    let best = null, bk = null, bc = null;
    for (const c of cand) {
      const e = dayEvaluate(c, ctx), k = key(e, c);
      if (!beats(k, K)) continue;
      if (!best || beats(k, bk) || (same4(k, bk) && k[4] < bk[4] - 1e-9)) { best = e; bk = k; bc = c; }
    }
    if (!best) break;
    plain = bc; E = best; K = bk;
  }
  E = dayEvaluate(plain, ctx);
  return { plain, carbs: E.carbs, short: E.short, miss: E.miss, key: key(E, plain) };
}

// R18.7: one hour's gel minutes
export function hourMinutes(win, p, cafHour, cafAll) {
  const out = cafHour.map(t => ({ t, caf: true }));
  if (p > 0) {
    const { lo, hi } = win, W = hi - lo, ideal = [];
    if (p === 1) ideal.push(Math.round((lo + hi) / 2 / 5) * 5);
    else {
      const cen = W / p >= 15 - 1e-9;
      for (let j = 0; j < p; j++) ideal.push(Math.round((cen ? lo + (j + 0.5) * W / p : lo + j * W / (p - 1)) / 5) * 5);
      for (let j = 1; j < p; j++) ideal[j] = Math.max(ideal[j], ideal[j - 1] + 15);
      for (let j = p - 2; j >= 0; j--) ideal[j] = Math.min(ideal[j], ideal[j + 1] - 15);
    }
    const spots = ideal.map(x => Math.max(lo, Math.min(hi, x)));
    const taken = cafAll.slice(), mine = [], ok = c => taken.every(u => Math.abs(u - c) >= 15 - 1e-9);
    for (const x of spots) {
      let got = null;
      for (let d = 0; got === null && (x - d >= lo - 1e-9 || x + d <= hi + 1e-9); d += 5)
        for (const c of [x - d, x + d]) if (c >= lo - 1e-9 && c <= hi + 1e-9 && ok(c)) { got = c; break; }
      if (got !== null) { taken.push(got); mine.push(got); }
    }
    if (mine.length < p) {
      const fr = freeMarks(win, cafAll), m = fr.length; mine.length = 0;
      if (m) for (let j = 0; j < Math.min(p, m); j++) mine.push(fr[p > 1 ? Math.round(j * (m - 1) / (Math.min(p, m) - 1 || 1)) : Math.floor((m - 1) / 2)]);
    }
    mine.forEach(t => out.push({ t, caf: false }));
  }
  return out.sort((a, b) => a.t - b.t);
}
// R18.7: the ride's gels in time order: [{t, caf}]
export function gelMinutes(hours, wins, plain, cafPer, cafAll, D) {
  const out = [];
  hours.forEach((h, k) => hourMinutes(wins[k], plain[k], cafPer[k], cafAll).forEach(x => out.push({ t: Math.max(0, Math.min(D, x.t)), caf: x.caf })));
  return out;
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

// R9: kind of top-up unit. unit 'g' → grams (table salt); swallowed → whole capsules; a liquid in capfuls (item 47) → whole capfuls in the
// bottle; otherwise dissolved half units.
export function topUpKind(p) {
  if (!p) return 'none';
  if (p.unit === 'g') return 'grams';
  if (p.swallow) return 'capsule';
  return p.whole || p.unit === 'capful' ? 'whole-units' : 'half-units';
}

// R9: the ride's top-up count for a gap (mg) once the gap is > 25 mg.
export function topUpCount(kind, gapMg, unitMg) {
  if (kind === 'grams') return gapMg / unitMg;                     // R9: table salt, exact grams ([J8] shown to 0.1 g)
  if (kind === 'capsule') return Math.round(gapMg / unitMg);       // R9: whole capsules, round(gap ÷ mg per capsule)
  if (kind === 'whole-units') return Math.round(gapMg / unitMg);   // R9 (item 47): whole capfuls, round(gap ÷ mg per capful)
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
  const fluidFactor = null;                                                         // R4a (item 39): the sweat grid replaces the band fluid factor
  const carbsFactor = band === 'Hot' && ride.heatLowerCarbs ? row.carbsHeat : 1;   // R3/R4: × 0.85 only Hot + "lower carbs in heat"

  // R4 · Targets
  const carbsPerHr = athlete.carbsGPerHr[ride.effort] * carbsFactor;               // R4: g/hr for the effort
  const grid = athlete.sweatGrid || gridFromSingle(athlete.sweatOzPerHr);          // R4a: the grid (or the single rate, migrated)
  const rideT = isNum((ride.weather || {}).feelsLikeF) ? ride.weather.feelsLikeF : 65; // R4a: the ride's temperature (65 °F with no weather)
  const sweatBand = sweatBandOf(rideT), sweatOwn = sweatBox(grid, sweatBand, SWEAT_EFFORT[ride.effort] || 'z2').own;
  const fluidWant = override !== null ? override : gridFluid(grid, ride.effort, rideT);  // R4: the grid at the ride's temperature, or the override
  const lim = ride.fluidLimits || {}, pos = v => isNum(v) && v > 0 ? v : null, fMin = pos(lim.minOzPerHr), fMax = pos(lim.maxOzPerHr);
  let fluidPerHr = fluidWant, fluidLimit = null;                                   // R4 (item 38): held within the rider's limits
  if (fMin !== null && fluidPerHr < fMin) { fluidPerHr = fMin; fluidLimit = 'floor'; }
  if (fMax !== null && fluidPerHr > fMax) { fluidPerHr = fMax; fluidLimit = 'ceiling'; }
  const HR = rideHours(athlete, ride, durationMin, grid, fMin, fMax);              // R4b (item 49): hour by hour, or null
  let fluidWantAvg = fluidWant;
  if (HR) {
    fluidPerHr = HR.hours.reduce((a, h) => a + h.fluidOz * h.frac, 0) / hours;     // R4b: the ride's fluid = the sum of the hours
    fluidWantAvg = HR.hours.reduce((a, h) => a + h.want * h.frac, 0) / hours;
    const nf = HR.hours.filter(h => h.limit === 'floor').length, nc = HR.hours.filter(h => h.limit === 'ceiling').length;
    fluidLimit = nc || nf ? (nc >= nf ? 'ceiling' : 'floor') : null;               // R4b: the limit that held the most hours (ceiling on a tie)
  }
  const sodiumPerHr = athlete.sweatSodiumMgPerL * fluidPerHr * OZ_ML / 1000;       // R4: mg/L × litres per hour (R4b: the hours' sum ÷ H)
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

  // R7 / R18.2 · The gel window: R7's first gel and latest mark; the most that fit = the hours' rooms (R18.2), with the caffeine times
  const gelsAllowed = g.on !== false;                                              // R6.5: "No gels" → gels.on false
  const win = gelWindow(g.firstMin, durationMin);
  const minCount = gelsAllowed ? minGels(durationMin, isNum(g.minPerHr) ? g.minPerHr : 1) : 0;   // R6.4

  // R8 · Is caffeine on for this ride? ("Long rides only" = rides of at least the set hours)
  const cafActive = cafModeOn && !(caf.mode === 'long' && durationMin < (isNum(caf.longHrs) ? caf.longHrs : 0) * 60);
  // R18.3 · The caffeine times (gels allowed and a caffeinated gel set)
  const doseMg = gelC && isNum(gelC.caffeineMg) ? gelC.caffeineMg : null;
  const CT = !refused && cafActive && gelsAllowed && gelC ? caffeineTimes({ D: durationMin, firstMin: g.firstMin, fromMin: caf.fromMin, startTime: ride.startTime, noneAfter: caf.noneAfter, maxMg: caf.maxMg, doseMg }) : null;
  const cafTimes = CT ? CT.times : [];
  // R18.1 / R18.2 · The hours and their rooms
  const DH = dayHours(durationMin), RM = dayRooms(DH, g.firstMin, durationMin, cafTimes), cafN = RM.cafPer.map(L => L.length);
  const fitCount = Math.max(1, RM.rooms.reduce((a, x) => a + x, 0));
  const cafOut = cafActive ? { fromMin: CT ? CT.from : null, toMin: CT ? CT.to : null, timesMin: cafTimes.slice(), count: cafTimes.length,
    mg: doseMg !== null ? cafTimes.length * doseMg : null, doseMg, maxMg: isNum(caf.maxMg) ? caf.maxMg : null, noneAfter: caf.noneAfter ?? null,
    dropped: CT ? { cap: CT.dropped.filter(d => d.why === 'cap').length, window: CT.dropped.filter(d => d.why === 'window').length, late: CT.dropped.filter(d => d.why === 'late').length } : { cap: 0, window: 0, late: 0 } } : null;

  // The plan proper needs: no refusal, no My bottles, and a known mixed fluid (no water refill).
  const planned = !refused && !myBottles && mixedOzPerHr !== null;

  let count = null, timesMin = null, gelCarbsG = null, bottlesCarbsG = null, noGelsShortGPerHr = null;
  let hourMixedOut = null, hourGapsOut = null;                                     // R4b / R6b, for the output
  let gelList = null, perHourOut = null, plainOut = null, weightsOut = null;

  if (planned) {
    const mixedMlRide = mixedOzPerHr * hours * OZ_ML;                              // R1: the mixed fluid of the whole ride, mL
    const bottleAtS = S * mixedOzPerHr * OZ_ML / 100;                              // R6.1: g/hr the bottles carry at S
    // R4b (item 49): each hour's mixed fluid (less the water's even share, never below 0, scaled to the ride's mixed fluid); R6b: its gap
    let hourMixed = null, hourGaps = null;
    if (HR) {
      const raw = HR.hours.map(h => Math.max(0, h.fluidOz - waterOzPerHr)), got = raw.reduce((a, x, k) => a + x * HR.hours[k].frac, 0);
      hourMixed = raw.map(x => (got > 0 ? x * mixedOzPerHr * hours / got : 0));
      hourGaps = HR.hours.map((h, k) => Math.max(0, carbsPerHr * h.frac - S * hourMixed[k] * OZ_ML / 100 * h.frac));
      hourMixedOut = hourMixed; hourGapsOut = hourGaps;
    }
    if (gelsAllowed) {
      const seq = k => (gelB && k % 2 === 1 ? gelB : gelA);                       // R6.2: A, B, A, B … (B = second gel when set)
      const seqCarbs = n => { let s = 0; for (let k = 0; k < n; k++) s += seq(k).carbsG; return s; };
      // R6.1: the gap to cover with gels
      let toCover = hourGaps ? hourGaps.reduce((a, x) => a + x, 0) : Math.max(0, carbsPerHr - bottleAtS) * hours;   // R6b: the hours' gaps
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
      // R6.3: hold loop — while the bottles would be over the limit and R18.2 has room, one more gel
      const strength = n => Math.max(0, carbsTotal - seqCarbs(n)) / mixedMlRide * 100;   // R1: % over the whole ride's mixed fluid
      while (count < fitCount && strength(count) > bottleLimitPct) count++;
      // R6.4: minimum gels; R18.4: never more than the rooms
      count = Math.min(Math.max(count, minCount), fitCount);
      // R18.4: the gels (with the caffeine doses), per hour as a running total of the hours' gaps
      const total = Math.max(count, cafTimes.length);
      const weights = hourGaps ? hourGaps : DH.map(h => Math.max(0, (carbsPerHr - bottleAtS) * h.frac));
      const counts = startCounts(weights, DH.map(h => h.frac), total, RM.rooms, cafN);
      const plain = counts.map((x, k) => Math.max(0, x - cafN[k]));
      perHourOut = counts; plainOut = plain; weightsOut = weights;
      // R18.7: the minutes, and the gels in time order (plain gels A, B, A, B …; the caffeinated gel at its times)
      const mins = gelMinutes(DH, RM.wins, plain, RM.cafPer, cafTimes, durationMin);
      timesMin = mins.map(x => x.t);
      let j = 0; gelList = mins.map(x => (x.caf ? gelC : seq(j++)));
      count = gelList.length;
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
    }
  }

  // R9 / R14 · Sodium and the top-up
  const NA = sodiumPlan({ athlete, ride, refused, planned, unknown, gelList, bottlesCarbsG, sodiumTotal });
  const { gelSodiumMg, mixSodiumMg, topUp } = NA;

  return roundAll({
    refused,
    durationMin,
    hours,
    weather: { band, basis, fluidFactor, carbsFactor },
    strength: { suggestPct: S, limitPct: L, bottleLimitPct },
    perHour: { fluidOz: fluidPerHr, carbsG: carbsPerHr, sodiumMg: sodiumPerHr },
    fluidLimit,                                                                    // R4: 'floor' | 'ceiling' | null
    sweat: override !== null ? null : HR ? { hourly: true } : { band: sweatBand, own: sweatOwn, tempF: rideT },  // R4a: the box the label names (R4b: "hour by hour")
    hourly: HR ? { startF: HR.startF, endF: HR.endF, spread: HR.spread, fluidWantOz: fluidWantAvg,
      hours: HR.hours.map((h, k) => ({ frac: h.frac, tempF: h.tempF, fluidOz: h.fluidOz, limit: h.limit, sodiumMg: h.sodiumMg,
        mixedOz: hourMixedOut ? hourMixedOut[k] : null, gapG: hourGapsOut ? hourGapsOut[k] : null })) } : null,
    totals: { fluidOz: fluidTotal, carbsG: carbsTotal, sodiumMg: sodiumTotal },
    cages,
    maxStartBottles,
    water: { n: nWater, refill, ozPerHr: waterOzPerHr },
    mixedFluidOzPerHr: mixedOzPerHr,
    gels: { allowed: gelsAllowed, count, minCount, firstMin: win.firstMin, latestMin: win.latestMin, fitCount, timesMin, carbsG: gelCarbsG,
      perHour: perHourOut, plainPerHour: plainOut, rooms: RM.rooms, cafPerHour: cafN, weights: weightsOut },   // R18.2 / R18.4
    bottlesCarbsG,
    noGelsShortGPerHr,
    caffeine: cafOut,
    topUp,
    mixSodiumMg,
    gelSodiumMg,
    unknown,
  });
}

// R9 / R14 · Sodium from the gels and the drink mix, the gap and the top-up. Shared by expected() and the per-bottle plan (R18.6).
export function sodiumPlan({ athlete, ride, refused, planned, unknown, gelList, bottlesCarbsG, sodiumTotal }) {
  const mix = product(athlete, ride.drinkMix);
  const partner = ride.blendPartner ? product(athlete, ride.blendPartner) : null;
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

  return { gelSodiumMg, mixSodiumMg, gapMg, topUp };
}
