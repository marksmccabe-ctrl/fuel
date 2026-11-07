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
  regardless (a long round snaps). An engine without the Web Animations timing calls still settles at 8 s. Both count the time
  the spot plays (review round 3).
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
- Review round 2 (fwMount's contract for the items that call it):
  - Motion starts mid-swing too: `fwmGo`, in the task that adds `.fwm-go`, moves each back-and-forth loop's delay so its round starts
    at the middle of the half it was in (its rest pose, within a degree: Kitty's tail -0.5, a wave arm -0.5, a pump arm +1), not at an
    extreme (from the still pose it jumped 6, 5, 7 degrees in one frame, at mount and at each app-open replay). (Round 3 replaced
    this: moving the phase put crew with offsets in the same half in step; see Review round 3.) Loops whose first keyframe is off the
    rest pose (`fw-ch-sway` -1.6 degrees, the scene's `fw-wob`, `fw-fog`, `fw-float`, `fw-swag`, `fw-peek`) are art for the design
    chat (below), not plumbing.
  - The clean-up of spots a render took out runs once the code mounting is done (`fwmSweep`, a microtask, as item 86's `lvSweep`), and
    spares the spots mounted in that code: a render that empties its box and then mounts and puts back each spot (or builds a fragment)
    kept only the first spot; each later one was let go mid-render, drawn again and moved again on every render.
  - A spot mounted before it is put in is watched by a MutationObserver until that sweep (only then): one put in and taken out again in
    the same code (a render run twice in one task, as the boot pass does) was never seen in the page and was kept for the life of the
    page; it is now let go. A new app open lets go of every spot out of the page, seen or not (none still waits after 30 minutes).
  - loopWhileVisible is registered again when a kept spot is mounted again or starts to move, if it let the spot go (out of the page a
    frame or more): it moved off screen and with the page hidden. `loopWhileVisible(el, true)` (item 86, a new optional argument): a
    spot is still until seen, so no layout is read for its first guess (one forced layout per drawing mounted in a render).
  - One-shot entrances (`fw-enter`, `fw-l-in`) are not for a spot (its start state is not held while it waits): item 103 holds it.
  - Kit: q97 `keep` and `start` sections; `still` walks every tab and the kit's News, Volume, computer-layout and sheet screens with a
    recorder from the main script's first line, checks the main script calls no fwMount and uses no FW, and logs same-origin loads
    (by their path beside the page) against main's after the same walk; the BUNDLE FIXES for 97 are checked on the blocks themselves;
    `.fw-rm` is checked on spots only (never html, body or a view) in every gate-shut state, and an app animation keeps running with the
    switch off; the group shows only its title and labels; its row at 320 px and 150% / 200% text. `lib/screens.mjs` has
    `settings-fw` and `settings-fw-run` (needs `#prowBtn-worldmotion`), so the layout and contrast audits judge the group at every
    width and text size (no screen showed it at 200%).
- Review round 3 (fwMount's contract, the switch, the kit):
  - Each loop keeps its own phase (the brand guide: idle loops "out of step with neighbours", "a group never moves in step"; the
    bundle's crew offsets) and waits in its rest pose (fill none: the still one) until that phase reaches mid-swing (a back-and-forth
    loop: `delay` = the wait, `iterationStart` .5 or 1.5) or its round's start (any other loop of 4 s or less: a bob, a bounce: offset
    into their round they jumped 2-4.5 px, a vm2 bounce 10.8). The wait is under one round; a loop of 4 s or less ends its round by
    8 s; a long one (fw-shafts) may not start at all. Round 2's phase move put three vm4 crew of the scene in step.
  - The move counts the time it plays, not wall time: a spot paused (`.mo-off`: off screen, the page hidden) stops its move's clock
    (the 6 s step and the 8 s end wait too), so one back before the end still ends each round mid-swing (back at 7.3 s after going
    away at 2 s it snapped 4 degrees). Its view no longer showing (another tab: the browser drops its loops) ends the move at once,
    unseen: back on that view it is still (it came back with endless loops that snapped at 8 s).
  - Loops the browser makes anew while a spot moves (a render takes it out and puts it back; mounted again or not) carry on where
    the old ones were: timed again from the stylesheet's timing (`FWT`), set to the move's play time, and after the 6 s step given
    the round end their old one had. fwmSweep does it for spots mounted in that code (before a frame shows them); an
    `animationstart` listener on the spot for the rest (one frame may show the restart). A re-render at the tail's far end jumped
    10.5 degrees; one after the step looped again and snapped.
  - The move starts in a task of its own (`setTimeout` 0): inView may play a spot inside a frame (its check as a scroll ends at the
    page end), and Chrome draws a loop made and retimed there untimed in that frame (Kitty's tail at -6 for one frame).
  - The spot's classes, aria-hidden and drawing are fwMount's: a render that writes its className whole gets `.fwm`, the wrapper
    classes, `.fw-rm` and `.fwm-go` back (a MutationObserver on each spot's class, toggles with a force so no record loops; also on
    each kept fwMount call), and the move carries on (same loops); one that emptied the spot gets the drawing again at its next
    fwMount. Without this the art printed, showed in forced colours and never moved again.
  - Art put in without fwMount: everything inside a drawing (an svg with an fw- class) not in a spot is stopped too (the champagne's
    fizz circles carry no class and looped for ever: New Year's, PB, the sunny look's spritz). Scoped to an svg so the browser rejects
    it at once for every other element (a rule whose last part matches any element walked every element's ancestors on every style
    pass). The bundle's other classless loop, `.fw-speed i`, is drawn by no FW call.
  - The switch in forced colours: no backgrounds there, so every switch drawn this way (`.gsw-k`, `input.gsw`) gets an edge inside its
    track (outline, its size kept), a ButtonText knob, and on a Highlight track with a HighlightText knob.
  - Kit: q97 `bundle` checks ids differ from call to call (no id in two of seven drawings) and the run no longer hides duplicate-spot
    reports; `mount` puts every drawing (holiday and weather looks, Ashley, Kitty, friends, the scene) in without fwMount, bare and
    in its wrapper; `keep` writes a spot's className mid-move and empties one; `start` checks every frame for 3 s, a bob and a vm2
    bounce in the go frame (under 0.5 px), and two vm4 crew with offsets in one half not in step; a new `life` section re-renders a
    moving spot (1 s, 2.6 s, 6.5 s), leaves its view mid-move, and scrolls it away mid-move; `switch` looks at it in forced colours
    (light and dark); `rules` expects a spot scrolled away mid-move to wait and finish its move when back.
- Review round 4: the forced-colours edge took the focus ring of a focused `input.gsw` (same specificity as `input:focus`, later):
  Fluid limits' No limit switches, whose label has no ring, showed no keyboard focus in High Contrast (phone layout; `html.dk
  :focus-visible` still won at desktop width). A last rule in the same block, `input.gsw:focus{outline:2px solid CanvasText;
  outline-offset:1px}`, gives back the app's ring (on mouse focus too, as before), on or off. Kit: q97 `switch` Tabs onto Animate the
  world and both No limit switches (off and on) in forced colours, light and dark, and requires focused to differ from blurred; a
  self-test puts the edge back over the ring.
- Review round 5: round 3's guard part `body svg[class*="fw-"]:not(.fwm *) *` made Chrome (Blink) restyle the whole subtree of any
  element whose class changed: a match on the class attribute in a part that is not the last, with `*` after it, gives the `class`
  attribute a whole-subtree invalidation set. No drawing needed to be there: a class on html or body restyled the whole page (8,380
  elements for ten toggles on plan-adjust, base 10; about 8-9 ms a change at 6x), as did a ps-open sheet, a tab switch and a tap on the
  computer layout (Plan tab 669 to 3,469 elements). Safari was not affected. The part is now `body .fw-ch-fizz:not(.fwm *) circle`
  (both copies): the bundle's one loop on classless parts, reached by its group's class, so the invalidation is keyed on that class
  (back to 10 elements). A later bundle with another classless loop fails q97 `mount` (every drawing put in without fwMount) and
  needs its own part here, by class, never ending in `*` after an attribute match. Kit: q97 `restyle` counts the elements restyled
  (trace UpdateLayoutTree elementCount) for ten toggles of an unused class on html, body and the active view on plan-adjust, against
  main's plus 1% of the page a toggle; a self-test puts round 3's part back and must fail it.
- Design-chat issues for later items (from the verify run; none needed for 97), to send before the item that needs each: the art reads
  `var(--blue)`, which in the app is the ink blue #0B7399, not fred blue #179BCC (98+); under Reduce Motion / `.fw-rm` the scene's
  translucent shadows and rims go opaque (103); `FW.scene()` ids without a prefix ("undefinedsky") (103); 'shaved' hair draws like
  'short' (99); Kitty's tail tip and stolen-cap brim clipped at the SVG edge (102); a confetti deco left in the race-day and birthday
  looks (101); `fw-dance` ignores the bundle's own Reduce Motion rule (harmless in the app: html has no fw-anim then); loops whose
  first keyframe is off the rest pose start with a small jump from the still pose (`fw-ch-sway` -1.6 degrees, vm3 crew: 100;
  `fw-wob`, `fw-fog`, `fw-float`, `fw-swag`, `fw-peek`: 102-103).
- Kit step (Mac Studio, 2026-11-06): no new screens beyond review round 2's `settings-fw` and `settings-fw-run` (needs
  `#prowBtn-worldmotion`), each checked on a screenshot: Settings scrolled to the blue "fred world" group, its one row Animate the
  world with the switch on, on the Cycling side and on the Running side (Settings has no graphite: the run theme colours Plan only).
  On main's page (fred/null.html = main 6a87e42, v120) both print `skipped (needs #prowBtn-worldmotion)`. No other screen: none shows
  fred world art until item 98 (fwMount has no caller). No exemption added in the kit step (the motion audit's 40 KEYFRAMES and its
  ON_LOAD_OK `.fwm.fwm-go` entry are the review's, above); inventory nothing removed with allow.json unchanged (item 97 only adds ids:
  prowBtn-worldmotion, pgT-fw, fwCss, fwJs). No app or kit code change was needed.
- Kit proof on fred97 (3dce12f, v121: main 6a87e42 + item 97), KIT_ITEMS unset, KIT_MAIN default (fred/null.html, main 6a87e42,
  v120): `kit: OK: 16 steps passed, 0 item tests skipped (5569 s)`; answer 1763 pass, smoke 14 checks, contrast 108 screens (242
  checks), layout 105 (311 opened) at 320/375/430 and 108 (320) at 390 (known on main unchanged: 41 / 33 / 35 / 37), inventory
  nothing removed, motion 116 screens (54 checks), budgets 108 screens all zeros and its self-tests (25 checks), q91 324, q92 285,
  q93 209, q95 43, q96 101 (900 s), q97 128.
- Kit step after the skeptic (2026-11-06), two findings, both in the kit: (1) the comment on settings-fw-run in lib/screens.mjs said
  it showed the run's graphite; Settings has none (`run-theme` is set only when the view is Plan), so the comment now says it is the
  Running side (sport toggle on Running), which looks like the Cycling side. (2) No kit screen showed the group on the computer
  layout (html.dk, 1100 px and up: Settings is a two-column grid, html.dk-set), where the RULES FOR ALL TEN ask for the same checks:
  new screen `desktop-settings-fw` (1280 x 800, needs `#prowBtn-worldmotion`) opens Settings from the sidebar's account button
  (`#sbAcct`, "Not signed in · Settings"; the header's account buttons are hidden at that width) and scrolls to the group. At
  150%/200% text a 1280 px window is not the computer layout (q22: 1100 px at the default text size), so it takes the header's
  button there (a first version that clicked only `#sbAcct` could not reach the screen at 150%/200% in layout's 390 pass).
  Screenshots (kit97/shots2): at 100% html `dk dk-set`, the group in the left column (x 264), its row 47 px, the switch on; at 200%
  the wide phone layout, the group under the header. On main's page it prints `skipped (needs #prowBtn-worldmotion)`. Its
  contrast, layout (390 pass, all three text sizes), motion and budgets checks passed alone before the full run. No exemption, no
  app change.
- Kit proof after the skeptic, on fred97 (3dce12f, v121), KIT_ITEMS unset, KIT_MAIN default (fred/null.html, main 6a87e42, v120):
  `kit: OK: 16 steps passed, 0 item tests skipped (5585 s)`; answer 1763 pass, smoke 14 checks, contrast 109 screens (244 checks),
  layout 105 (311 opened) at 320/375/430 and 109 (323) at 390 (known on main unchanged: 41 / 33 / 35 / 37), inventory nothing
  removed (desktop-settings-fw in its snapshot), motion 117 screens (54 checks), budgets 109 screens all zeros and its self-tests (25
  checks), q91 324, q92 285, q93 209, q95 43, q96 101 (899 s), q97 128.
- Merged 2026-11-06 (main 2f8c5c9, v121; pushed, deploys). The log entry is in QUEUE_LOG.md. The review ran 6 rounds (round 6 dry,
  rounds 4-6 at the strict bar): 35 confirmed and fixed. `fred/null.html` is rebuilt from main (byte-equal to fred97's), so later
  items' q97 and budgets runs compare against a main that has item 97.

## Item 98 · Weather card: fred in the living sky (cache v122)
- Bundle: the design chat's rebuild of v4 at 2026-11-06 17:29 EST (`FW.built`; still "v4" in the markers and FW.version, so only
  the build time tells it from 06:14), inlined with `node scripts/fw-inline.mjs ~/Dropbox/00_T/handoff` (never by hand); its own
  header comments in both blocks carry the 17:29 time. An independent check found it good for 98 (probe98/verify-bundle2.json).
- Decisions from the app chat, followed:
  - The looks are the bundle's as shipped, `FW.bird({wear: FW.WX_WEAR[kind]})`, not QUEUE 98.2's words: sun shades + spritz, heat
    shades + sweat, freeze beanie + scarf + puffs, wind scarf, clouds none, fog the cap lamp and its beam, rain umbrella, snow
    beanie + scarf. A clear night (wxSkyOf gives no sky; the card has a forecast) is `FW.WX_WEAR.night` (the vest only: no 'light',
    which would draw the fog beam), mounted with o.still. wear is always an array (a string throws in the bundle).
  - Rain without the flap: the bundle draws a still copy of the right wing over the umbrella while the real wing flaps under it
    inside .fw-bird (a doubled wing at each flap peak). Until the design chat fixes it (FROM-APP-CHAT-3.md point 6), rain is mounted
    without o.cls 'fw-bird' (bob and blink still move); every other look gets 'fw-bird'. Said in the code (WX_FRED's comment): the
    item that takes the fixed bundle puts the flap back (rain: {cls:'fw-bird'}).
  - Plumbing fix (fwmA / fwmEnd): each infinite loop gets only the whole rounds that fit before FW_SETTLE_MS,
    `iterations = floor((FW_SETTLE_MS - wait)/d)` (wait: the delay fwmA sets, or the stylesheet's for a loop it does not re-time);
    fwmEnd takes `min(that, the round end it computes)` (it now judges by the stylesheet timing, FWT, since the loop is no longer
    endless when it runs). A loop with no whole round in 8 s (the scene's 20 s loops) stays at rest. No loop in the 17:29 bundle is
    alternate: the alternate branches stay (harmless, for a later bundle) and the comments no longer call them the bundle's.
    Own addition, found by reading every frame: fred's bird has no fw-pN class, so his blink (4 s) and bob (2 s) have no offset and
    their last round ends at exactly 8 s of their own time, which is a frame after the move's clock (a new or resumed animation starts
    on the next frame). The 8 s cut then landed a frame early and snapped the blink half open to open. fwmTick's last step now lets
    a timed loop's last round finish first (fwmLeft: the longest remaining end of a loop fwmA timed, at most 500 ms, and not past
    9 s of play), then takes .fwm-go off: no step in that frame.
  - Cache v122 (sw.js CACHE and APP_BUILD).
- Built (index.html): wxCardHTML marks the look on .rwx-g (data-fred: the sky, or night; the no-forecast card has none, so no fred);
  wxDress calls wxFred after wxSkySet. wxFred keeps one layer per look, div.rwx-fred.rwx-keep (a fwMount spot, aria-hidden), right
  after .rwx-fog (z-index 2: fog drifts behind him, every word, z-index 3, paints over him), keyed 'wx:'+kind: the same look is kept
  through every render (Adjust's recrunch, a fresh Crunch); another look changed in place cross-fades with the sky (the same 480 ms
  and motionOK test as wxSkySet; .rwx-x / .rwx-pre / .rwx-out, data-fred-out while the old one fades), and the old spot is emptied
  and let go after 520 ms; on a fresh Crunch or under Reduce Motion the swap is at once. The run's fresh Crunch builds a new #runWx:
  runCrunchResult carries the fred layer into it, so the run keeps him like the ride's box does.
- Placement (my decisions): fred's base box (his 200-unit body) is --wxf = 88 px, the same size and place in every look; FW.box gives
  --fx/--fy/--fs on the layer and the svg is placed at x/200 and y/200 of it, width scale x 88. The box sits 0.33 x 88 = 29 px in from
  the card's right padding edge and 0.14 x 88 = 12 px down from its top: the card clips at its padding edge, and the umbrella paints
  0.3175 of his width right and 0.13 up at the top of his bob (measured: everything painted, at rest plus the bob's 12 units, sits
  inside the card in every look, both boxes, at 375 / 430 px and on the computer layout). The words beside him get padding-right
  `1.21 x 88 - 10 px` (to his body's left edge, 25.5 units in, plus a 6 px gap; the beam and the spritz reach under the reading by
  design: words paint over them, with item 87's feather): the temperatures, and the sub-line while it sits beside the square (review
  round 1: first the whole .rwx-main had it, so a sub-line under the square, always below his feet, lost an orphaned last word); the
  reading (.rwx-main) has a min-height so the tiles start below his feet. At 390 px "61° → 70°"
  then wraps to two lines (98.3: it wraps instead of sitting under him).
- The cut: a container query on the card (container rwx, inline-size): fred shows when its content box is at least
  max(305 px, 167 px + 6.25rem). 305 px content is a 340 px card; 167 px + 6.25rem keeps room beside him for the square and the
  widest temperature ("100°" at 2.75rem), so the cut grows with the text size: at 100% he shows from 375 px phones up, at 150% from
  390 px, at 200% only on cards of 425 px or more (a 430 px phone is 398: out). Without container queries (old browsers) he never
  shows. Left out is display:none, so he is never seen, never moves and is paused.
- The computer layout (html.dk): he goes top right of the box, as on a phone. The ride's results column gives the box 276 px at a
  1280 px window (under the cut: no fred, no room kept), 436 px at 1440, 532 at 1920; the run's box is 360 px at 1280 (he shows).
- The entrance (98.6): `.r-wx.wx-arm *{animation-play-state:paused}` pauses him and fwMount's clock watches only .mo-off, so a fred
  seen while the box waits would spend his move paused and unseen. While the box is armed his layer is display:none (so
  IntersectionObserver never calls him seen: his move cannot start); as it plays (.wx-go) he fades in with the sky (a new one-shot
  @keyframes rwx-fred-in, 700 ms, as the sky's 700 ms transition: an animation because a transition does not run from display:none)
  and is seen then. Tested with his top on the screen while the box waits.
- Print: his layer out with the sky (q87's print rule now names .rwx-fred) and the reading's padding given back. Forced colours:
  item 97's spot rule (the drawing out, the box and the room kept).
- 98.5: no change to wxLoop: fwMount registers loopWhileVisible on fred's spot itself (paused off screen and when the page is
  hidden), and a clear night's fred is still (o.still), so the box needs no watch of its own for him.
- Graphite (the run): fred's ink outline is about 2.6:1 on the run's sky and the fog beam reads khaki; the art is aria-hidden, every
  word keeps the item 87 feather over him and the beam. Left as the bundle draws it (a note for the design chat if Mark wants more).
- fred once on screen: the ride's #results and the run's #runResults are not shown together: the run (sportSet, runCrunchResult)
  hides #results but keeps lastResult, so every path that redraws the ride's results checks that #results is shown first
  (refreshResults since review round 2 of the v5 build, below; before that a Units change or a closet temperature on the run side
  showed the ride's box again under the run's); during a cross-fade the old fred is fading out (.rwx-out) for 520 ms.
- Kit: motion KEYFRAMES 'fw-l-in' sel is '.fw-anim .fw-scene.fw-enter .fw-L' (the 17:29 bundle gates it), and 'rwx-fred-in' (tap:
  the entrance plays after the Crunch tap) is placed. q97: 'main' skips with a note when the main page has `<script id="fwJs">`;
  'still' allows later items' art (LATER: item 98's .rwx-fred and wxFred, only on a page that has wxFred; any other art or fwMount
  call still fails); the Kitty tail, start and life wording describe the new bundle's plain loops. lib/open.mjs takes opts.query;
  lib/screens.mjs passes a screen's query, takes `needs: 'css:<text>'` (a stylesheet rule's selector has it: fred is drawn only after
  a Crunch, so no element exists at load), and adds 19 screens (needs 'css:.rwx-fred', skipped on a page before item 98):
  plan-wx-fred-<sky> and run-wx-fred-<sky> for the eight skies and night (night: the ride at 8 pm, dark hours in the made-up
  forecast), and desktop-wx-fred (1440 x 900, rain). Each checked on a screenshot. New q98/q98.test.mjs (sections cache, looks,
  size, room, desk, keep, enter, settle, pause, still, media, once, self, main), with mutated copies of the page that must fail:
  rain with the flap, item 97's plumbing (the freeze puffs snap at 8 s), no entrance rule, no reading padding, a key that is not
  the look.
- Seen during the build (not taken: item 98 is built on the 17:29 build, as decided): the design chat shipped v5 at 2026-11-06 19:46
  EST (FROM-DESIGN-CHAT-3.md: points 1-10 of FROM-APP-CHAT-3, so likely the rain wing too). Its boxes grow for motion (umbrella
  0 -37 281 241, fog light -69 0 273 203). The item that takes it must re-check fred's insets: .rwx-fred's right (0.33 of --wxf) and
  top (0.14) were sized for the 17:29 umbrella (0.3175 right, 0.13 up at the bob's top); q98 `size` measures what he paints against
  the card edge and will say if v5's umbrella is cut. With the wing fixed, rain gets {cls:'fw-bird'} (WX_FRED) and q98's looks check
  for rain flips.
- Budgets (my decision, the kit): the frame rule judged the whole screen, sky included, and item 87's skies alone already cost more
  than 4 ms a frame at 6x on the Mac Studio (fred still: rain 3.6-3.8, snow 4.1-4.7, freeze 3.3; fred adds 0.2-0.9). No character
  could stand in a rain or snow card under the literal rule. budgets.test.mjs now measures a screen over 4 ms a second time (the lower
  kept: one 2 s window late in a long run read run-wx-fred-wind at 4.16 ms where it reads 3.5-3.8 alone), and if still over, again with
  the FW animations paused: it fails only if fred world adds more than 1 ms to the screen's own motion (BUDGET.fwMs). Flagged for the
  app chat: the 4 ms rule and item 87's own sky cost.
- Contrast (the kit): SOLID_ALLOW gains `.rwx-fog` (item 87's fog bands, blurred gradients over the whole box, the same sky as
  .rwx-scene, already allowed): no kit screen had shown ?sky=fog before item 98's.
- Not changed: a 320 px phone at 200% text has no room for "100°" beside the icon square (it runs 5 px past the card edge, as on main;
  fred is left out there). Real temperatures in the kit's forecast fit.
- Runs on fred98 (q98-wx-fred c4852b0, v122; main page fred/null.html = 2f8c5c9, v121), Mac Studio, one at a time: q98 `OK: item 98:
  Weather card, fred in the living sky (224 checks)`; q97 (main as its second argument) `OK: item 97: ... (125 checks)` (its main
  section skipped with a note); motion `OK: motion audit: Reduce Motion still on 136 screens, nothing moves before a tap (7 first loads
  + every screen), only transform / opacity / bar widths animate (54 checks)`; budgets `OK: fred world budgets: 128 screens (30 with
  fred world art) ... (25 checks)`; smoke `OK: kit2 smoke: every tab opens, no errors (14 checks)`; contrast on the weather screens
  (22) `OK: contrast AA on 22 screens, no new solid colour blocks (0 known on main) (70 checks)`; layout on the same 22 at 320 and
  390 px x 100/150/200% `OK` (66 opened each, no new failures); npm test 1763 pass, 0 fail. The whole kit (runkit.sh) is the kit step's.
- Review round 1 (the acceptance checkers, eight findings; all real, all fixed; app 20770e2):
  - Look: the room was padding-right on the whole .rwx-main, so the sub-line under the square (.sub-wide: it spans the card, 33-89 px
    below his feet at every phone width) wrapped a last word ("10:30") onto a line of its own at 375-430 px (41 of 101 screens). Now
    the room is on the words beside him: `.rwx-temps` and `.rwx-main:not(.sub-wide) .rwx-sub` (the 768 px card, where the sub-line sits
    beside the square, 8 px above his body's bottom, keeps it); print gives both back. wxFitRows measures the sub-line with the room on
    (it takes .sub-wide off first), so a sub-line that would wrap beside him goes under the square and keeps the card's width. The sub
    lines now match main's on all 24 of the checker's screens (ride and run, night and sun, 375/390/430 px, 100 and 150%). q98 room:
    a sub-line under the square reaches the card's content edge, the one beside the square and the temperatures keep the room; the
    room grid adds a clear night (ride) and the run's sun at 375-430 px, and needs the under-the-square case seen with fred (the night
    at 390 px among them). Fails on the first build (24 screens, subEdge -96.5 px) and on a mutant with the room on .rwx-main.
  - Motion (Chromium only): between the 6 s step and the 8 s end some loops have played their rounds (finished, fill none: the rest
    pose) while the blink still runs. Paused then (.mo-off: off screen, the page hidden), Chromium draws a finished loop that was cut
    short with updateTiming in a mid-round pose (WebKit does not), and loopWhileVisible takes .mo-off off only after his first frame
    back on screen, so that frame showed it and the next snapped to rest (sun: the bob 3 px, the fizz, the wings ~3 degrees). Fix in
    fwmA: `a.onfinish=()=>a.cancel()` (a loop that has played its rounds comes off its part: the rest pose it already showed; cancelled
    CSS animations stay off through play-state changes and come back when .fwm-go comes back, checked in Chromium 141 and WebKit 26). It
    also covers loops that end before the step (a later item's crew: an 8 s blink offset -2.3 s ends at 5.7 s). q98 pause: scrolled
    away at 6.3-6.6 s of play (sun, heat, freeze), back 600 ms later: in his first three frames on the screen every part whose loop is
    done (no animation in its active phase) is at rest. Fails on the first build (sun: the bob 3.0, a fizz circle 50, the wings 5.2) and
    on a mutant without the cancel.
  - Tests: enter runs in both boxes (the run: sport run, #runWx, staggerIn(#runResults)); self: the arm rule scoped to #results fails it
    on the run. desk opens the run at 1280 x 800 (360 px box: fred shown top right, nothing cut, room kept, no word over him) and size
    measures it there; self: no fred in the run's box at html.dk fails desk. keep reads both freds' opacity every frame of the cross-fade:
    no step over 0.2 a frame (scaled by the frame's length), the old one's last frame at most 0.02 and the new one at least 0.98 before
    the old spot goes at 520 ms (the checker's 3000 ms and 1600 ms fades fail it: last frames 0.38 and 0.16); and a card without a look
    put in place in motion: while the old fred shows (opacity over .05) the room stays and no word is over his body (the checker's
    mutant without the data-fred-out rule fails it). All in self.
  - Kit, motion: the static check's fw-l-in selector is the page bundle's own: a page whose FW.built is before 2026-11-06 17:29 (main
    up to item 97, 06:14) is judged on the ungated `.fw-scene.fw-enter .fw-L`, a later one on `.fw-anim .fw-scene.fw-enter .fw-L` only
    (not both for every page: an ungated rule on a 17:29 page still fails, checked on a mutant). Main 2f8c5c9 passes it again.
  - Kit, q97 still: a later item's FW use or fwMount call is allowed only inside its function's body (wxFred's braces matched, strings,
    template literals and line comments skipped), not on any line after it; a self-test puts `FW.kitty({})` on a line after wxFred and
    must see it. The checker's mutant (a line after wxFred) fails; its control fails as before.
  - Runs on fred98 (20770e2, v122; main fred/null.html 2f8c5c9), Mac Studio, one at a time: q98 in two runs (it is near the 10 min
    step limit whole), cache/looks/size/room/desk/enter/media/once/main `OK ... (216 checks)` and keep/settle/pause/still/self `OK ...
    (42 checks)`; the new checks fail on the first build (c4852b0: room 24 screens, pause 3 looks) and on the checkers' own mutants
    (fade1600, fade3000, fredout, runenter2, deskrun); q97 (main as second argument) `OK: item 97: ... (126 checks)`; motion in its
    three passes: motion `OK (20 checks)`, load `OK (22 checks)`, reduce FAIL 1 on run-results (`span.dr-b > b`, white-space
    changed by dayFitRows in 4 frames under Reduce Motion), which main 2f8c5c9 and the first build fail the same way at 22:28 (the
    build's full motion run passed earlier the same evening: the run's results late in the day; not item 98, left for the app chat); budgets `OK ...
    (25 checks)`; smoke `OK (14 checks)`; contrast on the 22 weather screens `OK (70 checks)`; layout on them at 320 and 390 px x
    100/150/200% `OK` (no new failures); npm test 1810 tests, 1763 pass, 0 fail.
- Review round 2 (the acceptance checkers, three findings; all real; app 54a0d57):
  - Motion: loops the browser makes anew after the 6 s step (a fresh Crunch plays the box's entrance again; a render takes the spot
    out and puts it back) were ended by fwmEnd(a, r.st), the clock at the step. The live loops there were ended by their own time,
    which runs a frame behind the clock (about 5984 against 6001), so a 2 s loop whose round ends at 6 s (fred's bob and flap, heat's
    sweat, freeze's first puff: the 17:29 bird has no fw-pN offset) got iterations 3 (end 6000) and its new copy 4 (end 8000): it came
    back mid-round and moved again until 8 s (the checker: sun at 6.5 s, the wings 7-8, about 4 degrees; masked in the app's flow by
    the fade-in, a one-frame jump when the spot is put back with no fade). Fix: at the step fwmTime records r.se, the earliest own
    time of the loops it ends there (only loops fwmA timed from endless, so a running one-shot such as rwx-fred-in cannot pull it
    down), and fwmA ends a new loop by r.se. That alone left one frame: a loop made anew with no round left (iterations 3, its time
    6500) was drawn once mid-round by Chromium before its finish event cancelled it, so fwmA now cancels such a loop at once (its end
    at or before its time), before any frame. q98 remake (new section): the sun look at 6.5 s of play, a fresh Crunch (the tap, as
    Playwright makes it) and the spot taken out and put back with wxFred after it and alone; every frame of the bob (.fw-ch) and the
    wings against their rest pose, none over 0.05, and every timed loop on them seen after the step keeps iterations 3 / end 6000. On
    the round-1 build (20770e2) all three fail (worst 9.6-10.5, loops it4/end8000); self2: a mutant with fwmEnd(a, r.st) and no
    immediate cancel fails it. (A loop the browser makes as the entrance shows him again is still timed at its first frame by
    animationstart, item 97's path: drawn once untimed at its start, the rest pose; the check reads the pose, and judges only timed
    loops' rounds.)
  - Tests, keep: q98 never checked that the new look moves after a look changed in place (rule a). fade() now reads, every frame,
    whether the new spot has .fwm-go and running fw- loops; keep needs that within the fade's 900 ms (seen at about 20 ms) and, in the
    keep section, the new look settled (.fwm-go off, nothing running) 8.7 s after the change. self2: the checker's newstill edit (the
    faded-in spot mounted with o.still) fails it, and so does the checker's own mutant (mut-c2t-newstill: keep FAIL 1).
  - Tests, size: q98 never checked fred's size. geo and room now read his base box and its place from the card's padding edge: 88 x 88
    px (--wxf), 0.33 x 88 = 29.04 px in from the right, 0.14 x 88 = 12.32 px down, within 0.5 px, in size (every look, both boxes, 375,
    430 and the computer layout), desk (1440 ride, 1280 run) and room (every width and text size he shows: 25 cases). self2: --wxf
    70px fails size; the checker's mut-c2t-small70 fails size (FAIL 5) and mut-c2t-small (48 px) size and desk (FAIL 7).
  - q98 is now run in three parts (about 9.5 min whole): cache,looks,size,room,desk,enter,media,once,main (217 checks, 4.0 min);
    keep,settle,pause,still,self (44, 4.4 min); remake,self2 (8, 1.0 min).
  - Runs on fred98 (54a0d57, v122; main fred/null.html 2f8c5c9), Mac Studio, one at a time: q98 in its three parts, all OK
    (217 + 44 + 8 checks); q97 (main as second argument, Q97_REPO wt-q98) `OK: item 97: ... (126 checks)`; motion: motion `OK (20
    checks)`, load `OK (22 checks)`, reduce FAIL 1 at 00:13 (`span.dr-b > b`, white-space set by dayFitRows in 4 frames, on
    run-wx-fred-clouds and run-wx-fred-rain), then main's 4 run screens OK at 00:20, the run screens alone (`^run`, 13 screens) OK on
    this build and on 20770e2 just after, and the whole reduce pass again at 00:28 `OK (20 checks)`, 136 screens: an intermittent
    dayFitRows case in main's code (round 1 saw it on main), not this round's change (fwmA/fwmTime/fwmTick only); budgets `OK ... (25 checks)`; smoke `OK (14 checks)`; npm test 1810 tests, 1763
    pass, 0 fail.
- The bundle's v5 (2026-11-06 19:46 EST, FROM-DESIGN-CHAT-3; an independent check passed it for 98: probe98/verify-bundle3.json,
  groups boxes, motion and app97, problems C3, C7, C12, C13, C14), inlined with `node scripts/fw-inline.mjs ~/Dropbox/00_T/handoff`
  (never by hand): FW.version '5', FW.built '2026-11-06 19:46 EST', the page loads with no console errors. Cache stays v122 (the
  branch is not merged). The API and FW.WX_WEAR are unchanged; three weather boxes grew for motion (sun -14 0 218 202, fog -69 0 273
  203, rain 0 -37 281 241); the bob is 3 units about his feet (transform-box view-box, 100px 186px); no loop over 4 s but the fw-p2
  8 s blink (not in fred's bird).
  - Rain flaps again (decision above, now taken): v5 leaves out the flapping right wing when that wing holds a prop (HOLD_R: the
    umbrella among them), so the still copy over the umbrella is his only right wing. WX_FRED drops `rain:{}` (rain gets
    {cls:'fw-bird'} like every other look); its comment says why. Read in the card every frame of a flap, ride and run: one right
    wing at every frame, none in a flapping group, the left wing flapping 0 to -6 degrees (127 frames).
  - Place and size, measured through his whole move (kit2/q98/reach98.mjs: the look's drawing in a moving sandbox spot, every loop
    paused and set to each 20 ms of 0-4 s, each pose painted on a canvas with 40 units of room round the box; units of his 200-unit
    base box, painted [L T R B]):
    17:29 build at rest / through the move: sun [-3,28,194.5,195] / [-3,17,194.5,195]; heat, wind, clouds [25.5,34,194.5,195] /
    [25.5,23.5,...]; freeze, snow [25.5,16.5,...] / [25.5,5.5,...]; fog [-60,18,194.5,195] / [-60,7,...]; rain (no flap)
    [25.5,-14.5,263.5,195] / [25.5,-25.5,263.5,195]: 27.9 px right of his box (room 0.33 x 88 = 29.04) and 11.2 px above it (room
    0.14 x 88 = 12.32).
    v5 at rest / through the move: rest the same in every look; the move rises 5.5-6 units (was 10.5-11): sun top 22.5, heat, wind,
    clouds 28.5, freeze, snow 11, fog 12.5, rain (with the flap) [25.5,-20.5,263.5,195]: 27.9 px right (room 29.04, 1.1 px to
    spare, as before) and 9.0 px above (room 12.32, 3.3 px to spare, was 1.1). Left reach (toward the reading) and the bottom (toward
    the tiles) are the same as at rest in every look and the same as the 17:29 build (fog's beam -60 units, the spritz -3, his body
    25.5; his feet 195). Nothing is cut by the card and nothing sits closer to a word: the insets (0.33 / 0.14 of --wxf), --wxf 88 px,
    the reading's room and min-height and q98's expected numbers are unchanged. The CSS comment (q98 fred) gives v5's box and painted
    numbers. (The box's own reach is larger, 40.5% right and 18.5% up for the umbrella, but the svg has overflow visible: only what
    is painted counts.)
  - Kit, q98: cache needs the 19:46 build or later; looks needs, for rain in both boxes, the fw-bird wrapper and, every frame of one
    flap (2.1 s from his move's start), a flapping left wing reaching -5 degrees or more and exactly one right-wing path (WING_R) in
    no flapping group; size and desk judge the card edge on the union of his rest raster and his whole move (reach98's sampler, once
    per look; it replaces the fixed 12-unit lift), print the numbers above, check that every moving look's move was sampled (its loops
    ran, his top rose) and that the move reaches no further left or lower than his rest pose. self: rain without the flap (WX_FRED
    `rain:{}` back) fails looks; rain with the flapping right wing drawn under the still one (bird() made to draw it whatever the
    wing holds, the 17:29 doubled wing; a copy of the page) fails looks (2 right wings, 1 flapping). C14: the item 97 plumbing mutant
    now cuts the page from `function fwmTick(` to `\nfunction fwMount(` and puts back main 2f8c5c9's text for that span whole
    (q98/plumb97.txt: fwmTick, fwmTime, fwmStart, fwmA, fwmEnd; it refuses a copy where fwmLeft or the whole-round cap is left), so
    no fwmLeft and no cap: it fails settle on the sun look with a step of 23.2 (his blink cut half open in the frame .fwm-go comes
    off). (The round-2 kit's mutant replaced fwmA/fwmEnd and fwmTick's first line; the verify run's C14 was on the earlier one, which
    kept fwmLeft and did not fail.)
  - Kit, motion: KEYFRAMES['fw-speed'].sel is '.fw-anim .fw-speed-l' (v5's own class for the speed lines), taken from the page's
    bundle build as fw-l-in's is: a page whose FW.built is before 19:46 (main's 06:14, this branch's old 17:29) is judged on
    '.fw-anim .fw-speed i' only. Static audit OK on main's page (fred/null.html, 2f8c5c9) and on this one.
  - q97 compares the blocks with the handoff's v5 files byte for byte: OK.
  - Runs on fred98 (v5, v122; main fred/null.html 2f8c5c9), Mac Studio, one at a time: q98 in its three parts, `OK ... (219 checks)`,
    `OK ... (45 checks)`, `OK ... (8 checks)`; q97 (main as second argument, Q97_REPO wt-q98) `OK: item 97: ... (127 checks)`;
    motion `OK: motion audit: Reduce Motion still on 136 screens, nothing moves before a tap (7 first loads + every screen), only
    transform / opacity / bar widths animate (54 checks)` (801 s); budgets `OK: fred world budgets: 128 screens (30 with fred world
    art) ... (25 checks)`; smoke `OK (14 checks)`; contrast on the weather screens `OK: contrast AA on 22 screens ... (70 checks)`;
    layout (LAYOUT_ONLY the same screens) at 320 and 390 px x 100/150/200% `OK`; npm test 1810 tests, 1763 pass, 0 fail.
- Review of the v5 build, round 1 (the acceptance checkers: six findings, two of them the same timer; all fixed; app 5c1b768 and
  e10c736):
  - Motion: wxFred's fade path set cur._wxT (the old spot's removal at 520 ms) over his own fade-in timer (N._wxT, which takes
    .rwx-x off at 520 ms) without clearing it, so a second look change in place before that timer fired took .rwx-x (the only
    transition rule on him) off the fred fading out and he dropped to 0 in one frame (440 ms apart: 0.47 to 0; 470 ms: 0.72 to 0),
    while the sky beside him faded on (wxSkySet clears W._wxS2). Now `clearTimeout(cur._wxT)` first. No app path makes two looks
    change in place within 520 ms (a new look needs a new forecast: a tapped Crunch is fresh, the quiet refresh is at most every
    10 minutes; the checkers reached it only by calling wxPut straight): hardening, at no cost. Seen while checking it, not changed
    (not a finding, the same unreachable timing): a look changed in place while the box's entrance plays (.wx-go, the first second
    or so after a fresh Crunch): a spot made then fades in by rwx-fred-in (700 ms), and if the look changes again while that runs,
    that spot goes to 0 at once (the animation, not the 480 ms transition, held his opacity). For the app chat if the entrance and
    the cross-fade ever need to meet.
  - Print: the room is gone on paper, but wxFitRows had measured the sub-line with it on, and nothing measures again for print
    (real printing lays the page out for print right after beforeprint, with no frame, observer or timer between: checked with
    page.pdf), so a sub-line under the square only for fred's room (375-430 px phones at 100% text) printed under it, the card 13 px
    taller than main's. Now wxFitRows, when the sub-line wraps, measures it once more with the room off (a class on the reading for
    that moment, .sub-m0: the sub-line's padding-right 0; the first try set and cleared an inline padding-right, which the motion
    audit counts as scripted motion, 4 writes within 500 ms of load on 6 weather screens; a class change wakes neither the audit nor
    fitAll's MutationObserver) and marks one that fits then: .sub-room. The
    q98 print rule puts a `.sub-wide.sub-room` sub-line back beside the square (main's defaults: the square over both rows, the
    temperatures at the end, the sub-line in column 2 with its 4 px margin). Real print (page.pdf, Letter) of the run at 430 px in
    fog and the ride at 390 px in sun: "Sunny" at x 113.2 pt and the same y as main's print (the v5 build: 60.7, under the square).
    A sub-line that wraps without him (320 px) has no .sub-room and prints under the square, as on main. On screen nothing changes.
  - Tests, keep (the run): the run's carried fred was checked by his div only, 500 ms after a Crunch made mid-move, so a fred drawn
    anew in the new box (a new svg and fwMount record, a new move) passed. Now runKeepRun waits for him to settle, tags his div, svg
    and fwMount record, makes a fresh Crunch, and needs a new box with the same three, one spot, no .fwm-go and nothing running 800 ms
    after it and a second later. self2: `if(f){ fwMount(f, ''); nw.prepend(f); }` in runCrunchResult fails it.
  - Tests, keep (twice): an API check (wxPut called straight; labelled so in the test): sun, then rain and fog 440 ms apart, then rain
    and a card without a look 470 ms apart, begun once the entrance is over; every spot's opacity every frame (a spot gone reads 0):
    no step over 0.2 a frame on any, then one fred (fog) or none, data-fred-out gone. Worst step 0.14 on this build; self2: the
    fade-in timer left (no clearTimeout) fails it.
  - Tests, room: no tested card fell between 289 and 342 px, so the 305 px floor of the cut was never pinned (a 260 px floor
    passed). The grid adds 360, 370 and 372 px phones for the ride's rain at 100% text: out at 360 and 370 (cards 328 and 338,
    content 294 and 304), shown at 372 (card 340, content 306). Correction to the cut above: the card's padding and border are 34 px,
    so 305 px of content is a 339 px card, not 340 (a 371 px phone: card 339, fred shown); q98's card rule is `cardW < 339 && on`
    and the CSS comment says 339. self2: `max(260px, ...)` fails room at 360 px (fred in a 328 px card).
  - Tests, still: the drops count was read and never used (and counted the drops the card clips: 30 on a good build). Now still
    opens rain and snow under Reduce Motion and counts drops (.rwx-rd) and flakes (.rwx-fl b) drawn inside the scene's clip (its box
    within the card's padding box): none (30 and 28 in the sky, all above its edge). self2: drops and flakes at top 30% under Reduce
    Motion fail it (25 drops, 28 flakes in view).
  - Tests, media: print as paper gets it: frames and resize listeners stopped, beforeprint sent, print media: the run at 430 px in
    fog and the ride at 390 px in sun (under the square on screen, for his room) print the sub-line beside the square, the ride at
    320 px in rain (it wraps without him) under it; with the main page given, main prints each the same, at the same card height
    (402, 418, 503 px). The v5 build fails the first two. self2: no .sub-room fails it.
  - q98 in its three parts: cache,looks,size,room,desk,enter,media,once,main (226 checks, 4.7 min); keep,settle,pause,still,self
    (47, 4.8 min); remake,self2 (14, 1.5 min).
  - Runs on fred98 (e10c736, v122; main fred/null.html 2f8c5c9), Mac Studio, one at a time: q98 in its three parts `OK ... (226
    checks)`, `OK ... (47 checks)`, `OK ... (14 checks)`; q97 (main as second argument, Q97_REPO wt-q98) `OK: item 97: ... (127
    checks)`; motion: the motion and load passes clean, reduce FAIL 1 (`span.dr-b > b`, white-space set by dayFitRows in 4 frames, on
    run-wx-fred-sun, -freeze and -wind; dayFitRows sets and clears an inline white-space on every fit, so any load where fitAll runs
    in 4 frames within 500 ms trips it: the v5 build b3af2e0 fails the run screens' reduce pass 2 runs in 3, once on run-results
    without fred; main's 4 run screens passed 3 of 3 just after), then the whole reduce pass again `OK: motion audit: Reduce Motion
    still on 136 screens ... (20 checks)`; budgets `OK: fred world budgets: 128 screens (30 with fred world art) ... (25 checks)`;
    npm test 1810 tests, 1763 pass, 0 fail.
- Review of the v5 build, round 2 (the acceptance checkers: one finding, real, fixed; app aabe18a):
  - fred twice on the page: a ride Crunched, then the run Crunched (#results hidden, lastResult kept), then Units changed on the run
    side (Settings opens there: Advanced, Units) or a closet temperature edited: refreshResults ran render(lastResult) with no
    check, and render shows #results, so the ride's box (and its fred) came back under the run's: on a 390 px phone the run's fred at
    page y 1173 and the ride's at 2353; on the computer layout at 1920 x 1200 both on screen at once (the ride's column at the top).
    Main shows both panels the same way (no fred there): older than item 98, which made it a second fred. Fix: refreshResults
    returns when #results is not shown, as carbsSettingsRecrunch, bikeDef, setSwitch and the bottle default already check (the
    Clothing-only branch had that check; it now covers both). The other redraws with no such check (recrunch from Adjust, the
    bottle-size question, botChanged, tgCaf, fluidOverride) are controls inside the ride's results or its Adjust sheet, which opens
    only from them: not reachable on the run side. Not changed, as on main: a Units change does not redraw the run's own results
    (they keep the old units until the next Crunch).
  - Tests, once: sideRun: the ride Crunched (wind, motion), Units changed on the ride side (its box still shown and redrawn: its text
    changes), the run Crunched, Units changed on the run side through Settings, back to Plan (settings.units is the new one), and a
    closet temperature edited (an input event on #closetList): after each, #results hidden, #runResults shown, fred at most once
    on the page (and scrolled to 0, 400, 1200); again on the computer layout at 1920 x 1200 (scrolled to 0 and 150). self2:
    refreshResults as main has it fails it (the ride's box shown again, two freds).
