// World Triathlon API (developers.triathlon.org): WTCS events, start times, results with splits, rankings. Needs a free key (GitHub secret
// WT_API_KEY, sent as the "apikey" header). Without it, wtClient() returns null and WTCS races show links only. The API's field names are
// read defensively (a renamed field drops that fact, it never breaks the file).
import {slug} from './match.mjs';

// every request is traced to the job log: path, status, record count and a short sample (never the key: it goes in the apikey header)
export const wtSample = d => { const a = Array.isArray(d) ? d : d && typeof d === 'object' ? [d] : []; return JSON.stringify(a.slice(0, 2)).slice(0, 400); };
export function wtClient({apiKey = process.env.WT_API_KEY, base = 'https://api.triathlon.org/v1', fetcher, log = () => {}}) {
  if (!apiKey) return null;
  const get = async (p, q = {}) => {
    const u = new URL(base.replace(/\/$/, '') + p); for (const [k, v] of Object.entries(q)) if (v != null) u.searchParams.set(k, v);
    const r = await fetcher.json(u.href, {apikey: apiKey});
    const d = r.json && r.json.data !== undefined ? r.json.data : r.json;
    log(`WT GET ${u.pathname}${u.search} → ${r.status || r.error || 'no answer'} · ${Array.isArray(d) ? d.length + ' records' : typeof d} · ${wtSample(d)}`);
    if (!r.ok || !r.json) throw new Error(`World Triathlon API ${p}: ${r.status || r.error || 'no answer'}`);
    return d;
  };
  return {
    events: (categoryId, start, end) => get('/events', {category_id: categoryId, start_date: start, end_date: end, per_page: 50, order: 'asc'}).then(d => Array.isArray(d) ? d : d && d.data || []),
    programs: eventId => get(`/events/${eventId}/programs`).then(d => Array.isArray(d) ? d : []),
    results: (eventId, progId) => get(`/events/${eventId}/programs/${progId}/results`).then(d => Array.isArray(d) ? d : d && Array.isArray(d.results) ? d.results : []),
    athlete: id => get(`/athletes/${id}`).then(d => d && typeof d === 'object' && !Array.isArray(d) ? d : null),
    rankings: () => get('/rankings').then(d => Array.isArray(d) ? d : []),
    ranking: id => get(`/rankings/${id}`).then(d => Array.isArray(d) ? d : d && Array.isArray(d.rankings) ? d.rankings : []),
  };
}
const pick = (o, ...ks) => { for (const k of ks) if (o && o[k] != null && o[k] !== '') return o[k]; return null; };
// "00:52:41" / "0:52:41" / "52:41" → "h:mm:ss" (or null)
export function hms(t) {
  const m = /^(?:(\d{1,2}):)?([0-5]?\d):([0-5]\d)(?:\.\d+)?$/.exec(String(t || '').trim()); if (!m) return null;
  const h = +(m[1] || 0), mm = +m[2], ss = +m[3]; if (!h && !mm && !ss) return null;
  return `${h}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}
export const sexOfProgram = p => { const n = String(pick(p, 'prog_name', 'name') || '').toLowerCase(); return /\belite women\b|\bwomen\b/.test(n) && !/u23|junior|age/.test(n) ? 'F' : /\belite men\b|\bmen\b/.test(n) && !/u23|junior|age|women/.test(n) ? 'M' : null; };
// a program's start as ISO with offset when the API gives a date, a time and an offset (otherwise none: never guessed)
export function programStart(p) {
  const d = pick(p, 'prog_date'), t = pick(p, 'prog_time'), off = pick(p, 'prog_timezone_offset', 'event_timezone_offset', 'timezone_offset');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d || '') || !/^\d{2}:\d{2}(:\d{2})?$/.test(t || '') || !/^[+-]\d{2}:?\d{2}$/.test(off || '')) return null;
  const o = off.includes(':') ? off : off.slice(0, 3) + ':' + off.slice(3);
  return `${d}T${t.length === 5 ? t + ':00' : t}${o}`;
}
export function eventToRace(ev) {
  const title = String(pick(ev, 'event_title', 'title') || '').trim(), date = String(pick(ev, 'event_date', 'date') || '').slice(0, 10);
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const venue = pick(ev, 'event_venue', 'venue'), country = pick(ev, 'event_country', 'country');
  const name = title.replace(/^\d{4}\s+/, '').replace(/^World Triathlon Championship Series\s+/i, 'WTCS ').trim();
  const r = {id: slug(`wtcs-${(venue || name).replace(/^wtcs\s+/i, '')}-${date.slice(0, 4)}`), series: 'WTCS', name: /^wtcs\b/i.test(name) ? name : `WTCS ${venue || name}`, date, confirmed: true, wt_event_id: +pick(ev, 'event_id', 'id') || undefined};
  if (venue) r.place = String(venue).slice(0, 80); if (country) r.country = String(country).slice(0, 60);
  const fin = String(pick(ev, 'event_finish_date') || '').slice(0, 10); if (/^\d{4}-\d{2}-\d{2}$/.test(fin) && fin !== date) r.end_date = fin;
  const web = pick(ev, 'event_website', 'event_listing'); if (web && /^https:\/\//.test(web)) r.official_url = web;
  const id = pick(ev, 'event_id', 'id'); if (id) r.results_url = `https://triathlon.org/events/event/${id}`;
  if (!r.wt_event_id) delete r.wt_event_id;
  return r;
}
// API result rows → {pro:{name, country, wt_athlete_id}, place, time, splits}; splits: swim, bike, run (the API lists swim, T1, bike, T2, run)
export function resultRows(rows, top = 10) {
  const out = [];
  for (const x of rows || []) {
    const place = parseInt(pick(x, 'position', 'pos'), 10); if (!Number.isInteger(place) || place < 1) continue;
    const name = String(pick(x, 'athlete_title') || [pick(x, 'athlete_first'), pick(x, 'athlete_last')].filter(Boolean).join(' ')).trim(); if (!name) continue;
    const s = Array.isArray(x.splits) ? x.splits : null;
    const splits = s && s.length >= 5 ? {swim: hms(s[0]), bike: hms(s[2]), run: hms(s[4])} : null;
    if (splits) for (const k of Object.keys(splits)) if (!splits[k]) delete splits[k];
    out.push({pro: {name: name.replace(/\s+/g, ' '), country: /^[A-Z]{3}$/.test(pick(x, 'athlete_noc', 'noc') || '') ? pick(x, 'athlete_noc', 'noc') : undefined, wt_athlete_id: +pick(x, 'athlete_id') || undefined}, place, time: hms(pick(x, 'total_time', 'time')), splits: splits && Object.keys(splits).length ? splits : null});
  }
  return out.sort((a, b) => a.place - b.place).slice(0, top);
}
