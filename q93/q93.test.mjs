// node q93.test.mjs <null.html> [main null.html]   (cd into this folder first) -- item 93: Ride ticket: tap the number, spin the wheel.
// Every numbered point and QA line of QUEUE.md item 93 and every point of DECISIONS.md "Item 93":
//   cache    the cache bump: sw.js CACHE and APP_BUILD match, v118 or later
//   ticket   no Duration button (#howBtn, #howL gone; the sport chip alone on the top row), #tkBig is the button that opens How long
//            (aria-haspopup=dialog, the accessible name "How long: 5:00 hours. Change" / "How long: 100 mi · 18 mph, about 5 h 33 m. Change"),
//            press .97, the gradient (first stop #10759D), AA on it, the keyboard (Enter opens, Escape closes, focus comes back)
//   sheet    top to bottom: Cancel · How long · Done, the full-width Time | Distance switch (item 85 pill), the live readout, the wheels;
//            the band (fixed, 44 px, radius 11, --tint-blue), the 236 px white box (1.5 px border, radius 18), 44 px rows, 70 px fades,
//            23 px tabular type (centre ink 700, the rest grey 500), units in the band in the body text colour, the drum (rotateX, scale,
//            opacity, hidden past 3.2 rows, perspective 420 px; between rows too), the fades' direction, ranges
//   live     the value, aria-valuenow / valuetext, the readout and the Done value change the moment a row crosses the centre (on scroll:
//            scrollend is kept from the page, which Chromium fires after each instant scroll; and a smooth 12-row scroll sampled at every
//            frame while it moves, ticking as it goes, the iPhone too);
//            scroll-snap y mandatory (a scroll that stops between rows settles on one); the tick never leaves the focus on the hidden switch
//            (an iPhone model with no navigator.vibrate too); the first tick does not refit the app
//   keys     each wheel a spinbutton (Hours, Minutes, Distance, Average speed; named, min / max / now / text): Up / Right +1, Down / Left -1, Page Up / Down +-4, Home, End,
//            digits (a row that is the typed number first: a run's 5 is 5 mi, not 0.5); a tap on a row goes to that row (Hours, Minutes,
//            Distance, Average speed: by its row, not its value; live section); the rows are
//            aria-hidden with a named contrast exemption; every unit ("h" / "min", "mi" / "mph", "km" / "km/h", "/mi") in the band; a flip of
//            Time | Distance keeps what was spun in the other pane until Done or Cancel (the demo's draft), Cancel drops it
//   haptic   one tick per step: vibrate(6) where navigator.vibrate exists (Android), else the hidden switch (checkbox[switch] + label, off
//            screen, aria-hidden, tabindex -1; the iPhone), at most one per 28 ms, focus stays on the wheel, the tick also under Reduce
//            Motion (both paths)
//   done     Done applies (time; distance + speed + about; Distance -> Time), Cancel changes nothing (Time and Distance wheels), the
//            saved data shapes, a reload keeps it; after Save plan in Distance (no miles) the sheet has no "Type the distance" line; Done with
//            0 h 00 min on a distance ride applies nothing, the mode included (the demo's Done)
//   motion   Reduce Motion: no tilt and no smooth scrolls, the opacity steps, a tap lands at once on that row, a scroll across a row boundary
//            repaints in the next frame (the centre from the scroll position), and the smooth 12-row scroll is live at every frame and ticks
//            as it goes (vibrate and the iPhone switch); motion on: smooth key moves
//            with the value at its goal at once; Reduce Motion changed while the sheet is open (both ways): the pane not on screen keeps
//            what it holds (Done saves it)
//   drag     WHEEL_DRAG = false in the page; a copy with it true: the pointer-driven wheel (live value, coast, snap, rubber band, tap, keys;
//            Done or Cancel mid-coast stops it: no tick after the sheet closes)
//   run, metric   the run Distance + Pace wheels (spinbuttons; "/mi"; pace 5:00-14:00), km 1-320 / km/h 12-56 in whole steps (every row);
//            a run opens How long on its own mode (Distance, then Time; focus on its first wheel; Done untouched keeps it);
//            "about" rounds the whole time (never "1 h 60 m")
//   pitch    17 px and 19 px text (the iPhone's: rows 46.75 / 52.25 px): the number in the band is the value (typed, Up, End, a native
//            scroll, the mouse wheel; a run's 596-row wheel), and Done applies it; the text size changed while the sheet is open
//   perf     one wheel step restyles a handful of elements, not the whole 596-row list (no list-wide style rule); no app refit per step
//   plan     the same plan for the same duration: plan numbers (lastResult), the saved plan and the Results text against main's page for
//            4:15, 2:00, 0:45, 7:30, 100 mi at 18 mph and 3:00 after it (needs [main null.html])
//   small    390 px, and 320 px at 200% text: no sideways scroll, nothing cut, the wheels stack when a pair cannot sit side by side, 44 px;
//            a stacked wheel shows its own band with the value in it; at 375 x 667 and 200% a refit of the app (a sync tick, a resize) keeps
//            the stacked sheet where the rider scrolled or tabbed to
//   a11y     the accessibility tree (VoiceOver reads the big number as "How long: ..., Change"; each wheel a spinbutton, the Distance pane
//            too), focus ring, AA
//   shots    390 px screenshots: the ticket (time and distance) and the wheel sheet (Time and Distance), into ../../q93shots
// Q93_ONLY=<sections, comma-separated> runs a part. About 2 minutes.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { open, checker, reload as kitReload } from '../lib/open.mjs';

const PAGE = path.resolve(process.argv[2] || '../../fred93/null.html'), MAIN = process.argv[3] ? path.resolve(process.argv[3]) : null;
const ONLY = (process.env.Q93_ONLY || '').split(',').filter(Boolean);
const HERE = path.dirname(new URL(import.meta.url).pathname), SHOTS = process.env.Q93_SHOTS || path.resolve(HERE, '../../q93shots');
const REPO = process.env.Q93_REPO || path.resolve(HERE, '../../wt-q93'), NOW = '2026-10-29T07:30:00';
const C = checker('q93 '), ok = C.ok, ERRS = [];
fs.mkdirSync(SHOTS, { recursive: true });
const SRC = fs.readFileSync(PAGE, 'utf8');
const browser = await chromium.launch();
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 8000, step = 60) { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); } catch (e) { v = null; } if (v) return v; await sleep(step); } return v; }
const frames = (p, n = 2) => p.evaluate(n => new Promise(r => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);

async function page(o = {}) { const x = await open(o.file || PAGE, Object.assign({ athlete: 'A', browser, now: NOW, repo: REPO }, o)); x.errors.label = o.label || 'page'; ERRS.push(x.errors); return x; }
// haptics observed: navigator.vibrate counted (the Android path), the hidden switch flips counted (the iPhone path), focus moves counted;
// {iphone: true}: no navigator.vibrate at all (iOS Safari and the home-screen app have none), so the switch is the only tick
async function hxSpy(p, o = {}) { await p.evaluate(iphone => { window.__vib = []; window.__sw = 0; window.__fin = 0;
  if (iphone) delete Navigator.prototype.vibrate; else Object.defineProperty(Navigator.prototype, 'vibrate', { configurable: true, value: function (ms) { window.__vib.push([performance.now(), ms]); return true; } });
  document.addEventListener('focusin', () => { window.__fin++; }, true);
  document.addEventListener('change', e => { if (e.target && e.target.id === 'hxSwitch') window.__sw++; }, true); }, !!o.iphone); }
const hx = p => p.evaluate(() => ({ vib: window.__vib.length, ms: window.__vib.map(v => v[1]), sw: window.__sw, fin: window.__fin }));
// the app's refit (fitAll) marks <html> fit-m while it runs: fitCount(p) starts counting its runs from 0, fits(p) reads the count
const fitCount = p => p.evaluate(() => { window.__fit = 0; if (!window.__fitObs) { window.__fitObs = new MutationObserver(r => r.forEach(x => { if (/(^|\s)fit-m(\s|$)/.test(x.oldValue || '')) window.__fit++; })); window.__fitObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'], attributeOldValue: true }); } });
const fits = p => p.evaluate(() => window.__fit);
// point 4: each unit sits fixed just right of its wheel's centre row, inside the band its column shows (the shared band, or the column's
// own when a pair stacks at larger text), in the body text colour
const unitsAt = (p, ids) => p.evaluate(ids => ids.map(id => { const sc = document.getElementById(id), col = sc.parentElement, box = col.parentElement, u = col.querySelector('.whl-u'), on = sc.querySelector('.whl-i.on>span');
  const bandEl = [col.querySelector(':scope>.whl-band'), box.querySelector(':scope>.whl-band')].find(b => b && b.getClientRects().length), band = bandEl.getBoundingClientRect(), R = u.getBoundingClientRect(), N = on.getBoundingClientRect();
  return { id, t: u.textContent, hidden: u.getAttribute('aria-hidden'), col: getComputedStyle(u).color, inBand: R.top >= band.top - .5 && R.bottom <= band.bottom + .5 && R.right <= band.right + .5, right: Math.round((R.left - N.right) * 10) / 10,
    mid: Math.round((R.top + R.height / 2 - (N.top + N.height / 2)) * 10) / 10, colRight: R.right <= col.getBoundingClientRect().right + .5, top: Math.round(R.top), band: [Math.round(band.top), Math.round(band.bottom)] }; }), ids);
const unitsOk = (U, col = 'rgb(58, 58, 60)', far = 60) => U.every(u => u.inBand && u.right > 4 && u.right < far && Math.abs(u.mid) <= 2 && u.colRight && u.hidden === 'true' && (!col || u.col === col)); /* col null: a run (its own dark theme colours); far: the widest gap to the centre number (60 px at 100% text: it grows with the text) */
const isOpen = p => p.$eval('#planSheet', m => m.classList.contains('open'));
// point 4: the wheels are live on scroll, not after scrolling stops. Chromium fires scrollend after each instant scrollTop write, before the
// next frame, so the instant scrolls of these checks would pass a wheel that updates on scrollend alone: noScrollEnd(p) keeps scrollend
// from the page (a capturing listener on window stops it before it reaches a wheel; the app listens for no scrollend)
const noScrollEnd = p => p.evaluate(() => window.addEventListener('scrollend', e => e.stopImmediatePropagation(), true));
// points 4 and 5: a scroll still under way (a smooth scroll of 12 rows down Hours, as a fling; Minutes at 30), sampled at every frame while
// it moves and for 15 frames after it rests, after the page painted it: the value, aria-valuenow, the readout and the .on row are the row at
// the centre (at most 1 stale frame), no row within 2 rows of the centre is hidden, and it ticks as it goes (at least 4 ticks by the last
// frame it moves: vibrate calls, or with iphone true (an hxSpy {iphone: true} page) the hidden switch flips). A wheel that waits for the
// scroll to stop (main's 120 ms settle) shows the old value and blank rows all the way and ticks once. Motion on and Reduce Motion alike
// (a finger flick has native momentum either way). hxSpy and noScrollEnd first
async function smoothSpin(p, iphone) {
  const SM = await p.$eval('#whlH', el => new Promise(res => { const R = parseFloat(getComputedStyle(el.querySelector('.whl-i')).height), out = []; el.style.scrollSnapType = 'none'; el.scrollTop = 0;
    setTimeout(() => { window.__vib = []; window.__sw = 0; const t0 = performance.now(); let still = 0; el.scrollTo({ top: 12 * R, behavior: 'smooth' });
      const f = () => { const x = el.scrollTop / R, on = el.querySelector('.whl-i.on'), prev = out[out.length - 1]; still = prev && prev.x === Math.round(x * 100) / 100 ? still + 1 : 0;
        out.push({ x: Math.round(x * 100) / 100, c: String(Math.round(x)), v: el.dataset.v, now: el.getAttribute('aria-valuenow'), on: on && on.dataset.k, read: document.getElementById('durRead').innerText.replace(/\s+/g, ' ').trim(),
          blank: [...el.querySelectorAll('.whl-i')].filter((r, k) => Math.abs(k - x) <= 2 && (r.style.visibility === 'hidden' || getComputedStyle(r).visibility === 'hidden')).length, tick: window.__vib.length + window.__sw });
        if (x < 11.99 && still < 15 && performance.now() - t0 < 2500) requestAnimationFrame(() => setTimeout(f, 0)); else res(out); }; /* it comes to rest at 11.98 rows */
      requestAnimationFrame(() => setTimeout(f, 0)); }, 250); }));
  await frames(p, 3); await p.$eval('#whlH', e => { e.style.scrollSnapType = ''; }); const h = await hx(p), end = Object.assign(await wv(p, 'whlH'), { vib: h.vib, sw: h.sw });
  const mids = SM.filter(s => s.x > 0 && s.x < 12), stale = mids.filter(s => !(s.v === s.c && s.now === s.v && s.on === s.c && s.read === (s.c === '0' ? '30 min' : s.c + ' h 30 min'))), blank = mids.filter(s => s.blank);
  const xe = SM[SM.length - 1].x, moving = mids.filter(s => s.x !== xe), during = moving.length ? moving[moving.length - 1].tick : 0; /* the ticks by the last frame it still moved */
  return { ok: mids.length >= 5 && stale.length <= 1 && !blank.length && during >= 4 && end.v === '12' && (iphone ? end.vib === 0 && end.sw >= during : end.sw === 0 && end.vib >= during), frames: mids.length, during, stale: stale.slice(0, 4), blank: blank.slice(0, 3), end, first: SM.slice(0, 3) };
}
async function openHow(p, how) { await p.click('#tkBig'); await until(() => isOpen(p)); await frames(p, 3);
  if (how) { const cur = await p.$eval('#stopsMode [aria-pressed=true]', b => b.dataset.rmode); if (cur !== how) { await p.click('#stopsMode [data-rmode=' + how + ']'); await frames(p, 3); } } }
async function done(p) { await p.click('#psAct'); await until(async () => !(await isOpen(p))); await frames(p, 2); }
async function cancel(p) { await p.click('#psBack'); await until(async () => !(await isOpen(p))); await frames(p, 2); }
const wv = (p, id) => p.$eval('#' + id, e => ({ v: e.dataset.v, now: e.getAttribute('aria-valuenow'), text: e.getAttribute('aria-valuetext'), min: e.getAttribute('aria-valuemin'), max: e.getAttribute('aria-valuemax') }));
const txt = (p, sel) => p.$eval(sel, e => e.innerText.replace(/\s+/g, ' ').trim());
const ticket = p => p.evaluate(() => ({ v: document.getElementById('howV').textContent, u: document.getElementById('howU').textContent, s: document.getElementById('howS').hidden ? '' : document.getElementById('howS').textContent, name: document.getElementById('tkBig').getAttribute('aria-label') }));
async function keys(p, id, list) { await p.focus('#' + id); for (const k of list) await p.keyboard.press(k); await frames(p, 3); }
const lum = c => { const m = c.match(/[\d.]+/g).map(Number), f = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return Math.round((Math.max(x, y) + .05) / (Math.min(x, y) + .05) * 100) / 100; };
const mix = (fg, a, bg) => { const F = fg.match(/[\d.]+/g).map(Number), B = bg.match(/[\d.]+/g).map(Number); return 'rgb(' + [0, 1, 2].map(i => F[i] * a + B[i] * (1 - a)).join(',') + ')'; };
const sections = [], section = (n, f) => sections.push([n, f]);
// a reload that keeps this page's data: lib/open.mjs's reload loads again while Chromium hands the file:// page its blank, throwaway
// localStorage (about 1 load in 8-15; window.__kitFresh). A kept copy in localStorage could not help: that store is blank too
async function reload(p) { await kitReload(p); await sleep(600); }

/* ---------------------------------------------------------------- the cache bump (Done: "Cache bump"; rules: bump the cache version in each item) */
section('cache', async () => {
  const sw = path.join(path.dirname(PAGE), 'sw.js'), cache = ((fs.existsSync(sw) ? fs.readFileSync(sw, 'utf8') : '').match(/const CACHE = '([^']+)'/) || [])[1], build = (SRC.match(/const APP_BUILD='([^']+)'/) || [])[1];
  ok(/^fred-shell-v\d+$/.test(cache || '') && +cache.slice(12) >= 118 && build === cache, 'the cache bump: sw.js CACHE and APP_BUILD match, v118 (item 93) or a later item', { cache, build });
});

/* ---------------------------------------------------------------- the ticket: point 1 (button, name, press), point 2 (gradient), QA 1, 6, 7 */
section('ticket', async () => {
  const o = await page({ motion: true }); const p = o.p;
  const t = await p.evaluate(() => { const g = id => document.getElementById(id), big = g('tkBig'), head = big.closest('.tk-top').querySelector('.pv-rhead'), vis = e => !!e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
    return { howBtn: !!g('howBtn'), howL: !!g('howL'), tag: big.tagName, type: big.getAttribute('type'), pop: big.getAttribute('aria-haspopup'), kids: [...big.querySelectorAll('#howV,#howU,#howS')].map(e => e.id).join(),
      head: [...head.querySelectorAll('button,a,[role=button]')].filter(vis).map(e => e.id), chipL: head.querySelector('#sportBtn').getBoundingClientRect().left - head.getBoundingClientRect().left,
      rightEmpty: [...head.querySelectorAll('*')].filter(e => vis(e) && e.getBoundingClientRect().left > head.getBoundingClientRect().left + head.getBoundingClientRect().width / 2 && e.textContent.trim()).map(e => e.textContent.trim()),
      h: big.getBoundingClientRect().height, w: big.getBoundingClientRect().width, dur: !!document.querySelector('.how-btn'), words: document.getElementById('rideSec').innerText.includes('Duration') }; });
  ok(!t.howBtn && !t.howL && !t.dur && !t.words, 'point 1: the Duration button is gone (#howBtn, #howL, .how-btn; no "Duration" on the ticket)', t);
  ok(t.head.join() === 'sportBtn' && t.chipL < 4 && t.rightEmpty.length === 0, 'point 1: the top row is the sport chip on the left, the right side empty', t);
  ok(t.tag === 'BUTTON' && t.type === 'button' && t.pop === 'dialog' && t.kids === 'howV,howU,howS', 'point 1 / DECISIONS: #tkBig is a button (aria-haspopup=dialog) holding the big value (#howV #howU #howS kept)', t);
  ok(t.h >= 44 && t.w >= 44, 'the big value is a 44 px target', t);
  const tk = await ticket(p);
  ok(tk.v === '2:30' && tk.u === 'hours' && tk.name === 'How long: 2:30 hours. Change', 'DECISIONS: the name "How long: 2:30 hours. Change" (the visible value inside it)', tk);
  ok(await p.getByRole('button', { name: 'How long: 2:30 hours. Change', exact: true }).count() === 1, 'QA: a screen reader reads the big number as "How long: 2:30 hours. Change" (role button, accessible name)');
  // press .97 (item 85)
  const r = await p.$eval('#tkBig', e => { const b = e.getBoundingClientRect(); return { x: b.left + 40, y: b.top + b.height / 2 }; });
  await p.mouse.move(r.x, r.y); await p.mouse.down(); await sleep(260);
  const pressed = await p.$eval('#tkBig', e => getComputedStyle(e).transform); await p.mouse.move(5, 5); await p.mouse.up(); await sleep(250);
  ok(/^matrix\(0\.97, 0, 0, 0\.97/.test(pressed) && !(await isOpen(p)), 'point 1: press feedback scale(.97) (as item 85); a press released off it opens nothing', pressed);
  // point 2: the gradient
  const g = await p.$eval('#rideSec .tk-top', e => getComputedStyle(e).backgroundImage);
  ok(g === 'linear-gradient(160deg, rgb(16, 117, 157) 0%, rgb(11, 115, 153) 55%, rgb(9, 103, 138) 100%)', 'point 2 / DECISIONS: the ticket top is linear-gradient(160deg, #10759D 0%, #0B7399 55%, #09678A 100%) (spec #1283AF fails AA)', g);
  // AA on the lightest stop (the spec stop for comparison)
  const cols = await p.evaluate(() => { const c = e => getComputedStyle(e).color; return { big: c(document.getElementById('howV')), unit: c(document.getElementById('howU')), chip: c(document.getElementById('sportBtn')), chipBg: getComputedStyle(document.getElementById('sportBtn')).backgroundColor, eff: c(document.querySelector('#intensity>button:not([aria-pressed=true])')) }; });
  const S1 = 'rgb(16,117,157)', SPEC = 'rgb(18,131,175)', chipA = +(cols.chipBg.match(/[\d.]+/g)[3] || 1), chipOn = mix('rgb(255,255,255)', chipA, S1);
  const aa = { big: ratio(cols.big, S1), unit: ratio(cols.unit, S1), chip: ratio(cols.chip, chipOn), effort: ratio(cols.eff, mix('rgb(0,0,0)', .2, S1)), specUnit: ratio(cols.unit, SPEC), specBig: ratio(cols.big, SPEC) };
  ok(aa.big >= 4.5 && aa.unit >= 4.5 && aa.chip >= 4.5 && aa.effort >= 4.5 && aa.specUnit < 4.5, 'DECISIONS: AA on the lightest stop: the value, "hours", the RIDE chip and the effort (the spec #1283AF would leave "hours" under 4.5)', aa);
  // tap the number: the sheet opens on the current mode (QA 1); Cancel; the keyboard: Enter opens, focus in the wheel, Escape closes, focus back
  await openHow(p);
  const sh = await p.evaluate(() => ({ ps: document.getElementById('planSheet').dataset.ps, t: document.getElementById('psTitle').textContent, time: !document.getElementById('howTimeP').hidden, dist: !document.getElementById('howDistP').hidden, on: document.querySelector('#stopsMode [aria-pressed=true]').dataset.rmode }));
  ok(sh.ps === 'how' && sh.t === 'How long' && sh.time && !sh.dist && sh.on === 'time', 'QA: tap the big number: the How long sheet opens on the current mode (Time)', sh);
  await cancel(p);
  await p.focus('#tkBig'); await p.keyboard.press('Enter'); await until(() => isOpen(p)); await sleep(150);
  ok(await p.evaluate(() => document.activeElement.id) === 'whlH', 'keyboard: Enter on the big number opens How long, focus on the Hours wheel (keys work at once)', await p.evaluate(() => document.activeElement.id));
  await p.keyboard.press('Escape'); await until(async () => !(await isOpen(p))); await frames(p, 2);
  ok(await p.evaluate(() => document.activeElement.id) === 'tkBig', 'keyboard: Escape closes it, focus back on the big number');
  await o.close();
});

/* ---------------------------------------------------------------- the sheet: points 3 and 4 (look) */
section('sheet', async () => {
  const o = await page({ motion: true }); const p = o.p; await noScrollEnd(p); await openHow(p); await sleep(450);
  const L = await p.evaluate(() => { const g = id => document.getElementById(id), r = e => e.getBoundingClientRect(), sh = document.querySelector('#planSheet .plan-sheet');
    const top = [...document.querySelector('#planSheet .ps-top').children].filter(e => getComputedStyle(e).visibility !== 'hidden' && e.getClientRects().length).map(e => e.textContent.trim());
    const order = ['.ps-top', '#stopsMode', '#durRead', '#whsT'].map(s => Math.round(r(document.querySelector(s)).top));
    const sw = r(g('stopsMode')), body = r(document.querySelector('#planSheet .pssec[data-ps=how]'));
    return { top, order, swW: Math.round(sw.width), bodyW: Math.round(body.width), swCls: g('stopsMode').className, swBtns: [...g('stopsMode').children].map(b => [b.textContent, b.getAttribute('aria-pressed'), Math.round(r(b).height)]) }; });
  ok(L.top.join('|') === 'Cancel|How long|Done', 'point 3: Cancel · How long · Done', L.top);
  ok(L.order.every((y, i) => !i || y > L.order[i - 1]), 'point 3: top to bottom: the header, Time | Distance, the live readout, the wheels', L.order);
  ok(/\bv-seg\b/.test(L.swCls) && Math.abs(L.swW - L.bodyW) <= 2 && L.swBtns.every(b => b[2] >= 44), 'point 3: the Time | Distance switch (#stopsMode) is a full-width segmented control, 44 px', L);
  // item 85's sliding pill: a tap on Distance flies the pill
  await p.click('#stopsMode [data-rmode=distance]'); const fly = await p.evaluate(() => new Promise(r => requestAnimationFrame(() => r({ fly: document.getElementById('stopsMode').classList.contains('seg-fly'), go: document.getElementById('stopsMode').classList.contains('seg-go') }))));
  await sleep(500);
  ok(fly.fly && fly.go, 'point 3: the switch has the sliding pill from item 85 (seg-fly / seg-go on a tap)', fly);
  ok(await p.$eval('#howDistP', e => !e.hidden) && await p.$eval('#howTimeP', e => e.hidden) && await p.$eval('#distRow', e => getComputedStyle(e).display === 'none'), 'QA: flip to Distance: the distance wheels show (no typed fields under them)');
  await p.click('#stopsMode [data-rmode=time]'); await sleep(450);
  const W = await p.evaluate(() => { const g = id => document.getElementById(id), cs = e => getComputedStyle(e), box = g('whsT'), band = box.querySelector(':scope>.whl-band'), col = box.querySelector('.wcol'), sc = g('whlH'), rows = [...sc.querySelectorAll('.whl-i')];
    const B = box.getBoundingClientRect(), Bd = band.getBoundingClientRect(), on = sc.querySelector('.whl-i.on'), off = rows[+on.dataset.k + 1], fa = cs(col, '::before'), fb = getComputedStyle(col, '::after');
    const rule = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch (e) { return []; } }).find(r => r.selectorText === '#planSheet .whs');
    return { h: B.height, bw: rule && rule.style.getPropertyValue('border') + ' / --ol ' + cs(document.documentElement).getPropertyValue('--ol'), br: cs(box).borderTopLeftRadius, bg: cs(box).backgroundColor, bandH: Bd.height, bandR: cs(band).borderTopLeftRadius, bandBg: cs(band).backgroundColor, bandMid: Math.round((Bd.top + Bd.height / 2 - (B.top + B.height / 2)) * 10) / 10,
      bandSpan: [Math.round(Bd.left - B.left), Math.round(B.right - Bd.right)], rowH: rows.map(r => r.offsetHeight), fs: cs(on).fontSize, fv: cs(on).fontVariantNumeric, onCol: cs(on).color, onW: cs(on).fontWeight, offCol: cs(off).color, offW: cs(off).fontWeight,
      fade: [getComputedStyle(col, '::before').height, getComputedStyle(col, '::before').backgroundImage, getComputedStyle(col, '::after').height, getComputedStyle(col, '::after').backgroundImage, getComputedStyle(col, '::before').top, getComputedStyle(col, '::after').bottom],
      onMid: Math.round((on.getBoundingClientRect().top + on.getBoundingClientRect().height / 2 - (Bd.top + Bd.height / 2)) * 10) / 10, persp: cs(col).perspective,
      vis: Math.round((B.height - 3) / 44 * 10) / 10 }; });
  ok(W.h === 236 && W.bw === 'var(--ol) solid var(--chip-line) / --ol 1.5px' && W.br === '18px' && W.bg === 'rgb(255, 255, 255)', 'point 4: a 236 px white box, 1.5 px border (as declared: this Chromium draws whole pixels), radius 18', W);
  ok(W.bandH === 44 && W.bandR === '11px' && W.bandBg === 'rgb(230, 241, 246)' && Math.abs(W.bandMid) <= .5 && W.bandSpan.every(x => x >= 9 && x <= 10), 'point 4: one band (var(--tint-blue), 44 px, radius 11) across both wheels at the centre', W);
  ok(W.rowH.every(h => h === 44) && W.vis >= 5, 'point 4: rows 44 px, 5 visible', { vis: W.vis });
  // the direction: the panel colour at the box edges, clear next to the band (reversed fades would hide the rows by the band)
  const CLEAR = '(transparent|rgba\\(0, 0, 0, 0\\)|color\\(srgb [\\d.]+ [\\d.]+ [\\d.]+ \\/ 0\\))';
  ok(W.fade[0] === '70px' && W.fade[2] === '70px' && new RegExp('^linear-gradient\\(rgb\\(255, 255, 255\\), ' + CLEAR + '\\)$').test(W.fade[1]) && new RegExp('^linear-gradient\\(' + CLEAR + ', rgb\\(255, 255, 255\\)\\)$').test(W.fade[3]) && W.fade[4] === '0px' && W.fade[5] === '0px',
    'point 4: the top and bottom 70 px fade into the panel colour (white at the top and bottom edges, clear next to the band)', W.fade);
  ok(W.fs === '23px' && /tabular-nums/.test(W.fv) && W.onCol === 'rgb(13, 13, 13)' && W.onW === '700' && W.offCol === 'rgb(110, 110, 115)' && W.offW === '500', 'point 4: 23 px tabular; the centre row ink 700, the rest grey 500', W);
  ok(Math.abs(W.onMid) <= 1 && W.persp === '420px', 'point 4: the value sits in the band; perspective 420 px on each column', W);
  // the drum (motion on): rows by distance d from the centre
  const D = await p.evaluate(() => { const rows = [...document.querySelectorAll('#whlH .whl-i')], c = +document.querySelector('#whlH .whl-i.on').dataset.k;
    return rows.map((r, k) => { const m = /rotateX\((-?[\d.]+)deg\) scale\(([\d.]+)\)/.exec(r.style.transform) || []; return { d: k - c, rx: m[1] == null ? null : +m[1], sc: m[2] == null ? null : +m[2], o: +r.style.opacity, v: r.style.visibility || getComputedStyle(r).visibility }; }); });
  const at = d => D.find(x => x.d === d) || {}, drum = d => at(d).rx === -d * 19 && Math.abs(at(d).sc - (1 - Math.abs(d) * .04)) < 1e-9 && Math.abs(at(d).o - (1 - Math.abs(d) * .24)) < 1e-9;
  ok(D.filter(x => Math.abs(x.d) <= 3).length >= 6 && D.filter(x => Math.abs(x.d) <= 3).every(x => drum(x.d)),
    'point 4: the drum: rotateX(-d x 19 deg), scale(1 - |d| x .04), opacity 1 - |d| x .24', [at(-2), at(-1), at(0), at(1), at(2)]);
  ok(D.filter(x => Math.abs(x.d) > 3.2).every(x => x.v === 'hidden') && D.filter(x => Math.abs(x.d) <= 3).every(x => x.v !== 'hidden'), 'point 4: rows beyond 3.2 are hidden');
  // the drum while it spins (between rows): d is the fractional distance from the centre, so the tilt rolls (a drum painted by whole rows jumps)
  const S = await p.$eval('#whlH', el => new Promise(res => { const R = parseFloat(getComputedStyle(el.querySelector('.whl-i')).height); el.style.scrollSnapType = 'none'; el.scrollTop = 2.4 * R;
    requestAnimationFrame(() => requestAnimationFrame(() => { const f = el.scrollTop / R; res({ f, rows: [...el.querySelectorAll('.whl-i')].map((r, k) => { const m = /rotateX\((-?[\d.]+)deg\) scale\(([\d.]+)\)/.exec(r.style.transform) || []; return { k, d: k - f, rx: m[1] == null ? null : +m[1], sc: m[2] == null ? null : +m[2], o: +r.style.opacity, v: r.style.visibility }; }) }); })); }));
  const near = S.rows.filter(x => Math.abs(x.d) <= 3.2), cen = S.rows.reduce((a, x) => Math.abs(x.d) < Math.abs(a.d) ? x : a);
  ok(S.f > 2.2 && S.f < 2.6 && near.length >= 6 && near.every(x => x.v !== 'hidden' && Math.abs(x.rx - -x.d * 19) < .02 && Math.abs(x.sc - (1 - Math.min(Math.abs(x.d), 3) * .04)) < .002 && Math.abs(x.o - (1 - Math.min(Math.abs(x.d), 3) * .24)) < .006)
    && S.rows.filter(x => Math.abs(x.d) > 3.2).every(x => x.v === 'hidden') && Math.abs(cen.rx) > 1 && Math.abs(cen.rx) % 19 > .5,
    'point 4 / QA: between rows the drum rolls: each row by its fractional distance d from the centre (the centre row tilted, not snapped to whole rows)', { f: S.f, cen, near: near.slice(0, 4) });
  await p.$eval('#whlH', el => { el.scrollTop = 2 * parseFloat(getComputedStyle(el.querySelector('.whl-i')).height); }); await frames(p, 3); await p.$eval('#whlH', el => { el.style.scrollSnapType = ''; }); await frames(p, 2);
  // units fixed just right of the centre row, inside the band, body text colour, AA on the band
  const U = await p.evaluate(() => ['whlH', 'whlM'].map(id => { const sc = document.getElementById(id), col = sc.parentElement, u = col.querySelector('.whl-u'), on = sc.querySelector('.whl-i.on>span'), band = document.querySelector('#whsT>.whl-band').getBoundingClientRect(), R = u.getBoundingClientRect(), N = on.getBoundingClientRect();
    return { t: u.textContent, hidden: u.getAttribute('aria-hidden'), col: getComputedStyle(u).color, inBand: R.top >= band.top - .5 && R.bottom <= band.bottom + .5 && R.right <= band.right, right: R.left - N.right, mid: Math.round((R.top + R.height / 2 - (N.top + N.height / 2)) * 10) / 10, colRight: R.right <= col.getBoundingClientRect().right }; }));
  ok(U[0].t === 'h' && U[1].t === 'min' && U.every(u => u.inBand && u.right > 4 && u.right < 60 && Math.abs(u.mid) <= 2 && u.colRight && u.hidden === 'true'), 'point 4: unit labels "h" / "min" sit fixed just right of the centre row, inside the band', U);
  ok(U.every(u => u.col === 'rgb(58, 58, 60)') && ratio(U[0].col, 'rgb(230,241,246)') >= 4.5, 'DECISIONS: the unit labels in the body text colour (#3A3A3C, AA on the band)', { col: U[0].col, r: ratio(U[0].col, 'rgb(230,241,246)') });
  // the band never moves while the numbers do
  const b0 = await p.$eval('#whsT>.whl-band', e => e.getBoundingClientRect().top), y0 = await p.$eval('#whlH .whl-i[data-k="2"]', e => e.getBoundingClientRect().top);
  await p.$eval('#whlH', e => { e.style.scrollSnapType = 'none'; e.scrollTop += 20; }); await frames(p, 3);
  const b1 = await p.$eval('#whsT>.whl-band', e => e.getBoundingClientRect().top), y1 = await p.$eval('#whlH .whl-i[data-k="2"]', e => e.getBoundingClientRect().top);
  ok(b0 === b1 && Math.abs(y0 - y1) > 10, 'QA: spin Hours: the band stays put, the numbers move through it', { b0, b1, y0, y1 });
  await p.$eval('#whlH', e => { e.style.scrollSnapType = ''; }); await o.close();
});

/* ---------------------------------------------------------------- live value and haptics: points 4 (Live), 5 */
section('live', async () => {
  const o = await page({ motion: true }); const p = o.p; await hxSpy(p); await noScrollEnd(p); await openHow(p); await sleep(450);
  const R = await p.$eval('#whlH .whl-i', e => e.offsetHeight);
  const read = () => p.evaluate(() => ({ v: document.getElementById('whlH').dataset.v, now: document.getElementById('whlH').getAttribute('aria-valuenow'), read: document.getElementById('durRead').innerText.replace(/\s+/g, ' ').trim() }));
  // a native scroll that never stops: the value changes as a row crosses the centre (no snap; scrollend kept from the page)
  await p.$eval('#whlH', e => { e.style.scrollSnapType = 'none'; });
  await p.$eval('#whlH', (e, R) => { e.scrollTop = 2.45 * R; }, R); await frames(p, 2); const a = await read();
  await p.$eval('#whlH', (e, R) => { e.scrollTop = 2.55 * R; }, R); await frames(p, 2); const b = await read();
  await p.$eval('#whlH', (e, R) => { e.scrollTop = 3.7 * R; }, R); await frames(p, 2); const c = await read();
  ok(a.v === '2' && b.v === '3' && b.now === '3' && b.read === '3 h 30 min' && c.v === '4' && c.read === '4 h 30 min', 'point 4 / QA: the value, aria-valuenow and the readout change the moment a row crosses the centre (not after scrolling stops)', [a, b, c]);
  ok((await hx(p)).vib === 2, 'point 5: one tick per step while spinning', await hx(p));
  // Done takes the live value at once (still between rows)
  await p.$eval('#whlH', (e, R) => { e.scrollTop = 5.6 * R; }, R); await frames(p, 2); await p.click('#psAct'); await until(async () => !(await isOpen(p))); await frames(p, 2);
  ok((await ticket(p)).v === '6:30', 'point 4: the Done value follows immediately (Done mid-spin applies the row at the centre)', await ticket(p));
  // a scroll still under way (a smooth scroll of 12 rows, as a fling), motion on (smoothSpin; Reduce Motion: the motion section)
  await openHow(p); await sleep(450); const SM = await smoothSpin(p);
  ok(SM.ok, 'point 4 / point 5: a scroll still moving (12 rows, smooth): at every frame the value, aria-valuenow, the readout and the centre row are the row at the centre, the rows near the band shown, ticking as it goes (not once it stops)', SM);
  await cancel(p);
  // the haptic where navigator.vibrate exists (Android): vibrate(6) and only that (point 5: vibrate for anything that has it; the switch
  // is the iPhone path): no switch flip, no label click, so the focus never moves
  await openHow(p); await sleep(450); await p.evaluate(() => { window.__vib = []; window.__sw = 0; window.__fin = 0; });
  await keys(p, 'whlH', ['ArrowDown']); await sleep(300); await keys(p, 'whlH', ['ArrowDown']); await sleep(300);
  const h = await hx(p), an = await p.evaluate(() => ({ sw: !!document.getElementById('hxSwitch'), focus: document.activeElement.id }));
  ok(h.vib === 2 && h.ms.every(m => m === 6) && h.sw === 0 && h.fin === 0 && !an.sw && an.focus === 'whlH', 'point 5: each step ticks: navigator.vibrate(6) where it exists (Android), and only that (no switch, no label click: the focus never moves)', { h, an });
  // at most one per 28 ms
  await p.evaluate(() => { window.__vib = []; }); await p.$eval('#whlH', (e, R) => { e.style.scrollSnapType = 'none'; e.scrollTop = 1 * R; }, R); await frames(p, 1);
  await p.$eval('#whlH', (e, R) => { e.scrollTop = 2 * R; }, R); await frames(p, 1); await p.$eval('#whlH', (e, R) => { e.scrollTop = 3 * R; }, R); await frames(p, 1);
  const quick = await p.evaluate(() => window.__vib.map(v => v[0])); const gaps = quick.slice(1).map((t, i) => t - quick[i]);
  ok(gaps.every(g => g >= 28) && quick.length >= 1, 'point 5: at most one tick per 28 ms', { n: quick.length, gaps });
  ok(/function haptic\((home)?\)\{ const now=performance\.now\(\); if\(now-HX\.last<28\) return; HX\.last=now;/.test(SRC) && SRC.includes("try{ if(navigator.vibrate){ navigator.vibrate(6); return; } }catch(e){}") && SRC.includes("HX.sw.setAttribute('switch','')") && /HX\.lbl\.click\(\)/.test(SRC), 'point 5: haptic() is the demo function (vibrate(6) where it exists, else the switch trick; 28 ms)');
  // tap a row to go to it
  await p.$eval('#whlH', e => { e.style.scrollSnapType = ''; }); await whGo(p, 'whlH', 4); await p.click('#whlH .whl-i[data-k="6"]'); await sleep(700);
  ok((await wv(p, 'whlH')).v === '6' && await p.$eval('#whlH .whl-i.on', e => e.dataset.k) === '6', 'point 4: tap a row to go to it', await wv(p, 'whlH'));
  // a tap on Minutes, where a row is not its value (row 7 is 35): the tap goes to that row (by its row, not by its value: 35 is not row 35)
  await whGo(p, 'whlM', 6); const mt = await p.$eval('#whlM .whl-i[data-k="7"]', e => ({ k: e.dataset.k, v: e.dataset.v })); await p.click('#whlM .whl-i[data-k="7"]'); await sleep(700);
  const mw = await wv(p, 'whlM'), mon = await p.$eval('#whlM .whl-i.on', e => ({ v: e.dataset.v, t: e.textContent })), mr = await txt(p, '#durRead');
  ok(mt.v === '35' && mt.v !== mt.k && mw.v === mt.v && mw.now === mt.v && mon.v === mt.v && mon.t === '35' && mr === '6 h 35 min', 'point 4: a tap on a Minutes row goes to that row (30, tap the row under it: 35, aria-valuenow 35, "6 h 35 min")', { mt, mw, mon, mr });
  // the mouse wheel (a trackpad, a mouse): native scroll, the value follows
  const before = +(await wv(p, 'whlH')).v; const bx = await p.$eval('#whlH', e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.mouse.move(bx.x, bx.y); await p.mouse.wheel(0, R * 2); await sleep(900);
  const after = await p.evaluate(() => ({ v: document.getElementById('whlH').dataset.v, st: document.getElementById('whlH').scrollTop }));
  ok(+after.v === before + 2 && Math.abs(after.st - (before + 2) * R) <= 1, 'point 4: native scrolling (mouse wheel) moves the value', { before, after });
  // point 4: scroll-snap-type y mandatory: a scroll that ends between rows (1.4 rows down, 1.3 rows up) settles on a row, the value that row
  await p.mouse.wheel(0, 1.4 * R); await sleep(1200);
  const s1 = await p.evaluate(() => ({ v: document.getElementById('whlH').dataset.v, st: document.getElementById('whlH').scrollTop }));
  await p.mouse.wheel(0, -1.3 * R); await sleep(1200);
  const s2 = await p.evaluate(() => ({ v: document.getElementById('whlH').dataset.v, st: document.getElementById('whlH').scrollTop }));
  const onRow = x => Math.abs(x.st - Math.round(x.st / R) * R) <= 1 && +x.v === Math.round(x.st / R);
  ok(onRow(s1) && onRow(s2) && +s1.v === before + 3 && +s2.v === before + 2, 'point 4: scroll-snap: a scroll that stops between rows settles on a row (1.4 rows down, 1.3 back)', { before, s1, s2 });
  const snap = await p.evaluate(() => { const out = {}; ['whlH', 'whlM'].forEach(id => { const e = document.getElementById(id); out[id] = getComputedStyle(e).scrollSnapType + ' / ' + getComputedStyle(e.querySelector('.whl-i') || e).scrollSnapAlign; }); return out; });
  ok(snap.whlH === 'y mandatory / center' && snap.whlM === 'y mandatory / center', 'point 4: the native wheels: scroll-snap-type y mandatory, rows scroll-snap-align center (Hours, Minutes)', snap);
  // Android (vibrate): nothing focused (a click on the readout), then a spin of Minutes by the mouse wheel: the tick moves no focus
  const focusSpin = async q => { const rb = await q.$eval('#durRead', e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); await q.mouse.click(rb.x, rb.y); await sleep(150);
    const f0 = await q.evaluate(() => document.activeElement.id || document.activeElement.tagName);
    const mx = await q.$eval('#whlM', e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); const m0 = (await wv(q, 'whlM')).v;
    await q.mouse.move(mx.x, mx.y); await q.mouse.wheel(0, R); await sleep(900);
    const f1 = await q.evaluate(() => { const a = document.activeElement; return { id: a.id || a.tagName, inSheet: !!a.closest('#planSheet .plan-sheet'), m: document.getElementById('whlM').dataset.v }; });
    return { f0, m0, f1 }; };
  const fa = await focusSpin(p);
  ok(fa.f0 === 'BODY' && fa.f1.m !== fa.m0 && fa.f1.id === 'BODY' && !(await p.$('#hxSwitch')), 'Android (vibrate): a spin with nothing focused ticks without moving the focus (no hidden switch to take it)', fa);
  // taps on the Distance pane (rows are not their values there: Distance row 38 is 39 mi, speed row 19 is 17.5 mph): each tap goes to the
  // tapped row, the readout and Done follow (a time ride: the wheels open on 40 mi at 17 mph)
  await p.click('#stopsMode [data-rmode=distance]'); await sleep(450); const d0 = [(await wv(p, 'whlD')).v, (await wv(p, 'whlS')).v];
  const tapRow = async (id, dk) => { const k = +(await p.$eval('#' + id + ' .whl-i.on', e => e.dataset.k)) + dk, sel = '#' + id + ' .whl-i[data-k="' + k + '"]', row = await p.$eval(sel, e => ({ k: e.dataset.k, v: e.dataset.v }));
    await p.click(sel); await sleep(700); const w = await wv(p, id), on = await p.$eval('#' + id + ' .whl-i.on', e => e.dataset.v); return { row, v: w.v, now: w.now, on }; };
  const tD = await tapRow('whlD', -1), tS = await tapRow('whlS', 1), dr = await txt(p, '#distRead'); await done(p); const dt = await ticket(p);
  ok(d0.join() === '40,17' && [tD, tS].every(t => t.row.v !== t.row.k && t.v === t.row.v && t.now === t.row.v && t.on === t.row.v) && tD.v === '39' && tS.v === '17.5' && /^39 mi · 17\.5 mph about /.test(dr) && /^How long: 39 mi · 17\.5 mph, about .+\. Change$/.test(dt.name),
    'point 4: a tap on a Distance or Average speed row goes to that row (40 mi, tap the row above: 39; 17 mph, tap the row under: 17.5), the readout and Done follow', { d0, tD, tS, dr, dt });
  await o.close();
  // the iPhone (no navigator.vibrate): each step flips the hidden switch through its label; Chrome would focus a clicked label's switch,
  // haptic() gives the focus back; the first tick puts the switch and label in the page without a refit of the app
  const i = await page({ motion: true, label: 'iphone' }); const q = i.p; await hxSpy(q, { iphone: true }); await noScrollEnd(q);
  const noVib = await q.evaluate(() => !('vibrate' in navigator));
  await openHow(q); await sleep(450); await fitCount(q); await q.evaluate(() => { window.__fin = 0; });
  await keys(q, 'whlH', ['ArrowDown']); await sleep(300); await keys(q, 'whlH', ['ArrowDown']); await sleep(300);
  const hi = await hx(q), fi = await fits(q), sw = await q.evaluate(() => { const s = document.getElementById('hxSwitch'), l = document.querySelector('label[for=hxSwitch]'), cs = s && getComputedStyle(s); return s && { type: s.type, sw: s.hasAttribute('switch'), ti: s.tabIndex, ah: s.getAttribute('aria-hidden'), lah: l && l.getAttribute('aria-hidden'), off: s.getBoundingClientRect().right <= 0 && l.getBoundingClientRect().right <= 0, op: cs.opacity, pe: cs.pointerEvents, focus: document.activeElement.id, v: document.getElementById('whlH').dataset.v }; });
  ok(noVib && hi.sw === 2 && hi.vib === 0 && sw && sw.v === '0', 'point 5: on an iPhone (no navigator.vibrate) each key step flips the hidden switch (iOS plays its tick)', { noVib, hi, sw });
  ok(sw && sw.type === 'checkbox' && sw.sw && sw.ti === -1 && sw.ah === 'true' && sw.lah === 'true' && sw.off && sw.op === '0' && sw.pe === 'none', 'point 5: the switch is an <input type=checkbox switch> with a <label>, both off screen, aria-hidden, tabindex -1', sw);
  ok(sw && sw.focus === 'whlH', 'DECISIONS: haptic() gives the focus back (the wheel keeps it)', sw);
  ok(fi === 0, 'the first tick puts the hidden switch and label in the page without a refit of the app (.hx-off, skipped by the refit observer)', fi);
  await q.evaluate(() => { window.__sw = 0; }); await q.$eval('#whlH', e => { e.style.scrollSnapType = 'none'; });
  for (const k of [1, 2]) { await q.$eval('#whlH', (e, k) => { e.scrollTop = k * parseFloat(getComputedStyle(e.querySelector('.whl-i')).height); }, k); await frames(q, 2); await sleep(60); }
  const hs = await hx(q); await q.$eval('#whlH', e => { e.style.scrollSnapType = ''; });
  ok(hs.sw === 2 && (await wv(q, 'whlH')).v === '2' && await q.evaluate(() => document.activeElement.id) === 'whlH', 'point 5: on an iPhone a native scroll across 2 rows flips the switch twice, the focus kept', hs);
  const SI = await smoothSpin(q, true);
  ok(SI.ok, 'point 4 / point 5: on an iPhone a scroll still moving (12 rows, smooth) is live at every frame and flips the switch as it goes', SI);
  const fp = await focusSpin(q); await q.keyboard.press('ArrowUp'); await sleep(500); const m2 = (await wv(q, 'whlM')).v;
  ok(fp.f0 === 'BODY' && fp.f1.m !== fp.m0 && fp.f1.id === 'whlM' && fp.f1.inSheet && +m2 === +fp.f1.m + 5, 'DECISIONS: on an iPhone the tick never leaves the focus on the hidden switch (nothing focused, a spin: the focus goes to that wheel, its keys work)', { fp, m2 });
  await i.close();
});
async function whGo(p, id, k) { await p.$eval('#' + id, (e, k) => { e.scrollTop = k * e.querySelector('.whl-i').offsetHeight; }, k); await sleep(250); await frames(p, 2); }

/* ---------------------------------------------------------------- keys and spinbutton semantics (DECISIONS), ranges (point 3) */
section('keys', async () => {
  const o = await page(); const p = o.p; await openHow(p);
  const A = await p.evaluate(() => ['whlH', 'whlM'].map(id => { const e = document.getElementById(id), l = e.querySelector('.whl-list'); return { role: e.getAttribute('role'), tab: e.tabIndex, lab: document.getElementById(e.getAttribute('aria-labelledby')).textContent, min: e.getAttribute('aria-valuemin'), max: e.getAttribute('aria-valuemax'), now: e.getAttribute('aria-valuenow'), text: e.getAttribute('aria-valuetext'), listHidden: l.getAttribute('aria-hidden'), exempt: l.getAttribute('data-contrast-exempt') || '', roles: e.querySelectorAll('[role]').length, n: e.querySelectorAll('.whl-i').length, labels: [...e.querySelectorAll('.whl-i')].map(x => x.textContent).join(' ') }; }));
  ok(A.every(a => a.role === 'spinbutton' && a.tab === 0) && A[0].lab === 'Hours' && A[1].lab === 'Minutes', 'DECISIONS: each wheel is a role=spinbutton, focusable, named Hours / Minutes', A.map(a => [a.role, a.lab]));
  ok(A[0].min === '0' && A[0].max === '12' && A[0].now === '2' && A[0].text === '2 hours' && A[1].min === '0' && A[1].max === '55' && A[1].now === '30' && A[1].text === '30 minutes', 'DECISIONS: aria-valuemin / max / now / text (2 hours, 30 minutes)', A.map(a => [a.min, a.max, a.now, a.text]));
  ok(A.every(a => a.listHidden === 'true' && a.roles === 0 && /drum|faded/.test(a.exempt)), 'DECISIONS: the row list is aria-hidden (no options), with a named contrast exemption for the faded rows', A.map(a => a.exempt));
  ok(A[0].n === 13 && A[0].labels === '0 1 2 3 4 5 6 7 8 9 10 11 12' && A[1].n === 12 && A[1].labels === '00 05 10 15 20 25 30 35 40 45 50 55', 'point 3: ranges as they are: hours 0-12, minutes 0-55 in steps of 5', [A[0].labels, A[1].labels]);
  const seq = [];
  for (const [k, want] of [['ArrowUp', '3'], ['ArrowRight', '4'], ['ArrowDown', '3'], ['ArrowLeft', '2'], ['PageUp', '6'], ['PageDown', '2'], ['End', '12'], ['ArrowUp', '12'], ['Home', '0'], ['ArrowDown', '0']]) { await keys(p, 'whlH', [k]); seq.push([k, (await wv(p, 'whlH')).now, want]); }
  ok(seq.every(s => s[1] === s[2]), 'DECISIONS: Up / Right +1, Down / Left -1, Page Up / Page Down +-4, Home, End (stops at the ends)', seq);
  await keys(p, 'whlH', ['1', '2']); const d1 = (await wv(p, 'whlH')).now; await sleep(950); await keys(p, 'whlH', ['7']); const d2 = (await wv(p, 'whlH')).now;
  await keys(p, 'whlM', ['4', '5']); const d3 = (await wv(p, 'whlM')).now; await keys(p, 'whlM', ['Home']); await sleep(950); await keys(p, 'whlM', ['5']); const d4 = (await wv(p, 'whlM')).now;
  ok(d1 === '12' && d2 === '7' && d3 === '45' && d4 === '5', 'DECISIONS: digits (1 2 is 12; 7; minutes 4 5 is 45, 5 is 05)', [d1, d2, d3, d4]);
  ok(await txt(p, '#durRead') === '7 h 05 min' && (await wv(p, 'whlM')).text === '5 minutes', 'point 3: the live readout "7 h 05 min"', await txt(p, '#durRead'));
  await keys(p, 'whlH', ['Home']); ok(await txt(p, '#durRead') === '5 min', 'the readout without hours: "5 min"', await txt(p, '#durRead'));
  await keys(p, 'whlM', ['Home']); ok(/^0 min/.test(await txt(p, '#durRead')), 'nothing picked: "0 min" (Done keeps the ride as it was)', await txt(p, '#durRead'));
  await done(p); ok((await ticket(p)).v === '2:30', 'Done with 0 h 00 min changes nothing (as before)', await ticket(p));
  // distance: ranges, names, keys, digits
  await openHow(p, 'distance'); const D0 = [(await wv(p, 'whlD')).v, (await wv(p, 'whlS')).v];
  const B = await p.evaluate(() => ['whlD', 'whlS'].map(id => { const e = document.getElementById(id); return { role: e.getAttribute('role'), tab: e.tabIndex, listHidden: e.querySelector('.whl-list').getAttribute('aria-hidden'), roles: e.querySelectorAll('[role]').length, lab: document.getElementById(e.getAttribute('aria-labelledby')).textContent, min: e.getAttribute('aria-valuemin'), max: e.getAttribute('aria-valuemax'), n: e.querySelectorAll('.whl-i').length, u: e.parentElement.querySelector('.whl-u').textContent, first: e.querySelector('.whl-i').textContent, last: e.querySelector('.whl-i:last-child').textContent }; }));
  ok(B[0].lab === 'Distance' && B[1].lab === 'Average speed' && B[0].u === 'mi' && B[1].u === 'mph', 'point 4: Distance / Average speed wheels with "mi" / "mph" in the band', B);
  ok(B.every(b => b.role === 'spinbutton' && b.tab === 0 && b.listHidden === 'true' && b.roles === 0), 'DECISIONS: the Distance and Average speed wheels are spinbuttons too, focusable (rows aria-hidden, no options)', B.map(b => [b.lab, b.role, b.tab, b.listHidden, b.roles]));
  const UD = await unitsAt(p, ['whlD', 'whlS']);
  ok(UD[0].t === 'mi' && UD[1].t === 'mph' && unitsOk(UD), 'point 4: "mi" / "mph" sit fixed just right of the centre row, inside the band (body text colour)', UD);
  const snapD = await p.evaluate(() => ['whlD', 'whlS'].map(id => { const e = document.getElementById(id); return getComputedStyle(e).scrollSnapType + ' / ' + getComputedStyle(e.querySelector('.whl-i')).scrollSnapAlign; }));
  ok(snapD.every(x => x === 'y mandatory / center'), 'point 4: the Distance and speed wheels snap too (y mandatory, rows center)', snapD);
  ok(B[0].min === '1' && B[0].max === '200' && B[0].n === 200 && B[1].min === '8' && B[1].max === '35' && B[1].n === 55 && B[1].first === '8' && B[1].last === '35', 'point 3: ranges: miles 1-200, speed 8-35 mph in 0.5 steps', B);
  await keys(p, 'whlD', ['1', '0', '0']); await keys(p, 'whlS', ['1', '7', '5']); const s1 = await wv(p, 'whlS'); await keys(p, 'whlS', ['ArrowUp']);
  ok((await wv(p, 'whlD')).now === '100' && s1.now === '17.5' && s1.text === '17.5 miles per hour' && (await wv(p, 'whlS')).now === '18', 'digits: 1 0 0 is 100 mi, 1 7 5 is 17.5 mph; Up is +0.5', [await wv(p, 'whlD'), s1]);
  ok(await txt(p, '#distRead') === '100 mi · 18 mph about 5 h 33 m', 'point 3: the readout "100 mi · 18 mph" with "about 5 h 33 m" under it', await txt(p, '#distRead'));
  ok(await p.$eval('#distRead .whl-sub', e => getComputedStyle(e).display === 'block'), 'point 3: "about ..." on its own line under it');
  // a flip of Time | Distance keeps what was spun in the other pane until Done or Cancel (the demo's draft): 100 mi at 18 -> Time, Hours 5 ->
  // Distance (still 100 at 18) -> Time (still 5 h 30); Cancel drops it all: the sheet opens again on the saved 2:30, its Distance wheels as they first opened
  await p.click('#stopsMode [data-rmode=time]'); await frames(p, 3); const f0 = (await wv(p, 'whlH')).v; await keys(p, 'whlH', ['5']);
  await p.click('#stopsMode [data-rmode=distance]'); await frames(p, 3); const f1 = [(await wv(p, 'whlD')).v, (await wv(p, 'whlS')).v, await txt(p, '#distRead')];
  await p.click('#stopsMode [data-rmode=time]'); await frames(p, 3); const f2 = [(await wv(p, 'whlH')).v, (await wv(p, 'whlM')).v, await txt(p, '#durRead')];
  ok(f0 === '2' && f1[0] === '100' && f1[1] === '18' && f1[2] === '100 mi · 18 mph about 5 h 33 m' && f2[0] === '5' && f2[1] === '30' && f2[2] === '5 h 30 min', 'a flip of Time | Distance keeps what was spun in the other pane (Hours 5; then 100 mi at 18 mph; back on Time 5 h 30 min)', { f0, f1, f2 });
  await cancel(p); await openHow(p); const g0 = [(await wv(p, 'whlH')).v, (await wv(p, 'whlM')).v]; await p.click('#stopsMode [data-rmode=distance]'); await frames(p, 3);
  const g1 = [(await wv(p, 'whlD')).v, (await wv(p, 'whlS')).v]; await cancel(p);
  ok((await ticket(p)).v === '2:30' && g0.join() === '2,30' && g1.join() === D0.join(), 'Cancel drops the spun values: the sheet opens again on the saved 2:30, its Distance wheels as they first opened', { g0, g1, D0 });
  await o.close();
});

/* ---------------------------------------------------------------- Done / Cancel, the ticket in distance, saved data (point 3, QA 4-5) */
section('done', async () => {
  const o = await page(); const p = o.p;
  await reload(p); /* the first load can get the throwaway store too (its writes gone at the next load, which the opener cannot tell from a first visit): one reload first puts the page on the real store, so the reload below finds what Done saved */
  const plan = () => p.evaluate(() => JSON.parse(localStorage.getItem('bluebird.lastPlan.v1') || 'null'));
  const before = await plan();
  await openHow(p); await keys(p, 'whlH', ['5']); await keys(p, 'whlM', ['Home']); await cancel(p);
  const c = await ticket(p), cp = await plan();
  ok(c.v === '2:30' && JSON.stringify(cp) === JSON.stringify(before), 'point 3 / QA: Cancel changes nothing (the ticket, the saved plan)', c);
  await openHow(p); ok((await wv(p, 'whlH')).now === '2' && (await wv(p, 'whlM')).now === '30', 'Cancel: the sheet opens again on the kept value');
  await keys(p, 'whlH', ['5']); await keys(p, 'whlM', ['Home']); await done(p);
  const d = await ticket(p), dp = await plan();
  ok(d.v === '5:00' && d.u === 'hours' && d.s === '' && d.name === 'How long: 5:00 hours. Change', 'QA: Done updates the ticket (time): "5:00 hours", named "How long: 5:00 hours. Change"', d);
  ok(dp && dp.durMin === 300 && dp.route && dp.route.mode !== 'distance' && Object.keys(dp).sort().join() === Object.keys(before || dp).sort().join(), 'the saved plan keeps its shape (durMin 300)', dp && { durMin: dp.durMin, route: dp.route });
  const stored = () => p.evaluate(() => [localStorage.getItem('bluebird.lastPlan.v1'), localStorage.getItem('bluebird.settings.v2')]);
  // Cancel after spinning the Distance wheels of a Time ride: still Time, nothing saved
  const b1 = await stored(); await openHow(p, 'distance'); await keys(p, 'whlD', ['1', '2', '0']); await keys(p, 'whlS', ['2', '0']); const rd1 = await txt(p, '#distRead'); await cancel(p);
  const c1 = await ticket(p), a1 = await stored();
  ok(/^120 mi · 20 mph/.test(rd1) && c1.v === '5:00' && c1.u === 'hours' && c1.name === 'How long: 5:00 hours. Change' && a1[0] === b1[0] && a1[1] === b1[1], 'QA: Cancel after spinning the Distance wheels of a Time ride changes nothing (still 5:00 hours; the saved plan and settings as they were)', { rd1, c1, plan: a1[0] === b1[0], settings: a1[1] === b1[1] });
  await openHow(p, 'distance'); await keys(p, 'whlD', ['1', '0', '0']); await keys(p, 'whlS', ['1', '8']); await done(p);
  const e = await ticket(p), ep = await plan(), st = await p.evaluate(() => JSON.parse(localStorage.getItem('bluebird.settings.v2')));
  ok(e.v === '100' && e.u === 'mi · 18 mph' && e.s === 'about 5 h 33 m', 'QA: Done updates the ticket (distance + speed + about): "100" "mi · 18 mph" over "about 5 h 33 m"', e);
  ok(e.name === 'How long: 100 mi · 18 mph, about 5 h 33 m. Change', 'DECISIONS: distance: "How long: 100 mi · 18 mph, about 5 h 33 m. Change"', e.name);
  ok(ep.route.mode === 'distance' && ep.route.miles === 100 && ep.route.mph === 18 && ep.durMin === 333 && st.routeMode === 'distance', 'saved data as before: route {mode distance, miles 100, mph 18}, durMin 333, settings.routeMode', { route: ep.route, durMin: ep.durMin, rm: st.routeMode });
  // QA: "Cancel doesn't" in Distance too: spin to 120 mi at 20 mph, Cancel: the ticket, the saved plan and the settings stay as they were
  const b2 = await stored(); await openHow(p); await keys(p, 'whlD', ['1', '2', '0']); await keys(p, 'whlS', ['2', '0']); const rd2 = await txt(p, '#distRead'); await cancel(p);
  const c2 = await ticket(p), a2 = await stored();
  ok(/^120 mi · 20 mph/.test(rd2) && c2.v === '100' && c2.u === 'mi · 18 mph' && c2.s === 'about 5 h 33 m' && c2.name === e.name && a2[0] === b2[0] && a2[1] === b2[1], 'QA: Cancel in Distance changes nothing (spun to 120 mi at 20 mph: the ticket, the saved plan and settings stay 100 mi at 18 mph)', { rd2, c2, plan: a2[0] === b2[0], settings: a2[1] === b2[1] });
  await openHow(p); ok(await p.$eval('#stopsMode [aria-pressed=true]', b => b.dataset.rmode) === 'distance' && (await wv(p, 'whlD')).now === '100' && (await wv(p, 'whlS')).now === '18', 'QA: the sheet opens on the current mode (Distance, 100 mi at 18 mph)');
  await p.click('#stopsMode [data-rmode=time]'); await frames(p, 3); ok((await wv(p, 'whlH')).now === '5', 'flip to Time in the sheet: the hours wheel on the ride time');
  await cancel(p); ok((await ticket(p)).v === '100', 'Cancel after flipping the switch keeps Distance');
  // Done with 0 h 00 min ("Pick a ride time") on a distance ride: nothing is applied, the mode included (it stays 100 mi at 18 mph, as the demo's Done)
  const b3 = await stored(); await openHow(p, 'time'); await keys(p, 'whlH', ['Home']); await keys(p, 'whlM', ['Home']); const rz = await txt(p, '#durRead'); await done(p);
  const cz = await ticket(p), a3 = await stored(), rm3 = (JSON.parse(a3[1] || '{}') || {}).routeMode;
  ok(rz === '0 min Pick a ride time' && cz.v === '100' && cz.u === 'mi · 18 mph' && cz.s === 'about 5 h 33 m' && rm3 === 'distance' && a3[0] === b3[0] && a3[1] === b3[1], 'Done with 0 h 00 min on a distance ride keeps the ride as it was (100 mi at 18 mph, routeMode distance; the saved plan and settings untouched)', { rz, cz, rm3, plan: a3[0] === b3[0], settings: a3[1] === b3[1] });
  // a reload keeps it all
  await reload(p); const r = await ticket(p);
  ok(r.v === '100' && r.s === 'about 5 h 33 m', 'after a reload the ticket shows the saved distance', r);
  // a distance ride with no distance yet (Save plan: the new ride keeps Distance, drops the miles): no instruction to type anything
  const q = p; await crunch(q); await q.evaluate(() => document.getElementById('journalBtn').click()); await until(async () => (await ticket(q)).u === 'Set distance', 5000);
  const nt = await ticket(q); await openHow(q); await sleep(200);
  const ns = await q.evaluate(() => { const P = document.getElementById('howDistP'), vis = e => !!e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
    return { mode: document.querySelector('#stopsMode [aria-pressed=true]').dataset.rmode, sub: vis(document.getElementById('distSub')), typed: [...P.querySelectorAll('input')].filter(vis).length, text: P.innerText.replace(/\s+/g, ' ').trim() }; });
  const tree = await q.locator('#howDistP').ariaSnapshot();
  ok(nt.u === 'Set distance' && ns.mode === 'distance' && !ns.sub && ns.typed === 0 && !/type/i.test(ns.text) && !/type/i.test(tree), 'a distance ride with no distance (after Save plan): the sheet shows the readout and the wheels, no "Type the distance ..." (no typed fields)', { nt, ns, tree });
  // Distance -> Time in the sheet, then Done (the switch lives in the sheet now: this Done is the only way back to Time)
  await keys(q, 'whlD', ['1', '0', '0']); await keys(q, 'whlS', ['1', '8']); await done(q);
  const dt0 = await ticket(q); await openHow(q, 'time'); await keys(q, 'whlH', ['4']); await keys(q, 'whlM', ['Home']); await done(q);
  const tt = await ticket(q), tp = await plan(), ts = await q.evaluate(() => JSON.parse(localStorage.getItem('bluebird.settings.v2')));
  ok(dt0.v === '100' && tt.v === '4:00' && tt.u === 'hours' && tt.s === '' && tt.name === 'How long: 4:00 hours. Change' && tp.route.mode === 'time' && tp.durMin === 240 && ts.routeMode === 'time', 'QA: Distance (100 mi at 18 mph) -> Time in the sheet, then Done: the ticket reads "4:00 hours", the saved mode is time (durMin 240)', { dt0, tt, route: tp.route, durMin: tp.durMin, rm: ts.routeMode });
  await reload(q); const tr = await ticket(q); ok(tr.v === '4:00' && tr.u === 'hours', 'after a reload the ticket keeps 4:00 hours', tr);
  await o.close();
});

/* ---------------------------------------------------------------- Reduce Motion and the motion (DECISIONS) */
section('motion', async () => {
  const o = await page(); const p = o.p; await hxSpy(p); await noScrollEnd(p); await openHow(p);
  // the centre row is taken from the scroll position, not from the .on row (a wheel that did not repaint agrees with its own stale .on row)
  const rows = () => p.evaluate(() => { const el = document.getElementById('whlH'), R = parseFloat(getComputedStyle(el.querySelector('.whl-i')).height), f = el.scrollTop / R, c = Math.round(f), on = el.querySelector('.whl-i.on');
    return { f: Math.round(f * 100) / 100, c, on: on && +on.dataset.k, v: el.dataset.v, read: document.getElementById('durRead').innerText.replace(/\s+/g, ' ').trim(),
      rows: [...el.querySelectorAll('.whl-i')].map((r, k) => ({ d: k - c, a: Math.round(Math.abs(k - f) * 100) / 100, t: r.style.transform, o: r.style.opacity, v: r.style.visibility || getComputedStyle(r).visibility })).filter(x => Math.abs(x.d) <= 3) }; });
  const steps = S => S.rows.every(x => x.t === '') && S.rows.filter(x => x.a <= 3.2).every(x => x.v !== 'hidden' && Math.abs(+x.o - (1 - Math.min(Math.abs(x.d), 3) * .24)) < 1e-9) && S.rows.filter(x => x.a <= 3.2).length >= 6; /* the rows within 3.2 rows of the scroll position shown, each faded by its whole-row distance from the centre row */
  const R0 = await rows();
  ok(R0.c === 2 && R0.on === 2 && steps(R0), 'Reduce Motion: no drum tilt or scale; the opacity steps stay (1, .76, .52, .28)', R0);
  // between rows, across a row boundary (2.0 to 2.6 rows), read two frames later with the scroll still unsettled (no scrollend, no snap):
  // the centre row, the value and the readout are row 3 at once, the opacity steps by whole rows around it, the rows by it shown
  await p.$eval('#whlH', e => { e.style.scrollSnapType = 'none'; e.scrollTop = 2.6 * parseFloat(getComputedStyle(e.querySelector('.whl-i')).height); }); await frames(p, 2);
  const R1 = await rows(); ok(R1.f > 2.5 && R1.c === 3 && R1.on === 3 && R1.v === '3' && R1.read === '3 h 30 min' && steps(R1), 'Reduce Motion: a scroll across a row boundary repaints at once (row 3 in the band, the value and the readout 3 h 30); between rows the opacity still steps by whole rows', R1);
  // a scroll still under way under Reduce Motion (a flick keeps its native momentum): live at every frame, ticking as it goes
  await p.$eval('#whlH', e => { e.style.scrollSnapType = ''; }); const RS = await smoothSpin(p);
  ok(RS.ok, 'Reduce Motion: a scroll still moving (12 rows, smooth) is live at every frame (the value, aria-valuenow, the readout, the centre row; the rows near the band shown) and ticks as it goes', RS);
  await whGo(p, 'whlH', 2); await p.evaluate(() => { window.__vib = []; });
  await p.focus('#whlH'); await p.keyboard.press('PageUp'); const st = await p.$eval('#whlH', e => e.scrollTop / e.querySelector('.whl-i').offsetHeight);
  ok(st === 6, 'Reduce Motion: no smooth scrolls (Page Up lands at once)', st);
  await frames(p, 2); ok((await hx(p)).vib >= 1, 'Reduce Motion keeps the haptic tick', await hx(p));
  const rmt = await p.$eval('#whlM .whl-i[data-k="8"]', e => ({ k: e.dataset.k, v: e.dataset.v })); await p.click('#whlM .whl-i[data-k="8"]');
  const rma = await p.$eval('#whlM', e => ({ st: e.scrollTop / e.querySelector('.whl-i').offsetHeight, v: e.dataset.v, now: e.getAttribute('aria-valuenow') }));
  ok(rmt.v === '40' && rmt.v !== rmt.k && rma.st === 8 && rma.v === rmt.v && rma.now === rmt.v, 'Reduce Motion: a tap on a row lands at once, on that row (Minutes 30, tap row 8: 40)', { rmt, rma });
  ok(await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--t-base').trim()) === '0ms', 'Reduce Motion: the motion tokens are 0 ms (the switch pill does not fly)');
  await o.close();
  // Reduce Motion on an iPhone (no navigator.vibrate): the switch tick stays too
  const ri = await page({ label: 'iphone RM' }); const rq = ri.p; await hxSpy(rq, { iphone: true }); await openHow(rq);
  await keys(rq, 'whlH', ['ArrowUp']); await sleep(300); await keys(rq, 'whlH', ['ArrowUp']); await sleep(300);
  const rh = await hx(rq), rf = await rq.evaluate(() => ({ vib: 'vibrate' in navigator, focus: document.activeElement.id, v: document.getElementById('whlH').dataset.v }));
  ok(rh.sw === 2 && !rf.vib && rf.focus === 'whlH' && rf.v === '4', 'Reduce Motion on an iPhone (no vibrate): each step still flips the hidden switch (the tick stays), the focus kept', { rh, rf });
  await noScrollEnd(rq); const RI = await smoothSpin(rq, true);
  ok(RI.ok, 'Reduce Motion on an iPhone: a scroll still moving (12 rows, smooth) is live at every frame and flips the switch as it goes', RI);
  await ri.close();
  // motion on: a key move is smooth, the value at its goal at once
  const m = await page({ motion: true }); const q = m.p; await openHow(q); await sleep(450);
  await q.focus('#whlH'); await q.keyboard.press('PageUp'); await sleep(40);
  const mid = await q.evaluate(() => ({ st: document.getElementById('whlH').scrollTop / document.querySelector('#whlH .whl-i').offsetHeight, now: document.getElementById('whlH').getAttribute('aria-valuenow'), read: document.getElementById('durRead').innerText.replace(/\s+/g, ' ') }));
  await sleep(900); const end = await q.evaluate(() => ({ st: document.getElementById('whlH').scrollTop / document.querySelector('#whlH .whl-i').offsetHeight, now: document.getElementById('whlH').getAttribute('aria-valuenow') }));
  ok(mid.st > 2 && mid.st < 6 && mid.now === '6' && mid.read === '6 h 30 min' && end.st === 6 && end.now === '6', 'motion on: Page Up scrolls smoothly; the value (aria-valuenow, the readout) is the goal at once', { mid, end });
  // a far jump (digits): it lands at once, and the value never falls back to a row it passes
  await q.click('#stopsMode [data-rmode=distance]'); await sleep(400); await q.evaluate(() => { window.__seen = []; document.getElementById('whlD').addEventListener('wheel-change', e => window.__seen.push(e.target.dataset.v)); });
  await q.focus('#whlD'); for (const k of ['1', '0', '0']) await q.keyboard.press(k); await sleep(60);
  const j1 = await q.evaluate(() => ({ st: document.getElementById('whlD').scrollTop / 44, v: document.getElementById('whlD').dataset.v })); await sleep(1300);
  const j2 = await q.evaluate(() => ({ st: document.getElementById('whlD').scrollTop / 44, v: document.getElementById('whlD').dataset.v, seen: window.__seen, on: document.querySelector('#whlD .whl-i.on').textContent }));
  ok(j1.st === 99 && j1.v === '100' && j2.st === 99 && j2.v === '100' && j2.on === '100' && j2.seen.join() === '1,10,100', 'motion on: a far jump (1 0 0) lands at once on 100; the value never shows a row it passes', { j1, j2 });
  await m.close();
  // Reduce Motion changes while How long is open (iOS Settings, then back to the app): the drum follows it, and the pane not on screen keeps
  // what it holds (a hidden scroller reads scrollTop 0: a repaint there would put its draft on the first row, 1 mi at 8 mph, 0 h 00).
  // Both directions: A, a look at Distance (40 at 17), Time, the change, Distance again, Done saves 40 mi at 17 mph; B, Hours spun to 4,
  // Distance, the change, Time again: still 4 h 30, Done applies 4:30
  const rl = [];
  for (const [from, to] of [['no-preference', 'reduce'], ['reduce', 'no-preference']]) {
    const x = await page({ motion: from === 'no-preference', label: 'RM change ' + from + ' to ' + to }); const r = x.p; await openHow(r, 'distance'); await sleep(400);
    const a0 = [(await wv(r, 'whlD')).v, (await wv(r, 'whlS')).v]; await r.click('#stopsMode [data-rmode=time]'); await sleep(400);
    await r.emulateMedia({ reducedMotion: to }); await sleep(300); const tilt = await r.$eval('#whlH .whl-i.on', e => e.style.transform);
    await r.click('#stopsMode [data-rmode=distance]'); await sleep(400); const a1 = [(await wv(r, 'whlD')).v, (await wv(r, 'whlS')).v, await txt(r, '#distRead')];
    await done(r); const at = await ticket(r), ap = await r.evaluate(() => (JSON.parse(localStorage.getItem('bluebird.lastPlan.v1') || '{}') || {}).route || {});
    await openHow(r, 'time'); await keys(r, 'whlH', ['4']); await keys(r, 'whlM', ['3', '0']); await sleep(400); await r.click('#stopsMode [data-rmode=distance]'); await sleep(400);
    await r.emulateMedia({ reducedMotion: from }); await sleep(300);
    await r.click('#stopsMode [data-rmode=time]'); await sleep(400); const b1 = [(await wv(r, 'whlH')).v, (await wv(r, 'whlM')).v, await txt(r, '#durRead')]; await done(r); const bt = await ticket(r);
    rl.push({ from, to, a0, tilt, a1, at: at.name, ap: [ap.mode, ap.miles, ap.mph], b1, bt: bt.name }); await x.close();
  }
  ok(rl.every(x => x.a0.join() === '40,17' && x.a1[0] === '40' && x.a1[1] === '17' && /^40 mi · 17 mph about /.test(x.a1[2]) && /^How long: 40 mi · 17 mph, about .+\. Change$/.test(x.at) && x.ap.join() === 'distance,40,17'
    && x.b1[0] === '4' && x.b1[1] === '30' && x.b1[2] === '4 h 30 min' && x.bt === 'How long: 4:30 hours. Change') && rl[0].tilt === '' && rl[1].tilt !== '',
    'Reduce Motion changed while How long is open (both ways): the drum follows it on screen, and the other pane keeps what it holds (Distance 40 at 17, Done saves it; 4 h 30 spun stays 4 h 30, Done applies it)', rl);
});

/* ---------------------------------------------------------------- the WHEEL_DRAG fallback (point 6) */
section('drag', async () => {
  ok(/\nconst WHEEL_DRAG = false;\n/.test(SRC), 'point 6: const WHEEL_DRAG = false (ship with A, native scroll)');
  const DRAG = path.join(path.dirname(PAGE), 'q93-drag.html'); fs.writeFileSync(DRAG, SRC.replace('\nconst WHEEL_DRAG = false;\n', '\nconst WHEEL_DRAG = true;\n'));
  const o = await page({ file: DRAG, motion: true }); const p = o.p; await hxSpy(p); await openHow(p); await sleep(450);
  const cls = await p.$eval('#whlH', e => ({ c: e.className, ov: getComputedStyle(e).overflowY, ta: getComputedStyle(e).touchAction, snap: getComputedStyle(e).scrollSnapType }));
  ok(/whl-drag/.test(cls.c) && cls.ov === 'hidden' && cls.ta === 'none' && cls.snap === 'none', 'point 6: WHEEL_DRAG = true switches to the pointer-driven wheel (no native scroll)', cls);
  const bx = await p.$eval('#whlH', e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  const val = () => p.evaluate(() => { const tf = document.querySelector('#whlH .whl-list').style.transform, m = /translateY\((-?[\d.]+)px\)/.exec(tf); return { v: document.getElementById('whlH').dataset.v, tf, y: m ? +m[1] : null }; });
  await p.mouse.move(bx.x, bx.y); await p.mouse.down(); for (let i = 1; i <= 6; i++) { await p.mouse.move(bx.x, bx.y - i * 15); await sleep(16); }
  const mid = await val(); await p.mouse.up(); await sleep(1400); const end = await val();
  ok(+mid.v >= 4 && /translateY/.test(mid.tf), 'point 6: dragging moves the list (translateY) and the value follows live', mid);
  // coasting: past the row a plain release would snap to (Math.round of where it was let go), at least a quarter row further on
  const rel = Math.round(-mid.y / 44);
  ok(+end.v > rel && end.y < mid.y - 11 && end.y === -(+end.v * 44), 'point 6: let go, it coasts on (its own momentum) and snaps to a row (260 ms ease-out)', { mid, end, rel });
  ok((await hx(p)).vib >= 2, 'point 6: the same tick per step in the drag wheel', await hx(p));
  // the rubber band at the top end
  await p.focus('#whlH'); await p.keyboard.press('Home'); await sleep(500);
  await p.mouse.move(bx.x, bx.y); await p.mouse.down(); await p.mouse.move(bx.x, bx.y + 100, { steps: 5 }); const rb = await val(); await p.mouse.up(); await sleep(600); const back = await val();
  ok(Math.abs(rb.y - 100 * .35) < .01 && back.y === 0 && back.v === '0', 'point 6: a rubber band at the ends (.35), then it springs back', { rb, back });
  // a tap on a row below the centre, and the keys
  await p.mouse.click(bx.x, bx.y + 88); await sleep(600); const tap = await val();
  ok(tap.v === '2', 'point 6: a tap on a row goes to it', tap);
  await p.keyboard.press('PageUp'); await sleep(600); ok((await val()).v === '6' && (await val()).y === -264, 'point 6: the keys move the drag wheel too', await val());
  // a fling, then Done (or Cancel) while it still coasts: the wheel stops with the sheet (no tick, no move after it closes)
  const dy = () => p.evaluate(() => { const m = /translateY\((-?[\d.]+)px\)/.exec(document.querySelector('#whlD .whl-list').style.transform); return m ? +m[1] : null; });
  await cancel(p); const fl = [];
  for (const btn of ['#psAct', '#psBack']) {
    await openHow(p, 'distance'); await sleep(400); const db = await p.$eval('#whlD', e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await p.mouse.move(db.x, db.y); await p.mouse.down(); for (let k = 1; k <= 6; k++) { await p.mouse.move(db.x, db.y - k * 40); await sleep(8); } await p.mouse.up();
    await frames(p, 2); const ya = await dy(); await frames(p, 2); const yb = await dy();
    await p.click(btn); const n0 = (await hx(p)).vib, y0 = await dy(), sh0 = await isOpen(p); await sleep(1500); const n1 = (await hx(p)).vib, y1 = await dy();
    fl.push({ btn, coasting: ya !== yb, sh0, n0, n1, y0, y1 });
  }
  ok(fl.every(f => f.coasting && !f.sh0 && f.n1 === f.n0 && f.y1 === f.y0), 'point 6: Done or Cancel during a coast stops the wheel with the sheet (no ticks and no moves after it closes)', fl);
  ok(SRC.includes('v*=Math.exp(-fr*dt)') && SRC.includes('const fr=.0035') && SRC.includes('D=sm ? 260 : 0') && SRC.includes('p=p*.35'), 'point 6: its own momentum (exponential friction .0035/ms), the rubber band, a 260 ms ease-out snap');
  await o.close(); fs.unlinkSync(DRAG);
});

/* ---------------------------------------------------------------- a run, and metric (point 3: Runs keep Distance + Pace, km / km/h) */
section('run', async () => {
  const o = await page(); const p = o.p;
  await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=run]'); await until(() => p.evaluate(() => document.documentElement.classList.contains('run-theme'))); await sleep(300);
  ok(await p.$eval('#rideSec .tk-top', e => getComputedStyle(e).backgroundImage === 'none'), 'a run ticket keeps its flat graphite top');
  await openHow(p, 'distance');
  const R = await p.evaluate(() => ({ lab: document.getElementById('whlSL').textContent, du: document.getElementById('whlDU').textContent, su: document.getElementById('whlSU').textContent, n: document.querySelectorAll('#whlD .whl-i').length, first: document.querySelector('#whlD .whl-i').textContent, last: document.querySelector('#whlD .whl-i:last-child').textContent, pace: document.getElementById('whlS').getAttribute('aria-valuetext'), read: document.getElementById('distRead').innerText.replace(/\s+/g, ' ').trim() }));
  ok(R.lab === 'Pace' && R.du === 'mi' && R.su === '/mi' && R.n === 596 && R.first === '0.5' && R.last === '60' && / per mile$/.test(R.pace), 'point 3: runs keep their Distance + Pace wheels ("mi", "/mi" in the band; 0.5-60 mi)', R);
  ok(/^\d+(\.\d)? mi · \d+:\d\d \/mi about /.test(R.read), 'the run readout "13.1 mi · 8:30 /mi" with "about ..." under it', R.read);
  const RU = await unitsAt(p, ['whlD', 'whlS']);
  ok(RU[0].t === 'mi' && RU[1].t === '/mi' && unitsOk(RU, null), 'point 4: a run: "mi" / "/mi" sit fixed just right of the centre row, inside the band', RU);
  const RT = await p.locator('#howDistP').ariaSnapshot(), RR = await p.evaluate(() => ['whlD', 'whlS'].map(id => [document.getElementById(id).getAttribute('role'), document.getElementById(id).tabIndex]));
  ok(RR.every(r => r[0] === 'spinbutton' && r[1] === 0) && /spinbutton "Distance"/.test(RT) && /spinbutton "Pace"/.test(RT) && !/listbox|option/.test(RT), 'DECISIONS: a run: the Distance and Pace wheels are spinbuttons for screen readers (no listbox of options)', { RR, RT });
  // point 3: ranges stay as they are: the pace wheel is 5:00-14:00 /mi in 15 s steps, plus the athlete pace when it is off that grid
  const PZ = await p.evaluate(() => { const e = document.getElementById('whlS'), r = [...e.querySelectorAll('.whl-i')]; return { min: e.getAttribute('aria-valuemin'), max: e.getAttribute('aria-valuemax'), now: +e.getAttribute('aria-valuenow'), v: r.map(x => +x.dataset.v), first: r[0].textContent, last: r[r.length - 1].textContent }; });
  const paceWant = [...Array(37).keys()].map(k => 300 + k * 15).concat([PZ.now]).filter((v, i, a) => a.indexOf(v) === i).sort((x, y) => x - y);
  ok(PZ.now >= 300 && PZ.now <= 840 && PZ.min === '300' && PZ.max === '840' && PZ.first === '5:00' && PZ.last === '14:00' && PZ.v.join() === paceWant.join(), 'point 3: ranges stay: the run pace wheel is 5:00-14:00 /mi in 15 s steps (and the athlete pace)', { min: PZ.min, max: PZ.max, now: PZ.now, n: PZ.v.length, first: PZ.first, last: PZ.last });
  // digits on the run wheels (DECISIONS: digits): a row that is the typed number comes first (5 is 5 mi, not 0.5; 1 3 is 13, not 1.3),
  // else the first row whose digits start so (1 3 1 is 13.1, 2 6 2 is 26.2); a point picks tenths (3 . 1 is 3.1); pace 6 0 0 is 6:00
  const dig = [];
  for (const [id, ks, want] of [['whlD', ['5'], '5'], ['whlD', ['1', '3'], '13'], ['whlD', ['2', '6'], '26'], ['whlD', ['7'], '7'], ['whlD', ['3', '.', '1'], '3.1'], ['whlD', ['2', '6', '2'], '26.2'], ['whlD', ['1', '0'], '10'], ['whlS', ['6', '0', '0'], '360'], ['whlS', ['8', '3'], '510']]) {
    await sleep(950); await keys(p, id, ks); dig.push([id, ks.join(' '), (await wv(p, id)).v, want]); }
  ok(dig.every(d => d[2] === d[3]), 'DECISIONS: digits on the run wheels: 5 is 5 mi, 1 3 is 13, 2 6 is 26, 7 is 7 (not 0.5, 1.3, 2.6, 0.7); 3 . 1 is 3.1, 2 6 2 is 26.2, 1 0 is 10; pace 6 0 0 is 6:00, 8 3 is 8:30', dig);
  await sleep(950); await keys(p, 'whlD', ['1', '3', '1']); await keys(p, 'whlS', ['8', '3']); const rr = await txt(p, '#distRead');
  ok(rr === '13.1 mi · 8:30 /mi about 1 h 51 m', 'run: 1 3 1 is 13.1 mi, 8 3 is 8:30 /mi: "about 1 h 51 m"', rr);
  await done(p); const t = await ticket(p);
  ok(t.v === '13.1' && t.u === 'mi · 8:30 /mi' && t.s === 'about 1 h 51 m' && t.name === 'How long: 13.1 mi · 8:30 /mi, about 1 h 51 m. Change', 'run Done: the ticket "13.1" "mi · 8:30 /mi" over "about 1 h 51 m"', t);
  // QA: the sheet opens on the current mode for a run too (RUNP.mode): tap the big number again, no flip: Distance, the focus on the
  // Distance wheel, 13.1 mi at 8:30; Done untouched keeps the run as it was
  await openHow(p); const ro = { mode: await p.$eval('#stopsMode [aria-pressed=true]', b => b.dataset.rmode), focus: await until(() => p.evaluate(() => document.activeElement.id === 'whlD' && 'whlD'), 2000) || await p.evaluate(() => document.activeElement.id), d: (await wv(p, 'whlD')).now, s: (await wv(p, 'whlS')).now };
  await done(p); const rt = await ticket(p);
  ok(ro.mode === 'distance' && ro.focus === 'whlD' && ro.d === '13.1' && ro.s === '510' && rt.name === t.name, 'QA: a run set by distance opens How long on Distance (focus on the Distance wheel, 13.1 mi at 8:30 /mi); Done untouched keeps "13.1 mi · 8:30 /mi"', { ro, rt });
  // the "about" line rounds the whole time: 13.3 mi at 9:00 /mi is 119.7 min, "about 2 h" (not "1 h 60 m"), in the readout, the ticket and its name
  await openHow(p); await keys(p, 'whlD', ['1', '3', '3']); await keys(p, 'whlS', ['9', '0', '0']); const r60 = await txt(p, '#distRead'); await done(p); const t60 = await ticket(p);
  ok(r60 === '13.3 mi · 9:00 /mi about 2 h' && t60.s === 'about 2 h' && t60.name === 'How long: 13.3 mi · 9:00 /mi, about 2 h. Change', 'run: 13.3 mi at 9:00 /mi reads "about 2 h" (whole minutes first, never "1 h 60 m"): readout, ticket, name', { r60, t60 });
  // and a run set by time opens on Time: flip to Time, 1 h 15, Done; the big number again: Time, the focus on Hours, 1 h 15; Done untouched keeps it
  await openHow(p, 'time'); await keys(p, 'whlH', ['1']); await keys(p, 'whlM', ['1', '5']); await done(p); const tt = await ticket(p);
  await openHow(p); const to = { mode: await p.$eval('#stopsMode [aria-pressed=true]', b => b.dataset.rmode), focus: await until(() => p.evaluate(() => document.activeElement.id === 'whlH' && 'whlH'), 2000) || await p.evaluate(() => document.activeElement.id), h: (await wv(p, 'whlH')).now, m: (await wv(p, 'whlM')).now };
  await done(p); const tt2 = await ticket(p);
  ok(tt.v === '1:15' && to.mode === 'time' && to.focus === 'whlH' && to.h === '1' && to.m === '15' && tt2.name === tt.name, 'QA: a run set by time opens How long on Time (focus on Hours, 1 h 15); Done untouched keeps it', { tt, to, tt2 });
  await o.close();
  const m = await page({ settings: { units: 'metric' } }); const q = m.p; await openHow(q, 'distance');
  const M = await q.evaluate(() => ['whlD', 'whlS'].map(id => { const e = document.getElementById(id), r = [...e.querySelectorAll('.whl-i')]; return { u: e.parentElement.querySelector('.whl-u').textContent, min: e.getAttribute('aria-valuemin'), max: e.getAttribute('aria-valuemax'), text: e.getAttribute('aria-valuetext'), v: r.map(x => +x.dataset.v), l: r.map(x => x.textContent).join(' ') }; }));
  ok(M[0].u === 'km' && M[1].u === 'km/h' && M[0].min === '1' && M[0].max === '320' && M[1].min === '12' && M[1].max === '56' && / kilometers$/.test(M[0].text) && / kilometers per hour$/.test(M[1].text), 'point 3: metric: km 1-320 and km/h 12-56, "km" / "km/h" in the band', M.map(m => [m.u, m.min, m.max, m.text]));
  ok(M[0].v.length === 320 && M[0].v.every((v, k) => v === k + 1) && M[0].l === Array.from({ length: 320 }, (_, k) => String(k + 1)).join(' ') && M[1].v.length === 45 && M[1].v.every((v, k) => v === k + 12) && M[1].l === Array.from({ length: 45 }, (_, k) => String(k + 12)).join(' '),
    'point 3: metric ranges stay as on main: km 1-320 and km/h 12-56 in whole steps (320 and 45 rows)', { km: [M[0].v.length, M[0].v[0], M[0].v[M[0].v.length - 1]], kmh: [M[1].v.length, M[1].l] });
  const MU = await unitsAt(q, ['whlD', 'whlS']);
  ok(MU[0].t === 'km' && MU[1].t === 'km/h' && unitsOk(MU), 'point 4: metric: "km" / "km/h" sit fixed just right of the centre row, inside the band', MU);
  await keys(q, 'whlD', ['1', '6', '0']); await keys(q, 'whlS', ['2', '9']); ok(await txt(q, '#distRead') === '160 km · 29 km/h about 5 h 31 m', 'metric readout "160 km · 29 km/h" about 5 h 31 m', await txt(q, '#distRead'));
  await done(q); const k = await ticket(q); ok(k.v === '160' && k.u === 'km · 29 km/h' && /^about 5 h 3\d m$/.test(k.s), 'metric Done: the ticket in km', k);
  await m.close();
});

/* ---------------------------------------------------------------- the row pitch when a row is a fraction of a pixel (the iPhone's 17 px text) */
// html{font:-apple-system-body} gives a 17 px root on an iPhone at the default text size: a row (2.75rem) is 46.75 px. The row whose
// centre sits in the band (Reduce Motion: the rows carry no transform) must be the wheel's value, whatever the text size
const inBand = (p, id) => p.$eval('#' + id, el => { const col = el.parentElement, box = col.parentElement, band = [col.querySelector('.whl-band'), box.querySelector(':scope>.whl-band')].find(b => b && b.getClientRects().length);
  const B = band.getBoundingClientRect(), cy = B.top + B.height / 2; let best = null, bd = 1e9;
  el.querySelectorAll('.whl-i').forEach(r => { if (r.style.visibility === 'hidden') return; const b = r.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - cy); if (d < bd) { bd = d; best = r; } });
  const on = el.querySelector('.whl-i.on'); return { band: best && best.dataset.v, off: Math.round(bd * 100) / 100, v: el.dataset.v, now: el.getAttribute('aria-valuenow'), on: on && on.dataset.v, rowH: getComputedStyle(el.querySelector('.whl-i')).height }; });
const agree = x => x.band === x.v && x.now === x.v && x.on === x.v && x.off < 2;
async function spinWheel(p, id, dy, n) { const b = await p.$eval('#' + id, e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); await p.mouse.move(b.x, b.y); for (let i = 0; i < n; i++) { await p.mouse.wheel(0, dy); await sleep(150); } await sleep(1300); }
section('pitch', async () => {
  for (const scale of [1.0625, 1.1875]) {
    const tag = 16 * scale + ' px text', o = await page({ scale }); const p = o.p; await openHow(p, 'distance'); const a = [];
    await keys(p, 'whlD', ['1', '0', '0']); await sleep(500); a.push(['1 0 0', await inBand(p, 'whlD')]);
    await keys(p, 'whlD', ['ArrowUp']); await sleep(500); a.push(['Up', await inBand(p, 'whlD')]);
    await keys(p, 'whlD', ['End']); await sleep(500); a.push(['End', await inBand(p, 'whlD')]);
    await p.$eval('#whlD', el => { const r = el.querySelectorAll('.whl-i')[150]; el.scrollTop = r.offsetTop + r.offsetHeight / 2 - el.clientHeight / 2; }); await sleep(900); a.push(['a native scroll to 151', await inBand(p, 'whlD')]);
    await spinWheel(p, 'whlD', 100, 3); a.push(['the mouse wheel', await inBand(p, 'whlD')]);
    ok(a.every(([, x]) => agree(x)) && a[0][1].v === '100' && a[1][1].v === '101' && a[2][1].v === '200' && a[3][1].v === '151', tag + ' (rows ' + a[0][1].rowH + '): the number in the band is the value (data-v, aria-valuenow, the bold row) after 1 0 0, Up, End, a native scroll and the mouse wheel', a);
    const last = a[4][1].v; await done(p); const t = await ticket(p);
    ok(t.v === last, tag + ': Done applies the number in the band', { last, t });
    await o.close();
  }
  const o = await page({ scale: 1.0625 }); const p = o.p;
  await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=run]'); await until(() => p.evaluate(() => document.documentElement.classList.contains('run-theme'))); await sleep(300);
  await openHow(p, 'distance'); const a = [['open', await inBand(p, 'whlD')], ['pace', await inBand(p, 'whlS')]];
  await keys(p, 'whlD', ['1', '3', '1']); await sleep(500); a.push(['1 3 1', await inBand(p, 'whlD')]);
  await keys(p, 'whlD', ['End']); await sleep(500); a.push(['End', await inBand(p, 'whlD')]);
  await spinWheel(p, 'whlD', -100, 2); a.push(['the mouse wheel', await inBand(p, 'whlD')]);
  ok(a.every(([, x]) => agree(x)) && a[2][1].v === '13.1' && a[3][1].v === '60', '17 px text, a run: the band shows the value on the 596-row distance wheel (open, 13.1, End 60, the mouse wheel) and the pace', a);
  await o.close();
  // the text size changes while How long is open (iOS Control Center: no resize event, and a short Plan page, not crunched, keeps the body
  // height): the wheels re-measure their rows and stay on the picked value; the band, the value, the readout and Done agree, no tick
  const t = await page({ scale: 1.0625, label: 'text size live' }); const tq = t.p; await hxSpy(tq); await openHow(tq);
  await keys(tq, 'whlH', ['5']); await keys(tq, 'whlM', ['3', '0']); await sleep(600); await tq.evaluate(() => { window.__vib = []; });
  const z0 = [await inBand(tq, 'whlH'), await inBand(tq, 'whlM')];
  await tq.evaluate(() => { document.documentElement.style.fontSize = '19px'; }); await sleep(1500);
  const z1 = [await inBand(tq, 'whlH'), await inBand(tq, 'whlM')], zr = await txt(tq, '#durRead'), zv = (await hx(tq)).vib; await done(tq); const zt = await ticket(tq);
  ok(z0[0].v === '5' && z0[1].v === '30' && z1.every(agree) && z1[0].v === '5' && z1[1].v === '30' && z1[0].rowH === '52.25px' && zr === '5 h 30 min' && zv === 0 && zt.v === '5:30', '17 -> 19 px text while How long is open (Time, 5 h 30): the band, the value and the readout stay 5 h 30 min with no tick, and Done applies 5:30', { z0, z1, zr, zv, zt });
  await tq.evaluate(() => { document.documentElement.style.fontSize = '16px'; }); await sleep(400);
  await openHow(tq, 'distance'); await keys(tq, 'whlD', ['1', '2', '0']); await keys(tq, 'whlS', ['1', '7']); await sleep(600); await tq.evaluate(() => { window.__vib = []; });
  const y0 = [await inBand(tq, 'whlD'), await inBand(tq, 'whlS')];
  await tq.evaluate(() => { document.documentElement.style.fontSize = '17px'; }); await sleep(1500);
  const y1 = [await inBand(tq, 'whlD'), await inBand(tq, 'whlS')], yr = await txt(tq, '#distRead'), yv = (await hx(tq)).vib; await done(tq); const yt = await ticket(tq);
  ok(y0[0].v === '120' && y1.every(agree) && y1[0].v === '120' && y1[1].v === '17' && y1[0].rowH === '46.75px' && /^120 mi · 17 mph/.test(yr) && yv === 0 && yt.v === '120' && yt.u === 'mi · 17 mph', '16 -> 17 px text while How long is open (Distance, 120 mi at 17 mph): the band, the value and the readout stay, no tick, and Done applies 120 mi', { y0, y1, yr, yv, yt });
  await t.close();
});

/* ---------------------------------------------------------------- no list-wide restyle per frame (the run Distance wheel: 596 rows) */
// one step of a spin repaints a few rows (transform, opacity, visibility, .on); no style rule may make such a write restyle every row
async function restyled(p, cdp, src) { const ev = []; const on = e => ev.push(...e.value); cdp.on('Tracing.dataCollected', on); const fin = new Promise(r => cdp.once('Tracing.tracingComplete', r));
  await p.evaluate(() => getComputedStyle(document.body).color); await sleep(100);
  await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReportEvents' });
  await p.evaluate(src => new Promise(res => { (new Function(src))(); requestAnimationFrame(() => requestAnimationFrame(() => { getComputedStyle(document.body).color; res(); })); }), src);
  await cdp.send('Tracing.end'); await fin; cdp.off('Tracing.dataCollected', on);
  return ev.filter(e => e.name === 'UpdateLayoutTree' && e.ph === 'X').reduce((s, e) => s + ((e.args && e.args.elementCount) || 0), 0); }
section('perf', async () => {
  const o = await page({ motion: true }); const p = o.p;
  await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=run]'); await until(() => p.evaluate(() => document.documentElement.classList.contains('run-theme'))); await sleep(300);
  await openHow(p, 'distance'); await sleep(500); const cdp = await p.context().newCDPSession(p);
  const W = "const el=document.getElementById('whlD'), rows=el.querySelectorAll('.whl-i'), k=[...rows].findIndex(r=>r.classList.contains('on'));";
  const n = { rows: await p.$$eval('#whlD .whl-i', r => r.length), step: await restyled(p, cdp, W + "el.scrollTop+=parseFloat(getComputedStyle(rows[0]).height);"), on: await restyled(p, cdp, W + "rows[k].classList.remove('on'); rows[k+1].classList.add('on');"),
    style: await restyled(p, cdp, W + "rows[k+2].style.opacity='0.5'; rows[k+2].style.transform='rotateX(10deg)';") };
  ok(n.rows === 596 && n.step < 120 && n.on < 50 && n.style < 50, 'no work across the whole list per frame: one wheel step (a scroll and its frame), a moved .on, a row style write each restyle a handful of elements, not the 1,200 rows of the run Distance wheel', n);
  // a wheel step rewrites the readout but does not refit the app: #durRead and #distRead carry data-no-refit (not data-mo-live, which
  // means a number counting up); 5 native steps of Distance, 3 key steps of Minutes: no fitAll run
  const mk = await p.evaluate(() => ['durRead', 'distRead'].map(id => { const e = document.getElementById(id); return [id, e.matches('[data-no-refit]'), e.matches('[data-mo-live]')]; }));
  await sleep(300); await fitCount(p); const rd0 = await txt(p, '#distRead');
  for (let k = 0; k < 5; k++) { await p.$eval('#whlD', el => { el.scrollTop += parseFloat(getComputedStyle(el.querySelector('.whl-i')).height); }); await frames(p, 3); await sleep(40); }
  await sleep(300); const fd = await fits(p), rd1 = await txt(p, '#distRead');
  await p.click('#stopsMode [data-rmode=time]'); await sleep(500); await fitCount(p); const rt0 = await txt(p, '#durRead');
  for (let k = 0; k < 3; k++) { await keys(p, 'whlM', ['ArrowUp']); await sleep(400); }
  await sleep(300); const ft = await fits(p), rt1 = await txt(p, '#durRead');
  ok(mk.every(m => m[1] && !m[2]) && rd1 !== rd0 && rt1 !== rt0 && fd === 0 && ft === 0, 'a wheel step rewrites the readout without a refit of the app (#durRead / #distRead: data-no-refit, not data-mo-live)', { mk, rd0, rd1, fd, rt0, rt1, ft });
  await o.close();
});

/* ---------------------------------------------------------------- the same plan for the same duration, against main (rules, DECISIONS) */
async function crunch(p) { await p.click('#calcBtn'); await until(() => p.$eval('#results', r => getComputedStyle(r).display !== 'none' && r.innerText.length > 300), 10000); await sleep(400); }
// the plan numbers: the troubleshooting copy (Results › Copy for troubleshooting) carries the whole result (r), the plan (legs, bottles,
// gels, totals, the ride day), the hours table, the inputs and the settings as JSON; the app is one closure, so this is how a test reads them
async function planOf(p) {
  await p.evaluate(() => { window.__clip = []; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t => { window.__clip.push(String(t)); return Promise.resolve(); } } }); });
  await p.click('#dbgCopyBtn'); await until(() => p.evaluate(() => window.__clip.length > 0), 4000);
  return p.evaluate(() => { const s = window.__clip[0] || '', m = /```json\n([\s\S]*)\n```/.exec(s), d = m ? JSON.parse(m[1]) : {};
    return { r: JSON.stringify({ inputs: d.inputs, result: d.result, plan: d.plan, hoursTable: d.hoursTable, settings: d.settings, units: d.units, sport: d.sport }), n: d.result ? Object.keys(d.result).length : 0,
      saved: localStorage.getItem('bluebird.lastPlan.v1'), text: document.getElementById('results').innerText.replace(/[ \t]+/g, ' ').trim(), ticket: document.getElementById('howV').textContent + ' ' + document.getElementById('howU').textContent }; });
}
section('plan', async () => {
  if (!MAIN) { ok(false, 'plan: give the main null.html as the second argument'); return; }
  const CASES = [['4:15', 4, 15], ['2:00', 2, 0], ['0:45', 0, 45], ['7:30', 7, 30], ['100 mi at 18 mph', 100, 18], ['3:00', 3, 0]]; /* the last: Distance -> Time in the sheet, then Done */
  const mine = await page({ label: 'mine' }), main = await page({ file: MAIN, label: 'main' }); let prev = null;
  for (const [name, a, b] of CASES) {
    const dist = /mi/.test(name);
    // this branch: the real controls (tap the number, the wheels by keyboard, Done)
    await openHow(mine.p, dist ? 'distance' : 'time');
    if (dist) { await keys(mine.p, 'whlD', String(a).split('')); await keys(mine.p, 'whlS', String(b).split('')); }
    else { await keys(mine.p, 'whlH', ['Home', ...(a ? String(a).split('') : [])]); await keys(mine.p, 'whlM', ['Home', ...(b ? String(b).split('') : [])]); }
    await done(mine.p); await crunch(mine.p);
    // main after item 93 merged (no Duration button): the same controls as this branch, so later items are checked against today's main
    if (!(await main.p.$('#howBtn'))) { await openHow(main.p, dist ? 'distance' : 'time');
      if (dist) { await keys(main.p, 'whlD', String(a).split('')); await keys(main.p, 'whlS', String(b).split('')); }
      else { await keys(main.p, 'whlH', ['Home', ...(a ? String(a).split('') : [])]); await keys(main.p, 'whlM', ['Home', ...(b ? String(b).split('') : [])]); }
      const mv = await main.p.evaluate(() => ['whlH', 'whlM', 'whlD', 'whlS'].map(id => document.getElementById(id).dataset.v));
      ok(dist ? mv[2] === String(a) && mv[3] === String(b) : mv[0] === String(a) && mv[1] === String(b), 'plan ' + name + ': main (item 93 in) set through its wheels', mv);
      await done(main.p); await crunch(main.p);
    } else {
    // main before item 93: its own How long sheet (Duration button, its wheels)
    await main.p.click('#howBtn'); await until(() => isOpen(main.p)); await frames(main.p, 2);
    const cur = await main.p.$eval('#stopsMode [aria-pressed=true]', x => x.dataset.rmode); if (cur !== (dist ? 'distance' : 'time')) { await main.p.click('#stopsMode [data-rmode=' + (dist ? 'distance' : 'time') + ']'); await frames(main.p, 2); }
    /* main's wheels are listboxes: Home, then ArrowDown one item at a time (PageDown is 6) */
    const steps = n => [...Array(Math.floor(n / 6)).fill('PageDown'), ...Array(n % 6).fill('ArrowDown')];
    if (dist) { await keys(main.p, 'whlD', ['Home', ...steps(a - 1)]); await keys(main.p, 'whlS', ['Home', ...steps((b - 8) * 2)]); }
    else { await keys(main.p, 'whlH', ['Home', ...steps(a)]); await keys(main.p, 'whlM', ['Home', ...steps(b / 5)]); }
    const mv = await main.p.evaluate(() => ['whlH', 'whlM', 'whlD', 'whlS'].map(id => document.getElementById(id).dataset.v));
    ok(dist ? mv[2] === String(a) && mv[3] === String(b) : mv[0] === String(a) && mv[1] === String(b), 'plan ' + name + ': main set through its own wheels', mv);
    await main.p.click('#psAct'); await until(async () => !(await isOpen(main.p))); await frames(main.p, 2); await crunch(main.p); }
    const A = await planOf(mine.p), B = await planOf(main.p);
    ok(A.ticket === B.ticket, 'plan ' + name + ': the ticket reads the same as main (' + A.ticket + ')', [A.ticket, B.ticket]);
    ok(A.n > 5 && A.r.length > 1000 && A.r === B.r, 'plan ' + name + ': the plan numbers (the result, legs, bottles, gels, totals, hours, inputs, settings) are identical to main', A.r === B.r ? '' : firstDiff(A.r, B.r));
    ok(A.saved === B.saved, 'plan ' + name + ': the saved plan (bluebird.lastPlan.v1) is identical to main', A.saved === B.saved ? '' : firstDiff(A.saved, B.saved));
    ok(A.text.length > 300 && A.text === B.text, 'plan ' + name + ': the Results text is identical to main', A.text === B.text ? '' : firstDiff(A.text, B.text));
    ok(prev === null || (A.r !== prev.r && A.text !== prev.text), 'plan ' + name + ': a new plan (not the one before it)'); prev = A;
  }
  await mine.close(); await main.close();
});
function firstDiff(a, b) { a = a || ''; b = b || ''; let i = 0; while (i < a.length && a[i] === b[i]) i++; return { at: i, mine: a.slice(Math.max(0, i - 60), i + 80), main: b.slice(Math.max(0, i - 60), i + 80) }; }

/* ---------------------------------------------------------------- 390 px, and 320 px at 200% text (rules) */
async function fitCheck(p, label) {
  return p.evaluate(label => { const out = [], de = document.documentElement, vw = de.clientWidth;
    if (de.scrollWidth > vw + 1) out.push('page scrolls sideways ' + de.scrollWidth);
    const sh = document.querySelector('#planSheet .plan-sheet'); if (sh && sh.scrollWidth > sh.clientWidth + 1) out.push('sheet scrolls sideways');
    document.querySelectorAll('#planSheet .whs').forEach(b => { if (!b.getClientRects().length) return; const B = b.getBoundingClientRect(); if (B.right > vw + .5 || B.left < -.5) out.push(b.id + ' past the screen');
      b.querySelectorAll('.wcol').forEach(c => { const C = c.getBoundingClientRect(), u = c.querySelector('.whl-u').getBoundingClientRect(), sc = c.querySelector('.whl'), pr = parseFloat(getComputedStyle(sc.querySelector('.whl-i')).paddingRight);
        if (u.right > C.right + .5) out.push(sc.id + ': unit past its box'); if (u.left < C.left) out.push(sc.id + ': unit left of its box');
        let w = 0; sc.querySelectorAll('.whl-i>span').forEach(s => { w = Math.max(w, s.offsetWidth); }); const nl = C.left + (C.width - pr - w) / 2;
        if (nl + w > u.left - 1) out.push(sc.id + ': the widest number runs into its unit ' + Math.round(nl + w - u.left)); if (nl < C.left) out.push(sc.id + ': the widest number past its box'); }); });
    const T = []; document.querySelectorAll('#tkBig, #planSheet.open .ps-top button:not([hidden]), #planSheet.open #stopsMode button, #planSheet.open .whl').forEach(e => { if (!e.getClientRects().length || getComputedStyle(e).visibility === 'hidden') return; const r = e.getBoundingClientRect(); if (r.width < 44 || r.height < 44) T.push((e.id || e.textContent) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); });
    if (T.length) out.push('small targets: ' + T.join(', '));
    const big = document.getElementById('tkBig'), B = big.getBoundingClientRect(); [...big.querySelectorAll('b,span,small')].forEach(e => { const r = e.getBoundingClientRect(); if (r.width && (r.right > B.right + 1 || e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== 'inline')) out.push('#tkBig text cut: ' + e.textContent); });
    if (B.right > vw) out.push('#tkBig past the screen');
    return out; }, label);
}
// a stacked pair (larger text): each wheel in its own box shows its own band (the shared band hidden): the tint, a row tall, round the centre row
const stkBands = (p, ids) => p.evaluate(ids => ids.map(id => { const el = document.getElementById(id), col = el.parentElement, own = col.querySelector(':scope>.whl-band'), shared = col.parentElement.querySelector(':scope>.whl-band'), on = el.querySelector('.whl-i.on');
  const B = own && own.getClientRects().length ? own.getBoundingClientRect() : null, O = on && on.getBoundingClientRect();
  return { id, own: !!B, shared: !!(shared && shared.getClientRects().length), bg: own ? getComputedStyle(own).backgroundColor : '', h: B ? Math.round(B.height * 100) / 100 : 0, rowH: parseFloat(getComputedStyle(el.querySelector('.whl-i')).height), mid: B && O ? Math.round((B.top + B.height / 2 - (O.top + O.height / 2)) * 10) / 10 : null }; }), ids);
const stkOk = S => S.every(s => s.own && !s.shared && s.bg === 'rgb(230, 241, 246)' && Math.abs(s.h - s.rowH) <= .5 && s.mid !== null && Math.abs(s.mid) <= 1);
section('small', async () => {
  for (const [w, s] of [[390, 1], [375, 1.5], [320, 1], [320, 1.5], [320, 2]]) {
    const o = await page({ width: w, height: 844, scale: s }); const p = o.p, tag = w + ' px at ' + s * 100 + '%';
    const ib = async id => { try { return await inBand(p, id); } catch (e) { return { band: null, err: String(e).slice(0, 80) }; } }, uok = async ids => { try { return unitsOk(await unitsAt(p, ids), undefined, 60 * s); } catch (e) { return false; } };
    const stacked = async (ids, ends) => { const sb = await stkBands(p, ids), i0 = [], i1 = []; for (const id of ids) i0.push(await ib(id)); const u0 = await uok(ids);
      for (const id of ids) await keys(p, id, ['End']); for (const id of ids) i1.push(await ib(id));
      return { ok: stkOk(sb) && u0 && i0.every(agree) && i1.every(agree) && i1.map(x => x.v).join() === ends, sb, u0, i0, i1 }; };
    let f = await fitCheck(p, 'ticket'); ok(f.length === 0, tag + ': the ticket fits (no sideways scroll, nothing cut, 44 px)', f);
    await openHow(p); await sleep(200); const stT = await p.$eval('#whsT', e => e.classList.contains('stk')); f = await fitCheck(p, 'time');
    ok(f.length === 0, tag + ': How long (Time) fits: the wheels, the units in their boxes, no number into its unit, 44 px targets', { f, stacked: stT });
    if (w === 390 && s === 1) ok(!stT, '390 px: the two wheels side by side under one band');
    if (w === 320 && s === 2) { ok(stT, '320 px at 200%: the two Time wheels stack'); await p.screenshot({ path: path.join(SHOTS, 'q93-wheel-time-320-200.png') }); }
    if (stT) { const st = await stacked(['whlH', 'whlM'], '12,55'); ok(st.ok, tag + ': the stacked Time wheels each show their own band (the tint, a row tall, round the centre row; the shared band hidden), the unit in it, the number in it the value (open, End)', st); }
    await keys(p, 'whlH', ['End']); await keys(p, 'whlM', ['End']); ok(await txt(p, '#durRead') === '12 h 55 min', tag + ': the wheels still work (End, End: 12 h 55 min)', await txt(p, '#durRead'));
    await p.click('#stopsMode [data-rmode=distance]'); await frames(p, 3); f = await fitCheck(p, 'distance');
    const stD = await p.$eval('#whsD', e => e.classList.contains('stk')); ok(f.length === 0, tag + ': How long (Distance) fits', { f, stacked: stD });
    if (w === 320 && s === 2) ok(stD, '320 px at 200%: the two Distance wheels stack');
    if (stD) { const st = await stacked(['whlD', 'whlS'], '200,35'); ok(st.ok, tag + ': the stacked Distance wheels each show their own band, the unit in it, the number in it the value (open, End: 200 mi, 35 mph)', st); }
    if (w === 320 && s === 2) await p.screenshot({ path: path.join(SHOTS, 'q93-wheel-distance-320-200.png') });
    await o.close();
  }
  // a refit of the app while How long is open (a signed-in rider's sync line is rewritten every 30 s; a rotation): at 375 x 667 and 200% text
  // the stacked sheet keeps its scroll, and the second wheel the rider scrolled (or tabbed) to stays on screen
  const so = await page({ width: 375, height: 667, scale: 2, label: 'stacked refit' }); const sp = so.p;
  const kick = async () => { await fitCount(sp); await sp.evaluate(() => { const s = document.getElementById('syncSt'); if (s) s.innerHTML = '<span>' + Date.now() + '</span>'; else document.body.appendChild(document.createElement('i')); window.dispatchEvent(new Event('resize')); }); await sleep(500); await frames(sp, 2); return fits(sp); };
  const at2 = id => sp.evaluate(id => { const sc = document.querySelector('#planSheet .plan-sheet'), S = sc.getBoundingClientRect(), el = document.getElementById(id), B = el.parentElement.querySelector(':scope>.whl-band').getBoundingClientRect();
    return { top: Math.round(sc.scrollTop), max: Math.round(sc.scrollHeight - sc.clientHeight), stk: el.closest('.whs').classList.contains('stk'), band: [Math.round(B.top), Math.round(B.bottom)], seen: B.height > 0 && B.top >= S.top - .5 && B.bottom <= Math.min(S.bottom, innerHeight) + .5, focus: document.activeElement.id }; }, id);
  const rf = []; await openHow(sp); await sleep(300);
  for (const [pane, id] of [['time', 'whlM'], ['distance', 'whlS']]) {
    if (pane === 'distance') { await sp.click('#stopsMode [data-rmode=distance]'); await sleep(400); }
    await sp.evaluate(() => { const sc = document.querySelector('#planSheet .plan-sheet'); sc.scrollTop = sc.scrollHeight; }); await frames(sp, 3);
    const a = await at2(id), n = await kick(), b = await at2(id); rf.push({ pane, how: 'scrolled', a, n, b });
  }
  await sp.evaluate(() => { document.querySelector('#planSheet .plan-sheet').scrollTop = 0; }); await frames(sp, 2); await sp.focus('#whlD'); await sp.keyboard.press('Tab'); await sp.keyboard.press('ArrowUp'); await sleep(400);
  { const a = await at2('whlS'), n = await kick(), b = await at2('whlS'); rf.push({ pane: 'distance', how: 'Tab', a, n, b }); }
  ok(rf.every(r => r.a.stk && r.a.max > 40 && r.a.top > 40 && r.a.seen && r.n >= 1 && r.b.top === r.a.top && r.b.seen && r.b.focus === r.a.focus) && rf[2].a.focus === 'whlS',
    '375 x 667 at 200%: a refit of the app (the sync line rewritten, a resize) leaves the stacked sheet where the rider scrolled or tabbed to (Time, Distance): the second wheel stays on screen', rf);
  await so.close();
});

/* ---------------------------------------------------------------- the accessibility tree, focus ring, AA in the sheet */
section('a11y', async () => {
  const o = await page(); const p = o.p;
  const tk = await p.locator('#rideSec .tk-top').ariaSnapshot();
  ok(/button "How long: 2:30 hours\. Change"/.test(tk) && !/Duration/.test(tk), 'QA: VoiceOver: the big number is a button "How long: 2:30 hours. Change"', tk);
  await p.focus('#tkBig'); await p.keyboard.press('Enter'); await until(() => isOpen(p)); await sleep(200);
  const tree = await p.locator('#planSheet [data-ps=how]').ariaSnapshot();
  ok(/spinbutton "Hours"/.test(tree) && /spinbutton "Minutes"/.test(tree) && !/option/.test(tree) && !/listbox/.test(tree), 'DECISIONS: each wheel is a spinbutton "Hours" / "Minutes" for screen readers (no listbox of options)', tree);
  const ring = await p.evaluate(() => { const fr = document.querySelector('#whlH').parentElement.querySelector('.whl-fr'), cs = getComputedStyle(fr); return { o: cs.outlineStyle, w: cs.outlineWidth, c: cs.outlineColor, z: cs.zIndex, focus: document.activeElement.id }; });
  ok(ring.focus === 'whlH' && ring.o === 'solid' && ring.w === '2px' && ratio(ring.c, 'rgb(255,255,255)') >= 3, 'keyboard: the focused wheel shows a 2 px focus ring (3:1), above the fades', ring);
  await p.keyboard.press('Tab'); await frames(p, 2); const r2 = await p.evaluate(() => ({ f: document.activeElement.id, a: getComputedStyle(document.querySelector('#whlH').parentElement.querySelector('.whl-fr')).outlineStyle, b: getComputedStyle(document.querySelector('#whlM').parentElement.querySelector('.whl-fr')).outlineStyle }));
  ok(r2.f === 'whlM' && r2.a === 'none' && r2.b === 'solid', 'keyboard: Tab moves to the Minutes wheel (its ring)', r2);
  // AA in the sheet: the readout, its units, the centre rows, the units, the switch
  const cols = await p.evaluate(() => { const cs = e => getComputedStyle(e), sheetBg = cs(document.querySelector('#planSheet .plan-sheet')).backgroundColor, swBg = cs(document.getElementById('stopsMode')).backgroundColor;
    return { sheetBg, read: cs(document.getElementById('durRead')).color, small: cs(document.querySelector('#durRead small')).color, on: cs(document.querySelector('#whlH .whl-i.on')).color, unit: cs(document.getElementById('whlHU')).color, band: cs(document.querySelector('#whsT>.whl-band')).backgroundColor,
      sw: cs(document.querySelector('#stopsMode [aria-pressed=false]')).color, swBg, swOn: cs(document.querySelector('#stopsMode [aria-pressed=true]')).color, swOnBg: cs(document.querySelector('#stopsMode [aria-pressed=true]')).backgroundColor }; });
  const aa = { read: ratio(cols.read, cols.sheetBg), small: ratio(cols.small, cols.sheetBg), on: ratio(cols.on, cols.band), unit: ratio(cols.unit, cols.band), sw: ratio(cols.sw, cols.swBg), swOn: ratio(cols.swOn, cols.swOnBg) };
  ok(Object.values(aa).every(r => r >= 4.5), 'contrast AA in the sheet: the readout and its units, the value in the band, the units, the switch', aa);
  await p.click('#stopsMode [data-rmode=distance]'); await frames(p, 3); const dtree = await p.locator('#howDistP').ariaSnapshot();
  ok(/spinbutton "Distance"/.test(dtree) && /spinbutton "Average speed"/.test(dtree) && !/option/.test(dtree) && !/listbox/.test(dtree), 'DECISIONS: the Distance pane too: spinbuttons "Distance" / "Average speed" for screen readers (no listbox of options)', dtree);
  await o.close();
});

/* ---------------------------------------------------------------- 390 px screenshots (motion on: the drum as a rider sees it) */
section('shots', async () => {
  const o = await page({ motion: true }); const p = o.p;
  await p.screenshot({ path: path.join(SHOTS, 'q93-ticket-time-390.png') });
  await openHow(p); await sleep(500); await p.screenshot({ path: path.join(SHOTS, 'q93-wheel-time-390.png') });
  await p.click('#stopsMode [data-rmode=distance]'); await sleep(500); await keys(p, 'whlD', ['1', '0', '0']); await keys(p, 'whlS', ['1', '8']); await sleep(500); await p.evaluate(() => document.activeElement.blur());
  await p.screenshot({ path: path.join(SHOTS, 'q93-wheel-distance-390.png') });
  await done(p); await sleep(300); await p.screenshot({ path: path.join(SHOTS, 'q93-ticket-distance-390.png') });
  ok(['q93-ticket-time-390.png', 'q93-wheel-time-390.png', 'q93-wheel-distance-390.png', 'q93-ticket-distance-390.png'].every(f => fs.existsSync(path.join(SHOTS, f))), '390 px screenshots saved (ticket, wheel sheet in Time and Distance)', SHOTS);
  await o.close();
});

for (const [n, f] of sections) { if (ONLY.length && !ONLY.includes(n)) continue; try { await f(); } catch (e) { ok(false, n + ': threw', String(e && e.stack || e).slice(0, 500)); } }
ok(ERRS.every(e => e.length === 0), 'no page or console errors', ERRS.filter(e => e.length).map(e => [e.label, ...e.slice(0, 3)]));
await browser.close();
C.done('q93 Ride ticket: tap the number, spin the wheel');
