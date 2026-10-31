# Handoff · fred queue · 2026-10-31

**Branch:** `claude/lucid-thompson-dc7gqa` (this session's branch) = `main` (items through 92, cache v117) + this file + `kit2/`
(a copy of the browser test kit; the live kit is the `kit-backup` branch). Item 93 is on its own branch, built but not yet reviewed.

## What we're building
fred is a one-file PWA (`index.html`, no build step, Firebase sync) that plans ride and run fueling (bottles, gels, sodium, caffeine)
from the forecast and the rider's settings, with a Journal, Volume (training load), Races and News. Mark (the owner) writes the work as
numbered items in `QUEUE.md`; each item is built on its own branch, reviewed, tested, logged in `QUEUE_LOG.md` and merged to main
(GitHub Pages deploys main). The current round is items 86–93 ("fred round, Oct 15"). Item 94 has no text yet.

## Branches
| Branch | What it holds |
|---|---|
| `main` | Items through 92 merged and logged (cache v117). Deployed. |
| `claude/lucid-thompson-dc7gqa` | main + this file + `kit2/` (copy of the kit). |
| `q93-wheel` | Item 93 (v118), built from main before 91; not yet reviewed. Merge main in before its review. |
| `kit-backup` | Orphan branch: the live test kit (worktree `<scratchpad>/kit2`). |
| `q91-photo`, `q92-deficit` | Items 91 and 92, merged (kept for reference). |

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
- Items 85–92 merged and logged. Item 91 (2026-10-30): 7 review rounds, 67 confirmed findings fixed, kit 10 steps OK, item test 324
  checks. Item 92 (2026-10-31): 7 review rounds, 70 confirmed findings fixed, kit 10 steps OK (101 screens), item test 285 checks,
  answer sheet 1,763 pass (with the deficit proof).
- The kit is rebuilt and proven (`runkit.sh` passes on main). Three kit bugs fixed: the How long screens open from `#tkBig` once 93
  lands; the contrast self-test clears `data-kc`; the opener's reload (the real cause was Chromium's throwaway file:// localStorage on
  about 1 reload in 8–15; an http origin never does it).
- Kit pre-run: item 93 alone fails two audits (below).

## What's broken or at risk
- **Item 93 is not reviewed.**
- **Item 93's kit pre-run:** (a) the motion audit flags `#durRead` and `#distRead` carrying `data-mo-live` permanently (the builder used
  the "number counting" mark so the refit observer skips the live readouts; prefer a dedicated mark); (b) the inventory lists 17 things
  gone from the How long sheet (`#howBtn`, `#howL`, the listbox wheels now spinbuttons, the hidden typed distance fields, old labels):
  the review must confirm each is intended before `inventory/allow.json` gets entries.
- **For Mark (item 91):** set up Firebase Storage (Blaze plan, enable Storage, publish `storage.rules`, set CORS once: README step 10);
  until then the photo works per device and in backups. Photo + stripes now stretches the stripes to the photo header's shape as on
  PDF p.8, so their angle differs slightly from plain Stripes: confirm.
- Not verified anywhere: real iPhone/Safari (HEIC, touch and trackpad pinch, VoiceOver), real Firebase Storage.
- On main, not fixed: with Firebase off, Settings › Account still shows "Continue with Google"; the bike field `bkbig-<id>` is drawn
  twice with the same id (the inventory audit lists it as known).
- A fresh container needs the Playwright browser shim before `npm test` works (`kit2/RESUME.md`).

## Next steps
1. Item 93: merge main into `q93-wheel` (resolve keeping both items; cache v118), run the review (`tools/review-item.js` as a
   Workflow: item, title, branch, base origin/main, spec lines, cache, maxRounds 7, strictFrom 4, refs, notes, tests; feed it the two
   pre-run audit failures above), then the kit step (`tools/kit-item.js`), the QUEUE_LOG entry and Done line ("Queue item 93 done: log
   entry"), merge `--no-ff` into main, `npm test` 0 fail, push main, then move this branch onto main again with this file and `kit2/`
   updated.
2. Item 94 when Mark sends its text.
3. For Mark, from 92's review: the newest settings copy still wins whole between devices, and a ride, race or weigh-in uploaded late by
   another device can wait for the daily full pull (on main before 92 too). Each would be its own sync item.
