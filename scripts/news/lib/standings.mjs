// Series standings (item 21). WTCS and T100 come from the World Triathlon API (official). IRONMAN Pro Series has no API, so its top 3 is
// published only when two independent reports agree (same names in the same order; points within 1% when both state them). The same rule
// is the fallback for T100 (top 10) if the API ever stops listing the T100 ranking.
import {fold} from './match.mjs';

const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return String(u || ''); } };
export const within1pct = (a, b) => Math.abs(a - b) <= 0.01 * Math.max(Math.abs(a), Math.abs(b));

// claims: [{source, url, date, rows:[{sex, rank, name, points?}]}] (one claim per report) → for one sex:
// {rows:[{rank, name, points?}], sources:[name, name], source_urls:[url, url], date} or null.
// Two reports from different publishers must list the same names at ranks 1..k (k ≥ minRows, at most topN) in the same order; where both
// give points they must be within 1%, and points are shown only then (the newer report's figure). The pair agreeing on the most ranks wins
// (ties: the newer pair).
export function confirmStandings(claims, sex, {topN = 3, minRows = 3} = {}) {
  const list = (claims || []).map(c => ({c, pub: host(c.url || c.source), rows: new Map((c.rows || []).filter(r => r.sex === sex && r.rank >= 1 && r.rank <= topN).map(r => [r.rank, r]))}))
    .filter(x => x.rows.size);
  let best = null;
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j]; if (a.pub === b.pub) continue; // independent = different publishers
    const rows = [];
    for (let k = 1; k <= topN; k++) {
      const x = a.rows.get(k), y = b.rows.get(k); if (!x || !y || fold(x.name) !== fold(y.name)) break;
      const px = Number.isFinite(x.points) ? x.points : null, py = Number.isFinite(y.points) ? y.points : null;
      if (px != null && py != null && !within1pct(px, py)) break; // they disagree on the points: stop here
      const newer = String(b.c.date || '') > String(a.c.date || '') ? y : x;
      rows.push(Object.assign({rank: k, name: x.name}, px != null && py != null ? {points: newer.points} : {}, x.country || y.country ? {country: x.country || y.country} : {}));
    }
    if (rows.length < minRows) continue;
    const date = [a.c.date, b.c.date].filter(Boolean).sort().pop() || null;
    const cand = {rows, sources: [a.c.source, b.c.source], source_urls: [a.c.url, b.c.url].filter(Boolean), date};
    if (!best || rows.length > best.rows.length || (rows.length === best.rows.length && String(date) > String(best.date))) best = cand;
  }
  return best;
}
