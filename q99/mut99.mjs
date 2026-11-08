// item 99's mutants (kept from the build: paths are the Mac Studio's fuel-work folders): each a copy of fred99/null.html with one change, in probe99/mut-<name>/ (null.html and sw.js); q99 runs the
// sections that guard it (Q99_ONLY) and must end FAIL. node mutants.mjs [name,name]  -> probe99/w/mutants.log (one line per mutant)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const SRC = '/Users/markmccabe/code/fuel-work/fred99/null.html', BASE = '/Users/markmccabe/code/fuel-work/probe99', KIT = '/Users/markmccabe/code/fuel-work/kit2/q99';
const src = fs.readFileSync(SRC, 'utf8'), sw = fs.readFileSync(path.join(path.dirname(SRC), 'sw.js'), 'utf8');
const rep = (s, a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error('mutant: ' + JSON.stringify(a.slice(0, 80)) + ' found ' + n + ' times'); return s.replace(a, () => b); };
const M = [
  ['nofilter', 'strip', s => rep(s, "const r=riderNow(), L=riderIds(ids); el._ids=L;", "const r=riderNow(), L=(Array.isArray(ids)?ids:[]).filter(id=>typeof id==='string'); el._ids=L;")],
  ['keep', 'strip', s => rep(s, "riderStrip(o.wear.map(c=>c && c.id));", "riderStrip(o.keep.map(c=>c && c.id));")],
  ['nonorm-load', 'norm', s => rep(s, "riderSetNorm(settings); /* item 99: the rider's look, checked value by value against the bundle's options */", "")],
  ['nonorm-sync', 'norm', s => rep(rep(s, "ownNorm(settings); riderSetNorm(settings); /* item 99 */ save(KEYS.settings, settings);", "ownNorm(settings); save(KEYS.settings, settings);"), "cs=riderSetNorm(syncStrip(c))", "cs=syncStrip(c)")],
  ['nonorm-restore', 'norm', s => rep(s, "else delete settings.rider; } riderSetNorm(settings);", "else delete settings.rider; }")],
  ['restore-drop', 'backup', s => rep(s, "if(!(d.settings && 'rider' in d.settings)){ if(prd) settings.rider=prd; else delete settings.rider; }", "")],
  ['dbg', 'private', s => rep(s, "'journalHeader','weightLb','weightAt','rider'];", "'journalHeader','weightLb','weightAt'];")],
  ['ai', 'private', s => rep(s, "ATHLETE_NAME: aiAthleteName(),", "ATHLETE_NAME: aiAthleteName()+(settings.rider ? ' '+JSON.stringify(settings.rider) : ''),")],
  ['privacy', 'private', s => rep(s, "product library; your rider’s look; your last plan;", "product library; your last plan;")],
  ['default', 'build', s => rep(s, "const DEFAULT_SETTINGS = {", "const DEFAULT_SETTINGS = {rider:{skin:'light'}, ")],
  ['store-open', 'build', s => rep(s, "function riderSheet(){ const box=$('rdGroups'), F=window.FW; if(!box || !F) return;", "function riderSheet(){ const box=$('rdGroups'), F=window.FW; if(!box || !F) return; if(!settings.rider){ settings=Object.assign({}, settings, {rider:riderNow()}); save(KEYS.settings, settings); }")],
  ['move', 'still,avatar', s => rep(rep(s, "'strip:'+JSON.stringify(r)+'|'+L.join(','), {still:true}); }", "'strip:'+JSON.stringify(r)+'|'+L.join(','), {}); }"), "'av:'+size+':'+JSON.stringify(r), {still:true});", "'av:'+size+':'+JSON.stringify(r), {cls:'fw-bird'});")],
  ['pressed', 'sheet', s => rep(rep(s, "aria-pressed=\"false\" tabindex=\"-1\">", "aria-checked=\"false\" tabindex=\"-1\">"), "if(b.getAttribute('aria-pressed')!==String(on)) b.setAttribute('aria-pressed', String(on));", "if(b.getAttribute('aria-checked')!==String(on)) b.setAttribute('aria-checked', String(on));")],
  ['small', 'sheet,fit', s => rep(s, ".rd-c{flex:none;width:44px;height:44px;min-height:44px;", ".rd-c{flex:none;width:40px;height:40px;min-height:40px;")],
  ['nogroup', 'sheet', s => rep(s, "<div class=\"rd-sw\" role=\"group\" aria-labelledby=\"rdL-${k}\">", "<div class=\"rd-sw\">")],
  ['names', 'sheet', s => rep(s, "data-v=\"${esc(v)}\" aria-label=\"${esc(rdName(k, v))}\"", "data-v=\"${esc(v)}\" aria-label=\"${esc(v||'none')}\"")],
  ['nomore', 'sheet', s => rep(s, "['kit', 'Kit', ['kit','pattern','shorts'], ['kit2','sleeve']]", "['kit', 'Kit', ['kit','pattern','shorts','kit2','sleeve'], []]")],
  ['nokeys', 'sheet', s => rep(s, "e.preventDefault(); n.focus(); n.click(); });", "});")],
  ['foldopen', 'sheet', s => rep(s, "<section class=\"v-fold rd-g\" data-fold=\"rider-${g}\">", "<section class=\"v-fold rd-g\" data-fold=\"rider-${g}\" data-open=\"1\">")],
  ['sum', 'sheet,build', s => rep(s, ": `${n('kit')} jersey · ${lc(n('pattern'))} · ${lc(n('shorts'))} shorts`; }", ": `${n('kit')} jersey · ${lc(n('shorts'))} shorts`; }")],
  ['avsize', 'avatar', s => rep(s, "header .hacct .hav>.av-r>svg{width:32px;height:32px}", "")],
  ['avout', 'avatar', s => rep(s, "on=!!ini && riderBuilt() && !!F;", "on=riderBuilt() && !!F;")],
  ['avinit', 'avatar', s => rep(s, "@media (forced-colors:active){#rRider{display:none!important} .av-on>.av-i{display:inline} .av-on>.av-r{display:none}", "@media (forced-colors:active){#rRider{display:none!important}")],
  ['fc', 'media', s => rep(s, "  .rd-c{forced-color-adjust:none;border-color:CanvasText}", "  .rd-c{border-color:CanvasText}")],
  ['print', 'media', s => rep(s, "@media print{#rRider{display:none!important}", "@media print{")],
  ['quiet', 'sync', s => rep(s, "const SYNC_QUIET = ['profileSeen','setupDone','disclaimerSeen'];", "const SYNC_QUIET = ['profileSeen','setupDone','disclaimerSeen','rider'];")],
  ['cloudrider', 'sync', s => rep(s, "cs=riderSetNorm(syncStrip(c))", "cs=(x=>{ delete x.rider; return x; })(syncStrip(c))")],
  ['striptext', 'strip', s => rep(s, "fwMount(el, ()=>F.riderOutfit(r, L.slice()), ", "el.title='Dressed for the ride'; fwMount(el, ()=>'<span>Dressed</span>'+F.riderOutfit(r, L.slice()), ")],
  ['nowide', 'fit', s => rep(s, ".rd-sw{display:flex;flex-wrap:wrap;gap:10px}", ".rd-sw{display:flex;flex-wrap:nowrap;gap:10px}")],
  ['hint', 'row', s => rep(s, "const SET_NOSAVE=new Set(['account','strava','training','backup','planfor','rider']);", "const SET_NOSAVE=new Set(['account','strava','training','backup','planfor']);")],
];
const pick = (process.argv[2] || '').split(',').filter(Boolean), out = path.join(BASE, 'w', 'mutants.log');
for (const [name, only, f] of M) {
  if (pick.length && !pick.includes(name)) continue;
  const dir = path.join(BASE, 'mut-' + name); fs.mkdirSync(dir, { recursive: true });
  let t; try { t = f(src); } catch (e) { fs.appendFileSync(out, name + ': BUILD ' + e.message + '\n'); continue; }
  fs.writeFileSync(path.join(dir, 'null.html'), t); fs.writeFileSync(path.join(dir, 'sw.js'), sw);
  if (process.env.DRY) { console.log(name, 'built'); continue; }
  let log = ''; try { log = execFileSync('perl', ['../tools/timeout.pl', '900', process.execPath, 'q99.test.mjs', path.join(dir, 'null.html')], { cwd: KIT, env: Object.assign({}, process.env, { Q99_ONLY: only }), encoding: 'utf8', maxBuffer: 64e6 }); } catch (e) { log = (e.stdout || '') + (e.stderr || ''); }
  fs.writeFileSync(path.join(dir, 'q99.log'), log);
  const last = log.trim().split('\n').pop(), fails = log.split('\n').filter(l => /^\s+FAIL /.test(l)).map(l => l.trim().slice(0, 160));
  fs.appendFileSync(out, name + ' (' + only + '): ' + last + (fails.length ? ' | ' + fails.slice(0, 3).join(' | ') : '') + '\n');
}
