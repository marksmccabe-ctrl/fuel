// INVENTORY AUDIT: nothing a user could see or reach on main may vanish without a named reason.
//   node inventory.mjs <null.html> [allow.json]           the test (80 screens: about 3 minutes): snap the page into logs/last.json,
//                                                          then diff baseline-main.json (main, items 85-90, cache v115) against it
//   node inventory.mjs snap <page> <out.json>              walk every screen of lib/screens.mjs and record, per screen:
//     ids       every element id in the document (shown or not)
//     controls  every visible control (button, link, form field, summary, an ARIA widget role, a focusable [tabindex], an editable
//               box), keyed by tag (input:<type>, [role=x] when set) and its identity: #id, else its data-* attributes, else its
//               accessible name (aria-labelledby, aria-label, label, value, text, title, placeholder)
//     texts     every visible text node, plus the visible text of form controls (placeholder, button value, the options of a select)
//   node inventory.mjs diff <before.json> <after.json> [allow.json]   report what is gone
// Normalising (keys and texts): digit runs become #, lower case, white space collapsed, so a changed number is not a loss. A saved
// record id (any "id" string of 5+ characters in localStorage) inside an element id or a data-* value becomes *: those ids name the
// seeded records, and records made through the app get random ids (uid()), so jd-1126qg9 is kept as jd-* (the kind of id, not the record).
// Visible: rendered with a box, visibility visible, no ancestor at opacity 0, and not clipped away (overflow hidden / clip ancestors,
// clip / clip-path that hide everything, at least 2 x 2 px left); content anywhere in a scroll container (or further down the page)
// counts, since scrolling reaches it, but a fixed layer must be in the viewport (a closed sheet parked off screen is not visible).
// GONE means: in before on some screen, and in after on no screen at all. Present on any screen after counts as moved, not gone
// (moved items are counted; INV_VERBOSE=1 lists them). Ids are judged on the whole document of every screen.
// allow.json: {ids: [], controls: [], texts: []}, each entry {key: the key as the loss line prints it (an id with or without its #, a
// text without the quotes)} or {re: regular expression source, tested on the key}, plus why (required). Entries that match nothing
// are printed as notes.
// When main moves on (an item merged), snap main again into baseline-main.json and commit it.
// The diff also fails: a screen reached before that could not be reached after (its losses would hide); an allow entry without a key
// or re or a why; and integrity problems after that are not on KNOWN_ON_MAIN: an id used by two elements in one document, a visible
// control with no id, no data attribute and no accessible name (it cannot be told apart, and assistive tech has nothing to read).
// Each run starts with self-tests: the diff rules on a made-up pair, and probe elements on the first screen (shown, hidden in each
// way, clipped, off screen, in a scroll box, labelled, unnamed, a duplicate id) must come out as they should, so it cannot pass by
// measuring nothing. Prints the losses and "FAIL n", or "OK: inventory nothing removed (n checks)".
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from '../lib/screens.mjs';
import { checker } from '../lib/open.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE = path.join(HERE, 'baseline-main.json');
const VERBOSE = !!process.env.INV_VERBOSE;

// ---- KNOWN_ON_MAIN: integrity problems main (items 85-90, cache v115) already has. Each: kind ('dup-id' | 'unnamed'), key (exact) or
// re (RegExp on the key), reason. They print as "known" and do not fail, so a later item is judged only on new ones.
const KNOWN_ON_MAIN = [
  { kind: 'dup-id', re: /^bkbig-/,
    reason: 'bikeBigHtml(b) writes the Cages that fit a 1 L bottle label as id bkbig-<bike id>, and both the bike editor (#bikeList) and the Bottles sheet (#bottlesBig) render it, so each bike label id is in the document twice (on every screen) and the second group aria-labelledby points at the first copy (same words, so its name is right by luck)' },
];

/* ---------------------------------------------------------------- in the page: collect one screen */
const COLLECT = (probeOnly) => {
  const norm = s => String(s == null ? '' : s).replace(/\d+/g, '#').replace(/\s+/g, ' ').trim().toLowerCase();
  const de = document.documentElement, body = document.body, vw = innerWidth, vh = innerHeight;
  const sm = new Map(), st = e => { let s = sm.get(e); if (!s) { s = getComputedStyle(e); sm.set(e, s); } return s; };
  const R = (x0, y0, x1, y1) => ({ x0, y0, x1, y1 });
  const isect = (a, b) => R(Math.max(a.x0, b.x0), Math.max(a.y0, b.y0), Math.min(a.x1, b.x1), Math.min(a.y1, b.y1));
  /* the page itself: across its scroll width, from its top down (anything further down is reached by scrolling) */
  const ROOT = R(-scrollX, -scrollY, Math.max(de.scrollWidth, vw) - scrollX, Infinity), VIEW = R(0, 0, vw, vh);
  const selfMemo = new Map(), childMemo = new Map();
  const isRoot = e => !e || e === de || e === body;
  /* the region the box of an element itself may show in (viewport coordinates) */
  function selfClip(e) {
    if (selfMemo.has(e)) return selfMemo.get(e);
    const s = st(e); let c;
    if (s.position === 'fixed') c = VIEW;
    else if (s.position === 'absolute') { let a = e.parentElement; while (!isRoot(a) && st(a).position === 'static' && st(a).transform === 'none') a = a.parentElement; c = childClip(a); }
    else c = childClip(e.parentElement);
    selfMemo.set(e, c); return c;
  }
  /* the region the children of an element may show in: its own, cut by its overflow (hidden / clip cut; a scroll box opens its whole scroll range) */
  function childClip(a) {
    if (isRoot(a)) return ROOT;
    if (childMemo.has(a)) return childMemo.get(a);
    const s = st(a), c0 = selfClip(a); let c = c0;
    if (s.display !== 'contents' && (s.overflowX !== 'visible' || s.overflowY !== 'visible')) {
      const b = a.getBoundingClientRect(), px = b.left + a.clientLeft, py = b.top + a.clientTop;
      const box = R(px, py, px + a.clientWidth, py + a.clientHeight), seen = isect(box, c0), open = seen.x1 - seen.x0 > 0 && seen.y1 - seen.y0 > 0;
      /* per axis: hidden / clip cut to the box; auto / scroll open the whole scroll range (when the box itself shows); visible keeps */
      const axis = (ov, lo, hi, blo, bhi, slo, shi) => /^(hidden|clip)$/.test(ov) ? [Math.max(lo, blo), Math.min(hi, bhi)] : /^(auto|scroll)$/.test(ov) ? (open ? [slo, shi] : [0, -1]) : [lo, hi];
      const X = axis(s.overflowX, c0.x0, c0.x1, box.x0, box.x1, px - a.scrollLeft, px - a.scrollLeft + a.scrollWidth);
      const Y = axis(s.overflowY, c0.y0, c0.y1, box.y0, box.y1, py - a.scrollTop, py - a.scrollTop + a.scrollHeight);
      c = R(X[0], Y[0], X[1], Y[1]);
    }
    childMemo.set(a, c); return c;
  }
  /* display, opacity, and a clip / clip-path that hides it all, on the element or an ancestor */
  const shownMemo = new Map();
  function shown(e) {
    if (!e || e === de) return true;
    if (shownMemo.has(e)) return shownMemo.get(e);
    const s = st(e);
    const v = s.display !== 'none' && s.contentVisibility !== 'hidden' && parseFloat(s.opacity) > 0 && !/^rect\(0px,? 0px,? 0px,? 0px\)$/.test(s.clip) && !/^inset\(50%\)$/.test(s.clipPath) && shown(e.parentElement);
    shownMemo.set(e, v); return v;
  }
  const seenRect = (rects, c) => { for (const r of rects) { const i = isect(R(r.left, r.top, r.right, r.bottom), c); if (i.x1 - i.x0 >= 2 && i.y1 - i.y0 >= 2) return true; } return false; };
  const elVisible = e => shown(e) && st(e).visibility === 'visible' && seenRect(e.getClientRects(), selfClip(e));

  /* accessible name (a plain take on accname: labelledby, aria-label, labels, value, alt, content, title, placeholder) */
  const NAME_FROM_CONTENT = /^(button|a|summary|option|label|legend|h[1-6])$/;
  const ROLE_FROM_CONTENT = /^(button|link|tab|menuitem|menuitemradio|menuitemcheckbox|option|checkbox|radio|switch|treeitem|cell|heading)$/;
  function textOf(e, depth) {
    let t = '';
    for (const n of e.childNodes) {
      if (n.nodeType === 3) t += n.data;
      else if (n.nodeType === 1) {
        if (n.getAttribute('aria-hidden') === 'true' || /^(SCRIPT|STYLE|TEMPLATE|INPUT|SELECT|TEXTAREA)$/.test(n.tagName)) continue;
        if (st(n).display === 'none' || st(n).visibility === 'hidden') continue;
        const al = n.getAttribute('aria-label');
        if (al && al.trim()) t += ' ' + al + ' ';
        else if (n.tagName === 'IMG') t += ' ' + (n.getAttribute('alt') || '') + ' ';
        else if (depth < 20) t += ' ' + textOf(n, depth + 1) + ' ';
      }
    }
    return t;
  }
  function accName(e) {
    const lb = e.getAttribute('aria-labelledby');
    if (lb) { const t = lb.split(/\s+/).map(i => document.getElementById(i)).filter(Boolean).map(x => textOf(x, 0)).join(' '); if (t.trim()) return t; }
    const al = e.getAttribute('aria-label'); if (al && al.trim()) return al;
    const tag = e.tagName.toLowerCase(), role = e.getAttribute('role') || '';
    if (/^(input|select|textarea)$/.test(tag) && e.labels && e.labels.length) { const t = [...e.labels].map(l => textOf(l, 0)).join(' '); if (t.trim()) return t; }
    if (tag === 'input' && /^(button|submit|reset)$/.test(e.type) && e.value) return e.value;
    if (tag === 'input' && e.type === 'image') return e.getAttribute('alt') || '';
    if (NAME_FROM_CONTENT.test(tag) || ROLE_FROM_CONTENT.test(role)) { const t = textOf(e, 0); if (t.trim()) return t; }
    return e.getAttribute('title') || e.getAttribute('placeholder') || '';
  }
  /* the ids of saved records (every "id" string of 5+ characters in localStorage), written as * where an element id or data value holds one */
  const rec = new Set();
  const walk = (v, k, d) => { if (d > 12 || v == null) return; if (typeof v === 'string') { if (/^(id|uid)$/i.test(k) && v.length >= 5) rec.add(v); return; }
    if (typeof v === 'object') for (const [kk, vv] of Object.entries(v)) walk(vv, Array.isArray(v) ? k : kk, d + 1); };
  for (let i = 0; i < localStorage.length; i++) { try { walk(JSON.parse(localStorage.getItem(localStorage.key(i))), '', 0); } catch (e) { /* not JSON */ } }
  const recs = [...rec].sort((a, b) => b.length - a.length);
  const deRec = v => { if (v.length < 5) return v; for (const r of recs) if (v.includes(r)) v = v.split(r).join('*'); return v; };
  /* data-* attributes as identity: record ids as *, digits normalised; a value that still looks generated (a long mix of letters and digits) is * too */
  function dataKey(e) {
    const L = [];
    for (const a of e.attributes) {
      if (!a.name.startsWith('data-')) continue;
      let v = deRec(a.value.trim());
      if (v.length > 40 || /[a-z][0-9]|[0-9][a-z]/i.test(v) && /[0-9].*[0-9]/.test(v.replace(/^\D+/, '')) && v.replace(/[^0-9]/g, '').length >= 3) v = '*';
      L.push('[' + a.name + (v === '' ? '' : '=' + (v === '*' ? v : norm(v))) + ']');
    }
    return L.sort().join('');
  }
  const CTRL = 'button, a[href], input:not([type=hidden]), select, textarea, summary, [contenteditable=""], [contenteditable=true], [tabindex]:not([tabindex^="-"]), '
    + ['button', 'link', 'tab', 'switch', 'checkbox', 'radio', 'menuitem', 'menuitemradio', 'menuitemcheckbox', 'option', 'slider', 'spinbutton', 'combobox', 'textbox', 'searchbox', 'treeitem'].map(r => '[role=' + r + ']').join(', ');

  const out = { ids: [], dup: [], controls: [], unnamed: [], texts: [] };
  /* ids: the whole document */
  const idn = new Map();
  for (const e of document.querySelectorAll('[id]')) { const i = e.id; if (!i || !probeOnly === !!e.closest('#kitInvProbe')) continue; idn.set(i, (idn.get(i) || 0) + 1); }
  for (const [i, n] of idn) { out.ids.push(deRec(i)); if (n > 1) out.dup.push(deRec(i)); }
  /* controls */
  const ctx = e => { const a = e.parentElement && e.parentElement.closest('[id]'); return a ? ' in #' + deRec(a.id) : ''; };
  for (const e of document.querySelectorAll(CTRL)) {
    if (probeOnly && !e.closest('#kitInvProbe')) continue;
    if (!probeOnly && e.closest('#kitInvProbe')) continue;
    if (!elVisible(e)) continue;
    const tag = e.tagName.toLowerCase(), role = e.getAttribute('role');
    const kind = tag + (tag === 'input' ? ':' + e.type : '') + (role ? '[role=' + role + ']' : '');
    /* what a form control shows as text */
    if ((tag === 'input' || tag === 'textarea') && e.placeholder) out.texts.push(norm(e.placeholder));
    if (tag === 'input' && /^(button|submit|reset)$/.test(e.type) && e.value) out.texts.push(norm(e.value));
    if (tag === 'select') for (const o of e.options) { const t = norm(o.label || o.text); if (t) out.texts.push(t); }
    let ident = e.id ? '#' + deRec(e.id) : dataKey(e);
    if (!ident) { const n = norm(accName(e)); if (n) ident = '"' + n.slice(0, 80) + '"'; }
    if (!ident) { const k = kind + ' (unnamed' + (e.classList.length ? ' .' + [...e.classList].sort().join('.') : '') + ctx(e) + ')'; out.controls.push(k); out.unnamed.push(k); continue; }
    out.controls.push(kind + ' ' + ident);
  }
  /* visible text nodes */
  const tw = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, { acceptNode: n => {
    const p = n.parentElement; if (!p || !n.data.trim()) return NodeFilter.FILTER_REJECT;
    if (p.closest('script, style, noscript, template, textarea, select, option, title, desc')) return NodeFilter.FILTER_REJECT;
    if (probeOnly ? !p.closest('#kitInvProbe') : !!p.closest('#kitInvProbe')) return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT; } });
  const range = document.createRange();
  for (let n; (n = tw.nextNode());) {
    const p = n.parentElement;
    if (!shown(p) || st(p).visibility !== 'visible') continue;
    range.selectNodeContents(n);
    let rects = range.getClientRects(); if (!rects.length) rects = p.getClientRects();
    if (!seenRect(rects, childClip(p))) continue;
    const t = norm(n.data); if (t) out.texts.push(t);
  }
  for (const k of ['ids', 'dup', 'controls', 'unnamed', 'texts']) out[k] = [...new Set(out[k])];
  return out;
};

/* ---------------------------------------------------------------- the probes for the collector self-test (put on the first screen) */
const PROBES = () => {
  const d = document.createElement('div'); d.id = 'kitInvProbe';
  d.style.cssText = 'position:fixed;left:0;top:0;width:300px;z-index:2147483000;background:#fff;color:#000;font:14px sans-serif';
  d.innerHTML = '<p>Kitprobe 123 visible   TEXT</p>'
    + '<button aria-label="Kitprobe named 7">x</button><button id="kitInvBtn">kitprobe with id</button>'
    + '<button data-kitprobe="one" data-kp-n="12">kitprobe data</button><button data-kitprobe="lq3x9a2b77">kitprobe made-up id</button>'
    + '<label><input type="checkbox"> Kitprobe label</label><input type="text" placeholder="Kitprobe placeholder">'
    + '<select><option>Kitprobe option a</option><option>Kitprobe option b</option></select>'
    + '<button class="kp-ic"><svg width="16" height="16"><path d="M0 0h16v16z"/></svg></button>'
    + '<p style="display:none">kitprobe hidden none</p><p style="visibility:hidden">kitprobe hidden visibility</p>'
    + '<div style="opacity:0"><p>kitprobe hidden opacity</p><button>kitprobe hidden button</button></div>'
    + '<div style="height:0;overflow:hidden"><p>kitprobe hidden clipped</p></div>'
    + '<span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">kitprobe hidden sr only</span>'
    + '<p style="position:absolute;left:-9999px">kitprobe hidden far left</p>'
    + '<div style="position:fixed;left:0;top:200vh"><p>kitprobe hidden below the viewport</p></div>'
    + '<div style="height:40px;overflow:auto"><div style="height:400px"></div><p>kitprobe scrolled in a box</p></div>'
    + '<span id="kitInvDup">a</span><span id="kitInvDup" style="display:none">b</span><i id="kitInvGhost" style="display:none"></i>'
    + '<button id="kp-zq7kitprobe">kitprobe record</button><button data-kp-rec="zq7kitprobe">kitprobe record data</button>';
  document.body.appendChild(d);
  localStorage.setItem('kitInvProbe.rec', JSON.stringify([{ id: 'zq7kitprobe', name: 'a saved record' }]));
};

/* ---------------------------------------------------------------- snap */
async function snap(page, outFile, C, only) {
  const T0 = Date.now(), per = {}, info = {};
  let probed = false;
  const results = await run(async (s, o) => {
    if (!o.p) return; /* could not open: run() reports it */
    const p = o.p;
    await p.mouse.move(-10, -10).catch(() => {});
    await p.evaluate(async () => { /* finite animations and transitions done */
      const t0 = performance.now();
      while (performance.now() - t0 < 4000) {
        const r = document.getAnimations().filter(a => a.playState === 'running' && a.effect && isFinite(a.effect.getComputedTiming().endTime));
        if (!r.length) return; await new Promise(f => setTimeout(f, 100));
      }
    }).catch(() => {});
    per[s.name] = await p.evaluate(COLLECT, false);
    if (!probed && C) { probed = true; await p.evaluate(PROBES); probeCheck(await p.evaluate(COLLECT, true), C); await p.evaluate(() => { document.getElementById('kitInvProbe').remove(); localStorage.removeItem('kitInvProbe.rec'); }); }
  }, { page, log: VERBOSE, only: only || undefined });
  if (!outFile) return per;
  for (const r of results) info[r.name] = { fail: r.fail || null, errors: r.errors.length };
  const reached = results.filter(r => !r.fail && per[r.name]).map(r => r.name);
  const snapOut = { kind: 'fred inventory', version: 1, page: path.resolve(page), taken: new Date().toISOString(), seconds: Math.round((Date.now() - T0) / 1000), screens: {}, ids: {}, controls: {}, texts: {}, dupIds: {}, unnamed: {} };
  for (const r of results) {
    const d = per[r.name];
    snapOut.screens[r.name] = Object.assign(info[r.name], d ? { ids: d.ids.length, controls: d.controls.length, texts: d.texts.length } : {});
  }
  const add = (m, k, name) => { (m[k] || (m[k] = [])).push(name); };
  for (const name of Object.keys(per)) {
    const d = per[name];
    for (const k of d.ids) add(snapOut.ids, k, name);
    for (const k of d.controls) add(snapOut.controls, k, name);
    for (const k of d.texts) add(snapOut.texts, k, name);
    for (const k of d.dup) add(snapOut.dupIds, k, name);
    for (const k of d.unnamed) add(snapOut.unnamed, k, name);
  }
  /* "*": on every screen that was reached */
  for (const m of ['ids', 'controls', 'texts', 'dupIds', 'unnamed']) for (const k of Object.keys(snapOut[m])) {
    const L = snapOut[m][k]; if (reached.length > 1 && reached.every(n => L.includes(n))) snapOut[m][k] = '*';
  }
  mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
  writeFileSync(outFile, stringify(snapOut));
  return snapOut;
}
// one entry per line, sorted, so a baseline diffs well in git
function stringify(o) {
  const L = ['{'], keys = Object.keys(o);
  keys.forEach((k, i) => {
    const v = o[k], end = i < keys.length - 1 ? ',' : '';
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const ks = k === 'screens' ? Object.keys(v) : Object.keys(v).sort();
      L.push(JSON.stringify(k) + ': {');
      ks.forEach((kk, j) => L.push('  ' + JSON.stringify(kk) + ': ' + JSON.stringify(v[kk]) + (j < ks.length - 1 ? ',' : '')));
      L.push('}' + end);
    } else L.push(JSON.stringify(k) + ': ' + JSON.stringify(v) + end);
  });
  L.push('}');
  return L.join('\n') + '\n';
}

/* ---------------------------------------------------------------- the collector self-test */
function probeCheck(d, C) {
  const has = (L, x) => L.includes(x);
  const want = [
    ['texts', 'kitprobe # visible text', true], ['controls', 'button "kitprobe named #"', true], ['controls', 'button #kitInvBtn', true],
    ['controls', 'button [data-kitprobe=one][data-kp-n=#]', true], ['controls', 'button [data-kitprobe=*]', true],
    ['controls', 'input:checkbox "kitprobe label"', true], ['controls', 'input:text "kitprobe placeholder"', true],
    ['texts', 'kitprobe placeholder', true], ['texts', 'kitprobe option b', true], ['texts', 'kitprobe label', true],
    ['controls', 'select "kitprobe option a kitprobe option b"', false], ['texts', 'kitprobe scrolled in a box', true],
    ['unnamed', 'button (unnamed .kp-ic in #kitInvProbe)', true], ['unnamed', 'select (unnamed in #kitInvProbe)', true], ['dup', 'kitInvDup', true], ['ids', 'kitInvGhost', true],
    ...['none', 'visibility', 'opacity', 'clipped', 'sr only', 'far left', 'below the viewport'].map(w => ['texts', 'kitprobe hidden ' + w, false]),
    ['controls', 'button "kitprobe hidden button"', false], ['ids', 'kp-*', true], ['controls', 'button #kp-*', true], ['controls', 'button [data-kp-rec=*]', true],
  ];
  const bad = want.filter(([k, x, v]) => has(d[k], x) !== v);
  C.ok(!bad.length, 'self-test: the collector finds the shown probes and skips the hidden ones', { wrong: bad, got: d });
}
function diffSelfTest(C) {
  const mk = (ids, controls, texts, screensFail) => ({ screens: Object.assign({ a: { fail: null }, b: { fail: null } }, screensFail || {}), ids, controls, texts, dupIds: {}, unnamed: {} });
  const before = mk({ keep: '*', lost: ['a'] }, { 'button #x': '*', 'button #y': ['a'] }, { kept: '*', moved: ['a'], lost: ['b'], 'lost too': ['a'], 'allowed #': ['a'] });
  const after = mk({ keep: '*' }, { 'button #x': '*' }, { kept: '*', moved: ['b'] }, { b: { fail: 'gone' } });
  const r = diff(before, after, { texts: [{ key: 'allowed #', why: 'test' }, { re: '^nothing$', why: 'test' }, { re: '(', why: 'test' }], ids: [{ key: 'lost' }], controls: [{ key: '#y', why: 'a control key is the whole key' }] }, []);
  const got = JSON.stringify({ ids: r.gone.ids, controls: r.gone.controls, texts: r.gone.texts, moved: r.moved.texts, allowed: r.allowed.length, badAllow: r.badAllow.length, unreached: r.unreached, unused: r.unusedAllow.length });
  const want = JSON.stringify({ ids: ['lost'], controls: ['button #y'], texts: ['lost', 'lost too'], moved: ['moved'], allowed: 1, badAllow: 2, unreached: ['b'], unused: 2 });
  C.ok(got === want, 'self-test: the diff finds what is gone, lets moved and allowed items pass, and rejects an allow entry without a why', { got, want });
}

/* ---------------------------------------------------------------- diff */
function diff(before, after, allow, known) {
  const keys = m => Object.keys(m || {});
  const badAllow = [], used = new Set(), allowed = [], A = {};
  for (const kind of ['ids', 'controls', 'texts']) {
    A[kind] = [];
    for (const [i, e] of ((allow && allow[kind]) || []).entries()) {
      let re = null;
      try { re = e && e.re ? new RegExp(e.re) : null; } catch (x) { badAllow.push(kind + '[' + i + '] bad re: ' + JSON.stringify(e)); continue; }
      if (!e || (!e.key && !re) || !e.why || !String(e.why).trim()) { badAllow.push(kind + '[' + i + '] ' + JSON.stringify(e)); continue; }
      const key = e.key && kind === 'ids' ? String(e.key).replace(/^#/, '') : e.key;
      A[kind].push({ e, i, test: key ? k => k === key : k => re.test(k) });
    }
  }
  const gone = {}, moved = {};
  const reached = s => keys(s.screens).filter(n => !s.screens[n].fail), rb = reached(before), ra = reached(after);
  const on = (L, all) => L === '*' ? all : L;
  for (const kind of ['ids', 'controls', 'texts']) {
    gone[kind] = []; moved[kind] = [];
    const b = before[kind] || {}, a = after[kind] || {};
    for (const k of keys(b).sort()) {
      if (k in a) { const A2 = on(a[k], ra); if (kind !== 'ids' && !on(b[k], rb).some(s => A2.includes(s))) moved[kind].push(k); continue; }
      const al = A[kind].find(x => x.test(k));
      if (al) { used.add(kind + al.i); allowed.push({ kind, k, why: al.e.why, was: b[k] }); continue; }
      gone[kind].push(k);
    }
  }
  const unusedAllow = [];
  for (const kind of ['ids', 'controls', 'texts']) for (const x of A[kind]) if (!used.has(kind + x.i)) unusedAllow.push(kind + ': ' + (x.e.key || '/' + x.e.re + '/') + ' -- ' + x.e.why);
  const unreached = keys(before.screens).filter(s => !before.screens[s].fail && (!after.screens[s] || after.screens[s].fail));
  const issues = [];
  for (const [kind, m] of [['dup-id', after.dupIds], ['unnamed', after.unnamed]]) for (const k of keys(m).sort()) {
    const ki = known.findIndex(x => x.kind === kind && (x.key ? x.key === k : x.re.test(k)));
    issues.push({ kind, k, on: m[k], known: ki });
  }
  return { gone, moved, allowed, badAllow, unusedAllow, unreached, issues };
}
const show = (kind, k) => kind === 'ids' ? '#' + k : kind === 'texts' ? JSON.stringify(k) : k;
const where = L => L === '*' ? 'every screen' : L.length > 4 ? L.slice(0, 4).join(', ') + ' and ' + (L.length - 4) + ' more' : L.join(', ');
function report(before, after, allow, C) {
  for (const [n, s] of [['before', before], ['after', after]]) if (!s || s.kind !== 'fred inventory' || !s.screens) { console.log('not an inventory snapshot (' + n + ')'); process.exit(2); }
  const r = diff(before, after, allow, KNOWN_ON_MAIN);
  const label = { ids: 'id', controls: 'control', texts: 'text' };
  for (const s of r.unreached) C.ok(false, 'screen ' + s + ' was reached before but not after (what it showed cannot be checked): ' + ((after.screens[s] || {}).fail || 'not in the after snapshot'));
  for (const s of Object.keys(after.screens)) if (after.screens[s].fail && (!before.screens[s] || before.screens[s].fail)) console.log('  note: screen ' + s + ' not reached (before either): ' + after.screens[s].fail);
  for (const x of r.badAllow) C.ok(false, 'allow entry needs a key or re and a why: ' + x);
  for (const kind of ['ids', 'controls', 'texts']) {
    for (const k of r.gone[kind]) C.ok(false, label[kind] + ' gone: ' + show(kind, k) + ' (was on ' + where(before[kind][k]) + ')');
    const nb = Object.keys(before[kind] || {}).length, na = r.allowed.filter(x => x.kind === kind).length;
    if (!r.gone[kind].length) C.ok(true, kind + ': ' + nb + ' before, none gone' + (na ? ' (' + na + ' allowed)' : '') + (r.moved[kind].length ? ', ' + r.moved[kind].length + ' only on other screens now (moved)' : ''));
    if (VERBOSE) for (const k of r.moved[kind]) console.log('  moved ' + label[kind] + ': ' + show(kind, k) + ' was on ' + where(before[kind][k]) + ', now on ' + where(after[kind][k]));
  }
  for (const x of r.allowed) console.log('  allowed ' + label[x.kind] + ' gone: ' + show(x.kind, x.k) + ' -- ' + x.why);
  for (const x of r.unusedAllow) console.log('  note: allow entry matched nothing (remove it): ' + x);
  const seen = new Set();
  for (const x of r.issues) {
    const what = x.kind === 'dup-id' ? 'id used by more than one element: #' + x.k : 'control with no id, data attribute or accessible name: ' + x.k;
    if (x.known >= 0) { seen.add(x.known); console.log('  known ' + what + ' (on ' + where(x.on) + ') -- KNOWN_ON_MAIN: ' + KNOWN_ON_MAIN[x.known].reason); }
    else C.ok(false, what + ' (on ' + where(x.on) + ')');
  }
  if (!r.issues.some(x => x.known < 0)) C.ok(true, 'integrity: no new duplicate ids, no new controls without a name');
  KNOWN_ON_MAIN.forEach((k, i) => { if (!seen.has(i)) console.log('  note: KNOWN_ON_MAIN entry not seen any more (remove it): ' + k.kind + ' ' + (k.key || k.re) + ' -- ' + k.reason); });
}

/* ---------------------------------------------------------------- main */
const readJSON = f => JSON.parse(readFileSync(f, 'utf8'));
const [a1, a2, a3, a4] = process.argv.slice(2);
const C = checker();
if (a1 === 'snap') {
  if (!a2 || !a3) { console.log('usage: node inventory.mjs snap <page> <out.json>'); process.exit(2); }
  const s = await snap(a2, a3, C);
  const n = Object.keys(s.screens).length, failed = Object.entries(s.screens).filter(([, v]) => v.fail);
  for (const [k, v] of failed) C.ok(false, 'screen ' + k + ' not reached: ' + v.fail);
  C.ok(Object.keys(s.ids).length >= 300 && Object.keys(s.controls).length >= 100 && Object.keys(s.texts).length >= 300, 'the inventory is not empty: ' + Object.keys(s.ids).length + ' ids, ' + Object.keys(s.controls).length + ' controls, ' + Object.keys(s.texts).length + ' texts on ' + (n - failed.length) + ' of ' + n + ' screens');
  console.log('  snapshot ' + path.resolve(a3) + ' in ' + s.seconds + ' s');
  C.done('inventory snapshot taken');
} else if (a1 === 'diff') {
  if (!a2 || !a3) { console.log('usage: node inventory.mjs diff <before.json> <after.json> [allow.json]'); process.exit(2); }
  diffSelfTest(C);
  report(readJSON(a2), readJSON(a3), a4 ? readJSON(a4) : null, C);
  C.done('inventory nothing removed');
} else if (a1 === 'dump') {
  /* debugging: what one or more screens give (node inventory.mjs dump <page> <screen regex>) */
  const per = await snap(a2, null, C, new RegExp(a3 || '^plan-before$'));
  console.log(JSON.stringify(per, null, 1));
  C.done('inventory dump');
} else if (a1 && !/^(snap|diff|dump)$/.test(a1)) {
  /* the test: snap this page, diff the main baseline against it */
  if (!existsSync(BASELINE)) { console.log('no baseline: node inventory.mjs snap <main null.html> ' + BASELINE); process.exit(2); }
  diffSelfTest(C);
  const out = path.join(HERE, 'logs', 'last.json');
  const s = await snap(a1, out, C);
  report(readJSON(BASELINE), s, a2 ? readJSON(a2) : null, C);
  console.log('  ' + Object.keys(s.screens).length + ' screens in ' + s.seconds + ' s (after snapshot: ' + out + ')');
  C.done('inventory nothing removed');
} else { console.log('usage: node inventory.mjs <null.html> [allow.json] | snap <page> <out.json> | diff <before.json> <after.json> [allow.json]'); process.exit(2); }
