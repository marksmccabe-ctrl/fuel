// node reach98.mjs <null.html> [step ms]   (cd into this folder first) -- fred's painted reach through his whole move, every weather look:
// the drawing in the ride's box (motion on) is copied into a moving sandbox spot (.fwm.fwm-go and the spot's wrapper class, off screen),
// every loop paused and set to each time of the shared timeline (0 to 4 s, the longest loop, in steps), each moving part's pose baked
// into a copy (its own transform from the browser's matrices, its opacity), and the copy painted on a canvas with room round its box.
// Prints, per look, the painted extent in drawing units (the base box is 0 0 200 200) at rest and through the move, and what it means at
// --wxf 88 px against the card's right and top padding edges (fred's box is 0.33 x 88 in from the right, 0.14 x 88 down).
// q98's size check uses the same sampler (REACH below is copied there).
import path from 'node:path';
import { chromium } from 'playwright';
import { openScreen, crunch, toY } from '../lib/screens.mjs';

export const REACH = async ([sel, step]) => { const W = document.querySelector(sel), f = W && W.querySelector(':scope>.rwx-fred:not(.rwx-out)'); if (!f || !f.querySelector('svg')) return null;
  const vb = f.querySelector('svg').getAttribute('viewBox').split(/\s+/).map(Number), M = 40, S = 2, box = document.createElement('div');
  box.className = 'fwm fwm-go ' + [...f.classList].filter(c => /^fw-/.test(c) && c !== 'fw-rm').join(' '); box.style.cssText = 'position:fixed;left:-3000px;top:0;width:88px;height:88px';
  box.innerHTML = f.innerHTML; document.body.append(box); const svg = box.querySelector('svg');
  const A = box.getAnimations({ subtree: true }).filter(a => /^fw-/.test(String(a.animationName))); A.forEach(a => a.pause());
  const T = [...new Set(A.map(a => a.effect.target))], dur = Math.max(0, ...A.map(a => +a.effect.getTiming().duration || 0));
  const c = document.createElement('canvas'); c.width = (vb[2] + 2 * M) * S; c.height = (vb[3] + 2 * M) * S; const g = c.getContext('2d', { willReadFrequently: true });
  const paint = async () => { const cl = svg.cloneNode(true), all = [...svg.querySelectorAll('*')], ca = [...cl.querySelectorAll('*')];
    for (const e of T) { const i = all.indexOf(e), d = ca[i]; if (i < 0) continue; const P = e.parentNode.getCTM(), m = P.inverse().multiply(e.getCTM());
      d.setAttribute('transform', `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`); d.setAttribute('opacity', getComputedStyle(e).opacity); }
    cl.setAttribute('viewBox', [vb[0] - M, vb[1] - M, vb[2] + 2 * M, vb[3] + 2 * M].join(' ')); cl.setAttribute('width', c.width); cl.setAttribute('height', c.height);
    let h = window.FW.plain(cl.outerHTML); if (!/xmlns=/.test(h)) h = h.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(h); await im.decode(); g.clearRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0);
    const D = g.getImageData(0, 0, c.width, c.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (D[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return [x0 / S + vb[0] - M, y0 / S + vb[1] - M, (x1 + 1) / S + vb[0] - M, (y1 + 1) / S + vb[1] - M]; };
  const R = v => Math.round(v * 100) / 100, at = {}; let rest = null, move = null;
  for (let t = 0; t <= Math.max(dur, 0); t += step) { A.forEach(a => { a.currentTime = t; }); const b = await paint(); if (!rest) rest = b;
    if (!move) move = b.slice(); else { ['L', 'T'].forEach((s, j) => { if (b[j] < move[j]) { move[j] = b[j]; at[s] = t; } }); ['R', 'B'].forEach((s, j) => { if (b[j + 2] > move[j + 2]) { move[j + 2] = b[j + 2]; at[s] = t; } }); } }
  box.remove(); return { vb: vb.join(' '), cls: box.className, loops: A.length, dur, rest: rest.map(R), move: move.map(R), at }; };

if (import.meta.url === 'file://' + path.resolve(process.argv[1])) {
  const PAGE = path.resolve(process.argv[2]), STEP = +(process.argv[3] || 20), browser = await chromium.launch(), W = 88;
  const built = await (async () => { const x = await openScreen(PAGE, { name: 'b', go: async () => {} }, { browser }); const b = await x.p.evaluate(() => window.FW.version + ' ' + window.FW.built); await x.close(); return b; })();
  console.log('page ' + PAGE + ': FW ' + built + ', step ' + STEP + ' ms');
  console.log('look    viewBox              rest [L T R B] units          move [L T R B] units          right: past box / room px   top: above box / room px   left: units in from box');
  for (const k of ['sun', 'heat', 'freeze', 'wind', 'clouds', 'fog', 'rain', 'snow']) {
    const x = await openScreen(PAGE, { name: 'r-' + k, query: '?sky=' + k, go: async p => { await crunch(p); await toY(p, '#rWeather'); } }, { browser, width: 430, motion: true });
    const r = await x.p.evaluate(REACH, ['#rWeather', STEP]); await x.close();
    if (!r) { console.log(k + ': no fred'); continue; }
    const px = u => Math.round(u / 200 * W * 10) / 10, right = Math.max(0, r.move[2] - 200), up = Math.max(0, -r.move[1]);
    console.log(k.padEnd(7) + ' ' + r.vb.padEnd(20) + ' ' + JSON.stringify(r.rest).padEnd(30) + ' ' + JSON.stringify(r.move).padEnd(30) + ' ' + (px(right) + ' / ' + Math.round(.33 * W * 100) / 100).padEnd(27) + ' ' + (px(up) + ' / ' + Math.round(.14 * W * 100) / 100).padEnd(26) + ' ' + r.move[0] + '   (' + r.loops + ' loops, peaks at ' + JSON.stringify(r.at) + ')');
  }
  await browser.close();
}
