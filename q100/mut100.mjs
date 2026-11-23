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
const R7_ARIA = "  if(names){ U.removeAttribute('aria-hidden'); U.setAttribute('aria-label', 'The crew'); } else { U.setAttribute('aria-hidden', 'true'); U.removeAttribute('aria-label'); }\n";
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
  ['explain', 'looks,nofc', s => rep(s, "line=G.map((g,j)=>", "line='fred is dressed for it · '+G.map((g,j)=>")],
  ['nofred', 'once', s => rep(s, '#planSky>.rwx-fred{display:block}', '')],
  ['tight', 'fit', s => rep(s, "#planSky .pvs-l::before{content:'';float:right;", "#planSky .pvs-l::before{content:none;float:right;")],
  // 100.2: no forecast, the lookup
  ['capnight', 'nofc', s => rep(s, ": 'clouds', st=R ? R.start", ": 'night', st=R ? R.start")],
  ['stale', 'nofc', s => rep(s, '&& !w.stale && !w.typical && !wxOld()){', '&& !w.typical && !wxOld()){')],
  ['offline', 'nofc', s => rep(s, " || navigator.onLine===false) return; /* Plan open and showing; offline: no lookup */", ") return;")],
  ['storm', 'fetch', s => rep(s, 'if(Date.now()-(T[R.key]||0)<SKY_RETRY) return; ', '')],
  ['hourold', 'fetch', s => rep(s, "(wxAccepted && wxKey===R.key && !wxOld() && wxLast && !wxLast.stale && !wxLast.typical) || skyKept(R)) return; /* no ride,", "(wxAccepted && wxKey===R.key && wxLast && !wxLast.stale && !wxLast.typical) || skyKept(R)) return; /* no ride,")],
  ['nobusy', 'fetch', s => rep(s, 'if(wxBusy && wxBusy.key===R.key){', 'if(false){')],
  // 100.3: after Crunch, the computer layout
  ['boxstays', 'once,desk', s => rep(s, 'function skyShown(){ ', 'function skyShown(){ return false; ')],
  ['dk', 'desk', s => rep(s, 'html.dk #planCrew,html.run-theme #planCrew{display:none!important}', 'html.run-theme #planCrew{display:none!important}')],
  // 100.4: the crew
  ['step3', 'crew', s => rep(s, 's=((day*5)%n+n)%n;', 's=((day*3)%n+n)%n;')],
  ['robs', 'crew', s => rep(s, 'return [0,1,2,3,4].map(k=>(s+k)%n); }', 'return [0,1,2,3,8].map(k=>(s+k)%n); }')],
  ['utcday', 'crew', s => rep(s, 'function crewDay(d=new Date()){ return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())/864e5); }', 'function crewDay(d=new Date()){ return Math.floor(d.getTime()/864e5); }')],
  ['equal', 'crew', s => rep(s, '.crew-a{position:relative;width:min(calc((100vw - 65px) * var(--bw,1) / var(--sw,5)), calc(76px * var(--bw,1)));width:min(calc((100cqw - 33px) * var(--bw,1) / var(--sw,5)), calc(76px * var(--bw,1)));', '.crew-a{position:relative;width:min(calc((100vw - 65px) / var(--sw,5)), 76px);width:min(calc((100cqw - 33px) / var(--sw,5)), 76px);')],
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
  ['print', 'media', s => rep(s, '@media print{ #planCrew{display:none!important} #planSky{min-height:0!important}', '@media print{ #planSky{min-height:0!important}')],
  ['forced', 'media', s => rep(s, ' #planCrew .crew-a{display:none!important} }', ' }')],
  ['forcedsky', 'media', s => rep(s, '#planSky>.rwx-scene,#planSky>.rwx-fog{display:none!important} ', '')],
  // check round 1: the problems the checkers found, each as the build had it (or as their mutant), and the checks that now catch it
  ['c1-keep', 'keep', s => rep(s, 'SKY_KEPT.set(R.key, w); ', '')], /* the box keeps no copy: a reset ride or a day come back to loses its sky (a new lookup at best) */
  ['c1-offline', 'keep', s => rep(s, 'if(!R || navigator.onLine===false) return null;', 'if(!R) return null;')], /* offline after a live forecast: still the sky and number */
  ['c1-race', 'race', s => rep(s, 'const gone=()=>quiet && (wxLatest!==own || (wxReq()||{}).key!==key);', 'const gone=()=>false;')], /* the box's late lookup writes the shared forecast */
  ['c1-hang', 'race', s => rep(s, '(quiet ? b.p : Promise.race([b.p, wxHung(b, Date.now())]))', '(b.p)')], /* Crunch waits on a hung lookup */
  ['c1-slowchange', 'race', s => rep(s, 'if(ok===null) delete T[R.key]; skySoon(); });', 'if(ok===null) delete T[R.key]; skyBoxRender(); });')], /* the ride changed meanwhile: no lookup of it */
  ['c1-overtaken', 'race', s => rep(s, 'if(ok===null) delete T[R.key]; skySoon(); });', 'skySoon(); });')], /* an overtaken try kept for 10 minutes: back to that ride, the cap */
  ['c1-backup', 'backup', s => rep(s, "  Object.keys(pcw).forEach(k=>{ if(!(d.settings && k in d.settings)){ if(pcw[k]!==undefined) settings[k]=pcw[k]; else delete settings[k]; } });", '')], /* an old backup wipes the switches */
  ['c1-split', 'fit', s => rep(s, '#planSky .pvs-p{display:inline-block;max-width:100%}', '')], /* a long place breaks mid-word beside fred */
  ['c1-room0', 'room', s => rep(s, 'const CREW_ROOM=8;', 'const CREW_ROOM=0;')],
  ['c1-nofoot', 'room', s => css(s, '#view-plan>.fredfoot{display:none!important}')],
  ['c1-typical', 'nofc', s => rep(rep(s, 'if(!R || R.ahead>10 || (wxAccepted', 'if(!R || (wxAccepted'), '&& !w.stale && !w.typical && !wxOld()){', '&& !w.stale && !wxOld()){')],
  ['c1-sheetopen', 'fetch', s => rep(s, " || $('planSheet').classList.contains('open') || document.visibilityState", " || document.visibilityState")],
  ['c1-crunchnote', 'fetch', s => rep(s, "if(ok!=='late' && ((ok && wxKey===R.key) || quiet)) return ok;\n", "if(ok!=='late') return ok;\n")],
  ['c1-fredagain', 'motion', s => rep(s, '  wxDress(W, true); } /* in place:', "  W.querySelectorAll(':scope>.rwx-fred').forEach(x=>{ fwMount(x, ''); x.remove(); }); wxDress(W, true); } /* in place:")],
  ['c1-crewredo', 'motion', s => rep(s, "if(U.dataset.k!==k){ U.querySelectorAll('.crew-a').forEach(a=>fwMount(a, ''));", "if(true){ U.querySelectorAll('.crew-a').forEach(a=>fwMount(a, ''));")],
  ['c1-namebreak', 'names', s => rep(s, '.crew-n{display:block;max-width:100%;', '.crew-n{display:block;width:0;min-width:100%;')],
  ['c1-runsky', 'theme', s => rep(s, 'html.run-theme .rwx-bg{background:linear-gradient(180deg,color-mix(', 'html.run-theme #results .rwx-bg,html.run-theme #runResults .rwx-bg{background:linear-gradient(180deg,color-mix(')],
  ['c1-note', 'looks,nofc', s => rep(s, `g.innerHTML='<p class="pvs-l" id="planSkyL"></p>';`, `g.innerHTML='<p class="pvs-l" id="planSkyL"></p><p class="rwx-note">Updated every hour from Open-Meteo</p>';`)],
  ['c1-edge', 'place', s => rep(s, '#planSky{margin:0;min-height:calc(var(--wxf) * 1.3);padding:14px 16px;border:var(--ol) solid var(--chip-line);', '#planSky{margin:0;min-height:calc(var(--wxf) * 1.3);padding:14px 16px;border:var(--ol) solid var(--red);')],
  ['c1-printfeather', 'media', s => rep(s, '.r-wx .rwx-note,.r-wx .pvs-l{text-shadow:none!important}', '.r-wx .rwx-note{text-shadow:none!important}')],
  ['c1-printroom', 'media', s => rep(s, ' #planSky .pvs-l::before{display:none} }', ' }')],
  ['c1-daystale', 'crew', s => rep(rep(s, "if(document.visibilityState==='visible'){ skySoon(); crewSoon(); } });", "if(document.visibilityState==='visible'){ skySoon(); } });"), 'onAppOpen(crewSoon); skySoon(); crewSoon();', 'skySoon(); crewSoon();')],
  // check round 2: the problems the checkers found, each as round 1 had it (app) or as their mutant (tests), and the checks that now catch it
  ['c2-words', 'fit', s => rep(s, "const G=[T, PW].filter(g=>g.length), line=G.map((g,j)=>g.map((s,k)=>`<span class=\"pvs-p\">${s}${k===g.length-1 && (j<G.length-1 || num) ? '\\u00a0·' : ''}</span>`).join(' ')).join(' ')+(num ? (G.length ? ' ' : '')+num : '');", "const line=[T.join(' '), pl && `<span class=\"pvs-p\">${esc(pl)}</span>`].filter(Boolean).join(' · ')+(num ? ' · '+num : '');")], /* the place one piece: a band left empty beside fred, a row starting with the dot */
  ['c2-dot', 'fit', s => rep(s, "${s}${k===g.length-1 && (j<G.length-1 || num) ? '\\u00a0·' : ''}</span>`", "${s}</span>${k===g.length-1 && (j<G.length-1 || num) ? '\\u00a0·' : ''}`")], /* per word, but each dot outside its piece: it can start a row (Chrome breaks after an inline-block) */
  ['c2-crewcap', 'room', s => rep(s, '.crew-a{position:relative;width:min(calc((100vw - 65px) * var(--bw,1) / var(--sw,5)), calc(76px * var(--bw,1)));width:min(calc((100cqw - 33px) * var(--bw,1) / var(--sw,5)), calc(76px * var(--bw,1)));', '.crew-a{position:relative;width:calc((100vw - 65px) * var(--bw,1) / var(--sw,5));width:calc((100cqw - 33px) * var(--bw,1) / var(--sw,5));')], /* no size cap: friends twice fred's size on a tablet */
  ['c2-printh', 'media', s => rep(s, ' #planSky{min-height:0!important} #planSky .pvs-l::before', ' #planSky .pvs-l::before')], /* print keeps fred's height: a mostly empty panel */
  ['c2-stale', 'nofc,keep', s => rep(s, 'if(quiet) return false; /* q100: the box', '/* q100: the box')], /* the box's failed lookup takes the saved copy in: Crunch then makes no request, the box the cap for the hour */
  ['c2-nwsbound', 'fetch', s => rep(s, 'const r=await fetch(url,{signal:ctl.signal});', 'const r=await fetch(url);')], /* weather.gov unbounded: it sets the lookup's length */
  ['c2-wait4', 'fetch', s => rep(s, 'const k=()=>{ if(b.fc) return; const w=', 'const k=()=>{ const w=')], /* Crunch drops the box's lookup at 4 s even with its forecast in: a second lookup, slower than main */
  ['c2-latedrop', 'race', s => rep(s, 'const gone=()=>quiet && (wxLatest!==own ||', 'const gone=()=>quiet && (wxBusy!==own ||')], /* the box's late answer dropped though the ride is the same and nothing took over */
  ['c2-hourlive', 'nofc', s => rep(s, '&& !w.stale && !w.typical && !wxOld()){', '&& !w.stale && !w.typical){')], /* an hour-old forecast shown as live while its new lookup fails */
  ['c2-zline', 'looks,theme', s => rep(s, '.r-wx .rwx-tile>*,.r-wx .pvs-l{position:relative;z-index:3}', '.r-wx .rwx-tile>*{position:relative;z-index:3}')],
  ['c2-quietout', 'fetch,race', s => rep(s, "out=quiet ? document.createElement('div') : $('wxOut');", "out=$('wxOut');")],
  ['c2-quietms', 'race', s => rep(s, 'const WX_QUIET_MS=15e3, WX_WAIT_MS=4e3;', 'const WX_QUIET_MS=6e5, WX_WAIT_MS=4e3;')],
  ['c2-skystill', 'looks', s => css(s, '#planSky>.rwx-scene *{animation:none!important}')],
  ['c2-wait65', 'race', s => rep(s, 'const WX_QUIET_MS=15e3, WX_WAIT_MS=4e3;', 'const WX_QUIET_MS=15e3, WX_WAIT_MS=6.5e3;')],
  ['c2-runorder', 'place,theme', s => css(s, 'html.run-theme #planSky{order:9}')],
  ['c2-label', 'names', s => rep(s, "U.setAttribute('aria-label', 'The crew');", '')],
  ['c2-ariaart', 'names', s => rep(s, "a, ()=>F.friend(i, {idp:'cw'+i+'-'}), 'crew:'+i, {cls:'fw-vm0'});", "a, ()=>F.friend(i, {idp:'cw'+i+'-'}), 'crew:'+i, {cls:'fw-vm0'}); a.removeAttribute('aria-hidden');")],
  ['c2-caps', 'looks', s => rep(s, 'letter-spacing:.07em;text-transform:uppercase;color:var(--text-body);overflow-wrap:anywhere}', 'letter-spacing:.07em;color:var(--text-body);overflow-wrap:anywhere}')],
  // review round 3: the app problems as the branch had them, and the reviewers' test mutants
  ['r3-savedbox', 'keep', s => rep(s, '(wxAccepted && wxKey===R.key && !wxOld() && wxLast && !wxLast.stale && !wxLast.typical) || skyKept(R)) return;', '(wxAccepted && wxKey===R.key && !wxOld()) || skyKept(R)) return;')], /* the box counts a saved copy Crunch fell back on as in hand: the cap for the rest of its hour, the network back */
  ['r3-savedfw', 'keep', s => rep(s, 'if(wxAccepted && wxKey===R.key && !wxOld() && !((quiet || (wxBusy && wxBusy.key===R.key)) && wxLast && (wxLast.stale || wxLast.typical))) return true;', 'if(wxAccepted && wxKey===R.key && !wxOld()) return true;')], /* the box asks, but fetchWeather answers it from the saved copy with no request */
  ['r3-label', 'theme', s => rep(s, "const sk=$('planSky'); if(sk) sk.setAttribute('aria-label', run ? 'Run forecast' : 'Ride forecast');", '')], /* the box announced as the ride forecast on the run */
  ['r3-linehtml', 'fetch', s => rep(s, 'if(P._l!==line){ P._l=line; P.innerHTML=line; }', 'if(P.innerHTML!==line) P.innerHTML=line;')], /* the guard against innerHTML (&nbsp;): every render replaces the line */
  ['r3-bkshow', 'backup', s => rep(s, 'Object.keys(pcw).forEach(k=>{ if(!(d.settings && k in d.settings))', "Object.keys(pcw).forEach(k=>{ if(k==='crewShow' || !(d.settings && k in d.settings))")], /* a restore keeps this device's crewShow over the file's */
  ['r3-bknames', 'backup', s => rep(s, 'Object.keys(pcw).forEach(k=>{ if(!(d.settings && k in d.settings))', "Object.keys(pcw).forEach(k=>{ if(k==='crewNames' || !(d.settings && k in d.settings))")], /* the same for crewNames */
  ['r3-retry60', 'fetch', s => rep(s, 'const SKY_RETRY=10*60e3,', 'const SKY_RETRY=60e3,')], /* the box tries a failed ride again after a minute */
  ['r3-retry9', 'fetch', s => rep(s, 'const SKY_RETRY=10*60e3,', 'const SKY_RETRY=9*60e3,')], /* ... after 9 minutes */
  ['r3-quiet6', 'fetch,race', s => rep(s, 'const WX_QUIET_MS=15e3, WX_WAIT_MS=4e3;', 'const WX_QUIET_MS=6e3, WX_WAIT_MS=4e3;')], /* the box gives up before weather.gov's 8 s: a Crunch then makes a second lookup */
  ['r3-quiet12', 'race', s => rep(s, 'const WX_QUIET_MS=15e3, WX_WAIT_MS=4e3;', 'const WX_QUIET_MS=12e3, WX_WAIT_MS=4e3;')], /* ... at 12 s (only the give-up's own timing shows it) */
  ['r3-nws10', 'fetch', s => rep(s, 'tm=setTimeout(()=>ctl.abort(), 8000); /* q100: 8 s', 'tm=setTimeout(()=>ctl.abort(), 10000); /* q100: 8 s')], /* weather.gov given 10 s */
  ['r3-nws65', 'fetch', s => rep(s, 'tm=setTimeout(()=>ctl.abort(), 8000); /* q100: 8 s', 'tm=setTimeout(()=>ctl.abort(), 6500); /* q100: 8 s')], /* weather.gov given 6.5 s */
  ['r3-namesredo', 'motion,sync', s => rep(s, "const ids=crewOf(crewDay()), k=ids.join(','), names=settings.crewNames===true;", "const names=settings.crewNames===true, ids=crewOf(crewDay()), k=ids.join(',')+(names ? '+n' : '');")], /* a names change remounts the five: they move again */
  ['r3-priv320', 'room', s => css(s, '@media (max-width:340px){ #view-plan>.fredfoot>.privlink{display:none!important} }')], /* Privacy gone at 320 px */
  ['r3-privcover', 'room,sync', s => css(s, '#view-plan>.fredfoot:has(>.privlink:not([hidden]))+#planCrew{margin-top:-44px;position:relative;z-index:50}')], /* the crew over Privacy where sign-in is configured */
  // review round 4: the app problems as the branch had them, and the units gap in the test
  ['rv4-land', 'land', s => rep(rep(rep(s, "hides the ride's */ skySync(); /* q100 */ planBarRender();", "hides the ride's */ planBarRender();"), 'el.hidden=false; skySync(); /* q100 */ dayFitRows();', 'el.hidden=false; dayFitRows();'), 'as in render */ skySync(); /* q100 */ updateSummaries();', 'as in render */ updateSummaries();')], /* the box hidden only by the observer, after the results' scroll: WebKit lands 118 px past their top */
  ['rv4-landride', 'land', s => rep(s, "hides the ride's */ skySync(); /* q100 */ planBarRender();", "hides the ride's */ planBarRender();")], /* ... render's alone (the ride, Plan for Clothing) */
  ['rv4-landrun', 'land', s => rep(s, 'el.hidden=false; skySync(); /* q100 */ dayFitRows();', 'el.hidden=false; dayFitRows();')], /* ... runCrunchResult's alone (the run) */
  ['rv4-landwear', 'land', s => rep(s, 'as in render */ skySync(); /* q100 */ updateSummaries();', 'as in render */ updateSummaries();')], /* ... renderClothingOnly's alone (the Clothing-only results) */
  ['rv4-inset', 'room', s => rep(s, 'gap:8px;margin:10px 0 env(safe-area-inset-bottom,0px);padding:0;list-style:none}', 'gap:8px;margin:10px 0 0;padding:0;list-style:none}')], /* no room for the home indicator's inset: the crew always left out on a Face ID iPhone */
  ['rv4-metric', 'looks', s => rep(s, 'deg=w ? tempDisp(tp!=null ? tp : w.air) : null', 'deg=w ? Math.round(tp!=null ? tp : w.air) : null')], /* the box in F whatever the rider's units */
  ['rv4-unitsstale', 'looks', s => rep(s, 'if(P._l!==line){ P._l=line; P.innerHTML=line; }', 'if(P._w!==w){ P._w=w; P._l=line; P.innerHTML=line; }')], /* the line written only for a new forecast: a units change (or a new start time) keeps the old number */
  // review round 5: the box's two triggers held (a test gap: the app was right), and the time broken past 200% text
  ['rv5-visbox', 'fetch', s => rep(s, "if(document.visibilityState==='visible'){ skySoon(); crewSoon(); }", "if(document.visibilityState==='visible'){ crewSoon(); }")], /* the app back in front: the crew's new day only, an hour-old forecast still shown as live */
  ['rv5-onlinerender', 'nofc', s => rep(s, "addEventListener('online', skySoon);", "addEventListener('online', skyBoxRender);")], /* the signal back: a redraw only, the cap kept with no lookup */
  ['rv5-wrap', 'fit', s => rep(s, "const G=[T, PW].filter(g=>g.length), line=G.map((g,j)=>g.map((s,k)=>`<span class=\"pvs-p\">${s}${k===g.length-1 && (j<G.length-1 || num) ? '\\u00a0·' : ''}</span>`).join(' ')).join(' ')+(num ? (G.length ? ' ' : '')+num : '');", "const t=T.join(' '), line=[t, PW.map((s,k)=>`<span class=\"pvs-p\">${s}${num && k===PW.length-1 ? '\\u00a0·' : ''}</span>`).join(' ')].filter(Boolean).join('\\u00a0· ')+(num ? (PW.length ? ' ' : t ? '\\u00a0· ' : '')+num : '');")], /* the bug as it was: the weekday and the time plain text, so the line's overflow-wrap:anywhere breaks them beside fred past 200% text */
  ['rv5-onlinenone', 'nofc', s => rep(s, "addEventListener('online', skySoon);", '')], /* ... no online listener at all */
  // review round 6: the app problems as the branch had them, and the switch gap in the test (the app was right)
  ['r6-slowwait', 'fetch,race', s => rep(s, ' own.at=Date.now(); /* q100: an answer', ' /* q100: an answer')], /* the 4 s counted from the tap alone: a lookup still answering (2.5 s a request) dropped, a second lookup, every request twice */
  ['r6-savedhang', 'keep', s => rep(s, "    if(ok!==null && wxAccepted && wxKey===R.key && !wxOld()){ if(wxBusy===b) wxBusy=null; wxLatest={key:R.key}; return true; } }", '    }')], /* a saved copy in hand ignored after the 4 s: a lookup of its own, hung on a stalled signal */
  ['r6-nameswitch', 'switch,sync,backup', s => rep(s, "['prowBtn-crewshow','crewShow'],['prowBtn-crewnames','crewNames']].forEach", "['prowBtn-crewshow','crewShow']].forEach")], /* "Show their names" never drawn: off on screen and to VoiceOver while the names are on */
  // review round 7: the names list's accessibility gap in the test (the app was right)
  ['r7-namesaria', 'switch,motion,sync,backup', s => rep(rep(s, R7_ARIA, ''), "U.textContent=''; U.dataset.k=k; /* a new day: its five */", "U.textContent=''; U.dataset.k=k; /* a new day: its five */ " + R7_ARIA.trim())], /* the list's aria state set only when the five are built (a new day, the crew on): names turned on by a tap, a sync or a restore show, but the list stays aria-hidden for VoiceOver until a reload (and names off leave it a list of empty items) */
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
