// The always-true rules (tests/reference/RULES.md R16, A1–A9) and the golden-ride checks, as plain functions. Each check returns
// { id, title, status, msg } with status:
//   'pass'      the app follows the rule;
//   'fail'      the app breaks a written rule (the test fails);
//   'judgment'  outside the rule only where two written rules (or a rule and a deliberate app choice) collide; reported for Mark
//               (see tests/README.md, J1–J14), never a failure;
//   'warned'    outside the tolerance, but the plan shows a red warning that says so and offers fixes (A6), so nothing is hidden.
// Messages are plain words: which ride, expected vs actual, which rule.
import { product } from '../fixtures/load.mjs';
import { scoopsCount, OZ_ML, expected as refExpected, gridFluid, dayHours, dayRooms, dayAllocate, gelMinutes, sodiumPlan, mixedHours, r19Plan, r19Sodium, bandOfHour, pinTargets } from '../reference/calc.js';

export const RULES = {
  A1: 'A plain water bottle contains only water.',
  A2: 'No mixed bottle exceeds the strength limit; extra carbs go to gels; with gels off the shortfall is shown.',
  A3c: 'Carbs per hour within ±2 g of the target (when gels are allowed).',
  A3s: 'Sodium per hour within ±5% of the target.',
  A3f: 'Fluid per hour within ±1 oz of the target.',
  A4: 'Bottle carbs = Σ(powder grams × that product\'s carbs per gram); powder grams are never counted as carbs.',
  A5: 'Whole capsules and capfuls only; dissolved units in halves; scoop counts match the grams (nearest quarter).',
  A6: 'Bottles at the start never exceed the bike\'s cages; otherwise a cage warning with fixes is shown.',
  A7: 'Totals equal the sum of the items listed (bottles + baggies + gels).',
  A8: 'Grams shown to 1 g, ounces to 1 oz.',
  A9: 'Weather follows the band table (strength); the fluid matches the reference (R4, R4a).',
  A11: 'Sweat rate grid (item 39; item 56: by heat band, no blending): the fluid is the effort\'s box in the row of the ride\'s heat band (R3); the athlete\'s own boxes never get the heat increase; sodium per hour = fluid × sweat sodium; Results names the source ("your Moderate · Steady" or "auto").',
  A10: 'Fluid per hour never below the rider\'s lowest or above their highest (Settings › Fluid limits); Results says "at your floor" / "at your ceiling" when one holds it.',
  A12: 'Hour by hour (item 49; item 56: every ride with the forecast\'s hours): each hour\'s fluid is the grid box of its band within the limits; the ride\'s fluid is their sum; sodium follows the fluid; the gels at least 15 min apart (item 52: where R18 puts them, A13); refills on the hours\' fluid.',
  G9: 'The gel minutes as R18.7 puts them (each hour\'s gels round its caffeine gels, 15 min apart, inside the hour\'s window).',
  A13: 'The ride-day plan (item 52, R18): whole gels per clock hour within each hour\'s room, as R18.4 / R18.6 put them; each bottle\'s carbs = its stretch\'s target − its gels (+ what the bottles after it couldn\'t hold), never over the limit; each hour within ±5 g; bottle starts on the hour within 5 min of it, else to 5 min, where the bottles before them run out; caffeine at R18.3\'s times (none in the last 60 min, 45 min apart, within the limit).',
  A14: 'Hour by hour on the default plan (item 56, R19): fluid by hour; every bottle at or under its own cap; gels per hour as R19.3 puts them; no hour over 90 g; each full hour within half a gel; the ride within one gel (the planned last-30-min shortfall added back); sodium per bottle.',
  N1: 'No number in the plan is NaN or infinite; a missing label value shows "unknown".',
  G1: 'Ride length as the rules say (distance mode included).',
  G2: 'A gel or drink mix with no carbs value refuses the plan with "carbs unknown".',
  G3: 'Gel count as the rules say (rounding, hold, minimum, the hours\' room; item 52: per hour, R18.4 / R18.6).',
  G4: 'Every gel inside the ride; plan gels no later than 30 min before the finish.',
  G5: 'Caffeine doses where the rules put them (R18.3: from the Caffeine from time to 60 min before the finish), under the limit, none after the cutoff.',
  G6: 'Plain water bottles: count and oz/hr as the rules say.',
  G7: 'Sodium top-up sized as the rules say.',
  G8: 'A ride that must warn shows the cage warning with fixes.',
  G10: 'The numbers the item asked for, by hand (item 56\'s golden ride): fluid by hour, gels, each bottle\'s strength, the planned last-30-min shortfall, no hour over 90 g.',
};

const r1 = x => Math.round(x * 10) / 10, r0 = x => Math.round(x);
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const res = (id, status, msg = '', j = null) => ({ id, title: RULES[id], status, msg, j });

// ---- helpers -------------------------------------------------------------------------------------------------------------------------
const mixedBottles = app => app.lp.bottles.filter(b => !b.plain && !b.aid && b.oz > 0);
const extraNa = app => app.lp.gels.filter(g => g.extra).reduce((t, g) => t + (+g.sodium || 0), 0); // the sodium of the extra gels a short leg needs
const concOf = b => (b.oz > 0 ? b.carbs / (b.oz * OZ_ML) * 100 : 0);
const redWarn = app => app.lp.warn.filter(w => w.kind === 'bad');
const hasTail = app => app.lp.warn.some(w => w.key === 'tail');
const fmtH = x => r1(x);
const fmtT = m => `${Math.floor(m / 60)}:${String(Math.round(m % 60)).padStart(2, '0')}`;

// item 52 · R18.6: why a ride keeps one recipe in every bottle (the reasons the rules list; the ones that come from how the bike is packed are
// read from the app's plan: a skipped late refill or leftover, a leg short of fluid, gels that didn't fit)
export function dayReasons(ride, app) {
  const r = [];
  if (ride.sameRecipe) r.push('same');
  if (ride.myBottles) r.push('mine');
  if (ride.gels && ride.gels.on === false) r.push('nogels');
  if (app.leftover) r.push('leftover');
  if (app.lp.legs.some(L => L.supply === 'aid' || L.supply === 'water')) r.push('stop');
  if (app.lp.legs.some(L => L.short > 0.5 || L.fit)) r.push('short');
  if (app.engine.fitShort > 0.05 || app.engine.roleShort > 0.05) r.push('fit');
  return r;
}
// the reference's plan for the ride: R18.4 (one recipe) from the expected answers, or R18.6 from the app's bottle stretches
export function refDay({ athlete, ride, exp, app }) {
  const D = app.lp.day; if (!D || exp.refused || !exp.gels.rooms) return null;
  if (exp.r19) return refR19({ athlete, ride, exp, app });
  const why = dayReasons(ride, app);
  if (why.length) return exp.gels.count == null || !exp.gels.perHour ? null : { mode: 'same', why, counts: exp.gels.perHour, plain: exp.gels.plainPerHour, timesMin: exp.gels.timesMin, count: exp.gels.count, topUp: exp.topUp };
  // (R18.6 needs only the bottles' stretches, so it is checked on rides whose mixed fluid R12 leaves to the app too: a refilled water bottle)
  const prod = id => product(athlete, id), gelA = prod(ride.gels.gel), gelB = ride.gels.second ? prod(ride.gels.second) : null, gelC = prod(ride.caffeine && ride.caffeine.gel);
  const hours = dayHours(exp.durationMin), cafTimes = exp.caffeine ? exp.caffeine.timesMin : [], RM = dayRooms(hours, ride.gels.firstMin, exp.durationMin, cafTimes);
  const bottles = D.rows.filter(x => !x.water).map(x => ({ start: x.start, end: x.end, ml: x.oz * OZ_ML }));
  const A = dayAllocate({ hours, rooms: RM.rooms, cafN: RM.cafPer.map(L => L.length), cafCarbs: gelC && isNum(gelC.carbsG) ? gelC.carbsG : 0, gelA, gelB,
    T: exp.perHour.carbsG, S: exp.strength.suggestPct, L: exp.strength.bottleLimitPct, bottles, minN: exp.gels.minCount });
  const mins = gelMinutes(hours, RM.wins, A.plain, RM.cafPer, cafTimes, exp.durationMin);
  let j = 0; const gelList = mins.map(x => (x.caf ? gelC : (gelB && j++ % 2 === 1 ? gelB : gelA)));
  const bottlesCarbsG = A.carbs.reduce((a, x) => a + x, 0);
  const NA = sodiumPlan({ athlete, ride, refused: null, planned: exp.gels.count != null, unknown: exp.unknown, gelList, bottlesCarbsG, sodiumTotal: exp.totals.sodiumMg });
  return { mode: 'stretch', why, counts: A.plain.map((x, k) => x + RM.cafPer[k].length), plain: A.plain, timesMin: mins.map(x => x.t), count: mins.length, carbs: A.carbs, short: A.short, miss: A.miss, topUp: NA.topUp };
}
// item 56 · R19: the rules' default plan for the ride, on the app's bottle stretches (R18.5) and, with a refilled water bottle, the app's water
// rate (R12 leaves it to the app)
export function refR19({ athlete, ride, exp, app }) {
  const D = app.lp.day, dur = exp.durationMin, prod = id => product(athlete, id);
  const gelA = prod(ride.gels.gel), gelB = ride.gels.second ? prod(ride.gels.second) : null, gelC = exp.caffeine ? prod(ride.caffeine && ride.caffeine.gel) : null;
  const hours = dayHours(dur), cafTimes = exp.caffeine ? exp.caffeine.timesMin : [], RM = dayRooms(hours, ride.gels.firstMin, dur, cafTimes), cafN = RM.cafPer.map(L => L.length);
  const E = exp.hourly, typed = isNum(ride.strengthLimitPct), fracs = hours.map(h => h.frac);
  // R19.1: each hour's band from the forecast's hours (its WBGT, else its feels-like), with or without a fluid override; else the ride's band
  const Hh = (ride.weather || {}).hourly, hw = Hh && Array.isArray(Hh.hoursF) && Hh.hoursF.length === hours.length && Hh.hoursF.every(isNum) ? Hh : null;
  const bands = hours.map((h, k) => (hw ? bandOfHour(Array.isArray(hw.hoursW) ? hw.hoursW[k] : null, hw.hoursF[k]) : exp.weather.band)), caps = bands.map(b => (typed ? exp.strength.suggestPct : exp.strength.caps[b]));
  const fluid = hours.map((h, k) => (E ? E.hours[k].fluidOz : exp.perHour.fluidOz));
  const w = exp.water.n > 0 ? (isNum(exp.water.ozPerHr) ? exp.water.ozPerHr : app.water ? app.water.ozHr : 0) : 0;
  let mixOz = w > 0 ? mixedHours(fluid, fracs, w) : fluid.slice();
  if (app.tail > 0.05) { const M = mixOz.reduce((a, x, k) => a + x * fracs[k], 0); if (M > 0) mixOz = mixOz.map(x => x * Math.max(0, M - app.tail) / M); } // R13: what the bike carries
  const naT = hours.map((h, k) => athlete.sweatSodiumMgPerL * fluid[k] * h.frac * OZ_ML / 1000);                                   // R19.5: the whole fluid
  // R19.7: the adjustments (pins) and "Same recipe in every bottle"
  const pins = ride.pins || {}, pv = k => (pins[k] && isNum(pins[k].v) ? pins[k].v : null), mix0 = prod(ride.drinkMix);
  const mlAll = mixOz.reduce((a, x, k) => a + x * fracs[k] * OZ_ML, 0);
  const forced = pv('conc') !== null ? Math.min(12, Math.max(0, pv('conc'))) : pv('mix') !== null && mlAll > 0 ? Math.min(12, pv('mix') * mix0.carbsG / mix0.servingG / mlAll * 100) : null;
  const same = forced === null && !!ride.sameRecipe, capMin = Math.min(...caps);
  const capsK = caps.map(c => (forced !== null ? forced : same ? capMin : c));
  const PT = pv('carbs') !== null ? pinTargets(hours.map(h => exp.perHour.carbsG * h.frac), fracs, pv('carbs')) : { T: hours.map(h => exp.perHour.carbsG * h.frac), pinCap: null };
  if (pv('sodium') !== null) { const s0 = naT.reduce((a, x) => a + x, 0); if (s0 > 0) naT.forEach((x, k) => { naT[k] = x * pv('sodium') / s0; }); }
  const ctx = { hours, bands, caps: capsK, mixOz, T: PT.T, rooms: RM.rooms, cafN, cafCarbs: gelC && isNum(gelC.carbsG) ? gelC.carbsG : 0, gelA, gelB,
    rounding: ride.gels.rounding || 'nearest', minPerHr: isNum(ride.gels.minPerHr) ? ride.gels.minPerHr : 0, naT, forced, same, gelsPin: pv('gels') };
  const rows = D.rows.filter(x => !x.water), P = r19Plan(ctx, rows.map(x => ({ start: x.start, end: x.end, ml: x.oz * OZ_ML })));
  const mins = gelMinutes(hours, RM.wins, P.plain, RM.cafPer, cafTimes, dur);
  let j = 0; const list = mins.map(x => ({ t: x.t, p: x.caf ? gelC : (gelB && j++ % 2 === 1 ? gelB : gelA) }));
  const tp = ride.topUp && ride.topUp !== 'none' && !exp.unknown.sodium.length ? prod(ride.topUp) : null;
  const NA = r19Sodium(hours, naT, P, list.map(x => ({ t: x.t, sodiumMg: isNum(x.p.sodiumMg) ? x.p.sodiumMg : 0 })), dur, prod(ride.drinkMix), tp, same);
  return { mode: 'r19', why: [], counts: P.plain.map((x, k) => x + cafN[k]), plain: P.plain, timesMin: mins.map(x => x.t), count: mins.length, rows,
    carbs: P.bottles.map(x => x.carbs), caps: P.bottles.map(x => x.cap), held: P.bottles.map(x => x.held), hours: P.hours, inH: P.inH, totH: P.totH,
    tail: P.tail, g: P.g, added: P.added, sodium: NA, topUpUnit: tp ? tp.unit : null, target: PT.T.reduce((a, x) => a + x, 0), pinCap: PT.pinCap || P.pinCap, forced, same };
}
const snap5 = t => { const h = Math.round(t / 60) * 60; return Math.abs(t - h) <= 5 + 1e-9 ? h : Math.round(t / 5) * 5; };

// ---- the always-true rules (golden + random) -----------------------------------------------------------------------------------------
export function alwaysTrue({ label, athlete, ride, exp, app }) {
  const out = [];
  if (app.crash) return [res('N1', 'fail', `${label}: the app crashed: ${String(app.crash).split('\n')[0]}`)];
  if (exp.refused) return out; // nothing to plan (G2 checks the refusal)
  if (app.errs) return [res('N1', 'fail', `${label}: the app refused the plan (${app.errs.join(' ')}) but the rules can plan it.`)];
  const T = app.lp.tot, H = app.H;
  const ref52 = app.lp.day ? refDay({ athlete, ride, exp, app }) : null; // item 52: the rules' ride-day plan for this ride

  // N1 · no NaN: every total and bottle number is a real number, unless the rules say a value is unknown
  const naUnknown = exp.unknown.sodium.length > 0;
  const bad = ['oz', 'carbs', 'na', 'powder', 'gelCarbs', 'gelNa'].filter(k => !isNum(T[k]) && !(naUnknown && (k === 'na' || k === 'gelNa')));
  const badB = app.lp.bottles.filter(b => ['oz', 'carbs', 'gA', 'gB', 'salt', 'conc'].some(k => !isNum(b[k])));
  if (bad.length || badB.length) out.push(res('N1', 'fail', `${label}: the plan has numbers that are not numbers (${bad.join(', ')}${badB.length ? `; ${badB.length} bottle(s)` : ''}). Rule N1: ${RULES.N1}`));
  else if (naUnknown && isNum(T.na) && !app.engine.naUnknown.length) out.push(res('N1', 'fail', `${label}: ${exp.unknown.sodium.join(', ')} has no sodium value, but the plan shows ${r0(T.na)} mg sodium as if it were known. Rule R14: show "unknown", never guess.`));
  else out.push(res('N1', 'pass'));

  // A1 · plain water is only water
  const dirty = app.lp.bottles.filter(b => b.plain && (b.carbs > 1e-9 || b.na > 1e-9 || b.powder > 1e-9 || b.gA > 1e-9 || b.gB > 1e-9 || b.salt > 1e-9));
  out.push(dirty.length ? res('A1', 'fail', `${label}: plain water bottle ${dirty[0].n} has ${r1(dirty[0].carbs)} g carbs, ${r0(dirty[0].na)} mg sodium, ${r1(dirty[0].powder)} g powder. Rule A1: ${RULES.A1}`) : res('A1', 'pass'));

  // A2 · strength limit. Hard limit L for every plan; with plain water or My bottles the mixed bottles are held at S (item 32.4).
  const L = exp.strength.limitPct, S = exp.strength.suggestPct, lim = exp.strength.bottleLimitPct;
  const strongest = mixedBottles(app).filter(b => b.carbs > 0.05).reduce((m, b) => (concOf(b) > concOf(m || b) ? b : (m || b)), null);
  const top = strongest ? concOf(strongest) : 0;
  const R19 = ref52 && ref52.mode === 'r19' ? ref52 : null;
  if (R19) { // item 56 (R19.2): each bottle at or under its own cap, the cap of its warmest 30-minute hour
    const over = R19.rows.map((x, q) => ({ x, q, c: x.oz > 0 ? x.carbs / (x.oz * OZ_ML) * 100 : 0 })).filter(o => o.c > R19.caps[o.q] + 0.05);
    out.push(over.length ? res('A2', 'fail', `${label}: the ${fmtT(over[0].x.start)} bottle is ${r1(over[0].c)}%, over its ${R19.caps[over[0].q]}% cap (R19.2: the cap of its warmest hour with 30 min or more). Rule A2: ${RULES.A2}`) : res('A2', 'pass', 'each bottle its own cap'));
  }
  else if (top > lim + 0.05) out.push(res('A2', 'fail', `${label}: bottle ${strongest.n} is ${r1(top)}%, over the ${lim}% limit (${lim === L ? 'the hard limit' : 'held at the strength for today, item 32.4'}). Expected ≤ ${lim}%, got ${r1(top)}%. Rule A2: ${RULES.A2}`));
  else if (top > S + 0.05) out.push(res('A2', 'judgment', `${label}: bottles at ${r1(top)}%, under the ${L}% limit but over today's suggested ${S}% (gel rounding). The app shows "Bottles are over the suggested ${S}%" with an "Add 1 gel" fix.`, 'J1'));
  else out.push(res('A2', 'pass'));
  if (!exp.gels.allowed && exp.noGelsShortGPerHr > 0.5) {
    const shown = app.engine.noGelShortHr > 0.5;
    out.push(shown ? res('A2', 'pass', 'no-gels shortfall shown') : res('A2', 'fail', `${label}: no gels and ${r0(exp.noGelsShortGPerHr)} g/hr short, but the plan shows no shortfall. Rule A2: ${RULES.A2}`));
  }

  // A3 · per-hour targets
  const warned = redWarn(app);
  const P = exp.perHour;
  if (exp.gels.allowed) {
    const c = T.carbs / H, dc = c - P.carbsG;
    // item 56 (R19.6): the ride within one gel of the target once the planned last-30-min shortfall is added back
    const dR = R19 ? T.carbs + R19.tail - R19.target : null; // (item 57: a carb pin moves the target; one the hours can't take stops at 90 g an hour)
    if (R19 ? Math.abs(dR) <= R19.g + 1e-6 : Math.abs(dc) <= 2 + 1e-9) out.push(res('A3c', 'pass', R19 ? `the ride within one gel (${r1(dR)} g, the last 30 min ${r0(R19.tail)} g under, planned)` : ''));
    else {
      const gel = product(athlete, ride.gels.gel), gel2 = product(athlete, ride.gels.second), halfGel = gel ? gel.carbsG / 2 / H : 0;
      const cafG = ride.caffeine && ride.caffeine.mode !== 'off' ? product(athlete, ride.caffeine.gel) : null; // R8: the caffeinated gel swaps into a slot
      const gelC = Math.max(gel ? gel.carbsG : 0, gel2 ? gel2.carbsG : 0, cafG && isNum(cafG.carbsG) ? cafG.carbsG : 0); // one whole gel, the biggest in use
      const legMissC = app.lp.legs.reduce((a, L) => a + (isNum(L.missCarbs) ? L.missCarbs : 0), 0);
      const msg = `${label}: carbs ${fmtH(c)} g/hr, expected ${fmtH(P.carbsG)} ±2 g/hr (${r0(T.carbs)} g for the ride vs ${r0(P.carbsG * H)} g).`;
      const forced = R19 ? R19.hours.reduce((a, q) => a + Math.max(0, q.G - q.T), 0) : 0; // R19: what the hours' gels alone put over their targets
      // item 57: what the hours that are out of room (their gel slots used: the first-gel time, 15 min apart) or at 90 g can't carry
      // (each hour as the bottles really carry it, held ones included; "at 90 g" with the bigger of the two gels, as they alternate)
      const gMax = !R19 ? 0 : Math.max(R19.g || 0, ...[product(athlete, ride.gels.second)].filter(Boolean).map(x => x.carbsG || 0));
      const stuck = R19 ? R19.hours.reduce((a, q, k) => { const sh = q.T - R19.totH[k]; return a + (sh > 1e-6 && (q.plain + q.caf >= q.room || q.G + gMax > 90 * q.frac + 1e-6) ? sh : 0); }, 0) : 0;
      if (R19 && R19.forced !== null) out.push(res('A3c', 'judgment', `${msg} A bottle pin (Adjust: ${ride.pins.conc ? `strength ${ride.pins.conc.v}%` : `${ride.pins.mix.v} g of drink mix`}) holds every bottle at ${r1(R19.forced)}%; the gels fill each hour around it, never past 90 g, and Results says what the ride gives instead.`, 'J19'));
      else if (R19 && ride.pins && ride.pins.gels) out.push(res('A3c', 'judgment', `${msg} Adjust pins ${ride.pins.gels.v} gels: the hours take them where there is room (the fewest first, never past 90 g); the bottles carry the rest up to their caps, and Results says what the ride gives instead.`, 'J19'));
      else if (R19 && dR < 0 && -dR - stuck <= R19.g + 1e-6 && stuck > 0) out.push(res('A3c', 'judgment', `${msg} The short hours are out of room for another gel (the first-gel time, 15 min apart) or at 90 g of gels (${r0(stuck)} g); the rules stop there and the plan shows what it gives.`, 'J18'));
      else if (R19 && app.lp.gels.some(g => g.extra)) out.push(res('A3c', 'judgment', `${msg} A leg's bottles can't carry its carbs, so whole extra gels go with that leg (${app.lp.gels.filter(g => g.extra).length}).`, 'J12'));
      else if (R19 && dR < 0 && warned.length) out.push(res('A3c', 'warned', `${msg} The bike can't carry this ride's bottles as planned, and the plan shows a red warning with fixes (${warned.map(w => w.key).join(', ')}).`));
      else if (R19 && dR > 0 && dR - forced <= R19.g + 1e-6) out.push(res('A3c', 'judgment', `${msg} The gels alone (whole gels, the rider's minimum of ${ride.gels.minPerHr}/hr, the caffeine doses) carry ${r0(forced)} g more than their hours' targets; those hours' bottles carry nothing.`, 'J11'));
      else if (dc > 0 && app.lp.warn.some(w => w.key === 'mine-over')) out.push(res('A3c', 'warned', `${msg} My bottles: the rider's "Carbs in each" alone is over the target, and the plan says so.`));
      else if (dc > 0 && app.engine.bottleCarbs <= 0.5 && (app.engine.minForced || dc * H <= gelC + 1)) out.push(res('A3c', 'judgment', `${msg} The gels alone (whole gels${app.engine.minForced ? `, the rider's minimum of ${ride.gels.minPerHr}/hr` : ''}) carry more than the target; the bottles carry no carbs.`, 'J11'));
      else if (dc < 0 && app.engine.adjShort) out.push(res('A3c', 'warned', `${msg} The plan says so on screen ("Carbs land at … under the … suggested").`));
      else if (dc > 0 && ref52 && ref52.mode === 'stretch' && app.lp.day.mode === 'stretch' && ref52.counts.join() === app.lp.day.hours.map(h => h.n).join()) out.push(res('A3c', 'judgment', `${msg} Each bottle its own strength (R18.6): whole gels per hour with the bottles held at the ${exp.strength.bottleLimitPct}% limit; a stretch whose gels pass its carbs leaves its bottle empty, and no single gel moved, added or taken away does better.`, 'J15'));
      else if (warned.length && Math.abs(dc * H) <= legMissC + gelC + 1) out.push(res('A3c', 'judgment', `${msg} The plan shows a red warning (${warned.map(w => w.key).join(', ')}); the warned legs miss ${r0(legMissC)} g.`, 'J9'));
      else if (ride.myBottles && Math.abs(dc) <= 2 + halfGel + 1e-6) out.push(res('A3c', 'judgment', `${msg} My bottles: fixed grams per carb bottle plus whole gels.`, 'J7'));
      else if (app.lp.legs.some(L => L.supply === 'aid')) out.push(res('A3c', 'judgment', `${msg} An aid-table stop: the table's drink is assumed to carry that leg's planned share (R12).`, 'J14'));
      else if (app.lp.legs.length > 1 && Math.abs(dc) <= 2 + halfGel + 1e-6) out.push(res('A3c', 'judgment', `${msg} Whole gels make up the carbs the legs' bottles can't carry (within half a gel for the ride).`, 'J12'));
      else out.push(res('A3c', 'fail', `${msg} Rule A3: ${RULES.A3c}`));
    }
  }
  if (R19) out.push(res('A3s', 'pass', 'sodium per bottle (R19.5, A14)'));
  else if (!naUnknown) {
    const s = T.na / H, ds = (s - P.sodiumMg) / P.sodiumMg;
    if (Math.abs(ds) <= 0.05 + 1e-9) out.push(res('A3s', 'pass'));
    else {
      const msg = `${label}: sodium ${r0(s)} mg/hr, expected ${r0(P.sodiumMg)} mg/hr ±5% (${ds > 0 ? '+' : ''}${r1(ds * 100)}%).`;
      const tp = app.topup, unitMg = tp && tp.kind === 'unit' ? tp.na : 0;
      const miss = Math.abs(T.na - P.sodiumMg * H);
      const waterLeg = app.lp.legs.some(L => L.supply === 'water');
      if (ds < 0 && miss <= 25 + 1) out.push(res('A3s', 'judgment', `${msg} The gap is under the 25 mg a top-up needs (R9).`, 'J5'));
      else if (unitMg && tp.whole && miss <= unitMg / 2 + 1) out.push(res('A3s', 'judgment', `${msg} Whole ${tp.unit || 'capsule'}s (${unitMg} mg each) can't land closer on this ride.`, 'J5'));
      else if (unitMg && !tp.whole && miss <= unitMg / 4 + 1) out.push(res('A3s', 'judgment', `${msg} Half ${tp.unit}s (${unitMg} mg each) can't land closer on this ride.`, 'J5'));
      else if (ds > 0 && app.engine.sodiumOver && !(tp && tp.mg > 0)) out.push(res('A3s', 'judgment', `${msg} The drink mix alone brings more sodium than the target; the app shows a red "Sodium is over your ceiling" note${ride.blendPartner ? '' : ' (no carb-only powder set to blend)'}.`, 'J6'));
      else if (ds < 0 && (ride.topUp === 'none' || app.saltUnknown) ) out.push(res('A3s', 'judgment', `${msg} No sodium top-up product is in use, so nothing can make up the gap.`, 'J10'));
      else if (warned.length && miss <= app.lp.legs.reduce((a, L) => a + (isNum(L.missNa) ? L.missNa : 0), 0) + (unitMg || 25) + 1) out.push(res('A3s', 'judgment', `${msg} The plan shows a red warning (${warned.map(w => w.key).join(', ')}).`, 'J9'));
      else if (ds > 0 && extraNa(app) > 0 && miss <= extraNa(app) + (unitMg || 25) + 1) out.push(res('A3s', 'judgment', `${msg} The whole extra gels that make up a leg's missing carbs (a water-only stop, or a warned leg) bring their own sodium (${r0(extraNa(app))} mg).`, 'J12'));
      else if (app.lp.legs.some(L => L.supply === 'aid')) out.push(res('A3s', 'judgment', `${msg} An aid-table stop: the table's drink is assumed to carry that leg's planned share (R12).`, 'J14'));
      else if (ds < 0 && waterLeg) out.push(res('A3s', 'judgment', `${msg} A water-only stop: that leg carries no mix or salt (warned only above 50 mg).`, 'J13'));
      else if (ds > 0 && ride.myBottles && !(tp && tp.mg > 0)) out.push(res('A3s', 'judgment', `${msg} My bottles: the drink mix in the rider's fixed grams per bottle brings this sodium.`, 'J7'));
      else out.push(res('A3s', 'fail', `${msg} Rule A3: ${RULES.A3s}`));
    }
  }
  {
    const f = T.oz / H, df = f - P.fluidOz;
    if (Math.abs(df) <= 1 + 1e-9) out.push(res('A3f', 'pass'));
    else {
      const msg = `${label}: fluid ${fmtH(f)} oz/hr, expected ${fmtH(P.fluidOz)} ±1 oz/hr (${r0(T.oz)} oz carried vs ${r0(P.fluidOz * H)} oz).`;
      if (warned.length) out.push(res('A3f', 'warned', `${msg} Shown as a red warning with fixes (${warned.map(w => w.key).join(', ')}).`));
      else if (hasTail(app) && df < 0 && P.fluidOz * H - T.oz <= (exp.hourly ? Math.max(...exp.hourly.hours.map(h => h.fluidOz)) : P.fluidOz) * 0.5 + 1) out.push(res('A3f', 'judgment', `${msg} No refill in the last 30 min: the bottles after it are not carried.`, 'J4'));
      else out.push(res('A3f', 'fail', `${msg} Rule A3: ${RULES.A3f}`));
    }
  }

  // A4 · carbs from the label's carbs per gram, never powder grams
  const mix = product(athlete, ride.drinkMix), partner = product(athlete, ride.blendPartner);
  const cpg = p => (p && isNum(p.carbsG) && isNum(p.servingG) && p.servingG > 0 ? p.carbsG / p.servingG : null);
  const cA = cpg(mix), cB = cpg(partner);
  const offB = app.lp.bottles.filter(b => !b.aid && !b.plain && (b.gA > 1e-6 || b.gB > 1e-6)).find(b => {
    const want = b.gA * (cA ?? 0) + b.gB * (cB ?? 0);
    return Math.abs(want - b.carbs) > 0.01 + 1e-6 * want;
  });
  out.push(offB ? res('A4', 'fail', `${label}: bottle ${offB.n} has ${r1(offB.gA + offB.gB)} g powder; by the labels that is ${r1(offB.gA * (cA ?? 0) + offB.gB * (cB ?? 0))} g carbs, but the plan says ${r1(offB.carbs)} g. Rule A4: ${RULES.A4}`) : res('A4', 'pass'));

  // A5 · whole capsules, half units (scoops are checked on the screen, golden rides)
  const salt = product(athlete, ride.topUp);
  if (salt && salt.unit !== 'g') {
    const step = salt.swallow || salt.whole ? 1 : 0.5; // item 47: capfuls come whole too
    const off = app.lp.bottles.find(b => b.salt > 1e-9 && Math.abs(b.salt / step - Math.round(b.salt / step)) > 1e-6);
    out.push(off ? res('A5', 'fail', `${label}: bottle ${off.n}${off.drink ? ' (drunk at the start/stop)' : ''} gets ${off.salt} ${salt.unit}s; ${salt.swallow ? 'capsules come whole' : salt.whole ? 'capfuls come whole' : 'dissolved units come in halves'}. Rule A5: ${RULES.A5}`) : res('A5', 'pass'));
  }

  // A6 · start bottles ≤ cages; a leg that can't carry what it needs shows a warning with fixes
  const startB = app.lp.bottles.filter(b => b.leg === 0 && typeof b.cage === 'number' && !b.drink);
  if (startB.length > exp.cages) out.push(res('A6', 'fail', `${label}: ${startB.length} bottles on the bike at the start, but it has ${exp.cages} cage(s). Rule A6: ${RULES.A6}`));
  else {
    const shortLegs = app.lp.legs.filter(L => L.short > 0.5);
    const unwarned = shortLegs.filter(L => !app.lp.warn.some(w => w.kind === 'bad' && (w.key === 'fit' ? L.k === 0 : w.key === `short-${L.k}`) && w.fixes.length));
    out.push(unwarned.length ? res('A6', 'fail', `${label}: leg ${unwarned[0].k + 1} is ${r0(unwarned[0].short)} oz short and no cage warning with fixes is shown. Rule A6: ${RULES.A6}`) : res('A6', 'pass'));
  }

  // A7 · totals = Σ items (the list) — and the engine totals the screen shows elsewhere (Details) agree with the list
  const sum = k => app.lp.bottles.reduce((a, b) => a + (isNum(b[k]) ? b[k] : 0), 0);
  const gC = app.lp.gels.reduce((a, g) => a + (isNum(g.carbs) ? g.carbs : 0), 0), gN = app.lp.gels.reduce((a, g) => a + (isNum(g.sodium) ? g.sodium : 0), 0);
  const listC = sum('carbs') + gC, listN = sum('na') + gN, listO = sum('oz');
  const a7 = [];
  if (Math.abs(listC - T.carbs) > 0.01) a7.push(`carbs total ${r1(T.carbs)} g vs the items ${r1(listC)} g`);
  if (isNum(T.na) && Math.abs(listN - T.na) > 0.01) a7.push(`sodium total ${r0(T.na)} mg vs the items ${r0(listN)} mg`);
  if (Math.abs(listO - T.oz) > 0.01) a7.push(`fluid total ${r1(T.oz)} oz vs the items ${r1(listO)} oz`);
  if (T.gels !== app.lp.gels.length) a7.push(`${T.gels} gels in the total vs ${app.lp.gels.length} listed`);
  out.push(a7.length ? res('A7', 'fail', `${label}: ${a7.join('; ')}. Rule A7: ${RULES.A7}`) : res('A7', 'pass'));

  // A9 · band table
  const a9 = [];
  if (app.band !== exp.weather.band) a9.push(`band ${app.band}, expected ${exp.weather.band}`);
  if (Math.abs(app.concTarget - S) > 1e-9) a9.push(`strength for today ${app.concTarget}%, expected ${S}%`);
  if (Math.abs(app.fluidOzHr - P.fluidOz) > 0.01) a9.push(`fluid ${r1(app.fluidOzHr)} oz/hr, expected ${r1(P.fluidOz)} (× ${exp.weather.fluidFactor})`);
  out.push(a9.length ? res('A9', 'fail', `${label}: ${a9.join('; ')}. Rule A9: ${RULES.A9}`) : res('A9', 'pass'));

  // A10 · the rider's fluid limits (item 38): the planned fluid stays within them, and the plan says which one held it
  const FL = ride.fluidLimits || {}, pos = v => isNum(v) && v > 0 ? v : null, lo = pos(FL.minOzPerHr), hi = pos(FL.maxOzPerHr), a10 = [];
  if (lo !== null && app.fluidPlan < lo - 1e-9) a10.push(`fluid ${r1(app.fluidPlan)} oz/hr is below the lowest, ${lo} oz/hr`);
  if (hi !== null && app.fluidPlan > hi + 1e-9) a10.push(`fluid ${r1(app.fluidPlan)} oz/hr is above the highest, ${hi} oz/hr`);
  if ((app.fluidLimit || null) !== (exp.fluidLimit || null)) a10.push(`held ${app.fluidLimit ? 'at the ' + app.fluidLimit : 'by no limit'}, expected ${exp.fluidLimit ? 'at the ' + exp.fluidLimit : 'no limit'}`);
  out.push(a10.length ? res('A10', 'fail', `${label}: ${a10.join('; ')}. Rule A10: ${RULES.A10}`) : res('A10', 'pass', lo !== null || hi !== null ? `limits ${lo ?? '–'}–${hi ?? '–'} oz/hr${exp.fluidLimit ? ', at the ' + exp.fluidLimit : ''}` : ''));

  // A11 · the sweat grid (item 39; item 56: the box of the ride's heat band, no blending)
  if (app.sweat || isNum(ride.fluidOverrideOzHr)) {
    const a11 = [], g = app.grid;
    if (!isNum(ride.fluidOverrideOzHr) && !exp.hourly) { // a ride planned hour by hour is checked hour by hour (A12)
      const want = gridFluid(g, ride.effort, exp.weather.band);
      if (Math.abs(app.fluidWant - want) > 0.01) a11.push(`fluid before limits ${r1(app.fluidWant)} oz/hr, the ${exp.weather.band} box gives ${r1(want)}`);
    }
    if (!isNum(ride.fluidOverrideOzHr) && exp.sweat && !exp.sweat.hourly && app.sweat && (app.sweat.band !== exp.sweat.band || app.sweat.own !== exp.sweat.own)) a11.push(`source ${app.sweat.own ? 'own' : 'auto'} ${app.sweat.band}, expected ${exp.sweat.own ? 'own' : 'auto'} ${exp.sweat.band}`);
    if (app.sodiumConc > 0 && Math.abs(app.tSodium - app.sodiumConc * app.fluidPlan * OZ_ML / 1000) > 0.5) a11.push(`sodium ${r1(app.tSodium)} mg/hr ≠ ${app.sodiumConc} mg/L × ${r1(app.fluidPlan)} oz/hr`);
    out.push(a11.length ? res('A11', 'fail', `${label}: ${a11.join('; ')}. Rule A11: ${RULES.A11}`) : res('A11', 'pass'));
  }

  // A12 · hour by hour (item 49)
  if (exp.hourly || app.hourly) {
    const a12 = [], E = exp.hourly, A = app.hourly;
    if (!E !== !A) a12.push(E ? 'the rules plan this ride hour by hour, the app on one temperature' : 'the app plans hour by hour, the rules on one temperature');
    else {
      if (A.hours.length !== E.hours.length) a12.push(`${A.hours.length} hours, expected ${E.hours.length}`);
      E.hours.forEach((h, k) => { const x = A.hours[k]; if (!x) return;
        if (Math.abs(x.oz - h.fluidOz) > 0.01) a12.push(`hour ${k + 1} (${r1(h.tempF)} °F${isNum(h.wbgtF) ? `, WBGT ${r1(h.wbgtF)}` : ''}, ${h.band}): ${r1(x.oz)} oz/hr, the grid and limits give ${r1(h.fluidOz)}`);
        if ((x.lim || null) !== (h.limit || null)) a12.push(`hour ${k + 1} held ${x.lim ? 'at the ' + x.lim : 'by no limit'}, expected ${h.limit ? 'at the ' + h.limit : 'none'}`);
        if (Math.abs(x.frac - h.frac) > 1e-3) a12.push(`hour ${k + 1} is ${r1(x.frac * 60)} min, expected ${r1(h.frac * 60)}`); });
      const sumOz = A.hours.reduce((a, h) => a + h.oz * h.frac, 0);
      if (Math.abs(sumOz - P.fluidOz * H) > 0.01) a12.push(`the hours add up to ${r1(sumOz)} oz, the ride plans ${r1(P.fluidOz * H)} oz`);
      if (!app.srcHourly !== !(E.rows && E.rows.length > 1)) a12.push(E.rows.length > 1 ? 'Results doesn\'t name the source "hour by hour" (the hours span bands)' : 'Results names "hour by hour" for a ride in one band');
      if (app.sodiumConc > 0 && Math.abs(app.tSodium - app.sodiumConc * app.fluidPlan * OZ_ML / 1000) > 0.5) a12.push(`sodium ${r1(app.tSodium)} mg/hr ≠ ${app.sodiumConc} mg/L × ${r1(app.fluidPlan)} oz/hr`);
      const G = app.lp.gels; G.forEach((g, k) => { if (k && g.t - G[k - 1].t < 15 - 1e-9) a12.push(`gels at ${G[k - 1].t} and ${g.t} min, less than 15 min apart`); });
      // (item 52: the gels per hour and their minutes are checked by A13 and G9 on every ride)
      // refills (no stops, no owned or role bottles): when the hours' fluid empties the cages
      const ownOther = (athlete.bottlesOwned || []).some(b => b.count > 0 && Math.abs(b.oz - athlete.planBottleOz) > 0.1); // owned bottles of another size are packed first (R12)
      if (!(ride.stops || []).length && !app.water && !app.mine && !ownOther && !app.leftover && E.hours.every(h => isNum(h.mixedOz))) {
        const cg = exp.cages, oz = athlete.planBottleOz, at = v => { let acc = 0, t = 0; for (const h of E.hours) { const len = h.frac * 60, got = h.mixedOz * h.frac; if (got > 0 && acc + got >= v - 1e-9) return t + len * (v - acc) / got; acc += got; t += len; } return t; };
        app.lp.legs.slice(1).forEach((L, k) => { const want = at((k + 1) * cg * oz); if (Math.abs(L.t0 - want) > 0.5) a12.push(`refill ${k + 1} at ${r1(L.t0)} min, the hours' fluid empties the cages at ${r1(want)} min`); });
      }
    }
    out.push(a12.length ? res('A12', 'fail', `${label}: ${a12.join('; ')}. Rule A12: ${RULES.A12}`) : res('A12', 'pass'));
  }

  // A13 · the ride-day plan (item 52)
  if (app.lp.day) {
    const a13 = [], j15 = [], j16 = [], D = app.lp.day, dur = exp.durationMin, Hs = D.hours, ref = ref52;
    // whole gels per clock hour, every gel counted in its hour, never over the hour's room (extra gels for a short leg aside)
    const nSum = Hs.reduce((a, h) => a + h.n, 0), extras = app.lp.gels.some(g => g.extra);
    if (Hs.some(h => !Number.isInteger(h.n) || h.n < 0)) a13.push('an hour without a whole number of gels');
    if (nSum !== app.lp.gels.length) a13.push(`the hours hold ${nSum} gels, the plan lists ${app.lp.gels.length}`);
    if (!extras && !ride.myBottles && exp.gels.rooms) Hs.forEach((h, k) => { if (h.n > exp.gels.rooms[k]) a13.push(`hour ${k + 1} has ${h.n} gels, room for ${exp.gels.rooms[k]} (R18.2)`); });
    // the plan's kind: each bottle its own strength unless one of R18.6's reasons
    const why = exp.r19 ? [] : dayReasons(ride, app), mode = why.length ? 'same' : 'stretch'; // item 56: the default plan (R19) is each bottle its own strength
    if (exp.gels.count != null && !ride.myBottles && D.mode !== mode) a13.push(`${D.mode === 'same' ? 'one recipe in every bottle' : 'each bottle its own strength'} (${D.why || 'no reason'}), the rules say ${mode === 'same' ? `one recipe (${why.join(', ')})` : 'each bottle its own strength'}`);
    // the gels per hour as the rules put them, and (each bottle its own strength) each bottle's carbs
    const refMode = ref && ref.mode === 'r19' ? 'stretch' : ref && ref.mode, rn = ref && ref.mode === 'r19' ? 'R19' : ref && ref.mode === 'stretch' ? 'R18.6' : 'R18.4';
    if (ref && (refMode === 'stretch' || !(app.tail > 0.05)) && D.mode === refMode) {
      const got = Hs.map(h => h.n).join(' '), want = ref.counts.join(' ');
      if (got !== want && !extras) a13.push(`gels per hour ${got}, ${rn} gives ${want}`);
      if (refMode === 'stretch' && got === want) {
        const mix = D.rows.filter(x => !x.water);
        mix.forEach((x, q) => { if (Math.abs(x.carbs - ref.carbs[q]) > 0.05) a13.push(`the ${fmtT(x.start)} bottle carries ${r1(x.carbs)} g, its stretch gives ${r1(ref.carbs[q])} g (${rn})`); });
      }
    }
    // never stronger than the limit (each bottle its own strength: today's strength S; R19: each bottle's own cap, A2)
    if (D.mode === 'stretch' && !exp.r19) D.rows.filter(x => !x.water && x.oz > 0).forEach(x => { const c = x.carbs / (x.oz * OZ_ML) * 100; if (c > exp.strength.bottleLimitPct + 0.05) a13.push(`the ${fmtT(x.start)} bottle is ${r1(c)}%, over the ${exp.strength.bottleLimitPct}% limit`); });
    // each hour within ±5 g of the target
    Hs.forEach((h, k) => { const m = h.total - h.target; if (Math.abs(m) <= 5 + 1e-6 || !exp.gels.allowed) return;
      const txt = `${h.frac < 0.999 ? 'the last ' + Math.round(h.frac * 60) + ' min' : 'hour ' + (k + 1)} ${m > 0 ? '+' : ''}${r1(m)} g`;
      if (exp.r19) return; // (R19: each full hour within half a gel, A14)
      if (D.mode === 'stretch') j15.push(txt); else j16.push(txt); });
    // bottle starts: on the hour within 5 min of it, else to 5 min, where the bottles before them run out; stops the same
    const legStart = new Map(); D.rows.forEach(x => { if (!legStart.has(x.leg)) legStart.set(x.leg, x.start); });
    D.rows.filter(x => !x.water).forEach((x, q, arr) => { const first = q === 0 || arr[q - 1].leg !== x.leg;
      const want = first ? (x.leg === 0 ? 0 : snap5(x.raw)) : Math.max(legStart.get(x.leg), snap5(x.raw));
      if (Math.abs(x.start - want) > 1e-6) a13.push(`a bottle starts at ${fmtT(x.start)}, ${r1(x.raw)} min gives ${fmtT(want)} (R18.5)`); });
    D.stops.forEach(st => { if (Math.abs(st.t - snap5(st.raw)) > 1e-6) a13.push(`a stop at ${fmtT(st.t)}, ${r1(st.raw)} min gives ${fmtT(snap5(st.raw))}`); });
    // …where the bottles before them run out, on the rules' fluid (no water bottles, no My bottles, nothing cut off the end)
    if (!app.water && !app.mine && !(app.tail > 0.05) && !app.leftover && exp.mixedFluidOzPerHr != null) {
      const E = exp.hourly, ozAt = t => { if (!E || !E.hours.every(h => isNum(h.mixedOz))) return exp.mixedFluidOzPerHr * t / 60; let acc = 0, a = 0; for (const h of E.hours) { const len = h.frac * 60; acc += h.mixedOz * Math.max(0, Math.min(t, a + len) - a) / 60; a += len; } return acc; };
      const legs = new Map(); D.rows.filter(x => !x.water).forEach(x => { if (!legs.has(x.leg)) legs.set(x.leg, []); legs.get(x.leg).push(x); });
      for (const [k, list] of legs) { const L = app.lp.legs.find(l => l.k === k); if (!L) continue; let used = 0;
        list.forEach((x, m) => { if (m > 0) { const drunk = ozAt(x.raw) - ozAt(L.t0); if (Math.abs(drunk - used) > 0.2) a13.push(`the ${fmtT(x.start)} bottle: ${r1(drunk)} oz drunk by ${r1(x.raw)} min, the bottles before it hold ${r1(used)} oz`); } used += x.oz; }); }
    }
    // caffeine: R18.3's times, none in the last 60 min, 45 min apart, within the limit
    const cafG = app.lp.gels.filter(g => g.caffeine > 0).map(g => g.t).sort((a, b) => a - b), cafMg = app.lp.gels.reduce((a, g) => a + (g.caffeine || 0), 0);
    if (cafG.some(t => t > dur - 60 + 1e-9)) a13.push(`a caffeine gel at ${fmtT(Math.max(...cafG))}, in the last 60 min`);
    cafG.forEach((t, k) => { if (k && t - cafG[k - 1] < 45 - 1e-9) a13.push(`caffeine at ${fmtT(cafG[k - 1])} and ${fmtT(t)}, under 45 min apart`); });
    if (exp.caffeine && isNum(exp.caffeine.maxMg) && cafMg > exp.caffeine.maxMg + 1e-9) a13.push(`${cafMg} mg caffeine, over the ${exp.caffeine.maxMg} mg limit`);
    if (exp.caffeine && exp.gels.allowed && cafG.join() !== exp.caffeine.timesMin.join()) a13.push(`caffeine at ${cafG.map(fmtT).join(', ') || 'none'}, R18.3 gives ${exp.caffeine.timesMin.map(fmtT).join(', ') || 'none'}`);
    if (a13.length) out.push(res('A13', 'fail', `${label}: ${a13.slice(0, 4).join('; ')}. Rule A13: ${RULES.A13}`));
    else if (j15.length) out.push(res('A13', 'judgment', `${label}: ${j15.join(', ')} off the ${r0(exp.perHour.carbsG)} g/hr target; no single gel moved, added or taken away does better without passing the ${exp.strength.suggestPct}% limit (R18.6).`, 'J15'));
    else if (j16.length) out.push(res('A13', 'judgment', `${label}: one recipe in every bottle (${D.why}): ${j16.join(', ')} off the ${r0(exp.perHour.carbsG)} g/hr target; the gels per hour follow the hours' gaps as a running total (R18.4).`, 'J16'));
    else out.push(res('A13', 'pass'));
  }

  // A14 · hour by hour on the default plan (item 56, R19.6)
  if (exp.r19 && app.lp.day) {
    const a14 = [], j17 = [], D = app.lp.day, R = ref52, Hs = D.hours, extras = app.lp.gels.some(g => g.extra);
    if (!D.r19 || !R || R.mode !== 'r19') a14.push('the rules plan this ride hour by hour (R19), the app does not');
    else {
      // no hour over 90 g (the gels the hour takes)
      Hs.forEach((h, k) => { if (h.carbs > 90 * h.frac + 1e-6 && h.n > h.caf) a14.push(`${h.frac < 0.999 ? 'the last ' + Math.round(h.frac * 60) + ' min' : 'hour ' + (k + 1)} takes ${r1(h.carbs)} g of gels, over 90 g an hour`); });
      // each full hour within half a gel of its target, unless all its room is used or one more gel would pass 90 g
      // (an hour R19.3 / R19.4 itself leaves further off, when the rider's minimum, the caffeine doses or a gel the ride needed land in it, is
      // reported as J17, never hidden: the app's hour must still be the rules' hour)
      if (!extras) Hs.forEach((h, k) => { const q = R.hours[k]; if (h.frac < 1 - 1e-9 || !(q.room > 0)) return; const m = h.total - h.target;
        if (Math.abs(h.total - R.totH[k]) > 0.5) a14.push(`hour ${k + 1} carries ${r1(h.total)} g, R19 gives ${r1(R.totH[k])} g`);
        else if (Math.abs(m) > R.g / 2 + 0.05 && !(m < 0 && (h.n >= q.room || h.carbs + R.g > 90 + 1e-6))) j17.push(`hour ${k + 1} ${m > 0 ? '+' : ''}${r1(m)} g`); });
      // sodium per bottle (R19.5): within one unit (25 mg of table salt) of its target, none when its mix and gels alone pass it
      const S = R.sodium, rows = D.rows.filter(x => !x.water);
      // ("Same recipe in every bottle", R19.7: one recipe, salt included: each bottle's salt is its share of the bottles' needs by its water, so
      // a bottle is checked against R19.7's share, not its own hours)
      if (S.length && S[0].kind !== 'none' && S[0].unitMg && R.same) rows.forEach((x, q) => { const t = S[q]; if (!t) return;
        const d = t.kind === 'grams' ? Math.abs((x.salt || 0) - t.units) * t.unitMg : Math.abs((x.salt || 0) - t.units);
        if (d > (t.kind === 'grams' ? 26 : 1e-9)) a14.push(`the ${fmtT(x.start)} bottle: ${r1(x.salt)} ${R.topUpUnit || 'unit'} of salt, one recipe in every bottle asks ${t.kind === 'grams' ? r1(t.units) + ' g' : t.units} (R19.7)`); });
      else if (S.length && S[0].kind !== 'none' && S[0].unitMg) rows.forEach((x, q) => { const t = S[q]; if (!t) return;
        const tol = t.kind === 'grams' ? 25 : t.unitMg, tot = x.na + t.gelNa;
        if (t.need <= 0 ? x.salt > 1e-9 : Math.abs(tot - t.target) > tol + 1) a14.push(`the ${fmtT(x.start)} bottle: ${r0(tot)} mg sodium with its gels (${r1(x.salt)} ${R.topUpUnit || 'unit'}), its hours ask ${r0(t.target)} mg (R19.5: ${t.kind === 'grams' ? r1(t.units) + ' g' : t.units})`); });
    }
    out.push(a14.length ? res('A14', redWarn(app).length ? 'warned' : 'fail', `${label}: ${a14.slice(0, 4).join('; ')}. Rule A14: ${RULES.A14}`)
      : j17.length ? res('A14', 'judgment', `${label}: ${j17.join(', ')} off the ${r0(exp.perHour.carbsG)} g/hr target, more than half a gel: whole gels per hour with the rider's minimum (${ride.gels.minPerHr}/hr), the caffeine doses and the ride's balance put it there (R19.3); the bottle carries what is left.`, 'J17')
      : res('A14', 'pass'));
  }

  // G4 · gels inside the ride (also always true)
  const dur = exp.durationMin, outside = app.lp.gels.filter(g => g.t < 0 || g.t > dur);
  const late = app.lp.gels.filter(g => g.t > Math.max(dur - 30, g.extra ? 5 : Math.min(ride.gels.firstMin, dur)) + 1e-9);
  if (outside.length) out.push(res('G4', 'fail', `${label}: a gel at ${outside[0].t} min, outside the ${dur}-min ride. Rule G4: ${RULES.G4}`));
  else if (late.length) out.push(res('G4', 'fail', `${label}: ${late[0].extra ? 'an extra' : 'a planned'} gel at ${late[0].t} min, within 30 min of the finish (${dur} min). Rule R7: ${RULES.G4}`));
  else out.push(res('G4', 'pass'));
  return out;
}

// ---- golden-ride checks (expected values from the reference) -------------------------------------------------------------------------
export function goldenChecks({ label, athlete, ride, exp, app, checks = [], spec = null }) {
  const out = [];
  if (app.crash) return out;
  // G2 · refused for unknown carbs
  if (exp.refused) {
    const txt = (app.errs || []).join(' ');
    const ok = app.errs && /carbs unknown/i.test(txt) && exp.refused.products.every(n => txt.includes(n));
    out.push(ok ? res('G2', 'pass') : res('G2', 'fail', `${label}: expected the plan refused with "${exp.refused.products.join(', ')}: carbs unknown", got ${app.errs ? `"${txt}"` : 'a plan'}. Rule R14: ${RULES.G2}`));
    return out;
  }
  if (app.errs) return out;
  out.push(app.durMin === exp.durationMin ? res('G1', 'pass') : res('G1', 'fail', `${label}: ride length ${app.durMin} min, expected ${exp.durationMin} min. Rule R2: ${RULES.G1}`));
  let gExp = exp.gels;
  if (app.tail > 0.05 && gExp.count != null) gExp = refExpected(athlete, { ...ride, fluidOverrideOzHr: app.fluidOzHr - app.tail / app.H }).gels; // R13: planned on the fluid carried
  // item 52: with each bottle its own strength (R18.6) the count and the gels per hour come from the bottles' stretches
  const ref = app.lp.day ? refDay({ athlete, ride, exp, app }) : null, stretch = !!(ref && (ref.mode === 'stretch' || ref.mode === 'r19'));
  const wantN = stretch ? ref.count : gExp.count, wantT = stretch ? ref.timesMin : gExp.timesMin;
  if (gExp.count != null) out.push(app.engine.gels === wantN ? res('G3', 'pass', ref && ref.mode === 'r19' ? 'hour by hour (R19.3)' : app.tail > 0.05 ? 'on the fluid carried' : stretch ? 'each bottle its own strength' : '')
    : res('G3', 'fail', `${label}: ${app.engine.gels} gels, expected ${wantN}${stretch ? ` (${ref.mode === 'r19' ? 'R19.3' : 'R18.6'}: per hour ${ref.counts.join(' ')})` : ''} (reference times ${(wantT || []).join(', ')} min; app ${app.engine.times.join(', ')} min)${app.tail > 0.05 ? ` on the ${r0(app.fluidOzHr * app.H - app.tail)} oz carried` : ''}. Rule R6/R18: ${RULES.G3}`));
  // G9 · the gel minutes R18.7 gives (item 52; item 49: hour by hour), whenever the count is the rules' and no extra gel joined a leg
  if (Array.isArray(wantT) && app.engine.gels === wantN && !app.lp.gels.some(g => g.extra) && (stretch || !(app.tail > 0.05))) {
    const want = wantT.join(', '), got = app.engine.times.join(', ');
    out.push(want === got ? res('G9', 'pass') : res('G9', 'fail', `${label}: gels at ${got} min, R18.7 puts them at ${want} min. Rule R18.7: ${RULES.G9}`));
  }
  // G5 · caffeine (item 52: R18.3's times)
  const cafGels = app.lp.gels.filter(g => g.caffeine > 0);
  if (!exp.caffeine) out.push(cafGels.length ? res('G5', 'fail', `${label}: caffeine is off but the plan has ${cafGels.length} caffeinated gel(s). Rule R8: ${RULES.G5}`) : res('G5', 'pass'));
  else {
    const C = exp.caffeine, want = C.timesMin.slice().sort((a, b) => a - b), got = cafGels.map(g => g.t).sort((a, b) => a - b);
    const mg = cafGels.reduce((a, g) => a + g.caffeine, 0);
    const p = [];
    if (want.join() !== got.join()) p.push(`doses at ${got.join(', ') || 'none'} min, expected ${want.join(', ') || 'none'} min`);
    if (isNum(C.maxMg) && mg > C.maxMg) p.push(`${mg} mg caffeine, over the ${C.maxMg} mg limit`);
    if (got.some(t => t > exp.durationMin - 60 + 1e-9)) p.push('a dose in the last 60 min');
    out.push(p.length ? res('G5', 'fail', `${label}: ${p.join('; ')}. Rule R18.3: ${RULES.G5}`) : res('G5', 'pass', want.length ? `at ${want.map(fmtT).join(', ')}` : ''));
  }
  // G6 · plain water
  if (exp.water.n > 0 || app.water) {
    const n = app.water ? app.water.n : 0, oz = app.water ? app.water.ozHr : 0, p = [];
    if (n !== exp.water.n) p.push(`${n} plain water bottle(s), expected ${exp.water.n}`);
    if (exp.water.ozPerHr != null && Math.abs(oz - exp.water.ozPerHr) > 0.05) p.push(`water ${r1(oz)} oz/hr, expected ${r1(exp.water.ozPerHr)} oz/hr`);
    out.push(p.length ? res('G6', 'fail', `${label}: ${p.join('; ')}. Rule R12: ${RULES.G6}`) : res('G6', 'pass'));
  }
  // G7 · sodium top-up (item 52: from the per-bottle plan's gels and bottle carbs when each bottle has its own strength)
  const U = ref && ref.mode === 'r19' ? null : stretch ? ref.topUp : exp.topUp;
  if (ref && ref.mode === 'r19') { // item 56 (R19.5): the top-up bottle by bottle
    const rows = app.lp.day.rows.filter(x => !x.water), bad = [];
    rows.forEach((x, q) => { const t = ref.sodium[q], want = t ? t.units : 0; if (Math.abs(x.salt - want) > (t && t.kind === 'grams' ? 0.05 : 1e-6)) bad.push(`the ${fmtT(x.start)} bottle gets ${r1(x.salt)}, R19.5 gives ${t && t.kind === 'grams' ? r1(want) : want} (need ${r0(t ? t.need : 0)} mg)`); });
    out.push(!bad.length ? res('G7', 'pass', 'per bottle') : redWarn(app).length ? res('G7', 'judgment', `${label}: ${bad.slice(0, 3).join('; ')}; the plan shows a red warning (${redWarn(app).map(w => w.key).join(', ')}).`, 'J9')
      : res('G7', 'fail', `${label}: ${bad.slice(0, 3).join('; ')}. Rule R19.5: ${RULES.G7}`));
  }
  else if (U && U.kind !== 'none' && U.count != null && redWarn(app).length) {
    const given = app.lp.bottles.reduce((a, b) => a + (b.salt || 0), 0);
    const legMissNa = app.lp.legs.reduce((a, L) => a + (isNum(L.missNa) ? L.missNa : 0), 0);
    if (Math.abs(given - U.count) * U.unitMg > legMissNa + U.unitMg + 1) out.push(res('G7', 'fail', `${label}: ${r1(given)} units of top-up vs ${U.count} for the ride, more than the warned legs explain (${r0(legMissNa)} mg). Rule R9: ${RULES.G7}`));
    else if (Math.abs(given - U.count) > (U.kind === 'grams' ? 0.05 : 1e-6)) out.push(res('G7', 'judgment', `${label}: ${r1(given)} units of top-up vs ${U.count} for the whole ride; the plan shows a red warning (${redWarn(app).map(w => w.key).join(', ')}) and plans only what the bike carries.`, 'J9'));
    else out.push(res('G7', 'pass'));
  } else if (U && U.kind !== 'none' && U.count != null) {
    const given = app.lp.bottles.reduce((a, b) => a + (b.salt || 0), 0);
    const tol = U.kind === 'grams' ? 0.05 : 1e-6;
    // A refill skipped in the last 30 min moves some carbs from drink mix into gels, which brings less sodium: R9 then sizes the top-up
    // from the gels and mix actually planned. Check it against that gap.
    const saltNa = app.lp.bottles.reduce((a, b) => a + (b.saltNa || 0), 0), gapNow = exp.totals.sodiumMg - (app.lp.tot.na - saltNa);
    const step = U.kind === 'capsule' || U.kind === 'whole-units' ? 1 : U.kind === 'half-units' ? 0.5 : 0, want = step ? Math.max(0, Math.round(gapNow / U.unitMg / step) * step) : gapNow / U.unitMg;
    if (Math.abs(given - U.count) > tol && hasTail(app) && Math.abs(given - want) <= tol + 1e-6) out.push(res('G7', 'pass', `sized from the gels and mix actually planned: ${given} for a ${r0(gapNow)} mg gap`));
    else out.push(Math.abs(given - U.count) <= tol ? res('G7', 'pass')
      : res('G7', 'fail', `${label}: ${r1(given)} ${U.kind === 'grams' ? 'g' : 'units'} of top-up in the bottles, expected ${U.kind === 'grams' ? r1(U.count) : U.count} (gap ${r0(U.gapMg)} mg ÷ ${U.unitMg} mg). Rule R9: ${RULES.G7}`));
  } else if (U && U.kind === 'none') {
    const given = app.lp.bottles.reduce((a, b) => a + (b.salt || 0), 0);
    out.push(given > 1e-9 ? res('G7', 'fail', `${label}: the plan adds a top-up (${r1(given)}) but the rules size none (${U.reason}). Rule R9/R14: ${RULES.G7}`) : res('G7', 'pass'));
  }
  // G10 · the hand numbers from the item (item 56: tests/golden/rides.json "spec", written from the item's text, never from either calculator)
  if (spec) {
    const p = [], D = app.lp.day, f = r1;
    if (spec.fluidByHour) { const got = app.hourly ? app.hourly.hours.map(h => h.oz) : spec.fluidByHour.map(() => app.fluidPlan);
      if (got.length !== spec.fluidByHour.length || got.some((v, k) => Math.abs(v - spec.fluidByHour[k]) > 0.05)) p.push(`fluid by hour ${got.map(f).join(' · ')}, the item says ${spec.fluidByHour.join(' · ')}`); }
    if (isNum(spec.gels) && app.lp.gels.length !== spec.gels) p.push(`${app.lp.gels.length} gels, the item says ${spec.gels}`);
    if (isNum(spec.caffeineGels) && app.lp.gels.filter(g => g.caffeine > 0).length !== spec.caffeineGels) p.push(`${app.lp.gels.filter(g => g.caffeine > 0).length} caffeine gels, the item says ${spec.caffeineGels}`);
    if (spec.bottlePct && D) { const got = D.rows.filter(x => !x.water).map(x => (x.oz > 0 ? x.carbs / (x.oz * OZ_ML) * 100 : 0));
      if (got.length !== spec.bottlePct.length || got.some((v, k) => Math.abs(v - spec.bottlePct[k][0]) > spec.bottlePct[k][1] + 1e-9)) p.push(`bottles at ${got.map(f).join('% · ')}%, the item says about ${spec.bottlePct.map(x => x[0]).join('% · ')}%`); }
    if (spec.tailUnderG && D && Math.abs((D.tail || 0) - spec.tailUnderG[0]) > spec.tailUnderG[1]) p.push(`the last 30 min ${f(D.tail || 0)} g under, the item says about ${spec.tailUnderG[0]} g`);
    if (isNum(spec.maxHourG) && D) D.hours.forEach((h, k) => { if (h.carbs > spec.maxHourG * h.frac + 1e-6) p.push(`hour ${k + 1} takes ${f(h.carbs)} g of gels`); });
    // item 57
    if (spec.gelsPerHour && D && D.hours.map(h => h.n).join() !== spec.gelsPerHour.join()) p.push(`gels per hour ${D.hours.map(h => h.n).join(' · ')}, the item says ${spec.gelsPerHour.join(' · ')}`);
    if (spec.perHourTotal && D && D.hours.some((h, k) => Math.abs(h.total - spec.perHourTotal[k]) > 0.5)) p.push(`each hour ${D.hours.map(h => f(h.total)).join(' · ')} g, the item says ${spec.perHourTotal.join(' · ')}`);
    if (isNum(spec.maxHourTotal) && D) D.hours.forEach((h, k) => { if (h.total > spec.maxHourTotal * h.frac + 0.05) p.push(`hour ${k + 1} carries ${f(h.total)} g, over ${spec.maxHourTotal} g an hour`); });
    if (spec.noThreeAndOne && D) { const full = D.hours.filter(h => h.frac > 0.999).map(h => h.n); if (Math.max(...full) >= 3 && Math.min(...full) <= 1) p.push(`gels per hour ${full.join(' · ')}: an hour with 3 while another has 1`); }
    if (spec.totalCarbs && Math.abs(app.lp.tot.carbs - spec.totalCarbs[0]) > spec.totalCarbs[1]) p.push(`${f(app.lp.tot.carbs)} g carbs, the item says ${spec.totalCarbs[0]}`);
    if (isNum(spec.lastGelMin)) { const last = Math.max(...app.lp.gels.map(x => x.t)); if (Math.abs(last - spec.lastGelMin) > 1e-6) p.push(`the last gel at ${fmtT(last)}, the item says ${fmtT(spec.lastGelMin)}`); }
    if (spec.notesRe && app.display && !new RegExp(spec.notesRe).test(app.display.rNotes || '')) p.push(`Why these numbers doesn't say /${spec.notesRe}/`);
    out.push(p.length ? res('G10', 'fail', `${label}: ${p.join('; ')}. Rule G10: ${RULES.G10}`) : res('G10', 'pass', 'the item\'s numbers'));
  }
  // G8 · must warn
  if (checks.includes('cage-warning')) {
    const w = app.lp.warn.find(x => x.kind === 'bad' && (x.key === 'fit' || /^short-/.test(x.key)) && x.fixes.length);
    out.push(w ? res('G8', 'pass') : res('G8', 'fail', `${label}: expected the cage warning with fixes, got none. Rule A6/R12: ${RULES.G8}`));
  }
  return out;
}

// ---- screen checks (golden rides, render on) -----------------------------------------------------------------------------------------
export function screenChecks({ label, athlete, ride, exp, app }) {
  const out = [], D = app.display;
  if (!D || app.errs || app.crash) return out;
  if (D.crash) return [res('A8', 'fail', `${label}: the Results screen failed to draw: ${String(D.crash).split('\n')[0]}`)];
  // N1 on screen: never NaN; unknown sodium reads "unknown"
  const shown = ['rTopFix', 'rNutWarn', 'rNutBody', 'rGelsBody', 'totGrid', 'totHr', 'copy'].map(k => D[k] || '').join(' | ');
  if (/NaN|Infinity|undefined/.test(shown)) out.push(res('N1', 'fail', `${label}: the screen shows "${(shown.match(/[^|]{0,40}(NaN|Infinity|undefined)[^|]{0,20}/) || [''])[0].trim()}". Rule R14: ${RULES.N1}`));
  else if (exp.unknown.sodium.length && !/unknown/i.test(D.totGrid + ' ' + D.totHr)) out.push(res('N1', 'fail', `${label}: ${exp.unknown.sodium.join(', ')} has no sodium value; the totals should read "unknown" for sodium. Got: "${D.totGrid}". Rule R14: ${RULES.N1}`));
  else out.push(res('N1', 'pass', 'screen'));
  // A11 on screen (item 39): the source next to the fluid per hour
  if (D.totHr !== undefined) { const want = isNum(ride.fluidOverrideOzHr) ? 'your override' : exp.sweat && exp.sweat.hourly ? 'hour by hour' : exp.sweat ? (exp.sweat.own ? `your ${{ cold: 'Cold', mild: 'Moderate', hot: 'Hot' }[exp.sweat.band]} · ${{ recovery: 'Recovery', steady: 'Steady', hard: 'Hard' }[ride.effort]}` : 'auto') : null;
    out.push(!want || (D.totHr || '').includes('· ' + want) ? res('A11', 'pass', want ? `screen: "· ${want}"` : 'screen')
      : res('A11', 'fail', `${label}: the fluid per hour reads "${D.totHr}"; expected "· ${want}". Rule A11: ${RULES.A11}`)); }
  // A10 on screen: "at your floor" / "at your ceiling" next to the fluid per hour exactly when a limit holds it
  { const tag = /at your (floor|ceiling)/.exec(D.totHr || ''), want = exp.fluidLimit || null;
    out.push((tag ? tag[1] : null) === want ? res('A10', 'pass', want ? `screen: "at your ${want}"` : 'screen')
      : res('A10', 'fail', `${label}: the fluid per hour reads "${D.totHr}"; expected ${want ? `"at your ${want}"` : 'no limit tag'}. Rule A10: ${RULES.A10}`)); }
  // A5 · scoops: nearest quarter (q34) — the app follows item 27.4 (quarter or third)
  const sc = (D.scoops || []).map(s => {
    const m = /\(([^)]*) scoops?\)/.exec(s.text); if (!m || !s.scoopG) return null;
    const v = parseFrac(m[1]), q = scoopsCount(s.grams, s.scoopG), t = Math.round(s.grams / s.scoopG * 3) / 3;
    return { ...s, shown: v, quarter: q, third: t };
  }).filter(Boolean);
  const badS = sc.find(s => Math.abs(s.shown - s.quarter) > 1e-6);
  if (!badS) out.push(res('A5', 'pass', 'scoops'));
  else if (Math.abs(badS.shown - badS.third) < 1e-6) out.push(res('A5', 'judgment', `${label}: ${r1(badS.grams)} g = ${r1(badS.grams / badS.scoopG * 100) / 100} scoops shows as "${badS.text}" (nearest third); the nearest quarter would be ${badS.quarter}. q34 says quarter; item 27.4 says quarter or third.`, 'J2'));
  else out.push(res('A5', 'fail', `${label}: "${badS.text}" for ${r1(badS.grams)} g at ${badS.scoopG} g per scoop; expected ${badS.quarter} scoops. Rule A5: ${RULES.A5}`));
  // A7 on screen · every total shown (Totals, Details summary, the table's Total row) equals the items listed
  const T = app.lp.tot, H = app.H, nums = t => (t || '').match(/-?[\d,]*\.?\d+/g)?.map(x => +x.replace(/,/g, '')) || [];
  const grab = (t, re) => { const m = re.exec(t || ''); return m ? +m[1].replace(/,/g, '') : null; };
  const a7 = [], near = (shown, want, tol, what, where) => { if (shown != null && isNum(want) && Math.abs(shown - want) > tol) a7.push(`${where} shows ${shown} ${what}, the items add to ${r1(want)}`); };
  near(grab(D.totGrid, /([\d,]+) g carbs/), T.carbs, 0.5 + 1e-9, 'g carbs', 'Totals');
  near(grab(D.totGrid, /([\d,]+) mg sodium/), T.na, 0.5 + 1e-9, 'mg sodium', 'Totals');
  near(grab(D.totGrid, /([\d,]+) oz fluid/), T.oz, 0.5 + 1e-9, 'oz fluid', 'Totals');
  near(grab(D.rSummary, /([\d,.]+) g carbs, whole ride/), T.carbs, 0.5 + 1e-9, 'g carbs (whole ride)', 'Details');
  near(grab(D.rSummary, /([\d,.]+) mg sodium \/ hour/), isNum(T.na) ? T.na / H : NaN, 0.5 + 1e-9, 'mg sodium / hour', 'Details');
  const tf = nums(D.tableFoot); // Total | bottles | water | mix | gels | carbs | sodium | kcal
  // (the hourly table is the plan hour by hour; its Total row is the sum of its rows: checked for whole numbers under A8)
  out.push(a7.length ? res('A7', 'fail', `${label}: ${a7.join('; ')}. Rule A7: ${RULES.A7}`) : res('A7', 'pass', 'screen'));
  // A8 · grams to 1 g, ounces to 1 oz (table salt to 0.1 g is J8)
  const texts = { 'Bottles': D.rNutBody, 'Warnings': D.rNutWarn + ' ' + D.rTopFix, 'Gels': D.rGelsBody, 'Totals': D.totGrid + ' ' + D.totHr, 'Copy text': D.copy, 'Why these numbers': D.rNotes, 'Details': D.rSummary + ' ' + D.rSchedule };
  const hits = [];
  for (const [where, t] of Object.entries(texts)) {
    const re = /(\S*\s?\S*\s?)\b(\d+\.\d+)\s?(g|oz)\b(?!\/)/g; let m;
    while ((m = re.exec(t || ''))) hits.push({ where, txt: (m[1] + m[2] + ' ' + m[3]).trim(), salt: /salt/i.test(m[1] + (t || '').slice(re.lastIndex, re.lastIndex + 24)) });
  }
  if (tf.length >= 7) [[1, 'oz water'], [2, 'g mix'], [4, 'g carbs']].forEach(([k, u]) => { if (!Number.isInteger(tf[k])) hits.push({ where: "the hourly table's Total row", txt: `${tf[k]} ${u}`, salt: false }); });
  const hard = hits.filter(h => !h.salt);
  if (hard.length) out.push(res('A8', 'fail', `${label}: ${hard.slice(0, 3).map(h => `${h.where}: "${h.txt}"`).join('; ')}. Rule A8: ${RULES.A8}`));
  else if (hits.length) out.push(res('A8', 'judgment', `${label}: ${hits[0].where}: "${hits[0].txt}" (table salt to 0.1 g; 1 g of salt is 393 mg sodium).`, 'J8'));
  else out.push(res('A8', 'pass'));
  return out;
}

function parseFrac(s) {
  const F = { '¼': 0.25, '⅓': 1 / 3, '½': 0.5, '⅔': 2 / 3, '¾': 0.75 };
  const m = /^(\d*)([¼⅓½⅔¾]?)$/.exec(s.trim()); if (!m) return NaN;
  return (m[1] ? +m[1] : 0) + (m[2] ? F[m[2]] : 0);
}
