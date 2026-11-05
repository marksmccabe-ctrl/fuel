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
//            to the millisecond (review round 1, again); then B, offline again, saves a ride, a race and a chapter and deletes a note both
//            devices have: each cloud doc (the tombstone too) carries syncedAt, A's incremental pull gets them all and its sat moves to
//            their upload time (every kind); and a record uploaded inside the 10 minute margin before A's upload-time cursor still comes
//            in (the skew is applied to sat)
//   defaults (review round 1, again) A's stored settings predate keys (no planMode, no wbgtCold, a volume without weekStart: a newer
//            build added them) and A relaunches offline; B changes all three; A saves only its race name: A queues only raceName, and after A
//            is opened again online and both sync B's three values stand on both devices and in the cloud, with A's race name
//   upgrade  (review round 1) a settings change an older build left queued (docmeta with no per-key stamps, 'settings:settings' in the
//            queue) against an older build's cloud doc: after the first v120 launch the change is on the device and in the cloud
//   signin   (review round 1) a signed-out device with its own race name and a deleted-elsewhere bike signs in from the card (syncLink)
//            against an older build's cloud doc and against a stamped one: right after the link and after two more pulls, the device and
//            the cloud both hold the account's race name and the bike stays deleted
//   guards   the deleted-bike guard holds through a key-by-key merge: A (offline, not pulled) renames another bike after B deleted one, so
//            A's bikes key is the newer, and the deleted bike still stays deleted (bikeTombMerge does it; the per-key merge alone would bring
//            it back); the deficit guard: an older build's whole-doc write without the deficits leaves this device's deficits in place
//            and they go back up (dfcGuard does it). The header photo guard (jhpDocMerge) is covered by the q91 kit test.
//   main     with [main null.html]: the fields and late scenarios fail on main (the checks are not vacuous)
// Q96_ONLY=<sections, comma-separated> runs a part. About 3 minutes.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { open, checker, reload } from '../lib/open.mjs';
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
const WHO = { uid: 'u1', email: 'u1@example.com', displayName: 'Test u1' };

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

// a server Timestamp in ms (full precision), and the newest upload time of any record in the cloud
const tsMs = v => v && typeof v === 'object' && typeof v.seconds === 'number' ? v.seconds * 1000 + Math.floor((v.nanoseconds || 0) / 1e6) : 0;
const cloudSat = be => Math.max(0, ...[...be.fs.keys()].filter(k => /^users\/u1\/(journal|races|chapters|notes|weights)\//.test(k)).map(k => tsMs((be.fs.get(k) || {}).syncedAt)));
// the late scenario: returns what A saw before and after B's late upload
async function lateRun(file, tag) {
  const be = new Backend(), A = await synced(be, { label: 'A' + tag, file, noErrs: !!tag });
  const B = await synced(be, { label: 'B' + tag, file, noErrs: !!tag, now: new Date(Date.parse(NOW) - 30 * 60e3).toISOString() });
  await ready(be, A, B);
  // a note both devices have, which B deletes in the second step
  let gone = null;
  if (!tag) { await addNote(B.p, 'Gone note'); gone = (await notes(B.p)).find(n => n.title === 'Gone note');
    await until(() => gone && be.fs.get('users/u1/notes/' + gone.id), 15000); await settle([A.p], async () => (await notes(A.p)).some(x => gone && x.id === gone.id) ? 1 : null, 30000); }
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
  await sleep(1500);
  const cur1 = await LS(A.p, 'bluebird.synccursor.v1'), newest1 = cloudSat(be);
  // every kind, saved by the app itself: B (offline again, its clock still behind) saves a ride (journal entry), a race and a chapter and
  // deletes the note both devices have; when it comes online each of those cloud docs (the tombstone too) carries syncedAt, and A's
  // incremental pull gets them (and drops the note)
  let other = null, otherGot = null, cur2 = null, newest2 = null;
  if (!tag) {
    await offline(be, B, true);
    // the ride, race and chapter come in through a backup restore (the app's own save path), the note goes through its editor's Delete
    const now = Date.now() - 30 * 60e3, day = new Date(now - 864e5).toISOString().slice(0, 10);
    const bk = { app: 'bluebird-fuel', kind: 'all', exported: new Date(now).toISOString(), journal: [{ id: 'q96ride', date: day, title: 'Late ride', type: 'ride', createdAt: now, updatedAt: now }], races: [{ id: 'q96race', name: 'Late race', date: day, type: 'road', updatedAt: new Date(now).toISOString() }], chapters: [{ id: 'q96ch', name: 'Late chapter', start: day, updatedAt: new Date(now).toISOString() }] };
    await B.p.setInputFiles('#backupFile', { name: 'q96.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(bk)) }); await B.p.waitForTimeout(800);
    await journalHome(B.p); await B.p.evaluate(() => document.querySelector('[data-jh-open="all"]').click()); await B.p.waitForTimeout(500); await B.p.evaluate(id => document.querySelector('[data-note-open="' + id + '"]').click(), gone && gone.id); await B.p.waitForTimeout(400);
    await B.p.evaluate(() => document.querySelector('[data-nv="edit"]').click()); await B.p.waitForTimeout(400);
    await B.p.evaluate(() => document.querySelector('#noteEd [data-ne="delete"]').click()); await B.p.waitForTimeout(500);
    other = { journal: 'q96ride', races: 'q96race', chapters: 'q96ch', notes: gone && gone.id };
    other.saved = { j: (await LS(B.p, 'bluebird.journal.v1') || []).some(x => x.id === 'q96ride'), r: (await LS(B.p, 'bluebird.races.v1') || []).some(x => x.id === 'q96race'), c: (await LS(B.p, 'bluebird.chapters.v1') || []).some(x => x.id === 'q96ch'), gone: !(await notes(B.p)).some(x => gone && x.id === gone.id) };
    await offline(be, B, false);
    other.landed = await until(() => { const r = {}; for (const c of ['journal', 'races', 'chapters', 'notes']) { const d = be.fs.get('users/u1/' + c + '/' + other[c]); if (!d || (c === 'notes' && !d.deleted)) return null; r[c] = d; } return r; }, 20000);
    const has = (p, k, id) => LS(p, k).then(v => (v || []).some(x => x && x.id === id));
    const ids = async p => ({ j: await has(p, 'bluebird.journal.v1', 'q96ride'), r: await has(p, 'bluebird.races.v1', 'q96race'), c: await has(p, 'bluebird.chapters.v1', 'q96ch'), gone: !(await has(p, 'bluebird.notes.v1', gone && gone.id)) });
    otherGot = await settle([A.p], async () => { const o = await ids(A.p); return o.j && o.r && o.c && o.gone ? o : null; }, 40000) || await ids(A.p);
    await sleep(1500);
    cur2 = await LS(A.p, 'bluebird.synccursor.v1'); newest2 = cloudSat(be);
  }
  // the skew: A's upload-time cursor 5 minutes past the upload time those records got (inside the 10 minute margin), its updatedAt cursor
  // past everything; B (online, its clock still behind) saves one more note: only the upload-time query, with the margin, finds it
  let skew = null;
  if (!tag && landed) {
    const sat = Math.max(landed.w.syncedAt.seconds * 1000, newest2 || 0) + 5 * 60e3;
    await A.p.evaluate(sat => { const c = JSON.parse(localStorage.getItem('bluebird.synccursor.v1')); c.sat = sat; c.at = Math.max(+c.at || 0, Date.now() + 60 * 60e3); localStorage.setItem('bluebird.synccursor.v1', JSON.stringify(c)); }, sat);
    await addNote(B.p, 'Skew note'); const sn = (await notes(B.p)).find(n => n.title === 'Skew note');
    const sl = sn && await until(() => be.fs.get('users/u1/notes/' + sn.id), 20000);
    const sg = await settle([A.p], async () => (await notes(A.p)).some(x => sn && x.id === sn.id) ? 1 : null, 30000);
    skew = { sat, landedAt: sl && sl.syncedAt ? sl.syncedAt.seconds * 1000 : null, got: !!sg, full: (await LS(A.p, 'bluebird.synccursor.v1') || {}).full === fullBefore };
  }
  const errs = A.errors.concat(B.errors);
  await A.close(); await B.close();
  return { bw, bn, other, otherGot, cur0, cur1, cur2, newest1, newest2, landed, got, skew, fullSame: !!fullBefore && cur1 && cur1.full === fullBefore, full2Same: !!fullBefore && cur2 && cur2.full === fullBefore, errs };
}

section('late', async () => {
  const r = await lateRun(SYNC, '');
  ok(r.bw && r.bn, 'late: B saves a weigh-in and a note while offline', { bw: !!r.bw, bn: !!r.bn });
  ok(r.cur0 && r.bw && r.cur0.at - 10 * 60e3 > r.bw.updatedAt && r.cur0.at - 10 * 60e3 > r.bn.updatedAt, 'late: A\'s cursor is past B\'s records (by more than the 10 minute margin) before B uploads', r.cur0 && r.bw && { at: r.cur0.at, w: r.bw.updatedAt });
  const ts = v => v && typeof v === 'object' && typeof v.seconds === 'number' && typeof v.nanoseconds === 'number';
  ok(r.landed && ts(r.landed.w.syncedAt) && ts(r.landed.n.syncedAt) && typeof r.landed.w.updatedAt === 'number', 'late: each record in the cloud carries syncedAt, a server Timestamp, beside its updatedAt', r.landed && { w: r.landed.w.syncedAt, n: r.landed.n.syncedAt });
  ok(r.got, 'late: A\'s next pull gets B\'s weigh-in and note (QA 2)');
  ok(r.fullSame, 'late: through an incremental pull (no daily full pull ran)', { before: r.cur0 && r.cur0.full, after: r.cur1 && r.cur1.full });
  ok(r.cur1 && r.landed && r.newest1 > 0 && r.cur1.sat === r.newest1 && r.newest1 === Math.max(tsMs(r.landed.w.syncedAt), tsMs(r.landed.n.syncedAt)), 'late: A\'s upload-time cursor (sat) is the upload time of the weigh-in and note it pulled, to the millisecond', { sat: r.cur1 && r.cur1.sat, newest: r.newest1, w: r.landed && tsMs(r.landed.w.syncedAt), n: r.landed && tsMs(r.landed.n.syncedAt) });
  const L = r.other && r.other.landed;
  ok(r.other && r.other.saved && Object.values(r.other.saved).every(Boolean), 'late: B (offline) saves a ride, a race and a chapter (a backup restore) and deletes a note in the app', r.other && r.other.saved);
  ok(L && ['journal', 'races', 'chapters', 'notes'].every(c => ts(L[c].syncedAt)) && L.notes.deleted === true, 'late: a ride, a race and a chapter B saved offline, and its delete of a note (the tombstone), each carry syncedAt in the cloud', L && Object.fromEntries(Object.entries(L).map(([c, d]) => [c, d.syncedAt || null])));
  ok(r.otherGot && r.otherGot.j && r.otherGot.r && r.otherGot.c && r.otherGot.gone && r.full2Same, 'late: and they come in through A s incremental pull too (every kind; the note is gone)', { got: r.otherGot, full: r.full2Same });
  ok(r.cur2 && r.newest2 > r.newest1 && r.cur2.sat === r.newest2, 'late: and A s upload-time cursor moves to their upload time (every kind moves it)', { sat: r.cur2 && r.cur2.sat, newest: r.newest2 });
  ok(r.skew && r.skew.landedAt && r.skew.landedAt < r.skew.sat && r.skew.landedAt > r.skew.sat - 10 * 60e3 && r.skew.got && r.skew.full, 'late: a record uploaded inside the 10 minute margin before A s upload-time cursor still comes in (the skew applies to sat)', r.skew);
  if (SYNC_MAIN) { const m = await lateRun(SYNC_MAIN, 'm'); ok(!m.got, 'main: A misses them there until the daily full pull (the check is not vacuous)', { got: m.got }); }
});

section('defaults', async () => {
  const be = new Backend(), A = await synced(be, { label: 'A' }), B = await synced(be, { label: 'B' }); await ready(be, A, B);
  // A's stored copy as an older build left it (no planMode, no wbgtCold, a volume without weekStart); A launches again, offline
  const mem = await A.p.evaluate(() => { const s = JSON.parse(localStorage.getItem('bluebird.settings.v2')), was = { planMode: s.planMode, wbgtCold: s.wbgtCold, weekStart: s.volume && s.volume.weekStart }; delete s.planMode; delete s.wbgtCold; if (s.volume) delete s.volume.weekStart; localStorage.setItem('bluebird.settings.v2', JSON.stringify(s)); return was; });
  await offline(be, A, true); await reload(A.p); await A.p.waitForTimeout(1200);
  // B changes those three: Plan mode in the app, the other two as its key-by-key write (stamped) straight into the stand-in cloud
  await B.p.evaluate(() => document.querySelector('#modeSeg button[data-pm="clothing"]').click());
  await until(() => (doc(be).settings || {}).planMode === 'clothing' ? 1 : null, 15000);
  { const d = JSON.parse(JSON.stringify(doc(be))), tB = Date.now(); d.settings.wbgtCold = 50; d.settings.volume = Object.assign({}, d.settings.volume, { weekStart: 'sun' }); d.settings.updatedAt = tB;
    Object.assign(d.settingsAt, { wbgtCold: tB, volume: tB, _u: tB }); be.fs.set('users/u1', d); }
  const bv = s => s && s.planMode === 'clothing' && s.wbgtCold === 50 && s.volume && s.volume.weekStart === 'sun';
  const up = await until(() => bv(doc(be).settings) ? 1 : null, 15000);
  ok(mem.planMode === 'both' && mem.wbgtCold === 60 && mem.weekStart === 'mon' && up, 'defaults: A (relaunched) had the defaults for the keys its stored copy now lacks; B s values for them reach the cloud', { mem, up });
  // A, not pulled, saves only its race name
  await raceName(A.p, 'A unrelated'); await sleep(400);
  const q = await LS(A.p, 'bluebird.docmeta.v1'), queued = Object.keys((q && q.sD) || {});
  ok(queued.length === 1 && queued[0] === 'raceName', 'defaults: A s unrelated save queues only the race name (no default or boot-filled key gets a stamp)', { queued, sF: q && q.sF && { planMode: q.sF.planMode, wbgtCold: q.sF.wbgtCold, volume: q.sF.volume } });
  // A is opened again once it is online (a launch offline loads no Firebase SDK until the next launch)
  await offline(be, A, false); await reload(A.p); await A.p.waitForTimeout(1200);
  const good = s => bv(s) && s.raceName === 'A unrelated';
  const end = await settle([A.p, B.p], async () => { const a = await sets(A.p), b = await sets(B.p), c = doc(be).settings; return good(a) && good(b) && good(c) ? 1 : null; });
  const pick = s => s && { planMode: s.planMode, wbgtCold: s.wbgtCold, weekStart: s.volume && s.volume.weekStart, raceName: s.raceName };
  ok(end, 'defaults: after both sync B s three values stand on both devices and in the cloud, with A s race name', { a: pick(await sets(A.p)), b: pick(await sets(B.p)), c: pick(doc(be).settings) });
  await A.close(); await B.close();
});

section('guards', async () => {
  const be = new Backend(), A = await synced(be, { label: 'A' }), B = await synced(be, { label: 'B' }); await ready(be, A, B);
  // B deletes a bike; A (offline, not pulled) changes another key; both sync: the bike stays deleted on both and in the cloud
  const bike = ((await sets(B.p)).bikes || [])[0];
  await offline(be, A, true);
  await tabSettingsBikes(B.p); const del = await B.p.$(`[data-bike-del="${bike.id}"]`); if (del) { await B.p.evaluate(id => { const d = document.querySelector(`[data-bike-del="${id}"]`).closest('details'); if (d) d.open = true; }, bike.id); await del.click(); await B.p.waitForTimeout(400); await B.p.click('#bikeDelGo'); await B.p.waitForTimeout(600); } /* its confirm sheet */
  const gone = await until(() => { const s = doc(be).settings; return s && s.bikeTombs && s.bikeTombs[bike.id] && !(s.bikes || []).some(b => b.id === bike.id) ? 1 : null; }, 15000);
  ok(gone, 'guards: B deletes a bike (a tombstone in the cloud)', bike && bike.id);
  // A (offline) renames another bike after that delete: its bikes key (still holding the deleted bike) is the newer one
  await raceName(A.p, 'A offline');
  const ren = (((await sets(A.p)).bikes || []).find(x => x.id !== bike.id) || {}).id;
  await tabSettingsBikes(A.p); await A.p.evaluate(id => { const n = document.querySelector(`[data-bike-name="${id}"]`); n.value = 'Renamed on A'; n.dispatchEvent(new Event('change', { bubbles: true })); }, ren); await A.p.waitForTimeout(400);
  const aSt = await LS(A.p, 'bluebird.docmeta.v1'), cSt = (doc(be).settingsAt || {}).bikes;
  ok(ren && aSt && aSt.sF && aSt.sF.bikes > cSt, 'guards: A renames another bike offline, so its bikes key is newer than the delete', { ren, a: aSt && aSt.sF && aSt.sF.bikes, cloud: cSt });
  await offline(be, A, false);
  const named = s => (s.bikes || []).some(x => x.id === ren && x.name === 'Renamed on A');
  const end = await settle([A.p, B.p], async () => { const a = await sets(A.p), b = await sets(B.p), c = doc(be).settings; return [a, b, c].every(s => s.raceName === 'A offline' && named(s)) ? { a, b, c } : null; });
  ok(end && [end.a, end.b, end.c].every(s => !(s.bikes || []).some(x => x.id === bike.id)), 'guards: the deleted bike stays deleted on both devices and in the cloud, and A s rename and race name land', end ? [end.a, end.b, end.c].map(s => (s.bikes || []).map(x => x.id + ':' + x.name)) : [await sets(A.p), await sets(B.p), doc(be).settings].map(s => ((s && s.bikes) || []).map(x => x.id + ':' + x.name)));
  await A.close(); await B.close();
});

section('deficit', async () => {
  const DEF = [{ id: 'q96d1', start: '2026-09-21', weeks: 8, pace: 0.75, startLb: 187.3, goalLb: 181.3, createdAt: 1790000000000 }];
  const be = new Backend(), A = await synced(be, { label: 'A', settings: { volume: { deficits: DEF, weighDays: [1, 4] } } }); await ready(be, A);
  const up = await until(() => { const v = (doc(be).settings || {}).volume; return v && Array.isArray(v.deficits) && v.deficits.length === 1 ? 1 : null; }, 15000);
  ok(up, 'deficit: A s deficit reaches the cloud');
  // an older build writes the whole settings doc without the deficits (it knows nothing of them, nor of settingsAt), newer than A s save
  const d = JSON.parse(JSON.stringify(doc(be))), t = Date.now() + 60000; d.settings.volume = Object.assign({}, d.settings.volume); delete d.settings.volume.deficits; delete d.settings.volume.weighDays; d.settings.raceName = 'Old build'; d.settings.updatedAt = t; be.fs.set('users/u1', d);
  const got = await settle([A.p], async () => { const s = await sets(A.p); return s.raceName === 'Old build' ? s : null; });
  ok(got && got.volume && Array.isArray(got.volume.deficits) && got.volume.deficits.length === 1 && got.volume.deficits[0].id === 'q96d1', 'deficit: A takes the older build s change and keeps its deficit (the deficit guard on the key-by-key merge)', got && got.volume);
  const back = await until(() => { const x = doc(be), v = x.settings && x.settings.volume; return v && Array.isArray(v.deficits) && v.deficits.length === 1 && x.settingsAt && x.settingsAt._u === x.settings.updatedAt ? 1 : null; }, 20000);
  ok(back, 'deficit: and the deficit goes back up to the cloud', (doc(be).settings || {}).volume);
  await A.close();
});

section('upgrade', async () => {
  const be = new Backend(), A = await synced(be, { label: 'A' }); await ready(be, A); await A.close();
  const d = JSON.parse(JSON.stringify(doc(be))); d.settings.raceName = 'Cloud name'; d.settings.updatedAt = Date.now() - 3600e3; delete d.settingsAt; be.fs.set('users/u1', d); /* the account as an older build left it */
  const U = await synced(be, { label: 'U', settings: { raceName: 'Offline edit' }, storage: { 'bluebird.docmeta.v1': { settings: Date.now() - 60e3, library: 1, lastPlan: 0 }, 'bluebird.syncqueue.v1': { uid: 'u1', seq: 1, items: { 'settings:settings': 1 } } } });
  const end = await until(async () => { const s = await sets(U.p), c = doc(be); return s.raceName === 'Offline edit' && c.settings.raceName === 'Offline edit' && c.settingsAt && c.settingsAt._u === c.settings.updatedAt ? 1 : null; }, 20000);
  await settle([U.p], async () => null, 12000); /* and a later pull does not undo it */
  const s = await sets(U.p), c = doc(be);
  ok(end && s.raceName === 'Offline edit' && c.settings.raceName === 'Offline edit', 'upgrade: a settings change an older build left queued is on the device and in the cloud after the first launch of this build', { end, device: s.raceName, cloud: c.settings.raceName });
  ok(c.settingsAt && c.settingsAt._u === c.settings.updatedAt && typeof c.settingsAt.raceName === 'number', 'upgrade: and the cloud has the per-key stamps', c.settingsAt && { u: c.settingsAt._u, upd: c.settings.updatedAt, rn: c.settingsAt.raceName });
  await U.close();
});

async function signinRun(mode) {
  const be = new Backend(), A = await synced(be, { label: 'A' + mode }); await ready(be, A);
  const bike = ((await sets(A.p)).bikes || [])[0]; await A.close();
  const d = JSON.parse(JSON.stringify(doc(be))), t = Date.now() - 1000;
  d.settings.raceName = 'Cloud name'; d.settings.bikes = (d.settings.bikes || []).filter(b => b.id !== bike.id); d.settings.bikeTombs = Object.assign({}, d.settings.bikeTombs, { [bike.id]: t }); d.settings.updatedAt = t;
  if (mode === 'legacy') delete d.settingsAt; else Object.assign(d.settingsAt, { raceName: t, bikes: t, bikeTombs: t, _u: t });
  be.fs.set('users/u1', d);
  const x = await open(SYNC, { athlete: 'A', browser, now: NOW, repo: REPO, settle: 1500, settings: { raceName: 'Device name' }, storage: { '__mock_user': WHO }, route: be.handler('S' + mode) });
  x.errors.label = 'S' + mode; ERRS.push(x.errors); x.p.on('dialog', g => g.accept());
  await x.p.evaluate(() => document.getElementById('gSignIn').click());
  const linked = await until(() => x.p.evaluate(() => { const o = JSON.parse(localStorage.getItem('bluebird.owner.v1') || 'null'); return !!(o && o.signedIn); }), 20000);
  await sleep(2500);
  const look = async () => { const s = await sets(x.p), c = doc(be).settings; return { device: s.raceName, cloud: c.raceName, dBike: (s.bikes || []).some(b => b.id === bike.id), cBike: (c.bikes || []).some(b => b.id === bike.id) }; };
  const after = await look();
  await settle([x.p], async () => null, 24000); /* two more pulls (at most one every 10 s) */
  const later = await look();
  await x.close();
  return { linked, after, later };
}

section('signin', async () => {
  for (const mode of ['legacy', 'stamped']) {
    const r = await signinRun(mode), good = v => v.device === 'Cloud name' && v.cloud === 'Cloud name' && !v.dBike && !v.cBike;
    ok(r.linked && good(r.after), 'signin (' + mode + ' cloud doc): right after the link the device and the cloud hold the account s race name, and the deleted bike stays deleted', r.after);
    ok(good(r.later), 'signin (' + mode + ' cloud doc): and still after two more pulls', r.later);
  }
});
async function tabSettingsBikes(p) { await p.click('#syncHdr:visible, #syncHdrIn:visible'); await p.waitForTimeout(500); await p.click('#view-profile .prow[data-prow="bikes"] .prow-h'); await p.waitForTimeout(500); }

for (const [n, f] of sections) { if (ONLY.length && !ONLY.includes(n)) continue; try { await f(); } catch (e) { ok(false, n + ': threw', String(e && e.stack || e).slice(0, 500)); } }
ok(ERRS.every(e => e.length === 0), 'no page or console errors', ERRS.filter(e => e.length).map(e => [e.label, ...e.slice(0, 3)]));
await browser.close();
C.done('q96 Sync: one device can\'t undo another\'s settings, and late uploads aren\'t missed');
