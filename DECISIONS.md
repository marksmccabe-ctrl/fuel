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
  inside the card in every look, both boxes, at 375 / 430 px and on the computer layout). The reading (.rwx-main) gets padding-right
  `1.21 x 88 - 10 px` (to his body's left edge, 25.5 units in, plus a 6 px gap; the beam and the spritz reach under the reading by
  design: words paint over them, with item 87's feather) and min-height so the tiles start below his feet. At 390 px "61° → 70°"
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
- fred once on screen: the ride's #results and the run's #runResults are never shown together; during a cross-fade the old fred is
  fading out (.rwx-out) for 520 ms.
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
