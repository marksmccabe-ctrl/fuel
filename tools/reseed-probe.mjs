// probe: does a reload keep the page data? node tools/reseed-probe.mjs <page> <opener file, e.g. lib/open.mjs> <reloads> [ms before each]
import path from 'node:path';
const [page, opener, n, wait] = process.argv.slice(2);
const { open, reload } = await import(path.resolve(opener));
const o = await open(page, { athlete: 'A' });
let reseeds = 0, lost = 0, retries = 0;
for (let i = 0; i < +n; i++) {
  await o.p.evaluate(i => { const s = JSON.parse(localStorage.getItem('bluebird.settings.v2')); s.__mark = i; localStorage.setItem('bluebird.settings.v2', JSON.stringify(s)); }, i);
  if (+wait) await o.p.waitForTimeout(+wait);
  let extra = 0; if (reload) extra = await reload(o.p); else { await o.p.reload(); await o.p.waitForLoadState('load'); } retries += extra;
  const m = await o.p.evaluate(() => JSON.parse(localStorage.getItem('bluebird.settings.v2')).__mark);
  if (m === undefined) { reseeds++; console.log("  reseed at " + i + " after " + extra + " extra"); } else if (m !== i) { lost++; console.log("  lost at " + i + ": " + m); }
}
console.log(path.basename(opener) + ': ' + reseeds + ' reseeds, ' + lost + ' lost writes in ' + n + ' reloads (' + retries + ' extra loads)' + (+wait ? ', ' + wait + ' ms before each' : ''));
await o.close();
