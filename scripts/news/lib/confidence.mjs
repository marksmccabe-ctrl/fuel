// Results confidence (News spec p.12): a podium place or a time is published only from an official source (the World Triathlon API, an
// official press release) or when two independent reports agree; otherwise the race shows "Results coming" with links.
// claims: [{source, url, official, rows:[{sex, place, name, time?}]}] → [{sex, place, name, time?, source:'official'|'reports', source_urls}]
import {fold} from './match.mjs';
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
export function confirmResults(claims) {
  const off = claims.filter(c => c.official && c.rows && c.rows.length);
  if (off.length) {
    const c = off[0];
    return c.rows.map(r => Object.assign({sex: r.sex, place: r.place, name: r.name, source: 'official', source_urls: [c.url].filter(Boolean)}, r.time ? {time: r.time} : {}, r.country ? {country: r.country} : {}, r.splits ? {splits: r.splits} : {}));
  }
  // independent = different publishers (hosts); one vote per publisher per place
  const votes = new Map();
  for (const c of claims) {
    const pub = host(c.url || c.source); const seen = new Set();
    for (const r of c.rows || []) {
      const k = r.sex + '|' + r.place; if (seen.has(k)) continue; seen.add(k);
      if (!votes.has(k)) votes.set(k, []);
      votes.get(k).push({pub, name: fold(r.name), raw: r.name, time: r.time || null, country: r.country, url: c.url});
    }
  }
  const out = [];
  for (const [k, vs] of votes) {
    const [sex, place] = k.split('|');
    const byName = new Map(); for (const v of vs) { if (!byName.has(v.name)) byName.set(v.name, []); byName.get(v.name).push(v); }
    const agreed = [...byName.values()].filter(g => new Set(g.map(v => v.pub)).size >= 2);
    if (agreed.length !== 1) continue; // nobody, or reports that disagree: "Results coming"
    for (const group of agreed) {
      // the time only when two independent reports give the same time
      const t = new Map(); for (const v of group) if (v.time) { if (!t.has(v.time)) t.set(v.time, new Set()); t.get(v.time).add(v.pub); }
      const time = [...t.entries()].find(([, p]) => p.size >= 2);
      const row = {sex, place: +place, name: group[0].raw, source: 'reports', source_urls: [...new Set(group.map(v => v.url).filter(Boolean))].slice(0, 4)};
      if (time) row.time = time[0]; const ctry = group.find(v => v.country); if (ctry) row.country = ctry.country;
      out.push(row); break;
    }
  }
  return out.sort((a, b) => a.sex.localeCompare(b.sex) || a.place - b.place);
}
