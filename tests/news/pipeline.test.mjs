// node --test 'tests/news/*.test.mjs' — the News pipeline (item 16): feeds, polite fetching, the schema, the confidence rule, the In short contract,
// name matching, the World Triathlon API (mocked), the no-key fallbacks, and the failure path that keeps the last good file.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseFeed, discoverFeeds, timestampFor, durationMin, text} from '../../scripts/news/lib/feed.mjs';
import {robotsRules, Fetcher, UA} from '../../scripts/news/lib/fetch.mjs';
import {validate, checkRefs} from '../../scripts/news/lib/schema.mjs';
import {confirmResults} from '../../scripts/news/lib/confidence.mjs';
import {inShortProblems, inShort, makeModel, checkExtraction, MODEL} from '../../scripts/news/lib/ai.mjs';
import {matchPros, matchRaces, classify, slug} from '../../scripts/news/lib/match.mjs';
import {resultRows, programStart, eventToRace, sexOfProgram, hms} from '../../scripts/news/lib/wt.mjs';
import {run, prune, emptyDoc, LIMITS} from '../../scripts/news/build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FX = f => fs.readFileSync(path.join(ROOT, 'tests/fixtures', f), 'utf8');
const SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/news.schema.json'), 'utf8'));
const FIXTURE = JSON.parse(FX('news.fixture.json'));
const NOW = Date.parse('2026-10-01T12:00:00Z');

// ---------- feeds ----------
test('RSS: CDATA, entities, content:encoded words, dates; descriptions are text only', () => {
  const f = parseFeed(FX('feeds/rss-tri247.xml'));
  assert.equal(f.title, 'TRI247 (sample)');
  const a = f.items[0];
  assert.equal(a.title, 'Northbay T100 results: Lind & Berg win');
  assert.equal(a.url, 'https://www.tri247.com/sample/northbay-t100-results');
  assert.equal(a.published, '2026-09-27T18:30:00Z');
  assert.match(a.description, /men’s race in 1:41:10/); assert.doesNotMatch(a.description, /<p>/);
  assert.ok(a.words > 30); assert.deepEqual(a.categories, ['T100']);
  assert.equal(f.items.length, 4);
});
test('Atom: the alternate link, escaped HTML summaries, published/updated', () => {
  const f = parseFeed(FX('feeds/atom-slowtwitch.xml'));
  assert.equal(f.items[0].url, 'https://www.slowtwitch.com/sample/berg-northbay');
  assert.equal(f.items[0].description, 'Jonas Berg attacked on the final bike lap at Northbay and held a 15-second gap to the finish.');
  assert.equal(f.items[1].published, '2026-10-01T08:00:00Z');
});
test('podcasts: duration (h:mm:ss and seconds), a time stamp only when the notes state one next to the race', () => {
  const f = parseFeed(FX('feeds/podcast-protrinews.xml'));
  assert.equal(f.items[0].duration, 64); assert.equal(f.items[1].duration, 49);
  assert.equal(timestampFor(f.items[0].description, ['Northbay T100', 'Northbay']), '12:40');
  assert.equal(timestampFor(f.items[1].description, ['Northbay T100', 'Northbay']), null);
  assert.equal(timestampFor('[01:02:10] Kona picks', ['Kona']), '01:02:10');
  assert.equal(durationMin(''), null);
});
test('podcast items without <link>: the guid when it is a URL, else the show\'s page (never the artwork link)', () => {
  const f = parseFeed(FX('feeds/podcast-nolink.xml'));
  assert.deepEqual(f.items.map(i => i.url), ['https://example-show.example/podcast', 'https://example-show.example/episodes/11']);
});
test('a site\'s own feed is found from its <link rel="alternate">', () => {
  assert.deepEqual(discoverFeeds('<head><link rel="alternate" type="application/rss+xml" href="/feed/"><link rel="stylesheet" href="x.css"></head>', 'https://www.example.com/'), ['https://www.example.com/feed/']);
  assert.throws(() => parseFeed('<html>not a feed</html>'), /not a feed/);
});
// ---------- polite fetching ----------
test('robots.txt: our own group, else *; longest rule wins', () => {
  const r = robotsRules('User-agent: *\nDisallow: /private\nAllow: /private/ok\n\nUser-agent: OtherBot\nDisallow: /');
  assert.equal(r('/news/a'), true); assert.equal(r('/private/x'), false); assert.equal(r('/private/ok/1'), true);
  const mine = robotsRules('User-agent: *\nDisallow: /\n\nUser-agent: fred-news\nAllow: /feed');
  assert.equal(mine('/feed'), true); assert.equal(mine('/article'), true);
  assert.equal(robotsRules('User-agent: *\nDisallow:')('/x'), true);
});
test('one request per URL per run, the fred-news User-Agent (with a contact email, item 53), robots refusals, no IRONMAN / T100 pages', async () => {
  const calls = [];
  const f = new Fetcher({fetchImpl: async (u, o) => { calls.push([u, o.headers['User-Agent']]); return new Response(u.endsWith('robots.txt') ? 'User-agent: *\nDisallow: /secret' : '<rss></rss>', {status: 200}); }});
  await f.get('https://a.example/feed'); await f.get('https://a.example/feed');
  assert.equal(calls.filter(c => c[0] === 'https://a.example/feed').length, 1);
  assert.ok(calls.every(c => c[1] === UA)); assert.equal(UA, 'fred-news (+https://fuel.bluebirdmultisport.com; hello@flipturncreative.com)');
  assert.equal((await f.get('https://a.example/secret/x')).refused, true);
  assert.equal((await f.get('https://www.ironman.com/results/x')).refused, true);
  assert.equal((await f.get('https://t100triathlon.com/results/')).refused, true);
  assert.ok(!calls.some(c => /ironman|t100/.test(c[0])), 'IRONMAN / T100 never requested');
});
// ---------- schema ----------
test('the UI fixture (mockup sample data) is valid', () => {
  assert.deepEqual(validate(SCHEMA, FIXTURE), []); assert.deepEqual(checkRefs(FIXTURE), []);
});
test('the schema rejects bad files', () => {
  const bad = (mut, re) => { const d = JSON.parse(JSON.stringify(FIXTURE)); mut(d); const p = [...validate(SCHEMA, d), ...checkRefs(d)]; assert.ok(p.some(x => re.test(x)), `${re} not in ${JSON.stringify(p)}`); };
  bad(d => { delete d.meta; }, /missing meta/);
  bad(d => { d.results[0].time = '1:5:3'; }, /time.*does not match/);
  bad(d => { d.results[0].place = 1.5; }, /place: must be integer/);
  bad(d => { d.items[0].url = 'http://insecure.example/a'; }, /url: does not match/);
  bad(d => { d.items[0].body = 'the full article text'; }, /unexpected field body/);
  bad(d => { d.items[0].image = 'https://x.example/a.jpg'; }, /unexpected field image/);
  bad(d => { d.items[0].in_short = 'x'.repeat(300); }, /longer than 240/);
  bad(d => { d.results[0].race_id = 'nope'; }, /unknown race nope/);
  bad(d => { d.story.push(...d.story.slice(0, 3)); }, /lines for t100-northbay-2026/);
  bad(d => { d.races[0].series = 'Challenge'; }, /series: must be one of/);
  bad(d => { d.results[0].source = 'blog'; }, /source: must be one of/);
  bad(d => { d.pros[0].country = 'Sweden'; }, /country: does not match/);
});
// ---------- the confidence rule ----------
test('results: official → published; two independent reports agreeing → published; otherwise "Results coming"', () => {
  const row = (sex, place, name, time) => Object.assign({sex, place, name}, time ? {time} : {});
  const off = confirmResults([{source: 'World Triathlon', url: 'https://triathlon.org/e/1', official: true, rows: [row('F', 1, 'Nora Ortiz', '1:51:40')]}]);
  assert.deepEqual(off.map(r => [r.name, r.time, r.source]), [['Nora Ortiz', '1:51:40', 'official']]);
  const one = confirmResults([{source: 'Tri247', url: 'https://www.tri247.com/a', rows: [row('F', 1, 'Sofia Lind', '1:52:30')]}]);
  assert.deepEqual(one, [], 'one report alone: nothing');
  const same = confirmResults([{source: 'Tri247', url: 'https://www.tri247.com/a', rows: [row('F', 1, 'Sofia Lind', '1:52:30')]}, {source: 'Tri247', url: 'https://www.tri247.com/b', rows: [row('F', 1, 'Sofia Lind', '1:52:30')]}]);
  assert.deepEqual(same, [], 'two articles from one publisher are not independent');
  const two = confirmResults([{source: 'Tri247', url: 'https://www.tri247.com/a', rows: [row('F', 1, 'Sofia Lind', '1:52:30'), row('F', 2, 'Anna Keller', '1:53:02')]},
    {source: 'Slowtwitch', url: 'https://www.slowtwitch.com/b', rows: [row('F', 1, 'Sofia Lind', '1:52:30'), row('F', 2, 'Anna Keller', '1:53:09')]}]);
  assert.deepEqual(two.map(r => [r.place, r.name, r.time || null, r.source]), [[1, 'Sofia Lind', '1:52:30', 'reports'], [2, 'Anna Keller', null, 'reports']], 'times only when they agree');
  assert.equal(two[0].source_urls.length, 2);
  const clash = confirmResults([{url: 'https://a.example/1', rows: [row('M', 1, 'Jonas Berg')]}, {url: 'https://b.example/1', rows: [row('M', 1, 'Jonas Berg')]}, {url: 'https://c.example/1', rows: [row('M', 1, 'Theo Grant')]}, {url: 'https://d.example/1', rows: [row('M', 1, 'Theo Grant')]}]);
  assert.deepEqual(clash, [], 'reports that disagree: nothing');
});
// ---------- In short ----------
const SRC = "Sofia Lind won the Northbay T100 in 1:52:30, ahead of Anna Keller. It was Lind's second T100 win of the season, and Keller stays within 16 points of the series lead.";
test('the In short contract: one sentence, ≤ 25 words, own words, no quote > 5 words, facts in the source, no opinions', () => {
  assert.deepEqual(inShortProblems('Lind and Berg won at Northbay; Keller remains 16 points behind in the series.', SRC), []);
  assert.ok(inShortProblems('Lind won. Keller was second.', SRC).includes('more than one sentence'));
  assert.ok(inShortProblems('Lind won ' + 'and won '.repeat(12) + 'again.', SRC).includes('more than 25 words'));
  assert.ok(inShortProblems('Lind said “this was the hardest race of my whole life” after winning.', SRC).includes('a quote longer than 5 words'));
  assert.ok(inShortProblems("It was Lind's second T100 win of the season at Northbay.", SRC).includes('copies 6+ words in a row from the source'));
  assert.ok(inShortProblems('Lind put in an impressive run to win at Northbay.', SRC).includes('an opinion or rating word'));
  assert.ok(inShortProblems('Lind won by 40 seconds at Northbay.', SRC).some(p => /number 40/.test(p)));
});
const mockModel = answer => { const calls = []; const f = async (u, o) => { const b = JSON.parse(o.body); calls.push(b); return new Response(JSON.stringify({content: [{type: 'text', text: answer(b)}]}), {status: 200}); }; return {model: makeModel({apiKey: 'test', fetchImpl: f}), calls}; };
test('In short from the model: claude-haiku-4-5-20251001 at temperature 0; a sentence that breaks the contract is dropped', async () => {
  const good = mockModel(() => 'Lind and Berg won at Northbay; Keller remains 16 points behind in the series.');
  assert.equal(await inShort(good.model, {title: 'Northbay T100 results', text: SRC}), 'Lind and Berg won at Northbay; Keller remains 16 points behind in the series.');
  assert.equal(good.calls[0].model, 'claude-haiku-4-5-20251001'); assert.equal(MODEL, 'claude-haiku-4-5-20251001'); assert.equal(good.calls[0].temperature, 0);
  const bad = mockModel(() => 'Lind put in an amazing performance to win her second title of the year by miles.');
  assert.equal(await inShort(bad.model, {title: 'x', text: SRC}), null);
  const none = mockModel(() => 'NONE');
  assert.equal(await inShort(none.model, {title: 'x', text: SRC}), null);
  assert.equal(makeModel({apiKey: ''}), null, 'no key: no model');
  assert.equal(await inShort(null, {title: 'x', text: SRC}), null, 'no key: no In short');
});
test('extraction is strict: places as integers 1–5, times h:mm:ss, real names; anything else dropped', () => {
  const r = checkExtraction({results: [{sex: 'F', place: 1, name: 'Sofia Lind', time: '1:52:30', country: 'SWE'}, {sex: 'F', place: '2', name: 'Anna Keller'}, {sex: 'F', place: 3, name: 'Rina Sato', time: '1h53'},
    {sex: 'X', place: 4, name: 'A B'}, {sex: 'M', place: 1, name: 'Berg'}, {sex: 'M', place: 1, name: 'Jonas Berg'}, {sex: 'M', place: 1, name: 'Theo Grant'}, {sex: 'M', place: 9, name: 'Kai Fischer'}]});
  assert.deepEqual(r, [{sex: 'F', place: 1, name: 'Sofia Lind', time: '1:52:30', country: 'SWE'}, {sex: 'F', place: 3, name: 'Rina Sato'}, {sex: 'M', place: 1, name: 'Jonas Berg'}]);
  assert.deepEqual(checkExtraction(null), []); assert.deepEqual(checkExtraction({results: 'x'}), []);
});
// ---------- matching ----------
const PROS = FIXTURE.pros, RACES = FIXTURE.races;
test('name matching: full names; a family name only when unique and capitalised; races by name or place + series within the dates', () => {
  assert.deepEqual(matchPros('How Berg won Northbay on the final lap', PROS), ['jonas-berg']);
  assert.deepEqual(matchPros('An iceberg in the lake', PROS), []);
  assert.deepEqual(matchPros('Maya Brooks: building for Kona', PROS), ['maya-brooks']);
  assert.deepEqual(matchPros('Lakeside preview: Keller vs. Brooks, round three', PROS).sort(), ['anna-keller', 'maya-brooks']);
  assert.deepEqual(matchRaces('Northbay T100 results: Lind and Berg win', '2026-09-27T18:00:00Z', RACES), ['t100-northbay-2026']);
  assert.deepEqual(matchRaces('Ortiz and Chen win WTCS Lakeport', '2026-09-27', RACES), ['wtcs-lakeport-2026']);
  assert.deepEqual(matchRaces('Northbay T100 results', '2026-06-01', RACES), [], 'months away: not that race');
  assert.deepEqual(matchRaces('A day in Lakeside', '2026-10-01', RACES), [], 'the place alone is not enough');
  assert.deepEqual(matchRaces('How Berg won Northbay on the final lap', '2026-09-28', RACES), ['t100-northbay-2026'], 'the place + a racing word, when one race there');
});
test('Commentary when about pro racing, else Other with category, sub-tag, sports and "tested"', () => {
  const tri = {id: 'triathlete', kind: 'rss', section: ['commentary', 'other'], sports: ['tri']};
  const a = classify({title: 'Northbay T100 results: Lind and Berg win', description: '', published: '2026-09-27T18:00:00Z'}, tri, {races: RACES, pros: PROS});
  assert.equal(a.section, 'commentary'); assert.equal(a.kind, 'recap'); assert.deepEqual(a.race_ids, ['t100-northbay-2026']);
  const p = classify({title: 'Lakeside preview: Keller vs. Brooks, round three', published: '2026-10-01T09:00:00Z'}, tri, {races: RACES, pros: PROS});
  assert.equal(p.kind, 'preview');
  const g = classify({title: 'A first look at a new tri bike with integrated storage', published: '2026-10-01T08:00:00Z'}, tri, {races: RACES, pros: PROS});
  assert.deepEqual([g.section, g.category, g.sub, g.tested], ['other', 'gear', 'Bikes', false]);
  const dcr = classify({title: 'Garmin Forerunner In-Depth Review', description: 'GPS watch running power', published: '2026-10-01'}, {id: 'dcrainmaker', kind: 'rss', section: ['other'], category: 'gear', sports: ['tri', 'bike', 'run']}, {});
  assert.deepEqual([dcr.category, dcr.sub, dcr.tested], ['gear', 'Wearables', true]);
  const shoe = classify({title: 'A Tale of Two Trail Shoes: ASICS Trabuco Max 5 vs Blazeblast', description: 'Trail running shoes', published: '2026-10-01'}, {id: 'slowtwitch', kind: 'rss', section: ['commentary', 'other'], sports: ['tri', 'bike', 'run']}, {});
  assert.deepEqual([shoe.section, shoe.sub, shoe.sports], ['other', 'Shoes', ['run']], 'a shoe review is a Run item, not Tri');
  const cn = classify({title: 'Gravel worlds: the course, the favorites, the weather', published: '2026-10-01'}, {id: 'cyclingnews', kind: 'rss', section: ['other'], category: 'cycling', sports: ['bike']}, {});
  assert.deepEqual([cn.category, cn.sub, cn.sports.sort()], ['cycling', 'Racing', ['bike', 'gravel']]);
  const ind = classify({title: 'Race organizer announces 12 new 70.3 events for 2027', published: '2026-09-30'}, {id: 'endurancebiz', kind: 'rss', section: ['other'], category: 'industry', sports: ['tri']}, {});
  assert.deepEqual([ind.section, ind.category, ind.sub], ['other', 'industry', 'Events']);
  const ts = classify({title: 'What are the best tri-suits in 2026? We test 12 popular suits for your racing', description: 'For IRONMAN racing and 70.3 podium hunters', published: '2026-10-01'}, tri, {races: RACES, pros: PROS});
  assert.deepEqual([ts.section, ts.category], ['other', 'gear'], 'a gear test goes to Other even when it mentions racing');
  assert.equal(slug('IRONMAN 70.3 Lakeside 2026'), 'ironman-70-3-lakeside-2026');
});
// ---------- World Triathlon API (shapes) ----------
test('World Triathlon API: events → races, program start times, results with Swim · Bike · Run splits', () => {
  const r = eventToRace({event_id: 501, event_title: '2026 World Triathlon Championship Series Lakeport', event_date: '2026-09-27', event_venue: 'Lakeport', event_country: 'Spain'});
  assert.deepEqual([r.id, r.name, r.series, r.confirmed, r.wt_event_id], ['wtcs-lakeport-2026', 'WTCS Lakeport', 'WTCS', true, 501]);
  assert.equal(programStart({prog_date: '2026-09-27', prog_time: '10:00:00', prog_timezone_offset: '+02:00'}), '2026-09-27T10:00:00+02:00');
  assert.equal(programStart({prog_date: '2026-09-27', prog_time: '10:00:00'}), null, 'no offset: no start time (never guessed)');
  assert.equal(sexOfProgram({prog_name: 'Elite Women'}), 'F'); assert.equal(sexOfProgram({prog_name: 'Elite Men'}), 'M'); assert.equal(sexOfProgram({prog_name: 'U23 Men'}), null);
  const rows = resultRows([{position: '2', athlete_title: 'Petra Cole', athlete_noc: 'GBR', athlete_id: 7, total_time: '01:51:52', splits: ['00:18:49', '00:00:40', '00:58:35', '00:00:20', '00:32:31']},
    {position: '1', athlete_first: 'Nora', athlete_last: 'Ortiz', athlete_noc: 'ESP', total_time: '01:51:40', splits: ['00:18:52', '0:41', '00:58:31', '0:22', '00:32:20']}, {position: 'DNF', athlete_title: 'X Y'}]);
  assert.deepEqual(rows.map(x => [x.place, x.pro.name, x.time, x.splits]), [[1, 'Nora Ortiz', '1:51:40', {swim: '0:18:52', bike: '0:58:31', run: '0:32:20'}], [2, 'Petra Cole', '1:51:52', {swim: '0:18:49', bike: '0:58:35', run: '0:32:31'}]]);
  assert.equal(hms('00:00:00'), null);
});
// ---------- the build, end to end (all network mocked) ----------
function tmpRoot({news} = {}) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'fred-news-')); fs.mkdirSync(path.join(d, 'data'));
  fs.copyFileSync(path.join(ROOT, 'data/news.schema.json'), path.join(d, 'data/news.schema.json'));
  const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/sources.json'), 'utf8'));
  const keep = ['tri247', 'slowtwitch', 'protrinews', 'worldtri', 'endurancebiz'];
  src.sources = src.sources.filter(s => keep.includes(s.id));
  src.sources.forEach(s => { s.enabled = true; }); // the test feeds are mocked (the live file may switch a source off)
  src.sources.find(s => s.id === 'slowtwitch').feeds = ['https://www.slowtwitch.com/rss/']; // the first candidate fails (404), the site's <link> finds it
  fs.writeFileSync(path.join(d, 'data/sources.json'), JSON.stringify(src));
  if (news) fs.writeFileSync(path.join(d, 'data/news.json'), typeof news === 'string' ? news : JSON.stringify(news));
  return d;
}
const WT = {
  '/events?category_id=351&start_date=2026-09-23&end_date=2026-10-01': [{event_id: 501, event_title: '2026 World Triathlon Championship Series Lakeport', event_date: '2026-09-27', event_venue: 'Lakeport', event_country: 'Spain'}],
  '/events?category_id=351&start_date=2026-10-01&end_date=2026-10-11': [{event_id: 502, event_title: '2026 World Triathlon Championship Series Harbourview', event_date: '2026-10-03', event_venue: 'Harbourview', event_country: 'Australia'}],
  '/events/501/programs': [{prog_id: 11, prog_name: 'Elite Women', prog_date: '2026-09-27', prog_time: '10:00:00', prog_timezone_offset: '+02:00'}, {prog_id: 12, prog_name: 'Elite Men', prog_date: '2026-09-27', prog_time: '13:00:00', prog_timezone_offset: '+02:00'}],
  '/events/502/programs': [{prog_id: 21, prog_name: 'Elite Women', prog_date: '2026-10-03', prog_time: '23:30:00', prog_timezone_offset: '+10:00'}],
  '/events/501/programs/11/results': {results: [{position: 1, athlete_title: 'Nora Ortiz', athlete_noc: 'ESP', athlete_id: 9001, total_time: '01:51:40', splits: ['00:18:52', '00:00:41', '00:58:31', '00:00:22', '00:32:20']}]},
  '/events/501/programs/12/results': {results: [{position: 1, athlete_title: 'Leo Chen', athlete_noc: 'CHN', athlete_id: 9002, total_time: '01:40:12', splits: ['00:17:40', '00:00:40', '00:53:10', '00:00:20', '00:29:22']}]},
  // the real /rankings shape (2026-10-02 trace): a category + a short name; para rankings first
  '/rankings': [{ranking_id: 45, ranking_cat_id: 1, ranking_cat_name: 'Paratriathlon', ranking_name: 'PTWC Men', region_name: 'PTWC Men', week: '2026-W40'},
    {ranking_id: 51, ranking_cat_id: 1, ranking_cat_name: 'Paratriathlon', ranking_name: 'PTWC Women', region_name: 'PTWC Women', week: '2026-W40'},
    {ranking_id: 11, ranking_cat_id: 2, ranking_cat_name: 'Olympic', ranking_name: 'Elite Men', region_name: 'Elite Men'},
    {ranking_id: 13, ranking_cat_id: 4, ranking_cat_name: 'World Rankings', ranking_name: 'Elite Men', region_name: 'Elite Men'},
    {ranking_id: 1, ranking_cat_id: 3, ranking_cat_name: 'World Triathlon Series', ranking_name: 'Elite Women', region_name: 'Elite Women', week: '2026-W40', published: '2026-09-28 06:29:23'},
    {ranking_id: 2, ranking_cat_id: 3, ranking_cat_name: 'World Triathlon Series', ranking_name: 'Elite Men', region_name: 'Elite Men', week: '2026-W40', published: '2026-09-28 06:29:23'},
    {ranking_id: 9, ranking_cat_id: 4, ranking_cat_name: 'World Rankings', ranking_name: 'Elite Women', region_name: 'Elite Women'},
    {ranking_id: 82, ranking_cat_name: 'Age Group', ranking_name: 'Open'}, {ranking_id: 83, ranking_cat_name: 'Age Group', ranking_name: 'Female'},
    {ranking_id: 84, ranking_cat_name: 'T100 Triathlon World Tour', ranking_name: 'Elite Men', region_name: 'Elite Men'},
    {ranking_id: 85, ranking_cat_name: 'T100 Triathlon World Tour', ranking_name: 'Elite Women', region_name: 'Elite Women'}],
  '/rankings/84': [{rank: 1, athlete_title: 'Leo Chen', athlete_noc: 'CHN', athlete_id: 9002, total: 160}], '/rankings/85': [{rank: 1, athlete_title: 'Nora Ortiz', athlete_noc: 'ESP', athlete_id: 9001, total: 175}],
  '/rankings/1': [{rank: 1, athlete_title: 'Nora Ortiz', athlete_noc: 'ESP', athlete_id: 9001, total: 3450}], '/rankings/2': [{rank: 1, athlete_title: 'Leo Chen', athlete_noc: 'CHN', athlete_id: 9002, total: 3390}],
  '/athletes/9001': {athlete_id: 9001, athlete_title: 'Nora Ortiz', athlete_website: 'https://nora-ortiz.example/'}, '/athletes/9002': {athlete_id: 9002},
};
function net({modelAnswer} = {}) {
  const log = [];
  const f = async (u, o = {}) => {
    u = String(u); log.push(u);
    const R = (b, s = 200, h = {}) => new Response(typeof b === 'string' ? b : JSON.stringify(b), {status: s, headers: h});
    if (u.startsWith('https://api.anthropic.com/')) { const b = JSON.parse(o.body); return R({content: [{type: 'text', text: modelAnswer(b)}]}); }
    if (u.startsWith('https://api.triathlon.org/v1')) { if (o.headers.apikey !== 'wt-test') return R({status: 'error'}, 401); const k = u.slice('https://api.triathlon.org/v1'.length).replace(/&per_page=50&order=asc/, ''); return k in WT ? R({status: 'success', data: WT[k]}) : R({status: 'error'}, 404); }
    if (u.endsWith('/robots.txt')) return R(u.includes('slowtwitch') ? 'User-agent: *\nDisallow: /sample/berg-northbay' : 'User-agent: *\nAllow: /');
    if (u === 'https://www.tri247.com/feed') return R(FX('feeds/rss-tri247.xml'));
    if (u === 'https://www.slowtwitch.com/rss/') return R('nope', 404);
    if (u === 'https://www.slowtwitch.com/') return R('<html><head><link rel="alternate" type="application/atom+xml" href="/atom.xml"></head></html>');
    if (u === 'https://www.slowtwitch.com/atom.xml') return R(FX('feeds/atom-slowtwitch.xml'));
    if (u === 'https://feeds.buzzsprout.com/1736374.rss') return R(FX('feeds/podcast-protrinews.xml'));
    if (u === 'https://endurance.biz/feed/') throw new Error('connect ECONNREFUSED');
    if (u === 'https://www.tri247.com/sample/northbay-t100-results') return R(`<html><article><p>${SRC} Jonas Berg won the men's race in 1:41:10 ahead of Theo Grant.</p></article></html>`);
    if (u === 'https://nora-ortiz.example/') return R('<a href="https://www.instagram.com/sample.noraortiz/">IG</a> <a href="https://www.strava.com/athletes/123">Strava</a> <a href="https://evil.example/x">x</a>');
    if (/^https:\/\/triathlon\.org\/athletes\/profile\//.test(u)) return R('<html>profile</html>');
    return R(`<html><article><p>Sample page for ${u}.</p></article></html>`);
  };
  return {f, log};
}
const answers = b => {
  const sys = b.system;
  if (/In short/.test(sys)) return /Northbay T100 results/.test(b.messages[0].content) ? 'Lind and Berg won at Northbay; Keller remains 16 points behind in the series.' : 'NONE';
  if (/professional results it states/.test(sys)) return JSON.stringify({results: [{sex: 'F', place: 1, name: 'Sofia Lind', time: '1:52:30'}, {sex: 'M', place: 1, name: 'Jonas Berg', time: '1:41:10'}]});
  if (/story/.test(sys)) { const reps = b.messages[0].content.split(/\n\nReport /).slice(1); const i = reps.findIndex(x => /16 points/.test(x)) + 1;
    return JSON.stringify({lines: [{report: i, text: 'Lind and Berg won at Northbay; Keller remains 16 points behind in the series.'}, {report: 9, text: 'Made up.'}]}); }
  if (/preview/.test(sys)) return JSON.stringify({races: [{name: 'IRONMAN 70.3 Lakeside', series: '70.3', date: '2026-10-03', place: 'Lakeside, USA', tz: 'America/New_York', starts: {women: '2026-10-03T07:00:00-04:00'}, pros: [{name: 'Anna Keller', sex: 'F'}, {name: 'Maya Brooks', sex: 'F'}]}]});
  return '{}';
};
test('no keys: headlines and links only (no In short, no story, no extracted results; WTCS links only); BLOCKED named', async () => {
  const d = tmpRoot(), n = net({modelAnswer: () => { throw new Error('model called without a key'); }});
  const r = await run({job: 'all', root: d, now: NOW, fetchImpl: n.f, env: {NEWS_CACHE_DIR: path.join(d, '.c')}, log: () => {}});
  assert.deepEqual(r.problems, []); assert.equal(r.changed, true);
  assert.deepEqual(r.blocked, ['ANTHROPIC_API_KEY', 'WT_API_KEY']);
  const doc = JSON.parse(fs.readFileSync(path.join(d, 'data/news.json'), 'utf8'));
  assert.equal(doc.meta.ai, false); assert.equal(doc.meta.wt, false);
  assert.ok(doc.items.length >= 5); assert.ok(doc.items.every(i => !i.in_short)); assert.deepEqual(doc.story, []); assert.deepEqual(doc.results, []);
  assert.ok(!n.log.some(u => u.includes('anthropic') || u.includes('api.triathlon.org')));
  assert.equal(doc.meta.sources.endurancebiz.ok, false); assert.match(doc.meta.sources.endurancebiz.error, /ECONNREFUSED/);
  assert.equal(doc.meta.sources.slowtwitch.feed, 'https://www.slowtwitch.com/atom.xml', 'the feed found from the site');
  assert.ok(doc.items.some(i => i.url === 'https://www.tri247.com/sample/insecure'), 'http links upgraded to https');
  assert.ok(!doc.items.some(i => /old/.test(i.url)), 'older than 60 days: not added');
  const pod = doc.items.find(i => i.type === 'episode' && /290/.test(i.title)); assert.equal(pod.minutes, 64);
  assert.ok(!JSON.stringify(doc).includes('men’s race in 1:41:10'), 'no article text stored');
});
test('with keys: In short, WTCS official results with splits + standings, report results by the confidence rule, story lines, pros\' confirmed links', async () => {
  const d = tmpRoot(), n = net({modelAnswer: answers});
  const r = await run({job: 'all', root: d, now: NOW, fetchImpl: n.f, env: {ANTHROPIC_API_KEY: 'test', WT_API_KEY: 'wt-test', NEWS_CACHE_DIR: path.join(d, '.c')}, log: () => {}});
  assert.deepEqual(r.problems, []); assert.deepEqual(r.blocked, []);
  const doc = r.doc;
  const a = doc.items.find(i => /Northbay T100 results/.test(i.title));
  assert.equal(a.in_short, 'Lind and Berg won at Northbay; Keller remains 16 points behind in the series.');
  assert.ok(doc.items.filter(i => i.type === 'article' && !/Northbay T100 results/.test(i.title)).every(i => !i.in_short), 'NONE → no In short');
  const lak = doc.races.find(x => x.id === 'wtcs-lakeport-2026');
  assert.deepEqual(lak.starts, {women: '2026-09-27T10:00:00+02:00', men: '2026-09-27T13:00:00+02:00'});
  const w = doc.results.find(x => x.race_id === 'wtcs-lakeport-2026' && x.sex === 'F');
  assert.deepEqual([w.place, w.pro_id, w.time, w.splits, w.source], [1, 'nora-ortiz', '1:51:40', {swim: '0:18:52', bike: '0:58:31', run: '0:32:20'}, 'official']);
  assert.ok(doc.standings.some(s => s.series === 'WTCS' && s.sex === 'M' && s.pro_id === 'leo-chen' && s.points === 3390));
  assert.ok(doc.standings.some(s => s.series === 'WTCS' && s.sex === 'F' && s.pro_id === 'nora-ortiz' && s.points === 3450));
  assert.ok(doc.standings.some(s => s.series === 'T100' && s.sex === 'F' && s.pro_id === 'nora-ortiz' && s.points === 175) && doc.standings.some(s => s.series === 'T100' && s.sex === 'M' && s.points === 160), 'T100 World Tour ranking (World Triathlon) fills T100');
  const hv = doc.races.find(x => x.id === 'wtcs-harbourview-2026'); assert.equal(hv.starts.women, '2026-10-03T23:30:00+10:00');
  const lk = doc.races.find(x => x.id === '70-3-lakeside-2026'); assert.ok(lk && lk.confirmed === false && lk.starts.women === '2026-10-03T07:00:00-04:00', 'a race from a preview: unconfirmed');
  // Northbay: no race record (no official source and the reports name no race in the file) → no results invented
  assert.ok(!doc.results.some(x => /northbay/.test(x.race_id)));
  const ortiz = doc.pros.find(p => p.id === 'nora-ortiz');
  assert.deepEqual(ortiz.links, {worldtri: 'https://triathlon.org/athletes/profile/9001', website: 'https://nora-ortiz.example/', instagram: 'https://www.instagram.com/sample.noraortiz/', strava: 'https://www.strava.com/athletes/123'});
  assert.equal(ortiz.links_checked, '2026-10-01');
  assert.ok(!n.log.includes('https://www.slowtwitch.com/sample/berg-northbay'), 'robots.txt said no: the article was not fetched (the feed text was used)');
  assert.ok(n.log.filter(u => u === 'https://www.tri247.com/feed').length === 1, 'one request per feed per run (the daily job runs twice in "all")');
});
test('T100 results from two independent reports (the confidence rule inside the results job); story lines tied to one report each', async () => {
  const prev = emptyDoc(NOW); prev.races.push({id: 't100-northbay-2026', series: 'T100', name: 'Northbay T100', date: '2026-09-27', place: 'Northbay', confirmed: true});
  const d = tmpRoot({news: prev}), n = net({modelAnswer: answers});
  const r = await run({job: 'all', root: d, now: NOW, fetchImpl: n.f, env: {ANTHROPIC_API_KEY: 'test', NEWS_CACHE_DIR: path.join(d, '.c')}, log: () => {}});
  assert.deepEqual(r.problems, []);
  const res = r.doc.results.filter(x => x.race_id === 't100-northbay-2026');
  assert.deepEqual(res.map(x => [x.sex, x.place, x.pro_id, x.time, x.source]), [['F', 1, 'sofia-lind', '1:52:30', 'reports'], ['M', 1, 'jonas-berg', '1:41:10', 'reports']]);
  assert.ok(res[0].source_urls.some(u => u.includes('tri247')) && res[0].source_urls.some(u => u.includes('slowtwitch')));
  const st = r.doc.story.filter(s => s.race_id === 't100-northbay-2026');
  assert.equal(st.length, 1, 'the made-up line (report 9) is dropped'); assert.ok(/^https:\/\//.test(st[0].url) && st[0].source);
});
test('failure path: the last good file stays when the build fails or the result fails the checks', async () => {
  const good = JSON.parse(JSON.stringify(FIXTURE)); delete good.meta.sample;
  // a previous file with an item that breaks the schema → the new file fails the checks → nothing written
  const broken = JSON.parse(JSON.stringify(good)); broken.items[0].url = 'http://insecure.example/';
  const txt = JSON.stringify(broken), d = tmpRoot({news: txt}), n = net({modelAnswer: answers});
  const r = await run({job: 'daily', root: d, now: NOW, fetchImpl: n.f, env: {NEWS_CACHE_DIR: path.join(d, '.c')}, log: () => {}});
  assert.ok(r.problems.length > 0); assert.equal(fs.readFileSync(path.join(d, 'data/news.json'), 'utf8'), txt, 'unchanged byte for byte');
  // the CLI exits 1 and keeps the file (the workflow then opens an issue)
  const cli = spawnSync(process.execPath, [path.join(ROOT, 'scripts/news/build.mjs'), 'nosuchjob', '--root', d], {encoding: 'utf8'});
  assert.equal(cli.status, 1); assert.match(cli.stderr, /unknown job nosuchjob/); assert.equal(fs.readFileSync(path.join(d, 'data/news.json'), 'utf8'), txt);
  const v = spawnSync(process.execPath, [path.join(ROOT, 'scripts/news/validate.mjs'), path.join(d, 'data/news.json')], {encoding: 'utf8'});
  assert.equal(v.status, 1); assert.match(v.stderr, /FAILS/);
});
// ---------- item 47: the pro-race calendar (data/pro-races.json) ----------
const KONA = {series: 'IRONMAN', name: 'IRONMAN World Championship', date: '2026-10-10', place: 'Kailua-Kona, Hawaiʻi', country: 'USA', tz: 'Pacific/Honolulu', note: 'Men and women race the same day',
  official_url: ['https://www.ironman.com/races/im-world-championship', 'https://www.ironman.com/im-world-championship'], start_lists: ['https://www.ironman.com/races/im-world-championship', 'https://www.ironman.com/im-world-championship']};
function calRoot(races = [KONA], news) { const d = tmpRoot({news}); fs.writeFileSync(path.join(d, 'data/pro-races.json'), JSON.stringify({about: 'test', races})); return d; }
test('item 47: the repo\'s pro-race calendar lists Kona (IRONMAN, Sat Oct 10, 2026, Kailua-Kona, men and women the same day, official links)', () => {
  const cal = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/pro-races.json'), 'utf8')), k = cal.races.find(r => /World Championship/.test(r.name) && r.series === 'IRONMAN');
  assert.ok(k); assert.equal(k.date, '2026-10-10'); assert.equal(new Date(k.date + 'T12:00:00Z').getUTCDay(), 6, 'a Saturday'); assert.match(k.place, /Kona/); assert.equal(k.tz, 'Pacific/Honolulu');
  assert.match(k.note, /Men and women race the same day/); for (const f of ['official_url', 'start_lists']) assert.ok([].concat(k[f]).every(u => /^https:\/\/www\.ironman\.com\//.test(u)), f + ' on ironman.com');
  assert.ok(!k.starts, 'no start times until the official schedule is checked');
});
test('item 47: every job merges the calendar: Kona is in news.json from Oct 1 to Oct 10, 2026 (no network, no keys needed)', async () => {
  for (let day = 1; day <= 10; day++) {
    const d = calRoot(), now = Date.parse(`2026-10-${String(day).padStart(2, '0')}T12:00:00Z`);
    const r = await run({job: 'calendar', root: d, now, fetchImpl: async () => { throw new Error('no network in the calendar job'); }, env: {NEWS_CACHE_DIR: path.join(d, '.c')}, log: () => {}});
    assert.deepEqual(r.problems, []); const k = r.doc.races.find(x => x.series === 'IRONMAN' && x.date === '2026-10-10');
    assert.ok(k, 'Kona on Oct ' + day); assert.equal(k.confirmed, true); assert.equal(k.name, 'IRONMAN World Championship'); assert.equal(k.note, 'Men and women race the same day');
    assert.equal(k.official_url, KONA.official_url[0], 'before any check: the first candidate'); assert.equal(k.start_lists, KONA.start_lists[0]);
  }
  // the weekend and results jobs merge it too (no keys)
  for (const job of ['weekend', 'results']) { const d = calRoot(); const r = await run({job, root: d, now: Date.parse('2026-10-06T12:00:00Z'), fetchImpl: net().f, env: {NEWS_CACHE_DIR: path.join(d, '.c')}, log: () => {}});
    assert.deepEqual(r.problems, []); assert.ok(r.doc.races.some(x => x.name === 'IRONMAN World Championship'), job); }
  // far from today (> 3 weeks ahead, or more than 8 days past): not merged
  const d = calRoot(); const r = await run({job: 'calendar', root: d, now: Date.parse('2026-09-01T12:00:00Z'), env: {NEWS_CACHE_DIR: path.join(d, '.c')}, log: () => {}});
  assert.ok(!r.doc.races.some(x => x.name === 'IRONMAN World Championship'));
});
// a hand-typed race on a site whose links fred may check (item 53: ironman.com candidates are never requested)
const HARBOR = {series: 'T100', name: 'Harbor T100', date: '2026-10-10', place: 'Harbor City', official_url: ['https://races.example/harbor-t100', 'https://races.example/t100/harbor'], start_lists: ['https://races.example/harbor-t100', 'https://races.example/t100/harbor']};
test('item 47: the daily job checks the calendar\'s candidate links: the first that opens wins; a busy site proves nothing; all broken → none, reported; ironman.com links are never checked', async () => {
  const seen = [];
  const mk = answers => async (u, o = {}) => { u = String(u); seen.push(u); if (u.endsWith('/robots.txt')) return new Response('User-agent: *\nAllow: /', {status: 200});
    if (u in answers) { const a = answers[u]; if (a === 'throw') throw new Error('ECONNREFUSED'); return Object.defineProperty(new Response('<html><h1>page</h1></html>', {status: a.status || a}), 'url', {value: a.to || u}); }
    return net().f(u, o); };
  const [a, b] = HARBOR.official_url, now = Date.parse('2026-10-06T12:00:00Z'), KONA_T = KONA, calRootK = calRoot;
  const calRoot2 = (races = [HARBOR, KONA_T]) => calRootK(races);
  let d = calRoot2(); let r = await run({job: 'daily', root: d, now, fetchImpl: mk({[a]: 404, [b]: 200}), env: {NEWS_CACHE_DIR: path.join(d, '.c')}, log: () => {}});
  assert.deepEqual(r.problems, []); let k = r.doc.races.find(x => x.series === 'T100'); assert.equal(k.official_url, b, 'the second candidate (the first is a 404)'); assert.equal(k.start_lists, b);
  assert.equal(r.doc.meta.calendar_links[a].ok, false); assert.equal(r.doc.meta.calendar_links[b].ok, true); assert.ok(!r.linksBroken.some(x => /Pro races/.test(x)));
  const kona = r.doc.races.find(x => x.series === 'IRONMAN'); assert.equal(kona.official_url, KONA.official_url[0], 'ironman.com: not checked, the first candidate stays');
  assert.ok(!seen.some(u => /ironman\.com/.test(u)), 'item 53: no ironman.com link is ever requested'); assert.ok(!Object.keys(r.doc.meta.calendar_links).some(u => /ironman/.test(u)));
  // a verdict from before item 53 (both Kona links 404 on 2026-10-05) stays: no broken link is shown, and it is not reported every day
  { const prev = emptyDoc(now); prev.meta.calendar_links = Object.fromEntries(KONA.official_url.map(u => [u, {ok: false, checked: '2026-10-05T22:05:52Z', status: 404}]));
    const d2 = calRootK([HARBOR, KONA_T], prev); const r2 = await run({job: 'daily', root: d2, now, fetchImpl: mk({[a]: 200}), env: {NEWS_CACHE_DIR: path.join(d2, '.c')}, log: () => {}});
    const k2 = r2.doc.races.find(x => x.series === 'IRONMAN'); assert.ok(k2 && !k2.official_url && !k2.start_lists, 'the 404 links stay hidden');
    assert.ok(!r2.linksBroken.some(x => /IRONMAN World Championship/.test(x)), 'and are not reported again (they can\'t be re-checked)'); }
  d = calRoot2(); r = await run({job: 'daily', root: d, now, fetchImpl: mk({[a]: {status: 200, to: 'https://races.example/'}, [b]: 503}), env: {NEWS_CACHE_DIR: path.join(d, '.c')}, log: () => {}});
  k = r.doc.races.find(x => x.series === 'T100'); assert.equal(k.official_url, b, 'redirected to the home page = broken; 503 = not judged, so the next candidate stays'); assert.ok(!(b in (r.doc.meta.calendar_links || {})));
  d = calRoot2(); r = await run({job: 'daily', root: d, now, fetchImpl: mk({[a]: 404, [b]: 410}), env: {NEWS_CACHE_DIR: path.join(d, '.c')}, log: () => {}});
  k = r.doc.races.find(x => x.series === 'T100'); assert.ok(k && !k.official_url && !k.start_lists, 'every candidate broken: no link shown'); assert.ok(r.linksBroken.some(x => /Pro races · Harbor T100 \(2026-10-10\) · official_url/.test(x)), 'reported');
});
test('limits: 8 weeks of races/results, 60 days of items, ≤ 300 pros, ≤ ~400 KB', () => {
  const doc = emptyDoc(NOW);
  doc.races.push({id: 'old-2026', series: 'T100', name: 'Old T100', date: '2026-07-01', confirmed: true}, {id: 'new-2026', series: 'T100', name: 'New T100', date: '2026-09-27', confirmed: true});
  for (let i = 0; i < 400; i++) doc.pros.push({id: `p${i}`, name: `Pro ${String(i).padStart(3, '0')}`});
  for (let i = 0; i < 400; i++) doc.results.push({race_id: i % 2 ? 'old-2026' : 'new-2026', sex: 'F', place: i + 1 > 400 ? 1 : (i % 300) + 1, pro_id: `p${i}`, source: 'official'});
  for (let i = 0; i < 3000; i++) doc.items.push({id: `i${i}`, section: 'other', type: 'article', source: 'X', title: 'T'.repeat(150), url: `https://x.example/${i}`, date: i < 50 ? '2026-07-01' : '2026-09-30', in_short: 'S'.repeat(200)});
  prune(doc, NOW);
  assert.deepEqual(doc.races.map(r => r.id), ['new-2026']); assert.ok(doc.results.every(r => r.race_id === 'new-2026'));
  assert.ok(doc.items.every(i => i.date >= '2026-08-02')); assert.ok(doc.pros.length <= LIMITS.pros);
  assert.ok(Buffer.byteLength(JSON.stringify(doc)) <= 400 * 1024);
});
