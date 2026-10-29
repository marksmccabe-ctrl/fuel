// q91 helpers: the sync test pages, a page opener with the Firebase stand-in, IndexedDB and JPEG readers
import fs from 'node:fs';
import path from 'node:path';
import { open } from '../lib/open.mjs';
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
// a reload that keeps this page's data. lib/open.mjs seeds localStorage again when its sessionStorage flag is not seen on a reload, which
// happens now and then in Chromium (about 1 reload in 15 here): the seeded settings and library would come back and the test would read
// the kit's state, not the app's. So the keys it seeds are kept in localStorage first and put back by an init script that runs after its own.
const KEEPS = new WeakSet();
export async function reload(p) {
  const ctx = p.context();
  if (!KEEPS.has(ctx)) { KEEPS.add(ctx); await ctx.addInitScript(() => { try { const k = localStorage.getItem('__q91_keep'); if (k) { const o = JSON.parse(k); Object.keys(o).forEach(n => { if (o[n] == null) localStorage.removeItem(n); else localStorage.setItem(n, o[n]); }); localStorage.removeItem('__q91_keep'); } } catch (e) {} }); }
  await p.evaluate(() => { const o = {}; ['bluebird.settings.v2', 'bluebird.library.v5'].forEach(n => { o[n] = localStorage.getItem(n); }); localStorage.setItem('__q91_keep', JSON.stringify(o)); });
  await p.reload(); await p.waitForLoadState('load');
}
