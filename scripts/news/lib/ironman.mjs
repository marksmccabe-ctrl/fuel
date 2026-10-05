// IRONMAN Pro Series standings and the upcoming IRONMAN / IRONMAN 70.3 race calendar, read from ironman.com (item 53). IRONMAN approved fred
// reading exactly these two things (docs/LEGAL.md). Nothing else on ironman.com is ever requested: IM_ALLOW is enforced by lib/fetch.mjs on
// every request, redirects included, so a link check, a feed or an article on ironman.com is refused before it reaches the network.
// Facts only: rank, athlete, country, points and races counted; race name, date, place, series flags and the official race page link. The
// pages themselves are never stored (not even in the job's cache); data/ironman.json keeps the last good facts. None of it goes to the AI.
import {fold, slug} from './match.mjs';

const DAY = 864e5;
const iso = d => new Date(d).toISOString().slice(0, 10);
const nowIso = d => new Date(d).toISOString().replace(/\.\d{3}Z$/, 'Z');
export const IM_PAGES = {standings: 'https://www.ironman.com/proseries/standings', calendar: 'https://www.ironman.com/races'};
// the attribution shown with the data (and its official link)
export const IM_ATTR = {standings: {label: 'IRONMAN Pro Series', url: IM_PAGES.standings}, calendar: {label: 'IRONMAN', url: IM_PAGES.calendar}};
// the only ironman.com URLs fred ever requests (no query strings, no other host)
export const IM_ALLOW = [
  /^https:\/\/www\.ironman\.com\/robots\.txt$/,                      // the site's crawl rules, read before the two pages (RFC 9309)
  /^https:\/\/www\.ironman\.com\/proseries\/standings(\/20\d\d)?\/?$/, // (a) the Pro Series standings (the page redirects to the current season)
  /^https:\/\/www\.ironman\.com\/races\/?$/,                         // (b) the upcoming race calendar
];
export const isIronman = u => { try { return /(^|\.)ironman\.com$/i.test(new URL(u).hostname); } catch { return false; } };
export function imAllowed(u) {
  try { const x = new URL(u); return x.protocol === 'https:' && !x.username && !x.password && !x.search && !x.hash && x.port === '' && IM_ALLOW.some(re => re.test(x.origin + x.pathname)); }
  catch { return false; }
}
// once a day for the calendar; the standings once a day in a race week (a Pro Series race Monday–Sunday) plus every news-results run
export const IM_RESULTS_GAP_MS = 6 * 36e5; // the results job runs Sunday night and Monday morning; "all" never asks twice

// ---------- the last good copy (data/ironman.json) ----------
export function emptyIm() { return {about: IM_ABOUT, standings: null, calendar: null, attempts: {}}; }
export const IM_ABOUT = 'Facts read from ironman.com by the GitHub Actions news jobs (item 53, approved by IRONMAN: docs/LEGAL.md): the IRONMAN Pro Series standings (rank, athlete, country, points, races counted) and the upcoming IRONMAN and IRONMAN 70.3 races (name, date, place, series flags, official race page). The last good copy: a failed or blocked request leaves it as it is. Never passed to the AI. Written by scripts/news/build.mjs; do not edit by hand.';
const SEXES = ['F', 'M'];
// the file's own check (a bad file is never written): → [] when valid
export function imProblems(im) {
  const out = [], str = (v, n) => typeof v === 'string' && v.length > 0 && v.length <= n, date = v => /^\d{4}-\d{2}-\d{2}$/.test(v || ''), dt = v => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(v || '');
  const url = v => typeof v === 'string' && /^https:\/\/([a-z0-9-]+\.)*ironman\.com\/[^\s]{0,300}$/i.test(v);
  if (!im || typeof im !== 'object') return ['not an object'];
  for (const k of Object.keys(im)) if (!['about', 'standings', 'calendar', 'attempts'].includes(k)) out.push(`unexpected field ${k}`);
  const s = im.standings;
  if (s != null) {
    if (!dt(s.fetched)) out.push('standings.fetched'); if (!url(s.url)) out.push('standings.url');
    for (const sx of SEXES) { const rows = s[sx]; if (!Array.isArray(rows) || rows.length > 400) { out.push(`standings.${sx}`); continue; }
      rows.forEach((r, i) => { if (!(Number.isInteger(r.rank) && r.rank >= 1) || !str(r.name, 80) || (r.country != null && !str(r.country, 60)) || (r.points != null && !(Number.isFinite(r.points) && r.points >= 0))
        || (r.races != null && !(Number.isInteger(r.races) && r.races >= 0 && r.races <= 99)) || Object.keys(r).some(k => !['rank', 'name', 'country', 'points', 'races'].includes(k))) out.push(`standings.${sx}[${i}]`); }); }
    for (const k of Object.keys(s)) if (!['fetched', 'url', 'F', 'M'].includes(k)) out.push(`standings: unexpected field ${k}`);
  }
  const c = im.calendar;
  if (c != null) {
    if (!dt(c.fetched)) out.push('calendar.fetched'); if (!url(c.url)) out.push('calendar.url');
    if (!Array.isArray(c.races) || c.races.length > 600) out.push('calendar.races');
    else c.races.forEach((r, i) => { if (!['IRONMAN', '70.3'].includes(r.series) || !str(r.name, 80) || !date(r.date) || (r.place != null && !str(r.place, 80)) || (r.url != null && !url(r.url))
      || (r.flags != null && !(Array.isArray(r.flags) && r.flags.every(f => IM_FLAGS.includes(f)))) || Object.keys(r).some(k => !['series', 'name', 'date', 'place', 'flags', 'url'].includes(k))) out.push(`calendar.races[${i}]`); });
    for (const k of Object.keys(c)) if (!['fetched', 'url', 'races'].includes(k)) out.push(`calendar: unexpected field ${k}`);
  }
  const a = im.attempts;
  if (!a || typeof a !== 'object') out.push('attempts');
  else for (const [k, v] of Object.entries(a)) { if (!['standings', 'calendar'].includes(k) || !v || !dt(v.at) || typeof v.ok !== 'boolean' || (v.error != null && !str(v.error, 200)) || (v.status != null && !Number.isInteger(v.status))) out.push(`attempts.${k}`); }
  return out.slice(0, 30);
}

// ---------- the page: a block, an error, or a page to read ----------
const CHALLENGE = /<title>\s*(just a moment|attention required|access denied|request unsuccessful|pardon our interruption|are you a (robot|human))|cf-chl-|challenge-platform|_incapsula_resource|px-captcha|captcha-delivery\.com|datadome/i;
// → '' when the answer is a page to read, else why not (an error or a block)
export function imBlocked(r) {
  if (!r) return 'no answer';
  if (r.refused) return r.error || 'robots.txt says no';
  if (!r.status) return r.error || 'no answer';
  if (r.status === 401 || r.status === 403 || r.status === 429) return `HTTP ${r.status} (blocked)`;
  if (r.status !== 200) return `HTTP ${r.status}`;
  if (CHALLENGE.test(String(r.body || '').slice(0, 300000))) return 'a bot check page instead of the page (blocked)';
  return '';
}

// ---------- HTML and embedded JSON ----------
const ENT = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…', eacute: 'é', egrave: 'è', aacute: 'á', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', uuml: 'ü', ouml: 'ö', auml: 'ä', ccedil: 'ç', oslash: 'ø', aring: 'å', szlig: 'ß'};
export const decode = s => String(s ?? '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => e[0] === '#' ? (() => { const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1); return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : ''; })() : ENT[e.toLowerCase()] ?? m);
export const textOf = h => decode(String(h ?? '').replace(/<(script|style|noscript|template|svg)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const clean = (s, n = 80) => decode(String(s ?? '')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
// the JSON a page carries for its own scripts: JSON / JSON-LD script blocks, Next.js and Drupal settings, "window.x = {…};" assignments
export function jsonBlobs(html) {
  const out = [], re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m;
  while ((m = re.exec(String(html || '')))) {
    const attrs = m[1], body = m[2].trim(); if (!body || body.length > 8e6) continue;
    if (/type\s*=\s*["']application\/(ld\+)?json["']/i.test(attrs) || /id\s*=\s*["']__NEXT_DATA__["']/i.test(attrs)) { try { out.push(JSON.parse(body)); } catch {} continue; }
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const a = /^(?:window\.|self\.|var\s+|let\s+|const\s+)?[\w$.[\]"']+\s*=\s*([[{][\s\S]*[\]}])\s*;?\s*$/.exec(body); if (a) { try { out.push(JSON.parse(a[1])); } catch {} }
  }
  return out;
}
// every array of objects inside a JSON value, with the keys on its path (depth-limited)
function arraysIn(v) {
  const out = [], walk = (x, path, d, hint) => {
    if (d > 16 || x == null || typeof x !== 'object') return;
    if (Array.isArray(x)) { if (x.length && x.filter(y => y && typeof y === 'object' && !Array.isArray(y)).length >= x.length * 0.8) out.push({path, list: x, hint}); x.forEach(y => walk(y, path, d + 1, hint)); return; }
    const own = Object.entries(x).filter(([k, y]) => typeof y === 'string' && /^(gender|sex|division(_?name)?|category|group|label|title|name|tab)$/i.test(k)).map(([, y]) => sexCode(y)).find(Boolean);
    for (const [k, y] of Object.entries(x)) walk(y, [...path, k], d + 1, own || hint);
  };
  walk(v, [], 0, null); return out;
}
const keyFor = (o, re) => Object.keys(o).find(k => re.test(k));
const val = (o, re) => { const k = keyFor(o, re); return k == null ? undefined : o[k]; };
const num = v => { if (typeof v === 'number') return Number.isFinite(v) ? v : null; const s = String(v ?? '').replace(/[\s  ]/g, '').replace(/pts?\.?$/i, '');
  if (!/^-?[\d.,]+$/.test(s)) return null; let t = s; if (/,\d{3}(\D|$)/.test(t) && !/\.\d{3}(\D|$)/.test(t)) t = t.replace(/,/g, ''); else if (/\.\d{3}(\D|$)/.test(t) && /,\d{1,2}$/.test(t)) t = t.replace(/\./g, '').replace(',', '.'); else t = t.replace(/,/g, '.');
  const n = Number(t); return Number.isFinite(n) ? n : null; };
const int = v => { const m = /\d+/.exec(String(v ?? '')); return m ? +m[0] : null; };
// a sex named in a label, a heading, an id or class (never a lone letter: "m-4" is a margin); null when both or neither
export function sexOf(s) { const t = fold(s), f = /\b(women|womens|female|females|ladies|fpro|f-pro)\b/.test(t), m = /\b(men|mens|male|males|mpro|m-pro)\b/.test(t); return f && !m ? 'F' : m && !f ? 'M' : null; }
// a sex field's value ("F", "W", "M", "female", "MPRO" …)
export const sexCode = v => { const t = String(v ?? '').trim(); return /^(f|w)$/i.test(t) ? 'F' : /^m$/i.test(t) ? 'M' : sexOf(t); };
const nameOf = o => { if (!o || typeof o !== 'object') return typeof o === 'string' ? clean(o) : '';
  const f = val(o, /^(first_?name|given_?name|firstname)$/i), l = val(o, /^(last_?name|family_?name|surname|lastname)$/i); if (typeof f === 'string' && typeof l === 'string') return clean(`${f} ${l}`);
  const n = val(o, /^(name|full_?name|display_?name|athlete_?name|athlete_?title|title)$/i); return typeof n === 'string' ? clean(n) : ''; };
const countryOf = o => { const c = val(o, /^(country(_?code|_?iso\d?|_?name)?|nation(ality)?|noc|ctry|flag)$/i); if (c == null) return '';
  if (typeof c === 'object') return clean(val(c, /^(code|iso\d?|alpha3|abbr|name)$/i) || '', 60); return clean(c, 60); };

// ---------- (a) the Pro Series standings ----------
const RANK = /^(rank|ranking|position|pos|place|overall_?rank|current_?rank)$/i, POINTS = /^(points|total_?points|pts|total|score|season_?points)$/i;
const RACES = /^(races(_?counted|_?count)?|race_?count|events(_?counted)?|number_?of_?races|num_?races|results_?count|counted)$/i, SEX = /^(gender|sex|division|category|group)$/i;
function rowFromObj(o) {
  const ath = val(o, /^(athlete|pro|competitor|person|participant)$/i), name = nameOf(o) || nameOf(ath), rank = int(val(o, RANK)), points = num(val(o, POINTS));
  let races = val(o, RACES); races = Array.isArray(races) ? races.length : int(races);
  const country = countryOf(o) || (ath && typeof ath === 'object' ? countryOf(ath) : '');
  const sx = val(o, SEX) ?? (ath && typeof ath === 'object' ? val(ath, SEX) : undefined);
  return {rank, name, points, races, country, sex: typeof sx === 'string' ? sexCode(sx) : null};
}
// HTML tables: the header row names the columns (rank, athlete, country, points, races); the sex comes from the nearest marker before the
// table (a heading, a tab panel, an id / class / label naming women or men) or a gender column
const COLS = {rank: /^(rank|rk|pos\.?|position|place|#)$/i, name: /athlete|name|^pro$/i, country: /country|nation|nat\.?$|^noc$|flag/i, points: /points|^pts\.?$|^total$/i, races: /races|events|counted|starts/i, sex: /^(gender|sex|division)$/i};
function cellsOf(rowHtml) { const out = [], re = /<(t[hd])\b([^>]*)>([\s\S]*?)<\/t[hd]>/gi; let m; while ((m = re.exec(rowHtml))) out.push({th: m[1].toLowerCase() === 'th', attrs: m[2], html: m[3], text: textOf(m[3])}); return out; }
const cellCountry = c => c.text || clean((/<img\b[^>]*\b(?:alt|title)\s*=\s*["']([^"']+)["']/i.exec(c.html) || [])[1] || '', 60) || clean((/\bflag[-_ ]([a-z]{2,3})\b/i.exec(c.html + ' ' + c.attrs) || [])[1] || '', 3).toUpperCase();
function markerBefore(html, at) {
  const win = html.slice(Math.max(0, at - 6000), at); let best = null;
  const re = /<(h[1-6]|caption|legend|div|section|article|li|span|p|ul|ol)\b([^>]*)>([^<]{0,60})/gi; let m;
  while ((m = re.exec(win))) { const attrs = m[2], tag = m[1].toLowerCase();
    if (/role\s*=\s*["']tab["']/i.test(attrs)) continue; // a tab button names one sex after the other: the panel decides
    const a = sexOf([...attrs.matchAll(/\b(?:id|class|aria-label|aria-labelledby|data-[\w-]+)\s*=\s*["']([^"']*)["']/gi)].map(x => x[1]).join(' '));
    const t = /^h[1-6]$|caption|legend/.test(tag) ? sexOf(m[3]) : null;
    if (a || t) best = a || t; }
  return best;
}
function standingsFromTables(html) {
  const rows = [], tabs = [], re = /<table\b[\s\S]*?<\/table>/gi; let m;
  while ((m = re.exec(html))) {
    const t = m[0], trs = [...t.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map(x => cellsOf(x[0])).filter(c => c.length);
    const hi = trs.findIndex(c => c.some(x => x.th) || c.some(x => COLS.points.test(x.text))); if (hi < 0) continue;
    const head = trs[hi].map(x => x.text), col = {}; for (const [k, re2] of Object.entries(COLS)) { const i = head.findIndex(h => re2.test(h)); if (i >= 0) col[k] = i; }
    if (col.name == null || col.points == null) continue;
    const tabSex = sexOf((/^<table\b([^>]*)>/i.exec(t) || [])[1] || '') || sexOf(textOf((/<caption\b[\s\S]*?<\/caption>/i.exec(t) || [''])[0])) || markerBefore(html, m.index);
    const mine = []; tabs.push({at: m.index, sex: tabSex, rows: mine});
    trs.slice(hi + 1).forEach((c, k) => { if (c.length < 2) return; const g = i => (i == null ? null : c[i]);
      const name = clean(g(col.name) ? g(col.name).text : ''); if (!name || COLS.name.test(name)) return;
      mine.push({rank: int(g(col.rank) ? g(col.rank).text : k + 1), name, country: g(col.country) ? cellCountry(g(col.country)) : '', points: num(g(col.points) ? g(col.points).text : null),
        races: g(col.races) ? int(g(col.races).text) : null, sex: (g(col.sex) && sexCode(g(col.sex).text)) || null, how: 'table'}); });
  }
  const used = tabs.filter(t => t.rows.length);
  if (used.length === 2 && !(used[0].sex && used[1].sex && used[0].sex !== used[1].sex)) {
    // tabs or two headings above both tables: the sexes in the order the page names them first
    const order = [...textOf(html.slice(0, used[0].at)).matchAll(/\b(women|men)\b/gi)].map(x => x[1].toLowerCase() === 'women' ? 'F' : 'M').filter((x, i, a) => a.indexOf(x) === i);
    if (order.length === 2) { used[0].sex = order[0]; used[1].sex = order[1]; }
  }
  for (const t of used) for (const r of t.rows) rows.push(Object.assign(r, {sex: r.sex || t.sex}));
  return rows;
}
function standingsFromJson(html) {
  const rows = [];
  for (const blob of jsonBlobs(html)) for (const {path, list, hint} of arraysIn(blob)) {
    const got = list.map(rowFromObj).filter(r => r.name && r.rank >= 1 && r.points != null); if (got.length < 3 || got.length < list.length * 0.6) continue;
    const ps = sexOf(path.join(' ')) || hint; got.forEach(r => rows.push(Object.assign(r, {sex: r.sex || ps, how: 'json'})));
  }
  return rows;
}
// → {F:[…], M:[…]} (ranks from 1, by rank) or {error, outline}
export function parseStandings(html, {url = IM_PAGES.standings} = {}) {
  const page = String(html || '');
  const pickSex = rows => { const by = {F: new Map(), M: new Map()};
    for (const r of rows) { if (!by[r.sex]) continue; const k = fold(r.name); if (!by[r.sex].has(k)) by[r.sex].set(k, r); }
    return Object.fromEntries(SEXES.map(sx => [sx, [...by[sx].values()].sort((a, b) => a.rank - b.rank).map(r => Object.assign({rank: r.rank, name: r.name.slice(0, 80)},
      r.country ? {country: r.country.slice(0, 60)} : {}, r.points != null ? {points: Math.round(r.points * 100) / 100} : {}, r.races != null && r.races <= 99 ? {races: r.races} : {}))])); };
  for (const how of [standingsFromJson, standingsFromTables]) {
    const out = pickSex(how(page));
    if (SEXES.every(sx => out[sx].length >= 3 && out[sx][0].rank === 1)) return out;
  }
  return {error: 'the standings page was not recognised (no table of rank, athlete and points for women and for men)', outline: outline(page)};
}

// ---------- (b) the race calendar ----------
export const IM_FLAGS = ['Pro Series', 'World Championship', 'Regional Championship'];
const MON = {jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12};
const pad = n => String(n).padStart(2, '0');
const okDate = (y, m, d) => y >= 2000 && y < 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31 ? `${y}-${pad(m)}-${pad(d)}` : null;
// the first date in a piece of text: 2026-10-10 · Oct 10, 2026 · October 9–10, 2026 · 10 Oct 2026 · Sat, Oct 10 2026 (US numeric dates are not guessed)
export function dateIn(s) {
  const t = String(s || ''); let m;
  if ((m = /\b(20\d\d)-(\d\d)-(\d\d)/.exec(t))) return okDate(+m[1], +m[2], +m[3]);
  if ((m = /\b(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:\s*[-–]\s*(?:[a-z]{3,9}\.?\s+)?\d{1,2})?(?:st|nd|rd|th)?,?\s+(20\d\d)\b/i.exec(t))) return okDate(+m[3], MON[m[1].toLowerCase()], +m[2]);
  if ((m = /\b(\d{1,2})(?:\s*[-–]\s*\d{1,2})?(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\.?,?\s+(20\d\d)\b/i.exec(t))) return okDate(+m[3], MON[m[2].toLowerCase()], +m[1]);
  return null;
}
const seriesOfName = n => /\b70\.3\b/.test(n) ? '70.3' : /\bironman\b/i.test(n) && !/\b(5150|sprint|olympic|ironkids|iron ?girl|virtual|vr\d*|kids|run series|swim)\b/i.test(n) ? 'IRONMAN' : null;
const flagsOf = (name, extra) => { const t = `${name} ${extra || ''}`;
  return [/\bpro\s*series\b/i.test(t) && 'Pro Series', /\bworld championships?\b/i.test(name) && 'World Championship',
    /\b(regional|continental|north american|european|asia[- ]pacific|african|latin american|south american|oceania|middle east|asian)\s+championships?\b/i.test(name) && 'Regional Championship'].filter(Boolean); };
const raceLink = (u, base) => { try { const x = new URL(String(u || ''), base || IM_PAGES.calendar); x.protocol = 'https:'; x.hash = ''; x.search = ''; return /(^|\.)ironman\.com$/i.test(x.hostname) && x.pathname.length > 1 ? x.href.slice(0, 300) : null; } catch { return null; } };
function imRace({name, date, place, url, extra}, base) {
  name = clean(name).replace(/\s*\|\s*IRONMAN.*$/i, ''); const series = seriesOfName(name); if (!name || !series || !date) return null;
  const r = {series, name: name.slice(0, 80), date}; const p = clean(place || ''); if (p && !/^\d/.test(p) && fold(p) !== fold(name)) r.place = p.slice(0, 80);
  const f = flagsOf(name, extra); if (f.length) r.flags = f; const l = raceLink(url, base); if (l) r.url = l; return r;
}
const placeOf = o => { const l = val(o, /^(location|place|venue|address|city_?state|city)$/i);
  if (typeof l === 'string') return l; if (l && typeof l === 'object') { if (typeof l.name === 'string' && !l.address) return l.name;
    const a = l.address && typeof l.address === 'object' ? l.address : l; return [val(a, /^(address_?locality|city|locality)$/i), val(a, /^(address_?region|state|region)$/i), val(a, /^(address_?country|country(_?name)?)$/i)].map(x => typeof x === 'object' && x ? x.name : x).filter(x => typeof x === 'string' && x).join(', '); }
  const c = [val(o, /^city$/i), val(o, /^(state|region)$/i), val(o, /^country(_?name)?$/i)].filter(x => typeof x === 'string' && x); return c.join(', '); };
const flagText = o => Object.entries(o).filter(([k, v]) => (/pro_?series|series|tag|badge|label|category|type|keywords|super_?event/i.test(k)) && v != null).map(([k, v]) => (v === true ? k : typeof v === 'object' ? JSON.stringify(v) : String(v))).join(' ').slice(0, 400);
function calendarFromJson(html, base) {
  const out = [];
  for (const blob of jsonBlobs(html)) {
    // JSON-LD events (an Event / SportsEvent, an ItemList of them, or a @graph)
    for (const {list} of arraysIn({x: [blob]})) for (const o of list) { const all = [o, ...(Array.isArray(o['@graph']) ? o['@graph'] : []), ...(Array.isArray(o.itemListElement) ? o.itemListElement.map(e => e.item || e) : [])];
      for (const e of all) if (e && /event/i.test(String(e['@type'] || '')) && e.name && e.startDate) { const r = imRace({name: e.name, date: dateIn(e.startDate), place: placeOf(e), url: e.url, extra: flagText(e)}, base); if (r) out.push(r); } }
    // any list of race objects (a name, a date; a place and a link when given)
    for (const {list} of arraysIn(blob)) {
      const got = list.map(o => { const dk = keyFor(o, /^(start_?date|date|event_?date|race_?date|start|date_?start|from)$/i), dv = dk ? o[dk] : null;
        const d = typeof dv === 'number' ? (dv > 1e12 ? iso(dv) : dv > 1e9 ? iso(dv * 1000) : null) : dk ? dateIn(typeof dv === 'object' && dv ? JSON.stringify(dv) : dv) : null;
        return d ? imRace({name: nameOf(o), date: d, place: placeOf(o), url: val(o, /^(url|link|path|href|race_?url|page_?url|alias)$/i), extra: flagText(o)}, base) : null; }).filter(Boolean);
      if (got.length >= 3) out.push(...got);
    }
  }
  return out;
}
// race cards: a link to a race page (/races/… on ironman.com, or the site's own race slugs) inside the smallest box (article, li, div, section,
// tr) that holds that race's link and a date but no other race's link; the name is the link's text (or a heading in the card) that names an
// IRONMAN or 70.3 race; the place, the element whose class says location / city / place / venue
const RACE_PATH = /^\/(races\/[a-z0-9-]+|im(703)?-[a-z0-9-]+)\/?$/i;
function raceLinksIn(html, base) {
  const out = [], re = /<a\b([^>]*\bhref\s*=\s*["']([^"'#]+)["'][^>]*)>([\s\S]*?)<\/a>/gi; let m;
  while ((m = re.exec(html))) { const u = raceLink(decode(m[2]), base); if (!u || !RACE_PATH.test(new URL(u).pathname)) continue;
    out.push({u, at: m.index, end: re.lastIndex, text: textOf(m[3]), label: decode((/\b(?:title|aria-label)\s*=\s*["']([^"']+)["']/i.exec(m[1]) || [])[1] || '')}); }
  return out;
}
function closeOf(html, start, tag) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi'); re.lastIndex = start; let d = 0, m;
  while ((m = re.exec(html))) { if (/\/>$/.test(m[0])) continue; d += m[1] ? -1 : 1; if (d === 0) return re.lastIndex; if (re.lastIndex - start > 30000) return -1; }
  return -1;
}
function cardAround(html, l, base) {
  const from = Math.max(0, l.at - 5000), opens = [...html.slice(from, l.at).matchAll(/<(article|li|div|section|tr)\b[^>]*>/gi)].reverse();
  for (const o of opens) {
    const s = from + o.index, e = closeOf(html, s, o[1].toLowerCase()); if (e < 0 || e < l.end) continue;
    const inner = html.slice(s, e); if (raceLinksIn(inner, base).some(x => x.u !== l.u)) return null; // a box with another race: past the card
    if (/<time\b[^>]*datetime/i.test(inner) || dateIn(textOf(inner))) return inner;
  }
  return null;
}
function calendarFromHtml(html, base) {
  const out = [], done = new Set();
  for (const l of raceLinksIn(html, base)) {
    if (done.has(l.u + '@' + l.at)) continue;
    const card = cardAround(html, l, base); if (!card) continue;
    const tm = /<time\b[^>]*datetime\s*=\s*["']([^"']+)["']/i.exec(card), date = (tm && dateIn(tm[1])) || dateIn(textOf(card)); if (!date) continue;
    const heads = [...card.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map(x => textOf(x[1])), cardLinks = raceLinksIn(card, base);
    const name = [...cardLinks.flatMap(x => [x.text, x.label]), ...heads].map(x => clean(x)).find(x => seriesOfName(x)) || '';
    const pl = /<[a-z0-9]+\b[^>]*class\s*=\s*["'][^"']*?(location|city|place|venue)[^"']*["'][^>]*>([^<]{2,120})</i.exec(card);
    const r = imRace({name, date, place: pl ? textOf(pl[2]) : '', url: l.u, extra: textOf(card).slice(0, 2000)}, base); if (r) out.push(r);
  }
  return out;
}
// → {races:[…]} (upcoming, from today − 14 days; by date) or {error, outline}
export function parseCalendar(html, {now = Date.now(), url = IM_PAGES.calendar} = {}) {
  const page = String(html || ''), from = iso(now - 14 * DAY), to = iso(now + 2 * 366 * DAY);
  for (const how of [calendarFromJson, calendarFromHtml]) {
    const seen = new Map();
    for (const r of how(page, url)) { if (r.date < from || r.date > to) continue; const k = `${r.date}|${slug(r.name)}`, x = seen.get(k);
      if (!x) seen.set(k, r); else { if (!x.place && r.place) x.place = r.place; if (!x.url && r.url) x.url = r.url; if (r.flags) x.flags = [...new Set([...(x.flags || []), ...r.flags])].sort((a, b) => IM_FLAGS.indexOf(a) - IM_FLAGS.indexOf(b)); } }
    const races = [...seen.values()].sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
    if (races.length >= 5) return {races};
  }
  return {error: 'the race calendar page was not recognised (fewer than 5 upcoming IRONMAN / 70.3 races with a name and a date)', outline: outline(page)};
}
// what a page that was not recognised is made of (tags, script blocks, JSON keys, race links): for the job log, so the parser can be fixed.
// Counts and key names only, never the page's words.
export function outline(html) {
  const h = String(html || ''), c = re => (h.match(re) || []).length, keys = new Set();
  for (const b of jsonBlobs(h).slice(0, 8)) for (const {path, list} of arraysIn(b).slice(0, 12)) keys.add(`${path.slice(-3).join('.') || '(root)'}[${list.length}]{${Object.keys(list[0] || {}).slice(0, 12).join(',')}}`);
  return `${h.length} bytes · ${c(/<table\b/gi)} tables · ${c(/<tr\b/gi)} rows · ${c(/<script\b/gi)} scripts (${c(/application\/(ld\+)?json/gi)} JSON, next ${/__NEXT_DATA__/.test(h) ? 'yes' : 'no'}) · ${c(/href\s*=\s*["'][^"']*\/races\//gi)} race links · ${c(/<time\b/gi)} time tags · JSON lists: ${[...keys].slice(0, 12).join(' | ') || 'none'}`;
}

// ---------- which pages a job asks for ----------
// a race week: Monday–Sunday (UTC) of today holds a Pro Series race (or a World Championship; the hand-typed pro-race calendar counts too)
export function raceWeek(now, races) {
  const d = new Date(now), dow = (d.getUTCDay() + 6) % 7, mon = iso(now - dow * DAY), sun = iso(now + (6 - dow) * DAY);
  return (races || []).some(r => r && (r.series === 'IRONMAN' || r.series === '70.3') && r.date >= mon && r.date <= sun && (r.pro || (r.flags || []).some(f => f === 'Pro Series' || f === 'World Championship')));
}
export function imDue(kind, job, {now, im, races}) {
  const at = ((im.attempts || {})[kind] || {}).at, last = at ? Date.parse(at) : 0, today = !!last && iso(last) === iso(now);
  if (kind === 'calendar') return job === 'daily' && !today;
  if (job === 'results') return !last || now - last >= IM_RESULTS_GAP_MS;
  return job === 'daily' && !today && raceWeek(now, races);
}
// read the pages a job is due for (GitHub Actions only); stop at the first error or block, log it, keep the last good copy
export async function refreshIronman(ctx, job) {
  const {fetcher, log, now} = ctx, im = ctx.im;
  if (!['daily', 'results'].includes(job)) return;
  if (String((ctx.env || {}).GITHUB_ACTIONS) !== 'true') { if (!ctx.imSaidLocal) log('ironman.com: not read here (only the GitHub Actions news jobs read it); the last good copy stays'); ctx.imSaidLocal = true; return; }
  const races = [...((im.calendar && im.calendar.races) || []), ...(ctx.calendar || []).map(c => Object.assign({pro: true}, c)), ...ctx.doc.races];
  for (const kind of ['calendar', 'standings']) {
    if (ctx.imStopped) return;
    if (!imDue(kind, job, {now, im, races})) continue;
    const r = await fetcher.get(IM_PAGES[kind], {store: false});
    let why = imBlocked(r), got = null;
    if (!why) { got = kind === 'standings' ? parseStandings(r.body, {url: r.url}) : parseCalendar(r.body, {now, url: r.url}); why = got.error || ''; }
    im.attempts = Object.assign({}, im.attempts, {[kind]: Object.assign({at: nowIso(now), ok: !why}, r && r.status ? {status: r.status} : {}, why ? {error: why.slice(0, 200)} : {})});
    ctx.imChanged = true;
    if (why) {
      ctx.imStopped = true;
      log(`ironman.com ${kind}: STOPPED · ${why} · no more ironman.com requests this run; the last good copy stays (${im[kind] ? 'from ' + im[kind].fetched : 'none yet'})`);
      if (got && got.outline) log(`ironman.com ${kind}: page outline · ${got.outline}`);
      return;
    }
    const fin = r.url && imAllowed(r.url) ? r.url : IM_PAGES[kind];
    im[kind] = kind === 'standings' ? {fetched: nowIso(now), url: fin, F: got.F, M: got.M} : {fetched: nowIso(now), url: fin, races: got.races};
    log(kind === 'standings' ? `ironman.com standings: women ${got.F.length} · men ${got.M.length} · top · ${got.F[0].name} ${got.F[0].points ?? '?'} / ${got.M[0].name} ${got.M[0].points ?? '?'}`
      : `ironman.com calendar: ${got.races.length} races · ${got.races.filter(x => (x.flags || []).includes('Pro Series')).length} Pro Series · next: ${got.races.slice(0, 3).map(x => `${x.name} ${x.date}`).join(' · ')}`);
  }
}

// ---------- into news.json ----------
// the same race under two names ("IRONMAN World Championship" / "IRONMAN World Championship Kona"): same series and date, and every word of
// one name (series words and the year left out) is in the other
const nameWords = n => new Set(fold(n).replace(/\b(ironman|70\.3|703|presented by .*|powered by .*|20\d\d)\b/g, ' ').split(/[^a-z0-9]+/).filter(w => w && w !== 'the' && w !== 'and'));
export function sameRace(a, b) {
  if (!a || !b || a.date !== b.date || (a.series && b.series && a.series !== b.series)) return false;
  const x = nameWords(a.name), y = nameWords(b.name); if (!x.size || !y.size) return fold(a.name) === fold(b.name);
  const [s, l] = x.size <= y.size ? [x, y] : [y, x]; return [...s].every(w => l.has(w));
}
export function mergeIronman(ctx, {raceId, ensurePro}) {
  const {doc, im, now} = ctx;
  // standings: the two-reports rule is gone for the Pro Series (item 53); the full official table replaces whatever was there
  doc.standings_info = doc.standings_info || {};
  const info = doc.standings_info['Pro Series'] = doc.standings_info['Pro Series'] || {};
  // the official page is the link (the standings request itself is the check): the old daily link-check state goes, unless sources.json
  // still lists Pro Series links to check
  if (!(ctx.sources && ctx.sources.standings && ctx.sources.standings['Pro Series'])) for (const k of ['links', 'links_checked', 'reported']) delete info[k];
  for (const sx of SEXES) if (info[sx] && (info[sx].reports || info[sx].source !== IM_ATTR.standings.label)) delete info[sx];
  doc.standings = doc.standings.filter(s => !(s.series === 'Pro Series' && s.source === 'reports'));
  if (im.standings) {
    doc.standings = doc.standings.filter(s => s.series !== 'Pro Series');
    for (const sx of SEXES) {
      const rows = im.standings[sx] || []; if (!rows.length) continue;
      for (const x of rows) { const pro_id = ensurePro(doc, {name: x.name, country: x.country && /^[A-Z]{3}$/.test(x.country) ? x.country : null, sex: sx}); if (!pro_id) continue;
        doc.standings.push(Object.assign({series: 'Pro Series', sex: sx, rank: x.rank, pro_id, source: 'official'}, x.points != null ? {points: x.points} : {}, x.races != null ? {races: x.races} : {}, x.country ? {country: x.country} : {})); }
      info[sx] = {updated: im.standings.fetched.slice(0, 10), source: IM_ATTR.standings.label};
    }
  }
  if (!Object.keys(info).length) delete doc.standings_info['Pro Series'];
  // calendar: every upcoming IRONMAN and 70.3 race (and the last 8 days'), one record per race; a race ironman.com stopped listing is gone
  if (im.calendar) {
    const from = iso(now - 8 * DAY), today = iso(now), keep = new Set();
    for (const c of im.calendar.races) {
      if (c.date < from) continue;
      const r = {series: c.series, name: c.name, date: c.date, confirmed: true, src: 'ironman.com', flags: c.flags && c.flags.length ? c.flags.slice() : null, place: c.place || null, official_url: c.url || null};
      let x = doc.races.find(y => y.src === 'ironman.com' && y.id === raceId(c.series, c.name, c.date)) || doc.races.find(y => sameRace(y, r));
      if (!x) { x = {id: raceId(c.series, c.name, c.date)}; doc.races.push(x); }
      const was = x.src === 'ironman.com' || !x.series;
      for (const [k, v] of Object.entries(r)) { if (v != null) x[k] = v; else if (was) delete x[k]; }
      keep.add(x.id);
    }
    doc.races = doc.races.filter(r => !(r.src === 'ironman.com' && r.date >= today && !keep.has(r.id)));
  }
}
// what the AI may be told about a race: never ironman.com's facts (item 53)
export const aiRaceName = r => (r && r.src === 'ironman.com' ? 'the race' : r && r.name) || 'the race';
