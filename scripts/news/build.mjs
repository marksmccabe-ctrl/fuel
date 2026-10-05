#!/usr/bin/env node
// fred News build (News spec p.10–12). node scripts/news/build.mjs <daily|weekend|results|pros|all> [--root DIR] [--now ISO] [--dry]
//   daily    6:00 + 18:00 ET   enabled RSS + podcast feeds → new items (Commentary when about pro racing, else Other), matched to races and
//                              pros by name; "In short" for new articles; a podcast time stamp only when the episode notes state one;
//                              once a day, the official standings links are checked (lib/links.mjs)
//   weekend  Thu 6:00 ET       pro races in the next 10 days (WTCS from the World Triathlon API; IRONMAN / 70.3 / T100 from official
//                              announcements in data/pro-races.json and from previews), pro start times with time zones, previews
//   calendar (by hand, no network) data/pro-races.json merged into news.json (every other job merges it too, item 47)
//   results  Sun 21:00 + Mon 6:00 ET   last weekend's results (confidence rule), standings (WTCS + T100 top 10 from World Triathlon;
//                              the IRONMAN Pro Series full table from ironman.com, item 53), 1–3 story lines per race
//   pros     1st of the month  each pro's links, kept only when confirmed by the athlete's own site or an official profile
//   ironman.com (item 53, approved: docs/LEGAL.md; GitHub Actions only): the race calendar once a day (daily); the Pro Series standings once
//                              a day in a race week (daily) and on every results run; an error or a block stops ironman.com for the run and
//                              leaves the last good copy (data/ironman.json) in place. Nothing from it goes to the AI.
// Every job: build → validate (data/news.schema.json + cross-references) → write data/news.json only when valid and changed. On any error
// the previous file stays as it is and the process exits 1 (the workflow then opens an issue with the error).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validate, checkRefs} from './lib/schema.mjs';
import {parseFeed, isFeed, discoverFeeds, text as htmlText, timestampFor} from './lib/feed.mjs';
import {Fetcher, NO_SCRAPE} from './lib/fetch.mjs';
import {classify, matchPros, matchRaces, slug, fold, readMinutes} from './lib/match.mjs';
import {makeModel, inShort, extractResults, storyLines, extractUpcoming, extractStandings} from './lib/ai.mjs';
import {wtClient, eventToRace, programStart, sexOfProgram, resultRows, seriesRanking, wtStandingRows} from './lib/wt.mjs';
import {confirmResults} from './lib/confidence.mjs';
import {confirmStandings} from './lib/standings.mjs';
import {checkStandingsLinks, isHomePath, CHECK_EVERY_MS} from './lib/links.mjs';
import {emptyIm, imProblems, refreshIronman, mergeIronman, sameRace, isIronman, aiRaceName, IM_ABOUT} from './lib/ironman.mjs';

const DAY = 864e5;
export const LIMITS = {raceDays: 56, itemDays: 60, pros: 600, bytes: 400 * 1024, perFeed: 30, articleFetches: 5}; // item 53: the full Pro Series tables name every ranked pro
const iso = d => new Date(d).toISOString().slice(0, 10);
const nowIso = d => new Date(d).toISOString().replace(/\.\d{3}Z$/, 'Z');
const hash = s => crypto.createHash('sha1').update(String(s)).digest('hex').slice(0, 10);
const https = u => { try { const x = new URL(u); if (x.protocol === 'http:') x.protocol = 'https:'; return x.protocol === 'https:' ? x.href : null; } catch { return null; } };

export function emptyDoc(now) { return {meta: {version: 1, updated_at: nowIso(now)}, races: [], results: [], pros: [], story: [], items: [], standings: []}; }
export function loadJson(p, fallback) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; } }

// ---------- pros ----------
export function ensurePro(doc, {name, country, sex, wt_athlete_id}) {
  name = String(name || '').trim().replace(/\s+/g, ' '); if (!name) return null;
  const id = slug(name); if (!id) return null;
  let p = doc.pros.find(x => x.id === id) || (wt_athlete_id && doc.pros.find(x => x.wt_athlete_id === wt_athlete_id));
  if (!p) { p = {id, name, links: {}, links_checked: null}; doc.pros.push(p); }
  if (country && /^[A-Z]{3}$/.test(country) && !p.country) p.country = country;
  if (sex && !p.sex) p.sex = sex;
  if (wt_athlete_id && !p.wt_athlete_id) { p.wt_athlete_id = wt_athlete_id; p.links = p.links || {}; p.links.worldtri = p.links.worldtri || `https://triathlon.org/athletes/profile/${wt_athlete_id}`; }
  return p.id;
}
// ---------- races ----------
const seriesSlug = s => s === '70.3' ? '70-3' : s.toLowerCase();
export function raceId(series, name, date) {
  const place = String(name).replace(/ironman|70\.3|t100|wtcs|world triathlon championship series/gi, ' ').trim();
  return slug(`${seriesSlug(series)}-${place || name}-${String(date).slice(0, 4)}`);
}
export function upsertRace(doc, r) {
  let x = doc.races.find(y => y.id === r.id || (y.series === r.series && y.date === r.date && fold(y.name) === fold(r.name))) || doc.races.find(y => sameRace(y, r)); // item 53: one record per race
  if (!x) { doc.races.push(r); return r; }
  // official facts are never replaced by unconfirmed ones
  if (x.confirmed && !r.confirmed) { for (const [k, v] of Object.entries(r)) if (x[k] == null && v != null && k !== 'confirmed') x[k] = v; return x; }
  Object.assign(x, Object.fromEntries(Object.entries(r).filter(([, v]) => v != null)));
  return x;
}
// ---------- the pro-race calendar (item 47) ----------
// data/pro-races.json: IRONMAN, 70.3, T100 (and any WTCS) races typed from the organisers' official announcements. The World Triathlon API
// carries WTCS only, and previews name a race only when the AI key is set and a preview appears, so Kona never showed up: every job now
// merges the calendar's races of the weeks around today (confirmed: official facts). A link may list candidates (see checkCalendarLinks).
export const CAL_WINDOW = {back: 8, ahead: 21};
export const CAL_LINKS = ['official_url', 'start_lists', 'results_url'];
const calCands = (c, k) => (Array.isArray(c[k]) ? c[k] : c[k] ? [c[k]] : []).filter(u => /^https:\/\//.test(String(u)));
// a calendar entry → a race: a link is the first candidate that worked, else the first not yet found broken (none when all are broken)
export function calendarRace(c, checks = {}) {
  const r = {id: c.id || raceId(c.series, c.name, c.date), series: c.series, name: c.name, date: c.date, confirmed: true};
  for (const k of ['end_date', 'place', 'country', 'tz', 'distance', 'format', 'points', 'note', 'starts', 'tracking', 'watch']) if (c[k] != null) r[k] = c[k];
  for (const k of CAL_LINKS) { const cands = calCands(c, k); const u = cands.find(x => checks[x] && checks[x].ok) || cands.find(x => !(checks[x] && !checks[x].ok)); if (u) r[k] = u; }
  return r;
}
// item 53: an entry that ironman.com's calendar also lists (same race: series, date and name, lib/ironman.mjs sameRace) is left out; the
// ironman.com one is the race (pro-races.json keeps the T100 and other races typed by hand)
export const calDup = (ctx, c) => !!(ctx.im && ctx.im.calendar && ctx.im.calendar.races.some(x => sameRace(x, c)));
export function mergeCalendar(ctx) {
  const {doc, now} = ctx, from = iso(now - CAL_WINDOW.back * DAY), to = iso(now + CAL_WINDOW.ahead * DAY), checks = (doc.meta && doc.meta.calendar_links) || {};
  for (const c of ctx.calendar || []) if (c && c.series && c.name && /^\d{4}-\d\d-\d\d$/.test(c.date || '') && c.date >= from && c.date <= to) {
    if (calDup(ctx, c)) { if (!(ctx.calDupSaid || (ctx.calDupSaid = new Set())).has(c.name + c.date)) ctx.log(`pro-races.json: ${c.name} (${c.date}) is on ironman.com's calendar; that one is used (remove it from pro-races.json)`); ctx.calDupSaid.add(c.name + c.date); continue; }
    const r = calendarRace(c, checks), x = upsertRace(doc, r);
    for (const k of CAL_LINKS) if (calCands(c, k).length && !r[k]) delete x[k]; // its candidates are all broken now: no stale link stays
  }
}
// once a day: each listed candidate link of the calendar's races near today, in order, until one opens (HTTP 200, not redirected to a home
// page or another site; nothing on the page is read or kept). A busy or refusing site proves nothing (not stored). A race whose candidates
// are all broken is reported (the workflow opens an issue, like a broken standings link).
export async function checkCalendarLinks(ctx) {
  const {doc, now, fetcher, log} = ctx, broken = [], L = Object.assign({}, doc.meta.calendar_links), from = iso(now - CAL_WINDOW.back * DAY), to = iso(now + CAL_WINDOW.ahead * DAY);
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
  for (const c of ctx.calendar || []) {
    if (!(c && c.date >= from && c.date <= to)) continue;
    for (const k of CAL_LINKS) {
      const cands = calCands(c, k); if (!cands.length) continue;
      for (const u of cands) {
        if (isIronman(u)) { log(`calendar link ${c.name} ${k}: ${u} not checked (ironman.com: only the two approved pages are read, item 53)`); continue; }
        if (L[u] && now - Date.parse(L[u].checked) < CHECK_EVERY_MS) { if (L[u].ok) break; continue; }
        const r = await fetcher.get(u, {linkCheck: true});
        if (r.refused || !r.status || r.status === 429 || r.status >= 500 || r.status === 401 || r.status === 403) { log(`calendar link ${c.name} ${k}: ${u} not judged (${r.refused ? 'robots.txt says no' : r.status || r.error || 'no answer'})`); continue; }
        const fin = r.url || u, ok = r.status === 200 && !(isHomePath(fin) && !isHomePath(u)) && host(fin) === host(u);
        L[u] = {ok, checked: nowIso(now), status: r.status}; log(`calendar link ${c.name} ${k}: ${u} → ${r.status}${fin !== u ? ' → ' + fin : ''} · ${ok ? 'OK' : 'broken'}`);
        if (ok) break;
      }
      if (cands.every(u => L[u] && !L[u].ok)) broken.push(`Pro races · ${c.name} (${c.date}) · ${k}: no working link (${cands.join(', ')})`);
    }
  }
  const listed = new Set((ctx.calendar || []).flatMap(c => CAL_LINKS.flatMap(k => calCands(c || {}, k))));
  for (const u of Object.keys(L)) if (!listed.has(u)) delete L[u];
  if (Object.keys(L).length) doc.meta.calendar_links = L; else delete doc.meta.calendar_links;
  return broken;
}

// ---------- the jobs ----------
async function resolveFeed(ctx, src) {
  const tried = [], why = [];
  const tryUrl = async u => { if (tried.includes(u)) return null; tried.push(u); const r = await ctx.fetcher.get(u); if (r.ok && isFeed(r.body)) return {url: u, body: r.body};
    why.push(`${u}: ${r.refused ? 'robots.txt says no' : r.error || (r.ok ? 'not a feed' : 'HTTP ' + r.status)}`); return null; };
  for (const u of src.feeds || []) { const f = await tryUrl(u); if (f) return f; }
  if (src.site && src.kind === 'rss') { const r = await ctx.fetcher.get(src.site); if (r.ok) { for (const u of discoverFeeds(r.body, r.url || src.site)) { const f = await tryUrl(u); if (f) return f; } } else why.push(`${src.site}: ${r.error || 'HTTP ' + r.status}`); }
  if (src.itunes_id) {
    const r = await ctx.fetcher.json(`https://itunes.apple.com/lookup?id=${encodeURIComponent(src.itunes_id)}&entity=podcast`);
    const fu = r.json && r.json.results && r.json.results[0] && r.json.results[0].feedUrl;
    if (fu) { const f = await tryUrl(fu); if (f) return f; } else why.push('Apple directory: no feed URL');
  }
  throw new Error('no feed answered (' + (why.join('; ') || 'none listed') + ')');
}
// the article's words for this run only (robots.txt respected; IRONMAN / T100 / PTO pages never read); else the feed's description
async function articleText(ctx, it, budget) {
  if (budget.n <= 0) return it.description || '';
  const u = it.url; try { const h = new URL(u).hostname; if (NO_SCRAPE.some(re => re.test(h))) return it.description || ''; } catch { return it.description || ''; }
  budget.n--; const r = await ctx.fetcher.get(u);
  if (!r.ok || r.refused) return it.description || '';
  const body = /<article[\s>]/i.test(r.body) ? r.body.slice(r.body.search(/<article[\s>]/i)) : r.body;
  return htmlText(body).slice(0, 12000);
}
// item 53: ironman.com's facts (the last good copy, refreshed when due) go in before the hand-typed calendar
async function ironman(ctx, job) { await refreshIronman(ctx, job); mergeIronman(ctx, {raceId, ensurePro}); }
export async function jobDaily(ctx) {
  await ironman(ctx, 'daily');
  mergeCalendar(ctx); // item 47: the pro-race calendar every run, so its races are always there
  const {doc, sources, now} = ctx; const cutoff = iso(now - LIMITS.itemDays * DAY); const known = new Set(doc.items.map(i => i.id));
  doc.meta.sources = doc.meta.sources || {};
  for (const src of sources.sources.filter(s => s.enabled !== false && (s.kind === 'rss' || s.kind === 'podcast'))) {
    const st = {checked: nowIso(now)};
    try {
      const f = await resolveFeed(ctx, src); st.feed = f.url;
      const parsed = parseFeed(f.body); st.items = parsed.items.length; st.ok = true;
      const budget = {n: LIMITS.articleFetches};
      for (const it of parsed.items.slice(0, LIMITS.perFeed)) {
        const url = https(it.url); if (!url) continue;
        // the item's key: its URL (articles), or the episode's guid (podcast hosts often give every episode the show's page)
        const id = slug(`${src.id}-${hash(src.kind === 'podcast' ? (it.guid || url + '|' + it.title) : url)}`); if (known.has(id)) continue;
        const date = (it.published || nowIso(now)).slice(0, 10); if (date < cutoff || date > iso(now + DAY)) continue;
        const c = classify(it, src, {races: doc.races, pros: doc.pros}); if (!c.section) continue;
        const item = {id, section: c.section, type: src.kind === 'podcast' ? 'episode' : 'article', source: src.name, source_id: src.id,
          title: it.title.slice(0, 200), url, date};
        if (it.published) item.published = it.published;
        if (c.kind) item.kind = c.kind;
        if (c.race_ids.length) item.race_ids = c.race_ids.slice(0, 6);
        if (c.pro_ids.length) item.pro_ids = c.pro_ids.slice(0, 12);
        if (c.series && c.series.length) item.series = c.series.slice(0, 4);
        for (const k of ['category', 'sub', 'sports', 'tested']) if (c[k] !== undefined && c[k] !== null) item[k] = c[k];
        if (src.kind === 'podcast') {
          if (it.duration) item.minutes = Math.min(600, it.duration);
          const names = doc.races.filter(r => (item.race_ids || []).includes(r.id)).flatMap(r => [r.name, r.place]);
          const ts = names.length ? timestampFor(it.description, names) : null; if (ts) item.timestamp = ts;
        } else {
          let words = it.words, txt = it.description || '';
          if (ctx.model || !readMinutes(words)) { txt = await articleText(ctx, it, budget); words = Math.max(words, txt.split(/\s+/).length); }
          const m = readMinutes(words); if (m) item.minutes = m;
          if (ctx.model) { try { const s = await inShort(ctx.model, {title: it.title, text: txt}); if (s) item.in_short = s; } catch (e) { ctx.log(`in_short ${src.id}: ${e.message}`); } }
        }
        doc.items.push(item); known.add(id);
      }
    } catch (e) { st.ok = false; st.error = String(e.message || e).slice(0, 200); ctx.log(`source ${src.id}: ${st.error}`); }
    doc.meta.sources[src.id] = st;
  }
  ctx.linksBroken = [...(ctx.linksBroken || []), ...await checkStandingsLinks(ctx), ...await checkCalendarLinks(ctx)]; // job "all" runs daily twice: keep both; item 47: the calendar's links
  mergeCalendar(ctx); // the links as checked just now
  rematch(doc);
}
// re-run the name matching on every item (new races and pros arrive with the weekend and results jobs)
export function rematch(doc) {
  for (const i of doc.items) {
    if (i.section !== 'commentary') continue;
    const txt = i.title; // titles only: descriptions are not kept
    const r = [...new Set([...(i.race_ids || []), ...matchRaces(txt, i.published || i.date, doc.races)])], p = [...new Set([...(i.pro_ids || []), ...matchPros(txt, doc.pros)])];
    if (r.length) i.race_ids = r.slice(0, 6); if (p.length) i.pro_ids = p.slice(0, 12);
  }
}
export async function jobWeekend(ctx) {
  const {doc, sources, now} = ctx, from = iso(now), to = iso(now + 10 * DAY);
  await ironman(ctx, 'weekend'); // the stored copy only (no request)
  // official calendar entries kept in the repo (data/pro-races.json): confirmed facts typed from official announcements (item 47)
  mergeCalendar(ctx);
  // WTCS from the World Triathlon API
  const wtSrc = sources.sources.find(s => s.kind === 'api' && s.enabled !== false);
  if (ctx.wt && wtSrc) {
    for (const ev of await ctx.wt.events(wtSrc.wtcs_category_id, from, to)) {
      const r = eventToRace(ev); if (!r) continue;
      try { for (const p of await ctx.wt.programs(r.wt_event_id)) { const sx = sexOfProgram(p), st = programStart(p); if (sx && st) { r.starts = r.starts || {}; r.starts[sx === 'F' ? 'women' : 'men'] = st; } } } catch (e) { ctx.log(`programs ${r.id}: ${e.message}`); }
      upsertRace(doc, r);
    }
  }
  // IRONMAN / 70.3 / T100 named in previews (unconfirmed unless an official source; start times only when the preview states them)
  if (ctx.model) {
    const previews = doc.items.filter(i => i.section === 'commentary' && i.kind === 'preview' && i.type === 'article' && i.date >= iso(now - 10 * DAY)).slice(0, 8);
    const budget = {n: 8};
    for (const it of previews) {
      let ups = null; try { ups = await extractUpcoming(ctx.model, {title: it.title, text: await articleText(ctx, it, budget)}); } catch (e) { ctx.log(`upcoming ${it.id}: ${e.message}`); }
      for (const u of ups || []) {
        if (u.series === 'WTCS' || u.date < from || u.date > to) continue;
        const official = !!(sources.sources.find(s => s.id === it.source_id) || {}).official;
        const r = upsertRace(doc, Object.assign({id: raceId(u.series, u.name, u.date), series: u.series, name: u.name, date: u.date, confirmed: official}, u.place ? {place: u.place} : {}, u.tz ? {tz: u.tz} : {}, u.starts ? {starts: u.starts} : {}));
        for (const p of u.pros) { const id = ensurePro(doc, p); if (!id) continue; r.pros_to_watch = r.pros_to_watch || []; if (!r.pros_to_watch.some(w => w.pro_id === id) && r.pros_to_watch.length < 12) r.pros_to_watch.push({pro_id: id, sex: p.sex}); }
      }
    }
  }
  // the reason next to each pro to watch: their standing in the race's series, or "won last weekend"
  for (const r of doc.races.filter(x => x.date >= from && x.date <= to)) {
    const ser = r.series === 'T100' ? 'T100' : r.series === 'WTCS' ? 'WTCS' : 'Pro Series';
    for (const w of r.pros_to_watch || []) {
      const s = doc.standings.find(x => x.series === ser && x.pro_id === w.pro_id && x.rank <= 10);
      const won = doc.results.find(x => x.pro_id === w.pro_id && x.place === 1 && (doc.races.find(y => y.id === x.race_id) || {}).date >= iso(now - 9 * DAY));
      if (s) w.reason = `${ser} #${s.rank}`; else if (won) w.reason = 'won last weekend';
    }
  }
  rematch(doc);
}
export async function jobResults(ctx) {
  await ironman(ctx, 'results'); // item 53: the Pro Series standings on every results run
  mergeCalendar(ctx); // item 47
  const {doc, sources, now} = ctx, from = iso(now - 8 * DAY), today = iso(now);
  const wtSrc = sources.sources.find(s => s.kind === 'api' && s.enabled !== false);
  // last weekend's WTCS races straight from the API (they may not have been in the file before)
  if (ctx.wt && wtSrc) { try { for (const ev of await ctx.wt.events(wtSrc.wtcs_category_id, from, today)) { const r = eventToRace(ev); if (r) upsertRace(doc, r); } } catch (e) { ctx.log(`events: ${e.message}`); } }
  for (const r of doc.races.filter(x => x.date >= from && x.date <= today)) {
    let rows = [];
    if (r.series === 'WTCS' && ctx.wt && r.wt_event_id) {
      for (const p of await ctx.wt.programs(r.wt_event_id)) {
        const sx = sexOfProgram(p); if (!sx) continue;
        const st = programStart(p); if (st) { r.starts = r.starts || {}; r.starts[sx === 'F' ? 'women' : 'men'] = st; }
        const res = resultRows(await ctx.wt.results(r.wt_event_id, p.prog_id), 10);
        for (const x of res) rows.push(Object.assign({sex: sx, place: x.place, name: x.pro.name, country: x.pro.country, wt_athlete_id: x.pro.wt_athlete_id}, x.time ? {time: x.time} : {}, x.splits ? {splits: x.splits} : {}));
      }
      if (rows.length) rows = confirmResults([{source: 'World Triathlon', url: r.results_url || 'https://triathlon.org/', official: true, rows}]).map((x, i) => Object.assign(x, {wt_athlete_id: rows.find(y => y.sex === x.sex && y.place === x.place).wt_athlete_id}));
    } else if (r.series !== 'WTCS' && ctx.model) {
      const recaps = doc.items.filter(i => i.section === 'commentary' && i.kind === 'recap' && i.type === 'article' && (i.race_ids || []).includes(r.id)).slice(0, 6);
      const budget = {n: 6}, claims = [];
      for (const it of recaps) {
        try { const rows1 = await extractResults(ctx.model, {title: it.title, text: await articleText(ctx, it, budget)}); if (rows1 && rows1.length) claims.push({source: it.source, url: it.url, official: !!(sources.sources.find(s => s.id === it.source_id) || {}).official, rows: rows1}); }
        catch (e) { ctx.log(`extract ${it.id}: ${e.message}`); }
      }
      rows = confirmResults(claims);
    }
    if (rows.length) {
      doc.results = doc.results.filter(x => x.race_id !== r.id);
      for (const x of rows) {
        const pro_id = ensurePro(doc, {name: x.name, country: x.country, sex: x.sex, wt_athlete_id: x.wt_athlete_id}); if (!pro_id) continue;
        const o = {race_id: r.id, sex: x.sex, place: x.place, pro_id, source: x.source}; if (x.time) o.time = x.time; o.splits = x.splits || null; if (x.source_urls && x.source_urls.length) o.source_urls = x.source_urls.map(https).filter(Boolean);
        doc.results.push(o);
      }
    }
    // the story: 1–3 lines from the recaps (each line names one report and links it)
    if (ctx.model && !doc.story.some(s => s.race_id === r.id)) {
      const recaps = doc.items.filter(i => i.section === 'commentary' && i.kind === 'recap' && i.type === 'article' && (i.race_ids || []).includes(r.id)).slice(0, 5);
      if (recaps.length) {
        const budget = {n: 5}, reports = []; for (const it of recaps) reports.push({source: it.source, url: it.url, title: it.title, text: await articleText(ctx, it, budget)});
        try { for (const l of (await storyLines(ctx.model, aiRaceName(r), reports)) || []) doc.story.push({race_id: r.id, text: l.text, source: l.source, url: l.url}); } catch (e) { ctx.log(`story ${r.id}: ${e.message}`); }
      }
    }
  }
  // WTCS and T100 standings: the top 10 from the World Triathlon rankings (official; World Triathlon publishes the T100 World Tour ranking,
  // "Race To Qatar", too). The date shown is the date World Triathlon published that ranking.
  doc.standings_info = doc.standings_info || {};
  const setInfo = (ser, sx, o) => { const i = doc.standings_info[ser] = doc.standings_info[ser] || {}; i[sx] = o; };
  const fromWt = new Set(); // series+sex the World Triathlon API lists (a request that fails keeps the stored official rows; no fallback)
  let wtListed = false;
  if (ctx.wt && wtSrc) {
    let list = null;
    try { list = await ctx.wt.rankings(); wtListed = true; } catch (e) { ctx.log(`standings: the rankings list failed (${e.message}); the stored standings stay`); }
    if (list) ctx.log(`WT rankings: ${list.map(x => `${x.ranking_id}=${x.ranking_cat_name || ''} / ${x.ranking_name || ''}`).join(' | ')}`.slice(0, 4000));
    for (const ser of ['WTCS', 'T100']) for (const sx of ['F', 'M']) {
      if (!list) break;
      const who = `${ser} ${sx === 'F' ? 'women' : 'men'}`;
      const rk = seriesRanking(list, sx, ser, ser === 'WTCS' ? wtSrc.wtcs_ranking_name : '');
      if (!rk) { ctx.log(`standings: no ${who} ranking among ${list.length}`); continue; }
      fromWt.add(ser + sx);
      try {
        const rows = await ctx.wt.ranking(rk.ranking_id || rk.id);
        ctx.log(`standings: ${who} = ranking ${rk.ranking_id} "${rk.ranking_cat_name} / ${rk.ranking_name}" (${rk.week || rk.published || ''}) · ${rows.length} rows`);
        const got = wtStandingRows(rows).slice(0, 10);
        if (!got.length) { ctx.log(`standings: ${who} rows unreadable · ${JSON.stringify(rows.slice(0, 1)).slice(0, 400)}`); continue; }
        ctx.log(`standings: ${who} top 3 · ${got.slice(0, 3).map(x => `${x.rank}. ${x.name} ${x.points ?? '?'}`).join(' · ')}`);
        doc.standings = doc.standings.filter(s => !(s.series === ser && s.sex === sx));
        for (const x of got) {
          const pro_id = ensurePro(doc, {name: x.name, country: x.country, sex: sx, wt_athlete_id: x.wt_athlete_id});
          if (pro_id) doc.standings.push(Object.assign({series: ser, sex: sx, rank: x.rank, pro_id, source: 'official'}, x.points != null ? {points: x.points} : {}));
        }
        const pub = /^\d{4}-\d{2}-\d{2}/.exec(String(rk.published || ''));
        const prevInfo = ((doc.standings_info[ser] || {})[sx]) || {};
        setInfo(ser, sx, Object.assign({updated: pub ? pub[0] : prevInfo.updated || today, source: 'World Triathlon'}, rk.ranking_id ? {ranking_id: +rk.ranking_id} : {}));
      } catch (e) { ctx.log(`standings: ${who}: ${e.message}; the stored rows stay`); }
    }
  }
  // T100 (top 10) from two independent reports that agree, only if the World Triathlon API did not give it. The IRONMAN Pro Series comes
  // from ironman.com now (item 53: the two-reports rule is gone for the Pro Series, and its data never goes to the AI).
  if (ctx.model) {
    // T100 from reports only when the API answered and lists no T100 ranking (never because a request failed)
    const t100 = !ctx.wt || wtListed ? ['F', 'M'].filter(sx => !fromWt.has('T100' + sx)) : [];
    const plan = t100.length ? [{ser: 'T100', re: /\bt100\b/i, series: ['T100'], topN: 10, sexes: t100}] : [];
    for (const {ser, re, series, topN, sexes} of plan) {
      // articles about the standings first (the series named in the title), then the series' recaps of the last 3 weeks; at most 6 read
      const recent = doc.items.filter(i => i.type === 'article' && i.date >= iso(now - 21 * DAY));
      // the title must name the series and talk standings or points
      const about = recent.filter(i => re.test(i.title) && /standing|points|lead|ranking|leaderboard|race to/i.test(i.title)), aboutIds = new Set(about.map(i => i.id));
      const arts = [...new Set([...about, ...recent.filter(i => i.kind === 'recap' && (i.series || []).some(x => series.includes(x)))])].slice(0, 6);
      const budget = {n: 6}, claims = [];
      for (const it of arts) {
        try { const rows = await extractStandings(ctx.model, {series: 'T100 Triathlon World Tour', title: it.title, text: await articleText(ctx, it, budget), topN});
          // a race recap counts only when it gives series points for every row (so a race podium is never read as the standings)
          if (rows && rows.length && (aboutIds.has(it.id) || rows.every(r => r.points != null))) claims.push({source: it.source, url: it.url, date: it.published || it.date, rows}); }
        catch (e) { ctx.log(`standings ${ser} ${it.id}: ${e.message}`); }
      }
      for (const sx of sexes) {
        const ok = confirmStandings(claims, sx, {topN, minRows: Math.min(3, topN)});
        ctx.log(`standings: ${ser} ${sx === 'F' ? 'women' : 'men'} from reports · ${claims.length} reports with standings · ${ok ? `${ok.rows.length} agreed (${ok.sources.join(' + ')})` : 'no two reports agree'}`);
        if (!ok) continue;
        doc.standings = doc.standings.filter(s => !(s.series === ser && s.sex === sx));
        for (const x of ok.rows) { const pro_id = ensurePro(doc, {name: x.name, country: x.country, sex: sx}); if (pro_id) doc.standings.push(Object.assign({series: ser, sex: sx, rank: x.rank, pro_id, source: 'reports'}, x.points != null ? {points: x.points} : {})); }
        const reports = ok.sources.map((name, i) => ({name: String(name).slice(0, 60), url: https(ok.source_urls[i])})).filter(r => r.url);
        setInfo(ser, sx, {updated: String(ok.date || today).slice(0, 10), source: [...new Set(ok.sources)].join(' · ').slice(0, 80), reports});
      }
    }
  }
  rematch(doc);
}
// links confirmed from the athlete's own site or an official profile (the World Triathlon profile comes from the official API id)
const LINK_RES = {instagram: /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]{2,30}\/?$/, strava: /^https:\/\/(www\.)?strava\.com\/(athletes|pros)\/[A-Za-z0-9_-]+\/?$/, pto: /^https:\/\/stats\.protriathletes\.org\/athlete\/[A-Za-z0-9_-]+\/?$/,
  ironman: /^https:\/\/(www\.)?ironman\.com\/(pro-athletes|pro-series\/athletes|athletes)\/[A-Za-z0-9_-]+\/?$/, t100: /^https:\/\/(www\.)?t100triathlon\.com\/(athletes|athlete)\/[A-Za-z0-9_-]+\/?$/, worldtri: /^https:\/\/(www\.)?triathlon\.org\/athletes\/profile\/\d+(\/[A-Za-z0-9_-]+)?\/?$/};
export function linksFrom(html, base) {
  const out = {}; const re = /href\s*=\s*["']([^"']+)["']/gi; let m;
  while ((m = re.exec(String(html || '')))) { let u; try { u = new URL(m[1], base); } catch { continue; } u.protocol = 'https:'; u.search = ''; u.hash = ''; const h = u.href; for (const [k, rx] of Object.entries(LINK_RES)) if (!out[k] && rx.test(h)) out[k] = h; }
  return out;
}
export async function jobPros(ctx) {
  const {doc, now} = ctx, today = iso(now);
  for (const p of doc.pros) {
    const confirmed = {}, prev = p.links || {}; let reached = true;
    if (p.wt_athlete_id) {
      confirmed.worldtri = `https://triathlon.org/athletes/profile/${p.wt_athlete_id}`;
      // the official World Triathlon profile (API): any of its fields that hold a website or a known profile link
      if (ctx.wt) { try { const a = await ctx.wt.athlete(p.wt_athlete_id); for (const [k, v] of Object.entries(a || {})) { if (typeof v !== 'string') continue; const u = https(v.trim()); if (!u) continue;
        if (/website|homepage|url_personal/i.test(k) && !confirmed.website) confirmed.website = u; for (const [lk, rx] of Object.entries(LINK_RES)) if (!confirmed[lk] && rx.test(u)) confirmed[lk] = u; } } catch (e) { reached = false; ctx.log(`athlete ${p.id}: ${e.message}`); } }
    }
    const site = confirmed.website || prev.website;
    if (site) {
      const r = await ctx.fetcher.get(site);
      if (r.ok) { confirmed.website = site; for (const [k, v] of Object.entries(linksFrom(r.body, r.url))) if (!confirmed[k]) confirmed[k] = v; } else reached = false;
    }
    // a site that could not be read this month keeps last month's confirmed links (not refuted, just not re-checked)
    p.links = reached ? confirmed : Object.assign({}, prev, confirmed);
    if (reached) p.links_checked = today;
  }
}
// ---------- limits: 8 weeks of races / results, 60 days of items, ≤ 600 pros, ≤ ~400 KB ----------
export function prune(doc, now) {
  const rc = iso(now - LIMITS.raceDays * DAY), ic = iso(now - LIMITS.itemDays * DAY);
  doc.races = doc.races.filter(r => (r.end_date || r.date) >= rc).sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
  const races = new Set(doc.races.map(r => r.id));
  doc.results = doc.results.filter(r => races.has(r.race_id)); doc.story = doc.story.filter(s => races.has(s.race_id));
  doc.items = doc.items.filter(i => i.date >= ic).sort((a, b) => (b.published || b.date).localeCompare(a.published || a.date));
  for (const i of doc.items) { if (i.race_ids) { i.race_ids = i.race_ids.filter(id => races.has(id)); if (!i.race_ids.length) delete i.race_ids; } }
  // pros: everyone referenced first, then by name; at most 300
  const used = new Set([...doc.results.map(r => r.pro_id), ...doc.standings.map(s => s.pro_id), ...doc.races.flatMap(r => (r.pros_to_watch || []).map(w => w.pro_id)), ...doc.items.flatMap(i => i.pro_ids || [])]);
  doc.pros = doc.pros.filter(p => used.has(p.id)).sort((a, b) => a.name.localeCompare(b.name)).slice(0, LIMITS.pros);
  const pros = new Set(doc.pros.map(p => p.id));
  doc.results = doc.results.filter(r => pros.has(r.pro_id)); doc.standings = doc.standings.filter(s => pros.has(s.pro_id));
  for (const r of doc.races) if (r.pros_to_watch) { r.pros_to_watch = r.pros_to_watch.filter(w => pros.has(w.pro_id)); if (!r.pros_to_watch.length) delete r.pros_to_watch; }
  for (const i of doc.items) if (i.pro_ids) { i.pro_ids = i.pro_ids.filter(id => pros.has(id)); if (!i.pro_ids.length) delete i.pro_ids; }
  while (Buffer.byteLength(JSON.stringify(doc)) > LIMITS.bytes && doc.items.length) doc.items.pop(); // the oldest items go first
  return doc;
}
export function problems(doc, schema) { return [...validate(schema, doc), ...checkRefs(doc)]; }
const stable = d => JSON.stringify(Object.assign({}, d, {meta: Object.assign({}, d.meta, {updated_at: null, jobs: null, sources: d.meta.sources ? Object.fromEntries(Object.entries(d.meta.sources).map(([k, v]) => [k, Object.assign({}, v, {checked: null})])) : null})}));

// run one job (or all) and write data/news.json when valid and changed. Returns {changed, problems, log}
export async function run({job = 'daily', root, now = Date.now(), fetchImpl, env = process.env, write = true, log = m => console.log(m)} = {}) {
  root = root || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const P = f => path.join(root, 'data', f);
  const schema = loadJson(P('news.schema.json'), null); if (!schema) throw new Error('data/news.schema.json missing or unreadable');
  const sources = loadJson(P('sources.json'), null); if (!sources || !Array.isArray(sources.sources)) throw new Error('data/sources.json missing or unreadable');
  const prev = loadJson(P('news.json'), null);
  const doc = prev && !prev.meta?.sample ? JSON.parse(JSON.stringify(prev)) : emptyDoc(now);
  const fetcher = new Fetcher({fetchImpl, cacheDir: env.NEWS_CACHE_DIR || path.join(root, '.news-cache'), log});
  const model = makeModel({apiKey: env.ANTHROPIC_API_KEY, fetchImpl, log});
  const wtSrc = sources.sources.find(s => s.kind === 'api' && s.enabled !== false);
  const wt = wtSrc ? wtClient({apiKey: env[wtSrc.key_env || 'WT_API_KEY'], base: wtSrc.base, fetcher, log}) : null;
  const imPrev = loadJson(P('ironman.json'), null), im = imPrev && !imProblems(imPrev).length ? JSON.parse(JSON.stringify(imPrev)) : emptyIm(); // item 53: the last good copy
  if (imPrev && imProblems(imPrev).length) log(`data/ironman.json fails its check (${imProblems(imPrev).slice(0, 3).join('; ')}); starting from an empty copy`);
  const ctx = {doc, sources, fetcher, model, wt, now, log, env, im, calendar: [...(loadJson(P('pro-races.json'), {races: []}).races || []), ...(loadJson(P('calendar.json'), {races: []}).races || [])]}; // item 47: pro-races.json (calendar.json: the old name)
  const jobs = {daily: jobDaily, weekend: jobWeekend, results: jobResults, pros: jobPros, calendar: async c => { mergeIronman(c, {raceId, ensurePro}); mergeCalendar(c); }}; // calendar: no network (item 47; item 53: the stored ironman.com copy)
  const list = job === 'all' ? ['daily', 'weekend', 'results', 'daily', 'pros'] : [job];
  for (const j of list) { if (!jobs[j]) throw new Error('unknown job ' + j); await jobs[j](ctx); doc.meta.jobs = Object.assign({}, doc.meta.jobs, {[j]: nowIso(now)}); }
  doc.meta.version = 1; doc.meta.updated_at = nowIso(now); if (job !== 'calendar') { doc.meta.ai = !!model; doc.meta.wt = !!wt; } else { doc.meta.ai = !!doc.meta.ai; doc.meta.wt = !!doc.meta.wt; } delete doc.meta.sample; // the calendar job needs no keys and leaves their flags
  prune(doc, now);
  const bad = problems(doc, schema);
  // data/ironman.json: written when a request was made (its attempt is recorded, so "once a day" holds) and the file passes its check
  im.about = IM_ABOUT; const imBad = imProblems(im), imChanged = !!ctx.imChanged && !imBad.length && JSON.stringify(im) !== JSON.stringify(imPrev);
  if (imBad.length) log(`data/ironman.json NOT written: ${imBad.slice(0, 5).join('; ')}`);
  if (imChanged && write) { const tmp = P('ironman.json.tmp'); fs.writeFileSync(tmp, JSON.stringify(im, null, 1) + '\n'); fs.renameSync(tmp, P('ironman.json')); }
  if (bad.length) return {changed: imChanged, newsChanged: false, imChanged, problems: bad, doc, im, linksBroken: ctx.linksBroken || []};
  const newsChanged = !prev || stable(prev) !== stable(doc);
  if (newsChanged && write) { const tmp = P('news.json.tmp'); fs.writeFileSync(tmp, JSON.stringify(doc, null, 1) + '\n'); fs.renameSync(tmp, P('news.json')); }
  return {changed: newsChanged || imChanged, newsChanged, imChanged, problems: [], doc, im, blocked: job === 'calendar' ? [] : [!model && 'ANTHROPIC_API_KEY', !wt && 'WT_API_KEY'].filter(Boolean), linksBroken: ctx.linksBroken || []};
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const a = process.argv.slice(2), job = a.find(x => !x.startsWith('--')) || 'daily', opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  const out = (k, v) => { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${String(v).replace(/\n/g, ' ')}\n`); };
  run({job, root: opt('--root') || undefined, now: opt('--now') ? Date.parse(opt('--now')) : Date.now(), write: !a.includes('--dry')}).then(r => {
    if (r.problems.length) { console.error('news.json NOT written: it fails the checks:\n' + r.problems.join('\n')); out('error', r.problems.slice(0, 5).join('; ')); process.exit(1); }
    const n = r.doc; console.log(`${job}: ${r.newsChanged ? 'news.json updated' : 'no change'}${r.imChanged ? ' · ironman.json updated' : ''} · ${n.races.length} races · ${n.results.length} results · ${n.items.length} items · ${n.pros.length} pros`);
    if (r.blocked.length) console.log('BLOCKED (headlines and links only until set): ' + r.blocked.join(', '));
    out('changed', r.changed); out('blocked', r.blocked.join(','));
    if (r.linksBroken.length) { console.log('STANDINGS LINKS BROKEN:\n- ' + r.linksBroken.join('\n- ')); out('links_broken', r.linksBroken.join(' | ')); }
  }).catch(e => { console.error('news build failed: ' + (e && e.stack || e)); out('error', String(e && e.message || e)); process.exit(1); });
}
