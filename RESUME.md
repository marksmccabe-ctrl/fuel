# fred queue — how to resume (kit-backup branch)

This orphan branch backs up the test kit (kit2) and the working notes, because the container that held the old kit was replaced on
2026-10-25 and everything outside the repo was lost. Mark approved (2026-10-29) pushing work branches and this kit as backups.

## Where things are
- main: items 85–90 merged (cache v115). QUEUE.md / QUEUE_LOG.md are the record.
- Work branches are pushed to origin as they progress: q91-photo, q92-deficit, q93-wheel (each from main; later items merge main in
  before their review).
- This branch: lib/open.mjs (page opener: Reduce Motion by default, Test athletes A/B/C seeded from the repo's tests/fixtures, no
  network), tools/mknull.sh (builds null.html = Firebase off, sw.js beside it), tools/review-item.js (the adversarial review workflow),
  smoke/, and one folder per audit or item test.

## Container setup after a swap
1. `git -C /home/user/fuel fetch origin && git -C /home/user/fuel worktree add <scratchpad>/kit2 kit-backup`.
2. `ln -sfn $(npm root -g) <kit2>/node_modules` (ESM tests import playwright from there).
3. `cd /home/user/fuel && npm ci`.
4. Playwright 1.56.1 (repo) wants chromium_headless_shell-1194 but /opt/pw-browsers has 1243: make
   `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` a symlink to
   `/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell` and touch INSTALLATION_COMPLETE
   and DEPENDENCIES_VALIDATED in that folder. Then `npm test` gives 1752 pass, 0 fail.
5. Never run `playwright install`.

## Standing rules (from Mark, all still in force)
- Single index.html, no build step. Keep element ids and saved data; Firebase sync stays.
- Bump the sw.js cache once per item; APP_BUILD = sw.js CACHE. 91 → v116, 92 → v117, 93 → v118.
- Contrast and larger-text checks must pass. Commit per step; one branch per item.
- Log each item: append its entry to QUEUE_LOG.md, mark it DONE in QUEUE.md with one Done line (replace Mark's), commit
  "Queue item NN done: log entry". Merge: `git merge --no-ff BRANCH`, check, `npm test` 0 fail, push main, then
  `git push -f origin main:claude/lucid-thompson-dc7gqa`.
- Commit trailer (and no model names anywhere else):
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_013LcSv3VsC77UxEUREZnsy7
- One-line JS: no mid-line // comments (use /* */). No apostrophes inside single-quoted JS strings in tests.
- Item 91: the photo is never sent to any AI; canvas re-encode strips metadata. Item 92: weigh-ins never sent to any AI; ride fueling
  never changes because of a deficit (no plan / Crunch / Adjust code reads deficits). fred has no push notifications.
- Mark chose full depth: up to 7 adversarial review rounds per item, then the kit, then merge. 4-CPU machine: one review or kit at a
  time, plus at most one builder.
- Decisions already made for 91–93 (from the lost plans): see DECISIONS.md.

## Kit
- `sh tools/runkit.sh <page> [checkout]` (checkout default /home/user/fuel; build the page from that checkout with tools/mknull.sh)
  runs, one at a time: `answer` (npm test in the checkout), `smoke`, `contrast`, `layout-320/375/390/430` (one process per width:
  all four in one process take 32 minutes, more than the 1500 s step limit), `inventory` (snap the page, diff baseline-main.json with
  inventory/allow.json, which is empty on main), `motion`, then each `qNN/qNN.test.mjs` alphabetically, only when item NN is in the
  checkout's history (a `qNN: ...`, `qNN WIP` or `Merge item NN` commit). Before an item is merged, main prints `qNN: skipped, ...`.
  Env: `KIT_ITEMS="91 93"` / `all` / `none` overrides the item choice. q93 gets `KIT_MAIN` (default <scratchpad>/fred/null.html) as
  its main page. `QNN_REPO` defaults to the checkout. `KIT_TIMEOUT` defaults to 1500 s per step.
- For main, use a main checkout: /home/user/fuel is on claude/lucid-thompson-dc7gqa (main + 91–93 unreviewed, v118), and its
  local `main` branch is stale (item 89). Setup: `git clone -q --no-checkout /home/user/fuel <scratchpad>/wt-main && git -C
  <scratchpad>/wt-main checkout -q --detach $(git -C /home/user/fuel rev-parse origin/main) && ln -sfn /home/user/fuel/node_modules
  <scratchpad>/wt-main/node_modules`.
- Time on main (2026-10-29, cache v115): 2919 s, about 49 minutes. answer 16 s, smoke 6 s, contrast 3 min, layout 4 x 8 min,
  inventory 3 min, motion 10.5 min. Item tests add about 4 (q91), 3 (q92) and a few (q93) minutes each when they run.
- Output: the first line names the page (and its APP_BUILD), the checkout head and the log folder
  (`kit2/logs/runkit-<date-time>-<pid>/<step>.log`, gitignored). Next comes one line per step, `name: <final line> (<n> s)`, and then
  `kit: OK: ...` or `kit: FAIL n of m steps`. Exit status 0 means every step passed. A step passes only when it exits 0 and its last
  line starts with `OK:`. To read it, `grep -E 'FAIL|Error'` the output. `FAIL n` means checks failed: see the `  FAIL ...` lines in
  that step's log. `FAIL (exit n) ...Error...` means the step crashed. `FAIL timeout` means it ran over the step limit. A line with
  nothing after `name:` or one that is missing means the run was cut off: open the log folder.
- Proof on main (page fred/null.html, checkout wt-main at 0abc05b): answer 1752 pass, 0 fail. smoke 14 checks. contrast 80 screens,
  186 checks. layout OK at every width. inventory nothing removed. motion 88 screens, 54 checks. q91–q93 skipped. `kit: OK: 9 steps
  passed, 3 item tests skipped (2919 s)`.
- Item screens: a screen an item brings carries `needs: '<selector>'` in lib/screens.mjs; run() skips it on a page without that element
  and prints `<name>: skipped (needs <selector>)`, so the audits still run on main and on branches that have not merged the item. Item 91
  added six (needs '#jhCam'; the photo is chosen through the file input with q91/photos/bright.jpg): journal-header,
  journal-header-photo, journal-header-move, journal-home-photo, journal-home-photo-stripes, journal-compact-bar-photo. Remove photo
  asks with the browser's confirm(), so it has no screen. Proof on q91-photo (9d36e59, v116): `kit: OK: 10 steps passed, 2 item tests
  skipped (3539 s)`; contrast 86 screens, motion 94, inventory nothing removed (the 4 item 91 Privacy texts allowed), q91 324 checks.
- Reloads: on about 1 reload in 8-15, Chromium gives a file:// page a blank, throwaway localStorage (the next load sees the real
  store again; an http origin never does this). lib/open.mjs seeds once per open() with a token in localStorage and marks such a load
  `window.__kitFresh`; use `reload(p)` from lib/open.mjs in tests, which loads again when that happens. Measured with
  `node tools/reseed-probe.mjs <page> lib/open.mjs 150`: 0 lost in 600 reloads after the fix (before: 6-8 in 90). q91-q93 keep their
  own reload helpers (they put kept keys back) and pass with the new opener.
