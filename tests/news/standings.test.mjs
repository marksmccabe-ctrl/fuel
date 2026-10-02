// node --test 'tests/news/*.test.mjs' — standings (item 21): WTCS + T100 top 10 from World Triathlon with the published date, IRONMAN Pro
// Series top 3 only when two independent reports agree, and the daily check of the official "Full standings" links.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Fetcher} from '../../scripts/news/lib/fetch.mjs';
import {validate, checkRefs} from '../../scripts/news/lib/schema.mjs';
import {checkStandingsExtraction} from '../../scripts/news/lib/ai.mjs';
import {confirmStandings, within1pct} from '../../scripts/news/lib/standings.mjs';
import {judgeStandingsPage, isHomePath, CHECK_EVERY_MS, standingsLinksOn} from '../../scripts/news/lib/links.mjs';
import {run, emptyDoc} from '../../scripts/news/build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/news.schema.json'), 'utf8'));
const SOURCES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/sources.json'), 'utf8'));
const NOW = Date.parse('2026-10-01T12:00:00Z');

// ---------- the two-reports rule ----------
const claim = (url, date, rows) => ({source: new URL(url).hostname.replace(/^www\./, '').split('.')[0], url, date, rows});
const top3 = (pts = [17200, 16900, 16410]) => [['Anna Keller', pts[0]], ['Ella Novak', pts[1]], ['Maya Brooks', pts[2]]].map(([name, points], i) => Object.assign({sex: 'F', rank: i + 1, name}, points != null ? {points} : {}));
test('Pro Series: two independent reports with the same names in the same order (points within 1%) → the top 3', () => {
  const a = claim('https://www.tri247.com/a', '2026-09-29', top3()), b = claim('https://www.slowtwitch.com/b', '2026-09-30', top3([17210, 16890, 16400]));
  const ok = confirmStandings([a, b], 'F', {topN: 3, minRows: 3});
  assert.deepEqual(ok.rows, [{rank: 1, name: 'Anna Keller', points: 17210}, {rank: 2, name: 'Ella Novak', points: 16890}, {rank: 3, name: 'Maya Brooks', points: 16400}], 'the newer report\'s points');
  assert.deepEqual(ok.sources, ['tri247', 'slowtwitch']); assert.equal(ok.date, '2026-09-30'); assert.equal(ok.source_urls.length, 2);
  assert.equal(confirmStandings([a, claim('https://www.tri247.com/c', '2026-09-30', top3())], 'F'), null, 'the same publisher twice is not two sources');
  const swapped = top3(); [swapped[1].name, swapped[2].name] = [swapped[2].name, swapped[1].name];
  assert.equal(confirmStandings([a, claim('https://www.slowtwitch.com/b', '2026-09-30', swapped)], 'F'), null, 'a different order: not published');
  assert.equal(confirmStandings([a, claim('https://www.slowtwitch.com/b', '2026-09-30', top3([17200, 16900, 15000]))], 'F'), null, 'points more than 1% apart: not published');
  const noPts = confirmStandings([a, claim('https://www.slowtwitch.com/b', '2026-09-30', top3([null, null, null]))], 'F');
  assert.ok(noPts && noPts.rows.length === 3 && noPts.rows.every(r => r.points === undefined), 'names agree, one report gives no points: names only');
  assert.equal(confirmStandings([a, b], 'M'), null, 'nothing for the men');
  assert.ok(within1pct(100, 101) && !within1pct(100, 102));
});
test('T100 fallback rule (top 10): the newest agreeing pair wins (a pair is as new as its older report); at least 3 ranks', () => {
  const ten = n => Array.from({length: n}, (_, i) => ({sex: 'M', rank: i + 1, name: `Pro Number${String.fromCharCode(65 + i)}`, points: 100 - i}));
  const six = ten(10); six[6].name = 'Some One';
  const r = confirmStandings([claim('https://a.example/x', '2026-09-28', ten(10)), claim('https://b.example/y', '2026-09-29', six), claim('https://c.example/z', '2026-09-27', ten(10))], 'M', {topN: 10, minRows: 3});
  assert.equal(r.rows.length, 6, 'a + b (Sep 28/29) agree on 6 ranks and beat a + c (Sep 27/28), which agree on all ten but are older'); assert.deepEqual(r.sources, ['a', 'b']);
  const same = confirmStandings([claim('https://a.example/x', '2026-09-29', ten(10)), claim('https://b.example/y', '2026-09-29', six), claim('https://c.example/z', '2026-09-29', ten(10))], 'M', {topN: 10, minRows: 3});
  assert.equal(same.rows.length, 10, 'equally new: the pair agreeing on more ranks');
});
test('standings read from a report: ranks as integers, real names, points only as numbers; anything else dropped', () => {
  const got = checkStandingsExtraction({standings: [{sex: 'F', rank: 1, name: 'Anna Keller', points: 17200}, {sex: 'F', rank: 2, name: 'Ella Novak', points: 'lots'}, {sex: 'F', rank: 2, name: 'Twice Ranked'}, {sex: 'M', rank: 4, name: 'Kai Fischer', country: 'GER'}, {sex: 'X', rank: 1, name: 'No Sex'}, {sex: 'M', rank: 1, name: 'x'}]}, 3);
  assert.deepEqual(got, [{sex: 'F', rank: 1, name: 'Anna Keller', points: 17200}, {sex: 'F', rank: 2, name: 'Ella Novak'}], 'rank 4 > top 3, a duplicate rank, a bad sex and a bad name are dropped');
});
// ---------- the link check ----------
test('a standings link is kept only when it opens the standings: 200, not a home page, the page reads as standings', () => {
  const page = (title, extra = '') => `<html><head><title>${title}</title></head><body><h1>${title}</h1>${extra}</body></html>`;
  assert.equal(judgeStandingsPage({url: 'https://triathlon.org/world-rankings/t100', status: 200, finalUrl: 'https://triathlon.org/world-rankings/t100', body: page('T100 Race To Qatar Standings | World Triathlon')}).ok, true);
  assert.equal(judgeStandingsPage({url: 'https://x.example/standings', status: 404, body: ''}).reason, 'HTTP 404');
  assert.match(judgeStandingsPage({url: 'https://x.example/standings', status: 200, finalUrl: 'https://x.example/', body: page('Standings')}).reason, /redirected to a home page/);
  assert.match(judgeStandingsPage({url: 'https://x.example/standings', status: 200, finalUrl: 'https://x.example/en-us/', body: page('Welcome')}).reason, /home page/);
  assert.equal(judgeStandingsPage({url: 'https://x.example/s', status: 200, finalUrl: 'https://x.example/s', body: page('Season 2026', '<td>Anna Keller</td><td>Ella Novak</td><td>Maya Brooks</td>'), names: ['Anna Keller', 'Ella Novak', 'Maya Brooks']}).ok, true, 'no heading words, but the pros fred lists are on the page');
  assert.match(judgeStandingsPage({url: 'https://x.example/s', status: 200, finalUrl: 'https://x.example/s', body: page('Shop')}).reason, /does not show standings/);
  assert.ok(isHomePath('https://x.example/') && isHomePath('https://x.example/en-us') && !isHomePath('https://x.example/world-rankings/t100'));
});
test('the fetcher: IRONMAN / T100 / PTO pages stay refused, except the standings link check (robots.txt still respected; nothing cached)', async () => {
  const calls = [], dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fred-links-'));
  const f = new Fetcher({cacheDir: dir, fetchImpl: async u => { calls.push(u); return new Response(u.endsWith('robots.txt') ? (u.includes('protriathletes') ? 'User-agent: *\nDisallow: /t100' : 'User-agent: *\nAllow: /') : '<title>Standings</title>', {status: 200}); }});
  assert.equal((await f.get('https://proseries.ironman.com/standings')).refused, true, 'not for reading');
  assert.equal((await f.get('https://proseries.ironman.com/standings', {linkCheck: true})).status, 200, 'the link check may open it');
  assert.equal((await f.get('https://stats.protriathletes.org/t100/standings/women', {linkCheck: true})).refused, true, 'robots.txt still says no');
  assert.deepEqual(fs.existsSync(dir) ? fs.readdirSync(dir) : [], [], 'no page kept in the cache');
  assert.equal(calls.filter(u => u === 'https://proseries.ironman.com/standings').length, 1);
});

// ---------- end to end (all network mocked) ----------
function tmpRoot({news, standings} = {}) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'fred-std-')); fs.mkdirSync(path.join(d, 'data'));
  fs.copyFileSync(path.join(ROOT, 'data/news.schema.json'), path.join(d, 'data/news.schema.json'));
  const src = JSON.parse(JSON.stringify(SOURCES)); src.sources = src.sources.filter(s => s.id === 'worldtri' || s.id === 'tri247' || s.id === 'slowtwitch');
  src.sources.forEach(s => { s.enabled = true; if (s.kind === 'rss') s.feeds = [`https://feeds.example/${s.id}.xml`]; delete s.site; });
  if (standings) src.standings = standings;
  fs.writeFileSync(path.join(d, 'data/sources.json'), JSON.stringify(src));
  if (news) fs.writeFileSync(path.join(d, 'data/news.json'), JSON.stringify(news));
  return d;
}
const rankRows = (names, top, step) => names.map((n, i) => ({rank: i + 1, athlete_title: n, athlete_noc: 'GER', athlete_id: 7000 + i + (top > 300 ? 100 : 0), total: top - i * step}));
const W12 = Array.from({length: 12}, (_, i) => `Woman Athlete${String.fromCharCode(65 + i)}`), M12 = Array.from({length: 12}, (_, i) => `Man Athlete${String.fromCharCode(65 + i)}`);
const WT = {
  '/rankings': [{ranking_id: 16, ranking_cat_name: 'World Triathlon Series', ranking_name: 'Elite Women', region_name: 'Elite Women', published: '2026-09-26 20:48:53'},
    {ranking_id: 15, ranking_cat_name: 'World Triathlon Series', ranking_name: 'Elite Men', region_name: 'Elite Men', published: '2026-09-27 18:32:55'},
    {ranking_id: 85, ranking_cat_name: 'T100 Triathlon World Tour', ranking_name: 'Elite Women', region_name: 'Elite Women', published: '2026-08-16 06:02:07'},
    {ranking_id: 84, ranking_cat_name: 'T100 Triathlon World Tour', ranking_name: 'Elite Men', region_name: 'Elite Men', published: '2026-09-20 08:46:28'}],
  '/rankings/16': {ranking_id: 16, rankings: rankRows(W12, 5250, 37.5)}, '/rankings/15': {ranking_id: 15, rankings: rankRows(M12, 5006.25, 37.5)},
  '/rankings/85': {ranking_id: 85, rankings: rankRows(W12.slice().reverse(), 64, 2)}, '/rankings/84': {ranking_id: 84, rankings: rankRows(M12.slice().reverse(), 96, 3)},
};
const ARTS = [['tri247', 'Tri247', 'https://www.tri247.com/pro-series-standings-harbor', '2026-09-29'], ['slowtwitch', 'Slowtwitch', 'https://www.slowtwitch.com/pro-series-leaderboard', '2026-09-30'],
  ['tri247', 'Tri247', 'https://www.tri247.com/pro-series-points-again', '2026-09-30']];
function net({standingsAnswer, pages = {}} = {}) {
  const log = [];
  const f = async (u, o = {}) => {
    u = String(u); log.push(u);
    const R = (b, s = 200) => new Response(typeof b === 'string' ? b : JSON.stringify(b), {status: s});
    if (u.startsWith('https://api.anthropic.com/')) { const b = JSON.parse(o.body); return R({content: [{type: 'text', text: /SERIES STANDINGS/.test(b.system) ? standingsAnswer(b) : 'NONE'}]}); }
    if (u.startsWith('https://api.triathlon.org/v1')) { const k = u.slice('https://api.triathlon.org/v1'.length); return k in WT ? R({status: 'success', data: WT[k]}) : R({status: 'error'}, 404); }
    if (u.endsWith('/robots.txt')) return R(u.includes('blocked.example') ? 'User-agent: *\nDisallow: /' : 'User-agent: *\nAllow: /');
    if (u.startsWith('https://feeds.example/')) return R('<rss><channel><title>x</title></channel></rss>');
    if (u in pages) return pages[u]();
    return R(`<html><article><p>Article ${u}</p></article></html>`);
  };
  return {f, log};
}
const prevDoc = () => { const d = emptyDoc(NOW); for (const [sid, src, url, date] of ARTS) d.items.push({id: `${sid}-${date}-${url.length}`, section: 'commentary', type: 'article', source: src, source_id: sid, title: `IRONMAN Pro Series standings after Harbor City (${url.slice(-6)})`, url, date, series: ['IRONMAN']}); return d; };
test('results job: WTCS + T100 top 10 per sex from World Triathlon, with the date it published them; Pro Series top 3 from two agreeing reports', async () => {
  const answer = b => { const t = b.messages[0].content; const pts = /slowtwitch/.test(t) ? [17210, 16890, 16400] : [17200, 16900, 16410];
    // the women agree across two publishers; the men do not (different order)
    const men = /slowtwitch/.test(t) ? ['Lucas Moreau', 'Jonas Berg', 'Kai Fischer'] : ['Lucas Moreau', 'Kai Fischer', 'Jonas Berg'];
    return JSON.stringify({standings: [...['Anna Keller', 'Ella Novak', 'Maya Brooks'].map((name, i) => ({sex: 'F', rank: i + 1, name, points: pts[i]})), ...men.map((name, i) => ({sex: 'M', rank: i + 1, name}))]}); };
  const d = tmpRoot({news: prevDoc()}), n = net({standingsAnswer: answer}), logs = [];
  const r = await run({job: 'results', root: d, now: NOW, fetchImpl: n.f, env: {ANTHROPIC_API_KEY: 'test', WT_API_KEY: 'wt-test', NEWS_CACHE_DIR: path.join(d, '.c')}, log: m => logs.push(m)});
  assert.deepEqual(r.problems, []);
  const doc = r.doc, rows = (ser, sx) => doc.standings.filter(s => s.series === ser && s.sex === sx).sort((a, b) => a.rank - b.rank);
  for (const ser of ['WTCS', 'T100']) for (const sx of ['F', 'M']) assert.equal(rows(ser, sx).length, 10, `${ser} ${sx}: the top 10`);
  assert.deepEqual(rows('WTCS', 'F').slice(0, 2).map(s => [s.rank, (doc.pros.find(p => p.id === s.pro_id) || {}).name, s.points, s.source]), [[1, 'Woman AthleteA', 5250, 'official'], [2, 'Woman AthleteB', 5212.5, 'official']]);
  assert.deepEqual(doc.standings_info.WTCS, {F: {updated: '2026-09-26', source: 'World Triathlon', ranking_id: 16}, M: {updated: '2026-09-27', source: 'World Triathlon', ranking_id: 15}});
  assert.deepEqual(doc.standings_info.T100.F, {updated: '2026-08-16', source: 'World Triathlon', ranking_id: 85}, 'each sex keeps its own date');
  assert.deepEqual(rows('Pro Series', 'F').map(s => [s.rank, s.pro_id, s.points, s.source]), [[1, 'anna-keller', 17210, 'reports'], [2, 'ella-novak', 16890, 'reports'], [3, 'maya-brooks', 16400, 'reports']]);
  const pi = doc.standings_info['Pro Series'].F; assert.equal(pi.updated, '2026-09-30'); assert.match(pi.source, /Tri247 · Slowtwitch|Slowtwitch · Tri247/); assert.equal(pi.reports.length, 2);
  assert.equal(rows('Pro Series', 'M').length, 0, 'the reports disagree on the men: nothing published'); assert.ok(!doc.standings_info['Pro Series'].M);
  assert.ok(logs.some(l => /Pro Series men from reports · \d+ reports with standings · no two reports agree/.test(l)));
  assert.ok(!logs.some(l => /T100 (wo)?men from reports/.test(l)), 'T100 came from the API: no report fallback');
  assert.deepEqual([...validate(SCHEMA, doc), ...checkRefs(doc)], []);
});
const STD = {
  T100: {women: [{url: 'https://t100.example/standings/old', verified: '2026-09-01'}, {url: 'https://t100.example/world-rankings/t100'}], men: [{url: 'https://t100.example/world-rankings/t100'}],
    backup_women: [{url: 'https://pto.example/t100/standings/women'}]},
  'Pro Series': {women: [{url: 'https://pro.example/standings', verified: '2026-09-01'}], men: [{url: 'https://series.example/', discover: true, match: 'pro-series/standings'}]},
  WTCS: {women: [{url: 'https://blocked.example/rankings/wtcs/women'}]},
};
const okPage = t => new Response(`<html><head><title>${t}</title></head><body>…</body></html>`, {status: 200});
const PAGES = {
  // the series' own site: its page is read only to find the standings link (the men's page first for the men)
  'https://series.example/': () => new Response('<a href="/">Home</a> <a href="/community/triclubs/global-rankings">Clubs</a> <a href="/pro-series/standings/women">Women</a> <a href="https://series.example/pro-series/standings/men">Men</a> <a href="https://elsewhere.example/standings">x</a>', {status: 200}),
  'https://series.example/pro-series/standings/men': () => okPage('Pro Series Standings – Men'),
  'https://t100.example/standings/old': () => new Response('gone', {status: 404}),
  'https://t100.example/world-rankings/t100': () => okPage('T100 Race To Qatar Standings'),
  'https://pto.example/t100/standings/women': () => okPage('T100 Standings | PTO Stats'),
  // a redirect to the home page (fetch follows it; the final URL is the home page)
  'https://pro.example/standings': () => ({status: 200, ok: true, url: 'https://pro.example/', text: async () => '<title>IRONMAN Pro Series</title>', headers: new Headers()}),
};
test('daily job: the official standings links are checked once a day; broken ones are reported (the workflow opens an issue)', async () => {
  const prev = emptyDoc(NOW); prev.standings_info = {WTCS: {links: {women: 'https://blocked.example/rankings/wtcs/women'}, links_checked: '2026-09-29T10:00:00Z'}};
  const d = tmpRoot({news: prev, standings: STD}), n = net({pages: PAGES}), logs = [];
  const r = await run({job: 'daily', root: d, now: NOW, fetchImpl: n.f, env: {NEWS_CACHE_DIR: path.join(d, '.c')}, log: m => logs.push(m)});
  assert.deepEqual(r.problems, []);
  const info = r.doc.standings_info;
  assert.deepEqual(info.T100.links, {women: 'https://t100.example/world-rankings/t100', men: 'https://t100.example/world-rankings/t100', backup_women: 'https://pto.example/t100/standings/women'}, 'the next candidate when the first is gone');
  assert.deepEqual(info['Pro Series'].links, {men: 'https://series.example/pro-series/standings/men'}, 'a redirect to the home page is not a standings link; the men\'s link found on the series site (never the site itself)');
  assert.ok(!n.log.includes('https://elsewhere.example/standings') && !n.log.includes('https://series.example/pro-series/standings/women') && !n.log.includes('https://series.example/community/triclubs/global-rankings'), 'only same-site links that match the series, the right sex first, and it stops at the first that works');
  assert.deepEqual(info.WTCS.links, {women: 'https://blocked.example/rankings/wtcs/women'}, 'robots.txt says no: the last working link stays (not re-checked)');
  assert.equal(info.T100.links_checked, '2026-10-01T12:00:00Z'); assert.equal(info.WTCS.links_checked, '2026-09-29T10:00:00Z', 'not checked: the old date stays');
  assert.ok(r.linksBroken.some(x => /T100 · women: https:\/\/t100\.example\/standings\/old \(HTTP 404\)/.test(x)), r.linksBroken.join('\n'));
  assert.ok(r.linksBroken.some(x => /Pro Series · women: https:\/\/pro\.example\/standings \(redirected to a home page/.test(x)));
  assert.ok(r.linksBroken.some(x => /Pro Series · women: no working standings link/.test(x)));
  assert.ok(logs.some(l => /^link T100 women: https:\/\/t100\.example\/world-rankings\/t100 → 200 · "T100 Race To Qatar Standings" · standings words: yes · names: 0\/0 · OK$/.test(l)), logs.join('\n'));
  assert.equal(n.log.filter(u => u === 'https://t100.example/world-rankings/t100').length, 1, 'one request per URL per run');
  // the next run, 1 hour later: not checked again (once a day)
  fs.writeFileSync(path.join(d, 'data/news.json'), JSON.stringify(r.doc));
  const n2 = net({pages: PAGES}); const r2 = await run({job: 'daily', root: d, now: NOW + 36e5, fetchImpl: n2.f, env: {NEWS_CACHE_DIR: path.join(d, '.c')}, log: () => {}});
  assert.ok(!n2.log.some(u => /t100\.example|pto\.example/.test(u)), 'checked once a day'); assert.deepEqual(r2.linksBroken.filter(x => /T100/.test(x)), []);
  assert.ok(CHECK_EVERY_MS >= 12 * 36e5);
  assert.deepEqual([...validate(SCHEMA, r.doc), ...checkRefs(r.doc)], []);
});
test('the schema: standings_info holds dates, a source, report links and https links only', () => {
  const bad = (mut, re) => { const d = emptyDoc(NOW); d.standings_info = {WTCS: {F: {updated: '2026-09-26', source: 'World Triathlon'}}}; mut(d); const p = validate(SCHEMA, d); assert.ok(p.some(x => re.test(x)), `${re} not in ${JSON.stringify(p)}`); };
  bad(d => { d.standings_info.IRONMAN = {}; }, /unexpected field IRONMAN/);
  bad(d => { d.standings_info.WTCS.F.updated = 'Sep 26'; }, /updated: does not match/);
  bad(d => { delete d.standings_info.WTCS.F.source; }, /missing source/);
  bad(d => { d.standings_info.WTCS.links = {women: 'http://triathlon.org/x'}; }, /women: does not match/);
  bad(d => { d.standings_info.WTCS.links = {kids: 'https://triathlon.org/x'}; }, /unexpected field kids/);
});
test('sources.json: every standings link is https and is a deep link (never a home page); the verified ones are listed first; T100 and WTCS have verified women\'s and men\'s links', () => {
  for (const ser of ['T100', 'WTCS', 'Pro Series']) for (const k of ['women', 'men']) assert.ok(SOURCES.standings[ser][k][0].verified, `${ser} ${k}: a verified link`);
  const std = SOURCES.standings; assert.ok(std && std['Pro Series'] && std.T100 && std.WTCS, 'all three series');
  for (const [ser, c] of Object.entries(std)) {
    if (ser.startsWith('_')) continue;
    for (const k of ['women', 'men']) assert.ok((c[k] || []).length, `${ser} ${k}: at least one link`);
    for (const [k, list] of Object.entries(c)) for (const [i, x] of (Array.isArray(list) ? list : []).entries()) {
      assert.match(x.url, /^https:\/\//, `${ser} ${k}`); assert.ok(x.discover || !isHomePath(x.url), `${ser} ${k}: ${x.url} is a home page (only a "discover" entry may be: it is never the link itself)`);
      if (x.verified) assert.ok(list.slice(0, i).every(y => y.verified), `${ser} ${k}: the verified links first`);
      if (x.discover) assert.ok(x.match, `${ser} ${k}: a discover entry names what its links must contain (e.g. "proseries/standings"), so another kind of ranking is never picked up`);
    }
  }
});
// ---------- the review's cases (item 21) ----------
test('the link check is not fooled: soft-404s, sign-in pages, redirects to an index, the other sex, the site name in the title; busy sites are not judged', () => {
  const pg = (t, body = '') => `<html><head><title>${t}</title></head><body>${body}</body></html>`, U = 'https://triathlon.org/world-rankings/t100/women';
  const j = o => judgeStandingsPage(Object.assign({url: U, status: 200, finalUrl: U, sex: 'women'}, o));
  assert.match(j({body: pg('Page not found | World Triathlon Rankings')}).reason, /not found/);
  assert.match(j({finalUrl: 'https://stats.protriathletes.org/login?next=/t100', url: 'https://stats.protriathletes.org/t100/standings/women', body: pg('Sign in · PTO Stats')}).reason, /another page|sign-in/);
  assert.match(j({finalUrl: 'https://triathlon.org/world-rankings', body: pg('World Rankings | World Triathlon')}).reason, /redirected to another page/);
  assert.equal(j({url: 'https://x.example/standings', finalUrl: 'https://x.example/standings/2026', body: pg('2026 Standings')}).ok, true, 'a deeper page of the same standings is fine');
  assert.equal(j({finalUrl: 'https://www.triathlon.org/world-rankings/t100/women/', body: pg('T100 Elite Women Standings | World Triathlon')}).ok, true, 'www and a trailing slash are the same page');
  assert.match(j({body: pg('T100 Elite Men Standings | World Triathlon')}).reason, /men's standings, not the women's/);
  assert.equal(j({body: pg('Season overview | World Triathlon Rankings')}).ok, false, 'the site name ("… Rankings") is not evidence');
  assert.equal(j({body: pg('Season overview', '<script>{"a":"Anna Keller","b":"Ella Novak","c":"Maya Brooks"}</script>'), names: ['Anna Keller', 'Ella Novak', 'Maya Brooks']}).ok, false, 'names inside page code do not count');
  assert.equal(j({body: pg('Season overview', '<table><tr><td>Anna Keller</td><td>Ella Novak</td><td>Maya Brooks</td></tr></table>'), names: ['Anna Keller', 'Ella Novak', 'Maya Brooks']}).ok, true, 'names in the page text do');
  for (const st of [429, 500, 503, 403]) assert.equal(j({status: st}).transient, true, `HTTP ${st}: not judged`);
  assert.equal(j({status: 404}).transient, false);
  const html = '<a href="/standings?division=women">W</a><a href="/standings?division=men">M</a><a href="/standings">All</a><a href="/news">N</a>';
  assert.deepEqual(standingsLinksOn(html, 'https://series.example/', 'men'), ['https://series.example/standings?division=men', 'https://series.example/standings'], 'the men: their own page, then the neutral one; never the women\'s');
  assert.deepEqual(standingsLinksOn(html, 'https://series.example/', 'women'), ['https://series.example/standings?division=women', 'https://series.example/standings']);
});
test('link state across days: a link judged broken now is not kept; each break is reported once; a busy site keeps the link; fixed links clear', async () => {
  const STD2 = {WTCS: {women: [{url: 'https://w.example/rankings/wtcs/women', verified: '2026-09-01'}, {url: 'https://blocked.example/rankings/wtcs/women'}], men: [{url: 'https://w.example/rankings/wtcs/men', verified: '2026-09-01'}]}};
  let womenUp = false;
  const pages = {'https://w.example/rankings/wtcs/women': () => womenUp ? okPage('WTCS Elite Women Standings') : new Response('gone', {status: 404}), 'https://w.example/rankings/wtcs/men': () => new Response('busy', {status: 503})};
  const prev = emptyDoc(NOW); prev.standings_info = {WTCS: {links: {women: 'https://w.example/rankings/wtcs/women', men: 'https://w.example/rankings/wtcs/men'}, links_checked: '2026-09-29T10:00:00Z'}};
  const d = tmpRoot({news: prev, standings: STD2});
  const day = async n => { const r = await run({job: 'daily', root: d, now: NOW + n * 864e5, fetchImpl: net({pages}).f, env: {NEWS_CACHE_DIR: path.join(d, '.c')}, log: () => {}}); fs.writeFileSync(path.join(d, 'data/news.json'), JSON.stringify(r.doc)); return r; };
  let r = await day(0);
  assert.equal(r.doc.standings_info.WTCS.links.women, undefined, 'the 404 link is not kept although the other candidate could not be checked (robots.txt)');
  assert.equal(r.doc.standings_info.WTCS.links.men, 'https://w.example/rankings/wtcs/men', 'a 503 proves nothing: the link stays');
  assert.deepEqual(r.linksBroken, ['WTCS · women: https://w.example/rankings/wtcs/women (HTTP 404)', 'WTCS · women: no working standings link left'], 'reported once; the busy men\'s link is not reported');
  assert.deepEqual(r.doc.standings_info.WTCS.reported, {women: 'https://w.example/rankings/wtcs/women'});
  r = await day(1); assert.deepEqual(r.linksBroken, [], 'the next day: already reported, no new issue comment');
  womenUp = true; r = await day(2);
  assert.equal(r.doc.standings_info.WTCS.links.women, 'https://w.example/rankings/wtcs/women'); assert.equal(r.doc.standings_info.WTCS.reported, undefined, 'it works again: cleared');
  assert.deepEqual([...validate(SCHEMA, r.doc), ...checkRefs(r.doc)], []);
});
test('a World Triathlon API error keeps the stored official standings (no report fallback over them)', async () => {
  const prev = emptyDoc(NOW); prev.pros.push({id: 'nora-ortiz', name: 'Nora Ortiz', links: {}}); prev.items.push(...prevDoc().items);
  prev.standings.push({series: 'T100', sex: 'F', rank: 1, pro_id: 'nora-ortiz', points: 175, source: 'official'}, {series: 'WTCS', sex: 'F', rank: 1, pro_id: 'nora-ortiz', points: 3450, source: 'official'});
  prev.standings_info = {T100: {F: {updated: '2026-09-20', source: 'World Triathlon', ranking_id: 85}}};
  const d = tmpRoot({news: prev}), logs = [];
  const n = net({standingsAnswer: () => JSON.stringify({standings: [1, 2, 3].map(i => ({sex: 'F', rank: i, name: `Report Pro${'ABC'[i - 1]}`}))})});
  const f = async (u, o) => /api\.triathlon\.org\/v1\/rankings/.test(String(u)) ? new Response('{"status":"error"}', {status: 502}) : n.f(u, o);
  const r = await run({job: 'results', root: d, now: NOW, fetchImpl: f, env: {ANTHROPIC_API_KEY: 'test', WT_API_KEY: 'wt-test', NEWS_CACHE_DIR: path.join(d, '.c')}, log: m => logs.push(m)});
  assert.deepEqual(r.problems, []);
  assert.deepEqual(r.doc.standings.filter(s => s.series !== 'Pro Series').map(s => [s.series, s.pro_id, s.source]), [['T100', 'nora-ortiz', 'official'], ['WTCS', 'nora-ortiz', 'official']]);
  assert.deepEqual(r.doc.standings_info.T100.F, {updated: '2026-09-20', source: 'World Triathlon', ranking_id: 85});
  assert.ok(logs.some(l => /rankings list failed .*the stored standings stay/.test(l)) && !logs.some(l => /T100 (wo)?men from reports/.test(l)));
});
