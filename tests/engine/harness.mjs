// Runs the real app (index.html) in headless Chromium and asks its own engine for plans. Nothing is copied from the app: the page is the
// file in the repo, served at its own file:// URL with three test-only edits made in memory (never written to disk):
//   1. Firebase config nulled (no sign-in, no sync, no network);
//   2. a read-only hook, window.__eng, that hands the test the engine functions the page already defines;
//   3. nothing else: no network at all (every non-file request is aborted), no service worker, a fixed clock and time zone.
// Each case sets the app's product library and the settings the engine reads at call time, then calls compute() and legPlan() exactly as
// a Crunch does; render() when the screen text is wanted.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../../index.html', import.meta.url));
const URL0 = 'file://' + SRC;

const HOOK = `Object.defineProperty(window,'__eng',{configurable:true,get(){ return {compute, legPlan, render, planTotals, planCopyText,
  gramsScoops, scoopG, scoopsTxt, fullName, carbsKnown, sweatFromSingle, computeRun,
  get lib(){return lib;}, set lib(v){lib=v;}, get settings(){return settings;}}; }});\n`;

function pageSource() {
  let s = readFileSync(SRC, 'utf8');
  const cfg = /const FIREBASE_CONFIG = \{[\s\S]*?\n\};/;
  if (!cfg.test(s)) throw new Error('harness: FIREBASE_CONFIG block not found in index.html');
  s = s.replace(cfg, 'const FIREBASE_CONFIG = null;');
  const k = s.indexOf("\n'use strict';\n"); // the main script's first line (the app is one strict-mode function)
  if (k < 0) throw new Error("harness: the main script's 'use strict' line was not found");
  const at = k + "\n'use strict';".length;
  return s.slice(0, at) + '\n' + HOOK + s.slice(at);
}

// In the page: one case → a plain, JSON-safe summary of what the app planned (and, with display on, what the screen says).
function runInPage([cases, withDisplay]) {
  const E = window.__eng;
  const num = v => (typeof v === 'number' && !Number.isFinite(v) ? String(v) : v); // NaN/Infinity survive JSON as text
  const textOf = el => { if (!el) return ''; const out = []; const walk = n => { if (n.nodeType === 3) out.push(n.nodeValue);
    else if (n.nodeType === 1 && !n.hidden && n.tagName !== 'SCRIPT' && n.tagName !== 'STYLE') { out.push(' '); n.childNodes.forEach(walk); out.push(' '); } };
    walk(el); return out.join('').replace(/\s+/g, ' ').trim(); };
  const one = c => {
    E.lib = JSON.parse(JSON.stringify(c.lib));
    Object.assign(E.settings, JSON.parse(JSON.stringify(c.settings)));
    let r;
    if (c.i.sweat == null) c.i.sweat = E.sweatFromSingle(c.i.fluidOzHr); // item 39: a single sweat rate, migrated by the app itself
    try { r = E.compute(c.i); } catch (e) { return { crash: 'compute: ' + (e && e.stack || e) }; }
    if (r.errs) return { errs: r.errs };
    let lp;
    try { lp = E.legPlan(r); } catch (e) { return { crash: 'legPlan: ' + (e && e.stack || e) }; }
    r.lp = lp;
    const out = {
      H: r.H, durMin: r.i.durMin, band: r.b.name, bandPct: r.b.pct, concTarget: r.concTarget,
      fluidOzHr: r.i.fluidOzHr, fluidPlan: r.i.fluidPlan, fluidLimit: r.i.fluidLimit || null, fluidWant: r.i.fluidWant, tSodium: r.i.tSodium, sodiumConc: r.i.sodiumConc,
      sweat: r.i.sweatSrc ? { band: r.i.sweatSrc.band, eff: r.i.sweatSrc.eff, own: r.i.sweatSrc.own, oz: r.i.sweatSrc.oz } : null, grid: c.i.sweat,
      // item 39: the same ride at 50 °F and 75 °F, a hair either side (no WBGT): the grid's fluid must not jump
      edges: c.i.fluidOverride != null ? null : [49.99, 50.01, 74.99, 75.01].map(t => { const q = E.compute(Object.assign({}, c.i, { tempF: t, wbgtF: null })); return q.errs ? null : q.i.fluidWant; }),
      // item 49: the ride's hours (the whole ride's fluid per hour), the hours' carb gaps and the gap between gels
      hourly: r.hrsAll ? { first: r.hrsAll.first, last: r.hrsAll.last, spread: r.hrsAll.spread, limit: r.hrsAll.limit,
        hours: r.hrsAll.hours.map(h => ({ frac: h.frac, tempF: h.tempF, want: h.want, oz: h.oz, lim: h.lim })) } : null,
      hourNeed: r.hourNeed ? r.hourNeed.slice() : null, gelGap: r.gelGap || 5, srcHourly: !!(r.i.sweatSrc && r.i.sweatSrc.hourly),
      tail: r.tail ? r.tail.shortOz : 0, naTarget: r.naTarget, targetCarbs: r.targetTotalCarbs, tCarbsEff: r.tCarbsEff,
      cages: r.bike ? r.bike.cages : 2,
      engine: { gels: r.gels, times: r.times.slice(), seq: r.seq.map(g => g.id), gelCarbs: r.gelCarbsTotal, bottleCarbs: r.bottleCarbsTotal,
        powder: r.powderTotal, actualConc: r.actualConc, capExceeded: !!r.capExceeded, sodiumTotal: r.sodiumTotal, sodiumOver: !!r.sodiumOver,
        noGelShortHr: r.noGelShortHr, adjShort: !!(r.adj && r.adj.short), minForced: !!r.minForced, fitShortG: r.fitShort || 0, adjOver: !!(r.adj && r.adj.over), roleShort: r.roleShort || 0, fitShort: r.fitShort || 0, minGels: r.minGels, gelFit: r.gelFit,
        naUnknown: r.naUnknown ? r.naUnknown.map(x => x.name) : [],
        detailsCarbs: num(r.gelCarbsTotal + r.bottleCarbsTotal), detailsNa: num(r.sodiumTotal + (r.topup ? r.topup.mg || 0 : 0)) }, // the engine totals Details shows
      caf: { slots: (r.caf && r.caf.slots || []).slice(), mg: r.caf ? r.caf.mg : 0, dropped: (r.caf && r.caf.dropped || []).map(d => ({ t: d.t, why: d.why })),
        gelId: r.cafGel ? r.cafGel.id : null },
      topup: r.topup ? { kind: r.topup.kind, productId: r.topup.product.id, unit: r.topup.product.unit, how: r.topup.product.how, whole: !!r.topup.whole,
        count: r.topup.count ?? null, perBottle: r.topup.perBottle, mg: r.topup.mg, total: r.topup.total ?? null, na: r.topup.product.na } : null,
      saltUnknown: !!r.saltUnknown,
      water: r.water ? { n: r.water.n, size: r.water.size, ozHr: r.water.ozHr, refill: r.water.refill, gelsAdded: r.water.gelsAdded } : null,
      mine: r.mine ? { c: r.mine.c, e: r.mine.e, n: r.mine.n, g: r.mine.g } : null,
      leftover: r.leftover ? { oz: r.leftover.oz, choice: r.leftover.choice } : null,
      lp: {
        tot: Object.fromEntries(Object.entries(lp.tot).map(([k, v]) => [k, num(v)])),
        bottles: lp.bottles.map(b => ({ n: b.n, tag: b.tag, leg: b.leg, cage: b.cage, oz: num(b.oz), size: num(b.size), kind: b.kind || null, role: b.role || null,
          plain: !!b.plain, gA: num(b.gA || 0), gB: num(b.gB || 0), salt: num(b.salt || 0), saltNa: num(b.saltNa || 0), swallow: !!b.swallow,
          carbs: num(b.carbs || 0), na: num(b.na || 0), powder: num(b.powder || 0), conc: num(b.conc || 0), supply: b.supply || null, aid: !!b.aid,
          drink: b.drink || null, baggie: !!b.baggie, needsFix: !!b.needsFix })),
        gels: lp.gels.map(x => ({ t: x.t, id: x.g.id, carbs: num(x.g.carbs), sodium: num(x.g.sodium), caffeine: x.g.caffeine || 0, extra: !!x.extra })),
        warn: lp.warn.map(w => ({ kind: w.kind, key: w.key, fixes: (w.fixes || []).map(f => f.label || f.act) })),
        legs: lp.legs.map(L => ({ k: L.k, t0: L.t0, t1: L.t1, short: L.short || 0, fit: !!L.fit, supply: L.supply, missCarbs: num(L.missCarbs || 0), missNa: num(L.missNa || 0) })),
      },
    };
    if (withDisplay) {
      try {
        E.render(r);
        const P = E.planTotals(r);
        const ids = ['rTopFix', 'rNutWarn', 'rNutBody', 'rGelsBody', 'totGrid', 'totHr', 'rNotes', 'rSummary', 'rSchedule'];
        out.display = Object.fromEntries(ids.map(id => [id, textOf(document.getElementById(id))]));
        out.display.copy = E.planCopyText(r);
        const tf = document.querySelector('#rTable tfoot'); out.display.tableFoot = textOf(tf);
        out.display.totals = { carbs: P.carbs, na: num(P.na), oz: num(P.oz), gels: P.gels, caf: P.caf };
        const pw = E.lib.powders.find(p => p.id === c.i.powderId), pB = E.lib.powders.find(p => p.id === c.i.powderAltId);
        out.display.scoops = lp.bottles.filter(b => !b.aid && (b.gA > 0.05 || b.gB > 0.05)).flatMap(b => [
          b.gA > 0.05 && pw ? { grams: b.gA, scoopG: E.scoopG(pw), text: E.gramsScoops(b.gA, pw) } : null,
          b.gB > 0.05 && pB ? { grams: b.gB, scoopG: E.scoopG(pB), text: E.gramsScoops(b.gB, pB) } : null].filter(Boolean));
      } catch (e) { out.display = { crash: 'render: ' + (e && e.stack || e) }; }
    }
    return out;
  };
  return JSON.stringify(cases.map(c => { try { return one(c); } catch (e) { return { crash: String(e && e.stack || e) }; } }));
}

export async function openApp() {
  const body = pageSource();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ serviceWorkers: 'block', timezoneId: 'America/Indiana/Indianapolis', locale: 'en-US', viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date('2026-10-03T07:30:00-04:00'));
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.route('**/*', r => {
    const u = r.request().url();
    if (u === URL0) return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body });
    return u.startsWith('file:') ? r.continue() : r.abort();
  });
  await page.goto(URL0);
  await page.waitForFunction(() => !!window.__eng && typeof window.__eng.compute === 'function');
  return {
    pageErrors,
    // cases: [{lib, settings, i}] from app-input.mjs → one summary per case (in order)
    // item 42: run plans. cases: [{lib, settings, i}] → computeRun(i) as the app plans a run (JSON-safe)
    async runs(cases) {
      return JSON.parse(await page.evaluate(cs => { const E = window.__eng; return JSON.stringify(cs.map(c => { try {
        E.lib = JSON.parse(JSON.stringify(c.lib)); Object.assign(E.settings, JSON.parse(JSON.stringify(c.settings)));
        const r = E.computeRun(c.i); if (r.errs) return { errs: r.errs };
        return { H: r.H, miles: r.miles, pace: r.pace, S: r.S, cap: r.cap, carbsHr: r.carbsHr, fluidHr: r.fluidHr, fluidLimit: r.fluidLimit, naHr: r.naHr,
          legs: r.legs.map(l => ({ m0: l.m0, m1: l.m1, h: l.h, needMl: l.needMl, carriedMl: l.carriedMl, shortMl: l.shortMl, refill: l.refill, carbs: l.carbs, flasks: l.flasks })),
          aid: r.aid, gels: r.gels.map(g => ({ t: g.t, mile: g.mile, carbs: g.carbs, sodium: g.sodium })), topup: r.topup ? { unit: r.topup.unit, amount: r.topup.amount, mg: r.topup.mg, na: r.topup.salt.na } : null,
          gelCarbs: +r.gel.carbs || 0, totals: r.totals, perHour: r.perHour, warn: r.warn.map(w => ({ kind: w.kind, key: w.key, text: w.text })) };
      } catch (e) { return { crash: String(e && e.stack || e) }; } })); }, cases));
    },
    async run(cases, { display = false, batch = 250 } = {}) {
      const out = [];
      for (let k = 0; k < cases.length; k += batch) out.push(...JSON.parse(await page.evaluate(runInPage, [cases.slice(k, k + batch), display])));
      return out;
    },
    async close() { await browser.close(); },
  };
}
