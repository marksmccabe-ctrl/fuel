// node q98.test.mjs <null.html> [main null.html]   (cd into this folder first) -- item 98: Weather card: fred in the living sky. Every
// numbered point, QA line and decision (DECISIONS.md "Item 98"):
//   cache    sw.js CACHE and APP_BUILD match, v122 or later; the bundle is the design chat's 17:29 build (FW.built) or later
//   looks    98.1-2, the decision on the looks: on the ride's #rWeather and the run's #runWx (graphite: html.run-theme), each of the eight
//            skies (?sky=) and a clear night (the ride at 8 pm: no sky, the still moon) have fred drawn as FW.bird({wear:
//            FW.WX_WEAR[kind]}) exactly (the drawing, ids aside, is that call's), the night one in FW.WX_WEAR.night (the vest only: no
//            beam, no cap lamp); in his own kept layer (div.rwx-fred.rwx-keep, a fwMount spot, aria-hidden) right after .rwx-fog and before
//            the reading, z-index 2 under the words' 3; every look but rain carries the fw-bird wrapper (fred flaps), rain does not (no
//            flap: the doubled wing), the night is still (never moves); no fred without a forecast
//   size     FW.box: his base box (the 200-unit body) is 88 x 88 px (--wxf) in every look, 0.33 x 88 px in from the card's right padding
//            edge and 0.14 x 88 px down from its top (room and desk check it too: every box, width and text size), and the svg's 0 0 200 200 lands exactly on it (the
//            umbrella, beam and spritz grow the svg round it); nothing he paints, at rest or at the top of his bob, is cut by the card
//            (its padding edge: the card clips there): every look, both boxes, at 375 and 430 px and on the computer layout
//   room     98.3: at 320, 375, 390 and 430 px x 100, 150 and 200% text, both boxes, rain and fog (the beam), and again with both
//            temperatures at "100°" (the widest): no word over fred's body, none past the card's content edge, no sideways scroll, the
//            tiles start below his feet; the cut: fred shows exactly when the card's content box is at least max(305 px, 167 px +
//            6.25rem) wide (a card of 340 px at 100% text; at 150% and 200% the cut grows with the text), so never below 340 px; the
//            room is on the words beside him (the temperatures, the sub-line beside the square): a sub-line under the square (.sub-wide,
//            below his feet) keeps the card's width (no orphaned last word); also a clear night and the run's sun at 375-430 px
//   desk     the computer layout (html.dk): at 1440 x 900 fred is top right of the ride's box; at 1280 x 800 the results column gives the
//            box 276 px, under the cut: no fred and no room kept for him; the run's box there (360 px) has him top right, nothing cut,
//            room kept (size measures it too)
//   keep     98.4: keyed on the look: an in-place re-render (Adjust's recrunch) with the same look keeps the same spot and nodes, no new
//            move; mid-move it does not restart (it settles on the first move's time); a fresh Crunch with the same look keeps him too,
//            in the ride's box and the run's (carried into the run's new box); a look changed in place cross-fades (both layers at once,
//            the new one's opacity between 0 and 1 while the sky's layers fade too; every frame: no step over 0.2, done before the old
//            spot goes at 520 ms) and leaves one fred, the old spot let go (not in FWM, not in loopWhileVisible), data-fred-out gone;
//            a card without a look put in place: the room beside him stays (data-fred-out) while he fades, no word over him; the new
//            look moves (rule a: they move again when what they show changes): .fwm-go and loops running within 1 s, settled (.fwm-go
//            off, nothing running) 8.7 s after the change; under Reduce Motion the swap is at once
//   enter    98.6, both boxes (the ride's and the run's): the item-87 entrance includes his layer: while the box waits (.wx-arm) fred is out of it (display none) and does not
//            move or wait on screen, though his top is on the screen; as it plays (.wx-go) he fades in (rwx-fred-in) and his move starts
//            then, not before; still moving 5.5 s later and never paused in that time (his 6-8 s are not spent under the entrance)
//   settle   the plumbing fix (decisions): each fred loop plays only whole rounds that end by 8 s (iterations finite, end <= 8 s + a
//            frame), in the sun, heat, freeze (puffs offset into their round) and rain looks: every frame read, no step at the frame
//            .fwm-go comes off, none in the frame it goes on, nothing running after the end; at mount and after a new app open
//   remake   loops the browser makes anew after the 6 s step end where the ones they replace ended: the sun look, a fresh Crunch on
//            the ride (the box's entrance plays again) and the spot taken out and put back (with wxFred after it, and alone) at 6.5 s of
//            play: his bob and wings, whose last round ended at 6 s, stay at rest every frame (none over 0.05 from rest), and any
//            loop on them keeps iterations 3, ending at 6 s
//   pause    98.5: paused off screen (.mo-off, nothing running) and while the page is hidden; fwMount's loopWhileVisible covers his spot;
//            scrolled away between the 6 s step and the 8 s end and back: in his first frames on the screen each part whose loop is
//            done is at rest (Chromium draws a finished loop, paused, mid-round: the app takes it off its part)
//            (the clear night's still fred is registered too, and his box has no sky loop: wxLoop leaves it)
//   still    Reduce Motion: fred .fw-rm, nothing in the box animates (sky per item 87 §8); the switch off (worldMotion false): fred
//            .fw-rm and still while the sky's loops run on
//   media    print: his layer out, the reading's room given back; forced colours: his drawing out, his box kept
//   once     fred at most once on screen: every state this test reaches; the ride's and the run's boxes are never both shown
//   self     mutated copies of the page fail the checks that guard them: rain with the flap (looks), the plumbing from item 97 (settle:
//            the blink cut at 8 s), no entrance rule (enter), the entrance rule for the ride's box only (enter, the run), no room for the
//            reading (room), the room on the whole reading (room: the sub-line), finished loops left on their parts (pause), no fred in
//            the run's box on the computer layout (desk), a key that is not the look (keep), a 3 s fade (keep), the room dropped while
//            he fades out (keep), the faded-in look mounted still (keep: it must move), loops made anew after the step ended by the
//            clock (remake), a fred of 70 px (size): these last three in self2
//   main     (with [main null.html]) no fred on main: the same looks check fails there
// Q98_ONLY=section,section runs some sections.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { checker } from '../lib/open.mjs';
import { openScreen, crunch, toY, settle } from '../lib/screens.mjs';

const PAGE = path.resolve(process.argv[2] || '../../fred98/null.html'), MAIN = process.argv[3] ? path.resolve(process.argv[3]) : null;
const ONLY = (process.env.Q98_ONLY || '').split(',').filter(Boolean);
const C = checker('q98 '), ok = C.ok, ERRS = [];
const SRC = fs.readFileSync(PAGE, 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000, step = 100) { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); } catch (e) { v = null; } if (v) return v; await sleep(step); } return v; }
const browser = await chromium.launch();
const SKIES = ['sun', 'heat', 'freeze', 'wind', 'clouds', 'fog', 'rain', 'snow'], LOOKS = [...SKIES, 'night'];

// the hooked copy: the weather card's code lives inside the app's strict-mode function; this copy hands some of it out (as q97's)
const HOOK = "\nObject.defineProperty(window,'__q98',{configurable:true,get(){ return {fwMount, FWM, LV, IV, AOPEN, wxPut, wxFred, staggerIn, recrunchQuiet, get settings(){ return settings; }}; }});\n";
function hooked(page, name = 'q98-hook.html', edit) { let src = fs.readFileSync(page, 'utf8'); if (edit) src = edit(src); const k = src.indexOf("\n'use strict';\n"); if (k < 0) throw new Error("no 'use strict' line in " + page);
  const f = path.join(path.dirname(page), name), at = k + "\n'use strict';".length; fs.writeFileSync(f, src.slice(0, at) + HOOK + src.slice(at)); return f; }
const HOOKED = hooked(PAGE);
const MADE = [HOOKED];

// a box after a fresh Crunch, scrolled to: the ride's #rWeather or the run's #runWx; o: openScreen's options (width, scale, motion ...)
const BOX = run => run ? '#runWx' : '#rWeather';
async function setStart(p, t) { await p.click('#locRow'); await until(() => p.evaluate(() => document.getElementById('planSheet').classList.contains('open')));
  await p.fill('#startTime', t); await p.dispatchEvent('#startTime', 'change'); await p.click('#psAct'); await until(() => p.evaluate(() => !document.getElementById('planSheet').classList.contains('open'))); }
async function sport(p, s) { await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=' + s + ']'); await until(() => p.evaluate(s => document.documentElement.classList.contains('run-theme') === (s === 'run'), s)); await settle(p); }
async function at(k, run, o = {}, page = HOOKED) {
  const s = { name: 'q98-' + k, width: o.desk ? o.width : undefined, height: o.desk ? o.height : undefined, settings: o.settings, query: k === 'night' || k === 'none' ? '' : '?sky=' + k, forecast: k === 'none' ? false : undefined,
    go: async p => { if (run) await sport(p, 'run'); if (k === 'night') await setStart(p, '20:00'); if (o.before) await o.before(p); await crunch(p); if (!o.stay) await toY(p, BOX(run)); } };
  const x = await openScreen(page, s, Object.assign({ browser }, o)); if (page === HOOKED || page === PAGE) ERRS.push(x.errors); x.p.on('dialog', d => d.accept());
  if (x.fail) throw new Error('could not reach ' + s.name + ': ' + x.fail); return x;
}
// fred's spots in a box (the current one first), and how each shows
const spots = (p, run) => p.evaluate(sel => { const W = document.querySelector(sel); if (!W) return null; const L = [...W.querySelectorAll(':scope>.rwx-fred')];
  return L.map(f => ({ k: f.dataset.k, out: f.classList.contains('rwx-out'), cls: [...f.classList].join(' '), hid: f.getAttribute('aria-hidden'), disp: getComputedStyle(f).display, op: +getComputedStyle(f).opacity,
    go: f.classList.contains('fwm-go'), off: f.classList.contains('mo-off'), rm: f.classList.contains('fw-rm'), fwm: window.__q98 ? window.__q98.FWM.has(f) : null, lv: window.__q98 ? window.__q98.LV.m.has(f) : null,
    run: f.getAnimations({ subtree: true }).filter(a => a.playState === 'running' && String(a.animationName).startsWith('fw-')).length, svg: !!f.querySelector('svg') })); }, BOX(run));
// fred shown anywhere on the page (a spot with a box, not fading out)
const shownFreds = p => p.evaluate(() => [...document.querySelectorAll('.rwx-fred')].filter(f => !f.classList.contains('rwx-out') && f.getClientRects().length && f.querySelector('svg')).map(f => f.parentElement.id + ':' + f.dataset.k));
const hidePage = (p, hidden) => p.evaluate(h => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => h }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => h ? 'hidden' : 'visible' }); document.dispatchEvent(new Event('visibilitychange')); }, hidden);
const appOpen = async p => { await hidePage(p, true); await p.evaluate(() => { const D = Date.now; window.__q98now = D; Date.now = () => D() + 31 * 60e3; }); await hidePage(p, false); await p.evaluate(() => { Date.now = window.__q98now; }); };
const onceOk = async (p, where) => { const f = await shownFreds(p); ok(f.length <= 1, 'once: fred at most once on screen (' + where + ')', f); };

const sections = [];
const section = (n, f) => sections.push([n, f]);

section('cache', async () => {
  const swf = fs.readFileSync(path.join(path.dirname(PAGE), 'sw.js'), 'utf8');
  const b = (SRC.match(/const APP_BUILD='([^']+)'/) || [])[1], c = (swf.match(/const CACHE = '([^']+)'/) || [])[1];
  ok(!!b && b === c && +(b.match(/v(\d+)$/) || [])[1] >= 122, 'cache: APP_BUILD = sw.js CACHE, v122 or later', { b, c });
  const built = (/window\.FW = \{[^\n]*built: '([^']+)'/.exec(SRC) || [])[1];
  ok(!!built && built >= '2026-11-06 17:29 EST', 'cache: the bundle is the design chat\'s 17:29 build or later (FW.built ' + built + ')', built);
});

// ---- the looks: the drawing in each box is FW.bird({wear: FW.WX_WEAR[kind]}), ids aside
const lookOf = (p, run) => p.evaluate(sel => { const W = document.querySelector(sel), f = W.querySelector(':scope>.rwx-fred:not(.rwx-out)'), kids = [...W.children];
  if (!f) return { none: true, fred: W.dataset.fred || null };
  const k = f.dataset.k, norm = h => h.replace(/\b(fw-[a-z]+)\d+/g, '$1#'), want = window.FW.bird({ wear: window.FW.WX_WEAR[k] }), cs = getComputedStyle(f), word = W.querySelector('.rwx-temp');
  return { k, fred: W.dataset.fred, sky: W.dataset.sky || '', same: norm(f.innerHTML) === norm(Object.assign(document.createElement('div'), { innerHTML: want }).innerHTML), vb: f.querySelector('svg').getAttribute('viewBox'), wantVb: window.FW.box(want),
    order: kids.indexOf(f) === kids.findIndex(e => e.classList.contains('rwx-fog')) + 1 && kids.indexOf(f) < kids.findIndex(e => e.classList.contains('rwx-g')),
    keep: f.classList.contains('rwx-keep') && f.classList.contains('fwm'), hid: f.getAttribute('aria-hidden'), z: cs.zIndex, zw: getComputedStyle(word.closest('.rwx-main')).zIndex,
    bird: f.classList.contains('fw-bird'), beam: !!f.querySelector('.fw-wx-beam'), umb: !!f.querySelector('.fw-wx-umb'), theme: document.documentElement.classList.contains('run-theme'), still: window.__q98 && window.__q98.FWM.get(f) ? window.__q98.FWM.get(f).s : null }; }, BOX(run));
function lookChecks(L, k, run, tag = '') {
  const w = (run ? 'run ' : 'ride ') + k + tag;
  return [
    [!L.none && L.k === k && L.fred === k && L.sky === (k === 'night' ? '' : k), 'looks: ' + w + ': fred in the look of the sky (data-fred ' + k + (k === 'night' ? ', no sky: the still moon' : '') + ')'],
    [!L.none && L.same, 'looks: ' + w + ': the drawing is FW.bird({wear: FW.WX_WEAR.' + k + '}) (ids aside)'],
    [!L.none && L.order && L.keep && L.hid === 'true' && L.z === '2' && L.zw === '3', 'looks: ' + w + ': his own kept layer (.rwx-fred.rwx-keep, a fwMount spot, aria-hidden) after .rwx-fog, before the reading; z-index 2 under the words\' 3'],
    [!L.none && (k === 'rain' ? !L.bird : L.bird), 'looks: ' + w + ': ' + (k === 'rain' ? 'no fw-bird wrapper: no flap in the rain (the bundle\'s doubled wing)' : 'the fw-bird wrapper (his flap)')],
    [!L.none && (k === 'night' ? L.still === true && !L.beam : L.still === false), 'looks: ' + w + ': ' + (k === 'night' ? 'still (o.still) and the vest only: no beam, no cap lamp' : 'moves (not o.still)')],
    [!L.none && L.theme === !!run, 'looks: ' + w + ': ' + (run ? 'on the run\'s graphite (html.run-theme)' : 'on the ride\'s light card')],
  ];
}
section('looks', async () => {
  for (const run of [false, true]) for (const k of LOOKS) {
    const x = await at(k, run, { motion: true }), L = await lookOf(x.p, run);
    for (const [c, n] of lookChecks(L, k, run)) ok(c, n, L);
    if (k === 'fog') ok(L.beam, 'looks: fog: the cap lamp\'s beam (fog drifts behind him)', L);
    if (k === 'rain') ok(L.umb, 'looks: rain: the umbrella', L);
    await onceOk(x.p, (run ? 'run ' : 'ride ') + k); await x.close();
  }
  const x = await at('none', false, { motion: true }), L = await lookOf(x.p, false);
  ok(L.none && L.fred === null, 'looks: no forecast (the feels-like card): no fred', L); await x.close();
});

// ---- size and edges: the base box, the svg's 0 0 200 200 on it, everything painted (FW.plain on a canvas) inside the card's padding box,
// with the bob's lift (12 units) on top
const geo = (p, run) => p.evaluate(async sel => { const W = document.querySelector(sel), f = W.querySelector(':scope>.rwx-fred:not(.rwx-out)'); if (!f || getComputedStyle(f).display === 'none') return { on: false };
  const svg = f.querySelector('svg'), r = f.getBoundingClientRect(), m = svg.getScreenCTM(), P = (x, y) => new DOMPoint(x, y).matrixTransform(m), a = P(0, 0), b = P(200, 200);
  const vb = svg.getAttribute('viewBox').split(/\s+/).map(Number), S = 4, c = document.createElement('canvas'); c.width = vb[2] * S; c.height = vb[3] * S;
  let h = window.FW.plain(svg.outerHTML); if (!/xmlns=/.test(h)) h = h.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'); h = h.replace(/<svg([^>]*)>/, (q, x) => `<svg${x} width="${c.width}" height="${c.height}">`);
  const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(h); await im.decode(); const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const u = r.width / 200, U = v => v / S, px = [r.left + (U(x0) + vb[0]) * u, r.top + (U(y0) + vb[1] - 12) * u, r.left + (U(x1 + 1) + vb[0]) * u, r.top + (U(y1 + 1) + vb[1]) * u];
  const Wr = W.getBoundingClientRect(), cs = getComputedStyle(W), pad = [Wr.left + parseFloat(cs.borderLeftWidth), Wr.top + parseFloat(cs.borderTopWidth), Wr.right - parseFloat(cs.borderRightWidth), Wr.bottom - parseFloat(cs.borderBottomWidth)];
  const R = v => Math.round(v * 10) / 10;
  return { on: true, k: f.dataset.k, box: [R(r.width), R(r.height)], map: [R(a.x - r.left), R(a.y - r.top), R(b.x - r.right), R(b.y - r.bottom)], paint: px.map(R), pad: pad.map(R),
    inside: px[0] >= pad[0] - .5 && px[1] >= pad[1] - .5 && px[2] <= pad[2] + .5 && px[3] <= pad[3] + .5, right: R(Wr.right - r.right), top: R(r.top - Wr.top), inR: R(pad[2] - r.right), inT: R(r.top - pad[1]) }; }, BOX(run));
// his base box: 88 x 88 px (--wxf), 0.33 x 88 px in from the card's right padding edge, 0.14 x 88 px down from its top (within 0.5 px)
const WXF = 88, off88 = g => Math.abs(g.box[0] - WXF) > .5 || Math.abs(g.box[1] - WXF) > .5 || Math.abs(g.inR - .33 * WXF) > .5 || Math.abs(g.inT - .14 * WXF) > .5;
section('size', async () => {
  for (const [run, width, o] of [[false, 375], [false, 430], [true, 430], [false, 1440, { desk: true, width: 1440, height: 900 }], [true, 1280, { desk: true, width: 1280, height: 800 }]]) {
    const sizes = new Set(), cut = [], off = [];
    for (const k of LOOKS) { const x = await at(k, run, Object.assign({ width }, o || {})), g = await geo(x.p, run); await x.close();
      if (!g.on) { off.push(k); continue; } sizes.add(g.box.join('x')); if (!g.inside) cut.push(g); if (g.map.some(v => Math.abs(v) > .6)) off.push(k + ' map ' + g.map.join(','));
      if (off88(g)) off.push(k + ' box ' + g.box.join('x') + ' at ' + g.inR + ' / ' + g.inT); }
    const w = (run ? 'run' : 'ride') + ' at ' + width + ' px';
    ok(sizes.size === 1 && !off.length, 'size: ' + w + ': fred\'s base box is 88 x 88 px in every look (' + [...sizes].join(', ') + '), 29 px in from the card\'s right padding edge and 12 px down, and the svg\'s 0 0 200 200 lands on it', { sizes: [...sizes], off });
    ok(!cut.length, 'size: ' + w + ': nothing fred paints, at rest or at the top of his bob, is cut by the card edge (every look: the umbrella, the beam, the spritz)', cut);
  }
});

// ---- room for him: words, the content edge, the tiles, the cut
// the sub-line: under the square (.sub-wide, below his feet) it keeps the card's width, its text box reaching the content edge (no
// orphaned last word); beside the square it keeps the room as the temperatures do. (A function in the page: room() and fade() use it)
const SUBOF = "window.subOf=(W,cr)=>{ const m=W.querySelector('.rwx-main'), s=W.querySelector('.rwx-sub'); if(!s) return { sub: null }; const r=s.getBoundingClientRect(), R=document.createRange(); R.selectNodeContents(s);"
  + " return { subWide: m.classList.contains('sub-wide'), subEdge: Math.round((r.right - parseFloat(getComputedStyle(s).paddingRight) - cr) * 10) / 10, subPad: parseFloat(getComputedStyle(s).paddingRight), subLines: new Set([...R.getClientRects()].filter(q => q.width > 0).map(q => Math.round(q.bottom))).size }; };";
const room = (p, run, hot) => p.evaluate(([sel, hot, SUBOF]) => { if (!window.subOf) (0, eval)(SUBOF); const W = document.querySelector(sel); if (hot) W.querySelectorAll('.rwx-temp').forEach(e => { e.textContent = '100°'; });
  const f = W.querySelector(':scope>.rwx-fred:not(.rwx-out)'), cs = getComputedStyle(W), Wr = W.getBoundingClientRect(), on = !!f && getComputedStyle(f).display !== 'none';
  const cl = Wr.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft), cr = Wr.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight), fr = on && f.getBoundingClientRect(), u = on && fr.width / 200;
  const body = on ? { l: fr.left + 25.5 * u, t: fr.top + 34 * u, r: fr.left + 194.5 * u, b: fr.top + 194.8 * u } : null, words = [], tw = document.createTreeWalker(W, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) { const e = n.parentElement; if (!n.nodeValue.trim() || e.closest('[aria-hidden=true],.loc-sr') || !e.getClientRects().length) continue; const rg = document.createRange(); rg.selectNodeContents(n);
    for (const q of rg.getClientRects()) if (q.width > 0) words.push({ t: n.nodeValue.trim().slice(0, 16), l: q.left, t2: q.top, r: q.right, b: q.bottom }); }
  const tc = document.createElement('canvas').getContext('2d'), ts = getComputedStyle(W, '::before'); tc.font = ts.fontWeight + ' ' + ts.fontSize + ' ' + ts.fontFamily; /* the title (generated text) */
  const tt = ts.content.replace(/^"|"$/g, ''), tm = tc.measureText(ts.textTransform === 'uppercase' ? tt.toUpperCase() : tt).width * (1 + parseFloat(ts.letterSpacing || 0) / parseFloat(ts.fontSize));
  words.push({ t: 'title', l: Wr.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft) + 2, t2: Wr.top + parseFloat(cs.paddingTop), r: Wr.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft) + 2 + tm + 4, b: Wr.top + parseFloat(cs.paddingTop) + parseFloat(ts.lineHeight) });
  const under = body ? words.filter(w => w.r > body.l && w.l < body.r && w.b > body.t && w.t2 < body.b).map(w => w.t) : [];
  const over = words.filter(w => w.r > cr + .5 || w.l < cl - .5).map(w => w.t + ' ' + Math.round(w.r - cr));
  const tiles = W.querySelector('.rwx-tiles').getBoundingClientRect().top, rem = parseFloat(getComputedStyle(document.documentElement).fontSize), cw = cr - cl;
  return { on, cardW: Math.round(Wr.width), cw: Math.round(cw), want: cw >= Math.max(305, 167 + 6.25 * rem) - .5, under, over, sideways: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    feet: body ? Math.round(tiles - body.b) : null, box: on ? [fr.width, fr.height].map(v => Math.round(v * 10) / 10) : null, inR: on ? Math.round((Wr.right - parseFloat(cs.borderRightWidth) - fr.right) * 10) / 10 : null, inT: on ? Math.round((fr.top - Wr.top - parseFloat(cs.borderTopWidth)) * 10) / 10 : null, pad: parseFloat(getComputedStyle(W.querySelector('.rwx-temps')).paddingRight), ...subOf(W, cr) }; }, [BOX(run), hot, SUBOF]);
const subBad = r => r.on && (!(r.pad > 0) || (r.subWide ? Math.abs(r.subEdge) > .5 : !(r.subPad > 0)));
const roomBad = (r, hot) => r.under.length || (r.over.length && !(hot && !r.on)) || r.sideways || (r.on && r.feet < 0) || r.on !== r.want || (r.cardW < 340 && r.on) || subBad(r);
section('room', async () => {
  const seen = { on: [], off: [], past: [], wide: [], box: [] };
  for (const [run, k] of [[false, 'rain'], [false, 'fog'], [true, 'rain'], [false, 'night'], [true, 'sun']]) for (const width of [320, 375, 390, 430]) for (const scale of [1, 1.5, 2]) {
    if ((k === 'night' || k === 'sun') && (width === 320 || scale === 2)) continue; /* (the sub-line cases the check found: 375-430 px at 100 and 150%) */
    const x = await at(k, run, { width, scale }), a = await room(x.p, run, false), b = await room(x.p, run, true); await x.close();
    const w = (run ? 'run ' : 'ride ') + k + ' at ' + width + ' px, ' + scale * 100 + '% text';
    ok(!roomBad(a) && !roomBad(b, true), 'room: ' + w + ': ' + (a.on ? 'fred shown, ' : 'fred left out (card ' + a.cardW + ' px), ') + 'no word over him or past the card\'s content edge, no sideways scroll, the tiles below his feet (also with "100°"' + (a.on ? '' : ', which may run past the edge without him, as on main') + ')' + (a.on ? '; the room is on the words beside him: ' + (a.subWide ? 'the sub-line under the square (below his feet) keeps the card\'s width, ' + a.subLines + ' line(s)' : 'the sub-line beside the square keeps it too') : ''), { a, b });
    if (a.on && a.subWide) seen.wide.push(w);
    if (a.on && off88(a)) seen.box.push(w + ': ' + a.box.join('x') + ' at ' + a.inR + ' / ' + a.inT);
    if (!b.on && b.over.length) seen.past.push(w);
    (a.on ? seen.on : seen.off).push(width + '/' + scale * 100 + '%');
  }
  ok(seen.off.some(s => s.startsWith('320/')) && !seen.on.some(s => s.startsWith('320/')) && seen.on.includes('375/100%') && seen.on.includes('390/100%'), 'room: the cut: left out on a 320 px phone (card 288 px), shown at 375 px and up at 100% text', seen);
  ok(seen.wide.length >= 4 && seen.wide.some(w => /night at 390 px, 100%/.test(w)), 'room: the sub-line under the square was seen with fred shown (' + seen.wide.length + ' cases, the clear night at 390 px among them), each keeping the card\'s width', seen.wide);
  ok(seen.on.length >= 20 && !seen.box.length, 'room: fred\'s base box is 88 x 88 px, 29 px in from the right padding edge and 12 px down, at every width and text size he shows (' + seen.on.length + ' cases)', seen.box);
  ok(seen.off.includes('375/150%') && seen.off.includes('390/200%'), 'room: the cut grows with the text size (a 375 px phone at 150%, a 390 px one at 200%: no room for the temperature beside him)', seen);
  if (seen.past.length) console.log('  note: with no fred, "100°" runs past the card edge at ' + seen.past.join('; ') + ' (the square and a 2.75rem temperature in a 254 px card at 200%: the app as on main, not item 98)');
});

section('desk', async () => {
  const x = await at('rain', false, { desk: true, width: 1440, height: 900 }), g = await geo(x.p, false), dk = await x.p.evaluate(() => document.documentElement.classList.contains('dk'));
  ok(dk && g.on && g.right < 40 && g.top < 20 && !off88(g), 'desk: the computer layout (html.dk, 1440 x 900): fred top right of the ride\'s box (' + g.right + ' px from its right, ' + g.top + ' px from its top), his base box 88 x 88 px in place', { dk, g });
  await onceOk(x.p, 'computer layout'); await x.close();
  const y = await at('rain', false, { desk: true, width: 1280, height: 800 }), r = await room(y.p, false, false), dk2 = await y.p.evaluate(() => document.documentElement.classList.contains('dk'));
  ok(dk2 && !r.on && r.cardW < 340 && r.pad === 0, 'desk: at 1280 x 800 the results column gives the box ' + r.cardW + ' px: fred left out, no room kept for him', r);
  await y.close();
  const z = await at('rain', true, { desk: true, width: 1280, height: 800 }), gz = await geo(z.p, true), rz = await room(z.p, true, false), dk3 = await z.p.evaluate(() => document.documentElement.classList.contains('dk'));
  ok(dk3 && gz.on && rz.on && rz.cardW >= 340 && gz.right < 40 && gz.top < 20 && !off88(gz) && gz.inside && !roomBad(rz), 'desk: the run\'s box on the computer layout (1280 x 800, ' + rz.cardW + ' px): fred shown top right (' + gz.right + ' px from its right, ' + gz.top + ' px from its top), nothing he paints cut, room kept beside him (' + rz.pad + ' px), no word over him', { dk3, gz, rz });
  await onceOk(z.p, 'the run on the computer layout'); await z.close();
});

// ---- keyed on the look
// the card in a box rewritten to another look, put in place (wxPut: morph true is an in-place change, false a fresh Crunch's)
const swapTo = (p, run, k, morph) => p.evaluate(([sel, k, morph]) => { const W = document.querySelector(sel), html = [...W.childNodes].filter(n => !(n.nodeType === 1 && n.classList.contains('rwx-keep'))).map(n => n.nodeType === 1 ? n.outerHTML : n.nodeValue).join('');
  window.__q98.wxPut(W, html.replace(/ data-sky="[a-z]+"/g, k === 'night' ? '' : ` data-sky="${k}"`).replace(/data-fred="[a-z]+"/, `data-fred="${k}"`), morph); return true; }, [BOX(run), k, morph]);
// a look changed in place (wxPut morph, motion on; 'none': the card without a look), every frame for 900 ms: both freds' opacity, the room
// beside him (the temperatures' padding), any word over the old fred's body while he is still visible, and whether the new one moves
const fade = (p, run, k) => p.evaluate(async ([sel, k]) => { const W = document.querySelector(sel), old = W.querySelector(':scope>.rwx-fred:not(.rwx-out)'); window.__q98old = old;
  let html = [...W.childNodes].filter(n => !(n.nodeType === 1 && n.classList.contains('rwx-keep'))).map(n => n.nodeType === 1 ? n.outerHTML : n.nodeValue).join('');
  html = k === 'none' ? html.replace(/ data-fred="[a-z]+"/, '') : html.replace(/ data-sky="[a-z]+"/g, k === 'night' ? '' : ` data-sky="${k}"`).replace(/data-fred="[a-z]+"/, `data-fred="${k}"`);
  const op = f => f && f.isConnected ? Math.round(+getComputedStyle(f).opacity * 1000) / 1000 : null;
  const under = f => { if (!(op(f) > .05)) return []; const r = f.getBoundingClientRect(), u = r.width / 200, b = { l: r.left + 25.5 * u, t: r.top + 34 * u, r: r.left + 194.5 * u, b: r.top + 194.8 * u }, out = [], tw = document.createTreeWalker(W.querySelector('.rwx-main'), NodeFilter.SHOW_TEXT);
    for (let n; (n = tw.nextNode());) { if (!n.nodeValue.trim() || n.parentElement.closest('[aria-hidden=true],.loc-sr')) continue; const rg = document.createRange(); rg.selectNodeContents(n);
      for (const q of rg.getClientRects()) if (q.width > 0 && q.right > b.l && q.left < b.r && q.bottom > b.t && q.top < b.b) out.push(n.nodeValue.trim().slice(0, 14)); } return out; };
  const t0 = performance.now(); window.__q98.wxPut(W, html, true); const nw = W.querySelector(':scope>.rwx-fred:not(.rwx-out)'), F = [];
  await new Promise(res => { const tick = () => { const t = performance.now() - t0, L = [...W.querySelectorAll(':scope>.rwx-fred')];
    F.push({ t: Math.round(t), old: op(old), nw: op(nw), n: L.length, out: L.filter(f => f.classList.contains('rwx-out')).map(f => f.dataset.k).join(), skyOut: !!W.querySelector('.rwx-layer.rwx-out'), fredOut: W.dataset.fredOut || null,
      pad: parseFloat(getComputedStyle(W.querySelector('.rwx-temps')).paddingRight), under: under(old), go: !!nw && nw.classList.contains('fwm-go'), run: nw ? nw.getAnimations({ subtree: true }).filter(a => a.playState === 'running' && String(a.animationName).startsWith('fw-')).length : 0 });
    if (t < 900) requestAnimationFrame(tick); else res(); }; requestAnimationFrame(tick); });
  return F; }, [BOX(run), k]);
// the cross-fade, frame by frame: no jump (a step over 0.2 a frame, at 60 frames a second), and done before the old spot goes at 520 ms
// (the sky's 480 ms): the old one's last frame at most 0.02, the new one then at least 0.98
const fadeSteps = F => { let m = 0; for (let i = 1; i < F.length; i++) { const k = Math.max(1, (F[i].t - F[i - 1].t) / 16.7);
  for (const q of ['old', 'nw']) m = Math.max(m, Math.abs((F[i][q] || 0) - (F[i - 1][q] || 0)) / k); } return Math.round(m * 1000) / 1000; };
const fadeDone = F => { const L = F.filter(f => f.old != null).pop(); return L ? { t: L.t, old: L.old, nw: L.nw } : null; };
async function keepRun(page, full) {
  const out = {}, x = await at('sun', false, { motion: true }, page), p = x.p;
  const tag = () => p.evaluate(() => { const f = document.querySelector('#rWeather>.rwx-fred'), s = f && f.querySelector('svg'); if (s && !s.__q98) s.__q98 = Math.random().toString(36).slice(2); if (f && !f.__q98) f.__q98 = Math.random().toString(36).slice(2); return f ? f.__q98 + '/' + (s && s.__q98) : null; });
  await until(() => spots(p).then(s => s && s[0] && s[0].go), 3000); const t0 = Date.now(), a0 = await tag();
  await sleep(2000); await p.evaluate(() => window.__q98.recrunchQuiet()); await sleep(300);
  const a1 = await tag(), s1 = await spots(p); out.mid = { same: a0 === a1, s1 };
  await sleep(Math.max(0, t0 + 8700 - Date.now())); const s2 = await spots(p); out.midEnd = s2;   /* settled on the first move's time, not 8 s after the re-render */
  await p.evaluate(() => window.__q98.recrunchQuiet()); await sleep(800); out.after = { same: (await tag()) === a0, s: await spots(p) };
  await crunch(p); await toY(p, '#rWeather'); await sleep(800); out.fresh = { same: (await tag()) === a0, s: await spots(p) };
  // a look changed in place: both layers while it cross-fades (the sky's layers fading too), then one fred
  const t2 = Date.now(), F = await fade(p, false, 'rain'), m2 = F.find(f => f.t >= 200) || {};
  out.mid2 = { t: m2.t, n: m2.n, out: m2.out, nw: m2.nw, skyOut: m2.skyOut, fredOut: m2.fredOut };
  out.fade = { step: fadeSteps(F), done: fadeDone(F), frames: F.length, sample: F.filter((f, i) => i % 6 === 0).map(f => [f.t, f.old, f.nw]) };
  await sleep(100);
  out.end2 = await p.evaluate(() => { const W = document.getElementById('rWeather'), L = [...W.querySelectorAll(':scope>.rwx-fred')], o = window.__q98old, Q = window.__q98;
    return { n: L.length, k: L.map(f => f.dataset.k), op: L.map(f => +getComputedStyle(f).opacity), oldIn: o.isConnected, oldKept: Q.FWM.has(o), oldLv: Q.LV.m.has(o), fredOut: W.dataset.fredOut || null, fred: W.dataset.fred }; });
  await onceOk(p, 'after a look changed in place');
  // the new look moves (rule a): .fwm-go and its loops running in the fade's 900 ms of frames; settled 8.7 s after it (full: the keep section)
  const mv = F.find(f => f.go && f.run > 0); out.move = { t: mv ? mv.t : null, run: mv ? mv.run : 0 };
  if (full) { await sleep(Math.max(0, t2 + 8700 - Date.now())); out.settled = (await spots(p))[0]; }
  // a card without a look (no data-fred) put in place: the old fred fades out, and the room beside him stays until he is gone
  const G = await fade(p, false, 'none'), vis = G.filter(f => f.old > .05);
  out.none = { vis: vis.length, padGone: vis.filter(f => !(f.pad > 0)).map(f => [f.t, f.old, f.pad]), under: vis.filter(f => f.under.length).map(f => [f.t, f.old, f.under.join('|')]), end: G[G.length - 1], step: fadeSteps(G) };
  await x.close();
  return out;
}
const keepOk = o => [
  [o.mid.same && o.mid.s1[0].go, 'keep: an in-place re-render (Adjust\'s recrunch) mid-move with the same look: the same spot and nodes, still moving (no restart)'],
  [o.midEnd.length === 1 && !o.midEnd[0].go && o.midEnd[0].run === 0, 'keep: ... and it settles on the first move\'s time (by 8.7 s after it started), not 8 s after the re-render'],
  [o.after.same && !o.after.s[0].go, 'keep: a re-render after he settled: the same nodes, no new move'],
  [o.fresh.same && !o.fresh.s[0].go && o.fresh.s.length === 1, 'keep: a fresh Crunch with the same look keeps him (same nodes, no new move)'],
  [o.mid2.n === 2 && o.mid2.out === 'sun' && o.mid2.nw > .02 && o.mid2.nw < .98 && o.mid2.skyOut && o.mid2.fredOut === 'sun', 'keep: a look changed in place cross-fades: the old fred fading out, the new one fading in (opacity between 0 and 1 at 200 ms) while the sky fades too'],
  [o.fade.step <= .2 && o.fade.done && o.fade.done.old <= .02 && o.fade.done.nw >= .98, 'keep: ... every frame: no jump (no step over 0.2 a frame), and the fade is done, with the sky\'s, before the old spot goes (its last frame ' + (o.fade.done && o.fade.done.old) + ' at ' + (o.fade.done && o.fade.done.t) + ' ms, the new one ' + (o.fade.done && o.fade.done.nw) + ')'],
  [o.end2.n === 1 && o.end2.k[0] === 'rain' && o.end2.op[0] === 1 && !o.end2.oldIn && !o.end2.oldKept && !o.end2.oldLv && !o.end2.fredOut && o.end2.fred === 'rain', 'keep: ... and leaves one fred (the new look), the old spot let go (not kept by fwMount or loopWhileVisible)'],
  [o.move.t != null && o.move.run > 0 && (!o.settled || (!o.settled.go && o.settled.run === 0)), 'keep: ... the new look moves (rule a: what he shows changed): .fwm-go and his loops running ' + o.move.t + ' ms after the change (within the fade\'s 900 ms)' + (o.settled ? ', settled 8.7 s after it' : '')],
  [o.none.vis > 3 && !o.none.padGone.length && !o.none.under.length && o.none.step <= .2 && o.none.end.n === 0 && o.none.end.old === null && !o.none.end.fredOut, 'keep: a card without a look put in place: fred fades out (' + o.none.vis + ' frames visible) and the room beside him stays until he is gone (data-fred-out: no word over him while he shows), then no fred'],
];
section('keep', async () => {
  const o = await keepRun(HOOKED, true); for (const [c, n] of keepOk(o)) ok(c, n, o);
  ok(!!o.settled, 'keep: the new look\'s move was read to its end', o.settled);
  // the run's fresh Crunch builds a new box: fred is carried into it, kept
  const y = await at('snow', true, { motion: true }), p = y.p;
  const t = () => p.evaluate(() => { const f = document.querySelector('#runWx>.rwx-fred'); if (f && !f.__q98) f.__q98 = Math.random().toString(36).slice(2); return f && f.__q98; });
  const a = await t(), box0 = await p.evaluate(() => { window.__q98box = document.getElementById('runWx'); return true; }); await crunch(p); await sleep(500);
  const b = await t(), nb = await p.evaluate(() => document.getElementById('runWx') !== window.__q98box), s = await spots(p, true);
  ok(nb && a === b && s.length === 1, 'keep: the run\'s fresh Crunch (a new box): fred carried into it, the same spot (one fred)', { nb, a, b, s });
  await y.close();
  // under Reduce Motion a look changed in place is swapped at once
  const z = await at('sun', false, {}); await swapTo(z.p, false, 'fog', true); const s0 = await spots(z.p);
  ok(s0.length === 1 && s0[0].k === 'fog' && !/rwx-x|rwx-pre/.test(s0[0].cls) && s0[0].op === 1, 'keep: under Reduce Motion a look changed in place is swapped at once (no fade)', s0);
  await z.close();
});

// ---- the entrance: the box waits (armed) with fred's top on the screen; he must not move until it plays
async function enterRun(page, run = false) {
  const x = await at('sun', run, { motion: true }, page), p = x.p, out = {}, S = [BOX(run), run ? 'runResults' : 'results'];
  // the box's top 130 px on the screen above the bars at the bottom (the Save bar): under the 35% it needs to play, fred's 88 px all above them
  const B = () => p.evaluate(() => Math.min(innerHeight * .9, ...[...document.querySelectorAll('#planBar,#planSaved,nav.tabs')].filter(b => b.getClientRects().length && getComputedStyle(b).position === 'fixed').map(b => b.getBoundingClientRect().top).filter(t => t > innerHeight / 3)));
  await p.evaluate(([b, S]) => { const W = document.querySelector(S[0]), y = W.getBoundingClientRect().top + scrollY; window.scrollTo(0, Math.max(0, y - b + 130)); }, [await B(), S]);
  await sleep(400);
  await p.evaluate(S => { const W = document.querySelector(S[0]), Q = window.__q98, h = [...W.childNodes].filter(n => !(n.nodeType === 1 && n.classList.contains('rwx-keep'))).map(n => n.nodeType === 1 ? n.outerHTML : n.nodeValue).join('');
    Q.wxPut(W, h.replace(/ data-sky="[a-z]+"/g, ' data-sky="freeze"').replace(/data-fred="[a-z]+"/, 'data-fred="freeze"'), false); Q.staggerIn(document.getElementById(S[1]), { wx: true }); }, S);
  await sleep(1500);
  out.wait = await p.evaluate(S => { const W = document.querySelector(S[0]), f = W.querySelector(':scope>.rwx-fred'), r = W.getBoundingClientRect(), Q = window.__q98;
    return { arm: W.classList.contains('wx-arm'), k: f.dataset.k, disp: getComputedStyle(f).display, go: f.classList.contains('fwm-go'), due: Q.FWM.get(f).due, m: Q.FWM.get(f).m, top: Math.round(r.top) }; }, S);
  out.wait.bars = Math.round(await B()); out.wait.topOn = out.wait.top + 100 < out.wait.bars && out.wait.top + 150 > out.wait.bars;
  await p.evaluate(S => { const R = window.__q98e = { f: [], t0: performance.now() }; const tick = () => { const W = document.querySelector(S[0]), f = W.querySelector(':scope>.rwx-fred');
      R.f.push([Math.round(performance.now() - R.t0), W.classList.contains('wx-arm') ? 1 : 0, W.classList.contains('wx-go') ? 1 : 0, f.classList.contains('fwm-go') ? 1 : 0, f.classList.contains('mo-off') ? 1 : 0, getComputedStyle(f).display === 'none' ? 1 : 0, f.getAnimations().some(a => a.animationName === 'rwx-fred-in') ? 1 : 0]);
      if (performance.now() - R.t0 < 7500) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }, S);
  await p.evaluate(S => document.querySelector(S[0]).scrollIntoView({ block: 'start' }), S); await sleep(7600);
  const F = await p.evaluate(() => window.__q98e.f), g = F.findIndex(v => v[2]), m = F.findIndex(v => v[3]);
  out.go = { wxGo: g >= 0 ? F[g][0] : null, move: m >= 0 ? F[m][0] : null, moveBeforeGo: F.some(v => v[3] && (v[1] || v[5])), fadeIn: F.some(v => v[2] && v[6]), pausedWhileMoving: F.filter(v => v[3] && v[4]).length,
    at55: m >= 0 ? (F.find(v => v[0] >= F[m][0] + 5500) || [])[3] : null };
  await x.close(); return out;
}
const enterOk = (o, run) => [
  [o.wait.arm && o.wait.topOn && o.wait.k === 'freeze' && o.wait.disp === 'none' && !o.wait.go && !o.wait.m && o.wait.due, 'enter: ' + (run ? 'the run\'s box' : 'the ride\'s box') + ': while the box waits (.wx-arm), his top on the screen: fred is out of it (display none), not moving, still waiting to be seen'],
  [o.go.wxGo != null && o.go.move != null && o.go.move >= o.go.wxGo && !o.go.moveBeforeGo && o.go.fadeIn, 'enter: ' + (run ? 'the run\'s box' : 'the ride\'s box') + ': as the box plays (.wx-go) he fades in with the sky (rwx-fred-in), and his move starts then, not before'],
  [o.go.pausedWhileMoving === 0 && o.go.at55 === 1, 'enter: ' + (run ? 'the run\'s box' : 'the ride\'s box') + ': his move is not spent under the entrance: never paused while it runs, still moving 5.5 s after it started'],
];
section('enter', async () => { for (const run of [false, true]) { const o = await enterRun(HOOKED, run); for (const [c, n] of enterOk(o, run)) ok(c, n, o); } });

// ---- the plumbing fix: every frame of fred's move in a look, from the frame .fwm-go goes on to after it comes off; then a new app open
async function settleRun(page, k) {
  const rec = p => p.evaluate(() => { const R = window.__q98m = { f: [], on: true };
    const M = e => { const t = getComputedStyle(e).transform; if (!t || t === 'none') return [1, 0, 0, 1, 0, 0]; const m = new DOMMatrix(t); return [m.a, m.b, m.c, m.d, m.e, m.f]; };
    const tick = () => { if (!R.on) return; const f = document.querySelector('#rWeather>.rwx-fred'); if (f) { const q = s => [...f.querySelectorAll(s)];
      R.f.push({ t: performance.now(), go: f.classList.contains('fwm-go'), off: f.classList.contains('mo-off'), run: f.getAnimations({ subtree: true }).filter(a => a.playState === 'running' && String(a.animationName).startsWith('fw-')).length,
        it: f.getAnimations({ subtree: true }).filter(a => String(a.animationName).startsWith('fw-')).map(a => { const c = a.effect.getComputedTiming(); return [a.animationName, c.iterations, c.endTime]; }),
        parts: [...q('.fw-ch'), ...q('.fw-ch-eyes'), ...q('.fw-ch-wing'), ...q('.fw-ch-fizz circle'), ...q('.fw-wx-sweat'), ...q('.fw-wx-puff')].map(e => [...M(e), +getComputedStyle(e).opacity]) }); }
      requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  const x = await at(k, false, { motion: true, stay: true, before: rec }, page), p = x.p;
  const sum = () => p.evaluate(() => { const R = window.__q98m, F = R.f.splice(0), i0 = F.findIndex(v => v.go); if (i0 < 1) return { none: true, frames: F.length, i0 };
    const d = (a, b) => Math.max(...a.map((m, k) => Math.max(...m.map((v, n) => Math.abs(v - b[k][n]) * (n >= 4 && n < 6 ? 1 : 100))))); /* px for a move, x100 for a scale, a turn or an opacity */
    const i1 = F.findIndex((v, j) => j > i0 && !v.go), t0 = F[i0].t; let last = -1; F.forEach((v, j) => { if (v.run) last = j; });
    const loops = F.slice(i0).flatMap(v => v.it).filter(v => v[0] !== 'fw-ch-hop'), inf = loops.filter(v => v[1] === Infinity).map(v => v[0]), lateEnd = loops.filter(v => v[2] > 8000 + 20).map(v => v[0] + ' ' + Math.round(v[2]));
    return { on: d(F[i0 - 1].parts, F[i0].parts), off: i1 > 0 ? d(F[i1 - 1].parts, F[i1].parts) : null, offAt: i1 > 0 ? Math.round(F[i1].t - t0) : null, lastRun: last >= 0 ? Math.round(F[last].t - t0) : null,
      paused: F.slice(i0, i1 > 0 ? i1 : F.length).filter(v => v.off).length, inf: [...new Set(inf)], lateEnd: [...new Set(lateEnd)], restStill: i1 > 0 ? d(F[i1].parts, F[F.length - 1].parts) : null }; });
  await toY(p, '#rWeather'); await sleep(9300); const first = await sum();
  await appOpen(p); await sleep(9300); const second = await sum();
  await x.close(); return { first, second };
}
const settleOk = (s, k, when) => !s.none && s.on < 1 && s.off != null && s.off < 1 && s.lastRun != null && s.lastRun <= 8000 + 50 && !s.inf.length && !s.lateEnd.length && s.restStill < 1 && s.paused === 0;
section('settle', async () => {
  for (const k of ['sun', 'heat', 'freeze', 'rain']) { const r = await settleRun(HOOKED, k);
    ok(settleOk(r.first), 'settle: ' + k + ', at mount: every loop plays whole rounds that end by 8 s (none endless, none ending later), nothing runs after 8 s, no step in the frame .fwm-go goes on or comes off, at rest after (every frame read)', r.first);
    ok(settleOk(r.second), 'settle: ' + k + ', after a new app open: the same', r.second); }
});

// ---- loops made anew after the 6 s step (the entrance playing again on a fresh Crunch, the spot taken out and put back): the sun
// look's bob and flap end their last round at 6 s; at 6.5 s of play the action, then every frame of the bob (.fw-ch) and wings against
// their rest pose (read once he has settled), and every loop on them (iterations, end)
async function remakeRun(page, how, when = 6500) {
  const x = await at('sun', false, { motion: true }, page), p = x.p;
  const clock = () => p.evaluate(() => { const f = document.querySelector('#rWeather>.rwx-fred'), r = f && window.__q98.FWM.get(f); return r && r.m ? r.g + (r.gs != null ? performance.now() - r.gs : 0) : -1; });
  await p.evaluate(() => { const R = window.__q98r = { f: [], on: true }, M = e => { const t = getComputedStyle(e).transform; if (!t || t === 'none') return [1, 0, 0, 1, 0, 0]; const m = new DOMMatrix(t); return [m.a, m.b, m.c, m.d, m.e, m.f]; };
    const tick = () => { if (!R.on) return; const f = document.querySelector('#rWeather>.rwx-fred'); if (f) { const P = [...f.querySelectorAll('.fw-ch,.fw-ch-wing')];
      const r = window.__q98.FWM.get(f); R.f.push({ t: performance.now(), go: f.classList.contains('fwm-go'), st: r ? r.st : 0, parts: P.map(M), it: P.flatMap(e => e.getAnimations().map(a => { const c = a.effect.getComputedTiming(); return [String(a.animationName), c.iterations, Math.round(c.endTime)]; })) }); }
      requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  const t = Date.now(); let c = -1; while (Date.now() - t < 12000 && (c = await clock()) < when) await sleep(15);
  const t0 = await p.evaluate(how => { const W = document.getElementById('rWeather'), f = W.querySelector(':scope>.rwx-fred'), nx = f.nextSibling, t0 = performance.now();
    if (how !== 'crunch') { f.remove(); W.insertBefore(f, nx); if (how === 'put') window.__q98.wxFred(W, false); } return t0; }, how);
  if (how === 'crunch') await p.click('#calcBtn'); /* (the tap: Playwright scrolls the button into view, as a thumb would) */
  await sleep(2600); await until(() => p.evaluate(() => { const f = document.querySelector('#rWeather>.rwx-fred'); return f && !f.classList.contains('fwm-go'); }), 6000); await sleep(300);
  const F = await p.evaluate(() => { window.__q98r.on = false; return window.__q98r.f; }); await x.close();
  const rest = F[F.length - 1].parts, d = (a, b) => Math.max(...a.map((v, n) => Math.abs(v - b[n]) * (n >= 4 ? 1 : 100))), A = F.filter(v => v.t >= t0);
  let worst = { d: 0 }; A.forEach(v => v.parts.forEach((m, n) => { const q = d(m, rest[n]); if (q > worst.d) worst = { d: Math.round(q * 100) / 100, t: Math.round(v.t - t0), part: n }; }));
  const L = F.filter(v => v.st > 0).flatMap(v => v.it).filter(v => /fw-ch-(bob|flap)/.test(v[0])), loops = [...new Set(L.filter(v => isFinite(v[1])).map(v => v.join('/')))];
  /* (a loop the browser makes as the box's entrance shows him again is timed at its first frame, drawn untimed in it: at its start, the rest pose; worst reads it) */
  return { how, at: Math.round(c), frames: A.length, worst, loops, untimed: L.filter(v => !isFinite(v[1])).length, bad: loops.filter(v => { const [, i, e] = v.split('/'); return +i > 3 || +e > 6000 + 20; }) };
}
const remakeOk = r => r.at >= 6300 && r.at < 7500 && r.frames > 60 && r.worst.d <= .05 && !r.bad.length;
section('remake', async () => {
  for (const how of ['crunch', 'put', 'back']) { const r = await remakeRun(HOOKED, how);
    ok(remakeOk(r), 'remake: the sun look, ' + { crunch: 'a fresh Crunch (the box\'s entrance plays again)', put: 'the spot taken out and put back, wxFred after it', back: 'the spot taken out and put back alone (the loops timed as they start)' }[how] + ' at ' + r.at + ' ms of play: his bob and wings, done at 6 s, stay at rest every frame (worst ' + r.worst.d + ' from rest), any loop on them ending at 6 s (iterations 3)', r); }
});

// scrolled away between the 6 s step and the 8 s end (some loops have played their rounds, the blink has not), back 600 ms later: in
// the first frames he is on the screen again, each part with no loop still to play is in its rest pose (no frame mid-round, then a
// snap: Chromium draws a finished loop, paused, mid-round); every frame read, the rest pose taken once he has settled
async function backRun(page, k, away) {
  const x = await at(k, false, { motion: true }, page), p = x.p;
  const clock = () => p.evaluate(() => { const f = document.querySelector('#rWeather>.rwx-fred'), r = f && window.__q98.FWM.get(f); return r && r.m ? r.g + (r.gs != null ? performance.now() - r.gs : 0) : -1; });
  const t = Date.now(); let c = -1; while (Date.now() - t < 15000 && (c = await clock()) < away) await sleep(20);
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await until(() => spots(p).then(s => s && s[0].off), 3000); await sleep(600);
  await p.evaluate(() => { const R = window.__q98b = { f: [], on: true }, M = e => { const s = getComputedStyle(e), t = s.transform; let m = [1, 0, 0, 1, 0, 0]; if (t && t !== 'none') { const d = new DOMMatrix(t); m = [d.a, d.b, d.c, d.d, d.e, d.f]; } return [...m, +s.opacity]; };
    const tick = () => { if (!R.on) return; const f = document.querySelector('#rWeather>.rwx-fred'), rc = f.getBoundingClientRect(), parts = [...f.querySelectorAll('svg *')].filter(e => /\bfw-/.test(e.getAttribute('class') || '') || (e.tagName === 'circle' && e.closest('.fw-ch-fizz')));
      R.f.push({ on: rc.bottom > 0 && rc.top < innerHeight, off: f.classList.contains('mo-off'), go: f.classList.contains('fwm-go'), names: parts.map(e => (e.getAttribute('class') || e.tagName).split(' ')[0]), parts: parts.map(M),
        live: parts.map(e => e.getAnimations().some(a => a.playState !== 'idle' && a.effect.getComputedTiming().progress !== null)) }); requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  await toY(p, '#rWeather'); await until(() => p.evaluate(() => { const F = window.__q98b.f; return F.length > 3 && !F[F.length - 1].go; }), 5000); await sleep(300);
  const F = await p.evaluate(() => { window.__q98b.on = false; return window.__q98b.f; }); await x.close();
  const rest = F[F.length - 1], i = F.findIndex(v => v.on), d = (a, b) => Math.max(...a.map((v, n) => Math.abs(v - b[n]) * (n >= 4 && n < 6 ? 1 : 100)));
  const bad = i < 0 || rest.go ? ['never back on screen, or never at rest'] : F.slice(i, i + 3).flatMap((v, j) => v.parts.map((m, n) => !v.live[n] && d(m, rest.parts[n]) >= 1 ? 'frame ' + (j + 1) + (v.off ? ' (paused)' : '') + ': ' + v.names[n] + ' ' + d(m, rest.parts[n]).toFixed(1) + ' from rest' : null).filter(Boolean));
  return { k, away: Math.round(c), first: i, live: i >= 0 ? F[i].names.filter((n, j) => F[i].live[j]) : null, bad };
}
section('pause', async () => {
  const x = await at('sun', false, { motion: true }), p = x.p;
  await until(() => spots(p).then(s => s && s[0].go && s[0].run), 3000);
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); const a = await until(() => spots(p).then(s => s && s[0].off ? s : null), 3000);
  ok(!!a && a[0].go && a[0].run === 0 && a[0].lv, 'pause: scrolled off screen mid-move: paused (.mo-off, nothing running; fwMount\'s loopWhileVisible on his spot)', a || await spots(p));
  await toY(p, '#rWeather'); await until(() => spots(p).then(s => s && !s[0].off), 3000); await hidePage(p, true); await sleep(150); const b = await spots(p); await hidePage(p, false);
  ok(b[0].off && b[0].run === 0, 'pause: the page hidden mid-move: paused', b); await x.close();
  for (const [k, away] of [['sun', 6500], ['heat', 6600], ['freeze', 6300]]) { const r = await backRun(HOOKED, k, away);
    ok(r.away >= 6000 && r.away < 7800 && !r.bad.length, 'pause: ' + k + ', scrolled away after the 6 s step (' + r.away + ' ms of play) and back: in his first frames on the screen every part whose loop is done is at rest (no mid-round pose, then a snap)', r); }
  const y = await at('night', false, { motion: true }), q = y.p; await sleep(1500); const n0 = await spots(q);
  const lv = await q.evaluate(() => { const W = document.getElementById('rWeather'); return { box: window.__q98.LV.m.has(W), sky: W.dataset.sky || '' }; });
  await q.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); const n1 = await until(() => spots(q).then(s => s && s[0].off ? s : null), 3000);
  ok(n0[0].k === 'night' && !n0[0].go && n0[0].run === 0 && n0[0].lv && !!n1 && !lv.box && !lv.sky, 'pause: a clear night: fred still, his spot registered with loopWhileVisible (paused off screen), the box itself not watched (no sky loop: wxLoop leaves it)', { n0, n1, lv });
  await y.close();
});

section('still', async () => {
  const x = await at('rain', false, {}), p = x.p; await sleep(1200);
  const a = await p.evaluate(() => { const W = document.getElementById('rWeather'), f = W.querySelector('.rwx-fred'); return { rm: f.classList.contains('fw-rm'), go: f.classList.contains('fwm-go'), anim: W.getAnimations({ subtree: true }).filter(a => a.playState === 'running').map(a => a.animationName), drops: [...W.querySelectorAll('.rwx-rd')].filter(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > 0).length }; });
  ok(a.rm && !a.go && !a.anim.length, 'still: Reduce Motion: fred .fw-rm and still, nothing in the box animates (the sky as item 87 §8)', a);
  await x.close();
  const y = await at('rain', false, { motion: true, settings: { worldMotion: false } }), q = y.p; await sleep(1500);
  const b = await q.evaluate(() => { const W = document.getElementById('rWeather'), f = W.querySelector('.rwx-fred'), run = W.getAnimations({ subtree: true }).filter(a => a.playState === 'running').map(a => String(a.animationName));
    return { rm: f.classList.contains('fw-rm'), go: f.classList.contains('fwm-go'), fw: run.filter(n => n.startsWith('fw-')), sky: run.filter(n => n.startsWith('rwx-')).length }; });
  ok(b.rm && !b.go && !b.fw.length && b.sky > 0, 'still: Animate the world off: fred .fw-rm and still, while the sky\'s loops run on', b);
  await y.close();
});

section('media', async () => {
  const x = await at('fog', false, { motion: true }), p = x.p; await sleep(300);
  const m = () => p.evaluate(() => { const W = document.getElementById('rWeather'), f = W.querySelector('.rwx-fred'), r = f.getBoundingClientRect(); return { layer: getComputedStyle(f).display, svg: getComputedStyle(f.querySelector('svg')).display, box: Math.round(r.width), pad: parseFloat(getComputedStyle(W.querySelector('.rwx-temps')).paddingRight) }; });
  await p.emulateMedia({ media: 'print' }); const pr = await m();
  await p.emulateMedia({ media: 'screen', forcedColors: 'active' }); const fc = await m();
  await p.emulateMedia({ media: 'screen', forcedColors: 'none' }); const sc = await m();
  ok(pr.layer === 'none' && pr.pad === 0, 'media: print: his layer out with the sky, the reading\'s room given back', pr);
  ok(fc.svg === 'none' && fc.layer === 'block' && fc.box > 0 && fc.pad > 0, 'media: forced colours: his drawing out, his box (and the reading\'s room) kept', fc);
  ok(sc.svg !== 'none' && sc.layer === 'block' && sc.pad > 0, 'media: on screen he shows', sc);
  await x.close();
});

section('once', async () => {
  const x = await at('wind', false, { motion: true }), p = x.p; await onceOk(p, 'the ride\'s results');
  await sport(p, 'run'); await crunch(p); await sleep(400);
  const b = await p.evaluate(() => ({ ride: getComputedStyle(document.getElementById('results')).display, run: !document.getElementById('runResults').hidden }));
  ok(b.ride === 'none' && b.run, 'once: crunching a run after a ride: the ride\'s box is no longer shown', b);
  await onceOk(p, 'the run\'s results after a ride'); for (const y of [0, 400, 1200]) { await p.evaluate(y => window.scrollTo(0, y), y); await sleep(150); await onceOk(p, 'the run scrolled to ' + y); }
  await x.close();
});

// ---- self-tests: mutated copies of the page, each must fail the check that guards it
const mutate = (name, edit) => { const f = hooked(PAGE, 'q98-' + name + '.html', s => { const t = edit(s); if (t === s) throw new Error('mutation ' + name + ' changed nothing'); return t; }); MADE.push(f); return f; };
section('self', async () => {
  // a loop that has played its rounds left on its part: paused after the step, Chromium draws it mid-round
  const m0 = mutate('back', s => s.replace(' a.onfinish=()=>a.cancel();', ''));
  const r0 = await backRun(m0, 'sun', 6500);
  ok(r0.bad.length > 0, 'self: finished loops left on their parts (no cancel) fail pause: back on the screen after the step, fred shows a mid-round pose', r0);
  // the sub-line under the square with the room on the whole reading (the first build): its last word orphaned
  const m6 = mutate('sub', s => s.replace(':is(.rwx-temps,.rwx-main:not(.sub-wide) .rwx-sub){padding-right', '.rwx-main{padding-right'));
  const y6 = await at('night', false, { width: 390 }, m6), a6 = await room(y6.p, false, false); await y6.close();
  ok(roomBad(a6) && a6.subWide && Math.abs(a6.subEdge) > .5, 'self: the room on the whole reading (the sub-line under the square short of the card\'s edge) fails room', a6);
  // rain with the flap
  const m1 = mutate('flap', s => s.replace("const WX_FRED={rain:{}, ", "const WX_FRED={rain:{cls:'fw-bird'}, "));
  const x = await at('rain', false, {}, m1), L = await lookOf(x.p, false); await x.close();
  ok(lookChecks(L, 'rain', false).some(([c]) => !c), 'self: rain drawn with the fw-bird wrapper (the flap) fails looks', L);
  // item 97's plumbing (endless loops cut at 8 s): the puffs snap
  const main97 = fs.readFileSync(PAGE, 'utf8'), A = main97.indexOf('function fwmA(a, r){'), B = main97.indexOf('\nfunction fwMount(');
  const OLD = "function fwmA(a, r){ r.a.add(a); const e=a.effect; let t=e && FWT.get(a); if(e && !t) FWT.set(a, t=e.getTiming());\n  const d=t ? +t.duration : 0; if(!(d>0) || t.iterations!==Infinity) return; const o=x=>((-t.delay)%x+x)%x;\n  if(/^alternate/.test(t.direction)){ const w=((d/2-o(2*d))%d+d)%d; e.updateTiming({delay:w, iterationStart:((o(2*d)+w)/d)%2, iterations:Infinity}); }\n  else if(d<=FW_SETTLE_MS/2) e.updateTiming({delay:(d-o(d))%d, iterationStart:0, iterations:Infinity});\n  a.currentTime=fwmClock(r); if(r.st) fwmEnd(a, r.st); }\nfunction fwmEnd(a, at){ const e=a.effect, t=e.getTiming(), d=+t.duration, s=t.iterationStart||0, p=s+(at-t.delay)/d; if(!(d>0) || t.iterations!==Infinity || !(p>=s)) return; const i=Math.floor(p);\n  e.updateTiming({iterations:(/^alternate/.test(t.direction) ? i+(p-i<.5 ? .5 : 1.5) : i+1)-s}); }";
  const TICK = "function fwmTick(el, r){ r.t=0; if(FWM.get(el)!==r || !r.m) return; if(r.st) return fwmRest(el, r);"; /* item 97's first line of it (the cut at 8 s by the clock) */
  const m2 = mutate('plumb97', s => { if (!(A > 0 && B > A)) return s; s = s.slice(0, A) + OLD + s.slice(B); const t = s.indexOf('function fwmTick('); return t < 0 ? s : s.slice(0, t) + TICK + s.slice(s.indexOf('\n', t)); });
  const r2 = await settleRun(m2, 'sun'), snap = Math.max(r2.first.off || 0, r2.second.off || 0);
  ok(!settleOk(r2.first) && snap >= 1, 'self: item 97\'s plumbing (endless loops, cut at 8 s by the clock) fails settle on the sun look: his blink, whose second round ends at 8 s of its own time, is cut half open (a step of ' + snap + ' in the frame .fwm-go comes off)', r2);
  // no entrance rule: fred moves (paused, unseen) while the box waits
  const m3 = mutate('enter', s => s.replace('.r-wx.wx-arm>.rwx-fred{display:none!important} ', ''));
  const r3 = await enterRun(m3);
  ok(enterOk(r3).some(([c]) => !c), 'self: without the entrance rule fred starts moving while the box waits: enter fails', r3);
  // the entrance rule for the ride's box only: on the run fred shows, and moves, while its box waits
  const m3b = mutate('runenter', s => s.replace('.r-wx.wx-arm>.rwx-fred{display:none!important} ', '#results>.r-wx.wx-arm>.rwx-fred{display:none!important} '));
  const r3b = await enterRun(m3b, true);
  ok(enterOk(r3b, true).some(([c]) => !c), 'self: the entrance rule for the ride\'s box only fails enter on the run\'s box', r3b);
  // the run's box on the computer layout without fred
  const m7 = mutate('deskrun', s => s.replace('/* }} q98 fred */', 'html.dk #runWx>.rwx-fred{display:none!important} html.dk #runWx .rwx-temps{padding-right:0!important}\n/* }} q98 fred */'));
  const y7 = await at('rain', true, { desk: true, width: 1280, height: 800 }, m7), g7 = await geo(y7.p, true); await y7.close();
  ok(!g7.on, 'self: no fred in the run\'s box on the computer layout fails desk (it is checked there)', g7);
  // no room for the reading
  const m4 = mutate('room', s => s.replace(' .rwx-sub){padding-right:calc(var(--wxf) * 1.21 - 10px)}', ' .rwx-sub){}'));
  const y = await at('rain', false, { width: 390 }, m4), a = await room(y.p, false, false), b = await room(y.p, false, true); await y.close();
  ok(roomBad(a) || roomBad(b, true), 'self: no padding for the reading: a word runs under fred (room fails)', { a, b });
  // a key that is not the look: every re-render draws him anew
  const m5 = mutate('key', s => s.replace("key='wx:'+k,", "key='wx:'+k+Math.random(),"));
  const r5 = await keepRun(m5);
  ok(keepOk(r5).some(([c]) => !c), 'self: a key that is not the look (a new one each render) fails keep', { mid: r5.mid.same, after: r5.after.same, fresh: r5.fresh.same });
  // a fade longer than the old spot's 520 ms (cut off with a jump), and the room dropped while the old fred fades out
  const m8 = mutate('fade', s => s.replace('.rwx-fred.rwx-x{transition:opacity 480ms', '.rwx-fred.rwx-x{transition:opacity 3000ms'));
  const r8 = await keepRun(m8), k8 = keepOk(r8);
  ok(!k8[5][0], 'self: a 3 s fade (the old spot taken out at 520 ms, mid-fade) fails keep\'s frame-by-frame fade check', r8.fade);
  const m9 = mutate('fredout', s => s.replace('.r-wx:is([data-fred],[data-fred-out]) :is(.rwx-temps,', '.r-wx[data-fred] :is(.rwx-temps,'));
  const r9 = await keepRun(m9), k9 = keepOk(r9);
  ok(!k9[8][0], 'self: the room dropped as soon as the card has no look (no data-fred-out rule) fails keep: words run under the fading fred', r9.none);
});

section('self2', async () => {
  // the faded-in look mounted still: it never moves (rule a: it must)
  const m10 = mutate('newstill', s => s.replace("W.querySelector(':scope>.rwx-fog').after(N); fwMount(N, h, key, o);", "W.querySelector(':scope>.rwx-fog').after(N); fwMount(N, h, key, fade ? Object.assign({}, o, {still:true}) : o);"));
  const r10 = await keepRun(m10), k10 = keepOk(r10);
  ok(!k10[7][0], 'self: the faded-in look mounted still fails keep: it must move once its look has changed', r10.move);
  // loops made anew after the step ended by the clock (a frame ahead of their own time: one round more) and left to finish
  const m11 = mutate('remake', s => s.replace('if(r.st) fwmEnd(a, r.se); const c=e.getComputedTiming(); if(c.localTime>=c.endTime) a.cancel(); }', 'if(r.st) fwmEnd(a, r.st); }'));
  const r11 = await remakeRun(m11, 'crunch');
  ok(!remakeOk(r11) && r11.worst.d > 1, 'self: loops made anew after the step ended by the clock fail remake: his bob and wings move again after a fresh Crunch at 6.5 s (worst ' + r11.worst.d + ' from rest)', r11);
  // a smaller fred (70 px): the place and size checks
  const m12 = mutate('small', s => s.replace('.r-wx{--wxf:88px}', '.r-wx{--wxf:70px}'));
  const y12 = await at('rain', false, { width: 390 }, m12), g12 = await geo(y12.p, false); await y12.close();
  ok(g12.on && off88(g12), 'self: a fred of 70 px fails size (his base box ' + g12.box.join(' x ') + ', ' + g12.inR + ' px in, ' + g12.inT + ' px down)', g12);
});

section('main', async () => {
  if (!MAIN) { console.log('  note: no main page given: the main checks are skipped'); return; }
  const x = await at('rain', false, {}, MAIN), L = await lookOf(x.p, false); await x.close();
  ok(L.none, 'main: no fred on main (the looks check fails there)', L);
});

for (const [n, f] of sections) {
  if (ONLY.length && !ONLY.includes(n)) continue;
  console.log('-- ' + n);
  try { await f(); } catch (e) { ok(false, n + ': threw', String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); }
}
const errs = ERRS.flat();
ok(!errs.length, 'no page errors or console errors', errs.slice(0, 8));
await browser.close();
for (const f of MADE) fs.rmSync(f, { force: true });
C.done('item 98: Weather card, fred in the living sky');
