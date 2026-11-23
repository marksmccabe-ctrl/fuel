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
//            text is the line), in the caps style (uppercase), painted over the sky (each of its rows looks different with the line hidden:
//            check round 2), and its number is the weather card's after Crunch; the sky lives (rain and snow: their loops run, as the card's);
//            review round 4: in metric units the number is the forecast's in C and the card's; Units changed in Settings, it follows with
//            no new lookup
//   nofc     100.2, QA: no forecast (the lookup answered by nothing), no place the lookup can find, offline (no request at all), and a
//            saved forecast from the cache (a failing network: the box takes nothing in; Crunch then falls back on it itself, as main), and a
//            ride 11 or more days out (typical weather only: no lookup from the box), a forecast now over an hour old whose new lookup fails
//            (check round 2): fred in his cap (wx:clouds, FW.bird with no wear), no sky,
//            no number; review round 5: opened offline, then the signal back: the online event alone looks up (one place search, one
//            forecast) and the box is live
//   fetch    100.2: the forecast is looked up when Plan opens (on load: one lookup), through Crunch's own (the same key: a Crunch then makes
//            no request); tab switches and the app back in front make no more; an hour-old one is looked up again (once); a failing
//            network: one try, none again from the Plan for 10 minutes, then one; a Crunch during the box's lookup waits for it (one
//            request of each kind); a Crunch during the box's failing lookup tries again itself and shows its note; no lookup while the Plan
//            sheet is open (start times changed three times), one after Done; the box's lookups write no note under the form (#wxOut hidden
//            during a lookup and after a failed one); weather.gov slow (check round 2): past 15 s the box still shows the forecast (live by
//            12 s, the estimate); a Crunch while the box waits on it (6 s, 18 s) adopts the box's lookup (one request of each kind) and is done
//            when that lookup is (weather.gov 8 s at most); review round 3: the line kept in place (no write on a render that changes
//            nothing, a selection on it kept); the 10 minutes held from both sides (none at 9 min 40 s); the box live 7.5-9.5 s after the
//            weather.gov request (its 8 s limit, by the HOOK's stamps); a Crunch 3 s into weather.gov's wait done within 6.5 s, and one 7 s
//            after the box's place search (weather.gov at 18 s) still takes the box's lookup (its 15 s outlasts weather.gov's 8 s); review
//            round 5: the app back in front (a hidden-then-visible pair alone, no tab tap) with the forecast over an hour old: the cap at
//            once, one place search and one forecast, the box live with the new forecast
//   keep     100.2 (check round 1): the box keeps a live forecast it has: a day changed and back, Crunch then Save to Journal, the computer
//            layout's + New ride: live, its sky and number, no new lookup; offline after a live forecast: the cap; online again: the sky back;
//            (check round 2) a forecast saved earlier, the box's lookup at boot failing, the network back: Crunch looks up (a forecast request,
//            no "Saved forecast" note), and the box shows its sky once its 10 minutes are over; (review round 3) a saved forecast Crunch
//            fell back on, the network back, the sport changed (the same key): none within the 10 minutes, then one lookup and the sky
//   race     100.2 (check round 1): the box's slow lookup of the old ride (answered or failing) after the new ride was Crunched leaves the
//            new ride's forecast (wxKey, wxLast, the card after a redraw); its hung lookup does not hold Crunch once the network is back
//            (results within 8 s; main 0.2 s; Crunch's own place search 3.8-5 s after the tap: it waits 4 s on a lookup with no forecast yet);
//            the ride changed while its lookup is out: the new ride's forecast with nothing else happening, and back to the first ride: that
//            ride is asked again (an overtaken try is not a failed one); the box's lookup hung for good and the ride changed: after its 15 s
//            the box asks for the new ride and shows it (one place search, one forecast), 14-16.5 s after its first (review round 3)
//   once     100.3, QA: after Crunch the box is out and only one fred is on the page, in every frame of the Crunch; the run's results too;
//            back (the results gone) the box shows again, one fred
//   land     100.3 (review round 4), WebKit (no scroll anchoring): a fresh Crunch on the ride, the run, Plan for Clothing, the
//            Clothing-only results and the ride at 320 px / 200% lands as main does (the results' top within 2 px of main's under the header)
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
//            (the same drawings kept), and after "Show their names" on and off (review round 3); still under Reduce Motion and with
//            Animate the world off
//   room     100.4, QA: at the end of the scroll the crew sits at least 8 px clear of the tab bar (320, 375, 390, 430 px; 100, 150, 200%
//            text) and the footer is clear of it, shown and not covered (its science link the element at its own centre; review round 3:
//            on the page with sign-in configured, so Privacy too, at every size; one Firebase-off size, no Privacy); left out when there
//            is no room (a taller tab bar), back when there is; at the edge: 4 px of room: left out, 9 px: shown, 8 or more clear; judged on
//            layout changes, never on a scroll; a tablet and a phone turned (768 x 1024, 1024 x 768, 844 x 390): each friend at most 76 px a
//            body, the crew no taller than that, the row centred (check round 2); review round 4: the home indicator's 34 px inset (CDP's
//            safe-area override: 375 / 390 / 430 px, 17 and 21 px text, one with sign-in configured): the crew shows, 8 px or more clear
//   saved    kit step (a skeptic): after Save to Journal (the box back, the page longer) the "Saved to Journal ✓ · View ›" strip never covers
//            Crunch: in every frame of its first second, at the end of a scroll through the page and back, Crunch shows 44 px or more and
//            none of it under the strip, a tap at its centre reaches it, the strip's View its own; after the strip, Crunch back in its place
//            (320, 375, 390, 430 x 844 at 100 / 150 / 200% text, 320 x 568 at 100 and 200%, WebKit 390 x 844 and 320 x 568 / 200%, the
//            computer layout, where Crunch never moves)
//   theme    100.6: the run's graphite: the box follows the run (the panel #34343C, its sky's first stop 26% of the sky in it, light words,
//            painted over the sky), on the run between the ticket and the Carry box and Settings (in the page and on the screen); the crew
//            left out there (provisional decision), back on the ride; the box announced as "Run forecast" on the run, "Ride forecast" on
//            the ride (review round 3)
//   switch   100.5: Settings › fred world has "Show the crew" (on) and "Show their names" (off), 44 px rows; neither is stored or in
//            DEFAULT_SETTINGS until tapped; a tap stores settings.crewShow / crewNames and the crew follows (off: no art at all); a
//            reload keeps them
//   names    100.5, QA: names on: the first name under each friend (CREW_NAMES order, the five of the day), real text in the accessibility
//            tree, never cut, broken over two lines or overlapping (320 / 390 / 430 px, 100 / 150 / 200% text); the accessibility tree reads
//            exactly a list "The crew" of the five names, each drawing aria-hidden; names off: no name in the strip, the page's text or the
//            accessibility tree. The same list read (a11yCrew) after each names change made with the page open: the tap (switch, motion),
//            the sync (B), the restores (backup), names on and off (review round 7)
//   sync    QA: two devices (the q91 Firebase stand-in): A turns the names on, B gets them (one settingsAt stamp each, crewNames); B turns
//            the crew off, A's crew goes; the Plan footer's Privacy link shows where sign-in is configured, not covered; B's five keep their
//            drawings when the names arrive (review round 3)
//   backup   a backup carries the switches and a restore brings them; one without them keeps this device's (names on stay on, the crew
//            off stays off: as the rider, birthday and gender; check round 1); a file with the crew off or the names off, restored on a
//            device with them on, turns them off (review round 3)
//   media    print: no crew, no sky, no fred (the box's words stay, without the feather or fred's room or height: the box the line's height
//            and its padding); forced colours: the art out, the box's edge kept
//   fit      QA: 320 and 390 px at 150% and 200% text: the line inside the box and its rows beside fred clear of him (the rows under him
//            take the box's width), fred inside the box, no sideways scroll; long places (Indianapolis, Mechanicsburg): no word over two rows;
//            places of several words (Salt Lake City, San Francisco, Rancho Santa Margarita; 320 / 375 / 390 px, check round 2): no row beside
//            fred left empty or short of a word that would fit there, and no row starts with a dot; review round 5, past 200% (Larger Text
//            AX3-AX5: 40, 47, 53 px roots) at 320 px (and 375 px / 53 px), 8:00 and 12:30, Chromium and WebKit: the time on one row with its
//            dot, never broken inside, no row starting with a dot, the rows beside fred clear of him
//   main     (with [main null.html]) main has no box and no crew
// Q100_ONLY=section,section runs some sections.
import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit } from 'playwright';
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
const HOOK = "\n(()=>{ const f=window.fetch; window.__q100req=[]; window.__q100t=[]; window.fetch=function(u, ...a){ const s=String(u && u.url || u); if(/open-meteo|weather\\.gov|zippopotam/.test(s)) { window.__q100req.push(s.split('?')[0]); window.__q100t.push([s.split('?')[0], performance.now()]); } return f.call(this, u, ...a); }; })();\n"
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
const LINE = /^Thu 8:00\sAM\s·\sCarmel\s·\s\d+°$/, LINE0 = /^Thu 8:00\sAM\s·\sCarmel$/;
// the box as it stands: shown, its state, sky, fred's look and key, whether the drawing is FW.bird of the look, the line
const boxOf = p => p.evaluate(([N]) => { const W = document.getElementById('planSky'), g = W && W.querySelector(':scope>.rwx-g'), f = W && W.querySelector(':scope>.rwx-fred:not(.rwx-out)'), Q = window.__q100, r = f && Q.FWM.get(f);
  const nm = s => String(s).replace(/\b(fw-[a-z]+)\d+/g, '$1#').replace(/\bid="[^"]*"/g, 'id').replace(/url\(#[^)]*\)/g, 'url(#)').replace(/href="#[^"]*"/g, 'href'), look = g && g.dataset.fred;
  const L = document.getElementById('planSkyL'), layer = W && W.querySelector(':scope>.rwx-scene>.rwx-layer:not(.rwx-out)');
  return { on: !!W && !W.hidden && getComputedStyle(W).display !== 'none', wx: W && W.dataset.wx, sky: W && W.dataset.sky || null, gsky: g && g.dataset.sky || null, look, key: r && r.k, still: r && r.s,
    same: !!f && !!look && nm(f.innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.bird({ wear: FW.WX_WEAR[look] }) }).innerHTML), layer: layer ? layer.dataset.k : null, line: L ? L.textContent : null, num: L && L.querySelector('.pvs-t') ? L.querySelector('.pvs-t').textContent : null,
    whole: !!W && !!L && W.innerText.replace(/\s+/g, ' ').trim().toLowerCase() === L.textContent.replace(/\s+/g, ' ').trim().toLowerCase() /* (no other words in the box) */ }; }, [0]);
const ready = (p, wx, look) => until(() => p.evaluate(([wx, look]) => { const W = document.getElementById('planSky'); return !!W && W.dataset.wx === wx && (!look || (W.querySelector(':scope>.rwx-g') || {}).dataset.fred === look) && !!W.querySelector(':scope>.rwx-fred:not(.rwx-out) svg'); }, [wx, look]), 20000);
const reqs = p => p.evaluate(() => window.__q100req.slice());
const kinds = L => ({ geo: L.filter(u => /geocoding/.test(u)).length, fc: L.filter(u => /api\.open-meteo\.com\/v1\/forecast|archive-api/.test(u)).length, nws: L.filter(u => /weather\.gov/.test(u)).length, all: L.length });
const freds = p => p.evaluate(() => [...document.querySelectorAll('.rwx-fred')].filter(f => !f.classList.contains('rwx-out') && f.getClientRects().length && f.querySelector('svg') && getComputedStyle(f.querySelector('svg')).display !== 'none').map(f => f.parentElement.id));
async function toSettings(p) { await p.click('#syncHdrIn:visible, #syncHdr:visible, #sbAcct:visible'); await until(() => p.evaluate(() => document.getElementById('view-profile').classList.contains('active'))); await settle(p, 150); }
// Settings (it opens on the side in use), Advanced, Units: one picked, the sheet closed, back to Plan (q98's steps)
async function unitsTo(p, u) {
  await toSettings(p); await p.click('#prowBtn-advanced'); await settle(p, 500); await p.click('#prowBtn-units'); await until(() => p.evaluate(() => document.getElementById('setSheet').classList.contains('open'))); await settle(p);
  await p.selectOption('#sUnits', u); await sleep(300); await p.keyboard.press('Escape'); await until(() => p.evaluate(() => !document.getElementById('setSheet').classList.contains('open')), 5000);
  await tab(p, 'plan'); await sleep(600); }
const crewOf = p => p.evaluate(() => { const U = document.getElementById('planCrew'), T = U && U.cloneNode(true); if (T) T.querySelectorAll('svg').forEach(s => s.remove()); return { on: !!U && !U.hidden && getComputedStyle(U).display !== 'none', ids: U ? [...U.querySelectorAll('.crew-f')].map(li => +li.dataset.i) : [], art: U ? U.querySelectorAll('.crew-a svg').length : 0, names: U ? [...U.querySelectorAll('.crew-n')].map(n => n.textContent) : [], text: T ? T.textContent : '', /* (words outside the drawings: a drawing's own bib number is art) */ hid: U && U.getAttribute('aria-hidden'), room: U && U.dataset.room }; });
// the two crew switches as shown: aria-pressed and the drawn state (.on), 'true on' or 'false off' (only renderProfileRows sets them: the
// HTML's own aria-pressed is the off state for the names, so a check before any tap, or one expecting off, cannot tell; review round 6)
const swOf = p => p.evaluate(() => Object.fromEntries(['crewshow', 'crewnames'].map(k => { const b = document.getElementById('prowBtn-' + k); return [k, b ? b.getAttribute('aria-pressed') + ' ' + (b.classList.contains('on') ? 'on' : 'off') : null]; })));
// the rule, worked out here: the local date as a day number, five friends from 5 x day, round the 19
const NAMES = ['Ryan', 'Dustin', 'Chelsea', 'Bobby', 'Anne', 'Heather', 'Luke', 'Mark', 'Maria', 'Rob', 'Marc', 'Katie', 'Bentley', 'John', 'Steve', 'Julia', 'Chiara', 'Rob', 'Paul'];
const fiveOf = (y, m, d) => { const day = Date.UTC(y, m - 1, d) / 864e5, s = ((day * 5) % 19 + 19) % 19; return [0, 1, 2, 3, 4].map(k => (s + k) % 19); };
/* the list as VoiceOver gets it, read with Plan showing (a hidden view reads ''): names on, exactly a list "The crew" of the day's five (real
   text); off, nothing (aria-hidden, no label). Read after each names change made with the page open (a tap, a sync, a restore: the day's
   five kept, so only crewRender's aria line sets it), not only at load (review round 7) */
const a11yCrew = async (p, on) => { const snap = (await p.locator('#planCrew').ariaSnapshot()).trim(), a = await p.evaluate(() => { const U = document.getElementById('planCrew'); return { hid: U.getAttribute('aria-hidden'), label: U.getAttribute('aria-label') }; });
  return Object.assign({ ok: on ? snap === ['- list "The crew":', ...fiveOf(2026, 10, 29).map(i => '  - listitem: ' + NAMES[i])].join('\n') && a.hid === null && a.label === 'The crew' : snap === '' && a.hid === 'true' && a.label === null, snap }, a); };
const sheet = async (p, f) => { await p.click('#locRow'); await until(() => p.evaluate(() => document.getElementById('planSheet').classList.contains('open'))); await f(); await p.click('#psAct'); await until(() => p.evaluate(() => !document.getElementById('planSheet').classList.contains('open'))); };
const setField = async (p, sel, v) => { await p.fill(sel, v); await p.dispatchEvent(sel, 'change'); };
const setPlace = async (p, place) => { await p.click('#locRow'); await until(() => p.evaluate(() => document.getElementById('planSheet').classList.contains('open'))); await setField(p, '#wxLoc', place); await sleep(300); await p.keyboard.press('Escape').catch(() => {}); /* (the suggestions shut) */
  if (await p.evaluate(() => document.getElementById('planSheet').classList.contains('open'))) await p.click('#psAct'); await until(() => p.evaluate(() => !document.getElementById('planSheet').classList.contains('open'))); };
const shown = p => until(() => p.evaluate(() => getComputedStyle(document.getElementById('results')).display !== 'none' && !document.getElementById('calcBtn').disabled), 20000);
/* the line painted (check round 2): the running animations held, each row of the line shot with the line shown and hidden; a row that looks
   the same both ways is not drawn (under the sky, say). The box is near the top: the page is at its top, so the rects are the shot's */
const painted = async p => { const R = await p.evaluate(() => { scrollTo(0, 0); window.__q100held = document.getAnimations().filter(a => a.playState === 'running'); window.__q100held.forEach(a => a.pause());
    const L = document.getElementById('planSkyL'), rg = document.createRange(); rg.selectNodeContents(L); const rows = [];
    [...rg.getClientRects()].filter(q => q.width > 1 && q.height > 1).forEach(q => { const r = rows.find(r => Math.min(r.b, q.bottom) - Math.max(r.t, q.top) > 0); if (r) { r.l = Math.min(r.l, q.left); r.r = Math.max(r.r, q.right); r.t = Math.min(r.t, q.top); r.b = Math.max(r.b, q.bottom); } else rows.push({ l: q.left, r: q.right, t: q.top, b: q.bottom }); });
    return rows; });
  const shot = r => p.screenshot({ clip: { x: r.l, y: r.t, width: r.r - r.l, height: r.b - r.t } }), A = [], B = [];
  await sleep(100); for (const r of R) A.push(await shot(r)); await p.evaluate(() => { document.getElementById('planSkyL').style.visibility = 'hidden'; }); await sleep(100); for (const r of R) B.push(await shot(r));
  await p.evaluate(() => { document.getElementById('planSkyL').style.visibility = ''; (window.__q100held || []).forEach(a => a.play()); });
  return { rows: R.length, same: A.filter((a, i) => a.equals(B[i])).length }; };
const skyLoops = p => p.evaluate(() => { const S = document.querySelector('#planSky>.rwx-scene'); return S ? document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.target && S.contains(a.effect.target)).map(a => a.animationName) : []; });
const outQuiet = p => p.evaluate(() => { const o = document.getElementById('wxOut'); return { quiet: getComputedStyle(o).display === 'none' || !o.textContent.trim(), disp: getComputedStyle(o).display, text: o.textContent.trim().slice(0, 90) }; }); /* the box's lookups write no note under the form */
const NWS_XML = `<?xml version="1.0"?><dwml><data><time-layout><layout-key>k1</layout-key>${Array.from({ length: 24 }, (_, h) => `<start-valid-time>2026-10-29T${String(h).padStart(2, '0')}:00:00-04:00</start-valid-time>`).join('')}</time-layout><parameters><temperature type="wet bulb globe temperature" time-layout="k1">${Array.from({ length: 24 }, (_, h) => `<value>${60 + Math.round(8 * Math.max(0, Math.sin((h - 6) / 12 * Math.PI)))}</value>`).join('')}</temperature></parameters></data></dwml>`;
const slowNWS = ms => (r, u) => /weather\.gov/.test(u) ? new Promise(res => setTimeout(() => res(r.fulfill({ status: 200, contentType: 'application/xml', headers: { 'access-control-allow-origin': '*' }, body: NWS_XML }).catch(() => {})), ms)) : null; /* weather.gov answering after ms (the page may have stopped waiting) */
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
  let usNum = null;
  for (const k of ['sun', 'rain', 'snow', 'freeze', 'night']) {
    const x = await openH(k === 'night' ? { motion: true } : { query: '?sky=' + k, motion: true }), p = x.p;
    if (k === 'night') { await p.click('#locRow'); await until(() => p.evaluate(() => document.getElementById('planSheet').classList.contains('open'))); await p.fill('#startTime', '20:00'); await p.dispatchEvent('#startTime', 'change'); await p.click('#psAct'); }
    await ready(p, 'live', k); const B = await boxOf(p);
    const line = k === 'night' ? /^Thu 8:00\sPM\s·\sCarmel\s·\s\d+°$/ : LINE;
    ok(B.on && B.wx === 'live' && (k === 'night' ? !B.sky && !B.layer : B.sky === k && B.gsky === k && B.layer === k) && B.look === k && B.key === 'wx:' + k && B.same && (k === 'night' ? B.still === true : B.still === false),
      '100.1-2: ' + k + ': the box\'s sky is the forecast\'s (' + (k === 'night' ? 'none on a clear night' : k) + ') and fred is dressed for it as on the weather card (wx:' + k + ', FW.bird of FW.WX_WEAR.' + k + (k === 'night' ? ', still' : '') + ')', B);
    ok(line.test(B.line || '') && B.whole, '100.1: ' + k + ': one line, time · place · temperature ("' + B.line + '"), the box\'s only words', B);
    const tt = await p.evaluate(() => { const L = document.getElementById('planSkyL'); return { tt: getComputedStyle(L).textTransform, shown: L.innerText.trim() }; });
    ok(tt.tt === 'uppercase' && tt.shown === tt.shown.toUpperCase() && /[A-Z]{3}/.test(tt.shown), '100.1: ' + k + ': the line in the caps style (uppercase: "' + tt.shown + '")', tt);
    if (k === 'rain' || k === 'snow') { const lp = await skyLoops(p); ok(lp.length > 0 && lp.includes(k === 'rain' ? 'rwx-fall' : 'rwx-snow'), '100.1, round rule b: ' + k + ': the box\'s sky lives as the card\'s (item 87\'s loops run: ' + lp.length + ', ' + [...new Set(lp)].join(', ') + ')', lp); }
    const pt = await painted(p); ok(pt.rows >= 1 && pt.same === 0, '100.1: ' + k + ': the line is painted over the sky (each of its ' + pt.rows + ' rows looks different with the line hidden)', pt);
    if (k === 'sun') { await crunch(p); const t = await p.evaluate(() => { const e = document.querySelector('#rWeather .rwx-temp'); return e && e.textContent.trim(); });
      ok(!!t && t === B.num, '100.1: the line\'s number is the weather card\'s (the forecast at the start: ' + B.num + ' and ' + t + ')', { box: B.num, card: t }); usNum = B.num; }
    await x.close(); }
  /* review round 4: the rider's units (tempDisp is plain rounding in US units, so a box that skipped it passed in US units): opened in
     metric, the number is the forecast's in C and the card's; changed in Settings with the box live, it follows with no new lookup */
  const cOf = f => Math.round((parseFloat(f) - 32) * 5 / 9) + '°';
  { const x = await openH({ query: '?sky=sun', settings: { units: 'metric' } }), p = x.p; await ready(p, 'live', 'sun'); const B = await boxOf(p);
    await crunch(p); const t = await p.evaluate(() => { const e = document.querySelector('#rWeather .rwx-temp'); return e && e.textContent.trim(); });
    ok(!!usNum && LINE.test(B.line || '') && B.num === cOf(usNum) && B.num !== usNum && t === B.num, '100.1: metric units: the line\'s number is the forecast\'s in C (' + B.num + ', not ' + usNum + ') and the weather card\'s (' + t + ')', { box: B.num, us: usNum, card: t, line: B.line });
    await x.close(); }
  { const x = await openH({ query: '?sky=sun' }), p = x.p; await ready(p, 'live', 'sun'); const n0 = kinds(await reqs(p)), a = (await boxOf(p)).num;
    await unitsTo(p, 'metric'); const b = await boxOf(p); await unitsTo(p, 'us'); const c = await boxOf(p), n1 = kinds(await reqs(p));
    ok(!!usNum && a === usNum && b.on && b.wx === 'live' && b.num === cOf(usNum) && c.num === usNum && LINE.test(b.line || '') && n1.fc === n0.fc && n1.geo === n0.geo, '100.1: Units changed in Settings with the box live: back on Plan the number follows (' + a + ', ' + b.num + ', ' + c.num + '), no new lookup (forecasts ' + n0.fc + ' then ' + n1.fc + ')', { a, b: b.num, c: c.num, n0, n1 });
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
  /* opened offline, then the signal back while the rider stays on Plan (review round 5): the online event alone looks up (one place search,
     one forecast) and the box is live; the only other online check had the forecast in hand, so a redraw passed it */
  { const x = await openH(), p = x.p; await ready(p, 'live', null); await x.ctx.setOffline(true); await reload(p); await sleep(1500); await ready(p, 'none', 'clouds'); const a = kinds(await reqs(p)), A = await boxOf(p);
    await x.ctx.setOffline(false); await p.evaluate(() => dispatchEvent(new Event('online'))); const t0 = Date.now(), L = await until(async () => (await boxOf(p)).wx === 'live', 6000), ms = Date.now() - t0; await sleep(800);
    const B = await boxOf(p), b = kinds(await reqs(p));
    ok(a.all === 0 && A.wx === 'none' && !!L && B.wx === 'live' && LINE.test(B.line || '') && b.geo === 1 && b.fc === 1, '100.2: opened offline (the cap, no request), then the signal back: the online event alone looks up (one place search, one forecast) and the box is live in ' + ms + ' ms ("' + B.line + '")', { a, b, ms, A: A.wx, B: [B.wx, B.line] }); await x.close(); }
  // a failing network with a forecast saved earlier (fetchWeather's cache): a saved forecast is not a live one
  { let mode = 'live'; const x = await openH({ forecast: false, route: (r, u) => mode === 'live' ? WX(r, u) : /open-meteo|weather\.gov/.test(u) ? r.fulfill({ status: 500, body: 'down' }) : null });
    await ready(x.p, 'live', null); mode = 'fail'; await reload(x.p); await until(async () => (await reqs(x.p)).length > 0, 8000); await sleep(1000); await ready(x.p, 'none', 'clouds');
    const st = await x.p.evaluate(() => ({ last: window.__q100.wxLast, key: window.__q100.wxKey }));
    ok(st.last === null && st.key === null, 'nofc: the box\'s failing lookup takes nothing in (no saved forecast in the shared state: wxLast and wxKey stay empty; check round 2)', st); cap(await boxOf(x.p), 'a failing network (a saved forecast from the cache)');
    await crunch(x.p); const cr = await x.p.evaluate(() => ({ stale: !!(window.__q100.wxLast && window.__q100.wxLast.stale), card: document.getElementById('rWeather').textContent.replace(/\s+/g, ' ') }));
    ok(cr.stale && /Saved forecast/.test(cr.card), 'nofc: Crunch on the failing network falls back on the saved forecast itself, as main (wxLast.stale, the card says so)', { stale: cr.stale, card: cr.card.slice(0, 120) });
    /* the results taken away by the sport (the ride's saved forecast still the shared one, under the same key on a timed run): the box is
       back, and a saved forecast is still no live one */
    await x.p.click('#sportBtn'); await x.p.click('#sportMenu [data-sport=run]'); await sleep(800); await ready(x.p, 'none', 'clouds');
    const sk = await x.p.evaluate(() => ({ stale: !!(window.__q100.wxLast && window.__q100.wxLast.stale), same: window.__q100.wxKey === (window.__q100.wxReq() || {}).key }));
    cap(await boxOf(x.p), 'the results gone with the saved forecast in hand (' + J(sk) + ')', LINE0); await x.close(); }
  // a live forecast now over an hour old, the network failing (check round 2): the cap, not an hour-old forecast shown as live
  { let mode = 'live'; const x = await openH({ forecast: false, route: (r, u) => mode === 'live' ? WX(r, u) : /open-meteo|weather\.gov/.test(u) ? r.fulfill({ status: 500, body: 'down' }) : null }), p = x.p;
    await ready(p, 'live', null); mode = 'fail'; const a = kinds(await reqs(p));
    await p.evaluate(() => { window.__q100.wxLast.checkedAt -= 61 * 60e3; const T = window.__q100.skyBoxFetch.t || {}; Object.keys(T).forEach(k => { T[k] -= 61 * 60e3; }); }); await tab(p, 'journal'); await tab(p, 'plan');
    await until(async () => kinds(await reqs(p)).all > a.all, 5000); await sleep(800); await ready(p, 'none', 'clouds'); cap(await boxOf(p), 'a forecast over an hour old, its new lookup failing'); await x.close(); }
  // a ride 11 or more days out: typical weather only, which the box does not show as a forecast (and does not look up)
  { const x = await openH(), p = x.p; await ready(p, 'live', null); await sleep(400); const a = kinds(await reqs(p));
    await sheet(p, () => setField(p, '#wxDate', '2026-11-13')); await sleep(1500); await ready(p, 'none', 'clouds'); const b = kinds(await reqs(p));
    ok(b.all === a.all, '100.2: a ride 15 days out (typical weather only): the box asks for nothing (no forecast, no archive)', { a, b });
    cap(await boxOf(p), 'a ride 15 days out (typical weather only)', /^Fri 8:00\sAM\s·\sCarmel$/); await x.close(); }
});

section('fetch', async () => {
  // a lookup when Plan opens; nothing more on tab switches, the app back in front, or Crunch (its own lookup finds the same forecast)
  { const x = await openH(), p = x.p; await ready(p, 'live', null); await sleep(500); const a = kinds(await reqs(p));
    ok(a.geo === 1 && a.fc === 1, '100.2: the forecast is looked up when Plan opens (one place search, one forecast)', a);
    { const o = await outQuiet(p); ok(o.quiet, '100.2, item 76: the box\'s lookup writes no note under the Plan form (#wxOut hidden)', o); }
    /* (review round 3) the line kept in place: a render that changes nothing does not write it again (its guard once compared innerHTML,
       which writes the no-break spaces as &nbsp;, so every render replaced it: a selection on it lost, its nodes rebuilt) */
    await p.evaluate(() => { const L = document.getElementById('planSkyL'); window.__q100lm = 0; new MutationObserver(m => { window.__q100lm += m.length; }).observe(L, { childList: true, characterData: true, subtree: true }); });
    for (let k = 0; k < 8; k++) { await tab(p, 'journal'); await tab(p, 'plan'); }
    await p.evaluate(() => { const L = document.getElementById('planSkyL'), r = document.createRange(); r.selectNodeContents(L); getSelection().removeAllRanges(); getSelection().addRange(r); window.__q100sel = getSelection().toString();
      document.dispatchEvent(new Event('visibilitychange')); dispatchEvent(new Event('online')); dispatchEvent(new Event('resize')); }); await sleep(800);
    const lm = await p.evaluate(() => ({ writes: window.__q100lm, sel: getSelection().toString(), was: window.__q100sel }));
    ok(lm.writes === 0 && lm.was.length > 10 && lm.sel === lm.was, '100.1: the line kept in place: 8 tab switches, the app back in front, online and a resize with the ride unchanged write it no more (' + lm.writes + ' writes), a selection on it kept ("' + lm.sel + '"; review round 3)', lm);
    const b = kinds(await reqs(p)); ok(b.all === a.all, '100.2: no request storm: 8 tab switches and the app back in front ask for nothing more', { a, b });
    await crunch(p); await sleep(300); const c = kinds(await reqs(p)); ok(c.all === a.all, '100.2: Crunch uses the box\'s forecast (the same fetchWeather key and cache: no request)', { a, c });
    await x.close(); }
  // an hour-old forecast is looked up again when Plan opens, once
  { const x = await openH(), p = x.p; await ready(p, 'live', null); await sleep(500); const a = kinds(await reqs(p));
    await p.evaluate(() => { window.__q100.wxLast.checkedAt -= 61 * 60e3; const T = window.__q100.skyBoxFetch.t || {}; Object.keys(T).forEach(k => { T[k] -= 61 * 60e3; }); }); /* an hour on: the forecast and the box's own last try both an hour old */ await tab(p, 'journal'); await tab(p, 'plan'); await sleep(1500);
    for (let k = 0; k < 4; k++) { await tab(p, 'journal'); await tab(p, 'plan'); } await sleep(500); const b = kinds(await reqs(p));
    ok(b.fc === a.fc + 1, '100.2: the hour-old rule (Crunch\'s): a forecast over an hour old is looked up again when Plan opens, once', { a, b }); await x.close(); }
  /* the app back in front with the forecast over an hour old (review round 5): a real hidden-then-visible pair and nothing else (no tab tap):
     the cap at once, then one place search and one forecast, and the box live with the new forecast (it turned cold and wet meanwhile);
     every other new lookup reaches the box through a tab tap, so a page that dropped the box from the app-back-in-front listener passed */
  { let wet = false; const WET = weatherRouteFor({ lo: 40, hi: 44, rain: 80 }), x = await openH({ route: (r, u) => wet && /open-meteo/.test(u) ? new Promise(res => setTimeout(() => res(WET(r, u)), 1200)) : null }), p = x.p;
    await ready(p, 'live', null); await sleep(500); const a = kinds(await reqs(p)), A = await boxOf(p);
    const vis = v => p.evaluate(v => { for (const k of ['visibilityState', 'hidden']) Object.defineProperty(document, k, { configurable: true, get: () => k === 'hidden' ? v === 'hidden' : v }); document.dispatchEvent(new Event('visibilitychange')); }, v);
    await vis('hidden'); await sleep(300); wet = true; await p.evaluate(() => { window.__q100.wxLast.checkedAt -= 61 * 60e3; const T = window.__q100.skyBoxFetch.t || {}; Object.keys(T).forEach(k => { T[k] -= 61 * 60e3; }); });
    await vis('visible'); await sleep(250); const C = await boxOf(p);
    await until(async () => { const B = await boxOf(p); return B.wx === 'live' && B.num && B.num !== A.num; }, 8000); await sleep(500); const B = await boxOf(p), b = kinds(await reqs(p));
    await p.evaluate(() => { delete document.visibilityState; delete document.hidden; });
    ok(C.wx === 'none' && C.look === 'clouds' && !C.num && b.geo === a.geo + 1 && b.fc === a.fc + 1 && B.on && B.wx === 'live' && LINE.test(B.line || '') && !!A.num && B.num !== A.num, '100.2: the app back in front (visibilitychange alone) with the forecast over an hour old: the cap at once (' + C.wx + '), one place search and one forecast, the box live with the new forecast (' + A.num + ' then ' + B.num + ')', { a, b, A: A.num, C: [C.wx, C.look, C.num], B: [B.wx, B.num, B.line] }); await x.close(); }
  // a failing network: one try; no more from the Plan for 10 minutes; then one
  { const x = await openH({ forecast: false, route: (r, u) => /open-meteo|weather\.gov/.test(u) ? r.fulfill({ status: 500, body: 'down' }) : null }), p = x.p;
    await until(async () => (await reqs(p)).length > 0, 8000); await sleep(1000); const a = kinds(await reqs(p));
    { const o = await outQuiet(p); ok(o.quiet, '100.2, item 76: the box\'s failed lookup writes no note under the Plan form (#wxOut hidden, before any Crunch)', o); }
    for (let k = 0; k < 8; k++) { await tab(p, 'journal'); await tab(p, 'plan'); } await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(800); const b = kinds(await reqs(p));
    /* the 10 minutes held from both sides (review round 3): the last try set back to 20 s short of them (absolute: the switches above took
       seconds), nothing; just past them, one */
    await p.evaluate(() => { const T = window.__q100.skyBoxFetch.t || {}; Object.keys(T).forEach(k => { T[k] = Date.now() - (10 * 60e3 - 20e3); }); }); await tab(p, 'journal'); await tab(p, 'plan'); await sleep(1200); const n = kinds(await reqs(p));
    await p.evaluate(() => { const T = window.__q100.skyBoxFetch.t || {}; Object.keys(T).forEach(k => { T[k] = Date.now() - (10 * 60e3 + 1000); }); }); await tab(p, 'journal'); await tab(p, 'plan'); await sleep(1200); const c = kinds(await reqs(p));
    ok(a.all >= 1 && b.all === a.all && n.all === a.all && c.all > b.all && c.geo === a.geo + 1, '100.2: a failing network: one try when Plan opens, none on 8 tab switches and the app back in front, none at 9 min 40 s, one again just past 10 minutes', { a, b, n, c }); await x.close(); }
  // a Crunch while the box's lookup is still out: it waits for it (one place search, one forecast)
  { const slow = (r, u) => /open-meteo/.test(u) ? new Promise(res => setTimeout(() => res(WX(r, u)), 1200)) : null; /* (two requests in turn: under the 4 s a Crunch waits) */
    const x = await openH({ forecast: false, route: slow, settle: 100 }), p = x.p; await until(async () => (await reqs(p)).length > 0, 5000);
    { const o = await outQuiet(p); ok(o.quiet, '100.2, item 76: during the box\'s lookup no "Looking up the forecast" note under the Plan form (#wxOut hidden)', o); }
    await p.click('#calcBtn'); await until(() => p.evaluate(() => getComputedStyle(document.getElementById('results')).display !== 'none'), 20000); await sleep(500);
    const a = kinds(await reqs(p)); ok(a.geo === 1 && a.fc === 1, '100.2: a Crunch during the box\'s lookup waits for it: one place search and one forecast in all', a); await x.close(); }
  /* a Crunch during the box's slow lookup (review round 6): each Open-Meteo request 2.5 s, Crunch 0.5 s after the box's place search: the
     lookup is still answering (no hung one), so Crunch waits for it: one request of each kind, results about 4.5 s after the tap (dropping it
     at 4 s from the tap, its forecast half a second off, made a second lookup: 9.4 s, every request twice; main 5.4 s) */
  { const slow = (r, u) => /open-meteo/.test(u) ? new Promise(res => setTimeout(() => res(WX(r, u)), 2500)) : null;
    const x = await openH({ forecast: false, route: slow, settle: 100 }), p = x.p; await until(async () => kinds(await reqs(p)).geo >= 1, 5000);
    const g = await p.evaluate(() => (window.__q100t.find(([u]) => /geocoding/.test(u)) || [0, 0])[1]); await p.waitForFunction(g => performance.now() >= g + 500, g, { timeout: 5000 });
    const t0 = Date.now(); await p.click('#calcBtn'); const done = await shown(p), ms = Date.now() - t0, k = kinds(await reqs(p)), src = await p.evaluate(() => window.__q100.wxLast && window.__q100.wxLast.place);
    ok(!!done && k.geo === 1 && k.fc === 1 && k.nws === 1 && ms < 6500 && !!src, '100.2: each Open-Meteo request taking 2.5 s, Crunch tapped 0.5 s after the place search of the box: it waits for that lookup, still answering (one request of each kind), and shows results with its forecast in ' + ms + ' ms (under 6.5 s; review round 6)', { ms, k, src }); await x.close(); }
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
  // weather.gov slow (check round 2): past the box's 15 s it still shows the forecast (weather.gov waited for 8 s at most: the estimate)
  { const x = await openH({ route: slowNWS(18000), settle: 100 }), p = x.p, t0 = Date.now();
    await p.evaluate(() => { const W = document.getElementById('planSky'), f = () => { if (W.dataset.wx === 'live' && !window.__q100live) window.__q100live = performance.now(); }; f(); new MutationObserver(f).observe(W, { attributes: true, attributeFilter: ['data-wx'] }); }); /* (the moment it turns live, by the page's clock) */
    const L = await until(async () => (await boxOf(p)).wx === 'live', 12000), ms = Date.now() - t0;
    const k = kinds(await reqs(p)), src = await p.evaluate(() => window.__q100.wxLast && window.__q100.wxLast.wbSource); await sleep(1500); const B = await boxOf(p);
    const gap = await p.evaluate(() => { const n = window.__q100t.find(([u]) => /weather\.gov/.test(u)); return n && window.__q100live ? Math.round(window.__q100live - n[1]) : null; }); /* (review round 3: from weather.gov's own request, by the HOOK's stamp) */
    ok(!!L && B.wx === 'live' && LINE.test(B.line || '') && k.geo === 1 && k.fc === 1 && k.nws === 1 && /estimated/.test(src || '') && gap != null && gap >= 7500 && gap <= 9500, '100.2: weather.gov answering after 18 s: the box shows the forecast ' + gap + ' ms after the weather.gov request (its 8 s limit: 7.5-9.5 s), the estimate, one request of each kind (' + ms + ' ms after the app opened)', { ms, gap, k, src, B: B.wx }); await x.close(); }
  /* a Crunch while the box's lookup waits on weather.gov adopts it: one request of each kind, done when the box's lookup is (tapped 1 and 3 s
     after weather.gov's request; and 7 s after the box's place search, weather.gov at 18 s: the box still holds its lookup then, since its
     15 s give-up outlasts weather.gov's 8 s; review round 3) */
  for (const [nws, at, within, from] of [[6000, 1000, 7500, 'nws'], [18000, 3000, 6500, 'nws'], [18000, 7000, 3000, 'geo']]) {
    const x = await openH({ route: slowNWS(nws), settle: 100 }), p = x.p; await until(async () => kinds(await reqs(p)).nws >= 1, 5000);
    if (from === 'nws') await sleep(at); else { const g = await p.evaluate(() => (window.__q100t.find(([u]) => /geocoding/.test(u)) || [0, 0])[1]); await p.waitForFunction(([g, at]) => performance.now() >= g + at, [g, at], { timeout: 15000 }); }
    const t0 = Date.now(); await p.click('#calcBtn'); const done = await shown(p), ms = Date.now() - t0;
    const k = kinds(await reqs(p)), src = await p.evaluate(() => window.__q100.wxLast && window.__q100.wxLast.wbSource);
    ok(!!done && k.geo === 1 && k.fc === 1 && k.nws === 1 && ms < within && (nws < 8000 ? src === 'NWS forecast' : /estimated/.test(src || '')), '100.2: weather.gov answering after ' + nws / 1000 + ' s, Crunch tapped ' + at / 1000 + ' s after the ' + (from === 'nws' ? 'weather.gov request' : 'place search of the box') + ': it takes the lookup of the box (one request of each kind) and shows results with it (' + ms + ' ms, under ' + within / 1000 + ' s; ' + src + ')', { ms, k, src });
    await x.close(); }
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
  // a forecast saved earlier, the box's lookup at boot failing, the network back (check round 2): Crunch looks up as main (no saved
  // forecast taken in by the box); the box shows its sky once its 10 minutes are over (no hour of the cap)
  for (const then of ['crunch', 'box']) {
    let mode = 'live'; const x = await openH({ forecast: false, route: (r, u) => mode === 'live' ? WX(r, u) : /open-meteo|weather\.gov/.test(u) ? r.abort() : null }), p = x.p;
    await ready(p, 'live', null); mode = 'fail'; await reload(p); await until(async () => (await reqs(p)).length > 0, 8000); await sleep(1000); await ready(p, 'none', 'clouds'); mode = 'live'; const a = kinds(await reqs(p));
    if (then === 'crunch') { await crunch(p); const b = kinds(await reqs(p)), c = await p.evaluate(() => ({ stale: !!(window.__q100.wxLast && window.__q100.wxLast.stale), card: document.getElementById('rWeather').textContent.replace(/\s+/g, ' ') }));
      ok(b.fc === a.fc + 1 && b.geo === a.geo + 1 && !c.stale && !/Saved forecast/.test(c.card), '100.2: a forecast saved earlier, the box\'s boot lookup failing, the network back: Crunch looks up as main does (a place search and a forecast, no "Saved forecast")', { a, b, stale: c.stale, card: c.card.slice(0, 100) }); }
    else { await p.evaluate(() => { const T = window.__q100.skyBoxFetch.t || {}; Object.keys(T).forEach(k => { T[k] -= 10 * 60e3 + 1000; }); }); await tab(p, 'journal'); await tab(p, 'plan');
      const L = await until(async () => (await boxOf(p)).wx === 'live', 8000), b = kinds(await reqs(p)), B = await boxOf(p);
      ok(!!L && B.sky && LINE.test(B.line || '') && b.fc === a.fc + 1, '100.2: the same, no Crunch: 10 minutes on the box asks again and shows the sky and number (not the cap for the saved copy\'s hour)', { a, b, B: [B.wx, B.line] }); }
    await x.close(); }
  /* (review round 3) the same, but Crunch took the saved copy in on the failing network (main's fallback), the network back, the results taken
     away by the sport (a timed run: the same key): a saved copy is not a live one for the box either, so it asks again once its 10 minutes
     are up (none before) and shows the sky, the new forecast replacing the saved one (not the cap for the rest of the saved copy's hour) */
  { let mode = 'live'; const x = await openH({ forecast: false, route: (r, u) => mode === 'live' ? WX(r, u) : /open-meteo|weather\.gov/.test(u) ? r.abort() : null }), p = x.p;
    await ready(p, 'live', null); mode = 'fail'; await reload(p); await until(async () => (await reqs(p)).length > 0, 8000); await sleep(1000); await ready(p, 'none', 'clouds');
    await crunch(p); const s0 = await p.evaluate(() => !!(window.__q100.wxLast && window.__q100.wxLast.stale));
    mode = 'live'; await p.evaluate(() => dispatchEvent(new Event('online'))); await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=run]'); await sleep(800); await ready(p, 'none', 'clouds'); const a = kinds(await reqs(p));
    await tab(p, 'journal'); await tab(p, 'plan'); await sleep(1200); const b = kinds(await reqs(p));
    await p.evaluate(() => { const T = window.__q100.skyBoxFetch.t || {}; Object.keys(T).forEach(k => { T[k] = Date.now() - (10 * 60e3 + 1000); }); }); await tab(p, 'journal'); await tab(p, 'plan');
    const L = await until(async () => (await boxOf(p)).wx === 'live', 8000), c = kinds(await reqs(p)), B = await boxOf(p), st = await p.evaluate(() => { const Q = window.__q100; return { stale: (Q.wxLast && Q.wxLast.stale) || '', same: Q.wxKey === (Q.wxReq() || {}).key }; });
    ok(s0 && b.all === a.all && !!L && !!B.sky && LINE.test(B.line || '') && c.geo === b.geo + 1 && c.fc === b.fc + 1 && !st.stale && st.same, '100.2: a saved forecast taken in by Crunch on a failing network, the network back, the sport changed (the same key): none asked within the 10 minutes, then one lookup, the box live and the saved copy replaced (review round 3)', { s0, a, b, c, st, B: [B.wx, B.line] });
    await x.close(); }
  /* (review round 6) the same saved copy in hand, the signal back but stalled, the sport changed and the box's lookup out (its 10 minutes
     over): Crunch on the run waits on that lookup 4 s at most, then takes the saved copy as main does (main: at once, no request), with no
     lookup of its own to hang on (it made one: "Crunching..." until the browser gave up); the box's lookup answering later writes nothing
     under those results (the saved copy and the feels-like kept) */
  { let mode = 'live'; const held = []; const x = await openH({ forecast: false, route: (r, u) => !/open-meteo|weather\.gov/.test(u) ? null : mode === 'live' ? WX(r, u) : mode === 'hang' ? new Promise(res => held.push(() => res(WX(r, u)))) : r.abort() }), p = x.p;
    await ready(p, 'live', null); mode = 'fail'; await reload(p); await until(async () => (await reqs(p)).length > 0, 8000); await sleep(1000); await ready(p, 'none', 'clouds');
    await crunch(p); const s0 = await p.evaluate(() => (window.__q100.wxLast || {}).stale || '');
    mode = 'hang'; await p.evaluate(() => dispatchEvent(new Event('online'))); await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=run]'); await sleep(800);
    await p.evaluate(() => { const T = window.__q100.skyBoxFetch.t || {}; Object.keys(T).forEach(k => { T[k] = Date.now() - (10 * 60e3 + 1000); }); }); const a = kinds(await reqs(p)); await tab(p, 'journal'); await tab(p, 'plan');
    await until(async () => kinds(await reqs(p)).geo > a.geo, 5000); await sleep(1000); const b = kinds(await reqs(p)), tf = await p.evaluate(() => document.getElementById('tempF').value);
    const t0 = Date.now(); await p.click('#calcBtn'); const done = await until(() => p.evaluate(() => !document.getElementById('runResults').hidden && !document.getElementById('calcBtn').disabled), 12000, 50), ms = Date.now() - t0;
    const c = kinds(await reqs(p)), card = await p.evaluate(() => document.getElementById('runResults').textContent.replace(/\s+/g, ' '));
    mode = 'live'; held.splice(0).forEach(f => f()); await sleep(2500); const d = kinds(await reqs(p)), st = await p.evaluate(() => ({ stale: (window.__q100.wxLast || {}).stale || '', tf: document.getElementById('tempF').value }));
    ok(!!s0 && b.geo === a.geo + 1 && !!done && ms < 4800 && c.all === b.all && /Saved forecast/.test(card) && d.fc === c.fc + 1 && !!st.stale && st.tf === tf, '100.2: a saved forecast in hand, the signal back but stalled, the sport changed (the same key), the lookup of the box out: Crunch on the run takes the saved copy in ' + ms + ' ms (under 4.8 s; no lookup of its own), and that lookup answering later leaves it (review round 6)', { s0, a, b, c, d, ms, st, tf, card: card.slice(0, 160) });
    await x.close(); }
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
  { let answer = false; const held = []; const route = (r, u) => /open-meteo/.test(u) ? (answer ? WX(r, u) : new Promise(res => held.push(() => res(r.abort().catch(() => {}))))) : null;
    const x = await openH({ route, settle: 200 }), p = x.p; await sleep(2500); const o = await outQuiet(p);
    ok(o.quiet, '100.2, item 76: the box\'s hung lookup writes no note under the Plan form (#wxOut hidden)', o);
    await p.evaluate(() => document.getElementById('calcBtn').addEventListener('click', () => { window.__q100tap = performance.now(); }, { capture: true, once: true }));
    answer = true; const t0 = Date.now(); await p.click('#calcBtn'); const done = await shown(p), ms = Date.now() - t0;
    const own = await p.evaluate(() => { const t = window.__q100tap, g = window.__q100t.find(([u, at]) => /geocoding/.test(u) && at > t); return g ? Math.round(g[1] - t) : null; });
    ok(!!done && ms < 8000, '100.2: the box\'s lookup hung, the network back: Crunch shows results within 8 s (' + ms + ' ms)', { ms, held: held.length });
    ok(own != null && own >= 3800 && own <= 5000, '100.2: ... Crunch waits 4 s on the box\'s lookup that has no forecast yet, then looks up itself (its place search ' + own + ' ms after the tap: 3.8-5 s)', { own });
    held.forEach(f => f()); await x.close(); }
  // the box's lookup hung for good, the network back, the ride changed (9:00) at about 2 s: the box gives its lookup up at 15 s and asks
  // for the new ride (one place search, one forecast), with nothing else happening
  { let answer = false; const held = []; const route = (r, u) => /open-meteo/.test(u) ? (answer ? WX(r, u) : new Promise(res => held.push(() => res(r.abort().catch(() => {}))))) : null;
    const x = await openH({ route, settle: 100 }), p = x.p, t0 = Date.now(); await until(async () => (await reqs(p)).length > 0, 5000); const a = kinds(await reqs(p)); await sleep(Math.max(0, 1900 - (Date.now() - t0))); answer = true;
    await sheet(p, () => setField(p, '#startTime', '09:00'));
    const B = await until(async () => { const b = await boxOf(p); return b.wx === 'live' && /^Thu 9:00\sAM\s·\sCarmel\s·\s\d+°$/.test(b.line || '') && b; }, 22000), ms = Date.now() - t0, b = kinds(await reqs(p));
    const gap = await p.evaluate(() => { const G = window.__q100t.filter(([u]) => /geocoding/.test(u)); return G.length >= 2 ? Math.round(G[G.length - 1][1] - G[0][1]) : null; }); /* (review round 3: the 15 s held from below too, by the HOOK's stamps) */
    ok(!!B && ms < 21000 && gap != null && gap >= 14000 && gap <= 16500 && b.geo === a.geo + 1 && b.fc === a.fc + 1, '100.2: the box\'s lookup hung for good and the ride changed: it asks for the new ride ' + gap + ' ms after its first place search (its 15 s give-up: 14-16.5 s) and shows it (' + ms + ' ms after the app opened; one place search, one forecast)', { ms, gap, a, b, B: B || await boxOf(p) });
    held.forEach(f => f()); await x.close(); }
  // the ride changed while the box's lookup is out (held 4 s): the new ride's forecast, nothing else happening; back to 8:00: asked again
  { let n = 0; const route = (r, u) => /api\.open-meteo\.com\/v1\/forecast/.test(u) ? (n++ === 0 ? new Promise(res => setTimeout(() => res(WX(r, u)), 4000)) : WX(r, u)) : null;
    const x = await openH({ route, settle: 200 }), p = x.p; await until(async () => kinds(await reqs(p)).fc >= 1, 8000);
    await sheet(p, () => setField(p, '#startTime', '09:00')); const B = await until(async () => { const b = await boxOf(p); return b.wx === 'live' && /^Thu 9:00\sAM\s·\sCarmel\s·\s\d+°$/.test(b.line || '') && b; }, 12000);
    ok(!!B, '100.2: the ride changed while the box\'s lookup was out: the box gets the new ride\'s forecast with nothing else happening', B || await boxOf(p));
    await sheet(p, () => setField(p, '#startTime', '08:00')); const C = await until(async () => { const b = await boxOf(p); return b.wx === 'live' && LINE.test(b.line || '') && b; }, 8000);
    ok(!!C, '100.2: back to the first ride (its try overtaken, not failed): it is asked again and shown', C || await boxOf(p)); await x.close(); }
  // the box's forecast answering after 17 s (past its 15 s), the ride the same, no Crunch: that late answer is still taken (the sky
  // and number, not the cap for 10 minutes), with no second lookup (check round 2)
  { let n = 0; const route = (r, u) => /api\.open-meteo\.com\/v1\/forecast/.test(u) && n++ === 0 ? new Promise(res => setTimeout(() => res(WX(r, u)), 17000)) : null;
    const x = await openH({ route, settle: 100 }), p = x.p, t0 = Date.now(); await sleep(15500); const B0 = await boxOf(p);
    const B = await until(async () => { const b = await boxOf(p); return b.wx === 'live' && LINE.test(b.line || '') && b; }, 6000), ms = Date.now() - t0, k = kinds(await reqs(p));
    ok(B0.wx === 'none' && !!B && k.geo === 1 && k.fc === 1, '100.2: the box\'s forecast answering after 17 s (past its 15 s), the ride the same: the late answer is taken (live ' + ms + ' ms after the app opened), no second lookup', { B0: [B0.wx, B0.line], B: B && B.line, k }); await x.close(); }
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

/* review round 4: where a fresh Crunch lands, in WebKit (the iPhone's engine): the box above the results goes as they show, before their
   scroll is measured; WebKit has no scroll anchoring, so a box hidden after the scroll left the results 118 px under the header (Chromium's
   anchoring hides it). The results' top within 2 px of main's (13 px under the header): the ride, the run, Clothing (a full plan) and the
   Clothing-only results (no gel or drink mix in the library: renderClothingOnly), and the ride at 320 px with 200% text */
section('land', async () => {
  const wk = await webkit.launch(), CASES = [['the ride', {}], ['the run', { settings: { sport: 'run' } }], ['Plan for Clothing', { settings: { planMode: 'clothing' } }], ['the Clothing-only results', { settings: { planMode: 'clothing' }, empty: true }], ['the ride at 320 px, 200% text', { width: 320, height: 568, scale: 2 }]];
  const land = async (o, file) => { const x = await openH(Object.assign({ browser: wk, dpr: 2, settle: 1500, noErrs: true }, o, file ? { file } : {})), p = x.p;
    if (o.empty) { await p.evaluate(() => localStorage.setItem('bluebird.library.v5', JSON.stringify({ gels: [], powders: [] }))); await reload(p); await settle(p, 1500); }
    if (!file) await ready(p, 'live');
    const box = await p.evaluate(() => { const b = document.getElementById('planSky'); return !!b && !b.hidden && b.getBoundingClientRect().height > 0; });
    await crunch(p); await sleep(800);
    const r = await p.evaluate(() => { const R = getComputedStyle(document.getElementById('results')).display !== 'none' ? document.getElementById('results') : document.getElementById('runResults'), hb = document.querySelector('body>header').getBoundingClientRect().bottom, b = document.getElementById('planSky');
      return { id: R.id, wearOnly: R.dataset.wearOnly || null, y: Math.round(scrollY), gap: Math.round(R.getBoundingClientRect().top - hb), out: !b || b.hidden }; });
    await x.close(); if (!file) ERRS.push(x.errors.filter(e => !/^console: Not allowed to load local resource: file:/.test(e))); /* (WebKit refuses a file page its own files: the manifest, fonts; every other error kept) */
    return Object.assign(r, { box }); };
  for (const [what, o] of CASES) {
    const r = await land(o), m = MAIN ? await land(o, MAIN) : null, want = m ? m.gap : 13;
    ok(r.box && r.out && (o.empty ? r.wearOnly === '1' : true) && (o.settings && o.settings.sport === 'run' ? r.id === 'runResults' : r.id === 'results') && Math.abs(r.gap - want) <= 2,
      '100.3, WebKit: a fresh Crunch on ' + what + ' lands as main does: the results\' top ' + r.gap + ' px under the header (' + (m ? 'main ' + m.gap : '13') + '), the box (shown before) out', { r, m });
  }
  await wk.close();
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
  /* (review round 3) a name is no change to what a friend shows: "Show their names" on, then off again (Settings and back), keeps each
     drawing and moves nothing (a sync or a restore takes the same path: renderProfileRows, crewSoon) */
  for (const on of [true, false]) {
    await toSettings(p); await p.click('#prowBtn-crewnames'); await settle(p, 150); await tab(p, 'plan');
    const N = await p.evaluate(S => new Promise(res => { let go = 0, run = 0; const V = document.getElementById('view-plan'), t0 = performance.now(); const look = () => { go = Math.max(go, V.querySelectorAll('.fwm-go').length); run = Math.max(run, document.getAnimations().filter(a => a.playState === 'running' && /^fw-/.test(a.animationName || '') && a.effect && V.contains(a.effect.target)).length);
      if (performance.now() - t0 < 1500) setTimeout(look, 50); else { const now = [...document.querySelectorAll(S)]; res({ go, run, names: document.querySelectorAll('#planCrew .crew-n').length, same: now.length === 6 && now.every((s, i) => s === window.__q100svg[i]) }); } }; look(); }), SPOTS);
    ok(N.go === 0 && N.run === 0 && N.same && N.names === (on ? 5 : 0), 'round rule a: "Show their names" turned ' + (on ? 'on' : 'off') + ': the names ' + (on ? 'under the friends' : 'gone') + ', nothing moves again and each spot keeps its drawing (the same svg nodes; review round 3)', N);
    const Y = await a11yCrew(p, on); ok(Y.ok, 'names: turned ' + (on ? 'on' : 'off') + ' with the page open, the accessibility tree ' + (on ? 'reads the list "The crew" of the five names' : 'reads no list and no name (aria-hidden, no label)') + ' at once, no reload (review round 7)', Y); }
  await x.close();
  for (const [what, o] of [['Reduce Motion', { motion: false }], ['Animate the world off', { motion: true, settings: { worldMotion: false } }]]) {
    const y = await openH(Object.assign({ query: '?sky=sun', width: 430, height: 932, settle: 50 }, o)); const s = await y.p.evaluate(() => new Promise(res => { let go = 0, run = 0, n = 0; const t0 = performance.now();
      const look = () => { go = Math.max(go, document.querySelectorAll('.fwm-go').length); run = Math.max(run, document.getAnimations().filter(a => a.playState === 'running' && /^fw-/.test(a.animationName || '')).length); n++; if (performance.now() - t0 < 3000) setTimeout(look, 100); else res({ go, run, n, rm: [...document.querySelectorAll('#planCrew .crew-a, #planSky>.rwx-fred')].every(a => a.classList.contains('fw-rm')), art: document.querySelectorAll('#planCrew .crew-a svg').length }); }; look(); }));
    ok(s.go === 0 && s.run === 0 && s.rm && s.art === 5, 'motion: ' + what + ': the crew and the box\'s fred are still (no .fwm-go, nothing running, .fw-rm on each spot)', s); await y.close(); }
});

section('room', async () => {
  /* each size on the page with sign-in configured (review round 3: the Privacy link shown from the boot, by privInit, as on the live site:
     its own 44 px row under the science link, the footer item next to the crew), and one on the Firebase-off page (no Privacy, as main) */
  const be = new Backend(), SIZES = [[320, 568], [375, 667], [390, 844], [430, 932]].flatMap(([w, h]) => [1, 1.5, 2].map(sc => [w, h, sc, true])).concat([[390, 844, 1, false]]);
  for (const [w, h, sc, cloud] of SIZES) {
    const x = await openH(Object.assign({ width: w, height: h, scale: sc, settings: { crewNames: true } }, cloud ? { file: SYNCED, route: be.handler('room') } : {})), p = x.p; await until(async () => (await crewOf(p)).art === 5); await endScroll(p);
    const g = await p.evaluate(() => { const U = document.getElementById('planCrew').getBoundingClientRect(), T = document.querySelector('nav.tabs').getBoundingClientRect(), F = document.querySelector('#view-plan>.fredfoot').getBoundingClientRect();
      const vis = sb => { let sr = sb.getBoundingClientRect(); if (sr.top < 0 || sr.bottom > innerHeight) { sb.scrollIntoView({ block: 'center' }); sr = sb.getBoundingClientRect(); }
        const at = sr.width && sr.height ? document.elementFromPoint(sr.left + sr.width / 2, sr.top + sr.height / 2) : null, v = !sb.hidden && getComputedStyle(sb).display !== 'none' && sr.width > 0 && sr.height > 0 && !!at && sb.contains(at); scrollTo(0, document.scrollingElement.scrollHeight); return v; };
      const pb = document.querySelector('#view-plan>.fredfoot>.privlink');
      return { shown: !document.getElementById('planCrew').hidden && U.height > 0, gap: Math.round(T.top - U.bottom), foot: Math.round(T.top - F.bottom), seen: vis(document.querySelector('#view-plan>.fredfoot>.footlink')), priv: vis(pb), privHidden: pb.hidden, sx: document.documentElement.scrollWidth > innerWidth }; });
    const at = w + ' x ' + h + ', ' + sc * 100 + '% text' + (cloud ? '' : ', Firebase off');
    ok(g.seen, 'QA: ' + at + ': the "Planning tool, not medical advice" footer stays, shown and not covered (its link is the element at its own centre)', g);
    ok(cloud ? g.priv : g.privHidden, cloud ? 'QA: ' + at + ': the Privacy link (sign-in configured) shown and not covered (the element at its own centre; review round 3)' : 'QA: ' + at + ': no Privacy link without sign-in configured (as main)', g);
    ok(g.shown ? g.gap >= 8 && g.foot >= 0 && !g.sx : true, '100.4, QA: ' + at + ': at the end of the scroll the crew sits ' + g.gap + ' px clear of the tab bar (8 or more), the footer clear of it, no sideways scroll', g);
    ok(g.shown, 'room: ' + at + ': the crew shows (there is room)', g);
    await x.close(); }
  /* review round 4: a Face ID iPhone, the installed app (viewport-fit=cover, standalone): the home indicator's inset, 34 px, the real env()
     through CDP: the tab bar grows by it; the crew still shows, 8 px or more clear of it, at iOS's text sizes (17 and 21 px) */
  for (const [w, h, sc, cloud] of [[375, 812, 17 / 16], [390, 844, 17 / 16], [430, 932, 17 / 16], [375, 812, 21 / 16], [430, 932, 21 / 16], [390, 844, 17 / 16, true]]) {
    const x = await openH(Object.assign({ width: w, height: h, scale: sc }, cloud ? { file: SYNCED, route: be.handler('room') } : {})), p = x.p;
    const cdp = await x.ctx.newCDPSession(p); await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 47, bottom: 34, left: 0, right: 0 } }); await reload(p); await sleep(600);
    await until(async () => (await crewOf(p)).art === 5); await sleep(300); await endScroll(p);
    const g = await p.evaluate(() => { const U = document.getElementById('planCrew'), u = U.getBoundingClientRect(), T = document.querySelector('nav.tabs').getBoundingClientRect(), F = document.querySelector('#view-plan>.fredfoot').getBoundingClientRect(), pr = document.createElement('div'); pr.style.paddingBottom = 'env(safe-area-inset-bottom,0px)'; document.body.append(pr); const e = getComputedStyle(pr).paddingBottom; pr.remove();
      return { env: e, nav: Math.round(T.height), shown: !U.hidden && u.height > 0, room: U.dataset.room, gap: u.height ? Math.round(T.top - u.bottom) : null, foot: Math.round(T.top - F.bottom), sx: document.documentElement.scrollWidth > innerWidth }; });
    ok(g.env === '34px' && g.nav >= 88 && g.shown && g.gap >= 8 && g.foot >= 0 && !g.sx, '100.4, QA: the home indicator\'s 34 px inset (' + w + ' x ' + h + ', ' + Math.round(sc * 16) + ' px text' + (cloud ? ', sign-in configured' : '') + ', the tab bar ' + g.nav + ' px): the crew shows, ' + g.gap + ' px clear of the tab bar', g);
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
  // a tablet and a phone turned (check round 2): the friends keep a large phone's size (76 px a body at most), the row centred
  for (const [w, h] of [[768, 1024], [1024, 768], [844, 390]]) {
    const y = await openH({ width: w, height: h, query: '?sky=sun' }), q = y.p; await until(async () => (await crewOf(q)).art === 5, 8000); await endScroll(q);
    const g = await q.evaluate(() => { const U = document.getElementById('planCrew'), r = U.getBoundingClientRect(), A = [...U.querySelectorAll('.crew-f')].map(li => { const a = li.querySelector('.crew-a').getBoundingClientRect(); return { w: +a.width.toFixed(1), h: +a.height.toFixed(1), cap: 76 * +li.style.getPropertyValue('--bw') }; });
      const L = Math.min(...[...U.querySelectorAll('.crew-f')].map(li => li.getBoundingClientRect().left)), R = Math.max(...[...U.querySelectorAll('.crew-f')].map(li => li.getBoundingClientRect().right)), F = document.querySelector('#planSky>.rwx-fred');
      return { dk: document.documentElement.classList.contains('dk'), shown: !U.hidden && r.height > 0, h: +r.height.toFixed(1), A, over: A.filter(a => a.w > a.cap + .5).length, tall: Math.max(...A.map(a => a.h)), ch: 76 * +U.style.getPropertyValue('--ch'), centre: Math.abs((L - r.left) - (r.right - R)), fred: F ? +F.getBoundingClientRect().width.toFixed(1) : null }; });
    ok(!g.dk && g.over === 0 && g.tall <= g.ch + .5 && (!g.shown || (g.h <= g.ch + 1 && g.centre <= 1.5)), 'QA: ' + w + ' x ' + h + ' (a tablet or a phone turned): each friend at most 76 px a body (' + g.A.map(a => a.w).join(', ') + '; fred ' + g.fred + '), the crew ' + g.h + ' px tall (at most ' + g.ch.toFixed(1) + ')' + (g.shown ? ', the row centred' : ', left out here: no room'), g);
    if (w === 768) ok(g.shown, 'room: 768 x 1024: the crew shows', g);
    await y.close(); }
});

section('saved', async () => {
  /* kit step (a skeptic): after Save to Journal Plan is the ticket again and the box is back (116 px), so the pinned Crunch went down to the
     tab bar where the fixed "Saved to Journal ✓ · View ›" strip (z-index 6, 5 s) sits: at 100% text 11 px of Crunch showed (main, a
     shorter page, 56: Crunch in place above the strip), and a tap at its centre found the strip. The layout audit skips a covered target,
     so this is held here: from the first frame the strip shows, in every frame for a second, Crunch is on the screen, no part of it under
     the strip, at least 44 px of it showing, and what a tap at its centre reaches; through a scroll of the whole page while the strip
     shows, no part of Crunch under it; the strip's View its own centre; once the strip is gone Crunch is back in its place (its pinned
     bottom as before the save) and still reached. 320-430 px x 844, 100/150/200% text (main's known cover at 150% and 200% ends too),
     320 x 568, WebKit, and the computer layout (the strip in the plan's column: Crunch never moved there) */
  const wk = await webkit.launch();
  const SIZES = [320, 375, 390, 430].flatMap(w => [1, 1.5, 2].map(sc => ['Chromium', browser, w, 844, sc]))
    .concat([['Chromium', browser, 320, 568, 1], ['Chromium', browser, 320, 568, 2], ['WebKit', wk, 390, 844, 1], ['WebKit', wk, 320, 568, 2], ['Chromium', browser, 1280, 800, 1]]);
  for (const [eng, b, w, h, sc] of SIZES) {
    const x = await openH({ width: w, height: h, scale: sc, browser: b, noErrs: true }), p = x.p, at = eng + ', ' + w + ' x ' + h + ', ' + sc * 100 + '% text';
    const bot0 = await p.evaluate(() => getComputedStyle(document.getElementById('crunchBar')).bottom);
    await crunch(p);
    await p.evaluate(() => { const C = document.getElementById('calcBtn'), S = document.getElementById('planSaved');
      /* Crunch's part on the screen (below the sticky header, above the bottom tab bar and the window's edge), the part of it under the
         strip (both ways: on the computer layout the strip is in another column), and what a tap at the centre of that part reaches */
      window.__q100cl = () => { const c = C.getBoundingClientRect(), s = S.getBoundingClientRect(), hd = document.querySelector('body>header'), nv = document.querySelector('nav.tabs');
        const hb = hd && hd.getClientRects().length ? Math.max(0, hd.getBoundingClientRect().bottom) : 0, nr = nv && nv.getClientRects().length ? nv.getBoundingClientRect() : null, nt = nr && nr.top > innerHeight / 2 ? nr.top : innerHeight;
        const top = Math.max(c.top, hb), bot = Math.min(c.bottom, nt), on = Math.max(0, bot - top), xo = S.hidden || !s.height ? 0 : Math.max(0, Math.min(c.right, s.right) - Math.max(c.left, s.left));
        const under = xo > 0 ? Math.max(0, Math.min(bot, s.bottom) - Math.max(top, s.top)) : 0, hit = on > 0 ? document.elementFromPoint(c.left + c.width / 2, (top + bot) / 2) : null;
        return { on: Math.round(on), under: Math.round(under), clear: Math.round(on - under), hit: !!hit && C.contains(hit), at: hit ? (hit.id || hit.className || hit.tagName) : null, c: [Math.round(c.top), Math.round(c.bottom)], s: S.hidden ? null : [Math.round(s.left), Math.round(s.top), Math.round(s.right), Math.round(s.bottom)] }; };
      const W = window.__q100sv = { n: 0, bad: [], least: null, done: false }; let t0 = 0;
      const f = t => { if (!S.hidden && S.getClientRects().length) { if (!t0) t0 = t; const m = window.__q100cl(); W.n++; if (!W.least || m.clear < W.least.clear) W.least = m; if (m.under || m.clear < 44 || !m.hit) W.bad.push(m); } /* (on the computer layout Crunch is in the page, not pinned: 49 px of it above the fold at 1280 x 800, the rest a scroll away) */
        if (t0 && t - t0 > 1000) { W.done = true; return; } requestAnimationFrame(f); }; requestAnimationFrame(f); });
    await p.click('#journalBtn'); await until(() => p.evaluate(() => window.__q100sv.done), 8000);
    const fr = await p.evaluate(() => window.__q100sv);
    const st = await p.evaluate(() => { const V = document.getElementById('planSavedView').getBoundingClientRect(), v = document.elementFromPoint(V.left + V.width / 2, V.top + V.height / 2);
      return Object.assign(window.__q100cl(), { dk: document.documentElement.classList.contains('dk'), y: Math.round(scrollY), view: !!v && v.id === 'planSavedView', bot: getComputedStyle(document.getElementById('crunchBar')).bottom }); });
    const walk = await p.evaluate(() => new Promise(res => { const H = document.scrollingElement.scrollHeight - innerHeight, bad = []; let y = 0, n = 0;
      const step = () => { scrollTo(0, y); requestAnimationFrame(() => requestAnimationFrame(() => { const m = window.__q100cl(); n++; if (m.under || (m.on >= 44 && !m.hit)) bad.push(Object.assign({ y: Math.round(scrollY) }, m));
        if (y >= H) { const shown = !document.getElementById('planSaved').hidden; scrollTo(0, 0); requestAnimationFrame(() => res({ n, H, bad: bad.slice(0, 4), shown })); } else { y = Math.min(H, y + 40); step(); } })); }; step(); }));
    ok(fr.n >= 10 && !fr.bad.length, 'kit step, ' + at + ': after Save to Journal, in every frame of the first second of the strip (' + fr.n + '), Crunch shows ' + (fr.least ? fr.least.clear : '?') + ' px clear of the "Saved to Journal" strip (44 or more), none of it under the strip, and a tap at its centre reaches Crunch', { least: fr.least, bad: fr.bad.slice(0, 3) });
    ok(st.clear >= 44 && !st.under && st.hit && (st.dk || st.view), 'kit step, ' + at + ': with the strip shown, Crunch ' + J(st.c) + ' clear of the strip ' + J(st.s) + ' and reached at its centre' + (st.dk ? '' : '; View on the strip reached at its own centre'), st); /* (the computer layout's strip is main's: a 32 px sliver at the left edge after a save, HANDOFF) */
    ok(walk.shown && walk.n >= 1 && !walk.bad.length, 'kit step, ' + at + ': through a scroll of the whole page (' + walk.H + ' px, ' + walk.n + ' steps) with the strip shown, no part of Crunch under it, and wherever 44 px of it show, a tap at their centre reaches it', walk);
    if (st.dk) ok(st.bot === bot0, 'kit step, ' + at + ': the computer layout: the pinned bottom of Crunch unchanged while the strip shows (' + st.bot + ')', { bot0, st });
    await until(() => p.evaluate(() => document.getElementById('planSaved').hidden), 8000); await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const af = await p.evaluate(() => Object.assign(window.__q100cl(), { bot: getComputedStyle(document.getElementById('crunchBar')).bottom, nav: document.querySelector('nav.tabs').offsetHeight, gone: document.getElementById('planSaved').hidden }));
    const home = st.dk ? af.bot === bot0 : af.bot === bot0 && Math.abs(parseFloat(af.bot) - af.nav) < .5; /* (on a phone Crunch is pinned on the tab bar, before the save and after the strip) */
    ok(af.gone && home && af.hit && af.on >= 44, 'kit step, ' + at + ': the strip gone, Crunch back in its place (its pinned bottom ' + af.bot + ', as before the save' + (st.dk ? '' : ', on the ' + af.nav + ' px tab bar') + ') and reached at its centre', { bot0, af });
    await x.close(); ERRS.push(x.errors.filter(e => !/^console: Not allowed to load local resource: file:/.test(e))); }
  await wk.close();
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
  /* (review round 3) the box named for the session, as the run relabels its other words (q47): on the run "Run forecast", no ride word */
  const lab = async () => (await p.locator('#planSky').ariaSnapshot()).split('\n')[0];
  { const n = await lab(); ok(n === '- region "Run forecast":', '100.6, q47: on the run the box is announced as the run forecast, no ride word (' + n + ')', n); }
  const o = await p.evaluate(() => { const E = ['rideSec', 'planSky', 'carryCard', 'planSetBox'].map(id => document.getElementById(id)), fol = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING), R = E.map(e => e.getBoundingClientRect());
    return { dom: fol(E[0], E[1]) && fol(E[1], E[2]) && fol(E[1], E[3]), screen: R[0].bottom <= R[1].top + 1 && R[1].bottom <= R[2].top + 1 && R[1].bottom <= R[3].top + 1, tops: R.map(r => Math.round(r.top)), shown: E.map(e => e.getClientRects().length > 0) }; });
  ok(o.dom && o.screen && o.shown.every(Boolean), '100.1, Build: on the run the box sits after the ticket, before the Carry box and Settings (in the page and on the screen: ' + o.tops.join(', ') + ')', o);
  const pt = await painted(p); ok(pt.rows >= 1 && pt.same === 0, '100.6: the run\'s graphite: the line is painted over the sky (each of its ' + pt.rows + ' rows looks different with the line hidden)', pt);
  await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=ride]'); await until(() => p.evaluate(() => !document.documentElement.classList.contains('run-theme'))); await sleep(300);
  ok((await crewOf(p)).on, 'theme: back on the ride the crew shows again', await crewOf(p));
  { const n = await lab(); ok(n === '- region "Ride forecast":', 'theme: back on the ride the box is announced as the ride forecast (' + n + ')', n); }
  await x.close();
});

section('switch', async () => {
  const x = await openH(), p = x.p; await toSettings(p);
  const s = await p.evaluate(() => { const g = document.querySelector('#view-profile .sg-fw'), row = id => { const b = document.getElementById(id); return b && { in: g.contains(b), pressed: b.getAttribute('aria-pressed'), label: b.querySelector('.prow-l').textContent, h: b.getBoundingClientRect().height }; };
    const st = JSON.parse(localStorage.getItem('bluebird.settings.v2') || '{}'), Q = window.__q100; return { show: row('prowBtn-crewshow'), names: row('prowBtn-crewnames'), stored: ['crewShow', 'crewNames'].filter(k => k in st || k in Q.settings), def: ['crewShow', 'crewNames'].filter(k => k in Q.DEFAULT_SETTINGS) }; });
  ok(s.show && s.show.in && s.show.label === 'Show the crew' && s.show.pressed === 'true' && s.show.h >= 44, '100.5: Settings › fred world › "Show the crew", on', s.show);
  ok(s.names && s.names.in && s.names.label === 'Show their names' && s.names.pressed === 'false' && s.names.h >= 44, '100.5: Settings › fred world › "Show their names", off', s.names);
  ok(!s.stored.length && !s.def.length, '100.5: neither is stored, nor in DEFAULT_SETTINGS, until tapped (as settings.worldMotion)', s);
  await p.click('#prowBtn-crewnames'); await settle(p, 150); await tab(p, 'plan'); /* (the crew on and built: only the aria line can change the list for VoiceOver) */
  { const Y = await a11yCrew(p, true); ok(Y.ok, 'switch: "Show their names" tapped on, the crew already shown: the accessibility tree reads the list "The crew" of the five names (review round 7)', Y); }
  await toSettings(p); await p.click('#prowBtn-crewshow'); await settle(p, 150);
  const a = await p.evaluate(() => JSON.parse(localStorage.getItem('bluebird.settings.v2'))), w1 = await swOf(p); await tab(p, 'plan'); const c = await crewOf(p);
  ok(a.crewNames === true && a.crewShow === false && !c.on && c.art === 0, '100.5: a tap stores settings.crewNames / crewShow; the crew off: none shown, no art kept', { st: [a.crewShow, a.crewNames], c });
  ok(w1.crewnames === 'true on' && w1.crewshow === 'false off', '100.5: each switch shows its new state after the tap ("Show their names" on, "Show the crew" off: aria-pressed and drawn; review round 6)', w1);
  await toSettings(p); await p.click('#prowBtn-crewshow'); await settle(p, 150); const w2 = await swOf(p); await tab(p, 'plan'); await until(async () => (await crewOf(p)).art === 5); const d = await crewOf(p);
  ok(d.on && d.names.length === 5 && w2.crewshow === 'true on' && w2.crewnames === 'true on', '100.5: on again (with the names on): the crew shows with its names, both switches shown on', { d, w2 });
  { const Y = await a11yCrew(p, true); ok(Y.ok, 'switch: on again (with the names on): the accessibility tree reads the list "The crew" of the five names (review round 7)', Y); }
  await reload(p); await until(async () => (await crewOf(p)).art === 5); const e = await crewOf(p), st = await p.evaluate(() => JSON.parse(localStorage.getItem('bluebird.settings.v2'))); await toSettings(p); const w3 = await swOf(p);
  ok(e.on && e.names.length === 5 && st.crewShow === true && st.crewNames === true && w3.crewshow === 'true on' && w3.crewnames === 'true on', 'switch: a reload keeps them (both switches shown on)', { e, st: [st.crewShow, st.crewNames], w3 });
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
    if (w === 390 && sc === 1) { const snap = await p.locator('#planCrew').ariaSnapshot(), exp = ['- list "The crew":', ...want.map(n => '  - listitem: ' + n)].join('\n'), hid = await p.evaluate(() => [...document.querySelectorAll('#planCrew .crew-a')].map(a => a.getAttribute('aria-hidden')));
      ok(snap.trim() === exp && hid.length === 5 && hid.every(v => v === 'true'), 'names: on, the accessibility tree reads exactly a list "The crew" of the five names (real text), each drawing aria-hidden', { snap, hid }); }
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
  const priv = await A.p.evaluate(() => { const b = document.querySelector('#view-plan>.fredfoot>.privlink'); if (!b) return { v: false }; b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); /* (in the middle of the screen: clear of the tab bar) */
    const at = r.width && r.height ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null, v = !b.hidden && getComputedStyle(b).display !== 'none' && r.width > 0 && r.height > 0 && !!at && b.contains(at); scrollTo(0, 0);
    return { v, r: [r.left, r.top, r.width, r.height].map(Math.round), at: at ? at.tagName + '#' + at.id + '.' + at.className : null, vh: innerHeight }; }); /* (not covered: the element at its own centre; review round 3) */
  ok(priv.v, 'QA: where sign-in is configured, the Plan footer\'s Privacy link shows, not covered (the footer the crew follows)', priv);
  const nudge = async (cond, ms = 45000) => { const t = Date.now(); while (Date.now() - t < ms) { for (const x of [A, B]) await x.p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(1500); const v = await cond().catch(() => null); if (v) return v; } return null; };
  await toSettings(A.p); await A.p.click('#prowBtn-crewnames'); await settle(A.p, 200);
  const up = await until(() => (doc().settings || {}).crewNames === true, 20000), at = doc().settingsAt || {};
  ok(!!up && typeof at.crewNames === 'number' && !('crewShow' in (doc().settings || {})), 'sync: A\'s "Show their names" reaches the cloud as its own key (settings.crewNames, one settingsAt stamp; crewShow untouched, not stored)', { s: doc().settings && doc().settings.crewNames, at: Object.keys(at) });
  /* B stays on Plan: once A's value is in B's settings (a pull), B's crew follows it with nothing else happening (the settings applied
     redraw it: no tab tap, no app-open) */
  await B.p.evaluate(() => document.querySelector('nav.tabs button[data-view=plan]').click()); await settle(B.p, 200);
  await until(async () => (await crewOf(B.p)).art === 5); await B.p.evaluate(() => { window.__q100crew = [...document.querySelectorAll('#planCrew .crew-a>svg')]; });
  const got = await nudge(() => B.p.evaluate(() => window.__q100.settings.crewNames === true));
  await sleep(600); const bOk = await crewOf(B.p), kept = await B.p.evaluate(() => { const now = [...document.querySelectorAll('#planCrew .crew-a>svg')]; return now.length === 5 && now.every((s, i) => s === window.__q100crew[i]); });
  ok(!!got && bOk.names.length === 5 && kept, 'QA: the crew switches sync: B (on Plan) shows the names A turned on as soon as they arrive, each friend kept (the same drawings: a name is no new look; review round 3)', { bOk, kept });
  { const w = await swOf(B.p); ok(w.crewnames === 'true on' && w.crewshow === 'true on', 'sync: "Show their names" on B shows on once the value from A arrives (review round 6)', w); }
  { const Y = await a11yCrew(B.p, true); ok(Y.ok, 'sync: on B (on Plan) the names from A reach the accessibility tree too: the list "The crew" of the five names (review round 7)', Y); }
  await toSettings(B.p); await B.p.click('#prowBtn-crewshow'); await settle(B.p, 200);
  await A.p.evaluate(() => document.querySelector('nav.tabs button[data-view=plan]').click()); await settle(A.p, 200);
  const gotA = await nudge(() => A.p.evaluate(() => window.__q100.settings.crewShow === false)); await sleep(600); const aOff = await crewOf(A.p);
  ok(!!gotA && !aOff.on && aOff.art === 0 && (doc().settings || {}).crewShow === false && typeof (doc().settingsAt || {}).crewShow === 'number', 'QA: B turns the crew off: A\'s crew goes as soon as it arrives (settings.crewShow false in the cloud, its own stamp)', aOff);
  { const w = await swOf(A.p); ok(w.crewshow === 'false off' && w.crewnames === 'true on', 'sync: "Show the crew" on A shows off once the value from B arrives, the names switch still on (review round 6)', w); }
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
  const w1 = await swOf(p); ok(r1.names.length === 5 && w1.crewnames === 'true on', 'backup: restored on a fresh page (names off), the names show (the restore redraws the crew) and their switch shows on (review round 6)', { r1, w1 }); await tab(p, 'plan');
  { const Y = await a11yCrew(p, true); ok(Y.ok, 'backup: that restore (names on, over names off) reaches the accessibility tree: the list "The crew" of the five names (review round 7)', Y); }
  const old = JSON.parse(JSON.stringify(ex)); delete old.settings.crewNames; delete old.settings.crewShow; await restore(p, old); await tab(p, 'plan'); await sleep(300);
  const c = await crewOf(p), st = await p.evaluate(() => window.__q100.settings), ls = await p.evaluate(() => JSON.parse(localStorage.getItem('bluebird.settings.v2')));
  ok(c.on && c.names.length === 5 && st.crewNames === true && ls.crewNames === true && !('crewShow' in st), 'backup: a backup without them keeps this device\'s (names on stay on, stored; as the rider, birthday and gender)', { c, st: [st.crewShow, st.crewNames], ls: ls.crewNames });
  await y.close();
  const z = await openH({ settings: { crewShow: false } }), q = z.p; await restore(q, old); await tab(q, 'plan'); await sleep(300); const d = await crewOf(q), sz = await q.evaluate(() => window.__q100.settings);
  ok(!d.on && d.art === 0 && sz.crewShow === false, 'backup: one without them on a device with the crew off: it stays off', { d, crewShow: sz.crewShow });
  await z.close();
  /* (review round 3) the file's own values come back: a backup with the crew off, restored on a device with it on, turns it off; one with
     the names off, restored on a device with them on, takes them away */
  for (const [k, mine] of [['crewShow', {}], ['crewNames', { crewNames: true }]]) {
    const s = await openH({ settings: { [k]: false } }), e = await s.p.evaluate(() => JSON.parse(JSON.stringify(window.__q100.backupData()))); await s.close();
    ok(e.settings && e.settings[k] === false, 'backup: a backup made with ' + k + ' off carries it (backupData().settings.' + k + ' false)', e.settings && e.settings[k]);
    const u = await openH({ settings: mine }), q = u.p; await until(async () => (await crewOf(q)).art === 5); const w0 = await swOf(q);
    ok(w0[k.toLowerCase()] === 'true on', 'backup: before that restore the ' + k + ' switch of the device shows on (so the off after it comes from the file; review round 6)', w0); await restore(q, e); await tab(q, 'plan'); await sleep(300);
    const c = await crewOf(q), r = await q.evaluate(k => { const b = document.getElementById(k === 'crewShow' ? 'prowBtn-crewshow' : 'prowBtn-crewnames'); return { st: window.__q100.settings[k], ls: JSON.parse(localStorage.getItem('bluebird.settings.v2'))[k], pressed: b && b.getAttribute('aria-pressed') }; }, k);
    ok(r.st === false && r.ls === false && r.pressed === 'false' && (k === 'crewShow' ? !c.on && c.art === 0 : c.on && c.names.length === 0), 'backup: one with ' + k + ' off restored on a device with it on: off (' + (k === 'crewShow' ? 'no crew, no art' : 'no names') + ', stored, the switch off; review round 3)', { c: [c.on, c.art, c.names.length], r });
    if (k === 'crewNames') { const Y = await a11yCrew(q, false); ok(Y.ok, 'backup: that restore (names off, over names on) takes them from the accessibility tree too: no list, no name (aria-hidden, no label; review round 7)', Y); }
    await u.close(); }
});

section('media', async () => {
  const x = await openH({ query: '?sky=sun', settings: { crewNames: true }, dpr: 2 }), p = x.p; await ready(p, 'live', 'sun'); await until(async () => (await crewOf(p)).art === 5);
  const look = () => p.evaluate(() => { const W = document.getElementById('planSky'), d = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).display : 'gone'; };
    const L = document.getElementById('planSkyL');
    const pad = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce((n, k) => n + parseFloat(getComputedStyle(W)[k]), 0);
    return { h: +W.getBoundingClientRect().height.toFixed(1), lineH: +L.getBoundingClientRect().height.toFixed(1), pad, minh: getComputedStyle(W).minHeight, shadow: getComputedStyle(L).textShadow, room: getComputedStyle(L, '::before').display + ' ' + getComputedStyle(L, '::before').width + ' ' + getComputedStyle(L).paddingRight, box: d('#planSky'), edge: getComputedStyle(W).borderTopWidth + ' ' + getComputedStyle(W).borderTopStyle, fred: d('#planSky>.rwx-fred'), svg: d('#planSky>.rwx-fred>svg'), scene: d('#planSky>.rwx-scene'), crew: d('#planCrew'), art: d('#planCrew .crew-a'), line: d('#planSkyL') }; });
  await p.emulateMedia({ media: 'print' }); const pr = await look(); await p.emulateMedia({ media: 'screen' });
  ok(pr.box !== 'none' && pr.line !== 'none' && pr.fred === 'none' && pr.scene === 'none' && pr.crew === 'none', 'QA print: no sky, no fred, no crew (the box\'s words stay)', pr);
  ok(pr.shadow === 'none' && /^none /.test(pr.room) && / 0px$/.test(pr.room), 'print: the line without its feather (each ring would print as another copy of the words) and without fred\'s room', pr);
  ok(pr.h <= pr.lineH + pr.pad + 2, 'print: the box the line\'s height and its padding (' + pr.h + ' px; no height kept for fred, who is not printed)', pr);
  for (const cs of ['light', 'dark']) { await p.emulateMedia({ forcedColors: 'active', colorScheme: cs }); const fc = await look();
    ok(fc.box !== 'none' && / solid$/.test(fc.edge) && parseFloat(fc.edge) >= 1 && (fc.fred === 'none' || fc.svg === 'none') && fc.scene === 'none' && fc.art === 'none', 'QA forced colours (' + cs + '): the art out (fred, the sky, the crew), the box\'s edge kept', fc); }
  await p.emulateMedia({ forcedColors: 'none' }); await x.close();
});

section('fit', async () => {
  // the line as laid out: its rows (units: no break inside but at a plain space), whether they sit inside the box and clear of fred
  const fitOf = p => p.evaluate(() => { const W = document.getElementById('planSky'), Wr = W.getBoundingClientRect(), L = document.getElementById('planSkyL'), f = W.querySelector(':scope>.rwx-fred').getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(L);
        const T = [...rg.getClientRects()].filter(r => r.width > .5), bodyL = f.left + f.width * .12, beside = T.filter(r => (r.top + r.bottom) / 2 < f.bottom), right = Math.max(...beside.map(r => r.right)); /* (rows whose middle is above fred's foot: beside him; the rows under him take the box's width) */
        const split = [], U = []; const tw = document.createTreeWalker(L, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const re = /[^ \t\n]+/g; let m; while ((m = re.exec(n.data))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const Q = [...r.getClientRects()].filter(q => q.width > .5);
          if (new Set(Q.map(q => Math.round(q.top))).size > 1) split.push(m[0]); /* (a unit: no break inside it but at a plain space: "8:00 AM ·" is one, each word of the place one) */
          if (Q.length) U.push({ w: m[0], l: Math.min(...Q.map(q => q.left)), r: Math.max(...Q.map(q => q.right)), t: Math.min(...Q.map(q => q.top)), b: Math.max(...Q.map(q => q.bottom)) }); } }
        /* the rows (units overlapping in height: the big number shares its row), each row's first unit; beside fred's room (the float) a row
           followed by a unit that would have fitted in what it left is left short */
        const R = []; U.slice().sort((a, b) => a.t - b.t).forEach(u => { const r = R.find(r => Math.min(r.b, u.b) - Math.max(r.t, u.t) > .5 * Math.min(r.b - r.t, u.b - u.t)); if (r) { r.u.push(u); r.t = Math.min(r.t, u.t); r.b = Math.max(r.b, u.b); } else R.push({ t: u.t, b: u.b, u: [u] }); });
        R.sort((a, b) => a.t - b.t).forEach(r => r.u.sort((a, b) => a.l - b.l)); const fl = getComputedStyle(L, '::before'), Lr = L.getBoundingClientRect(), roomL = Lr.right - parseFloat(getComputedStyle(L).paddingRight) - parseFloat(fl.width), roomB = Lr.top + parseFloat(fl.height), sp = parseFloat(getComputedStyle(L).fontSize);
        const short = R.slice(0, -1).map((r, k) => ({ r, nx: R[k + 1].u[0] })).filter(({ r, nx }) => r.t < roomB - .5 && nx.r - nx.l + .4 * sp < roomL - r.u[r.u.length - 1].r) /* (with a space before it: .4em, a little more than a space and the letter-spacing) */.map(({ r, nx }) => r.u.map(u => u.w).join(' ') + ' | ' + nx.w);
        const band = R.slice(1).filter((r, k) => R[k].t < roomB - .5 && r.t - R[k].b > sp && r.u[0].r - r.u[0].l < roomL - Lr.left).length; /* an empty row beside fred: the next row a line or more below one beside him (rows sit about .3em apart) though its first word fits beside him (a word too long for that room goes under him whole) */
        return { line: L.textContent, rows: R.map(r => r.u.map(u => u.w).join(' ')), band, dot: R.filter(r => /^\s*·/.test(r.u[0].w)).length /* (\s: a no-break space before the dot moves with it) */, short, h: Math.round(Wr.height), inside: T.every(r => r.left >= Wr.left && r.right <= Wr.right && r.top >= Wr.top && r.bottom <= Wr.bottom), clear: right <= bodyL + .5, split, fred: f.bottom <= Wr.bottom && f.top >= Wr.top && f.right <= Wr.right, cut: L.scrollWidth > L.clientWidth + 1, sx: document.documentElement.scrollWidth > innerWidth, right: Math.round(right), bodyL: Math.round(bodyL) }; });
  for (const [w, h] of [[320, 568], [375, 812], [390, 844]]) for (const sc of [1.5, 2]) {
    const x = await openH({ query: '?sky=rain', width: w, height: h, scale: sc }), p = x.p; await ready(p, 'live', 'rain');
    for (const place of ['Carmel, IN', 'Indianapolis, IN', 'Mechanicsburg, PA', 'Salt Lake City, UT', 'San Francisco, CA', 'Rancho Santa Margarita, CA']) {
      if (place !== 'Carmel, IN') { await setPlace(p, place); await until(async () => { const B = await boxOf(p); return B.wx === 'live' && B.line.includes(place.split(',')[0]); }, 15000); await sleep(300); }
      const g = await fitOf(p);
      ok(g.inside && g.clear && g.fred && !g.cut && !g.sx && !g.split.length, 'QA: ' + place + ', ' + w + ' px, ' + sc * 100 + '% text: the line wraps inside the box, its rows beside fred clear of him, no word over two rows; fred inside the box; nothing cut, no sideways scroll', g);
      ok(!g.short.length && !g.band && !g.dot, 'QA: ' + place + ', ' + w + ' px, ' + sc * 100 + '% text: no row beside fred left empty or short of a word that fits there, no row starting with a dot (' + g.rows.join(' / ') + '; the box ' + g.h + ' px)', g); }
    await x.close(); }
  /* review round 5: past 200% (the root is the iPhone text size, uncapped: Larger Text AX3-AX5 are 40, 47 and 53 px) the time goes under
     fred whole as a place word does, a two-digit hour too, in Chromium and WebKit (the line's overflow-wrap:anywhere once broke the plain
     text "8:00 AM ·" in the room beside him: "8:00 A / M ·" from 47 px, "12:30 PM / · CARMEL ·" at 40 px, a row starting with the dot) */
  const wk = await webkit.launch();
  for (const [eng, b] of [['Chromium', browser], ['WebKit', wk]]) for (const [w, h, sc, st] of [[320, 568, 2.5, '08:00'], [320, 568, 2.5, '12:30'], [320, 568, 2.9375, '08:00'], [320, 568, 2.9375, '12:30'], [320, 568, 3.3125, '08:00'], [320, 568, 3.3125, '12:30'], [375, 667, 3.3125, '12:30']]) {
    const x = await openH({ query: '?sky=rain', width: w, height: h, scale: sc, browser: b, noErrs: true }), p = x.p, tm = st === '08:00' ? '8:00 AM' : '12:30 PM'; await ready(p, 'live', 'rain');
    if (st !== '08:00') await sheet(p, () => setField(p, '#startTime', st));
    await until(async () => { const B = await boxOf(p); return B.wx === 'live' && (B.line || '').includes(tm); }, 15000); await sleep(400);
    const g = await fitOf(p), what = eng + ', ' + w + ' px, a ' + Math.round(16 * sc) + ' px root, ' + st.replace(/^0/, '') + ': ';
    ok(g.inside && g.clear && g.fred && !g.cut && !g.sx && !g.split.length && !g.dot && g.rows.some(r => r.includes(tm + ' ·')), 'QA: ' + what + 'the time on one row with its dot (never broken inside), no row starting with a dot, the rows beside fred clear of him, inside the box (' + g.rows.join(' / ') + ')', g);
    await x.close(); ERRS.push(x.errors.filter(e => !/^console: Not allowed to load local resource: file:/.test(e))); }
  await wk.close();
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
