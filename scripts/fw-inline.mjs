// node scripts/fw-inline.mjs [handoff folder]      (default: ~/Dropbox/00_T/handoff)
// Item 97: puts the fred world bundle into index.html. The bundle is the design chat's two files, fred-world.css and fred-world.js, built
// by its build-bundle.py from its sources (outside this repo). Each goes into index.html whole, in its own block, between its
// /* fred world vN start */ and /* fred world vN end */ markers:
//   <style id="fwCss">  the CSS, in the <head> just before the app's own stylesheet (so the app's rules come after it);
//   <script id="fwJs">  the JS, just before the app's main script (so window.FW exists during the first render).
// A later run replaces both blocks (whatever version they hold). Never edit the blocks by hand: a change to the art goes into the
// design chat's sources, they rebuild, and this runs again (QUEUE.md, "RULES FOR ALL TEN").
// It refuses a bundle whose two files lack the markers or disagree on the version, one that would end its own <style> or <script>
// early (</style, </script, <!--), and a JS file that doesn't define window.FW with that version.
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';

const DIR = process.argv[2] || join(homedir(), 'Dropbox/00_T/handoff');
const HTML = new URL('../index.html', import.meta.url);
const die = m => { console.error('fw-inline: ' + m); process.exit(1); };

const css = readFileSync(join(DIR, 'fred-world.css'), 'utf8').trim(), js = readFileSync(join(DIR, 'fred-world.js'), 'utf8').trim();
const ver = s => { const a = /^\/\* fred world v(\d+) start \*\//.exec(s), b = /\/\* fred world v(\d+) end \*\/$/.exec(s); return a && b && a[1] === b[1] ? a[1] : null; };
const v = ver(css);
if (!v) die('fred-world.css does not start and end with matching /* fred world vN start */ and /* fred world vN end */ markers');
if (ver(js) !== v) die(`fred-world.js is not between the v${v} markers the CSS has`);
for (const [n, s, bad] of [['fred-world.css', css, /<\/style|<!--/i], ['fred-world.js', js, /<\/script|<!--/i]]) if (bad.test(s)) die(`${n} contains ${bad.exec(s)[0]}, which would end its block early`);
const ctx = { window: {} }; vm.runInNewContext(js, ctx);
if (!ctx.window.FW || ctx.window.FW.version !== v) die(`fred-world.js does not define window.FW with version '${v}'`);

let src = readFileSync(HTML, 'utf8');
const CSS_RE = /<style id="fwCss">\n\/\* fred world v\d+ start \*\/[\s\S]*?\/\* fred world v\d+ end \*\/\n<\/style>\n/;
const JS_RE = /<script id="fwJs">\n\/\* fred world v\d+ start \*\/[\s\S]*?\/\* fred world v\d+ end \*\/\n<\/script>\n/;
const cssBlock = `<style id="fwCss">\n${css}\n</style>\n`, jsBlock = `<script id="fwJs">\n${js}\n</script>\n`;
const MAIN_CSS = '\n<style>\n:root{', MAIN_JS = "\n<script>\n(function(){\n'use strict';\n";
const put = (re, block, anchor, name) => {
  const n = (src.match(new RegExp(re.source, 'g')) || []).length;
  if (n > 1) die(`index.html has ${n} ${name} blocks`);
  if (n === 1) { src = src.replace(re, () => block); return 'replaced'; }
  const k = src.indexOf(anchor); if (k < 0 || src.indexOf(anchor, k + 1) >= 0) die(`the anchor for ${name} (${JSON.stringify(anchor)}) is not in index.html exactly once`);
  src = src.slice(0, k + 1) + block + src.slice(k + 1); return 'added';
};
const a = put(CSS_RE, cssBlock, MAIN_CSS, 'fwCss'), b = put(JS_RE, jsBlock, MAIN_JS, 'fwJs');
writeFileSync(HTML, src);
console.log(`fw-inline: fred world v${v} (${ctx.window.FW.built || 'no build time'}) from ${DIR}: CSS ${a} (${Math.round(css.length / 1024)} KB), JS ${b} (${Math.round(js.length / 1024)} KB)`);
