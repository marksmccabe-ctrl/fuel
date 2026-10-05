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

## The rules checked on every ride (and on 2,000 random athletes and rides per run)
1. A plain water bottle holds only water.
2. No mixed bottle is stronger than the limit: 8%, or the Strength limit the rider typed (with plain water or My bottles: today's strength).
   Extra carbs go to gels. With gels off, the shortfall is shown.
3. Carbs within ±2 g/hr of the target (when gels are allowed), sodium within ±5%, fluid within ±1 oz/hr.
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
12. Sweat rate by weather and effort (item 39): the fluid is the effort's box at the ride's temperature, blended between the band centres
    (40 · 62 · 85 °F), never jumping at 50 °F or 75 °F; own boxes never get the +50% for heat; limits still apply; sodium follows the fluid;
    Results says "· your Mild · Steady" or "· auto".

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
(one 75 mg dose fits).
Each also checks the gel count and times, caffeine doses, plain water oz/hr and the sodium top-up against the reference.

## Judgment calls for Mark (reported as TODO, never failing)
- **J1** Today's suggested strength (3% / 6%) can be passed by gel rounding, never past 8%. The app says so and offers "Add 1 gel".
- **J2** Scoops: q34 says the nearest quarter; item 27.4 says quarter or third (the app follows 27.4).
- **J3** "Cold reduces fluid": the band table has no cold reduction (fluid × 1.0).
- **J4** No refill in the last 30 min: that fluid isn't carried (stated on screen). The plan is made on what is carried, so carbs and sodium
  stay on target.
- **J5** Whole capsules, half sticks and the 25 mg top-up threshold can miss ±5% sodium on short rides.
- **J6** A drink mix alone over the sodium target, with no carb-only powder to blend. The app shows a red note.
- **J7** My bottles: the rider's fixed grams plus whole gels land within half a gel. The mix's sodium comes with those grams.
- **J8** Table salt is shown to 0.1 g (1 g of salt is 393 mg sodium).
- **J9** Plans with a red cage or short-leg warning land off target until the rider picks a fix.
- **J10** No sodium product chosen: sodium can't reach the target.
- **J11** Gels alone (whole gels, the rider's minimum per hour, or the caffeinated gel that takes the first slot) are over the target on
  short rides; the bottles carry no carbs.
- **J12** Extra gels for stops' missing carbs are whole (within half a gel for the ride), and they bring their own sodium (at most
  their sodium over the target).
- **J13** Water-only stop: that leg carries no mix or salt (warned above 50 mg).
- **J14** Aid-table stop: the table's drink is assumed to cover that leg.
- Also noted: plain water is capped at 2/3 of the ride's fluid (an app rule, not in any queue item). Humidity counts only through the WBGT,
  so a dry 95 °F day is Moderate. The random rides use a fixed seed (`ANSWER_SEED=<n>` tries others). The deploy gate needs one click:
  Settings › Pages › Source: GitHub Actions.
