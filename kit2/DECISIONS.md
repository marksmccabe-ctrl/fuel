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
