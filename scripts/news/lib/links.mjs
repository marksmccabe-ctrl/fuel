// Standings deep links (item 21). Every "Full standings ↗" must open the standings themselves, never a home page. data/sources.json lists
// the official URLs per series and sex (the verified one first). Once a day the daily job requests each one once (robots.txt respected; the
// page is read only for this check and nothing on it is kept) and keeps a link only when:
//   HTTP 200 · no redirect to a home page · the page reads as standings: "standings", "rankings", "leaderboard" or "race to" in its title,
//   main heading or og:title, or at least 3 of the pros fred lists for that series named on the page.
// A link that worked before and fails now (404, a home page, not standings) is reported, and the workflow opens a GitHub issue.
import {fold} from './match.mjs';

const nowIso = d => new Date(d).toISOString().replace(/\.\d{3}Z$/, 'Z');
export const LINK_KEYS = ['women', 'men', 'backup_women', 'backup_men'];
export const CHECK_EVERY_MS = 20 * 36e5; // the daily job runs twice a day; the links are checked on one of the two runs

export function isHomePath(u) {
  try { const p = new URL(u).pathname.replace(/\/+$/, ''); return p === '' || /^\/[a-z]{2}([-_][a-z]{2})?$/i.test(p) || /^\/(home|index(\.html?)?)$/i.test(p); } catch { return true; }
}
const clean = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim().slice(0, 120);
const first = (html, re) => { const m = re.exec(html); return m ? clean(m[1]) : ''; };
// → {ok, reason, title, words, names}
export function judgeStandingsPage({url, status, finalUrl, body, names = []}) {
  if (status !== 200) return {ok: false, reason: `HTTP ${status || 'no answer'}`, title: '', words: false, names: 0};
  if (finalUrl && finalUrl !== url && isHomePath(finalUrl) && !isHomePath(url)) return {ok: false, reason: `redirected to a home page (${finalUrl})`, title: '', words: false, names: 0};
  const html = String(body || '');
  const title = first(html, /<title[^>]*>([\s\S]*?)<\/title>/i), h1 = first(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const og = first(html, /<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']*)["']/i) || first(html, /<meta[^>]+content=["']([^"']*)["'][^>]*property=["']og:title["']/i);
  const words = /standings|rankings?|leaderboard|race to/i.test([title, h1, og].join(' | '));
  const txt = fold(html), found = [...new Set(names.filter(Boolean))].filter(n => txt.includes(fold(n))).length;
  const ok = words || found >= 3;
  return {ok, reason: ok ? '' : 'the page does not show standings', title: title || og || h1, words, names: found};
}

// links on an official site that look like its standings page (same host; "standing", "ranking" or "leaderboard" in the path; for one sex,
// the paths naming that sex first). Used for IRONMAN, whose standings live somewhere on proseries.ironman.com with no published address.
export function standingsLinksOn(html, base, sex) {
  const out = []; const re = /<a\b[^>]*href\s*=\s*["']([^"'#]+)["']/gi; let m; const host = new URL(base).hostname;
  while ((m = re.exec(String(html || '')))) { let u; try { u = new URL(m[1], base); } catch { continue; } if (u.hostname !== host || u.protocol !== 'https:') continue;
    if (/standing|ranking|leaderboard/i.test(u.pathname) && !out.includes(u.href)) out.push(u.href); }
  const want = sex === 'women' ? /women|female|\bpro-women/i : sex === 'men' ? /(^|[^o])men\b|(^|[^e])male/i : null;
  return want ? [...out.filter(u => want.test(new URL(u).pathname)), ...out.filter(u => !want.test(new URL(u).pathname))] : out;
}
// check the links in sources.standings → doc.standings_info[series].links (working links only) + links_checked; returns the broken ones
export async function checkStandingsLinks(ctx, {all = false} = {}) { // all: try every candidate (the by-hand check), not just until one works
  const {doc, sources, now, fetcher, log} = ctx, cfg = sources.standings || {}, broken = [];
  doc.standings_info = doc.standings_info || {};
  for (const ser of ['Pro Series', 'T100', 'WTCS']) {
    const c = cfg[ser]; if (!c) continue;
    const info = doc.standings_info[ser] = doc.standings_info[ser] || {}, prev = info.links || {};
    if (!all && info.links_checked && now - Date.parse(info.links_checked) < CHECK_EVERY_MS) continue;
    const names = doc.standings.filter(s => s.series === ser).map(s => (doc.pros.find(p => p.id === s.pro_id) || {}).name);
    const links = {}; let checked = false;
    for (const k of LINK_KEYS) {
      const cands = (c[k] || []).filter(x => x && /^https:\/\//.test(x.url)); if (!cands.length) continue;
      let unchecked = false, tried = 0;
      for (let ci = 0; ci < cands.length; ci++) {
        const cand = cands[ci];
        const r = await fetcher.get(cand.url, {linkCheck: true});
        // {discover: true}: the site's own page is only a place to find the standings link (at most 3 tried); it is never the link itself
        if (cand.discover) {
          if (r.status === 200) { const found = standingsLinksOn(r.body, r.url || cand.url, k.replace('backup_', '')).filter(u => !cands.some(x => x.url === u)).slice(0, 3);
            log(`link ${ser} ${k}: ${cand.url} → ${r.status} · standings links found on the page: ${found.join(', ') || 'none'}`); cands.splice(ci + 1, 0, ...found.map(url => ({url, found: true}))); }
          else log(`link ${ser} ${k}: ${cand.url} → ${r.refused ? 'not checked (robots.txt says no)' : r.status || r.error || 'no answer'} (looking for the standings link)`);
          continue;
        }
        if (r.refused) { log(`link ${ser} ${k}: ${cand.url} not checked (robots.txt says no)`); unchecked = true; continue; }
        if (!r.status) { log(`link ${ser} ${k}: ${cand.url} not checked (${r.error || 'no answer'})`); unchecked = true; continue; }
        const v = judgeStandingsPage({url: cand.url, status: r.status, finalUrl: r.url, body: r.body, names});
        checked = true; tried++;
        log(`link ${ser} ${k}: ${cand.url} → ${r.status}${r.url && r.url !== cand.url ? ' → ' + r.url : ''} · "${v.title}" · standings words: ${v.words ? 'yes' : 'no'} · names: ${v.names}/${names.length} · ${v.ok ? 'OK' : 'BROKEN: ' + v.reason}`);
        if (v.ok) { if (!links[k]) links[k] = cand.url; if (!all) break; continue; }
        if (cand.verified || prev[k] === cand.url) broken.push(`${ser} · ${k.replace('_', ' ')}: ${cand.url} (${v.reason})`);
      }
      // could not be checked this time (robots.txt, network): the last working link stays (not refuted, just not re-checked)
      if (!links[k] && unchecked && prev[k]) links[k] = prev[k];
      else if (!links[k] && tried && (prev[k] || cands.some(x => x.verified))) broken.push(`${ser} · ${k.replace('_', ' ')}: no working standings link (${tried} checked)`);
    }
    info.links = links; if (checked) info.links_checked = nowIso(now);
  }
  return broken;
}
