// node q91.test.mjs <null.html> [only]   (cd into this folder first) -- item 91: Journal: your own header photo.
// Every numbered point and QA line of QUEUE.md item 91 and every point of DECISIONS.md "Item 91": the camera, the Header sheet, the three
// styles and thumbnails, Choose photo (EXIF orientation, 1600 px, at most 400 KB, metadata and GPS gone: the stored JPEG is parsed), the
// IndexedDB copy, Move and zoom (drag, keys, sliders, trackpad and touch pinch, Cancel, Escape, Done, reload), Remove photo, Back up /
// Restore, Storage sync through a Firebase stand-in (fbmock.mjs: the path, a second device, photoAt and the newer-photo-wins rules, an
// upload in flight, offline, retries backing off, Storage not set up), Delete my account / erase / account switch, AA contrast over a bright,
// a dark and a spotted photo, item 90's motion with a photo, Reduce Motion, print, 390 px and 320 px at 200%, keyboard and screen reader
// names, and that no request but the account's own Storage upload carries the image. `only`: a comma-separated list of sections to run (sheet, choose,
// styles, move, remove, backup, contrast, motion, small, sync, races, storage, account). The whole run takes about 4 minutes.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { open, checker } from '../lib/open.mjs';
import { Backend } from './fbmock.mjs';
import { makePhotos, MARKS } from './mkphotos.mjs';
import { buildPages, openSync, idbPhoto, header, segments, jpegSize, sleep, until, choose, reload } from './lib.mjs';

const PAGE = path.resolve(process.argv[2] || '../../fred91/null.html'), ONLY = (process.argv[3] || '').split(',').filter(Boolean);
const HERE = path.dirname(new URL(import.meta.url).pathname), PH = path.join(HERE, 'photos'), SHOTS = process.env.Q91_SHOTS || path.resolve(HERE, '../../q91shots');
const C = checker('q91 '), ok = C.ok;
const ALL_REQ = []; // every request of every page: the privacy check at the end
const browser = await chromium.launch();
if (!fs.existsSync(path.join(PH, 'spot.jpg'))) await makePhotos(PH, browser);
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
// a device offline / online again: the context's switch (navigator.onLine, the events) and its requests refused
async function offline(be, o, on) { if (on) be.offline.add(o.label); else be.offline.delete(o.label); await o.ctx.setOffline(on); if (!on) await o.p.evaluate(() => window.dispatchEvent(new Event('online'))); }
// both devices back at the front every 2 s (each pulls at most every 10 s) until cond() holds
async function settle(pages, cond, ms = 50000) { const t = Date.now(); while (Date.now() - t < ms) { for (const pg of pages) await pg.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(2000); const v = await cond().catch(() => null); if (v) return v; } return null; }
const sections = [];
const section = (name, fn) => sections.push([name, fn]);

/* ---------------------------------------------------------------- the camera and the sheet (point 1, 2) */
section('sheet', async () => {
  const o = await local({ dpr: 2 }); const p = o.p; await journal(p); /* (2 device px: a 2.5 px outline is not rounded to 2) */
  const cam = await p.$eval('#jhCam', b => { const s = b.querySelector('span'), r = b.getBoundingClientRect(), sr = s.getBoundingClientRect(), add = document.getElementById('jNoteAdd').getBoundingClientRect(), cs = getComputedStyle(s);
    return { w: r.width, h: r.height, cw: sr.width, ch: sr.height, bg: cs.backgroundColor, col: getComputedStyle(b).color, left: r.right <= add.left + 1, top: Math.abs(r.top - add.top) < 1, label: b.getAttribute('aria-label'), pop: b.getAttribute('aria-haspopup'), exp: b.getAttribute('aria-expanded'), svg: !!b.querySelector('svg[aria-hidden=true]') }; });
  ok(cam.w >= 44 && cam.h >= 44 && cam.cw === 40 && cam.ch === 40, 'camera: a 40 px circle in a 44 px target', cam);
  ok(cam.bg === 'rgba(0, 0, 0, 0.35)' && cam.col === 'rgb(255, 255, 255)' && cam.svg, 'camera: black 35%, white line icon', cam);
  ok(cam.left && cam.top, 'camera: just left of the +, on its line', cam);
  ok(cam.label === 'Header photo' && cam.pop === 'dialog' && cam.exp === 'false', 'camera: named, a dialog button', cam);
  const bar = await p.$eval('#jFold [data-jh-cam]', b => { const s = b.querySelector('span'); return { cw: s.style.width || getComputedStyle(s).width, label: b.getAttribute('aria-label') }; });
  ok(bar.cw === '36px' && bar.label === 'Header photo', 'compact bar: its own camera, 36 px', bar);
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
  const before = await header(p); notes.length = 0;
  await choose(p, photo('notphoto.jpg')); await p.waitForTimeout(1500);
  const after = await header(p), nt = await p.$eval('#jhpNote', n => n.textContent);
  ok(JSON.stringify(after) === JSON.stringify(before) && /couldn.t be opened/.test(nt), 'not a photo: nothing changes, one quiet note', { nt });
  await p.click('#jhpDone'); await p.waitForTimeout(400); await p.click('#jhCam'); await p.waitForTimeout(400);
  ok((await p.$eval('#jhpNote', n => n.textContent)) === '', 'the note does not stick: gone when the sheet opens again');
  ok(o.errors.length === 0, 'choose: no errors', o.errors); await o.close();
});

/* ---------------------------------------------------------------- the three styles (point 5) and Stripes only */
section('styles', async () => {
  const o = await local(); const p = o.p; await journal(p); const h0 = await pickWait(p, photo('land.jpg'));
  const look = () => p.evaluate(() => { const V = document.getElementById('view-journal'), H = document.getElementById('jHero'), ph = H.querySelector('.jh-ph'), img = ph.querySelector('img'), sv = H.querySelector('.jh-stripes'), sh = H.querySelector('.jh-shade'), t = H.querySelector('.jh-t'), bar = document.querySelector('#jFold .jh-cph img');
    return { cls: V.className, h: H.getBoundingClientRect().height, ph: getComputedStyle(ph).display, src: (img.getAttribute('src') || '').slice(0, 5), fit: getComputedStyle(img).objectFit, sv: getComputedStyle(sv).display, svo: getComputedStyle(sv).opacity, shade: getComputedStyle(sh).backgroundImage, ts: getComputedStyle(t).textShadow, bar: (bar.getAttribute('src') || '').slice(0, 5), cam: getComputedStyle(document.querySelector('#jhCam>span')).backgroundColor }; });
  let L = await look();
  ok(L.cls.includes('jh-photo') && !L.cls.includes('jh-pst') && L.h === 230 && L.ph === 'block' && L.src === 'blob:' && L.fit === 'cover' && L.sv === 'none', 'Photo: full bleed photo from a blob: URL, 230 px, no stripes', L);
  ok(/linear-gradient\(rgba\(0, 0, 0, 0\) 45%, rgba\(0, 0, 0, 0\.35\)\)/.test(L.shade.replace(/to bottom, /, '')), 'Photo: fade from transparent at 45% to black 35% at the bottom', L.shade);
  ok(/rgba\(0, 0, 0, 0\.25\) 0px 1px 12px/.test(L.ts), 'Photo: the title shadow 0 1px 12px rgba(0,0,0,.25)', L.ts);
  ok(L.cam === 'rgba(0, 0, 0, 0.45)' && L.bar === 'blob:', 'camera black 45% over a photo; the compact bar has the photo', L);
  await p.click('label[data-jhp-st="photo-stripes"]'); await p.waitForTimeout(300); L = await look();
  ok(L.cls.includes('jh-pst') && L.sv === 'block' && L.svo === '0.82' && L.ph === 'block', 'Photo + stripes: the stripes over the photo at 82%', L);
  ok((await header(p)).style === 'photo-stripes', 'the style is saved', await header(p));
  await p.click('#jhpStripes'); await p.waitForTimeout(300); L = await look();
  ok(!L.cls.includes('jh-photo') && L.h === 200 && L.ph === 'none' && L.sv === 'block' && L.svo === '1' && L.cam === 'rgba(0, 0, 0, 0.35)', 'Stripes only: today’s header (200 px, stripes, camera 35%)', L);
  const k = await header(p), r = await idbPhoto(p);
  ok(k.style === 'stripes' && k.photoAt === h0.photoAt && r && r.at === h0.photoAt && !(await p.$eval('#jhpRmBox', b => b.hidden)), 'Stripes only keeps the photo (and Remove photo)', k);
  const th = await p.evaluate(() => [...document.querySelectorAll('#jHdr .jhp-tv')].map(t => ({ none: t.classList.contains('jhp-none'), src: (t.querySelector('img') || { getAttribute: () => '' }).getAttribute('src') || '' })));
  ok(th[0].src.startsWith('blob:') && th[1].src.startsWith('blob:') && !th[0].none, 'thumbnails show the photo', th);
  await p.click('label[data-jhp-st="photo"]'); await p.waitForTimeout(300); L = await look();
  ok(L.cls.includes('jh-photo') && L.src === 'blob:' && (await header(p)).photoAt === h0.photoAt, 'pick Photo again: the photo is still there', L);
  await p.click('#jhpDone'); await p.waitForTimeout(300); await p.screenshot({ path: path.join(SHOTS, 'photo-390.png') });
  await p.click('#jhCam'); await p.waitForTimeout(400); await p.click('label[data-jhp-st="photo-stripes"]'); await p.waitForTimeout(300); await p.screenshot({ path: path.join(SHOTS, 'sheet-390.png') });
  await p.click('#jhpDone'); await p.waitForTimeout(400); await p.screenshot({ path: path.join(SHOTS, 'photo-stripes-390.png') });
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
  const ring = await p.$eval('#jhpStage', s => { const c = getComputedStyle(s); return [c.outlineStyle, c.outlineWidth]; });
  ok(ring[0] === 'solid' && parseFloat(ring[1]) >= 2, 'a visible focus ring on the preview', ring);
  await p.emulateMedia({ forcedColors: 'active' }); const ring2 = await p.$eval('#jhpStage', s => { const c = getComputedStyle(s); return [c.outlineStyle, c.outlineWidth, c.outlineColor]; }); await p.emulateMedia({ forcedColors: 'none' });
  ok(ring2[0] === 'solid' && parseFloat(ring2[1]) >= 2, 'the focus ring stays in forced colours', ring2);
  // nothing outside the preview is redrawn while it is worked
  await p.evaluate(() => { window.__q91m = 0; new MutationObserver(r => { window.__q91m += r.length; }).observe(document.getElementById('view-journal'), { subtree: true, childList: true, attributes: true }); });
  const settings0 = await p.evaluate(() => localStorage.getItem('bluebird.settings.v2'));
  const box = await p.$eval('#jhpStage', s => { const r = s.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const drag = async (dx, dy) => { await p.mouse.move(box.x + box.w / 2, box.y + box.h / 2); await p.mouse.down(); for (let i = 1; i <= 10; i++) await p.mouse.move(box.x + box.w / 2 + i * dx / 10, box.y + box.h / 2 + i * dy / 10); await p.mouse.up(); await p.waitForTimeout(100); };
  const pos = () => p.evaluate(() => ({ x: +document.getElementById('jhpX').value, y: +document.getElementById('jhpY').value, z: +document.getElementById('jhpZoom').value, op: document.querySelector('#jhpStage img').style.objectPosition, mut: window.__q91m, set: localStorage.getItem('bluebird.settings.v2'), hero: document.querySelector('#jHero .jh-ph img').style.objectPosition }));
  await drag(-60, -12); const d1 = await pos(); /* land.jpg (3:2) in the 390 x 230 header: 30 px to spare up and down, none sideways at 1x */
  ok(d1.x === 50 && Math.abs(d1.y - 90) < 1, 'drag up 12 px: the photo follows the finger (y by 12 of the 30 px that overflow: 90%; nothing to move sideways at 1x)', { x: d1.x, y: d1.y, op: d1.op });
  ok(d1.mut === 0 && d1.set === settings0 && d1.hero === '50% 50%', 'while dragging: no save, the header and the rest of the Journal untouched (no refit)', { mut: d1.mut, hero: d1.hero });
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
  await p.screenshot({ path: path.join(SHOTS, 'move-and-zoom-390.png') });
  // Cancel and Escape drop it; Done saves it
  await p.click('#jhpMCancel'); await p.waitForTimeout(300);
  ok(JSON.stringify(await header(p)) === JSON.stringify(H0) && (await p.evaluate(() => document.activeElement.id)) === 'jhpMoveBtn' && (await sheetOpen(p)), 'Cancel drops it (back in the Header sheet, on Move and zoom)');
  await p.click('#jhpMoveBtn'); await p.waitForTimeout(300); ok((await p.$eval('#jhpZoom', e => +e.value)) === 1, 'opened again: from the saved place');
  await p.focus('#jhpStage'); await p.keyboard.press('Equal'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok(JSON.stringify(await header(p)) === JSON.stringify(H0) && !(await p.$eval('#jHdrMove', m => m.classList.contains('open'))) && (await sheetOpen(p)), 'Escape drops it and closes only Move and zoom');
  await p.click('#jhpMoveBtn'); await p.waitForTimeout(300); await p.focus('#jhpStage');
  for (const k of ['Equal', 'Equal', 'Equal', 'ArrowLeft', 'ArrowLeft', 'ArrowUp']) await p.keyboard.press(k);
  await p.click('#jhpMDone'); await p.waitForTimeout(300); const H1 = await header(p);
  ok(H1.zoom === 1.3 && H1.x === 54 && H1.y === 52 && H1.updatedAt > H0.updatedAt && H1.photoAt === H0.photoAt, 'Done saves x, y and zoom', H1);
  const shown = await p.$eval('#jHero .jh-ph img', e => [e.style.objectPosition, e.style.transform, e.style.transformOrigin]);
  ok(shown[0] === '54% 52%' && shown[1] === 'scale(1.3)' && shown[2] === '54% 52%', 'the header: object-position plus scale', shown);
  await reload(p); await p.waitForTimeout(600); await journal(p);
  const again = await p.$eval('#jHero .jh-ph img', e => [e.style.objectPosition, e.style.transform, (e.getAttribute('src') || '').slice(0, 5)]);
  ok(again[0] === '54% 52%' && again[1] === 'scale(1.3)' && again[2] === 'blob:', 'it sticks after a reload', again);
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
  await p.click('label[data-jhp-st="photo-stripes"]'); await p.waitForTimeout(200); await p.click('#jhpDone'); await p.waitForTimeout(300);
  const r = await idbPhoto(p);
  const file = await p.evaluate(() => new Promise(res => { const a = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { HTMLAnchorElement.prototype.click = a; fetch(this.href).then(x => x.text()).then(res); }; document.getElementById('backupDownload').click(); }));
  const d = JSON.parse(file), b64 = d.headerPhoto && d.headerPhoto.jpeg;
  ok(b64 && Buffer.from(b64, 'base64').equals(r.bytes) && d.settings.journalHeader.style === 'photo-stripes', 'Download a backup carries the photo (the stored JPEG) and the setting', { has: !!b64 });
  await o.close();
  // restore on a device without a photo
  const o2 = await local(); const p2 = o2.p; const msgs = dialogs(p2);
  const restore = async (pp, data) => { const f = path.join(HERE, 'photos', 'q91-backup.json'); fs.writeFileSync(f, JSON.stringify(data)); await pp.setInputFiles('#backupFile', f); };
  await restore(p2, d); const h2 = await until(async () => { const k = await header(p2); return k && k.photoAt ? k : null; }, 15000); const r2 = await idbPhoto(p2);
  ok(h2 && h2.style === 'photo-stripes' && h2.photoAt > h.photoAt && r2 && r2.at === h2.photoAt, 'Restore: the photo comes back (re-encoded: a new photo time), its style too', h2);
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
section('contrast', async () => {
  const o = await local({ dpr: 2, motion: true }); const p = o.p; await journal(p); /* (motion on: the parallax slides the stripes) */
  const res = {};
  for (const [f, sty] of [['bright.jpg', 'photo'], ['dark.jpg', 'photo'], ['spot.jpg', 'photo'], ['land.jpg', 'photo-stripes'], ['bright.jpg', 'photo-stripes']]) {
    await pickWait(p, photo(f)); if (sty !== 'photo') { await p.click('label[data-jhp-st="' + sty + '"]'); } await p.click('#jhpDone'); await p.waitForTimeout(700);
    const a = +(await p.$eval('#view-journal', v => getComputedStyle(v).getPropertyValue('--jh-a'))) || 0, cr = await textContrast(p, '#jHero .jh-t');
    res[f + ' ' + sty] = { a, cr: cr && +cr.toFixed(2) };
    ok(cr >= 3, `"My Journal" over ${f} (${sty}): AA for its large text (${cr && cr.toFixed(2)}:1, scrim ${a})`, res[f + ' ' + sty]);
    if (sty === 'photo-stripes') { // the parallax slides the stripes under the title as the page scrolls
      for (const y of [40, 80, 105]) { /* (past 110 px the compact bar comes over the title) */ await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(250); const tr = await p.$eval('#jHero .jh-stripes', e => e.style.translate), c2 = await textContrast(p, '#jHero .jh-t'); ok(c2 >= 3 && tr, `  … scrolled ${y} px: the stripes slid ${tr} under it (${c2 && c2.toFixed(2)}:1)`); }
      await p.evaluate(() => scrollTo(0, 260)); await p.waitForTimeout(400);
      const cb = await textContrast(p, '#jFold .jh-cbt'); ok(cb >= 4.5, `compact bar title over ${f}: AA (${cb && cb.toFixed(2)}:1)`);
      await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    }
    await p.click('#jhCam'); await p.waitForTimeout(350);
  }
  ok(res['bright.jpg photo'].a > 0 && res['spot.jpg photo'].a > 0 && res['dark.jpg photo'].a === 0, 'the scrim shows only where the photo is bright (a small bright spot counts; a dark photo has none)', res);
  const bg = await p.$eval('#view-journal', v => { v.classList.add('q91'); return getComputedStyle(v.querySelector('#jHero .jh-t')).backgroundColor; });
  ok(/rgba\(0, 0, 0, 0\.\d+\)/.test(bg), 'the scrim is black behind the title only', bg);
  await p.click('#jhpDone'); ok(o.errors.length === 0, 'contrast: no errors', o.errors); await o.close();
});

/* ---------------------------------------------------------------- item 90's motion with a photo, Reduce Motion, print (point 6) */
section('motion', async () => {
  for (const sty of ['photo', 'photo-stripes', 'stripes']) {
    const o = await local({ motion: true }); const p = o.p; await journal(p); await pickWait(p, photo('land.jpg'));
    if (sty !== 'photo') await p.click(sty === 'stripes' ? '#jhpStripes' : 'label[data-jhp-st="photo-stripes"]'); await p.click('#jhpDone'); await p.waitForTimeout(300);
    await p.click('nav.tabs button[data-view=plan]'); await reload(p); await p.waitForTimeout(500); // a cold open
    await p.click('nav.tabs button[data-view=journal]');
    const samp = () => p.evaluate(() => { const H = document.getElementById('jHero'), ph = H.querySelector('.jh-ph'), pol = H.querySelector('.jh-s1'), cam = H.querySelector('.jh-cam>span');
      return { cls: H.className, ph: +getComputedStyle(ph).opacity, phd: getComputedStyle(ph).display, phr: Math.round(ph.getBoundingClientRect().top), pol: getComputedStyle(pol).transform, cam: getComputedStyle(cam).transform, camo: +getComputedStyle(cam).opacity, sv: getComputedStyle(H.querySelector('.jh-stripes')).display }; });
    const s = []; for (let i = 0; i < 8; i++) { s.push(await samp()); await p.waitForTimeout(60); } await p.waitForTimeout(1300); const end = await samp();
    const armed = s.some(x => /jm-(arm|go)/.test(x.cls));
    ok(armed && !/jm-/.test(end.cls), sty + ': item 90’s entrance plays once on the cold open', { first: s[0].cls, end: end.cls });
    ok(s.some(x => x.cam !== 'none' && x.cam !== 'matrix(1, 0, 0, 1, 0, 0)') && end.cam === 'none' || end.cam === 'matrix(1, 0, 0, 1, 0, 0)', sty + ': the camera pops with the +', s.map(x => x.cam).slice(0, 4));
    if (sty === 'photo') { ok(s.some(x => x.ph < .9) && end.ph === 1 && s.every(x => x.sv === 'none'), 'Photo: no stripes; the photo fades in (0 → 1)', s.map(x => x.ph)); }
    if (sty === 'photo-stripes') { ok(s.some(x => x.pol !== 'none') && end.pol === 'none' && s.every(x => x.ph === 1 && x.phr === s[0].phr), 'Photo + stripes: only the stripes sweep; the photo stays still', s.map(x => [x.pol.slice(0, 20), x.ph])); }
    if (sty === 'stripes') { ok(s.some(x => x.pol !== 'none') && s.every(x => x.phd === 'none'), 'Stripes: the sweep as before, no photo', s.map(x => x.pol.slice(0, 20))); }
    // the scroll: parallax on the stripes only, the compact bar with the photo, + New entry, a list sliding in
    await p.evaluate(() => scrollTo(0, 100)); await p.waitForTimeout(250);
    const sc = await p.evaluate(() => { const H = document.getElementById('jHero'); return { tr: H.querySelector('.jh-stripes').style.translate, ph: getComputedStyle(H.querySelector('.jh-ph')).transform, img: H.querySelector('.jh-ph img').style.translate || '', t: H.querySelector('.jh-t').style.scale }; });
    ok(parseFloat(sc.tr) === -45 && +sc.t < 1 && sc.ph === 'none' && !sc.img, sty + ': scroll: the stripes slide, the title shrinks, the photo stays', sc);
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
    if (sc > 1) await p.screenshot({ path: path.join(SHOTS, 'move-and-zoom-320-200.png') });
    await p.click('#jhpMDone'); await p.waitForTimeout(300); await p.click('#jhpDone'); await p.waitForTimeout(300);
    await p.evaluate(() => scrollTo(0, 400)); await p.waitForTimeout(400);
    const bar = await p.evaluate(() => { const t = document.querySelector('#jFold .jh-cbt'), r = document.createRange(); r.selectNodeContents(t); const lines = new Set([...r.getClientRects()].map(x => Math.round(x.top))).size, b = document.getElementById('jFold').getBoundingClientRect(), cam = document.querySelector('#jFold .jh-cam').getBoundingClientRect(), add = document.querySelector('#jFold .jh-add').getBoundingClientRect(), tr = r.getBoundingClientRect();
      return { lines, vis: document.getElementById('jFold').classList.contains('jf-vis'), h: Math.round(b.height), clear: tr.right <= cam.left + 1 || tr.width < 1, cam: [Math.round(cam.width), Math.round(cam.height)], gap: Math.round(add.left - cam.right) }; });
    ok(bar.vis && bar.lines === 1 && bar.cam[0] >= 44 && bar.cam[1] >= 44 && bar.gap >= 0, tag + 'compact bar: one line, the camera and + 44 px, side by side', bar);
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    const hero = await p.evaluate(() => { const H = document.getElementById('jHero'), t = H.querySelector('.jh-t').getBoundingClientRect(), cam = H.querySelector('.jh-cam').getBoundingClientRect(); return { sw: document.scrollingElement.scrollWidth, vw: document.documentElement.clientWidth, overlap: t.top < cam.bottom && t.right > cam.left }; });
    ok(hero.sw <= hero.vw && !hero.overlap, tag + 'the header: fits, the title clear of the buttons', hero);
    if (w === 320) await p.screenshot({ path: path.join(SHOTS, 'photo-320-200.png') });
    ok(o.errors.length === 0, tag + 'no errors', o.errors); await o.close();
  }
  // keyboard and screen readers
  const o = await local(); const p = o.p; await journal(p);
  await p.focus('#jhCam'); await p.keyboard.press('Enter'); await p.waitForTimeout(450);
  let a = await p.evaluate(() => ({ open: document.getElementById('jHdr').classList.contains('open'), f: document.activeElement.name + ':' + document.activeElement.value, inert: document.querySelector('main, header, nav.tabs') ? [...document.body.children].filter(e => e.inert).length : 0 }));
  ok(a.open && a.f === 'jhpStyle:stripes' && a.inert > 0, 'keyboard: Enter on the camera opens Header, focus on the chosen look, the page behind inert', a);
  await p.keyboard.press('Tab'); a = await p.evaluate(() => document.activeElement.id); ok(a === 'jhpChoose', 'Tab: from the looks to Choose photo (disabled looks skipped)', a);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  a = await p.evaluate(() => ({ open: document.getElementById('jHdr').classList.contains('open'), f: document.activeElement.id, exp: document.getElementById('jhCam').getAttribute('aria-expanded') }));
  ok(!a.open && a.f === 'jhCam' && a.exp === 'false', 'Escape closes it, focus back on the camera', a);
  await pickWait(p, photo('land.jpg')); await p.focus('input[name=jhpStyle]:checked'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(250);
  a = await header(p); ok(a.style === 'photo-stripes' && (await cls(p)).includes('jh-pst'), 'arrow keys move through the looks and apply them', a.style);
  await p.focus('input[name=jhpStyle]:checked'); const ring = await p.$eval('input[name=jhpStyle]:checked', i => { const s = getComputedStyle(i.closest('.jhp-th').querySelector('.jhp-tv')); return [s.outlineStyle, s.outlineWidth, s.outlineColor]; });
  ok(ring[0] === 'solid' && parseFloat(ring[1]) >= 3 && ring[2] === 'rgb(13, 13, 13)', 'a focused look has a black 3 px ring', ring);
  const ck = await p.$eval('#jHdr .jhp-th:has(input:checked) .jhp-ck', e => getComputedStyle(e).display); ok(ck === 'grid', 'the chosen look also has a check (not colour alone)', ck);
  const snap = await p.locator('#jHdr .sheet').ariaSnapshot();
  ok(/radio "Photo"/.test(snap) && /radio "Photo \+ stripes" \[checked\]/.test(snap) && /radio "Stripes"/.test(snap) && /button "Choose photo"/.test(snap) && /button "Move and zoom"/.test(snap) && /button "Remove photo"/.test(snap), 'screen reader: the looks are radios with names, the rows buttons', snap.split('\n').slice(0, 14));
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
  // a newer photo on B wins on A; A never sends an older one over it
  const hb = await pickWait(B.p, photo('dark.jpg')); await until(() => { const s = be.st.get('users/u1/journal-header.jpg'); return s && s.at === String(hb.photoAt); }, 15000);
  await sleep(2200); await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(400);
  await sleep(9000); await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  const ra = await until(async () => { const x = await idbPhoto(p); return x && x.at === hb.photoAt ? x : null; }, 20000);
  ok(ra && (await header(p)).photoAt === hb.photoAt, 'B’s newer photo comes to A (its pull, then getBlob)', ra && ra.at);
  // Move and zoom on A syncs to B, the photo itself is not sent again
  const nUp = be.log.filter(x => x.storage && x.storage.op === 'upload').length;
  await openSheet(p); await p.click('#jhpMoveBtn'); await p.waitForTimeout(300); await p.focus('#jhpStage'); await p.keyboard.press('Equal'); await p.click('#jhpMDone'); await p.click('#jhpDone');
  await sleep(2500); await sleep(8000); await B.p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  const zb = await until(async () => { const k = await header(B.p); return k && k.zoom === 1.1 ? k : null; }, 15000);
  ok(zb && zb.photoAt === hb.photoAt && be.log.filter(x => x.storage && x.storage.op === 'upload').length === nUp, 'Move and zoom reaches B; the photo is not uploaded again', zb);
  ok(A.errors.length === 0 && B.errors.length === 0, 'sync: no errors', [A.errors, B.errors]); await A.close(); await B.close();
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
});

/* ---------------------------------------------------------------- Storage not available, retries back off, Remove deletes both */
section('storage', async () => {
  for (const [mode, re] of [['off', /isn.t backed up/], ['down', /when fred can reach/]]) {
    const be = new Backend(); ALL_REQ.push(be.log); be.storage = mode; const A = await synced(be, { label: 'A' }); const p = A.p; await p.waitForTimeout(800);
    if (mode === 'down') await p.clock.install(); /* (before the first failure: its retry timer is a fake one the test can run forward) */
    const h = await pickWait(p, photo('land.jpg')); await p.waitForTimeout(1500);
    const note = await p.$eval('#jhpNote', n => n.textContent);
    ok(h && (await cls(p)).includes('jh-photo') && re.test(note), 'Storage ' + (mode === 'off' ? 'not set up (refused)' : 'unreachable') + ': the photo works here, one quiet note', note);
    ok(A.errors.length === 0, 'Storage ' + mode + ': nothing else breaks (no errors)', A.errors);
    if (mode === 'down') { // retries back off: 30 s, then 60 s
      const n0 = be.log.filter(x => /firebasestorage/.test(x.url)).length;
      await p.clock.runFor(25000); const n1 = be.log.filter(x => /firebasestorage/.test(x.url)).length;
      await p.clock.runFor(10000); await p.waitForTimeout(300); const n2 = be.log.filter(x => /firebasestorage/.test(x.url)).length;
      await p.clock.runFor(45000); await p.waitForTimeout(300); const n3 = be.log.filter(x => /firebasestorage/.test(x.url)).length;
      await p.clock.runFor(20000); await p.waitForTimeout(300); const n4 = be.log.filter(x => /firebasestorage/.test(x.url)).length;
      ok(n1 === n0 && n2 === n1 + 1 && n3 === n2 && n4 === n3 + 1, 'retries back off: one try 30 s later, the next 60 s after that', { n0, n1, n2, n3, n4 });
      be.storage = 'ok'; await p.clock.runFor(130000); await p.waitForTimeout(500);
      ok(await until(() => be.st.get('users/u1/journal-header.jpg'), 5000), 'back online: it goes up on the next try');
    }
    await A.close();
  }
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
    const h = await pickWait(p, photo('land.jpg')); await until(() => be.st.get('users/u1/journal-header.jpg'), 10000); await p.click('#jhpDone');
    const file = await p.evaluate(() => new Promise(res => { const a = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { HTMLAnchorElement.prototype.click = a; fetch(this.href).then(x => x.text()).then(res); }; document.getElementById('backupDownload').click(); }));
    const d = JSON.parse(file), f = path.join(PH, 'q91-backup2.json');
    const none = JSON.parse(file); delete none.headerPhoto; none.settings.journalHeader = { style: 'stripes', x: 50, y: 50, zoom: 1, updatedAt: 9, photoAt: 0, goneAt: 0 };
    fs.writeFileSync(f, JSON.stringify(none)); await p.setInputFiles('#backupFile', f);
    ok(await until(() => !be.st.get('users/u1/journal-header.jpg') ? 1 : null, 10000), 'restoring a backup without a photo: Storage follows (nothing left there)');
    fs.writeFileSync(f, JSON.stringify(d)); await p.setInputFiles('#backupFile', f);
    const back = await until(async () => { const k = await header(p), s = be.st.get('users/u1/journal-header.jpg'); return k.photoAt > h.photoAt && s && s.at === String(k.photoAt) ? k : null; }, 15000);
    ok(back, 'restoring a backup with a photo: it is the newest photo, in Storage too', back);
    // Delete my account (no erase): Storage first, then Firestore; this device keeps its photo, no longer marked up
    await p.click('nav.tabs button[data-view=plan]'); await p.evaluate(() => document.getElementById('syncDelete').click()); await p.waitForTimeout(400);
    await p.click('#syncDelGo'); const done = await until(() => be.deletedUsers.includes('u1') ? 1 : null, 20000);
    const sdel = be.log.find(x => x.storage && x.storage.op === 'delete' && x.page === 'A' && x.t > back.updatedAt), fdel = be.log.find(x => x.ops && x.ops.some(o => o.startsWith('del ')) && x.t > back.updatedAt);
    ok(done && sdel && fdel && sdel.t <= fdel.t && !be.st.size, 'Delete my account: the photo in Storage goes first, then Firestore', { s: sdel && sdel.t, f: fdel && fdel.t, st: be.st.size });
    const r = await idbPhoto(p); ok(r && r.up === '' && (await header(p)).photoAt === back.photoAt, 'without erase this device keeps its photo (no longer marked as backed up)', r && r.up);
    ok(A.errors.length === 0, 'delete: no errors', A.errors); await A.close(); }
  { const be = new Backend(); ALL_REQ.push(be.log); const A = await synced(be, { label: 'A' }); const p = A.p; await p.waitForTimeout(800);
    await pickWait(p, photo('land.jpg')); await until(() => be.st.get('users/u1/journal-header.jpg'), 10000); await p.click('#jhpDone');
    await p.click('nav.tabs button[data-view=plan]'); await p.evaluate(() => document.getElementById('syncDelete').click()); await p.waitForTimeout(400);
    await p.check('#syncDelErase'); await p.click('#syncDelGo'); await until(() => be.deletedUsers.includes('u1') ? 1 : null, 20000); await p.waitForTimeout(2500);
    ok(!be.st.size && !(await idbPhoto(p)) && !(await header(p)), 'Delete my account with erase: Storage, this device’s photo and the setting all gone');
    await A.close(); }
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
for (const [name, fn] of sections) {
  if (ONLY.length && !ONLY.includes(name)) continue;
  console.log('— ' + name); try { await fn(); } catch (e) { ok(false, name + ': threw', String(e && e.stack || e).slice(0, 500)); }
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
  const syncRun = !ONLY.length || ONLY.some(n => ['sync', 'races', 'storage', 'account'].includes(n));
  ok(reqs.length > (ONLY.length ? 0 : 200) && (!syncRun || ups.length > 3), 'privacy: every request recorded (' + reqs.length + '), ' + ups.length + ' Storage uploads among them');
  ok(!bad.length, 'privacy: no request but the account’s own Storage upload carries the image (no FF D8 FF, /9j/ or data:image anywhere else)', bad.slice(0, 5));
  ok(ups.every(x => x.storage.path === 'users/' + new URL(x.url).searchParams.get('uid') + '/journal-header.jpg'), 'privacy: each upload goes to its own account’s path');
  ok(!reqs.some(x => /anthropic|openai|claude\.ai|generativelanguage/i.test(x.url)), 'privacy: no request to any AI service');
  ok(/DBG_DROP_SET=\[[^\]]*'journalHeader'/.test(SRC), 'privacy: Copy for troubleshooting leaves the header setting out');
  const names = [...SRC.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]), dup = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))].sort(), mine = names.filter(n => /^jhp/.test(n));
  ok(dup.join() === 'currentAgBand,pick,raceAgBand,render' && mine.length > 60 && new Set(mine).size === mine.length, 'function names: every new one (jhp…) unique, no new duplicate in index.html (the four older inner duplicates only)', { dup, mine: mine.length });
}
await browser.close();
C.done('q91 Journal: your own header photo');
