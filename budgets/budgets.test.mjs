// node budgets.test.mjs <null.html> [screen-name regex]   (cd into this folder first; about 4 minutes while no screen has art)
//   FRED WORLD BUDGETS (QUEUE.md, "RULES FOR ALL TEN" above item 97: "Budgets, checked by a kit test: at most 1,200 FW nodes and 30
//   running FW animations on a screen; at most 4 ms main thread per frame at 6x CPU slowdown with the screen's motion running; nothing
//   running off screen or in the background; no FW insert longer than 50 ms at 6x (build heavy art after first paint)"; item 97 point 4).
//   A page with none of fred world's parts (the bundle's tag, <script id="fwJs"> with or without other attributes; window.FW; fwMount's
//   declaration: main before item 97) ends with "OK: no fred world in this page (before item 97): nothing to budget (n checks)", so the kit
//   still passes on older pages; a page with some of them but not all fails ("fred world in part", fwParts). With the self-tests on, this
//   decision is self-tested first on every page (partsDecision: the step itself run on made-up pages), so a decision that lets a page with
//   only some of the parts through fails on that page too.
//   The plumbing (fwMount, FWM ...) lives inside the app's strict-mode function, so a page can't reach it. The test writes a hooked copy
//   of the page, <the page's folder>/budgets-hook/budgets-hook.html (its own folder: the cloud screens build kitcloud.html beside the page
//   they are given, and the other tests' kitcloud.html beside null.html must stay unhooked), that (a) hands the plumbing out from the
//   main script's first line (window.__fwk: fwMount, fwGate, fwOn, FWM, build) and (b) times every fwMount call, the app's own included,
//   with the drawing's build: the original is renamed and a wrapper records {ms: the build plus the call, mount: the call plus a forced
//   layout of its spot, build: the time in FW's drawing functions, lead: the work of the app function that made the call (by) since its
//   start or its previous fwMount, spot, ins: whether the spot's drawing changed, n: its nodes after, key} into window.__fwIns. The build
//   is what the app did for the drawing before the call (wxFred builds fred with F.bird, places him with F.box, then calls fwMount with
//   the string): each function of window.FW is wrapped (its outermost calls timed, none inside fwMount), and each app function that
//   calls fwMount (fwCallers: read from the main script's code, the declaration at column 0 above each call: wxFred on item 98's page;
//   held to braceCallers, the column-0 function whose braces hold the call) is renamed and wrapped to note its start; a call is charged its caller's work before it (since the caller's start or its previous
//   fwMount) and the calls of FW's drawing functions in the same task before that (outside any caller, every one since the previous
//   fwMount). Nothing else changes. Every screen is the shared list (lib/screens.mjs run()) with Reduce Motion off (the switch, Animate
//   the world, is on unless a screen turns it off), after go() and once settled:
//   motion      the screen as opened: Reduce Motion off (the page's own media query) and fred world's gate open (html.fw-anim, unless
//               the screen's own settings turn Animate the world off), else a failure (nothing of fred world runs there, so the running,
//               frame and background rules would measure nothing); the walk's header names the Reduce Motion run() was given
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
//               walk too; the OK line gives its range. A judged window must have been read at 6x (the CPU slowdown the kit gave the
//               page for it, from RATES: frameCost's rate), or it is a 'frame' failure (not measured at 6x), and must have the screen
//               moving (an animation running at both ends of it advanced at least half its length) and 30 frames, or it is a 'frame'
//               failure (not measured)
//   insert      every fwMount call the screen made, from the page's first line through go(), its build with it (above): the screen is
//               opened again in the kit's browser with the 6x slowdown on from the start (set on the page before it loads) and each
//               call must take at most 50 ms. The page opened again must have had 6x as the first slowdown the kit gave it, or it is an
//               'insert' failure (not opened at 6x), its calls not judged; and it must be opened as the walk opens a screen, Reduce
//               Motion off and fred world's gate open (as the screen had it), or it is an 'insert' failure (not opened as the walk opens
//               a screen: a drawing can be built differently without its motion), its calls not judged. A screen whose calls (each one's spot and fwMount key,
//               insKey) are those of one already measured is not opened again (BUDGETS_INS_ALL=1 opens each); each weather look in
//               fred's one spot is its own key, so each is read at 6x
//   errors      no page errors or console errors (the hooked copy must behave as the page)
//   The limits are QUEUE.md's (RULE_TEXT, its line word for word; a self-test holds BUDGET to the numbers in it). The walk records the
//   limits it judged by, and main holds its walk to what it asked (heldWalk: BUDGET's limits, the real 20 s waits, every screen asked
//   for walked or skipped for its needs), a failure otherwise; the last line is written from the limits the walk recorded. fwMount's
//   callers (above) are read twice, the app's way (the column-0 line above each call) and by each column-0 function's braces (the main
//   script read as JS: strings, template literals, comments and regex literals skipped); they must be the same, the main script read
//   whole, or it is a failure. The report holds the walk's state against its failures: a rule gets its ok only when nothing failed it and
//   nothing the walk saw contradicts that (gaps: a screen opened with Reduce Motion on or the gate shut, a number over its limit on a
//   screen with no failure under that rule there, windows not read at 6x, a page opened again not at 6x or not as the walk opens a screen, FW
//   animations that ran on a screen the frame rule did not measure (the screen with the most running among them, whatever the list
//   of screens where they ran says), a window kept without the screen moving and no frame failure, a screen or a self-test the host
//   stayed busy for with no 'host busy' line, fwMount calls (their spots and keys) never read at 6x), each such gap a FAIL line of its own,
//   so a walk whose failure list was dropped still fails on each failure it found. Each screen's error lists (as opened and at 6x)
//   are kept in the walk's record too, and the errors check takes them from there as well as from the list handed to it.
//   Self-tests on plan-before (so the audit can't pass by measuring nothing), probes mounted through __fwk and then taken out:
//   BUDGET holds the numbers read out of QUEUE.md's rule (1,200, 30, 4 ms, 6x, 50 ms), that text being main's QUEUE.md line when git
//   can show it, and the last line names other numbers under other limits; the host limit (REF_MS) just above the highest quiet reading
//   of the host reference on record and under the lowest busy one; fred world's parts in a page's text (the tag with or without other
//   attributes, window.FW, fwMount): all or none, some a failure, and main's decision on them (the step itself run on made-up pages:
//   none of them the "before item 97" OK, some of them 'FAIL 1' "fred world in part"); main's hold on its walk (heldWalk) on made-up
//   walk states (other limits, no limits, waits not slept, a screen neither walked nor skipped for its needs, one not asked for: each
//   named; the rule's limits or a copy of them: held);
//   FW.bird({}) and FW.scene(id) (in a .fw-scene box, as the bundle's notes say) in spots on screen: their nodes are counted and
//   their running fw- animations seen, and the budget judge flags them at limits just under what they hold; a bird in a spot far
//   below the fold, seen once (it moves) and scrolled away: paused, not counted as running, not off screen; FW.bird({}) put with
//   innerHTML in a plain div, also below the fold: flagged as not mounted, and its own loops don't run (item 97 stops art outside a
//   spot); a fw- loop the app's rules can't reach (an inline animation in that div, standing in for art put in some other way):
//   flagged as running off screen; the page hidden: nothing in a spot runs, and that loop is caught; __fwIns holds the three probe
//   inserts; an insert is the build and the call: at 6x a deliberately slow build through FW's drawing functions (FW.bird for SLOW_MS)
//   ahead of a pre-built mount in the same task reads the build plus the call, and the walk's insert judge fails it at the committed
//   50 ms, while a string built in an earlier task and mounted alone is charged no build and passes; the call is timed with its spot's
//   layout (in a long table that follows the drawing's width, the call reads at least most of that spot's layout alone); on a made-up
//   page through hookSource written as wxFred is (three calls several lines into the body, one in a nested arrow; a comment, a string
//   and a regex naming fwMount( in it), the function that builds and then calls fwMount is the one caller found with its 3 calls, both
//   ways (comments and a top-level arrow not), and each call reads its work before it plus the call; the two readings held to each
//   other (a call given to another function, missing or extra is named; a brace left open is not read whole); the frame instrument counts frames and main-thread time, slowing the page (and the host reference) to the rule's 6x for
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
//   stand-in, stopped before the second read, from which the screen gets that much more work), under a frame budget of that added
//   work (only a window that had it can be over): judged on the second read's windows, one 'frame' failure on that read's reading and
//   reference, through the report FAIL 1 (the first read's windows under the budget; on a busy host, the second read's reference over
//   the committed limit, a 'host busy' line instead when the reference alone reads busy too); the walk's frame block (walkFrame, as the walk runs it, with a failure list of
//   its own) with one scene, one bird (2 animations: a light screen, as the weather screens are with 3-7) and two scenes (over 4 ms)
//   under the committed limits: each measured and judged (not "host busy"), the bird with no failure, the two scenes failed (3
//   windows, the paused reading) and their list, through the report, ends FAIL 1 with that line, no ok for the frame rule and no OK
//   title, and each trace, read from the two pages themselves, is reference, (app open, window) 1 to 3 times, reference, with the
//   screen still through each reference read and moving through each window, every CPU slowdown given to the screen's page the rule's
//   6x for a window then 1 (on a busy host these give a 'host busy' line instead,
//   when the reference alone reads busy too; quiet alone, the screen pushed it up: a failure); that fallback (busyOr) on the busy
//   stand-in: 3 reads alone, a 'host busy' line and the self-test in the walk's state (a gap without the line), and on a quiet one:
//   1 read, nothing; a screen whose animations are all
//   paused: a 'frame' failure, not measured, and the state records it (a gap with no failures); a window read at 5x (the page's CDP
//   session giving 5 when the kit asks for 6, so RATES says 5): refused, a 'frame' failure, not measured at 6x, the state a gap; a page
//   opened again for a screen's calls outside the kit's browser (no slowdown from the kit, as walk() never opens one): its calls
//   refused, an 'insert' failure, not opened at 6x, and two gaps without it; a page opened again in the kit's browser at 6x with Reduce
//   Motion on, or with the gate kept shut: refused, an 'insert' failure, not opened as the walk opens a screen, two gaps without it; the
//   walk itself (walk(), as main runs
//   it: run() with its own options, walker on the screen, its report to a checker of its own) on the self-test screen with probes an
//   init script puts in every page it opens, the page opened again at 6x too (a bird built a fixed number of times, calibrated to about
//   BUILD_1X ms at 1x, once under Reduce Motion, then mounted in a spot; a bird with innerHTML far below with a loop no app rule reaches), under limits every probe is over (1 node, 1 animation, 0.01 ms a frame)
//   and the committed 50 ms an insert: a failure and its line in walk()'s own report under each rule (nodes, running, not mounted, off
//   screen, background, frame or host busy, insert: the slow build at 6x, judged on the page opened again: its call as opened under 50 ms,
//   the one judged over it and more than 2.5x that), every FAIL line the walk's own (no gap), its header "Reduce
//   Motion off" and no motion failure, its record of the screen (Reduce Motion off, the gate open, FW ran and measured, its calls keyed
//   by spot and fwMount key and read on a page opened at 6x with Reduce Motion off and the gate open, its error lists kept and handed on)
//   held against no failures a gap under each of those rules; a screen opened with Reduce Motion on (walker on a page of its own): a
//   motion failure through the report, and its record a motion gap; a screen opened with Reduce Motion off and Animate the world on whose
//   gate an init script keeps shut: one motion failure (the gate shut) through the report, and its record a motion gap; the report, through the real checker: a walk with two 'frame' failures
//   (over the budget, not measured) ends FAIL 2 with both lines, no ok for the frame rule and no OK title, a walk with a busy screen
//   ends FAIL with its 'host busy' line, never the OK title, every screen busy gives no ok for the frame rule, one with none busy is
//   all ok, and a failure under a rule it does not list fails it; on made-up walks each gap (Reduce Motion on, the gate shut, nodes,
//   running, not mounted, off screen, background, frame not measured, frame not measured on the screen with the most running though no
//   list of screens where FW ran names it, frame over, frame window without motion, frame windows not at 6x, host busy, a self-test host
//   busy, insert never read, insert over, opened again not at 6x, opened again not as the walk opens a screen) ends FAIL 1 with its own line, and with its failure, that line only;
//   the insert re-open's key is each call's spot and fwMount key (two looks in one spot are two keys) and the never-read gap names it;
//   a screen's errors in the walk's record and not handed on fail the errors
//   check (with them, once); a page opened at 6x is slowed from its start (a fixed loop runs more than
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
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { run, openScreen, screens } from '../lib/screens.mjs';
import { checker } from '../lib/open.mjs';

const ARG = process.argv[2], ONLY = process.argv[3] ? new RegExp(process.argv[3]) : null;
const DEBUG = !!process.env.BUDGETS_DEBUG, SELF = process.env.BUDGETS_SELF !== '0', INS_ALL = !!process.env.BUDGETS_INS_ALL;
const REF_MS = 1.8; /* hostref.html at 6x, the most a quiet host gives it: see the frame rule above (the Mac Studio: quiet 1.1-1.7, busy 2.3-3.5; another host measures it again) */
const HOST_BUSY_LOW = 2.3; /* the lowest reading of hostref.html at 6x on record with the host busy (the Mac Studio, 2026-11-07: the desktop busy 2.81-2.98, another headless browser with 4 heavy pages 2.3-3.5): REF_MS must be under it (a self-test) */
const HOST_QUIET_HIGH = 1.7; /* the highest reading of hostref.html at 6x on record with the host quiet (the Mac Studio, 2026-11-07, the series REF_MS was chosen on: 1.09-1.7): REF_MS sits just above it (at most 0.1 more) and under HOST_BUSY_LOW (a self-test), so a change of REF_MS alone fails; another host measures both again */
const BUILD_1X = 25; /* the walk self-test's probe build: FW.bird built a fixed number of times, calibrated on the self-test page to about this many ms at 1x (under the 50 ms insert budget there; at 6x, 3-6 times slower, over it) */
const LEAD_MS = 10; /* the made-up caller's waits before its three fwMount calls: 1x, 2x and 3x this, each call's lead must be within LEAD_MS over its wait */
const SLOW_MS = 80; /* the self-tests' deliberately slow build: ms of wall time building FW.bird again and again before its last string is mounted (well over the 50 ms insert budget at any slowdown: about 0.9 of it is in FW.bird, the rest the loop) */
const LAY_ROWS = 3000; /* the layout self-test's table: rows whose column follows the spot's drawing (auto layout), so the spot's layout reads several ms */
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
/* the main script's first lines in the hooked copy: the plumbing handed out, and the build timed. __fwkB: pend, the calls of FW's drawing
   functions (each function of window.FW, wrapped; only the outermost call of one into another, and none inside fwMount, which times its
   own) not yet charged, [start, end, name], cleared at the end of their task; stack, the app functions that call fwMount (hookSource
   finds them) running now, each {t: its start or its last fwMount's end, n: its name} */
const HOOK = "Object.defineProperty(window,'__fwk',{configurable:true,get(){ return {fwMount, fwGate, fwOn, FWM, build:__fwkB}; }}); /* budgets.test.mjs: the fred world plumbing, handed to the kit */\n"
  + "const __fwkB={pend:[], depth:0, inMount:0, stack:[], clear:0, wrapped:[]}; /* budgets.test.mjs: the build of each drawing, timed (FW's drawing functions, and the app functions that call fwMount) */\n"
  + "(function(){ const F=window.FW; if(!F || typeof F!=='object') return; Object.keys(F).forEach(k=>{ const f=F[k]; if(typeof f!=='function') return; const w=function(){ const B=__fwkB; if(B.depth || B.inMount) return f.apply(this, arguments); B.depth++; const t0=performance.now(); try{ return f.apply(this, arguments); } finally{ B.depth--; B.pend.push([t0, performance.now(), k]); if(!B.clear) B.clear=setTimeout(()=>{ B.pend.length=0; B.clear=0; }, 0); } }; try{ Object.assign(w, f); F[k]=w; if(F[k]===w) __fwkB.wrapped.push(k); }catch(e){} }); })();\n";
/* fwMount in the hooked copy: each call into window.__fwIns, ms = its build plus the call: the work of the app function that made it since
   that function's start or its previous fwMount (lead; by: its name), the calls of FW's drawing functions in the same task before that
   (outside any such function: every one since the previous fwMount), and the call itself with a forced layout of its spot (mount); build:
   all the time in FW's drawing functions charged to it, inside the lead or not */
const WRAP = "function fwMount(el, draw, key){ /* budgets.test.mjs: every call timed, its build and a forced layout of its spot with it, into window.__fwIns */\n"
  + "  const B=__fwkB, tc=performance.now(), c=B.stack.length ? B.stack[B.stack.length-1] : null, lead=c ? tc-c.t : 0, sum=L=>L.reduce((n,b)=>n+b[1]-b[0], 0), bo=sum(B.pend.filter(b=>!c || b[1]<=c.t)), bi=sum(B.pend.filter(b=>c && b[1]>c.t));\n"
  + "  B.pend.length=0; const f0=el ? el.firstChild : null, lab=window.__fwkDesc ? window.__fwkDesc(el) : String(el && el.id || ''); B.inMount++; const t0=performance.now();\n"
  + "  try{ return __fwkMount0.apply(this, arguments); }\n"
  + "  finally{ B.inMount--; if(el && el.isConnected) el.getBoundingClientRect(); const t1=performance.now(), ms=t1-t0, R=v=>Math.round(v*100)/100; if(c) c.t=t1;\n"
  + "    (window.__fwIns||(window.__fwIns=[])).push({ms:R(ms+lead+bo), mount:R(ms), build:R(bo+bi), lead:R(lead), by:c ? c.n : '', spot:lab, ins:!!el && el.firstChild!==f0, n:el ? el.getElementsByTagName('*').length : 0, key:key==null ? '' : String(key).slice(0, 40), at:Math.round(t0)}); } }\n";
// the main script read as JS (from its "(function(){" to its </script>): what is not code (strings, template literal text, comments, regex
// literals: skip, [start, end) in order) and the brackets in code (br: [index, char] for ( ) { }), a template literal's ${ } followed as
// code; depth: { less } at the end (0: read whole), open: template literals left open. A / starts a regex literal where an expression
// starts (after an operator, an opening bracket, a } or a keyword such as return), else it is division
function scanJs(src, from, to) {
  const skip = [], br = [], T = [], KW = /^(return|typeof|case|do|else|in|of|new|delete|void|throw|instanceof|yield|await)$/; let i = from, depth = 0, last = '', word = '';
  const tpl = () => { const a = i; for (; i < to; i++) { const c = src[i]; if (c === '\\') { i++; continue; } if (c === '`') { skip.push([a, i + 1]); i++; return; } if (c === '$' && src[i + 1] === '{') { skip.push([a, i]); i += 2; T.push(depth); depth++; return; } } skip.push([a, to]); };
  while (i < to) {
    const c = src[i], d = src[i + 1];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
    if (c === '/' && d === '/') { const j = src.indexOf('\n', i), e = j < 0 || j > to ? to : j; skip.push([i, e]); i = e; continue; }
    if (c === '/' && d === '*') { const j = src.indexOf('*/', i + 2), e = j < 0 || j > to ? to : j + 2; skip.push([i, e]); i = e; continue; }
    if (c === "'" || c === '"') { const a = i; for (i++; i < to && src[i] !== c && src[i] !== '\n'; i++) if (src[i] === '\\') i++; i++; skip.push([a, i]); last = 's'; word = ''; continue; }
    if (c === '`') { i++; tpl(); last = 's'; word = ''; continue; }
    if (c === '/' && (last === '' || /[(,=:[!&|?{};+\-*%<>~^}]/.test(last) || (last === 'w' && KW.test(word)))) {
      const a = i; let cls = false, ok = false;
      for (i++; i < to && src[i] !== '\n'; i++) { const e = src[i]; if (e === '\\') { i++; continue; } if (cls) { if (e === ']') cls = false; continue; } if (e === '[') cls = true; else if (e === '/') { ok = true; i++; break; } }
      if (ok) { while (i < to && /[a-z]/.test(src[i])) i++; skip.push([a, i]); last = 's'; word = ''; continue; }
      i = a; }
    if (/[A-Za-z_$]/.test(c)) { const a = i; while (i < to && /[\w$]/.test(src[i])) i++; word = src.slice(a, i); last = 'w'; continue; }
    if (/[0-9]/.test(c)) { while (i < to && /[\w.]/.test(src[i])) i++; last = 'n'; word = ''; continue; }
    if (c === '}' && T.length && T[T.length - 1] === depth - 1) { depth--; T.pop(); i++; tpl(); last = 's'; word = ''; continue; }
    if (c === '{') { depth++; br.push([i, c]); } else if (c === '}') { depth--; br.push([i, c]); } else if (c === '(' || c === ')') br.push([i, c]);
    i++; last = c; word = '';
  }
  return { skip, br, depth, open: T.length };
}
const inSkip = (S, k) => { let lo = 0, hi = S.skip.length - 1; while (lo <= hi) { const m = (lo + hi) >> 1, r = S.skip[m]; if (k < r[0]) hi = m - 1; else if (k >= r[1]) lo = m + 1; else return true; } return false; };
const brAt = (S, k) => { let lo = 0, hi = S.br.length - 1; while (lo <= hi) { const m = (lo + hi) >> 1; if (S.br[m][0] < k) lo = m + 1; else if (S.br[m][0] > k) hi = m - 1; else return m; } return -1; };
// the main script's place in a page: k (its "\n<script>" line), at (its first line after 'use strict'), from (its "(function(){"), to
// (its </script>)
function mainAt(src) {
  const k = src.indexOf(MAIN_JS);
  if (k < 0) throw new Error('no main script start ("<script>\\n(function(){\\n\'use strict\';") in the page');
  const from = k + '\n<script>\n'.length, to = src.indexOf('</script>', from);
  return { k, at: k + MAIN_JS.length, from, to: to < 0 ? src.length : to };
}
// the fwMount( calls in the main script's code (S: scanJs): not in a string, a comment or a regex, not a method (x.fwMount), not its
// declaration
function fwCalls(src, M, S) {
  const out = [], re = /fwMount\(/g; re.lastIndex = M.from; let m;
  while ((m = re.exec(src)) && m.index < M.to) { const i = m.index; if (inSkip(S, i) || /[\w$.]$/.test(src.slice(i - 1, i)) || /function\s+$/.test(src.slice(Math.max(M.from, i - 12), i))) continue; out.push(i); }
  return out;
}
const callersOf = calls => { const names = new Map(), loose = []; for (const [, n, h] of calls) { if (n) names.set(n, (names.get(n) || 0) + 1); else loose.push(h); } return { names, loose, calls }; };
// the app functions that call fwMount, read from the main script's text the app's way: for each call in code, the top-level statement it
// is in, the nearest line at or above it that starts at column 0 (the app's style: every top-level statement starts there, the lines inside
// it are indented); when that is a function declaration, its name is a caller (names: name -> calls); a call in any other statement (an
// arrow at the top level, a listener) is loose. calls: [index, name or '', its head]
function fwCallers(src, M, S) {
  return callersOf(fwCalls(src, M, S).map(i => {
    let ls = src.lastIndexOf('\n', i - 1) + 1;
    while (ls > M.at && /\s/.test(src[ls])) ls = src.lastIndexOf('\n', ls - 2) + 1;
    const head = src.slice(ls, ls + 160), f = /^(?:async\s+)?function\s+([\w$]+)\s*\(/.exec(head);
    return [i, f ? f[1] : '', head.slice(0, 60)]; }));
}
// the same found another way, to hold the first to: each function declared at column 0 in code, its body by its braces matched (scanJs'
// brackets: its parameters' parentheses, then its { }), and each call in code given the one whose body it is in (none: loose). bad: a
// declaration whose body could not be matched
function braceCallers(src, M, S) {
  const fns = [], bad = [], re = /^(?:async\s+)?function\s+([\w$]+)\s*\(/gm; re.lastIndex = M.from; let m;
  while ((m = re.exec(src)) && m.index < M.to) {
    if (inSkip(S, m.index)) continue;
    let k = brAt(S, m.index + m[0].length - 1), n = 0;
    if (k < 0) { bad.push(m[1]); continue; }
    for (; k < S.br.length; k++) { const c = S.br[k][1]; if (c === '(') n++; else if (c === ')' && --n === 0) break; }
    for (k++; k < S.br.length && S.br[k][1] !== '{';) k++;
    const b0 = k < S.br.length ? S.br[k][0] : -1;
    for (n = 0; k < S.br.length; k++) { const c = S.br[k][1]; if (c === '{') n++; else if (c === '}' && --n === 0) break; }
    if (b0 < 0 || k >= S.br.length) { bad.push(m[1]); continue; }
    fns.push([m[1], b0, S.br[k][0]]);
  }
  const R = callersOf(fwCalls(src, M, S).map(i => { const f = fns.filter(x => x[1] < i && i < x[2]); return [i, f.length ? f[f.length - 1][0] : '', src.slice(src.lastIndexOf('\n', i - 1) + 1, i + 20).trim().slice(0, 60)]; }));
  return Object.assign(R, { fns: fns.length, bad });
}
// where the two disagree: a call one of them has and the other not, or given to another function (the line of the page with each)
function callersDiff(src, a, b) {
  const ln = i => src.slice(0, i).split('\n').length, A = new Map(a.calls.map(x => [x[0], x[1]])), Bm = new Map(b.calls.map(x => [x[0], x[1]])), out = [];
  for (const [i, n] of A) if (!Bm.has(i) || Bm.get(i) !== n) out.push('line ' + ln(i) + ': ' + (n || 'loose') + ' read the app\'s way, ' + (Bm.has(i) ? Bm.get(i) || 'loose' : 'no call') + ' by its braces');
  for (const [i, n] of Bm) if (!A.has(i)) out.push('line ' + ln(i) + ': no call read the app\'s way, ' + (n || 'loose') + ' by its braces');
  return out;
}
const CALLER_WRAP = n => 'function ' + n + '(){ const B=__fwkB; B.stack.push({t:performance.now(), n:' + JSON.stringify(n) + '}); try{ return __fwkC_' + n + '.apply(this, arguments); } finally{ B.stack.pop(); } } /* budgets.test.mjs: ' + n + ' calls fwMount: its work before each call is that call\'s build */ ';
// the hooked copy's text (above). hookSource.callers / .loose: the callers found the app's way (each wrapped); hookSource.check: the main
// script read whole (scanJs: its braces balanced, no template left open), every column-0 declaration's body matched, and the callers found
// by the braces the same (diff: where they are not)
function hookSource(src) {
  const M = mainAt(src), n = src.split('function fwMount(').length - 1;
  if (n !== 1) throw new Error('the page has ' + n + ' "function fwMount(" (expected one: item 97\'s plumbing)');
  const S = scanJs(src, M.from, M.to), { names, loose, calls } = fwCallers(src, M, S), BC = braceCallers(src, M, S);
  let body = src.slice(M.at);
  for (const name of names.keys()) body = body.replace(new RegExp('^((?:async\\s+)?)function\\s+' + name.replace(/\$/g, '\\$') + '\\s*\\(', 'gm'), (x, a) => CALLER_WRAP(name) + a + 'function __fwkC_' + name + '(');
  const out = (src.slice(0, M.at) + HOOK + body).replace('function fwMount(', WRAP + 'function __fwkMount0(');
  const nm = N => [...N].map(([x, c]) => x + ' (' + c + ' call' + (c > 1 ? 's' : '') + ')');
  hookSource.callers = nm(names); hookSource.loose = loose;
  hookSource.check = { whole: S.depth === 0 && S.open === 0, depth: S.depth, open: S.open, fns: BC.fns, bad: BC.bad, braces: nm(BC.names), bloose: BC.loose.length, calls: calls.length, diff: callersDiff(src, { calls }, BC) };
  return out;
}
// the parts of fred world in a page's text: the bundle's tag (<script id="fwJs"> with or without other attributes), window.FW and
// fwMount's declaration. A page with none is before item 97 (nothing to budget); one with some but not all is broken (a failure)
function fwParts(src) {
  const tag = /<script\b[^>]*\bid=["']?fwJs\b/.test(src), fw = /window\.FW\s*=/.test(src), mount = /function fwMount\(/.test(src);
  return { tag, fw, mount, none: !tag && !fw && !mount, all: tag && fw && mount };
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
let RATE = 1, CTX_INIT = null; const CDP = new WeakMap(), RATES = new WeakMap(); /* RATES: page -> every CPU slowdown rate the kit gave it, in order (the self-tests read it). CTX_INIT: an init script more for the contexts made while it is set (the walk self-test's probes) */
async function kitBrowser() {
  const b = await chromium.launch(), nc = b.newContext.bind(b);
  b.newContext = async (...a) => {
    const ctx = await nc(...a); await ctx.addInitScript(FWK_INIT); if (CTX_INIT) await ctx.addInitScript(CTX_INIT.fn, CTX_INIT.arg);
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
// main-thread ms per frame over `ms` at `rate`: TaskDuration (CDP Performance.getMetrics) over the frames counted in the page. rate in what
// it returns: the CPU slowdown the page actually had for the window, read from what the kit gave it (RATES: the one given for the
// window, else the last given before, else 1)
async function frameCost(p, rate = BUDGET.rate, ms = BUDGET.win) {
  const cdp = CDP.get(p); await cdp.send('Performance.enable');
  const td = async () => (await cdp.send('Performance.getMetrics')).metrics.find(m => m.name === 'TaskDuration').value;
  const log = RATES.get(p) || [], k0 = log.length;
  if (rate !== 1) await throttle(p, rate);
  const given = log.length > k0 ? log[k0] : k0 ? log[k0 - 1] : 1;
  try {
    await p.evaluate(() => window.__fwkA.fStart()); await sleep(150);
    const t0 = await td(), f0 = await p.evaluate(() => window.__fwkA.fRead());
    await sleep(ms);
    const f1 = await p.evaluate(() => window.__fwkA.fStop()), t1 = await td(), n = f1 - f0;
    return { ms: n > 0 ? r2((t1 - t0) * 1000 / n) : null, frames: n, task: Math.round((t1 - t0) * 1000), rate: given };
  } finally { if (rate !== 1) await throttle(p, 1); }
}
const busy = p => p.evaluate(() => { const t = performance.now(); let x = 0; for (let i = 0; i < 4e6; i++) x += Math.sqrt(i); return performance.now() - t + (x < 0 ? 1 : 0); });
// the frame on a screen: one window (measure(0): frameCost); over L.frameMs, measured again (measure(1), measure(2); the walk replays the
// screen's drawings before every window, so each has them moving from the start of their move) up to L.tries windows in all, stopping at
// the first under it, and the lowest kept (load on the machine only adds to a window). F.all: every window read
async function frameLow(measure, L = BUDGET) {
  const all = [await measure(0)]; let F = all[0];
  while (F.ms != null && F.ms > L.frameMs && all.length < L.tries) { const G = await measure(all.length); all.push(G); if (G.ms != null && G.ms < F.ms) F = G; }
  return Object.assign({}, F, { all: all.map(x => x.ms), rates: all.map(x => x.rate) });
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
// with the screen held still (stillWhile), and its windows (frameLow) at L.rate x, each after a replay of its drawings (a new app open)
// when they were made to move (replay), so each window has them moving from the start of their move. A quiet host: judged; a window read
// at another CPU slowdown than L.rate (what the kit gave the page: frameCost's rate) is a 'frame' failure (not measured at L.rate x); one
// kept without the screen moving through it (an animation running at both its ends advanced at least half its length) or with under 30
// frames is a 'frame' failure (not measured), and one over L.frameMs a 'frame' failure with its paused reading added (ownCost: the last
// thing measured on the page). A busy one: a 'host busy' failure, the frame not judged. S: the walk's state (hostBusy, busy, refs, waited,
// frames, again, max.frame); out: the failures
async function screenFrame(name, p, running, replay, REF, S, out, L = BUDGET, wait = sleep) {
  const win = async () => { if (replay) { await p.evaluate(() => window.__fwkA.appOpen()); await until(() => p.evaluate(() => !!document.querySelector('.fwm.fwm-go')), 2000); await sleep(150); }
    const s0 = await snapOf(p), W = await frameCost(p, L.rate), s1 = await snapOf(p); W.moved = moved(s0, s1); W.after = (await audit(p)).running; return W; };
  const H = await frameHost(() => frameLow(win, L), () => stillWhile(p, () => refCost(REF.p)), L, wait, S.hostBusy);
  const F = H.F, r = { F, H, refs: H.reads.map(x => x.refs.join('/')), own: null };
  const still = H.reads.flatMap(x => x.still).filter(Boolean), most = k => Math.max(0, ...still.map(s => s[k] || 0));
  S.frames.push(name);
  if (!H.judged) { S.hostBusy = true; S.busy.push(name);
    out.push({ screen: name, rule: 'host busy', sel: 'the page', detail: 'frame not judged: the host reference read ' + r.refs.join(', ') + ' ms a frame at ' + L.rate + 'x just before / after the screen\'s windows (quiet at most ' + L.refMs + '; the screen held still meanwhile: its animations moved at most ' + most('ms') + ' ms and its main thread ran at most ' + most('task') + ' ms of tasks over a read), ' + H.reads.length + (H.reads.length > 1 ? ' reads ' + L.waitMs / 1000 + ' s apart' : ' read') + '; the screen read ' + H.reads.map(x => x.F.all.join('/')).join(', ') + ' ms there' });
    return r; }
  S.hostBusy = false; S.refs.push(...H.refs); if (H.reads.length > 1) S.waited.push(name + ' (' + H.reads.length + ' reads)');
  if (!(F.rates || []).length || F.rates.some(x => x !== L.rate)) { (S.by[name] || (S.by[name] = {})).rateOff = 1;
    out.push({ screen: name, rule: 'frame', sel: 'the page', detail: 'not measured at ' + L.rate + 'x: its windows read ' + F.all.join(', ') + ' ms at a CPU slowdown of ' + (F.rates || []).join(', ') + 'x (the rule\'s ' + L.rate + 'x)' });
    return r; }
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
// to hostTries reads. Busy alone too: the host is busy, a 'host busy' line (the step fails, no verdict) and the self-test in the walk's
// state (S.selfBusy: the report holds it against the failures, so a dropped line is still a FAIL); quiet alone, the screen pushed the
// reference up (busyHost false: the self-test fails)
async function busyOr(name, Q, REF, FAILS, S = ST, L = BUDGET, wait = sleep) {
  const alone = []; for (let k = 0; k < L.hostTries; k++) { if (k) await wait(L.waitMs); alone.push((await refCost(REF.p)).ms); if (hostQuiet(alone.slice(-1), L)) break; }
  const busyHost = !hostQuiet(alone.slice(-1), L);
  if (busyHost) { S.selfBusy.push(name); FAILS.push({ screen: name, rule: 'host busy', sel: 'the page', detail: 'not judged: the host reference read ' + Q.refs.join(', ') + ' ms a frame at ' + L.rate + 'x next to the screen (held still) and ' + alone.join(', ') + ' alone, ' + L.waitMs / 1000 + ' s apart (quiet at most ' + L.refMs + '): this self-test needs a quiet host' }); }
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
// read again over 4 ms (again) or after a busy reading (waited), the quiet reference readings (refs), whether the host stayed busy on
// the last screen (hostBusy) and the self-tests it stayed busy for (selfBusy, from busyOr); for the insert rule every screen with fwMount
// calls and its spots (insFrom), the spots opened again at 6x and by which screen (insSeen) and those whose calls were read there
// (insDone); per screen what the walk saw (by: the most nodes, running, unmounted and off-screen groups as it is and moving, running with
// the page hidden, the frame judged or its window kept without the screen moving, the slowest call at 6x, and its error lists as opened
// and at 6x: errs, errs6),
// so the report can tell a number over its limit that no failure carries; the most of each number with its screen
const walkState = () => ({ limits: null, wait: null, walked: [], skipped: [], screens: 0, broken: [], art: [], unhooked: [], ins: 0, ran: [], frames: [], again: [], refs: [], busy: [], selfBusy: [], waited: [], hostBusy: false, insSeen: new Map(), insFrom: [], insDone: new Set(), by: {}, max: { nodes: [0, ''], running: [0, ''], ins6: [0, ''], frame: [0, ''] } });
// what the walk's state says each rule had to report (gaps(S, FAILS, L)[rule]: [screen, what] for each): a number over its limit on a
// screen with no failure under that rule there, FW animations that ran on a screen the frame rule did not measure (and no frame failure
// there, or its window kept without the screen moving and no frame failure; the screen with the most FW animations running counts as one
// where they ran whatever S.ran says), a screen or a self-test the host stayed busy for with no 'host busy' failure, fwMount calls whose
// spots were never read at 6x (and no 'insert' failure on the screen that opened them again). A walk that hands every failure on has
// none; one whose failures were all dropped has one for each failure the walk found
function gaps(S, FAILS, L = BUDGET) {
  const has = (rule, n) => FAILS.some(f => f.rule === rule && f.screen === n);
  const over = (k, lim, rule, what) => Object.keys(S.by).filter(n => S.by[n][k] != null && S.by[n][k] > lim && !has(rule, n)).map(n => [n, what(S.by[n][k])]);
  const keys = [...new Set(S.insFrom.map(x => x[1]))].filter(k => !S.insDone.has(k)), from = k => S.insFrom.filter(x => x[1] === k).map(x => x[0]);
  const most = S.max.running[0] > 0 && !S.ran.includes(S.max.running[1]) ? [S.max.running[1]] : [], ran = S.ran.concat(most);
  return {
    motion: over('reduce', 0, 'motion', () => 'opened with Reduce Motion on, with no motion failure').concat(over('shut', 0, 'motion', () => 'opened with fred world\'s gate shut (no html.fw-anim), with no motion failure')),
    nodes: over('nodes', L.nodes, 'nodes', v => v + ' FW nodes (budget ' + L.nodes + ') with no nodes failure'),
    running: over('running', L.anims, 'running', v => v + ' FW animations running (budget ' + L.anims + ') with no running failure'),
    'not mounted': over('unmounted', 0, 'not mounted', v => v + ' pieces of fred world art outside any fwMount spot with no not mounted failure'),
    'off screen': over('offs', 0, 'off screen', v => v + ' groups of FW animations running off screen with no off screen failure'),
    background: over('hidden', 0, 'background', v => v + ' FW animations running with the page hidden with no background failure'),
    frame: ran.filter(n => !S.frames.includes(n) && !has('frame', n)).map(n => [n, 'FW animations ran on it' + (most.includes(n) ? ' (' + S.max.running[0] + ', the most on any screen, though the walk did not list it among the screens where they ran)' : '') + ' and the frame rule did not measure it'])
      .concat(over('frame', L.frameMs, 'frame', v => 'judged at ' + v + ' ms a frame (budget ' + L.frameMs + ' ms) with no frame failure'))
      .concat(over('nomotion', 0, 'frame', v => 'its window was not measured with the screen\'s motion running, with no frame failure'))
      .concat(over('rateOff', 0, 'frame', v => 'its windows were not read at ' + L.rate + 'x, with no frame failure')),
    'host busy': S.busy.concat(S.selfBusy).filter(n => !has('host busy', n)).map(n => [n, 'the host stayed busy for ' + (S.busy.includes(n) ? 'it' : 'this self-test') + ' with no host busy failure']),
    insert: keys.filter(k => !has('insert', S.insSeen.get(k) || from(k)[0])).map(k => [S.insSeen.get(k) || from(k)[0], 'its fwMount calls (' + k + (from(k).length > 1 ? '; the same calls on ' + from(k).slice(1).join(', ') : '') + ') were never read at ' + L.rate + 'x'])
      .concat(over('ins6', L.insMs, 'insert', v => 'a fwMount call took ' + v + ' ms at ' + L.rate + 'x (budget ' + L.insMs + ' ms) with no insert failure'))
      .concat(over('notAt6', 0, 'insert', () => 'opened again for its fwMount calls not at ' + L.rate + 'x, with no insert failure'))
      .concat(over('motion6', 0, 'insert', () => 'opened again for its fwMount calls not as the walk opens a screen (Reduce Motion on or fred world\'s gate shut), with no insert failure')),
  };
}
// the insert re-open's key for a screen's fwMount calls (I: __fwIns): each call's spot and fwMount key ([the key]; a call with none:
// the drawing's nodes, or emptied), sorted, once each. A screen whose calls have the same key as one already opened again is not opened
// again (the same drawings in the same spots were read at the rule's rate there)
const insKey = I => [...new Set(I.map(x => x.spot + ' [' + (x.key ? x.key : x.n ? 'no key, ' + x.n + ' nodes' : 'emptied') + ']'))].sort().join(' | ');
// the insert rule on the calls a screen made when opened again at L.rate x (I), with those it made as opened (A0ins: the 1x readings,
// for the line): each call, its build and the call with its layout (__fwIns' ms), at most L.insMs
function insJudge(name, I, A0ins, out, L = BUDGET) {
  const at1 = sp => Math.max(...A0ins.filter(x => x.spot === sp).map(x => x.ms));
  for (const x of I) if (x.ms > L.insMs) out.push({ screen: name, rule: 'insert', sel: x.spot, detail: x.ms + ' ms at ' + L.rate + 'x (budget ' + L.insMs + ' ms; the build ' + r2(x.ms - (x.mount || 0)) + ' ms'
    + ' (' + (x.by ? x.by + '\'s work before the call ' + x.lead + ' ms; ' : '') + 'in FW\'s drawing functions ' + (x.build || 0) + ' ms), the call with its spot\'s layout ' + x.mount + ' ms; '
    + (A0ins.some(z => z.spot === x.spot) ? at1(x.spot) + ' ms at 1x; ' : '') + (x.ins ? 'a new drawing, ' + x.n + ' nodes' : 'kept') + (x.key ? ', key ' + x.key : '') + ')' });
}
// the report: one ok per rule nothing failed and nothing in the walk's state contradicts (gaps), else one FAIL line per failure (the
// self-tests' too: a self-test that found the host busy adds a 'host busy' line) and one per gap, then the walk's own checks. S: the
// walk's state (ST); log: where a note goes; L: the limits judged. The frame rule gets no ok when the host was busy on every screen it
// would judge (nothing was judged by it)
function report(C, FAILS, S, ERRS, log = console.log, L = BUDGET) {
  const rules = [
    ['motion', 'every screen opened with Reduce Motion off and fred world\'s gate open (html.fw-anim)'],
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
  /* the error lists handed on (ERRS) and those in the walk's record of each screen (S.by: errs as opened, errs6 at L.rate x) not among them */
  const kept = Object.keys(S.by).flatMap(n => [[n, S.by[n].errs], [n + ' (at ' + L.rate + 'x)', S.by[n].errs6]]).filter(([, e]) => e && !ERRS.some(([, x]) => x === e));
  const errs = ERRS.concat(kept).filter(([, e]) => e && e.length).map(([n, e]) => n + ': ' + e.slice(0, 2).join(' | '));
  C.ok(!errs.length, 'no page errors or console errors', errs.slice(0, 8));
}

async function main() {
  if (!ARG || !fs.existsSync(ARG)) { console.log('usage: node budgets.test.mjs <null.html> [screen-name regex]' + (ARG ? '   (no such page: ' + ARG + ')' : '')); process.exitCode = 2; return; }
  const PAGE = path.resolve(ARG), SRC = fs.readFileSync(PAGE, 'utf8'), P = fwParts(SRC);
  const C = checker(), FAILS = [], ERRS = [];
  if (SELF) partsDecision(C); /* (before the decision itself: a decision that lets a page with some of the parts through fails here, on that page too) */
  if (P.none) { C.done('no fred world in this page (before item 97): nothing to budget'); return; }
  if (!P.all) { C.ok(false, 'fred world in part: the page has ' + ['the bundle\'s tag (<script id="fwJs">)', 'window.FW', 'function fwMount('].filter((x, i) => [P.tag, P.fw, P.mount][i]).join(' and ') + ' but not ' + ['the bundle\'s tag (<script id="fwJs">)', 'window.FW', 'function fwMount('].filter((x, i) => ![P.tag, P.fw, P.mount][i]).join(' or '), P); C.done('fred world budgets'); return; }
  let HOOKED;
  try { const dir = path.join(path.dirname(PAGE), 'budgets-hook'); fs.mkdirSync(dir, { recursive: true }); HOOKED = path.join(dir, 'budgets-hook.html'); fs.writeFileSync(HOOKED, hookSource(SRC)); }
  catch (e) { C.ok(false, 'hook: the page has fred world (window.FW) but no plumbing to hook: ' + e.message); C.done('fred world budgets'); return; }
  console.log('  page ' + PAGE + ' (fred world v' + ((/fred world v(\d+) start/.exec(SRC) || [])[1] || '?') + '), hooked copy ' + HOOKED + '; fwMount\'s callers, each timed from its start: ' + (hookSource.callers.join(', ') || 'none') + (hookSource.loose.length ? '; ' + hookSource.loose.length + ' calls in no named function' : ''));
  /* fwMount's callers the app's way (each wrapped) and by their braces, the same; the main script read whole */
  const K = hookSource.check;
  C.ok(K.whole && !K.bad.length && !K.diff.length, 'fwMount\'s callers read the app\'s way (the column-0 line above each call: ' + (hookSource.callers.join(', ') || 'none') + ', ' + hookSource.loose.length + ' loose) are those found by each function\'s braces (' + (K.braces.join(', ') || 'none') + ', ' + K.bloose + ' loose; ' + K.fns + ' functions declared at column 0' + (K.whole ? ', the main script read whole' : ', the main script NOT read whole: depth ' + K.depth + ', ' + K.open + ' template literals open') + ')', { diff: K.diff.slice(0, 6), bad: K.bad.slice(0, 6) });
  const B = await kitBrowser();
  try {
    const REF = await openRef(B);
    if (SELF) await selfTest(B, HOOKED, C, ERRS, REF, FAILS);
    await walk(B, HOOKED, C, FAILS, ERRS, REF, ST, ONLY ? (s => ONLY.test(s.name)) : null, BUDGET, sleep);
  } finally { await B.close(); }
  /* the walk held to what main asked of it: the rule's limits, the real waits, every screen asked for walked or skipped for its needs */
  const hw = heldWalk(ST, BUDGET, sleep, ONLY ? screens.filter(s => ONLY.test(s.name)) : screens);
  C.ok(!hw.length, 'the walk judged by the rule\'s limits (' + Object.keys(BUDGET).map(k => k + ' ' + BUDGET[k]).join(', ') + '), with its real waits, over every screen asked for (' + ST.walked.length + ' walked, ' + ST.skipped.length + ' skipped for their needs, of ' + (ONLY ? screens.filter(s => ONLY.test(s.name)).length + ' picked by ' + ONLY : 'all ' + screens.length) + ')', hw);
  console.log('  (' + Math.round((Date.now() - T0) / 1000) + ' s)');
  C.done(summary(ST));
}
// what main asked of the walk and the walk's state does not show (none: held): S.limits other than L0 (each limit by name, either way), a
// wait other than wait0, a screen asked for (want: the shared list's screens, or those the regex picks) neither walked nor skipped for its
// needs (run() skips only a screen with needs whose element the page lacks), one walked that was not asked for, a walker count other than
// the screens walked
function heldWalk(S, L0, wait0, want) {
  const bad = [], L = S.limits || {}, got = new Set(S.walked || []), sk = new Set(S.skipped || []);
  if (!S.limits) bad.push('no limits recorded (the walk not run with this state)');
  for (const k of new Set(Object.keys(L0).concat(Object.keys(L)))) if (S.limits && L[k] !== L0[k]) bad.push('judged with ' + k + ' ' + L[k] + ' (the rule\'s ' + L0[k] + ')');
  if (S.wait !== wait0) bad.push('its waits were not the real ones (' + (S.wait ? S.wait.name || 'another function' : 'none') + ')');
  const miss = want.filter(s => !got.has(s.name) && !(s.needs && sk.has(s.name))).map(s => s.name), extra = [...got].filter(n => !want.some(s => s.name === n));
  if (miss.length) bad.push(miss.length + ' screens asked for neither walked nor skipped for their needs: ' + miss.slice(0, 6).join(', '));
  if (extra.length) bad.push(extra.length + ' screens walked that were not asked for: ' + extra.slice(0, 6).join(', '));
  if (S.screens !== got.size) bad.push('walker ran ' + S.screens + ' times for ' + got.size + ' screens walked');
  return bad;
}
// main's first decision, on fred world's parts, self-tested before main makes it (with the self-tests on, on every page, so a decision that
// lets a page with only some of the parts through fails on that page too): the step itself run (BUDGETS_SELF=0, so no browser and no
// self-test of its own) on made-up pages in a folder of its own. None of the parts: "OK: no fred world in this page (before item 97)", exit
// 0; the tag and window.FW without fwMount, window.FW and fwMount without the tag, fwMount alone: 'FAIL 1', "fred world in part", exit 1
function partsDecision(C) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'budgets-parts-'));
  try {
    const PG = [['none', '<!doctype html><html><body><p>no fred world</p><script>var FW2 = 1;</script></body></html>\n'], ['tag+FW', '<!doctype html><html><body><script id="fwJs" data-build="v5">window.FW = {};</script></body></html>\n'],
      ['FW+fwMount', '<!doctype html><html><body><script>window.FW = {}; function fwMount(el){}</script></body></html>\n'], ['fwMount', '<!doctype html><html><body><script>function fwMount(el){}</script></body></html>\n']].map(([n, t]) => {
      const f = path.join(dir, n.replace(/\W/g, '-') + '.html'); fs.writeFileSync(f, t); let code = 0, out = '';
      try { out = execFileSync(process.execPath, [fileURLToPath(import.meta.url), f], { env: Object.assign({}, process.env, { BUDGETS_SELF: '0' }), encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'] }); }
      catch (e) { code = e.status == null ? -1 : e.status; out = String(e.stdout || '') + String(e.stderr || ''); }
      const ls = out.split('\n').filter(x => x.trim()), lastL = ls[ls.length - 1] || '';
      return { n, code, last: lastL, ok: n === 'none' ? code === 0 && /^OK: no fred world in this page \(before item 97\)/.test(lastL) : code === 1 && lastL === 'FAIL 1' && ls.some(x => x.startsWith('  FAIL fred world in part: ')) }; });
    C.ok(PG.every(x => x.ok), 'self-test: main\'s decision on fred world\'s parts, the step run on made-up pages: ' + PG.map(x => x.n + ' "' + x.last.slice(0, 40) + '" exit ' + x.code + (x.ok ? '' : ' (NOT as it should)')).join('; '), PG);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
// the step's last line (after the checker's OK), written from the limits the walk judged by (S.limits, which main holds to BUDGET) and the
// walk's state, so it names the numbers it judged by
const thousands = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
function summary(S) {
  const L = S.limits || BUDGET, rr = S.refs.filter(x => x != null), host = rr.length ? ' (host reference ' + r2(Math.min(...rr)) + '-' + r2(Math.max(...rr)) + ' ms, quiet at most ' + L.refMs + ')' : '';
  return 'fred world budgets: ' + S.screens + ' screens' + (S.art.length ? ' (' + S.art.length + ' with fred world art)' : ' (none with fred world art yet: all zeros)') + ', at most ' + thousands(L.nodes) + ' FW nodes and ' + L.anims + ' running FW animations, nothing running off screen or hidden, ' + L.frameMs + ' ms a frame' + host + ' and ' + L.insMs + ' ms an insert at ' + L.rate + 'x' + (SELF ? '; self-tests on ' + SELF_SCREEN : '');
}

/* ================================================================ self-tests and the drawings' numbers, on one screen */
const SELF_SCREEN = 'plan-before';
// the walk self-test's probes, an init script in every page of the contexts made while it runs (CTX_INIT, arg: n): once the page has
// loaded, in one task, a bird built n times (a fixed amount of work, so slower at 6x: n is calibrated to about BUILD_1X ms at 1x, under
// the 50 ms insert budget there and over it at 6x) and its last string mounted with fwMount (key kit:w) in a spot at the top of the view,
// built once under Reduce Motion (as a drawing whose moving look costs more to build); far below the fold, a bird put in with innerHTML
// with a fw- loop no app rule reaches
function PROBE_INIT(n) {
  addEventListener('load', () => setTimeout(() => { try {
    const K = window.__fwk, F = window.FW; if (!K || !F) return;
    const v = document.querySelector('main .view.active, .view.active') || document.body, a = document.createElement('div'), d = document.createElement('div');
    a.id = 'fwkW'; a.style.cssText = 'width:140px;height:140px;overflow:hidden'; v.prepend(a);
    const m = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : n; let h = ''; for (let i = 0; i < m; i++) h = F.bird({});
    K.fwMount(a, h, 'kit:w');
    d.id = 'fwkV'; d.style.cssText = 'width:140px;height:140px;overflow:hidden;margin-top:3000px'; v.append(d);
    d.innerHTML = F.bird({}) + '<i style="display:block;width:20px;height:20px;animation:fw-ch-bob 2.4s infinite"></i>';
  } catch (e) { window.__kitProbe = String(e); } }, 0));
}
// an init script that keeps fred world's gate shut (html.fw-anim taken off whenever it is put on), for the self-tests of a screen opened
// with Reduce Motion off and Animate the world on whose gate is shut
function GATE_SHUT() {
  const go = () => { const h = document.documentElement; if (!h) return; const off = () => { if (h.classList.contains('fw-anim')) h.classList.remove('fw-anim'); }; new MutationObserver(off).observe(h, { attributes: true, attributeFilter: ['class'] }); off(); };
  if (document.documentElement) go(); else document.addEventListener('readystatechange', go, { once: true });
}
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
    // the host limit (REF_MS, BUDGET.refMs) is the kit's own, from its measurements: just above the highest quiet reading on record (at most
    // 0.1 ms more) and under the lowest busy one (a restatement of the record: REF_MS changed alone fails here)
    C.ok(BUDGET.refMs === REF_MS && HOST_QUIET_HIGH < REF_MS && REF_MS <= r2(HOST_QUIET_HIGH + 0.1) && REF_MS < HOST_BUSY_LOW,
      'self-test: the host limit ' + REF_MS + ' ms is just above the highest quiet reading of the host reference on record (' + HOST_QUIET_HIGH + ', at most 0.1 more) and under the lowest busy one (' + HOST_BUSY_LOW + ')', { REF_MS, refMs: BUDGET.refMs, HOST_QUIET_HIGH, HOST_BUSY_LOW });
    // the parts of fred world a page must have all of or none of (fwParts, main's first decision): the bundle's tag with other attributes or
    // none, quoted or not, window.FW and fwMount's declaration; none is a page before item 97 (OK, nothing to budget), some but not all a
    // failure; the hooked copy of this page has all three
    const fp = [['<script id="fwJs" data-build="v5">window.FW = {};</script> function fwMount(', 'all'], ['<script id=fwJs>window.FW={}</script>function fwMount(', 'all'], ["<script async id='fwJs'>window.FW = 1</script>\nfunction fwMount(", 'all'],
      [fs.readFileSync(HOOKED, 'utf8'), 'all'], ['<p>no fred world</p><script>var FW2 = 1</script>', 'none'], ['<script id="fwJsX">window.FW = 1</script> function fwMount(', 'part'], ['<script id="fwJs">window.FW = {}</script>', 'part'],
      ['function fwMount(el){}', 'part'], ['<script id="fwJs"></script>', 'part'], ['window.FW = {}; function fwMount(', 'part']].map(([t, want]) => { const P = fwParts(t), got = P.all ? 'all' : P.none ? 'none' : 'part'; return { want, got, t: t.slice(0, 50) }; });
    C.ok(fp.every(x => x.got === x.want), 'self-test: fred world\'s parts in a page\'s text (the bundle\'s tag with or without other attributes, window.FW, fwMount\'s declaration): all three or none, and some but not all is a failure (' + fp.map(x => x.want + (x.got === x.want ? '' : ' read as ' + x.got)).join(', ') + ')', fp);
    const LX = Object.assign({}, BUDGET, { nodes: 1201, anims: 31, frameMs: 4.5, insMs: 51, rate: 7, refMs: 1.9 }), sx = summary(Object.assign(walkState(), { screens: 3, art: ['a'], refs: [1.2, 1.3], limits: LX })), s0 = summary(Object.assign(walkState(), { screens: 3, art: ['a'], refs: [1.2, 1.3], limits: BUDGET }));
    C.ok(['at most 1,201 FW nodes and 31 running FW animations', ', 4.5 ms a frame (host reference 1.2-1.3 ms, quiet at most 1.9) and 51 ms an insert at 7x'].every(x => sx.includes(x)) && !/1,200|30 running|4 ms|50 ms|6x/.test(sx)
      && ['at most 1,200 FW nodes and 30 running FW animations', ', 4 ms a frame (host reference 1.2-1.3 ms, quiet at most ' + BUDGET.refMs + ') and 50 ms an insert at 6x'].every(x => s0.includes(x)),
      'self-test: the last line is written from the limits the walk judged by (its state\'s; other limits: "' + sx.slice(sx.indexOf('at most'), sx.indexOf('; self') < 0 ? undefined : sx.indexOf('; self')) + '")', { sx, s0 });
    // main holds its walk to what it asked (heldWalk): on made-up walk states, the rule's limits (or a copy with the same numbers), the real
    // waits and every screen asked for walked or skipped for its needs: held; the insert limit at 100 ms, the frame at 6 ms, no limits
    // recorded (a state the walk never ran with), waits not slept, a screen neither walked nor skipped, one skipped without needs, one
    // walked that was not asked for, a walker count off: each named
    const WT = [{ name: 'a' }, { name: 'b' }, { name: 'c', needs: '#x' }], hs = o => Object.assign(walkState(), { limits: BUDGET, wait: sleep, walked: ['a', 'b'], skipped: ['c'], screens: 2 }, o), hwt = (o, w = WT) => heldWalk(hs(o), BUDGET, sleep, w);
    const hcase = [['held', hwt({}), 0], ['a copy of the limits', hwt({ limits: Object.assign({}, BUDGET) }), 0], ['insMs 100', hwt({ limits: Object.assign({}, BUDGET, { insMs: 100 }) }), /insMs 100 \(the rule.s 50\)/],
      ['frameMs 6', hwt({ limits: Object.assign({}, BUDGET, { frameMs: 6 }) }), /frameMs 6 \(the rule.s 4\)/], ['no limits', hwt({ limits: null }), /no limits recorded/], ['no waits', hwt({ wait: async () => {} }), /waits were not the real ones/],
      ['b not walked', hwt({ walked: ['a'], screens: 1 }), /neither walked nor skipped.*: b$/], ['c skipped without needs', hwt({}, [{ name: 'a' }, { name: 'b' }, { name: 'c' }]), /neither walked nor skipped.*: c$/],
      ['d walked, not asked', hwt({ walked: ['a', 'b', 'd'], screens: 3 }), /not asked for: d$/], ['walker count', hwt({ screens: 5 }), /walker ran 5 times for 2/]].map(([n, got, want]) => ({ n, got, ok: want === 0 ? !got.length : got.length === 1 && want.test(got[0]) }));
    C.ok(hcase.every(x => x.ok), 'self-test: main holds its walk to what it asked (heldWalk on made-up walk states): ' + hcase.map(x => x.n + (x.ok ? '' : ' NOT') + ' ' + (x.got.length ? '"' + x.got.join('; ').slice(0, 60) + '"' : 'held')).join('; '), hcase);
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
    // the insert is the drawing's build and the call (the app builds fred before it calls fwMount with the string): at the rule's 6x, a
    // deliberately slow build through FW's drawing functions (FW.bird again and again for SLOW_MS of wall time) and a pre-built mount of its
    // last string in the same task: its __fwIns time is the build plus the call, and the walk's insert judge (insJudge) fails it at the
    // committed 50 ms; a string built in an earlier task and mounted alone is charged no build and passes
    await probe(p, 'fwkS', '', 'width:140px;height:140px;overflow:hidden'); await probe(p, 'fwkT', '', 'width:140px;height:140px;overflow:hidden');
    await p.evaluate(() => { window.__kitH = window.FW.bird({}); }); await sleep(100);
    const kSB0 = RATES.get(p).length; let SLB = null, PRB = null;
    await throttle(p, BUDGET.rate);
    try {
      SLB = await p.evaluate(ms => { const d = document.getElementById('fwkS'), F = window.FW, t0 = performance.now(); let h = '', n = 0; while (performance.now() - t0 < ms) { h = F.bird({}); n++; } const t1 = performance.now(); window.__fwk.fwMount(d, h, 'kit:s'); const L = window.__fwIns; return { built: Math.round((t1 - t0) * 100) / 100, n, rec: L[L.length - 1], wrapped: window.__fwk.build.wrapped.slice() }; }, SLOW_MS);
      PRB = await p.evaluate(() => { window.__fwk.fwMount(document.getElementById('fwkT'), window.__kitH, 'kit:t'); const L = window.__fwIns; return L[L.length - 1]; });
    } finally { await throttle(p, 1); }
    const kSB = RATES.get(p).slice(kSB0); await unmount(p, ['fwkS', 'fwkT']);
    const JSB = [], JPB = []; insJudge('self-test slow build', [SLB.rec], [], JSB); insJudge('self-test pre-built', [PRB], [], JPB);
    C.ok(kSB.join(' ') === RULE.rate + ' 1' && SLB.wrapped.includes('bird') && /#fwkS/.test(SLB.rec.spot) && SLB.rec.build >= 0.75 * SLB.built && Math.abs(SLB.rec.ms - SLB.rec.mount - SLB.rec.build) <= 0.05 && SLB.rec.ms > BUDGET.insMs && JSB.length === 1
      && /#fwkT/.test(PRB.spot) && PRB.build === 0 && PRB.lead === 0 && PRB.ms === PRB.mount && PRB.ms < BUDGET.insMs && !JPB.length,
      'self-test: an insert is the drawing\'s build and the call: at ' + kSB[0] + 'x, ' + SLB.n + ' FW.bird builds over ' + SLB.built + ' ms then a mount of the last string in the same task read ' + SLB.rec.ms + ' ms (the build in FW\'s drawing functions ' + SLB.rec.build + ', the call with its layout ' + SLB.rec.mount + '), ' + (JSB.length ? 'an insert failure at the committed ' + BUDGET.insMs + ' ms' : 'no insert failure') + '; a string built in an earlier task, mounted alone, ' + PRB.ms + ' ms (build ' + PRB.build + '), ' + (JPB.length ? 'a failure' : 'no failure') + ' (FW\'s functions timed: ' + SLB.wrapped.length + ')', { SLB, PRB, kSB, JSB: JSB.map(line), JPB: JPB.map(line) });
    // the call is timed with its spot's layout (a forced layout before the time is read): a spot in the first cell of a long table (LAY_ROWS
    // rows, auto layout, so the column follows the drawing's width), a pre-built bird mounted there: the call's time (mount) is at least most
    // (0.7) of that spot's layout alone, read on the same page by widening the spot a pixel (median of 3), long enough to tell (4 ms)
    await p.evaluate(n => { const v = document.querySelector('main .view.active, .view.active') || document.body, c = document.createElement('div'); c.id = 'fwkY';
      c.innerHTML = '<style>#fwkX>svg{display:block;width:140px;height:140px}</style><table style="border-collapse:collapse"><tr><td><span id="fwkX" style="display:inline-block"></span></td><td>a b c</td></tr>' + '<tr><td>row text here</td><td>more words in a cell</td></tr>'.repeat(n) + '</table>';
      v.prepend(c); window.__kitH = window.FW.bird({}); c.getBoundingClientRect(); }, LAY_ROWS);
    await sleep(100);
    const LY = await p.evaluate(() => { const x = document.getElementById('fwkX'); window.__fwk.fwMount(x, window.__kitH, 'kit:x'); const L = window.__fwIns, rec = L[L.length - 1], w = x.getBoundingClientRect().width, lay = [];
      for (let i = 1; i <= 3; i++) { x.style.width = (w + i) + 'px'; const t = performance.now(); x.getBoundingClientRect(); lay.push(Math.round((performance.now() - t) * 100) / 100); } return { rec, lay, w }; });
    await p.evaluate(() => { const x = document.getElementById('fwkX'); window.__fwk.fwMount(x, ''); document.getElementById('fwkY').remove(); });
    const layM = med(LY.lay);
    C.ok(/#fwkX/.test(LY.rec.spot) && LY.w > 0 && layM >= 4 && LY.rec.mount >= 0.7 * layM, 'self-test: a fwMount call is timed with its spot\'s layout: in a ' + LAY_ROWS + '-row table that follows its width, the call read ' + LY.rec.mount + ' ms, and that spot\'s layout alone ' + LY.lay.join(', ') + ' ms (median ' + layM + '; the call at least 0.7 of it)', LY);
    // the build in the app's own function (wxFred builds fred, then calls fwMount with the string): hookSource on a made-up page whose
    // kitDraw is written as wxFred is, its three fwMount calls several lines into its body after indented lines, one inside a nested arrow
    // (as wxFred's out), and a comment, a string and a regex in it naming fwMount(; a top-level comment naming fwMount and an arrow at the
    // top level calling it. kitDraw (3 calls) is the one caller found, both ways (the app's way and by its braces), the arrow's call loose;
    // run in a page, each of kitDraw's calls reads its work before it (the waits LEAD_MS, 2x and 3x, since kitDraw's start or its previous
    // fwMount) plus the call, by kitDraw; the arrow's call reads no lead
    const mk = '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="s"></div><div id="s2"></div><div id="s3"></div><div id="s4"></div>\n<script id="fwJs">window.FW = { bird: () => \'<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>\' };</script>' + MAIN_JS
      + 'const FWM = new Map();\nfunction fwOn(){ return true; }\nfunction fwGate(){}\nfunction fwMount(el, draw, key){ const h = typeof draw === \'function\' ? draw() : String(draw || \'\'); el.innerHTML = h; FWM.set(el, { k: key }); }\n'
      + '/* a comment that names fwMount(el, draw) at the top level,\n   and fwMount(el, \'\') on a line of its own */\n'
      + 'function kitDraw(el, el2, el3, ms){ const w = n => { const t = performance.now(); while (performance.now() - t < n); }, F = window.FW;\n'
      + '  w(ms);\n  const out = x => { fwMount(x, \'\'); x.dataset.out = \'1\'; };\n  if (el3) out(el3); /* fwMount(el3) in a comment is no call */\n'
      + '  w(2 * ms);\n  const h = F.bird(), s = \'fwMount(el) in a string\', r = /fwMount(el)/.test(s) ? 2 : 1;\n  fwMount(el, h, \'kit:lead\' + r);\n'
      + '  w(3 * ms);\n  fwMount(el2, F.bird(), \'kit:lead2\'); }\n'
      + 'const kitLoose = el => fwMount(el, window.FW.bird(), \'kit:loose\');\n'
      + 'window.__kitDraw = ms => kitDraw(document.getElementById(\'s\'), document.getElementById(\'s3\'), document.getElementById(\'s4\'), ms); window.__kitLoose = () => kitLoose(document.getElementById(\'s2\'));\n})();\n</script></body></html>\n';
    const mkFile = path.join(path.dirname(HOOKED), 'budgets-lead.html'); fs.writeFileSync(mkFile, hookSource(mk)); const mkCallers = hookSource.callers.slice(), mkLoose = hookSource.loose.slice(), mkK = hookSource.check;
    const mctx = await B.newContext(); let LD = null;
    try { const q = await mctx.newPage(), qe = []; q.on('pageerror', e => qe.push(e.message)); await q.goto(pathToFileURL(mkFile).href);
      LD = await q.evaluate(ms => { window.__kitDraw(ms); window.__kitLoose(); const L = window.__fwIns || []; return { draw: L.slice(-4, -1), loose: L[L.length - 1] }; }, LEAD_MS); LD.errs = qe; }
    finally { await mctx.close(); }
    const ld = LD.draw || [], lo = LD.loose || {}, ldOk = ld.length === 3 && ld.every((x, i) => x.by === 'kitDraw' && x.lead >= (i + 1) * LEAD_MS && x.lead < (i + 2) * LEAD_MS && Math.abs(x.ms - x.mount - x.lead) <= 0.05) && /#s4/.test(ld[0].spot) && /#s$/.test(ld[1].spot) && ld[1].key === 'kit:lead1' && /#s3/.test(ld[2].spot);
    C.ok(mkCallers.join() === 'kitDraw (3 calls)' && mkLoose.length === 1 && mkK.whole && !mkK.diff.length && mkK.braces.join() === 'kitDraw (3 calls)' && mkK.bloose === 1 && ldOk && lo.by === '' && lo.lead === 0 && !LD.errs.length,
      'self-test: the build in the app\'s own function: on a made-up page written as wxFred is, fwMount\'s callers found ' + (mkCallers.join(', ') || 'none') + ' (' + mkLoose.length + ' call in no named function; the comments, the string and the regex no calls), ' + (mkK.diff.length ? 'NOT the same by the braces (' + mkK.diff.join('; ') + ')' : 'the same by the braces (' + mkK.braces.join(', ') + ')') + ', and kitDraw\'s calls read ' + ld.map(x => x.ms + ' ms (its work before the call ' + x.lead + ', by ' + (x.by || 'none') + ')').join(', ') + ' (waits ' + LEAD_MS + ', ' + 2 * LEAD_MS + ', ' + 3 * LEAD_MS + ' ms before them); the top-level arrow\'s call, lead ' + lo.lead, { mkCallers, mkLoose, mkK, LD });
    // the two readings held to each other (callersDiff): a call one reading gives to another function, or that one of them lacks, is named;
    // and a page whose braces do not balance is not read whole
    const dm = { calls: [[10, 'f', ''], [20, '', '']] }, dd = [callersDiff('x', dm, { calls: [[10, 'f', ''], [20, '', '']] }), callersDiff('x', dm, { calls: [[10, '', ''], [20, '', '']] }), callersDiff('x', dm, { calls: [[10, 'f', '']] }), callersDiff('x', dm, { calls: [[10, 'f', ''], [20, '', ''], [30, 'g', '']] })];
    const mkBad = mk.replace('  w(3 * ms);\n', '  w(3 * ms); {\n'); hookSource(mkBad); const kBad = hookSource.check;
    C.ok(!dd[0].length && dd[1].length === 1 && /f read the app.s way, loose by its braces/.test(dd[1][0]) && dd[2].length === 1 && dd[3].length === 1 && !kBad.whole,
      'self-test: the callers read the app\'s way and by their braces are held to each other: the same, nothing; a call given to another function, one missing, one more: each named ("' + dd.slice(1).map(x => x.join('')).join('"; "') + '"); a made-up page with a brace left open is not read whole (depth ' + kBad.depth + ')', { dd, kBad });
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
    let Q1 = null, Q2 = null, Q3 = null, B1 = null;
    const SB = walkState(), OB = [], SB0 = walkState(), OB0 = [];
    await spin(REF.p, BUSY_SPIN);
    try { Q1 = await screenFrame('self-test busy', p, fGo ? fGo.running : 0, true, REF, S0, O1, BUDGET, nowait); Q2 = await screenFrame('self-test busy, the next screen', p, 0, true, REF, S0, O2, BUDGET, nowait);
      B1 = await busyOr('self-test busy alone', { refs: Q2 ? Q2.H.refs : [] }, REF, OB, SB, BUDGET, nowait); }
    finally { await spin(REF.p, 0); }
    // a self-test not judged falls back on the reference read alone (busyOr): next to the busy stand-in, 3 reads (the waits not slept),
    // a 'host busy' line and the self-test in the walk's state (held against no failures, a host busy gap: the line dropped, the gap
    // still fails the step); the host quiet (a limit no reading reaches), 1 read and nothing
    const B0 = await busyOr('self-test quiet alone', { refs: [] }, REF, OB0, SB0, Object.assign({}, BUDGET, { refMs: 1e9 }), nowait);
    const gB = gaps(SB, [], BUDGET)['host busy'], gB2 = gaps(SB, OB, BUDGET)['host busy'];
    C.ok(!!B1 && B1.busyHost && B1.alone.length === BUDGET.hostTries && OB.length === 1 && OB[0].rule === 'host busy' && OB[0].screen === 'self-test busy alone' && SB.selfBusy.join() === 'self-test busy alone'
      && gB.length === 1 && gB[0][0] === 'self-test busy alone' && !gB2.length && !B0.busyHost && B0.alone.length === 1 && !OB0.length && !SB0.selfBusy.length,
      'self-test: a self-test not judged, its fallback (busyOr: the reference read alone) next to the busy host stand-in reads ' + (B1 ? B1.alone.join(', ') : '?') + ' ms over ' + (B1 ? B1.alone.length : 0) + ' reads: ' + (OB.length === 1 ? 'a host busy line' : OB.length + ' lines') + ' and the self-test in the walk\'s state (' + SB.selfBusy.join(', ') + '; held against no failures, ' + (gB.length ? 'a host busy gap' : 'no gap') + '); the host quiet, ' + B0.alone.length + ' read and ' + (OB0.length || SB0.selfBusy.length ? 'a line' : 'nothing'), { B1, OB, selfBusy: SB.selfBusy, gB, gB2, B0, OB0 });
    const sr = Q1 && Q2 ? Q1.H.reads.concat(Q2.H.reads).flatMap(x => x.refs) : [];
    const busyOk = BUDGET.refMs < HOST_BUSY_LOW && sr.length === 2 * (BUDGET.hostTries + 1) && sr.every(r => r != null && r >= HOST_BUSY_LOW)
      && O1.length === 1 && O1[0].rule === 'host busy' && Q1.H.reads.length === BUDGET.hostTries && O2.length === 1 && O2[0].rule === 'host busy' && Q2.H.reads.length === 1 && S0.busy.length === 2 && !S0.refs.length && S0.hostBusy;
    Q3 = await screenFrame('self-test quiet again', p, fGo ? fGo.running : 0, true, REF, S0, O3, Object.assign({}, BUDGET, { refMs: 1e9, frameMs: 1e9 }), nowait);
    const againOk = Q3.H.judged && Q3.H.reads.length === 1 && !O3.length && !S0.hostBusy && S0.refs.length === 2;
    C.ok(!!fGo && busyOk && againOk, 'self-test: the walk\'s frame on one screen with the scene moving, next to a busy host stand-in (' + BUSY_SPIN + ' ms more work a frame on the reference, fixed): the reference reads ' + sr.join(', ') + ' ms (at least the lowest busy reading on record, ' + HOST_BUSY_LOW + ', and the committed limit ' + BUDGET.refMs + ' under it), and it is ' + (Q1 && !Q1.H.judged ? 'not judged ("host busy")' : 'judged') + ' after ' + (Q1 && Q1.H.reads.length) + ' reads; the next screen gets ' + (Q2 && Q2.H.reads.length) + '; the host quiet again, the next screen gets ' + Q3.H.reads.length + ' read, ' + (Q3.H.judged ? 'judged' : 'not judged') + ', and the host is ' + (S0.hostBusy ? 'still' : 'no longer') + ' busy', { O1, O2, O3, S0, sr, reads1: Q1 && Q1.H.reads.length, reads2: Q2 && Q2.H.reads.length });
    // the report on a walk (made up, or a self-test's own list and state), through the real checker under the limits L with the error
    // lists E: its lines, the last the checker's
    const rep = (fails, S, L = BUDGET, E = []) => { const out = [], cl = console.log, ec = process.exitCode; console.log = (...a) => out.push(a.join(' '));
      try { const C2 = checker(); report(C2, fails, S, E, x => out.push(x), L); C2.done('TITLE'); } finally { console.log = cl; process.exitCode = ec; } return out; };
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
      const S = walkState(), O = [], info = {}, k0 = RATES.get(p).length;
      const done = await traceOn(p, REF.p); let Q = null, T = null;
      try { Q = await walkFrame(name, p, A0, go || await audit(p), REF, S, O, info, L); } finally { T = await done(); await unmount(p, ids); }
      /* every CPU slowdown the kit gave the screen's page through it: the rule's rate for each window, then 1 */
      const kq = RATES.get(p).slice(k0), rOk = kq.length >= 2 && kq.length % 2 === 0 && kq.every((r, i) => r === (i % 2 ? 1 : RULE.rate));
      const measured = !!Q && S.frames.includes(name) && info.frame === Q.F.ms, tOk = !!go && !!Q && traceOk(T) && rOk, b = Q && !Q.H.judged ? await busyOr(name, Q, REF, FAILS) : null;
      S.screens = 1; S.art.push(name);
      const said = Q ? T.order + '; the screen moved ' + T.reads.map(x => x.ms + ' ms in ' + x.wall).join(', ') + ' through the reference reads, ' + T.wins.map(x => x.ms + ' in ' + x.wall).join(', ') + ' through the windows; the CPU slowdowns given to its page ' + kq.join(', ') + (rOk ? '' : ' (not the rule\'s ' + RULE.rate + ' then 1)') : 'none';
      const how = !Q ? 'not measured (walkFrame gave no reading)' : Q.H.judged ? 'judged, the reference ' + Q.refs.join(', ') + ' ms next to it (at most ' + L.refMs + '; the screen ' + Q.F.all.join(', ') + ' ms)' : 'not judged, the reference ' + Q.refs.join(', ') + ' next to it and ' + b.alone.join(', ') + ' alone: ' + (b.busyHost ? 'the host busy (a host busy line)' : 'the screen pushed it up');
      return { Q, O, S, T, tOk, b, measured, rep: rep(O, S, L), running: go ? go.running : 0, said, how };
    };
    const one = await traced('self-test one scene', ['fwkF'], false, BUDGET);
    const oneOk = one.measured && (one.Q.H.judged ? !one.O.some(f => f.rule === 'host busy') : one.b.busyHost);
    C.ok(one.tOk && oneOk, 'self-test: the walk\'s frame on one screen with one scene moving (' + one.running + ' running) under the committed limits: ' + one.how + '; its trace ' + one.said, { O: one.O, T: one.T, refs: one.Q && one.Q.refs });
    // the host busy on a screen's first read only: a heavier stand-in on the reference (SPIN4 ms more work a frame) stopped in the wait
    // before the second read, and the screen (a scene of its own) given SPIN4 ms more work a frame from then on, so only the second read's
    // windows can read over SPIN4 (the scene alone reads about 2 at 6x, 5.6-7 next to a busy host); a host limit between the two (the
    // reference on record reads at most 4.45, the busy desktop included; the stand-in more than SPIN4) and a frame budget of SPIN4 itself
    // (FRAME4: a window over it had the added work): judged on the second read, with that read's windows and readings, never the first's:
    // one 'frame' failure on that read's reading next to that read's reference, which the report gives ('FAIL 1' with its line), while
    // the first read's windows are under the budget (judging them would pass the screen). It needs a quiet host after the stand-in: with
    // the second read's reference over the committed limit (the host busy, so neither read was next to a quiet host) and the case not
    // met, the reference is read alone (busyOr): busy too, a 'host busy' line (the step fails, no verdict); quiet alone, a failure
    await probe(p, 'fwkL', 'fw-scene fw-phone', 'width:360px'); await mountJs(p, 'fwkL', 'scene', 'kit:l');
    const lGo = await until(async () => { const x = spotOf(await audit(p), 'fwkL'); return x && x.go && x.running ? x : null; }, 3000);
    const SPIN4 = 7, FRAME4 = SPIN4, L4 = Object.assign({}, BUDGET, { refMs: 6, frameMs: FRAME4 }), S4 = walkState(), O4 = []; let Q4 = null, w4 = 0;
    await spin(REF.p, SPIN4);
    try { Q4 = await screenFrame('self-test busy then quiet', p, lGo ? lGo.running : 0, true, REF, S4, O4, L4, async () => { w4++; await spin(REF.p, 0); await spin(p, SPIN4); }); }
    finally { await spin(REF.p, 0); await spin(p, 0); await unmount(p, ['fwkL']); }
    S4.screens = 1; S4.art.push('self-test busy then quiet');
    const r4 = Q4.H.reads, r4s = r4.map(x => x.refs.join('/') + ' -> ' + x.F.all.join('/')).join(', '), rep4 = rep(O4, S4, L4);
    const ok4 = r4.length === 2 && w4 === 1 && r4[0].refs.some(r => r > L4.refMs) && Q4.H.judged && Q4.F === r4[1].F && Q4.F.ms > SPIN4 && r4[0].F.all.every(x => x < FRAME4) && Q4.H.refs.join(' ') === r4[1].refs.join(' ') && Q4.H.refs.every(r => r <= L4.refMs)
      && O4.length === 1 && O4[0].rule === 'frame' && O4[0].detail.startsWith(Q4.F.ms + ' ms main thread a frame') && O4[0].detail.includes('the host reference ' + Q4.H.refs.join('/') + ' ms (quiet)') && repFails(rep4, O4)
      && S4.max.frame[0] === Q4.F.ms && S4.refs.join(' ') === Q4.H.refs.join(' ') && S4.waited.length === 1 && /\(2 reads\)$/.test(S4.waited[0]);
    const quiet4 = r4.length === 2 && r4[1].refs.every(r => r != null && r <= BUDGET.refMs), b4 = !ok4 && !quiet4 ? await busyOr('self-test busy then quiet', { refs: r4.length ? r4[r4.length - 1].refs : [] }, REF, FAILS) : null;
    C.ok(!!lGo && (ok4 || !!(b4 && b4.busyHost)),
      'self-test: the walk\'s frame on one screen, the host busy on its first read only (the reference, then the windows: ' + r4s + ' ms), a ' + FRAME4 + ' ms budget: ' + (ok4 || !b4 ? 'judged on the second read, ' + Q4.F.ms + ' ms (only that read\'s windows had the screen\'s ' + SPIN4 + ' ms more work a frame), next to that read\'s reference ' + Q4.H.refs.join('/') + ', ' + (O4.length === 1 && O4[0].rule === 'frame' ? 'a frame failure on that reading' : O4.length + ' failures') + ' ("' + last(rep4) + '" through the report; the first read\'s windows ' + (r4.length && r4[0].F.all.every(x => x < FRAME4) ? 'under' : 'not under') + ' the budget), and ' + (S4.waited.length ? 'listed as read again' : 'not listed as read again') : 'the second read\'s reference over ' + BUDGET.refMs + ' (the host busy) and ' + b4.alone.join(', ') + ' alone: ' + (b4.busyHost ? 'the host busy (a host busy line)' : 'quiet alone')), { reads: r4.map(x => ({ refs: x.refs, F: x.F.all })), F: Q4.F.ms, refs: Q4.H.refs, O4, waited: S4.waited, rep: rep4, alone: b4 && b4.alone });
    const bird = await traced('self-test one bird', ['fwkK'], true, BUDGET, 'bird');
    C.ok(bird.tOk && bird.measured && (bird.Q.H.judged ? !bird.O.length : bird.b.busyHost), 'self-test: the walk\'s frame on one screen with one bird moving (' + bird.running + ' running: a light screen, as the weather screens are with 3-7) under the committed limits: ' + bird.how + (bird.O.length ? '; failures: ' + bird.O.map(f => f.rule + ' ' + f.detail.slice(0, 80)).join(' | ') : ', no failure') + '; its trace ' + bird.said, { O: bird.O, T: bird.T, refs: bird.Q && bird.Q.refs });
    const two = await traced('self-test two scenes', ['fwkG', 'fwkH'], true, BUDGET);
    const twoOk = two.measured && (two.Q.H.judged ? two.O.length === 1 && two.O[0].rule === 'frame' && two.Q.F.ms > BUDGET.frameMs && two.Q.F.all.length === BUDGET.tries && two.Q.own != null && two.Q.own < two.Q.F.ms : two.b.busyHost);
    C.ok(two.tOk && twoOk && repFails(two.rep, two.O), 'self-test: the walk\'s frame on one screen with two scenes moving (' + two.running + ' running) under the committed limits: ' + (two.Q && two.Q.H.judged ? 'judged, the reference ' + two.Q.refs.join(', ') + ' ms next to it, a frame failure (' + two.Q.F.all.join(', ') + ' ms; ' + two.Q.own + ' paused), not "host busy"' : two.how) + '; its failures through the report: "' + last(two.rep) + '" with ' + (two.O.length === 1 ? 'its ' + two.O[0].rule + ' line' : two.O.length + ' lines') + ', no ok for the frame rule, no OK title; its trace ' + two.said, { O: two.O, T: two.T, refs: two.Q && two.Q.refs, rep: two.rep });
    // a screen whose animations are all paused (the bundle's .fw-paused on a scene): its window has no motion, so it is not measured (a
    // 'frame' failure), whatever it reads, and the walk's state records that window (held against no failures, a frame gap: dropped, the
    // failure would still show)
    /* (item 100: plan-before has art of its own, the sky box and the crew, moving: out of the way here, so only the paused scene is on the screen) */
    await p.evaluate(() => { const st = document.createElement('style'); st.id = 'kitNoArt'; st.textContent = '#planSky,#planCrew{display:none!important}'; document.head.append(st); });
    await probe(p, 'fwkJ', 'fw-scene fw-phone', 'width:360px'); await mountJs(p, 'fwkJ', 'scene', 'kit:j');
    const jGo = await until(async () => { const x = spotOf(await audit(p), 'fwkJ'); return x && x.go && x.running ? x : null; }, 3000);
    await p.evaluate(() => document.getElementById('fwkJ').classList.add('fw-paused'));
    const jRun = await p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length);
    const OJ = [], SJ = walkState(), LJ = Object.assign({}, BUDGET, { refMs: 1e9, frameMs: 1e9 }); let QJ = null;
    try { QJ = await screenFrame('self-test paused', p, jGo ? jGo.running : 0, false, REF, SJ, OJ, LJ, nowait); }
    finally { await unmount(p, ['fwkJ']); await p.evaluate(() => { const st = document.getElementById('kitNoArt'); if (st) st.remove(); }); }
    const gJ = gaps(SJ, [], LJ).frame.filter(x => x[0] === 'self-test paused');
    C.ok(!!jGo && jRun === 0 && QJ.H.judged && OJ.length === 1 && OJ[0].rule === 'frame' && /^not measured/.test(OJ[0].detail) && gJ.length === 1 && /not measured with the screen.s motion running/.test(gJ[0][1]), 'self-test: a screen whose animations are all paused (' + jRun + ' running): its window is not measured with the screen\'s motion running, a frame failure (' + (OJ[0] ? OJ[0].detail.slice(0, 120) : 'none') + '), and the walk\'s state records it (with no failures, ' + (gJ.length ? 'a frame gap' : 'no gap') + ')', { OJ, gJ });
    // a window read at another CPU slowdown than the rule's (the page's CDP session giving 5 when the kit asks for 6: what the kit sends is
    // what RATES logs, so frameCost's rate says 5) is refused: a 'frame' failure, not measured at 6x, and the walk's state records it (held
    // against no failures, a frame gap)
    await probe(p, 'fwkR', '', 'width:140px;height:140px;overflow:hidden'); await mountJs(p, 'fwkR', 'bird', 'kit:r');
    const rGo = await until(async () => { const x = spotOf(await audit(p), 'fwkR'); return x && x.go && x.running ? x : null; }, 3000);
    const cs = CDP.get(p), cs0 = cs.send, OR5 = [], SR5 = walkState(), LR5 = Object.assign({}, BUDGET, { refMs: 1e9, frameMs: 1e9 }); let QR5 = null;
    cs.send = (m, x) => cs0(m, m === 'Emulation.setCPUThrottlingRate' && x.rate === RULE.rate ? { rate: 5 } : x);
    try { QR5 = await screenFrame('self-test at 5x', p, rGo ? rGo.running : 0, false, REF, SR5, OR5, LR5, nowait); }
    finally { cs.send = cs0; await unmount(p, ['fwkR']); }
    const gR5 = gaps(SR5, [], LR5).frame.filter(x => x[0] === 'self-test at 5x');
    C.ok(!!rGo && QR5.H.judged && OR5.length === 1 && OR5[0].rule === 'frame' && /^not measured at 6x/.test(OR5[0].detail) && QR5.F.rates.length > 0 && QR5.F.rates.every(r => r === 5) && gR5.length === 1,
      'self-test: a window read at another CPU slowdown than the rule\'s (the page given 5 when the kit asks for ' + RULE.rate + ') is refused: ' + (OR5[0] ? OR5[0].rule + ' "' + OR5[0].detail.slice(0, 100) + '"' : 'no failure') + ', and the walk\'s state records it (with no failures, ' + (gR5.length ? 'a frame gap' : 'no gap') + ')', { OR5: OR5.map(line), rates: QR5 && QR5.F.rates, gR5 });
    // the walk itself (walk(), as main runs it: run() over the shared list with walk()'s own options, walker on each screen, its report to
    // a checker), on the self-test screen only, with a state, list and checker of its own, under limits every probe is over (1 node, 1
    // animation, 0.01 ms a frame) but the insert's, the committed 50 ms, which only the slow build at 6x is over. The probes are put in by
    // an init script in every page it opens, the page opened again at 6x too (PROBE_INIT: a bird built nW1 times, a fixed amount of work
    // calibrated here to about BUILD_1X ms at 1x, then mounted in a spot at the top, built once under Reduce Motion; far below, a bird put
    // in with innerHTML with a fw- loop no app rule reaches). Each rule the walk hands on (nodes, running, not mounted, off screen,
    // background, the frame or, the host busy, host busy, and insert: the slow build at 6x) has its failure and its line in walk()'s own
    // report, every FAIL line there is one of the walk's own (no gap: walk() handed its list on), 'FAIL n', no OK title, no motion failure
    // and the header "Reduce Motion off"; the walk's record of the screen (opened with Reduce Motion off and the gate open, FW ran there and
    // was measured, its calls, keyed by spot and fwMount key, read on a page opened at the rule's 6x with Reduce Motion off and the gate
    // open, its error lists as opened and at 6x kept and handed on), held against no failures, gives a gap under each of those rules. The
    // insert judged is the page opened again: the build's call as opened (1x) under the 50 ms, the one judged over it, more than 2.5x the
    // 1x reading, and the failure's reading
    const per = await p.evaluate(() => { const F = window.FW, T = []; for (let r = 0; r < 5; r++) { const t = performance.now(); for (let i = 0; i < 200; i++) F.bird({}); T.push((performance.now() - t) / 200); } return T.sort((a, b) => a - b)[2]; });
    const nW1 = Math.max(1, Math.round(BUILD_1X / per));
    const LW = Object.assign({}, BUDGET, { nodes: 1, anims: 1, frameMs: 0.01 }), nW = s.name, SW = walkState(), OW = [], EW = [], outW = [];
    const cw = console.log, ew = process.exitCode; CTX_INIT = { fn: PROBE_INIT, arg: nW1 }; console.log = (...a) => outW.push(a.join(' '));
    try { const CW = checker(); await walk(B, HOOKED, CW, OW, EW, REF, SW, x => x.name === nW, LW, nowait); CW.done('TITLE'); }
    finally { console.log = cw; process.exitCode = ew; CTX_INIT = null; for (const [n, e] of EW) ERRS.push([n + ' (walk self-test)', e]); }
    const busyW = SW.busy.includes(nW), bW = busyW ? await busyOr('self-test walk', { refs: [] }, REF, FAILS) : null;
    /* (an errors line, were the page to log any, is the errors check's: the walk's own failures are the other FAIL lines) */
    const aW = outW.filter(x => x.startsWith('  FAIL ')), fW = aW.filter(x => !x.startsWith('  FAIL no page errors or console errors')), mine = new Set(OW.map(f => '  FAIL ' + line(f)));
    const want = ['nodes', 'running', 'not mounted', 'off screen', 'background', busyW ? 'host busy' : 'frame', 'insert'];
    const lack = want.filter(r => !OW.some(f => f.rule === r && f.screen === nW) || !fW.some(x => x.startsWith('  FAIL budgets ' + nW + ' · ' + r + ' · ')));
    const g0 = gaps(SW, [], LW), blind = want.filter(r => !(g0[r] || []).some(x => x[0] === nW)); /* the walk's own record of the screen, held against no failures: a gap under each rule */
    const byW = SW.by[nW] || {}, insW = OW.find(f => f.rule === 'insert' && /#fwkW/.test(f.sel) && parseFloat(f.detail) > BUDGET.insMs && parseFloat(f.detail) === byW.ins6);
    const insOk = byW.ins1 != null && byW.ins1 < BUDGET.insMs && byW.ins6 > BUDGET.insMs && byW.ins6 > 2.5 * byW.ins1 && OW.filter(f => f.rule === 'insert').length === 1;
    const recOk = byW.reduce === 0 && byW.shut === 0 && SW.ran.includes(nW) && SW.frames.includes(nW) && SW.insFrom.length === 1 && /#fwkW \[kit:w\]/.test(SW.insFrom[0][1]) && SW.insDone.size === 1 && byW.rate6 === RULE.rate && byW.reduce6 === 0 && byW.shut6 === 0 && insOk
      && SW.screens === 1 && SW.art.includes(nW) && !!byW.errs6 && EW.some(([n, e]) => n === nW && e === byW.errs) && EW.some(([n, e]) => n === nW + ' (at ' + LW.rate + 'x)' && e === byW.errs6);
    const headW = outW.includes('-- every screen (Reduce Motion off)') && !OW.some(f => f.rule === 'motion');
    C.ok(!lack.length && !blind.length && recOk && headW && !!insW && fW.length > 0 && fW.every(x => mine.has(x)) && last(outW) === 'FAIL ' + aW.length && !outW.some(x => /^OK:/.test(x)) && (!busyW || bW.busyHost),
      'self-test: the walk itself (walk()) on ' + nW + ' with probes put in by an init script, under limits of 1 node, 1 animation, 0.01 ms a frame and the committed ' + BUDGET.insMs + ' ms an insert: ' + (lack.length ? 'no failure or no line for ' + lack.join(', ') : 'a failure and its line in its own report for each of ' + want.join(', ')) + (insW ? ' (the slow build, ' + nW1 + ' FW.bird builds: ' + insW.detail.slice(0, 120) + ')' : ' (no insert failure for the slow build at 6x)') + '; the build\'s call ' + byW.ins1 + ' ms as opened (1x), ' + byW.ins6 + ' ms judged on the page opened again (' + (insOk ? 'under the budget, then over it, more than 2.5x' : 'NOT under the budget at 1x and over it, more than 2.5x, at 6x with one insert failure') + ')' + '; its report "' + last(outW) + '" with ' + (fW.every(x => mine.has(x)) ? 'the walk\'s own failures only' : 'lines that are not the walk\'s failures: ' + fW.filter(x => !mine.has(x)).map(x => x.slice(2, 120)).join(' | '))
      + '; ' + (headW ? 'opened with Reduce Motion off (its header says so, no motion failure)' : 'its header or a motion failure says Reduce Motion was on') + '; its record of the screen ' + (recOk ? '(Reduce Motion off, the gate open, FW ran there, measured, its calls ' + (SW.insFrom[0] || [])[1] + ' read on a page opened at ' + byW.rate6 + 'x with Reduce Motion off and the gate open, ' + byW.ins6 + ' ms, its error lists kept and handed on)' : 'incomplete (Reduce Motion ' + byW.reduce + ', gate shut ' + byW.shut + ', opened again at ' + byW.rate6 + 'x, there Reduce Motion ' + byW.reduce6 + ' and gate shut ' + byW.shut6 + ')') + (blind.length ? ', with no failures, shows no gap under ' + blind.join(', ') : ', with no failures, shows a gap under each rule') + (busyW ? ' (the host busy: ' + (bW.busyHost ? 'busy alone too' : 'the screen pushed the reference up') + ')' : ''),
      { OW: OW.map(line), outW: outW.slice(-30), SW: { ran: SW.ran, frames: SW.frames, busy: SW.busy, insFrom: SW.insFrom, insDone: [...SW.insDone], by: SW.by } });
    // a screen opened with Reduce Motion on (walker on a page of its own, opened as walk() never does): a 'motion' failure and its line
    // through the report, and the walk's record of it (Reduce Motion on), held against no failures, a motion gap
    const sM = Object.assign({}, s, { name: 'self-test Reduce Motion' }), SM = walkState(), OM = [], EM = [];
    const om = await openScreen(HOOKED, s, { browser: B, motion: false });
    try { await walker(B, HOOKED, REF, SM, OM, EM, BUDGET)(sM, om); } finally { await om.close(); for (const [n, e] of EM) ERRS.push([n + ' (self-test)', e]); }
    const rM = rep(OM, SM, BUDGET, EM), gM = gaps(SM, [], BUDGET).motion;
    /* (a screen with fwMount calls of its own, plan-before since item 100, also has them refused: an 'insert' failure, the page opened again had another gate) */
    const xM = OM.filter(f => !(f.rule === 'insert' && /^not opened as the walk opens a screen/.test(f.detail)));
    C.ok(xM.length === 1 && OM.length <= 2 && xM[0].rule === 'motion' && /Reduce Motion on/.test(xM[0].detail) && OM.every(f => rM.includes('  FAIL ' + line(f))) && last(rM) === 'FAIL ' + OM.length && (SM.by[sM.name] || {}).reduce === 1 && gM.length === 1 && gM[0][0] === sM.name,
      'self-test: a screen opened with Reduce Motion on (as walk() never opens one): ' + (OM.length ? OM.map(f => f.rule + ' "' + f.detail.slice(0, 70) + '"').join(', ') : 'no failure') + ', "' + last(rM) + '" through the report; its record, with no failures, ' + (gM.length ? 'a motion gap' : 'no gap'), { OM: OM.map(line), rM, by: SM.by[sM.name], gM });
    // a screen opened with Reduce Motion off and Animate the world on (the self-test screen stores no worldMotion: on unless false) whose
    // gate stays shut (an init script takes html.fw-anim off whenever it is put on): exactly one 'motion' failure, the gate shut, and its
    // line through the report, and its record, held against no failures, a motion gap
    const sG = Object.assign({}, s, { name: 'self-test gate shut' }), SG = walkState(), OG = [], EG = []; let og = null;
    CTX_INIT = { fn: GATE_SHUT, arg: null }; try { og = await openScreen(HOOKED, s, { browser: B, motion: true }); } finally { CTX_INIT = null; }
    try { await walker(B, HOOKED, REF, SG, OG, EG, BUDGET)(sG, og); } finally { await og.close(); for (const [n, e] of EG) ERRS.push([n + ' (self-test)', e]); }
    const rG = rep(OG, SG, BUDGET, EG), gG = gaps(SG, [], BUDGET).motion, byG = SG.by[sG.name] || {};
    const xG = OG.filter(f => !(f.rule === 'insert' && /^not opened as the walk opens a screen/.test(f.detail)));
    C.ok(xG.length === 1 && OG.length <= 2 && xG[0].rule === 'motion' && /gate is shut/.test(xG[0].detail) && OG.every(f => rG.includes('  FAIL ' + line(f))) && last(rG) === 'FAIL ' + OG.length && byG.reduce === 0 && byG.shut === 1 && gG.length === 1 && gG[0][0] === sG.name && /gate shut/.test(gG[0][1]),
      'self-test: a screen opened with Reduce Motion off and Animate the world on but fred world\'s gate shut (kept off by an init script): ' + (OG.length ? OG.map(f => f.rule + ' "' + f.detail.slice(0, 90) + '"').join(', ') : 'no failure') + ', "' + last(rG) + '" through the report; its record (Reduce Motion ' + byG.reduce + ', gate shut ' + byG.shut + '), with no failures, ' + (gG.length ? 'a motion gap' : 'no gap'), { OG: OG.map(line), rG, by: byG, gG });
    // a page opened again for a screen's fwMount calls not at the rule's rate (here in a browser of its own, which the kit gives no
    // slowdown: as the walk never opens one) has its calls refused: an 'insert' failure, not opened at 6x, and the walk's record of it
    // (held against no failures, a gap for it and one for the calls never read at 6x; with the failure, none)
    const nI = 'self-test opened again', SI = walkState(), OI = [], EI = [], byI = SI.by[nI] = {}, kI = 'div#fwkW [kit:w]'; SI.ins = 1; SI.insFrom.push([nI, kI]); SI.insSeen.set(kI, nI);
    try { await insAgain(Object.assign({}, s, { name: nI }), [], kI, byI, {}, SI, OI, EI, BUDGET, s2 => openScreen(HOOKED, s2, { motion: true })); } finally { for (const [n, e] of EI) ERRS.push([n + ' (self-test)', e]); }
    const gI = gaps(SI, [], BUDGET).insert, gI2 = gaps(SI, OI, BUDGET).insert;
    C.ok(OI.length === 1 && OI[0].rule === 'insert' && /^not opened at 6x/.test(OI[0].detail) && byI.notAt6 === 1 && byI.rate6 == null && !SI.insDone.size && gI.length === 2 && !gI2.length,
      'self-test: a page opened again for a screen\'s fwMount calls not at the rule\'s rate (outside the kit\'s browser) has its calls refused: ' + (OI[0] ? OI[0].rule + ' "' + OI[0].detail.slice(0, 110) + '"' : 'no failure') + '; its record, with no failures, ' + gI.length + ' gaps (' + gI.map(x => x[1].slice(0, 60)).join(' | ') + '), with the failure ' + gI2.length, { OI: OI.map(line), byI, gI, gI2 });
    // a page opened again in the kit's browser at 6x but not as the walk opens a screen: with Reduce Motion on, and with fred world's gate
    // kept shut (an init script) where the screen as walked had it open: its calls refused, an 'insert' failure, not opened as the walk
    // opens a screen, and its record (held against no failures, a gap for it and one for the calls never read at 6x; with the failure, none)
    const reo = []; /* (one after the other: insAgain sets RATE around its open, and these set CTX_INIT) */
    for (const [w, motion, fn] of [['Reduce Motion on', false, null], ['the gate shut', true, GATE_SHUT]]) {
      const n = 'self-test opened again, ' + w, S2 = walkState(), O2 = [], E2 = [], b2 = S2.by[n] = { gate: true }; S2.ins = 1; S2.insFrom.push([n, kI]); S2.insSeen.set(kI, n);
      try { await insAgain(Object.assign({}, s, { name: n }), [], kI, b2, {}, S2, O2, E2, BUDGET, async s2 => { CTX_INIT = fn ? { fn, arg: null } : null; try { return await openScreen(HOOKED, s2, { browser: B, motion }); } finally { CTX_INIT = null; } }); }
      finally { for (const [m, e] of E2) ERRS.push([m + ' (self-test)', e]); }
      const g1 = gaps(S2, [], BUDGET).insert, g2 = gaps(S2, O2, BUDGET).insert;
      reo.push({ w, ok: O2.length === 1 && O2[0].rule === 'insert' && /^not opened as the walk opens a screen/.test(O2[0].detail) && b2.rate6 === RULE.rate && b2.motion6 === 1 && (motion ? b2.shut6 === 1 : b2.reduce6 === 1) && !S2.insDone.size && g1.length === 2 && !g2.length,
        said: (O2[0] ? '"' + O2[0].detail.slice(0, 120) + '"' : 'no failure') + ', with no failures ' + g1.length + ' gaps, with it ' + g2.length, O2: O2.map(line), b2 }); }
    C.ok(reo.length === 2 && reo.every(x => x.ok), 'self-test: a page opened again for a screen\'s fwMount calls at ' + RULE.rate + 'x but not as the walk opens a screen has its calls refused: ' + reo.map(x => x.w + ' ' + x.said).join('; '), reo);
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
    // ran where the frame rule measured nothing (listed among the screens where they ran, or only the screen with the most running), a
    // window kept without the screen moving, a screen or a self-test the host stayed busy for with no host busy line, fwMount calls never
    // read at 6x: each ends 'FAIL 1' with a line of its own under that rule ('the walk'), so no ok for it and no OK title; the same walk
    // with that failure: 'FAIL 1' with the failure's line only
    const M0 = () => ({ nodes: [0, ''], running: [0, ''], ins6: [0, ''], frame: [0, ''] });
    const G1 = (by, o) => SR(Object.assign({ screens: 1, art: ['a'], frames: [], refs: [1.2], by: { a: by }, max: M0() }, o));
    const gw = [['motion', G1({ reduce: 1 })], ['motion', G1({ shut: 1 })], ['nodes', G1({ nodes: 1300 })], ['running', G1({ running: 31 })], ['not mounted', G1({ unmounted: 1 })], ['off screen', G1({ offs: 1 })], ['background', G1({ hidden: 2 })],
      ['frame', G1({}, { ran: ['a'] })], ['frame', G1({}, { max: Object.assign(M0(), { running: [3, 'a'] }) })], ['frame', G1({ frame: 5.2 }, { ran: ['a'], frames: ['a'] })], ['frame', G1({ nomotion: 1 }, { ran: ['a'], frames: ['a'] })], ['frame', G1({ rateOff: 1 }, { ran: ['a'], frames: ['a'] })],
      ['host busy', G1({}, { ran: ['a'], frames: ['a'], busy: ['a'], refs: [] })], ['host busy', G1({}, { selfBusy: ['a'] })],
      ['insert', G1({}, { ins: 1, insFrom: [['a', 'div#x']] })], ['insert', G1({ ins6: 60 }, { ins: 1, insFrom: [['a', 'div#x']], insSeen: new Map([['div#x', 'a']]), insDone: new Set(['div#x']) })],
      ['insert', G1({ notAt6: 1 }, { ins: 1, insFrom: [['a', 'div#x']], insSeen: new Map([['div#x', 'a']]), insDone: new Set(['div#x']) })],
      ['insert', G1({ motion6: 1 }, { ins: 1, insFrom: [['a', 'div#x']], insSeen: new Map([['div#x', 'a']]), insDone: new Set(['div#x']) })],
    ].map(([rule, S]) => { const g = rep([], S), f = { screen: 'a', rule, sel: 'x', detail: 'made up' }, w = rep([f], S), gl = g.filter(x => x.startsWith('  FAIL '));
      return { rule, ok: last(g) === 'FAIL 1' && gl.length === 1 && gl[0].startsWith('  FAIL budgets a · ' + rule + ' · the walk · ') && !g.some(x => /^OK:/.test(x)) && last(w) === 'FAIL 1' && w.includes('  FAIL ' + line(f)), said: gl.length ? gl[0].slice(7).replace(/^budgets a · /, '') : last(g) }; });
    C.ok(gw.every(x => x.ok), 'self-test: the report holds the walk\'s state against its failures: on a made-up walk, each of ' + gw.map(x => (x.ok ? '' : 'NOT ') + x.rule).join(', ') + ' ends "FAIL 1" with a line of its own when no failure carries it (' + gw.map(x => x.said).join('; ') + '), and with the failure, that line only', gw);
    // the insert re-open's key (insKey): each call's spot and fwMount key, so the same spot with another look (another key: the weather
    // looks in fred's one spot) is another set of calls, opened again at 6x; the same calls in another order, an emptied spot among them,
    // are one; and the gap for calls never read at 6x names the keys
    const ky = (spot, key, n) => ({ spot, key, n }), kA = insKey([ky('div#x', 'wx:snow', 44)]), kB = insKey([ky('div#x', 'wx:rain', 50)]), kC = insKey([ky('div#y', '', 0), ky('div#x', 'wx:snow', 44)]), kD = insKey([ky('div#x', 'wx:snow', 44), ky('div#y', '', 0)]);
    const gK = gaps(G1({}, { ins: 1, insFrom: [['a', kA]] }), []).insert, rK = rep([], G1({}, { ins: 1, insFrom: [['a', kA]] }));
    C.ok(kA !== kB && kC === kD && kC !== kA && gK.length === 1 && gK[0][1].includes('div#x [wx:snow]') && rK.some(x => x.startsWith('  FAIL budgets a · insert · the walk · ') && x.includes('[wx:snow]')),
      'self-test: the insert re-open is keyed on each call\'s spot and fwMount key ("' + kA + '" and "' + kB + '" are two; "' + kC + '" one, in either order), and the gap for calls never read at 6x names them ("' + (gK[0] ? gK[0][1] : 'none') + '")', { kA, kB, kC, kD, gK });
    // the errors check takes each screen's error lists from the walk's record too (as walker keeps them): a made-up walk whose screen has
    // errors in its record, as opened and at 6x, not handed on: 'FAIL 1' with both; handed on too: 'FAIL 1' with each once; none: OK
    const eA = ['made up error'], eB = ['made up error at 6x'], eAt6 = 'a (at ' + BUDGET.rate + 'x)', eL = o => o.filter(x => x.startsWith('  FAIL no page errors or console errors'));
    const re = [rep([], SR({ by: { a: { errs: eA, errs6: eB } } })), rep([], SR({ by: { a: { errs: eA, errs6: eB } } }), BUDGET, [['a', eA], [eAt6, eB]]), rep([], SR({ by: { a: { errs: [], errs6: [] } } }))];
    const once = (o, t) => eL(o).length === 1 && eL(o)[0].split(t).length === 2;
    C.ok(last(re[0]) === 'FAIL 1' && once(re[0], 'a: made up error"') && once(re[0], eAt6 + ': made up error at 6x') && last(re[1]) === 'FAIL 1' && once(re[1], 'a: made up error"') && once(re[1], eAt6 + ': made up error at 6x') && /^OK: TITLE/.test(last(re[2])),
      'self-test: the errors check takes each screen\'s error lists from the walk\'s record too: errors in the record, not handed on, "' + last(re[0]) + '" with them (' + (eL(re[0])[0] || '').slice(40, 140) + '); handed on too, "' + last(re[1]) + '" with each once; none, "' + String(last(re[2])).slice(0, 12) + '..."', re.map(eL));
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
// the walk's work on one screen (walker(...) gives the function run() calls with each screen opened): how it was opened (Reduce Motion
// off and fred world's gate open, html.fw-anim, unless its own settings turn Animate the world off), the static and running rules as the
// screen is and moving (judge), the page hidden, the frame (walkFrame), the fwMount calls again at L.rate x from the page's start (the
// screen opened again in the kit's browser, RATE set around it so the page is slowed from its start, and held to that: the first CPU
// slowdown the kit gave the page opened again must be L.rate, else its calls are not judged, an 'insert' failure), into the state S
// (with its record of the screen in S.by) and the failure list FAILS, under the limits L. walk() runs it with its state, list and limits
// (main: ST, FAILS and BUDGET; the walk self-test its own); a self-test runs it on a page opened with Reduce Motion on. Returns the
// screen's info line numbers
function walker(B, HOOKED, REF, S, FAILS, ERRS, L = BUDGET) {
  const top = (k, v, w) => { if (v != null && v > S.max[k][0]) S.max[k] = [v, w]; };
  return async (s, o) => {
    const t = Date.now(); S.screens++;
    const by = S.by[s.name] = { errs: o.errors || [] }; /* its error list, in the record too (the report takes it from there as well) */
    ERRS.push([s.name, by.errs]);
    if (o.fail || !o.p) { S.broken.push(s.name + ': ' + o.fail); return null; }
    const p = o.p, A0 = await audit(p);
    /* how it was opened: Reduce Motion (the page's own media query) and fred world's gate (html.fw-anim), shut only by its own settings */
    const mo = await motionOf(p);
    by.reduce = mo.reduce ? 1 : 0; by.shut = !mo.reduce && !mo.off && !mo.gate ? 1 : 0; by.gate = mo.gate;
    if (by.reduce) FAILS.push({ screen: s.name, rule: 'motion', sel: 'the page', detail: 'opened with Reduce Motion on (prefers-reduced-motion: reduce): fred world\'s gate is ' + (A0.gate ? 'open' : 'shut') + ', and nothing of it runs, so the running, frame and background rules measure nothing there' });
    if (by.shut) FAILS.push({ screen: s.name, rule: 'motion', sel: 'the page', detail: 'opened with Reduce Motion off and Animate the world on, but fred world\'s gate is shut (no html.fw-anim): nothing of it runs' });
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
    if (A0.ins.length) { /* fwMount calls: the screen again, slowed from its start, once for each set of calls (their spots and fwMount keys) */
      S.ins += A0.ins.length; by.ins1 = info.ins1; /* (the slowest call as opened, at 1x: the self-test holds the 6x reading judged against it) */
      const key = insKey(A0.ins), was = S.insSeen.get(key);
      S.insFrom.push([s.name, key]);
      if (was && !INS_ALL) { if (DEBUG) console.log('  .. ' + s.name + ': its fwMount calls are those on ' + was + ' (the same drawings in the same spots, measured there at ' + L.rate + 'x)'); }
      else {
        S.insSeen.set(key, s.name);
        await insAgain(s, A0.ins, key, by, info, S, FAILS, ERRS, L, s2 => openScreen(HOOKED, s2, { browser: B, motion: true }));
      }
    }
    if (has || A0.ins.length) { S.art.push(s.name); console.log('  info ' + s.name + ': ' + info.nodes + ' FW nodes in ' + info.spots + ' spots, ' + info.running + ' FW animations running' + (info.moving != null ? ' (' + info.moving + ' moving after a new app open)' : '') + (info.hidden != null ? ', ' + info.hidden + ' with the page hidden' : '') + (info.frame != null ? ', ' + info.frame + ' ms a frame at ' + L.rate + 'x' + (info.all && info.all.length > 1 ? ' (the lowest of ' + info.all.join(', ') + ')' : '') + ' (host reference ' + info.refs.join(', ') + ' ms' + (info.judged ? '' : ': busy, not judged') + ')' : '') + (info.own != null ? ' (with the FW animations paused ' + info.own + ' ms, not judged)' : '') + (info.ins ? ', ' + info.ins + ' fwMount calls (slowest ' + info.ins1 + ' ms at 1x' + (info.ins6 != null ? ', ' + info.ins6 + ' ms at ' + L.rate + 'x' : '') + ')' : '')); }
    else if (DEBUG) console.log('  .. ' + s.name + ': no fred world (0 FW nodes, 0 FW animations, 0 fwMount calls), ' + (Date.now() - t) + ' ms');
    return info;
  };
}
// how a page was opened: Reduce Motion (its own media query), Animate the world turned off in its own settings (stored false: the app's
// fwOn has it on unless false) and fred world's gate (html.fw-anim)
const motionOf = p => p.evaluate(() => { let off = false; try { off = JSON.parse(localStorage.getItem('bluebird.settings.v2') || '{}').worldMotion === false; } catch (e) {}
  return { reduce: matchMedia('(prefers-reduced-motion: reduce)').matches, off, gate: document.documentElement.classList.contains('fw-anim') }; });
// the insert rule's re-open of a screen (walker's, once for each set of calls): the screen opened again by open (the walk's: in the kit's
// browser), RATE set around it so the page is slowed from its start, and held to that: the first CPU slowdown the kit gave the page must
// be L.rate, else an 'insert' failure (not opened at L.rate x) and its calls are not judged; and held to the walk's open (motionOf): Reduce
// Motion off and fred world's gate open (unless its own settings turn Animate the world off), the gate as the screen had it (by.gate,
// when walker recorded it), else an 'insert' failure (not opened as the walk opens a screen: a build can differ under Reduce Motion) and
// its calls are not judged; else each call is judged (insJudge). Into the screen's record (by: errs6, rate6, reduce6, shut6, motion6, ins6,
// notAt6), the state (insDone, max.ins6) and info.ins6
async function insAgain(s, A0ins, key, by, info, S, FAILS, ERRS, L, open) {
  RATE = L.rate; let y = null;
  try { y = await open(s); } catch (e) { FAILS.push({ screen: s.name, rule: 'insert', sel: 'the page', detail: 'could not open it again at ' + L.rate + 'x: ' + String(e && e.message || e).split('\n')[0] }); }
  finally { RATE = 1; }
  if (!y) return;
  try {
    by.errs6 = y.errors; ERRS.push([s.name + ' (at ' + L.rate + 'x)', y.errors]);
    const I = await y.p.evaluate(() => (window.__fwIns || []).slice()), k6 = RATES.get(y.p);
    by.rate6 = k6 && k6.length ? k6[0] : null; /* the CPU slowdown it was opened at (the kit's browser gives it before the page loads) */
    if (y.fail) console.log('  note ' + s.name + ': at ' + L.rate + 'x go() did not finish (' + y.fail + '); the calls it made are judged');
    if (by.rate6 !== L.rate) { by.notAt6 = 1; FAILS.push({ screen: s.name, rule: 'insert', sel: 'the page', detail: 'not opened at ' + L.rate + 'x: the page opened again for its fwMount calls had ' + (!k6 ? 'no CPU slowdown from the kit (not the kit\'s browser)' : k6.length ? 'CPU slowdowns ' + k6.join(', ') + ' from the kit' : 'no CPU slowdown from the kit') + ', so its ' + I.length + ' calls are not judged' }); return; }
    const m6 = await motionOf(y.p); by.reduce6 = m6.reduce ? 1 : 0; by.shut6 = !m6.reduce && !m6.off && !m6.gate ? 1 : 0;
    if (by.reduce6 || by.shut6 || (by.gate != null && m6.gate !== by.gate)) { by.motion6 = 1;
      FAILS.push({ screen: s.name, rule: 'insert', sel: 'the page', detail: 'not opened as the walk opens a screen: the page opened again for its fwMount calls had ' + (m6.reduce ? 'Reduce Motion on' : 'Reduce Motion off and fred world\'s gate ' + (m6.gate ? 'open' : 'shut (no html.fw-anim)') + (m6.off ? ', Animate the world off' : '') + (by.gate != null && m6.gate !== by.gate ? ' where the screen as walked had it ' + (by.gate ? 'open' : 'shut') : '')) + ', so its ' + I.length + ' calls are not judged (a drawing can be built differently without its motion)' }); return; }
    if (I.length) S.insDone.add(key);
    info.ins6 = I.length ? Math.max(...I.map(x => x.ms)) : null; by.ins6 = info.ins6; if (info.ins6 != null && info.ins6 > S.max.ins6[0]) S.max.ins6 = [info.ins6, s.name];
    insJudge(s.name, I, A0ins, FAILS, L);
    if (!I.length) console.log('  note ' + s.name + ': at ' + L.rate + 'x it made no fwMount call (' + A0ins.length + ' at 1x)');
  } finally { await y.close(); }
}
const ST = walkState();
// the walk: every screen of the shared list (run(), the options it is given: the page, the kit's browser, Reduce Motion off; only: the
// screens picked, null for all) through walker into the state S and the list FAILS under the limits L, waiting with wait, then the report
// (report) of what it found to the checker C. No defaults: main names its own (ST, every screen or BUDGETS' screen-name regex, BUDGET,
// sleep) and holds the walk to them after (heldWalk); the walk self-test passes a state, list, checker, screen, limits and wait of its
// own. The header names the Reduce Motion it was run with (run()'s own option). Into S: the limits judged (limits: the last line is
// written from them), the wait, the screens walked (walked: run()'s list) and skipped for their needs (skipped: run()'s lines)
async function walk(B, HOOKED, C, FAILS, ERRS, REF, S, only, L, wait) {
  S.limits = L; S.wait = wait;
  // the host at the start: the reference read (again waitMs later while it is over refMs, up to hostTries reads). Still busy: each screen
  // gets one read (no waits) until a screen finds the host quiet again
  const start = [];
  for (let k = 0; k < L.hostTries; k++) { if (k) await wait(L.waitMs); start.push((await refCost(REF.p)).ms); if (hostQuiet(start.slice(-1), L)) break; }
  S.hostBusy = !hostQuiet(start.slice(-1), L); if (!S.hostBusy) S.refs.push(start[start.length - 1]);
  console.log('-- the host reference at the start: ' + start.join(', ') + ' ms a frame at ' + L.rate + 'x (quiet at most ' + L.refMs + ')' + (S.hostBusy ? ': the host is busy' : ''));
  const RO = { page: HOOKED, browser: B, motion: true, only: only || undefined };
  console.log('-- every screen (Reduce Motion ' + (RO.motion ? 'off' : 'on') + ')');
  const cl = console.log; let R = [];
  console.log = (...a) => { const m = /^ {2}(.+?): skipped \(needs .*\)$/.exec(String(a[0])); if (m) S.skipped.push(m[1]); cl(...a); }; /* (run()'s line for a screen skipped for its needs) */
  try { R = await run(walker(B, HOOKED, REF, S, FAILS, ERRS, L), RO); } finally { console.log = cl; }
  S.walked = R.map(x => x.name);
  report(C, FAILS, S, ERRS, console.log, L);
  if (!S.art.length) console.log('  no screen has fred world art yet: 0 FW nodes, 0 FW animations and 0 fwMount calls on all ' + S.screens + ' screens, so the budgets have nothing to judge until a later item puts art on a screen');
  else console.log('  ' + S.art.length + ' of ' + S.screens + ' screens have fred world art or fwMount calls: ' + S.art.slice(0, 12).join(', ') + (S.art.length > 12 ? ' and ' + (S.art.length - 12) + ' more' : ''));
}

await main();
