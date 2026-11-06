# Handoff · fred queue · 2026-11-05 (MacBook Pro → Mac Studio)

Written by the session that ran the queue on Mark's MacBook Pro (M1 Pro, 16 GB) from Nov 1 to Nov 5. Work moves to the Mac Studio
because the laptop sleeps (two long runs died with it) and has 16 GB. This file is on the `kit-backup` branch of
`marksmccabe-ctrl/fuel`; read it all, then `RESUME.md` (same branch: the "Mac setup" section and the standing rules) and `DECISIONS.md`.

## 1. Where everything is

| Branch (GitHub) | Holds | State |
|---|---|---|
| `main` | The deployed app: items through 93 plus item 95 (merged Nov 5 as 6a0e3d6, cache v119) item 96 (merged Nov 6 as 6a87e42, cache v120) and item 97 (merged Nov 6 as 2f8c5c9, cache v121), and the queue commits "Queue items 95-96" and "Queue items 97-106" (QUEUE.md text only) | Deployed main has items ≤ 97 (94 waits for its text) |
| `kit-backup` | The browser test kit (`kit2/`), this file, `RESUME.md`, `DECISIONS.md`, `review/fred-world-findings-2026-11-05.json` | Current |
| `q95-small` | Item 95, built, reviewed (4 rounds, dry), kit step done, logged | Merged into main (6a0e3d6) |
| `q96-sync` | Item 96, built, reviewed (7 rounds, ended at eafa457), main (item 95) merged in (c05e5a5, v120), kit step OK (Nov 6) | Merged into main (6a87e42) |
| `q97-fw-plumbing` | Item 97, built, reviewed (6 rounds, round 6 dry, ended at 3dce12f, v121), kit step OK after a skeptic (Nov 6), logged | Merged into main (2f8c5c9) |
| `claude/lucid-thompson-dc7gqa` | The Nov 1 cloud handoff (HANDOFF.md, old kit copy) | Old: superseded by this file |

Folder layout (recreate it on the Studio; the laptop used exactly this):
- `~/code/fuel`: Mark's main checkout (never edit it directly; queue commits go on `main` there).
- `~/code/fuel-work/kit2`: worktree of `kit-backup` (`git -C ~/code/fuel worktree add ~/code/fuel-work/kit2 kit-backup`).
- `~/code/fuel-work/wt-q95`, `wt-q96`: worktrees of `q95-small`, `q96-sync`. Each item later gets `wt-qNN` on branch `qNN-…` from main.
- `~/code/fuel-work/fred/null.html` (main), `fredNN/null.html` (item NN): built with `sh kit2/tools/mknull.sh <checkout> <outdir>`.
- `node_modules` in kit2 and every `wt-qNN` is a symlink to `~/code/fuel/node_modules` (`npm ci` there, then
  `npx playwright install chromium webkit`).
- The kit finds the repo through git (`lib/paths.mjs`), and SCRATCH = the kit's parent folder. On a Mac there's no GNU `timeout`:
  `runkit.sh` falls back to `tools/timeout.pl`; run tests as `perl tools/timeout.pl <s> node …`.
- The review workflows (`tools/review-item.js`, `tools/kit-item.js`) are run with the Workflow tool's `scriptPath`. That only works
  for a folder the session can read: add `~/code/fuel-work` to the session first (`request_directory`). Pass
  `scratch: "<home>/code/fuel-work"` and `repo: "<home>/code/fuel"` in their args (the defaults are the laptop's paths, which are the
  same if the Studio's user is also `markmccabe`). `kit-item.js` also takes `extra` (run notes for its agents).

## 2. Process (Mark's choice, Nov 1: full depth)
Per item: build on its own branch (commit per step, cache bump once per item, CACHE = APP_BUILD) → write the kit item test
`kit2/qNN/qNN.test.mjs` (must fail on main) → review workflow (up to 7 rounds; rounds 4+ stricter; `maxRounds: 7, strictFrom: 4`) →
kit workflow (whole kit via `runkit.sh` plus a skeptic check) → log in `QUEUE_LOG.md` and mark DONE in `QUEUE.md`
("Queue item NN done: log entry") → `git merge --no-ff` into main, `npm test` 0 fail, push main (deploys). Commit trailer, nothing else:
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. No model names in files or commits.
Laptop timings: a review took 25–60 min, a full kit run ~75 min. Item 94 is Mark's; it has no text yet.

## 3. Item status

### 95 · Two small bugs (+ point 3) · branch `q95-small` · cache v119
- Built: sync off hides Continue with Google (accGo re-showed `#syncCard`); the Bottles sheet's 1 L bottle label is `bbbig-<id>`
  (editor keeps `bkbig-`). **Point 3, added by the app chat, Mark has not confirmed it:** `#jhpMoveBtn` uses `aria-disabled`
  (not `disabled`) so a photo from another device keeps focus in the Header sheet. Found because q91 fails one check on main on the
  Mac; with point 3, q91 passes 324/324.
- Review: 4 rounds, dry; 4 confirmed findings, all kit-test fixes (in kit-backup).
- Kit step: started, did not finish (the laptop's session ended). Its WIP is committed: the inventory `bkbig` entry is now
  `until: 95` (known only while item 95 isn't in the checkout; `runkit.sh` passes `INV_REPO`), and DECISIONS.md "Item 95".
  Finished on the Studio (Nov 5): no app change; q95 got a move section for point 3 (a skeptic found none); every merged item's test
  ran on the page: `kit: OK: 13 steps passed, 1 item tests skipped (4210 s)`, q91 324/324 (DECISIONS.md "Item 95").
- **Next:** run `tools/kit-item.js` for 95 (`item 95, branch q95-small, head 40b3bd7, kitBase 6d09fa0, spec "1799-1820", cache v119`;
  the skeptic reads app changes since 40b3bd7, which includes point 3). Then log, merge. Delete the `bkbig` entry after the merge.
- Done: logged and merged 2026-11-05 (main 6a0e3d6, v119; deployed); the `bkbig` entry is deleted (DECISIONS.md "Item 95").

### 96 · Sync key by key, pull by upload time · branch `q96-sync` · cache v120
- Built: settings sync per top-level key (`SY.meta.sF` stamps, `sD` queue; cloud `users/{uid}.settingsAt` with `_u`; flush writes
  only `settings.<key>` paths; older-build docs detected by `settings.updatedAt !== settingsAt._u` and normalised; the dfc / bike-tomb /
  header guards run on the merged doc). Every record carries `syncedAt` (serverTimestamp); the incremental pull asks `updatedAt > at`
  OR `syncedAt > sat`. `tests/engine/deficit.test.mjs` tripwire lists `sfDocMerge`.
- Kit test `q96/q96.test.mjs` (two devices on `q91/fbmock.mjs`, which now has Timestamp, serverTimestamp, deleteField and dotted
  mergeFields): passes on 96, its fields/late scenarios fail on main.
- Review: round 1 part 1 committed (an older build's queued settings edit survives the upgrade; sign-in uploads merged settings).
  Part 2 is committed as **WIP, untested** (`q96 WIP review round 1 (part 2, untested)`: the `updatedAt` cursor follows rides and
  races again; `sat` follows every kind). The review stopped there.
- Plan on Nov 5 (all but "log, merge" done by Nov 6, next bullet): rerun `q96.test.mjs` and `npm test` on the WIP; then a fresh
  review workflow for 96 (base `7016e8a`; tell it round 1's fixes are in) → merge main (with 95) into q96 → kit workflow → log, merge.
- Nov 6 (Mac Studio): review done (7 rounds, ended at eafa457), main (item 95) merged in (c05e5a5, v120), kit step OK with every
  merged item's test (DECISIONS.md "Item 96").
- Done: logged and merged 2026-11-06 (main 6a87e42, v120). README's Known limits now say settings merge key by key.
- Closed (was the known open point from the fred world review: a settings key that exists only as a DEFAULT_SETTINGS default got
  stamped by any unrelated save and could then overwrite another device's value). Fixed in review round 1 (wt-q96 8d426a2): sfNote
  skips a key the stored copy lacks that still holds its default, and sync boot writes the boot-normalised settings to the stored
  copy unstamped, so an unrelated save stamps only what the user changed. q96's "defaults" section checks it (passed in the kit step:
  "A s unrelated save queues only the race name (no default or boot-filled key gets a stamp)"). Items 97+ may add defaults.

### 97–106 · fred world · queued in QUEUE.md (on main) on Nov 5
- Source: the design chat's handoff in `~/Downloads/handoff/` (HANDOFF.md, fred-world.js/.css bundle, real/, brand guide) and the
  sources in `~/Downloads/fred-world/fred-world/` (build-bundle.py, review.html). **They are not in the repo:** Mark copies both
  folders to the Studio.
- The app chat reviewed it (8 reviewers, 3 skeptics per finding: 132 findings, 121 confirmed; all of them in
  `review/fred-world-findings-2026-11-05.json`, with evidence and corrections). Mark approved the rewrite now in QUEUE.md: the round
  notes ("RULES FOR ALL TEN", "BUNDLE FIXES") and items 97–106, in build order.
- The design chat has to fix its sources first: `~/Downloads/handoff/FROM-APP-CHAT.md` is the paste-ready list (15 fixes, each tied
  to the item that needs it; 97 needs fixes 1–8). Check with Mark that it was sent and the rebuilt bundle arrived before building 97.
- The design chat's v4 (built Nov 6 06:14, `~/Dropbox/00_T/handoff`) has all 15 fixes (an independent verify run).
- Nov 6 (Mac Studio): item 97 built on `q97-fw-plumbing`, reviewed (6 rounds, round 6 dry, ended at 3dce12f, v121), kit step OK
  with every merged item's test, again after a skeptic (new screen desktop-settings-fw: the group on the computer layout)
  (DECISIONS.md "Item 97"). Logged and merged 2026-11-06 (main 2f8c5c9, v121).
- **Next: item 98**, but only once the design chat has rebuilt the bundle with points 1 and 2 of
  `~/Dropbox/00_T/handoff/FROM-APP-CHAT-2.md` (fred world's own blue/green/teal tokens; a viewBox wide enough for the umbrella and
  the fog beam). That note asks for 9 fixes in all, each tied to the item that needs it (99: 3-4; 101: 5; 102: 6; 103: 7 and 9).
  Check with Mark that it was sent, verify the rebuilt bundle (new build time; each point in), then re-inline it on the item's branch
  with `node scripts/fw-inline.mjs`.
- Recommended answers Mark accepted with the rewrite: the sky card is a white box with the app's sky faded in at the top and hides
  after Crunch; characters settle after 6–8 s (no endless loops); a clear night keeps the still moon; KOM Kitty only in the front-page
  box, no icon swap, own tail mark, only if on main by Jan 1; crew consent recorded in docs/LEGAL.md and personal details out of the
  bundle; care holidays signed off by people who celebrate, plus their own switch; rider: full skin-tone range, initials until built.
- Rendering the spec PDFs on a Mac with no poppler: `swiftc -O tools/pdf2png.swift -o <scratch>/pdf2png` then
  `<scratch>/pdf2png <file.pdf> <outprefix>` (PNG + text per page).

## 4. The kit on the Mac (changes since the cloud)
- Paths derived (`lib/paths.mjs`, runkit.sh), `tools/timeout.pl`, workflows take `args.scratch`/`repo`/`extra`, node_modules untracked.
- Baseline on main (Nov 1, laptop): fixed since: q93's plan check now drives a main that already has item 93; layout's KNOWN_ON_MAIN
  has a **darwin-only** entry for `#runCarryN` (31 px wide with the Mac's fallback font; reported to Mark, not fixed in the app);
  q91 fails one focus check on main until item 95 (point 3) merges. A full clean baseline after these fixes was not rerun: run
  `runkit.sh` on main once on the Studio first (it also shows whether the Studio renders like the laptop).

## 5. Open items for Mark
- **GitHub sign-in.** Git on the laptop had no GitHub login, so nothing since Nov 1 was pushed until Mark signs in (a classic token
  with `repo`, used once by `git push` in Terminal; the keychain keeps it). The Studio needs the same once.
- Confirm item 95 point 3 (Header sheet focus).
- Item 94's text.
- From Nov 1: README step 10 says Storage location "US": change it to "No cost location, US-EAST1" next time README is touched;
  confirm `gsutil cors get gs://bluebird-fuel.firebasestorage.app` shows the fuel.bluebirdmultisport.com origin; the two-device photo
  check and the 5-minute iPhone checklist (Journal photo, the ride ticket's wheel, a weigh-in becoming the Profile weight).
- `#runCarryN` is 31 px wide on Macs (Settings › Run carry › How many): fix in the app (a min-width) or confirm it's Mac-only.
- **New, found by the item 95 kit step on the Studio (Nov 5), on main too:** Plan › Save to Journal at 150% and 200% text: the fixed
  "Saved to Journal ✓ · View ›" strip (`#planSaved`, shown 5 s) sits over the sticky Crunch bar and covers most of "Crunch the plan"
  for those 5 s, at every width (430 px 150%: Crunch 710-766, strip 730-783). The layout audit carries it as known on main
  (`calcBtn + planSavedView` on plan-saved); an app fix (for example the strip placed above the Crunch bar) should end it, with that entry removed.
- **Found by item 96's review, on base 7016e8a too (not item 96):** in Playwright WebKit any sync redraw of the Journal list sends the
  page to the top (scrollY 0). q96's noscroll section (a pull never moves the page) runs in Chromium only because of it. Worth a check
  in Safari on an iPhone: scroll down the Journal list, let a sync bring another device's change, see whether the page jumps to the top.
