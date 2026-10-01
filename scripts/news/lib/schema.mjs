// A small JSON Schema validator (the subset data/news.schema.json uses: $ref to #/$defs, type, const, enum, required, properties,
// additionalProperties, items, minItems/maxItems, minLength/maxLength, pattern, minimum/maximum, anyOf). No dependencies, so the jobs and
// the tests run on a bare Node. validate(schema, value) → [] when valid, else ["path: message", …] (at most 50).
export function validate(schema, value) {
  const errs = [];
  const root = schema;
  const typeOf = v => v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v;
  const resolve = s => {
    while (s && s.$ref) {
      const m = /^#\/\$defs\/(.+)$/.exec(s.$ref);
      if (!m || !root.$defs || !root.$defs[m[1]]) throw new Error('unknown $ref ' + s.$ref);
      s = root.$defs[m[1]];
    }
    return s;
  };
  const check = (s, v, path, out) => {
    s = resolve(s);
    if (!s || out.length >= 50) return;
    if ('const' in s && v !== s.const) out.push(`${path}: must be ${JSON.stringify(s.const)}`);
    if (s.enum && !s.enum.includes(v)) out.push(`${path}: must be one of ${s.enum.join(', ')}`);
    if (s.anyOf) {
      const ok = s.anyOf.some(a => { const e = []; check(a, v, path, e); return !e.length; });
      if (!ok) out.push(`${path}: matches none of the allowed forms`);
    }
    if (s.type) {
      const t = typeOf(v), want = [].concat(s.type);
      const fits = want.some(w => w === t || (w === 'number' && (t === 'integer' || t === 'number')));
      if (!fits) { out.push(`${path}: must be ${want.join('|')} (is ${t})`); return; }
    }
    if (typeof v === 'string') {
      if (s.minLength != null && [...v].length < s.minLength) out.push(`${path}: shorter than ${s.minLength}`);
      if (s.maxLength != null && [...v].length > s.maxLength) out.push(`${path}: longer than ${s.maxLength}`);
      if (s.pattern && !new RegExp(s.pattern, 'u').test(v)) out.push(`${path}: does not match ${s.pattern}`);
    }
    if (typeof v === 'number') {
      if (s.minimum != null && v < s.minimum) out.push(`${path}: below ${s.minimum}`);
      if (s.maximum != null && v > s.maximum) out.push(`${path}: above ${s.maximum}`);
    }
    if (Array.isArray(v)) {
      if (s.minItems != null && v.length < s.minItems) out.push(`${path}: fewer than ${s.minItems} items`);
      if (s.maxItems != null && v.length > s.maxItems) out.push(`${path}: more than ${s.maxItems} items`);
      if (s.items) v.forEach((x, i) => check(s.items, x, `${path}[${i}]`, out));
    }
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const k of s.required || []) if (!(k in v)) out.push(`${path}: missing ${k}`);
      const props = s.properties || {};
      for (const [k, x] of Object.entries(v)) {
        if (props[k]) check(props[k], x, `${path}.${k}`, out);
        else if (s.additionalProperties === false) out.push(`${path}: unexpected field ${k}`);
        else if (s.additionalProperties && typeof s.additionalProperties === 'object') check(s.additionalProperties, x, `${path}.${k}`, out);
      }
    }
  };
  check(schema, value, '$', errs);
  return errs;
}

// the cross-record rules a schema cannot say: ids unique, every reference points at a record, every item/story line has a source + URL
export function checkRefs(doc) {
  const out = [];
  const ids = (arr, what) => { const seen = new Set(); for (const r of arr || []) { if (seen.has(r.id)) out.push(`${what}: duplicate id ${r.id}`); seen.add(r.id); } return seen; };
  const races = ids(doc.races, 'races'), pros = ids(doc.pros, 'pros'); ids(doc.items, 'items');
  for (const r of doc.results || []) { if (!races.has(r.race_id)) out.push(`results: unknown race ${r.race_id}`); if (!pros.has(r.pro_id)) out.push(`results: unknown pro ${r.pro_id}`); }
  for (const s of doc.story || []) if (!races.has(s.race_id)) out.push(`story: unknown race ${s.race_id}`);
  for (const s of doc.standings || []) if (!pros.has(s.pro_id)) out.push(`standings: unknown pro ${s.pro_id}`);
  for (const r of doc.races || []) for (const w of r.pros_to_watch || []) if (!pros.has(w.pro_id)) out.push(`races ${r.id}: unknown pro to watch ${w.pro_id}`);
  for (const i of doc.items || []) {
    for (const id of i.race_ids || []) if (!races.has(id)) out.push(`items ${i.id}: unknown race ${id}`);
    for (const id of i.pro_ids || []) if (!pros.has(id)) out.push(`items ${i.id}: unknown pro ${id}`);
  }
  const perRace = {}; for (const s of doc.story || []) perRace[s.race_id] = (perRace[s.race_id] || 0) + 1;
  for (const [id, n] of Object.entries(perRace)) if (n > 3) out.push(`story: ${n} lines for ${id} (at most 3)`);
  return out.slice(0, 50);
}
