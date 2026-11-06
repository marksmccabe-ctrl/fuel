# Decisions already made for items 91–93 (recovered from the session; the plan files were lost)

## Item 91 · Journal: your own header photo (cache v116)
- Process on the device: honour EXIF orientation, at most 1600 px on the long side, JPEG quality .82 through a canvas (strips all
  metadata including location), stepping quality down until ≤ 400 KB; cut any metadata segment left in the bytes.
- Keep it in IndexedDB (fred-journal › header › photo = {buf, at, w, h, up}); show from a local blob: URL; settings.journalHeader =
  {style, x, y, zoom, updatedAt, photoAt}. Sync to Firebase Storage users/{uid}/journal-header.jpg via a lazily loaded Storage SDK (same
  gstatic version), read with getBlob, never a download URL. photoAt tells a second device whether its copy is current.
- Storage not available (not enabled, offline, rules missing): works on the device and in Back up / Restore, one quiet note in the
  sheet, nothing else breaks. New storage.rules at the repo root (owner-only, image/jpeg, < 600 KB) and a README step (Mark: enable
  Storage on the Blaze plan, publish the rules, set CORS once).
- Never send the photo to any AI: only the account's own Storage upload may carry the bytes. Remove photo deletes local and Storage
  (asks first). Delete my account deletes Storage before Firestore; erase / account switch clear the local copy.
- Back up / Restore carries the photo (re-encoded on restore, ≤ 1 MB accepted).
- White text over a photo stays AA: adaptive scrim band behind "My Journal" only when the photo there is bright (sample at full
  resolution, guard small bright spots); camera circle black 45% over a photo (35% on stripes).
- Sheet: three thumbnails as one radio group (Photo · Photo + stripes · Stripes), Choose photo, Move and zoom, Stripes only, Remove
  photo, and a Done button. Move and zoom: a full-screen sheet the header's exact shape on every width, drag, pinch (and trackpad pinch),
  arrow keys, Zoom and position sliders usable by screen readers; Done saves, Cancel or Escape drops it.
- In Photo + stripes the photo stays still and only the stripes sweep (item 90). The photo does not print.
- Lessons from the first build's 7 review rounds (bake these in from the start): the newer photo always wins between devices (compare
  photoAt, never let an older upload overwrite a newer one); a device only takes the photo settings name; nothing stays in Storage
  that settings no longer name; uploads and deletes must not race (serialize; an in-flight upload after Remove is deleted when it lands);
  retries back off; an offline Remove must not delete another device's newer photo; a new photo chosen while an upload is in flight is
  uploaded after it; restoring a backup without a photo keeps Storage consistent; Move and zoom shows a visible focus ring (also in
  forced colors) and does no full-app refit per frame; the compact bar must not wrap at large text; the sheet's status note must not
  stick or repeat for screen readers; every function name must be unique (the first build once replaced jhShow by reusing its name).
- Kit to update: q90-style Journal entrance (the camera pops with the +), accept (camera black 35% tint, the scrim block), screens.

## Item 92 · Deficit and weight (cache v117)
- Journal + New entry gets Weigh-in and Deficit tiles (8 tiles). Weigh-in sheet: day and time, one big number (lb or kg), change since
  last, Before/After ride, note, keypad; 50–700 lb / 25–320 kg; Delete asks. Weight row on the Journal home and a weight list.
- The newest weigh-in becomes the Profile weight. Volume › View gets a Deficit row and a deficit sheet (Monday start, 1–16 weeks,
  0.5 / 0.75 / 1 lb a week, reminder days, "Ride fueling: Stays full", "fred sends no notifications."). A lime card above the season /
  off-season card; a deficit band and weekly weight line on the year chart.
- Data: weigh-ins bluebird.weights.v1 {id,date,time,lb,when,note,createdAt,updatedAt} syncing to users/{uid}/weights like notes (newest
  edit wins, tombstones); settings.volume.deficits (≤ 50) and settings.volume.weighDays. Fix volNorm so it keeps them, and guard against
  an older cached build's settings (no deficits key) erasing them. Backup includes weights.
- Proofs: tests/engine/deficit.test.mjs (every golden ride, 200 random rides and the runs identical with and without deficits and
  weigh-ins; static check that nothing reachable from the engine, Crunch or Adjust reads them; a tripwire listing where that code may
  live). Drop settings.weightLb from the troubleshooting copy; no AI prompt carries weights; no push notifications.
- Colours: card labels full ink #2C3208, the bar mark white with a 1 px ink edge, Weigh in button white 92% with ink; gradient stops
  as the spec. Profile weight in kg shows one decimal.

## Item 93 · Ride ticket: tap the number, spin the wheel (cache v118)
- The ticket's big number (#tkBig, a button with aria-haspopup=dialog) opens How long; the Duration button (#howBtn, #howL) is gone.
  Accessible name "How long: 5:00 hours. Change" (distance: "How long: 100 mi · 18 mph, about 5 h 33 m. Change").
- Wheels rebuilt to the demo (docs/design/fred-duration-wheel.html): 44 px band, 236 px box, drum tilt, value changes live, haptic()
  from the demo plus one line returning focus; WHEEL_DRAG fallback coded and off. Each column is a role=spinbutton (Up/Right +1,
  Down/Left −1, Page ±4, Home, End, digits); the row list is aria-hidden; faded off-centre rows get a named contrast exemption.
- Reduce Motion: no tilt and no smooth scrolls; opacity steps and the tick stay.
- Ticket gradient first stop #10759D (spec #1283AF fails AA); wheel unit labels in body text colour.
- The plan is unchanged for the same duration (compare against main for several durations and a distance ride).

## Item 95 · Two small bugs: sign-in with sync off, the 1 L bottle label id (cache v119)
- Sync off (FIREBASE_CONFIG null): Settings › Account has no Continue with Google (#syncCard hidden). With sync on, nothing changes.
- The Bottles sheet's copy of "Cages that fit a 1 L bottle" gets its own id bbbig-<bike id> (the bike editor keeps bkbig-); each
  chip group's aria-labelledby points at its own label. bigCages unchanged.
- Point 3: Move and zoom (#jhpMoveBtn) is turned off with aria-disabled (as Choose photo), not disabled, so the focus stays in the
  Header sheet; a tap or Enter while it is off does nothing (jhpMoveOpen returns). q95's move section checks both (added in the kit
  step after a skeptic found the section missing): with no photo, and while a chosen photo is held in "Getting your photo ready…" (the
  test makes createImageBitmap wait), Move and zoom has aria-disabled and is not disabled, the focus on it stays on it in the sheet, and
  a tap, Enter or Space opens nothing; once ready, a tap opens it on the new photo. It fails on main (disabled, the focus drops to the
  page: 6 checks) and on a page without the jhpMoveOpen guard (a tap opens Move and zoom on the old photo: 2 checks). q91's sync check
  covers the other way in: a photo from another device with the focus on Move and zoom.
- Kit: the bkbig dup-id KNOWN_ON_MAIN entry carries until: 95. inventory.mjs reads INV_REPO (runkit sets it to its checkout) and
  turns the entry off once item 95 is in that checkout's history (a q95 or Merge item 95 commit), or when INV_REPO is unset: a bkbig
  duplicate fails there whatever other ids the page has. Main before the merge and other items' branches (96) still print it as
  known. When item 95 merges, delete the entry. Run inventory alone as INV_REPO=<checkout> node inventory.mjs <page> [allow.json].
- Merged 2026-11-05 (main 6a0e3d6, v119; deployed). The bkbig KNOWN_ON_MAIN entry is deleted (inventory's list is empty again); on
  main's v119 page inventory says `OK: inventory nothing removed`, no duplicate ids.
- Kit step (Mac Studio, 2026-11-05): no new screens: settings-bottles shows the Bottles sheet's 1 L label (bbbig-tri) and
  journal-header shows Move and zoom with aria-disabled (no photo yet), each checked on a screenshot. layout.test.mjs had an unescaped
  apostrophe (Mark's, from 97f3def) that stopped every layout step; fixed. New KNOWN_ON_MAIN in layout: overlap calcBtn + planSavedView
  on plan-saved at 150%/200% (the Saved to Journal strip sits over the sticky Crunch bar; on main too; to report to Mark: listed in
  HANDOFF.md, Open items for Mark).
- Kit proof (Mac Studio, 2026-11-05, after the skeptic): the first run had KIT_ITEMS=95, so q91 (the only test of point 3 then), q92
  and q93 did not run on the page and their lines wrongly said "not in this checkout". The skeptic ran them by hand (q91 324, q92 285,
  q93 209 checks, all OK). Rerun with KIT_ITEMS unset (every item in the checkout) and KIT_MAIN = main 7016e8a's page (v118), on
  fred95 (b750e93, v119): `kit: OK: 13 steps passed, 1 item tests skipped (4210 s)`; answer 1763 pass, contrast 106 screens, layout
  103 (305 opened) at 320/375/430 and 106 (314) at 390, inventory nothing removed, motion 114, q91 324 checks (its point 3 check
  passes), q92 285, q93 209, q95 46 (36 + the move section's 10), q96 skipped (not in the checkout).

## Item 96 · Sync: one device can't undo another's settings, and late uploads aren't missed (cache v120)
- Built and reviewed on q96-sync (7 rounds, ended at eafa457); c05e5a5 merges main (item 95, v119) and keeps sw.js and APP_BUILD at
  v120. The design: HANDOFF.md "96" and the header of q96/q96.test.mjs (every scenario and review round).
- Kit step (Mac Studio, 2026-11-06): no new screens (sync logic only; the diff from main 6a0e3d6 adds no ids or markup), no
  exemptions, no app or kit change. q91's sync check "the Header sheet open on B, the focus on Move and zoom, when A chooses a new
  photo: the focus stays in the sheet" passes now that item 95 (#jhpMoveBtn aria-disabled) is merged in. q91 and q92 pass with review
  round 6's q91/fbmock.mjs (real SDK Timestamp math). The layout KNOWN_ON_MAIN entry calcBtn + planSavedView (plan-saved, 150%/200%)
  is seen at 430 px and stays.
- Outside item 96, not fixed here: in Playwright WebKit any sync redraw of the Journal list puts the page at scrollY 0 (on base
  7016e8a too), so q96's noscroll section runs in Chromium only (listed in HANDOFF.md, Open items for Mark).
- Kit proof on fred96 (c05e5a5, v120), KIT_ITEMS unset, KIT_MAIN = fred/null.html (main 6a0e3d6, v119): `kit: OK: 14 steps passed, 0
  item tests skipped (5116 s)`; answer 1763 pass, contrast 106 screens, layout 103 (305 opened) at 320/375/430 and 106 (314) at 390,
  inventory nothing removed, motion 114, q91 324, q92 285, q93 209, q95 43 (its 3 not-vacuous checks skip: main has item 95), q96 101.
- Merged 2026-11-06 (main 6a87e42, v120; pushed, deploys). The log entry is in QUEUE_LOG.md; README's Known limits now say settings
  merge key by key (only the library and the last plan are still one document each).

## Item 97 · fred world: the bundle, motion plumbing and switch (cache v121)
- Bundle: the design chat's v4 (built 2026-11-06 06:14 EST, ~/Dropbox/00_T/handoff), checked against all 15 source fixes by an
  independent verify run (rebuilding from the sources gives the shipped files byte for byte, timestamp aside). Inlined whole by
  `scripts/fw-inline.mjs` (in the repo): CSS in `<style id="fwCss">` before the app's own stylesheet (the app's rules come after it),
  JS in `<script id="fwJs">` right before the main script. A later bundle: rerun the script; never edit the blocks by hand.
- The gate is `html.fw-anim` (the spec's class): the bundle's character loops are written `.fw-anim .fw-…`. The still state is the
  bundle's `.fw-rm`, put on each spot, never on html: the bundle's `.fw-rm *{animation:none!important}` would stop every app animation.
  The switch off is the same still state as Reduce Motion (drops, flakes and falling pieces hidden too), so "off" looks like Reduce
  Motion and nothing hangs mid-fall.
- Settle (rule a), per spot: the app's own `.fwm-go` (not a bundle class): a spot is still unless `html.fw-anim` and `.fwm-go`, by a
  rule in a cascade layer (`@layer fwm`, like item 86's `.mo-off`): a layered `!important` beats the bundle's own `!important`
  shorthand (`fw-dance`). `animation:none` is each part's rest pose (the design chat's note: settle by taking the loops off, not by
  pausing). At 6 s each infinite loop is told to end the round it is in (`effect.updateTiming({iterations: currentIteration+1})`;
  a back-and-forth one stops mid-swing instead, below), so most parts come to rest on their own; at 8 s `.fwm-go` comes off
  regardless (a long round snaps). An engine without the Web Animations timing calls still settles at 8 s.
- `fwMount(el, draw, key)`: the key (what the drawing shows) decides "kept" vs "replaced": each FW call numbers its ids afresh, so two
  calls for the same look give different strings, and comparing strings would restart a drawing on every re-render (item 98.4).
  draw may be a function (built only when the key changes). Without a key the string is the key.
- Still until seen: a spot does not move before inView plays it (rule a: "when they first come into view"), and a new app open
  (onAppOpen, item 88's 30 minutes) lets each kept drawing move once more when next seen. The switch turned on again does not restart
  settled drawings (rule a: they move again only when what they show changes).
- Settings: a "fred world" group (blue, both sports) between Connections and Account; on the computer layout it is in the settings
  list like every group. `settings.worldMotion` has no DEFAULT_SETTINGS entry (item 96 never stamps an untouched default); it syncs
  key by key once changed; sync and restore re-run the gate.
- Print and forced colours: `.fwm>*` hidden, the spot's box kept (the round rules), in the app's CSS so every later spot gets it.
- `fwMount(el, draw, key, o)` (2578996): `o.cls` puts the bundle's wrapper class a drawing needs on its spot (`fw-bird` for fred's
  flap, `fw-ashley` / `fw-waves` for a wave, `fw-scene` for a scene: its loops are written `.fw-anim .fw-bird .fw-ch-wing`);
  `o.still` never moves (item 99's header avatar). Art put in without fwMount never moves (a rule in the `fwm` layer stops every
  fw- element outside a spot): under `html.fw-anim` it would otherwise loop for ever, never paused or settled.
- A back-and-forth (alternate) loop stops halfway through a round (review round 1): `iterations` = the round it is in + .5, or
  + 1.5 once it is past its middle (how far into the round from `localTime`, not `progress`, which runs backwards in a reversed
  round). Every alternate loop in the bundle has two keyframes, one at each extreme, and `ease-in-out`, so mid-swing is the middle of
  its range: within about a degree of the rest pose (bell, sway, wave2, shafts 0; swish and ch-wave -0.5; ch-pump +1; shafts'
  opacity .9), and taking the loop off shows no jump. Ending on a round boundary (2578996's "even round") left it on an extreme
  (Kitty's tail -6 degrees, a wave arm -5) and it snapped to rest. It waits at most one round more; one that can't end by 8 s
  (fw-shafts, 20 s) still snaps then.
- inView is armed only while the spot is on the screen at all (review round 1): one IntersectionObserver at threshold 0 watches the
  spots that wait to be seen and registers item 86's inView when one comes on the screen, stopping it when it leaves (scrolled far
  away, or its view not showing). A waiting inView box makes every scroll on every screen fit the bars (about 1.4 ms a frame at 6x),
  and a kept drawing re-armed at an app open on a view not showing could never play, so it waited all app open. Volume and the
  Journal avoid this by arming only their active view; fwMount spots belong to no one view, so they use the observer instead. The
  first move comes a frame later than a direct inView call (the observer's first word).
- A spot taken out of the page is let go when it was in it: `r.pl` (a mount or sweep saw it there, or the spot observer did), or
  loopWhileVisible saw it there (`LV.p`) or has already let it go (not in `LV.m`). `r.pl` alone missed a spot mounted before it was
  put in, then removed before another fwMount call (a render that empties its box, builds the spot, mounts it, then appends it kept
  one drawing per render). One never put in still waits.
- Budgets (the budgets step's numbers, each drawing alone in a spot at 6x): bird 40 nodes / 2 loops / 4-5 ms insert / ~1 ms a
  frame; Ashley 87 / 2; a crew friend 102 / 1; Kitty 85 / 3 (~2 ms a frame). `FW.scene()` whole is over every budget (1,680 nodes,
  82 loops, ~62 ms insert, ~6 ms a frame): item 103 needs the crop (the crew's part only) and the design chat's help for it.
- Kit: `q97/q97.test.mjs` (a hooked copy of the page reaches fwMount: there is no screen with art yet; review round 1 added: the
  settle counts from when a spot is seen, at mount and after an app open; a replaced drawing pauses; a short time away does not
  replay; an app open on another tab leaves inView nothing to watch; a spot below the fold has no timer and no inView while far off;
  Kitty's tail settles with no jump; a spot mounted before it was put in is let go; the switch is drawn as a switch and each tap
  under Reduce Motion counts; every request is logged from the first one, with a self-test); the motion audit places the
  bundle's 40 @keyframes (item 97, allowed before a tap only inside `.fwm.fwm-go`); `budgets/budgets.test.mjs` (a runkit step) checks
  the round's budgets on every screen, with self-tests on probe drawings (zero art on real screens until item 98).
- Design-chat issues for later items (from the verify run; none needed for 97), to send before the item that needs each: the art reads
  `var(--blue)`, which in the app is the ink blue #0B7399, not fred blue #179BCC (98+); under Reduce Motion / `.fw-rm` the scene's
  translucent shadows and rims go opaque (103); `FW.scene()` ids without a prefix ("undefinedsky") (103); 'shaved' hair draws like
  'short' (99); Kitty's tail tip and stolen-cap brim clipped at the SVG edge (102); a confetti deco left in the race-day and birthday
  looks (101); `fw-dance` ignores the bundle's own Reduce Motion rule (harmless in the app: html has no fw-anim then).
