// item 100's mutants: each a copy of the item page with one change, in <BASE>/mut100-<name>/ (null.html and sw.js); q100 runs the sections
// that guard it (Q100_ONLY) and must end FAIL. node mut100.mjs [name,name]  -> <BASE>/w/mut100.log (one line per mutant)
// MUT_SRC (default fred100/null.html, q100-front) and MUT_BASE (default probe100) override the paths (the Mac Studio's fuel-work folders).
// DRY=1 only builds them.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const SRC = process.env.MUT_SRC || '/Users/markmccabe/code/fuel-work/fred100/null.html', BASE = process.env.MUT_BASE || '/Users/markmccabe/code/fuel-work/probe100';
const KIT = path.dirname(new URL(import.meta.url).pathname), MAIN = process.env.MUT_MAIN || '/Users/markmccabe/code/fuel-work/fred/null.html';
const src = fs.readFileSync(SRC, 'utf8'), sw = fs.readFileSync(path.join(path.dirname(SRC), 'sw.js'), 'utf8');
const rep = (s, a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error('mutant: ' + JSON.stringify(a.slice(0, 80)) + ' found ' + n + ' times'); return s.replace(a, () => b); };
const css = (s, rules) => rep(s, '/* }} q100 front */', rules + '\n/* }} q100 front */');
const M = [
  // the cache
  ['cache', 'cache', s => rep(s, "const APP_BUILD='fred-shell-v124';", "const APP_BUILD='fred-shell-v123';")],
  // 100.1: the box
  ['boxplace', 'place', s => css(s, '#planSky{order:9}')],
  ['tint', 'place', s => rep(s, "background:var(--panel);color:var(--text)}\n#planSky[hidden]", "background:#EAF6FB;color:var(--text)}\n#planSky[hidden]")],
  ['fixedh', 'place', s => rep(s, '#planSky{margin:0;min-height:calc(var(--wxf) * 1.3);', '#planSky{margin:0;height:calc(var(--wxf) * 1.3);')],
  ['nosky', 'looks', s => rep(s, 'if(sk) g.dataset.sky=sk; else delete g.dataset.sky;', 'delete g.dataset.sky;')],
  ['look', 'looks', s => rep(s, "fk=w ? sk||'night' : 'clouds',", "fk=w ? 'clouds' : 'clouds',")],
  ['explain', 'looks,nofc', s => rep(s, "const line=L.join(' · ')+", "const line='fred is dressed for it · '+L.join(' · ')+")],
  ['nofred', 'once', s => rep(s, '#planSky>.rwx-fred{display:block}', '')],
  ['tight', 'fit', s => rep(s, "#planSky .pvs-l::before{content:'';float:right;", "#planSky .pvs-l::before{content:none;float:right;")],
  // 100.2: no forecast, the lookup
  ['capnight', 'nofc', s => rep(s, ": 'clouds', st=R ? R.start", ": 'night', st=R ? R.start")],
  ['stale', 'nofc', s => rep(s, '&& !w.stale && !w.typical){', '&& !w.typical){')],
  ['offline', 'nofc', s => rep(s, " || navigator.onLine===false) return; /* Plan open and showing; offline: no lookup */", ") return;")],
  ['storm', 'fetch', s => rep(s, 'if(Date.now()-(T[R.key]||0)<SKY_RETRY) return; ', '')],
  ['hourold', 'fetch', s => rep(s, "(wxAccepted && wxKey===R.key && !wxOld()) || skyKept(R)) return; /* no ride,", "(wxAccepted && wxKey===R.key) || skyKept(R)) return; /* no ride,")],
  ['nobusy', 'fetch', s => rep(s, 'if(wxBusy && wxBusy.key===R.key){', 'if(false){')],
  // 100.3: after Crunch, the computer layout
  ['boxstays', 'once,desk', s => rep(s, 'function skyShown(){ ', 'function skyShown(){ return false; ')],
  ['dk', 'desk', s => rep(s, 'html.dk #planCrew,html.run-theme #planCrew{display:none!important}', 'html.run-theme #planCrew{display:none!important}')],
  // 100.4: the crew
  ['step3', 'crew', s => rep(s, 's=((day*5)%n+n)%n;', 's=((day*3)%n+n)%n;')],
  ['robs', 'crew', s => rep(s, 'return [0,1,2,3,4].map(k=>(s+k)%n); }', 'return [0,1,2,3,8].map(k=>(s+k)%n); }')],
  ['utcday', 'crew', s => rep(s, 'function crewDay(d=new Date()){ return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())/864e5); }', 'function crewDay(d=new Date()){ return Math.floor(d.getTime()/864e5); }')],
  ['equal', 'crew', s => rep(s, '.crew-a{position:relative;width:calc((100vw - 65px) * var(--bw,1) / var(--sw,5));width:calc((100cqw - 33px) * var(--bw,1) / var(--sw,5));', '.crew-a{position:relative;width:calc((100vw - 65px) / var(--sw,5));width:calc((100cqw - 33px) / var(--sw,5));')],
  ['idp', 'crew', s => rep(s, "()=>F.friend(i, {idp:'cw'+i+'-'})", '()=>F.friend(i)')],
  ['band', 'crew', s => rep(s, '.crew{container-type:inline-size;', '.crew{container-type:inline-size;background:#FBF6EC;')],
  ['vm5', 'motion', s => rep(s, "'crew:'+i, {cls:'fw-vm0'});", "'crew:'+i, {cls:'fw-vm5'});")],
  ['instep', 'motion', s => rep(s, "a.style.setProperty('--fw-d', `-${(j*.6).toFixed(1)}s`); ", '')],
  ['crewstill', 'motion', s => rep(s, "'crew:'+i, {cls:'fw-vm0'});", "'crew:'+i, {cls:'fw-vm0', still:true});")],
  ['noroom', 'room', s => rep(s, 'U.hidden=top-end<CREW_ROOM; }', 'U.hidden=false; }')],
  ['scrollfit', 'room', s => rep(s, "addEventListener('resize', ()=>{ crewFit(); skySoon(); });", "addEventListener('resize', ()=>{ crewFit(); skySoon(); }); addEventListener('scroll', ()=>crewFit(), {passive:true});")],
  // 100.6: the run's graphite
  ['run', 'theme', s => rep(s, 'html.dk #planCrew,html.run-theme #planCrew{display:none!important}', 'html.dk #planCrew{display:none!important}')],
  // 100.5: the switches and the names
  ['defnames', 'switch,names', s => rep(s, 'names=settings.crewNames===true;', 'names=settings.crewNames!==false;')],
  ['stored', 'switch', s => rep(s, 'const DEFAULT_SETTINGS = {', 'const DEFAULT_SETTINGS = {crewShow:true, ')],
  ['crewoff', 'switch', s => rep(s, "if(!on){ if(U.dataset.k){ U.querySelectorAll('.crew-a').forEach(a=>fwMount(a, '')); U.textContent=''; delete U.dataset.k; } U.hidden=true; return; }", 'if(!on){ U.hidden=true; return; }')],
  ['namesdom', 'names', s => rep(rep(s, "let n=li.querySelector('.crew-n'); if(names && !n){", "let n=li.querySelector('.crew-n'); if(!n){"), '} else if(!names && n) n.remove(); });', '} if(n) n.hidden=!names; });')],
  ['ariahid', 'names', s => rep(s, "if(names){ U.removeAttribute('aria-hidden');", "if(names){ U.setAttribute('aria-hidden', 'true');")],
  ['nameorder', 'names', s => rep(s, "const CREW_NAMES=['Ryan','Dustin',", "const CREW_NAMES=['Dustin','Ryan',")],
  ['nowrap', 'names', s => rep(s, '.crew{container-type:inline-size;display:flex;flex-wrap:wrap;', '.crew{container-type:inline-size;display:flex;flex-wrap:nowrap;')],
  ['nosync', 'sync,backup', s => rep(s, 'fwGate(); crewSoon(); /* item 97:', 'fwGate(); /* item 97:')],
  // print and forced colours
  ['print', 'media', s => rep(s, '@media print{ #planCrew{display:none!important} #planSky .pvs-l::before{display:none} }', '@media print{ #planSky .pvs-l::before{display:none} }')],
  ['forced', 'media', s => rep(s, ' #planCrew .crew-a{display:none!important} }', ' }')],
  ['forcedsky', 'media', s => rep(s, '#planSky>.rwx-scene,#planSky>.rwx-fog{display:none!important} ', '')],
  // check round 1: the problems the checkers found, each as the build had it (or as their mutant), and the checks that now catch it
  ['c1-keep', 'keep', s => rep(s, 'SKY_KEPT.set(R.key, w); ', '')], /* the box keeps no copy: a reset ride or a day come back to loses its sky (a new lookup at best) */
  ['c1-offline', 'keep', s => rep(s, 'if(!R || navigator.onLine===false) return null;', 'if(!R) return null;')], /* offline after a live forecast: still the sky and number */
  ['c1-race', 'race', s => rep(s, 'const gone=()=>quiet && (wxBusy!==own || (wxReq()||{}).key!==key);', 'const gone=()=>false;')], /* the box's late lookup writes the shared forecast */
  ['c1-hang', 'race', s => rep(s, "(quiet ? wxBusy.p : Promise.race([wxBusy.p, new Promise(r=>setTimeout(r, WX_WAIT_MS, 'late'))]))", '(wxBusy.p)')], /* Crunch waits on a hung lookup */
  ['c1-slowchange', 'race', s => rep(s, 'if(ok===null) delete T[R.key]; skySoon(); });', 'if(ok===null) delete T[R.key]; skyBoxRender(); });')], /* the ride changed meanwhile: no lookup of it */
  ['c1-overtaken', 'race', s => rep(s, 'if(ok===null) delete T[R.key]; skySoon(); });', 'skySoon(); });')], /* an overtaken try kept for 10 minutes: back to that ride, the cap */
  ['c1-backup', 'backup', s => rep(s, "  Object.keys(pcw).forEach(k=>{ if(!(d.settings && k in d.settings)){ if(pcw[k]!==undefined) settings[k]=pcw[k]; else delete settings[k]; } });", '')], /* an old backup wipes the switches */
  ['c1-split', 'fit', s => rep(s, '#planSky .pvs-p{display:inline-block;max-width:100%}', '')], /* a long place breaks mid-word beside fred */
  ['c1-room0', 'room', s => rep(s, 'const CREW_ROOM=8;', 'const CREW_ROOM=0;')],
  ['c1-nofoot', 'room', s => css(s, '#view-plan>.fredfoot{display:none!important}')],
  ['c1-typical', 'nofc', s => rep(rep(s, 'if(!R || R.ahead>10 || (wxAccepted', 'if(!R || (wxAccepted'), '&& !w.stale && !w.typical){', '&& !w.stale){')],
  ['c1-sheetopen', 'fetch', s => rep(s, " || $('planSheet').classList.contains('open') || document.visibilityState", " || document.visibilityState")],
  ['c1-crunchnote', 'fetch', s => rep(s, "if(ok!=='late' && ((ok && wxKey===R.key) || quiet)) return ok; }", "if(ok!=='late') return ok; }")],
  ['c1-fredagain', 'motion', s => rep(s, '  wxDress(W, true); } /* in place:', "  W.querySelectorAll(':scope>.rwx-fred').forEach(x=>{ fwMount(x, ''); x.remove(); }); wxDress(W, true); } /* in place:")],
  ['c1-crewredo', 'motion', s => rep(s, "if(U.dataset.k!==k){ U.querySelectorAll('.crew-a').forEach(a=>fwMount(a, ''));", "if(true){ U.querySelectorAll('.crew-a').forEach(a=>fwMount(a, ''));")],
  ['c1-namebreak', 'names', s => rep(s, '.crew-n{display:block;max-width:100%;', '.crew-n{display:block;width:0;min-width:100%;')],
  ['c1-runsky', 'theme', s => rep(s, 'html.run-theme .rwx-bg{background:linear-gradient(180deg,color-mix(', 'html.run-theme #results .rwx-bg,html.run-theme #runResults .rwx-bg{background:linear-gradient(180deg,color-mix(')],
  ['c1-note', 'looks,nofc', s => rep(s, `g.innerHTML='<p class="pvs-l" id="planSkyL"></p>';`, `g.innerHTML='<p class="pvs-l" id="planSkyL"></p><p class="rwx-note">Updated every hour from Open-Meteo</p>';`)],
  ['c1-edge', 'place', s => rep(s, '#planSky{margin:0;min-height:calc(var(--wxf) * 1.3);padding:14px 16px;border:var(--ol) solid var(--chip-line);', '#planSky{margin:0;min-height:calc(var(--wxf) * 1.3);padding:14px 16px;border:var(--ol) solid var(--red);')],
  ['c1-printfeather', 'media', s => rep(s, '.r-wx .rwx-note,.r-wx .pvs-l{text-shadow:none!important}', '.r-wx .rwx-note{text-shadow:none!important}')],
  ['c1-printroom', 'media', s => rep(s, ' #planSky .pvs-l::before{display:none} }', ' }')],
  ['c1-daystale', 'crew', s => rep(rep(s, "if(document.visibilityState==='visible'){ skySoon(); crewSoon(); } });", "if(document.visibilityState==='visible'){ skySoon(); } });"), 'onAppOpen(crewSoon); skySoon(); crewSoon();', 'skySoon(); crewSoon();')],
];
const pick = (process.argv[2] || '').split(',').filter(Boolean), out = path.join(BASE, 'w', 'mut100.log'); fs.mkdirSync(path.dirname(out), { recursive: true });
for (const [name, only, f] of M) {
  if (pick.length && !pick.includes(name)) continue;
  const dir = path.join(BASE, 'mut100-' + name); fs.mkdirSync(dir, { recursive: true });
  let t; try { t = f(src); } catch (e) { fs.appendFileSync(out, name + ': BUILD ' + e.message + '\n'); console.log(name, 'BUILD', e.message); continue; }
  fs.writeFileSync(path.join(dir, 'null.html'), t); fs.writeFileSync(path.join(dir, 'sw.js'), sw);
  if (process.env.DRY) { console.log(name, 'built'); continue; }
  let log = ''; try { log = execFileSync('perl', ['../tools/timeout.pl', '900', process.execPath, 'q100.test.mjs', path.join(dir, 'null.html'), MAIN], { cwd: KIT, env: Object.assign({}, process.env, { Q100_ONLY: only }), encoding: 'utf8', maxBuffer: 64e6 }); } catch (e) { log = (e.stdout || '') + (e.stderr || ''); }
  fs.writeFileSync(path.join(dir, 'q100.log'), log);
  const last = log.trim().split('\n').pop(), fails = log.split('\n').filter(l => /^\s+FAIL /.test(l)).map(l => l.trim().slice(0, 160));
  const line = name + ' (' + only + '): ' + last + (fails.length ? ' | ' + fails.slice(0, 2).join(' | ') : '');
  fs.appendFileSync(out, line + '\n'); console.log(line);
}
