// node q99.test.mjs <null.html> [main null.html]   (cd into this folder first) -- item 99: Your rider, and the rider on the Closet card.
// Every numbered point, QA line and decision (DECISIONS.md "Item 99"):
//   cache    sw.js CACHE and APP_BUILD match, v123 or later; the bundle is the design chat's v7 (FW.built 2026-11-08 09:29) or later, and each
//            inlined block is that build byte for byte (its sha1 in BUILDS: a hand edit fails; a newer build fails until its sha1 is added)
//   row      99.1: Settings › You has the row Your rider (a sheet row, searchable; with Settings on Running, a search for it names
//            the row under Cycling, one tap away, never a blank page; and back: on Cycling, a Running-only match is named under
//            Running; the button 4.5:1), "Not set" until a rider is built, then the jersey; it opens
//            the sheet titled Your rider with no "Saves as you type." line (a tap saves); the sheet's words are titles and labels only
//   sheet    99.1: the live rider on top (FW.riderOutfit of the rider shown, ids aside; still), then Look / Gear / Kit (v-folds, closed the
//            first time, aria-expanded), each with a one-line summary that names the choices ("Coral jersey · dots · navy shorts"); every
//            option of every FW.RIDER_OPTIONS field is a button named from FW.RIDER_NAMES (or the option's own name) by aria-label, with
//            aria-pressed, exactly one pressed per group (the rider's value), each at least 44 x 44 px; each group is a group named by its
//            label (VoiceOver: the accessibility tree, Playwright's aria snapshot: every swatch's name, the pressed one pressed, inside
//            its labelled group); the jersey's fade and sleeves under More colours (hidden until opened, aria-expanded); lens and frame
//            hidden with no glasses; keyboard: one Tab stop per group (the pressed one), the arrow keys (left / right, up / down) move and
//            choose within it, wrapping at both ends; the live rider is on top (before the groups, above the first) and a still fwMount spot;
//            each swatch is painted its own option's colour (skin FW.SKIN, "Same as jersey" the jersey's) and no two swatches of a field
//            look alike, for every jersey ("Same as jersey" carries a ring of its own: a black jersey's fade has Black too); the pressed
//            choice is marked in normal colours (a ring on a swatch, a fill on a word); the Look summary reads per hair style ("dark brown
//            ponytail", "dark brown head covering": the bundle draws 'covered' as a covering, its colour field then "Covering colour");
//            the folds are remembered on this device (closed, reopened, reloaded); with Covered the six colours are a covering's (plain
//            colours: Rust and Gold, not Auburn and Blond, in the buttons' names, the field's name and the summary); no glasses: the Gear
//            summary says so; a typical rider's summaries are one line at 390 px (RIDER99's, the default's), the longest choices wrap to
//            two lines at most and are never cut (no ellipsis, nothing hidden: the round's 150% and 200% text); each swatch's edge stands out from the sheet (it, or the swatch, 3:1 against the panel: a White one on white);
//            the live rider follows each tap with the sheet still open (every jersey) and shows as painted (see "painted" below);
//            (review round 4) the live rider stays in view while choosing (stuck under the title bar: after a tap in each field, every
//            group open, it is wholly in view, redrawn, the button not under it; Tab and Shift+Tab never leave focus under it; at 390 px,
//            320 px with 200% text and the computer layout); with Covered the colour field and the Look summary name what it colours
//            ("Covering and beard colour", "black head covering and beard"); the glasses 'pair' reads "glasses" in the Gear summary; each
//            label is the bundle's name of the choice pressed; the pressed mark can be seen (the ring 3:1 on the panel, a word's fill 3:1
//            against an unpressed one and its words 4.5:1); the live rider is kept by its key (reopened, re-tapped, riderApply)
//   build    99.2: settings.rider absent until built (opening and closing the sheet stores nothing; no DEFAULT_SETTINGS entry: absent at
//            boot, in the stored copy and in a fresh page's settings); a tap stores the whole rider (every bundle field, checked);
//            a rider built, closed (Done) and reopened is the same (every pressed swatch, summary and the live rider), and after a reload;
//            the row then names the jersey; right after the taps the live rider is the rider built; tapping the choice already pressed builds the rider (the default rider stored); not built,
//            the sheet names the default rider's choices (each field's name, the three summaries: face none, a plain jersey, shield glasses);
//            right after the taps each label is the bundle's name of the choice made
//   norm     99.2: riderNorm with tampered values for every field (a number, null, an object, an unknown string, '__proto__',
//            'constructor', 'toString', a near-miss colour) and a rider that is not an object: on load (stored on the device), on
//            restore (a backup) and when synced settings arrive (the cloud, the q91 Firebase stand-in): each tampered field is its
//            default, the others are kept, keys the bundle has no field for are gone; the sheet and the avatar draw that rider; no errors;
//            the merge itself (sfDocMerge) run again on the cloud copy pulled brings nothing new for the rider and queues no rider upload;
//            (review round 4) and a rider whose fields hold values another field offers (BAD_X: a jersey colour for the skin and the
//            helmet, a sleeve colour for the frame, a hair style for the glasses ...) is each field's default on load, restore and sync
//   backup   99.5: a backup made here carries the rider (backupData, the app's own export) and brings it to a fresh page; a backup
//            from before item 99 (no settings.rider) restores without losing this device's rider (as birthday and gender);
//            a backup with a rider brings it; a tampered one draws the default
//   sync     99.2, QA: two devices (the q91 Firebase stand-in): A builds a rider, B (not pulled yet) saves an unrelated setting, both
//            sync: A's rider on both and in the cloud, B's setting on both; the rider is one key (users/u1.settings.rider whole, one
//            settingsAt stamp, no dotted part of it written); then B changes the rider already built (two taps): B's whole rider on A, on
//            B and in the cloud, one stamp newer than A's, A's header circle redrawn; then A changes it while B (not pulled) saves an
//            unrelated setting: A's rider stands on both
//   private  99.5: the troubleshooting copy leaves the rider out (no rider key, none of its values, no strip); no AI prompt has it (every
//            prompt kind, and a static scan: the prompt builder reads no settings.rider); (review round 4) nor by name: every prompt is the
//            same with the rider as without it and holds none of its summaries or chosen names, and outside the rider's own code only the
//            functions RIDER_USERS names read it or call into it; the privacy note's "What's stored" names "your rider's look"
//   avatar   99.3: signed out: the outline (header) and the empty circle (#sbAv), built or not; signed in, not built: the initial; signed
//            in and built: the rider (FW.riderAvatar of the rider, ids aside) in the header circle at 32 px and in #sbAv at 30 px on the
//            computer layout, the initial kept under it (print and forced colours show it, no art); the same on the run (graphite);
//            the header's sync badge still follows the sync state with the rider in the circle (offline: data-st and the badge; back: synced);
//            #sbAv is kept by its key (offline, online and its re-renders draw nothing again); the header's rider is drawn once on a
//            signed-in load (one drawing from before sign-in is known through sign-in and the pulls); both avatars show as painted
//   strip    99.4: hot, mild, cold, freezing and wet rides (each its own forecast) and a Hard freezing and a Recovery cold one (the effort
//            tapped), the starter closet and every catalog item, the default rider and the built one (RIDER99) on each: the
//            strip (#rRider, above the list, 100 x 150 px, aria-hidden, no text) gets exactly outfit()'s list (o.wear) with only string
//            ids FW.OUTFIT_LOOK has as its own, in its order; its drawing is FW.riderOutfit(rider, those ids) (ids aside); each item it
//            lists shows on it (leave-one-out at strip size, and its own colour where it has one: knee grey and the like), the under-
//            layers drawn by design as nothing aside (with v7 also wool socks under any foot cover, everything under the rain jacket,
//            a thermal jersey under any sleeved outer piece) and the known v7 gaps (V7_GAPS, each tied to its FROM-APP-CHAT-6 point and
//            as wide as measured on v7: 1 leg wear under overshoes, 2 the shoe covers' own colour (their pixels changed still judged),
//            3 dark gloves on deep brown skin, the fingerless ones' own colour only; and, held until the app chat decides, a proposed point
//            4: the winter jacket's own colour on a Black jersey, the thermal jersey in Black under the vest with arm warmers) printed as
//            notes; every v6 gap v7 fixed is judged
//            (a ride or a direct list where no ride reaches it: the rain jacket over the jackets, a windbreaker over a thermal jersey,
//            the skullcap with glasses none, which leaves the eyes alone) and printed with its least measurement, and so is each
//            by-design rule's edge (wool socks with toe covers or bare shoes, the vest and a thermal jersey with no rain jacket or
//            sleeves over them); the detector's self-test: bib shorts (nothing in every version) not showing; the built rider and
//            every other skin are judged on the same lists (the default rider in that skin), and every jersey colour (both riders, the
//            direct lists too: review round 4); the strip
//            is kept by its key (re-rendered results draw nothing again); a rider changed while the results are up (in the sheet, by sync,
//            by a restore) redraws
//            the strip shown; a ride that warms (items shed on the way) lists them all; a closet item of your own and a tampered '__proto__' /
//            'constructor' closet id never reach the strip and never break it; the Clothing-only results (renderClothingOnly) have the strip
//            too, and it follows a closet change there; on every ride and closet the strip shows as painted (and on the computer layout);
//            a rider arriving by sync with the sheet open: the sheet (pressed, names, summaries, its live rider) and the row follow
//   painted  (review round 3) the strip, the sheet's live rider and both avatars as the page paints them: the spot's svg screenshot at dpr 2
//            against FW.plain of the same drawing at that size on the colour behind it (at most 0.5% of the pixels more than 48 apart;
//            an avatar inside its circle) and nothing up the tree that hides or cuts it (opacity, visibility, clip-path, filter, mask)
//   still    the strip, the sheet's rider and both avatars never move: no .fwm-go, nothing running, with Reduce Motion, with the switch
//            off and on, seen, scrolled to and after a new app open
//   media    print: no strip, the avatars' initial, no sheet rider; forced colours (dark and light): no strip, the initial, no sheet rider,
//            every swatch keeps its colour with a CanvasText edge (the pressed one a Highlight ring), "Same as jersey" its ring, the pressed one ringed, the word buttons' pressed one marked
//   fit      320 px and 200% text: the sheet (every group open, More colours) has no sideways scroll, every button 44 px or more, nothing
//            past the sheet, no summary cut; the strip inside its card; the computer layout: the sheet is the pane beside the list, the strip in the
//            results column; the sheet's rider and the strip as painted at each of these sizes (review round 4)
//   main     (with [main null.html]) main has no Your rider row and no strip (the row check fails there)
// Q99_ONLY=section,section runs some sections.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';
import { checker, open, reload } from '../lib/open.mjs';
import { crunch, toY, settle, weatherRouteFor, RIDER99 } from '../lib/screens.mjs';
import { Backend, syncPageSource } from '../q91/fbmock.mjs';

const PAGE = path.resolve(process.argv[2] || '../../fred99/null.html'), MAIN = process.argv[3] ? path.resolve(process.argv[3]) : null;
const ONLY = (process.env.Q99_ONLY || '').split(',').filter(Boolean);
const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = process.env.Q99_REPO || path.resolve(HERE, '../../wt-q99');
const C = checker('q99 '), ok = C.ok, ERRS = [];
const SRC = fs.readFileSync(PAGE, 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000, step = 100) { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); } catch (e) { v = null; } if (v) return v; await sleep(step); } return v; }
const browser = await chromium.launch();

// the hooked copy (the rider's code lives inside the app's strict-mode function; this copy hands some of it out, as q97 and q98 do)
const HOOK = "\nObject.defineProperty(window,'__q99',{configurable:true,get(){ return {FWM, AOPEN, riderNorm, riderNow, riderIds, riderApply, outfit, readInputs, dbgDump, aiFill, AI_CARD, backupData, closetItemFromCatalog, CLOSET_CATALOG, CLOSET_STARTER, refreshResults, sbAcctRender, sfDocMerge, save, KEYS, DEFAULT_SETTINGS, get lastResult(){ return lastResult; }, get settings(){ return settings; }, set settings(v){ settings=v; }}; }});\n";
function hooked(page, name = 'q99-hook.html', hook = HOOK) { const src = fs.readFileSync(page, 'utf8'), k = src.indexOf("\n'use strict';\n"); if (k < 0) throw new Error("no 'use strict' line in " + page);
  const f = path.join(path.dirname(page), name), at = k + "\n'use strict';".length; fs.writeFileSync(f, src.slice(0, at) + hook + src.slice(at)); return f; }
const HOOKED = hooked(PAGE), MADE = [HOOKED];
const syncOf = f => { const g = f.replace(/\.html$/, '-sync.html'); fs.writeFileSync(g, syncPageSource(fs.readFileSync(f, 'utf8'))); MADE.push(g); return g; };
const SYNCED = syncOf(HOOKED);
// a copy that also records every drawing put in the header circle's .av-r (from the app's first line on, before sign-in is known): the
// avatar section's check that the header's rider is drawn once on a signed-in load and kept (review round 3)
const AVWATCH = HOOK + "new MutationObserver(R=>R.forEach(m=>{ if(m.target.nodeType===1 && m.target.matches('.hav>.av-r')) m.addedNodes.forEach(n=>{ if(n.nodeType===1 && n.matches('svg')) (window.__q99hav||(window.__q99hav=[])).push(n); }); })).observe(document.documentElement, {subtree:true, childList:true});\n";
const AVW = hooked(PAGE, 'q99-av.html', AVWATCH); MADE.push(AVW); const AVW_SYNCED = syncOf(AVW);

const NOW = '2026-10-29T15:00:00-07:00';
// the bundle builds this item may ship: the sha1 of each handoff file, trimmed (as fw-inline.mjs inlines it). v7 09:29, the build the
// independent check confirmed (probe99/verify-bundle5.json; handoff sha256 js b033ddbb..., css 94077852...). v6 22:08 (css fa534ae6...,
// js ed9957e7...) went with v7: the strip check holds only v7's gaps, so a v6 page is not this item. The item that takes v8 adds its sha1
const BUILDS = { '2026-11-08 09:29 EST': { css: '71e5e2c4a305377330ee5bf2e82b5e1cfae6b0cd', js: 'fa84301fd127321cf804fb13be29f962cb8a1768' } };
// a page: athlete A, the hooked copy, a made-up forecast (wx: its day's temperatures and rain), motion on unless o.motion === false
const openH = (o = {}) => open(o.file || HOOKED, Object.assign({ athlete: 'A', browser, motion: true, repo: REPO, now: NOW, settle: 600 }, o, {
  route: (r, u) => (o.route && o.route(r, u)) || (o.forecast === false ? null : weatherRouteFor(o.wx || {})(r, u)) })).then(x => { if (!o.noErrs) ERRS.push(x.errors); x.p.on('dialog', d => d.accept()); return x; });
const WHO = { uid: 'u1', email: 'u1@example.com', displayName: 'Test u1' };
const signedIn = () => ({ '__mock_user': WHO, '__mock_auth': 'u1', 'bluebird.owner.v1': { uid: 'u1', name: WHO.displayName, email: WHO.email, photo: '', signedIn: true } });
const synced = (be, o = {}) => openH(Object.assign({ file: o.file || SYNCED, settle: 1200 }, o, { storage: Object.assign(signedIn(), o.storage || {}), route: be.handler(o.label || 'a') }));
const LS = (p, k) => p.evaluate(n => { try { return JSON.parse(localStorage.getItem(n)); } catch (e) { return null; } }, k);
const stored = p => LS(p, 'bluebird.settings.v2').then(v => v || {});
const doc = be => be.fs.get('users/u1') || {};
async function nudge(pages, cond, ms = 45000) { const t = Date.now(); while (Date.now() - t < ms) { for (const pg of pages) await pg.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(1500); const v = await cond().catch(() => null); if (v) return v; } return null; }
const ready = async (be, ...xs) => { for (const x of xs) await until(() => x.p.evaluate(() => { const o = JSON.parse(localStorage.getItem('bluebird.synccursor.v1') || 'null'); return !!(o && o.full); }), 20000); await until(() => doc(be).settings, 15000); };

const FIELDS = Object.keys(RIDER99); // the bundle's rider fields (lib/screens.mjs RIDER99 sets every one)
const J = v => JSON.stringify(v, (k, x) => x && typeof x === 'object' && !Array.isArray(x) ? Object.keys(x).sort().reduce((o, n) => { o[n] = x[n]; return o; }, {}) : x); // equal by value, whatever the key order
const norm = h => String(h).replace(/\b(fw-[a-z]+)\d+/g, '$1#'); // a drawing's ids, numbered afresh by each FW call
// Settings › You › Your rider (the header's account button, or the sidebar's on the computer layout)
async function toSettings(p) { await p.click('#syncHdrIn:visible, #syncHdr:visible, #sbAcct:visible'); await until(() => p.evaluate(() => document.getElementById('view-profile').classList.contains('active'))); await settle(p, 150); }
async function sheet(p) { await toSettings(p); await p.click('#prowBtn-rider'); await until(() => p.evaluate(() => document.getElementById('setSheet').classList.contains('open') && !document.getElementById('prowB-rider').hidden)); await settle(p, 150); }
async function done(p) { await p.click('#setSheetDone'); await until(() => p.evaluate(() => !document.getElementById('setSheet').classList.contains('open'))); await settle(p, 100); }
async function group(p, g, open = true) { const h = '#rdGroups [data-fold="rider-' + g + '"] .v-fold-h'; if (((await p.getAttribute(h, 'aria-expanded')) === 'true') !== open) await p.click(h); }
async function allOpen(p) { for (const g of ['look', 'gear', 'kit']) await group(p, g); if ((await p.getAttribute('#rdMore', 'aria-expanded')) !== 'true') await p.click('#rdMore'); }
async function tap(p, k, v) { const s = `#rdGroups [data-rd="${k}"][data-v="${v}"]`; await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), s); await p.click(s); }
// the sheet as shown: each field's pressed value(s), the shown names, the summaries, the live rider (normalised) and the rider it should be
const sheetOf = p => p.evaluate(F => { const pressed = {}, names = {};
  F.forEach(k => { pressed[k] = [...document.querySelectorAll(`#rdGroups [data-rd="${k}"][aria-pressed="true"]`)].map(b => b.dataset.v); const n = document.getElementById('rdN-' + k); names[k] = n ? n.textContent : null; });
  const sums = ['look', 'gear', 'kit'].map(g => (document.getElementById('rdS-' + g) || {}).textContent), fig = document.querySelector('#rdFig'), r = window.__q99 ? window.__q99.riderNow() : null;
  const nm = h => String(h).replace(/\b(fw-[a-z]+)\d+/g, '$1#');
  return { pressed, names, sums, title: document.getElementById('setSheetTitle').textContent, hint: !document.getElementById('setSaveHint').hidden, figSame: !!fig && !!r && nm(fig.innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: window.FW.riderOutfit(r) }).innerHTML), fig: !!(fig && fig.querySelector('svg')), r }; }, FIELDS);
// what a rider's summaries say (the names from the bundle, as the app writes them)
// a head covering's colours are plain colours (the bundle's names are hair names: no "blond head covering")
const COVER = { '#C8743C': 'Rust', '#E9C46A': 'Gold' };
const sumsOf = (p, r) => p.evaluate(([r, COVER]) => { const n = k => { const o = FW.RIDER_OPTIONS[k]; return k === 'hair' && r.hairStyle === 'covered' && COVER[r[k]] || (Array.isArray(o) ? FW.RIDER_NAMES[k][r[k]] : o[r[k]]); }, lc = s => s.charAt(0).toLowerCase() + s.slice(1);
  // with Covered the bundle draws a beard or mustache in the covering's colour: "gold head covering and beard" (review round 4); the glasses
  // 'pair' is "glasses" ("pair" alone names nothing, folded or read out: review round 4)
  const hs = r.hairStyle, hc = lc(n('hair')), fc = r.face !== 'none' ? lc(n('face')) : '', cov = hs === 'covered', hair = cov ? hc + ' head covering' + (fc ? ' and ' + fc : '') : hs === 'pony' || hs === 'braids' ? hc + ' ' + lc(n('hairStyle')) : lc(n('hairStyle')) + ' ' + hc + ' hair';
  return [`${n('skin')} skin · ${hair}${fc && !cov ? ' · ' + fc : ''}`, `${n('helmet')} helmet · ${r.glasses === 'none' ? 'no glasses' : (r.glasses === 'pair' ? 'glasses' : lc(n('glasses'))) + ' · ' + lc(n('lens')) + ' lens'}`, `${n('kit')} jersey · ${lc(n('pattern'))} · ${lc(n('shorts'))} shorts`]; }, [r, COVER]);
// each field's chosen name for a rider (the bundle's names; a covering's colour plain)
const namesOf = (p, r) => p.evaluate(([r, F, COVER]) => Object.fromEntries(F.map(k => { const o = FW.RIDER_OPTIONS[k]; return [k, k === 'hair' && r.hairStyle === 'covered' && COVER[r[k]] || (Array.isArray(o) ? FW.RIDER_NAMES[k][r[k]] : o[r[k]])]; })), [r, FIELDS, COVER]);
// in the page: WCAG contrast (rgbOf an rgb()/rgba() string; over: a on b; bgOf: the first opaque background up the tree)
const CONTRAST = `const rgbOf=s=>(String(s).match(/[\\d.]+/g)||[]).map(Number), over=(a,b)=>{ const al=a.length>3?a[3]:1; return [0,1,2].map(i=>a[i]*al+b[i]*(1-al)); },
  lum=c=>{ const f=v=>{ v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4); }; return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]); },
  ratio=(a,b)=>{ const x=lum(a), y=lum(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); },
  bgOf=e=>{ for(let n=e;n&&n.nodeType===1;n=n.parentElement){ const c=rgbOf(getComputedStyle(n).backgroundColor); if(c.length&&(c.length<4||c[3]>0)) return c.slice(0,3); } return [255,255,255]; };`;

// the rider as painted (review round 3: the markup can be right while the page shows none of it, or half). The spot's svg is screenshot (the
// page at dpr 2) and set against the same drawing made plain (FW.plain) at that size on the colour behind it (the svg's own background
// first: an avatar's disc is a CSS background, not drawn in an <img>): the pixels more than 48 apart in a channel (the round's measure; an
// avatar inside its circle only, the corners being the page's). The screenshot takes 2 CSS px more on each side and the drawing is matched
// at the best of the device-pixel offsets up to 2 each way (a spot on a half pixel, #sbAv at y .5, is painted where Chromium snaps it).
// And up the tree from the svg, nothing that hides or cuts it: opacity, visibility, clip-path, filter, mask. what: 'strip'
// (FW.riderOutfit(rider, the strip's ids)), 'fig' (FW.riderOutfit(rider)) or an avatar's size (FW.riderAvatar(rider, size))
const PAINT = 0.005; // the share of the compared pixels that may be apart (the antialiased edges: the strip as built measured 0)
async function paintOf(p, sel, what) {
  await p.evaluate(() => Promise.race([Promise.all(document.getAnimations().filter(a => a.playState === 'running' && isFinite(a.effect && a.effect.getComputedTiming().endTime)).map(a => a.finished.catch(() => {}))), new Promise(r => setTimeout(r, 2000))])); /* a sheet still sliding in */
  await p.evaluate(s => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }); }, sel); await settle(p, 60);
  const rc = await p.evaluate(s => { const e = document.querySelector(s), r = e && e.getBoundingClientRect(); if (!r || !r.width || !r.height) return null;
    const x = Math.max(0, Math.floor(r.left) - 2), y = Math.max(0, Math.floor(r.top) - 2); return { x, y, width: Math.min(innerWidth, Math.ceil(r.right) + 2) - x, height: Math.min(innerHeight, Math.ceil(r.bottom) + 2) - y }; }, sel);
  if (!rc) return { none: true, sel };
  const shot = (await p.screenshot({ clip: rc })).toString('base64');
  await p.evaluate(`(()=>{ ${CONTRAST} window.__c={rgbOf, over, ratio, bgOf}; })()`);
  return p.evaluate(async ([s, what, b64, lim, clip]) => { const e = document.querySelector(s), dpr = devicePixelRatio, rc = e.getBoundingClientRect(), W = Math.round(rc.width * dpr), H = Math.round(rc.height * dpr), r = window.__q99.riderNow(), C = window.__c;
    const mk = what === 'strip' ? FW.riderOutfit(r, document.getElementById('rRider')._ids || []) : what === 'fig' ? FW.riderOutfit(r) : FW.riderAvatar(r, +what), bg = C.bgOf(e);
    const img = async src => { const i = new Image(); i.src = src; await i.decode(); return i; }, data = (i, w, h, fill, sw, sh) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true });
      if (fill) { x.fillStyle = 'rgb(' + fill.join(',') + ')'; x.fillRect(0, 0, w, h); } x.drawImage(i, 0, 0, sw || w, sh || h); return x.getImageData(0, 0, w, h).data; };
    const si = await img('data:image/png;base64,' + b64), SW = si.naturalWidth, SH = si.naturalHeight, got = data(si, SW, SH);
    const want = data(await img('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(FW.plain(mk).replace(/<svg([^>]*)>/, (m, at) => '<svg' + at.replace(/\s(width|height)="[^"]*"/g, '') + ` width="${W}" height="${H}">`))), W, H, bg);
    const ox = Math.round((rc.left - clip.x) * dpr), oy = Math.round((rc.top - clip.y) * dpr), round = what !== 'strip' && what !== 'fig', R2 = Math.pow(W / 2 - 1, 2), inside = [];
    let ink = 0; for (let q = 0; q < W * H; q++) { const dx = q % W + 0.5 - W / 2, dy = Math.floor(q / W) + 0.5 - H / 2; if (round && dx * dx + dy * dy > R2) continue; inside.push(q); const i = q * 4; if (Math.max(Math.abs(want[i] - bg[0]), Math.abs(want[i + 1] - bg[1]), Math.abs(want[i + 2] - bg[2])) > 48) ink++; }
    let best = null; for (let ddy = -2; ddy <= 2; ddy++) for (let ddx = -2; ddx <= 2; ddx++) { let apart = 0;
      for (const q of inside) { const x = q % W + ox + ddx, y = Math.floor(q / W) + oy + ddy, i = q * 4; if (x < 0 || y < 0 || x >= SW || y >= SH) { apart++; continue; } const j = (y * SW + x) * 4;
        if (Math.max(Math.abs(got[j] - want[i]), Math.abs(got[j + 1] - want[i + 1]), Math.abs(got[j + 2] - want[i + 2])) > 48) apart++; }
      if (!best || apart < best.apart) best = { apart, at: [ddx, ddy] }; }
    const n = inside.length, apart = best.apart, hide = [];
    for (let t = e; t && t.nodeType === 1; t = t.parentElement) { const c = getComputedStyle(t), bad = [parseFloat(c.opacity) < 1 && 'opacity ' + c.opacity, c.visibility !== 'visible' && 'visibility ' + c.visibility, c.clipPath !== 'none' && 'clip-path ' + c.clipPath, c.filter !== 'none' && 'filter ' + c.filter, (c.maskImage || 'none') !== 'none' && 'mask ' + c.maskImage].filter(Boolean);
      if (bad.length) hide.push((t.id ? '#' + t.id : t.tagName.toLowerCase() + (t.classList.length ? '.' + [...t.classList].join('.') : '')) + ': ' + bad.join(', ')); }
    return { W, H, n, apart, at: best.at, ink, share: Math.round(apart / n * 10000) / 10000, hide, ok: dpr === 2 && ink > n * 0.05 && apart <= n * lim && !hide.length }; }, [sel, what, shot, PAINT, rc]); }
const painted = (P, tag) => ok(!!P && !P.none && P.ok, tag + ' (as painted at dpr 2: ' + (P && !P.none ? P.apart + ' of ' + P.n + ' device px more than 48 apart from FW.plain of it' + (P.at[0] || P.at[1] ? ', matched ' + P.at.join(', ') + ' device px off' : '') + (P.hide.length ? '; hidden up the tree: ' + P.hide.join('; ') : '') : 'no svg') + ')', P);

// the live rider stays in view while the rider chooses (review round 4: it scrolled away with the groups, so a tap showed no change on
// screen): every group open and More colours (the folds stay as opened), each field's buttons brought into view the way the page does it
// (scrollIntoView nearest: the scroller's own padding), a real tap on a choice not pressed; then the rider must be wholly in the sheet's view
// (under its title bar, above its bottom and the tab bar), redrawn in that choice, and the button tapped not under it. And the keyboard:
// Tab forward and back (Shift+Tab: the page scrolls up to what it focuses) through the sheet never leaves the focused control under the
// rider or the title bar
async function figView(p, where) {
  await allOpen(p); await settle(p, 100);
  const view = () => p.evaluate(() => { const sc = document.querySelector('#setSheet .set-sheet'), S = sc.getBoundingClientRect(), tb = document.querySelector('nav.tabs'), T = tb && tb.getClientRects().length ? tb.getBoundingClientRect() : null, F = document.querySelector('#rdFig svg').getBoundingClientRect();
    return { top: Math.max(S.top, document.querySelector('#setSheet .set-top').getBoundingClientRect().bottom), bot: Math.min(S.bottom, innerHeight, T && T.top > innerHeight / 2 ? T.top : 1e9) /* the phone's tab bar at the bottom (on the computer layout nav.tabs is the side bar) */, F: { top: F.top, bottom: F.bottom, height: F.height }, figB: document.getElementById('rdFig').getBoundingClientRect().bottom }; });
  const fields = await p.evaluate(() => [...document.querySelectorAll('#rdGroups .rd-f')].filter(f => f.getClientRects().length).map(f => f.dataset.rdF)), bad = [], seen = [];
  for (const k of fields) {
    const v = await p.evaluate(k => { const f = document.querySelector(`#rdGroups [data-rd-f="${k}"]`), b = [...f.querySelectorAll('[data-rd]')].find(b => b.getAttribute('aria-pressed') !== 'true'); f.querySelector('.rd-sw').scrollIntoView({ block: 'nearest' }); return b ? b.dataset.v : null; }, k);
    if (v == null) continue; await settle(p, 60);
    await p.click(`#rdGroups [data-rd="${k}"][data-v="${v}"]`, { timeout: 5000 }).catch(e => bad.push({ k, v, click: String(e).split('\n')[0] })); await settle(p, 80);
    const V = await view(), m = await p.evaluate(([k, v]) => { const b = document.querySelector(`#rdGroups [data-rd="${k}"][data-v="${v}"]`).getBoundingClientRect(), r = window.__q99.riderNow(), nm = h => String(h).replace(/\b(fw-[a-z]+)\d+/g, '$1#');
      return { btn: [b.top, b.bottom], chose: r[k] === v, same: nm(document.getElementById('rdFig').innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.riderOutfit(r) }).innerHTML) }; }, [k, v]);
    const vis = Math.max(0, Math.min(V.F.bottom, V.bot) - Math.max(V.F.top, V.top)) / V.F.height, clear = m.btn[0] >= V.figB - 0.5 && m.btn[1] <= V.bot + 0.5;
    seen.push(k + ' ' + Math.round(vis * 100) + '%'); if (vis < 0.99 || !clear || !m.chose || !m.same) bad.push({ k, v, vis: Math.round(vis * 1000) / 1000, fig: [Math.round(V.F.top), Math.round(V.F.bottom)], view: [Math.round(V.top), Math.round(V.bot)], btn: m.btn.map(Math.round), clear, chose: m.chose, same: m.same }); }
  ok(fields.length >= 12 && seen.length === fields.length && !bad.length, 'sheet: ' + where + ': the live rider stays in view while the rider chooses: after a tap in each field (every group open), it is wholly in the sheet\'s view, redrawn in the choice, and the button tapped is not under it (' + seen.join(', ') + ')', { bad: bad.slice(0, 4), fields });
  // the keyboard: forward from the first group's chosen button, then back
  const hid = [], walked = [];
  for (const key of ['Tab', 'Shift+Tab']) { await p.evaluate(back => { const sc = document.querySelector('#setSheet .set-sheet'); sc.scrollTop = back ? sc.scrollHeight : 0; const L = [...document.querySelectorAll('#rdGroups [aria-pressed="true"]')].filter(b => b.getClientRects().length); (back ? L[L.length - 1] : L[0]).focus(); }, key !== 'Tab'); await settle(p, 60);
   for (let i = 0; i < 40; i++) { await p.keyboard.press(key); await settle(p, 40);
    const V = await view(), f = await p.evaluate(() => { const e = document.activeElement; if (!e || !e.closest('#prowB-rider')) return null; const r = e.getBoundingClientRect(); return { n: e.dataset.rd ? e.dataset.rd + ' ' + e.getAttribute('aria-label') : e.textContent.trim().slice(0, 20), top: r.top, bottom: r.bottom }; });
    if (!f) break; walked.push(f.n); if (f.top < V.figB - 1 || f.bottom > V.bot + 1) hid.push(Object.assign({ key, figB: V.figB, bot: V.bot }, f)); } } /* 1 px: the scroll lands on whole pixels */
  ok(walked.length >= 20 && !hid.length, 'sheet: ' + where + ': Tab and Shift+Tab through the sheet never leave the focused control under the live rider or past the view\'s bottom (' + walked.length + ' stops)', { hid: hid.slice(0, 4), walked: walked.length });
}

const sections = [];
const section = (n, f) => sections.push([n, f]);

section('cache', async () => {
  const swf = fs.readFileSync(path.join(path.dirname(PAGE), 'sw.js'), 'utf8');
  const b = (SRC.match(/const APP_BUILD='([^']+)'/) || [])[1], c = (swf.match(/const CACHE = '([^']+)'/) || [])[1];
  ok(!!b && b === c && +(b.match(/v(\d+)$/) || [])[1] >= 123, 'cache: APP_BUILD = sw.js CACHE, v123 or later', { b, c });
  const built = (/window\.FW = \{[^\n]*built: '([^']+)'/.exec(SRC) || [])[1], ver = (/window\.FW = \{ version: '(\d+)'/.exec(SRC) || [])[1];
  ok(!!built && built >= '2026-11-08 09:29 EST' && +ver >= 7, 'cache: the bundle is the design chat\'s v7 (09:29) or later (FW.version ' + ver + ', built ' + built + ')', { ver, built });
  // each block is the design chat's file byte for byte (as q97's byte check, which skips when the handoff folder holds a newer build): a
  // hand edit inside the bundle fails here whatever that folder holds; the item that takes a new build adds its sha1 here
  const sha = t => crypto.createHash('sha1').update(t).digest('hex'), blk = re => (re.exec(SRC) || [])[1];
  const css = blk(/<style id="fwCss">\n([\s\S]*?)\n<\/style>/), js = blk(/<script id="fwJs">\n([\s\S]*?)\n<\/script>/), want = BUILDS[built], got = { css: css && sha(css), js: js && sha(js) };
  ok(!!want && got.css === want.css && got.js === want.js, 'cache: each bundle block is the ' + built + ' build byte for byte (sha1 of the handoff files, trimmed: no hand edit)', { built, got, want: want || 'no sha1 here for this build' });
});

section('row', async () => {
  const x = await openH(), p = x.p;
  await toSettings(p);
  const R = await p.evaluate(() => { const b = document.getElementById('prowBtn-rider'), g = b && b.closest('.pgroup'); return b && { inYou: !!g && g.classList.contains('sg-you'), sheet: b.dataset.sheet, popup: b.getAttribute('aria-haspopup'), label: b.querySelector('.prow-l').textContent, v: document.getElementById('prowV-rider').textContent, kw: b.dataset.kw || '', h: b.getBoundingClientRect().height }; });
  ok(!!R && R.inYou && R.sheet === 'rider' && R.popup === 'dialog' && R.label === 'Your rider' && R.h >= 44, '99.1: Settings › You has the row Your rider (a sheet row, 44 px or more)', R);
  ok(!!R && R.v === 'Not set', 'row: "Not set" until a rider is built', R);
  await p.fill('#setSearch', 'avatar'); await settle(p, 150);
  ok(await p.evaluate(() => { const r = document.querySelector('.prow[data-prow="rider"]'); return !!r && !r.classList.contains('sf-out') && r.getClientRects().length > 0; }), 'row: a settings search finds it ("avatar")');
  await p.fill('#setSearch', ''); await settle(p, 150);
  await p.click('#prowBtn-rider'); await until(() => p.evaluate(() => document.getElementById('setSheet').classList.contains('open'))); await settle(p, 200);
  const S = await sheetOf(p);
  ok(S.title === 'Your rider' && !S.hint, 'row: the sheet is titled Your rider, with no "Saves as you type." line (each tap saves)', { title: S.title, hint: S.hint });
  // the sheet's words: titles and labels only (item 76): the group titles, their summaries, each field's label and chosen name, More colours, the buttons' names
  await allOpen(p);
  const W = await p.evaluate(F => { const sh = document.getElementById('prowB-rider'), known = new Set(['Look', 'Gear', 'Kit', 'More colours']);
    ['look', 'gear', 'kit'].forEach(g => known.add(document.getElementById('rdS-' + g).textContent));
    F.forEach(k => { known.add(document.getElementById('rdL-' + k).textContent); known.add(document.getElementById('rdN-' + k).textContent); });
    sh.querySelectorAll('[data-rd]').forEach(b => { if (b.textContent) known.add(b.textContent); });
    const out = []; const walk = n => { if (n.nodeType === 3) { const t = n.nodeValue.trim(); if (t && !known.has(t)) out.push(t); } else if (n.nodeType === 1 && n.tagName !== 'svg') n.childNodes.forEach(walk); }; walk(sh); return out; }, FIELDS);
  ok(!W.length, 'row: the sheet has no explanation line (its words: group titles, summaries, labels, names, More colours)', W);
  await x.close();
  // Settings on Running (the sport set to Run): the row is on the Cycling side; a search for it names it there, one tap away (never a blank page)
  for (const desk of [false, true]) { const y = await openH({ width: desk ? 1280 : 390, height: desk ? 800 : 844 }), q = y.p, where = desk ? ' (computer layout)' : '';
    await q.click('#sportBtn'); await q.click('#sportMenu [data-sport=run]'); await until(() => q.evaluate(() => document.documentElement.classList.contains('run-theme'))); await toSettings(q); await settle(q, 200);
    await q.fill('#setSearch', 'rider'); await settle(q, 200);
    const sideOf = () => q.evaluate(() => { const n = document.getElementById('setNoMatch'), b = n.querySelector('button[data-set-sport]'), rows = [...document.querySelectorAll('#setList .prow')].filter(r => r.getClientRects().length).map(r => r.dataset.prow);
      return { side: (document.querySelector('#setSport .on') || {}).dataset?.setSport, shown: !n.hidden && n.getClientRects().length > 0, text: n.textContent, btn: b ? b.textContent : null, bh: b ? b.getBoundingClientRect().height : 0, rows, focus: document.activeElement && document.activeElement.id }; });
    const R1 = await sideOf();
    ok(R1.side === 'run' && R1.shown && R1.rows.length === 0 && R1.text.startsWith('No Running settings match “rider”.') && R1.btn === 'Your rider is under Cycling ›' && R1.bh >= 44, 'row: Settings on Running' + where + ': a search for "rider" says no Running setting matches and names Your rider under Cycling (a 44 px button), never a blank page', R1);
    // the button's words: AA on what is behind them (its size is body text: 4.5:1)
    const CB = await q.evaluate(`(()=>{ ${CONTRAST} const b=document.querySelector('#setNoMatch button[data-set-sport]'), c=getComputedStyle(b), bg=bgOf(b), fg=over(rgbOf(c.color), bg);
      return { color: c.color, bg: 'rgb(' + bg.join(', ') + ')', px: parseFloat(c.fontSize), w: c.fontWeight, ratio: Math.round(ratio(fg, bg) * 100) / 100 }; })()`);
    ok(CB.ratio >= 4.5, 'row: Settings on Running' + where + ': the button "Your rider is under Cycling ›" is 4.5:1 or more on its background (' + CB.ratio + ':1)', CB);
    await q.click('#setNoMatch button[data-set-sport]'); await settle(q, 200); const R2 = await sideOf();
    ok(R2.side === 'ride' && !R2.shown && R2.rows.join() === 'rider' && R2.focus === 'prowBtn-rider', 'row: Settings on Running' + where + ': that button turns Settings to Cycling with the row found and focused', R2);
    await q.fill('#setSearch', 'zzqx'); await settle(q, 150); const R3 = await sideOf();
    ok(R3.shown && R3.text === 'No Cycling settings match “zzqx”.' && R3.btn === null, 'row: a search with no match on either side: the plain line, no button' + where, R3);
    // and back: on Cycling, a search only Running's Carry matches ("flask") names it under Running; its button turns Settings to Running
    // and focuses that row
    await q.fill('#setSearch', 'flask'); await settle(q, 200); const R4 = await sideOf();
    ok(R4.side === 'ride' && R4.shown && R4.rows.length === 0 && R4.text.startsWith('No Cycling settings match “flask”.') && R4.btn === 'Carry is under Running ›' && R4.bh >= 44, 'row: Settings on Cycling' + where + ': a search only Running matches ("flask") names Carry under Running (a 44 px button)', R4);
    await q.click('#setNoMatch button[data-set-sport]'); await settle(q, 200); const R5 = await sideOf();
    ok(R5.side === 'run' && !R5.shown && R5.rows.join() === 'runcarry' && R5.focus === 'prowBtn-runcarry', 'row: Settings on Cycling' + where + ': that button turns Settings to Running with Carry found and focused', R5);
    await y.close(); }
});

section('sheet', async () => {
  const x = await openH({ settings: { rider: RIDER99 }, dpr: 2 }), p = x.p;
  await sheet(p);
  const F0 = await p.evaluate(() => ['look', 'gear', 'kit'].map(g => { const s = document.querySelector(`#rdGroups [data-fold="rider-${g}"]`), h = s && s.querySelector('.v-fold-h'), b = s && s.querySelector('.v-fold-b');
    return s && { cls: s.classList.contains('v-fold'), exp: h.getAttribute('aria-expanded'), ctl: h.getAttribute('aria-controls') === b.id, hid: b.hidden, t: s.querySelector('.v-fold-t').textContent }; }));
  ok(F0.every(Boolean) && F0.map(f => f.t).join() === 'Look,Gear,Kit' && F0.every(f => f.cls && f.exp === 'false' && f.hid && f.ctl), '99.1: Look / Gear / Kit, each a fold (closed the first time, aria-expanded false, aria-controls its body)', F0);
  const S = await sheetOf(p), want = await sumsOf(p, RIDER99);
  ok(S.sums.join('|') === want.join('|'), '99.1: folded, each group shows its one-line summary naming the choices (' + S.sums.join(' / ') + ')', { S: S.sums, want });
  ok(S.sums[2] === 'Coral jersey · dots · navy shorts', '99.1: the Kit summary reads as the spec\'s ("Coral jersey · dots · navy shorts" for this rider)', S.sums[2]);
  // the glasses 'pair' reads "glasses" in the Gear summary and in the fold button's name (review round 4: "pair" alone, read out, named nothing)
  const GN = await p.evaluate(() => document.querySelector('#rdGroups [data-fold="rider-gear"] .v-fold-h').textContent.replace(/\s+/g, ' ').trim());
  ok(S.sums[1] === 'Coral helmet · glasses · green lens' && GN === 'Gear' + S.sums[1] && !/(^|· )pair( ·|$)/.test(S.sums[1]), 'sheet: the Gear summary names the glasses ("' + S.sums[1] + '": never "pair" alone), folded and as the fold button\'s name', { sum: S.sums[1], name: GN });
  // each field's label shows the bundle's name of the value pressed (review round 4: the names were compared only with each other after a change)
  const N99 = await namesOf(p, RIDER99);
  ok(FIELDS.every(k => S.names[k] === N99[k] && S.pressed[k].length === 1 && S.pressed[k][0] === RIDER99[k]), 'sheet: each field\'s label shows the bundle\'s name of the choice pressed (' + FIELDS.map(k => S.names[k]).join(', ') + ')', { names: S.names, want: N99 });
  ok(S.fig && S.figSame, '99.1: the live rider on top is FW.riderOutfit of the rider shown (ids aside)', S);
  painted(await paintOf(p, '#rdFig svg', 'fig'), 'sheet: the live rider shows');
  const FG = await p.evaluate(() => { const f = document.getElementById('rdFig'), g = document.getElementById('rdGroups'), g1 = g.querySelector('.rd-g'), rec = window.__q99.FWM.get(f);
    return { before: !!(f.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING), figB: Math.round(f.getBoundingClientRect().bottom), g1T: Math.round(g1.getBoundingClientRect().top), fwm: f.classList.contains('fwm'), s: rec ? rec.s : null }; });
  ok(FG.before && FG.figB <= FG.g1T && FG.fwm && FG.s === true, '99.1: the live rider is on top (before the groups in the page, its bottom above the first group) and a still fwMount spot (o.still)', FG);
  const one = await p.evaluate(() => { const b = document.querySelector('#rdGroups .v-fold-h'), r = b.getBoundingClientRect(), s = document.getElementById('rdS-look'); return { h: r.height, lines: Math.round(s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).lineHeight)) }; });
  ok(one.h >= 44 && one.lines === 1, 'sheet: a folded group is one header (44 px or more) with its summary on one line at 390 px', one);
  // every option, named, pressed: in the DOM
  const B = await p.evaluate(F => F.map(k => { const o = FW.RIDER_OPTIONS[k], L = Array.isArray(o) ? o : Object.keys(o), bs = [...document.querySelectorAll(`#rdGroups [data-rd="${k}"]`)], g = bs[0] && bs[0].parentElement, lab = g && document.getElementById(g.getAttribute('aria-labelledby'));
    return { k, opts: L, vals: bs.map(b => b.dataset.v), names: bs.map(b => b.getAttribute('aria-label')), want: L.map(v => Array.isArray(o) ? FW.RIDER_NAMES[k] && FW.RIDER_NAMES[k][v] : o[v]), pressed: bs.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.v),
      ap: bs.every(b => ['true', 'false'].includes(b.getAttribute('aria-pressed'))), tag: bs.every(b => b.tagName === 'BUTTON' && b.type === 'button'), role: g && g.getAttribute('role'), all: bs.every(b => b.parentElement === g), label: lab && lab.textContent, col: k === 'skin' || Array.isArray(o), sw: bs.every(b => b.classList.contains(k === 'skin' || Array.isArray(o) ? 'rd-c' : 'rd-t')) }; }), FIELDS);
  for (const b of B) {
    ok(b.vals.join('|') === b.opts.join('|') && b.names.join('|') === b.want.join('|') && b.want.every(n => typeof n === 'string' && n), 'sheet: ' + b.k + ': every FW.RIDER_OPTIONS value is a button named from the bundle (' + b.names.join(', ') + ')', b);
    ok(b.tag && b.ap && b.pressed.length === 1 && b.pressed[0] === RIDER99[b.k], 'sheet: ' + b.k + ': buttons with aria-pressed, exactly one pressed (the rider\'s ' + JSON.stringify(RIDER99[b.k]) + ')', b);
    ok(b.role === 'group' && b.all && !!b.label && b.sw, 'sheet: ' + b.k + ': in a group of their own named by its label (' + b.label + ')' + (b.col ? ', colour swatches' : ', word buttons'), b);
  }
  const kitL0 = B.find(b => b.k === 'kit').opts;
  const noName = B.flatMap(b => b.want.map((n, i) => n ? null : b.k + ' ' + JSON.stringify(b.opts[i]))).filter(Boolean);
  ok(!noName.length, 'sheet: every option has a name in the bundle (none missing)', noName);
  // More colours: the fade and sleeves, hidden until opened
  await allOpen(p); await p.click('#rdMore'); await settle(p, 100);
  const M0 = await p.evaluate(() => ({ exp: document.getElementById('rdMore').getAttribute('aria-expanded'), hid: document.getElementById('rdMoreB').hidden, in: ['kit2', 'sleeve'].every(k => !!document.querySelector(`#rdMoreB [data-rd="${k}"]`)), main: ['kit', 'pattern', 'shorts'].every(k => !document.querySelector(`#rdMoreB [data-rd="${k}"]`)), kitGroup: !!document.querySelector('[data-fold="rider-kit"] #rdMoreB'), ctl: document.getElementById('rdMore').getAttribute('aria-controls') }));
  await p.click('#rdMore'); await settle(p, 100);
  const M1 = await p.evaluate(() => ({ exp: document.getElementById('rdMore').getAttribute('aria-expanded'), hid: document.getElementById('rdMoreB').hidden, shown: document.getElementById('rdMoreB').getClientRects().length > 0, txt: document.getElementById('rdMore').textContent }));
  ok(M0.exp === 'false' && M0.hid && M0.in && M0.main && M0.kitGroup && M0.ctl === 'rdMoreB' && M1.exp === 'true' && !M1.hid && M1.shown && M1.txt === 'More colours', '99.1: the extra kit colours (the jersey\'s fade and sleeves) are under More colours in Kit, hidden until it is opened', { M0, M1 });
  // 44 px
  const sz = await p.evaluate(() => [...document.querySelectorAll('#prowB-rider button')].filter(b => b.getClientRects().length).map(b => { const r = b.getBoundingClientRect(); return { n: b.getAttribute('aria-label') || b.textContent.trim(), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }; }).filter(b => b.w < 44 || b.h < 44));
  ok(!sz.length, '99.1: every button in the sheet is at least 44 x 44 px (swatches, words, folds, More colours)', sz);
  // each swatch is painted its own option's colour (skin: FW.SKIN; "Same as jersey": the jersey's), and no two in a field look alike (colour
  // and mark: "Same as jersey" is a ring), for every jersey (a black jersey's fade offers Black too)
  await p.evaluate(`(()=>{ ${CONTRAST} window.__c={rgbOf, over, ratio, bgOf}; })()`);
  // each swatch's edge stands out from the sheet in normal colours: the edge (over the swatch) or the swatch itself 3:1 against the panel
  // (WCAG 1.4.11: a White jersey, helmet, frame or sleeves on the white sheet is seen by its edge alone)
  const swOf = () => p.evaluate(() => { const rgb = h => 'rgb(' + [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ') + ')', r = window.__q99.riderNow(), out = {};
    document.querySelectorAll('#rdGroups .rd-sw').forEach(g => { const bs = [...g.querySelectorAll('.rd-c')]; if (!bs.length) return; const k = bs[0].dataset.rd;
      out[k] = bs.map(b => { const v = b.dataset.v, c = getComputedStyle(b), want = k === 'skin' ? FW.SKIN[v][0] : v || r.kit; const C = window.__c, panel = C.bgOf(b.parentElement), sw = C.rgbOf(c.backgroundColor), e = C.over(C.rgbOf(c.borderTopColor), c.backgroundClip === 'border-box' ? sw : panel);
        return { v, bg: c.backgroundColor, want: rgb(want), mark: c.backgroundImage !== 'none', edge: parseFloat(c.borderTopWidth) >= 1 && c.borderTopStyle !== 'none' && (C.ratio(e, panel) >= 3 || C.ratio(sw, panel) >= 3), ec: c.borderTopColor }; }); });
    return { kit: r.kit, out }; });
  const swBad = W => Object.entries(W.out).flatMap(([k, L]) => { const look = L.map(b => b.bg + (b.mark ? '+ring' : '')), bad = [];
    L.forEach(b => { if (b.bg !== b.want) bad.push(k + ' ' + JSON.stringify(b.v) + ' painted ' + b.bg + ' not ' + b.want); if (b.mark !== (b.v === '')) bad.push(k + ' ' + JSON.stringify(b.v) + (b.mark ? ' marked' : ' has no mark of its own')); if (!b.edge) bad.push(k + ' ' + JSON.stringify(b.v) + ': its edge (' + b.ec + ') does not stand out from the sheet'); });
    if (new Set(look).size !== L.length) bad.push(k + ': two swatches look alike (' + look.filter((x, i) => look.indexOf(x) !== i).join(', ') + ')'); return bad; });
  const W0 = await swOf(), swN = Object.keys(W0.out).length;
  ok(swN === 9 && !swBad(W0).length, 'sheet: every swatch is painted its own option\'s colour (skin FW.SKIN, the rest their value, "Same as jersey" the jersey\'s), no two in a field look alike, and its edge stands out from the sheet (3:1, the edge or the swatch: a White one on white) (' + swN + ' fields)', { bad: swBad(W0), fields: Object.keys(W0.out) });
  const kitBad = [];
  const figBad = []; /* the live rider follows each tap, the sheet still open (review round 3: it was compared only on a sheet just opened) */
  for (const v of kitL0) { await tap(p, 'kit', v); await settle(p, 60); const W = await swOf(); swBad(W).forEach(b => kitBad.push(v + ': ' + b)); const F = await sheetOf(p); if (!F.figSame || F.r.kit !== v) figBad.push(v); }
  painted(await paintOf(p, '#rdFig svg', 'fig'), 'sheet: after a tap (the ' + kitL0[kitL0.length - 1] + ' jersey), the live rider shows in it');
  await tap(p, 'kit', RIDER99.kit); await settle(p, 60);
  ok(!figBad.length, '99.1: the live rider follows each tap: for each of the ' + kitL0.length + ' jerseys tapped, the sheet still open, its drawing is FW.riderOutfit of the rider in that jersey', figBad);
  kitBad.sort((a, b) => /alike/.test(b) - /alike/.test(a)); /* the look-alikes first */
  ok(!kitBad.length, 'sheet: for each of the ' + kitL0.length + ' jerseys, "Same as jersey" (the fade, the sleeves) is the jersey\'s colour with a ring of its own, never one more disc like the field\'s own colour (a Black jersey\'s Black)', kitBad.slice(0, 6));
  // the pressed choice is marked in normal colours: a ring on a swatch, a fill on a word button (not only in forced colours)
  const PV = await p.evaluate(() => { const cs = b => { const c = getComputedStyle(b); return { sh: c.boxShadow, bg: c.backgroundColor, co: c.color }; }, out = [];
    document.querySelectorAll('#rdGroups .rd-sw').forEach(g => { if (!g.getClientRects().length) return; const on = g.querySelector('[aria-pressed="true"]'), off = g.querySelector('[aria-pressed="false"]'); if (!on || !off) return;
      out.push({ k: on.dataset.rd, sw: on.classList.contains('rd-c'), on: cs(on), off: cs(off) }); }); return out; });
  const pvBad = PV.filter(x => x.sw ? !(x.on.sh !== 'none' && x.on.sh !== x.off.sh) : !(x.on.bg !== x.off.bg && x.on.co !== x.off.co));
  ok(PV.filter(x => x.sw).length >= 8 && PV.filter(x => !x.sw).length >= 4 && !pvBad.length, 'sheet: the pressed choice is marked in normal colours: a ring on the pressed swatch, a fill and colour on the pressed word button (' + PV.length + ' groups)', { pvBad, sample: PV.slice(0, 2) });
  // and the mark can be seen (review round 4: a ring in the panel's own colour passed; WCAG 1.4.11, as the swatches' edges): the pressed
  // swatch's outer ring (its widest shadow, wider than the rest) 3:1 against the panel; the pressed word button's fill 3:1 against the
  // unpressed one's (or the panel), its words 4.5:1 on it
  const PC = await p.evaluate(() => { const C = window.__c, out = [], parts = s => s === 'none' ? [] : s.split(/,(?![^(]*\))/).map(x => { const c = (x.match(/rgba?\([^)]*\)/) || [''])[0], n = x.replace(c, '').trim().split(/\s+/).map(parseFloat); return { c: C.rgbOf(c), spread: n[3] || 0 }; }), r2 = v => Math.round(v * 100) / 100;
    document.querySelectorAll('#rdGroups .rd-sw').forEach(g => { if (!g.getClientRects().length) return; const on = g.querySelector('[aria-pressed="true"]'), off = g.querySelector('[aria-pressed="false"]'); if (!on || !off) return;
      const panel = C.bgOf(g), c = getComputedStyle(on), co = getComputedStyle(off), k = on.dataset.rd;
      if (on.classList.contains('rd-c')) { const L = parts(c.boxShadow), o = L.reduce((a, b) => !a || b.spread > a.spread ? b : a, null), wider = !!o && L.every(x => x === o || x.spread <= o.spread - 1.5);
        out.push({ k, sw: true, shadow: c.boxShadow, ring: o && o.c.length >= 3 ? r2(C.ratio(C.over(o.c, panel), panel)) : 0, wider }); }
      else { const fon = C.over(C.rgbOf(c.backgroundColor), panel), foff = C.over(C.rgbOf(co.backgroundColor), panel), tx = C.over(C.rgbOf(c.color), fon);
        out.push({ k, sw: false, fill: r2(Math.max(C.ratio(fon, foff), C.ratio(fon, panel))), text: r2(C.ratio(tx, fon)) }); } }); return out; });
  const pcBad = PC.filter(x => x.sw ? !(x.wider && x.ring >= 3) : !(x.fill >= 3 && x.text >= 4.5));
  ok(PC.filter(x => x.sw).length >= 8 && PC.filter(x => !x.sw).length >= 4 && !pcBad.length, 'sheet: the pressed mark can be seen: each pressed swatch\'s outer ring 3:1 against the panel (' + [...new Set(PC.filter(x => x.sw).map(x => x.ring))].join(', ') + ':1), each pressed word button\'s fill 3:1 against an unpressed one (' + [...new Set(PC.filter(x => !x.sw).map(x => x.fill))].join(', ') + ':1) and its words 4.5:1 on it (' + [...new Set(PC.filter(x => !x.sw).map(x => x.text))].join(', ') + ':1)', { pcBad, sample: PC.slice(0, 2) });
  // the Look summary per hair style (the bundle draws 'covered' as a head covering in the colour: its field is then "Covering colour")
  const HS = [];
  for (const v of ['pony', 'braids', 'covered', 'short']) { await tap(p, 'hairStyle', v); await settle(p, 60); HS.push(await p.evaluate(() => [document.getElementById('rdS-look').textContent, document.getElementById('rdL-hair').textContent, document.getElementById('rdL-hair').closest('.rd-f').querySelector('[role=group]').getAttribute('aria-labelledby')])); }
  await tap(p, 'hairStyle', RIDER99.hairStyle); await settle(p, 60);
  ok(HS.map(h => h[0]).join('|') === 'Deep brown skin · black ponytail · beard|Deep brown skin · black braids · beard|Deep brown skin · black head covering and beard|Deep brown skin · short black hair · beard' && HS.map(h => h[1]).join() === 'Hair colour,Hair colour,Covering and beard colour,Hair colour' && HS.every(h => h[2] === 'rdL-hair'),
    'sheet: the Look summary reads per hair style ("black ponytail", "black braids", "black head covering and beard", "short black hair"); with Covered and a beard the colour field is "Covering and beard colour" (its group named so: the bundle draws the beard in the covering\'s colour)', HS);
  // with Covered, the colour field and the summary say what it colours: the covering alone with no face, the mustache too with one
  // (review round 4: "Covering colour" hid that it sets the beard's colour too)
  const CF = []; await tap(p, 'hairStyle', 'covered');
  for (const f of ['none', 'stache', 'beard']) { await tap(p, 'face', f); await settle(p, 60); CF.push(await p.evaluate(() => [document.getElementById('rdL-hair').textContent, document.getElementById('rdS-look').textContent, document.getElementById('rdL-hair').closest('.rd-f').querySelector('[role=group]').getAttribute('aria-labelledby')])); }
  await tap(p, 'hairStyle', RIDER99.hairStyle); await tap(p, 'face', RIDER99.face); await settle(p, 60);
  ok(CF.map(c => c[0]).join() === 'Covering colour,Covering and mustache colour,Covering and beard colour' && CF.map(c => c[1]).join('|') === 'Deep brown skin · black head covering|Deep brown skin · black head covering and mustache|Deep brown skin · black head covering and beard' && CF.every(c => c[2] === 'rdL-hair'),
    'sheet: with Covered the colour field names what it colours ("Covering colour"; with a mustache or a beard "Covering and mustache colour", "Covering and beard colour"), and so does the Look summary ("black head covering and beard")', CF);
  // with Covered the six colours are a covering's: plain colour names (Rust and Gold, not Auburn and Blond) in the buttons, the field's name
  // and the summary; back to hair, the hair names
  const hairNames = () => p.evaluate(() => [...document.querySelectorAll('#rdGroups [data-rd="hair"]')].map(b => b.getAttribute('aria-label')));
  await tap(p, 'hairStyle', 'covered'); await settle(p, 60); const CV = { names: await hairNames(), each: [] };
  for (const h of await p.evaluate(() => FW.RIDER_OPTIONS.hair)) { await tap(p, 'hair', h); await settle(p, 60);
    CV.each.push(await p.evaluate(() => [document.getElementById('rdS-look').textContent, document.getElementById('rdN-hair').textContent])); }
  const CVw = await p.evaluate(([r, COVER]) => FW.RIDER_OPTIONS.hair.map(h => COVER[h] || FW.RIDER_NAMES.hair[h]), [RIDER99, COVER]);
  await tap(p, 'hairStyle', RIDER99.hairStyle); await tap(p, 'hair', RIDER99.hair); await settle(p, 60); const CV1 = await hairNames(), HN = await p.evaluate(() => FW.RIDER_OPTIONS.hair.map(h => FW.RIDER_NAMES.hair[h]));
  ok(CV.names.join() === CVw.join() && CVw.join() === 'Black,Dark brown,Brown,Rust,Gold,Grey' && CV.each.map(e => e[0]).join('|') === CVw.map(c => 'Deep brown skin · ' + c.toLowerCase() + ' head covering and beard').join('|') && CV.each.map(e => e[1]).join() === CVw.join() && CV1.join() === HN.join(),
    'sheet: with Covered the colours are a covering\'s (' + CV.names.join(', ') + '): the buttons\' names, the field\'s chosen name and the summary ("rust head covering", never "blond head covering"); back to hair, the hair names (' + CV1.join(', ') + ')', { CV, CVw, CV1 });
  // the accessibility tree (what VoiceOver reads): each group by its label, each swatch by its name, the chosen one pressed
  const snap = await p.locator('#rdGroups').ariaSnapshot();
  const ax = B.map(b => { const lab = b.label, i = snap.indexOf('- group "' + lab + '"'); if (i < 0) return { k: b.k, group: false };
    const seg = snap.slice(i).split('\n').slice(1).filter(l => /^\s+- button/.test(l)).slice(0, b.opts.length);
    return { k: b.k, group: true, names: seg.map(l => (/button "([^"]*)"/.exec(l) || [])[1]), pressed: seg.filter(l => /\[pressed\]/.test(l)).map(l => (/button "([^"]*)"/.exec(l) || [])[1]), want: b.want, wantP: b.want[b.opts.indexOf(RIDER99[b.k])] }; });
  const axBad = ax.filter(a => !a.group || a.names.join('|') !== a.want.join('|') || a.pressed.length !== 1 || a.pressed[0] !== a.wantP);
  ok(!axBad.length, 'QA: VoiceOver reads each swatch\'s name: the accessibility tree has every group by its label, every button by its name and the chosen one pressed (' + ax.length + ' groups)', { axBad: axBad.slice(0, 3), snap: snap.slice(0, 400) });
  // lens and frame hide with no glasses, and come back
  await tap(p, 'glasses', 'none'); await settle(p, 100);
  const G0 = await p.evaluate(() => ['lens', 'frame'].map(k => document.querySelector(`[data-rd-f="${k}"]`).getClientRects().length));
  const GS = [await p.evaluate(() => document.getElementById('rdS-gear').textContent), (await sumsOf(p, Object.assign({}, RIDER99, { glasses: 'none' })))[1]];
  ok(GS[0] === GS[1] && GS[1] === 'Coral helmet · no glasses', 'sheet: with no glasses the Gear summary says so ("' + GS[0] + '": no glasses, no lens)', GS);
  await tap(p, 'glasses', 'pair'); await settle(p, 100);
  const G1 = await p.evaluate(() => ['lens', 'frame'].map(k => document.querySelector(`[data-rd-f="${k}"]`).getClientRects().length));
  ok(G0.every(n => !n) && G1.every(n => n > 0), 'sheet: lens and frame are hidden with no glasses (the drawing has none) and back with a pair', { G0, G1 });
  // keyboard: one Tab stop per group (the pressed one); the arrows move and choose within it
  const K0 = await p.evaluate(() => [...document.querySelectorAll('#rdGroups [role=group]')].filter(g => g.getClientRects().length).map(g => [...g.querySelectorAll('button')].filter(b => b.tabIndex === 0).map(b => b.getAttribute('aria-pressed'))));
  ok(K0.length >= 10 && K0.every(t => t.length === 1 && t[0] === 'true'), 'sheet: keyboard: one Tab stop per group, its pressed button (the others tabindex -1)', K0);
  // from the first jersey: ArrowLeft wraps to the last, ArrowRight wraps back to the first, ArrowDown / ArrowUp are next / previous; each
  // focused, pressed, stored and named
  const kitL = kitL0, NK = kitL.length; await tap(p, 'kit', kitL[0]); await settle(p, 60); await p.focus('#rdGroups [data-rd="kit"][aria-pressed="true"]');
  const KS = [];
  for (const [key, want] of [['ArrowLeft', kitL[NK - 1]], ['ArrowRight', kitL[0]], ['ArrowDown', kitL[1]], ['ArrowUp', kitL[0]], ['ArrowRight', kitL[1]]]) { await p.keyboard.press(key); await settle(p, 80);
    KS.push(Object.assign({ key, want }, await p.evaluate(w => ({ f: document.activeElement.dataset.v, k: document.activeElement.dataset.rd, p: document.activeElement.getAttribute('aria-pressed'), s: JSON.parse(localStorage.getItem('bluebird.settings.v2')).rider.kit, n: document.getElementById('rdN-kit').textContent, wn: FW.RIDER_NAMES.kit[w] }), want))); }
  await p.keyboard.press('Tab'); await settle(p, 50);
  const K3 = await p.evaluate(() => ({ k: document.activeElement.dataset.rd, p: document.activeElement.getAttribute('aria-pressed') }));
  ok(KS.every(x => x.k === 'kit' && x.f === x.want && x.p === 'true' && x.s === x.want && x.n === x.wn) && K3.k === 'pattern' && K3.p === 'true',
    'sheet: keyboard: from the first jersey ArrowLeft wraps to the last and ArrowRight back to the first, ArrowDown / ArrowUp choose the next / previous (focused, pressed, stored, named); Tab goes on to the next group\'s chosen button', { KS: KS.filter(x => x.f !== x.want || x.s !== x.want || x.p !== 'true'), K3 });
  // the longest choices of each group (at 390 px: 372, 278 and 339 px of text in 299 px) wrap to a second line, never cut (no ellipsis,
  // nothing hidden), and the whole summary is the fold button's name (what VoiceOver reads)
  const LONG = Object.assign({}, RIDER99, { skin: 'deep', hairStyle: 'covered', hair: '#5A3B2A', face: 'stache', helmet: '#179BCC', glasses: 'shield', lens: '#F2763A', kit: '#179BCC', pattern: 'band', shorts: '#3048B4' });
  for (const k of FIELDS) await tap(p, k, LONG[k]);
  const LS1 = await p.evaluate(() => ['look', 'gear', 'kit'].map(g => { const s = document.getElementById('rdS-' + g), h = s.closest('.v-fold-h'); const c = getComputedStyle(s); return { t: s.textContent, lines: Math.round(s.getBoundingClientRect().height / parseFloat(c.lineHeight)), cut: c.textOverflow === 'ellipsis' || s.scrollWidth > s.clientWidth + 1 || s.scrollHeight > s.clientHeight + 1, name: h.textContent.replace(/\s+/g, ' ').trim() }; })), LW = await sumsOf(p, LONG);
  ok(LS1.every((s, i) => s.t === LW[i] && s.lines >= 1 && s.lines <= 2 && !s.cut && s.name.includes(LW[i])), 'sheet: the longest choices (' + LW.join(' / ') + ') take two lines at most at 390 px, never cut, the whole summary the fold button\'s name', LS1);
  await figView(p, '390 px');
  // the sheet's live rider is kept by its key (review round 4: only the strip and the avatars were checked): closed, reopened, the pressed
  // choice tapped again and riderApply (what every synced settings change runs) leave the same drawing, nothing redrawn
  await p.evaluate(() => { const f = document.getElementById('rdFig'); f.querySelector('svg').__q99 = 1; window.__q99fig = 0; new MutationObserver(r => { window.__q99fig += r.length; }).observe(f, { subtree: true, childList: true }); });
  await done(p); await sheet(p); await group(p, 'kit'); await p.click('#rdGroups [data-rd="kit"][aria-pressed="true"]'); await settle(p, 100); await p.evaluate(() => window.__q99.riderApply()); await settle(p, 100);
  const FK = await p.evaluate(() => { const s = document.querySelector('#rdFig svg'); return { same: !!s && s.__q99 === 1, muts: window.__q99fig }; });
  ok(FK.same && FK.muts === 0, 'sheet: the live rider is kept by its key: the sheet closed and reopened, the pressed choice tapped again and riderApply run leave the same drawing (nothing redrawn)', FK);
  await x.close();
  // the folds are remembered on this device: Look opened stays open (closed, reopened, after a reload), Gear and Kit stay closed
  { const y = await openH({ settings: { rider: RIDER99 } }), q = y.p, fo = () => q.evaluate(() => ['look', 'gear', 'kit'].map(g => document.querySelector(`#rdGroups [data-fold="rider-${g}"] .v-fold-h`).getAttribute('aria-expanded')).join());
    await sheet(q); await group(q, 'look'); const f0 = await fo(); await done(q); await sheet(q); const f1 = await fo(); await done(q);
    await reload(q); await settle(q, 400); await sheet(q); const f2 = await fo();
    ok(f0 === 'true,false,false' && f1 === f0 && f2 === f0, 'sheet: the folds are remembered on this device: Look opened stays open when the sheet is closed and reopened and after a reload, Gear and Kit stay closed', { f0, f1, f2 });
    await y.close(); }
});

section('build', async () => {
  const x = await openH(), p = x.p;
  const D = await p.evaluate(() => ({ def: 'rider' in window.__q99.DEFAULT_SETTINGS, mem: 'rider' in window.__q99.settings, ls: 'rider' in JSON.parse(localStorage.getItem('bluebird.settings.v2')) }));
  ok(!D.def && !D.mem && !D.ls, '99.2: settings.rider absent on a fresh page: no DEFAULT_SETTINGS entry, none in memory, none stored', D);
  await sheet(p); const S0 = await sheetOf(p);
  ok(S0.r && Object.keys(S0.r).every(k => S0.r[k] === S0.pressed[k][0]) && S0.figSame && (await p.evaluate(() => JSON.stringify(window.__q99.riderNow()) === JSON.stringify(FW.RIDER_DEFAULT))), 'build: not built, the sheet shows the bundle\'s default rider (FW.RIDER_DEFAULT)', S0);
  // and names it: each field's chosen name and the three summaries (the default's face none, plain jersey and shield glasses: the spec's
  // "Coral jersey · plain · black shorts" shape)
  const DEF0 = await p.evaluate(() => FW.RIDER_DEFAULT), N0 = await namesOf(p, DEF0), U0 = await sumsOf(p, DEF0);
  ok(FIELDS.every(k => S0.names[k] === N0[k] && !!N0[k]), 'build: not built, each field\'s label shows the default rider\'s chosen name (' + FIELDS.map(k => S0.names[k]).join(', ') + ')', { names: S0.names, want: N0 });
  const L0 = await p.evaluate(() => ['look', 'gear', 'kit'].map(g => { const s = document.getElementById('rdS-' + g); return Math.round(s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).lineHeight)); }));
  ok(L0.every(n => n === 1), 'build: not built, each of the default rider\'s summaries is one line at 390 px', L0);
  ok(S0.sums.join('|') === U0.join('|') && U0.join('|') === 'Light skin · short dark brown hair|Black helmet · shield · purple lens|Bluebird blue jersey · plain · black shorts', 'build: not built, the summaries name the default rider\'s choices (' + S0.sums.join(' / ') + ': no face named, "plain", the shield)', { S: S0.sums, want: U0 });
  await allOpen(p); await done(p); await sheet(p); await done(p);
  const D1 = await p.evaluate(() => ({ mem: 'rider' in window.__q99.settings, ls: 'rider' in JSON.parse(localStorage.getItem('bluebird.settings.v2')), row: document.getElementById('prowV-rider').textContent }));
  ok(!D1.mem && !D1.ls && D1.row === 'Not set', '99.2: opening, unfolding and closing the sheet stores nothing (settings.rider still absent, the row "Not set")', D1);
  // build: a tap on each field (the order a rider would take)
  await sheet(p); await allOpen(p);
  await tap(p, 'skin', 'brown'); const one = (await stored(p)).rider;
  const DEF = await p.evaluate(() => FW.RIDER_DEFAULT);
  ok(!!one && Object.keys(one).join() === Object.keys(DEF).join() && one.skin === 'brown' && Object.keys(one).every(k => k === 'skin' || one[k] === DEF[k]), 'build: the first tap stores the whole rider (every bundle field: the tapped one, the rest the defaults)', one);
  const B = Object.assign({}, RIDER99, { skin: 'olive', hairStyle: 'braids', hair: '#C8743C', face: 'stache', helmet: '#179BCC', glasses: 'shield', lens: '#F2763A', frame: '#F26B5B', kit: '#2ABCBB', pattern: 'chevron', shorts: '#E06AAE', kit2: '#5F6A12', sleeve: '#BECC41' });
  for (const k of FIELDS) await tap(p, k, B[k]);
  const S1 = await sheetOf(p), want = await sumsOf(p, B), st1 = (await stored(p)).rider;
  ok(S1.figSame && J(S1.r) === J(Object.assign({}, await p.evaluate(() => FW.RIDER_DEFAULT), B)), '99.1: right after the taps, the sheet still open, the live rider is the rider built (FW.riderOutfit of it)', { figSame: S1.figSame, r: S1.r });
  ok(JSON.stringify(st1) === JSON.stringify(Object.assign({}, await p.evaluate(() => FW.RIDER_DEFAULT), B)), 'build: every tap is stored (settings.rider is the rider built)', st1);
  ok(S1.sums.join('|') === want.join('|'), 'QA: the summaries name the choices (' + S1.sums.join(' / ') + ')', { S: S1.sums, want });
  const NB = await namesOf(p, B); /* review round 4: after a change the names were compared only with each other */
  ok(FIELDS.every(k => S1.names[k] === NB[k] && !!NB[k]), 'build: right after the taps each field\'s label shows the bundle\'s name of the choice made (' + FIELDS.map(k => S1.names[k]).join(', ') + ')', { names: S1.names, want: NB });
  await done(p);
  const row = await p.evaluate(() => document.getElementById('prowV-rider').textContent);
  ok(row === 'Teal jersey', 'build: the row names the rider\'s jersey once built ("Teal jersey")', row);
  await sheet(p); const S2 = await sheetOf(p);
  const same = (a, b) => JSON.stringify(a.pressed) === JSON.stringify(b.pressed) && a.sums.join() === b.sums.join() && JSON.stringify(a.names) === JSON.stringify(b.names) && b.figSame;
  ok(same(S1, S2) && FIELDS.every(k => S2.pressed[k].length === 1 && S2.pressed[k][0] === B[k]), 'QA: a rider built, closed and reopened is the same (every pressed swatch, name, summary and the live rider)', { S1: S1.pressed, S2: S2.pressed });
  await reload(p); await settle(p, 400); await sheet(p); const S3 = await sheetOf(p);
  ok(same(S1, S3), 'build: and after a reload', S3.pressed);
  await x.close();
  // any tap stores the rider: tapping the choice already pressed (the default skin) on a fresh page builds the default rider
  { const y = await openH(), q = y.p; await sheet(q); await group(q, 'look'); await q.click('#rdGroups [data-rd="skin"][aria-pressed="true"]'); await settle(q, 150); await done(q);
    const A = await q.evaluate(() => ({ st: JSON.parse(localStorage.getItem('bluebird.settings.v2')).rider, mem: window.__q99.settings.rider, def: FW.RIDER_DEFAULT, row: document.getElementById('prowV-rider').textContent, name: FW.RIDER_NAMES.kit[FW.RIDER_DEFAULT.kit] }));
    ok(!!A.st && J(A.st) === J(A.def) && J(A.mem) === J(A.def) && A.row === A.name + ' jersey', 'build: tapping the choice already pressed builds the rider (the default rider stored; the row "' + A.row + '")', A);
    await y.close(); }
});

// a rider with every field tampered (each a different kind of bad value) and one field (helmet) set to a real choice: what riderNorm must give
const BAD_R = { skin: '__proto__', hairStyle: 7, hair: null, face: { beard: true }, helmet: '#F26B5B', glasses: 'constructor', lens: 'toString', frame: '#ffffff', kit: '#179bcc ', kit2: ['#0B7399'], sleeve: true, pattern: 'hasOwnProperty', shorts: 'valueOf', extra: 'x', html: '<img src=x onerror=alert(1)>' };
const wantNorm = p => p.evaluate(() => Object.assign({}, FW.RIDER_DEFAULT, { helmet: '#F26B5B' }));
const BAD_NOT = ['a rider', 42, true, ['#F26B5B']]; // not riders at all: the default rider
// a rider with every field but one (lens, a real choice) set to a value ANOTHER field offers (review round 4: the bad values above are offered
// by no field, so a riderNorm that took any field's value passed): a jersey colour for the skin, the helmet and the shorts, a sleeve colour
// for the frame and the fade, a fade colour for the sleeves, a shorts colour for the jersey, a hair style for the glasses, a face or glasses
// value for the hair style, the pattern and the face
const BAD_X = { skin: '#F26B5B', hairStyle: 'none', hair: '#F28C28', face: 'shield', helmet: '#F28C28', glasses: 'covered', lens: '#3FA66B', frame: '#E06AAE', kit: '#3048B4', kit2: '#E06AAE', sleeve: '#D94F92', pattern: 'beard', shorts: '#F26B5B' };
const wantX = p => p.evaluate(() => Object.assign({}, FW.RIDER_DEFAULT, { lens: '#3FA66B' }));
section('norm', async () => {
  const W = await (async () => { const x = await openH({ noErrs: true }); const w = await wantNorm(x.p); await x.close(); return w; })();
  const WX = await (async () => { const x = await openH({ noErrs: true }), p = x.p, w = await wantX(p);
    // the premise: each BAD_X value is offered by some other field and not by its own (lens: its own real choice)
    const P = await p.evaluate(X => Object.keys(X).filter(k => k !== 'lens').map(k => { const has = (f, v) => { const o = FW.RIDER_OPTIONS[f]; return Array.isArray(o) ? o.includes(v) : Object.prototype.hasOwnProperty.call(o, v); };
      return { k, v: X[k], own: has(k, X[k]), other: Object.keys(FW.RIDER_OPTIONS).filter(f => f !== k && has(f, X[k])) }; }), BAD_X);
    ok(P.length === 12 && P.every(x => !x.own && x.other.length), 'norm: each of BAD_X\'s values is offered by another field and not by its own (' + P.map(x => x.k + ' ' + x.v + ' from ' + x.other.join('/')).join(', ') + ')', P);
    await x.close(); return w; })();
  // on load: stored on the device
  { const x = await openH({ settings: { rider: BAD_R } }), p = x.p, mem = await p.evaluate(() => window.__q99.settings.rider);
    ok(JSON.stringify(mem) === JSON.stringify(W), '99.2: riderNorm on load: a stored rider with every field tampered (a number, null, an object, an array, true, a near-miss colour, \'__proto__\', \'constructor\', \'toString\', \'hasOwnProperty\', \'valueOf\') is each field\'s default, the real choice kept (helmet), the extra keys gone', mem);
    await sheet(p); const S = await sheetOf(p), NW = await namesOf(p, W);
    ok(FIELDS.every(k => S.pressed[k].length === 1 && S.pressed[k][0] === W[k] && S.names[k] === NW[k]) && S.figSame, 'norm: on load: the sheet and the live rider draw that rider (each field\'s label the bundle\'s name of it)', { pressed: S.pressed, names: S.names });
    await done(p); await sleep(300);
    const st = (await stored(p)).rider; ok(JSON.stringify(st) === JSON.stringify(W), 'norm: on load: the stored copy is the checked rider', st);
    await x.close(); }
  { const x = await openH({ settings: { rider: BAD_X } }), p = x.p, mem = await p.evaluate(() => window.__q99.settings.rider);
    ok(J(mem) === J(WX), '99.2: riderNorm on load: a stored rider whose fields hold values other fields offer (a jersey colour for the skin and the helmet, a sleeve colour for the frame, a hair style for the glasses, \'none\' for the hair style, \'beard\' for the pattern ...) is each field\'s default, the real choice kept (lens)', mem);
    await sheet(p); const S = await sheetOf(p), NX = await namesOf(p, WX);
    ok(FIELDS.every(k => S.pressed[k].length === 1 && S.pressed[k][0] === WX[k] && S.names[k] === NX[k]) && S.figSame && S.sums.join('|') === (await sumsOf(p, WX)).join('|'), 'norm: on load: the sheet draws that rider: one choice pressed in each field, its name and the summaries the default\'s (no "#F28C28 helmet")', { pressed: S.pressed, names: S.names, sums: S.sums });
    await x.close(); }
  for (const v of BAD_NOT) { const x = await openH({ settings: { rider: v } }), mem = await x.p.evaluate(() => window.__q99.settings.rider), D = await x.p.evaluate(() => FW.RIDER_DEFAULT);
    ok(JSON.stringify(mem) === JSON.stringify(D), 'norm: on load: a rider that is no rider (' + JSON.stringify(v) + ') is the default rider', mem); await x.close(); }
  { const x = await openH({ settings: { rider: null } }), mem = await x.p.evaluate(() => 'rider' in window.__q99.settings); ok(!mem, 'norm: on load: rider null is no rider (absent)', mem); await x.close(); }
  // on restore: a backup file
  for (const [tag, r, want] of [['tampered', BAD_R, W], ['values other fields offer', BAD_X, WX], ['not a rider', 'x', null]]) {
    const x = await openH(), p = x.p, D = await p.evaluate(() => FW.RIDER_DEFAULT);
    const bk = await p.evaluate(r => { const d = JSON.parse(JSON.stringify(window.__q99.backupData())); d.settings.rider = r; return d; }, r);
    await restore(p, bk); const mem = await p.evaluate(() => window.__q99.settings.rider);
    ok(JSON.stringify(mem) === JSON.stringify(want || D), 'QA: a tampered rider value in a backup draws the default: riderNorm on restore (' + tag + ')', mem);
    await sheet(p); const S = await sheetOf(p), NR = await namesOf(p, want || D); ok(S.figSame && FIELDS.every(k => S.pressed[k].length === 1 && S.pressed[k][0] === (want || D)[k] && S.names[k] === NR[k]), 'norm: on restore (' + tag + '): the sheet draws it (each label the bundle\'s name of it)', { pressed: S.pressed, names: S.names });
    await x.close(); }
  // when synced settings arrive: the cloud's rider tampered (a newer stamp), pulled by a signed-in device
  { const be = new Backend(), A = await synced(be, { label: 'A' }); await ready(be, A);
    const now = Date.now() + 5000, d = JSON.parse(JSON.stringify(doc(be))); d.settings.rider = BAD_R; d.settings.updatedAt = now; d.settingsAt = Object.assign({}, d.settingsAt, { rider: now, _u: now }); be.fs.set('users/u1', d);
    const got = await nudge([A.p], () => A.p.evaluate(() => !!window.__q99.settings.rider));
    const mem = await A.p.evaluate(() => window.__q99.settings.rider), st = (await stored(A.p)).rider;
    ok(!!got && JSON.stringify(mem) === JSON.stringify(W) && JSON.stringify(st) === JSON.stringify(W), 'QA: a tampered rider value in the cloud draws the default: riderNorm when synced settings arrive (every tampered field its default, the real choice kept)', { mem, st });
    const av = await A.p.evaluate(() => { const h = document.querySelector('#syncHdr .hav'), nm = s => String(s).replace(/\b(fw-[a-z]+)\d+/g, '$1#'); return !!h && h.classList.contains('av-on') && nm(h.querySelector('.av-r').innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.riderAvatar(window.__q99.riderNow(), 32) }).innerHTML); });
    ok(av, 'norm: synced: the header avatar draws the checked rider', av);
    // the merge itself, run again on the cloud copy just pulled (review round 3: with the merge taking the cloud's rider unchecked, the stored
    // copy and the header still come out equal, as syncSetSettings checks it again, but every pull applies the raw rider anew)
    const M = await A.p.evaluate(d => { const H = window.__q99, out = { apply: {}, up: [], upData: {} }; H.sfDocMerge(d, out); const s = out.apply.settings;
      return { apply: !!s, data: !!(s && s.data), rider: s && s.data ? s.data.rider : null, mine: H.settings.rider, sUp: out.sUp || [] }; }, doc(be));
    ok((!M.data || J(M.rider) === J(M.mine)) && !M.sUp.includes('rider'), 'norm: synced: merging that cloud copy again brings nothing new for the rider (sfDocMerge: any settings it applies carry this device\'s checked rider; the rider is not a key to upload)', M);
    // a second pull changes nothing (the cloud keeps its value; the device does not apply it again on every pull)
    const before = JSON.stringify(await stored(A.p)); await A.p.evaluate(() => { window.__q99n = 0; const h = document.getElementById('rdGroups'); new MutationObserver(r => { window.__q99n += r.length; }).observe(document.getElementById('syncHdr'), { subtree: true, childList: true }); });
    await nudge([A.p], async () => false, 6000);
    const after = JSON.stringify(await stored(A.p)), n = await A.p.evaluate(() => window.__q99n);
    ok(before === after && n === 0, 'norm: synced: later pulls of the same cloud copy change nothing here (the rider kept as checked, the avatar not drawn again)', { same: before === after, n });
    // values other fields offer, arriving from the cloud (a newer stamp)
    const now2 = Date.now() + 9000, d2 = JSON.parse(JSON.stringify(doc(be))); d2.settings.rider = BAD_X; d2.settings.updatedAt = now2; d2.settingsAt = Object.assign({}, d2.settingsAt, { rider: now2, _u: now2 }); be.fs.set('users/u1', d2);
    const got2 = await nudge([A.p], () => A.p.evaluate(() => window.__q99.settings.rider && window.__q99.settings.rider.lens === '#3FA66B'));
    const mem2 = await A.p.evaluate(() => window.__q99.settings.rider), st2 = (await stored(A.p)).rider;
    ok(!!got2 && J(mem2) === J(WX) && J(st2) === J(WX), 'QA: a rider in the cloud whose fields hold values other fields offer draws the default for each (riderNorm when synced settings arrive; the real choice, lens, kept)', { mem2, st2 });
    await A.close(); }
});
async function restore(p, d) {
  await toSettings(p); await p.click('#prowBtn-backup'); await until(() => p.evaluate(() => document.getElementById('setSheet').classList.contains('open')));
  await p.setInputFiles('#backupFile', { name: 'fred-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(d)) });
  await until(() => p.evaluate(() => { const t = document.getElementById('toast'); return !!t && /Restored/.test(t.textContent); }), 10000); await settle(p, 300);
  if (await p.evaluate(() => document.getElementById('setSheet').classList.contains('open'))) await done(p);
}

section('backup', async () => {
  // a backup made here (backupData, what the Backup sheet saves) carries the rider; restored on a fresh page with none, the rider arrives
  { const x = await openH({ settings: { rider: RIDER99 } }), ex = await x.p.evaluate(() => JSON.parse(JSON.stringify(window.__q99.backupData()))); await x.close();
    ok(!!ex.settings && J(ex.settings.rider) === J(RIDER99), '99.5: a backup made here carries the rider (backupData().settings.rider is the rider built)', ex.settings && ex.settings.rider);
    const y = await openH(), q = y.p; await restore(q, ex); const r = await q.evaluate(() => window.__q99.settings.rider);
    await sheet(q); const S = await sheetOf(q), N = await namesOf(q, RIDER99);
    ok(J(r) === J(RIDER99) && S.figSame && FIELDS.every(k => S.pressed[k][0] === RIDER99[k] && S.names[k] === N[k]) && S.r.kit === RIDER99.kit, 'backup: that export restored on a fresh page with no rider brings the rider (stored, the sheet, each label the bundle\'s name, and its live rider)', { r, names: S.names });
    await y.close(); }
  // a backup from before item 99: the backup format with no settings.rider (as main writes it)
  const x = await openH({ settings: { rider: RIDER99, birthday: '1980-05-04' } }), p = x.p;
  const old = await p.evaluate(() => { const d = JSON.parse(JSON.stringify(window.__q99.backupData())); delete d.settings.rider; delete d.settings.birthday; d.settings.units = 'metric'; return d; });
  await restore(p, old);
  const r = await p.evaluate(() => ({ rider: window.__q99.settings.rider, units: window.__q99.settings.units, bd: window.__q99.settings.birthday }));
  ok(J(r.rider) === J(RIDER99) && r.units === 'metric' && r.bd === '1980-05-04', 'QA: a backup from before this item (no rider) restores without losing this device\'s rider (as birthday): the rest of it restored (metric units)', r);
  ok(J((await stored(p)).rider) === J(RIDER99), 'backup: and the stored copy keeps it', null);
  const nr = Object.assign({}, RIDER99, { kit: '#F28C28', skin: 'fair' }), bk = await p.evaluate(r => { const d = JSON.parse(JSON.stringify(window.__q99.backupData())); d.settings.rider = r; return d; }, nr);
  await restore(p, bk); const r2 = await p.evaluate(() => window.__q99.settings.rider);
  ok(J(r2) === J(nr), '99.5: a backup with a rider brings its rider', r2);
  await sheet(p); const S = await sheetOf(p), NR = await namesOf(p, nr); ok(S.pressed.kit[0] === '#F28C28' && S.figSame && FIELDS.every(k => S.names[k] === NR[k]), 'backup: the sheet (each label the bundle\'s name) and the live rider show the restored rider', { pressed: S.pressed, names: S.names });
  await x.close();
  // a device with no rider and a backup with none: still none
  const y = await openH(), o = await y.p.evaluate(() => { const d = JSON.parse(JSON.stringify(window.__q99.backupData())); delete d.settings.rider; return d; });
  await restore(y.p, o); ok(!(await y.p.evaluate(() => 'rider' in window.__q99.settings)), 'backup: no rider here and none in the backup: still none (not built)'); await y.close();
});

section('sync', async () => {
  const be = new Backend(), A = await synced(be, { label: 'A' }), B = await synced(be, { label: 'B' });
  await ready(be, A, B);
  const sr0 = await B.p.evaluate(() => !!window.__q99.settings.sameRecipe);
  // A builds a rider in the sheet
  await sheet(A.p); await allOpen(A.p); for (const k of FIELDS) await tap(A.p, k, RIDER99[k]); await done(A.p);
  const up = await until(() => J((doc(be).settings || {}).rider) === J(RIDER99), 20000);
  ok(!!up, 'sync: A\'s rider reaches the cloud', (doc(be).settings || {}).rider);
  const D = doc(be), at = D.settingsAt || {};
  ok(!!up && typeof at.rider === 'number' && !Object.keys(at).some(k => /^rider\./.test(k)) && !Object.keys(D.settings || {}).some(k => /^rider\./.test(k)), '99.2: the rider syncs as one unit: users/u1.settings.rider whole, one settingsAt stamp (rider), no part of it on its own', { at: Object.keys(at) });
  // B, not pulled since, saves an unrelated setting (Same recipe in every bottle)
  ok(!(await B.p.evaluate(() => 'rider' in window.__q99.settings)), 'sync: B has not pulled A\'s rider yet');
  await toSettings(B.p); await B.p.click('#prowBtn-samerecipe'); await settle(B.p, 200);
  await until(() => (doc(be).settings || {}).sameRecipe === !sr0, 20000);
  const both = await nudge([A.p, B.p], async () => { const a = await A.p.evaluate(() => [window.__q99.settings.rider, window.__q99.settings.sameRecipe]), b = await B.p.evaluate(() => [window.__q99.settings.rider, window.__q99.settings.sameRecipe]);
    return J(a[0]) === J(RIDER99) && J(b[0]) === J(RIDER99) && a[1] === !sr0 && b[1] === !sr0 ? { a, b } : null; });
  ok(!!both && J(doc(be).settings.rider) === J(RIDER99) && doc(be).settings.sameRecipe === !sr0, 'QA: two devices: A builds a rider, B (not pulled yet) saves an unrelated setting, both sync: A\'s rider stands on both and in the cloud, B\'s setting too', { both, cloud: doc(be).settings && doc(be).settings.rider });
  const avB = await B.p.evaluate(() => { const h = document.querySelector('#syncHdr .hav'); return !!h && h.classList.contains('av-on') && !!h.querySelector('.av-r svg'); });
  ok(avB, 'sync: B\'s header avatar is A\'s rider now', avB);
  // then B changes the rider already built (two taps in its sheet): B's whole rider on both and in the cloud, one settingsAt stamp newer
  // than A's, and A's header circle redrawn in it (review round 3: only A building from nothing was synced before)
  const hdrIs = (q, r) => q.evaluate(r => { const a = document.querySelector('#syncHdr .hav.av-on>.av-r'), nm = s => String(s).replace(/\b(fw-[a-z]+)\d+/g, '$1#'); return !!a && nm(a.innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.riderAvatar(r, 32) }).innerHTML); }, r);
  const riders = async () => ({ a: await A.p.evaluate(() => window.__q99.settings.rider), b: await B.p.evaluate(() => window.__q99.settings.rider), cloud: (doc(be).settings || {}).rider, at: doc(be).settingsAt || {}, sr: [await A.p.evaluate(() => !!window.__q99.settings.sameRecipe), await B.p.evaluate(() => !!window.__q99.settings.sameRecipe), !!(doc(be).settings || {}).sameRecipe] });
  const atA = (doc(be).settingsAt || {}).rider, WB = Object.assign({}, RIDER99, { kit: '#F28C28', hairStyle: 'covered' });
  await sheet(B.p); await allOpen(B.p); await tap(B.p, 'kit', WB.kit); await tap(B.p, 'hairStyle', WB.hairStyle); await done(B.p);
  const bOk = await nudge([A.p, B.p], async () => { const v = await riders(); return J(v.a) === J(WB) && J(v.b) === J(WB) && J(v.cloud) === J(WB) ? v : null; });
  const vB = bOk || await riders(), hA = await hdrIs(A.p, WB);
  ok(!!bOk && typeof vB.at.rider === 'number' && vB.at.rider > atA && !Object.keys(vB.at).some(k => /^rider\./.test(k)) && hA, 'QA: then B changes the rider (two taps: Orange jersey, a head covering): B\'s whole rider on A, on B and in users/u1.settings.rider, one settingsAt stamp newer than A\'s, and A\'s header circle is FW.riderAvatar of it', { a: vB.a, b: vB.b, cloud: vB.cloud, at: vB.at.rider, atA, hA });
  // A changes it again while B, not pulled since, saves an unrelated setting: A's rider stands on both
  const WA = Object.assign({}, WB, { skin: 'fair' });
  await sheet(A.p); await group(A.p, 'look'); await tap(A.p, 'skin', WA.skin); await done(A.p);
  await until(() => J((doc(be).settings || {}).rider) === J(WA), 20000);
  await toSettings(B.p); await B.p.click('#prowBtn-samerecipe'); await settle(B.p, 200);
  const aOk = await nudge([A.p, B.p], async () => { const v = await riders(); return J(v.a) === J(WA) && J(v.b) === J(WA) && J(v.cloud) === J(WA) && v.sr.every(x => x === sr0) ? v : null; });
  ok(!!aOk && await hdrIs(B.p, WA), 'sync: A changes it again while B (not pulled) saves an unrelated setting: A\'s rider stands on both and in the cloud (B\'s header circle too), B\'s setting too', aOk || await riders());
  await A.close(); await B.close();
});

section('private', async () => {
  const x = await openH({ settings: { rider: Object.assign({}, RIDER99, { hairStyle: 'braids', skin: 'olive' }) } }), p = x.p;
  await crunch(p); await toY(p, '#rWearCard');
  const T = await p.evaluate(() => { const H = window.__q99, d = H.dbgDump(); return { d, ai: Object.keys(H.AI_CARD).map(k => [k, H.aiFill(k)]) }; });
  const vals = ['"rider"', 'braids', 'olive', '#D94F92', '#3FA66B', '#212D69', 'riderOutfit', 'fw-person'];
  const inD = vals.filter(v => T.d.includes(v)), j = JSON.parse((/```json\n([\s\S]*?)\n```/.exec(T.d) || [])[1] || '{}');
  ok(!inD.length && j.settings && !('rider' in j.settings) && Object.keys(j.settings).length > 10, '99.5: the troubleshooting copy leaves the rider out (DBG_DROP_SET: no rider key in its settings, none of its values, nothing of the strip)', { inD, keys: j.settings && Object.keys(j.settings).length });
  const inA = T.ai.map(([k, t]) => [k, vals.filter(v => t.includes(v)), t.length]).filter(a => a[1].length || !a[2]);
  ok(T.ai.length >= 4 && !inA.length, '99.5: no AI prompt has the rider (every prompt kind: ' + T.ai.map(a => a[0]).join(', ') + ')', inA);
  // static: the AI prompt builder reads no settings.rider (and nothing that builds the troubleshooting copy does but to drop it)
  const ms = SRC.replace(/<script id="fwJs">[\s\S]*?<\/script>/, ''), body = n => { const i = ms.indexOf('\nfunction ' + n + '('); return i < 0 ? '' : ms.slice(i, ms.indexOf('\nfunction ', i + 10)); };
  ok(['aiFill', 'aiAthleteName', 'aiLatestWorkout'].every(n => body(n) && !/rider/i.test(body(n))) && !/settings\.rider|riderNow|riderNorm/.test(body('dbgDump')), 'private: the prompt builders (aiFill and its helpers) and dbgDump never read the rider', null);
  // the rider by its names (review round 4: the search above held ids and hex values only, case-sensitive, so a prompt carrying the Kit and
  // Gear summaries passed): for a rider of unusual names, every prompt kind with the rider and without it (the same page, settings.rider
  // taken out) must be the same, and none may hold a summary or a chosen name (case aside) that the prompt without the rider does not
  const RA = Object.assign({}, RIDER99, { skin: 'olive', hairStyle: 'braids', hair: '#E9C46A', face: 'stache', helmet: '#8D949A', glasses: 'pair', lens: '#F2763A', frame: '#179BCC', kit: '#F27FB4', pattern: 'splatter', shorts: '#3048B4', kit2: '#D94F92', sleeve: '#BECC41' });
  const NA = await namesOf(p, RA), SA = await sumsOf(p, RA);
  const AN = await p.evaluate(RA => { const H = window.__q99, s0 = H.settings, kinds = Object.keys(H.AI_CARD); H.settings = Object.assign({}, s0, { rider: RA }); const w = kinds.map(k => H.aiFill(k)); const o = Object.assign({}, s0); delete o.rider; H.settings = o; const wo = kinds.map(k => H.aiFill(k)); H.settings = s0; return { kinds, w, wo }; }, RA);
  const terms = [...new Set([...SA, ...SA.flatMap(s => s.split(' · ')), ...Object.values(NA)].filter(Boolean))], lo = s => s.toLowerCase();
  const inW = terms.filter(n => AN.w.some(s => lo(s).includes(lo(n)))), base = inW.filter(n => AN.wo.some(s => lo(s).includes(lo(n)))), named = inW.filter(n => !base.includes(n)), diff = AN.kinds.filter((k, i) => AN.w[i] !== AN.wo[i]);
  ok(AN.kinds.length >= 4 && !diff.length && !named.length, '99.5: no AI prompt has the rider by name: every prompt kind (' + AN.kinds.join(', ') + ') is the same with the rider as without it, and none holds its summaries or chosen names (' + SA.join(' / ') + ')' + (base.length ? '; in the prompts either way, so not the rider: ' + base.join(', ') : ''), { diff, named });
  // and in the source: outside the rider's own code (rider* and rd* functions), only these functions call into it or read settings.rider,
  // each for a reason the decisions name; any other (an AI helper, a copy, a share) fails. The comments are left out of the scan
  const RIDER_USERS = { vN: 'the load line after `let settings` (riderSetNorm)', setSheetOpen: 'opens the sheet (riderSheet)', renderProfileRows: 'the row\'s value (riderRowV)', renderWear: 'the strip (riderStrip)', restoreAll: 'restore keeps or checks the rider', sfDocMerge: 'the cloud copy checked (riderSetNorm)', syncSetSettings: 'synced settings checked (riderSetNorm)', syncRender: 'a synced rider redrawn (riderApply)', renderSyncStatus: 'the header circle (riderHdr)', sbAcctRender: '#sbAv (riderAv)' };
  const code = ms.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[\s;{}(),])\/\/[^\n]*/g, '$1'), RU = /\b(riderNow|riderNorm|riderSetNorm|rdSum|rdNm|rdName|riderBuilt|riderIds|riderRowV|riderAv|riderStrip|riderHdr|riderApply|riderPut|riderSheet|riderSheetSync|riderOutfit|riderAvatar|RIDER_[A-Z]+)\b|\.rider\b|\[['"]rider['"]\]/;
  const users = [...code.matchAll(/\nfunction ([A-Za-z0-9_$]+)\(/g)].map((m, i, L) => [m[1], code.slice(m.index, i + 1 < L.length ? L[i + 1].index : code.length)]).filter(([n, b]) => !/^(rider|rd)[A-Z]/.test(n) && RU.test(b)).map(([n]) => n);
  const stray = users.filter(n => !Object.prototype.hasOwnProperty.call(RIDER_USERS, n));
  ok(users.length >= 8 && !stray.length, 'private: outside the rider\'s own code only ' + Object.keys(RIDER_USERS).length + ' functions read the rider or call into it, each for its reason (' + users.join(', ') + '): no prompt or copy helper does', { stray, users });
  await x.close();
  // the privacy note's "What's stored" line
  const y = await openH(), pv = await y.p.evaluate(() => { const b = document.getElementById('privacyBody'), h = [...b.querySelectorAll('h3')].find(e => /What.s stored/.test(e.textContent)); return h && h.nextElementSibling ? h.nextElementSibling.textContent : null; });
  ok(!!pv && /your rider[’']s look/.test(pv), '99.5: the privacy note\'s "What\'s stored" line names "your rider\'s look"', pv);
  await y.close();
});

// the avatars: the header's circle, #sbAv, what each shows
const avOf = p => p.evaluate(() => { const vis = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden';
  const nm = s => String(s).replace(/\b(fw-[a-z]+)\d+/g, '$1#'), r = window.__q99 && window.__q99.riderNow();
  const one = (box, size) => { if (!box) return null; const i = box.querySelector(':scope>.av-i'), a = box.querySelector(':scope>.av-r'), s = a && a.querySelector('svg'), rc = s && s.getBoundingClientRect();
    return { shown: vis(box), ini: i ? i.textContent : box.textContent, iniVis: vis(i), art: vis(s), same: !!s && !!r && nm(a.innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.riderAvatar(r, size) }).innerHTML), w: rc ? Math.round(rc.width) : 0, h: rc ? Math.round(rc.height) : 0, hid: a && a.getAttribute('aria-hidden'),
      go: !!a && a.classList.contains('fwm-go'), run: a ? a.getAnimations({ subtree: true }).filter(x => x.playState === 'running').length : 0 }; };
  return { inBtn: vis(document.getElementById('syncHdrIn')), outline: vis(document.querySelector('#syncHdrIn svg')), hav: one(document.querySelector('#syncHdr .hav'), 32), sb: one(document.getElementById('sbAv'), 30), dk: document.documentElement.classList.contains('dk'), run: document.documentElement.classList.contains('run-theme') }; });
section('avatar', async () => {
  // signed out (sync on, nobody signed in), built and not: the outline and the empty circle, never the rider
  for (const built of [false, true]) for (const desk of [false, true]) {
    const be = new Backend(), x = await openH({ file: SYNCED, route: be.handler('o'), settings: built ? { rider: RIDER99 } : {}, width: desk ? 1280 : 390, height: desk ? 800 : 844, settle: 1200 }), v = await avOf(x.p);
    ok(desk ? v.dk && !!v.sb && !v.sb.art && v.sb.ini === '' : v.inBtn && v.outline && !(v.hav && v.hav.shown), '99.3: signed out' + (built ? ', a rider built' : '') + (desk ? ': #sbAv the empty circle, no rider (computer layout)' : ': the header shows the outline, no rider'), v);
    await x.close(); }
  // signed in, not built: the initial at both places
  for (const desk of [false, true]) {
    const be = new Backend(), x = await synced(be, { label: 'n', width: desk ? 1280 : 390, height: desk ? 800 : 844 }); await until(() => x.p.evaluate(d => !!document.querySelector(d ? '#sbAv .av-i' : '#syncHdr .hav .av-i'), desk), 15000);
    const v = await avOf(x.p), b = desk ? v.sb : v.hav;
    ok(!!b && b.shown && b.ini === 'T' && b.iniVis && !b.art, '99.3: signed in, no rider built: the initial (' + (desk ? '#sbAv, computer layout' : 'the header') + '), as today', v);
    await x.close(); }
  // signed in and built: the rider, still, sized; the initial kept under it; on the run too
  for (const [desk, run] of [[false, false], [true, false], [false, true]]) {
    const be = new Backend(), x = await synced(be, { label: 'b', settings: { rider: RIDER99 }, width: desk ? 1280 : 390, height: desk ? 800 : 844, dpr: 2 }), p = x.p;
    if (run) { await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=run]'); await until(() => p.evaluate(() => document.documentElement.classList.contains('run-theme'))); }
    await until(() => p.evaluate(d => !!document.querySelector(d ? '#sbAv.av-on svg' : '#syncHdr .hav.av-on svg'), desk), 15000); await sleep(1500);
    const v = await avOf(p), b = desk ? v.sb : v.hav, sz = desk ? 30 : 32, where = desk ? '#sbAv on the computer layout (30 px)' : 'the header circle (32 px)' + (run ? ' on the run (graphite)' : '');
    ok(!!b && b.art && b.same && b.w === sz && b.h === sz && b.hid === 'true' && b.ini === 'T' && !b.iniVis && (!run || v.run), '99.3: signed in and built: the rider replaces the initial in ' + where + ' (FW.riderAvatar of the rider, ids aside; aria-hidden; the initial kept under it)', v);
    ok(!!b && !b.go && !b.run, '99.3: the avatar is always still (' + where + ': no .fwm-go, nothing running)', b);
    painted(await paintOf(p, desk ? '#sbAv>.av-r>svg' : '#syncHdr .hav>.av-r>svg', sz), 'avatar: ' + where + ': the rider shows');
    if (desk) { // #sbAv is kept by its key: going offline and back and its own re-renders draw nothing again (the same svg, no child changed)
      await p.evaluate(() => { const a = document.querySelector('#sbAv>.av-r'); a.querySelector('svg').__q99 = 1; window.__q99sb = 0; new MutationObserver(r => { window.__q99sb += r.length; }).observe(a, { subtree: true, childList: true }); });
      await p.context().setOffline(true); await p.evaluate(() => window.dispatchEvent(new Event('offline'))); await sleep(1200);
      await p.context().setOffline(false); await p.evaluate(() => window.dispatchEvent(new Event('online'))); await sleep(2500);
      await p.evaluate(() => { for (let k = 0; k < 3; k++) window.__q99.sbAcctRender(); }); await sleep(300);
      const K = await p.evaluate(() => { const s = document.querySelector('#sbAv>.av-r svg'); return { same: !!s && s.__q99 === 1, muts: window.__q99sb }; });
      ok(K.same && K.muts === 0, 'avatar: #sbAv is kept by its key (offline, back online and three re-renders: the same drawing, nothing redrawn)', K); }
    await p.emulateMedia({ forcedColors: 'active' }); await settle(p, 100); const fc = await avOf(p), fb = desk ? fc.sb : fc.hav;
    await p.emulateMedia({ forcedColors: 'none', media: 'print' }); await settle(p, 100); const pr = await avOf(p), pb = desk ? pr.sb : pr.hav;
    await p.emulateMedia({ media: 'screen' });
    ok(!!fb && !fb.art && fb.iniVis && (!pb || (!pb.art && (pb.iniVis || !pb.shown))), 'avatar: forced colours (and print) show the initial, no art (' + where + ')', { fb, pb });
    await x.close(); }
  // the header's rider is drawn once on a signed-in load and kept (review round 3: .hav was rebuilt when the initial went from '?' to the
  // real one at sign-in): every drawing put in the header circle's .av-r is recorded from the app's first line; through sign-in, the first
  // pull and later pulls there is one, the one shown, with the real initial under it
  { const be = new Backend(), x = await synced(be, { file: AVW_SYNCED, label: 'hk', settings: { rider: RIDER99 } }), p = x.p; await ready(be, x); await nudge([p], async () => false, 4500);
    const K = await p.evaluate(() => { const L = window.__q99hav || [], s = document.querySelector('#syncHdr>.hav>.av-r>svg'); return { drawn: L.length, shown: !!s && L[0] === s, ini: (document.querySelector('#syncHdr>.hav>.av-i') || {}).textContent, st: document.getElementById('syncHdr').dataset.st }; });
    ok(K.drawn === 1 && K.shown && K.ini === 'T', 'avatar: the header\'s rider is drawn once on a signed-in load and kept by its key: one drawing from the first (before sign-in is known) through sign-in, the first pull and later pulls, the one shown, the initial "T" under it', K);
    await x.close(); }
  // the header's sync badge still follows the sync state with the rider in the circle (renderSyncStatus sets data-st without redrawing .hav)
  { const be = new Backend(), x = await synced(be, { label: 'st', settings: { rider: RIDER99 } }), p = x.p;
    await until(() => p.evaluate(() => !!document.querySelector('#syncHdr .hav.av-on svg')), 15000); await sleep(1500);
    const st = () => p.evaluate(() => { const h = document.getElementById('syncHdr'), a = getComputedStyle(h, '::after'); return { st: h.dataset.st, badge: a.content !== 'none' && a.display !== 'none', bg: a.backgroundColor, rider: !!h.querySelector('.hav.av-on .av-r svg') }; });
    const s0 = await st(); await p.context().setOffline(true); await p.evaluate(() => window.dispatchEvent(new Event('offline')));
    const s1 = (await until(async () => { const v = await st(); return v.st === 'offline' ? v : null; }, 8000)) || await st();
    await p.context().setOffline(false); await p.evaluate(() => window.dispatchEvent(new Event('online')));
    const s2 = (await until(async () => { const v = await st(); return v.st === s0.st ? v : null; }, 20000)) || await st();
    ok(s0.st === 'synced' && s0.rider && s1.st === 'offline' && s1.badge && s1.rider && s2.st === 'synced' && s2.rider, 'avatar: with the rider in the header circle, the sync badge follows the state: offline sets data-st offline and draws its badge, back online it is synced (the rider kept)', { s0, s1, s2 });
    await x.close(); }
});

// ---- the strip ----
// under-layers drawn by design as nothing (decision): the jerseys, bib shorts, base layers and summer socks; arm warmers and sun sleeves under
// sleeves of a thermal jersey or a jacket. New with v7 (FROM-APP-CHAT-6, "for the record"): wool socks under any foot cover (the shin has
// about 18 units between the shorts and the shoe, and a real cover hides the sock; with toe covers or bare shoes they show and are judged);
// everything under the rain jacket, now outermost (the vest, the windbreaker, the thermal and winter jackets, a thermal jersey); a thermal
// jersey under any sleeved outer piece (with the vest alone its sleeves show and are judged)
const UNDER = new Set(['jersey-light', 'jersey-med', 'bibs', 'base-ls', 'base-ss', 'base-sleeveless', 'base-thermal', 'socks-summer']);
const SLEEVED = ['jersey-heavy', 'windbreaker', 'jacket-thermal', 'jacket-winter', 'jacket-rain'], JACKETS = SLEEVED.slice(1);
const COVERS = ['shoes', 'overshoes', 'boots'], UNDER_RAIN = ['vest', 'windbreaker', 'jacket-thermal', 'jacket-winter', 'jersey-heavy'];
const byDesign = (id, L) => UNDER.has(id) || ((id === 'arms' || id === 'sun-sleeves') && L.some(x => SLEEVED.includes(x)))
  || (id === 'socks-wool' && L.some(x => COVERS.includes(x))) || (UNDER_RAIN.includes(id) && L.includes('jacket-rain'))
  || (id === 'jersey-heavy' && L.some(x => JACKETS.includes(x)));
// the known v7 gaps (decision; the design chat is asked for v8 in FROM-APP-CHAT-6.md points 1-3, and review round 4 holds a proposed point 4
// the app chat has not decided yet): the one list of items the strip lists
// that v7 draws as nothing or without their own colour, each tied to its point, as wide as measured on v7 (the default rider on all 8
// skins and RIDER99, every ride's list: probe99/v7/m-v7.json) and no wider; printed as notes. The item that takes v8 empties it.
// hold 'all': only a note (the point says the item draws nothing there); hold 'own': the pixels changed are judged as any item's, only
// its own-colour count is a note.
const LEG = ['legs', 'tights-light', 'tights-heavy'];
const V7_GAPS = [
  // v7's overshoe cuff starts at y 256 (ink from 253.5) and hides the leg wear: tights-heavy with overshoes draws what overshoes alone
  // draw. On v7: tights-heavy 0 px changed on the Hard freezing and Recovery cold full-closet lists (with wool socks); leg warmers, light
  // or heavy tights with overshoes alone 28 px, 0 in their colour
  { ids: LEG, when: L => L.includes('overshoes'), point: 1, hold: 'all', what: 'leg warmers or tights under overshoes (the cuff from y 256 hides them): 0 px changed with wool socks too, 28 without' },
  // the shoe-cover cuff (y 266-278, #1E1E24) is covered by its ink outline, the #C9D1DA hem and the shoe's outline: on v7 202 px changed
  // over leg warmers (starter lists), 324 over tights (full lists) and alone, 256 with knee and toe covers, and 0 in #1E1E24 on every list
  // and skin. The changed pixels still must pass
  { ids: ['shoes'], when: () => true, point: 2, hold: 'own', what: 'shoe covers paint 0 device px of their own colour #1E1E24 (an ink band and the light hem: 202 px changed over leg warmers, 324 over tights)' },
  // dark gloves on deep brown skin (#5A3622; once SKIN_GAPS A): on v7 the full-finger gloves (#2A2A30) change 0 px (the wet lists), the
  // fingerless ones 304 px, 8 of them in #2A2A30 (only the light cuff reads: the hot and mild full lists); dark brown and lighter pass
  { ids: ['gloves'], when: (L, r) => r.skin === 'deep', point: 3, hold: 'all', what: 'full-finger gloves (#2A2A30) on deep brown skin (#5A3622): no pixel changed by more than 48' },
  { ids: ['gloves-finger'], when: (L, r) => r.skin === 'deep', point: 3, hold: 'own', what: 'fingerless gloves (#2A2A30) on deep brown skin: 304 px changed, 8 in their own colour (only the light cuff reads)' },
  // review round 4 (every jersey colour judged): on a Black jersey (#1E1E24) two items read poorly. Not in FROM-APP-CHAT-6: held here until
  // the app chat decides (a point for the v8 note, or a by-design rule), each as wide as measured on v7. The winter jacket (#1E2A4A, at most
  // 12 a channel from #1E1E24) over a Black jersey with sleeves Same as jersey: 240 px changed, 0 in its colour (the freezing and Hard
  // freezing full-closet lists, the default rider; the acceptance check saw the same on all 8 skins); with white sleeves (RIDER99) it shows
  // (2189 / 1954). The thermal jersey in Black with arm warmers and the vest (the cold, freezing, Hard freezing and Recovery cold starter
  // lists, both riders): 0 px changed, its sleeves the arm warmers' black and its body under the vest
  { ids: ['jacket-winter'], when: (L, r) => r.kit === '#1E1E24' && r.sleeve === '', point: '4', note: 'proposed point 4 (not in FROM-APP-CHAT-6: the app chat to decide)', hold: 'own', what: 'the winter jacket (#1E2A4A) over a Black jersey with sleeves Same as jersey: 240 px changed, 0 in its own colour (only its seams read)' },
  { ids: ['jersey-heavy'], when: (L, r) => r.kit === '#1E1E24' && L.includes('arms') && L.includes('vest'), point: '4', note: 'proposed point 4 (not in FROM-APP-CHAT-6: the app chat to decide)', hold: 'all', what: 'the thermal jersey in Black with arm warmers and the vest: 0 px changed (its sleeves the arm warmers\' black, its body under the vest)' },
];
const gapOf = g => g.note || 'FROM-APP-CHAT-6 point ' + g.point; // where a held entry is asked for
// each item's own colour (knee grey and the like): the bundle's OUTFIT_LOOK colours
const OWN = { toes: '#8E949A', knees: '#B9C2CF', skullcap: '#8FA7C4', 'socks-wool': '#8E949A', gaiter: '#2ABCBB', vest: '#BFE6E6', windbreaker: '#DCE1E8', 'jacket-thermal': '#2F3B6E', 'jacket-winter': '#1E2A4A', 'jacket-rain': '#F2D64B',
  boots: '#3A2F2A', 'tights-heavy': '#14141A', 'tights-light': '#1E1E24', legs: '#1E1E24', arms: '#1E1E24', 'sun-sleeves': '#FFFFFF', gloves: '#2A2A30', 'gloves-finger': '#2A2A30', 'gloves-thermal': '#1E1E24', 'gloves-lobster': '#1E1E24', balaclava: '#1E1E24', head: '#2ABCBB', shoes: '#1E1E24', overshoes: '#1E1E24' };
// shows: at the strip's size on a 2x screen (100 x 150 CSS px, 200 x 300 device px), at least 120 device px (30 CSS px) changed by more than 48 in
// a channel (the bundle check's "clearly visible"), and of them at least 40 (10 CSS px) in the item's own colour where it has one (2x: a thin
// part's own colour is lost to anti-aliasing at 1x)
const SHOW = { d48: 120, own: 40 };
// in the page: the rider at strip size on a canvas (FW.plain), whole and with each item left out; per item the pixels changed and those in its own colour
// (box: [x0, y0, x1, y1] in the drawing's units, 1:1 here: also the changed pixels whose centres are inside it)
const pxOf = (p, r, ids, own, box) => p.evaluate(async ([r, ids, own, box]) => { const W = 200, H = 300, mk = L => FW.plain(FW.riderOutfit(r, L)).replace('<svg ', `<svg width="${W}" height="${H}" `);
  const draw = async s => { const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); await img.decode(); const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0, W, H); return x.getImageData(0, 0, W, H).data; };
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)), whole = await draw(mk(ids)), out = {};
  for (const id of new Set(ids)) { const minus = await draw(mk(ids.filter(x => x !== id))), oc = own[id] === 'kit' ? hx(r.kit) : own[id] ? hx(own[id]) : null; let d48 = 0, o = 0, b = 0;
    for (let i = 0; i < whole.length; i += 4) { const d = Math.max(Math.abs(whole[i] - minus[i]), Math.abs(whole[i + 1] - minus[i + 1]), Math.abs(whole[i + 2] - minus[i + 2])); if (d > 48) { d48++; const q = i / 4, cx = q % W + 0.5, cy = Math.floor(q / W) + 0.5; if (box && cx >= box[0] && cx <= box[2] && cy >= box[1] && cy <= box[3]) b++; if (oc && Math.max(Math.abs(whole[i] - oc[0]), Math.abs(whole[i + 1] - oc[1]), Math.abs(whole[i + 2] - oc[2])) <= 10) o++; } }
    out[id] = Object.assign({ d48, own: oc ? o : null }, box ? { box: b } : {}); }
  return out; }, [r, ids, own, box || null]);
// the strip as shown: its ids (the app's own record), its drawing against FW.riderOutfit(rider, ids), and outfit()'s list for the ride shown
const stripOf = p => p.evaluate(() => { const H = window.__q99, el = document.getElementById('rRider'), i = H.lastResult && H.lastResult.i || H.readInputs(), minF = i.wxMinF != null ? i.wxMinF : i.tempF, maxF = i.wxMaxF != null ? i.wxMaxF : null;
  const o = H.outfit(minF, maxF, i.wxRain, i.intensity), list = o.wear.map(c => c && c.id), r = H.riderNow(), s = el && el.querySelector('svg'), rc = s && s.getBoundingClientRect(), card = document.getElementById('rWearCard').getBoundingClientRect(), wear = document.getElementById('rWear').getBoundingClientRect();
  const nm = h => String(h).replace(/\b(fw-[a-z]+)\d+/g, '$1#'), ticks = [...document.querySelectorAll('#rWear [data-tick-items]')].flatMap(t => JSON.parse(t.dataset.tickItems)).map(k => k.slice(2));
  return { ids: el && el._ids, list, ticks, shed: o.shed.map(c => c.id), minF, maxF, rain: i.wxRain, r, svg: !!s, same: !!s && nm(el.innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.riderOutfit(r, el._ids || []) }).innerHTML), w: rc && Math.round(rc.width), h: rc && Math.round(rc.height),
    inCard: !!rc && rc.left >= card.left && rc.right <= card.right && rc.bottom <= wear.top + 1, above: !!rc && rc.bottom <= wear.top + 1, hid: el && el.getAttribute('aria-hidden'), text: el ? el.textContent.trim() : null, still: !!el && !el.classList.contains('fwm-go') && !el.getAnimations({ subtree: true }).some(a => a.playState === 'running'),
    rec: H.FWM.get(el) ? { s: H.FWM.get(el).s, k: H.FWM.get(el).k.slice(0, 40) } : null }; });
// the rides: [name, forecast, effort tapped before the Crunch (else the athlete's Steady)]. Hard and Recovery pick other items than Steady
// (the full closet: tights-heavy and overshoes on a Hard freezing and a Recovery cold ride)
const RIDES = [['hot', { lo: 92, hi: 99 }], ['mild', { lo: 59, hi: 63 }], ['cold', { lo: 40, hi: 44 }], ['freezing', { lo: 24, hi: 29 }], ['wet', { lo: 53, hi: 57, rain: 80 }],
  ['hard freezing', { lo: 24, hi: 29 }, 'hard'], ['recovery cold', { lo: 40, hi: 44 }, 'recovery']];
async function setCloset(p, kind, extra) { await p.evaluate(([kind, extra]) => { const H = window.__q99, mk = id => H.closetItemFromCatalog(H.CLOSET_CATALOG.find(c => c.id === id));
  const L = (kind === 'full' ? H.CLOSET_CATALOG.map(c => c.id) : H.CLOSET_STARTER).map(mk).concat(extra || []); H.settings.closet = L; H.save(H.KEYS.settings, H.settings); H.refreshResults(); }, [kind, extra || null]); await settle(p, 200); }
const GAPS_SEEN = new Map(), FIXED_SEEN = new Map();
// the v6 gaps v7 fixed (V6_GAPS and SKIN_GAPS B until v7): each is judged as any item now, and each must be judged somewhere (a ride's
// list, or the direct lists below where no ride reaches it); the smallest measurement of each is printed
const FIXED_BY_V7 = [
  { ids: ['shoes'], when: L => L.some(x => LEG.includes(x)), point: 1, what: 'shoe covers with leg warmers or tights (their pixels changed; their own colour is v7 point 2)' },
  { ids: ['overshoes'], when: L => L.some(x => LEG.includes(x)), point: 1, what: 'overshoes with leg warmers or tights' },
  { ids: ['jacket-rain'], when: L => L.some(x => ['windbreaker', 'jacket-thermal', 'jacket-winter', 'vest'].includes(x)), point: 2, what: 'the rain jacket with a windbreaker, a jacket or the vest (now outermost, sleeves and body)' },
  { ids: ['windbreaker', 'jacket-thermal', 'jacket-winter'], when: L => L.includes('jersey-heavy'), point: 3, what: 'a windbreaker or a jacket over a thermal jersey (its sleeves and body)' },
  { ids: ['socks-wool'], when: L => L.some(x => LEG.includes(x)) && !L.some(x => COVERS.includes(x)), point: 4, what: 'wool socks under leg warmers or tights (with toe covers or bare shoes)' },
  { ids: ['knees'], when: () => true, point: 5, what: 'knee warmers' },
  { ids: ['skullcap'], when: (L, r) => r.glasses === 'none', point: 6, what: 'the skullcap with glasses none' },
  { ids: ['head'], when: (L, r) => r.glasses === 'shield', point: 7, what: 'the headband with the shield glasses' },
  { ids: ['legs'], when: (L, r) => ['tan', 'olive', 'brown', 'dark', 'deep'].includes(r.skin) && L.includes('shoes'), point: 'B', what: 'leg warmers with shoe covers on tan to deep brown skin (SKIN_GAPS B)' },
];
// every rider shown (the default and the built one) is judged; only V7_GAPS' entries are held
function judge(tag, S, px) {
  const L = S.ids || [];
  for (const id of L) { if (byDesign(id, L)) continue; const v = px[id], gaps = V7_GAPS.filter(g => g.ids.includes(id) && g.when(L, S.r)), all = gaps.some(g => g.hold === 'all'), own = gaps.some(g => g.hold === 'own');
    const d = !!v && v.d48 >= SHOW.d48, o = !!v && (v.own == null || v.own >= SHOW.own), shows = d && o;
    gaps.forEach(g => { const k = gapOf(g) + ' ' + id + (g.hold === 'all' ? ' (held: ' + (shows ? 'shows)' : 'does not show)') : ' (own colour held: ' + (o ? 'in it' : 'not in it') + '; its pixels changed judged)');
      if (!GAPS_SEEN.has(k)) GAPS_SEEN.set(k, g.what + ' (' + tag + ': ' + JSON.stringify(v) + ')'); });
    if (all) continue;
    ok(d && (own || o), 'strip: ' + tag + ': ' + id + ' shows on the rider (' + (v ? v.d48 + ' device px changed' + (v.own != null ? ', ' + v.own + ' in its own colour' + (own ? ' (held: ' + gaps.filter(g => g.hold === 'own').map(gapOf).join(', ') + ')' : '') : '') : 'not measured') + ')', { v, L });
    FIXED_BY_V7.forEach((f, n) => { if (!f.ids.includes(id) || !f.when(L, S.r)) return; const k = n + ':' + id, w = FIXED_SEEN.get(k);
      if (!w || v.d48 < w.v.d48) FIXED_SEEN.set(k, { f, id, v, tag, shows: d && (own || o), n: (w ? w.n : 0) + 1 }); else w.n++; }); }
}
section('strip', async () => {
  const [SKINS, KITS] = await (async () => { const x = await openH({ noErrs: true }), v = await x.p.evaluate(() => [Object.keys(FW.SKIN), FW.RIDER_OPTIONS.kit.map(k => [k, FW.RIDER_NAMES.kit[k]])]); await x.close(); return v; })();
  for (const [n, wx, eff] of RIDES) for (const rider of [null, RIDER99]) { // every ride, both closets, the default rider and the built one
    const x = await openH({ wx, settings: rider ? { rider } : {}, dpr: 2 }), p = x.p, who = rider ? 'RIDER99' : 'the default rider';
    if (eff) { await p.click('#intensity [data-int=' + eff + ']'); await settle(p, 150); ok(await p.evaluate(e => window.__q99.readInputs().intensity === e, eff), 'strip: ' + n + ' ride: the effort is ' + eff, eff); }
    await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300);
    for (const kind of ['starter', 'full']) {
      if (kind === 'full') await setCloset(p, 'full');
      const S = await stripOf(p), tag = n + ' ride (' + Math.round(S.minF) + '-' + Math.round(S.maxF) + ' F' + (S.rain ? ', rain ' + S.rain + '%' : '') + '), ' + kind + ' closet, ' + who;
      console.log('  info: ' + tag + ': ' + (S.ids || []).join(' '));
      ok(!!S.ids && JSON.stringify(S.ids) === JSON.stringify(S.list) && S.list.every(id => S.ticks.includes(id)) && S.ticks.every(id => S.list.includes(id)), '99.4: ' + tag + ': the strip gets exactly the items outfit() lists (o.wear: the list\'s rows), in its order', S);
      ok(S.svg && S.same, '99.4: ' + tag + ': the strip is FW.riderOutfit(the rider, those ids) (ids aside)', { same: S.same });
      ok(S.w === 100 && S.h === 150 && S.inCard && S.above && S.hid === 'true' && S.text === '', 'strip: ' + tag + ': 100 x 150 px, in the card above the list, aria-hidden, no text (items 73, 75, 76)', S);
      ok(S.still && !!S.rec && S.rec.s === true, 'strip: ' + tag + ': still (fwMount o.still: no .fwm-go, nothing running)', S.rec);
      painted(await paintOf(p, '#rRider svg', 'strip'), 'strip: ' + tag + ': the rider shows, whole');
      judge(tag, S, await pxOf(p, S.r, S.ids || [], Object.assign({}, OWN, { 'jersey-heavy': 'kit' })));
      // the same list on every other skin (the default rider in that skin): a dark item on dark skin is judged wherever the list has it
      if (!rider) for (const sk of SKINS) { if (sk === S.r.skin) continue; const r = Object.assign({}, S.r, { skin: sk });
        judge(tag.replace('the default rider', 'the default rider in ' + sk + ' skin'), { ids: S.ids, r }, await pxOf(p, r, S.ids || [], Object.assign({}, OWN, { 'jersey-heavy': 'kit' }))); }
      // and in every jersey colour, both riders (review round 4: only Bluebird blue and Coral were judged, and the jersey is what the jackets,
      // the vest and the thermal jersey are drawn over and in)
      for (const [kit, kn] of KITS) { if (kit === S.r.kit) continue; const r = Object.assign({}, S.r, { kit });
        judge(tag + ' in a ' + kn + ' jersey', { ids: S.ids, r }, await pxOf(p, r, S.ids || [], Object.assign({}, OWN, { 'jersey-heavy': 'kit' }))); }
    }
    if (n === 'hot' && !rider) {
      // the strip is kept by its key: the results drawn again (the same ride, rider and items) leave its drawing as it is
      await p.evaluate(() => { const e = document.getElementById('rRider'); e.querySelector('svg').__q99 = 1; window.__q99st = 0; new MutationObserver(r => { window.__q99st += r.length; }).observe(e, { subtree: true, childList: true }); });
      await p.evaluate(() => { for (let k = 0; k < 3; k++) window.__q99.refreshResults(); }); await settle(p, 300);
      const K = await p.evaluate(() => { const s = document.querySelector('#rRider svg'); return { same: !!s && s.__q99 === 1, muts: window.__q99st }; });
      ok(K.same && K.muts === 0, 'strip: kept by its key: the results drawn again three times (the same rider and items) draw nothing again (the same svg, no child changed)', K);
    }
    if (n === 'cold' && !rider) {
      // a closet item of your own the ride lists, and tampered closet ids (an id '__proto__', 'constructor', a number): never on the strip, never break it
      const own = [{ id: 'k9own1', label: 'My winter vest', group: 'Custom', kind: 'cold', at: { recovery: 70, z2: 70, hard: 70 } }, { id: '__proto__', label: 'Odd', group: 'Custom', kind: 'cold', at: { recovery: 70, z2: 70, hard: 70 } },
        { id: 'constructor', label: 'Odd 2', group: 'Custom', kind: 'cold', at: { recovery: 70, z2: 70, hard: 70 } }, { id: 7, label: 'Odd 3', group: 'Custom', kind: 'cold', at: { recovery: 70, z2: 70, hard: 70 } }];
      await setCloset(p, 'starter', own); const S = await stripOf(p);
      const want = S.list.filter(id => typeof id === 'string' && !['k9own1', '__proto__', 'constructor'].includes(id));
      ok(S.list.includes('k9own1') && S.list.includes('__proto__') && JSON.stringify(S.ids) === JSON.stringify(want) && S.svg && S.same, '99.4: a closet item of your own (a uid id) and tampered ids (\'__proto__\', \'constructor\', a number) that the list names never reach the strip, and it still draws', { ids: S.ids, list: S.list });
    }
    await x.close();
  }
  // a rider changed while the results are up redraws the strip shown (riderApply): in the sheet, by a restore, and arriving by sync
  const stripNow = async (p, kit, how) => { await p.click('nav.tabs button[data-view=plan]:visible, #sbNav [data-view=plan]:visible').catch(() => {}); await settle(p, 300); await toY(p, '#rWearCard'); await settle(p, 200); const S = await stripOf(p);
    ok(S.svg && S.same && S.r.kit === kit && J(S.ids) === J(S.list), 'strip: a rider changed ' + how + ' while the results are up: the strip shown is redrawn in the new rider (' + kit + '), the list\'s items', { kit: S.r.kit, same: S.same }); };
  { const x = await openH({ wx: { lo: 40, hi: 44 }, settings: { rider: RIDER99 } }), p = x.p; await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300);
    await sheet(p); await group(p, 'kit'); await tap(p, 'kit', '#BECC41'); await done(p); await stripNow(p, '#BECC41', 'in the sheet');
    const bk = await p.evaluate(() => { const d = JSON.parse(JSON.stringify(window.__q99.backupData())); d.settings.rider = Object.assign({}, d.settings.rider, { kit: '#F28C28' }); return d; });
    await restore(p, bk); await stripNow(p, '#F28C28', 'by a restore');
    await x.close(); }
  // by sync, with the sheet open (review round 4: only the strip and the header were looked at after a sync): the sheet follows too, each
  // field's pressed choice and name, the three summaries and its live rider (drawn and painted), and the row names the new jersey
  { const be = new Backend(), A = await synced(be, { label: 'ap', dpr: 2, wx: { lo: 40, hi: 44 }, settings: { rider: RIDER99 } }), p = A.p; await ready(be, A); await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300);
    await sheet(p); await allOpen(p);
    const NR = Object.assign({}, RIDER99, { kit: '#2ABCBB', skin: 'tan', face: 'stache', glasses: 'shield', pattern: 'band', shorts: '#3048B4' });
    const now = Date.now() + 5000, d = JSON.parse(JSON.stringify(doc(be))); d.settings.rider = NR; d.settings.updatedAt = now; d.settingsAt = Object.assign({}, d.settingsAt, { rider: now, _u: now }); be.fs.set('users/u1', d);
    await nudge([p], () => p.evaluate(() => window.__q99.settings.rider && window.__q99.settings.rider.kit === '#2ABCBB')); await settle(p, 200);
    const S = await sheetOf(p), N = await namesOf(p, NR), U = await sumsOf(p, NR), row = await p.evaluate(() => document.getElementById('prowV-rider').textContent);
    ok(J(S.r) === J(NR) && FIELDS.every(k => S.pressed[k].length === 1 && S.pressed[k][0] === NR[k] && S.names[k] === N[k]) && S.sums.join('|') === U.join('|') && S.figSame && row === 'Teal jersey', 'strip: a rider arriving by sync with the sheet open: the sheet follows (each field\'s pressed choice and name, the summaries "' + S.sums.join(' / ') + '", its live rider) and the row names the new jersey ("' + row + '")', { pressed: S.pressed, names: S.names, sums: S.sums, figSame: S.figSame, row });
    painted(await paintOf(p, '#rdFig svg', 'fig'), 'strip: by sync with the sheet open: the sheet\'s live rider shows');
    await done(p); await stripNow(p, '#2ABCBB', 'by sync');
    await A.close(); }
  // a ride that warms (items shed on the way): the strip lists every item the list does, the shed ones too
  { const x = await openH({ wx: { lo: 40, hi: 80 } }), p = x.p; await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300); const S = await stripOf(p);
    ok(S.shed.length > 0 && JSON.stringify(S.ids) === JSON.stringify(S.list) && S.shed.every(id => S.ids.includes(id)), '99.4: a ride that warms (' + Math.round(S.minF) + ' to ' + Math.round(S.maxF) + ' F): the strip wears every item the list names, the ones shed on the way too (' + S.shed.join(', ') + ')', S);
    await x.close(); }
  // the Clothing-only results (Plan for Clothing, no gel or drink mix in the library: the Crunch falls back to renderClothingOnly): the strip
  // there as in the full plan, and following a closet change (refreshResults' wear-only branch) (review round 3: never opened before)
  { const x = await openH({ athlete: null, dpr: 2, wx: { lo: 40, hi: 44 }, settings: { planMode: 'clothing', rider: RIDER99 }, storage: { 'bluebird.library.v5': { gels: [], powders: [] } } }), p = x.p;
    await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300); let first = null;
    for (const kind of ['starter', 'full']) { if (kind === 'full') await setCloset(p, 'full');
      const S = await stripOf(p), w = await p.evaluate(() => document.getElementById('results').dataset.wearOnly || null), tag = 'the Clothing-only results (#results data-wear-only ' + w + '), ' + kind + ' closet, RIDER99';
      console.log('  info: ' + tag + ': ' + (S.ids || []).join(' '));
      ok(w === '1' && S.list.length > 0 && !!S.ids && J(S.ids) === J(S.list) && S.list.every(id => S.ticks.includes(id)) && S.ticks.every(id => S.list.includes(id)) && S.svg && S.same, '99.4: ' + tag + ': the strip gets exactly the items outfit() lists (the list\'s rows) and is FW.riderOutfit of them', S);
      ok(S.w === 100 && S.h === 150 && S.inCard && S.above && S.hid === 'true' && S.text === '' && S.still && !!S.rec && S.rec.s === true, 'strip: ' + tag + ': 100 x 150 px, in the card above the list, aria-hidden, no text, still', S);
      painted(await paintOf(p, '#rRider svg', 'strip'), 'strip: ' + tag + ': the rider shows, whole');
      if (kind === 'starter') first = S.list; else ok(!!S.ids && J(S.list) !== J(first), 'strip: the Clothing-only results follow a closet change (the full closet lists other items, and the strip wears them)', { first, now: S.ids }); }
    await x.close(); }
  // the computer layout: the strip in the results column
  { const x = await openH({ wx: { lo: 53, hi: 57, rain: 80 }, width: 1440, height: 900, dpr: 2, settings: { rider: RIDER99 } }), p = x.p; await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300); const S = await stripOf(p), dk = await p.evaluate(() => document.documentElement.classList.contains('dk'));
    ok(dk && S.svg && S.same && S.w === 100 && S.inCard && JSON.stringify(S.ids) === JSON.stringify(S.list), 'strip: the computer layout (1440 x 900): the strip in the Closet card of the results column, the list\'s items', S);
    painted(await paintOf(p, '#rRider svg', 'strip'), 'strip: the computer layout (1440 x 900): the rider shows, whole'); /* review round 4: only the 390 px path was looked at as painted */
    await x.close(); }
  // the v6 gaps v7 fixed that no ride reaches, judged on lists that name them (the default rider and RIDER99): the rain jacket over a
  // windbreaker, a thermal or a winter jacket, and over the vest with a thermal jersey (point 2, 2+3); a windbreaker over a thermal jersey
  // (point 3); the skullcap with glasses none (point 6), which also leaves the eyes alone (v6's band changed 445 px in x 73.5-126.5, y 97-115).
  // And the by-design rule's edge no ride reaches: wool socks with bare shoes (no cover, no toe covers), alone and under tights, must show
  { const x = await openH({ noErrs: true }), p = x.p, D = await p.evaluate(() => FW.RIDER_DEFAULT), own = Object.assign({}, OWN, { 'jersey-heavy': 'kit' });
    for (const [who, base] of [['the default rider', D], ['RIDER99', RIDER99]]) {
      for (const ids of [['windbreaker', 'jacket-rain'], ['jacket-thermal', 'jacket-rain'], ['jacket-winter', 'jacket-rain'], ['jersey-heavy', 'vest', 'jacket-rain'], ['jersey-heavy', 'windbreaker'], ['socks-wool'], ['tights-heavy', 'socks-wool']])
        for (const [kit, kn] of [[base.kit, null], ...KITS.filter(k => k[0] !== base.kit)]) { const r = Object.assign({}, base, { kit }); /* every jersey colour (review round 4) */
          judge('the list ' + ids.join(' ') + ', ' + who + (kn ? ' in a ' + kn + ' jersey' : ''), { ids, r }, await pxOf(p, r, ids, own)); }
      const r = Object.assign({}, base, { glasses: 'none' }), px = await pxOf(p, r, ['skullcap'], own, [73.5, 97, 126.5, 115]);
      judge('the list skullcap, glasses none, ' + who, { ids: ['skullcap'], r }, px);
      ok(px.skullcap.box === 0, 'strip: the skullcap with glasses none leaves the eyes alone (' + who + ': ' + px.skullcap.box + ' device px changed in x 73.5-126.5, y 97-115)', px.skullcap); }
    await x.close(); }
  for (const [k, v] of GAPS_SEEN) console.log('  note: known v7 gap, ' + k + ': ' + v);
  const unmet = V7_GAPS.filter(g => !g.ids.some(id => [...GAPS_SEEN.keys()].some(k => k.startsWith(gapOf(g) + ' ' + id + ' '))));
  ok(!unmet.length, 'strip: each known v7 gap (' + V7_GAPS.length + ' entries) is met on a list the strip gets (none held that nothing reaches)', unmet.map(g => g.point + ' ' + g.what));
  for (const [, w] of FIXED_SEEN) console.log('  note: v6 gap v7 fixed, FROM-APP-CHAT-5 ' + (w.f.point === 'B' ? 'dark-skin note point B' : 'point ' + w.f.point) + ' ' + w.id + ': judged ' + w.n + ' times, ' + (w.shows ? 'shows' : 'does not show') + ', the least ' + JSON.stringify(w.v) + ' (' + w.tag + ')');
  const unseen = FIXED_BY_V7.flatMap((f, n) => f.ids.filter(id => !FIXED_SEEN.has(n + ':' + id)).map(id => f.point + ' ' + id));
  ok(!unseen.length, 'strip: each v6 gap v7 fixed (' + FIXED_BY_V7.length + ' entries, every item of each) is judged on v7, on a ride or a direct list', unseen);
  // the detector itself: an item that draws nothing in every version (bib shorts: the rider's default look) is judged as not showing; the
  // leg warmers and toe covers show, in their own colours
  { const x = await openH({ noErrs: true }), p = x.p, D = await p.evaluate(() => FW.RIDER_DEFAULT), a = await pxOf(p, D, ['legs', 'bibs'], OWN), b = await pxOf(p, D, ['shoes', 'knees', 'toes'], OWN);
    ok(a.bibs.d48 < SHOW.d48 && a.legs.d48 >= SHOW.d48 && a.legs.own >= SHOW.own && b.toes.d48 >= SHOW.d48 && b.toes.own >= SHOW.own, 'strip: self-test: the pixel check sees bib shorts (drawn as nothing in every version) as not showing and the leg warmers and toe covers as showing', { a, b });
    await x.close(); }
});

section('still', async () => {
  // the strip, the sheet's rider and the avatars: with Reduce Motion, the switch off and on (motion on): never .fwm-go, nothing running
  for (const [tag, o] of [['Reduce Motion', { motion: false }], ['Animate the world off', { motion: true, settings: { worldMotion: false } }], ['Animate the world on', { motion: true }]]) {
    const be = new Backend(), x = await synced(be, Object.assign({ label: 's', wx: { lo: 40, hi: 44 } }, o, { settings: Object.assign({ rider: RIDER99 }, o.settings || {}) })), p = x.p;
    await crunch(p); await toY(p, '#rWearCard');
    const spots = () => p.evaluate(() => ['#rRider', '#syncHdr .av-r', '#rdFig'].map(s => { const e = document.querySelector(s); return e && { s, fwm: e.classList.contains('fwm'), go: e.classList.contains('fwm-go'), run: e.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length, svg: !!e.querySelector('svg') }; }));
    const seen = []; for (let k = 0; k < 8; k++) { seen.push(await spots()); await sleep(250); }
    await sheet(p); for (let k = 0; k < 6; k++) { seen.push(await spots()); await sleep(250); } await done(p);
    await p.evaluate(() => { const D = Date.now; Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); Date.now = () => D() + 31 * 60e3; Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    await toY(p, '#rWearCard'); for (let k = 0; k < 6; k++) { seen.push(await spots()); await sleep(250); }
    const flat = seen.flat().filter(Boolean), bad = flat.filter(s => s.go || s.run);
    ok(flat.filter(s => s.svg).length >= 20 && !bad.length, 'still: ' + tag + ': the strip, the avatar and the sheet\'s rider never move (no .fwm-go, nothing running: seen, scrolled to, in the sheet, after a new app open)', { bad: bad.slice(0, 3), n: flat.length });
    await x.close(); }
});

section('media', async () => {
  const x = await openH({ settings: { rider: RIDER99 } }), p = x.p;
  await crunch(p); await toY(p, '#rWearCard');
  const st = () => p.evaluate(() => { const e = document.getElementById('rRider'); return { disp: getComputedStyle(e).display, svg: !!e.querySelector('svg') && getComputedStyle(e.querySelector('svg')).display !== 'none' && e.getClientRects().length > 0, list: document.getElementById('rWear').getClientRects().length > 0 }; });
  const S0 = await st(); await p.emulateMedia({ media: 'print' }); const S1 = await st(); await p.emulateMedia({ media: 'screen', forcedColors: 'active' }); const S2 = await st(); await p.emulateMedia({ forcedColors: 'none' });
  ok(S0.svg && S1.disp === 'none' && S1.list && S2.disp === 'none' && S2.list, 'media: print and forced colours: no strip (no art; no empty band), the list stays', { S0, S1, S2 });
  await sheet(p); await allOpen(p);
  const fig = () => p.evaluate(() => { const s = document.querySelector('#rdFig svg'); return !!s && s.getClientRects().length > 0 && getComputedStyle(s).display !== 'none' && getComputedStyle(document.getElementById('rdFig')).display !== 'none'; });
  const G0 = await fig(); await p.emulateMedia({ forcedColors: 'active' }); await settle(p, 100); const G1 = await fig(); await p.emulateMedia({ forcedColors: 'none', media: 'print' }); await settle(p, 100); const G2 = await fig(); await p.emulateMedia({ media: 'screen' }); await settle(p, 100);
  ok(G0 && !G1 && !G2, 'media: the sheet\'s live rider shows on screen, not in forced colours or print (art: the round\'s rule)', { screen: G0, forced: G1, print: G2 });
  for (const cs of ['dark', 'light']) { await p.emulateMedia({ forcedColors: 'active', colorScheme: cs }); await settle(p, 100);
  const F = await p.evaluate(() => { const sys = c => { const e = document.createElement('i'); e.style.cssText = 'forced-color-adjust:none;color:' + c; document.body.append(e); const v = getComputedStyle(e).color; e.remove(); return v; }, CT = sys('CanvasText'), HL = sys('Highlight'), sw = [...document.querySelectorAll('#rdGroups .rd-c')].filter(b => b.getClientRects().length), t = [...document.querySelectorAll('#rdGroups .rd-t[aria-pressed="true"]')];
    return { n: sw.length, kept: sw.filter(b => { const h = b.style.getPropertyValue('--sw').trim(), m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h); return !!m && getComputedStyle(b).backgroundColor === 'rgb(' + [m[1], m[2], m[3]].map(x => parseInt(x, 16)).join(', ') + ')'; }).length,
      edge: sw.filter(b => parseFloat(getComputedStyle(b).borderTopWidth) >= 1 && getComputedStyle(b).borderTopStyle !== 'none' && getComputedStyle(b).borderTopColor === CT).length, CT, HL, ringHL: sw.filter(b => b.getAttribute('aria-pressed') === 'true').every(b => getComputedStyle(b).boxShadow.includes(HL)), ring: sw.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => getComputedStyle(b).boxShadow), word: t.map(b => [getComputedStyle(b).backgroundColor, getComputedStyle(b).color]),
      wordOff: [...document.querySelectorAll('#rdGroups .rd-t[aria-pressed="false"]')].slice(0, 1).map(b => [getComputedStyle(b).backgroundColor]), same: [...document.querySelectorAll('#rdGroups .rd-c.rd-same, #rdGroups .rd-c[data-v=""]')].map(b => getComputedStyle(b).backgroundImage), names: ['kit', 'skin', 'shorts'].map(k => document.getElementById('rdN-' + k).textContent) }; });
  await p.emulateMedia({ forcedColors: 'none', colorScheme: 'light' });
  ok(F.n >= 40 && F.kept === F.n && F.edge === F.n && F.ringHL && F.CT !== F.HL && F.ring.length >= 8 && F.ring.every(s => s && s !== 'none') && F.word.length >= 4 && F.word.every(w => w[0] !== F.wordOff[0][0]) && F.names.every(Boolean) && F.same.length === 2 && F.same.every(b => /gradient/.test(b)), 'media: forced colours (' + cs + '): every swatch keeps its colour with a CanvasText edge (' + F.CT + '), "Same as jersey" its ring, the pressed ones ringed in Highlight (' + F.HL + '), the pressed word buttons marked, the chosen names shown', F); }
  await x.close();
});

section('fit', async () => {
  for (const [w, sc] of [[320, 1], [320, 2], [390, 2], [390, 1.5]]) {
    const x = await openH({ width: w, scale: sc, dpr: 2, settings: { rider: RIDER99 } }), p = x.p; await sheet(p); await allOpen(p); await settle(p, 200);
    const F = await p.evaluate(() => { const sh = document.querySelector('#setSheet .set-sheet'), b = sh.getBoundingClientRect(), bad = [...document.querySelectorAll('#prowB-rider *')].filter(e => e.getClientRects().length).map(e => [e, e.getBoundingClientRect()]).filter(([e, r]) => r.right > b.right + 0.5 || r.left < b.left - 0.5).map(([e]) => e.className || e.tagName);
      const small = [...document.querySelectorAll('#prowB-rider button')].filter(e => e.getClientRects().length).map(e => e.getBoundingClientRect()).filter(r => r.width < 44 || r.height < 44).length;
      const sum = ['look', 'gear', 'kit'].map(g => { const s = document.getElementById('rdS-' + g), c = getComputedStyle(s); return c.textOverflow === 'ellipsis' || s.scrollWidth > s.clientWidth + 1 || s.scrollHeight > s.clientHeight + 1 ? 'cut' : 'whole'; });
      return { sx: document.documentElement.scrollWidth > innerWidth, shx: sh.scrollWidth > sh.clientWidth + 1, bad: bad.slice(0, 5), small, sum }; });
    ok(!F.sx && !F.shx && !F.bad.length && !F.small && F.sum.every(n => n === 'whole'), 'fit: ' + w + ' px, ' + (sc * 100) + '% text: the sheet (every group open, More colours) fits: no sideways scroll, nothing past the sheet, every button 44 px or more, no summary cut', F);
    painted(await paintOf(p, '#rdFig svg', 'fig'), 'fit: ' + w + ' px, ' + (sc * 100) + '% text: the sheet\'s live rider shows');
    if (w === 320 && sc === 2) await figView(p, '320 px, 200% text');
    await done(p); await p.click('nav.tabs button[data-view=plan]'); await settle(p, 200); await crunch(p); await toY(p, '#rWearCard');
    const S = await stripOf(p); ok(S.svg && S.inCard && S.w === 100 && !(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'fit: ' + w + ' px, ' + (sc * 100) + '% text: the strip inside its card, no sideways scroll', S);
    painted(await paintOf(p, '#rRider svg', 'strip'), 'fit: ' + w + ' px, ' + (sc * 100) + '% text: the strip\'s rider shows, whole');
    await x.close(); }
  // the computer layout: the sheet is the pane beside the settings list
  const x = await openH({ width: 1280, height: 800, dpr: 2, settings: { rider: RIDER99 } }), p = x.p; await sheet(p); await allOpen(p);
  const D = await p.evaluate(() => { const l = document.getElementById('setList').getBoundingClientRect(), s = document.querySelector('#setSheet .set-sheet').getBoundingClientRect(); return { dk: document.documentElement.classList.contains('dk'), side: s.left >= l.right - 1, list: !document.getElementById('setList').inert }; });
  ok(D.dk && D.side && D.list, 'fit: the computer layout: the sheet is the pane beside the settings list (the list stays usable)', D);
  painted(await paintOf(p, '#rdFig svg', 'fig'), 'fit: the computer layout: the sheet\'s live rider shows');
  await figView(p, 'the computer layout (1280 x 800)');
  await x.close();
});

section('main', async () => {
  if (!MAIN) { console.log('  note: no main page given: the main checks are skipped'); return; }
  const x = await open(MAIN, { athlete: 'A', browser, motion: true, now: NOW, route: weatherRouteFor({ lo: 40, hi: 44 }) }), p = x.p;
  const m = await p.evaluate(() => ({ row: !!document.getElementById('prowBtn-rider'), strip: !!document.getElementById('rRider') }));
  ok(!m.row && !m.strip, 'main: no Your rider row and no strip on main (the row and strip checks fail there)', m);
  await x.close();
});

for (const [n, f] of sections) {
  if (ONLY.length && !ONLY.includes(n)) continue;
  console.log('-- ' + n);
  try { await f(); } catch (e) { ok(false, n + ': threw', String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); }
}
const errs = ERRS.flat().filter(e => !/net::ERR|Failed to load resource/.test(e));
ok(!errs.length, 'no page errors or console errors', errs.slice(0, 8));
await browser.close();
for (const f of MADE) fs.rmSync(f, { force: true });
C.done('item 99: Your rider, and the rider on the Closet card');
