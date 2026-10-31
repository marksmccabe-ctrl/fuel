export const meta = {
  name: 'kit-item',
  description: 'Run the full fred kit on one queue item: add its screens, run runkit.sh, fix, then a skeptic checks nothing was loosened',
  phases: [
    { title: 'Kit', detail: 'add the item screens to the shared list, run runkit.sh, fix until every step is OK' },
    { title: 'Check', detail: 'a skeptic reads the kit and app changes for loosened rules, unjustified exemptions and regressions' },
    { title: 'Fix', detail: 'fix what the skeptic confirmed and rerun the affected steps' },
  ],
}
const A = args
const S = '/tmp/claude-0/-home-user-fuel/dab8bf2b-8342-5973-979d-63da6bbeef03/scratchpad'
const K = S + '/kit2', WT = S + '/wt-q' + A.item, PAGE = S + '/fred' + A.item + '/null.html'
const T = 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_013LcSv3VsC77UxEUREZnsy7'
const CTX = `Context. fred is a one-file PWA (index.html, no build step). Queue item ${A.item} ("${A.title}") is on branch ${A.branch} in the git worktree ${WT}; it has just finished a 7-round adversarial review (head ${A.head}). The shared browser test kit is ${K} (git worktree on branch kit-backup, pushed to origin as a backup): read ${K}/RESUME.md (the "Kit" section explains tools/runkit.sh and how to read it) and ${K}/DECISIONS.md. The page opener is ${K}/lib/open.mjs (use its reload(p) for reloads). Build the test page with: sh ${K}/tools/mknull.sh ${WT} ${S}/fred${A.item}. Item test: ${K}/q${A.item}/q${A.item}.test.mjs. Spec: QUEUE.md lines ${A.spec} in the worktree. Never touch /home/user/fuel. Write scratch files and probes under ${S}/kit${A.item}/ (create it). The machine has 4 CPUs: run one browser test at a time, in the foreground. Commits end with a blank line and exactly:\n${T}\nDo not push main; do not mention any model name. One-line app JS uses /* */ comments, never mid-line //.`

const KIT = { type: 'object', properties: { runkit: { type: 'string', description: 'the full runkit.sh stdout of the final run' }, ok: { type: 'boolean' }, app_commits: { type: 'array', items: { type: 'string' } }, kit_commits: { type: 'array', items: { type: 'string' } }, screens_added: { type: 'array', items: { type: 'string' } }, exemptions_added: { type: 'array', items: { type: 'string' }, description: 'every KNOWN_ON_MAIN / allow.json / EXEMPT / SIDEWAYS_OK / ELLIPSIS_OK / KEYFRAMES entry added, with its reason' }, notes: { type: 'string' } }, required: ['runkit', 'ok', 'app_commits', 'kit_commits', 'screens_added', 'exemptions_added', 'notes'] }
const CHECK = { type: 'object', properties: { problems: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' } }, required: ['title', 'evidence', 'fix'] } } }, required: ['problems'] }

phase('Kit')
let kit = await agent(CTX + `

TASK: the kit step for item ${A.item}.
1. Shared screens: add item ${A.item}'s new screens to ${K}/lib/screens.mjs so every audit (contrast, layout, inventory, motion) walks them from now on. ${A.screens} Give each such screen a "needs" selector (for example needs: '#jhCam') and make run() skip a screen whose needs selector is absent on the page, printing "skipped (needs ...)" instead of failing, so the audits still run on older pages (main before this item merges, and the item 92/93 branches until they merge main). Verify each new screen with a screenshot that it shows what its name says.
2. Rebuild the page, then run the whole kit: cd ${K} && KIT_ITEMS=${A.item} sh tools/runkit.sh ${PAGE} ${WT}. It takes about an hour; run it in the foreground with a long timeout (or step by step, each step as runkit runs it).
3. Every step must end OK. For each failure decide: (a) the item breaks the rule: fix index.html in ${WT} minimally in the style of the code around it, keep element ids and saved data, keep the cache ${A.cache}; commit ("q${A.item}: kit: ...") and push (git -C ${WT} push -q origin ${A.branch}), then rerun the item test and npm test in ${WT}; (b) the audit is wrong: fix the audit, never loosen a rule to pass; (c) an intended change by the item (for example an id or control removed on purpose per the spec or DECISIONS.md): add a named entry with a clear why (inventory/allow.json and the like). Inventory removals that are not clearly intended are app bugs. ${A.known}
4. Rerun runkit.sh end to end after the last change; every line must be OK.
5. Commit kit changes in ${K} (git add only the files you changed) with message "kit2: q${A.item} kit step: ..." and push (git -C ${K} push -q origin kit-backup; pull --rebase first if rejected).
Return the final runkit output, the commits, the screens added and every exemption added with its reason.`, { label: 'kit:q' + A.item, phase: 'Kit', schema: KIT })

for (let round = 1; round <= 2; round++) {
  phase('Check')
  const ck = await agent(CTX + `

You are a skeptic checking the kit step for item ${A.item} that another agent just did. Its report: ${JSON.stringify(kit)}
Read the kit changes (git -C ${K} log -p ${A.kitBase}..HEAD -- . ':!q${A.item}') and the app changes since the review (git -C ${WT} diff ${A.head} HEAD). Look for: (1) any audit rule loosened, threshold raised, check removed, or exemption (KNOWN_ON_MAIN, allow.json, EXEMPT, SOLID_ALLOW, SIDEWAYS_OK, ELLIPSIS_OK, KEYFRAMES, any skip list) added without a reason that holds up against the spec, DECISIONS.md and Mark's rules (AA contrast, 320 px and 200% text, 44 px targets, Reduce Motion lands everything at once); (2) new screens that do not really show what they claim (open them yourself and look) or that the "needs" gate skips on the item's own page; (3) app changes that break something (rerun the item test and smoke: cd ${K}/q${A.item} && timeout 1500 node q${A.item}.test.mjs ${PAGE}; cd ${K}/smoke && timeout 900 node smoke.test.mjs ${PAGE}); (4) a runkit line that is not truly OK. Report only problems you can show with evidence. Return an empty list if there are none.`, { label: 'check:r' + round, phase: 'Check', schema: CHECK })
  if (!ck || !ck.problems.length) { log('check round ' + round + ': clean'); break }
  log('check round ' + round + ': ' + ck.problems.length + ' problems')
  phase('Fix')
  kit = await agent(CTX + `

You are fixing problems a skeptic found in the kit step for item ${A.item} (previous report: ${JSON.stringify(kit)}). Problems: ${JSON.stringify(ck.problems)}
Fix each one (app fixes in ${WT}: commit and push ${A.branch}; kit fixes in ${K}: commit and push kit-backup), never loosening a rule. Then rerun the affected runkit steps (or all of runkit if the app changed: cd ${K} && KIT_ITEMS=${A.item} sh tools/runkit.sh ${PAGE} ${WT}) until every line is OK. Return the same report shape, with the final runkit output.`, { label: 'fix:r' + round, phase: 'Fix', schema: KIT })
}
return kit