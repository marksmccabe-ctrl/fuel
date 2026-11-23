// Item 101 (fred, Nov 5): holidays and the birthday look. The app's own date rules (holSpans, holEaster, holNth) and its choice of one
// look (holAt: the care holidays > the birthday > the rider's race day > KOM Kitty's slot > the other holidays > the weather look), run in
// the real page (index.html, Firebase off, no network, as crew.test.mjs opens it) through a read-only hook. Every expected date here is
// worked out by this file on its own (a walk over the calendar for the nth weekdays) or taken from the research rows (the five-year table
// and Easter: the US Naval Observatory and timeanddate, checked twice), never from the app. The kit's q101 test checks the screens.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const SRC = fileURLToPath(new URL('../../index.html', import.meta.url));
const URL0 = 'file://' + SRC;
const HOOK = `Object.defineProperty(window,'__hol',{configurable:true,get(){ return {holSpans, holAt, holEaster, holNth, HOL_TABLE, HOL_THRU, HOL_EVE, HOL_LINE, HOL_FAITH}; }});\n`;
function pageSource() {
  let s = readFileSync(SRC, 'utf8');
  const cfg = /const FIREBASE_CONFIG = \{[\s\S]*?\n\};/;
  if (!cfg.test(s)) throw new Error('holidays test: FIREBASE_CONFIG block not found in index.html');
  s = s.replace(cfg, 'const FIREBASE_CONFIG = null;');
  const k = s.indexOf("\n'use strict';\n");
  if (k < 0) throw new Error("holidays test: the main script's 'use strict' line was not found");
  const at = k + "\n'use strict';".length;
  return s.slice(0, at) + '\n' + HOOK + s.slice(at);
}

let browser, page;
const errors = [];
before(async () => {
  const body = pageSource();
  browser = await chromium.launch();
  // a time zone with daylight saving: a local date must not slip at the change
  const ctx = await browser.newContext({ serviceWorkers: 'block', timezoneId: 'America/New_York', locale: 'en-US', viewport: { width: 390, height: 844 } });
  page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', r => { const u = r.request().url(); if (u === URL0) return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body }); return u.startsWith('file:') ? r.continue() : r.abort(); });
  await page.goto(URL0);
  await page.waitForFunction(() => !!window.__hol && !!window.FW);
});
after(async () => { if (browser) await browser.close(); });

const YEARS = [2026, 2027, 2028, 2029, 2030, 2031];
// the research rows (probe101/dates-research.json, both checks agreeing): first days; Hanukkah's end is its eighth day
const LNY = ['2026-02-17', '2027-02-06', '2028-01-26', '2029-02-13', '2030-02-03', '2031-01-23'];
const DIWALI = ['2026-11-08', '2027-10-28', '2028-10-17', '2029-11-05', '2030-10-25', '2031-11-13'];
const HANUKKAH = [['2026-12-05', '2026-12-12'], ['2027-12-25', '2028-01-01'], ['2028-12-13', '2028-12-20'], ['2029-12-02', '2029-12-09'], ['2030-12-21', '2030-12-28'], ['2031-12-10', '2031-12-17']];
const FITR = ['2026-03-20', '2027-03-09', '2028-02-26', '2029-02-14', '2030-02-04', '2031-01-24'];
const ADHA = ['2026-05-27', '2027-05-16', '2028-05-05', '2029-04-24', '2030-04-13', '2031-04-02'];
const EASTER = ['2026-04-05', '2027-03-28', '2028-04-16', '2029-04-01', '2030-04-21', '2031-04-13'];
const TOUR = { 2026: ['2026-07-04', '2026-07-26'], 2027: ['2027-07-02', '2027-07-25'], 2028: ['2028-06-24', '2028-07-16'] };

// this file's own calendar: ISO days, the nth weekday by walking the month
const iso = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
const add = (s, n) => { const t = new Date(s + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
function nth(y, m, dow, n) { const L = []; for (let d = 1; d <= 31; d++) { const t = new Date(Date.UTC(y, m - 1, d)); if (t.getUTCMonth() !== m - 1) break; if (t.getUTCDay() === dow) L.push(t.toISOString().slice(0, 10)); } return n > 0 ? L[n - 1] : L[L.length - 1]; }
function range(a, b) { const L = []; for (let s = a; s <= b; s = add(s, 1)) L.push(s); return L; }
// every day each holiday covers in year y (its days that start in y), as the item and its decisions give them
function expected(y) {
  const E = EASTER[y - 2026], tour = TOUR[y] || (() => { const s = nth(y, 7, 6, 1); return [s, add(s, 22)]; })();
  return {
    'new-year': range(iso(y, 12, 31), iso(y + 1, 1, 1)), valentines: [iso(y, 2, 14)], 'st-patricks': [iso(y, 3, 17)], spring: [add(E, -1), E],
    'memorial-day': [nth(y, 5, 1, -1)], 'july-4': [iso(y, 7, 4)], 'labor-day': [nth(y, 9, 1, 1)], halloween: [iso(y, 10, 31)],
    thanksgiving: [nth(y, 11, 4, 4)], winter: range(iso(y, 12, 20), iso(y, 12, 26)), 'running-day': [nth(y, 6, 3, 1)], 'bike-to-work': [nth(y, 5, 5, 3)],
    tour: range(tour[0], tour[1]), 'lunar-new-year': [LNY[y - 2026]], diwali: [DIWALI[y - 2026]], hanukkah: range(...HANUKKAH[y - 2026]), eid: [FITR[y - 2026], ADHA[y - 2026]],
  };
}
const IDS = Object.keys(expected(2026));
// holAt in the page at a local date and time: the look's id, or '' (the weather look)
const at = (cases) => page.evaluate(C => C.map(([s, h, o]) => { const [y, m, d] = s.split('-').map(Number), L = window.__hol.holAt(new Date(y, m - 1, d, h, 0), Object.assign({ looks: true, care: true }, o || {})); return L ? L.id : ''; }), cases);

test('the five-year table is the research rows (Lunar New Year, Diwali US dates, Hanukkah first days, Eid al-Fitr and al-Adha, the Tour)', async () => {
  const T = await page.evaluate(() => window.__hol.HOL_TABLE);
  assert.deepEqual(T['lunar-new-year'], LNY);
  assert.deepEqual(T.diwali, DIWALI);
  assert.deepEqual(T.hanukkah, HANUKKAH.map(r => r[0]));
  assert.deepEqual(T.eid, YEARS.flatMap((y, i) => [FITR[i], ADHA[i]]));
  assert.deepEqual(T.tour, Object.values(TOUR));
});

test('at least 12 months of the table are left (HOL_THRU, the end of its last year): when this fails, add the next years from new research', async () => {
  const thru = await page.evaluate(() => window.__hol.HOL_THRU);
  assert.equal(thru, '2031-12-31');
  const left = (Date.parse(thru + 'T23:59:59Z') - Date.now()) / 864e5;
  assert.ok(left >= 365, `only ${Math.floor(left)} days of the holiday table left (through ${thru})`);
  for (const id of ['lunar-new-year', 'diwali', 'hanukkah']) assert.equal(+(await page.evaluate(i => window.__hol.HOL_TABLE[i].slice(-1)[0].slice(0, 4), id)), 2031, id + ' runs through 2031');
});

test('Easter by the Computus: the research rows for 2026-2031, and a century of known dates', async () => {
  const got = await page.evaluate(Y => Y.map(y => window.__hol.holEaster(y)), [...YEARS, 1961, 2000, 2008, 2011, 2019, 2038, 2049, 2285]);
  assert.deepEqual(got.slice(0, 6), EASTER);
  assert.deepEqual(got.slice(6), ['1961-04-02', '2000-04-23', '2008-03-23', '2011-04-24', '2019-04-21', '2038-04-25', '2049-04-18', '2285-03-22']); /* the earliest and latest possible among them */
});

test('nth weekdays: the app agrees with a walk over every month, 2026-2035 (first to fourth and the last, every weekday)', async () => {
  const want = [], args = [];
  for (let y = 2026; y <= 2035; y++) for (let m = 1; m <= 12; m++) for (let dow = 0; dow < 7; dow++) for (const n of [1, 2, 3, 4, -1]) { args.push([y, m, dow, n]); want.push(nth(y, m, dow, n)); }
  const got = await page.evaluate(A => A.map(a => window.__hol.holNth(...a)), args);
  assert.deepEqual(got, want);
});

test('every holiday covers exactly its days in each year of the table (holSpans)', async () => {
  for (const y of YEARS) {
    const S = await page.evaluate(y => window.__hol.holSpans(y), y), E = expected(y);
    for (const id of IDS) {
      const days = S.filter(s => s.id === id).flatMap(s => range(s.a, s.b));
      assert.deepEqual(days, E[id], `${id} ${y}`);
    }
    assert.deepEqual([...new Set(S.map(s => s.id))].sort(), IDS.slice().sort(), 'no other ids ' + y);
  }
});

test('each holiday shows on its days and not the day before or after (alone: every other holiday out of the way)', async () => {
  for (const y of YEARS) {
    const E = expected(y);
    for (const id of IDS) {
      for (const day of E[id]) {
        const before = add(day, -1), after = add(day, 1), cases = [[day, 9], [day, 23]];
        if (!E[id].includes(before)) cases.push([before, 12]);
        if (!E[id].includes(after)) cases.push([after, 12]);
        const got = await page.evaluate(([C, id]) => C.map(([s, h]) => { const [Y, M, D] = s.split('-').map(Number), t = new Date(Y, M - 1, D, h, 0), H = window.__hol, on = H.holSpans(Y - 1).concat(H.holSpans(Y)).filter(x => x.a <= s && s <= x.b).map(x => x.id); return on.includes(id); }), [cases, id]);
        assert.deepEqual(got.slice(0, 2), [true, true], `${id} on ${day}`);
        assert.ok(got.slice(2).every(v => !v), `${id} not on the day before or after ${day}: ${JSON.stringify(cases.slice(2))}`);
        const pick = await at(cases.slice(0, 1));
        assert.ok(pick[0] === id || OVER.has(day), `${id} is the look on ${day} (${pick[0]})`);
      }
    }
  }
});

// every day of 2026-2031 with two or more holidays (and Hanukkah's eve on a holiday): the look the order gives
const OVERLAPS = [
  ['2026-07-04', 'july-4+tour', 12, 'july-4'], ['2027-07-04', 'july-4+tour', 12, 'july-4'], ['2028-07-04', 'july-4+tour', 12, 'july-4'],
  ['2027-12-24', 'winter+hanukkah eve', 12, 'winter'], ['2027-12-24', 'winter+hanukkah eve', 16, 'hanukkah'],
  ['2027-12-25', 'winter+hanukkah', 12, 'hanukkah'], ['2027-12-26', 'winter+hanukkah', 12, 'hanukkah'],
  ['2027-12-31', 'new-year+hanukkah', 12, 'hanukkah'], ['2028-01-01', 'new-year+hanukkah', 12, 'hanukkah'],
  ['2028-12-20', 'winter+hanukkah', 12, 'hanukkah'], ['2029-02-14', 'valentines+eid', 12, 'eid'],
  ['2030-12-20', 'winter+hanukkah eve', 12, 'winter'], ['2030-12-20', 'winter+hanukkah eve', 16, 'hanukkah'],
  ...['2030-12-21', '2030-12-22', '2030-12-23', '2030-12-24', '2030-12-25', '2030-12-26'].map(d => [d, 'winter+hanukkah', 12, 'hanukkah']),
];
const OVER = new Set(OVERLAPS.map(r => r[0]));

test('every overlap 2026-2031 is listed and resolved by the order (care > other; inside a tier the shorter span, then FW.HOLIDAYS order)', async () => {
  const found = [];
  for (const y of YEARS) {
    const S = await page.evaluate(y => window.__hol.holSpans(y - 1).concat(window.__hol.holSpans(y)), y);
    for (let d = iso(y, 1, 1); d <= iso(y, 12, 31); d = add(d, 1)) {
      const on = S.filter(s => s.a <= d && d <= s.b).map(s => s.id), eve = S.some(s => s.id === 'hanukkah' && s.a === add(d, 1));
      if (on.length > 1 || (eve && on.length)) found.push(d + ' ' + on.join('+') + (eve ? '+hanukkah eve' : ''));
    }
  }
  assert.deepEqual(found, [...new Map(OVERLAPS.map(r => [r[0], r[0] + ' ' + r[1]])).values()].sort(), 'the overlap list changed: ' + JSON.stringify(found));
  const got = await at(OVERLAPS.map(([d, , h]) => [d, h]));
  assert.deepEqual(got, OVERLAPS.map(r => r[3]), JSON.stringify(OVERLAPS.map((r, i) => [r[0], r[2], got[i]])));
  console.log('# overlaps 2026-2031: ' + OVERLAPS.map(r => `${r[0]} ${r[2]}:00 ${r[1]} -> ${r[3]}`).join('; '));
});

test('Hanukkah from 16:00 the evening before its first day (HOL_EVE) through its eighth day, every year', async () => {
  assert.equal(await page.evaluate(() => window.__hol.HOL_EVE), 16);
  for (const [a, b] of HANUKKAH) {
    const eve = add(a, -1), got = await page.evaluate(([eve, a, b]) => { const f = (s, h, mi) => { const [Y, M, D] = s.split('-').map(Number), L = window.__hol.holAt(new Date(Y, M - 1, D, h, mi), { looks: true, care: true }); return L ? L.id : ''; };
      return [f(eve, 15, 59), f(eve, 16, 0), f(eve, 23, 59), f(a, 0, 0), f(b, 23, 59), f(b.slice(0, 8) + String(+b.slice(8) + 1).padStart(2, '0'), 0, 0)]; }, [eve, a, b]);
    assert.notEqual(got[0], 'hanukkah', 'not at 15:59 on ' + eve);
    assert.deepEqual(got.slice(1, 5), ['hanukkah', 'hanukkah', 'hanukkah', 'hanukkah'], `16:00 on ${eve} to 23:59 on ${b}: ${got}`);
  }
  const ends = await at(HANUKKAH.map(r => [add(r[1], 1), 0]));
  assert.ok(ends.every(v => v !== 'hanukkah'), 'not the day after the eighth day: ' + ends);
});

test('the order: care holidays > birthday > race day > (KOM Kitty) > other holidays; Memorial Day weekend never a race look', async () => {
  const R = d => ({ races: [{ date: d, name: 'Kit 10K' }] });
  const got = await at([
    ['2026-11-08', 12, { birthday: '1984-11-08' }], /* Diwali and the birthday: Diwali */
    ['2026-05-25', 12, Object.assign({ birthday: '1990-05-25' }, R('2026-05-25'))], /* Memorial Day, a birthday and a race: Memorial Day */
    ['2026-10-31', 12, { birthday: '1984-10-31' }], /* Halloween and the birthday: the birthday */
    ['2026-10-31', 12, R('2026-10-31')], /* Halloween and a race: race day */
    ['2026-10-31', 12, Object.assign({ birthday: '1984-10-31' }, R('2026-10-31'))], /* all three: the birthday */
    ['2026-07-04', 12, R('2026-07-04')], /* the 4th of July (and the Tour) and a race: race day */
    ['2026-05-23', 12, R('2026-05-23')], ['2026-05-24', 12, R('2026-05-24')], ['2026-05-25', 12, R('2026-05-25')], /* Memorial Day weekend: no race look */
    ['2026-05-22', 12, R('2026-05-22')], ['2026-05-26', 12, R('2026-05-26')], /* the Friday before and the Tuesday after: race day */
    ['2026-05-23', 12, Object.assign({ birthday: '1990-05-23' }, R('2026-05-23'))], /* the weekend's birthday still shows */
    ['2026-11-12', 12, R('2026-11-12')], /* a plain day with a race */
    ['2026-11-12', 12, { races: [{ date: '2026-11-13' }, { date: '2026-11-11' }] }], /* races on other days: none */
    ['2027-05-30', 12, R('2027-05-30')], ['2027-05-29', 12, R('2027-05-29')], ['2027-05-31', 12, R('2027-05-31')], ['2027-05-28', 12, R('2027-05-28')],
  ]);
  assert.deepEqual(got, ['diwali', 'memorial-day', 'birthday', 'race-day', 'birthday', 'race-day', '', '', 'memorial-day', 'race-day', 'race-day', 'birthday', 'race-day', '', '', '', 'memorial-day', 'race-day']);
});

test('the birthday: its month and day; Feb 29 on Feb 29 in a leap year and Feb 28 in others; nothing when empty or malformed', async () => {
  const B = b => ({ birthday: b });
  const got = await at([
    ['2026-09-14', 12, B('1980-09-14')], ['2026-09-13', 12, B('1980-09-14')], ['2026-09-15', 12, B('1980-09-14')],
    ['2027-02-28', 12, B('1988-02-29')], ['2027-03-01', 12, B('1988-02-29')], ['2028-02-28', 12, B('1988-02-29')], ['2028-02-29', 12, B('1988-02-29')],
    ['2100-02-28', 12, B('1988-02-29')], ['2000-02-29', 12, B('1988-02-29')], ['2000-02-28', 12, B('1988-02-29')],
    ['2027-02-28', 12, B('1990-02-28')], ['2028-02-28', 12, B('1990-02-28')], ['2028-02-29', 12, B('1990-02-28')],
    ['2026-09-14', 12, B('')], ['2026-09-14', 12, {}], ['2026-09-14', 12, B('09-14')], ['2026-09-14', 12, B('1980-9-14')],
    ['2026-09-14', 0, B('1980-09-14')], ['2026-09-14', 23, B('1980-09-14')],
  ]);
  assert.deepEqual(got, ['birthday', '', '', 'birthday', '', '', 'birthday', 'birthday', 'birthday', '', 'birthday', 'birthday', '', '', '', '', '', 'birthday', 'birthday']);
});

test('the switches: Holiday looks off: no look at all; Cultural and religious holidays off: no Hanukkah, Diwali, Lunar New Year or Eid (Memorial Day stays)', async () => {
  const off = { looks: false }, noCare = { care: false };
  const got = await at([
    ['2026-10-31', 12, off], ['2026-11-08', 12, off], ['2026-05-25', 12, off], ['2026-09-14', 12, Object.assign({ birthday: '1980-09-14' }, off)], ['2026-11-12', 12, Object.assign({ races: [{ date: '2026-11-12' }] }, off)],
    ['2026-11-08', 12, noCare], ['2026-12-06', 12, noCare], ['2027-02-06', 12, noCare], ['2026-03-20', 12, noCare], ['2026-05-27', 12, noCare], ['2026-05-25', 12, noCare],
    ['2027-12-25', 12, noCare], ['2028-01-01', 12, noCare], ['2029-02-14', 12, noCare], ['2026-10-31', 12, noCare], ['2027-12-24', 17, noCare],
  ]);
  assert.deepEqual(got, ['', '', '', '', '', '', '', '', '', '', 'memorial-day', 'winter', 'new-year', 'valentines', 'halloween', 'winter']);
  const F = await page.evaluate(() => window.__hol.HOL_FAITH);
  assert.deepEqual(F.slice().sort(), ['diwali', 'eid', 'hanukkah', 'lunar-new-year']);
});

test('the looks are FW.HOLIDAYS entries: every id it names (Kona, the Indy 500 and the Tour mountains left out, the milestone item 104s), one Halloween; each with a line', async () => {
  const r = await page.evaluate(() => ({ ids: FW.HOLIDAYS.flatMap(g => g[1]).map(h => h.id), care: FW.HOLIDAYS.flatMap(g => g[1]).filter(h => h.care).map(h => h.id), line: window.__hol.HOL_LINE }));
  for (const id of [...IDS, 'birthday', 'race-day']) { assert.ok(r.ids.includes(id), 'FW.HOLIDAYS has ' + id); assert.ok(r.line[id] && /^[A-Z]/.test(r.line[id]), 'a line for ' + id); }
  assert.deepEqual(r.care.slice().sort(), ['diwali', 'eid', 'hanukkah', 'lunar-new-year', 'memorial-day']);
  assert.deepEqual(Object.keys(r.line).sort(), [...IDS, 'birthday', 'race-day'].sort());
  assert.equal(r.line['memorial-day'], 'Memorial Day');
  assert.equal(r.ids.filter(i => /halloween/.test(i)).length, 1);
  for (const id of ['tour-mountains', 'kona', 'indy-500', 'milestone']) assert.ok(!(id in r.line), id + ' left out');
});

test('no page errors', () => { assert.deepEqual(errors, []); });
