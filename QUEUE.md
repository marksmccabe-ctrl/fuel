# fred build queue
Work top to bottom. Status: TODO → DOING → DONE (or BLOCKED + reason).

## 1 · DONE 2026-09-29 · fred v3: new look ("soft minimal") + all queued behavior changes
Done: every screen restyled to the soft-minimal spec with the new Plan/Results/Journal/Volume/Races/Log a race/Settings layouts; full test kit 63/63 OK; see QUEUE_LOG.md.
Attachment: docs/design/fred-design-spec_2026-09-28_v2.pdf. The PDF is the source of truth for LOOK; this text is the source of truth for BEHAVIOR. Where anything is ambiguous, choose what matches the PDF most closely and list the decision in QUEUE_LOG.md. Keep all existing features, ids, math, sync, the Strava connection and its rules, importers, the AI prompt cards, the CdA estimate and exports; this item restyles them and adds the behaviors below. No server/Worker changes. Commit once per numbered part; run the full test kit after parts 3, 7 and 11. In the log, include a 390px screenshot of every page next to the matching PDF page.

0) DESIGN SYSTEM (PDF pages 2–3)
- CSS variables: page #FAFAFA; panel #FFFFFF; blue #179BCC, green #BECC41, teal #2ABCBB, black #0D0D0D, red #EA233A (warnings and "worse" deltas only). Tints: blue rgba(23,155,204,.09), green rgba(190,204,65,.14), teal rgba(42,188,187,.10), grey rgba(142,142,147,.08). Dark text on tints: blue #127EA6, green #5F6A12, teal #1F8F8E.
- Text: primary #0D0D0D, body #3A3A3C, ALL secondary text and labels #6E6E73 (the renders show #8E8E93; do not use it for text). #8E8E93/#B5B5BA only for icons, inactive tabs and decoration.
- Type: system font, tabular numbers. Page title 28/600 left-aligned; hero numbers 40–48 weight 300; stat numbers 22–34/300; section titles 15.5/600; rows 14–15/400 with values in grey on the right; caps labels 12/700 uppercase +0.07em.
- Shapes: panels radius 18–22, 1.5px outline; inputs 44px tall, radius 12, #E5E5EA border; "auto" fields have a dashed border and an "auto" label; chips fully round; primary button black, 50px, radius 16; hairlines 1px #F0F0F2. No drop shadows except the selected segment of a segmented control.
- THE RULE: each page has exactly one tinted panel (the most important thing, tint + outline in the same color). Everything else is white with a colored or grey outline. No solid color blocks anywhere except buttons, dots, charts and pills.
- Shared components: tinted panel; outlined input section (caps heading + its inputs, always open); outlined collapsible section (48px header: title, grey summary, caret that rotates; open/closed remembered per device); timeline (11px dots on a 1.5px #D2D2D7 rail, hollow = upcoming or in progress); delta pills (better: bg rgba(190,204,65,.22) text #5F6A12; worse: bg rgba(234,35,58,.10) text #C21A2F; flipped when a goal is "Less"); segmented control (#F0F0F2 track, white selected segment, optional color dots); chips; checkbox rows (20px, done = green fill + struck-through grey text).

1) HEADER AND NAVIGATION
- Header: large left-aligned page title, optional grey subline (sync status or ride date), account circle on the right. Remove the centered logo bar; the fred tile stays on sign-in, splash and the app icon.
- Bottom nav: 5 tabs with line icons and labels: Plan · Journal · Volume · Races · Settings (Profile is renamed Settings). Active #0D0D0D, inactive #B5B5BA.
- Update the manifest/meta theme-color to #FAFAFA.

2) PLAN (PDF page 4): four sections, all open
- RIDE (the one tinted panel, in the chosen effort's color): Time | Distance segmented control; Time mode = hours + minutes; Distance mode = distance + avg speed + time (auto); then the effort control Recovery / Steady / Hard with teal/blue/green dots. The tint and outline follow the selected effort.
- WHERE & WHEN (grey outline): location; "Use my location · or type a temperature"; Date · Start · Ends (auto).
- STOPS (grey outline): one row per stop (mile or time, with estimated ride time and clock time) and Water / My baggies / Aid table chips; "+ Add a stop (up to 4)".
- TODAY & BIKE (grey outline): No gels · Caffeine · Fewest bottles chips; then "Bike" with a segmented control per bike (e.g. Tri · 3 cages / Road · 2 cages).
- Crunch the plan: full-width black button under the sections. Every input visible; nothing behind a tap; sections 12px apart with caps headings.

3) RESULTS (PDF page 5): prep checklist, in this order
- Top numbers (tinted in the effort color): "Steady · 4:30 · refill at 3:30"; bottles · gels · temperature (dew point); g carbs/hr · g total · concentration; "Adjust this ride" (existing Adjust panel, restyled).
- Weather: a SMALL outlined card above Bottles (about the Gels section's size): condition icon, temp, condition, "→ 54° by 12:30", feels / WBGT / band, one line of details (wind + gusts, humidity, dew point, rain, UV), and "Changed your plan: …". No sky gradient.
- Bottles (was Mix): tick row per bottle (cage + full recipe) and per refill baggie; header "N of M done". Ticks are saved on the plan and sync.
- Gels (was Pack): tick row per gel type with count and timing; the caffeine gel on its own row.
- Closet (was Wear): tick row per clothing item.
- During the ride: timeline bar + key moments (ride time and clock time).
- Nutrition totals (open): carbs, kcal (= carbs × 4), sodium, fluid, caffeine, ride time; a per-hour line; black "Copy" button. Copy text (plain sentence, commas, no dots): "Planned fueling for my {H:MM} {effort} ride on {M/D}: {X} g carbs total ({Y} g per hour), {kcal} calories, bottles at {C}% concentration, {Na} mg sodium ({Na/hr} mg per hour), {oz} oz fluid ({oz/hr} oz per hour), {N} gels, {mg} mg caffeine at {time}." Leave out parts that don't apply.
- Details: collapsed (the math).
- Save bar at the bottom: "Save it to your Journal to check in after the ride." Not now / Save to Journal (see part 4).

4) JOURNAL (PDF page 6): planned → check-in flow + timeline
- Save to Journal stores a planned entry with a full snapshot of the plan (inputs, bottles and recipes, gels and times, per-hour targets, caffeine, weather summary, clothing, stops, ticks), then clears Plan (keep the last location), with a toast "Saved to Journal · We'll ask how it went after {start + duration}" and a small "Planned" card on Plan. Not now saves nothing and keeps the results on screen.
- Groups: Check in (planned entries whose end has passed; teal dot on the Journal tab while any wait; Plan shows "How did {day}'s ride go?"), Upcoming (future plans), Done.
- Timeline layout: upcoming as hollow dots at the top, then entries newest first. Entry line: "MM/DD/YY HH:MM · H:MM · Name" (date/time and duration bold; name grey, defaulting to "{Effort} ride"; time follows the phone's 12/24-hour setting). Second line: actual numbers or the matched Strava ride (same date and sport, start within 90 min). Tags colored by meaning. Dot = effort color; races black. The waiting check-in is the one tinted item (teal) with a "How did it go?" button.
- Check-in sheet (same style): header "MM/DD/YY HH:MM · H:MM", Later / Save; "What you actually took in": bottles finished (quarter steps, "of N planned"), gels ("of N · K caffeine"), extra food (from products or custom carbs/sodium), ride time (pre-filled from Strava/import). Live line: "You took in X g carbs/hr (planned Y) · Z mg sodium/hr · W oz/hr". Then Energy / Stomach / Thirst / Clothes, Notes, Name (optional). Later keeps it in Check in.
- Checked-in entries get Copy with the ACTUAL version: "I took in {g/hr} g carbs per hour on my {H:MM} {effort} ride on {M/D}: {X} g carbs total, {kcal} calories, bottles at {C}% concentration, {Na} mg sodium ({Na/hr} mg per hour), {oz} oz fluid, {N} gels, {mg} mg caffeine at {time}."
- Patterns ("What fred noticed", collapsible under the timeline) and closet learning use ACTUAL intake only; planned-only entries never feed them. Migrate existing entries to Done.

5) VOLUME (PDF page 7): layout 5
- Top: sync line with Sync now; Season | Off-season; sport chips; Hours ▾.
- Season card (tinted blue): hours so far · on pace for (blue) · goal, with the progress bar directly underneath (dashed on-pace extension, green goal tick, grey last-season tick, labels), then the permission line.
- Four tiles: Last week (vs 5-week average), This week so far (vs the SAME days of last week), This month (vs the same days last year), Avg/week over the last 5 weeks (vs the weekly need for the goal).
- Charts: Hours per year and Months as in the PDF. Folded: Month by month list; sideways link.
- Hours per year scrolls sideways when there are more seasons than fit (imported history can go back 15+ years):
  - Bars keep a fixed comfortable width (about 32px bar + 10px gap on a phone; roughly the 8 most recent seasons visible at 390px). They never squeeze to fit.
  - The chart opens scrolled to the RIGHT end, so the current season, its dashed on-pace bar and the goal line are in view; the user swipes (touch) or scrolls (trackpad, Shift+wheel) LEFT to see older seasons.
  - Only the bars scroll: the card title, "% vs year before" label and legend stay fixed, and the y-scale is shared across all seasons (tallest season of all time), so bars stay comparable while scrolling.
  - When older seasons are hidden, show a soft fade on the left edge plus a small "‹ 2011" hint (the oldest season) that scrolls the chart all the way left when tapped; hide it once the start is reached. Mirror with a fade on the right when scrolled away from the newest season.
  - Scroll snaps to whole bars; each bar is tappable to show that season's hours, workouts and % vs the prior year in a small popover. Keyboard: the chart is focusable and ←/→ move one season.
  - With 8 or fewer seasons: no scrolling, no fades, no hint.
- Off-season mode: same content as today, restyled (the off-season card is the tinted panel, teal). The "Season over?" card offers Not yet / Start on a date… (date picker, default tomorrow) / Switch to off-season; a scheduled start shows "Off-season starts {date}" with Change / Cancel and switches automatically that day.

6) RACES (PDF page 8): layout 1 + graffiti
- Order is fixed: Last race card → Your bests → buttons → lists.
- Last race card (grey outline): "Your last race · date", race name, the time circled in green marker with "PR!!" and an arrow in blue marker, a handwritten note built from the top win (e.g. "first sub-5, baby!"), the race's selected wins with dark check marks, a teal squiggle, Copy wins / See race.
- Graffiti: fonts Permanent Marker and Caveat Brush, self-hosted as woff2 in /assets/fonts with their OFL license files (no runtime Google Fonts). The circle draws itself (~1.4 s) and "PR!!" pops ONCE, the first time the Races tab opens after a new race is saved; afterwards static. prefers-reduced-motion = static. A race with no PR gets no circle: a gentle note instead ("Finished. Race #N of the season.").
- Your bests: the ONLY colored card (tint + outline = teal All time, blue Age group, green chapter): view switch with dots, distance chips, best time, 2×2 leg PRs in grey-outlined tiles, four good-things lines.
- Buttons: + Log a race (black) · Table · Compare.
- Lists (grey outlines, collapsible): All races by year (name, black "PR" badge, time; second line: date · AG · Gender · Overall), Chapters (+ New chapter), then the "Add more races with AI" card (dashed).

7) LOG A RACE (PDF pages 9–10)
- Cards tinted in their leg color: Overview, T1, T2, Finish, Nutrition and Feel grey; Swim teal; Bike blue; Run green. Progress dots on top; ← and "Next: …" at the bottom.
- Digits-only times in EVERY duration field (log cards, check-in ride time, anywhere h:mm:ss is typed): formatted from the right as typed (451 → 4:51, 3051 → 30:51, 30851 → 3:08:51); numeric keypad; pasting h:mm:ss works; minutes or seconds over 59 flagged red.
- Bike and run halves: any two of leg time, first half and second half compute the third ("auto"); a manual edit turns auto off for that field; first half longer than the leg is flagged.
- NO wins, PRs or comparisons anywhere while logging (remove "Last time here…", negative-split notes and PR hints). Only entry help remains.
- Finish: overall time with a check that the legs add up; placings in the fixed order Age group → Gender → Overall, each "place of finishers"; age group; race weight; read-only weather summary.
- Nutrition card is the only place for carbs/sodium (bike and run), race morning and notes. Remove them from the Bike card; migrate existing bike values; the spreadsheet importer's "Carbs/hr" maps here.
- After Save: "Ready, Freddy." in marker font, the graffiti time, EVERY win listed together with tick boxes, the "found with fred · find your wins" switch, "Copy N wins", Done. The ticked wins feed the Races last-race card.
- Placings order AG → Gender → Overall everywhere else too: race detail, all-races table columns, Compare rows, wins lines, CSV/Excel exports.

8) SETTINGS (PDF page 11): search + list with colored lines, no boxes
- "Search settings" (filters rows live by label and value) and "Recently changed" chips (last 3 edited; tap to jump).
- Groups with a 2px line in their color under the heading and 1px lines in the same color at low opacity between rows: Fueling (blue), Gear (green), You (teal), Account & data (black). No panels, no tint on this page.
- Rows: label left, current value right in grey, chevron; tap opens that setting's editor in a sheet (existing editors, restyled). Fueling: Carbs per hour, Sweat rate, Sweat sodium, Drink mix, Gels, Sodium top-off, Carb top-off, Caffeine, All products. Gear: each bike, Add a bike, Closet. You: Name for results, Birthday (with age group), Gender, Weight, Units, Volume goal, Counts toward volume. Account & data (always last): Account, Strava, Imported training, Backup, Privacy, then "Delete my account" in grey.

9) ALL RACES TABLE (PDF page 12)
- Restyle only the frame (page color, rounded frame, title 17/600, chips per part 0). The cell colors are FROZEN: dew-point bands (≤55 #ADFBB1, 55–60 #FFFEB0, 60–65 #F7C6AB, 65–70 #FF7860, >70 #E6B0FF) on Temp/Dew/Humidity/Wind/NTP; W/kg bands (<1.5 #FF5E42, 1.5–2 #FFFD70, 2–2.5 #F2AA84, 2.5–3 #A3C4A7, ≥3 #C3C9D0); negative split #BECC41; best-in-view blue dot; the group header bands. Add a test that fails if any of these change.

10) EVERYTHING ELSE
Restyle every remaining screen with the same system and the one-tint rule: sign-in, empty states (Volume, Races), The science, Privacy, Compare, the Since chapter editor, closet editor, product library, bike editor, import sheets, AI prompt cards, the CdA section, the Strava callback page, toasts and the Adjust panel. Nothing keeps the old solid-color blocks.

11) QUALITY
- Contrast: WCAG AA on every screen (extend the automated contrast test to all screens in this build).
- Larger text: the layout matrix (320/375/390/430 × 100/150/200%) passes on every screen, including new ones. The scrolling year chart is exempt from the no-horizontal-overflow check only inside its own scroll container.
- Motion: only the graffiti draw/pop (once), toasts and caret rotation; prefers-reduced-motion disables all of it. Light mode only.
- Tests for: Plan's four sections with every input visible and the Ride tint following the effort, Plan → Journal (save, clear, toast time, Check in/Upcoming grouping, check-in math, Copy texts), digits-only entry, auto halves, no wins during logging, placings order in every listed place, nutrition migration, off-season scheduled start, Volume tiles' same-day comparisons, the Hours-per-year chart with 16 seeded seasons (opens at the newest season, scrolls left to 2011, shared y-scale, "‹ 2011" hint appears and disappears correctly, no scrolling with 8 or fewer seasons), Races order and the one colored card, graffiti plays once and respects reduced motion, Settings search and recently changed, frozen table colors.
- All existing tests still pass.

## 2 · DONE 2026-09-29 · Import training history: pick the right sheet in Excel files
Done: .xlsx imports pick the sheet whose header matches a known format (or the biggest usable one), ask "Which sheet?" when unsure, and pre-fill columns by header name; see QUEUE_LOG.md.
When an .xlsx is chosen, don't assume the first sheet. Pick the sheet whose header row matches a known format (TrainingPeaks, Strava, Garmin) or, failing that, the sheet with the most rows; if several look plausible, show a "Which sheet?" picker before the column-matching step. Pre-fill the column dropdowns by header name (Date/WorkoutDay, Hours/TimeTotalInHours, Meters/DistanceInMeters, Sport/WorkoutType, Title). Test with a workbook whose first sheet is a "Read me" of notes and whose data is on a sheet named "Workouts".

## 3 · DONE 2026-09-30 · Bug: imported training + Strava double-count the same workouts
Done: Volume now pairs each imported workout with at most one Strava activity (same local day, same sport, moving OR elapsed time within max(10%, 5 min) or distance within 10%) and counts Strava once; Settings shows the match count and a Sources view shows merges. The before/after on Ashley's real data must be read on her device; see QUEUE_LOG.md.
Ashley imported her TrainingPeaks history (CSV), then Strava synced; Volume now counts many workouts twice (once from the import, once from Strava). The rule "same date and sport, durations within 10% → count once (prefer Strava)" is either not applied or not matching. Fix it so each real workout is counted exactly once, whichever order sources arrive in.
1) Diagnose first and log what was actually wrong. Check:
- Dates: compare Strava's start_date_local (the athlete's local day), not start_date (UTC), with TrainingPeaks' WorkoutDay.
- Sports: map both sides into the same groups before comparing (Strava Ride/VirtualRide/GravelRide/MountainBikeRide and TrainingPeaks Bike/MTB → Bike; Run/TrailRun/VirtualRun and Run → Run; Swim → Swim; WeightTraining/Workout and Strength → Strength).
- Durations: TrainingPeaks TimeTotalInHours is usually elapsed time; Strava moving_time is shorter. Compare against BOTH moving_time and elapsed_time.
- Whether de-duplication runs only at import time (so later Strava syncs are never checked) instead of every time Volume is computed.
2) Matching rule, applied whenever Volume numbers are computed (so order doesn't matter):
- Same local date (±1 day only when one side has no time of day), same sport group, and EITHER duration within max(10%, 5 min) of Strava's moving OR elapsed time, OR (when both have distance) distance within 10%.
- Imported swims whose title contains "time estimated" match on date + sport + distance within 10% alone, ignoring duration.
- Pair one-to-one: each Strava activity absorbs at most one imported workout (closest match first), so a genuine double day (AM and PM run) or a brick stays two workouts.
- When matched, count the Strava activity and skip the imported one in the math (Strava has the real recorded time). Never delete imported rows.
3) Show it:
- Settings › Imported training: "6,034 imported · N matched to Strava and counted once."
- A small "Sources" view reachable from any Volume week or month: its workouts with source (Strava / imported) and which were merged.
4) Tests (seeded, no real Strava calls):
- TrainingPeaks Bike 2.0 h, 55 km on 2026-09-26 + Strava Ride same local day (moving 1:58, elapsed 2:05) → counted once, Strava kept.
- Strava start_date is the next day in UTC but the same local day → still matched.
- Imported swim with an estimated time + Strava swim of similar distance the same day → counted once, Strava's time used.
- Two real runs on one day with one Strava run → one pair merged, the other kept.
- Import after Strava, and Strava after import → identical totals.
- Recompute on the real data and log before/after hours per year in QUEUE_LOG.md.

## 4 · DONE 2026-09-30 · Polish round 2 (from iPhone testing)
Done: Plan boxes tinted with Advanced drop-downs, Settings groups fold with striped rows, Journal cards centred, Volume reordered (season card first, View at the bottom, avg-month tile), Races Custom anchors + striped lists; see QUEUE_LOG.md.
Apply on top of the v3 build. For parts marked CHECK FIRST, verify on the current build; if already fixed, note "already fixed" in QUEUE_LOG.md and skip it. The bottom tab bar is confirmed fixed: don't change it.
Screenshot of the current build (Volume): docs/queue-log/item4/volume-current-build.png.

1) PLAN: fewest buttons, advanced in drop-downs, every box lightly colored
- Principle for the whole Plan tab: show only what every ride needs; anything advanced goes in a collapsed "Advanced" drop-down (caret, closed by default, open/closed remembered per device).
- Every Plan box gets a light 10% tint with a matching 1.5px outline (this overrides the one-tint rule for Plan only): Ride = the selected effort's color (teal / blue / green); When & where = teal; Stops = blue; Advanced = green; the plan summary at the bottom = grey.
- RIDE (unchanged): Time | Distance, the time or distance + speed inputs, and effort (Recovery / Steady / Hard).
- WHEN & WHERE (rename from "Where & when"): only three inputs visible: Location, Date, Start time. Put a small location-pin icon inside the Location field for "use my location" (no separate link). Move "type a temperature instead" and the "Ends" time into this box's own "Advanced" drop-down.
- STOPS: one compact row when there are none ("No stops · + Add a stop"); stop rows appear only after adding one.
- ADVANCED (was "Today & bike"): a collapsed drop-down with No gels / Caffeine / Fewest bottles and the bike choice. Default bike = the last one used.
- The plan summary at the bottom must stay visible and must NOT be inside the Advanced drop-down; Crunch the plan stays below it.
- Remove the rule/tip about practicing the first gel at 20 minutes wherever it appears (Plan, Results, and anywhere else in the app). Search for it by text; if you can't find it, say so in the log.

2) SETTINGS: all collapsed at first, striped rows
- The four groups (Fueling, Gear, You, Account & data) are collapsible, collapsed the first time the tab opens, each showing its group name, colored line and a one-line summary. Open/closed is remembered after that.
- Rows inside a group alternate white / slightly darker (#F6F6F8) like spreadsheet rows, keeping the thin colored separator lines. Text stays AA-contrast on both.
- Remove the "Recently changed" chips entirely. Keep the search box; a search auto-opens the groups that have matches.

3) JOURNAL: text in the box
- The text inside the Journal's card (the check-in / "How did it go?" card and the empty-state card) is not centered and is a bit too big. Center it inside its box as in the PDF (horizontally for single-line headings and buttons; vertically within the row) and make it one step smaller: title 17px/600, body 14px/400. Screenshot before/after in the log.

4) VOLUME
- "This month" tile: compare against this season's average month, not the same month last year. Average month = season hours so far ÷ elapsed months (the current month counts as days elapsed ÷ days in month). Compare this month so far against that average scaled to the days elapsed. Label: "vs avg month this year".
- "Hours per year" card: give it a light tint and matching outline (teal 10%) so it stands out from the white cards. The season card stays blue.
- CHECK FIRST · Upright and sideways views keep their own unit: switching the sideways view to Sessions/Pace/Miles must not change the upright view, and vice versa. Upright has its own Hours / Miles / Sessions menu that every upright card follows. Both remembered per device.
- VOLUME PAGE ORDER (confirmed still wrong in the current build; replaces the "CHECK FIRST · Nothing above the first card" bullet):
  - Nothing between the "Volume" title and the season card: the season card is the first thing on the page.
  - New order, top to bottom: season card → the four tiles → Hours per year → months chart → month by month → then a "View" section at the very bottom holding everything that used to sit on top:
    - sport chips (All · Bike · Run · Swim · Strength) and the unit menu (Hours ▾ / Miles / Sessions),
    - the Season | Off-season switch,
    - "Off-season starts Nov 6 · Change · Cancel",
    - "Synced from Strava · 29 min ago · Sync now · ⋯".
  - So filters are never hidden: when any filter isn't the default (a sport other than All, or a unit other than Hours), show a small grey line inside the season card's top-right, e.g. "Bike · Miles ›", that scrolls to the View section when tapped. With the defaults, show nothing.
  - Pull-to-refresh on Volume still syncs Strava; a failed sync shows a toast at the bottom.
  - App-wide: the same rule applies to every tab. The first thing under the page title is the page's main card; controls, sync lines and notices go lower on the page, never above it.
- CHECK FIRST · Year chart: start at the first season that has workouts (no "2019 · 0 · −100%" when data starts in 2020). A real zero season between active ones shows 0 with no %; the first shown season has no %.
- CHECK FIRST · Empty state AI card: replace the three numbered steps with one line: "Not on Strava? Paste this prompt into any AI app and it'll guide you." Keep Copy prompt, the Import training history link and the privacy line.

5) RACES
- "Your bests" view switch becomes: All time · Age group · Custom. Custom (green, as chapters are today) shows bests since a personal anchor the athlete picks: a new baby, a bike crash, a diagnosis, a move, a new coach, anything. The Custom segment has a picker listing their anchors plus "+ Add an anchor" (name, start date, optional end date, icon: baby, bandage, heart, briefcase, bike, house, star). Existing chapters migrate into anchors unchanged (names, dates, public names). Wins lines use the anchor name ("Fastest 70.3 since the crash").
- All races list: alternate rows white / slightly darker (#F6F6F8), like spreadsheet rows. Same for the Chapters/anchors list.

Tests: Plan shows only Ride, When & where (3 inputs), Stops row, Advanced (closed) and the visible summary; every Plan box tinted; the 20-minute gel rule text is gone; Settings opens all collapsed, remembers state, rows striped, no Recently changed; Journal card text centered and resized; Volume "This month" math vs average month (seeded); Hours per year tinted; Custom anchors (add, pick, edit, migrate existing chapters, wins wording); striped race rows; plus the CHECK FIRST items when they apply. All existing tests still pass.

## 5 · DONE 2026-09-30 · Header logo, "chapter" wording, carb-targets link
Done: the centred fred-tile header is back on every tab, all copy says "chapter", "Why these carb targets?" removed (footer science links unchanged); see QUEUE_LOG.md.
1) Bring the logo back: restore the previous header on every tab (centered row with the blue 26×26 "fred" tile, a 1px × 18px divider and the page title at 18/800; account circle on the right). Remove the large left-aligned page titles. Keep everything below the header as it is.
2) Use the word "chapter", never "anchor", everywhere in the app (Races "Custom" bests, the picker, "+ Add a chapter", editor, wins lines, Settings, tests). Search the code and copy for "anchor" and replace user-facing text.
3) Remove the "Why these carb targets?" link/section everywhere it appears. Keep "The science →" in the footer at the very bottom of the app and its page, unchanged.
Tests: logo header on every tab; no user-facing "anchor"; no "Why these carb targets?"; The science link still in the footer. All existing tests still pass.

## 6 · DONE 2026-09-30 · Results › Bottles: recipe-card rows
Done: bottles named by size with ingredient lines (dotted leader, amount right, Water last in blue), full recipe on every bottle, "Baggie for the refill" cards, no "cage" in Results; ticks kept; see QUEUE_LOG.md.
Approved mockup: docs/queue-log/item6/mockup-bottles.png.
- Name each bottle by its size: "34 oz bottle", "28 oz bottle" (use the user's units: "1 L bottle" in metric). Remove "cage 1/2/3" everywhere in Results.
- Under the name, one line per ingredient: ingredient name LEFT-aligned, amount RIGHT-aligned (tabular numbers, 600 weight), with a dotted leader line filling the space between them (CSS: a flex filler with border-bottom: 2px dotted #C7C7CC). Order: drink mix, carb top-off, sodium top-off (salt shows grams and teaspoons, e.g. "1.0 g · ⅙ tsp"), then Water last, with its name and amount in dark blue #127EA6.
- Show the full recipe on every bottle, even when identical to the one above (no "same recipe").
- Refill baggies: title "Baggie for the refill" with grey "· at 4:00 · 24 oz bottle" after it; its powder lines; last line "Water at the refill ···· 24 oz".
- Keep the tick box on each bottle/baggie and "N of M done" in the header.
- Long ingredient names wrap on the left; the amount stays on the right, bottom-aligned with the name's last line. Must pass the larger-text matrix (at 200% the leader line may shrink to nothing, never overlap).
- Tests: two identical bottles both show full recipes; no "cage" text in Results; metric shows liters and ml; the leader line never overlaps text at 320px and 200% text. All existing tests still pass.

## 7 · DONE 2026-09-30 · Results › Bottles: recipe-card rows (revised; sent as "item 6" on 2026-09-30 after item 6 was done)
Done: 1 L bottles read "1 L bottle (34 oz)" for imperial users; the rest was already done by item 6; share-image role names fixed; see QUEUE_LOG.md.
Approved mockup: docs/queue-log/item6/mockup-bottles.png. Only what differs from item 6 needs doing; the rest is checked and logged as "already done".
- Name each bottle by its size: "34 oz bottle", "28 oz bottle" (metric users: "1 L bottle", "750 ml bottle"). A 1 L bottle for an imperial user reads "1 L bottle" with "(34 oz)" in grey. Remove "cage 1/2/3" everywhere in Results.
- Under the name, one line per ingredient: ingredient name LEFT-aligned, amount RIGHT-aligned (tabular numbers, 600 weight), with a dotted leader line filling the space between them (CSS: a flex filler with border-bottom: 2px dotted #C7C7CC). Order: drink mix, carb top-off, sodium top-off (salt shows grams and teaspoons, e.g. "1.0 g · ⅙ tsp"), then Water last, with its name and amount in dark blue #127EA6.
- Show the full recipe on every bottle, even when identical to the one above (no "same recipe").
- Refill baggies: title "Baggie for the refill" with grey "· at 4:00 · 24 oz bottle" after it; its powder lines; last line "Water at the refill ···· 24 oz".
- Keep the tick box on each bottle/baggie and "N of M done" in the header.
- Long ingredient names wrap on the left; the amount stays on the right, bottom-aligned with the name's last line. Must pass the larger-text matrix (at 200% the leader line may shrink to nothing, never overlap).
- Tests: two identical bottles both show full recipes; no "cage" text in Results; metric shows liters and ml; the leader line never overlaps text at 320px and 200% text.

## 8 · DONE 2026-09-30 · Plan with the bottles people own (fewest bottles)
Done: Settings › My bottles (+ big-bottle cages per bike), the engine plans with owned bottles (no extra stops, fewest, none under a third, big ones at the start), the one-time question, the carry/drink/skip leftover choice, the top card line, Adjust forces one size; see QUEUE_LOG.md.
(Sent as "item 7" on 2026-09-30.)
1) How fred learns bottle sizes
- Until the athlete tells us, assume every bottle is the standard size for their cages (today's behavior).
- Settings › Gear › My bottles: size chips (20, 21, 24, 26, 28 oz, 750 ml, 1 L, custom) with a count for each. Per bike: how many cages fit a big bottle (1 L+); default = all.
- Just-in-time question in Results the first time a plan leaves a bottle under ~33% full and no bigger bottles are saved: "Your 5th bottle only has 8 oz. Do you have any bigger bottles?" [I have 1 L bottles] [Other size…] [No]. "I have 1 L bottles" asks how many (1 / 2 / 3+), saves to My bottles and re-plans immediately; "Other size…" opens the size chips; "No" is remembered (never asked again; changeable in Settings) and shows the choice in part 3.
2) Engine
- After computing total fluid per leg (between stops), choose bottles from what the athlete owns to cover it, in priority order: (a) never add a stop, (b) fewest bottles, (c) no bottle under ~33% full, (d) biggest bottles in big-bottle cages on the first leg (start of the ride); normal bottles for refills.
- Each bottle's recipe scales with its volume, so every bottle has the same concentration; hourly carbs and sodium stay exactly as planned.
3) Small leftover that bigger owned bottles can't absorb: show a choice, not automatic: Carry a small bottle (X oz) · Drink X oz before the start (or at the stop) · Skip it (X oz under plan, Y%). Default = carry. Same "you can keep it" pattern as the concentration override.
4) Results: one line in the top card when bottle choice saved a bottle: "Using your two 1 L bottles: 4 bottles instead of 5." Adjust this ride can force a single size for that ride.
5) Tests: 5 h × 24 oz/hr with 2 × 1 L + 28 oz bottles owned → 4 bottles (1 L, 1 L, 28, 28), 123.6 oz ≥ 120 oz, equal concentrations; nothing saved yet → the just-in-time question appears once, answering "1 L × 2" re-plans to 4 bottles, answering "No" never asks again and shows the leftover choice; big bottles never placed in cages marked as not fitting; stops are never added to use smaller bottles; metric units. All existing tests still pass.

## 9 · DONE 2026-10-01 · Journal check-in: sleep and meals before the ride
Done: optional Before-the-ride section (sleep, last meal with quick picks, coffee, dinner), timeline summary, Copy sentence + caffeine total, three What-fred-noticed observations (4+ rides); see QUEUE_LOG.md.
(Sent as "item 8" on 2026-09-30, after item 8 was done.)
Add a "Before the ride" section to the Journal check-in sheet, between "What you actually took in" and "How it went". Everything in it is optional; skipping it never blocks Save. Same look as the rest of the sheet.

1) Sleep (last night)
- Hours slept: stepper in 0.5 h steps (default blank; shows e.g. "7.5 h").
- Quality: chips Poor · OK · Great.

2) Meals before the ride
- Last meal before the ride:
  - When: chips "Under 1 h" · "1–2 h" · "2–3 h" · "3 h+" before the start (or tap to enter a clock time).
  - What: a short text field with quick-pick chips from the athlete's own history (the 6 most-used entries, e.g. "Oatmeal", "Bagel + PB", "Toast + banana"); tapping a chip fills the field.
  - Size: chips Light · Normal · Big.
  - Carbs (optional): number in grams.
- Coffee / caffeine before: switch; when on, amount chips (1 cup · 2 cups · other mg). Counts toward the ride's caffeine total in Copy and patterns.
- Dinner the night before: short text + size chips (Light · Normal · Big).

3) Where it shows
- The Journal timeline entry's second line gains a short summary when filled, e.g. "7.5 h sleep · ate 2 h before".
- The actual-intake Copy text adds a sentence when filled: "Slept 7.5 h (OK). Breakfast 2 h before: oatmeal, normal size (~60 g carbs). 1 coffee."
- "What fred noticed" patterns can use these fields, e.g. "Your stomach was upset 3 of 4 times when you ate less than 1 hour before" or "Energy was 'Strong' 80% of the time after 7+ hours of sleep". Only show a pattern after at least 4 rides with the field filled, and phrase it as an observation, never advice.

4) Data
- New optional fields on journal entries (sleep hours, sleep quality, last meal timing/what/size/carbs, coffee + amount, dinner text/size). Existing entries migrate with the fields empty. Synced like the rest of the entry; included in Download a backup.

5) Tests: check-in saves with the section empty; hours stepper and chips save and reload; quick-pick chips come from the athlete's past entries; timeline summary and Copy sentence appear only when filled; caffeine before the ride adds to the Copy caffeine total; a seeded set of 5 rides produces the "ate under 1 h before" pattern, and 3 rides don't; larger-text matrix passes on the sheet. All existing tests still pass.

## 10 · DONE 2026-10-01 · Races: look back across all age groups and compare
Done: band per race (Dec 31 rule, imported fallback), Your bests age-group picker (remembered per device), band wins lines, Compare age groups view (per-band columns, best per row, percentile summary, tap to open a race), AG chips + column in the All races table; see QUEUE_LOG.md.
(Sent as "item 9" on 2026-10-01, after item 9 was queued.)
1) Age groups per race
- Compute each race's age group from the athlete's birthday with the triathlon rule: age on December 31 of the race year, in 5-year bands (25–29, 30–34, …). If no birthday is saved, use the race's imported "Age Group" value; if neither exists, the race is "Unknown age group" (included in All time only).
- Recompute when the birthday changes.

2) Your bests › Age group: pick any age group
- The Age group segment shows the current band with a picker ("35–39 ▾") listing every band the athlete has raced in, newest first, each with its race count ("30–34 · 6 races"). Choosing one shows the bests card for that band: best time per distance, leg PRs, best placing, good-things lines. The selected band is remembered per device; it resets to the current band when a new race is saved.
- Wins lines can reference bands: "Fastest 70.3 in any age group", "Best swim since 30–34".

3) Compare age groups (new view)
- Entry: a "Compare age groups" link under the bests card, and in the Races overflow menu.
- A table with one column per age group the athlete has raced in (oldest → newest; scrolls sideways on phones, current band pinned on the right; laptops show all). Distance chips on top (default: most-raced distance).
- Rows: Races (count) · Best time · Best swim · Best T1 · Best bike · Best T2 · Best run · Best AG place (place / finishers) · Best AG percentile · Average AG percentile · Best overall percentile. Times compare only within the chosen distance; empty cells show "—".
- The best value in each row gets the bests card's color highlight and bold; percentile rows note "higher is better". Below the table, one plain-language line built from the data, e.g. "Your average AG percentile is higher now (82nd) than in 30–34 (71st)." Observation only, no advice.
- Tap any cell to open the race it came from.

4) All races table: add an "Age group" filter chip row (All · each band) and an "AG" column showing each race's band.

5) Data and privacy: nothing new is stored except the remembered band choice; bands are computed. Works with imported races and Strava-matched ones.

6) Tests: seeded birthday 1987-06-02 with races in 2011–2026 → correct bands (age on Dec 31 rule, e.g. a June 2022 race counts as 35–39); picker lists only bands with races; bests per band correct; Compare table values and best-per-row highlight correct for 70.3 and Olympic; percentile summary line; imported "Age Group" used when no birthday; birthday change recomputes; All races table AG filter; larger-text matrix and sideways scrolling pass. All existing tests still pass.

## 11 · DONE 2026-10-01 · All races table: Age group dropdown
Done: "Age group ▾" dropdown next to the distance chips (bands newest first with counts, × to clear), combines with chips / sort / Pick races, title "35–39 · 70.3 · 4 races", CSV/Excel follow, remembered per device (phone and laptop apart); see QUEUE_LOG.md.
(Sent as "replace item 9 part 4" — item 9 here is item 10, already DOING, so added as the next item. It replaces item 10's Age group chip row in the table with this dropdown.)

- Add an "Age group ▾" dropdown to the table's top bar, next to the distance chips. Options: "All age groups" (default), then every band the athlete has raced in, newest first, each with its count ("35–39 · 7 races"). Bands use the same rule as the rest of the app (age on Dec 31 of the race year from the birthday; imported "Age Group" when there's no birthday).
- Picking a band shows only that band's races. It combines with the distance chips (e.g. 35–39 + 70.3), sorting and Pick races. The title updates: "35–39 · 70.3 · 4 races". Best-in-view highlights, the legend and the CSV/Excel downloads follow the filter.
- When a band is picked, the dropdown button shows it ("35–39 ▾") with a small × to clear back to All. The choice is remembered per device, separately for phone sideways view and laptop.
- Add an "AG" column (just after the race name) showing each race's band, so the filter is easy to check.
- Tests: picking 30–34 shows only races in that band; combines with a distance chip; counts and title correct; × clears; Excel download contains only the filtered rows; remembered after closing and reopening the table.

## 12 · DONE 2026-10-01 · Bug: wins rankings skip races (wrong "#3 all-time")
Done: cause was the overall needing full splits; every comparison now counts all same-distance races with the value (flagged ones out), lines read "#N of M …", #2–#3 need 5+, wins are tappable to see the comparison, saved wins re-ranked once keeping ticks; see QUEUE_LOG.md.
(Sent as item 11; 11 is already the table Age group dropdown, so this is 12. Note: rule 3 hides ranks below #3, so Michigan '26's "#5 of 13 all-time 70.3s" is tested as the computed rank, shown when the comparison is opened, not as a win line.)

Real case: Ashley's IM 70.3 Michigan '26 (5:22:48) is shown as "#3 all-time 70.3". Correct is #5 of 13: Muncie '19 5:10:29, Michigan '25 5:15:50, Rev3 Cedar Point '16 5:16:27, Michigan Titanium '17 5:21:55 were faster. The two skipped races are non-IRONMAN and have only an overall time (no splits).
1) Diagnose and log the cause (brand filter? requiring split data? course matching?).
2) Ranking rules for every rank-based win (overall, legs, transitions, all-time / age group / chapter):
- Compare against ALL races of the same distance type in that scope that have the value being ranked, regardless of brand, course or missing other splits.
- Exclude only races flagged for that leg or overall (no swim, short, long, cancelled, current/altered) from the comparison, and never rank a flagged race itself.
- Each rank line names its comparison: "#5 of 13 all-time 70.3s", "#3 of 6 bikes in 45–49".
3) Only show a rank line when it's meaningful: #1 always; #2–#3 only when there are at least 5 races in that comparison. Drop the rest (e.g. "#3 of 4 transitions" disappears).
4) Make wins checkable: tapping any win line shows the races it was compared against, sorted, with this race highlighted.
5) Recompute wins for all saved races after the fix; keep the athlete's ticked/unticked choices for lines that still exist.
6) Tests with this exact data: Michigan '26 → "#5 of 13 all-time 70.3s"; Rev3 Cedar Point '16 and Michigan Titanium '17 are included; no-swim and short races excluded; transitions line hidden (#3 of 4); bike line "#3 of 5 bikes in 45–49" shown; tapping a line lists the comparison races. All existing tests still pass.

## 13 · DONE 2026-10-01 · House style: grouped lists with colored section titles (option C)
Done: every list page is grouped on #F2F2F7 with the spec's section colours (Plan, Results, Journal check-in, Volume, Races, Log a race, Settings + the new Settings › Account page and the detail pages); heroes unchanged (tints made solid at their old look); nothing removed (inventory test, moves listed); AA title inks used for blue/teal; Athlete type and the TrainingPeaks row left for you / item 14; see QUEUE_LOG.md.
(Sent 2026-10-01 with fred-design-spec_2026-10-01_v1.pdf, the approved look for every page; it is the source of truth for LOOK. Copy in docs/design/.)

Rule: everything people fill in or scroll through is an iPhone-style grouped list; the heroes stay cards. Nothing is removed from any page: every field, line and button that exists today stays (see the PDF).

LOOK (PDF page 2)
- Page background #F2F2F7.
- Section title: small caps, 13px/700, letter-spacing .03em, 20px above and 7px below, sitting on the grey, in the section's DARK color: blue #127EA6, green #5F6A12, teal #1F8F8E, black #0D0D0D.
- White group: background #FFFFFF; TOP edge is a 2px line in the section's color (#179BCC / #BECC41 / #2ABCBB / #0D0D0D); bottom edge 1px #E3E3E8. Groups without a title (Details, Delete, Notes) use a plain 1px #E3E3E8 top line.
- Rows ≥ 46px; 1px #E3E3E8 lines between rows, inset 16px from the left; label left (16px), value right in #6E6E73, chevron when the row opens something; steppers and switches on the right; switches are black (not iPhone green).
- Optional footnote under a group: 12.5px #6E6E73.
- No outlines, tints or striped rows inside grouped screens. Text stays WCAG AA on grey and white.

HEROES THAT STAY CARDS (unchanged): Volume season card, the six boxes, Hours per year (teal tint) and the months chart; Results top-numbers card with "Adjust this ride"; Races last-race graffiti card and Your bests card and the three buttons; Plan's Ride card (tinted in the effort color); the Journal timeline page.

SECTION COLORS
- Plan (PDF p3): WHEN & WHERE teal (Location with a pin icon for "use my location", Date, Start, Type a temperature, Ends) · STOPS blue ("No stops · + Add a stop") · ADVANCED green, collapsed by default (No gels, Caffeine, Fewest bottles as switches, Bike). The plan summary is a footnote that stays visible (never inside Advanced). Crunch the plan below. This replaces "every Plan box tinted".
- Results (PDF p4): WEATHER teal (title "WEATHER · {place} · {start} – {end}"; rows: icon + temp + condition + later temp, feels/WBGT/band; wind + gusts, humidity, dew, rain, UV; footnote "Changed your plan: …") · BOTTLES · N OF M DONE blue (one tick row per bottle and per refill baggie, with the recipe-card lines) · GELS blue · CLOSET green · DURING THE RIDE black (timeline bar row + one row per key moment) · NUTRITION TOTALS blue (totals grid, per-hour row, "Copy for my coach or food app" row with Copy, footnote showing the copied sentence) · Details (untitled, collapsed) · then the Save bar (Not now / Save to Journal).
- Journal check-in (PDF p5): WHAT YOU ACTUALLY TOOK IN blue (footnote = live result line) · SLEEP LAST NIGHT teal · MEALS BEFORE green (Last meal and Dinner rows open small sheets; Coffee before is a switch) · HOW IT WENT black (Energy, Stomach, Thirst, Clothes chip rows) · untitled group: Notes, Name (optional). This replaces the "colored lines + striped rows" check-in look.
- Volume (PDF p6): MONTH BY MONTH blue (month, hours, two delta pills; footnote about the partial month) · VIEW black at the very bottom (Sports, Unit, Mode, Off-season starts, Strava last sync · Sync now).
- Races (PDF p7): "ALL RACES · N" then one group per year (black title + line); each race row = name + PR badge, second line date · AG · Gender · Overall, time, chevron · CHAPTERS green (+ New chapter) · untitled group "Add more races with AI · Copy prompt". This replaces the striped race rows.
- Log a race (PDF p8): each card is one grouped section titled "{LEG} · N OF 10" in its leg color (Swim teal, Bike blue, Run green, Nutrition blue; Overview, T1, T2, Finish, Feel black), progress dots above, fields as rows (auto fields read "1:16:50 · auto"), chip rows for Distance/Brand, ← and "Next: …" below. Finish: overall time row with the check line, then Age group → Gender → Overall as "22 of 180" rows.
- Settings (PDF p9): search box; FUELING blue · GEAR green (each bike, My bottles, Add a bike, Closet) · ACCOUNT & DATA teal (Account, Strava, TrainingPeaks plan, Imported training, Backup, Privacy) · Delete my account in its own group (red text) with the footnote "This deletes your account and all associated data." Groups are shown open (this replaces "collapsed at first" and the striped rows from the earlier polish round; search stays).
- Settings › Account page (same look): Name · Email (from Google, read-only) · Birthday (with age group) · Gender · Athlete type · Name for race results; SETTINGS: Units, Week starts on; CONNECTIONS: Strava, TrainingPeaks plan, Imported training; YOUR DATA: Download a backup, Restore a backup, Import race spreadsheet. The old "You" settings move here. Every other page opened from a Settings row (Fueling pages, Products, Top-offs, Caffeine, each bike, My bottles, Closet, Privacy, The science) uses the same grouped look.

TESTS: each page above renders as grouped with the listed section colors (title color + 2px top line); heroes unchanged; no field, line or button missing compared with the current build (list any you had to move); contrast AA; larger-text matrix passes; every control still works.

## 14 · DONE 2026-10-01 · Volume: six boxes + planned weeks from the TrainingPeaks calendar (PDF page 10; feed verified with the attached TrainingPeaks.ics)
Done: six boxes under the season card (Last week vs 6-wk avg, This/Next week planned, Last month, Avg/week 6 wks, This week vs normal); the TrainingPeaks link is kept on the Worker like a secret (masked, owner-only, Remove deletes link + cached plan), the .ics is parsed on the device; Plan shows tomorrow's planned ride; the Worker (stamped 5fca7a3) needs a redeploy in Cloudflare.
1) Layout under the season card: two rows of three boxes (cards). Row 1: Last week (actual from Strava/imports, "vs 6-wk avg" pill) · This week planned (planned hours; progress bar for done so far; "N h without optional") · Next week planned (a range when any workout is a range, e.g. "10–13 h", with the reason in small text). Row 2: Last month (actual, "vs previous month" pill) · Avg / week, last 6 weeks (actual) · This week vs your normal (this week's planned ÷ 6-week average as +/−%, green outline, reference only).
2) Before a plan is connected, the two planned boxes become one dashed-blue "Connect your plan" box that opens the connect sheet.
3) Connect sheet (also at Settings › Account & data › TrainingPeaks plan): four numbered steps (open TrainingPeaks on a computer · Settings › Account › Calendar · copy the link · paste it below), one paste field accepting webcal:// or https://, and the privacy note "Keep this link private: anyone with it can see your training calendar. fred stores it only in your account; remove it anytime." Store the link like a secret (owner-only, masked after saving; Remove deletes it and the cached plan).
4) Fetching: the Worker fetches the .ics server-side at most every 2 hours and on Refresh (no browser CORS).
5) Parsing (ical.net feed; see the attached file): unfold CRLF + space continuation lines; unescape \n \, \;. Per VEVENT: DTSTART (date-only or date-time) → day; SUMMARY "Type: Title"; DESCRIPTION lines "Workout type: …", "Planned Time: H:MM", "Actual Time: H:MM", "Distance Planned: …", "Actual Distance: …". Skip Workout type Custom / Day Off / notes. A title starting "OPTIONAL:" marks the workout optional. When Planned Time is missing, read durations from the title ("5 hr", "60'", "45'", "5:30", "3:10"); "A OR B" gives a min–max range; if nothing can be read, count it as "1 workout without a planned time".
6) Done-so-far uses fred's own actual hours (Strava/imports, Mon–Sun), falling back to the feed's Actual Time only for days without Strava/import data. Last week stays actual-only (the feed carries just 5 days of history). Same sport counting as the rest of Volume.
7) Small grey note under the boxes: "Plan from TrainingPeaks · updated 2 h ago · changes can take up to a day to appear."
8) Extra: on Plan, "Tomorrow's planned ride: {title} · {duration}" → one tap fills the duration.
9) Tests with the attached TrainingPeaks.ics (today = 2026-10-01): this week = 12.15 h planned incl. 1.5 h optional (bike 8.0, swim 2.25, run 1.92); next week = 7.17 h + "5:30 OR 3:10" → 10.33–12.67 h; Custom check-ins skipped; folded/escaped lines parse; "This week vs your normal" math; link removal deletes the cache; the not-connected box appears with no link. All existing tests still pass.

---

# News tab (sent 2026-10-01 with fred-news-tab-spec_2026-10-01_v1.pdf: the source of truth for LOOK; page numbers refer to it; copy in docs/design/). All athletes, results and headlines in the mockups are sample data; outlet names are real examples.

Global rules for items 15–20:
- House style: grouped lists with colored section titles + 2px top lines (option C), series tags, initials avatars, contrast AA, larger-text matrix passes.
- Facts and links only: never store or show article text, transcripts, photos or copied results tables. Headlines are the source's own titles, linked. Anything fred writes is 1–2 sentences, in its own words, credited and linked.
- Strava: link to a pro's profile only; never pull or show other athletes' activities.
- Anything only Mark can do (keys, accounts): mark that step BLOCKED with exact instructions, build everything else, and make the app degrade gracefully until it's done.

## 15 · DONE 2026-10-01 · Navigation: News tab; Settings in the account circle (PDF p2)
Done: bar Plan · Journal · Volume · Races · News; the account circle opens Settings on every page (marked current there), /settings and ?view= deep links, a red attention dot when Strava needs reconnecting; News has Racing · Commentary · Other, last tab remembered per device; Races unchanged.
1) Bottom bar: Plan · Journal · Volume · Races · News (newspaper icon). Remove the Settings tab.
2) The account circle at the top-right of every page opens Settings (same page as today). Keep /settings as a deep link. Show a small dot on the circle when Settings needs attention (e.g. Strava needs reconnecting).
3) Races is unchanged (the athlete's own races and wins). Do not build any "My races | Pro racing" switch.
4) News opens on its last-used tab: Racing · Commentary · Other (segmented control at the top, remembered per device).
5) Tests: five tabs; circle → Settings on every page; /settings works; the attention dot; existing Settings tests updated to the new entry point.

## 16 · TODO · News data pipeline: sources → scheduled jobs → news.json (PDF p10–12)
1) Files in the repo: data/sources.json (every source, with enabled flag; PDF p11), data/news.schema.json (JSON Schema), data/news.json (the published file; format on PDF p11: meta, races, results, pros, story, items, standings), tests/fixtures/news.fixture.json (the sample data from the mockups, for UI tests).
2) Jobs = GitHub Actions scheduled workflows (cron in UTC; times below are US Eastern):
- news-daily: 6:00 and 18:00. Read every enabled RSS and podcast feed; add new items (section "commentary" when about pro racing, else "other" with category + sports); match items to races and pros by names in titles/descriptions; write "in_short" for new articles; extract a podcast timestamp only when the episode notes state one.
- news-weekend: Thursday 6:00. Upcoming pro races for the next 10 days (official series calendars and announcements), pro start times with time zones, previews.
- news-results: Sunday 21:00 and Monday 6:00. Last weekend's results, standings, and 1–3 "story" lines per race.
- news-pros: 1st of each month. Check each pro's links (Instagram, Strava, PTO stats, IRONMAN Pro Series bio, T100 profile, World Triathlon profile); keep only links confirmed from the athlete's own website/bio or an official profile; set links_checked.
- Every job: build → validate against the schema → commit data/news.json only if valid and changed ("[skip ci]"). On failure, keep the previous file and open a GitHub issue with the error.
3) Sources (data/sources.json, PDF p11): Triathlete, Slowtwitch, Tri247, 220 Triathlon, DC Rainmaker, Cyclingnews, Runner's World, endurance.biz (RSS); Pro Tri News, The Triathlon Hour, That Triathlon Life, The World Triathlon Podcast (podcast RSS); World Triathlon (official API). Find each site's official RSS/podcast feed URL; if a source has no feed, set enabled:false and list it in QUEUE_LOG.md. Adding or removing a source must never need code changes.
4) WTCS data: results, splits, rankings and events from the official World Triathlon API (docs: developers.triathlon.org). Needs a free API key → GitHub secret WT_API_KEY. If missing: BLOCKED step for Mark ("register at developers.triathlon.org → copy the API key → GitHub → fuel → Settings → Secrets and variables → Actions → New secret WT_API_KEY"); WTCS races then show links only.
5) Summaries and extraction: Anthropic API, model claude-haiku-4-5-20251001, temperature 0, GitHub secret ANTHROPIC_API_KEY. If missing: BLOCKED step for Mark (console.anthropic.com → API key → secret ANTHROPIC_API_KEY); News then shows headlines and links only (no In short, no story lines, no extracted results).
- "in_short": one sentence, ≤ 25 words, fred's own words, no quote longer than 5 words, only facts present in the source, no opinions or ratings.
- "story": 1–3 lines per race, each tied to exactly one source + URL.
- Extraction returns strict JSON, validated in code (times as h:mm:ss, places as integers, names matched to known pros or added as new pros).
- Articles may be fetched for processing (respect robots.txt; never stored); if a fetch isn't allowed, work from the RSS description only.
6) Results confidence: publish a podium or time only from an official source (World Triathlon API, official press release) or when two independent reports agree; otherwise the race shows "Results coming" with links. Mark each result with "source".
7) Polite fetching: User-Agent "fred-news (+https://fuel.bluebirdmultisport.com)", one request per source per run, cached; no IRONMAN or T100 results pages scraped (link to them only).
8) Size limits: 8 weeks of races/results, 60 days of items, ≤ 300 pros; file ≤ ~400 KB.
9) Tests: RSS and podcast parsing (fixtures), World Triathlon API (mocked), schema validation rejects bad files, the confidence rule, the in_short contract (mocked model; word count, no long quotes), name matching, no-key fallbacks, the failure path keeps the last good file.

## 17 · TODO · News › Racing, race pages, pro cards (PDF p3, p6–9)
1) News › Racing (p3): chips All · IRONMAN · 70.3 · T100 · WTCS (remembered); THIS WEEKEND (blue; series tags: IRONMAN black, 70.3 dark grey, T100 orange #E4572E, WTCS blue #1F5FAD; pro start time in the viewer's time zone; headline pros; → race page; footnote with live-tracking links per series); LAST WEEKEND (green; women and men podiums, one story line, → race page); STANDINGS (black; Pro Series · T100 · WTCS segmented; women/men; top 3 + Full standings link); PROS YOU FOLLOW (teal; only when following anyone).
2) Race page after the race (p6): THE STORY (1–3 lines, each with source tag + link; footnote "Written by fred from the reports below"), RESULTS (top 5 women and men → pro card; WTCS adds Swim · Bike · Run splits, p8), COVERAGE · READ and COVERAGE · LISTEN (the Commentary items linked to this race), official results link. Back link "‹ News".
3) Race page before the race (p7): pro start times (viewer's time zone), place, series, points; PREVIEWS; PROS TO WATCH with a reason; HOW TO FOLLOW (tracker app, livestream, race page) and "Add to calendar" (an .ics with the pro start times, generated in the app).
4) Pro card (p9): initials avatar (no photos), name, country, home base, "Racing {race} {day}" tag, ☆/★ follow; links row (only confirmed links; each opens the official page); RANKINGS; IN THE NEWS (Commentary items mentioning this pro); RECENT RESULTS (last 5 across series; "Full history on PTO stats").
5) Following: followed pro ids stored in the athlete's account (synced). Items about followed pros float to the top of Commentary with a small "Following" tag.
6) States: no file yet → friendly empty state; file older than 10 days → "Updated {date}"; offline → last cached copy (service worker, stale-while-revalidate); a race with no confirmed results → "Results coming".
7) Tests with the fixture: every section renders; chips filter; standings switch; race pages before/after; WTCS splits; pro card links (full and partial); follow/unfollow syncs; Add to calendar .ics has correct times/time zones; empty/stale/offline states.

## 18 · TODO · News › Commentary (PDF p4)
1) Chips: All · Articles · Podcasts · IRONMAN · T100 · WTCS.
2) RECAPS (green) and PREVIEWS (blue): source tag, date, read time, the source's headline, "In short:" (hidden when absent), "Read on {source} ↗" (opens in a new tab, rel="noopener").
3) PODCASTS (black): show, date, length, episode title, "Talks about {race} at mm:ss" when known, "Listen ↗".
4) Newest first; followed pros first. Every item also appears on its race pages and pro cards.
5) Tests: chips; In short hidden when absent; links open externally; timestamp line only when present.

## 19 · TODO · News › Other + My sports (PDF p2, p5)
1) Chips: All · Gear & tech · Training · Industry · Cycling · Running; line "Showing: Tri · Bike · Run · My sports ›".
2) Sections: GEAR & TECH (teal; category tag Bikes / Wheels / Wearables / Shoes / Nutrition / Swim; a "Tested" group only when the source used the product; fred never rates gear), CYCLING & RUNNING (blue), INDUSTRY (black; events, brands, pricing, rules, qualifying). Training & science items when present.
3) Every item: source, sport tag, category, age, read time, headline, In short, Read on ↗. No images.
4) My sports sheet (from Other and from Settings): Triathlon, Cycling, Running, Swimming, Gravel & MTB (default: Triathlon, Cycling, Running), plus which sections to show. Stored in the account.
5) Footer on every News tab: "Report a problem" (opens an email to Mark with the item id).
6) Tests: My sports filters Other only (not Racing or Commentary); chips; no third-party images load (check the CSP and network log); Report a problem includes the item id.

## 20 · TODO · News launch check
- Run every job once by hand; publish the first real news.json; open each tab on an iPhone-sized viewport and compare with the PDF; list in QUEUE_LOG.md which sources are live, which are disabled and why, and any BLOCKED steps for Mark. All existing tests still pass.
