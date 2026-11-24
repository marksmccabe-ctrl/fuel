// node q101.test.mjs <null.html> [main null.html]   (cd into this folder first) -- item 101: Holidays and the birthday look.
// Every numbered point, QA line and decision (DECISIONS.md "Item 101", Build):
//   cache    sw.js CACHE = APP_BUILD, v125 or later; fred world v9 or later (FW.HOLIDAYS names every id the item uses)
//   dates    101.1, QA: every day 2026-2031 at 0:00, 12:00, 15:00, 16:00 and 23:00 (local), the look holAt gives is the one this file works
//            out on its own (each holiday on its days and not the day before or after; Hanukkah from 16:00 the evening before its first day
//            through its eighth day; Easter Saturday and Sunday by a second Computus, Gauss's in Lichtenberg's form; the nth weekdays by a
//            walk over the month; the five-year table's rows (the research rows both checks confirmed); the Tour from its announced dates,
//            else the first Saturday of July to the Sunday 22 days later); the same with Cultural and religious holidays off; Easter
//            1900-2200 against the second Computus; the nth-weekday holidays 2032-2040; the table runs through HOL_THRU with two Eids,
//            one Lunar New Year, Diwali and Hanukkah in every year, and at least 12 months of it are left (today's real date)
//   overlap  101.2, QA: every day 2026-2031 with two holidays (or Hanukkah's eve on a holiday) listed here, each resolved by the order
//            (care > other; inside a tier the shorter span, then FW.HOLIDAYS order), and some of them on the screen
//   order    101.2: care holidays > birthday > the rider's race day > KOM Kitty (item 102's slot: a stand-in Kitty through the hook sits
//            between the race day and the other holidays, under Holiday looks) > other holidays > the weather look; Memorial Day weekend
//            (Saturday to Monday) never shows a race look; on the screen: the weekend's Saturday with a race (the weather look), Monday
//            (Memorial Day), the Friday before (race day), Halloween with a birthday and a race (the birthday), with a race (race day),
//            Diwali with a birthday (Diwali), the Tour in its colours
//   birthday 101.4: settings.birthday's month and day; Feb 29 on Feb 28 in other years and on Feb 29 in a leap year (not Mar 1, not Feb 28
//            then); nothing when empty; a birthday set or cleared in Profile with the page open: the look follows
//   raceday  a race in Races dated today: race day; one tomorrow: none; a restored backup with a race today, the page open: race day
//   looks    101.3: wherever fred appears (the box, the weather card, the run's box and card): fred wears the look (his drawing is FW.bird
//            of the holiday's wear, and the Tour's colours), keyed per look (wx:hol:<id>), the sky still the forecast's (data-sky and its
//            layer), the cap's place with no forecast, still on a clear night (wx:hol:<id>:n); fred at most once on screen
//   line     101.5: the line names the day ("Happy Diwali", "Eid Mubarak", "Memorial Day": no "Happy"), real text in the accessibility
//            tree inside the box's region, never inside the art (aria-hidden) and never as art; the box's other text is item 100's line
//   midnight 101.3 (the date decision): the look changes at midnight with the app open (no reload, no tap), at 16:00 for Hanukkah's eve,
//            and when the app comes back to the front on a new day; fred is drawn again only when the look changes (the same svg kept
//            otherwise)
//   switch   101.6: Settings › fred world › "Holiday looks" and "Cultural and religious holidays", after item 100's two rows, on, 44 px; not
//            stored nor in DEFAULT_SETTINGS until tapped; Holiday looks off: no holiday, birthday or race look; Cultural and religious off:
//            no Hanukkah, Diwali, Lunar New Year or Eid, Memorial Day stays; a reload keeps them
//   sync     QA: two devices (q91's Firebase stand-in): each switch reaches the other as its own key with its own stamp, and the look follows
//   backup   a backup carries the switches; one without them keeps this device's; one with them off turns them off
//   media    print: the art hidden, the line kept (the box the line's and the day's line's height and its padding); forced colours: the art
//            hidden, the box's edge kept, the line shown in the system's text colour
//   fit      320 / 375 / 390 px at 150% and 200% text: item 100's fit rules still hold for its line (inside, beside fred clear of him, no
//            word over two rows, no row beside him empty or short, no row starting with a dot) and the day's line is inside the box,
//            its rows beside fred clear of him, no word over two rows, nothing cut, no sideways scroll; WebKit at 320 px / 200%; the card
//            (where fred shows): the line under him, inside the card, above the tiles; where he does not (item 98's cut), no line
//   theme    the run's graphite: the line light on the panel (4.5:1 or more on #34343C), with the feather other words have
//   motion   round rule a: fred moves when first seen in a look, is still by 9.5 s, and moves again only when the look changes (at
//            midnight); at most 30 running fred world animations with the busiest looks; still under Reduce Motion and with Animate the
//            world off (the New Year's champagne too)
//   desk     the computer layout: the look in the box (1280 x 800), and on the card beside the plan after Crunch (1440 x 900), one fred
//   main     (with [main null.html]) main has no holiday rows and no look; item 100's page (Q101_PREV, default ../../fred100/null.html) too
// Q101_ONLY=section,section runs some sections.
import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit } from 'playwright';
import { checker, open, reload } from '../lib/open.mjs';
import { crunch, settle, tab, weatherRouteFor } from '../lib/screens.mjs';
import { Backend, syncPageSource } from '../q91/fbmock.mjs';

const PAGE = path.resolve(process.argv[2] || '../../fred101/null.html'), MAIN = process.argv[3] ? path.resolve(process.argv[3]) : null;
const ONLY = (process.env.Q101_ONLY || '').split(',').filter(Boolean);
const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = process.env.Q101_REPO || path.resolve(HERE, '../../wt-q101');
const PREV = process.env.Q101_PREV === undefined ? path.resolve(HERE, '../../fred100/null.html') : process.env.Q101_PREV;
const C = checker('q101 '), ok = C.ok, ERRS = [];
const SRC = fs.readFileSync(PAGE, 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000, step = 100) { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); } catch (e) { v = null; } if (v) return v; await sleep(step); } return v; }
const browser = await chromium.launch();

// the hooked copy: some of the app's own state handed out (as q97-q100 do), and item 102's Kitty slot replaceable (the order section)
const HOOK = "\nObject.defineProperty(window,'__q101',{configurable:true,get(){ return {FWM, holAt, holSpans, holEaster, holNth, HOL_TABLE, HOL_THRU, HOL_EVE, HOL_LINE, HOL_FAITH, backupData, DEFAULT_SETTINGS, KEYS, get settings(){ return settings; }, set kitty(f){ holKitty=f; }}; }});\n";
function hooked(page, name) { const src = fs.readFileSync(page, 'utf8'), k = src.indexOf("\n'use strict';\n"); if (k < 0) throw new Error("no 'use strict' line in " + page);
  const f = path.join(path.dirname(page), name), at = k + "\n'use strict';".length; fs.writeFileSync(f, src.slice(0, at) + HOOK + src.slice(at)); return f; }
const HOOKED = hooked(PAGE, 'q101-hook.html'), MADE = [HOOKED];
const SYNCED = (() => { const g = HOOKED.replace(/\.html$/, '-sync.html'); fs.writeFileSync(g, syncPageSource(fs.readFileSync(HOOKED, 'utf8'))); MADE.push(g); return g; })();

const WX = weatherRouteFor();
/* a local time in Los Angeles (open()'s zone) as an instant: day d at h:mi there, daylight saving or not */
const LA = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
function at(d, h = 10, mi = 0) { const [y, m, dd] = d.split('-').map(Number), W = Date.UTC(y, m - 1, dd, h, mi); let t = W;
  for (let i = 0; i < 3; i++) { const P = Object.fromEntries(LA.formatToParts(new Date(t)).map(x => [x.type, x.value])); t += W - Date.UTC(+P.year, +P.month - 1, +P.day, +P.hour, +P.minute); } return new Date(t).toISOString(); }
const openH = (now, o = {}) => open(o.file || HOOKED, Object.assign({ athlete: 'A', browser, motion: false, repo: REPO, now, settle: 800 }, o, {
  route: (r, u) => (o.route && o.route(r, u)) || (o.forecast === false ? null : WX(r, u)) })).then(x => { if (!o.noErrs) ERRS.push(x.errors); x.p.on('dialog', d => d.accept()); return x; });
const J = v => JSON.stringify(v);
const race = (date, id = 'kq' + date.replace(/-/g, '')) => ({ id, date, name: 'Kit Crit', type: 'sprint', location: 'Carmel, IN', createdAt: date + 'T18:00:00.000Z', updatedAt: date + 'T18:00:00.000Z' });
const RACES = (...d) => ({ 'bluebird.races.v1': d.map(x => race(x)) });
// the line each look names (titles only, item 76; Memorial Day quiet), worked out here
const LINES = { 'new-year': 'Happy New Year', valentines: 'Happy Valentine’s Day', 'st-patricks': 'Happy St. Patrick’s Day', spring: 'Happy Easter', 'memorial-day': 'Memorial Day', 'july-4': 'Happy 4th of July',
  'labor-day': 'Happy Labor Day', halloween: 'Happy Halloween', thanksgiving: 'Happy Thanksgiving', winter: 'Happy holidays', hanukkah: 'Happy Hanukkah', diwali: 'Happy Diwali', 'lunar-new-year': 'Happy Lunar New Year',
  eid: 'Eid Mubarak', 'running-day': 'Global Running Day', 'bike-to-work': 'Bike to Work Day', tour: 'Tour de France', 'race-day': 'Race day', birthday: 'Happy birthday' };

// a fred spot as it stands (the box #planSky, the cards #rWeather and #runWx): its look, sky, fred's key and drawing (FW.bird of the look's
// wear and colours, or of the weather wear; ids aside), the line and where it sits
const spotOf = (p, id) => p.evaluate(id => { const W = document.getElementById(id), Q = window.__q101; if (!W) return null;
  const f = W.querySelector(':scope>.rwx-fred:not(.rwx-out)'), r = f && Q.FWM.get(f), g = W.querySelector(':scope>.rwx-g'), svg = f && f.querySelector('svg');
  const nm = s => String(s).replace(/\b(fw-[a-z]+)\d+/g, '$1#').replace(/\bid="[^"]*"/g, 'id').replace(/url\(#[^)]*\)/g, 'url(#)').replace(/href="#[^"]*"/g, 'href');
  const H = W.dataset.look ? FW.HOLIDAYS.flatMap(x => x[1]).find(h => h.id === W.dataset.look) : null;
  const want = H ? FW.bird(Object.assign({ wear: H.wear.slice(), champ: H.champ }, H.col || {})) : g && FW.WX_WEAR[g.dataset.fred] ? FW.bird({ wear: FW.WX_WEAR[g.dataset.fred] }) : null;
  const L = id === 'planSky' ? document.getElementById('planSkyH') : W.querySelector('.rwx-hol'), layer = W.querySelector(':scope>.rwx-scene>.rwx-layer:not(.rwx-out)');
  return { look: W.dataset.look || '', fred: g ? g.dataset.fred : null, wx: W.dataset.wx || null, sky: W.dataset.sky || null, gsky: g && g.dataset.sky || null, layer: layer ? layer.dataset.k || 'on' : null, key: r ? r.k : null, still: r ? r.s : null,
    same: !!svg && !!want && nm(f.innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: want }).innerHTML), drawn: !!svg && getComputedStyle(f).display !== 'none', on: !W.hidden && getComputedStyle(W).display !== 'none',
    line: L ? L.textContent : null, lineShown: !!L && getComputedStyle(L).display !== 'none' && L.getClientRects().length > 0, lineInArt: !!L && !!L.closest('.rwx-fred,[aria-hidden="true"]'), artHidden: !!svg && svg.getAttribute('aria-hidden') === 'true',
    artText: f ? f.textContent.trim() : '' }; }, id);
const boxReady = (p, wx = 'live') => until(() => p.evaluate(wx => { const W = document.getElementById('planSky'); return !!W && W.dataset.wx === wx && !!W.querySelector(':scope>.rwx-fred:not(.rwx-out) svg'); }, wx), 20000);
const lookIs = (p, id, look, ms = 15000) => until(async () => { const s = await spotOf(p, id); return s && s.look === look && s.drawn !== undefined && (look ? s.line === LINES[look] : s.line === null) && s; }, ms);
const freds = p => p.evaluate(() => [...document.querySelectorAll('.rwx-fred')].filter(f => !f.classList.contains('rwx-out') && f.getClientRects().length && f.querySelector('svg') && getComputedStyle(f).display !== 'none').map(f => f.parentElement.id));
async function toSettings(p) { await p.click('#syncHdrIn:visible, #syncHdr:visible, #sbAcct:visible'); await until(() => p.evaluate(() => document.getElementById('view-profile').classList.contains('active'))); await settle(p, 150); }
const swOf = p => p.evaluate(() => Object.fromEntries(['holidaylooks', 'holidaycare'].map(k => { const b = document.getElementById('prowBtn-' + k); return [k, b ? b.getAttribute('aria-pressed') + ' ' + (b.classList.contains('on') ? 'on' : 'off') : null]; })));
const shiftDays = (p, n) => p.evaluate(n => { const D = Date; globalThis.Date = class extends D { constructor(...a) { super(...(a.length ? a : [D.now() + n * 864e5])); } static now() { return D.now() + n * 864e5; } }; document.dispatchEvent(new Event('visibilitychange')); }, n);
const sheet = async (p, f) => { await p.click('#locRow'); await until(() => p.evaluate(() => document.getElementById('planSheet').classList.contains('open'))); await f(); await p.click('#psAct'); await until(() => p.evaluate(() => !document.getElementById('planSheet').classList.contains('open'))); };
const setField = async (p, sel, v) => { await p.fill(sel, v); await p.dispatchEvent(sel, 'change'); };
const sport = async (p, s) => { await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=' + s + ']'); await until(() => p.evaluate(s => document.documentElement.classList.contains('run-theme') === (s === 'run'), s)); await settle(p, 300); };

/* this file's own calendar: the research rows (probe101/dates-research.json; every row both checks confirmed, Nov 23-24 2026), a second
   Computus, the nth weekday by a walk over the month, the order */
const ROWS = { 'lunar-new-year': ['2026-02-17', '2027-02-06', '2028-01-26', '2029-02-13', '2030-02-03', '2031-01-23'], diwali: ['2026-11-08', '2027-10-28', '2028-10-17', '2029-11-05', '2030-10-25', '2031-11-13'],
  hanukkah: [['2026-12-05', '2026-12-12'], ['2027-12-25', '2028-01-01'], ['2028-12-13', '2028-12-20'], ['2029-12-02', '2029-12-09'], ['2030-12-21', '2030-12-28'], ['2031-12-10', '2031-12-17']],
  fitr: ['2026-03-20', '2027-03-09', '2028-02-26', '2029-02-14', '2030-02-04', '2031-01-24'], adha: ['2026-05-27', '2027-05-16', '2028-05-05', '2029-04-24', '2030-04-13', '2031-04-02'],
  easter: ['2026-04-05', '2027-03-28', '2028-04-16', '2029-04-01', '2030-04-21', '2031-04-13'], tour: { 2026: ['2026-07-04', '2026-07-26'], 2027: ['2027-07-02', '2027-07-25'], 2028: ['2028-06-24', '2028-07-16'] } };
const iso = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
const add = (s, n) => { const t = new Date(s + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const span = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
function nth(y, m, dow, n) { const L = []; for (let d = 1; d <= 31; d++) { const t = new Date(Date.UTC(y, m - 1, d)); if (t.getUTCMonth() !== m - 1) break; if (t.getUTCDay() === dow) L.push(t.toISOString().slice(0, 10)); } return n > 0 ? L[n - 1] : L[L.length - 1]; }
function gauss(y) { const K = Math.floor(y / 100), M = 15 + Math.floor((3 * K + 3) / 4) - Math.floor((8 * K + 13) / 25), S = 2 - Math.floor((3 * K + 3) / 4), A = y % 19, D = (19 * A + M) % 30, R = Math.floor((D + Math.floor(A / 11)) / 29), OG = 21 + D - R, SZ = 7 - (y + Math.floor(y / 4) + S) % 7, OE = 7 - (OG - SZ) % 7, OS = OG + OE; return OS > 31 ? iso(y, 4, OS - 31) : iso(y, 3, OS); }
function spans(y) { // every holiday that starts in year y: [id, first day, last day]
  const E = gauss(y), T = ROWS.tour[y] || [nth(y, 7, 6, 1), add(nth(y, 7, 6, 1), 22)], k = y - 2026, has = k >= 0 && k < 6, L = [
    ['new-year', iso(y, 12, 31), iso(y + 1, 1, 1)], ['valentines', iso(y, 2, 14)], ['st-patricks', iso(y, 3, 17)], ['spring', add(E, -1), E], ['memorial-day', nth(y, 5, 1, -1)], ['july-4', iso(y, 7, 4)],
    ['labor-day', nth(y, 9, 1, 1)], ['halloween', iso(y, 10, 31)], ['thanksgiving', nth(y, 11, 4, 4)], ['winter', iso(y, 12, 20), iso(y, 12, 26)], ['running-day', nth(y, 6, 3, 1)], ['bike-to-work', nth(y, 5, 5, 3)], ['tour', T[0], T[1]]];
  if (has) L.push(['lunar-new-year', ROWS['lunar-new-year'][k]], ['diwali', ROWS.diwali[k]], ['hanukkah', ROWS.hanukkah[k][0], ROWS.hanukkah[k][1]], ['eid', ROWS.fitr[k]], ['eid', ROWS.adha[k]]);
  return L.map(([id, a, b]) => ({ id, a, b: b || a })); }
const CARE = ['memorial-day', 'hanukkah', 'diwali', 'lunar-new-year', 'eid'], FAITH = ['hanukkah', 'diwali', 'lunar-new-year', 'eid'];
let ORDER = []; /* FW.HOLIDAYS' ids in order (read from the page) */
function onAt(d, h) { const y = +d.slice(0, 4), S = [...spans(y - 1), ...spans(y), ...spans(y + 1)], nx = add(d, 1); return S.filter(s => (s.a <= d && d <= s.b) || (s.id === 'hanukkah' && h >= 16 && s.a === nx)); }
function want(d, h, o = {}) { if (o.looks === false) return '';
  const on = onAt(d, h).filter(s => o.care !== false || !FAITH.includes(s.id)), by = (a, b) => span(a.a, a.b) - span(b.a, b.b) || ORDER.indexOf(a.id) - ORDER.indexOf(b.id);
  const c = on.filter(s => CARE.includes(s.id)).sort(by)[0]; if (c) return c.id;
  const bd = /^\d{4}-(\d{2}-\d{2})$/.exec(o.birthday || ''), md = d.slice(5), y = +d.slice(0, 4), leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  if (bd && (bd[1] === md || (bd[1] === '02-29' && md === '02-28' && !leap))) return 'birthday';
  const mem = nth(y, 5, 1, -1); if ((o.races || []).includes(d) && !(add(mem, -2) <= d && d <= mem)) return 'race-day';
  if (o.kitty) return 'kitty';
  const x = on.filter(s => !CARE.includes(s.id)).sort(by)[0]; return x ? x.id : ''; }
// every overlap 2026-2031 the table gives (two holidays on a day, or Hanukkah's eve on a holiday from 16:00), and the look the order gives
const OVERLAPS = [['2026-07-04', 'july-4+tour', 'july-4'], ['2027-07-04', 'july-4+tour', 'july-4'], ['2027-12-24', 'winter (Hanukkah from 16:00)', 'winter, hanukkah from 16:00'], ['2027-12-25', 'winter+hanukkah', 'hanukkah'], ['2027-12-26', 'winter+hanukkah', 'hanukkah'],
  ['2027-12-31', 'new-year+hanukkah', 'hanukkah'], ['2028-01-01', 'new-year+hanukkah', 'hanukkah'], ['2028-07-04', 'july-4+tour', 'july-4'], ['2028-12-20', 'winter+hanukkah', 'hanukkah'], ['2029-02-14', 'valentines+eid', 'eid'],
  ['2030-12-20', 'winter (Hanukkah from 16:00)', 'winter, hanukkah from 16:00'], ...['21', '22', '23', '24', '25', '26'].map(d => ['2030-12-' + d, 'winter+hanukkah', 'hanukkah'])];

const sections = [];
const section = (n, f) => sections.push([n, f]);

section('cache', async () => {
  const swf = fs.readFileSync(path.join(path.dirname(PAGE), 'sw.js'), 'utf8');
  const b = (SRC.match(/const APP_BUILD='([^']+)'/) || [])[1], c = (swf.match(/const CACHE = '([^']+)'/) || [])[1];
  ok(!!b && b === c && +(b.match(/v(\d+)$/) || [])[1] >= 125, 'cache: APP_BUILD = sw.js CACHE, v125 or later', { b, c });
  const ver = (/window\.FW = \{ version: '(\d+)'/.exec(SRC) || [])[1];
  ok(+ver >= 9, 'cache: fred world v9 or later (FW.version ' + ver + ')', ver);
});

section('dates', async () => {
  const x = await openH(at('2026-10-29'), { settle: 300 }), p = x.p;
  ORDER = await p.evaluate(() => FW.HOLIDAYS.flatMap(g => g[1]).map(h => h.id));
  ok(['new-year', 'valentines', 'st-patricks', 'spring', 'memorial-day', 'july-4', 'labor-day', 'halloween', 'thanksgiving', 'winter', 'hanukkah', 'diwali', 'lunar-new-year', 'eid', 'running-day', 'bike-to-work', 'tour', 'race-day', 'birthday'].every(i => ORDER.includes(i)) && ORDER.filter(i => /halloween/.test(i)).length === 1,
    '101.1: FW.HOLIDAYS names every id the item uses (one Halloween)', ORDER);
  // every day of the table's years, five times a day: the app's look is this file's
  const days = []; for (let d = '2026-01-01'; d <= '2031-12-31'; d = add(d, 1)) days.push(d);
  for (const [what, o] of [['both switches on', {}], ['Cultural and religious holidays off', { care: false }]]) {
    const got = await p.evaluate(([D, o]) => { const Q = window.__q101, out = []; for (const d of D) for (const h of [0, 12, 15, 16, 23]) { const [y, m, dd] = d.split('-').map(Number), L = Q.holAt(new Date(y, m - 1, dd, h, h === 23 ? 59 : 0), Object.assign({ looks: true, care: true }, o)); out.push(L ? L.id : ''); } return out; }, [days, o]);
    const bad = []; let k = 0; for (const d of days) for (const h of [0, 12, 15, 16, 23]) { const w = want(d, h, o); if (got[k++] !== w) bad.push(d + ' ' + h + ':00 ' + got[k - 1] + ' (want ' + (w || 'none') + ')'); }
    ok(!bad.length, '101.1, QA: every day 2026-2031 at 0:00, 12:00, 15:00, 16:00 and 23:59 (' + days.length * 5 + ' times), ' + what + ': the look is this file\'s (each holiday on its days and not the day before or after, Hanukkah from 16:00 its eve, the order)', bad.slice(0, 12));
  }
  // each holiday on its own: its first day, its last day, the day before and after, by holSpans (alone, without the order)
  const S = await p.evaluate(() => { const Q = window.__q101, L = []; for (let y = 2026; y <= 2031; y++) L.push(...Q.holSpans(y)); return L; });
  const mine = []; for (let y = 2026; y <= 2031; y++) mine.push(...spans(y));
  const key = s => s.id + ' ' + s.a + ' ' + s.b, A = S.map(key).sort(), B = mine.map(key).sort();
  ok(J(A) === J(B), '101.1, QA: holSpans 2026-2031 is this file\'s list: every holiday\'s first and last day (' + B.length + ' spans: the table\'s rows, the Computus, the nth weekdays, the Tour)', { app: A.filter(a => !B.includes(a)).slice(0, 8), mine: B.filter(b => !A.includes(b)).slice(0, 8) });
  // Hanukkah's eve: 15:59 no, 16:00 yes, the eighth day's 23:59 yes, the next day's 0:00 no
  const eve = await p.evaluate(R => R.map(([a, b]) => { const Q = window.__q101, f = (s, h, mi) => { const [y, m, d] = s.split('-').map(Number), L = Q.holAt(new Date(y, m - 1, d, h, mi), { looks: true, care: true }); return L ? L.id : ''; }, prev = s => { const t = new Date(s + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() - 1); return t.toISOString().slice(0, 10); }, next = s => { const t = new Date(s + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + 1); return t.toISOString().slice(0, 10); };
    return [f(prev(a), 15, 59), f(prev(a), 16, 0), f(b, 23, 59), f(next(b), 0, 0)]; }), ROWS.hanukkah);
  ok(eve.every(r => r[0] !== 'hanukkah' && r[1] === 'hanukkah' && r[2] === 'hanukkah' && r[3] !== 'hanukkah'), '101.1: Hanukkah from 16:00 the evening before its first day (not 15:59) through 23:59 on its eighth day (not the next day), every year', eve);
  ok(await p.evaluate(() => window.__q101.HOL_EVE) === 16, '101.1: the eve hour is 16:00 (HOL_EVE)');
  // the Computus over three centuries, the nth weekdays past the table
  const E = await p.evaluate(() => { const L = []; for (let y = 1900; y <= 2200; y++) L.push(window.__q101.holEaster(y)); return L; }), eb = [];
  for (let y = 1900; y <= 2200; y++) if (E[y - 1900] !== gauss(y)) eb.push(y + ' ' + E[y - 1900] + ' (' + gauss(y) + ')');
  ok(!eb.length && J(E.slice(126, 132)) === J(ROWS.easter), '101.1: Easter by the Computus: 1900-2200 as Gauss\'s (Lichtenberg), and the research rows 2026-2031 (US Naval Observatory, timeanddate)', eb.slice(0, 6));
  const N = await p.evaluate(() => { const L = []; for (let y = 2032; y <= 2040; y++) L.push(...window.__q101.holSpans(y).filter(s => ['memorial-day', 'labor-day', 'thanksgiving', 'running-day', 'bike-to-work', 'spring', 'tour'].includes(s.id)).map(s => s.id + ' ' + s.a + ' ' + s.b)); return L.sort(); });
  const NW = []; for (let y = 2032; y <= 2040; y++) NW.push(...spans(y).filter(s => ['memorial-day', 'labor-day', 'thanksgiving', 'running-day', 'bike-to-work', 'spring', 'tour'].includes(s.id)).map(key)); NW.sort();
  ok(J(N) === J(NW), '101.1: past the table (2032-2040): the last Monday in May, the first Monday in September, the fourth Thursday in November, the first Wednesday in June, the third Friday in May, Easter weekend, the Tour\'s usual weeks', { app: N.filter(a => !NW.includes(a)).slice(0, 6) });
  // the table: its rows, through HOL_THRU, and 12 months left from today (the real date)
  const T = await p.evaluate(() => ({ T: window.__q101.HOL_TABLE, thru: window.__q101.HOL_THRU }));
  const ly = +T.thru.slice(0, 4), yrs = []; for (let y = 2026; y <= ly; y++) yrs.push(y);
  const each = yrs.every(y => T.T['lunar-new-year'].filter(s => +s.slice(0, 4) === y).length === 1 && T.T.diwali.filter(s => +s.slice(0, 4) === y).length === 1 && T.T.hanukkah.filter(s => +s.slice(0, 4) === y).length === 1 && T.T.eid.filter(s => +s.slice(0, 4) === y).length === 2);
  const left = Math.floor((Date.parse(T.thru + 'T23:59:59') - Date.now()) / 864e5);
  ok(each && /^\d{4}-12-31$/.test(T.thru) && left >= 365, 'QA: the five-year table runs through ' + T.thru + ' (a Lunar New Year, a Diwali, a Hanukkah and both Eids in each year) and ' + left + ' days of it are left (12 months or more)', { thru: T.thru, each, left });
  ok(J(T.T['lunar-new-year']) === J(ROWS['lunar-new-year']) && J(T.T.diwali) === J(ROWS.diwali) && J(T.T.hanukkah) === J(ROWS.hanukkah.map(r => r[0])) && J(T.T.eid.slice().sort()) === J([...ROWS.fitr, ...ROWS.adha].sort()) && J(T.T.tour) === J(Object.values(ROWS.tour)),
    '101.1: the table is the research rows (Lunar New Year China time, Diwali the US date, Hanukkah\'s first day, Eid al-Fitr and al-Adha by Umm al-Qura, the Tour\'s announced dates)', T.T);
  await x.close();
});

section('overlap', async () => {
  if (!ORDER.length) { const x = await openH(at('2026-10-29'), { settle: 300 }); ORDER = await x.p.evaluate(() => FW.HOLIDAYS.flatMap(g => g[1]).map(h => h.id)); await x.close(); }
  const found = []; for (let d = '2026-01-01'; d <= '2031-12-31'; d = add(d, 1)) { const on = onAt(d, 12), eve = onAt(d, 16).length > on.length; if (on.length > 1 || (eve && on.length)) found.push(d); }
  ok(J(found) === J(OVERLAPS.map(r => r[0])), 'QA: every overlap 2026-2031 (' + found.length + ' days) is the list here: ' + OVERLAPS.map(r => r[0] + ' ' + r[1] + ': ' + r[2]).join('; '), found);
  const x = await openH(at('2026-10-29'), { settle: 300 }), p = x.p;
  const got = await p.evaluate(D => D.map(([d, h]) => { const [y, m, dd] = d.split('-').map(Number), L = window.__q101.holAt(new Date(y, m - 1, dd, h, 30), { looks: true, care: true }); return L ? L.id : ''; }), OVERLAPS.flatMap(([d]) => [[d, 12], [d, 16]]));
  const wantL = OVERLAPS.flatMap(([d, , r]) => /from 16:00/.test(r) ? [r.split(',')[0], 'hanukkah'] : [r, r]);
  ok(J(got) === J(wantL), '101.2, QA: each overlap resolved by the order, at 12:30 and 16:30 (care > other; the shorter span: the 4th of July over the Tour; Hanukkah over the winter holidays and New Year\'s, from 16:00 its eve; Eid over Valentine\'s Day)', { got, want: wantL });
  await x.close();
  // on the screen: the look in the box on some of those days
  for (const [d, h, look] of [['2026-07-04', 10, 'july-4'], ['2029-02-14', 10, 'eid'], ['2027-12-25', 10, 'hanukkah'], ['2030-12-20', 12, 'winter'], ['2030-12-20', 17, 'hanukkah']]) {
    const y = await openH(at(d, h), { query: '?sky=sun' }); await boxReady(y.p); const s = await lookIs(y.p, 'planSky', look, 8000) || await spotOf(y.p, 'planSky');
    ok(s.look === look && s.same && s.line === LINES[look], 'overlap on the screen: ' + d + ' ' + h + ':00, the box shows ' + look + ' (fred in its look, "' + LINES[look] + '")', s); await y.close(); }
});

section('order', async () => {
  const x = await openH(at('2026-10-29'), { settle: 300 }), p = x.p; if (!ORDER.length) ORDER = await p.evaluate(() => FW.HOLIDAYS.flatMap(g => g[1]).map(h => h.id));
  /* item 102's slot: a stand-in Kitty (any look) through the hook, between the race day and the other holidays, under Holiday looks */
  const K = await p.evaluate(() => { const Q = window.__q101; Q.kitty = () => ({ id: 'kitty', line: 'Kitty' }); const f = (d, o) => { const [y, m, dd] = d.split('-').map(Number), L = Q.holAt(new Date(y, m - 1, dd, 12), Object.assign({ looks: true, care: true }, o)); return L ? L.id : ''; };
    const r = [f('2026-10-31', {}), f('2026-11-12', {}), f('2026-11-08', {}), f('2026-10-31', { birthday: '1984-10-31' }), f('2026-10-30', { races: [{ date: '2026-10-30' }] }), f('2026-10-30', { looks: false }), f('2026-05-25', {})]; Q.kitty = () => null; return r; });
  ok(J(K) === J(['kitty', 'kitty', 'diwali', 'birthday', 'race-day', '', 'memorial-day']), '101.2: KOM Kitty\'s slot (item 102): a stand-in Kitty shows over Halloween and a plain day, under Diwali, the birthday, a race day and Memorial Day, and not with Holiday looks off', K);
  const cases = [['2026-11-08', { birthday: '1984-11-08' }], ['2026-05-25', { birthday: '1990-05-25', races: ['2026-05-25'] }], ['2026-10-31', { birthday: '1984-10-31' }], ['2026-10-31', { races: ['2026-10-31'] }], ['2026-10-31', { birthday: '1984-10-31', races: ['2026-10-31'] }],
    ['2026-07-04', { races: ['2026-07-04'] }], ['2026-05-23', { races: ['2026-05-23'] }], ['2026-05-24', { races: ['2026-05-24'] }], ['2026-05-25', { races: ['2026-05-25'] }], ['2026-05-22', { races: ['2026-05-22'] }], ['2026-05-26', { races: ['2026-05-26'] }],
    ['2026-05-23', { birthday: '1990-05-23', races: ['2026-05-23'] }], ['2027-05-29', { races: ['2027-05-29'] }], ['2027-05-30', { races: ['2027-05-30'] }], ['2027-05-31', { races: ['2027-05-31'] }], ['2027-05-28', { races: ['2027-05-28'] }], ['2026-11-12', { races: ['2026-11-13', '2026-11-11'] }], ['2026-12-25', { races: ['2026-12-25'] }]];
  const got = await p.evaluate(C => C.map(([d, o]) => { const [y, m, dd] = d.split('-').map(Number), L = window.__q101.holAt(new Date(y, m - 1, dd, 12), { looks: true, care: true, birthday: o.birthday || '', races: (o.races || []).map(date => ({ date })) }); return L ? L.id : ''; }), cases);
  const exp = cases.map(([d, o]) => want(d, 12, o));
  ok(J(got) === J(exp) && J(exp) === J(['diwali', 'memorial-day', 'birthday', 'race-day', 'birthday', 'race-day', '', '', 'memorial-day', 'race-day', 'race-day', 'birthday', '', '', 'memorial-day', 'race-day', '', 'race-day']),
    '101.2: the order, care > birthday > race day > other holidays (Diwali over a birthday; Memorial Day over a birthday and a race; a birthday over Halloween and a race; a race over Halloween, the 4th of July and Christmas); Memorial Day weekend, Saturday to Monday, never a race look (2026 and 2027); the Friday before and the Tuesday after do', { got, exp });
  await x.close();
  // on the screen
  for (const [d, o, look, sp] of [['2026-05-23', { storage: RACES('2026-05-23') }, ''], ['2026-05-25', { storage: RACES('2026-05-25') }, 'memorial-day'], ['2026-05-22', { storage: RACES('2026-05-22') }, 'race-day'],
    ['2026-10-31', { storage: RACES('2026-10-31'), settings: { birthday: '1984-10-31' } }, 'birthday'], ['2026-10-31', { storage: RACES('2026-10-31') }, 'race-day', 'run'], ['2026-11-08', { settings: { birthday: '1984-11-08' } }, 'diwali'], ['2027-07-10', {}, 'tour']]) {
    const y = await openH(at(d), Object.assign({ query: '?sky=sun' }, o)), q = y.p; if (sp) await sport(q, 'run'); await boxReady(q); await sleep(400); const s = await lookIs(q, 'planSky', look, 8000) || await spotOf(q, 'planSky');
    const col = look === 'tour' ? await q.evaluate(() => { const svg = document.querySelector('#planSky>.rwx-fred:not(.rwx-out) svg'); return svg ? (svg.outerHTML.match(/#F7D046/gi) || []).length : 0; }) : null;
    ok(s.look === look && (look ? s.same && s.line === LINES[look] : s.same && s.line === null && s.key === 'wx:sun') && (look !== 'tour' || col > 0), 'order on the screen: ' + d + ' ' + J(o.settings || {}) + (o.storage ? ' a race that day' : '') + (sp ? ' (the run)' : '') + ': ' + (look || 'the weather look') + (look === 'tour' ? ' (fred in the Tour\'s yellow)' : ''), { s, col });
    await y.close(); }
});

section('birthday', async () => {
  for (const [d, b, look] of [['2027-02-28', '1988-02-29', 'birthday'], ['2027-03-01', '1988-02-29', ''], ['2028-02-29', '1988-02-29', 'birthday'], ['2028-02-28', '1988-02-29', ''], ['2026-10-29', '', ''], ['2026-10-29', '1984-10-29', 'birthday'], ['2026-10-28', '1984-10-29', '']]) {
    const x = await openH(at(d), { settings: { birthday: b }, query: '?sky=rain' }), p = x.p; await boxReady(p); await sleep(300); const s = await lookIs(p, 'planSky', look, 6000) || await spotOf(p, 'planSky');
    ok(s.look === look && s.same, '101.4: birthday ' + (b || '(empty)') + ' on ' + d + ': ' + (look ? 'the birthday look ("Happy birthday")' : 'none'), s); await x.close(); }
  // set and cleared in Profile with the page open: the look follows (the Birthday field's own change)
  const x = await openH(at('2026-10-29'), { query: '?sky=rain' }), p = x.p; await boxReady(p);
  await p.evaluate(() => { const i = document.getElementById('pBirthday'); i.value = '1984-10-29'; i.dispatchEvent(new Event('change', { bubbles: true })); });
  const a = await lookIs(p, 'planSky', 'birthday', 6000);
  await p.evaluate(() => { const i = document.getElementById('pBirthday'); i.value = ''; i.dispatchEvent(new Event('change', { bubbles: true })); });
  const b = await lookIs(p, 'planSky', '', 6000);
  ok(!!a && a.same && !!b && b.same && b.key === 'wx:rain', '101.4: a birthday set in Profile with the page open brings the look at once; cleared, the weather look is back', { a, b: b || await spotOf(p, 'planSky') }); await x.close();
});

section('raceday', async () => {
  for (const [d, R, look] of [['2026-11-12', ['2026-11-12'], 'race-day'], ['2026-11-12', ['2026-11-13'], ''], ['2026-11-12', ['2026-11-11', '2026-11-13'], '']]) {
    const x = await openH(at(d), { storage: RACES(...R), query: '?sky=sun' }), p = x.p; await boxReady(p); await sleep(300); const s = await lookIs(p, 'planSky', look, 6000) || await spotOf(p, 'planSky');
    ok(s.look === look && s.same, 'race day: races on ' + R.join(', ') + ', today ' + d + ': ' + (look || 'none'), s); await x.close(); }
  // a race dated today restored with the page open: the look follows
  const x = await openH(at('2026-11-12'), { query: '?sky=sun' }), p = x.p; await boxReady(p);
  const d = await p.evaluate(() => JSON.parse(JSON.stringify(window.__q101.backupData()))); d.races = [race('2026-11-12', 'kqr1')];
  await restore(p, d); await tab(p, 'plan'); const s = await lookIs(p, 'planSky', 'race-day', 6000);
  ok(!!s && s.same, 'race day: a race dated today restored with the page open: the race-day look, no reload', s || await spotOf(p, 'planSky')); await x.close();
  // that race deleted in Races (its detail's Delete, confirmed): the look goes at once, read before Plan is shown again (the Races code's own
  // redraw, renderRaces, asks: no tab change, no settings change)
  const y = await openH(at('2026-11-12'), { storage: RACES('2026-11-12'), query: '?sky=sun' }), q = y.p; await boxReady(q); const a = await lookIs(q, 'planSky', 'race-day', 6000);
  await tab(q, 'races'); await q.click('#raceList [data-race-open="kq20261112"]'); await until(() => q.evaluate(() => { const m = document.querySelector('.rd-modal'); return !!m && !m.hidden; }), 8000);
  await q.click('.rd-modal [data-rd=delete]'); const b = await lookIs(q, 'planSky', '', 6000), gone = await q.evaluate(() => !JSON.parse(localStorage.getItem('bluebird.races.v1') || '[]').some(r => r.date === '2026-11-12'));
  ok(!!a && !!b && b.same && gone, 'race day: the race deleted in Races (the page open, Plan not shown again): the race-day look goes at once', { a: !!a, b: b || await spotOf(q, 'planSky'), gone }); await y.close();
});

section('looks', async () => {
  // a care holiday, a fixed one and the Tour: the box, the card, the run's box and card; the sky the forecast's
  for (const [d, look, sky] of [['2026-11-08', 'diwali', 'rain'], ['2026-10-31', 'halloween', 'snow'], ['2027-07-10', 'tour', 'sun'], ['2026-12-31', 'new-year', 'sun']]) for (const sp of ['ride', 'run']) {
    const x = await openH(at(d), { query: '?sky=' + sky }), p = x.p; if (sp === 'run') await sport(p, 'run'); await boxReady(p); const B = await lookIs(p, 'planSky', look, 6000) || await spotOf(p, 'planSky');
    ok(B.look === look && B.same && B.key === 'wx:hol:' + look && B.sky === sky && B.gsky === sky && B.fred === sky && !!B.layer && B.lineShown, '101.3: ' + look + ' on the ' + sp + '\'s box: fred in the look (FW.bird of its wear' + (look === 'tour' ? ' and colours' : '') + ', key wx:hol:' + look + '), the sky still the forecast\'s (' + sky + ', its layer), the line shown', B);
    await crunch(p); await sleep(600); const cid = sp === 'run' ? 'runWx' : 'rWeather', K = await lookIs(p, cid, look, 6000) || await spotOf(p, cid);
    ok(K.look === look && K.same && K.key === 'wx:hol:' + look && K.sky === sky && !!K.layer && K.lineShown && K.drawn, '101.3: ' + look + ' on the ' + sp + '\'s weather card (#' + cid + '): fred in the look, the sky the forecast\'s (' + sky + '), the line under him', K);
    const F = await freds(p); ok(F.length === 1 && F[0] === cid, '101.3: fred at most once on the page after Crunch (item 100\'s rule)', F);
    await x.close(); }
  // no forecast: the cap's place; a clear night: still
  { const x = await openH(at('2026-12-24'), { forecast: false }), p = x.p; await boxReady(p, 'none'); const B = await lookIs(p, 'planSky', 'winter', 6000) || await spotOf(p, 'planSky');
    ok(B.look === 'winter' && B.same && B.key === 'wx:hol:winter' && !B.sky && B.fred === 'clouds', '101.3: no forecast: the winter look in the cap\'s place, no sky', B); await x.close(); }
  { const x = await openH(at('2027-02-06')), p = x.p; await sheet(p, () => setField(p, '#startTime', '20:00')); await boxReady(p); await sleep(400); const B = await lookIs(p, 'planSky', 'lunar-new-year', 6000) || await spotOf(p, 'planSky');
    ok(B.look === 'lunar-new-year' && B.same && B.key === 'wx:hol:lunar-new-year:n' && B.still === true && !B.sky && B.fred === 'night', '101.3: a clear night (8 pm): the look, still (as item 98\'s night), no sky', B); await x.close(); }
  // before Crunch fred is in the box only, with the look
  { const x = await openH(at('2026-11-08'), { query: '?sky=sun' }), p = x.p; await boxReady(p); await lookIs(p, 'planSky', 'diwali', 6000); const F = await freds(p);
    ok(J(F) === J(['planSky']), '101.3: before Crunch fred is in the box only (once on screen)', F); await x.close(); }
});

section('line', async () => {
  for (const [d, look] of [['2026-11-08', 'diwali'], ['2027-03-09', 'eid'], ['2026-05-25', 'memorial-day'], ['2026-12-06', 'hanukkah'], ['2027-02-06', 'lunar-new-year'], ['2026-10-31', 'halloween'], ['2027-03-28', 'spring']]) {
    const x = await openH(at(d), { query: '?sky=sun' }), p = x.p; await boxReady(p); const s = await lookIs(p, 'planSky', look, 6000) || await spotOf(p, 'planSky');
    const a = await p.evaluate(() => { const W = document.getElementById('planSky'), H = document.getElementById('planSkyH'), L = document.getElementById('planSkyL'); return { text: W.innerText.replace(/\s+/g, ' ').trim(), l: L ? L.innerText.replace(/\s+/g, ' ').trim() : '', h: H ? H.innerText.trim() : '', tag: H && H.tagName, out: !!H && !W.contains(H) }; });
    const snap = (await p.locator('#planSky').ariaSnapshot()).trim();
    ok(s.line === LINES[look] && s.lineShown && !s.lineInArt && s.artHidden && !s.artText, '101.5: ' + d + ': the line "' + LINES[look] + '" shown beside fred, outside the art; the art aria-hidden with no text of its own', s);
    ok(snap.includes(LINES[look]) && !/img|graphics/.test(snap) && a.text.toLowerCase() === (a.l + ' ' + a.h).toLowerCase(), '101.5: the accessibility tree reads the line in the box (real text, no image); the box\'s words are item 100\'s line and the day\'s line, nothing more (item 76)', { snap, a });
    if (look === 'memorial-day') ok(!/happy/i.test(s.line), '101.5: Memorial Day quiet: "Memorial Day", no "Happy"', s.line);
    await x.close(); }
  // the card's line, read too
  const x = await openH(at('2026-11-08'), { query: '?sky=sun' }), p = x.p; await boxReady(p); await crunch(p); await sleep(600); const K = await lookIs(p, 'rWeather', 'diwali', 6000) || await spotOf(p, 'rWeather');
  const snap = (await p.locator('#rWeather').ariaSnapshot()).trim();
  ok(K.lineShown && !K.lineInArt && snap.includes('Happy Diwali'), '101.5: the card\'s line "Happy Diwali" is real text in the accessibility tree, outside the art', { K, snap: snap.slice(0, 300) }); await x.close();
});

section('midnight', async () => {
  // the app open over midnight (Oct 30 to Halloween): the look comes with no reload and no tap, in the box, and on the card after Crunch
  { const x = await openH('2026-10-30T23:59:40-07:00', { query: '?sky=sun', settle: 300 }), p = x.p; await boxReady(p); const a = await spotOf(p, 'planSky');
    await p.evaluate(() => { window.__q101svg = document.querySelector('#planSky>.rwx-fred:not(.rwx-out) svg'); });
    await crunch(p); await sleep(300); const c0 = await spotOf(p, 'rWeather');
    const b = await lookIs(p, 'rWeather', 'halloween', 30000), B = await spotOf(p, 'planSky'), t = await p.evaluate(() => new Date().toTimeString().slice(0, 8));
    ok(a.look === '' && c0.look === '' && !!b && b.same && b.key === 'wx:hol:halloween' && B.look === 'halloween', '101 (date): open at 23:59:40 on Oct 30: the weather look, then at midnight Halloween on the card and in the box (no reload, no tap; ' + t + ')', { a: a.look, c0: c0.look, b: b || await spotOf(p, 'rWeather'), B: B.look });
    await x.close(); }
  // Hanukkah's eve at 16:00 with the app open
  { const x = await openH('2026-12-04T15:59:45-08:00', { query: '?sky=snow', settle: 300 }), p = x.p; await boxReady(p); const a = await spotOf(p, 'planSky'); const b = await lookIs(p, 'planSky', 'hanukkah', 30000);
    ok(a.look === '' && !!b && b.same, '101.1: Dec 4 2026, 15:59:45, the app open: no look, then Hanukkah at 16:00 (its eve)', { a: a.look, b: b || await spotOf(p, 'planSky') }); await x.close(); }
  // back in front on a new day; the same day back in front, Journal and back: fred kept (the same svg)
  { const x = await openH(at('2026-10-30'), { query: '?sky=sun' }), p = x.p; await boxReady(p); await p.evaluate(() => { window.__q101svg = document.querySelector('#planSky>.rwx-fred:not(.rwx-out) svg'); });
    await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await tab(p, 'journal'); await tab(p, 'plan'); await sleep(600);
    const same = await p.evaluate(() => document.querySelector('#planSky>.rwx-fred:not(.rwx-out) svg') === window.__q101svg);
    ok(same, '101.3: the same day, back in front and Journal and back: fred kept (the same drawing: he is drawn again only when the look changes)', same);
    await shiftDays(p, 1); const b = await lookIs(p, 'planSky', 'halloween', 8000);
    ok(!!b && b.same && await p.evaluate(() => document.querySelector('#planSky>.rwx-fred:not(.rwx-out) svg') !== window.__q101svg), '101 (date): back in front on a new day (Halloween): the look comes, fred drawn again', b || await spotOf(p, 'planSky'));
    await shiftDays(p, 1); const c = await lookIs(p, 'planSky', '', 8000);
    ok(!!c && c.same && /^wx:[a-z]+$/.test(c.key), '101 (date): back in front the day after: the weather look again (' + (c && c.key) + ': the new day\'s ride, its forecast or the cap)', c || await spotOf(p, 'planSky')); await x.close(); }
});

section('switch', async () => {
  const x = await openH(at('2026-11-08'), { query: '?sky=sun' }), p = x.p; await boxReady(p); await lookIs(p, 'planSky', 'diwali', 6000); await toSettings(p);
  const s = await p.evaluate(() => { const g = document.querySelector('#view-profile .sg-fw'), row = id => { const b = document.getElementById(id); return b && { in: g.contains(b), pressed: b.getAttribute('aria-pressed'), on: b.classList.contains('on'), label: b.querySelector('.prow-l').textContent, h: b.getBoundingClientRect().height }; };
    const R = [...g.querySelectorAll('.prow')].map(r => r.dataset.prow), st = JSON.parse(localStorage.getItem('bluebird.settings.v2') || '{}'), Q = window.__q101;
    return { looks: row('prowBtn-holidaylooks'), care: row('prowBtn-holidaycare'), rows: R, stored: ['holidayLooks', 'holidayCare'].filter(k => k in st || k in Q.settings), def: ['holidayLooks', 'holidayCare'].filter(k => k in Q.DEFAULT_SETTINGS) }; });
  ok(s.looks && s.looks.in && s.looks.label === 'Holiday looks' && s.looks.pressed === 'true' && s.looks.on && s.looks.h >= 44, '101.6: Settings › fred world › "Holiday looks", on, 44 px', s.looks);
  ok(s.care && s.care.in && s.care.label === 'Cultural and religious holidays' && s.care.pressed === 'true' && s.care.on && s.care.h >= 44, '101.6: Settings › fred world › "Cultural and religious holidays", on, 44 px', s.care);
  ok(J(s.rows.slice(-4)) === J(['crewshow', 'crewnames', 'holidaylooks', 'holidaycare']), '101.6: after item 100\'s two rows (Show the crew, Show their names)', s.rows);
  ok(!s.stored.length && !s.def.length, '101.6: neither is stored, nor in DEFAULT_SETTINGS, until tapped', s);
  // Cultural and religious off on Diwali: the weather look; on Memorial Day it stays
  await p.click('#prowBtn-holidaycare'); await settle(p, 150); const w1 = await swOf(p), st1 = await p.evaluate(() => JSON.parse(localStorage.getItem('bluebird.settings.v2'))); await tab(p, 'plan'); const a = await lookIs(p, 'planSky', '', 6000);
  ok(st1.holidayCare === false && !('holidayLooks' in st1) && w1.holidaycare === 'false off' && !!a && a.same && a.key === 'wx:sun', '101.6: Cultural and religious holidays tapped off on Diwali: stored (holidayCare false, holidayLooks still not stored), the switch off, the weather look (no Diwali)', { st: [st1.holidayLooks, st1.holidayCare], w1, a: a || await spotOf(p, 'planSky') });
  await reload(p); await boxReady(p); await sleep(400); const r = await spotOf(p, 'planSky'); await toSettings(p); const w2 = await swOf(p);
  ok(r.look === '' && w2.holidaycare === 'false off' && w2.holidaylooks === 'true on', 'switch: a reload keeps it (no Diwali, the switch off)', { r: r.look, w2 });
  await p.click('#prowBtn-holidaycare'); await settle(p, 150); await tab(p, 'plan'); const b = await lookIs(p, 'planSky', 'diwali', 6000);
  ok(!!b && b.same, 'switch: on again: Diwali is back', b || await spotOf(p, 'planSky'));
  // Holiday looks off: no look at all
  await toSettings(p); await p.click('#prowBtn-holidaylooks'); await settle(p, 150); const st2 = await p.evaluate(() => JSON.parse(localStorage.getItem('bluebird.settings.v2'))); await tab(p, 'plan'); const c = await lookIs(p, 'planSky', '', 6000);
  ok(st2.holidayLooks === false && !!c && c.same, '101.6: Holiday looks tapped off: stored false, no look (the weather look)', { st: st2.holidayLooks, c: c || await spotOf(p, 'planSky') }); await x.close();
  for (const [d, o, look, what] of [['2026-10-31', { settings: { holidayLooks: false } }, '', 'Halloween'], ['2026-10-29', { settings: { holidayLooks: false, birthday: '1984-10-29' } }, '', 'the birthday'], ['2026-11-12', { settings: { holidayLooks: false }, storage: RACES('2026-11-12') }, '', 'a race day'],
    ['2026-05-25', { settings: { holidayCare: false } }, 'memorial-day', 'Memorial Day (civic, not cultural or religious)'], ['2026-12-06', { settings: { holidayCare: false } }, '', 'Hanukkah'], ['2027-02-06', { settings: { holidayCare: false } }, '', 'Lunar New Year'], ['2027-03-09', { settings: { holidayCare: false } }, '', 'Eid'],
    ['2026-10-29', { settings: { holidayCare: false, birthday: '1984-10-29' } }, 'birthday', 'the birthday'], ['2026-12-24', { settings: { holidayCare: false } }, 'winter', 'the winter holidays']]) {
    const y = await openH(at(d), Object.assign({ query: '?sky=sun' }, o)), q = y.p; await boxReady(q); await sleep(400); const s2 = await lookIs(q, 'planSky', look, 6000) || await spotOf(q, 'planSky');
    ok(s2.look === look && s2.same, '101.6: ' + (o.settings.holidayLooks === false ? 'Holiday looks off' : 'Cultural and religious holidays off') + ', ' + what + ': ' + (look || 'no look'), s2); await y.close(); }
});

section('sync', async () => {
  const be = new Backend(), WHO = { uid: 'u1', email: 'u1@example.com', displayName: 'Test u1' };
  const signedIn = () => ({ '__mock_user': WHO, '__mock_auth': 'u1', 'bluebird.owner.v1': { uid: 'u1', name: WHO.displayName, email: WHO.email, photo: '', signedIn: true } });
  const synced = label => openH(at('2026-11-08'), { file: SYNCED, settle: 1200, storage: signedIn(), query: '?sky=sun', route: be.handler(label) });
  const doc = () => be.fs.get('users/u1') || {};
  const A = await synced('A'), B = await synced('B');
  for (const x of [A, B]) await until(() => x.p.evaluate(() => { const o = JSON.parse(localStorage.getItem('bluebird.synccursor.v1') || 'null'); return !!(o && o.full); }), 20000);
  await until(() => doc().settings, 15000);
  const nudge = async (cond, ms = 45000) => { const t = Date.now(); while (Date.now() - t < ms) { for (const x of [A, B]) await x.p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(1500); const v = await cond().catch(() => null); if (v) return v; } return null; };
  await boxReady(B.p); const b0 = await lookIs(B.p, 'planSky', 'diwali', 8000);
  await toSettings(A.p); await A.p.click('#prowBtn-holidaylooks'); await settle(A.p, 200);
  const up = await until(() => (doc().settings || {}).holidayLooks === false, 20000), at1 = doc().settingsAt || {};
  ok(!!b0 && !!up && typeof at1.holidayLooks === 'number' && !('holidayCare' in (doc().settings || {})), 'sync: A\'s Holiday looks off reaches the cloud as its own key (settings.holidayLooks, its own settingsAt stamp; holidayCare untouched, not stored)', { s: doc().settings && doc().settings.holidayLooks, at: Object.keys(at1) });
  const got = await nudge(() => B.p.evaluate(() => window.__q101.settings.holidayLooks === false)); await sleep(600); const b1 = await lookIs(B.p, 'planSky', '', 6000);
  ok(!!got && !!b1 && b1.same, 'QA: on B (on Plan) Diwali goes as soon as A\'s Holiday looks off arrives (the weather look)', b1 || await spotOf(B.p, 'planSky'));
  // B: Holiday looks on again and Cultural and religious off: both reach A
  await toSettings(B.p); { const w = await swOf(B.p); ok(w.holidaylooks === 'false off', 'sync: B\'s switch shows A\'s off', w); }
  await B.p.click('#prowBtn-holidaylooks'); await settle(B.p, 200); await B.p.click('#prowBtn-holidaycare'); await settle(B.p, 200);
  const up2 = await until(() => { const s = doc().settings || {}; return s.holidayLooks === true && s.holidayCare === false; }, 20000), at2 = doc().settingsAt || {};
  ok(!!up2 && typeof at2.holidayCare === 'number', 'sync: B\'s two taps reach the cloud, each its own key (holidayLooks true, holidayCare false, a stamp each)', { s: doc().settings, at: Object.keys(at2) });
  await tab(A.p, 'plan'); const gotA = await nudge(() => A.p.evaluate(() => window.__q101.settings.holidayLooks === true && window.__q101.settings.holidayCare === false)); await toSettings(A.p); const wA = await swOf(A.p); await tab(A.p, 'plan'); const a1 = await spotOf(A.p, 'planSky');
  ok(!!gotA && wA.holidaylooks === 'true on' && wA.holidaycare === 'false off' && a1.look === '', 'QA: A gets both (its switches shown: Holiday looks on, Cultural and religious off) and still no Diwali', { wA, a1: a1.look });
  await A.close(); await B.close();
});

async function restore(p, d) {
  await toSettings(p); await p.click('#prowBtn-backup'); await until(() => p.evaluate(() => document.getElementById('setSheet').classList.contains('open')));
  await p.setInputFiles('#backupFile', { name: 'fred-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(d)) });
  await until(() => p.evaluate(() => { const t = document.getElementById('toast'); return !!t && /Restored/.test(t.textContent); }), 10000); await settle(p, 300);
  if (await p.evaluate(() => document.getElementById('setSheet').classList.contains('open'))) { await p.click('#setSheetDone'); await settle(p, 150); }
}
section('backup', async () => {
  for (const k of ['holidayLooks', 'holidayCare']) {
    const s = await openH(at('2026-11-08'), { settings: { [k]: false } }), e = await s.p.evaluate(() => JSON.parse(JSON.stringify(window.__q101.backupData()))); await s.close();
    ok(e.settings && e.settings[k] === false, 'backup: a backup made with ' + k + ' off carries it', e.settings && e.settings[k]);
    const u = await openH(at('2026-11-08'), { query: '?sky=sun' }), q = u.p; await boxReady(q); const a = await lookIs(q, 'planSky', 'diwali', 6000); await restore(q, e); await tab(q, 'plan');
    const b = await lookIs(q, 'planSky', '', 6000), st = await q.evaluate(k => ({ s: window.__q101.settings[k], ls: JSON.parse(localStorage.getItem('bluebird.settings.v2'))[k] }), k); await toSettings(q); const w = await swOf(q);
    ok(!!a && !!b && st.s === false && st.ls === false && w[k.toLowerCase()] === 'false off', 'backup: restored on a device with it on (Diwali shown): ' + k + ' off, stored, its switch off, no Diwali', { st, w, b: b || await spotOf(q, 'planSky') });
    // a backup without the switches keeps this device's (off stays off)
    const old = JSON.parse(JSON.stringify(e)); delete old.settings.holidayLooks; delete old.settings.holidayCare; await restore(q, old); await tab(q, 'plan'); await sleep(400);
    const c = await spotOf(q, 'planSky'), st2 = await q.evaluate(k => ({ s: window.__q101.settings[k], ls: JSON.parse(localStorage.getItem('bluebird.settings.v2'))[k] }), k);
    ok(c.look === '' && st2.s === false && st2.ls === false, 'backup: one without the switches keeps this device\'s (' + k + ' off stays off, as item 100\'s crew switches)', { st2, c: c.look });
    await u.close(); }
  // an old backup on a fresh device: nothing stored, the look shows
  const s = await openH(at('2026-11-08')), e = await s.p.evaluate(() => JSON.parse(JSON.stringify(window.__q101.backupData()))); await s.close(); delete e.settings.holidayLooks; delete e.settings.holidayCare;
  const u = await openH(at('2026-11-08'), { query: '?sky=sun' }), q = u.p; await boxReady(q); await restore(q, e); await tab(q, 'plan'); const c = await lookIs(q, 'planSky', 'diwali', 6000), st = await q.evaluate(() => JSON.parse(localStorage.getItem('bluebird.settings.v2')));
  ok(!!c && !('holidayLooks' in st) && !('holidayCare' in st), 'backup: an old backup on a device that never changed them: nothing stored, Diwali still shows', { st: [st.holidayLooks, st.holidayCare], c: !!c }); await u.close();
});

section('media', async () => {
  const x = await openH(at('2026-11-08'), { query: '?sky=sun', dpr: 2 }), p = x.p; await boxReady(p); await lookIs(p, 'planSky', 'diwali', 6000);
  const look = () => p.evaluate(() => { const W = document.getElementById('planSky'), d = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).display : 'gone'; }, L = document.getElementById('planSkyL'), H = document.getElementById('planSkyH');
    const pad = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce((n, k) => n + parseFloat(getComputedStyle(W)[k]), 0), hs = getComputedStyle(H);
    return { h: +W.getBoundingClientRect().height.toFixed(1), lines: +(L.getBoundingClientRect().height + H.getBoundingClientRect().height + parseFloat(hs.marginTop) + parseFloat(hs.marginBottom)).toFixed(1), pad, box: d('#planSky'), edge: getComputedStyle(W).borderTopWidth + ' ' + getComputedStyle(W).borderTopStyle,
      fred: d('#planSky>.rwx-fred'), svg: d('#planSky>.rwx-fred>svg'), scene: d('#planSky>.rwx-scene'), line: hs.display, vis: hs.visibility, shadow: hs.textShadow, color: hs.color, bg: getComputedStyle(W).backgroundColor, fca: hs.forcedColorAdjust }; });
  await p.emulateMedia({ media: 'print' }); const pr = await look(); await p.emulateMedia({ media: 'screen' });
  ok(pr.box !== 'none' && pr.line !== 'none' && pr.vis === 'visible' && pr.fred === 'none' && pr.scene === 'none' && pr.shadow === 'none', 'print: the art hidden (fred, the sky), the line kept, without the feather', pr);
  ok(pr.h <= pr.lines + pr.pad + 2, 'print: the box the two lines\' height and its padding (' + pr.h + ' px; no height kept for fred)', pr);
  for (const cs of ['light', 'dark']) { await p.emulateMedia({ forcedColors: 'active', colorScheme: cs }); const fc = await look();
    ok(fc.box !== 'none' && / solid$/.test(fc.edge) && parseFloat(fc.edge) >= 1 && (fc.fred === 'none' || fc.svg === 'none') && fc.scene === 'none' && fc.line !== 'none' && fc.vis === 'visible' && fc.color !== fc.bg && fc.fca !== 'none', 'forced colours (' + cs + '): the art hidden, the box\'s edge kept, the line shown in the system\'s colours (' + fc.color + ' on ' + fc.bg + ')', fc); }
  await p.emulateMedia({ forcedColors: 'none' });
  await crunch(p); await sleep(600); await lookIs(p, 'rWeather', 'diwali', 6000);
  const card = () => p.evaluate(() => { const W = document.getElementById('rWeather'), H = W.querySelector('.rwx-hol'), f = W.querySelector('.rwx-fred'); return { line: H ? getComputedStyle(H).display : 'gone', fred: f ? getComputedStyle(f).display : 'gone', svg: f && f.querySelector('svg') ? getComputedStyle(f.querySelector('svg')).display : 'gone', shadow: H ? getComputedStyle(H).textShadow : null }; });
  await p.emulateMedia({ media: 'print' }); const cp = await card(); await p.emulateMedia({ media: 'screen' });
  ok(cp.line !== 'none' && cp.fred === 'none' && cp.shadow === 'none', 'print: on the card fred hidden, the line kept, without the feather', cp);
  await p.emulateMedia({ forcedColors: 'active' }); const cf = await card(); await p.emulateMedia({ forcedColors: 'none' });
  ok(cf.line !== 'none' && (cf.fred === 'none' || cf.svg === 'none'), 'forced colours: on the card the art hidden, the line shown', cf);
  await x.close();
});

section('fit', async () => {
  // item 100's fit, its line (copied from q100): rows inside the box, beside fred clear of him, no word over two rows, none empty or short, no dot first
  const fitOf = p => p.evaluate(() => { const W = document.getElementById('planSky'), Wr = W.getBoundingClientRect(), L = document.getElementById('planSkyL'), f = W.querySelector(':scope>.rwx-fred').getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(L);
    const T = [...rg.getClientRects()].filter(r => r.width > .5), bodyL = f.left + f.width * .12, beside = T.filter(r => (r.top + r.bottom) / 2 < f.bottom), right = Math.max(...beside.map(r => r.right));
    const split = [], U = []; const tw = document.createTreeWalker(L, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const re = /[^ \t\n]+/g; let m; while ((m = re.exec(n.data))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const Q = [...r.getClientRects()].filter(q => q.width > .5);
      if (new Set(Q.map(q => Math.round(q.top))).size > 1) split.push(m[0]); if (Q.length) U.push({ w: m[0], l: Math.min(...Q.map(q => q.left)), r: Math.max(...Q.map(q => q.right)), t: Math.min(...Q.map(q => q.top)), b: Math.max(...Q.map(q => q.bottom)) }); } }
    const R = []; U.slice().sort((a, b) => a.t - b.t).forEach(u => { const r = R.find(r => Math.min(r.b, u.b) - Math.max(r.t, u.t) > .5 * Math.min(r.b - r.t, u.b - u.t)); if (r) { r.u.push(u); r.t = Math.min(r.t, u.t); r.b = Math.max(r.b, u.b); } else R.push({ t: u.t, b: u.b, u: [u] }); });
    R.sort((a, b) => a.t - b.t).forEach(r => r.u.sort((a, b) => a.l - b.l)); const fl = getComputedStyle(L, '::before'), Lr = L.getBoundingClientRect(), roomL = Lr.right - parseFloat(getComputedStyle(L).paddingRight) - parseFloat(fl.width), roomB = Lr.top + parseFloat(fl.height), sp = parseFloat(getComputedStyle(L).fontSize);
    const short = R.slice(0, -1).map((r, k) => ({ r, nx: R[k + 1].u[0] })).filter(({ r, nx }) => r.t < roomB - .5 && nx.r - nx.l + .4 * sp < roomL - r.u[r.u.length - 1].r).map(({ r, nx }) => r.u.map(u => u.w).join(' ') + ' | ' + nx.w);
    const band = R.slice(1).filter((r, k) => R[k].t < roomB - .5 && r.t - R[k].b > sp && r.u[0].r - r.u[0].l < roomL - Lr.left).length;
    return { rows: R.map(r => r.u.map(u => u.w).join(' ')), band, dot: R.filter(r => /^\s*·/.test(r.u[0].w)).length, short, inside: T.every(r => r.left >= Wr.left && r.right <= Wr.right && r.top >= Wr.top && r.bottom <= Wr.bottom), clear: right <= bodyL + .5, split, fred: f.bottom <= Wr.bottom && f.top >= Wr.top && f.right <= Wr.right, cut: L.scrollWidth > L.clientWidth + 1 }; });
  // the day's line: its rows inside the box, those beside fred clear of his body, no word over two rows, nothing cut
  const holFit = p => p.evaluate(() => { const W = document.getElementById('planSky'), Wr = W.getBoundingClientRect(), H = document.getElementById('planSkyH'), f = W.querySelector(':scope>.rwx-fred').getBoundingClientRect(), bodyL = f.left + f.width * .12, rg = document.createRange(); rg.selectNodeContents(H);
    const T = [...rg.getClientRects()].filter(r => r.width > .5), beside = T.filter(r => (r.top + r.bottom) / 2 < f.bottom), split = []; const tw = document.createTreeWalker(H, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) { const re = /[^ \t\n]+/g; let m; while ((m = re.exec(n.data))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); if (new Set([...r.getClientRects()].filter(q => q.width > .5).map(q => Math.round(q.top))).size > 1) split.push(m[0]); } }
    return { text: H.textContent, rows: new Set(T.map(r => Math.round(r.top))).size, beside: beside.length, inside: T.every(r => r.left >= Wr.left - .5 && r.right <= Wr.right + .5 && r.top >= Wr.top && r.bottom <= Wr.bottom + .5), clear: beside.every(r => r.right <= bodyL + .5), split, cut: H.scrollWidth > H.clientWidth + 1, sx: document.documentElement.scrollWidth > innerWidth }; });
  for (const [w, h] of [[320, 568], [375, 812], [390, 844]]) for (const sc of [1, 1.5, 2]) for (const [d, look] of [['2027-02-06', 'lunar-new-year'], ['2026-12-06', 'hanukkah'], ['2026-05-25', 'memorial-day']]) {
    if (sc === 1 && look !== 'lunar-new-year') continue;
    const x = await openH(at(d), { query: '?sky=rain', width: w, height: h, scale: sc }), p = x.p; await boxReady(p); await lookIs(p, 'planSky', look, 6000); await sleep(300);
    const g = await fitOf(p), k = await holFit(p), what = look + ', ' + w + ' px, ' + sc * 100 + '% text: ';
    ok(g.inside && g.clear && g.fred && !g.cut && !g.split.length && !g.short.length && !g.band && !g.dot, 'QA: ' + what + 'item 100\'s line still fits (inside the box, beside fred clear of him, no word over two rows, no row beside him empty or short, no row starting with a dot: ' + g.rows.join(' / ') + ')', g);
    ok(k.inside && k.clear && !k.split.length && !k.cut && !k.sx && k.text === LINES[look], 'QA: ' + what + 'the day\'s line inside the box, ' + k.rows + ' row(s), ' + k.beside + ' beside fred and clear of him, no word over two rows, nothing cut, no sideways scroll', k);
    await x.close(); }
  // WebKit (the iPhone's engine) at 320 px / 200%
  const wk = await webkit.launch();
  { const x = await openH(at('2027-02-06'), { browser: wk, query: '?sky=rain', width: 320, height: 568, scale: 2, noErrs: true }), p = x.p; await boxReady(p); await lookIs(p, 'planSky', 'lunar-new-year', 6000); await sleep(300); const g = await fitOf(p), k = await holFit(p);
    ok(g.inside && g.clear && !g.split.length && !g.dot && k.inside && k.clear && !k.split.length && !k.cut && !k.sx, 'QA: WebKit, 320 px, 200% text: both lines fit (item 100\'s rules, the day\'s line clear of fred)', { g, k }); await x.close(); ERRS.push(x.errors.filter(e => !/^console: Not allowed to load local resource: file:/.test(e))); }
  await wk.close();
  // the card: the line under fred, inside the card, above the tiles, where he shows; none where item 98's cut leaves him out
  for (const [w, h, sc] of [[390, 844, 1], [430, 932, 1], [430, 932, 1.5], [320, 568, 1], [390, 844, 2], [320, 568, 2]]) {
    const x = await openH(at('2027-02-06'), { query: '?sky=rain', width: w, height: h, scale: sc }), p = x.p; await boxReady(p); await crunch(p); await sleep(700);
    const c = await p.evaluate(() => { const W = document.getElementById('rWeather'), Wr = W.getBoundingClientRect(), f = W.querySelector(':scope>.rwx-fred'), H = W.querySelector('.rwx-hol'), t = W.querySelector('.rwx-tile'), shows = getComputedStyle(f).display !== 'none', hr = H.getBoundingClientRect();
      const svg = f.querySelector('svg').getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(H); const T = [...rg.getClientRects()].filter(r => r.width > .5);
      return { shows, line: getComputedStyle(H).display !== 'none', under: T.every(r => r.top >= f.getBoundingClientRect().bottom - 2), inside: T.every(r => r.left >= Wr.left && r.right <= Wr.right), above: hr.bottom <= t.getBoundingClientRect().top + .5, sx: document.documentElement.scrollWidth > innerWidth, fredB: Math.round(f.getBoundingClientRect().bottom), svgB: Math.round(svg.bottom), T: T.map(r => [Math.round(r.left), Math.round(r.top), Math.round(r.right)]) }; });
    ok(c.shows ? c.line && c.under && c.inside && c.above && !c.sx : !c.line && !c.sx, 'QA: the card at ' + w + ' px, ' + sc * 100 + '% text: ' + (c.shows ? 'fred shows: the line under him, inside the card, above the tiles' : 'fred left out (item 98\'s cut): no line'), c);
    await x.close(); }
});

section('theme', async () => {
  const x = await openH(at('2027-03-09'), { query: '?sky=rain', settings: { sport: 'run' } }), p = x.p; await boxReady(p); await lookIs(p, 'planSky', 'eid', 6000);
  const lum = c => { const v = (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number).map(x => x / 255).map(x => x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4)); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; }, cr = (a, b) => { const A = lum(a), B = lum(b); return (Math.max(A, B) + .05) / (Math.min(A, B) + .05); };
  const g = await p.evaluate(() => { const W = document.getElementById('planSky'), H = document.getElementById('planSkyH'), s = getComputedStyle(H); return { run: document.documentElement.classList.contains('run-theme'), color: s.color, bg: getComputedStyle(W).backgroundColor, shadow: s.textShadow }; });
  ok(g.run && cr(g.color, g.bg) >= 4.5 && (g.shadow.match(/rgb\(/g) || []).length >= 30, 'theme: the run\'s graphite: the line ' + g.color + ' on the panel ' + g.bg + ' (' + cr(g.color, g.bg).toFixed(1) + ':1), with graphite\'s feather over the sky (its rings to 2 px: 30 or more shadows)', g);
  await crunch(p); await sleep(600); await lookIs(p, 'runWx', 'eid', 6000);
  const k = await p.evaluate(() => { const W = document.getElementById('runWx'), H = W.querySelector('.rwx-hol'), s = getComputedStyle(H); return { color: s.color, bg: getComputedStyle(W).backgroundColor, shadow: s.textShadow, shown: s.display !== 'none' }; });
  ok(k.shown && cr(k.color, k.bg) >= 4.5 && (k.shadow.match(/rgb\(/g) || []).length >= 30, 'theme: the run\'s card: the line ' + k.color + ' on ' + k.bg + ' (' + cr(k.color, k.bg).toFixed(1) + ':1), with the feather', k);
  await x.close();
});

section('motion', async () => {
  // motion on: fred moves when first seen in the look, is still by 9.5 s; a look change (the app back in front on a new day) moves him again
  const watch = (p, ms) => p.evaluate(ms => new Promise(res => { const t0 = performance.now(), R = { go: 0, run: 0, max: 0 }; const look = () => { const f = document.querySelector('#planSky>.rwx-fred:not(.rwx-out)'), A = document.getAnimations().filter(a => a.playState === 'running' && /^fw-/.test(a.animationName || ''));
    R.max = Math.max(R.max, A.length); if (f && f.classList.contains('fwm-go')) R.go++; R.run = Math.max(R.run, f ? A.filter(a => f.contains(a.effect.target)).length : 0); if (performance.now() - t0 < ms) setTimeout(look, 100); else { R.end = { go: document.querySelectorAll('#planSky .fwm-go').length, run: f ? A.filter(a => f.contains(a.effect.target)).length : -1 }; res(R); } }; look(); }), ms);
  for (const [d, look] of [['2026-12-31', 'new-year'], ['2026-12-24', 'winter']]) {
    const x = await openH(at(d), { query: '?sky=snow', motion: true, width: 430, height: 932, settle: 50 }), p = x.p; const R = await watch(p, 9500); const s = await spotOf(p, 'planSky');
    ok(s.look === look && R.go > 0 && R.run > 0 && R.end.go === 0 && R.end.run === 0, 'round rule a: ' + look + ': fred moves when first seen in the look, then still by 9.5 s', R);
    ok(R.max <= 30, 'budget: at most 30 running fred world animations on the screen (' + look + ' in snow, and the crew: ' + R.max + ')', R.max);
    if (look === 'new-year') { await shiftDays(p, 2); const b = await lookIs(p, 'planSky', '', 8000); const R2 = await watch(p, 9500);
      ok(!!b && R2.go > 0 && R2.end.go === 0 && R2.end.run === 0, 'round rule a: the look changed (Jan 2, back in front): fred moves again, then still', R2);
      await p.evaluate(() => { window.__q101svg = document.querySelector('#planSky>.rwx-fred:not(.rwx-out) svg'); document.dispatchEvent(new Event('visibilitychange')); }); const R3 = await watch(p, 1500);
      ok(R3.go === 0 && R3.run === 0 && await p.evaluate(() => document.querySelector('#planSky>.rwx-fred:not(.rwx-out) svg') === window.__q101svg), 'round rule a: back in front the same day: nothing moves, the drawing kept', R3); }
    await x.close(); }
  for (const [what, o] of [['Reduce Motion', { motion: false }], ['Animate the world off', { motion: true, settings: { worldMotion: false } }]]) for (const [d, look] of [['2026-12-31', 'new-year'], ['2026-11-08', 'diwali']]) {
    const y = await openH(at(d), Object.assign({ query: '?sky=sun', settle: 50 }, o)), q = y.p; const R = await watch(q, 3000); const s = await spotOf(q, 'planSky'), rm = await q.evaluate(() => { const f = document.querySelector('#planSky>.rwx-fred:not(.rwx-out)'); return !!f && f.classList.contains('fw-rm'); });
    ok(s.look === look && R.go === 0 && R.run === 0 && rm, 'motion: ' + what + ': ' + look + (look === 'new-year' ? ' (the champagne too)' : '') + ': fred still (no .fwm-go, nothing running, .fw-rm)', { R, rm }); await y.close(); }
});

section('desk', async () => {
  const x = await openH(at('2026-11-08'), { query: '?sky=sun', width: 1280, height: 800 }), p = x.p; await boxReady(p); const B = await lookIs(p, 'planSky', 'diwali', 6000) || await spotOf(p, 'planSky');
  const dk = await p.evaluate(() => document.documentElement.classList.contains('dk'));
  ok(dk && B.look === 'diwali' && B.same && B.lineShown, 'the computer layout (1280 x 800): the box under the ticket shows the look and its line', B); await x.close();
  const y = await openH(at('2026-11-08'), { query: '?sky=sun', width: 1440, height: 900 }), q = y.p; await boxReady(q); await crunch(q); await sleep(700); const K = await lookIs(q, 'rWeather', 'diwali', 6000) || await spotOf(q, 'rWeather'), F = await freds(q);
  ok(K.look === 'diwali' && K.same && K.lineShown && J(F) === J(['rWeather']), 'the computer layout (1440 x 900) after Crunch: the card beside the plan in the look, with its line; the box out, one fred', { K, F }); await y.close();
});

section('main', async () => {
  for (const [what, pg] of [['main', MAIN], ['item 100\'s page', PREV && fs.existsSync(PREV) ? PREV : null]]) {
    if (!pg) { console.log('  note: no ' + what + ' given: its check is skipped'); continue; }
    const x = await open(pg, { athlete: 'A', browser, now: at('2026-11-08'), route: WX, query: '?sky=sun', repo: REPO, settle: 1500 }), p = x.p; await crunch(p); await sleep(600);
    const m = await p.evaluate(() => ({ rows: !!document.getElementById('prowBtn-holidaylooks'), look: document.querySelectorAll('[data-look]').length, line: document.querySelectorAll('.rwx-hol,#planSkyH').length }));
    ok(!m.rows && !m.look && !m.line, what + ': no holiday rows, no look, no line on Diwali (the item 101 screens skip there)', m); await x.close(); }
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
C.done('item 101: Holidays and the birthday look');
