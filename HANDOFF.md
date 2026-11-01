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
- `tests/`: the answer sheet (`npm test`; 1,763 pass on main, including item 92's `tests/engine/deficit.test.mjs`).
- `storage.rules` and README step 10 (item 91: Firebase Storage for the Journal photo).
- The kit (`kit-backup`, copied in `kit2/`): `RESUME.md` (container setup, the "Kit" section), `DECISIONS.md` (91–93),
  `lib/open.mjs` (page opener; `reload(p)` survives Chromium's throwaway file:// localStorage), `lib/screens.mjs` (106 screens; an
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
- Process so far (Mark chose full depth): up to 7 adversarial review rounds per item (rounds 4+ at a stricter bar), then the full kit
  with a skeptic check, then log and merge; about a day per item on the 4-CPU cloud container. **On 2026-11-01 Mark said tasks take
  too long.** Suggested lighter process: build, 2 review rounds, one kit run with the skeptic check (a few hours per item). Mark's first
  message in the new chat says which; if it doesn't, ask once before starting.
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

## Mark's decisions, 2026-11-01
- **Photo + stripes:** keep the stripes stretched to the photo header's shape, as on PDF p.8 (no change).
- **Sync gaps from item 92's review: fix them** (queue as an item, see Next steps).
- **The two small bugs on main: fix them** (queue as an item, see Next steps).

## Firebase Storage (item 91), set up by Mark on 2026-11-01
- Bucket `gs://bluebird-fuel.firebasestorage.app` created: **No cost location, US-EAST1**, Standard, production mode. README step 10
  still says location "US": change it to the no-cost US-EAST1 the next time README is touched.
- Rules: Mark pasted `storage.rules` into Storage › Rules and published. CORS: Mark ran the README step 10 commands in Cloud Shell
  (after `gcloud config set project bluebird-fuel`; Cloud Shell had opened on another project).
- **Not yet confirmed:** `gsutil cors get gs://bluebird-fuel.firebasestorage.app` shows the fuel.bluebirdmultisport.com origin, and the
  two-device check (README checks, item 11: choose a photo on device A, it appears on B; Remove photo empties `users/<uid>/`).

## What's broken or at risk
- Not verified anywhere: real iPhone/Android (HEIC, touch and trackpad pinch, haptics, Safari scroll snap, VoiceOver), real Firebase
  Storage end to end. Mark was given a 5-minute iPhone checklist (Journal photo and Move and zoom; the ride ticket's wheels and tick;
  a weigh-in becoming the Profile weight).
- A fresh cloud container needs the Playwright browser shim before `npm test` works (`kit2/RESUME.md`).
- **The kit's scripts hard-code this cloud session's scratchpad** (`/tmp/claude-0/-home-user-fuel/dab8bf2b-.../scratchpad`, e.g. `S` in
  `tools/review-item.js` and `tools/kit-item.js`, paths in `RESUME.md` and some tests' defaults). In a new session, first point them at
  the new location (better: derive them from the script's own folder or an env var).

## Next steps
1. **Where to work:** Mark has a Mac Studio; working there (Claude Desktop app, or `claude remote-control` in a clone of the repo) gives
   many more cores than the 4-CPU cloud container (reviews ran 2 agents at a time here), no container restarts, and Safari/WebKit for
   tests. On a Mac, install Playwright's browsers normally (`npx playwright install`); the shim and the "never run playwright install"
   rule in `kit2/RESUME.md` are only for the cloud container. The live kit is the `kit-backup` branch (`git worktree add <dir>
   kit-backup`); link its `node_modules` to the repo's.
2. **Item 94** when Mark sends its text (it goes in `QUEUE.md`): branch from main, build, review, kit, log, merge, as before.
3. **Queue and do the two approved fixes** (next free item numbers after Mark's 94; write each as a `## NN · TODO · ...` item in
   QUEUE.md first, in Mark's style, and say what it is in the log):
   - **Small bugs:** (a) with Firebase off (`FIREBASE_CONFIG = null`), Settings › Account still offers "Continue with Google": hide the
     sign-in there when sync is off; (b) `bikeBigHtml(b)` writes `id="bkbig-<bike id>"` and is drawn both in the bike editor
     (`#bikeList`) and in the Bottles sheet (`#bottlesBig`, `renderBottlesExtra`), so the id is in the page twice and the second group's
     `aria-labelledby` points at the first: give each copy its own id, then remove the `bkbig` entry from the inventory audit's
     KNOWN_ON_MAIN list.
   - **Sync:** (a) settings merge whole-doc, newest wins: a device that has not pulled for a while uploads its whole settings doc when it
     saves (for example a weigh-in that sets the Profile weight) and can undo a setting changed on another device; merge field by field
     (or per section with its own updatedAt) without breaking the existing guards (`dfcGuard`, `jhpDocMerge`, `bikeTombMerge`); (b) the
     incremental pull cursor follows only rides and races, so a note, weigh-in, ride or race uploaded late by another device (saved
     offline, synced later) can be missed until the daily full pull: give every record an upload stamp (server time when it reached the
     cloud) and pull by that. Both need care and tests with two devices (the kit's stand-in Firebase in `kit2/q91/fbmock.mjs` and the q92
     sync section show how).
4. README step 10: location "No cost location, US-EAST1" (see above).
