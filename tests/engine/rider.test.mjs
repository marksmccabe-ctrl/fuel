// Item 99 (fred, Nov 5): Your rider. The app's own riderNorm / riderSetNorm (settings.rider checked value by value against the bundle's
// FW.RIDER_OPTIONS, on load, on restore and when synced settings arrive) and riderIds (the Closet card's strip passes riderOutfit only the
// ids outfit() lists that are strings and own keys of FW.OUTFIT_LOOK, always an array), run in the real page (index.html, Firebase off,
// no network, as harness.mjs opens it) through a read-only hook. The kit's q99 test checks the screens; this checks the rules.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const SRC = fileURLToPath(new URL('../../index.html', import.meta.url));
const URL0 = 'file://' + SRC;
const HOOK = `Object.defineProperty(window,'__rider',{configurable:true,get(){ return {riderNorm, riderSetNorm, riderIds, rdSum, outfit, closetItemFromCatalog,
  CLOSET_CATALOG, CLOSET_STARTER, get settings(){ return settings; }}; }});\n`;
function pageSource() {
  let s = readFileSync(SRC, 'utf8');
  const cfg = /const FIREBASE_CONFIG = \{[\s\S]*?\n\};/;
  if (!cfg.test(s)) throw new Error('rider test: FIREBASE_CONFIG block not found in index.html');
  s = s.replace(cfg, 'const FIREBASE_CONFIG = null;');
  const k = s.indexOf("\n'use strict';\n");
  if (k < 0) throw new Error("rider test: the main script's 'use strict' line was not found");
  const at = k + "\n'use strict';".length;
  return s.slice(0, at) + '\n' + HOOK + s.slice(at);
}

let browser, page;
const errors = [];
before(async () => {
  const body = pageSource();
  browser = await chromium.launch();
  const ctx = await browser.newContext({ serviceWorkers: 'block', timezoneId: 'America/Indiana/Indianapolis', locale: 'en-US', viewport: { width: 390, height: 844 } });
  page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', r => { const u = r.request().url(); if (u === URL0) return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body }); return u.startsWith('file:') ? r.continue() : r.abort(); });
  await page.goto(URL0);
  await page.waitForFunction(() => !!window.__rider && !!window.FW);
});
after(async () => { if (browser) await browser.close(); });

// values no field offers: not strings, near misses, and the names every object has
const BAD = [42, 0, null, true, false, {}, [], ['#179BCC'], 'nope', '', ' ', '__proto__', 'constructor', 'toString', 'hasOwnProperty', 'valueOf', '#179bcc', ' #179BCC', '#FFFFFE', 'Light'];

test('every rider field is offered and every option has a name', async () => {
  const r = await page.evaluate(() => { const F = FW, out = [];
    for (const k of Object.keys(F.RIDER_DEFAULT)) { const o = F.RIDER_OPTIONS[k];
      if (!o) { out.push(k + ': no options'); continue; }
      const L = Array.isArray(o) ? o : Object.keys(o);
      if (!L.includes(F.RIDER_DEFAULT[k])) out.push(k + ': the default is not an option');
      for (const v of L) { const n = Array.isArray(o) ? (F.RIDER_NAMES[k] || {})[v] : o[v]; if (typeof n !== 'string' || !n.trim()) out.push(k + ' ' + JSON.stringify(v) + ': no name'); } }
    return out; });
  assert.deepEqual(r, []);
});

test('riderNorm keeps every offered value and puts the default in for anything else, field by field', async () => {
  const r = await page.evaluate(BAD => { const { riderNorm } = window.__rider, F = FW, D = F.RIDER_DEFAULT, out = [];
    if (JSON.stringify(riderNorm(D)) !== JSON.stringify(D)) out.push('the default is not kept');
    for (const k of Object.keys(D)) { const o = F.RIDER_OPTIONS[k], L = Array.isArray(o) ? o : Object.keys(o);
      for (const v of L) { const n = riderNorm(Object.assign({}, D, { [k]: v })); if (n[k] !== v) out.push(k + ' ' + JSON.stringify(v) + ' not kept'); }
      // one field tampered, another (the first other option) chosen: the tampered one is its default, the chosen one stays
      const other = Object.keys(D).find(x => x !== k), oo = F.RIDER_OPTIONS[other], ov = (Array.isArray(oo) ? oo : Object.keys(oo)).find(v => v !== D[other]);
      for (const b of BAD) { if (L.includes(b)) continue; /* ('' is a choice for kit2, sleeve and pattern) */ const n = riderNorm(Object.assign({}, D, { [other]: ov, [k]: b }));
        if (n[k] !== D[k]) out.push(k + ' ' + JSON.stringify(b) + ' -> ' + JSON.stringify(n[k]));
        if (n[other] !== ov) out.push(k + ' ' + JSON.stringify(b) + ' lost ' + other); } }
    // every field at once
    const all = {}; Object.keys(D).forEach(k => { all[k] = '__proto__'; }); if (JSON.stringify(riderNorm(all)) !== JSON.stringify(D)) out.push('all fields tampered');
    return out; }, BAD);
  assert.deepEqual(r, []);
});

test('riderNorm: a key the bundle has no field for is dropped; anything that is not a rider is the default rider; nothing is no rider', async () => {
  const r = await page.evaluate(() => { const { riderNorm } = window.__rider, D = FW.RIDER_DEFAULT;
    const j = x => JSON.stringify(x);
    const proto = riderNorm(JSON.parse('{"__proto__":{"skin":"deep"},"skin":"tan","extra":"x","constructor":"y"}'));
    return { extra: Object.keys(riderNorm(Object.assign({}, D, { extra: 1, html: '<b>' }))), notRider: ['x', 5, true, [], ['tan'], 0].map(v => j(riderNorm(v)) === j(D)),
      none: [riderNorm(null), riderNorm(undefined)], proto: { skin: proto.skin, keys: Object.keys(proto).length, polluted: ({}).skin === undefined }, D: Object.keys(D) }; });
  assert.deepEqual(r.extra, r.D);
  assert.deepEqual(r.notRider, [true, true, true, true, true, true]);
  assert.deepEqual(r.none, [undefined, undefined]);
  assert.deepEqual(r.proto, { skin: 'tan', keys: r.D.length, polluted: true });
});

test('riderSetNorm: no rider stays no rider (settings.rider is stored only once built); null drops it; a tampered one is cleaned in place', async () => {
  const r = await page.evaluate(() => { const { riderSetNorm } = window.__rider, D = FW.RIDER_DEFAULT;
    const a = riderSetNorm({ units: 'us' }), b = riderSetNorm({ rider: null }), c = riderSetNorm({ rider: { skin: 'deep', kit: '__proto__', hair: 7 } }), d = riderSetNorm({ rider: 'x' });
    return { a: 'rider' in a, b: 'rider' in b, c: c.rider, d: JSON.stringify(d.rider) === JSON.stringify(D), boot: 'rider' in window.__rider.settings, same: riderSetNorm(a) === a };
  });
  assert.equal(r.a, false); assert.equal(r.b, false); assert.equal(r.boot, false); assert.equal(r.d, true); assert.equal(r.same, true);
  assert.equal(r.c.skin, 'deep'); assert.equal(r.c.kit, '#179BCC'); assert.equal(r.c.hair, '#5A3B2A');
});

test('riderIds: only string ids FW.OUTFIT_LOOK has as its own, always an array, order kept', async () => {
  const r = await page.evaluate(() => { const { riderIds } = window.__rider;
    return { mixed: riderIds(['jersey-med', '__proto__', 'constructor', 'toString', 'valueOf', 'hasOwnProperty', 'k3x9ab2', 7, null, undefined, { id: 'vest' }, ['arms'], 'arms', 'vest', 'jersey-med']),
      notList: [null, undefined, 'jersey-med', 5, {}, { length: 1, 0: 'vest' }].map(x => riderIds(x)),
      safe: (() => { try { FW.riderOutfit({}, riderIds(['__proto__', 'vest'])); return 'ok'; } catch (e) { return String(e); } })(),
      raw: (() => { try { FW.riderOutfit({}, ['__proto__']); return 'no throw'; } catch (e) { return 'throws'; } })() }; });
  assert.deepEqual(r.mixed, ['jersey-med', 'arms', 'vest', 'jersey-med']);
  assert.deepEqual(r.notList, [[], [], [], [], [], []]);
  assert.equal(r.safe, 'ok');
  assert.equal(r.raw, 'throws'); // the bundle's own call throws on it: the filter is what keeps the strip drawing
});

test('every closet catalog item has a look on the rider', async () => {
  const r = await page.evaluate(() => window.__rider.CLOSET_CATALOG.map(c => c.id).filter(id => !Object.prototype.hasOwnProperty.call(FW.OUTFIT_LOOK, id)));
  assert.deepEqual(r, []);
});

// the strip's ids for real rides: outfit() for hot, mild, cold, freezing and wet rides (Steady), the starter closet and every catalog item,
// each with a closet item of your own that the ride lists too (a uid id): the strip gets the list's catalog ids, in its order, and
// never the custom one
const RIDES = [['hot', 95, 95, 0], ['mild', 61, 61, 0], ['cold', 42, 42, 0], ['freezing', 28, 28, 0], ['wet', 55, 55, 80]];
test('the strip gets exactly the catalog ids outfit() lists, for hot, mild, cold, freezing and wet rides', async () => {
  const r = await page.evaluate(RIDES => { const H = window.__rider, S = H.settings, keep = S.closet, int = S.intensity, out = {};
    const mk = id => H.closetItemFromCatalog(H.CLOSET_CATALOG.find(c => c.id === id));
    const closets = { starter: H.CLOSET_STARTER.map(mk), full: H.CLOSET_CATALOG.map(c => mk(c.id)) };
    try {
      for (const [cn, cl] of Object.entries(closets)) for (const [n, lo, hi, rain] of RIDES) {
        const own = { id: 'q99own' + n, label: 'My ' + n + ' thing', group: 'Custom', kind: n === 'hot' ? 'warm' : 'cold', at: { recovery: 70, z2: n === 'hot' ? 80 : 70, hard: 70 } };
        S.closet = cl.concat([own]); S.intensity = 'z2';
        const ids = H.outfit(lo, hi, rain, 'z2').wear.map(c => c.id), strip = H.riderIds(ids);
        let drawn = 'ok'; try { FW.riderOutfit(FW.RIDER_DEFAULT, strip); } catch (e) { drawn = String(e); }
        out[cn + ' ' + n] = { ids, strip, drawn };
      }
    } finally { S.closet = keep; S.intensity = int; }
    return out; }, RIDES);
  const EXPECT = { // the lists outfit() gives (as the bundle check found them on main), the custom item last in the Custom group
    'starter hot': ['jersey-light', 'bibs'],
    'starter mild': ['jersey-med', 'arms', 'bibs', 'knees', 'toes'],
    'starter cold': ['jersey-heavy', 'vest', 'arms', 'legs', 'gloves-thermal', 'head', 'shoes'],
    'starter freezing': ['jersey-heavy', 'vest', 'arms', 'legs', 'gloves-thermal', 'head', 'shoes'],
    'starter wet': ['jersey-med', 'vest', 'arms', 'legs', 'gloves', 'cap', 'toes'],
    'full hot': ['jersey-light', 'sun-sleeves', 'bibs', 'gloves-finger', 'socks-summer'],
    'full cold': ['jersey-heavy', 'base-ls', 'jacket-thermal', 'arms', 'tights-light', 'gloves-thermal', 'skullcap', 'gaiter', 'socks-wool', 'shoes'],
    'full freezing': ['jersey-heavy', 'base-thermal', 'jacket-winter', 'arms', 'tights-heavy', 'gloves-lobster', 'balaclava', 'gaiter', 'socks-wool', 'boots'],
  };
  for (const [k, v] of Object.entries(r)) {
    const own = v.ids.filter(id => id.startsWith('q99own'));
    assert.equal(own.length, 1, k + ': the ride lists the custom item');
    assert.deepEqual(v.strip, v.ids.filter(id => !id.startsWith('q99own')), k + ': the strip gets the list minus the custom item');
    assert.equal(v.drawn, 'ok', k);
    if (EXPECT[k]) assert.deepEqual(v.strip, EXPECT[k], k);
  }
});

test('the Look summary reads per hair style (a ponytail, braids and a head covering are named, not "<style> <colour> hair")', async () => {
  const r = await page.evaluate(() => Object.keys(FW.RIDER_OPTIONS.hairStyle).map(hs => [hs, window.__rider.rdSum('look', Object.assign({}, FW.RIDER_DEFAULT, { hairStyle: hs, hair: '#2B1D16' }))]));
  assert.deepEqual(Object.fromEntries(r), { short: 'Light skin · short black hair', curly: 'Light skin · curly black hair', long: 'Light skin · long black hair', pony: 'Light skin · black ponytail',
    braids: 'Light skin · black braids', shaved: 'Light skin · shaved black hair', covered: 'Light skin · black head covering' });
});

test('a head covering is named in plain colours (no "blond head covering"); hair keeps its hair names', async () => {
  const r = await page.evaluate(() => FW.RIDER_OPTIONS.hair.map(h => [window.__rider.rdSum('look', Object.assign({}, FW.RIDER_DEFAULT, { hairStyle: 'covered', hair: h })), window.__rider.rdSum('look', Object.assign({}, FW.RIDER_DEFAULT, { hairStyle: 'long', hair: h }))]));
  assert.deepEqual(r.map(x => x[0]), ['black', 'dark brown', 'brown', 'rust', 'gold', 'grey'].map(c => 'Light skin · ' + c + ' head covering'));
  assert.deepEqual(r.map(x => x[1]), ['black', 'dark brown', 'brown', 'auburn', 'blond', 'grey'].map(c => 'Light skin · long ' + c + ' hair'));
});

test('no page errors', () => { assert.deepEqual(errors, []); });
