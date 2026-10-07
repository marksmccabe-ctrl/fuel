# The answer sheet: how fred's fueling math is checked

Every push and pull request runs `npm test` (GitHub Action `answer-sheet`). It checks fred's real plan math, in the real app page, against
written rules. A wrong answer fails the run and blocks the Pages deploy. Each failure prints the ride, the expected and actual numbers, and
the rule it breaks.

**Run it:** `npm ci`, then `npx playwright install chromium` (once), then `npm test` (about 10 s).
**Rebuild the expected answers** after a rule or ride changes: `npm run golden:build`. **Overview table:** `npm run answers:summary`.

**How it works.** `reference/calc.js` works out the expected answers from `reference/RULES.md` alone; it never uses the app's code. The test
then loads `index.html` in headless Chromium (no network, a fixed clock), plans each ride with fred's own engine, and compares.

## Test athletes (`fixtures/athletes.json`, made up, never a real rider)
- **Test A:** 60 / 85 / 90 g carbs per hour (recovery / steady / hard), sweat 34 oz/hr at 1,024 mg/L. Tri bike (3 cages), Road bike (2).
  Owns 2 × 1 L and 4 × 28 oz bottles. Products: a carb drink mix (36 g carbs and 360 mg sodium per 40 g), a carb-only powder, a gel (25 g),
  a caffeine gel (22 g, 75 mg), a 215 mg capsule, a 500 mg stick, and table salt; since item 47 also two real products with their label
  values: Neversecond C30+ Energy Gel (caffeine) (30 g carbs, 200 mg sodium, 75 mg caffeine) and Neversecond S200 Sodium Booster (a liquid,
  200 mg sodium per capful, whole capfuls in the bottle).
- **Test B:** 60 / 70 / 80 g/hr, 20 oz/hr at 700 mg/L, Road bike (2 cages), 3 × 24 oz bottles, one gel, one drink mix, table salt.
- **Test C (item 56):** the item's golden ride numbers: 85 g/hr Steady, a sweat grid with Cold · Steady 20 and Moderate · Steady 27.1 (own
  boxes), 1,000 mg/L, TT bike (3 cages, 2 big), 1 L × 4 and 28 oz × 9 owned, a C30 gel (30 g, 200 mg), a C30+ caffeine gel, C90 mix (90 g
  carbs and 200 mg sodium per 94 g), S200 capfuls (200 mg, whole).

## The rules checked on every ride (and on 2,000 random athletes and rides per run)
1. A plain water bottle holds only water.
2. No mixed bottle is stronger than the limit: 8% (or today's cap when higher, up to 12%), or the Strength limit the rider typed (with
   plain water or My bottles: today's strength). On the default plan (item 56) each bottle is at or under its own cap: the cap of the
   warmest hour it is drunk 30 min or more in. Extra carbs go to gels. With gels off, the shortfall is shown.
3. Carbs within ±2 g/hr of the target (when gels are allowed; item 56: the ride within one gel once the planned last-30-min shortfall is
   added back), sodium within ±5% (item 56: per bottle, rule 15), fluid within ±1 oz/hr.
4. Bottle carbs = powder grams × that product's carbs per gram. Powder grams are never counted as carbs.
5. Capsules and capfuls (item 47) come whole; dissolved sticks and tablets in halves; scoops match the grams (nearest quarter).
6. Bottles at the start never outnumber the bike's cages; if the plan can't fit, a cage warning with fixes shows.
7. Every total shown (Totals, Details, the hourly table) equals the bottles, baggies and gels listed.
8. Grams are shown to 1 g and ounces to 1 oz.
9. Weather follows the band table: Hot (WBGT ≥ 80 °F, or feels-like ≥ 85 °F): strength 3%, fluid × 1.5. Moderate: 6%, × 1. Cold
   (WBGT < 60, or feels-like < 65): 8%, fluid × 1.0 (no reduction). Since item 39 the fluid comes from the sweat grid (rule 12).
10. No number is ever "NaN"; a missing label value reads "unknown", never a guess. Gels sit inside the ride, none in the last 30 min.
11. Fluid per hour is never below the rider's lowest or above their highest (Settings › Fluid limits, item 38), whatever the weather,
    sweat rate or a typed override; Results says "at your floor" / "at your ceiling" when one holds it.
12. Sweat rate by weather and effort (item 39; item 56): the fluid is the effort's box in the row of the ride's heat band (Cold, Moderate,
    Hot by WBGT, else feels-like), one box per band, no blending; own boxes never get the +50% for heat; limits still apply; sodium follows
    the fluid; Results says "· your Moderate · Steady" or "· auto".
13. Hour by hour (item 49; item 56: on every ride whose forecast gives its hours): each ride hour (the last one pro-rated) takes the grid
    box of its own band (its WBGT, else its feels-like), within the limits; the ride's fluid is their sum and sodium follows it; gels at
    least 15 min apart; refills and stops come from the hours' fluid.
14. The ride-day plan (item 52, rules R18): gels are whole numbers per clock hour, never more than an hour's room (15 min apart, none in the
    last 30 min, caffeine gels counted in their hour). Each bottle starts where the ones before it in its leg run out (on the hour within
    5 min of it, else to 5 min); with each bottle its own strength (the default) its carbs are its stretch's target less that stretch's
    gels, never over the hard limit, today's strength kept where whole gels allow, and each hour within ±5 g of the target; "Same recipe in
    every bottle" keeps one strength and spreads the gels by the hours' gaps. Caffeine gels at their own times: from "Caffeine from" to
    60 min before the finish, on the half hour where possible, 45 min apart, within the limit. Random rides try both switch states and
    "Caffeine from" times.
15. Hour by hour on the default plan (item 56, rules R19): each hour's gels = round((its target − its bottle at its cap) ÷ the gel), at
    least the rider's minimum and its caffeine doses, at most its room, none in the last 30 min, no hour over 90 g; the ride within one gel
    (a gel more to the most short hour); each bottle at or under the cap of its warmest 30-minute hour, held there, with a gel more where a
    held bottle leaves an hour more than half a gel short; each bottle's top-up from its own hours' sodium less its mix and its gels (whole
    capsules, capfuls and tablets; table salt in grams). Random rides also try Settings caps (Cold 8–12, Moderate 6–8, Hot 3–6) and WBGT
    by hour. The item's own golden ride is pinned to the item's hand numbers (rule G10): fluid 20 · 20 · 27.1 · 27.1 · 27.1 · 27.1 oz/hr,
    10 gels at the Cold cap of 8% (8 at 12%), the bottles about 5.7 · 3.9 · 3.9 · 6%, the last half hour about 23 g under, and the same
    ride with a 24 oz/hr override and without the plain water bottle.

## Runs (item 42; `engine/run.test.mjs`, rules R17 in `reference/RULES.md`)
Four scenarios: 1:45 Steady with 2 × 500 mL soft flasks and aid every 2 mi · 3:30 Hard with a vest and no aid (carries 1,000 mL, warns) ·
hot 85 °F 1:30 Steady with a handheld and aid every 3 mi · 2:00 Hard on one 500 mL handheld with no aid (the carry warning, never an
over-strength flask). Plus 400 random runs (fixed seed) on rules RN1–RN7: carry capacity, strength, carbs within half a gel, sodium,
aid refills, fluid from the running sweat grid and limits, and the carry warning.

## Golden rides (`golden/rides.json`; Test A unless marked B)
Recovery 1:00 · Steady 2:30 · Hard 2:00 · Steady 5:00 · Steady 6:30 with 2 stops · Cold 40 °F · Cool 55 °F · Hot 90 °F humid (WBGT 84) ·
Hot dry 95 °F (WBGT 79) · 1 cage · 2 cages · 3 cages (water 0) · 1 L bottles owned · no 1 L bottles · plain water 1 · plain water 2 ·
2-cage bike + 1 water with a stop (must warn) · 2-cage bike + 1 water, no stops · My bottles carb + electrolyte + water · electrolyte-only
bottles · No gels · Caffeine on (two doses) · Caffeine off · Caffeine on with a late start (cutoff) · Capsules that need rounding · Scoops
that need rounding (B) · Gel with no carbs value (refused: "carbs unknown") · Drink mix with no sodium value ("sodium unknown") · 100 mi at
18 mph · Oct 3 ride: 5:04 Steady 56 °F (from the Journal, rebuilt on Test A) · Steady 3:00 on 24 oz bottles (B) · Stick top-up ·
Caffeine gel, and second gel, with no carbs value (refused) · Fluid ceiling on a hot humid ride · Fluid floor on a cool ride (B) · A typed
fluid under the floor · Fluid limits that don't bind · Sweat grid (item 39): Steady at 60 °F (Cold auto, Mild own), 74 °F and 76 °F (Mild auto,
Hot own), an own Hot · Hard box at 95 °F (no +50%), Recovery at 35 °F (Heavy, all auto, B), an own Hot box under a ceiling, Light Hard at
85 °F (B). Item 47: S200 Sodium Booster in whole capfuls (sodium = capfuls × 200 mg) · the C30+ caffeine gel under a 100 mg caffeine limit
(one 75 mg dose fits). Item 49, hour by hour: warming 52 → 80 °F over 5:30 · cooling 80 → 55 °F over 4:00 Hard · 40 → 95 °F under
fluid limits 34–42 oz/hr (the floor holds the cold hours, the ceiling the hot ones) · warming 52 → 80 °F with one plain water bottle ·
7.9 °F over 4:00 (one temperature, as before). Item 52, the ride-day plan: warming 52 → 80 °F over 5:30 with a stop at 4:00 and caffeine
from 2:00 (the PDF's starts 0:00 · 1:30 · 3:00 · stop 4:00 · 5:00, caffeine 2:30 and 4:00) · the same ride with Same recipe in every
bottle · caffeine from 4:10 on a 5:00 ride (no room: left out) · three doses from 0:30 on a 7:00 ride under 300 mg.
Each also checks the gel count, the gels per hour and their minutes, caffeine doses, plain water oz/hr and the sodium top-up against the
reference.

## Judgment calls for Mark (reported as TODO, never failing)
- **J1** Today's suggested strength (3% / 6%) can be passed by gel rounding, never past 8%. The app says so and offers "Add 1 gel".
- **J2** Scoops: q34 says the nearest quarter; item 27.4 says quarter or third (the app follows 27.4).
- **J3** "Cold reduces fluid": the band table has no cold reduction (fluid × 1.0).
- **J4** No refill in the last 30 min: that fluid isn't carried (stated on screen). The plan is made on what is carried, so carbs and sodium
  stay on target. Hour by hour (item 49) the fluid not carried is up to half of the thirstiest hour's fluid.
- **J5** Whole capsules, half sticks and the 25 mg top-up threshold can miss ±5% sodium on short rides.
- **J6** A drink mix alone over the sodium target, with no carb-only powder to blend. The app shows a red note.
- **J7** My bottles: the rider's fixed grams plus whole gels land within half a gel. The mix's sodium comes with those grams.
- **J8** Table salt is shown to 0.1 g (1 g of salt is 393 mg sodium).
- **J9** Plans with a red cage or short-leg warning land off target until the rider picks a fix. Hour by hour (item 49), an extra gel for a
  short leg that has no slot 15 min from the other gels is left out, so such a plan lands under the carbs target until the fix.
- **J10** No sodium product chosen: sodium can't reach the target.
- **J11** Gels alone (whole gels, the rider's minimum per hour, or the caffeinated gel that takes the first slot) are over the target on
  short rides; the bottles carry no carbs.
- **J12** Extra gels for stops' missing carbs are whole (within half a gel for the ride), and they bring their own sodium (at most
  their sodium over the target).
- **J13** Water-only stop: that leg carries no mix or salt (warned above 50 mg).
- **J14** Aid-table stop: the table's drink is assumed to cover that leg.
- **J15** Each bottle its own strength (item 52): an hour lands more than 5 g off its carbs only where whole gels and the strength limit
  can't do better (no single gel moved, added or taken away beats the plan). Mostly the last 30 min, which take no gel while its bottle is
  at the limit (the bottle before it carries the rest, so the hour before lands over), and rides where the bottles' limit makes one more
  whole gel an hour the only way not to fall short (the ride then lands a little over its carbs).
- **J16** Same recipe in every bottle (item 52, and the rides R18.6 doesn't plan bottle by bottle: stops with water only or an aid table,
  short legs, My bottles, no gels, leftovers): one strength in every bottle, so an hour lands within about a gel of its carbs.
- **J17** The default plan (item 56): a full hour more than half a gel off its carbs where the rules themselves put it there: the
  rider's minimum gels per hour or the caffeine doses carry more than the hour's target (its bottle then carries nothing), or the gel the
  ride needed to stay within one gel lands in an hour with less than a gel of room. The app's hour must still equal the rules' hour.
- **J18** The default plan (item 57): the ride more than a gel short only where hours are out of room (the first-gel time, 15 min
  apart, none later than 30 min before the finish) or at 90 g of gels, or with a target over 90 g an hour; nothing can add carbs there.
- **J19** A pin on the default plan (item 57): Adjust's strength or drink-mix grams hold every bottle at the pinned strength, or Adjust's
  total gels sets the count; the hours fill around it within 90 g and their caps, so the ride lands where the pin puts it, and Results
  says what it gives instead of the target.
- Also noted: plain water is capped at 2/3 of the ride's fluid (an app rule, not in any queue item). Humidity counts only through the WBGT,
  so a dry 95 °F day is Moderate. The random rides use a fixed seed (`ANSWER_SEED=<n>` tries others). The deploy gate needs one click:
  Settings › Pages › Source: GitHub Actions.
