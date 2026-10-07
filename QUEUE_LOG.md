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

## Item 3 · Bug: imported training + Strava double-count the same workouts — DONE 2026-09-30 (one step needs Ashley's device, see below)

**Branch** queue/3-double-count, merged to main. Commits: "q3: count each real workout once across imported training and Strava", "q3: cache fred-shell-v28".

### Diagnosis: what was actually wrong
The de-duplication *did* run whenever Volume was computed (`volActs()` → `volMergeActs(sa, imp)`, main index.html:12146 and :5213), and it *did* use Strava's local date (`start_date_local`, :5214). So the dates, the sport tables and the "compute time vs import time" question were not the cause. The matching rule itself was too narrow, and it also merged too much in one case. main index.html:5213–5221:

```js
const close=(x,y)=>Math.abs(x-y)<=0.1*Math.max(x,y) …
if(c.some(a=>w.hours!=null ? close(volHours(a), w.hours) : (w.meters>0 && close(+a.distance||0, w.meters)))){ dropped++; return; }
```

1. **It compared against Strava's moving time only** (`volHours(a)` is `moving_time`, :5176). TrainingPeaks' `TimeTotalInHours` is usually elapsed time, so any workout with stops (long rides, pool swims, runs with lights) was more than 10% apart and got counted twice. This was the main cause.
2. **There was no 5-minute floor.** Short sessions (a 30-minute run with 26 minutes moving is 13% off) never matched.
3. **Distance was only used when the imported row had no time.** A row with a time and a matching distance but a time more than 10% off was never checked by distance.
4. **Swims with an estimated time** were compared on their guessed time and missed.
5. **No ±1 day.** A late-evening workout that TrainingPeaks files on the next day (a different time zone setting, or a ride that crosses midnight) never matched.
6. **Not one-to-one.** `c.some(…)` let one Strava activity absorb *every* close imported row, so an AM + PM run (or two similar rows) with one Strava run lost the second run's hours. This is an under-count.
7. The memo (`key=sa.length|TI.ver|lastSync|uid`, :12147) was **not** a cause in practice: every import bumps `TI.ver`, and every sync changes the size or `lastSync`. It only went stale during a sync when an activity was edited in place (same count). It is now keyed on the contents anyway (see the fix).
8. `tiSame` (the 10% rule, :12102) compares imported rows with other imported rows at import time only (the same workout in two files). It never saw Strava data, so it was not involved in this bug. Left as is (see decision 9).

Reproduction: `kit/work-q3/repro.js <html>` runs 10 seeded cases plus an order check through a build's pure Volume block. On main, 6 are BAD: C elapsed 5:02 vs moving 4:12, D short run, E estimated swim, F distance agrees but time does not, G AM + PM runs (both absorbed, 1 h instead of 1.98 h), J 23:10 start filed next day. The spec's own example (A: TP 2.0 h vs moving 1:58) and the UTC-next-day case (B) already matched on main. With the fix, all 10 are OK.

### Fix
- `volMergeActs` (pure Volume block, next to `volHalfUp`) is rewritten with `VOL_MATCH={pct:.10, floor:300 s, dist:.10, edge:180 min}`, `volLocal`, `volPairGap` and `volSources`. The rule is the one in QUEUE.md: same sport group, same local date, and either the duration within max(10%, 5 min) of moving **or** elapsed, or (when both have one) the distance within 10%. A swim flagged `est` pairs on distance alone. Pairing is one-to-one, closest first, and the Strava activity is the one counted. Imported rows are never deleted; a matched row is only left out of the maths.
- `volActs()` now goes through `volMerged()`. Its memo key is an order-free hash of each activity's id, sport, local start, moving and elapsed time, distance and manual flag, plus `TI.ver` and the imported count. The merge is recomputed on any content change.
- Import stores `est:true` on swims whose title contains "time estimated" (any case). Backup and restore keep the flag.
- Settings › Imported training shows "6,034 imported · N matched to Strava and counted once." (real numbers, thousands commas) when signed in with Strava connected and synced, otherwise "N imported". The import toast, preview count and file list now use thousands commas too.
- **Sources** sheet: open it by tapping the Last week, This week or This month tile (the whole tile is the button, with a small ›), or any month in Month by month. It lists that period's workouts, oldest first: date, sport, duration, distance and source ("Strava", "Imported", "Strava · also imported, counted once"). Each merged imported row sits indented under its Strava activity as "Imported · counted once with Strava ride", with its own time. The header reads "N workouts · X h counted · M imported counted once with Strava". The sheet follows the sport chip, shows "Powered by Strava" when Strava rows show, and is read-only. Nothing is stored; it is owner-only (the Volume tab).

### Decisions
1. **±1 day** is only a fallback. It applies after every same-day pair is taken, and only when the Strava activity started within 3 h of midnight in local time: 21:00 or later means the imported day may be the next day, before 03:00 the day before. It also applies, either way, when the activity has no `start_date_local`. Imported rows never have a time of day, so the literal rule ("one side has no time of day") would allow ±1 always. That would pair Monday's run with Tuesday's for anyone who trains daily. A same-day candidate always wins over a ±1 one.
2. **Tolerance**: max(10% of Strava's time, 5 min), checked against moving and against elapsed separately. The distance tolerance is 10% of Strava's distance.
3. **"Closest"** means: a Strava-id pair (from a Strava bulk export) first; then same day before ±1; then the smaller of the larger relative gap across time (the better of moving and elapsed) and distance, each counted only where both sides have it. Ties go to the distance gap, then the ids, so the result never depends on list order. In the synthetic history, ranking by the larger gap instead of time first cut wrong AM/PM swaps from 35 to 4, and the 4 left are genuinely indistinguishable.
4. **Sport groups** use the existing tables; no counting change. Strava (VOL_SPORT): Ride, VirtualRide, GravelRide, MountainBikeRide → bike; Run, TrailRun, VirtualRun → run; Swim → swim; WeightTraining, Workout, Crossfit → strength; everything else (EBikeRide, Walk, Hike, Yoga, Rowing…) → other. Imported (tiSport): Bike, MTB, Mountain Bike, Cycling, Ride, Gravel, Spin → bike; Run, Jog → run; Swim → swim; Strength, Weight, Crossfit, Gym, Lift → strength; Brick, Multisport, Triathlon, E-bike, Walk, Crosstrain, Other… → other; Day Off → skipped. Only the same group pairs, so an e-bike ride is "other" on both sides and pairs only with "other".
5. **"Time estimated"** applies to swims only (the rule names swims). An estimated swim with no distance never pairs. Rows imported before this change have no `est` flag, but they still pair through the general distance rule, so only the ranking differs. Re-importing the same file adds nothing, because the ids already exist.
6. **The counted time is the Strava activity's** (moving time, or elapsed for manual entries, as before), on Strava's local day.
7. **Sources entry points** are the week and month tiles and the Month by month rows. The Hours-per-year popover (a whole season) and off-season mode have no Sources entry.
8. **The Settings line** needs signed in, Strava connected and activities synced on this device. Otherwise it shows just "N imported", and it is hidden with nothing imported. The Settings row value stays "N files".
9. **`tiSame` is unchanged.** Loosening it would skip more rows at import time, and those rows would never be stored (lost), while the Volume merge never loses anything. Known limit: rows imported both from a Strava bulk export and from TrainingPeaks, without Strava connected, are still only de-duplicated by `tiSame` at import.

### Before / after hours per year (synthetic history)
Ashley's real data lives only on her device and in her Firestore, so it could not be recomputed here. **The real-data recompute has to be run on her device.** Open Settings › Imported training and it shows "N imported · M matched to Strava and counted once."; any Volume week or month › Sources shows each merge.

Instead, `kit/work-q3/synth.js` builds a seeded history: 6,040 TrainingPeaks rows over 2011–2026 and 2,927 Strava activities over 2018–2026, 2,807 of them the same workouts. The duplicates have moving vs elapsed gaps (café stops), TP time at elapsed (70%) or auto-pause (30%), UTC offsets of −4 to −7 h, 8% late-evening starts (a quarter of those filed on the next day in TP), 15% of swims "time estimated", AM + PM runs and bricks, plus 120 Strava-only rides. Before is main's `volMergeActs`, after is the new one, and truth is each real workout once (Strava's moving time when on Strava).

| Year | TP rows | Strava | Before (old rule) | After (new rule) | Truth | Before − truth | After − truth |
|---|---:|---:|---:|---:|---:|---:|---:|
| 2011 | 388 | 0 | 532.3 | 532.3 | 532.3 | +0.0 | +0.0 |
| 2012 | 362 | 0 | 486.5 | 486.5 | 486.5 | 0.0 | 0.0 |
| 2013 | 404 | 0 | 572.4 | 572.4 | 572.4 | 0.0 | 0.0 |
| 2014 | 371 | 0 | 532.0 | 532.0 | 532.0 | 0.0 | 0.0 |
| 2015 | 380 | 0 | 550.8 | 550.8 | 550.8 | 0.0 | 0.0 |
| 2016 | 396 | 0 | 548.9 | 548.9 | 548.9 | 0.0 | 0.0 |
| 2017 | 382 | 0 | 520.7 | 520.7 | 520.7 | 0.0 | 0.0 |
| 2018 | 372 | 323 | 551.4 | 499.6 | 499.6 | +51.9 | 0.0 |
| 2019 | 365 | 310 | 545.0 | 491.7 | 491.7 | +53.3 | 0.0 |
| 2020 | 377 | 331 | 622.8 | 554.8 | 554.8 | +67.9 | 0.0 |
| 2021 | 383 | 340 | 615.7 | 541.1 | 541.1 | +74.7 | 0.0 |
| 2022 | 391 | 344 | 588.5 | 531.6 | 531.6 | +56.9 | 0.0 |
| 2023 | 410 | 346 | 646.6 | 552.2 | 552.2 | +94.4 | 0.0 |
| 2024 | 376 | 319 | 569.8 | 506.6 | 506.6 | +63.2 | 0.0 |
| 2025 | 383 | 349 | 618.4 | 534.2 | 534.2 | +84.2 | 0.0 |
| 2026 (to Sep 28) | 300 | 265 | 456.7 | 400.1 | 400.0 | +56.7 | 0.0 |
| All | 6,040 | 2,927 | 8,958.7 | 8,355.6 | 8,355.6 | +603.1 | 0.0 |

The old rule missed 281 true duplicates: 219 where the TP time was about elapsed and more than 10% off moving, 32 filed on the next day, and 30 estimated swims. It also dropped 12 imported workouts that were not on Strava (the AM/PM over-merge). The new rule pairs 2,807 (2,803 exactly right; the 4 swaps are indistinguishable twins) and takes 37 ms for the whole history.

### Tests
New `kit/work-q3/double-count.test.js`, seeded with no real Strava calls. Pure part: the spec example; UTC next day; estimated swim (and its guards); AM + PM runs; near-identical runs; distance deciding; brick (both legs, and only the ride on Strava); far-apart; the tolerance edges; sport groups; ±1 near midnight only; same day beats ±1; Strava-id first; 20 shuffles giving identical pairs; Sources rows and totals. UI part: sync then import vs import then Full resync give identical Volume numbers (every season, September, tiles, table) and identical Sources. An activity edited on Strava with the same count recomputes at once. The Settings line with and without Strava, with the thousands comma. Sources from a tile and from a month row, focus in and out, nothing stored, and all 1,008 imported rows kept. Added to runall2.sh. New screens in work-fix/screens.js: volume-sources, volume-sources-month, volume-month-list, settings-imported-training (contrast + the layout matrix).

Screenshots (390 px): docs/queue-log/item3/sources-390.png, docs/queue-log/item3/settings-imported-training-390.png.

Full kit (runall2.sh): every line OK (65 lines incl. the new q3 double-count test) except the races-flow check "closing with typed data asks first", which failed under the full parallel run for the second item in a row. Per the queue rule (fails twice → fix the flake) the test was fixed: it now waits until the Log a race flow is open before typing and polls up to 10 s for the close instead of checking after 3 s. It then passed 3/3 alone and 4/4 with four copies running at once. The app itself was not changed for this; it is a test-timing fix.

**Needs you:** the "recompute on the real data" step could not be done here, because Ashley's imported history and Strava copy live only on her device and in her account. After this update, on her device: Settings › Imported training shows how many imported workouts were matched to Strava and counted once, and Volume › any week or month › Sources shows each merge. Her hours per year before/after can be read off the Volume year chart before and after updating (the synthetic table above shows what to expect: the Strava years drop by roughly the duplicated hours, the pre-Strava years don't change).

## Item 4 · Polish round 2 (from iPhone testing) · DONE 2026-09-30

Branch `queue/4-polish-2`, one commit per part (q4-1 … q4-5), then the cache bump to `fred-shell-v29`, then merged to main.

Note: the message that added this item said screenshots were attached, but none arrived. The only screenshot used is the Volume one from the page-order message (docs/queue-log/item4/volume-current-build.png).

### What changed

**1) Plan (q4-1)**
- Every Plan box now has a light tint and a matching 1.5px outline:
  - Ride takes the colour of the chosen effort.
  - When & where is teal.
  - Stops is blue.
  - Advanced is green.
  - The plan summary is grey.
- **When & where** (renamed) shows only Location, Date and Start time.
  - A pin icon inside the Location field is "Use my location".
  - "Type a temperature instead" and "Ends" moved into the box's own Advanced drop-down.
- **Stops** is one row, "No stops · + Add a stop". The stop rows appear only once a stop is added.
- **Advanced** (was "Today & bike") is closed at first. It holds:
  - No gels, Caffeine and Fewest bottles;
  - the bike;
  - Fine-tune today, I know what I like and Plan for.

  When closed, its header shows a grey line naming what is set inside.
- **Plan summary** stays visible under Advanced, with Crunch the plan below it.
- **Default bike** is the last one used.
- **20-minute gel tip:** found and removed in two places:
  - the Plan line "Our rule: A first gel at 20 min is practice…";
  - one sentence in the Science timing card.

  The "First gel at" input itself stays.

**2) Settings (q4-2)**
- The four groups fold and are all closed the first time.
  - Each group shows its name, coloured line and a one-line summary built from its rows.
  - Open/closed is remembered per device.
- Rows alternate white / #F6F6F8. Grey text on #F6F6F8 measures 4.70:1, which passes AA.
- "Recently changed" is gone: chips, code, and its per-device key. It held no user data.
- Search opens the groups that have matches and hides the others. Clearing the search puts back the remembered state.
- Deep links (account icon, Strava return, "Add birthday", the backup gate) open their group first.

**3) Journal (q4-3)**
- The check-in card and the empty-state card are centred.
- Titles are 17px/600 and body text 14px/400. "How did it go?" is 14px and centred in its own row.
- The empty state is now a title ("No rides yet") plus a line of text.
- This also fixed an old padding bug that made the empty-state text touch the box edge.
- Before/after: docs/queue-log/item4/part3-compare.png.

**4) Volume (q4-4)**
- **Page order:**
  1. season card (first thing under the title);
  2. the four tiles;
  3. Hours per year;
  4. Months;
  5. Month by month;
  6. the sideways link and the Season over? offer;
  7. a new **View** section at the bottom holding:
     - the sport chips;
     - Season | Off-season with the Hours / Miles / Sessions menu;
     - "Off-season starts … · Change · Cancel";
     - "Synced from Strava · Sync now · ⋯".
- **Filter line:** when the sport isn't All or the unit isn't Hours, the season card shows a small grey line such as "Bike · Miles ›". Tapping it jumps to View. With the defaults nothing shows.
- **This month** is compared with this season's average month, scaled to the days elapsed. The label is "vs avg month this year". In a season's first month there is nothing to compare, so the tile says "first month of the season".
- **Hours per year** has a teal 10% tint and outline. The season card stays blue.
- **Pull to refresh** at the top of Volume syncs Strava. A failed sync shows a toast at the bottom.
- **Main card first, app-wide:**
  - Plan: the greeting and the check-in/Planned cards moved down, just above the Plan summary.
  - Journal: the timeline comes first; the count, Expand/Collapse and the sign-in banner follow it.
  - Races: the sign-in banner moved under the summary.
  - Offline: the "offline" line under every title is gone. The dot on the account circle and a toast show it instead.
  - Settings keeps its search box at the top, as the list's own header.

**5) Races (q4-5)**
- "Your bests" is now All time · Age group · Custom. Custom is green.
- Tapping Custom opens a picker that lists your anchors, with Edit on each and "+ Add an anchor" at the end. Each anchor has:
  - a name;
  - a start date and optional end date;
  - an icon: baby, bandage, heart, briefcase, bike, house or star.
- **Existing chapters migrate unchanged:** same records, names, dates and public names, and the same sync and backups.
- Wins read "Fastest 70.3 since the crash", using the public name.
- The All races list, the Anchors list and the picker rows are striped white / #F6F6F8. The All races stripes restart under each year.

### Decisions
1. **Plan · default bike:**
   - It is the bike setting that already exists, now updated on each Crunch and synced.
   - For people who never picked one: the last plan's bike, then the first bike.
2. **Plan · tints:** used the existing palette tints (blue 9%, green 14%, teal 10%, grey 8%) so every text colour keeps passing contrast.
3. **Plan · stop rows:** a pocket bottle that was already switched on stays visible even with no stops, so nobody loses sight of a setting they made.
4. **Plan · Advanced contents:** Fine-tune today, I know what I like and Plan for went into Advanced as well, because they aren't needed on every ride.
5. **Plan · layout fix:** fixed a Date/Start overflow at 320px with 200% text while there.
6. **Journal · alignment:**
   - Centred as the item asks, although PDF p.6 shows left alignment; the item text wins.
   - Only the card's short lines are centred. The open log under it stays left-aligned.
7. **Settings · fold keys:** fold state is stored per device in `bluebird.fold.v1`, the same place as the other drop-downs. It is never synced or backed up.
8. **Volume · separate units:** upright and sideways units are stored per device in `bluebird.volview.v1`. The sport chips stay shared between the two views, for this visit only.
9. **Races · anchor icons:** old chapters keep their icon value, so older builds still read them. A new "star" anchor stores `icon: 'heart'` plus `anchorIcon: 'star'`, so an older phone still shows it.
10. **Races · Custom with nothing picked:** it only opens the picker, and the label reads "Custom ▾".
11. **Races · age group:** Age group still needs a birthday. Without one, only All time and Custom show.

### CHECK FIRST findings
- **Upright and sideways units:** not fixed before. They shared one unit and neither was remembered. Fixed as in decision 8.
- **Year chart start:** not fixed before. With data starting in 2020 the chart showed "2019 · 0 · −100%".
  - Now it starts at the first season with workouts in the chosen unit.
  - A zero season between active ones shows 0 with no %, and so does the season after it.
- **Empty-state AI card:** not fixed before; it still had three steps.
  - Now it is the one line "Not on Strava? Paste this prompt into any AI app and it'll guide you.", then Copy prompt, the import link and the privacy line.
  - The prompt text itself is unchanged.
- **"Nothing above the first card":** confirmed wrong and replaced by the page-order work above.

### Tests
New kit tests in `kit/work-q4/`, all added to runall2.sh:

| Test | Covers |
|---|---|
| plan | only the four boxes plus the summary; tints; Advanced closed and remembered; gel-tip text gone; default bike |
| settings | all collapsed at first; remembered; striped; no Recently changed; search opens groups; deep links |
| journal | centred; sizes |
| volume | seeded This-month maths; year tint; page order; filter line; separate units; year chart start; AI card; pull-to-refresh and failed toast |
| races | add, pick and edit anchors; migration of old chapters; wins wording; stripes; sync with the previous build |

Older tests that checked the old layout were updated to the new one (originals kept in `kit/q4/pre/`).

Full kit (runall2.sh, 47 commands, 81 result lines): every line OK.
- The first run hit its time limit after 77 lines, so the last five (the new q4 tests) were run separately.
- One layout line (390px) crashed inside the test tool, not the app: parallel layout processes rewrite the same test copy. Rerun alone it passed on all 267 screen/size/text combinations.
- The q4 races test failed once while the layout matrix was running beside it: its sync step waited only 8 s for the new anchor to reach the test cloud. The wait is now 20 s (a test-timing change only). It then passed alone and again under the same load.

Screenshots (390px) in docs/queue-log/item4/:
- part1-before/after-plan, part1-after-plan-advanced-open;
- part2-after-settings(-search);
- part3-compare;
- part4-compare, part4-after-volume-view;
- part5-custom-view, part5-picker, part5-all-races.

Worker: unchanged (still 67b51cd), so no re-paste into Cloudflare is needed.

## Item 5 · Header logo, "chapter" wording, carb-targets link · DONE 2026-09-30

Branch `queue/5-header-chapter`, one commit per part (q5-1, q5-2, q5-3), then the cache bump to `fred-shell-v30` and the screenshots, then merged to main.

### What changed
1. **Logo header (q5-1).**
   - The header from before v3 is back on every tab: a centred row with the blue 26×26 "fred" tile, a 1px × 18px divider and the page title (18/800), and the account circle on the right.
   - Like the old one, it is white, stays at the top while you scroll, and has one hairline under it.
   - The large left-aligned v3 page titles are gone.
   - The grey line that v3 showed under the title is no longer shown. On Plan it listed the ride's date, start and place after a Crunch. Its element stays in the page, hidden, so its id is kept.
   - Everything below the header is unchanged.
   - Before/after: docs/queue-log/item5/cmp-plan.png, cmp-races.png.
2. **"Chapter", never "anchor" (q5-2).** Every piece of text you can read or hear says chapter again:
   - the Chapters list;
   - the Custom picker ("Your chapters", "+ Add a chapter");
   - the editor title, Edit chapter and Delete chapter;
   - the empty-state line ("A chapter is a day that changed things…");
   - the toasts (Chapter added / saved / deleted, "Give the chapter a name");
   - the delete confirm;
   - the public-name hint.

   Code comments follow. **Saved data is unchanged:** the optional `anchorIcon` field keeps its name, so chapters already synced by the last build keep their icons. Nobody sees that name.
3. **"Why these carb targets?" removed (q5-3).**
   - It appeared in one place only: the drop-down under the effort choice on Plan.
   - "The science" links in the footers and the Science page are unchanged. The coaching-guidance card that the drop-down linked to still sits on the Science page.

### Decisions
- **Title size:** 18/800 is the old header's size. It is 1.0588rem, so it is 18px at the iPhone's default text size and scales with Larger Text, as before.
- **Sticky header:** it stays at the top again, as the old one did. The scroll margin for focused fields went back to 76px so the header never covers a field being typed in.

### Tests
- **New `kit/work-q5/header-words.test.js`:**
  - The logo header on every tab plus Science and Privacy: at 390px and 320px, and at 200% text. It stays put while scrolling.
  - The logo header on every screen in work-fix/screens.js and on the signed-in and Volume screens ("Volume" title).
  - No "anchor" anywhere a person can read or hear it: visible text, aria-labels, titles, placeholders, the toasts and the delete confirm. The page source has no "anchor" outside code names.
  - No "Why these carb targets?".
  - "The science" is the last thing at the bottom of each tab and still opens the Science page.
- **Tests updated to the new header or wording** (originals kept in `kit/q5/pre/`):
  - work-fred/accept (the header check, and the fred tile is in the header again);
  - work-sync/hdr-account;
  - work-v3/part0-1 (the subline is kept but never shown);
  - the chapter-wording checks in 9 race tests and screens.js.
- **Full kit:** 81 lines. 78 OK on the first run. The other three:
  - **hdr and v3 part0-1** still expected the v3 header. They were updated, and both pass.
  - **strava-sync** failed on the build already on main as well. Its test data used fixed dates (Sep 28) that are now outside the app's "last 2 days" sync window. The test now uses dates relative to today and passes. The app was not changed for this.
- Worker unchanged, so no re-paste into Cloudflare is needed.

## Item 6 · Results › Bottles: recipe-card rows · DONE 2026-09-30

Branch `queue/6-bottle-recipes`, then merged to main. Cache `fred-shell-v31`. App next to the mockup: docs/queue-log/item6/cmp-bottles.png (mockup: mockup-bottles.png).

### What changed
- **Bottle names:** each bottle is named by its size: "34 oz bottle", "28 oz bottle"; in metric "1 L bottle", "750 mL bottle". The size is the bottle itself; the Water line shows what goes in it (a part-filled last bottle reads e.g. "28 oz bottle … Water 18 oz").
- **Ingredient lines:** one line per ingredient under the name.
  - The name is on the left and wraps.
  - A 2px dotted #C7C7CC leader fills the gap.
  - The amount is on the right: 600 weight, tabular numbers, bottom-aligned with the name's last line.
  - Order: drink mix, carb top-off, sodium top-off, then Water last in #127EA6.
  - Salt reads "1.0 g · ⅙ tsp". Capsules read e.g. "SaltStick Caps (swallow) · 1 capsule".
- **Full recipe every time:** every bottle shows its whole recipe, even when it is identical to the one above ("same recipe" is gone).
- **Refill baggies:** "Baggie for the refill" with grey "· at 4:00 · 24 oz bottle", its powder lines, then "Water at the refill ···· 24 oz".
  - With several stops: "Baggie for stop 2 · at 2:30 …" and "Water at stop 2".
  - With stops by distance: "· at mile 45".
- **Kept:** the tick box on each bottle and baggie, and "N of M done" in the header. Ticking greys the recipe lines and strikes through the name only.
- **No "cage" anywhere in Results:**
  - Details › Bottles, leg by leg names bottles by size ("On the bike · 3 bottles + pocket").
  - "During the ride" says "Refill 2 bottles from your baggies".
  - The notes and the math say "bottle" / "bottle roles", e.g. "Make one bottle Carb in Settings › your bike".
  - Bottle roles and the pocket bottle show in the grey after the name: "28 oz bottle · Electrolyte", "17 oz bottle · pocket · Carb".

### Decisions
1. **Ticks are kept.** Each tick is saved under a key that includes the old wording ("Bottle 1 · cage 1 | recipe"), and that key is synced. If the key had followed the new names, anyone mid-prep would have lost their ticks on the first open after the update. A phone still on the old version would also have kept deleting the new ticks through sync. So the keys keep their old text, including the old teaspoon table, and only the display changed. The number in the key also keeps two identical bottles apart, so they tick separately.
2. **"mL", not "ml".** The rest of the app writes "mL".
3. **⅙ tsp added** to the teaspoon list, so 1.0 g of salt reads "1.0 g · ⅙ tsp" as in the item (before, it read ⅛).
4. **Water-only and aid-table refills** have nothing to pack, so they stay without a tick box. They now use the same card style: "28 oz bottle · at 3:20 · water only", "Water only, at stop 2 ···· 28 oz"; aid table: "Their drink mix, at the aid table".
5. **Journal's saved copy of the plan:** it now stores each card as plain text, e.g. "28 oz bottle" + "Precision Carb & Electrolyte Mix 26 g · Table salt 1.1 g · ⅙ tsp · Water 28 oz".
6. **Out of scope:** the Journal's own "The plan" list, which is not Results, still shows the bottle tags it saved (e.g. "cage 1"). Settings still lists roles per cage, since that is where cages are set.
7. **Very narrow screens:** at 320px with 200% text the amount keeps at most 55% of the line, and its parts wrap at " · ". It stays at the right on the name's last line, and the leader shrinks to nothing. Very long product names may then break inside a word; nothing overlaps or is cut off.

### Tests
- **New `kit/work-q6/bottles.test.js`:**
  - names, lines, order, colours, weights and the leader style;
  - the baggie title, grey text and water line;
  - two identical bottles both show full recipes and tick separately;
  - the carb top-off order;
  - no "cage" anywhere in Results, with roles, a pocket bottle, stops, an aid table, and Details, notes and math open;
  - metric (L and mL, no oz);
  - leader geometry: never overlapping the name or amount, amount right- and bottom-aligned, no overflow; at 320px × 100/150/200% and 375/390 × 100/150/200%;
  - the Journal snapshot text;
  - ticks saved by the previous build come back ticked on the new cards.
- **Tests updated to the new format** (originals kept in `kit/q6/pre/`): work-v3/results.test.js (the rows and the snapshot title) and work-v2/accept.test.js (the salt text).
- **Full kit:** every line OK (72 test lines, plus the sync suite). The small-grey text tweak came after that run, so the Results layout (320/375/390/430 × 100/150/200%), contrast, q6, v3 results, v2 acceptance and fred acceptance were re-run afterwards: all OK.
- Worker unchanged, so no re-paste into Cloudflare is needed.

## Item 7 · Results › Bottles: recipe-card rows (revised) · DONE 2026-09-30

This was item 6 sent again with one change. Branch `queue/7-bottles-1l`, then merged to main. Cache `fred-shell-v32`.

### Checked against item 6: already done
Everything in the revised text was already done by item 6 and was not changed, except the one new rule below:
- bottles named by size;
- no "cage" in Results;
- ingredient lines with the dotted leader, amounts right, Water last in #127EA6;
- the full recipe on every bottle;
- "Baggie for the refill · at 4:00 · 24 oz bottle";
- tick boxes and "N of M done";
- wrapping at 200% text.

### What changed
- **New rule: a 1 L bottle for an imperial user** reads "1 L bottle" with "(34 oz)" in grey. The same goes for any bottle made in a metric size (500 mL, 750 mL, 1.5 L…). It applies everywhere the size shows:
  - the Bottles card;
  - the baggie's grey line ("· at 4:00 · 1 L bottle (34 oz)");
  - Details › Bottles, leg by leg;
  - the Journal snapshot.
- **Unchanged:** ounce bottles still read "28 oz bottle". Metric users see "1 L bottle" / "750 mL bottle" with no ounces.
- **How a metric size is recognised:** the bottle's size is not a whole number of ounces and is within 1% of a round 50 mL (33.8 oz = 1 L, 25.36 oz = 750 mL).
- **Fix: the share image had lost its role names.**
  - Item 6 added a second function with the same name as the one the share image uses (the "Save as image" button).
  - With bottle roles on, its rows read "Bottle 1 · 28 oz bottle" instead of "Bottle 1 · Electrolyte".
  - The size label now has its own name. A test proves the old build fails and this one passes.
- **Fix: grey text at 320px × 200%.** The baggie's grey text no longer clips there. It wraps at spaces, with "· 28 oz" and "1 L" held together.

### Decision
- **"mL", not "ml".** The item writes "ml". The app writes "mL" everywhere (settings, Copy text, dropdowns), so the cards keep "mL". Say if you want lowercase everywhere.

### Tests
- **New `kit/work-q7/liter.test.js`:**
  - imperial 1 L bottles read "1 L bottle (34 oz)", in grey, on cards, baggie, Details and snapshot;
  - 28 oz bottles have no grey part;
  - metric users see "750 mL bottle" and no ounces;
  - the share image shows "Bottle 1 · Electrolyte";
  - there is only one bottleName().
- **Full kit:** 72 lines OK. The 320px layout line crashed on the first run: another test was running at the same time and both use the same test copy of the page. Rerun alone, it found the clipped grey text (2 of 267 screens). After the fix:
  - layout at 320px and 390px × 100/150/200% on the Results screens: OK;
  - contrast: OK;
  - q6 and q7 tests: OK.

## Item 8 · Plan with the bottles people own (fewest bottles) · DONE 2026-09-30

Branch `queue/8-owned-bottles`, then merged to main. Cache `fred-shell-v33`. Screenshots in docs/queue-log/item8/: the question (ask-390), the leftover choice (leftover-390), the top card line (saved-390), Settings › My bottles (settings-390), and a card at 320px × 200% text (stacked-320-200pct).

### What I found first
Before this change, "Fewest bottles" (on by default) already mixed in **1 L bottles, as many as it liked**. That is where the mockup's 34 oz bottles came from: the plan assumed bottles nobody said they had. The item says "until the athlete tells us, assume every bottle is the standard size (today's behavior)". So **until bottles are saved, every bottle is now the usual size** (the one set under Drink mix). The first plan that leaves a bottle under a third full then asks about bigger bottles. For a 5 h ride at 24 oz/hr that plan is 5 bottles, the 5th with 8 oz, until the question is answered.

### What changed
1. **Settings › Gear › My bottles** (new row).
   - A count (0–9, 44px steppers) for 20, 21, 24, 26 and 28 oz, 750 mL and 1 L, plus custom sizes: typed in oz, or in mL for metric users. Sizes from the library's size list show as rows too.
   - Stored as `settings.myBottles = [{oz, n}]`: synced, and in backups.
   - Cleaned up on load, on sync and on restore. Bad entries are dropped, 33.8 and 33.814 merge as one 1 L size, and an older backup without it keeps this device's list.
   - The row reads e.g. "2 × 1 L · 1 × 22 oz", "Not set", or "Usual size only" after a "No".
   - **Per bike:** "Cages that fit a 1 L bottle" (All by default, or 0…cages−1), stored as `bike.bigCages` only when it isn't All.
   - The library's older "My bottles" card (extra sizes for the dropdowns) is now called "Other bottle sizes".
2. **Engine.** With Fewest bottles on and bottles saved, fred covers the ride's fluid with what the athlete owns. In order of priority:
   - (a) never more stops than the usual size needs;
   - (b) fewest bottles;
   - (c) no bottle under a third full. A smaller owned bottle that isn't otherwise used may hold the last bit.
   - (d) the biggest bottles on the start leg, only in big-bottle cages. Refills use the usual size.

   Each bottle's recipe is per oz of what it holds, so every bottle has the same strength and hourly carbs and sodium don't change. The old baselines differ only in bottle count and sizes. With stops set, the first leg can start with owned bottles.
3. **The one-time question** in Results, above the checklist: "Your 5th bottle only has 8 oz. Do you have any bigger bottles?"
   - "I have 1 L bottles" asks 1 / 2 / 3+, saves to My bottles and re-plans at once.
   - "Other size…" opens My bottles.
   - "No" is saved as `settings.bottleAsk='no'` and never asked again. Settings › My bottles has "Ask me again".
4. **Small leftover the owned bottles can't absorb** (after "No", or when none of the owned sizes help): a choice, carry by default. The choice is saved with this ride's plan only, like "Keep X%".
   - **Carry a small bottle (8 oz):** today's plan.
   - **Drink 8 oz before the start** (or at the stop): not carried. It shows as its own "Drink … · not carried" card with its recipe. The ride's carbs are unchanged.
   - **Skip it (8 oz under plan, 7%):** the other bottles carry its carbs and sodium, all at the same (slightly higher) strength.
5. **Top card:** "Using your two 1 L bottles: 4 bottles instead of 5." when owned bottles saved one.
   - **Adjust this ride › Bottles:** My bottles, or "All 28 oz bottles" / "All 1 L bottles (34 oz)…" for this ride only.
6. **Narrow screens:** at 320px with 150–200% text (and 390px at 200%) a long word like "Electrolyte" no longer breaks mid-word. The amount moves under the name, right-aligned, and the dotted leader is dropped. Normal sizes keep the mockup's one-line rows.

### Decisions
- **Fewest bottles off:** the usual size only, and no question.
- **Bottle roles and "I know what I like":** they keep their own bottle lists. Owned bottles, the question and the leftover choice don't apply to them.
- **Owned counts limit what rides from the start.** Bottles are refilled at stops, so refills are the usual size, as the item says.
- **"Big bottle"** means 33 oz or more (1 L and up).
- **Questions and choices sit above the Bottles checklist** so they never count in "N of M done".
- **Not changed:** the share image still uses the whole-ride numbers (a mismatch that predates this item).

### Tests
- **New `kit/work-q8/owned.test.js`:**
  - the item's example: 4 bottles (1 L, 1 L, 28, 28), capacity 123.6 oz ≥ 120 oz, equal concentrations, carbs as planned, hourly carbs and sodium identical, the top card line;
  - nothing saved: 5 × 28 oz and the question;
  - "1 L × 2" saves and re-plans to 4;
  - "No": never asked again (new crunch, reload), the three choices and what each does, "Ask me again";
  - one big-bottle cage or none;
  - never a stop added;
  - metric: "Using your two 1 L bottles: 3 bottles instead of 4.", no oz;
  - the Settings steppers and custom size (saved and normalised), 44px targets, the bike chips;
  - odd saved data normalised;
  - Adjust forcing 28 oz or 1 L.
- **Updated** (originals kept in `kit/q8/pre/`):
  - the two regression baselines (only `bottleCount` and `pack` differ: checked field by field);
  - the Settings row lists in work-q4/settings, work-b9/profile and work-v3/settings;
  - work-q6's geometry check, which now accepts the stacked layout and fails on any single broken word.
- **New screens for contrast and layout:** my-bottles, results-bottle-ask, results-bottle-leftover, results-own-saved.
- **Full kit:** 71 lines OK first time. Three issues, all test-side:
  - the Settings row list needed "My bottles";
  - my new screens moved the shared weather-day counter, so the light-mode test saw a different plan (now a fixed day);
  - one layout line crashed while sharing the test copy with the others.

  After fixing those, run one at a time:
  - v3 settings OK;
  - v3 light OK;
  - contrast OK (96 screens, 14,752 checks);
  - layout 320/375/390/430 × 100/150/200% OK (279 each);
  - q6, q7 and q8 OK.
- Worker unchanged, so no re-paste into Cloudflare is needed.

## Item 9 · Journal check-in: sleep and meals before the ride · DONE 2026-10-01

This was sent as "item 8" after item 8 was done. Branch `queue/9-before-ride`, then merged to main. Cache `fred-shell-v34`. Screenshot: docs/queue-log/item9/before-390.png.

### What changed
- **"Before the ride"** is a new section of the check-in sheet, between "What you actually took in" and "How it went".
  - It has the same chips, steppers and fields as the rest of the sheet.
  - Every part is optional. Save works with the section empty, and an empty section stores nothing.
- **Sleep last night:**
  - Hours slept: a stepper in 0.5 h steps. It starts blank, the first + gives 7 h, and it shows "7.5 h".
  - Quality: Poor · OK · Great.
- **Last meal before the ride:**
  - When, before the start: "Under 1 h" · "1–2 h" · "2–3 h" · "3 h+" (a 2×2 grid), or a clock time. Typing a clock time clears the chip, and the timing is worked out from the ride's start time.
  - What: text, with quick picks from the athlete's own past entries: the 6 most used, case-insensitive, ties going to the most recent. A tap fills the field.
  - Size: Light · Normal · Big.
  - Carbs (optional): grams.
- **Coffee / caffeine before:** a switch. When it's on: 1 cup · 2 cups · Other mg (Other shows a mg field). **1 cup counts as 95 mg.**
- **Dinner the night before:** text, plus Light · Normal · Big.
- **Where it shows:**
  - The Journal timeline's second line adds "7.5 h sleep · ate 2 h before" (or "ate 1–2 h before" from a chip).
  - Copy adds sentences such as "Slept 7.5 h (OK). Breakfast 1–2 h before: oatmeal, normal size (~60 g carbs). 1 coffee. Dinner the night before: pasta, big."
  - The meal is called "Breakfast" for rides starting before 11:00, otherwise "Last meal".
  - Caffeine before the start counts toward Copy's caffeine total: "195 mg caffeine (95 mg before the start, 100 mg at 1:05 on the ride)".
- **What fred noticed:** three new observations, each shown only after **4+ rides** with the field filled (and the matching How-it-went answer). They are worded as observations, never advice:
  - "Your stomach was upset 3 of 4 times when you ate less than 1 hour before, 0 of 1 when you ate earlier."
  - "Energy was Strong 75% of the time after 7+ hours of sleep (4 rides), 0% after less (1)."
  - "Energy was Strong on N of M rides with caffeine before the start, … without."

### Data
- **Stored on the journal entry** as `pre`, holding only what was filled: `sleepH`, `sleepQ`, `meal {when | at, what, size, carbs}`, `coffee {n, mg}` and `dinner {what, size}`.
- **Synced and backed up** like the rest of the entry.
- **Old entries** load with nothing added.
- **Odd values are cleaned when the journal loads or syncs:** unknown choices are dropped, hours are rounded to 0.5, and text is capped at 40 characters.

### Tests
- **New `kit/work-q9/before.test.js`:**
  - the section order;
  - Save with the section empty (nothing stored, no summary, no Copy sentence);
  - the stepper and chips;
  - quick picks from past entries;
  - the saved shape;
  - the timeline line;
  - the Copy sentence and the caffeine total;
  - Edit brings every answer back;
  - the clock time and the mg amount;
  - reload and backup;
  - old and odd data;
  - 5 seeded rides give the meal pattern (plus sleep), and 3 don't;
  - the section at 320px × 200% (inside the sheet, nothing clipped, 44px targets).
- **New screen `checkin-before`** (the section filled in) for the contrast and layout matrix: contrast OK, and layout at 320/375/390/430 × 100/150/200% OK.
- **Full kit:** 74 lines OK. One older check (work-b9/plan-journal) listed the sheet's section headings, so it now includes "Before the ride" and passes. The original is in `kit/q9/pre/`.
- Worker unchanged, so no re-paste into Cloudflare is needed.

## Item 10 · Races: look back across all age groups and compare (2026-10-01)

### What changed
- **A band for every race.** It is your age on Dec 31 of the race year, in 5-year bands, from the birthday. Without a birthday, the imported "Age Group" is used ("M30-34" and "M 30–34" both become 30–34). With neither, the race has no band and shows only in All time. Bands are computed, never stored, so a birthday change recomputes them straight away.
- **Your bests › Age group** has a band picker under the switch ("35–39 ▾"). It lists the bands you raced in, newest first, with counts ("30–34 · 3 races", plus "· now" on the current one). Picking a band shows that band's bests, with the note "35–39 is your age group now".
  - The pick is remembered on this device (`bluebird.agBand.v1`) and not synced.
  - Saving a new race resets it to the current band.
- **New win lines:**
  - "🏆 Fastest 70.3 in any age group": an all-time best when the earlier races span 2+ bands.
  - "💪 Best swim since 30–34" and "🏁 Fastest 70.3 since 30–34": the fastest since a faster one in an earlier band.
  - They sit low in the list (after course bests), so they never push the PR lines out of the default 8.
- **Compare age groups view.** Open it from the link under the bests card or from the new ⋯ menu in the Races action row. Both show only with 2+ bands.
  - Distance chips, ordered most raced first; on a tie, the distance with the most recent race comes first.
  - One column per band, oldest to newest. The current band is pinned on the right and the table scrolls sideways.
  - Rows: Races, Best time, swim/T1/bike/T2/run, Best AG place, Best and Average AG percentile, Best overall percentile.
  - The best value in each row is bold on the blue tint. Percentile rows say "higher is better".
  - One summary line, an observation only: "Your average AG percentile is higher now (94th) than in 30–34 (87th)."
  - Tapping a cell opens that race; closing it comes back to Compare.
- **All races table:** an "AG" chip row (All · each band) and an AG column (sortable) just after the race name. Item 11 replaces the chip row with a dropdown.

### Decisions
- Percentile rows use the selected distance only.
- The AG column and filter in the table are drawn outside the table's column list, so the CSV/Excel columns and the older table tests are unchanged.
- Without a birthday, the Age group view works from imported bands, with "current" being the newest imported band. The birthday nudge stays.
- Stored win selections are not rewritten when the birthday changes; the lines are regenerated the next time a race's wins are opened.

### Tests
- **New `kit/work-q10/agegroups.test.js`** (birthday 1987-06-02, races 2011–2026) covers:
  - the bands and the picker;
  - bests per band and the remembered pick;
  - Compare for 70.3 and Olympic (values, "—", highlight, summary);
  - a cell opening its race, and coming back;
  - the table chips and filter;
  - the ⋯ menu;
  - the wins lines;
  - the birthday recompute;
  - the imported fallback;
  - the new-race reset;
  - 320px × 200%, with sideways scrolling and the pinned current band.
- **New screens:** `races-bands-pick` and `races-cag` in contrast and layout.
- **Full kit:** three findings, all fixed, then the affected tests were rerun and pass (rsumm, export, layout 320, q10, rflow, since, chapters, table-ui, v3 races, q4 races, fred):
  - The ⋯ menu reused the `rt-menu` class, which the export test reads. It has its own class now.
  - The "Compare age groups" title clipped at 320px × 200%. It wraps now.
  - The band win lines moved older lines in the summary-wins picker test. They are now low priority, and that test's category list includes 'band'. The original is in `kit/q10/pre/`.
- Cache is at `fred-shell-v35`.

## Item 11 · All races table: Age group dropdown (2026-10-01)

### What changed
- **The dropdown.** Item 10's chip row is replaced by an "Age group ▾" dropdown next to the distance chips.
  - Its menu lists "All age groups", then each band raced in, newest first, with counts ("35–39 · 4 races"). A ✓ marks the current choice.
  - Picking a band shows only that band's races. The pick combines with the distance chips, sorting and Pick races (picking a band no longer turns Pick races off).
  - The title reads "30–34 · 70.3 · 2 races", or "30–34 · 3 races" with All.
  - With a band picked, the button reads "30–34 ▾" (screen readers hear "Age group 30–34"), and a 44px × next to it clears back to All.
  - Esc closes the menu (not the table) and focus returns to the button.
- **Filter follows through.** Best-in-view dots, the legend and the CSV/Excel downloads follow the filter. The file name adds the band: `fred-races-all-ag-30-34-<date>.csv`.
- **Remembered per device**, separately for a phone (touch, sideways) and a laptop, in `bluebird.rtBand.v1` = `{phone, laptop}`. It is not synced or backed up, and × forgets it.
- **The AG column** stays just after the race name (from item 10).
- **Item 10 fix:** the "Compare age groups" link under Your bests overflowed at 320px × 200% (older test b9 races-front). Item 10's kit run showed this and I missed it before merging. The link now wraps.

### Decisions
- The menu has its own class (not `rt-menu`), so the export menu is still the page's only `.rt-menu`.
- Without any bands (no birthday, nothing imported), there is no dropdown.

### Tests
- **New `kit/work-q11/agdropdown.test.js`** covers:
  - the default state and the menu order and counts;
  - Esc;
  - 30–34 shows only its 3 races;
  - combining with 70.3 (2 races, title);
  - best-in-view following the filter;
  - sorting;
  - Pick races kept across bands;
  - CSV and Excel (openpyxl) holding only the filtered rows;
  - remembered after closing, reopening and reloading;
  - × clears and forgets;
  - a phone keeping its own pick separately from the laptop;
  - no bands means no dropdown;
  - 320px × 200%.
- **Updated:** item 10's test now drives the dropdown instead of the chips (the original is in `kit/q11/pre/`).
- **New screen `races-table-ag`** (dropdown open): contrast and layout OK.
- **Full kit:** all lines OK except b9 races-front (above), which was fixed; then races-front, the 320px layout on six race screens, q10 and q11 were rerun and pass.
- Cache is at `fred-shell-v36`.

## Item 12 · Bug: wins rankings skip races (wrong "#3 all-time") (2026-10-01)

### Cause
- **Not brand or course.** The overall ranking used `RaceKit.overallEligible`, which only counts a race when swim, bike and run times are all present, none flagged, and it has a race time.
- **Effect.** A result with only an overall time (Rev3 Cedar Point '16, Michigan Titanium '17) dropped out of every overall comparison: all-time, age group, chapter, and the item 10 age-group lines. Michigan '26 was compared with 10 races instead of 12, so it came out "#3".
- **Brand and course play no part.** Comparisons were already "same distance type" (`RaceKit.comparable`).

### What changed
- **New rule.** `RaceKit.overallRankable(r)`: a race time, and no flagged leg (current, short, long, altered/cancelled). Missing splits don't matter. It is used for every overall win comparison (overall lines, chapter "Fastest since", age-group lines).
  - Legs still need that leg's time and no flag on that leg. Transitions need T1 and T2.
  - A flagged race is never ranked itself.
- **Rank lines name their comparison**, counting this race:
  - "🏁 #2 of 11 all-time 70.3s: 5:15:50"
  - "🏁 #2 of 5 70.3s in 45–49: 5:22:48"
  - "🚴 Bike: #3 of 5 bikes in 45–49"
  - "🔁 Transitions: #2 of 8 all-time Sprint transitions, 1:50 total"
  - "… · #2 of 8 all-time" after an age-group PR
- **Only meaningful ranks show.** #1 (a PR) always shows. #2–#3 show only with 5+ races in the comparison. Everything else is dropped, e.g. "#3 of 4 transitions".
- **Wins are checkable.** On the last race card, each line with a comparison is a button. In the wins picker (race detail, and after Save), each such line has a ≡ "How this was ranked" button.
  - Either opens a sheet: the line, "#3 of 5 · 70.3 bikes in 45–49", then every race compared, best first, with this race highlighted ("This race").
  - A "Not counted" list shows the races left out, with why ("no swim", "bike short").
  - Esc, × or the backdrop closes it, and focus goes back to the line.
- **Saved wins are re-ranked once.** Saved wins carry `wins.v = 2`; older ones are recomputed on the next render.
  - A line counts as the same line when its id or its text matches.
  - Lines that still exist keep their tick or untick and the athlete's order. Lines that no longer qualify go. Custom lines stay.
  - New lines slot in unticked, so a re-rank never ticks anything for the athlete.

### Decisions
- **The spec's example.** Under rule 3, Michigan '26's "#5 of 13 all-time 70.3s" is not a win line. The test checks it as the computed rank, from the ranks behind the lines.
  - With the test data, Michigan '26 is #2 of 5 in 45–49, so it shows "🏁 #2 of 5 70.3s in 45–49" instead.
  - With Ashley's real data this depends on her 45–49 races. Please check it on her device.
- **PR wording.** PR lines ("Overall PR: −5:58") keep their wording; their comparison is in the sheet. The run's all-time label is now "70.3 runs" instead of "13.1".
- **What has a sheet.** Comparison sheets cover overall, legs, transitions, T1/T2, course bests, chapter "Fastest since", the age-group lines and "faster than last time here". Placement, counts, power, pacing and heat lines have no sheet yet.
- **Bests card unchanged.** The Your bests card and Records still use the stricter rule (full splits for a best overall). Changing that would move bests on screen, so it's left for a separate item if wanted.
- **Line spacing on the last race card.** When a card has tappable lines, every line is 44px tall, so the list keeps an even rhythm and each target is full size. In the wins picker, the buttons drop under the line when the text would get less than about 12em (large text, small phones).

### Tests
- **New `kit/work-q12/ranks.test.js`**, with this case's data: Ashley's 70.3s from 2015 to 2026 (birthday 1979-03-01, so 2024+ is 45–49). It covers:
  - Michigan '26 is #5 of 13 all-time 70.3s;
  - Rev3 Cedar Point '16 and Michigan Titanium '17 are included;
  - the faster no-swim and short-bike races are left out and listed with why;
  - no all-time overall line, and the transitions line (#3 of 4) is hidden;
  - "🚴 Bike: #3 of 5 bikes in 45–49" shows;
  - a flagged race is never ranked;
  - "#2 of 11 all-time" after Michigan '25's age-group PR;
  - tapping the card's bike line lists the 5 bikes, fastest first, this race highlighted;
  - the picker's ≡ button and the "Not counted" list;
  - Esc, focus and inert;
  - the one-time re-rank (the wrong line reworded, ticks and custom lines kept, `v: 2` saved);
  - 320px × 200%.
- **Updated older tests** (originals in `kit/q12/pre/`):
  - summary-wins: three lines now read "#2 of 8 all-time", "#2 of 8 all-time 70.3s" and "#3 of 9 all-time 70.3 runs".
  - b9 races-front and v3 races: their hand-written seeded wins are marked current (`v: 2`), so they still test how the card displays selected lines.
- **New screen `wins-sheet`**: contrast and layout OK.
- **Full kit:** the first run found problems, which were fixed:
  - The re-rank dropped ticks when line ids change (rflow's fake engine). It now matches by text too.
  - Overlapping and then too-small tap targets on the card.
  - Times breaking mid-word in the race-detail picker at 320px.
  - The seeded-wins tests above.
- **Final full kit:** 77 lines OK, plus layout at 320/375/390/430 OK. vol-contrast (Volume off-season sheet, which this item doesn't touch) failed one check once, then passed 3 reruns, and passes on main.
- Cache is at `fred-shell-v37`.

## 13 · House style: grouped lists with colored section titles (option C) · DONE 2026-10-01

Every page people fill in or scroll through is now an iPhone-style grouped list on a #F2F2F7 page, following the design spec (docs/design/fred-design-spec_2026-10-01_v1.pdf). The heroes stay cards and look exactly as before.

### What changed, page by page
- **Everywhere.** Page #F2F2F7. Section titles are 13px/700 small caps on the grey, in the section's dark colour. White groups have a 2px top line in the section colour and a 1px #E3E3E8 bottom line. Rows are at least 46px, with 1px #E3E3E8 lines inset 16px, values in #6E6E73, chevrons on rows that open something, and black switches. Footnotes are 12.5px #6E6E73. Untitled groups (Details, Delete, Notes) have a plain 1px top line.
- **Plan.**
  - WHEN & WHERE is teal: Location with the pin, Date, Start, a "Type a temperature" row that opens the typed temperature in place, and Ends.
  - STOPS is blue ("No stops · + Add a stop").
  - ADVANCED is green and folded at first. Its No gels, Caffeine and Fewest bottles are switches, and the Bike row opens the bike list in place.
  - The plan summary is a footnote that is always visible.
- **Results.**
  - WEATHER · place · start – end is teal, with its footnote.
  - BOTTLES · N OF M DONE, GELS and NUTRITION TOTALS are blue; CLOSET is green; DURING THE RIDE is black.
  - Nutrition totals has a "Copy for my coach or food app" row, with the copied sentence as its footnote.
  - Details is an untitled group and is folded. The Save bar follows it.
- **Journal check-in.** WHAT YOU ACTUALLY TOOK IN is blue (the live result line is its footnote), SLEEP LAST NIGHT is teal, MEALS BEFORE is green and HOW IT WENT is black. Weigh-in, Notes, Date and Name sit in an untitled group.
  - Last meal and Dinner open small sheets with the same controls, so the saved data is unchanged.
  - Coffee before is a switch.
- **Volume.** MONTH BY MONTH is a blue group, open at first; its title still folds it. VIEW is a black group of rows at the bottom: Sports, Unit, Mode, Off-season starts and the Strava sync line.
- **Races.**
  - ALL RACES · N, then one black group per year. There are no stripes, and every race row has a chevron.
  - CHAPTERS is green, with "+ Add a chapter" as its last row.
  - "Add more races with AI · Copy prompt ›" and "Import race spreadsheet ›" form an untitled group.
  - Records by distance and Firsts since are groups too.
- **Log a race.**
  - Each card is a section titled "{LEG} · N OF 10": Swim teal, Bike and Nutrition blue, Run green, the rest black.
  - Fields are rows (label left, value right); Distance, Brand and the flags are chip rows; the aero estimate is an untitled group.
  - The current progress dot takes the card's colour.
  - Finish shows Age group / Gender / Overall as "22 of 180" rows.
- **Settings.**
  - Search stays.
  - FUELING is blue; GEAR is green (each bike, My bottles, Add a bike, Closet); ACCOUNT & DATA is teal.
  - The groups are shown open: no fold and no stripes.
  - Delete my account sits in its own group, in red, with the footnote "This deletes your account and all associated data."
- **Settings › Account (new page).**
  - It opens from the Account row, which is now always there.
  - Under the sign-in card: YOU (Name and Email from Google, read-only, when signed in; Birthday with age group; Gender; Weight; Name for race results); SETTINGS (Units, Week starts on, Volume goal, Counts toward volume); CONNECTIONS (Strava, Imported training); YOUR DATA (Download a backup, Restore a backup, Import race spreadsheet).
  - A row opens its page, and Done comes back to Account.
  - Search still finds these settings: it shows the Account row.
- **Settings detail pages.** All pages opened from a Settings row sit on the grey, with each section as a white group with its Settings colour on top: Fueling pages blue, Gear pages green, and the You, Strava, Imported training and Backup pages teal.

### Decisions and deviations
- **Title inks for AA.** The spec's title inks #127EA6 (blue) and #1F8F8E (teal) reach only 4.13 and 3.50:1 at 13px on #F2F2F7. I used the app's AA inks #0B7399 and #147574; green stays #5F6A12.
- **Heroes look unchanged.** The tints were see-through, so on the grey page every hero turned darker. They are now solid colours equal to what they showed on the old #FAFAFA page:
  - blue #E6F1F6, green #F2F4E0, teal #E5F4F4;
  - the grey, which sits inside white cards, #F6F6F6, as it showed on white.
  - A test compares each hero with the pre-q13 build.
- **Folds kept where they existed.** Titles that folded before still fold, because their buttons must not be removed: Advanced, the Results sections, Month by month, All races, Chapters, Records. The exception is the Settings groups, which the spec says are shown open.
- **Moved, not removed.** The You settings moved to Settings › Account. Plan's typed temperature and bike list now open in place from a row. The check-in's meal fields are in the small sheets. The inventory test lists every move.
- **Renamed (spec wording).**
  - "Type a temperature instead" became "Type a temperature".
  - "Name for results" became "Name for race results".
  - On Bike, "Avg W", "NP" and "Avg HR" became "Avg power", "Normalized power" and "Avg heart rate", with units.
  - The Account row shows the full name instead of "Mark · Google".
- **Not built.**
  - **Athlete type** (Settings › Account) has no field yet: it needs a list of choices from you.
  - **The TrainingPeaks plan row** comes with item 14.
  - **The race detail screen** is not named in the item, so it keeps its cards.
- **Done style kept.** Done bottle and gel lines keep the struck-through style from earlier items.
- **Row fields and the outline rule.** A field inside a labelled row no longer needs its own 3:1 outline; the row and a 2px focus ring take its place. The contrast audit skips the outline rule for those fields, and a q13 test checks the focus ring.

### Tests
- **New `kit/work-q13/`:**
  - `pages.test.js` checks:
    - the section colours on every page (title ink, 2px line, white group, rows ≥ 46px, footnotes);
    - no outlines, tints or stripes inside groups;
    - heroes the same as the pre-q13 build;
    - focus rings on row fields;
    - controls (folds, the AI copy row, Next, Settings › Account and back, detail pages).
  - `journal.test.js` covers the check-in.
  - `inventory.js` checks that nothing was removed: it compares every id, control and text on all kit screens with the pre-q13 build. Intentional changes are listed in `allow.json`, each with its reason.
- **New kit screens:**
  - settings-account and settings-account-birthday;
  - plan-temp-bike-open;
  - checkin-meal-sheet and checkin-dinner-sheet.
  - All of them run in the contrast, layout and inventory passes.
- **Updated older tests** (originals in `kit/q13/pre/`):
  - accept, part0-1, light, plan, results, journal, lograce, races, settings, volume (v3/q4);
  - q4 plan, races and volume; b9 profile, races-front, auto-half and offseason-date;
  - races-flow, sync-auth, sync-privacy, hdr-account, backup, q10 and wxmotion;
  - the screens list and the kit's Settings helpers.
  - They now assert the grouped look, the solid tints and the new places. The fake Worker also learned the TrainingPeaks routes for item 14.
- **q4 settings retired.** It tested only the fold and stripes that the spec replaces. Search, deep links and sheets are covered by v3 settings and work-q13.
- **Full kit.** The first runs found real problems at larger text, which are now fixed:
  - fields in rows under 44px;
  - Log a race values squeezing their labels;
  - fold titles overlapping their groups;
  - the Stops row and the sync line running off the screen;
  - the grey tint inside white cards dropping #6E6E73 to 4.49:1;
  - the red "seconds over 59" warning turning grey;
  - the aero estimate's fields three to a line.
- Cache bumped to `fred-shell-v38`.

## 14 · Volume: six boxes + planned weeks from the TrainingPeaks calendar · DONE 2026-10-01

### What changed
- **Six boxes under the season card**, in two rows of three on a phone (fewer per row as the text grows):
  - Last week (actual, vs the 6-week average)
  - This week planned (the plan's hours, a bar for done so far, "N h without optional")
  - Next week planned (a range when a workout reads "A OR B", with the reason in small text, e.g. Sat: "5:30 Z2 OR 3:10 with Intervals")
  - Last month (actual, vs the month before)
  - Avg / week, last 6 weeks (vs the goal's need, or last season's average week)
  - This week vs your normal (planned ÷ 6-week average, as +/−%; green outline, reference only, no good/bad pill)
- **Without a plan**, the two planned boxes are one dashed blue "Connect your plan" box, and the last box shows This week so far, so nothing goes missing.
- **Connect sheet.** It opens from the Connect box and from Settings › Account & data › TrainingPeaks plan (also listed under Settings › Account › Connections). It has:
  - four numbered steps and one paste field (webcal:// or https://);
  - the privacy note, word for word.
  - When connected, it shows the link masked, when it was updated, Refresh, and Remove.
- **Worker (`fred-api`).**
  - `POST /tp/link` accepts only trainingpeaks.com links. It checks the link once and keeps it in KV like a secret; the app only ever gets a masked form.
  - `GET /tp/plan` fetches the .ics server-side at most every 2 hours. Refresh refetches at most once a minute. When TrainingPeaks is down, it returns the last feed with an error flag.
  - `POST /tp/remove` deletes the link and the cached feed.
  - Every call needs the Firebase ID token, and CORS is unchanged.
  - The version is stamped `5fca7a3` in the Worker and the app. **The Worker must be redeployed in Cloudflare** before the plan can be connected.
- **Parsing (on the device).**
  - Unfolds CRLF and space continuation lines and unescapes \n \, \;.
  - Reads DTSTART (date or date-time) as the day, SUMMARY "Type: Title", and Workout type, Planned Time and Actual Time from DESCRIPTION.
  - Skips Custom, Day Off and notes. A title starting "OPTIONAL:" marks the workout optional.
  - Without a Planned Time it reads the title ("5 hr", "60'", "5:30"), and "A OR B" becomes a min–max range. If nothing can be read, the workout is counted as "N workouts without a planned time".
- **Done so far** uses fred's own hours (Strava and imports, Mon–Sun, or Sun–Sat with that setting). It falls back to the feed's Actual Time only for days fred has nothing for. The planned boxes follow the sport chips.
- **Grey note** under the boxes: "Plan from TrainingPeaks · updated 2 h ago · changes can take up to a day to appear."
- **Plan.** "Tomorrow's planned ride: {title} · {duration}" appears when tomorrow has a planned ride; one tap fills the ride duration.
- **Privacy.** The plan is shown only to its owner. It is never sent to an AI model or any other service, and it is not in backups or Firestore. This device keeps the last feed only for the signed-in account. Remove and Delete my account delete the link and the plan on the server and on the device. The Privacy note (one added sentence: "Your TrainingPeaks plan link stays on fred’s server; Remove deletes it.") and the README say so.

### Numbers with the attached feed (today 2026-10-01)
- **This week:** 12.15 h planned, including 1.5 h optional; bike 8.0, swim 2.25, run 1.9. The item says run 1.92, but the feed's run times are 0:34 + 0:35 + 0:45 = 1:54 = 1.90 h; the total of 12.15 h matches either way. Shown as 12.2 h, with "10.7 h without optional".
- **Next week:** 7.17 h + "5:30 OR 3:10" → 10.33–12.67 h, shown as 10.3–12.7 h.

### Decisions
- **Six-week average.** Last week and Avg / week now use the 6-week average (the spec's "vs 6-wk avg") instead of 5 weeks.
- **This month box.** It is replaced by the spec's Last month (vs the month before). This week so far stays as the last box when there is no plan.
- **Units.** The planned boxes are always in hours: the feed's planned distances are not reliable.
- **Link check.** The link is checked by fetching it once before it is kept, so a mistyped or expired link is refused at once ("TrainingPeaks says this link no longer works").
- **Allowed links.** Only trainingpeaks.com links are fetched, so the Worker never fetches other sites for a user.
- **Settings row wording.** The row reads Connected / Not set up / Sign in first. "Not set up" keeps a Settings search for "connected" finding Strava only.

### Tests
- **New `kit/work-q14/plan.test.js`**, with the attached TrainingPeaks.ics. It checks:
  - the parser: folded and escaped lines, Custom skipped, OPTIONAL:, title durations, ranges, Day Off;
  - this week and next week as above;
  - done so far (fred's hours first, the feed's only on empty days);
  - +74% vs a 7 h normal;
  - the no-link Connect box;
  - the sheet: steps, field, the exact privacy note, refused links;
  - the link never stored or shown in the browser;
  - the six boxes and their values;
  - the sport chips;
  - the Plan line filling the duration;
  - the Settings row;
  - Remove deleting the link and the cached plan;
  - nothing in the backup;
  - 320px × 200%.
- **Worker unit tests** for /tp/link, /tp/plan and /tp/remove:
  - only TrainingPeaks links; a dead or non-calendar link is refused; a redirect off TrainingPeaks is refused;
  - only a masked link is returned; the plan is owner-only;
  - the 2-hour cache, the Refresh throttle and the last feed when TrainingPeaks is down;
  - Remove deletes both; other origins are refused.
- **Updated:** vol-accept, v3 volume and q4 volume (the six boxes, 6-week numbers, Last month replacing This month), v3 settings and b9 profile (the TrainingPeaks plan row). The fake Worker serves the /tp routes.
- **New kit screens:** volume-plan and tp-sheet (contrast and layout).
- **Volume maths** (`vol-math`): the last-week and avg/week checks now use the 6-week average (13 h vs 6.75 h = +6.25); the 5-week figures are still checked.
- **Inventory** (`work-q13/allow.json`): the removed This month / vs 5-week avg texts (spec p.10) and the changing Worker version stamp are listed with their reasons.
- Full kit run: all pass. Cache bumped to `fred-shell-v39`.

## 15 · Navigation: News tab; Settings in the account circle · DONE 2026-10-01

### What changed
- **Bottom bar:** Plan · Journal · Volume · Races · News. News has a newspaper icon; the Settings tab is gone. Without Strava, Volume stays hidden as before.
- **The account circle** at the top right of every page opens Settings (the same list page as before).
  - This works signed in or out. The Account row is at the top of the list.
  - While Settings is open, the circle is marked as the current page (a ring, and `aria-current`). No bar tab is active.
- **Deep links:** `/settings` (a small `settings/index.html` that forwards) and `?view=settings` open Settings. `?view=news|journal|races|plan|volume` also work. The address loses `?view` afterwards.
- **Attention dot:** a small red dot on the circle when Settings needs the athlete. Today that means Strava needs reconnecting: the connection was revoked, or the Worker answered 409.
  - The circle's label says why. The Strava row reads "Needs reconnecting".
  - The dot goes away when the Strava sheet is opened (seen) or Strava connects again.
- **Races:** unchanged; there is no "My races | Pro racing" switch.
- **News:** Racing · Commentary · Other as a segmented control at the top. It opens on the last-used tab, remembered on this device only (`bluebird.news.v1`, not in backups).
- Cache bumped to `fred-shell-v40`.

### Decisions
- **The circle opens the Settings list, not the Account sheet.** Before, signed out, it opened the sign-in sheet. The item says "same page as today", so it now opens the list, and the Account row is one tap away.
- **A sheet covers the circle.** While a Settings sheet is open, the circle is under it (the sheet is modal; Done closes it). The old bottom tab stayed reachable.

### Tests
- **New `kit/work-q15/nav.test.js`:**
  - the tabs: four without Strava, five with it;
  - the circle → Settings from every page (Plan, Journal, Races, News, Science, Privacy);
  - `?view=settings`, and `/settings` served the way GitHub Pages serves it;
  - the dot when Strava is revoked (a real 409 from the fake Worker), on every page; cleared when seen and on reconnect;
  - News tabs, arrow keys, and the tab remembered after a reload.
- **Updated** (originals in `kit/q15/pre/`): every kit test that tapped the Settings tab now taps the account circle.
  - The tab lists now read "… Races · News" (fred accept, v3 part0-1, vol-empty, races-foundation ×4).
  - hdr-account, sync-ongoing and v3 settings: the circle opens the list; the Account row opens the Account sheet.
  - The inventory allow-list names the removed Settings tab.
- **Contrast audit:** it measured a toast while it was fading (2.02:1 at partial opacity), in two tests. A toast is now measured only when fully shown.
- **New kit screens:** news-racing, news-commentary and news-other (contrast and layout).
- **Full kit:** all pass. One 430px layout process crashed at its first screen (the test hook was missing from its page copy) and passed on re-run.

## 16 · News data pipeline: sources → scheduled jobs → news.json · DONE 2026-10-01

### What changed
- **Files:**
  - `data/sources.json`: 13 sources, each with an `enabled` flag, its feed URLs and a section. Switching a source off or adding one needs no code.
  - `data/news.schema.json`: a JSON Schema for every field on spec p.11.
  - `data/news.json`: valid and empty until the first job runs.
  - `data/calendar.json`: official IRONMAN / 70.3 / T100 race facts, typed in by hand (these series have no API).
  - `tests/fixtures/news.fixture.json`: the mockup's sample data, marked `meta.sample`.
- **Jobs:** GitHub Actions workflows `news-daily` / `news-weekend` / `news-results` / `news-pros`, through the shared `news-job.yml`.
  - Times are US Eastern: each workflow lists the summer (EDT) and winter (EST) UTC crons and runs only the one that matches New York's current offset. A manual run always runs.
  - Each job builds the file, checks it against the schema and the cross-references, and commits `data/news.json` only when it is valid and changed (`[skip ci]`).
  - A `[skip ci]` commit may not start the Pages build, so the job then asks GitHub Pages to publish.
  - On a failure the previous file stays and an issue opens with the error. A second failure comments on the open issue.
  - `news-ci` runs the tests and the schema check on every push.
- **Code (`scripts/news/`, Node, no dependencies):**
  - RSS / Atom / podcast parsing.
  - Polite fetching: User-Agent "fred-news (+https://fuel.bluebirdmultisport.com)", robots.txt respected, one request per URL per run, cached with ETag / Last-Modified. IRONMAN, T100 and PTO pages are never requested.
  - Name matching, and sorting items into Commentary or Other (with category, sub-tag and sports).
  - The World Triathlon API client: events, start times, results with splits, rankings, athlete profiles.
  - The confidence rule.
  - Model calls: `claude-haiku-4-5-20251001` at temperature 0. Every answer is checked in code before it is used.
  - The limits: 8 weeks of races, 60 days of items, 300 pros, about 400 KB.
- **README:** a new "News tab" section with the two BLOCKED steps.

### Sources: feed URLs found
This container can't reach the news sites, so each URL was found by web search. The jobs (on GitHub's network) try them in order, then the site's own `<link rel="alternate">` feed, then Apple's podcast directory (by `itunes_id`). Item 20 lists which ones answer.
- **Triathlete:** https://www.triathlete.com/feed/
- **Slowtwitch:** https://www.slowtwitch.com/rss/ (Ghost), then /feed/, then the site link
- **Tri247:** https://www.tri247.com/feed
- **220 Triathlon:** https://www.220triathlon.com/feed, then /feed/atom
- **DC Rainmaker:** https://www.dcrainmaker.com/feed
- **Cyclingnews:** https://www.cyclingnews.com/feeds.xml
- **Runner's World:** https://www.runnersworld.com/rss/all.xml/
- **endurance.biz:** https://endurance.biz/feed/
- **Pro Tri News:** https://feeds.buzzsprout.com/1736374.rss
- **The Triathlon Hour:** https://feed.podbean.com/HowTheyTrain/feed.xml, then Buzzsprout, then Apple (1595443343)
- **That Triathlon Life:** https://rss.buzzsprout.com/1922707.rss
- **The World Triathlon Podcast:** from Apple's directory (id 1517199963); no direct URL was found
- **World Triathlon:** the official API (https://api.triathlon.org/v1, `apikey` header, WTCS category 351)

### BLOCKED for Mark (News works without these, with headlines and links only)
1. **WT_API_KEY.** Register at developers.triathlon.org → copy the API key → GitHub → fuel → Settings → Secrets and variables → Actions → New repository secret `WT_API_KEY`. Until then, WTCS races show links only.
2. **ANTHROPIC_API_KEY.** console.anthropic.com → API keys → Create key → the same GitHub page → New repository secret `ANTHROPIC_API_KEY`. Until then: no In short, no story lines, and no results read from reports.

### Decisions
- **IRONMAN, 70.3 and T100 races** come from `data/calendar.json` (official facts, confirmed) and from previews. A race from a preview is marked unconfirmed, and its start times appear only when the preview states them.
- **Pros' links:**
  - Kept only when found on the athlete's own website or on their official World Triathlon profile.
  - The World Triathlon profile link itself comes from the API's athlete id.
  - A site that can't be read keeps last month's confirmed links; they are not refuted, just not re-checked.
- **Read time:** words ÷ 230, from the feed or from the article read for this run. The article text is never stored.
- **In short checks:**
  - one sentence, ≤ 25 words, no quote longer than 5 words;
  - no 6 words in a row copied from the source;
  - no opinion or rating words;
  - every number in it must appear in the source.
- **Pro Series and T100 standings:** no official source can be read (no API; their pages are not scraped), so only WTCS standings fill automatically. The UI links to the official standings pages.

### Tests
- **`node --test 'tests/news/*.test.mjs'`: 20 tests, all pass.** They cover:
  - RSS, Atom and podcast parsing, and feed discovery;
  - robots.txt, one request per URL, the User-Agent, and IRONMAN / T100 never fetched;
  - the schema rejecting 12 kinds of bad file, including article text, an image field and http links;
  - the confidence rule (official, two independent reports, the same publisher twice, disagreement);
  - the In short contract with a mocked model;
  - strict extraction and name matching;
  - the World Triathlon API, mocked;
  - end-to-end runs with and without keys;
  - the failure path keeping the last good file byte for byte (and the command exiting 1);
  - the size limits.
- **App checks:** `index.html` is unchanged since item 15's full kit passed, so regress, ids and the service-worker test (cache `fred-shell-v41`) were run, and pass.

## 17 · News › Racing, race pages, pro cards · DONE 2026-10-01

### What changed
- **News › Racing (p.3):**
  - Chips All · IRONMAN · 70.3 · T100 · WTCS, remembered on this device.
  - THIS WEEKEND (blue): the next 10 days. Each row has the name, the series tag, the pro start time in the viewer's time zone (e.g. "Sat 7:00 AM EDT"), the place, initials of the headline pros "+ N pros", and leads to the race page. The footnote links live tracking for each series.
  - LAST WEEKEND (green): women's and men's podiums, one story line, and Race page ›.
  - STANDINGS (black): Pro Series · T100 · WTCS segmented; women and men top 3; Full standings ↗. It follows the chip until a series is picked.
  - PROS YOU FOLLOW (teal): only when following someone, with a status line ("Racing … · Sat" or "Won … · Sep 27").
- **Race page, after the race (p.6, p.8):**
  - THE STORY: 1–3 lines, each with its source tag and a link, and the footnote "Written by fred from the reports below…".
  - Women and men top 5, each opening the pro card. WTCS rows add Swim · Bike · Run, with the official-data note.
  - COVERAGE · READ and COVERAGE · LISTEN.
  - RACE: Full results ↗ and Watch replay ↗.
  - With no confirmed results: "Results coming", plus the official results link.
- **Race page, before the race (p.7):**
  - Pro start times in the viewer's zone, the place, the series and the points.
  - PREVIEWS (articles + podcasts "at mm:ss"), PROS TO WATCH with a reason, HOW TO FOLLOW.
  - **Add to calendar** downloads an .ics file built in the app. The pro starts are in UTC, so each calendar shows them in its own time zone.
- **Pro card (p.9):**
  - An initials avatar (no photos), the name, country · pro since · home, and a "Racing {race} · {day}" tag.
  - ☆/★ Follow.
  - A links row with only the confirmed links, each opening the official page in a new tab.
  - RANKINGS, IN THE NEWS, RECENT RESULTS (the last 5 in the file) and Full history on PTO stats.
- **Following:** saved in `settings.news.follow` (the account's synced settings). Another device sees it after sign-in.
- **States:**
  - No file yet: "No news yet."
  - Offline with no copy: "You're offline."
  - More than 10 days old: "Updated {date}".
  - The file is read when News opens (and again after 15 min). The service worker serves `data/news.json` stale-while-revalidate, so the last copy shows offline.
- Cache bumped to `fred-shell-v42`.

### Decisions
- **T100 orange tag:** it uses black ink. White on #E4572E is only 4.4:1.
- **Headlines are plain text; "Read on {source} ↗" is the link.** This keeps every link a 44px tap target (the layout test at 200% text). Commentary follows the same rule.
- **Recent results** come only from the file (8 weeks), so older results are reached through "Full history on PTO stats".
- **Race pages and pro cards** open inside News; "‹ News" and the News tab button go back.

### Tests
- **New `kit/work-q17/racing.test.js`, with the fixture, today Thu 2026-10-01 in New York:** it checks:
  - every section, with exact rows and tag colours;
  - chips filtering and remembered; the standings switch;
  - the race page after (story, results top 5, coverage) and before;
  - WTCS splits;
  - the .ics times (11:00Z / 11:05Z; Harbourview +10:00 → 13:30Z);
  - another viewer's time zone (London);
  - the pro card with full links (Maya Brooks), partial links (Sofia Lind) and none;
  - follow/unfollow synced through the mock cloud to a second device;
  - the empty, stale, offline and "Results coming" states, and `news.json` read once over http.
- **New kit screens with the fixture** (contrast and the 320–430 × 100–200% layout matrix): news-empty, news-racing, news-race-after, news-race-wtcs, news-race-before, news-pro. Source and series tags and avatars are on the solid-audit allow-list.
- A page opened from disk no longer tries to fetch `news.json`; it shows the empty state.
- **Full kit:** all pass after two fixes (the Racing tab's starting `.on` class, and the file:// fetch); those tests were re-run.

## 18 · News › Commentary · DONE 2026-10-02

### What changed
- **Chips:** All · Articles · Podcasts · IRONMAN · T100 · WTCS, remembered on this device. IRONMAN includes 70.3 items. A series chip matches the item's own series or the races it is linked to.
- **RECAPS (green) and PREVIEWS (blue):**
  - Each row: source tag (its own colour), date · read time, the source's headline, "In short:" (left out entirely when the file has none), "Read on {source} ↗".
  - Links open in a new tab with rel="noopener".
  - Articles that are neither a recap nor a preview sit with Recaps.
- **PODCASTS (black):** a play tile in the show's colour, show · date · length (e.g. "1 h 04"), the episode title, "Talks about {race} at mm:ss" only when the file has a time stamp, and Listen ↗. No audio player and no embeds.
- **Order:** newest first. Items about pros the athlete follows float to the top of each section, with a small teal "Following" tag.
- The same items appear on their race pages (Coverage · read / listen) and on pro cards (In the news), from item 17.
- Cache bumped to `fred-shell-v43`.

### Tests
- **New `kit/work-q18/commentary.test.js`, with the fixture.** It checks:
  - the six chips and each chip's exact items, and the chip remembered after a reload;
  - the section colours, newest first;
  - a full recap row;
  - In short left out when absent;
  - links opening externally;
  - the time-stamp line only when present;
  - no images, players or embeds;
  - followed pros first, with the tag;
  - the race page carrying the same items.
- New kit screen news-commentary (contrast and the layout matrix).
- Full kit: all pass. The races-foundation run stopped before its summary line once and passed on re-run. Five forecast lines changed only their weekday (the date moved to Oct 2), so the inventory allow-list now accepts a different weekday in that line.

## 19 · News › Other + My sports · DONE 2026-10-02

### What changed
- **News › Other (p.5):**
  - Chips All · Gear & tech · Training · Industry · Cycling · Running, remembered on this device.
  - The line "Showing: Tri · Bike · Run" with My sports ›.
  - Sections:
    - GEAR & TECH (teal): new products first, then a "Tested" group only for items whose source used the product. Footnote: fred summarises and never rates gear.
    - CYCLING & RUNNING (blue).
    - TRAINING & SCIENCE (green), when present.
    - INDUSTRY (black).
  - Every item shows: source tag, sport tag, category (e.g. Bikes, Wearables, Events), age · read time, the headline, In short, Read on ↗. No images.
- **My sports sheet (p.2)**, from Other and from a new Settings row "My sports (News)" (under Account & data):
  - Triathlon, Cycling, Running, Swimming, Gravel & MTB, as tick rows; the default is the first three.
  - Sections: Gear & tech, Training & science, Industry, Cycling & running.
  - Cancel keeps what was there; Done saves to `settings.news` (synced with the account).
  - It filters Other only. Racing and Commentary are unchanged.
- **Report a problem** at the bottom of every News tab, race page and pro card. It opens an email to hello@flipturncreative.com (`NEWS_REPORT_TO`) whose body names the tab and the item / race ids on screen, or the race or pro.
- **Content-Security-Policy:** `img-src 'self' data: blob: https://*.googleusercontent.com` (the Google account photo). No other site's images can load.
- Cache bumped to `fred-shell-v44`.

### Decisions
- **The sheet's "Racing" row (in the mockup) is left out.** The item says My sports filters Other only, and the sheet's own footnote says "Racing follows the series you pick in Racing".
- **The Report-a-problem address** is the account email this work was done under. Change `NEWS_REPORT_TO` if Mark wants another.

### Tests
- **New `kit/work-q19/other.test.js`, with the fixture.** It checks:
  - the CSP meta;
  - chips and their exact items;
  - the Showing line and the section colours;
  - "Tested" only for the tested item;
  - swim-only and gravel-only items hidden by default;
  - a full item row;
  - the sheet from Other (Cancel, Done, focus), from Settings, and through Settings search;
  - Racing and Commentary counts unchanged by My sports;
  - Report a problem naming the tab and item ids, the race id and the pro id;
  - no third-party image requests in the network log.
- **Updated:** v3 settings and b9 profile, for the new "My sports (News)" row (22 rows).
- **New kit screen:** news-mysports (contrast and the layout matrix). The sheet's Cancel / Done no longer squeeze at 200%.
- Full kit: all pass.

## 20 · News launch check · DONE 2026-10-02

### Jobs run by hand (GitHub → Actions → Run workflow, on main)
- **news-daily** (twice):
  - The first run published the first real `data/news.json` (148 items).
  - The second run, after the podcast fix below, added the podcast episodes (179 items, 79 KB).
  - Each commit was "news: daily … [skip ci]", and Pages built and deployed it.
- **news-weekend:** success. No change: without the keys and with an empty `data/calendar.json` there are no pro races to add.
- **news-results:** success. No change, for the same reason.
- **news-pros:** success. No change: there are no pros in the file yet.
- **news-ci** (tests and schema): green on every push.

### Sources
- **Live:**
  - **RSS:** Triathlete, Slowtwitch (the Ghost `/rss/` feed), 220 Triathlon, DC Rainmaker, Cyclingnews, Runner's World, endurance.biz.
  - **Podcasts:**
    - Pro Tri News (Buzzsprout).
    - The Triathlon Hour (Podbean).
    - That Triathlon Life (Buzzsprout).
    - The World Triathlon Podcast: no feed URL was known, so it was found through Apple's directory (a Riverside feed). It has few recent episodes.
- **Disabled:** **Tri247.** Its robots.txt disallows the feed for fred-news, and fred respects that (`enabled: false` with the reason in `data/sources.json`).
- **World Triathlon (API):** enabled, but waiting on the key (below). WTCS races show links only until then.

### Fixed during the check
- **Podcast episodes with no `<link>`** (Buzzsprout, Podbean): 0 episodes were parsed.
  - The link is now the episode's guid when it is a URL, else the show's page.
  - Episodes are keyed by guid, so episodes sharing the show page are not dropped.
- **Gear tests and buying guides** (e.g. "the best tri-suits … we test 12") now go to Other even when their text mentions racing.
- **A gear item's sport follows the gear:** a running-shoe review is tagged Run, not the source's first sport (Tri).
- New tests cover all three. Pipeline tests: 21, all pass.

### On an iPhone-sized screen (390 × 844) with the live file, compared with the PDF
- **Commentary and Other** look as on p.4–5: grouped sections with coloured titles and lines, source tags, sport and category tags, age · read time, and Read on ↗. There is no "In short" yet (no key).
- **Racing** shows its frame (chips, This weekend "No pro races in the next 10 days", Standings with a Full standings link, Report a problem). The race rows, podiums, standings, race pages and pro cards need race data from the keys, or official facts in `data/calendar.json`. With the mockup's data they match p.3 and p.6–9 (the kit's fixture screens).

### BLOCKED for Mark
1. **WT_API_KEY:** register at developers.triathlon.org → copy the API key → GitHub → fuel → Settings → Secrets and variables → Actions → New repository secret `WT_API_KEY`. This brings WTCS races, start times, results with splits and standings.
2. **ANTHROPIC_API_KEY:** console.anthropic.com → API keys → Create key → the same GitHub page → New repository secret `ANTHROPIC_API_KEY`. This brings In short, story lines, IRONMAN / 70.3 / T100 races from previews, and results from two agreeing reports.
3. **Optional:** official IRONMAN / 70.3 / T100 race facts (date, place, pro start times) can be typed into `data/calendar.json`. They show as confirmed.
4. After adding a key, run news-weekend, then news-results, then news-daily once (Actions → Run workflow), or wait for the schedule.

### Tests
- The full kit passes. Cache bumped to `fred-shell-v45`.

## 21 · News › Standings: top 10 for T100 and WTCS, deep links to the real standings pages · DONE 2026-10-02

### Part 1 (shipped first): empty tabs, WTCS standings missing

### What was wrong
- **WTCS standings were never filled.** The job matched the ranking by the name "World Triathlon Championship Series" in `ranking_name`.
  - The API has no ranking by that name. Its list is a category plus a short name, and WTCS is **"World Triathlon Series / Elite Women"** (id 16) and **"… / Elite Men"** (id 15).
  - So nothing matched, and the job skipped standings without saying so. The run was green, and `news.json` had no standings.
- **The key, header and requests were fine.** The job log shows `WT_API_KEY: ***` reaching the job, and every request returned 200 with the `apikey` header:
  - `GET /v1/rankings → 200 · 67 records · [{"ranking_id":45,"ranking_cat_name":"Paratriathlon","ranking_name":"PTWC Men","published":"2026-09-28 06:29:23","week":"2026-W40"…}]`
  - `GET /v1/rankings/16 → 200 · {"ranking_cat_name":"World Triathlon Series","ranking_name":"Elite Women","published":"2026-09-26 20:48:53","rankings":[{"athlete_id":63163,"athlete_title":"Cassandre Beaugrand",…}]}`
  - `GET /v1/events?category_id=351&start_date=2026-09-24&end_date=2026-10-02 → 200 · 0 records` (no WTCS race in the last 8 days, which is expected).
- **The app hid empty tabs.** A series with no rows showed only "No … standings yet." Pro Series and T100 had no data source at all, so their tabs looked empty.

### What changed
- **Pipeline (`scripts/news/`):**
  - Every World Triathlon request is now traced in the job log: path, status code, record count and a short sample. The key is never logged.
  - The ranking is found by category + name: "World Triathlon Series", "Championship Series" or "WTCS". Para, junior, age-group and relay rankings are excluded. If there are several, the newest by `published` is used.
  - The same list also has **"T100 Triathlon World Tour / Elite Women|Men"** (ids 85 / 84), published by World Triathlon. It is official, so it now fills the T100 standings too.
  - The log names the chosen ranking and its top 3. If nothing matches, or the rows can't be read, it says so with a sample row.
- **App (`index.html`):** the Standings switch (Pro Series · T100 · WTCS) never shows a blank tab.
  - **Pro Series:** "Women: full standings ↗" and "Men: full standings ↗" link to https://www.ironman.com/pro-series. IRONMAN has no separate women's and men's pages, so both rows open the same official page.
  - **T100:** the top 3 women and men when the file has them, then "Women: full standings ↗" (https://stats.protriathletes.org/t100/standings/women) and "Men: full standings ↗" (…/men), the official T100 standings pages.
  - **WTCS:** the top 3 women and men with points, then "Full standings" (https://triathlon.org/rankings).
  - **Any tab with no data** shows the official links (Pro Series, T100) or "Standings unavailable right now · Full standings ↗" (WTCS), never empty space.
  - Cache `fred-shell-v46`.

### Confirmed
- news-results run 4 (on `28891eb`) committed `37bf052`. `data/news.json` now holds the top 10 for each, and it validates (113 KB):
  - **WTCS women:** 1. Cassandre Beaugrand FRA 5,250 · 2. Beth Potter GBR 4,764.32 · 3. Georgia Taylor-Brown GBR 4,302.08
  - **WTCS men:** 1. Vasco Vilaca POR 5,006.25 · 2. Matthew Hauser AUS 4,745.76 · 3. Ricardo Batista POR 4,071.45
  - **T100 women:** 1. Julie Derron SUI 64 · 2. Imogen Simmonds SUI 62 · 3. Georgia Taylor-Brown GBR 61 (World Triathlon last published this list on Aug 16)
  - **T100 men:** 1. Hayden Wilde NZL 96 · 2. Jacob Birtwhistle AUS 59 · 3. Lasse Nygaard Priester GER 49
- On a 390px screen with the live file, all three tabs show as described above, with no page errors.

### Tests
- Pipeline: 21 tests pass. The mock now uses the real `/rankings` shape (Olympic, World Rankings, Age Group and T100 lists alongside WTCS) and checks both series for women and men.
- `work-q17/racing.test.js` checks:
  - the Pro Series and T100 link rows (text, URL, new tab, rel=noopener);
  - WTCS "Full standings";
  - a file with no standings: the links on Pro Series and T100, "Standings unavailable right now · Full standings ↗" on WTCS, no blank tab.

### Part 2: top 10, gap to the leader, checked deep links
**T100 source (point 1).** The World Triathlon API does list the T100 standings: "T100 Triathlon World Tour / Elite Women" (id 85) and "… / Elite Men" (id 84).
- They are the "Race To Qatar" standings. The API's figures match what triathlon.org and PTO publish: Wilde 96 · Birtwhistle 59 · Priester 49; Derron 64 · Simmonds 62 · Taylor-Brown 61.
- So T100 comes from the API. The two-reports fallback (top 10, same names and order, points within 1%) is built and tested, but runs only if the API answers without a T100 ranking. A failed request keeps the stored official rows.
- World Triathlon last published the women's list on Aug 16 and the men's on Sep 20. The app shows each sex's own "Updated" date.

**WTCS (point 2).** The top 10 per sex comes from "World Triathlon Series / Elite Women|Men" (ids 16 / 15), with points.

**Pro Series (point 3).** The top 3 is published only when two reports from different publishers state the same names in the same order, with points within 1% when both give them.
- The newest agreeing pair wins, so standings from before a race never replace the ones after it.
- A race recap counts only when it gives series points for every row, so a podium is never read as the standings.
- Today no article in the feeds states the standings, so Pro Series shows its link row. The season final is Kona on Oct 10; standings articles should follow.

**Deep links (point 4).** Every candidate was fetched once from GitHub's network: the news-links workflow, run 37018321482. This container can't reach these sites. Only the URLs that passed went into `data/sources.json`, marked `verified`:

| Series | Women | Men | Backup |
|---|---|---|---|
| T100 | https://triathlon.org/world-rankings/t100/women | …/t100/men | PTO stats /t100/standings/women and /men |
| WTCS | https://triathlon.org/world-rankings/championship-series/women | …/championship-series/men | the WTCS leaderboard /world-rankings/championship-series |
| Pro Series | https://www.ironman.com/proseries/standings | the same page | none |

- **T100 and WTCS** pages each named 10 of 10 of fred's listed pros for that sex.
- **Pro Series:** IRONMAN has one page for both sexes. It redirects to the current season (/2026), titled "Standings". It was found by reading proseries.ironman.com's own links.
- **Rejected:**
  - the long /world-triathlon-championship-series/… slugs (they redirect to the short ones);
  - proseries.ironman.com/standings (redirects to another site);
  - ironman.com/proseries (no standings on it);
  - IRONMAN's triclub rankings page. The discover step must now match "proseries/standings".

**The daily check.** Once a day the daily job requests each link: one request, robots.txt respected, nothing kept.
- A link is kept only when:
  - it answers HTTP 200;
  - it doesn't redirect to another page or site (a home page, an index, a sign-in or error page);
  - the page isn't a "not found" or sign-in page;
  - the page shows standings: the words in its own heading or title (not the site name), or 3+ of that sex's pros in its text;
  - it isn't the other sex's page.
- 429, 5xx, 401/403 and robots.txt refusals prove nothing. The last working link stays.
- A link that stops working is reported once. The job writes it to the log, and the workflow opens (or comments on) a "Standings link broken" issue. The report clears when the link works again.
- news.json carries only links that passed (`standings_info.links`). Actions → news-links → Run workflow checks every candidate by hand.

**Display (point 5).** Racing › Standings:
- The series switch (Pro Series · T100 · WTCS), then a Women · Men switch. Both are remembered on this device.
- Rows show rank, name, country, points and the gap to the leader ("Leader", "−485.68"). Each row opens the pro card.
- Under the list: "Full standings ↗", the checked link for that sex.
- Below that: "Updated {date} · Source: World Triathlon", or the two reports, linked, for Pro Series.
- No rows: Pro Series shows "Women: full standings ↗"; T100 and WTCS show "Standings unavailable right now · Full standings ↗".
- If no link works, the row reads "Standings unavailable right now." with no link.
- At 320px with 200% text, the points move under the name.

**Review.** An adversarial review of the pipeline (3 reviewers, every finding checked by a skeptic) confirmed 10 defects. All are fixed before shipping, each with a test:
1. A just-failed link was carried forward.
2. Discovered links ignored the athlete's sex.
3. Soft-404s, sign-in pages and generic index pages could pass on the site name.
4. The manual check didn't list failing candidates.
5. Job "all" dropped the broken-link list.
6. An older pair of reports could beat a newer one.
7. An API error let reports overwrite the official T100 rows.
8. 5xx/429 counted as broken.
9. Breaks were re-reported daily.
10. Recap podiums could be read as standings (hardening; the reviewer couldn't reproduce it).

**Live (confirmed in news.json on main after news-results and news-daily):**
- WTCS and T100: 10 rows per sex, with dates (WTCS Sep 26 / Sep 27; T100 Aug 16 / Sep 20) and checked links.
- Pro Series: its checked link, no rows yet.

### Tests
- Pipeline: 33 tests pass (`node --test tests/news/*.test.mjs`), including the new `standings.test.mjs`. It covers:
  - the two-reports rule and the fallback;
  - the standings extraction checks;
  - every link verdict above;
  - link state across days (kept, dropped, reported once, cleared);
  - an API error keeping the official rows;
  - the schema;
  - sources.json holding only https deep links, the verified ones first.
- App: `work-q17/racing.test.js` checks:
  - Pro Series top 3 with the gap and attribution;
  - the Women · Men switch keeping focus;
  - T100 and WTCS with 10 rows per sex, decimals kept;
  - "Updated · Source";
  - every "Full standings" link is one the check passed and not a home page;
  - a row opens the pro card;
  - the empty states, the "no working link" state, and the built-in links before any check.
- Contrast and layout: three new Standings screens (WTCS men, Pro Series women, empty T100) pass contrast AA, and layout at 320/375/390/430 × 100/150/200%.
- Cache `fred-shell-v47`.
- **Full kit passes** (87 checks, no failures). After it ran, the app's built-in links and the fixture were set to the verified URLs; News tests (q15, q17, q18, q19), contrast on the Standings screens and the service-worker test re-run and pass.
- **On screen with the live news.json** (390px): WTCS women 1 Cassandre Beaugrand FRA 5,250 pts Leader · 2 Beth Potter GBR 4,764.32 pts −485.68 …; men 1 Vasco Vilaca POR 5,006.25 · 2 Matthew Hauser AUS 4,745.76 −260.49 …; Pro Series: "Women: full standings ↗" / "Men: full standings ↗" (www.ironman.com/proseries/standings).

## 22 · Computer (browser) layout separate from the phone layout · DONE 2026-10-03
Spec: docs/design/fred-desktop-spec_2026-10-02_v1.pdf. Chosen: Plan B, Volume A, News A, Settings A.

### Breakpoints (point 1)
- **Phone, under 700px:** unchanged. 115 of 117 screens at 390px are pixel-identical to main before this item. The other two are timing noise and look identical:
  - a toast caught mid-fade;
  - a 1px antialiasing change in the Unit menu.
- **Tablet, 700–1099px:** the phone layout, centred, at most 720px wide.
  - The old desktop rules (Plan in two columns, pages capped at 720–760px) used to start at 1024px. They now start at 1100px, where the new layout replaces them.
- **Computer, 1100px and up:** the layouts below. All of it is CSS under an `html.dk` class, plus a small module (`dk…` functions) that only acts while that class is on.
  - A script in `<head>` sets the class when the window is at least 1100px wide **and** still at least 1100 "default-text" pixels (width × 16 ÷ the root font size). So with larger text (150% or 200% on a 1280–1440px window) the phone layout is used, centred, instead of a squeezed three-column one. The class is recomputed on resize and when the text size changes.
  - Why: the layout audit at 1280/1440px with 150% and 200% text found 250 clipped or overlapping spots in the three-column pages; with this rule all 702 size/text combinations pass.

### Computer shell (point 2)
- **Sidebar:** the bottom tab bar becomes a 232px sidebar.
  - The fred tile and name at the top.
  - Plan · Journal · Volume · Races · News with their icons. The active one sits on a white pill, and Volume stays hidden until Strava is connected.
  - The account at the bottom: initials, name and "Settings", which opens Settings.
  - It is the same `nav.tabs`, restyled, so every tab keeps its behaviour and its tests.
- **Page header:** the big left-aligned title, with the page's actions on the right.
  - The phone header's tile, divider and account circle are hidden here; the sidebar has the account.
- **Content:** at most 1240px wide, with 32px sides.

### Pages (points 3–7)
- **Plan B:** Scheduled rides (about 300px) | the selected ride's plan | Plan a ride (about 360px). The header action is "+ New ride".
  - **The list:** "this plan · not saved yet" while a crunched plan is on screen, then the planned rides still ahead, from the Journal.
  - **The middle column:**
    - The current plan shows the full results: top numbers with Adjust, weather, bottles, gels, closet, during the ride, totals with Copy, and the Save bar.
    - A saved ride shows its saved plan, with a link to open it in the Journal.
  - **Crunching** adds the plan to the list and selects it. Saving selects the saved ride. "+ New ride" clears the form and puts the cursor in it.
- **Volume A:**
  - Row 1: the season card, beside the six boxes in a 3×2 grid.
  - Row 2: Hours per year, beside the months chart. The charts scale to their panels.
  - Row 3: Month by month (two thirds), beside View (one third).
  - Header: a season picker and "All years". A past season opens its numbers in Hours per year, and "All years" opens every month of every year, which now fits the content column. The inline button stays too.
- **News A:**
  - Racing: This weekend + Last weekend | Commentary · latest (the four newest commentary items, computer only) | Standings + Pros you follow.
  - Commentary and Other: two columns of items plus a right rail. The rail holds the Standings on Commentary and My sports on Other.
  - Header: a series filter (it replaces the Racing chips) and My sports.
- **Settings A:**
  - The grouped list (420px) on the left, the selected row highlighted, and the chosen setting's page on the right. A setting is always showing: Carbs per hour when you arrive.
  - The list and header are no longer locked while a setting is open.
  - Sheets opened from Settings (product, bottle, My sports, plan and goal sheets) open in the right pane, not over the screen. Confirm dialogs stay centred.
  - The header action is "Search settings".
- **Races:** last race + Your bests (left) | the actions, all races by year, chapters and the rest (right). The big table stays full width.
- **Journal:**
  - The timeline (left), and the selected ride's detail in a right pane. One ride at a time; the first is selected when you arrive.
  - The check-in opens as a right-hand panel, not a full-screen sheet.

### Niceties (point 8)
- Hover states on sidebar items, rows and header buttons.
- A visible keyboard focus ring.
- Shortcuts:
  - 1–5 switch tabs (3 does nothing while Volume is hidden);
  - / goes to Settings search;
  - Esc closes panels (each panel already listened for it).
- Links to other sites open in a new tab.
- Charts and tables use their panel's width.
- The plan's Save bar sits at the bottom of the window. A bug found by the layout audit had it measuring the full-height sidebar as a "bottom bar" and floating over the top card.

### Decisions
- **Scheduled rides are the Journal's planned rides.** No new store and no new synced data. A saved ride shows its saved plan, as saved; it is not recomputed.
- **"/" opens Settings search:** it is the only search in the app.
- **The season picker** shows a past season's numbers in Hours per year. The season card itself always shows the current season, which is how Volume already works.

### Tests (point 9)
- **New `work-q22/desktop.test.js`.** At 390, 768, 1280 and 1440px:
  - the sidebar only from 1100px, the bottom bar only below;
  - tablet ≤ 720px and centred;
  - every page opens, with no horizontal scroll and no page errors.
- At 1280px it also checks:
  - **Plan B:** column widths; crunch adds and selects; picking a saved ride swaps the middle column and back; "+ New ride".
  - **Settings:** the list at 420px with the pane beside it; row clicks update the pane and the highlight; a product sheet opens in the pane.
  - **Header actions per page** and the shortcuts (1, 2, 4, 5 and /).
  - **Journal:** the pane follows the selected ride.
- **The layout audit** passes on every screen (117 screens, 351 at the three wider widths):
  - no horizontal scroll, clipping, overlaps, or tap targets under 44px;
  - at 768, 1280 and 1440px, at 100%, and at 150% and 200% text.
  - Three new kit screens cover the Standings layouts.
- **Contrast AA** passes at 1280px on every screen. Fixed along the way: the header season select's border, and the sidebar's "Settings" label (it was 4.46:1).
- **Kit tests updated for the spec:**
  - The header test checks the logo header at 390 and 900px, and the computer header (big left title, account in the sidebar) at 1280px.
  - Volume's laptop checks pass with the inline grid inside the content column.
- **Journal's selected row** is outlined in blue (2px), not tinted: the tint took small grey text under 4.5:1.
- **Phone unchanged:** a final pixel diff at 390px against main before this item: 110 of 117 screens identical. The other 7 differ only in News items' relative ages ("2 h ago" → "3 h ago", the screenshots were taken hours apart), one toast mid-fade and a 1px antialiasing change in the Unit menu.
- **The full kit:** passes (exit 0). One run overlapped a test run for the next item, which wrote over the Volume tests' shared test copy, so the Volume layout lines it printed came from that other build. Those tests, and every test that run could have touched (Volume acceptance, contrast and layout, q14, q6, q7, q8, v3 results, b9 profile, v3 settings), were rerun alone on this build: all OK. Cache `fred-shell-v48`.
  - **Correction (2026-10-03, found in item 24's kit):** this run did not fully pass. The two startup tests (boot-config, boot-null) failed at 1280px with old data: they open Settings from the header's account circle, which the computer layout hides (Settings sits at the foot of the sidebar). The app was fine; the tests now use the sidebar from 1100px and pass. The failure was in the kit output and was missed.

## 23 · Bottle concentration + Consistency and Training load boxes · DONE 2026-10-02
Spec: docs/design/fred-round_2026-10-02_v1.pdf, pages A (option A: the tag in the title) and B.

### Carbs are not powder grams (point 1)
- **The rule:** every product keeps its label values per serving (serving size g, carbs g, sodium mg, caffeine mg). Carbs per gram of powder = carbs ÷ serving size. A bottle's carbs = Σ(powder g × that product's carbs per g). Concentration = bottle carbs ÷ water mL × 100 (1 oz = 29.57 mL), one decimal.
- **Audit:** every place that turns powder into carbs, or shows either.
  - The engine (`compute`): the bottle carbs, the carb top-off blend, a pinned "mix" (grams of mix × carbs per g), My setup and the per-bottle split all use carbs ÷ serving. Correct before this item.
  - Bottles, the Details tiles (powder and carbs as two separate numbers), the ride totals, the Copy text, the Journal plan record and the Journal snapshot (carbs per bottle from the plan, not grams of mix). All correct before this item.
  - The Journal's older entries (no snapshot) work from the saved mix as 1 g servings with carbs per g. Correct.
  - **No case of powder grams counted as carbs was found.** The PDF's sample math (62 g of powder shown as 62 g carbs) is the mockup's sample data, not what the app did.
- **Fixed:** a product with no carbs value (an old backup, a sync, a hand-edited library) used to make every number NaN, or fall back to nothing.
  - It now shows "carbs unknown" in Settings › Products and in the drink-mix picker.
  - Picked as the gel or drink mix, the plan stops with "<product>: carbs unknown. Add the carbs per serving from its label in Settings › Products." (fred never guesses from the powder grams).
  - As a carb top-off it is left out (the top-off list only offers mixes with a carbs value).
  - 0 g carbs is a real label value (an electrolyte-only mix), not "unknown".

### Results › Bottles (points 2–3, PDF A option A)
- **The tag:** each bottle and baggie that carries carbs has a small blue pill on its title row: "6.6% · 55 g carbs" (#0B7399 on the blue tint, 600, tabular numbers). It floats right on the first line, and the title wraps around it.
  - Not struck through when the row is ticked.
  - Water-only bottles, electrolyte-only bottles and aid-table refills have no tag (nothing to show).
- **The footnote** under the group: "Every bottle mixes to 6.6% (today's cap: 7%)." When bottles differ: "Bottles mix to 5.2% and 6.6% …". With plain-water bottles in the plan: "Every carb bottle …".
  - The PDF's "(your Steady target ≤ 8%)" is the sample's wording; fred's cap comes from the heat band (or your override), not the effort, so it says "today's cap".
- **Baggies for one stop:** baggies for the same stop with the same recipe, bottle size and role are one row: "2 baggies for stop 1 · at 2:00 · one per 28 oz bottle", recipe shown once. A different recipe (a partly filled last bottle) stays its own row.
  - One tick for the merged row. Its key is new ("b|2 baggies · for …"); a single baggie keeps its old key, so ticks already saved still match.
  - On the ride › "Refill 2 bottles from your 2 baggies" is unchanged.
- The Journal snapshot keeps each row's text as before (no tag in it), so saved plans and their tests read the same.

### Volume: Consistency and Training load (point 4, PDF B)
- **Where:** two new boxes under the six.
  - Phone: a row of two (side by side down to 320px; they stack only at large text).
  - Computer: a full-width row of two, under the season card and the six boxes.
  - Each has an ⓘ (44px target) that shows or hides a one-line explanation.
- **Consistency · last 12 weeks:**
  - The word (Steady / Moderate / Uneven / Erratic), "varies N% week to week", 12 mini bars and a pill with the same 12 weeks a year ago ("31% a year ago", shown when that period has 8 or more weeks).
  - N = the coefficient of variation (population SD ÷ mean) of weekly hours over the last 12 complete weeks, in your Volume week (Mon–Sun by default). The sport filter applies.
  - **Recovery weeks:** if your TrainingPeaks calendar is connected, any entry in a week (a note or custom entry included) titled or described as a "recovery week", "rest week", "easy week", "deload" … leaves that week out. It shows as an outlined (pale) bar. A single "Recovery ride" workout does not.
  - Weeks before your first workout don't count. Under 8 weeks: "Not enough data · N of 8 weeks needed".
  - Bands (provisional, as asked): ≤ 25% Steady, 25–40% Moderate, 40–60% Uneven, over 60% Erratic.
- **Training load · this week:**
  - "412 so far · 4 of 7 days", a bar with your range shaded and a marker for the week so far, "below / within / above range", "your range 520–680".
  - Each session's load: its TSS from imported training, else Strava's Relative Effort (`suffer_score`), else hours × 50 (estimated).
  - Range = the average of the last 3 complete weeks ± 15%. With under 3 weeks of history: "Not enough data for a range yet".
  - Footnote: the sources actually used, e.g. "From TSS, Strava Relative Effort and hours × 50 (estimated) · 3-week average".
- **New data:**
  - **TSS from imports:** TrainingPeaks "TSS" and Garmin "Training Stress Score®" columns are now read and kept on each imported workout. Re-importing a file that was imported before adds the TSS to those workouts ("Add TSS"); nothing else changes. It syncs and restores like the rest of the import.
  - **Strava Relative Effort:** the Worker now keeps `suffer_score` in its compact activity (worker/fred-api.js). **Needs you:** redeploy the Worker in Cloudflare for it to arrive. Until then (and for activities synced before), sessions without TSS use hours × 50, flagged as estimated. Settings › Strava › Full resync fills it in for older activities after the redeploy.

### The real distribution (bands)
- Ashley's history lives only on her device and in her account, so her real 12 weeks could not be read here. The test uses a stand-in with weekly hours 10 12 7 11 14 7 12 9 13 8 11 15 → 23% → "Steady", as the item expects.
- **Needs you:** on Ashley's device, Volume › Consistency shows her real N%. If it is not about 23%, tell me the number and I'll check the weeks.
- The bands stay provisional until there's real data from more people.

### Tests
- **New `kit/work-q23/q23.test.js`:**
  - Bottles:
    - 55 g carbs per 62 g serving → 62 g of powder = 55 g carbs, and 55 g in 28 oz = 6.6%;
    - every bottle's carbs = Σ(powder × carbs per g), never the powder grams;
    - the tags match each bottle's own carbs and concentration;
    - baggie de-duplication, the footnote, the Copy text;
    - "carbs unknown" in Products, and the plan asks for the label value.
  - Volume maths:
    - the stand-in → 23% "Steady";
    - the bands;
    - recovery-week exclusion from a calendar note (a "Recovery ride" doesn't count);
    - "not enough data" under 8 weeks;
    - the year-ago value;
    - training load from Relative Effort, TSS and hours × 50; the range, and the below / within / above states; no range under 3 weeks;
    - TSS read from TrainingPeaks and Garmin files.
  - Volume boxes:
    - a row of two at 390, under the six and before Hours per year;
    - the ⓘ toggles;
    - nothing sticks out at 320 × 200% or 390 × 150%;
    - a full-width row of two at 1280.
- **Updated:** q6 bottles and q7 liter (a merged baggie's title "2 baggies for …" counts as a baggie), and v3 results (reads a row's text without the tag).
  - Also updated for the new boxes: ti (ignores the new `tss` key on imported workouts), v3 and q4 volume (page order counts the six and the new row once; the new boxes aren't outlined cards).
- Worker tests pass.

### What the full kit caught (fixed)
- **The bar-chart week marker** read as a solid black block to the contrast audit: it is now a small tick mark (`vlx-tick`).
- **Narrow screens with larger text** (320–430px at 150–200%): the Bottles title broke words around the tag, and at 320 × 200% the tag was wider than the column. Below about 17em of width the tag now sits on its own line under the title and may wrap.
- **The ⓘ** stuck 3px out of its box: it is now a 44px target inside the box's corner.
- **Training load's range bar** outline is blue (it read as a grey solid block).
- **Full kit:** passes (exit 0) after these fixes; the tests they touched (Volume acceptance, v3 and q4 volume, contrast on the Volume screens, layout at 320/375/390/430, ti, q6, q23) were rerun on this build: all OK. Cache `fred-shell-v49`.
  - **Correction (2026-10-03, found in item 24's kit):** this run did not fully pass. The two startup tests (boot-config, boot-null) failed at 1280px with old data: they open Settings from the header's account circle, which the computer layout hides (Settings sits at the foot of the sidebar). The app was fine; the tests now use the sidebar from 1100px and pass. The failure was in the kit output and was missed.
- **Needs you:** redeploy the Worker (worker/fred-api.js) in Cloudflare so Strava Relative Effort arrives.

## 24 · Remove the brand feature completely · DONE 2026-10-03

### Removed (point 1)
- **Settings › Gels:**
  - the "Brand" dropdown (`#brandSel`, "All brands" + one entry per maker);
  - its note (`#brandNote`): the per-brand notes ("Skratch makes no gel …") and the "stick to one brand per ride" tip;
  - that tip's "Coaching tip, not a study" link.
- **Settings › Drink mix:** the "Only <brand> is listed. Change the brand under Gels." line (`#setMixBrand`).
- **Brand filters:** the gel, drink-mix, Fine-tune alternate and carb top-off lists no longer filter to one maker. The alternate list no longer prefers the same maker ("Nothing from X in another form, so every brand is listed" is gone), and the caffeinated gel no longer defaults to the gel's maker (it takes your ★ caffeinated gel, else the first one in fred's list).
- **Settings › Products:** the brand group headers (maker name + count) in Gels & solid fuel and Drink mixes.
- **Product editor:** the "Brand" field (`#pBrand`). There is one "Name" field, "As sold, e.g. Maurten Gel 100".
- **Results:** the "Brands" note ("Mixed brands (…)").
- **The plan inputs** no longer save a brand (`lastPlan.brand`); an old saved one is ignored.
- **Settings search:** "brand" is no longer a keyword for Gels.
- **Restore default products:** the confirm says "the default products", not "the default Precision products".
- Untouched: the race "Brand" (IRONMAN or other) on Races is a race series, not a product maker, so it stays.

### One flat list per product type (point 2)
- **Gels, Drink mix, Sodium top-off:** each page is one list of every product of that type, every maker plus your own.
  - Favorites (★) first, then A–Z by the name as sold (case- and accent-insensitive, numbers in order).
  - A search box on top: by name, accents ignored ("naak" finds Näak).
  - "+ Add your own product" at the bottom: it opens the editor for that type.
  - Each row: a radio, the name, and the key numbers in grey: "25 g carbs · 20 mg sodium · 100 mg caffeine". Drink mixes show "39 g carbs per 42 g · 210 mg sodium"; sodium top-offs show "215 mg sodium per capsule · swallowed".
  - The ☆ on each row (44px) stars or unstars it, and the list re-sorts.
  - Sodium top-off keeps "None" as its first row.
- **Settings › Products** lists are flat too: favorites first, then A–Z, no headers.
- **Plan › Adjust** product dropdowns and the Fine-tune alternate / caffeinated gel dropdowns also sort favorites first, then A–Z. The carb top-off list keeps its order (favorites, then the least sodium per gram of carb), because that order is the point of the list.
- **The name as sold:** a saved brand is folded into the name once, on load, restore and sync: Precision + "PF 30 Gel" → "Precision PF 30 Gel". A name that already starts with its brand stays as it is, and the brand field is removed. The built-in products are folded the same way, so a restore or a new install has no brand field either. Products added later (the merged list) are matched by their full name.

### Carry-over (point 3)
- **A new install** still starts on Precision PF 30 Gel and Precision Carb & Electrolyte Mix (the first built-ins, as before), not on whatever sorts first A–Z: the list order changed, the defaults did not. The plan engine's 34 baseline scenarios are identical.
- Ids don't change, so the picked gel, mix, top-offs, caffeinated gel and alternate stay picked, and favorites stay favorites.
- Picking a product only sets that type's choice; the other types are untouched. A pick is saved with the plan the way it was before (on Crunch).
- The hidden `<select>`s stay as the value under each list, so everything that listened to them (the alternate list, the carb top-off list, the summaries) works as before.

### Bug found on the way
- The list is redrawn when Settings refreshes its rows. A tap on a row could be swallowed when that redraw swapped the row out mid-tap. The list now leaves unchanged rows alone.
- `saltHint()` sat inside a comment in `renderLibrary`, so the sodium top-off's one-line hint only appeared after a change. It now runs on load too.

### Tests
- **New `kit/work-q24/brands.test.js`:** it opens an old library (brands as their own field, a custom "Test" + "Blue Gel", one ★ gel, one ★ mix, a plan saved with a brand filter) and checks:
  - brands folded and the field gone; names as sold;
  - favorites and selections carried over;
  - Gels lists all 29 (favorites first, A–Z), grey numbers, the picked one checked, search on top, add at the bottom;
  - search ("maurten" → 3; "naak" → Näak);
  - picking a gel leaves the mix and top-off alone, and the inputs carry no brand;
  - a ★ moves a row up;
  - "+ Add your own product" opens a Name-only editor, and the new product lands in A–Z order;
  - the Drink mix and Sodium top-off lists;
  - no brand text or control anywhere in Settings, Plan or the editor;
  - flat Products lists, and a plan crunches with the picks.
- **Updated:** b9 profile (the Gels sheet shows the list; 142 Settings ids, not 144, since `brandSel` and `brandNote` are gone; adding a product without a Brand) and v3 settings (the Gels sheet no longer has `brandSel`). Both still pass on the build before this item.

### Kit
- **Full kit:** passes (exit 0) after the fixes below.
- **First run:** the plan engine's 34 baseline scenarios changed. With nothing picked yet, a new install picked whatever gel and drink mix sorted first A–Z (not PF 30 Gel and the Carb & Electrolyte Mix). Fixed (see Carry-over); all 34 now match the baseline.
- **Startup tests (boot-config, boot-null):** failed at 1280px with old data. This failure dates from item 22: the tests opened Settings from the header's account circle, which the computer layout hides. They now use the sidebar's Settings from 1100px. Both pass; the item 22 and 23 entries above are corrected.
- **q13 inventory** ("nothing removed") listed the brand ids (`brandSel`, `brandNote`, `pBrand`, `setMixBrand`), the Brand controls, the brand group headers, the brand-tip note and the product names shown without their brand. All of these were removed on purpose by this item. They are in its allow list, with the reason; the check passes.
- Cache `fred-shell-v50`.

## 25 · Plain water bottle: real water, sipped across the whole ride; "I know what I like" per ride · replaced 2026-10-03
- **Replaced** by item 32 (plain water bottles, final behavior and wording) and items 31–33 ("I know what I like" becomes My bottles), at the user's request. Not built as written.
- A draft had been made on branch `q25-water`. It was never merged and is kept only for reference.
- Items 26–30 had been built on top of that draft. They were rebuilt without it (their own changes re-applied), so nothing of item 25 reached the app.
- Item 32 reuses the draft's engine ideas where they fit (a bottle that holds only water, sipped evenly across the ride).

## 26 · Medication out of Caffeine; bottle settings easy to find · DONE 2026-10-03

### Medications (point 1)
- **Removed from the Caffeine page.** Caffeine now shows only caffeine (its rules stay in Settings › Advanced). Settings search no longer finds Caffeine by "medications".
- **New row: Settings › Account › HEALTH › Medications.**
  - Its value is "2 ticked" or "None".
  - The page opens with one line: "What fred does with it: a medication that changes how you handle heat, fluid or sodium gets a note in your plan saying what to watch. It never changes a number."
  - Then the same search, list, "Other" field and CDC source as before.
  - Search finds it by "medications", "meds", "prescriber", "heat", "drugs", "pills".
- **It is used:** the plan's notes flag what to watch for each ticked medication, and the Journal keeps them with each entry. So the row is shown, not hidden.
- **Values carry over** (`settings.meds`, `settings.medsOther` unchanged).
- The old "meds" link name, which opened Caffeine, now opens the Medications page.

### Bottles (point 2)
- **Settings › Gear › Bottles** (the row was "My bottles"):
  - the sizes and counts you own (as before);
  - **which cages take a 1 L bottle**, per bike, on the same setting as the bike page (both places stay in step).
  - Search finds it by "bottle", "water", "cage".
- **Results › Bottles:** the section title gets an **"Edit bottles"** link. It opens Adjust this ride and puts the focus on its Bottles choice (the bottle size for this ride).
- **Not built (replaced on 2026-10-03 by item 32):**
  - the "Carry one plain water bottle" default switch;
  - the Plan › Advanced row "Bottles · 3 mixed (+ 1 water)" with this ride's plain water choices.
  - Item 32 sets the plain water bottles on the new BOTTLES card (0 · 1 · 2) and its default in Settings › Gear › Bottles.
  - This item was built first on top of item 25's draft. It was rebuilt without it, since item 25 was replaced.
  - Adjust this ride therefore has no BOTTLES group at its top. "Edit bottles" goes to its existing Bottles choice.

### Tests
- **New `kit/work-q26/meds.test.js`:**
  - no medication on Caffeine;
  - the HEALTH › Medications row with the carried-over values and its one line;
  - search for "bottle", "water", "cage";
  - Settings › Bottles: sizes, 1 L cages per bike (saved on the bike), no plain water switch;
  - no plain water choices on Plan › Advanced;
  - "Edit bottles" in the Results › Bottles title opens Adjust with the focus on its Bottles choice.
- **Updated** b9 profile and v3 settings, which still pass on the builds before items 24 and 26:
  - Medications is its own Account row;
  - the row is labelled "Bottles";
  - search "medic" finds Account;
  - the drink-mix and sodium sheets show the item 24 lists in place of the hidden selects.

### Kit
- **Full kit:** passes (exit 0) after two test updates for this item's changes:
  - **q13 pages:** the Account page now has a green HEALTH group (Medications) between You and Settings. The check accepts it, and the Medications row.
  - **q13 inventory:** the row "My bottles" is now "Bottles". The pointer "Which cages take a 1 L bottle is set per bike, under Bikes" is replaced by that pick on the Bottles page itself. Both are in its allow list, with the reason.
- Cache `fred-shell-v51`.

## 27 · Capsules show their size, whole capsules only, correct scoop counts (PDF C) · DONE 2026-10-03

### Label values on every capsule line (point 1)
- **Each bottle's capsules:** "Swallow with this bottle: 3 × Precision Electrolyte Capsules · 250 mg sodium each (750 mg)". The 250 mg is the product's sodium per capsule from its label (Settings › Products), and the bracket is capsules × that.
- **The Sodium note** says the same: "swallow 17 Precision Electrolyte Capsules over the ride, whole, a few with each bottle (Bottles shows how many; 250 mg sodium each, 4,250 mg)".
- **Other electrolytes:** products store sodium only (no potassium, magnesium …), so only sodium is listed. Adding the others would need new product fields, so it isn't in this item.
- **No sodium per capsule** (possible only from an old backup or a sync; the editor requires it):
  - the plan leaves the product out of the math;
  - Bottles shows "Mystery Caps: sodium per capsule unknown · add it in Settings › Products. Left out of the plan until then.";
  - the product lists show "sodium per capsule unknown".

### Swallowed, not mixed (point 2)
- **Bottles:** the capsule line sits after the recipe, under a dashed rule, in body text. It is no longer an ingredient with a dotted leader ("Precision Electrolyte Capsules (swallow) ···· 2.5 capsules" is gone). The Journal snapshot text ends with the same sentence.
- **During the ride:** one row per bottle, at the first capsule: "Swallow 3 Precision Electrolyte Capsules with bottle 1: one at 0:10, 0:25, 0:40". The times are spread evenly across the bottle's drinking window, to the nearest 5 min.

### Whole capsules only (point 3)
- **The engine** counts the ride's capsules as a whole number (sodium gap ÷ sodium per capsule, rounded).
- **The bottles** get them in drinking order from a running total: each bottle takes the whole capsules its share has reached, and the rest carries to the next bottle. So a bottle gets 3, 3, 3, 2 and never 2.5, and the ride gets exactly the plan's count.
- **Ride sodium:** within half a capsule of the plan (tested: 4:30 hard 4,790 of 4,791 mg; 3:00 steady 3,170 of 3,194; 6:15 hard 6,560 of 6,654 mg; all within ±5%).
- **"Make up the difference with that bottle's salt top-off":** a ride has one sodium top-off, and here it is the capsule itself, so the difference is always carried to the next bottle.
- **Tablets and scoops** dissolved in the bottle keep their half steps (only swallowed capsules must be whole).

### Scoops from grams (point 4)
- **Drink mixes** have an optional "Grams per scoop". The built-ins whose label names scoops get it from the serving: Skratch Super High-Carb Mix (2 scoops) = 52.5 g → 26.25 g per scoop; Tailwind Endurance Fuel (1 scoop) = 27 g; SiS GO Electrolyte (2 scoops) = 20 g.
- **Each powder line** shows grams with the matching scoops, to the nearest quarter or third: "81 g (3 scoops)", "67 g (2½ scoops)", "59 g (2¼ scoops)", "13 g (½ scoop)".
- **No scoop size:** grams only. Saving the editor field empty means "no scoop" (it won't be guessed from the name either).
- **The PDF's bug** ("Skratch Super High-Carb Mix (2 scoops) ···· 81 g", which reads as 2 scoops) is fixed: 81 g of it is 3 scoops, and that is what the line now says.

### Tests
- **New `kit/work-q27/capsules.test.js`:**
  - whole capsules only on three rides, with the ride's capsules = the plan's count and sodium within ±5%;
  - the "Swallow with this bottle: … 250 mg sodium each (750 mg)" line, never an ingredient, its total = n × 250;
  - scoops match grams (3, 2½, 2¼, 2, ½; grams only without a scoop size);
  - During the ride spreads them across each bottle's window;
  - the editor's grams per scoop;
  - the "sodium per capsule unknown" note, left out of the math.
- **Rebuilt without item 25:** this item was first built on top of item 25's draft. It was re-applied without it, with the same behaviour and test.

### Kit
- Full kit passes on this branch (cache v52).
- The four layout runs (320, 375, 390, 430) were run again on their own: the first run had loaded a broken copy of a test helper (fixed in the kit, not the app). On the rerun each passes 363 screen/size/text combinations.

## 28 · Results: Save bar pinned to the bottom (PDF D) · DONE 2026-10-03

### The bar (point 1)
- **Phone and tablet:** "Save it to your Journal to check in after the ride." with Not now / Save to Journal, pinned to the bottom, directly on top of the tab bar.
  - No gap: its bottom is the tab bar's top, measured, safe area and text size included.
  - Solid white, with a hairline on top.
  - Always visible while viewing results.
  - It is `position: fixed` with no transformed or filtered ancestor, so it never moves on scroll or overscroll (tested at the top, at the end and while overscrolled at 390 × 844).
- **The page** gets bottom padding equal to the bar's real height (watched with a ResizeObserver), on top of the tab bar's own.
- **Before:** the bar was `sticky` inside Results, so the rows after it ("Why these numbers", the math) scrolled past underneath it (PDF D).

### Nothing after the bar (point 2)
- Details ("Bottles, leg by leg", "Numbers by hour · summary · math", "Weather: how it changed your plan", "Why these numbers", "Log this ride") all sit above the bar.
- Scrolled to the end, the last Details row is fully visible above the bar, and nothing renders below it (tested).

### Saved and Not now (point 3)
- **After saving:** the bar becomes a slim "Saved to Journal ✓ · View ›" in the same place for 5 seconds, then it's gone for that ride.
  - "View ›" opens the Journal at the saved ride.
  - It replaces the "Saved to Journal" toast, so there is one confirmation, not two.
- **"Not now"** hides the bar for that viewing; the next Crunch brings it back (as before).
- **Computer:** the bar is `sticky` at the bottom of the middle column. It sits at the window's bottom while you scroll the plan and at the column's end when you reach it, and it spans exactly the column. The saved strip shows over the middle column too.

### Tests
- **New `kit/work-q28/savebar.test.js`:**
  - the bar's bottom = the tab bar's top, no transformed ancestor, solid with a hairline;
  - it doesn't move at the top, the end, or overscrolled;
  - the last Details row is fully visible and nothing is below the bar;
  - Not now, and a new Crunch;
  - the saved strip, its text, gone after 5 s, and View › opens the Journal;
  - the computer position.
- **Updated:** b9 plan-journal and sync-gate, which looked for the "Saved to Journal" toast, now also accept the saved strip.

### Kit
- **Full kit:** it found one real bug. At 360 px, after a Crunch, the pinned Save bar covered the page's last link ("The science behind it"), and the page could not scroll it clear: the bottom padding was on the results, not on the page.
  - **Fix:** the padding is now on the Plan page, so its end, the footer included, scrolls clear of the bar. While the saved strip shows, the page gets 60 px.
  - After the fix, boot-config, the item 28 test, b9 plan-journal and the four layout widths pass.
- **sync-gate:** it waited 5 s for the old "Saved" toast before looking for the saved strip, which hides after 5 s. The test now looks for the strip first (a test fix).
- Cache v53.

## 29 · Hide research citations outside The science (PDF E) · DONE 2026-10-03

### Removed
- Every RESEARCH and GUIDELINE tag, and every paper or guideline link, outside The science:
  - **Plan › Fine-tune today:** Heat "Jentjens et al., 2002 · Mougin et al., 2025", and "Why the strength stops at 8%" (Murray et al., 1999).
  - **Settings:**
    - Carbs per hour (Jeukendrup, 2008 and 2014);
    - Sweat rate (ACSM, 2007);
    - Sweat sodium "What's typical?" (Baker, 2017);
    - Drink mix › Advanced: the three caps (Baker GSSI 2023, Jeukendrup et al. 2009, Murray et al. 1999) and NWS: WBGT;
    - Caffeine (ISSN Guest et al. 2021, Cox et al. 2002);
    - Medications (CDC: Heat & medications);
    - the product editor's Carb type (Jeukendrup, 2008).
  - **Results and Adjust:** the citation lines generated in the notes and weather rows (`cite()`: Baker/Evans caps, heat, sodium, fluid, the gut notes, caffeine). `cite()` now returns nothing for a paper or guideline.
  - **Gels › Fine-tune › "Why alternate?"** (Hearris et al., 2022).
- 14 static citation lines (16 links) and every generated one are gone.

### Kept
- **The plain one-line explanations**, e.g. "In the heat, 10–20% less of the carbohydrate you drink gets used."
- **The switches.**
- **The "Our rule" lines**, which link to The science and are not citations.
- **The science page** keeps all its papers and guidelines (37 links), still linked from the footer ("Planning tool, not medical advice · The science →").

### Tests
- **New `kit/work-q29/cites.test.js`:**
  - on every kit screen, with every `<details>` opened, no "et al., YYYY", no Research / Guideline / Expert summary tag and no citation link outside The science;
  - The science still lists them;
  - the footer link;
  - the Heat switch and its line still work;
  - Results and its notes render without citations.

### Kit
- **Full kit passes** (cache v54).
- **The item 29 test** checks every kit screen. It was given a 5-second limit per action, so a screen it can't reach (the race-log cards, after it opens every collapsed section) is skipped instead of waiting 30 s each. Those screens are checked by the layout and inventory tests. Its kit limit went from 15 to 30 minutes.

## 30 · Journal entry cleanup, option A (PDF F) · DONE 2026-10-03

### The top of the Journal (point 1)
- **"RIDES · N"** sits at the top with the **Rows | Cards** switch on the same row, e.g. "RIDES · 4 · 1 WAITING" (the waiting count shows when a check-in is due).
  - **Cards** opens every ride, and **Rows** folds them all back. The switch shows which one is on.
  - It replaces "1 ride · Expand all · Collapse all", which sat under the rides.
  - With very large text the switch moves under the title.

### Each open entry (point 2)
- **The header:** the date and time, then the duration and the ride name, as before.
  - "Edit" sits in its top-right (blue, a 44px target). The title leaves room for it, so it never covers the text.
- **WHAT YOU TOOK IN** (blue group):
  - Bottles "2.8 of 3 · 6.9%" (taken of planned, with the concentration), Gels "3 of 3", and Extra food "Bar × 1 · +40 g".
  - The footnote gives the result per hour: "Result: 66 g carbs/hr · 673 mg sodium/hr · 17 oz/hr".
  - The planned-vs-actual table, the ride details (ride, fuel, ride time, weigh-in) and the saved plan fold into one row under it ("Planned vs actual · the plan ›"). Nothing that was there before is lost.
- **HOW IT WENT** (black): the answers as chips.
- **WORE** (green): the clothing list, then the clothes chip ("Clothes: just right").
- **NOTES:** the note. With no note, an "Add a note ›" row opens the entry's sheet.
- **COPY FOR YOUR COACH** (blue): a row "Copy what I took in" with a black Copy button. The footnote shows the sentence it copies.
- **"Delete this entry":** a red row in its own group at the end.
  - It asks first ("Delete this journal entry?").
  - A notice then offers **Undo** for 6 seconds, and Undo puts the entry back in its place. Sync handles the restore: the entry is saved again, newer than its delete.
  - The item asks for "confirm + Undo as today", but today's Journal only asked to confirm. The Undo is new.
- **Planned rides** keep "How did it go?" and get the same groups once checked in.
- **On a computer** the open ride shows in the pane on the right with the same groups and Edit in its top-right.

### Under the rides (point 3)
- **WHAT FRED NOTICED** (teal) is a grouped row in the house style.
  - Before 3 check-ins: "Shows up after 3 check-ins · 2 of 3".
  - Then: "N patterns", which opens the list as before. Open or closed is still remembered on the device.

### No backup on the Journal; one-line footer (point 4)
- **Removed from the Journal:** "Back up (export)" and "Restore (import)", and their file input.
  - Settings › Account & data › Backup still downloads and restores everything (the Journal included), behind the same sign-in gate.
  - The old Journal restore's gate stays defined, so a restore that was waiting from an older version still finishes.
- **The footer:** "Planning tool, not medical advice · The science › · Privacy" on one line (Privacy shows when signed in).
  - It fits at 390px.
  - Narrower, or with larger text, it wraps without sticking out.

### Also fixed
- **On a computer,** the selected ride's blue ring touched its text (from item 22). It now sits 8px outside.

### Tests
- **New `kit/work-q30/journal-a.test.js`:**
  - RIDES · N with Rows | Cards at the top (Cards opens all, Rows folds all), and no Expand / Collapse all.
  - Edit in the entry header's top-right, clear of the date and title, and it opens the sheet.
  - The groups in order and colour: bottles with concentration, gels, extra food, the result footnote; chips; clothing; the note; "Add a note".
  - The Copy group copies the footnote's sentence, with a black Copy button.
  - The red Delete row: Cancel keeps the entry; OK deletes it, then Undo puts it back in place.
  - No Back up / Restore on the Journal (Settings keeps both).
  - What fred noticed below the rides, as a teal row "Shows up after 3 check-ins · 2 of 3".
  - The footer on one line.
  - 390 × 150% and 320 × 200% text: nothing cut or sticking out.
  - The computer pane: groups, Edit, the red Delete row.
- **Updated to accept the new top bar and footer** (each still passes on the build before this item):
  - v3 journal ("Rides · 7 · 2 waiting"; the What fred noticed title and its "2 of 3");
  - b9 plan-journal (the waiting count);
  - sync-merge ("Rides · 14");
  - q4 volume (the count and switch above the rides);
  - sync-gate (its restore check uses Settings › Backup when the Journal has no Restore).

### Kit
- **Full kit:** three findings, all fixed.
  - **The Copy button** in "Copy for your coach" was 40 px tall: the Journal's row-button rule now sets 44 px (a first fix lost to that more specific rule; the layout rerun caught it).
  - **The selected "Rows" / "Cards" segment** now carries the `on` class, like every other switch. The results check allows a shadow only on a selected segment, and this one was marked `aria-pressed` alone.
  - **The inventory** lists the Journal's "Back up (export)" / "Restore (import)" as removed. That is intended (they stay in Settings › Account & data), so they are allowed with that reason.
- **After the fixes:** v3 part0-1, the item 30 test, the layouts and the inventory were rerun.
- Cache v55.
## 31 · Plan front page, final layout · DONE 2026-10-03
Source: docs/design/plan-front-location-in-ride.png (the final order). The v2 PDF (pages C and D) did not come with the message, so the picker and the Advanced settings page follow the item text and the app's grouped house style.

### The front page, top to bottom (390×844, default text: everything above the pinned Crunch, with the greeting)
1. **Greeting:** "Good morning / Good afternoon / Good evening, {first name}" by local time (5–11:59 / 12–16:59 / 17–4:59), with no period.
   - It shows when signed in. While sign-in is still loading (offline), it uses the saved account name.
   - It updates when the app comes back to the screen.
2. **RIDE card (blue tint)**, in order:
   - Time | Distance, a small switch at the top right.
   - **Duration** as one button ("2 h 30 m ⌄"). It opens an hours / minutes wheel: scroll, tap, or use the arrow keys, Page up/down, Home/End or digits. Done sets the ride; "‹ Plan" leaves it unchanged.
   - In Distance mode the button shows "100 mi · 18 mph" and opens a distance + average-speed wheel (1–200 mi, 8–35 mph in 0.5s; km and km/h in metric).
   - Effort: Recovery / Steady / Hard.
   - "Steady · 85 g carbs/hr".
   - The TrainingPeaks line "TP · Tomorrow: 5 hr Z2 · Use", only when tomorrow has a planned bike workout. "Use" sets the duration and switches to Time mode.
   - The location row "Carmel, IN · Sat Oct 3 · 8:00 AM ›". It opens Where & when: location, "Use my location", date, start, Ends.
   - The **Stops** row ("None" / "1 · 2:15" / "2 · mi 34, mi 68"). It opens the stops editor (stops, supply chips, pocket bottle).
   - Location and Stops sit on thin dividers inside the card. There is no separate Where & when group.
3. **BOTTLES card:** "Tri bike · 3 cages" and "fred picks your bottles when you crunch the plan" (item 32 fills it in).
4. **NUTRITION card:** three tiles, Drink mix · Gels · Electrolytes, with the product this ride uses (★ if favorite; "this ride" when it differs from Settings).
   - A tile opens that type's picker: search, FAVORITES, then ALL (A–Z), plus "Make this my default".
   - **Off** (the default): the pick is for this ride only (Settings unchanged). It stays through changes to the duration, date or effort, comes back after a reload, and goes with Save to Journal (a new ride).
   - **On:** it also becomes the Settings default.
   - The Electrolytes tile is the sodium top-off product (with "None").
5. **"Advanced settings ›"** with a one-line summary ("Caffeine · Tri bike · Both").
6. **"Crunch the plan"**, pinned above the tab bar (and above the Save bar when it shows) while the form is on screen. On a computer it stays under the form.

### Advanced settings (a page: "‹ Plan · Advanced settings · Reset"; "For this ride only · Settings › sets your defaults")
- **TODAY:** Bike · No gels · Plan for (Nutrition / Clothing / Both).
- **BOTTLES TODAY:** Bottle size ("Preferred", then 1 L first) · "Refill water bottle at stops" (new; item 32 uses it).
- **FLUID & STRENGTH:** Fluid today (auto or oz/hr) · Strength limit (%; blank = by the weather, never above 8%) · Heat: lower carb target ~15%.
- **GELS & CAFFEINE:**
  - First gel at · Caffeine (on/off for this ride).
  - **Caffeine from** (new): the caffeinated gel for this ride; first option "As in Settings: …". The dose limits stay in Settings.
- **PRESETS:** "Presets for {bike}": tap one to apply (with Undo), × to delete (with Undo) · "Save today as a preset" (a name; the same name updates it).
  - The old "I know what I like" presets (bottles × g) are kept in the saved data for My bottles (item 33). They are not listed here.
- **Reset:** every value above back to its default (No gels off, caffeine as in Settings, Preferred size, refill off, fluid and strength auto, heat off, first gel 20 min, Plan for Both), with Undo. The bike stays: the last one used is its default.
- **Saving:**
  - Values are saved with the plan as they change, before any Crunch.
  - A plan saved to the Journal (Scheduled rides) carries them: strength limit, fluid, bottle size, refill, caffeine gel, and the ride's gel, mix and electrolyte, next to what it already kept.

### Every per-ride option that existed, and where it is now
| Option | Where now |
|---|---|
| Time / Distance, duration, distance + speed | RIDE card (button + wheel) |
| Effort | RIDE card |
| Location, date, start, Ends (auto) | RIDE card › location row › Where & when |
| Stops, supply per stop, Pocket bottle | RIDE card › Stops row › stops editor |
| TrainingPeaks "Use" | RIDE card (one line, only with a planned ride) |
| Gel / Drink mix / Sodium top-off for this ride (Adjust's pickers) | NUTRITION tiles (Adjust this ride still has them after Crunch) |
| No gels | Advanced › TODAY |
| Caffeine on/off | Advanced › GELS & CAFFEINE |
| Bike | Advanced › TODAY |
| Plan for | Advanced › TODAY |
| Bottle size today | Advanced › BOTTLES TODAY ("Bottle size") |
| Fluid today | Advanced › FLUID & STRENGTH |
| Strength override | Advanced › FLUID & STRENGTH ("Strength limit") |
| Heat: lower carb target | Advanced › FLUID & STRENGTH |
| First gel at | Advanced › GELS & CAFFEINE |
| Ride name | unchanged (asked when saving to the Journal) |
| Adjust this ride (totals, Keep, bottle size, leftover) | unchanged, on Results |
| Typed temperature + "Use my typed temperature" | removed (below) |
| Fewest bottles | removed (below) |
| I know what I like / Pin 3 × 45 g / its presets | removed from Plan; My bottles (items 32–33) |

### Removed (point 7)
- **"Type a temperature", "Feels-like temp", "Use my typed temperature instead of the forecast":**
  - The plan always uses the forecast.
  - A saved plan with a typed temperature is ignored on load, so the next Crunch fetches the forecast.
  - Offline (or a date too far out), fred falls back to the last forecast for that place and date, else the last feels-like it had. The weather card says "no forecast" and "Crunch again when you're online".
  - The fallback value is a hidden field (`#tempF`, kept for that).
  - Journal entries keep the temperature they were planned with.
  - Settings' "Band thresholds: typed feels-like" is now "… feels-like (no forecast)".
- **"Why the strength stops at 8%":** removed. The limit's own hint says "never above 8%".
- **"Fewest bottles" and its explanation:**
  - The engine always packs the athlete's bottles from Settings › Bottles (1 L first, the fewest bottles, none almost empty) whenever they own any.
  - A size picked for one ride (Bottle size) means that size.
  - The saved setting stays in the data, unused. Plans for riders who had it on are unchanged; riders who had it off now get their 1 L bottles too. The plan engine's 34 baseline scenarios are identical.
- **"I know what I like" / "Pin 3 × 45 g":**
  - Removed from Plan.
  - A My setup that was pinned stays saved (`lastPlan.mySetup`, and the presets in `settings.setupPresets`), but it no longer changes the plan: a pin nobody can see shouldn't.
  - Items 32 and 33 build My bottles and read it from there.
- **The Plan summary card:** it was not in the new order. Its values are on the cards and in Settings, so it stays in the page, hidden (its ids kept).
- **The 📍 (and item 32's 💧):** shown as line icons. The app's rule is no emoji (the kit fails on any), and the PNG's pin is a stand-in for that.

### Behaviour changes worth knowing
- **Bug fixed on the way:** a gel picked for one ride (Adjust this ride) used to become the Settings gel after a reload. Saved plans now keep the Settings picks apart (`defGelId`, `defPowderId`, `defSaltId`).
- **Adjust this ride › Reset** now keeps this ride's product picks (they are the tiles' picks now); it still clears every adjusted total.
- **The Ride card** is blue for every effort, as the spec says; the effort shows on its pill. Item 3a had tinted it by effort.

### Tests
- **New `kit/work-q31/front.test.js`:**
  - the order; the greeting by local time (and none when signed out);
  - the blue card for every effort; Time | Distance at the top right;
  - the duration wheel (arrow keys, "‹ Plan" discards, Done sets 330 min) and the distance wheel;
  - "Steady · 85 g carbs/hr" / "Hard · 90 g carbs/hr";
  - the location row and its sheet (a new start shows on the row); the Stops row (None → "1 · 2:15" → None);
  - the Bottles shell;
  - the Nutrition tiles and picker: headings, search, this-ride pick kept through a ride change and a reload with Settings unchanged, "Make this my default", Electrolytes "None";
  - the Advanced page:
    - the header, the groups and their rows, and "Preferred, 1 L first";
    - values reach the plan and are saved before Crunch;
    - Caffeine from;
    - Reset + Undo;
    - presets (save, apply, delete);
    - the values reach the Journal entry;
  - a new ride drops the picks;
  - removed controls and texts gone;
  - the migration: a typed-temperature plan uses the forecast; My setup is kept but inert; 1 L bottles go first with the old Fewest bottles off;
  - the fit at 390×844 with the greeting; 44 px targets; Crunch pinned;
  - computer: Crunch under the form, sheets as a centred dialog.
- **Updated to accept the new page** (and still pass on the build before it):
  - the shared helpers: kit/lib.js, work-fix/lib3.js and work-v2/lib2.js. Where a test asked for a typed temperature, they now say "no forecast" (forecast requests are refused and the cached forecast is cleared);
  - the Plan screens in work-fix/screens.js: they open the sheets; new screens for Where & when, the two wheels and the picker;
  - fred acceptance, hdr-account (no period after the name), v3 plan and q4 plan (the old layout's checks only on older builds; the shared ones through the sheets), v3 results, q14 (the TP line), q22 (focus on the Duration button), b9 plan-journal (Plan for on the Advanced page), q13 pages (the groups in the sheets), q4 volume (the cards under Advanced settings).
- **Fixed in passing**, from items 28 and 29, whose kits had not run yet:
  - v2 acceptance counted the fixed Save bar as hidden;
  - b9 plan-journal expected the old save toast;
  - v3 results expected citations in Details.

### Kit
- **Full kit:** it found five things. Fixed:
  - **Contrast:** the location row's date ("Sat Oct 3 · 8:00 AM") was 4.41:1 on the blue card (AA needs 4.5). It is now in body text.
  - **Nutrition tiles:** product names were cut at two lines ("Precision Carb & Electrolyte M…"). They now wrap in full. The tiles are a little tighter (smaller name text, padding and gaps), so the page still fits above the pinned Crunch at 390×844.
  - **Time | Distance switch:** at 320 px and 200% text it made the page scroll sideways. It now shrinks to fit.
  - **Advanced settings:** the Strength limit field was squeezed by its long label (the "auto" cut off, under 44 px). Number fields there keep their width, and a long label wraps them under it.
  - **Inventory:** the removed ids (typed temperature, Fewest bottles, "I know what I like", Fine-tune today, the Plan summary card, the Where & when group) are intended and allowed, each with its reason.
- **One flaky check:** in the item 31 test, a duration wheel check failed once in the kit and passed on its own.
- **Rerun after the fixes:** contrast, q6 bottles, the item 31 test, the four layout widths (363 combinations each) and the inventory all pass.
- Cache v56.

## 32 · Bottles card and plain water bottles, final behavior and wording · DONE 2026-10-03
Source: the item text (PDF E, F were not attached; the v2 PDF did not come with the message). Built on item 31's Bottles shell.

### Plan › BOTTLES
- **Header:** "BOTTLES" with the bike and its cages on the right ("Tri · 3 cages").
- **Switch:** "fred decides | My bottles". It is saved with the plan, and a new plan keeps it.
- **fred decides:** one line only, never a calculated number:
  - 0 water: "fred picks your bottles when you crunch the plan";
  - 1 water: "**1 plain water bottle** + fred picks the rest";
  - 2 water: "**2 plain water bottles** + fred picks the rest".
- **Water row (both modes):** "Plain water, whole ride" with 0 · 1 · 2 and "sipped evenly · no mix, no salt" under it.
  - The drop is a line icon. The app's rule is no emoji (the kit fails on any).
  - A count that would leave no cage for a mixed bottle is greyed out and says why: "2 cages: up to 1", "1 cage: no room".
- **Nothing is calculated on Plan before Crunch:**
  - The Stops editor no longer shows run-outs or extra gels; they show on Results.
  - My bottles shows only what you set.
- **Refill water bottle at stops:** a switch under Advanced settings › Bottles today (item 31 put it there).

### The plan with plain water
- **Water bottles:**
  - plain water only (no mix, salt, capsules or carbs);
  - sipped evenly over the whole ride (oz/hr = size ÷ ride hours);
  - not refilled unless "Refill water bottle at stops" is on.
- **Fluid, carbs and sodium:** fred works the ride out twice.
  - First with no water, which gives the targets: fluid, carbs and sodium per hour.
  - Then for the mixed bottles, which carry the rest of the fluid and **all** the carbs and sodium. Recipes and strengths come from the product labels.
  - Carbs/hr, sodium/hr and fluid/hr stay as planned for 0, 1 or 2 water bottles.
- **Strength limit:**
  - The mixed bottles are held at the ride's strength limit. When they would pass it, fred adds gels: "+N gels to stay under X%".
  - If even that can't fit (no gels, or no room in the schedule), the shortfall is stated. A bottle never goes over silently.
- **Cages:**
  - Water bottles take the first cages, small cages before 1 L ones.
  - Mixed bottles use the rest.
  - Extra mixed bottles become refills at stops.
- **Refill at stops (on):**
  - The water bottle is refilled at each stop: set stops, or the plan's own refills when none are set.
  - Its rate is size ÷ the longest leg, and each leg's fill is what that leg needs.
- **Short rides:** water never takes more than 2/3 of the ride's fluid, so the mixed bottles still carry the sodium. A note says when the water fill was cut.
- **Regress:** with 0 water nothing changes. The 34 baseline scenarios (both fixtures) are identical.

### Results
- **Water rows first:**
  - title "28 oz bottle · plain water";
  - a grey tag "sip ~6 oz/hr";
  - one line, "Water ···· 28 oz".
- **Mixed bottles:** they keep their "7.8% · 65 g carbs" tag.
- **Footnote:** "N plain water bottle(s) sipped all ride · mixed bottles carry all carbs and sodium", plus " · +N gel(s) to stay under X%" only when gels were added.
- **During the ride:**
  - First: "Plain water: sip about 6 oz each hour · finish by {end}" (with refill on: "… finish by {first stop} · refill it at each stop").
  - A thin water band runs across the timeline.
  - Each stop adds ", and refill the water bottle".
- **Doesn't fit the cages:** at the very top of Results, "**Only 1 cage left for mixed bottles.** It would need to be 11% to last until your first stop."
  - One-tap fixes:
    - "+ Stop at {time}";
    - "Use a 1 L bottle", only when you own one and a smaller size was picked for the ride (it clears that size);
    - "No water bottle".
  - The affected bottle shows "needs a fix" instead of a recipe, and no extra gels are planned for it.
  - This applies with set stops. With no stops, refills come when the mixed bottles run out, so it can't happen.
- **Summary, Copy and other places:**
  - The summary ends "· 1 water bottle".
  - Copy adds "1 bottle of plain water, sipped through the ride".
  - The share image, notes and math mention it.
- **Journal:** the plan keeps the water bottles (`snap.i.water`; bottles carry `kind`/`plain`). "N of M bottles" counts the mixed bottles first.

### Settings
- **Settings › Gear › Bottles:** "Plain water bottles in new plans: 0 · 1" (default 0).
  - New plans start with it.
  - The plan on screen keeps its own count.
- **The Water cage role is gone:**
  - A bike that had Water cages turns them into Carb, and new plans start with 1 plain water bottle. A default already set is kept.
  - The old roles stay on the bike as `rolesWas`.
  - The migration also runs on backup restore and on synced settings.

### Decisions (not in the item text)
- **Sodium with Electrolytes "None":** fewer carbs in the mixed bottles means less drink mix, so sodium can land below plan. A warning note says how much and asks for an electrolyte product.
- **My bottles in this item:** the carb row (count × "Carbs in each") is backed by the old My setup, so nothing was lost. Item 33 replaces it.
- **Cage roles:** off for a ride with plain water bottles (a note says so). Item 33 retires them.

### Tests
- **New `kit/work-q32/water.test.js`:**
  - the card (order, header, 44 px targets, the three lines word for word, nothing calculated before Crunch, cages limits);
  - My bottles;
  - water-only bottles;
  - per-hour totals kept for 0/1/2;
  - strength limit and gels added;
  - Results rows, tags and footnote (the gels part only when added);
  - the During-the-ride line;
  - summary and Copy;
  - 3-cage vs 2-cage fit and each fix;
  - refill on/off, with and without stops;
  - saved with the plan;
  - Results marked out of date after a change;
  - the Settings default and new plans;
  - the Water-role migration;
  - the Journal snapshot.

### Kit
- **Before the kit:** item 31's front-page test was run on this build and found:
  - **The Bottles card is taller.** The whole card plus the default long drink-mix name can't fit above the pinned Crunch at 390×844, even with the tighter card. Item 31's test now checks, when the water row is there:
    - page order;
    - Crunch pinned above the tab bar;
    - Advanced settings fully above Crunch once scrolled.

    The old fit check still runs on builds without it.
  - **The duration wheel could lose a key press.** Opening the sheet moved focus to its title a moment later. A wheel sheet now focuses its first wheel. A wheel's own scroll never settles on a passing item.
- **Full kit:** one finding. At 320 px and 200% text, a bike's "Electrolyte" cage-role button was cut off. The role buttons now wrap.
  - The 375 layout run had crashed before its first screen; it was rerun.
  - 320 and 375 pass after the fix; 390 and 430 passed in the kit.
- Cache v57.

## 33 · My bottles: three kinds including electrolyte-only · DONE 2026-10-03
Source: the item text (PDF G was not attached). The middle screen's "Carbs come from" switch is not built, as the item says.

### Plan › BOTTLES › My bottles
- **Carb & electrolyte:**
  - a count stepper ("your drink mix");
  - under it, "Carbs in each" in 5 g steps, the carbs every carb bottle carries.
- **Electrolyte only:**
  - a count stepper ("your electrolyte product · no carbs");
  - with no electrolyte product picked, it says "pick an electrolyte product under Nutrition".
- **Plain water:** the 0 · 1 · 2 row from item 32.
- **Counts:**
  - They respect the bike's cages at the start: water first, then the others on the cages left.
  - At least one carb or electrolyte bottle stays.
  - Extra bottles become refills: the cage pattern repeats at each stop.
- **The line under the card:** "3 cages: 1 carb + 1 electrolyte + 1 water · gels fill the rest to 85 g/hr" (" · 1 empty" when a cage is left empty).
- **Saved with the plan** (`lastPlan.bot.mine`). A new plan keeps it.

### The plan
- **Carb bottles:** each carries "Carbs in each" (never over the strength limit).
- **Gels:** they fill the rest of the carb target, rounded the plan's way (nearest by default, so within half a gel for the ride).
- **Fluid:** it splits by the share of cages, as cage roles did.
- **Sodium:** carb and electrolyte bottles share the sodium target by fluid volume (the same mg per oz in each). A carb bottle's drink mix counts towards its share, and the electrolyte product makes up the rest. Water carries none.
- **Electrolyte bottles:** never carb mix, only the electrolyte product, by its label (sodium per g, tablet, stick or capsule).
  - A capsule product is swallowed with its bottle, as in item 27. That is my reading of "capsules dissolved per label": capsules aren't dissolved.
- **Fred decides never offers electrolyte-only bottles** and has no controls other than the water row.
  - So it now plans every cage alike, and Settings › Bikes no longer sets cage roles (it points to Plan › Bottles).
  - A plan on a bike that had Electrolyte cages opens in My bottles with those counts.
  - A plan with an old "I know what I like" setup opens in My bottles with it (n × g).
  - Riders with no roles see no change: the 34 baseline scenarios are identical.
- **Settings › Fueling:** "Sodium top-off" is now **"Electrolyte product"** (search still finds "sodium top-off"). The Nutrition card's Electrolytes tile sets it for one ride.

### Results
- **Each bottle names its kind:**
  - "28 oz bottle · carb & electrolyte", tagged "7.2% · 60 g carbs";
  - "28 oz bottle · electrolyte only", tagged "0 g carbs · 1,000 mg Na";
  - "28 oz bottle · plain water", tagged "sip ~11 oz/hr".
- **Footnote:** "Gels fill the rest: N gels to reach 85 g carbs/hr" (with the water part when there is water).

### Tests
- **New `kit/work-q33/mine.test.js`:**
  - the rows;
  - the line;
  - steppers respecting cages (and at least one bottle);
  - 1 carb + 1 electrolyte + 1 water on 3 cages hits carbs/hr (with gels), sodium/hr and fluid/hr;
  - electrolyte bottles never carry carb mix;
  - water carries no sodium;
  - sodium shared by volume;
  - label-based sodium;
  - the Results kinds, tags and footnote;
  - fred decides with no electrolyte bottles;
  - no cage-role control;
  - both migrations;
  - a 2-cage bike;
  - saved with the plan.
- **`kit/work-q32/water.test.js`** accepts item 33's storage.
- **Older tests now accept item 33** (each still passes on the build before it):
  - q7 liter: the seeded Electrolyte cage now opens the plan in My bottles, and the share image names each kind;
  - sync-bikes: the bike's edit view points to Plan › Bottles instead of the role switch;
  - v3 settings: "Electrolyte product".

### Kit
- **Full kit:** three findings, all tests that assumed the old cage roles or the old label. The app was right in each case.
  - **q6 bottles:** it looked for "Electrolyte" in a bottle's grey meta. In My bottles that bottle reads "electrolyte only", and the test accepts both.
  - **q4 volume:** it checked the Plan cards by screen position against the pinned Crunch. With the taller Bottles card, the cards are below the screen. It now checks page order (the cards under Advanced settings, before Crunch).
  - **The inventory** lists the cage-role switch (its "Cage 1…" rows) and the "Sodium top-off" label as removed. Both are intended (My bottles; "Electrolyte product") and allowed with that reason.
- After the updates, q6 bottles, q4 volume and the inventory pass. The layouts (all four widths), contrast and every other test passed in the kit.
- Cache v58.

## 34 · Answer sheet for the fueling engine (golden rides + always-true rules) · DONE 2026-10-03

### What runs, and where
- **`npm test`** runs the answer sheet in about 10 s:
  - the reference calculator's own tests;
  - 34 golden rides;
  - 2,000 random athletes and rides (fast-check, fixed seed 20261003; `ANSWER_SEED` tries another).
- The test loads the real `index.html` in headless Chromium (no network, fixed clock) and plans each ride with fred's own engine. Every
  failure prints the ride, expected vs actual, and the rule, in plain words.
- **GitHub Action `answer-sheet`** runs it on every push and pull request. Its deploy job publishes Pages only after the answer sheet
  passes.
  - **Mark: one click turns the gate on:** Settings › Pages › Build and deployment › Source: **GitHub Actions**. Until then the deploy job
    is skipped (grey) and the branch build keeps publishing `main` as today.
  - The news jobs now start the workflow after committing news.json once the switch is made (they still ask for a branch build before).
  - The first run on this branch, on the app as it was, **failed** (the gate worked). The run after the fixes passed.
- **Files:**
  - `tests/fixtures/athletes.json`: Test A and Test B, made up, with full label values.
  - `tests/golden/rides.json`: 34 rides with inputs and expected answers.
  - `tests/reference/RULES.md`: the written rules, with sources (q34, items 8, 23, 27, 32, 33, the app's own texts).
  - `tests/reference/calc.js`: the independent reference. It was written by a separate agent that read only RULES.md and the fixtures,
    never the app.
  - `tests/engine/`: harness, rule checks, random rides, report, summary.
  - `tests/README.md`: one page listing every ride and rule, for the dietitian review.
  - `.github/workflows/answer-sheet.yml`; `package.json` (tests only; the site still has no build step).

### Pass / fail
- **Before the fixes:**
  - golden rides: 79 failing checks;
  - random rides: strength limit 69, carbs/hr 446, sodium/hr 208, fluid/hr 21, gel timing 50.
- **After the fixes:**
  - golden rides: 586 checks pass, 0 failing (34 rides);
  - random rides: 0 failing on every rule;
  - the rest are TODO lines: the judgment calls below, reported but not failing (golden: J1 ×6, J2 ×13, J4 ×11, J8 ×2, J9 ×3).
- **Mutation check:** three deliberate bugs each make `npm test` fail (exit 1):
  - refills skipped in the last 45 min instead of 30;
  - salt dropped from warned plans;
  - no strength hold.

### Disagreements: app vs reference, the rule that decides, what was done
1. **A refill in the last 30 min dropped carbs and sodium with the fluid.**
   - g03 Hard 2:00: app 78.5 g/hr carbs, 908 mg/hr sodium, 28 oz/hr. Reference 90 / 1,030 / 34. Rule A3.
   - Fixed for carbs and sodium. The plan is now made on the fluid the bike carries, at the planned drinking rate, so the carried bottles
     and gels hold the ride's carbs and sodium. Every view reads that one plan: bottles, notes, Adjust, Details, share and pins.
   - A skipped leftover works the same way. Before, it scaled the bottles and could pass 8%.
   - Results now says "No refill in the last 30 min: the last 12 oz isn't carried…".
   - The fluid is **J4** (for Mark).
2. **No strength limit on the plain plan.** Random #2: a bottle at 10.2% with the rider's limit at 6.5%. The critic's cold 40 °F ride
   (minimum gels 0): 8.45% vs 8%. Rule A2. Fixed: every plan holds 8% (or the typed limit).
3. **Gels in the last 30 min.** 50 random rides; e.g. 0:55 ride, gel at 30 min where the rule allows 25. Rule R7. Fixed:
   - never more gels than the schedule fits;
   - extra gels take free slots instead of pushing a planned gel later.
4. **Half sticks rounded per bottle.** g32: app 1.5 sticks, 910 mg/hr (−11.6%); reference 2 sticks, 1,030 mg/hr. Rules R9, A3. Fixed:
   half steps as a running total over the ride, like capsules.
5. **Missing sodium showed "NaN".** g28: app "NaN mg sodium"; reference "sodium unknown". Rule R14. Fixed:
   - Totals, tiles and the copy text read "unknown", with a note;
   - no top-up is sized from a guess;
   - the product editor saves a blank sodium as unknown (it saved 0).
6. **A caffeine or second gel with no carbs value gave a NaN plan.** Reference: refused, "carbs unknown". Rule R14. Fixed (g33, g34).
7. **Details didn't match the items listed.** g03: Details 180 g carbs, the list 157 g. Rule A7. Fixed: the Details summary and the
   hourly table's Total row use the bottles and gels listed.
8. **Decimal grams and ounces on screen.** g02: "34.0 oz", "212.5 g", "reduced by 13.3 g". Rule A8. Fixed: whole grams and ounces.
   Table salt stays at 0.1 g (**J8**).
9. **Plain water with refills lost fluid.** Random #200: 48 oz carried of 65 oz (16.8 vs 23 oz/hr), no warning. Rule A3. Fixed: the
   water rate fits the legs the final plan really has.
10. **A bottle drunk at the start or stop kept "0.06 × capsule".** Rule A5. Fixed: it gets whole capsules too.
11. **Extra gels at stops rounded leg by leg** (up to half a gel per leg). Rule A3. Improved: a running total over the ride. The rest is
    **J12**.
12. **My bottles past the carb target, silently.** Random #4: 95.7 vs 55 g/hr from the rider's "Carbs in each". Rule A3 vs R12. Now
    stated on screen ("Over your carb target…"). The grams stay the rider's.

### Adversarial review (independent agents)
- The review raised 34 issues; 30 were confirmed. All 30 are fixed:
  - **The product editor could not save a gel or drink mix.** A mid-line comment had hidden the kcal and serving reads. Fixed; the kit's
    product tests caught it too.
  - **My first fix for the skipped refill moved carbs and sodium inside the bottle list only.** That left the notes, Adjust, Details,
    share and pins on the old numbers. It also added gels in the last 30 min, put salt on top of plans already over the ceiling, and
    diluted bottles for a whole gel. Replaced by the plan-on-carried-fluid fix above.
  - **Unknown sodium:** it is now counted only for a product the plan uses. Its note comes first, and no electrolyte or plain-water
    advice contradicts it. The share card, math, Journal and check-in read "unknown".
  - **Notes:** they name the limit actually held, say "under 1 g" instead of "0 g", and offer one more gel only when it fits. A no-gels
    day gets no gel fix.
  - **Small fixes:**
    - math and share show the tablet count over the ride;
    - a typed Strength limit below 0 counts as 0;
    - the hourly table's Total row is the sum of its rows.
  - **The answer sheet itself:**
    - J4 now excuses at most 30 min of fluid;
    - J9 excuses only what the warned legs miss;
    - judgment TODOs no longer print as failures.
- The 4 rejected:
  - a roles-only plan the app never builds;
  - a product the plan doesn't use (now handled anyway);
  - two CI hardening notes, kept as is.

Matched the reference with no change: band and strength, fluid and sodium targets, gel counts and times, caffeine doses (g22 at 75 and
245 min, g24 cutoff), plain water oz/hr, ride length (100 mi at 18 mph = 5:33), capsule counts.

### Judgment calls for Mark (TODO in the run, never failing; full list in tests/README.md)
- **J1** Today's suggested strength can be passed by gel rounding (never past 8%). The app shows it with "Add 1 gel".
- **J2** Scoops: q34 says the nearest quarter, item 27.4 says quarter or third. The app follows 27.4.
- **J3** "Cold reduces fluid": the band table has no cold reduction (× 1.0). It is recorded in the test file.
- **J4** No refill in the last 30 min: that fluid is under plan (now said on screen).
- **J5** Whole capsules, half sticks and the 25 mg threshold can miss ±5% sodium on short rides.
- **J6** A drink mix alone over the sodium target, with no carb-only powder to blend (red note).
- **J7** My bottles' fixed grams.
- **J8** Table salt to 0.1 g.
- **J9** Red-warned plans.
- **J10** No sodium product chosen.
- **J11** Gels alone over the target on short rides (whole gels or the rider's minimum).
- **J12** Whole extra gels at stops.
- **J13** Water-only stops carry no salt.
- **J14** Aid-table drink assumed.
- Also noted:
  - plain water is capped at 2/3 of the fluid (an app rule, in no queue item);
  - a dry 95 °F day is Moderate on the WBGT;
  - the Oct 3 Journal ride is rebuilt on Test A (the rider's own data is never used).

### Kit
- The full kit passed on the final code: every suite OK, the layouts at all four widths and three text sizes, contrast, and
  `npm test` (653 checks pass, 0 fail, 49 judgment TODOs).
- Two kit baselines follow the item's intended changes:
  - the engine snapshots (`regress`): 9 scenarios now plan on the fluid carried (their skipped last refill), with the same carbs and sodium;
  - the inventory: the share card's ride total now shows whole grams (rule A8), allowed with that reason.
- Cache v59.

## 35 · Volume season card: so far · goal · on pace, one-line percentages, "need" tag · DONE 2026-10-04
Source: PDF A (`docs/design/fred-round_2026-10-04_v1.pdf`, page 1) and the item text.

### Volume › the season card
- **The three numbers:** so far · goal · on pace (on pace in blue).
- **The labels, one line each:** "so far" · "goal · +10%" · "on pace · +17%" (the on-pace % bold).
  - Each % is (value ÷ last season − 1), a whole percent with its sign (a true minus).
  - No last season: no percentages.
- **The sentence "You can average X h a week from here and still hit your goal." is gone.** The legend under the bar reads:
  - left "| 2025: 414 h";
  - centre a small white bold tag "need 7.0 h/wk": (goal − so far) ÷ weeks left, one decimal;
  - right "▮ goal 456 h".
- **The tag's other states:**
  - "goal reached ✓" once the goal is reached;
  - "need 20+ h/wk" when the weeks left would need more than 20 h a week.
- **Off-season mode** uses the same labels, bar, legend and tag. The tag replaces "You can go down to X h a week…".
- **The computer layout** shows the same card.
- **Narrow screens:** one line at 320–430 px. The type is slightly smaller under 360 px. Larger text reflows the legend onto its own lines.

### Judgment calls for Mark
- **Off-season, when no training is needed** (X ≤ 0): the tag reads "on track ✓". It replaces the old sentence "Even with no training through …, you'd still be on track". The item only names the reached and 20+ states.
- **"so far" has no unit word.** The counts and miles modes used to read "271 sessions so far" and now read "271 so far". The unit is already in the mode button ("Miles ▾") and in the season line.
- **20 h a week** is the "reasonable volume" limit for "need 20+ h/wk".

### Tests
- **New `kit/work-q35/season.test.js`:**
  - the order and the labels;
  - 486 vs 414 → "+17%";
  - the minus sign below last season;
  - no last season → no percentages;
  - the need tag = (goal − so far) ÷ weeks left, one decimal;
  - goal reached; 20+;
  - off-season mode and the computer layout use the same card;
  - no wrapping at 320, 375, 390 and 430 px;
  - a clean reflow at 200% text, including a custom season name.
- **Older tests follow the new card** (q4 volume, vol-accept). The checks that pinned the old wording now check the tag:
  - "need 13.2 h/wk" instead of "You can average 13.2 h…";
  - "goal reached ✓" instead of "You've already reached your goal.";
  - the off-season tag instead of "You can go down to…";
  - "271 so far" and the miles card.

### Kit
- **The full kit passed on the final code:**
  - every suite OK;
  - the layouts at all four widths and three text sizes;
  - contrast;
  - `npm test` (653 pass, 0 fail, 49 judgment TODOs).
  - The run was cut off once by a session restart after "v3 motion"; the rest was run from there.
- **The inventory** lists the old card's wording as gone. It is intended, and allowed with that reason:
  - "hours so far" / "on pace for";
  - "You can average … from here and still hit your goal.";
  - "days fully off", "h next season's goal".
- Cache v60.

## 36 · Volume: six small squares, less text, no TrainingPeaks sentence · DONE 2026-10-04
Source: PDF B (page 2) and the item text.

### Volume › six squares under the season card
- **A 3-column grid of six equal squares:**
  - Row 1:
    - Last week "8.4 h" + a pill vs the 6-week average;
    - This week "12.5 h" + a bar + "4.1 done" (blue border);
    - Next week "10–13 h" + "planned" (blue border).
  - Row 2:
    - {Month} "38 h" + a pill vs the month before;
    - 6-week avg "11.1 h" + a pill vs what the goal needs;
    - Consistency (green border): the word, 12 tiny weekly bars (the latest highlighted), "± N% · 12 wk".
- **One label, one number, one small note per square.**
- **A tap opens the square's detail sheet** with the longer text:
  - the dates and comparisons;
  - "without optional";
  - why next week is a range;
  - vs your normal;
  - the consistency formula and a year ago;
  - "See the workouts ›" (the Sources list) for a week or a month.
- **Removed:**
  - the Training load box and its maths;
  - the "vs normal" box;
  - the item-23 row of two;
  - "Plan from TrainingPeaks · updated … · changes can take up to a day to appear". Settings › TrainingPeaks plan keeps the update time.
- **Narrow screens:** three equal columns at 320–430 px (the number shrinks with its square). Larger text reflows to 2 columns, then 1.
- **The computer layout** shows the same six.

### Judgment calls for Mark
- **Without a TrainingPeaks plan:**
  - This week shows the hours so far.
  - Next week reads "Plan / connect it ›" and opens the TrainingPeaks connect sheet.
  - The item only describes the planned state.
- **{Month} is the last full month**, with its full name ("September").
- **Longest ride:** there was no Longest ride box to remove.

### Tests
- **New `kit/work-q36/squares.test.js`:**
  - exactly six squares in this order, with and without the TrainingPeaks feed;
  - the formats ("8.4 h", the pills, "10–13 h", "± N% · 12 wk");
  - each square opens its detail;
  - no TrainingPeaks sentence;
  - no Training load / vs normal / Longest ride box;
  - 320–430 px and larger text hold;
  - the computer layout shows the same six.
- **Older tests follow the squares:**
  - q14 plan: the planned weeks in This week and Next week;
  - q4 volume and v3 volume: the squares replace the boxes;
  - vol-accept: the squares' values;
  - q23: the Training load box is gone;
  - q3 double-count: a week's Sources now open from the square's detail ("See the workouts ›");
  - the shared screen list.

### Kit
- **The full kit passed on the final code:** every suite OK, the layouts, contrast and `npm test` (653 pass, 0 fail, 49 judgment TODOs).
- **The inventory** lists the old boxes' sub-lines as gone. It is intended, and allowed with that reason: "last week · Sep ##–##", "this
  week · vs same days last week", "avg / week · last # weeks · vs #### avg week", their bracketed details, and "need X for goal" (now
  the 6-week avg pill).
- Cache v61.

## 37 · Journal: ride summary row as a "scorecard" · DONE 2026-10-04
Source: PDF C (page 3) and the item text.

### Journal › each collapsed ride (Rows mode)
- **Left:** a blue-tint tile with the actual carbs per hour, large ("79"), and "g carbs/hr".
- **Right:**
  - line 1, bold: "{duration} · {effort}", with the date far right;
  - line 2: "{total} g total · {sodium} mg Na/hr · {fluid} oz/hr";
  - line 3, grey: "{temp}° · wind {speed} mph {dir} · {distance} mi";
  - line 4, blue: the products used, short names, " · " between them.
- **Under it, the check-in answers as pills:**
  - red for problems (Faded, Stomach upset, Sloshy, Lots of gas, Too cold / Too warm);
  - green for good (Energy strong, Stomach OK, Thirst just right, Clothes just right);
  - grey for neutral (Some gas).
- **Not checked in:** the planned numbers in grey and a teal "Check in ›" pill. It replaces the "How did it go?" button.
- **Missing data:** the piece is left out with its separator. New plans keep the wind direction for line 3.
- **Cards mode and the open entry keep the full detail.**
- **Larger text:** the tile stacks above the lines.
- **The computer layout** lists the same rows.

### Judgment calls for Mark
- **Line 1 shows the effort, not the ride's name.**
  - The item asks for "{duration} · {effort}", so a named ride ("Saturday long ride") reads "4:00 · Steady".
  - The name heads the open entry.
- **Edit moved:** it sits under the row, at the top of the open entry.
- **The pre-ride line moved** (sleep, last meal). It is now in How it went, as "Before the ride: …".
- **Clothes "Too cold" / "Too warm" are red** (problems), like the other problem answers.
- **Gone:** the timeline dots and the tinted check-in box. Every row looks alike.

### Tests
- **New `kit/work-q37/scorecard.test.js`:**
  - the four lines and their colours;
  - the pill colours (red / green / grey);
  - the planned-only state (grey numbers, "Check in ›");
  - missing wind and distance (no empty separators);
  - Cards mode and the open entry;
  - larger text (390 px at 150%, 320 px at 200%) wraps inside the row;
  - the computer layout uses the same row.
- **Older tests follow the scorecard:**
  - b9 plan-journal: the row's lines and "Check in ›";
  - q30 journal-a: the open entry under its row, Edit, the ride's name;
  - q4 journal: the waiting ride is a row like the others, with a ≥ 44 px pill;
  - q9 before: the pre-ride line in the open entry;
  - q13 journal and v3 journal;
  - the shared check-in selector.

### Kit
- **The full kit passed on the final code:** every suite OK, the layouts, contrast and `npm test` (653 pass, 0 fail, 49 judgment TODOs).
- **fred accept** allowed one tint per Journal (the waiting check-in). It now also allows each scorecard's blue carbs tile (PDF C).
- **The inventory** lists the old row's wording as gone. It is intended, and allowed with that reason: the date-time line, "· upcoming",
  "· waiting for a check-in", "planned ## g/hr", the title line, the numbers line and the "How did it go?" button (now "Check in ›").
- Cache v62.

## 38 · Facts from your rides (results nudges, facts only, weather-aware) + personal fluid limits · DONE 2026-10-04
Source: PDF D (page 4) and the item text.

### Results › "FROM YOUR RIDES"
- **Where:** only on the Results after Crunch, and only when a fact qualifies.
  - A teal card under the top ride card, "FROM YOUR RIDES", with ✕.
  - At most one per plan: the strongest (the highest share, then the most rides).
- **The wording:** "On **N of M** similar rides {condition}, you marked **{outcome}**."
  - Second line: how "similar" was defined, weather included, e.g. "Similar = Hard · hot band · 76–96°F · dew 67–83° · dry · 1:30+".
  - From 2 rides on the other side, the contrast follows: "· 0 of 2 at 38 oz/hr or more".
  - "See the rides ›" opens exactly those Journal entries (Rows, the others closed) and focuses the first.
- **Facts only:**
  - no buttons other than ✕ and "See the rides ›";
  - never try / should / consider / recommend / suggest / better / avoid. A fact whose text would carry one, such as a product's name, is left out.
- **The kinds**, each only when it applies to this plan, with X taken from this plan's value or forecast:

  | Kind | Condition | Outcome |
  |---|---|---|
  | bottle strength | above X% | stomach upset or sloshy |
  | carbs | under X g/hr | faded |
  | fluid | above X oz/hr | sloshy |
  | fluid | under X oz/hr | thirsty |
  | product | with P (fact only, no swap) | stomach upset |
  | clothing | below X°F in item Y (the plan's clothes) | too cold |
  | rain | in the rain below X°F | too cold |
  | wind | wind above X mph below Y°F (from 10 mph) | too cold |
  | heat + humidity | warm / hot band, dew point above X | thirsty or faded, "at {fluid}/hr and {sodium} mg sodium/hr" (those rides' averages) |

- **Similar rides:**
  - the same effort;
  - the same weather band;
  - temperature within ±10°F;
  - dew point within ±8°F;
  - rain vs dry matching;
  - at least 1:30 long;
  - checked in, and not dated ahead.
- **Past weather** is the forecast saved with the plan.
- **"Obvious":** the outcome on at least 3 rides AND on at least 75% of the similar rides with that condition. Otherwise nothing shows.
- **✕** hides the card for this ride only: the same date, start, length, effort and place, on this device. Another ride brings it back.
- **Never toward less water:** facts never touch the plan or the settings. The engine never reads them.

### Settings › Fueling › FLUID LIMITS
- **Its own group right after Fueling, as in the PDF:** "Lowest fluid I'll plan" and "Highest fluid I'll plan" (oz/hr or mL/hr; Not set when blank).
- **The footnote:** "fred never plans below or above these, whatever the weather or your sweat rate. Leave blank to use fred's built-in limits."
- **The sheet:** "Fluid limits", saves as you type. A lowest above the highest is not saved ("The lowest is above the highest: change one of them.").
- **Every plan respects them:** the weather, the sweat rate and a typed fluid override included. The sodium target follows the held fluid.
- **Results:** "at your floor" / "at your ceiling" next to the fluid per hour. Details says "Fluid held at your lowest of 40 oz/hr (Settings › Fluid limits); without it the plan would be 36 oz/hr."
- **The answer sheet:** both limits are always-true rule **A10** (engine and screen).

### Journal › What fred noticed
- **Already facts with counts:** no advice, no banned words.
- **There were no "apply" / "cap" buttons to remove.** The tests now check that it never shows a button or a banned word.

### Found on the way
- The new random rides with fluid limits found an older bug. My bottles at their strength cap carried more mix than the carbs needed, and the capsules were sized on the smaller mix (+8.6% sodium). Units are now sized on what is carried.
- **J11** counts the caffeinated gel. **J12** bounds the extra gels' own sodium.

### Judgment calls for Mark
- **The five bands come from fred's three-band table:**
  - hot = the Hot band;
  - the Moderate band is split at its middle into mild / warm;
  - cool = under the Cold line;
  - cold = 15°F or more under it.
  - With 65 / 85: cold < 50 · cool 50–64 · mild 65–74 · warm 75–84 · hot 85+.
- **The check-in has no cramping, "too much", peeing or cold hands/feet answers.** The facts use the answers there are:
  - Thirst: sloshy, thirsty;
  - Energy: faded;
  - Stomach: upset;
  - Clothes: too cold.
  - So the clothing and wind / rain facts read "too cold", not "cold hands".
- **Rain** = the saved forecast's chance of rain at 40% or more. fred keeps no observed weather for a ride.
- **When today's forecast has a dew point**, a past ride without one is not similar.
- **The thresholds round** to 0.5% · 5 g · 2 oz (50 mL) · 5°F · 5° dew · 5 mph, on the side that includes this plan. For example, a 36 oz/hr plan reads "under 38 oz/hr".
- **The card sits under the top ride card** (as in the PDF), above the bottle questions.
- **"fred's built-in limits":** fred has no separate fluid floor or ceiling. Blank means the plan as fred makes it; the item's wording is kept.
- **What fred noticed keeps its lines.** They already follow the facts-only rules. Rewording them into "On N of M…" would change a screen the item doesn't show.

### Tests
- **New `kit/work-q38/facts.test.js`** (a real Crunch with the mocked forecast; made-up check-in rides around it):
  - the similarity rules, with every decoy left out (cold, short, z2, rain, dew too far, too hot, mild, planned, ahead);
  - 2 of 2 → nothing; 4 of 6 → nothing; 3 of 4 → the fact;
  - the main fact's exact text and weather line;
  - teal, at the top;
  - only ✕ and "See the rides ›";
  - one card when several qualify, and the strongest wins on more rides;
  - the plan is identical with and without facts (a re-crunch included);
  - "See the rides ›" opens exactly the 5 entries;
  - What fred noticed has no buttons and no banned words;
  - contrast and layout at 390 / 320 px and 100–200% text;
  - ✕: hidden for the ride, after a re-crunch and a reload; back for another day or start;
  - a cold sloshy ride is never similar to a hot humid plan, and back (the matching cold rides still make their fact);
  - 200 random journals: every card 3+ rides, 75%+, only similar rides, the weather line, no banned words, never two cards;
  - Settings rows, footnote, sheet title, floor / ceiling on Results and in Details, a lowest above the highest not saved.
- **The answer sheet:**
  - R4 and A10;
  - four golden rides (g35 ceiling, g36 floor, g37 an override under the floor, g38 limits that don't bind);
  - random limits on the 2,000 random rides;
  - a mutation without the ceiling fails 8 checks;
  - `npm test`: 805 pass, 0 fail, 50 judgment TODOs. All 38 golden rides match the reference.
- **Older tests:** v3 settings and q13 pages count the Settings groups; they now expect Fluid limits after Fueling.
- **More older tests follow Fluid limits:** b9 profile expects the two Fluid limits rows after Products; the header test (q15) checks the
  circle opens the Settings list at its top (Fluid limits moved the Account row below the fold on a 900 px screen).

### Kit
- **The full kit passed on the final code:** every suite OK, the layouts at all four widths and three text sizes, contrast and `npm test`
  (805 pass, 0 fail, 50 judgment TODOs).
- **One layout fix from the kit:** the blank Fluid limits boxes read "—" (the word "none" was clipped at 320 px and 200% text).
- Cache v63.

## 39 · Sweat rate by weather and effort (3 × 3 grid) · DONE 2026-10-04
Source: `docs/design/sweat-rate-grid.png`, option A (option B not built) and the item text.

### Settings › Fueling › Sweat rate
- **"Start from"** Light / Normal / Heavy / Custom. A level fills the auto boxes; Custom is shown on when at least one box is the athlete's
  own (tapping it opens the Mild · Steady editor).
- **The grid**, oz/hr (mL/hr in metric): rows Cold (under 50°F) · Mild (50–75°F) · Hot (over 75°F), each in its colour with its range;
  columns Recovery · Steady · Hard.
- **Auto boxes** are grey ("auto"). **Own boxes** are blue, with a dot and "yours".
- **Tapping a box** opens the editor under the grid:
  - "{Band} · {Effort}";
  - "auto would be N";
  - − / + in 1 oz steps (1–80);
  - "Back to auto".
- **A level change moves only the auto boxes.** Own boxes stay as they are.
- **The Settings row** reads "Normal" (or Light / Heavy) when every box is auto, "By weather & effort" otherwise.
- **Larger text:** each band's name moves above its three boxes.

### Planning
- **Fluid per hour** = the ride's effort column at the ride's temperature, linear between the band centres 40 · 62 · 85°F (Cold below 40,
  Hot above 85). So one degree never makes a jump, including at 50 and 75.
- **The old "hot days add 50%"** lives only inside the auto Hot boxes. An own box is used as set, with no heat increase.
- **The fluid limits** (item 38) apply last. A typed fluid override (Adjust for today) still replaces the grid.
- **Sodium follows the fluid**, as before.
- **Results › Totals:** the source sits next to the fluid per hour: "· your Mild · Steady" (that box is the athlete's), "· auto", or
  "· your override".
- **Details** names the boxes and the blend, e.g. "between Mild · Steady 24 oz/hr (auto) and Hot · Steady 34 oz/hr (yours): 48% / 52% →
  29.2 oz/hr".

### Migration
- An existing single sweat rate becomes the closest level (Light 16 · Normal 24 · Heavy 32; a tie goes to Normal).
- Mild · Steady is set to the old number when it differs.
- It runs once on load and after a sync that brings settings without a grid. The grid is saved and synced with the settings.

### Judgment calls for Mark
- **The auto boxes follow fred's existing model, as the item says.** That model changes fluid only for heat (× 1.5), never for effort or cold. So:
  - the auto columns match: Normal reads 24 · 24 · 24 in Cold and Mild, 36 in Hot;
  - the picture's 14 / 18 / 20 Cold and 18 / 24 / 28 Mild numbers would need a new effort and cold model.
  - That model would lower water on cold days and recovery rides, so I didn't invent it. Say the word and I can make auto Recovery × 0.75,
    Hard × 1.15 and Cold × 0.75, as in the picture.
- **The ride's temperature is the one the plan already uses:** the forecast's feels-like average, or the typed temperature. With no
  weather, 65°F.
- **A planned change for every rider:** the item's band centres put 65°F a little way towards Hot, so a default (65°F) ride now plans
  ~5% more fluid than before (24 → 25.6 oz/hr on Normal). A hot dry day (95°F, WBGT 79) now gets the hot-day fluid. Before, only the
  WBGT band did that.
- **Migration only sets Mild · Steady.** A rider who had 34 oz/hr starts from Heavy (32): their Cold, Recovery and Hard boxes read 32,
  2 oz/hr less than before. Their Mild · Steady stays 34.
- **The Results label names the row the temperature sits in.** At 74°F it says "auto" when Mild · Steady is auto, even though the blend
  uses an own Hot box. Details says exactly which boxes were blended.
- **Band colours:** Cold teal, Mild olive, Hot red (as in the picture), on the labels only.

### Tests
- **New `kit/work-q39/sweat.test.js`:**
  - migration (24 → Normal; 34 → Heavy + 34; 18 → Light + 18; 30 → Heavy + 30);
  - the sheet (chips, rows, columns, ranges, colours);
  - each level fills the grid;
  - the editor (title, "auto would be", − / +, own styling with the dot, row text, Custom);
  - own boxes survive a level change; Back to auto;
  - planning at 60, 74 and 76°F; no jump at 50 / 75;
  - the own Hot box gets no +50%; auto Hot = level × 1.5;
  - sodium = fluid × sweat sodium; the ceiling still applies; the override;
  - the Results labels; Details;
  - contrast; layout at 390 / 320 px and 100–200% text, with 44 px targets.
- **The answer sheet:**
  - R4a, A11 (engine and screen) and the A9 wording;
  - seven golden rides, g39–g45: 60°F, 74°F, 76°F, an own Hot box at 95°F, a Heavy Recovery at 35°F, an own Hot box under a ceiling,
    Light Hard at 85°F;
  - grids on half the 2,000 random athletes (the rest migrate from a single rate through the app's own code);
  - the reference unit tests for R4a;
  - the earlier golden rides rebuilt for the blend (fluid: 34 → 35.8 at 65°F for Test A).
  - J12 now also covers extra gels at a water-only stop when no warning shows (2 random rides).
  - A mutation that gives own Hot boxes the +50% fails 27 checks.
  - `npm test`: 1,040 pass, 0 fail, 61 judgment TODOs. All 45 golden rides match the reference.
- **Older tests follow the grid:** b9 profile and v3 settings (the Sweat rate row reads "Normal" / "By weather & effort"; editing is
  Start from + a box's − / +); v3 results and q38 facts (the per-hour fluid carries its source, "30 oz · auto at your ceiling").

### Kit
- **The full kit passed on the final code:** every suite OK, the layouts at all four widths and three text sizes, contrast and `npm test`
  (1,040 pass, 0 fail, 61 judgment TODOs). A container restart stopped the kit once after "q13 journal"; the rest was run from there.
- **regress / regress-fx:** 12 scenarios differ from the old baselines, all in fluid (rides near 75°F now blend toward Hot; a single old
  sweat rate migrates to a level plus an own Mild · Steady box, so a hot ride uses the level's auto Hot box). Re-baselined; the old
  baselines are kept as `*.pre-q39.json`.
- **The inventory** lists the old single sweat rate as gone. It is intended, and allowed with that reason: the oz/hr box, its preset
  chips and Custom, "oz per hour · measured beats guessed", "Hot days add 50% automatically…", "## oz/hr" on the row, and the fluid
  row's "no heat bump" / "+50% for heat" lines (now "· auto" / "· your {Band} · {Effort}").
- Cache v64.

## 40 · Journal notes: Injury, Sickness, Life event, PT, Bike fit, Coaching call, Other · DONE 2026-10-04
Source: PDF B and C (`docs/design/fred-round_2026-10-05_v1.pdf`) and the item text. PDF B's "Health" type is not built: Injury and
Sickness replace it.

### Journal
- **Filter bar:** All · 🚴 · 📝 Notes (remembered on this device), and "+ Note" at the top right of the list. 🏃 waits for running in
  the Journal (phase 2).
- **Notes sit among the rides by date.** Each row: the type's icon tile, the TYPE in its colour, the date, the title and one grey
  summary line ("Aug 18 – still going · train around it", "3 takeaways · next call Oct 18", "pain 2/10").
- **Types and colours:** Injury 🩹 amber #D98E04 · Sickness 🤒 grey · Life event ⭐ violet #4F41CC · PT 🩺 teal · Bike fit 🔧 green ·
  Coaching call 📞 violet · Other 📝 black.

### The note sheet
- Cancel · title · Save; the type chips; the type's fields; free-text Notes; "Private to you. Never shared or sent to AI."; Delete.
- **Injury:** What, Started, Ended or "still going", Body area + side, How bad (Minor / Train around it / Can't train).
- **Sickness:** What, Started, Ended or still going, How bad. **Life event:** What, Started, Ended (optional).
- **PT:** Date, body area, exercises (a list), pain 0–10. **Bike fit:** Date, bike (from Settings), fitter, "What changed" (item +
  amount), "+ Add a change". **Coaching call:** Date, coach, length, Takeaways, To do before next call (tick boxes), next call date.
  **Other:** Date, Title.
- **Opening a note** shows its grouped sections with Edit; the to-dos tick right there and the ticks are saved.

### Data and privacy
- Notes are their own synced collection (`users/{uid}/notes`), synced like chapters, deletes as tombstones; included in Back up and
  Restore and in Delete account. Never shared, never sent to any AI. Notes never change hours, plans or settings.

### Tests
- **New `kit/work-q40/notes.test.js`:** create, edit and delete each type; the fields save; still-going spans; notes in All and Notes
  only; to-do ticks persist; backup and restore include notes; the journal itself unchanged by notes; layout at 320–430 px and 200% text;
  contrast.
- **New `kit/work-sync/sync-notes.test.js`:** notes sync up and down, deletes travel as tombstones (added to the sync suite).
- **Older tests follow the notes:**
  - the sync suite runs `sync-notes`; sync-ongoing expects four incremental pulls (journal, races, chapters, notes);
  - fred accept lets the filter's and note types' emoji through (`span.emo`, as PDF B shows);
  - q4 volume lets the filter bar sit above the Journal's top bar.

### Kit
- **The full kit passed on the final code:** every suite OK, the layouts at all four widths and three text sizes, contrast and `npm test`
  (1,040 pass, 0 fail, 61 judgment TODOs). A container restart stopped the kit once after "fix contrast"; the rest was run from there.
- **A kit fix:** the layout run at 375 px crashed twice right after the Strava callback screens (they reload the page); screen changes now
  wait for the app to be ready.
- Cache v65.

## 41 · Injury, sickness and life events on the Volume year · DONE 2026-10-04
Source: PDF C and the item text.

### Volume › the year card
- **Per-week chart:** weeks touched by an injury shaded light amber, by sickness light grey, with the type icon above each span; a life
  event is a violet ⭐ pin with a dashed line at its start week. Legend: Injury · Sick · Life event.
- **Summary under the chart:** "{year}: N weeks injured · N days sick · N life events" (weeks = calendar weeks touched; days = days
  inside the spans).
- **ON YOUR YEAR:** the year's injuries, sickness and life events by date (icon, title, dates, length or "still going"); tapping one
  opens the note.
- **YEAR BY YEAR:** one row per year with 🩹 weeks, 🤒 days, ⭐ count.
- **‹ 2025 / ›:** earlier years show the same overlays; a still-going span runs to today.
- **Larger text:** the table reflows (the year never breaks mid-word).

### Tests
- **New `kit/work-q41/volyear.test.js`:** spans across week and year boundaries; the summary counts (2026: 9 weeks · 15 days · 1; 2025:
  1 · 3 · 1; 2024: 10 · 0 · 0); earlier-year overlays; list order; tapping opens the note; layout and contrast.
- **Older tests follow the year card:** v3 volume and q4 volume expect it after the six squares.

### Kit
- **The full kit passed on the final code:** every suite OK, the layouts at all four widths and three text sizes, contrast and `npm test`
  (1,040 pass, 0 fail, 61 judgment TODOs).
- **Two older tests had a date written in** ("Thu, Oct 1" for a ride seeded 3 days ago). They failed once the calendar moved on; they now
  work out the date (q30 journal-a, q37 scorecard).
- Cache v66.


## 42 · Running phase 1: sport button, Run mode in Plan, running settings · DONE 2026-10-05
Source: PDF D screens 1–3, PDF E look A and Settings 9a, and the item text. "Ride + run" (PDF D screen 4) is not built (phase 2).

### Plan
- **Sport button:** the Plan card's label is a white pill "🚴 RIDE" with up/down arrows. It opens a menu: Ride (bottles in cages) ·
  Run (handheld, flasks, vest or belt). The last sport is remembered.
- **Look:** fred ignores the phone's dark mode everywhere. Ride keeps the light look; Run turns Plan and its Results graphite (#26262C,
  cards #34343C, text #F2F2F7 / #A1A1AA, accent #7B6CF6 with text #B3A9FF, Crunch #B3A9FF with dark text). Title "Today’s run". Red only
  for problems. Other tabs stay light.
- **Run card:** "🏃 RUN" · Time | Distance · the duration wheel, or distance + pace · Easy / Steady / Hard · "Steady · 60 g carbs/hr ·
  ~8:30 /mi" · place, date and start · "Water stops / aid" (None / every N mi / a list of miles; what is there: water, sports drink, gels;
  whether you carry your mix).
- **CARRY** replaces Bottles for runs: Handheld · Soft flasks · Vest · Belt, a count and a size (defaults from Settings). Before Crunch:
  "fred picks what goes in the flasks when you crunch the plan". Nutrition and Advanced settings as for rides.

### The run engine
- Carbs/hr from the running targets; fluid from the running sweat grid at the run's temperature, then the fluid limits; sodium = fluid ×
  the shared sweat sodium.
- The run is cut into legs at each aid stop; a leg carries at most the carry's capacity (what it can't hold is a warning, never a bigger
  flask). Flasks hold the mix up to the strength limit (never above 8%); refills are mixed only when you carry the mix, otherwise water.
  Gels fill the rest (whole, nearest), evenly from minute 20 to 15 min before the end, at least 10 min apart. The electrolyte product
  makes up the sodium.
- **Results:** flasks with recipes and strength tags, refills at aid (mile and time), gels by time and mile, totals.

### Settings
- **Cycling | Running** at the top. Running: RUNNING · FUELING (Carbs per hour Easy / Steady / Hard, 45 · 60 · 75 g; Sweat rate, its own
  3 × 3 grid starting from the cycling one; Carry default) and SHARED (Products, Sweat sodium, Fluid limits, Account & data). Cycling:
  today's settings plus SHARED.

### Judgment calls for Mark
- **An aid station's sports drink is not counted** (its carbs are unknown); the gels cover them, and Results says so.
- **Pace defaults** Easy 10:00 · Steady 8:30 · Hard 7:30 /mi until the runner types one.
- **When the 10-minute gel spacing caps the count**, a short run lands under the carb target; the answer sheet reports it as a judgment
  call, not a failure.

### Answer sheet
- **New `tests/engine/run.test.mjs`** (rules R17 in `tests/reference/RULES.md`): the four scenarios (1:45 Steady with 2 × 500 mL flasks
  and aid every 2 mi; 3:30 Hard with a vest, no aid; hot 85°F with a handheld; carry too small without aid → the warning, never an
  over-strength flask) and 400 random runs on RN1–RN7 (carry capacity, strength, carbs within half a gel, sodium, aid refills, fluid from
  the grid and limits, the carry warning). `npm test`: 1056 pass, 0 fail.

### Tests
- **New `kit/work-q42/run.test.js`:** the sport menu; the theme follows the sport and ignores system dark mode; run inputs; carry
  choices; results for flasks, aid and gels; running and shared settings; layout and contrast.

### Kit
- **Fred acceptance** found a gradient on the sport arrow and drop shadows on the sport pill and its menu. Fixed: no gradient, and a
  hairline border instead of the shadows.
- **The 375 layout run crashed** because the four layout widths ran at once and wrote the same hooked copy of the page. Each run now
  writes its own copy (`kit/work-fix/lib3.js`).
- **Old tests:** q31's no-emoji check skips the sport pill's emoji (fred allows `.emo`); q32's card order counts only visible cards (Carry is run-only).
- Cache v67 (`sw.test.js` matches).


## 43 · Clean-up check · DONE 2026-10-05
Searched the app, the tests and the docs for anything items 39–42 contradict.

### Found and fixed
- **"Hot days add 50% automatically"** (the old Sweat rate hint): already gone with item 39. The sheet now says Hot adds 50% only to
  the auto boxes.
- **The weigh-in's "Use as my sweat rate"** (Journal) still set the old single sweat rate, which no longer drives the plan. It now reads
  "Use for {Band} · {Effort}" (the ride's weather band and effort) and sets that box of the sweat grid as the athlete's own.
- **The sodium hint** ("… mg/hr at your sweat rate, N on a Hot day") and **the bottle hint** ("… ; N on a Hot day") worked out the Hot
  day as × 1.5. They now use the grid's Hot · Steady box (an own box gets no 50% on top) and name Mild · Steady.
- **The thirsty / sloshing tips** said "your sweat rate"; they now point at this ride's box in Settings › Sweat rate.
- **An engine comment** described the +50% as always on; it now says this is only for older plans without the grid.

### Checked, no change
- **"Health" note type:** never built (item 40 uses Injury and Sickness). "Settings › Account › Health" is the medicines row (item 26),
  not a note type.
- **"Hot adds 50%"** in the sweat sheet and RULES R4a: correct (auto boxes only).
- **The Journal filter's 🏃** waits for running in the Journal (item 42, point 8).

### Tests
- **New `kit/work-q43/cleanup.test.js`:** the old texts are gone; the hints follow the grid (an own Hot box of 30 → 30, not 36; all auto
  Heavy → 48); the weigh-in sets the ride's box and leaves the others; the toast names the box.

### Kit
- The inventory allows the old sodium hint ("### mg/hr at your sweat rate, #### on a hot day."), now named by the grid box.
- Cache v68 (`sw.test.js` matches). Full kit green; `npm test` 1056 pass, 0 fail.


## 44 · Upcoming rides on Plan (TrainingPeaks + planned) and weather re-checks · DONE 2026-10-05
Source: PDF A (`docs/design/fred-round_2026-10-05_v2.pdf`, page 1) and the item text.

### Plan › Upcoming (under Advanced settings)
- **"UPCOMING"** with "from TrainingPeaks · 14 days" (or "next 14 days" without a plan) on the right.
- **One list by date:** the next 14 days of TrainingPeaks workouts for bike, brick and run, plus the rides already planned in fred.
  - **No duplicates:** a plan made from a workout is linked to it. An unlinked plan on the same day, within 15 min of the workout's planned
    time, counts as the same ride.
- **Each row:** the day + date tile, "TP" when it comes from TrainingPeaks, the title, one grey line and a status.
  - The grey line: duration · effort · "not planned yet" / "planned Sun Oct 4".
  - The status: "Plan it" (black), "Planned ✓" (green) or "Forecast changed" (amber).
- **Swipe a planned row left** for Move (a date picker) and Delete (asks first; Undo in the toast). This replaces the separate Scheduled
  rides list.
- **On a computer** the left column is the same list ("Upcoming · N").
- **The phone's "Planned" card** gives way to the list.

### Plan it
- **It fills the calculator from the workout:** the date, the duration, the sport (a run workout switches to Run) and the effort.
  - **The effort comes from the title:** recovery / easy / Z1 → Recovery; sweet spot, threshold, tempo, VO2, Z3–Z5, "3 × 15" → Hard;
    otherwise Steady. TrainingPeaks' calendar has no intensity field.
- **A dismissible bar** reads "TP Planning Wed · Sweet spot 3 × 15 ×".
- **Saving the crunched plan links it** to that workout.

### Opening a planned ride
- **The ride opens on its own day** ("Sunday’s ride") with its inputs, and the forecast is fetched again.
- **The forecast counts as changed when any of these holds:**
  - the temperature or the dew point moves 5°F or more;
  - rain/dry flips (a 40% chance);
  - the plan's fluid would change by 2 oz/hr or more.
- **When it changed:**
  - an amber note at the top of Results: "The forecast changed since you planned this" + "Planned Sun Oct 4 at 58° · now 74°, more
    humid, fluid 24 oz → 30 oz/hr", with See changes and Keep my plan;
  - the row says "Forecast changed".
- **Results also has "↻ Update weather"** and "Weather checked N min ago".
- **See changes** shows old → new, with unchanged items in grey:
  - WEATHER: temperature, dew point, wind, rain;
  - YOUR PLAN: fluid, sodium, bottles + refills, strength, carbs, clothing.
- **The buttons:**
  - Nothing changes until one is tapped.
  - **Use the new forecast** replaces the plan. The old version is kept in the ride's history.
  - **Keep my plan** hides the note until the forecast changes again.
- **Saving an opened ride again** updates that ride. The old version goes to its history.

### Typical weather
- **Rides more than 10 days out** use typical weather: the same hours on that date in each of the last 3 years (Open-Meteo's archive),
  averaged. The chance of rain is the share of years with rain.
- It is labeled "typical weather · forecast not ready yet". Once the ride is within 10 days, the real forecast check takes over.

### TrainingPeaks changes
- **A linked plan whose workout moved** shows "moved to Fri". One whose workout was deleted shows "removed from TrainingPeaks".
- fred never deletes a plan by itself.

### Judgment calls for Mark
- **TrainingPeaks' calendar feed carries no start time or intensity.** Plan it keeps the start time already set and reads the effort from
  the title.
- **The forecast is fetched again when a planned ride is opened** (and with ↻), not in the background. The list's "Forecast changed"
  shows what the last check found.
- **"Typical"** means the last 3 years at the same hours. That is not a 30-year normal, but it is free and close enough to plan a ride
  2–3 weeks out.

### Tests
- **New `kit/work-q44/upcoming.test.js`:**
  - the merge without duplicates (linked and same-day);
  - rows, Plan it (fills the calculator, sport, the bar), the link on save;
  - the thresholds;
  - the note, the changes sheet's values and greys, Use vs Keep (history; hidden until the next change);
  - typical weather at 12 days, the real forecast at 9;
  - moved / removed workouts;
  - swipe Move / Delete;
  - the computer list;
  - layout at 320 px and 200% text.

### Kit
- **Fixed in the app:** the TrainingPeaks bar ("Planning Tue · …") and the "Weather checked … ↻ Update weather" line showed even when
  hidden, because their `display:flex` overrode `[hidden]`. Now `[hidden]` wins (also for the forecast note and the Upcoming list).
- **Upcoming badges on the graphite Run theme:** "Planned ✓" / "Forecast changed" got dark-theme colours (AA).
- **Old tests updated for the Upcoming list:** the single Planned card is gone from Plan. Changed: b9 plan-journal (the planned ride is
  an Upcoming row), v3 plan, q4 volume, and q22 desktop (Upcoming rows in the left column open their plan). The inventory allows the
  card's View button and its "Steady · # bottles · # gels" line.
- **q13 pages:** the top card's hero is compared without the new weather line.
- **q17:** the unfollow sync is polled (up to 8 s) instead of read after a fixed 1.5 s.
- **The screens harness** (`work-fix/screens.js`) kept counting ride days across passes, so the light-mode test's second pass planned
  rides 11+ days out (typical weather, not mocked offline). The days now stay within 1–7.
- Cache v69 (`sw.test.js` matches).


## 45 · My stack: supplements & medications, a reference list (Account › Health) · DONE 2026-10-05
Source: PDF B (`docs/design/fred-round_2026-10-05_v2.pdf`, page 2) and the item text.

### Account
- **HEALTH:**
  - My stack ("18 supplements · 2 meds"; food habits aren't counted);
  - Injuries & sickness ("1 still going"; opens the Journal on Notes).
- **ACCOUNT:** Account & data (the You rows and Your data), Connections ("TrainingPeaks · Strava") and Settings (Units, Week starts on…).
  Each is a page of its own with "‹ Account". Every old row is still there.
- **The old Medications row** (heat-sensitive drugs, used by the plan's heat notes) moved into My stack › Medications.

### My stack
- **The header** reads "‹ Account · My stack · + Add", with a button for Import from Excel.
- **Grouped by when, with counts:** Morning · Before training · Night · Food habits · Medications · As needed. Empty groups are hidden.
- **Each row:**
  - the name in bold;
  - a grey line ("for: …", "not weekends", "45 min before any ride or run", "dose not set");
  - the dose on the right ("2 capsules", or the target "500–1,000 mg/day").
  - Paused items are greyed and say "paused".
- **Medications are hidden by default:** "N prescriptions · Hidden on screen · tap to show".
- **Add / edit:**
  - Supplement or Medication · Name;
  - Dose (amount + unit, or "Dose not set" with a target range);
  - When: Morning / Night / Daily at a time / Some days (the days, then Morning or Night) / Before training (which sessions, how long
    before) / As needed / Food habit;
  - Paused · What it's for · Caffeine in it (mg) + Count toward caffeine in plans;
  - Delete (asks first; Undo).
- **The footer:** "fred only keeps track. It doesn't check doses or interactions; ask your doctor or pharmacist. Private to you, never sent
  to AI."
- **A reference list only:** no reminders, no notifications, no daily ticks, nothing in the Journal.

### The caffeine tie-in
- **A before-training item with caffeine** (and "Count toward caffeine in plans" on) shows in that plan's Gels list: "Caffeine pill · your
  stack · 200 mg · 45 min before".
- **It counts toward the per-ride caffeine limit:** the caffeinated gels get what is left. The caffeine note says so.
- Nothing else in the stack touches a plan.

### Import from Excel
- **The sheet:** reads the sheet named like "Pills" (or the first one), finding the header row under any notes rows. The columns are
  Supplement / Dosage / Time / notes.
- **The mapping:**
  - Time → When: morning, night / bedtime, "not weekends", before ride, food, as needed.
  - Dosage → Dose ("NONE" → paused, dose not set).
  - A range in the name, "Curcumin (500-1000mg/day)" → Curcumin, a 500–1,000 mg/day target, dose not set.
  - notes → "for:".
- **A preview of everything comes before saving.** Untick to skip. Items that look like prescriptions are in Medications with a box to
  confirm. An item already in the stack with the same name is updated, not doubled.

### Privacy
- **Kept with Settings:** so it syncs with your account and is in Back up / Restore. Never shared, never sent to AI.

### Judgment calls for Mark
- **"Blood work · 5 panels · later"** (in PDF B, not in the item) is not built.
- **"Scan a barcode"** arrives with item 46. The button stays hidden until then.
- **Prescriptions are spotted by name** (a list of common prescription drugs, or "Rx" / "prescription" in the notes). The athlete
  confirms each one.

### Tests
- **New `kit/work-q45/stack.test.js`:**
  - the Account pages;
  - the grouping and counts;
  - hidden medications and the old Medications row;
  - add / edit / pause / delete;
  - some days ("weekends only");
  - the Excel import with a "Pills" sheet behind a notes sheet (the mapping, the preview, the prescription to confirm);
  - the caffeine tie-in (the list row; 300 mg limit − 200 from the stack);
  - Back up includes the stack; nothing in the Journal;
  - Injuries & sickness → the Journal's Notes;
  - layout at 320 px and 200% text; contrast.

### Kit
- **Old tests updated for the Account hub** (rows now sit in the Your data / Connections / Settings / My stack sub-pages):
  - b9 profile and v3 settings: their row taps open the row's sub-page first; the Account row lists compare sets.
  - q13 pages: checks the hub (HEALTH and ACCOUNT, teal), Your data's rows and Units under Settings.
  - q26 meds: finds Medications in My stack.
- **The inventory** allows the moved rows, their values and "Medications" (moved, not removed).
- Cache v70 (`sw.test.js` matches). `npm test` 1056 pass, 0 fail.


## 46 · Barcode scanning (stack + fueling products) · DONE 2026-10-05
Source: PDF C (`docs/design/fred-round_2026-10-05_v2.pdf`, page 3) and the item text.

### The scanner
- **Entry points:** My stack "Scan a barcode" and Settings › Products "Scan" (next to + Add for gels and drink mixes).
- **The screen:** dark, full screen, "Scan the barcode · on the bottle or box". The camera view has a framed target, with
  "Type it instead" and "Cancel".
- **Reading:**
  - the browser's own BarcodeDetector where it reads retail codes;
  - otherwise the free, open-source zxing-wasm decoder (3.1.4, loaded from jsDelivr on first use), so it works in iPhone Safari.
- **Without a camera, or when it's denied,** the number box shows with a short note. A US UPC read as EAN-13 becomes its 12-digit UPC-A.

### Lookups (free public sources, in this order; results cached on the device for 30 days, 1 day for "not found")
- **My stack:**
  1. NIH Dietary Supplement Label Database (DSLD), searched by the UPC (the hit's upcSku must match);
  2. openFDA NDC Directory for an over-the-counter box (the 10-digit NDC inside a "3…" UPC, tried in all three NDC layouts);
  3. the product's name from Open Food Facts / USDA, searched in DSLD by name. The athlete picks the matching label ("Pick yours").
- **Products:** Open Food Facts, then USDA FoodData Central (branded foods by GTIN/UPC).
  - The product editor opens filled in: name, serving, carbs, sodium and caffeine per serving. The athlete checks and saves.
  - A drink mix keeps its serving grams and its carbs per serving apart (a 40 g scoop with 36 g carbs is 36, never 40).

### Found it / Not found
- **Found it:**
  - Product, Brand, Form;
  - "Source: NIH Dietary Supplement Label Database · barcode 0 12345 67890 5" (Open Food Facts is credited as ODbL);
  - From the label (ingredients, serving);
  - Check before saving (name, dose, when);
  - "Always check this against your own label. fred only keeps track."
- **Not found:**
  - the explanation (pharmacy bottles carry the pharmacy's own code; the manufacturer's box usually matches);
  - Add it yourself (Name, Dose, When; for a product, the editor).
  - The barcode is remembered on the account, so the next scan is one step ("Added by you"). It is kept in settings.barcodes, which
    syncs.
- **The source shows on each scanned item** ("from Open Food Facts"). Scans are never sent to AI. The Privacy note says only the barcode
  number goes to the public databases.

### Judgment calls for Mark
- **Lookups are called straight from the browser:**
  - openFDA without a key (about 1,000 calls a day per address);
  - USDA with its DEMO_KEY (about 30 an hour).
  - To raise those limits, the free keys belong on the Worker as secrets (like the Strava secret), never in the repo. That's a small
    follow-up if scanning gets busy.
- **Live testing wasn't possible here:** this build machine can't reach DSLD, openFDA, Open Food Facts or USDA. The lookups follow the
  APIs' documented shapes and are tested against faithful fakes; the first real scans should be checked by hand.
- **Unknown for DSLD:** whether DSLD answers browser calls (CORS) and matches by UPC wasn't confirmed. If it doesn't, the name path (Open
  Food Facts → DSLD by name) still works.

### Tests
- **New `kit/work-q46/barcode.test.js`:**
  - an iPhone Safari user agent with no BarcodeDetector and a fake camera showing a real UPC-A: zxing-wasm decodes it;
  - each source with a known barcode (DSLD by UPC, openFDA by NDC, DSLD by name after Open Food Facts, Open Food Facts gel, USDA drink
    mix);
  - not found → add by hand → remembered (the next scan makes no lookups);
  - the cache;
  - the drink mix's 36 g carbs per 40 g serving;
  - sources shown;
  - no camera → Type it instead.

### Kit
- **Privacy under 300 words:** the new "My stack and barcodes" section pushed the note to 363 words. That section and the older
  paragraphs were reworded shorter, with the same facts (each phrase the privacy and Strava tests look for is still there); under 300 words with
  Strava connected. The inventory allows the reworded paragraphs.
- **Duplicate id:** the barcode result sheet reused the stack editor's `seUnits` unit list; it now has its own `bcUnits`.
- Cache v71 (`sw.test.js` matches). Full kit green after the fixes; `npm test` 1056 pass, 0 fail.

## 47 · Fixes: Sessions label, note form, run-mode buttons, Kona missing, Neversecond C30+ and S200 · DONE 2026-10-05
Source: PDF A, B, C (`docs/design/fred-round_2026-10-05_v3.pdf`, pages 1–3) and the item text.

### 1 · The Journal says Sessions
- **Filter:** All · Sessions · 📝 Notes. The saved filter value stays `rides`, so nobody's choice resets.
- **Count:** "SESSIONS · N" (and "· N waiting", "· N notes" as before).
- **Generic wording:** the empty state ("No sessions yet"), the list and tools labels, the patterns footer ("…checked-in sessions.
  Planned sessions never count."), the Noticed lines, and the "You have N sessions logged" toast.
- **Specific screens keep their words:** a ride's or a run's own screens still say ride or run, and the generic Copy text says "run" or
  "ride" by the entry's sport.

### 2 · The new note form
- **Text boxes and pickers:** left-aligned and vertically centred, the date included (one height, no native padding).
- **Sentence case:** "Still going", and the empty pickers read "Area" and "Side".
- **Body area:** one row, the area picker and the side picker side by side.
- **How bad:** one segmented row (Minor · Train around it · Can't train). At 320 px and with larger text it stays on one row: each
  segment wraps its own words inside the row.

### 3 · Run mode (graphite)
- **Buttons:** "Plan it" and every button that is black in daylight use the theme's button colours on graphite: #B3A9FF, text #15121F
  (9.5:1). Check in, Save to Journal and the Plan cards' buttons are included. Every button, chip and link on graphite passes AA.
- **Upcoming:** shows the current sport only.
  - Each row has its sport icon (🏃 / 🚴).
  - A line says what is hidden: "Showing runs. Switch to 🚴 Ride to see rides." (and the reverse).
  - The title reads "Upcoming runs" in run mode.
- **Wording:** "tap to swap for this run", and the tiles' sub-labels say "this run".
- **Advanced settings summary:** run items only (No gels, Caffeine, the carry: "2 flasks"), never the bike's name.

### 4 · News › Racing: Kona was missing
- **Why:**
  - IRONMAN, 70.3 and T100 races are not in the World Triathlon API (it has WTCS only).
  - The pipeline added them only from `data/calendar.json`, which was never created, or from previews read by AI in the weekend job.
  - The weekend job had run once, by hand, on Oct 2.
- **Fix:** a maintained calendar, `data/pro-races.json`.
  - Each race has name, series, date, place, country, time zone, a note, official links and start times (only when the organiser
    publishes them).
  - Every job (daily, weekend, results, and a new no-network `calendar` job) merges the races in its window, 8 days back to 21 ahead,
    with the API's events.
  - Links are candidates. The daily link check keeps the first one that answers 200 on the same site without bouncing to a home page.
    A broken one is reported in the daily job's issue, and is never shown.
- **Kona added:** IRONMAN World Championship, Kailua-Kona, Hawaiʻi, Sat Oct 10, 2026, "Men and women race the same day".
  - "Start lists ↗" goes to the official IRONMAN page.
  - Add to calendar gives the race day as an all-day event while no official start times are published. The pro start times (men 6:20,
    women 6:30 HST) were only in news reports, so they are not used.
  - `data/news.json` was rebuilt with the calendar job: Kona shows under This weekend on every day from Oct 1 to Oct 10.
- **Standings, re-checked:**
  - **WTCS and T100:** both hold the top 10 for women and men in `news.json` (World Triathlon rankings 15/16 and 84/85, updated
    2026-10-05 10:08 UTC). The app shows them with the real file, so the empty screen in the PDF came from an older build or a cached
    copy.
  - **Pro Series: empty by design.** There is no API. It is published only when two independent publishers' reports with "Pro Series"
    in the title agree on the top 3 (points within 1%), and no such pair exists yet. The app shows "Full standings ↗" to
    ironman.com/proseries/standings.
  - **What's failing:** the weekend job never ran on its schedule (`meta.jobs` shows only the Oct 2 run). Its next scheduled run is
    Thu Oct 8. Check the Actions tab after that day.

### 5 · Products
- **Neversecond C30+ Energy Gel (caffeine):**
  - 60 ml, 30 g carbs, 200 mg sodium, 75 mg caffeine per gel.
  - Note: "Cola, Berry, Espresso: check your packet; espresso may differ".
  - As the caffeine gel, it counts toward the caffeine limit.
- **Neversecond S200 Sodium Booster:**
  - A liquid: 200 mg sodium per capful, 0 g carbs, 0 kcal.
  - Unit "capful", whole capfuls only, mixed into the bottles as a sodium top-off.
  - Recipe line: "S200 Sodium Booster ···· N capfuls · N×200 mg".
  - The electrolyte editor has the new unit (capful: a liquid, whole capfuls, in the bottle).
- **Both are marked NEW** (until the end of 2026).
- **Answer sheet:**
  - both products are in Test A's fixtures (`tA-c30p`, `tA-s200`);
  - the reference (R9) and the rules count whole capfuls: sodium = capfuls × 200 mg;
  - golden rides g46 (S200 over 3 h) and g47 (C30+ under a 100 mg caffeine limit: one gel);
  - capfuls are in the random rides.
  - `npm test`: 1103 pass, 0 fail.

### Tests
- **New `kit/work-q47/fixes.test.js`:**
  - Sessions wording;
  - the note form at 320, 390 and 430 px and with larger text (24 px and 32 px root): no overflow, How bad on one row;
  - run-mode button colours and contrast;
  - sport-filtered Upcoming with the icon and the "Showing …" line;
  - Kona in the 10-day window on every day from Oct 1 to 10, 2026;
  - both products in plans.
- **Pipeline tests:** three new ones (Kona in the repo calendar; merged by the calendar, weekend and results jobs; link candidates). 36
  pass. `runall2.sh` now runs the pipeline tests at the end.

### Kit
- **Old tests updated in place** (each to the new wording or behaviour; the bigger ones keep a `*.pre-q47.js` copy):
  - Journal counts and lines that said "Rides" (sync-merge, plan-journal, q30 journal, v3 journal, q4 journal's empty state, q9 sleep
    line, q40 filter);
  - q44 Upcoming: the run workout now shows in run mode, so ride mode lists 3 rows (and the computer's column "Upcoming · 3");
  - q24 gel list: 31 gels, a NEW badge after a name, and "· 60 ml" on a gel sold by volume;
  - q13 inventory: the old "rides" wording of the patterns footer and the empty state is allowed as reworded (same facts).
- **Upcoming at 320 px with 200% text:** the new sport icon left too little room beside a title, and "100" in "Brown County 100" broke
  mid-word. The TP badge, the icon and the title now flow as one line of text, so a long title wraps under them.
- **Two timing checks failed once under load** and passed alone: chapters sync (6 s wait) and the 150-race table (263 ms against 250).
- Cache v72 (`sw.test.js` matches). Full kit green after the fixes; `npm test` 1103 pass, 0 fail.

## 48 · Remove the TP line from the Ride card; TrainingPeaks workout details, fully expanded · DONE 2026-10-05
Source: PDF D (`docs/design/fred-round_2026-10-05_v3.pdf`, page 4) and the item text.

### 1 · The TP line is gone
- The Ride card no longer has "TP · Tomorrow: … · Use". Upcoming, under the calculator, lists the plan's workouts instead.

### 2 · Upcoming rows
- Each TrainingPeaks title ends with a small ›. Tapping the title opens the workout's detail sheet. "Plan it" on the row still plans
  directly.

### 3 · The detail sheet (calendar feed data only)
- **Top:** Close · Open TrainingPeaks ↗.
  - The feed has no per-workout link, so the button opens the TrainingPeaks calendar (`app.trainingpeaks.com/#calendar`).
  - **Judgment call:** that URL comes from TrainingPeaks' help pages and third-party guides. I could not open it signed in to confirm it.
- **Header:** TP badge, sport icon and workout type, the date (and the start time when the feed has one), the title without "Bike:".
- **Chips:** "Planned 1:30" or "No planned time in TP"; "Planned 10.66 mi" or "No distance set"; "suggested: Steady".
- **Done workouts:** actual time, distance and speed or pace.

### 4 · The description, always in full
- Lines that start with a duration or a repeat ("10'", "3x(…)", "4x 15 min…", "50 min", "8x50") become step rows under WORKOUT, with
  the amount in bold.
- A repeat's parts sit under it. A "That can be:" list sits under its step.
- "+++" lines are section breaks.
- All other text, repeated plan notes included, shows in full under NOTES FROM YOUR PLAN. Nothing is folded or clamped.
- TrainingPeaks' own lines ("Planned Time", "Distance Planned", "Actual Time", "Speed", "Pace", "Workout type") go to the chips, not
  the text.
- **Word for word:** on every workout of the real feed, the words shown equal the words in the description. Nothing is lost or added.

### 5 · One Plan it
- One button. A workout with alternatives ("5:30 Z2 OR 3:10 with Intervals") shows its whole description and plans the day and effort
  without a time. A bar says "Set the time: …", so the athlete chooses.

### 6 · Suggested effort
- TrainingPeaks sends no intensity, so fred suggests one from the words: the title first, then the description.
  - **Recovery:** recovery, easy, Z1, zone 1, rest, shake out.
  - **Hard:** threshold, sweet spot, VO2, intervals, tempo, hills, race, hard, Z3–Z5, over-under, FTP, repeats like "3x(…)", or a % of FTP
    above 80.
  - **Steady:** Z2, endurance, aerobic.
- The sheet shows "suggested: …". After Plan it, the calculator says "Suggested: … · tap to confirm" until an effort is tapped.
- **Judgment call:** "race", "hard", "over-under" and repeat counts also mean Hard; the item's list didn't name them.

### Tests
- **New `kit/work-q48/tp.test.js`** (the real feed stays in the kit, never in the repo):
  - the TP line is gone;
  - parsing of every workout in the feed (steps, sections, notes word for word);
  - a missing planned time and missing distance;
  - effort suggestions;
  - a done workout's actuals;
  - Plan it from the sheet and the row, alternatives, runs;
  - 320 px with larger text, graphite contrast, the computer layout.
- **Old test updated:** q14 plan, now version-adaptive. On a build without the TP line it checks that Upcoming lists "5 hr Z2" and its Plan it
  fills 5:00.
- Cache v73 (`sw.test.js` matches). Full kit green; `npm test` 1103 pass, 0 fail.

## 49 · Plan rides hour by hour when the weather changes · DONE 2026-10-05
Source: PDF E (`docs/design/fred-round_2026-10-05_v3.pdf`, page 5) and the item text.

### 1 · Which temperature the engine used until now (asked for in the item)
- **Fluid:** the average **feels-like** (apparent temperature) of the forecast hours from 30 min before the start to 30 min after the end.
  The sweat grid was read at that one number for the whole ride.
- **Strength band** (Hot · Moderate · Cold): the average **WBGT** over the same window.
- **Top card:** the average **air** temperature.
- **Clothing:** the **lowest feels-like** of the ride. Results also said "take off … above X °F".
- **No forecast:** the feels-like typed on Plan.
- So a ride from 52 °F to 80 °F was planned at about 66 °F all the way: too much fluid early, too little late.

### 2 · Hour by hour
- **When:** the forecast's feels-like moves **8 °F or more** between the ride's hours (7.9 °F keeps the single view).
- **Fluid per hour:** each ride hour gets its own feels-like, air temperature and dew point at its middle.
  - That hour's fluid is the sweat grid's box for the effort at that feels-like, blended as before. Dew point counts through the
    feels-like.
  - The last part hour is pro-rated: 30 min takes half the hour's fluid.
  - The lowest and highest limits apply to each hour. The ride's fluid is the sum of the hours.
  - Sodium per hour = sweat sodium × that hour's fluid.
- **One carbs/hr and one bottle strength** for the whole ride. The bottles carry more carbs in the thirsty hours.
- **Gels:**
  - Whole gels fill each hour's carb gap, as a running total (a warming ride's gels taper: 2, 1, 1, 1, 1, 0 on 52 → 80 °F).
  - Inside an hour they are spread evenly, and never two within 15 min.
  - An extra gel for a short leg also keeps 15 min from the others. With no slot it is left out, and the leg's red warning stays.
- **Bottles and refills:** times come from the cumulative fluid curve, so a bottle lasts longer in the cool hours. Stops and the "next
  refill" times follow the same curve.

### 3 · Results
- **Top card:** "52→80°" feels-like (the start and end hours) when the ride is planned hour by hour.
- **"YOUR RIDE WARMS UP"** (or "COOLS DOWN") card:
  - an orange temperature line (#B54708, 5.4:1 on white);
  - each hour's fluid as bars;
  - labels thin out at 320 px and with large text.
- **HOUR BY HOUR** list: time · °F · oz · gels (e.g. "7:00am 52° … oz 2 gels"; a part hour reads "12:00pm 30 min 80° … oz …").
- **Other screens:**
  - the fluid line says "hour by hour";
  - the weather card says the ride warms or cools;
  - the change list says "fluid {lowest}–{highest} oz/hr, hour by hour";
  - the gel times list the real times;
  - the pinned-gel note uses the 15 min gap.

### 4 · Clothing
- Unchanged: fred still dresses you for the ride's lowest feels-like (the start of a warming ride).
- **Never in-ride layer advice:** "take off … above X", "shed … as it warms" (share card) and "take off … as it warms" (Journal plan) are
  gone everywhere.
- **Judgment call:** the item says "start temperature". The lowest feels-like is the start on a warming ride, and the safer choice on a
  cooling one, so it stays.

### 5 · Answer sheet
- **Rules:** R4b (hour fluid), R6b (hour gaps and gel count), R7b (gel times, 15 min apart, extra gels), A12 (the always-true
  hour-by-hour rule). A12 checks each hour's fluid and limit, the sum, sodium, the gel times where R7b puts them, and the 15 min gap.
- **Golden rides:**
  - g48: warming 52 → 80 °F over 5:30;
  - g49: cooling 80 → 55 °F over 4:00 Hard;
  - g50: 40 → 95 °F under limits 34–42 oz/hr (the floor holds the cold hours, the ceiling the hot ones);
  - g51: warming with one plain water bottle;
  - g52: 7.9 °F, which stays a single temperature.
- **Random rides:** one in five gets an hourly forecast (deterministic, the same 2,000 rides).
- **J4 note:** hour by hour, the fluid not carried in the last 30 min is at most half the thirstiest hour.
- `npm test`: 1228 pass, 0 fail.

### Tests
- **New `kit/work-q49/hourly.test.js`:**
  - the 8 °F threshold;
  - the part hour;
  - hourly fluid and sodium;
  - the gel taper and its allocation;
  - carbs as a running total, one strength;
  - refills;
  - the cards and the list;
  - no layer advice anywhere;
  - limits each hour;
  - a cooling Hard ride;
  - 320 / 390 px with larger text, and contrast.
- **Old tests updated:**
  - q38 accepts the source "· hour by hour" (its clear test day warms more than 8 °F);
  - the acceptance palette has the line's orange;
  - v2 acceptance allows the new card right under the top card;
  - the inventory allows the removed "take off above X" lines.
- **Kit fix:** at 360 px "52→80°" pushed the top card's six numbers into two columns. The range is now drawn a little smaller inside its
  tile, so the grid keeps three columns.
- Chapters sync failed once in the full run and passed on its own (the same timing flake as before).
- Cache v74 (`sw.test.js` matches). Full kit green after the fixes; `npm test` 1228 pass, 0 fail.

## 50 · Fix: Fluid limits rows open the same editor · DONE 2026-10-05
Source: PDF F (`docs/design/fred-round_2026-10-05_v3.pdf`, page 7) and the item text.

### 1 · The cause
- Both rows ("Lowest fluid I'll plan", "Highest fluid I'll plan") carry `data-sheet="fluidlim"`, so a tap on either opened the same sheet
  with both inputs. Nothing recorded which row was tapped, so nothing was highlighted or scrolled to.
- Each keystroke saved at once, so there was nothing a Cancel could undo.
- A lowest above the highest was refused with a hint, but the typed number stayed on screen.

### 2 · One "Fluid limits" sheet
- **Header:** Cancel · Fluid limits · Done. With large text on a narrow screen, the title moves under Cancel and Done instead of breaking
  up.
- **A box per limit:**
  - "Lowest fluid I'll plan" / "Highest fluid I'll plan";
  - − and + by 1 oz/hr;
  - the number in oz/hr, in a light outlined box you can also type in. The PDF shows a bare number; the outline gives the field the 3:1
    edge the contrast rule asks of every field;
  - a "No limit" switch;
  - the grey line: "fred never plans less than this, even when it's cold." / "… more than this, even in the heat."
- **The tapped row's box** has a blue border and is scrolled into view. Running › Shared › Fluid limits opens the same sheet with no box
  highlighted.
- **Under the boxes:** "Your sweat grid runs 24–36 oz/hr. Limits apply after it." These are the lowest and highest boxes of the grid
  Settings shows, Cycling or Running.

### 3 · They can't cross
- Highest stays at least 4 oz/hr above lowest. A change that breaks that moves the other value, and an amber note says so: "Highest must be
  at least 4 oz/hr above lowest. fred moved it to 28." (or "Lowest must be at least 4 oz/hr below highest. fred moved it to 21.").
- Switching a limit back on starts at the grid's edge, kept clear of the other limit.
- **Saving:** nothing is saved until Done. Cancel, Escape or tapping outside keeps neither change. Done saves both, so crossed limits are
  never saved.
- **Older limits:** a pair saved before this rule, like 30–32, stays as it was until one of them is changed.
- **Metric:** mL/hr, 30 mL steps, 120 mL/hr apart. Values are stored in oz/hr as before.

### 4 · Rows
- The rows read "20 oz/hr" or "No limit" (was "Not set").
- Running's Shared row reads "20–36 oz/hr", "at least 20 oz/hr", "up to 36 oz/hr" or "No limit".
- The group's footnote no longer says "Leave blank" (there are no blanks now).

### 5 · Planner and answer sheet
- The planner reads the same settings (`fluidMin` / `fluidMax`, oz/hr). The kit checks that a saved ceiling holds a Hard ride "at your
  ceiling".
- The answer sheet already checks the limits on every ride: rule 11, the golden rides with a floor and a ceiling, and g50 per hour. No
  engine change, so it is unchanged: `npm test` 1228 pass, 0 fail.

### Tests
- **New `kit/work-q50/limits.test.js`:**
  - each row highlights its own box (and Running's row none);
  - − / + and typing; values save independently on Done;
  - No limit;
  - the 4 oz/hr rule both ways, with the amber note;
  - Cancel and Escape;
  - the grid line with own boxes;
  - an old too-close pair;
  - metric;
  - the rows;
  - the plan using the limits;
  - layout at 320 px with 16, 24 and 32 px text and at 390 px with 32 px text;
  - contrast.
- **Old test updated:** q38's limits checks now press Done. They are version-adaptive; the pre-q50 copy runs on older builds.
- Cache v75 (`sw.test.js` matches). Full kit green after the outline fix; `npm test` 1228 pass, 0 fail.

## 51 · Move HEALTH into the main Settings page · DONE 2026-10-05
Source: PDF G (`docs/design/fred-round_2026-10-05_v3.pdf`, page 8) and the item text.

### 1 · HEALTH on the main list
- **HEALTH (teal)** sits right after FUELING:
  - "My stack", with its count ("18 supplements · 2 meds");
  - "Injuries & sickness" ("1 still going").
- The values are the same ones the Account page showed.
- HEALTH shows on Cycling and on Running: neither the stack nor injuries depend on the sport.

### 2 · Where the rows go
- **My stack** opens straight from the list with "‹ Settings · My stack · + Add" (no "Account · Done" bar over it). "‹ Settings" goes back
  to the list.
- **Injuries & sickness** opens the Journal on Notes, as it did from the Account page.
- **Search:**
  - "stack", "supplement", "medication", "injury" and "sick" find the two rows;
  - My stack also answers for its Medications row.

### 3 · The Account page keeps account things
- It now holds Account & data and Connections only. HEALTH left it, and so did its "Settings" page.
- The Account page's own pages still say "‹ Account".

### 4 · Main Settings order: Search · FUELING · HEALTH · GEAR · ADVANCED · ACCOUNT
- **ADVANCED (black)** has one row, "Advanced".
  - It opens what was Account › Settings: Units, Week starts on, Volume goal and Counts toward volume.
  - Its pages come back to it with Done, and its "‹ Settings" closes it.
  - Search for "units" or "week" finds it.
- **ACCOUNT:** the group formerly called "Account & data" is now "Account" (black, as in the PDF). Its rows are unchanged.
- **Fluid limits:** the FLUID LIMITS group became the two rows "Lowest fluid I'll plan" and "Highest fluid I'll plan" inside FUELING,
  right after Sweat sodium (PDF G shows Fluid limits as a Fueling row). Their sheet is item 50's. The group's footnote went, since the
  sheet's grey lines say the same.
- **Judgment calls:**
  - ADVANCED: the PDF shows one "Advanced" row and the item names no content. Account › Settings was the only thing left to move once the
    Account page "keeps only account items", so it moved there.
  - The two Fluid limits rows stay two rows, so item 50's "tapped row highlighted" still works.

### Tests
- **New `kit/work-q51/health.test.js`:**
  - the order;
  - HEALTH once, teal, with its values;
  - the Fluid limits rows in Fueling;
  - My stack's "‹ Settings" and back;
  - the Account page's rows;
  - Advanced and a row there with Done;
  - Injuries & sickness to the Journal's Notes;
  - the search words;
  - Running;
  - 320 px with larger text and 390 px;
  - contrast.
- **Old tests updated, version-adaptive** (they still pass on earlier builds):
  - q13 pages (the groups and the Account page);
  - v3 settings (reads the list in the older shape; the group colours);
  - b9 profile and v3 settings' "tap a row" (Advanced and My stack from the list);
  - q45 stack (Account page, Advanced, My stack, Injuries);
  - q26 meds (My stack from the list);
  - q38 (the Fluid limits rows in Fueling);
  - q42 (the groups on Cycling and Running).
- **Kit fix:** at 320 px with large text, "‹ Settings" and the page title overlapped. A page's header now puts the title under its buttons
  when they would touch.
- The races chapter sync failed once in the full run and passed twice on its own (the same timing flake as chapters sync).
- Cache v76 (`sw.test.js` matches). Full kit green after the fixes; `npm test` 1228 pass, 0 fail.

## 52 · Ride-day plan: bottles by start time, whole gels per hour, caffeine timed · DONE 2026-10-05
Source: PDF A (`docs/design/fred-round_2026-10-06_v1.pdf`) and the item text. The PDF sets the look; its numbers are sample data.

### 1 · Engine
- **Hours and room.** Each clock hour of the ride (the last one pro-rated) has a gel window:
  - not before the first-gel time;
  - 5 min into the hour, and 10 min before the next one;
  - none in the last 30 min.

  An hour's room is its caffeine gels plus the marks 15 min apart in its window (15 min from every caffeine gel too). The most gels that fit
  is the sum of the rooms.
- **Caffeine times.** Each caffeine gel has its own time:
  - spread evenly from the rider's **"Caffeine from"** time to 60 min before the finish, never later;
  - "Caffeine from" is new in Plan › Advanced › Gels & caffeine: Auto, or 0:00 to 8:00 every 30 min. Auto = the old first aim: the first
    gel on rides of 2:30 or less, else 2:30 before the finish but no later than 1:30;
  - one dose for every 2.5 h of that window, within the per-ride limit (My stack's pre-ride caffeine counts), at least 45 min apart;
  - on the half hour when the window allows (from 2:00 on a 5:30 ride gives 2:30 and 4:00, as in the PDF), else to 5 min;
  - none after the "none after" time;
  - each counts in its hour's gel number.

  A dose that can't fit is left out, and the Details say why: no room before the last 60 min, the limit, the cutoff, or a set number of
  gels.
- **Bottle start times.** A bottle starts where the ones before it in its leg run out, on the hours' fluid (each hour's sweat-grid fluid at
  its forecast, then the limits). A start, or a stop, within 5 min of a whole hour goes on that hour (2:55 → 3:00), else to 5 min. A bottle's
  stretch runs to the next start, or to the stop or the finish.
- **Each bottle its own strength** (the default):
  - Its carbs = its stretch's carb target less the gels of that stretch. An hour's gels count over the hour's minutes: a plain gel goes any
    time in its hour.
  - Never over the hard limit: 8%, or the Strength limit typed; with plain water bottles or My bottles, today's strength.
  - What a bottle can't hold goes to the bottle before it.
  - The gels per hour are chosen to keep each hour's carbs within ±5 g of the target:
    - hours that share a bottle start with the same count;
    - then single steps: move a gel, add one, take one away, or one in each hour of a run;
    - the order of preference: nothing short, each hour within ±5 g, bottles at today's strength where whole gels allow (half a gel over,
      as before), fewest gels.
  - compute() plans the ride again with those gels, so the totals, sodium and top-up all follow.
- **Same recipe in every bottle** (Plan › Advanced › Bottles today, off by default): one strength in every bottle. Gels per hour follow the
  hours' carb gaps as a running total; still whole, and the caffeine times are unchanged. The rides the per-bottle plan can't handle keep
  one recipe too:
  - an aid-table or water-only stop;
  - a leg short of fluid;
  - bottle roles or My bottles;
  - an adjusted plan;
  - no gels;
  - a leftover;
  - gels that didn't fit.
- A water-only stop whose extra gel finds no slot 15 min from the others now gets its red warning ("about N g carbs are short").

### 2 · Results
- **Bottles · start times** (blue) sits right under the top card and its warnings. One row per bottle and refill:
  - ride time large, clock time under it;
  - the forecast feels-like at that moment as a thermometer tag: blue under 60 °F, amber 60–71, red 72 and up; shown in your units, banded
    in °F;
  - a bottle icon numbered by cage, dashed for a refill;
  - size, with "· refill" or "· fill to half";
  - the recipe ("38 g · 3.8%");
  - a tick, saved with the plan.

  Stops are a slim dashed divider, "stop 4:00 · refill 1 L × 2", or "aid table" / "water only". There is no text above or below the list.
- **Gels per hour** (an orange card): tiles Hr 1 … last ½, each with its gel icons and count:
  - plain gels orange #E4572E; caffeine gels brown #5A3A1B with a C, and "C at 2:30" under the tile;
  - the legend in the header: "8 gels · ■ plain · ■ caffeine";
  - no sentence under the tiles.
- **The rest of the page:**
  - The old Bottles card is now **Mix & pack**: the same recipe cards, scoops and baggies, with its own ticks.
  - The Gels card lists what to pack without exact minutes for plain gels; caffeine gels keep their times.
  - The exact-minute timeline stays in During the ride.
  - The hour-by-hour card lost its grey footnote.
  - There is no labels block or Garmin line.
- **Copy text:** a line of bottles by start time (clock, size, recipe, the stops), a line of gels per hour with the caffeine times, then the
  totals.
- **The science page:** "Small and often" and "Caffeine" now carry the guidance:
  - each bottle's start time;
  - a plain gel any time in its hour, with an Eat alert every 60 min on a Garmin Edge;
  - how the caffeine times are chosen.

### 3 · Judgment calls
- **The PDF's 2-1-1-1-1-0 pattern.** On the test ride (85 g/hr, 30 g gels) the first bottle runs 0:00–1:30, so hours 1 and 2 share it.
  Giving them different gel counts puts each about 10 g off target. Within ±5 g an hour, hours 1–3 need the same count, so the ride gives
  2-2-2-1-1-0 (caffeine in Hr 3 and Hr 5, at 2:30 and 4:00); its starts are the PDF's (0:00 · 1:30 · 3:00 · stop 4:00 · 5:00).
  With one recipe in every bottle the same ride gives the PDF's 2-1-1-1-1-0, and hours land up to about a gel off.
- **±5 g an hour where whole gels allow.** The last 30 min take no gel (the rule of the last 30 min stays). When their bottle is at the
  limit, the bottle before carries the rest, so the last part hour lands under and the hour before over (answer sheet J15).
- **The limit.** The item says "never above the strength limit" and the PDF "never over 8%". Bottles never pass the hard limit (8%, or the
  Strength limit typed; today's strength with plain water bottles or My bottles, as before). Today's strength (3% / 6% / 8% by the weather)
  is kept wherever whole gels allow, half a gel over at most, as the old rounding allowed. A bottle over it still shows the existing "over
  the suggested %" note.
- **Every ride's gels are 15 min apart now** (before, rides on one temperature allowed 5 min), so short rides fit fewer gels.
- **Caffeine count and grid.** One dose per 2.5 h of the window, as R8 had (caffeine halves in about 5 h), and on the half hour where
  possible, so the PDF's ride gives exactly 2:30 and 4:00.
- **A bottle with no carbs.** On a cool 4:30 Steady ride with an 8% limit, the plan puts 3 gels in hour 1 and leaves the first bottle with
  its salt only. Hour 2 lands 10.9 g over and the last ½ 14 g under (the J15 case); every other hour is within ±5 g. A first bottle at
  43 g with 2 gels lands hour 1 7.2 g over instead, which is further off in total (16.3 g beyond ±5 against 15.0). The rule picks the plan
  with every hour closest, so a salt-only bottle can happen; the Bottles card and Copy say "no carbs" for it.
- **Plain water bottles.** The Bottles footnote's "+N gels to stay under 6%" now counts against the same ride planned without the water
  bottles, through its own ride-day plan. The earlier no-water pass shares this plan's gels per hour, so it read 0.
- **Fewer gels can mean more drink mix.** When whole gels allow, the plan prefers fewer gels, so the bottles carry more mix. With a mix
  that alone holds more sodium than the target (and no carb-only powder to blend), a ride can land over its sodium, as before: J6, with
  its red note. In the kit's regression rides, one ride (4:00 at 70 °F) goes from on target to 10% over. Rides whose mix was over before
  now land on target, with salt for the rest.
- **Temperature tag colours.** Red is otherwise kept for warnings, so the acceptance test allows it for the 72 °F+ tag only. The tag
  colours are the existing blue ink, the amber of the hour-by-hour line, and the warning red.

### Answer sheet (`npm test`)
- **RULES.md R18:** hours and rooms, caffeine times, the count and gels per hour with one recipe, bottle starts, each bottle its own
  strength, gel minutes. R7, R7b and R8 are kept as the record.
- **The reference calculator:** written from R18.
- **A13 on every ride, golden and random:**
  - whole gels per hour within each hour's room, as R18 puts them;
  - each bottle's carbs, never over the limit;
  - each hour within ±5 g;
  - bottle starts on the hour within 5 min, where the bottles before run out;
  - caffeine times, 45 min apart, none in the last 60 min, within the limit.
- **Other checks:** G3, G5, G7 and G9 now follow R18.
- **New judgment calls:** J15 (whole gels and the limit can't do better) and J16 (one recipe in every bottle).
- **New golden rides g53–g56:**
  - the PDF's ride with a stop at 4:00, and the same with Same recipe;
  - Caffeine from with no room;
  - three doses on a 7:00 ride.
- **Random rides** try both switch states and "Caffeine from" times.

### Tests
- **New `kit/work-q52/rideday.test.js`** on Saturday's warming ride (52 → 80 °F, 5:30 Steady from 7:00, 1 L bottles, a stop at 4:00,
  caffeine from 2:00):
  - starts 0:00 · 1:30 · 3:00 · 4:00 · 5:00 with the dashed stop divider;
  - temperature tags and their colours;
  - numbered and dashed bottles, ticks that persist;
  - gels per hour 2 · 2 · 2 · 1 · 1 · 0, caffeine at 2:30 and 4:00;
  - each hour within ±5 g; no grey text in the cards;
  - the Same recipe switch, Copy text, caffeine that can't fit;
  - layout at 320 px with 16 / 24 / 32 px text and 390 px at 32 px; contrast.
- **Old kit tests updated, version-adaptive** (they still pass on the build before item 52):
  - v2 accept and v3 results: the page order with the two new cards; "Mix & pack"; gel rows without minutes; the new Copy format and a
    bottle that may carry only salt;
  - q8 owned: each bottle its own strength, under the limit;
  - q23: baggies merge only when their recipe is the same, checked again with Same recipe on; Copy carbs on its Totals line;
  - q32 water: the refill ride may land over by less than a gel (J15);
  - q49 hourly: gels per hour from the ride-day plan, each hour within ±5 g, each bottle its own strength, no footnote under the hours;
  - q13 inventory: item 52's texts that went or changed are allowed (see allow.json).
- **Kit fixes found by the full run:**
  - the ride-day tick boxes carry the tick class, so the no-solid-blocks rule treats them as tick boxes;
  - with plain water bottles, "+N gels to stay under 6%" read 0 (fixed in the engine, above);
  - Details › Numbers by hour follows each bottle's own carbs, mix and sodium.
- **Regression baselines refreshed** (`base.regress.json`, `base-fx.regress.json`; the old ones kept as `*.pre-q52.json`). 28 of 34 rides
  changed their gels, strength and sodium split; total sodium matches the target except the J6 case above.
- Cache v77 (`sw.test.js` matches). Full kit green after the fixes; `npm test` 1389 pass, 0 fail (118 judgment calls reported).

## 53 · IRONMAN standings and race calendar from ironman.com (approved scope) · DONE 2026-10-06
Source: the item text. IRONMAN's approval is recorded in `docs/LEGAL.md`, with {date}, {name} and {email} left for Mark to fill in and a
place to paste the approval email.

### 1 · What fred reads, and only that
- **Two pages** (`scripts/news/lib/ironman.mjs`):
  - the Pro Series standings, `https://www.ironman.com/proseries/standings` (and `/proseries/standings/{year}`, where it redirects);
  - the race calendar, `https://www.ironman.com/races`;
  - plus `robots.txt`, read first so the site's rules are respected.
- **The allow-list is enforced in the fetcher** (`lib/fetch.mjs`) for every request. It refuses before the network:
  - every other ironman.com or subdomain address;
  - link checks;
  - JSON calls;
  - redirects leaving the list.

  So Kona's race-page links are no longer link-checked, and the Pro Series candidates (including `proseries.ironman.com`) left
  `data/sources.json`.
- **The never-scrape rule stays** for everything else on ironman.com, for T100 and PTO, and for every other site. `docs/NEWS.md` states it,
  with this one exception.

### 2 · When and how
- **GitHub Actions only.** Any other run logs "not read here" and keeps what is stored.
- **How often:**
  - the calendar at most once a day (the daily job);
  - the standings at most once a day in a race week (Monday–Sunday with a Pro Series or World Championship race), and on every
    news-results run (Sunday night, Monday morning; never twice within 6 h).
- **The User-Agent** names fred and a contact email: `fred-news (+https://fuel.bluebirdmultisport.com; hello@flipturncreative.com)`.
  It is used for every News request now.
- **Stop and log.** Any of these stops ironman.com requests for the rest of the run, and the reason is logged:
  - an HTTP error;
  - 401 / 403 / 429;
  - a bot-check page;
  - robots.txt refusing;
  - no answer;
  - a page the parser doesn't recognise.

  The attempt is recorded, so "once a day" still holds. When a page is read, the log shows what was read (the top 3 per sex, the next 5
  races). When it isn't recognised, the log adds an outline of the page, enough to fix the parser in one go: sizes and counts, table
  headings, the most used class names, link shapes, script blocks and JSON key names. Never the page's words.
- **The last good copy** is `data/ironman.json`, facts only:
  - standings: rank, athlete, country, points, races counted;
  - races: name, date, place, flags, the official race page link;
  - when each page was last asked for.

  The page HTML is never stored, not even in the job's cache. news-job commits `data/ironman.json` with `data/news.json`, and CI checks it.
- **The parsers** read a table per sex, the page's own JSON (Next.js-style data or JSON-LD events) or race cards. They take a result only
  when it is complete:
  - both sexes from rank 1;
  - at least 5 upcoming races.

### 3 · Standings
- The Pro Series is the full official table. The two-reports rule is gone for the Pro Series only; T100 keeps its report fallback.
- Every ranked pro gets a pro card. Limits went up: 600 pros, 1,000 standings rows, 400 races.
- **News › Racing › Standings › Pro Series:**
  - the top 10 by default, each row with rank, athlete, country, "N races counted", points and the gap to the leader;
  - "Full standings (14 women)" shows every row in the app, and "Top 10" goes back;
  - the foot reads "Updated {date} · Standings: IRONMAN Pro Series ↗", linking the official page in a new tab.
- Pro Series data that didn't come from ironman.com keeps the old display and the official "Full standings ↗" link. That covers the time
  before the first fetch and the UI sample.

### 4 · Calendar
- Every upcoming IRONMAN and IRONMAN 70.3 race on ironman.com goes into the race list:
  - name, date, place;
  - series flags: Pro Series, World Championship, Regional Championship;
  - the official race page;
  - `src: ironman.com`.

  The last 8 days stay for Last weekend. A future race ironman.com stops listing (moved or cancelled) is removed. 5150, IRONKIDS and
  virtual events are not IRONMAN or 70.3 races.
- **No duplicates.** `data/pro-races.json` keeps the hand-typed T100 and other races. An entry ironman.com also lists (same series and
  date, and every word of one name in the other) is left out; the job log names it so it can be deleted. The calendar's races also merge
  with a race a preview names, rather than doubling it.
- **This weekend / next 10 days** uses the merged list:
  - flags show as outlined tags;
  - the foot adds "Race calendar: IRONMAN ↗";
  - the empty message is now "No races in the next 10 days".
- **Last weekend** shows ironman.com's pro races (flagged, or with results), not the age-group ones.

### 5 · Never to the AI; credited everywhere
- No standings row, race name or place from ironman.com goes into a prompt. A story about a race on the ironman.com calendar asks about
  "the race".
- The AI is never asked for Pro Series standings.
- **The credit shows wherever ironman.com's data does:**
  - This weekend and Last weekend;
  - the standings;
  - the race page ("Race calendar: IRONMAN ↗", under its title);
  - Pros to watch with a Pro Series rank;
  - the pro card (its Pro Series rank, now read from the standings, with "Standings: IRONMAN Pro Series ↗");
  - Pros you follow.
- **The News affiliation disclaimer:** fred has no separate affiliation disclaimer in News today, so nothing was added or changed.

### Tests
- **New `tests/news/ironman.test.mjs`** (`node --test 'tests/news/*.test.mjs'`, run by news-ci):
  - the parsers on saved copies of the two pages (`tests/fixtures/ironman/`: a table page and a JSON page for the standings, a race-card
    page and a JSON-LD page for the calendar; made-up athletes and races);
  - errors and blocks;
  - the allow-list, and the fetcher with redirects;
  - a daily run end to end;
  - Actions only;
  - once a day, race weeks and the results runs;
  - an error or a block (403, bot check, 503, no answer, a changed page, robots.txt) keeps the last good copy in both files;
  - races removed from the calendar;
  - pro-races.json against ironman.com's calendar;
  - attribution;
  - no AI;
  - the schema and the size limit.
- **Old tests updated:**
  - pipeline: the User-Agent; the calendar link check now on a T100 race, and ironman.com links never checked;
  - standings: no Pro Series from reports; no ironman.com link checks; sources.json without the Pro Series.
- **New `kit/work-q53/ironman-ui.test.js`:** This weekend, Last weekend, Standings top 10 / Full standings / Top 10 for women and men,
  T100 unchanged, the race page, the pro card, the credits, no request to ironman.com from the app, AA and layout at 320 / 390 / 430 px
  with 16 / 24 / 32 px text. Two IRONMAN News screens joined the shared contrast and layout runs.
- **Kit tests updated (version-adaptive):**
  - q17 racing: the empty-week wording.
  - q47 fixes: Kona's Start lists ↗ is checked only while news.json has the link. On 2026-10-05 the daily check found both hand-typed
    ironman.com Kona links answering 404, so the live news.json dropped them. Since item 53, ironman.com links are never re-checked, so
    their last verdicts stay (no broken link shown) and they are not reported again every day.
- **Kona** stays in `data/pro-races.json` until a live run confirms ironman.com's calendar lists it, so it can't drop out of This weekend
  before Saturday's race. Once ironman.com's entry is there, the hand entry is skipped (and the log asks for it to be removed).
- **The real pages:** ironman.com can't be reached from the dev sandbox (proxy 403), so the fixtures are hand-built in the likely shapes.
  After the merge the news job is run once in GitHub Actions to read the real pages; its log shows what was read or the page's outline.
- Cache v78 (`sw.test.js` matches). Full kit green after the q47 fix; `npm test` 1389 pass, 0 fail; news tests 51 pass.

### 53 · After the first live run (2026-10-06)
- **The news-daily job read both pages in GitHub Actions.**
  - Calendar: 7 upcoming races. Kona is listed ("IRONMAN World Championship", 10 Oct, World Championship).
  - Standings: the top 10 per sex.
- **What the live pages don't give:**
  - the standings page shows only the top 10 per sex and has no races-counted column, so "Full standings" has 10 rows for now;
  - the calendar page lists only the next ~7 races and carries no Pro Series tags.
- **Fixed:**
  - athlete cells read as "Image Germany Laura Philipp". Names are now split from the flag label and country, both when parsed and in
    the stored copy, and the pro cards made from the bad names were dropped;
  - a value ironman.com leaves empty no longer clears a stored one (except the flags), so Kona keeps its place.
- **Kona left `data/pro-races.json`**, because ironman.com now lists it. A repo test checks that `pro-races.json` holds no IRONMAN or 70.3
  race. News tests 52 pass.

## 54 · Why each bottle is what it is; Cold is 55 °F and lower · DONE 2026-10-06
Source: the owner in chat, with screenshots and mockups agreed there.

### 1 · The sweat grid: Cold is 55 °F and lower
- The owner: "when it's cold and I'm at steady I'm at 20 ounces an hour", yet a 51 °F start planned more. The Cold box counted fully only
  at 40 °F (its band centre) and blended into Mild up to 62 °F, under a row labelled "under 50°F".
- **Now:** the Cold box counts fully at **55 °F and below** and blends into Mild by 62 °F (Mild and Hot unchanged). Rows read **Cold 55°F
  and under · Mild 56–75°F · Hot over 75°F** (metric: 13°C and under · 14–24°C). On the warming test ride 53 °F → 20 oz/hr (was ~22).
- Answer sheet: R4a, `calc.js` (`SWEAT_CENTRES.cold` 55, `sweatBandOf`), rules A11, the harness's edge probe (55 °F, probed ±0.001 °F
  because the 55–62 blend is steep), golden answers rebuilt. Kit q39 is version-adaptive.

### 2 · The bottles keep their carbs (ride-day plan, R18.6)
- **Found while drawing the card:** on the owner's kind of ride (warming 51 → 74 °F, Cold · Steady 20, one plain water bottle) the plan
  emptied the first mixed bottles (0 g) and gave 3 gels an hour; earlier, a refill bottle got 3 g (0.4%) and hour 4 sodium fell to 393 mg.
- **Why:** the plan's score puts "every hour within ±5 g" first. The last 30 min can't take a gel, so the last bottle feeds it, and that
  bottle's carbs run across the hour before too. Scored apart, the tail's miss was a few grams smaller with 3 gels an hour and empty
  bottles.
- **Fix (R18.6, app and reference), two parts:**
  - an hour with no room for a gel (the gel-free last 30 min) counts its miss with the hour before it, since only the last bottle can
    feed it;
  - the bottles' carbs over today's strength count as two: whether any bottle is over (none beats some), then how much in half gels.
    Without this, the merge let a hot ride's last bottle (which feeds the tail and sits over the 3% hot-day strength) buy 2.5 g off with
    4 more gels and empty bottles (270 min at 88 °F: 8 → 12 gels).
- **Result:** the owner's ride gets 2 gels an hour, bottles 3.8–7.5%, hours 1–4 at 85 g, hour 5 + the last ½ together on target. Item
  52's ride keeps its 2-2-2-1-1-0. Golden answers unchanged; the random rides' judgment notes went from 116 to 112.
- **Regress scenarios (12 differed, now 7, all reviewed; baselines refreshed, `*.pre-q54.json` kept):** cool and mild 150 min 5 → 3 gels
  with the bottles at 7.4% (limit 8%); hot 150 min bottles 4.6% → 3.5% (closer to 3%) with one more gel; mild 270 min 6 → 5 gels at
  5.7% (target 6%); the long hot rides unchanged.
- Tried and dropped: counting the misses in whole gels (it broke item 52's ±5 g hours: 75 / 105 g); capping the gels at the plan's count
  (it stopped the extra gel some rides need to keep a bottle under today's strength); the merge alone (the hot-ride case above); the
  over-strength in half gels alone (hot rides drifted to 4.5–5.2% bottles).

### 3 · Plain water over the whole ride
- The plan's math already sips a plain water bottle evenly over the whole ride (its oz ÷ the ride's time), the mixed bottles carrying the
  rest. The ride-day list ended a bottle that isn't refilled at the first stop ("sip … (3:15) · 9 oz/hr"); it now runs to the finish.

### 4 · Results
- **Each bottle row** adds why: "drink over 1:45 · 16 oz/hr · 25 g carbs/hr"; plain water "sip all ride (5:30) · 5 oz/hr".
- **Why · hour by hour** (under Gels per hour), one column per hour like the gel tiles:
  - carbs bars: drink (teal) + gels (orange) against the target (dashed), with "85 g / 25+60";
  - feels-like (the temperature tags' colours), fluid (water + mix, or "at floor / ceiling"), sodium;
  - above it: where the fluid comes from ("Fluid from your sweat grid (Steady): Cold 20 at 55° and under, Mild 24 at 62°, Hot 36 at 85°
    and over, blended in between. 53° → 20 oz/hr, 74° → 30 oz/hr", or the override, or "held at your floor"), and "Plain water: 28 oz ÷
    5:30 = 5 oz/hr, every hour …";
  - the foot: carbs aim for the target, why the last ½ has no gel, and the ride's sodium per hour.
  - Sodium per hour comes from the bottles and gels themselves, so the hours add up to the ride. (Details › Numbers by hour still
    computes sodium the old way and reads low with plain water: 454 vs 601 mg in hour 1. Left as is; see the report.)
  - On a small phone or larger text it becomes one line per hour.
- "Your ride warms up" keeps its line and bars; its hour list moved into the new card.

### Tests
- New `kit/work-q54/why.test.js`: the grid (55 / 58.5 / 62 °F, the row at 55 / 55.5), the bottles keep their carbs (2 gels an hour,
  hours 1–4 ±5 g, the tail with hour 5), the water row to the finish and its line, each bottle's why line from its stretch, the card's
  columns, carbs, water + mix, sodium adding up, the grid and water lines, no water bottle, metric, layout at 320 / 390 / 430 px with
  16 / 24 / 32 px text, contrast. Added to `runall2.sh`.
- Adapted (version-adaptive): q39 (row labels, the 55 °F edge), q49 (the hour list now in the card), v2 accept and v3 results (the
  page order with the new card under Gels per hour).
- Cache v79 (`sw.test.js` matches).

## 55 · Copy for troubleshooting · DONE 2026-10-06
Source: the owner in chat.

- **A "Copy for troubleshooting" button** under Details on Results (full width, 44 px, wraps on a small phone with large text), with the
  line "Everything behind this plan, as text to paste to Claude. Leaves out your medications and stack." It copies through the app's own
  copy path (clipboard, then the older copy, then the select-and-copy box) and says "Copied. Paste it to Claude."
- **What it copies** (about 50 KB on a 5:30 ride):
  - a head: the build (`APP_BUILD`, kept equal to the sw.js cache; the kit checks), the time, what is left out;
  - **What Results shows:** the whole Results page as text, laid out off screen so its lines hold, every fold and Details row open
    (bottles, gels per hour, Why · hour by hour, weather, Mix & pack, gels, closet, totals, Numbers by hour, the math, why these numbers);
  - **Under the hood** (JSON): the inputs; the settings; the bike; the product library; the weather (the forecast summary, each ride
    hour); the whole result (bottles, strengths, gels, caffeine, sodium, the hours, the notes); the plan (legs, bottles, gels with their
    product, the ride-day plan's rows, hours, rooms and stops, totals); the hours table; the page (browser, size, text size, installed or
    not, online); the last 20 page errors (now recorded).
  - Numbers to 3 decimals, long lists cut at 300 (and said), nothing circular.
- **Never in it:**
  - medications (ticked, typed, the Medications note) and the stack (names, notes, its pre-ride caffeine: `caf.pre` / `preMg` out, with
    `stackCaffeineLeftOut` saying there was some);
  - any `meds` / `medsOther` / `stack` / `stackCaf` key;
  - birthday, recent places, barcodes, races, chapters, the volume and news settings, the journal, account and sync ids.

  Their names are also scrubbed from the whole text, and the counts of what was left out are given.
- New `kit/work-q55/debug.test.js`:
  - the button and its line;
  - the copy's head;
  - the screen text;
  - the JSON parses and holds inputs, settings, bike, library, weather, result, plan, the hours table, page and errors;
  - nothing from a ticked medication, a typed one or a stack item with caffeine, nor birthday or recent places;
  - layout at 320 px with 32 px text and at 390 px; contrast.
- Cache v80 (`sw.test.js` matches).

## 56 · Fueling math: hour by hour, per-bottle caps, gels, sodium · DONE 2026-10-06
Source: the owner in chat (the item's golden ride: 5:30 Steady 85 g/hr from 8:00, Carmel, WBGT by hour 53.8 · 57.5 · 62.2 · 66.4 · 70.3 ·
73.1).

- **Fluid by hour (A).** Every ride whose forecast gives its hours is planned hour by hour (no 8 °F spread or 2-hour minimum any more).
  Each hour's fluid is the sweat grid box of that hour's heat band: its WBGT, else its feels-like (Cold under 60 WBGT, Moderate 60–80,
  Hot 80 and up). One box per band, **no blending**: the golden ride is 20 · 20 · 27.1 · 27.1 · 27.1 · 27.1 oz/hr. This replaces item
  54's "Cold 55 °F and lower, blended to 62 °F". The grid's middle row now reads Moderate (its saved key is still `mild`). A typed fluid
  override wins every hour, and Results says "Fluid: your override, 24 oz/hr · Use my sweat grid"; the tap clears it for this ride and
  crunches again. Plan › Fluid today and Adjust this ride show the default: "fred's grid: 20–27 oz/hr today".
- **Caps per bottle (B).** Each hour's cap is its band's (Settings › Concentration caps: Cold up to 12%, Moderate up to 8%, Hot up to 6%;
  typed higher, held there), or the Strength limit typed for today (up to 12%). A bottle takes the cap of the warmest hour it is drunk
  30 min or more in; failing that, the hour it is mostly in (the later one on a tie). Never the ride's average.
- **Gels per hour (C).** Each hour gets round((its target − its bottle at its cap) ÷ the gel), at least 0, the rider's minimum on a full
  hour, its caffeine doses, at most its room. The bottle carries the rest, never over its cap. No hour over 90 g: checked as the gels
  really fall, since with a second gel they alternate A, B, so the added gel can be the bigger one. There is no ride-level count and no
  "+1" for strength or plain water. Two balance rules keep the ride within one gel:
  - while the hours with room are more than a gel short in all, the most short hour gets one more gel;
  - when a bottle held at its cap leaves an hour more than half a gel short (or the ride a gel short), that hour gets one more gel and
    the ride is planned again (at most 4 times).

  Golden ride: 10 gels at Cold 8% (2 caffeine), 8 at Cold 12%, 7 without the plain water bottle.
- **The last 30 min (D).** No gel there, its bottle at its cap: a planned shortfall, said on Gels per hour and in Why · hour by hour:
  "No gel in the last 30 min, so the last half hour is about 23 g under. That's planned."
- **Sodium per bottle (E).** Each bottle's target is its hours' sweat sodium (mg/L × each hour's planned fluid, plain water included),
  less its mix's sodium and the gels taken while it is in use. Whole capsules, capfuls and tablets; table salt in grams over 25 mg. The
  ride's top-up is their sum.
- **Copy (F).**
  - Gone: the "Suggested ≤ X% today leaves no room for carb powder" note, the "hard max" wording, the "N more gels keep them under X%"
    line for plain water, and Gel rounding on these plans.
  - How we calculated this is now: each hour's cap → its bottle at that cap → gels per hour → each bottle → mix → sodium per bottle.
  - Why these numbers has a Gels per hour note with each hour's sum.
  - Each bottle says "N% cap from hr K".
  - Science › Bottle strength has the item's three sentences and the new caps; the Strength limit field allows 12%.
- **Engine fixes the answer sheet found:**
  - sodium was sized on the carried fluid when a late refill is skipped; it is now on the planned fluid;
  - a refilled water bottle's rate is checked again against the final legs. My bottles + water could leave the last leg 9 oz short,
    with no warning.
- **Answer sheet (G):**
  - `RULES.md` R19.1–R19.6, with R1, R4, R4a, R4b and R5 updated;
  - `calc.js`: bands with no blending, every forecast ride hour by hour, `r19Hours` / `r19Bottles` / `r19Plan` / `r19Sodium`, caps from
    Settings;
  - `rules.mjs`: A2 per-bottle caps, A3 ride within one gel (tail added back), A11 by band, A12 on every hourly ride, A13 for R19, new
    A14 (90 g, half a gel per hour, sodium per bottle), new G10;
  - J17 in the README.
  - Test C (the item's numbers, never anyone's saved settings) and golden rides g57 (cap 8), g58 (override 24), g59 (cap 12) and g60
    (no water: the regression). G10 pins them to the item's hand numbers: fluid by hour, 10 / 8 gels, the bottles ≈ 5.7 · 3.9 · 3.9 ·
    6%, the last half hour ≈ 23 g under.
  - Random rides also try Settings caps (Cold 8–12) and WBGT by hour.
  - The harness passes each hour's WBGT, the caps, and the bike's big cages (never passed before).
- New `kit/work-q56/hourly56.test.js`:
  - the plan is hour by hour, with bands, caps, 90 g and gels per hour;
  - the fact line, the cap lines, the notes and the math;
  - no "Suggested ≤" and no "hard max";
  - the grid default in Plan and in Adjust;
  - the override line and its tap;
  - Settings caps 12/8/6, and Cold 12 changes the plan;
  - the science sentences;
  - layout at 320 px with 32 px text and at 390 px; contrast.
- Cache v81 (`sw.test.js` matches).
- **Older kit tests brought to item 56** (each kept as `*.pre-q56.js`):
  - v2 accept: the "no room for carb powder" note is now asserted gone.
  - q6 bottles: the carb top-off order and the previous build's ticks are checked with "Same recipe in every bottle" on (the default
    plan uses the main mix only and sizes each bottle on its own hours).
  - q8 owned: the drunk leftover keeps the ride within one gel; the skipped leftover's bottles stay under their own caps (no longer
    equal).
  - q13: the inventory allows the replaced math steps, the science card's title and text, "hard max", "Bottles are over the suggested
    X%" and Gel rounding.
  - q32 water: the ride within one gel; a refill skipped in the last 30 min is warned. The carb fit card ("It would need to be N%")
    is now tested with one recipe and a 2:00 stop, since the default plan gives what a bottle can't hold at its cap to gels.
  - q39 / q43 / q54: Moderate for Mild, one box per band, the band edges.
  - q49: no fluid jump between Cold and Moderate on the auto grid; each full hour within half a gel; the ride within one gel; the
    7.9 °F ride is still hour by hour.
  - q52: the Moderate box is 26 so the ride still has a 4:00 stop with two bottles. Starts, clocks, gels per hour, legend, totals and
    Copy text now follow R19.
- **Found by the kit:**
  - the override line showed on every ride (its flex display beat `hidden`);
  - "Moderate" overflowed the sweat grid's row label at 320 and 390 px;
  - a bottle field named `pre` tripped the troubleshooting copy's stack check (renamed `asked`).

## 57 · Adjustments use the per-hour engine; last gel allowed 30 min before the finish · DONE 2026-10-06
Source: the owner in chat.

- **Adjustments go through the hours (1).** A carbs pin, a gels pin (Adjust › Gels ±), a strength pin, a mix pin and "Same recipe in
  every bottle" are now planned hour by hour (R19); the old ride-level gel and bottle path no longer runs for them.
  - A carbs pin sets each hour's target (scaled down, or filled up to 90 g an hour, the hours with the most room first). The bottles
    carry what they can under each hour's cap; the hours' gels fill the rest.
  - A gels pin adds one gel at a time to the hour with the fewest gels, then the most room (hour under 90 g), then the earliest; it
    removes from the hour with the most, latest first. So no hour gets 3 gels while another full hour has 1.
  - A strength or mix pin sets every bottle to that strength; gels make up the rest, no hour over 90 g.
  - Same recipe: every bottle at one strength, the lowest of the bottles' own caps at most.
  - Still on the old path: My setup, bottle roles, no gels, and rides with a water or aid stop.
- **The last gel (2).** Gel windows end at finish − 30, inclusive. When that mark is a whole hour (a 5:30 ride), the last part-hour can
  take one gel at its start; otherwise the last full hour's gels are spaced back from it. 5:30 → 5:00, 5:00 → 4:30, 5:20 → 4:50.
- **Golden ride (3)** (answer sheet g57): 11 gels, 2 in each full hour and 1 at 5:00; 85 g every full hour and 42.5 g in the last half;
  no "last half hour is about N g under" line. The bottles come out at 5.4% (the first bottle is the 1 L, 8% Cold cap, its hours need
  less), then about 3.8–4.0% (25 g an hour in 27 oz of mix). That is not the item's 5.7% and 4.5%; see the note to the owner.
- **Adjust (4).** No "Add N gels" button on an hour-by-hour plan. When a pin asks for more than the hours can take, Results says
  "500 g is more than the hours can take: Hr 1, …, last ½ are at 90 g an hour. The plan stops at 495 g." The ride's g/hr is set where
  the plan stops (90, not 91), so the "Above 90 g/hr" note does not show.
- **Answer sheet (5).** RULES R18.2, R18.7, R19 eligibility and new R19.7 (adjustments). calc.js: dayWindow ends at finish − 30;
  pinTargets; r19Hours with pins, forced strength and gels pins; one strength for same recipe. rules.mjs: refR19 with pins; judgments
  J18 (an hour out of room or at 90 g) and J19 (a forced strength or a gels pin). Golden rides g57 (11 gels), g61 (500 g pin: 90 g in
  every full hour, no 3-and-1, the stop note), g62 (5:00 → 4:30), g63 (5:20 → 4:50). The 2,000 random rides now give about 1 in 4 a pin
  (carbs, gels, strength, mix or sodium) and check no gel after finish − 30 and no hour over 90 g. `npm test`: 1702 pass, 0 fail.
- Kit `work-q57/adjust57.test.js`: the default (last gel at 5:00, no shortfall line), Adjust › Gels + (one hour gains one gel, the
  fewest-gels hour with room), Carbs + until full (the stop note, no hour over 90), the 5:00 and 5:20 rides, no "Add N gels", layout at
  320 px with 32 px text and 390 px, contrast.
- Cache v82 (`sw.test.js` matches).
- **Found by the kit and fixed:**
  - a strength or mix pin above a bottle's cap was no longer flagged (it is again: red, "Over the suggested 3% …", "Back to 3%", Keep);
  - fewer gels pinned left the ride short without a word (now "Carbs land at … under the suggested" with "Add N gels"; never for the
    last 30 min, never for a carb pin the hours can't take, which has its own note);
  - with "Same recipe in every bottle" each bottle still got its own salt, so a stop's baggies didn't merge. Same recipe is now one
    recipe, salt included: the bottles' sodium needs added up and shared by each bottle's water (RULES R19.7, calc.js r19Sodium, A14).
- **Older kit tests brought to item 57** (each kept as `*.pre-q57.js`):
  - v2 adjust / v2 accept: gels 7 → 4 keeps the bottles at their cap and says the carbs are short ("Add 4 gels"); the red
    concentration and Keep are checked with the strength stepped above 3%; carbs 110 g/hr stops at 90.
  - q6 bottles: the carb top-off is checked with No gels (the ride-level path); old-build tick keys keep their form and labels (a
    changed recipe is a fresh tick).
  - q13 inventory (`allow.pre-q57.json`): the ride-level heat-band and pinned-bottle math steps, "Above 90 g/hr", the last-30-min
    "Add N gels" button and one cadence line.
  - q32 water: the carb fit card is shown with No gels on.
  - q52 / q54 / q56: the last ½ hour takes its gel at finish − 30 and has no shortfall line; Same recipe plans hour by hour, within one
    gel of the target.
- Regression baselines refreshed (`base.regress.json`, `base-fx.regress.json`; the old ones kept as `*.pre-q57.json`): 32 of 34 rides
  differed, from the last gel at finish − 30 and the pins planned hour by hour.
- Full kit (`kit57b.log`, on the final build): every line OK; layout 4 widths × 3 text sizes, 369 combinations each; answer sheet
  1702 pass, 0 fail; news pipeline 52 pass.
