// node contrast.test.mjs <null.html> [screen-name regex]      (all 80 screens: about 3 minutes)
//   CONTRAST AUDIT on every screen of the shared kit2 list (lib/screens.mjs), as the screen shows it (the viewport, after go()):
//   - every visible text node, the text of form controls (value, selected option, placeholder), CSS generated text (::before/::after
//     content) and icon-only buttons (a glyph character, an SVG icon or a masked icon) against its real backdrop, WCAG AA:
//       text 4.5:1, large text 3:1 (>= 24 px, or >= 18.66 px and bold). A glyph character in an icon-only button is text and takes
//       the text rule. An SVG / masked icon in an icon-only button is a graphical object, so AA asks 3:1 of it (1.4.11); so does a
//       chevron, arrow, tick, cross, plus or minus drawn as generated content (ICON_GLYPH; item 83 held the chevrons to 3:1).
//   - the backdrop: the elements under the text at up to three points per line (elementsFromPoint, with pointer-events forced on so
//     decorative layers count), composited from the topmost opaque layer up through every semi-transparent background (each times its
//     opacity), the text colour times its opacity on top. When a layer under the text is not a flat colour (a gradient or image
//     background, an img / canvas / SVG shape, a mask, a filter or blend, an inset shadow, a painted ::before / ::after, a faint
//     overlay above it) or the text has a text-shadow halo, the backdrop is sampled from a screenshot taken with the text hidden
//     (visibility:hidden on the text node parent; when that parent paints its own background, which visibility:hidden would also
//     remove, or the text has a halo, only the glyphs are made transparent: a halo is background, WCAG Understanding 1.4.3): the
//     pixels behind the glyphs (where the shown and hidden shots differ), and the 95th-percentile worst case is the result.
//   - visible means: inside the viewport and its clipping ancestors, visibility visible, opacity above zero, hit-testable at the
//     point and not under anything painted above it (a sheet scrim, the sticky header). Finite animations and transitions are let
//     finish first. Skipped: disabled controls (disabled or aria-disabled="true"), aria-hidden decorative elements (except the glyph
//     of an icon-only button, which is its visible label), anything inside [data-contrast-exempt], and the EXEMPT list below.
//   - NO SOLID COLOUR BLOCKS (QUEUE.md item 1, part 0, THE RULE: "No solid color blocks anywhere except buttons, dots, charts and
//     pills"; QUEUE_LOG part 9-10: "no solid palette-colour blocks outside buttons/dots/charts/pills/table cells/logo/Strava artwork"):
//     a text-free box larger than 40 x 40 px whose own fill stands out from what is under it (contrast 1.4:1 or more, or a chroma
//     difference of 0.2 or more; over a backdrop that is not flat, judged on the screenshot against a 4 px ring around it) is
//     flagged, unless it is part of a button or control, round (a dot or pill), a table cell, an image or SVG graphic, or on
//     SOLID_ALLOW (each entry names where QUEUE / QUEUE_LOG allow it).
//   - a self-test on the first screen: probes (failing grey, large and bold text, a gradient, alpha, opacity, aria-hidden, exempt,
//     disabled, a placeholder, a value, SVG icons, an icon-only glyph, generated text, a chevron, solid, round, tinted and gradient
//     blocks, text under a scrim, a halo) must come out as they should, so the audit cannot pass by measuring nothing.
// Every failure prints its screen, selector, text, colours and ratio. Failures that main already has are listed in KNOWN_ON_MAIN
// (with the reason): they print as "known" and do not fail, so a later item is judged only on new failures.
// KC_DEBUG=1 prints per-screen counts; KC_HIDDEN=1 also measures aria-hidden text and prints its failures as notes.
import zlib from 'node:zlib';
import { run } from '../lib/screens.mjs';
import { checker } from '../lib/open.mjs';

const PAGE = process.argv[2], ONLY = process.argv[3] ? new RegExp(process.argv[3]) : null, DEBUG = !!process.env.KC_DEBUG, HIDDEN = !!process.env.KC_HIDDEN;
if (!PAGE) { console.log('usage: node contrast.test.mjs <null.html> [screen regex]'); process.exit(2); }

// ---- named exemptions from the contrast rule (matched with element.closest(sel)); each needs a WCAG reason, not convenience
const EXEMPT = [
];
// ---- text-free coloured boxes the rule allows by name (matched with element.closest(sel)), each with where QUEUE_LOG allows it
const SOLID_ALLOW = [
  { sel: '.vtd-chart', reason: 'an open Volume tile bar chart (its bars): THE RULE allows charts (QUEUE.md item 1 part 0; item 89)' },
  { sel: '.rwx-scene', reason: 'the weather card sky layer (item 87, a living sky behind the top of the box; the kit allows gradients inside the sky block); it only stands out on the graphite run card' },
];
// ---- KNOWN_ON_MAIN: failures main (items 85-90, cache v115) already has. Each: screen (RegExp), kind (text, control, pseudo, icon,
// svg-icon, solid), sel (RegExp on the reported selector), text (RegExp, optional), reason. They print as "known" and do not fail.
const KNOWN_ON_MAIN = [
  { screen: /^plan-sport-menu$/, kind: 'text', sel: /^#sportMenu > button.* > small$/,
    reason: 'the sport menu hint line (.sport-menu small, --g-val #6E6E73, 13 px) on the selected row (--tint-blue #E6F1F6) is 4.41:1; AA needs 4.5' },
  { screen: /^(volume-|desktop-volume$)/, kind: 'text', sel: /^#volWk > svg\.vwk-svg > text/, text: /^[JFMASOND]$/,
    reason: 'the weekly chart month initials (9 px, fill VOL_C.dark #8E8E93, the decoration grey the spec keeps off text) are 3.26:1 on white; they label the axis, so AA needs 4.5' },
];

/* ---------------------------------------------------------------- colour maths (WCAG 2.x) */
const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = c => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const over = (fg, a, bg) => [0, 1, 2].map(i => fg[i] * a + bg[i] * (1 - a));
const rgb = c => 'rgb(' + c.slice(0, 3).map(v => Math.round(v)).join(',') + ')';
const fgs = c => c[3] < 0.999 ? 'rgba(' + c.slice(0, 3).map(v => Math.round(v)).join(',') + ',' + (+c[3].toFixed(3)) + ')' : rgb(c);

/* ---------------------------------------------------------------- a small PNG reader (Chrome screenshots: 8-bit RGB / RGBA) */
function decodePNG(buf) {
  let o = 8, w = 0, h = 0, bd = 0, ct = 0, il = 0; const idat = [];
  while (o + 8 <= buf.length) {
    const len = buf.readUInt32BE(o), type = buf.toString('latin1', o + 4, o + 8), d = buf.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); bd = d[8]; ct = d[9]; il = d[12]; }
    else if (type === 'IDAT') idat.push(d);
    else if (type === 'IEND') break;
    o += 12 + len;
  }
  const bpp = { 0: 1, 2: 3, 4: 2, 6: 4 }[ct];
  if (bd !== 8 || !bpp || il) throw new Error('png: unsupported format ' + JSON.stringify({ bd, ct, il }));
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, px = Buffer.alloc(w * h * 3);
  let prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], s = y * (stride + 1) + 1;
    for (let i = 0; i < stride; i++) {
      const x = raw[s + i], a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = x;
      if (f === 1) v = x + a; else if (f === 2) v = x + b; else if (f === 3) v = x + ((a + b) >> 1);
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      cur[i] = v & 255;
    }
    for (let x = 0; x < w; x++) { const q = (y * w + x) * 3, i = x * bpp; if (bpp >= 3) { px[q] = cur[i]; px[q + 1] = cur[i + 1]; px[q + 2] = cur[i + 2]; } else px[q] = px[q + 1] = px[q + 2] = cur[i]; }
    const t = prev; prev = cur; cur = t;
  }
  return { w, h, at: (x, y) => { const q = (y * w + x) * 3; return [px[q], px[q + 1], px[q + 2]]; } };
}

/* ---------------------------------------------------------------- the in-page collector (runs inside the page; no outer variables) */
function COLLECT({ exempt, solidAllow, hidden }) {
  const W = innerWidth, H = innerHeight, out = { items: [], blocks: [], stats: { skipped: {}, covered: 0, offscreen: 0 } };
  const skip = k => { out.stats.skipped[k] = (out.stats.skipped[k] || 0) + 1; };
  const force = document.createElement('style');
  force.textContent = '*,*::before,*::after{pointer-events:auto!important}';
  document.head.appendChild(force);
  try {
    const cx = document.createElement('canvas').getContext('2d'), PC = new Map();
    const parse = s => {
      if (!s || s === 'none' || s === 'transparent') return [0, 0, 0, 0];
      if (PC.has(s)) return PC.get(s);
      let v = null, m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/.exec(s);
      if (m) v = [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : m[5] ? m[4] / 100 : +m[4]];
      else if (!/^url\(/.test(s)) {
        cx.fillStyle = '#010203'; cx.fillStyle = s; const f = cx.fillStyle;
        if (f !== '#010203' || /^#010203$/i.test(s)) {
          if (f[0] === '#') v = [parseInt(f.slice(1, 3), 16), parseInt(f.slice(3, 5), 16), parseInt(f.slice(5, 7), 16), 1];
          else { m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(f); if (m) v = [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]]; }
        }
      }
      PC.set(s, v); return v;
    };
    const CS = new Map(), cs = e => { let c = CS.get(e); if (!c) CS.set(e, c = getComputedStyle(e)); return c; };
    const EO = new Map(), eo = e => {
      if (!e || e.nodeType !== 1) return 1;
      let v = EO.get(e); if (v !== undefined) return v;
      v = (+cs(e).opacity || 0) * eo(e.parentElement); EO.set(e, v); return v;
    };
    const over = (fg, a, bg) => [0, 1, 2].map(i => fg[i] * a + bg[i] * (1 - a));
    const REPLACED = /^(img|canvas|video|iframe|object|embed|picture)$/;
    const INTERACTIVE = 'button, [role=button], a[href], summary, [role=tab], [role=menuitem], [role=menuitemradio], [role=menuitemcheckbox], [role=switch], [role=link], [role=option]';
    const why = e => {
      if (e.closest('[aria-hidden="true"]')) return 'aria-hidden';
      if (e.closest('[data-contrast-exempt]')) return 'data-contrast-exempt';
      if (e.closest(':disabled, [aria-disabled="true"]')) return 'disabled';
      for (const x of exempt) if (e.closest(x.sel)) return 'EXEMPT ' + x.sel;
      return '';
    };
    const sel = e => {
      const parts = [];
      for (let x = e; x && x.nodeType === 1 && x !== document.documentElement && x !== document.body; x = x.parentElement) {
        if (x.id) { parts.unshift('#' + x.id); break; }
        let s = x.localName; const cl = [...x.classList].slice(0, 3);
        if (cl.length) s += '.' + cl.join('.');
        const sib = x.parentElement ? [...x.parentElement.children].filter(y => y.localName === x.localName) : [];
        if (sib.length > 1) s += ':nth-of-type(' + (sib.indexOf(x) + 1) + ')';
        parts.unshift(s);
        if (parts.length >= 5) break;
      }
      return parts.join(' > ');
    };
    // the box that clips e's own content: every overflow-clipping ancestor (e included), stopping at a fixed one; cut() also keeps
    // to the viewport, clipped() does not (so text scrolled away still counts as text, and screen-reader-only text does not)
    const NONE = { l: -1e9, t: -1e9, r: 1e9, b: 1e9 };
    const CL = new Map(), clipOf = e => {
      if (!e || e === document.documentElement || e === document.body) return NONE;
      let v = CL.get(e); if (v) return v;
      const c = cs(e), up = c.position === 'fixed' ? NONE : clipOf(e.parentElement);
      v = up;
      if (c.overflowX !== 'visible' || c.overflowY !== 'visible' || /paint|strict|content/.test(c.contain || '')) {
        const b = e.getBoundingClientRect(), bl = parseFloat(c.borderLeftWidth) || 0, bt = parseFloat(c.borderTopWidth) || 0;
        v = { l: Math.max(up.l, b.left + bl), t: Math.max(up.t, b.top + bt), r: Math.min(up.r, b.left + bl + e.clientWidth || b.right), b: Math.min(up.b, b.top + bt + e.clientHeight || b.bottom) };
      }
      if (/^rect\(0px,? 0px,? 0px,? 0px\)$/.test(c.clip) || /^inset\(50%/.test(c.clipPath)) v = { l: 0, t: 0, r: 0, b: 0 };
      CL.set(e, v); return v;
    };
    const cut = (r, c) => { const l = Math.max(r.left, c.l, 0), t = Math.max(r.top, c.t, 0), rr = Math.min(r.right, c.r, W), b = Math.min(r.bottom, c.b, H); return rr - l >= 2 && b - t >= 2 ? { l, t, r: rr, b } : null; };
    const clipped = (r, c) => Math.min(r.right, c.r) - Math.max(r.left, c.l) < 2 || Math.min(r.bottom, c.b) - Math.max(r.top, c.t) < 2;
    // what an element paints behind whatever sits on it: a flat colour (c, a = alpha times opacity) or why it is not flat
    const LY = new Map(), layer = e => {
      let k = LY.get(e); if (k) return k;
      const c = cs(e), bg = parse(c.backgroundColor) || [0, 0, 0, 0];
      k = { c: bg, a: bg[3] * eo(e), complex: '' };
      if (c.backgroundImage && c.backgroundImage !== 'none') k.complex = 'background-image';
      else if (REPLACED.test(e.localName)) k.complex = e.localName;
      else if (e instanceof SVGElement && !(e instanceof SVGSVGElement)) k.complex = 'svg ' + e.localName;
      else if (c.filter !== 'none' || (c.backdropFilter && c.backdropFilter !== 'none') || c.mixBlendMode !== 'normal') k.complex = 'filter/blend';
      else if (/inset/.test(c.boxShadow)) k.complex = 'inset shadow';
      else if ((c.maskImage && c.maskImage !== 'none') || (c.webkitMaskImage && c.webkitMaskImage !== 'none')) k.complex = 'mask';
      else for (const ps of ['::before', '::after']) {
        const p = getComputedStyle(e, ps);
        if (p.content === 'none' || p.content === 'normal' || p.display === 'none' || p.visibility !== 'visible') continue;
        const pb = parse(p.backgroundColor);
        if ((pb && pb[3] > 0.02) || (p.backgroundImage && p.backgroundImage !== 'none')) { k.complex = 'painted ' + ps; break; }
      }
      LY.set(e, k); return k;
    };
    const root = (() => {
      const h = document.documentElement, b = document.body, hl = layer(h), bl = layer(b);
      if (hl.complex === 'background-image' || bl.complex === 'background-image') return { complex: 'page background-image' };
      let c = [255, 255, 255];
      if (hl.a > 0) c = over(hl.c, hl.a, c); else if (bl.a > 0) c = over(bl.c, bl.a, c);
      return { c, bodyIsLayer: hl.a > 0 };
    })();
    // the backdrop under the top of stack s (s[0] is the element whose content sits on it; its own background counts)
    const backdrop = (s, ownBg) => {
      const L = [];
      for (let i = 0; i < s.length; i++) {
        const e = s[i];
        if (e === document.documentElement || (e === document.body && !root.bodyIsLayer)) continue;
        if (i === 0 && (!ownBg || e instanceof SVGElement)) continue;
        const k = layer(e);
        if (k.complex) return { complex: k.complex + ' on ' + sel(e) };
        if (k.a > 0.002) { L.push(k); if (k.a >= 0.999) break; }
      }
      if (root.complex && !(L.length && L[L.length - 1].a >= 0.999)) return { complex: root.complex };
      let c = L.length && L[L.length - 1].a >= 0.999 ? L.pop().c.slice(0, 3) : root.c;
      for (let i = L.length - 1; i >= 0; i--) c = over(L[i].c, L[i].a, c);
      return { c };
    };
    // how much an element above something hides it: 2 covers it (an image, a shape, a gradient, a background of 30 % or more: a
    // sheet scrim, the sticky header), 1 is a faint overlay it shows through (then measured on the screenshot), 0 nothing
    const paints = e => {
      if (eo(e) < 0.02) return 0;
      const c = cs(e); if (c.visibility !== 'visible') return 0;
      if ((c.backgroundImage && c.backgroundImage !== 'none') || REPLACED.test(e.localName) || (e instanceof SVGGraphicsElement && !(e instanceof SVGSVGElement) && !(e instanceof SVGGElement))) return 2;
      const bg = parse(c.backgroundColor), a = bg ? bg[3] * eo(e) : 0;
      return a >= 0.3 ? 2 : a > 0.02 ? 1 : 0;
    };
    // hit-test point (x, y) for host: null when host is not there, 'covered' when something painted covers it, else the stack from
    // host down (with .overlay: a faint overlay above it)
    const at = (host, x, y) => {
      const s = document.elementsFromPoint(x, y), i = s.indexOf(host);
      if (i < 0) return null;
      let faint = '';
      for (let j = 0; j < i; j++) if (!host.contains(s[j])) { const k = paints(s[j]); if (k === 2) return 'covered'; if (k === 1) faint = faint || sel(s[j]); }
      const r = s.slice(i); r.overlay = faint; return r;
    };
    const pointsIn = (rs, n) => {
      const P = [];
      for (const r of rs.slice(0, 8)) {
        const w = r.r - r.l, y = (r.t + r.b) / 2, fr = w > 14 && n > 1 ? [0.15, 0.5, 0.85] : [0.5];
        for (const f of fr) P.push([r.l + w * f, y]);
      }
      return P;
    };
    const hostOf = e => { let h = e; while (h && h.nodeType === 1 && cs(h).display === 'contents') h = h.parentElement; return h; };
    let nid = 0; const idOf = e => { if (!e.hasAttribute('data-kc')) e.setAttribute('data-kc', String(++nid)); return e.getAttribute('data-kc'); };
    const paintsOwn = e => { const k = layer(e); return k.a > 0.002 || (k.complex && k.complex !== 'svg ' + e.localName); };
    const fontOf = c => { const fs = parseFloat(c.fontSize) || 0, fw = parseInt(c.fontWeight, 10) || 400; return { fs, fw, large: fs >= 24 || (fs >= 18.66 && fw >= 700) }; };
    // measure one thing drawn in colour fg (opacity a) over the content of host, inside rects rs
    const measure = (o, host, rs, ownBg, force) => {
      const pts = [], P = pointsIn(rs, 3); let cov = 0, complex = force || '';
      for (const [x, y] of P) {
        const s = at(host, x, y);
        if (!s) continue;
        if (s === 'covered') { cov++; continue; }
        const b = s.overlay ? { complex: 'faint overlay above: ' + s.overlay } : backdrop(s, ownBg);
        if (b.complex) { complex = complex || b.complex; pts.push({ x, y }); } else pts.push({ x, y, bd: b.c });
      }
      if (!pts.length) { if (cov) out.stats.covered++; else out.stats.offscreen++; return false; }
      o.pts = pts.length;
      if (complex) { o.shot = complex; o.id = idOf(host); o.mode = force ? 'h' : paintsOwn(host) ? 'c' : 'v'; o.rects = rs; o.hide = (() => { const b = host.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; })(); }
      else { let worst = null; for (const p of pts) { const f = over(o.fg, o.fg[3], p.bd); const r = ratioIn(f, p.bd); if (!worst || r < worst.r) worst = { r, bd: p.bd }; } o.ratio = worst.r; o.bd = worst.bd; }
      out.items.push(o); return true;
    };
    const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const lum = c => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const ratioIn = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

    /* ---- pass 1: the text nodes (and which elements hold visible text) */
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), rg = document.createRange(), T = [];
    const marked = new Set(), real = new Set();
    for (let t; (t = tw.nextNode());) {
      if (!/\S/.test(t.nodeValue)) continue;
      const el = t.parentElement;
      if (!el || /^(script|style|noscript|template|textarea|option|optgroup|title)$/.test(el.localName)) continue;
      rg.selectNodeContents(t);
      const rs = [...rg.getClientRects()].filter(r => r.width >= 1 && r.height >= 1);
      if (!rs.length) continue;
      const c = cs(el);
      if (c.visibility !== 'visible' || eo(el) < 0.02) continue;
      const cl = clipOf(el);
      if (rs.every(r => clipped(r, cl))) continue; /* screen-reader-only text: never seen */
      for (let x = el; x && !marked.has(x); x = x.parentElement) marked.add(x);
      const hid = !!el.closest('[aria-hidden="true"]');
      if (!hid) for (let x = el; x && !real.has(x); x = x.parentElement) real.add(x);
      T.push({ t, el, rs, hid });
    }
    /* ---- pass 2: measure the visible ones */
    for (const { t, el, rs, hid } of T) {
      const host = hostOf(el), cl = clipOf(el), vr = rs.map(r => cut(r, cl)).filter(Boolean);
      if (!vr.length || !host) { out.stats.offscreen++; continue; }
      let kind = 'text', w = why(el);
      if (w === 'aria-hidden') {
        const ctl = el.closest(INTERACTIVE);
        if (ctl && !why(ctl) && !real.has(ctl) && !ctl.closest('[aria-hidden="true"]')) { kind = 'icon'; w = ''; }
      }
      if (w === 'aria-hidden' && hidden) kind = 'aria-hidden'; /* KC_HIDDEN=1: measure them too, as notes */
      else if (w) { skip(w); continue; }
      const c = cs(el), svg = el instanceof SVGElement;
      let fg = svg ? parse(c.fill) : parse(c.webkitTextFillColor || c.color);
      if (svg && fg) fg = [fg[0], fg[1], fg[2], fg[3] * (+c.fillOpacity || 0)];
      if (!fg) { skip('text colour not a colour (' + (svg ? c.fill : c.color) + ')'); continue; }
      fg = [fg[0], fg[1], fg[2], fg[3] * eo(el)];
      if (fg[3] < 0.02) { skip('transparent text'); continue; }
      const f = fontOf(c), halo = c.textShadow && c.textShadow !== 'none' ? 'text-shadow halo' : '';
      measure({ k: kind, sel: sel(el), text: t.nodeValue.replace(/\s+/g, ' ').trim().slice(0, 60), fg, ...f, need: f.large ? 3 : 4.5 }, host, vr, true, halo);
    }
    /* ---- form controls: value, selected option or placeholder */
    for (const e of document.querySelectorAll('input, select, textarea')) {
      const ty = (e.getAttribute('type') || '').toLowerCase();
      if (e.localName === 'input' && /^(hidden|checkbox|radio|range|color|file|image)$/.test(ty)) continue;
      const b = e.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) continue;
      const c = cs(e);
      if (c.visibility !== 'visible' || eo(e) < 0.02) continue;
      const w = why(e); if (w) { skip(w); continue; }
      let text = '', col = c.webkitTextFillColor || c.color, ph = false;
      if (e.localName === 'select') text = e.selectedOptions && e.selectedOptions[0] ? e.selectedOptions[0].textContent : '';
      else if (/^(button|submit|reset)$/.test(ty)) text = e.value;
      else if (e.value) text = /^(password)$/.test(ty) ? '****' : e.value;
      else if (/^(date|time|datetime-local|month|week)$/.test(ty)) text = '(empty ' + ty + ' field)';
      else if (e.placeholder) { text = e.placeholder; ph = true; const p = getComputedStyle(e, '::placeholder'); col = p.webkitTextFillColor || p.color; }
      if (!/\S/.test(text)) continue;
      let fg = parse(col); if (!fg) { skip('control colour'); continue; }
      fg = [fg[0], fg[1], fg[2], fg[3] * eo(e)];
      const pl = parseFloat(c.paddingLeft) + parseFloat(c.borderLeftWidth), pr = parseFloat(c.paddingRight) + parseFloat(c.borderRightWidth);
      const pt = parseFloat(c.paddingTop) + parseFloat(c.borderTopWidth), pb = parseFloat(c.paddingBottom) + parseFloat(c.borderBottomWidth);
      const box = { left: b.left + pl, right: b.right - pr, top: b.top + pt, bottom: b.bottom - pb };
      if (box.bottom - box.top < 4) { box.top = b.top + b.height * 0.25; box.bottom = b.bottom - b.height * 0.25; }
      const r = cut(box, clipOf(e.parentElement)); if (!r) { out.stats.offscreen++; continue; }
      const f = fontOf(c);
      measure({ k: ph ? 'placeholder' : 'control', sel: sel(e), text: text.replace(/\s+/g, ' ').trim().slice(0, 60), fg, ...f, need: f.large ? 3 : 4.5 }, e, [r], true);
    }
    /* ---- every element: CSS generated text, icon-only buttons (SVG / mask glyphs), solid colour blocks */
    const ICON_GLYPH = /^[\u2039\u203A\u00AB\u00BB\u2190-\u21FF\u2303\u2304\u25B2-\u25C5\u2713-\u2717\u00D7+\u2212\u2013-]+$/; /* a chevron, arrow, triangle, tick, cross, plus or minus drawn as generated content: an icon (3:1) */
    const ctext = (e, s) => {
      if (!s || s === 'none' || s === 'normal') return '';
      let o = ''; const re = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|attr\(([\w-]+)\)|counters?\([^)]*\)/g;
      for (let m; (m = re.exec(s));) o += m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3] ? (e.getAttribute(m[3]) || '') : '1';
      return o.replace(/\\([0-9a-f]{1,6})\s?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\(.)/g, '$1');
    };
    const chroma = c => (Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2])) / 255;
    const stops = s => (s.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}\b/gi) || []).map(parse).filter(Boolean);
    const isRound = (e, w, h) => {
      const c = cs(e), m = Math.min(w, h) / 2 - 1;
      return ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].every(k => {
        const v = String(c[k]).split(' ').map(x => /%$/.test(x) ? parseFloat(x) / 100 * Math.min(w, h) : parseFloat(x) || 0);
        return Math.min(...v) >= m;
      });
    };
    for (const e of document.body.querySelectorAll('*')) {
      if (e.closest('svg') && !(e instanceof SVGSVGElement)) continue;
      if (/^(script|style|noscript|template|option|optgroup)$/.test(e.localName)) continue;
      const b = e.getBoundingClientRect();
      if (b.right <= 0 || b.bottom <= 0 || b.left >= W || b.top >= H || (b.width < 1 && b.height < 1)) continue;
      const c = cs(e);
      if (c.display === 'contents' || c.visibility !== 'visible' || eo(e) < 0.02) continue;
      // CSS generated text
      for (const ps of ['::before', '::after']) {
        const p = getComputedStyle(e, ps), tx = ctext(e, p.content);
        if (!/\S/.test(tx) || p.display === 'none' || p.visibility !== 'visible') continue;
        const w = why(e); if (w) { skip(w); continue; }
        let fg = parse(p.webkitTextFillColor || p.color); if (!fg) continue;
        fg = [fg[0], fg[1], fg[2], fg[3] * eo(e) * (+p.opacity)];
        if (fg[3] < 0.02 || !(parseFloat(p.fontSize) > 0)) continue;
        const r = cut(b, clipOf(e)); if (!r) continue;
        const f = fontOf(p), pb = parse(p.backgroundColor), ico = ICON_GLYPH.test(tx.trim());
        const o = { k: ico ? 'pseudo-icon' : 'pseudo', sel: sel(e) + ps, text: tx.trim().slice(0, 60), fg, ...f, need: ico || f.large ? 3 : 4.5 };
        if (pb && pb[3] > 0.02) {
          /* the generated box paints its own background: the text sits on that, over what is under the element */
          const P = pointsIn([r], 1)[0], s = at(e, P[0], P[1]);
          if (!s || s === 'covered') continue;
          const bd = backdrop(s, true);
          if (bd.complex) { skip('pseudo on complex backdrop'); continue; }
          const base = over(pb, pb[3] * eo(e) * (+p.opacity), bd.c), seen = over(fg, fg[3], base);
          o.ratio = ratioIn(seen, base); o.bd = base; o.pts = 1; out.items.push(o);
        } else measure(o, e, [r], true);
      }
      const isCtl = e.matches(INTERACTIVE);
      // icon-only buttons: no visible text of their own; their SVG shapes or masked glyphs
      if (isCtl && !real.has(e) && !why(e)) {
        const glyphs = [...e.querySelectorAll('svg')].filter(g => { const gb = g.getBoundingClientRect(); return gb.width >= 4 && gb.height >= 4 && cs(g).visibility === 'visible' && eo(g) > 0.02; });
        const masks = [...e.querySelectorAll('*')].filter(m => { const mc = cs(m); return ((mc.maskImage && mc.maskImage !== 'none') || (mc.webkitMaskImage && mc.webkitMaskImage !== 'none')) && m.getBoundingClientRect().width >= 4; });
        for (const g of glyphs.concat(masks)) {
          const gb = g.getBoundingClientRect(), r = cut(gb, clipOf(g.parentElement)); if (!r) continue;
          const cols = [];
          if (g instanceof SVGSVGElement) {
            for (const sh of g.querySelectorAll('path, line, circle, rect, polyline, polygon, ellipse, text, use')) {
              const sc = cs(sh); if (sc.visibility !== 'visible' || sc.display === 'none') continue;
              const fo = eo(sh), fl = parse(sc.fill), st = parse(sc.stroke), sw = parseFloat(sc.strokeWidth) || 0;
              if (fl && fl[3] > 0) cols.push([fl[0], fl[1], fl[2], fl[3] * (+sc.fillOpacity) * fo]);
              if (st && st[3] > 0 && sw > 0) cols.push([st[0], st[1], st[2], st[3] * (+sc.strokeOpacity) * fo]);
            }
          } else { const mb = parse(cs(g).backgroundColor); if (mb && mb[3] > 0) cols.push([mb[0], mb[1], mb[2], mb[3] * eo(g)]); }
          if (!cols.length) continue;
          const P = pointsIn([r], 1)[0], s0 = document.elementsFromPoint(P[0], P[1]);
          let i = s0.indexOf(g); if (i < 0) i = s0.indexOf(e); if (i < 0) continue;
          let covered = false; for (let j = 0; j < i; j++) if (!e.contains(s0[j]) && paints(s0[j]) === 2) covered = true;
          if (covered) { out.stats.covered++; continue; }
          const bd = backdrop(s0.slice(i + (s0[i] === g && g instanceof SVGSVGElement ? 1 : 0)), s0[i] !== g || g instanceof SVGSVGElement);
          const o = { k: 'svg-icon', sel: sel(g), text: '(icon in ' + (e.getAttribute('aria-label') || e.getAttribute('title') || sel(e)) + ')', fg: cols[0], fs: 0, fw: 0, large: false, need: 3, pts: 1 };
          if (bd.complex) { const hb = g.getBoundingClientRect(); Object.assign(o, { fgs: cols, shot: bd.complex, id: idOf(g), mode: 'v', rects: [r], hide: { l: hb.left, t: hb.top, r: hb.right, b: hb.bottom } }); out.items.push(o); continue; }
          let best = null; for (const col of cols) { const seen = over(col, col[3], bd.c), rr = ratioIn(seen, bd.c); if (!best || rr > best.r) best = { r: rr, col }; }
          Object.assign(o, { fg: best.col, ratio: best.r, bd: bd.c }); out.items.push(o);
        }
      }
      // solid colour blocks: text-free boxes over 40 x 40 that stand out in colour
      if (b.width > 40 && b.height > 40 && !marked.has(e) && !(e instanceof SVGElement) && !REPLACED.test(e.localName)) {
        const k = layer(e), bi = c.backgroundImage;
        if (k.a <= 0.002 && (!bi || bi === 'none' || /^url\(/.test(bi))) continue;
        if (/^url\(/.test(bi || '')) continue;
        if (e.querySelector('input, select, textarea')) continue;
        const r = cut(b, clipOf(e.parentElement)); if (!r) continue;
        const P = [(r.l + r.r) / 2, (r.t + r.b) / 2], s = at(e, P[0], P[1]);
        if (!s || s === 'covered') continue;
        const under = backdrop(s.slice(1), true);
        const allowed = () => {
          if (e.closest(INTERACTIVE + ', input, select, textarea, label, [role=checkbox], [role=radio], [role=slider]')) return 'button/control';
          if (isRound(e, b.width, b.height)) return 'dot/pill';
          if (e.closest('td, th, [role=cell], [role=gridcell], [role=columnheader], [role=rowheader]')) return 'table cell';
          for (const x of solidAllow) if (e.closest(x.sel)) return 'SOLID_ALLOW ' + x.sel;
          return '';
        };
        if (under.complex) { /* judged in node on the screenshot: the block's own pixels against a ring just outside it */
          const a = allowed(); if (a) { skip('solid ok: ' + a); continue; }
          out.blocks.push({ k: 'solid', sel: sel(e), text: Math.round(b.width) + 'x' + Math.round(b.height), shot: under.complex, box: r, ring: { l: b.left - 4, t: b.top - 4, r: b.right + 4, b: b.bottom + 4 } });
          continue;
        }
        const fills = [];
        if (k.a > 0.002) fills.push(over(k.c, k.a, under.c));
        if (bi && bi !== 'none') for (const st of stops(bi)) fills.push(over(st, st[3] * eo(e), under.c));
        const hit = fills.find(f => ratioIn(f, under.c) >= 1.4 || Math.abs(chroma(f) - chroma(under.c)) >= 0.2);
        if (!hit) continue;
        const allow = allowed();
        if (allow) { skip('solid ok: ' + allow); continue; }
        out.blocks.push({ k: 'solid', sel: sel(e), text: Math.round(b.width) + 'x' + Math.round(b.height) + (bi && bi !== 'none' ? ' gradient' : ''), fill: hit, under: under.c, ratio: ratioIn(hit, under.c) });
      }
    }
  } finally { force.remove(); }
  return out;
}

/* ---------------------------------------------------------------- screenshots for the backdrops that are not flat colours */
const HIDE_CSS = '[data-kc-h=v]{visibility:hidden!important}' +
  '[data-kc-h=c],[data-kc-h=c] *,[data-kc-h=c]::before,[data-kc-h=c]::after,[data-kc-h=c] *::before,[data-kc-h=c] *::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important;caret-color:transparent!important}' +
  '[data-kc-h=c]::placeholder,[data-kc-h=c] *::placeholder{color:transparent!important;-webkit-text-fill-color:transparent!important}' +
  '[data-kc-h=h],[data-kc-h=h] *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-decoration-color:transparent!important}'; /* h: the glyphs go, their text-shadow halo stays (a halo is background, WCAG Understanding 1.4.3) */
const meet = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
const chroma = c => (Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2])) / 255;
const median = L => [0, 1, 2].map(i => L.map(c => c[i]).sort((a, b) => a - b)[L.length >> 1]);
const standsOut = (f, u) => ratio(f, u) >= 1.4 || Math.abs(chroma(f) - chroma(u)) >= 0.2; /* the same test as in the page */
async function sampleShots(p, items, blocks = []) {
  const groups = new Map();
  for (const it of items) { if (!groups.has(it.id)) groups.set(it.id, { id: it.id, mode: it.mode, hide: it.hide, rects: [], items: [] }); const g = groups.get(it.id); g.rects.push(...it.rects); g.items.push(it); }
  const left = [...groups.values()], batches = [];
  while (left.length) {
    const B = [];
    for (let i = 0; i < left.length;) {
      const g = left[i], clash = B.some(h => g.rects.some(r => meet(h.hide, r)) || h.rects.some(r => meet(g.hide, r)));
      if (clash) i++; else { B.push(g); left.splice(i, 1); }
    }
    batches.push(B);
  }
  await p.evaluate(css => { const s = document.createElement('style'); s.id = 'kc-hide'; s.textContent = css; document.head.appendChild(s); }, HIDE_CSS);
  const shot = async () => decodePNG(await p.screenshot({ type: 'png', caret: 'hide', scale: 'css' }));
  const A = await shot(); /* as shown: where it differs from a hidden-text shot is where the glyphs are */
  for (const bk of blocks) { /* a block over a backdrop that is not flat: its own pixels against the 4 px ring around it */
    const inside = [], ring = [], R = bk.ring, I = { l: R.l + 4, t: R.t + 4, r: R.r - 4, b: R.b - 4 };
    for (let y = Math.max(0, Math.floor(R.t)); y < Math.min(A.h, Math.ceil(R.b)); y++) for (let x = Math.max(0, Math.floor(R.l)); x < Math.min(A.w, Math.ceil(R.r)); x++) {
      if (x >= bk.box.l && x < bk.box.r && y >= bk.box.t && y < bk.box.b) inside.push(A.at(x, y));
      else if (x < I.l || x >= I.r || y < I.t || y >= I.b) ring.push(A.at(x, y));
    }
    if (!inside.length || !ring.length) continue;
    bk.fill = median(inside); bk.under = median(ring); bk.ratio = ratio(bk.fill, bk.under); bk.flag = standsOut(bk.fill, bk.under);
  }
  for (const B of batches) {
    await p.evaluate(B => { for (const g of B) { const e = document.querySelector('[data-kc="' + g.id + '"]'); if (e) e.setAttribute('data-kc-h', g.mode); } }, B.map(g => ({ id: g.id, mode: g.mode })));
    await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const img = await shot();
    await p.evaluate(() => { for (const e of document.querySelectorAll('[data-kc-h]')) e.removeAttribute('data-kc-h'); });
    for (const g of B) for (const it of g.items) {
      /* the pixels behind the text: where the glyphs are (the shown and hidden shots differ there); no glyph found (text the colour of
         its backdrop): every pixel of its line boxes */
      const box = [], glyph = new Set();
      for (const r of it.rects) for (let y = Math.max(0, Math.floor(r.t)); y < Math.min(img.h, Math.ceil(r.b)); y++) for (let x = Math.max(0, Math.floor(r.l)); x < Math.min(img.w, Math.ceil(r.r)); x++) {
        const a = A.at(x, y), b = img.at(x, y), q = y * img.w + x; box.push(q);
        if (Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2])) >= 16) glyph.add(q);
      }
      const px = (glyph.size ? [...glyph] : box).map(q => img.at(q % img.w, Math.floor(q / img.w)));
      if (!px.length) { it.ratio = Infinity; continue; }
      for (const fg of it.fgs || [it.fg]) { /* an icon of several colours: its most visible colour */
        const R = px.map(bd => ({ r: ratio(over(fg, fg[3], bd), bd), bd })).sort((a, b) => a.r - b.r), w = R[Math.floor(R.length * 0.05)];
        if (it.ratio === undefined || w.r > it.ratio) { it.ratio = w.r; it.bd = w.bd; it.fg = fg; }
      }
      it.px = px.length;
    }
  }
  await p.evaluate(() => { const s = document.getElementById('kc-hide'); if (s) s.remove(); });
  return batches.length;
}

/* ---------------------------------------------------------------- self-test: the audit must catch what it claims to (run once) */
const HALO = [1, -1].flatMap(a => [[a, 0], [0, a], [a, a], [a, -a], [2 * a, 0], [0, 2 * a]]).map(([x, y]) => x + 'px ' + y + 'px 0 #fff').join(',') + ',0 0 4px #fff';
const PROBE_HTML = `<style>#kcp{position:fixed;left:0;top:0;right:0;z-index:2147483600;background:#fff;padding:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;font:14px/1.3 Arial,sans-serif;color:#111;text-align:left}
#kcp p{margin:0} #kcp button{font:14px/1.2 Arial,sans-serif} #kcp-ph::placeholder{color:#bbb} #kcp-pseudo::after{content:"Probe pseudo";color:#bbb} #kcp-chev::after{content:"\\203A";color:#999;font-size:16px;margin-left:4px}</style>
<p id="kcp-grey" style="color:#999">Probe grey</p><p id="kcp-ok">Probe ok</p><p id="kcp-large" style="color:#888;font-size:24px">Large</p>
<p id="kcp-lbold" style="color:#888;font-size:19px;font-weight:700">Bold 19</p><p id="kcp-sbold" style="color:#888;font-size:18px;font-weight:700">Bold 18</p>
<div style="background:linear-gradient(90deg,#fff,#000);padding:4px 8px"><span id="kcp-grad" style="color:#777">Probe gradient text</span></div>
<p id="kcp-alpha" style="color:rgba(0,0,0,.35)">Alpha</p><p id="kcp-opac" style="opacity:.4">Opacity</p>
<p id="kcp-hid" aria-hidden="true" style="color:#ddd">Hidden</p><p id="kcp-ex" data-contrast-exempt style="color:#ddd">Exempt</p>
<button id="kcp-dis" disabled style="color:#ddd;background:#fff;border:1px solid #000">Disabled</button>
<input id="kcp-ph" placeholder="Probe placeholder" style="width:150px;color:#000;background:#fff;border:1px solid #000;font-size:14px">
<input id="kcp-val" value="Probe value" style="width:110px;color:#aaa;background:#fff;border:1px solid #000;font-size:14px">
<button id="kcp-ico" aria-label="Probe icon" style="width:44px;height:44px;background:#fff;border:0"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M12 4v16" stroke="#ccc" stroke-width="2" fill="none"/></svg></button>
<button id="kcp-ico2" aria-label="Probe icon ok" style="width:44px;height:44px;background:#fff;border:0"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M12 4v16" stroke="#111" stroke-width="2" fill="none"/></svg></button>
<button id="kcp-glyph" aria-label="Close" style="width:44px;height:44px;background:#fff;border:0;font-size:20px"><span aria-hidden="true" style="color:#bbb">\u00D7</span></button>
<button id="kcp-sr" style="width:44px;height:44px;background:#fff;border:0;font-size:20px"><span aria-hidden="true" style="color:#bbb">+</span><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">Add a probe</span></button>
<span id="kcp-pseudo"></span><button id="kcp-chev" style="background:#fff;border:0;color:#111">Row</button>
<div id="kcp-block" style="width:60px;height:60px;background:#179BCC"></div><div id="kcp-dot" style="width:60px;height:60px;background:#179BCC;border-radius:50%"></div>
<div id="kcp-tint" style="width:60px;height:60px;background:rgba(23,155,204,.09)"></div><div id="kcp-gblock" style="width:60px;height:60px;background:linear-gradient(90deg,#179BCC,#0B7399)"></div>
<div style="position:relative;padding:2px"><p id="kcp-under" style="color:#ccc">Under a scrim</p><div style="position:absolute;inset:0;background:rgba(0,0,0,.5)"></div></div>
<div style="background:linear-gradient(#000,#222);padding:6px"><span id="kcp-halo" style="color:#555;text-shadow:${HALO}">Halo text</span></div>
<div style="background:linear-gradient(#000,#222);padding:6px"><span id="kcp-nohalo" style="color:#555">No halo</span></div>`;
// probe id: [kind, passes] (null: must not be measured at all)
const PROBES = { 'kcp-grey': ['text', false], 'kcp-ok': ['text', true], 'kcp-large': ['text', true], 'kcp-lbold': ['text', true], 'kcp-sbold': ['text', false],
  'kcp-grad': ['text', false], 'kcp-alpha': ['text', false], 'kcp-opac': ['text', false], 'kcp-hid': null, 'kcp-ex': null, 'kcp-dis': null,
  'kcp-ph': ['placeholder', false], 'kcp-val': ['control', false], 'kcp-ico': ['svg-icon', false], 'kcp-ico2': ['svg-icon', true], 'kcp-glyph': ['icon', false], 'kcp-sr': ['icon', false],
  'kcp-pseudo': ['pseudo', false], 'kcp-chev': ['pseudo-icon', false], 'kcp-block': ['solid', false], 'kcp-dot': null, 'kcp-tint': null, 'kcp-gblock': ['solid', false],
  'kcp-under': null, 'kcp-halo': ['text', true], 'kcp-nohalo': ['text', false] };
async function selfTest(p, C) {
  await p.evaluate(h => { const d = document.createElement('div'); d.id = 'kcp'; d.innerHTML = h; document.body.appendChild(d); }, PROBE_HTML);
  await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const d = await p.evaluate(COLLECT, { exempt: EXEMPT, solidAllow: SOLID_ALLOW, hidden: false });
  const mine = x => /^#kcp-/.test(x.sel), items = d.items.filter(mine), blocks = d.blocks.filter(mine);
  await sampleShots(p, items.filter(i => i.shot), blocks.filter(b => b.shot));
  const all = items.concat(blocks.filter(b => !b.shot || b.flag));
  for (const [id, want] of Object.entries(PROBES)) {
    const got = all.filter(x => x.sel === '#' + id || x.sel.startsWith('#' + id + ' ') || x.sel.startsWith('#' + id + '::'));
    if (!want) { C.ok(!got.length, 'self-test: ' + id + ' is not measured', got.map(g => g.k + ' ' + g.sel)); continue; }
    const g = got.find(x => x.k === want[0]), pass = g && (g.k === 'solid' ? false : g.ratio >= g.need);
    C.ok(!!g && pass === want[1], 'self-test: ' + id + ' ' + want[0] + (want[1] ? ' passes' : ' fails') + (g ? ' (' + (g.ratio || 0).toFixed(2) + ':1' + (g.shot ? ', sampled' : '') + ')' : ''), got.map(x => [x.k, x.sel, x.ratio && +x.ratio.toFixed(2)]));
  }
  await p.evaluate(() => { const d = document.getElementById('kcp'); if (d) d.remove(); });
}

/* ---------------------------------------------------------------- the walk */
let tested = false;
const C = checker(), T0 = Date.now(), known = new Set(), tot = { text: 0, control: 0, placeholder: 0, pseudo: 0, 'pseudo-icon': 0, icon: 0, 'svg-icon': 0, shot: 0, screens: 0, knownHits: 0 };
const isKnown = (screen, f) => KNOWN_ON_MAIN.findIndex(k => k.screen.test(screen) && (!k.kind || k.kind === f.k) && (!k.sel || k.sel.test(f.sel)) && (!k.text || k.text.test(f.text || '')));
const line = (s, f) => f.k === 'solid'
  ? s + ': solid colour block ' + f.sel + ' (' + f.text + ') ' + rgb(f.fill) + ' on ' + rgb(f.under) + ' (' + f.ratio.toFixed(2) + ':1)'
  : s + ': ' + f.k + ' "' + f.text + '" at ' + f.sel + ' ' + fgs(f.fg) + ' on ' + rgb(f.bd) + ' = ' + f.ratio.toFixed(2) + ':1 < ' + f.need + (f.fs ? ' (' + Math.round(f.fs * 10) / 10 + 'px/' + f.fw + ')' : '') + (f.shot ? ' [sampled: ' + f.shot + ', ' + f.px + ' px]' : '');
await run(async (s, o) => {
  if (o.fail) { C.ok(false, s.name + ': screen reached', o.fail); return; }
  tot.screens++;
  const p = o.p;
  await p.mouse.move(-10, -10).catch(() => {});
  await p.evaluate(async () => { /* finite animations and transitions done (a fading toast is not measured mid-fade) */
    const t0 = performance.now();
    while (performance.now() - t0 < 4000) {
      const run = document.getAnimations().filter(a => a.playState === 'running' && a.effect && isFinite(a.effect.getComputedTiming().endTime));
      if (!run.length) return; await new Promise(r => setTimeout(r, 100));
    }
  });
  const d = await p.evaluate(COLLECT, { exempt: EXEMPT, solidAllow: SOLID_ALLOW, hidden: HIDDEN });
  const shots = d.items.filter(i => i.shot), cb = d.blocks.filter(b => b.shot), nb = shots.length || cb.length ? await sampleShots(p, shots, cb) : 0;
  d.blocks = d.blocks.filter(b => !b.shot || b.flag);
  const bad = [];
  for (const it of d.items) {
    if (it.k === 'aria-hidden') { if (!(it.ratio >= it.need)) console.log('  note (aria-hidden, not judged) ' + line(s.name, it)); continue; }
    tot[it.k] = (tot[it.k] || 0) + 1; if (it.shot) tot.shot++; if (!(it.ratio >= it.need)) bad.push(it);
  }
  for (const b of d.blocks) bad.push(b);
  let fresh = 0; const kn = new Map();
  for (const f of bad) {
    const k = isKnown(s.name, f);
    if (k >= 0) { known.add(k); tot.knownHits++; if (!kn.has(k)) kn.set(k, []); kn.get(k).push(f); }
    else { fresh++; C.ok(false, line(s.name, f)); }
  }
  for (const [k, L] of kn) console.log('  known ' + line(s.name, L[0]) + (L.length > 1 ? ' (and ' + (L.length - 1) + ' more like it)' : '') + ' -- KNOWN_ON_MAIN: ' + KNOWN_ON_MAIN[k].reason);
  const nt = d.items.length, nk = bad.length - fresh;
  if (!fresh) C.ok(true, s.name + ': ' + nt + ' texts, controls and icons' + (shots.length ? ' (' + shots.length + ' on sampled backdrops)' : '') + ' and its text-free boxes: no new failures' + (nk ? ' (' + nk + ' known on main)' : ''));
  C.ok(o.errors.length === 0, s.name + ': no page or console errors', o.errors.slice(0, 3));
  if (!tested) { tested = true; await selfTest(p, C); }
  if (DEBUG) console.log('    [' + s.name + '] items ' + nt + ', shots ' + shots.length + ' in ' + nb + ' batches, blocks ' + d.blocks.length + ', ' + JSON.stringify(d.stats));
}, { page: PAGE, only: ONLY || undefined, log: DEBUG });
KNOWN_ON_MAIN.forEach((k, i) => { if (!known.has(i) && !ONLY) console.log('  note: KNOWN_ON_MAIN entry not seen any more (remove it): ' + k.screen + ' ' + (k.sel || '') + ' ' + (k.text || '') + ' -- ' + k.reason); });
console.log('  ' + tot.screens + ' screens in ' + Math.round((Date.now() - T0) / 1000) + ' s: ' + tot.text + ' texts, ' + (tot.control + tot.placeholder) + ' control texts, ' + (tot.pseudo + tot['pseudo-icon']) + ' generated texts, ' + (tot.icon + tot['svg-icon']) + ' icons (' + tot.shot + ' on sampled backdrops), ' + tot.knownHits + ' known on main');
C.done('contrast AA on ' + tot.screens + ' screens, no new solid colour blocks' + (KNOWN_ON_MAIN.length ? ' (' + known.size + ' known on main)' : ''));
