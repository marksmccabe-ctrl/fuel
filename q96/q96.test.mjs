// node q96.test.mjs <null.html> [main null.html]   (cd into this folder first) -- item 96: Sync: one device can't undo another's settings,
// and late uploads aren't missed. Two devices on the kit's stand-in Firebase (../q91/fbmock.mjs), every QA line and numbered point:
//   cache    sw.js CACHE and APP_BUILD match, v120 or later
//   link     after sign-in the cloud has users/{uid}.settingsAt: a stamp for every settings key and _u = settings.updatedAt
//   fields   point 1 / QA 1: device B changes a setting (the race name) while A is offline; A, which has not pulled, saves a weigh-in (it sets
//            the Profile weight); A comes back online: its upload writes only the keys it changed (settings.<key> paths, never the whole
//            settings), the cloud keeps B's race name and gets A's weight, and after both sync each device has both
//   legacy   point 1: an older build writes the whole settings doc (newer updatedAt, settingsAt untouched): a new device takes its change and
//            writes the stamps back (settingsAt._u = settings.updatedAt again) with updatedAt = the older build's + 1 ms, not its own clock
//            (review round 2); a key this device changed after that write still wins
//   oldbuild (review round 2, with [main null.html]) an older build (main) changes the race name online, then Plan mode offline; a device
//            on this build only pulls in between (it writes the stamps back); the older build comes back online: its offline change stands
//            on both devices and in the cloud
//   late     point 2 / QA 2: device B (its clock 30 minutes behind, as a phone saved offline earlier) saves a note and a weigh-in offline; A
//            pulls and moves on (a weigh-in of its own, its cursor past B's records); B comes online and uploads: every record in the cloud
//            carries syncedAt (a server Timestamp), and A's next incremental pull (not the daily full one) gets both; A's cursor follows
//            the upload time (sat)
//            to the millisecond (review round 1, again); then B, offline again, saves a ride, a race and a chapter and deletes a note both
//            devices have: each cloud doc (the tombstone too) carries syncedAt, A's incremental pull gets them all and its sat moves to
//            their upload time; (review round 2) a note an older build uploaded (no syncedAt, a new updatedAt) comes in through the
//            incremental pull (the updatedAt query); each kind in turn uploaded last, alone (a later server time, an old updatedAt), moves
//            sat to its upload time to the millisecond (so a cursor that leaves a kind out fails); a record uploaded inside the 10 minute
//            margin before A's upload-time cursor still comes in (the skew is applied to sat); and the incremental pull is filtered (a
//            note older than both cursors less the margin stays out until the daily full pull, which brings it)
//   defaults (review round 1, again) A's stored settings predate keys (no planMode, no wbgtCold, a volume without weekStart: a newer
//            build added them) and A relaunches offline; B changes all three; A saves only its race name: A queues only raceName, and after A
//            is opened again online and both sync B's three values stand on both devices and in the cloud, with A's race name
//   upgrade  (review round 1) a settings change an older build left queued (docmeta with no per-key stamps, 'settings:settings' in the
//            queue) against an older build's cloud doc: after the first v120 launch the change is on the device and in the cloud;
//            (review round 2) a device whose last change already went up (no stamps, nothing queued, its doc stamp newer than an older
//            build's late whole doc) keeps its values (whole doc by updatedAt, as before); and an offline first launch whose first action
//            is an unrelated save: the older build's queued change keeps its own stamp for every key, only the saved key is queued, and
//            another device's newer change (Plan mode) stands everywhere (this device never uploads its older one)
//   leftover (review round 2) a key changed while signed out that the cloud's newer value wins at sign-in is no longer queued; an
//            unrelated save there later uploads only that key, so the cloud keeps the other device's newer value and stamp
//   signin   (review round 1) a signed-out device with its own race name and a deleted-elsewhere bike signs in from the card (syncLink)
//            against an older build's cloud doc and against a stamped one: right after the link and after two more pulls, the device and
//            the cloud both hold the account's race name and the bike stays deleted
//   signedout (review round 3) settings an older build changed while signed out (a doc stamp, never queued, no per-key stamps), newer
//            than the stamps another device on this build gave the account: at the first sign-in on this build that change stands on the
//            device and in the cloud (whole doc by its updatedAt, as the older build did), and a key the older build never stored (its
//            default filled in at boot) keeps the other device s value; once signed out of the account, once never signed in
//   relabel  (review round 3, with [main null.html]) A (this build, offline) changes the race name, then an older build (main) changes it
//            later (its whole doc), then C (this build, not pulled since) saves an unrelated key: C merges the older build s doc before it
//            writes (the stamps go back), and when A comes online the older build s newer race name stands on A, B, C and in the cloud
//   retry    (review round 3, with [main null.html]) A s settings upload fails (the browser still online) and its 30 s retry (a flush, no
//            pull) runs after an older build (main) changed the same key later: the older build s change stands everywhere, and the
//            doc s updatedAt is the newest change in it (+ 1 ms), not the retry s clock
//   bulk     (review round 3) a sign-in uploads 120 weigh-ins with an old updatedAt (one upload time): a pull 10 minutes after this device
//            first saw that upload time still reads them (the margin), and later incremental pulls read only what is new; a later upload
//            still comes in
//   atcursor (review round 3) the updatedAt cursor follows only rides and races: a note and a weigh-in pulled with a newer updatedAt leave
//            it at the newest ride, so an older build s late weigh-in (no syncedAt, its updatedAt between them) comes in through the
//            incremental pull; a newer ride moves it; and a sign-in that takes the account s data (replace) sets it from rides and races
//   guards   the deleted-bike guard holds through a key-by-key merge: A (offline, not pulled) renames another bike after B deleted one, so
//            A's bikes key is the newer, and the deleted bike still stays deleted (bikeTombMerge does it; the per-key merge alone would bring
//            it back); the deficit guard: an older build's whole-doc write without the deficits leaves this device's deficits in place
//            and they go back up (dfcGuard does it). The header photo guard (jhpDocMerge) is covered by the q91 kit test.
//   main     with [main null.html]: the fields and late scenarios fail on main (the checks are not vacuous); oldbuild runs main as the
//            older build
// Q96_ONLY=<sections, comma-separated> runs a part. About 15 minutes (oldbuild, relabel, retry and the main checks need [main null.html]).
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
  const be = new Backend(), A = await synced(be, { label: 'A', now: null }); await ready(be, A); /* the real clock: the older build s write below is dated against A s change */
  // an older build writes the whole settings doc (its own updatedAt, newer than A s doc stamp but behind the clock; a newer race name; it
  // knows nothing of settingsAt)
  const lm = +(((await LS(A.p, 'bluebird.docmeta.v1')) || {}).settings) || 0;
  const d = JSON.parse(JSON.stringify(doc(be))), t = Math.max(lm + 1, Date.now() - 1000); d.settings.raceName = 'Old build'; d.settings.updatedAt = t; be.fs.set('users/u1', d);
  const got = await settle([A.p], async () => (await sets(A.p)).raceName === 'Old build' ? 1 : null);
  ok(got, 'legacy: the new device takes the older build\'s change');
  const norm = await until(() => { const x = doc(be); return x.settingsAt && x.settingsAt._u === x.settings.updatedAt && x.settings.updatedAt !== t ? x : null; }, 20000);
  ok(norm && norm.settings.raceName === 'Old build' && typeof norm.settingsAt.raceName === 'number' && norm.settingsAt.raceName >= t, 'legacy: and writes the stamps back (settingsAt._u = settings.updatedAt; the older build\'s keys at its time)', norm && { u: norm.settingsAt._u, upd: norm.settings.updatedAt, rn: norm.settingsAt.raceName, t });
  ok(norm && norm.settings.updatedAt === t + 1, 'legacy: that write only puts stamps back, so its updatedAt is the older build s + 1 ms, not this device s clock (an older build s later offline change still counts as the newer one)', norm && { upd: norm.settings.updatedAt, t });
  // a key changed here after an older build's write wins over it
  await offline(be, A, true); await sleep(200); await raceName(A.p, 'Mine, later'); await sleep(300);
  const tMine = (((await LS(A.p, 'bluebird.docmeta.v1')) || {}).sF || {}).raceName || Date.now(); /* review round 3: dated 30 s before A s change by A s own stamp */
  const d2 = JSON.parse(JSON.stringify(doc(be))); d2.settings.raceName = 'Old build 2'; d2.settings.cagesNote = 'x'; d2.settings.updatedAt = tMine - 30000; be.fs.set('users/u1', d2);
  await offline(be, A, false);
  const end = await settle([A.p], async () => { const s = await sets(A.p), c = doc(be).settings; return s.cagesNote === 'x' && c.raceName === 'Mine, later' ? { s, c } : null; });
  ok(end && end.s.raceName === 'Mine, later' && end.c.raceName === 'Mine, later' && end.s.cagesNote === 'x', 'legacy: a key changed here after the older build\'s write stands; the older build\'s other change comes in', end && { here: end.s.raceName, cloud: end.c.raceName, other: end.s.cagesNote });
  await A.close();
});

// review round 2: an older build (main) and this build on one account. The older build changes the race name online (its whole doc), then
// Plan mode while offline; this build's device only pulls in between (an older build's doc: it writes the stamps back); the older build
// comes back online and its offline change must stand: the write-back carries the older build's updatedAt + 1 ms, still older than that change
section('oldbuild', async () => {
  if (!SYNC_MAIN) { console.log('  (oldbuild: skipped, it needs [main null.html] as the older build)'); return; }
  const be = new Backend(), N = await synced(be, { label: 'N' }); await ready(be, N);
  const O = await synced(be, { label: 'O', file: SYNC_MAIN, noErrs: true }); await ready(be, O); await sleep(2000);
  await offline(be, N, true);
  await raceName(O.p, 'O online'); await until(() => (doc(be).settings || {}).raceName === 'O online' ? 1 : null, 15000);
  const t0 = doc(be).settings.updatedAt;
  await offline(be, O, true); await sleep(300);
  await O.p.evaluate(() => document.querySelector('#modeSeg button[data-pm="clothing"]').click()); await sleep(500);
  const t1 = ((await LS(O.p, 'bluebird.docmeta.v1')) || {}).settings, oPm = (await sets(O.p)).planMode;
  await offline(be, N, false);
  await settle([N.p], async () => (await sets(N.p)).raceName === 'O online' ? 1 : null, 30000);
  const back = await until(() => { const x = doc(be); return x.settingsAt && x.settingsAt._u === x.settings.updatedAt && x.settings.raceName === 'O online' ? JSON.parse(JSON.stringify(x)) : null; }, 20000);
  ok(oPm === 'clothing' && back && back.settings.updatedAt === t0 + 1 && t1 > back.settings.updatedAt, 'oldbuild: this build s device only pulled the older build s doc; it writes the stamps back with updatedAt = the older build s + 1 ms, older than the older build s offline change', { oPm, t0, t1, upd: back && back.settings.updatedAt });
  await offline(be, N, true);
  await offline(be, O, false);
  const oEnd = await settle([O.p], async () => (await sets(O.p)).planMode === 'clothing' && doc(be).settings.planMode === 'clothing' && doc(be).settings.raceName === 'O online' ? 1 : null, 30000);
  await offline(be, N, false);
  const good = s => s && s.planMode === 'clothing' && s.raceName === 'O online';
  const end = await settle([N.p, O.p], async () => good(await sets(N.p)) && good(await sets(O.p)) && good(doc(be).settings) ? 1 : null, 40000);
  ok(oEnd && end, 'oldbuild: the older build s offline change (Plan mode) stands on both devices and in the cloud', { oEnd, o: (await sets(O.p)).planMode, n: (await sets(N.p)).planMode, cloud: doc(be).settings.planMode });
  await N.close(); await O.close();
});

// a server Timestamp in ms (full precision), and the newest upload time of any record in the cloud
const tsMs = v => v && typeof v === 'object' && typeof v.seconds === 'number' ? v.seconds * 1000 + Math.floor((v.nanoseconds || 0) / 1e6) : 0;
const tsOf = ms => ({ seconds: Math.floor(ms / 1000), nanoseconds: (ms % 1000) * 1e6 });
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
  // review round 2: a note an older build uploads (no syncedAt; its updatedAt from that device s clock, new): only the updatedAt query
  // finds it, with A s cursor past 0 (a pull from 0 reads everything)
  let old = null, kinds = null;
  if (!tag && bn) {
    const nd = JSON.parse(JSON.stringify(be.fs.get('users/u1/notes/' + bn.id) || {})); delete nd.syncedAt;
    Object.assign(nd, { id: 'q96oldb', title: 'Older build note', createdAt: Date.now(), updatedAt: Date.now() }); be.fs.set('users/u1/notes/q96oldb', nd);
    const c0 = await LS(A.p, 'bluebird.synccursor.v1') || {};
    const og = await settle([A.p], async () => (await notes(A.p)).some(x => x.id === 'q96oldb') ? 1 : null, 30000);
    old = { at: c0.at, got: !!og, full: ((await LS(A.p, 'bluebird.synccursor.v1')) || {}).full === fullBefore };
    // each kind in turn uploaded last, alone (its own later server time; an old updatedAt, as a record saved offline): A s upload-time
    // cursor moves to that record s upload time, so a cursor that leaves out any kind fails here
    kinds = []; let prev = Math.max(cloudSat(be), +(((await LS(A.p, 'bluebird.synccursor.v1')) || {}).sat) || 0);
    for (const [c, src, key] of [['journal', 'q96ride', 'bluebird.journal.v1'], ['races', 'q96race', 'bluebird.races.v1'], ['chapters', 'q96ch', 'bluebird.chapters.v1'], ['notes', bn.id, 'bluebird.notes.v1'], ['weights', bw && bw.id, 'bluebird.weights.v1']]) {
      const d = JSON.parse(JSON.stringify(be.fs.get('users/u1/' + c + '/' + src) || null)), id = 'q96k' + c, ms = prev + 1000;
      if (!d) { kinds.push({ c, missing: src }); continue; }
      Object.assign(d, { id, updatedAt: Date.now() - 40 * 60e3, syncedAt: tsOf(ms) }); if (c === 'weights') d.date = '2025-11-01';
      be.fs.set('users/u1/' + c + '/' + id, d);
      const has = await settle([A.p], async () => ((await LS(A.p, key)) || []).some(x => x && x.id === id) ? 1 : null, 30000), cur = (await LS(A.p, 'bluebird.synccursor.v1')) || {};
      kinds.push({ c, has: !!has, sat: cur.sat, want: ms, prev, full: cur.full === fullBefore }); prev = ms;
    }
  }
  // the skew: A's upload-time cursor 5 minutes past the upload time those records got (inside the 10 minute margin), its updatedAt cursor
  // past everything; B (online, its clock still behind) saves one more note: only the upload-time query, with the margin, finds it
  let skew = null;
  if (!tag && landed) {
    const sat = Math.max(landed.w.syncedAt.seconds * 1000, newest2 || 0) + 5 * 60e3;
    await A.p.evaluate(sat => { const c = JSON.parse(localStorage.getItem('bluebird.synccursor.v1')); c.sat = sat; c.satT = Date.now(); delete c.satOk; c.at = Math.max(+c.at || 0, Date.now() + 60 * 60e3); localStorage.setItem('bluebird.synccursor.v1', JSON.stringify(c)); }, sat); /* a sat this device has just seen (review round 3: its margin holds for 10 minutes) */
    await addNote(B.p, 'Skew note'); const sn = (await notes(B.p)).find(n => n.title === 'Skew note');
    const sl = sn && await until(() => be.fs.get('users/u1/notes/' + sn.id), 20000);
    const sg = await settle([A.p], async () => (await notes(A.p)).some(x => sn && x.id === sn.id) ? 1 : null, 30000);
    skew = { sat, landedAt: sl && sl.syncedAt ? sl.syncedAt.seconds * 1000 : null, got: !!sg, full: (await LS(A.p, 'bluebird.synccursor.v1') || {}).full === fullBefore };
  }
  // review round 2: the incremental pull is filtered. A note older than both cursors less the margin stays out (a pull that reads every
  // record would bring it); one uploaded inside the margin comes in (so that pull ran); the daily full pull then brings the first
  let filt = null;
  if (!tag && bn) {
    const c = (await LS(A.p, 'bluebird.synccursor.v1')) || {}, n = JSON.parse(JSON.stringify(be.fs.get('users/u1/notes/' + bn.id) || {})), u = Math.min(+c.at || 0, Date.now()) - 11 * 60e3;
    be.fs.set('users/u1/notes/q96stale', Object.assign({}, n, { id: 'q96stale', title: 'Stale note', createdAt: u, updatedAt: u, syncedAt: tsOf(c.sat - 11 * 60e3) }));
    be.fs.set('users/u1/notes/q96fresh', Object.assign({}, n, { id: 'q96fresh', title: 'Fresh note', createdAt: u, updatedAt: u, syncedAt: tsOf(c.sat - 9 * 60e3) }));
    const fg = await settle([A.p], async () => (await notes(A.p)).some(x => x.id === 'q96fresh') ? 1 : null, 30000);
    const ns = await notes(A.p), c2 = (await LS(A.p, 'bluebird.synccursor.v1')) || {};
    filt = { at: c.at, sat: c.sat, fresh: !!fg, stale: ns.some(x => x.id === 'q96stale'), full: !!c.full && c2.full === c.full };
    await A.p.evaluate(() => { const o = JSON.parse(localStorage.getItem('bluebird.synccursor.v1')); o.full = 0; localStorage.setItem('bluebird.synccursor.v1', JSON.stringify(o)); }); /* the daily full pull is due */
    filt.fullGot = !!(await settle([A.p], async () => (await notes(A.p)).some(x => x.id === 'q96stale') ? 1 : null, 30000));
  }
  const errs = A.errors.concat(B.errors);
  await A.close(); await B.close();
  return { bw, bn, other, otherGot, cur0, cur1, cur2, newest1, newest2, landed, got, skew, old, kinds, filt, fullSame: !!fullBefore && cur1 && cur1.full === fullBefore, full2Same: !!fullBefore && cur2 && cur2.full === fullBefore, errs };
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
  ok(r.cur2 && r.newest2 > r.newest1 && r.cur2.sat === r.newest2, 'late: and A s upload-time cursor moves to their upload time', { sat: r.cur2 && r.cur2.sat, newest: r.newest2 });
  ok(r.old && r.old.at > 0 && r.old.got && r.old.full, 'late: a note an older build uploaded (no syncedAt, a new updatedAt) comes in through A s incremental pull (the updatedAt query; A s cursor past 0)', r.old);
  for (const c of ['journal', 'races', 'chapters', 'notes', 'weights']) { const k = (r.kinds || []).find(x => x.c === c);
    ok(k && k.has && k.sat === k.want && k.want > k.prev && k.full, 'late: a ' + c + ' record uploaded last, alone, moves A s upload-time cursor to its upload time, to the millisecond (each kind moves it)', k); }
  ok(r.skew && r.skew.landedAt && r.skew.landedAt < r.skew.sat && r.skew.landedAt > r.skew.sat - 10 * 60e3 && r.skew.got && r.skew.full, 'late: a record uploaded inside the 10 minute margin before A s upload-time cursor still comes in (the margin applies to sat)', r.skew);
  ok(r.filt && r.filt.at > 0 && r.filt.sat > 0 && r.filt.fresh && !r.filt.stale && r.filt.full, 'late: the incremental pull is filtered: a note older than both cursors less the 10 minute margin stays out, one inside the margin comes in', r.filt);
  ok(r.filt && r.filt.fullGot, 'late: and the daily full pull brings that older note in (the check above is not vacuous)', r.filt);
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
  // review round 2: a device whose last change already went up under an older build (no per-key stamps, nothing queued, its doc stamp
  // 30 s ago) meets an older build s late whole doc from 60 s ago: whole doc by updatedAt, as before, so this device s values stand
  const T = Date.now(), d2 = JSON.parse(JSON.stringify(doc(be))); delete d2.settingsAt; Object.assign(d2.settings, { raceName: 'O late', planMode: 'both', updatedAt: T - 60e3 }); be.fs.set('users/u1', d2);
  const X = await synced(be, { label: 'X', settings: { raceName: 'X newer', planMode: 'clothing' }, storage: { 'bluebird.docmeta.v1': { settings: T - 30e3, library: 1, lastPlan: 0 }, 'bluebird.synccursor.v1': { uid: 'u1', at: T - 120e3, full: Date.now() } } });
  const mine = v => v && v.raceName === 'X newer' && v.planMode === 'clothing';
  const xEnd = await until(async () => { const s = await sets(X.p), c = doc(be); return mine(s) && mine(c.settings) && c.settingsAt && c.settingsAt._u === c.settings.updatedAt ? 1 : null; }, 20000);
  await settle([X.p], async () => null, 12000);
  const xs = await sets(X.p), xc = doc(be).settings;
  ok(xEnd && mine(xs) && mine(xc), 'upgrade: an older build s whole doc older than this device s last (uploaded) change: this device keeps its values and the cloud gets them back (whole doc by updatedAt, as before)', { end: xEnd, device: { rn: xs.raceName, pm: xs.planMode }, cloud: { rn: xc.raceName, pm: xc.planMode } });
  await X.close();
  // review round 2: an offline first launch whose first action is an unrelated settings save, with an older build s change still queued;
  // another device changed Plan mode since that change
  const be2 = new Backend(), N = await synced(be2, { label: 'N2' }); await ready(be2, N);
  await N.p.evaluate(() => document.querySelector('#modeSeg button[data-pm="clothing"]').click());
  await until(() => (doc(be2).settings || {}).planMode === 'clothing' ? 1 : null, 15000);
  const T0 = Date.now() - 3600e3; be2.offline.add('U2');
  const U2 = await synced(be2, { label: 'U2', settings: { wbgtCold: 50, planMode: 'both' }, storage: { 'bluebird.docmeta.v1': { settings: T0, library: 1, lastPlan: 0 }, 'bluebird.syncqueue.v1': { uid: 'u1', seq: 1, items: { 'settings:settings': 1 } }, 'bluebird.synccursor.v1': { uid: 'u1', at: T0, full: Date.now() } } });
  await U2.ctx.setOffline(true);
  await raceName(U2.p, 'U new'); await sleep(400);
  const m = (await LS(U2.p, 'bluebird.docmeta.v1')) || {}, F = m.sF || {}, q = Object.keys(m.sD || {});
  ok(F.planMode === T0 && F.wbgtCold === T0 && F.raceName > T0 && q.length === 1 && q[0] === 'raceName', 'upgrade: an offline first launch whose first action is an unrelated save: the older build s queued change keeps that build s stamp for every key, and only the saved key is queued', { T0, planMode: F.planMode, wbgtCold: F.wbgtCold, raceName: F.raceName, queued: q });
  be2.offline.delete('U2'); await U2.ctx.setOffline(false); await reload(U2.p);
  const good = v => v && v.planMode === 'clothing' && v.wbgtCold === 50 && v.raceName === 'U new';
  const uEnd = await settle([U2.p, N.p], async () => good(await sets(U2.p)) && good(await sets(N.p)) && good(doc(be2).settings) ? 1 : null, 40000);
  const pm = docWrites(be2, 'U2').filter(f => f.includes('settings.planMode') || f.includes('settings') || f.includes('(whole doc)'));
  const pick = v => v && { planMode: v.planMode, wbgtCold: v.wbgtCold, raceName: v.raceName };
  ok(uEnd && !pm.length, 'upgrade: and the other device s newer Plan mode stands on both devices and in the cloud (this device never uploads its older one); the queued change and the saved race name land', { end: uEnd, planModeWrites: pm.length, u: pick(await sets(U2.p)), n: pick(await sets(N.p)), c: pick(doc(be2).settings) });
  await U2.close(); await N.close();
});

// review round 2: a key changed while signed out that the cloud s newer value wins at sign-in is no longer queued there, so a later
// unrelated save on that device uploads only its own key and the cloud keeps another device s newer value
section('leftover', async () => {
  const be = new Backend(), A = await synced(be, { label: 'A' }); await ready(be, A); await sleep(1500);
  const S = await open(SYNC, { athlete: 'A', browser, now: NOW, repo: REPO, settle: 1500, storage: { '__mock_user': WHO }, route: be.handler('S') });
  S.errors.label = 'S'; ERRS.push(S.errors); S.p.on('dialog', g => g.accept());
  await raceName(S.p, 'S signed out'); await sleep(400);
  const q0 = Object.keys(((await LS(S.p, 'bluebird.docmeta.v1')) || {}).sD || {});
  await sleep(50); await raceName(A.p, 'A first'); await until(() => (doc(be).settings || {}).raceName === 'A first' ? 1 : null, 15000);
  await S.p.evaluate(() => document.getElementById('gSignIn').click());
  await until(() => S.p.evaluate(() => { const o = JSON.parse(localStorage.getItem('bluebird.owner.v1') || 'null'); return !!(o && o.signedIn); }), 20000); await sleep(2500);
  const mS = (await LS(S.p, 'bluebird.docmeta.v1')) || {}, sIn = (await sets(S.p)).raceName;
  ok(q0.includes('raceName') && sIn === 'A first' && !Object.keys(mS.sD || {}).length, 'leftover: a key changed while signed out, which the cloud s newer value wins at sign-in, is no longer queued there', { q0, sIn, queued: Object.keys(mS.sD || {}) });
  await raceName(A.p, 'A second'); await until(() => (doc(be).settings || {}).raceName === 'A second' ? 1 : null, 15000);
  const tA = (doc(be).settingsAt || {}).raceName, n0 = docWrites(be, 'S').length;
  await S.p.evaluate(() => { const e = document.getElementById('firstGel'); e.value = '35'; e.dispatchEvent(new Event('change', { bubbles: true })); });
  await until(() => (doc(be).settings || {}).firstGel === 35 ? 1 : null, 15000); await sleep(800);
  const w = docWrites(be, 'S').slice(n0), c = doc(be);
  ok(w.length > 0 && w.every(f => !f.includes('settings.raceName') && !f.includes('settings')) && c.settings.raceName === 'A second' && c.settingsAt.raceName === tA, 'leftover: a later unrelated save there uploads only its own key; the cloud keeps the other device s newer race name and its stamp', { writes: w, raceName: c.settings.raceName, stamp: c.settingsAt.raceName, tA });
  await A.close(); await S.close();
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

// review round 3: settings an older build changed while signed out (out: signed out of this account; never: never signed in). The older
// build left a doc stamp (T1) and nothing queued; its stored copy has no planMode (this build fills in the default at boot). Another device
// on this build stamped the account before T1 (its link) and changed Plan mode.
async function signedoutRun(mode) {
  const be = new Backend(), A = await synced(be, { label: 'A' + mode, now: null }); await ready(be, A);
  await A.p.evaluate(() => document.querySelector('#modeSeg button[data-pm="clothing"]').click());
  await until(() => (doc(be).settings || {}).planMode === 'clothing' ? 1 : null, 15000); await A.close();
  const at0 = JSON.parse(JSON.stringify(doc(be).settingsAt || {})); await sleep(1000);
  const T1 = Date.now() - 500, storage = { '__mock_user': WHO, 'bluebird.docmeta.v1': { settings: T1, library: 1, lastPlan: 0 } };
  if (mode === 'out') storage['bluebird.owner.v1'] = { uid: 'u1', name: WHO.displayName, email: WHO.email, photo: '', signedIn: false };
  const S = await open(SYNC, { athlete: 'A', browser, now: null, repo: REPO, settle: 1500, settings: { wbgtCold: 50, planMode: undefined }, storage, route: be.handler('S' + mode) });
  S.errors.label = 'S' + mode; ERRS.push(S.errors); S.p.on('dialog', g => g.accept());
  const s0 = await sets(S.p), m0 = (await LS(S.p, 'bluebird.docmeta.v1')) || {}, F0 = m0.sF || {};
  await S.p.evaluate(() => document.getElementById('gSignIn').click());
  const linked = await until(() => S.p.evaluate(() => { const o = JSON.parse(localStorage.getItem('bluebird.owner.v1') || 'null'); return !!(o && o.signedIn); }), 20000);
  await sleep(2500);
  const look = async () => { const s = await sets(S.p), c = doc(be); return { device: { wbgtCold: s.wbgtCold, planMode: s.planMode }, cloud: { wbgtCold: c.settings.wbgtCold, planMode: c.settings.planMode, stamp: (c.settingsAt || {}).wbgtCold } }; };
  const after = await look();
  await settle([S.p], async () => null, 24000); /* two more pulls */
  const later = await look();
  await S.close();
  return { T1, at0: { wbgtCold: at0.wbgtCold, planMode: at0.planMode }, before: { wbgtCold: s0.wbgtCold, planMode: s0.planMode, stamped: { wbgtCold: F0.wbgtCold, planMode: F0.planMode } }, linked, after, later };
}

section('signedout', async () => {
  for (const mode of ['out', 'never']) {
    const r = await signedoutRun(mode), good = v => v.device.wbgtCold === 50 && v.cloud.wbgtCold === 50 && v.cloud.stamp >= r.T1 && v.device.planMode === 'clothing' && v.cloud.planMode === 'clothing';
    ok(r.at0.wbgtCold < r.T1 && r.at0.planMode < r.T1 && r.before.wbgtCold === 50 && r.before.planMode === 'both' && r.before.stamped.wbgtCold === r.T1 && r.before.stamped.planMode == null, 'signedout (' + mode + '): the older build s change is newer than the account s stamps; this build stamps it at that build s doc stamp at boot, but not Plan mode (never stored there, its default filled in)', r);
    ok(r.linked && good(r.after), 'signedout (' + mode + '): after the sign-in the older build s change stands on the device and in the cloud, and the other device s Plan mode too', r.after);
    ok(good(r.later), 'signedout (' + mode + '): and still after two more pulls', r.later);
  }
});

// review round 3: an older build s whole-doc write that a device on this build has not merged, then that device s unrelated key-by-key
// write: it reads and merges first, so the stamps go back and a third device s older offline change can not undo the older build s newer one
section('relabel', async () => {
  if (!SYNC_MAIN) { console.log('  (relabel: skipped, it needs [main null.html] as the older build)'); return; }
  const be = new Backend(), A = await synced(be, { label: 'A', now: null }); await ready(be, A);
  const C = await synced(be, { label: 'C', now: null }); await ready(be, C);
  const B = await synced(be, { label: 'B', file: SYNC_MAIN, now: null, noErrs: true }); await ready(be, B); await sleep(2000);
  await offline(be, A, true); await sleep(300);
  await raceName(A.p, 'From A (oldest)'); await sleep(1500);
  const tA = (((await LS(A.p, 'bluebird.docmeta.v1')) || {}).sF || {}).raceName;
  await raceName(B.p, 'From B (newest)'); await until(() => (doc(be).settings || {}).raceName === 'From B (newest)' ? 1 : null, 15000);
  const d1 = JSON.parse(JSON.stringify(doc(be))), tB = d1.settings.updatedAt;
  ok(tA > 0 && tB > tA && (d1.settingsAt || {})._u !== tB, 'relabel: an older build (main) changes the race name after A s offline change; its whole doc is in the cloud (settingsAt._u is not its updatedAt)', { tA, tB, u: (d1.settingsAt || {})._u });
  await sleep(1500);
  const g0 = be.log.filter(r => r.page === 'C' && /\/mock\/get$/.test(r.url)).length;
  await C.p.evaluate(() => document.querySelector('#modeSeg button[data-pm="clothing"]').click());
  const cw = await until(() => { const x = doc(be); return x.settings && x.settings.planMode === 'clothing' ? JSON.parse(JSON.stringify(x)) : null; }, 15000);
  const at = cw && cw.settingsAt || {};
  ok(cw && at._u === cw.settings.updatedAt && at.raceName >= tB && cw.settings.raceName === 'From B (newest)' && be.log.filter(r => r.page === 'C' && /\/mock\/get$/.test(r.url)).length > g0, 'relabel: C (this build, not pulled since) saves Plan mode: it reads the account s settings first and its write puts the older build s stamps back (the race name at the older build s time)', cw && { u: at._u, upd: cw.settings.updatedAt, atRace: at.raceName, tB, raceName: cw.settings.raceName });
  await offline(be, A, false);
  const good = s => s && s.raceName === 'From B (newest)' && s.planMode === 'clothing';
  const end = await settle([A.p, B.p, C.p], async () => good(await sets(A.p)) && good(await sets(B.p)) && good(await sets(C.p)) && good(doc(be).settings) ? 1 : null, 45000);
  const pick = s => s && { raceName: s.raceName, planMode: s.planMode };
  ok(end, 'relabel: when A comes online its older offline change does not undo the older build s newer one: B s race name (and C s Plan mode) stand on A, B, C and in the cloud', { a: pick(await sets(A.p)), b: pick(await sets(B.p)), c: pick(await sets(C.p)), cloud: pick(doc(be).settings) });
  await A.close(); await B.close(); await C.close();
});

// review round 3: a settings upload that failed while the browser still said online, retried 30 s later by the flush alone (no pull),
// after an older build (main) changed the same key later
section('retry', async () => {
  if (!SYNC_MAIN) { console.log('  (retry: skipped, it needs [main null.html] as the older build)'); return; }
  const be = new Backend(), A = await synced(be, { label: 'A', now: null }); await ready(be, A);
  const B = await synced(be, { label: 'B', file: SYNC_MAIN, now: null, noErrs: true }); await ready(be, B); await sleep(2000);
  be.offline.add('A'); /* A s requests fail; navigator.onLine stays true */
  await raceName(A.p, 'From A (older)'); await sleep(3000);
  const tA = (((await LS(A.p, 'bluebird.docmeta.v1')) || {}).sF || {}).raceName, q = Object.keys((((await LS(A.p, 'bluebird.syncqueue.v1')) || {}).items) || {});
  await sleep(1000);
  await raceName(B.p, 'From B (newer)'); await until(() => (doc(be).settings || {}).raceName === 'From B (newer)' ? 1 : null, 15000);
  const tB = doc(be).settings.updatedAt, t0 = Date.now();
  ok(tA > 0 && tB > tA && q.includes('settings:settings') && be.log.some(r => r.page === 'A' && r.offline), 'retry: A s upload of its race name failed (still queued); the older build changed it later', { tA, tB, q });
  be.offline.delete('A');
  const landed = await until(() => be.log.some(r => r.page === 'A' && !r.offline && r.t > t0 && /\/mock\/commit$/.test(r.url)) ? JSON.parse(JSON.stringify(doc(be))) : null, 45000);
  await sleep(500);
  const d = doc(be), at = d.settingsAt || {}, pulled = be.log.some(r => r.page === 'A' && !r.offline && r.t > t0 && /\/mock\/list$/.test(r.url));
  ok(landed && !pulled && d.settings.raceName === 'From B (newer)' && at._u === d.settings.updatedAt && d.settings.updatedAt === tB + 1 && at.raceName === tB, 'retry: A s retry (a flush, no pull) merges first: the cloud keeps the older build s newer race name, and the doc s updatedAt is the newest change in it + 1 ms, not the retry s clock', { landed: !!landed, pulled, raceName: d.settings.raceName, upd: d.settings.updatedAt, u: at._u, atRace: at.raceName, tB });
  const good = s => s && s.raceName === 'From B (newer)';
  const end = await settle([A.p, B.p], async () => good(await sets(A.p)) && good(await sets(B.p)) && good(doc(be).settings) ? 1 : null, 30000);
  ok(end, 'retry: and the older build s newer race name stands on both devices and in the cloud', { a: (await sets(A.p)).raceName, b: (await sets(B.p)).raceName, cloud: doc(be).settings.raceName });
  await A.close(); await B.close();
});

// review round 3: the upload-time cursor after a sign-in that uploads many records at once (one upload time, an old updatedAt)
section('bulk', async () => {
  const be = new Backend(), reads = []; let cur = null;
  { const f = be.firestore.bind(be), j = be.json.bind(be); /* how many docs each collection query hands back, by page */
    be.firestore = (r, k, rec) => { cur = k === 'list' ? rec.page : null; return f(r, k, rec); };
    be.json = (r, o, s) => { if (cur && o && Array.isArray(o.docs)) { reads.push({ page: cur, n: o.docs.length }); cur = null; } return j(r, o, s); }; }
  const day = 864e5, t0 = Date.now(), iso = ms => new Date(ms).toISOString().slice(0, 10), N = 120;
  const wts = Array.from({ length: N }, (_, i) => ({ id: 'q96bw' + i, date: iso(t0 - (i + 3) * day), time: '07:00', lb: 170 + (i % 10) / 10, when: '', note: '', createdAt: t0 - (i + 3) * day, updatedAt: t0 - (i + 3) * day }));
  const rides = Array.from({ length: 3 }, (_, i) => ({ id: 'q96bj' + i, date: iso(t0 - (i + 1) * day), title: 'Ride ' + i, type: 'ride', createdAt: t0 - (i + 1) * day, updatedAt: t0 - (i + 1) * day }));
  const S = await open(SYNC, { athlete: 'A', browser, now: null, repo: REPO, settle: 1500, storage: { '__mock_user': WHO, 'bluebird.weights.v1': wts, 'bluebird.journal.v1': rides }, route: be.handler('S') });
  S.errors.label = 'S'; ERRS.push(S.errors); S.p.on('dialog', g => g.accept());
  await S.p.evaluate(() => document.getElementById('gSignIn').click());
  const linked = await until(() => S.p.evaluate(() => { const o = JSON.parse(localStorage.getItem('bluebird.owner.v1') || 'null'); return !!(o && o.signedIn); }), 30000);
  await sleep(3000);
  const up = [...be.fs.keys()].filter(k => /^users\/u1\/weights\//.test(k)).length;
  const cursor = () => LS(S.p, 'bluebird.synccursor.v1').then(v => v || {});
  const listN = () => reads.filter(r => r.page === 'S').length;
  async function pullOnce() { await sleep(10500); const n0 = listN(), i0 = reads.length; /* the pull gap */
    await until(async () => { await S.p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); return listN() >= n0 + 10 ? 1 : null; }, 30000, 1500);
    await sleep(1000); return reads.slice(i0).filter(r => r.page === 'S').reduce((a, r) => a + r.n, 0); }
  const p1 = await pullOnce(), c1 = await cursor();
  await S.p.evaluate(() => { const c = JSON.parse(localStorage.getItem('bluebird.synccursor.v1')); c.satT -= 11 * 60e3; localStorage.setItem('bluebird.synccursor.v1', JSON.stringify(c)); }); /* as if this device first saw that upload time 11 minutes ago */
  const p2 = await pullOnce(), c2 = await cursor();
  const p3 = await pullOnce(), c3 = await cursor();
  const T = Date.now(); be.fs.set('users/u1/weights/q96bnew', { id: 'q96bnew', date: iso(t0), time: '08:00', lb: 171, when: '', note: '', createdAt: T, updatedAt: t0 - 5 * day, schemaVersion: 1, syncedAt: tsOf(T) }); /* another device uploads a weigh-in saved offline days ago */
  const p4 = await pullOnce(), got = (await weights(S.p)).some(w => w.id === 'q96bnew'), c4 = await cursor();
  await S.close();
  ok(linked && up === N && p1 >= N, 'bulk: the sign-in uploads ' + N + ' weigh-ins (one upload time); the next incremental pull reads them (the upload-time query)', { linked, up, p1 });
  ok(c1.sat > 0 && c2.sat === c1.sat && p2 >= N && c2.satOk === 1, 'bulk: a pull 10 minutes after this device first saw that upload time still reads them (the margin) and marks the cursor checked', { p2, sat1: c1.sat, sat2: c2.sat, satOk: c2.satOk });
  ok(p3 <= 3 && c3.sat === c1.sat && c3.full === c1.full, 'bulk: the next incremental pull reads only what is new, not the ' + N + ' weigh-ins again', { p3, full: c3.full === c1.full });
  ok(got && p4 <= 3 && c4.sat === T && !c4.satOk, 'bulk: a later upload (an old updatedAt) still comes in through the incremental pull, and the cursor moves to it (its margin again)', { got, p4, sat: c4.sat, T, satOk: c4.satOk });
});

// review round 3: the updatedAt cursor follows rides and races only (an older build s late upload has no syncedAt)
section('atcursor', async () => {
  const be = new Backend(), T = Date.now() - 2 * 3600e3, iso = ms => new Date(ms).toISOString().slice(0, 10);
  const ride = (id, u, s) => ({ id, date: iso(u), title: 'Ride ' + id, type: 'ride', createdAt: u, updatedAt: u, schemaVersion: 1, syncedAt: tsOf(s) });
  be.fs.set('users/u1/journal/q96r1', ride('q96r1', T, T));
  const A = await synced(be, { label: 'A', now: null }); await ready(be, A);
  const c0 = (await LS(A.p, 'bluebird.synccursor.v1')) || {};
  // another device on this build saves a note and a weigh-in now (its upload time now)
  const Nw = Date.now();
  be.fs.set('users/u1/notes/q96n1', { id: 'q96n1', type: 'other', title: 'New-build note', date: iso(Nw), createdAt: Nw, updatedAt: Nw, schemaVersion: 1, syncedAt: tsOf(Nw) });
  be.fs.set('users/u1/weights/q96w1', { id: 'q96w1', date: '2025-10-30', time: '', lb: 170.4, when: '', note: '', createdAt: Nw, updatedAt: Nw, schemaVersion: 1, syncedAt: tsOf(Nw) });
  const got1 = await settle([A.p], async () => (await notes(A.p)).some(x => x.id === 'q96n1') && (await weights(A.p)).some(x => x.id === 'q96w1') ? 1 : null, 30000);
  const c1 = (await LS(A.p, 'bluebird.synccursor.v1')) || {};
  // an older build (no syncedAt) uploads a weigh-in it saved offline 20 minutes ago: only the updatedAt query can find it
  const W = Date.now() - 20 * 60e3;
  be.fs.set('users/u1/weights/q96w0', { id: 'q96w0', date: '2025-10-31', time: '', lb: 170.2, when: '', note: '', createdAt: W, updatedAt: W, schemaVersion: 1 });
  const got2 = await settle([A.p], async () => (await weights(A.p)).some(x => x.id === 'q96w0') ? 1 : null, 35000);
  const c2 = (await LS(A.p, 'bluebird.synccursor.v1')) || {};
  // a ride with a newer updatedAt moves it
  const R = Date.now() - 60e3; be.fs.set('users/u1/journal/q96r2', ride('q96r2', R, Date.now()));
  const got3 = await settle([A.p], async () => ((await LS(A.p, 'bluebird.journal.v1')) || []).some(x => x.id === 'q96r2') ? 1 : null, 30000);
  const c3 = (await LS(A.p, 'bluebird.synccursor.v1')) || {};
  await A.close();
  ok(c0.at === T, 'atcursor: after its first pull A s updatedAt cursor is the newest ride s updatedAt', { at: c0.at, T });
  ok(got1 && c1.at === T, 'atcursor: a note and a weigh-in pulled with a newer updatedAt leave it there (only rides and races move it)', { got: !!got1, at: c1.at, T });
  ok(got2 && c2.full === c0.full, 'atcursor: an older build s late weigh-in (no syncedAt, its updatedAt 20 minutes old: between the ride and that note less the 10 minute margin) comes in through the incremental pull', { got: !!got2, full: c2.full === c0.full });
  ok(got3 && c3.at === R, 'atcursor: a ride pulled with a newer updatedAt moves it (the checks above are not vacuous)', { got: !!got3, at: c3.at, R });
  // a sign-in that takes the account s data (Use only this account s data here) sets the cursor from rides and races too: a note newer
  // than every ride
  const Nn = Date.now(); be.fs.set('users/u1/notes/q96n2', { id: 'q96n2', type: 'other', title: 'Newest note', date: iso(Nn), createdAt: Nn, updatedAt: Nn, schemaVersion: 1, syncedAt: tsOf(Nn) });
  const own = { id: 'q96own', date: iso(T - 864e5), title: 'Own ride', type: 'ride', createdAt: T - 864e5, updatedAt: T - 864e5 };
  const X = await open(SYNC, { athlete: 'A', browser, now: null, repo: REPO, settle: 1500, storage: { '__mock_user': WHO, 'bluebird.journal.v1': [own] }, route: be.handler('X') });
  X.errors.label = 'X'; ERRS.push(X.errors); X.p.on('dialog', g => g.accept());
  await X.p.evaluate(() => document.getElementById('gSignIn').click());
  const asked = await until(() => X.p.evaluate(() => document.getElementById('syncAskModal').classList.contains('open')), 20000);
  if (asked) { await Promise.all([X.p.waitForEvent('load', { timeout: 20000 }).catch(() => null), X.p.click('#syncAskReplace')]); await X.p.waitForLoadState('load'); if (await X.p.evaluate(() => window.__kitFresh === true)) await reload(X.p); }
  await sleep(2500);
  const cx = (await LS(X.p, 'bluebird.synccursor.v1')) || {}, xj = ((await LS(X.p, 'bluebird.journal.v1')) || []).map(x => x.id);
  await X.close();
  ok(asked && xj.includes('q96r2') && !xj.includes('q96own') && cx.at === R, 'atcursor: a sign-in that takes the account s data (replace) sets the updatedAt cursor to the newest ride, not to a newer note', { asked: !!asked, journal: xj, at: cx.at, R, note: Nn });
});
async function tabSettingsBikes(p) { await p.click('#syncHdr:visible, #syncHdrIn:visible'); await p.waitForTimeout(500); await p.click('#view-profile .prow[data-prow="bikes"] .prow-h'); await p.waitForTimeout(500); }

for (const [n, f] of sections) { if (ONLY.length && !ONLY.includes(n)) continue; try { await f(); } catch (e) { ok(false, n + ': threw', String(e && e.stack || e).slice(0, 500)); } }
ok(ERRS.every(e => e.length === 0), 'no page or console errors', ERRS.filter(e => e.length).map(e => [e.label, ...e.slice(0, 3)]));
await browser.close();
C.done('q96 Sync: one device can\'t undo another\'s settings, and late uploads aren\'t missed');
