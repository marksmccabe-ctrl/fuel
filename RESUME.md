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
