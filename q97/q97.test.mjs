// node q97.test.mjs <null.html> [main null.html]   (cd into this folder first) -- item 97: fred world: the bundle, motion plumbing and
// switch. Every numbered point and QA line:
//   cache    sw.js CACHE and APP_BUILD match, v121 or later
//   bundle   point 1: the page has the design chat's bundle exactly once, each file whole in its own block between its markers: the CSS in
//            <style id="fwCss"> in the <head>, before the app's own stylesheet; the JS in <script id="fwJs"> before the app's main script,
//            so window.FW exists when the main script starts (checked from its first line); both blocks carry the same version, and the JS
//            defines FW with it; nothing in the CSS reaches outside the bundle's own fw- names (every class, keyframe and custom property it
//            defines starts with fw-; no rule for html, body or a bare element); neither block loads anything (no @import, no url() other
//            than #id, no fetch). When the design chat's handoff folder is on this machine (FW_HANDOFF, else ~/Dropbox/00_T/handoff), each
//            block is that folder's file, byte for byte (a newer build there is a note, not a failure); and, whatever that folder holds,
//            the BUNDLE FIXES for 97 on the blocks themselves: no Math.random, the same FW call on two fresh loads gives the same string
//            (ids from a counter) and two calls share no id (a counter, not a constant), neither red (#E2463F, #FF4D5E), no FW.TIPS and no
//            holiday design notes (field c), no @keyframes animating stroke-dash
//   still    "No visual change in this item except the new switch": no fred world art anywhere in the app: the main script has no
//            fwMount call and no FW use (every screen at once); a recorder from the main script's first line sees none added (or a fw-
//            class put on anything) on Plan, results, every tab, Settings, News's race page, Volume, the computer layout and a Settings
//            sheet; no console errors; nothing loaded that main doesn't load, off-site or beside the page (every request from the first
//            one on, so the head and boot too, after the same walk: self-tests show a stylesheet link added to the head is seen, off-site
//            and beside the page alike). Later items' art is left out of this (LATER: on a page that has the item, its own spots and
//            the functions that mount them; item 98's fred in the weather boxes, wxFred), so the test still runs on their pages; any
//            other art, or a fwMount call or FW use anywhere else in the main script, still fails
//   gate     point 2: html.fw-anim when Reduce Motion is off and the switch is on (before any tap: not motionOK); off under Reduce Motion;
//            it follows Reduce Motion changing while the app is open, both ways
//   switch   point 3: Settings has a "fred world" group in item 80's style (a titled box, both sports) with one switch row, "Animate the
//            world", on, drawn as a switch like Same recipe (.prow.prow-sw > button.prow-h.gr-swb[aria-pressed] > .gsw-k, its track another
//            colour off than on); 44 px tall; search finds it; nothing is stored until it is changed (no worldMotion key, and DEFAULT_SETTINGS has
//            none); off: stored false, the gate shuts, and it stays off after a reload; on again: stored true, the gate opens; under Reduce
//            Motion the switch keeps its own state and the gate stays shut: each tap still turns it off or on (shown, stored), and turned
//            off there it keeps the gate shut once Reduce Motion is off; the group holds only its title and switch rows (titles and
//            labels only: no explanation line; a self-test adds one); at 320 px with 150% and 200% text the row is 44 px or more, its text
//            uncut, nothing scrolls sideways; in forced colours (light and dark) it still shows and on looks different from off, and
//            keyboard focus shows on it and on Fluid limits' No limit switches (input.gsw), off and on (a self-test); turned off,
//            an app animation (ri-spin) keeps running. In every state the gate is shut
//            (here, gate, rules, sync, restore), .fw-rm is on spots only: never html, body or anything else (H().rm)
//   mount    point 2: fwMount (reached through a hooked copy of the page: the plumbing has no screen yet): a drawing on screen gets its spot
//            (.fwm, aria-hidden), starts moving at once (.fwm-go, fw- animations running), is still moving at 5.5 s, and by 8.5 s has
//            settled (no fw- animation left, .fwm-go off); Kitty's tail (fw-swish, 4 s: a plain loop that ends where it starts, as
//            every loop of the bundle since its 17:29 build; the 06:14 build swung it back and forth) ends at rest: no jump in the
//            frame its loop comes off; the same look again changes nothing (same nodes, no new move): the same string,
//            or a fresh FW call (new id numbers) with the same key, whose draw function is not even called; a new key replaces the drawing
//            and it moves again, and pauses like the first (the page hidden); '' empties the spot; a spot below the fold waits still and
//            paused (.mo-off), with no settle timer and nothing for inView to watch (no scroll work), until it is scrolled to, then moves;
//            scrolled away it pauses; a hidden page pauses it; its settle counts from when it is seen (mounted long before: still moving
//            5.5 s after it was scrolled to, settled by 8.5 s); its drawing replaced (a new key) while off screen waits still and paused,
//            then moves when scrolled to and pauses scrolled away; a second spot given the very same string is
//            reported (its ids would repeat); a spot a render took out of the page is let go, one mounted before it was put in too; o.cls
//            puts the bundle's wrapper class on the spot (fred flaps: fw-ch-flap runs inside a .fw-bird spot while it moves), taken off
//            when the drawing is replaced; o.still never
//            moves; art put in without fwMount never moves (html.fw-anim alone would loop it for ever, off screen and hidden too): every
//            drawing (each holiday and weather look of fred, Ashley, Kitty, friends, the scene), bare and in its wrapper class, its parts
//            with no class too (the champagne's fizz circles)
//   keep     spots a render takes out and puts back are kept (review round 2): two and three kept spots in one box, re-rendered by
//            emptying the box then mounting and appending each, appending then mounting, and a fragment put in with replaceChildren:
//            draw() is not called again, the same record and first node, still registered with loopWhileVisible; a render run twice in
//            one task (empty the box, build a spot, mount it, append it), the same key or a new one: only the spot in the page is kept
//            (FWM and loopWhileVisible); spots mounted in the page read no layout (no getBoundingClientRect per spot); a render that writes
//            the spot's className whole mid-move (then mounts the same look, or not): fwMount's classes come back, the loops carry on, print
//            and forced colours still hide the art, a new app open moves it again; one that emptied the spot gets the drawing again
//   start    motion starts with no jump (review rounds 2 and 3): Kitty's tail, Ashley's waving arm and crew friends' pumping arms (fw-vm4)
//            move under 2 degrees in the frame .fwm-go goes on, from the still pose they were drawn in, and in every frame after it; a crew
//            friend's bob and another's bounce (fw-vm2), each offset into its round, move under 0.5 px then; at mount and when a new app
//            open plays them again while they rest on screen; crew keep their own phase (two pumping with offsets in the same half of the
//            pump are not in step: the brand guide's 'a group never moves in step'); o.still at a new app open: not waiting, not watched, never moving; a spot out
//            of the page a frame or more and put back (mounted again with the same key, or not at all) is paused (.mo-off) when the page
//            is hidden during its next move; a spot never put in is let go at a new app open
//   life     (review round 3) a moving spot's loops made anew carry on where they were: a render that takes it out and puts it back
//            (mounted with the same key) at 1 s, 2.6 s and 6.5 s: under 2 degrees a frame, no endless loop after the 6 s step, still once
//            settled; its view left mid-move (another tab at 5.4 s, back at 6.6 s): at rest unseen, and still when back; scrolled away at
//            2 s and back at 7.3 s: still moving after (the move counts the time it plays), and settling with no jump
//   rules    the round's rules a) and c)-e): the switch turned off while a drawing moves stops it at once (.fw-rm on the spot, nothing
//            running); a drawing mounted while it is off never moves; turning it on again does not restart a settled drawing; back after a
//            short time away (not a new app open) nothing already seen moves again; a new app open (back after 30 minutes away, on another
//            tab) lets each kept drawing move once more when seen: they wait still, and while their view is not showing inView has nothing
//            of theirs to watch (no scroll work); back on Plan the one on screen moves (scrolled away at 3.5 s it waits paused, and back on
//            screen plays the rest of its move and settles), the one below the fold
//            stays still until scrolled to, then moves, still moving 5.5 s after it was seen and settled by 8.5 s (the settle counts from
//            when it is seen); under Reduce Motion a drawing never moves and
//            gets .fw-rm (the bundle's still state: drops, flakes and falling pieces hidden); .fw-rm is only ever on spots, never on html,
//            body or anything else (the bundle's .fw-rm * would stop the app's own animations)
//   media    print and forced colours: no art, the spot's box stays
//   restyle  (review round 5) a class put on html, body or a view restyles that element, not everything inside it (the elements restyled,
//            from the trace, on Plan with its sheet open, against main's when given): round 3's guard for art outside a spot
//            ([class*="fw-"] with any element after it) restyled the whole page in Chrome (a ps-open sheet, a tab, a tap on the computer
//            layout); a self-test puts it back
//   sync     the switch syncs (item 96, key by key): A turns it off; B (signed in, its own copy never changed) pulls and shuts its gate,
//            its switch shows off; an unrelated save on a device that never touched it uploads no worldMotion (no stamp, no value)
//   restore  a backup with the switch off, restored: the gate shuts and the switch shows off
//   main     (with [main null.html]) the same bundle, switch and gate checks fail on main, so this test can tell (skipped, with a note,
//            when the main page has item 97 already: <script id="fwJs">; every other section still compares with it)
// Q97_ONLY=section,section runs some sections.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { open, checker, reload } from '../lib/open.mjs';
import { run as runScreens, screens, openScreen } from '../lib/screens.mjs';
import { Backend, syncPageSource } from '../q91/fbmock.mjs';

const PAGE = path.resolve(process.argv[2] || '../../fred97/null.html'), MAIN = process.argv[3] ? path.resolve(process.argv[3]) : null;
const ONLY = (process.env.Q97_ONLY || '').split(',').filter(Boolean);
const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = process.env.Q97_REPO || path.resolve(HERE, '../../wt-q97');
const C = checker('q97 '), ok = C.ok, ERRS = [];
const SRC = fs.readFileSync(PAGE, 'utf8');
// later items' art (still: allowed on a page that has the item): its spots (selectors) and the functions in the main script that mount them
const LATER = [{ item: 98, has: /\nfunction wxFred\(/, spots: ['.rwx-fred'], fns: ['wxFred'] }].filter(l => l.has.test(SRC));
const LATER_SPOTS = LATER.flatMap(l => l.spots), LATER_FNS = LATER.flatMap(l => l.fns);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000, step = 100) { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); } catch (e) { v = null; } if (v) return v; await sleep(step); } return v; }
const browser = await chromium.launch();

// the hooked copy: the plumbing lives inside the app's strict-mode function, so a page can't reach it; this copy hands it out (as
// tests/engine/harness.mjs does for the engine) and records, from the main script's first line, whether window.FW is there yet
// and a recorder (from that first line on) of every element put in the page with a fred world class (.fwm or fw-, html.fw-anim aside)
// and every fw- class put on an element already there: art a view draws only when it shows, which a look at the page at boot misses
const HOOK = "\nwindow.__q97fw=typeof window.FW; Object.defineProperty(window,'__q97',{configurable:true,get(){ return {fwMount, fwGate, fwOn, FWM, AOPEN, IV, LV, get settings(){ return settings; }}; }});\n"
  + "window.__q97art=[]; try{ const fw=e=>e.classList && [...e.classList].some(c=>c.startsWith('fw') && !(c==='fw-anim' && e===document.documentElement)) && !(e.closest && e.closest('.rwx-fred')); new MutationObserver(rs=>rs.forEach(m=>{ const s=m.type==='attributes' ? [m.target] : [...m.addedNodes].flatMap(n=>n.nodeType===1 ? [n, ...n.querySelectorAll('[class]')] : []); s.filter(fw).forEach(e=>{ if(window.__q97art.length<200) window.__q97art.push(e.tagName+'#'+e.id+'.'+[...e.classList].join('.')); }); })).observe(document.documentElement, {childList:true, subtree:true, attributes:true, attributeFilter:['class']}); }catch(x){}\n";
function hooked(page) { const src = fs.readFileSync(page, 'utf8'), k = src.indexOf("\n'use strict';\n"); if (k < 0) throw new Error("no 'use strict' line in " + page);
  const f = path.join(path.dirname(page), 'q97-hook.html'), at = k + "\n'use strict';".length; fs.writeFileSync(f, src.slice(0, at) + HOOK + src.slice(at)); return f; }
const HOOKED = hooked(PAGE);
const openP = (o = {}) => open(o.file || HOOKED, Object.assign({ athlete: 'A', browser, motion: true, repo: REPO }, o)).then(x => { ERRS.push(x.errors); x.p.on('dialog', d => d.accept()); return x; });
const LS = (p, k) => p.evaluate(n => { try { return JSON.parse(localStorage.getItem(n)); } catch (e) { return null; } }, k);
const sets = p => LS(p, 'bluebird.settings.v2').then(v => v || {});
// the gate on html; rm: .fw-rm on anything but a spot (html, body, a view: the bundle's .fw-rm * would stop the app's own animations)
const H = p => p.evaluate(() => { const stray = [...document.querySelectorAll('.fw-rm')].filter(e => !e.classList.contains('fwm')).map(e => e.tagName + '#' + e.id);
  return { anim: document.documentElement.classList.contains('fw-anim'), rm: stray.length > 0, stray }; });
async function toSettings(p) { if (await p.evaluate(() => document.getElementById('view-profile').classList.contains('active'))) return; await p.click('#syncHdrIn:visible, #syncHdr:visible'); await until(() => p.evaluate(() => document.getElementById('view-profile').classList.contains('active'))); await p.waitForTimeout(300); }
const sw = p => p.evaluate(() => { const b = document.getElementById('prowBtn-worldmotion'); return b ? b.getAttribute('aria-pressed') : null; });
// a spot for a drawing: at the top of the Plan page (on screen) or far below everything (off screen until scrolled to)
const spot = (p, id, below) => p.evaluate(([id, below]) => { const d = document.createElement('div'); d.id = id; d.style.cssText = 'width:200px;height:160px;' + (below ? 'margin-top:3000px;' : '');
  const v = document.querySelector('#view-plan'); if (below) v.appendChild(d); else v.prepend(d); return true; }, [id, below]);
const mount = (p, id, js, key) => p.evaluate(([id, js, key]) => { const el = id ? document.getElementById(id) : null; window.__q97.fwMount(el, js === null ? '' : (0, eval)(js), key == null ? undefined : key); return true; }, [id, js, key]);
// what a spot shows: its classes, its first node (to tell a kept drawing from a new one), fw- animations running in it
const look = (p, id) => p.evaluate(id => { const el = document.getElementById(id); if (!el) return null; const run = el.getAnimations({ subtree: true }).filter(a => String(a.animationName || '').startsWith('fw-'));
  if (!window.__q97first) window.__q97first = new WeakMap(); const f = el.firstElementChild;
  return { fwm: el.classList.contains('fwm'), go: el.classList.contains('fwm-go'), rm: el.classList.contains('fw-rm'), off: el.classList.contains('mo-off'), hid: el.getAttribute('aria-hidden'), svg: !!el.querySelector('svg'),
    kids: el.childElementCount, running: run.filter(a => a.playState === 'running').length, paused: run.filter(a => a.playState === 'paused').length, all: run.length, tag: f ? (f.__q97tag || (f.__q97tag = Math.random().toString(36).slice(2))) : '' }; }, id);
const hidePage = (p, hidden) => p.evaluate(h => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => h }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => h ? 'hidden' : 'visible' }); document.dispatchEvent(new Event('visibilitychange')); }, hidden);

const sections = [];
const section = (n, f) => sections.push([n, f]);

section('cache', async () => {
  const swf = fs.readFileSync(path.join(path.dirname(PAGE), 'sw.js'), 'utf8');
  const b = (SRC.match(/const APP_BUILD='([^']+)'/) || [])[1], c = (swf.match(/const CACHE = '([^']+)'/) || [])[1];
  ok(!!b && b === c && +(b.match(/v(\d+)$/) || [])[1] >= 121, 'cache: APP_BUILD = sw.js CACHE, v121 or later', { b, c });
});

// the bundle blocks of a page source: {css, js, cssAt, jsAt, mainCss, mainJs, n}
function blocks(src) {
  const c = [...src.matchAll(/<style id="fwCss">\n([\s\S]*?)\n<\/style>/g)], j = [...src.matchAll(/<script id="fwJs">\n([\s\S]*?)\n<\/script>/g)];
  return { nc: c.length, nj: j.length, css: c[0] ? c[0][1] : '', js: j[0] ? j[0][1] : '', cssAt: c[0] ? c[0].index : -1, jsAt: j[0] ? j[0].index : -1,
    mainCss: src.indexOf('\n<style>\n:root{'), mainJs: src.indexOf("\n<script>\n(function(){\n'use strict';\n"), head: src.indexOf('</head>') };
}
const ver = s => { const a = /^\/\* fred world v(\d+) start \*\//.exec(s), b = /\/\* fred world v(\d+) end \*\/$/.exec(s); return a && b && a[1] === b[1] ? a[1] : null; };
function bundleChecks(src, tag, expectFail) {
  const B = blocks(src), r = {};
  r.once = B.nc === 1 && B.nj === 1;
  r.place = B.cssAt >= 0 && B.cssAt < B.mainCss && B.cssAt < B.head && B.jsAt >= 0 && B.jsAt < B.mainJs && !src.slice(B.jsAt + 1, B.mainJs).includes('<script');
  r.ver = !!ver(B.css) && ver(B.css) === ver(B.js);
  let FW = null; try { const ctx = { window: {} }; new Function('window', B.js)(ctx.window); FW = ctx.window.FW; } catch (e) {}
  r.fw = !!FW && FW.version === ver(B.js) && typeof FW.bird === 'function';
  if (expectFail) return r;
  ok(r.once, 'bundle: one fwCss and one fwJs block', { nc: B.nc, nj: B.nj });
  ok(r.place, 'bundle: the CSS in the <head> before the app stylesheet, the JS right before the main script', B);
  ok(r.ver, 'bundle: both blocks between matching markers, the same version', { css: ver(B.css), js: ver(B.js) });
  ok(r.fw, 'bundle: the JS defines window.FW with that version (' + (FW && FW.version) + ', built ' + (FW && FW.built) + ')');
  const css = B.css.replace(/\/\*[\s\S]*?\*\//g, '');
  const sels = [...css.matchAll(/([^{}]+)\{/g)].map(m => m[1].trim()).filter(s => s && !s.startsWith('@') && !/^(from|to|[\d.]+%)(\s*,\s*(from|to|[\d.]+%))*$/.test(s));
  const badCls = [...new Set(sels.flatMap(s => [...s.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)].map(m => m[1])).filter(c => !c.startsWith('fw-')))];
  const kf = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1]).filter(k => !k.startsWith('fw-'));
  const props = [...new Set([...css.matchAll(/(?<![\w-])--([\w-]+)\s*:/g)].map(m => m[1]).filter(k => !k.startsWith('fw-')))];
  const bare = sels.flatMap(s => s.split(',')).map(s => s.trim()).filter(s => s && !/\.fw-/.test(s) && s !== ':root');
  const rootOnlyFw = [...css.matchAll(/:root\s*\{([^}]*)\}/g)].every(m => m[1].split(';').map(d => d.trim()).filter(Boolean).every(d => d.startsWith('--fw-')));
  ok(!badCls.length && !kf.length && !props.length && !bare.length && rootOnlyFw, 'bundle: the CSS defines only fw- classes, keyframes and custom properties, and no rule outside them', { badCls, kf, props, bare: bare.slice(0, 5), rootOnlyFw });
  const loads = [/@import/i, /url\((?!\s*['"]?#)/i, /\bfetch\s*\(/, /XMLHttpRequest/, /importScripts/, /new\s+(Image|Worker)\b/].filter(re => re.test(B.css) || re.test(B.js)).map(String);
  ok(!loads.length, 'bundle: loads nothing (no @import, no url() but #ids, no fetch)', loads);
  // the BUNDLE FIXES for 97 on the blocks themselves, whatever the handoff folder holds (another build there, or none, skips the byte check)
  ok(!/Math\.random/.test(B.js), 'bundle: no Math.random in the JS (deterministic ids)');
  let same = null; try { const a = {}, b = {}; new Function('window', B.js)(a); new Function('window', B.js)(b);
    same = { bird: a.FW.bird({}) === b.FW.bird({}), kitty: a.FW.kitty({ take: 'cheeky' }) === b.FW.kitty({ take: 'cheeky' }) }; } catch (e) { same = String(e); }
  ok(!!same && same.bird === true && same.kitty === true, 'bundle: the same FW call on two fresh loads gives the same string (ids from a counter, not chance)', same);
  // and different from call to call (a counter, not a constant: two drawings on one page must not share a clip-path or mask id); FW.scene() is
  // left out (its ids have no counter in v4: a design-chat issue for item 103)
  let uniq = null; try { const w = {}; new Function('window', B.js)(w); const F = w.FW, ids = h => [...h.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    const calls = [['bird', F.bird({})], ['bird again', F.bird({})], ['weather bird', F.bird({ wear: F.WX_WEAR[F.WX_KINDS[1]] })], ['kitty', F.kitty({ take: 'cheeky' })], ['ashley', F.ashley({})], ['friend 0', F.friend(0, {})], ['friend 3', F.friend(3, {})]];
    const seen = new Map(), dup = [], within = []; for (const [n, h] of calls) { const l = ids(h); if (new Set(l).size !== l.length) within.push(n); for (const i of new Set(l)) { if (seen.has(i)) dup.push(i + ' (' + seen.get(i) + ', ' + n + ')'); else seen.set(i, n); } }
    uniq = { n: seen.size, dup: dup.slice(0, 6), within, birdsDiffer: calls[0][1] !== calls[1][1] }; } catch (e) { uniq = String(e); }
  ok(!!uniq && uniq.n > 0 && !uniq.dup.length && !uniq.within.length && uniq.birdsDiffer, 'bundle: ids differ from call to call (two birds, a weather bird, Kitty, Ashley, two friends: no id in two drawings)', uniq);
  const reds = [...new Set([...(B.css + '\n' + B.js).matchAll(/#(E2463F|FF4D5E)(?![0-9a-f])/gi)].map(m => m[0]))];
  ok(!reds.length, 'bundle: neither red (#E2463F, #FF4D5E) in either block: festive red is coral', reds);
  const notes = FW ? (FW.HOLIDAYS || []).flatMap(g => (Array.isArray(g) && Array.isArray(g[1]) ? g[1] : [])).filter(h => h && 'c' in h).map(h => h.id) : null;
  ok(!!FW && !('TIPS' in FW) && Array.isArray(notes) && !notes.length, 'bundle: no FW.TIPS and no holiday design notes (field c)', { tips: !!FW && 'TIPS' in FW, notes });
  const dash = [...css.matchAll(/@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g)].filter(m => /stroke-dash/.test(m[2])).map(m => m[1]);
  ok(!dash.length && [...css.matchAll(/@keyframes/g)].length > 0, 'bundle: no @keyframes animates stroke-dashoffset (fw-flow is a transform)', dash);
  const dir =process.env.FW_HANDOFF || path.join(os.homedir(), 'Dropbox/00_T/handoff');
  if (fs.existsSync(path.join(dir, 'fred-world.js'))) {
    const fc = fs.readFileSync(path.join(dir, 'fred-world.css'), 'utf8').trim(), fj = fs.readFileSync(path.join(dir, 'fred-world.js'), 'utf8').trim();
    if (ver(fj) === ver(B.js) && /built: '([^']+)'/.exec(fj)?.[1] === FW?.built) ok(fc === B.css && fj === B.js, 'bundle: each block is the handoff folder\'s file byte for byte (' + dir + ')');
    else console.log('  note: the handoff folder has a different build (' + (/built: '([^']+)'/.exec(fj) || [])[1] + ') than the page (' + (FW && FW.built) + '): byte check skipped');
  } else console.log('  note: no handoff folder at ' + dir + ' (FW_HANDOFF): byte check skipped');
  return r;
}
section('bundle', async () => {
  bundleChecks(SRC, 'page');
  const x = await openP({ motion: false });
  ok(await x.p.evaluate(() => window.__q97fw) === 'object', 'bundle: window.FW exists when the main script starts (its first line)', await x.p.evaluate(() => window.__q97fw));
  await x.close();
});

// a request logger for open()'s route hook, which sees every request from the first one on (the head, boot): a late p.on('request') would
// miss them. Off-site requests by URL; files beside the page by their path from its folder (./x.css: a file this page needs and main
// does not is one sw.js may not hold, so the page would break offline); the page itself left out
const reqLog = (s, page) => (r, u) => { if (/^(data|blob):/.test(u)) return; u = u.replace(/[?#].*$/, ''); if (!u.startsWith('file:')) { s.add(u); return; }
  let f = ''; try { f = fileURLToPath(u); } catch (e) { s.add(u); return; } if (f !== path.resolve(page)) s.add('./' + path.relative(path.dirname(path.resolve(page)), f).split(path.sep).join('/')); };
// fred world art in the page: an element with a fred world class (.fwm or fw-, html.fw-anim aside), one the hook's recorder saw put in
// (or given a fw- class) since the main script's first line, a fw- animation
const art = p => p.evaluate(LS => { const later = e => LS.some(s => e.closest(s)); const a = [...document.querySelectorAll('[class*="fw-"], .fwm')].filter(e => [...e.classList].some(c => c.startsWith('fw') && c !== 'fw-anim') && !later(e));
  const run = document.getAnimations().filter(x => !(x.effect && x.effect.target && later(x.effect.target))).map(x => String(x.animationName || '')).filter(n => n.startsWith('fw-'));
  return a.map(e => e.tagName + '.' + [...e.classList].join('.')).slice(0, 5).concat((window.__q97art || []).slice(0, 5), run.slice(0, 5)); }, LATER_SPOTS);
// the walk 'still' takes, on the page and on main alike: Plan, a Crunch, every tab the bar shows, Settings
async function walk(p, look) {
  const seen = {}; seen.plan = await look(p);
  await p.click('#calcBtn'); await p.waitForTimeout(2500); seen.results = await look(p);
  const tabs = await p.evaluate(() => [...document.querySelectorAll('nav.tabs button[data-view]')].filter(b => !b.hidden && b.getClientRects().length).map(b => b.dataset.view));
  for (const v of tabs.filter(v => v !== 'plan' && v !== 'profile')) { await p.click('nav.tabs button[data-view=' + v + ']'); await p.waitForTimeout(800); seen[v] = await look(p); }
  await toSettings(p); seen.settings = await look(p); return seen;
}
section('still', async () => {
  // the main script draws nothing: no fwMount call, no FW use (outside the bundle blocks and comments): every screen, width and sheet at once.
  // A later item's own functions may (LATER, each only on a page that has it): a call or use is judged by the function it is in
  const ms = SRC.replace(/<script id="fwJs">[\s\S]*?<\/script>/, '').replace(/<style id="fwCss">[\s\S]*?<\/style>/, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const inFn = k => (/function\s+([\w$]+)\s*\([^)]*\)\s*\{(?![\s\S]*function\s+[\w$]+\s*\()/.exec(ms.slice(Math.max(0, k - 4000), k)) || [])[1] || '', okFn = LATER_FNS;
  const calls = [...ms.matchAll(/(function\s+)?\bfwMount\s*\(/g)].filter(m => !m[1] && !okFn.includes(inFn(m.index))).map(m => ms.slice(Math.max(0, m.index - 40), m.index + 30)), fwUse = [...ms.matchAll(/\bFW\b/g)].filter(m => !okFn.includes(inFn(m.index))).map(m => ms.slice(Math.max(0, m.index - 40), m.index + 30));
  if (LATER.length) console.log('  note: later items on this page, their art allowed: ' + LATER.map(l => 'item ' + l.item + ' (' + l.spots.join(', ') + '; ' + l.fns.join(', ') + ')').join('; '));
  ok(!calls.length && !fwUse.length, 'still: the main script calls fwMount nowhere and uses no FW drawing (every screen at once)' + (LATER.length ? ', but in a later item\'s own functions (' + LATER_FNS.join(', ') + ')' : ''), { calls: calls.slice(0, 3), fwUse: fwUse.slice(0, 3) });
  const req = new Set(), x = await openP({ motion: true, route: reqLog(req, HOOKED) }), p = x.p;
  const seen = await walk(p, art);
  ok(Object.values(seen).every(a => !a.length), 'still: no fred world art anywhere the walk goes (Plan, results, every tab, Settings), none put in as a view drew', seen);
  const H0 = await H(p);
  ok(!H0.rm, 'still: html (or anything but a spot) never gets .fw-rm (it would stop the app animations)', H0);
  await x.close();
  // the screens the walk does not reach: News's race page, Volume, the computer layout, a Settings sheet (the kit's own screens, hooked)
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'q97-walk-')), hp = path.join(dir, 'null.html'); fs.copyFileSync(HOOKED, hp);
  const more = {}, NAMES = ['news-race', 'volume-season', 'desktop-plan', 'desktop-journal', 'desktop-volume', 'settings-closet'];
  try { await runScreens(async (s, y) => { more[s.name] = y.fail || !y.p ? 'not reached: ' + (y.fail || '?') : await art(y.p); }, { page: hp, only: NAMES, browser, motion: true }); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
  ok(NAMES.every(n => Array.isArray(more[n]) && !more[n].length), 'still: no fred world art on News (a race page), Volume, the computer layout (Plan, Journal, Volume) or a Settings sheet', more);
  // what the page loads, against main's after the same walk (with the main page): nothing new, off-site or beside the page
  if (MAIN) { const rq = new Set(), y = await open(MAIN, { athlete: 'A', browser, motion: true, route: reqLog(rq, MAIN) });
    await walk(y.p, async () => null); await y.close(); const extra = [...req].filter(u => !rq.has(u)); ok(!extra.length, 'still: nothing loaded that main does not load, off-site or beside the page (every request, from the head and boot on, the same walk)', { extra, page: [...req], main: [...rq] }); }
  // self-test: the logger sees a load the page makes as it opens (stylesheet links added to the head: one off-site, one beside the page)
  const f = path.join(path.dirname(PAGE), 'q97-load.html'), fc = path.join(path.dirname(PAGE), 'q97-self.css'), LINK = 'https://fonts.googleapis.com/css2';
  fs.writeFileSync(fc, '/* q97 self-test */\n'); fs.writeFileSync(f, SRC.replace('</head>', '<link rel="stylesheet" href="' + LINK + '?family=Q97">\n<link rel="stylesheet" href="q97-self.css">\n</head>'));
  const sq = new Set(), z = await open(f, { athlete: 'A', browser, motion: true, repo: REPO, route: reqLog(sq, f) }); await z.close(); fs.rmSync(f, { force: true }); fs.rmSync(fc, { force: true });
  ok(sq.has(LINK) && sq.has('./q97-self.css') && ![...sq].some(u => /q97-load\.html$/.test(u)), 'still: self-test: stylesheet links added to the head are seen, off-site and beside the page (the check sees what loads as the page opens)', [...sq]);
});

section('gate', async () => {
  const x = await openP({ motion: true }), p = x.p;
  ok((await H(p)).anim && !(await p.evaluate(() => window.__q97 && window.__q97.AOPEN && document.documentElement.dataset.moving)), 'gate: html.fw-anim with Reduce Motion off and the switch on, before any tap', await H(p));
  await p.emulateMedia({ reducedMotion: 'reduce' }); await p.waitForTimeout(150);
  ok(!(await H(p)).anim && !(await H(p)).rm, 'gate: Reduce Motion turned on while the app is open: fw-anim off (and .fw-rm on no html, body or view)', await H(p));
  await p.emulateMedia({ reducedMotion: 'no-preference' }); await p.waitForTimeout(150);
  ok((await H(p)).anim, 'gate: Reduce Motion turned off again: fw-anim back', await H(p));
  await x.close();
  const y = await openP({ motion: false });
  ok(!(await H(y.p)).anim && !(await H(y.p)).rm, 'gate: opened under Reduce Motion: no fw-anim (and no fw-rm on html, body or anything but a spot)', await H(y.p));
  await y.close();
});

section('switch', async () => {
  ok(!/const DEFAULT_SETTINGS = \{[^\n]*\bworldMotion\b/.test(SRC), 'switch: DEFAULT_SETTINGS has no worldMotion (item 96 never stamps an untouched default)');
  const x = await openP({ motion: true }), p = x.p;
  ok(!('worldMotion' in await sets(p)), 'switch: nothing stored before it is changed', await sets(p));
  await toSettings(p);
  const g = await p.evaluate(() => { const s = document.getElementById('pgT-fw'), sec = s && s.closest('section.pgroup'), rows = sec ? [...sec.querySelectorAll('.prow')] : [], b = document.getElementById('prowBtn-worldmotion');
    const r = b && b.getBoundingClientRect(), k = b && b.querySelector(':scope > .gsw-k[aria-hidden="true"]');
    return { title: s && s.textContent.trim(), sp: sec && sec.classList.contains('sp-both'), gs: sec && sec.classList.contains('gs'), rows: rows.length, label: b && b.querySelector('.prow-l').textContent.trim(), pressed: b && b.getAttribute('aria-pressed'), h: r && Math.round(r.height), shown: !!(r && r.height), after: sec && sec.nextElementSibling && sec.nextElementSibling.querySelector('.pg-t') && sec.nextElementSibling.querySelector('.pg-t').textContent.trim(),
      kind: !!(b && b.matches('.prow.prow-sw > button.prow-h.gr-swb[aria-pressed]') && k), kOn: k ? getComputedStyle(k).backgroundColor : null }; });
  ok(g.title === 'fred world' && g.sp && g.gs && g.rows === 1 && g.label === 'Animate the world' && g.pressed === 'true' && g.shown, 'switch: Settings › fred world, a box for both sports with one switch row, "Animate the world", on', g);
  ok(g.kind, 'switch: the row is drawn as a switch like Same recipe (.prow.prow-sw > button.prow-h.gr-swb[aria-pressed] > .gsw-k)', g);
  ok(g.h >= 44, 'switch: the row is at least 44 px tall', g.h);
  // titles and labels only (item 76): the group is its title and a card of switch rows, and no text shows but the title and the labels
  const grpOf = q => q.evaluate(() => { const sec = document.getElementById('pgT-fw').closest('section.pgroup'), card = document.getElementById('pgB-fw'), stray = [];
    const w = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) { const t = n.textContent.replace(/\s+/g, ' ').trim(), e = n.parentElement; if (t && e.getClientRects().length && !e.closest('#pgT-fw, .prow-l')) stray.push(t.slice(0, 60)); }
    const l = card.querySelector('.prow[data-prow=worldmotion] .prow-l');
    return { kids: [...sec.children].map(e => e.tagName.toLowerCase() + '.' + [...e.classList].join('.')), other: [...card.children].filter(e => !e.matches('.prow.prow-sw')).map(e => e.tagName.toLowerCase() + '.' + [...e.classList].join('.')), stray, label: l && l.textContent.trim() }; });
  const grpOk = c => c.kids.length === 2 && /^h2\..*\bgs-h\b/.test(c.kids[0]) && /^div\..*\bpcard\b/.test(c.kids[1]) && !c.other.length && !c.stray.length && c.label === 'Animate the world';
  const gr = await grpOf(p);
  ok(grpOk(gr), 'switch: the group holds its title and switch rows only, and shows no text but the title and the labels (no explanation line)', gr);
  await p.evaluate(() => { const e = document.createElement('p'); e.className = 'pnote'; e.id = 'q97note'; e.textContent = 'fred and friends move for a few seconds, then rest.'; document.getElementById('pgB-fw').appendChild(e); });
  const gx = await grpOf(p); await p.evaluate(() => document.getElementById('q97note').remove());
  ok(!grpOk(gx) && gx.stray.length === 1, 'switch: self-test: an explanation line added under the switch is seen', gx);
  // an app animation (ri-spin, the busy spinner) keeps running with the switch off: .fw-rm, whose rule stops every animation inside it, is on spots only
  await p.evaluate(() => { const i = document.createElement('i'); i.id = 'q97spin'; i.style.cssText = 'position:fixed;left:0;top:0;width:8px;height:8px;animation:ri-spin .8s linear infinite'; document.body.appendChild(i); });
  const spin = () => p.evaluate(() => document.getElementById('q97spin').getAnimations().filter(a => a.playState === 'running').length);
  const spin0 = await spin();
  await p.fill('#setSearch', 'animate'); await p.waitForTimeout(250);
  const sr = await p.evaluate(() => [...document.querySelectorAll('#setList .prow')].filter(r => !r.classList.contains('sf-out') && !r.hidden && r.getClientRects().length).map(r => r.dataset.prow));
  ok(sr.length === 1 && sr[0] === 'worldmotion', 'switch: searching "animate" finds it (only it)', sr);
  await p.fill('#setSearch', ''); await p.waitForTimeout(200);
  await p.click('#prowBtn-worldmotion'); await p.waitForTimeout(250);
  ok(await sw(p) === 'false' && (await sets(p)).worldMotion === false && !(await H(p)).anim && !(await H(p)).rm, 'switch: off: shown off, stored false, the gate shuts (.fw-rm on spots only)', { sw: await sw(p), v: (await sets(p)).worldMotion, h: await H(p) });
  const spin1 = await spin(); await p.evaluate(() => document.getElementById('q97spin').remove());
  ok(spin0 === 1 && spin1 === 1, 'switch: off: an app animation (ri-spin) keeps running (only the characters go still)', { on: spin0, off: spin1 });
  const kOff = await p.evaluate(() => { const k = document.querySelector('#prowBtn-worldmotion > .gsw-k'); return k ? getComputedStyle(k).backgroundColor : null; });
  ok(!!kOff && !!g.kOn && kOff !== g.kOn, 'switch: its track shows the state (another colour off than on)', { on: g.kOn, off: kOff });
  await reload(p); await p.waitForTimeout(300); await toSettings(p);
  ok(await sw(p) === 'false' && !(await H(p)).anim && !(await H(p)).rm, 'switch: still off after a reload', { sw: await sw(p), h: await H(p) });
  await p.click('#prowBtn-worldmotion'); await p.waitForTimeout(250);
  ok(await sw(p) === 'true' && (await sets(p)).worldMotion === true && (await H(p)).anim, 'switch: on again: shown on, stored true, the gate opens', { sw: await sw(p), v: (await sets(p)).worldMotion, h: await H(p) });
  // forced colours (Windows High Contrast: no backgrounds, no shadows), light and dark: the switch still shows (its track an edge, its knob
  // another colour than the track) and on looks different from off
  const fcs = {}; for (const cs of ['light', 'dark']) { await p.emulateMedia({ forcedColors: 'active', colorScheme: cs }); await p.waitForTimeout(200);
    const k = p.locator('#prowBtn-worldmotion > .gsw-k'); await k.scrollIntoViewIfNeeded();
    const st = () => p.evaluate(() => { const k = document.querySelector('#prowBtn-worldmotion > .gsw-k'), s = getComputedStyle(k), a = getComputedStyle(k, '::after'), edge = parseFloat(s.outlineWidth) > 0 && s.outlineStyle !== 'none' ? s.outlineColor : parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none' ? s.borderTopColor : null;
      return { track: s.backgroundColor, edge, knob: a.backgroundColor, page: getComputedStyle(document.body).backgroundColor }; });
    const on = await k.screenshot(), son = await st(); await p.click('#prowBtn-worldmotion'); await p.waitForTimeout(300); const off = await k.screenshot(), soff = await st(); await p.click('#prowBtn-worldmotion'); await p.waitForTimeout(300);
    fcs[cs] = { on: son, off: soff, differ: !on.equals(off) }; }
  await p.emulateMedia({ forcedColors: 'none', colorScheme: 'light' }); await p.waitForTimeout(150);
  const seen = v => !!v.edge && v.edge !== v.page && v.knob !== v.track;
  ok(Object.values(fcs).every(v => v.differ && seen(v.on) && seen(v.off)), 'switch: in forced colours (light and dark) it still shows (an edge, a knob unlike its track) and on looks different from off', fcs);
  // forced colours, light and dark: keyboard focus still shows on every switch drawn this way: Animate the world (its ring on its button)
  // and Fluid limits' No limit (input.gsw, its label no ring of its own), off and on: the area round it differs focused against blurred
  // (the edge rule once took the input's focus ring); a self-test puts that edge back over the ring and sees it
  const fcFocus = async (sel, on) => { if (on != null) await p.evaluate(([s, c]) => { document.querySelector(s).checked = c; }, [sel, on]);
    await p.locator(sel).scrollIntoViewIfNeeded(); await p.focus(sel); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await p.waitForTimeout(150);
    const at = await p.evaluate(s => { const e = document.activeElement; return e === document.querySelector(s) && e.matches(':focus-visible'); }, sel);
    const b = await p.locator(sel).boundingBox(), clip = { x: Math.max(0, b.x - 8), y: Math.max(0, b.y - 8), width: b.width + 16, height: b.height + 16 };
    const f = await p.screenshot({ clip }); await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.waitForTimeout(150); const u = await p.screenshot({ clip });
    return { at, differ: !f.equals(u) }; };
  const fcf = {}; for (const cs of ['light', 'dark']) { await p.emulateMedia({ forcedColors: 'active', colorScheme: cs }); await p.waitForTimeout(200); fcf[cs + ' Animate the world'] = await fcFocus('#prowBtn-worldmotion'); }
  await p.emulateMedia({ forcedColors: 'none', colorScheme: 'light' }); await p.click('#view-profile .prow[data-prow="fluidlim"] .prow-h'); await until(() => p.evaluate(() => document.getElementById('setSheet').classList.contains('open'))); await p.waitForTimeout(400);
  const nl0 = await p.evaluate(() => ['flNo-min', 'flNo-max'].map(id => document.getElementById(id).checked));
  for (const cs of ['light', 'dark']) { await p.emulateMedia({ forcedColors: 'active', colorScheme: cs }); await p.waitForTimeout(200);
    for (const id of ['flNo-min', 'flNo-max']) for (const on of [false, true]) fcf[cs + ' ' + id + (on ? ' on' : ' off')] = await fcFocus('#' + id, on); }
  await p.emulateMedia({ forcedColors: 'active', colorScheme: 'light' }); await p.evaluate(() => { const s = document.createElement('style'); s.id = 'q97fcbug'; s.textContent = '@media (forced-colors:active){ input.gsw{outline:1px solid ButtonText !important; outline-offset:-1px !important} }'; document.head.appendChild(s); });
  const fcBug = await fcFocus('#flNo-min', false); await p.evaluate(() => document.getElementById('q97fcbug').remove());
  await p.evaluate(v => ['flNo-min', 'flNo-max'].forEach((id, i) => { document.getElementById(id).checked = v[i]; }), nl0);
  await p.emulateMedia({ forcedColors: 'none', colorScheme: 'light' }); await p.waitForTimeout(150);
  ok(Object.values(fcf).every(v => v.at && v.differ), 'switch: in forced colours (light and dark) keyboard focus shows on Animate the world and on both No limit switches, off and on (focused differs from blurred)', fcf);
  ok(fcBug.at && !fcBug.differ, 'switch: self-test: an edge rule that takes a No limit switch focus ring is seen (focused looks the same as blurred)', fcBug);
  await x.close();
  const y = await openP({ motion: false }); await toSettings(y.p);
  ok(await sw(y.p) === 'true' && !(await H(y.p)).anim && !(await H(y.p)).rm, 'switch: under Reduce Motion it shows its own state (on) and the gate stays shut', { sw: await sw(y.p), h: await H(y.p) });
  const st = async q => ({ sw: await sw(q), v: (await sets(q)).worldMotion, h: await H(q) });
  await y.p.click('#prowBtn-worldmotion'); await y.p.waitForTimeout(250); const r1 = await st(y.p);
  ok(r1.sw === 'false' && r1.v === false && !r1.h.anim && !r1.h.rm, 'switch: under Reduce Motion a tap still turns it off (shown off, stored false), the gate stays shut', r1);
  await y.p.click('#prowBtn-worldmotion'); await y.p.waitForTimeout(250); const r2 = await st(y.p);
  ok(r2.sw === 'true' && r2.v === true && !r2.h.anim && !r2.h.rm, 'switch: under Reduce Motion, on again: shown on, stored true, the gate stays shut', r2);
  await y.p.click('#prowBtn-worldmotion'); await y.p.waitForTimeout(250); await y.p.emulateMedia({ reducedMotion: 'no-preference' }); await y.p.waitForTimeout(200); const r3 = await st(y.p);
  ok(r3.sw === 'false' && r3.v === false && !r3.h.anim && !r3.h.rm, 'switch: turned off under Reduce Motion, then Reduce Motion off: the switch keeps the gate shut', r3);
  await y.close();
  // at 320 px with 150% and 200% text (the round rules): the group scrolled to, its row 44 px or more, its text uncut, nothing sideways
  for (const scale of [1.5, 2]) { const z = await openP({ motion: true, width: 320, scale }); await toSettings(z.p);
    const m = await z.p.evaluate(() => { document.querySelector('#view-profile .sg-fw').scrollIntoView({ block: 'center' }); const b = document.getElementById('prowBtn-worldmotion'), l = b.querySelector('.prow-l'), r = b.getBoundingClientRect(), D = document.documentElement;
      const cut = [b, l].filter(e => e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1).map(e => e.tagName + '.' + e.className + ' ' + e.scrollHeight + '/' + e.clientHeight + ' ' + e.scrollWidth + '/' + e.clientWidth);
      return { h: Math.round(r.height), top: Math.round(r.top), lines: Math.round(l.getBoundingClientRect().height), cut, side: D.scrollWidth - D.clientWidth }; });
    ok(m.h >= 44 && !m.cut.length && m.side <= 1 && m.top >= 0 && m.top < 844, 'switch: at 320 px with ' + scale * 100 + '% text: the row is 44 px or more, its text uncut, nothing scrolls sideways', m); await z.close(); }
});

const BIRD = 'window.FW.bird({})', BIRD2 = "window.FW.bird({wear: window.FW.WX_WEAR[window.FW.WX_KINDS[1]]})";
section('mount', async () => {
  const x = await openP({ motion: true }), p = x.p; await p.waitForTimeout(300);
  ok(await p.evaluate(() => !!window.__q97 && typeof window.__q97.fwMount === 'function'), 'mount: fwMount is in the page');
  await spot(p, 'q97a'); const t0 = Date.now(); await mount(p, 'q97a', BIRD, 'bird:plain');
  // a spot below the fold, mounted now and first scrolled to long after (below): its settle must count from then, not from now
  await spot(p, 'q97b', true); await mount(p, 'q97b', BIRD);
  // Kitty tail (fw-swish, 4 s: 0 to -4 to 3 and back to 0 degrees since the 17:29 build) ends at rest: no jump in the frame its loop comes off
  await spot(p, 'q97t'); await p.evaluate(() => { const el = document.getElementById('q97t'); window.__q97.fwMount(el, window.FW.kitty({ take: 'cheeky' }), 'kitty');
    const T = window.__q97tail = { prev: null, live: false, jump: null, at: null, end: null }, s = performance.now();
    const rot = e => { const m = new DOMMatrix(getComputedStyle(e).transform); return Math.atan2(m.b, m.a) * 180 / Math.PI; };
    const tick = () => { const e = el.querySelector('.fw-kitty-tail'); if (e) { const live = e.getAnimations().some(a => a.animationName === 'fw-swish'), r = rot(e);
        if (T.live && !live && T.jump == null) { T.jump = Math.round(Math.abs(r - T.prev) * 10) / 10; T.at = Math.round(performance.now() - s); T.end = Math.round(T.prev * 10) / 10; } T.live = live; T.prev = r; }
      if (performance.now() - s < 8400) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  const a0 = await until(() => look(p, 'q97a').then(l => l && l.go && l.running ? l : null), 1500);
  ok(!!a0 && a0.fwm && a0.hid === 'true' && a0.svg, 'mount: on screen: its spot (.fwm, aria-hidden) moves at once (.fwm-go, fw- loops running)', a0 || await look(p, 'q97a'));
  await sleep(Math.max(0, 5500 - (Date.now() - t0))); const a1 = await look(p, 'q97a');
  ok(a1.go && a1.running > 0, 'mount: still moving at 5.5 s (rule a: about 6-8 s)', a1);
  await sleep(Math.max(0, 8600 - (Date.now() - t0))); const a2 = await look(p, 'q97a');
  ok(!a2.go && a2.all === 0, 'mount: by 8.5 s it has settled: .fwm-go off, no fw- animation left (each part at rest)', a2);
  const tail = await p.evaluate(() => window.__q97tail);
  ok(tail.jump != null && tail.jump < 2, 'mount: Kitty tail ends its last round at rest: it moves under 2 degrees in the frame its loop comes off', tail);
  await mount(p, 'q97a', BIRD, 'bird:plain'); await p.waitForTimeout(400); const a3 = await look(p, 'q97a');
  ok(a3.tag === a2.tag && !a3.go, 'mount: a fresh FW call with the same key: kept (the same nodes), no new move', { before: a2.tag, after: a3.tag, go: a3.go });
  const lazy = await p.evaluate(() => { let n = 0; window.__q97.fwMount(document.getElementById('q97a'), () => { n++; return window.FW.bird({}); }, 'bird:plain'); return n; });
  ok(lazy === 0, 'mount: the same key with a draw function: the function is not called (nothing is built)', lazy);
  await p.evaluate(() => { window.__q97s1 = window.FW.bird({}); }); await spot(p, 'q97g'); await p.evaluate(() => window.__q97.fwMount(document.getElementById('q97g'), window.__q97s1));
  await p.waitForTimeout(8700); const g0 = await look(p, 'q97g'); await p.evaluate(() => window.__q97.fwMount(document.getElementById('q97g'), window.__q97s1)); await p.waitForTimeout(400); const g1 = await look(p, 'q97g');
  ok(g0.tag === g1.tag && !g1.go, 'mount: the very same string again (no key): kept, no new move', { g0, g1 });
  await mount(p, 'q97g', null);
  await mount(p, 'q97a', BIRD2, 'bird:other'); const a4 = await until(() => look(p, 'q97a').then(l => l && l.go ? l : null), 1500);
  ok(!!a4 && a4.tag !== a3.tag && a4.running > 0, 'mount: a new key: a new drawing, and it moves again', a4 || await look(p, 'q97a'));
  await hidePage(p, true); await p.waitForTimeout(150); const a4h = await look(p, 'q97a'); await hidePage(p, false);
  ok(a4h.off && a4h.running === 0, 'mount: the replaced drawing pauses like the first: the page hidden while it moves, paused (.mo-off)', a4h);
  await mount(p, 'q97a', null); const a5 = await look(p, 'q97a');
  ok(a5.kids === 0 && !a5.fwm && !a5.go && !(await p.evaluate(() => window.__q97.FWM.has(document.getElementById('q97a')))), "mount: '' empties the spot and lets it go", a5);
  // below the fold (mounted with q97a, long ago): still and paused until seen, with no settle timer and nothing for inView to watch
  const b0 = await look(p, 'q97b'), bw = await p.evaluate(() => { const el = document.getElementById('q97b'), r = window.__q97.FWM.get(el); return { t: r && r.t, due: r && r.due, iv: !!window.__q97.IV.w.get(el) }; });
  ok(!b0.go && b0.off && b0.running === 0, 'mount: a spot below the fold waits still and paused (.mo-off)', b0);
  ok(bw.t === 0 && bw.due === true && !bw.iv, 'mount: while it waits far below: no settle timer yet, and nothing for inView to watch (no scroll work for it)', bw);
  const tS = Date.now(); await p.evaluate(() => document.getElementById('q97b').scrollIntoView({ block: 'center' })); const b1 = await until(() => look(p, 'q97b').then(l => l && l.go && l.running ? l : null), 3000); const tS1 = Date.now();
  ok(!!b1 && !b1.off, 'mount: scrolled to, it moves', b1 || await look(p, 'q97b'));
  const pA = Date.now(); await p.evaluate(() => window.scrollTo(0, 0)); const b2 = await until(() => look(p, 'q97b').then(l => l && l.off ? l : null), 3000);
  ok(!!b2 && b2.running === 0, 'mount: scrolled away while moving, it pauses', b2 || await look(p, 'q97b'));
  await p.evaluate(() => document.getElementById('q97b').scrollIntoView({ block: 'center' })); await until(() => look(p, 'q97b').then(l => l && !l.off), 3000); const pB = Date.now();
  const hA = Date.now(); await hidePage(p, true); await p.waitForTimeout(150); const b3 = await look(p, 'q97b');
  ok(b3.off && b3.running === 0, 'mount: the page hidden: paused', b3);
  await hidePage(p, false); const paused = (pB - pA) + (Date.now() - hA); await p.waitForTimeout(150);
  // its settle counts from when it was seen, not from its mount (some 20 s before), in the time it plays (paused, its move waits too):
  // still moving at 5.5 s, settled by 8.5 s of play
  await sleep(Math.max(0, tS + 5500 - Date.now())); const b4 = await look(p, 'q97b');
  ok(b4.go && b4.running > 0, 'mount: the settle counts from when it is seen: still moving 5.5 s after it was scrolled to (mounted long before)', b4);
  await sleep(Math.max(0, tS1 + 8600 + paused - Date.now())); const b5 = await look(p, 'q97b');
  ok(!b5.go && b5.all === 0, 'mount: ... and settled by 8.5 s of play after it was seen (.fwm-go off, no fw- animation left; ' + paused + ' ms paused)', b5);
  // its drawing replaced (a new key) while it is off screen: it waits still and paused like a first one, moves when seen, pauses when scrolled away
  await p.evaluate(() => window.scrollTo(0, 0)); await until(() => look(p, 'q97b').then(l => l && l.off), 3000);
  await mount(p, 'q97b', BIRD2, 'bird:b2'); await p.waitForTimeout(700); const r0 = await look(p, 'q97b');
  ok(r0.off && !r0.go && r0.running === 0, 'mount: a drawing replaced while off screen waits still and paused (.mo-off), like a first one', r0);
  await p.evaluate(() => document.getElementById('q97b').scrollIntoView({ block: 'center' })); const r1 = await until(() => look(p, 'q97b').then(l => l && l.go && l.running ? l : null), 3000);
  ok(!!r1 && !r1.off && r1.tag !== b5.tag, 'mount: the replaced drawing, scrolled to, moves', r1 || await look(p, 'q97b'));
  await p.evaluate(() => window.scrollTo(0, 0)); const r2 = await until(() => look(p, 'q97b').then(l => l && l.off ? l : null), 3000);
  ok(!!r2 && r2.running === 0, 'mount: the replaced drawing, scrolled away while it moves, pauses', r2 || await look(p, 'q97b'));
  // the same string in a second spot is reported; a spot taken out of the page is let go
  const before = x.errors.length; await spot(p, 'q97c'); await p.evaluate(() => { window.__q97s = window.FW.bird({}); window.__q97.fwMount(document.getElementById('q97c'), window.__q97s); });
  await spot(p, 'q97d'); await p.evaluate(() => window.__q97.fwMount(document.getElementById('q97d'), window.__q97s)); await p.waitForTimeout(200);
  const rep = x.errors.slice(before).filter(e => /already in another spot/.test(e));
  ok(rep.length >= 1, 'mount: the very same string in a second spot is reported (its SVG ids would repeat)', x.errors.slice(before));
  x.errors.splice(before);
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
  await spot(p, 'q97h'); await p.evaluate(() => window.__q97.fwMount(document.getElementById('q97h'), window.FW.bird({}), 'bird:flap', { cls: 'fw-bird' }));
  const h0 = await until(() => p.evaluate(() => { const el = document.getElementById('q97h'); return el.classList.contains('fwm-go') && el.getAnimations({ subtree: true }).some(a => a.animationName === 'fw-ch-flap' && a.playState === 'running') ? [...el.classList].join(' ') : null; }), 2000);
  ok(!!h0 && /\bfw-bird\b/.test(h0), 'mount: o.cls: a spot with the bundle wrapper class fw-bird flaps (fw-ch-flap runs while it moves)', h0 || await look(p, 'q97h'));
  await p.evaluate(() => window.__q97.fwMount(document.getElementById('q97h'), window.FW.bird({}), 'bird:plain2')); const h1 = await p.evaluate(() => [...document.getElementById('q97h').classList].join(' '));
  ok(!/fw-bird/.test(h1), 'mount: replaced without o.cls: the wrapper class comes off', h1);
  await mount(p, 'q97h', null);
  await spot(p, 'q97s'); await p.evaluate(() => window.__q97.fwMount(document.getElementById('q97s'), window.FW.bird({}), 'avatar', { still: true })); await p.waitForTimeout(1500); const s0 = await look(p, 'q97s');
  ok(s0.fwm && !s0.go && s0.all === 0, 'mount: o.still: on screen, never moves', s0);
  await mount(p, 'q97s', null);
  // every drawing (each look of fred: holidays, weather wear, the champagne's fizz circles that carry no class), bare and in its wrapper class
  const loose = await p.evaluate(async () => { const F = window.FW, v = document.querySelector('#view-plan'), box = document.createElement('div'); box.id = 'q97loose'; v.prepend(box);
    const hol = (F.HOLIDAYS || []).flatMap(g => (Array.isArray(g) && Array.isArray(g[1]) ? g[1] : [])).filter(h => h && h.id), out = { n: 0, run: {} };
    const looks = [['bird', () => F.bird({}), 'fw-bird'], ['champ', () => F.bird({ champ: true }), 'fw-bird'], ...F.WX_KINDS.map(k => ['wear ' + k, () => F.bird({ wear: F.WX_WEAR[k] }), 'fw-bird']),
      ...hol.map(h => ['holiday ' + h.id, () => F.bird(Object.assign({}, h)), 'fw-bird']), ['ashley', () => F.ashley({}), 'fw-ashley'], ['kitty', () => F.kitty({ take: 'cheeky' }), ''],
      ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => ['friend ' + i, () => F.friend(i, {}), 'fw-vm4']), ['scene', () => F.scene('t', ''), 'fw-scene']];
    const ds = []; for (const [n, f, c] of looks) for (const w of ['', c]) { const d = document.createElement('div'); if (w) d.className = w; d.style.cssText = '--fw-d:-.4s;width:120px;height:120px'; try { d.innerHTML = f(); } catch (e) { continue; } box.append(d); ds.push([n + (w ? ' in .' + w : ''), d]); out.n++; }
    await new Promise(r => setTimeout(r, 900)); /* (more than one fizz round) */
    ds.forEach(([n, d]) => { const a = d.getAnimations({ subtree: true }).filter(x => x.playState === 'running').map(x => x.animationName); if (a.length) out.run[n] = a.slice(0, 4); }); box.remove(); return out; });
  ok(loose.n >= 30 && !Object.keys(loose.run).length && (await H(p)).anim, 'mount: art put in without fwMount never moves (html.fw-anim alone would loop it): every drawing, bare and in its wrapper class, its classless parts too (' + loose.n + ')', loose);
  await p.evaluate(() => { document.getElementById('q97c').remove(); document.getElementById('q97d').remove(); }); await spot(p, 'q97e'); await mount(p, 'q97e', BIRD);
  const kept = await p.evaluate(() => [...window.__q97.FWM.keys()].map(e => e.id));
  ok(!kept.includes('q97c') && !kept.includes('q97d'), 'mount: spots taken out of the page are let go at the next mount', kept);
  // a spot mounted before it is put in the page (made, mounted, then inserted), seen, then taken out by a render with no fwMount call between
  const L = await p.evaluate(async () => { const Q = window.__q97, v = document.querySelector('#view-plan'), d = document.createElement('div'); d.id = 'q97L'; d.style.cssText = 'width:200px;height:160px';
    Q.fwMount(d, window.FW.bird({}), 'bird:L'); v.prepend(d); await new Promise(r => setTimeout(r, 800)); const moved = d.classList.contains('fwm-go'); d.remove(); await new Promise(r => setTimeout(r, 100));
    const e = document.createElement('div'); e.id = 'q97M'; e.style.cssText = 'width:200px;height:160px'; v.prepend(e); Q.fwMount(e, window.FW.bird({}), 'bird:M'); await new Promise(r => setTimeout(r, 0)); const kept = Q.FWM.has(d); Q.fwMount(e, ''); e.remove(); return { moved, kept }; });
  ok(L.moved && !L.kept, 'mount: a spot mounted before it was put in the page, seen, then taken out by a render, is let go at the next mount (once its code is done)', L);
  await x.close();
});

// a new app open while the page stays put: 31 minutes away
const appOpen = async p => { await hidePage(p, true); await p.evaluate(() => { const D = Date.now; window.__q97now = D; Date.now = () => D() + 31 * 60e3; });
  await hidePage(p, false); await p.evaluate(() => { Date.now = window.__q97now; }); };
section('keep', async () => {
  const x = await openP({ motion: true }), p = x.p; await p.waitForTimeout(300);
  // kept spots a render takes out and puts back: two and three in one box, each way a render may do it, re-rendered three times (the same keys)
  const WAYS = { empty: 'emptying the box, then mounting and appending each', append: 'emptying the box, then appending and mounting each', fragment: 'building a fragment, then replaceChildren' };
  const k = await p.evaluate(async () => {
    const Q = window.__q97, v = document.querySelector('#view-plan'), tick = () => new Promise(r => setTimeout(r, 0)), frames = n => new Promise(r => { const f = i => i ? requestAnimationFrame(() => f(i - 1)) : r(); f(n); }), out = {};
    for (const [mode, nn] of [['empty', 2], ['empty', 3], ['append', 2], ['append', 3], ['fragment', 2], ['fragment', 3]]) {
      const box = document.createElement('div'); box.style.cssText = 'display:flex;flex-wrap:wrap'; v.prepend(box);
      const S = Array.from({ length: nn }, () => { const d = document.createElement('div'); d.style.cssText = 'width:90px;height:90px'; return d; }), n = S.map(() => 0);
      const draw = i => () => { n[i]++; return window.FW.bird({}); };
      const render = () => { if (mode === 'fragment') { const f = document.createDocumentFragment(); S.forEach((s, i) => { Q.fwMount(s, draw(i), 'bird:' + i); f.append(s); }); box.replaceChildren(f); return; }
        box.textContent = ''; S.forEach((s, i) => { if (mode === 'append') box.append(s); Q.fwMount(s, draw(i), 'bird:' + i); if (mode === 'empty') box.append(s); }); };
      render(); await tick(); await frames(2); const rec = S.map(s => Q.FWM.get(s)), first = S.map(s => s.firstElementChild);
      for (let r = 0; r < 3; r++) { render(); await tick(); await frames(2); }
      out[mode + nn] = { mode, nn, draws: n, kept: S.map((s, i) => !!rec[i] && Q.FWM.get(s) === rec[i]), same: S.map((s, i) => !!first[i] && s.firstElementChild === first[i]), lv: S.map(s => Q.LV.m.has(s)), conn: S.every(s => s.isConnected) };
      S.forEach(s => Q.fwMount(s, '')); box.remove(); await tick();
    }
    return out; });
  for (const r of Object.values(k)) ok(r.draws.every(d => d === 1) && r.kept.every(Boolean) && r.same.every(Boolean) && r.lv.every(Boolean) && r.conn,
    'keep: ' + (r.nn === 2 ? 'two' : 'three') + ' kept spots in one box, re-rendered by ' + WAYS[r.mode] + ': kept (draw() not called again, the same record and nodes, still with loopWhileVisible)', r);
  // a render run twice in one task (empty the box, build a spot, mount it, append it): only the spot in the page is kept, the same key or a new one
  const d = await p.evaluate(async () => {
    const Q = window.__q97, v = document.querySelector('#view-plan'), tick = () => new Promise(r => setTimeout(r, 0)), frames = n => new Promise(r => { const f = i => i ? requestAnimationFrame(() => f(i - 1)) : r(); f(n); }), out = {};
    for (const keys of [['bird:d', 'bird:d'], ['bird:x', 'bird:y']]) {
      const box = document.createElement('div'); v.prepend(box); const made = [];
      const render = k => { box.textContent = ''; const s = document.createElement('div'); s.style.cssText = 'width:90px;height:90px'; made.push(s); Q.fwMount(s, window.FW.bird({}), k); box.append(s); };
      for (let r = 0; r < 3; r++) { render(keys[0]); render(keys[1]); await tick(); await frames(2); }
      out[keys.join(' then ')] = { kept: made.filter(s => Q.FWM.has(s)).length, outKept: made.filter(s => !s.isConnected && (Q.FWM.has(s) || Q.LV.m.has(s))).length, inPage: made.filter(s => s.isConnected && Q.FWM.has(s) && Q.LV.m.has(s)).length };
      made.forEach(s => { if (Q.FWM.has(s)) Q.fwMount(s, ''); }); box.remove(); await tick();
    }
    return out; });
  for (const [keys, r] of Object.entries(d)) ok(r.kept === 1 && r.outKept === 0 && r.inPage === 1, 'keep: a render run twice in one task, three times (' + keys + '): only the spot in the page is kept (FWM, loopWhileVisible)', r);
  // spots mounted in the page in one task read no layout each (loopWhileVisible's guess would lay the page out once per drawing)
  const lay = await p.evaluate(() => { const Q = window.__q97, v = document.querySelector('#view-plan'), box = document.createElement('div'); v.prepend(box);
    const S = [0, 1, 2].map(() => { const s = document.createElement('div'); s.style.cssText = 'width:90px;height:90px'; box.append(s); return s; });
    const g = Element.prototype.getBoundingClientRect; let n = 0; Element.prototype.getBoundingClientRect = function () { if (S.includes(this)) n++; return g.call(this); };
    try { S.forEach((s, i) => Q.fwMount(s, window.FW.bird({}), 'bird:l' + i)); } finally { Element.prototype.getBoundingClientRect = g; }
    const reg = S.every(s => Q.LV.m.has(s) && Q.FWM.has(s)); S.forEach(s => Q.fwMount(s, '')); box.remove(); return { reads: n, reg }; });
  ok(lay.reads === 0 && lay.reg, 'keep: spots mounted in the page in one task read no layout each (no getBoundingClientRect for a spot), and are registered with loopWhileVisible', lay);
  // a render that writes its spot's className whole (as the weather card writes its box's), then mounts the same look, mid-move; and one that
  // writes it with no fwMount call after: fwMount's classes come back (the render's own stay), and the move carries on (the same loops)
  const W = await p.evaluate(async () => { const Q = window.__q97, v = document.querySelector('#view-plan'), s = document.createElement('div'), u = document.createElement('div'); s.id = 'q97W'; u.id = 'q97U';
    [s, u].forEach(e => { e.style.cssText = 'width:120px;height:120px'; v.prepend(e); }); window.scrollTo(0, 0); let n = 0;
    const render = () => { s.className = 'my-fred'; Q.fwMount(s, () => { n++; return window.FW.bird({}); }, 'bird:sun', { cls: 'fw-bird' }); };
    render(); Q.fwMount(u, window.FW.bird({}), 'bird:u', { cls: 'fw-bird' });
    for (let i = 0; i < 40 && !(s.classList.contains('fwm-go') && u.classList.contains('fwm-go')); i++) await new Promise(r => setTimeout(r, 50));
    await new Promise(r => setTimeout(r, 400)); const run = e => e.getAnimations({ subtree: true }).filter(a => a.playState === 'running'), a0 = run(s), b0 = run(u);
    render(); u.className = 'their-box'; await new Promise(r => setTimeout(r, 0)); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const a1 = run(s), b1 = run(u);
    return { draws: n, cls: s.className, ucls: u.className, same: a0.length > 0 && a1.length === a0.length && a1.every(a => a0.includes(a)), usame: b0.length > 0 && b1.length === b0.length && b1.every(a => b0.includes(a)) }; });
  ok(W.draws === 1 && /^my-fred\b/.test(W.cls) && ['fwm', 'fw-bird', 'fwm-go'].every(c => W.cls.split(' ').includes(c)) && W.same, 'keep: a render that writes the spot\'s className whole, then mounts the same look, mid-move: .fwm, its wrapper class and .fwm-go come back (its own class stays), not drawn again, the same loops carry on', W);
  ok(/^their-box\b/.test(W.ucls) && ['fwm', 'fw-bird', 'fwm-go'].every(c => W.ucls.split(' ').includes(c)) && W.usame, 'keep: ... and a className written with no fwMount call after: the classes come back too, and the loops carry on', W);
  await p.emulateMedia({ media: 'print' }); const Wp = await p.evaluate(() => ['q97W', 'q97U'].map(id => [...document.getElementById(id).children].map(c => getComputedStyle(c).display).join()));
  await p.emulateMedia({ media: 'screen', forcedColors: 'active' }); const Wf = await p.evaluate(() => ['q97W', 'q97U'].map(id => [...document.getElementById(id).children].map(c => getComputedStyle(c).display).join()));
  await p.emulateMedia({ media: 'screen', forcedColors: 'none' });
  ok(Wp.every(d => d === 'none') && Wf.every(d => d === 'none'), 'keep: ... their art is still hidden in print and in forced colours', { print: Wp, forced: Wf });
  await p.waitForTimeout(8600); const r0 = await p.evaluate(() => ['q97W', 'q97U'].map(id => document.getElementById(id).classList.contains('fwm-go')));
  await appOpen(p); const W2 = await until(() => p.evaluate(() => ['q97W', 'q97U'].every(id => { const e = document.getElementById(id); return e.classList.contains('fwm-go') && e.getAnimations({ subtree: true }).some(a => a.playState === 'running'); })), 3000);
  ok(r0.every(g => !g) && !!W2, 'keep: ... both settle, and a new app open moves them once more (they are still spots)', { settled: r0, replay: W2 });
  // a render that emptied the spot (replaceChildren), then mounts the same look: drawn again, not left empty
  const E = await p.evaluate(async () => { const Q = window.__q97, s = document.getElementById('q97W'); let n = 0; s.replaceChildren(); Q.fwMount(s, () => { n++; return window.FW.bird({}); }, 'bird:sun', { cls: 'fw-bird' });
    const out = { draws: n, svg: !!s.querySelector('svg'), fwm: s.classList.contains('fwm') }; ['q97W', 'q97U'].forEach(id => Q.fwMount(document.getElementById(id), '')); return out; });
  ok(E.draws === 1 && E.svg && E.fwm, 'keep: a render that emptied the spot, then mounts the same look: drawn again (not left empty)', E);
  await x.close();
});

section('start', async () => {
  const x = await openP({ motion: true }), p = x.p; await p.waitForTimeout(300);
  // a row of spots at the top of Plan: Kitty, Ashley, a crew friend (fw-vm4: his right arm pumps, a phase offset on him that puts his bob
  // just past its round start), o.still, two to take out of the page and put back, a crew friend bouncing (fw-vm2) offset to near the top
  // of his bounce, and two pumping crew with offsets in the same half of the pump (-1.44 s, -1.24 s: they must not pump in step)
  const IDS = ['q97K', 'q97A', 'q97C', 'q97V', 'q97O', 'q97N', 'q97B', 'q97D', 'q97E'], MOVE = ['q97K', 'q97A', 'q97C', 'q97O', 'q97N', 'q97B', 'q97D', 'q97E'];
  await p.evaluate(IDS => { const v = document.querySelector('#view-plan'), row = document.createElement('div'); row.id = 'q97row'; row.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px';
    for (const id of IDS) { const d = document.createElement('div'); d.id = id; d.style.cssText = 'width:120px;height:120px'; row.appendChild(d); } v.prepend(row); window.scrollTo(0, 0); }, IDS);
  // each frame: whether .fwm-go is on, and the angle of Kitty tail, Ashley front arm, the crew friends' right arms, and the top edge of the
  // bobbing and bouncing friends (from their spot's top: a bob is a translate)
  const PARTS = [['q97K', '.fw-kitty-tail', 'kitty tail'], ['q97A', '.fw-ch-arm-f', 'ashley arm'], ['q97C', '.fw-ch-arm-r', 'crew arm'], ['q97C', '.fw-ch', 'crew bob', 1], ['q97B', '.fw-ch', 'crew bounce', 1], ['q97D', '.fw-ch-arm-r', 'crew D arm'], ['q97E', '.fw-ch-arm-r', 'crew E arm']];
  const rec = () => p.evaluate(PARTS => { const R = window.__q97rec = { f: [], on: true };
    const rot = e => { const t = getComputedStyle(e).transform; if (!t || t === 'none') return 0; const m = new DOMMatrix(t); return Math.atan2(m.b, m.a) * 180 / Math.PI; };
    const tick = () => { if (!R.on) return; R.f.push(PARTS.map(([id, sel, n, top]) => { const el = document.getElementById(id), e = el && el.querySelector(sel); if (!e) return null;
      const v = top ? e.getBoundingClientRect().top - el.getBoundingClientRect().top : rot(e); return [el.classList.contains('fwm-go') ? 1 : 0, Math.round(v * 100) / 100]; })); requestAnimationFrame(tick); };
    requestAnimationFrame(tick); }, PARTS);
  // per part: the frame .fwm-go goes on against the still frame before it, the largest step from one frame to the next after it; and the
  // largest gap between the two pumping crew (in step: none)
  const jumps = () => p.evaluate(PARTS => { const R = window.__q97rec; R.on = false; const out = PARTS.map(([id, sel, name, top], k) => { const f = R.f.map(v => v[k]);
    const i = f.findIndex((v, j) => j > 0 && v && v[0] && f[j - 1] && !f[j - 1][0]); if (i < 0) return { name, none: true, frames: f.length };
    let step = 0; for (let j = i + 1; j < f.length; j++) if (f[j] && f[j - 1] && f[j][0] && f[j - 1][0]) step = Math.max(step, Math.abs(f[j][1] - f[j - 1][1]));
    return { name, top: !!top, rest: f[i - 1][1], at: f[i][1], jump: Math.round(Math.abs(f[i][1] - f[i - 1][1]) * 100) / 100, step: Math.round(step * 100) / 100, frames: f.length - i }; });
    const d = PARTS.findIndex(v => v[2] === 'crew D arm'), e = PARTS.findIndex(v => v[2] === 'crew E arm'); let gap = 0; R.f.forEach(v => { if (v[d] && v[e] && v[d][0] && v[e][0]) gap = Math.max(gap, Math.abs(v[d][1] - v[e][1])); });
    return { parts: out, gap: Math.round(gap * 100) / 100 }; }, PARTS);
  const calm = j => j.parts.every(v => !v.none && (v.top ? v.jump < .5 : v.jump < 2 && Math.abs(v.rest) < .5) && v.step < 3); /* (every frame after: their own motion is under 1.5 a frame; a jump was 5-11) */
  await rec();
  await p.evaluate(() => { const Q = window.__q97, F = window.FW, $ = id => document.getElementById(id);
    Q.fwMount($('q97K'), F.kitty({ take: 'cheeky' }), 'kitty'); Q.fwMount($('q97A'), F.ashley({}), 'ashley', { cls: 'fw-ashley' });
    $('q97C').style.setProperty('--fw-d', '-.37s'); Q.fwMount($('q97C'), F.friend(3, {}), 'crew:3', { cls: 'fw-vm4' });
    Q.fwMount($('q97V'), F.bird({}), 'avatar', { still: true }); Q.fwMount($('q97O'), F.bird({}), 'bird:O'); Q.fwMount($('q97N'), F.bird({}), 'bird:N');
    $('q97B').style.setProperty('--fw-d', '-.45s'); Q.fwMount($('q97B'), F.friend(4, {}), 'crew:4', { cls: 'fw-vm2' });
    $('q97D').style.setProperty('--fw-d', '-1.44s'); Q.fwMount($('q97D'), F.friend(5, {}), 'crew:5', { cls: 'fw-vm4' });
    $('q97E').style.setProperty('--fw-d', '-1.24s'); Q.fwMount($('q97E'), F.friend(6, {}), 'crew:6', { cls: 'fw-vm4' });
    window.__q97orphan = document.createElement('div'); Q.fwMount(window.__q97orphan, F.bird({}), 'bird:orphan'); });
  const t0 = Date.now(); await until(() => p.evaluate(ids => ids.every(id => document.getElementById(id).classList.contains('fwm-go')), MOVE), 3000); await p.waitForTimeout(3000);
  const j0 = await jumps();
  ok(calm(j0), 'start: motion starts with no jump: Kitty tail, Ashley wave, crew pumps move under 2 degrees in the frame .fwm-go goes on (from the still pose: each loop waits for the start of its round, its rest pose); a crew bob and bounce offset into their round under 0.5 px; no frame jumps in the 3 s after (under 3 a frame)', j0);
  ok(j0.gap > 2, 'start: crew keep their own phase: two pumping with offsets in the same half (-1.44 s, -1.24 s) are not in step (their arms more than 2 degrees apart at some frame)', j0.gap);
  // settled, two are taken out of the page for 300 ms (loopWhileVisible lets them go) and put back: one mounted again with the same key, one not
  await sleep(Math.max(0, t0 + 8800 - Date.now()));
  const back = await p.evaluate(async () => { const Q = window.__q97, row = document.getElementById('q97row'), O = document.getElementById('q97O'), N = document.getElementById('q97N');
    O.remove(); N.remove(); await new Promise(r => setTimeout(r, 300)); const out = { O: Q.LV.m.has(O), N: Q.LV.m.has(N) };
    row.appendChild(O); row.appendChild(N); Q.fwMount(O, () => window.FW.bird({}), 'bird:O'); await new Promise(r => setTimeout(r, 0));
    return { lvWhileOut: out, kept: Q.FWM.has(O) && Q.FWM.has(N), lvO: Q.LV.m.has(O), settled: ['q97K', 'q97A', 'q97C', 'q97O', 'q97N', 'q97B', 'q97D', 'q97E'].every(id => !document.getElementById(id).classList.contains('fwm-go')) }; });
  ok(!back.lvWhileOut.O && !back.lvWhileOut.N && back.kept && back.lvO && back.settled, 'start: a kept spot out of the page 300 ms (loopWhileVisible let it go), put back and mounted again with the same key: kept, and registered with loopWhileVisible again', back);
  // a new app open while they rest on screen: they move once more, again with no jump; o.still does not
  await rec(); const n0 = await p.evaluate(() => window.__q97.AOPEN.n);
  await appOpen(p);
  const w = await p.evaluate(() => { const Q = window.__q97, V = document.getElementById('q97V'), r = Q.FWM.get(V); return { n: Q.AOPEN.n, kept: !!r, due: !!(r && r.due), watched: Q.IV.w.has(V), go: V.classList.contains('fwm-go'), orphan: Q.FWM.has(window.__q97orphan) }; });
  ok(w.n === n0 + 1 && w.kept && !w.due && !w.watched && !w.go, 'start: o.still at a new app open: kept, not waiting to be seen, not watched (it never moves)', w);
  ok(!w.orphan, 'start: a spot mounted and never put in the page is let go at a new app open', w);
  const moving = await until(() => p.evaluate(ids => ids.every(id => { const e = document.getElementById(id); return e.classList.contains('fwm-go') && e.getAnimations({ subtree: true }).some(a => a.playState === 'running'); }), MOVE), 3000);
  await p.waitForTimeout(2000); const j1 = await jumps();
  ok(!!moving && calm(j1), 'start: a new app open plays them again as they rest on screen: under 2 degrees (a bob 0.5 px) in the frame .fwm-go goes on, and no frame jumps after it', { moving, j1 });
  await hidePage(p, true); await p.waitForTimeout(150); const O1 = await look(p, 'q97O'), N1 = await look(p, 'q97N'); await hidePage(p, false);
  ok(O1.go && O1.off && O1.running === 0 && N1.go && N1.off && N1.running === 0, 'start: put back after 300 ms out (mounted again with the same key, or not at all): the page hidden during its next move, it pauses (.mo-off)', { O1, N1 });
  const V1 = await look(p, 'q97V'); await p.waitForTimeout(1500); const V2 = await look(p, 'q97V');
  ok(V1.fwm && !V1.go && V1.all === 0 && !V2.go && V2.all === 0, 'start: o.still stays still while the others move once more after the new app open', { V1, V2 });
  await x.close();
});

// a moving spot's loops made anew by the browser, and its move paused (review round 3): Kitty spots at the top of Plan, each in its own
// box (a render empties the box, mounts the spot with the same key and puts it back), and each tail's angle every frame from the frame
// .fwm-go goes on: [ms, .fwm-go, angle (null while its view is not showing), an endless loop on it]
section('life', async () => {
  const x = await openP({ motion: true }), p = x.p; await p.waitForTimeout(300);
  await p.evaluate(() => { const v = document.querySelector('#view-plan'), Q = window.__q97, R = window.__q97life = {};
    const rot = e => { const t = getComputedStyle(e).transform; if (!t || t === 'none') return 0; const m = new DOMMatrix(t); return Math.atan2(m.b, m.a) * 180 / Math.PI; };
    window.__q97rr = id => { const b = document.getElementById(id + 'box'), s = document.getElementById(id); b.textContent = ''; Q.fwMount(s, () => window.FW.kitty({ take: 'cheeky' }), 'kitty:' + id); b.append(s); };
    window.__q97kit = ids => { const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:4px'; v.prepend(row); window.scrollTo(0, 0);
      ids.forEach(id => { const b = document.createElement('div'), s = document.createElement('div'); b.id = id + 'box'; s.id = id; s.style.cssText = 'width:110px;height:110px'; b.append(s); row.append(b); R[id] = { f: [], t0: 0 }; window.__q97rr(id); }); };
    const tick = () => { for (const [id, r] of Object.entries(R)) { if (r.done) continue; const s = document.getElementById(id), e = s && s.querySelector('.fw-kitty-tail'), go = s.classList.contains('fwm-go');
        if (go && !r.t0) r.t0 = performance.now(); if (!r.t0) continue; const t = performance.now() - r.t0, shown = s.getClientRects().length > 0;
        r.f.push([Math.round(t), go ? 1 : 0, shown && e ? Math.round(rot(e) * 100) / 100 : null, e && e.getAnimations().some(a => a.effect.getTiming().iterations === Infinity) ? 1 : 0]); if (t > 16000) r.done = true; }
      requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  const T = async id => { await until(() => p.evaluate(id => window.__q97life[id].t0 > 0, id), 3000); const t = Date.now(); return ms => sleep(Math.max(0, t + ms - Date.now())); };
  // the largest step from one frame to the next while shown, when .fwm-go came off, whether an endless loop ran after a time, whether it moved after .fwm-go came off
  const sum = (id, after) => p.evaluate(([id, after]) => { const f = window.__q97life[id].f, s = document.getElementById(id); let step = 0, at = null;
    for (let i = 1; i < f.length; i++) if (f[i][2] != null && f[i - 1][2] != null) { const d = Math.abs(f[i][2] - f[i - 1][2]); if (d > step) { step = d; at = [f[i - 1], f[i]]; } }
    const off = f.findIndex((v, i) => i && !v[1] && f[i - 1][1]), rest = off < 0 ? [] : f.slice(off).filter(v => v[2] != null);
    return { step: Math.round(step * 100) / 100, at, off: off < 0 ? null : f[off][0], endless: f.filter(v => v[0] > after && v[3]).length, movedAfter: rest.some(v => Math.abs(v[2] - rest[0][2]) > .01), go: s.classList.contains('fwm-go'), loops: s.getAnimations({ subtree: true }).length }; }, [id, after]);
  // a render takes the moving spot out and puts it back: at 1 s and 2.6 s (L1), at 6.5 s, after the 6 s step (L2)
  await p.evaluate(() => window.__q97kit(['q97L1', 'q97L2'])); const at = await T('q97L1');
  await at(1000); await p.evaluate(() => window.__q97rr('q97L1')); await at(2600); await p.evaluate(() => window.__q97rr('q97L1'));
  await at(6500); await p.evaluate(() => window.__q97rr('q97L2')); await at(9000);
  const a1 = await sum('q97L1', 6300), a2 = await sum('q97L2', 6300);
  ok(a1.step < 2 && a1.off != null && !a1.endless && !a1.movedAfter && !a1.go && !a1.loops, 'life: a render that takes a moving spot out and puts it back (the same key) at 1 s and 2.6 s: its loops, made anew, carry on (under 2 degrees a frame), and it settles as before', a1);
  ok(a2.step < 2 && a2.off != null && !a2.endless && !a2.movedAfter && !a2.go && !a2.loops, 'life: ... and at 6.5 s, after the 6 s step: no endless loop again, no jump, still once .fwm-go is off', a2);
  // its view left mid-move (Journal at 5.4 s), back at 6.6 s
  await p.evaluate(() => window.__q97kit(['q97L3'])); const bt = await T('q97L3');
  await bt(5400); await p.click('nav.tabs button[data-view=journal]'); await bt(6600); await p.click('nav.tabs button[data-view=plan]'); await p.evaluate(() => window.scrollTo(0, 0)); await bt(9000);
  const b = await sum('q97L3', 5600);
  ok(b.step < 2 && b.off != null && b.off < 6600 && !b.endless && !b.movedAfter && !b.go && !b.loops, 'life: its view left mid-move (Journal at 5.4 s, back at 6.6 s): it came to rest unseen, and back on Plan it is still (nothing loops again or snaps at 8 s)', b);
  // scrolled far away at 2 s, back at 7.3 s: paused meanwhile, its move counts the time it plays
  await p.evaluate(() => { const d = document.createElement('div'); d.style.height = '4000px'; document.querySelector('#view-plan').append(d); window.__q97kit(['q97L4']); }); const ct = await T('q97L4');
  await ct(2000); const away = Date.now(); await p.evaluate(() => window.scrollTo(0, 3800)); await ct(7300); await p.evaluate(() => window.scrollTo(0, 0)); const paused = Date.now() - away;
  await ct(7900); const c0 = await p.evaluate(() => { const s = document.getElementById('q97L4'); return { go: s.classList.contains('fwm-go'), run: s.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length }; });
  ok(c0.go && c0.run > 0, 'life: scrolled away at 2 s and back at 7.3 s: it still moves at 7.9 s (its move counts the time it plays, not the time it was paused)', c0);
  await ct(8000 + paused + 1000); const c = await sum('q97L4', 1e9);
  ok(c.step < 2 && c.off != null && !c.movedAfter && !c.go && !c.loops, 'life: ... and it settles with no jump (under 2 degrees a frame, the frame its loop comes off too) by 8 s of play', { c, paused });
  await x.close();
});

section('rules', async () => {
  const x = await openP({ motion: true }), p = x.p; await p.waitForTimeout(300);
  await spot(p, 'q97a'); await mount(p, 'q97a', BIRD); await until(() => look(p, 'q97a').then(l => l && l.go), 1500);
  await toSettings(p); await p.click('#prowBtn-worldmotion'); await p.waitForTimeout(200);
  const a = await look(p, 'q97a');
  ok(!a.go && a.rm && a.all === 0 && !(await H(p)).rm, 'rules: the switch off while it moves: it stops at once (.fw-rm on the spot, not on html, body or a view)', { a, h: await H(p) });
  await p.click('nav.tabs button[data-view=plan]'); await p.waitForTimeout(400);
  await spot(p, 'q97f'); await mount(p, 'q97f', BIRD2); await p.waitForTimeout(1200); const f = await look(p, 'q97f');
  ok(!f.go && f.rm && f.all === 0, 'rules: mounted while the switch is off: it never moves', f);
  await toSettings(p); await p.click('#prowBtn-worldmotion'); await p.waitForTimeout(200); await p.click('nav.tabs button[data-view=plan]'); await p.waitForTimeout(1200);
  const f2 = await look(p, 'q97f'), a2 = await look(p, 'q97a');
  ok(!f2.go && !f2.rm && !a2.go && !a2.rm, 'rules: the switch on again: no .fw-rm, and nothing already seen restarts (it moves again only when what it shows changes)', { f2, a2 });
  // back after a short time away: not a new app open, so nothing already seen moves again
  await p.evaluate(() => window.scrollTo(0, 0)); const n0 = await p.evaluate(() => window.__q97.AOPEN.n);
  await hidePage(p, true); await p.waitForTimeout(300); await hidePage(p, false); await p.waitForTimeout(1000);
  const sa = await look(p, 'q97a'), sf = await look(p, 'q97f'), n1 = await p.evaluate(() => window.__q97.AOPEN.n);
  ok(!sa.go && sa.all === 0 && !sf.go && sf.all === 0 && n1 === n0, 'rules: back after a short time away (not a new app open): nothing already seen moves again', { sa, sf, n0, n1 });
  // a kept drawing below the fold: seen (it moves), then scrolled away
  await spot(p, 'q97k', true); await mount(p, 'q97k', BIRD, 'bird:k');
  await p.evaluate(() => document.getElementById('q97k').scrollIntoView({ block: 'center' })); await until(() => look(p, 'q97k').then(l => l && l.go && l.running), 3000);
  await p.evaluate(() => window.scrollTo(0, 0)); await until(() => look(p, 'q97k').then(l => l && l.off), 3000);
  // a new app open (31 minutes away) while the rider is on the Journal: every kept drawing waits to be seen, still, and with Plan not
  // showing inView has nothing of theirs to watch (no scroll work on the Journal)
  await p.click('nav.tabs button[data-view=journal]'); await p.waitForTimeout(500);
  await hidePage(p, true); await p.evaluate(() => { const D = Date.now; window.__q97now = D; Date.now = () => D() + 31 * 60e3; });
  await hidePage(p, false); await p.evaluate(() => { Date.now = window.__q97now; }); await p.waitForTimeout(500);
  const ids = ['q97a', 'q97f', 'q97k'];
  const w = await p.evaluate(ids => { const Q = window.__q97, E = ids.map(id => document.getElementById(id)); return { n: Q.AOPEN.n, due: ids.filter((id, i) => (Q.FWM.get(E[i]) || {}).due), watched: ids.filter((id, i) => Q.IV.w.has(E[i])), go: ids.filter((id, i) => E[i].classList.contains('fwm-go')) }; }, ids);
  ok(w.n === n0 + 1 && w.due.length === 3 && !w.watched.length && !w.go.length, 'rules: a new app open (31 minutes away) on another tab: each kept drawing waits to be seen, still, with nothing for inView to watch while Plan is not showing', w);
  // back on Plan: the drawing on screen moves once more; the one below the fold stays still until it is seen
  await p.click('nav.tabs button[data-view=plan]'); await p.evaluate(() => window.scrollTo(0, 0));
  const g = await until(() => look(p, 'q97a').then(l => l && l.go && l.running ? l : null), 2000); const tG = Date.now();
  ok(!!g, 'rules: back on Plan after the new app open: a kept drawing on screen moves once more when seen', g || await look(p, 'q97a'));
  const k0 = await look(p, 'q97k');
  ok(!k0.go && k0.all === 0, 'rules: ... the kept drawing below the fold stays still until it is seen (no .fwm-go off screen)', k0);
  // the settle counts from when each is seen: the one below the fold is scrolled to 3.5 s later
  await sleep(Math.max(0, tG + 3500 - Date.now()));
  const tK = Date.now(); await p.evaluate(() => document.getElementById('q97k').scrollIntoView({ block: 'center' }));
  const k1 = await until(() => look(p, 'q97k').then(l => l && l.go && l.running ? l : null), 3000); const tK1 = Date.now();
  ok(!!k1, 'rules: scrolled to, the kept drawing below the fold moves once more', k1 || await look(p, 'q97k'));
  await sleep(Math.max(0, tG + 8600 - Date.now())); const a9 = await look(p, 'q97a');
  ok(a9.go && a9.off && a9.running === 0, 'rules: the drawing that moved once more, scrolled away at 3.5 s mid-move, waits paused (its move counts the time it plays)', a9);
  await sleep(Math.max(0, tK + 5500 - Date.now())); const k2 = await look(p, 'q97k');
  ok(k2.go && k2.running > 0, 'rules: the settle counts from when it is seen: the one scrolled to later still moves 5.5 s after', k2);
  await sleep(Math.max(0, tK1 + 8600 - Date.now())); const k3 = await look(p, 'q97k');
  ok(!k3.go && k3.all === 0, 'rules: ... and has settled by 8.5 s after it was seen', k3);
  await p.evaluate(() => window.scrollTo(0, 0)); const a10 = await until(() => look(p, 'q97a').then(l => l && !l.go && l.all === 0 ? l : null), 7000);
  ok(!!a10, 'rules: the one scrolled away mid-move, back on screen, plays the rest of its move and settles (.fwm-go off, no fw- animation left)', a10 || await look(p, 'q97a'));
  await x.close();
  const y = await openP({ motion: false }), q = y.p; await q.waitForTimeout(300);
  await spot(q, 'q97a'); await mount(q, 'q97a', BIRD); await q.waitForTimeout(1200); const r = await look(q, 'q97a');
  ok(!r.go && r.rm && r.all === 0 && !(await H(q)).rm, 'rules: under Reduce Motion a drawing never moves and gets .fw-rm (the bundle\'s still state)', { r, h: await H(q) });
  const hiddenBits = await q.evaluate(() => { const d = document.createElement('div'); d.className = 'fwm fw-rm'; d.innerHTML = '<svg><g class="fw-wx-drop"></g><g class="fw-fall"></g><g class="fw-wx-flake"></g></svg>'; document.body.appendChild(d);
    const v = [...d.querySelectorAll('g')].map(e => getComputedStyle(e).display); d.remove(); return v; });
  ok(hiddenBits.every(v => v === 'none'), 'rules: in a still spot drops, flakes and falling pieces are hidden (item 87 §8)', hiddenBits);
  await y.close();
});

section('media', async () => {
  const x = await openP({ motion: true }), p = x.p; await p.waitForTimeout(300);
  await spot(p, 'q97a'); await mount(p, 'q97a', BIRD); await p.waitForTimeout(300);
  const m = async () => p.evaluate(() => { const el = document.getElementById('q97a'), r = el.getBoundingClientRect(); return { box: Math.round(r.height), art: [...el.children].map(c => getComputedStyle(c).display) }; });
  await p.emulateMedia({ media: 'print' }); const pr = await m();
  await p.emulateMedia({ media: 'screen', forcedColors: 'active' }); const fc = await m();
  await p.emulateMedia({ media: 'screen', forcedColors: 'none' }); const sc = await m();
  ok(pr.art.every(d => d === 'none') && pr.box > 0, 'media: print: no art, the spot\'s box stays', pr);
  ok(fc.art.every(d => d === 'none') && fc.box > 0, 'media: forced colours: no art, the spot\'s box stays', fc);
  ok(sc.art.every(d => d !== 'none'), 'media: on screen the art shows', sc);
  await x.close();
});

section('sync', async () => {
  const be = new Backend(), file = path.join(path.dirname(PAGE), 'q97-sync.html'); fs.writeFileSync(file, syncPageSource(SRC));
  const who = { uid: 'u1', email: 'u1@example.com', displayName: 'Test u1' };
  const dev = async label => { const storage = { '__mock_user': who, '__mock_auth': 'u1', 'bluebird.owner.v1': { uid: 'u1', name: who.displayName, email: who.email, photo: '', signedIn: true } };
    const d = await open(file, { athlete: 'A', browser, motion: true, repo: REPO, settle: 1200, storage, route: be.handler(label) }); ERRS.push(d.errors); d.p.on('dialog', z => z.accept()); return d; };
  const doc = () => be.fs.get('users/u1') || {};
  const A = await dev('a'); await until(() => doc().settings, 20000);
  const B = await dev('b'); await until(() => B.p.evaluate(() => { const o = JSON.parse(localStorage.getItem('bluebird.synccursor.v1') || 'null'); return !!(o && o.full); }), 20000);
  // an unrelated save on a device that never touched the switch: no worldMotion goes up
  await toSettings(B.p); await B.p.click('#view-profile .prow[data-prow="profile"] .prow-h'); await B.p.waitForTimeout(500);
  await B.p.evaluate(() => { const e = document.getElementById('pRaceName'); e.value = 'Q97 Racer'; e.dispatchEvent(new Event('change', { bubbles: true })); });
  await until(() => (doc().settings || {}).raceName === 'Q97 Racer', 20000);
  const d0 = doc();
  ok((d0.settings || {}).raceName === 'Q97 Racer' && !('worldMotion' in (d0.settings || {})) && !('worldMotion' in (d0.settingsAt || {})), 'sync: an unrelated save uploads no worldMotion (no value, no stamp)', { raceName: (d0.settings || {}).raceName, wm: (d0.settings || {}).worldMotion, at: (d0.settingsAt || {}).worldMotion });
  await toSettings(A.p); await A.p.click('#prowBtn-worldmotion'); await A.p.waitForTimeout(300);
  await until(() => (doc().settings || {}).worldMotion === false, 20000);
  ok((doc().settings || {}).worldMotion === false && !!(doc().settingsAt || {}).worldMotion, 'sync: A turns it off: the cloud has worldMotion false with its own stamp', { v: (doc().settings || {}).worldMotion, at: (doc().settingsAt || {}).worldMotion });
  const got = await until(async () => { await B.p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); return (await sets(B.p)).worldMotion === false && !(await H(B.p)).anim; }, 40000, 1500);
  await toSettings(B.p);
  ok(!!got && await sw(B.p) === 'false' && !(await H(B.p)).rm, 'sync: B pulls: stored off, its gate shuts, its switch shows off', { v: (await sets(B.p)).worldMotion, h: await H(B.p), sw: await sw(B.p) });
  await A.close(); await B.close();
});

section('restore', async () => {
  const x = await openP({ motion: true }), p = x.p;
  const s = await sets(p), lib = await LS(p, 'bluebird.library.v5');
  const f = path.join(os.tmpdir(), 'q97-backup-' + process.pid + '.json');
  fs.writeFileSync(f, JSON.stringify({ app: 'bluebird-fuel', kind: 'all', exported: '2026-11-06', settings: Object.assign({}, s, { worldMotion: false }), library: lib, journal: [], races: [] }));
  await toSettings(p); await p.setInputFiles('#backupFile', f); await until(async () => (await sets(p)).worldMotion === false, 8000);
  await p.waitForTimeout(300);
  ok((await sets(p)).worldMotion === false && !(await H(p)).anim && !(await H(p)).rm && await sw(p) === 'false', 'restore: a backup with the switch off: stored off, the gate shuts, the switch shows off', { v: (await sets(p)).worldMotion, h: await H(p), sw: await sw(p) });
  fs.rmSync(f, { force: true }); await x.close();
});

// a class put on html, body or a view restyles that element, not all inside it (review round 5): Chrome restyles everything inside an
// element whose class changes when a rule matches the class attribute ([class*="fw-"]) with any element (*) after it, as round 3's
// guard did (8,380 elements for ten toggles on html or body: a ps-open sheet, a tab, a tap). Counted from the trace (UpdateLayoutTree
// elementCount, steadier than timing), on a large screen (Plan with its sheet open), against main's when given; a self-test puts
// that guard back
const RESTYLE = 'body svg[class*="fw-"]:not(.fwm *) *{animation:none!important}';
async function restyled(page, guard) {
  const s = screens.find(x => x.name === 'plan-adjust'), o = await openScreen(page, s, { browser }); if (page === PAGE) ERRS.push(o.errors);
  try {
    if (o.fail || o.skip) return { fail: o.fail || o.skip };
    const p = o.p, c = await o.ctx.newCDPSession(p); await c.send('Performance.enable');
    if (guard) await p.evaluate(g => { const st = document.createElement('style'); st.textContent = g; document.head.appendChild(st); document.body.offsetWidth; }, guard);
    const out = { n: await p.evaluate(() => document.getElementsByTagName('*').length) };
    for (const [k, sel] of [['html', 'document.documentElement'], ['body', 'document.body'], ['view', 'document.querySelector(".view.active")']]) {
      await p.evaluate(() => document.body.offsetWidth);
      await c.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReturnAsStream' });
      const m0 = (await c.send('Performance.getMetrics')).metrics.find(m => m.name === 'RecalcStyleDuration').value;
      await p.evaluate(sel => { const e = (0, eval)(sel); for (let i = 0; i < 10; i++) { e.classList.toggle('q97-none'); document.body.offsetWidth; } }, sel);
      const m1 = (await c.send('Performance.getMetrics')).metrics.find(m => m.name === 'RecalcStyleDuration').value;
      const done = new Promise(r => c.once('Tracing.tracingComplete', r)); await c.send('Tracing.end'); const { stream } = await done;
      let t = ''; for (;;) { const r = await c.send('IO.read', { handle: stream }); t += r.data; if (r.eof) break; } await c.send('IO.close', { handle: stream });
      let ev = JSON.parse(t); ev = ev.traceEvents || ev;
      const el = ev.filter(e => e.name === 'UpdateLayoutTree').map(e => e.args && (e.args.elementCount != null ? e.args.elementCount : e.args.endData && e.args.endData.elementCount)).filter(v => v != null).reduce((a, v) => a + v, 0);
      out[k] = { el, ms: +((m1 - m0) * 1000).toFixed(2) };
    }
    return out;
  } finally { await o.close(); }
}
section('restyle', async () => {
  const r = await restyled(PAGE), m = MAIN ? await restyled(MAIN) : null, bad = await restyled(PAGE, RESTYLE);
  // ten toggles each: no more than main restyles (one a toggle, without main) plus one per cent of the page a toggle
  const lim = (k, o) => ((m && !m.fail ? m[k].el : 10) + o.n / 10);
  const fine = o => !o.fail && ['html', 'body', 'view'].every(k => o[k].el <= lim(k, o));
  ok(fine(r), 'restyle: a class put on html, body or a view restyles that element, not the whole page (elements restyled, ten toggles each' + (m ? ', against main' : '') + ')', { page: r, main: m });
  ok(!bad.fail && !fine(bad), 'restyle: self-test: the round 3 guard ([class*="fw-"] ... *) put back is seen (the whole page restyled)', bad);
});

section('main', async () => {
  if (!MAIN) { console.log('  note: no main page given: the main checks are skipped'); return; }
  if (/<script id="fwJs">/.test(fs.readFileSync(MAIN, 'utf8'))) { console.log('  note: the main page already has item 97 (<script id="fwJs">): the main checks (they need a main from before it) are skipped'); return; }
  const r = bundleChecks(fs.readFileSync(MAIN, 'utf8'), 'main', true);
  ok(!r.once && !r.fw, 'main: main has no bundle (the bundle checks fail there)', r);
  const y = await open(MAIN, { athlete: 'A', browser, motion: true }); await toSettings(y.p);
  const m = { anim: (await H(y.p)).anim, sw: await sw(y.p) };
  ok(!m.anim && m.sw === null, 'main: no gate and no switch on main (the gate and switch checks fail there)', m);
  await y.close();
});

for (const [n, f] of sections) {
  if (ONLY.length && !ONLY.includes(n)) continue;
  console.log('-- ' + n);
  try { await f(); } catch (e) { ok(false, n + ': threw', String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); }
}
const errs = ERRS.flat(); /* (the one report mount expects is taken out there: any other duplicate-spot report fails the run) */
ok(!errs.length, 'no page errors or console errors', errs.slice(0, 8));
await browser.close();
C.done('item 97: fred world, the bundle, motion plumbing and switch');
