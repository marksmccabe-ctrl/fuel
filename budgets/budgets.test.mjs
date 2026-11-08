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
//               ms a frame at 6x, busy 2.3-3.5), and judged only when both are at most BUDGET.refMs (1.8). The reference reads higher
//               with anything that draws while it is read, the screen under test in the same browser too (two FW.scene probes moving
//               next to it: 1.69-1.84 ms; stopped 1.15-1.23; taken out 1.14-1.35), so the screen is held still while it is read
//               (stillWhile: its document timeline's playback rate 0 through CDP Animation.setPlaybackRate, every animation on it
//               stopped where it is, then 1 again; Page.setWebLifecycleState frozen does nothing to a shown page in this headless
//               shell) and its drawings are replayed (a new app open) before every window, the first included. Over the limit, the
//               screen is read again 20 s later, up to 3 reads (frameHost); still busy, its frame is not judged and the step fails
//               with "host busy: frame not judged" (rule 'host busy'), never OK or FAIL on those windows. After a screen the host
//               stayed busy for, the next ones get one read each until one finds it quiet. The reference is read at the start of the
//               walk too; the OK line gives its range. A judged window must have the screen moving (an animation running at both
//               ends of it advanced at least half its length) and 30 frames, or it is a 'frame' failure (not measured)
//   insert      every fwMount call the screen made, from the page's first line through go(): the screen is opened again with the 6x
//               slowdown on from the start (set on the page before it loads) and each call must take at most 50 ms. A screen whose
//               calls go to the same spots as one already measured is not opened again (BUDGETS_INS_ALL=1 opens each)
//   errors      no page errors or console errors (the hooked copy must behave as the page)
//   The limits are QUEUE.md's (RULE_TEXT, its line word for word; a self-test holds BUDGET to the numbers in it) and the last line is
//   written from them. The report holds the walk's state against its failures: a rule gets its ok only when nothing failed it and
//   nothing the walk saw contradicts that (gaps: a number over its limit on a screen with no failure under that rule there, FW
//   animations that ran on a screen the frame rule did not measure, a window kept without the screen moving and no frame failure, a
//   screen the host stayed busy for with no 'host busy' line, fwMount calls whose spots were never read at 6x), each such gap a FAIL
//   line of its own, so a walk whose failure list was dropped still fails on each failure it found.
//   Self-tests on plan-before (so the audit can't pass by measuring nothing), probes mounted through __fwk and then taken out:
//   BUDGET holds the numbers read out of QUEUE.md's rule (1,200, 30, 4 ms, 6x, 50 ms), that text being main's QUEUE.md line when git
//   can show it, and the last line names other numbers under other limits;
//   FW.bird({}) and FW.scene(id) (in a .fw-scene box, as the bundle's notes say) in spots on screen: their nodes are counted and
//   their running fw- animations seen, and the budget judge flags them at limits just under what they hold; a bird in a spot far
//   below the fold, seen once (it moves) and scrolled away: paused, not counted as running, not off screen; FW.bird({}) put with
//   innerHTML in a plain div, also below the fold: flagged as not mounted, and its own loops don't run (item 97 stops art outside a
//   spot); a fw- loop the app's rules can't reach (an inline animation in that div, standing in for art put in some other way):
//   flagged as running off screen; the page hidden: nothing in a spot runs, and that loop is caught; __fwIns holds the three probe
//   inserts; the frame instrument counts frames and main-thread time, slowing the page (and the host reference) to the rule's 6x for
//   the window and back; the frame rule: frameLow on made-up windows measures again only over 4 ms, stops at the first window under
//   it or at 3, and keeps the lowest; FW.scene(id) moving alone, measured with frameLow as the walk does: the judge fails it at a
//   budget just under what it costs and passes it just over, and with the FW animations paused (ownCost, the failing line's
//   reading) the pause takes its cost off; the host reference reads its loops (more than 3x its reading with them still) and nothing
//   of it runs between reads; frameHost on made-up readings (each read's windows reading differently) calls the reference just
//   before and just after the windows (in that order), judges a screen only with both readings at most refMs, reads again 20 s later
//   while one is over (each read numbered), returns the windows and readings of the read it judged (never an earlier, busy read's),
//   and leaves it not judged after 3 reads (1 once the host stayed busy) with its last read's; the walk's frame on one screen
//   (screenFrame), the scene moving: a fixed busy stand-in (BUSY_SPIN ms more work a frame on the reference, reading at least
//   HOST_BUSY_LOW, the lowest busy reading on record, which the committed refMs must be under) not judged ("host busy") after 3
//   reads, 1 read on the next screen, and the host quiet again, 1 read, judged; a host busy on the first read only (a heavier
//   stand-in, stopped before the second read, from which the screen gets that much more work), under a frame budget between the two
//   reads' windows: judged on the second read's windows, one 'frame' failure on that read's reading and reference, through the report
//   FAIL 1 (the first read's windows under the budget); the walk's frame block (walkFrame, as the walk runs it, with a failure list of
//   its own) with one scene, one bird (2 animations: a light screen, as the weather screens are with 3-7) and two scenes (over 4 ms)
//   under the committed limits: each measured and judged (not "host busy"), the bird with no failure, the two scenes failed (3
//   windows, the paused reading) and their list, through the report, ends FAIL 1 with that line, no ok for the frame rule and no OK
//   title, and each trace, read from the two pages themselves, is reference, (app open, window) 1 to 3 times, reference, with the
//   screen still through each reference read and moving through each window (on a busy host these give a 'host busy' line instead,
//   when the reference alone reads busy too; quiet alone, the screen pushed it up: a failure); a screen whose animations are all
//   paused: a 'frame' failure, not measured; the walk's own work on one screen (walker, as walk() runs it on every screen) with probes
//   on a page of its own (a bird in a spot, a bird with innerHTML far below with a loop no app rule reaches; the screen opened again
//   at 6x with the same bird mounted there) under limits every probe is over: a failure and its line through the report under each
//   rule (nodes, running, not mounted, off screen, background, frame or host busy, insert), every FAIL line the walk's own (no gap),
//   its record of the screen held against no failures a gap under each of those rules, and the page opened again slowed to 6x from
//   its start; the report, through the real checker: a walk with two 'frame' failures
//   (over the budget, not measured) ends FAIL 2 with both lines, no ok for the frame rule and no OK title, a walk with a busy screen
//   ends FAIL with its 'host busy' line, never the OK title, every screen busy gives no ok for the frame rule, one with none busy is
//   all ok, and a failure under a rule it does not list fails it; on made-up walks each gap (nodes, running, not mounted, off screen,
//   background, frame not measured, frame over, frame window without motion, host busy, insert never read, insert over) ends FAIL 1
//   with its own line, and with its failure, that line only; a page opened at 6x is slowed from its start (a fixed loop runs more than
//   2.5x slower than at 1x); taken out, nothing is left.
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
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { run, openScreen, screens } from '../lib/screens.mjs';
import { checker } from '../lib/open.mjs';

const ARG = process.argv[2], ONLY = process.argv[3] ? new RegExp(process.argv[3]) : null;
const DEBUG = !!process.env.BUDGETS_DEBUG, SELF = process.env.BUDGETS_SELF !== '0', INS_ALL = !!process.env.BUDGETS_INS_ALL;
const REF_MS = 1.8; /* hostref.html at 6x, the most a quiet host gives it: see the frame rule above (the Mac Studio: quiet 1.1-1.7, busy 2.3-3.5; another host measures it again) */
const HOST_BUSY_LOW = 2.3; /* the lowest reading of hostref.html at 6x on record with the host busy (the Mac Studio, 2026-11-07: the desktop busy 2.81-2.98, another headless browser with 4 heavy pages 2.3-3.5): REF_MS must be under it (a self-test) */
const BUSY_SPIN = 1.5; /* the self-tests' busy host stand-in: ms of wall time more work each frame on the reference, fixed (not tied to REF_MS), so it reads about 2.6-3.2 on a quiet host, inside the busy range; it must read at least HOST_BUSY_LOW */
const BUDGET = { nodes: 1200, anims: 30, frameMs: 4, insMs: 50, rate: 6, win: 2000, tries: 3, refMs: REF_MS, hostTries: 3, waitMs: 20000 };
/* tries: 2 s windows at most on a screen over frameMs, the lowest judged. refMs: the host reference's most on a quiet host (hostref.html's
   main-thread ms a frame at 6x; the frame is judged only next to readings at most this); hostTries: reads of a screen (reference, windows,
   reference) while the host is busy, waitMs apart; then its frame is not judged */
/* QUEUE.md's budgets rule word for word (RULES FOR ALL TEN above item 97; main 8c19078, line 1870). nodes, anims, frameMs, rate and insMs
   in BUDGET are its numbers: a self-test reads them out of this text (ruleNums) and compares, and when git can show main's QUEUE.md its
   budgets line must be this text. The step's last line is written from BUDGET (summary), so it says what was judged */
const RULE_TEXT = "Budgets, checked by a kit test: at most 1,200 FW nodes and 30 running FW animations on a screen; at most 4 ms main thread per frame at 6× CPU slowdown with the screen's motion running; nothing running off screen or in the background; no FW insert longer than 50 ms at 6× (build heavy art after first paint).";
function ruleNums(t) {
  const n = re => { const m = re.exec(t); return m ? m.slice(1).map(v => Number(v.replace(/,/g, ''))) : [NaN, NaN]; };
  const [nodes, anims] = n(/at most ([\d,]+) FW nodes and (\d+) running FW animations/), [frameMs, rate] = n(/at most ([\d.]+) ms main thread per frame at (\d+)× CPU slowdown/), [insMs, rateIns] = n(/no FW insert longer than ([\d.]+) ms at (\d+)×/);
  return { nodes, anims, frameMs, rate, insMs, rateIns };
}
const RULE = ruleNums(RULE_TEXT);
// main's QUEUE.md budgets line (git show main:QUEUE.md from this folder: the kit is a worktree of the fred repo), or null when git cannot
// show it here
function queueRule() {
  try { const q = execFileSync('git', ['-C', path.dirname(fileURLToPath(import.meta.url)), 'show', 'main:QUEUE.md'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 });
    const l = q.split('\n').find(x => x.includes('Budgets, checked by a kit test:')); return l ? l.replace(/^\s*-\s*/, '').trim() : null; }
  catch (e) { return null; }
}
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
  const aid = new WeakMap(); let an = 0;
  window.__fwkA = {
    // the times of every animation running on the page (ids kept per Animation), to tell how far the screen's motion went between two
    snap() { const o = {}; for (const a of document.getAnimations()) { if (a.playState !== 'running' || a.currentTime == null) continue; let i = aid.get(a); if (!i) aid.set(a, i = ++an); o[i] = Math.round(a.currentTime); } return { t: Math.round(performance.now()), o }; },
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
let RATE = 1; const CDP = new WeakMap(), RATES = new WeakMap(); /* RATES: page -> every CPU slowdown rate the kit gave it, in order (the self-tests read it) */
async function kitBrowser() {
  const b = await chromium.launch(), nc = b.newContext.bind(b);
  b.newContext = async (...a) => {
    const ctx = await nc(...a); await ctx.addInitScript(FWK_INIT);
    const np = ctx.newPage.bind(ctx);
    ctx.newPage = async (...q) => { const p = await np(...q), s = await ctx.newCDPSession(p), log = [], send = s.send.bind(s);
      s.send = (m, x) => { if (m === 'Emulation.setCPUThrottlingRate') log.push(x.rate); return send(m, x); }; RATES.set(p, log);
      if (RATE !== 1) await s.send('Emulation.setCPUThrottlingRate', { rate: RATE }); CDP.set(p, s); return p; }; /* (before open() loads the page: slowed from its start) */
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
// the frame on a screen: one window (measure(0): frameCost); over L.frameMs, measured again (measure(1), measure(2); the walk replays the
// screen's drawings before every window, so each has them moving from the start of their move) up to L.tries windows in all, stopping at
// the first under it, and the lowest kept (load on the machine only adds to a window). F.all: every window read
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
// how far a page's motion went between two snaps (__fwkA.snap): the most any animation running at both advanced, in ms, the wall time
// between them and how many ran at both
const snapOf = p => p.evaluate(() => window.__fwkA.snap());
const moved = (s0, s1) => { let ms = 0, n = 0; for (const i in s1.o) if (i in s0.o) { n++; ms = Math.max(ms, s1.o[i] - s0.o[i]); } return { ms, wall: s1.t - s0.t, n }; };
// the screen still while fn runs (the host reference read): its document timeline's playback rate 0 (CDP Animation.setPlaybackRate:
// every CSS animation and transition and every Web Animation on it stays where it is; the page's own scripts still run), then 1 again.
// The reference reads higher with the screen moving next to it (two FW.scene probes: 1.69-1.84 ms moving, 1.15-1.23 stopped, 1.14-1.35
// taken out), so a screen over 4 ms would push it over the limit and be called "host busy". R.still: how far the screen moved meanwhile,
// and R.still.task its main thread's ms of tasks meanwhile (held still, the weather screens ran 2-6 ms over a read: idle), so a host busy
// line shows whether the screen's own scripts kept working
async function stillWhile(p, fn) {
  const cdp = CDP.get(p), td = async () => (await cdp.send('Performance.getMetrics')).metrics.find(m => m.name === 'TaskDuration').value;
  await cdp.send('Performance.enable'); await cdp.send('Animation.setPlaybackRate', { playbackRate: 0 });
  try { const s0 = await snapOf(p), t0 = await td(), R = await fn(), t1 = await td(), s1 = await snapOf(p); R.still = Object.assign(moved(s0, s1), { task: Math.round((t1 - t0) * 1000) }); return R; }
  finally { await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 }); }
}
const hostQuiet = (refs, L = BUDGET) => refs.length > 0 && refs.every(r => r != null && r <= L.refMs);
// the frame on a screen, judged only on a quiet host: the reference read just before the screen's windows (windows(k): frameLow, k the
// read's number) and just after; both at most L.refMs, the windows are judged. Over it, the host is busy: wait L.waitMs and read again,
// up to L.hostTries reads (once: a single read, no wait, after the host stayed busy on an earlier screen); still busy, the frame is not
// judged (judged false), never passed or failed on those windows
async function frameHost(windows, ref, L = BUDGET, wait = sleep, once = false) {
  const reads = [];
  for (let k = 0; k < (once ? 1 : L.hostTries); k++) {
    if (k) await wait(L.waitMs);
    const r0 = await ref(), F = await windows(k), r1 = await ref(), x = { F, refs: [r0.ms, r1.ms], still: [r0.still, r1.still] };
    reads.push(x);
    if (hostQuiet(x.refs, L)) return { F, refs: x.refs, reads, judged: true };
  }
  const z = reads[reads.length - 1];
  return { F: z.F, refs: z.refs, reads, judged: false };
}
// the frame rule on one screen, as the walk runs it: the host reference read just before and just after the screen's windows (frameHost)
// with the screen held still (stillWhile), and its windows (frameLow), each after a replay of its drawings (a new app open) when they
// were made to move (replay), so each window has them moving from the start of their move. A quiet host: judged; a window kept without
// the screen moving through it (an animation running at both its ends advanced at least half its length) or with under 30 frames is a
// 'frame' failure (not measured), and one over L.frameMs a 'frame' failure with its paused reading added (ownCost: the last thing
// measured on the page). A busy one: a 'host busy' failure, the frame not judged. S: the walk's state (hostBusy, busy, refs, waited,
// frames, again, max.frame); out: the failures
async function screenFrame(name, p, running, replay, REF, S, out, L = BUDGET, wait = sleep) {
  const win = async () => { if (replay) { await p.evaluate(() => window.__fwkA.appOpen()); await until(() => p.evaluate(() => !!document.querySelector('.fwm.fwm-go')), 2000); await sleep(150); }
    const s0 = await snapOf(p), W = await frameCost(p), s1 = await snapOf(p); W.moved = moved(s0, s1); W.after = (await audit(p)).running; return W; };
  const H = await frameHost(() => frameLow(win, L), () => stillWhile(p, () => refCost(REF.p)), L, wait, S.hostBusy);
  const F = H.F, r = { F, H, refs: H.reads.map(x => x.refs.join('/')), own: null };
  const still = H.reads.flatMap(x => x.still).filter(Boolean), most = k => Math.max(0, ...still.map(s => s[k] || 0));
  S.frames.push(name);
  if (!H.judged) { S.hostBusy = true; S.busy.push(name);
    out.push({ screen: name, rule: 'host busy', sel: 'the page', detail: 'frame not judged: the host reference read ' + r.refs.join(', ') + ' ms a frame at ' + L.rate + 'x just before / after the screen\'s windows (quiet at most ' + L.refMs + '; the screen held still meanwhile: its animations moved at most ' + most('ms') + ' ms and its main thread ran at most ' + most('task') + ' ms of tasks over a read), ' + H.reads.length + (H.reads.length > 1 ? ' reads ' + L.waitMs / 1000 + ' s apart' : ' read') + '; the screen read ' + H.reads.map(x => x.F.all.join('/')).join(', ') + ' ms there' });
    return r; }
  S.hostBusy = false; S.refs.push(...H.refs); if (H.reads.length > 1) S.waited.push(name + ' (' + H.reads.length + ' reads)');
  if (!(F.ms != null && F.frames >= 30 && F.moved && F.moved.ms >= F.moved.wall / 2)) { (S.by[name] || (S.by[name] = {})).nomotion = 1;
    out.push({ screen: name, rule: 'frame', sel: 'the page', detail: 'not measured with the screen\'s motion running: the window kept read ' + F.ms + ' ms over ' + F.frames + ' frames, and its animations moved ' + (F.moved ? F.moved.ms + ' ms in ' + F.moved.wall + ' ms (' + F.moved.n + ' running at both ends)' : '?') });
    return r; }
  (S.by[name] || (S.by[name] = {})).frame = F.ms; /* the reading judged, for the report to hold against the failures */
  if (F.ms > S.max.frame[0]) S.max.frame = [F.ms, name];
  if (F.all.length > 1) S.again.push(name + ' ' + F.all.join('/'));
  if (frameOver(F, L)) { const own = await ownCost(p); r.own = own.ms;
    out.push({ screen: name, rule: 'frame', sel: 'the page', detail: F.ms + ' ms main thread a frame at ' + L.rate + 'x over 2 s, the lowest of ' + F.all.length + ' windows (' + F.all.join(', ') + ' ms; ' + F.frames + ' frames, ' + F.task + ' ms of tasks; budget ' + L.frameMs + ' ms) with ' + running + ' FW animations running (' + F.after + ' at the end), the host reference ' + H.refs.join('/') + ' ms (quiet); with them paused the screen reads ' + own.ms + ' ms (not judged)' }); }
  return r;
}
// the walk's frame block on one screen (each() runs it with the walk's state and failure list; the self-tests with their own, and follow
// that list through the report): when an FW animation runs on the screen as it is (A0) or moving after a new app open (M), screenFrame,
// its failures pushed to out, the drawings replayed before every window when they were made to move (M is a new look, not A0); info gets
// the numbers for the screen's info line. Nothing running: not measured (null)
async function walkFrame(name, p, A0, M, REF, S, out, info, L = BUDGET, wait = sleep) {
  if (!(Math.max(A0.running, M.running) > 0)) return null;
  const R = await screenFrame(name, p, M.running, M !== A0, REF, S, out, L, wait);
  info.frame = R.F.ms; info.all = R.F.all; info.refs = R.refs; info.judged = R.H.judged; info.own = R.own;
  return R;
}
// more main-thread work each frame on a page (ms of wall time in a requestAnimationFrame loop; 0 stops it): a busy host's stand-in
const spin = (p, ms) => p.evaluate(ms => { const g = window.__kitSpin = (window.__kitSpin || 0) + 1; if (!ms) return; const f = () => { if (window.__kitSpin !== g) return; const t = performance.now(); while (performance.now() - t < ms); requestAnimationFrame(f); }; requestAnimationFrame(f); }, ms);

// the self-tests' trace of screenFrame, read from the two pages themselves (not from the code under test): on the screen page every app
// open (A) and frame window (W at __fwkA.fStart, w at fStop, each with the screen's animation times) and its animation times every 100
// ms outside the windows (t); on the reference page every read (R: html.on, r: off), all by the clock (performance.timeOrigin + now(): the
// screen page's Date is the kit's fixed day). The function it gives stops it and returns the order of R, A and W, and how far the screen
// moved (moved()) through each reference read (the samples inside it) and through each window
async function traceOn(p, ref) {
  await p.evaluate(() => { const A = window.__fwkA, L = window.__kitT = [], O = {}, now = () => performance.timeOrigin + performance.now(), tick = () => L.push([now(), 't', A.snap()]); let iv = setInterval(tick, 100);
    const wrap = (k, f) => { const g = O[k] = A[k]; A[k] = function () { f(); return g.apply(this, arguments); }; };
    wrap('appOpen', () => L.push([now(), 'A']));
    wrap('fStart', () => { clearInterval(iv); L.push([now(), 'W', A.snap()]); });
    wrap('fStop', () => { L.push([now(), 'w', A.snap()]); iv = setInterval(tick, 100); });
    window.__kitTOff = () => { clearInterval(iv); Object.assign(A, O); }; });
  await ref.evaluate(() => { const L = window.__kitT = [], h = document.documentElement; window.__kitTO = new MutationObserver(() => L.push([performance.timeOrigin + performance.now(), h.classList.contains('on') ? 'R' : 'r'])); window.__kitTO.observe(h, { attributes: true, attributeFilter: ['class'] }); });
  return async () => {
    const a = await p.evaluate(() => { window.__kitTOff(); return window.__kitT; }), b = await ref.evaluate(() => { window.__kitTO.disconnect(); return window.__kitT; });
    const ev = a.concat(b).sort((x, y) => x[0] - y[0]), next = (i, k) => { for (let j = i + 1; j < ev.length; j++) if (ev[j][1] === k) return j; return -1; };
    const order = ev.filter(e => /^[RAW]$/.test(e[1])).map(e => e[1]).join(' '), reads = [], wins = [], none = { ms: null, wall: 0, n: 0 };
    ev.forEach((e, i) => {
      if (e[1] === 'R') { const j = next(i, 'r'), T = ev.slice(i, j < 0 ? ev.length : j).filter(x => x[1] === 't'); reads.push(T.length > 1 ? moved(T[0][2], T[T.length - 1][2]) : none); }
      if (e[1] === 'W') { const j = next(i, 'w'); wins.push(j < 0 ? none : moved(e[2], ev[j][2])); }
    });
    return { order, reads, wins };
  };
}
// the trace a screenFrame must leave: per read the reference, then (an app open, a window) 1 to 3 times, then the reference, reads one
// after another, and at the end at most one window more (ownCost's, a failing screen's paused reading); the screen still through every
// reference read (at most 50 ms of motion over at least 1.5 s of samples) and moving through every window of a read (at least half its
// length, an animation running at both its ends)
function traceOk(T) {
  const t = T.order.split(' '); let i = 0, n = 0, w = 0;
  while (t[i] === 'R') { i++; let k = 0; while (t[i] === 'A' && t[i + 1] === 'W') { i += 2; k++; } if (k < 1 || k > 3 || t[i] !== 'R') return false; i++; n++; w += k; }
  if (t[i] === 'W') i++;
  return n > 0 && i === t.length && T.reads.length === 2 * n && T.reads.every(x => x.ms != null && x.wall >= 1500 && x.ms <= 50)
    && T.wins.length >= w && T.wins.slice(0, w).every(x => x.n > 0 && x.ms >= x.wall / 2);
}
// a self-test that needs a quiet host was not judged: the reference read alone (the probes taken out), again waitMs later while busy, up
// to hostTries reads. Busy alone too: the host is busy, a 'host busy' line (the step fails, no verdict); quiet alone, the screen pushed
// the reference up (busyHost false: the self-test fails)
async function busyOr(name, Q, REF, FAILS) {
  const alone = []; for (let k = 0; k < BUDGET.hostTries; k++) { if (k) await sleep(BUDGET.waitMs); alone.push((await refCost(REF.p)).ms); if (hostQuiet(alone.slice(-1))) break; }
  const busyHost = !hostQuiet(alone.slice(-1));
  if (busyHost) FAILS.push({ screen: name, rule: 'host busy', sel: 'the page', detail: 'not judged: the host reference read ' + Q.refs.join(', ') + ' ms a frame at ' + BUDGET.rate + 'x next to the screen (held still) and ' + alone.join(', ') + ' alone, ' + BUDGET.waitMs / 1000 + ' s apart (quiet at most ' + BUDGET.refMs + '): this self-test needs a quiet host' });
  return { busyHost, alone };
}

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
// the walk's state (the walk's own is ST; a self-test takes a fresh one): screens reached, broken and unhooked, those with art, fwMount
// calls; for the frame rule the screens where FW animations ran (ran), those measured (frames), those the host stayed busy for (busy),
// read again over 4 ms (again) or after a busy reading (waited), the quiet reference readings (refs) and whether the host stayed busy on
// the last screen (hostBusy); for the insert rule every screen with fwMount calls and its spots (insFrom), the spots opened again at 6x
// and by which screen (insSeen) and those whose calls were read there (insDone); per screen what the walk saw (by: the most nodes,
// running, unmounted and off-screen groups as it is and moving, running with the page hidden, the frame judged or its window kept
// without the screen moving, the slowest call at 6x),
// so the report can tell a number over its limit that no failure carries; the most of each number with its screen
const walkState = () => ({ screens: 0, broken: [], art: [], unhooked: [], ins: 0, ran: [], frames: [], again: [], refs: [], busy: [], waited: [], hostBusy: false, insSeen: new Map(), insFrom: [], insDone: new Set(), by: {}, max: { nodes: [0, ''], running: [0, ''], ins6: [0, ''], frame: [0, ''] } });
// what the walk's state says each rule had to report (gaps(S, FAILS, L)[rule]: [screen, what] for each): a number over its limit on a
// screen with no failure under that rule there, FW animations that ran on a screen the frame rule did not measure (and no frame failure
// there, or its window kept without the screen moving and no frame failure), a screen the host stayed busy for with no 'host busy'
// failure, fwMount calls whose spots were never read at 6x (and no 'insert' failure on the screen that opened them again). A walk that
// hands every failure on has none; one whose failures were all dropped has one for each failure the walk found
function gaps(S, FAILS, L = BUDGET) {
  const has = (rule, n) => FAILS.some(f => f.rule === rule && f.screen === n);
  const over = (k, lim, rule, what) => Object.keys(S.by).filter(n => S.by[n][k] != null && S.by[n][k] > lim && !has(rule, n)).map(n => [n, what(S.by[n][k])]);
  const keys = [...new Set(S.insFrom.map(x => x[1]))].filter(k => !S.insDone.has(k)), from = k => S.insFrom.filter(x => x[1] === k).map(x => x[0]);
  return {
    nodes: over('nodes', L.nodes, 'nodes', v => v + ' FW nodes (budget ' + L.nodes + ') with no nodes failure'),
    running: over('running', L.anims, 'running', v => v + ' FW animations running (budget ' + L.anims + ') with no running failure'),
    'not mounted': over('unmounted', 0, 'not mounted', v => v + ' pieces of fred world art outside any fwMount spot with no not mounted failure'),
    'off screen': over('offs', 0, 'off screen', v => v + ' groups of FW animations running off screen with no off screen failure'),
    background: over('hidden', 0, 'background', v => v + ' FW animations running with the page hidden with no background failure'),
    frame: S.ran.filter(n => !S.frames.includes(n) && !has('frame', n)).map(n => [n, 'FW animations ran on it and the frame rule did not measure it'])
      .concat(over('frame', L.frameMs, 'frame', v => 'judged at ' + v + ' ms a frame (budget ' + L.frameMs + ' ms) with no frame failure'))
      .concat(over('nomotion', 0, 'frame', v => 'its window was not measured with the screen\'s motion running, with no frame failure')),
    'host busy': S.busy.filter(n => !has('host busy', n)).map(n => [n, 'the host stayed busy for it with no host busy failure']),
    insert: keys.filter(k => !has('insert', S.insSeen.get(k) || from(k)[0])).map(k => [S.insSeen.get(k) || from(k)[0], 'its fwMount calls (' + k + (from(k).length > 1 ? '; the same spots on ' + from(k).slice(1).join(', ') : '') + ') were never read at ' + L.rate + 'x'])
      .concat(over('ins6', L.insMs, 'insert', v => 'a fwMount call took ' + v + ' ms at ' + L.rate + 'x (budget ' + L.insMs + ' ms) with no insert failure')),
  };
}
// the report: one ok per rule nothing failed and nothing in the walk's state contradicts (gaps), else one FAIL line per failure (the
// self-tests' too: a self-test that found the host busy adds a 'host busy' line) and one per gap, then the walk's own checks. S: the
// walk's state (ST); log: where a note goes; L: the limits judged. The frame rule gets no ok when the host was busy on every screen it
// would judge (nothing was judged by it)
function report(C, FAILS, S, ERRS, log = console.log, L = BUDGET) {
  const rules = [
    ['nodes', 'at most ' + L.nodes + ' FW nodes on every screen (most: ' + S.max.nodes[0] + (S.max.nodes[1] ? ' on ' + S.max.nodes[1] : '') + ')'],
    ['running', 'at most ' + L.anims + ' FW animations running on every screen, as it is and moving (most: ' + S.max.running[0] + (S.max.running[1] ? ' on ' + S.max.running[1] : '') + ')'],
    ['not mounted', 'every piece of fred world art is in a spot fwMount knows'],
    ['off screen', 'nothing running off screen'],
    ['background', 'nothing running with the page hidden'],
    ['frame', 'at most ' + L.frameMs + ' ms main thread a frame at ' + L.rate + 'x where FW animations run, the whole screen (' + (S.frames.length ? (S.frames.length - S.busy.length) + ' screens judged' + (S.busy.length ? ' of ' + S.frames.length + ' (the others not judged, the host busy: below)' : '') + ', costliest ' + S.max.frame[0] + ' ms on ' + S.max.frame[1] + (S.again.length ? '; over ' + L.frameMs + ' ms on a first window, the lowest of up to ' + L.tries + ' kept: ' + S.again.join(', ') : '') : 'no screen had any running') + ')'],
    ['host busy', 'every frame judged next to a quiet host (the host reference at most ' + L.refMs + ' ms a frame at ' + L.rate + 'x just before and just after its windows, the screen held still while it is read' + (S.refs.length ? ': ' + r2(Math.min(...S.refs)) + '-' + r2(Math.max(...S.refs)) + ' ms' : '') + (S.waited.length ? '; read again after a busy reading: ' + S.waited.join(', ') : '') + ')'],
    ['insert', 'no fwMount call over ' + L.insMs + ' ms at ' + L.rate + 'x (' + (S.ins ? S.ins + ' calls, slowest ' + S.max.ins6[0] + ' ms at ' + L.rate + 'x on ' + S.max.ins6[1] : 'no screen made any') + ')'],
  ];
  const seen = new Set(), G = gaps(S, FAILS, L);
  for (const [rule, ok] of rules) {
    const F = FAILS.filter(f => f.rule === rule).filter(f => { const k = line(f).replace(/ \((as the screen is|moving after a new app open)\)$/, ''); if (seen.has(k)) return false; seen.add(k); return true; }), g = G[rule] || [];
    if (rule === 'frame' && !F.length && !g.length && S.frames.length && S.frames.length === S.busy.length) { log('  frame: no screen judged (the host busy on all ' + S.frames.length + ': below)'); continue; } /* no ok for a rule nothing was judged by */
    if (!F.length && !g.length) C.ok(true, ok);
    else { for (const f of F) C.ok(false, line(f)); for (const [n, w] of g) C.ok(false, line({ screen: n, rule, sel: 'the walk', detail: w })); }
  }
  const unknown = FAILS.filter(f => !rules.some(([r]) => r === f.rule));
  C.ok(!unknown.length, 'every failure is reported under its rule', unknown.map(line).slice(0, 4));
  C.ok(!S.unhooked.length, 'every screen is the hooked copy (window.__fwk there)', S.unhooked);
  C.ok(S.screens > 0 && !S.broken.length, 'every screen reached (' + S.screens + ')', S.broken);
  const errs = ERRS.filter(([, e]) => e && e.length).map(([n, e]) => n + ': ' + e.slice(0, 2).join(' | '));
  C.ok(!errs.length, 'no page errors or console errors', errs.slice(0, 8));
}

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
    if (SELF) await selfTest(B, HOOKED, C, ERRS, REF, FAILS);
    await walk(B, HOOKED, C, FAILS, ERRS, REF);
  } finally { await B.close(); }
  console.log('  (' + Math.round((Date.now() - T0) / 1000) + ' s)');
  C.done(summary(ST));
}
// the step's last line (after the checker's OK), written from the limits judged (L) and the walk's state, so it names the numbers it judged by
const thousands = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
function summary(S, L = BUDGET) {
  const rr = S.refs.filter(x => x != null), host = rr.length ? ' (host reference ' + r2(Math.min(...rr)) + '-' + r2(Math.max(...rr)) + ' ms, quiet at most ' + L.refMs + ')' : '';
  return 'fred world budgets: ' + S.screens + ' screens' + (S.art.length ? ' (' + S.art.length + ' with fred world art)' : ' (none with fred world art yet: all zeros)') + ', at most ' + thousands(L.nodes) + ' FW nodes and ' + L.anims + ' running FW animations, nothing running off screen or hidden, ' + L.frameMs + ' ms a frame' + host + ' and ' + L.insMs + ' ms an insert at ' + L.rate + 'x' + (SELF ? '; self-tests on ' + SELF_SCREEN : '');
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

async function selfTest(B, HOOKED, C, ERRS, REF, FAILS) {
  console.log('-- self-tests (' + SELF_SCREEN + ')');
  const s = screens.find(x => x.name === SELF_SCREEN) || screens[0];
  const o = await openScreen(HOOKED, s, { browser: B, motion: true }); ERRS.push([SELF_SCREEN + ' (self-test)', o.errors]);
  try {
    const p = o.p;
    if (o.fail) { C.ok(false, 'self-test: ' + SELF_SCREEN + ' not reached: ' + o.fail); return; }
    const A0 = await audit(p);
    C.ok(A0.hooked && A0.gate, 'self-test: the hooked copy hands out the plumbing (fwMount, FWM) and the gate is open (html.fw-anim, Reduce Motion off)', { hooked: A0.hooked, gate: A0.gate });
    if (!A0.hooked) return;
    // the limits are QUEUE.md's: BUDGET holds the numbers read out of the rule's own text (RULE_TEXT: 1,200 nodes, 30 animations, 4 ms a
    // frame at 6x, 50 ms an insert at 6x), and that text is main's QUEUE.md line when git can show it here; the last line is written from
    // the limits (other limits, other numbers in it)
    const q = queueRule(), rk = ['nodes', 'anims', 'frameMs', 'rate', 'insMs'];
    C.ok(rk.every(k => Number.isFinite(RULE[k]) && BUDGET[k] === RULE[k]) && RULE.rateIns === RULE.rate && (q === null || q === RULE_TEXT),
      'self-test: the limits are QUEUE.md\'s budgets rule (' + rk.map(k => k + ' ' + BUDGET[k] + (BUDGET[k] === RULE[k] ? '' : ' but the rule says ' + RULE[k])).join(', ') + ', read out of its text' + (q === null ? '; main\'s QUEUE.md not readable here (git show main:QUEUE.md), so the copy in this file' : q === RULE_TEXT ? ', which is main\'s QUEUE.md line word for word' : '; main\'s QUEUE.md line differs from the copy in this file') + ')', { BUDGET, RULE, q });
    const LX = Object.assign({}, BUDGET, { nodes: 1201, anims: 31, frameMs: 4.5, insMs: 51, rate: 7, refMs: 1.9 }), sx = summary(Object.assign(walkState(), { screens: 3, art: ['a'], refs: [1.2, 1.3] }), LX), s0 = summary(Object.assign(walkState(), { screens: 3, art: ['a'], refs: [1.2, 1.3] }));
    C.ok(['at most 1,201 FW nodes and 31 running FW animations', ', 4.5 ms a frame (host reference 1.2-1.3 ms, quiet at most 1.9) and 51 ms an insert at 7x'].every(x => sx.includes(x)) && !/1,200|30 running|4 ms|50 ms|6x/.test(sx)
      && ['at most 1,200 FW nodes and 30 running FW animations', ', 4 ms a frame (host reference 1.2-1.3 ms, quiet at most ' + BUDGET.refMs + ') and 50 ms an insert at 6x'].every(x => s0.includes(x)),
      'self-test: the last line is written from the limits judged (other limits: "' + sx.slice(sx.indexOf('at most'), sx.indexOf('; self') < 0 ? undefined : sx.indexOf('; self')) + '")', { sx, s0 });
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
    const k0 = RATES.get(p).length, F = await frameCost(p), kF = RATES.get(p).slice(k0), k1 = RATES.get(REF.p).length, FR = await refCost(REF.p), kR = RATES.get(REF.p).slice(k1);
    C.ok(F.frames >= 30 && F.ms > 0 && kF.join(' ') === RULE.rate + ' 1' && FR.frames >= 30 && kR.join(' ') === RULE.rate + ' 1', 'self-test: the frame instrument measures (' + F.frames + ' frames in 2 s at ' + kF[0] + 'x, ' + F.ms + ' ms main thread a frame with the probes moving), slowing the page to the rule\'s ' + RULE.rate + 'x for the window and back (CPU slowdown given: ' + kF.join(', ') + '; to the host reference ' + kR.join(', ') + ')', { F, kF, kR });
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
      'self-test: frameLow on made-up windows measures again only over the budget (each window told its number), stops at a window under it or at 3, keeps the lowest, and frameOver judges that against the whole 4 ms (' + fk.map(x => x.all + ' -> ' + x.ms + (x.over ? ' over' : '')).join('; ') + ')', fk);
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
    // frameHost on made-up readings (the reference's, before and after each read of a screen's windows; the waits counted, not slept), and
    // the order of its calls: r the reference, w the windows, z a wait. Each read's windows read differently (10 ms on read 0, 11 on read 1,
    // 12 on read 2), so what it returns names the read: a screen judged on its second read gets that read's windows and readings (never the
    // first's, taken next to a busy reference), and one never judged its last read's
    const hfake = async (seq, L, once) => { let i = 0, waits = 0; const ks = [], calls = [];
      const H = await frameHost(async k => { ks.push(k); calls.push('w'); return { ms: 10 + k, all: [10 + k] }; }, async () => { calls.push('r'); return { ms: seq[i++] }; }, L, async ms => { waits += ms; calls.push('z'); }, once);
      return { judged: H.judged, n: H.reads.length, waits, ks: ks.join(' '), refs: H.refs.join(' '), calls: calls.join(' '), F: H.F.ms + '/' + H.F.all.join(' ') }; };
    const LH = { refMs: 1.5, hostTries: 3, waitMs: 20000 };
    const hk = [await hfake([1, 1.2], LH), await hfake([3, 1, 1, 1], LH), await hfake([1, 3, 1, 1.5], LH), await hfake([3, 3.1, 3.2, 3.3, 3.4, 3.5, 1, 1], LH), await hfake([3, 3, 1, 1], LH, true), await hfake([1.5, 1.51, 1, 1], LH)];
    C.ok(hk[0].judged && hk[0].n === 1 && hk[0].waits === 0 && hk[0].ks === '0' && hk[1].judged && hk[1].n === 2 && hk[1].waits === 20000 && hk[1].ks === '0 1'
      && hk[2].judged && hk[2].n === 2 && hk[2].refs === '1 1.5' && !hk[3].judged && hk[3].n === 3 && hk[3].waits === 40000 && hk[3].ks === '0 1 2'
      && !hk[4].judged && hk[4].n === 1 && hk[4].waits === 0 && hk[5].judged && hk[5].n === 2
      && hk[0].calls === 'r w r' && hk[1].calls === 'r w r z r w r' && hk[3].calls === 'r w r z r w r z r w r' && hk[4].calls === 'r w r'
      && hk[0].F === '10/10' && hk[1].F === '11/11' && hk[1].refs === '1 1' && hk[2].F === '11/11' && hk[5].F === '11/11' && hk[5].refs === '1 1'
      && hk[3].F === '12/12' && hk[3].refs === '3.4 3.5' && hk[4].F === '10/10' && hk[4].refs === '3 3',
      'self-test: frameHost on made-up readings reads the reference just before and just after a screen\'s windows (' + hk[1].calls + ': r the reference, w the windows, z a wait), judges them only with both readings at most ' + LH.refMs + ', reads again ' + LH.waitMs / 1000 + ' s later while one is over (each read told its number), returns the windows and readings of the read it judged (each read\'s windows reading differently), and after 3 reads (1 once the host stayed busy on an earlier screen) leaves them not judged with its last read\'s (' + hk.map(x => x.refs + (x.judged ? ' judged' : ' not judged') + ' after ' + x.n + ', windows ' + x.F.split('/')[0]).join('; ') + ')', hk);
    // the walk's frame on one screen (screenFrame), the scene moving on the self-test screen. A busy host stand-in: the reference given
    // BUSY_SPIN ms of wall time more work each frame (fixed: it reads in the busy range on record, at least HOST_BUSY_LOW, whatever the
    // limit), and the committed limit under HOST_BUSY_LOW: 'host busy', not judged, after 3 reads (the waits not slept), then 1 read on
    // the next screen. Then the host quiet again: one read (the host stayed busy before), judged under a limit no reading reaches, and the
    // walk's state no longer busy
    await probe(p, 'fwkF', 'fw-scene fw-phone', 'width:360px'); await mountJs(p, 'fwkF', 'scene', 'kit:f');
    const fGo = await until(async () => { const x = spotOf(await audit(p), 'fwkF'); return x && x.go && x.running ? x : null; }, 3000);
    const S0 = walkState(), O1 = [], O2 = [], O3 = [], nowait = async () => {};
    let Q1 = null, Q2 = null, Q3 = null;
    await spin(REF.p, BUSY_SPIN);
    try { Q1 = await screenFrame('self-test busy', p, fGo ? fGo.running : 0, true, REF, S0, O1, BUDGET, nowait); Q2 = await screenFrame('self-test busy, the next screen', p, 0, true, REF, S0, O2, BUDGET, nowait); }
    finally { await spin(REF.p, 0); }
    const sr = Q1 && Q2 ? Q1.H.reads.concat(Q2.H.reads).flatMap(x => x.refs) : [];
    const busyOk = BUDGET.refMs < HOST_BUSY_LOW && sr.length === 2 * (BUDGET.hostTries + 1) && sr.every(r => r != null && r >= HOST_BUSY_LOW)
      && O1.length === 1 && O1[0].rule === 'host busy' && Q1.H.reads.length === BUDGET.hostTries && O2.length === 1 && O2[0].rule === 'host busy' && Q2.H.reads.length === 1 && S0.busy.length === 2 && !S0.refs.length && S0.hostBusy;
    Q3 = await screenFrame('self-test quiet again', p, fGo ? fGo.running : 0, true, REF, S0, O3, Object.assign({}, BUDGET, { refMs: 1e9, frameMs: 1e9 }), nowait);
    const againOk = Q3.H.judged && Q3.H.reads.length === 1 && !O3.length && !S0.hostBusy && S0.refs.length === 2;
    C.ok(!!fGo && busyOk && againOk, 'self-test: the walk\'s frame on one screen with the scene moving, next to a busy host stand-in (' + BUSY_SPIN + ' ms more work a frame on the reference, fixed): the reference reads ' + sr.join(', ') + ' ms (at least the lowest busy reading on record, ' + HOST_BUSY_LOW + ', and the committed limit ' + BUDGET.refMs + ' under it), and it is ' + (Q1 && !Q1.H.judged ? 'not judged ("host busy")' : 'judged') + ' after ' + (Q1 && Q1.H.reads.length) + ' reads; the next screen gets ' + (Q2 && Q2.H.reads.length) + '; the host quiet again, the next screen gets ' + Q3.H.reads.length + ' read, ' + (Q3.H.judged ? 'judged' : 'not judged') + ', and the host is ' + (S0.hostBusy ? 'still' : 'no longer') + ' busy', { O1, O2, O3, S0, sr, reads1: Q1 && Q1.H.reads.length, reads2: Q2 && Q2.H.reads.length });
    // the report on a walk (made up, or a self-test's own list and state), through the real checker under the limits L: its lines, the
    // last the checker's
    const rep = (fails, S, L = BUDGET) => { const out = [], cl = console.log, ec = process.exitCode; console.log = (...a) => out.push(a.join(' '));
      try { const C2 = checker(); report(C2, fails, S, [], x => out.push(x), L); C2.done('TITLE'); } finally { console.log = cl; process.exitCode = ec; } return out; };
    const last = o => o[o.length - 1];
    // a walk whose every failure the report must give: 'FAIL n' (n its failures), each failure's line, no ok for the frame rule and no OK title
    const repFails = (out, fails) => fails.length > 0 && last(out) === 'FAIL ' + fails.length && fails.every(f => out.includes('  FAIL ' + line(f))) && !out.some(x => /^ {2}ok at most [\d.]+ ms main thread a frame/.test(x)) && !out.some(x => /^OK:/.test(x));
    // the walk's frame block (walkFrame, as the walk runs it) under the committed limits on a quiet host: one scene moving, one bird (2
    // animations: a light screen, as the weather screens are with 3-7), then two scenes (over 4 ms), each with a walk state and failure
    // list of its own and traced from the two pages themselves (traceOn): measured (walkFrame gives a reading, the screen listed as
    // measured, its info line's number) and judged (the reference next to a screen held still reads as the host does), the bird with no
    // failure at all (moving through its window, under 4 ms), the two scenes a 'frame' failure over 3 windows with the paused reading,
    // never "host busy", and their list through the report ends 'FAIL 1' with that line, no ok for the frame rule and no OK title; the
    // trace reference, (app open, window) 1 to 3 times, reference, the screen still through each reference read and moving through each
    // window. On a busy host (not judged and the reference alone busy too) a 'host busy' line instead (the report the same with that
    // line); quiet alone, the screen pushed the reference up: a failure
    const traced = async (name, ids, mountNew, L, k = 'scene') => { /* the drawings (DRAWINGS' k) in spots ids (mounted here when mountNew), taken out after */
      const d = DRAWINGS.find(x => x.k === k);
      if (mountNew) for (const id of ids) { await probe(p, id, d.cls, d.css); await mountJs(p, id, k, 'kit:' + id); }
      const A0 = await audit(p);
      await p.evaluate(() => window.__fwkA.appOpen());
      const go = await until(async () => { const A = await audit(p); return ids.every(id => { const x = spotOf(A, id); return x && x.go && x.running; }) ? A : null; }, 3000);
      const S = walkState(), O = [], info = {};
      const done = await traceOn(p, REF.p); let Q = null, T = null;
      try { Q = await walkFrame(name, p, A0, go || await audit(p), REF, S, O, info, L); } finally { T = await done(); await unmount(p, ids); }
      const measured = !!Q && S.frames.includes(name) && info.frame === Q.F.ms, tOk = !!go && !!Q && traceOk(T), b = Q && !Q.H.judged ? await busyOr(name, Q, REF, FAILS) : null;
      S.screens = 1; S.art.push(name);
      const said = Q ? T.order + '; the screen moved ' + T.reads.map(x => x.ms + ' ms in ' + x.wall).join(', ') + ' through the reference reads, ' + T.wins.map(x => x.ms + ' in ' + x.wall).join(', ') + ' through the windows' : 'none';
      const how = !Q ? 'not measured (walkFrame gave no reading)' : Q.H.judged ? 'judged, the reference ' + Q.refs.join(', ') + ' ms next to it (at most ' + L.refMs + '; the screen ' + Q.F.all.join(', ') + ' ms)' : 'not judged, the reference ' + Q.refs.join(', ') + ' next to it and ' + b.alone.join(', ') + ' alone: ' + (b.busyHost ? 'the host busy (a host busy line)' : 'the screen pushed it up');
      return { Q, O, S, T, tOk, b, measured, rep: rep(O, S, L), running: go ? go.running : 0, said, how };
    };
    const one = await traced('self-test one scene', ['fwkF'], false, BUDGET);
    const oneOk = one.measured && (one.Q.H.judged ? !one.O.some(f => f.rule === 'host busy') : one.b.busyHost);
    C.ok(one.tOk && oneOk, 'self-test: the walk\'s frame on one screen with one scene moving (' + one.running + ' running) under the committed limits: ' + one.how + '; its trace ' + one.said, { O: one.O, T: one.T, refs: one.Q && one.Q.refs });
    // the host busy on a screen's first read only: a heavier stand-in on the reference (SPIN4 ms more work a frame) stopped in the wait
    // before the second read, and the screen (a scene of its own) given SPIN4 ms more work a frame from then on, so only the second read's
    // windows read over SPIN4 (the scene alone reads about 2, 5.6 next to a busy desktop); a host limit between the two (the reference on
    // record reads at most 4.45, the busy desktop included; the stand-in more than SPIN4) and a frame budget between the two reads'
    // windows (FRAME4: over the scene alone, under the screen with SPIN4 ms more): judged on the second read, with that read's windows and
    // readings, never the first's: one 'frame' failure on that read's reading next to that read's reference, which the report gives
    // ('FAIL 1' with its line), while the first read's windows are under the budget (judging them would pass the screen)
    await probe(p, 'fwkL', 'fw-scene fw-phone', 'width:360px'); await mountJs(p, 'fwkL', 'scene', 'kit:l');
    const lGo = await until(async () => { const x = spotOf(await audit(p), 'fwkL'); return x && x.go && x.running ? x : null; }, 3000);
    const SPIN4 = 7, FRAME4 = 6, L4 = Object.assign({}, BUDGET, { refMs: 6, frameMs: FRAME4 }), S4 = walkState(), O4 = []; let Q4 = null, w4 = 0;
    await spin(REF.p, SPIN4);
    try { Q4 = await screenFrame('self-test busy then quiet', p, lGo ? lGo.running : 0, true, REF, S4, O4, L4, async () => { w4++; await spin(REF.p, 0); await spin(p, SPIN4); }); }
    finally { await spin(REF.p, 0); await spin(p, 0); await unmount(p, ['fwkL']); }
    S4.screens = 1; S4.art.push('self-test busy then quiet');
    const r4 = Q4.H.reads, r4s = r4.map(x => x.refs.join('/') + ' -> ' + x.F.all.join('/')).join(', '), rep4 = rep(O4, S4, L4);
    C.ok(!!lGo && r4.length === 2 && w4 === 1 && r4[0].refs.some(r => r > L4.refMs) && Q4.H.judged && Q4.F === r4[1].F && Q4.F.ms > SPIN4 && r4[0].F.all.every(x => x < FRAME4) && Q4.H.refs.join(' ') === r4[1].refs.join(' ') && Q4.H.refs.every(r => r <= L4.refMs)
      && O4.length === 1 && O4[0].rule === 'frame' && O4[0].detail.startsWith(Q4.F.ms + ' ms main thread a frame') && O4[0].detail.includes('the host reference ' + Q4.H.refs.join('/') + ' ms (quiet)') && repFails(rep4, O4)
      && S4.max.frame[0] === Q4.F.ms && S4.refs.join(' ') === Q4.H.refs.join(' ') && S4.waited.length === 1 && /\(2 reads\)$/.test(S4.waited[0]),
      'self-test: the walk\'s frame on one screen, the host busy on its first read only (the reference, then the windows: ' + r4s + ' ms), a ' + FRAME4 + ' ms budget: judged on the second read, ' + Q4.F.ms + ' ms (only that read\'s windows had the screen\'s ' + SPIN4 + ' ms more work a frame), next to that read\'s reference ' + Q4.H.refs.join('/') + ', ' + (O4.length === 1 && O4[0].rule === 'frame' ? 'a frame failure on that reading' : O4.length + ' failures') + ' ("' + last(rep4) + '" through the report; the first read\'s windows under the budget), and listed as read again', { reads: r4.map(x => ({ refs: x.refs, F: x.F.all })), F: Q4.F.ms, refs: Q4.H.refs, O4, waited: S4.waited, rep: rep4 });
    const bird = await traced('self-test one bird', ['fwkK'], true, BUDGET, 'bird');
    C.ok(bird.tOk && bird.measured && (bird.Q.H.judged ? !bird.O.length : bird.b.busyHost), 'self-test: the walk\'s frame on one screen with one bird moving (' + bird.running + ' running: a light screen, as the weather screens are with 3-7) under the committed limits: ' + bird.how + (bird.O.length ? '; failures: ' + bird.O.map(f => f.rule + ' ' + f.detail.slice(0, 80)).join(' | ') : ', no failure') + '; its trace ' + bird.said, { O: bird.O, T: bird.T, refs: bird.Q && bird.Q.refs });
    const two = await traced('self-test two scenes', ['fwkG', 'fwkH'], true, BUDGET);
    const twoOk = two.measured && (two.Q.H.judged ? two.O.length === 1 && two.O[0].rule === 'frame' && two.Q.F.ms > BUDGET.frameMs && two.Q.F.all.length === BUDGET.tries && two.Q.own != null && two.Q.own < two.Q.F.ms : two.b.busyHost);
    C.ok(two.tOk && twoOk && repFails(two.rep, two.O), 'self-test: the walk\'s frame on one screen with two scenes moving (' + two.running + ' running) under the committed limits: ' + (two.Q && two.Q.H.judged ? 'judged, the reference ' + two.Q.refs.join(', ') + ' ms next to it, a frame failure (' + two.Q.F.all.join(', ') + ' ms; ' + two.Q.own + ' paused), not "host busy"' : two.how) + '; its failures through the report: "' + last(two.rep) + '" with ' + (two.O.length === 1 ? 'its ' + two.O[0].rule + ' line' : two.O.length + ' lines') + ', no ok for the frame rule, no OK title; its trace ' + two.said, { O: two.O, T: two.T, refs: two.Q && two.Q.refs, rep: two.rep });
    // a screen whose animations are all paused (the bundle's .fw-paused on a scene): its window has no motion, so it is not measured (a
    // 'frame' failure), whatever it reads
    await probe(p, 'fwkJ', 'fw-scene fw-phone', 'width:360px'); await mountJs(p, 'fwkJ', 'scene', 'kit:j');
    const jGo = await until(async () => { const x = spotOf(await audit(p), 'fwkJ'); return x && x.go && x.running ? x : null; }, 3000);
    await p.evaluate(() => document.getElementById('fwkJ').classList.add('fw-paused'));
    const jRun = await p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length);
    const OJ = []; let QJ = null;
    try { QJ = await screenFrame('self-test paused', p, jGo ? jGo.running : 0, false, REF, walkState(), OJ, Object.assign({}, BUDGET, { refMs: 1e9, frameMs: 1e9 }), nowait); }
    finally { await unmount(p, ['fwkJ']); }
    C.ok(!!jGo && jRun === 0 && QJ.H.judged && OJ.length === 1 && OJ[0].rule === 'frame' && /^not measured/.test(OJ[0].detail), 'self-test: a screen whose animations are all paused (' + jRun + ' running): its window is not measured with the screen\'s motion running, a frame failure (' + (OJ[0] ? OJ[0].detail.slice(0, 120) : 'none') + ')', OJ);
    // the walk's own work on one screen (walker, as walk() runs it on every screen) on a page of its own of the self-test screen with
    // probes: a bird in a spot on screen (fwMount) and, far below the fold, a bird put in with innerHTML with a fw- loop no app rule
    // reaches; under limits every probe is over (LW: 1 node, 1 animation, 0.01 ms a frame, 0.01 ms an insert), with a state and failure
    // list of its own, the screen opened again at 6x by a reopen that mounts the same bird there (the self-test screen makes no fwMount call
    // of its own). Each rule the walk hands on (nodes, running, not mounted, off screen, background, the frame or, the host busy, host busy,
    // insert) has its failure and its line through the report, every FAIL line the report prints is one of the walk's own (no gap: the walk
    // handed everything on), 'FAIL n', no OK title; the walk's record of the screen (FW ran there and was measured, its fwMount spots read
    // at 6x), held against no failures, gives a gap under each of those rules (so the report would see one dropped); and the page opened
    // again was slowed to the rule's 6x from its start
    const LW = Object.assign({}, BUDGET, { nodes: 1, anims: 1, frameMs: 0.01, insMs: 0.01 }), sW = Object.assign({}, s, { name: 'self-test walk' }), SW = walkState(), OW = [], EW = [];
    const ow = await openScreen(HOOKED, s, { browser: B, motion: true }); let yW = null, iW = null;
    try {
      if (ow.fail) throw new Error('self-test walk: ' + SELF_SCREEN + ' not reached: ' + ow.fail);
      await probe(ow.p, 'fwkW', '', 'width:140px;height:140px;overflow:hidden'); await mountJs(ow.p, 'fwkW', 'bird', 'kit:w');
      await probe(ow.p, 'fwkV', '', 'width:140px;height:140px;overflow:hidden', 3000);
      await ow.p.evaluate(() => { document.getElementById('fwkV').innerHTML = window.FW.bird({}) + '<i style="display:block;width:20px;height:20px;animation:fw-ch-bob 2.4s infinite"></i>'; });
      await until(async () => { const x = spotOf(await audit(ow.p), 'fwkW'); return x && x.go && x.running ? x : null; }, 3000);
      const reopen = async s2 => { const y = yW = await openScreen(HOOKED, s2, { browser: B, motion: true }); await probe(y.p, 'fwkW', '', 'width:140px;height:140px;overflow:hidden'); await mountJs(y.p, 'fwkW', 'bird', 'kit:w'); return y; };
      iW = await walker(B, HOOKED, REF, SW, OW, EW, LW, reopen)(sW, ow);
    } finally { await ow.close(); for (const [n, e] of EW) ERRS.push([n + ' (self-test)', e]); }
    const busyW = SW.busy.includes(sW.name), bW = busyW ? await busyOr(sW.name, { refs: (iW && iW.refs) || [] }, REF, FAILS) : null;
    const rW = rep(OW, SW, LW), fW = rW.filter(x => x.startsWith('  FAIL ')), mine = new Set(OW.map(f => '  FAIL ' + line(f))), kW = yW ? RATES.get(yW.p) : [];
    const want = ['nodes', 'running', 'not mounted', 'off screen', 'background', busyW ? 'host busy' : 'frame', 'insert'];
    const lack = want.filter(r => !OW.some(f => f.rule === r && f.screen === sW.name) || !fW.some(x => x.startsWith('  FAIL budgets ' + sW.name + ' · ' + r + ' · ')));
    const g0 = gaps(SW, [], LW), blind = want.filter(r => !(g0[r] || []).some(x => x[0] === sW.name)); /* the walk's own record of the screen, held against no failures: a gap under each rule */
    const recOk = SW.ran.includes(sW.name) && SW.frames.includes(sW.name) && SW.insFrom.length === 1 && SW.insDone.size === 1 && SW.screens === 1 && SW.art.includes(sW.name);
    C.ok(!!iW && !lack.length && !blind.length && recOk && fW.length > 0 && fW.every(x => mine.has(x)) && last(rW) === 'FAIL ' + fW.length && !rW.some(x => /^OK:/.test(x)) && kW[0] === RULE.rate && (!busyW || bW.busyHost),
      'self-test: the walk\'s own work on one screen (walker) with probes, under limits of 1 node, 1 animation, 0.01 ms a frame and 0.01 ms an insert: ' + (lack.length ? 'no failure or no line for ' + lack.join(', ') : 'a failure and its line through the report for each of ' + want.join(', ')) + '; the report "' + last(rW) + '" with ' + (fW.every(x => mine.has(x)) ? 'the walk\'s own failures only' : 'lines that are not the walk\'s failures: ' + fW.filter(x => !mine.has(x)).map(x => x.slice(2, 120)).join(' | ')) + '; its record of the screen ' + (recOk ? '(FW ran there, measured, its fwMount spots read at 6x)' : 'incomplete') + (blind.length ? ', with no failures, shows no gap under ' + blind.join(', ') : ', with no failures, shows a gap under each rule') + '; the page opened again slowed to ' + kW[0] + 'x from its start' + (busyW ? ' (the host busy: ' + (bW.busyHost ? 'busy alone too' : 'the screen pushed the reference up') + ')' : ''), { OW: OW.map(line), rW, kW, SW: { ran: SW.ran, frames: SW.frames, busy: SW.busy, insFrom: SW.insFrom, insDone: [...SW.insDone], by: SW.by } });
    // the report on a made-up walk with two screens judged: one over the budget and one not measured with its motion running (both 'frame'
    // failures as screenFrame gives them) ends 'FAIL 2' with both lines, no ok for the frame rule and no OK title
    const SR = o => Object.assign(walkState(), { screens: 2, art: ['a', 'b'], frames: ['a', 'b'], refs: [1.2, 1.3], max: { nodes: [10, 'a'], running: [3, 'a'], ins6: [0, ''], frame: [1.5, 'a'] } }, o);
    const ff = [{ screen: 'a', rule: 'frame', sel: 'the page', detail: '5.2 ms main thread a frame at 6x over 2 s, the lowest of 3 windows (made up; budget 4 ms)' }, { screen: 'b', rule: 'frame', sel: 'the page', detail: 'not measured with the screen motion running: made up' }];
    const rf = rep(ff, SR({ again: ['a 6/5.4/5.2'], max: { nodes: [10, 'a'], running: [3, 'a'], ins6: [0, ''], frame: [5.2, 'a'] }, by: { a: { frame: 5.2 } } }));
    C.ok(repFails(rf, ff) && last(rf) === 'FAIL 2', 'self-test: the report on a made-up walk with two frame failures (over the budget, not measured) ends "' + last(rf) + '" with both lines, no ok for the frame rule and no OK title', rf);
    // a screen judged and one the host stayed busy for (its 'host busy' failure as screenFrame gives it) ends FAIL with that line and never
    // the OK title; every screen busy, no ok for the frame rule; none busy, all ok; a failure under a rule the report does not list still
    // fails it
    const bf = n => ({ screen: n, rule: 'host busy', sel: 'the page', detail: 'frame not judged: made up' });
    const rp = [rep([bf('b')], SR({ busy: ['b'] })), rep([bf('a'), bf('b')], SR({ busy: ['a', 'b'], refs: [], max: { nodes: [10, 'a'], running: [3, 'a'], ins6: [0, ''], frame: [0, ''] } })), rep([], SR({})), rep([Object.assign(bf('b'), { rule: 'made up' })], SR({}))];
    C.ok(last(rp[0]) === 'FAIL 1' && rp[0].includes('  FAIL budgets b · host busy · the page · frame not judged: made up') && !rp[0].some(x => /^OK:/.test(x))
      && last(rp[1]) === 'FAIL 2' && rp[1].includes('  frame: no screen judged (the host busy on all 2: below)') && !rp[1].some(x => /^ {2}ok at most 4 ms/.test(x)) && !rp[1].some(x => /^OK:/.test(x))
      && /^OK: TITLE/.test(last(rp[2])) && !rp[2].some(x => /FAIL/.test(x)) && last(rp[3]) === 'FAIL 1' && rp[3].some(x => x.startsWith('  FAIL every failure is reported under its rule')),
      'self-test: the report on a made-up walk with a screen the host stayed busy for ends "' + last(rp[0]) + '" with its host busy line and no OK title; every screen busy: "' + last(rp[1]) + '", no ok for the frame rule; none busy: "' + String(last(rp[2])).slice(0, 12) + '..."; a failure under a rule it does not list: "' + last(rp[3]) + '"', rp);
    // the report holds the walk's state against its failures (gaps): on a made-up walk of one screen, a number over its limit with no
    // failure under its rule (nodes, running, not mounted, off screen, background, the frame judged, an insert at 6x), FW animations that
    // ran where the frame rule measured nothing, a screen the host stayed busy for with no host busy line, fwMount calls never read at 6x:
    // each ends 'FAIL 1' with a line of its own under that rule ('the walk'), so no ok for it and no OK title; the same walk with that
    // failure: 'FAIL 1' with the failure's line only
    const G1 = (by, o) => SR(Object.assign({ screens: 1, art: ['a'], frames: [], refs: [1.2], by: { a: by } }, o));
    const gw = [['nodes', G1({ nodes: 1300 })], ['running', G1({ running: 31 })], ['not mounted', G1({ unmounted: 1 })], ['off screen', G1({ offs: 1 })], ['background', G1({ hidden: 2 })],
      ['frame', G1({}, { ran: ['a'] })], ['frame', G1({ frame: 5.2 }, { ran: ['a'], frames: ['a'] })], ['frame', G1({ nomotion: 1 }, { ran: ['a'], frames: ['a'] })], ['host busy', G1({}, { ran: ['a'], frames: ['a'], busy: ['a'], refs: [] })],
      ['insert', G1({}, { ins: 1, insFrom: [['a', 'div#x']] })], ['insert', G1({ ins6: 60 }, { ins: 1, insFrom: [['a', 'div#x']], insSeen: new Map([['div#x', 'a']]), insDone: new Set(['div#x']) })],
    ].map(([rule, S]) => { const g = rep([], S), f = { screen: 'a', rule, sel: 'x', detail: 'made up' }, w = rep([f], S), gl = g.filter(x => x.startsWith('  FAIL '));
      return { rule, ok: last(g) === 'FAIL 1' && gl.length === 1 && gl[0].startsWith('  FAIL budgets a · ' + rule + ' · the walk · ') && !g.some(x => /^OK:/.test(x)) && last(w) === 'FAIL 1' && w.includes('  FAIL ' + line(f)), said: gl.length ? gl[0].slice(7).replace(/^budgets a · /, '') : last(g) }; });
    C.ok(gw.every(x => x.ok), 'self-test: the report holds the walk\'s state against its failures: on a made-up walk, each of ' + gw.map(x => (x.ok ? '' : 'NOT ') + x.rule).join(', ') + ' ends "FAIL 1" with a line of its own when no failure carries it (' + gw.map(x => x.said).join('; ') + '), and with the failure, that line only', gw);
    // a page opened at 6x is slowed from its start (the insert re-open), at the rule's rate
    const b1 = await busy(p); RATE = BUDGET.rate; let y = null;
    try { y = await openScreen(HOOKED, s, { browser: B, motion: true }); } finally { RATE = 1; }
    try { const b6 = await busy(y.p), k6 = RATES.get(y.p); ERRS.push([SELF_SCREEN + ' (self-test at 6x)', y.errors]);
      C.ok(b6 > 2.5 * b1 && k6[0] === RULE.rate, 'self-test: a page opened at ' + k6[0] + 'x (the rule\'s ' + RULE.rate + 'x) is slowed from its start (a fixed loop: ' + r2(b1) + ' ms at 1x, ' + r2(b6) + ' ms there)', { b1, b6, k6 }); }
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
// the walk's work on one screen (walker(...) gives the function run() calls with each screen opened): the static and running rules as
// the screen is and moving (judge), the page hidden, the frame (walkFrame), the fwMount calls again at L.rate x from the page's start
// (reopen: the screen opened again, RATE set around it so the page is slowed from its start), into the state S (with its record of the
// screen in S.by) and the failure list FAILS, under the limits L. walk() runs it with ST, FAILS and BUDGET; a self-test with its own (and
// a reopen that mounts a probe on the page opened again). Returns the screen's info line numbers
function walker(B, HOOKED, REF, S, FAILS, ERRS, L = BUDGET, reopen = s => openScreen(HOOKED, s, { browser: B, motion: true })) {
  const top = (k, v, w) => { if (v != null && v > S.max[k][0]) S.max[k] = [v, w]; };
  return async (s, o) => {
    const t = Date.now(); S.screens++;
    ERRS.push([s.name, o.errors || []]);
    if (o.fail || !o.p) { S.broken.push(s.name + ': ' + o.fail); return null; }
    const p = o.p, A0 = await audit(p), by = S.by[s.name] = {};
    const look = A => { for (const [k, v] of [['nodes', A.nodes], ['running', A.running], ['unmounted', A.unmounted.length], ['offs', A.offs.length]]) if (!(by[k] >= v)) by[k] = v; };
    if (!A0.hooked) S.unhooked.push(s.name);
    judge(s.name, A0, FAILS, 'as the screen is', L); look(A0);
    const has = A0.spots.length || A0.unmounted.length || A0.all, info = { nodes: A0.nodes, spots: A0.spots.length, running: A0.running, moving: null, hidden: null, frame: null, ins: A0.ins.length, ins1: A0.ins.length ? Math.max(...A0.ins.map(x => x.ms)) : null, ins6: null };
    top('nodes', A0.nodes, s.name); top('running', A0.running, s.name);
    if (has) {
      let M = A0;
      if (A0.spots.some(x => x.known && x.on)) { /* drawings on screen: make them move (a new app open), then judge them moving */
        await p.evaluate(() => window.__fwkA.appOpen());
        await until(() => p.evaluate(() => !!document.querySelector('.fwm.fwm-go')), 2000); await sleep(150);
        M = await audit(p); info.moving = M.running; top('running', M.running, s.name);
        judge(s.name, M, FAILS, 'moving after a new app open', L); look(M);
      }
      const H = await p.evaluate(() => window.__fwkA.hidden()); info.hidden = H.running; by.hidden = H.by.reduce((n, g) => n + g.n, 0);
      for (const g of H.by) FAILS.push({ screen: s.name, rule: 'background', sel: g.sel, detail: g.n + ' FW animations (' + g.names.join(' ') + ') still running with the page hidden' });
      /* the frame where anything runs: the host reference just before and just after the windows (over 4 ms: up to 3 windows, the lowest kept); busy, read again 20 s later, up to 3 reads */
      if (Math.max(A0.running, M.running) > 0) S.ran.push(s.name);
      await walkFrame(s.name, p, A0, M, REF, S, FAILS, info, L);
    }
    if (A0.ins.length) { /* fwMount calls: the screen again, slowed from its start */
      S.ins += A0.ins.length;
      const key = [...new Set(A0.ins.map(x => x.spot))].sort().join(' | '), was = S.insSeen.get(key);
      S.insFrom.push([s.name, key]);
      if (was && !INS_ALL) { if (DEBUG) console.log('  .. ' + s.name + ': its fwMount calls go to the same spots as on ' + was + ' (measured there at ' + L.rate + 'x)'); }
      else {
        S.insSeen.set(key, s.name);
        RATE = L.rate; let y = null;
        try { y = await reopen(s); } catch (e) { FAILS.push({ screen: s.name, rule: 'insert', sel: 'the page', detail: 'could not open it again at ' + L.rate + 'x: ' + String(e && e.message || e).split('\n')[0] }); }
        finally { RATE = 1; }
        if (y) try {
          const I = await y.p.evaluate(() => (window.__fwIns || []).slice()); ERRS.push([s.name + ' (at ' + L.rate + 'x)', y.errors]);
          if (y.fail) console.log('  note ' + s.name + ': at ' + L.rate + 'x go() did not finish (' + y.fail + '); the calls it made are judged');
          if (I.length) S.insDone.add(key);
          info.ins6 = I.length ? Math.max(...I.map(x => x.ms)) : null; by.ins6 = info.ins6; top('ins6', info.ins6, s.name);
          const at1 = sp => Math.max(...A0.ins.filter(x => x.spot === sp).map(x => x.ms));
          for (const x of I) if (x.ms > L.insMs) FAILS.push({ screen: s.name, rule: 'insert', sel: x.spot, detail: x.ms + ' ms at ' + L.rate + 'x (budget ' + L.insMs + ' ms; ' + (A0.ins.some(z => z.spot === x.spot) ? at1(x.spot) + ' ms at 1x; ' : '') + (x.ins ? 'a new drawing, ' + x.n + ' nodes' : 'kept') + (x.key ? ', key ' + x.key : '') + ')' });
          if (!I.length) console.log('  note ' + s.name + ': at ' + L.rate + 'x it made no fwMount call (' + A0.ins.length + ' at 1x)');
        } finally { await y.close(); }
      }
    }
    if (has || A0.ins.length) { S.art.push(s.name); console.log('  info ' + s.name + ': ' + info.nodes + ' FW nodes in ' + info.spots + ' spots, ' + info.running + ' FW animations running' + (info.moving != null ? ' (' + info.moving + ' moving after a new app open)' : '') + (info.hidden != null ? ', ' + info.hidden + ' with the page hidden' : '') + (info.frame != null ? ', ' + info.frame + ' ms a frame at ' + L.rate + 'x' + (info.all && info.all.length > 1 ? ' (the lowest of ' + info.all.join(', ') + ')' : '') + ' (host reference ' + info.refs.join(', ') + ' ms' + (info.judged ? '' : ': busy, not judged') + ')' : '') + (info.own != null ? ' (with the FW animations paused ' + info.own + ' ms, not judged)' : '') + (info.ins ? ', ' + info.ins + ' fwMount calls (slowest ' + info.ins1 + ' ms at 1x' + (info.ins6 != null ? ', ' + info.ins6 + ' ms at ' + L.rate + 'x' : '') + ')' : '')); }
    else if (DEBUG) console.log('  .. ' + s.name + ': no fred world (0 FW nodes, 0 FW animations, 0 fwMount calls), ' + (Date.now() - t) + ' ms');
    return info;
  };
}
const ST = walkState();
async function walk(B, HOOKED, C, FAILS, ERRS, REF) {
  // the host at the start: the reference read (again waitMs later while it is over refMs, up to hostTries reads). Still busy: each screen
  // gets one read (no waits) until a screen finds the host quiet again
  const start = [];
  for (let k = 0; k < BUDGET.hostTries; k++) { if (k) await sleep(BUDGET.waitMs); start.push((await refCost(REF.p)).ms); if (hostQuiet(start.slice(-1))) break; }
  ST.hostBusy = !hostQuiet(start.slice(-1)); if (!ST.hostBusy) ST.refs.push(start[start.length - 1]);
  console.log('-- the host reference at the start: ' + start.join(', ') + ' ms a frame at ' + BUDGET.rate + 'x (quiet at most ' + BUDGET.refMs + ')' + (ST.hostBusy ? ': the host is busy' : ''));
  console.log('-- every screen (Reduce Motion off)');
  await run(walker(B, HOOKED, REF, ST, FAILS, ERRS), { page: HOOKED, browser: B, motion: true, only: ONLY ? (s => ONLY.test(s.name)) : undefined });
  report(C, FAILS, ST, ERRS);
  if (!ST.art.length) console.log('  no screen has fred world art yet: 0 FW nodes, 0 FW animations and 0 fwMount calls on all ' + ST.screens + ' screens, so the budgets have nothing to judge until a later item puts art on a screen');
  else console.log('  ' + ST.art.length + ' of ' + ST.screens + ' screens have fred world art or fwMount calls: ' + ST.art.slice(0, 12).join(', ') + (ST.art.length > 12 ? ' and ' + (ST.art.length - 12) + ' more' : ''));
}

await main();
