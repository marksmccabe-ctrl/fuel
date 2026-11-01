// kit2 page opener (rebuilt 2026-10-29 after the old kit was lost with the container).
// open(page, opts) -> {b, ctx, p, errors, close}
//   page: path to a built test page (null.html: Firebase off; build it with tools/mknull.sh <checkout> <outdir>)
//   opts.width/height (390x844), opts.scale (root font scale: 1 = 100%, 2 = 200%), opts.motion (false: Reduce Motion on),
//   opts.athlete ('A' | 'B' | 'C' | null: seed that test athlete's library and settings; null: an empty first visit),
//   opts.settings (extra settings merged in), opts.storage ({key: value} extra localStorage items, values JSON-encoded),
//   opts.now (a fixed clock, ISO string), opts.repo (the checkout whose tests/ fixtures to use; default /home/user/fuel).
// Network: every non-file request is aborted (no Firebase, no forecasts) unless opts.route handles it. Page errors and console
// errors are collected in `errors`.
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

export async function open(page, o = {}) {
  const repo = o.repo || '/home/user/fuel';
  let lib = null, settings = {};
  if (o.athlete) {
    const { loadAthletes } = await import(pathToFileURL(path.join(repo, 'tests/fixtures/load.mjs')).href);
    const { appLibrary, appSettings } = await import(pathToFileURL(path.join(repo, 'tests/engine/app-input.mjs')).href);
    const a = loadAthletes()[o.athlete];
    lib = appLibrary(a);
    settings = appSettings(a, a.rideDefaults || {});
  }
  settings = Object.assign({}, settings, { disclaimerSeen: true, profileSeen: true, setupDone: true }, o.settings || {});
  const store = Object.assign({}, o.storage || {});
  store['bluebird.settings.v2'] = settings;
  if (lib) store['bluebird.library.v5'] = lib;
  const b = o.browser || await chromium.launch();
  const ctx = await b.newContext({
    viewport: { width: o.width || 390, height: o.height || 844 },
    deviceScaleFactor: o.dpr || 1,
    reducedMotion: o.motion ? 'no-preference' : 'reduce',
    serviceWorkers: 'block',
    timezoneId: o.tz || 'America/Los_Angeles',
    locale: 'en-US',
  });
  // Seed once per open(). The flag lives in localStorage beside the seed, keyed by a token for this open(); the app removes only
  // bluebird.* keys. Why not a sessionStorage flag: on about 1 reload in 8-15, Chromium gives a file:// page a blank, throwaway
  // localStorage (writes made there are gone at the next load, which sees the real store again; an http origin never does this).
  // Such a load finds no token, gets the seed and is marked window.__kitFresh, so reload() below can tell and load again.
  const token = Date.now().toString(36) + Math.random().toString(36).slice(2);
  await ctx.addInitScript(([st, scale, now, tok]) => {
    if (localStorage.getItem('__kit_seeded') !== tok) {
      for (const [k, v] of Object.entries(st)) localStorage.setItem(k, JSON.stringify(v));
      localStorage.setItem('__kit_seeded', tok);
      window.__kitFresh = true;
    }
    if (scale && scale !== 1) document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.fontSize = (16 * scale) + 'px'; });
    if (now) { const T = new Date(now).getTime(), D = Date, off = T - D.now();
      globalThis.Date = class extends D { constructor(...a) { super(...(a.length ? a : [D.now() + off])); } static now() { return D.now() + off; } }; }
  }, [store, o.scale || 1, o.now || null, token]);
  await ctx.route('**/*', r => {
    const u = r.request().url();
    if (o.route) { const h = o.route(r, u); if (h) return h; }
    return u.startsWith('file:') || u.startsWith('data:') || u.startsWith('blob:') ? r.continue() : r.abort();
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::ERR_FAILED|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.goto(pathToFileURL(path.resolve(page)).href);
  await p.waitForLoadState('load');
  await p.waitForTimeout(o.settle ?? 400);
  return { b, ctx, p, errors, close: async () => { if (!o.browser) await b.close(); else await ctx.close(); } };
}

// reload(p): a reload that keeps the page's data. A load that got Chromium's throwaway file:// store (see open) is loaded again,
// up to 5 times; returns how many extra loads it took.
export async function reload(p, tries = 5) {
  for (let i = 0; i < tries; i++) {
    await p.reload(); await p.waitForLoadState('load');
    if (!(await p.evaluate(() => window.__kitFresh === true))) return i;
  }
  throw new Error('reload: still a blank localStorage after ' + tries + ' loads');
}

// tiny check helpers shared by kit2 tests: ok(cond, name, detail) and done(title)
export function checker(prefix = '') {
  let bad = 0, n = 0;
  return {
    ok(c, name, d) { n++; if (c) console.log('  ok ' + prefix + name); else { bad++; console.log('  FAIL ' + prefix + name + (d === undefined ? '' : ' ' + JSON.stringify(d).slice(0, 600))); } },
    done(title) { console.log(bad ? 'FAIL ' + bad : 'OK: ' + title + ' (' + n + ' checks)'); process.exitCode = bad ? 1 : 0; },
    get bad() { return bad; },
  };
}
