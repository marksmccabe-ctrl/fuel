// node budgets.test.mjs <null.html> [screen-name regex]   (cd into this folder first; about 4 minutes while no screen has art)
//   FRED WORLD BUDGETS (QUEUE.md, "RULES FOR ALL TEN" above item 97: "Budgets, checked by a kit test: at most 1,200 FW nodes and 30
//   running FW animations on a screen; at most 4 ms main thread per frame at 6x CPU slowdown with the screen's motion running; nothing
//   running off screen or in the background; no FW insert longer than 50 ms at 6x (build heavy art after first paint)"; item 97 point 4).
//   A page with no fred world (no <script id="fwJs"> defining window.FW: main before item 97) ends with "OK: no fred world in this page
//   (before item 97): nothing to budget", so the kit still passes on older pages.
//   The plumbing (fwMount, FWM ...) lives inside the app's strict-mode function, so a page can't reach it. The test writes a hooked copy
//   of the page, <the page's folder>/budgets-hook/budgets-hook.html (its own folder: the cloud screens build kitcloud.html beside the page
//   they are given, and the other tests' kitcloud.html beside null.html must stay unhooked), that (a) hands the plumbing out from the
//   main script's first line (window.__fwk: fwMount, fwGate, fwOn, FWM) and (b) times every fwMount call, the app's own included: the
//   original is renamed and a wrapper records {ms: the call plus a forced layout of its spot, spot, ins: whether the spot's drawing
//   changed, n: its nodes after, key} into window.__fwIns. Nothing else changes. Every screen is the shared list (lib/screens.mjs run())
//   with Reduce Motion off (the switch, Animate the world, is on unless a screen turns it off), after go() and once settled:
//   nodes       elements inside .fwm spots on the page (every view's, seen or not): at most 1,200
//   mounted     every element with a class starting fw- is inside a spot fwMount knows (FWM); one that isn't (FW.bird() put in with
//               innerHTML, a .fwm class written by hand) is "not mounted with fwMount": it loops for ever under html.fw-anim, never
//               paused or settled. html's own fw-anim, and a wrapper around a spot (a .fw-scene box holding one), are not art
//   running     CSS animations named fw-* (document.getAnimations()) in play state running: at most 30. Counted as the screen is, and
//               again while its drawings move: a new app open (the page hidden, 31 minutes on, shown: fwMount's onAppOpen lets every
//               kept drawing move once more, rule a), so a drawing that had already settled during go() is judged moving
//   off screen  none of those running in a spot whose box is wholly outside the viewport (outside any spot: the art's own box). A
//               spot partly on screen is on screen (loopWhileVisible runs a spot as a whole)
//   background  the page hidden (document.hidden and visibilityState overridden, visibilitychange sent, then put back): none running
//   frame       on a screen where fw- animations run: main-thread time per frame at 6x CPU slowdown (CDP Emulation.setCPUThrottlingRate)
//               over 2 s while they move (CDP Performance.getMetrics TaskDuration, divided by the frames requestAnimationFrame counts
//               in the page): at most 4 ms (the whole screen's main thread: its own motion counts too)
//   insert      every fwMount call the screen made, from the page's first line through go(): the screen is opened again with the 6x
//               slowdown on from the start (set on the page before it loads) and each call must take at most 50 ms. A screen whose
//               calls go to the same spots as one already measured is not opened again (BUDGETS_INS_ALL=1 opens each)
//   errors      no page errors or console errors (the hooked copy must behave as the page)
//   Self-tests on plan-before (so the audit can't pass by measuring nothing), probes mounted through __fwk and then taken out:
//   FW.bird({}) and FW.scene(id) (in a .fw-scene box, as the bundle's notes say) in spots on screen: their nodes are counted and
//   their running fw- animations seen, and the budget judge flags them at limits just under what they hold; a bird in a spot far
//   below the fold, seen once (it moves) and scrolled away: paused, not counted as running, not off screen; FW.bird({}) put with
//   innerHTML in a plain div, also below the fold: flagged as not mounted and as running off screen; the page hidden: nothing in a
//   spot runs, and the plain div's loops are caught; __fwIns holds the three probe inserts; the frame instrument counts frames and
//   main-thread time; a page opened at 6x is slowed from its start (a fixed loop runs more than 2.5x slower than at 1x); taken out,
//   nothing is left.
//   Then informational numbers (not pass/fail) for the later items, per drawing alone in a spot on plan-before (no wrapper class but
//   .fw-scene for the scene): its nodes, its fw- animations running once moving, its insert (fwMount with a function, so the build is
//   timed too, plus the forced layout) at 1x and 6x (median of 3), and main-thread ms per frame at 6x while it moves (with the screen
//   alone for comparison).
// Output: one FAIL line per failure (the screen, the rule, the element and the numbers), an info line per screen with fred world art,
// a summary, then the checker's last line. BUDGETS_DEBUG=1 prints every screen's numbers; BUDGETS_SELF=0 skips the self-tests and the
// informational numbers; BUDGETS_INS_ALL=1 (above).
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { run, openScreen, screens } from '../lib/screens.mjs';
import { checker } from '../lib/open.mjs';

const ARG = process.argv[2], ONLY = process.argv[3] ? new RegExp(process.argv[3]) : null;
const DEBUG = !!process.env.BUDGETS_DEBUG, SELF = process.env.BUDGETS_SELF !== '0', INS_ALL = !!process.env.BUDGETS_INS_ALL;
const BUDGET = { nodes: 1200, anims: 30, frameMs: 4, insMs: 50, rate: 6, win: 2000 };
const T0 = Date.now(), sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 3000, step = 100) { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); } catch (e) { v = null; } if (v) return v; await sleep(step); } return v; }
const r2 = v => v == null ? null : Math.round(v * 100) / 100;
const med = a => { const s = a.filter(x => x != null).sort((x, y) => x - y); return s.length ? s[(s.length - 1) >> 1] : null; };

/* ================================================================ the hooked copy */
const MAIN_JS = "\n<script>\n(function(){\n'use strict';\n";
const HOOK = "Object.defineProperty(window,'__fwk',{configurable:true,get(){ return {fwMount, fwGate, fwOn, FWM}; }}); /* budgets.test.mjs: the fred world plumbing, handed to the kit */\n";
const WRAP = "function fwMount(el, draw, key){ /* budgets.test.mjs: every call timed, with a forced layout of its spot, into window.__fwIns */\n"
  + "  const t0=performance.now(), f0=el ? el.firstChild : null, lab=window.__fwkDesc ? window.__fwkDesc(el) : String(el && el.id || '');\n"
  + "  try{ return __fwkMount0.apply(this, arguments); }\n"
  + "  finally{ if(el && el.isConnected) el.getBoundingClientRect(); const ms=performance.now()-t0;\n"
  + "    (window.__fwIns||(window.__fwIns=[])).push({ms:Math.round(ms*100)/100, spot:lab, ins:!!el && el.firstChild!==f0, n:el ? el.getElementsByTagName('*').length : 0, key:key==null ? '' : String(key).slice(0, 40), at:Math.round(t0)}); } }\n";
function hookSource(src) {
  const k = src.indexOf(MAIN_JS);
  if (k < 0) throw new Error('no main script start ("<script>\\n(function(){\\n\'use strict\';") in the page');
  const n = src.split('function fwMount(').length - 1;
  if (n !== 1) throw new Error('the page has ' + n + ' "function fwMount(" (expected one: item 97\'s plumbing)');
  const at = k + MAIN_JS.length;
  return (src.slice(0, at) + HOOK + src.slice(at)).replace('function fwMount(', WRAP + 'function __fwkMount0(');
}

/* ================================================================ in the page: the audit (an init script in every context) */
function FWK_INIT() {
  if (window.__fwkA) return;
  const part = x => { const t = x.localName || '?'; const cl = [...(x.classList || [])].filter(c => !/^(fwm|fwm-go|fw-rm|mo-off)$/.test(c)).slice(0, 3); return t + (x.id ? '#' + x.id : '') + (cl.length ? '.' + cl.join('.') : ''); };
  const desc = window.__fwkDesc = e => { if (!e || !e.localName) return String(e); if (e.id) return part(e); const p = e.parentElement, a = p && p.closest('[id]'); return (a ? part(a) + ' ' : '') + (p && p !== a ? part(p) + ' > ' : '') + part(e); };
  const fwA = () => document.getAnimations().filter(a => typeof a.animationName === 'string' && a.animationName.startsWith('fw-'));
  const nonEmpty = r => r && (r.width > 0 || r.height > 0) ? r : null;
  const boxOf = e => { for (let x = e; x && x.nodeType === 1; x = x.parentElement) { const r = nonEmpty(x.getBoundingClientRect()); if (r) return r; } return null; };
  const seen = r => !!r && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  const R = r => r ? [Math.round(r.top), Math.round(r.bottom), Math.round(r.left), Math.round(r.right)] : null;
  const fwc = x => !!x && !!x.classList && [...x.classList].some(c => c.startsWith('fw-'));
  // where a running animation is: its spot, or (outside any spot) the top of the art it is in (up while the parent is art or in an svg)
  const where = t => { const s = t && t.closest ? t.closest('.fwm') : null; if (s) return { k: s, s, r: nonEmpty(s.getBoundingClientRect()) || boxOf(t) };
    let x = t; while (x && x.parentElement && x.parentElement !== document.documentElement && x.parentElement !== document.body && (fwc(x.parentElement) || x.parentElement.closest('svg'))) x = x.parentElement;
    return { k: x, s: null, r: boxOf(x) }; };
  const group = list => { const m = new Map(); for (const a of list) { const t = a.effect && a.effect.target; if (!t) continue; const w = where(t); let g = m.get(w.k); if (!g) m.set(w.k, g = { sel: desc(w.k), spot: !!w.s, n: 0, names: new Set(), box: R(w.r), on: seen(w.r) }); g.n++; g.names.add(a.animationName); }
    return [...m.values()].map(g => Object.assign(g, { names: [...g.names].slice(0, 6) })); };
  const setHidden = h => { if (h === null) { delete document.hidden; delete document.visibilityState; } else { Object.defineProperty(document, 'hidden', { configurable: true, get: () => h }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => h ? 'hidden' : 'visible' }); } document.dispatchEvent(new Event('visibilitychange')); };
  window.__fwkA = {
    audit() {
      const K = window.__fwk, FWM = K && K.FWM, known = e => !!(FWM && FWM.has && FWM.has(e));
      const spots = [...document.querySelectorAll('.fwm')].map(e => { const A = e.getAnimations({ subtree: true }).filter(a => String(a.animationName || '').startsWith('fw-')), r = nonEmpty(e.getBoundingClientRect());
        return { sel: desc(e), known: known(e), nodes: e.getElementsByTagName('*').length, go: e.classList.contains('fwm-go'), off: e.classList.contains('mo-off'), rm: e.classList.contains('fw-rm'),
          on: seen(r) && (!e.checkVisibility || e.checkVisibility()), box: R(r), running: A.filter(a => a.playState === 'running').length, paused: A.filter(a => a.playState === 'paused').length }; });
      const A = fwA(), run = A.filter(a => a.playState === 'running'), art = new Set();
      for (const e of document.querySelectorAll('[class*="fw-"]')) { if (e === document.documentElement || !fwc(e)) continue; const s = e.closest('.fwm'); if (s && known(s)) continue; if (!s && e.querySelector('.fwm')) continue; art.add(e); }
      const unmounted = [...art].filter(e => { for (let x = e.parentElement; x; x = x.parentElement) if (art.has(x)) return false; return true; }).map(e => { const s = e.closest('.fwm');
        return { sel: desc(e), spot: s ? desc(s) : '', cls: [...new Set([e, ...e.querySelectorAll('[class*="fw-"]')].flatMap(x => [...x.classList].filter(c => c.startsWith('fw-'))))].slice(0, 6), nodes: e.getElementsByTagName('*').length + 1 }; });
      const runBy = group(run);
      return { hooked: !!(K && typeof K.fwMount === 'function' && FWM instanceof Map), gate: document.documentElement.classList.contains('fw-anim'), nodes: document.querySelectorAll('.fwm *').length, spots,
        all: A.length, running: run.length, paused: A.filter(a => a.playState === 'paused').length, runBy, offs: runBy.filter(g => !g.on), unmounted, ins: (window.__fwIns || []).slice(), vw: innerWidth, vh: innerHeight, sy: Math.round(scrollY) };
    },
    // the page hidden: what still runs (then shown again)
    async hidden() { setHidden(true); await new Promise(r => setTimeout(r, 150)); const run = fwA().filter(a => a.playState === 'running'), out = { running: run.length, by: group(run) }; setHidden(null); return out; },
    // a new app open (the app's rule, item 88.4: back after 30 minutes or more in the background): hidden, 31 minutes on, shown
    async appOpen() { setHidden(true); await new Promise(r => setTimeout(r, 50)); const D = Date.now; Date.now = () => D.call(Date) + 31 * 60e3; try { setHidden(null); } finally { Date.now = D; } },
    // frames counted by requestAnimationFrame (a new start ends the old count)
    fStart() { const g = window.__fwkG = (window.__fwkG || 0) + 1; window.__fwkN = 0; const t = () => { if (window.__fwkG !== g) return; window.__fwkN++; requestAnimationFrame(t); }; requestAnimationFrame(t); },
    fRead() { return window.__fwkN || 0; },
    fStop() { window.__fwkG = (window.__fwkG || 0) + 1; return window.__fwkN || 0; },
  };
}

/* ================================================================ the browser: every context gets the audit, every page a CDP session */
let RATE = 1; const CDP = new WeakMap();
async function kitBrowser() {
  const b = await chromium.launch(), nc = b.newContext.bind(b);
  b.newContext = async (...a) => {
    const ctx = await nc(...a); await ctx.addInitScript(FWK_INIT);
    const np = ctx.newPage.bind(ctx);
    ctx.newPage = async (...q) => { const p = await np(...q), s = await ctx.newCDPSession(p); if (RATE !== 1) await s.send('Emulation.setCPUThrottlingRate', { rate: RATE }); CDP.set(p, s); return p; }; /* (before open() loads the page: slowed from its start) */
    return ctx;
  };
  return b;
}
const audit = p => p.evaluate(() => window.__fwkA.audit());
async function throttle(p, rate) { await CDP.get(p).send('Emulation.setCPUThrottlingRate', { rate }); }
// main-thread ms per frame over `ms` at `rate`: TaskDuration (CDP Performance.getMetrics) over the frames counted in the page
async function frameCost(p, rate = BUDGET.rate, ms = BUDGET.win) {
  const cdp = CDP.get(p); await cdp.send('Performance.enable');
  const td = async () => (await cdp.send('Performance.getMetrics')).metrics.find(m => m.name === 'TaskDuration').value;
  if (rate !== 1) await throttle(p, rate);
  try {
    await p.evaluate(() => window.__fwkA.fStart()); await sleep(150);
    const t0 = await td(), f0 = await p.evaluate(() => window.__fwkA.fRead());
    await sleep(ms);
    const f1 = await p.evaluate(() => window.__fwkA.fStop()), t1 = await td(), n = f1 - f0;
    return { ms: n > 0 ? r2((t1 - t0) * 1000 / n) : null, frames: n, task: Math.round((t1 - t0) * 1000) };
  } finally { if (rate !== 1) await throttle(p, 1); }
}
const busy = p => p.evaluate(() => { const t = performance.now(); let x = 0; for (let i = 0; i < 4e6; i++) x += Math.sqrt(i); return performance.now() - t + (x < 0 ? 1 : 0); });

/* ================================================================ judging */
// judge(screen, audit, out, when, limits): the static and running rules on one look
function judge(screen, A, out, when, L = BUDGET) {
  const add = (rule, sel, detail) => out.push({ screen, rule, sel, detail: detail + (when ? ' (' + when + ')' : '') });
  const big = A.spots.slice().sort((x, y) => y.nodes - x.nodes).slice(0, 3).map(s => s.sel + ' ' + s.nodes).join(', ');
  if (A.nodes > L.nodes) add('nodes', 'the page', A.nodes + ' FW nodes in ' + A.spots.length + ' spots (budget ' + L.nodes + '); the most in ' + big);
  if (A.running > L.anims) add('running', 'the page', A.running + ' FW animations running (budget ' + L.anims + '): ' + A.runBy.slice().sort((x, y) => y.n - x.n).slice(0, 4).map(g => g.sel + ' ' + g.n).join(', '));
  for (const g of A.offs) add('off screen', g.sel, g.n + ' FW animations running (' + g.names.join(' ') + ') with its box at ' + JSON.stringify(g.box) + ' [top, bottom, left, right], outside the ' + A.vw + 'x' + A.vh + ' viewport');
  for (const u of A.unmounted) add('not mounted', u.sel, 'fred world art outside any fwMount spot' + (u.spot ? ' (in ' + u.spot + ', a .fwm fwMount does not know)' : '') + ': ' + u.nodes + ' nodes, ' + u.cls.join(' '));
}
const line = f => 'budgets ' + f.screen + ' · ' + f.rule + ' · ' + f.sel + ' · ' + f.detail;

async function main() {
  if (!ARG || !fs.existsSync(ARG)) { console.log('usage: node budgets.test.mjs <null.html> [screen-name regex]' + (ARG ? '   (no such page: ' + ARG + ')' : '')); process.exitCode = 2; return; }
  const PAGE = path.resolve(ARG), SRC = fs.readFileSync(PAGE, 'utf8');
  if (!/<script id="fwJs">/.test(SRC) || !/window\.FW\s*=/.test(SRC)) { console.log('OK: no fred world in this page (before item 97): nothing to budget'); process.exitCode = 0; return; }
  const C = checker(), FAILS = [], ERRS = [];
  let HOOKED;
  try { const dir = path.join(path.dirname(PAGE), 'budgets-hook'); fs.mkdirSync(dir, { recursive: true }); HOOKED = path.join(dir, 'budgets-hook.html'); fs.writeFileSync(HOOKED, hookSource(SRC)); }
  catch (e) { C.ok(false, 'hook: the page has fred world (window.FW) but no plumbing to hook: ' + e.message); C.done('fred world budgets'); return; }
  console.log('  page ' + PAGE + ' (fred world v' + ((/fred world v(\d+) start/.exec(SRC) || [])[1] || '?') + '), hooked copy ' + HOOKED);
  const B = await kitBrowser();
  try {
    if (SELF) await selfTest(B, HOOKED, C, ERRS);
    await walk(B, HOOKED, C, FAILS, ERRS);
  } finally { await B.close(); }
  console.log('  (' + Math.round((Date.now() - T0) / 1000) + ' s)');
  C.done('fred world budgets: ' + ST.screens + ' screens' + (ST.art.length ? ' (' + ST.art.length + ' with fred world art)' : ' (none with fred world art yet: all zeros)') + ', at most 1,200 FW nodes and 30 running FW animations, nothing running off screen or hidden, 4 ms a frame and 50 ms an insert at 6x' + (SELF ? '; self-tests on ' + SELF_SCREEN : ''));
}

/* ================================================================ self-tests and the drawings' numbers, on one screen */
const SELF_SCREEN = 'plan-before';
// a probe spot: prepended to the view on screen (top) or appended far below everything (below: margin-top px)
const probe = (p, id, cls, css, below) => p.evaluate(([id, cls, css, below]) => { const v = document.querySelector('main .view.active, .view.active') || document.body, d = document.createElement('div');
  d.id = id; if (cls) d.className = cls; d.style.cssText = css + (below ? ';margin-top:' + below + 'px' : ''); if (below) v.append(d); else v.prepend(d); return true; }, [id, cls, css, below]);
// the drawings, by name (no eval in the page)
const DRAWINGS = [
  { name: 'FW.bird({})', k: 'bird', cls: '', css: 'width:140px;height:140px;overflow:hidden' },
  { name: 'FW.ashley()', k: 'ashley', cls: '', css: 'width:140px;height:210px;overflow:hidden' },
  { name: 'FW.friend(0)', k: 'friend', cls: '', css: 'width:140px;height:210px;overflow:hidden' },
  { name: 'FW.kitty()', k: 'kitty', cls: '', css: 'width:140px;height:140px;overflow:hidden' },
  { name: "FW.scene(id) in a .fw-scene box", k: 'scene', cls: 'fw-scene fw-phone', css: 'width:360px' },
];
const mountJs = (p, id, k, key) => p.evaluate(([id, k, key]) => { const el = document.getElementById(id), F = window.FW;
  const D = { bird: () => F.bird({}), ashley: () => F.ashley(), friend: () => F.friend(0), kitty: () => F.kitty(), scene: () => F.scene(id + '-') };
  window.__fwk.fwMount(el, D[k], key); const L = (window.__fwIns || []).filter(x => x.spot === window.__fwkDesc(el)); return L.length ? L[L.length - 1] : null; }, [id, k, key]);
const unmount = (p, ids) => p.evaluate(ids => { for (const id of ids) { const el = document.getElementById(id); if (!el) continue; window.__fwk.fwMount(el, ''); el.remove(); } }, ids);
const spotOf = (A, id) => A.spots.find(s => s.sel.includes('#' + id + '.') || s.sel.endsWith('#' + id)) || null;

async function selfTest(B, HOOKED, C, ERRS) {
  console.log('-- self-tests (' + SELF_SCREEN + ')');
  const s = screens.find(x => x.name === SELF_SCREEN) || screens[0];
  const o = await openScreen(HOOKED, s, { browser: B, motion: true }); ERRS.push([SELF_SCREEN + ' (self-test)', o.errors]);
  try {
    const p = o.p;
    if (o.fail) { C.ok(false, 'self-test: ' + SELF_SCREEN + ' not reached: ' + o.fail); return; }
    const A0 = await audit(p);
    C.ok(A0.hooked && A0.gate, 'self-test: the hooked copy hands out the plumbing (fwMount, FWM) and the gate is open (html.fw-anim, Reduce Motion off)', { hooked: A0.hooked, gate: A0.gate });
    if (!A0.hooked) return;
    const i0 = A0.ins.length;
    // probes: a bird and a scene on screen, a bird far below the fold (all three with fwMount), a bird put in with innerHTML below that
    await probe(p, 'fwkA', '', 'width:140px;height:140px;overflow:hidden');
    await probe(p, 'fwkB', 'fw-scene fw-phone', 'width:360px');
    await probe(p, 'fwkC', '', 'width:140px;height:140px;overflow:hidden', 3000);
    await probe(p, 'fwkD', '', 'width:140px;height:140px;overflow:hidden', 600);
    await mountJs(p, 'fwkA', 'bird', 'kit:a'); await mountJs(p, 'fwkB', 'scene', 'kit:b'); await mountJs(p, 'fwkC', 'bird', 'kit:c');
    await p.evaluate(() => { document.getElementById('fwkD').innerHTML = window.FW.bird({}); });
    const moving = await until(async () => { const A = await audit(p), a = spotOf(A, 'fwkA'), b = spotOf(A, 'fwkB'); return a && b && a.go && b.go && a.running && b.running ? A : null; }, 3000);
    const A1 = moving || await audit(p), a = spotOf(A1, 'fwkA'), b = spotOf(A1, 'fwkB'), c = spotOf(A1, 'fwkC'), sum = [a, b, c].reduce((n, x) => n + (x ? x.nodes : 0), 0);
    const pr = L => L.filter(g => /fwk/.test(g.sel)); /* (the probes' findings: the screen's own art, in a later item, is judged in the walk) */
    C.ok(!!a && !!b && !!c && sum > 0 && A1.nodes === A1.spots.reduce((n, x) => n + x.nodes, 0) && A1.nodes >= A0.nodes + sum, 'self-test: the probes\' nodes are counted (' + A1.nodes + ' FW nodes: bird ' + (a && a.nodes) + ', scene ' + (b && b.nodes) + ', bird below ' + (c && c.nodes) + ')', { nodes: A1.nodes, before: A0.nodes, a, b, c });
    C.ok(!!moving && a.running > 0 && b.running > 0 && A1.running >= a.running + b.running, 'self-test: the moving probes\' fw- animations are seen running (bird ' + (a && a.running) + ', scene ' + (b && b.running) + '; ' + A1.running + ' on the page)', { a, b, running: A1.running });
    C.ok(!!c && !c.go && c.running === 0 && !A1.offs.some(g => /fwk[ABC]\b/.test(g.sel)), 'self-test: the spot below the fold, never seen, runs nothing (still)', c);
    C.ok(pr(A1.unmounted).length === 1 && /fwkD/.test(pr(A1.unmounted)[0].sel), 'self-test: the bird put in with innerHTML is flagged as not mounted with fwMount (and no probe in a spot is)', A1.unmounted);
    C.ok(pr(A1.offs).length === 1 && /fwkD/.test(pr(A1.offs)[0].sel) && pr(A1.offs)[0].n > 0, 'self-test: its loops, running below the fold, are flagged as off screen (and no probe in a spot is)', A1.offs);
    const J = []; judge('self-test', A1, J, '', { nodes: A1.nodes - 1, anims: A1.running - 1 });
    C.ok(J.some(f => f.rule === 'nodes') && J.some(f => f.rule === 'running') && J.some(f => f.rule === 'not mounted') && J.some(f => f.rule === 'off screen'), 'self-test: the judge flags nodes and running animations over a limit just under what the page holds, the unmounted art and the off-screen loops', J.map(f => f.rule + ' ' + f.sel));
    const F = await frameCost(p);
    C.ok(F.frames >= 30 && F.ms > 0, 'self-test: the frame instrument measures (' + F.frames + ' frames in 2 s at 6x, ' + F.ms + ' ms main thread a frame with the probes moving)', F);
    const H = await p.evaluate(() => window.__fwkA.hidden()), A2 = await audit(p);
    C.ok(!H.by.some(g => /fwk[ABC]\b/.test(g.sel)) && H.by.some(g => /fwkD/.test(g.sel)), 'self-test: the page hidden, nothing in a spot runs (' + (spotOf(A2, 'fwkA') || {}).running + '/' + (spotOf(A2, 'fwkB') || {}).running + ' running again once shown), and the plain div\'s loops still running are caught', H.by);
    // the spot below: seen once (it moves), then scrolled away: paused, not running, not off screen
    await p.evaluate(() => document.getElementById('fwkC').scrollIntoView({ block: 'center' }));
    const cGo = await until(async () => { const x = spotOf(await audit(p), 'fwkC'); return x && x.go && x.running ? x : null; }, 3000);
    await p.evaluate(() => window.scrollTo(0, 0));
    const cOff = await until(async () => { const A = await audit(p), x = spotOf(A, 'fwkC'); return x && x.off && x.go ? A : null; }, 3000);
    const c2 = cOff && spotOf(cOff, 'fwkC');
    C.ok(!!cGo && !!c2 && c2.paused > 0 && c2.running === 0 && !cOff.offs.some(g => /fwkC/.test(g.sel)) && cOff.nodes >= c2.nodes, 'self-test: the spot below, seen (it moved: ' + (cGo && cGo.running) + ' running) and scrolled away: its ' + (c2 && c2.paused) + ' animations are paused, not counted as running, not off screen', { cGo, c2 });
    const ins = (await audit(p)).ins.slice(i0), got = id => ins.find(x => x.spot.includes('#' + id) && x.ins && x.ms > 0);
    C.ok(['fwkA', 'fwkB', 'fwkC'].every(got), 'self-test: __fwIns recorded the three probe inserts (' + ['fwkA', 'fwkB', 'fwkC'].map(id => (got(id) || {}).ms + ' ms').join(', ') + ' at 1x)', ins);
    // taken out
    await unmount(p, ['fwkA', 'fwkB', 'fwkC']); await p.evaluate(() => document.getElementById('fwkD').remove()); await sleep(100);
    const A3 = await audit(p);
    C.ok(!pr(A3.unmounted).length && !pr(A3.spots).length && !pr(A3.runBy).length && !(await p.evaluate(() => [...window.__fwk.FWM.keys()].some(e => /^fwk/.test(e.id)))), 'self-test: the probes taken out (fwMount(el, \'\') and removed): nothing left, and fwMount let them go (FWM)', { nodes: A3.nodes, unmounted: A3.unmounted, spots: A3.spots });
    // a page opened at 6x is slowed from its start (the insert re-open)
    const b1 = await busy(p); RATE = BUDGET.rate; let y = null;
    try { y = await openScreen(HOOKED, s, { browser: B, motion: true }); } finally { RATE = 1; }
    try { const b6 = await busy(y.p); ERRS.push([SELF_SCREEN + ' (self-test at 6x)', y.errors]);
      C.ok(b6 > 2.5 * b1, 'self-test: a page opened at 6x is slowed from its start (a fixed loop: ' + r2(b1) + ' ms at 1x, ' + r2(b6) + ' ms there)', { b1, b6 }); }
    finally { await y.close(); }

    // the drawings' numbers (information for the later items, not pass/fail)
    console.log('-- the drawings, each alone in a spot on ' + SELF_SCREEN + ' (information for the later items; not pass/fail)');
    const base = await frameCost(p);
    console.log('  info the screen alone: ' + base.ms + ' ms main thread a frame at 6x (' + base.frames + ' frames in 2 s)');
    let n = 0;
    for (const d of DRAWINGS) {
      const r = { i1: [], i6: [] };
      for (let i = 0; i < 3; i++) { const id = 'fwkI' + (++n); await probe(p, id, d.cls, d.css); const x = await mountJs(p, id, d.k, 'kit:' + id); r.i1.push(x && x.ms);
        if (i < 2) { await unmount(p, [id]); continue; }
        const m = await until(async () => { const A = await audit(p), sp = spotOf(A, id); return sp && sp.go && sp.running ? sp : null; }, 3000);
        r.nodes = (m || spotOf(await audit(p), id) || {}).nodes; r.run = m ? m.running : 0;
        r.frame = await frameCost(p);
        await unmount(p, [id]); }
      await throttle(p, BUDGET.rate);
      try { for (let i = 0; i < 3; i++) { const id = 'fwkI' + (++n); await probe(p, id, d.cls, d.css); const x = await mountJs(p, id, d.k, 'kit:' + id); r.i6.push(x && x.ms); await unmount(p, [id]); } }
      finally { await throttle(p, 1); }
      const over = [r.nodes > BUDGET.nodes ? r.nodes + ' > 1,200 nodes' : '', r.run > BUDGET.anims ? r.run + ' > 30 animations' : '', r.frame.ms > BUDGET.frameMs ? r.frame.ms + ' > 4 ms a frame' : '', med(r.i6) > BUDGET.insMs ? med(r.i6) + ' > 50 ms an insert' : ''].filter(Boolean);
      console.log('  info ' + d.name + (d.cls ? ' (spot .' + d.cls.split(' ').join('.') + ')' : '') + ': ' + r.nodes + ' nodes; ' + r.run + ' fw- animations running once moving; insert ' + med(r.i1) + ' ms at 1x, ' + med(r.i6) + ' ms at 6x (median of 3: ' + r.i1.join(', ') + ' | ' + r.i6.join(', ') + '); main thread ' + r.frame.ms + ' ms a frame at 6x while it moves'
        + (over.length ? '; alone it is over the per-screen budget: ' + over.join(', ') : ''));
    }
    const A4 = await audit(p);
    C.ok(!pr(A4.spots).length && !pr(A4.unmounted).length, 'self-test: the drawings taken out again: nothing left', A4.spots);
  } finally { await o.close(); }
}

/* ================================================================ every screen */
const ST = { screens: 0, broken: [], art: [], unhooked: [], ins: 0, frames: [], insSeen: new Map(), max: { nodes: [0, ''], running: [0, ''], ins6: [0, ''], frame: [0, ''] } };
async function walk(B, HOOKED, C, FAILS, ERRS) {
  console.log('-- every screen (Reduce Motion off)');
  const top = (k, v, w) => { if (v != null && v > ST.max[k][0]) ST.max[k] = [v, w]; };
  const each = async (s, o) => {
    const t = Date.now(); ST.screens++;
    ERRS.push([s.name, o.errors || []]);
    if (o.fail || !o.p) { ST.broken.push(s.name + ': ' + o.fail); return; }
    const p = o.p, A0 = await audit(p);
    if (!A0.hooked) ST.unhooked.push(s.name);
    judge(s.name, A0, FAILS, 'as the screen is');
    const has = A0.spots.length || A0.unmounted.length || A0.all, info = { nodes: A0.nodes, spots: A0.spots.length, running: A0.running, moving: null, hidden: null, frame: null, ins: A0.ins.length, ins1: A0.ins.length ? Math.max(...A0.ins.map(x => x.ms)) : null, ins6: null };
    top('nodes', A0.nodes, s.name); top('running', A0.running, s.name);
    if (has) {
      let M = A0;
      if (A0.spots.some(x => x.known && x.on)) { /* drawings on screen: make them move (a new app open), then judge them moving */
        await p.evaluate(() => window.__fwkA.appOpen());
        await until(() => p.evaluate(() => !!document.querySelector('.fwm.fwm-go')), 2000); await sleep(150);
        M = await audit(p); info.moving = M.running; top('running', M.running, s.name);
        judge(s.name, M, FAILS, 'moving after a new app open');
      }
      const H = await p.evaluate(() => window.__fwkA.hidden()); info.hidden = H.running;
      for (const g of H.by) FAILS.push({ screen: s.name, rule: 'background', sel: g.sel, detail: g.n + ' FW animations (' + g.names.join(' ') + ') still running with the page hidden' });
      if (Math.max(A0.running, M.running) > 0) {
        const F = await frameCost(p), after = (await audit(p)).running; info.frame = F.ms; top('frame', F.ms, s.name); ST.frames.push(s.name);
        if (F.ms > BUDGET.frameMs) FAILS.push({ screen: s.name, rule: 'frame', sel: 'the page', detail: F.ms + ' ms main thread a frame at 6x over 2 s (' + F.frames + ' frames, ' + F.task + ' ms of tasks; budget ' + BUDGET.frameMs + ' ms) with ' + M.running + ' FW animations running (' + after + ' at the end)' });
      }
    }
    if (A0.ins.length) { /* fwMount calls: the screen again, at 6x from its start */
      ST.ins += A0.ins.length;
      const key = [...new Set(A0.ins.map(x => x.spot))].sort().join(' | '), was = ST.insSeen.get(key);
      if (was && !INS_ALL) { if (DEBUG) console.log('  .. ' + s.name + ': its fwMount calls go to the same spots as on ' + was + ' (measured there at 6x)'); }
      else {
        ST.insSeen.set(key, s.name);
        RATE = BUDGET.rate; let y = null;
        try { y = await openScreen(HOOKED, s, { browser: B, motion: true }); } catch (e) { FAILS.push({ screen: s.name, rule: 'insert', sel: 'the page', detail: 'could not open it again at 6x: ' + String(e && e.message || e).split('\n')[0] }); }
        finally { RATE = 1; }
        if (y) try {
          const I = await y.p.evaluate(() => (window.__fwIns || []).slice()); ERRS.push([s.name + ' (at 6x)', y.errors]);
          if (y.fail) console.log('  note ' + s.name + ': at 6x go() did not finish (' + y.fail + '); the calls it made are judged');
          info.ins6 = I.length ? Math.max(...I.map(x => x.ms)) : null; top('ins6', info.ins6, s.name);
          const at1 = sp => Math.max(...A0.ins.filter(x => x.spot === sp).map(x => x.ms));
          for (const x of I) if (x.ms > BUDGET.insMs) FAILS.push({ screen: s.name, rule: 'insert', sel: x.spot, detail: x.ms + ' ms at 6x (budget ' + BUDGET.insMs + ' ms; ' + (A0.ins.some(z => z.spot === x.spot) ? at1(x.spot) + ' ms at 1x; ' : '') + (x.ins ? 'a new drawing, ' + x.n + ' nodes' : 'kept') + (x.key ? ', key ' + x.key : '') + ')' });
          if (!I.length) console.log('  note ' + s.name + ': at 6x it made no fwMount call (' + A0.ins.length + ' at 1x)');
        } finally { await y.close(); }
      }
    }
    if (has || A0.ins.length) { ST.art.push(s.name); console.log('  info ' + s.name + ': ' + info.nodes + ' FW nodes in ' + info.spots + ' spots, ' + info.running + ' FW animations running' + (info.moving != null ? ' (' + info.moving + ' moving after a new app open)' : '') + (info.hidden != null ? ', ' + info.hidden + ' with the page hidden' : '') + (info.frame != null ? ', ' + info.frame + ' ms a frame at 6x' : '') + (info.ins ? ', ' + info.ins + ' fwMount calls (slowest ' + info.ins1 + ' ms at 1x' + (info.ins6 != null ? ', ' + info.ins6 + ' ms at 6x' : '') + ')' : '')); }
    else if (DEBUG) console.log('  .. ' + s.name + ': no fred world (0 FW nodes, 0 FW animations, 0 fwMount calls), ' + (Date.now() - t) + ' ms');
  };
  await run(each, { page: HOOKED, browser: B, motion: true, only: ONLY ? (s => ONLY.test(s.name)) : undefined });

  // report
  const rules = [
    ['nodes', 'at most ' + BUDGET.nodes + ' FW nodes on every screen (most: ' + ST.max.nodes[0] + (ST.max.nodes[1] ? ' on ' + ST.max.nodes[1] : '') + ')'],
    ['running', 'at most ' + BUDGET.anims + ' FW animations running on every screen, as it is and moving (most: ' + ST.max.running[0] + (ST.max.running[1] ? ' on ' + ST.max.running[1] : '') + ')'],
    ['not mounted', 'every piece of fred world art is in a spot fwMount knows'],
    ['off screen', 'nothing running off screen'],
    ['background', 'nothing running with the page hidden'],
    ['frame', 'at most ' + BUDGET.frameMs + ' ms main thread a frame at 6x where FW animations run (' + (ST.frames.length ? ST.frames.length + ' screens measured, costliest ' + ST.max.frame[0] + ' ms on ' + ST.max.frame[1] : 'no screen had any running') + ')'],
    ['insert', 'no fwMount call over ' + BUDGET.insMs + ' ms at 6x (' + (ST.ins ? ST.ins + ' calls, slowest ' + ST.max.ins6[0] + ' ms at 6x on ' + ST.max.ins6[1] : 'no screen made any') + ')'],
  ];
  const seen = new Set();
  for (const [rule, ok] of rules) {
    const L = FAILS.filter(f => f.rule === rule).filter(f => { const k = line(f).replace(/ \((as the screen is|moving after a new app open)\)$/, ''); if (seen.has(k)) return false; seen.add(k); return true; });
    if (!L.length) C.ok(true, ok); else for (const f of L) C.ok(false, line(f));
  }
  C.ok(!ST.unhooked.length, 'every screen is the hooked copy (window.__fwk there)', ST.unhooked);
  C.ok(ST.screens > 0 && !ST.broken.length, 'every screen reached (' + ST.screens + ')', ST.broken);
  const errs = ERRS.filter(([, e]) => e && e.length).map(([n, e]) => n + ': ' + e.slice(0, 2).join(' | '));
  C.ok(!errs.length, 'no page errors or console errors', errs.slice(0, 8));
  if (!ST.art.length) console.log('  no screen has fred world art yet: 0 FW nodes, 0 FW animations and 0 fwMount calls on all ' + ST.screens + ' screens, so the budgets have nothing to judge until a later item puts art on a screen');
  else console.log('  ' + ST.art.length + ' of ' + ST.screens + ' screens have fred world art or fwMount calls: ' + ST.art.slice(0, 12).join(', ') + (ST.art.length > 12 ? ' and ' + (ST.art.length - 12) + ' more' : ''));
}

await main();
