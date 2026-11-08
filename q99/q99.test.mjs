// node q99.test.mjs <null.html> [main null.html]   (cd into this folder first) -- item 99: Your rider, and the rider on the Closet card.
// Every numbered point, QA line and decision (DECISIONS.md "Item 99"):
//   cache    sw.js CACHE and APP_BUILD match, v123 or later; the bundle is the design chat's v6 (FW.built 2026-11-07 22:08) or later
//   row      99.1: Settings › You has the row Your rider (a sheet row, searchable; with Settings on Running, a search for it names
//            the row under Cycling, one tap away, never a blank page), "Not set" until a rider is built, then the jersey; it opens
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
//            the folds are remembered on this device (closed, reopened, reloaded)
//   build    99.2: settings.rider absent until built (opening and closing the sheet stores nothing; no DEFAULT_SETTINGS entry: absent at
//            boot, in the stored copy and in a fresh page's settings); a tap stores the whole rider (every bundle field, checked);
//            a rider built, closed (Done) and reopened is the same (every pressed swatch, summary and the live rider), and after a reload;
//            the row then names the jersey; tapping the choice already pressed builds the rider (the default rider stored)
//   norm     99.2: riderNorm with tampered values for every field (a number, null, an object, an unknown string, '__proto__',
//            'constructor', 'toString', a near-miss colour) and a rider that is not an object: on load (stored on the device), on
//            restore (a backup) and when synced settings arrive (the cloud, the q91 Firebase stand-in): each tampered field is its
//            default, the others are kept, keys the bundle has no field for are gone; the sheet and the avatar draw that rider; no errors
//   backup   99.5: a backup made here carries the rider (backupData, the app's own export) and brings it to a fresh page; a backup
//            from before item 99 (no settings.rider) restores without losing this device's rider (as birthday and gender);
//            a backup with a rider brings it; a tampered one draws the default
//   sync     99.2, QA: two devices (the q91 Firebase stand-in): A builds a rider, B (not pulled yet) saves an unrelated setting, both
//            sync: A's rider on both and in the cloud, B's setting on both; the rider is one key (users/u1.settings.rider whole, one
//            settingsAt stamp, no dotted part of it written)
//   private  99.5: the troubleshooting copy leaves the rider out (no rider key, none of its values, no strip); no AI prompt has it (every
//            prompt kind, and a static scan: the prompt builder reads no settings.rider); the privacy note's "What's stored" names
//            "your rider's look"
//   avatar   99.3: signed out: the outline (header) and the empty circle (#sbAv), built or not; signed in, not built: the initial; signed
//            in and built: the rider (FW.riderAvatar of the rider, ids aside) in the header circle at 32 px and in #sbAv at 30 px on the
//            computer layout, the initial kept under it (print and forced colours show it, no art); the same on the run (graphite);
//            the header's sync badge still follows the sync state with the rider in the circle (offline: data-st and the badge; back: synced)
//   strip    99.4: hot, mild, cold, freezing and wet rides (each its own forecast), the starter closet and every catalog item: the
//            strip (#rRider, above the list, 100 x 150 px, aria-hidden, no text) gets exactly outfit()'s list (o.wear) with only string
//            ids FW.OUTFIT_LOOK has as its own, in its order; its drawing is FW.riderOutfit(rider, those ids) (ids aside); each item it
//            lists shows on it (leave-one-out at strip size, and its own colour where it has one: knee grey and the like), the under-
//            layers drawn by design as nothing aside and the known v6 gaps (V6_GAPS, each tied to its FROM-APP-CHAT-5 point) printed as
//            notes (a point that leaves part of an item still asks that part to show: the jacket's body, the rain jacket's sleeves under
//            the vest); a built rider is judged too, its misses held in one more named list (SKIN_GAPS: dark gloves and leg wear on deep
//            brown skin, for the design chat); a rider changed while the results are up (in the sheet, by sync, by a restore) redraws
//            the strip shown; a ride that warms (items shed on the way) lists them all; a closet item of your own and a tampered '__proto__' /
//            'constructor' closet id never reach the strip and never break it
//   still    the strip, the sheet's rider and both avatars never move: no .fwm-go, nothing running, with Reduce Motion, with the switch
//            off and on, seen, scrolled to and after a new app open
//   media    print: no strip, the avatars' initial, no sheet rider; forced colours: no strip, the initial, no sheet rider, every swatch
//            keeps its colour with an edge, "Same as jersey" its ring, the pressed one ringed, the word buttons' pressed one marked
//   fit      320 px and 200% text: the sheet (every group open, More colours) has no sideways scroll, every button 44 px or more, nothing
//            past the sheet; the strip inside its card; the computer layout: the sheet is the pane beside the list, the strip in the
//            results column
//   main     (with [main null.html]) main has no Your rider row and no strip (the row check fails there)
// Q99_ONLY=section,section runs some sections.
import fs from 'node:fs';
import path from 'node:path';
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
const HOOK = "\nObject.defineProperty(window,'__q99',{configurable:true,get(){ return {FWM, AOPEN, riderNorm, riderNow, riderIds, outfit, readInputs, dbgDump, aiFill, AI_CARD, backupData, closetItemFromCatalog, CLOSET_CATALOG, CLOSET_STARTER, refreshResults, save, KEYS, DEFAULT_SETTINGS, get lastResult(){ return lastResult; }, get settings(){ return settings; }, set settings(v){ settings=v; }}; }});\n";
function hooked(page, name = 'q99-hook.html') { const src = fs.readFileSync(page, 'utf8'), k = src.indexOf("\n'use strict';\n"); if (k < 0) throw new Error("no 'use strict' line in " + page);
  const f = path.join(path.dirname(page), name), at = k + "\n'use strict';".length; fs.writeFileSync(f, src.slice(0, at) + HOOK + src.slice(at)); return f; }
const HOOKED = hooked(PAGE), MADE = [HOOKED];
const syncOf = f => { const g = f.replace(/\.html$/, '-sync.html'); fs.writeFileSync(g, syncPageSource(fs.readFileSync(f, 'utf8'))); MADE.push(g); return g; };
const SYNCED = syncOf(HOOKED);

const NOW = '2026-10-29T15:00:00-07:00';
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
const sumsOf = (p, r) => p.evaluate(r => { const n = k => { const o = FW.RIDER_OPTIONS[k]; return Array.isArray(o) ? FW.RIDER_NAMES[k][r[k]] : o[r[k]]; }, lc = s => s.charAt(0).toLowerCase() + s.slice(1);
  const hs = r.hairStyle, hc = lc(n('hair')), hair = hs === 'covered' ? hc + ' head covering' : hs === 'pony' || hs === 'braids' ? hc + ' ' + lc(n('hairStyle')) : lc(n('hairStyle')) + ' ' + hc + ' hair';
  return [`${n('skin')} skin · ${hair}${r.face !== 'none' ? ' · ' + lc(n('face')) : ''}`, `${n('helmet')} helmet · ${r.glasses === 'none' ? 'no glasses' : lc(n('glasses')) + ' · ' + lc(n('lens')) + ' lens'}`, `${n('kit')} jersey · ${lc(n('pattern'))} · ${lc(n('shorts'))} shorts`]; }, r);

const sections = [];
const section = (n, f) => sections.push([n, f]);

section('cache', async () => {
  const swf = fs.readFileSync(path.join(path.dirname(PAGE), 'sw.js'), 'utf8');
  const b = (SRC.match(/const APP_BUILD='([^']+)'/) || [])[1], c = (swf.match(/const CACHE = '([^']+)'/) || [])[1];
  ok(!!b && b === c && +(b.match(/v(\d+)$/) || [])[1] >= 123, 'cache: APP_BUILD = sw.js CACHE, v123 or later', { b, c });
  const built = (/window\.FW = \{[^\n]*built: '([^']+)'/.exec(SRC) || [])[1], ver = (/window\.FW = \{ version: '(\d+)'/.exec(SRC) || [])[1];
  ok(!!built && built >= '2026-11-07 22:08 EST' && +ver >= 6, 'cache: the bundle is the design chat\'s v6 (22:08) or later (FW.version ' + ver + ', built ' + built + ')', { ver, built });
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
    await q.click('#setNoMatch button[data-set-sport]'); await settle(q, 200); const R2 = await sideOf();
    ok(R2.side === 'ride' && !R2.shown && R2.rows.join() === 'rider' && R2.focus === 'prowBtn-rider', 'row: Settings on Running' + where + ': that button turns Settings to Cycling with the row found and focused', R2);
    await q.fill('#setSearch', 'zzqx'); await settle(q, 150); const R3 = await sideOf();
    ok(R3.shown && R3.text === 'No Cycling settings match “zzqx”.' && R3.btn === null, 'row: a search with no match on either side: the plain line, no button' + where, R3);
    await y.close(); }
});

section('sheet', async () => {
  const x = await openH({ settings: { rider: RIDER99 } }), p = x.p;
  await sheet(p);
  const F0 = await p.evaluate(() => ['look', 'gear', 'kit'].map(g => { const s = document.querySelector(`#rdGroups [data-fold="rider-${g}"]`), h = s && s.querySelector('.v-fold-h'), b = s && s.querySelector('.v-fold-b');
    return s && { cls: s.classList.contains('v-fold'), exp: h.getAttribute('aria-expanded'), ctl: h.getAttribute('aria-controls') === b.id, hid: b.hidden, t: s.querySelector('.v-fold-t').textContent }; }));
  ok(F0.every(Boolean) && F0.map(f => f.t).join() === 'Look,Gear,Kit' && F0.every(f => f.cls && f.exp === 'false' && f.hid && f.ctl), '99.1: Look / Gear / Kit, each a fold (closed the first time, aria-expanded false, aria-controls its body)', F0);
  const S = await sheetOf(p), want = await sumsOf(p, RIDER99);
  ok(S.sums.join('|') === want.join('|'), '99.1: folded, each group shows its one-line summary naming the choices (' + S.sums.join(' / ') + ')', { S: S.sums, want });
  ok(S.sums[2] === 'Coral jersey · dots · navy shorts', '99.1: the Kit summary reads as the spec\'s ("Coral jersey · dots · navy shorts" for this rider)', S.sums[2]);
  ok(S.fig && S.figSame, '99.1: the live rider on top is FW.riderOutfit of the rider shown (ids aside)', S);
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
  const swOf = () => p.evaluate(() => { const rgb = h => 'rgb(' + [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ') + ')', r = window.__q99.riderNow(), out = {};
    document.querySelectorAll('#rdGroups .rd-sw').forEach(g => { const bs = [...g.querySelectorAll('.rd-c')]; if (!bs.length) return; const k = bs[0].dataset.rd;
      out[k] = bs.map(b => { const v = b.dataset.v, c = getComputedStyle(b), want = k === 'skin' ? FW.SKIN[v][0] : v || r.kit; return { v, bg: c.backgroundColor, want: rgb(want), mark: c.backgroundImage !== 'none' }; }); });
    return { kit: r.kit, out }; });
  const swBad = W => Object.entries(W.out).flatMap(([k, L]) => { const look = L.map(b => b.bg + (b.mark ? '+ring' : '')), bad = [];
    L.forEach(b => { if (b.bg !== b.want) bad.push(k + ' ' + JSON.stringify(b.v) + ' painted ' + b.bg + ' not ' + b.want); if (b.mark !== (b.v === '')) bad.push(k + ' ' + JSON.stringify(b.v) + (b.mark ? ' marked' : ' has no mark of its own')); });
    if (new Set(look).size !== L.length) bad.push(k + ': two swatches look alike (' + look.filter((x, i) => look.indexOf(x) !== i).join(', ') + ')'); return bad; });
  const W0 = await swOf(), swN = Object.keys(W0.out).length;
  ok(swN === 9 && !swBad(W0).length, 'sheet: every swatch is painted its own option\'s colour (skin FW.SKIN, the rest their value, "Same as jersey" the jersey\'s) and no two in a field look alike (' + swN + ' fields)', { bad: swBad(W0), fields: Object.keys(W0.out) });
  const kitBad = [];
  for (const v of kitL0) { await tap(p, 'kit', v); await settle(p, 60); const W = await swOf(); swBad(W).forEach(b => kitBad.push(v + ': ' + b)); }
  await tap(p, 'kit', RIDER99.kit); await settle(p, 60);
  kitBad.sort((a, b) => /alike/.test(b) - /alike/.test(a)); /* the look-alikes first */
  ok(!kitBad.length, 'sheet: for each of the ' + kitL0.length + ' jerseys, "Same as jersey" (the fade, the sleeves) is the jersey\'s colour with a ring of its own, never one more disc like the field\'s own colour (a Black jersey\'s Black)', kitBad.slice(0, 6));
  // the pressed choice is marked in normal colours: a ring on a swatch, a fill on a word button (not only in forced colours)
  const PV = await p.evaluate(() => { const cs = b => { const c = getComputedStyle(b); return { sh: c.boxShadow, bg: c.backgroundColor, co: c.color }; }, out = [];
    document.querySelectorAll('#rdGroups .rd-sw').forEach(g => { if (!g.getClientRects().length) return; const on = g.querySelector('[aria-pressed="true"]'), off = g.querySelector('[aria-pressed="false"]'); if (!on || !off) return;
      out.push({ k: on.dataset.rd, sw: on.classList.contains('rd-c'), on: cs(on), off: cs(off) }); }); return out; });
  const pvBad = PV.filter(x => x.sw ? !(x.on.sh !== 'none' && x.on.sh !== x.off.sh) : !(x.on.bg !== x.off.bg && x.on.co !== x.off.co));
  ok(PV.filter(x => x.sw).length >= 8 && PV.filter(x => !x.sw).length >= 4 && !pvBad.length, 'sheet: the pressed choice is marked in normal colours: a ring on the pressed swatch, a fill and colour on the pressed word button (' + PV.length + ' groups)', { pvBad, sample: PV.slice(0, 2) });
  // the Look summary per hair style (the bundle draws 'covered' as a head covering in the colour: its field is then "Covering colour")
  const HS = [];
  for (const v of ['pony', 'braids', 'covered', 'short']) { await tap(p, 'hairStyle', v); await settle(p, 60); HS.push(await p.evaluate(() => [document.getElementById('rdS-look').textContent, document.getElementById('rdL-hair').textContent, document.getElementById('rdL-hair').closest('.rd-f').querySelector('[role=group]').getAttribute('aria-labelledby')])); }
  await tap(p, 'hairStyle', RIDER99.hairStyle); await settle(p, 60);
  ok(HS.map(h => h[0]).join('|') === 'Deep brown skin · black ponytail · beard|Deep brown skin · black braids · beard|Deep brown skin · black head covering · beard|Deep brown skin · short black hair · beard' && HS.map(h => h[1]).join() === 'Hair colour,Hair colour,Covering colour,Hair colour' && HS.every(h => h[2] === 'rdL-hair'),
    'sheet: the Look summary reads per hair style ("black ponytail", "black braids", "black head covering", "short black hair"); with Covered the colour field is "Covering colour" (its group named so)', HS);
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
  ok(JSON.stringify(st1) === JSON.stringify(Object.assign({}, await p.evaluate(() => FW.RIDER_DEFAULT), B)), 'build: every tap is stored (settings.rider is the rider built)', st1);
  ok(S1.sums.join('|') === want.join('|'), 'QA: the summaries name the choices (' + S1.sums.join(' / ') + ')', { S: S1.sums, want });
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
section('norm', async () => {
  const W = await (async () => { const x = await openH({ noErrs: true }); const w = await wantNorm(x.p); await x.close(); return w; })();
  // on load: stored on the device
  { const x = await openH({ settings: { rider: BAD_R } }), p = x.p, mem = await p.evaluate(() => window.__q99.settings.rider);
    ok(JSON.stringify(mem) === JSON.stringify(W), '99.2: riderNorm on load: a stored rider with every field tampered (a number, null, an object, an array, true, a near-miss colour, \'__proto__\', \'constructor\', \'toString\', \'hasOwnProperty\', \'valueOf\') is each field\'s default, the real choice kept (helmet), the extra keys gone', mem);
    await sheet(p); const S = await sheetOf(p);
    ok(FIELDS.every(k => S.pressed[k].length === 1 && S.pressed[k][0] === W[k]) && S.figSame, 'norm: on load: the sheet and the live rider draw that rider', S.pressed);
    await done(p); await sleep(300);
    const st = (await stored(p)).rider; ok(JSON.stringify(st) === JSON.stringify(W), 'norm: on load: the stored copy is the checked rider', st);
    await x.close(); }
  for (const v of BAD_NOT) { const x = await openH({ settings: { rider: v } }), mem = await x.p.evaluate(() => window.__q99.settings.rider), D = await x.p.evaluate(() => FW.RIDER_DEFAULT);
    ok(JSON.stringify(mem) === JSON.stringify(D), 'norm: on load: a rider that is no rider (' + JSON.stringify(v) + ') is the default rider', mem); await x.close(); }
  { const x = await openH({ settings: { rider: null } }), mem = await x.p.evaluate(() => 'rider' in window.__q99.settings); ok(!mem, 'norm: on load: rider null is no rider (absent)', mem); await x.close(); }
  // on restore: a backup file
  for (const [tag, r, want] of [['tampered', BAD_R, W], ['not a rider', 'x', null]]) {
    const x = await openH(), p = x.p, D = await p.evaluate(() => FW.RIDER_DEFAULT);
    const bk = await p.evaluate(r => { const d = JSON.parse(JSON.stringify(window.__q99.backupData())); d.settings.rider = r; return d; }, r);
    await restore(p, bk); const mem = await p.evaluate(() => window.__q99.settings.rider);
    ok(JSON.stringify(mem) === JSON.stringify(want || D), 'QA: a tampered rider value in a backup draws the default: riderNorm on restore (' + tag + ')', mem);
    await sheet(p); const S = await sheetOf(p); ok(S.figSame && FIELDS.every(k => S.pressed[k][0] === (want || D)[k]), 'norm: on restore (' + tag + '): the sheet draws it', S.pressed);
    await x.close(); }
  // when synced settings arrive: the cloud's rider tampered (a newer stamp), pulled by a signed-in device
  { const be = new Backend(), A = await synced(be, { label: 'A' }); await ready(be, A);
    const now = Date.now() + 5000, d = JSON.parse(JSON.stringify(doc(be))); d.settings.rider = BAD_R; d.settings.updatedAt = now; d.settingsAt = Object.assign({}, d.settingsAt, { rider: now, _u: now }); be.fs.set('users/u1', d);
    const got = await nudge([A.p], () => A.p.evaluate(() => !!window.__q99.settings.rider));
    const mem = await A.p.evaluate(() => window.__q99.settings.rider), st = (await stored(A.p)).rider;
    ok(!!got && JSON.stringify(mem) === JSON.stringify(W) && JSON.stringify(st) === JSON.stringify(W), 'QA: a tampered rider value in the cloud draws the default: riderNorm when synced settings arrive (every tampered field its default, the real choice kept)', { mem, st });
    const av = await A.p.evaluate(() => { const h = document.querySelector('#syncHdr .hav'), nm = s => String(s).replace(/\b(fw-[a-z]+)\d+/g, '$1#'); return !!h && h.classList.contains('av-on') && nm(h.querySelector('.av-r').innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.riderAvatar(window.__q99.riderNow(), 32) }).innerHTML); });
    ok(av, 'norm: synced: the header avatar draws the checked rider', av);
    // a second pull changes nothing (the cloud keeps its value; the device does not apply it again on every pull)
    const before = JSON.stringify(await stored(A.p)); await A.p.evaluate(() => { window.__q99n = 0; const h = document.getElementById('rdGroups'); new MutationObserver(r => { window.__q99n += r.length; }).observe(document.getElementById('syncHdr'), { subtree: true, childList: true }); });
    await nudge([A.p], async () => false, 6000);
    const after = JSON.stringify(await stored(A.p)), n = await A.p.evaluate(() => window.__q99n);
    ok(before === after && n === 0, 'norm: synced: later pulls of the same cloud copy change nothing here (the rider kept as checked, the avatar not drawn again)', { same: before === after, n });
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
    await sheet(q); const S = await sheetOf(q);
    ok(J(r) === J(RIDER99) && S.figSame && FIELDS.every(k => S.pressed[k][0] === RIDER99[k]) && S.r.kit === RIDER99.kit, 'backup: that export restored on a fresh page with no rider brings the rider (stored, the sheet and its live rider)', r);
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
  await sheet(p); const S = await sheetOf(p); ok(S.pressed.kit[0] === '#F28C28' && S.figSame, 'backup: the sheet and the live rider show the restored rider', S.pressed);
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
    const be = new Backend(), x = await synced(be, { label: 'b', settings: { rider: RIDER99 }, width: desk ? 1280 : 390, height: desk ? 800 : 844 }), p = x.p;
    if (run) { await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=run]'); await until(() => p.evaluate(() => document.documentElement.classList.contains('run-theme'))); }
    await until(() => p.evaluate(d => !!document.querySelector(d ? '#sbAv.av-on svg' : '#syncHdr .hav.av-on svg'), desk), 15000); await sleep(1500);
    const v = await avOf(p), b = desk ? v.sb : v.hav, sz = desk ? 30 : 32, where = desk ? '#sbAv on the computer layout (30 px)' : 'the header circle (32 px)' + (run ? ' on the run (graphite)' : '');
    ok(!!b && b.art && b.same && b.w === sz && b.h === sz && b.hid === 'true' && b.ini === 'T' && !b.iniVis && (!run || v.run), '99.3: signed in and built: the rider replaces the initial in ' + where + ' (FW.riderAvatar of the rider, ids aside; aria-hidden; the initial kept under it)', v);
    ok(!!b && !b.go && !b.run, '99.3: the avatar is always still (' + where + ': no .fwm-go, nothing running)', b);
    await p.emulateMedia({ forcedColors: 'active' }); await settle(p, 100); const fc = await avOf(p), fb = desk ? fc.sb : fc.hav;
    await p.emulateMedia({ forcedColors: 'none', media: 'print' }); await settle(p, 100); const pr = await avOf(p), pb = desk ? pr.sb : pr.hav;
    await p.emulateMedia({ media: 'screen' });
    ok(!!fb && !fb.art && fb.iniVis && (!pb || (!pb.art && (pb.iniVis || !pb.shown))), 'avatar: forced colours (and print) show the initial, no art (' + where + ')', { fb, pb });
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
// sleeves of a thermal jersey or a jacket
const UNDER = new Set(['jersey-light', 'jersey-med', 'bibs', 'base-ls', 'base-ss', 'base-sleeveless', 'base-thermal', 'socks-summer']);
const SLEEVED = ['jersey-heavy', 'windbreaker', 'jacket-thermal', 'jacket-winter', 'jacket-rain'];
const byDesign = (id, L) => UNDER.has(id) || ((id === 'arms' || id === 'sun-sleeves') && L.some(x => SLEEVED.includes(x)));
// the known v6 gaps (decision; the design chat fixes them in v7, FROM-APP-CHAT-5.md points 1-7): items the strip lists that v6 draws as
// nothing or barely. One list, each tied to its point; printed as notes. The item that takes v7 empties it. An entry is as wide as its
// point: whole (the point says the item draws nothing there: only a note) or not (the point takes a part: what is left must still show,
// judged as any item: a jacket's body under a thermal jersey's sleeves, the rain jacket's yellow sleeves under the vest; the skullcap and
// the headband, which the points say cover the eyes or barely show, must show at the strip's threshold).
const LEG = ['legs', 'tights-light', 'tights-heavy'], OVER = ['windbreaker', 'jacket-thermal', 'jacket-winter'];
const V6_GAPS = [
  { ids: ['shoes'], when: L => L.some(x => LEG.includes(x)), point: 1, whole: true, what: 'shoe covers draw nothing with leg warmers or tights' },
  { ids: ['jacket-rain'], when: L => L.some(x => OVER.includes(x)), point: 2, whole: true, what: 'the rain jacket draws nothing under a windbreaker or a thermal or winter jacket (0 yellow px)' },
  { ids: ['jacket-rain'], when: L => L.includes('vest') && L.includes('jersey-heavy'), point: '2+3', whole: true, what: 'the rain jacket under the vest (its body, point 2) with a thermal jersey (its sleeves, point 3): nothing of it left' },
  { ids: ['jacket-rain'], when: L => L.includes('vest'), point: 2, whole: false, what: 'the rain jacket under the vest: its body hidden, its yellow sleeves must show' },
  { ids: ['windbreaker'], when: L => L.includes('jersey-heavy'), point: 3, whole: true, what: 'a windbreaker over a thermal jersey: its sleeves taken, its body 1.02:1 from the jersey (looks like a vest)' },
  { ids: ['jacket-thermal', 'jacket-winter', 'jacket-rain'], when: L => L.includes('jersey-heavy'), point: 3, whole: false, what: 'a jacket\'s sleeves taken by a thermal jersey: its body must show' },
  { ids: ['socks-wool'], when: L => L.some(x => LEG.includes(x)), point: 4, whole: true, what: 'wool socks under tights or leg warmers' },
  { ids: ['knees'], when: () => true, point: 5, whole: true, what: 'knee warmers barely show (drawn under the shorts and the sock)' },
  { ids: ['skullcap'], when: (L, r) => r.glasses === 'none', point: 6, whole: false, what: 'the skullcap\'s band over the eyes with glasses none: the cap must show' },
  { ids: ['head'], when: (L, r) => r.glasses === 'shield', point: 7, whole: false, what: 'the headband barely shows with the shield glasses: it must show at the strip\'s threshold' },
];
// found by item 99, not in FROM-APP-CHAT-5 (for the design chat: DECISIONS.md "Item 99", the dark-skin note, points A and B): dark gloves
// and leg wear on the darkest skin. A built rider is judged as the default one is; only these are held, one entry each, and the item that
// takes their fix empties the list.
const SKIN_GAPS = [
  { ids: ['gloves'], when: (L, r) => r.skin === 'deep', point: 'A', whole: true, what: 'full-finger gloves (#2A2A30) on deep brown skin (#5A3622): no pixel changes by more than 48' },
  { ids: ['legs'], when: (L, r) => r.skin === 'deep' && L.includes('shoes'), point: 'B', whole: true, what: 'leg warmers (#1E1E24) on deep brown skin with shoe covers (point 1: without the leg warmers the covers draw the sock black): 113 device px against 120' },
];
// each item's own colour (knee grey and the like): the bundle's OUTFIT_LOOK colours
const OWN = { toes: '#8E949A', knees: '#B9C2CF', skullcap: '#8FA7C4', 'socks-wool': '#8E949A', gaiter: '#2ABCBB', vest: '#BFE6E6', windbreaker: '#DCE1E8', 'jacket-thermal': '#2F3B6E', 'jacket-winter': '#1E2A4A', 'jacket-rain': '#F2D64B',
  boots: '#3A2F2A', 'tights-heavy': '#14141A', 'tights-light': '#1E1E24', legs: '#1E1E24', arms: '#1E1E24', 'sun-sleeves': '#FFFFFF', gloves: '#2A2A30', 'gloves-finger': '#2A2A30', 'gloves-thermal': '#1E1E24', 'gloves-lobster': '#1E1E24', balaclava: '#1E1E24', head: '#2ABCBB', shoes: '#1E1E24', overshoes: '#1E1E24' };
// shows: at the strip's size on a 2x screen (100 x 150 CSS px, 200 x 300 device px), at least 120 device px (30 CSS px) changed by more than 48 in
// a channel (the bundle check's "clearly visible"), and of them at least 40 (10 CSS px) in the item's own colour where it has one (2x: a thin
// part's own colour is lost to anti-aliasing at 1x)
const SHOW = { d48: 120, own: 40 };
// in the page: the rider at strip size on a canvas (FW.plain), whole and with each item left out; per item the pixels changed and those in its own colour
const pxOf = (p, r, ids, own) => p.evaluate(async ([r, ids, own]) => { const W = 200, H = 300, mk = L => FW.plain(FW.riderOutfit(r, L)).replace('<svg ', `<svg width="${W}" height="${H}" `);
  const draw = async s => { const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); await img.decode(); const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0, W, H); return x.getImageData(0, 0, W, H).data; };
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)), whole = await draw(mk(ids)), out = {};
  for (const id of new Set(ids)) { const minus = await draw(mk(ids.filter(x => x !== id))), oc = own[id] === 'kit' ? hx(r.kit) : own[id] ? hx(own[id]) : null; let d48 = 0, o = 0;
    for (let i = 0; i < whole.length; i += 4) { const d = Math.max(Math.abs(whole[i] - minus[i]), Math.abs(whole[i + 1] - minus[i + 1]), Math.abs(whole[i + 2] - minus[i + 2])); if (d > 48) { d48++; if (oc && Math.max(Math.abs(whole[i] - oc[0]), Math.abs(whole[i + 1] - oc[1]), Math.abs(whole[i + 2] - oc[2])) <= 10) o++; } }
    out[id] = { d48, own: oc ? o : null }; }
  return out; }, [r, ids, own]);
// the strip as shown: its ids (the app's own record), its drawing against FW.riderOutfit(rider, ids), and outfit()'s list for the ride shown
const stripOf = p => p.evaluate(() => { const H = window.__q99, el = document.getElementById('rRider'), i = H.lastResult && H.lastResult.i || H.readInputs(), minF = i.wxMinF != null ? i.wxMinF : i.tempF, maxF = i.wxMaxF != null ? i.wxMaxF : null;
  const o = H.outfit(minF, maxF, i.wxRain, i.intensity), list = o.wear.map(c => c && c.id), r = H.riderNow(), s = el && el.querySelector('svg'), rc = s && s.getBoundingClientRect(), card = document.getElementById('rWearCard').getBoundingClientRect(), wear = document.getElementById('rWear').getBoundingClientRect();
  const nm = h => String(h).replace(/\b(fw-[a-z]+)\d+/g, '$1#'), ticks = [...document.querySelectorAll('#rWear [data-tick-items]')].flatMap(t => JSON.parse(t.dataset.tickItems)).map(k => k.slice(2));
  return { ids: el && el._ids, list, ticks, shed: o.shed.map(c => c.id), minF, maxF, rain: i.wxRain, r, svg: !!s, same: !!s && nm(el.innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.riderOutfit(r, el._ids || []) }).innerHTML), w: rc && Math.round(rc.width), h: rc && Math.round(rc.height),
    inCard: !!rc && rc.left >= card.left && rc.right <= card.right && rc.bottom <= wear.top + 1, above: !!rc && rc.bottom <= wear.top + 1, hid: el && el.getAttribute('aria-hidden'), text: el ? el.textContent.trim() : null, still: !!el && !el.classList.contains('fwm-go') && !el.getAnimations({ subtree: true }).some(a => a.playState === 'running'),
    rec: H.FWM.get(el) ? { s: H.FWM.get(el).s, k: H.FWM.get(el).k.slice(0, 40) } : null }; });
const RIDES = [['hot', { lo: 92, hi: 99 }], ['mild', { lo: 59, hi: 63 }], ['cold', { lo: 40, hi: 44 }], ['freezing', { lo: 24, hi: 29 }], ['wet', { lo: 53, hi: 57, rain: 80 }]];
async function setCloset(p, kind, extra) { await p.evaluate(([kind, extra]) => { const H = window.__q99, mk = id => H.closetItemFromCatalog(H.CLOSET_CATALOG.find(c => c.id === id));
  const L = (kind === 'full' ? H.CLOSET_CATALOG.map(c => c.id) : H.CLOSET_STARTER).map(mk).concat(extra || []); H.settings.closet = L; H.save(H.KEYS.settings, H.settings); H.refreshResults(); }, [kind, extra || null]); await settle(p, 200); }
const GAPS_SEEN = new Map();
// every rider shown (the default and the built one) is judged; only the named lists' entries are held
function judge(tag, S, px) {
  const L = S.ids || [];
  for (const id of L) { if (byDesign(id, L)) continue; const v = px[id], shows = !!v && v.d48 >= SHOW.d48 && (v.own == null || v.own >= SHOW.own), gaps = V6_GAPS.concat(SKIN_GAPS).filter(g => g.ids.includes(id) && g.when(L, S.r));
    gaps.forEach(g => { const k = (typeof g.point === 'number' ? 'FROM-APP-CHAT-5 point ' : /^[AB]$/.test(g.point) ? 'dark-skin note point ' : 'FROM-APP-CHAT-5 points ') + g.point + ' ' + id + (g.whole ? ' (held: ' : ' (judged: ') + (shows ? 'shows)' : 'does not show)');
      if (!GAPS_SEEN.has(k)) GAPS_SEEN.set(k, g.what + ' (' + tag + ': ' + JSON.stringify(v) + ')'); });
    if (gaps.some(g => g.whole)) continue;
    ok(shows, 'strip: ' + tag + ': ' + id + ' shows on the rider (' + (v ? v.d48 + ' device px changed' + (v.own != null ? ', ' + v.own + ' in its own colour' : '') : 'not measured') + ')' + (gaps.length ? ' (what ' + gaps.map(g => 'point ' + g.point).join(', ') + ' leaves of it)' : ''), { v, L }); }
}
section('strip', async () => {
  for (const [n, wx] of RIDES) for (const rider of [null, RIDER99]) {
    if (rider && n !== 'cold' && n !== 'wet') continue; // the built rider (a pair of glasses: the headband shows) on the cold and wet rides
    const x = await openH({ wx, settings: rider ? { rider } : {} }), p = x.p, who = rider ? 'RIDER99' : 'the default rider';
    await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300);
    for (const kind of ['starter', 'full']) {
      if (kind === 'full') await setCloset(p, 'full');
      const S = await stripOf(p), tag = n + ' ride (' + Math.round(S.minF) + '-' + Math.round(S.maxF) + ' F' + (S.rain ? ', rain ' + S.rain + '%' : '') + '), ' + kind + ' closet, ' + who;
      console.log('  info: ' + tag + ': ' + (S.ids || []).join(' '));
      ok(!!S.ids && JSON.stringify(S.ids) === JSON.stringify(S.list) && S.list.every(id => S.ticks.includes(id)) && S.ticks.every(id => S.list.includes(id)), '99.4: ' + tag + ': the strip gets exactly the items outfit() lists (o.wear: the list\'s rows), in its order', S);
      ok(S.svg && S.same, '99.4: ' + tag + ': the strip is FW.riderOutfit(the rider, those ids) (ids aside)', { same: S.same });
      ok(S.w === 100 && S.h === 150 && S.inCard && S.above && S.hid === 'true' && S.text === '', 'strip: ' + tag + ': 100 x 150 px, in the card above the list, aria-hidden, no text (items 73, 75, 76)', S);
      ok(S.still && !!S.rec && S.rec.s === true, 'strip: ' + tag + ': still (fwMount o.still: no .fwm-go, nothing running)', S.rec);
      judge(tag, S, await pxOf(p, S.r, S.ids || [], Object.assign({}, OWN, { 'jersey-heavy': 'kit' })));
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
  { const be = new Backend(), A = await synced(be, { label: 'ap', wx: { lo: 40, hi: 44 }, settings: { rider: RIDER99 } }), p = A.p; await ready(be, A); await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300);
    const now = Date.now() + 5000, d = JSON.parse(JSON.stringify(doc(be))); d.settings.rider = Object.assign({}, RIDER99, { kit: '#2ABCBB' }); d.settings.updatedAt = now; d.settingsAt = Object.assign({}, d.settingsAt, { rider: now, _u: now }); be.fs.set('users/u1', d);
    await nudge([p], () => p.evaluate(() => window.__q99.settings.rider && window.__q99.settings.rider.kit === '#2ABCBB')); await stripNow(p, '#2ABCBB', 'by sync');
    await A.close(); }
  // a ride that warms (items shed on the way): the strip lists every item the list does, the shed ones too
  { const x = await openH({ wx: { lo: 40, hi: 80 } }), p = x.p; await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300); const S = await stripOf(p);
    ok(S.shed.length > 0 && JSON.stringify(S.ids) === JSON.stringify(S.list) && S.shed.every(id => S.ids.includes(id)), '99.4: a ride that warms (' + Math.round(S.minF) + ' to ' + Math.round(S.maxF) + ' F): the strip wears every item the list names, the ones shed on the way too (' + S.shed.join(', ') + ')', S);
    await x.close(); }
  // the computer layout: the strip in the results column
  { const x = await openH({ wx: { lo: 53, hi: 57, rain: 80 }, width: 1440, height: 900, settings: { rider: RIDER99 } }), p = x.p; await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300); const S = await stripOf(p), dk = await p.evaluate(() => document.documentElement.classList.contains('dk'));
    ok(dk && S.svg && S.same && S.w === 100 && S.inCard && JSON.stringify(S.ids) === JSON.stringify(S.list), 'strip: the computer layout (1440 x 900): the strip in the Closet card of the results column, the list\'s items', S);
    await x.close(); }
  for (const [k, v] of GAPS_SEEN) console.log('  note: known gap, ' + k + ': ' + v);
  // the detector itself: an item known to draw nothing (shoe covers with leg warmers) is judged as not showing; the same item alone shows
  { const x = await openH({ noErrs: true }), p = x.p, D = await p.evaluate(() => FW.RIDER_DEFAULT), a = await pxOf(p, D, ['legs', 'shoes'], OWN), b = await pxOf(p, D, ['shoes', 'knees', 'toes'], OWN);
    ok(a.shoes.d48 < SHOW.d48 && a.legs.d48 >= SHOW.d48 && b.toes.d48 >= SHOW.d48 && b.toes.own >= SHOW.own, 'strip: self-test: the pixel check sees shoe covers under leg warmers as not showing (v6) and the leg warmers and toe covers as showing', { a, b });
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
  await p.emulateMedia({ forcedColors: 'active' }); await settle(p, 100);
  const F = await p.evaluate(() => { const sw = [...document.querySelectorAll('#rdGroups .rd-c')].filter(b => b.getClientRects().length), t = [...document.querySelectorAll('#rdGroups .rd-t[aria-pressed="true"]')];
    return { n: sw.length, kept: sw.filter(b => { const h = b.style.getPropertyValue('--sw').trim(), m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h); return !!m && getComputedStyle(b).backgroundColor === 'rgb(' + [m[1], m[2], m[3]].map(x => parseInt(x, 16)).join(', ') + ')'; }).length,
      edge: sw.filter(b => parseFloat(getComputedStyle(b).borderTopWidth) >= 1 && getComputedStyle(b).borderTopStyle !== 'none').length, ring: sw.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => getComputedStyle(b).boxShadow), word: t.map(b => [getComputedStyle(b).backgroundColor, getComputedStyle(b).color]),
      wordOff: [...document.querySelectorAll('#rdGroups .rd-t[aria-pressed="false"]')].slice(0, 1).map(b => [getComputedStyle(b).backgroundColor]), same: [...document.querySelectorAll('#rdGroups .rd-c.rd-same, #rdGroups .rd-c[data-v=""]')].map(b => getComputedStyle(b).backgroundImage), names: ['kit', 'skin', 'shorts'].map(k => document.getElementById('rdN-' + k).textContent) }; });
  await p.emulateMedia({ forcedColors: 'none' });
  ok(F.n >= 40 && F.kept === F.n && F.edge === F.n && F.ring.length >= 8 && F.ring.every(s => s && s !== 'none') && F.word.length >= 4 && F.word.every(w => w[0] !== F.wordOff[0][0]) && F.names.every(Boolean) && F.same.length === 2 && F.same.every(b => /gradient/.test(b)), 'media: forced colours: every swatch keeps its colour with an edge, "Same as jersey" its ring, the pressed ones ringed, the pressed word buttons marked, the chosen names shown', F);
  await x.close();
});

section('fit', async () => {
  for (const [w, sc] of [[320, 1], [320, 2], [390, 2], [390, 1.5]]) {
    const x = await openH({ width: w, scale: sc, settings: { rider: RIDER99 } }), p = x.p; await sheet(p); await allOpen(p); await settle(p, 200);
    const F = await p.evaluate(() => { const sh = document.querySelector('#setSheet .set-sheet'), b = sh.getBoundingClientRect(), bad = [...document.querySelectorAll('#prowB-rider *')].filter(e => e.getClientRects().length).map(e => [e, e.getBoundingClientRect()]).filter(([e, r]) => r.right > b.right + 0.5 || r.left < b.left - 0.5).map(([e]) => e.className || e.tagName);
      const small = [...document.querySelectorAll('#prowB-rider button')].filter(e => e.getClientRects().length).map(e => e.getBoundingClientRect()).filter(r => r.width < 44 || r.height < 44).length;
      return { sx: document.documentElement.scrollWidth > innerWidth, shx: sh.scrollWidth > sh.clientWidth + 1, bad: bad.slice(0, 5), small }; });
    ok(!F.sx && !F.shx && !F.bad.length && !F.small, 'fit: ' + w + ' px, ' + (sc * 100) + '% text: the sheet (every group open, More colours) fits: no sideways scroll, nothing past the sheet, every button 44 px or more', F);
    await done(p); await p.click('nav.tabs button[data-view=plan]'); await settle(p, 200); await crunch(p); await toY(p, '#rWearCard');
    const S = await stripOf(p); ok(S.svg && S.inCard && S.w === 100 && !(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'fit: ' + w + ' px, ' + (sc * 100) + '% text: the strip inside its card, no sideways scroll', S);
    await x.close(); }
  // the computer layout: the sheet is the pane beside the settings list
  const x = await openH({ width: 1280, height: 800, settings: { rider: RIDER99 } }), p = x.p; await sheet(p); await allOpen(p);
  const D = await p.evaluate(() => { const l = document.getElementById('setList').getBoundingClientRect(), s = document.querySelector('#setSheet .set-sheet').getBoundingClientRect(); return { dk: document.documentElement.classList.contains('dk'), side: s.left >= l.right - 1, list: !document.getElementById('setList').inert }; });
  ok(D.dk && D.side && D.list, 'fit: the computer layout: the sheet is the pane beside the settings list (the list stays usable)', D);
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
