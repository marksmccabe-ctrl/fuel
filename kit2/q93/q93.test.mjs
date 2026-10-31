// node q93.test.mjs <null.html> [main null.html]   (cd into this folder first) -- item 93: Ride ticket: tap the number, spin the wheel.
// Every numbered point and QA line of QUEUE.md item 93 and every point of DECISIONS.md "Item 93":
//   ticket   no Duration button (#howBtn, #howL gone; the sport chip alone on the top row), #tkBig is the button that opens How long
//            (aria-haspopup=dialog, the accessible name "How long: 5:00 hours. Change" / "How long: 100 mi · 18 mph, about 5 h 33 m. Change"),
//            press .97, the gradient (first stop #10759D), AA on it, the keyboard (Enter opens, Escape closes, focus comes back)
//   sheet    top to bottom: Cancel · How long · Done, the full-width Time | Distance switch (item 85 pill), the live readout, the wheels;
//            the band (fixed, 44 px, radius 11, --tint-blue), the 236 px white box (1.5 px border, radius 18), 44 px rows, 70 px fades,
//            23 px tabular type (centre ink 700, the rest grey 500), units in the band in the body text colour, the drum (rotateX, scale,
//            opacity, hidden past 3.2 rows, perspective 420 px), ranges
//   live     the value, aria-valuenow / valuetext, the readout and the Done value change the moment a row crosses the centre (no scrollend)
//   keys     each wheel a spinbutton (named, min / max / now / text): Up / Right +1, Down / Left -1, Page Up / Down +-4, Home, End,
//            digits; a tap on a row goes to it; the rows are aria-hidden with a named contrast exemption
//   haptic   one tick per step (vibrate(6) and the hidden switch: checkbox[switch] + label, off screen, aria-hidden, tabindex -1), at most
//            one per 28 ms, focus stays on the wheel, the tick also under Reduce Motion
//   done     Done applies (time; distance + speed + about), Cancel changes nothing, the saved data shapes
//   motion   Reduce Motion: no tilt and no smooth scrolls, the opacity steps; motion on: smooth key moves with the value at its goal at once
//   drag     WHEEL_DRAG = false in the page; a copy with it true: the pointer-driven wheel (live value, coast, snap, rubber band, tap, keys)
//   run, metric   the run Distance + Pace wheels ("/mi"), km / km/h
//   plan     the same plan for the same duration: plan numbers (lastResult), the saved plan and the Results text against main's page for
//            4:15, 2:00, 0:45, 7:30 and 100 mi at 18 mph (needs [main null.html])
//   small    390 px, and 320 px at 200% text: no sideways scroll, nothing cut, the wheels stack when a pair cannot sit side by side, 44 px
//   a11y     the accessibility tree (VoiceOver reads the big number as "How long: ..., Change"; each wheel a spinbutton), focus ring, AA
//   shots    390 px screenshots: the ticket (time and distance) and the wheel sheet (Time and Distance), into ../../q93shots
// Q93_ONLY=<sections, comma-separated> runs a part. About 2 minutes.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { open, checker } from '../lib/open.mjs';

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
// haptics observed: navigator.vibrate counted (the Android path), the hidden switch flips counted (the iPhone path)
async function hxSpy(p) { await p.evaluate(() => { window.__vib = []; window.__sw = 0; Object.defineProperty(Navigator.prototype, 'vibrate', { configurable: true, value: function (ms) { window.__vib.push([performance.now(), ms]); return true; } });
  document.addEventListener('change', e => { if (e.target && e.target.id === 'hxSwitch') window.__sw++; }, true); }); }
const hx = p => p.evaluate(() => ({ vib: window.__vib.length, ms: window.__vib.map(v => v[1]), sw: window.__sw }));
const isOpen = p => p.$eval('#planSheet', m => m.classList.contains('open'));
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
// a reload that keeps this page's data (lib/open.mjs can seed localStorage again on about 1 reload in 15: the kept keys go back after it)
const KEEPS = new WeakSet();
async function reload(p) { const ctx = p.context();
  if (!KEEPS.has(ctx)) { KEEPS.add(ctx); await ctx.addInitScript(() => { try { const k = localStorage.getItem('__q93_keep'); if (k) { const o = JSON.parse(k); Object.keys(o).forEach(n => { if (o[n] == null) localStorage.removeItem(n); else localStorage.setItem(n, o[n]); }); localStorage.removeItem('__q93_keep'); } } catch (e) {} }); }
  await p.evaluate(() => { const o = {}; ['bluebird.settings.v2', 'bluebird.library.v5', 'bluebird.lastPlan.v1'].forEach(n => { o[n] = localStorage.getItem(n); }); localStorage.setItem('__q93_keep', JSON.stringify(o)); });
  await p.reload(); await p.waitForLoadState('load'); await sleep(600); }

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
  const o = await page({ motion: true }); const p = o.p; await openHow(p); await sleep(450);
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
      fade: [getComputedStyle(col, '::before').height, getComputedStyle(col, '::before').backgroundImage, getComputedStyle(col, '::after').height, getComputedStyle(col, '::after').backgroundImage],
      onMid: Math.round((on.getBoundingClientRect().top + on.getBoundingClientRect().height / 2 - (Bd.top + Bd.height / 2)) * 10) / 10, persp: cs(col).perspective,
      vis: Math.round((B.height - 3) / 44 * 10) / 10 }; });
  ok(W.h === 236 && W.bw === 'var(--ol) solid var(--chip-line) / --ol 1.5px' && W.br === '18px' && W.bg === 'rgb(255, 255, 255)', 'point 4: a 236 px white box, 1.5 px border (as declared: this Chromium draws whole pixels), radius 18', W);
  ok(W.bandH === 44 && W.bandR === '11px' && W.bandBg === 'rgb(230, 241, 246)' && Math.abs(W.bandMid) <= .5 && W.bandSpan.every(x => x >= 9 && x <= 10), 'point 4: one band (var(--tint-blue), 44 px, radius 11) across both wheels at the centre', W);
  ok(W.rowH.every(h => h === 44) && W.vis >= 5, 'point 4: rows 44 px, 5 visible', { vis: W.vis });
  ok(W.fade[0] === '70px' && W.fade[2] === '70px' && /rgb\(255, 255, 255\)/.test(W.fade[1]) && /rgb\(255, 255, 255\)/.test(W.fade[3]), 'point 4: the top and bottom 70 px fade into the panel colour', W.fade);
  ok(W.fs === '23px' && /tabular-nums/.test(W.fv) && W.onCol === 'rgb(13, 13, 13)' && W.onW === '700' && W.offCol === 'rgb(110, 110, 115)' && W.offW === '500', 'point 4: 23 px tabular; the centre row ink 700, the rest grey 500', W);
  ok(Math.abs(W.onMid) <= 1 && W.persp === '420px', 'point 4: the value sits in the band; perspective 420 px on each column', W);
  // the drum (motion on): rows by distance d from the centre
  const D = await p.evaluate(() => { const rows = [...document.querySelectorAll('#whlH .whl-i')], c = +document.querySelector('#whlH .whl-i.on').dataset.k;
    return rows.map((r, k) => { const m = /rotateX\((-?[\d.]+)deg\) scale\(([\d.]+)\)/.exec(r.style.transform) || []; return { d: k - c, rx: m[1] == null ? null : +m[1], sc: m[2] == null ? null : +m[2], o: +r.style.opacity, v: r.style.visibility || getComputedStyle(r).visibility }; }); });
  const at = d => D.find(x => x.d === d) || {}, drum = d => at(d).rx === -d * 19 && Math.abs(at(d).sc - (1 - Math.abs(d) * .04)) < 1e-9 && Math.abs(at(d).o - (1 - Math.abs(d) * .24)) < 1e-9;
  ok(D.filter(x => Math.abs(x.d) <= 3).length >= 6 && D.filter(x => Math.abs(x.d) <= 3).every(x => drum(x.d)),
    'point 4: the drum: rotateX(-d x 19 deg), scale(1 - |d| x .04), opacity 1 - |d| x .24', [at(-2), at(-1), at(0), at(1), at(2)]);
  ok(D.filter(x => Math.abs(x.d) > 3.2).every(x => x.v === 'hidden') && D.filter(x => Math.abs(x.d) <= 3).every(x => x.v !== 'hidden'), 'point 4: rows beyond 3.2 are hidden');
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
  const o = await page({ motion: true }); const p = o.p; await hxSpy(p); await openHow(p); await sleep(450);
  const R = await p.$eval('#whlH .whl-i', e => e.offsetHeight);
  const read = () => p.evaluate(() => ({ v: document.getElementById('whlH').dataset.v, now: document.getElementById('whlH').getAttribute('aria-valuenow'), read: document.getElementById('durRead').innerText.replace(/\s+/g, ' ').trim() }));
  // a native scroll that never stops: the value changes as a row crosses the centre (no snap, no scrollend)
  await p.$eval('#whlH', e => { e.style.scrollSnapType = 'none'; });
  await p.$eval('#whlH', (e, R) => { e.scrollTop = 2.45 * R; }, R); await frames(p, 2); const a = await read();
  await p.$eval('#whlH', (e, R) => { e.scrollTop = 2.55 * R; }, R); await frames(p, 2); const b = await read();
  await p.$eval('#whlH', (e, R) => { e.scrollTop = 3.7 * R; }, R); await frames(p, 2); const c = await read();
  ok(a.v === '2' && b.v === '3' && b.now === '3' && b.read === '3 h 30 min' && c.v === '4' && c.read === '4 h 30 min', 'point 4 / QA: the value, aria-valuenow and the readout change the moment a row crosses the centre (not after scrolling stops)', [a, b, c]);
  ok((await hx(p)).vib === 2, 'point 5: one tick per step while spinning', await hx(p));
  // Done takes the live value at once (still between rows)
  await p.$eval('#whlH', (e, R) => { e.scrollTop = 5.6 * R; }, R); await frames(p, 2); await p.click('#psAct'); await until(async () => !(await isOpen(p))); await frames(p, 2);
  ok((await ticket(p)).v === '6:30', 'point 4: the Done value follows immediately (Done mid-spin applies the row at the centre)', await ticket(p));
  // the haptic: vibrate(6) and the hidden switch, 28 ms apart at most once, focus kept
  await openHow(p); await sleep(450); await p.evaluate(() => { window.__vib = []; window.__sw = 0; });
  await keys(p, 'whlH', ['ArrowDown']); await sleep(300); await keys(p, 'whlH', ['ArrowDown']); await sleep(300);
  const h = await hx(p), sw = await p.evaluate(() => { const s = document.getElementById('hxSwitch'), l = document.querySelector('label[for=hxSwitch]'), cs = s && getComputedStyle(s); return s && { type: s.type, sw: s.hasAttribute('switch'), ti: s.tabIndex, ah: s.getAttribute('aria-hidden'), lah: l && l.getAttribute('aria-hidden'), off: s.getBoundingClientRect().right <= 0 && l.getBoundingClientRect().right <= 0, op: cs.opacity, pe: cs.pointerEvents, focus: document.activeElement.id }; });
  ok(h.vib === 2 && h.ms.every(m => m === 6) && h.sw === 2, 'point 5: each step ticks: navigator.vibrate(6) (Android) and the hidden switch flips (iPhone)', h);
  ok(sw && sw.type === 'checkbox' && sw.sw && sw.ti === -1 && sw.ah === 'true' && sw.lah === 'true' && sw.off && sw.op === '0' && sw.pe === 'none', 'point 5: the switch is an <input type=checkbox switch> with a <label>, both off screen, aria-hidden, tabindex -1', sw);
  ok(sw && sw.focus === 'whlH', 'DECISIONS: haptic() gives the focus back (the wheel keeps it)', sw);
  // at most one per 28 ms
  await p.evaluate(() => { window.__vib = []; }); await p.$eval('#whlH', (e, R) => { e.style.scrollSnapType = 'none'; e.scrollTop = 1 * R; }, R); await frames(p, 1);
  await p.$eval('#whlH', (e, R) => { e.scrollTop = 2 * R; }, R); await frames(p, 1); await p.$eval('#whlH', (e, R) => { e.scrollTop = 3 * R; }, R); await frames(p, 1);
  const quick = await p.evaluate(() => window.__vib.map(v => v[0])); const gaps = quick.slice(1).map((t, i) => t - quick[i]);
  ok(gaps.every(g => g >= 28) && quick.length >= 1, 'point 5: at most one tick per 28 ms', { n: quick.length, gaps });
  ok(SRC.includes("function haptic(){ const now=performance.now(); if(now-HX.last<28) return; HX.last=now;") && SRC.includes("try{ if(navigator.vibrate) navigator.vibrate(6); }catch(e){}") && SRC.includes("HX.sw.setAttribute('switch','')") && /HX\.lbl\.click\(\)/.test(SRC), 'point 5: haptic() is the demo function (vibrate(6), the switch trick, 28 ms)');
  // tap a row to go to it
  await p.$eval('#whlH', e => { e.style.scrollSnapType = ''; }); await whGo(p, 'whlH', 4); await p.click('#whlH .whl-i[data-k="6"]'); await sleep(700);
  ok((await wv(p, 'whlH')).v === '6' && await p.$eval('#whlH .whl-i.on', e => e.dataset.k) === '6', 'point 4: tap a row to go to it', await wv(p, 'whlH'));
  // the mouse wheel (a trackpad, a mouse): native scroll and snap
  const before = +(await wv(p, 'whlH')).v; const bx = await p.$eval('#whlH', e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.mouse.move(bx.x, bx.y); await p.mouse.wheel(0, R * 2); await sleep(900);
  const after = await p.evaluate(() => ({ v: document.getElementById('whlH').dataset.v, st: document.getElementById('whlH').scrollTop }));
  ok(+after.v === before + 2 && Math.abs(after.st - (before + 2) * R) <= 1, 'point 4: native scrolling (mouse wheel) moves the value and snaps to a row', { before, after });
  await o.close();
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
  await openHow(p, 'distance');
  const B = await p.evaluate(() => ['whlD', 'whlS'].map(id => { const e = document.getElementById(id); return { lab: document.getElementById(e.getAttribute('aria-labelledby')).textContent, min: e.getAttribute('aria-valuemin'), max: e.getAttribute('aria-valuemax'), n: e.querySelectorAll('.whl-i').length, u: e.parentElement.querySelector('.whl-u').textContent, first: e.querySelector('.whl-i').textContent, last: e.querySelector('.whl-i:last-child').textContent }; }));
  ok(B[0].lab === 'Distance' && B[1].lab === 'Average speed' && B[0].u === 'mi' && B[1].u === 'mph', 'point 4: Distance / Average speed wheels with "mi" / "mph" in the band', B);
  ok(B[0].min === '1' && B[0].max === '200' && B[0].n === 200 && B[1].min === '8' && B[1].max === '35' && B[1].n === 55 && B[1].first === '8' && B[1].last === '35', 'point 3: ranges: miles 1-200, speed 8-35 mph in 0.5 steps', B);
  await keys(p, 'whlD', ['1', '0', '0']); await keys(p, 'whlS', ['1', '7', '5']); const s1 = await wv(p, 'whlS'); await keys(p, 'whlS', ['ArrowUp']);
  ok((await wv(p, 'whlD')).now === '100' && s1.now === '17.5' && s1.text === '17.5 miles per hour' && (await wv(p, 'whlS')).now === '18', 'digits: 1 0 0 is 100 mi, 1 7 5 is 17.5 mph; Up is +0.5', [await wv(p, 'whlD'), s1]);
  ok(await txt(p, '#distRead') === '100 mi · 18 mph about 5 h 33 m', 'point 3: the readout "100 mi · 18 mph" with "about 5 h 33 m" under it', await txt(p, '#distRead'));
  ok(await p.$eval('#distRead .whl-sub', e => getComputedStyle(e).display === 'block'), 'point 3: "about ..." on its own line under it');
  await o.close();
});

/* ---------------------------------------------------------------- Done / Cancel, the ticket in distance, saved data (point 3, QA 4-5) */
section('done', async () => {
  const o = await page(); const p = o.p;
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
  await openHow(p, 'distance'); await keys(p, 'whlD', ['1', '0', '0']); await keys(p, 'whlS', ['1', '8']); await done(p);
  const e = await ticket(p), ep = await plan(), st = await p.evaluate(() => JSON.parse(localStorage.getItem('bluebird.settings.v2')));
  ok(e.v === '100' && e.u === 'mi · 18 mph' && e.s === 'about 5 h 33 m', 'QA: Done updates the ticket (distance + speed + about): "100" "mi · 18 mph" over "about 5 h 33 m"', e);
  ok(e.name === 'How long: 100 mi · 18 mph, about 5 h 33 m. Change', 'DECISIONS: distance: "How long: 100 mi · 18 mph, about 5 h 33 m. Change"', e.name);
  ok(ep.route.mode === 'distance' && ep.route.miles === 100 && ep.route.mph === 18 && ep.durMin === 333 && st.routeMode === 'distance', 'saved data as before: route {mode distance, miles 100, mph 18}, durMin 333, settings.routeMode', { route: ep.route, durMin: ep.durMin, rm: st.routeMode });
  await openHow(p); ok(await p.$eval('#stopsMode [aria-pressed=true]', b => b.dataset.rmode) === 'distance' && (await wv(p, 'whlD')).now === '100' && (await wv(p, 'whlS')).now === '18', 'QA: the sheet opens on the current mode (Distance, 100 mi at 18 mph)');
  await p.click('#stopsMode [data-rmode=time]'); await frames(p, 3); ok((await wv(p, 'whlH')).now === '5', 'flip to Time in the sheet: the hours wheel on the ride time');
  await cancel(p); ok((await ticket(p)).v === '100', 'Cancel after flipping the switch keeps Distance');
  // a reload keeps it all
  await reload(p); const r = await ticket(p);
  ok(r.v === '100' && r.s === 'about 5 h 33 m', 'after a reload the ticket shows the saved distance', r);
  await o.close();
});

/* ---------------------------------------------------------------- Reduce Motion and the motion (DECISIONS) */
section('motion', async () => {
  const o = await page(); const p = o.p; await hxSpy(p); await openHow(p);
  const rows = () => p.evaluate(() => { const c = +document.querySelector('#whlH .whl-i.on').dataset.k; return [...document.querySelectorAll('#whlH .whl-i')].map((r, k) => ({ d: k - c, t: r.style.transform, o: r.style.opacity, v: r.style.visibility })).filter(x => Math.abs(x.d) <= 3); });
  const R0 = await rows();
  ok(R0.every(x => x.t === '') && R0.every(x => Math.abs(+x.o - (1 - Math.abs(x.d) * .24)) < 1e-9), 'Reduce Motion: no drum tilt or scale; the opacity steps stay (1, .76, .52, .28)', R0);
  await p.$eval('#whlH', e => { e.style.scrollSnapType = 'none'; e.scrollTop = 2.4 * e.querySelector('.whl-i').offsetHeight; }); await frames(p, 2);
  const R1 = await rows(); ok(R1.every(x => x.t === '' && Math.abs(+x.o - (1 - Math.min(Math.abs(x.d), 3) * .24)) < 1e-9), 'Reduce Motion: between rows the opacity still steps by whole rows', R1);
  await p.$eval('#whlH', e => { e.style.scrollSnapType = ''; }); await whGo(p, 'whlH', 2); await p.evaluate(() => { window.__vib = []; });
  await p.focus('#whlH'); await p.keyboard.press('PageUp'); const st = await p.$eval('#whlH', e => e.scrollTop / e.querySelector('.whl-i').offsetHeight);
  ok(st === 6, 'Reduce Motion: no smooth scrolls (Page Up lands at once)', st);
  await frames(p, 2); ok((await hx(p)).vib >= 1, 'Reduce Motion keeps the haptic tick', await hx(p));
  await p.click('#whlH .whl-i[data-k="9"]'); ok(await p.$eval('#whlH', e => e.scrollTop / e.querySelector('.whl-i').offsetHeight) === 9, 'Reduce Motion: a tap on a row lands at once');
  ok(await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--t-base').trim()) === '0ms', 'Reduce Motion: the motion tokens are 0 ms (the switch pill does not fly)');
  await o.close();
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
  ok(+end.v >= +mid.v && end.y === -(+end.v * 44), 'point 6: let go, it coasts and snaps to a row (260 ms ease-out)', end);
  ok((await hx(p)).vib >= 2, 'point 6: the same tick per step in the drag wheel', await hx(p));
  // the rubber band at the top end
  await p.focus('#whlH'); await p.keyboard.press('Home'); await sleep(500);
  await p.mouse.move(bx.x, bx.y); await p.mouse.down(); await p.mouse.move(bx.x, bx.y + 100, { steps: 5 }); const rb = await val(); await p.mouse.up(); await sleep(600); const back = await val();
  ok(Math.abs(rb.y - 100 * .35) < .01 && back.y === 0 && back.v === '0', 'point 6: a rubber band at the ends (.35), then it springs back', { rb, back });
  // a tap on a row below the centre, and the keys
  await p.mouse.click(bx.x, bx.y + 88); await sleep(600); const tap = await val();
  ok(tap.v === '2', 'point 6: a tap on a row goes to it', tap);
  await p.keyboard.press('PageUp'); await sleep(600); ok((await val()).v === '6' && (await val()).y === -264, 'point 6: the keys move the drag wheel too', await val());
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
  await keys(p, 'whlD', ['1', '3', '1']); await keys(p, 'whlS', ['8', '3']); const rr = await txt(p, '#distRead');
  ok(rr === '13.1 mi · 8:30 /mi about 1 h 51 m', 'run: 1 3 1 is 13.1 mi, 8 3 is 8:30 /mi: "about 1 h 51 m"', rr);
  await done(p); const t = await ticket(p);
  ok(t.v === '13.1' && t.u === 'mi · 8:30 /mi' && t.s === 'about 1 h 51 m' && t.name === 'How long: 13.1 mi · 8:30 /mi, about 1 h 51 m. Change', 'run Done: the ticket "13.1" "mi · 8:30 /mi" over "about 1 h 51 m"', t);
  await o.close();
  const m = await page({ settings: { units: 'metric' } }); const q = m.p; await openHow(q, 'distance');
  const M = await q.evaluate(() => ['whlD', 'whlS'].map(id => { const e = document.getElementById(id); return { u: e.parentElement.querySelector('.whl-u').textContent, min: e.getAttribute('aria-valuemin'), max: e.getAttribute('aria-valuemax'), text: e.getAttribute('aria-valuetext') }; }));
  ok(M[0].u === 'km' && M[1].u === 'km/h' && M[0].min === '1' && M[0].max === '320' && M[1].min === '12' && M[1].max === '56' && / kilometers$/.test(M[0].text) && / kilometers per hour$/.test(M[1].text), 'point 3: metric: km 1-320 and km/h 12-56, "km" / "km/h" in the band', M);
  await keys(q, 'whlD', ['1', '6', '0']); await keys(q, 'whlS', ['2', '9']); ok(await txt(q, '#distRead') === '160 km · 29 km/h about 5 h 31 m', 'metric readout "160 km · 29 km/h" about 5 h 31 m', await txt(q, '#distRead'));
  await done(q); const k = await ticket(q); ok(k.v === '160' && k.u === 'km · 29 km/h' && /^about 5 h 3\d m$/.test(k.s), 'metric Done: the ticket in km', k);
  await m.close();
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
  const CASES = [['4:15', 4, 15], ['2:00', 2, 0], ['0:45', 0, 45], ['7:30', 7, 30], ['100 mi at 18 mph', 100, 18]];
  const mine = await page({ label: 'mine' }), main = await page({ file: MAIN, label: 'main' }); let prev = null;
  for (const [name, a, b] of CASES) {
    const dist = /mi/.test(name);
    // this branch: the real controls (tap the number, the wheels by keyboard, Done)
    await openHow(mine.p, dist ? 'distance' : 'time');
    if (dist) { await keys(mine.p, 'whlD', String(a).split('')); await keys(mine.p, 'whlS', String(b).split('')); }
    else { await keys(mine.p, 'whlH', ['Home', ...(a ? String(a).split('') : [])]); await keys(mine.p, 'whlM', ['Home', ...(b ? String(b).split('') : [])]); }
    await done(mine.p); await crunch(mine.p);
    // main: its own How long sheet (Duration button, its wheels)
    await main.p.click('#howBtn'); await until(() => isOpen(main.p)); await frames(main.p, 2);
    const cur = await main.p.$eval('#stopsMode [aria-pressed=true]', x => x.dataset.rmode); if (cur !== (dist ? 'distance' : 'time')) { await main.p.click('#stopsMode [data-rmode=' + (dist ? 'distance' : 'time') + ']'); await frames(main.p, 2); }
    /* main's wheels are listboxes: Home, then ArrowDown one item at a time (PageDown is 6) */
    const steps = n => [...Array(Math.floor(n / 6)).fill('PageDown'), ...Array(n % 6).fill('ArrowDown')];
    if (dist) { await keys(main.p, 'whlD', ['Home', ...steps(a - 1)]); await keys(main.p, 'whlS', ['Home', ...steps((b - 8) * 2)]); }
    else { await keys(main.p, 'whlH', ['Home', ...steps(a)]); await keys(main.p, 'whlM', ['Home', ...steps(b / 5)]); }
    const mv = await main.p.evaluate(() => ['whlH', 'whlM', 'whlD', 'whlS'].map(id => document.getElementById(id).dataset.v));
    ok(dist ? mv[2] === String(a) && mv[3] === String(b) : mv[0] === String(a) && mv[1] === String(b), 'plan ' + name + ': main set through its own wheels', mv);
    await main.p.click('#psAct'); await until(async () => !(await isOpen(main.p))); await frames(main.p, 2); await crunch(main.p);
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
section('small', async () => {
  for (const [w, s] of [[390, 1], [375, 1.5], [320, 1], [320, 1.5], [320, 2]]) {
    const o = await page({ width: w, height: 844, scale: s }); const p = o.p, tag = w + ' px at ' + s * 100 + '%';
    let f = await fitCheck(p, 'ticket'); ok(f.length === 0, tag + ': the ticket fits (no sideways scroll, nothing cut, 44 px)', f);
    await openHow(p); await sleep(200); const stT = await p.$eval('#whsT', e => e.classList.contains('stk')); f = await fitCheck(p, 'time');
    ok(f.length === 0, tag + ': How long (Time) fits: the wheels, the units in their boxes, no number into its unit, 44 px targets', { f, stacked: stT });
    if (w === 390 && s === 1) ok(!stT, '390 px: the two wheels side by side under one band');
    if (w === 320 && s === 2) { ok(stT, '320 px at 200%: the two wheels stack (each in its own box with its band)'); await p.screenshot({ path: path.join(SHOTS, 'q93-wheel-time-320-200.png') }); }
    await keys(p, 'whlH', ['End']); await keys(p, 'whlM', ['End']); ok(await txt(p, '#durRead') === '12 h 55 min', tag + ': the wheels still work (End, End: 12 h 55 min)', await txt(p, '#durRead'));
    await p.click('#stopsMode [data-rmode=distance]'); await frames(p, 3); f = await fitCheck(p, 'distance');
    ok(f.length === 0, tag + ': How long (Distance) fits', { f, stacked: await p.$eval('#whsD', e => e.classList.contains('stk')) });
    if (w === 320 && s === 2) await p.screenshot({ path: path.join(SHOTS, 'q93-wheel-distance-320-200.png') });
    await o.close();
  }
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
