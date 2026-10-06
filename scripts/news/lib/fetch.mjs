// Polite fetching (News spec p.12): a User-Agent that names fred and a contact email, robots.txt respected, one request per URL per run
// (memoised), a small on-disk cache with ETag / Last-Modified so an unchanged feed costs a 304. Article pages are fetched only to read facts
// for this run; their text is never written anywhere.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {isIronman, imAllowed} from './ironman.mjs';

export const NEWS_CONTACT = 'hello@flipturncreative.com';
export const UA = `fred-news (+https://fuel.bluebirdmultisport.com; ${NEWS_CONTACT})`;
// sites fred never reads (it links to them only): IRONMAN, T100 and PTO. The link checks (lib/links.mjs standings; build.mjs the pro-race
// calendar, item 47) may ask for a page's status once a day; nothing on the page is kept. Item 53: IRONMAN approved two pages on ironman.com
// (the Pro Series standings and the race calendar, lib/ironman.mjs IM_ALLOW); every other ironman.com URL is refused here before any request,
// link checks included, and so are redirects that leave the allow-list. T100, PTO and every other site: unchanged.
export const NO_SCRAPE = [/(^|\.)ironman\.com$/i, /(^|\.)t100triathlon\.com$/i, /(^|\.)protriathletes\.org$/i];
const IM_REFUSED = 'ironman.com: not one of the two approved pages (item 53)';

// robots.txt → allowed(path) for our agent (its own group, else *); longest match wins, Allow beats Disallow on a tie
export function robotsRules(txt, agent = 'fred-news') {
  const groups = []; let cur = null, lastUA = false;
  for (const raw of String(txt || '').split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim(); if (!line) continue;
    const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line); if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === 'user-agent') { if (!lastUA) { cur = {agents: [], rules: []}; groups.push(cur); } cur.agents.push(v.toLowerCase()); lastUA = true; continue; }
    lastUA = false; if (!cur) continue;
    if (k === 'allow' || k === 'disallow') cur.rules.push({allow: k === 'allow', path: v});
  }
  const mine = groups.filter(g => g.agents.some(a => a !== '*' && agent.toLowerCase().includes(a)));
  const use = mine.length ? mine : groups.filter(g => g.agents.includes('*'));
  const rules = use.flatMap(g => g.rules).filter(r => r.path !== '' || r.allow === false);
  const toRe = p => new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));
  return pth => {
    let best = null;
    for (const r of rules) {
      if (r.path === '') continue; // "Disallow:" (empty) allows everything
      if (toRe(r.path).test(pth) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))) best = r;
    }
    return !best || best.allow;
  };
}

export class Fetcher {
  constructor({fetchImpl = globalThis.fetch, cacheDir = null, timeoutMs = 20000, log = () => {}} = {}) {
    this.f = fetchImpl; this.cacheDir = cacheDir; this.timeoutMs = timeoutMs; this.log = log;
    this.memo = new Map(); this.robots = new Map(); this.count = 0;
  }
  async _raw(url, headers = {}) {
    // ironman.com: only the approved pages, and a redirect is followed only to another approved page (item 53)
    const im = isIronman(url);
    if (im && !imAllowed(url)) return {status: 0, ok: false, body: '', url, refused: true, error: IM_REFUSED};
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), this.timeoutMs);
    try {
      let cur = url;
      for (let hop = 0; ; hop++) {
        this.count++;
        const r = await this.f(cur, {headers: Object.assign({'User-Agent': UA, 'Accept': '*/*'}, headers), redirect: im ? 'manual' : 'follow', signal: ctl.signal});
        const loc = im && r.status >= 300 && r.status < 400 && r.headers && r.headers.get ? r.headers.get('location') : null;
        if (loc) {
          let nx; try { nx = new URL(loc, cur).href; } catch { nx = ''; }
          if (!imAllowed(nx) || hop >= 3) { try { await r.text(); } catch {} return {status: r.status, ok: false, body: '', url: cur, refused: true, error: `${IM_REFUSED}: redirected to ${nx || loc}`}; }
          try { await r.text(); } catch {} cur = nx; continue;
        }
        const body = await r.text();
        return {status: r.status, ok: r.ok, body, url: (im ? cur : r.url) || cur, etag: r.headers && r.headers.get ? r.headers.get('etag') : null, modified: r.headers && r.headers.get ? r.headers.get('last-modified') : null};
      }
    } finally { clearTimeout(t); }
  }
  async allowed(url, {linkCheck = false} = {}) {
    const u = new URL(url); if (!linkCheck && NO_SCRAPE.some(re => re.test(u.hostname)) && !imAllowed(url)) return false;
    if (isIronman(url) && !imAllowed(url)) return false; // item 53: link checks included
    if (!this.robots.has(u.origin)) {
      let rule = () => true;
      try { const r = await this._raw(u.origin + '/robots.txt'); if (r.ok) rule = robotsRules(r.body); else if (r.status === 401 || r.status === 403) rule = () => false; }
      catch { rule = () => true; } // no robots.txt reachable: allowed (RFC 9309)
      this.robots.set(u.origin, rule);
    }
    return this.robots.get(u.origin)(u.pathname + u.search);
  }
  _cachePath(url) { return this.cacheDir ? path.join(this.cacheDir, crypto.createHash('sha1').update(url).digest('hex') + '.json') : null; }
  // get(url) → {ok, status, body, url, cached} ; at most one network request per URL per run; refused when robots.txt says no.
  // store: false keeps nothing, not even in the job's cache, and never answers from it (the ironman.com pages, item 53)
  async get(url, {robots = true, linkCheck = false, store = true} = {}) {
    const key = (linkCheck ? 'link ' : store ? '' : 'nostore ') + url;
    if (this.memo.has(key)) return this.memo.get(key);
    const p = (async () => {
      if (isIronman(url) && !imAllowed(url)) return {ok: false, status: 0, body: '', url, refused: true, error: IM_REFUSED};
      if (robots && !(await this.allowed(url, {linkCheck}))) return {ok: false, status: 0, body: '', url, refused: true};
      const cp = linkCheck || !store ? null : this._cachePath(url); let cached = null; // a link check keeps nothing (not even in the job's cache)
      if (cp && fs.existsSync(cp)) { try { cached = JSON.parse(fs.readFileSync(cp, 'utf8')); } catch {} }
      const h = {}; if (cached && cached.etag) h['If-None-Match'] = cached.etag; if (cached && cached.modified) h['If-Modified-Since'] = cached.modified;
      let r;
      try { r = await this._raw(url, h); }
      catch (e) { if (cached) return {ok: true, status: 200, body: cached.body, url: cached.url, cached: true, stale: true}; return {ok: false, status: 0, body: '', url, error: String(e && e.message || e)}; }
      if (r.status === 304 && cached) return {ok: true, status: 200, body: cached.body, url: cached.url, cached: true};
      if (r.ok && cp) { try { fs.mkdirSync(this.cacheDir, {recursive: true}); fs.writeFileSync(cp, JSON.stringify({url: r.url, etag: r.etag, modified: r.modified, body: r.body})); } catch {} }
      return r;
    })();
    this.memo.set(key, p); return p;
  }
  async json(url, headers) {
    const key = 'json ' + url; if (this.memo.has(key)) return this.memo.get(key);
    const p = this._raw(url, Object.assign({'Accept': 'application/json'}, headers)).then(r => { let j = null; try { j = JSON.parse(r.body); } catch {} return {ok: r.ok, status: r.status, json: j}; })
      .catch(e => ({ok: false, status: 0, json: null, error: String(e && e.message || e)}));
    this.memo.set(key, p); return p;
  }
}
