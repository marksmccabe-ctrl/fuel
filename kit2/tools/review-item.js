export const meta = {
  name: 'review-item',
  description: 'Adversarial review of one fred queue item with verify and fix rounds until a round comes back dry',
  phases: [
    { title: 'Find', detail: 'several lenses read the item diff and probe the page' },
    { title: 'Verify', detail: 'three skeptics per finding try to refute it' },
    { title: 'Fix', detail: 'one fixer applies confirmed findings, runs the tests, commits, pushes the backup branch' },
  ],
}

const A = args
const S = '/tmp/claude-0/-home-user-fuel/dab8bf2b-8342-5973-979d-63da6bbeef03/scratchpad'
const K = S + '/kit2'
const N = A.item
const WT = S + '/wt-q' + N
const PAGE = S + '/fred' + N + '/null.html'
const CTX = `Context. fred is a one-file PWA (index.html, no build step). Queue item ${N} ("${A.title}") is implemented on branch ${A.branch} in the git worktree ${WT} (base ${A.base}; see "git -C ${WT} diff ${A.base} HEAD -- index.html" and "git -C ${WT} log --format=%B ${A.base}..HEAD"). The spec is QUEUE.md lines ${A.spec} in that worktree, plus the round notes and "RULES FOR ALL SEVEN" at QUEUE.md ~1354-1369. ${A.refs}
Decisions already made: ${K}/DECISIONS.md. Earlier items it builds on: item 85 (motion tokens, motionOK, Reduce Motion), item 86 (inView / loopWhileVisible, read their doc comments in index.html), items 88-90 (Volume and Journal motion, the shared once-per-app-open helper onAppOpen / entranceOK).
The builder's own notes: ${A.notes}
A built test page (Firebase off, sw.js beside it) is ${PAGE}; rebuild it with "sh ${K}/tools/mknull.sh ${WT} ${S}/fred${N}". The kit is ${K} (rebuilt after a container swap; its page opener is ${K}/lib/open.mjs, ESM, Reduce Motion unless {motion:true}, Test athletes A/B/C via {athlete}). The item's own test is ${K}/q${N}/q${N}.test.mjs; run tests like: cd ${K}/q${N} && timeout 1500 node q${N}.test.mjs ${PAGE}. Playwright and Chromium are installed. Write probe scripts in ${S}/probe${N}/ (create it), never inside the worktree or kit. Do NOT edit index.html or any kit file in the find/verify phases. Keep probe runs light (one browser at a time per agent). Never touch /home/user/fuel.`

const FIND = { type: 'object', properties: { findings: { type: 'array', items: { type: 'object', properties: {
  title: { type: 'string' }, where: { type: 'string' }, scenario: { type: 'string', description: 'concrete steps -> wrong result' },
  severity: { type: 'string', enum: ['high', 'medium', 'low'] }, evidence: { type: 'string' }, fix: { type: 'string' } },
  required: ['title', 'where', 'scenario', 'severity', 'evidence', 'fix'] } } }, required: ['findings'] }
const VERDICT = { type: 'object', properties: { real: { type: 'boolean' }, reason: { type: 'string' }, better_fix: { type: 'string' } }, required: ['real', 'reason'] }
const FIXED = { type: 'object', properties: { commit: { type: 'string' }, fixed: { type: 'array', items: { type: 'string' } }, not_fixed: { type: 'array', items: { type: 'string' } }, tests: { type: 'string' } }, required: ['commit', 'fixed', 'not_fixed', 'tests'] }

const LENSES = [
  { key: 'spec', p: 'SPEC CONFORMANCE AND FIDELITY. Walk every numbered point and QA line of item ' + N + ' and check the code does exactly that, with the listed numbers. Compare against the PDF pictures and the demo code named in the spec (render PDF pages to PNG with pdftoppm and take screenshots of the app to compare). Judge each of the builder notes and DECISIONS.md entries: justified, or a departure that should be fixed?' },
  { key: 'state', p: 'STATE, LIFECYCLE, DATA AND RACES. Hunt for stuck or wrong states, data that persists or syncs wrong (saved data must keep its shape; Firebase sync must still work; two devices), timers, observers or listeners leaking across renders, elements replaced while their animation or registration is live, page hidden, Reduce Motion toggled mid-flight, rotation and resize. Write a Playwright probe for anything you suspect.' },
  { key: 'a11y', p: 'ACCESSIBILITY, LAYOUT, PRIVACY AND REGRESSIONS. Contrast AA of every text over every new background; 320 px and 200% text (no overflow, no clipped text, no sideways scroll); 44 px targets; screen readers; keyboard focus (visible, never lost); print/copy; Reduce Motion end states; Mark\'s hard rules for this item (see DECISIONS.md); and that nothing outside item ' + N + ' changed behaviour.' },
  { key: 'perf', p: 'PERFORMANCE AND ROBUSTNESS. Transform/opacity only for motion, no layout thrash per frame, no work on every scroll frame, no memory growth across many renders, retries that back off, graceful behaviour with missing/odd data, offline, slow or failing network, metric units and extreme values.' },
  { key: 'tests', p: 'KIT TEST QUALITY. Read ' + K + '/q' + N + '/q' + N + '.test.mjs. Does it check every QA line and numbered point of item ' + N + ' for real (not vacuous: wrong selectors, swallowed errors, checks that pass on main)? Show a check that would pass on a broken build (a mutant) where you can.' },
]

const seen = new Set(), confirmedAll = [], fixLog = []
let round = 0, dry = false
while (round < A.maxRounds) {
  round++
  phase('Find')
  const prior = confirmedAll.map(f => '- ' + f.title).join('\n') || '(none)'
  const strict = round >= A.strictFrom ? '\n\nLATE ROUND, STRICTER BAR: report only (a) something a rider would actually notice on an iPhone (Safari) or a computer in normal use, or (b) a regression introduced by an earlier review round fix. Edge cases that need contrived API use, devtools or a synthetic page do not qualify. Severity must be high or medium.' : ''
  const found = (await parallel(LENSES.map(l => () => agent(
    CTX + '\n\nYou are an adversarial reviewer, round ' + round + '. Lens: ' + l.p + '\n\nAlready found and fixed in earlier rounds (do not repeat; do check the fixes held):\n' + prior + '\n\nReport only real defects with a concrete failing scenario (no style nits, no speculation without evidence). Return an empty list if you find none.' + strict,
    { label: 'find:' + l.key + ':r' + round, phase: 'Find', schema: FIND })))).filter(Boolean).flatMap(r => r.findings)
  const fresh = found.filter(f => { const k = f.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); if (seen.has(k)) return false; seen.add(k); return true })
  log('round ' + round + ': ' + found.length + ' found, ' + fresh.length + ' new')
  if (!fresh.length) { dry = true; break }
  phase('Verify')
  const judged = await parallel(fresh.map(f => () => parallel(['reproduce', 'spec-intent', 'code-path'].map(lens => () => agent(
    CTX + '\n\nTry to REFUTE this review finding about item ' + N + '. Lens: ' + lens + ' (reproduce = run or write a probe that shows it or shows it cannot happen; spec-intent = is this actually wrong per the item text, the demo, DECISIONS.md and the round rules, or intended; code-path = trace the exact code path, can the scenario really occur?). Default to real=false if you cannot confirm it.\n\nFinding: ' + JSON.stringify(f),
    { label: 'verify:' + lens + ':' + f.title.slice(0, 30), phase: 'Verify', schema: VERDICT }))).then(vs => {
      const ok = vs.filter(Boolean)
      return { f, real: ok.filter(v => v.real).length >= 2, notes: ok.map(v => (v.real ? 'REAL: ' : 'REFUTED: ') + v.reason + (v.better_fix ? ' | better fix: ' + v.better_fix : '')) }
    })))
  const conf = judged.filter(j => j.real)
  log('round ' + round + ': ' + conf.length + ' of ' + fresh.length + ' confirmed')
  if (!conf.length) { dry = true; break }
  confirmedAll.push(...conf.map(j => j.f))
  phase('Fix')
  const fx = await agent(
    CTX + '\n\nRESTART-SAFE: the container can restart and kill long runs. If the worktree already has uncommitted changes, they are an interrupted earlier attempt at this same round: review them, keep what is right, and build on them. As soon as the fixes are in and the item\'s own test plus the syntax check pass, commit (message "q' + N + ' review round ' + round + ' (part 1): ...") and push the backup branch (git -C ' + WT + ' push -q origin ' + A.branch + '); then run the rest of the list and commit and push any further fixes as part 2. Keep each test run in the foreground.\n\nYou are the fixer. Fix each confirmed finding below in ' + WT + '/index.html (and in the kit tests where a finding is about a test; commit kit changes in ' + K + ' and push: git -C ' + K + ' add -A && git -C ' + K + ' commit -q -m "kit: q' + N + ' review round ' + round + '" && git -C ' + K + ' push -q origin kit-backup). Keep element ids and saved data; keep the change minimal and in the style of the surrounding code (one-line JS uses /* */ comments, never mid-line //). Do NOT change the cache version (sw.js CACHE and APP_BUILD stay ' + A.cache + '). If a finding is a test gap, add the check to ' + K + '/q' + N + '/q' + N + '.test.mjs (no apostrophes inside single-quoted JS strings). After fixing, rebuild the page and run, one at a time against ' + PAGE + ': ' + A.tests + '. Every test must end OK; fix until they do. Commits end with a blank line and exactly:\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_013LcSv3VsC77UxEUREZnsy7\nDo not push main. Do not mention any model name elsewhere.\n\nConfirmed findings with verifier notes:\n' + JSON.stringify(conf.map(j => ({ finding: j.f, notes: j.notes })), null, 1),
    { label: 'fix:r' + round, phase: 'Fix', schema: FIXED })
  fixLog.push({ round, ...(fx || { commit: 'none', fixed: [], not_fixed: ['fixer died'], tests: '' }) })
}
return { rounds: round, dry, confirmed: confirmedAll.map(f => ({ title: f.title, severity: f.severity })), fixLog }
