// node motion.test.mjs <null.html> [screen-name regex]      (88 screens in each of two passes and 7 first loads: about 10.5 minutes)
//   REDUCE MOTION AND MOTION RULES AUDIT (QUEUE.md items 85-90: item 85 "0) One motion language ... Rules" and "5) Reduce Motion",
//   item 86, item 87 "7) Performance" and "8) Reduce Motion", the "RULES FOR ALL SEVEN" above item 87, items 88-90). The screens are the
//   shared list (lib/screens.mjs) plus one per sky of item 87 (?sky=..., the app's own QA query; WX_SKIES read from index.html) after a
//   fresh Crunch. Every page is instrumented from its first line (an init script): every animationstart and transitionrun (with its
//   duration, delay, iterations and keyframe properties), every element.animate() call, scripted motion (an inline style property or a
//   short number's digits rewritten in 4+ frames within 500 ms: a requestAnimationFrame tween, a count-up) and the first trusted tap or key.
//   (1) REDUCE MOTION (the opener default) on every screen, after go() and after each main interaction that follows it: the page scrolled
//       from its top to its end (the Journal, Volume, the results ...), an open sheet or dialog closed (Escape, else its Cancel / Close),
//       another tab tapped. At each stop:
//       - running: document.getAnimations() holds nothing that is not finished (CSS animation, CSS transition or script animation, paused
//         ones too);
//       - moved: no CSS animation or transition ran during the step at all, and nothing was moved by a script (see above), so
//         "everything appears instantly" (item 85.5), not only "nothing is still moving when we look";
//       - armed: none of the classes the script puts on for one move (MOTION_STATE, read from index.html) is left on anything, no number is
//         held for a count-up (data-mo-live) and html[data-moving] is off;
//       - hidden / collapsed / away / clipped: nothing that should be visible (text, an image, an icon, a control) is left at opacity 0
//         (its own or an ancestor's), squashed below half its size by a transform (scale(0), scaleX(0), scaleY(0), scale(.3) ...), slid
//         off the screen by a transform (translateX(100vw), translateY(105%) ...) or cut away by a clip-path (inset(0 100% 0 0)), except
//         what HIDDEN_OK names (each meant to be unseen at rest, with the reason);
//       - js: nothing changes on its own over three looks 110 ms apart (a position, a size, an opacity, a transform or a number's digits);
//       - scroll: no transform follows the scroll (compared at 150 px, 300 px and the end against the top: item 90.3 "Reduce Motion: no
//         parallax and no shrink").
//   (2) MOTION ON, BEFORE THE FIRST REAL TAP OR KEY (the app's own gate, MOV.live: a trusted pointerdown or keydown). On every screen's
//       first load (before go() taps anything) and on the first loads in LOAD_STATES (each deep link ?view=..., phone and computer, the
//       page then scrolled to its end and back, still no tap), nothing may move (CSS or script) except ON_LOAD_OK: what QUEUE items
//       85-90 allow (85.7 the Crunch sequence, 87 the sky and icon loops, 88.4-5 the Volume entrance and 88.8 its sync dot, 90.1-2 the
//       Journal entrance). Every @keyframes in index.html must be placed in KEYFRAMES (load: allowed before a tap, with its item; tap:
//       only after one) and every rule that runs it listed there, so a new animation fails until someone places it. Item 87.7: on each
//       sky, the loops play while the weather box is on screen, stand still (paused) once it is scrolled off, and play again when it
//       comes back.
//   (3) WHAT MAY ANIMATE (item 85.0: "Animate only transform and opacity, plus bar widths. Never animate layout, height or top/left";
//       the rule b above item 87: chart bar heights by transform or height; item 88.7: FLIP morphs by transform). No element.animate()
//       (nor new Animation / new KeyframeEffect): in the source, nor called at run time anywhere; no transition, @keyframes or script
//       tween of a layout property (width, height, top, left, right, bottom, inset, margin, padding, min/max sizes, flex, grid, gap,
//       font-size, line-height, letter-spacing, border widths, or all): in the source (CSS and the script's transition strings) and at run
//       time in both passes, except LAYOUT_OK. (Paint properties, colour, background, shadow, are not judged here.)
//   The motion-on pass walks every screen the same way as (1) (go(), scroll, close, tab) with Reduce Motion off, for (2) and (3).
//   Self-tests: probes that must be caught on the first screen of each pass (a looping animation, a 0-opacity text, a scaleY(0) text, a
//   leftover motion class, a counting number, a parallax under Reduce Motion, a scripted height tween, element.animate(), a width
//   transition, motion before the first tap), so the audit cannot pass by measuring nothing; and the motion pass must see the motions
//   items 85-90 promise somewhere (EXPECT: the Crunch sweep, a sheet rising, the segment pill, the results stagger, the hour bars, a sky
//   loop, the Volume entrance, a tile growing, the Journal entrance, a list sliding in).
// Each failure prints its pass and rule, the element (nearest id, parent, itself), the animation, transition or property, and the
// screens it was seen on. Failures main really has are in KNOWN_ON_MAIN with the reason: they print as "known" and do not fail, so a later
// item is judged only on new failures. MO_DEBUG=1 prints every event; MO_PASS=reduce|motion|load (comma list) runs some parts (the static
// checks always run); MO_INSPECT_ALL=1 also runs the (1) checks in the motion pass (to see what motion leaves mid-way; expect failures).
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { run, openScreen, settle, crunch, toY } from '../lib/screens.mjs';
import { checker } from '../lib/open.mjs';

const PAGE = process.argv[2], ONLY = process.argv[3] ? new RegExp(process.argv[3]) : null, DEBUG = !!process.env.MO_DEBUG;
const PASSES = (process.env.MO_PASS || 'reduce,motion,load').split(',');
if (!PAGE) { console.log('usage: node motion.test.mjs <null.html> [screen regex]'); process.exit(2); }
const SRC = readFileSync(PAGE, 'utf8');
const C = checker(), T0 = Date.now();

/* ================================================================ what the items allow, read from index.html */
// Every @keyframes in index.html. load: allowed before the first tap (ON_LOAD_OK says where); tap: plays only after a tap (a tap or a
// key starts it, or what it shows needs one). sel: the rules in index.html that run it.
const KEYFRAMES = {
  'cr-sweep':    { use: 'load', item: '85.7a', sel: '#calcBtn.cr-busy .cr-sw', why: 'the Crunch sequence: the stripes sweep while a fresh Crunch runs' },
  'rwx-spin':    { use: 'load', item: '87.2-3', sel: '.rwx-rays, .rwx-ic .rwx-ispin', why: 'Sun: the rays turn (40 s); the icon’s rays and the freezing snowflake turn' },
  'rwx-glow':    { use: 'load', item: '87.2', sel: '.rwx-glow, .rwx-hglow', why: 'Sun and Heat: the warm glow breathes' },
  'rwx-throb':   { use: 'load', item: '87.2', sel: '.rwx-sun.rwx-hot', why: 'Heat: the sun throbs every 2.4 s' },
  'rwx-throbg':  { use: 'load', item: '87.2', sel: '.rwx-sglow.rwx-hot', why: 'Heat: the sun’s glow throbs with it' },
  'rwx-rise':    { use: 'load', item: '87.2', sel: '.rwx-hw', why: 'Heat: the wavy heat lines rise and fade' },
  'rwx-frost':   { use: 'load', item: '87.2', sel: '.rwx-frost path', why: 'Freezing: the frost crystals draw in (once)' },
  'rwx-twinkle': { use: 'load', item: '87.2', sel: '.rwx-spark', why: 'Freezing: the sparkles twinkle' },
  'rwx-zip':     { use: 'load', item: '87.2', sel: '.rwx-stk', why: 'Wind: the gust streaks zip across' },
  'rwx-tumble':  { use: 'load', item: '87.2', sel: '.rwx-leafw', why: 'Wind: the leaves tumble across' },
  'rwx-turn':    { use: 'load', item: '87.2', sel: '.rwx-leaf', why: 'Wind: each leaf turns as it tumbles' },
  'rwx-drift':   { use: 'load', item: '87.2', sel: '.rwx-clw', why: 'Low clouds and Rain: the clouds drift' },
  'rwx-fogx':    { use: 'load', item: '87.2', sel: '.rwx-fb', why: 'Fog: the bands drift' },
  'rwx-fall':    { use: 'load', item: '87.2', sel: '.rwx-rd', why: 'Rain: the drops fall' },
  'rwx-snow':    { use: 'load', item: '87.2', sel: '.rwx-fl', why: 'Snow: the flakes fall' },
  'rwx-sway':    { use: 'load', item: '87.2', sel: '.rwx-fl b', why: 'Snow: the flakes sway' },
  'rwx-gust':    { use: 'load', item: '87.2', sel: '.rwx-comp.rwx-gust .rwx-wob', why: 'gusts of 20 mph or more: the compass needle wobbles' },
  'rwx-ipulse':  { use: 'load', item: '87.3', sel: '.rwx-ic .rwx-ipulse', why: 'the icon: the sun disc pulses' },
  'rwx-iwave':   { use: 'load', item: '87.3', sel: '.rwx-ic .rwx-iwave', why: 'the icon: the heat lines rise' },
  'rwx-iwipe':   { use: 'load', item: '87.3', sel: '.rwx-ic .rwx-iwipe', why: 'the icon: the wind lines draw in' },
  'rwx-idash':   { use: 'load', item: '87.3', sel: '.rwx-ic .rwx-idash', why: 'the icon: the wind lines fade' },
  'rwx-idrift':  { use: 'load', item: '87.3', sel: '.rwx-ic .rwx-idrift', why: 'the icon: the clouds drift' },
  'rwx-idrop':   { use: 'load', item: '87.3', sel: '.rwx-ic .rwx-idrop', why: 'the icon: the drops fall' },
  'rwx-iflake':  { use: 'load', item: '87.3', sel: '.rwx-ic .rwx-iflake', why: 'the icon: the dots fall' },
  'vol-breathe': { use: 'load', item: '88.8', sel: '.vol-sdot.busy', why: 'Volume: the Strava dot breathes while a sync runs (a sync may start with the app)' },
  'jne-pop':     { use: 'tap', item: '90.4', sel: '#jNew.jne-go .jne-t', why: '+ New entry: the tiles pop (a tap on +)' },
  'jl-rise':     { use: 'tap', item: '90.5', sel: '#journalList.jl-rise li.jl-r', why: 'a Journal list opened from the home: its rows rise (a tap)' },
  'jhp-fade':    { use: 'tap', item: '91.6', sel: '#view-journal .jh-ph.jhp-in', why: 'Journal, Photo: a header photo that arrives while the Journal is on screen (a second device download) fades in, only after a tap (before one it is just there)' },
  'loc-pulse':   { use: 'tap', item: 'pre-85', sel: '.loc-me[aria-busy="true"] svg', why: 'Where: the locate button pulses while it finds you (a tap)' },
  'ri-spin':     { use: 'tap', item: 'pre-85', sel: '.ri-busy::before', why: 'Races: the import spinner (a file picked)' },
  /* rf-rise and winRise never play today: [class*="rf-"],.win,.wins li{animation:none!important} (v3-11) turns them off; listed so a
     change that brings them back is judged as tap-only */
  'rf-rise':     { use: 'tap', item: 'pre-85', sel: '.rf-medal, .rf-cele-h, .rf-cele-sub, .rf-cele .fstats, .rf-cele-wins, .rf-cele-act', why: 'Log a race: the finish celebration (Save tapped)' },
  'winRise':     { use: 'tap', item: 'pre-85', sel: '.wins.rise .win', why: 'Races: the wins rise as a saved race shows them (Save tapped)' },
  'gf-draw':     { use: 'tap', item: 'pre-85', sel: '.gf-play .gf-ring path, .gf-play .gf-arrow path', why: 'Races: the PR graffiti ring and arrow draw (a saved race)' },
  'gf-pop':      { use: 'tap', item: 'pre-85', sel: '.gf-play .gf-prw', why: 'Races: the PR graffiti word pops (a saved race)' },
};
// ON_LOAD_OK: what may move before the first tap or key. kind: animation | transition | script (a number counted by the script: name
// text; an inline style property tweened: its name); name: the @keyframes, the transitioned property or what the script changes
// (RegExp); sel: the element (or the one it sits in) must match it (closest). Item 85: "No motion on scroll or on plain page load, except
// the Crunch sequence in 7)"; the rule a) above item 87: "Volume and Journal now animate the first time they are seen in an app open
// (items 88 and 90)"; item 87 brings the skies' loops; item 88.8 the sync dot. Item 90.3's scroll effects (parallax, the title's shrink,
// the compact bar) are inline styles that follow the scroll and never transition, so they need no entry.
const ON_LOAD_OK = [
  { item: '85.7', kind: 'animation', name: /^cr-sweep$/, sel: '#calcBtn', why: 'the Crunch sequence: the stripes sweep' },
  { item: '85.7', kind: 'transition', name: /^(opacity|transform)$/, sel: ':is(#results,#runResults)>.r-st, #calcBtn .cr-sw, #calcBtn .cr-l, #rWhy .wy-stk', why: 'the Crunch sequence: the stripes fade, the results stagger in, the hour bars grow' },
  { item: '85.7d, 86', kind: 'script', name: /^text$/, sel: '#totGrid [data-mo-live]', why: 'the Crunch sequence: Ride totals count up from 0 as they are seen' },
  { item: '87', kind: 'animation', name: /^rwx-/, sel: '.r-wx .rwx-scene, .r-wx .rwx-fog, .r-wx .rwx-ic, .r-wx .rwx-comp', why: 'the weather box’s living sky, its icon and the needle’s wobble loop' },
  { item: '88.4-5', kind: 'transition', name: /^(opacity|transform|translate|clip-path)$/, sel: '#volRoot .ve-go, #volRoot>.ve-go', why: 'Volume: each box’s entrance, the first time it is seen in an app open' },
  { item: '88.6', kind: 'script', name: /^text$/, sel: '#volRoot [data-mo-live]', why: 'Volume: the numbers count up as their box enters (part of the entrance)' },
  { item: '88.8', kind: 'animation', name: /^vol-breathe$/, sel: '.vol-sdot.busy', why: 'Volume: the Strava dot breathes while a sync runs' },
  { item: '90.1-2', kind: 'transition', name: /^(opacity|transform|rotate)$/, sel: '#jHero.jm-go, #jGroups.jm-go', why: 'the Journal’s entrance: the stripes sweep, the title, the + and the badge pop, the rows rise' },
];
// the classes the script puts on for one move and takes off after it (and the attributes): none may be left on under Reduce Motion
// (item 85.5: "Every JS animation checks the same setting and jumps straight to the end state"; item 86.7: "nothing is armed")
const MOTION_STATE = {
  'r-st': '85.4 / 86: a result box waiting to stagger in', 'r-go': '85.4: a result box rising', 'wy-from': '85.7c: the hour bars flat',
  'wy-run': '85.7c: the hour bars growing', 'rl-run': '85.6: a number rolling', 'rl-ov': '85.6: a stepper’s rolling copy', 'seg-go': '85.2: the segment pill sliding',
  'mo-sw': '85: a switch knob sliding', 'mo-w': '85.6: the carbs bar following its number', 'sh-on': '85.3: a sheet moving', 'sh-p': '85.3: a sheet\u2019s panel moving', 'sh-off': '85.3: a sheet below the screen',
  'sh-run': '85.3: a sheet rising or falling', 'sh-keep': '85.3: a closed sheet kept for its fall', 'cr-busy': '85.7a: the Crunch stripes', 'cr-end': '85.7a: the Crunch stripes fading',
  'wx-arm': '87.5: the weather box waiting', 'wx-go': '87.5: the weather entrance', 'rwx-pre': '87.6: a sky waiting to fade in', 'rwx-out': '87.6: a sky fading out',
  'rwx-x': '87.6: a sky cross-fading', 'rwx-mv': '87.6: a bar or the drop easing', 'rwx-mvs': '87.6: a marker springing', 'rwx-mvn': '87.6: the needle turning',
  've-arm': '88.4: a Volume box waiting', 've-go': '88.4-5: a Volume box’s entrance', 'vf-run': '88.7: a bar morphing', 'vf-out': '88.7: a bar leaving',
  'vf-bg': '88.7: a grid cell’s shade fading', 'vd-from': '88.8: the sync check popping', 'vd-run': '88.8: the sync check popping',
  'vt-from': '89.2: a tile growing', 'vt-run': '89.2: a tile growing', 'vt-back': '89.2: a tile shrinking', 'vt-backrun': '89.2: a tile shrinking', 'vt-mv': '89.2: a box sliding',
  'jm-arm': '90.1-2: the Journal waiting', 'jm-go': '90.1-2: the Journal entrance', 'jne-go': '90.4: the New entry tiles popping',
  'jl-arm': '90.5: a list waiting to slide', 'jl-go': '90.5: a list sliding', 'jl-rise': '90.5: a list’s rows rising',
};
const MOTION_ATTR = { 'data-mo-live': '86 / 88.6: a number counting up (held at 0 meanwhile)' };
// HIDDEN_OK: things meant to be unseen at rest (matched on the hidden, squashed or moved element, or the one it sits in: closest).
// Each needs a reason: they are not left behind by a motion, they are how the page is made.
const HIDDEN_OK = [
  { sel: '.ri-sw input, .gr-ov .gr-ovin, .rf-modal select.rf-jump', why: 'a native control laid clear over its drawn face (a switch, a picker, the Jump to select): tapped, never seen' },
  { sel: '#view-journal .jh-cbar:not(.on)', why: 'item 90.3: the Journal’s compact bar is not shown until 130 px of scroll (Reduce Motion: it just appears there)' },
  { sel: '.rwx-hw, .rwx-spark', why: 'item 87.8: under Reduce Motion the heat lines and the frost sparkles are not in the still frame (they only exist moving)' },
  { sel: '.toast', why: 'a toast between its messages' },
];
// LAYOUT_OK: a layout property that may animate (item 85.0: "plus bar widths"; the rule b above item 87: chart bar heights)
const LAYOUT_OK = [
  { prop: 'width', sel: '#planSheet .adj-cfill', item: '85.6', why: 'Adjust this ride: the carbs meter’s bar follows its number ("bars (the carbs meter) follow")' },
];
// EXPECT: motions items 85-90 promise, which the motion pass must see somewhere (else the instrument or the walk is broken)
const EXPECT = [
  { what: 'the Crunch stripes sweep (85.7a)', kind: 'animation', name: /^cr-sweep$/, sel: '#calcBtn' },
  { what: 'a sheet rises (85.3)', kind: 'transition', name: /^transform$/, sel: '.sh-p' },
  { what: 'a segment pill slides (85.2)', kind: 'transition', name: /^transform$/, sel: '.seg-fly.seg-go' },
  { what: 'the results stagger in as they are seen (85.4, 86)', kind: 'transition', name: /^(opacity|transform)$/, sel: ':is(#results,#runResults)>.r-st' },
  { what: 'the hour bars grow (85.7c)', kind: 'transition', name: /^transform$/, sel: '#rWhy .wy-stk' },
  { what: 'a sky loops (87)', kind: 'animation', name: /^rwx-/, sel: '.r-wx' },
  { what: 'the Volume boxes enter (88.4-5)', kind: 'transition', name: /./, sel: '#volRoot .ve-go' },
  { what: 'a Volume tile grows in place (89.2)', kind: 'transition', name: /./, sel: '#volRoot .vt-run, #volRoot .vt-mv' },
  { what: 'the Journal enters (90.1-2)', kind: 'transition', name: /./, sel: '#jHero.jm-go, #jGroups.jm-go' },
  { what: 'a Journal list slides in (90.5)', kind: 'transition', name: /^transform$/, sel: '#view-journal.jl-go #jList' },
];
// KNOWN_ON_MAIN: failures main (items 85-90, cache v115) really has, checked by hand on main 2026-10-29. Each: rule, sel (a RegExp on the
// element), name (a RegExp on the animation or property), screen (a RegExp; omitted: any), why. A later item is judged on new failures
// only; when one is fixed, take its entry out (the run notes entries it did not see).
const KNOWN_ON_MAIN = [
  /* none: on main every rule holds. (The one candidate, the race form's step dots .rf-dot{transition:width .25s ease,...}, is pre-85 CSS
     that never runs: the app-wide *{transition:none!important} beats it, and stepping the form shows no transition; see ALL_OFF.) */
];

/* ================================================================ (static) the source */
const LAYOUT = /^(all|width|height|top|left|right|bottom|inset(-.+)?|margin(-.+)?|padding(-.+)?|(min|max)-(width|height|inline-size|block-size)|inline-size|block-size|flex(-basis|-grow|-shrink)?|grid(-.+)?|font-size|line-height|letter-spacing|word-spacing|border(-(top|right|bottom|left))?-width|border-width|gap|row-gap|column-gap)$/;
const styles = [...SRC.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const scripts = [...SRC.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
// a small CSS reader: rules (selector, body, the at-rules around it) and @keyframes (name, body)
function cssRules(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [], kfs = [];
  const walk = (s, at) => {
    let i = 0;
    while (i < s.length) {
      const o = s.indexOf('{', i); if (o < 0) break;
      const head = s.slice(i, o).trim(); let d = 1, j = o + 1;
      while (j < s.length && d) { if (s[j] === '{') d++; else if (s[j] === '}') d--; j++; }
      const body = s.slice(o + 1, j - 1); i = j;
      const h = head.replace(/^[;}\s]+/, '');
      const k = /^@(-webkit-)?keyframes\s+([\w-]+)/.exec(h);
      if (k) kfs.push({ name: k[2], body });
      else if (/^@(media|supports|layer|container|document)\b/.test(h)) walk(body, at.concat(h));
      else if (h && !h.startsWith('@')) rules.push({ sel: h, body, at });
    }
  };
  walk(css, []);
  return { rules, kfs };
}
// the property names a transition value lists (no name: all)
const TIMING = /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end|initial|inherit|unset|revert|normal|allow-discrete|!important|important)$/;
// split at top-level commas (sep ',') or spaces (sep ' '), never inside parentheses
function topSplit(v, sep) { const out = []; let d = 0, cur = ''; for (const ch of v) { if (ch === '(') d++; if (ch === ')') d--; if (!d && (sep === ' ' ? /\s/.test(ch) : ch === sep)) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map(s => s.trim()).filter(Boolean); }
function transProps(v) {
  v = v.replace(/!important/g, '').trim(); if (!v || /^none$/i.test(v)) return [];
  return topSplit(v, ',').map(it => topSplit(it, ' ').find(t => !t.includes('(') && !/^-?[\d.]+m?s$/.test(t) && !TIMING.test(t)) || 'all').filter(x => x !== 'none');
}
// the static checks on one source (styles, scripts); returns the findings
function staticAudit(styles, scripts, quiet) {
  const { rules: RULES, kfs: KFS } = cssRules(styles), out = [];
  const sfail = (rule, where, name, detail) => out.push({ rule, screen: 'source', sel: where, name, detail: detail || '' });
  // (2) every @keyframes is placed; every rule that runs one is listed with it
  const kfNames = new Set(KFS.map(k => k.name));
  for (const n of kfNames) if (!KEYFRAMES[n]) sfail('unplaced', '@keyframes ' + n, n, 'a new @keyframes: place it in KEYFRAMES (allowed before a tap with its QUEUE item, or tap-only) and ON_LOAD_OK if it may play before a tap');
  if (!quiet) for (const n of Object.keys(KEYFRAMES)) if (!kfNames.has(n)) console.log('  note: KEYFRAMES lists ' + n + ', which index.html no longer has (take it out)');
  const animUses = new Map();
  for (const r of RULES) {
    const m = /(?:^|;)\s*animation(?:-name)?\s*:\s*([^;]+)/g; let x;
    while ((x = m.exec(r.body))) for (const part of x[1].split(',')) for (const t of part.trim().split(/\s+/)) if (kfNames.has(t)) { if (!animUses.has(t)) animUses.set(t, []); animUses.get(t).push(r.sel); }
  }
  for (const [n, sels] of animUses) if (KEYFRAMES[n]) {
    const listed = KEYFRAMES[n].sel.split(/\s*,\s*/).map(s => s.replace(/\s+/g, ' ').trim());
    for (const s of sels) for (const one of s.split(/\s*,\s*/)) if (!listed.includes(one.replace(/\s+/g, ' ').trim())) sfail('unplaced', one, n, 'a rule runs @keyframes ' + n + ' from a selector KEYFRAMES does not list for it (' + KEYFRAMES[n].sel + '): check what it is and list it');
  }
  // (3) no layout property in a @keyframes, a CSS transition or a script's transition string
  for (const k of KFS) {
    const props = new Set([...k.body.matchAll(/([a-z-]+)\s*:/g)].map(m => m[1]));
    for (const p of props) if (LAYOUT.test(p)) sfail('layout', '@keyframes ' + k.name, p, 'the keyframes animate ' + p);
  }
  // index.html turns every transition off app-wide (*,*::before,*::after{transition:none!important}: "each motion opts back in by name
  // with !important"): a transition declared without !important never runs, so then only !important ones are judged
  const ALL_OFF = RULES.some(r => !r.at.length && r.sel.split(',').map(s => s.trim()).includes('*') && /(^|;)\s*transition\s*:\s*none\s*!important/.test(r.body));
  const layoutOkSel = (sel, prop) => LAYOUT_OK.some(o => o.prop === prop && sel.split(/\s*,\s*/).every(s => o.sel.split(/\s*,\s*/).some(x => s.replace(/\s+/g, ' ').startsWith(x))));
  for (const r of RULES) {
    const m = /(?:^|;)\s*transition(-property)?\s*:\s*([^;]+)/g; let x;
    while ((x = m.exec(r.body))) {
      if (ALL_OFF && !/!important/.test(x[2])) continue;
      const props = x[1] ? x[2].replace(/!important/g, '').split(',').map(s => s.trim()) : transProps(x[2]);
      for (const p of props) if (LAYOUT.test(p) && !layoutOkSel(r.sel, p)) sfail('layout', r.sel, p, 'transition: ' + x[2].trim().slice(0, 120));
    }
  }
  for (const m of scripts.matchAll(/(?:setProperty\(\s*'transition'\s*,\s*'([^']*)'|\.style\.transition\s*=\s*'([^']*)')/g)) {
    for (const p of transProps(m[1] || m[2] || '')) if (LAYOUT.test(p)) sfail('layout', 'script', p, 'a transition string in the script: ' + (m[1] || m[2]).slice(0, 120));
  }
  // (3) no element.animate(), new Animation(), new KeyframeEffect() in the script (a call has arguments: the comments name "el.animate()")
  for (const m of scripts.matchAll(/\.animate\(\s*[^)\s]|new\s+(Animation|KeyframeEffect)\s*\(/g)) sfail('animate', 'script', m[1] ? 'new ' + m[1] : 'element.animate', scripts.slice(Math.max(0, m.index - 60), m.index + 40).replace(/\s+/g, ' '));
  return { out, kfs: KFS.length, rules: RULES.length, allOff: ALL_OFF };
}
const SA = staticAudit(styles, scripts), STATIC = SA.out;
// the static checks catch what they should: a probe source with one of each
{ const P = staticAudit('*,*::before{transition:none!important} @keyframes __kNew{to{left:4px}} .a{animation:__kNew 1s} .b{transition:height .3s ease!important} .c{transition:.2s!important} .d{transition:width .2s}',
    'el.animate([{opacity:0}],{duration:9}); const a=new Animation(); x.style.setProperty(\'transition\', \'top .2s\', \'important\');', true).out;
  const has = (rule, sel, name) => P.some(f => f.rule === rule && f.sel === sel && (!name || f.name === name));
  C.ok(has('unplaced', '@keyframes __kNew') && has('layout', '@keyframes __kNew', 'left') && has('layout', '.b', 'height') && has('layout', '.c', 'all') && !has('layout', '.d')
    && has('layout', 'script', 'top') && P.filter(f => f.rule === 'animate').length === 2, 'static self-test: a probe source (a new @keyframes moving left, height and all transitions, element.animate, new Animation, a script top transition) is caught; a transition the app-wide none beats is not', P.map(f => f.rule + ' ' + f.sel + ' ' + f.name));
  C.ok(SA.kfs >= 30 && SA.rules > 2000 && SA.allOff, 'static: index.html read (' + SA.rules + ' CSS rules, ' + SA.kfs + ' @keyframes, app-wide transition:none!important ' + (SA.allOff ? 'found' : 'missing') + ')'); }

/* ================================================================ (in the page) instrument every page at its start */
// the init script: records every animationstart / transitionrun (with its duration, delay, iterations and properties), every
// element.animate() call, the first trusted tap or key; and holds the checks the test runs in the page
function INSTR(cfg) {
  if (window.__mo) return;
  const M = window.__mo = { ev: [], calls: [], live: 0, step: 'load', cfg };
  const now = () => Math.round(performance.now());
  const part = x => { const t = x.localName || '?'; if (x.id) return t + '#' + x.id; const cl = [...(x.classList || [])].slice(0, 3); return t + (cl.length ? '.' + cl.join('.') : ''); };
  M.desc = e => { if (!e || !e.localName) return String(e); if (e.id) return part(e); const p = e.parentElement, a = p && p.closest('[id]'); return (a ? part(a) + ' ' : '') + (p && p !== a ? part(p) + ' > ' : '') + part(e); };
  const kf = a => { try { const s = new Set(); for (const f of a.effect.getKeyframes()) for (const k of Object.keys(f)) if (!['offset', 'computedOffset', 'easing', 'composite'].includes(k)) s.add(k.replace(/[A-Z]/g, c => '-' + c.toLowerCase())); return [...s]; } catch (e) { return []; } };
  const okIdx = (L, t, k, name) => { for (let i = 0; i < L.length; i++) { const o = L[i]; if (o.kind && o.kind !== k) continue; if (o.name && !new RegExp(o.name).test(name)) continue; if (o.prop && o.prop !== name) continue; try { if (t && t.closest && t.closest(o.sel)) return i; } catch (e) {} } return -1; };
  const okAll = (L, t, k, name) => L.map((o, i) => okIdx([o], t, k, name) === 0 ? i : -1).filter(i => i >= 0);
  const rec = (k, name, t, pseudo) => {
    if (M.ev.length > 30000) return;
    let a = null; try { a = (t.getAnimations ? t.getAnimations({ subtree: true }) : []).find(x => x.effect && x.effect.target === t && (x.effect.pseudoElement || '') === (pseudo || '') && (k === 'animation' ? x.animationName === name : x.transitionProperty === name)); } catch (e) {}
    const tm = a ? a.effect.getComputedTiming() : {};
    const props = k === 'animation' ? (a ? kf(a) : []) : [name];
    M.ev.push({ k, name, sel: M.desc(t) + (pseudo || ''), t: now(), pre: !M.live, step: M.step, dur: tm.duration == null ? null : Math.round(tm.duration), delay: a ? Math.round(a.effect.getTiming().delay || 0) : null,
      iter: tm.iterations === Infinity ? 'loops' : tm.iterations, props, rm: matchMedia('(prefers-reduced-motion: reduce)').matches,
      load: okIdx(cfg.onLoad, t, k, name), exp: okAll(cfg.expect, t, k, name), lay: props.filter(p => cfg.layoutRe && new RegExp(cfg.layoutRe).test(p)).map(p => [p, okIdx(cfg.layoutOk, t, null, p)]) });
  };
  // scripted motion (no CSS animation to see): an element\u2019s inline style property, or a short number\u2019s digits, rewritten in 4 or
  // more different frames within 500 ms (a requestAnimationFrame loop, a count-up, a JS tween). One-off sets (a FLIP start and its
  // release) never reach 4.
  M.mut = new Map();
  const note = (e, k, v) => { if (M.mut.size > 5000) return; let x = M.mut.get(e); if (!x) M.mut.set(e, x = { pre: !M.live, step: M.step, p: new Map(), last: new Map(), load: new Map() });
    if (v !== undefined) { if (x.last.get(k) === v) return; x.last.set(k, v); } /* (the same text written again is no change) */
    if (!x.load.has(k) || x.load.get(k) < 0) x.load.set(k, okIdx(cfg.onLoad, e, 'script', k)); /* (judged as it moves: a box\u2019s entrance class is gone by the time we look) */
    let T = x.p.get(k); if (!T) x.p.set(k, T = []); const t = now(); if (T[T.length - 1] !== t) T.push(t); if (T.length > 16) T.shift(); };
  const pst = s => { const m = new Map(); for (const d of (s || '').split(';')) { const i = d.indexOf(':'); if (i > 0) m.set(d.slice(0, i).trim().toLowerCase(), d.slice(i + 1).trim()); } return m; };
  new MutationObserver(L => { for (const r of L) {
    if (r.type === 'attributes') { const a = pst(r.oldValue), b = pst(r.target.getAttribute('style')); for (const k of new Set([...a.keys(), ...b.keys()])) if (a.get(k) !== b.get(k)) note(r.target, k); continue; }
    const e = r.type === 'characterData' ? r.target.parentElement : r.target; if (!e || e.childElementCount) continue; const s = e.textContent; if (s.length <= 24 && /\d/.test(s)) note(e, 'text', s);
  } }).observe(document, { attributes: true, attributeFilter: ['style'], attributeOldValue: true, childList: true, characterData: true, subtree: true });
  M.scripted = () => { const out = [];
    for (const [e, x] of M.mut) for (const [k, T] of x.p) for (let i = 0; i + 3 < T.length; i++) if (T[i + 3] - T[i] <= 500) { out.push({ sel: M.desc(e), prop: k, n: T.length, pre: x.pre, step: x.step, load: x.load.get(k), lok: okIdx(cfg.layoutOk, e, null, k) }); break; }
    M.mut.clear(); return out; };
  addEventListener('animationstart', e => rec('animation', e.animationName, e.target, e.pseudoElement), true);
  addEventListener('transitionrun', e => rec('transition', e.propertyName, e.target, e.pseudoElement), true);
  ['pointerdown', 'keydown'].forEach(ty => addEventListener(ty, e => { if (e.isTrusted && !M.live) M.live = now(); }, true));
  const A0 = Element.prototype.animate;
  if (A0) Element.prototype.animate = function (k, o) {
    let ks = []; try { const L = Array.isArray(k) ? k : k ? [k] : []; ks = [...new Set(L.flatMap(f => Object.keys(f || {})))]; } catch (e) {}
    M.calls.push({ sel: M.desc(this), props: ks, t: now(), pre: !M.live, step: M.step, stack: String(new Error().stack || '').split('\n').slice(2, 4).map(s => s.trim()).join(' | ').slice(0, 300) });
    return A0.apply(this, arguments);
  };
  const content = e => { if (/^(img|svg|canvas|video|input|select|textarea|button)$/.test(e.localName)) return true; for (const n of e.childNodes) if (n.nodeType === 3 && n.data.trim()) return true; return false; };
  const hasSize = e => e instanceof HTMLElement ? e.offsetWidth > 0 && e.offsetHeight > 0 : e.getClientRects().length > 0;
  const mat = s => { let m = null; try { m = new DOMMatrixReadOnly(s.transform === 'none' ? undefined : s.transform); } catch (e) { m = new DOMMatrixReadOnly(); }
    let sx = Math.hypot(m.a, m.b), sy = Math.hypot(m.c, m.d), tx = m.e, ty = m.f;
    if (s.scale && s.scale !== 'none') { const v = s.scale.split(/\s+/).map(parseFloat); sx *= Math.abs(v[0]); sy *= Math.abs(v.length > 1 ? v[1] : v[0]); }
    if (s.translate && s.translate !== 'none') { const v = s.translate.split(/\s+/).map(parseFloat); tx += v[0] || 0; ty += v[1] || 0; }
    return { sx, sy, tx, ty }; };
  const insetAll = (e, s) => { const c = s.clipPath; if (!c || !c.startsWith('inset(')) return false; const v = c.slice(6).split(/\s+round\s+/)[0].replace(')', '').trim().split(/\s+/);
    const [t, r = t, b = t, l = r] = v; const W = e.offsetWidth || e.getBoundingClientRect().width || 1, H = e.offsetHeight || e.getBoundingClientRect().height || 1;
    const px = (x, n) => x.endsWith('%') ? parseFloat(x) / 100 * n : parseFloat(x) || 0; return px(t, H) + px(b, H) >= H - .5 || px(l, W) + px(r, W) >= W - .5; };
  // the checks at one stop: running animations, motion classes left on, content hidden, squashed, moved off screen or clipped away
  M.inspect = () => {
    const out = [], add = (rule, el, name, detail) => out.push({ rule, sel: el ? M.desc(el) : '', name: name || '', detail: detail || '' });
    for (const a of document.getAnimations()) {
      if (a.playState === 'finished') continue;
      const ef = a.effect, t = ef && ef.target, tm = ef ? ef.getComputedTiming() : {};
      const name = a.animationName ? '@' + a.animationName : a.transitionProperty ? 'transition ' + a.transitionProperty : 'script ' + (a.id || a.constructor.name);
      add('running', t, name, a.playState + (ef && ef.pseudoElement ? ' ' + ef.pseudoElement : '') + ', ' + (tm.iterations === Infinity ? 'loops' : Math.round(tm.duration || 0) + ' ms'));
    }
    for (const c of Object.keys(cfg.state)) document.querySelectorAll('.' + c).forEach(e => add('armed', e, c, cfg.state[c]));
    for (const at of Object.keys(cfg.attr)) document.querySelectorAll('[' + at + ']').forEach(e => add('armed', e, at, cfg.attr[at]));
    if (document.documentElement.hasAttribute('data-moving')) add('armed', document.documentElement, 'data-moving', '85: html[data-moving] is on while anything scripted moves');
    const okSel = cfg.hiddenOk.join(','), I = new Map(), VW = document.documentElement.clientWidth, VH = innerHeight;
    const meet = (r, dx, dy) => r.right - dx > 0 && r.left - dx < VW && r.bottom - dy > 0 && r.top - dy < VH;
    const info = e => {
      if (!e || e === document.documentElement || e === document) return { op: 1, sc: null, aw: null, cl: null };
      let v = I.get(e); if (v) return v;
      const p = info(e.parentElement), s = getComputedStyle(e), m = mat(s);
      v = { op: p.op * (+s.opacity), opEl: p.op < .05 ? p.opEl : (+s.opacity < .2 ? e : p.opEl), sc: p.sc || ((m.sx < .5 || m.sy < .5) ? e : null), aw: p.aw, cl: p.cl || (insetAll(e, s) ? e : null) };
      if (!v.aw && (Math.abs(m.tx) >= 1 || Math.abs(m.ty) >= 1)) { const r = e.getBoundingClientRect(); if (r.width > 0 && !meet(r, 0, 0) && meet(r, m.tx, m.ty)) v.aw = e; }
      I.set(e, v); return v;
    };
    const seen = new Set();
    for (const e of document.body.getElementsByTagName('*')) {
      if (!content(e) || (e.localName !== 'svg' && e.closest('svg'))) continue;
      if (e.checkVisibility && !e.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: true })) continue;
      if (!hasSize(e)) continue;
      const v = info(e);
      const hit = (rule, x, name) => { if (!x || seen.has(rule + '|' + M.desc(x))) return; seen.add(rule + '|' + M.desc(x)); let ok = false; try { ok = !!(okSel && (x.closest(okSel) || e.closest(okSel))); } catch (er) {} if (!ok) add(rule, x, name, 'holds ' + (e === x ? 'its own ' : M.desc(e) + ' ') + JSON.stringify((e.textContent || e.getAttribute('aria-label') || e.localName).trim().replace(/\s+/g, ' ').slice(0, 40))); };
      if (v.op < .05) hit('hidden', v.opEl || e, 'opacity ' + (v.opEl ? getComputedStyle(v.opEl).opacity : v.op.toFixed(2)));
      if (v.sc) { const s = getComputedStyle(v.sc); hit('collapsed', v.sc, (s.transform !== 'none' ? s.transform : '') + (s.scale !== 'none' ? ' scale ' + s.scale : '')); }
      if (v.aw) { const s = getComputedStyle(v.aw); hit('away', v.aw, (s.transform !== 'none' ? s.transform : '') + (s.translate !== 'none' ? ' translate ' + s.translate : '')); }
      if (v.cl) hit('clipped', v.cl, getComputedStyle(v.cl).clipPath);
    }
    return out;
  };
  // three looks 110 ms apart at everything on the screen: what changes twice in a row is moving
  M.sig = () => { const m = new Map(), VH = innerHeight;
    for (const e of document.body.getElementsByTagName('*')) { const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > VH || (r.width < 1 && r.height < 1)) continue;
      const s = getComputedStyle(e), txt = !e.childElementCount && /\d/.test(e.textContent) ? e.textContent.trim().slice(0, 40) : '';
      m.set(e, [Math.round(r.left * 2) / 2, Math.round(r.top * 2) / 2, Math.round(r.width * 2) / 2, Math.round(r.height * 2) / 2, s.opacity, s.transform, s.translate, s.scale, s.clipPath, txt].join('|')); }
    return m; };
  // the page scrolled from the top to its end (Reduce Motion): nothing\u2019s transform may follow the scroll (item 90.3 "Reduce Motion: no
  // parallax and no shrink"; item 85 "No motion on scroll"). Compared at 150 px, 300 px (the Journal\u2019s fold) and the end.
  M.scrollStill = async () => {
    const fr = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))), max = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const snap = () => { const m = new Map(); for (const e of document.body.getElementsByTagName('*')) { const s = getComputedStyle(e); m.set(e, [s.transform, s.translate, s.scale, s.rotate].join(' | ')); } return m; };
    window.scrollTo(0, 0); await fr(); const a = snap(), out = new Map();
    const cmp = y => { for (const [e, v] of snap()) { const v0 = a.get(e); if (v0 !== undefined && v0 !== v && !out.has(e)) out.set(e, { v0, v, y }); } };
    const stops = [150, 300]; for (let y = 300 + innerHeight * .8; y < max(); y += innerHeight * .8) stops.push(Math.round(y)); stops.push(max());
    for (const y of stops) { if (y > max() && y !== stops[stops.length - 1]) continue; window.scrollTo(0, Math.min(y, max())); await fr(); if (y <= 300 || y === stops[stops.length - 1]) cmp(Math.min(y, max())); }
    const L = [...out].filter(([e]) => ![...out.keys()].some(x => x !== e && x.contains(e)));
    return L.slice(0, 12).map(([e, o]) => ({ rule: 'scroll', sel: M.desc(e), name: 'transform follows the scroll', detail: o.v0 + ' -> ' + o.v + ' at ' + o.y + ' px' }));
  };
  M.moving = async (gap = 110) => { const w = () => new Promise(r => setTimeout(r, gap)); const a = M.sig(); await w(); const b = M.sig(); await w(); const c = M.sig(), out = [];
    for (const [e, x] of a) { const y = b.get(e), z = c.get(e); if (y === undefined || z === undefined || x === y || y === z) continue;
      if (out.some(o => o.el.contains(e))) continue; out.push({ el: e, detail: x + ' -> ' + y + ' -> ' + z }); }
    return out.filter(o => !out.some(p => p !== o && p.el.contains(o.el))).slice(0, 12).map(o => ({ rule: 'js', sel: M.desc(o.el), name: 'changes by itself', detail: o.detail })); };
}
const CFG = {
  onLoad: ON_LOAD_OK.map(o => ({ kind: o.kind, name: o.name.source, sel: o.sel })),
  layoutOk: LAYOUT_OK.map(o => ({ prop: o.prop, sel: o.sel })), layoutRe: LAYOUT.source,
  state: MOTION_STATE, attr: MOTION_ATTR, hiddenOk: HIDDEN_OK.map(o => o.sel),
  expect: EXPECT.map(o => ({ kind: o.kind, name: o.name.source, sel: o.sel })),
};
// a browser whose every context (the screens', the seeds') gets the instrument first
async function instrumentedBrowser() {
  const b = await chromium.launch(), nc = b.newContext.bind(b);
  b.newContext = async (...a) => { const ctx = await nc(...a); await ctx.addInitScript(INSTR, CFG); return ctx; };
  return b;
}

/* ================================================================ the steps after go(): scroll, close, tab */
const step = (p, s) => p.evaluate(s => { if (window.__mo) window.__mo.step = s; }, s).catch(() => {});
async function scrollThrough(p, wait) { /* the motion pass and the first loads: real stops, so item 86 entrances play as boxes arrive */
  const H = await p.evaluate(() => [document.documentElement.scrollHeight, innerHeight]);
  for (let y = 0, n = 0; n < 40; n++) {
    y = Math.min(H[0] - H[1], y + Math.round(H[1] * .7));
    await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(wait);
    if (y >= H[0] - H[1]) break;
  }
  await settle(p, 100);
}
// the open sheets and dialogs (a sheet counts its root and its panel), and whether anything scripted is still moving (html[data-moving])
const DIALOGS = '[role=dialog][aria-modal=true], .modal.open, #sportMenu';
const openDialogs = p => p.evaluate(D => [...document.querySelectorAll(D)].filter(e => e.checkVisibility ? e.checkVisibility({ visibilityProperty: true }) : e.offsetParent).map(e => e.id || e.className || e.localName), DIALOGS).catch(() => []);
const openDialog = async p => (await openDialogs(p))[0] || null;
// close what is open: Escape, else its Later / Cancel / Close / Done / Back; again for a sheet under it (an edit sheet over Settings)
async function closeDialog(p) {
  const d0 = await openDialog(p); if (!d0) return null;
  const fewer = n => p.waitForFunction(([D, n]) => [...document.querySelectorAll(D)].filter(e => e.checkVisibility ? e.checkVisibility({ visibilityProperty: true }) : e.offsetParent).length < n && !document.documentElement.hasAttribute('data-moving'), [DIALOGS, n], { timeout: 2500 }).then(() => true, () => false);
  for (let i = 0; i < 3; i++) {
    const n = (await openDialogs(p)).length; if (!n) break;
    await p.keyboard.press('Escape');
    if (await fewer(n)) continue;
    const mark = await p.evaluate(D => { /* the close button of the sheet on top: visible and not covered (the one a finger would reach) */
      const R = /^(Later|Cancel|Close|Done|Back|\u00d7|\u2039.*)$/i;
      for (const d of [...document.querySelectorAll(D)].reverse()) for (const x of d.querySelectorAll('button, a')) {
        if (!x.checkVisibility() || !(R.test(x.textContent.trim()) || /close/i.test(x.getAttribute('aria-label') || ''))) continue;
        const r = x.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (h && (h === x || x.contains(h))) { x.setAttribute('data-mo-close', ''); return true; }
      }
      return false; }, DIALOGS);
    if (!mark) break;
    await p.click('[data-mo-close]', { timeout: 3000 }).catch(() => {}); await p.evaluate(() => document.querySelectorAll('[data-mo-close]').forEach(e => e.removeAttribute('data-mo-close'))).catch(() => {});
    if (!(await fewer(n))) break;
  }
  await settle(p, 100);
  return d0;
}
async function otherTab(p) {
  const v = await p.evaluate(() => { const a = document.querySelector('main .view.active, .view.active'); return a ? a.id.replace('view-', '') : ''; });
  const to = v === 'journal' ? 'plan' : 'journal';
  const btn = await p.$('nav.tabs button[data-view=' + to + ']:visible');
  if (!btn) return null;
  await btn.click(); await p.waitForFunction(v => document.getElementById('view-' + v).classList.contains('active'), to, { timeout: 8000 }).catch(() => {});
  return to;
}
const evs = p => p.evaluate(() => { const M = window.__mo; if (!M) return { ev: [], calls: [], live: 0, js: [] }; return { ev: M.ev.splice(0), calls: M.calls.splice(0), live: M.live, js: M.scripted() }; }).catch(() => ({ ev: [], calls: [], live: 0, js: [] }));

/* ================================================================ findings */
const FIND = []; /* {pass, rule, screen, sel, name, detail} */
const add = (pass, screen, f) => FIND.push(Object.assign({ pass, screen }, f));
// what an event breaks: (1) under Reduce Motion it moved; (2) before the first tap it is not allowed; (3) it animates a layout property
const SEEN = new Map(); /* EXPECT index -> the first screen it was seen on (motion pass) */
function judgeEvents(pass, screen, stepName, E) {
  for (const e of E.ev) {
    if (pass === 'motion') for (const i of e.exp || []) if (!SEEN.has(i)) SEEN.set(i, screen);
    if (DEBUG) console.log('    ev ' + pass + ' ' + screen + ' [' + e.step + '] ' + e.k + ' ' + e.name + ' ' + e.sel + ' dur ' + e.dur + ' delay ' + e.delay + ' iter ' + e.iter + (e.pre ? ' PRE' : '') + (e.rm ? ' RM' : ''));
    /* (a transition only runs with a duration or a delay; an animation of 0 ms without a delay is no motion) */
    if (e.rm && (e.k === 'transition' || e.dur == null || e.dur > 0 || (e.delay || 0) > 0)) add(pass, screen, { rule: 'moved', sel: e.sel, name: e.k + ' ' + e.name, detail: 'ran under Reduce Motion (' + e.step + '): ' + e.dur + ' ms' + (e.delay ? ', delay ' + e.delay + ' ms' : '') + (e.iter === 'loops' ? ', loops' : '') });
    if (e.pre && !e.rm && e.load < 0) add(pass, screen, { rule: 'on-load', sel: e.sel, name: e.k + ' ' + e.name, detail: 'before the first tap or key (' + e.step + '), not in ON_LOAD_OK: ' + e.dur + ' ms' + (e.iter === 'loops' ? ', loops' : '') });
    for (const [p, ok] of e.lay || []) if (ok < 0) add(pass, screen, { rule: 'layout', sel: e.sel, name: e.k + ' ' + e.name, detail: 'animates ' + p + ' (' + e.step + ')' });
  }
  for (const c of E.calls) add(pass, screen, { rule: 'animate', sel: c.sel, name: 'element.animate(' + c.props.join(', ') + ')', detail: '(' + c.step + ') ' + c.stack });
  for (const j of E.js || []) {
    const nm = j.prop === 'text' ? 'script: its number rewritten' : 'script: style ' + j.prop;
    if (DEBUG) console.log('    js ' + pass + ' ' + screen + ' [' + j.step + '] ' + nm + ' ' + j.sel + ' x' + j.n + (j.pre ? ' PRE' : ''));
    if (pass === 'reduce') add(pass, screen, { rule: 'moved', sel: j.sel, name: nm, detail: 'changed in ' + j.n + ' frames under Reduce Motion (' + j.step + ')' });
    else if (j.pre && j.load < 0) add(pass, screen, { rule: 'on-load', sel: j.sel, name: nm, detail: 'changed in ' + j.n + ' frames before the first tap or key (' + j.step + '), not in ON_LOAD_OK' });
    if (pass !== 'reduce' && new RegExp(LAYOUT.source).test(j.prop) && j.lok < 0) add(pass, screen, { rule: 'layout', sel: j.sel, name: nm, detail: 'a script animates ' + j.prop + ' (' + j.step + ')' });
  }
}
async function stop(p, pass, screen, stepName, deep) {
  judgeEvents(pass, screen, stepName, await evs(p));
  if (pass !== 'reduce' && !process.env.MO_INSPECT_ALL) return;
  const r = await p.evaluate(() => window.__mo ? window.__mo.inspect() : [{ rule: 'instrument', sel: '', name: 'no instrument in the page', detail: '' }]).catch(e => [{ rule: 'instrument', sel: '', name: 'inspect threw', detail: String(e.message).split('\n')[0] }]);
  for (const f of r) add(pass, screen, Object.assign({}, f, { detail: f.detail + ' (' + stepName + ')' }));
  if (deep) { const m = await p.evaluate(() => window.__mo ? window.__mo.moving() : []).catch(() => []); for (const f of m) add(pass, screen, Object.assign({}, f, { detail: f.detail + ' (' + stepName + ')' })); }
}

/* ================================================================ self-tests: the checks catch what they should */
async function selfTest(p, pass, screen) {
  judgeEvents(pass, screen, 'go', await evs(p)); /* (what the screen itself still did is judged as the screen\u2019s, not taken by the probes) */
  const before = FIND.length, got = () => FIND.slice(before).filter(f => f.screen === 'self-test');
  await p.evaluate(() => {
    const v = document.createElement('div'), st = document.createElement('style');
    v.id = '__moW'; v.style.cssText = 'position:fixed;top:60px;left:8px;width:320px;height:260px;overflow:hidden;z-index:2147483000;background:#fff'; document.body.append(v); /* (fixed: on screen wherever the page is scrolled) */
    st.id = '__moS'; st.textContent = '@keyframes __moSpin{to{transform:rotate(360deg)}}'; document.head.append(st);
    const mk = (id, css, txt) => { const e = document.createElement('p'); e.id = id; e.style.cssText = css; e.textContent = txt; v.prepend(e); return e; };
    mk('__moP1', 'animation:__moSpin 1s linear infinite !important', 'probe spin');
    mk('__moP2', 'opacity:0 !important', 'probe hidden');
    mk('__moP3', 'transform:scaleY(0) !important', 'probe squashed');
    mk('__moP4', '', 'probe armed').classList.add('ve-arm');
    const n = mk('__moP5', '', '0'); let i = 0; window.__moT = setInterval(() => { n.textContent = String(++i * 7); }, 40);
    const w = mk('__moP6', 'width:10px;transition:width 600ms linear !important;background:#000', 'probe width');
    w.offsetWidth; w.style.width = '200px';
    mk('__moP7', '', 'probe animate').animate([{ opacity: 1 }, { opacity: .5 }], { duration: 5000 });
    const h = mk('__moP9', 'height:4px;background:#000', ''); let k = 0; window.__moH = setInterval(() => { h.style.height = (4 + ++k) + 'px'; }, 20);
    const sp = document.createElement('div'); sp.id = '__moSp'; sp.style.height = '3000px'; document.body.append(sp); /* (room to scroll on any screen) */
    const q = mk('__moP8', '', 'probe parallax'); window.__moL = () => { q.style.transform = 'translateX(' + Math.round(scrollY * .05) + 'px)'; }; addEventListener('scroll', window.__moL);
  });
  await p.waitForTimeout(120);
  await stop(p, pass, 'self-test', 'probes', true);
  if (pass === 'reduce') { for (const x of await p.evaluate(() => window.__mo.scrollStill())) add(pass, 'self-test', x); }
  const F = got(), has = (rule, id) => F.some(f => f.rule === rule && f.sel.includes(id));
  const want = pass === 'reduce'
    ? [['running', '__moP1'], ['moved', '__moP1'], ['hidden', '__moP2'], ['collapsed', '__moP3'], ['armed', '__moP4'], ['js', '__moP5'], ['layout', '__moP6'], ['moved', '__moP6'], ['animate', '__moP7'], ['running', '__moP7'], ['scroll', '__moP8'], ['moved', '__moP9']]
    : pass === 'load' ? [['on-load', '__moP1'], ['layout', '__moP6'], ['animate', '__moP7'], ['on-load', '__moP9'], ['layout', '__moP9']] : [['layout', '__moP6'], ['animate', '__moP7'], ['layout', '__moP9']];
  for (const [rule, id] of want) C.ok(has(rule, id), pass + ' self-test: a probe ' + id + ' is caught as ' + rule, F.map(f => f.rule + ' ' + f.sel));
  await p.evaluate(() => { clearInterval(window.__moT); clearInterval(window.__moH); removeEventListener('scroll', window.__moL); ['__moS', '__moSp', '__moW', '__moP1', '__moP2', '__moP3', '__moP4', '__moP5', '__moP6', '__moP7', '__moP8', '__moP9'].forEach(id => { const e = document.getElementById(id); if (e) e.remove(); }); document.getAnimations().forEach(a => { if (!a.animationName && !a.transitionProperty) a.cancel(); }); });
  await p.waitForTimeout(100);
  FIND.splice(before);
  { const E = await evs(p), ok = x => !/__mo/.test(x.sel); E.ev = E.ev.filter(ok); E.calls = E.calls.filter(ok); E.js = E.js.filter(ok); judgeEvents(pass, screen, 'go', E); } /* (the screen\u2019s own, the probes\u2019 left out) */
  if (pass === 'reduce') { const r = await p.evaluate(() => window.__mo.inspect()); C.ok(!r.some(f => /__moP/.test(f.sel)), pass + ' self-test: no probe left behind', r.filter(f => /__moP/.test(f.sel))); }
}

/* ================================================================ (1) and (3): every screen under Reduce Motion; (2) and (3) with motion on */
// the motion pass scrolls with real stops (so item 86 entrances play as boxes arrive) on one screen per page that has them
const SCROLL_MOTION = /^(plan-results-weather|run-results|journal-home|journal-list-all|volume-season|races-home|news-racing|desktop-plan|desktop-journal|desktop-volume)$/;
// item 87: every sky, forced by the app\u2019s own QA query (?sky=..., WX_SKY_Q; the list is WX_SKIES in index.html), after a fresh Crunch
const SKIES = JSON.parse((/const WX_SKIES=(\[[^\]]*\]);/.exec(SRC) || [, '[]'])[1].replace(/'/g, '"'));
const SKY_SCREENS = SKIES.map(k => ({ name: 'sky-' + k, sky: k, go: async p => {
  await p.goto(p.url().split('?')[0] + '?sky=' + k); await p.waitForLoadState('load'); await settle(p, 300);
  await crunch(p); await toY(p, '#rWeather');
} }));
// item 87.7 (and 86.1 loopWhileVisible): the sky and icon loops play while the box is seen and stand still (paused) once it is off screen
async function skyLoops(p, name) {
  const st = () => p.evaluate(() => { const L = document.getAnimations().filter(a => /^rwx-/.test(a.animationName || '')), r = document.getElementById('rWeather').getBoundingClientRect();
    return { on: r.bottom > 0 && r.top < innerHeight, n: L.length, run: L.filter(a => a.playState === 'running' && a.effect.getComputedTiming().iterations === Infinity).map(a => a.animationName + ' ' + window.__mo.desc(a.effect.target)) }; });
  await p.waitForTimeout(500);
  const a = await st();
  if (!a.run.length) add('motion', name, { rule: 'sky', sel: 'section#rWeather', name: 'no loop', detail: 'no sky or icon loop plays while the box is on screen (' + a.n + ' rwx animations)' });
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(500);
  const b = await st();
  if (!b.on) for (const x of new Set(b.run)) add('motion', name, { rule: 'sky', sel: x.split(' ').slice(1).join(' '), name: 'animation ' + x.split(' ')[0], detail: 'still loops with the weather box off screen (87.7: paused off screen)' });
  await p.evaluate(() => document.getElementById('rWeather').scrollIntoView({ block: 'center' })); await p.waitForTimeout(500);
  const c = await st();
  if (a.run.length && !c.run.length) add('motion', name, { rule: 'sky', sel: 'section#rWeather', name: 'no loop', detail: 'the loops do not play again when the box is back on screen' });
}
const STAT = { reduce: { screens: 0, broken: [] }, motion: { screens: 0, broken: [] }, load: { states: 0 } };
async function walk(pass) {
  const b = await instrumentedBrowser(), rm = pass === 'reduce';
  let first = true;
  const each = async (s, o) => {
    const t = Date.now();
    STAT[pass].screens++;
    if (o.fail || !o.p) { STAT[pass].broken.push(s.name + ': ' + o.fail); if (o.p) await stop(o.p, pass, s.name, 'go (broken: ' + o.fail + ')', false); return; }
    const p = o.p;
    // what moved on the way here (the first load, go()): judged as it came (pre: before the first tap)
    await stop(p, pass, s.name, 'go', true);
    if (first) { first = false; await selfTest(p, pass, s.name); }
    if (s.sky && !rm) { await step(p, 'sky'); await skyLoops(p, s.name); await stop(p, pass, s.name, 'sky loops', false); }
    await step(p, 'scroll');
    if (rm) { const f = await p.evaluate(() => window.__mo.scrollStill()).catch(e => [{ rule: 'instrument', sel: '', name: 'scrollStill threw', detail: String(e.message).split('\n')[0] }]); for (const x of f) add(pass, s.name, x); await stop(p, pass, s.name, 'scrolled to the end', true); }
    else if (SCROLL_MOTION.test(s.name)) { await scrollThrough(p, 320); await stop(p, pass, s.name, 'scrolled to the end', false); }
    await step(p, 'close');
    const d = await closeDialog(p);
    if (d) { CLOSED[pass].push(s.name + ' (' + d + (await openDialog(p) ? ', did not close' : '') + ')'); await stop(p, pass, s.name, 'closed ' + d, false); }
    await step(p, 'tab');
    const tb = await otherTab(p).catch(() => null);
    if (tb) { await settle(p, rm ? 120 : 400); await stop(p, pass, s.name, 'tab ' + tb, false); } else TABLESS[pass].push(s.name);
    if (o.errors.length) add(pass, s.name, { rule: 'errors', sel: '', name: 'page errors', detail: o.errors.slice(0, 3).join(' | ') });
    if (DEBUG) console.log('  ... ' + pass + ' ' + s.name + ' ' + (Date.now() - t) + ' ms');
  };
  try {
    await run(each, { page: PAGE, browser: b, only: ONLY ? (s => ONLY.test(s.name)) : undefined, motion: !rm });
    for (const s of SKY_SCREENS) {
      if (ONLY && !ONLY.test(s.name)) continue;
      let x = null;
      try { x = await openScreen(PAGE, s, { browser: b, motion: !rm }); } catch (e) { STAT[pass].screens++; STAT[pass].broken.push(s.name + ': open: ' + String(e && e.message || e).split('\n')[0]); continue; }
      try { await each(s, x); } finally { await x.close(); }
    }
  } finally { await b.close(); }
}
const CLOSED = { reduce: [], motion: [] }, TABLESS = { reduce: [], motion: [] };

/* ================================================================ (2) first loads: no tap at all, each deep link, then scrolled */
const LOAD_STATES = [
  { name: 'load-plan', views: ['', 'settings'] },
  { name: 'load-first-visit', athlete: null, views: [''] },
  { name: 'load-journal', seed: 'journal', views: ['', 'journal'] },
  { name: 'load-volume', seed: ['volume', 'journal'], cloud: true, views: ['', 'volume', 'journal'] },
  { name: 'load-races', seed: 'races', views: ['races'] },
  { name: 'load-news', now: '2026-10-01T09:00:00-07:00', views: ['news'] },
  { name: 'load-desktop', width: 1280, height: 800, seed: ['volume', 'journal'], cloud: true, views: ['', 'journal', 'volume'] },
];
async function loads() {
  const b = await instrumentedBrowser();
  try {
    let first = true;
    for (const L of LOAD_STATES) {
      if (ONLY && !ONLY.test(L.name)) continue;
      STAT.load.states++;
      const s = Object.assign({}, L, { go: async () => {} });
      const o = await openScreen(PAGE, s, { browser: b, motion: true });
      try {
        const p = o.p, url = p.url().split('?')[0];
        for (const v of L.views) {
          const nm = L.name + (v ? '?view=' + v : '');
          if (v) { await p.goto(url + '?view=' + v); await p.waitForLoadState('load'); }
          await p.waitForTimeout(1500);
          await step(p, 'scroll (no tap)');
          await scrollThrough(p, 320);
          await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(600);
          const E = await evs(p);
          C.ok(!E.live, nm + ': no tap or key reached the page (the gate stays shut)', E.live);
          judgeEvents('load', nm, 'load', E);
          if (DEBUG) console.log('  ... load ' + nm + ': ' + E.ev.length + ' events');
          if (first) { first = false; await selfTest(p, 'load', nm); }
        }
        if (o.errors.length) add('load', L.name, { rule: 'errors', sel: '', name: 'page errors', detail: o.errors.slice(0, 3).join(' | ') });
      } finally { await o.close(); }
    }
  } finally { await b.close(); }
}

/* ================================================================ run */
C.ok(SKIES.length >= 8, 'item 87: the skies, read from index.html (WX_SKIES): ' + SKIES.join(' '));
for (const f of STATIC) FIND.push(Object.assign({ pass: 'static' }, f));
if (PASSES.includes('reduce')) await walk('reduce');
if (PASSES.includes('motion')) await walk('motion');
if (PASSES.includes('load')) await loads();

/* ================================================================ report: grouped by rule, element and name, with the screens */
const isKnown = f => KNOWN_ON_MAIN.findIndex(k => k.rule === f.rule && (!k.sel || k.sel.test(f.sel)) && (!k.name || k.name.test(f.name)) && (!k.screen || k.screen.test(f.screen)) && (!k.pass || k.pass === f.pass));
const groups = new Map();
for (const f of FIND) { const key = [f.pass, f.rule, f.sel, f.name].join(' | '); if (!groups.has(key)) groups.set(key, { f, screens: new Set(), details: new Set() }); const g = groups.get(key); g.screens.add(f.screen); g.details.add(f.detail); }
const knownUsed = new Set(); let nKnown = 0;
for (const [key, g] of groups) {
  const k = isKnown(g.f), line = g.f.pass + ' ' + g.f.rule + ': ' + g.f.sel + ' · ' + g.f.name + ' · ' + [...g.details][0] + (g.details.size > 1 ? ' (+' + (g.details.size - 1) + ' more)' : '') + ' · on ' + [...g.screens].slice(0, 8).join(', ') + (g.screens.size > 8 ? ' and ' + (g.screens.size - 8) + ' more' : '');
  if (k >= 0) { knownUsed.add(k); nKnown++; console.log('  known ' + line + ' -- KNOWN_ON_MAIN: ' + KNOWN_ON_MAIN[k].why); continue; }
  C.ok(false, line);
}
KNOWN_ON_MAIN.forEach((k, i) => { if (!knownUsed.has(i) && !ONLY) console.log('  note: KNOWN_ON_MAIN entry not seen any more (take it out?): ' + k.rule + ' ' + (k.sel || '') + ' ' + (k.name || '') + ' -- ' + k.why); });
for (const pass of ['reduce', 'motion']) if (PASSES.includes(pass)) {
  console.log('  ' + pass + ': sheets and dialogs closed after go(): ' + CLOSED[pass].length + (DEBUG ? ' ' + CLOSED[pass].join(', ') : '') + '; no other tab to tap on: ' + (TABLESS[pass].join(', ') || 'none'));
  C.ok(!CLOSED[pass].some(x => /did not close/.test(x)), pass + ': every open sheet closed (Escape, or its Cancel / Close)', CLOSED[pass].filter(x => /did not close/.test(x)));
  C.ok(STAT[pass].screens > 0, pass + ': screens walked (' + STAT[pass].screens + ')');
  C.ok(!STAT[pass].broken.length, pass + ': every screen reached', STAT[pass].broken);
}
if (PASSES.includes('motion') && !ONLY) EXPECT.forEach((x, i) => C.ok(SEEN.has(i), 'motion: seen ' + x.what + (SEEN.has(i) ? ' (first on ' + SEEN.get(i) + ')' : '')));
C.ok(!STATIC.length || STATIC.every(f => isKnown(Object.assign({ pass: 'static' }, f)) >= 0), 'static: the source (@keyframes placed, no layout animation, no element.animate)');
console.log('  (' + Math.round((Date.now() - T0) / 1000) + ' s)');
C.done('motion audit: Reduce Motion still on ' + STAT.reduce.screens + ' screens, nothing moves before a tap (' + STAT.load.states + ' first loads + every screen), only transform / opacity / bar widths animate' + (nKnown ? ' (' + nKnown + ' known on main)' : ''));
