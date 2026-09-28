// node worker/fred-api.test.mjs  -- unit tests for the fred-api Worker with a fake Strava, fake Google keys and a fake KV.
// No network: globalThis.fetch is replaced. Needs Node 18+ (fetch, Request, Response, crypto.subtle).
let worker, n = 0; const fresh = async () => { worker = (await import('./fred-api.js?fresh=' + (++n))).default; }; // a fresh module: empty key and usage caches

let bad = 0; const ok = (c, m, x) => { console.log((c ? '  ok ' : '  FAIL ') + m + (c || x === undefined ? '' : ' ' + JSON.stringify(x).slice(0, 400))); if (!c) bad++; };
const ORIGIN = 'https://fuel.bluebirdmultisport.com', PROJECT = 'bluebird-fuel', BASE = 'https://fred-api.example.workers.dev';

// ---------- fake KV ----------
function makeKV() {
  const m = new Map();
  return { m, async get(k, o) { const v = m.has(k) ? m.get(k).v : null; if (v == null) return null; return o && (o.type === 'json' || o === 'json') ? JSON.parse(v) : v; },
    async put(k, v, o) { m.set(k, { v: String(v), ttl: o && o.expirationTtl }); }, async delete(k) { m.delete(k); } };
}
const env = () => ({ STRAVA_CLIENT_ID: '282871', STRAVA_CLIENT_SECRET: 'shh-secret', FIREBASE_PROJECT_ID: PROJECT, ALLOWED_ORIGIN: ORIGIN, STRAVA_TOKENS: makeKV() });

// ---------- fake Google keys + ID tokens ----------
const b64u = b => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const kp = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const other = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const pub = Object.assign(await crypto.subtle.exportKey('jwk', kp.publicKey), { kid: 'k1', alg: 'RS256', use: 'sig' });
async function idToken(claims = {}, { key = kp.privateKey, kid = 'k1', alg = 'RS256' } = {}) {
  const t = Math.floor(Date.now() / 1000);
  const p = Object.assign({ iss: 'https://securetoken.google.com/' + PROJECT, aud: PROJECT, sub: 'uid-mark', iat: t - 10, exp: t + 3600, auth_time: t - 100 }, claims);
  const h = b64u(JSON.stringify({ alg, kid, typ: 'JWT' })), b = b64u(JSON.stringify(p));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(h + '.' + b));
  return h + '.' + b + '.' + b64u(new Uint8Array(sig));
}

// ---------- fake Strava ----------
const S = { calls: [], tokenReplies: [], activities: [], rate: { limit: '200,2000', usage: '10,100' }, status: 200, deauth: 0 };
function stravaActivity(i) { return { id: 1000 + i, name: 'Ride ' + i, sport_type: 'Ride', type: 'Ride', start_date: '2025-06-0' + (1 + i % 9) + 'T12:00:00Z', start_date_local: '2025-06-0' + (1 + i % 9) + 'T08:00:00Z',
  timezone: '(GMT-05:00) America/Indiana/Indianapolis', moving_time: 3600 + i, elapsed_time: 3700 + i, distance: 30000.5, total_elevation_gain: 120, average_heartrate: 140, max_heartrate: 170,
  average_watts: 180, weighted_average_watts: 190, device_watts: true, kilojoules: 650, workout_type: null, trainer: false, manual: false,
  map: { summary_polyline: 'secret-route' }, athlete: { id: 7 }, kudos_count: 3, start_latlng: [39.9, -86.1] }; }
globalThis.fetch = async (url, init = {}) => {
  url = String(url); const body = init.body ? String(init.body) : ''; S.calls.push({ url, method: init.method || 'GET', body, auth: init.headers && (init.headers.Authorization || init.headers.authorization) });
  if (url.startsWith('https://www.googleapis.com/')) return new Response(JSON.stringify({ keys: [pub] }), { headers: { 'Cache-Control': 'public, max-age=21600' } });
  if (url === 'https://www.strava.com/oauth/token') { const r = S.tokenReplies.shift() || { status: 500, body: {} }; return new Response(JSON.stringify(r.body), { status: r.status }); }
  if (url === 'https://www.strava.com/oauth/deauthorize') { S.deauth++; return new Response('{}'); }
  if (url.startsWith('https://www.strava.com/api/v3/athlete/activities')) {
    const h = { 'X-RateLimit-Limit': '600,6000', 'X-RateLimit-Usage': '1,1', 'X-ReadRateLimit-Limit': S.rate.limit, 'X-ReadRateLimit-Usage': S.rate.usage };
    if (S.status === 429) return new Response('{"message":"Rate Limit Exceeded"}', { status: 429, headers: h });
    return new Response(JSON.stringify(S.activities), { status: S.status, headers: h });
  }
  return new Response('not mocked ' + url, { status: 599 });
};

async function call(e, method, path, { token, origin = ORIGIN, body } = {}) {
  const headers = {}; if (origin) headers.Origin = origin; if (token) headers.Authorization = 'Bearer ' + token; if (body) headers['Content-Type'] = 'application/json';
  const r = await worker.fetch(new Request(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined }), e);
  let j = null; try { j = await r.clone().json(); } catch (x) {}
  return { status: r.status, j, h: r.headers };
}
const reset = async () => { await fresh(); S.calls = []; S.tokenReplies = []; S.activities = []; S.rate = { limit: '200,2000', usage: '10,100' }; S.status = 200; S.deauth = 0; };

// ---------- origin + ID token checks ----------
await reset(); { const e = env(), tok = await idToken();
  let r = await call(e, 'GET', '/strava/status', { token: tok, origin: 'https://evil.example' }); ok(r.status === 403, 'wrong origin: 403');
  r = await call(e, 'GET', '/strava/status', { token: tok, origin: null }); ok(r.status === 403, 'no Origin header: 403');
  r = await call(e, 'OPTIONS', '/strava/status', {}); ok(r.status === 204 && r.h.get('Access-Control-Allow-Origin') === ORIGIN && /Authorization/.test(r.h.get('Access-Control-Allow-Headers')), 'preflight from the app: 204 with CORS for fuel.bluebirdmultisport.com only');
  r = await call(e, 'OPTIONS', '/strava/status', { origin: 'http://localhost:8080' }); ok(r.status === 403, 'preflight from anywhere else: 403');
  r = await call(e, 'GET', '/strava/status', {}); ok(r.status === 401 && r.j.error === 'auth', 'missing ID token: 401');
  r = await call(e, 'GET', '/strava/status', { token: await idToken({ exp: Math.floor(Date.now() / 1000) - 5 }) }); ok(r.status === 401, 'expired ID token: 401');
  r = await call(e, 'GET', '/strava/status', { token: await idToken({ aud: 'someone-else' }) }); ok(r.status === 401, 'wrong audience: 401');
  r = await call(e, 'GET', '/strava/status', { token: await idToken({ iss: 'https://securetoken.google.com/someone-else' }) }); ok(r.status === 401, 'wrong issuer: 401');
  r = await call(e, 'GET', '/strava/status', { token: await idToken({ iat: Math.floor(Date.now() / 1000) + 3600 }) }); ok(r.status === 401, 'issued in the future: 401');
  r = await call(e, 'GET', '/strava/status', { token: await idToken({ sub: '' }) }); ok(r.status === 401, 'no subject (uid): 401');
  r = await call(e, 'GET', '/strava/status', { token: await idToken({}, { key: other.privateKey }) }); ok(r.status === 401, 'signed by another key: 401');
  r = await call(e, 'GET', '/strava/status', { token: await idToken({}, { kid: 'nope' }) }); ok(r.status === 401, 'unknown key id: 401');
  r = await call(e, 'GET', '/strava/status', { token: 'abc.def.ghi' }); ok(r.status === 401, 'garbage token: 401');
  r = await call(e, 'GET', '/strava/status', { token: tok }); ok(r.status === 200 && r.j.connected === false && r.h.get('Access-Control-Allow-Origin') === ORIGIN, 'valid token, not connected: { connected:false }');
  const kc = S.calls.filter(c => c.url.startsWith('https://www.googleapis.com/')).length; await call(e, 'GET', '/strava/status', { token: tok });
  ok(S.calls.filter(c => c.url.startsWith('https://www.googleapis.com/')).length === kc, "Google's keys are cached (Cache-Control max-age)");
}

// ---------- start + exchange ----------
await reset(); { const e = env(), tok = await idToken();
  let r = await call(e, 'POST', '/strava/start', { token: tok }); const u = new URL(r.j.url), st = u.searchParams.get('state');
  ok(r.status === 200 && u.origin + u.pathname === 'https://www.strava.com/oauth/authorize' && u.searchParams.get('client_id') === '282871' && u.searchParams.get('redirect_uri') === 'https://fuel.bluebirdmultisport.com/strava/callback/'
    && u.searchParams.get('response_type') === 'code' && u.searchParams.get('approval_prompt') === 'auto' && u.searchParams.get('scope') === 'read,activity:read_all' && /^[0-9a-f]{64}$/.test(st), 'start: the authorize link with a fresh 256-bit state', r.j.url);
  ok((await e.STRAVA_TOKENS.get('state:' + st)) === 'uid-mark' && e.STRAVA_TOKENS.m.get('state:' + st).ttl === 600, 'state stored for this uid for 10 minutes');
  r = await call(e, 'POST', '/strava/start', {}); ok(r.status === 401, 'start needs an ID token');
  // declined activity access: no token call, state used up
  r = await call(e, 'POST', '/strava/exchange', { body: { code: 'c1', scope: 'read', state: st } });
  ok(r.status === 400 && r.j.error === 'scope' && !S.calls.some(c => c.url.endsWith('/oauth/token')) && !(await e.STRAVA_TOKENS.get('state:' + st)), 'exchange without activity:read_all: { error:"scope" }, Strava not called, state spent');
  // a good exchange
  const st2 = new URL((await call(e, 'POST', '/strava/start', { token: tok })).j.url).searchParams.get('state');
  S.tokenReplies.push({ status: 200, body: { token_type: 'Bearer', access_token: 'AT1', refresh_token: 'RT1', expires_at: Math.floor(Date.now() / 1000) + 21600, athlete: { id: 7, firstname: 'Mark', lastname: 'McCabe' } } });
  r = await call(e, 'POST', '/strava/exchange', { body: { code: 'c2', scope: 'read,activity:read_all', state: st2 } });
  const tc = S.calls.find(c => c.url.endsWith('/oauth/token')), sent = new URLSearchParams(tc.body);
  ok(r.status === 200 && JSON.stringify(r.j) === JSON.stringify({ connected: true, athleteName: 'Mark McCabe' }), 'exchange returns only { connected, athleteName }', r.j);
  ok(sent.get('client_id') === '282871' && sent.get('client_secret') === 'shh-secret' && sent.get('code') === 'c2' && sent.get('grant_type') === 'authorization_code', 'exchange posts client id, secret, code, authorization_code to Strava');
  const rec = await e.STRAVA_TOKENS.get('uid-mark', { type: 'json' });
  ok(rec && rec.accessToken === 'AT1' && rec.refreshToken === 'RT1' && rec.athleteId === 7 && rec.athleteName === 'Mark McCabe' && rec.scope === 'read,activity:read_all' && rec.connectedAt, 'tokens stored in KV under the uid', rec);
  ok(!JSON.stringify(r.j).includes('AT1') && !JSON.stringify(r.j).includes('RT1'), 'no token in the response');
  r = await call(e, 'POST', '/strava/exchange', { body: { code: 'c3', scope: 'read,activity:read_all', state: st2 } }); ok(r.status === 400 && r.j.error === 'state', 'a state works once');
  r = await call(e, 'POST', '/strava/exchange', { body: { code: 'c3', scope: 'read,activity:read_all', state: 'f'.repeat(64) } }); ok(r.status === 400 && r.j.error === 'state', 'an unknown state is refused');
  r = await call(e, 'POST', '/strava/exchange', { origin: 'https://evil.example', body: { code: 'c3', scope: 'x', state: st2 } }); ok(r.status === 403, 'exchange from another origin: 403');
  r = await call(e, 'GET', '/strava/status', { token: tok }); ok(r.j.connected === true && r.j.athleteName === 'Mark McCabe' && r.j.scope === 'read,activity:read_all' && r.j.connectedAt && !('accessToken' in r.j), 'status: connected, name, scope, date; no tokens', r.j);
  // the 10-athlete cap
  const st3 = new URL((await call(e, 'POST', '/strava/start', { token: await idToken({ sub: 'uid-11th' }) })).j.url).searchParams.get('state');
  S.tokenReplies.push({ status: 403, body: { message: 'Limit of connected athletes exceeded' } });
  r = await call(e, 'POST', '/strava/exchange', { body: { code: 'c4', scope: 'read,activity:read_all', state: st3 } }); ok(r.status === 403 && r.j.error === 'full', 'athlete cap reached: { error:"full" }');
}

// ---------- activities: compact shape, refresh, rate limits ----------
await reset(); { const e = env(), tok = await idToken(), t = Math.floor(Date.now() / 1000);
  await e.STRAVA_TOKENS.put('uid-mark', JSON.stringify({ athleteId: 7, athleteName: 'Mark McCabe', accessToken: 'AT1', refreshToken: 'RT1', expiresAt: t + 3600, scope: 'read,activity:read_all', connectedAt: 'x' }));
  S.activities = [0, 1, 2].map(stravaActivity);
  let r = await call(e, 'GET', '/strava/activities?after=1700000000&before=1800000000&page=2', { token: tok });
  const a0 = r.j.activities[0], sc = S.calls.find(c => c.url.includes('/athlete/activities')), q = new URL(sc.url).searchParams;
  ok(r.status === 200 && r.j.activities.length === 3 && q.get('per_page') === '200' && q.get('after') === '1700000000' && q.get('before') === '1800000000' && q.get('page') === '2' && sc.auth === 'Bearer AT1', 'activities: per_page 200, after / before / page passed on, the stored access token used');
  ok(JSON.stringify(Object.keys(a0).sort()) === JSON.stringify(['average_heartrate','average_watts','device_watts','distance','elapsed_time','id','kilojoules','manual','max_heartrate','moving_time','name','sport_type','start_date','start_date_local','timezone','total_elevation_gain','trainer','weighted_average_watts'].sort()) && !JSON.stringify(r.j).includes('secret-route'), 'compact shape only (no map, route, location, kudos)', Object.keys(a0));
  ok(JSON.stringify(r.j.usage) === JSON.stringify({ usage15: 10, usage1d: 100, limit15: 200, limit1d: 2000 }), 'rate-limit usage passed through (read limits)', r.j.usage);
  r = await call(e, 'GET', '/strava/activities?after=abc&page=-1', { token: tok }); const q2 = new URL(S.calls.filter(c => c.url.includes('/athlete/activities')).pop().url).searchParams;
  ok(!q2.has('after') && !q2.has('page'), 'bad numbers are dropped, not passed to Strava');
  // refresh: under 10 minutes left
  await e.STRAVA_TOKENS.put('uid-mark', JSON.stringify(Object.assign(await e.STRAVA_TOKENS.get('uid-mark', { type: 'json' }), { expiresAt: t + 300 })));
  S.tokenReplies.push({ status: 200, body: { access_token: 'AT2', refresh_token: 'RT2', expires_at: t + 21600 } });
  r = await call(e, 'GET', '/strava/activities', { token: tok });
  const rf = S.calls.filter(c => c.url.endsWith('/oauth/token')).pop(), rp = new URLSearchParams(rf.body), rec = await e.STRAVA_TOKENS.get('uid-mark', { type: 'json' });
  ok(rp.get('grant_type') === 'refresh_token' && rp.get('refresh_token') === 'RT1' && rp.get('client_secret') === 'shh-secret', 'refresh with the stored refresh token when under 10 minutes remain');
  ok(rec.accessToken === 'AT2' && rec.refreshToken === 'RT2' && rec.expiresAt === t + 21600 && S.calls.filter(c => c.url.includes('/athlete/activities')).pop().auth === 'Bearer AT2', 'the new tokens are saved (refresh token rotated) and used');
  // a revoked refresh: reconnect
  await e.STRAVA_TOKENS.put('uid-mark', JSON.stringify(Object.assign(rec, { expiresAt: t + 10 }))); S.tokenReplies.push({ status: 400, body: { message: 'Bad Request' } });
  r = await call(e, 'GET', '/strava/activities', { token: tok }); ok(r.status === 409 && r.j.error === 'reconnect' && !(await e.STRAVA_TOKENS.get('uid-mark')), 'refresh refused (revoked on Strava): { error:"reconnect" }, record removed');
}
await reset(); { const e = env(), tok = await idToken(), t = Math.floor(Date.now() / 1000);
  await e.STRAVA_TOKENS.put('uid-mark', JSON.stringify({ athleteName: 'M', accessToken: 'AT1', refreshToken: 'RT1', expiresAt: t + 3600, scope: 'read,activity:read_all', connectedAt: 'x' }));
  S.status = 429; S.rate = { limit: '200,2000', usage: '201,500' };
  let r = await call(e, 'GET', '/strava/activities', { token: tok });
  ok(r.status === 429 && r.j.retryAfter > 0 && r.j.retryAfter <= 900 && r.h.get('Retry-After') === String(r.j.retryAfter), 'Strava 429: { retryAfter } until the next 15-minute window', r.j);
  const n = S.calls.filter(c => c.url.includes('/athlete/activities')).length; r = await call(e, 'GET', '/strava/activities', { token: tok });
  ok(r.status === 429 && S.calls.filter(c => c.url.includes('/athlete/activities')).length === n, 'after a 429: answers { retryAfter } without calling Strava again');
}
await reset(); { const e = env(), tok = await idToken(), t = Math.floor(Date.now() / 1000);
  await e.STRAVA_TOKENS.put('uid-mark', JSON.stringify({ athleteName: 'M', accessToken: 'AT1', refreshToken: 'RT1', expiresAt: t + 3600, scope: 'read,activity:read_all', connectedAt: 'x' }));
  S.activities = [stravaActivity(1)]; S.rate = { limit: '200,2000', usage: '181,300' }; // 90.5% of the 15-minute limit
  let r = await call(e, 'GET', '/strava/activities', { token: tok }); ok(r.status === 200, 'the call that reaches 90% still returns its page');
  ok(e.STRAVA_TOKENS.m.has('usage'), 'near a limit, usage is kept in KV so every Worker instance sees it');
  r = await call(e, 'GET', '/strava/activities', { token: tok }); ok(r.status === 429 && r.j.retryAfter > 0 && r.j.retryAfter <= 900 && S.calls.filter(c => c.url.includes('/athlete/activities')).length === 1, 'within 10% of the 15-minute limit: { retryAfter } without calling Strava');
  await fresh(); e.STRAVA_TOKENS.m.delete('usage'); S.rate = { limit: '200,2000', usage: '5,1850' }; // 92.5% of the day
  await call(e, 'GET', '/strava/activities', { token: tok }); r = await call(e, 'GET', '/strava/activities', { token: tok });
  ok(r.status === 429 && r.j.retryAfter > 0 && r.j.retryAfter <= 86400, 'within 10% of the daily limit: { retryAfter } until midnight UTC', r.j);
  await fresh(); await e.STRAVA_TOKENS.put('usage', JSON.stringify({ usage15: 199, usage1d: 10, limit15: 200, limit1d: 2000, at: t - 3600 })); S.rate = { limit: '200,2000', usage: '1,20' };
  r = await call(e, 'GET', '/strava/activities', { token: tok }); ok(r.status === 200, 'usage from an earlier 15-minute window does not block');
}

// ---------- disconnect ----------
await reset(); { const e = env(), tok = await idToken(), t = Math.floor(Date.now() / 1000);
  await e.STRAVA_TOKENS.put('uid-mark', JSON.stringify({ athleteName: 'M', accessToken: 'AT9', refreshToken: 'RT9', expiresAt: t + 3600, scope: 'read,activity:read_all', connectedAt: 'x' }));
  await e.STRAVA_TOKENS.put('uid-other', JSON.stringify({ athleteName: 'O', accessToken: 'ATO', refreshToken: 'RTO', expiresAt: t + 3600 }));
  let r = await call(e, 'POST', '/strava/disconnect', { token: tok }); const d = S.calls.find(c => c.url.endsWith('/oauth/deauthorize'));
  ok(r.status === 200 && r.j.connected === false && d && new URLSearchParams(d.body).get('access_token') === 'AT9', 'disconnect: deauthorizes on Strava with the user\'s token');
  ok(!(await e.STRAVA_TOKENS.get('uid-mark')) && !!(await e.STRAVA_TOKENS.get('uid-other')), 'disconnect deletes this user\'s KV entry only');
  r = await call(e, 'POST', '/strava/disconnect', { token: tok }); ok(r.status === 200 && r.j.connected === false && S.deauth === 1, 'disconnect again: still { connected:false }, nothing to deauthorize');
  r = await call(e, 'GET', '/strava/activities', { token: tok }); ok(r.status === 409 && r.j.connected === false, 'activities after disconnect: not connected');
  r = await call(e, 'POST', '/strava/disconnect', {}); ok(r.status === 401, 'disconnect needs an ID token');
  r = await call(e, 'GET', '/nope', { token: tok }); ok(r.status === 404, 'unknown path: 404');
}
console.log(bad ? `FAIL ${bad}` : 'OK: fred-api worker'); process.exit(bad ? 1 : 0);
