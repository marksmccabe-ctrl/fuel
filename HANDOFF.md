# Handoff · fred queue · 2026-11-01

**Branch:** `claude/lucid-thompson-dc7gqa` (this session's branch) = `main` (items through 93, cache v118) + this file + `kit2/`
(a copy of the browser test kit; the live kit is the `kit-backup` branch). The Oct 15 round (items 86–93) is finished.

## What we're building
fred is a one-file PWA (`index.html`, no build step, Firebase sync) that plans ride and run fueling (bottles, gels, sodium, caffeine)
from the forecast and the rider's settings, with a Journal, Volume (training load), Races and News. Mark (the owner) writes the work as
numbered items in `QUEUE.md`; each item is built on its own branch, reviewed, tested, logged in `QUEUE_LOG.md` and merged to main
(GitHub Pages deploys main). The last round, items 86–93 ("fred round, Oct 15"), is done. Item 94 has no text yet.

## Branches
| Branch | What it holds |
|---|---|
| `main` | Items through 93 merged and logged (cache v118). Deployed. |
| `claude/lucid-thompson-dc7gqa` | main + this file + `kit2/` (copy of the kit). |
| `kit-backup` | Orphan branch: the live test kit (worktree `<scratchpad>/kit2`). |
| `q91-photo`, `q92-deficit`, `q93-wheel` | Items 91–93, merged (kept for reference). |

## Key files
- `index.html`: the whole app. `sw.js`: its `CACHE` must equal `APP_BUILD` in index.html, bumped once per item.
- `QUEUE.md` (the spec, `## NN · TODO|DONE · title`) and `QUEUE_LOG.md` (what each item did).
- `docs/design/`: Mark's PDFs and demos (`fred-round_2026-10-15_v1.pdf`, `fred-motion-3.html`, `fred-duration-wheel.html`).
- `tests/`: the answer sheet (`npm test`; 1,752 pass on main; item 92 adds `tests/engine/deficit.test.mjs`).
- `storage.rules` and README step 10 (item 91: Firebase Storage for the Journal photo).
- The kit (`kit-backup`, copied in `kit2/`): `RESUME.md` (container setup, the "Kit" section), `DECISIONS.md` (91–93),
  `lib/open.mjs` (page opener; `reload(p)` survives Chromium's throwaway file:// localStorage), `lib/screens.mjs` (86 screens; an
  item's screens carry a `needs` selector and are skipped on pages without it), audits `contrast/`, `layout/`, `inventory/`, `motion/`,
  `smoke/`, item tests `q91/`–`q93/`, `tools/runkit.sh` (everything in order, about an hour), `tools/mknull.sh` (test page with
  Firebase off), `tools/review-item.js` (the adversarial review workflow) and `tools/kit-item.js` (the kit-step workflow: screens,
  runkit.sh, a skeptic check).

## Decisions and standing rules
- Mark's rules: single index.html, no build step; keep element ids and saved data shapes; Firebase sync stays; contrast AA and large text
  (320 px, 200%) must pass (colours that fail AA are darkened with the spec value in a comment); Reduce Motion lands every motion at once;
  one branch per item, commit per step; bump the cache once per item; no model names in commits or files.
- Privacy: the Journal photo (91) and weigh-ins (92) are never sent to any AI; ride fueling never changes because of a deficit (92), with
  tests that prove it; fred sends no push notifications.
- Process (Mark chose full depth): up to 7 adversarial review rounds per item (rounds 4+ at a stricter bar), then the full kit with a
  skeptic check, then log and merge. 4 CPUs: one review or kit at a time, plus at most one builder.
- Item-specific decisions: `kit2/DECISIONS.md`.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and
  `Claude-Session: https://claude.ai/code/session_013LcSv3VsC77UxEUREZnsy7`

## What's done
- Items 85–93 merged and logged. Item 91 (2026-10-30): 7 review rounds, 67 confirmed findings fixed, item test 324 checks. Item 92
  (2026-10-31): 7 rounds, 70 fixed, item test 285 checks, the deficit proof in `npm test`. Item 93 (2026-11-01): 6 rounds (the sixth came
  back dry), 38 fixed, item test 209 checks. Each passed the full kit with a skeptic check; the last run (on 93) passed 12 steps with
  all three item tests, 106 screens audited. Answer sheet on main: 1,763 pass, 0 fail.
- The kit is rebuilt and proven, with three kit bugs fixed (the How long screens open from `#tkBig`; the contrast self-test clears
  `data-kc`; the opener's reload survives Chromium's throwaway file:// localStorage, which an http origin never shows).

## What's broken or at risk
- **For Mark (item 91):** set up Firebase Storage (Blaze plan, enable Storage, publish `storage.rules`, set CORS once: README step 10);
  until then the Journal photo works per device and in backups. Photo + stripes stretches the stripes to the photo header's shape as on
  PDF p.8, so their angle differs slightly from plain Stripes: confirm.
- **For Mark (item 92):** the newest settings copy still wins whole between devices (a weigh-in logged on a device that has not synced
  for a while can undo a setting changed on another), and a ride, race or weigh-in uploaded late by another device can wait for the
  daily full pull (on main before 92 too). Each would be its own sync item.
- Not verified anywhere: real iPhone/Android (HEIC, touch and trackpad pinch, haptics, Safari scroll snap, VoiceOver), real Firebase
  Storage.
- On main, not fixed: with Firebase off, Settings › Account still shows "Continue with Google"; the bike field `bkbig-<id>` is drawn
  twice with the same id (the inventory audit lists it as known).
- A fresh container needs the Playwright browser shim before `npm test` works (`kit2/RESUME.md`).

## Next steps
1. Item 94 when Mark sends its text: branch from main, build, then the same steps (`tools/review-item.js`, `tools/kit-item.js`, the
   QUEUE_LOG entry and Done line, merge `--no-ff`, `npm test`, push main, move this branch onto main with this file and `kit2/`).
2. Mark's Firebase console steps for item 91, and his calls on the two item 92 sync notes above.
