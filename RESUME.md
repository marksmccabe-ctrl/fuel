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

## Mac setup (Mark's MacBook Pro: M1 Pro, 10 cores, 16 GB; from 2026-11-01)
Folders: the repo is `~/code/fuel` (Mark's checkout: never edit it directly); everything else is in `~/code/fuel-work` (the kit's
parent folder, `SCRATCH` in lib/paths.mjs): this kit at `kit2/`, item worktrees `wt-qNN/`, built pages `fred/` (main) and `fredNN/`.
1. `git -C ~/code/fuel worktree add ~/code/fuel-work/kit2 kit-backup`.
2. `cd ~/code/fuel && npm ci && npx playwright install chromium webkit` (on a Mac, install browsers normally; the shim below is cloud only).
3. `ln -sfn ~/code/fuel/node_modules ~/code/fuel-work/kit2/node_modules` (and the same into each `wt-qNN/`). node_modules is ignored.
4. Pages: `sh tools/mknull.sh ~/code/fuel ~/code/fuel-work/fred` (main), `sh tools/mknull.sh ~/code/fuel-work/wt-qNN ~/code/fuel-work/fredNN`.
Paths are no longer hard-coded: lib/paths.mjs finds the repo (FRED_REPO, else the main worktree of the git repo the kit is a worktree
of) and SCRATCH (the kit's parent); runkit.sh does the same; tools/review-item.js and tools/kit-item.js take `args.scratch` (default
`~/code/fuel-work` on Mark's Mac). macOS has no GNU `timeout`: runkit.sh falls back to tools/timeout.pl (same exit 124), and test
commands use `perl tools/timeout.pl <s> node ...`. 10 cores: two reviews or a review and a kit run can share the machine.

## Container setup after a swap (the cloud container only)
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
  "Queue item NN done: log entry". Merge: `git merge --no-ff BRANCH`, check, `npm test` 0 fail, push main. (No more mirror
  push to claude/lucid-thompson-dc7gqa: it served the old cloud session; stopped 2026-11-05 on the Mac Studio. That branch stays at
  140050f, main before item 95.)
- Commit trailer (and no model names anywhere else):
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  (the cloud session added a Claude-Session line; sessions on the Mac have none)
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
  Env: `KIT_ITEMS="91 93"` / `all` / `none` overrides the item choice. Leave it unset for an item's proof run, so the tests of every
  item merged before it run on its page too (item 95's first kit run had KIT_ITEMS=95 and left q91, the only test of its point 3,
  out). q93 gets `KIT_MAIN` (default <scratchpad>/fred/null.html) as its main page. `QNN_REPO` defaults to the checkout.
  `KIT_TIMEOUT` defaults to 1500 s per step.
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
  and prints `<name>: skipped (needs <selector>)`, so the audits still run on main and on branches that have not merged the item. Each
  audit's screen count is the screens it audited (layout's from run()'s results; its line adds `, N skipped (needs <selector>)` when
  any were skipped, e.g. `2 screens ... 6 skipped (needs #jhCam)` on main for the Journal ones). Item 91
  added six (needs '#jhCam'; the photo is chosen through the file input with q91/photos/bright.jpg): journal-header,
  journal-header-photo, journal-header-move, journal-home-photo, journal-home-photo-stripes, journal-compact-bar-photo. Remove photo
  asks with the browser's confirm(), so it has no screen. Proof on q91-photo (9d36e59, v116): `kit: OK: 10 steps passed, 2 item tests
  skipped (3539 s)`; contrast 86 screens, motion 94, inventory nothing removed (the 4 item 91 Privacy texts allowed), q91 324 checks.
  Again after the layout count fix (b6e785b): `kit: OK: 10 steps passed, 2 item tests skipped (3590 s)`; layout 83 screens (249
  opened) at 320/375/430 and 86 (258) at 390, nothing skipped there. On main's page the Journal screens give `2 screens ... 6 skipped
  (needs #jhCam)`.
- Item 92 added fifteen (needs '#jneTiles [data-jne=weigh]', the + New entry Weigh-in tile; seeds 'weights' = weigh-ins every Mon and
  Thu May 4 to Oct 26, a finished deficit Aug 31-Sep 27 and a current one from Oct 5, week 4 of 8 on the kit's Thu Oct 29, a reminder
  day with no weigh-in; 'weights-done' = without the current one): journal-weigh-in, journal-weigh-in-date (the day line tapped: Date
  and Clock time), journal-weigh-in-edit (Delete row), journal-home-weight, journal-list-weight, journal-list-all-weight (the "−x
  total" pill), journal-list-all-deficit (Deficit started, Deficit ended), journal-weigh-in-metric, volume-deficit (lime card, Weigh
  in), volume-deficit-metric, volume-view-deficit, volume-weeks-deficit (band, weight line), deficit-sheet-new, deficit-sheet-current
  (End deficit), settings-profile-weigh-in. journal-new-entry already shows the 8 tiles. A settings object two seeds both give (volume:
  goals + deficits) merges one level down. journal-weigh-in-date came after a skeptic found the kit had left it out: there the global
  input[type=date|time]::-webkit-datetime-edit{line-height:21px} cut the bottom of the 24/32 px day and time at 150%/200% (layout clip,
  4 new at 320 and 390); the app fix (1d22f01) gives #wghSheet's fields line-height:normal there (not inherit: the field's own line is
  21px), and q92's 320/200% section checks that line too. Proof on q92-deficit (1d22f01, v117, main with item 91 merged in),
  `KIT_ITEMS=92`: `kit: OK: 10 steps passed, 2 item tests skipped (4064 s)`; contrast 101 screens, layout 98 (294 opened) at
  320/375/430 and 101 (303) at 390, inventory nothing removed, motion 109, q92 285 checks. With KIT_ITEMS set, a skipped item's line
  said "not in this checkout" (q91 there) until 2026-11-05; it now says "skipped, not chosen (KIT_ITEMS=...), but item NN is in this
  checkout", and the kit line counts those. Once, `node motion.test.mjs <page> '<item 92 screens>'` sat idle (no CPU)
  in its Reduce Motion pass for 20 minutes and was stopped; the later runs (those screens again, each pass alone and together, then the
  whole kit) passed; MO_DEBUG=1 names the screen if it comes back.
- Item 93 added five (needs '#tkBig[aria-haspopup]', the ticket's big number as the How long button; plan-how-time and
  plan-how-distance already open How long from #tkBig when #howBtn is gone): plan-ticket-distance (How long › Distance › Done: "40 mi ·
  17 mph" over "about 2 h 21 m"), plan-how-run (a run's Distance pane: miles in tenths, Pace in "/mi"), plan-how-metric (km, km/h),
  plan-how-time-stacked (390 px, 200%) and plan-how-distance-stacked (320 px, 200%): each pair stacked, each wheel in its own box with
  its own band, the sheet scrolled to its end so both bands show. A screen can now carry its own text size (`scale: 2`) for a state that
  only larger text shows: contrast, motion and inventory see it at that size; layout, which sets 100/150/200% itself, audits it at that
  size only, at each width. The wheels stack at 150% (the Distance pair) and 200% (both pairs) at every width, and at 125% at 320 px.
  Inventory: allow.json lets the 17 How long losses pass, each with its reason (#howBtn and #howL; the four listbox wheels, now
  spinbuttons with the same ids; their aria-hidden option rows; #distMi, #distMph and #distTime, which main showed despite hidden; the
  texts "# h # m", "# mi", "avg speed", "minutes" and "ride time about # h # m"). Proof on q93-wheel (e2b21c6, v118, main with items 91
  and 92 merged in), `KIT_MAIN=<scratchpad>/fredm/null.html KIT_ITEMS='91 92 93'`: `kit: OK: 12 steps passed, 0 item tests skipped
  (4731 s)`; answer 1763 pass, contrast 106 screens, layout 103 (305 opened) at 320/375/430 and 106 (314) at 390, inventory nothing
  removed, motion 114, q91 324 checks, q92 285, q93 209. No app change was needed. On main's page (fredm) the five print
  `skipped (needs #tkBig[aria-haspopup])`.
- Item 95 brings no screens (settings-bottles and journal-header show its two fixes). Proof on q95-small (b750e93, v119, main 7016e8a
  with items 91-93 merged), KIT_ITEMS unset, `KIT_MAIN=kit95/fredmain/null.html` (main 7016e8a, v118), Mac Studio: `kit: OK: 13
  steps passed, 1 item tests skipped (4210 s)`; contrast 106 screens, layout 103 (305 opened) at 320/375/430 and 106 (314) at 390,
  inventory nothing removed (the bkbig entry off: item 95 is in the checkout), motion 114, q91 324, q92 285, q93 209, q95 46 checks.
- Item 96 brings no screens (sync logic only: its diff from main adds no ids or markup) and no exemptions. Proof on q96-sync (c05e5a5,
  v120, main 6a0e3d6 with item 95 merged in), KIT_ITEMS unset, KIT_MAIN default (fred/null.html = main 6a0e3d6, v119), Mac Studio:
  `kit: OK: 14 steps passed, 0 item tests skipped (5116 s)`; answer 1763 pass, contrast 106 screens, layout 103 (305 opened) at
  320/375/430 and 106 (314) at 390, inventory nothing removed, motion 114, q91 324 (its sync focus check passes with item 95 in),
  q92 285, q93 209, q95 43 (its 3 not-vacuous checks skip: main has item 95 now), q96 101 (903 s). No app or kit change was needed.
- Item 97 brings three screens (needs '#prowBtn-worldmotion'): settings-fw and settings-fw-run (review round 2), Settings scrolled
  to the fred world group (Animate the world) on the Cycling and Running sides (they look alike: the run's graphite is on Plan only),
  and desktop-settings-fw (kit step, after a skeptic: the same group on the computer layout, 1280 x 800, opened from the sidebar's
  #sbAcct; at 150%/200% text that window is not the computer layout, so it opens from the header's button there). No screen shows
  fred world art until item 98. Proof on q97-fw-plumbing (3dce12f, v121, main 6a87e42 + item 97), KIT_ITEMS unset, KIT_MAIN default
  (fred/null.html = main 6a87e42, v120), Mac Studio: `kit: OK: 16 steps passed, 0 item tests skipped (5585 s)`; answer 1763 pass,
  contrast 109 screens, layout 105 (311 opened) at 320/375/430 and 109 (323) at 390, inventory nothing removed, motion 117, budgets
  109 screens (all zeros) + self-tests, q91 324, q92 285, q93 209, q95 43, q96 101, q97 128. No app change and no new exemption in
  the kit step. On main's page the three print `skipped (needs #prowBtn-worldmotion)`. Merged Nov 6 (main 2f8c5c9, v121): fred/null.html is now
  main with item 97, so the three screens run on main from here on.
- Item 98 brings 19 screens (needs 'css:.rwx-fred': a stylesheet rule names his layer, since fred is drawn only after a Crunch;
  run() reads `needs: 'css:<text>'` that way): plan-wx-fred-<sky> and run-wx-fred-<sky> for item 87's eight skies (?sky=, through
  open()'s new opts.query / a screen's query) and night (the ride at 8 pm: the made-up forecast is dark from 7 pm, so no sky and
  fred's still night vest), on the ride's #rWeather and the run's #runWx (graphite), and desktop-wx-fred (1440 x 900, rain: at
  1280 the results column gives the box 276 px, under fred's 340 px cut). New test q98/q98.test.mjs. q97's 'main' section skips on
  a main page that has item 97, and its 'still' section allows item 98's fred (LATER) only inside wxFred's body. q98 whole takes
  about 9.5 min on the Mac Studio: under a 10 min step, run it in three parts with Q98_ONLY (cache,looks,size,room,desk,enter,media,
  once,main; keep,settle,pause,still,self; remake,self2). motion's fw-l-in and fw-speed selectors follow the page's bundle build (main's 06:14: fw-l-in ungated; before v5, 19:46: '.fw-speed i').
  q98/reach98.mjs <page> prints fred's painted reach through his whole move in every weather look (q98 size uses its sampler).
- Reloads: on about 1 reload in 8-15, Chromium gives a file:// page a blank, throwaway localStorage (the next load sees the real
  store again; an http origin never does this). lib/open.mjs seeds once per open() with a token in localStorage and marks such a load
  `window.__kitFresh`; use `reload(p)` from lib/open.mjs in tests, which loads again when that happens. Measured with
  `node tools/reseed-probe.mjs <page> lib/open.mjs 150`: 0 lost in 600 reloads after the fix (before: 6-8 in 90). q91-q93 keep their
  own reload helpers (they put kept keys back) and pass with the new opener.
