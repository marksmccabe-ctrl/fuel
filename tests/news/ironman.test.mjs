// node --test 'tests/news/*.test.mjs' — item 53: the IRONMAN Pro Series standings and the race calendar from ironman.com (approved by IRONMAN,
// docs/LEGAL.md). The parsers on saved copies of the two pages (tests/fixtures/ironman, made-up athletes and races); only the two pages are
// ever requested (the allow-list, redirects and link checks included); only in GitHub Actions; once a day (the standings: race weeks and
// the results runs); an error or a block stops and keeps the last good copy; the calendar never duplicates data/pro-races.json; the
// attribution travels with the data; none of it reaches the AI.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {IM_PAGES, IM_ALLOW, IM_ATTR, imAllowed, imBlocked, imProblems, parseStandings, parseCalendar, outline, sameRace, raceWeek, imDue, emptyIm, dateIn, sexOf} from '../../scripts/news/lib/ironman.mjs';
import {Fetcher, UA} from '../../scripts/news/lib/fetch.mjs';
import {validate, checkRefs} from '../../scripts/news/lib/schema.mjs';
import {run, emptyDoc} from '../../scripts/news/build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FX = f => fs.readFileSync(path.join(ROOT, 'tests/fixtures/ironman', f), 'utf8');
const SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/news.schema.json'), 'utf8'));
const SOURCES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/sources.json'), 'utf8'));
const TUE = Date.parse('2026-10-06T10:05:00Z'); // the week of the IRONMAN World Championship (Sat Oct 10): a race week
const GH = {GITHUB_ACTIONS: 'true'};
const KONA = {series: 'IRONMAN', name: 'IRONMAN World Championship', date: '2026-10-10', place: 'Kailua-Kona, Hawaiʻi', country: 'USA', tz: 'Pacific/Honolulu', note: 'Men and women race the same day',
  official_url: ['https://www.ironman.com/races/im-world-championship'], start_lists: ['https://www.ironman.com/races/im-world-championship']};
const HARBOR = {series: 'T100', name: 'Harbor T100', date: '2026-10-11', place: 'Harbor City', official_url: 'https://t100.example/harbor'};

// ---------- (1) the parsers, on the saved copies ----------
test('standings: a table per sex (tab panels) and the page\'s JSON give rank, athlete, country, points and races counted, women and men', () => {
  const t = parseStandings(FX('standings-tables.html'));
  assert.equal(t.error, undefined); assert.equal(t.F.length, 11); assert.equal(t.M.length, 12);
  assert.deepEqual(t.F[0], {rank: 1, name: 'Sable Nyhavn', country: 'DEN', points: 19020, races: 4});
  assert.deepEqual(t.F[2], {rank: 3, name: 'Lucía Ferrandi', country: 'ESP', points: 17415, races: 3}, 'accents kept');
  assert.deepEqual(t.M[3], {rank: 4, name: 'Kenji Ardent', country: 'JPN', points: 15377.5, races: 4}, 'decimal points; the flag image\'s alt text is the country');
  assert.deepEqual(t.M[2].country, 'FRA', 'a country written as text');
  assert.deepEqual(t.M.map(r => r.rank), Array.from({length: 12}, (_, i) => i + 1));
  const j = parseStandings(FX('standings-next.html'));
  assert.deepEqual([j.F.length, j.M.length], [5, 4]);
  assert.deepEqual(j.F[0], {rank: 1, name: 'Sable Nyhavn', country: 'DEN', points: 19020, races: 4}, 'the sex from the group around the athletes');
  assert.deepEqual(j.M[3], {rank: 4, name: 'Kenji Ardent', country: 'JPN', points: 15377.5, races: 4});
});
test('calendar: race cards and JSON-LD give every upcoming IRONMAN and 70.3 race: name, date, place, series flags, the official race page', () => {
  const now = TUE, c = parseCalendar(FX('races-cards.html'), {now});
  assert.equal(c.error, undefined);
  assert.deepEqual(c.races.map(r => [r.series, r.name, r.date]), [['70.3', 'IRONMAN 70.3 Riverbend', '2026-10-03'], ['IRONMAN', 'IRONMAN World Championship', '2026-10-10'], ['70.3', 'IRONMAN 70.3 Zedport', '2026-10-11'],
    ['IRONMAN', 'IRONMAN Florinda', '2026-11-07'], ['70.3', 'IRONMAN 70.3 World Championship', '2026-11-14'], ['IRONMAN', 'IRONMAN Lone Mesa', '2027-04-24'], ['IRONMAN', 'IRONMAN Asia-Pacific Championship Cairnsville', '2027-06-13']],
    'by date; 5150 is not IRONMAN or 70.3; a race a month past is gone (the last 14 days stay for Last weekend); the promo without a date is not a race');
  const kona = c.races[1];
  assert.deepEqual(kona, {series: 'IRONMAN', name: 'IRONMAN World Championship', date: '2026-10-10', place: 'Kailua-Kona, Hawaiʻi, USA', flags: ['Pro Series', 'World Championship'], url: 'https://www.ironman.com/races/im-world-championship'});
  assert.deepEqual(c.races[6].flags, ['Pro Series', 'Regional Championship']); assert.equal(c.races[2].flags, undefined, 'no flags: none written');
  assert.equal(c.races.find(r => /Florinda/.test(r.name)).url, 'https://www.ironman.com/races/im-florinda', 'a relative link made absolute on ironman.com');
  const j = parseCalendar(FX('races-jsonld.html'), {now});
  assert.deepEqual(j.races.map(r => r.name), ['IRONMAN World Championship', 'IRONMAN 70.3 Zedport', 'IRONMAN Florinda', 'IRONMAN 70.3 World Championship', 'IRONMAN Lone Mesa']);
  assert.deepEqual(j.races[0], kona, 'the same facts from either form');
  assert.deepEqual(j.races[2].flags, ['Pro Series'], 'the Pro Series named by the event\'s series');
  assert.equal(dateIn('Nov 14–15, 2026'), '2026-11-14'); assert.equal(dateIn('14 Nov 2026'), '2026-11-14'); assert.equal(dateIn('11/14/2026'), null, 'numeric dates are not guessed');
  assert.equal(sexOf('panel-women'), 'F'); assert.equal(sexOf('m-4 tab'), null, 'a lone letter is not a sex'); assert.equal(sexOf('Men and Women'), null);
});
test('a page that is not recognised (changed, empty, another page): an error and an outline of its make-up, never its words', () => {
  const s = parseStandings('<html><body><h1>Our new look</h1><p>Secret words Anna Keller</p><table><tr><td>x</td></tr></table></body></html>');
  assert.match(s.error, /not recognised/); assert.match(s.outline, /1 tables/); assert.doesNotMatch(s.outline, /Secret|Anna|new look/);
  const c = parseCalendar(FX('standings-tables.html'), {now: TUE}); assert.match(c.error, /fewer than 5 upcoming/);
  assert.doesNotMatch(outline(FX('standings-tables.html')), /Nyhavn|Vale/);
  const half = FX('standings-tables.html').replace(/<div id="panel-women"[\s\S]*<\/div>\s*<\/main>/, '</main>');
  assert.match(parseStandings(half).error, /not recognised/, 'one sex missing: not taken (the last good copy stays)');
});
test('errors and blocks: HTTP errors, 401 / 403 / 429, a bot-check page, robots.txt, no answer', () => {
  assert.equal(imBlocked({status: 200, body: '<title>Standings</title>'}), '');
  assert.equal(imBlocked({status: 403, body: ''}), 'HTTP 403 (blocked)'); assert.equal(imBlocked({status: 429}), 'HTTP 429 (blocked)'); assert.equal(imBlocked({status: 503}), 'HTTP 503');
  assert.equal(imBlocked({status: 404}), 'HTTP 404'); assert.match(imBlocked({status: 200, body: '<html><head><title>Just a moment...</title></head></html>'}), /bot check/);
  assert.match(imBlocked({status: 200, body: '<script src="/cdn-cgi/challenge-platform/x.js"></script>'}), /blocked/);
  assert.equal(imBlocked({refused: true, status: 0}), 'robots.txt says no'); assert.equal(imBlocked({status: 0, error: 'ECONNRESET'}), 'ECONNRESET');
});

// ---------- (2) the allow-list ----------
test('the allow-list: the standings page (and its season redirect), the race calendar and robots.txt; nothing else on ironman.com', () => {
  for (const u of ['https://www.ironman.com/proseries/standings', 'https://www.ironman.com/proseries/standings/', 'https://www.ironman.com/proseries/standings/2026', 'https://www.ironman.com/races', 'https://www.ironman.com/races/', 'https://www.ironman.com/robots.txt', IM_PAGES.standings, IM_PAGES.calendar])
    assert.ok(imAllowed(u), u);
  for (const u of ['https://www.ironman.com/', 'https://www.ironman.com/races/im-world-championship', 'https://www.ironman.com/races?page=2', 'https://www.ironman.com/proseries/standings?sex=f', 'https://www.ironman.com/proseries/standings/2026/women',
    'https://www.ironman.com/pro-athletes/orrin-vale', 'https://www.ironman.com/news/x', 'https://proseries.ironman.com/', 'https://ironman.com/races', 'http://www.ironman.com/races', 'https://www.ironman.com:8443/races', 'https://www.ironman.com/results/x',
    'https://www.ironman.com/races#top', 'https://user@www.ironman.com/races', 'https://www.ironman.com.evil.example/races', 'https://www.ironman.com/im-world-championship'])
    assert.ok(!imAllowed(u), u);
  assert.equal(IM_ALLOW.length, 3, 'robots.txt + the two approved pages');
});
test('the fetcher refuses every other ironman.com URL before any request (reading, link checks, robots, JSON), and follows a redirect only to an approved page', async () => {
  const calls = [];
  const fetchImpl = async (u, o = {}) => { calls.push(u);
    if (u.endsWith('/robots.txt')) return new Response('User-agent: *\nAllow: /');
    if (u === 'https://www.ironman.com/proseries/standings') return new Response('', {status: 301, headers: {location: '/proseries/standings/2026'}});
    if (u === 'https://www.ironman.com/races') return new Response('', {status: 302, headers: {location: 'https://www.ironman.com/races/im-world-championship'}});
    return new Response('<title>page</title>'); };
  const f = new Fetcher({fetchImpl});
  const s = await f.get(IM_PAGES.standings, {store: false});
  assert.equal(s.status, 200); assert.equal(s.url, 'https://www.ironman.com/proseries/standings/2026', 'the season redirect is followed (it is on the list)');
  const c = await f.get(IM_PAGES.calendar, {store: false});
  assert.ok(c.refused && /redirected to https:\/\/www\.ironman\.com\/races\/im-world-championship/.test(c.error), 'a redirect off the list is not followed');
  for (const u of ['https://www.ironman.com/races/im-world-championship', 'https://proseries.ironman.com/standings', 'https://www.ironman.com/news/x']) {
    assert.ok((await f.get(u)).refused, u); assert.ok((await f.get(u, {linkCheck: true})).refused, u + ' (link check)'); assert.equal((await f.json(u)).ok, false, u + ' (JSON)'); }
  const im = calls.filter(u => /ironman\.com/.test(u));
  assert.deepEqual([...new Set(im)].sort(), ['https://www.ironman.com/proseries/standings', 'https://www.ironman.com/proseries/standings/2026', 'https://www.ironman.com/races', 'https://www.ironman.com/robots.txt']);
  assert.match(UA, /^fred-news \(\+https:\/\/fuel\.bluebirdmultisport\.com; hello@flipturncreative\.com\)$/, 'the User-Agent names fred and a contact email');
});

// ---------- (3) end to end (all network mocked) ----------
function tmpRoot({news, im, cal = [KONA, HARBOR], sources} = {}) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'fred-im-')); fs.mkdirSync(path.join(d, 'data'));
  fs.copyFileSync(path.join(ROOT, 'data/news.schema.json'), path.join(d, 'data/news.schema.json'));
  const src = sources || JSON.parse(JSON.stringify(SOURCES)); if (!sources) { src.sources = src.sources.filter(s => s.id === 'tri247'); src.sources.forEach(s => { s.enabled = true; s.feeds = ['https://feeds.example/tri.xml']; delete s.site; }); }
  fs.writeFileSync(path.join(d, 'data/sources.json'), JSON.stringify(src));
  fs.writeFileSync(path.join(d, 'data/pro-races.json'), JSON.stringify({about: 'test', races: cal}));
  if (news) fs.writeFileSync(path.join(d, 'data/news.json'), JSON.stringify(news));
  if (im) fs.writeFileSync(path.join(d, 'data/ironman.json'), JSON.stringify(im));
  return d;
}
const FEED = `<rss><channel><title>t</title>
<item><title>Kona preview: who wins the World Championship</title><link>https://www.tri247.com/kona-preview</link><pubDate>Mon, 05 Oct 2026 08:00:00 GMT</pubDate><description>Preview.</description></item>
<item><title>IRONMAN news on ironman.com</title><link>https://www.ironman.com/news/some-story</link><pubDate>Mon, 05 Oct 2026 09:00:00 GMT</pubDate><description>x</description></item>
</channel></rss>`;
function net({pages = {}, model} = {}) {
  const log = [];
  const f = async (u, o = {}) => {
    u = String(u); log.push(u);
    const R = (b, s = 200, h) => new Response(typeof b === 'string' ? b : JSON.stringify(b), {status: s, headers: h});
    if (u.startsWith('https://api.anthropic.com/')) { const b = JSON.parse(o.body); return R({content: [{type: 'text', text: model ? model(b) : 'NONE'}]}); }
    if (u in pages) { const p = pages[u]; return typeof p === 'function' ? p() : R(p); }
    if (u.endsWith('/robots.txt')) return R('User-agent: *\nAllow: /');
    if (u === 'https://feeds.example/tri.xml') return R(FEED);
    return R(`<html><article><p>Page ${u}</p></article></html>`);
  };
  return {f, log};
}
const PAGES = {[IM_PAGES.standings]: FX('standings-tables.html'), [IM_PAGES.calendar]: FX('races-cards.html')};
const imUrls = log => log.filter(u => /(^|\.)ironman\.com/.test(new URL(u).hostname));
const go = (d, n, o = {}) => run(Object.assign({job: 'daily', root: d, now: TUE, fetchImpl: n.f, env: Object.assign({NEWS_CACHE_DIR: path.join(d, '.c')}, GH), log: () => {}}, o));
const readJ = (d, f) => JSON.parse(fs.readFileSync(path.join(d, 'data', f), 'utf8'));

test('the daily job in GitHub Actions reads both pages once, merges them into news.json, writes the last good copy (data/ironman.json)', async () => {
  const d = tmpRoot(), n = net({pages: PAGES}), logs = [];
  const r = await go(d, n, {log: m => logs.push(m)});
  assert.deepEqual(r.problems, []); assert.equal(r.imChanged, true);
  assert.deepEqual(imUrls(n.log), ['https://www.ironman.com/robots.txt', IM_PAGES.calendar, IM_PAGES.standings], 'robots.txt, then each page once; nothing else on ironman.com (not the feed\'s ironman.com article, not Kona\'s race page link)');
  const im = readJ(d, 'ironman.json'); assert.deepEqual(imProblems(im), []);
  assert.equal(im.standings.F.length, 11); assert.equal(im.calendar.races.length, 7); assert.equal(im.attempts.calendar.ok, true); assert.equal(im.attempts.standings.at, '2026-10-06T10:05:00Z');
  const doc = readJ(d, 'news.json'); assert.deepEqual([...validate(SCHEMA, doc), ...checkRefs(doc)], []);
  // standings: the full table, both sexes, with the attribution
  const ps = sx => doc.standings.filter(s => s.series === 'Pro Series' && s.sex === sx).sort((a, b) => a.rank - b.rank);
  assert.equal(ps('F').length, 11); assert.equal(ps('M').length, 12);
  assert.deepEqual(ps('F')[0], {series: 'Pro Series', sex: 'F', rank: 1, pro_id: 'sable-nyhavn', source: 'official', points: 19020, races: 4, country: 'DEN'});
  assert.deepEqual(doc.standings_info['Pro Series'], {F: {updated: '2026-10-06', source: 'IRONMAN Pro Series'}, M: {updated: '2026-10-06', source: 'IRONMAN Pro Series'}}, 'attribution: IRONMAN Pro Series, updated {date}');
  assert.equal(doc.pros.find(p => p.id === 'sable-nyhavn').country, 'DEN');
  // the calendar: every upcoming race in the race list, flagged, linked, marked as ironman.com's
  const kona = doc.races.filter(x => x.date === '2026-10-10' && x.series === 'IRONMAN');
  assert.equal(kona.length, 1, 'one Kona: the hand-typed entry is not a second race');
  assert.deepEqual([kona[0].src, kona[0].flags, kona[0].official_url, kona[0].place], ['ironman.com', ['Pro Series', 'World Championship'], 'https://www.ironman.com/races/im-world-championship', 'Kailua-Kona, Hawaiʻi, USA']);
  assert.ok(logs.some(l => /pro-races\.json: IRONMAN World Championship \(2026-10-10\) is on ironman\.com's calendar/.test(l)), 'the duplicate is named in the log');
  assert.ok(doc.races.some(x => x.name === 'Harbor T100' && !x.src), 'the hand-typed T100 race stays');
  for (const name of ['IRONMAN 70.3 Riverbend', 'IRONMAN 70.3 Zedport', 'IRONMAN Florinda', 'IRONMAN Lone Mesa']) assert.ok(doc.races.some(x => x.name === name && x.src === 'ironman.com'), name);
  assert.ok(logs.some(l => /^ironman\.com standings: women 11 · men 12/.test(l)) && logs.some(l => /^ironman\.com calendar: 7 races · 4 Pro Series/.test(l)));
});
test('only in GitHub Actions: a run anywhere else never asks ironman.com (and keeps what is stored)', async () => {
  const d = tmpRoot(), n = net({pages: PAGES}), logs = [];
  const r = await go(d, n, {env: {NEWS_CACHE_DIR: path.join(d, '.c')}, log: m => logs.push(m)});
  assert.deepEqual(r.problems, []); assert.deepEqual(imUrls(n.log), []); assert.equal(r.imChanged, false);
  assert.ok(logs.some(l => /ironman\.com: not read here \(only the GitHub Actions news jobs read it\)/.test(l)));
});
test('once a day: the calendar once per day; the standings once per day in a race week and on every results run; never in other jobs', async () => {
  const d = tmpRoot();
  let n = net({pages: PAGES}); await go(d, n); assert.equal(imUrls(n.log).filter(u => u !== 'https://www.ironman.com/robots.txt').length, 2, 'the first run of the day: both');
  n = net({pages: PAGES}); await go(d, n, {now: Date.parse('2026-10-06T22:05:00Z')}); assert.deepEqual(imUrls(n.log), [], 'the evening run: not again the same day');
  n = net({pages: PAGES}); await go(d, n, {now: Date.parse('2026-10-07T10:05:00Z')}); assert.deepEqual(imUrls(n.log).filter(u => !/robots/.test(u)), [IM_PAGES.calendar, IM_PAGES.standings], 'the next day, still the race week: both');
  // a week with no Pro Series race: the calendar only
  n = net({pages: PAGES}); await go(d, n, {now: Date.parse('2026-10-20T10:05:00Z')}); assert.deepEqual(imUrls(n.log).filter(u => !/robots/.test(u)), [IM_PAGES.calendar], 'not a race week: no standings');
  // the results run (Sunday night, Monday morning): the standings, never the calendar
  n = net({pages: PAGES}); await go(d, n, {job: 'results', now: Date.parse('2026-10-26T01:05:00Z')}); assert.deepEqual(imUrls(n.log).filter(u => !/robots/.test(u)), [IM_PAGES.standings], 'Sunday 21:00 ET');
  n = net({pages: PAGES}); await go(d, n, {job: 'results', now: Date.parse('2026-10-26T10:05:00Z')}); assert.deepEqual(imUrls(n.log).filter(u => !/robots/.test(u)), [IM_PAGES.standings], 'Monday 6:00 ET');
  n = net({pages: PAGES}); await go(d, n, {job: 'results', now: Date.parse('2026-10-26T11:05:00Z')}); assert.deepEqual(imUrls(n.log), [], 'an hour later: not again');
  for (const job of ['weekend', 'pros', 'calendar']) { n = net({pages: PAGES}); await go(d, n, {job, now: Date.parse('2026-10-29T10:05:00Z')}); assert.deepEqual(imUrls(n.log), [], job); }
  // "all" (daily twice, results, pros): each page once
  const d2 = tmpRoot(); n = net({pages: PAGES}); await go(d2, n, {job: 'all'}); assert.deepEqual(imUrls(n.log).filter(u => !/robots/.test(u)), [IM_PAGES.calendar, IM_PAGES.standings]);
  assert.ok(raceWeek(TUE, [{series: 'IRONMAN', date: '2026-10-10', flags: ['World Championship']}]) && !raceWeek(TUE, [{series: 'IRONMAN', date: '2026-10-12', flags: ['Pro Series']}]) && !raceWeek(TUE, [{series: 'IRONMAN', date: '2026-10-10'}]), 'Monday–Sunday, Pro Series or World Championship races only');
  assert.equal(imDue('calendar', 'results', {now: TUE, im: emptyIm(), races: []}), false);
});
test('a failure or a block stops ironman.com for the run and keeps the last good copy (in ironman.json and in news.json)', async () => {
  // the last good copy, from Monday
  const d = tmpRoot(); let n = net({pages: PAGES}); await go(d, n, {now: Date.parse('2026-10-05T10:05:00Z')});
  const good = readJ(d, 'ironman.json');
  for (const [what, page, re] of [['403', () => new Response('denied', {status: 403}), /HTTP 403 \(blocked\)/], ['bot check', () => new Response('<title>Just a moment...</title>'), /bot check/],
    ['503', () => new Response('busy', {status: 503}), /HTTP 503/], ['no answer', () => { throw new Error('ECONNRESET'); }, /ECONNRESET/], ['a changed page', () => new Response('<html><h1>New site</h1></html>'), /not recognised/]]) {
    fs.writeFileSync(path.join(d, 'data/ironman.json'), JSON.stringify(good));
    const logs = []; n = net({pages: {[IM_PAGES.calendar]: page, [IM_PAGES.standings]: FX('standings-tables.html')}});
    const r = await go(d, n, {log: m => logs.push(m)}); assert.deepEqual(r.problems, [], what);
    assert.ok(!n.log.includes(IM_PAGES.standings), `${what}: stopped, the standings were not asked for in that run`);
    const im = readJ(d, 'ironman.json');
    assert.deepEqual(im.calendar, good.calendar, `${what}: the calendar's last good copy stays`); assert.deepEqual(im.standings, good.standings, `${what}: the standings stay`);
    assert.equal(im.attempts.calendar.ok, false); assert.match(im.attempts.calendar.error, re); assert.equal(im.attempts.calendar.at, '2026-10-06T10:05:00Z', `${what}: the attempt is recorded (once a day holds)`);
    assert.ok(logs.some(l => /^ironman\.com calendar: STOPPED · .* the last good copy stays \(from 2026-10-05T10:05:00Z\)/.test(l)), `${what}: logged`);
    const doc = readJ(d, 'news.json'); assert.ok(doc.races.some(x => x.name === 'IRONMAN Florinda' && x.src === 'ironman.com'), `${what}: news.json keeps serving the last good calendar`);
    assert.equal(doc.standings.filter(s => s.series === 'Pro Series').length, 23, `${what}: and the standings`);
  }
  // robots.txt saying no is a block too
  fs.writeFileSync(path.join(d, 'data/ironman.json'), JSON.stringify(good)); n = net({pages: {'https://www.ironman.com/robots.txt': 'User-agent: *\nDisallow: /races'}});
  await go(d, n); assert.equal(readJ(d, 'ironman.json').attempts.calendar.error, 'robots.txt says no'); assert.ok(!n.log.includes(IM_PAGES.calendar));
  // a file that fails its check is never written, and a broken stored file is not trusted
  assert.ok(imProblems(Object.assign({}, good, {extra: 1})).length); assert.ok(imProblems(Object.assign({}, good, {calendar: {fetched: good.calendar.fetched, url: 'https://evil.example/', races: []}})).length);
});
test('a race ironman.com stops listing is gone from today on (moved or cancelled); past races stay for Last weekend', async () => {
  const d = tmpRoot(); let n = net({pages: PAGES}); await go(d, n);
  const fewer = FX('races-cards.html').replace(/<li class="race-card">\s*<a class="race-card__link" href="\/races\/im-florinda">[\s\S]*?<\/ul>\s*<\/li>/, '');
  assert.ok(!fewer.includes('im-florinda'));
  n = net({pages: {[IM_PAGES.calendar]: fewer, [IM_PAGES.standings]: FX('standings-tables.html')}}); const r = await go(d, n, {now: Date.parse('2026-10-07T10:05:00Z')});
  assert.ok(!r.doc.races.some(x => x.name === 'IRONMAN Florinda'), 'no longer listed: removed'); assert.ok(r.doc.races.some(x => x.name === 'IRONMAN 70.3 Riverbend'), 'a past race stays');
});
test('pro-races.json keeps only hand-typed T100 and other races: never a race on ironman.com\'s calendar (name + date)', () => {
  const cal = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/pro-races.json'), 'utf8')).races, im = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ironman.json'), 'utf8'));
  assert.deepEqual(imProblems(im), []);
  for (const c of cal) assert.ok(!((im.calendar && im.calendar.races) || []).some(x => sameRace(x, c)), `${c.name} (${c.date}) is on ironman.com's calendar: remove it from pro-races.json`);
  assert.ok(sameRace({series: 'IRONMAN', name: 'IRONMAN World Championship', date: '2026-10-10'}, {series: 'IRONMAN', name: 'IRONMAN World Championship Kona', date: '2026-10-10'}));
  assert.ok(!sameRace({series: 'IRONMAN', name: 'IRONMAN World Championship', date: '2026-10-10'}, {series: 'IRONMAN', name: 'IRONMAN World Championship', date: '2026-10-11'}), 'another date: another race');
  assert.ok(!sameRace({series: '70.3', name: 'IRONMAN 70.3 Lake', date: '2026-10-10'}, {series: '70.3', name: 'IRONMAN 70.3 Lakeside', date: '2026-10-10'}), 'whole words only');
  assert.ok(!sameRace({series: 'IRONMAN', name: 'IRONMAN Florinda', date: '2026-11-07'}, {series: 'T100', name: 'Florinda T100', date: '2026-11-07'}), 'another series');
});
test('attribution: news.json marks every ironman.com fact (standings source "IRONMAN Pro Series", races src "ironman.com"); the app shows it with the official links', async () => {
  const d = tmpRoot(), r = await go(d, net({pages: PAGES}));
  assert.ok(r.doc.standings.filter(s => s.series === 'Pro Series').every(s => s.source === 'official'));
  assert.ok(Object.values(r.doc.standings_info['Pro Series']).every(x => x.source === IM_ATTR.standings.label));
  assert.ok(r.doc.races.filter(x => x.series === 'IRONMAN' || x.series === '70.3').every(x => x.src === 'ironman.com'));
  const app = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(app, /Standings: IRONMAN Pro Series/); assert.ok(app.includes(IM_PAGES.standings) && app.includes(IM_PAGES.calendar), 'the official links');
  assert.match(app, /Race calendar: IRONMAN/);
});
test('never to the AI: no prompt carries an ironman.com athlete, race name or place; the Pro Series is never extracted from reports', async () => {
  const prompts = [], model = b => { prompts.push(b.system + '\n' + b.messages.map(m => m.content).join('\n'));
    if (/story/.test(b.system)) return JSON.stringify({lines: []}); if (/preview/.test(b.system)) return JSON.stringify({races: []}); return 'NONE'; };
  // last weekend's ironman.com race with a recap that does not name it; the full standings table
  const prev = emptyDoc(TUE); prev.items.push({id: 'tri247-recap', section: 'commentary', kind: 'recap', type: 'article', source: 'Tri247', source_id: 'tri247', title: 'A long day in the heat', url: 'https://www.tri247.com/recap', date: '2026-10-04', race_ids: ['70-3-riverbend-2026']});
  prev.races.push({id: '70-3-riverbend-2026', series: '70.3', name: 'IRONMAN 70.3 Riverbend', date: '2026-10-03', confirmed: true, src: 'ironman.com', place: 'Riverbend, Oregon, USA'});
  const d = tmpRoot({news: prev}), n = net({pages: PAGES, model});
  const r = await go(d, n, {job: 'all', env: Object.assign({NEWS_CACHE_DIR: path.join(d, '.c'), ANTHROPIC_API_KEY: 'test'}, GH)});
  assert.deepEqual(r.problems, []); assert.ok(prompts.length > 0, 'the AI was used for the feeds');
  const im = r.im, words = [...im.standings.F, ...im.standings.M].map(x => x.name).concat(im.calendar.races.flatMap(x => [x.name, x.place]).filter(x => x && !/^IRONMAN( 70\.3)?$/.test(x)));
  for (const w of words) assert.ok(!prompts.some(p => p.includes(w)), `"${w}" went to the AI`);
  assert.ok(prompts.some(p => /^Race: the race$/m.test(p)), 'the story of an ironman.com race is asked as "the race"');
  assert.ok(!prompts.some(p => /IRONMAN Pro Series/.test(p) && /SERIES STANDINGS/.test(p)), 'no Pro Series standings extraction');
});
test('the files: data/ironman.json passes its check; news.json with the ironman.com facts passes the schema and stays under ~400 KB', async () => {
  assert.deepEqual(imProblems(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ironman.json'), 'utf8'))), []);
  const d = tmpRoot({news: JSON.parse(fs.readFileSync(path.join(ROOT, 'data/news.json'), 'utf8'))}), r = await go(d, net({pages: PAGES}));
  assert.deepEqual(r.problems, []); assert.ok(Buffer.byteLength(JSON.stringify(r.doc)) < 400 * 1024);
  const bad = JSON.parse(JSON.stringify(r.doc)); bad.races.find(x => x.src).flags = ['Fastest course']; assert.ok(validate(SCHEMA, bad).some(x => /flags/.test(x)));
  const bad2 = JSON.parse(JSON.stringify(r.doc)); bad2.races.find(x => x.src).src = 'elsewhere.com'; assert.ok(validate(SCHEMA, bad2).some(x => /src/.test(x)));
});
