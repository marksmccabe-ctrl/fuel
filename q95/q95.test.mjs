// node q95.test.mjs <null.html> [main null.html]   (cd into this folder first) -- item 95: two small bugs (sign-in with sync off, the 1 L bottle label id).
// Every numbered point and QA line of QUEUE.md item 95:
//   cache    sw.js CACHE and APP_BUILD match, v119 or later
//   signin   point 1: with Firebase off (the null page) Settings › Account shows no "Continue with Google" (#gSignIn, #syncCard), on the
//            Account sheet (where main shows it), on its Account & data page (its Account & data row) and back on the Account top (its back button); the rest of the Account
//            screen is the same as main's (its visible rows); with Firebase on (the checkout's own index.html, network blocked) the card
//            and the button are there, on the Account top, on Account & data and back on the top; Account & data's other rows are main's too
//   ids      point 2: no id is in the page twice with the Bikes sheet or the Bottles sheet open (Test athlete A: two bikes); the editor's
//            label keeps its id bkbig-<bike id>; each "Cages that fit a 1 L bottle" chip group's aria-labelledby names a label inside its
//            own copy (the editor's in #bikeList, the Bottles sheet's in #bottlesBig) whose text is that label; the accessible name of each
//            group is "Cages that fit a 1 L bottle"
//   chips    point 2: a pick in the Bottles sheet saves bigCages (the same shape: an integer below the cage count, or no key for All, in either place) and
//            shows in the bike editor; a pick in the editor shows in the Bottles sheet; a reload keeps it
//   main     with [main null.html]: the same checks fail there (the sign-in shows, the ids repeat), so they are not vacuous; once item 95 is
//            on main (its page has the Bottles sheet's bbbig- label id) those two checks are skipped and logged, the rest-of-screen comparisons still run
// Q95_ONLY=<sections, comma-separated> runs a part. Under a minute.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { open, checker, reload as kitReload } from '../lib/open.mjs';
import { setSheet } from '../lib/screens.mjs';

const PAGE = path.resolve(process.argv[2] || '../../fred95/null.html'), MAIN = process.argv[3] ? path.resolve(process.argv[3]) : null;
const ONLY = (process.env.Q95_ONLY || '').split(',').filter(Boolean);
const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = process.env.Q95_REPO || path.resolve(HERE, '../../wt-q95'), NOW = '2026-10-29T07:30:00';
const C = checker('q95 '), ok = C.ok, ERRS = [];
const SRC = fs.readFileSync(PAGE, 'utf8');
/* main after item 95 merged: its page draws the Bottles sheet label as bbbig-, so main no longer has the bugs and the not-vacuous checks are skipped */
const MAIN95 = !!MAIN && /bbbig/.test(fs.readFileSync(MAIN, 'utf8'));
const browser = await chromium.launch();
const LABEL = 'Cages that fit a 1 L bottle';

async function page(o = {}) { const x = await open(o.file || PAGE, Object.assign({ athlete: 'A', browser, now: NOW, repo: REPO }, o)); x.errors.label = o.label || 'page'; if (!o.noErrs) ERRS.push(x.errors); return x; }
// what the Account screen shows: the sign-in (visible = laid out and not inside anything hidden), and the text of its visible rows
const acct = p => p.evaluate(() => { const vis = e => !!e && e.getClientRects().length > 0 && !e.closest('[hidden]');
  return { card: vis(document.getElementById('syncCard')), signIn: vis(document.getElementById('gSignIn')),
    rows: [...document.querySelectorAll('#setSheet .prow, #setSheet .acc-row, #setSheet button')].filter(vis).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean) }; });
const dupIds = p => p.evaluate(() => { const n = {}; document.querySelectorAll('[id]').forEach(e => { n[e.id] = (n[e.id] || 0) + 1; }); return Object.keys(n).filter(k => n[k] > 1); });
// every chip group of the 1 L bottle label: where it is, what its aria-labelledby names, and whether that label is in the same copy
const groups = p => p.evaluate(LABEL => [...document.querySelectorAll('.bike-big [role=group]')].map(g => { const id = g.getAttribute('aria-labelledby'), l = id && document.getElementById(id);
  const home = g.closest('#bottlesBig') ? 'bottles' : g.closest('#bikeList') ? 'editor' : 'other';
  return { home, id, bike: (g.querySelector('[data-bike-big]') || {}).dataset?.bikeBig, own: !!l && l.closest('.bike-big') === g.closest('.bike-big'), text: l ? l.textContent : null, labelOk: !!l && l.textContent === LABEL }; }), LABEL);
const pick = (p, where, bike, v) => p.click(`${where === 'bottles' ? '#bottlesBig' : '#bikeList'} [data-bike-big="${bike}"][data-v="${v}"]`);
const onIn = (p, where, bike) => p.evaluate(([w, b]) => [...document.querySelectorAll(`${w} [data-bike-big="${b}"]`)].filter(x => x.getAttribute('aria-pressed') === 'true' || x.classList.contains('on')).map(x => x.dataset.v), [where === 'bottles' ? '#bottlesBig' : '#bikeList', bike]);
const saved = (p, bike) => p.evaluate(b => { const s = JSON.parse(localStorage.getItem('bluebird.settings.v2') || '{}'), x = (s.bikes || []).find(k => k.id === b); return x ? { has: 'bigCages' in x, v: x.bigCages, cages: x.cages } : null; }, bike);

const sections = [];
const section = (n, f) => sections.push([n, f]);

section('cache', async () => {
  const sw = fs.readFileSync(path.join(path.dirname(PAGE), 'sw.js'), 'utf8');
  const b = (SRC.match(/const APP_BUILD='([^']+)'/) || [])[1], c = (sw.match(/const CACHE = '([^']+)'/) || [])[1];
  ok(!!b && b === c && +(b.match(/v(\d+)$/) || [])[1] >= 119, 'cache: APP_BUILD = sw.js CACHE, v119 or later', { b, c });
});

section('signin', async () => {
  ok(/const FIREBASE_CONFIG = null;/.test(SRC), 'signin: the test page has Firebase off');
  const o = await page({ label: 'signin' }), p = o.p;
  await setSheet(p, 'account');
  const top = await acct(p);
  ok(!top.card && !top.signIn, 'signin: Firebase off: no Continue with Google on the Account sheet', top);
  await p.click('#setSheet [data-accgo="data"]'); await p.waitForTimeout(250);
  ok(await p.evaluate(() => document.getElementById('accPage').dataset.accv === 'data'), 'signin: the Account & data page is open');
  const data = await acct(p);
  ok(!data.card && !data.signIn, 'signin: Firebase off: none on Account & data either', data);
  await p.click('#accPage .acc-sub[data-accsub="data"] .acc-back'); await p.waitForTimeout(250);
  const back = await acct(p);
  ok(!back.card && !back.signIn, 'signin: Firebase off: none back on the Account top', back);
  await o.close();
  if (MAIN) { const m = await page({ file: MAIN, label: 'main-signin', noErrs: true }); await setSheet(m.p, 'account'); const mt = await acct(m.p);
    await m.p.click('#setSheet [data-accgo="data"]'); await m.p.waitForTimeout(250); const md = await acct(m.p); await m.close();
    const rest = r => r.filter(x => !/Continue with Google|Privacy note/.test(x));
    ok(JSON.stringify(rest(mt.rows)) === JSON.stringify(top.rows), 'signin: the rest of the Account screen is main\'s', { main: mt.rows, here: top.rows });
    ok(JSON.stringify(rest(md.rows)) === JSON.stringify(data.rows), 'signin: the rest of the Account & data page is main\'s', { main: md.rows, here: data.rows });
    if (MAIN95) console.log('q95: main has item 95 (sign-in hidden there), not-vacuous check skipped');
    else ok(mt.signIn, 'main: the sign-in shows there with Firebase off (the check is not vacuous)', mt); }
  // Firebase on: the checkout's own page (network blocked by the opener, so Firebase never loads; the card is drawn before it)
  const live = path.join(REPO, 'index.html');
  if (fs.existsSync(live) && !/const FIREBASE_CONFIG = null;/.test(fs.readFileSync(live, 'utf8'))) {
    const f = await page({ file: live, label: 'firebase-on', noErrs: true }); await setSheet(f.p, 'account'); const on = await acct(f.p);
    ok(on.card && on.signIn, 'signin: Firebase on: the card and Continue with Google are there', on);
    /* watch the card while Account & data opens: main never hides it on the way (a later render shows it again, so the end state alone misses an accGo that hides it) */
    await f.p.evaluate(() => { const c = document.getElementById('syncCard'); window.__q95hid = []; new MutationObserver(() => { if (c.hidden) window.__q95hid.push(document.getElementById('accPage').dataset.accv); }).observe(c, { attributes: true, attributeFilter: ['hidden'] }); });
    await f.p.click('#setSheet [data-accgo="data"]'); await f.p.waitForTimeout(250);
    const onData = await acct(f.p), onV = await f.p.evaluate(() => document.getElementById('accPage').dataset.accv), hid = await f.p.evaluate(() => window.__q95hid);
    ok(onV === 'data' && onData.card && onData.signIn, 'signin: Firebase on: they are there on Account & data too (as on main)', { onV, onData });
    ok(hid.length === 0, 'signin: Firebase on: the card is never hidden while Account & data opens (as on main)', hid);
    await f.p.click('#accPage .acc-sub[data-accsub="data"] .acc-back'); await f.p.waitForTimeout(250);
    const onBack = await acct(f.p); await f.close();
    ok(onBack.card && onBack.signIn, 'signin: Firebase on: and back on the Account top', onBack);
  } else ok(false, 'signin: no Firebase-on page to check (Q95_REPO/index.html)', live);
});

section('ids', async () => {
  for (const key of ['bikes', 'bottles']) {
    const o = await page({ label: 'ids-' + key }), p = o.p;
    await setSheet(p, key);
    await p.evaluate(() => document.querySelectorAll('#bikeList details').forEach(d => { d.open = true; })); await p.waitForTimeout(150);
    const d = await dupIds(p), g = await groups(p);
    ok(d.length === 0, `ids: no id twice with the ${key} sheet open`, d);
    const ed = g.filter(x => x.home === 'editor'), bt = g.filter(x => x.home === 'bottles');
    ok(ed.length >= 2 && bt.length >= 2 && g.every(x => x.home !== 'other'), `ids: ${key}: the label is drawn in both places for both bikes`, g);
    ok(g.every(x => x.own && x.labelOk), `ids: ${key}: each group's aria-labelledby names its own copy's label`, g);
    ok(ed.every(x => x.id === 'bkbig-' + x.bike), `ids: ${key}: the editor's label keeps id bkbig-<bike id>`, ed.map(x => x.id));
    const names = await p.evaluate(() => [...document.querySelectorAll('.bike-big [role=group]')].filter(g => g.getClientRects().length && !g.closest('[hidden]')).map(g => g.getAttribute('aria-labelledby')));
    for (const id of names) { const snap = await p.locator(`[aria-labelledby="${id}"]`).first().ariaSnapshot().catch(e => 'ERR ' + e);
      ok(snap.includes(`group "${LABEL}"`), `ids: ${key}: the group ${id} is named "${LABEL}"`, snap.slice(0, 200)); }
    await o.close();
  }
  if (MAIN95) console.log('q95: main has item 95 (one id per label there), not-vacuous check skipped');
  else if (MAIN) { const m = await page({ file: MAIN, label: 'main-ids', noErrs: true }); await setSheet(m.p, 'bottles'); const d = await dupIds(m.p); await m.close();
    ok(d.some(x => /^bkbig-/.test(x)), 'main: the ids repeat there (the check is not vacuous)', d); }
});

section('chips', async () => {
  const o = await page({ label: 'chips' }), p = o.p;
  await setSheet(p, 'bottles');
  const g = await groups(p), bike = (g.find(x => x.home === 'bottles') || {}).bike;
  const s0 = await saved(p, bike);
  ok(!!bike && !!s0 && s0.cages >= 2, 'chips: a bike with 2+ cages in the Bottles sheet', { bike, s0 });
  await pick(p, 'bottles', bike, 0); await p.waitForTimeout(200);
  const s1 = await saved(p, bike), b1 = await onIn(p, 'bottles', bike), e1 = await onIn(p, 'editor', bike);
  ok(s1 && s1.v === 0, 'chips: Bottles pick 0 saves bigCages 0', s1);
  ok(JSON.stringify(b1) === '["0"]', 'chips: the Bottles sheet shows 0 picked', b1);
  ok(e1.length === 0 || JSON.stringify(e1) === '["0"]', 'chips: the editor (drawn) shows the same', e1);
  await kitReload(p); await setSheet(p, 'bikes');
  await p.evaluate(b => { const d = document.querySelector(`#bikeList [data-bike-big="${b}"]`)?.closest('details'); if (d) d.open = true; }, bike); await p.waitForTimeout(150);
  const e2 = await onIn(p, 'editor', bike), s2 = await saved(p, bike);
  ok(JSON.stringify(e2) === '["0"]' && s2.v === 0, 'chips: after a reload the editor shows 0 and bigCages is 0', { e2, s2 });
  await pick(p, 'editor', bike, 'all'); await p.waitForTimeout(200);
  const s3 = await saved(p, bike);
  ok(s3 && !s3.has, 'chips: editor All saves no bigCages key (main deletes it for All)', s3);
  await pick(p, 'editor', bike, 1); await p.waitForTimeout(200);
  await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(300);
  await setSheet(p, 'bottles'); const b4 = await onIn(p, 'bottles', bike), s4 = await saved(p, bike);
  ok(s4 && s4.v === 1 && JSON.stringify(b4) === '["1"]', 'chips: an editor pick of 1 shows in the Bottles sheet', { b4, s4 });
  await pick(p, 'bottles', bike, 'all'); await p.waitForTimeout(200);
  const s5 = await saved(p, bike), b5 = await onIn(p, 'bottles', bike), e5 = await onIn(p, 'editor', bike);
  ok(s5 && !s5.has, 'chips: Bottles All saves no bigCages key (main deletes it for All)', s5);
  ok(JSON.stringify(b5) === '["all"]' && (e5.length === 0 || JSON.stringify(e5) === '["all"]'), 'chips: both groups show All picked', { b5, e5 });
  await o.close();
});

for (const [n, f] of sections) { if (ONLY.length && !ONLY.includes(n)) continue; try { await f(); } catch (e) { ok(false, n + ': threw', String(e && e.stack || e).slice(0, 500)); } }
ok(ERRS.every(e => e.length === 0), 'no page or console errors', ERRS.filter(e => e.length).map(e => [e.label, ...e.slice(0, 3)]));
await browser.close();
C.done('q95 Two small bugs: sign-in with sync off, the 1 L bottle label id');
