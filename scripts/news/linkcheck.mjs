#!/usr/bin/env node
// Check every official standings link in data/sources.json by hand (the news-links workflow; item 21). Same rule as the daily job
// (lib/links.mjs: HTTP 200, no redirect to a home page, the page shows standings), but every candidate is tried and nothing is written.
// node scripts/news/linkcheck.mjs [--root DIR]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Fetcher} from './lib/fetch.mjs';
import {checkStandingsLinks} from './lib/links.mjs';

const a = process.argv.slice(2), i = a.indexOf('--root');
const root = i >= 0 ? a[i + 1] : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, 'data', f), 'utf8'));
const sources = read('sources.json');
let doc; try { doc = read('news.json'); } catch { doc = {standings: [], pros: []}; }
doc = {standings: doc.standings || [], pros: doc.pros || [], standings_info: {}}; // names for the check only; the file is not changed
const ctx = {doc, sources, now: Date.now(), fetcher: new Fetcher({}), log: m => console.log(m), linkResults: []};
await checkStandingsLinks(ctx, {all: true});
const line = r => `  ${r.ser} · ${r.k}: ${r.url}${r.title ? ` ("${r.title}")` : ''}${r.reason ? ` - ${r.reason}` : ''}`;
console.log('\nWORKING:\n' + (ctx.linkResults.filter(r => r.ok).map(line).join('\n') || '  none'));
console.log('\nNOT WORKING:\n' + (ctx.linkResults.filter(r => !r.ok && !r.transient).map(line).join('\n') || '  none'));
console.log('\nNOT JUDGED (robots.txt, busy, refused, no answer):\n' + (ctx.linkResults.filter(r => r.transient).map(line).join('\n') || '  none'));
