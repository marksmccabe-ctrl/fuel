#!/usr/bin/env node
// node scripts/news/validate.mjs [file …] — checks news.json-shaped files against data/news.schema.json and the cross-references
// (default: data/news.json and tests/fixtures/news.fixture.json). Exit 1 when any file fails: CI refuses to publish it.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validate, checkRefs} from './lib/schema.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const schema = JSON.parse(fs.readFileSync(path.join(root, 'data/news.schema.json'), 'utf8'));
const files = process.argv.slice(2).length ? process.argv.slice(2) : ['data/news.json', 'tests/fixtures/news.fixture.json'].map(f => path.join(root, f)).filter(f => fs.existsSync(f));
let bad = 0;
for (const f of files) {
  let doc; try { doc = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.error(`${f}: not JSON (${e.message})`); bad++; continue; }
  const p = [...validate(schema, doc), ...checkRefs(doc)], size = fs.statSync(f).size;
  if (size > 400 * 1024) p.push(`file is ${Math.round(size / 1024)} KB (limit ~400 KB)`);
  if (p.length) { bad++; console.error(`${f}: FAILS\n  ` + p.join('\n  ')); } else console.log(`${f}: valid (${Math.round(size / 1024)} KB)`);
}
process.exit(bad ? 1 : 0);
