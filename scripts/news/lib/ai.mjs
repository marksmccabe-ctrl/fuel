// Summaries and extraction (News spec p.10–12): Anthropic Messages API, model claude-haiku-4-5-20251001, temperature 0, key from the
// ANTHROPIC_API_KEY secret. Without a key every function returns null and News shows headlines and links only. Whatever the model
// returns is checked in code before it is used; anything that fails a check is dropped (never repaired by guessing).
import {fold} from './match.mjs';

export const MODEL = 'claude-haiku-4-5-20251001';
const API = 'https://api.anthropic.com/v1/messages';

export function makeModel({apiKey = process.env.ANTHROPIC_API_KEY, fetchImpl = globalThis.fetch, log = () => {}} = {}) {
  if (!apiKey) return null;
  let calls = 0;
  const ask = async (system, user, maxTokens = 400) => {
    if (++calls > 250) throw new Error('model call budget reached for this run');
    const r = await fetchImpl(API, {method: 'POST', headers: {'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01'},
      body: JSON.stringify({model: MODEL, max_tokens: maxTokens, temperature: 0, system, messages: [{role: 'user', content: user}]})});
    const j = await r.json().catch(() => null);
    if (!r.ok || !j) throw new Error('model call failed: ' + r.status + (j && j.error ? ' ' + j.error.message : ''));
    return (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();
  };
  return {ask, get calls() { return calls; }};
}

// ---------- the "In short" contract ----------
const OPINION = /\b(best|worst|great(est)?|amazing|awesome|incredible|impressive|stunning|brilliant|disappointing|terrible|excellent|superb|fantastic|must[- ]have|should|recommend(ed|s)?|worth (it|buying)|rating|rated|stars?|\d+\/10|favou?rite|love|hate|beautiful|gorgeous|perfect)\b/i;
const words = s => String(s).trim().split(/\s+/).filter(Boolean);
const ngrams = (arr, n) => { const out = new Set(); for (let i = 0; i + n <= arr.length; i++) out.add(arr.slice(i, i + n).join(' ')); return out; };
const toks = s => fold(s).replace(/[^a-z0-9.%:'-]+/g, ' ').trim().split(/\s+/).filter(Boolean);
// returns [] when the sentence keeps the contract, else the reasons
export function inShortProblems(s, sourceText) {
  const p = []; s = String(s || '').trim();
  if (!s) return ['empty'];
  if (words(s).length > 25) p.push('more than 25 words');
  if ((s.match(/[.!?](\s|$)/g) || []).length > 1 || /\n/.test(s)) p.push('more than one sentence');
  for (const q of s.match(/["“”‘’']([^"“”‘’']{3,})["“”‘’']/g) || []) if (words(q.replace(/["“”‘’']/g, '')).length > 5) p.push('a quote longer than 5 words');
  const src = toks(sourceText || ''), out = toks(s);
  if (src.length && out.length >= 6) { const g = ngrams(src, 6); for (const x of ngrams(out, 6)) if (g.has(x)) { p.push('copies 6+ words in a row from the source'); break; } }
  if (OPINION.test(s)) p.push('an opinion or rating word');
  // facts present in the source: every number in the sentence must be in the source text too
  const srcNums = new Set((String(sourceText || '').match(/\d+(?:[.,:]\d+)*/g) || []).map(n => n.replace(/,/g, '')));
  for (const n of (s.match(/\d+(?:[.,:]\d+)*/g) || []).map(n => n.replace(/,/g, ''))) if (!srcNums.has(n)) { p.push(`the number ${n} is not in the source`); break; }
  return [...new Set(p)];
}
const IN_SHORT_SYS = `You write fred's "In short" line for a news item about endurance sport.
Rules: exactly one sentence, at most 25 words, in your own words. Use only facts stated in the text you are given. No opinions, ratings,
praise or advice. Do not quote more than 5 words in a row from the source. If the text has no clear fact to summarise, reply NONE.
Reply with the sentence only.`;
export async function inShort(model, {title, text}) {
  if (!model) return null;
  const src = `Headline: ${title}\n\n${String(text || '').slice(0, 6000)}`;
  const out = (await model.ask(IN_SHORT_SYS, src, 120)).replace(/^["“]|["”]$/g, '').trim();
  if (!out || /^none\.?$/i.test(out)) return null;
  return inShortProblems(out, src).length ? null : out;
}

// ---------- strict JSON from the model ----------
export function parseJson(s) {
  s = String(s || '').trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
  const a = s.indexOf('{'), b = s.lastIndexOf('}'); if (a < 0 || b < a) return null;
  try { return JSON.parse(s.slice(a, b + 1)); } catch { return null; }
}
export const TIME_RE = /^\d{1,2}:[0-5]\d:[0-5]\d$/;
// results extracted from one report → [{sex, place, name, time?}] (only well-formed rows; at most the top 5 per sex)
export function checkExtraction(j) {
  if (!j || typeof j !== 'object' || !Array.isArray(j.results)) return [];
  const out = [];
  for (const r of j.results) {
    if (!r || typeof r !== 'object') continue;
    const sex = r.sex === 'F' || r.sex === 'M' ? r.sex : null, place = Number.isInteger(r.place) ? r.place : null;
    const name = typeof r.name === 'string' ? r.name.trim().replace(/\s+/g, ' ') : '';
    if (!sex || !place || place < 1 || place > 5 || !/^[\p{L}][\p{L}'’. -]{1,58}[\p{L}.]$/u.test(name) || name.split(' ').length < 2) continue;
    const row = {sex, place, name}; if (typeof r.time === 'string' && TIME_RE.test(r.time.trim())) row.time = r.time.trim();
    if (typeof r.country === 'string' && /^[A-Z]{3}$/.test(r.country)) row.country = r.country;
    out.push(row);
  }
  const seen = new Set(); return out.filter(r => { const k = r.sex + r.place; if (seen.has(k)) return false; seen.add(k); return true; });
}
const EXTRACT_SYS = `You read one race report and return the professional results it states, as strict JSON:
{"results":[{"sex":"F"|"M","place":1,"name":"First Last","country":"GER","time":"h:mm:ss"}]}
Only places 1-5 that the text states explicitly. "time" only when the text gives the finishing time; "country" only as a 3-letter code when stated.
No guesses. If the report gives no results, return {"results":[]}. JSON only.`;
export async function extractResults(model, {title, text}) {
  if (!model) return null;
  return checkExtraction(parseJson(await model.ask(EXTRACT_SYS, `Race: ${title}\n\n${String(text || '').slice(0, 8000)}`, 600)));
}
// story lines: 1–3 per race, each from exactly one report (its source + URL); each line passes the In short rules (≤ 25 words, own words, facts in that report)
const STORY_SYS = `You write fred's "story" of a professional triathlon race: 1 to 3 short lines, each one sentence (at most 25 words) in your
own words, each based on exactly ONE of the numbered reports. Facts from that report only; no opinions; no quotes longer than 5 words.
Return strict JSON: {"lines":[{"report":1,"text":"…"}]}. If the reports say nothing clear, return {"lines":[]}.`;
export async function storyLines(model, raceName, reports) {
  if (!model || !reports.length) return null;
  const user = `Race: ${raceName}\n\n` + reports.map((r, i) => `Report ${i + 1} (${r.source}): ${r.title}\n${String(r.text || '').slice(0, 3000)}`).join('\n\n');
  const j = parseJson(await model.ask(STORY_SYS, user, 500)); if (!j || !Array.isArray(j.lines)) return [];
  const out = [];
  for (const l of j.lines.slice(0, 3)) {
    const r = Number.isInteger(l && l.report) ? reports[l.report - 1] : null; if (!r || typeof l.text !== 'string') continue;
    const text = l.text.trim(); if (inShortProblems(text, `${r.title}\n${r.text}`).length) continue;
    out.push({text, source: r.source, url: r.url});
  }
  return out;
}
// upcoming races named in a preview (IRONMAN / 70.3 / T100 do not publish an API): name, series, date, place, start times when stated
const UPCOMING_SYS = `From this preview article, list the professional triathlon races it previews, as strict JSON:
{"races":[{"name":"IRONMAN 70.3 Lakeside","series":"70.3"|"IRONMAN"|"T100"|"WTCS","date":"YYYY-MM-DD","place":"Lakeside, USA","tz":"America/New_York",
"starts":{"women":"YYYY-MM-DDTHH:MM:SS±HH:MM","men":"…"},"pros":[{"name":"First Last","sex":"F"|"M"}]}]}
Only what the text states; leave a field out when it is not stated. JSON only.`;
export function checkUpcoming(j) {
  if (!j || !Array.isArray(j.races)) return [];
  const out = [];
  for (const r of j.races) {
    if (!r || typeof r.name !== 'string' || !['IRONMAN', '70.3', 'T100', 'WTCS'].includes(r.series) || !/^\d{4}-\d{2}-\d{2}$/.test(r.date || '')) continue;
    const x = {name: r.name.trim().slice(0, 80), series: r.series, date: r.date};
    if (typeof r.place === 'string') x.place = r.place.trim().slice(0, 80);
    if (typeof r.tz === 'string' && /^[A-Za-z_]+\/[A-Za-z_/+-]+$/.test(r.tz)) x.tz = r.tz;
    const st = {}; for (const k of ['women', 'men']) { const v = r.starts && r.starts[k]; if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?[+-]\d{2}:\d{2}$/.test(v)) st[k] = v; }
    if (Object.keys(st).length) x.starts = st;
    x.pros = (Array.isArray(r.pros) ? r.pros : []).filter(p => p && typeof p.name === 'string' && (p.sex === 'F' || p.sex === 'M')).slice(0, 12).map(p => ({name: p.name.trim(), sex: p.sex}));
    out.push(x);
  }
  return out;
}
export async function extractUpcoming(model, {title, text}) {
  if (!model) return null;
  return checkUpcoming(parseJson(await model.ask(UPCOMING_SYS, `${title}\n\n${String(text || '').slice(0, 8000)}`, 700)));
}
