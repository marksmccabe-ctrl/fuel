// node q100.test.mjs <null.html> [main null.html]   (cd into this folder first) -- item 100: Front page: the sky card and the crew.
// Every numbered point, QA line and decision (DECISIONS.md "Item 100", Build):
//   cache    sw.js CACHE = APP_BUILD, v124 or later; fred world v9 or later
//   place    100.1: the sky box (#planSky) sits between the ride ticket and Settings (in the page and on the screen), a plain Plan box: white
//            (the panel), a 1.5 px outline in the Settings box's colour, the panel radius (var(--r-panel)), no tint; a minimum height, never a fixed one (no height in
//            any rule for it; it grows past the minimum with larger text); its sky is item 87's masked .rwx-scene layer (a mask, the sky's
//            layer by wxSkySet) and the bundle's own forecast sky is never used (no .fw-wx, FW has no wxSky)
//   looks    100.1-2: for a sunny, wet, snowy and freezing forecast and a clear night: the box's sky is the forecast's (data-sky, its
//            layer) and fred is dressed as item 98 dresses him (the key wx:<look>, the drawing FW.bird of FW.WX_WEAR[look], ids aside; the
//            night still); the one line reads time · place · temperature ("Thu 8:00 AM · Carmel · 61°"), no other words (the box's whole
//            text is the line), and its number is the weather card's after Crunch
//   nofc     100.2, QA: no forecast (the lookup answered by nothing), no place the lookup can find, offline (no request at all), and a
//            saved forecast from the cache (a failing network), and a ride 11 or more days out (typical weather only: no lookup from the box):
//            fred in his cap (wx:clouds, FW.bird with no wear), no sky, no number
//   fetch    100.2: the forecast is looked up when Plan opens (on load: one lookup), through Crunch's own (the same key: a Crunch then makes
//            no request); tab switches and the app back in front make no more; an hour-old one is looked up again (once); a failing
//            network: one try, none again from the Plan for 10 minutes, then one; a Crunch during the box's lookup waits for it (one
//            request of each kind); a Crunch during the box's failing lookup tries again itself and shows its note; no lookup while the Plan
//            sheet is open (start times changed three times), one after Done
//   keep     100.2 (check round 1): the box keeps a live forecast it has: a day changed and back, Crunch then Save to Journal, the computer
//            layout's + New ride: live, its sky and number, no new lookup; offline after a live forecast: the cap; online again: the sky back
//   race     100.2 (check round 1): the box's slow lookup of the old ride (answered or failing) after the new ride was Crunched leaves the
//            new ride's forecast (wxKey, wxLast, the card after a redraw); its hung lookup does not hold Crunch once the network is back
//            (results within 8 s; main 0.2 s); the ride changed while its lookup is out: the new ride's forecast with nothing else happening,
//            and back to the first ride: that ride is asked again (an overtaken try is not a failed one)
//   once     100.3, QA: after Crunch the box is out and only one fred is on the page, in every frame of the Crunch; the run's results too;
//            back (the results gone) the box shows again, one fred
//   desk     100.3: the computer layout: the box under the ticket in the Plan-a-ride column; out when Results is shown beside it; the crew
//            is not on the computer layout
//   crew     100.4: five friends after the footer (the next thing after it), on the page (no band): today's five by the local date
//            (crewOf(crewDay) of the date, checked against the rule worked out here), the same at 8 am and 11:30 pm and on a second load,
//            another five the next day, and a new day while the app stays open brings its five when the app is back in front; over 400 days
//            never both Robs (9 and 17) and every friend 5 days in every 19; one body size (each
//            friend drawn at its FW.box width at the body's scale: 10, 12 and 17 are wider); each a fwMount spot with its own id prefix
//            and no id twice on the page
//   motion   round rule a: with the gate open each friend moves when first seen (fwm-go), offset by --fw-d with fw-vm0 (each friend at
//            most its own loops: a bob, and a blink for 1, 2 and 13), at most 30 running fred world animations on the screen with fred in
//            his busiest look (freeze) and the five; all still by 9.5 s, and still after Journal and back, a resize and the app back in front
//            (the same drawings kept); still under Reduce Motion and with Animate the world off
//   room     100.4, QA: at the end of the scroll the crew sits at least 8 px clear of the tab bar (320, 375, 390, 430 px; 100, 150, 200%
//            text) and the footer is clear of it, shown and not covered (its science link the element at its own centre); left out when there
//            is no room (a taller tab bar), back when there is; at the edge: 4 px of room: left out, 9 px: shown, 8 or more clear; judged on
//            layout changes, never on a scroll
//   theme    100.6: the run's graphite: the box follows the run (the panel #34343C, its sky's first stop 26% of the sky in it, light words); the crew left out
//            there (provisional decision), back on the ride
//   switch   100.5: Settings › fred world has "Show the crew" (on) and "Show their names" (off), 44 px rows; neither is stored or in
//            DEFAULT_SETTINGS until tapped; a tap stores settings.crewShow / crewNames and the crew follows (off: no art at all); a
//            reload keeps them
//   names    100.5, QA: names on: the first name under each friend (CREW_NAMES order, the five of the day), real text in the accessibility
//            tree, never cut, broken over two lines or overlapping (320 / 390 / 430 px, 100 / 150 / 200% text); names off: no name in the strip, the page's text
//            or the accessibility tree
//   sync     QA: two devices (the q91 Firebase stand-in): A turns the names on, B gets them (one settingsAt stamp each, crewNames); B turns
//            the crew off, A's crew goes; the Plan footer's Privacy link shows where sign-in is configured
//   backup   a backup carries the switches and a restore brings them; one without them keeps this device's (names on stay on, the crew
//            off stays off: as the rider, birthday and gender; check round 1)
//   media    print: no crew, no sky, no fred (the box's words stay, without the feather or fred's room); forced colours: the art out, the box's edge kept
//   fit      QA: 320 and 390 px at 150% and 200% text: the line inside the box and its rows beside fred clear of him (the rows under him
//            take the box's width), fred inside the box, no sideways scroll; long places (Indianapolis, Mechanicsburg): no word over two rows
//   main     (with [main null.html]) main has no box and no crew
// Q100_ONLY=section,section runs some sections.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { checker, open, reload } from '../lib/open.mjs';
import { crunch, settle, tab, weatherRouteFor } from '../lib/screens.mjs';
import { Backend, syncPageSource } from '../q91/fbmock.mjs';

const PAGE = path.resolve(process.argv[2] || '../../fred100/null.html'), MAIN = process.argv[3] ? path.resolve(process.argv[3]) : null;
const ONLY = (process.env.Q100_ONLY || '').split(',').filter(Boolean);
const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = process.env.Q100_REPO || path.resolve(HERE, '../../wt-q100');
const C = checker('q100 '), ok = C.ok, ERRS = [];
const SRC = fs.readFileSync(PAGE, 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000, step = 100) { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); } catch (e) { v = null; } if (v) return v; await sleep(step); } return v; }
const browser = await chromium.launch();

// the hooked copy: every lookup the page makes (geocode, forecast, NWS) is logged from the main script's first line, and some of the app's
// own state is handed out (as q97-q99 do)
const HOOK = "\n(()=>{ const f=window.fetch; window.__q100req=[]; window.fetch=function(u, ...a){ const s=String(u && u.url || u); if(/open-meteo|weather\\.gov|zippopotam/.test(s)) window.__q100req.push(s.split('?')[0]); return f.call(this, u, ...a); }; })();\n"
  + "Object.defineProperty(window,'__q100',{configurable:true,get(){ return {FWM, skyBoxFetch, skyBoxRender, crewOf, crewDay, CREW_NAMES, wxReq, backupData, DEFAULT_SETTINGS, KEYS, get settings(){ return settings; }, get wxLast(){ return wxLast; }, get wxKey(){ return wxKey; }}; }});\n";
function hooked(page, name, hook = HOOK) { const src = fs.readFileSync(page, 'utf8'), k = src.indexOf("\n'use strict';\n"); if (k < 0) throw new Error("no 'use strict' line in " + page);
  const f = path.join(path.dirname(page), name), at = k + "\n'use strict';".length; fs.writeFileSync(f, src.slice(0, at) + hook + src.slice(at)); return f; }
const HOOKED = hooked(PAGE, 'q100-hook.html'), MADE = [HOOKED];
const SYNCED = (() => { const g = HOOKED.replace(/\.html$/, '-sync.html'); fs.writeFileSync(g, syncPageSource(fs.readFileSync(HOOKED, 'utf8'))); MADE.push(g); return g; })();

const NOW = '2026-10-29T15:00:00-07:00'; /* a Thursday (Los Angeles: open()'s time zone) */
const WX = weatherRouteFor();
const openH = (o = {}) => open(o.file || HOOKED, Object.assign({ athlete: 'A', browser, motion: false, repo: REPO, now: NOW, settle: 800 }, o, {
  route: (r, u) => (o.route && o.route(r, u)) || (o.forecast === false ? null : WX(r, u)) })).then(x => { if (!o.noErrs) ERRS.push(x.errors); x.p.on('dialog', d => d.accept()); return x; });
const J = v => JSON.stringify(v);
const norm = h => String(h).replace(/\b(fw-[a-z]+)\d+/g, '$1#').replace(/\bid="[^"]*"/g, 'id').replace(/url\(#[^)]*\)/g, 'url(#)').replace(/href="#[^"]*"/g, 'href');
const LINE = /^Thu 8:00 AM · Carmel · \d+°$/, LINE0 = /^Thu 8:00 AM · Carmel$/;
// the box as it stands: shown, its state, sky, fred's look and key, whether the drawing is FW.bird of the look, the line
const boxOf = p => p.evaluate(([N]) => { const W = document.getElementById('planSky'), g = W && W.querySelector(':scope>.rwx-g'), f = W && W.querySelector(':scope>.rwx-fred:not(.rwx-out)'), Q = window.__q100, r = f && Q.FWM.get(f);
  const nm = s => String(s).replace(/\b(fw-[a-z]+)\d+/g, '$1#').replace(/\bid="[^"]*"/g, 'id').replace(/url\(#[^)]*\)/g, 'url(#)').replace(/href="#[^"]*"/g, 'href'), look = g && g.dataset.fred;
  const L = document.getElementById('planSkyL'), layer = W && W.querySelector(':scope>.rwx-scene>.rwx-layer:not(.rwx-out)');
  return { on: !!W && !W.hidden && getComputedStyle(W).display !== 'none', wx: W && W.dataset.wx, sky: W && W.dataset.sky || null, gsky: g && g.dataset.sky || null, look, key: r && r.k, still: r && r.s,
    same: !!f && !!look && nm(f.innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.bird({ wear: FW.WX_WEAR[look] }) }).innerHTML), layer: layer ? layer.dataset.k : null, line: L ? L.textContent : null, num: L && L.querySelector('.pvs-t') ? L.querySelector('.pvs-t').textContent : null,
    whole: !!W && !!L && W.innerText.replace(/\s+/g, ' ').trim().toLowerCase() === L.textContent.replace(/\s+/g, ' ').trim().toLowerCase() /* (no other words in the box) */ }; }, [0]);
const ready = (p, wx, look) => until(() => p.evaluate(([wx, look]) => { const W = document.getElementById('planSky'); return !!W && W.dataset.wx === wx && (!look || (W.querySelector(':scope>.rwx-g') || {}).dataset.fred === look) && !!W.querySelector(':scope>.rwx-fred:not(.rwx-out) svg'); }, [wx, look]), 20000);
const reqs = p => p.evaluate(() => window.__q100req.slice());
const kinds = L => ({ geo: L.filter(u => /geocoding/.test(u)).length, fc: L.filter(u => /api\.open-meteo\.com\/v1\/forecast|archive-api/.test(u)).length, all: L.length });
const freds = p => p.evaluate(() => [...document.querySelectorAll('.rwx-fred')].filter(f => !f.classList.contains('rwx-out') && f.getClientRects().length && f.querySelector('svg') && getComputedStyle(f.querySelector('svg')).display !== 'none').map(f => f.parentElement.id));
async function toSettings(p) { await p.click('#syncHdrIn:visible, #syncHdr:visible, #sbAcct:visible'); await until(() => p.evaluate(() => document.getElementById('view-profile').classList.contains('active'))); await settle(p, 150); }
const crewOf = p => p.evaluate(() => { const U = document.getElementById('planCrew'), T = U && U.cloneNode(true); if (T) T.querySelectorAll('svg').forEach(s => s.remove()); return { on: !!U && !U.hidden && getComputedStyle(U).display !== 'none', ids: U ? [...U.querySelectorAll('.crew-f')].map(li => +li.dataset.i) : [], art: U ? U.querySelectorAll('.crew-a svg').length : 0, names: U ? [...U.querySelectorAll('.crew-n')].map(n => n.textContent) : [], text: T ? T.textContent : '', /* (words outside the drawings: a drawing's own bib number is art) */ hid: U && U.getAttribute('aria-hidden'), room: U && U.dataset.room }; });
// the rule, worked out here: the local date as a day number, five friends from 5 x day, round the 19
const NAMES = ['Ryan', 'Dustin', 'Chelsea', 'Bobby', 'Anne', 'Heather', 'Luke', 'Mark', 'Maria', 'Rob', 'Marc', 'Katie', 'Bentley', 'John', 'Steve', 'Julia', 'Chiara', 'Rob', 'Paul'];
const fiveOf = (y, m, d) => { const day = Date.UTC(y, m - 1, d) / 864e5, s = ((day * 5) % 19 + 19) % 19; return [0, 1, 2, 3, 4].map(k => (s + k) % 19); };
const sheet = async (p, f) => { await p.click('#locRow'); await until(() => p.evaluate(() => document.getElementById('planSheet').classList.contains('open'))); await f(); await p.click('#psAct'); await until(() => p.evaluate(() => !document.getElementById('planSheet').classList.contains('open'))); };
const setField = async (p, sel, v) => { await p.fill(sel, v); await p.dispatchEvent(sel, 'change'); };
const setPlace = async (p, place) => { await p.click('#locRow'); await until(() => p.evaluate(() => document.getElementById('planSheet').classList.contains('open'))); await setField(p, '#wxLoc', place); await sleep(300); await p.keyboard.press('Escape').catch(() => {}); /* (the suggestions shut) */
  if (await p.evaluate(() => document.getElementById('planSheet').classList.contains('open'))) await p.click('#psAct'); await until(() => p.evaluate(() => !document.getElementById('planSheet').classList.contains('open'))); };
const shown = p => until(() => p.evaluate(() => getComputedStyle(document.getElementById('results')).display !== 'none' && !document.getElementById('calcBtn').disabled), 20000);
const endScroll = p => p.evaluate(() => new Promise(r => { scrollTo(0, document.scrollingElement.scrollHeight); requestAnimationFrame(() => requestAnimationFrame(r)); }));

const sections = [];
const section = (n, f) => sections.push([n, f]);

section('cache', async () => {
  const swf = fs.readFileSync(path.join(path.dirname(PAGE), 'sw.js'), 'utf8');
  const b = (SRC.match(/const APP_BUILD='([^']+)'/) || [])[1], c = (swf.match(/const CACHE = '([^']+)'/) || [])[1];
  ok(!!b && b === c && +(b.match(/v(\d+)$/) || [])[1] >= 124, 'cache: APP_BUILD = sw.js CACHE, v124 or later', { b, c });
  const ver = (/window\.FW = \{ version: '(\d+)'/.exec(SRC) || [])[1];
  ok(+ver >= 9, 'cache: fred world v9 or later (FW.version ' + ver + ')', ver);
});

section('place', async () => {
  const x = await openH({ query: '?sky=sun', dpr: 2 }), p = x.p; await ready(p, 'live', 'sun'); /* (dpr 2: at 1 a 1.5 px border is drawn and computed as 1 px) */
  const g = await p.evaluate(() => { const W = document.getElementById('planSky'), T = document.getElementById('rideSec'), S = document.getElementById('planSetBox'), cs = getComputedStyle(W), r = W.getBoundingClientRect();
    const fol = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING), sc = W.querySelector(':scope>.rwx-scene'), scs = sc && getComputedStyle(sc);
    const own = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch (e) { return []; } }).flatMap(function f(r) { return [...(r.selectorText ? [r] : []), ...[...(r.cssRules || [])].flatMap(f)]; }) /* (a style rule has cssRules too: nesting) */.filter(r => r.selectorText && /#planSky\b/.test(r.selectorText) && !/#planSky[ >.:[]/.test(r.selectorText.replace(/#planSky\[hidden\]/, '')));
    return { order: fol(T, W) && fol(W, S), screen: T.getBoundingClientRect().bottom <= r.top + 1 && r.bottom <= S.getBoundingClientRect().top + 1, bg: cs.backgroundColor, bw: cs.borderTopWidth, bs: cs.borderTopStyle, bc: cs.borderTopColor, setbc: getComputedStyle(S).borderTopColor,
      rad: cs.borderTopLeftRadius, setbw: getComputedStyle(S).borderTopWidth, ol: getComputedStyle(document.documentElement).getPropertyValue('--ol').trim(), decl: own.map(r => (/border:([^;]*)/.exec(r.style.cssText) || [])[1]).filter(Boolean), rp: getComputedStyle(document.documentElement).getPropertyValue('--r-panel').trim(), minh: cs.minHeight, h: r.height, heightRule: own.map(r => r.style.height).filter(Boolean), inline: W.getAttribute('style'),
      mask: scs && (scs.maskImage || scs.webkitMaskImage), scene: !!sc, fwwx: document.querySelectorAll('.fw-wx').length, wxSky: typeof FW.wxSky }; });
  ok(g.order && g.screen, '100.1: the box sits between the ride ticket and Settings (in the page and on the screen)', g);
  ok(g.bg === 'rgb(255, 255, 255)' && g.ol === '1.5px' && g.decl.some(v => /var\(--ol\)/.test(v)) && g.bw === g.setbw && g.bs === 'solid' && g.bc === g.setbc && g.rad === g.rp && g.rp === '20px', '100.1: a plain Plan box: white, a 1.5 px outline (var(--ol), 1.5px: drawn as the Settings box\'s, ' + g.bw + ', in its colour ' + g.setbc + '), the panel radius (var(--r-panel))', g);
  ok(parseFloat(g.minh) >= 100 && !g.heightRule.length && !g.inline, '100.1, QA: a minimum height, never a fixed one (no height in its rules, none inline)', g);
  ok(g.scene && /gradient/.test(g.mask || '') && !g.fwwx && g.wxSky === 'undefined', '100.1: its sky is item 87\'s masked .rwx-scene layer; the bundle\'s forecast sky is not used (no .fw-wx; FW has no wxSky)', g);
  await x.close();
  // grows with the text: 320 px at 200% (the line wraps beside fred)
  const y = await openH({ query: '?sky=sun', width: 320, height: 568, scale: 2 }); await ready(y.p, 'live', 'sun');
  const h = await y.p.evaluate(() => { const W = document.getElementById('planSky'); return { h: W.getBoundingClientRect().height, min: parseFloat(getComputedStyle(W).minHeight) }; });
  ok(h.h > h.min + 10, '100.1, QA: at 320 px and 200% text the box is taller than its minimum (it grows: not a fixed height)', h);
  await y.close();
});

section('looks', async () => {
  for (const k of ['sun', 'rain', 'snow', 'freeze', 'night']) {
    const x = await openH(k === 'night' ? { motion: true } : { query: '?sky=' + k, motion: true }), p = x.p;
    if (k === 'night') { await p.click('#locRow'); await until(() => p.evaluate(() => document.getElementById('planSheet').classList.contains('open'))); await p.fill('#startTime', '20:00'); await p.dispatchEvent('#startTime', 'change'); await p.click('#psAct'); }
    await ready(p, 'live', k); const B = await boxOf(p);
    const line = k === 'night' ? /^Thu 8:00 PM · Carmel · \d+°$/ : LINE;
    ok(B.on && B.wx === 'live' && (k === 'night' ? !B.sky && !B.layer : B.sky === k && B.gsky === k && B.layer === k) && B.look === k && B.key === 'wx:' + k && B.same && (k === 'night' ? B.still === true : B.still === false),
      '100.1-2: ' + k + ': the box\'s sky is the forecast\'s (' + (k === 'night' ? 'none on a clear night' : k) + ') and fred is dressed for it as on the weather card (wx:' + k + ', FW.bird of FW.WX_WEAR.' + k + (k === 'night' ? ', still' : '') + ')', B);
    ok(line.test(B.line || '') && B.whole, '100.1: ' + k + ': one line, time · place · temperature ("' + B.line + '"), the box\'s only words', B);
    if (k === 'sun') { await crunch(p); const t = await p.evaluate(() => { const e = document.querySelector('#rWeather .rwx-temp'); return e && e.textContent.trim(); });
      ok(!!t && t === B.num, '100.1: the line\'s number is the weather card\'s (the forecast at the start: ' + B.num + ' and ' + t + ')', { box: B.num, card: t }); }
    await x.close(); }
});

section('nofc', async () => {
  const cap = (B, what, line = LINE0) => ok(B.on && B.wx === 'none' && !B.sky && !B.gsky && !B.layer && B.look === 'clouds' && B.key === 'wx:clouds' && B.same && line.test(B.line || '') && B.whole && !B.num && !/\d+°/.test(B.line || ''),
    '100.2, QA: ' + what + ': fred in his cap (FW.bird with no wear: wx:clouds), no sky, no number ("' + B.line + '")', B);
  { const x = await openH({ forecast: false }); await ready(x.p, 'none', 'clouds'); cap(await boxOf(x.p), 'no forecast'); await x.close(); }
  { const x = await openH({ route: (r, u) => u.startsWith('https://geocoding-api.open-meteo.com/v1/search') ? r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"results":[]}' }) : null });
    await until(async () => (await reqs(x.p)).length > 0, 8000); await sleep(800); await ready(x.p, 'none', 'clouds'); cap(await boxOf(x.p), 'no place the lookup can find'); await x.close(); }
  // offline: the page loaded again with the device offline: no request at all, the cap
  { const x = await openH({ forecast: false }); await x.ctx.setOffline(true); await reload(x.p); await sleep(1500);
    const L = await reqs(x.p), on = await x.p.evaluate(() => navigator.onLine); await ready(x.p, 'none', 'clouds');
    ok(on === false && L.length === 0, '100.2: offline: the box asks for no forecast (no request)', { on, L }); cap(await boxOf(x.p), 'offline'); await x.close(); }
  // a failing network with a forecast saved earlier (fetchWeather's cache): a saved forecast is not a live one
  { let mode = 'live'; const x = await openH({ forecast: false, route: (r, u) => mode === 'live' ? WX(r, u) : /open-meteo|weather\.gov/.test(u) ? r.fulfill({ status: 500, body: 'down' }) : null });
    await ready(x.p, 'live', null); mode = 'fail'; await reload(x.p); await until(async () => (await reqs(x.p)).length > 0, 8000); await sleep(1000); await ready(x.p, 'none', 'clouds');
    const st = await x.p.evaluate(() => !!(window.__q100.wxLast && window.__q100.wxLast.stale));
    ok(st, 'nofc: the failing lookup fell back on the forecast saved earlier (fetchWeather\'s cache: wxLast.stale)', st); cap(await boxOf(x.p), 'a failing network (a saved forecast from the cache)'); await x.close(); }
  // a ride 11 or more days out: typical weather only, which the box does not show as a forecast (and does not look up)
  { const x = await openH(), p = x.p; await ready(p, 'live', null); await sleep(400); const a = kinds(await reqs(p));
    await sheet(p, () => setField(p, '#wxDate', '2026-11-13')); await sleep(1500); await ready(p, 'none', 'clouds'); const b = kinds(await reqs(p));
    ok(b.all === a.all, '100.2: a ride 15 days out (typical weather only): the box asks for nothing (no forecast, no archive)', { a, b });
    cap(await boxOf(p), 'a ride 15 days out (typical weather only)', /^Fri 8:00\sAM · Carmel$/); await x.close(); }
});

section('fetch', async () => {
  // a lookup when Plan opens; nothing more on tab switches, the app back in front, or Crunch (its own lookup finds the same forecast)
  { const x = await openH(), p = x.p; await ready(p, 'live', null); await sleep(500); const a = kinds(await reqs(p));
    ok(a.geo === 1 && a.fc === 1, '100.2: the forecast is looked up when Plan opens (one place search, one forecast)', a);
    for (let k = 0; k < 8; k++) { await tab(p, 'journal'); await tab(p, 'plan'); } await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(800);
    const b = kinds(await reqs(p)); ok(b.all === a.all, '100.2: no request storm: 8 tab switches and the app back in front ask for nothing more', { a, b });
    await crunch(p); await sleep(300); const c = kinds(await reqs(p)); ok(c.all === a.all, '100.2: Crunch uses the box\'s forecast (the same fetchWeather key and cache: no request)', { a, c });
    await x.close(); }
  // an hour-old forecast is looked up again when Plan opens, once
  { const x = await openH(), p = x.p; await ready(p, 'live', null); await sleep(500); const a = kinds(await reqs(p));
    await p.evaluate(() => { window.__q100.wxLast.checkedAt -= 61 * 60e3; const T = window.__q100.skyBoxFetch.t || {}; Object.keys(T).forEach(k => { T[k] -= 61 * 60e3; }); }); /* an hour on: the forecast and the box's own last try both an hour old */ await tab(p, 'journal'); await tab(p, 'plan'); await sleep(1500);
    for (let k = 0; k < 4; k++) { await tab(p, 'journal'); await tab(p, 'plan'); } await sleep(500); const b = kinds(await reqs(p));
    ok(b.fc === a.fc + 1, '100.2: the hour-old rule (Crunch\'s): a forecast over an hour old is looked up again when Plan opens, once', { a, b }); await x.close(); }
  // a failing network: one try; no more from the Plan for 10 minutes; then one
  { const x = await openH({ forecast: false, route: (r, u) => /open-meteo|weather\.gov/.test(u) ? r.fulfill({ status: 500, body: 'down' }) : null }), p = x.p;
    await until(async () => (await reqs(p)).length > 0, 8000); await sleep(1000); const a = kinds(await reqs(p));
    for (let k = 0; k < 8; k++) { await tab(p, 'journal'); await tab(p, 'plan'); } await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(800); const b = kinds(await reqs(p));
    await p.evaluate(() => { const T = window.__q100.skyBoxFetch.t || {}; Object.keys(T).forEach(k => { T[k] -= 10 * 60e3 + 1000; }); }); await tab(p, 'journal'); await tab(p, 'plan'); await sleep(1200); const c = kinds(await reqs(p));
    ok(a.all >= 1 && b.all === a.all && c.all > b.all && c.geo === a.geo + 1, '100.2: a failing network: one try when Plan opens, none on 8 tab switches and the app back in front, one again after 10 minutes', { a, b, c }); await x.close(); }
  // a Crunch while the box's lookup is still out: it waits for it (one place search, one forecast)
  { const slow = (r, u) => /open-meteo/.test(u) ? new Promise(res => setTimeout(() => res(WX(r, u)), 1200)) : null; /* (two requests in turn: under the 4 s a Crunch waits) */
    const x = await openH({ forecast: false, route: slow, settle: 100 }), p = x.p; await until(async () => (await reqs(p)).length > 0, 5000);
    await p.click('#calcBtn'); await until(() => p.evaluate(() => getComputedStyle(document.getElementById('results')).display !== 'none'), 20000); await sleep(500);
    const a = kinds(await reqs(p)); ok(a.geo === 1 && a.fc === 1, '100.2: a Crunch during the box\'s lookup waits for it: one place search and one forecast in all', a); await x.close(); }
  // a Crunch during the box's failing lookup: Crunch tries again itself and says so (check round 1)
  { const bad = (r, u) => /open-meteo/.test(u) ? new Promise(res => setTimeout(() => res(r.fulfill({ status: 500, body: 'down' })), 1500)) : null;
    const x = await openH({ forecast: false, route: bad, settle: 100 }), p = x.p; await until(async () => (await reqs(p)).length > 0, 5000); await p.click('#calcBtn'); await shown(p); await sleep(300);
    const a = kinds(await reqs(p)), note = await p.evaluate(() => { const o = document.getElementById('wxOut'); return getComputedStyle(o).display !== 'none' ? o.textContent : ''; });
    ok(a.geo === 2 && /Couldn't get the forecast/.test(note), '100.2: a Crunch during the box\'s failing lookup tries again itself (a second place search) and shows its note', { a, note }); await x.close(); }
  // no lookup while the Plan sheet is open (each edit would be one); one after Done (check round 1)
  { const x = await openH(), p = x.p; await ready(p, 'live', null); await sleep(400); const a = kinds(await reqs(p));
    await p.click('#locRow'); await until(() => p.evaluate(() => document.getElementById('planSheet').classList.contains('open')));
    for (const t of ['09:00', '10:00', '11:00']) { await setField(p, '#startTime', t); await sleep(500); } const b = kinds(await reqs(p));
    await p.click('#psAct'); await until(() => p.evaluate(() => !document.getElementById('planSheet').classList.contains('open'))); await sleep(1500); const c = kinds(await reqs(p));
    ok(b.all === a.all && c.geo === a.geo + 1 && c.fc === a.fc + 1, '100.2: the Plan sheet open, three start times: no lookup; Done: one (a place search and a forecast)', { a, b, c }); await x.close(); }
});

section('keep', async () => {
  // a day changed and back: the first day's forecast again (the box's own copy, under an hour old), no new lookup
  { const x = await openH({ query: '?sky=sun' }), p = x.p; await ready(p, 'live', 'sun'); await sleep(400);
    await sheet(p, () => setField(p, '#wxDate', '2026-10-31')); await until(async () => { const B = await boxOf(p); return B.wx === 'live' && /^Sat /.test(B.line || ''); }, 10000); await sleep(400); const b = kinds(await reqs(p));
    await sheet(p, () => setField(p, '#wxDate', '2026-10-29')); await sleep(1500); const B = await boxOf(p), c = kinds(await reqs(p));
    ok(B.on && B.wx === 'live' && B.look === 'sun' && B.sky === 'sun' && LINE.test(B.line || '') && c.all === b.all, '100.2: a day changed and back: the box shows the first day\'s forecast again (live, its sky and number), no new lookup', { B, b, c });
    // Crunch, then Save to Journal (planReset): the box is back with the forecast
    await crunch(p); const n = kinds(await reqs(p)); await p.click('#journalBtn'); await sleep(1500); await tab(p, 'journal'); await tab(p, 'plan'); await sleep(800); const S = await boxOf(p), m = kinds(await reqs(p));
    ok(S.on && S.wx === 'live' && S.look === 'sun' && S.sky === 'sun' && LINE.test(S.line || '') && m.all === n.all, '100.2: Crunch, then Save to Journal: the box is back with the forecast (live, its sky and number), no new lookup', { S, n, m });
    // offline after a live forecast: the cap (100.2); online again: the sky and number back
    await x.ctx.setOffline(true); await p.evaluate(() => dispatchEvent(new Event('offline'))); await ready(p, 'none', 'clouds'); const O = await boxOf(p), o = kinds(await reqs(p));
    ok(O.on && !O.sky && !O.num && LINE0.test(O.line || '') && o.all === m.all, '100.2: offline after a live forecast this session: fred in his cap, no sky, no number, no request', { O, o });
    await x.ctx.setOffline(false); await p.evaluate(() => dispatchEvent(new Event('online'))); await ready(p, 'live', 'sun'); const N = await boxOf(p);
    ok(N.sky === 'sun' && LINE.test(N.line || ''), '100.2: back online: the sky and number again', N); await x.close(); }
  // the computer layout: + New ride
  { const x = await openH({ query: '?sky=sun', width: 1280, height: 800 }), p = x.p; await ready(p, 'live', 'sun'); await crunch(p); const n = kinds(await reqs(p));
    await p.click('button[data-dk=newride]:visible'); await sleep(1500); const S = await boxOf(p), m = kinds(await reqs(p));
    ok(S.on && S.wx === 'live' && S.sky === 'sun' && LINE.test(S.line || '') && m.all === n.all, '100.2: the computer layout, Crunch then + New ride: the box is back with the forecast, no new lookup', { S, n, m }); await x.close(); }
});

section('race', async () => {
  // the box's lookup of the 8:00 ride held 5 s, answered or failing; meanwhile 9:00 is set and Crunched; then a redraw with no lookup
  for (const how of ['ok', 'fail']) {
    let n = 0; const route = (r, u) => /api\.open-meteo\.com\/v1\/forecast/.test(u) ? (n++ === 0 ? new Promise(res => setTimeout(() => res(how === 'ok' ? WX(r, u) : r.fulfill({ status: 500, body: 'down' })), 5000)) : WX(r, u)) : null;
    const x = await openH({ route, settle: 200 }), p = x.p; await until(async () => kinds(await reqs(p)).fc >= 1, 8000);
    await sheet(p, () => setField(p, '#startTime', '09:00')); await crunch(p);
    const card = () => p.evaluate(() => document.getElementById('rWeather').textContent.replace(/\s+/g, ' ').trim()), c0 = await card(); await sleep(6000);
    await p.evaluate(() => document.getElementById('prowBtn-heatadj').click()); await sleep(800); /* (recrunchQuiet: the card drawn again from the shared forecast) */
    const s = await p.evaluate(() => { const Q = window.__q100; return { key: Q.wxKey, cur: Q.wxReq().key, start: Q.wxLast && Q.wxLast.startMin }; }), c1 = await card();
    ok(s.key === s.cur && s.start === 540 && c1 === c0, '100.2: the box\'s late lookup of the old ride (' + how + ') leaves the Crunched ride\'s forecast (wxKey, wxLast, the card after a redraw)', { s, c0: c0.slice(0, 90), c1: c1.slice(0, 90) });
    await x.close(); }
  // the network hangs while the box asks, and is back before Crunch: results promptly (main: 0.2 s)
  { let answer = false; const held = []; const route = (r, u) => /open-meteo/.test(u) ? (answer ? WX(r, u) : new Promise(res => held.push(() => res(r.abort())))) : null;
    const x = await openH({ route, settle: 200 }), p = x.p; await sleep(2500); answer = true; const t0 = Date.now(); await p.click('#calcBtn'); const done = await shown(p), ms = Date.now() - t0;
    ok(!!done && ms < 8000, '100.2: the box\'s lookup hung, the network back: Crunch shows results within 8 s (' + ms + ' ms: it waits at most 4 s on the box\'s lookup)', { ms, held: held.length });
    held.forEach(f => f()); await x.close(); }
  // the ride changed while the box's lookup is out (held 4 s): the new ride's forecast, nothing else happening; back to 8:00: asked again
  { let n = 0; const route = (r, u) => /api\.open-meteo\.com\/v1\/forecast/.test(u) ? (n++ === 0 ? new Promise(res => setTimeout(() => res(WX(r, u)), 4000)) : WX(r, u)) : null;
    const x = await openH({ route, settle: 200 }), p = x.p; await until(async () => kinds(await reqs(p)).fc >= 1, 8000);
    await sheet(p, () => setField(p, '#startTime', '09:00')); const B = await until(async () => { const b = await boxOf(p); return b.wx === 'live' && /^Thu 9:00\sAM · Carmel · \d+°$/.test(b.line || '') && b; }, 12000);
    ok(!!B, '100.2: the ride changed while the box\'s lookup was out: the box gets the new ride\'s forecast with nothing else happening', B || await boxOf(p));
    await sheet(p, () => setField(p, '#startTime', '08:00')); const C = await until(async () => { const b = await boxOf(p); return b.wx === 'live' && LINE.test(b.line || '') && b; }, 8000);
    ok(!!C, '100.2: back to the first ride (its try overtaken, not failed): it is asked again and shown', C || await boxOf(p)); await x.close(); }
});

section('once', async () => {
  const x = await openH({ query: '?sky=sun', motion: true }), p = x.p; await ready(p, 'live', 'sun');
  ok(J(await freds(p)) === J(['planSky']), 'once: before Crunch fred is in the box only', await freds(p));
  await p.evaluate(() => { const R = window.__q100f = { max: 0, n: 0, on: true }; const tick = () => { if (!R.on) return; const n = [...document.querySelectorAll('.rwx-fred')].filter(f => !f.classList.contains('rwx-out') && f.getClientRects().length && f.querySelector('svg')).length; R.max = Math.max(R.max, n); R.n++; requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  await crunch(p); await sleep(2500); const R = await p.evaluate(() => { window.__q100f.on = false; return window.__q100f; });
  const B = await boxOf(p), F = await freds(p);
  ok(!B.on && F.length === 1 && F[0] === 'rWeather' && R.max <= 1 && R.n > 30, '100.3, QA: after Crunch the box is out and one fred is on the page (the weather card\'s), in every frame of the Crunch (' + R.n + ' frames)', { B: B.on, F, R });
  // the run's results: the box out too; then results gone (the sport changed): the box back, one fred
  await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=run]'); await sleep(800);
  const B2 = await boxOf(p); ok(B2.on && J(await freds(p)) === J(['planSky']), '100.3: the results gone (the sport changed), the box is back with its fred, the only one', { on: B2.on, f: await freds(p) });
  await crunch(p); await sleep(1500); const F3 = await freds(p), B3 = await boxOf(p);
  ok(!B3.on && F3.length <= 1 && !F3.includes('planSky'), '100.3: after the run\'s Crunch the box is out too (fred at most once)', { F3, on: B3.on });
  await x.close();
});

section('desk', async () => {
  const x = await openH({ query: '?sky=sun', width: 1280, height: 800 }), p = x.p; await ready(p, 'live', 'sun');
  const g = await p.evaluate(() => { const W = document.getElementById('planSky').getBoundingClientRect(), T = document.getElementById('rideSec').getBoundingClientRect(), U = document.getElementById('planCrew');
    return { dk: document.documentElement.classList.contains('dk'), under: W.top >= T.bottom - 1 && Math.abs(W.left - T.left) < 2 && Math.abs(W.width - T.width) < 2, col: getComputedStyle(document.getElementById('planSky').closest('#view-plan>*')).gridColumnStart, crew: getComputedStyle(U).display }; });
  ok(g.dk && g.under, '100.3: the computer layout: the box sits under the ticket in the Plan-a-ride column', g);
  ok(g.crew === 'none', '100.4: the crew is not on the computer layout', g);
  await crunch(p); await sleep(800);
  const h = await p.evaluate(() => { const R = document.getElementById('results').getBoundingClientRect(), W = document.getElementById('planSky'); return { res: R.width > 0 && R.right < document.getElementById('rideSec').getBoundingClientRect().left, out: W.hidden && getComputedStyle(W).display === 'none' }; });
  ok(h.res && h.out && !(await freds(p)).includes('planSky'), '100.3: with Results shown beside it the box is out', h);
  await x.close();
});

section('crew', async () => {
  const want = fiveOf(2026, 10, 29);
  const x = await openH(), p = x.p; await until(async () => (await crewOf(p)).art === 5);
  const c = await crewOf(p), g = await p.evaluate(() => { const U = document.getElementById('planCrew'), F = document.querySelector('#view-plan>.fredfoot');
    const bg = e => getComputedStyle(e).backgroundColor, ids = [...document.querySelectorAll('[id]')].map(e => e.id), dup = ids.filter((v, i) => ids.indexOf(v) !== i);
    const per = [...U.querySelectorAll('.crew-f')].map(li => { const i = +li.dataset.i, s = li.querySelector('.crew-a svg'), b = FW.box(FW.friend(i)), w = s.getBoundingClientRect().width, a = li.querySelector('.crew-a'), r = window.__q100.FWM.get(a);
      return { i, body: w * 200 / b.w, ids: [...s.querySelectorAll('[id]')].map(e => e.id), key: r && r.k, cls: a.className, d: a.style.getPropertyValue('--fw-d') }; });
    return { next: F.nextElementSibling === U, bg: [bg(U), ...[...U.children].map(bg)], per, dup }; });
  ok(c.on && J(c.ids) === J(want), '100.4: today\'s five friends (Thu Oct 29: ' + want.join(', ') + ' by the rule: the local date as a day number, five from 5 x day round the 19)', c.ids);
  ok(g.next && g.bg.every(b => b === 'rgba(0, 0, 0, 0)'), '100.4: after the "Planning tool, not medical advice" footer (the next thing after it), on the page background (no band)', g);
  const bodies = g.per.map(r => r.body);
  ok(Math.max(...bodies) - Math.min(...bodies) < 0.5, '100.4: one body size (each friend at its FW.box width at the body\'s scale: ' + bodies.map(b => b.toFixed(1)).join(' / ') + ' px)', g.per.map(r => [r.i, r.body]));
  ok(g.per.every(r => r.ids.length && r.ids.every(id => id.startsWith('cw' + r.i + '-')) && r.key === 'crew:' + r.i && /\bfwm\b/.test(r.cls) && /\bfw-vm0\b/.test(r.cls)) && !g.dup.length, 'crew: each friend a kept fwMount spot (crew:<i>) with its own id prefix (cw<i>-), fw-vm0; no id twice on the page', { per: g.per.map(r => [r.i, r.key, r.ids[0], r.cls]), dup: g.dup.slice(0, 5) });
  await reload(p); await until(async () => (await crewOf(p)).art === 5); const c2 = await crewOf(p);
  ok(J(c2.ids) === J(want), 'crew: the same five on a second load', c2.ids);
  const rule = await p.evaluate(() => { const Q = window.__q100, L = []; for (let d = 20000; d < 20400; d++) L.push(Q.crewOf(d)); return L; });
  const robs = rule.filter(L => L.includes(9) && L.includes(17)).length, five = rule.every(L => new Set(L).size === 5);
  let cyc = true; for (let s = 0; s + 19 <= rule.length; s++) { const n = new Array(19).fill(0); rule.slice(s, s + 19).forEach(L => L.forEach(i => n[i]++)); if (n.some(v => v !== 5)) { cyc = false; break; } }
  ok(five && !robs && cyc, '100.4: over 400 days: five different friends each day, never both Robs (9 and 17), every friend on 5 days in every 19 (comes round regularly)', { five, robs, cyc });
  await x.close();
  for (const [now, y, m, d] of [['2026-10-29T08:00:00-07:00', 2026, 10, 29], ['2026-10-29T23:30:00-07:00', 2026, 10, 29], ['2026-10-30T08:00:00-07:00', 2026, 10, 30]]) {
    const z = await openH({ now }); await until(async () => (await crewOf(z.p)).art === 5); const k = await crewOf(z.p);
    ok(J(k.ids) === J(fiveOf(y, m, d)), 'crew: at ' + now + ' (local) the five of that date (' + fiveOf(y, m, d).join(', ') + ')' + (d === 30 ? ': another five the next day' : ': the same all day'), k.ids); await z.close(); }
  // a new day while the app stays open: back in front, the next day's five (no reload, no tab tap; check round 1)
  { const z = await openH(), p = z.p; await until(async () => (await crewOf(p)).art === 5);
    await p.evaluate(() => { const D = Date; globalThis.Date = class extends D { constructor(...a) { super(...(a.length ? a : [D.now() + 864e5])); } static now() { return D.now() + 864e5; } }; document.dispatchEvent(new Event('visibilitychange')); });
    const k = await until(async () => { const c = await crewOf(p); return J(c.ids) === J(fiveOf(2026, 10, 30)) && c.art === 5 && c; }, 5000);
    ok(!!k, 'crew: a new day while the app stays open: back in front, the next day\'s five (' + fiveOf(2026, 10, 30).join(', ') + ')', k || await crewOf(p)); await z.close(); }
});

section('motion', async () => {
  const x = await openH({ query: '?sky=freeze', motion: true, width: 430, height: 932, settle: 50 }), p = x.p;
  const R = await p.evaluate(() => new Promise(res => { const t0 = performance.now(), R = { max: 0, go: {}, per: {}, delays: {}, end: null };
    const look = () => { const A = document.getAnimations().filter(a => a.playState === 'running' && /^fw-/.test(a.animationName || '')); R.max = Math.max(R.max, A.length);
      document.querySelectorAll('#planCrew .crew-a').forEach(a => { const i = a.parentElement.dataset.i; if (a.classList.contains('fwm-go')) R.go[i] = 1; const mine = A.filter(x => a.contains(x.effect.target)); R.per[i] = Math.max(R.per[i] || 0, mine.length);
        mine.forEach(x => { if (x.animationName === 'fw-ch-bob') R.delays[i] = Math.round(x.effect.getTiming().delay); }); });
      if (performance.now() - t0 < 9500) setTimeout(look, 100); else { R.end = { running: A.length, go: document.querySelectorAll('.fwm-go').length }; res(R); } };
    setTimeout(look, 50); }));
  const B = await boxOf(p), blinks = [1, 2, 13];
  ok(Object.keys(R.go).length === 5, 'round rule a: each friend moves when first seen (fwm-go on all five)', R.go);
  ok(Object.entries(R.per).every(([i, n]) => n <= (blinks.includes(+i) ? 2 : 1)), 'motion: offset without adding loops (fw-vm0 and --fw-d): each friend runs at most its bob (and a blink for 1, 2 and 13)', R.per);
  ok(new Set(Object.values(R.delays)).size >= 3, 'motion: the friends do not bob in step (--fw-d offsets: their bob phases differ)', R.delays);
  ok(R.max <= 30 && B.look === 'freeze', 'budget: at most 30 running fred world animations on the screen, fred in his busiest look (freeze) and the five friends (' + R.max + ')', R.max);
  ok(R.end.running === 0 && R.end.go === 0, 'round rule a: all still by 9.5 s (no running fred world animation, no .fwm-go)', R.end);
  // they move again only when what they show changes: Journal and back, a resize, the app back in front: still, the same drawings (check round 1)
  const SPOTS = '#planCrew .crew-a>svg, #planSky>.rwx-fred:not(.rwx-out)>svg';
  await p.evaluate(S => { window.__q100svg = [...document.querySelectorAll(S)]; }, SPOTS);
  await tab(p, 'journal'); await tab(p, 'plan'); await p.evaluate(() => { dispatchEvent(new Event('resize')); document.dispatchEvent(new Event('visibilitychange')); });
  const A = await p.evaluate(S => new Promise(res => { let go = 0, run = 0; const t0 = performance.now(); const look = () => { go = Math.max(go, document.querySelectorAll('.fwm-go').length); run = Math.max(run, document.getAnimations().filter(a => a.playState === 'running' && /^fw-/.test(a.animationName || '')).length);
    if (performance.now() - t0 < 1500) setTimeout(look, 50); else { const now = [...document.querySelectorAll(S)]; res({ go, run, n: now.length, same: now.length === window.__q100svg.length && now.length === 6 && now.every((s, i) => s === window.__q100svg[i]) }); } }; look(); }), SPOTS);
  ok(A.go === 0 && A.run === 0 && A.same, 'round rule a: back on Plan (Journal and back), a resize and the app back in front: nothing moves again, each spot keeps its drawing (the same svg nodes: fred and the five)', A);
  await x.close();
  for (const [what, o] of [['Reduce Motion', { motion: false }], ['Animate the world off', { motion: true, settings: { worldMotion: false } }]]) {
    const y = await openH(Object.assign({ query: '?sky=sun', width: 430, height: 932, settle: 50 }, o)); const s = await y.p.evaluate(() => new Promise(res => { let go = 0, run = 0, n = 0; const t0 = performance.now();
      const look = () => { go = Math.max(go, document.querySelectorAll('.fwm-go').length); run = Math.max(run, document.getAnimations().filter(a => a.playState === 'running' && /^fw-/.test(a.animationName || '')).length); n++; if (performance.now() - t0 < 3000) setTimeout(look, 100); else res({ go, run, n, rm: [...document.querySelectorAll('#planCrew .crew-a, #planSky>.rwx-fred')].every(a => a.classList.contains('fw-rm')), art: document.querySelectorAll('#planCrew .crew-a svg').length }); }; look(); }));
    ok(s.go === 0 && s.run === 0 && s.rm && s.art === 5, 'motion: ' + what + ': the crew and the box\'s fred are still (no .fwm-go, nothing running, .fw-rm on each spot)', s); await y.close(); }
});

section('room', async () => {
  for (const [w, h] of [[320, 568], [375, 667], [390, 844], [430, 932]]) for (const sc of [1, 1.5, 2]) {
    const x = await openH({ width: w, height: h, scale: sc, settings: { crewNames: true } }), p = x.p; await until(async () => (await crewOf(p)).art === 5); await endScroll(p);
    const g = await p.evaluate(() => { const U = document.getElementById('planCrew').getBoundingClientRect(), T = document.querySelector('nav.tabs').getBoundingClientRect(), F = document.querySelector('#view-plan>.fredfoot').getBoundingClientRect();
      const sb = document.querySelector('#view-plan>.fredfoot>.footlink'); let sr = sb.getBoundingClientRect(); if (sr.top < 0 || sr.bottom > innerHeight) { sb.scrollIntoView({ block: 'center' }); sr = sb.getBoundingClientRect(); }
      const at = sr.width && sr.height ? document.elementFromPoint(sr.left + sr.width / 2, sr.top + sr.height / 2) : null, seen = getComputedStyle(sb).display !== 'none' && sr.width > 0 && sr.height > 0 && !!at && sb.contains(at); scrollTo(0, document.scrollingElement.scrollHeight);
      return { shown: !document.getElementById('planCrew').hidden && U.height > 0, gap: Math.round(T.top - U.bottom), foot: Math.round(T.top - F.bottom), seen, sx: document.documentElement.scrollWidth > innerWidth }; });
    ok(g.seen, 'QA: ' + w + ' x ' + h + ', ' + sc * 100 + '% text: the "Planning tool, not medical advice" footer stays, shown and not covered (its link is the element at its own centre)', g);
    ok(g.shown ? g.gap >= 8 && g.foot >= 0 && !g.sx : true, '100.4, QA: ' + w + ' x ' + h + ', ' + sc * 100 + '% text: at the end of the scroll the crew sits ' + g.gap + ' px clear of the tab bar (8 or more), the footer clear of it, no sideways scroll', g);
    ok(g.shown, 'room: ' + w + ' x ' + h + ', ' + sc * 100 + '% text: the crew shows (there is room)', g);
    await x.close(); }
  // no room: a taller tab bar leaves it out; back to its size, it is back. Judged on layout changes, never on a scroll
  const x = await openH(), p = x.p; await until(async () => (await crewOf(p)).art === 5);
  await p.evaluate(() => { const U = document.getElementById('planCrew'); window.__q100fit = 0; U.getBoundingClientRect = function () { window.__q100fit++; return Element.prototype.getBoundingClientRect.call(this); }; });
  await p.evaluate(() => new Promise(res => { let y = 0; const H = document.scrollingElement.scrollHeight; const step = () => { y += 40; scrollTo(0, y); if (y < H) requestAnimationFrame(step); else { scrollTo(0, 0); requestAnimationFrame(() => requestAnimationFrame(res)); } }; requestAnimationFrame(step); }));
  const fs0 = await p.evaluate(() => window.__q100fit);
  await p.evaluate(() => { const s = document.createElement('style'); s.id = 'q100tall'; s.textContent = 'nav.tabs{min-height:126px!important}'; document.head.append(s); }); await sleep(400); await endScroll(p);
  const a = await p.evaluate(() => { const U = document.getElementById('planCrew'); return { hidden: U.hidden, disp: getComputedStyle(U).display, room: U.dataset.room, fit: window.__q100fit }; });
  await p.evaluate(() => document.getElementById('q100tall').remove()); await sleep(400);
  const b = await p.evaluate(() => { const U = document.getElementById('planCrew'); return { hidden: U.hidden, room: U.dataset.room }; });
  ok(fs0 === 0 && a.fit > 0, 'room: judged on layout changes, never on a scroll (no measure in ' + 'a scroll to the end and back; one when the tab bar changed)', { scroll: fs0, after: a.fit });
  ok(a.hidden && a.disp === 'none' && +a.room < 8 && !b.hidden && +b.room >= 8, '100.4: no room (a tab bar 70 px taller, as larger text could make it): the crew is left out; room again: it is back', { a, b });
  await x.close();
  // at the edge (check round 1): the tab bar grown until 4 px of room are left: left out; 9 px: shown, at least 8 px clear
  for (const [want, on] of [[4, false], [9, true]]) {
    const y = await openH({ width: 390, height: 844 }), q = y.p; await until(async () => (await crewOf(q)).art === 5); await endScroll(q);
    let g = null; for (let k = 0; k < 4; k++) { const r = +(await crewOf(q)).room; if (r === want) break; await q.evaluate(d => { const T = document.querySelector('nav.tabs'), h = T.getBoundingClientRect().height + d; let s = document.getElementById('q100edge'); if (!s) { s = document.createElement('style'); s.id = 'q100edge'; document.head.append(s); } s.textContent = 'nav.tabs{box-sizing:border-box!important;min-height:' + h + 'px!important}'; }, r - want); await sleep(400); await endScroll(q); }
    g = await q.evaluate(() => { const U = document.getElementById('planCrew'), r = U.getBoundingClientRect(), T = document.querySelector('nav.tabs').getBoundingClientRect(); return { hidden: U.hidden, room: +U.dataset.room, gap: r.height ? +(T.top - r.bottom).toFixed(1) : null }; });
    ok(g.room === want && (on ? !g.hidden && g.gap >= 8 : g.hidden), '100.4: at the edge: ' + want + ' px of room at the end of the scroll: ' + (on ? 'shown, ' + g.gap + ' px clear of the tab bar' : 'left out'), g);
    await y.close(); }
});

section('theme', async () => {
  const x = await openH({ query: '?sky=rain' }), p = x.p; await ready(p, 'live', 'rain');
  await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=run]'); await until(() => p.evaluate(() => document.documentElement.classList.contains('run-theme'))); await ready(p, 'live', 'rain'); await sleep(300);
  const g = await p.evaluate(() => { const W = document.getElementById('planSky'), bg = W.querySelector('.rwx-bg'), L = document.getElementById('planSkyL'), t = document.createElement('i'); t.style.color = 'var(--wx-c)'; bg.append(t); const c = getComputedStyle(t).color; t.remove();
    const sky = bg && getComputedStyle(bg).backgroundImage, m = /linear-gradient\((?:[^,(]*,\s*)?(color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)\)|rgba?\((\d+), (\d+), (\d+))/.exec(sky || ''), first = m ? (m[2] ? [m[2], m[3], m[4]].map(v => +v * 255) : [m[5], m[6], m[7]].map(Number)) : null;
    const wc = (c.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number), want = wc.map((v, i) => v * .26 + [52, 52, 60][i] * .74);
    return { bg: getComputedStyle(W).backgroundColor, sky, first, wc, want, off: first && want.length === 3 ? Math.max(...first.map((v, i) => Math.abs(v - want[i]))) : null, ink: getComputedStyle(L).color, crew: getComputedStyle(document.getElementById('planCrew')).display }; });
  ok(g.bg === 'rgb(52, 52, 60)' && g.off != null && g.off <= 4 && g.ink === 'rgb(242, 242, 247)', '100.6: the run\'s graphite: the box takes the run\'s panel (#34343C), its sky\'s first stop 26% of the sky in it (within ' + g.off + ' of ' + (g.want || []).map(Math.round).join(', ') + '), the light words', g);
  ok(g.crew === 'none', '100.6 (provisional): the crew is left out on the run\'s graphite', g);
  await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=ride]'); await until(() => p.evaluate(() => !document.documentElement.classList.contains('run-theme'))); await sleep(300);
  ok((await crewOf(p)).on, 'theme: back on the ride the crew shows again', await crewOf(p));
  await x.close();
});

section('switch', async () => {
  const x = await openH(), p = x.p; await toSettings(p);
  const s = await p.evaluate(() => { const g = document.querySelector('#view-profile .sg-fw'), row = id => { const b = document.getElementById(id); return b && { in: g.contains(b), pressed: b.getAttribute('aria-pressed'), label: b.querySelector('.prow-l').textContent, h: b.getBoundingClientRect().height }; };
    const st = JSON.parse(localStorage.getItem('bluebird.settings.v2') || '{}'), Q = window.__q100; return { show: row('prowBtn-crewshow'), names: row('prowBtn-crewnames'), stored: ['crewShow', 'crewNames'].filter(k => k in st || k in Q.settings), def: ['crewShow', 'crewNames'].filter(k => k in Q.DEFAULT_SETTINGS) }; });
  ok(s.show && s.show.in && s.show.label === 'Show the crew' && s.show.pressed === 'true' && s.show.h >= 44, '100.5: Settings › fred world › "Show the crew", on', s.show);
  ok(s.names && s.names.in && s.names.label === 'Show their names' && s.names.pressed === 'false' && s.names.h >= 44, '100.5: Settings › fred world › "Show their names", off', s.names);
  ok(!s.stored.length && !s.def.length, '100.5: neither is stored, nor in DEFAULT_SETTINGS, until tapped (as settings.worldMotion)', s);
  await p.click('#prowBtn-crewnames'); await settle(p, 150); await p.click('#prowBtn-crewshow'); await settle(p, 150);
  const a = await p.evaluate(() => JSON.parse(localStorage.getItem('bluebird.settings.v2'))); await tab(p, 'plan'); const c = await crewOf(p);
  ok(a.crewNames === true && a.crewShow === false && !c.on && c.art === 0, '100.5: a tap stores settings.crewNames / crewShow; the crew off: none shown, no art kept', { st: [a.crewShow, a.crewNames], c });
  await toSettings(p); await p.click('#prowBtn-crewshow'); await settle(p, 150); await tab(p, 'plan'); await until(async () => (await crewOf(p)).art === 5); const d = await crewOf(p);
  ok(d.on && d.names.length === 5, '100.5: on again (with the names on): the crew shows with its names', d);
  await reload(p); await until(async () => (await crewOf(p)).art === 5); const e = await crewOf(p), st = await p.evaluate(() => JSON.parse(localStorage.getItem('bluebird.settings.v2')));
  ok(e.on && e.names.length === 5 && st.crewShow === true && st.crewNames === true, 'switch: a reload keeps them', { e, st: [st.crewShow, st.crewNames] });
  await x.close();
});

section('names', async () => {
  const want = fiveOf(2026, 10, 29).map(i => NAMES[i]), word = n => new RegExp('\\b' + n + '\\b');
  { const x = await openH(), p = x.p; await until(async () => (await crewOf(p)).art === 5); const c = await crewOf(p), snap = await p.locator('#view-plan').ariaSnapshot(), body = await p.evaluate(() => document.body.innerText);
    ok(!c.names.length && c.text.trim() === '' && c.hid === 'true' && !want.some(n => word(n).test(snap)) && !want.some(n => word(n).test(body)), '100.5, QA: names off: no name anywhere (the strip, the page\'s text, the accessibility tree)', { c, inSnap: want.filter(n => word(n).test(snap)) });
    await x.close(); }
  for (const [w, h] of [[320, 568], [390, 844], [430, 932]]) for (const sc of [1, 1.5, 2]) {
    const x = await openH({ width: w, height: h, scale: sc, settings: { crewNames: true } }), p = x.p; await until(async () => (await crewOf(p)).art === 5);
    const c = await crewOf(p), g = await p.evaluate(() => { const L = [...document.querySelectorAll('#planCrew .crew-f')].map(li => { const n = li.querySelector('.crew-n'), a = li.querySelector('.crew-a'); const rg = n && document.createRange(); if (rg) rg.selectNodeContents(n); const lines = rg ? new Set([...rg.getClientRects()].filter(q => q.width > .5).map(q => Math.round(q.top))).size : 0;
        return { lines, n: n && n.getBoundingClientRect().toJSON(), a: a.getBoundingClientRect().toJSON(), cut: n ? n.scrollWidth > n.clientWidth + 1 || n.scrollHeight > n.clientHeight + 1 : true, under: n ? n.getBoundingClientRect().top >= a.getBoundingClientRect().bottom - 1 : false }; });
      const hit = (r, q) => r.left < q.right - .5 && q.left < r.right - .5 && r.top < q.bottom - .5 && q.top < r.bottom - .5; let over = 0;
      L.forEach((x, i) => L.forEach((y, j) => { if (i !== j && (hit(x.n, y.n) || hit(x.n, y.a))) over++; }));
      return { broken: L.filter(x => x.lines !== 1).length, cut: L.filter(x => x.cut).length, under: L.every(x => x.under), over, out: L.filter(x => x.n.left < -0.5 || x.n.right > innerWidth + .5).length }; });
    ok(J(c.names) === J(want) && !g.cut && !g.broken && g.under && !g.over && !g.out, '100.5, QA: names on, ' + w + ' px, ' + sc * 100 + '% text: the first name under each friend (' + want.join(', ') + '), none cut or broken over two lines, none over another or past the screen', { names: c.names, g });
    if (w === 390 && sc === 1) { const snap = await p.locator('#planCrew').ariaSnapshot(); ok(want.every(n => snap.includes(n)) && /list/.test(snap), 'names: on, they are real text in the accessibility tree (a list of the names; the art aria-hidden)', snap.slice(0, 300)); }
    await x.close(); }
});

section('sync', async () => {
  const be = new Backend();
  const WHO = { uid: 'u1', email: 'u1@example.com', displayName: 'Test u1' };
  const signedIn = () => ({ '__mock_user': WHO, '__mock_auth': 'u1', 'bluebird.owner.v1': { uid: 'u1', name: WHO.displayName, email: WHO.email, photo: '', signedIn: true } });
  const synced = label => openH({ file: SYNCED, settle: 1200, storage: signedIn(), route: be.handler(label) });
  const doc = () => be.fs.get('users/u1') || {};
  const A = await synced('A'), B = await synced('B');
  for (const x of [A, B]) await until(() => x.p.evaluate(() => { const o = JSON.parse(localStorage.getItem('bluebird.synccursor.v1') || 'null'); return !!(o && o.full); }), 20000);
  await until(() => doc().settings, 15000);
  const priv = await A.p.evaluate(() => { const b = document.querySelector('#view-plan>.fredfoot>.privlink'), r = b && b.getBoundingClientRect(); return !!b && !b.hidden && getComputedStyle(b).display !== 'none' && r.width > 0 && r.height > 0; });
  ok(priv, 'QA: where sign-in is configured, the Plan footer\'s Privacy link shows (the footer the crew follows)', priv);
  const nudge = async (cond, ms = 45000) => { const t = Date.now(); while (Date.now() - t < ms) { for (const x of [A, B]) await x.p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(1500); const v = await cond().catch(() => null); if (v) return v; } return null; };
  await toSettings(A.p); await A.p.click('#prowBtn-crewnames'); await settle(A.p, 200);
  const up = await until(() => (doc().settings || {}).crewNames === true, 20000), at = doc().settingsAt || {};
  ok(!!up && typeof at.crewNames === 'number' && !('crewShow' in (doc().settings || {})), 'sync: A\'s "Show their names" reaches the cloud as its own key (settings.crewNames, one settingsAt stamp; crewShow untouched, not stored)', { s: doc().settings && doc().settings.crewNames, at: Object.keys(at) });
  /* B stays on Plan: once A's value is in B's settings (a pull), B's crew follows it with nothing else happening (the settings applied
     redraw it: no tab tap, no app-open) */
  await B.p.evaluate(() => document.querySelector('nav.tabs button[data-view=plan]').click()); await settle(B.p, 200);
  const got = await nudge(() => B.p.evaluate(() => window.__q100.settings.crewNames === true));
  await sleep(600); const bOk = await crewOf(B.p);
  ok(!!got && bOk.names.length === 5, 'QA: the crew switches sync: B (on Plan) shows the names A turned on as soon as they arrive', bOk);
  await toSettings(B.p); await B.p.click('#prowBtn-crewshow'); await settle(B.p, 200);
  await A.p.evaluate(() => document.querySelector('nav.tabs button[data-view=plan]').click()); await settle(A.p, 200);
  const gotA = await nudge(() => A.p.evaluate(() => window.__q100.settings.crewShow === false)); await sleep(600); const aOff = await crewOf(A.p);
  ok(!!gotA && !aOff.on && aOff.art === 0 && (doc().settings || {}).crewShow === false && typeof (doc().settingsAt || {}).crewShow === 'number', 'QA: B turns the crew off: A\'s crew goes as soon as it arrives (settings.crewShow false in the cloud, its own stamp)', aOff);
  await A.close(); await B.close();
});

async function restore(p, d) {
  await toSettings(p); await p.click('#prowBtn-backup'); await until(() => p.evaluate(() => document.getElementById('setSheet').classList.contains('open')));
  await p.setInputFiles('#backupFile', { name: 'fred-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(d)) });
  await until(() => p.evaluate(() => { const t = document.getElementById('toast'); return !!t && /Restored/.test(t.textContent); }), 10000); await settle(p, 300);
  if (await p.evaluate(() => document.getElementById('setSheet').classList.contains('open'))) { await p.click('#setSheetDone'); await settle(p, 150); }
}
section('backup', async () => {
  const x = await openH({ settings: { crewNames: true } }), ex = await x.p.evaluate(() => JSON.parse(JSON.stringify(window.__q100.backupData()))); await x.close();
  ok(ex.settings && ex.settings.crewNames === true, 'backup: a backup made here carries the switches (backupData().settings.crewNames)', ex.settings && ex.settings.crewNames);
  const y = await openH(), p = y.p; await restore(p, ex); await sleep(400); const r1 = await crewOf(p); /* (before the Plan tab: the restore itself redraws the crew) */
  ok(r1.names.length === 5, 'backup: restored on a fresh page, the names show (the restore redraws the crew)', r1); await tab(p, 'plan');
  const old = JSON.parse(JSON.stringify(ex)); delete old.settings.crewNames; delete old.settings.crewShow; await restore(p, old); await tab(p, 'plan'); await sleep(300);
  const c = await crewOf(p), st = await p.evaluate(() => window.__q100.settings), ls = await p.evaluate(() => JSON.parse(localStorage.getItem('bluebird.settings.v2')));
  ok(c.on && c.names.length === 5 && st.crewNames === true && ls.crewNames === true && !('crewShow' in st), 'backup: a backup without them keeps this device\'s (names on stay on, stored; as the rider, birthday and gender)', { c, st: [st.crewShow, st.crewNames], ls: ls.crewNames });
  await y.close();
  const z = await openH({ settings: { crewShow: false } }), q = z.p; await restore(q, old); await tab(q, 'plan'); await sleep(300); const d = await crewOf(q), sz = await q.evaluate(() => window.__q100.settings);
  ok(!d.on && d.art === 0 && sz.crewShow === false, 'backup: one without them on a device with the crew off: it stays off', { d, crewShow: sz.crewShow });
  await z.close();
});

section('media', async () => {
  const x = await openH({ query: '?sky=sun', settings: { crewNames: true }, dpr: 2 }), p = x.p; await ready(p, 'live', 'sun'); await until(async () => (await crewOf(p)).art === 5);
  const look = () => p.evaluate(() => { const W = document.getElementById('planSky'), d = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).display : 'gone'; };
    const L = document.getElementById('planSkyL');
    return { shadow: getComputedStyle(L).textShadow, room: getComputedStyle(L, '::before').display + ' ' + getComputedStyle(L, '::before').width + ' ' + getComputedStyle(L).paddingRight, box: d('#planSky'), edge: getComputedStyle(W).borderTopWidth + ' ' + getComputedStyle(W).borderTopStyle, fred: d('#planSky>.rwx-fred'), svg: d('#planSky>.rwx-fred>svg'), scene: d('#planSky>.rwx-scene'), crew: d('#planCrew'), art: d('#planCrew .crew-a'), line: d('#planSkyL') }; });
  await p.emulateMedia({ media: 'print' }); const pr = await look(); await p.emulateMedia({ media: 'screen' });
  ok(pr.box !== 'none' && pr.line !== 'none' && pr.fred === 'none' && pr.scene === 'none' && pr.crew === 'none', 'QA print: no sky, no fred, no crew (the box\'s words stay)', pr);
  ok(pr.shadow === 'none' && /^none /.test(pr.room) && / 0px$/.test(pr.room), 'print: the line without its feather (each ring would print as another copy of the words) and without fred\'s room', pr);
  for (const cs of ['light', 'dark']) { await p.emulateMedia({ forcedColors: 'active', colorScheme: cs }); const fc = await look();
    ok(fc.box !== 'none' && / solid$/.test(fc.edge) && parseFloat(fc.edge) >= 1 && (fc.fred === 'none' || fc.svg === 'none') && fc.scene === 'none' && fc.art === 'none', 'QA forced colours (' + cs + '): the art out (fred, the sky, the crew), the box\'s edge kept', fc); }
  await p.emulateMedia({ forcedColors: 'none' }); await x.close();
});

section('fit', async () => {
  for (const place of ['Carmel, IN', 'Indianapolis, IN', 'Mechanicsburg, PA']) for (const [w, h] of [[320, 568], [390, 844]]) for (const sc of [1.5, 2]) {
    const x = await openH({ query: '?sky=rain', width: w, height: h, scale: sc }), p = x.p; await ready(p, 'live', 'rain');
    if (place !== 'Carmel, IN') { await setPlace(p, place); await until(async () => { const B = await boxOf(p); return B.wx === 'live' && B.line.includes(place.split(',')[0]); }, 15000); await sleep(300); }
    const g = await p.evaluate(() => { const W = document.getElementById('planSky'), Wr = W.getBoundingClientRect(), L = document.getElementById('planSkyL'), f = W.querySelector(':scope>.rwx-fred').getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(L);
      const T = [...rg.getClientRects()].filter(r => r.width > .5), bodyL = f.left + f.width * .12, beside = T.filter(r => (r.top + r.bottom) / 2 < f.bottom), right = Math.max(...beside.map(r => r.right)); /* (rows whose middle is above fred's foot: beside him; the rows under him take the box's width) */
      const split = []; const tw = document.createTreeWalker(L, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const re = /\S+/g; let m; while ((m = re.exec(n.data))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); if (new Set([...r.getClientRects()].filter(q => q.width > .5).map(q => Math.round(q.top))).size > 1) split.push(m[0]); } }
      return { line: L.textContent, inside: T.every(r => r.left >= Wr.left && r.right <= Wr.right && r.top >= Wr.top && r.bottom <= Wr.bottom), clear: right <= bodyL + .5, split, fred: f.bottom <= Wr.bottom && f.top >= Wr.top && f.right <= Wr.right, cut: L.scrollWidth > L.clientWidth + 1, sx: document.documentElement.scrollWidth > innerWidth, right: Math.round(right), bodyL: Math.round(bodyL) }; });
    ok(g.inside && g.clear && g.fred && !g.cut && !g.sx && !g.split.length, 'QA: ' + place + ', ' + w + ' px, ' + sc * 100 + '% text: the line wraps inside the box, its rows beside fred clear of him, no word over two rows; fred inside the box; nothing cut, no sideways scroll', g);
    await x.close(); }
});

section('main', async () => {
  if (!MAIN) { console.log('  note: no main page given: the main check is skipped'); return; }
  const x = await open(MAIN, { athlete: 'A', browser, now: NOW, route: WX }), p = x.p;
  const m = await p.evaluate(() => ({ box: !!document.getElementById('planSky'), crew: !!document.getElementById('planCrew') }));
  ok(!m.box && !m.crew, 'main: no sky box and no crew on main (their screens skip there)', m);
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
C.done('item 100: Front page, the sky card and the crew');
