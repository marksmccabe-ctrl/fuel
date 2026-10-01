#!/usr/bin/env node
// fred News build (News spec p.10–12). node scripts/news/build.mjs <daily|weekend|results|pros|all> [--root DIR] [--now ISO] [--dry]
//   daily    6:00 + 18:00 ET   enabled RSS + podcast feeds → new items (Commentary when about pro racing, else Other), matched to races and
//                              pros by name; "In short" for new articles; a podcast time stamp only when the episode notes state one
//   weekend  Thu 6:00 ET       pro races in the next 10 days (WTCS from the World Triathlon API; IRONMAN / 70.3 / T100 from official
//                              announcements in data/calendar.json and from previews), pro start times with time zones, previews
//   results  Sun 21:00 + Mon 6:00 ET   last weekend's results (confidence rule), standings, 1–3 story lines per race
//   pros     1st of the month  each pro's links, kept only when confirmed by the athlete's own site or an official profile
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
import {makeModel, inShort, extractResults, storyLines, extractUpcoming} from './lib/ai.mjs';
import {wtClient, eventToRace, programStart, sexOfProgram, resultRows} from './lib/wt.mjs';
import {confirmResults} from './lib/confidence.mjs';

const DAY = 864e5;
export const LIMITS = {raceDays: 56, itemDays: 60, pros: 300, bytes: 400 * 1024, perFeed: 30, articleFetches: 5};
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
  let x = doc.races.find(y => y.id === r.id || (y.series === r.series && y.date === r.date && fold(y.name) === fold(r.name)));
  if (!x) { doc.races.push(r); return r; }
  // official facts are never replaced by unconfirmed ones
  if (x.confirmed && !r.confirmed) { for (const [k, v] of Object.entries(r)) if (x[k] == null && v != null && k !== 'confirmed') x[k] = v; return x; }
  Object.assign(x, Object.fromEntries(Object.entries(r).filter(([, v]) => v != null)));
  return x;
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
export async function jobDaily(ctx) {
  const {doc, sources, now} = ctx; const cutoff = iso(now - LIMITS.itemDays * DAY); const known = new Set(doc.items.map(i => i.url));
  doc.meta.sources = doc.meta.sources || {};
  for (const src of sources.sources.filter(s => s.enabled !== false && (s.kind === 'rss' || s.kind === 'podcast'))) {
    const st = {checked: nowIso(now)};
    try {
      const f = await resolveFeed(ctx, src); st.feed = f.url;
      const parsed = parseFeed(f.body); st.items = parsed.items.length; st.ok = true;
      const budget = {n: LIMITS.articleFetches};
      for (const it of parsed.items.slice(0, LIMITS.perFeed)) {
        const url = https(it.url); if (!url || known.has(url)) continue;
        const date = (it.published || nowIso(now)).slice(0, 10); if (date < cutoff || date > iso(now + DAY)) continue;
        const c = classify(it, src, {races: doc.races, pros: doc.pros}); if (!c.section) continue;
        const item = {id: slug(`${src.id}-${hash(url)}`), section: c.section, type: src.kind === 'podcast' ? 'episode' : 'article', source: src.name, source_id: src.id,
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
        doc.items.push(item); known.add(url);
      }
    } catch (e) { st.ok = false; st.error = String(e.message || e).slice(0, 200); ctx.log(`source ${src.id}: ${st.error}`); }
    doc.meta.sources[src.id] = st;
  }
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
  // official calendar entries kept in the repo (data/calendar.json): confirmed facts typed from official announcements
  for (const c of ctx.calendar || []) if (c.date >= from && c.date <= to) upsertRace(doc, Object.assign({confirmed: true}, c, {id: c.id || raceId(c.series, c.name, c.date)}));
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
        try { for (const l of (await storyLines(ctx.model, r.name, reports)) || []) doc.story.push({race_id: r.id, text: l.text, source: l.source, url: l.url}); } catch (e) { ctx.log(`story ${r.id}: ${e.message}`); }
      }
    }
  }
  // WTCS standings from the World Triathlon rankings (official)
  if (ctx.wt && wtSrc) {
    try {
      const list = await ctx.wt.rankings(); const name = fold(wtSrc.wtcs_ranking_name || 'World Triathlon Championship Series');
      for (const sx of ['F', 'M']) {
        const rk = list.find(x => { const n = fold(x.ranking_name || x.name || ''); return n.includes(name) && (sx === 'F' ? /women|female/.test(n) : /\bmen\b|\bmale\b/.test(n) && !/women/.test(n)); });
        if (!rk) continue; const rows = await ctx.wt.ranking(rk.ranking_id || rk.id);
        doc.standings = doc.standings.filter(s => !(s.series === 'WTCS' && s.sex === sx));
        for (const x of rows.slice(0, 10)) {
          const pro_id = ensurePro(doc, {name: x.athlete_title || [x.athlete_first, x.athlete_last].filter(Boolean).join(' '), country: x.athlete_noc, sex: sx, wt_athlete_id: +x.athlete_id || undefined}); const rank = parseInt(x.rank || x.position, 10);
          if (pro_id && rank > 0) doc.standings.push(Object.assign({series: 'WTCS', sex: sx, rank, pro_id, source: 'official'}, Number.isFinite(+x.total) ? {points: +x.total} : Number.isFinite(+x.points) ? {points: +x.points} : {}));
        }
      }
    } catch (e) { ctx.log(`standings: ${e.message}`); }
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
// ---------- limits: 8 weeks of races / results, 60 days of items, ≤ 300 pros, ≤ ~400 KB ----------
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
  const wt = wtSrc ? wtClient({apiKey: env[wtSrc.key_env || 'WT_API_KEY'], base: wtSrc.base, fetcher}) : null;
  const ctx = {doc, sources, fetcher, model, wt, now, log, calendar: loadJson(P('calendar.json'), {races: []}).races || []};
  const jobs = {daily: jobDaily, weekend: jobWeekend, results: jobResults, pros: jobPros};
  const list = job === 'all' ? ['daily', 'weekend', 'results', 'daily', 'pros'] : [job];
  for (const j of list) { if (!jobs[j]) throw new Error('unknown job ' + j); await jobs[j](ctx); doc.meta.jobs = Object.assign({}, doc.meta.jobs, {[j]: nowIso(now)}); }
  doc.meta.version = 1; doc.meta.updated_at = nowIso(now); doc.meta.ai = !!model; doc.meta.wt = !!wt; delete doc.meta.sample;
  prune(doc, now);
  const bad = problems(doc, schema);
  if (bad.length) return {changed: false, problems: bad, doc};
  const changed = !prev || stable(prev) !== stable(doc);
  if (changed && write) { const tmp = P('news.json.tmp'); fs.writeFileSync(tmp, JSON.stringify(doc, null, 1) + '\n'); fs.renameSync(tmp, P('news.json')); }
  return {changed, problems: [], doc, blocked: [!model && 'ANTHROPIC_API_KEY', !wt && 'WT_API_KEY'].filter(Boolean)};
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const a = process.argv.slice(2), job = a.find(x => !x.startsWith('--')) || 'daily', opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  const out = (k, v) => { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${String(v).replace(/\n/g, ' ')}\n`); };
  run({job, root: opt('--root') || undefined, now: opt('--now') ? Date.parse(opt('--now')) : Date.now(), write: !a.includes('--dry')}).then(r => {
    if (r.problems.length) { console.error('news.json NOT written: it fails the checks:\n' + r.problems.join('\n')); out('error', r.problems.slice(0, 5).join('; ')); process.exit(1); }
    const n = r.doc; console.log(`${job}: ${r.changed ? 'news.json updated' : 'no change'} · ${n.races.length} races · ${n.results.length} results · ${n.items.length} items · ${n.pros.length} pros`);
    if (r.blocked.length) console.log('BLOCKED (headlines and links only until set): ' + r.blocked.join(', '));
    out('changed', r.changed); out('blocked', r.blocked.join(','));
  }).catch(e => { console.error('news build failed: ' + (e && e.stack || e)); out('error', String(e && e.message || e)); process.exit(1); });
}
