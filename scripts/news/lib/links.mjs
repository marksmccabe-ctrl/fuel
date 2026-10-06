// Standings deep links (item 21). Every "Full standings ↗" must open the standings themselves, never a home page. data/sources.json lists
// the official URLs per series and sex (the verified one first). Once a day the daily job requests each one once (robots.txt respected; the
// page is read only for this check and nothing on it is kept) and keeps a link only when:
//   HTTP 200 · not redirected to another page (a home page, an index, a sign-in or error page) · the page is not a "not found" / sign-in
//   page · it shows standings: "standings", "rankings", "leaderboard" or "race to" in its main heading or the page's own part of its title
//   (not the site name), or at least 3 of that sex's pros fred lists named in its text · it is not the other sex's page.
// A busy or refusing site (429, 5xx, 401/403, robots.txt, no answer) proves nothing: the last working link stays and nothing is reported.
// A link that worked before (or is marked verified) and now fails is reported once (standings_info.reported); the workflow opens an issue.
import {fold} from './match.mjs';

const nowIso = d => new Date(d).toISOString().replace(/\.\d{3}Z$/, 'Z');
export const LINK_KEYS = ['women', 'men', 'backup_women', 'backup_men'];
export const CHECK_EVERY_MS = 20 * 36e5; // the daily job runs twice a day; the links are checked on one of the two runs
const WOMEN = /\bwomen\b|\bfemale\b|\bwomens\b/i, MEN = /\bmen\b|\bmale\b|\bmens\b/i;
const sexOfKey = k => k.replace('backup_', '');
const namesOther = (s, sex) => sex === 'women' ? MEN.test(s) && !WOMEN.test(s) : sex === 'men' ? WOMEN.test(s) && !MEN.test(s) : false;

export function isHomePath(u) {
  try { const p = new URL(u).pathname.replace(/\/+$/, ''); return p === '' || /^\/[a-z]{2}([-_][a-z]{2})?$/i.test(p) || /^\/(home|index(\.html?)?)$/i.test(p); } catch { return true; }
}
// a path without its trailing slash, case or leading locale (/en, /en-us)
const normPath = u => { try { return new URL(u).pathname.replace(/\/+$/, '').toLowerCase().replace(/^\/[a-z]{2}([-_][a-z]{2})?(?=\/|$)/, '') || '/'; } catch { return ''; } };
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const clean = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim().slice(0, 160);
const first = (html, re) => { const m = re.exec(html); return m ? clean(m[1]) : ''; };
// the page's own part of a title: "Elite Women Standings | World Triathlon" → "Elite Women Standings" (the site name is not evidence)
const own = t => String(t || '').split(/\s+[|–—·]\s+|\s+-\s+/)[0];
// → {ok, transient, reason, title, words, names}
export function judgeStandingsPage({url, status, finalUrl, body, names = [], sex = ''}) {
  const no = (reason, transient = false) => ({ok: false, transient, reason, title: '', words: false, names: 0});
  if (status === 429 || status >= 500) return no(`HTTP ${status} (busy; not judged)`, true);
  if (status === 401 || status === 403) return no(`HTTP ${status} (the site refused the check; not judged)`, true);
  if (status !== 200) return no(`HTTP ${status || 'no answer'}`);
  const fin = finalUrl || url;
  if (fin !== url) {
    if (isHomePath(fin) && !isHomePath(url)) return no(`redirected to a home page (${fin})`);
    if (host(fin) !== host(url)) return no(`redirected to another site (${fin})`);
    const a = normPath(url), b = normPath(fin);
    if (b !== a && !b.startsWith(a + '/')) return no(`redirected to another page (${fin})`);
  }
  if (/(^|[/?&=_-])(log-?in|sign-?in|signin|auth|404|not-?found|error)([/?&=_.-]|$)/i.test(new URL(fin).pathname + new URL(fin).search)) return no(`redirected to a sign-in or error page (${fin})`);
  const html = String(body || '');
  const title = first(html, /<title[^>]*>([\s\S]*?)<\/title>/i), h1 = first(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const og = first(html, /<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']*)["']/i) || first(html, /<meta[^>]+content=["']([^"']*)["'][^>]*property=["']og:title["']/i);
  const shown = title || og || h1;
  if (/\b(not found|404|page (does not|doesn.t) exist|no longer available|sign in|log in|login)\b/i.test([title, h1, og].join(' | '))) return Object.assign(no('the page says it is not found or asks to sign in'), {title: shown});
  const head = [h1, own(title), own(og)].join(' | ');
  if (sex && (namesOther(head, sex) || namesOther(new URL(fin).pathname + new URL(fin).search, sex))) return Object.assign(no(`the ${sex === 'women' ? 'men' : 'women'}'s standings, not the ${sex}'s`), {title: shown});
  const words = /standings|rankings?|leaderboard|race to/i.test(head);
  // the page's text (scripts, styles and tags removed): names inside page code or data are not counted
  const visible = fold(html.slice(0, 3e6).replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' '));
  const found = [...new Set(names.filter(Boolean))].filter(n => visible.includes(fold(n))).length;
  const ok = words || found >= 3;
  return {ok, transient: false, reason: ok ? '' : 'the page does not show standings', title: shown, words, names: found};
}

// links on an official site that look like its standings page (same host; "standing", "ranking" or "leaderboard" in the path). For one sex:
// links naming that sex first, then neutral ones; links naming the other sex are dropped. Used for IRONMAN, whose standings live somewhere
// on proseries.ironman.com with no published address.
export function standingsLinksOn(html, base, sex) {
  const out = []; const re = /<a\b[^>]*href\s*=\s*["']([^"'#]+)["']/gi; let m; const h = new URL(base).hostname;
  while ((m = re.exec(String(html || '')))) { let u; try { u = new URL(m[1], base); } catch { continue; } if (u.hostname !== h || u.protocol !== 'https:') continue;
    if (/standing|ranking|leaderboard/i.test(u.pathname) && !out.includes(u.href)) out.push(u.href); }
  if (sex !== 'women' && sex !== 'men') return out;
  const tag = u => { const x = new URL(u), s = x.pathname + x.search; return namesOther(s, sex) ? 'other' : (sex === 'women' ? WOMEN : MEN).test(s) ? 'own' : 'neutral'; };
  return [...out.filter(u => tag(u) === 'own'), ...out.filter(u => tag(u) === 'neutral')];
}
// check the links in sources.standings → doc.standings_info[series].links (working links only) + links_checked + reported; returns the
// newly broken ones. all: try every candidate (the by-hand check) and list every verdict in ctx.linkResults.
export async function checkStandingsLinks(ctx, {all = false} = {}) {
  const {doc, sources, now, fetcher, log} = ctx, cfg = sources.standings || {}, broken = [];
  doc.standings_info = doc.standings_info || {};
  for (const ser of ['Pro Series', 'T100', 'WTCS']) {
    const c = cfg[ser]; if (!c) continue;
    const info = doc.standings_info[ser] = doc.standings_info[ser] || {}, prev = info.links || {}, reported = Object.assign({}, info.reported);
    if (!all && info.links_checked && now - Date.parse(info.links_checked) < CHECK_EVERY_MS) continue;
    const links = {}; let checked = false;
    for (const k of LINK_KEYS) {
      // item 53: ironman.com is read only for its two approved pages (the Pro Series standings request is its own check): never link-checked
      const cands = (c[k] || []).filter(x => x && /^https:\/\//.test(x.url) && !/(^|\.)ironman\.com$/i.test(new URL(x.url).hostname)); if (!cands.length) continue;
      const sex = sexOfKey(k), sx = sex === 'women' ? 'F' : 'M';
      const names = doc.standings.filter(s => s.series === ser && s.sex === sx).map(s => (doc.pros.find(p => p.id === s.pro_id) || {}).name);
      const judged = new Map(); let unchecked = false;
      for (let ci = 0; ci < cands.length; ci++) {
        const cand = cands[ci];
        const r = await fetcher.get(cand.url, {linkCheck: true});
        // {discover: true}: the site's own page is only a place to find the standings link (at most 3 tried); it is never the link itself
        if (cand.discover) {
          if (r.status === 200) { const found = standingsLinksOn(r.body, r.url || cand.url, sex).filter(u => !cands.some(x => x.url === u) && (!cand.match || u.toLowerCase().includes(String(cand.match).toLowerCase()))).slice(0, 3);
            log(`link ${ser} ${k}: ${cand.url} → ${r.status} · standings links found on the page: ${found.join(', ') || 'none'}`); cands.splice(ci + 1, 0, ...found.map(url => ({url, found: true}))); }
          else log(`link ${ser} ${k}: ${cand.url} → ${r.refused ? 'not checked (robots.txt says no)' : r.status || r.error || 'no answer'} (looking for the standings link)`);
          continue;
        }
        if (r.refused || !r.status) { log(`link ${ser} ${k}: ${cand.url} not checked (${r.refused ? 'robots.txt says no' : r.error || 'no answer'})`); unchecked = true; if (ctx.linkResults) ctx.linkResults.push({ser, k, url: cand.url, ok: false, transient: true, reason: r.refused ? 'robots.txt says no' : r.error || 'no answer'}); continue; }
        const v = judgeStandingsPage({url: cand.url, status: r.status, finalUrl: r.url, body: r.body, names, sex});
        judged.set(cand.url, v); checked = true; if (v.transient) unchecked = true;
        if (ctx.linkResults) ctx.linkResults.push({ser, k, url: cand.url, ok: v.ok, transient: v.transient, reason: v.reason, title: v.title});
        log(`link ${ser} ${k}: ${cand.url} → ${r.status}${r.url && r.url !== cand.url ? ' → ' + r.url : ''} · "${v.title}" · standings words: ${v.words ? 'yes' : 'no'} · names: ${v.names}/${names.length} · ${v.ok ? 'OK' : (v.transient ? 'NOT JUDGED: ' : 'BROKEN: ') + v.reason}`);
        if (v.ok) { if (!links[k]) links[k] = cand.url; if (!all) break; }
      }
      // could not be judged this time (robots.txt, busy site, no answer): the last working link stays, unless it was itself judged broken now
      const pv = judged.get(prev[k]);
      if (!links[k] && unchecked && prev[k] && !(pv && !pv.ok && !pv.transient)) links[k] = prev[k];
      // report a link that was shown (or is marked verified) and is now definitely broken, once (until it works again or another breaks)
      const bad = cands.filter(x => (x.verified || x.url === prev[k]) && judged.has(x.url) && !judged.get(x.url).ok && !judged.get(x.url).transient);
      const fresh = bad.filter(x => reported[k] !== x.url);
      for (const x of fresh) broken.push(`${ser} · ${k.replace('_', ' ')}: ${x.url} (${judged.get(x.url).reason})`);
      if (fresh.length && !links[k]) broken.push(`${ser} · ${k.replace('_', ' ')}: no working standings link left`);
      if (bad.length) reported[k] = bad[bad.length - 1].url;
      else if (reported[k] && judged.has(reported[k]) && judged.get(reported[k]).ok) delete reported[k]; // it works again
    }
    if (all) continue; // the by-hand check writes nothing
    info.links = links; if (checked) info.links_checked = nowIso(now);
    if (Object.keys(reported).length) info.reported = reported; else delete info.reported;
  }
  return broken;
}
