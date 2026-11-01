// node smoke.test.mjs <null.html> -- every tab opens with no page or console errors, with Test A seeded and on a first visit
import { open, checker } from '../lib/open.mjs';
const F = process.argv[2]; const C = checker();
for (const athlete of ['A', null]) {
  const o = await open(F, { athlete });
  for (const v of ['plan', 'journal', 'volume', 'races', 'news']) {
    const btn = await o.p.$('nav.tabs button[data-view=' + v + ']');
    const vis = btn && await btn.isVisible();
    if (v === 'plan' || v === 'journal') C.ok(!!vis, (athlete || 'empty') + ': tab ' + v + ' visible');
    if (vis) { await btn.click(); await o.p.waitForTimeout(300); C.ok(await o.p.$eval('#view-' + v, e => e.classList.contains('active')).catch(() => false), (athlete || 'empty') + ': ' + v + ' shows'); }
  }
  C.ok(o.errors.length === 0, (athlete || 'empty') + ': no page or console errors', o.errors.slice(0, 5));
  await o.close();
}
C.done('kit2 smoke: every tab opens, no errors');
