// fred-api: the Cloudflare Worker that talks to Strava for fred.
//
// It holds the Strava client secret and every athlete's Strava tokens (in the KV namespace STRAVA_TOKENS, keyed by
// Firebase uid). Tokens never reach the browser: the app only ever sees { connected, athleteName, ... } and compact
// activity summaries.
//
// Every request must come from ALLOWED_ORIGIN (CORS). Every endpoint except /strava/exchange also needs the user's
// Firebase ID token (Authorization: Bearer <token>), verified here against Google's public keys. /strava/exchange is
// called by the OAuth callback page, which may open in a different browser than the app (an iPhone Home Screen app
// keeps its own storage), so it proves who is connecting with the single-use "state" that /strava/start created for a
// verified user (10 minutes, stored in KV) instead of an ID token.
//
// Settings (Cloudflare dashboard > Workers > fred-api > Settings):
//   STRAVA_CLIENT_ID      variable  282871
//   STRAVA_CLIENT_SECRET  secret    (from strava.com/settings/api; never in the repo)
//   FIREBASE_PROJECT_ID   variable  bluebird-fuel
//   ALLOWED_ORIGIN        variable  https://fuel.bluebirdmultisport.com
//   STRAVA_TOKENS         KV namespace binding
//
// Endpoints (JSON in and out):
//   GET  /version                           -> { version, builtAt }  no ID token, any origin (open it in a browser)
//   POST /strava/start {force?}             -> { url }  the Strava authorize link, with a fresh state (force: approval_prompt=force)
//   POST /strava/exchange {code,scope,state} -> { connected:true, athleteName, scope, limited }  limited: activity:read only (no private
//                                              activities); 400 { error:'scope', got } when neither activity scope was granted
//   GET  /strava/status                     -> { connected, athleteName, connectedAt, scope, limited }
//   GET  /strava/activities?after=&before=&page=  -> { activities:[compact], usage:{usage15,usage1d,limit15,limit1d} }
//   GET  /strava/streams?id=                -> { id, streams:{time,distance,velocity_smooth,watts,altitude,grade_smooth} }
//                                              one ride's second-by-second data, read when the owner asks for a tighter
//                                              aero estimate; nothing is stored here. 404 not-found, 422 no-streams.
//   POST /strava/disconnect                 -> { connected:false }
//   POST /tp/link {url}                     -> { connected:true, masked, fetchedAt, ics }  the owner's TrainingPeaks calendar link (webcal:// or
//                                              https://, trainingpeaks.com only), checked by fetching it once, then kept here like a secret (never
//                                              sent back: only a masked form). 400 link · 422 { error: gone | fetch | big | notcal }
//   GET  /tp/plan?refresh=1                 -> { connected, masked, fetchedAt, ics, error? }  the feed, fetched here at most every 2 hours (Refresh:
//                                              now, but not twice a minute); when TrainingPeaks fails, the last feed with error
//   POST /tp/remove                         -> { connected:false }  deletes the link and the cached feed
// Near Strava's rate limits (within 10%) or after a 429, activity calls answer 429 { retryAfter } (seconds) without
// calling Strava.

// Which code is running: the git short hash of the commit that last changed this Worker's code, and that commit's time (UTC).
// fred's index.html carries the same two values (FRED_WORKER_VERSION), so the app can tell when Cloudflare has an older copy.
const VERSION = { version: '67b51cd', builtAt: '2026-09-28T18:42:50Z' };
const STRAVA = 'https://www.strava.com';
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const REDIRECT_URI = 'https://fuel.bluebirdmultisport.com/strava/callback/';
const SCOPE = 'read,activity:read_all';
const REFRESH_MARGIN = 600;      // refresh the access token when it has under 10 minutes left
const STATE_TTL = 600;           // an OAuth state lives 10 minutes and works once
const NEAR_LIMIT = 0.9;          // stop calling Strava at 90% of a limit
const STREAM_KEYS = ['time', 'distance', 'velocity_smooth', 'watts', 'altitude', 'grade_smooth'];
const MAX_POINTS = 40000;         // about 11 hours at one point a second
const COMPACT = ['id','name','sport_type','start_date','start_date_local','timezone','moving_time','elapsed_time','distance','total_elevation_gain',
  'average_heartrate','max_heartrate','average_watts','weighted_average_watts','device_watts','kilojoules','workout_type','trainer','manual'];

// ---------- small helpers ----------
const now = () => Math.floor(Date.now() / 1000);
function cors(env) {
  return { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '600', 'Vary': 'Origin' };
}
function json(env, status, body, extra) {
  return new Response(JSON.stringify(body), { status, headers: Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, cors(env), extra || {}) });
}
function b64urlBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
  const bin = atob(s), out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out;
}
const b64urlJSON = s => JSON.parse(new TextDecoder().decode(b64urlBytes(s)));
function randomHex(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map(b => b.toString(16).padStart(2, '0')).join(''); }

// ---------- Firebase ID token (RS256 JWT signed by Google's securetoken service) ----------
let JWKS = { keys: null, until: 0 };
async function googleKeys(force) {
  if (!force && JWKS.keys && Date.now() < JWKS.until) return JWKS.keys;
  const r = await fetch(JWKS_URL);
  if (!r.ok) throw new Error('keys');
  const body = await r.json(), m = /max-age=(\d+)/.exec(r.headers.get('Cache-Control') || '');
  JWKS = { keys: body.keys || [], until: Date.now() + (m ? +m[1] : 3600) * 1000 };
  return JWKS.keys;
}
async function verifyIdToken(token, env) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('format');
  const head = b64urlJSON(parts[0]), p = b64urlJSON(parts[1]);
  if (head.alg !== 'RS256' || !head.kid) throw new Error('alg');
  let jwk = (await googleKeys(false)).find(k => k.kid === head.kid);
  if (!jwk) jwk = (await googleKeys(true)).find(k => k.kid === head.kid); // keys rotate: refetch once
  if (!jwk) throw new Error('kid');
  const key = await crypto.subtle.importKey('jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true }, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlBytes(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
  if (!ok) throw new Error('signature');
  const t = now(), proj = env.FIREBASE_PROJECT_ID;
  if (p.iss !== 'https://securetoken.google.com/' + proj) throw new Error('iss');
  if (p.aud !== proj) throw new Error('aud');
  if (!(p.exp > t)) throw new Error('exp');
  if (!(p.iat <= t + 300)) throw new Error('iat');
  if (p.auth_time != null && !(p.auth_time <= t + 300)) throw new Error('auth_time');
  if (typeof p.sub !== 'string' || !p.sub || p.sub.length > 128) throw new Error('sub');
  return p.sub;
}

// ---------- Strava rate limits: remembered per Worker instance, and in KV once close to a limit ----------
// Strava's windows: 15 minutes (reset at :00, :15, :30, :45 UTC) and a day (reset at midnight UTC).
const win15 = t => Math.floor(t / 900), winDay = t => Math.floor(t / 86400);
let USAGE = null;
function readUsage(headers) {
  const pick = (a, b) => headers.get(a) || headers.get(b) || '';
  const lim = pick('X-ReadRateLimit-Limit', 'X-RateLimit-Limit').split(',').map(Number), use = pick('X-ReadRateLimit-Usage', 'X-RateLimit-Usage').split(',').map(Number);
  if (!(lim.length === 2 && use.length === 2) || lim.some(isNaN) || use.some(isNaN)) return null;
  return { usage15: use[0], usage1d: use[1], limit15: lim[0], limit1d: lim[1], at: now() };
}
async function currentUsage(env) {
  let u = USAGE;
  try { const k = await env.STRAVA_TOKENS.get('usage', { type: 'json' }); if (k && (!u || k.at > u.at)) u = k; } catch (e) {}
  return u;
}
async function rememberUsage(env, u) {
  if (!u) return; USAGE = u;
  if (u.usage15 >= u.limit15 * 0.8 || u.usage1d >= u.limit1d * 0.8) { try { await env.STRAVA_TOKENS.put('usage', JSON.stringify(u), { expirationTtl: 86400 }); } catch (e) {} }
}
// seconds to wait, or 0 when a call is fine
function waitFor(u) {
  if (!u) return 0; const t = now();
  if (winDay(u.at) === winDay(t) && u.usage1d >= u.limit1d * NEAR_LIMIT) return (winDay(t) + 1) * 86400 - t;
  if (win15(u.at) === win15(t) && u.usage15 >= u.limit15 * NEAR_LIMIT) return (win15(t) + 1) * 900 - t;
  return 0;
}

// ---------- tokens ----------
async function tokenRequest(env, params) {
  const body = new URLSearchParams(Object.assign({ client_id: env.STRAVA_CLIENT_ID, client_secret: env.STRAVA_CLIENT_SECRET }, params));
  return fetch(STRAVA + '/oauth/token', { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
}
async function getRecord(env, uid) { return env.STRAVA_TOKENS.get(uid, { type: 'json' }); }
// a record with an access token good for at least 10 more minutes (refreshes and saves the new refresh token), or null
async function freshRecord(env, uid) {
  const rec = await getRecord(env, uid); if (!rec) return null;
  if (rec.expiresAt - now() > REFRESH_MARGIN) return rec;
  const r = await tokenRequest(env, { grant_type: 'refresh_token', refresh_token: rec.refreshToken });
  if (r.status === 400 || r.status === 401) { await env.STRAVA_TOKENS.delete(uid); return null; } // revoked on strava.com: reconnect
  if (!r.ok) throw Object.assign(new Error('refresh'), { status: 502 });
  const t = await r.json();
  const next = Object.assign({}, rec, { accessToken: t.access_token, refreshToken: t.refresh_token || rec.refreshToken, expiresAt: t.expires_at });
  await env.STRAVA_TOKENS.put(uid, JSON.stringify(next));
  return next;
}
function compact(a) { const o = {}; COMPACT.forEach(k => { if (a[k] !== undefined && a[k] !== null) o[k] = a[k]; }); return o; }
// Strava's scope list, however it arrives: "read,activity:read_all", "read%2Cactivity%3Aread_all" (even encoded twice), or space-separated
function scopeList(scope) {
  let x = String(scope || '');
  for (let i = 0; i < 3 && /%[0-9a-f]{2}/i.test(x); i++) { try { x = decodeURIComponent(x.replace(/\+/g, ' ')); } catch (e) { break; } }
  return x.split(/[\s,]+/).map(v => v.trim()).filter(Boolean);
}
// 'all' (activity:read_all, which includes activity:read), 'public' (activity:read: everything but private activities), or null
function activityLevel(list) { return list.includes('activity:read_all') ? 'all' : list.includes('activity:read') ? 'public' : null; }

// One read from Strava for a verified user, in this order: the rate-limit guard, a fresh token, the call. Returns
// { r, usage } for a 2xx answer, or { res } with the reply to send (429 retryAfter, 409 reconnect, 404 not-found, 502).
async function stravaRead(env, uid, apiPath, notFound) {
  const wait = waitFor(await currentUsage(env));
  if (wait > 0) return { res: json(env, 429, { retryAfter: wait }, { 'Retry-After': String(wait) }) };
  const rec = await freshRecord(env, uid);
  if (!rec) return { res: json(env, 409, { connected: false, error: 'reconnect' }) };
  const r = await fetch(STRAVA + apiPath, { headers: { Authorization: 'Bearer ' + rec.accessToken } });
  const usage = readUsage(r.headers);
  if (r.status === 429) {
    const full = usage ? Object.assign({}, usage, { usage15: Math.max(usage.usage15, usage.limit15) }) : { usage15: 1, usage1d: 0, limit15: 1, limit1d: 1e9, at: now() };
    await rememberUsage(env, full); const w = Math.max(60, waitFor(full));
    return { res: json(env, 429, { retryAfter: w }, { 'Retry-After': String(w) }) };
  }
  await rememberUsage(env, usage);
  if (r.status === 401) { await env.STRAVA_TOKENS.delete(uid); return { res: json(env, 409, { connected: false, error: 'reconnect' }) }; }
  if (notFound && (r.status === 404 || r.status === 403)) return { res: json(env, 404, { error: 'not-found' }) };
  if (!r.ok) return { res: json(env, 502, { error: 'strava' }) };
  return { r, usage };
}
// Strava's key_by_type answer -> { time:[s], distance:[m], velocity_smooth:[m/s], watts:[W|null], altitude:[m], grade_smooth:[%] },
// rounded, only the keys asked for, equal lengths. null when time, distance and watts are not all there.
function compactStreams(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const by = Array.isArray(raw) ? Object.fromEntries(raw.filter(x => x && x.type).map(x => [x.type, x])) : raw;
  const out = {}; let n = Infinity;
  for (const k of STREAM_KEYS) {
    const d = by[k] && Array.isArray(by[k].data) ? by[k].data : null; if (!d) continue;
    const dp = k === 'time' ? 0 : k === 'watts' ? 0 : 2;
    out[k] = d.slice(0, MAX_POINTS).map(v => typeof v === 'number' && isFinite(v) ? +v.toFixed(dp) : null); n = Math.min(n, out[k].length);
  }
  if (!out.time || !out.distance || !out.watts || !n) return null;
  Object.keys(out).forEach(k => { out[k].length = n; });
  return out;
}

// ---------- TrainingPeaks plan (item 14): the owner's calendar link, kept like a secret; the .ics fetched here, at most every 2 hours ----------
// KV (same namespace): 'tp:<uid>' -> { url, savedAt }  (never sent back: the app only sees a masked form)
//                      'tpc:<uid>' -> { fetchedAt, ics }  (the last feed, for the 2-hour window and when TrainingPeaks is down)
const TP_EVERY = 2 * 3600;              // seconds between fetches unless the owner taps Refresh
const TP_MAX = 2 * 1024 * 1024;         // a calendar feed larger than 2 MB is refused
const TP_HOST = /(^|\.)trainingpeaks\.com$/i; // only TrainingPeaks calendar links are fetched (the Worker never fetches other sites for a user)
function tpNormalize(raw) {
  let s = String(raw || '').trim(); if (!s || s.length > 1000) return null;
  s = s.replace(/^webcals?:\/\//i, 'https://');
  let u; try { u = new URL(s); } catch (e) { return null; }
  if (u.protocol !== 'https:' || !TP_HOST.test(u.hostname) || u.username || u.password) return null;
  return u.toString();
}
function tpMask(url) { try { const u = new URL(url), p = u.pathname; return u.hostname + '/…' + p.slice(-6); } catch (e) { return 'TrainingPeaks link'; } }
async function tpFetch(url) {
  const r = await fetch(url, { headers: { 'Accept': 'text/calendar, text/plain, */*', 'User-Agent': 'fred-api (fuel.bluebirdmultisport.com)' }, redirect: 'follow', cf: { cacheTtl: 0 } });
  if (!r.ok) { const e = new Error('tp'); e.code = r.status === 404 || r.status === 410 ? 'gone' : 'fetch'; throw e; }
  const host = new URL(r.url || url).hostname; if (!TP_HOST.test(host)) { const e = new Error('tp'); e.code = 'fetch'; throw e; } // a redirect off TrainingPeaks
  const text = await r.text(); if (text.length > TP_MAX) { const e = new Error('tp'); e.code = 'big'; throw e; }
  if (!/BEGIN:VCALENDAR/.test(text.slice(0, 2000))) { const e = new Error('tp'); e.code = 'notcal'; throw e; }
  return text;
}
async function tpRoute(request, env, path, uid) {
  const method = request.method, kLink = 'tp:' + uid, kCache = 'tpc:' + uid;
  if (path === '/tp/link' && method === 'POST') {
    let b; try { b = await request.json(); } catch (e) { return json(env, 400, { error: 'body' }); }
    const url = tpNormalize(b.url); if (!url) return json(env, 400, { error: 'link' });
    let ics; try { ics = await tpFetch(url); } catch (e) { return json(env, 422, { error: e.code || 'fetch' }); } // check the link works before keeping it
    const at = now();
    await env.STRAVA_TOKENS.put(kLink, JSON.stringify({ url, savedAt: new Date(at * 1000).toISOString() }));
    await env.STRAVA_TOKENS.put(kCache, JSON.stringify({ fetchedAt: at, ics }));
    return json(env, 200, { connected: true, masked: tpMask(url), fetchedAt: at, ics });
  }
  if (path === '/tp/plan' && method === 'GET') {
    const link = await env.STRAVA_TOKENS.get(kLink, { type: 'json' }); if (!link) return json(env, 200, { connected: false });
    const refresh = new URL(request.url).searchParams.get('refresh') === '1';
    const c = await env.STRAVA_TOKENS.get(kCache, { type: 'json' }), t = now();
    if (c && !refresh && t - c.fetchedAt < TP_EVERY) return json(env, 200, { connected: true, masked: tpMask(link.url), fetchedAt: c.fetchedAt, ics: c.ics });
    if (c && refresh && t - c.fetchedAt < 60) return json(env, 200, { connected: true, masked: tpMask(link.url), fetchedAt: c.fetchedAt, ics: c.ics }); // a second tap within a minute
    try { const ics = await tpFetch(link.url); await env.STRAVA_TOKENS.put(kCache, JSON.stringify({ fetchedAt: t, ics }));
      return json(env, 200, { connected: true, masked: tpMask(link.url), fetchedAt: t, ics }); }
    catch (e) { return json(env, 200, { connected: true, masked: tpMask(link.url), fetchedAt: c ? c.fetchedAt : null, ics: c ? c.ics : null, error: e.code || 'fetch' }); }
  }
  if (path === '/tp/remove' && method === 'POST') { await env.STRAVA_TOKENS.delete(kLink); await env.STRAVA_TOKENS.delete(kCache); return json(env, 200, { connected: false }); }
  return null;
}

// ---------- routes ----------
async function route(request, env, path) {
  const method = request.method;

  if (path === '/strava/exchange' && method === 'POST') {
    let b; try { b = await request.json(); } catch (e) { return json(env, 400, { error: 'body' }); }
    const state = String(b.state || ''), code = String(b.code || '');
    if (!/^[0-9a-f]{64}$/.test(state) || !code) return json(env, 400, { error: 'state' });
    const uid = await env.STRAVA_TOKENS.get('state:' + state);
    if (!uid) return json(env, 400, { error: 'state' });
    await env.STRAVA_TOKENS.delete('state:' + state); // single use
    // the code first; the scope is judged after, from what Strava's redirect said and what the token answer says
    const r = await tokenRequest(env, { code, grant_type: 'authorization_code' });
    if (!r.ok) {
      let e = {}; try { e = await r.json(); } catch (x) {}
      const full = r.status === 403 || /limit/i.test(JSON.stringify(e)); // Strava caps connected athletes (fred: 10)
      console.log(JSON.stringify({ at: 'strava/exchange', version: VERSION.version, redirectScope: String(b.scope || '').slice(0, 200), tokenStatus: r.status, message: String(e.message || '').slice(0, 200) }));
      return json(env, full ? 403 : 502, { error: full ? 'full' : 'strava' });
    }
    const t = await r.json();
    const list = [...new Set(scopeList(b.scope).concat(scopeList(t.scope)))], level = activityLevel(list);
    // for Cloudflare › fred-api › Logs: the scopes as they arrived and what was decided; never a token, code or state
    console.log(JSON.stringify({ at: 'strava/exchange', version: VERSION.version, redirectScope: b.scope === undefined ? '(missing)' : String(b.scope).slice(0, 200),
      tokenScope: t.scope === undefined ? '(missing)' : String(t.scope).slice(0, 200), tokenFields: Object.keys(t).sort(), scopes: list, level: level || 'none' }));
    if (!level) { // no activity access at all: let the token go again, and say what Strava sent
      try { await fetch(STRAVA + '/oauth/deauthorize', { method: 'POST', body: new URLSearchParams({ access_token: t.access_token }), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }); } catch (e) {}
      return json(env, 400, { error: 'scope', got: list.join(',').slice(0, 100) });
    }
    const granted = list.join(',');
    const ath = t.athlete || {}, athleteName = [ath.firstname, ath.lastname].filter(Boolean).join(' ').trim() || 'Strava athlete';
    await env.STRAVA_TOKENS.put(uid, JSON.stringify({ athleteId: ath.id || null, athleteName, accessToken: t.access_token, refreshToken: t.refresh_token,
      expiresAt: t.expires_at, scope: granted, connectedAt: new Date().toISOString() }));
    return json(env, 200, { connected: true, athleteName, scope: granted, limited: level === 'public' });
  }

  // everything else: a verified Firebase ID token
  const auth = request.headers.get('Authorization') || '', m = /^Bearer\s+(.+)$/.exec(auth);
  if (!m) return json(env, 401, { error: 'auth' });
  let uid; try { uid = await verifyIdToken(m[1], env); } catch (e) { return json(env, 401, { error: 'auth' }); }

  if (path === '/strava/start' && method === 'POST') {
    const state = randomHex(32);
    await env.STRAVA_TOKENS.put('state:' + state, uid, { expirationTtl: STATE_TTL });
    let force = false; try { force = !!(await request.json()).force; } catch (e) {} // "Try again": Strava shows the boxes again
    const q = new URLSearchParams({ client_id: env.STRAVA_CLIENT_ID, redirect_uri: REDIRECT_URI, response_type: 'code', approval_prompt: force ? 'force' : 'auto', scope: SCOPE, state });
    return json(env, 200, { url: STRAVA + '/oauth/authorize?' + q.toString() });
  }
  if (path === '/strava/status' && method === 'GET') {
    const rec = await getRecord(env, uid);
    return json(env, 200, rec ? { connected: true, athleteName: rec.athleteName, connectedAt: rec.connectedAt, scope: rec.scope, limited: activityLevel(scopeList(rec.scope)) === 'public' } : { connected: false });
  }
  if (path === '/strava/activities' && method === 'GET') {
    const u = new URL(request.url), q = new URLSearchParams({ per_page: '200' });
    for (const k of ['after', 'before', 'page']) { const v = u.searchParams.get(k); if (v != null && /^\d{1,12}$/.test(v)) q.set(k, v); }
    const got = await stravaRead(env, uid, '/api/v3/athlete/activities?' + q.toString());
    if (got.res) return got.res;
    const list = await got.r.json(), usage = got.usage;
    return json(env, 200, { activities: (Array.isArray(list) ? list : []).map(compact),
      usage: usage ? { usage15: usage.usage15, usage1d: usage.usage1d, limit15: usage.limit15, limit1d: usage.limit1d } : null });
  }
  if (path === '/strava/streams' && method === 'GET') {
    const id = new URL(request.url).searchParams.get('id') || '';
    if (!/^\d{1,20}$/.test(id)) return json(env, 400, { error: 'id' });
    const got = await stravaRead(env, uid, '/api/v3/activities/' + id + '/streams?keys=' + STREAM_KEYS.join(',') + '&key_by_type=true', true);
    if (got.res) return got.res;
    let raw; try { raw = await got.r.json(); } catch (e) { return json(env, 502, { error: 'strava' }); }
    const streams = compactStreams(raw);
    if (!streams) return json(env, 422, { error: 'no-streams' });
    return json(env, 200, { id: Number(id), streams });
  }
  if (path.startsWith('/tp/')) { const r = await tpRoute(request, env, path, uid); if (r) return r; }
  if (path === '/strava/disconnect' && method === 'POST') {
    const rec = await getRecord(env, uid);
    if (rec) {
      try { await fetch(STRAVA + '/oauth/deauthorize', { method: 'POST', body: new URLSearchParams({ access_token: rec.accessToken }), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }); } catch (e) {}
      await env.STRAVA_TOKENS.delete(uid);
    }
    return json(env, 200, { connected: false });
  }
  return json(env, 404, { error: 'not found' });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const path0 = new URL(request.url).pathname.replace(/\/+$/, '');
    if (path0 === '/version' && request.method === 'GET') // which code is running: nothing private, so no ID token and any origin
      return new Response(JSON.stringify(VERSION), { headers: Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, origin === env.ALLOWED_ORIGIN ? cors(env) : {}) });
    if (!env.ALLOWED_ORIGIN || origin !== env.ALLOWED_ORIGIN) return new Response('Forbidden', { status: 403, headers: { 'Vary': 'Origin' } });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env) });
    const path = new URL(request.url).pathname.replace(/\/+$/, '');
    try { return await route(request, env, path); }
    catch (e) { return json(env, e && e.status || 500, { error: 'server' }); }
  }
};
