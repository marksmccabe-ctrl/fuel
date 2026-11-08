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
  // the acceptance check's gaps (probe99/check1-tests/mk.mjs), each now guarded
  ['c1-swsame', 'sheet', s => rep(s, "if(b.classList.contains('rd-c')) b.style.setProperty('--sw', rdColour(k, v, r));", "if(b.classList.contains('rd-c')) b.style.setProperty('--sw', rdColour(k, r[k], r));")],
  ['c1-noring', 'sheet', s => rep(rep(s, '.rd-c[aria-pressed="true"]{box-shadow:0 0 0 2px var(--panel),0 0 0 4px var(--text)}', ''), '.rd-t[aria-pressed="true"]{background:var(--black);border-color:var(--black);color:var(--white);font-weight:600}', '')],
  ['c1-figlow', 'sheet', s => rep(s, '<div class="rd-fig" id="rdFig"></div>\n        <div class="rd-gs" id="rdGroups"></div>', '<div class="rd-gs" id="rdGroups"></div>\n        <div class="rd-fig" id="rdFig"></div>')],
  ['c1-nowrap', 'sheet', s => rep(s, "n=L[(L.indexOf(b)+d+L.length)%L.length];", "n=L[Math.min(L.length-1, Math.max(0, L.indexOf(b)+d))];")],
  ['c1-nostripapply', 'strip', s => rep(s, "riderSheetSync(); const s=$('rRider'); if(s && s._ids) riderStrip(s._ids); riderHdr();", "riderSheetSync(); riderHdr();")],
  ['c1-nobackup', 'backup', s => rep(s, "exported:new Date().toISOString(), settings, library:lib, journal,", "exported:new Date().toISOString(), settings:(x=>{ const c=Object.assign({}, x); delete c.rider; return c; })(settings), library:lib, journal,")],
  ['c1-nofoldmem', 'sheet', s => rep(s, "    vFoldInit(box); }\n  riderSheetSync(); }", "    vFoldInit(box); } else box.querySelectorAll('.v-fold[data-fold]').forEach(x=>vFoldSet(x, false, false));\n  riderSheetSync(); }")],
  ['c1-nost', 'avatar', s => rep(s, "hb.dataset.st=s.st; riderHdr();", "riderHdr();")],
  ['c1-fignofwm', 'sheet,media', s => rep(s, "fwMount($('rdFig'), ()=>F.riderOutfit(r), 'fig:'+JSON.stringify(r), {still:true}); }", "{ const fg=$('rdFig'), h=F.riderOutfit(r); if(fg && fg.dataset.k!==JSON.stringify(r)){ fg.innerHTML=h; fg.dataset.k=JSON.stringify(r); } } }")],
  ['c1-noupdown', 'sheet', s => rep(s, "d={ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1}[e.key];", "d={ArrowRight:1, ArrowLeft:-1}[e.key];")],
  ['c1-noaffirm', 'build', s => rep(s, "const b=e.target.closest('[data-rd]'); if(b) return riderPut(b.dataset.rd, b.dataset.v);", "const b=e.target.closest('[data-rd]'); if(b){ if(b.getAttribute('aria-pressed')==='true') return; return riderPut(b.dataset.rd, b.dataset.v); }")],
  ['c1-nojacket', 'strip', s => rep(rep(rep(s, "'jacket-thermal':o=>{o.outer='#2F3B6E'; o.armSleeve='#2F3B6E';},", "'jacket-thermal':o=>{},"), "'jacket-winter':o=>{o.outer='#1E2A4A'; o.armSleeve='#1E2A4A';},", "'jacket-winter':o=>{},"), "'jacket-rain':o=>{o.outer='#F2D64B'; o.armSleeve='#F2D64B';},", "'jacket-rain':o=>{},")],
  // this round's app fixes, undone one by one
  ['nosame', 'sheet,media', s => rep(s, "'rd-c'+(v==='' ? ' rd-same' : '')", "'rd-c'")],
  ['hairsum', 'sheet,build', s => rep(s, "hair=hs==='covered' ? hc+' head covering' : hs==='pony' || hs==='braids' ? hc+' '+lc(n('hairStyle')) : lc(n('hairStyle'))+' '+hc+' hair';", "hair=lc(n('hairStyle'))+' '+hc+' hair';")],
  ['sideblank', 'row', s => rep(s, "if(!g.classList.contains('sp-hide')){ any+=n; return; }", "any+=n; return;")],
  ['riderwide', 'strip', s => rep(s, "function riderOutfit(rider, ids=[], extra={}){", "function riderOutfit(rider, ids=[], extra={}){ if(rider && rider.skin==='deep') ids=ids.filter(x=>x!=='gloves-thermal');")], // a built rider's miss outside SKIN_GAPS
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
