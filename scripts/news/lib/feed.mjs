// RSS 2.0 / Atom / podcast feed reading without dependencies. parseFeed(xml) → {title, items:[{title, url, guid, published, description,
// words, duration, categories}]}. The description is plain text used only for matching and summaries in this run; it is never written to
// news.json (facts and links only).
const ENT = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', hellip: '…', eacute: 'é', egrave: 'è', aacute: 'á', oacute: 'ó', uuml: 'ü', ouml: 'ö', auml: 'ä', ntilde: 'ñ', ccedil: 'ç', iacute: 'í', uacute: 'ú', oslash: 'ø', aring: 'å', szlig: 'ß'};
export function decode(s) {
  return String(s || '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(n); } catch { return ''; } }
    return ENT[e.toLowerCase()] ?? m;
  });
}
const cdata = s => String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (m, x) => x);
// HTML → plain text (tags dropped, entities decoded, whitespace folded)
export function text(html) {
  let s = cdata(html);
  if (/&lt;\/?[a-z]/i.test(s)) s = decode(s); // escaped HTML inside RSS
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<br\s*\/?>|<\/p>|<\/li>|<\/h\d>/gi, '\n').replace(/<[^>]+>/g, ' ');
  return decode(s).replace(/[ \t ]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
}
const tag = (block, name) => {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'); const m = re.exec(block); return m ? m[1] : '';
};
const attr = (el, a) => { const m = new RegExp(`\\s${a}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(el); return m ? decode(m[2] ?? m[3]) : ''; };
const all = (block, name) => { const re = new RegExp(`<${name}(?:\\s[^>]*)?(?:/>|>([\\s\\S]*?)</${name}>)`, 'gi'); const out = []; let m; while ((m = re.exec(block))) out.push({el: m[0], body: m[1] || ''}); return out; };
// "1:04:12", "64:12", "3852" (seconds) → minutes (rounded, ≥ 1)
export function durationMin(s) {
  s = String(s || '').trim(); if (!s) return null;
  if (/^\d+$/.test(s)) return Math.max(1, Math.round(+s / 60));
  const p = s.split(':').map(Number); if (p.some(n => !Number.isFinite(n))) return null;
  const sec = p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : null;
  return sec == null ? null : Math.max(1, Math.round(sec / 60));
}
const isoDate = s => { const t = Date.parse(String(s || '').trim()); return Number.isFinite(t) ? new Date(t).toISOString().replace(/\.\d{3}Z$/, 'Z') : null; };
export function isFeed(xml) { return /<(rss|feed|rdf:RDF)[\s>]/i.test(String(xml || '').slice(0, 4000)); }
export function parseFeed(xml) {
  xml = String(xml || ''); if (!isFeed(xml)) throw new Error('not a feed');
  const atom = /<feed[\s>]/i.test(xml.slice(0, 4000));
  const head = xml.split(atom ? /<entry[\s>]/i : /<item[\s>]/i)[0];
  const title = text(tag(head, 'title'));
  const blocks = all(xml, atom ? 'entry' : 'item').map(b => b.body);
  const items = blocks.map(b => {
    let url = '';
    if (atom) { const links = all(b, 'link').map(l => l.el); const alt = links.find(l => /rel\s*=\s*["']alternate["']/i.test(l)) || links.find(l => !/rel\s*=/i.test(l)) || links[0]; url = alt ? attr(alt, 'href') : ''; }
    else url = text(tag(b, 'link')) || (/isPermaLink\s*=\s*["']?true/i.test(b) ? text(tag(b, 'guid')) : '');
    const enc = all(b, 'enclosure')[0];
    const desc = text(tag(b, 'description') || tag(b, 'summary') || tag(b, 'itunes:summary'));
    const body = text(tag(b, 'content:encoded') || tag(b, 'content'));
    return {
      title: text(tag(b, 'title')).replace(/\s+/g, ' '),
      url: url.trim(),
      guid: text(tag(b, 'guid') || tag(b, 'id')),
      published: isoDate(text(tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date'))),
      description: desc.length >= body.length ? desc : body, // the fuller of the two, for matching and the summary only
      words: (body || desc).split(/\s+/).filter(Boolean).length,
      duration: durationMin(text(tag(b, 'itunes:duration'))),
      audio: enc ? attr(enc.el, 'url') : '',
      categories: all(b, 'category').map(c => text(c.body) || attr(c.el, 'term')).filter(Boolean),
    };
  }).filter(i => i.title && /^https?:\/\//.test(i.url));
  return {title, items};
}
// a site's own feed: <link rel="alternate" type="application/rss+xml|atom+xml" href="…"> (relative hrefs resolved)
export function discoverFeeds(html, base) {
  const out = []; const re = /<link\b[^>]*>/gi; let m;
  while ((m = re.exec(String(html || '')))) {
    const el = m[0]; if (!/rel\s*=\s*["']?alternate/i.test(el) || !/type\s*=\s*["']?application\/(rss|atom)\+xml/i.test(el)) continue;
    const h = attr(el, 'href'); if (!h) continue; try { out.push(new URL(h, base).href); } catch {}
  }
  return [...new Set(out)];
}
// podcast episode notes: a time stamp stated next to a name ("12:40 Northbay recap", "Northbay T100 (31:15)", "[01:02:10] Kona picks").
// Returns the first stamp on a line that also holds one of the names, or null (never guessed).
export function timestampFor(notes, names) {
  const lines = String(notes || '').split(/\n|(?<=\.)\s+|\s+[–—-]\s+(?=\(?\[?\d)/);
  const keys = names.filter(Boolean).map(n => n.toLowerCase());
  for (const l of lines) {
    const low = l.toLowerCase(); if (!keys.some(k => low.includes(k))) continue;
    const m = /(?:^|[\s([])((?:\d{1,2}:)?[0-5]?\d:[0-5]\d)(?=$|[\s)\]:,.–—-])/.exec(l); if (m) return m[1];
  }
  return null;
}
