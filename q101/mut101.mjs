// item 101's mutants: each a copy of the item page with one change, in <BASE>/mut101-<name>/ (null.html and sw.js); q101 runs the sections
// that guard it (Q101_ONLY) and must end FAIL. node mut101.mjs [name,name]  -> <BASE>/w/mut101.log (one line per mutant)
// MUT_SRC (default fred101/null.html, q101-holidays) and MUT_BASE (default probe101) override the paths (the Mac Studio's fuel-work folders).
// DRY=1 only builds them.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const SRC = process.env.MUT_SRC || '/Users/markmccabe/code/fuel-work/fred101/null.html', BASE = process.env.MUT_BASE || '/Users/markmccabe/code/fuel-work/probe101';
const KIT = path.dirname(new URL(import.meta.url).pathname), MAIN = process.env.MUT_MAIN || '/Users/markmccabe/code/fuel-work/fred/null.html';
const src = fs.readFileSync(SRC, 'utf8'), sw = fs.readFileSync(path.join(path.dirname(SRC), 'sw.js'), 'utf8');
const rep = (s, a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error('mutant: ' + JSON.stringify(a.slice(0, 80)) + ' found ' + n + ' times'); return s.replace(a, () => b); };
const css = (s, rules) => rep(s, '/* }} q101 holidays */', rules + '\n/* }} q101 holidays */');
const BD = "  const bd=/^\\d{4}-(\\d{2}-\\d{2})$/.exec(o.birthday||''); if(bd && (bd[1]===md || bd[1]==='02-29' && md==='02-28' && !holLeap(y))) return look('birthday');\n";
const RACE = "  const mem=holNth(y,5,1,-1); if((o.races||[]).some(r=>r && r.date===iso) && !(holAdd(mem,-2)<=iso && iso<=mem)) return look('race-day');";
const SPAN = '(Date.parse(a.b)-Date.parse(a.a))-(Date.parse(b.b)-Date.parse(b.a))';
const M = [
  // the cache
  ['cache', 'cache', s => rep(s, "const APP_BUILD='fred-shell-v125';", "const APP_BUILD='fred-shell-v124';")],
  // 101.1: the dates
  ['eve15', 'dates', s => rep(s, 'const HOL_EVE=16;', 'const HOL_EVE=15;')],
  ['noeve', 'dates,midnight', s => rep(s, " || s.id==='hanukkah' && eve && s.a===nx)", ')')],
  ['hanu7', 'dates', s => rep(s, "S.push(['hanukkah',s,holAdd(s,7)])", "S.push(['hanukkah',s,holAdd(s,6)])")],
  ['easter', 'dates', s => rep(s, 'return holI(holD(y, Math.floor(n/31), n%31+1)); }', 'return holI(holD(y, Math.floor(n/31), n%31+2)); }')],
  ['springsun', 'dates', s => rep(s, "['spring',holAdd(e,-1),e]", "['spring',e]")],
  ['memfourth', 'dates', s => rep(s, "['memorial-day',holNth(y,5,1,-1)]", "['memorial-day',holNth(y,5,1,4)]")],
  ['bike2', 'dates', s => rep(s, "['bike-to-work',holNth(y,5,5,3)]", "['bike-to-work',holNth(y,5,5,2)]")],
  ['runtue', 'dates', s => rep(s, "['running-day',holNth(y,6,3,1)]", "['running-day',holNth(y,6,2,1)]")],
  ['thankslast', 'dates', s => rep(s, "['thanksgiving',holNth(y,11,4,4)]", "['thanksgiving',holNth(y,11,4,-1)]")],
  ['labor2', 'dates', s => rep(s, "['labor-day',holNth(y,9,1,1)]", "['labor-day',holNth(y,9,1,2)]")],
  ['tour21', 'dates', s => rep(s, 'tr ? tr[1] : holAdd(t0,22)]', 'tr ? tr[1] : holAdd(t0,21)]')],
  ['tournotab', 'dates', s => rep(s, 'tr=T.tour.find(r=>+r[0].slice(0,4)===y)', 'tr=null')],
  ['diwaliindia', 'dates', s => rep(s, "diwali:['2026-11-08','2027-10-28',", "diwali:['2026-11-08','2027-10-29',")],
  ['fitronly', 'dates', s => rep(s, "eid:['2026-03-20','2026-05-27','2027-03-09','2027-05-16','2028-02-26','2028-05-05','2029-02-14','2029-04-24','2030-02-04','2030-04-13','2031-01-24','2031-04-02']", "eid:['2026-03-20','2027-03-09','2028-02-26','2029-02-14','2030-02-04','2031-01-24']")],
  ['lnyicu', 'dates', s => rep(s, "'lunar-new-year':['2026-02-17','2027-02-06',", "'lunar-new-year':['2026-02-17','2027-02-07',")],
  ['thru', 'dates', s => rep(s, "const HOL_THRU='2031-12-31';", "const HOL_THRU='2027-06-30';")],
  ['newyear1', 'dates', s => rep(s, "['new-year',on(12,31),(y+1)+'-01-01']", "['new-year',on(12,31)]")],
  ['winter25', 'dates', s => rep(s, "['winter',on(12,20),on(12,26)]", "['winter',on(12,20),on(12,25)]")],
  // 101.2: the order and the ties
  ['tielong', 'overlap', s => rep(s, SPAN, '(Date.parse(b.b)-Date.parse(b.a))-(Date.parse(a.b)-Date.parse(a.a))')],
  ['careafter', 'order', s => rep(rep(s, '  if(care) return look(care.id);\n', ''), 'const k=holKitty(t, o); if(k) return k;', 'const k=holKitty(t, o); if(k) return k; if(care) return look(care.id);')],
  ['racefirst', 'order', s => rep(rep(s, BD, ''), RACE, RACE + '\n' + BD.trimEnd())],
  ['memweekend', 'order', s => rep(s, ' && !(holAdd(mem,-2)<=iso && iso<=mem)', '')],
  ['memsun', 'order', s => rep(s, '!(holAdd(mem,-2)<=iso && iso<=mem)', '!(holAdd(mem,-1)<=iso && iso<=mem)')],
  ['kittylast', 'order', s => rep(rep(s, '  const k=holKitty(t, o); if(k) return k;\n', ''), 'return oth ? look(oth.id) : null; }', 'return oth ? look(oth.id) : holKitty(t, o); }')],
  // 101.4: the birthday
  ['feb29mar1', 'birthday', s => rep(s, "bd[1]==='02-29' && md==='02-28' && !holLeap(y)", "bd[1]==='02-29' && md==='03-01' && !holLeap(y)")],
  ['feb29leap', 'birthday', s => rep(s, "bd[1]==='02-29' && md==='02-28' && !holLeap(y)", "bd[1]==='02-29' && md==='02-28'")],
  ['bdyear', 'birthday', s => rep(s, 'if(bd && (bd[1]===md ||', 'if(bd && (o.birthday===iso ||')],
  // race day
  ['racenone', 'raceday,order', s => rep(s, 'try{ R=races; }catch(e){}', '')],
  ['racesoon', 'birthday,raceday', s => rep(s, 'function renderRaces(){ holSoon(); /* q101: a race today is the race-day look */ ', 'function renderRaces(){ ')],
  // 101.3: the look on every fred spot
  ['weatherwear', 'looks', s => rep(s, 'draw=L ? ()=>F.bird(Object.assign({wear:L.wear.slice(), champ:L.champ}, L.col)) :', 'draw=L ? ()=>F.bird({wear:F.WX_WEAR[k]}) :')],
  ['nocol', 'looks,order', s => rep(s, 'F.bird(Object.assign({wear:L.wear.slice(), champ:L.champ}, L.col))', 'F.bird(Object.assign({wear:L.wear.slice(), champ:L.champ}))')],
  ['samekey', 'looks,midnight', s => rep(s, "key='wx:'+id,", "key='wx:'+k,")],
  ['nocap', 'looks', s => rep(s, 'L=k ? holCur() : null,', "L=k && k!=='clouds' ? holCur() : null,")],
  ['nightmove', 'looks', s => rep(s, "{cls:'fw-bird', still:k==='night'}", "{cls:'fw-bird', still:false}")],
  ['holsky', 'looks', s => rep(s, "wxSkySet(W, g && g.dataset.sky || '', morph); wxFred(W, morph);", "wxSkySet(W, g && !holCur() && g.dataset.sky || '', morph); wxFred(W, morph);")],
  ['boxonly', 'looks', s => rep(s, 'L=k ? holCur() : null,', "L=k && W.id==='planSky' ? holCur() : null,")],
  // 101.5: the line
  ['happymem', 'line', s => rep(s, "'memorial-day':'Memorial Day',", "'memorial-day':'Happy Memorial Day',")],
  ['linehidden', 'line', s => rep(s, "P=document.createElement('p'); P.className=box ? 'pvs-h' : 'rwx-hol';", "P=document.createElement('p'); P.setAttribute('aria-hidden','true'); P.className=box ? 'pvs-h' : 'rwx-hol';")],
  ['explain', 'line', s => rep(s, "diwali:'Happy Diwali',", "diwali:'Happy Diwali · fred lights a diya',")],
  ['cardnoline', 'looks,line', s => rep(s, '.r-wx[data-look] .rwx-hol{display:block}', '.r-wx[data-look] .rwx-hol{display:none}')],
  ['boxnoline', 'looks,line', s => css(s, '#planSky .pvs-h{display:none}')],
  // the date: midnight, Hanukkah's eve, the app back in front; fred drawn again only when the look changes
  ['noarm', 'midnight', s => rep(s, 'holArm.t=setTimeout(holTick, Math.min(a-n+250, 864e5)); }', '}')],
  ['novis', 'midnight', s => rep(s, "document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') holSoon(); }); onAppOpen(holSoon);", 'onAppOpen(holSoon);')],
  ['redraw', 'midnight,motion', s => rep(s, "if(HOLC && HOLC.k===k) return; HOLC={k, L}; ['planSky','rWeather','runWx'].forEach(id=>{ const W=$(id); if(W && W.querySelector(':scope>.rwx-g')) wxFred(W, true); }); }",
    "HOLC={k, L}; ['planSky','rWeather','runWx'].forEach(id=>{ const W=$(id); if(W && W.querySelector(':scope>.rwx-g')){ W.querySelectorAll(':scope>.rwx-fred').forEach(x=>{ fwMount(x, ''); x.remove(); }); wxFred(W, true); } }); }")],
  // 101.6: the switches
  ['defstore', 'switch', s => rep(s, 'const DEFAULT_SETTINGS = {', 'const DEFAULT_SETTINGS = {holidayLooks:true, ')],
  ['caremem', 'switch', s => rep(s, "const HOL_FAITH=['hanukkah','diwali','lunar-new-year','eid'];", "const HOL_FAITH=['hanukkah','diwali','lunar-new-year','eid','memorial-day'];")],
  ['carekeep', 'switch,sync,backup', s => rep(s, 'care:settings.holidayCare!==false,', 'care:true,')],
  ['looksoff', 'switch', s => rep(s, 'if(!o || o.looks===false || !(F && F.HOLIDAYS)) return null;', 'if(!o || !(F && F.HOLIDAYS)) return null;')],
  ['swpaint', 'switch,sync', s => rep(s, "['worldMotion','crewShow','holidayLooks','holidayCare'].includes(k) ? settings[k]!==false", "['worldMotion','crewShow'].includes(k) ? settings[k]!==false")],
  /* the settings shown again (renderProfileRows) and the Races code's redraw (renderRaces, which a sync's settings or races and a restore
     run too) each ask for the look: one alone is covered by the other (an equivalent mutant on its own), so both go */
  ['syncsoon2', 'sync,backup', s => rep(rep(s, 'fwGate(); crewSoon(); holSoon(); /* item 97:', 'fwGate(); crewSoon(); /* item 97:'), 'function renderRaces(){ holSoon(); /* q101: a race today is the race-day look */ ', 'function renderRaces(){ ')],
  ['oldbackup', 'backup', s => rep(s, ', holidayLooks:settings.holidayLooks, holidayCare:settings.holidayCare};', '};')],
  // print and forced colours
  ['printline', 'media', s => rep(s, '@media print{ .r-wx .rwx-hol{display:block!important;padding-right:0;text-align:left} }', '@media print{ .r-wx .rwx-hol,#planSky .pvs-h{display:none!important} }')],
  ['printshadow', 'media', s => rep(s, '.r-wx .pvs-l,.r-wx .pvs-h,.r-wx .rwx-hol{text-shadow:none!important}', '.r-wx .pvs-l{text-shadow:none!important}')],
  ['forcedline', 'media', s => css(s, '@media (forced-colors:active){ #planSky .pvs-h,.r-wx .rwx-hol{display:none!important} }')],
  // the fit: 320 / 375 / 390 px at 150% and 200% text, the card
  ['linenowrap', 'fit', s => rep(s, '#planSky .pvs-h{margin:6px 0 0;', '#planSky .pvs-h{margin:6px 0 0;white-space:nowrap;')],
  ['lineunder', 'fit', s => rep(s, '#planSky .pvs-h{margin:6px 0 0;', '#planSky .pvs-h{margin:6px -96px 0 0;')],
  ['cardall', 'fit', s => rep(s, '.rwx-hol{display:none;margin:6px 0 0;', '.rwx-hol{display:block;margin:6px 0 0;')],
  ['cardup', 'fit', s => rep(s, '.rwx-hol{display:none;margin:6px 0 0;', '.rwx-hol{display:none;margin:-64px 0 0;')],
  // the run's graphite
  ['runfeather', 'theme', s => rep(s, ',html.run-theme .r-wx:is([data-sky],[data-sky-out]) .pvs-h,html.run-theme .r-wx:is([data-sky],[data-sky-out]) .rwx-hol', '')],
  ['rungrey', 'theme', s => css(s, 'html.run-theme #planSky .pvs-h,html.run-theme .rwx-hol{color:#5A5A64}')],
  // motion
  ['holstill', 'motion', s => rep(s, "{cls:'fw-bird', still:k==='night'}", "{cls:'fw-bird', still:true}")],
  // the computer layout
  ['deskline', 'desk', s => css(s, 'html.dk #planSky .pvs-h,html.dk .rwx-hol{display:none!important}')],
];
const pick = (process.argv[2] || '').split(',').filter(Boolean), out = path.join(BASE, 'w', 'mut101.log'); fs.mkdirSync(path.dirname(out), { recursive: true });
for (const [name, only, f] of M) {
  if (pick.length && !pick.includes(name)) continue;
  const dir = path.join(BASE, 'mut101-' + name); fs.mkdirSync(dir, { recursive: true });
  let t; try { t = f(src); } catch (e) { fs.appendFileSync(out, name + ': BUILD ' + e.message + '\n'); console.log(name, 'BUILD', e.message); continue; }
  fs.writeFileSync(path.join(dir, 'null.html'), t); fs.writeFileSync(path.join(dir, 'sw.js'), sw);
  if (process.env.DRY) { console.log(name, 'built'); continue; }
  let log = ''; try { log = execFileSync('perl', ['../tools/timeout.pl', '900', process.execPath, 'q101.test.mjs', path.join(dir, 'null.html'), MAIN], { cwd: KIT, env: Object.assign({}, process.env, { Q101_ONLY: only }), encoding: 'utf8', maxBuffer: 64e6 }); } catch (e) { log = (e.stdout || '') + (e.stderr || ''); }
  fs.writeFileSync(path.join(dir, 'q101.log'), log);
  const last = log.trim().split('\n').pop(), fails = log.split('\n').filter(l => /^\s+FAIL /.test(l)).map(l => l.trim().slice(0, 160));
  const line = name + ' (' + only + '): ' + last + (fails.length ? ' | ' + fails.slice(0, 2).join(' | ') : '');
  fs.appendFileSync(out, line + '\n'); console.log(line);
}
