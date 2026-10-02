// Matching items to races and pros by the names in their titles and descriptions, and sorting items into Commentary (about pro racing)
// or Other (category, sub-tag, sports). Plain rules, no model: the same input always gives the same answer.
export const fold = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’‘]/g, "'").toLowerCase();
export const slug = s => fold(s).replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordRe = s => new RegExp(`(^|[^a-z0-9])${esc(fold(s))}($|[^a-z0-9])`);
const DAY = 864e5;
const dnum = d => Math.floor(Date.parse(d + 'T00:00:00Z') / DAY);

// pros: the full name always counts; the family name alone counts only when it belongs to one known pro, is 4+ letters, and is written with a
// capital in the original text (so "berg" in "iceberg" or "Berg" for two Bergs does not match)
export function matchPros(textRaw, pros) {
  const t = fold(textRaw), out = new Set();
  const last = new Map(); for (const p of pros) { const l = fold(p.name).split(' ').slice(-1)[0]; last.set(l, (last.get(l) || 0) + 1); }
  for (const p of pros) {
    if (wordRe(p.name).test(t)) { out.add(p.id); continue; }
    const l = p.name.split(' ').slice(-1)[0];
    if (l.length >= 4 && last.get(fold(l)) === 1 && new RegExp(`(^|[^A-Za-z0-9])${esc(l)}('s)?($|[^A-Za-z0-9])`).test(textRaw)) out.add(p.id);
  }
  return [...out];
}
// races: the race's name, or its place together with its series word ("Northbay" + "T100"), within 21 days before / 10 days after the race
export function matchRaces(textRaw, dateIso, races) {
  const t = fold(textRaw), d = dateIso ? dnum(dateIso.slice(0, 10)) : null, out = [];
  for (const r of races) {
    if (d != null) { const rd = dnum(r.date); if (d < rd - 21 || d > rd + 10) continue; }
    const seriesWord = r.series === '70.3' ? /70\.3/ : r.series === 'WTCS' ? /\bwtcs\b|world triathlon championship series/ : r.series === 'T100' ? /\bt100\b/ : /ironman(?! 70\.3)/;
    if (wordRe(r.name).test(t) || (r.place && wordRe(r.place.split(',')[0]).test(t) && seriesWord.test(t))) out.push(r.id);
  }
  // the place alone ("How Berg won Northbay"): only with a racing word and when one race in the window is there
  if (!out.length && RACE_WORD.test(t)) {
    const hits = races.filter(r => { if (!r.place || r.place.split(',')[0].length < 5) return false; if (d != null) { const rd = dnum(r.date); if (d < rd - 21 || d > rd + 10) return false; } return wordRe(r.place.split(',')[0]).test(t); });
    if (hits.length === 1) out.push(hits[0].id);
  }
  return out;
}
const RACE_WORD = /\b(wins?|won|winner|results?|recap|preview|podium|race|racing|start ?list|picks)\b/;
const PRO_RACING = /\b(pro|pros|elite|wtcs|t100|pto|pro series|kona|nice|world champs?|championships?|podium|wins?|won|victory|results?|recap|preview|start ?list|predictions?|race report|dnf|course record)\b/;
// a series named in the text (for chips when an item matches no race)
export function seriesIn(textRaw) {
  const t = fold(textRaw), s = [];
  if (/\b70\.3\b/.test(t)) s.push('70.3'); if (/\bironman\b(?!\s*70\.3)/.test(t)) s.push('IRONMAN');
  if (/\bt100\b/.test(t)) s.push('T100'); if (/\bwtcs\b|world triathlon championship series/.test(t)) s.push('WTCS');
  return s;
}
// sort one feed item: {section, kind, category, sub, sports, tested, race_ids, pro_ids, series}
export function classify(item, source, {races = [], pros = []} = {}) {
  const textRaw = `${item.title}\n${item.description || ''}`, t = fold(textRaw), title = fold(item.title);
  const race_ids = matchRaces(textRaw, item.published, races), pro_ids = matchPros(textRaw, pros), series = seriesIn(textRaw);
  const podcast = source.kind === 'podcast';
  const canComm = (source.section || []).includes('commentary'), canOther = (source.section || []).includes('other');
  const aboutPro = race_ids.length > 0 || pro_ids.length > 0 || (series.length > 0 && PRO_RACING.test(t));
  // a gear test or buying guide goes to Other even when its text mentions racing (unless it names a race or a pro fred knows)
  const gearTitle = /\b(best .+ (in )?20\d\d|we test|tested|review|first look|buyer'?s guide|deals?)\b/.test(title) && !race_ids.length && !pro_ids.length;
  const section = canComm && (aboutPro || !canOther) && !(gearTitle && canOther) ? 'commentary' : canOther ? 'other' : null;
  const out = {section, race_ids, pro_ids, series};
  if (section === 'commentary') {
    if (podcast) out.kind = 'podcast';
    else {
      const raceDates = races.filter(r => race_ids.includes(r.id)).map(r => r.date);
      const pub = item.published ? item.published.slice(0, 10) : null;
      const before = pub && raceDates.length && raceDates.every(d => pub < d);
      out.kind = /\b(preview|start ?list|predictions?|who to watch|picks|what to expect|how to watch)\b/.test(title) || before ? 'preview'
        : /\b(results?|wins?|won|recap|report|podium|reaction|takeaways|analysis)\b/.test(title) || (pub && raceDates.length) ? 'recap' : 'news';
    }
    return out;
  }
  if (section !== 'other') return out;
  // Other: category (source default, else words), the gear sub-tag, sports, "tested" only when the source used the product
  const cat = gearTitle || /\b(review|first look|hands-on|tested|we test|unboxing|tri-?suits?|kit|sunglasses|bike|wheels?|wetsuit|goggles|watch|gps|power meter|helmet|shoes?|saddle|tyres?|tires?|trainer|gel|drink mix|nutrition product)\b/.test(title) ? 'gear'
    : /\b(training|workout|session|study|research|science|recovery|strength|plan|interval|zone ?2|vo2|lactate|heat)\b/.test(title) ? 'training'
    : /\b(announces?|acquires?|acquisition|partnership|sponsor|registration|entry fees?|prices?|pricing|rules?|qualif(y|ying|ication)|slots?|series|calendar|events?|brand|ceo|layoffs?|launch(es)?)\b/.test(title) ? 'industry' : null;
  out.category = source.category && !(source.category === 'gear' && cat === 'training') ? source.category : cat || (source.sports && source.sports.length === 1 ? (source.sports[0] === 'bike' ? 'cycling' : source.sports[0] === 'run' ? 'running' : 'industry') : 'industry');
  if (out.category === 'gear') out.sub = /\bwheels?\b|\brims?\b/.test(t) ? 'Wheels' : /\b(watch|gps|wearable|heart rate|power meter|head unit|computer|ring)\b/.test(t) ? 'Wearables'
    : /\b(shoes?|super ?shoe|trainers? \(running\))\b/.test(t) ? 'Shoes' : /\b(gel|drink mix|nutrition|carb|sodium|electrolyte)\b/.test(t) ? 'Nutrition'
    : /\b(wetsuit|goggles|swim|pool)\b/.test(t) ? 'Swim' : 'Bikes';
  if (out.category === 'cycling' || out.category === 'running') out.sub = /\b(race|racing|tour|giro|vuelta|worlds?|marathon|championships?)\b/.test(t) ? 'Racing' : undefined;
  if (out.category === 'training') out.sub = /\b(study|research|science)\b/.test(t) ? 'Science' : undefined;
  if (out.category === 'industry') out.sub = /\bqualif|slots?\b/.test(t) ? 'Qualifying' : /\brules?\b/.test(t) ? 'Rules' : /\bprice|pricing|fees?\b/.test(t) ? 'Pricing' : /\bevents?|race|series|calendar\b/.test(t) ? 'Events' : 'Brands';
  if (!out.sub) delete out.sub;
  const sp = new Set(source.sports || []);
  if (/\bgravel\b|\bmtb\b|mountain bike/.test(t)) sp.add('gravel');
  if (/\btriathlon|\btri\b|ironman|70\.3/.test(t)) sp.add('tri');
  if (/\bswim(ming)?\b|\bwetsuit\b|\bpool\b/.test(t) && !/\btriathlon\b/.test(t)) sp.add('swim');
  if (out.category === 'cycling') sp.add('bike'); if (out.category === 'running') sp.add('run');
  // a gear item's sport follows the gear (shoes → run, bikes and wheels → bike, swim kit → swim) when the source covers several sports
  if (out.category === 'gear' && sp.size > 1) { const by = {Shoes: ['run'], Swim: ['swim'], Bikes: ['bike'], Wheels: ['bike']}[out.sub];
    if (by) { const tri = /\btri(athlon)?\b|\bironman\b|70\.3/.test(t) && out.sub !== 'Shoes'; sp.clear(); by.forEach(x => sp.add(x)); if (tri) sp.add('tri'); if (/\bgravel\b/.test(t)) sp.add('gravel'); } }
  out.sports = [...sp].filter(x => ['tri', 'bike', 'run', 'swim', 'gravel'].includes(x)).slice(0, 5);
  out.tested = out.category === 'gear' && /\b(in-depth review|long-term review|review|tested|we tried|hands-on|ride review|run review)\b/.test(title) && !/\bfirst look|announced|unveils?|launch(es|ed)?\b/.test(title);
  return out;
}
// read time: words ÷ 230 (≥ 1 min), or null when the feed gives no text and the article could not be read
export const readMinutes = words => words > 60 ? Math.max(1, Math.round(words / 230)) : null;
