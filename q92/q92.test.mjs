// node q92.test.mjs <null.html> [only]   (cd into this folder first) -- item 92: Deficit and weight.
// Every numbered point and QA line of QUEUE.md item 92 and DECISIONS.md "Item 92": the + New entry tiles, the Weigh-in sheet (keypad,
// range, pills, Time and Note, Delete), the Journal home Weight row and the Weight list, All entries (weigh-ins, the total pill, a deficit
// started and ended), the Profile weight (from the newest weigh-in; typed still works), Volume (the View row, the Deficit sheet, the card,
// the year chart: band, weight line, scale, dot, dotted goal line, legend, summary), metric (kg everywhere), sync through the Firebase
// stand-in (two devices, newest edit wins, tombstones, the older-build guard in the cloud and on the device), Back up / Restore, the two
// hard constraints (marker weights seeded: the troubleshooting copy, every AI prompt and every network request carry none; Crunch and
// Adjust identical with and without a deficit), Reduce Motion and the once-per-open entrance, 390 px screenshots, 320 px at 200%, AA
// contrast, names for screen readers and the keyboard. `only`: a comma-separated list of sections (journal, metric, volume, proofs, sync,
// backup, motion, small, a11y). About 3 minutes.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { open, checker, reload as kitReload } from '../lib/open.mjs';
import { Backend, syncPageSource } from '../q91/fbmock.mjs';

const PAGE = path.resolve(process.argv[2] || '../../fred92/null.html'), ONLY = (process.argv[3] || '').split(',').filter(Boolean);
const HERE = path.dirname(new URL(import.meta.url).pathname), SHOTS = process.env.Q92_SHOTS || path.resolve(HERE, '../../q92shots');
const REPO = process.env.Q92_REPO || path.resolve(HERE, '../../wt-q92'), NOW = '2026-10-15T07:00:00'; /* a Thursday: a reminder day */
const C = checker('q92 '), ok = C.ok, ALL_REQ = [], LOGS = new Set();
const SYNC = path.join(path.dirname(PAGE), 'q92-sync.html'); fs.writeFileSync(SYNC, syncPageSource(fs.readFileSync(PAGE, 'utf8')));
fs.mkdirSync(SHOTS, { recursive: true });
const SRC = fs.readFileSync(PAGE, 'utf8');
const browser = await chromium.launch();
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000, step = 150) { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); } catch (e) { v = null; } if (v) return v; await sleep(step); } return v; }

// a year of imported rides for account u1 (Volume needs training to show), an injury note, weigh-ins
const TRAIN = { uid: 'u1', workouts: [], files: [{ id: 'f1', name: 'tp.csv', kind: 'trainingpeaks', n: 0, at: 1 }], at: 1 };
for (let d = Date.UTC(2026, 0, 2); d < Date.UTC(2026, 9, 15); d += 2 * 864e5) TRAIN.workouts.push({ id: 'w' + d, date: new Date(d).toISOString().slice(0, 10), sport: 'bike', hours: 1 + (new Date(d).getUTCDate() % 3) * 0.5, meters: 30000, source: 'f1' });
const INJ = { id: 'n1', type: 'injury', title: 'Knee niggle', date: '2026-10-01', end: '2026-10-20', going: false, area: 'Knee', side: 'right', bad: 'minor', createdAt: 1790000000000, updatedAt: 1790000000000 };
const WI = (id, date, time, lb, when = '') => ({ id, date, time, lb, when, note: '', createdAt: Date.parse(date + 'T' + time + ':00Z'), updatedAt: Date.parse(date + 'T' + time + ':00Z') });
const MARK = [WI('m1', '2026-09-21', '06:40', 187.3), WI('m2', '2026-09-24', '06:45', 186.9, 'before'), WI('m3', '2026-10-12', '06:41', 185.7)];
const MARK_DEF = { deficits: [{ id: 'md1', start: '2026-09-21', weeks: 8, pace: 0.75, startLb: 187.3, goalLb: 181.3, createdAt: 1790000000000 }], weighDays: [1, 4] };
const MARKERS = ['187.3', '186.9', '185.7', '181.3', '84.96', '84.78', '84.23', '82.24'];

async function local(o = {}) { const rec = []; ALL_REQ.push(rec);
  return open(PAGE, Object.assign({ athlete: 'A', browser, now: NOW, repo: REPO }, o, { route: (q, u) => { rec.push({ page: 'local', url: u, method: q.request().method(), body: q.request().postDataBuffer() || Buffer.alloc(0) }); return null; } })); }
async function synced(be, o = {}) { if (!LOGS.has(be.log)) { LOGS.add(be.log); ALL_REQ.push(be.log); }
  const who = { uid: 'u1', email: 'u1@example.com', displayName: 'Test u1' };
  const storage = Object.assign({ '__mock_user': who, '__mock_auth': 'u1', 'bluebird.owner.v1': { uid: 'u1', name: who.displayName, email: who.email, photo: '', signedIn: true }, 'bluebird.training.v1': TRAIN }, o.storage || {});
  return open(SYNC, Object.assign({ athlete: 'A', browser, now: NOW, repo: REPO, settle: 1200 }, o, { storage, route: be.handler(o.label || 'a') })); }
const dialogs = p => { const seen = []; p.on('dialog', d => { seen.push(d.message()); d.accept(); }); return seen; };
const LS = (p, k) => p.evaluate(n => { try { return JSON.parse(localStorage.getItem(n)); } catch (e) { return null; } }, k);
const weights = p => LS(p, 'bluebird.weights.v1').then(v => v || []);
const sets = p => LS(p, 'bluebird.settings.v2').then(v => v || {});
const tab = async (p, v) => { await p.click('nav.tabs button[data-view=' + v + ']'); await p.waitForTimeout(350); };
async function journalHome(p) { await tab(p, 'journal'); if (await p.$eval('#jList', e => !e.hidden)) { await p.click('#jBack'); await p.waitForTimeout(300); } }
async function keys(p, s) { for (const k of s) await p.click(`#wghSheet [data-wgh-key="${k === 'D' ? 'del' : k}"]`); }
async function toastText(p) { return p.$eval('#toast', t => t.classList.contains('show') ? t.textContent : ''); }
// a weigh-in through the sheet: from the Journal (+ › Weigh-in) unless the sheet is already open
async function weighIn(p, { lb, date, time, when, note }) {
  if (!(await p.$eval('#wghSheet', m => m.classList.contains('open')).catch(() => false))) { await journalHome(p); await p.click('#jNoteAdd'); await p.waitForTimeout(400); await p.click('[data-jne="weigh"]'); await p.waitForTimeout(400); }
  if (date || time) { if (await p.$eval('#wghWhenEd', e => e.hidden)) await p.click('#wghWhen'); if (date) await p.fill('#wghDate', date); if (time) await p.fill('#wghTime', time); await p.$eval('#wghTime', e => e.dispatchEvent(new Event('change', { bubbles: true }))); }
  await keys(p, String(lb)); if (when != null) await p.selectOption('#wghWhenSel', when); if (note) await p.fill('#wghNote', note);
  await p.click('#wghSheet [data-wgh="save"]'); await p.waitForTimeout(400);
}
async function openDeficit(p) { await tab(p, 'volume'); await until(() => p.$('#volRoot [data-vol="dfc"]'), 8000); await p.click('#volRoot .vol-dfcrow'); await p.waitForTimeout(450); }
const sheetText = p => p.$eval('#volSheet .sheet', e => e.innerText.replace(/\s+/g, ' ').trim());
async function setStart(p, iso) { await p.fill('#dfcStart', iso); await p.$eval('#dfcStart', e => e.dispatchEvent(new Event('change', { bubbles: true }))); await p.waitForTimeout(250); }
// a reload that keeps this page's data: lib/open.mjs reload loads again while Chromium hands a file:// page a blank, throwaway localStorage
// (about 1 load in 8-15); realStore first, so edits made before a reload land in the real store (open's own first load can be a throwaway)
async function reload(p) { await kitReload(p); await p.waitForTimeout(900); }
const realStore = p => kitReload(p).then(() => p.waitForTimeout(900));
async function settle(pages, cond, ms = 40000) { const t = Date.now(); while (Date.now() - t < ms) { for (const pg of pages) await pg.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(1500); const v = await cond().catch(() => null); if (v) return v; } return null; }
async function crunch3h(p) { await tab(p, 'plan'); await p.evaluate(() => { const h = document.getElementById('durH'), m = document.getElementById('durM'); h.value = '3'; h.dispatchEvent(new Event('change', { bubbles: true })); m.value = '0'; m.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.click('#calcBtn'); await until(() => p.$eval('#results', r => getComputedStyle(r).display !== 'none' && r.innerText.length > 300), 8000); await p.waitForTimeout(500); }
const resultsText = p => p.$eval('#results', r => r.innerText.replace(/[ \t]+/g, ' ').trim());
async function clip(p) { await p.evaluate(() => { window.__clip = []; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t => { window.__clip.push(String(t)); return Promise.resolve(); } } }); }); }
const lum = c => { const m = c.match(/[\d.]+/g).map(Number), f = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
// the text colour of an element against the solid colour behind it (the nearest painted background; the card: its darkest gradient stop)
async function contrast(p, sel) { return p.$$eval(sel, es => es.filter(e => e.getClientRects().length && e.textContent.trim()).map(e => { const col = getComputedStyle(e).color; let n = e, bg = null;
  while (n && n.nodeType === 1) { const s = getComputedStyle(n); if (/gradient/.test(s.backgroundImage)) { const st = s.backgroundImage.match(/rgba?\([^)]+\)/g); bg = st[st.length - 1]; break; } if (s.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor)) { const a = s.backgroundColor.match(/[\d.]+/g); if (a.length < 4 || +a[3] > .9) { bg = s.backgroundColor; break; } } n = n.parentElement; }
  return { t: e.textContent.trim().slice(0, 30), col, bg: bg || 'rgb(255, 255, 255)' }; })).then(L => L.map(x => Object.assign(x, { r: Math.round(ratio(x.col, x.bg) * 100) / 100 }))); }
const sections = [], section = (n, f) => sections.push([n, f]);

/* ---------------------------------------------------------------- the Journal: points 1, 8–11 (lb) */
section('journal', async () => {
  const o = await local({ storage: { 'bluebird.notes.v1': [INJ] } }); const p = o.p, dl = dialogs(p);
  await journalHome(p);
  ok(!(await p.$$eval('#jGroups .jh-go', b => b.map(x => x.dataset.jhOpen))).includes('weight'), 'point 10: no Weight row while there are no weigh-ins');
  await p.click('#jNoteAdd'); await p.waitForTimeout(450);
  const tiles = await p.$$eval('#jneTiles .jne-t', b => b.map(x => { const r = x.getBoundingClientRect(); return { k: x.dataset.jne, t: x.textContent.trim(), w: r.width, h: r.height, x: Math.round(r.left), y: Math.round(r.top) }; }));
  ok(tiles.map(t => t.k).join() === 'ride,run,note,injury,sick,life,weigh,deficit' && tiles[6].t === 'Weigh-in' && tiles[7].t === 'Deficit', 'point 8: + New entry: Weigh-in and Deficit after Life event (8 tiles)', tiles.map(t => t.t));
  ok(new Set(tiles.map(t => t.x)).size === 3 && tiles[6].x === tiles[0].x && tiles[7].x === tiles[1].x && tiles[6].y > tiles[3].y && tiles.every(t => t.h >= 44 && t.w >= 44), 'point 8: in the same 3-column grid, 44 px targets', tiles);
  const ic = await p.evaluate(() => { const d = document.querySelector('[data-jne=deficit] svg rect'), w = document.querySelector('[data-jne=weigh] svg'); return { fill: d && d.getAttribute('fill'), rx: d && +d.getAttribute('rx'), arrow: !!document.querySelector('[data-jne=deficit] svg path'), scale: !!(w && w.querySelector('rect') && w.querySelectorAll('path').length === 2), wcol: getComputedStyle(document.querySelector('[data-jne=weigh] .jne-ic')).color }; });
  ok(ic.fill === '#BECC41' && ic.rx > 0 && ic.arrow && ic.scale, 'point 8: Deficit is a green rounded square with a down arrow; Weigh-in a scale line icon', ic);
  await p.screenshot({ path: path.join(SHOTS, 'q92-new-entry-390.png') });
  await p.click('[data-jne="weigh"]'); await p.waitForTimeout(450);
  const sh = await p.evaluate(() => { const m = document.getElementById('wghSheet'), q = s => m.querySelector(s), cs = e => getComputedStyle(e), ks = [...m.querySelectorAll('.wgh-k')];
    return { open: m.classList.contains('open'), lab: q('[role=dialog]').getAttribute('aria-labelledby'), top: [...q('.wgh-top').children].map(e => e.textContent.trim()), when: q('#wghWhen').textContent, num: q('#wghVal').textContent, ph: q('#wghVal').classList.contains('ph'), unit: q('#wghU').textContent,
      fs: cs(q('.wgh-num')).fontSize, fw: cs(q('.wgh-num')).fontWeight, ufs: cs(q('#wghU')).fontSize, ucol: cs(q('#wghU')).color, keys: ks.map(k => k.getAttribute('aria-label') || k.textContent), kh: ks.map(k => Math.round(k.getBoundingClientRect().height)), kbg: cs(ks[0]).backgroundColor, sbg: cs(q('.wgh-sheet')).backgroundColor,
      rows: [...m.querySelectorAll('.wgh-box .gr .gr-l')].map(e => e.textContent), opts: [...q('#wghWhenSel').options].map(x => x.textContent), del: !!q('.wgh-del').getClientRects().length, priv: q('.wgh-priv').textContent, lock: document.documentElement.classList.contains('jne-lock') }; });
  ok(sh.open && sh.lab === 'wghT' && sh.top.join('|') === 'Cancel|Weigh-in|Save', 'point 9: Cancel · Weigh-in · Save', sh.top);
  ok(sh.when === 'Today · 7:00 AM', 'point 9: Box 1 starts with "Today · 7:00 AM"', sh.when);
  ok(sh.fs === '56px' && sh.fw === '800' && sh.ufs === '20px' && sh.ucol === 'rgb(110, 110, 115)' && sh.unit === 'lb' && sh.ph, 'point 9: the number 56px/800 with its unit 20px grey (nothing to open on yet: a grey 0)', sh);
  ok(sh.rows.join('|') === 'Time|Note' && sh.opts.join('|') === 'Before ride|After ride|—', 'point 9: Box 2: Time (Before ride / After ride / —) and Note', sh);
  ok(sh.keys.join(' ') === '1 2 3 4 5 6 7 8 9 Decimal point 0 Delete the last digit' && sh.kh.every(h => h === 48) && sh.kbg === 'rgb(255, 255, 255)' && sh.sbg === 'rgb(242, 242, 247)', 'point 9: a keypad 1–9 . 0 ⌫: 48 px white keys on the grey sheet', sh);
  ok(!sh.del && /Never shared or sent to AI/.test(sh.priv) && sh.lock, 'point 9: no Delete row for a new weigh-in; private, never sent to AI; the page held', sh);
  await p.screenshot({ path: path.join(SHOTS, 'q92-weigh-in-sheet-390.png') });
  await keys(p, '49'); await p.click('#wghSheet [data-wgh="save"]'); await p.waitForTimeout(200); const t1 = await toastText(p);
  await keys(p, 'DD701'); await p.click('#wghSheet [data-wgh="save"]'); await p.waitForTimeout(200); const t2 = await toastText(p);
  ok(/50 to 700 lb/.test(t1) && /50 to 700 lb/.test(t2) && (await weights(p)).length === 0 && await p.$eval('#wghSheet', m => m.classList.contains('open')), 'point 9: valid range 50–700 lb (49 and 701 are refused)', [t1, t2]);
  await keys(p, 'DDD172.4.5'); ok(await p.$eval('#wghVal', e => e.textContent) === '172.4', 'point 9: one decimal at most', await p.$eval('#wghVal', e => e.textContent));
  await p.click('#wghWhen'); ok(await p.$eval('#wghWhenEd', e => !e.hidden) && await p.$eval('#wghWhen', b => b.getAttribute('aria-expanded')) === 'true', 'point 9: a tap on the day shows the date and time');
  await p.fill('#wghDate', '2026-10-12'); await p.fill('#wghTime', '06:42'); await p.$eval('#wghTime', e => e.dispatchEvent(new Event('change', { bubbles: true })));
  ok(await p.$eval('#wghWhen', e => e.textContent) === 'Mon, Oct 12 · 6:42 AM', 'point 9: the day and time change', await p.$eval('#wghWhen', e => e.textContent));
  await p.selectOption('#wghWhenSel', 'before'); await p.fill('#wghNote', 'after coffee'); await p.click('#wghSheet [data-wgh="save"]'); await p.waitForTimeout(450);
  let W = await weights(p), S = await sets(p);
  ok(W.length === 1 && Object.keys(W[0]).sort().join() === 'createdAt,date,id,lb,note,time,updatedAt,when' && W[0].lb === 172.4 && W[0].date === '2026-10-12' && W[0].time === '06:42' && W[0].when === 'before' && W[0].note === 'after coffee', 'point 1: KEYS.weights holds {id, date, time, lb, when, note, createdAt, updatedAt}', W);
  ok(S.weightLb === 172.4 && /^172\.4 lb · from weigh-in Oct 12$/.test(await p.$eval('#prowV-weight', e => e.textContent)), 'point 1: the newest weigh-in becomes the Profile weight; Settings › You says "172.4 lb · from weigh-in Oct 12"', [S.weightLb, await p.$eval('#prowV-weight', e => e.textContent)]);
  // a second one: opens on the last; the first key replaces it; the pill vs the one before it
  await p.click('#jNoteAdd'); await p.waitForTimeout(400); await p.click('[data-jne="weigh"]'); await p.waitForTimeout(400);
  ok(await p.$eval('#wghVal', e => e.textContent) === '172.4' && await p.$eval('#wghWhen', e => e.textContent) === 'Today · 7:00 AM', 'point 9: it opens prefilled with the last weigh-in');
  await keys(p, '1'); ok(await p.$eval('#wghVal', e => e.textContent) === '1', 'point 9: the first key press replaces it');
  await keys(p, '71.8'); const pills = await p.$$eval('#wghPills .wgh-pill', ps => ps.map(x => ({ t: x.textContent, c: x.className, col: getComputedStyle(x).color, bg: getComputedStyle(x).backgroundColor })));
  ok(pills.length === 1 && pills[0].t === '−0.6 since Mon' && /teal/.test(pills[0].c) && pills[0].col === 'rgb(20, 117, 116)', 'point 9: a teal pill "−0.6 since Mon" (vs the previous weigh-in); no deficit pill outside a deficit', pills);
  await p.click('#wghSheet [data-wgh="save"]'); await p.waitForTimeout(450);
  ok((await sets(p)).weightLb === 171.8 && /^171\.8 lb · from weigh-in Oct 15$/.test(await p.$eval('#prowV-weight', e => e.textContent)), 'point 1: a newer weigh-in moves the Profile weight', await p.$eval('#prowV-weight', e => e.textContent));
  // the home: Weight between Notes and Injuries & sickness, its value the latest
  const home = await p.$$eval('#jGroups .jh-go', b => b.map(x => [x.dataset.jhOpen, x.querySelector('.jh-n').textContent, x.querySelector('.jh-ic').className]));
  const ks = home.map(h => h[0]); ok(ks.indexOf('notes') >= 0 && ks.indexOf('weight') === ks.indexOf('notes') + 1 && ks.indexOf('inj') === ks.indexOf('weight') + 1 && home[ks.indexOf('weight')][1] === '171.8 lb', 'point 10: a Weight row (scale icon) between Notes and Injuries & sickness; its value the latest weigh-in', home);
  await p.screenshot({ path: path.join(SHOTS, 'q92-journal-home-390.png') });
  // the Weight list
  await p.click('[data-jh-open="weight"]'); await p.waitForTimeout(500);
  const wl = await p.evaluate(() => ({ t: document.getElementById('jListT').textContent, n: document.getElementById('journalCount').textContent, mon: [...document.querySelectorAll('#journalList .jmon-h')].map(h => h.textContent), rows: [...document.querySelectorAll('#journalList .jwr')].map(r => ({ tile: r.querySelector('.jl-tile').textContent, t: r.querySelector('.jw-t').textContent, s: (r.querySelector('.js-l2') || {}).textContent || '' })) }));
  ok(wl.t === 'Weight' && wl.n === '2' && wl.mon.join() === 'October' && wl.rows.length === 2 && wl.rows[0].tile === 'Thu15' && wl.rows[0].t === '171.8 lb' && wl.rows[0].s === '−0.6 since Mon' && wl.rows[1].tile === 'Mon12' && wl.rows[1].t === '172.4 lb' && wl.rows[1].s === 'before ride', 'point 10: the Weight list in month boxes: date tile · "171.8 lb" · "−0.6 since Mon" / "before ride"', wl);
  await p.screenshot({ path: path.join(SHOTS, 'q92-weight-list-390.png') });
  // tap a weigh-in: its sheet, with Delete
  await p.click('#journalList .jwr:nth-child(2) .jw-btn'); await p.waitForTimeout(400);
  ok(await p.$eval('#wghVal', e => e.textContent) === '172.4' && await p.$eval('#wghWhenSel', e => e.value) === 'before' && await p.$eval('#wghNote', e => e.value) === 'after coffee' && await p.$eval('#wghSheet .wgh-del', e => !!e.getClientRects().length), 'point 9: editing a weigh-in opens it with a Delete row');
  await p.click('#wghSheet [data-wgh="cancel"]'); await p.waitForTimeout(300);
  ok(!(await p.$eval('#wghSheet', m => m.classList.contains('open'))) && await p.evaluate(() => document.activeElement && document.activeElement.dataset.wghOpen != null), 'Cancel closes it and focus goes back to the row');
  // a deficit from the Journal: + › Deficit opens the Plan a deficit sheet
  await p.click('#jBack'); await p.waitForTimeout(300); await p.click('#jNoteAdd'); await p.waitForTimeout(400); await p.click('[data-jne="deficit"]'); await p.waitForTimeout(450);
  const ds = await sheetText(p); ok(/^Cancel Deficit Schedule Starts Mon, Oct 19 .*Weeks − 8 \+ Ends Sun, Dec 13/.test(ds), 'point 8: Deficit opens the Plan a deficit sheet (from next Monday, 8 weeks)', ds.slice(0, 120));
  await setStart(p, '2026-10-12'); await p.click('[data-vs="dfcsave"]'); await p.waitForTimeout(450); const t3 = await toastText(p);
  S = await sets(p); const D = (S.volume || {}).deficits || [];
  ok(D.length === 1 && D[0].start === '2026-10-12' && D[0].weeks === 8 && D[0].pace === 0.75 && D[0].startLb === 172.4 && D[0].goalLb === 166.4 && typeof D[0].createdAt === 'number' && !('endedAt' in D[0]) && /Deficit started/.test(t3), 'point 2: settings.volume.deficits [{id, start (a Monday), weeks, pace, startLb (latest weigh-in on or before the start), goalLb = startLb − pace × weeks, createdAt}]', D);
  ok(JSON.stringify(S.volume.weighDays) === '[1,4]', 'point 5: reminder days Mon · Thu by default (settings.volume.weighDays)', S.volume.weighDays);
  // All entries: weigh-ins among notes by date; the total pill; Deficit started
  await journalHome(p); await p.click('[data-jh-open="all"]'); await p.waitForTimeout(500);
  const all = await p.$$eval('#journalList li.jnr', L => L.map(li => ({ c: li.className, t: (li.querySelector('.jw-t, .jn-title') || {}).textContent, s: (li.querySelector('.js-l2, .jn-sum') || {}).textContent || '', pill: (li.querySelector('.jl-chip') || {}).textContent || '', pc: (li.querySelector('.jl-chip') || {}).className || '', tile: (li.querySelector('.jl-tile') || {}).textContent || '' })));
  ok(all.length === 4 && all[0].t === '171.8 lb' && all[0].pill === '−0.6 total' && /jw-tot/.test(all[0].pc) && all[1].t === '172.4 lb' && !all[1].pill && all[2].t === 'Deficit started' && all[2].tile === 'Mon12' && all[2].s === '8 weeks · −0.75 lb/wk · goal 166.4' && all[2].pill === 'Wk 1' && /jd-wk/.test(all[2].pc) && /nt-injury/.test(all[3].c), 'point 11: All entries: weigh-ins by date among the notes; the newest during a deficit has "−0.6 total"; "Deficit started" (8 weeks · −0.75 lb/wk · goal 166.4, Wk 1)', all);
  const chips = await contrast(p, '#journalList .jl-chip'); ok(chips.length >= 2 && chips.every(x => x.r >= 4.5), 'pills: AA', chips);
  // a deficit row opens its sheet; End deficit asks, then "Deficit ended" with its result
  await p.click('#journalList .jdr .jw-btn'); await p.waitForTimeout(450);
  ok(/^Cancel Deficit Save /.test(await sheetText(p)) && await p.$('#volSheet [data-vs="dfcend"]'), 'point 11: a tap on a deficit row opens its sheet (Save, End deficit)');
  await p.click('#volSheet [data-vs="dfcend"]'); await p.waitForTimeout(500);
  S = await sets(p); ok(dl.some(m => /End this deficit today/.test(m)) && S.volume.deficits[0].endedAt === '2026-10-15', 'point 5: End deficit asks, then sets endedAt to today', [dl, S.volume.deficits[0]]);
  const all2 = await p.$$eval('#journalList li.jdr', L => L.map(li => [li.querySelector('.jw-t').textContent, (li.querySelector('.jl-chip') || {}).textContent || '', li.querySelector('.jl-tile').textContent]));
  ok(all2.length === 2 && all2[0][0] === 'Deficit ended' && all2[0][1] === '−0.6 lb' && all2[0][2] === 'Thu15' && all2[1][0] === 'Deficit started', 'point 11: "Deficit ended" on its last day, its result in a pill ("−0.6 lb")', all2);
  ok(!(await p.$$eval('#journalList .jw-tot', x => x.length)), 'point 11: no total pill once the deficit is over');
  await p.screenshot({ path: path.join(SHOTS, 'q92-all-entries-390.png') });
  // typing a Profile weight still works and makes no weigh-in
  await p.$eval('#pWeight', e => { e.value = '180'; e.dispatchEvent(new Event('input', { bubbles: true })); }); await p.waitForTimeout(800); /* (typed: it saves half a second after the last key) */
  ok((await sets(p)).weightLb === 180 && (await weights(p)).length === 2 && await p.$eval('#prowV-weight', e => e.textContent) === '180 lb', 'point 1: typing a Profile weight still works and makes no weigh-in', await p.$eval('#prowV-weight', e => e.textContent));
  // Delete a weigh-in: it asks; everything updates (the list, the home row, the Profile weight goes to the newest left)
  await p.click('#journalList .jwr .jw-btn'); await p.waitForTimeout(400); await p.click('#wghSheet [data-wgh="delete"]'); await p.waitForTimeout(500);
  W = await weights(p); ok(dl.some(m => /Delete the weigh-in of 171\.8 lb/.test(m)) && W.length === 1 && W[0].lb === 172.4, 'QA: Delete a weigh-in asks first, then it is gone', dl);
  ok((await sets(p)).weightLb === 172.4 && /^172\.4 lb · from weigh-in Oct 12$/.test(await p.$eval('#prowV-weight', e => e.textContent)) && (await p.$$eval('#journalList .jwr', x => x.length)) === 1, 'QA: Delete a weigh-in: everything updates (the list, the Profile weight back to the newest left)');
  await journalHome(p); ok(await p.$eval('[data-jh-open="weight"] .jh-n', e => e.textContent) === '172.4 lb', 'QA: the home row follows');
  // the keyboard: digits, Backspace and Enter on the sheet; Escape closes it and focus goes back to the +
  await p.click('#jNoteAdd'); await p.waitForTimeout(400); await p.click('[data-jne="weigh"]'); await p.waitForTimeout(400);
  await p.keyboard.press('1'); await p.keyboard.press('7'); await p.keyboard.press('9'); await p.keyboard.press('Backspace'); await p.keyboard.press('3');
  const kv = await p.$eval('#wghVal', e => e.textContent); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok(kv === '173' && !(await p.$eval('#wghSheet', m => m.classList.contains('open'))) && await p.evaluate(() => document.activeElement && document.activeElement.id === 'jNoteAdd') && (await weights(p)).length === 1, 'keyboard: digits and Backspace type; Escape closes without saving; focus back on the +', kv);
  ok(o.errors.length === 0, 'journal: no errors', o.errors); await o.close();
});

/* ---------------------------------------------------------------- metric: kg everywhere */
section('metric', async () => {
  const be = new Backend(); const o = await synced(be, { settings: { units: 'metric', weightLb: 185.7, volume: MARK_DEF }, storage: { 'bluebird.weights.v1': MARK } }); const p = o.p;
  await journalHome(p); const home = await p.$eval('[data-jh-open="weight"] .jh-n', e => e.textContent);
  await p.click('[data-jh-open="weight"]'); await p.waitForTimeout(450); const rows = await p.$$eval('#journalList .jwr', L => L.map(r => r.querySelector('.jw-t').textContent + ' | ' + ((r.querySelector('.js-l2') || {}).textContent || '') + ' | ' + ((r.querySelector('.jl-chip') || {}).textContent || '')));
  await p.click('#journalList .jwr .jw-btn'); await p.waitForTimeout(400); const sv = await p.evaluate(() => document.getElementById('wghVal').textContent + ' ' + document.getElementById('wghU').textContent); await keys(p, '3'); await p.click('#wghSheet [data-wgh="save"]'); await p.waitForTimeout(300); const t = await toastText(p);
  await p.click('#wghSheet [data-wgh="cancel"]'); await p.waitForTimeout(300);
  ok(home === '84.2 kg' && rows[0] === '84.2 kg | −0.5 since Sep 24 | −0.7 total' && sv === '84.2 kg' && /25 to 320 kg/.test(t), 'QA: metric: the home row, the list, the total pill and the sheet in kg; 25–320 kg', { home, rows, sv, t });
  ok(await p.$eval('#prowV-weight', e => e.textContent) === '84.2 kg · from weigh-in Oct 12', 'Profile weight in kg shows one decimal', await p.$eval('#prowV-weight', e => e.textContent));
  await tab(p, 'volume'); await until(() => p.$('#volRoot [data-vb="deficit"]'), 8000);
  const card = await p.$eval('#volRoot [data-vb="deficit"]', e => e.innerText.replace(/\s+/g, ' ')); const ax = await p.$eval('#volWk svg', s => [...s.querySelectorAll('.vwk-ws')].map(x => x.textContent).join(','));
  ok(/84\.2 kg now −0\.7 kg so far 82\.2 goal · Nov 15/.test(card) && /plan −0\.34/.test(card) && ax === '85,82', 'QA: metric: the Volume card and the chart scale in kg', { card, ax });
  await p.click('#volRoot .dfc-edit'); await p.waitForTimeout(450); const s = await sheetText(p);
  ok(/0\.23 kg\/wk 0\.34 kg\/wk 0\.45 kg\/wk Start 85\.0 kg → Goal 82\.2 kg/.test(s), 'QA: metric: the deficit sheet in kg (paces 0.23 · 0.34 · 0.45 kg/wk)', s.slice(0, 220));
  ok(o.errors.length === 0, 'metric: no errors', o.errors); await o.close();
});

/* ---------------------------------------------------------------- Volume: points 4–7 and the QA lines */
section('volume', async () => {
  const be = new Backend(); const o = await synced(be, { storage: { 'bluebird.weights.v1': [WI('v0', '2026-10-01', '06:30', 176.0)], 'bluebird.notes.v1': [INJ] } }); const p = o.p, dl = dialogs(p);
  await tab(p, 'volume'); await until(() => p.$('#volRoot [data-vb="season"]'), 8000);
  const row0 = await p.$eval('#volRoot .vol-dfcrow', b => ({ t: b.textContent.trim(), add: b.classList.contains('vol-dfcadd'), col: getComputedStyle(b).color, after: b.previousElementSibling && b.previousElementSibling.classList.contains('vol-row') }));
  ok(row0.t === '+ Plan a deficit' && row0.add && row0.col === 'rgb(11, 115, 153)' && row0.after && !(await p.$('#volRoot [data-vb="deficit"]')), 'point 4: no deficit: a blue "+ Plan a deficit" row in View (under Mode / Off-season starts)', row0);
  await p.click('#volRoot .vol-dfcrow'); await p.waitForTimeout(450);
  let s = await sheetText(p);
  ok(/^Cancel Deficit Schedule Starts Mon, Oct 19 Weeks − 8 \+ Ends Sun, Dec 13 PACE 0\.5 lb\/wk 0\.75 lb\/wk 1 lb\/wk Now 176\.0 lb → Goal 170\.0 lb About −375 kcal\/day Ride fueling Stays full Weigh-in reminder Mon · Thu Mon Tue Wed Thu Fri Sat Sun /.test(s) && /fred sends no notifications\./.test(s) && !/End deficit|Delete deficit/.test(s), 'point 5: the sheet: Cancel · Deficit · Schedule; Starts (Mon) · Weeks − 8 + · Ends (Sun); PACE 0.5 · 0.75 · 1; Now → Goal; About −375 kcal/day; Ride fueling "Stays full"; reminder Mon · Thu; no notifications', s);
  const box = await p.evaluate(() => { const m = document.getElementById('volSheet'), pill = m.querySelector('.dfc-pill'), g = m.querySelector('.dfc-goal b'), inp = m.querySelector('#dfcStart');
    return { pillTag: pill.tagName, pillTab: pill.tabIndex, goal: getComputedStyle(g).color, bh: getComputedStyle(m.querySelector('.dfc-bh')).color, step: inp.step, minDay: new Date(inp.min + 'T12:00').getDay(), pressed: [...m.querySelectorAll('[data-vs="dfcpace"]')].map(b => b.getAttribute('aria-pressed')).join(), days: [...m.querySelectorAll('.dfc-day')].map(b => b.getAttribute('aria-label') + ':' + b.getAttribute('aria-pressed')).join() }; });
  ok(box.pillTag === 'SPAN' && box.pillTab < 0 && box.goal === 'rgb(95, 106, 18)' && box.step === '7' && box.minDay === 1 && box.pressed === 'false,true,false' && box.days === 'Monday:true,Tuesday:false,Wednesday:false,Thursday:true,Friday:false,Saturday:false,Sunday:false', 'point 5: "Stays full" is not tappable; the goal in var(--on-green); the picker steps by Mondays; 0.75 chosen; Mon · Thu', box);
  for (let i = 0; i < 9; i++) await p.click('[data-vs="dfcwdec"]'); const lo = await p.$eval('#dfcWkN', e => e.textContent);
  for (let i = 0; i < 20; i++) await p.click('[data-vs="dfcwinc"]'); const hi = await p.$eval('#dfcWkN', e => e.textContent); s = await sheetText(p);
  ok(lo === '1' && hi === '16' && /Ends Sun, Feb 7, 2027/.test(s) && /Goal 164\.0 lb/.test(s), 'point 5: Weeks 1–16 (the stepper stops there); Ends follows, a Sunday; the goal = start − pace × weeks', { lo, hi });
  for (let i = 0; i < 8; i++) await p.click('[data-vs="dfcwdec"]');
  await p.click('[data-vs="dfcpace"][data-v="0.5"]'); const k5 = await p.$eval('.dfc-kcal', e => e.textContent); await p.click('[data-vs="dfcpace"][data-v="1"]'); const k1 = await p.$eval('.dfc-kcal', e => e.textContent); await p.click('[data-vs="dfcpace"][data-v="0.75"]'); const k75 = await p.$eval('.dfc-kcal', e => e.textContent);
  ok(k5 === '−250 kcal/day' && k1 === '−500 kcal/day' && k75 === '−375 kcal/day', 'point 2: the calories = pace × 3500 / 7 to the nearest 25 (−250 · −375 · −500)', [k5, k75, k1]);
  await setStart(p, '2026-10-21'); ok(/Starts Mon, Oct 19/.test(await sheetText(p)), 'point 5: Mondays only (a Wednesday picked snaps to its Monday)');
  await p.screenshot({ path: path.join(SHOTS, 'q92-deficit-sheet-390.png') });
  await p.click('[data-vs="dfcsave"]'); await p.waitForTimeout(500); const t1 = await toastText(p);
  const row1 = await p.$eval('#volRoot .vol-dfcrow', b => b.textContent.trim());
  ok(row1 === 'Deficit · Starts Mon, Oct 19' && /Deficit starts Mon, Oct 19/.test(t1), 'QA: plan a deficit starting next Monday: the View row says "Deficit · Starts Mon, Oct 19"', [row1, t1]);
  ok(!(await p.$('#volRoot [data-vb="deficit"]')) && !(await p.$('#volWk .vwk-dfc')) && !/Deficit/.test(await p.$eval('#volWk .vwk-legend', e => e.textContent)) && !/deficit/.test(await p.$eval('#volWk .vwk-sum', e => e.textContent)), 'QA / point 6: a planned deficit shows nothing on Volume except the View row');
  await p.click('#volRoot .vol-dfcrow'); await p.waitForTimeout(450); s = await sheetText(p);
  ok(/^Cancel Deficit Save /.test(s) && /Delete deficit/.test(s) && !/End deficit/.test(s), 'point 5: editing: Save; a planned one can be deleted (it is not current: no End deficit)', s.slice(0, 40));
  await setStart(p, '2026-10-12'); await p.click('[data-vs="dfcsave"]'); await p.waitForTimeout(600);
  const order = await p.evaluate(() => [...document.querySelectorAll('#volRoot>[data-vb]')].map(e => e.dataset.vb).slice(0, 2).join());
  const row2 = await p.$eval('#volRoot .vol-dfcrow', b => ({ t: b.textContent.trim(), pill: (b.querySelector('.dfc-pill') || {}).textContent, pc: b.querySelector('.dfc-pill') && getComputedStyle(b.querySelector('.dfc-pill')).backgroundColor }));
  ok(order === 'deficit,season' && row2.pill === 'Week 1 of 8' && /^Deficit/.test(row2.t) && row2.pc === 'rgb(242, 244, 224)', 'QA: move the start to last Monday: the card appears above the season card; the row shows a green "Week 1 of 8"', { order, row2 });
  const st = await p.$eval('#volRoot [data-vb="deficit"]', c => { const cs = getComputedStyle(c), q = s => c.querySelector(s), bar = q('.dfc-bar'), fill = q('.dfc-fill'), mark = q('.dfc-mark'), w = bar.getBoundingClientRect().width;
    return { bg: cs.backgroundImage, col: cs.color, rad: cs.borderRadius, eye: q('.dfc-eye').innerText, edit: q('.dfc-edit').textContent.trim(), nums: [...c.querySelectorAll('.dfc-n')].map(n => n.innerText.replace(/\s+/g, ' ')), track: getComputedStyle(bar).backgroundColor, fillBg: getComputedStyle(fill).backgroundColor,
      fillPct: Math.round(fill.getBoundingClientRect().width / w * 1000) / 10, markPct: Math.round((mark.getBoundingClientRect().left + 2 - bar.getBoundingClientRect().left) / w * 1000) / 10, markBg: getComputedStyle(mark).backgroundColor, markEdge: getComputedStyle(mark).boxShadow, pace: q('.dfc-pace').innerText.replace(/\s+/g, ' '), weigh: !!q('.dfc-weigh'), wbg: q('.dfc-weigh') && getComputedStyle(q('.dfc-weigh')).backgroundColor }; });
  ok(st.bg === 'linear-gradient(155deg, rgb(210, 222, 98) 0%, rgb(190, 204, 65) 55%, rgb(151, 169, 43) 100%)' && st.col === 'rgb(44, 50, 8)' && st.rad === '20px', 'point 6: the card: the gradient (155°: #D2DE62 · #BECC41 · #97A92B), ink #2C3208, radius 20', st);
  ok(st.eye === 'DEFICIT · WEEK 1 OF 8' && st.edit === 'Edit ›' && st.nums.join(' | ') === '176.0 lb now | ±0 lb so far | 170.0 goal · Dec 6', 'point 6: "DEFICIT · WEEK 1 OF 8" and "Edit ›"; now · lb so far · the goal with its end date', st);
  ok(st.track === 'rgba(44, 50, 8, 0.16)' && st.fillBg === 'rgb(44, 50, 8)' && st.fillPct === 0 && Math.abs(st.markPct - 7.1) < 0.6 && st.markBg === 'rgb(255, 255, 255)' && /rgb\(44, 50, 8\) 0px 0px 0px 1px/.test(st.markEdge), 'point 6: the bar: track #2C3208 at 16%, fill = lost ÷ planned, the white mark (1 px ink edge) where the plan expects you today (4 of 56 days)', st);
  ok(st.pace === 'Pace after two days of weigh-ins plan −0.75' && st.weigh && st.wbg === 'rgba(255, 255, 255, 0.92)', 'point 6: the pace (none yet) and "plan −0.75"; on a reminder day with no weigh-in yet, a Weigh in button (white 92%)', st);
  const cc = await contrast(p, '#volRoot .dfc-card :is(.dfc-eye,.dfc-edit,.dfc-n b,.dfc-n span,.dfc-pace span)'); ok(cc.length >= 9 && cc.every(x => x.r >= 4.5), 'point 6: every word on the card AA even over its darkest stop', cc.map(x => x.t + ' ' + x.r));
  // three weigh-ins: two from the Journal, one from the card's Weigh in
  await weighIn(p, { lb: '175.4', date: '2026-10-13', time: '06:40' }); await weighIn(p, { lb: '175.0', date: '2026-10-14', time: '06:35', when: 'before' });
  await tab(p, 'volume'); await p.click('#volRoot .dfc-weigh'); await p.waitForTimeout(450);
  ok(await p.$eval('#wghSheet', m => m.classList.contains('open')) && await p.$eval('#wghWhen', e => e.textContent) === 'Today · 7:00 AM' && (await p.$$eval('#wghPills .wgh-pill', ps => ps.map(x => x.textContent))).join('|') === '±0 since Wed|Deficit wk 1', 'point 6: Weigh in opens the weigh-in sheet; during a deficit the green "Deficit wk 1" pill', await p.$$eval('#wghPills .wgh-pill', ps => ps.map(x => x.textContent)));
  await keys(p, '174.6'); const pl = await p.$$eval('#wghPills .wgh-pill', ps => ps.map(x => x.textContent + ':' + getComputedStyle(x).backgroundColor)); await p.click('#wghSheet [data-wgh="save"]'); await p.waitForTimeout(600);
  ok(pl.join('|') === '−0.4 since Wed:rgb(229, 244, 244)|Deficit wk 1:rgb(242, 244, 224)', 'point 9: the pills follow the number: teal "−0.4 since Wed", green "Deficit wk 1"', pl);
  const c2 = await p.$eval('#volRoot [data-vb="deficit"]', c => ({ nums: [...c.querySelectorAll('.dfc-n')].map(n => n.innerText.replace(/\s+/g, ' ')).join(' | '), pace: c.querySelector('.dfc-pace').innerText.replace(/\s+/g, ' '), weigh: !!c.querySelector('.dfc-weigh'), fill: Math.round(c.querySelector('.dfc-fill').getBoundingClientRect().width / c.querySelector('.dfc-bar').getBoundingClientRect().width * 1000) / 10, sr: c.querySelector('.sr').textContent }));
  ok(c2.nums === '174.6 lb now | −1.4 lb so far | 170.0 goal · Dec 6' && /^−2\.80 lb\/wk plan −0\.75$/.test(c2.pace) && Math.abs(c2.fill - 23.3) < 0.6 && !c2.weigh, 'QA: three weigh-ins: the card numbers and the pace (a straight line through the days, two decimals as the plan: −2.80) update; the fill 1.4 ÷ 6; Weigh in gone once weighed in', c2);
  ok((await sets(p)).weightLb === 174.6, 'QA: the Profile weight updates');
  ok(/Lost 1\.4 lb of 6\.0 lb planned; the plan expects 0\.4 lb by today\./.test(c2.sr), 'the bar has words for a screen reader', c2.sr);
  // the year chart
  const ch = await p.$eval('#volWk', w => { const s = w.querySelector('svg'), all = [...s.children], rects = [...s.querySelectorAll('.vwk-dfc')], line = s.querySelector('polyline.vwk-wl'), dot = s.querySelector('circle.vwk-wd'), gl = s.querySelector('line.vwk-goal'), gd = s.querySelector('circle.vwk-goal'), ws = [...s.querySelectorAll('text.vwk-ws')], inj = s.querySelector('.vwk-injury');
    return { done: rects.filter(r => r.getAttribute('fill') === '#E4EBB8').length, plan: rects.filter(r => r.getAttribute('fill') === 'url(#vwkHatch)').length, pat: !!s.querySelector('pattern#vwkHatch rect[fill="#F4F7E2"]') && !!s.querySelector('pattern#vwkHatch line[stroke="#D9E19A"]') && s.querySelector('pattern#vwkHatch').getAttribute('patternTransform'),
      under: inj ? all.indexOf(rects[rects.length - 1]) < all.indexOf(inj) : null, pts: line && line.getAttribute('points').split(' ').length, lw: line && [line.getAttribute('stroke'), line.getAttribute('stroke-width'), line.getAttribute('stroke-linejoin')].join(), dot: dot && [dot.getAttribute('r'), dot.getAttribute('fill'), dot.getAttribute('stroke')].join(),
      gl: gl && [gl.getAttribute('stroke'), gl.getAttribute('stroke-dasharray')].join(), gd: gd && [gd.getAttribute('r'), gd.getAttribute('fill'), gd.getAttribute('stroke')].join(), ws: ws.map(x => x.textContent + '@' + x.getAttribute('font-size') + x.getAttribute('fill') + x.getAttribute('text-anchor')).join(),
      legend: w.querySelector('.vwk-legend').innerText.replace(/\s+/g, ' '), ln: getComputedStyle(w.querySelector('.vwk-legend .k.ln')).backgroundColor, sum: w.querySelector('.vwk-sum').innerText.replace(/\s+/g, ' '), aria: s.getAttribute('aria-label') }; });
  ok(ch.done === 1 && ch.plan === 7 && ch.pat === 'rotate(45)' && ch.under === true, 'point 7: deficit weeks are a band: done solid #E4EBB8, planned hatched (#F4F7E2, #D9E19A stripes at 45°), drawn first (the injury band on top)', ch);
  ok(ch.pts === 2 && ch.lw === '#0D0D0D,1.8,round' && ch.dot === '3.4,#0D0D0D,#FFFFFF', 'point 7: the weight line: black 1.8 px, round joins, one point per week with weigh-ins (Oct 1 and the week of Oct 12); the last point a 3.4 px dot with a white ring', ch);
  ok(ch.gl === '#5F6A12,0.1 3.4' && ch.gd === '3.4,#FFFFFF,#5F6A12', 'point 7: while current, a dotted var(--on-green) line from the last point to the goal at the end week, ending in a hollow green dot', ch);
  ok(ch.ws === '177@8.5#6E6E73end,169@8.5#6E6E73end', 'point 7: its own scale on the right: the year min and max ± 1 lb (and the goal), labels top and bottom 8.5px grey', ch.ws);
  ok(/Injury Sick Life event Deficit Weight/.test(ch.legend) && ch.ln === 'rgb(13, 13, 13)' && /· 1 of 8 weeks deficit$/.test(ch.sum) && /1 of 8 weeks deficit; weekly weight 176\.0 lb to 175\.0 lb/.test(ch.aria), 'point 7: the legend adds Deficit and Weight (a line); the summary "· 1 of 8 weeks deficit"; the chart names both for a screen reader', ch);
  await p.$eval('#volWk', e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(200); await p.screenshot({ path: path.join(SHOTS, 'q92-year-chart-390.png') });
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(150); await p.screenshot({ path: path.join(SHOTS, 'q92-volume-card-390.png') });
  await p.click('#volWk [data-vol="wkprev"]'); await p.waitForTimeout(400);
  const y25 = await p.$eval('#volWk', w => ({ t: w.querySelector('.vwk-title').textContent, line: !!w.querySelector('.vwk-wl, .vwk-wd, .vwk-ws'), leg: w.querySelector('.vwk-legend').innerText }));
  ok(/^2025/.test(y25.t) && !y25.line && !/Weight|Deficit/.test(y25.leg), 'point 7: a year with no weigh-ins has no line and no right-hand scale', y25);
  await p.click('#volWk [data-vol="wknext"]'); await p.waitForTimeout(300);
  // the View box: Deficit row; End deficit from the card
  await p.$eval('#volView', e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(150); await p.screenshot({ path: path.join(SHOTS, 'q92-view-row-390.png') });
  await p.click('#volRoot .dfc-edit'); await p.waitForTimeout(450); await p.click('#volSheet [data-vs="dfcend"]'); await p.waitForTimeout(600);
  const end = await p.evaluate(() => ({ card: !!document.querySelector('#volRoot [data-vb="deficit"]'), row: document.querySelector('#volRoot .vol-dfcrow').textContent.trim(), sum: document.querySelector('#volWk .vwk-sum').innerText, band: [...document.querySelectorAll('#volWk .vwk-dfc')].map(r => r.getAttribute('fill')).join(), goal: !!document.querySelector('#volWk .vwk-goal') }));
  ok(dl.some(m => /End this deficit today/.test(m)) && !end.card && end.row === '+ Plan a deficit' && /· 1 week deficit$/.test(end.sum) && end.band === '#E4EBB8' && !end.goal, 'point 5: End deficit (it asks): the card goes, the past weeks stay as a solid band, "· 1 week deficit", no goal line', end);
  ok(o.errors.length === 0, 'volume: no errors', o.errors); await o.close();
});

/* ---------------------------------------------------------------- the hard constraints: never to any AI; ride fueling never changes */
section('proofs', async () => {
  const outs = [];
  for (const withW of [false, true]) {
    const be = new Backend(); const o = await synced(be, Object.assign({ label: withW ? 'with' : 'without' }, withW ? { settings: { weightLb: 185.7, volume: MARK_DEF }, storage: { 'bluebird.weights.v1': MARK } } : {})); const p = o.p;
    await p.waitForTimeout(1500); await crunch3h(p); const res = await resultsText(p);
    await p.click('#topAdjBtn'); await p.waitForTimeout(500); await p.click('#adjCarbDn'); await p.waitForTimeout(300); await p.click('#adjCarbDn'); await p.waitForTimeout(300);
    await p.selectOption('#tePw', await p.$eval('#tePw', s => s.options[s.options.length - 1].value)); await p.waitForTimeout(400); const adjT = await p.$eval('#adjCarbT', e => e.textContent);
    await p.keyboard.press('Escape'); await p.waitForTimeout(400); const res2 = await resultsText(p);
    await clip(p); await p.click('#dbgCopyBtn'); await p.waitForTimeout(300);
    for (const k of ['races', 'races-add', 'volume', 'volume-add']) await p.evaluate(kind => { const b = document.createElement('button'); b.dataset.aiCopy = kind; document.body.append(b); b.click(); b.remove(); }, k);
    await p.waitForTimeout(300); const copies = await p.evaluate(() => window.__clip.slice());
    const st = await p.evaluate(() => ({ w: (JSON.parse(localStorage.getItem('bluebird.weights.v1')) || []).length, d: ((JSON.parse(localStorage.getItem('bluebird.settings.v2')) || {}).volume || {}).deficits }));
    outs.push({ res, res2, adjT, copies, st, errors: o.errors.slice() }); await o.close();
  }
  const [A, B] = outs;
  ok(A.st.w === 0 && B.st.w === 3 && B.st.d && B.st.d.length === 1, 'the second page has the marker weigh-ins (187.3, 186.9, 185.7) and a current deficit (goal 181.3)', B.st);
  ok(A.res.length > 300 && A.res === B.res, 'hard constraint: Crunch a 3 h ride with and without the deficit: identical plan (every word of Results)', A.res === B.res ? A.res.length : [A.res.slice(0, 200), B.res.slice(0, 200)]);
  ok(A.res2 !== A.res && A.res2 === B.res2 && A.adjT === B.adjT, 'hard constraint: Adjust (carbs down twice, another drink mix) gives identical results with and without', [A.adjT, B.adjT]);
  const dbg = x => x.copies[0].replace(/fred · copy for troubleshooting · [^\n]*\n/, '').replace(/"when": "[^"]*"/, '').replace(/"(t|at)": "20\d\d-[^"]*"/g, '');
  ok(A.copies.length === 5 && B.copies.length === 5 && /Under the hood/.test(B.copies[0]), 'the troubleshooting copy and the four AI prompts were copied', B.copies.map(c => c.slice(0, 40)));
  ok(dbg(A) === dbg(B), 'hard constraint: the troubleshooting copy is the same with and without weigh-ins and a deficit', dbg(A).length);
  const hits = B.copies.flatMap((c, i) => MARKERS.filter(m => c.includes(m)).map(m => i + ':' + m)).concat(/weightLb|deficits|weighDays|"lb":/.test(B.copies[0]) ? ['dbg:word'] : []);
  ok(!hits.length, 'hard constraint: no weigh-in, Profile weight or deficit (lb or kg) in the troubleshooting copy or any AI prompt', hits);
  ok(B.copies.slice(1).every((c, i) => c === A.copies[i + 1]), 'hard constraint: every AI prompt is the same with and without');
  ok(!A.errors.length && !B.errors.length, 'proofs: no errors', A.errors.concat(B.errors));
});

/* ---------------------------------------------------------------- sync: two devices, newest edit wins, tombstones, the older-build guard */
section('sync', async () => {
  const be = new Backend(); const A = await synced(be, { label: 'A' }); const B = await synced(be, { label: 'B' }); const a = A.p, b = B.p; dialogs(a); dialogs(b);
  await a.waitForTimeout(1200); await weighIn(a, { lb: '178.2', date: '2026-10-14', time: '06:30' });
  await openDeficit(a); await setStart(a, '2026-10-12'); await a.click('[data-vs="dfcday"][data-v="5"]'); await a.click('[data-vs="dfcsave"]'); await a.waitForTimeout(500);
  const wid = (await weights(a))[0].id;
  const up = await until(() => { const w = be.fs.get('users/u1/weights/' + wid), d = be.fs.get('users/u1'); return w && d && d.settings && d.settings.volume && d.settings.volume.deficits && d.settings.volume.deficits.length === 1 ? { w, d: d.settings.volume } : null; }, 15000);
  ok(up && up.w.lb === 178.2 && up.w.schemaVersion === 1 && typeof up.w.updatedAt === 'number' && JSON.stringify(up.d.weighDays) === '[1,4,5]', 'point 1: a weigh-in syncs to users/{uid}/weights/{id}; the deficit and reminder days with the settings', up);
  const gotB = await settle([b], async () => { const w = await weights(b), s = await sets(b); return w.length === 1 && s.volume && s.volume.deficits && s.volume.deficits.length === 1 ? { w, s } : null; });
  ok(gotB && gotB.w[0].lb === 178.2 && gotB.s.weightLb === 178.2, 'sync: the second device gets the weigh-in, the deficit and the Profile weight', gotB && gotB.s.weightLb);
  await tab(b, 'volume'); ok(await until(() => b.$('#volRoot [data-vb="deficit"]'), 8000), 'sync: the second device shows the card');
  await journalHome(b); await b.click('[data-jh-open="weight"]'); await b.waitForTimeout(400); await b.click('#journalList .jwr .jw-btn'); await b.waitForTimeout(400); await keys(b, '178.0'); await b.click('#wghSheet [data-wgh="save"]'); await b.waitForTimeout(500);
  const gotA = await settle([a], async () => { const w = await weights(a); return w.length === 1 && w[0].lb === 178 ? w : null; });
  ok(gotA, 'sync: an edit on the second device reaches the first (the newest edit wins)', gotA);
  await journalHome(a); await a.click('[data-jh-open="weight"]'); await a.waitForTimeout(400); await a.click('#journalList .jwr .jw-btn'); await a.waitForTimeout(400); await a.click('#wghSheet [data-wgh="delete"]'); await a.waitForTimeout(500);
  const tomb = await until(() => { const w = be.fs.get('users/u1/weights/' + wid); return w && w.deleted ? w : null; }, 15000);
  const goneB = await settle([b], async () => (await weights(b)).length === 0 ? 1 : null);
  ok(tomb && goneB, 'sync: a delete is a tombstone in the cloud and reaches the other device', tomb);
  // an older build (no deficits key) writes the settings in the cloud, newer: the device keeps its deficits and puts them back up
  const doc = JSON.parse(JSON.stringify(be.fs.get('users/u1'))); delete doc.settings.volume.deficits; delete doc.settings.volume.weighDays; doc.settings.updatedAt = Date.now() + 120000; doc.settings.raceName = 'Old build'; be.fs.set('users/u1', doc);
  const kept = await settle([a], async () => { const s = await sets(a); return s.raceName === 'Old build' ? s : null; });
  ok(kept && kept.volume.deficits && kept.volume.deficits.length === 1 && JSON.stringify(kept.volume.weighDays) === '[1,4,5]', 'older-build guard (cloud): settings from a build before the deficits (no key) bring their own changes but keep this device deficits and reminder days', kept && kept.volume);
  const back = await until(() => { const d = be.fs.get('users/u1'); return d.settings.raceName === 'Old build' && d.settings.volume.deficits && d.settings.volume.deficits.length === 1 ? d.settings.volume : null; }, 15000);
  ok(back && JSON.stringify(back.weighDays) === '[1,4,5]', 'older-build guard (cloud): and they go back up', back);
  const bOk = await settle([b], async () => { const s = await sets(b); return s.raceName === 'Old build' && s.volume.deficits && s.volume.deficits.length === 1 ? 1 : null; });
  ok(bOk, 'older-build guard (cloud): the other new device keeps them too');
  // an older build saves the settings here (no deficits key): the next start brings them back from this device copy
  await realStore(a); { const doc2 = JSON.parse(JSON.stringify(be.fs.get('users/u1'))); delete doc2.settings.volume.deficits; delete doc2.settings.volume.weighDays; doc2.settings.updatedAt = Date.now() + 240000; be.fs.set('users/u1', doc2); } /* the cloud an older build's too: only this device copy can bring them back */
  await a.evaluate(() => { const s = JSON.parse(localStorage.getItem('bluebird.settings.v2')); delete s.volume.deficits; delete s.volume.weighDays; localStorage.setItem('bluebird.settings.v2', JSON.stringify(s)); });
  await reload(a); const s2 = await sets(a);
  ok(s2.volume && s2.volume.deficits && s2.volume.deficits.length === 1 && JSON.stringify(s2.volume.weighDays) === '[1,4,5]', 'older-build guard (device): settings an older build saved here without the deficits get them back at the next start', s2.volume);
  // a real delete of the deficit (the key stays, empty) is respected everywhere
  await openDeficit(a); await a.click('#volSheet [data-vs="dfcend"]'); await a.waitForTimeout(400); await a.click('#volRoot .vol-dfcrow'); await a.waitForTimeout(400);
  ok(/^Cancel Deficit Schedule/.test(await sheetText(a)), 'after End deficit, the row plans a new one'); await a.keyboard.press('Escape'); await a.waitForTimeout(200);
  ok(!A.errors.length && !B.errors.length, 'sync: no errors', A.errors.concat(B.errors)); await A.close(); await B.close();
  // Delete my account: the weigh-ins leave the cloud with everything else
  { const be2 = new Backend(); const D = await synced(be2, { label: 'D' }); const d = D.p; await d.waitForTimeout(1000); await weighIn(d, { lb: '180.0' });
    const upd = await until(() => [...be2.fs.keys()].filter(k => /^users\/u1\/weights\//.test(k)).length === 1 ? 1 : null, 15000);
    await d.click('nav.tabs button[data-view=plan]'); await d.evaluate(() => document.getElementById('syncDelete').click()); await d.waitForTimeout(400); await d.click('#syncDelGo');
    const gone = await until(() => be2.deletedUsers.includes('u1') && ![...be2.fs.keys()].some(k => k.startsWith('users/u1')) ? 1 : null, 20000);
    ok(upd && gone, 'Delete my account: the weigh-ins in users/{uid}/weights are deleted with the rest', [...be2.fs.keys()]);
    ok(!D.errors.length, 'delete: no errors', D.errors); await D.close(); }
  // without sync: only this device copy can bring them back
  const L = await local({ settings: { volume: MARK_DEF } }); await realStore(L.p);
  await L.p.evaluate(() => { const s = JSON.parse(localStorage.getItem('bluebird.settings.v2')); delete s.volume.deficits; delete s.volume.weighDays; s.raceName = 'Old build'; localStorage.setItem('bluebird.settings.v2', JSON.stringify(s)); });
  await reload(L.p); const s3 = await sets(L.p);
  ok(s3.raceName === 'Old build' && s3.volume.deficits && s3.volume.deficits[0].id === 'md1' && JSON.stringify(s3.volume.weighDays) === '[1,4]', 'older-build guard (device, no account): the deficits come back from this device copy at the next start', s3.volume);
  ok(!L.errors.length, 'mirror: no errors', L.errors); await L.close();
});

/* ---------------------------------------------------------------- Back up / Restore */
section('backup', async () => {
  const o = await local({ settings: { weightLb: 185.7, volume: MARK_DEF }, storage: { 'bluebird.weights.v1': MARK } }); const p = o.p; dialogs(p);
  const file = await p.evaluate(() => new Promise(res => { const a = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { HTMLAnchorElement.prototype.click = a; fetch(this.href).then(x => x.text()).then(res); }; document.getElementById('backupDownload').click(); }));
  const d = JSON.parse(file); ok(Array.isArray(d.weights) && d.weights.length === 3 && d.settings.volume.deficits.length === 1 && d.settings.weightLb === 185.7, 'point 1: Download a backup holds the weigh-ins and the deficits', { w: d.weights && d.weights.length });
  await o.close();
  const f = path.join(HERE, 'q92-backup.json'); fs.writeFileSync(f, file);
  const n = await local(); const q = n.p; const asked = dialogs(q); await q.setInputFiles('#backupFile', f); await q.waitForTimeout(700);
  const W = await weights(q), S = await sets(q);
  ok(asked.some(m => /3 weigh-ins are merged in/.test(m)) && W.length === 3 && S.volume.deficits.length === 1 && S.volume.deficits[0].id === 'md1' && S.weightLb === 185.7, 'QA: Back up / Restore keeps the weigh-ins and the deficits (the restore names the weigh-ins)', { asked, w: W.length });
  await journalHome(q); ok(await q.$eval('[data-jh-open="weight"] .jh-n', e => e.textContent) === '185.7 lb', 'restored: the Journal shows them');
  const old = JSON.parse(file); delete old.weights; delete old.settings.volume.deficits; delete old.settings.volume.weighDays; fs.writeFileSync(f, JSON.stringify(old)); await q.setInputFiles('#backupFile', f); await q.waitForTimeout(700);
  const S2 = await sets(q); ok(S2.volume.deficits && S2.volume.deficits.length === 1 && (await weights(q)).length === 3, 'an older backup (no deficits, no weigh-ins) keeps this device deficits and weigh-ins', S2.volume);
  fs.unlinkSync(f); ok(!n.errors.length, 'backup: no errors', n.errors); await n.close();
});

/* ---------------------------------------------------------------- motion: once per open, after the shared rules; Reduce Motion lands it */
section('motion', async () => {
  const be = new Backend(); const o = await synced(be, { motion: true, settings: { weightLb: 185.7, volume: MARK_DEF }, storage: { 'bluebird.weights.v1': MARK } }); const p = o.p;
  await p.click('nav.tabs button[data-view=volume]'); const seen = [];
  for (let i = 0; i < 160 && seen.filter(s => s).length < 30; i++) { seen.push(await p.evaluate(() => { const c = document.querySelector('#volRoot>[data-vb="deficit"]'), f = c && c.querySelector('.dfc-fill'); return c ? c.className + '|' + getComputedStyle(f).transform : ''; })); await sleep(25); }
  const sx = s => { const m = s.match(/matrix\(([-\d.e]+)/); return m ? +m[1] : 1; }, armed = seen.some(s => /ve-(arm|go)/.test(s) && sx(s) < 0.95), went = seen.some(s => /ve-go/.test(s));
  await p.waitForTimeout(900); const rest = await p.$eval('#volRoot>[data-vb="deficit"]', c => c.className + '|' + getComputedStyle(c.querySelector('.dfc-fill')).transform);
  ok(armed && went && rest === 'dfc-card|none', 'motion: the card plays the first time it is seen (Volume entrance: it rises, its bar fills from 0), then rests', { armed, went, rest });
  await tab(p, 'plan'); await p.click('nav.tabs button[data-view=volume]'); const again = []; for (let i = 0; i < 10; i++) { again.push(await p.$eval('#volRoot>[data-vb="deficit"]', c => c.className)); await sleep(40); }
  ok(again.every(c => c === 'dfc-card'), 'motion: once per app open (back on Volume nothing plays again)', again);
  await journalHome(p); await p.click('#jNoteAdd'); const pop = await p.$eval('#jNew', m => [m.classList.contains('jne-go'), [...m.querySelectorAll('.jne-t')].map(t => t.style.getPropertyValue('--ji')).join()]);
  ok(pop[0] && pop[1] === '0,1,2,3,4,5,6,7', 'motion: the eight tiles pop in order (item 90)', pop); await p.waitForTimeout(900);
  await p.click('[data-jne="weigh"]'); const rise = await p.$eval('#wghSheet', m => m.className); await p.waitForTimeout(700);
  ok(/sh-on|sh-run/.test(rise) && await p.$eval('#wghSheet', m => m.className) === 'modal wgh-modal open', 'motion: the weigh-in sheet rises (item 85), then rests', rise);
  ok(!o.errors.length, 'motion: no errors', o.errors); await o.close();
  const r = await synced(new Backend(), { settings: { weightLb: 185.7, volume: MARK_DEF }, storage: { 'bluebird.weights.v1': MARK } }); const q = r.p; /* Reduce Motion (the opener default) */
  await q.click('nav.tabs button[data-view=volume]'); const cl = []; for (let i = 0; i < 15; i++) { cl.push(await q.evaluate(() => { const c = document.querySelector('#volRoot>[data-vb="deficit"]'); return c ? c.className + '|' + getComputedStyle(c.querySelector('.dfc-fill')).transform + '|' + getComputedStyle(c).opacity : 'none'; })); await sleep(40); }
  ok(cl.filter(c => c !== 'none').every(c => c === 'dfc-card|none|1') && cl.some(c => c !== 'none'), 'Reduce Motion: the card and its bar land at once (nothing armed)', cl.slice(0, 4));
  await journalHome(q); await q.click('#jNoteAdd'); const g = await q.$eval('#jNew', m => m.classList.contains('jne-go')); await q.click('[data-jne="weigh"]'); const sh = await q.$eval('#wghSheet', m => m.className);
  ok(!g && sh === 'modal wgh-modal open', 'Reduce Motion: no pop, no rise', [g, sh]);
  ok(!r.errors.length, 'reduce: no errors', r.errors); await r.close();
});

/* ---------------------------------------------------------------- 320 px at 200%, 44 px targets, contrast */
section('small', async () => {
  const be = new Backend(); const o = await synced(be, { width: 320, height: 640, scale: 2, settings: { weightLb: 185.7, volume: MARK_DEF }, storage: { 'bluebird.weights.v1': MARK, 'bluebird.notes.v1': [INJ] } }); const p = o.p;
  const wide = async () => p.evaluate(() => { const H = document.documentElement; const over = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return e.getClientRects().length && r.width > 0 && r.right > H.clientWidth + 1 && !e.closest('.vy-scroll,.vol-tscroll,.vgr-scroll,.jh-ghost,.rt-grid,svg') && getComputedStyle(e).position !== 'fixed'; }).slice(0, 4).map(e => (e.id || e.className || e.tagName) + ':' + Math.round(e.getBoundingClientRect().right));
    return { sw: H.scrollWidth, cw: H.clientWidth, over }; });
  const targets = async sel => p.$$eval(sel, es => es.filter(e => e.getClientRects().length).map(e => { const r = e.getBoundingClientRect(); return [e.textContent.trim().slice(0, 12), Math.round(r.width), Math.round(r.height)]; }).filter(x => x[1] < 44 || x[2] < 44));
  await journalHome(p); let w = await wide(); ok(w.sw <= 320 && !w.over.length, '320 px at 200%: the Journal home (Weight row) fits', w);
  await p.click('#jNoteAdd'); await p.waitForTimeout(300); ok(!(await targets('#jneTiles .jne-t')).length, '320/200%: the tiles stay 44 px'); await p.click('[data-jne="weigh"]'); await p.waitForTimeout(300);
  w = await wide(); const sh = await p.$eval('#wghSheet .sheet', s => ({ sw: s.scrollWidth, cw: s.clientWidth, num: s.querySelector('.wgh-num').getBoundingClientRect().width, box: s.querySelector('.wgh-hero').getBoundingClientRect().width }));
  ok(w.sw <= 320 && sh.sw <= sh.cw && sh.num <= sh.box && !(await targets('#wghSheet :is(.wgh-k,.wgh-tb,.wgh-when)')).length, '320/200%: the weigh-in sheet fits (the number inside its box), its keys and buttons 44 px', { w, sh, t: await targets('#wghSheet :is(.wgh-k,.wgh-tb,.wgh-when)') });
  await p.screenshot({ path: path.join(SHOTS, 'q92-weigh-in-sheet-320-200.png') }); await p.click('#wghSheet [data-wgh="cancel"]'); await p.waitForTimeout(300);
  await p.click('[data-jh-open="all"]'); await p.waitForTimeout(400); w = await wide(); ok(w.sw <= 320 && !w.over.length, '320/200%: All entries with weigh-ins and the deficit row fit', w);
  await p.screenshot({ path: path.join(SHOTS, 'q92-all-entries-320-200.png') });
  await tab(p, 'volume'); await until(() => p.$('#volRoot [data-vb="deficit"]'), 8000); w = await wide();
  ok(w.sw <= 320 && !w.over.length && !(await targets('#volRoot :is(.dfc-edit,.dfc-weigh,.vol-dfcrow)')).length, '320/200%: the Volume card and the View row fit; Edit, Weigh in and the row 44 px', { w, t: await targets('#volRoot :is(.dfc-edit,.dfc-weigh,.vol-dfcrow)') });
  await p.screenshot({ path: path.join(SHOTS, 'q92-volume-card-320-200.png') });
  await p.click('#volRoot .dfc-edit'); await p.waitForTimeout(400); const ds = await p.$eval('#volSheet .sheet', s => ({ sw: s.scrollWidth, cw: s.clientWidth }));
  ok(ds.sw <= ds.cw && !(await targets('#volSheet :is(.dfc-day,.vs-step button,.vs-tb,[data-vs="dfcpace"],.dfc-end)')).length, '320/200%: the deficit sheet fits; days, steppers, pace and End deficit 44 px', { ds, t: await targets('#volSheet :is(.dfc-day,.vs-step button,.vs-tb,[data-vs="dfcpace"],.dfc-end)') });
  await p.screenshot({ path: path.join(SHOTS, 'q92-deficit-sheet-320-200.png') });
  const cs = await contrast(p, '#volSheet :is(.gr-l,.gr-v,.dfc-bh,.dfc-pill,.dfc-ng small,.dfc-ng b,.dfc-foot,.dfc-end,.dfc-day,[data-vs="dfcpace"],.vs-tb)');
  ok(cs.length > 15 && cs.every(x => x.r >= 4.5), 'contrast: every word in the deficit sheet AA', cs.filter(x => x.r < 4.5));
  ok(!o.errors.length, 'small: no errors', o.errors); await o.close();
  // 390 px: the weigh-in sheet words and the Volume words AA
  const l = await local({ storage: { 'bluebird.weights.v1': MARK } }); await journalHome(l.p); await l.p.click('#jNoteAdd'); await l.p.waitForTimeout(300); await l.p.click('[data-jne="weigh"]'); await l.p.waitForTimeout(300);
  const wc = await contrast(l.p, '#wghSheet :is(.wgh-tb,h2,.wgh-when,.wgh-v,.wgh-u,.wgh-pill,.gr-l,.gr-v,.wgh-k,.wgh-priv)'); ok(wc.length > 15 && wc.every(x => x.r >= 4.5), 'contrast: every word in the weigh-in sheet AA', wc.filter(x => x.r < 4.5));
  await l.close();
});

/* ---------------------------------------------------------------- screen readers and the keyboard */
section('a11y', async () => {
  const be = new Backend(); const o = await synced(be, { settings: { weightLb: 185.7, volume: MARK_DEF }, storage: { 'bluebird.weights.v1': MARK } }); const p = o.p;
  await journalHome(p); const row = await p.$eval('[data-jh-open="weight"]', b => b.innerText.replace(/\s+/g, ' '));
  await p.click('[data-jh-open="weight"]'); await p.waitForTimeout(400); const lr = await p.$eval('#journalList .jwr .jw-btn', b => { const c = b.cloneNode(true); c.querySelectorAll('[aria-hidden=true]').forEach(e => e.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); });
  ok(row === 'Weight 185.7 lb' && /^Mon, Oct 12, weigh-in: /.test(lr) && /185\.7 lb/.test(lr), 'screen reader: the Weight row reads "Weight 185.7 lb"; a weigh-in row says its day and that it is a weigh-in', { row, lr });
  await tab(p, 'volume'); await until(() => p.$('#volRoot [data-vb="deficit"]'), 8000);
  const card = await p.$eval('#volRoot [data-vb="deficit"]', c => ({ lab: c.getAttribute('aria-labelledby'), h: c.querySelector('h2').textContent, bar: c.querySelector('.dfc-bar').getAttribute('aria-hidden'), edit: c.querySelector('.dfc-edit').getAttribute('aria-haspopup') }));
  ok(card.lab === 'dfcCardH' && card.h === 'Deficit · week 4 of 8' && card.bar === 'true' && card.edit === 'dialog', 'screen reader: the card is a region named by its heading; the bar is words (sr), Edit opens a dialog', card);
  // the deficit sheet by keyboard: Edit, Tab to the days, Space on Friday, Save
  await p.focus('#volRoot .dfc-edit'); await p.keyboard.press('Enter'); await p.waitForTimeout(450);
  const sh = await p.evaluate(() => ({ role: document.getElementById('volSheet').getAttribute('role'), lab: document.getElementById('volSheet').getAttribute('aria-labelledby'), focus: document.activeElement && document.activeElement.id }));
  ok(sh.role === 'dialog' && sh.lab === 'volSheetTitle' && sh.focus === 'volSheetTitle', 'keyboard: Enter on Edit opens the sheet, focus on its title', sh);
  let n = 0; while (n++ < 40 && !(await p.evaluate(() => document.activeElement && document.activeElement.dataset.vs === 'dfcday' && document.activeElement.dataset.v === '5'))) await p.keyboard.press('Tab');
  await p.keyboard.press('Space'); await p.waitForTimeout(150); const fri = await p.evaluate(() => [document.activeElement.getAttribute('aria-label'), document.activeElement.getAttribute('aria-pressed')]);
  ok(n < 40 && fri.join() === 'Friday,true', 'keyboard: the reminder days are buttons reached by Tab; Space presses Friday (focus stays on it)', { n, fri });
  const pace = await p.$$eval('[data-vs="dfcpace"]', bs => bs.map(b => b.textContent + ':' + b.getAttribute('aria-pressed')));
  ok(pace.join() === '0.5 lb/wk:false,0.75 lb/wk:true,1 lb/wk:false', 'screen reader: the pace buttons name their unit and say which is chosen', pace);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.activeElement && document.activeElement.classList.contains('dfc-edit')) && JSON.stringify((await sets(p)).volume.weighDays) === '[1,4]', 'keyboard: Escape closes without saving, focus back on Edit');
  const v = await p.$eval('#volWk svg', s => s.getAttribute('aria-label')); ok(/4 of 8 weeks deficit; weekly weight 187\.1 lb to 185\.7 lb/.test(v), 'screen reader: the year chart names the deficit weeks and the weight', v);
  ok(!o.errors.length, 'a11y: no errors', o.errors); await o.close();
});

/* ---------------------------------------------------------------- run */
for (const [name, fn] of sections) {
  if (ONLY.length && !ONLY.includes(name)) continue;
  console.log('— ' + name); try { await fn(); } catch (e) { ok(false, name + ': threw', String(e && e.stack || e).slice(0, 600)); }
}
/* ---------------------------------------------------------------- every request: no weight to anyone but the account own Firestore; no AI; no push */
{
  const reqs = ALL_REQ.flat(), bad = [], fsw = [];
  const marked = s => MARKERS.filter(m => s.includes(m)).concat(/"lb":\s*1\d\d/.test(s) ? ['lb'] : []);
  for (const x of reqs) { const body = (x.body || Buffer.alloc(0)).toString('utf8'), s = decodeURIComponent(x.url) + ' ' + body, hit = marked(s);
    if (!hit.length) continue;
    if (x.url === 'https://firestore.googleapis.com/mock/commit') { let ops = []; try { ops = JSON.parse(body).ops || []; } catch (e) {} /* each document written: a weight only in the account own settings or weigh-ins */
      const off = ops.filter(o => marked(JSON.stringify(o.data || {})).length && !/^users\/u1(\/weights\/[^/]+)?$/.test(o.path)); if (!off.length) { fsw.push(x); continue; } bad.push('commit ' + off.map(o => o.path).join(';')); continue; }
    bad.push(x.method + ' ' + x.url.slice(0, 100) + ' ' + hit.join(',')); }
  const syncRun = !ONLY.length || ONLY.some(n => ['proofs', 'sync', 'metric', 'volume', 'motion', 'small', 'a11y'].includes(n));
  ok(reqs.length > (ONLY.length ? 0 : 100) && (!syncRun || fsw.length > 0), 'privacy: every request recorded (' + reqs.length + '); ' + fsw.length + ' carry weights, all to the account own Firestore (users/u1, users/u1/weights)');
  ok(!bad.length, 'hard constraint: no other request carries a weigh-in, the Profile weight or a deficit', bad.slice(0, 5));
  ok(!reqs.some(x => /anthropic|openai|claude\.ai|generativelanguage|aiplatform/i.test(x.url)), 'hard constraint: no request to any AI service');
  ok(!/Notification\.requestPermission|new Notification\(|showNotification|pushManager/i.test(SRC), 'fred has no push notifications (none added)');
  const names = [...SRC.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]), dup = [...new Set(names.filter((x, i) => names.indexOf(x) !== i))].sort(), mine = names.filter(x => /^(wgh|dfc)/.test(x));
  ok(dup.join() === 'currentAgBand,pick,raceAgBand,render' && mine.length >= 40 && new Set(mine).size === mine.length, 'function names: every new one (wgh…, dfc…) unique; no new duplicate in index.html (the four older inner duplicates only)', { dup, mine: mine.length });
}
await browser.close();
C.done('q92 Deficit and weight');
