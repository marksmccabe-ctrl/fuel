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
  showed the ride's box again under the run's); during a cross-fade the old fred is fading out (.rwx-out) for 520 ms. Since review
  round 4 the rule is also kept where results are shown and where the sport changes: render and the Clothing-only branch hide
  #runResults as they show #results (the mirror of runCrunchResult), runApply hides both when the sport shown changes (as sportSet
  does: a sport pulled from another device goes through syncRender's runApply), and each Crunch gives up after its forecast if the
  sport changed while it loaded.
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
- Budgets (the kit; withdrawn in the kit step's fix, below): the build gave the frame rule a 1 ms share for fred world (BUDGET.fwMs: a
  screen over 4 ms passed if, with the FW animations paused, fred world added at most 1 ms to it), on readings of item 87's skies
  over 4 ms a frame at 6x (fred still: rain 3.6-3.8, snow 4.1-4.7, freeze 3.3). Those readings come from a busy host, not from the
  page: the same screens read 0.4-1.5 ms alone and 0.8-1.8 with fred moving on a quiet Mac Studio, and 3.4-4.8 on a budgets step run
  alone with the desktop busy (screen sharing with a busy browser on screen, WindowServer about 50%; the kit step's second fix,
  below), not only late in a long kit run as the first fix said. The share is gone and the rule is QUEUE.md's again (the whole
  screen at most 4 ms). The second 2 s window it brought for a screen over 4 ms (the lower kept) stays, now up to three, and since
  the second fix a frame is judged only next to a quiet host reference ("host busy" otherwise; read with the screen held still since
  the third). The flag for the app chat stays
  (the first fix withdrew it; the second puts it back): item 87's sky alone, fred paused, takes 3.6-4.3 ms of the 4 ms at 6x while
  the desktop is busy (0.4-1.5 on a quiet host), so on a phone already busy the skies leave fred world little room.
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
  - Runs on fred98 (aabe18a, v122; main fred/null.html 2f8c5c9), Mac Studio, one at a time: q98 in its three parts `OK ... (229
    checks)`, `OK ... (47 checks)`, `OK ... (15 checks)`; q97 (main as second argument, Q97_REPO wt-q98) `OK: item 97: ... (127
    checks)`; motion `OK: motion audit: Reduce Motion still on 136 screens, nothing moves before a tap (7 first loads + every
    screen), only transform / opacity / bar widths animate (54 checks)` (all three passes clean this time); budgets `OK: fred world
    budgets: 128 screens (30 with fred world art) ... (25 checks)`; npm test 1810 tests, 1763 pass, 0 fail.
- Review of the v5 build, round 3 (the acceptance checkers: one finding, real, a test gap; the app unchanged, aabe18a):
  - Tests, keep: q98 never checked that fred's room goes when the look goes. #rWeather stays in place across renders and Crunches,
    and data-fred on it turns the room on (the temperatures' and the sub-line's padding-right, the reading's min-height); only
    wxFred's `else delete W.dataset.fred` clears it. A mutant without that else (the feels-like card after an offline Crunch keeps
    data-fred "sun", 96.48 px of padding and a 48.52 px min-height, no fred drawn; at 390 px and 150% text its sub-line goes under the
    square) passed every section. Now fade() and twiceRun read the box's data-fred, both paddings and the min-height (roomOf), and
    keep needs none left once the old fred is gone (the card without a look put in place: its last frame, about 900 ms; twice: after
    rain then the card without one); a new check takes the real path (offRun: a sun Crunch online, then the next day with Open-Meteo
    failing and a fresh Crunch, 390 px at 150% text): the feels-like card has no fred, no data-fred and no room, its sub-line placed
    as on a fresh page with no forecast (beside the square). self2: the no-else mutant fails all three.
  - Runs on fred98 (aabe18a, v122, rebuilt; main fred/null.html 2f8c5c9), Mac Studio, one at a time: q98 in its three parts `OK ...
    (229 checks)`, `OK ... (49 checks)`, `OK ... (17 checks)`; q97 (main as second argument, Q97_REPO wt-q98) `OK: item 97: ... (127
    checks)`; motion: the motion and load passes clean, reduce FAIL 1 (`span.dr-b > b`, white-space set by dayFitRows in 4 frames, on
    run-results and run-wx-fred-rain: the intermittent case in main's code, above), then the reduce pass again `OK: motion audit:
    Reduce Motion still on 136 screens ... (20 checks)`; budgets FAIL 1 on its own throttle self-test (a fixed loop 5.7 ms at 1x,
    13.9 ms at 6x, under its 2.5x bar: the machine, not the page), then again `OK: fred world budgets: 128 screens (30 with fred
    world art) ... (25 checks)` (15.7 ms at 6x); npm test 1810 tests, 1763 pass, 0 fail.
- Review of the v5 build, round 4 (the acceptance checkers: two findings, both real, fixed; app 38abbd6):
  - fred twice on the page when the sport changes under shown results without the sport menu: (1) a sport picked on another device
    (settings.sport syncs key by key, item 96): A shows a run's results, B picks Ride, A comes back to the front (visibilitychange,
    a pull): syncRender calls runApply, which switched only the theme and the form, so the run's results stayed under the ride's
    form, and the next ride Crunch showed both boxes (at 1920 x 1200 the ride's fred in the middle column and the run's in the right
    column at once; at 390 px both on the page). (2) the sport picked while a Crunch's forecast loads (the sport menu stays live
    while Crunch is disabled): a run Crunch, tapped or the quiet forecast refresh (wxAutoRefresh: Plan or the app back in front with
    a forecast over an hour old), landed after sportSet had hidden both and showed #runResults on the ride's side; the ride Crunch
    then showed both. Main has both paths with no fred (the run's panel beside the ride's): older than item 98, which made them a
    second fred, as round 2's Units path. Fix: runApply hides both sports' results when the sport shown changes (html.sport-run
    before and after; each hide only when shown, so a load or a runApply with no change writes nothing), as sportSet does; the
    run's Crunch returns after its forecast unless the sport is still run, the ride's unless it is still ride (inside the try: the
    finally gives the button back); render and renderClothingOnly hide #runResults when they show #results, the mirror of
    runCrunchResult hiding #results, so no path shows the two together.
  - Tests, once: twoDev (two devices on the q91 Firebase stand-in, the hooked page with FIREBASE_CONFIG set): A Crunches a run, B
    pulls it and picks Ride, A pulls (visibilitychange until settings.sport is ride): neither result shown, no fred; A Crunches the
    ride: only its box, one fred; B picks Run, A pulls: neither shown; A Crunches the run: only its box, one fred; at 390 x 844 and
    1920 x 1200. raceRun (Open-Meteo 1.5 s late): a run Crunch tapped, Ride picked while Crunch is disabled: the late Crunch shows
    nothing, then the ride Crunched: only its box, one fred; and the mirror (a ride Crunch tapped, Run picked, then the run); at 390
    px and 1920 x 1000; and the quiet refresh at 390 px (the run Crunched, Journal, the clock two hours on, back to Plan: the refresh
    a run Crunch, Ride picked while it loads). self2: runApply without the hide fails twoDev after the pull (the run's results and
    fred under the ride's form); the run Crunch without its sport check fails the race (its results on the ride's side); that and
    render as aabe18a fail it with two freds after the ride Crunch; the ride Crunch without its check fails the mirror (its results
    on the run's side). The refreshResults mutant (round 2) still fails once, now with the ride's box shown on the run side and one
    fred (render hides the run's box for it), so its check asks for the ride's box shown and the run's hidden, not two freds.
  - Runs on fred98 (38abbd6, v122, rebuilt; main fred/null.html 2f8c5c9), Mac Studio, one at a time: q98 in its three parts `OK ...
    (254 checks)` (6.5 min), `OK ... (49 checks)` (4.9 min), `OK ... (21 checks)` (3.0 min); q97 (main as second argument,
    Q97_REPO wt-q98) `OK: item 97: ... (127 checks)`; motion `OK: motion audit: Reduce Motion still on 136 screens, nothing moves
    before a tap (7 first loads + every screen), only transform / opacity / bar widths animate (54 checks)` (all three passes clean);
    budgets `OK: fred world budgets: 128 screens (30 with fred world art) ... (25 checks)`; npm test 1810 tests, 1763 pass, 0 fail.
- Kit step (the whole kit, tools/runkit.sh, on fred98 = q98-wx-fred 38abbd6, v122; main fred/null.html 2f8c5c9, v121; Mac Studio):
  - Screens: the 19 checked on screenshots (plan-wx-fred-sun, -fog, -rain, -night; run-wx-fred-fog, -rain, -night; desktop-wx-fred):
    each shows fred top right of its box in the look its name says (the umbrella in the rain, the cap lamp's beam in fog, the night
    vest at 8 pm), the ride's box white, the run's graphite; on main's page all 19 print `skipped (needs css:.rwx-fred)`. Nothing in
    the review rounds changed what they should show (the room on the words beside him, v5's rain flap, the print sub-line are all
    seen on them or tested by q98). desktop-wx-fred's comment now gives the cut as 339 px (v5 review round 1) and says its sub-line
    sits beside the square at 1440 (436 px card), so the room on a sub-line beside the square is audited there.
  - One screen added, where no audit saw fred: desktop-wx-fred-run (needs 'css:.rwx-fred'; 1280 x 800, ?sky=fog, the run Crunched,
    #runWx scrolled to): the run's box is 360 px on the computer layout, fred shows top right (graphite, his lamp's beam toward the
    reading, the look that reaches furthest under the words). At 150%/200% text a 1280 px window is not the computer layout (608 px
    card, fred shown); the screen waits for his display only on html.dk. Checked on screenshots at 100/150/200%; skipped on main.
  - Contrast (KNOWN_ON_MAIN, two entries, desktop-wx-fred-run only): it is the first kit screen to show the run on the computer
    layout, and main has two failures there, not item 98's (both read on main 2f8c5c9 with a probe: the run Crunched at 1280 x 800,
    the same colours): the sidebar keeps its light fill #F0F0F2 while its labels take the run's light ink #F2F2F7, 1.02:1 (Journal,
    Races, News, Not signed in, Settings); and the Plan column's "Upcoming · N" heading (#prHead) keeps the ride's ink #0D0D0D on the
    run's graphite page #26262C, 1.29:1. For the app chat (the run theme on the computer layout); they print as known.
  - Budgets: the frame rule's second look (item 98, above) had no self-test, so a pause that paused nothing (own = the whole frame)
    or a judge that ignored fwMs would have passed every fred world. Now frameOver(F, own) and ownCost(p) are functions the walk
    calls, and a self-test mounts FW.scene alone on plan-before, measures it (2.2-2.4 ms a frame at 6x) and again with the FW
    animations paused (0.05-0.06 ms): the pause must take more than half off, and at a frame budget just under, FW adding that much
    fails a share just under it, passes one just over, a screen under the budget is not judged on its share, and one over it with
    no second measure fails. Mutants (copies in kit98/mut): ownCost without the pause fails it (2.69 ms paused), frameOver with the
    share test always true fails it. In the walk no screen was over 4 ms on this run (costliest 2.22 ms, run-wx-fred-snow), so the
    second look did not run there. (Replaced in the fix below: the share is gone, and this self-test with it.)
  - First whole run (before the budgets change): `kit: OK: 17 steps passed, 0 item tests skipped (7155 s)`; answer 1763 pass,
    contrast 129 screens (4 known on main), layout 123 (365 opened) at 320/375/430 and 129 (383) at 390, inventory nothing removed,
    motion 137 screens, budgets 129 screens (31 with fred world art), q91 324, q92 285, q93 209, q95 43, q96 101, q97 127, q98 322
    (865 s, under the 1500 s step limit). No app change was needed.
  - Final whole run (after the budgets change; logs/runkit-20261107-092713-33970): `kit: OK: 17 steps passed, 0 item tests skipped
    (7150 s)`; answer 1763 pass, contrast 129 screens (4 known on main), layout 123 (365 opened) at 320/375/430 and 129 (383) at 390,
    inventory nothing removed, motion 137 screens (54 checks), budgets 129 screens (31 with fred world art, 26 checks: the new
    self-test 2.28 ms moving, 0.07 ms paused), q91 324, q92 285, q93 209, q95 43, q96 101, q97 127, q98 322 (865 s). This time three
    weather screens went over 4 ms at 6x and took the second look: run-wx-fred-rain 4.16 ms (own motion 3.7: FW adds 0.46),
    plan-wx-fred-snow 4.77 (4.25: 0.52), run-wx-fred-snow 4.59 (4.37: 0.22), all under the 1 ms share (the first run's costliest
    was 2.22 ms). Those readings came from a busy host (not only late in a two-hour run, as the first fix said: they come back on a
    budgets step run alone with the desktop busy, second fix below), and that budgets OK leaned on the share: under QUEUE.md's rule
    the step would have failed. The first fix withdraws the share; the second judges the frame only on a quiet host.
  - Fix (a skeptic, round 1): the share rested on sky costs that do not reproduce on a quiet host (they do on a busy one: round 2,
    below). Quiet, one test at a time on fred98 (38abbd6):
    budgets on the 20 weather screens, costliest 1.77 ms (run-wx-fred-snow; rain 1.32-1.48, snow 1.76-1.77, the others 0.83-1.27);
    kit98/fix/skycost.mjs, about 1, 8 and 20 s after go() and then with the FW animations paused (fred settles by 8 s, so the later
    windows are the sky alone): rain 0.74-1.47 ms, snow 1.04-1.50, freeze 0.38-0.86, wind 0.52-1.17. budgets.test.mjs: BUDGET.fwMs
    and the share are gone; frameOver(F) is F.ms > 4, the whole screen. Against load, frameLow measures a screen over 4 ms again, up
    to 3 windows in all (BUDGET.tries), stopping at the first under 4, the lowest kept; before each window after the first the walk
    replays the drawings (a new app open, as before the first), so every window has fred moving from the start of his move (without
    it, the third window ended with 2 of the sun's 7 loops running; with it, 7 of 7). ownCost stays only to print, on a failing
    screen's line, the frame with the FW animations paused (not judged). Self-tests: frameLow on made-up windows (3.2 / 5, 3.9 / 5,
    4.5, 4.2 / 4.6, 5, 6 / 4 keep 3.2, 3.9, 4.2 over, 4.6 over and 4 not over, the windows numbered 0, 1, 2 for the replay), and the
    scene probe judged with frameLow and frameOver at a budget just under and just over what it costs, the pause taking its cost
    off. Mutants (kit98/fix/mut, run on the final test): frameLow keeping the last window, not stopping under 4, never measuring
    again, numbering every window 0 (so the walk would not replay), frameOver with a 1 ms leeway, ownCost without the pause: each
    fails the self-test. A copy with a 0.5 ms budget fails plan-wx-fred-sun and
    run-wx-fred-snow, the line giving the three windows, the running count and the paused reading.
  - Proof (budgets alone, the only step the fix touches, as runkit runs it: kit98/fix/step.sh, runkit's own step(); logs
    runkit-20261107-120752-39542): `budgets: OK: fred world budgets: 129 screens (31 with fred world art), ... (27 checks) (348 s)`;
    20 screens measured, costliest 1.51 ms (run-wx-fred-snow), none over 4 ms on a first window; the scene self-test 1.94 ms
    moving, 0.12 paused. Again at the committed kit f3551c2 (logs runkit-20261107-121813-40058): the same OK line (27 checks, 347
    s), costliest 1.98 ms (run-wx-fred-snow), none over 4 ms on a first window. No app change, so the other 16 steps stand as in the
    final whole run above.
  - Fix (a skeptic, round 2): the budgets OK did not hold. The skeptic ran the step alone at the committed kit (one test at a time, no
    other kit, review, node or headless browser on the machine; the desktop busy: WindowServer about 50% CPU, a screen-sharing session
    open since about 12:43, a Time Machine backup) and it failed the 4 ms rule: plan-wx-fred-rain 4.09 ms, plan-wx-fred-snow 4.47,
    run-wx-fred-snow 4.77 (each the lowest of 3 windows; the sky alone, fred paused, 3.56-4.34), the other 17 screens 3.44-3.98; a
    second run 7 minutes later failed snow on both sides again. Every self-test passed, so nothing in the step said its readings
    were inflated. The round-1 note ("load late in a two-hour run") was wrong: the readings follow what the desktop is doing, and
    so did the verdict.
    Measured here (kit98/fix2, one test at a time). hostref.mjs reads, round after round in one browser, the kit's reference page
    (hostref.html, below), plan-before alone, the FW.scene probe and plan-wx-fred-snow, all at 6x. Desktop busy (12:58, the same
    session; WindowServer about 50%, the owner's Chrome about 30%): reference 2.81-2.98 ms a frame, plan-before 0.18-0.34, scene
    5.37-5.57, snow 4.43-4.55 (the sky alone 3.72-3.85). Quiet minutes later (the session idle, WindowServer about 21%): reference
    1.09-1.42, plan-before 0.02-0.06, scene 2.42-3.14, snow 1.86-2.33 (sky alone 1.28-1.79). The readings rise at 1x too (snow
    1.72 ms a frame at 1x while busy), so the slowdown emulation is not what inflates them. Headless Chromium draws with SwiftShader
    (its WebGL renderer), so it is not the screen's GPU; 14 CPU-bound processes (`yes`) did not move the readings (reference
    1.25-1.42), and another headless browser with 4 heavy pages did, with the busy desktop's signature (reference 2.3-2.45,
    plan-before 0.12-0.14, scene 4.69-4.94, snow 3.37-3.56). What in the host does it is not known; what is known is that a fixed
    page reads two to three times higher, the app's screens with it, while the host is busy.
    budgets.test.mjs: the frame is judged only next to a quiet host. hostref.html (budgets/, the kit's own fixed page: a masked sky
    box of 35 rain and 60 snow loops and an SVG of 40 bobbing shapes, the kind of work the skies and fred world do, nothing from
    the app; its loops still except while it is read, html.on) is open in its own context through the walk. refCost reads it as
    frameCost reads a screen. frameHost reads it just before a screen's windows (frameLow) and just after; both at most
    BUDGET.refMs (1.8 ms): the windows are judged as before (OK, or FAIL frame with the paused reading added). Over it: the screen
    is read again 20 s later (a replay first), up to 3 reads; still busy: a "host busy" failure, "frame not judged", never OK or
    FAIL on those windows. After a busy screen the next ones get one read each (no waits) until one finds the host quiet. The
    reference is read at the start of the walk too (again 20 s later while busy, up to 3 reads), and the OK line gives its range
    ("4 ms a frame (host reference a-b ms, quiet at most 1.8)"). The limit: quiet readings 1.09-1.7 (one 2.11 that the re-read put
    right), busy 2.3-3.5; 1.8 is above every quiet reading but that one and well under every busy one. Next to a reading of at
    most 1.8 the screens read at most about 1.4 times their quiet cost, so the skies (quiet at most 2 ms) cannot be pushed over 4
    there. Another host must measure the reference again (REF_MS, the numbers in its comment). The walk's frame on one screen is
    one function now (screenFrame), so a self-test runs it. runkit.sh's comment says what a "host busy" line means (it said such a
    line says nothing of the page; not so, round 3 below: the reference reacted to the screen being measured, which kept moving
    while it was read).
    Self-tests (31 checks): the reference reads its loops (more than 3x its reading with them still) and nothing of it runs between
    reads; frameHost on made-up readings (1/1.2 judged at once; 3/1 then 1/1 judged on the second read after one 20 s wait; 1/3 then
    1/1.5 judged on the second, so both readings count and 1.5 at a 1.5 limit is quiet; three busy reads not judged, two waits, the
    reads numbered 0 1 2 for the replay; one read and no wait once the host stayed busy; 1.5/1.51 busy); screenFrame with the scene
    moving on plan-before: refMs + 1 ms of wall time more work a frame on the reference (a busy host stand-in, reading 4.3-5.1)
    gives "host busy" after 3 reads and 1 read on the next screen; the reference itself again, under a limit no reading reaches and
    a 0.01 ms budget: judged, a frame failure over 3 windows with the paused reading lower, the host quiet again. Mutants
    (kit98/fix2/mut, eleven copies run on the self-tests): hostQuiet on the first reading only, hostQuiet always true, no second
    read, busy windows judged, no one-read mode, no wait, the reference read with its loops still, its loops left on, every read
    numbered 0 (no replay), the walk ignoring a busy host, a busy host not carried to the next screen: each fails a self-test.
    Runs, the step as runkit runs it (kit98/fix2/step.sh, runkit's own step()), kit 9e468e3 + working tree. Quiet (logs
    runkit-20261107-131643-42194, the limit 1.6 then): OK, 31 checks, 461 s, the reference 1.21-1.52 ms, 20 screens judged,
    costliest 1.46 ms (run-wx-fred-snow). Busy: the desktop-busy spell had ended by the time the change was ready, so another
    headless browser with 4 heavy pages loaded the machine through the whole step (logs runkit-20261107-132513-42453): `budgets:
    FAIL 20` (506 s), every self-test passed, the reference at the start 2.95, 2.89, 2.97 (20 s apart), each of the 20 screens
    "host busy ... frame not judged" with the reference 2.64-3.5 next to it (the skies read 2.08-3.54 there), no app verdict. A
    busy spell mid-walk (the same load for 25 s from plan-wx-fred-sun's line; logs runkit-20261107-135407-43186): OK, 535 s,
    run-wx-fred-sun read 2.81/2.82, then 1.48/1.4 20 s later and was judged (0.64 ms); run-results was read again after a 2.11.
    Proof at the committed kit c13eeba (logs runkit-20261107-140557-43968): `budgets: OK: fred world budgets: 129 screens (31 with
    fred world art), ... 4 ms a frame (host reference 1.19-1.8 ms, quiet at most 1.8) ... (31 checks) (484 s)`; 20 screens judged,
    costliest 1.49 ms (run-wx-fred-snow), none read again; the scene self-test 2.02 ms moving, 0.03 paused. One quiet reading was
    1.8, at the limit (plan-wx-fred-fog's, its screen 0.86 ms): a quiet host reaches the limit now and then, and a reading over it
    is read again 20 s later. No app change, so the other 16 steps stand as in the final whole run above.
  - Fix (a skeptic, round 3): two findings, both real.
    (1) The host reference reacted to the screen being measured. It runs in the same headless browser, and the screen kept moving
    while it was read, so a screen over 4 ms on a quiet host pushed the reference over 1.8 and was called "host busy": the step
    failed, but blaming the host, and the kit told the reader a rerun on a quiet machine would do (it would not). The skeptic's
    measures at 8f5ff4c (kit98/sk3/mut, the host quiet, the reference alone 1.23-1.49): two FW.scene probes on plan-before (6.21 ms
    a frame) put the reference at 1.68-1.81 ms, 1.17-1.35 with them paused; walked with the real limits they read 5.58-7.81 and were
    "host busy" (1.89/1.9, 1.68/2.13, 1.94/2.57), the reference 1.49 once they were out; the self-test's one-scene case read
    1.66-2.02 next to its screen, over 1.8 in 3 of 6 quiet runs (it passed only under refMs 1e9). Measured here (kit98/fix3, one at
    a time, the same two scenes): the reference 1.69-1.84 with them moving, 1.15-1.23 with the screen's document timeline at
    playback rate 0, 1.21-1.28 with a stylesheet pausing every animation, 1.14-1.35 with them taken out. The skeptic's
    Page.setWebLifecycleState frozen does nothing to a shown page in this headless shell (the screen drew 142 frames through the
    read, no freeze or visibility event), nor does minimising its window (Browser.setWindowBounds).
    budgets.test.mjs: stillWhile holds the screen still through both reference reads (CDP Animation.setPlaybackRate 0 on its page:
    every CSS animation, transition and Web Animation on its timeline stays where it is; its own scripts still run; 1 again in a
    finally), and the drawings are replayed (a new app open) before every window, the first included (fred's move from its start:
    after a held read the app's clock and the stopped animations no longer agree). A judged window must have had the screen moving
    (__fwkA.snap: an animation running at both its ends advanced at least half its length) and 30 frames, or it is a 'frame'
    failure "not measured with the screen's motion running", so a timeline left stopped can never pass a screen. A host busy line
    gives how far the screen moved through the reads (0 ms when held still).
    (2) The self-tests passed with the gate broken: the skeptic's three mutants (noreport, the report's 'host busy' rule renamed: a
    walk with every reading busy then ended OK; nobracket, both reference reads before the windows; refms50, the limit at 50) passed
    all 31 checks. Now the report is a function (report) and a self-test runs it, through the real checker, on made-up walks (a
    screen the host stayed busy for: "FAIL 1" with its line, never the OK title; every screen busy: no ok for the frame rule; none:
    all ok), and the report fails any failure under a rule it does not list ("every failure is reported under its rule");
    frameHost's self-test records its call order (r w r, r w r z r w r, ...); the busy host stand-in is fixed, BUSY_SPIN 1.5 ms of
    wall time more work a frame on the reference (2.8-3.1 on a quiet host, inside the busy range; it was refMs + 1, so it moved
    with the limit), must read at least HOST_BUSY_LOW (2.3, the lowest busy reading on record) and give "host busy" under the
    committed limit, which must be under HOST_BUSY_LOW.
    New self-tests (36 checks): screenFrame with one scene and with two scenes (over 4 ms) under the committed limits: judged, the
    two scenes a frame failure (5.6-5.8 ms over 3 windows, the paused reading), never "host busy" (the reference 1.24-1.49 next to
    them), each with a trace read from the two pages themselves (traceOn: app opens and windows on the screen page, the reads'
    html.on/off on the reference page, by performance.timeOrigin + now(), the screen's Date being the kit's fixed day): reference,
    (app open, window) 1 to 3 times, reference, the screen moving 0 ms through each reference read and 2150 ms in 2.16 s through
    each window. Not judged there (a busy host), the reference is read alone: busy too, a 'host busy' line (the step fails with no
    verdict); quiet alone, the screen pushed it up and the self-test fails. A screen whose animations are all paused (.fw-paused):
    a 'frame' failure, not measured.
    Mutants (kit98/fix3/mut, mkmut.py, each run on plan-before; the control copy OK, 36 checks): the screen not held still (one
    scene moved 2000 ms through each read; two scenes "the screen pushed it up", the reference 2.01/1.94, 1.3/1.88, 1.33/1.93 next
    to them and 1.45 alone), no replay before a read's first window (trace R W R), the playback rate never given back (windows
    moved 0: not measured), no motion guard (the paused screen passes), the report's 'host busy' rule dropped, no catch-all for an
    unlisted rule, both reference reads before the windows (r r w), refMs 50, that with the stand-in at refMs + 1 (it reads 53),
    a stand-in of 0.01 ms (reads 1.5-1.6): each fails a self-test.
    Docs: hostref.html's comment (its reading rises with anything drawing next to it, the screen under test too, so it is read with
    the screen held still), runkit.sh's comment and RESUME (a host busy line gives that screen's frame no verdict, neither OK nor
    FAIL; no longer "says nothing of the page"), this entry.
    Runs, the step as runkit runs it (kit98/fix3/step.sh, runkit's own step()): on the working tree (logs
    runkit-20261107-155742-47176) `budgets: OK: ... 4 ms a frame (host reference 1.13-1.56 ms, quiet at most 1.8) ... (36 checks)
    (510 s)`, 20 screens judged, none read again, costliest 1.67 ms (run-wx-fred-snow). Under another headless browser's load (4
    heavy pages, kit98/fix2/load.mjs), the self-tests and plan-wx-fred-snow (kit98/fix3/busy-self.out): FAIL 3, all "host busy":
    the one-scene and two-scene self-tests (the reference 2.52-2.83 next to the held screen, 2.7-2.86 alone) and the screen
    (2.69/2.61, 1 read once the host stayed busy); every self-test ok, the stand-in 3.95-4.12. No app change, so the other 16 steps
    stand as in the final whole run above.
    At the committed kit 6cb7c0a (logs runkit-20261107-161552-47605): `budgets: OK: ... 4 ms a frame (host reference 1.08-1.79 ms,
    quiet at most 1.8) ... (36 checks) (509 s)`, 20 screens judged, none read again, costliest 1.78 ms (plan-wx-fred-snow); the
    two-scene self-test judged next to 1.3/1.28 and failed at 5.41-5.54 ms. Three readings of 1.67-1.79 there came just before a
    screen's windows, so the screen's own main thread was read through each reference read too (kit98/fix3/screentask.mjs, five
    weather screens): 2-6 ms of tasks over a read, idle, with readings of 1.6 and 1.64 among them, so those are the host's noise,
    not the screen. That number now goes in a host busy line ("the screen held still meanwhile: its animations moved at most 0 ms
    and its main thread ran at most 4 ms of tasks over a read", seen with every reading counted busy: kit98/fix3/busy05.out), so a
    screen whose own scripts kept working while held still would show there.
    At ab42642 the step ran into the busy desktop the skeptic of round 2 saw (logs runkit-20261107-163031-48006; a screen-sharing
    session with a busy browser on screen: WindowServer about 50%, ScreensharingAgent 40-56%, Chrome 25-28%): the self-tests ran
    while the host was still quiet (all ok; the two scenes judged next to 1.34/1.36, a frame failure at 5.63-6.03 ms), the reference
    read 1.33 at the walk's start, then the host turned busy: every one of the 20 screens "host busy ... frame not judged", the
    reference 3.16-4.45 next to each screen held still (its animations moved 0 ms, its main thread 9-13 ms over a read), the screens
    reading 2.28-4.57 there (run-wx-fred-rain 4.39-4.57 over 3 windows, plan-wx-fred-freeze 4.05 then 3.34): `budgets: FAIL 20 (573
    s)`, no app verdict, as the gate means. Fix 2 could not catch a busy desktop for its run; this is one.
    Proof at ab42642 once the desktop was quiet again (16:53: WindowServer 16-25%, ScreensharingAgent 1%; logs
    runkit-20261107-165337-49050): `budgets: OK: fred world budgets: 129 screens (31 with fred world art), ... 4 ms a frame (host
    reference 1.19-1.72 ms, quiet at most 1.8) ... (36 checks) (510 s)`; 20 screens judged, none read again, costliest 1.78 ms
    (run-wx-fred-heat); the two-scene self-test judged next to 1.32/1.42 and failed at 5.45-6.24 ms, its trace R A W A W A W R W
    with the screen moving 0 ms through each reference read. No app change (q98-wx-fred stays at 38abbd6, v122), so the other 16
    steps stand as in the final whole run above.
  - Fix (a skeptic, round 4): two self-test gaps at 5329ce0. Neither gave a wrong verdict on the page (the skeptic's budgets run at
    5329ce0: OK, 36 checks, 20 screens judged, costliest 1.21 ms; the two-scene self-test judged and failed at 6.06-6.75 ms), but
    each let a one-line break pass every self-test.
    (1) No self-test carried a 'frame' failure through to the step's last line: the report self-test's made-up walks had none, and
    the two-scene self-test checked only screenFrame's own list, never what the walk hands report(). The skeptic's mutants
    (kit98/sk4/mut): frameok (the report's frame rule always ok) and walkdrop (the walk's screenFrame call given [] instead of FAILS)
    passed all 36 checks, and with a 0.1 ms budget plan-wx-fred-snow ended OK under both.
    (2) frameHost's self-test could not tell which read's windows were judged: hfake's windows always read 2 ms. The skeptic's mutant
    firstwin (a screen judged on a later read gets reads[0].F, the windows taken next to a busy reference, beside the quiet read's
    readings) passed all 36.
    budgets.test.mjs, self-tests only (no rule or limit changed: 4 ms, REF_MS 1.8, the 20 s waits, 3 reads, 3 windows). The walk's
    frame block is a function, walkFrame(name, p, A0, M, REF, S, out, info): when an FW animation runs, screenFrame with the walk's
    state and failure list, the drawings replayed when M is a new look, the info line's numbers; each() runs it with ST and FAILS,
    and the walk's state comes from walkState() (ST and every self-test's). The one-scene and two-scene self-tests run walkFrame with
    a state and list of their own, and the two scenes' list goes through report() and the real checker: 'FAIL 1' with its frame
    line, no 'ok at most 4 ms' line, no OK title (on a busy host the same with its host busy line). The report self-test adds a
    made-up walk with two 'frame' failures, one over the budget and one not measured: 'FAIL 2' with both lines, no ok for the frame
    rule, no OK title. hfake's windows read 10 + the read's number: judged on the first read 10; on the second 11, with that read's
    readings (3/1 then 1/1: 1 1; 1/3 then 1/1.5: 1 1.5); not judged after 3 reads 12, with the last read's (3.4/3.5); once, 10. New,
    on the real path (screenFrame, the scene moving): the host busy on the first read only, a 7 ms stand-in on the reference stopped
    in the wait before the second read, from which the screen gets 7 ms more work a frame, under a host limit of 6 for this case (the
    reference on record reads at most 4.45, the busy desktop included; the stand-in more than 7): judged on the second read, its
    windows over 7 ms and the first read's under (8.55/8.49 -> 2.58, then 1.44/1.68 -> 9.82), next to that read's readings and
    listed as read again. 38 checks.
    Mutants (kit98/fix4/mkmut.py, each one line on the new file, run on plan-before with kit98/fix4/runmut.sh, outputs and
    summary.txt in kit98/fix4/mut; the control OK, 38 checks; same01, a 0.1 ms budget on plan-wx-fred-snow with BUDGETS_SELF=0:
    FAIL 1 with its frame line, so the walk still reports through walkFrame). Round 4's: frameok fails the two-scene self-test (its
    report) and the made-up frame walk; walkdrop (walkFrame's screenFrame call given []) the two-scene self-test; firstwin frameHost's
    and busy-then-quiet. Fix 3's ten all still apply (nostill's text moved in ab42642, Performance.enable now on that line; the same
    change made): nostill fails one and two scenes; noreplay0 and stillstuck the busy stand-in, busy then quiet, one and two scenes;
    noguard the paused screen; noreport and nocatchall the report's host busy walks; nobracket frameHost's, one and two scenes;
    refms50, refms50spin and spin0 the busy stand-in. Fix 2's eleven all still apply: judgebusy and noonce fail frameHost's and the
    busy stand-in; noreplay and quietfirst frameHost's; noreread and quietalways frameHost's, the busy stand-in and busy then quiet;
    notsticky and walkignores the busy stand-in; nowait frameHost's and busy then quiet; refoff the reference, the busy stand-in, one
    and two scenes; refon the reference.
    Not closed (a probe beyond round 4's list, walkdropcall): each()'s own call of walkFrame given [] instead of FAILS passes every
    self-test (38 checks, OK). The self-tests run each piece with a list of their own, so none sees the walk's own wiring: each()'s
    calls that hand FAILS to judge, walkFrame and the background and insert checks, and walk()'s report(C, FAILS, ST, ERRS), as
    before for every rule.
    Proof at the committed kit 329b3aa, the step as runkit runs it (kit98/fix4/step.sh, runkit's own step(); logs
    runkit-20261107-184913-55349), the host quiet (Time Machine backing up, WindowServer about 23%): `budgets: OK: fred world
    budgets: 129 screens (31 with fred world art), ... 4 ms a frame (host reference 1.22-1.67 ms, quiet at most 1.8) ... (38 checks)
    (547 s)`; the reference at the walk's start 1.82 then 1.23 (20 s later), 20 screens judged, none read again, costliest 1.58 ms
    (run-wx-fred-snow); the two-scene self-test judged next to 1.45/1.69 and failed at 5.78-5.97 ms, its list through the report
    "FAIL 1". The page is fred98/null.html, main 8c19078 (item 98 merged, v122). No app change.
  - Fix 5 (a skeptic, round 5): four gaps at 329b3aa, each a one-line break that passed all 38 self-tests. None gave a wrong verdict
    on the page (the skeptic's run of the committed kit: OK, 20 screens judged, costliest 1.49 ms), and no rule or limit changed in
    the fix (4 ms, 6x, 1,200, 30, 50 ms, REF_MS 1.8, the 20 s waits, 3 reads, 3 windows).
    (1) nolight: walkFrame's skip test (`> 0` FW animations running) had only been run on probes with 82 and 164 running. As `>
    BUDGET.anims`, every weather screen (3-7 running) went unmeasured: the frame rule printed "no screen had any running" and the walk
    of the 21 screens where FW animations run ended OK.
    (2) judgefirst: screenFrame judging the first read's windows (`frameOver(H.reads[0].F, L)`, taken next to a busy reference) while
    it reports the quiet read's passed, because the busy-then-quiet self-test ran at frameMs 1e9; at 4 ms its screen, 9.36 ms on the
    quiet read, passed on the busy read's 2.27.
    (3) rate5: BUDGET.rate 5, not QUEUE.md's 6, passed (the only slowdown self-test asked for more than 2.5x; the two scenes still
    read over 4 at 5x), and the last line, written by hand, still said "at 6x".
    (4) insskip: each()'s `if (was && !INS_ALL)` as `if (!INS_ALL)` opened no screen again at 6x; the insert rule printed ok having
    measured nothing (at a 1 ms insert budget, plan-results-weather, whose call reads 4.3 ms at 6x, passed). Fix 4's open walkdropcall
    (each()'s walkFrame call given []) is the same kind: nothing ran each() itself, and report() never held what the walk saw against
    what it was handed.
    budgets.test.mjs (3922207, then d7c87f9 after a pass of mutants on the first version; the fix ran over five sessions, the first
    four cut off by a session end, a usage limit, a restart and the app quitting, so this entry, the last mutant runs, a second proof
    and RESUME's note came last):
    - The limits are QUEUE.md's: RULE_TEXT is its budgets line word for word (main 8c19078, line 1870); a self-test reads the numbers
      out of it (ruleNums: 1,200, 30, 4 ms at 6x, 50 ms at 6x), holds BUDGET's nodes, anims, frameMs, rate and insMs to them, and,
      when git can show main's QUEUE.md (git show main:QUEUE.md from the kit's folder: the kit is a worktree of the fred repo), its
      line must be RULE_TEXT. The last line is written from BUDGET (summary()); a self-test gives it other limits and finds their
      numbers in it and none of the rule's. Every CPU slowdown the kit gives a page is logged (RATES, from the page's CDP session):
      the frame instrument must give the screen and the host reference the rule's 6 for its window and 1 after, and a page opened at
      6x (the self-test's and the walker's re-open) must get 6 before it loads.
    - The report holds the walk's state against its failures (gaps()): a rule gets its ok only when nothing failed it and nothing the
      walk saw contradicts that, and each contradiction is a FAIL line of its own (sel "the walk"): on a screen, a number over its
      limit with no failure under that rule there (nodes, running, unmounted art, off-screen groups, running hidden, the frame judged,
      the slowest call at 6x); FW animations that ran where the frame rule measured nothing (the screens the walk lists as having them
      running and, whatever that list says, the screen with the most running: the skeptic's S.max.running cross-check); a window kept
      without the screen moving and no frame failure; a screen or a self-test the host stayed busy for with no host busy line; fwMount
      spots never read at 6x (the skeptic's "S.ins > 0 needs a call measured at 6x", made per group of spots). The walk keeps what it
      saw per screen for this (S.by; S.ran, S.insFrom, S.insSeen, S.insDone). The skeptic's checks on the maxima (S.max.ins6 over
      insMs, S.max.frame over frameMs) are made on every screen's own numbers (S.by), so a screen over a limit that is not the
      costliest is held too.
    - The same for what else the walk hands the report: a self-test the host stayed busy for (busyOr, the reference read alone) is put
      in the walk's state (S.selfBusy) beside its host busy line; each screen's error lists (as opened, and the 6x re-open's) are kept
      in its record (S.by: errs, errs6) as well as handed on, and the errors check takes them from both (each list once). So a list
      dropped in walk()'s own calls still fails the step on what it held, and a state dropped there (a fresh walkState()) fails "every
      screen reached (0)".
    - The walk's work on one screen is walker(B, HOOKED, REF, S, FAILS, ERRS, L, reopen) (it was each(), inside walk()), and a
      self-test runs it: a page of its own of plan-before with a bird in a spot and, far below, a bird put in with innerHTML with a
      fw- loop no app rule reaches, under limits every probe is over (1 node, 1 animation, 0.01 ms a frame, 0.01 ms an insert), with a
      state and lists of its own, the screen opened again at 6x by a reopen that mounts the same bird there (plan-before makes no
      fwMount call of its own). Each rule (nodes, running, not mounted, off screen, background, frame or, the host busy, host busy,
      insert) must have its failure and its line through the report, every FAIL line the walk's own (no gap line), "FAIL n", no OK
      title; the walk's record of the screen (FW ran, measured, its spots read at 6x, its two error lists kept and handed on), held
      against no failures, a gap under each of those rules; and the page opened again slowed to 6 from its start.
    - walkFrame on one bird (2 animations, a light screen as the weather screens are) under the committed limits: measured (a reading,
      the screen in the state's frames, its info number) and judged with no failure (or, on a busy host, a host busy line when the
      reference alone reads busy too).
    - Busy then quiet is judged at a frame budget of the stand-in's own added work (FRAME4 = SPIN4 = 7 ms), between its two reads:
      only a window that had the screen's 7 ms more work a frame can be over it (the scene alone reads 2.1-4 ms there on a quiet host
      and 3.8-6.5 next to a busy one; with the 7 ms, 9.1-10.8 quiet and 10.6-13.7 busy). It must be judged on the second read with
      exactly one 'frame' failure, on that read's reading next to that read's reference, "FAIL 1" through the report, the first read's
      windows under the budget, and listed as read again. It has a scene of its own and runs after the one-scene self-test (a failure
      measures ownCost, which leaves a probe's loops off their CSS play state). Like the other self-tests that need a quiet host, when
      the second read's reference is over the committed 1.8 and the case is not met, it reads the reference alone (busyOr): busy too,
      a host busy line (the step fails, no verdict). The skeptic suggested 4 or 5 ms; the first version (3922207) took 6 ms with no
      fallback and failed as a self-test on a busy host (kit98/fix4/fix5/self3.out: the first read's windows 6.34/5.89 next to
      10.96/10.81, the second read's reference 3.77/3.76), hence the stand-in's own 7 ms. This is the self-test's own budget for a
      made-up case, not the rule's 4 ms.
    - The paused screen's window, kept without motion, is in the walk's state (a frame gap held against no failures): the first pass
      of mutants found nomotionoff (screenFrame not recording it) passing every self-test.
    - busyOr on the busy stand-in (3 reads alone, a host busy line, the self-test in the state, a gap without the line) and on a quiet
      host (a limit no reading reaches: 1 read, nothing). The report's gaps on made-up walks: each of the gaps above, the screen with
      the most running though unlisted and a self-test host busy among them, ends "FAIL 1" with a line of its own, and with its
      failure that line only; a made-up walk with errors in its record and not handed on fails the errors check with them (handed on
      too: each once).
    45 checks.
    Mutants (s3/mkmut.py builds them from the committed file, one line changed in each; run one at a time on plan-before with
    s5/runmut8.sh in the fifth session, outputs and summary.txt in kit98/fix4/fix5/s5/out; 45 checks in each run). The skeptic's four,
    each with the skeptic's own line on the new file: nolight fails the one-bird self-test ("not measured (walkFrame gave no
    reading)") and walker's ("no failure or no line for frame", the report's own line "frame · the walk · FW animations ran on it and
    the frame rule did not measure it"); judgefirst fails busy then quiet (8.86/8.4 -> 2.78, then 1.45/1.36 -> 9.89/10.26/9.78:
    "judged on the second read, 9.78 ms ... next to that read's reference 1.45/1.36, 0 failures", the windows judged being the first
    read's 2.78 ms, taken next to 8.86/8.4; its report still ended "FAIL 1", on the report's own line "frame · the walk · judged at
    9.78 ms a frame (budget 7 ms) with no frame failure"); rate5 fails five: the rule's numbers ("rate 5 but the rule says 6"), the
    last line from the limits, the frame instrument ("CPU slowdown given: 5, 1; to the host reference 5, 1"), walker's (its page
    opened again at 5x) and the 6x open ("a page opened at 5x (the rule's 6x)"); insskip fails walker's ("no failure or no line for
    insert", the report's line "insert · the walk · its fwMount calls (div#fwkW) were never read at 6x", "slowed to undefinedx": no
    page was opened again). Fix 4's open walkdropcall (walker's own walkFrame call given [] instead of FAILS) now fails walker's ("no
    failure or no line for frame", the report's line "judged at 0.26 ms a frame (budget 0.01 ms) with no frame failure"). nomotionoff
    (screenFrame not recording a window kept without motion) fails the paused screen's ("with no failures, no gap"). nolight, rate5,
    insskip, walkdropcall and nomotionoff ran beside item 99's mutant run (4 other test processes), which none of their failures
    needs; insskip's run also had the one-scene self-test "host busy" (the reference 1.96-2.29 next to the screen and 2.07-2.29 alone)
    and the one-bird self-test failed as "the screen pushed it up" (the reference 1.46-2.1 next to it, then 2.14 and 1.63 alone: the
    host turned quiet between the two reads alone), a self-test that falls back on busyOr blaming the screen for a host that settled;
    the step fails either way and a quiet host does not give it, so it is left as it is (not one of round 5's findings).
    The walk demos at d7c87f9 (BUDGETS_SELF=0; s3/out, the fourth session, other agents' tests running): nolight on the skeptic's 21
    screens (-wx-fred-, plan-results-weather, run-results) "FAIL 19", one line "frame · the walk · FW animations ran on it and the
    frame rule did not measure it" for each screen with FW animations running (the two night screens run none), where the skeptic's
    walk ended OK; insskip on plan-results-weather, the line "insert · the walk · its fwMount calls (section#rWeather.r-wx
    div.rwx-fred.rwx-keep) were never read at 6x" (beside a host busy line); walkdropcall at a 0.1 ms budget on plan-wx-fred-snow, the
    host busy there, the line "host busy · the walk · the host stayed busy for it with no host busy failure" (its frame line dropped,
    the walk's record still fails it). On a quiet host (kit98/fix4/fix5/mut/pass2, on 3922207, the same gaps code) walkdropcall01 gave
    "frame · the walk · judged at 0.46 ms a frame (budget 0.1 ms) with no frame failure".
    The earlier mutants (round 4's three, fix 3's ten, fix 2's eleven) and fix 5's own first ones (gapsnone, gapsok, norecord, ranoff,
    insdoneoff, frame5, walkrate1, summary6x) ran on the first version 3922207 (kit98/fix4/fix5/mut/pass1/table.txt): each failed a
    self-test. d7c87f9 kept every condition of the self-tests they fail and added some (the paused screen's gap, walker's error lists,
    more made-up gaps), but for busy then quiet (its 7 ms budget, and its busyOr fallback, which gives a host busy line in its place
    on a busy host), and none of them failed that one alone (firstwin, noreplay0, stillstuck, noreread, nowait and quietalways also
    fail frameHost's or the busy stand-in's), so they were not run again. Fix 5's later ones ran on d7c87f9 (mut/summary.txt, a quiet
    host, 2026-11-08; mut/final, 2026-11-13): maxrunoff (the screen with the most running no longer counted) fails the gaps self-test,
    selfbusyoff (busyOr not putting the self-test in the state) busyOr's, selfbusygap (the gaps ignoring S.selfBusy) busyOr's and the
    gaps', errskeptoff (the errors check ignoring the record) the errors-from-the-record self-test, errspush (walker handing on no
    list as opened) and errs6off (no record of the list at 6x) walker's.
    Not closed: walk()'s own two calls (walker with ST, FAILS and ERRS; report(C, FAILS, ST, ERRS)) are still run by no self-test.
    What fix 5 closes is that a list dropped there is backed by the walk's state: reportdrop (report(C, [], ST, ERRS)) passes the
    self-tests (OK, 45 checks, the host quiet: the reference 1.32-1.55 alone just before), and on the walk at a 0.1 ms budget
    (reportdrop01, BUDGETS_SELF=0, plan-wx-fred-snow; another agent's layout test running, the reference 1.6/1.45 next to the screen)
    it fails: "FAIL 1", the line "frame · the walk · judged at 1.75 ms a frame (budget 0.1 ms) with no frame failure". Also left
    alone, as in fix 4: REF_MS itself (a self-test cannot pin the host limit without restating it).
    Proof at the committed kit d7c87f9 (budgets.test.mjs unchanged since; the kit's HEAD was item 99's e697b67), the step as runkit
    runs it (kit98/fix4/fix5/step.sh, runkit's own step(); s5/proofwait7.sh: polls every 5 minutes, up to 3 hours, until no other
    headless Chromium or node test runs and the reference alone reads quiet; logs runkit-20261116-194400-53294). Item 99's mutant run
    and other agents' probes (and, 18:07-18:28, this session's mutants that need no quiet host) kept 2-11 test processes running from
    17:53 to 19:39; at 19:44 none ran and the reference read 1.21-1.34: `budgets: OK: fred world budgets: 129 screens (31 with fred
    world art), at most 1,200 FW nodes and 30 running FW animations, nothing running off screen or hidden, 4 ms a frame (host
    reference 1.17-1.75 ms, quiet at most 1.8) and 50 ms an insert at 6x; self-tests on plan-before (45 checks) (596 s)`. The
    reference at the walk's start 1.47; 20 screens judged, none read again, costliest 1.39 ms (run-wx-fred-snow; the others
    0.45-1.35); another agent's test started in the last 90 s of the walk, its last screens still next to 1.23-1.42. The self-tests:
    the limits "main's QUEUE.md line word for word"; the frame instrument "CPU slowdown given: 6, 1; to the host reference 6, 1"; one
    bird 0.16 ms next to 1.22/1.49, no failure; one scene 3.09 ms next to 1.61/1.47 (its first read 1.84/1.49, read again); busy then
    quiet 9.09/8.57 -> 2.68, then 1.26/1.59 -> 10.05/9.93/9.94, judged on the second read at 9.93 ms, one frame failure, "FAIL 1"
    through the report; two scenes judged next to 1.29/1.64 and failed at 5.67-6.06 ms (0.2 paused), "FAIL 1" through the report;
    walker "FAIL 8" with the walk's own failures only; the busy stand-in 2.81-3.91, busyOr beside it 3.47, 3.37, 3.42; a page opened
    at 6x 2.5 -> 15.3 ms. The page is fred98/null.html, main 8c19078 (v122). No app change.
    An earlier proof at d7c87f9 in the fourth session (s3/proofwait6.sh, logs runkit-20261116-150432-96862), after other agents' tests
    from 12:49 to 15:04: OK (45 checks, 647 s), the reference 1.25-1.79, 20 screens judged, costliest 2.04 ms (run-wx-fred-snow);
    tests started during that walk and three screens were read again after a reading over 1.8, then judged next to a quiet one
    (plan-wx-fred-heat 1.54/1.81 then 1.66/1.67, plan-wx-fred-fog 1.71/2 then 1.56/1.72, plan-wx-fred-rain 1.77/1.94 then 1.51/1.63).
  - Fix 6 (a skeptic, round 6): seven problems at d7c87f9 (kit98/fix4/sk6: mkmut.py, the demo pages page and page2, out/), all real, and
    fix 5's two open points. No rule or limit changed (4 ms, 6x, 1,200, 30, 50 ms, REF_MS 1.8, HOST_BUSY_LOW 2.3, the 20 s waits, 3
    reads, 3 windows). The proof below was OK, as the skeptic's own run of d7c87f9 was: no wrong verdict on this page, but each problem
    let a page that breaks the rule pass.
    (1) walkreduce: walk()'s run option motion:true as false passed all 45 self-tests; every screen opened with Reduce Motion on,
    nothing of fred world ran, and the frame rule measured nothing (at a 0.1 ms budget plan-wx-fred-snow ended OK), the walk's header
    still saying "Reduce Motion off" (written by hand). (2) win5x: screenFrame's window at frameCost(p, 5) passed; every line still said
    6x (the frame instrument self-test read frameCost's default, never the walk's window). (3) The insert rule never timed the weather
    fred's build: wxFred builds him (F.bird, then F.box) and calls fwMount with the string, so the kit timed the mount alone; sk6/page2
    (draw spinning 60 ms before F.bird) ended OK, slowest 4.6 ms at 6x. (4) reopennob: walker's default re-open without the kit's
    browser (no slowdown) passed; the walker self-test passed a re-open of its own. (5) nolayout: the timed call without its forced
    layout passed (the probes' inserts only had to be over 0 ms). (6) Only 2 of 31 fwMount calls were read at 6x: the re-open was keyed
    on the spots, and the 20 weather looks share fred's one spot (div.rwx-fred.rwx-keep). (7) <script id="fwJs" data-build="v5">
    (sk6/page) made the step exit "OK: no fred world in this page (before item 97)": the exit needed the tag's exact text.
    budgets.test.mjs (5ff576a):
    - Motion: walker records each screen as opened (Reduce Motion from the page's own media query; fred world's gate, html.fw-anim,
      expected open unless the screen's own settings turn Animate the world off) in S.by (reduce, shut); either is a failure under a new
      rule 'motion', listed in the report, with a gap when no failure carries it. walk() builds run()'s options once (RO) and prints its
      header from RO.motion.
    - The frame at 6x: frameCost returns the CPU slowdown the page had for its window (rate: the one the kit sent for it, from RATES);
      frameLow keeps every window's (rates); screenFrame reads its windows at L.rate (frameCost(p, L.rate)) and refuses a read with any
      window at another rate: a 'frame' failure "not measured at 6x", S.by.rateOff, a gap without the failure. In the self-tests,
      traced() holds every slowdown given to the screen's page across walkFrame to the rule's 6 then 1, for one scene, one bird and two
      scenes; a new self-test gives screenFrame a page whose CDP session sends 5 when the kit asks for 6 (so RATES says 5): refused.
    - The insert is the drawing's build and the call. The hooked copy wraps each function of window.FW at the main script's first line
      (the outermost call of one into another, none inside fwMount, which times its own), and hookSource finds the app functions that
      call fwMount (fwCallers: for each call in the main script, the top-level statement it is in, the nearest line at or above it
      starting at column 0, in the app's style; when that is a function declaration, it is a caller; top-level comments skipped; a call
      in any other statement is counted as loose) and wraps each (renamed __fwkC_<name>, a wrapper of the old name noting its start).
      Each fwMount call is charged (__fwIns: ms) its caller's work before it (lead: since the caller's start or its previous fwMount;
      by: its name), the calls of FW's drawing functions in the same task before that (outside a caller, every one since the previous
      fwMount; cleared at the end of their task), and the call with its forced layout (mount); build is the time in FW's functions. On
      item 98's page the caller is wxFred (3 calls; the page line names it), so plan-results-weather reads 2 ms at 1x, 6.5 at 6x (the
      mount alone was 0.8 and 3.7). insJudge judges ms against 50 ms at 6x; its line splits the build (the caller's work, FW's
      functions) from the call. Option A alone (FW's functions) would not have caught page2: its spin is in wxFred's own closure, before
      F.bird. What it costs: a caller that does other work before its fwMount call has that work charged too; on this page wxFred does
      only fred's, and a later item whose render mounts at its end would see the split on a failing line.
    - The re-open: insAgain (walker's, given the opener; the walk's opens in the kit's browser) holds the page opened again to the
      rule's rate (its first slowdown from the kit, RATES): another, or none, is an 'insert' failure "not opened at 6x", its calls not
      judged (S.by.notAt6, a gap without the failure; its calls stay unread, a second gap). Keyed on each call's spot and fwMount key
      (insKey: 'spot [key]', a keyless one by its nodes or "emptied"), so each weather look is opened again once; the never-read gap
      names the keys.
    - fwParts: the bundle's tag matched by /<script\b[^>]*\bid=["']?fwJs\b/, window.FW and fwMount's declaration; none of the three: the
      "before item 97" exit; some but not all: a failure ("fred world in part", naming what is there and what is not).
    - Fix 5's open points. walk() itself is self-tested (it takes its state, list, screen filter, limits and wait; main passes ST,
      FAILS, every screen, BUDGET): on plan-before only, with a state, list and checker of its own, and probes an init script puts in
      every page the walk opens (CTX_INIT, PROBE_INIT: a bird built for SLOW_MS, 80 ms, then mounted in a spot at the top; far below, a
      bird put in with innerHTML with a fw- loop no app rule reaches), the page opened again at 6x included, under 1 node, 1 animation,
      0.01 ms a frame and the committed 50 ms an insert. It replaces the walker self-test (which passed walker a re-open of its own) and
      checks the same and more: a failure and its line in walk()'s own report under nodes, running, not mounted, off screen, background,
      frame (or host busy) and insert (the slow build at 6x, over 50 ms), every FAIL line the walk's own (no gap: reportdrop fails
      here), its header "Reduce Motion off" and no motion failure, its record (Reduce Motion off, the gate open, FW ran and measured,
      its calls 'div#fwkW [kit:w]' read on a page opened at 6x, its error lists kept and handed on) and, held against no failures, a gap
      under each rule. REF_MS: held to the record it was chosen on (HOST_QUIET_HIGH 1.7, the highest quiet reading of fix 2's series;
      REF_MS above it by at most 0.1 and under HOST_BUSY_LOW): a restatement, so REF_MS changed alone fails (refms22, 2.2, passed every
      self-test before).
    - New self-tests (55 checks, from 45): the host limit on the record; fred world's parts on made-up texts (the tag with data-build,
      unquoted, after another attribute; a tag fwJsX; each part alone; none) and the hooked copy; an insert is the build and the call
      (at 6x, FW.bird built again and again for 80 ms then the last string mounted in the same task: 79.6 ms, the build in FW's
      functions 75, the call 4.6, an insert failure at 50 ms through insJudge; a string built in an earlier task, mounted alone: build
      0, 1.9 ms, no failure); the call timed with its spot's layout (a pre-built bird in the first cell of a 3000-row auto-layout table
      that follows its width: the call 13 ms, the spot's layout alone 10.4 ms, the median of 3 by widening the spot a pixel; the call
      must be at least 0.7 of it, the layout at least 4 ms; without the forced layout the call reads 0.6-0.7 ms there:
      kit98/fix6/probe/layout.mjs); the build in the app's own function (a made-up page through hookSource: kitDraw, which waits 40 ms
      and builds before its fwMount call, is the one caller found, the top-level comments skipped and a top-level arrow's call loose;
      run, kitDraw's call reads 42.6 ms, its work before the call 40.1 plus the call 2.5); the window at 5x refused; the walk itself; a
      screen opened with Reduce Motion on (walker on a page of its own): a motion failure through the report, its record a motion gap; a
      page opened again outside the kit's browser: an insert failure "not opened at 6x", two gaps without it; the made-up gaps for
      Reduce Motion on, the gate shut, windows not at 6x and a re-open not at 6x; insKey (two looks in one spot are two keys, the same
      calls in either order one, the gap names "div#x [wx:snow]").
    Demos (BUDGETS_SELF=0, kit98/fix6/out): sk6/page2 (wxFred spinning 60 ms before F.bird; copied to fix6/page2) on
    plan-results-weather and plan-wx-fred-snow: FAIL 2, "insert · section#rWeather.r-wx div.rwx-fred.rwx-keep · 69.1 ms at 6x (budget 50
    ms; the build 65.4 ms (wxFred's work before the call 65.4 ms; in FW's drawing functions 4.3 ms), the call with its spot's layout 3.7
    ms; 61.7 ms at 1x; a new drawing, 63 nodes, key wx:sun)", and 69.7 ms on plan-wx-fred-snow (which the committed kit never
    re-opened), where the skeptic's run ended OK. sk6/page (the tag with data-build="v5"; fix6/page7): no early exit, the walk ran and
    judged plan-wx-fred-snow (OK, 13 checks); that page with fwMount's declaration renamed (fix6/page7b): "FAIL fred world in part: the
    page has the bundle's tag (<script id="fwJs">) and window.FW but not function fwMount(".
    Mutants (kit98/fix6/mkmut6.py builds them from the committed file 5ff576a, one line changed in each, the earlier rounds' own change
    made on the new line where it moved; runmut6.sh runs each on plan-before, the self-tests and the walk of that screen, each with its
    own copy of the page since some change the hook, which is written beside the page; lists.sh ran four lists side by side; outputs,
    summary.txt and table.txt in kit98/fix6/out, table6.py setting the host's failures apart). The control (same): OK, 55 checks, 190 s.
    Side by side, with item 99's tests on the machine too, the host read busy (the reference about 1.7-3.3 next to the screens), so the
    frame self-tests gave host busy lines, or busyOr's "the screen pushed it up" when the host settled between its reads alone (fix 5's
    noted case); the step fails either way, and each mutant failed a self-test of its own besides (table.txt):
    - Round 6's: walkreduce the walk itself (no running, off screen, background or frame failure; a motion failure "opened with Reduce
      Motion on"), and the step's walk of plan-before fails motion too; walkreduce01 (0.1 ms, plan-wx-fred-snow) FAIL 1 "motion · the
      page · opened with Reduce Motion on", where the skeptic's ended OK. win5x the RATES held in one scene, one bird and two scenes
      ("the CPU slowdowns given to its page 5, 1, ... (not the rule's 6 then 1)"), the paused screen and the busy stand-in's quiet read
      ("not measured at 6x"); win5x01 FAIL 1 "frame · not measured at 6x: its windows read 1.41, 1.4, 1.26 ms at a CPU slowdown of 5x",
      where the skeptic's said "0.69 ms a frame at 6x" and ended OK. reopennob the walk itself (its page opened again "at nullx", no
      insert failure for the slow build); reopennob-ins2 (2 ms, plan-results-weather) FAIL 1 "insert · the page · not opened at 6x: the
      page opened again for its fwMount calls had no CPU slowdown from the kit (not the kit's browser)", where the skeptic's ended OK at
      0.9 ms. nolayout the layout self-test (nolayout-ins2 is no demo now: wxFred's lead puts the call over 2 ms either way, 5.2).
      insspots (the re-open on the spots alone) the insert key self-test and the walk itself; tag7 (the committed tag text) fred world's
      parts.
    - Fix 6's own: buildoff (FW's functions not charged) the slow build and the walk itself; leadoff (the caller's work not charged) and
      nocallers (no caller found) the made-up caller; nofwwrap (FW's functions not wrapped: "the build in FW's drawing functions 0") and
      insjudgemount (the insert judged on the call alone) the slow build and the walk itself; motionoff (no motion failure) the Reduce
      Motion self-test; motiongap (no motion gap) that and the made-up gaps; rateoff (no refusal) the 5x window; reopenlax (no refusal)
      the re-open outside the kit's browser; refms22 (REF_MS 2.2) the host limit.
    - Fix 5's and earlier (the skeptic's round 5 four, fix 4's walkdropcall, round 4's three, fix 3's ten, fix 2's eleven, fix 5's own;
      reportdrop, insdoneoff, walkrate1 and errs6off on their new lines): nolight one bird (not measured) and the walk itself; rate5
      eleven (the limits, the last line, the frame instrument and the slow build "at 5x", the RATES held, the 5x window and the re-open
      outside the kit's browser, the walk itself, the 6x open); insskip, walkdropcall, walkdrop, norecord, ranoff, insdoneoff,
      walkrate1, errspush, errs6off and reportdrop the walk itself (reportdrop's report gives the gaps' lines, not the walk's own: fix
      5's open point, closed); firstwin frameHost's and busy then quiet; frameok the made-up frame walk and gaps; nostill the traces
      (the screen moved 2000 ms through a reference read); noreplay0 and stillstuck the busy stand-in, busy then quiet and the traces;
      noguard and nomotionoff the paused screen; noreport the walk itself, the made-up report, gaps and catch-all; nocatchall the
      made-up report; nobracket, judgebusy, noonce, noreplay, noreread, nowait, quietalways and quietfirst frameHost's made-up readings
      (and the stand-in where it reaches); notsticky and walkignores the busy stand-in; refms50 and refms50spin the host limit and the
      stand-in; refoff and refon the reference; gapsnone, gapsok, maxrunoff and selfbusygap the made-up gaps; selfbusyoff busyOr;
      errskeptoff the errors from the record; summary6x the last line; frame5 the frame instrument ("at 5x"). judgefirst and spin0,
      whose failing self-tests need a quiet host, ran just after the proof (item 99's tests back on the machine): judgefirst busy then
      quiet (9.06/9.21 -> 3.33, then 1.89/1.78 -> 10.23/11.03/10.33: judged on the second read under the case's host limit, at 10.23 ms
      over its 7 ms budget, with no frame failure, the first read's 3.33 being the one judged; the line printed is busyOr's, the second
      reference being over 1.8, while the committed kit gives one failure on such readings); spin0 the busy stand-in and busyOr (a 0.01
      ms stand-in reads 1.7-2.51, not the busy range).
    Proof at the committed kit (budgets.test.mjs as in 5ff576a; the kit's HEAD a2e9f72, item 99's; runkit.sh's comment changed in the
    working tree), the step as runkit runs it (kit98/fix6/step.sh: runkit's own step() and budgets line; proofwait6.sh polled every 5
    minutes from 04:09 while item 99's mutant run was on the machine, until 05:19 when no other test ran, the reference alone 1.78,
    1.78, 1.81; logs runkit-20261117-051917-99122): `budgets: OK: fred world budgets: 129 screens (31 with fred world art), at most
    1,200 FW nodes and 30 running FW animations, nothing running off screen or hidden, 4 ms a frame (host reference 1.17-1.75 ms, quiet
    at most 1.8) and 50 ms an insert at 6x; self-tests on plan-before (55 checks) (870 s)`. Every screen opened with Reduce Motion off
    and the gate open; the reference at the walk's start 1.3; 20 screens judged, costliest 2.4 ms (plan-wx-fred-snow); 31 fwMount calls,
    wxFred's, and 18 screens opened again at 6x (2 before): plan-results-weather, run-results and the 16 weather looks whose spot and
    key no earlier screen had (plan-wx-fred-sun's and run-wx-fred-sun's are the results screens' wx:sun, desktop-wx-fred's
    plan-wx-fred-rain's, desktop-wx-fred-run's run-wx-fred-fog's), slowest 8.1 ms at 6x (run-wx-fred-snow; the looks 4.4-8.1 with their
    build, where the committed kit read the call alone, 3.7 on plan-results-weather). The time: 870 s, against 596 for fix 5's proof
    (and 647 for its earlier one): 16 more screens opened again at 6x, 10 more self-tests, and, other tests having started during the
    walk (4 test processes at the end), 7 screens read again after a reading over 1.8 (run-results, run-wx-fred-heat,
    plan-wx-fred-freeze, run-wx-fred-clouds 3 reads, plan-wx-fred-snow, run-wx-fred-snow, desktop-wx-fred 3 reads: 9 more reads, each
    after a 20 s wait, about 4 minutes of it); fix 5's 596 s run read none again, so the re-opens and new self-tests cost little next to
    the waits. The self-tests: one bird 0.7 ms next to 1.69/1.66, no failure; one scene 2.98 ms; busy then quiet 9.1/8.75 -> 3.18, then
    1.74/1.86 -> 10.23/10.09/10.14, judged on the second read at 10.09 ms, one frame failure; two scenes judged next to 1.27/1.34 and
    failed at 5.61-6.7 ms (0.19 paused); the slow build 83.7 ms at 6x (78.3 in FW's functions, the call 5.4), an insert failure; the
    layout 14.2 ms against 11.2 alone; the made-up caller 42.7 ms (40 before the call); the walk itself "FAIL n" with its own failures
    only, its slow build 82.4 ms at 6x. The page is fred98/null.html, main 8c19078 (v122). No app change.
    Not closed, or left as they are: fwCallers reads the app's style (every top-level statement at column 0, the lines inside it
    indented): a call in a top-level arrow or a listener is counted as loose and gets only FW's functions as its build (the page line
    gives the count: none on item 98's page). A caller's work before its fwMount call is all charged to the call, which is stricter than
    the drawing alone when a caller does other work first (wxFred does only fred's; a later item whose render mounts at its end would
    see the split on a failing line). FW builds left over at the end of a task wait for a setTimeout(0) to be cleared, so a task that
    runs before it can be charged them (more, never less). The host limit's self-test restates the record. busyOr's "the screen pushed
    it up" when the host settles between its reads alone (fix 5's noted case) came often in the side-by-side mutant runs; the step fails
    either way, and a quiet host does not give it.
  - Fix 7 (a skeptic, round 7; the last kit fix): six problems at 5ff576a (kit98/sk7: mkmut7.py, the demo pages page2, page3, page4 and
    pageshut, out/), all real. Each was a one-line break that passed all 55 self-tests, and each let a page that breaks the rule pass. The
    skeptic's run of the committed kit had no wrong verdict on item 98's page. No rule or limit changed (4 ms, 6x, 1,200, 30, 50 ms, REF_MS
    1.8, HOST_BUSY_LOW 2.3, the 20 s waits, 3 reads, 3 windows).
    (1) walkL: main's walk took its limits from walk()'s default argument, which no self-test ran (the walk self-test passes its own), and
    the last line was written from BUDGET: `L = Object.assign({}, BUDGET, { insMs: 100 })` there passed, and page2 (wxFred spinning 60
    ms before F.bird: 72 ms at 6x) ended OK under a last line still saying 50 ms. walk()'s other defaults (its state, every screen, the
    real wait) were not held either.
    (2) ins1x: insAgain judging the calls the screen made as opened (1x) passed, because the walk self-test's slow build was 80 ms of wall
    time, over 50 at any slowdown; page3 (a fixed 2e7 Math.sqrt before F.bird: 82.9 ms at 6x, 13.6 at 1x) ended OK.
    (3) reopenreduce: walker's re-open with Reduce Motion on passed (fix 6's motion record read only the walk's first open); page4 (the
    same work only when !reducedMotion()) ended OK at 7.1 ms at 6x.
    (4) callersif: fwCallers stepping up one line from a call, not to the column-0 line, passed (the made-up caller called fwMount on its
    second line); on item 98's page it found no caller (wxFred's calls are 3 to 10 lines in), and page2's 60 ms build ended OK again.
    (5) shutoff: the gate-shut half of the motion rule (`.worldMotion !== true`: every screen read as Animate the world off) passed; no
    self-test ran walker on a page whose gate is shut; pageshut (fwGate keeping html.fw-anim off once a .rwx-fred exists) ended OK with
    nothing measured.
    (6) partexit: main's branch on fred world's parts (`if (!P.all)` for `if (P.none)`) passed; fix 6's page7b (fwMount renamed) ended
    "OK: no fred world in this page".
    budgets.test.mjs (fix 7):
    - The walk's limits. walk() has no defaults: main names its state (ST), the screens (every one, or the regex's), the limits (BUDGET)
      and the wait (sleep). walk() records in its state the limits and the wait it ran with, the screens walked (run()'s list) and those
      skipped for their needs (run()'s own "skipped (needs ...)" lines). After the walk, main holds it to what it asked (heldWalk): every
      limit equal to BUDGET's (by name, either way), the wait the real one, every screen asked for walked or skipped for its needs, none
      walked that was not asked for, walker run once a screen; anything else is a FAIL line. The last line is written from the limits
      the walk recorded (summary(ST)). Self-test: heldWalk on made-up states (the limits or a copy of them held; insMs 100, frameMs 6, no
      limits, waits not slept, a screen not walked, one skipped without needs, one walked not asked for, a walker count off: each named).
    - The insert judged is the page opened again. The walk self-test's probe build is a fixed amount of CPU work: FW.bird built n times,
      n calibrated on the self-test page to about BUILD_1X (25) ms at 1x (6250-7143 builds here). walker records the slowest call as
      opened (by.ins1). The walk self-test requires the build's call as opened under 50 ms, the call judged (read from the page opened
      again) over 50 and more than 2.5x the 1x reading, one insert failure, its reading the one judged (here 18.9-23.1 ms at 1x,
      139-149 ms at 6x).
    - The re-open held to the walk's open. motionOf (walker's and insAgain's) reads Reduce Motion, Animate the world stored off, and
      the gate. insAgain refuses a re-open with Reduce Motion on, or the gate shut with Animate the world on, or the gate other than the
      screen had it: an 'insert' failure "not opened as the walk opens a screen", its calls not judged; the record (reduce6, shut6,
      motion6) and a gap without the failure. The walk self-test's probe builds once under Reduce Motion (a drawing whose moving look
      costs more), and its record must show the re-open with Reduce Motion off and the gate open. Self-test: insAgain in the kit's
      browser at 6x with Reduce Motion on, and with the gate kept shut by an init script (GATE_SHUT): refused, two gaps without the
      failure, none with it.
    - fwMount's callers read twice. The main script is read as JS (scanJs: strings, template literals, comments and regex literals
      skipped; a / is a regex where an expression starts), and only calls in code count. fwCallers reads them the app's way (the
      column-0 line above each call); braceCallers gives each call the column-0 function whose braces hold it. main fails when the two
      differ, when a declaration's body cannot be matched, or when the script is not read whole (its braces balanced, no template
      literal open). On item 98's page: 1768 functions declared at column 0, the script read whole, wxFred (3 calls) both ways. The
      made-up caller is written as wxFred is: three calls several lines into the body after indented lines, one inside a nested arrow,
      and a comment, a string and a regex naming fwMount( inside it. kitDraw (3 calls) must be found both ways, the top-level arrow's
      call loose, and each call's lead its wait (10, 20, 30 ms) plus less than 10. Self-test: callersDiff names a call given to another
      function, one missing and one more; a made-up page with a brace left open is not read whole.
    - The gate shut. Self-test: walker on the self-test screen opened with Reduce Motion off and Animate the world on (it stores no
      worldMotion: on unless false), its gate kept shut by GATE_SHUT. It must give exactly one 'motion' failure (the gate shut), "FAIL 1"
      through the report, a record of Reduce Motion 0 and gate shut 1, and a motion gap without the failure.
    - main's decision on the parts. partsDecision, run by main before it decides whenever the self-tests are on (so on every page, the
      partial page included): the step itself run (BUDGETS_SELF=0: no browser, no self-test of its own) on four made-up pages in a folder
      of its own. None of the parts gives "OK: no fred world in this page (before item 97)", exit 0; the tag and window.FW, window.FW and
      fwMount, and fwMount alone each give "FAIL 1" with "fred world in part", exit 1. A decision that lets a page with only some of the
      parts through fails on that page too. A page with none of the parts now ends "OK: no fred world in this page (before item 97):
      nothing to budget (1 checks)" (0 with the self-tests off); runkit's comment ("passes with OK: no fred world in this page") holds.
    - 62 checks (55 before): the five self-tests above that are new (main's hold, the two readings held to each other, the gate shut,
      the re-open refusals, the parts decision) and main's two checks on the page under test (fwMount's callers read twice; the walk held
      to what main asked).
    Mutants (kit98/fix7/mkmut7.py builds them from the committed file a602834, one line changed in each, an earlier round's change made on
    the new line where it moved; runmut7.sh runs each on its own copy of the page; lists7c.sh ran six lists side by side; outputs,
    summary.txt and table.txt in kit98/fix7/out, table7.py setting the host's failures apart). Item 99's tests were on the machine too (18
    or 19 test processes at each start), so the host read busy and the frame self-tests gave host busy lines, or busyOr's "the screen
    pushed it up" when the host settled between its reads alone. The control (same) gave FAIL 4, all of them host busy lines, with no
    failure of its own. Each mutant failed a self-test or a check of its own besides (table.txt). A first pass at the version before
    partsDecision (kit98/fix7/out-a) was stopped when the parts decision moved into main; every mutant was then rebuilt from a602834 and
    run again.
    - Round 7's, on the skeptic's pages with the self-tests on (as the skeptic ran them):
      - walkL (its change now on main's walk call) fails main's hold on the walk: "judged with insMs 100 (the rule's 50)". With the
        self-tests off it fails on page2 too (walkL-p2: FAIL 1, that line), where the skeptic's walk ended OK.
      - ins1x fails the walk itself: "the build's call 19 ms as opened (1x), 19 ms judged on the page opened again", and no insert
        failure for the slow build.
      - reopenreduce fails the walk itself: its re-open is refused, and the record reads "there Reduce Motion 1". On page4 it gives the
        insert failure "not opened as the walk opens a screen ... Reduce Motion on". With the self-tests off that is reopenreduce-p4: FAIL
        1, where the skeptic's ended OK at 7.1 ms.
      - callersif fails main's callers check, on page2 and on item 98's page: "none, 3 loose" against "wxFred (3 calls)", at lines
        11930, 11932 and 11937 (callersif-p2, self-tests off: FAIL 1). It also fails the made-up caller: "found none", 4 calls in no
        named function.
      - shutoff fails the gate-shut self-test (no failure, "OK: TITLE") and the gate-shut case of the re-open refusal.
      - partexit fails main's decision: every made-up page with some of the parts gave "OK: no fred world", exit 0. It fails on fred98,
        and on page7b itself run as runkit runs it (r7-partexit-p7b: FAIL 1), where the skeptic's exited OK.
      - Three demos ran with the self-tests off on mutants whose guard is a self-test: ins1x-p3, shutoff-shut2 and partexit-p7b. They
        end as the skeptic's did (OK); catching these is the self-tests' job, and runkit always runs them.
      - The committed file on the skeptic's pages with the self-tests off: page2 FAIL 1 (69.5 ms at 6x, wxFred's work 65.2); page3 FAIL
        1 (75.9 ms); page4 FAIL 1 (87.1 ms); pageshut FAIL 4 (the gate shut on both weather screens, and their re-opens refused); page7b
        FAIL 1 "fred world in part".
    - Fix 7's own:
      - heldok (heldWalk finds nothing) fails the hold self-test.
      - limitsoff (walk() records no limits or wait) fails main's hold: "no limits recorded", "its waits were not the real ones".
      - diffnone (callersDiff names nothing) fails the two readings held to each other.
      - noregex and nostrings (the scanner reads no regex literal, or no quoted string) fail main's callers check on item 98's page,
        which is not read whole (depth 5 with 1 template literal open; depth 40 with 3). They also fail the made-up caller (kitDraw
        (4 calls)).
      - braceswalkup (the brace reading gives a call the last function declared above it) fails the made-up caller: the top-level
        arrow's call is given to kitDraw.
      - ins1off (no 1x record) fails the walk itself. calib1 (the probe built once: 1.1 ms at 1x, 8.1 ms at 6x) fails it too.
      - reopenmotionlax (no refusal) fails the re-open refusal. motion6gap (no gap) fails that and the made-up gaps.
    - Fix 6's list, rebuilt (round 6's, fix 6's own, fix 5's and earlier: 59 mutants and 7 demos): each fails a self-test of its own,
      as it did at 5ff576a (table.txt).
      - walkrate1 now also fails the re-open refusal (its re-open is at 1x). nolayout also fails the three probe inserts (the bird
        below read 0 ms without its layout).
      - Demos: win5x01 FAIL 1 "not measured at 6x"; walkreduce01 FAIL 2 (motion, and the re-open refused); reopennob-ins2 FAIL 1 "not
        opened at 6x"; reportdrop01 the walk's record's gap line (the host busy there); same01 and nolayout-ins2 gave host busy lines.
      - judgefirst and spin0, whose failing self-tests need a quiet host, ran just after the proof with no other test on the machine.
        judgefirst fails busy then quiet: "judged on the second read, 9.3 ms ... next to that read's reference 1.4/1.5, 0 failures",
        while the report still ends "FAIL 1" on its gap. That is the clean line fix 6 left open (its run printed busyOr's line). spin0
        fails busyOr and the busy stand-in: a 0.01 ms stand-in reads 1.58-1.73, not in the busy range.
    Proof at the committed kit (budgets.test.mjs as in a602834; the kit's HEAD 0e5c3bf, item 99's), the step as runkit runs it
    (kit98/fix7/step.sh: runkit's own step() and budgets line; proofwait7.sh found no other test process at 12:35 after the mutant lists
    ended, the reference alone 1.35, 1.35, 1.43; logs runkit-20261117-123602-32209): `budgets: OK: fred world budgets: 129 screens (31 with
    fred world art), at most 1,200 FW nodes and 30 running FW animations, nothing running off screen or hidden, 4 ms a frame (host
    reference 1.12-1.41 ms, quiet at most 1.8) and 50 ms an insert at 6x; self-tests on plan-before (62 checks) (634 s)`.
    - The walk: 129 walked and 16 skipped for their needs (item 99's screens) of all 145, held to BUDGET and the real waits. fwMount's
      callers were wxFred (3 calls) both ways: 1768 functions declared at column 0, the main script read whole. Every screen opened with
      Reduce Motion off and the gate open. The reference at the walk's start read 1.41.
    - The frame: 20 screens judged, none read again, costliest 1.65 ms (plan-wx-fred-snow).
    - The inserts: 31 fwMount calls, 18 screens opened again at 6x with Reduce Motion off and the gate open, slowest 9.2 ms at 6x
      (run-results). No other test ran during the step.
    - The new self-tests:
      - the walk itself: 8333 FW.bird builds, 23.2 ms as opened (1x), 143.7 ms judged on the page opened again, an insert failure;
      - the made-up caller: 10.1, 22.6 and 30.1 ms, with leads 10.1, 20.1 and 30.1;
      - the gate shut: one motion failure;
      - the re-open refusals: Reduce Motion on, and the gate shut;
      - main's hold, and the parts decision.
    - The frame self-tests: one bird 0.53 ms next to 1.23/1.29, no failure; one scene 2.31 ms; busy then quiet 8.57/8.53 -> 2.36, then
      1.41/1.42 -> 9.43/9.41/9.57, judged on the second read at 9.41 ms, one frame failure; two scenes judged next to 1.26/1.32 and failed
      at 5.26-5.49 ms (0.18 paused).
    - The page is fred98/null.html, main 8c19078 (v122). No app change.
    Not closed, or left as they are (besides fix 6's, which stand):
    - fwCallers still reads the app's style. A call the two readings give to different functions (a body line at column 0, say) now
      fails the step instead of passing it.
    - The scanner's regex rule is a heuristic: a / after ) is division, so `if (x) /re/.test(s)` would be misread. That shows as the
      script not read whole, or as a disagreement: a failure, never a pass.
    - The walk's skipped screens are read from run()'s own "skipped (needs ...)" line (lib/screens.mjs, item 99's to change). If that
      line changed, a page with screens to skip would fail main's hold, not pass it.
    - The walk self-test's build is calibrated on the self-test page a few minutes before the walk. A host that slows sharply between
      the two could put its 1x reading over 50 ms: the self-test fails, never passes wrongly.
    - The demos with the self-tests off on the mutants whose guard is a self-test (ins1x, shutoff, partexit) still end OK, by design:
      BUDGETS_SELF=0 is for debugging, and runkit always runs the self-tests.
  - The last check (narrow, at f374e35; kit98/sk7b: mkmut.py, out/summary.txt): round 7's six mutants (walkL, ins1x, reopenreduce,
    callersif, shutoff, partexit) and eight of round 6's (walkreduce, win5x, reopennob, nolayout, insspots, tag7, leadoff, nocallers),
    rebuilt on the committed file and run with the self-tests on, each fail a check of their own, on top of the host-busy lines that
    the unchanged control (same: FAIL 4, all host busy) also gave while other tests ran. No rule or limit was loosened, and the fix 7
    entry matches the code. No problems. That ends the budgets step's skeptic rounds (seven, all after item 98's merge, kit only, no
    app change): what stays open is listed under fix 6 and fix 7.

## Item 99 · Your rider, and the rider on the Closet card (cache v123)
- Built on q99-rider (worktree wt-q99, from main 8c19078). Bundle: the design chat's v6 (FW.version '6', built 2026-11-07 22:08 EST),
  inlined with `node scripts/fw-inline.mjs ~/Dropbox/00_T/handoff` (never by hand); the page loads with no console errors.
- Decisions from the app chat, followed:
  - v6 now; the design chat fixes in v7 (FROM-APP-CHAT-5.md points 1-7) the Closet items that draw nothing or barely show. q99's strip
    check keeps ONE named list of these (V6_GAPS in q99.test.mjs, each tied to its point: 1 shoe covers with leg warmers or tights; 2 the
    rain jacket under a windbreaker, a jacket or the vest; 3 a jacket's sleeves under a thermal jersey; 4 wool socks under tights or leg
    warmers; 5 knee warmers; 6 the skullcap over the eyes with glasses 'none'; 7 the headband with shield glasses), printed as notes
    ("(shows)" or "(does not show)"); any other listed item that does not show fails. The item that takes v7 empties the list. No
    work-around in the app.
  - Under-layers draw nothing by design (jersey-light, jersey-med, bibs, the four base layers, summer socks; arm warmers and sun sleeves
    under the sleeves of a thermal jersey or a jacket): not judged. A hot ride with the starter closet shows the bare rider. No text in
    the strip (99.4).
  - Inputs to the bundle are guarded: riderIds passes riderOutfit only string ids that are own keys of FW.OUTFIT_LOOK
    (Object.prototype.hasOwnProperty.call), always an array; custom closet items (uid ids), '__proto__', 'constructor', numbers are left
    out. riderAvatar gets a number (32 or 30).
  - riderNorm (99.2) is the bundle's riderValid rule, value by value, built on FW.RIDER_DEFAULT and FW.RIDER_OPTIONS (riderValid itself
    is not exported): a value not offered (not a string, unknown, a prototype name) is that field's default, keys the bundle has no field
    for are dropped. Runs on load (after `let settings`), on restore and when synced settings arrive (riderSetNorm in syncSetSettings).
  - settings.rider has no DEFAULT_SETTINGS entry (as worldMotion): stored only when the rider taps a choice in the sheet; one key in
    item 96's key-by-key sync (one settingsAt stamp).
  - The strip, both avatars and the sheet's rider are fwMount spots with {still: true}, keyed on what they show (the normalised rider
    and, for the strip, the filtered ids), so item 97's guard lets them be and they never move. FW.box of a rider is 0 0 200 300.
  - Cache v123 (sw.js CACHE and APP_BUILD).
  - Kit: q98's 'main' section skips with a note when the main page has `function wxFred(` (as q97's skips once main has fwJs).
- Built (index.html):
  - Settings › You › Your rider (#prowBtn-rider, data-sheet rider, searchable: avatar, look, skin, hair, jersey ...); its value "Not
    set" until built, then "<jersey name> jersey". The sheet (.ssec #prowB-rider, title "Your rider", no "Saves as you type." line: in
    SET_NOSAVE, each tap saves): the live rider on top (#rdFig, 120 x 180 px, still), then Look (skin, hair style, hair colour, face) /
    Gear (helmet, glasses, lens, frame) / Kit (jersey, pattern, shorts; More colours: the jersey's fade, kit2, and sleeves) as v-folds
    (data-fold rider-look/gear/kit, closed the first time, remembered per device like every v-fold), each with its one-line summary under
    its title: "Light skin · short dark brown hair[ · beard]", "Black helmet · shield · purple lens" (or "no glasses"), "Coral jersey ·
    dots · navy shorts". Every option and name comes from FW.RIDER_OPTIONS / FW.RIDER_NAMES (object options carry their own names);
    every option has a name (q99 and tests/engine/rider.test.mjs check it: none missing). Colour fields (skin from FW.SKIN, hair, helmet,
    lens, frame, jersey, fade, sleeves, shorts) are 44 px round swatches (the colour, a 45% black edge, a ring when pressed; "Same as
    jersey" drawn in the jersey's colour); word fields (hair style, face, glasses, pattern) are 44 px word buttons. Each field's label
    shows the chosen name. Lens and frame hide with no glasses.
  - My decision on 99.1's "(aria-label, aria-pressed) in labelled radio groups": ARIA lets a radiogroup hold only radios, and
    aria-pressed belongs to buttons, so each field is a role=group named by its label (aria-labelledby) holding buttons with aria-label
    and aria-pressed, one pressed, behaving as a radio group the way Carry's kinds do (#carryKinds, the app's pattern with arrow keys):
    one Tab stop per group (the pressed button), the arrow keys move and choose (wrapping). The accessibility tree (Chromium, Playwright's
    aria snapshot) has group "Jersey" holding button "Coral" [pressed]; not heard on a real VoiceOver.
  - My decision on "More colours": the extra kit colours are the jersey's fade (kit2) and the sleeves, the two kit fields the spec's
    summary leaves out; the jersey's 11 colours all show.
  - settings.rider: riderPut stores the whole normalised rider (every bundle field) on any tap, the first one too (affirming a default
    builds it). riderNorm/riderSetNorm/riderBuilt/riderNow/riderIds are plain functions (riderSetNorm runs at boot, before the consts
    below it). In sfDocMerge the cloud's copy is normalised too (cs=riderSetNorm(syncStrip(c))), so a tampered cloud value is not a
    change to apply on every pull (it stays in the cloud until this device changes the rider; nothing draws it).
  - Restore: a backup with no settings.rider keeps this device's (as birthday and gender), one with a rider brings it, a tampered one is
    normalised; riderApply redraws the sheet, strip, avatars and row. Troubleshooting copy: 'rider' in DBG_DROP_SET and the strip
    (#rRider) out of its screen text. AI prompts: aiFill and its helpers never read settings (only name, birthday, gender, races). The
    privacy note: "...settings, closet, bikes and product library; your rider’s look; your last plan; ...".
  - Avatars (riderAv): the header's .hav and #sbAv hold the initial (.av-i) and a spot (.av-r); signed in and built, the rider
    (FW.riderAvatar, 32 / 30 px) replaces the initial (.av-on); signed out: the outline (#syncHdrIn) and the empty circle, built or not.
    renderSyncStatus no longer rebuilds .hav when only the sync state changes (dataset.st still set: its badge). The header's icon rule
    (svg 20 px) drew the rider at 20 px: `header .hacct .hav>.av-r>svg{32px}` (found by q99 avatar).
  - The strip (#rRider, before #rWear in the Closet card, so the list's re-render keeps it): riderStrip(o.wear ids) in renderWear (both
    the full plan and Clothing only), the rider 100 x 150 px centred, the list's hairline under it, aria-hidden, no text. The run has no
    Closet card. On the computer layout it sits in the results column's card.
  - Print: no strip (display none), the avatars show the initial. Forced colours: no strip (no art and no empty band), the avatars show
    the initial, the swatches keep their colours (forced-color-adjust: none, a colour picker's case) with a CanvasText edge and a
    Highlight ring when pressed; pressed word buttons Highlight. Graphite: Settings has none; the header avatar on the run is the same.
- Tests (app): tests/engine/rider.test.mjs, in npm test (8 tests): riderNorm field by field against 20 bad values, riderSetNorm,
  riderIds, every option named, every catalog id has a look, the strip's ids for hot, mild, cold, freezing and wet rides (starter and
  full closets, a custom item each). Two mutants (riderIds with `in`, riderNorm with `in`) fail it.
- Kit: lib/screens.mjs takes a screen's own forecast (`wx: {lo, hi, rain}`, weatherRouteFor) and a 'closet-full' seed, and adds 15
  screens (needs '#prowBtn-rider' or '#rRider'): settings-rider, -built, -look, -gear, -kit (More colours), desktop-settings-rider,
  plan-avatar-rider and desktop-avatar-rider (the cloud page, signed in), plan-closet-rider-hot/-mild/-cold/-freezing/-wet/-full and
  desktop-closet-rider (1440 x 900); each checked on a screenshot. q97 LATER allows item 99's spots and functions (and its recorder
  skips every LATER spot). q98's main skip. No new @keyframes (the rider is still): the motion audit needs no entry. New
  q99/q99.test.mjs (sections cache, row, sheet, build, norm, backup, sync, private, avatar, strip, still, media, fit, main; about 2.5
  min whole). q99/mut99.mjs: 30 mutated copies of the page (probe99/mut-<name>/), each fails q99 in the sections that guard it.
- The strip's pixel method (q99 strip): the rider drawn with FW.plain at the strip's size on a 2x canvas (200 x 300), whole and with
  each item left out: an item shows with at least 120 device px changed by more than 48 in a channel and, where it has its own colour
  (OUTFIT_LOOK's: knee grey #B9C2CF, toe grey, the vest's teal ...), at least 40 of them in it (1x lost thin parts' colour to
  anti-aliasing). Judged on the bundle's default rider and on RIDER99 (review round 1: RIDER99's misses had been notes only; now
  only SKIN_GAPS holds them, below).
- Found, for the design chat (not in FROM-APP-CHAT-5; q99 holds them in SKIN_GAPS, review round 1): on deep brown skin (#5A3622) the
  full-finger gloves (#2A2A30) change no pixel by more than 48 (0 px; d>24: 432), and the leg warmers with shoe covers 113 px; dark
  gloves and leg wear read poorly on the darker skins.
- Runs on fred99 (q99-rider, v123; main fred/null.html 8c19078, v122), Mac Studio, one at a time: q99 (main as second argument)
  `OK: item 99: Your rider, and the rider on the Closet card (224 checks)` (146 s; the strip's notes: gaps 1, 2, 3, 4, 5, 7 seen, 6 not
  reached by these rides); the 30 mutants each FAIL; q98 in three parts (main as second argument) `OK ... (253 checks)` (its main check
  skipped with the note), `OK ... (37 checks)`, `OK ... (33 checks)`; q97 (main as second argument, Q97_REPO wt-q99) `OK: item 97: ...
  (127 checks)`; motion on the 15 new screens `OK ... (26 checks)`; smoke `OK (14 checks)`; contrast on the new screens `OK: contrast AA
  on 15 screens ... (56 checks)`; layout on them at 320 (12 screens x 3 text sizes) and 390 (15 x 3) `OK`, no new failures; inventory
  `OK: inventory nothing removed (7 checks)`; budgets on the new screens: every item 99 rule ok (most FW nodes 234, plan-avatar-rider;
  0 animations running; slowest fwMount 36.6 ms at 6x) but `FAIL 4`: its four frame self-tests "host busy, not judged" (the host
  reference read 3.9-4.3 ms a frame against its quiet 1.8): the gate, not the item; npm test 1818 tests, 1771 pass, 0 fail.
  The whole kit (runkit.sh) and budgets on a quiet host are the kit step's.
- Review round 1 (the acceptance checks' 15 problems; all reproduced, all real; fixed in the app's look and in q99):
  - "Same as jersey" (the fade and the sleeves, '') looked exactly like a field's own disc for 5 of the 11 jerseys (a Black jersey's fade
    and sleeves: two black circles each; Navy, White, Lime, Teal too). It is now the jersey's colour as a ring (.rd-same: a panel-coloured
    middle with a 45% black edge over the jersey's colour; Canvas / CanvasText in forced colours), 44 px, its background-color still the
    jersey's.
  - The Look summary per hair style: "black ponytail", "black braids", "black head covering" (the bundle draws 'covered' as a covering
    in colour c), "short black hair" for the rest; with Covered the colour field (and its group's name) reads "Covering colour".
  - Settings on Running: the row stays in You (Cycling), as placed; the search now counts only the side shown, and a match only on the
    other side gives "No Running settings match “rider”." with a 44 px button "Your rider is under Cycling ›" (or "N under Cycling ›")
    that turns Settings to that side and focuses the row; a search with no match anywhere is the plain line. This was a blank page for
    any other-side match (a Settings search bug since q42's sides, met by this item). The line is rebuilt only when its words change: a
    re-filter between the press and the lift took the button away (a real click never landed).
  - The strip's gaps list is as wide as each point: whole (only a note) where FROM-APP-CHAT-5 says the item draws nothing there (1 shoe
    covers with leg wear; 2 the rain jacket under a windbreaker or a thermal / winter jacket, and under the vest with a thermal jersey,
    points 2+3; 3 a windbreaker over a thermal jersey, its body 1.02:1; 4 wool socks with leg wear; 5 knee warmers); otherwise the part
    the point leaves must show, judged as any item (3: a thermal or winter jacket's body under a thermal jersey; 2: the rain jacket's
    yellow sleeves under the vest; 6 the skullcap and 7 the headband must show at the threshold). Notes say "held" or "judged".
  - A built rider is judged as the default one is. Its misses are held in one more named list, SKIN_GAPS, tied to the dark-skin note
    below (A: full-finger gloves on deep brown skin; B: leg warmers on deep brown skin with shoe covers); the item that takes the fix
    empties it.
  - For the design chat (the app chat to send, after FROM-APP-CHAT-5; q99 holds both in SKIN_GAPS): A. full-finger gloves 'gloves'
    (#2A2A30) on deep brown skin (#5A3622) change no pixel by more than 48 at strip size (d48 0; on the wet rides); B. leg warmers 'legs'
    (#1E1E24) on deep brown skin with shoe covers change 113 device px against 120 (the cold starter ride; point 1's covers draw the sock
    black once the leg warmers are out). Dark gloves and leg wear read poorly on the darker skins: give them a lighter edge or cuff.
  - q99 now also checks (each a mutant that passed before and fails now: q99/mut99.mjs c1-*, from probe99/check1-tests/mk.mjs): every
    swatch painted its own option's colour (skin FW.SKIN, '' the jersey's) and no two alike in a field, for all 11 jerseys (c1-swsame,
    nosame); the pressed ring and word fill in normal colours (c1-noring); the live rider before and above the groups, a still fwMount
    spot, hidden in forced colours and print (c1-figlow, c1-fignofwm); the arrows wrap at both ends and Up / Down move (c1-nowrap,
    c1-noupdown); folds remembered across close, reopen and reload (c1-nofoldmem); tapping the pressed default builds the rider
    (c1-noaffirm); backupData() carries the rider and that export brings it to a fresh page (c1-nobackup); a rider changed in the
    sheet, by a restore and by sync while the results are up redraws the strip (c1-nostripapply); the sync badge (data-st offline, its
    dot, back to synced) with the rider in the circle (c1-nost); the jackets' bodies and the rain jacket's sleeves (c1-nojacket); a
    built rider's miss outside SKIN_GAPS (riderwide); the summaries per style (hairsum); the other side's match (sideblank). On the
    old build (659d8a2) the new checks fail where the app changed: the Same-as mark (sheet, media), the summaries (sheet, build), the
    other side's search (row): `FAIL 7`.
  - Runs (fred99 at q99-rider 40a0bfd, v123; main fred/null.html 8c19078), one at a time: q99 (main as second argument) `OK: item 99:
    Your rider, and the rider on the Closet card (269 checks)` (172 s; notes: points 1, 4, 5 and the dark-skin A, B held; 2, 3, 7
    judged and shown); the 16 new mutants each FAIL in the sections that guard them; q98 in three parts (main second) `OK ... (289
    checks)` (its main check skipped with the note), `OK ... (16 checks)` (self), `OK ... (18 checks)` (self2); q97 (main second,
    Q97_REPO wt-q99) `OK ... (126 checks)` (one fewer than before: the handoff folder now holds v7, built 2026-11-08 09:29 EST, so its
    byte check skips with a note); motion on the 15 rider screens `OK ... (26 checks)`; contrast on them `OK ... (56 checks)`; layout
    on them at 320 `OK`; smoke `OK (14 checks)`; budgets on them: every rule ok (most FW nodes 234, 0 running, slowest fwMount 32.1 ms at
    6x) but `FAIL 4`, the four frame self-tests "host busy, not judged" (reference 2.8-3.2 ms against 1.8; load average 4.5): the gate,
    not the item; npm test 1819 tests, 1772 pass, 0 fail (rider.test.mjs: the Look summary for every hair style).
- Review round 2 (the acceptance checks' 12 problems; all reproduced, all real; two fixed in the app, the rest in q99 and the kit):
  - The app: with Covered the six colours are a covering's, named as plain colours (RD_COVER: Auburn → Rust, Blond → Gold; Black,
    Dark brown, Brown and Grey read as plain colours already) in the buttons' names, the field's chosen name and the Look summary
    ("gold head covering", never "blond head covering"); back to hair, the bundle's hair names. The bundle's names stay as they are.
  - The summaries' "one line" (99.1): at 390 px a summary has 299 px; the longest choices measure 372 (Look: "Deep brown skin · dark
    brown head covering · mustache"), 278 (Gear) and 339 px (Kit), so 88 of the 1,008 Look and 16 of the 264 Kit summaries cannot fit
    one line at 100% text (a font that fits them would be 11.6 px). I first ended them in an ellipsis (nowrap); the layout audit failed
    it (an ellipsis is allowed only on its ELLIPSIS_OK labels), and it cut even the default rider's Kit summary at 150% text ("Bluebird
    blue jersey · plain · black sh…"). My decision: they wrap, never cut. A typical rider's (the default's, RIDER99's) are one line at
    390 px and 100% text; the longest take two. q99 now says so and measures it (the old check claimed one line for every rider but
    measured only RIDER99's Look). Reversible in one CSS line if the app chat wants the ellipsis (then ELLIPSIS_OK needs the entry).
  - V6_GAPS, two more point 1 entries (whole, notes only), found on a Hard freezing (24-29 F) and a Recovery cold (40-44 F) ride with
    the full closet: 'overshoes' with leg wear, and leg wear ('legs', 'tights-light', 'tights-heavy') under overshoes. FROM-DESIGN-CHAT-5
    point 1: v6's overshoes are "a black long sock, which merged with tights" (v7 gives them the covers' cuff from y 256). Measured on
    the default rider: overshoes with tights-heavy 28 px (19 with wool socks too), the tights under them 59 px with 0 in #14141A; each
    alone 442 and 486 px, and the tights with wool socks but no overshoes 464 px (so point 1, not point 4, takes them).
  - q99's strip now judges every ride in RIDES (hot, mild, cold, freezing, wet, and the Hard freezing and Recovery cold rides, the effort
    tapped before the Crunch) with both closets, for the default rider and RIDER99 alike (the ids against the list too), and every other
    skin on the same lists (the default rider in each of FW.SKIN's 8). Round 1's "a built rider is judged as the default one is" only
    held on the cold and wet rides; now it holds on all seven.
  - SKIN_GAPS widened to what that measured (each still one entry, tied to the dark-skin note): A, gloves on deep brown skin: the
    full-finger ones (d48 0) and the fingerless ones (304 px, 8 in #2A2A30: only the light cuff reads; the hot, mild and wet full-closet
    rides); B, leg warmers with shoe covers on tan to deep brown skin: tan 159 px / 38 own, olive 123 / 34, brown 121 / 34, dark brown
    119 / 30, deep brown 113, against 120 / 40 (the cold, freezing, Hard freezing and Recovery cold starter rides). B is point 1's
    consequence (without the leg warmers v6's covers draw the sock black, so they add only the shin above it); on fair, light and rosy
    skin they still pass, and by eye they read on tan, olive and brown (the acceptance check's pair shots). v7's cuff should clear B; A
    is the skin's own contrast (#2A2A30 on #5A3622 is at most 48 a channel) and stays until the art changes.
  - The dark-skin note for the design chat, widened (the app chat to send): A. gloves on deep brown skin (#5A3622): full-finger
    'gloves' (#2A2A30) change no pixel by more than 48 at strip size; fingerless 'gloves-finger' read only by their light cuff (8 px in
    their colour). B. leg warmers 'legs' (#1E1E24) with shoe covers on dark brown (#7E4E2F) and deep brown skin barely differ from the
    shin (119 and 113 device px); on tan, olive and brown they show but measure under the strip's own-colour count. Dark gloves and
    leg wear want a lighter edge or cuff on the darker skins.
  - q99 also checks now (each a mutant that passed before and fails now: q99/mut99.mjs r2-* from probe99/check2-tests/r2/mk2.mjs, and
    this round's own): the not-built sheet's names and summaries for the default rider (face none, "plain", the shield: r2-facenone,
    r2-plainsum, r2-namesunbuilt) and the Gear summary with no glasses (r2-gearnone); each swatch's edge in normal colours (the edge
    over the swatch, or the swatch, 3:1 against the panel, for all 11 jerseys: r2-noedge) and in forced colours, dark and light, the
    edge CanvasText and the pressed ring Highlight, read from a probe element (r2-fcmarks); each bundle block byte for byte by its sha1
    (BUILDS in q99, the v6 22:08 copy probe99/v6-2208-copy, so a hand edit fails whatever the handoff folder holds: r2-bundleedit; the
    item that takes v7 adds its sha1); the strip kept by its key (three refreshResults: the same svg, no child changed: r2-stripkeep)
    and #sbAv the same across offline, online and three sbAcctRender (r2-sbkeep); a built rider on every ride (r2-builtdrop) and a miss
    on a skin neither rider has (skinwide); overshoes only a Hard or Recovery ride lists (noovershoes); the other side's search from
    Cycling ("flask": "Carry is under Running ›", the button turns to Running and focuses #prowBtn-runcarry: r2-sidedir) and that
    button's contrast, 4.5:1 (r2-swgrey); the covering's names (coverhair); the default rider's summaries on one line at 390 px, the longest
    choices in two lines at most and no summary cut at 320 / 390 px and 100-200% text (sumcut: one line by an ellipsis).
  - Kit: lib/screens.mjs adds settings-running-search-rider (Settings on Running, "rider" typed: the line and its button), so
    contrast, layout and motion see .set-none-sw. 16 rider screens now. It is the first kit screen with a search typed, and layout saw
    the Clear button inside the field's right end (input#setSearch + button#setSearchClear, 44 x 44 px shared): main 8c19078 has the
    same (the field 288 x 44 at 320 px with 46 px right padding for the button at x 260; probe99/fix2/clear.mjs), so it is a
    KNOWN_ON_MAIN entry in layout.test.mjs for that screen, with its why.
  - q97's byte check skips while the handoff folder holds v7: for this item run it with FW_HANDOFF=probe99/v6-2208-copy (the v6 22:08
    files), and q99's cache section holds the same bytes by sha1.
  - Runs (fred99/null.html = mknull of q99-rider ecc7c65, cmp-checked; main 8c19078's page as second argument where it applies; one at a
    time, probe99/fix3/runs.sh, logs in probe99/fix3/runs/): q99 `OK (809 checks)`, 201 s. The old build (40a0bfd, rebuilt with mknull
    in probe99/fix3/old40) under the final q99 `FAIL 1`: the covering's names, the one problem fixed in the app; the other eleven were
    test gaps, and each of their 16 mutants (r2-*, coverhair, sumcut, noovershoes, skinwide) ends FAIL under the final q99
    (probe99/w/mutants.log "round 4"). q97 with FW_HANDOFF=probe99/v6-2208-copy `OK (127 checks)` (its byte check run, not skipped);
    q98 in three Q98_ONLY parts `OK (253)`, `OK (49)`, `OK (21)` (main's check skipped with its note); motion `OK (26 checks)`,
    contrast `OK (58 checks)`, layout 320 and 390 px `OK` on the 16 rider screens; smoke `OK (14 checks)`; npm test 1820 tests, 1773
    pass, 0 fail. Budgets on the rider screens: every rule ok (most FW nodes 234, 0 running, slowest fwMount 27.8 ms at 6x) but
    `FAIL 4`, the frame self-tests "host busy, not judged" (the reference 2.7-3.75 ms a frame against 1.8): the gate, not the item.
- Bundle v7 (the app chat's decisions, followed; the design chat's v7, FW.version '7', built 2026-11-08 09:29 EST, checked on its own
  in probe99/verify-bundle5.json; FROM-APP-CHAT-6.md asks for v8, points 1-3):
  - The app: `node scripts/fw-inline.mjs ~/Dropbox/00_T/handoff` (1bec175, pushed): only the two bundle blocks change; run again it
    changes nothing. The page loads with no console errors in Chromium; WebKit shows only "Not allowed to load local resource" for
    the manifest, fonts and Strava art beside null.html, the same five as main's page (the test folder, not the app). sw.js CACHE and
    APP_BUILD stay v123. q99's BUILDS holds v7 only (sha1 of each handoff file trimmed, as fw-inline inlines it: css 71e5e2c4...,
    js fa84301f..., computed here); v6 went with it, since the strip check holds only v7's gaps. q97 needs no FW_HANDOFF now: its
    byte check runs against the handoff folder (v7) and passes.
  - What v7 changed for the strip (verify-bundle5): the rain jacket outermost, a thermal jersey under the jackets (new order), the
    knee warmers and the headband read, the skullcap off the eyes with glasses none, wool socks drawn over leg wear, shoe covers a
    cuff from y 266 (#1E1E24, an ink outline and a light hem over it), overshoes a cuff from y 256. Every other drawing is unchanged.
  - V6_GAPS and SKIN_GAPS are gone; one list, V7_GAPS (q99.test.mjs), each entry tied to its FROM-APP-CHAT-6 point and as wide as
    measured on v7 (the default rider on all 8 skins and RIDER99, every ride's list, both closets), printed as notes; any other listed
    item that does not show fails, and each entry must be met on a list the strip gets:
    1. leg warmers and tights under overshoes, held whole: tights-heavy 0 px changed on the Hard freezing and Recovery cold full-closet
       lists (with wool socks); any leg wear with overshoes alone 28 px, 0 in its colour.
    2. the shoe covers' own colour, held as their own colour only: 0 device px of #1E1E24 on all 45 judgements (the cuff is covered by
       its ink outline, the hem and the shoe's outline); their pixels changed are still judged and pass, 202 at the least (the cold
       starter list), 324 over tights. OWN.shoes stays #1E1E24, what the item is meant to show.
    3. dark gloves on deep brown skin (#5A3622; once SKIN_GAPS A, now here: one place only): full-finger 'gloves' (#2A2A30) held whole,
       0 px changed (the wet lists); fingerless 'gloves-finger' held as their own colour only, 304 px changed (judged, pass), 8 in
       #2A2A30 (the hot and mild full lists). Narrower than A was, as measured.
  - The v6 gaps v7 fixed, each judged now and printed with its least measurement (FIXED_BY_V7; a test fails if any is never judged),
    on rides or, where no ride reaches it, on direct lists for both riders: shoe covers with leg wear 202 px (45 judgements); overshoes
    with leg wear 608 / 276 own (18); the rain jacket with a windbreaker, a jacket or the vest 4673 / 3979 (17, direct lists too);
    a windbreaker over a thermal jersey 4303 / 3763 (2, direct lists); the thermal and winter jackets over one 4115 / 3606 and
    3939 / 3699 (18 each); wool socks under leg wear with toe covers or bare shoes 262 / 236 (11); knee warmers 450 / 196 (18); the
    skullcap with glasses none 1064 / 371, and 0 px changed over the eyes (x 73.5-126.5, y 97-115; v6's band changed 445 there); the
    headband with the shield 965 / 122 (32); SKIN_GAPS B, leg warmers with shoe covers on tan to deep brown skin, 200 / 104 at the
    least (deep brown, 24 judgements). The jackets' bodies and the rain jacket's sleeves (round 1's c1-nojacket entries, "what the
    point leaves must show") are now judged whole: the check guards more than it did, and c1-nojacket still fails (53 lines).
  - By-design under-layers new with v7, each exactly as wide as stated: wool socks under shoe covers, overshoes or boots (the shin has
    about 18 units between the shorts and the shoe, and a real cover hides the sock; with toe covers or bare shoes they are judged:
    the wet full list, and the direct lists socks-wool and tights-heavy + socks-wool); everything under the rain jacket when it is
    listed (the vest, the windbreaker, the thermal and winter jackets, a thermal jersey: it is outermost, as asked); a thermal jersey
    under a windbreaker or a thermal, winter or rain jacket (with the vest alone it is judged: the cold starter lists). Joined to the
    earlier ones (the light and mid jerseys, bibs, the four base layers, summer socks; arm warmers and sun sleeves under sleeves).
  - The detector's self-test: bib shorts (nothing in every version) with leg warmers is judged as not showing; the leg warmers (in their
    colour) and the toe covers show. v6's negative case (shoe covers under leg warmers) shows on v7.
  - Proof, one at a time on fred99/null.html (mknull of 1bec175), probe99/v7c/runs.sh, logs in probe99/v7c/runs/: q99 (main second)
    `OK: item 99: Your rider, and the rider on the Closet card (904 checks)` (206 s). Each held entry dropped in a scratch copy
    (probe99/v7-holds/, Q99_ONLY=strip) ends FAIL: point 1 `FAIL 18` (tights-heavy 0 px on the Hard freezing and Recovery lists),
    point 2 `FAIL 45` (shoes 202 px, 0 own), point 3 gloves `FAIL 4` (0 px, deep brown, the wet lists), fingerless `FAIL 4` (304 / 8).
    All 72 mutants in q99/mut99.mjs each FAIL (probe99/w/mutants.log "bundle v7, every mutant"; 1899 s), the 10 new ones too:
    v7-woolbare (wool socks dropped with toe covers) `FAIL 9`, v7-woolnone (with bare shoes) `FAIL 31`, v7-vestdry (the vest with no
    rain jacket) `FAIL 45`, v7-heavyvest (a thermal jersey under the vest only) `FAIL 36`, v7-rainunder `FAIL 11`, v7-raindrop
    `FAIL 6`, v7-windheavy `FAIL 2`, v7-skullband (the band over the eyes) `FAIL 2`, v7-legcover (SKIN_GAPS B's width) `FAIL 24`,
    v7-covernone (shoe covers drawn as nothing: point 2 holds only their colour) `FAIL 45`. q97 (main second, Q97_REPO wt-q99, no
    FW_HANDOFF) `OK (127 checks)`, its byte check run; q98 Q98_ONLY parts `OK (253)`, `OK (49)`, `OK (21)` (main's check skipped with
    its note); motion `OK (26 checks)`, budgets `OK (45 checks)` on the 16 rider screens (no host busy line this time: the reference
    1.31 ms; most FW nodes 234, plan-avatar-rider; 0 running; slowest fwMount 24.6 ms at 6x); smoke `OK (14 checks)`; inventory `OK:
    inventory nothing removed (7 checks)`; contrast `OK (58 checks)`; layout 320 and 390 px `OK`; npm test 1820 tests, 1773 pass, 0 fail.
  - Found, not held (no ride with the starter or full closet lists them; a rider's own closet without wool socks would): with no wool
    socks under them, boots over any leg wear change 192 px but only 18 in #3A2F2A (#3A2F2A on #14141A is 38 at most a channel),
    overshoes over heavy tights 344 / 34, and leg warmers or tights above boots on RIDER99 (deep brown) 70 / 26 (probe99/v7c/covers.mjs).
    Point 2's own colour for the covers clears the overshoes; the boots and the leg wear above them on deep brown skin are for the app
    chat to add to the note for v8 if it wants them.
- Review round 3 (6 problems, all real; each reproduced first: q99 as it was, kit2 dca3265's copy in probe99/r3/orig, `OK` on each
  of the round's mutants, logs in probe99/r3/repro/). One app fix, five test gaps; each gap has a q99 check now and a mutant in
  q99/mut99.mjs (r3-*), each ending FAIL under the new q99:
  - A change to a rider already built never reached the other device in any q99 check (only A building from nothing was synced; the
    'strip by sync' and 'norm' checks write the cloud doc directly). The app was right (the round's probe passes on the real page).
    q99 sync now goes on: B opens its sheet and taps two choices (Orange jersey, a head covering); B's whole rider must stand on A, on
    B and in users/u1.settings.rider, with one settingsAt stamp newer than A's, and A's header circle must be FW.riderAvatar of it.
    Then A changes the skin while B, not yet pulled, saves Same recipe: A's rider must stand on both and in the cloud, and B's setting
    too. Mutant r3-riderchange (sfNote never queues a change to a rider already built): `FAIL 2`.
  - The 'later pulls change nothing' check could not see the merge taking the cloud's rider unchecked (syncSetSettings checks it again,
    so the stored copy and the header stayed equal while every pull applied the raw rider). sfDocMerge is now in the hooked copy, and
    q99 norm runs it again on the cloud copy just pulled: any settings it applies must carry this device's checked rider, and 'rider'
    must not be a key to upload. Mutant r3-mergenorm (`cs=syncStrip(c)`, round 1's decision undone): `FAIL 1`.
  - The header's rider was drawn twice on every signed-in load: renderSyncStatus rebuilt .hav when the initial went from '?' (sync
    boot, the user not known yet) to the real one at sign-in. Fixed in the app (8201650): .hav is made only when missing and the
    initial is set through riderAv, which keeps the rider by its key. q99 avatar: a copy that records every drawing put in the header
    circle's .av-r from the app's first line must see one, the one shown, through sign-in, the first pull and later pulls, with "T"
    under it. 1bec175 (check3-tests/base) under it: `FAIL 1` (2 drawn, the first not the one shown); mutant r3-hdrtwice (the old
    line): `FAIL 1`.
  - Nothing checked the rider as painted (pxOf draws on its own canvas; stripOf, avOf and media look at markup, display and rects), so
    a strip clipped to the head, a blank sheet rider and blank avatars passed. q99's paintOf: the spot's svg screenshot at dpr 2,
    set against FW.plain of the same drawing at that size on the colour behind it (the svg's own background first: an avatar's disc
    is a CSS background, which an <img> does not draw), the pixels more than 48 apart, an avatar inside its circle only; the
    screenshot takes 2 CSS px more on each side and the drawing is matched at the best device-pixel offset up to 2 each way (#sbAv
    sits at y .5 and is painted 1 device px lower than its rect: 481 px apart unmatched, 0 matched); at most 0.5% of the pixels apart;
    and up the tree from the svg, no opacity below 1, hidden visibility, clip-path, filter or mask. Judged on every ride and closet
    (28), the Clothing-only results (2), the sheet's rider on opening and after a tap, and both avatars (the header at 390 px, on the
    run, #sbAv on the computer layout). As built: 3 px apart at the most (the sheet's rider, of 86400), 0 on the avatars. Mutants
    r3-stripclip (clip-path inset(0 0 48% 0) on the strip) `FAIL 30`, 11762 px apart on the hot ride; r3-figblank (the sheet's
    rider at opacity 0) `FAIL 2`; r3-avblank (both avatars at opacity 0) `FAIL 3`.
  - The Clothing-only results were never opened. q99 strip now plans Clothing with no gel or drink mix in the library (athlete none),
    so the Crunch falls back to renderClothingOnly (#results data-wear-only '1'): the strip gets exactly outfit()'s list (the rows),
    is FW.riderOutfit of it, 100 x 150 in the card above the list, aria-hidden, no text, still and painted; then the full closet
    (refreshResults' wear-only branch) and the strip wears the new list. Mutant r3-clothonly (riderStrip only in the full plan):
    `FAIL 7`.
  - The sheet's live rider was compared only on a sheet just opened. q99 sheet now checks it after each of the 11 jersey taps with
    the sheet open (the drawing FW.riderOutfit of the rider in that jersey) and as painted after the last; build checks it right after
    the taps that build the rider. Mutant r3-figstale (#rdFig drawn when the sheet opens, not on each tap): `FAIL 3`.
  - Proof, one at a time on fred99/null.html (mknull of 8201650), probe99/r3/runs.sh, logs in probe99/r3/runs/: q99 (main second)
    `OK: item 99: Your rider, and the rider on the Closet card (950 checks)` (252 s); V7_GAPS and the v6 gaps v7 fixed print as before.
    All 80 mutants in q99/mut99.mjs each FAIL (probe99/w/mutants.log "review round 3, every mutant"; 2984 s), the 8 new ones as above.
    q97 (main second, Q97_REPO wt-q99, no FW_HANDOFF) `OK (127 checks)`; q98 in its Q98_ONLY parts `OK (253)`, `OK (49)`, `OK (21)`
    (main's check skipped with its note); motion `OK (26 checks)`; budgets `OK (45 checks)` on the 16 rider screens (host reference
    1.32 ms, no host busy line; most FW nodes 234, plan-avatar-rider; 0 running; slowest fwMount 24.6 ms at 6x); smoke `OK (14
    checks)`; inventory `OK (7 checks)`; contrast `OK (58 checks)`; layout 320 and 390 px `OK` (LAYOUT_ONLY=rider); npm test 1820
    tests, 1773 pass, 0 fail, 47 todo.
- Review round 4 (11 problems, all real; each reproduced first: q99 as it was, kit2 0e59701's copy in probe99/r4/orig, ends `OK` on each
  of the round's nine test-gap mutants (probe99/mut-c4-*, logs in probe99/r4/repro/), and the old build (8201650, probe99/r4/old) fails
  the three look checks below). Three app fixes, eight test gaps; each has a q99 check now and a mutant in q99/mut99.mjs (r4-*), each
  ending FAIL under the new q99:
  - The live rider scrolled away with the groups (#rdFig the scroller's first child, not sticky), so a tap in Gear or Kit showed no change
    on screen. Fixed in the app: .rd-fig is sticky under the sheet's title bar (top: --set-top-h, which setTopFit sets from the bar's
    height on every resize of it), the sheet's own background behind it, above the groups (z-index 1, under the bar's 2), as the first
    thing in the sheet; still (no size change as it sticks); 80 x 120 below 700 px of height (a short screen keeps room for the choices).
    The sheet takes scroll-padding-top of the bar plus the rider (198 px; 138 short) while the rider sheet is shown, so a control the
    keyboard focuses or a tap scrolls to is never under it. My decisions: sticky on the computer layout too (no side column: one rule for
    every width), no hairline under it (item 76: nothing new in the sheet but the rider). q99 figView (sheet at 390 px, fit at 320 px with
    200% text and on the computer layout): every group open, each field's buttons brought into view the page's way, a real tap on a choice
    not pressed; the rider must be wholly in view (under the bar, above the sheet's bottom and the phone's tab bar), redrawn in the choice,
    the button not under it; then Tab and Shift+Tab through the sheet never leave focus under it (1 px for whole-pixel scrolls). As built:
    100% on all 13 fields at each size, 31 stops each way. Old build: the three figView checks FAIL. Mutants r4-figscroll (sticky off)
    `FAIL 3`, r4-focushide (no scroll-padding: Shift+Tab lands under the rider) `FAIL 2`.
  - With Covered the colour field also colours the beard and mustache (the bundle's riderBase draws them in r.hair). The app now names it:
    the label (rdL-hair, so the group's name follows) reads "Covering colour" with face none, "Covering and beard colour" / "Covering and
    mustache colour" with one; the Look summary "gold head covering and beard" (the face no longer a separate "· beard" there). My decision
    over the other way (a facial-hair colour of its own): riderNorm keeps only the bundle's fields, so that would be a v8 ask, and naming
    it is enough. q99 sheet (with none, mustache and beard) and rider.test.mjs; mutants r4-coverbeard `FAIL 2`, r4-coversum `FAIL 4`.
  - The Gear summary read "Coral helmet · pair · green lens" (and so did the fold button's spoken name). Now "glasses" for the pair
    ('shield' stays "shield", none "no glasses"). q99 sheet (RIDER99's summary and the fold button's name) and rider.test.mjs; mutant
    r4-pair `FAIL 2`.
  - The strip was judged in two jerseys only. q99 strip now judges every jersey colour (FW.RIDER_OPTIONS.kit, 11) for both riders on every
    ride's lists and on the direct lists. Two misses, both on a Black jersey (#1E1E24), as the check found:
    - the winter jacket (#1E2A4A, at most 12 a channel from the jersey [wrong: blue is 38 apart; review round 7]) over a Black jersey with sleeves Same as jersey: 240 px changed, 0
      in its colour (only its seams read; the freezing and Hard freezing full lists, the default rider; the check saw it on all 8 skins).
      With RIDER99's white sleeves it shows (2189 / 1954) [review round 7: RIDER99's Berry fade and dots make it show, never the sleeves];
    - the thermal jersey in Black with arm warmers and the vest: 0 px changed (its sleeves the arm warmers' black, its body under the
      vest; the cold, freezing, Hard freezing and Recovery cold starter lists, both riders).
    Neither is in FROM-APP-CHAT-6. The app chat has not decided them, so q99 holds both in V7_GAPS as a proposed point 4 (each as wide as
    measured: the jacket's own colour only, its pixels changed judged, with kit Black and sleeve ''; the thermal jersey whole with kit
    Black, arm warmers and the vest), printed as "proposed point 4 (not in FROM-APP-CHAT-6: the app chat to decide)". For the app chat:
    add to the v8 note (the winter jacket on a Black jersey wants its own colour or a lighter edge), and decide the thermal jersey (a v8
    ask, a cuff on its sleeves, or a by-design rule: a thermal jersey whose sleeves are the arm warmers' colour). The app does not work
    around the art. Mutants r4-kitnavy (the outer layers gone on a Navy jersey) `FAIL 30`, r4-winterwide (the jacket gone on a Black
    jersey with sleeves of their own) `FAIL 2`, r4-heavywide (the thermal jersey gone on a Navy jersey) `FAIL 8`.
  - riderNorm's tampered values were all values no field offers. q99 norm adds BAD_X: every field but lens (a real choice, kept) set to a
    value another field offers (skin '#F26B5B', hairStyle 'none', hair '#F28C28', face 'shield', helmet '#F28C28', glasses 'covered', frame
    '#E06AAE', kit '#3048B4', kit2 '#E06AAE', sleeve '#D94F92', pattern 'beard', shorts '#F26B5B'; the test checks that premise), on load,
    on restore and from the cloud; the sheet shows one choice pressed per field, its name and the default's summaries. rider.test.mjs's
    BAD gains those values (each skipped for the field that offers it). The app was right. Mutants r4-normcolour and r4-normunion `FAIL 5`
    each; the old rider.test.mjs passes on normcolour (10 of 10), the new one fails it (probe99/r4/npm*).
  - The AI-prompt check searched ids and hex values only. q99 private now gives the page a rider of unusual names (Pink jersey, splatter,
    royal blue shorts, mustache, orange lens ...) and asks every prompt kind with it and with settings.rider taken out: the same text,
    and none of the three summaries, their parts or the chosen names (case aside) unless the prompt without the rider has them too. And
    in the source (comments left out): outside rider* / rd* functions only RIDER_USERS (vN's load line, setSheetOpen, renderProfileRows,
    renderWear, restoreAll, sfDocMerge, syncSetSettings, syncRender, renderSyncStatus, sbAcctRender) read settings.rider or call into the
    rider's code. Mutant r4-ainames `FAIL 2`.
  - paintOf ran only on the 390 px path. Now also the strip on the computer layout (1440 x 900, dpr 2), the sheet's rider on the computer
    layout and at 320 / 390 px with 100-200% text, and the strip at each of those. Mutant r4-dkblank (both blank under html.dk) `FAIL 2`.
  - A rider arriving by sync with the sheet open: q99 strip opens the sheet first; after the pull every field's pressed choice and name,
    the summaries and the live rider (drawn and painted) are the new rider's, and the row names its jersey. Mutant r4-syncsheet `FAIL 2`.
  - The pressed mark's contrast: q99 sheet measures the pressed swatch's outer ring (its widest shadow, 1.5 px or more past the others)
    3:1 on the panel, the pressed word's fill 3:1 against an unpressed one (or the panel) and its words 4.5:1 on it. As built 19.44:1
    each. Mutant r4-ringfaint `FAIL 1`.
  - The names after a change: each label is now compared with the bundle's name of the pressed value for RIDER99 (sheet), after the taps
    (build), on load and restore of tampered riders (norm) and on restore (backup). Mutant r4-namestale `FAIL 8`.
  - The sheet's live rider kept by its key: marked and watched, the sheet closed and reopened, the pressed choice tapped and riderApply
    run: the same svg, nothing changed. Mutant r4-figkeep `FAIL 1`.
  - Three older mutants moved onto the new summary code (their strings changed with it, their intent kept): hairsum, r2-gearnone,
    r2-facenone.
  - Proof, one at a time on fred99/null.html (mknull of 0951826, cmp-checked), probe99/r4/runs.sh, logs in probe99/r4/runs/: q99 (main
    second) `OK: item 99: Your rider, and the rider on the Closet card (2454 checks)` (300 s; 950 before, most of the new ones the jersey
    colours); V7_GAPS prints points 1-3 as before and the proposed point 4's two entries; the v6 gaps v7 fixed print as judged and
    passing (the winter jacket's least now 240 / 0 on a Black jersey, under point 4's hold). The old build (8201650) under it `FAIL 9`
    (the summaries and labels, and figView at 390 px, 320 px at 200% text and the computer layout). All 96 mutants in q99/mut99.mjs each
    FAIL (probe99/w/mutants.log "review round 4, every mutant", 4351 s), the 16 new ones as above. q97 (main second, Q97_REPO wt-q99, no
    FW_HANDOFF) `OK (127 checks)`; q98 in its Q98_ONLY parts `OK (253)`, `OK (49)`, `OK (21)` (main's check skipped with its note);
    motion `OK (26 checks)`; budgets `OK (45 checks)` on the 16 rider screens (host reference 1.33 ms, no host busy line; most FW nodes
    234, plan-avatar-rider; 0 running; slowest fwMount 24.4 ms at 6x); smoke `OK (14 checks)`; inventory `OK (7 checks)`; contrast `OK
    (58 checks)`; layout 320 and 390 px `OK` (LAYOUT_ONLY=rider); npm test 1822 tests, 1775 pass, 0 fail, 47 todo (rider.test.mjs 12).
- Review round 5 (10 problems, all real; each reproduced first: q99 as it was, kit2 6a3ecc6's copy in probe99/r5/orig, ends `OK` on each of
  the round's five test-gap mutants (probe99/mut-c5-*: painttol, sockbare and csstext 2256-2273 checks, dbgnames 7, shortfig 93; logs in
  probe99/r5/repro/); the acceptance check's probes (copied to probe99/r5/pdata-old and plook-old) on the old build (0951826): p1 proto
  `FAIL 4`, p3 null restore `FAIL 2`, p4 cloud null `FAIL 1`, the shaved taps change nothing on the rider, 844 x 390 leaves 52 px under it).
  Four app fixes, six test gaps; each has a q99 check now and a mutant in q99/mut99.mjs (r5-*), each ending FAIL under the new q99:
  - Shaved: the bundle draws shaved hair as nothing under the helmet, so the six colours changed nothing on the rider while the label and the
    Look summary named a hair colour. Fixed in the app (822b25c): with Shaved and no face the colour field hides (as lens and frame with no
    glasses; the stored colour is kept, riderNorm unchanged), the summary says "shaved head"; with a beard or mustache the field is "Beard
    colour" / "Mustache colour" (rdL-hair, so the group's name follows) and the summary "shaved head · grey beard". q99 sheet checks that and,
    in general, that a field is shown exactly when its choices draw different riders (RIDER99; Shaved with no face and with a beard; Covered;
    the shield; no glasses): only hair under Shaved with no face and lens and frame with no glasses hide, every other field's choices draw 3
    riders or more. rider.test.mjs too. Mutants r5-shavedhide `FAIL 2`, r5-shavedlabel `FAIL 1`, r5-shavedsum `FAIL 1`.
  - A phone held sideways (844 x 390: 82 px under the stuck rider at 100% text, 69 at 200%, against a field's 71-90). Fixed in the app: under
    500 px of height (and 480 px wide or more, the phone layout) the sheet's part is a grid, the rider (80 x 120, still sticky under the title)
    in a column of its own beside the groups, so the sheet's whole height is the choices' (220 px at 100%, 206 at 200%), and scroll-padding-top
    is the bar plus 8 px. My decision over a smaller rider (48 x 72): the rider keeps the size round 4 decided for short screens, and nothing
    covers the groups. The computer layout keeps the band (html.dk is not touched). Found by the new check and fixed with it: at 844 x 390 and
    200% text a tap that rewraps the Look summary above (two lines to one) slid the button tapped 38 px under the title bar. Chromium's scroll
    anchoring hides it only when layout is read before the change; WebKit has no scroll anchoring (probe99/r5/p/shift-wk.mjs: the old click
    line 99 -> 62 under a bar ending at 91, the new one 99 -> 99). The click handler now keeps the tapped button where it was (scrollTop by
    the difference). Mutants r5-landside `FAIL 2`, r5-tapjump (the old click line) `FAIL 1`.
  - figView (review round 5) also measures the rider's size against the decision (o.size: 120 x 180; 80 x 120 below 700 px of height) and
    room for the choices: the view beside the stuck rider (sideways) or under it must hold every field's label and first row. "Under the
    rider" is now the button's or focus's rect over the rider's band (above the groups, or beside them), and a tap allows 1 px at the view's
    edges as the keyboard check already did (the scroll lands on whole pixels: at 375 x 667 the row ends 0.55 px past the tab bar's top, which
    sits 0.19 px over the sheet). It runs at 390 x 844, 320 px with 200% text, 1280 x 800, and now 375 x 667, 667 x 375 and 844 x 390 at 100%
    and 200% text (with the sheet's fit and its painted rider). Mutant r5-shortfig (the 80 x 120 rule gone) `FAIL 4`.
  - A file with "__proto__": {"rider": ...} in its settings: restoreAll's Object.assign made it the settings' prototype, a ghost rider shown
    and never stored. Fixed in the app: restoreAll copies the file's own keys but "__proto__"; riderBuilt and riderNow read the rider as an own
    key only (riderOwn, as riderSetNorm already checked it). q99 backup (a rider and a tampered one, signed in, no rider here): the row "Not
    set", the header's initial, nothing stored or in the cloud, the prototype Object's, after the next settings write and a reload too. q99
    norm: a stored copy with "__proto__" builds no rider on load (the load's own Object.assign still lends the prototype there: the device's
    own storage, left as it was; riderOwn keeps the rider out). Mutants r5-protoassign `FAIL 2`, r5-protoread `FAIL 1`.
  - A null rider: in a backup it erased this device's rider and the erasure synced to every device; in the cloud (null, or the field deleted,
    under a newer stamp) it erased it on pull. Fixed in the app: restoreAll keeps this device's rider when the file's own rider is missing or
    null (riderOwn(d.settings)==null); sfDocMerge gives a cloud copy with no rider this device's built one (the app never removes a rider, so
    none under a newer stamp is a foreign value: no change, the cloud keeps its value until this device changes the rider, as round 1 decided
    for a tampered one; 42 still draws the default). q99 backup (two devices: after both sync the rider stands on A, on B and in the cloud, its
    stamp unchanged) and norm (null and deleted: the rider stands on A and B, stored, the row, the header; later pulls draw nothing again).
    Mutants r5-nullrestore `FAIL 1`, r5-nullcloud `FAIL 2`.
  - The two Black-jersey cases (round 4's "proposed point 4") are out of V7_GAPS, which now holds FROM-APP-CHAT-6 points 1-3 only. My decision
    (the check offered failing or a skip line): AWAIT, a list of its own, each entry as wide as measured on v7; what it holds is neither judged
    nor passed: a "skip: awaiting the app chat (not in FROM-APP-CHAT-6) ..." line each, and the run's last line reads "...; 2 cases awaiting
    the app chat, not judged (the skip lines) (N checks)", never a plain OK. From FW.version 8 nothing in AWAIT holds, so the item that takes v8
    must bring the app chat's decision (a FROM-APP-CHAT point, or a by-design rule). Failing them outright would leave q99 red until the app
    chat answers. For the app chat (still open): the winter jacket on a Black jersey with sleeves Same as jersey (240 px, 0 in #1E2A4A), and
    the thermal jersey in Black with arm warmers and the vest (0 px). Proof: q99 with AWAIT off (probe99/r5/await, Q99_ONLY=strip) `FAIL 11`
    (the check's 10 and the freezing no-leg-wear list's winter jacket).
  - The strip's painted check allowed 0.5% (300 device px), more than some listed items change. Now at most 24 device px for the strip (a
    fifth of SHOW.d48; as built 0-2 of 60000); the sheet and avatars keep 0.5%. Mutant r5-painttol (the wool socks hidden by CSS) `FAIL 9`.
  - The troubleshooting copy by name: with the rider set to RA through the app (riderApply: the row reads "Pink jersey") and taken out the
    same way, the two dbgDump copies must be the same but for when they were made (the "when" field and the first line's time), and the one
    with the rider holds none of its summaries, their parts or its chosen names (case aside) unless the other has them. Mutant r5-dbgnames
    `FAIL 1`.
  - Wool socks under a cover, narrowed to what v7 draws (probe99/r5/p/socks.mjs, the least over both riders and 8 skins): by design under
    overshoes always (0 px, bare shins too), under shoe covers or boots only with leg wear or knee warmers (0-96 px); over bare shins with shoe
    covers (300 / 268) or boots (156 / 136) they are judged. The cold and freezing rides add a closet with every catalog item but leg wear and
    knee warmers (the check's 40-44 F and 24-29 F lists), and the direct lists socks-wool + shoes and + boots; EDGES prints that edge (judged
    102 times, the least 156 / 136, the freezing list with boots) and requires it on a ride. Found, not held: knee warmers with wool socks and
    toe covers or bare shoes leave the socks 92-114 px; no list the strip gets has them. Mutant r5-sockbare `FAIL 8`.
  - Words painted by CSS: stripOf reads every pseudo-element's content in #rRider (none allowed) and its box (the drawing and its padding
    only); the row check adds every ::before / ::after with letters or digits in #prowB-rider. Mutant r5-csstext `FAIL 35`.
  - Moved onto the new code with the same intent: restore-drop, hairsum, r4-coverbeard (each FAIL).
  - Moved onto the new click handler: c1-noaffirm (FAIL 1).
  - Proof, one at a time on fred99/null.html (mknull of 822b25c), probe99/r5/runs.sh, logs in probe99/r5/runs/: q99 (main second) `OK: item
    99: Your rider, and the rider on the Closet card; 2 cases awaiting the app chat, not judged (the skip lines) (2945 checks)` (396 s);
    V7_GAPS prints points 1-3 as before, AWAIT its two skip lines, the v6 gaps v7 fixed as judged and passing, the socks' edge 156 / 136; the
    painted strip 0-2 device px apart. The old build (0951826, probe99/r5/old) under it `FAIL 10`: the shaved field and the general rule, the
    "__proto__" rider on load and on restore (two), the null rider in a backup and in the cloud (null, deleted), and 844 x 390 at 200% text
    (room 69 px for 90, a Tab stop under the rider). The check's probes on the new page (probe99/r5/pdata-new): p1 proto `OK (9)`, p3 null
    restore `OK (5)`, p4 cloud null `OK (2)`. All 110 mutants in q99/mut99.mjs each FAIL (probe99/w/mutants.log "review round 5, every
    mutant", 6644 s; c1-noaffirm, which no longer built there, moved and run after it: FAIL 1). q97 (main second, Q97_REPO wt-q99, no
    FW_HANDOFF) `OK (127 checks)`; q98 in its Q98_ONLY parts `OK (253)`, `OK (49)`, `OK (21)`; motion `OK (26 checks)`; budgets `OK (55
    checks)` on the 16 rider screens (host reference 1.76 ms; two earlier runs ended `FAIL 2` and `FAIL 4`, every one the self-tests' "host
    busy, not judged" at load average 4-7, the item's rules ok each time; most FW nodes 234, plan-avatar-rider; 0 running; slowest fwMount
    26.1 ms at 6x); smoke `OK (14 checks)`; inventory `OK (7 checks)`; contrast `OK (58 checks)`; layout 320 and 390 px `OK`
    (LAYOUT_ONLY=rider); npm test 1824 tests, 1777 pass, 0 fail (rider.test.mjs 14).
- Review round 6 (8 problems, all real; each reproduced first: q99 as it was, kit2 a2e9f72's copy in probe99/r6/orig, ends `OK` on each of the
  round's five test-gap mutants (probe99/mut-c6-*: groups and labels 74 checks, signout 22, kw 18, centre 45; logs in probe99/r6/repro/); the
  acceptance check's probes on the old build (822b25c, probe99/r6/old): reflow at 320 x 256, 427 x 267 and 320 x 200 room -16, -5, -72 px
  and 14 of 14 Shift+Tab stops under the band; patterns 12 of 330 jersey x fade judgements under 24 px (probe99/r6/repro/pairs-old.log); p7
  diverge `FAIL 2`). Two app fixes, one design-chat ask held in q99, five test gaps; each has a q99 check now and a mutant (r6-*) ending FAIL:
  - Short, narrow windows (a computer browser zoomed in: 1280 x 1024 at 400% is 320 x 256, 1280 x 800 at 300% is 427 x 267): round 5's side
    column needs 480 px of width, so the stuck rider band (bar to 216 px) left no room at all and no choice could be seen, tapped or focused.
    Measured (probe99/r6/plook/room.mjs): a stuck band leaves a whole field from 360 px of height at 100% text and 380 at 200% (the field
    71 / 90 px), on the computer layout from 420 (440 with margin). Fixed in the app (e778443): under 400 px of height and narrower than
    480, and on the computer layout under 440, .rd-fig is position:static (it scrolls with the choices) and scroll-padding-top is the bar plus
    8 px; the 80 x 120 size stays. My decision over a smaller rider in a side column: at 320 x 256 the view is 122 px, so even a 120 px rider
    beside the groups would not show whole, and nothing is ever under a rider that scrolls away. 320 x 200 (400% of 1280 x 800) cannot hold a
    field at all: its bars leave 66 px of view for a 71 px field with nothing stuck (left out of figView, noted). q99 figView gains o.stuck
    (false: not sticky, the whole view holds a field, a tap lands with the button in view and clear of the title bar, the rider need not be in
    view, the keyboard as before) and runs at 320 x 256 (100% and 200% text), 427 x 267, 1280 x 400 (not stuck) and just past each edge,
    390 x 400 at 200% and 1280 x 440 (stuck). Found by it and decided: at 200% text a fold header with its summary is 130-167 px, taller than
    the free view on those windows (122-125 px), so it can never be wholly clear; the keyboard check now asks a control taller than the free
    view to fill it (as much of it shows as the view holds; every other control still wholly clear). Mutants r6-shortnarrow (both rules gone)
    `FAIL 1` (the folds cannot be clicked at 320 x 256), r6-shortdk (the computer layout's rule alone) `FAIL 1` (1280 x 400: 56 px for a 71 px field).
  - A cloud copy with no rider (deleted or null under a newer stamp; the live build makes it: main's restoreAll replaces settings wholesale and
    item 96 writes deleteField() for 'rider'): round 5's sfDocMerge put this device's rider into the cloud copy before merging, so the merge
    saw no change, nothing went up, the device took the deletion's stamp, and A, B and a new device kept different riders for good (p7). Fixed
    in the app (e778443): the merge runs on the cloud copy as it is; when its none wins the stamps and this device has a rider built, the
    rider goes back up (r.up), stamped 1 ms past the deletion. My decision over the suggested "keep this device's own stamp": main's devices
    (v122, the only builds that delete a rider) send the deletion again on every pull against an older stamp; the checker's p7 with that
    variant (probe99/r6/pown) ends `FAIL 2` (the cloud null again, its stamp newer than the first deletion, C with no rider), and with the fix
    `OK (6 ok)`. The cost: the deletion erased which edit was newer, so the first device to pull after it puts its rider back and every other
    takes it (in p7 that is B, back online first: all end on B's Coral). q99 sync: A holds an edit B missed, the cloud's rider deleted or null
    under a newer stamp, a new device C signs in; A pulling first (deleted, null): A's Orange on A, B, C and in the cloud, stamped past the
    deletion, each row and header circle; B pulling first: B's rider everywhere. The old build `FAIL 3` there. Mutants r6-refill (round 5's
    merge) `FAIL 3`, r6-ownstamp (this device's own stamp) `FAIL 3`; r5-nullcloud moved onto the new merge (same intent) `FAIL 2`.
  - Patterns that draw nothing on some jerseys: the bundle draws the chest band in #F26B5B (the Coral jersey's own colour), the side stripe
    in #F0708A and splatter in #2F5FB5, none outlined. Measured on v7 at the sheet's size, the same for the default rider and RIDER99
    (probe99/r6/plook/patr.mjs): 12 of the 330 pattern x jersey x fade judgements change under 24 device px by more than 48 (the band on Coral
    with fade Same as jersey or Berry and on Lime or Orange with a Berry fade, 0; the side stripe on Coral or Pink with Same or Berry and on
    Lime, Pale yellow or Orange with Berry, 0-12; splatter on Bluebird blue with a Navy fade, 0); every other one 39 or more (side), 90 or
    more (splatter), 107 (dots), 502 (chevron), 1142 (band). Not in FROM-APP-CHAT-6, so for the app chat's next note (a band and stripe that
    differ from the jersey and its fade by more than 48 in a channel on every jersey and fade; splatter on the blues). No work-around in the
    app. q99 sheet judges every pattern against Plain on every jersey and fade for both riders (PAT_SHOW 24 device px more than 48 apart, the
    v8 ask's measure) and holds the misses in PAT_AWAIT, as AWAIT does (skip lines, counted on the last line, nothing held from v8 on), each
    exactly as measured (a held one that reads fails). The run's last line now counts 5 cases awaiting the app chat (round 5's two and these
    three). And choice by choice: in each field shown, every two choices draw different riders as painted (PAIR: 120 device px more than 8
    apart, an item's area, or 24 more than 48, a thin part; the nearest skins, 13-19 a channel apart, change 1949 or more; the pairs that draw
    nothing apart 88 at most), for the six riders round 5's field check uses; allowed by name: "Same as jersey" against the jersey's own colour
    (the fade or sleeves of a Navy, Black or White jersey); a pattern PAT_AWAIT holds is skipped there. As built the closest judged pair is
    Plain and Dots under Covered (255 / 197). With PAT_AWAIT off (probe99/r6/await, Q99_ONLY=sheet) `FAIL 2` (the 24 misses, and Plain and
    the side stripe on RIDER99's Coral jersey with a Berry fade).
  - The folds' fields were never read: q99 sheet checks each fold holds its decided fields in order (Look skin, hair style, hair colour, face;
    Gear helmet, glasses, lens, frame; Kit jersey, pattern, shorts, then the fade and sleeves under More colours); the summaries are checked
    against sumsOf, which builds each from its own group's fields. Mutant r6-groups `FAIL 1`.
  - The labels were never compared with their field: each field's label must be its decided one (LABELS: Skin, Hair, Hair colour, Face,
    Helmet, Glasses, Lens, Frame, Jersey, Pattern, Shorts, Jersey fade, Sleeves; the Covered and Shaved forms as before), and the
    accessibility tree is now looked up by those names. Mutant r6-labels `FAIL 3`.
  - Signing out was never done in a session: q99 avatar, at 390 px and on the computer layout, built and not: Settings › Account › Sign out
    leaves the header's outline and #sbAv the empty circle (no av-on, no drawing, no initial; read at 390 px too, where #sbAv is hidden), and
    the account card's Sign in brings back the rider (#sbAv drawn once; the header's circle, hidden while signed out, keeps its drawing by its
    key: 0 redraws) or the initial "T". Mutant r6-signout `FAIL 5`.
  - The row's search words: q99 row searches each decided word (avatar, look, skin, hair, helmet, glasses, jersey, kit, shorts) on a page with
    no rider built. Mutant r6-kw `FAIL 1`.
  - The strip centred: stripOf measures the drawing's middle against its box's; within 1 px on every ride, the Clothing-only results, the
    computer layout and fit's 320 / 390 px (as built 0). Mutant r6-centre `FAIL 4`.
  - Proof, one at a time on fred99/null.html (mknull of e778443), probe99/r6/runs.sh, logs in probe99/r6/runs/: q99 (main second) `OK: item
    99: Your rider, and the rider on the Closet card; 5 cases awaiting the app chat, not judged (the skip lines) (2989 checks)` (523 s); V7_GAPS
    prints points 1-3 as before, AWAIT and PAT_AWAIT their five skip lines. The old build (822b25c) under it `FAIL 4`: the three cloud cases
    and the fit section at 320 x 256 (the folds cannot be clicked). The ten new mutants and the moved one each FAIL (probe99/w/mutants.log "review
    round 6"). q97 (main second, Q97_REPO wt-q99, no FW_HANDOFF) `OK (127 checks)`;
    q98 in its Q98_ONLY parts `OK (253)`, `OK (49)`, `OK (21)`; motion `OK (26 checks)`; budgets `OK (55 checks)` on the 16 rider screens (host
    reference 1.42 ms, no host busy line); smoke `OK (14 checks)`; inventory `OK (7 checks)`; contrast `OK (58 checks)`; layout 320 and 390
    px `OK` (LAYOUT_ONLY=rider); npm test 1824 tests, 1777 pass, 0 fail. The figView mutants run again under the final q99 (the tall-control
    rule): r4-figscroll `FAIL 19`, r4-focushide `FAIL 1` (as in round 5), r5-landside `FAIL 1`, r5-tapjump `FAIL 4`, r5-shortfig `FAIL 14`. The
    whole mutant set (120 in q99/mut99.mjs) was not run again this round; every check this round adds is new, and the one rule eased (a
    control taller than the free view fills it) is covered by the figView mutants above.
- Review round 7 (5 problems, all real; each reproduced first: q99 as it was, kit2 1904afa's copy in probe99/r7/orig, ends `OK` on each of the
  acceptance check's mutants in the sections that guard them (probe99/r7/repro.sh, logs in probe99/r7/repro/): mut-c7-othcount (row) `OK (18
  checks)`, mut-c7-wordkeys (sheet) `OK (77 checks)`, mut-c7-avmove (avatar, sync, still, backup, sheet) `OK (131 checks)`, mut-c7-darkkit2
  (strip) `OK (2713 checks)`). No app change: the app was right in each; the gaps were q99's, and v7's dark jackets are the design chat's.
  - The dark jackets (problems 1 and 2, one cause). q99's strip judged each list for two riders in every jersey and every skin, but never
    varied the fade, the sleeves, the shorts or the pattern, and the two riders' fades (Deep blue, Berry) and patterns (plain, dots) hid the
    misses. Measured on v7 over the full product jersey x fade x sleeves x shorts x pattern, both riders, every list with an outer layer
    (probe99/r7/p/outer.mjs, outer2.mjs, fields.mjs; outer2.json, analyze2.log: 55,440 judgements, every other field aside):
    - the winter jacket (#1E2A4A): 240-276 device px changed, 0-36 in its own colour (only its seams read), on a Black jersey with a fade Same
      as jersey, Deep blue, Navy or Black, and on a Navy one with a fade Same as jersey, Navy, Olive or Black, each with Black or Navy shorts
      and no pattern or the side stripe, any sleeves (the freezing and Hard freezing full lists); 32 cases x 6 sleeves, both riders;
    - the thermal jacket (#2F3B6E): 240-290 / 0-29 on a Navy jersey with Navy shorts, a fade Same as jersey, Deep blue, Navy or Black, no
      pattern or the side stripe, any sleeves (the cold, Recovery cold and Hard freezing full lists); 8 cases x 6 sleeves;
    - the thermal jersey in Black with arm warmers and the vest: 0 px with every fade, sleeves, shorts and pattern (AWAIT's entry, exact).
    A pattern (dots, chevron, splatter, the band), Royal blue or Pink shorts, or the other fades show the jackets in their own colour (616 /
    389 and more); the windbreaker, the vest and the rain jacket show on every rider. So the cause is the jersey with its fade, the shorts
    and the pattern, never the sleeves: round 4's "with RIDER99's white sleeves it shows (2189 / 1954)" was RIDER99's Berry fade and dots,
    and its "#1E2A4A at most 12 a channel from #1E1E24" is wrong (blue is 38 apart; from Navy at most 31). Corrected there (marked).
    The acceptance check's figures agree (Navy 240 / 0 with fades Same, Navy, Olive, Black; Black with Same, Deep blue, Navy, Black; its
    sweep held the shorts and pattern at the default rider's, Black and plain).
    Not in FROM-APP-CHAT-6, so for the app chat's next note (v8: the winter and thermal jackets want a colour of their own or a lighter edge
    that reads over Black and Navy jerseys, their fades and dark shorts); no work-around in the app. q99:
    - AWAIT's winter-jacket entry (held by sleeves Same as jersey) is replaced by the two measured entries (DARK_WINTER, the thermal jacket);
      each holds only the own colour, the pixels changed still judged. AWAIT now has 3 entries; with PAT_AWAIT's 3 the last line counts 6.
    - judge: what an entry holds that shows (the whole item for hold 'all', its own colour for 'own') fails, the entry being wider than v7,
      for V7_GAPS and AWAIT alike (before, a held case that showed passed unseen: the old entry held RIDER99's Black jersey, which shows).
    - The wide sweep: each list a ride gives that carries an outer layer (vest, windbreaker, thermal / winter / rain jacket, thermal jersey;
      9 lists) and each direct list that does (5), both riders, in each of the 11 jerseys with each other value of the fade, the sleeves, the
      shorts and the pattern (198 riders a list and rider): every item judged as on the rides, one check per list and rider. pxMany draws many
      riders per call (pxOf is pxMany of one); the images go through blob URLs revoked once drawn and each list gets a page of its own (the
      first try, with data: URLs on one page, closed the page after 17 lists).
    - The strip as the app draws it for three dark riders (a Navy jersey with a Navy fade and a Black one with a Black fade and white sleeves,
      freezing full; a Navy jersey with Navy shorts, cold full): exactly the list's items, the jackets too, as painted.
    Mutants: r7-darkkit2 (the checker's: the app wraps FW.riderOutfit and drops the jackets for those riders, the bundle blocks byte for
    byte) `FAIL 12` (the sweep's checks on the jackets' lists); r7-stripdark (riderStrip leaves the winter jacket off a Navy jersey with a Navy
    fade) `FAIL 1`. And q99 with round 6's AWAIT entry put back (probe99/r7/oldawait, Q99_ONLY=strip) `FAIL 9`: the Navy riders not held, and
    RIDER99's Black jersey with sleeves Same as jersey held although it shows (too narrow and too wide at once).
  - The arrow keys (problem 3): only the jersey's were pressed. q99 sheet now presses, in every other field shown (all 12 with RIDER99 and a
    pair of glasses, More colours open: the word groups hair style, face, glasses and pattern, and every colour field), from its first
    choice ArrowLeft (wraps to the last), ArrowRight (back to the first), ArrowDown, ArrowUp, ArrowRight, each focused, pressed, stored and named (the label's name as the
    bundle's for the rider stored), then the rider's own choice again. Mutant r7-wordkeys (the keydown handler finds '.rd-c' only) `FAIL 1`.
  - Stillness after a change (problem 4): the avatars' stillness was read on first drawings only. New watchStill / stillRead: an in-page
    watch every 100 ms from before the change (its first tick at once: a tap redraws within 100 ms) until 4 s after, each spot drawn anew (a
    new svg) with no .fwm-go, nothing running, its fwMount record still, and html.fw-anim on every tick (motion on: Reduce Motion off, the
    switch on). q99 avatar: on the computer layout a tap in the sheet (Orange jersey: #rdFig and #sbAv beside it) and a restore bringing
    another rider (#sbAv); at 390 px a restore (the header circle). q99 sync: A's header circle while B's rider reaches it. Mutant r7-avmove
    (the checker's avmove: a new look mounted without o.still) `FAIL 4` (all four).
  - The other side's count (problem 5): q99 row, at 390 px and on the computer layout, on Running searches "closet" (Your rider and Closet
    under Cycling): the line reads "No Running settings match “closet”. 2 under Cycling ›" with a 44 px button "2 under Cycling ›", which
    turns Settings to Cycling with both rows found (rider, closet) and the first focused. Mutant r7-othcount `FAIL 2`.
  - Proof, one at a time on fred99/null.html (mknull of e778443, the same page as the checker's), probe99/r7/runs.sh, logs in probe99/r7/runs/:
    q99 (main second) `OK: item 99: Your rider, and the rider on the Closet card; 6 cases awaiting the app chat, not judged (the skip lines)
    (3032 checks)` (683 s; the strip section alone 223 s); V7_GAPS prints points 1-3 as before (tights-heavy under overshoes 0 px; the shoe
    covers 202 / 0 at the least; full-finger gloves on deep brown 0; fingerless 304 / 8), AWAIT and PAT_AWAIT their six skip lines. The five
    r7-* mutants each FAIL (probe99/w/mutants.log "review round 7"). q97 (main second, Q97_REPO wt-q99, no FW_HANDOFF) `OK (127 checks)`; q98
    in its Q98_ONLY parts `OK (253)`, `OK (49)`, `OK (21)`; motion `OK (26 checks)`; smoke `OK (14 checks)`; inventory `OK (7 checks)`; contrast
    `OK (58 checks)`; layout 320 and 390 px `OK` (LAYOUT_ONLY=rider); npm test 1824 tests, 1777 pass, 0 fail. Budgets (kit2 a602834's, run only)
    on the 16 rider screens: the first run `FAIL 5` at load average 6 (four self-tests "host busy, not judged", reference 2.9-6.6 ms, and
    plan-avatar-rider's header insert 64.1 ms at 6x, 7.5 at 1x); again `FAIL 4`, the four host-busy self-tests alone (reference 2.0-7.8 ms
    against 1.8): every item rule ok, most FW nodes 234 (plan-avatar-rider), 0 running, slowest fwMount 30.9 ms at 6x. The gate, not the item:
    the app is unchanged since round 6 (`OK (55 checks)` on a quiet host).
- Bundle v8 (stopped: one former hold still fails; the app chat to decide). The design chat's v8 (FW.version '8', built 2026-11-17 14:45
  EST; checked on its own in probe99/verify-bundle6.json, FROM-APP-CHAT-6 points 1-5 and 6B points 6-8) is inlined on q99-rider with
  `node scripts/fw-inline.mjs ~/Dropbox/00_T/handoff` (6a8bb4e, pushed; the handoff files byte-identical to probe99/v8-1445-copy first):
  only the two bundle blocks change, run again it changes nothing, sw.js CACHE and APP_BUILD stay v123; no console errors in Chromium,
  WebKit only main's five file:// lines. q99 (kit) now: BUILDS v8 only (css e24007a5..., js 45548763...), the cache check asks v8 (14:45)
  or later; V7_GAPS, AWAIT, PAT_AWAIT, FWV, the held-but-shows rule and the skip lines are gone; the cases they held are judged in full and
  printed beside v7's (FIXED_BY_V8 in the strip, PAT_WAS in the sheet, each must be judged on a ride's list); OWN takes v8's colours (covers
  #4F6478, thermal jacket #5B4E9E, winter jacket #2F6B4F); the gloves keep their fill (the decision: #C9D1DA is every glove's cuff and the
  overshoes' hem, no one item's own). My decision for the thermal jersey: its own is the jersey's colour (its sleeves: o.armSleeve = o.top)
  or #FFFFFF (the cuff: o.cuff is set by jersey-heavy alone, when it sets the sleeves; the rain jacket clears it), a pixel within 10 of
  either; pxMany takes a list of own colours. mut99: c1-nojacket on v8's jacket strings, four new (v8-winterblack, v8-winterv7,
  v8-heavyblack, v8-bandcoral); all 128 build on the v8 page (DRY), none run yet.
  - On v8 (fred99/null.html = mknull of 6a8bb4e), one at a time: q99 sheet,strip `FAIL 50` (probe99/v8take/runs/q99-sheet-strip-1.log);
    the other sections (main second) `OK (209 checks)`. Each former hold, v7 -> v8 least (changed / own): tights-heavy under overshoes
    0 -> 192 / 144 (850 judgements); shoe covers 202 / 0 in #1E1E24 -> 425 / 340 in #4F6478 (1384); winter jacket on dark jerseys 240-276 /
    0-36 -> 1909 / 1561 (45); thermal jacket on Navy 240-290 / 0-29 -> 3980 / 3525 (3); thermal jersey in Black with arm warmers and the
    vest 0 -> 348 / 192 (44); band 0 -> 430, side stripe 0-12 -> 184, splatter 0 -> 474 device px from Plain at the sheet's size. All pass.
  - Still failing (the 50): V7_GAPS point 3 on deep brown skin, by the own-colour rule only. Full gloves 204 changed, 0 in #2A2A30 (the
    wet starter and full lists); fingerless 320 changed, 8 in #2A2A30 (the hot and mild full lists); default rider in deep skin and RIDER99,
    every jersey. #2A2A30 is at most 48 a channel from #5A3622, so no fill pixel can count; the v8 cuff carries them (120 and 152 px in
    #C9D1DA, probe99/v8take/gloves.mjs). Not held, no work-around: the app chat decides (the cuff as the gloves' own, a by-design rule, or
    a v9 fill). Not run until then: the mutants, q97, q98, motion, budgets, smoke, inventory, contrast, layout, npm test.
