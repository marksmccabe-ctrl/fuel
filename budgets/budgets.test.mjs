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
//               in the page): at most 4 ms, the whole screen's main thread (its own motion, item 87's sky included, counts too, and
//               fred world gets no share of its own). A screen over 4 ms is measured again, each time after a new app open (his move
//               runs from its start again, as in the first window), up to 3 windows in all (BUDGET.tries), and the lowest is judged
//               (frameLow, frameOver). A screen that fails prints its frame once more with the FW animations paused (ownCost: the
//               screen's own motion alone), for the reader: it is not judged.
//               The host: the same page reads two to three times higher while the machine is busy (the desktop's own activity, as
//               screen sharing with a busy browser on screen, or another browser test): item 87's skies read 3.4-4.8 ms at 6x there
//               and 0.5-2 on a quiet host. So every screen's windows are read between two readings of a host reference,
//               hostref.html (this folder: the kit's own fixed page of rain, snow and SVG loops, nothing from the app; quiet 1.1-1.7
//               ms a frame at 6x, busy 2.3-3.5), and judged only when both are at most BUDGET.refMs (1.8). Over it, the screen is read
//               again 20 s later, up to 3 reads (frameHost); still busy, its frame is not judged and the step fails with "host busy:
//               frame not judged" (rule 'host busy'), never OK or FAIL on those windows. After a screen the host stayed busy for, the
//               next ones get one read each until one finds it quiet. The reference is read at the start of the walk too; the OK line
//               gives its range
//   insert      every fwMount call the screen made, from the page's first line through go(): the screen is opened again with the 6x
//               slowdown on from the start (set on the page before it loads) and each call must take at most 50 ms. A screen whose
//               calls go to the same spots as one already measured is not opened again (BUDGETS_INS_ALL=1 opens each)
//   errors      no page errors or console errors (the hooked copy must behave as the page)
//   Self-tests on plan-before (so the audit can't pass by measuring nothing), probes mounted through __fwk and then taken out:
//   FW.bird({}) and FW.scene(id) (in a .fw-scene box, as the bundle's notes say) in spots on screen: their nodes are counted and
//   their running fw- animations seen, and the budget judge flags them at limits just under what they hold; a bird in a spot far
//   below the fold, seen once (it moves) and scrolled away: paused, not counted as running, not off screen; FW.bird({}) put with
//   innerHTML in a plain div, also below the fold: flagged as not mounted, and its own loops don't run (item 97 stops art outside a
//   spot); a fw- loop the app's rules can't reach (an inline animation in that div, standing in for art put in some other way):
//   flagged as running off screen; the page hidden: nothing in a spot runs, and that loop is caught; __fwIns holds the three probe inserts; the frame instrument counts frames and
//   main-thread time; the frame rule: frameLow on made-up windows measures again only over 4 ms, stops at the first window under
//   it or at 3, and keeps the lowest; FW.scene(id) moving alone, measured with frameLow as the walk does: the judge fails it at a
//   budget just under what it costs and passes it just over, and with the FW animations paused (ownCost, the failing line's
//   reading) the pause takes its cost off; the host reference reads its loops (more than 3x its reading with them still) and nothing
//   of it runs between reads; frameHost on made-up readings judges a screen only with both readings at most refMs, reads again 20 s
//   later while one is over (each read numbered, so the walk replays the drawings), and leaves it not judged after 3 reads (1 once
//   the host stayed busy); the walk's frame on one screen (screenFrame), the scene moving: with refMs + 1 ms more work a frame on the
//   reference (a busy host stand-in) not judged ("host busy") after 3 reads, and 1 read on the next screen; with the reference itself
//   again, under a host limit no reading reaches and a 0.01 ms budget, judged and failed (3 windows, the paused reading); a page
//   opened at 6x is slowed from its start (a fixed loop runs more than 2.5x slower than at 1x); taken out, nothing is left.
//   Then informational numbers (not pass/fail) for the later items, per drawing alone in a spot on plan-before (no wrapper class but
//   .fw-scene for the scene): its nodes, its fw- animations running once moving, its insert (fwMount with a function, so the build is
//   timed too, plus the forced layout) at 1x and 6x (median of 3), and main-thread ms per frame at 6x while it moves (with the screen
//   alone for comparison).
// Output: one FAIL line per failure (the screen, the rule, the element and the numbers), an info line per screen with fred world art,
// a summary, then the checker's last line (with the host reference's range). BUDGETS_DEBUG=1 prints every screen's numbers;
// BUDGETS_SELF=0 skips the self-tests and the informational numbers; BUDGETS_INS_ALL=1 (above).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { run, openScreen, screens } from '../lib/screens.mjs';
import { checker } from '../lib/open.mjs';

const ARG = process.argv[2], ONLY = process.argv[3] ? new RegExp(process.argv[3]) : null;
const DEBUG = !!process.env.BUDGETS_DEBUG, SELF = process.env.BUDGETS_SELF !== '0', INS_ALL = !!process.env.BUDGETS_INS_ALL;
const REF_MS = 1.8; /* hostref.html at 6x, the most a quiet host gives it: see the frame rule above (the Mac Studio: quiet 1.1-1.7, busy 2.3-3.5; another host measures it again) */
const BUDGET = { nodes: 1200, anims: 30, frameMs: 4, insMs: 50, rate: 6, win: 2000, tries: 3, refMs: REF_MS, hostTries: 3, waitMs: 20000 };
/* tries: 2 s windows at most on a screen over frameMs, the lowest judged. refMs: the host reference's most on a quiet host (hostref.html's
   main-thread ms a frame at 6x; the frame is judged only next to readings at most this); hostTries: reads of a screen (reference, windows,
   reference) while the host is busy, waitMs apart; then its frame is not judged */
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
// the frame on a screen: one window (measure(0): frameCost); over L.frameMs, measured again (measure(1), measure(2): the walk replays the
// screen's drawings first, so each window has them moving as the first had) up to L.tries windows in all, stopping at the first under it,
// and the lowest kept (load on the machine only adds to a window). F.all: every window read
async function frameLow(measure, L = BUDGET) {
  const all = [await measure(0)]; let F = all[0];
  while (F.ms != null && F.ms > L.frameMs && all.length < L.tries) { const G = await measure(all.length); all.push(G); if (G.ms != null && G.ms < F.ms) F = G; }
  return Object.assign({}, F, { all: all.map(x => x.ms) });
}
// the frame rule (QUEUE.md: at most 4 ms main thread per frame at 6x with the screen's motion running): the whole screen, no share
const frameOver = (F, L = BUDGET) => F.ms > L.frameMs;
// the screen's own motion alone, for a failing screen's line (not judged): every running fw- animation paused for the measure, then
// played on. After pause() / play() the browser no longer follows those animations' CSS play state, so this is the last thing measured
// on a page (the walk opens a new one after it, the self-test takes its probe out)
async function ownCost(p) {
  await p.evaluate(() => { window.__fwkP = document.getAnimations().filter(a => String(a.animationName || '').startsWith('fw-') && a.playState === 'running'); window.__fwkP.forEach(a => a.pause()); });
  try { return await frameCost(p); } finally { await p.evaluate(() => { (window.__fwkP || []).forEach(a => a.play()); window.__fwkP = null; }); }
}
// the host reference: hostref.html (this folder), the kit's own fixed page, open in its own context through the whole run, its loops
// still except while it is read (html.on), so it adds nothing while a screen is measured. refCost: its frame at 6x, as frameCost reads a
// screen's. The same work reads higher on a busy host (the desktop's own activity: screen sharing, WindowServer, a backup), the app's
// screens with it, so a frame window is judged only next to a quiet reading
const REF_PAGE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'hostref.html');
async function openRef(B) {
  const ctx = await B.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' }), p = await ctx.newPage();
  await p.goto(pathToFileURL(REF_PAGE).href); await p.waitForLoadState('load');
  await p.evaluate(() => document.documentElement.classList.add('on')); await sleep(1500); await p.evaluate(() => document.documentElement.classList.remove('on')); /* warmed up (a first read runs high) */
  return { p, close: () => ctx.close() };
}
async function refCost(p) {
  await p.evaluate(() => document.documentElement.classList.add('on'));
  try { return await frameCost(p); } finally { await p.evaluate(() => document.documentElement.classList.remove('on')); }
}
const hostQuiet = (refs, L = BUDGET) => refs.length > 0 && refs.every(r => r != null && r <= L.refMs);
// the frame on a screen, judged only on a quiet host: the reference read just before the screen's windows (windows(k): frameLow, k the
// read's number, so the walk replays the drawings before a read after the first) and just after; both at most L.refMs, the windows are
// judged. Over it, the host is busy: wait L.waitMs and read again, up to L.hostTries reads (once: a single read, no wait, after the host
// stayed busy on an earlier screen); still busy, the frame is not judged (judged false), never passed or failed on those windows
async function frameHost(windows, ref, L = BUDGET, wait = sleep, once = false) {
  const reads = [];
  for (let k = 0; k < (once ? 1 : L.hostTries); k++) {
    if (k) await wait(L.waitMs);
    const r0 = await ref(), F = await windows(k), r1 = await ref(), x = { F, refs: [r0.ms, r1.ms] };
    reads.push(x);
    if (hostQuiet(x.refs, L)) return { F, refs: x.refs, reads, judged: true };
  }
  const z = reads[reads.length - 1];
  return { F: z.F, refs: z.refs, reads, judged: false };
}
// the frame rule on one screen, as the walk runs it: its windows (frameLow; a replay before each but the screen's very first when its
// drawings were made to move) read between the host reference's readings (frameHost). A quiet host: judged, and a screen over L.frameMs
// gets a 'frame' failure with its paused reading added (ownCost: the last thing measured on the page). A busy one: a 'host busy' failure,
// the frame not judged. S: the walk's state (hostBusy, busy, refs, waited, frames, again, max.frame); out: the failures
async function screenFrame(name, p, running, replay, REF, S, out, L = BUDGET, wait = sleep) {
  const win = async (i, k) => { if ((i || k) && replay) { await p.evaluate(() => window.__fwkA.appOpen()); await until(() => p.evaluate(() => !!document.querySelector('.fwm.fwm-go')), 2000); await sleep(150); }
    const W = await frameCost(p); W.after = (await audit(p)).running; return W; };
  const H = await frameHost(k => frameLow(i => win(i, k), L), () => refCost(REF.p), L, wait, S.hostBusy);
  const F = H.F, r = { F, H, refs: H.reads.map(x => x.refs.join('/')), own: null };
  S.frames.push(name);
  if (!H.judged) { S.hostBusy = true; S.busy.push(name);
    out.push({ screen: name, rule: 'host busy', sel: 'the page', detail: 'frame not judged: the host reference read ' + r.refs.join(', ') + ' ms a frame at 6x just before / after the screen\'s windows (quiet at most ' + L.refMs + '), ' + H.reads.length + (H.reads.length > 1 ? ' reads ' + L.waitMs / 1000 + ' s apart' : ' read') + '; the screen read ' + H.reads.map(x => x.F.all.join('/')).join(', ') + ' ms there' });
    return r; }
  S.hostBusy = false; S.refs.push(...H.refs); if (H.reads.length > 1) S.waited.push(name + ' (' + H.reads.length + ' reads)');
  if (F.ms != null && F.ms > S.max.frame[0]) S.max.frame = [F.ms, name];
  if (F.all.length > 1) S.again.push(name + ' ' + F.all.join('/'));
  if (frameOver(F, L)) { const own = await ownCost(p); r.own = own.ms;
    out.push({ screen: name, rule: 'frame', sel: 'the page', detail: F.ms + ' ms main thread a frame at 6x over 2 s, the lowest of ' + F.all.length + ' windows (' + F.all.join(', ') + ' ms; ' + F.frames + ' frames, ' + F.task + ' ms of tasks; budget ' + L.frameMs + ' ms) with ' + running + ' FW animations running (' + F.after + ' at the end), the host reference ' + H.refs.join('/') + ' ms (quiet); with them paused the screen reads ' + own.ms + ' ms (not judged)' }); }
  return r;
}
// more main-thread work each frame on a page (ms of wall time in a requestAnimationFrame loop; 0 stops it): a busy host's stand-in
const spin = (p, ms) => p.evaluate(ms => { const g = window.__kitSpin = (window.__kitSpin || 0) + 1; if (!ms) return; const f = () => { if (window.__kitSpin !== g) return; const t = performance.now(); while (performance.now() - t < ms); requestAnimationFrame(f); }; requestAnimationFrame(f); }, ms);

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
    const REF = await openRef(B);
    if (SELF) await selfTest(B, HOOKED, C, ERRS, REF);
    await walk(B, HOOKED, C, FAILS, ERRS, REF);
  } finally { await B.close(); }
  console.log('  (' + Math.round((Date.now() - T0) / 1000) + ' s)');
  const rr = ST.refs.filter(x => x != null), host = rr.length ? ' (host reference ' + r2(Math.min(...rr)) + '-' + r2(Math.max(...rr)) + ' ms, quiet at most ' + BUDGET.refMs + ')' : '';
  C.done('fred world budgets: ' + ST.screens + ' screens' + (ST.art.length ? ' (' + ST.art.length + ' with fred world art)' : ' (none with fred world art yet: all zeros)') + ', at most 1,200 FW nodes and 30 running FW animations, nothing running off screen or hidden, 4 ms a frame' + host + ' and 50 ms an insert at 6x' + (SELF ? '; self-tests on ' + SELF_SCREEN : ''));
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

async function selfTest(B, HOOKED, C, ERRS, REF) {
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
    await p.evaluate(() => { const d = document.getElementById('fwkD'); d.innerHTML = window.FW.bird({}) + '<i style="display:block;width:20px;height:20px;animation:fw-ch-bob 2.4s infinite"></i>'; }); /* a bird with innerHTML (its own loops stay still: item 97), and a fw- loop no app rule reaches */
    const moving = await until(async () => { const A = await audit(p), a = spotOf(A, 'fwkA'), b = spotOf(A, 'fwkB'); return a && b && a.go && b.go && a.running && b.running ? A : null; }, 3000);
    const A1 = moving || await audit(p), a = spotOf(A1, 'fwkA'), b = spotOf(A1, 'fwkB'), c = spotOf(A1, 'fwkC'), sum = [a, b, c].reduce((n, x) => n + (x ? x.nodes : 0), 0);
    const pr = L => L.filter(g => /fwk/.test(g.sel)); /* (the probes' findings: the screen's own art, in a later item, is judged in the walk) */
    C.ok(!!a && !!b && !!c && sum > 0 && A1.nodes === A1.spots.reduce((n, x) => n + x.nodes, 0) && A1.nodes >= A0.nodes + sum, 'self-test: the probes\' nodes are counted (' + A1.nodes + ' FW nodes: bird ' + (a && a.nodes) + ', scene ' + (b && b.nodes) + ', bird below ' + (c && c.nodes) + ')', { nodes: A1.nodes, before: A0.nodes, a, b, c });
    C.ok(!!moving && a.running > 0 && b.running > 0 && A1.running >= a.running + b.running, 'self-test: the moving probes\' fw- animations are seen running (bird ' + (a && a.running) + ', scene ' + (b && b.running) + '; ' + A1.running + ' on the page)', { a, b, running: A1.running });
    C.ok(!!c && !c.go && c.running === 0 && !A1.offs.some(g => /fwk[ABC]\b/.test(g.sel)), 'self-test: the spot below the fold, never seen, runs nothing (still)', c);
    C.ok(pr(A1.unmounted).length === 1 && /fwkD/.test(pr(A1.unmounted)[0].sel), 'self-test: the bird put in with innerHTML is flagged as not mounted with fwMount (and no probe in a spot is)', A1.unmounted);
    const dOwn = await p.evaluate(() => document.querySelector('#fwkD svg').getAnimations({ subtree: true }).length);
    C.ok(dOwn === 0, 'self-test: that bird\'s own loops do not run (item 97: art outside a spot is still)', dOwn);
    C.ok(pr(A1.offs).length === 1 && /fwkD/.test(pr(A1.offs)[0].sel) && pr(A1.offs)[0].n > 0, 'self-test: the loop no app rule reaches, running below the fold, is flagged as off screen (and no probe in a spot is)', A1.offs);
    const J = []; judge('self-test', A1, J, '', { nodes: A1.nodes - 1, anims: A1.running - 1 });
    C.ok(J.some(f => f.rule === 'nodes') && J.some(f => f.rule === 'running') && J.some(f => f.rule === 'not mounted') && J.some(f => f.rule === 'off screen'), 'self-test: the judge flags nodes and running animations over a limit just under what the page holds, the unmounted art and the off-screen loops', J.map(f => f.rule + ' ' + f.sel));
    const F = await frameCost(p);
    C.ok(F.frames >= 30 && F.ms > 0, 'self-test: the frame instrument measures (' + F.frames + ' frames in 2 s at 6x, ' + F.ms + ' ms main thread a frame with the probes moving)', F);
    const H = await p.evaluate(() => window.__fwkA.hidden()), A2 = await audit(p);
    C.ok(!H.by.some(g => /fwk[ABC]\b/.test(g.sel)) && H.by.some(g => /fwkD/.test(g.sel)), 'self-test: the page hidden, nothing in a spot runs (' + (spotOf(A2, 'fwkA') || {}).running + '/' + (spotOf(A2, 'fwkB') || {}).running + ' running again once shown), and the loop no app rule reaches, still running, is caught', H.by);
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
    // the frame rule. frameLow on made-up windows (ms a frame, budget 4, 3 tries): one window under the budget is all; over it, measured
    // again, stopping at the first window under it; at most 3 windows; the lowest kept, and judged against the whole budget
    const fake = async (seq, L) => { const k = []; const F = await frameLow(async i => { k.push(i); return { ms: seq[k.length - 1], frames: 60, task: 0 }; }, L); return { ms: F.ms, all: F.all.join(' '), over: frameOver(F, L), k: k.join(' ') }; };
    const L3 = { frameMs: 4, tries: 3 }, fk = [await fake([3.2, 9, 9], L3), await fake([5, 3.9, 9], L3), await fake([5, 4.5, 4.2, 1], L3), await fake([4.6, 5, 6, 1], L3), await fake([4, 9], L3)];
    C.ok(fk[0].all === '3.2' && !fk[0].over && fk[1].all === '5 3.9' && fk[1].ms === 3.9 && !fk[1].over && fk[2].all === '5 4.5 4.2' && fk[2].ms === 4.2 && fk[2].over
      && fk[3].all === '4.6 5 6' && fk[3].ms === 4.6 && fk[3].over && fk[4].all === '4' && !fk[4].over && fk[3].k === '0 1 2' && fk[1].k === '0 1',
      'self-test: frameLow on made-up windows measures again only over the budget (each window told its number, so the walk replays the drawings before a second or third), stops at a window under it or at 3, keeps the lowest, and frameOver judges that against the whole 4 ms (' + fk.map(x => x.all + ' -> ' + x.ms + (x.over ? ' over' : '')).join('; ') + ')', fk);
    // the scene (the costliest drawing) moving alone at the top of the screen, measured with frameLow as the walk does: the judge fails it
    // at a budget just under what it costs and passes it just over; then with the FW animations paused (ownCost, the reading a failing
    // screen's line adds): the pause must take its cost off (the screen alone is still). The probe goes after (ownCost's play() leaves its
    // loops off their CSS play state)
    await probe(p, 'fwkE', 'fw-scene fw-phone', 'width:360px'); await mountJs(p, 'fwkE', 'scene', 'kit:e');
    const eGo = await until(async () => { const x = spotOf(await audit(p), 'fwkE'); return x && x.go && x.running ? x : null; }, 3000);
    const FE = await frameLow(() => frameCost(p)), OE = await ownCost(p);
    await unmount(p, ['fwkE']);
    C.ok(!!eGo && FE.frames >= 30 && OE.frames >= 30 && FE.ms > 0 && OE.ms != null && OE.ms < FE.ms / 2
      && frameOver(FE, { frameMs: FE.ms - 0.01, tries: 3 }) && !frameOver(FE, { frameMs: FE.ms + 0.01, tries: 3 }),
      'self-test: the frame rule on the scene moving alone: ' + FE.ms + ' ms a frame at 6x (' + FE.all.join(', ') + '), over a budget just under that and not over one just over; ' + OE.ms + ' ms with the FW animations paused (the pause takes its cost off)', { eGo: !!eGo, FE, OE });
    // the host reference: read with its loops running, then still (as it is between reads). Its loops are what it reads, and between reads
    // nothing of it runs
    const R1 = await refCost(REF.p), R0 = await frameCost(REF.p), rRun = await REF.p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length);
    C.ok(R1.frames >= 30 && R1.ms > 0 && R0.ms != null && R1.ms > 3 * R0.ms && rRun === 0,
      'self-test: the host reference (hostref.html) reads ' + R1.ms + ' ms a frame at 6x with its loops running (quiet at most ' + BUDGET.refMs + '), ' + R0.ms + ' ms with them still, and nothing of it runs between reads', { R1, R0, rRun });
    // frameHost on made-up readings (the reference's, before and after each read of a screen's windows; the waits counted, not slept)
    const hfake = async (seq, L, once) => { let i = 0, waits = 0; const ks = [];
      const H = await frameHost(async k => { ks.push(k); return { ms: 2, all: [2] }; }, async () => ({ ms: seq[i++] }), L, async ms => { waits += ms; }, once);
      return { judged: H.judged, n: H.reads.length, waits, ks: ks.join(' '), refs: H.refs.join(' ') }; };
    const LH = { refMs: 1.5, hostTries: 3, waitMs: 20000 };
    const hk = [await hfake([1, 1.2], LH), await hfake([3, 1, 1, 1], LH), await hfake([1, 3, 1, 1.5], LH), await hfake([3, 3, 3, 3, 3, 3, 1, 1], LH), await hfake([3, 3, 1, 1], LH, true), await hfake([1.5, 1.51, 1, 1], LH)];
    C.ok(hk[0].judged && hk[0].n === 1 && hk[0].waits === 0 && hk[0].ks === '0' && hk[1].judged && hk[1].n === 2 && hk[1].waits === 20000 && hk[1].ks === '0 1'
      && hk[2].judged && hk[2].n === 2 && hk[2].refs === '1 1.5' && !hk[3].judged && hk[3].n === 3 && hk[3].waits === 40000 && hk[3].ks === '0 1 2'
      && !hk[4].judged && hk[4].n === 1 && hk[4].waits === 0 && hk[5].judged && hk[5].n === 2,
      'self-test: frameHost on made-up readings judges a screen\'s windows only with the reference at most ' + LH.refMs + ' just before and just after them, reads again ' + LH.waitMs / 1000 + ' s later while it is over (each read told its number, so the walk replays the drawings), and after 3 reads (1 once the host stayed busy on an earlier screen) leaves them not judged (' + hk.map(x => x.refs + (x.judged ? ' judged' : ' not judged') + ' after ' + x.n).join('; ') + ')', hk);
    // the walk's frame on one screen (screenFrame), the scene moving on the self-test screen. The reference given more main-thread work each
    // frame (refMs + 1 ms of wall time, standing in for a busy host): 'host busy', not judged, after 3 reads (the waits not slept), then
    // 1 read on the next screen. The reference itself again, under a host limit no reading reaches and a frame budget the scene is over:
    // judged, a 'frame' failure (3 windows) with the paused reading, and the host quiet again
    await probe(p, 'fwkF', 'fw-scene fw-phone', 'width:360px'); await mountJs(p, 'fwkF', 'scene', 'kit:f');
    const fGo = await until(async () => { const x = spotOf(await audit(p), 'fwkF'); return x && x.go && x.running ? x : null; }, 3000);
    const S0 = { hostBusy: false, busy: [], refs: [], waited: [], frames: [], again: [], max: { frame: [0, ''] } }, O1 = [], O2 = [], O3 = [], nowait = async () => {};
    let Q1 = null, Q2 = null, Q3 = null;
    await spin(REF.p, BUDGET.refMs + 1);
    try { Q1 = await screenFrame('self-test busy', p, fGo ? fGo.running : 0, true, REF, S0, O1, BUDGET, nowait); Q2 = await screenFrame('self-test busy, the next screen', p, 0, true, REF, S0, O2, BUDGET, nowait); }
    finally { await spin(REF.p, 0); }
    const busyOk = O1.length === 1 && O1[0].rule === 'host busy' && Q1.H.reads.length === BUDGET.hostTries && Q1.H.reads.every(x => x.refs.every(r => r > BUDGET.refMs))
      && O2.length === 1 && O2[0].rule === 'host busy' && Q2.H.reads.length === 1 && S0.busy.length === 2 && !S0.refs.length && S0.hostBusy;
    await p.evaluate(() => window.__fwkA.appOpen()); /* moving again (it settled during the busy reads), as the walk makes a screen's drawings move before its frame */
    const fGo2 = await until(async () => { const x = spotOf(await audit(p), 'fwkF'); return x && x.go && x.running ? x : null; }, 3000);
    try { Q3 = await screenFrame('self-test quiet', p, fGo2 ? fGo2.running : 0, true, REF, S0, O3, Object.assign({}, BUDGET, { refMs: 1e9, frameMs: 0.01 }), nowait); } finally { await unmount(p, ['fwkF']); }
    const quietOk = !!Q3 && Q3.H.judged && O3.length === 1 && O3[0].rule === 'frame' && Q3.F.all.length === BUDGET.tries && Q3.own != null && Q3.own < Q3.F.ms && !S0.hostBusy && S0.refs.length === 2;
    C.ok(!!fGo && !!fGo2 && busyOk && quietOk, 'self-test: the walk\'s frame on one screen with the scene moving: ' + (BUDGET.refMs + 1) + ' ms more work a frame on the reference (a busy host stand-in) reads ' + (Q1 && Q1.refs.join(', ')) + ' ms, so it is not judged ("host busy") after ' + (Q1 && Q1.H.reads.length) + ' reads, and the next screen gets ' + (Q2 && Q2.H.reads.length) + '; the reference itself again (' + (Q3 && Q3.refs.join(', ')) + ' ms) under a host limit no reading reaches and a 0.01 ms budget: judged, a frame failure (' + (Q3 && Q3.F.all.join(', ')) + ' ms; ' + (Q3 && Q3.own) + ' paused)', { O1, O2, O3, S0, reads1: Q1 && Q1.H.reads.length, reads2: Q2 && Q2.H.reads.length });
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
const ST = { screens: 0, broken: [], art: [], unhooked: [], ins: 0, frames: [], again: [], refs: [], busy: [], waited: [], hostBusy: false, insSeen: new Map(), max: { nodes: [0, ''], running: [0, ''], ins6: [0, ''], frame: [0, ''] } };
async function walk(B, HOOKED, C, FAILS, ERRS, REF) {
  // the host at the start: the reference read (again waitMs later while it is over refMs, up to hostTries reads). Still busy: each screen
  // gets one read (no waits) until a screen finds the host quiet again
  const start = [];
  for (let k = 0; k < BUDGET.hostTries; k++) { if (k) await sleep(BUDGET.waitMs); start.push((await refCost(REF.p)).ms); if (hostQuiet(start.slice(-1))) break; }
  ST.hostBusy = !hostQuiet(start.slice(-1)); if (!ST.hostBusy) ST.refs.push(start[start.length - 1]);
  console.log('-- the host reference at the start: ' + start.join(', ') + ' ms a frame at 6x (quiet at most ' + BUDGET.refMs + ')' + (ST.hostBusy ? ': the host is busy' : ''));
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
        /* the host reference just before and just after the windows (over 4 ms: up to 3 windows, the lowest kept); busy, read again 20 s later, up to 3 reads */
        const R = await screenFrame(s.name, p, M.running, M !== A0, REF, ST, FAILS);
        info.frame = R.F.ms; info.all = R.F.all; info.refs = R.refs; info.judged = R.H.judged; info.own = R.own;
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
    if (has || A0.ins.length) { ST.art.push(s.name); console.log('  info ' + s.name + ': ' + info.nodes + ' FW nodes in ' + info.spots + ' spots, ' + info.running + ' FW animations running' + (info.moving != null ? ' (' + info.moving + ' moving after a new app open)' : '') + (info.hidden != null ? ', ' + info.hidden + ' with the page hidden' : '') + (info.frame != null ? ', ' + info.frame + ' ms a frame at 6x' + (info.all && info.all.length > 1 ? ' (the lowest of ' + info.all.join(', ') + ')' : '') + ' (host reference ' + info.refs.join(', ') + ' ms' + (info.judged ? '' : ': busy, not judged') + ')' : '') + (info.own != null ? ' (with the FW animations paused ' + info.own + ' ms, not judged)' : '') + (info.ins ? ', ' + info.ins + ' fwMount calls (slowest ' + info.ins1 + ' ms at 1x' + (info.ins6 != null ? ', ' + info.ins6 + ' ms at 6x' : '') + ')' : '')); }
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
    ['frame', 'at most ' + BUDGET.frameMs + ' ms main thread a frame at 6x where FW animations run, the whole screen (' + (ST.frames.length ? (ST.frames.length - ST.busy.length) + ' screens judged' + (ST.busy.length ? ' of ' + ST.frames.length + ' (the others not judged, the host busy: below)' : '') + ', costliest ' + ST.max.frame[0] + ' ms on ' + ST.max.frame[1] + (ST.again.length ? '; over ' + BUDGET.frameMs + ' ms on a first window, the lowest of up to ' + BUDGET.tries + ' kept: ' + ST.again.join(', ') : '') : 'no screen had any running') + ')'],
    ['host busy', 'every frame judged next to a quiet host (the host reference at most ' + BUDGET.refMs + ' ms a frame at 6x just before and just after its windows' + (ST.refs.length ? ': ' + r2(Math.min(...ST.refs)) + '-' + r2(Math.max(...ST.refs)) + ' ms' : '') + (ST.waited.length ? '; read again after a busy reading: ' + ST.waited.join(', ') : '') + ')'],
    ['insert', 'no fwMount call over ' + BUDGET.insMs + ' ms at 6x (' + (ST.ins ? ST.ins + ' calls, slowest ' + ST.max.ins6[0] + ' ms at 6x on ' + ST.max.ins6[1] : 'no screen made any') + ')'],
  ];
  const seen = new Set();
  for (const [rule, ok] of rules) {
    const L = FAILS.filter(f => f.rule === rule).filter(f => { const k = line(f).replace(/ \((as the screen is|moving after a new app open)\)$/, ''); if (seen.has(k)) return false; seen.add(k); return true; });
    if (rule === 'frame' && ST.frames.length && ST.frames.length === ST.busy.length) { console.log('  frame: no screen judged (the host busy on all ' + ST.frames.length + ': below)'); continue; } /* no ok for a rule nothing was judged by */
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
