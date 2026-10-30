// node q91.test.mjs <null.html> [only]   (cd into this folder first) -- item 91: Journal: your own header photo.
// Every numbered point and QA line of QUEUE.md item 91 and every point of DECISIONS.md "Item 91": the camera, the Header sheet, the three
// styles and thumbnails, Choose photo (EXIF orientation, 1600 px, at most 400 KB, metadata and GPS gone: the stored JPEG is parsed), the
// IndexedDB copy, Move and zoom (drag, keys, sliders, trackpad and touch pinch, Cancel, Escape, Done, reload), Remove photo, Back up /
// Restore, Storage sync through a Firebase stand-in (fbmock.mjs: the path, a second device, photoAt and the newer-photo-wins rules, an
// upload in flight, offline, retries backing off, Storage refused, no bucket yet), Delete my account / erase / account switch, AA contrast over a bright,
// a dark and a spotted photo, item 90's motion with a photo, Reduce Motion, print, 390 px and 320 px at 200%, keyboard and screen reader
// names, and that no request but the account's own Storage upload carries the image. Looks are also checked as drawn (the stripes' pixels over
// the photo, the photo's box against the header's and the bar's), and Move and zoom against the header (its title's lines and scrim). `only`:
// a comma-separated list of sections to run (sheet, choose, styles, move, remove, backup, contrast, motion, small, sync, races, storage,
// account). Always run (whatever `only` says): the repo's storage.rules (Q91_REPO, else ../../wt-q91) against the rules the stand-in
// keeps, the cache bump (sw.js beside the page), and the privacy and function-name checks. The whole run takes about 8 minutes.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { open, checker } from '../lib/open.mjs';
import { Backend, RULES } from './fbmock.mjs';
import { makePhotos, MARKS, NAMES } from './mkphotos.mjs';
import { buildPages, openSync, idbPhoto, header, segments, jpegSize, sleep, until, choose, reload, jpegQuality, pxDiff } from './lib.mjs';

const PAGE = path.resolve(process.argv[2] || '../../fred91/null.html'), ONLY = (process.argv[3] || '').split(',').filter(Boolean);
const HERE = path.dirname(new URL(import.meta.url).pathname), PH = path.join(HERE, 'photos'), SHOTS = process.env.Q91_SHOTS || path.resolve(HERE, '../../q91shots');
const REPO = process.env.Q91_REPO || path.resolve(HERE, '../../wt-q91');
const C = checker('q91 '), ok = C.ok;
const ALL_REQ = []; // every request of every page: the privacy check at the end
const browser = await chromium.launch();
if (!NAMES.every(n => fs.existsSync(path.join(PH, n)))) await makePhotos(PH, browser);
const photo = n => path.join(PH, n);
const { sync: SYNC, nob: NOB } = buildPages(PAGE);
fs.mkdirSync(SHOTS, { recursive: true });
const SRC = fs.readFileSync(PAGE, 'utf8');

// a local page (Firebase off) whose requests are recorded too
async function local(o = {}) { const rec = []; const r = await open(PAGE, Object.assign({ athlete: 'A', browser }, o, { route: (q, u) => { rec.push({ page: 'local', url: u, method: q.request().method(), body: q.request().postDataBuffer() || Buffer.alloc(0) }); return null; } })); ALL_REQ.push(rec); return r; }
async function synced(be, o = {}) { const r = await openSync(o.nobucket ? NOB : SYNC, be, Object.assign({ browser }, o)); return r; }
const journal = async p => { await p.click('nav.tabs button[data-view=journal]'); await p.waitForTimeout(300); };
const sheetOpen = p => p.$eval('#jHdr', m => m.classList.contains('open'));
const openSheet = async p => { if (!(await sheetOpen(p))) { await p.click('nav.tabs button[data-view=journal]'); await p.waitForTimeout(250); await p.click('#jhCam'); await p.waitForTimeout(400); } };
const cls = p => p.$eval('#view-journal', v => v.className);
const st = (p, sel, prop) => p.$eval(sel, (e, k) => getComputedStyle(e)[k], prop);
const dialogs = (p, accept = true) => { const seen = []; p.on('dialog', d => { seen.push(d.message()); accept ? d.accept() : d.dismiss(); }); return seen; };
async function pickWait(p, file) { const before = (await header(p)) || {}; await choose(p, file); return until(async () => { const h = await header(p); return h && h.photoAt && h.photoAt !== before.photoAt ? h : null; }, 20000); }
// this device's stored photo decoded with no orientation: its size and the colour near its top and its bottom
const upright = p => p.evaluate(async () => { const v = await new Promise(res => { const q = indexedDB.open('fred-journal'); q.onsuccess = () => { const g = q.result.transaction('header').objectStore('header').get('photo'); g.onsuccess = () => res(g.result); }; });
  const im = await createImageBitmap(new Blob([v.buf], { type: 'image/jpeg' }), { imageOrientation: 'none' }), c = new OffscreenCanvas(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, 0, 0); const px = fy => [...x.getImageData(im.width >> 1, Math.round(im.height * fy), 1, 1).data].slice(0, 3); return { w: im.width, h: im.height, top: px(.1), bot: px(.9) }; });
const lum = (r, g, b) => { const f = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
// the contrast of white text over what is under it: two screenshots of the text's box (as shown, and with the letters invisible); where they
// differ are the letters (grown by 2 px); there, the brightest 3 x 3 mean of what is under them
async function textContrast(p, sel) {
  const box = await p.$eval(sel, t => { const b = t.getBoundingClientRect(), H = document.querySelector('body>header').getBoundingClientRect().bottom; return { x: Math.max(0, b.left - 2), y: Math.max(H, b.top - 2), width: b.width + 4, height: Math.min(b.bottom + 2, innerHeight) - Math.max(H, b.top - 2) }; });
  if (!(box.height > 4)) return null;
  const a = await p.screenshot({ clip: box });
  await p.$eval(sel, t => { t.dataset.q91 = t.getAttribute('style') || ''; t.style.setProperty('color', 'transparent', 'important'); t.style.setProperty('text-shadow', 'none', 'important'); });
  await p.waitForTimeout(60); const b = await p.screenshot({ clip: box });
  await p.$eval(sel, t => { const s = t.dataset.q91; if (s) t.setAttribute('style', s); else t.removeAttribute('style'); delete t.dataset.q91; });
  const max = await p.evaluate(async ([A, B]) => { const px = async b64 => { const im = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()), c = new OffscreenCanvas(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, 0, 0); return { w: im.width, h: im.height, d: x.getImageData(0, 0, im.width, im.height).data }; };
    const s = await px(A), u = await px(B), w = u.w, h = u.h, ink = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) { const j = i * 4; if (Math.abs(s.d[j] - u.d[j]) + Math.abs(s.d[j + 1] - u.d[j + 1]) + Math.abs(s.d[j + 2] - u.d[j + 2]) > 40) ink[i] = 1; }
    const f = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; let m = 0, n = 0;
    for (let y = 1; y < h - 1; y++) for (let x0 = 1; x0 < w - 1; x0++) { let near = 0; for (let v = -4; v <= 4 && !near; v++) for (let q = -4; q <= 4; q++) { const yy = y + v, xx = x0 + q; if (yy >= 0 && yy < h && xx >= 0 && xx < w && ink[yy * w + xx]) { near = 1; break; } } if (!near) continue; n++;
      let r = 0, g = 0, bb = 0; for (let v = -1; v <= 1; v++) for (let q = -1; q <= 1; q++) { const i = ((y + v) * w + x0 + q) * 4; r += u.d[i]; g += u.d[i + 1]; bb += u.d[i + 2]; } const L = .2126 * f(r / 9) + .7152 * f(g / 9) + .0722 * f(bb / 9); if (L > m) m = L; }
    return n ? m : -1; }, [a.toString('base64'), b.toString('base64')]);
  return max < 0 ? null : 1.05 / (max + .05);
}
// the colour (a 3 x 3 mean) at each point {x, y} (CSS px of a dpr 1 page) of a PNG screenshot of the viewport
const pxAt = (p, png, pts) => p.evaluate(async ([b64, P]) => { const im = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()), c = new OffscreenCanvas(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, 0, 0);
  return P.map(q => { const d = x.getImageData(Math.round(q.x) - 1, Math.round(q.y) - 1, 3, 3).data, s = [0, 0, 0]; for (let i = 0; i < 36; i += 4) { s[0] += d[i]; s[1] += d[i + 1]; s[2] += d[i + 2]; } return s.map(v => Math.round(v / 9)); }); }, [png.toString('base64'), pts]);
const rgb = s => (String(s).match(/\d+/g) || []).slice(0, 3).map(Number);
// a point of each stripe (viewBox x, y) on the screen: in the header (.jh-s1, .jh-s2) or in the compact bar (.jh-c1, .jh-c2), with its fill
const stripePts = (p, sel, pts) => p.evaluate(([sel, pts]) => sel.map((s, i) => { const e = document.querySelector(s), q = new DOMPoint(pts[i][0], pts[i][1]).matrixTransform(e.getScreenCTM()); return { x: q.x, y: q.y, fill: getComputedStyle(e).fill }; }), [sel, pts]);
// a device offline / online again: the context's switch (navigator.onLine, the events) and its requests refused
async function offline(be, o, on) { if (on) be.offline.add(o.label); else be.offline.delete(o.label); await o.ctx.setOffline(on); if (!on) await o.p.evaluate(() => window.dispatchEvent(new Event('online'))); }
// both devices back at the front every 2 s (each pulls at most every 10 s) until cond() holds
async function settle(pages, cond, ms = 50000) { const t = Date.now(); while (Date.now() - t < ms) { for (const pg of pages) await pg.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(2000); const v = await cond().catch(() => null); if (v) return v; } return null; }
// a Firebase stand-in that returns every map's keys sorted, as Firestore does (the stock one keeps the order they were written in)
const sortDeep = v => Array.isArray(v) ? v.map(sortDeep) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sortDeep(v[k])])) : v;
class SortedBackend extends Backend { json(r, o, status) { return super.json(r, sortDeep(o), status); } }
const sections = [];
const section = (name, fn) => sections.push([name, fn]);

/* ---------------------------------------------------------------- the camera and the sheet (point 1, 2) */
section('sheet', async () => {
  const o = await local({ dpr: 2 }); const p = o.p; await journal(p); /* (2 device px: a 2.5 px outline is not rounded to 2) */
  const cam = await p.$eval('#jhCam', b => { const s = b.querySelector('span'), r = b.getBoundingClientRect(), sr = s.getBoundingClientRect(), add = document.getElementById('jNoteAdd').getBoundingClientRect(), cs = getComputedStyle(s);
    return { w: r.width, h: r.height, cw: sr.width, ch: sr.height, rad: cs.borderRadius, bg: cs.backgroundColor, col: getComputedStyle(b).color, gap: Math.round(add.left - r.right), top: Math.abs(r.top - add.top) < 1, label: b.getAttribute('aria-label'), pop: b.getAttribute('aria-haspopup'), exp: b.getAttribute('aria-expanded'), svg: !!b.querySelector('svg[aria-hidden=true]') }; });
  ok(cam.w >= 44 && cam.h >= 44 && cam.cw === 40 && cam.ch === 40 && cam.rad === '50%', 'camera: a 40 px circle in a 44 px target', cam);
  ok(cam.bg === 'rgba(0, 0, 0, 0.35)' && cam.col === 'rgb(255, 255, 255)' && cam.svg, 'camera: black 35%, white line icon', cam);
  ok(cam.gap >= 0 && cam.gap <= 8 && cam.top, 'camera: just left of the + (at most 8 px between them), on its line', cam);
  ok(cam.label === 'Header photo' && cam.pop === 'dialog' && cam.exp === 'false', 'camera: named, a dialog button', cam);
  const bar = await p.$eval('#jFold [data-jh-cam]', b => { const c = getComputedStyle(b.querySelector('span')); return { w: c.width, h: c.height, rad: c.borderRadius, bg: c.backgroundColor, label: b.getAttribute('aria-label') }; }); /* (computed: the bar is not shown until the page scrolls) */
  ok(bar.w === '36px' && bar.h === '36px' && bar.rad === '50%' && bar.bg === 'rgba(0, 0, 0, 0.35)' && bar.label === 'Header photo', 'compact bar: its own camera, a 36 px circle, black 35%', bar);
  await p.click('#jhCam'); await p.waitForTimeout(450);
  const sh = await p.evaluate(() => { const m = document.getElementById('jHdr'), q = s => m.querySelector(s), th = [...m.querySelectorAll('.jhp-th')];
    return { open: m.classList.contains('open'), title: q('h2').textContent, role: q('.sheet').getAttribute('role'), lab: q('.sheet').getAttribute('aria-labelledby'), legend: q('legend').textContent,
      names: th.map(l => l.querySelector('.jhp-tl').textContent), vals: th.map(l => l.querySelector('input').value), radios: th.map(l => l.querySelector('input').type),
      hts: th.map(l => l.querySelector('.jhp-tv').getBoundingClientRect().height), rad: th.map(l => getComputedStyle(l.querySelector('.jhp-tv')).borderRadius),
      checked: th.filter(l => l.querySelector('input').checked).map(l => l.dataset.jhpSt), outline: (() => { const c = th.find(l => l.querySelector('input').checked).querySelector('.jhp-tv'), s = getComputedStyle(c); return [s.outlineStyle, s.outlineWidth, s.outlineColor, s.outlineOffset]; })(),
      rows: [...m.querySelectorAll('.jhp-row')].filter(b => b.getClientRects().length).map(b => b.textContent), take: /take photo/i.test(m.textContent), done: q('#jhpDone').textContent,
      disabled: th.filter(l => l.querySelector('input').disabled).map(l => l.dataset.jhpSt), move: q('#jhpMoveBtn').disabled, rm: document.getElementById('jhpRmBox').hidden,
      file: (() => { const f = document.getElementById('jhpFile'); return { type: f.type, accept: f.getAttribute('accept'), capture: f.hasAttribute('capture') }; })(), lock: document.documentElement.classList.contains('jne-lock'), exp: document.getElementById('jhCam').getAttribute('aria-expanded') }; });
  ok(sh.open && sh.title === 'Header' && sh.role === 'dialog' && sh.lab === 'jhpT', 'sheet titled Header, a dialog', sh);
  const grab = await p.evaluate(() => { const g = document.querySelector('#jHdr .jne-grab'), r = g.getBoundingClientRect(), t = document.getElementById('jhpT').getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), bg: getComputedStyle(g).backgroundColor, above: r.bottom <= t.top }; });
  ok(grab.w === 38 && grab.h === 5 && grab.bg !== 'rgba(0, 0, 0, 0)' && grab.above, 'a grab bar above "Header" (PDF p.8, as on New entry)', grab);
  ok(sh.names.join('|') === 'Photo|Photo + stripes|Stripes' && sh.vals.join('|') === 'photo|photo-stripes|stripes' && sh.radios.every(t => t === 'radio') && sh.legend === 'Header style', 'three thumbnails: one radio group Photo · Photo + stripes · Stripes', sh);
  ok(sh.hts.every(h => h === 70) && sh.rad.every(r => r === '12px'), 'thumbnails 70 px tall, radius 12', sh);
  const rule = /#jHdr \.jhp-th:has\(input:checked\) \.jhp-tv\{outline:2\.5px solid var\(--on-blue\);outline-offset:2px\}/.test(SRC); /* (Chromium draws outlines in whole px: the rule is what the item names) */
  ok(sh.checked.join() === 'stripes' && rule && sh.outline[0] === 'solid' && parseFloat(sh.outline[1]) >= 2 && sh.outline[2] === 'rgb(11, 115, 153)' && sh.outline[3] === '2px', 'Stripes is the default; the chosen one outlined 2.5 px var(--on-blue), 2 px offset', { rule, o: sh.outline });
  ok(sh.rows.join('|') === 'Choose photo|Move and zoom|Stripes only' && !sh.take && sh.done === 'Done', 'one box: Choose photo · Move and zoom · Stripes only; no Take photo; Done', sh.rows);
  ok(sh.rm && sh.move && sh.disabled.join() === 'photo,photo-stripes', 'no photo yet: no Remove photo, Move and zoom off, the photo looks wait for a photo', sh);
  ok(sh.file.type === 'file' && sh.file.accept === 'image/*' && !sh.file.capture, 'Choose photo: <input type=file accept=image/*>, no capture', sh.file);
  ok(sh.lock && sh.exp === 'true', 'sheet: the page held (jne-lock), aria-expanded', sh);
  await p.click('#jhpDone'); await p.waitForTimeout(450);
  ok(!(await sheetOpen(p)) && (await p.evaluate(() => document.activeElement.id)) === 'jhCam' && !(await p.evaluate(() => document.documentElement.classList.contains('jne-lock'))), 'Done closes, focus back on the camera, the page free');
  ok(o.errors.length === 0, 'sheet: no errors', o.errors); await o.close();
});

/* ---------------------------------------------------------------- Choose photo: orientation, size, metadata, IndexedDB (point 3) */
section('choose', async () => {
  const o = await local({ dpr: 1 }); const p = o.p; await journal(p);
  const notes = []; await p.exposeFunction('q91note', t => notes.push(t));
  await p.evaluate(() => new MutationObserver(() => window.q91note(document.getElementById('jhpNote').textContent)).observe(document.getElementById('jhpNote'), { childList: true, characterData: true, subtree: true }));
  const t0 = Date.now(), h = await pickWait(p, photo('portrait6.jpg')), ms = Date.now() - t0;
  ok(!!h, 'a big portrait (4032 x 3024 stored, 7 MB, EXIF 6) is taken', { ms });
  ok(h && h.style === 'photo' && h.x === 50 && h.y === 50 && h.zoom === 1 && h.photoAt > 0 && h.updatedAt >= h.photoAt && Object.keys(h).sort().join() === 'goneAt,photoAt,style,updatedAt,x,y,zoom', 'first photo: the style switches to Photo; settings.journalHeader = {style, x, y, zoom, updatedAt, photoAt, goneAt}', h);
  const r = await idbPhoto(p);
  ok(r && r.keys === 'at,buf,h,up,w' && r.at === h.photoAt, 'kept in IndexedDB fred-journal › header › photo = {buf, at, w, h, up}', r && { keys: r.keys, at: r.at });
  const seg = segments(r.bytes), sz = jpegSize(r.bytes), txt = r.bytes.toString('latin1');
  ok(r.bytes.length <= 400 * 1024, 'at most 400 KB on disk', r.bytes.length);
  const q6 = jpegQuality(r.bytes); ok(q6 && q6.q === 82 && q6.err === 0, 'a photo that fits: re-encoded as JPEG quality .82 (its tables are IJG 82)', q6);
  ok(sz && Math.max(sz.w, sz.h) <= 1600 && sz.w === r.w && sz.h === r.h, 'at most 1600 px on the long side', sz);
  ok(sz && sz.h > sz.w && Math.abs(sz.h / sz.w - 4 / 3) < .01, 'portrait stays portrait (EXIF 6 honoured)', sz);
  ok(seg && !seg.some(s => (s.m >= 0xE1 && s.m <= 0xEF) || s.m === 0xFE), 'no metadata segment (APP1–APP15, COM) left in the bytes', seg && seg.map(s => s.m.toString(16)));
  ok(!MARKS.some(m => txt.includes(m)), 'no Exif, GPS, XMP, camera or comment text left', MARKS.filter(m => txt.includes(m)));
  const up = await p.evaluate(async () => { const v = await new Promise(res => { const q = indexedDB.open('fred-journal'); q.onsuccess = () => { const g = q.result.transaction('header').objectStore('header').get('photo'); g.onsuccess = () => res(g.result); }; });
    const im = await createImageBitmap(new Blob([v.buf], { type: 'image/jpeg' }), { imageOrientation: 'none' }), c = new OffscreenCanvas(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, 0, 0);
    const px = (fx, fy) => [...x.getImageData(Math.round(im.width * fx), Math.round(im.height * fy), 1, 1).data].slice(0, 3); return { top: px(.5, .1), mid: px(.5, .5), bot: px(.5, .9) }; });
  const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 60);
  ok(near(up.top, [224, 32, 32]) && near(up.mid, [32, 176, 64]) && near(up.bot, [32, 64, 224]), 'right way up: red top, green middle, blue bottom (decoded with no orientation)', up);
  ok(notes.includes('Getting your photo ready…') && notes[notes.length - 1] === '' && notes.filter(n => n).length === 1, 'the status note says it once and clears (no sticking, no repeat)', notes);
  const hero = await p.$eval('#jHero', e => e.getBoundingClientRect().height); ok(hero === 230, 'with a photo the header is 230 px', hero);
  // two more orientations
  for (const [f, port] of [['rot3.jpg', false], ['rot8.jpg', true]]) {
    await pickWait(p, photo(f)); const v = await p.evaluate(async () => { const v = await new Promise(res => { const q = indexedDB.open('fred-journal'); q.onsuccess = () => { const g = q.result.transaction('header').objectStore('header').get('photo'); g.onsuccess = () => res(g.result); }; });
      const im = await createImageBitmap(new Blob([v.buf], { type: 'image/jpeg' }), { imageOrientation: 'none' }), c = new OffscreenCanvas(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, 0, 0); const px = fy => [...x.getImageData(im.width >> 1, Math.round(im.height * fy), 1, 1).data].slice(0, 3); return { w: im.width, h: im.height, top: px(.1), bot: px(.9) }; });
    ok((v.h > v.w) === port && near(v.top, [224, 32, 32]) && near(v.bot, [32, 64, 224]), f + ': right way up', v);
  }
  { const hb = await pickWait(p, photo('busy.jpg')), rb = await idbPhoto(p), qb = rb && jpegQuality(rb.bytes), sb = rb && jpegSize(rb.bytes);
    ok(hb && rb.bytes.length <= 400 * 1024 && qb && [74, 66, 58, 50].includes(qb.q) && qb.err === 0 && sb && Math.max(sb.w, sb.h) === 1600, 'a detailed photo that is over 400 KB at .82: the quality steps down (to ' + (qb && qb.q) + ') until it is at most 400 KB, still 1600 px', { n: rb && rb.bytes.length, qb, sb }); }
  const before = await header(p); notes.length = 0;
  await choose(p, photo('notphoto.jpg')); await p.waitForTimeout(1500);
  const after = await header(p), nt = await p.$eval('#jhpNote', n => n.textContent);
  ok(JSON.stringify(after) === JSON.stringify(before) && /couldn.t be opened/.test(nt), 'not a photo: nothing changes, one quiet note', { nt });
  await p.click('#jhpDone'); await p.waitForTimeout(400); await p.click('#jhCam'); await p.waitForTimeout(400);
  ok((await p.$eval('#jhpNote', n => n.textContent)) === '', 'the note does not stick: gone when the sheet opens again');
  ok(o.errors.length === 0, 'choose: no errors', o.errors); await o.close();
  // a decoder that leaves EXIF orientation to the page (createImageBitmap from a Blob in older Safari: here a stub hands the decoder a copy
  // whose Orientation tag reads 1), and none at all (createImageBitmap refused: the <img> fallback): every photo still stored right way up
  for (const mode of ['ignore', 'reject']) {
    const o2 = await local({ dpr: 1 }); const p2 = o2.p;
    await o2.ctx.addInitScript(m => { const C = window.createImageBitmap; window.createImageBitmap = async function (src, ...a) { if (!(src instanceof Blob) || a.length) return C.call(this, src, ...a); if (m === 'reject') throw new DOMException('refused', 'InvalidStateError');
      const u = new Uint8Array(await src.arrayBuffer()); for (let i = 0; i + 12 < u.length && i < 262144; i++) { if (u[i] === 0x01 && u[i + 1] === 0x12 && u[i + 2] === 0 && u[i + 3] === 3) { u[i + 8] = 0; u[i + 9] = 1; break; } if (u[i] === 0x12 && u[i + 1] === 0x01 && u[i + 2] === 3 && u[i + 3] === 0) { u[i + 8] = 1; u[i + 9] = 0; break; } }
      return C.call(this, new Blob([u], { type: src.type })); }; }, mode);
    await reload(p2); await journal(p2);
    for (const [f, port] of [['portrait6.jpg', true], ['rot8.jpg', true], ['rot3.jpg', false]]) {
      await pickWait(p2, photo(f)); const v = await upright(p2);
      ok((v.h > v.w) === port && near(v.top, [224, 32, 32]) && near(v.bot, [32, 64, 224]), (mode === 'ignore' ? 'a decoder that ignores EXIF orientation' : 'no createImageBitmap (an <img> decodes it)') + ': ' + f + ' right way up', v);
    }
    ok(o2.errors.length === 0, 'decoder ' + mode + ': no errors', o2.errors); await o2.close();
  }
});

/* ---------------------------------------------------------------- the three styles (point 5) and Stripes only */
section('styles', async () => {
  const o = await local(); const p = o.p; await journal(p); const h0 = await pickWait(p, photo('land.jpg'));
  const look = () => p.evaluate(() => { const V = document.getElementById('view-journal'), H = document.getElementById('jHero'), ph = H.querySelector('.jh-ph'), img = ph.querySelector('img'), sv = H.querySelector('.jh-stripes'), sh = H.querySelector('.jh-shade'), t = H.querySelector('.jh-t'), bar = document.querySelector('#jFold .jh-cph img');
    return { cls: V.className, h: H.getBoundingClientRect().height, ph: getComputedStyle(ph).display, src: (img.getAttribute('src') || '').slice(0, 5), fit: getComputedStyle(img).objectFit, sv: getComputedStyle(sv).display, svo: getComputedStyle(sv).opacity, shade: getComputedStyle(sh).backgroundImage, ts: getComputedStyle(t).textShadow, bar: (bar.getAttribute('src') || '').slice(0, 5), cf: getComputedStyle(document.querySelector('#jFold .jh-cph'), '::after').backgroundImage, cfc: getComputedStyle(document.querySelector('#jFold .jh-cph'), '::after').content, cam: getComputedStyle(document.querySelector('#jhCam>span')).backgroundColor, bcam: getComputedStyle(document.querySelector('#jFold [data-jh-cam]>span')).backgroundColor,
      box: [H, ph, img].map(e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom].map(v => Math.round(v * 2) / 2).join(' '); }) }; });
  const bleed = L => L.box[1] === L.box[0] && L.box[2] === L.box[0]; /* (full bleed: the photo and its image fill the header's box exactly; zoom 1 here) */
  const fade = v => /^linear-gradient\(rgba\(0, 0, 0, 0\) 45%, rgba\(0, 0, 0, 0\.35\)\)/.test(String(v).replace(/to bottom, /, ''));
  let L = await look();
  ok(L.cls.includes('jh-photo') && !L.cls.includes('jh-pst') && L.h === 230 && L.ph === 'block' && L.src === 'blob:' && L.fit === 'cover' && L.sv === 'none' && bleed(L), 'Photo: full bleed photo from a blob: URL, 230 px, no stripes', L);
  ok(/linear-gradient\(rgba\(0, 0, 0, 0\) 45%, rgba\(0, 0, 0, 0\.35\)\)/.test(L.shade.replace(/to bottom, /, '')), 'Photo: fade from transparent at 45% to black 35% at the bottom', L.shade);
  ok(/rgba\(0, 0, 0, 0\.25\) 0px 1px 12px/.test(L.ts), 'Photo: the title shadow 0 1px 12px rgba(0,0,0,.25)', L.ts);
  ok(L.cam === 'rgba(0, 0, 0, 0.45)' && L.bcam === 'rgba(0, 0, 0, 0.45)' && L.bar === 'blob:', 'camera black 45% over a photo (the compact bar\u2019s too); the compact bar has the photo', L);
  ok(fade(L.cf) && L.cfc !== 'none', 'the compact bar: the same dark fade over its photo (its rule; as drawn below)', [L.cf, L.cfc]);
  await p.click('label[data-jhp-st="photo-stripes"]'); await p.waitForTimeout(300); L = await look();
  ok(L.cls.includes('jh-pst') && L.sv === 'block' && L.svo === '0.82' && L.ph === 'block' && fade(L.cf) && L.cfc !== 'none' && bleed(L), 'Photo + stripes: the stripes over the photo at 82% (the bar keeps its fade rule; as drawn below)', L);
  // the 200 px header's stripes, stretched to 230 px (PDF p.8): the same x places at the top and at the foot, in the header, its preview and its thumbnail
  const geo = await p.evaluate(() => { const H = document.getElementById('jHero').getBoundingClientRect(), sv = document.querySelector('#jHero .jh-stripes'), m = sv.querySelector('.jh-s1').getScreenCTM(), pt = (x, y) => { const q = new DOMPoint(x, y).matrixTransform(m); return [Math.round(q.x - H.left), Math.round(q.y - H.top)]; };
    const th = document.querySelector('#jHdr [data-jhp-st="photo-stripes"] svg.jhp-tst').getBoundingClientRect(), tv = document.querySelector('#jHdr [data-jhp-st="photo-stripes"] .jhp-tv').getBoundingClientRect(), ts = document.querySelector('#jHdr [data-jhp-st="stripes"] svg.jhp-tst').getBoundingClientRect();
    return { w: Math.round(H.width), h: Math.round(H.height), par: sv.getAttribute('preserveAspectRatio'), top: pt(249, 0), foot: pt(107, 200), th: [Math.round(th.width * 10) / 10, Math.round(th.height), Math.round(tv.right - th.right)], ts: Math.round(ts.width * 10) / 10 }; });
  ok(geo.w === 390 && geo.h === 230 && geo.par === 'none' && geo.top[0] === 249 && geo.top[1] === 0 && geo.foot[0] === 107 && geo.foot[1] === 230, 'Photo + stripes: the stripes keep the 200 px header\u2019s places, only taller (teal from x 249 at the top to 107 at the foot of the 230 px)', geo);
  ok(Math.abs(geo.th[0] - 70 * 390 / 230) < .6 && geo.th[2] === 0 && Math.abs(geo.ts - 70 * 390 / 200) < .6, 'the Photo + stripes thumbnail has the same stretched stripes (the Stripes one: the 200 px header\u2019s)', geo);
  ok((await header(p)).style === 'photo-stripes', 'the style is saved', await header(p));
  await p.click('#jhpStripes'); await p.waitForTimeout(300); L = await look();
  ok(!L.cls.includes('jh-photo') && L.h === 200 && L.ph === 'none' && L.sv === 'block' && L.svo === '1' && L.cam === 'rgba(0, 0, 0, 0.35)' && L.bcam === 'rgba(0, 0, 0, 0.35)', 'Stripes only: today’s header (200 px, stripes, camera 35%, the compact bar\u2019s too)', L);
  const k = await header(p), r = await idbPhoto(p);
  ok(k.style === 'stripes' && k.photoAt === h0.photoAt && r && r.at === h0.photoAt && !(await p.$eval('#jhpRmBox', b => b.hidden)), 'Stripes only keeps the photo (and Remove photo)', k);
  const ord = await p.evaluate(() => { const m = document.getElementById('jHdr'), R = e => e.getBoundingClientRect(), vis = e => e.getClientRects().length, rm = document.getElementById('jhpRemove'), box = document.getElementById('jhpChoose').closest('.jhp-box');
    return { rows: [...m.querySelectorAll('.jhp-row')].filter(vis).map(b => b.textContent), thB: Math.round(R(document.getElementById('jhpStyles')).bottom), boxT: Math.round(R(box).top), boxB: Math.round(R(box).bottom), rmT: Math.round(R(document.getElementById('jhpRmBox')).top), below: [...m.querySelectorAll('.jhp-row, .jhp-th')].filter(e => vis(e) && e !== rm && R(e).top >= R(rm).top).length }; });
  ok(ord.rows.join('|') === 'Choose photo|Move and zoom|Stripes only|Remove photo' && ord.boxT >= ord.thB && ord.rmT >= ord.boxB && !ord.below, 'with a photo: the Remove photo row is added at the bottom (below the thumbnails and the one box, the last row)', ord);
  const th = await p.evaluate(() => [...document.querySelectorAll('#jHdr .jhp-tv')].map(t => ({ none: t.classList.contains('jhp-none'), src: (t.querySelector('img') || { getAttribute: () => '' }).getAttribute('src') || '' })));
  ok(th[0].src.startsWith('blob:') && th[1].src.startsWith('blob:') && !th[0].none, 'thumbnails show the photo', th);
  await p.click('label[data-jhp-st="photo"]'); await p.waitForTimeout(300); L = await look();
  ok(L.cls.includes('jh-photo') && L.src === 'blob:' && (await header(p)).photoAt === h0.photoAt, 'pick Photo again: the photo is still there', L);
  // Stripes only, and the app opened again later (Firebase off here: nothing could fetch the photo back): this device still has its copy, and
  // Photo brings it back
  await p.click('#jhpStripes'); await p.waitForTimeout(300); await p.click('#jhpDone'); await p.waitForTimeout(300); await reload(p); await p.waitForTimeout(600); await journal(p);
  { const k2 = await header(p), r2 = await idbPhoto(p), c2 = await cls(p);
    ok(k2 && k2.style === 'stripes' && k2.photoAt === h0.photoAt && r2 && r2.at === h0.photoAt && !c2.includes('jh-photo'), 'Stripes only, the app opened again: the stripes, and this device still keeps its copy of the photo', { k2, at: r2 && r2.at, c2 }); }
  await p.click('#jhCam'); await p.waitForTimeout(400);
  { const tv = await p.$eval('#jHdr [data-jhp-st="photo"] .jhp-tv img', i => i.getAttribute('src') || ''), rm = await p.$eval('#jhpRmBox', b => b.hidden); await p.click('label[data-jhp-st="photo"]'); await p.waitForTimeout(300);
    const v = await until(() => p.evaluate(async () => { const i = document.querySelector('#jHero .jh-ph img'); if (!(i.getAttribute('src') || '').startsWith('blob:')) return null; try { await i.decode(); } catch (e) { return null; } return { cls: document.getElementById('view-journal').className, nw: i.naturalWidth, ph: getComputedStyle(i.parentNode).display }; }), 8000);
    ok(tv.startsWith('blob:') && !rm && v && v.cls.includes('jh-photo') && v.nw > 0 && v.ph === 'block' && (await header(p)).photoAt === h0.photoAt, 'Stripes only, the app opened again, then Photo: the photo is still there (its thumbnail and Remove photo too)', { tv: tv.slice(0, 5), rm, v }); }
  await p.click('#jhpDone'); await p.waitForTimeout(300); const shotP = await p.screenshot({ path: path.join(SHOTS, 'photo-390.png') });
  // the compact bar: the photo fills it (scrolled past the header)
  await p.evaluate(() => scrollTo(0, 260)); await p.waitForTimeout(450);
  const cb = await p.evaluate(() => { const R = e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom].map(v => Math.round(v * 2) / 2).join(' '); }, b = document.getElementById('jFold'), c = b.querySelector('.jh-cph'); return { vis: b.classList.contains('jf-vis'), bar: R(b), cph: R(c), img: R(c.querySelector('img')), h: Math.round(b.getBoundingClientRect().height) }; });
  ok(cb.vis && cb.h === 54 && cb.cph === cb.bar && cb.img === cb.bar, 'the compact bar: the photo fills its 54 px (full bleed, cropped)', cb);
  // the bar's fade as drawn (point 5: "the same dark fade"; a computed style is there even when nothing draws it): the bar as shown against the
  // same bar with its ::after hidden, row by row, left of its title and buttons: its top 45% the same, then each row darker, steadily, to about
  // 0.65 x at its foot (black from 0 at 45% to 35% at the foot)
  const noFade = async () => { const t = await p.addStyleTag({ content: '#view-journal.jh-photo .jh-cph::after{display:none!important}' }); await p.waitForTimeout(80); return async () => { await t.evaluate(e => e.remove()); await p.waitForTimeout(80); }; };
  { const clip = await p.$eval('#jFold', b => { const r = b.getBoundingClientRect(); return { x: r.left + 6, y: r.top, width: 84, height: r.height }; }), a = await p.screenshot({ clip }), back = await noFade(), b = await p.screenshot({ clip }); await back();
    const R = await p.evaluate(async ([A, B]) => { const px = async b64 => { const im = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()), c = new OffscreenCanvas(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, 0, 0); return { w: im.width, h: im.height, d: x.getImageData(0, 0, im.width, im.height).data }; };
      const s = await px(A), u = await px(B), rows = []; for (let y = 0; y < s.h; y++) { let m = 0, n = 0; for (let x = 0; x < s.w; x++) { const i = (y * s.w + x) * 4; m += s.d[i] + s.d[i + 1] + s.d[i + 2]; n += u.d[i] + u.d[i + 1] + u.d[i + 2]; } rows.push({ f: (y + .5) / s.h, a: m / s.w / 3, b: n / s.w / 3 }); } return rows; }, [a.toString('base64'), b.toString('base64')]);
    const want = f => 1 - .35 * Math.max(0, (f - .45) / .55), k = R.map(r => r.a / r.b), off = R.map((r, i) => r.f > .5 ? +(k[i] - want(r.f)).toFixed(3) : 0), foot = k[k.length - 1];
    const steady = R.every((r, i) => !i || r.f < .45 || k[i] <= k[i - 1] + .015), top = R.every(r => r.f > .44 || Math.abs(r.a - r.b) <= 3);
    ok(top && off.every(d => Math.abs(d) <= .05) && foot > .6 && foot < .7 && steady, 'the compact bar as drawn: the same dark fade over its photo (its top 45% untouched, then each row darker, to ' + foot.toFixed(2) + ' x at its foot)', { top, steady, foot: +foot.toFixed(3), rows: R.filter((r, i) => i % 6 === 5).map(r => [Math.round(r.a), Math.round(r.b)]), off: off.filter(d => Math.abs(d) > .05) }); }
  const barPt = [[336, 2], [362, 2]], barSel = ['#jFold .jh-c1', '#jFold .jh-c2']; /* (clear of the camera and the +) */
  const shotPB = await p.screenshot(); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
  await p.click('#jhCam'); await p.waitForTimeout(400); await p.click('label[data-jhp-st="photo-stripes"]'); await p.waitForTimeout(300); await p.screenshot({ path: path.join(SHOTS, 'sheet-390.png') });
  await p.click('#jhpDone'); await p.waitForTimeout(400); const shotS = await p.screenshot({ path: path.join(SHOTS, 'photo-stripes-390.png') });
  // Photo + stripes as drawn: at a point of each stripe the pixel is 82% the stripe over the Photo pixel there (the same photo, the same crop)
  { const pts = await stripePts(p, ['#jHero .jh-s1', '#jHero .jh-s2'], [[212, 100], [300, 100]]), a = await pxAt(p, shotP, pts), b = await pxAt(p, shotS, pts);
    const want = pts.map((q, i) => rgb(q.fill).map((f, k) => .82 * f + .18 * a[i][k])), off = b.map((c, i) => Math.max(...c.map((v, k) => Math.abs(v - want[i][k])))), apart = b.map((c, i) => c.reduce((s, v, k) => s + Math.abs(v - a[i][k]), 0));
    ok(off.every(d => d <= 8) && apart.every(d => d > 60), 'Photo + stripes as drawn: each stripe at 82% over the photo (pixels: 0.82 x its colour + 0.18 x the Photo pixel there)', { photo: a, stripes: b, want: want.map(w => w.map(Math.round)), off, apart }); }
  await p.evaluate(() => scrollTo(0, 260)); await p.waitForTimeout(450);
  { const pts = await stripePts(p, barSel, barPt), a = await pxAt(p, shotPB, pts), b = await pxAt(p, await p.screenshot(), pts), d = b.map((c, i) => c.reduce((s, v, k) => s + Math.abs(v - a[i][k]), 0));
    ok(d.every(x => x > 40) && b[0][1] > b[0][0] && b[0][2] > b[0][0] && b[1][2] < b[1][0] && b[1][2] < b[1][1], 'the compact bar in Photo + stripes: its stripes drawn over the photo (teal, then green)', { photo: a, stripes: b, d }); }
  // ... and its fade over its stripes as drawn: at the foot of each stripe (below the camera and the +) the pixel is about 0.68 x the same pixel
  // with the fade hidden (black 32% there)
  { const pts = await stripePts(p, barSel, [[282, 51], [340, 51]]), a = await pxAt(p, await p.screenshot(), pts), back = await noFade(), b = await pxAt(p, await p.screenshot(), pts); await back();
    const k = a.map((c, i) => c.map((v, j) => b[i][j] > 40 ? +(v / b[i][j]).toFixed(3) : null));
    ok(b[0][1] > b[0][0] && b[0][2] > b[0][0] && b[1][1] > b[1][2] && k.every(c => c.some(v => v !== null) && c.every(v => v === null || (v > .62 && v < .74))), 'the compact bar in Photo + stripes as drawn: the same fade over its stripes too (at the foot of each, about 0.68 x the pixel with no fade)', { fade: a, none: b, k }); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
  // on paper: the stripes header, the stripes at full strength
  await p.emulateMedia({ media: 'print' }); await p.waitForTimeout(150);
  { const pts = await stripePts(p, ['#jHero .jh-s1', '#jHero .jh-s2'], [[212, 100], [300, 100]]), b = await pxAt(p, await p.screenshot(), pts), off = b.map((c, i) => Math.max(...c.map((v, k) => Math.abs(v - rgb(pts[i].fill)[k]))));
    ok(off.every(x => x <= 6), 'print, Photo + stripes: the stripes drawn whole (their own colours, no photo under them)', { b, fill: pts.map(q => q.fill) }); }
  await p.emulateMedia({ media: 'screen' }); await p.waitForTimeout(150);
  // Move and zoom opened from the sheet on each look: its preview has the header's look (Photo: no stripes; Photo + stripes: the stripes at 82%),
  // as drawn: at a point of each stripe the preview's pixel is the header's there (the same photo, the same crop: 1x, centred), and on Photo +
  // stripes it is 0.82 x the stripe's colour + 0.18 x the Photo preview's pixel
  { const pv = {};
    for (const sty of ['photo', 'photo-stripes']) {
      await openSheet(p); await p.click('label[data-jhp-st="' + sty + '"]'); await p.waitForTimeout(300); await p.click('#jhpMoveBtn'); await p.waitForTimeout(600);
      const v = await p.evaluate(() => { const s = document.querySelector('#jhpStage svg'), H = document.querySelector('#jHero .jh-stripes'), d = s.style.display; s.style.display = 'block'; /* (its stripes' places, shown or not) */
        const pts = [...s.querySelectorAll('polygon')].map((e, i) => { const q = new DOMPoint(i ? 300 : 212, 100).matrixTransform(e.getScreenCTM()); return { x: q.x, y: q.y, fill: getComputedStyle(e).fill }; }); s.style.display = d;
        return { open: document.getElementById('jHdrMove').classList.contains('open'), pv: getComputedStyle(s).display, pvo: getComputedStyle(s).opacity, hd: getComputedStyle(H).display, pts }; });
      v.px = await pxAt(p, await p.screenshot(), v.pts); pv[sty] = v;
      await p.click('#jhpMCancel'); await p.waitForTimeout(300);
    }
    const P = pv.photo, S = pv['photo-stripes'];
    ok(P.open && S.open && P.pv === 'none' && P.hd === 'none' && S.pv === S.hd && S.pv !== 'none' && S.pvo === '0.82', 'Move and zoom from the sheet: its preview has the header’s look (no stripes on Photo; on Photo + stripes the stripes, at 82%)', { photo: [P.pv, P.hd], stripes: [S.pv, S.hd, S.pvo] });
    const hp = await stripePts(p, ['#jHero .jh-s1', '#jHero .jh-s2'], [[212, 100], [300, 100]]), hP = await pxAt(p, shotP, hp), hS = await pxAt(p, shotS, hp);
    const dif = (a, b) => a.map((c, i) => Math.max(...c.map((x, k) => Math.abs(x - b[i][k])))), want = S.pts.map((q, i) => rgb(q.fill).map((f, k) => .82 * f + .18 * P.px[i][k]));
    const dP = dif(P.px, hP), dS = dif(S.px, hS), off = dif(S.px, want), apart = S.px.map((c, i) => c.reduce((s, x, k) => s + Math.abs(x - P.px[i][k]), 0));
    ok(dP.every(d => d <= 10) && dS.every(d => d <= 10) && off.every(d => d <= 8) && apart.every(d => d > 60), 'Move and zoom’s preview as drawn: the header’s pixels at each stripe on Photo and on Photo + stripes (its stripes 0.82 x their colour + 0.18 x the photo)', { photo: P.px, header: hP, stripes: S.px, headerS: hS, want: want.map(w => w.map(Math.round)), dP, dS, off, apart }); }
  // a later photo keeps the rider's look (only the first photo switches it to Photo) and starts centred at 1x; one chosen on Stripes only shows
  // as Photo; one chosen on Photo stays Photo
  await openSheet(p); await p.click('#jhpMoveBtn'); await p.waitForTimeout(300); await p.focus('#jhpStage'); await p.keyboard.press('Equal'); await p.keyboard.press('ArrowUp'); await p.click('#jhpMDone'); await p.waitForTimeout(300);
  { const hm = await header(p), hn = await pickWait(p, photo('dark.jpg')), c = await cls(p), chk = await p.$eval('#jHdr input[name=jhpStyle]:checked', i => i.value).catch(() => '');
    ok(hm.style === 'photo-stripes' && hm.zoom === 1.1 && hm.y !== 50 && hn && hn.style === 'photo-stripes' && hn.photoAt !== h0.photoAt && hn.x === 50 && hn.y === 50 && hn.zoom === 1 && c.includes('jh-photo') && c.includes('jh-pst') && chk === 'photo-stripes', 'a new photo on Photo + stripes keeps Photo + stripes (only the first photo switches the look); its crop starts centred at 1x', { hm, hn, c, chk }); }
  await p.click('#jhpStripes'); await p.waitForTimeout(300);
  { const hs = await pickWait(p, photo('land.jpg')), c = await cls(p); ok(hs && hs.style === 'photo' && c.includes('jh-photo') && !c.includes('jh-pst'), 'a new photo chosen on Stripes only: the header shows it, as Photo', { hs, c }); }
  { const hp = await pickWait(p, photo('spot.jpg')), c = await cls(p); ok(hp && hp.style === 'photo' && c.includes('jh-photo') && !c.includes('jh-pst'), 'a new photo on Photo stays Photo', { hp, c }); }
  await p.click('#jhpDone'); await p.waitForTimeout(300);
  ok(o.errors.length === 0, 'styles: no errors', o.errors); await o.close();
});

/* ---------------------------------------------------------------- Move and zoom (point 4) */
section('move', async () => {
  const o = await local(); const p = o.p; await journal(p); await pickWait(p, photo('land.jpg'));
  const H0 = await header(p);
  await p.focus('#jhpMoveBtn'); await p.keyboard.press('Enter'); await p.waitForTimeout(500); /* (from the keyboard: the preview shows its ring) */
  const g = await p.evaluate(() => { const s = document.getElementById('jhpStage'), r = s.getBoundingClientRect(), h = document.getElementById('jHero').getBoundingClientRect(), m = document.querySelector('#jHdrMove>.sheet').getBoundingClientRect();
    return { w: r.width, h: r.height, hw: h.width, sheet: [m.width, m.height, innerWidth, innerHeight], img: (s.querySelector('img').getAttribute('src') || '').slice(0, 5), focus: document.activeElement.id, z: document.getElementById('jhpZoom').value, labels: ['jhpZoom', 'jhpX', 'jhpY'].map(i => document.querySelector('label[for=' + i + ']').textContent), vt: document.getElementById('jhpX').getAttribute('aria-valuetext'), role: s.getAttribute('role'), name: s.getAttribute('aria-label'), desc: document.getElementById(s.getAttribute('aria-describedby')).textContent.length }; });
  ok(g.w === g.hw && g.h === 230 && g.img === 'blob:', 'preview: the header’s exact shape (its width, 230 px) with the photo', g);
  ok(g.sheet[0] === g.sheet[2] && g.sheet[1] === g.sheet[3], 'a full-screen sheet', g.sheet);
  ok(g.focus === 'jhpStage' && g.role === 'group' && g.name && g.desc > 20, 'focus on the preview, named and described', g);
  ok(g.labels.join('|') === 'Zoom|Left and right|Up and down' && g.vt === 'Centred', 'Zoom and position sliders, labelled, with spoken values', g);
  // the ring as drawn: the preview focused and not, pixel by pixel (over the photo, which covers the whole preview)
  const ringPx = async () => { const fv = await p.$eval('#jhpStage', s => s.matches(':focus-visible')), a = await p.locator('#jhpStage').screenshot(); await p.$eval('#jhpStage', s => s.blur()); await p.waitForTimeout(60); const b = await p.locator('#jhpStage').screenshot(); await p.focus('#jhpStage'); await p.waitForTimeout(60); return { fv, changed: await pxDiff(p, a, b) }; };
  const ring = await ringPx(); ok(ring.fv && ring.changed > 1000, 'a visible focus ring on the preview (drawn over the photo)', ring);
  await p.emulateMedia({ forcedColors: 'active' }); const ring2 = await ringPx(); await p.emulateMedia({ forcedColors: 'none' });
  ok(ring2.fv && ring2.changed > 1000, 'the focus ring stays in forced colours', ring2);
  // nothing outside the preview is redrawn while it is worked
  await p.evaluate(() => { window.__q91m = 0; new MutationObserver(r => { window.__q91m += r.length; }).observe(document.getElementById('view-journal'), { subtree: true, childList: true, attributes: true });
    window.__q91fit = 0; new MutationObserver(r => r.forEach(x => { if (/(^|\s)fit-m(\s|$)/.test(x.oldValue || '')) window.__q91fit++; })).observe(document.documentElement, { attributes: true, attributeFilter: ['class'], attributeOldValue: true }); }); /* (the app's larger-text refit, fitAll, marks <html> fit-m while it runs) */
  const settings0 = await p.evaluate(() => localStorage.getItem('bluebird.settings.v2'));
  const box = await p.$eval('#jhpStage', s => { const r = s.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const drag = async (dx, dy) => { await p.mouse.move(box.x + box.w / 2, box.y + box.h / 2); await p.mouse.down(); for (let i = 1; i <= 10; i++) await p.mouse.move(box.x + box.w / 2 + i * dx / 10, box.y + box.h / 2 + i * dy / 10); await p.mouse.up(); await p.waitForTimeout(100); };
  const pos = () => p.evaluate(() => ({ x: +document.getElementById('jhpX').value, y: +document.getElementById('jhpY').value, z: +document.getElementById('jhpZoom').value, op: document.querySelector('#jhpStage img').style.objectPosition, mut: window.__q91m, fit: window.__q91fit, set: localStorage.getItem('bluebird.settings.v2'), hero: document.querySelector('#jHero .jh-ph img').style.objectPosition }));
  await drag(-60, -12); const d1 = await pos(); /* land.jpg (3:2) in the 390 x 230 header: 30 px to spare up and down, none sideways at 1x */
  ok(d1.x === 50 && Math.abs(d1.y - 90) < 1, 'drag up 12 px: the photo follows the finger (y by 12 of the 30 px that overflow: 90%; nothing to move sideways at 1x)', { x: d1.x, y: d1.y, op: d1.op });
  ok(d1.mut === 0 && d1.fit === 0 && d1.set === settings0 && d1.hero === '50% 50%', 'while dragging: no save, the header and the rest of the Journal untouched (no refit of the app: fitAll never ran)', { mut: d1.mut, fit: d1.fit, hero: d1.hero });
  await p.focus('#jhpStage'); await p.keyboard.press('Equal'); await p.keyboard.press('Equal'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(80);
  const d2 = await p.evaluate(() => ({ z: +document.getElementById('jhpZoom').value, y: +document.getElementById('jhpY').value, zt: document.getElementById('jhpZoom').getAttribute('aria-valuetext'), tr: document.querySelector('#jhpStage img').style.transform }));
  ok(Math.abs(d2.z - 1.2) < .001 && Math.abs(d2.y - (d1.y - 2)) < 1 && /scale\(1\.2\)/.test(d2.tr) && d2.zt === '1.2 times', 'keys: + zooms 0.1, an arrow moves 2%', d2);
  await drag(-20, 0); const d1b = await pos(); ok(Math.abs(d1b.x - 75.6) < 1.5, 'zoomed in (1.2x: 78 px to spare sideways): a drag 20 px left moves it to about 76%', { x: d1b.x });
  await p.focus('#jhpZoom'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(80);
  const d3 = await p.evaluate(() => ({ z: +document.getElementById('jhpZoom').value, tr: document.querySelector('#jhpStage img').style.transform, out: document.getElementById('jhpZoomO').textContent }));
  ok(Math.abs(d3.z - 1.3) < .001 && /scale\(1\.3\)/.test(d3.tr) && d3.out === '1.3×', 'the Zoom slider by keyboard', d3);
  await p.focus('#jhpX'); await p.keyboard.press('Home'); await p.waitForTimeout(60); ok((await p.$eval('#jhpX', e => +e.value)) === 0 && /^0% /.test(await p.$eval('#jhpStage img', e => e.style.objectPosition)), 'the position slider by keyboard');
  // a trackpad pinch (ctrl + wheel) and a touch pinch (two fingers apart)
  await p.mouse.move(box.x + 100, box.y + 100); await p.keyboard.down('Control'); await p.mouse.wheel(0, -40); await p.keyboard.up('Control'); await p.waitForTimeout(100);
  const z4 = await p.$eval('#jhpZoom', e => +e.value); ok(z4 > 1.3, 'trackpad pinch zooms', z4);
  const cdp = await o.ctx.newCDPSession(p), cx = box.x + box.w / 2, cy = box.y + box.h / 2, tp = (d) => [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(30) }); for (const d of [40, 55, 70, 90]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(d) }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(120);
  const z5 = await p.$eval('#jhpZoom', e => +e.value); ok(z5 > z4 + .3, 'touch pinch zooms', { z4, z5 });
  // point 4: zoom 1 to 3 times, by every way in, and no further either way (read off the preview while it is open, as the rider sees it)
  const zr = await p.$eval('#jhpZoom', e => [e.min, e.max]); ok(zr[0] === '1' && zr[1] === '3', 'the Zoom slider runs from 1 to 3 times', zr);
  const zs = () => p.evaluate(() => ({ z: +document.getElementById('jhpZoom').value, tr: document.querySelector('#jhpStage img').style.transform, vt: document.getElementById('jhpZoom').getAttribute('aria-valuetext'), out: document.getElementById('jhpZoomO').textContent }));
  const at3 = s => s.z === 3 && s.tr === 'scale(3)' && s.vt === '3 times' && s.out === '3\u00d7', at1 = s => s.z === 1 && s.tr === '' && s.vt === '1 times' && s.out === '1\u00d7', pinch = async (a, b) => { const tq = d => [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }]; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tq(a) }); for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tq(a + (b - a) * i / 6) }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(120); };
  const zx = {}; await p.focus('#jhpStage'); for (let i = 0; i < 30; i++) await p.keyboard.press('Equal'); await p.waitForTimeout(80); zx.plus = await zs();
  await pinch(10, 180); zx.pinchOut = await zs(); await p.mouse.move(box.x + 100, box.y + 100); await p.keyboard.down('Control'); await p.mouse.wheel(0, -600); await p.keyboard.up('Control'); await p.waitForTimeout(120); zx.wheelIn = await zs();
  await p.focus('#jhpZoom'); await p.keyboard.press('Home'); await p.waitForTimeout(80); zx.home = await zs(); await p.keyboard.press('End'); await p.waitForTimeout(80); zx.end = await zs();
  await p.focus('#jhpStage'); for (let i = 0; i < 30; i++) await p.keyboard.press('Minus'); await p.waitForTimeout(80); zx.minus = await zs();
  await p.keyboard.press('Equal'); await p.waitForTimeout(60); await pinch(150, 10); zx.pinchIn = await zs(); await p.keyboard.press('Equal'); await p.mouse.move(box.x + 100, box.y + 100); await p.keyboard.down('Control'); await p.mouse.wheel(0, 600); await p.keyboard.up('Control'); await p.waitForTimeout(120); zx.wheelOut = await zs();
  ok(at3(zx.plus) && at3(zx.pinchOut) && at3(zx.wheelIn) && at3(zx.end) && at1(zx.home) && at1(zx.minus) && at1(zx.pinchIn) && at1(zx.wheelOut), 'zoom stops at exactly 3 times (+ held, a wide pinch, a trackpad pinch, End) and at 1 (− held, a pinch in, a trackpad pinch out, Home): the slider, the preview and the spoken value agree', zx);
  ok((await p.evaluate(() => window.__q91fit)) === 0, 'keys, the sliders and pinches: still no refit of the app');
  // slow pinches add up and a touch pinch follows the fingers (nothing rounded between its steps): 60 trusted ctrl + wheel steps of -0.3 (a
  // gentle trackpad pinch, as Chrome sends it: asks e^0.18, 1.197x), two fingers spread slowly from 120 to 160 px (60 steps: 1.333x) and
  // quickly from 120 to 200 px (8 steps: 1.667x); a mouse wheel notch with ctrl (100) zooms at most 1.65x; while Safari's own pinch runs
  // (gesturestart to gestureend) only it zooms, though the fingers' pointers move too (on an iPhone both come; read off the preview's scale)
  { const zNow = () => p.$eval('#jhpStage img', i => { const m = /scale\(([\d.]+)\)/.exec(i.style.transform); return m ? +m[1] : 1; }), z1 = async () => { await p.focus('#jhpZoom'); await p.keyboard.press('Home'); await p.waitForTimeout(80); };
    const tq = d => [{ x: cx - d / 2, y: cy, id: 1 }, { x: cx + d / 2, y: cy, id: 2 }], spread = async (a, b, n) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tq(a) }); for (let i = 1; i <= n; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tq(a + (b - a) * i / n) }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(120); };
    const ge = (t, s) => p.$eval('#jhpStage', (e, [t, s]) => { const v = new Event(t, { cancelable: true }); Object.defineProperty(v, 'scale', { value: s }); e.dispatchEvent(v); }, [t, s]), sp = {};
    await z1(); for (let i = 0; i < 60; i++) await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: cx, y: cy, deltaX: 0, deltaY: -0.3, modifiers: 2 }); await p.waitForTimeout(120); sp.wheel = await zNow();
    await z1(); await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: cx, y: cy, deltaX: 0, deltaY: -100, modifiers: 2 }); await p.waitForTimeout(120); sp.notch = await zNow();
    await z1(); await spread(120, 160, 60); sp.slow = await zNow(); await z1(); await spread(120, 200, 8); sp.fast = await zNow();
    await z1(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tq(120) }); await ge('gesturestart', 1);
    for (let i = 1; i <= 10; i++) { await ge('gesturechange', 1 + .5 * i / 10); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tq(120 + 120 * i / 10) }); }
    await p.waitForTimeout(150); /* (the fingers' last pointer moves handled before the pinch ends, as on a phone) */ await ge('gestureend', 1.5); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(120); sp.safari = await zNow(); await z1();
    ok(Math.abs(sp.wheel - 1.197) < .02 && sp.notch > 1.5 && sp.notch < 1.7 && Math.abs(sp.slow - 1.333) < .02 && Math.abs(sp.fast - 1.667) < .02 && Math.abs(sp.safari - 1.5) < .01, 'slow pinches add up: 60 gentle trackpad steps (1.20x asked), two fingers spread slowly (1.33x) or quickly (1.67x) zoom as far as asked; a ctrl + mouse wheel notch at most 1.65x; Safari’s own pinch alone zooms (its fingers’ pointers never zoom it twice)', sp); }
  await p.screenshot({ path: path.join(SHOTS, 'move-and-zoom-390.png') });
  // Cancel and Escape drop it; Done saves it
  await p.click('#jhpMCancel'); await p.waitForTimeout(300);
  ok(JSON.stringify(await header(p)) === JSON.stringify(H0) && (await p.evaluate(() => document.activeElement.id)) === 'jhpMoveBtn' && (await sheetOpen(p)), 'Cancel drops it (back in the Header sheet, on Move and zoom)');
  await p.click('#jhpMoveBtn'); await p.waitForTimeout(300); ok((await p.$eval('#jhpZoom', e => +e.value)) === 1, 'opened again: from the saved place');
  await p.click('#jhpMDone'); await p.waitForTimeout(300); ok(JSON.stringify(await header(p)) === JSON.stringify(H0), 'Done with nothing moved writes nothing (no new edit time)', await header(p));
  await p.click('#jhpMoveBtn'); await p.waitForTimeout(300);
  await p.focus('#jhpStage'); await p.keyboard.press('Equal'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok(JSON.stringify(await header(p)) === JSON.stringify(H0) && !(await p.$eval('#jHdrMove', m => m.classList.contains('open'))) && (await sheetOpen(p)), 'Escape drops it and closes only Move and zoom');
  await p.click('#jhpMoveBtn'); await p.waitForTimeout(300); await p.focus('#jhpStage');
  for (const k of ['Equal', 'Equal', 'Equal', 'ArrowLeft', 'ArrowLeft', 'ArrowUp']) await p.keyboard.press(k);
  await p.click('#jhpMDone'); await p.waitForTimeout(300); const H1 = await header(p);
  ok(H1.zoom === 1.3 && H1.x === 54 && H1.y === 52 && H1.updatedAt > H0.updatedAt && H1.photoAt === H0.photoAt, 'Done saves x, y and zoom', H1);
  const shown = await p.$eval('#jHero .jh-ph img', e => [e.style.objectPosition, e.style.transform, e.style.transformOrigin]);
  ok(shown[0] === '54% 52%' && shown[1] === 'scale(1.3)' && shown[2] === '54% 52%', 'the header: object-position plus scale', shown);
  // the compact bar (point 5: the photo cropped to 54 px) and the sheet's Photo and Photo + stripes thumbnails show the same crop as the header
  const crops = () => p.evaluate(() => ['#jHero .jh-ph img', '#jFold .jh-cph img', '#jHdr [data-jhp-st="photo"] .jhp-tv img', '#jHdr [data-jhp-st="photo-stripes"] .jhp-tv img'].map(s => { const e = document.querySelector(s); return e ? [e.style.objectPosition, e.style.transform, e.style.transformOrigin].join(' | ') : 'none'; }));
  { const c = await crops(); ok(c.every(x => x === '54% 52% | scale(1.3) | 54% 52%'), 'the compact bar and the Photo and Photo + stripes thumbnails have the header’s crop', c); }
  // the bar as drawn: scrolled into view, against the same bar with its photo at 1x, centred (a crop not applied, or undone by a rule, draws the same)
  await p.click('#jhpDone'); await p.waitForTimeout(300); await p.evaluate(() => scrollTo(0, 260)); await p.waitForTimeout(450);
  { const clip = await p.$eval('#jFold', b => { const r = b.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; }), a = await p.screenshot({ clip }); /* (land.jpg at 54% 52% 1.3x: the sun drawn larger and the horizon moved, about 900 px; the same crop not applied: none) */
    await p.$eval('#jFold .jh-cph img', i => { i.dataset.q91 = i.getAttribute('style') || ''; i.style.objectPosition = '50% 50%'; i.style.transformOrigin = '50% 50%'; i.style.transform = 'none'; }); await p.waitForTimeout(80);
    const b = await p.screenshot({ clip }); await p.$eval('#jFold .jh-cph img', i => { i.setAttribute('style', i.dataset.q91); delete i.dataset.q91; }); const n = await pxDiff(p, a, b);
    ok(n > 250, 'the compact bar as drawn: the saved crop (' + n + ' of ' + Math.round(clip.width * clip.height) + ' px differ from the photo at 1x, centred)', { n, clip }); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
  await reload(p); await p.waitForTimeout(600); await journal(p);
  await until(() => p.$eval('#jHero .jh-ph img', e => (e.getAttribute('src') || '').startsWith('blob:') || null), 8000);
  const again = await p.$eval('#jHero .jh-ph img', e => [e.style.objectPosition, e.style.transform, (e.getAttribute('src') || '').slice(0, 5)]);
  ok(again[0] === '54% 52%' && again[1] === 'scale(1.3)' && again[2] === 'blob:', 'it sticks after a reload', again);
  await p.click('#jhCam'); await p.waitForTimeout(400);
  { const c = await crops(); ok(c.every(x => x === '54% 52% | scale(1.3) | 54% 52%'), '  … the compact bar and the thumbnails (the sheet opened again) too', c); }
  await p.click('#jhpDone'); await p.waitForTimeout(300);
  // the screen turns while Move and zoom is open: the preview follows the header (both ways); nothing scrolls sideways; Done keeps the place
  const fit = () => p.evaluate(() => { const s = document.getElementById('jhpStage').getBoundingClientRect(), h = document.getElementById('jHero').getBoundingClientRect(), m = document.querySelector('#jHdrMove>.sheet'); return { stage: [Math.round(s.width), Math.round(s.height)], hero: [Math.round(h.width), Math.round(h.height)], sw: m.scrollWidth, cw: m.clientWidth, vw: innerWidth }; });
  for (const [a, b] of [[[844, 390], [390, 844]], [[390, 844], [844, 390]]]) {
    await p.setViewportSize({ width: a[0], height: a[1] }); await p.waitForTimeout(300); await openSheet(p); await p.click('#jhpMoveBtn'); await p.waitForTimeout(400);
    const f0 = await fit(); await p.setViewportSize({ width: b[0], height: b[1] }); await p.waitForTimeout(500); const f1 = await fit();
    ok(f0.stage[0] === f0.hero[0] && f1.stage[0] === f1.hero[0] && f1.stage[1] === Math.max(230, f1.hero[1]) && f1.sw <= f1.cw, 'Move and zoom open while the screen turns ' + a.join('x') + ' \u2192 ' + b.join('x') + ': the preview is the header\u2019s shape again, nothing cut off', { f0, f1 });
    await p.click('#jhpMDone'); await p.waitForTimeout(300); const H2 = await header(p); ok(H2.zoom === 1.3 && H2.x === 54 && H2.y === 52, '  \u2026 and Done keeps the place', H2);
    await p.click('#jhpDone'); await p.waitForTimeout(300);
  }
  // a short screen (a phone on its side, or the 320 x 256 reflow size): the sheet scrolls; each slider can be seen whole when it has focus
  for (const [w, h] of [[568, 320], [320, 256]]) {
    await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(300); await openSheet(p); await p.click('#jhpMoveBtn'); await p.waitForTimeout(400);
    const seen = []; for (const id of ['jhpZoom', 'jhpX', 'jhpY']) { await p.focus('#' + id); await p.waitForTimeout(120); seen.push(await p.evaluate(i => { const r = document.getElementById(i).getBoundingClientRect(), d = document.getElementById('jhpMDone').getBoundingClientRect(); const e = document.getElementById(i); return { id: i, top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, hit: document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2) === e, done: d.top >= 0 && d.bottom <= innerHeight }; }, id)); }
    ok(seen.every(x => x.top >= 0 && x.bottom <= x.vh && x.hit && x.done), w + 'x' + h + ': every slider in full view when focused, Done still in reach', seen);
    await p.click('#jhpMCancel'); await p.waitForTimeout(300); await p.click('#jhpDone'); await p.waitForTimeout(300);
  }
  ok(o.errors.length === 0, 'move: no errors', o.errors); await o.close();
});

/* ---------------------------------------------------------------- Remove photo (local) */
section('remove', async () => {
  const o = await local(); const p = o.p; await journal(p); const h = await pickWait(p, photo('land.jpg'));
  const seen = []; let accept = false; p.on('dialog', d => { seen.push(d.message()); accept ? d.accept() : d.dismiss(); });
  await p.click('#jhpRemove'); await p.waitForTimeout(300);
  ok(seen.length === 1 && (await header(p)).photoAt === h.photoAt && (await idbPhoto(p)), 'Remove photo asks first; No keeps it', seen);
  accept = true; await p.click('#jhpRemove'); await p.waitForTimeout(500);
  const k = await header(p), r = await idbPhoto(p), c = await cls(p);
  ok(k.style === 'stripes' && k.photoAt === 0 && k.goneAt === h.photoAt && !r && !c.includes('jh-photo'), 'Remove photo: back to the stripes, the copy here deleted (goneAt names it)', { k, r: !!r });
  ok((await p.$eval('#jhpRmBox', b => b.hidden)) && (await p.evaluate(() => document.activeElement && document.activeElement.value)) === 'stripes', 'Remove photo row gone; focus on the chosen look');
  ok(o.errors.length === 0, 'remove: no errors', o.errors); await o.close();
});

/* ---------------------------------------------------------------- Back up / Restore (local) */
section('backup', async () => {
  const o = await local(); const p = o.p; await journal(p); const h = await pickWait(p, photo('land.jpg'));
  await p.click('label[data-jhp-st="photo-stripes"]'); await p.waitForTimeout(200);
  await p.click('#jhpMoveBtn'); await p.waitForTimeout(300); await p.focus('#jhpStage'); for (const k of ['Equal', 'Equal', 'Equal', 'ArrowLeft', 'ArrowLeft', 'ArrowUp']) await p.keyboard.press(k); await p.click('#jhpMDone'); await p.waitForTimeout(300); /* (the rider's own crop: the backup carries it) */
  await p.click('#jhpDone'); await p.waitForTimeout(300);
  const c = await header(p), crop = k => !!k && k.x === c.x && k.y === c.y && k.zoom === c.zoom, moved = !(c.x === 50 && c.y === 50 && c.zoom === 1);
  const r = await idbPhoto(p);
  const file = await p.evaluate(() => new Promise(res => { const a = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { HTMLAnchorElement.prototype.click = a; fetch(this.href).then(x => x.text()).then(res); }; document.getElementById('backupDownload').click(); }));
  const d = JSON.parse(file), b64 = d.headerPhoto && d.headerPhoto.jpeg;
  ok(b64 && Buffer.from(b64, 'base64').equals(r.bytes) && d.settings.journalHeader.style === 'photo-stripes' && moved && crop(d.settings.journalHeader), 'Download a backup carries the photo (the stored JPEG) and the setting (its look and the crop from Move and zoom)', { has: !!b64, crop: [c.x, c.y, c.zoom], file: d.settings.journalHeader });
  await o.close();
  // restore on a device without a photo
  const o2 = await local(); const p2 = o2.p; const msgs = dialogs(p2);
  const restore = async (pp, data) => { const f = path.join(HERE, 'photos', 'q91-backup.json'); fs.writeFileSync(f, JSON.stringify(data)); await pp.setInputFiles('#backupFile', f); };
  await restore(p2, d); const h2 = await until(async () => { const k = await header(p2); return k && k.photoAt ? k : null; }, 15000); const r2 = await idbPhoto(p2);
  ok(h2 && h2.style === 'photo-stripes' && crop(h2) && h2.photoAt > h.photoAt && r2 && r2.at === h2.photoAt, 'Restore: the photo comes back (re-encoded: a new photo time), its style and its crop too', h2);
  await journal(p2);
  { const sh = await p2.evaluate(() => ['#jHero .jh-ph img', '#jFold .jh-cph img'].map(s => { const e = document.querySelector(s); return [e.style.objectPosition, e.style.transform, (e.getAttribute('src') || '').slice(0, 5)]; }));
    ok(sh.every(x => x[0] === c.x + '% ' + c.y + '%' && x[1] === 'scale(' + c.zoom + ')' && x[2] === 'blob:'), 'the restored header and compact bar show the photo with that crop', sh); }
  ok(r2 && r2.bytes.length <= 400 * 1024 && !segments(r2.bytes).some(s => (s.m >= 0xE1 && s.m <= 0xEF) || s.m === 0xFE), 'the restored photo is a plain JPEG of at most 400 KB', r2 && r2.bytes.length);
  // a backup photo over 1 MB is refused
  const big = JSON.parse(JSON.stringify(d)); big.headerPhoto.jpeg = fs.readFileSync(photo('land.jpg')).toString('base64');
  const before = await header(p2); await restore(p2, big); await p2.waitForTimeout(2500);
  ok(JSON.stringify(await header(p2)) === JSON.stringify(before) && /too big/.test(await p2.$eval('#toast', t => t.textContent)), 'a backup photo over 1 MB is not taken', await p2.$eval('#toast', t => t.textContent));
  // an older backup with no header keeps this device's photo; one whose header has no photo removes it
  const old = JSON.parse(JSON.stringify(d)); delete old.headerPhoto; delete old.settings.journalHeader;
  await restore(p2, old); await p2.waitForTimeout(1200);
  ok((await header(p2)).photoAt === before.photoAt && (await idbPhoto(p2)), 'an older backup without a header keeps this device’s photo');
  const none = JSON.parse(JSON.stringify(d)); delete none.headerPhoto; none.settings.journalHeader = { style: 'stripes', x: 50, y: 50, zoom: 1, updatedAt: 5, photoAt: 0, goneAt: 0 };
  await restore(p2, none); await p2.waitForTimeout(1200); const k3 = await header(p2);
  ok(k3.photoAt === 0 && k3.style === 'stripes' && k3.goneAt >= before.photoAt && !(await idbPhoto(p2)), 'a backup whose header has no photo: no photo here either (and goneAt names the one removed)', k3);
  ok(msgs.length >= 4, 'each restore asked first', msgs.length);
  ok(o2.errors.length === 0, 'backup: no errors', o2.errors); await o2.close();
});

/* ---------------------------------------------------------------- contrast (AA) */
// the compact bar (scrolled into view) away from its title, at x 30 and x 60 (left of it at every width here), as drawn and with its tint
// (--jh-ca) set to 0: the most any colour channel differs (away), the tint, and the title band's background
async function barBand(p) {
  const ca = +(await p.$eval('#view-journal', v => v.style.getPropertyValue('--jh-ca'))) || 0, bg = await p.$eval('#jFold .jh-cbt>span', s => getComputedStyle(s).backgroundColor).catch(() => 'no band');
  const pts = await p.$eval('#jFold', b => { const r = b.getBoundingClientRect(); return [{ x: r.left + 30, y: r.top + 27 }, { x: r.left + 60, y: r.top + 40 }]; });
  const a = await pxAt(p, await p.screenshot({ scale: 'css' }), pts);
  await p.$eval('#view-journal', v => { v.dataset.q91ca = v.style.getPropertyValue('--jh-ca'); v.style.setProperty('--jh-ca', '0'); }); await p.waitForTimeout(80);
  const b = await pxAt(p, await p.screenshot({ scale: 'css' }), pts); await p.$eval('#view-journal', v => { v.style.setProperty('--jh-ca', v.dataset.q91ca); delete v.dataset.q91ca; });
  return { ca, bg, a, b, away: Math.max(...a.map((c, i) => Math.max(...c.map((v, k) => Math.abs(v - b[i][k]))))) };
}
section('contrast', async () => {
  const o = await local({ dpr: 2, motion: true }); const p = o.p; await journal(p); /* (motion on: the parallax slides the stripes) */
  const res = {};
  for (const [f, sty] of [['bright.jpg', 'photo'], ['dark.jpg', 'photo'], ['spot.jpg', 'photo'], ['leftpatch.jpg', 'photo'], ['land.jpg', 'photo-stripes'], ['bright.jpg', 'photo-stripes'], ['dark.jpg', 'photo-stripes']]) {
    await pickWait(p, photo(f)); await p.click('label[data-jhp-st="' + sty + '"]'); await p.click('#jhpDone'); await p.waitForTimeout(700);
    const a = +(await p.$eval('#view-journal', v => getComputedStyle(v).getPropertyValue('--jh-a'))) || 0, ca = +(await p.$eval('#view-journal', v => getComputedStyle(v).getPropertyValue('--jh-ca'))) || 0, cr = await textContrast(p, '#jHero .jh-t');
    res[f + ' ' + sty] = { a, ca, cr: cr && +cr.toFixed(2) };
    ok(cr >= 3, `"My Journal" over ${f} (${sty}): AA for its large text (${cr && cr.toFixed(2)}:1, scrim ${a})`, res[f + ' ' + sty]);
    if (sty === 'photo-stripes') { // the parallax slides the stripes under the title as the page scrolls
      for (const y of [40, 80, 105]) { /* (past 110 px the compact bar comes over the title) */ await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(250); const tr = await p.$eval('#jHero .jh-stripes', e => e.style.translate), c2 = await textContrast(p, '#jHero .jh-t'); ok(c2 >= 3 && tr, `  … scrolled ${y} px: the stripes slid ${tr} under it (${c2 && c2.toFixed(2)}:1)`); }
      await p.evaluate(() => scrollTo(0, 260)); await p.waitForTimeout(400);
      const cb = await textContrast(p, '#jFold .jh-cbt'); ok(cb >= 4.5, `compact bar title over ${f}: AA (${cb && cb.toFixed(2)}:1)`);
      const band = await barBand(p); ok(band.away <= 6 && (band.ca === 0 || band.bg === 'rgba(0, 0, 0, ' + band.ca + ')'), `compact bar over ${f}: its tint (${band.ca}) is a band behind its title only; away from the title the bar is the photo with its fade, as with no tint`, band);
      await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    }
    await p.click('#jhCam'); await p.waitForTimeout(350);
  }
  ok(res['bright.jpg photo'].a > 0 && res['spot.jpg photo'].a > 0 && res['dark.jpg photo'].a === 0, 'the scrim shows only where the photo is bright (a small bright spot counts; a dark photo has none)', res);
  ok(res['bright.jpg photo'].ca > 0 && res['land.jpg photo-stripes'].ca > 0 && res['dark.jpg photo'].ca === 0 && res['leftpatch.jpg photo'].ca === 0 && res['dark.jpg photo-stripes'].ca === 0, 'the compact bar\u2019s tint is measured under its own title: none where the photo under "My Journal" is dark (a bright patch elsewhere in the bar, or its stripes, do not count)', res);
  const bg = await p.$eval('#view-journal', v => { v.classList.add('q91'); return getComputedStyle(v.querySelector('#jHero .jh-t')).backgroundColor; });
  ok(/rgba\(0, 0, 0, 0\.\d+\)/.test(bg), 'the scrim is black behind the title only', bg);
  // Move and zoom's title has the header's scrim (spot.jpg: a small bright spot under the title), measured again once the photo is moved,
  // and the header gets the same value after Done
  const steady = async fn => { let last, n = 0; for (let i = 0; i < 60 && n < 4; i++) { const v = await fn(); if (v !== '' && v === last) n++; else n = 0; last = v; await sleep(200); } return last; }; /* (a value that has stopped changing) */
  const heroA = () => p.evaluate(() => document.getElementById('view-journal').style.getPropertyValue('--jh-a'));
  await pickWait(p, photo('spot.jpg')); await p.click('label[data-jhp-st="photo"]'); await p.click('#jhpDone');
  const sa = +(await steady(heroA));
  await p.click('#jhCam'); await p.waitForTimeout(350); await p.click('#jhpMoveBtn'); await p.waitForTimeout(500);
  const mv = await p.evaluate(() => ({ a: +document.getElementById('jhpStage').style.getPropertyValue('--jh-a'), bg: getComputedStyle(document.querySelector('#jhpStage .jhp-mt')).backgroundColor })), mcr = await textContrast(p, '#jhpStage .jhp-mt');
  ok(sa > 0 && mv.a === sa && mv.bg === 'rgba(0, 0, 0, ' + sa + ')' && mcr >= 3, `Move and zoom: its "My Journal" has the header\u2019s scrim (${sa}) and is AA too (${mcr && mcr.toFixed(2)}:1)`, { sa, mv, mcr });
  await p.focus('#jhpStage'); for (let i = 0; i < 5; i++) await p.keyboard.press('Equal');
  const ma = await until(() => p.evaluate(a => { const v = +document.getElementById('jhpStage').style.getPropertyValue('--jh-a'); return v !== a ? { v } : null; }, sa), 6000); await p.waitForTimeout(800);
  const mfin = await p.evaluate(() => +document.getElementById('jhpStage').style.getPropertyValue('--jh-a')); await p.click('#jhpMDone');
  await until(() => p.evaluate(a => { const v = document.getElementById('view-journal').style.getPropertyValue('--jh-a'); return v !== '' && +v !== a ? 1 : null; }, sa), 10000); const hfin = +(await steady(heroA));
  ok(ma && hfin != null && mfin === hfin, 'Move and zoom: zoomed in (the spot moves off the title), the preview\u2019s scrim is measured again; after Done the header has the same', { sa, moved: ma, preview: mfin, header: hfin });
  await p.click('#jhpDone'); ok(o.errors.length === 0, 'contrast: no errors', o.errors); await o.close();
});

/* ---------------------------------------------------------------- item 90's motion with a photo, Reduce Motion, print (point 6) */
section('motion', async () => {
  for (const sty of ['photo', 'photo-stripes', 'stripes']) {
    const o = await local({ motion: true }); const p = o.p; await journal(p); await pickWait(p, photo('land.jpg'));
    if (sty !== 'photo') await p.click(sty === 'stripes' ? '#jhpStripes' : 'label[data-jhp-st="photo-stripes"]'); await p.click('#jhpDone'); await p.waitForTimeout(300);
    if (sty !== 'stripes') { await until(() => p.$eval('#view-journal', v => v.style.getPropertyValue('--jh-a') !== '' || null), 8000); await p.waitForTimeout(300); } /* (the tint measured, and kept) */
    await p.click('nav.tabs button[data-view=plan]'); await reload(p); await p.waitForTimeout(500); // a cold open
    const hk = await header(p); ok(hk && hk.photoAt > 0 && hk.style === sty, sty + ': setup: the reload keeps the header setting', hk);
    await p.evaluate(() => { window.__q91lt = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__q91lt.push(Math.round(e.duration)))).observe({ type: 'longtask' }); } catch (e) {} });
    await p.click('nav.tabs button[data-view=journal]');
    const samp = () => p.evaluate(() => { const H = document.getElementById('jHero'), ph = H.querySelector('.jh-ph'), pol = H.querySelector('.jh-s1'), cam = H.querySelector('.jh-cam>span');
      return { cls: H.className, ph: +getComputedStyle(ph).opacity, phT: getComputedStyle(ph).transitionDuration, phd: getComputedStyle(ph).display, phr: Math.round(ph.getBoundingClientRect().top), pol: getComputedStyle(pol).transform, cam: getComputedStyle(cam).transform, camo: +getComputedStyle(cam).opacity, sv: getComputedStyle(H.querySelector('.jh-stripes')).display, a: document.getElementById('view-journal').style.getPropertyValue('--jh-a') }; });
    const s = []; for (let i = 0; i < 8; i++) { s.push(await samp()); await p.waitForTimeout(60); } await p.waitForTimeout(1300); const end = await samp();
    const armed = s.some(x => /jm-(arm|go)/.test(x.cls));
    ok(armed && !/jm-/.test(end.cls), sty + ': item 90’s entrance plays once on the cold open', { first: s[0].cls, end: end.cls });
    ok(s.some(x => x.cam !== 'none' && x.cam !== 'matrix(1, 0, 0, 1, 0, 0)') && s.some(x => x.camo < 1) && (end.cam === 'none' || end.cam === 'matrix(1, 0, 0, 1, 0, 0)') && end.camo === 1, sty + ': the camera pops with the +', s.map(x => [x.cam, x.camo]));
    if (sty === 'photo') { ok(s.some(x => x.ph < .9) && end.ph === 1 && s.every(x => x.sv === 'none') && s.some(x => /jm-go/.test(x.cls)) && s.every(x => !/jm-go/.test(x.cls) || x.phT === '0.4s'), 'Photo: no stripes; the photo fades in (0 → 1, 400 ms)', s.map(x => [x.ph, x.phT])); }
    const lt = await p.evaluate(() => Math.max(0, ...(window.__q91lt || [])));
    if (sty !== 'stripes') ok(s.some(x => /jm-(arm|go)/.test(x.cls) && x.a !== '') && lt < 200, sty + ': the tint measured on an earlier open is used at once (no measuring while the entrance plays: its longest task ' + lt + ' ms)', s.map(x => [x.cls.replace('jhero', '').trim(), x.a]));
    if (sty === 'photo-stripes') { ok(s.some(x => x.pol !== 'none') && end.pol === 'none' && s.every(x => x.ph === 1 && x.phr === s[0].phr), 'Photo + stripes: only the stripes sweep; the photo stays still', s.map(x => [x.pol.slice(0, 20), x.ph])); }
    if (sty === 'stripes') { ok(s.some(x => x.pol !== 'none') && s.every(x => x.phd === 'none'), 'Stripes: the sweep as before, no photo', s.map(x => x.pol.slice(0, 20))); }
    // the scroll: parallax on the stripes only, the compact bar with the photo, + New entry, a list sliding in. The photo stays as drawn: its
    // box and its image's, against the header's (full bleed), the same before and after the scroll, by any property that could move them
    const phBox = () => p.evaluate(() => { const H = document.getElementById('jHero'), ph = H.querySelector('.jh-ph'), img = ph.querySelector('img'), h = H.getBoundingClientRect(), R = e => { const r = e.getBoundingClientRect(); return [r.left - h.left, r.top - h.top, r.right - h.left, r.bottom - h.top].map(v => Math.round(v * 2) / 2).join(' '); }, T = e => { const c = getComputedStyle(e); return [c.transform, c.translate, c.scale, c.rotate].join(' / '); };
      return { hero: [0, 0, h.width, h.height].map(v => Math.round(v * 2) / 2).join(' '), ph: R(ph), img: R(img), t: [T(ph), T(img)] }; });
    const pb0 = await phBox();
    await p.evaluate(() => scrollTo(0, 100)); await p.waitForTimeout(250);
    const sc = await p.evaluate(() => { const H = document.getElementById('jHero'); return { tr: H.querySelector('.jh-stripes').style.translate, ph: getComputedStyle(H.querySelector('.jh-ph')).transform, img: H.querySelector('.jh-ph img').style.translate || '', t: H.querySelector('.jh-t').style.scale }; });
    const pb1 = await phBox(), still = sty === 'stripes' || (pb0.ph === pb0.hero && pb1.ph === pb1.hero && pb1.img === pb0.img && pb1.t.join() === pb0.t.join() && pb1.t.every(x => x === 'none / none / none / none'));
    ok(parseFloat(sc.tr) === -45 && +sc.t < 1 && sc.ph === 'none' && !sc.img && still, sty + ': scroll: the stripes slide, the title shrinks, the photo stays (its box the header\u2019s, its image where it was)', { sc, before: pb0, after: pb1 });
    await p.evaluate(() => scrollTo(0, 220)); await p.waitForTimeout(350);
    const bar = await p.evaluate(() => { const b = document.getElementById('jFold'); return { vis: b.classList.contains('jf-vis'), on: b.classList.contains('on'), img: getComputedStyle(b.querySelector('.jh-cph')).display, h: Math.round(b.getBoundingClientRect().height) }; });
    ok(bar.vis && bar.on && bar.img === (sty === 'stripes' ? 'none' : 'block') && bar.h === 54, sty + ': the compact bar pins (photo cropped to 54 px when there is one)', bar);
    const tap = async sel => { const b = await p.$eval(sel, e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); await p.mouse.click(b[0], b[1]); }; /* (a fixed bar: a plain tap where it is) */
    await tap('#jFold [data-jh-add]'); await p.waitForTimeout(450);
    ok(await p.evaluate(() => document.getElementById('jNew').classList.contains('open') && document.documentElement.classList.contains('jne-lock')), sty + ': the bar’s + opens New entry (page held)');
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await tap('#jFold [data-jh-cam]'); await p.waitForTimeout(450);
    ok(await p.evaluate(() => document.getElementById('jHdr').classList.contains('open') && document.documentElement.classList.contains('jne-lock') && document.querySelector('#jFold [data-jh-cam]').getAttribute('aria-expanded') === 'true'), sty + ': the bar’s camera opens Header (page held)');
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(250);
    await p.click('[data-jh-open=all]'); await p.waitForTimeout(90);
    const sl = await p.evaluate(() => { const g = document.querySelector('#view-journal .jh-ghost'); return { moving: document.getElementById('view-journal').classList.contains('jl-moving'), ghost: !!g, img: g ? (g.querySelector('.jh-ph img') || { getAttribute: () => '' }).getAttribute('src') || '' : '', cam: g ? g.querySelectorAll('[data-jh-cam],[id]').length : -1 }; });
    ok(sl.moving && sl.ghost && sl.cam === 0 && (sty === 'stripes' || sl.img.startsWith('blob:')), sty + ': a list slides in over the home’s picture (with its photo, no ids)', sl);
    await p.waitForTimeout(900); await p.click('#jBack'); await p.waitForTimeout(900);
    ok(!(await p.$eval('#jHero', e => e.hidden)) && (await cls(p)).includes('jh-photo') === (sty !== 'stripes'), sty + ': Back to the home, the look kept');
    // print: the photo does not print
    if (sty !== 'stripes') {
      await p.emulateMedia({ media: 'print' });
      const pr = await p.evaluate(() => { const H = document.getElementById('jHero'); return { ph: getComputedStyle(H.querySelector('.jh-ph')).display, sv: getComputedStyle(H.querySelector('.jh-stripes')).display, svo: getComputedStyle(H.querySelector('.jh-stripes')).opacity, h: getComputedStyle(H).minHeight, cam: getComputedStyle(H.querySelector('.jh-cam')).display }; });
      ok(pr.ph === 'none' && pr.sv === 'block' && pr.svo === '1' && pr.h === '200px' && pr.cam === 'none', sty + ': print: no photo, the stripes header', pr);
      await p.emulateMedia({ media: 'screen' });
    }
    ok(o.errors.length === 0, sty + ' motion: no errors', o.errors); await o.close();
  }
  // Reduce Motion: everything lands at once
  const o = await local(); const p = o.p; await journal(p); await pickWait(p, photo('land.jpg')); await p.click('#jhpDone');
  await p.click('nav.tabs button[data-view=plan]'); await reload(p); await p.waitForTimeout(500); await p.click('nav.tabs button[data-view=journal]');
  const rm = []; for (let i = 0; i < 6; i++) { rm.push(await p.evaluate(() => { const H = document.getElementById('jHero'); return { cls: H.className, ph: +getComputedStyle(H.querySelector('.jh-ph')).opacity, cam: getComputedStyle(H.querySelector('.jh-cam>span')).transform }; })); await p.waitForTimeout(50); }
  ok(rm.every(x => !/jm-/.test(x.cls) && x.ph === 1 && (x.cam === 'none')), 'Reduce Motion: nothing armed; the photo and the camera at once', rm);
  await p.click('#jhCam'); await p.waitForTimeout(100);
  ok(await sheetOpen(p), 'Reduce Motion: the sheet still opens'); await p.keyboard.press('Escape');
  ok(o.errors.length === 0, 'reduce motion: no errors', o.errors); await o.close();
});

// the compact bar's title as shown (scrolled past the header): lines, whole (no ellipsis), clear of the camera, the camera beside the +
const barLook = p => p.evaluate(() => { const t = document.querySelector('#jFold .jh-cbt'), r = document.createRange(); r.selectNodeContents(t.querySelector('span') || t); /* (the letters: not the band's padding round them) */ const lines = new Set([...r.getClientRects()].map(x => Math.round(x.top))).size, b = document.getElementById('jFold').getBoundingClientRect(), cam = document.querySelector('#jFold .jh-cam').getBoundingClientRect(), add = document.querySelector('#jFold .jh-add').getBoundingClientRect(), tr = r.getBoundingClientRect();
  return { lines, vis: document.getElementById('jFold').classList.contains('jf-vis'), h: Math.round(b.height), whole: t.scrollWidth <= t.clientWidth, font: getComputedStyle(t).fontSize, title: [Math.round(tr.left), Math.round(tr.right)], clear: tr.right <= cam.left + 1 || tr.width < 1, cam: [Math.round(cam.width), Math.round(cam.height)], camx: [Math.round(cam.left), Math.round(cam.right)], gap: Math.round(add.left - cam.right), line: Math.abs(cam.top - add.top) < 1 }; });
/* ---------------------------------------------------------------- 320 px at 200% text, targets, keyboard and names */
section('small', async () => {
  for (const [w, sc] of [[390, 1], [320, 2]]) {
    const o = await local({ width: w, scale: sc }); const p = o.p; await journal(p); await pickWait(p, photo('land.jpg'));
    const tag = w + ' px' + (sc > 1 ? ' at 200%' : '') + ': ';
    const chk = () => p.evaluate(() => { const vw = document.documentElement.clientWidth, over = [...document.querySelectorAll('#jHdr .sheet *, #jHdrMove .sheet *, #view-journal *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && e.getClientRects().length && (r.right > vw + 1 || r.left < -1) && !e.closest('.jh-stripes,.jh-cst,svg,.jh-ph,.jh-cph,.jhp-stage'); }).map(e => e.className || e.tagName).slice(0, 5);
      const small = [...document.querySelectorAll('#jHdr button, #jHdr label.jhp-th, #jHdrMove button, #jHdrMove input, #jhCam, #jNoteAdd')].filter(e => e.getClientRects().length && !e.disabled).map(e => { const r = e.getBoundingClientRect(); return { id: e.id || e.className, w: Math.round(r.width), h: Math.round(r.height) }; }).filter(r => r.w < 44 || r.h < 44);
      return { sw: document.scrollingElement.scrollWidth, vw, over, small }; });
    let c = await chk(); ok(c.sw <= c.vw && !c.over.length, tag + 'the Header sheet: no sideways scroll, nothing cut off', c);
    ok(!c.small.length, tag + 'Header sheet: every target at least 44 px', c.small);
    await p.click('#jhpMoveBtn'); await p.waitForTimeout(400); c = await chk();
    const shape = await p.evaluate(() => { const s = document.getElementById('jhpStage').getBoundingClientRect(), h = document.getElementById('jHero').getBoundingClientRect(); return [Math.round(s.width), Math.round(s.height), Math.round(h.width), Math.round(h.height)]; });
    ok(shape[0] === shape[2] && shape[1] === Math.max(230, shape[3]), tag + 'the preview is the header\u2019s exact shape (larger text makes both taller)', shape);
    ok(c.sw <= c.vw && !c.over.length && !c.small.length, tag + 'Move and zoom: fits, targets 44 px', c);
    const ttl = await p.evaluate(() => { const r = document.createRange(); r.selectNodeContents(document.getElementById('jhpMT')); const d = document.getElementById('jhpMDone').getBoundingClientRect(), x = document.getElementById('jhpMCancel').getBoundingClientRect();
      return { lines: [...r.getClientRects()].map(q => ({ l: Math.round(q.left), r: Math.round(q.right), t: Math.round(q.top), b: Math.round(q.bottom) })), done: [Math.round(d.left), Math.round(d.top), Math.round(d.bottom)], cancel: [Math.round(x.right), Math.round(x.top), Math.round(x.bottom)] }; });
    ok(ttl.lines.length && (ttl.lines.every(q => q.l >= ttl.cancel[0] - 1 && q.r <= ttl.done[0] + 1) || ttl.lines.every(q => q.t >= Math.max(ttl.done[2], ttl.cancel[2]) - 1)), tag + 'Move and zoom: the title between Cancel and Done, or on its own row under them (never into their columns)', ttl);
    if (sc > 1) await p.screenshot({ path: path.join(SHOTS, 'move-and-zoom-320-200.png') });
    await p.click('#jhpMDone'); await p.waitForTimeout(300); await p.click('#jhpDone'); await p.waitForTimeout(300);
    await p.evaluate(() => scrollTo(0, 400)); await p.waitForTimeout(400);
    const bar = await barLook(p);
    ok(bar.vis && bar.lines === 1 && bar.whole && bar.clear && bar.cam[0] >= 44 && bar.cam[1] >= 44 && bar.gap >= 0 && bar.gap <= 8 && bar.line, tag + 'compact bar: "My Journal" whole on one line (no ellipsis), clear of the camera; the camera and + 44 px, side by side', bar);
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    const hero = await p.evaluate(() => { const H = document.getElementById('jHero'), t = H.querySelector('.jh-t').getBoundingClientRect(), cam = H.querySelector('.jh-cam').getBoundingClientRect(); return { sw: document.scrollingElement.scrollWidth, vw: document.documentElement.clientWidth, overlap: t.top < cam.bottom && t.right > cam.left }; });
    ok(hero.sw <= hero.vw && !hero.overlap, tag + 'the header: fits, the title clear of the buttons', hero);
    if (w === 320) await p.screenshot({ path: path.join(SHOTS, 'photo-320-200.png') });
    ok(o.errors.length === 0, tag + 'no errors', o.errors); await o.close();
  }
  // the compact bar's title at more text sizes (no photo needed: its place does not change with one)
  for (const [w, sc] of [[390, 2.0625], [375, 2.0625], [320, 1.35], [320, 2.5]]) {
    const o = await local({ width: w, scale: sc }); const p = o.p; await journal(p); await p.evaluate(() => scrollTo(0, 400)); await p.waitForTimeout(400);
    const bar = await barLook(p); ok(bar.vis && bar.lines === 1 && bar.whole && bar.clear, w + ' px at ' + Math.round(sc * 100) + '%: compact bar: "My Journal" whole on one line, clear of the camera', bar); await o.close();
  }
  // the Header sheet at larger text, up to iOS's largest (AX4 47 px, AX5 53 px; the test font is wider than iOS's): every caption inside its
  // own look (the looks three to a row as in the picture at 100% and at 390 px at 200%, then fewer), nothing scrolls sideways, "Header" clear of
  // Done (beside it or on its own row under it)
  for (const [w, roots] of [[390, [16, 32, 40, 47, 53]], [375, [40, 47, 53]], [320, [25.6, 32, 47, 53]]]) {
    const o = await local({ width: w }); const p = o.p; await journal(p); const res = [];
    for (const rp of roots) {
      await p.evaluate(r => { document.documentElement.style.fontSize = r + 'px'; }, rp); await p.waitForTimeout(250); await p.click('#jhCam'); await p.waitForTimeout(400);
      res.push(Object.assign({ root: rp }, await p.evaluate(() => { const S = document.querySelector('#jHdr .jhp-sheet'), th = [...document.querySelectorAll('#jHdr .jhp-th')], D = document.getElementById('jhpDone').getBoundingClientRect(), t = document.createRange(); t.selectNodeContents(document.getElementById('jhpT'));
        const out = th.map(l => { const b = l.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(l.querySelector('.jhp-tl')); return [...rg.getClientRects()].filter(q => q.left < b.left - 1 || q.right > b.right + 1).map(q => Math.round(q.right - b.right)); }).flat();
        return { cols: [3, 3, 2, 1][new Set(th.map(e => Math.round(e.getBoundingClientRect().top))).size], out, sw: S.scrollWidth, cw: S.clientWidth, dsw: document.scrollingElement.scrollWidth, vw: document.documentElement.clientWidth, title: [...t.getClientRects()].every(q => q.right <= D.left + 1 || q.top >= D.bottom - 1) }; })));
      if (rp === 53) await p.screenshot({ path: path.join(SHOTS, 'sheet-' + w + '-53px.png') });
      await p.click('#jhpDone'); await p.waitForTimeout(250);
    }
    ok(res.every(r => !r.out.length && r.sw <= r.cw && r.dsw <= r.vw && r.title) && res.every(r => r.root > (w > 320 ? 32 : 25.6) || r.cols === 3), w + ' px, text ' + roots.join(', ') + ' px: the Header sheet’s captions each inside its look, no sideways scroll, "Header" clear of Done (three looks to a row up to ' + (w > 320 ? '200%' : '160%') + ')', res);
    ok(o.errors.length === 0, w + ' px larger text sheet: no errors', o.errors); await o.close();
  }
  // Move and zoom's title is the header's: the same lines, place and width at any text size (390 px at 200% and at iOS's largest, 53 px;
  // 320 px at 160%; 393 and 402 px at iOS's AX2, 33 px)
  for (const [w, roots] of [[390, [32, 53]], [320, [25.6]], [393, [33]], [402, [33]]]) {
    const o = await local({ width: w }); const p = o.p; await journal(p); await pickWait(p, photo('land.jpg')); await p.click('#jhpDone'); await p.waitForTimeout(300);
    for (const rp of roots) {
      await p.evaluate(r => { document.documentElement.style.fontSize = r + 'px'; }, rp); await p.waitForTimeout(300); await p.click('#jhCam'); await p.waitForTimeout(350); await p.click('#jhpMoveBtn'); await p.waitForTimeout(450);
      const r = await p.evaluate(() => { const tx = (e, box) => { const rg = document.createRange(); rg.selectNodeContents(e); const q = [...rg.getClientRects()], b = box.getBoundingClientRect(); return { lines: new Set(q.map(x => Math.round(x.top))).size, top: Math.round(Math.min(...q.map(x => x.top)) - b.top), l: Math.round(Math.min(...q.map(x => x.left)) - b.left), r: Math.round(Math.max(...q.map(x => x.right)) - b.left), h: Math.round(b.height) }; };
        return { hero: tx(document.querySelector('#jHero .jh-t'), document.getElementById('jHero')), prev: tx(document.querySelector('#jhpStage .jhp-mt'), document.getElementById('jhpStage')) }; });
      ok(['lines', 'top', 'l', 'r', 'h'].every(k => Math.abs(r.hero[k] - r.prev[k]) <= 1), w + ' px, text ' + rp + ' px: Move and zoom\u2019s "My Journal" is the header\u2019s (' + r.hero.lines + ' line' + (r.hero.lines > 1 ? 's' : '') + ', the same place and width)', r);
      await p.click('#jhpMCancel'); await p.waitForTimeout(250); await p.click('#jhpDone'); await p.waitForTimeout(250);
    }
    ok(o.errors.length === 0, w + ' px titles: no errors', o.errors); await o.close();
  }
  // the tint measured at 200% text (the title on two lines: about 7 times the pixels of 100%) in short tasks, on a slow phone (CPU x4); the
  // last few measures kept, so going back to a look (or the way the screen was turned) does not measure again
  { const o = await local({ width: 390, scale: 2, dpr: 3 }); const p = o.p; await journal(p); await pickWait(p, photo('land.jpg')); await p.click('#jhpDone');
    const scrimRec = () => p.evaluate(() => new Promise(res => { const q = indexedDB.open('fred-journal'); q.onsuccess = () => { const g = q.result.transaction('header').objectStore('header').get('scrim'); g.onsuccess = () => res(g.result || null); g.onerror = () => res(null); }; q.onerror = () => res(null); }));
    const a1 = await until(() => p.evaluate(() => document.getElementById('view-journal').style.getPropertyValue('--jh-a') || null), 15000); await until(async () => { const s = await scrimRec(); return s && s.length === 1 ? 1 : null; }, 5000);
    await p.click('#jhCam'); await p.waitForTimeout(400); await p.evaluate(() => { window.__q91lt = []; new PerformanceObserver(l => l.getEntries().forEach(e => window.__q91lt.push(Math.round(e.duration)))).observe({ type: 'longtask' }); });
    const cdp = await o.ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await p.click('label[data-jhp-st="photo-stripes"]'); const sc2 = await until(async () => { const s = await scrimRec(); return s && s.length === 2 ? s : null; }, 30000);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 }); const lt = await p.evaluate(() => window.__q91lt);
    ok(sc2 && Math.max(0, ...lt) < 150, '390 px at 200%, CPU x4: a fresh measure (Photo + stripes, five slides) runs in short tasks (longest ' + Math.max(0, ...lt) + ' ms)', { lt, kept: sc2 && sc2.map(x => x.a) });
    await p.evaluate(() => { window.__q91lt = []; }); await p.click('label[data-jhp-st="photo"]'); await p.waitForTimeout(500);
    const back = await p.evaluate(() => document.getElementById('view-journal').style.getPropertyValue('--jh-a')), sc3 = await scrimRec();
    ok(back === a1 && sc2 && sc3 && sc3.length === 2 && sc2.every(x => sc3.some(y => y.k === x.k)), 'back to Photo: its tint at once, from the measures kept (two kept, none taken again)', { a1, back, kept: sc3 && sc3.length });
    await p.click('#jhpDone'); ok(o.errors.length === 0, '200% measure: no errors', o.errors); await o.close(); }
  // keyboard and screen readers
  const o = await local(); const p = o.p; await journal(p);
  await p.focus('#jhCam'); await p.keyboard.press('Enter'); await p.waitForTimeout(450);
  let a = await p.evaluate(() => ({ open: document.getElementById('jHdr').classList.contains('open'), f: document.activeElement.name + ':' + document.activeElement.value, inert: document.querySelector('main, header, nav.tabs') ? [...document.body.children].filter(e => e.inert).length : 0 }));
  ok(a.open && a.f === 'jhpStyle:stripes' && a.inert > 0, 'keyboard: Enter on the camera opens Header, focus on the chosen look, the page behind inert', a);
  await p.keyboard.press('Tab'); a = await p.evaluate(() => document.activeElement.id); ok(a === 'jhpChoose', 'Tab: from the looks to Choose photo (disabled looks skipped)', a);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  a = await p.evaluate(() => ({ open: document.getElementById('jHdr').classList.contains('open'), f: document.activeElement.id, exp: document.getElementById('jhCam').getAttribute('aria-expanded') }));
  ok(!a.open && a.f === 'jhCam' && a.exp === 'false', 'Escape closes it, focus back on the camera', a);
  // Choose photo from the keyboard: focus stays in the sheet while the photo is made ready and after (Escape still closes it)
  await p.focus('#jhCam'); await p.keyboard.press('Enter'); await p.waitForTimeout(450); await p.keyboard.press('Tab');
  const fcs = []; await p.exposeFunction('q91focus', t => fcs.push(t)); await p.evaluate(() => document.getElementById('jHdr').addEventListener('focusout', e => { if (!e.relatedTarget || !document.getElementById('jHdr').contains(e.relatedTarget)) window.q91focus((e.target.id || e.target.tagName) + ' -> ' + (e.relatedTarget ? e.relatedTarget.id || e.relatedTarget.tagName : 'nothing')); }));
  const fcw = p.waitForEvent('filechooser'); await p.waitForTimeout(200); /* (the chooser's interception is switched on before the key goes: Playwright asks for it without waiting, and a key press, unlike a click, can reach the page first; the chooser then opens unseen) */
  await p.keyboard.press('Enter'); const fc = await fcw; await fc.setFiles(photo('land.jpg'));
  const kh = await until(async () => { const k = await header(p); return k && k.photoAt ? k : null; }, 20000); await p.waitForTimeout(300);
  a = await p.evaluate(() => ({ inside: document.getElementById('jHdr').contains(document.activeElement), f: document.activeElement.id || document.activeElement.name }));
  ok(kh && a.inside && !fcs.length, 'keyboard: Choose photo, Enter, a photo: focus stays in the sheet throughout', { a, left: fcs });
  await p.keyboard.press('Escape'); await p.waitForTimeout(400); ok(!(await sheetOpen(p)) && (await p.evaluate(() => document.activeElement.id)) === 'jhCam', '  \u2026 and Escape still closes it, back on the camera');
  await p.focus('#jhCam'); await p.keyboard.press('Enter'); await p.waitForTimeout(450);
  await p.focus('input[name=jhpStyle]:checked'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(250);
  a = await header(p); ok(a.style === 'photo-stripes' && (await cls(p)).includes('jh-pst'), 'arrow keys move through the looks and apply them', a.style);
  await p.focus('input[name=jhpStyle]:checked'); const ring = await p.$eval('input[name=jhpStyle]:checked', i => { const s = getComputedStyle(i.closest('.jhp-th').querySelector('.jhp-tv')); return [s.outlineStyle, s.outlineWidth, s.outlineColor]; });
  ok(ring[0] === 'solid' && parseFloat(ring[1]) >= 3 && ring[2] === 'rgb(13, 13, 13)', 'a focused look has a black 3 px ring', ring);
  const ck = await p.$eval('#jHdr .jhp-th:has(input:checked) .jhp-ck', e => getComputedStyle(e).display); ok(ck === 'grid', 'the chosen look also has a check (not colour alone)', ck);
  const snap = await p.locator('#jHdr .sheet').ariaSnapshot();
  const at = x => snap.indexOf(x), order = ['radio "Photo"', 'radio "Photo + stripes"', 'radio "Stripes"', 'button "Choose photo"', 'button "Move and zoom"', 'button "Stripes only"', 'button "Remove photo"'].map(at);
  ok(/radio "Photo"/.test(snap) && /radio "Photo \+ stripes" \[checked\]/.test(snap) && /radio "Stripes"/.test(snap) && /button "Choose photo"/.test(snap) && /button "Move and zoom"/.test(snap) && /button "Remove photo"/.test(snap) && order.every((v, i) => v >= 0 && (!i || v > order[i - 1])), 'screen reader: the looks are radios with names, the rows buttons, in order (Remove photo last)', { order, snap: snap.split('\n').slice(0, 14) });
  await p.keyboard.press('Escape'); ok(o.errors.length === 0, 'keyboard: no errors', o.errors); await o.close();
});

/* ---------------------------------------------------------------- sync: Storage path, a second device, photoAt */
section('sync', async () => {
  const be = new Backend(); ALL_REQ.push(be.log);
  const A = await synced(be, { label: 'A' }); const p = A.p; await p.waitForTimeout(1200);
  ok(!be.modReq.includes('storage'), 'no photo, nothing to do: the Storage SDK is not even loaded', be.modReq);
  const h = await pickWait(p, photo('land.jpg'));
  const up = await until(() => be.st.get('users/u1/journal-header.jpg'), 15000), r = await until(async () => { const x = await idbPhoto(p); return x && x.up === 'u1' ? x : null; }, 10000);
  ok(up && up.at === String(h.photoAt) && up.ct === 'image/jpeg' && up.bytes.equals(r.bytes), 'uploaded to users/{uid}/journal-header.jpg: the stored JPEG, image/jpeg, its photoAt as metadata', up && { at: up.at, ct: up.ct, n: up.bytes.length });
  ok(r && r.up === 'u1', 'this device notes it is up (up = the uid)', r && r.up);
  const doc = await until(() => { const d = be.fs.get('users/u1'); return d && d.settings && d.settings.journalHeader && d.settings.journalHeader.photoAt === h.photoAt ? d : null; }, 10000);
  ok(doc && JSON.stringify(doc.settings.journalHeader) === JSON.stringify(h), 'the setting syncs with the settings (photoAt names the photo)', doc && doc.settings.journalHeader);
  ok(be.modReq.filter(m => m === 'storage').length === 1 && be.log.filter(x => /firebase-storage\.js$/.test(x.url)).every(x => x.url.includes('/firebasejs/10.14.1/')), 'the Storage SDK loaded lazily, the same pinned version');
  const urls = be.log.filter(x => x.storage).map(x => x.storage.op); ok(!be.log.some(x => /getDownloadURL|token=/.test(x.url)), 'never a download URL', urls);
  // a second device
  const B = await synced(be, { label: 'B', athlete: null }); await journal(B.p);
  const rb = await until(async () => { const x = await idbPhoto(B.p); return x && x.at === h.photoAt ? x : null; }, 20000);
  ok(rb && rb.bytes.equals(r.bytes) && rb.up === 'u1', 'a second signed-in device gets the same photo (getBlob), keeps it in its own IndexedDB', rb && rb.at);
  ok((await cls(B.p)).includes('jh-photo') && (await B.p.$eval('#jHero .jh-ph img', e => (e.getAttribute('src') || '').slice(0, 5))) === 'blob:', 'and shows it', await cls(B.p));
  await B.p.screenshot({ path: path.join(SHOTS, 'second-device-390.png') });
  // a newer photo on B wins on A; A never sends an older one over it. A has Move and zoom open (a zoom not yet saved) when it comes
  await openSheet(p); await p.click('#jhpMoveBtn'); await p.waitForTimeout(300); await p.focus('#jhpStage'); await p.keyboard.press('Equal'); await p.keyboard.press('Equal');
  const hb = await pickWait(B.p, photo('dark.jpg')); await until(() => { const s = be.st.get('users/u1/journal-header.jpg'); return s && s.at === String(hb.photoAt); }, 15000);
  await sleep(2200); await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(400);
  await sleep(9000); await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  const ra = await until(async () => { const x = await idbPhoto(p); return x && x.at === hb.photoAt ? x : null; }, 20000);
  ok(ra && (await header(p)).photoAt === hb.photoAt, 'B’s newer photo comes to A (its pull, then getBlob)', ra && ra.at);
  const mz = await until(async () => { const k = await header(p), v = await p.evaluate(() => ({ open: document.getElementById('jHdrMove').classList.contains('open'), inside: document.getElementById('jHdr').contains(document.activeElement), note: document.getElementById('jhpNote').textContent })); return !v.open ? Object.assign(v, { k }) : null; }, 8000);
  const ka = await header(p);
  ok(mz && mz.inside && /another device/.test(mz.note) && ka.photoAt === hb.photoAt && ka.zoom === 1 && ka.x === 50 && ka.y === 50, 'Move and zoom open on A when B\u2019s newer photo lands: it closes (focus in the sheet, a note says why); the zoom made on the old photo is not saved onto the new one', { mz, ka });
  // Move and zoom on A syncs to B, the photo itself is not sent again
  const nUp = be.log.filter(x => x.storage && x.storage.op === 'upload').length;
  await openSheet(p); await p.click('#jhpMoveBtn'); await p.waitForTimeout(300); await p.focus('#jhpStage'); await p.keyboard.press('Equal'); await p.click('#jhpMDone'); await p.click('#jhpDone');
  await sleep(2500); await sleep(8000); await B.p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  const zb = await until(async () => { const k = await header(B.p); return k && k.zoom === 1.1 ? k : null; }, 15000);
  ok(zb && zb.photoAt === hb.photoAt && be.log.filter(x => x.storage && x.storage.op === 'upload').length === nUp, 'Move and zoom reaches B; the photo is not uploaded again', zb);
  // A has Move and zoom open (nothing moved) when B changes the crop and the look of the same photo: A's preview follows; Done on A then
  // writes nothing over B's newer crop
  await openSheet(p); await p.click('#jhpMoveBtn'); await p.waitForTimeout(300);
  await openSheet(B.p); await B.p.click('label[data-jhp-st="photo-stripes"]'); await B.p.waitForTimeout(200); await B.p.click('#jhpMoveBtn'); await B.p.waitForTimeout(300); await B.p.focus('#jhpStage');
  for (let i = 0; i < 4; i++) await B.p.keyboard.press('Equal'); await B.p.click('#jhpMDone'); await B.p.click('#jhpDone'); await B.p.waitForTimeout(200); const kb = await header(B.p);
  const fol = await settle([p], async () => { const v = await p.evaluate(() => ({ open: document.getElementById('jHdrMove').classList.contains('open'), tr: document.querySelector('#jhpStage img').style.transform, sv: getComputedStyle(document.querySelector('#jhpStage svg')).display, z: +document.getElementById('jhpZoom').value })); return v.open && v.tr === 'scale(1.5)' && v.sv !== 'none' && v.z === 1.5 ? v : null; }, 40000); /* (the stripes as computed: a rule that hides them counts) */
  ok(kb.zoom === 1.5 && kb.style === 'photo-stripes' && fol, 'Move and zoom open on A (nothing moved) when B changes the crop and the look of the same photo: A\u2019s preview follows (zoom 1.5, the stripes)', { kb, fol });
  await p.click('#jhpMDone'); await p.waitForTimeout(300); const ka2 = await header(p);
  ok(ka2.zoom === 1.5 && ka2.style === 'photo-stripes' && ka2.updatedAt === kb.updatedAt, '  \u2026 and Done on A with nothing moved writes nothing: B\u2019s newer crop stays', { ka2, kb });
  // B has the Header sheet open, the focus on Move and zoom, when A chooses a new photo: B's Move and zoom is off until the photo comes; the
  // focus stays in the sheet (not dropped to the page) and Escape still closes it
  await openSheet(B.p); await B.p.focus('#jhpMoveBtn'); const hn = await pickWait(p, photo('spot.jpg')); await p.click('#jhpDone');
  ok(hn && hn.style === 'photo-stripes', 'A chooses a new photo on Photo + stripes: the look stays Photo + stripes', hn);
  const fb = await settle([B.p], async () => { const k = await header(B.p); return k && k.photoAt === hn.photoAt ? 1 : null; }, 40000); await B.p.waitForTimeout(1500);
  const bf = await B.p.evaluate(() => { const a = document.activeElement; return { tag: a.tagName, id: a.id || a.value || '', inside: document.getElementById('jHdr').contains(a), open: document.getElementById('jHdr').classList.contains('open') }; });
  await B.p.keyboard.press('Escape'); await B.p.waitForTimeout(400); const bc = await sheetOpen(B.p);
  ok(fb && bf.open && bf.inside && !bc, 'the Header sheet open on B, the focus on Move and zoom, when A chooses a new photo: the focus stays in the sheet, and Escape still closes it', { bf, closed: !bc });
  ok(A.errors.length === 0 && B.errors.length === 0, 'sync: no errors', [A.errors, B.errors]); await A.close(); await B.close();
  // Firestore hands a map's keys back sorted: a pull that brings nothing new writes nothing back (and asks Storage nothing)
  { const be = new SortedBackend(); ALL_REQ.push(be.log); const A2 = await synced(be, { label: 'A' }); const p2 = A2.p; await p2.waitForTimeout(800);
    const h2 = await pickWait(p2, photo('land.jpg')); await until(() => be.st.get('users/u1/journal-header.jpg'), 15000); await p2.click('#jhpDone');
    await until(() => { const d = be.fs.get('users/u1'); return d && d.settings && d.settings.journalHeader && d.settings.journalHeader.photoAt === h2.photoAt ? 1 : null; }, 10000); await sleep(3000);
    const commits = () => be.log.filter(x => x.ops && x.ops.length).length, gets = () => be.log.filter(x => /\/mock\/get$/.test(x.url)).length, st = () => be.log.filter(x => x.storage).length;
    const c0 = commits(), g0 = gets(), s0 = st();
    for (let i = 0; i < 2; i++) { await sleep(10500); await p2.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(2500); }
    ok(gets() >= g0 + 2 && commits() === c0 && st() === s0, 'two quiet pulls with the header photo set (keys sorted, as Firestore returns them): nothing written back, Storage not asked', { pulls: gets() - g0, commits: commits() - c0, storage: st() - s0 });
    ok(A2.errors.length === 0, 'sorted keys: no errors', A2.errors); await A2.close(); }
});

/* ---------------------------------------------------------------- the newer photo wins: offline, in flight, Remove */
section('races', async () => {
  // 1. an upload in flight, then Remove: it is deleted when it lands
  { const be = new Backend(); ALL_REQ.push(be.log); const A = await synced(be, { label: 'A' }); const p = A.p; await p.waitForTimeout(800); dialogs(p);
    be.holdUploads = true; const h = await pickWait(p, photo('land.jpg')); await until(() => be.held.length, 10000);
    await p.click('#jhpRemove'); await p.waitForTimeout(300); be.holdUploads = false; be.release();
    const gone = await until(() => !be.st.has('users/u1/journal-header.jpg') && be.log.some(x => x.storage && x.storage.op === 'delete' && x.storage.done) ? 1 : null, 15000);
    const k = await header(p); ok(gone && k.photoAt === 0 && k.goneAt === h.photoAt, 'Remove while the upload is in flight: the upload lands, then it is deleted', { k, st: [...be.st.keys()] });
    ok(A.errors.length === 0, 'in flight + Remove: no errors', A.errors); await A.close(); }
  // 2. a new photo chosen while one goes up: sent after it, never at the same time
  { const be = new Backend(); ALL_REQ.push(be.log); const A = await synced(be, { label: 'A' }); const p = A.p; await p.waitForTimeout(800);
    be.holdUploads = true; await pickWait(p, photo('land.jpg')); await until(() => be.held.length, 10000);
    const h2 = await pickWait(p, photo('dark.jpg')); await sleep(600); const during = be.log.filter(x => x.storage && x.storage.op === 'upload').length;
    be.holdUploads = false; be.release();
    const fin = await until(() => { const s = be.st.get('users/u1/journal-header.jpg'); return s && s.at === String(h2.photoAt) ? s : null; }, 15000);
    const ups = be.log.filter(x => x.storage && x.storage.op === 'upload');
    ok(during === 1 && fin && ups.length === 2 && ups[1].t >= ups[0].storage.landed, 'a new photo while one goes up: it goes up after it (serialised), the newer one stays', { during, n: ups.length });
    ok(A.errors.length === 0, 'in flight + new photo: no errors', A.errors); await A.close(); }
  // 3. an older photo never overwrites a newer one; an offline Remove never deletes another device's newer photo
  { const be = new Backend(); ALL_REQ.push(be.log); const A = await synced(be, { label: 'A' }); const B = await synced(be, { label: 'B', athlete: null }); A.label = 'A'; B.label = 'B'; await A.p.waitForTimeout(800); dialogs(A.p);
    const at = () => (be.st.get('users/u1/journal-header.jpg') || {}).at;
    const h1 = await pickWait(A.p, photo('land.jpg')); await until(() => at() === String(h1.photoAt), 10000);
    ok(await settle([B.p], async () => { const x = await idbPhoto(B.p); return x && x.at === h1.photoAt; }), 'setup: both devices have photo 1');
    await offline(be, A, true);
    const hA = await pickWait(A.p, photo('spot.jpg')); // A, offline: a photo, older than B's next one
    const hB = await pickWait(B.p, photo('dark.jpg')); await until(() => at() === String(hB.photoAt), 10000); await sleep(2200);
    await offline(be, A, false); await sleep(4000);
    const olderUp = be.log.filter(x => x.page === 'A' && x.storage && x.storage.op === 'upload' && new URL(x.url).searchParams.get('at') === String(hA.photoAt));
    ok(hA.photoAt < hB.photoAt && !olderUp.length && at() === String(hB.photoAt), 'A\u2019s older photo (chosen offline) is never sent over B\u2019s newer one', { tried: olderUp.length, at: at() });
    const conv = await settle([A.p, B.p], async () => { const a = await header(A.p), b = await header(B.p), x = await idbPhoto(A.p); return a.photoAt === hB.photoAt && b.photoAt === hB.photoAt && x && x.at === hB.photoAt ? 1 : null; });
    ok(conv, 'both devices settle on the newer photo (B\u2019s), A fetches it', [await header(A.p), await header(B.p)]);
    // A removes it offline; meanwhile B chooses a newer one; A back online must not delete B's
    await offline(be, A, true); await openSheet(A.p); await A.p.click('#jhpRemove'); await A.p.waitForTimeout(300);
    await A.p.click('#jhpDone');
    const hB2 = await pickWait(B.p, photo('bright.jpg')); await until(() => at() === String(hB2.photoAt), 10000); await sleep(2200);
    await offline(be, A, false); await sleep(5000);
    ok(at() === String(hB2.photoAt) && !be.log.some(x => x.page === 'A' && x.storage && x.storage.op === 'delete' && !x.offline), 'an offline Remove on A does not delete B\u2019s newer photo', { at: at(), hB2: hB2.photoAt });
    const c2 = await settle([A.p, B.p], async () => { const a = await header(A.p), b = await header(B.p), x = await idbPhoto(A.p); return a.photoAt === hB2.photoAt && b.photoAt === hB2.photoAt && x && x.at === hB2.photoAt ? 1 : null; });
    ok(c2, 'and both devices end on B\u2019s newer photo', [await header(A.p), await header(B.p)]);
    // A removes it online: gone everywhere
    await openSheet(A.p); await A.p.click('#jhpRemove'); await A.p.waitForTimeout(300); await A.p.click('#jhpDone');
    const c3 = await settle([A.p, B.p], async () => { const b = await header(B.p), x = await idbPhoto(B.p); return !at() && b.photoAt === 0 && !x ? 1 : null; });
    ok(c3, 'a Remove reaches the other device: its copy goes too (a device keeps only the photo the setting names)', [await header(B.p), at()]);
    ok(A.errors.length === 0 && B.errors.length === 0, 'two devices: no errors', [A.errors, B.errors]); await A.close(); await B.close(); }
  // 4. B removes the photo; A, offline (it has not heard), then changes the look: both end on the stripes with no photo, the sheet agreeing
  { const be = new Backend(); ALL_REQ.push(be.log); const A = await synced(be, { label: 'A' }); const B = await synced(be, { label: 'B', athlete: null }); A.label = 'A'; B.label = 'B'; await A.p.waitForTimeout(800); dialogs(B.p);
    const at = () => (be.st.get('users/u1/journal-header.jpg') || {}).at;
    const h1 = await pickWait(A.p, photo('land.jpg')); await until(() => at() === String(h1.photoAt), 10000); await A.p.click('#jhpDone');
    ok(await settle([B.p], async () => { const x = await idbPhoto(B.p); return x && x.at === h1.photoAt; }), 'setup: both devices have the photo');
    await offline(be, A, true); await openSheet(B.p); await B.p.click('#jhpRemove'); await B.p.waitForTimeout(300); await B.p.click('#jhpDone');
    await until(() => !at() ? 1 : null, 10000); await sleep(2200);
    await openSheet(A.p); await A.p.click('label[data-jhp-st="photo-stripes"]'); await A.p.waitForTimeout(300); await A.p.click('#jhpDone');
    await offline(be, A, false);
    const end = await settle([A.p, B.p], async () => { const a = await header(A.p), b = await header(B.p); return a.photoAt === 0 && b.photoAt === 0 && a.goneAt === h1.photoAt && !(await idbPhoto(A.p)) ? [a, b] : null; });
    const looks = []; for (const d of [A, B]) { await openSheet(d.p); looks.push(await d.p.evaluate(() => [...document.querySelectorAll('#jHdr input[name=jhpStyle]')].map(i => i.value + (i.checked ? ':checked' : '') + (i.disabled ? ':disabled' : '')).join(' '))); await d.p.click('#jhpDone'); }
    ok(end && end.every(k => k.style === 'stripes' && k.x === 50 && k.y === 50 && k.zoom === 1) && looks.every(l => l === 'photo:disabled photo-stripes:disabled stripes:checked'), 'a look changed offline after another device removed the photo: both end on the stripes, Stripes the chosen look in the sheet', { end, looks });
    ok(A.errors.length === 0 && B.errors.length === 0, 'look vs Remove: no errors', [A.errors, B.errors]); await A.close(); await B.close(); }
});

/* ---------------------------------------------------------------- Storage not available, retries back off, Remove deletes both */
section('storage', async () => {
  for (const [mode, re] of [['off', /isn.t backed up/], ['nobucket', /isn.t backed up/], ['down', /when fred can reach/]]) {
    const be = new Backend(); ALL_REQ.push(be.log); be.storage = mode; const A = await synced(be, { label: 'A' }); const p = A.p; await p.waitForTimeout(800);
    const sdkN = () => be.log.filter(x => /firebasestorage/.test(x.url) && !(x.storage && x.storage.op === 'probe')).length, probeN = () => be.log.filter(x => x.storage && x.storage.op === 'probe').length; /* (the SDK's requests; the app's plain question: is there a bucket?) */
    if (mode !== 'off') await p.clock.install(); /* (before the first failure: its retry timer is a fake one the test can run forward) */
    const h = await pickWait(p, photo('land.jpg')); await p.waitForTimeout(1500);
    const note = await p.$eval('#jhpNote', n => n.textContent);
    ok(h && (await cls(p)).includes('jh-photo') && re.test(note), 'Storage ' + { off: 'not set up (refused)', nobucket: 'with no bucket yet (README step 10: every SDK request fails at the network, online)', down: 'unreachable' }[mode] + ': the photo works here, one quiet note', note);
    ok(A.errors.length === 0, 'Storage ' + mode + ': nothing else breaks (no errors)', A.errors);
    if (mode === 'nobucket') { await until(() => { const d = be.fs.get('users/u1'); return d && d.settings && d.settings.journalHeader && d.settings.journalHeader.photoAt === h.photoAt ? 1 : null; }, 10000); await p.clock.pauseAt(await p.evaluate(() => Date.now() + 1000)); } /* (the setting in the account; from here A's timers move only when the test runs its clock: its retries are counted below) */
    if (mode !== 'down') { // a second device has the setting but cannot get the photo: its note says so (not that the photo is saved on it)
      const B = await synced(be, { label: 'B', athlete: null }); await journal(B.p);
      const kb = await settle([B.p], async () => { const k = await header(B.p); return k && k.photoAt === h.photoAt ? k : null; }, 30000); await openSheet(B.p);
      const nb = await until(() => B.p.$eval('#jhpNote', n => n.textContent || null), 15000);
      ok(kb && nb && !/saved on this device/.test(nb) && /other device/.test(nb) && /isn.t backed up/.test(nb) && !(await idbPhoto(B.p)), 'Storage ' + (mode === 'off' ? 'not set up' : 'with no bucket yet') + ': the second device, which has not got the photo, says it is on the other device and not backed up yet', nb);
      ok(B.errors.length === 0, 'second device: no errors', B.errors); await B.close();
    }
    if (mode === 'nobucket') { // while there is no bucket a retry asks only whether there is one now (not the SDK, which would wait out its
      // timeout); once the bucket is there (Mark does step 10), the photo goes up at the next retry and the note clears
      const s0 = sdkN(), q0 = probeN(); await p.clock.runFor(31000); await p.waitForTimeout(800); const s1 = sdkN(), q1 = probeN();
      be.storage = 'ok'; await p.clock.runFor(65000); await p.waitForTimeout(800);
      const up = await until(() => { const s = be.st.get('users/u1/journal-header.jpg'); return s && s.at === String(h.photoAt) ? s : null; }, 5000), n2 = await until(() => p.$eval('#jhpNote', n => n.textContent === '' ? 'cleared' : null), 5000);
      ok(q0 >= 1 && s1 === s0 && q1 === q0 + 1 && up && n2, 'no bucket yet: the try 30 s later asks only whether there is one now (no SDK request); once there is, the photo goes up at the next try and the note clears', { s0, s1, q0, q1, up: !!up, n2 });
    }
    if (mode === 'down') { // retries back off: 30 s, then 60 s
      const n0 = sdkN();
      await p.clock.runFor(25000); const n1 = sdkN();
      await p.clock.runFor(10000); await p.waitForTimeout(300); const n2 = sdkN();
      await p.clock.runFor(45000); await p.waitForTimeout(300); const n3 = sdkN();
      await p.clock.runFor(20000); await p.waitForTimeout(300); const n4 = sdkN();
      ok(n1 === n0 && n2 === n1 + 1 && n3 === n2 && n4 === n3 + 1, 'retries back off: one try 30 s later, the next 60 s after that', { n0, n1, n2, n3, n4 });
      // a new photo while Storage is still down (the older work's wait has grown to 120 s): its own retries start at 30 s again
      const h2 = await pickWait(p, photo('dark.jpg')); await p.waitForTimeout(800); const n5 = sdkN();
      be.storage = 'ok'; await p.clock.runFor(32000); await p.waitForTimeout(500);
      const s2 = await until(() => { const s = be.st.get('users/u1/journal-header.jpg'); return s && s.at === String(h2.photoAt) ? s : null; }, 5000);
      ok(n5 === n4 + 1 && s2, 'a new photo while Storage is still down: one try at once, then its retries start at 30 s again (not the older work\u2019s 120 s): Storage back, it goes up 30 s later', { n4, n5, up: !!s2 });
    }
    await A.close();
  }
  { // offline with the Header sheet open, a photo chosen: the note says it goes to the account later; back online it goes up, and the note
    // (the sheet still open) clears
    const be = new Backend(); ALL_REQ.push(be.log); const A = await synced(be, { label: 'A' }); A.label = 'A'; const p = A.p; await p.waitForTimeout(800); await journal(p);
    await offline(be, A, true); await pickWait(p, photo('land.jpg')); await p.waitForTimeout(500); const n1 = await p.$eval('#jhpNote', n => n.textContent);
    await offline(be, A, false); const up = await until(async () => { const x = await idbPhoto(p); return x && x.up === 'u1' ? x : null; }, 15000); await p.waitForTimeout(600);
    const n2 = await p.$eval('#jhpNote', n => n.textContent), open = await sheetOpen(p);
    ok(/when fred can reach/.test(n1) && up && open && n2 === '', 'offline, a photo chosen: the note says it goes to the account when fred can reach it; back online it goes up and the note clears (the sheet still open)', { n1, n2, open, up: !!up });
    ok(A.errors.length === 0, 'offline then online: no errors', A.errors); await A.close(); }
  { // a second device hears of the photo before its upload has landed (not there yet: it waits 30 s, then longer); the upload lands; that
    // device comes back to the front: it looks again at once, not at its next retry
    const be = new Backend(); ALL_REQ.push(be.log); const A = await synced(be, { label: 'A' }); await A.p.waitForTimeout(800);
    be.holdUploads = true; const h = await pickWait(A.p, photo('land.jpg')); await A.p.click('#jhpDone'); await until(() => be.held.length, 10000);
    await until(() => { const d = be.fs.get('users/u1'); return d && d.settings && d.settings.journalHeader && d.settings.journalHeader.photoAt === h.photoAt ? 1 : null; }, 10000);
    const B = await synced(be, { label: 'B', athlete: null }); await journal(B.p); const metaB = () => be.log.filter(x => x.page === 'B' && x.storage && x.storage.op === 'meta').length;
    await until(() => metaB() >= 1 ? 1 : null, 20000); await sleep(500); const m0 = metaB();
    await openSheet(B.p); const nw = await until(() => B.p.$eval('#jhpNote', n => n.textContent || null), 5000); /* (B's Header sheet while it waits) */
    be.holdUploads = false; be.release(); await until(() => be.st.get('users/u1/journal-header.jpg'), 10000);
    const t0 = Date.now(); await B.p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    const got = await until(async () => { const x = await idbPhoto(B.p); return x && x.at === h.photoAt ? x : null; }, 8000), ms = Date.now() - t0;
    ok(m0 === 1 && got && ms < 8000, 'a second device that heard of the photo before its upload landed: back at the front, it looks again at once and gets it (' + ms + ' ms, not at its 30 s retry)', { m0, ms, meta: metaB() });
    const nc = await until(() => B.p.$eval('#jhpNote', n => n.textContent === '' ? 'cleared' : null), 5000);
    ok(nw && /other device/.test(nw) && !/saved on this device|when fred can reach|backed up/.test(nw) && nc, 'while it waits for the other device to send the photo, its Header sheet says the photo is on the other device (not a connection problem); the note clears once the photo comes', { nw, nc });
    ok(A.errors.length === 0 && B.errors.length === 0, 'an upload late to land: no errors', [A.errors, B.errors]); await A.close(); await B.close(); }
  { const be = new Backend(); ALL_REQ.push(be.log); const A = await openSync(NOB, be, { label: 'A', browser }); await A.p.waitForTimeout(600); const h = await pickWait(A.p, photo('land.jpg')); await A.p.waitForTimeout(800);
    ok(h && !be.log.some(x => /firebasestorage|firebase-storage/.test(x.url)), 'no Storage bucket in the config: works on the device, no Storage calls', h && h.photoAt); ok(A.errors.length === 0, 'no bucket: no errors', A.errors); await A.close(); }
  // Remove photo deletes both
  const be = new Backend(); ALL_REQ.push(be.log); const A = await synced(be, { label: 'A' }); const p = A.p; await p.waitForTimeout(800); dialogs(p);
  await pickWait(p, photo('land.jpg')); await until(() => be.st.get('users/u1/journal-header.jpg'), 10000);
  await p.click('#jhpRemove'); const gone = await until(() => !be.st.get('users/u1/journal-header.jpg') ? 1 : null, 10000);
  ok(gone && !(await idbPhoto(p)) && (await header(p)).photoAt === 0, 'Remove photo: deleted here and in Storage');
  const n = be.log.filter(x => /firebasestorage/.test(x.url)).length; await reload(p); await p.waitForTimeout(2500);
  ok(be.log.filter(x => /firebasestorage/.test(x.url)).length === n, 'once Storage is known clean, a reload asks it nothing');
  ok(A.errors.length === 0, 'remove synced: no errors', A.errors); await A.close();
});

/* ---------------------------------------------------------------- restore keeps Storage consistent; delete account; erase; account switch */
section('account', async () => {
  { const be = new Backend(); ALL_REQ.push(be.log); const A = await synced(be, { label: 'A' }); const p = A.p; await p.waitForTimeout(800); dialogs(p);
    const h = await pickWait(p, photo('land.jpg')); await until(() => be.st.get('users/u1/journal-header.jpg'), 10000);
    await p.click('#jhpMoveBtn'); await p.waitForTimeout(300); await p.focus('#jhpStage'); for (const k of ['Equal', 'Equal', 'Equal', 'ArrowLeft', 'ArrowLeft', 'ArrowUp']) await p.keyboard.press(k); await p.click('#jhpMDone'); await p.waitForTimeout(300); /* (the rider's own crop: the restore brings it back) */
    await p.click('#jhpDone'); const c = await header(p);
    const file = await p.evaluate(() => new Promise(res => { const a = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { HTMLAnchorElement.prototype.click = a; fetch(this.href).then(x => x.text()).then(res); }; document.getElementById('backupDownload').click(); }));
    const d = JSON.parse(file), f = path.join(PH, 'q91-backup2.json');
    const none = JSON.parse(file); delete none.headerPhoto; none.settings.journalHeader = { style: 'stripes', x: 50, y: 50, zoom: 1, updatedAt: 9, photoAt: 0, goneAt: 0 };
    fs.writeFileSync(f, JSON.stringify(none)); await p.setInputFiles('#backupFile', f);
    ok(await until(() => !be.st.get('users/u1/journal-header.jpg') ? 1 : null, 10000), 'restoring a backup without a photo: Storage follows (nothing left there)');
    fs.writeFileSync(f, JSON.stringify(d)); await p.setInputFiles('#backupFile', f);
    const back = await until(async () => { const k = await header(p), s = be.st.get('users/u1/journal-header.jpg'); return k.photoAt > h.photoAt && s && s.at === String(k.photoAt) ? k : null; }, 15000);
    ok(back, 'restoring a backup with a photo: it is the newest photo, in Storage too', back);
    const fsk = await until(() => { const u = be.fs.get('users/u1'), k = u && u.settings && u.settings.journalHeader; return k && back && k.photoAt === back.photoAt ? k : null; }, 15000);
    ok(!(c.x === 50 && c.y === 50 && c.zoom === 1) && [d.settings.journalHeader, back, fsk].every(k => k && k.x === c.x && k.y === c.y && k.zoom === c.zoom), 'the restored photo keeps the backup’s crop, here and in the account (what the other devices take)', { c: [c.x, c.y, c.zoom], back, fsk });
    // Delete my account (no erase): Storage first, then Firestore; this device keeps its photo, no longer marked up
    await p.click('nav.tabs button[data-view=plan]'); await p.evaluate(() => document.getElementById('syncDelete').click()); await p.waitForTimeout(400);
    await p.click('#syncDelGo'); const done = await until(() => be.deletedUsers.includes('u1') ? 1 : null, 20000);
    const sdel = be.log.find(x => x.storage && x.storage.op === 'delete' && x.page === 'A' && x.t > back.updatedAt), fdel = be.log.find(x => x.ops && x.ops.some(o => o.startsWith('del ')) && x.t > back.updatedAt);
    ok(done && sdel && fdel && sdel.t <= fdel.t && !be.st.size, 'Delete my account: the photo in Storage goes first, then Firestore', { s: sdel && sdel.t, f: fdel && fdel.t, st: be.st.size });
    const r = await idbPhoto(p); ok(r && r.up === '' && (await header(p)).photoAt === back.photoAt, 'without erase this device keeps its photo (no longer marked as backed up)', r && r.up);
    ok(A.errors.length === 0, 'delete: no errors', A.errors); await A.close(); }
  { // Delete my account while an upload hangs: it gives up like any other step (nothing deleted, the sheet free again), not wait for ever
    const be = new Backend(); ALL_REQ.push(be.log); const A = await synced(be, { label: 'A' }); const p = A.p; await p.waitForTimeout(800);
    be.holdUploads = true; await pickWait(p, photo('land.jpg')); await until(() => be.held.length, 10000); await p.click('#jhpDone');
    await p.click('nav.tabs button[data-view=plan]'); await p.evaluate(() => document.getElementById('syncDelete').click()); await p.waitForTimeout(400);
    await p.clock.install(); await p.click('#syncDelGo'); await p.waitForTimeout(800); await p.clock.runFor(26000); await p.waitForTimeout(800);
    const v = await p.evaluate(() => ({ open: document.getElementById('syncDelModal').classList.contains('open'), toast: document.getElementById('toast').textContent }));
    ok(!v.open && /finish deleting/.test(v.toast) && !be.deletedUsers.length && be.fs.has('users/u1'), 'Delete my account while an upload hangs: after 25 s it stops, says so, deletes nothing', v);
    be.holdUploads = false; be.release(); await A.close(); }
  { const be = new Backend(); ALL_REQ.push(be.log); const A = await synced(be, { label: 'A' }); const p = A.p; await p.waitForTimeout(800);
    await pickWait(p, photo('land.jpg')); await until(() => be.st.get('users/u1/journal-header.jpg'), 10000); await p.click('#jhpDone');
    await p.click('nav.tabs button[data-view=plan]'); await p.evaluate(() => document.getElementById('syncDelete').click()); await p.waitForTimeout(400);
    await p.check('#syncDelErase'); await p.click('#syncDelGo'); await until(() => be.deletedUsers.includes('u1') ? 1 : null, 20000); await p.waitForTimeout(2500);
    ok(!be.st.size && !(await idbPhoto(p)) && !(await header(p)), 'Delete my account with erase: Storage, this device’s photo and the setting all gone');
    await A.close(); }
  { // u1's photo only on this device (Storage not set up yet); u1 signs out; a sign-in as u2 asks first, and the connection is lost before
    // the answer (Merge): the link fails, the device is still u1's, and u1's photo and its setting are still here
    const be = new Backend(); ALL_REQ.push(be.log); be.storage = 'off'; const A = await synced(be, { label: 'A' }); A.label = 'A'; const p = A.p; await p.waitForTimeout(800);
    const h = await pickWait(p, photo('land.jpg')); await p.click('#jhpDone'); await sleep(2500);
    await p.evaluate(() => document.getElementById('syncOutBtn').click()); await p.waitForTimeout(600);
    await p.evaluate(() => localStorage.setItem('__mock_user', JSON.stringify({ uid: 'u2', email: 'u2@example.com', displayName: 'Test u2' })));
    await p.click('nav.tabs button[data-view=plan]'); await p.evaluate(() => document.getElementById('gSignIn').click()); await until(() => p.$eval('#syncAskModal', m => m.classList.contains('open')), 10000);
    await offline(be, A, true); await p.click('#syncAskMerge'); await until(() => p.$eval('#toast', t => /reach your backup/.test(t.textContent) || null), 15000); await p.waitForTimeout(600);
    const v = await p.evaluate(() => ({ owner: JSON.parse(localStorage.getItem('bluebird.owner.v1')) || {}, toast: document.getElementById('toast').textContent })), k = await header(p), r = await idbPhoto(p);
    ok(v.owner.uid === 'u1' && !v.owner.signedIn && k && k.photoAt === h.photoAt && k.style === 'photo' && r && r.at === h.photoAt && (await cls(p)).includes('jh-photo'), 'a switch to u2 that fails (the connection lost after the question): the device is still u1\u2019s, with u1\u2019s photo (its only copy) and its setting', { owner: v.owner, toast: v.toast, k, r: r && r.at });
    await offline(be, A, false); ok(A.errors.length === 0, 'failed switch: no errors', A.errors); await A.close(); }
  { // a rider whose photo was removed (one was named, so Storage is asked; a reload later the SDK is not loaded yet) deletes the account; the
    // Storage SDK's one request is lost (navigator.onLine still true): the first try fails and says so; the next, the connection back, asks
    // for the SDK again (at a new address) and the account is deleted, with no reload
    const be = new Backend(); ALL_REQ.push(be.log); let drop = false, sdk = 0; const base = be.handler('A'); const A = await synced(be, { label: 'A' }); const p = A.p;
    await p.context().unroute('**/*'); await p.context().route('**/*', q => { const u = q.request().url(); if (/firebase-storage\.js/.test(u)) { sdk++; if (drop) return q.abort('connectionreset'); } const hd = base(q, u); if (hd) return hd; return u.startsWith('file:') || u.startsWith('blob:') ? q.continue() : q.abort(); });
    await p.waitForTimeout(1200); dialogs(p);
    await pickWait(p, photo('land.jpg')); await until(() => be.st.get('users/u1/journal-header.jpg'), 10000); await p.click('#jhpRemove'); await until(() => !be.st.has('users/u1/journal-header.jpg') ? 1 : null, 10000); await p.waitForTimeout(800); await p.click('#jhpDone');
    await reload(p); await p.waitForTimeout(1500); drop = true; const s0 = sdk;
    const del = async () => { await p.click('nav.tabs button[data-view=plan]'); await p.evaluate(() => document.getElementById('syncDelete').click()); await p.waitForTimeout(400); await p.click('#syncDelGo'); await p.waitForTimeout(3000); return p.$eval('#toast', t => t.textContent); };
    const t1 = await del(); drop = false; if (await p.$eval('#syncDelModal', m => m.classList.contains('open'))) { await p.keyboard.press('Escape'); await p.waitForTimeout(300); }
    const t2 = await del();
    ok(/finish deleting/.test(t1) && sdk - s0 === 2 && be.deletedUsers.includes('u1') && !be.fs.has('users/u1'), 'Delete my account after a lost Storage SDK request: the next try asks for it again and the account is deleted (no reload needed)', { t1, t2, sdk: sdk - s0, deleted: be.deletedUsers });
    ok(A.errors.length === 0, 'a lost SDK request: no errors', A.errors); await A.close(); }
  // no Storage bucket yet (README step 10 not done; in a browser every Storage request fails at the network): Delete my account still
  // completes. A rider who never had a photo: Storage is not asked at all. A rider with a photo (on this device only): one plain question
  // finds there is no bucket, and nothing else is asked of Storage
  for (const withPhoto of [false, true]) {
    const be = new Backend(); ALL_REQ.push(be.log); be.storage = 'nobucket'; const A = await synced(be, { label: 'A' }); const p = A.p; await p.waitForTimeout(1200);
    if (withPhoto) { await pickWait(p, photo('land.jpg')); await p.waitForTimeout(1500); await p.click('#jhpDone'); }
    await sleep(2500); const n0 = be.log.length; await p.click('nav.tabs button[data-view=plan]'); await p.evaluate(() => document.getElementById('syncDelete').click()); await p.waitForTimeout(400);
    const t0 = Date.now(); await p.click('#syncDelGo'); const done = await until(() => be.deletedUsers.includes('u1') ? 1 : null, 30000), ms = Date.now() - t0;
    const st = be.log.slice(n0).filter(x => /firebasestorage|firebase-storage/.test(x.url)).map(x => x.storage ? x.storage.op : /firebase-storage/.test(x.url) ? 'sdk' : 'other');
    ok(done && !be.fs.has('users/u1') && ms < 10000 && (withPhoto ? st.join() === 'probe' : !st.length), 'no Storage bucket yet: Delete my account completes for a rider ' + (withPhoto ? 'with a photo on this device (one plain question finds no bucket; nothing else asked of Storage)' : 'who never had a photo (Storage not asked at all)') + ' in ' + ms + ' ms', { st, ms, deleted: be.deletedUsers });
    ok(A.errors.length === 0, 'no bucket, Delete my account' + (withPhoto ? ' with a photo' : '') + ': no errors', A.errors); await A.close();
  }
  { const be = new Backend(); ALL_REQ.push(be.log); // u1's photo on this device and in u1's Storage; a sign-in as u2 (account switch)
    const A = await synced(be, { label: 'A' }); const p = A.p; await p.waitForTimeout(800);
    const h = await pickWait(p, photo('land.jpg')); await until(() => be.st.get('users/u1/journal-header.jpg'), 10000); await p.click('#jhpDone'); await sleep(2200);
    await p.evaluate(() => document.getElementById('syncOutBtn').click()); await p.waitForTimeout(600);
    await p.evaluate(() => localStorage.setItem('__mock_user', JSON.stringify({ uid: 'u2', email: 'u2@example.com', displayName: 'Test u2' })));
    await p.click('nav.tabs button[data-view=plan]'); await p.evaluate(() => document.getElementById('gSignIn').click());
    const ask = await until(() => p.$eval('#syncAskModal', m => m.classList.contains('open')), 10000); ok(ask, 'signing in as another account asks first');
    await p.click('#syncAskMerge'); await until(async () => (await p.evaluate(() => (JSON.parse(localStorage.getItem('bluebird.owner.v1')) || {}).uid)) === 'u2', 15000); await p.waitForTimeout(2500);
    const k = await header(p), r = await idbPhoto(p);
    ok(!r && (!k || !k.photoAt), 'account switch: u1’s photo leaves this device (and the setting with it)', { k, r: !!r });
    ok(be.st.has('users/u1/journal-header.jpg') && !be.st.has('users/u2/journal-header.jpg') && !(be.fs.get('users/u2').settings || {}).journalHeader, 'u1’s Storage untouched; nothing of it goes to u2', [...be.st.keys()]);
    ok(A.errors.length === 0, 'switch: no errors', A.errors); await A.close(); }
});

/* ---------------------------------------------------------------- run */
const UPS = {}, upCount = () => ALL_REQ.flat().filter(x => x.storage && x.storage.op === 'upload').length; /* (each section's own Storage uploads) */
for (const [name, fn] of sections) {
  if (ONLY.length && !ONLY.includes(name)) continue;
  const u0 = upCount(); console.log('— ' + name); try { await fn(); } catch (e) { ok(false, name + ': threw', String(e && e.stack || e).slice(0, 500)); } UPS[name] = upCount() - u0;
}
/* ---------------------------------------------------------------- the repo's storage.rules: what the stand-in enforces, and only that */
// (static: the rules are not run here). Comments dropped; exactly the bucket's match and the one file's; get, delete, create and update each
// allowed once, every one to the file's owner only; a write a JPEG under RULES.maxKB KB with its photo time; an update only with a newer one.
// The checker is shown to fail on two broken copies (the newer-photo clause gone; a wildcard for every signed-in account)
function rulesCheck(raw) {
  const R = String(raw || '').replace(/\/\/[^\n]*/g, ''), allows = [...R.matchAll(/allow\s+([\w\s,]+?)\s*:\s*if\s+([^;]+);/g)].map(m => ({ ops: m[1].split(',').map(x => x.trim()), cond: m[2].replace(/\s+/g, ' ') }));
  const matches = [...R.matchAll(/match\s+(\S+)\s*\{/g)].map(m => m[1]), ops = allows.flatMap(a => a.ops).sort().join(), by = op => allows.find(a => a.ops.includes(op)) || { cond: '' };
  const own = 'request.auth != null && request.auth.uid == uid', put = ["request.resource.contentType == '" + RULES.ct + "'", 'request.resource.size < ' + RULES.maxKB + ' * 1024', "request.resource.metadata.at.matches('" + RULES.at + "')"], newer = 'int(request.resource.metadata.at) > int(resource.metadata.at)';
  const why = [];
  if (!/rules_version\s*=\s*'2'/.test(R) || !/service\s+firebase\.storage\s*\{/.test(R)) why.push('not a rules_version 2 firebase.storage file');
  if (matches.join(' ') !== '/b/{bucket}/o /' + RULES.path) why.push('matches: ' + matches.join(' '));
  if (ops !== 'create,delete,get,update') why.push('allows: ' + ops);
  if (/\bif\s+true\b|\*\*/.test(R)) why.push('an open rule or a wildcard');
  if (!allows.every(a => a.cond.includes(own))) why.push('an allow not owner-only');
  if (!['create', 'update'].every(op => put.every(c => by(op).cond.includes(c)))) why.push('a write without the JPEG, size or photo-time clause');
  if (!by('update').cond.includes(newer)) why.push('an update without the newer-photo clause');
  return why;
}
{
  const rf = path.join(REPO, 'storage.rules'), raw = fs.existsSync(rf) ? fs.readFileSync(rf, 'utf8') : '', why = raw ? rulesCheck(raw) : ['no ' + rf];
  const m1 = rulesCheck(raw.replace(/\s*&& int\(request\.resource\.metadata\.at\) > int\(resource\.metadata\.at\)/, '')), m2 = rulesCheck(raw.replace(/match \/b\/\{bucket\}\/o \{/, 'match /b/{bucket}/o {\n    match /{allPaths=**} { allow read, write: if request.auth != null; }'));
  ok(!why.length && m1.length && m2.length, 'storage.rules (' + path.relative(process.cwd(), rf) + '): owner-only users/{uid}/journal-header.jpg, a JPEG under ' + RULES.maxKB + ' KB with its photo time, an update only with a newer photo, nothing else (the rules the stand-in keeps)', { why, brokenCopiesCaught: [m1, m2] });
  const sw = path.join(path.dirname(PAGE), 'sw.js'), cache = ((fs.existsSync(sw) ? fs.readFileSync(sw, 'utf8') : '').match(/const CACHE = '([^']+)'/) || [])[1], build = (SRC.match(/const APP_BUILD='([^']+)'/) || [])[1];
  ok(cache === 'fred-shell-v116' && build === cache, 'the cache bump: sw.js CACHE and APP_BUILD are both fred-shell-v116 (item 91)', { cache, build });
}
/* ---------------------------------------------------------------- privacy: only the Storage upload carries the image; never to an AI */
{
  const reqs = ALL_REQ.flat(), bad = [], ups = [];
  for (const x of reqs) {
    const b = x.body || Buffer.alloc(0), u = decodeURIComponent(x.url), s = b.toString('latin1');
    const img = b.includes(Buffer.from([0xFF, 0xD8, 0xFF])) || s.includes('/9j/') || /data:image/i.test(s) || u.includes('/9j/') || /data:image/i.test(u);
    if (x.storage && x.storage.op === 'upload') { ups.push(x); if (!/^users\/u\d\/journal-header\.jpg$/.test(x.storage.path) || !x.url.startsWith('https://firebasestorage.googleapis.com/')) bad.push('upload elsewhere: ' + x.url.slice(0, 120)); continue; }
    if (img) bad.push(x.method + ' ' + x.url.slice(0, 120));
  }
  const syncRan = ['sync', 'races', 'storage', 'account'].filter(n => n in UPS); /* (a section run alone is judged on its own uploads) */
  ok(reqs.length > (ONLY.length ? 0 : 200) && syncRan.every(n => UPS[n] > 0) && (ONLY.length > 0 || ups.length > 3), 'privacy: every request recorded (' + reqs.length + '), ' + ups.length + ' Storage uploads among them (each section that syncs made its own: ' + JSON.stringify(UPS) + ')');
  ok(!bad.length, 'privacy: no request but the account’s own Storage upload carries the image (no FF D8 FF, /9j/ or data:image anywhere else)', bad.slice(0, 5));
  ok(ups.every(x => x.storage.path === 'users/' + new URL(x.url).searchParams.get('uid') + '/journal-header.jpg'), 'privacy: each upload goes to its own account’s path');
  ok(!reqs.some(x => /anthropic|openai|claude\.ai|generativelanguage/i.test(x.url)), 'privacy: no request to any AI service');
  ok(!/getDownloadURL/.test(SRC), 'privacy: the app never names getDownloadURL (the photo is read with getBlob; a download URL would skip the rules)');
  ok(/DBG_DROP_SET=\[[^\]]*'journalHeader'/.test(SRC), 'privacy: Copy for troubleshooting leaves the header setting out');
  const names = [...SRC.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]), dup = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))].sort(), mine = names.filter(n => /^jhp/.test(n));
  ok(dup.join() === 'currentAgBand,pick,raceAgBand,render' && mine.length > 60 && new Set(mine).size === mine.length, 'function names: every new one (jhp…) unique, no new duplicate in index.html (the four older inner duplicates only)', { dup, mine: mine.length });
}
await browser.close();
C.done('q91 Journal: your own header photo');
