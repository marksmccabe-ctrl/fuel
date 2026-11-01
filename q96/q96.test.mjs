// node q96.test.mjs <null.html> [main null.html]   (cd into this folder first) -- item 96: Sync: one device can't undo another's settings,
// and late uploads aren't missed. Two devices on the kit's stand-in Firebase (../q91/fbmock.mjs), every QA line and numbered point:
//   cache    sw.js CACHE and APP_BUILD match, v120 or later
//   link     after sign-in the cloud has users/{uid}.settingsAt: a stamp for every settings key and _u = settings.updatedAt
//   fields   point 1 / QA 1: device B changes a setting (the race name) while A is offline; A, which has not pulled, saves a weigh-in (it sets
//            the Profile weight); A comes back online: its upload writes only the keys it changed (settings.<key> paths, never the whole
//            settings), the cloud keeps B's race name and gets A's weight, and after both sync each device has both
//   legacy   point 1: an older build writes the whole settings doc (newer updatedAt, settingsAt untouched): a new device takes its change and
//            writes the stamps back (settingsAt._u = settings.updatedAt again); a key this device changed after that write still wins
//   late     point 2 / QA 2: device B (its clock 30 minutes behind, as a phone saved offline earlier) saves a note and a weigh-in offline; A
//            pulls and moves on (a weigh-in of its own, its cursor past B's records); B comes online and uploads: every record in the cloud
//            carries syncedAt (a server Timestamp), and A's next incremental pull (not the daily full one) gets both; A's cursor follows
//            the upload time (sat)
//   guards   the deficit and the deleted-bike guards from items 92 and 91 still hold through a key-by-key merge (the q91/q92 item tests
//            cover the rest in the kit)
//   main     with [main null.html]: the fields and late scenarios fail on main (the checks are not vacuous)
// Q96_ONLY=<sections, comma-separated> runs a part. About 3 minutes.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { open, checker } from '../lib/open.mjs';
import { Backend, syncPageSource } from '../q91/fbmock.mjs';

const PAGE = path.resolve(process.argv[2] || '../../fred96/null.html'), MAIN = process.argv[3] ? path.resolve(process.argv[3]) : null;
const ONLY = (process.env.Q96_ONLY || '').split(',').filter(Boolean);
const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = process.env.Q96_REPO || path.resolve(HERE, '../../wt-q96');
const C = checker('q96 '), ok = C.ok, ERRS = [];
const SRC = fs.readFileSync(PAGE, 'utf8');
const syncPage = p => { const f = path.join(path.dirname(p), 'q96-sync.html'); fs.writeFileSync(f, syncPageSource(fs.readFileSync(p, 'utf8'))); return f; };
const SYNC = syncPage(PAGE), SYNC_MAIN = MAIN ? syncPage(MAIN) : null;
const browser = await chromium.launch();
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000, step = 150) { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); } catch (e) { v = null; } if (v) return v; await sleep(step); } return v; }
const NOW = new Date(Date.now()).toISOString();

async function synced(be, o = {}) {
  const who = { uid: 'u1', email: 'u1@example.com', displayName: 'Test u1' };
  const storage = Object.assign({ '__mock_user': who, '__mock_auth': 'u1', 'bluebird.owner.v1': { uid: 'u1', name: who.displayName, email: who.email, photo: '', signedIn: true } }, o.storage || {});
  const x = await open(o.file || SYNC, Object.assign({ athlete: 'A', browser, now: NOW, repo: REPO, settle: 1200 }, o, { storage, route: be.handler(o.label || 'a') }));
  x.label = o.label || 'a'; x.errors.label = x.label; if (!o.noErrs) ERRS.push(x.errors); x.p.on('dialog', d => d.accept()); return x; }
async function offline(be, o, on) { if (on) be.offline.add(o.label); else be.offline.delete(o.label); await o.ctx.setOffline(on); if (!on) await o.p.evaluate(() => window.dispatchEvent(new Event('online'))); }
const LS = (p, k) => p.evaluate(n => { try { return JSON.parse(localStorage.getItem(n)); } catch (e) { return null; } }, k);
const sets = p => LS(p, 'bluebird.settings.v2').then(v => v || {});
const weights = p => LS(p, 'bluebird.weights.v1').then(v => v || []);
const notes = p => LS(p, 'bluebird.notes.v1').then(v => v || []);
const tab = async (p, v) => { await p.click('nav.tabs button[data-view=' + v + ']'); await p.waitForTimeout(350); };
async function journalHome(p) { await tab(p, 'journal'); if (await p.$eval('#jList', e => !e.hidden)) { await p.click('#jBack'); await p.waitForTimeout(300); } }
async function weighIn(p, lb) { await journalHome(p); await p.click('#jNoteAdd'); await p.waitForTimeout(400); await p.click('[data-jne="weigh"]'); await p.waitForTimeout(400);
  for (const k of String(lb)) await p.click(`#wghSheet [data-wgh-key="${k}"]`); await p.click('#wghSheet [data-wgh="save"]'); await p.waitForTimeout(500); }
async function addNote(p, title) { await journalHome(p); await p.click('#jNoteAdd'); await p.waitForTimeout(400); await p.click('[data-jne="note"]'); await p.waitForTimeout(400);
  await p.fill('#neTitleIn', title); await p.click('[data-ne="save"]'); await p.waitForTimeout(500); }
const raceName = (p, v) => p.evaluate(v => { const e = document.getElementById('pRaceName'); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }, v);
// a pull nudge: the app pulls when it comes back to the front (at most every 10 s), so keep telling it so until cond holds
async function settle(pages, cond, ms = 45000) { const t = Date.now(); while (Date.now() - t < ms) { for (const pg of pages) await pg.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(1500); const v = await cond().catch(() => null); if (v) return v; } return null; }
const doc = be => be.fs.get('users/u1') || {};
// the settings writes a page sent: each commit's users/u1 op with its merge field list
const docWrites = (be, label) => be.log.filter(r => r.page === label && /\/mock\/commit$/.test(r.url)).flatMap(r => { let b = {}; try { b = JSON.parse(r.body.toString('utf8')); } catch (e) {} return (b.ops || []).filter(o => o.path === 'users/u1').map(o => Array.isArray(o.merge) ? o.merge : ['(whole doc)']); });
const ready = async (be, ...xs) => { for (const x of xs) await until(() => x.p.evaluate(() => { const o = JSON.parse(localStorage.getItem('bluebird.synccursor.v1') || 'null'); return !!(o && o.full); }), 20000); await until(() => doc(be).settings, 15000); };

const sections = [];
const section = (n, f) => sections.push([n, f]);

section('cache', async () => {
  const sw = fs.readFileSync(path.join(path.dirname(PAGE), 'sw.js'), 'utf8');
  const b = (SRC.match(/const APP_BUILD='([^']+)'/) || [])[1], c = (sw.match(/const CACHE = '([^']+)'/) || [])[1];
  ok(!!b && b === c && +(b.match(/v(\d+)$/) || [])[1] >= 120, 'cache: APP_BUILD = sw.js CACHE, v120 or later', { b, c });
});

// the fields scenario on a page (this branch, or main for the mutant check): returns what the cloud and both devices ended with
async function fieldsRun(file, tag) {
  const be = new Backend(), A = await synced(be, { label: 'A' + tag, file, noErrs: !!tag }), B = await synced(be, { label: 'B' + tag, file, noErrs: !!tag });
  await ready(be, A, B); const link = JSON.parse(JSON.stringify(doc(be)));
  await offline(be, A, true);
  await raceName(B.p, 'From B');
  const up = await until(() => doc(be).settings && doc(be).settings.raceName === 'From B' ? 1 : null, 15000);
  const n0 = docWrites(be, A.label).length;
  await weighIn(A.p, '171.4'); const aw = (await sets(A.p)).weightLb;
  await offline(be, A, false);
  const cloud = await until(() => { const s = doc(be).settings; return s && s.weightLb === 171.4 ? JSON.parse(JSON.stringify(s)) : null; }, 20000);
  const aEnd = await settle([A.p], async () => { const s = await sets(A.p); return s.raceName === 'From B' && s.weightLb === 171.4 ? s : null; }, 30000) || await sets(A.p);
  const bEnd = await settle([B.p], async () => { const s = await sets(B.p); return s.raceName === 'From B' && s.weightLb === 171.4 ? s : null; }, 30000) || await sets(B.p);
  const writes = docWrites(be, A.label).slice(n0), errs = A.errors.concat(B.errors);
  await A.close(); await B.close();
  return { link, up, aw, cloud, final: doc(be).settings, aEnd: { raceName: aEnd.raceName, weightLb: aEnd.weightLb }, bEnd: { raceName: bEnd.raceName, weightLb: bEnd.weightLb }, writes, errs };
}

section('fields', async () => {
  const r = await fieldsRun(SYNC, '');
  const at = r.link.settingsAt || {}, keys = Object.keys(r.link.settings || {}).filter(k => k !== 'updatedAt' && !['profileSeen', 'setupDone', 'disclaimerSeen'].includes(k));
  ok(at._u === r.link.settings.updatedAt && keys.length > 10 && keys.every(k => typeof at[k] === 'number'), 'link: the cloud has settingsAt, a stamp for every settings key and _u = settings.updatedAt', { u: at._u, upd: r.link.settings && r.link.settings.updatedAt, missing: keys.filter(k => typeof at[k] !== 'number') });
  ok(r.up, 'fields: B\'s race name reaches the cloud');
  ok(r.aw === 171.4, 'fields: A\'s weigh-in (offline) sets its Profile weight', r.aw);
  ok(r.writes.length > 0 && r.writes.every(f => !f.includes('settings') && !f.includes('(whole doc)') && f.includes('settings.weightLb') && f.includes('settingsAt.weightLb') && !f.includes('settings.raceName')), 'fields: A\'s upload writes only the keys it changed (settings.weightLb and its stamp), never the whole settings', r.writes);
  ok(r.cloud && r.cloud.raceName === 'From B', 'fields: the cloud keeps B\'s race name after A\'s upload (QA 1)', r.cloud && r.cloud.raceName);
  ok(r.final && r.final.raceName === 'From B' && r.final.weightLb === 171.4, 'fields: the cloud ends with both', r.final && { raceName: r.final.raceName, weightLb: r.final.weightLb });
  ok(r.aEnd.raceName === 'From B' && r.aEnd.weightLb === 171.4, 'fields: A ends with B\'s race name and its own weight', r.aEnd);
  ok(r.bEnd.raceName === 'From B' && r.bEnd.weightLb === 171.4, 'fields: B ends with its race name and A\'s weight', r.bEnd);
  if (SYNC_MAIN) { const m = await fieldsRun(SYNC_MAIN, 'm'); ok(!(m.final && m.final.raceName === 'From B' && m.aEnd.raceName === 'From B'), 'main: the same steps lose B\'s race name there (the check is not vacuous)', { cloud: m.final && m.final.raceName, a: m.aEnd }); }
});

section('legacy', async () => {
  const be = new Backend(), A = await synced(be, { label: 'A' }); await ready(be, A);
  // an older build writes the whole settings doc (its own updatedAt, a newer race name; it knows nothing of settingsAt)
  const d = JSON.parse(JSON.stringify(doc(be))), t = Date.now() + 60000; d.settings.raceName = 'Old build'; d.settings.updatedAt = t; be.fs.set('users/u1', d);
  const got = await settle([A.p], async () => (await sets(A.p)).raceName === 'Old build' ? 1 : null);
  ok(got, 'legacy: the new device takes the older build\'s change');
  const norm = await until(() => { const x = doc(be); return x.settingsAt && x.settingsAt._u === x.settings.updatedAt && x.settings.updatedAt !== t ? x : null; }, 20000);
  ok(norm && norm.settings.raceName === 'Old build' && typeof norm.settingsAt.raceName === 'number' && norm.settingsAt.raceName >= t, 'legacy: and writes the stamps back (settingsAt._u = settings.updatedAt; the older build\'s keys at its time)', norm && { u: norm.settingsAt._u, upd: norm.settings.updatedAt, rn: norm.settingsAt.raceName, t });
  // a key changed here after an older build's write wins over it
  await offline(be, A, true); await sleep(200); await raceName(A.p, 'Mine, later'); await sleep(300);
  const d2 = JSON.parse(JSON.stringify(doc(be))); d2.settings.raceName = 'Old build 2'; d2.settings.cagesNote = 'x'; d2.settings.updatedAt = Date.now() - 30000; be.fs.set('users/u1', d2);
  await offline(be, A, false);
  const end = await settle([A.p], async () => { const s = await sets(A.p), c = doc(be).settings; return s.cagesNote === 'x' && c.raceName === 'Mine, later' ? { s, c } : null; });
  ok(end && end.s.raceName === 'Mine, later' && end.c.raceName === 'Mine, later' && end.s.cagesNote === 'x', 'legacy: a key changed here after the older build\'s write stands; the older build\'s other change comes in', end && { here: end.s.raceName, cloud: end.c.raceName, other: end.s.cagesNote });
  await A.close();
});

// the late scenario: returns what A saw before and after B's late upload
async function lateRun(file, tag) {
  const be = new Backend(), A = await synced(be, { label: 'A' + tag, file, noErrs: !!tag });
  const B = await synced(be, { label: 'B' + tag, file, noErrs: !!tag, now: new Date(Date.parse(NOW) - 30 * 60e3).toISOString() });
  await ready(be, A, B);
  await offline(be, B, true);
  await weighIn(B.p, '169.8'); await addNote(B.p, 'Late note');
  const bw = (await weights(B.p)).find(w => w.lb === 169.8), bn = (await notes(B.p)).find(n => n.title === 'Late note');
  // A moves on: a weigh-in of its own, pulled back, so its cursor is past B's records (saved 30 minutes "earlier")
  await weighIn(A.p, '172.0');
  await until(() => [...be.fs.keys()].some(k => /^users\/u1\/weights\//.test(k) && be.fs.get(k).lb === 172), 15000);
  await settle([A.p], async () => { const c = await LS(A.p, 'bluebird.synccursor.v1'); return c && c.at > Date.now() - 5 * 60e3 ? 1 : null; }, 20000);
  // and a ride saved on another device a moment ago, pulled here too: on main only rides and races move the cursor, so put it where that
  // pull leaves it (the same on both builds; the upload-time cursor is left as it is)
  await A.p.evaluate(() => { const c = JSON.parse(localStorage.getItem('bluebird.synccursor.v1')); c.at = Math.max(+c.at || 0, Date.now()); localStorage.setItem('bluebird.synccursor.v1', JSON.stringify(c)); });
  const cur0 = await LS(A.p, 'bluebird.synccursor.v1');
  await offline(be, B, false);
  const landed = await until(() => { const w = bw && be.fs.get('users/u1/weights/' + bw.id), n = bn && be.fs.get('users/u1/notes/' + bn.id); return w && n ? { w, n } : null; }, 20000);
  const fullBefore = cur0 && cur0.full;
  const got = await settle([A.p], async () => { const w = await weights(A.p), n = await notes(A.p); return bw && bn && w.some(x => x.id === bw.id) && n.some(x => x.id === bn.id) ? 1 : null; }, 40000);
  const cur1 = await LS(A.p, 'bluebird.synccursor.v1'), errs = A.errors.concat(B.errors);
  await A.close(); await B.close();
  return { bw, bn, cur0, cur1, landed, got, fullSame: !!fullBefore && cur1 && cur1.full === fullBefore, errs };
}

section('late', async () => {
  const r = await lateRun(SYNC, '');
  ok(r.bw && r.bn, 'late: B saves a weigh-in and a note while offline', { bw: !!r.bw, bn: !!r.bn });
  ok(r.cur0 && r.bw && r.cur0.at - 10 * 60e3 > r.bw.updatedAt && r.cur0.at - 10 * 60e3 > r.bn.updatedAt, 'late: A\'s cursor is past B\'s records (by more than the 10 minute margin) before B uploads', r.cur0 && r.bw && { at: r.cur0.at, w: r.bw.updatedAt });
  const ts = v => v && typeof v === 'object' && typeof v.seconds === 'number' && typeof v.nanoseconds === 'number';
  ok(r.landed && ts(r.landed.w.syncedAt) && ts(r.landed.n.syncedAt) && typeof r.landed.w.updatedAt === 'number', 'late: each record in the cloud carries syncedAt, a server Timestamp, beside its updatedAt', r.landed && { w: r.landed.w.syncedAt, n: r.landed.n.syncedAt });
  ok(r.got, 'late: A\'s next pull gets B\'s weigh-in and note (QA 2)');
  ok(r.fullSame, 'late: through an incremental pull (no daily full pull ran)', { before: r.cur0 && r.cur0.full, after: r.cur1 && r.cur1.full });
  ok(r.cur1 && r.cur1.sat > 0 && r.landed && r.cur1.sat >= r.landed.w.syncedAt.seconds * 1000, 'late: A\'s upload-time cursor (sat) follows the records it pulled', r.cur1);
  if (SYNC_MAIN) { const m = await lateRun(SYNC_MAIN, 'm'); ok(!m.got, 'main: A misses them there until the daily full pull (the check is not vacuous)', { got: m.got }); }
});

section('guards', async () => {
  const be = new Backend(), A = await synced(be, { label: 'A' }), B = await synced(be, { label: 'B' }); await ready(be, A, B);
  // B deletes a bike; A (offline, not pulled) changes another key; both sync: the bike stays deleted on both and in the cloud
  const bike = ((await sets(B.p)).bikes || [])[0];
  await offline(be, A, true);
  await tabSettingsBikes(B.p); const del = await B.p.$(`[data-bike-del="${bike.id}"]`); if (del) { await B.p.evaluate(id => { const d = document.querySelector(`[data-bike-del="${id}"]`).closest('details'); if (d) d.open = true; }, bike.id); await del.click(); await B.p.waitForTimeout(400); await B.p.click('#bikeDelGo'); await B.p.waitForTimeout(600); } /* its confirm sheet */
  const gone = await until(() => { const s = doc(be).settings; return s && s.bikeTombs && s.bikeTombs[bike.id] && !(s.bikes || []).some(b => b.id === bike.id) ? 1 : null; }, 15000);
  ok(gone, 'guards: B deletes a bike (a tombstone in the cloud)', bike && bike.id);
  await raceName(A.p, 'A offline'); await offline(be, A, false);
  const end = await settle([A.p, B.p], async () => { const a = await sets(A.p), b = await sets(B.p), c = doc(be).settings; return a.raceName === 'A offline' && b.raceName === 'A offline' && c.raceName === 'A offline' ? { a, b, c } : null; });
  ok(end && [end.a, end.b, end.c].every(s => !(s.bikes || []).some(x => x.id === bike.id)), 'guards: the deleted bike stays deleted on both devices and in the cloud, and A\'s change lands', end && [end.a, end.b, end.c].map(s => (s.bikes || []).map(x => x.id)));
  await A.close(); await B.close();
});
async function tabSettingsBikes(p) { await p.click('#syncHdr:visible, #syncHdrIn:visible'); await p.waitForTimeout(500); await p.click('#view-profile .prow[data-prow="bikes"] .prow-h'); await p.waitForTimeout(500); }

for (const [n, f] of sections) { if (ONLY.length && !ONLY.includes(n)) continue; try { await f(); } catch (e) { ok(false, n + ': threw', String(e && e.stack || e).slice(0, 500)); } }
ok(ERRS.every(e => e.length === 0), 'no page or console errors', ERRS.filter(e => e.length).map(e => [e.label, ...e.slice(0, 3)]));
await browser.close();
C.done('q96 Sync: one device can\'t undo another\'s settings, and late uploads aren\'t missed');
