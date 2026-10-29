// A Firebase stand-in for kit tests (q91): the app's own code runs unchanged; the four SDK modules it imports from
// www.gstatic.com/firebasejs/<v>/firebase-{app,auth,firestore,storage}.js are served from here through the opener's `route`, and they talk
// to one Backend object in this Node process with real fetches (so every byte the app sends is a recorded request):
//   Firestore  POST https://firestore.googleapis.com/mock/{get,list,commit}   (JSON as text/plain)
//   Storage    POST https://firebasestorage.googleapis.com/v0/b/<bucket>/o?name=<path>&at=..&ct=..&uid=..   (the bytes: an upload)
//              GET  .../o/<path>?meta=1&uid=.. | ?alt=media&uid=..   POST .../o/<path>?del=1&uid=..
// The Storage side keeps the rules of the repo's storage.rules (RULES below; q91.test.mjs checks the file says the same): only
// users/{uid}/journal-header.jpg of the signed-in uid, image/jpeg, under 600 KB, and an update only with a newer `at`. Modes: storage
// 'ok' | 'off' (every call refused: the rules not published) | 'nobucket' (README step 10 not done: as in a browser, every SDK request fails
// at the network, its CORS preflight refused, and a plain GET of the bucket's address answers 404) | 'down' (requests fail: offline).
//   probe   GET  https://firebasestorage.googleapis.com/v0/b/<bucket>/o   (no query: the app asking whether the bucket exists; 404 only in
//                'nobucket', 403 otherwise, as the real service answers one without a token)
// offline: page labels whose every request fails. holdUploads: an upload is held (in flight) until release(). getDownloadURL (never
// to be used) leaves a request with getDownloadURL in its address, so the log shows the call.
// Auth: localStorage '__mock_user' = {uid, email, displayName} (JSON) is who signs in; the session lives in localStorage '__mock_auth' (JSON uid).
export const SDK = '10.14.1';

const APP = `export function initializeApp(o){ return {options:o, name:'[DEFAULT]'}; }`;
const AUTH = `
const A={currentUser:null, cbs:[]};
const J=k=>{ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } };
const mk=u=>u ? Object.assign({}, u, {getIdToken:async()=>'tok-'+u.uid, providerData:[]}) : null;
function sess(){ const id=J('__mock_auth'), u=J('__mock_user'); return id && u && u.uid===id ? mk(u) : null; }
function fire(){ A.cbs.forEach(cb=>{ try{ cb(A.currentUser); }catch(e){ console.error(e); } }); }
export function getAuth(){ A.currentUser=sess(); return A; }
export class GoogleAuthProvider{ setCustomParameters(){} }
export function onAuthStateChanged(a, cb){ A.cbs.push(cb); setTimeout(()=>cb(A.currentUser), 0); return ()=>{}; }
export async function signInWithPopup(){ const u=mk(J('__mock_user')); localStorage.setItem('__mock_auth', JSON.stringify(u.uid)); A.currentUser=u; setTimeout(fire, 0); return {user:u}; }
export async function signInWithRedirect(){ throw Object.assign(new Error('no redirect in the mock'), {code:'auth/operation-not-supported'}); }
export async function getRedirectResult(){ return null; }
export async function signOut(){ localStorage.removeItem('__mock_auth'); A.currentUser=null; setTimeout(fire, 0); }
export async function deleteUser(u){ await fetch('https://identitytoolkit.googleapis.com/mock/delete?uid='+encodeURIComponent(u.uid), {method:'POST', body:'{}'}); localStorage.removeItem('__mock_auth'); A.currentUser=null; }
export async function reauthenticateWithPopup(){ return {}; }
export async function reauthenticateWithRedirect(){ return {}; }
`;
const FS = `
const H='https://firestore.googleapis.com/mock/';
async function call(k, body){ let r; try{ r=await fetch(H+k, {method:'POST', body:JSON.stringify(body)}); }catch(e){ throw Object.assign(new Error('offline'), {code:'unavailable'}); } if(!r.ok) throw Object.assign(new Error('denied'), {code:'permission-denied'}); return r.json(); }
export function initializeFirestore(){ return {db:1}; }
export function persistentLocalCache(){ return {}; } export function persistentMultipleTabManager(){ return {}; }
const P=a=>a.flat().map(String).join('/');
export function doc(db, ...p){ const path=P(p); return {type:'doc', path, id:path.split('/').pop()}; }
export function collection(db, ...p){ return {type:'col', path:P(p)}; }
export function where(field, op, val){ return {field, op, val}; }
export function query(c, ...w){ return {type:'query', path:c.path, where:w}; }
const snap=(path, d)=>({id:path.split('/').pop(), ref:{type:'doc', path, id:path.split('/').pop()}, exists:()=>d!=null, data:()=>d==null ? undefined : JSON.parse(JSON.stringify(d))});
export async function getDocFromServer(r){ const j=await call('get', {path:r.path}); return snap(r.path, j.data); }
export async function getDocsFromServer(q){ const j=await call('list', {path:q.path, where:q.where||[]}); return {docs:j.docs.map(x=>snap(q.path+'/'+x.id, x.data)), size:j.docs.length, empty:!j.docs.length}; }
export const getDocs=getDocsFromServer, getDoc=getDocFromServer;
export function writeBatch(){ const ops=[]; return {set(r, data, o){ ops.push({t:'set', path:r.path, data:JSON.parse(JSON.stringify(data)), merge:o && o.mergeFields || (o && o.merge ? true : null)}); }, delete(r){ ops.push({t:'del', path:r.path}); }, async commit(){ await call('commit', {ops}); }}; }
export async function setDoc(r, data, o){ const b=writeBatch(); b.set(r, data, o); await b.commit(); }
export async function deleteDoc(r){ const b=writeBatch(); b.delete(r); await b.commit(); }
`;
const ST = `
const uid=()=>{ try{ return JSON.parse(localStorage.getItem('__mock_auth'))||''; }catch(e){ return ''; } };
const err=(c)=>Object.assign(new Error(c), {code:'storage/'+c});
async function go(url, init){ let r; try{ r=await fetch(url, init); }catch(e){ throw err('retry-limit-exceeded'); } if(r.status===404) throw err('object-not-found'); if(r.status===403) throw err('unauthorized'); if(!r.ok) throw err('unknown'); return r; }
export function getStorage(app){ return {bucket:app.options.storageBucket}; }
export function ref(st, path){ return {bucket:st.bucket, fullPath:path, name:path.split('/').pop()}; }
const base=r=>'https://firebasestorage.googleapis.com/v0/b/'+r.bucket+'/o';
export async function uploadBytes(r, data, m){ const at=m && m.customMetadata && m.customMetadata.at || ''; const res=await go(base(r)+'?name='+encodeURIComponent(r.fullPath)+'&at='+encodeURIComponent(at)+'&ct='+encodeURIComponent(m && m.contentType || '')+'&uid='+uid(), {method:'POST', body:data}); return {metadata:await res.json(), ref:r}; }
export async function getMetadata(r){ return (await go(base(r)+'/'+encodeURIComponent(r.fullPath)+'?meta=1&uid='+uid())).json(); }
export async function getBlob(r){ return (await go(base(r)+'/'+encodeURIComponent(r.fullPath)+'?alt=media&uid='+uid())).blob(); }
export async function deleteObject(r){ await go(base(r)+'/'+encodeURIComponent(r.fullPath)+'?del=1&uid='+uid(), {method:'POST', body:''}); }
export async function getDownloadURL(r){ try{ await fetch(base(r)+'/'+encodeURIComponent(r.fullPath)+'?getDownloadURL=1&uid='+uid()); }catch(e){} throw new Error('the app must never ask for a download URL'); }
`;
const MODS = { app: APP, auth: AUTH, firestore: FS, storage: ST };
export const RULES = { path: 'users/{uid}/journal-header.jpg', ct: 'image/jpeg', maxKB: 600, at: '[0-9]{1,15}' }; // what storageCall enforces (and storage.rules must say)
const CORS = { 'access-control-allow-origin': '*' };

export class Backend {
  constructor() { this.fs = new Map(); this.st = new Map(); this.log = []; this.storage = 'ok'; this.holdUploads = false; this.held = []; this.deletedUsers = []; this.modReq = []; this.offline = new Set(); }
  release() { const h = this.held; this.held = []; h.forEach(f => f()); }
  // the opener's route: (route, url) -> a promise when handled here, else null (the opener aborts other network)
  handler(label = '') {
    return (r, u) => {
      const q = r.request(), rec = { page: label, url: u, method: q.method(), body: q.postDataBuffer() || Buffer.alloc(0), t: Date.now() };
      this.log.push(rec);
      const m = u.match(/^https:\/\/www\.gstatic\.com\/firebasejs\/([\d.]+)\/firebase-(app|auth|firestore|storage)\.js(?:\?r=\d+)?$/); // (?r=n: the app asks again at a new address after a failed load)
      if (this.offline.has(label) && !u.startsWith('file:')) { rec.offline = true; return r.abort('internetdisconnected'); } // that page is offline (the route sees requests before the context's own offline switch)
      if (m) { this.modReq.push(m[2]); return r.fulfill({ status: 200, headers: Object.assign({ 'content-type': 'text/javascript' }, CORS), body: MODS[m[2]] }); }
      if (u.startsWith('https://firestore.googleapis.com/mock/')) return this.firestore(r, u.split('/mock/')[1], rec);
      if (u.startsWith('https://identitytoolkit.googleapis.com/mock/delete')) { this.deletedUsers.push(new URL(u).searchParams.get('uid')); return r.fulfill({ status: 200, headers: CORS, body: '{}' }); }
      if (u.startsWith('https://firebasestorage.googleapis.com/')) return this.storageCall(r, u, rec);
      return null;
    };
  }
  json(r, o, status = 200) { return r.fulfill({ status, headers: Object.assign({ 'content-type': 'application/json' }, CORS), body: JSON.stringify(o) }); }
  firestore(r, k, rec) {
    let b = {}; try { b = JSON.parse(rec.body.toString('utf8') || '{}'); } catch (e) {}
    if (k === 'get') return this.json(r, { data: this.fs.has(b.path) ? this.fs.get(b.path) : null });
    if (k === 'list') {
      const pre = b.path + '/', docs = [];
      for (const [p, d] of this.fs) if (p.startsWith(pre) && !p.slice(pre.length).includes('/')) {
        if ((b.where || []).every(w => w.op !== '>' || +d[w.field] > +w.val)) docs.push({ id: p.slice(pre.length), data: d });
      }
      return this.json(r, { docs });
    }
    if (k === 'commit') {
      rec.ops = (b.ops || []).map(o => o.t + ' ' + o.path);
      for (const o of b.ops || []) {
        if (o.t === 'del') { this.fs.delete(o.path); continue; }
        if (Array.isArray(o.merge)) { const cur = Object.assign({}, this.fs.get(o.path) || {}); o.merge.forEach(f => { if (f in o.data) cur[f] = o.data[f]; }); this.fs.set(o.path, cur); }
        else if (o.merge === true) this.fs.set(o.path, Object.assign({}, this.fs.get(o.path) || {}, o.data));
        else this.fs.set(o.path, o.data);
      }
      return this.json(r, { ok: true });
    }
    return this.json(r, { error: 'unknown' }, 400);
  }
  async storageCall(r, u, rec) {
    const url = new URL(u), sp = url.searchParams, uid = sp.get('uid') || '';
    const mo = url.pathname.match(/^\/v0\/b\/([^/]+)\/o(?:\/(.+))?$/);
    if (mo && !mo[2] && !url.search && rec.method === 'GET') { rec.storage = { op: 'probe' }; if (this.storage === 'down') return r.abort('internetdisconnected'); const no = this.storage === 'nobucket'; return this.json(r, { error: { code: no ? 404 : 403, message: no ? 'Not Found.' : 'Permission denied.' } }, no ? 404 : 403); }
    if (this.storage === 'down') return r.abort('internetdisconnected');
    if (this.storage === 'nobucket') return r.abort('failed'); // (a refused CORS preflight: the request fails with no answer)
    if (this.storage === 'off') return this.json(r, { error: 'unauthorized' }, 403);
    if (!mo) return this.json(r, {}, 400);
    const path = mo[2] ? decodeURIComponent(mo[2]) : sp.get('name'), own = path === RULES.path.replace('{uid}', uid) && uid;
    rec.storage = { path, op: sp.has('name') ? 'upload' : sp.has('del') ? 'delete' : sp.has('alt') ? 'get' : 'meta' };
    if (!own) return this.json(r, { error: 'unauthorized' }, 403);
    const cur = this.st.get(path);
    if (rec.storage.op === 'upload') {
      const at = sp.get('at') || '', ct = sp.get('ct') || '', body = rec.body;
      if (ct !== RULES.ct || body.length >= RULES.maxKB * 1024 || !new RegExp('^' + RULES.at + '$').test(at) || (cur && !(+at > +cur.at))) { rec.storage.denied = true; return this.json(r, { error: 'unauthorized' }, 403); }
      if (this.holdUploads) await new Promise(res => this.held.push(res));
      this.st.set(path, { bytes: Buffer.from(body), at, ct, t: Date.now() }); rec.storage.landed = Date.now();
      return this.json(r, { fullPath: path, customMetadata: { at } });
    }
    if (!cur) return this.json(r, { error: 'not found' }, 404);
    if (rec.storage.op === 'meta') return this.json(r, { fullPath: path, size: cur.bytes.length, contentType: cur.ct, customMetadata: { at: cur.at } });
    if (rec.storage.op === 'get') return r.fulfill({ status: 200, headers: Object.assign({ 'content-type': 'image/jpeg' }, CORS), body: cur.bytes });
    if (rec.storage.op === 'delete') { this.st.delete(path); rec.storage.done = Date.now(); return this.json(r, {}); }
    return this.json(r, {}, 400);
  }
}

// a test page with sync on: the built null page with a Firebase config put back (a made-up project; nothing leaves the test)
export function syncPageSource(nullHtml, { bucket = 'fred-test.appspot.com' } = {}) {
  const cfg = `const FIREBASE_CONFIG = {apiKey:"test-key", authDomain:"fuel.bluebirdmultisport.com", projectId:"fred-test"${bucket ? `, storageBucket:"${bucket}"` : ''}, messagingSenderId:"1", appId:"1:1:web:test"};`;
  if (!nullHtml.includes('const FIREBASE_CONFIG = null;')) throw new Error('not a null page');
  return nullHtml.replace('const FIREBASE_CONFIG = null;', cfg);
}
