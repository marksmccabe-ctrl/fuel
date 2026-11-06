// node q97.test.mjs <null.html> [main null.html]   (cd into this folder first) -- item 97: fred world: the bundle, motion plumbing and
// switch. Every numbered point and QA line:
//   cache    sw.js CACHE and APP_BUILD match, v121 or later
//   bundle   point 1: the page has the design chat's bundle exactly once, each file whole in its own block between its markers: the CSS in
//            <style id="fwCss"> in the <head>, before the app's own stylesheet; the JS in <script id="fwJs"> before the app's main script,
//            so window.FW exists when the main script starts (checked from its first line); both blocks carry the same version, and the JS
//            defines FW with it; nothing in the CSS reaches outside the bundle's own fw- names (every class, keyframe and custom property it
//            defines starts with fw-; no rule for html, body or a bare element); neither block loads anything (no @import, no url() other
//            than #id, no fetch). When the design chat's handoff folder is on this machine (FW_HANDOFF, else ~/Dropbox/00_T/handoff), each
//            block is that folder's file, byte for byte (a newer build there is a note, not a failure)
//   still    "No visual change in this item except the new switch": no fred world art anywhere in the app (Plan, results, Journal,
//            Settings, Races), no console errors, nothing loaded that main doesn't load
//   gate     point 2: html.fw-anim when Reduce Motion is off and the switch is on (before any tap: not motionOK); off under Reduce Motion;
//            it follows Reduce Motion changing while the app is open, both ways
//   switch   point 3: Settings has a "fred world" group in item 80's style (a titled box, both sports) with one switch row, "Animate the
//            world", on; 44 px tall; search finds it; nothing is stored until it is changed (no worldMotion key, and DEFAULT_SETTINGS has
//            none); off: stored false, the gate shuts, and it stays off after a reload; on again: stored true, the gate opens; under Reduce
//            Motion the switch keeps its own state and the gate stays shut
//   mount    point 2: fwMount (reached through a hooked copy of the page: the plumbing has no screen yet): a drawing on screen gets its spot
//            (.fwm, aria-hidden), starts moving at once (.fwm-go, fw- animations running), is still moving at 5.5 s, and by 8.5 s has
//            settled (no fw- animation left, .fwm-go off); the same look again changes nothing (same nodes, no new move): the same string,
//            or a fresh FW call (new id numbers) with the same key, whose draw function is not even called; a new key replaces the drawing
//            and it moves again; '' empties the spot; a spot below the fold waits still and paused (.mo-off) until it is
//            scrolled to, then moves; scrolled away it pauses; a hidden page pauses it; a second spot given the very same string is
//            reported (its ids would repeat); a spot a render took out of the page is let go
//   rules    the round's rules a) and c)-e): the switch turned off while a drawing moves stops it at once (.fw-rm on the spot, nothing
//            running); a drawing mounted while it is off never moves; turning it on again does not restart a settled drawing; a new app
//            open (back after 30 minutes away) lets a kept drawing move once more when seen; under Reduce Motion a drawing never moves and
//            gets .fw-rm (the bundle's still state: drops, flakes and falling pieces hidden); .fw-rm is only ever on spots, never on html
//            (the bundle's .fw-rm * would stop the app's own animations)
//   media    print and forced colours: no art, the spot's box stays
//   sync     the switch syncs (item 96, key by key): A turns it off; B (signed in, its own copy never changed) pulls and shuts its gate,
//            its switch shows off; an unrelated save on a device that never touched it uploads no worldMotion (no stamp, no value)
//   restore  a backup with the switch off, restored: the gate shuts and the switch shows off
//   main     (with [main null.html]) the same bundle, switch and gate checks fail on main, so this test can tell
// Q97_ONLY=section,section runs some sections.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { open, checker, reload } from '../lib/open.mjs';
import { Backend, syncPageSource } from '../q91/fbmock.mjs';

const PAGE = path.resolve(process.argv[2] || '../../fred97/null.html'), MAIN = process.argv[3] ? path.resolve(process.argv[3]) : null;
const ONLY = (process.env.Q97_ONLY || '').split(',').filter(Boolean);
const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = process.env.Q97_REPO || path.resolve(HERE, '../../wt-q97');
const C = checker('q97 '), ok = C.ok, ERRS = [];
const SRC = fs.readFileSync(PAGE, 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000, step = 100) { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); } catch (e) { v = null; } if (v) return v; await sleep(step); } return v; }
const browser = await chromium.launch();

// the hooked copy: the plumbing lives inside the app's strict-mode function, so a page can't reach it; this copy hands it out (as
// tests/engine/harness.mjs does for the engine) and records, from the main script's first line, whether window.FW is there yet
const HOOK = "\nwindow.__q97fw=typeof window.FW; Object.defineProperty(window,'__q97',{configurable:true,get(){ return {fwMount, fwGate, fwOn, FWM, AOPEN, get settings(){ return settings; }}; }});\n";
function hooked(page) { const src = fs.readFileSync(page, 'utf8'), k = src.indexOf("\n'use strict';\n"); if (k < 0) throw new Error("no 'use strict' line in " + page);
  const f = path.join(path.dirname(page), 'q97-hook.html'), at = k + "\n'use strict';".length; fs.writeFileSync(f, src.slice(0, at) + HOOK + src.slice(at)); return f; }
const HOOKED = hooked(PAGE);
const openP = (o = {}) => open(o.file || HOOKED, Object.assign({ athlete: 'A', browser, motion: true, repo: REPO }, o)).then(x => { ERRS.push(x.errors); x.p.on('dialog', d => d.accept()); return x; });
const LS = (p, k) => p.evaluate(n => { try { return JSON.parse(localStorage.getItem(n)); } catch (e) { return null; } }, k);
const sets = p => LS(p, 'bluebird.settings.v2').then(v => v || {});
const H = p => p.evaluate(() => ({ anim: document.documentElement.classList.contains('fw-anim'), rm: document.documentElement.classList.contains('fw-rm') }));
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
  const dir = process.env.FW_HANDOFF || path.join(os.homedir(), 'Dropbox/00_T/handoff');
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

section('still', async () => {
  const x = await openP({ motion: true }), p = x.p, req = new Set();
  p.on('request', r => { const u = r.url(); if (!/^(file|data|blob):/.test(u)) req.add(u.replace(/\?.*$/, '')); });
  const art = () => p.evaluate(() => { const a = [...document.querySelectorAll('[class*="fw-"], .fwm')].filter(e => [...e.classList].some(c => c.startsWith('fw') && c !== 'fw-anim')); return a.map(e => e.tagName + '.' + [...e.classList].join('.')).slice(0, 5); });
  const seen = {};
  seen.plan = await art(p);
  await p.click('#calcBtn'); await p.waitForTimeout(2500); seen.results = await art(p);
  for (const v of ['journal', 'races']) { const b = await p.$('nav.tabs button[data-view=' + v + ']'); if (b) { await b.click(); await p.waitForTimeout(600); seen[v] = await art(p); } }
  await toSettings(p); seen.settings = await art(p);
  ok(Object.values(seen).every(a => !a.length), 'still: no fred world art anywhere in the app (Plan, results, Journal, Races, Settings)', seen);
  const H0 = await H(p);
  ok(!H0.rm, 'still: html never gets .fw-rm (it would stop the app\'s own animations)', H0);
  await x.close();
  // what the page loads, against main's (with the main page): nothing new
  if (MAIN) { const y = await open(MAIN, { athlete: 'A', browser, motion: true }), rq = new Set(); y.p.on('request', r => { const u = r.url(); if (!/^(file|data|blob):/.test(u)) rq.add(u.replace(/\?.*$/, '')); });
    await y.p.click('#calcBtn'); await y.p.waitForTimeout(2500); await y.close(); const extra = [...req].filter(u => !rq.has(u)); ok(!extra.length, 'still: nothing loaded that main does not load', extra); }
});

section('gate', async () => {
  const x = await openP({ motion: true }), p = x.p;
  ok((await H(p)).anim && !(await p.evaluate(() => window.__q97 && window.__q97.AOPEN && document.documentElement.dataset.moving)), 'gate: html.fw-anim with Reduce Motion off and the switch on, before any tap', await H(p));
  await p.emulateMedia({ reducedMotion: 'reduce' }); await p.waitForTimeout(150);
  ok(!(await H(p)).anim, 'gate: Reduce Motion turned on while the app is open: fw-anim off', await H(p));
  await p.emulateMedia({ reducedMotion: 'no-preference' }); await p.waitForTimeout(150);
  ok((await H(p)).anim, 'gate: Reduce Motion turned off again: fw-anim back', await H(p));
  await x.close();
  const y = await openP({ motion: false });
  ok(!(await H(y.p)).anim && !(await H(y.p)).rm, 'gate: opened under Reduce Motion: no fw-anim (and no fw-rm on html)', await H(y.p));
  await y.close();
});

section('switch', async () => {
  ok(!/const DEFAULT_SETTINGS = \{[^\n]*\bworldMotion\b/.test(SRC), 'switch: DEFAULT_SETTINGS has no worldMotion (item 96 never stamps an untouched default)');
  const x = await openP({ motion: true }), p = x.p;
  ok(!('worldMotion' in await sets(p)), 'switch: nothing stored before it is changed', await sets(p));
  await toSettings(p);
  const g = await p.evaluate(() => { const s = document.getElementById('pgT-fw'), sec = s && s.closest('section.pgroup'), rows = sec ? [...sec.querySelectorAll('.prow')] : [], b = document.getElementById('prowBtn-worldmotion');
    const r = b && b.getBoundingClientRect(); return { title: s && s.textContent.trim(), sp: sec && sec.classList.contains('sp-both'), gs: sec && sec.classList.contains('gs'), rows: rows.length, label: b && b.querySelector('.prow-l').textContent.trim(), pressed: b && b.getAttribute('aria-pressed'), h: r && Math.round(r.height), shown: !!(r && r.height), after: sec && sec.nextElementSibling && sec.nextElementSibling.querySelector('.pg-t') && sec.nextElementSibling.querySelector('.pg-t').textContent.trim() }; });
  ok(g.title === 'fred world' && g.sp && g.gs && g.rows === 1 && g.label === 'Animate the world' && g.pressed === 'true' && g.shown, 'switch: Settings › fred world, a box for both sports with one switch row, "Animate the world", on', g);
  ok(g.h >= 44, 'switch: the row is at least 44 px tall', g.h);
  await p.fill('#setSearch', 'animate'); await p.waitForTimeout(250);
  const sr = await p.evaluate(() => [...document.querySelectorAll('#setList .prow')].filter(r => !r.classList.contains('sf-out') && !r.hidden && r.getClientRects().length).map(r => r.dataset.prow));
  ok(sr.length === 1 && sr[0] === 'worldmotion', 'switch: searching "animate" finds it (only it)', sr);
  await p.fill('#setSearch', ''); await p.waitForTimeout(200);
  await p.click('#prowBtn-worldmotion'); await p.waitForTimeout(250);
  ok(await sw(p) === 'false' && (await sets(p)).worldMotion === false && !(await H(p)).anim, 'switch: off: shown off, stored false, the gate shuts', { sw: await sw(p), v: (await sets(p)).worldMotion, h: await H(p) });
  await reload(p); await p.waitForTimeout(300); await toSettings(p);
  ok(await sw(p) === 'false' && !(await H(p)).anim, 'switch: still off after a reload', { sw: await sw(p), h: await H(p) });
  await p.click('#prowBtn-worldmotion'); await p.waitForTimeout(250);
  ok(await sw(p) === 'true' && (await sets(p)).worldMotion === true && (await H(p)).anim, 'switch: on again: shown on, stored true, the gate opens', { sw: await sw(p), v: (await sets(p)).worldMotion, h: await H(p) });
  await x.close();
  const y = await openP({ motion: false }); await toSettings(y.p);
  ok(await sw(y.p) === 'true' && !(await H(y.p)).anim, 'switch: under Reduce Motion it shows its own state (on) and the gate stays shut', { sw: await sw(y.p), h: await H(y.p) });
  await y.p.click('#prowBtn-worldmotion'); await y.p.waitForTimeout(200); await y.p.click('#prowBtn-worldmotion'); await y.p.waitForTimeout(200);
  ok(!(await H(y.p)).anim, 'switch: under Reduce Motion, off and on again: the gate stays shut', await H(y.p));
  await y.close();
});

const BIRD = 'window.FW.bird({})', BIRD2 = "window.FW.bird({wear: window.FW.WX_WEAR[window.FW.WX_KINDS[1]]})";
section('mount', async () => {
  const x = await openP({ motion: true }), p = x.p; await p.waitForTimeout(300);
  ok(await p.evaluate(() => !!window.__q97 && typeof window.__q97.fwMount === 'function'), 'mount: fwMount is in the page');
  await spot(p, 'q97a'); const t0 = Date.now(); await mount(p, 'q97a', BIRD, 'bird:plain');
  const a0 = await until(() => look(p, 'q97a').then(l => l && l.go && l.running ? l : null), 1500);
  ok(!!a0 && a0.fwm && a0.hid === 'true' && a0.svg, 'mount: on screen: its spot (.fwm, aria-hidden) moves at once (.fwm-go, fw- loops running)', a0 || await look(p, 'q97a'));
  await sleep(Math.max(0, 5500 - (Date.now() - t0))); const a1 = await look(p, 'q97a');
  ok(a1.go && a1.running > 0, 'mount: still moving at 5.5 s (rule a: about 6-8 s)', a1);
  await sleep(Math.max(0, 8600 - (Date.now() - t0))); const a2 = await look(p, 'q97a');
  ok(!a2.go && a2.all === 0, 'mount: by 8.5 s it has settled: .fwm-go off, no fw- animation left (each part at rest)', a2);
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
  await mount(p, 'q97a', null); const a5 = await look(p, 'q97a');
  ok(a5.kids === 0 && !a5.fwm && !a5.go && !(await p.evaluate(() => window.__q97.FWM.has(document.getElementById('q97a')))), "mount: '' empties the spot and lets it go", a5);
  // below the fold: still and paused until seen
  await spot(p, 'q97b', true); await mount(p, 'q97b', BIRD); await p.waitForTimeout(700); const b0 = await look(p, 'q97b');
  ok(!b0.go && b0.off && b0.running === 0, 'mount: a spot below the fold waits still and paused (.mo-off)', b0);
  await p.evaluate(() => document.getElementById('q97b').scrollIntoView({ block: 'center' })); const b1 = await until(() => look(p, 'q97b').then(l => l && l.go && l.running ? l : null), 3000);
  ok(!!b1 && !b1.off, 'mount: scrolled to, it moves', b1 || await look(p, 'q97b'));
  await p.evaluate(() => window.scrollTo(0, 0)); const b2 = await until(() => look(p, 'q97b').then(l => l && l.off ? l : null), 3000);
  ok(!!b2 && b2.running === 0, 'mount: scrolled away while moving, it pauses', b2 || await look(p, 'q97b'));
  await p.evaluate(() => document.getElementById('q97b').scrollIntoView({ block: 'center' })); await until(() => look(p, 'q97b').then(l => l && !l.off), 3000);
  await hidePage(p, true); await p.waitForTimeout(150); const b3 = await look(p, 'q97b');
  ok(b3.off && b3.running === 0, 'mount: the page hidden: paused', b3);
  await hidePage(p, false); await p.waitForTimeout(150);
  // the same string in a second spot is reported; a spot taken out of the page is let go
  const before = x.errors.length; await spot(p, 'q97c'); await p.evaluate(() => { window.__q97s = window.FW.bird({}); window.__q97.fwMount(document.getElementById('q97c'), window.__q97s); });
  await spot(p, 'q97d'); await p.evaluate(() => window.__q97.fwMount(document.getElementById('q97d'), window.__q97s)); await p.waitForTimeout(200);
  const rep = x.errors.slice(before).filter(e => /already in another spot/.test(e));
  ok(rep.length >= 1, 'mount: the very same string in a second spot is reported (its SVG ids would repeat)', x.errors.slice(before));
  x.errors.splice(before);
  await p.evaluate(() => { document.getElementById('q97c').remove(); document.getElementById('q97d').remove(); }); await spot(p, 'q97e'); await mount(p, 'q97e', BIRD);
  const kept = await p.evaluate(() => [...window.__q97.FWM.keys()].map(e => e.id));
  ok(!kept.includes('q97c') && !kept.includes('q97d'), 'mount: spots taken out of the page are let go at the next mount', kept);
  await x.close();
});

section('rules', async () => {
  const x = await openP({ motion: true }), p = x.p; await p.waitForTimeout(300);
  await spot(p, 'q97a'); await mount(p, 'q97a', BIRD); await until(() => look(p, 'q97a').then(l => l && l.go), 1500);
  await toSettings(p); await p.click('#prowBtn-worldmotion'); await p.waitForTimeout(200);
  const a = await look(p, 'q97a');
  ok(!a.go && a.rm && a.all === 0 && !(await H(p)).rm, 'rules: the switch off while it moves: it stops at once (.fw-rm on the spot, not on html)', { a, h: await H(p) });
  await p.click('nav.tabs button[data-view=plan]'); await p.waitForTimeout(400);
  await spot(p, 'q97f'); await mount(p, 'q97f', BIRD2); await p.waitForTimeout(1200); const f = await look(p, 'q97f');
  ok(!f.go && f.rm && f.all === 0, 'rules: mounted while the switch is off: it never moves', f);
  await toSettings(p); await p.click('#prowBtn-worldmotion'); await p.waitForTimeout(200); await p.click('nav.tabs button[data-view=plan]'); await p.waitForTimeout(1200);
  const f2 = await look(p, 'q97f'), a2 = await look(p, 'q97a');
  ok(!f2.go && !f2.rm && !a2.go && !a2.rm, 'rules: the switch on again: no .fw-rm, and nothing already seen restarts (it moves again only when what it shows changes)', { f2, a2 });
  // a new app open: 30 minutes away, back: a kept drawing on screen moves once more
  await p.evaluate(() => window.scrollTo(0, 0));
  await hidePage(p, true); await p.evaluate(() => { const D = Date.now; window.__q97now = D; Date.now = () => D() + 31 * 60e3; });
  await hidePage(p, false); const g = await until(() => look(p, 'q97a').then(l => l && l.go && l.running ? l : null), 2000);
  ok(!!g, 'rules: a new app open (31 minutes away): a kept drawing moves once more when seen', g || await look(p, 'q97a'));
  await p.evaluate(() => { Date.now = window.__q97now; });
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
  ok(!!got && await sw(B.p) === 'false', 'sync: B pulls: stored off, its gate shuts, its switch shows off', { v: (await sets(B.p)).worldMotion, h: await H(B.p), sw: await sw(B.p) });
  await A.close(); await B.close();
});

section('restore', async () => {
  const x = await openP({ motion: true }), p = x.p;
  const s = await sets(p), lib = await LS(p, 'bluebird.library.v5');
  const f = path.join(os.tmpdir(), 'q97-backup-' + process.pid + '.json');
  fs.writeFileSync(f, JSON.stringify({ app: 'bluebird-fuel', kind: 'all', exported: '2026-11-06', settings: Object.assign({}, s, { worldMotion: false }), library: lib, journal: [], races: [] }));
  await toSettings(p); await p.setInputFiles('#backupFile', f); await until(async () => (await sets(p)).worldMotion === false, 8000);
  await p.waitForTimeout(300);
  ok((await sets(p)).worldMotion === false && !(await H(p)).anim && await sw(p) === 'false', 'restore: a backup with the switch off: stored off, the gate shuts, the switch shows off', { v: (await sets(p)).worldMotion, h: await H(p), sw: await sw(p) });
  fs.rmSync(f, { force: true }); await x.close();
});

section('main', async () => {
  if (!MAIN) { console.log('  note: no main page given: the main checks are skipped'); return; }
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
const errs = ERRS.flat().filter(e => !/already in another spot/.test(e));
ok(!errs.length, 'no page errors or console errors', errs.slice(0, 8));
await browser.close();
C.done('item 97: fred world, the bundle, motion plumbing and switch');
