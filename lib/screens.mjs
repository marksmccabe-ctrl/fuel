// kit2 screens: the shared list of app screens every audit walks (rebuilt 2026-10-29 after the old kit was lost).
//
//   import { screens, run } from '../lib/screens.mjs';
//   await run(async (s, o) => { ...check o.p (the page, on screen s), o.errors, o.fail... }, { page: process.argv[2] });
//
// screens: [{name, width?, height?, athlete?, settings?, storage?, seed?, cloud?, now?, forecast?, go}]
//   width/height  the viewport (390x844 unless noted; the desktop screens are 1280x800)
//   athlete       'A' | 'B' | 'C' | null (default 'A'), as open() takes it
//   settings      extra settings merged into the athlete's; storage: extra localStorage items {key: value} (JSON-encoded by open())
//   seed          'journal' | 'races' | 'volume' | an array of them: the history the screen needs (see SEEDS below), merged under storage
//   cloud         true: the screen opens the cloud page instead of null.html (kitcloud.html, built beside null.html from it: a fake
//                 Firebase config, the Firebase SDK answered by an in-memory fake, signed in as Kit Rider). Volume, Strava, Imported
//                 training and the signed-in Account only exist signed in, so they need it.
//   go(p, o)      drives the page from a fresh open() to the screen (taps, fills, Crunch, opening sheets) and waits until it is settled
//   now           the fixed clock (default NOW: Thu 2026-10-29 15:00 in Los Angeles, so seeded dates, check-ins and Volume stay put;
//                 the News screens use Oct 1, the news fixture's day)
//   forecast      false: no made-up forecast (by default Open-Meteo is answered by weatherRoute: a dry autumn day, 52-78 F)
// The network stays off: only the fake Firebase SDK (cloud), the forecast and fred's GET /version are answered, all from here.
//
// run(each, opts) opens each screen in turn (one browser, a new context per screen) and calls each(screen, o), where o is open()'s
//   {b, ctx, p, errors, close} plus fail (null, or why go() could not reach the screen). Returns [{name, fail, errors}].
//   opts: page (null.html; default process.argv[2]), only (names, a RegExp or a function to pick screens), width (phone screens only:
//   the desktop screens keep 1280), height, scale, motion, dpr, tz, settings, storage, route (tried after the kit's own), forecast,
//   browser (reuse one), log (true: print each name before it opens).
// openScreen(page, screen, opts) does one screen the same way (returns o; o.close() closes it).
// Helpers for tests: settle, tab, crunch, toY, setSheet, NOW, cloudPage, cloudRoute, weatherRoute, CLOUD_UID, seedStorage.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { open } from './open.mjs';

export const NOW = '2026-10-29T15:00:00-07:00';
const NEWS_NOW = '2026-10-01T09:00:00-07:00'; /* the news fixture's day */
const REPO = '/home/user/fuel';

/* ---------------------------------------------------------------- page helpers */
// fonts in, two frames drawn, then a short rest (Reduce Motion is on unless motion:true, so nothing should still be moving)
export async function settle(p, ms = 250) {
  await p.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))));
  await p.waitForTimeout(ms);
}
const until = (p, fn, arg, ms = 10000) => p.waitForFunction(fn, arg, { timeout: ms });
// a bottom tab (plan, journal, volume, races, news)
export async function tab(p, v) {
  await p.click('nav.tabs button[data-view=' + v + ']');
  await until(p, v => document.getElementById('view-' + v).classList.contains('active'), v);
  await settle(p);
}
// Crunch the plan and wait for a ride's or a run's results
export async function crunch(p) {
  await p.click('#calcBtn');
  await until(p, () => !document.getElementById('calcBtn').disabled && (getComputedStyle(document.getElementById('results')).display !== 'none' || !document.getElementById('runResults').hidden), null, 30000);
  await settle(p);
}
// scroll so the element's top sits just under the sticky app header (and the Journal's compact bar)
export async function toY(p, sel, pad = 8) {
  await p.waitForSelector(sel, { state: 'attached', timeout: 10000 });
  await p.evaluate(([s, pad]) => {
    const e = document.querySelector(s), h = document.querySelector('body>header'), hb = h ? Math.max(0, h.getBoundingClientRect().bottom) : 0;
    window.scrollTo(0, Math.max(0, e.getBoundingClientRect().top + window.scrollY - hb - pad));
  }, [sel, pad]);
  await settle(p);
}
async function scrollEnd(p) { await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await settle(p); }
const isOpen = (p, sel) => until(p, s => { const e = document.querySelector(s); return !!e && e.classList.contains('open'); }, sel);
const shown = (p, sel) => until(p, s => { const e = document.querySelector(s); return !!e && !e.hidden && e.getClientRects().length > 0; }, sel);
// Settings: the header's account button (signed out or in), then the list
async function settings(p) {
  await p.click('#syncHdrIn:visible, #syncHdr:visible');
  await until(p, () => document.getElementById('view-profile').classList.contains('active'));
  await settle(p);
}
// a Settings row's sheet (its prow key: carbs, sweat, bikes ...)
export async function setSheet(p, key) {
  await settings(p);
  await p.click('#view-profile .prow[data-prow="' + key + '"] .prow-h');
  await isOpen(p, '#setSheet');
  await settle(p);
}
// Plan's sheets: How long (how) and Where & when (where)
async function planSheet(p, key) {
  await p.click(key === 'how' ? '#howBtn' : '#locRow');
  await isOpen(p, '#planSheet');
  await settle(p);
}
async function closePlanSheet(p) {
  await p.click('#psAct');
  await until(p, () => !document.getElementById('planSheet').classList.contains('open'));
}
async function setWhen(p, date, start) {
  await planSheet(p, 'where');
  await p.fill('#wxDate', date); await p.dispatchEvent('#wxDate', 'change');
  if (start) { await p.fill('#startTime', start); await p.dispatchEvent('#startTime', 'change'); }
  await closePlanSheet(p);
}
async function sport(p, s) {
  await p.click('#sportBtn');
  await p.click('#sportMenu [data-sport=' + s + ']');
  await until(p, s => document.documentElement.classList.contains('run-theme') === (s === 'run'), s);
  await settle(p);
}
// Journal: a group's list (all, planned, check, rides, runs, notes, inj, noticed)
async function jList(p, k) {
  await tab(p, 'journal');
  await p.click('#jGroups [data-jh-open="' + k + '"]');
  await until(p, () => !document.getElementById('jList').hidden);
  await settle(p);
}
async function jNew(p) {
  await tab(p, 'journal');
  await p.click('#jNoteAdd');
  await isOpen(p, '#jNew');
  await settle(p);
}

/* ---------------------------------------------------------------- the cloud page (signed in, no network) */
export const CLOUD_UID = 'kit-cloud-uid-0001';
const CLOUD_USER = { name: 'Kit Rider', email: 'kit.rider@example.com' };
// kitcloud.html beside null.html: the same build with a fake Firebase config (rebuilt whenever null.html is newer)
export function cloudPage(nullPage) {
  const src = path.resolve(nullPage), out = path.join(path.dirname(src), 'kitcloud.html');
  if (existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) return out;
  const t = readFileSync(src, 'utf8');
  const cfg = 'const FIREBASE_CONFIG = {apiKey:"kit-fake", authDomain:"fuel.bluebirdmultisport.com", projectId:"kit-fake", storageBucket:"kit-fake", messagingSenderId:"0", appId:"kit-fake"};';
  const t2 = t.replace('const FIREBASE_CONFIG = null;', cfg);
  if (t2 === t) throw new Error('cloudPage: no "const FIREBASE_CONFIG = null;" in ' + src + ' (build it with tools/mknull.sh)');
  writeFileSync(out, t2);
  return out;
}
// the three SDK modules the app imports from www.gstatic.com, as small in-memory fakes (a Firestore that keeps what is written)
const FAKE_SDK = {
  app: 'export function initializeApp(c){ return {options:c}; }',
  auth: `const U={uid:${JSON.stringify(CLOUD_UID)}, displayName:${JSON.stringify(CLOUD_USER.name)}, email:${JSON.stringify(CLOUD_USER.email)}, photoURL:null, emailVerified:true, isAnonymous:false, providerData:[{providerId:"google.com"}], getIdToken:async()=>"kit-token", reload:async()=>{}};
export function getAuth(app){ return {app, currentUser:U}; }
export function onAuthStateChanged(auth, cb){ setTimeout(()=>cb(auth.currentUser), 0); return ()=>{}; }
export async function getRedirectResult(){ return null; }
export class GoogleAuthProvider{ setCustomParameters(){} addScope(){} }
export async function signInWithPopup(auth){ return {user:U}; }
export async function signInWithRedirect(){}
export async function reauthenticateWithPopup(u){ return {user:u}; }
export async function reauthenticateWithRedirect(){}
export async function signOut(auth){ auth.currentUser=null; }
export async function deleteUser(){}`,
  firestore: `const S=new Map();
const ref=p=>({path:p, id:p.split("/").pop()});
const snapDoc=p=>({id:p.split("/").pop(), ref:ref(p), exists:()=>S.has(p), data:()=>S.has(p) ? JSON.parse(JSON.stringify(S.get(p))) : undefined});
const snapCol=(c, f)=>{ const docs=[...S.keys()].filter(p=>p.startsWith(c+"/") && !p.slice(c.length+1).includes("/")).map(snapDoc).filter(d=>!f || f(d.data())); return {docs, size:docs.length, empty:!docs.length, forEach:fn=>docs.forEach(fn), metadata:{fromCache:false}}; };
const filt=q=>q.w ? (d=>q.w.every(x=>x.op===">" ? !!d && d[x.f]>x.v : true)) : null;
export function initializeFirestore(){ return {}; }
export function persistentLocalCache(){ return {}; }
export function persistentMultipleTabManager(){ return {}; }
export function doc(db, ...p){ return ref(p.join("/")); }
export function collection(db, ...p){ return {path:p.join("/")}; }
export function where(f, op, v){ return {f, op, v}; }
export function query(c, ...w){ return {path:c.path, w}; }
export async function getDocFromServer(r){ return snapDoc(r.path); }
export async function getDoc(r){ return snapDoc(r.path); }
export async function getDocsFromServer(q){ return snapCol(q.path, filt(q)); }
export async function getDocs(q){ return snapCol(q.path, filt(q)); }
export async function setDoc(r, d, o){ S.set(r.path, o && o.merge ? Object.assign({}, S.get(r.path)||{}, d) : d); }
export async function updateDoc(r, d){ S.set(r.path, Object.assign({}, S.get(r.path)||{}, d)); }
export async function deleteDoc(r){ S.delete(r.path); }
export function writeBatch(){ const ops=[]; const b={set(r,d,o){ ops.push(()=>setDoc(r,d,o)); return b; }, update(r,d){ ops.push(()=>updateDoc(r,d)); return b; }, delete(r){ ops.push(()=>deleteDoc(r)); return b; }, async commit(){ for(const f of ops) await f(); }}; return b; }
export function serverTimestamp(){ return Date.now(); }`,
};
export function cloudRoute(r, u) {
  const m = /^https:\/\/www\.gstatic\.com\/firebasejs\/[^/]+\/firebase-(app|auth|firestore)\.js/.exec(u);
  return m ? r.fulfill({ status: 200, contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' }, body: FAKE_SDK[m[1]] }) : null;
}
/* ---------------------------------------------------------------- a made-up forecast and fred server (the network stays off) */
// Open-Meteo's place search and forecast (and the archive used for typical weather past ~10 days) answered for any place and day: a dry
// autumn day near Carmel, IN, 52 F before dawn to about 78 F mid-afternoon, light wind, a little cloud, rain chances late afternoon. A ride at
// 8:00 starts in the Cold band and warms into Moderate, so the hour-by-hour plan has more than one band.
const WX_GEO = { id: 4255151, latitude: 39.9784, longitude: -86.118, elevation: 250, admin1: 'Indiana', country_code: 'US', country: 'United States', timezone: 'America/Indiana/Indianapolis' };
function wxHourly(a, b) {
  const H = { time: [] }, F = ['temperature_2m', 'apparent_temperature', 'relative_humidity_2m', 'dew_point_2m', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m', 'uv_index', 'shortwave_radiation', 'direct_radiation', 'diffuse_radiation', 'direct_normal_irradiance', 'cloud_cover', 'precipitation_probability', 'weather_code', 'is_day', 'precipitation'];
  F.forEach(k => { H[k] = []; });
  const r1 = x => Math.round(x * 10) / 10, rh = (t, d) => { const c = f => (f - 32) * 5 / 9, e = x => Math.exp(17.625 * x / (243.04 + x)); return Math.min(100, Math.round(100 * e(c(d)) / e(c(t)))); };
  for (let t = Date.parse(a + 'T00:00:00Z'); t <= Date.parse(b + 'T00:00:00Z'); t += 864e5) for (let h = 0; h < 24; h++) {
    const warm = Math.max(0, Math.sin(Math.PI * (h - 6) / 17)), sun = Math.max(0, Math.sin(Math.PI * (h - 6.5) / 12.5)), T = r1(52 + 26 * warm), D = 48, W = r1(4 + 5 * sun), S = Math.round(720 * sun);
    H.time.push(new Date(t).toISOString().slice(0, 10) + 'T' + String(h).padStart(2, '0') + ':00');
    const v = { temperature_2m: T, apparent_temperature: r1(T - (W > 6 && T < 60 ? 2 : 0) + (T > 75 ? 1 : 0)), relative_humidity_2m: rh(T, D), dew_point_2m: D, wind_speed_10m: W, wind_direction_10m: 210, wind_gusts_10m: r1(W + 6), uv_index: r1(5 * sun),
      shortwave_radiation: S, direct_radiation: Math.round(S * 0.72), diffuse_radiation: Math.round(S * 0.28), direct_normal_irradiance: S ? Math.round(S * 0.72 / Math.max(0.25, sun)) : 0, cloud_cover: h >= 15 ? 45 : 20,
      precipitation_probability: h >= 16 && h <= 18 ? 35 : 5, weather_code: h >= 15 && h <= 18 ? 2 : 1, is_day: h >= 7 && h <= 18 ? 1 : 0, precipitation: 0 };
    F.forEach(k => H[k].push(v[k]));
  }
  return H;
}
const json = (r, body) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) });
export function weatherRoute(r, u) {
  if (u.startsWith('https://geocoding-api.open-meteo.com/v1/search')) {
    const name = String(new URL(u).searchParams.get('name') || 'Carmel').split(',')[0].trim() || 'Carmel';
    return json(r, { results: [Object.assign({ name }, WX_GEO)] });
  }
  if (/^https:\/\/(api|archive-api)\.open-meteo\.com\/v1\/(forecast|archive)\?/.test(u)) {
    const q = new URL(u).searchParams, a = q.get('start_date'), b = q.get('end_date') || a;
    if (!/^\d{4}-\d\d-\d\d$/.test(a || '') || !/^\d{4}-\d\d-\d\d$/.test(b)) return json(r, { error: true, reason: 'kit: no dates' });
    return json(r, { latitude: WX_GEO.latitude, longitude: WX_GEO.longitude, timezone: WX_GEO.timezone, utc_offset_seconds: -14400, hourly: wxHourly(a, b) });
  }
  return null;
}
// fred's server: only GET /version (no sign-in) is answered, with the version this build expects; every other call stays offline
const pageConst = new Map();
function fredRoute(page) {
  if (!pageConst.has(page)) { const t = readFileSync(page, 'utf8'), g = re => (re.exec(t) || [])[1] || null;
    pageConst.set(page, { api: g(/const FRED_API_URL = '([^']+)'/), ver: g(/const FRED_WORKER_VERSION = '([^']+)'/) }); }
  const c = pageConst.get(page);
  return (r, u) => c.api && c.ver && u === c.api.replace(/\/+$/, '') + '/version' ? json(r, { version: c.ver, builtAt: '2026-10-20T12:00:00Z' }) : null;
}
// the route a screen's page gets: the fake SDK (cloud), the forecast (unless forecast:false), fred's /version, then the caller's own
function routeFor(page, cloud, o) {
  const L = [cloud ? cloudRoute : null, o.forecast === false ? null : weatherRoute, fredRoute(page), o.route || null].filter(Boolean);
  return (r, u) => { for (const f of L) { const h = f(r, u); if (h) return h; } return null; };
}
// this device linked to the account (so the restored session is used), Strava checked and not connected (no Strava calls)
const cloudStorage = () => ({
  'bluebird.owner.v1': { uid: CLOUD_UID, name: CLOUD_USER.name, email: CLOUD_USER.email, photo: '', signedIn: true },
  'bluebird.stravastate.v1': { uid: CLOUD_UID, connected: false, checkedAt: 4102444800000 },
});

/* ---------------------------------------------------------------- seeds: the history screens need */
// Volume: imported training (bluebird.training.v1 {uid, workouts, files}, the localStorage copy the app reads when its IndexedDB copy is
// empty), Nov 2022 to Oct 28 2026: bike, run, swim and strength most days, a build each spring, an easy December; and a season goal.
function volumeSeed() {
  let x = 20261029; const rnd = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
  const W = [], t0 = Date.UTC(2022, 10, 1), t1 = Date.UTC(2026, 9, 28);
  const plan = { 0: ['bike', 3.2], 1: null, 2: ['run', 0.9], 3: ['bike', 1.4], 4: ['swim', 0.8], 5: ['run', 1.1], 6: ['bike', 2.2] };
  for (let t = t0, n = 0; t <= t1; t += 864e5) {
    const d = new Date(t), iso = d.toISOString().slice(0, 10), m = d.getUTCMonth(), y = d.getUTCFullYear(), k = plan[d.getUTCDay()];
    const season = m === 11 ? 0.55 : m < 2 ? 0.8 : m < 7 ? 1.1 : 1.0, grow = 1 + (y - 2022) * 0.06;
    if (k && rnd() > 0.1) { const h = Math.round(k[1] * season * grow * (0.7 + rnd() * 0.6) * 100) / 100;
      W.push({ id: 'kitw' + (n++), date: iso, sport: k[0], hours: h, meters: Math.round(h * (k[0] === 'bike' ? 29000 : k[0] === 'run' ? 10500 : 2700)), source: 'kit-training.csv' }); }
    if ((d.getUTCDay() === 1 || d.getUTCDay() === 4) && rnd() > 0.45) W.push({ id: 'kitw' + (n++), date: iso, sport: 'strength', hours: 0.5, meters: null, source: 'kit-training.csv' });
  }
  return {
    'bluebird.training.v1': { uid: CLOUD_UID, workouts: W, files: [{ id: 'kitf1', name: 'kit-training.csv', kind: 'csv', from: W[0].date, to: W[W.length - 1].date, count: W.length, noTime: 0, importedAt: '2026-10-01T18:00:00.000Z' }] },
    __settings: { volume: { goals: { '2026-01-01': { type: 'more', pct: 8 } } } },
  };
}
// Races: seven made-up results (a 70.3 three years running at the same place, a full, an olympic, a sprint) and one to come
function racesSeed() {
  const R = (id, date, name, type, loc, legs, ov, extra) => Object.assign({ id, date, name, type, location: loc, startTime: '07:00', createdAt: date + 'T18:00:00.000Z', updatedAt: date + 'T18:00:00.000Z',
    swim: legs && { dist: legs[0], unit: 'm', sec: legs[1] }, t1: legs && { sec: legs[2] }, bike: legs && { dist: legs[3], sec: legs[4], avgWatts: legs[5] }, t2: legs && { sec: legs[6] },
    run: legs && { dist: legs[7], sec: legs[8] }, overall: ov, weather: { tempF: 74, humidity: 62 }, nutrition: { carbsHrBike: 85, sodiumHrBike: 900 } }, extra || {});
  return {
    'bluebird.races.v1': [
      R('kitr1', '2023-06-11', 'IRONMAN 70.3 Kit Lake', '70.3', 'Kit Lake, WI', [1900, 2280, 250, 56, 10080, 182, 160, 13.1, 6900], { sec: 19670, place: 640, finishers: 2100, agPlace: 41, agFinishers: 160 }),
      R('kitr2', '2023-09-10', 'Harbor Olympic', 'olympic', 'Harbor City, IL', [1500, 1690, 150, 24.8, 4020, 190, 90, 6.2, 2950], { sec: 8900, place: 88, finishers: 610, agPlace: 9, agFinishers: 44 }),
      R('kitr3', '2024-06-09', 'IRONMAN 70.3 Kit Lake', '70.3', 'Kit Lake, WI', [1900, 2190, 230, 56, 9780, 188, 150, 13.1, 6660], { sec: 19010, place: 512, finishers: 2240, agPlace: 30, agFinishers: 171 }),
      R('kitr4', '2024-09-22', 'IRONMAN Kit Valley', '140.6', 'Kit Valley, KY', [3800, 4560, 420, 112, 20700, 170, 300, 26.2, 15300], { sec: 41280, place: 702, finishers: 2350, agPlace: 52, agFinishers: 190 }),
      R('kitr5', '2025-06-08', 'IRONMAN 70.3 Kit Lake', '70.3', 'Kit Lake, WI', [1900, 2120, 220, 56, 9540, 194, 140, 13.1, 6420], { sec: 18440, place: 401, finishers: 2190, agPlace: 22, agFinishers: 166 }, { notes: { howItWent: 'Held the plan on the bike, ran steady.', learned: 'Start the gels earlier.' } }),
      R('kitr6', '2026-05-17', 'Spring Sprint', 'sprint', 'Kit Lake, WI', [750, 820, 90, 12.4, 1980, 205, 60, 3.1, 1320], { sec: 4270, place: 31, finishers: 420, agPlace: 3, agFinishers: 30 }),
      R('kitr7', '2026-06-07', 'IRONMAN 70.3 Kit Lake', '70.3', 'Kit Lake, WI', [1900, 2090, 210, 56, 9420, 197, 140, 13.1, 6350], { sec: 18210, place: 377, finishers: 2205, agPlace: 19, agFinishers: 170 }),
      R('kitr8', '2027-06-06', 'IRONMAN 70.3 Kit Lake', '70.3', 'Kit Lake, WI', null, {}, { status: 'upcoming' }),
    ],
    __settings: { birthday: '1984-05-20', gender: 'M' },
  };
}
// Journal notes (bluebird.notes.v1): an injury still going, a sickness, a life event, a bike fit and a coaching call
function notesSeed() {
  const N = (id, type, title, date, x) => Object.assign({ id, type, title, date, end: '', going: false, notes: '', createdAt: Date.parse(date + 'T20:00:00Z'), updatedAt: Date.parse(date + 'T20:00:00Z') }, x || {});
  return { 'bluebird.notes.v1': [
    N('kitn1', 'injury', 'Sore left calf', '2026-10-12', { going: true, area: 'Calf', side: 'left', bad: 'around', pain: 3, exercises: ['Calf raises 3 x 15'] }),
    N('kitn2', 'sick', 'Head cold', '2026-09-02', { end: '2026-09-06' }),
    N('kitn3', 'life', 'Moved house', '2026-08-15', { end: '2026-08-16' }),
    N('kitn4', 'fit', 'Saddle up 5 mm', '2026-10-20', { fitter: 'Kit Fit Studio', changes: [{ item: 'Saddle height', amount: '+5 mm' }] }),
    N('kitn5', 'coach', 'October check-in', '2026-10-27', { coach: 'Coach Kit', lengthMin: 30, takeaways: ['Long run to 16 mi'], todos: [{ t: 'Book the bike service', done: false }] }),
  ] };
}
// Journal sessions, made through the app itself (so they have the shape it writes today): Plan, Crunch, Save to Journal for six rides
// (Oct 20, 22, 25, 27 checked in with how they went; today 08:00 waiting for its check-in; Oct 31 and Nov 2 planned), plus a run copied
// from a checked-in ride (Plan cannot save runs to the Journal yet). Built once per page and reused.
async function journalSeedLive(p) {
  const rides = [['2026-10-20', '07:30', 'hard'], ['2026-10-22', '17:30', 'recovery'], ['2026-10-25', '07:30', 'z2'], ['2026-10-27', '09:00', 'z2'], ['2026-10-29', '08:00', 'z2'], ['2026-10-31', '08:00', 'hard'], ['2026-11-02', '07:00', 'z2']];
  for (const [d, s, eff] of rides) {
    await setWhen(p, d, s);
    await p.click('#intensity [data-int=' + eff + ']');
    await crunch(p);
    await p.click('#journalBtn');
    await shown(p, '#planSaved');
  }
  const feel = [['strong', 'fine', '0', 'ok', 'right'], ['ok', 'ok', '1', 'thirsty', 'cold'], ['strong', 'fine', '0', 'ok', 'right'], ['bonked', 'rough', '2', 'thirsty', 'hot']];
  await jList(p, 'check');
  for (const [en, gut, gas, th, v] of feel) {
    const id = await p.evaluate(() => { const b = [...document.querySelectorAll('#journalList [data-jcheck]')].pop(); return b && b.dataset.jcheck; }); /* the oldest first */
    await p.click('#journalList [data-jcheck="' + id + '"]');
    await isOpen(p, '#jModal');
    for (const [g, val] of [['fbEnergy', en], ['fbGut', gut], ['fbGas', gas], ['fbThirst', th]]) await p.click('#' + g + ' [data-v="' + val + '"]');
    await p.click('#jVerdict [data-verdict="' + v + '"]');
    await p.click('#jSave');
    await until(p, () => !document.getElementById('jModal').classList.contains('open'));
    await settle(p, 100);
  }
  const J = await p.evaluate(() => JSON.parse(localStorage.getItem('bluebird.journal.v1') || '[]'));
  const ride = J.find(e => e.status === 'done' && e.date === '2026-10-25');
  if (ride) J.push(Object.assign(JSON.parse(JSON.stringify(ride)), { id: 'kitrun1', sport: 'run', date: '2026-10-26', start: '06:30', name: 'Long run' }));
  return { 'bluebird.journal.v1': J };
}
const SEEDS = {
  volume: async () => volumeSeed(),
  races: async () => racesSeed(),
  journal: async (page, o) => {
    const x = await open(page, { athlete: 'A', now: NOW, browser: o.browser, route: routeFor(page, false, {}) });
    try { return Object.assign(notesSeed(), await journalSeedLive(x.p)); }
    finally { await x.close(); }
  },
};
const seedCache = new Map();
// the storage a screen's seeds give (settings parts come back under __settings)
export async function seedStorage(s, page, o = {}) {
  const out = {};
  for (const k of [].concat(s.seed || [])) {
    const key = k + '|' + path.resolve(page);
    if (!seedCache.has(key)) seedCache.set(key, SEEDS[k](page, o).catch(e => { seedCache.delete(key); throw e; }));
    const v = await seedCache.get(key);
    for (const [kk, vv] of Object.entries(v)) out[kk] = kk === '__settings' ? Object.assign({}, out.__settings, vv) : vv;
  }
  return out;
}

/* ---------------------------------------------------------------- the screens */
const DESK = { width: 1280, height: 800 };
const J = { seed: 'journal' };
const V = { seed: ['volume', 'journal'], cloud: true };
const sheetScreen = (key, more) => Object.assign({ name: 'settings-' + key, go: p => setSheet(p, key) }, more || {});
const resultsAt = (name, sel, more) => ({ name, go: async p => { await crunch(p); if (more) await more(p); await toY(p, sel); } });

export const screens = [
  // ---- Plan, before Crunch: the ride ticket, the Settings box and Crunch the plan
  { name: 'plan-before', go: async p => { await settle(p); } },
  { name: 'plan-sport-menu', go: async p => { await p.click('#sportBtn'); await shown(p, '#sportMenu'); await settle(p); } },
  { name: 'plan-how-time', go: async p => { await planSheet(p, 'how'); await p.click('#stopsMode [data-rmode=time]'); await shown(p, '#howTimeP'); await settle(p); } },
  { name: 'plan-how-distance', go: async p => { await planSheet(p, 'how'); await p.click('#stopsMode [data-rmode=distance]'); await shown(p, '#howDistP'); await settle(p); } },
  { name: 'plan-where', go: p => planSheet(p, 'where') },
  { name: 'plan-upcoming', ...J, go: async p => { await shown(p, '#upcSec'); await toY(p, '#upcSec'); } },
  // ---- Plan after a fresh Crunch, scrolled through the results (weather, packing, why hour by hour, ride totals, closet, details)
  resultsAt('plan-results-weather', '#rWeather'),
  resultsAt('plan-results-packing', '#rNut'),
  resultsAt('plan-results-hourly', '#rWhy'),
  resultsAt('plan-results-totals', '#rRide'),
  resultsAt('plan-results-closet', '#rWearCard'),
  resultsAt('plan-results-details', '#rDetails', async p => {
    await p.click('#rDetails > .v-fold-h');
    for (const id of ['rMathDetails', 'rDetWx', 'rDetWhy']) await p.evaluate(id => { document.getElementById(id).open = true; }, id);
  }),
  { name: 'plan-adjust', go: async p => { await crunch(p); await toY(p, '#rRide'); await p.click('#topAdjBtn'); await isOpen(p, '#planSheet'); await settle(p); } },
  { name: 'plan-saved', go: async p => { await crunch(p); await p.click('#journalBtn'); await shown(p, '#planSaved'); await settle(p); } },
  // ---- run mode (the sport switched to Run), before and after Crunch
  { name: 'run-before', go: p => sport(p, 'run') },
  { name: 'run-aid', go: async p => { await sport(p, 'run'); await p.click('#aidRowBtn'); await until(p, () => !!document.querySelector('.modal.open, .rf-modal:not([hidden])')); await settle(p); } },
  { name: 'run-results', go: async p => { await sport(p, 'run'); await crunch(p); } },
  { name: 'run-results-end', go: async p => { await sport(p, 'run'); await crunch(p); await scrollEnd(p); } },
  // ---- Journal: the home, the compact bar, New entry, each list, an entry, a note, the note editor, the check-in
  { name: 'journal-home', ...J, go: p => tab(p, 'journal') },
  { name: 'journal-compact-bar', ...J, go: async p => { await tab(p, 'journal'); await p.evaluate(() => window.scrollTo(0, 320)); await until(p, () => document.getElementById('jFold').classList.contains('on')); await settle(p); } },
  { name: 'journal-new-entry', ...J, go: jNew },
  ...['all', 'planned', 'check', 'rides', 'runs', 'notes', 'inj', 'noticed'].map(k => ({ name: 'journal-list-' + k, ...J, go: p => jList(p, k) })),
  { name: 'journal-entry-open', ...J, go: async p => { await jList(p, 'rides'); await p.click('#journalList .jrow[data-jst=done] .jtog'); await shown(p, '#journalList .jrow.open .jdet'); await toY(p, '#journalList .jrow.open'); } },
  { name: 'journal-planned-open', ...J, go: async p => { await jList(p, 'planned'); await p.click('#journalList .jrow .jtog'); await shown(p, '#journalList .jrow.open .jdet'); await toY(p, '#journalList .jrow.open'); } },
  { name: 'journal-note-open', ...J, go: async p => { await jList(p, 'notes'); await p.click('#journalList [data-note-open]'); await shown(p, '#noteView'); await settle(p); } },
  { name: 'journal-note-editor', ...J, go: async p => { await jNew(p); await p.click('#jNew [data-jne=note]'); await shown(p, '#noteEd'); await settle(p); } },
  { name: 'journal-injury-editor', ...J, go: async p => { await jNew(p); await p.click('#jNew [data-jne=injury]'); await shown(p, '#noteEd'); await settle(p); } },
  { name: 'journal-checkin', ...J, go: async p => { await jList(p, 'check'); await p.click('#journalList [data-jcheck]'); await isOpen(p, '#jModal'); await settle(p); } },
  // ---- Volume (signed in, imported training): the season card, the six tiles and one open, weeks, hours per year, months, month by month
  { name: 'volume-season', ...V, go: p => tab(p, 'volume') },
  { name: 'volume-tile-open', ...V, go: async p => { await tab(p, 'volume'); await p.click('#volRoot .vol-six .vsq'); await until(p, () => !!document.querySelector('#volRoot .vol-six .vsq.open')); await settle(p); } },
  { name: 'volume-weeks', ...V, go: async p => { await tab(p, 'volume'); await toY(p, '#volWk'); } },
  { name: 'volume-years', ...V, go: async p => { await tab(p, 'volume'); await toY(p, '#volRoot [data-vb=volYears]'); } },
  { name: 'volume-months', ...V, go: async p => { await tab(p, 'volume'); await toY(p, '#volRoot [data-vb=volMonths]'); } },
  { name: 'volume-month-list', ...V, go: async p => { await tab(p, 'volume'); await toY(p, '#volRoot [data-vb=mlist]'); } },
  { name: 'volume-view', ...V, go: async p => { await tab(p, 'volume'); await toY(p, '#volView'); } },
  // ---- Races: the page, the list, a race, the table, Log a race
  { name: 'races-home', seed: 'races', go: p => tab(p, 'races') },
  { name: 'races-list', seed: 'races', go: async p => { await tab(p, 'races'); await toY(p, '#raceListCard'); } },
  { name: 'race-detail', seed: 'races', go: async p => { await tab(p, 'races'); await toY(p, '#raceListCard'); await p.click('#raceList [data-race-open="kitr7"]'); await settle(p, 400); } },
  { name: 'races-table', seed: 'races', go: async p => { await tab(p, 'races'); await p.click('#view-races [data-rt-open]:visible'); await settle(p, 400); } },
  { name: 'race-log', seed: 'races', go: async p => { await tab(p, 'races'); await p.click('#raceLogBtn'); await settle(p, 400); } },
  // ---- News (the repo's news fixture through the app's own hook; its clock: Thu Oct 1, so a race weekend is coming and results are fresh)
  ...['racing', 'commentary', 'other'].map(t => ({ name: 'news-' + t, now: NEWS_NOW, go: async p => { await newsDoc(p); await tab(p, 'news'); await p.click('#nwTab-' + t); await settle(p); } })),
  { name: 'news-race', now: NEWS_NOW, go: async p => { await newsDoc(p); await tab(p, 'news'); await p.click('#nwP-racing [data-nw-race]:visible'); await shown(p, '#nwPage'); await settle(p); } },
  // ---- Settings: each group (top, Gear, the end; the Running side) and the sheets
  { name: 'settings-top', go: settings },
  { name: 'settings-gear', go: async p => { await settings(p); await toY(p, '#view-profile .sg-gear'); } },
  { name: 'settings-end', go: async p => { await settings(p); await scrollEnd(p); } },
  { name: 'settings-running', go: async p => { await settings(p); await p.click('#setSport [data-set-sport=run]'); await settle(p); } },
  sheetScreen('carbs'), sheetScreen('sweat'), sheetScreen('fluidlim'), sheetScreen('gels'), sheetScreen('products'),
  { name: 'settings-product-edit', go: async p => { await setSheet(p, 'products'); await p.click('#setSheet [data-edit=gel][data-id=tA-gel]'); await isOpen(p, '#prodModal'); await settle(p); } },
  sheetScreen('bikes'),
  { name: 'settings-bike', go: async p => { await setSheet(p, 'bikes'); await p.click('#bikeList [data-bike-ed=tri] > summary'); await until(p, () => document.querySelector('#bikeList [data-bike-ed=tri]').open); await settle(p); } },
  sheetScreen('bottles'), sheetScreen('closet'),
  { name: 'settings-stack', go: async p => { await settings(p); await p.click('#prowBtn-stack'); await isOpen(p, '#setSheet'); await settle(p); } },
  sheetScreen('profile'),
  { name: 'settings-advanced', go: async p => { await settings(p); await p.click('#prowBtn-advanced'); await isOpen(p, '#setSheet'); await settle(p); } },
  { name: 'settings-news-sports', go: async p => { await settings(p); await p.click('#prowBtn-mysports'); await isOpen(p, '#nwSportsModal'); await settle(p); } },
  sheetScreen('account'),
  { name: 'settings-run-carry', go: async p => { await settings(p); await p.click('#setSport [data-set-sport=run]'); await p.click('#prowBtn-runcarry'); await isOpen(p, '#setSheet'); await settle(p); } },
  sheetScreen('account', { name: 'settings-account-signed-in', ...V }),
  sheetScreen('strava', { name: 'settings-strava', ...V }),
  sheetScreen('training', { name: 'settings-training', ...V }),
  // ---- the science and privacy pages
  { name: 'science', go: async p => { await p.click('#view-plan [data-science]'); await until(p, () => document.getElementById('view-science').classList.contains('active')); await settle(p); } },
  { name: 'science-belief', go: async p => { await p.click('#view-plan [data-science]'); await until(p, () => document.getElementById('view-science').classList.contains('active')); await p.click('#sci-caps > summary'); await toY(p, '#sci-caps'); } },
  { name: 'privacy', cloud: true, go: async p => { await p.click('#view-plan [data-privacy]'); await until(p, () => document.getElementById('view-privacy').classList.contains('active')); await settle(p); } },
  // ---- the computer layout (1280 x 800): Plan after Crunch, a Journal list with its pane, Volume
  { name: 'desktop-plan', ...DESK, ...J, go: p => crunch(p) },
  { name: 'desktop-journal', ...DESK, ...J, go: p => jList(p, 'rides') },
  { name: 'desktop-volume', ...DESK, ...V, go: p => tab(p, 'volume') },
];

// News reads data/news.json, which a page opened from disk cannot fetch; the app's own hook takes the repo's fixture instead
let NEWS = null;
async function newsDoc(p) {
  if (!NEWS) NEWS = JSON.parse(readFileSync(path.join(REPO, 'tests/fixtures/news.fixture.json'), 'utf8'));
  await p.evaluate(d => { window.__fredNewsDoc = d; }, NEWS);
}

/* ---------------------------------------------------------------- open a screen, walk them all */
export async function openScreen(page, s, o = {}) {
  const seeded = await seedStorage(s, page, o), sset = seeded.__settings || {};
  delete seeded.__settings;
  const desk = s.width && s.width >= 1100;
  const x = await open(s.cloud ? cloudPage(page) : page, {
    width: desk ? s.width : o.width || s.width || 390, height: desk ? s.height || 800 : o.height || s.height || 844,
    scale: o.scale, motion: o.motion, dpr: o.dpr, tz: o.tz, browser: o.browser, now: s.now || o.now || NOW,
    athlete: s.athlete === undefined ? 'A' : s.athlete,
    settings: Object.assign({}, sset, s.settings || {}, o.settings || {}),
    storage: Object.assign({}, s.cloud ? cloudStorage() : {}, seeded, s.storage || {}, o.storage || {}),
    route: routeFor(page, !!s.cloud, { forecast: s.forecast === false ? false : o.forecast, route: o.route }),
  });
  x.screen = s; x.fail = null;
  try { await s.go(x.p, x); await settle(x.p); }
  catch (e) { x.fail = String(e && e.message || e).split('\n')[0]; }
  return x;
}
export async function run(each, o = {}) {
  const page = o.page || process.argv[2];
  if (!page) throw new Error('run: no page (pass {page} or the null.html path as the first argument)');
  const pick = !o.only ? () => true : typeof o.only === 'function' ? o.only : o.only instanceof RegExp ? s => o.only.test(s.name) : s => [].concat(o.only).includes(s.name);
  const b = o.browser || await chromium.launch(), out = [];
  try {
    for (const s of screens.filter(pick)) {
      if (o.log) console.log('  ... ' + s.name);
      let x;
      try { x = await openScreen(page, s, Object.assign({}, o, { browser: b })); }
      catch (e) { const r = { name: s.name, fail: 'open: ' + String(e && e.message || e).split('\n')[0], errors: [] }; out.push(r); if (each) await each(s, r); continue; }
      try { if (each) await each(s, x); }
      finally { out.push({ name: s.name, fail: x.fail, errors: x.errors.slice() }); await x.close(); }
    }
  } finally { if (!o.browser) await b.close(); }
  return out;
}
