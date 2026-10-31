// node layout.test.mjs <null.html> [width[,width...]]
//
// LAYOUT AUDIT. Every screen in lib/screens.mjs, at 320, 375, 390 and 430 px wide (or the widths given), each with root text at 100%,
// 150% and 200% (open({scale})). On what the screen shows (the viewport, as the screen left it), it checks:
//   hscroll  no sideways page scroll: documentElement.scrollWidth <= clientWidth + 1 (the elements that stick out are named); and no
//            scroller on show (a sheet, a modal page, a panel) that scrolls sideways, other than the known sideways scrollers in
//            SIDEWAYS_OK (wide tables, charts, chip rows): a full-screen sheet that scrolls sideways is the page scrolling sideways;
//   clip     no text cut: a line of text that passes the edge of an overflow:hidden/clip (or contain:paint) box it sits in, by more than
//            1 px sideways or a quarter of its font size up or down (its scrollWidth > clientWidth + 1 is the sideways case), some lines
//            of a block shown and others hidden by such a box, text cut by the side of the screen, a number or read-only input whose
//            value is wider than its box (scrollWidth > clientWidth + 1), a select or a placeholder wider than the room it has, a date or
//            time field whose ::-webkit-datetime-edit line-height (px, from the style sheets) is shorter than 1.2 x its text, and a box
//            that shows some of its text while it hides whole blocks of it past its top or bottom edge. A box that hides all of its text
//            (a closed fold) cuts nothing. Text in a scroller (overflow auto/scroll) is not cut, it can be scrolled to.
//            text-overflow:ellipsis is only allowed on the known single-line labels in ELLIPSIS_OK (names and other text a person typed
//            or picked, which can be any length); an ellipsis anywhere else is a failure;
//   overlap  no two visible tap targets overlapping (more than 1 px each way). Targets in different layers are not compared when one
//            layer floats over the other (a fixed or sticky bar over the scrolling page, a sheet over the page, a menu over its row);
//   small    every visible button, link, input, select, textarea, summary and [role=button|link|tab|switch|checkbox|radio|menuitem|
//            option] has a tap area of at least 44 x 44 CSS px: its box, or, when the box is smaller, the area where a tap reaches it
//            (hit-tested from its centre outward, so padding, a ::before/::after tap area and its label count), unless it sits inside
//            running text (an inline link or button with other text in the same line box). A hidden checkbox or radio is judged by its
//            label;
//   screen   the screen could be reached (a screen whose steps fail at some size is reported, not skipped).
// "Visible" means a hit test at the target or the text finds it (or something inside it): things under a sheet, a backdrop or a
// sticky bar are left for the screens that show them.
//
// The desktop screens (1280 x 800 whatever the width) are audited once, in the 390 pass.
// Failures on main that are real (main breaks the rule) are listed in KNOWN_ON_MAIN with the reason, so a later item is judged only on
// new failures. Each failure prints with its screen, width, text size and selector; known ones print as a count.
// One width takes about 8 minutes on main (231 screen opens, 240 in the 390 pass); the kit runs one width per process (each fits in
// timeout 1500). All four in one process take about 32 minutes, more than 1500 s.
// Options for working on the audit (environment): LAYOUT_ONLY=<regex of screen names>, LAYOUT_SCALES=1,2, LAYOUT_ALL=1 (print the known
// failures too), LAYOUT_DEBUG=1 (per screen: text lines, targets checked, covered, tap areas that could not be measured).
import { chromium } from 'playwright';
import { run, screens } from '../lib/screens.mjs';
import { checker } from '../lib/open.mjs';

const PAGE = process.argv[2];
const WIDTHS = (process.argv[3] || '320,375,390,430').split(',').map(Number);
const SCALES = (process.env.LAYOUT_SCALES || '1,1.5,2').split(',').map(Number);
const ONLY = process.env.LAYOUT_ONLY ? new RegExp(process.env.LAYOUT_ONLY) : null;
const SHOW_ALL = !!process.env.LAYOUT_ALL;
const DESK_PASS = 390;
const pct = s => Math.round(s * 100) + '%';

// Labels allowed to end in an ellipsis: single-line (white-space:nowrap) and holding text of any length that a person typed or picked.
const ELLIPSIS_OK = [
  '.htitle',                      /* the app header title: the page name, or the race or ride on show */
  '.dsum-text',                   /* a Journal fold summary line (what you wore, the weigh-in) */
  '.bike-row .bn',                /* a bike name */
  '.like-chip button', '.like-cn', /* a saved favourite (liked preset) name */
  '.jride',                       /* the ride name in a Journal row */
  '.rr-name',                     /* a race name in the races list */
  '.rf-title',                    /* the race form title (the race name) */
  '.sync-name', '.sync-mail', '#syncMail', '#accMail', /* the account name and email */
  '.wx-place',                    /* the place name of the forecast */
  '#noteEd .ne-v select',         /* the note editor pickers (a body part, a product) */
  '#view-profile .pg-s',          /* a Settings row summary: the values set in that row */
  'html.dk .sb-who b',            /* the account name in the desktop sidebar */
];

// The scrollers made to scroll sideways (wide tables, charts and chip rows). Any other scroller on show that scrolls sideways (a sheet,
// a modal page, a panel) counts as sideways page scroll.
const SIDEWAYS_OK = [
  '.tablewrap',                   /* a wide table */
  '.jwrap', '.jcmp-w',            /* the Journal table and its compare table */
  '.vol-tscroll', '.vy-scroll', '.vgr-scroll', /* Volume tables, the years chart, the season grid */
  '.rt-grid',                     /* the ride totals table on Plan (item 86: it scrolls rather than widen the page) */
  '.rt-chips', '.rt-scroll',      /* the races table: its filter chips and the table itself */
  '.cag-scroll',                  /* compare age groups */
  '.ri-twrap',                    /* the race import preview table */
];

// KNOWN_ON_MAIN: failures main really has. Found by this audit on main (items 85-90, cache v115, 2026-10-29) at all four widths and three
// text sizes, each checked on a screenshot; none of them was the audit being wrong. Each entry: rule, sel (a RegExp on the reported
// selector; for overlap "A + B"), screen (a RegExp on the screen name), optional detail (a RegExp on the detail) and at(width, scale)
// (where main has it), and why: why main breaks the rule. A later item is judged on new failures only (a known failure at a new size or
// on a new screen is new); when one is fixed, take its entry out (the run notes entries it did not see).
const KNOWN_ON_MAIN = [
  { rule: 'small', sel: /\bbutton\[data-rt-sort=[a-z]+\]$/, screen: /^races-table$/,
    why: 'Races table: the column header sort buttons (Race, AG, Temp, Dew pt, Humid, Wind) are 28 px tall (.rt .rt-h th button{min-height:28px}), at every width and text size' },
  { rule: 'small', sel: /^label\.win-tick input\[data-w-act=tick\]$/, screen: /^race-detail$/, at: (w, s) => s === 1,
    why: 'Race detail, Wins: each tick box (20 x 20) taps through its label row, which is 41 px tall at 100% text (.win-tick{min-height:40px}); larger text makes the rows taller' },
  { rule: 'small', sel: /^input#flNo-(min|max)$/, screen: /^settings-fluidlim$/,
    why: 'Settings, Fluid limits: the No limit switch (51 x 31) and its label (.fl-nl) are 32 px tall, at every width and text size' },
  { rule: 'clip', sel: /^select#pCarbType$/, screen: /^settings-product-edit$/,
    why: 'Edit product, Carb type: the option "Glucose/maltodextrin + fructose (multiple transportable)" (399 px at 100%) is wider than the select at every width, so it shows as "Glucose/malto…"' },
  { rule: 'clip', sel: /^select#bikeCages$/, screen: /^settings-bikes$/, at: (w, s) => w >= 390 && s === 1.5,
    why: 'Settings, Bikes, the new-bike row: the cages select is 70 px wide for "2 cages" (85 px) at 390 and 430 px with 150% text, so it shows "2 ca…"' },
  { rule: 'clip', sel: /^input#(rf-date|rf-startTime|pBirthday)$/, screen: /^(race-log|settings-profile)$/, detail: /::-webkit-datetime-edit/, at: (w, s) => s >= 1.5,
    why: 'Date and time fields (Log a race: Date, Start; Profile: Birthday): input[type=date|time]::-webkit-datetime-edit{line-height:21px} keeps a 21 px line for 23-32 px text, so the bottom of the text is cut ("yyyy" reads "vvvv")' },
  { rule: 'clip', sel: /^input#neTitleIn$/, screen: /^journal-injury-editor$/, detail: /^the placeholder/, at: (w, s) => w === 320 || s === 2,
    why: "Journal, new injury, What: the placeholder 'Left knee: runner’s knee' is wider than the field at 320 px (every text size) and at 200% text" },
  { rule: 'clip', sel: /^input#pRatio$/, screen: /^settings-product-edit$/, detail: /^the placeholder/, at: (w, s) => s === 2 || (w === 320 && s === 1.5),
    why: "Edit product, Glucose : fructose ratio: the placeholder 'Blank if the label doesn't say' is wider than the field at 200% text (and 150% at 320 px)" },
  { rule: 'clip', sel: /^input#setSearch$/, screen: /^settings-(top|running)$/, detail: /^the placeholder/, at: (w, s) => w === 320 && s === 2,
    why: 'Settings search: the placeholder "Search settings" is wider than the field at 320 px with 200% text' },
  { rule: 'clip', sel: /^#prowB-gels div\.plist\[data-for=gelSel\] input\.plist-q$/, screen: /^settings-gels$/, detail: /^the placeholder/, at: (w, s) => w <= 375 && s === 2,
    why: 'Settings, Gels: the search placeholder "Search gels and chews" is wider than the field at 320 and 375 px with 200% text' },
  { rule: 'clip', sel: /^input#pRaceName$/, screen: /^settings-profile$/, detail: /^the placeholder/, at: (w, s) => w <= 390 && s === 2,
    why: 'Settings, Profile, Name for race results: the placeholder "As you sign up for races" is wider than the field up to 390 px with 200% text' },
  { rule: 'clip', sel: /^input#endTime$/, screen: /^plan-where$/, detail: /^the value shown/, at: (w, s) => w === 320 && s === 2,
    why: 'Plan, Where & when, Ends: the read-only "~10:30 AM" is wider than its box at 320 px with 200% text (it reads "~10:30 AN")' },
  { rule: 'hscroll', sel: /\bdiv\.rd-shell$/, screen: /^race-detail$/, at: (w, s) => w === 320 && s === 2,
    why: 'Race detail at 320 px with 200% text: the top bar (‹ Races, Edit, Delete) is 355 px wide, so the race page scrolls sideways and Delete is half off the screen' },
];

/* ---------------------------------------------------------------- the audit, run inside the page */
function pageAudit(cfg) {
  const de = document.documentElement, body = document.body, VW = de.clientWidth, VH = window.innerHeight;
  const SC = new Map(), cs = e => { let s = SC.get(e); if (!s) SC.set(e, s = getComputedStyle(e)); return s; };
  const vis = e => !e.checkVisibility || e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  const fails = [], n = { lines: 0, targets: 0, covered: 0, unknown: 0 };
  // a short, stable selector: the nearest id above it, its parent and itself (tag, two classes, one short data attribute)
  const STATE = /^(on|off|open|opened|active|sel|selected|cur|current|shown|show|hidden|in|out|go|arm|dim|done|busy|stuck|focus|hover|is-.+|has-.+)$/;
  const part = x => {
    const t = x.tagName.toLowerCase();
    if (x.id) return t + '#' + x.id;
    let s = t; const cl = [...x.classList].filter(c => !STATE.test(c)).slice(0, 2);
    if (cl.length) s += '.' + cl.join('.');
    const da = [...x.attributes].find(a => a.name.startsWith('data-') && /^[a-z][a-z-]{0,15}$/i.test(a.value || 'x'));
    if (da) s += '[' + da.name + (da.value ? '=' + da.value : '') + ']';
    return s;
  };
  const sel = e => {
    if (e.id) return part(e);
    const P = [part(e)];
    for (let x = e.parentElement, i = 0; x && x !== body && x !== de && i < 8; x = x.parentElement, i++) {
      if (x.id) { P.unshift('#' + x.id); break; }
      if (i === 0) P.unshift(part(x));
    }
    return P.join(' ');
  };
  const txt = e => {
    const lt = e.labels && e.labels[0] ? e.labels[0].innerText || '' : '';
    let t = e.tagName === 'INPUT' ? (/^(checkbox|radio)$/.test(e.type) ? lt : (e.value || e.placeholder || lt)) : e.tagName === 'SELECT' ? (e.selectedOptions[0] ? e.selectedOptions[0].text : '') : (e.innerText || e.textContent || '');
    t = (t.trim() || e.getAttribute('aria-label') || e.getAttribute('title') || '').replace(/\s+/g, ' ');
    return t.length > 40 ? t.slice(0, 39) + '…' : t;
  };
  const fail = (rule, e, detail, e2) => fails.push({ rule, sel: e2 ? sel(e) + ' + ' + sel(e2) : sel(e), text: e2 ? txt(e) + ' + ' + txt(e2) : txt(e), detail });
  const okEllipsis = e => cfg.ellipsisOk.some(q => { try { return e.matches(q); } catch (x) { return false; } });

  // ---- hscroll: the page, and any scroller on show (a sheet, a modal page, a panel) that is not one of the known sideways scrollers
  // the outermost things inside root that stick out past [L, R] (not counting what a box between them clips or scrolls)
  const sticking = (root, L, R) => {
    const by = [];
    for (const e of root.querySelectorAll('*')) {
      const r = e.getBoundingClientRect();
      if (!r.width || (r.right <= R + 1 && r.left >= L - 1) || cs(e).position === 'fixed' || !vis(e)) continue;
      let a = e.parentElement, inside = false;
      for (; a && a !== root && a !== body; a = a.parentElement) if (cs(a).overflowX !== 'visible' || cs(a).position === 'fixed') { inside = true; break; }
      if (inside) continue;
      const pr = e.parentElement.getBoundingClientRect();
      if (e.parentElement !== root && e.parentElement !== body && (pr.right > R + 1 || pr.left < L - 1)) continue;
      by.push(e);
    }
    return by.slice(0, 4).map(e => { const r = e.getBoundingClientRect(); return sel(e) + ' (' + Math.round(r.left) + '..' + Math.round(r.right) + ')'; });
  };
  if (de.scrollWidth > de.clientWidth + 1) {
    const by = sticking(body, 0, VW);
    fails.push({ rule: 'hscroll', sel: by.length ? by[0].replace(/ \(-?\d+\.\.-?\d+\)$/, '') : 'html', text: '', detail: 'the page is ' + de.scrollWidth + ' px wide in ' + de.clientWidth + (by.length ? '; sticking out: ' + by.join(', ') : '') });
  }
  for (const e of body.querySelectorAll('*')) {
    const s = cs(e);
    if ((s.overflowX !== 'auto' && s.overflowX !== 'scroll') || e.scrollWidth <= e.clientWidth + 1 || !vis(e)) continue;
    if (cfg.sidewaysOk.some(q => e.matches(q))) continue;
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.bottom <= 0 || r.top >= VH || r.right <= 0 || r.left >= VW) continue;
    const x0 = Math.max(r.left, 0), x1 = Math.min(r.right, VW), y0 = Math.max(r.top, 0), y1 = Math.min(r.bottom, VH);
    if (![[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]].some(([a, b]) => { const h = document.elementFromPoint(x0 + (x1 - x0) * a, y0 + (y1 - y0) * b); return h && (h === e || e.contains(h)); })) continue;
    const L = r.left + (parseFloat(s.borderLeftWidth) || 0), by = sticking(e, L, L + e.clientWidth);
    fail('hscroll', e, 'it scrolls sideways: ' + e.scrollWidth + ' px of content in ' + e.clientWidth + (by.length ? '; sticking out: ' + by.join(', ') : ''));
  }

  // ---- what clips: a box's own overflow clips its content; an ancestor clips it unless it is out of flow past it
  const makesCB = s => s.transform !== 'none' || s.translate !== 'none' || s.scale !== 'none' || s.rotate !== 'none' || s.filter !== 'none' || s.perspective !== 'none'
    || /paint|layout|strict|content/.test(s.contain) || /transform|filter|perspective/.test(s.willChange) || (s.backdropFilter || 'none') !== 'none' || (s.containerType || 'normal') !== 'normal';
  // chain(el): the boxes that clip (cx, cy) or scroll (sx, sy) el's content, its own first; chain(el, true): only those around el itself
  const CH = new Map(), CU = new Map();
  const chain = (el, up) => {
    const M = up ? CU : CH;
    let L = M.get(el); if (L) return L;
    L = []; let pos = cs(el).position;
    const add = a => {
      const s = cs(a);
      if (a instanceof SVGElement && !(a instanceof SVGSVGElement)) return;
      if (!(a instanceof SVGSVGElement) && (s.display === 'inline' || s.display === 'contents')) return;
      const paint = /paint|strict|content/.test(s.contain), cx = paint || s.overflowX === 'hidden' || s.overflowX === 'clip', cy = paint || s.overflowY === 'hidden' || s.overflowY === 'clip';
      const sx = !cx && (s.overflowX === 'auto' || s.overflowX === 'scroll'), sy = !cy && (s.overflowY === 'auto' || s.overflowY === 'scroll');
      if (cx || cy || sx || sy) L.push({ a, cx, cy, sx, sy });
    };
    if (!up) add(el);
    for (let a = el.parentElement; a && a !== body && a !== de; a = a.parentElement) {
      const s = cs(a);
      if (pos === 'fixed' && !makesCB(s)) continue;
      if (pos === 'absolute' && s.position === 'static' && !makesCB(s)) continue;
      add(a); pos = s.position;
    }
    M.set(el, L); return L;
  };
  const BX = new Map();
  const box = a => {
    let b = BX.get(a); if (b) return b;
    const r = a.getBoundingClientRect(), s = cs(a);
    b = { l: r.left + (parseFloat(s.borderLeftWidth) || 0), r: r.right - (parseFloat(s.borderRightWidth) || 0), t: r.top + (parseFloat(s.borderTopWidth) || 0), b: r.bottom - (parseFloat(s.borderBottomWidth) || 0) };
    BX.set(a, b); return b;
  };
  const SR = new Map();
  const srOnly = e => {
    if (!e || e === body || e === de) return false;
    if (SR.has(e)) return SR.get(e);
    const s = cs(e);
    let v = ((s.position === 'absolute' || s.position === 'fixed') && s.clip && s.clip !== 'auto') || /inset\(50%/.test(s.clipPath || '')
      || (s.display !== 'inline' && s.overflowX !== 'visible' && e.clientWidth <= 1 && e.clientHeight <= 1);
    if (!v) v = srOnly(e.parentElement);
    SR.set(e, v); return v;
  };
  const BL = new Map();
  const blockOf = e => {
    let b = BL.get(e); if (b) return b;
    b = e; while (b.parentElement && b !== body && !(b instanceof SVGSVGElement) && /^(inline|contents)$/.test(cs(b).display)) b = b.parentElement;
    BL.set(e, b); return b;
  };
  // the hit test: does a tap at (x, y) reach e (e itself, something inside it, or a label for it)?
  const owns = (e, x, y) => {
    const h = document.elementFromPoint(x, y);
    if (!h) return null;
    if (h === e || e.contains(h)) return true;
    const L = h.closest('label');
    return !!(L && L.control === e);
  };
  // the floating layer a thing sits in: a fixed or sticky box, or a positioned menu, listbox, dialog or popover
  const FL = new Map();
  const floatOf = e => {
    if (FL.has(e)) return FL.get(e);
    let f = null;
    for (let x = e; x && x !== de; x = x.parentElement) {
      const p = cs(x).position;
      if (p === 'fixed' || p === 'sticky' || (p === 'absolute' && (/^(menu|listbox|dialog|alertdialog|tooltip)$/.test(x.getAttribute('role') || '') || x.hasAttribute('popover')))) { f = x; break; }
    }
    FL.set(e, f); return f;
  };

  // ---- clip: text lines against the boxes that clip them
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TEXTAREA', 'OPTION', 'OPTGROUP', 'TITLE', 'SELECT']);
  const blocks = new Map(), rng = document.createRange(), tw = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  for (let t; (t = tw.nextNode());) {
    if (!/\S/.test(t.data)) continue;
    const el = t.parentElement;
    if (!el || SKIP.has(el.tagName)) continue;
    rng.selectNodeContents(t);
    const rects = [...rng.getClientRects()].filter(r => r.width > 0.5 && r.height > 0.5 && r.bottom > 0 && r.top < VH);
    if (!rects.length || !vis(el) || srOnly(el)) continue;
    const L = chain(el), fs = parseFloat(cs(el).fontSize) || 16, tolX = 1, tolY = Math.max(1, fs / 4), blk = blockOf(el);
    let B = blocks.get(blk);
    if (!B) blocks.set(blk, B = { vis: 0, hidBy: new Set(), hidY: new Set(), ys: new Set(), cuts: [], pt: null, el });
    // a text-overflow:ellipsis box gives two rects for its line (the whole text, then the part shown): judge the whole text
    for (const r of rects) {
      n.lines++;
      let x0 = r.left, x1 = r.right, y0 = r.top, y1 = r.bottom, xs = false, hid = null, hidAx = '', cuts = [];
      for (const c of L) {
        const b = box(c.a);
        if (c.cx || c.sx) {
          xs = true;
          if (x1 <= b.l + tolX || x0 >= b.r - tolX) { hid = c; hidAx = 'x'; break; }
          if (c.cx && (b.l - x0 > tolX || x1 - b.r > tolX)) cuts.push({ a: c.a, ax: 'x', px: Math.max(b.l - x0, x1 - b.r) });
          x0 = Math.max(x0, b.l); x1 = Math.min(x1, b.r);
        }
        if (c.cy || c.sy) {
          if (y1 <= b.t + tolY || y0 >= b.b - tolY) { hid = c; hidAx = 'y'; break; }
          if (c.cy && (b.t - y0 > tolY || y1 - b.b > tolY)) cuts.push({ a: c.a, ax: 'y', px: Math.max(b.t - y0, y1 - b.b) });
          y0 = Math.max(y0, b.t); y1 = Math.min(y1, b.b);
        }
      }
      if (hid) { if (hidAx === 'x' ? hid.cx : hid.cy) { B.hidBy.add(hid.a); if (hidAx === 'y') B.hidY.add(hid.a); } continue; }
      if (!xs) {
        if (x1 <= 0 || x0 >= VW) continue;
        if (-x0 > tolX || x1 - VW > tolX) cuts.push({ a: null, ax: 'x', px: Math.max(-x0, x1 - VW) });
        x0 = Math.max(x0, 0); x1 = Math.min(x1, VW);
      }
      if (y1 <= 0 || y0 >= VH) continue;
      B.vis++;
      for (const c of L) if (c.cy) B.ys.add(c.a);
      if (!B.pt) B.pt = [(Math.max(x0, 0) + Math.min(x1, VW)) / 2, (Math.max(y0, 0) + Math.min(y1, VH)) / 2];
      for (const c of cuts) B.cuts.push(c);
    }
  }
  for (const [blk, B] of blocks) {
    if (!B.vis) continue;
    const bad = [];
    for (const c of B.cuts) {
      if (c.a && c.ax === 'x' && cs(c.a).textOverflow === 'ellipsis') { if (!okEllipsis(c.a)) bad.push('ellipsis on ' + sel(c.a) + ' (not a known single-line label)'); continue; }
      bad.push('cut ' + Math.round(c.px) + ' px ' + (c.ax === 'x' ? 'sideways' : 'up/down') + ' by ' + (c.a ? (c.a === blk ? 'its own box' : sel(c.a)) : 'the side of the screen'));
    }
    for (const a of B.hidBy) bad.push('some lines shown, others hidden by ' + (a === blk ? 'its own box' : sel(a)));
    if (!bad.length) continue;
    const h = document.elementFromPoint(B.pt[0], B.pt[1]);
    if (!h || !(h === blk || blk.contains(h) || h.contains(blk))) { n.covered++; continue; }
    fail('clip', blk, [...new Set(bad)].join('; '));
  }
  // a box that shows some of its text and hides whole blocks of it past its top or bottom edge (a closed fold hides all of its text)
  const HB = new Map(), VB = new Set();
  for (const B of blocks.values()) { if (B.vis) for (const a of B.ys) VB.add(a); else for (const a of B.hidY) HB.set(a, (HB.get(a) || 0) + 1); }
  for (const [a, k] of HB) {
    if (!VB.has(a)) continue;
    const b = box(a), h = document.elementFromPoint((Math.max(b.l, 0) + Math.min(b.r, VW)) / 2, (Math.max(b.t, 0) + Math.min(b.b, VH)) / 2);
    if (!h || !(h === a || a.contains(h) || h.contains(a))) { n.covered++; continue; }
    fail('clip', a, 'it shows part of its text and hides ' + k + ' more block' + (k > 1 ? 's' : '') + ' of text past its top or bottom edge');
  }

  // ---- clip: the value of a number field, a select, a placeholder
  const M = document.createElement('span');
  M.style.cssText = 'position:absolute;left:-99999px;top:0;white-space:pre;visibility:hidden;pointer-events:none';
  body.append(M);
  const measure = (text, e, pseudo) => {
    const s = pseudo ? getComputedStyle(e, pseudo) : cs(e);
    for (const k of ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontStretch', 'fontVariantCaps', 'fontVariantNumeric', 'fontVariantLigatures', 'fontFeatureSettings', 'fontVariationSettings', 'fontKerning', 'letterSpacing', 'wordSpacing', 'textTransform']) M.style[k] = s[k];
    M.textContent = text; return M.getBoundingClientRect().width;
  };
  for (const e of document.querySelectorAll('input, select')) {
    if (!vis(e) || srOnly(e)) continue;
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.bottom <= 0 || r.top >= VH || r.right <= 0 || r.left >= VW) continue;
    const s = cs(e), room = e.clientWidth - (parseFloat(s.paddingLeft) || 0) - (parseFloat(s.paddingRight) || 0);
    let need = 0, have = 0, what = '';
    if (e.tagName === 'SELECT') {
      const o = e.selectedOptions[0];
      if (!o || !o.text.trim()) continue;
      need = measure(o.text.trim(), e); have = room; what = 'the choice';
    } else if (!/^(text|number|search|email|tel|url|)$/.test(e.type)) continue;
    else if (e.value && (e.type === 'number' || /numeric|decimal/.test(e.inputMode) || e.readOnly)) { need = e.scrollWidth; have = e.clientWidth; what = e.readOnly ? 'the value shown' : 'the number'; }
    else if (!e.value && e.placeholder) { need = measure(e.placeholder, e, '::placeholder'); have = room; what = 'the placeholder'; }
    else continue;
    if (need <= have + 1) continue;
    const h = document.elementFromPoint((Math.max(r.left, 0) + Math.min(r.right, VW)) / 2, (Math.max(r.top, 0) + Math.min(r.bottom, VH)) / 2);
    if (!h || !(h === e || e.contains(h) || h.contains(e) || (h.closest('label') && h.closest('label').control === e))) { n.covered++; continue; }
    if (s.textOverflow === 'ellipsis' && okEllipsis(e)) continue;
    fail('clip', e, what + ' is ' + Math.round(need) + ' px wide, ' + Math.round(have) + ' px to show it' + (s.textOverflow === 'ellipsis' ? ' (ellipsis: not a known single-line label)' : ''));
  }
  M.remove();
  // ---- clip: a date or time field draws its text in an inner box (::-webkit-datetime-edit) that the page cannot measure; a fixed px
  // line-height set on that box cuts the text once the text is taller than it. Read from the style sheets: the rule that wins for the field.
  const spec = q => (q.match(/#[\w-]+/g) || []).length * 1e4 + (q.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) || []).length * 1e2
    + (q.replace(/#[\w-]+|\.[\w-]+|\[[^\]]+\]|::?[\w-]+(\([^)]*\))?/g, ' ').match(/(^|[\s>+~])[a-z][\w-]*/gi) || []).length;
  const dtRules = [];
  let ord = 0;
  const walk = rules => {
    for (const r of rules) {
      ord++;
      if (r.media && !matchMedia(r.media.mediaText).matches) continue;
      if (r.selectorText && /::-webkit-datetime-edit/.test(r.selectorText) && r.style && r.style.lineHeight) {
        for (const q of r.selectorText.split(',')) {
          const m = /^(.*?)::-webkit-datetime-edit(-fields-wrapper)?\s*$/.exec(q.trim());
          if (m) dtRules.push({ host: m[1].trim() || '*', lh: r.style.lineHeight, ord, sp: spec(m[1]) });
        }
      }
      if (r.cssRules && r.cssRules.length) walk(r.cssRules);
    }
  };
  for (const ss of document.styleSheets) { try { walk(ss.cssRules); } catch (x) { /* a sheet from elsewhere */ } }
  for (const e of document.querySelectorAll('input[type=date], input[type=time], input[type=datetime-local], input[type=month], input[type=week]')) {
    if (!vis(e) || srOnly(e)) continue;
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.bottom <= 0 || r.top >= VH || r.right <= 0 || r.left >= VW) continue;
    const win = dtRules.filter(d => { try { return e.matches(d.host); } catch (x) { return false; } }).sort((a, b) => a.sp - b.sp || a.ord - b.ord).pop();
    if (!win || !/^[\d.]+px$/.test(win.lh)) continue;
    const L = parseFloat(win.lh), F = parseFloat(cs(e).fontSize) || 16;
    if (L >= F * 1.2 - 0.5) continue;
    const h = document.elementFromPoint((Math.max(r.left, 0) + Math.min(r.right, VW)) / 2, (Math.max(r.top, 0) + Math.min(r.bottom, VH)) / 2);
    if (!h || !(h === e || e.contains(h) || (h.closest('label') && h.closest('label').control === e))) { n.covered++; continue; }
    fail('clip', e, 'its text is cut: ' + Math.round(F) + ' px text on a ' + L + ' px line (' + win.host + '::-webkit-datetime-edit line-height)');
  }

  // ---- tap targets
  const TSEL = 'button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=tab], [role=switch], [role=checkbox], [role=radio], [role=menuitem], [role=menuitemradio], [role=option]';
  const seen = new Set(), T = [];
  for (let e of document.querySelectorAll(TSEL)) {
    if (e.tagName === 'INPUT') {
      const r = e.getBoundingClientRect();
      if (!vis(e) || srOnly(e) || r.width <= 2 || r.height <= 2) { const L = (e.labels && e.labels[0]) || e.closest('label'); if (!L) continue; e = L; }
    }
    if (seen.has(e)) continue;
    seen.add(e);
    if (!vis(e) || srOnly(e)) continue;
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.bottom <= 0 || r.top >= VH || r.right <= 0 || r.left >= VW) continue;
    if (cs(e).display === 'inline') {
      let b = e.parentElement;
      while (b && b !== body && /^(inline|contents)$/.test(cs(b).display)) b = b.parentElement;
      if ((b.textContent || '').replace(/\s+/g, '').length > (e.textContent || '').replace(/\s+/g, '').length) continue;
    }
    // the part of it on show: its box less what the boxes around it clip or scroll away, and the screen
    const v = { l: Math.max(r.left, 0), r: Math.min(r.right, VW), t: Math.max(r.top, 0), b: Math.min(r.bottom, VH) };
    for (const c of chain(e, true)) {
      const bx = box(c.a);
      if (c.cx || c.sx) { v.l = Math.max(v.l, bx.l); v.r = Math.min(v.r, bx.r); }
      if (c.cy || c.sy) { v.t = Math.max(v.t, bx.t); v.b = Math.min(v.b, bx.b); }
    }
    if (v.r - v.l < 1 || v.b - v.t < 1) continue;
    if (![[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]].some(([a, b]) => owns(e, v.l + (v.r - v.l) * a, v.t + (v.b - v.t) * b))) { n.covered++; continue; }
    T.push({ e, r, v, f: floatOf(e), whole: v.l - r.left < 1 && r.right - v.r < 1 && v.t - r.top < 1 && r.bottom - v.b < 1 });
  }
  n.targets = T.length;
  // the tap area along one line from the centre: px from the centre to its edge (to 1/16 px), or null when that edge cannot be seen
  // here (the line runs under another layer, or off the top or bottom of the scrolling page)
  const reach = (t, cx, cy, dx, dy, max) => {
    const at = d => {
      const x = cx + dx * d, y = cy + dy * d;
      if (x < 0 || x >= VW) return 'edge';
      if (y < 0 || y >= VH) return t.f && cs(t.f).position === 'fixed' ? 'edge' : null;
      if (owns(t.e, x, y)) return true;
      const h = document.elementFromPoint(x, y), hf = h && floatOf(h);
      return hf && hf !== t.f && !hf.contains(t.e) ? null : false;
    };
    let k = 1, o;
    for (; k <= max; k++) { o = at(k); if (o !== true) break; }
    if (k > max) return max;
    if (o === null) return null;
    if (o === 'edge') return dx > 0 ? VW - cx : dx < 0 ? cx : dy > 0 ? VH - cy : cy;
    let lo = k - 1, hi = k;
    for (let i = 0; i < 4; i++) { const mid = (lo + hi) / 2; if (at(mid) === true) lo = mid; else hi = mid; }
    return lo;
  };
  const MIN = cfg.min - 0.5;
  for (const t of T) {
    const { e, r } = t;
    if (r.width >= MIN && r.height >= MIN) continue;
    if (!t.whole) { n.unknown++; continue; }
    const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    let w = r.width, hgt = r.height;
    if (w < MIN) { const a = reach(t, cx, cy, -1, 0, cfg.min), b = reach(t, cx, cy, 1, 0, cfg.min); if (a === null || b === null) { n.unknown++; continue; } w = a + b; }
    if (hgt < MIN) { const a = reach(t, cx, cy, 0, -1, cfg.min), b = reach(t, cx, cy, 0, 1, cfg.min); if (a === null || b === null) { n.unknown++; continue; } hgt = a + b; }
    if (w >= MIN && hgt >= MIN) continue;
    fail('small', e, 'tap area ' + Math.round(w) + ' x ' + Math.round(hgt) + ' px (box ' + Math.round(r.width) + ' x ' + Math.round(r.height) + ')');
  }
  // ---- overlap (of the parts on show)
  const lab = (a, b) => a.tagName === 'LABEL' && a.control === b;
  for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
    const A = T[i], B = T[j];
    const iw = Math.min(A.v.r, B.v.r) - Math.max(A.v.l, B.v.l), ih = Math.min(A.v.b, B.v.b) - Math.max(A.v.t, B.v.t);
    if (iw <= 1 || ih <= 1) continue;
    if (A.e.contains(B.e) || B.e.contains(A.e) || lab(A.e, B.e) || lab(B.e, A.e)) continue;
    if (A.f !== B.f && (!A.f || !B.f || A.f.contains(B.e) || B.f.contains(A.e))) continue;
    fail('overlap', A.e, Math.round(iw) + ' x ' + Math.round(ih) + ' px shared', B.e);
  }
  return { fails, n };
}

/* ---------------------------------------------------------------- the run */
const known = (f, w, s) => KNOWN_ON_MAIN.find(k => k.rule === f.rule && k.sel.test(f.sel) && k.screen.test(f.screen) && (!k.detail || k.detail.test(f.detail)) && (!k.at || k.at(w, s)));
const C = checker();
const T0 = Date.now(), used = new Set();
const b = await chromium.launch();
try {
  for (const W of WIDTHS) {
    const t0 = Date.now(), all = [];
    let opened = 0;
    const pick = s => (!ONLY || ONLY.test(s.name)) && (!(s.width >= 1100) || W === DESK_PASS);
    // the screens audited: those run() handed to the audit (its results), not the list, since run() skips a screen whose needs
    // selector the page lacks (item 91's on main and on branches before they merge it)
    const audited = new Set();
    for (const S of SCALES) {
      const done = await run(async (s, o) => {
        const add = (rule, sel, text, detail) => all.push({ rule, sel, text, detail, screen: s.name, w: s.width >= 1100 ? s.width : W, s: S });
        if (o.fail || !o.p) { add('screen', s.name, '', 'could not reach the screen: ' + (o.fail || 'no page')); return; }
        opened++;
        let res;
        try { res = await o.p.evaluate(pageAudit, { ellipsisOk: ELLIPSIS_OK, sidewaysOk: SIDEWAYS_OK, min: 44 }); }
        catch (e) { add('screen', s.name, '', 'the audit failed: ' + String(e && e.message || e).split('\n')[0]); return; }
        if (process.env.LAYOUT_DEBUG) console.log('    debug ' + s.name + ' ' + W + 'px ' + pct(S) + ' ' + JSON.stringify(res.n));
        for (const f of res.fails) add(f.rule, f.sel, f.text, f.detail);
      }, { page: PAGE, width: W, scale: S, browser: b, only: pick });
      for (const r of done) audited.add(r.name);
    }
    const nScreens = audited.size, missed = screens.filter(s => pick(s) && !audited.has(s.name));
    const needs = [...new Set(missed.map(s => s.needs || 'not run'))].join(', ');
    // group the same failure across screens and text sizes
    const groups = new Map();
    let nKnown = 0;
    for (const f of all) {
      const k = known(f, W, f.s);
      if (k) { nKnown++; used.add(k); if (!SHOW_ALL) continue; }
      const key = f.rule + '|' + f.sel + '|' + f.detail.replace(/-?\d+(\.\d+)?/g, 'N');
      let g = groups.get(key);
      if (!g) groups.set(key, g = { f, k, n: 0, at: new Map() });
      g.n++;
      const at = f.screen + (f.w !== W ? ' (' + f.w + ' px)' : ''), m = g.at.get(at) || new Map();
      m.set(f.s, (m.get(f.s) || 0) + 1); g.at.set(at, m);
    }
    let nNew = 0;
    for (const g of groups.values()) {
      if (!g.k) nNew += g.n;
      const where = [...g.at].map(([sc, m]) => sc + ' ' + [...m].map(([s, c]) => pct(s) + (c > 1 ? ' (x' + c + ')' : '')).join('/')).join(', ');
      console.log('    ' + (g.k ? 'known ' : 'NEW ') + W + 'px ' + g.f.rule + ': ' + g.f.sel + (g.f.text ? ' "' + g.f.text + '"' : '') + ' - ' + g.f.detail + ' - at ' + where);
    }
    const min = ((Date.now() - t0) / 60000).toFixed(1);
    C.ok(nNew === 0, W + 'px: ' + nScreens + ' screens x ' + SCALES.map(pct).join('/') + ' text (' + opened + ' opened)' + (missed.length ? ', ' + missed.length + ' skipped (needs ' + needs + ')' : '') + ', ' + (nNew ? nNew + ' new failures' : 'no new failures') + ', ' + nKnown + ' known on main, ' + min + ' min');
  }
} finally { await b.close(); }
for (const k of KNOWN_ON_MAIN) {
  const due = !ONLY && WIDTHS.some(w => SCALES.some(s => !k.at || k.at(w, s)));
  if (due && !used.has(k)) console.log('    note: a KNOWN_ON_MAIN entry was not seen in this run (fixed? take it out): ' + k.rule + ' ' + k.sel + ' on ' + k.screen);
}
C.done('layout audit, ' + WIDTHS.join('/') + ' px x ' + SCALES.map(pct).join('/') + ' text, ' + ((Date.now() - T0) / 60000).toFixed(1) + ' min');
