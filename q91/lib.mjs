// q91 helpers: the sync test pages, a page opener with the Firebase stand-in, IndexedDB and JPEG readers
import fs from 'node:fs';
import path from 'node:path';
import { open, reload as kitReload } from '../lib/open.mjs';
import { syncPageSource } from './fbmock.mjs';

// next to the null page: q91-sync.html (a Firebase config, a Storage bucket) and q91-nobucket.html (no bucket)
export function buildPages(nullPage) {
  const dir = path.dirname(path.resolve(nullPage)), src = fs.readFileSync(nullPage, 'utf8');
  const sync = path.join(dir, 'q91-sync.html'), nob = path.join(dir, 'q91-nobucket.html');
  fs.writeFileSync(sync, syncPageSource(src)); fs.writeFileSync(nob, syncPageSource(src, { bucket: '' }));
  return { sync, nob };
}
// a page signed in to uid (a restored session: this device is linked to it), or signed out (uid null; who: the account a sign-in brings)
export async function openSync(page, be, o = {}) {
  const uid = o.uid === undefined ? 'u1' : o.uid, who = o.who || (uid ? { uid, email: uid + '@example.com', displayName: 'Test ' + uid } : { uid: 'u2', email: 'u2@example.com', displayName: 'Test u2' });
  const storage = Object.assign({ '__mock_user': who }, o.storage || {});
  if (uid) { storage['__mock_auth'] = uid; storage['bluebird.owner.v1'] = { uid, name: who.displayName, email: who.email, photo: '', signedIn: true }; }
  return open(page, Object.assign({ athlete: 'A' }, o, { storage, route: be.handler(o.label || uid || 'out') }));
}
// this device's photo record (IndexedDB fred-journal › header › photo), with the JPEG as bytes
export async function idbPhoto(p) {
  return p.evaluate(() => new Promise(res => { const q = indexedDB.open('fred-journal'); q.onerror = () => res(null);
    q.onsuccess = () => { const db = q.result; if (!db.objectStoreNames.contains('header')) { res(null); return; } const g = db.transaction('header').objectStore('header').get('photo');
      g.onsuccess = () => { const v = g.result; res(v ? { at: v.at, w: v.w, h: v.h, up: v.up, keys: Object.keys(v).sort().join(','), bytes: [...new Uint8Array(v.buf)] } : null); }; g.onerror = () => res(null); }; }))
    .then(v => v && Object.assign(v, { bytes: Buffer.from(v.bytes) }));
}
export const header = p => p.evaluate(() => { try { return JSON.parse(localStorage.getItem('bluebird.settings.v2')).journalHeader || null; } catch (e) { return null; } });
// JPEG segments: [{m: marker, len}] up to the scan
export function segments(buf) {
  const out = []; if (buf[0] !== 0xFF || buf[1] !== 0xD8) return null; let i = 2;
  while (i + 4 <= buf.length) { if (buf[i] !== 0xFF) break; const m = buf[i + 1]; if (m === 0xDA) { out.push({ m, len: 0 }); break; } const len = buf.readUInt16BE(i + 2); out.push({ m, len }); i += 2 + len; }
  return out;
}
export function jpegSize(buf) { let i = 2; while (i + 9 < buf.length) { if (buf[i] !== 0xFF) { i++; continue; } const m = buf[i + 1]; if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) }; i += 2 + buf.readUInt16BE(i + 2); } return null; }
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function until(fn, ms = 15000, step = 150) { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); } catch (e) { v = null; } if (v) return v; await sleep(step); } return v; }
// choose a file through the real button (Choose photo), from the Journal home
export async function choose(p, file, how = '#jhpChoose') {
  if (!(await p.$eval('#jHdr', m => m.classList.contains('open')))) { await p.click('nav.tabs button[data-view=journal]'); await p.waitForTimeout(250); await p.click('#jhCam'); await p.waitForTimeout(350); }
  const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click(how)]); await fc.setFiles(file);
}
// a reload that keeps this page's data. Now and then (about 1 reload in 8-15) Chromium gives a file:// page a blank, throwaway localStorage:
// lib/open.mjs then seeds it again and marks the load window.__kitFresh, and the test would read the kit's state, not the app's. Such a
// load is loaded again (lib/open.mjs reload); the keys it seeds are also kept first and put back by an init script that runs after its own.
const KEEPS = new WeakSet();
export async function reload(p) {
  const ctx = p.context();
  if (!KEEPS.has(ctx)) { KEEPS.add(ctx); await ctx.addInitScript(() => { try { const k = localStorage.getItem('__q91_keep'); if (k) { const o = JSON.parse(k); Object.keys(o).forEach(n => { if (o[n] == null) localStorage.removeItem(n); else localStorage.setItem(n, o[n]); }); localStorage.removeItem('__q91_keep'); } } catch (e) {} }); }
  await p.evaluate(() => { const o = {}; ['bluebird.settings.v2', 'bluebird.library.v5'].forEach(n => { o[n] = localStorage.getItem(n); }); localStorage.setItem('__q91_keep', JSON.stringify(o)); });
  await kitReload(p);
}
// the IJG quality a JPEG was encoded at, from its first luminance quantisation table (DQT, table 0) matched against the standard table
// scaled for each quality 1-100: {q, err} (err 0: an exact match, as Chromium's encoder gives)
const STD_LUM = [16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99];
const ZIGZAG = [0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63];
export function jpegQuality(buf) {
  let i = 2, t = null; while (i + 4 < buf.length) { const m = buf[i + 1], len = buf.readUInt16BE(i + 2); if (m === 0xDB && (buf[i + 4] & 0xF0) === 0 && (buf[i + 4] & 15) === 0) { t = [...buf.subarray(i + 5, i + 5 + 64)]; break; } if (m === 0xDA) break; i += 2 + len; }
  if (!t) return null; let best = 0, err = 1e9;
  for (let q = 1; q <= 100; q++) { const s = q < 50 ? Math.floor(5000 / q) : 200 - 2 * q; let e = 0; for (let k = 0; k < 64; k++) e += Math.abs(Math.min(255, Math.max(1, Math.floor((STD_LUM[ZIGZAG[k]] * s + 50) / 100))) - t[k]); if (e < err) { err = e; best = q; } }
  return { q: best, err };
}
// how many pixels differ (by more than 24 in r + g + b) between two PNG screenshots of the same size (decoded in the page)
export function pxDiff(p, a, b) {
  return p.evaluate(async ([A, B]) => { const px = async b64 => { const im = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()), c = new OffscreenCanvas(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, im.width, im.height).data; };
    const s = await px(A), u = await px(B); if (s.length !== u.length) return -1; let n = 0; for (let i = 0; i < s.length; i += 4) if (Math.abs(s[i] - u[i]) + Math.abs(s[i + 1] - u[i + 1]) + Math.abs(s[i + 2] - u[i + 2]) > 24) n++; return n; }, [a.toString('base64'), b.toString('base64')]);
}
