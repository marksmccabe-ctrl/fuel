// The always-true rules (tests/reference/RULES.md R16, A1–A9) and the golden-ride checks, as plain functions. Each check returns
// { id, title, status, msg } with status:
//   'pass'      the app follows the rule;
//   'fail'      the app breaks a written rule (the test fails);
//   'judgment'  outside the rule only where two written rules (or a rule and a deliberate app choice) collide; reported for Mark
//               (see tests/README.md, J1–J14), never a failure;
//   'warned'    outside the tolerance, but the plan shows a red warning that says so and offers fixes (A6), so nothing is hidden.
// Messages are plain words: which ride, expected vs actual, which rule.
import { product } from '../fixtures/load.mjs';
import { scoopsCount, OZ_ML, expected as refExpected } from '../reference/calc.js';

export const RULES = {
  A1: 'A plain water bottle contains only water.',
  A2: 'No mixed bottle exceeds the strength limit; extra carbs go to gels; with gels off the shortfall is shown.',
  A3c: 'Carbs per hour within ±2 g of the target (when gels are allowed).',
  A3s: 'Sodium per hour within ±5% of the target.',
  A3f: 'Fluid per hour within ±1 oz of the target.',
  A4: 'Bottle carbs = Σ(powder grams × that product\'s carbs per gram); powder grams are never counted as carbs.',
  A5: 'Whole capsules only; dissolved units in halves; scoop counts match the grams (nearest quarter).',
  A6: 'Bottles at the start never exceed the bike\'s cages; otherwise a cage warning with fixes is shown.',
  A7: 'Totals equal the sum of the items listed (bottles + baggies + gels).',
  A8: 'Grams shown to 1 g, ounces to 1 oz.',
  A9: 'Weather follows the band table (cold: fluid × 1.0).',
  A10: 'Fluid per hour never below the rider\'s lowest or above their highest (Settings › Fluid limits); Results says "at your floor" / "at your ceiling" when one holds it.',
  N1: 'No number in the plan is NaN or infinite; a missing label value shows "unknown".',
  G1: 'Ride length as the rules say (distance mode included).',
  G2: 'A gel or drink mix with no carbs value refuses the plan with "carbs unknown".',
  G3: 'Gel count as the rules say (rounding, hold, minimum, caffeine swap).',
  G4: 'Every gel inside the ride; plan gels no later than 30 min before the finish.',
  G5: 'Caffeine doses where the rules put them, under the limit, none after the cutoff.',
  G6: 'Plain water bottles: count and oz/hr as the rules say.',
  G7: 'Sodium top-up sized as the rules say.',
  G8: 'A ride that must warn shows the cage warning with fixes.',
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

// ---- the always-true rules (golden + random) -----------------------------------------------------------------------------------------
export function alwaysTrue({ label, athlete, ride, exp, app }) {
  const out = [];
  if (app.crash) return [res('N1', 'fail', `${label}: the app crashed: ${String(app.crash).split('\n')[0]}`)];
  if (exp.refused) return out; // nothing to plan (G2 checks the refusal)
  if (app.errs) return [res('N1', 'fail', `${label}: the app refused the plan (${app.errs.join(' ')}) but the rules can plan it.`)];
  const T = app.lp.tot, H = app.H;

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
  if (top > lim + 0.05) out.push(res('A2', 'fail', `${label}: bottle ${strongest.n} is ${r1(top)}%, over the ${lim}% limit (${lim === L ? 'the hard limit' : 'held at the strength for today, item 32.4'}). Expected ≤ ${lim}%, got ${r1(top)}%. Rule A2: ${RULES.A2}`));
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
    if (Math.abs(dc) <= 2 + 1e-9) out.push(res('A3c', 'pass'));
    else {
      const gel = product(athlete, ride.gels.gel), gel2 = product(athlete, ride.gels.second), halfGel = gel ? gel.carbsG / 2 / H : 0;
      const cafG = ride.caffeine && ride.caffeine.mode !== 'off' ? product(athlete, ride.caffeine.gel) : null; // R8: the caffeinated gel swaps into a slot
      const gelC = Math.max(gel ? gel.carbsG : 0, gel2 ? gel2.carbsG : 0, cafG && isNum(cafG.carbsG) ? cafG.carbsG : 0); // one whole gel, the biggest in use
      const legMissC = app.lp.legs.reduce((a, L) => a + (isNum(L.missCarbs) ? L.missCarbs : 0), 0);
      const msg = `${label}: carbs ${fmtH(c)} g/hr, expected ${fmtH(P.carbsG)} ±2 g/hr (${r0(T.carbs)} g for the ride vs ${r0(P.carbsG * H)} g).`;
      if (dc > 0 && app.lp.warn.some(w => w.key === 'mine-over')) out.push(res('A3c', 'warned', `${msg} My bottles: the rider's "Carbs in each" alone is over the target, and the plan says so.`));
      else if (dc > 0 && app.engine.bottleCarbs <= 0.5 && (app.engine.minForced || dc * H <= gelC + 1)) out.push(res('A3c', 'judgment', `${msg} The gels alone (whole gels${app.engine.minForced ? `, the rider's minimum of ${ride.gels.minPerHr}/hr` : ''}) carry more than the target; the bottles carry no carbs.`, 'J11'));
      else if (dc < 0 && app.engine.adjShort) out.push(res('A3c', 'warned', `${msg} The plan says so on screen ("Carbs land at … under the … suggested").`));
      else if (warned.length && Math.abs(dc * H) <= legMissC + gelC + 1) out.push(res('A3c', 'judgment', `${msg} The plan shows a red warning (${warned.map(w => w.key).join(', ')}); the warned legs miss ${r0(legMissC)} g.`, 'J9'));
      else if (ride.myBottles && Math.abs(dc) <= 2 + halfGel + 1e-6) out.push(res('A3c', 'judgment', `${msg} My bottles: fixed grams per carb bottle plus whole gels.`, 'J7'));
      else if (app.lp.legs.some(L => L.supply === 'aid')) out.push(res('A3c', 'judgment', `${msg} An aid-table stop: the table's drink is assumed to carry that leg's planned share (R12).`, 'J14'));
      else if (app.lp.legs.length > 1 && Math.abs(dc) <= 2 + halfGel + 1e-6) out.push(res('A3c', 'judgment', `${msg} Whole gels make up the carbs the legs' bottles can't carry (within half a gel for the ride).`, 'J12'));
      else out.push(res('A3c', 'fail', `${msg} Rule A3: ${RULES.A3c}`));
    }
  }
  if (!naUnknown) {
    const s = T.na / H, ds = (s - P.sodiumMg) / P.sodiumMg;
    if (Math.abs(ds) <= 0.05 + 1e-9) out.push(res('A3s', 'pass'));
    else {
      const msg = `${label}: sodium ${r0(s)} mg/hr, expected ${r0(P.sodiumMg)} mg/hr ±5% (${ds > 0 ? '+' : ''}${r1(ds * 100)}%).`;
      const tp = app.topup, unitMg = tp && tp.kind === 'unit' ? tp.na : 0;
      const miss = Math.abs(T.na - P.sodiumMg * H);
      const waterLeg = app.lp.legs.some(L => L.supply === 'water');
      if (ds < 0 && miss <= 25 + 1) out.push(res('A3s', 'judgment', `${msg} The gap is under the 25 mg a top-up needs (R9).`, 'J5'));
      else if (unitMg && tp.whole && miss <= unitMg / 2 + 1) out.push(res('A3s', 'judgment', `${msg} Whole capsules (${unitMg} mg each) can't land closer on this ride.`, 'J5'));
      else if (unitMg && !tp.whole && miss <= unitMg / 4 + 1) out.push(res('A3s', 'judgment', `${msg} Half ${tp.unit}s (${unitMg} mg each) can't land closer on this ride.`, 'J5'));
      else if (ds > 0 && app.engine.sodiumOver && !(tp && tp.mg > 0)) out.push(res('A3s', 'judgment', `${msg} The drink mix alone brings more sodium than the target; the app shows a red "Sodium is over your ceiling" note${ride.blendPartner ? '' : ' (no carb-only powder set to blend)'}.`, 'J6'));
      else if (ds < 0 && (ride.topUp === 'none' || app.saltUnknown) ) out.push(res('A3s', 'judgment', `${msg} No sodium top-up product is in use, so nothing can make up the gap.`, 'J10'));
      else if (warned.length && miss <= app.lp.legs.reduce((a, L) => a + (isNum(L.missNa) ? L.missNa : 0), 0) + (unitMg || 25) + 1) out.push(res('A3s', 'judgment', `${msg} The plan shows a red warning (${warned.map(w => w.key).join(', ')}).`, 'J9'));
      else if (ds > 0 && warned.length && extraNa(app) > 0 && miss <= extraNa(app) + (unitMg || 25) + 1) out.push(res('A3s', 'judgment', `${msg} The whole extra gels that make up the warned legs' missing carbs bring their own sodium (${r0(extraNa(app))} mg).`, 'J12'));
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
      else if (hasTail(app) && df < 0 && P.fluidOz * H - T.oz <= P.fluidOz * 0.5 + 1) out.push(res('A3f', 'judgment', `${msg} No refill in the last 30 min: the bottles after it are not carried.`, 'J4'));
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
    const step = salt.swallow ? 1 : 0.5;
    const off = app.lp.bottles.find(b => b.salt > 1e-9 && Math.abs(b.salt / step - Math.round(b.salt / step)) > 1e-6);
    out.push(off ? res('A5', 'fail', `${label}: bottle ${off.n}${off.drink ? ' (drunk at the start/stop)' : ''} gets ${off.salt} ${salt.unit}s; ${salt.swallow ? 'capsules come whole' : 'dissolved units come in halves'}. Rule A5: ${RULES.A5}`) : res('A5', 'pass'));
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

  // G4 · gels inside the ride (also always true)
  const dur = exp.durationMin, outside = app.lp.gels.filter(g => g.t < 0 || g.t > dur);
  const late = app.lp.gels.filter(g => g.t > Math.max(dur - 30, g.extra ? 5 : Math.min(ride.gels.firstMin, dur)) + 1e-9);
  if (outside.length) out.push(res('G4', 'fail', `${label}: a gel at ${outside[0].t} min, outside the ${dur}-min ride. Rule G4: ${RULES.G4}`));
  else if (late.length) out.push(res('G4', 'fail', `${label}: ${late[0].extra ? 'an extra' : 'a planned'} gel at ${late[0].t} min, within 30 min of the finish (${dur} min). Rule R7: ${RULES.G4}`));
  else out.push(res('G4', 'pass'));
  return out;
}

// ---- golden-ride checks (expected values from the reference) -------------------------------------------------------------------------
export function goldenChecks({ label, athlete, ride, exp, app, checks = [] }) {
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
  if (gExp.count != null) out.push(app.engine.gels === gExp.count ? res('G3', 'pass', app.tail > 0.05 ? 'on the fluid carried' : '')
    : res('G3', 'fail', `${label}: ${app.engine.gels} gels, expected ${gExp.count} (reference times ${(gExp.timesMin || []).join(', ')} min; app ${app.engine.times.join(', ')} min)${app.tail > 0.05 ? ` on the ${r0(app.fluidOzHr * app.H - app.tail)} oz carried` : ''}. Rule R6: ${RULES.G3}`));
  // G5 · caffeine
  const cafGels = app.lp.gels.filter(g => g.caffeine > 0);
  if (!exp.caffeine) out.push(cafGels.length ? res('G5', 'fail', `${label}: caffeine is off but the plan has ${cafGels.length} caffeinated gel(s). Rule R8: ${RULES.G5}`) : res('G5', 'pass'));
  else {
    const C = exp.caffeine, want = C.doses.map(d => d.slotMin).sort((a, b) => a - b), got = cafGels.map(g => g.t).sort((a, b) => a - b);
    const mg = cafGels.reduce((a, g) => a + g.caffeine, 0);
    const p = [];
    if (want.join() !== got.join()) p.push(`doses at ${got.join(', ') || 'none'} min, expected ${want.join(', ') || 'none'} min`);
    if (mg > C.maxMg) p.push(`${mg} mg caffeine, over the ${C.maxMg} mg limit`);
    out.push(p.length ? res('G5', 'fail', `${label}: ${p.join('; ')}. Rule R8: ${RULES.G5}`) : res('G5', 'pass'));
  }
  // G6 · plain water
  if (exp.water.n > 0 || app.water) {
    const n = app.water ? app.water.n : 0, oz = app.water ? app.water.ozHr : 0, p = [];
    if (n !== exp.water.n) p.push(`${n} plain water bottle(s), expected ${exp.water.n}`);
    if (exp.water.ozPerHr != null && Math.abs(oz - exp.water.ozPerHr) > 0.05) p.push(`water ${r1(oz)} oz/hr, expected ${r1(exp.water.ozPerHr)} oz/hr`);
    out.push(p.length ? res('G6', 'fail', `${label}: ${p.join('; ')}. Rule R12: ${RULES.G6}`) : res('G6', 'pass'));
  }
  // G7 · sodium top-up
  const U = exp.topUp;
  if (U && U.kind !== 'none' && U.count != null && redWarn(app).length) {
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
    const step = U.kind === 'capsule' ? 1 : U.kind === 'half-units' ? 0.5 : 0, want = step ? Math.max(0, Math.round(gapNow / U.unitMg / step) * step) : gapNow / U.unitMg;
    if (Math.abs(given - U.count) > tol && hasTail(app) && Math.abs(given - want) <= tol + 1e-6) out.push(res('G7', 'pass', `sized from the gels and mix actually planned: ${given} for a ${r0(gapNow)} mg gap`));
    else out.push(Math.abs(given - U.count) <= tol ? res('G7', 'pass')
      : res('G7', 'fail', `${label}: ${r1(given)} ${U.kind === 'grams' ? 'g' : 'units'} of top-up in the bottles, expected ${U.kind === 'grams' ? r1(U.count) : U.count} (gap ${r0(U.gapMg)} mg ÷ ${U.unitMg} mg). Rule R9: ${RULES.G7}`));
  } else if (U && U.kind === 'none') {
    const given = app.lp.bottles.reduce((a, b) => a + (b.salt || 0), 0);
    out.push(given > 1e-9 ? res('G7', 'fail', `${label}: the plan adds a top-up (${r1(given)}) but the rules size none (${U.reason}). Rule R9/R14: ${RULES.G7}`) : res('G7', 'pass'));
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
