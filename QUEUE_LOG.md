# fred build queue log

Reports for each item in QUEUE.md, newest last.


## Item 1 · fred v3 ("soft minimal") + all queued behavior changes — DONE 2026-09-29

**Branch** queue/1-v3-soft-minimal, merged to main. Commits: v3-0 tokens and shared components · v3-0b input outlines reach 3:1 · v3-1 header and navigation · v3-2 Plan in four open sections · v3-3 Results as a prep checklist · v3-4 Journal timeline · v3-5 Volume layout 5 · v3-6 Races with graffiti · v3-7 Log a race cards and Ready, Freddy · v3-8 Settings as a searchable list · v3-9 races table frame, colours frozen · v3-10 restyle remaining screens · v3-11 quality pass. sw.js cache fred-shell-v26 (the marker fonts are precached for offline use). No Worker changes.

### What changed
Every screen now uses the soft-minimal system from the spec: #FAFAFA page, white panels with thin outlines, light-weight numbers, one tinted panel per page, no solid colour blocks, no shadows (except the selected segment). Header is a large left title with a grey subline; the nav reads Plan · Journal · Volume · Races · Settings. Plan shows four open sections with the Ride panel tinted in the effort colour. Results is a ride-morning checklist (Bottles / Gels / Closet ticks that save with the plan and sync) with a plain-sentence Copy. Journal is a timeline with the waiting check-in tinted, a Copy of what you actually took in, and "What fred noticed" built only from checked-in rides. Volume has the blue season card, four same-day tiles, and an Hours-per-year chart that scrolls sideways back to your oldest season. Races opens with your last race in marker "graffiti" (Permanent Marker + Caveat Brush, self-hosted in assets/fonts with their licenses) and the one coloured Your bests card. Log a race uses tinted leg cards and ends on Ready, Freddy. Settings is one searchable list with coloured lines and sheets. The races table keeps its spreadsheet colours (now guarded by a test). The build-9 behaviours (Plan → Journal, digits-only times, auto halves, no wins while logging, placings order, nutrition-only carbs, off-season on a date) were kept and restyled.

### Decisions
The spec left some choices open. Where the PDF and the quality rules disagreed, accessibility won (these are marked "D:").

## Parts 0–1 (690ad7f, 88fb916)
- Tokens + shared components (tinted panel, input/collapsible sections w/ per-device fold state bluebird.fold.v1 not synced, timeline, delta pills w/ Less flip, segmented, chips, checkbox rows, auto field). Shadows removed except selected segment.
- Header: large left title + grey subline (ride date on Plan results; offline state), account circle; scrolls with the page (iOS large-title style). Nav: Plan · Journal · Volume · Races · Settings (data-view="profile" and ids kept). theme-color/manifest #FAFAFA.
- D: inactive tab LABELS #6E6E73 (icons #B5B5BA) — #B5B5BA text fails AA.
- D: dark text on tints: blue #0B7399 and teal #147574 instead of #127EA6/#1F8F8E (those fail 4.5:1 on their tints); green #5F6A12 kept.
- D: unselected segment text #3A3A3C (#6E6E73 on #F0F0F2 is 4.46:1).
- D: input outlines #8E8E93 (3.26:1) instead of #E5E5EA (1.26:1): the spec's own quality page requires 3:1 input outlines (fixed in v3-0b).
- D: product names 14px (spec allows 14–15) to avoid overflow at 320px/200%.
## Part 2 (636963e v3-0b, 4a1db31 v3-2)
- Four open sections; Ride tinted by effort (recovery→teal, z2 Steady→blue, hard→green; stored values unchanged).
- D: former folded Plan inputs made visible: typed temperature under Where & when; bottle size, fluid, strength, first gel, heat option, "I know what I like" under Today & bike ("Fine-tune today"), because nothing may hide behind a tap. Today & bike is therefore longer than the PDF.
- D: Nutrition / Clothing / Both switch kept as "Plan for" in Today & bike (not in PDF; needed for Clothing mode).
- D: old "Your setup" summary → "From Settings" block with "Edit in Settings".
- D: Date · Start · Ends share one row only where they fit (430px); narrower phones put Date on its own row (native date box is wider than the PDF's custom "Sat, Sep 26").
- D: chips/outlined buttons keep the light #E5E5EA edge (identified by their text); field boundaries #8E8E93.
## Part 3 (93e7191) — full kit after part 3: 53/54 OK; strava-sync failed only because its fixture's newest ride (2026-09-27) fell outside the sync window as the calendar moved — fixture fixed, passes standalone on old and new code.
- Results as a prep checklist: tinted top numbers (effort colour), small static weather card (sky gradients/animations removed), Bottles/Gels/Closet tick rows (ticks in lastPlan.ticks, which syncs; keyed by item so re-crunch keeps ticks for unchanged items; included in the Journal snapshot as snap.ticks), During the ride, Nutrition totals + Copy, Details, Save bar.
- D: warnings sit right under the top numbers (red text on white) so folding Bottles can't hide them.
- D: everything else from the old Results is in Details (leg-by-leg bottles, hourly weather + full "how it changed", gel schedule, numbers by hour, math, notes, Log this ride, Save as image).
- D: weather card's big number is the ride-start temperature with "→ X° by {end}"; the top panel keeps the ride average.
- D: water-only / aid-table refills show as a plain line in Bottles (nothing to pack, no tick box).
- D: kcal = rounded carbs × 4 so card and Copy agree; metric Copy says mL; clauses omitted when they don't apply; "1 gel" singular.
- D: top-number stats 26–34px light (spec scale gave 23.8px, visibly smaller than the PDF).
## Part 4 (v3-4 journal timeline)
- Timeline: upcoming (hollow, furthest ahead first) → check-ins waiting (newest first) → done (newest first). Groups implicit; "N rides · K waiting" count line kept (#journalCount); sr-only "waiting for a check-in".
- D: only the newest waiting check-in is tinted; older waiting ones get teal outline + button (one tint per page).
- D: races are not journal entries today → no black dots added.
- D: planned entries' numbers line "Planned 85 g/hr" (upcoming too; PDF shows none for upcoming); Strava match "Strava 4:18, 71.2 mi".
- D: tag meaning: good = Strong, Stomach great; rough = Faded, Stomach upset, Lots of gas, Too thirsty, Sloshy; neutral = the rest incl. clothes verdicts (PDF shows "Too warm" in ink). Tag words unchanged (JTAG).
- D: 24-hour phones get "08:00" (2-digit hour); 12-hour keep "8:00 AM".
- D: Copy in the opened entry (Copy · Edit entry · Delete + "Copies: …" line); none on Clothing-only entries. Conc from snapshot (old: plan.actualConc) only when bottles were finished; caffeine = caffeine gels actually reached in schedule order with ride times; old entries: planned mg only if every planned gel taken, no time.
- What fred noticed: ≥3 rides per line (J_NOTICE_MIN); lines intake vs plan, energy, stomach, thirst, clothes vs temp (items worn on ≥half the too-warm/too-cold rides); Done + not future only; fold key jNoticed, closed by default.
- D: open entry's full log spans the full width (thread pauses under it); plan-vs-actual table scrolls in its own box at 200% on ≤375px.
- Check-in sheet ticks read-only: not added.
## Part 4 (4f952a3)
- Journal as a timeline: upcoming (hollow dots, furthest first) → waiting check-ins → done, newest first; count line "N rides · N waiting" replaces group headings (hidden SR label on waiting rides).
- D: only the newest waiting ride is tinted (teal); older waiting rides get a teal outline + button (keeps one tint per page).
- D: races are not journal entries today, so no black race dots.
- D: tag colours — good (Strong, Stomach great) #5F6A12; rough (Faded, Upset, Lots of gas, Too thirsty, Sloshy) #C21A2F; everything else ink, clothes answers neutral as in the PDF.
- D: 24-hour phones show "08:00"; 12-hour phones "8:00 AM".
- D: Copy is inside the opened entry; clothing-only rides have no Copy; concentration only when bottles were finished; caffeine = caffeine gels actually taken, with ride times from the snapshot; metric in mL.
- D: "What fred noticed": 5 patterns (intake vs plan, energy, stomach, thirst vs fluid, clothes vs temperature = closet learning), each needs ≥3 checked-in rides answering it; planned entries never count. Collapsed by default, remembered.
## Part 5 (9986875)
- Volume layout 5; four tiles with same-day comparisons in the pure maths block (volTiles).
- D: new "Weeks start on Monday | Sunday" choice in the goal sheet (Monday default), needed for same-days-of-last-week.
- D: "5-week average" = the last 5 full weeks including last week.
- D: with no goal, Avg/week compares with last season's average week; "goal reached" when reached.
- D: Hours ▾ sits on the Season | Off-season row (doesn't fit on the chip row at 390px); More became a ⋯ icon on the sync line.
- D: year chart: ≤8 seasons share the width; >8 → 44px slots (34 bar + 10 gap), opens at the right end, shared y-scale, fades + "‹ oldest" hint, snap, popover, ←/→/Home/End; the two edge fades are the only gradients in the app.
- D: Strava orange #FC4C02 added as a token, used only for the sync-line dot shown in the PDF.
- D: Volume tables stack instead of scrolling when narrower than 15rem, so only the year chart scrolls sideways.
## Part 6 (99d84df)
- Races: last race card (grey outline) with marker graffiti, Your bests = only tinted card (teal/blue/green tints), buttons, collapsible lists (All races by year, Chapters, dashed AI card).
- Fonts self-hosted in assets/fonts: Caveat Brush (OFL) and Permanent Marker (NOTE: Permanent Marker is licensed Apache-2.0, not OFL — the real Apache license file is shipped).
- D: note from the top selected win: overall PR that is a first sub-X → "first sub-X, baby!"; other overall PR → "PR by M:SS!"; AG overall PR → "AG PR by M:SS!"; anything else → no circle, "Finished. Race #N of the season." (N = order among finished races in that calendar year).
- D: animation once per device (bluebird.graffitiSeen.v1), only for races saved after this device first showed the page; JSON/spreadsheet imports never animate; reduced motion uses up the play statically; a race synced in from another device may play once here.
- D: #raceImportBtn lives inside the dashed AI card (or the empty-state AI card).
- D: sections not in the PDF: distance cards + Records across distances → folded "Records by distance"; Firsts since / Compare to before → folded "Firsts since {chapter}" (chapter view); upcoming races at the top of All races; landscape card at the foot of All races.
- D: All races shows 8 results then "Show all N ›"; PR badge = beat every earlier eligible finish at that distance (first race at a distance gets none).
- D: chapter dots replace the chapter icon in the switch/list (icon still stored); AI card keeps "Copy prompt" wording (verbatim AI card text).
- D: last race and Your bests cards don't collapse (the PDF draws carets but the text doesn't ask for it).
## Part 7 (a481985) — full kit after part 7: 58/58 OK
- Log a race cards as light tints (grey/teal/blue/green) with outlines; header "Cancel · race", dots, ← + "Next: …"; Ready, Freddy with marker title, graffiti, every win with tick boxes, found-with-fred switch, Copy N wins, Done.
- D: How it felt is card 9 and Build card 10 (PDF shows "Next: How it felt" after Nutrition).
- D: Overview keeps editable race-day weather (air temp, humidity, wind + Fill in); water temp moved to Swim; Finish shows a read-only summary.
- D: kept fields the PDF doesn't draw (swim unit chips, bike half power, power-meter switch, Anything off? on bike/run, course, notes, the other nutrition planning fields under "The days before and the plan").
- D: race weight moved to Finish (same saved field); Finish "Age group" is the as-listed field with the birthday band as placeholder.
- D: a "Save & finish" outlined button under every card so saving early stays possible; Skip hidden (Next does the same).
- D: the graffiti animation now plays once on Ready, Freddy, then the race is marked seen so the Races card shows it static.
- D: Ready screen trimmed to the PDF (no medal/reorder/add-your-own; those remain on race detail); wins shown without emoji, Copy keeps full lines.
## Part 8 (c196aa5)
- Settings: flat searchable list with coloured group lines; one sheet opens each setting's existing editor (ids/handlers kept); Recently changed = last 3 per device (bluebird.settingsRecent.v1, not synced/backed up); deep links open their sheet; old accordion state key removed at boot (held no user data).
- D: items not in the PDF list went into the closest sheet with search keywords: Medications → Caffeine; bottle size + Advanced (caps, heat thresholds, gel rounding) → Drink mix; brand filter + Fine-tune → Gels; Import race spreadsheet → Backup.
- D: Counts toward volume opens the Volume goal sheet at its sports chips (the only place they are edited).
- D: Gender labels Women / Men / Non-binary (stored values unchanged).
- D: search field uses the grey tint fill + 3:1 outline (the #F0F0F2 fill gave the placeholder only 4.46:1).
- D: the sheet stops at the tab bar so tabs stay usable.
- Leftover "Profile" wording app-wide now says Settings.
## Parts 9–10 (198543d v3-9, 549e23e v3-10)
- Table: frame only (page #FAFAFA, rounded white frame with 1.5px outline, "‹ Races" + 17/600 title, chips, Time|Pace v-seg, lighter headers, legend). D: selected filter chip black (part 0 / brief) though the PDF text says "white selected chip" (white-on-white fails the 3:1 state contrast). D: CdA legend note kept.
- table-colors.test.js freezes DEW/WKG/NEG/GROUPS (source + runtime + rendered cells + legend + Pace mode) and the --brand dot.
- D: coloured ACTION buttons allowed (teal "How did it go?"); coloured SELECTED toggles are blocks (cage roles, closet efforts restyled as segmented with dots).
- D: race detail hero = its one tint (blue); Compare summary grey tint (green when faster); Settings has no tint (spec p.11).
- D: Journal ± column: more than planned = green pill, less = red, no change / time = grey pill.
- D: no in-app splash exists; launch splash is the manifest (#FAFAFA + icon, part 1).
- D: email ellipsizes at 320px/200% on the account sheet.
## Parts 9–10 (198543d, 549e23e)
- Table: frame restyled only; frozen cell colours guarded by work-v3/table-colors.test.js (source constants + rendered cells + header bands; verified it fails when a colour changes).
- D: selected filter chip is black (the PDF text says "white selected chip", but white-on-white fails the 3:1 a selected state needs).
- D: coloured action buttons allowed (the PDF's teal "How did it go?"); coloured SELECTED chips/segments count as solid blocks, so cage roles and closet efforts became segmented controls with colour dots.
- D: race detail top card = its page's one tint (blue); Compare summary = grey tint (green when faster); Settings has no tint (spec p.11).
- D: Journal ± column uses delta pills (more than planned green, less red, no change grey).
- D: no in-app splash exists; the launch splash is the manifest (#FAFAFA + icon).
- D: Strava callback page restyled with the same tokens inline; behaviour and version line unchanged.
- New guards in fred accept: no solid palette-colour blocks outside buttons/dots/charts/pills/table cells/logo/Strava artwork; exactly one tinted panel on Plan, Results, Journal, Races; none on Settings.
## Part 11 (v3-11 quality pass) — full kit after part 11: 63/63 lines OK
- Motion: removed the Results "rise" card animation and the old bottle-fill transition; smooth scrollIntoView (5 places) now jumps instantly. Allowed: graffiti draw/pop (once), toast opacity fade (re-enabled with its own rule), .v-caret rotation. One reduced-motion block at the end of the stylesheet stops every animation/transition.
- D: the race-import spinner (.ri-busy) and the location button's busy pulse (.loc-me) are loading feedback: kept, static under reduced motion. Strava callback spinner likewise (already gated).
- D: smooth scrolling counts as motion → instant jumps everywhere, also without reduced motion.
- Light only: color-scheme: light (meta + :root) on index.html and strava/callback; no prefers-color-scheme rules existed.
- sw.js: fred-shell-v26; precaches both marker fonts by explicit name.
- Layout test now derives its list from screens.js (it had missed results-checklist-open); runall2 runs the full 4×3 matrix (one width per process, in parallel).


### Tests
Full kit (runall2.sh) run after parts 3, 7 and 11. After part 3: 53/54 (strava-sync failed only because the calendar moved its test ride outside the sync window; fixture fixed). After part 7: 58/58 OK. After part 11 (final): **all 63 lines OK**, including contrast AA on 78 screens (12,351 checks), the full layout matrix 320/375/390/430 × 100/150/200% on every screen (900 checks), the Volume matrix, the sync suite, the Strava tests, the frozen table colours, motion (only graffiti once, toasts and carets; nothing under reduced motion) and light-mode-only. New v3 tests: part0-1, plan, results, journal, volume, races, lograce, settings, table-colors, motion, light.

### Screens next to the PDF (app at 390px on the left, PDF page on the right)

**p2 · Design system**

![p2](docs/queue-log/item1/cmp-p02.jpg)

**p3 · Components**

![p3](docs/queue-log/item1/cmp-p03.jpg)

**p4 · Plan**

![p4](docs/queue-log/item1/cmp-p04.jpg)

**p5 · Results**

![p5](docs/queue-log/item1/cmp-p05.jpg)

**p6 · Journal**

![p6](docs/queue-log/item1/cmp-p06.jpg)

**p7 · Volume**

![p7](docs/queue-log/item1/cmp-p07.jpg)

**p8 · Races**

![p8](docs/queue-log/item1/cmp-p08.jpg)

**p9 · Log a race (1 of 2)**

![p9](docs/queue-log/item1/cmp-p09.jpg)

**p10 · Log a race (2 of 2) + Ready, Freddy**

![p10](docs/queue-log/item1/cmp-p10.jpg)

**p11 · Settings**

![p11](docs/queue-log/item1/cmp-p11.jpg)

**p12 · All races table**

![p12](docs/queue-log/item1/cmp-p12.jpg)

## Item 2 · Import training history: pick the right sheet in Excel files — DONE 2026-09-29

**Branch** queue/2-xlsx-sheet, merged to main. Commits: "q2: pick the right sheet in Excel training imports", "q2: cache fred-shell-v27".

### What changed
- An .xlsx training file is no longer read from its first sheet only. fred looks at every sheet, finds each sheet's header row (up to 15 rows down, so notes above the table are fine), and picks the sheet itself, or asks "Which sheet?" when it can't be sure.
- The "Which sheet?" step (step 1 · Files) lists each sheet with its row count and detected format, best guess pre-selected; Back / Next.
- Column dropdowns are pre-filled by header name, ignoring case, spaces and "_": Date/WorkoutDay → date, Sport/WorkoutType → sport, Hours/TimeTotalInHours → hours, Meters/DistanceInMeters → distance, Title → title. The older looser guesses stay as a fallback.
- The race-spreadsheet importer is unchanged (it shares only the file loader, which was not changed).

### Decisions
1. Sheet rule: each sheet gets a tier: 2 = a known format (TrainingPeaks, Strava, Garmin), 1 = fred can find a date plus a duration or distance column, 0 = any other table. Hidden sheets and sheets with no data rows are skipped. One sheet in the best tier wins outright. Two or more known-format sheets → ask. Otherwise the sheet with the most rows wins unless the runner-up has at least 80% as many rows → ask.
2. A table fred can map beats a bigger one it can't (row count only breaks ties within a tier), so a big notes or summary sheet never wins over the workout log.
3. Hidden sheets are skipped unless nothing else has data (exports often keep helper data there).
4. Known formats still go straight to the preview (as before); only other layouts reach the column step.
5. The picker lists every candidate sheet, ranked, so the choice can always be overridden.
6. A header row needs at least 2 text cells and at least half as many as the widest row, so notes lines like "Athlete: | Ashley" are skipped; a known-format row is taken first even under notes.

### Tests
New xlsx-sheet test (38 checks) with real .xlsx fixtures: a "Read me" notes sheet first and TrainingPeaks data on "Workouts" (picked automatically, imported correctly); two plausible sheets (picker, then pre-filled columns); generic headers on sheet 2 (picked by most rows, pre-filled); header row under two notes rows; CSV unchanged. The picker was added to the contrast and layout screens. Full kit: every line OK except one known intermittent check in the races-flow test ("closing with typed data asks first"), which failed once under the full parallel run and passed 3 times out of 3 when rerun on its own; it is timing-related and unrelated to this change.
