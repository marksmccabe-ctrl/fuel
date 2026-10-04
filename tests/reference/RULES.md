# The written rules the answer sheet checks

This file is the only source for `tests/reference/calc.js`. The calculator is written from these sentences and never imports or copies the
app's code. Each rule says where it was written down first: a QUEUE.md item, or a text the app shows the rider. **[J]** marks a judgment call
left for Mark (see `tests/README.md`). Units: fluid in US fl oz, time in minutes, carbs and powder in g, sodium in mg.

## R1 · Units and constants
- 1 fl oz = 29.5735 mL. Table salt has 393.4 mg sodium per g.
- Concentration (strength) of a bottle = its carbs ÷ (its fill in oz × 29.5735) × 100, in % (g carbs per 100 mL). (Item 23.1)
- The hard ceiling for any mixed bottle is 8%. (App: "Never above 8%.")

## R2 · Ride length
- Time mode: the duration typed (hours and minutes).
- Distance mode: duration = the larger of 5 and (miles ÷ mph × 60), rounded to the nearest whole minute. 100 mi at 18 mph = 333 min.
- A stop at mile m is at m ÷ mph × 60 minutes (mph not rounded).
- Hours H = minutes ÷ 60.

## R3 · Weather band (record of the current band table)
The band uses the WBGT when the forecast gives one, otherwise the feels-like temperature.

| band | WBGT (forecast) | feels-like (no forecast) | strength suggestion | fluid | carbs |
|---|---|---|---|---|---|
| Hot | 80 °F or more | 85 °F or more | 3% | × 1.5 (unless a fluid override is typed) | × 0.85 only when "lower carbs in heat" is on |
| Moderate | 60 to under 80 | 65 to under 85 | 6% | × 1.0 | × 1.0 |
| Cold | under 60 | under 65 | 8% | × 1.0 (no reduction) | × 1.0 |

Humidity counts only through the WBGT. So a hot dry day (95 °F, WBGT 79) is Moderate, and a hot humid day (90 °F, WBGT 84) is Hot.
**[J3]** q34 says "cold band reduces fluid as the current band table says": the current table reduces nothing (× 1.0).

## R4 · Targets for the ride
- Carbs per hour = the athlete's g/hr for the effort (recovery, steady, hard), × 0.85 when Hot and "lower carbs in heat" is on.
- Fluid per hour = the sweat rate × the band's fluid factor, or the fluid override when one is typed.
- Sodium per hour = sweat sodium (mg/L) × fluid per hour in litres (oz × 29.5735 ÷ 1000).
- Ride totals = per hour × H.

## R5 · Strength limits
- **Suggested strength S** for today = the smaller of 8 and (the Strength limit the rider typed, or else the band's %).
- **Hard limit L** for the always-true rule = the smaller of 8 and the Strength limit the rider typed; 8% when none is typed. (q34:
  "No mixed bottle exceeds the strength limit (default 8%)".)
- With plain water bottles or My bottles, the mixed bottles are held at S (item 32.4: "If a mixed bottle would pass the strength limit, add
  gels to stay under it"). **[J1]** Without them, gel rounding may leave the bottles a little over S (but never over L); the app then shows
  "Bottles are over the suggested S%" with an "Add 1 gel" fix.

## R6 · Gels when fred decides (no pins, no My bottles)
1. What the bottles carry at S: S × (mixed fluid per hour × 29.5735) ÷ 100 g/hr. The gap = the larger of 0 and (carbs/hr − that), × H.
2. Gels are whole. Take the chosen gel, alternating with the second gel when one is set (A, B, A, B …), while the rounding rule allows:
   - nearest (default): take the next gel while half of its carbs ≤ the carbs still to cover;
   - up: take the next gel while anything is still to cover;
   - down: take the next gel only while all its carbs fit in what is still to cover.
3. Hold: while the bottles would be over the limit (L for the plain plan; S with plain water or My bottles) and the schedule has room
   (rule R7), take one more gel.
4. Minimum gels: at least ceil((whole hours + 1 if the minutes past the last whole hour are 20 or more) × gels per hour). Example: 2:30 at
   1 gel/hr = 3 gels; 5:04 = 5 gels; 1:15 = 1 gel.
5. "No gels" on: no gels at all. The bottles carry at most what S allows, and the plan shows the shortfall ("No gels: N g/hr short").
6. The bottles carry the rest: carbs target × H − the carbs of the gels (never below 0). So with gels allowed the ride's carbs equal the
   target unless the bottles had to be held (R6.3) and the schedule ran out of room, in which case the plan says so.

## R7 · Gel times (written in the app: "First at F, then every N min, last … no later than 30 min before the finish")
- The first gel at the first-gel time (default 20 min), or at the ride's end if the ride is shorter.
- The last gel no later than 30 min before the finish (if that is before the first gel, everything goes at the first gel time).
- In between, evenly spaced; each time rounded to 5 min; each at least 5 min after the previous one.
- The most gels that fit = the largest count for which every time stays at or before the latest time.
- Every gel is inside the ride (time ≥ 0 and ≤ the ride's length).

## R8 · Caffeine (written in the app's Science text and the code's rule comment)
- Nothing unless caffeine is switched on. "Long rides only" means rides of at least the set hours.
- Rides of 2.5 h (150 min) or less: the caffeinated gel takes the first gel slot.
- Longer rides: the first dose is aimed at the larger of the first gel time and (minutes − 150), but no later than 90 min ("about 90 minutes
  in on a 4-hour ride"); then one more every 150 min while the aim is at least 45 min before the finish.
- Each aim takes the nearest gel slot not already used (the earlier one on a tie).
- A dose that would take the ride past the per-ride caffeine limit (mg) is left out. A dose whose clock time (start time + minutes) is after
  the "none after" time is left out.
- The caffeinated gel replaces that slot's gel, carbs and sodium included; the bottles take up the difference (R6.6).

## R9 · Sodium top-up (items 27.3 and 23)
- Sodium from the gels + sodium from the drink mix in the bottles (powder grams × the mix's sodium per gram).
- Gap = the ride's sodium target − that. A top-up is added only when the gap is more than 25 mg for the ride.
- Table salt: grams = gap ÷ 393.4, exact (shown to 0.1 g **[J8]**).
- Capsules (swallowed): whole capsules only. The ride gets round(gap ÷ mg per capsule) capsules, handed out bottle by bottle as a running
  total (item 27.3).
- Tablets, sticks or scoops dissolved in a bottle: half units. The ride's total stays within a quarter unit of the exact amount (running
  total, like capsules).
- **[J5]** Whole capsules or half sticks can make the ride's sodium miss ±5% on short rides; the test then checks that the miss is no bigger
  than the unit makes unavoidable.
- With a second, lower-sodium powder set as the blend partner, the bottle carbs are split between the two powders so the bottle sodium is no
  more than the target minus the gels' sodium. **[J6]** Without a blend partner a high-sodium mix can go over the sodium target; the app
  shows a red "Sodium is over your ceiling" note.

## R10 · Powder and carbs (item 23.1)
- Powder grams = bottle carbs ÷ (label carbs ÷ label serving grams).
- Bottle carbs = Σ (powder grams × that product's carbs per gram). Powder grams are never counted as carbs; table-salt grams are not carbs.

## R11 · Scoops (display)
- Scoops = powder grams ÷ grams per scoop, from the exact grams, shown to the nearest quarter (q34). **[J2]** Item 27.4 says "to the nearest
  quarter or third"; the app follows item 27.4.
- No scoop size saved → grams only.

## R12 · Bottles and cages (items 8.2, 32, 33)
- A ride with no bike has 2 cages. Bottles on the bike at the start never number more than its cages; a pocket bottle and a bottle drunk
  before the start are not on a cage.
- Plain water bottles: 0, 1 or 2, never the last cage (so at most cages − 1). Each holds only water, the plan bottle size, sipped evenly over
  the whole ride: water oz/hr = n × size ÷ H, but never more than 2/3 of the ride's fluid (app rule, **[J]** not in a queue item). The mixed
  bottles carry the rest of the fluid and all the carbs and sodium.
- Owned bottles of another size (e.g. 1 L): never add a stop, fewest bottles, no bottle under a third full, the 1 L bottles on the first leg;
  refills are the plan size. Every bottle has the same recipe per oz.
- My bottles: carb + electrolyte bottles fill the cages after the water (electrolyte bottles dropped first when they don't fit, at least
  one bottle). Each carb bottle carries "Carbs in each" g, but never more than S of its fill; electrolyte bottles carry no carbs; gels fill
  the rest of the carb target **[J7]** (whole gels, so up to half a gel off). Carb and electrolyte bottles share the sodium by fluid volume;
  water bottles carry none.
- When the mixed bottles can't reach the first stop under the limit (plain water with stops set), the plan shows "Only N cage(s) left for
  mixed bottles" with fixes, and never goes over the limit.

## R13 · Refills
- Without set stops, the bike is refilled when its cages run dry. **[J4]** A refill that would fall in the last 30 min is skipped: the
  fluid of the bottles after it is not carried (the plan says so). The plan is then made on the fluid that is carried (R6 on that fluid),
  so the carried bottles and the gels hold the ride's carbs and sodium. A small leftover the rider chooses to skip works the same way.
- With stops set, each leg carries what it needs up to the cages (plus an optional 500 mL pocket bottle); a leg that can't is "short" and
  the plan shows a warning with fixes.

## R14 · Missing label values (q34: "must show 'unknown', never guess")
- A gel (main, second or caffeinated) or drink mix with no carbs value: the plan is refused with "<name>: carbs unknown".
- A gel or drink mix the plan uses with no sodium value: the plan runs, the sodium totals read "unknown", and no top-up is sized from a
  guess.
- A top-up product with no sodium value: left out of the plan with "<name>: sodium per <unit> unknown".

## R15 · Totals and rounding (q34)
- The totals shown equal the sum of the items listed (bottles at the start, baggies or refills, gels).
- Grams are shown to 1 g and ounces to 1 oz (table salt to 0.1 g, **[J8]**).

## R16 · The always-true rules (checked on every golden ride and on 2,000 random rides)
A1. A plain water bottle contains only water.
A2. No mixed bottle is stronger than the hard limit L (R5); with plain water or My bottles, none is stronger than S. Extra carbs go to gels;
    with "no gels" on, the shortfall is shown instead.
A3. With gels allowed: carbs/hr within ±2 g of the target; sodium/hr within ±5% of the target; fluid/hr within ±1 oz/hr of the target.
    (Exceptions listed in the README as judgment calls are reported, not failed.)
A4. Bottle carbs = Σ (powder grams × carbs per gram); powder grams are never counted as carbs.
A5. Whole capsules only; dissolved units in halves; scoops match the grams (R11).
A6. Bottles at the start never number more than the bike's cages; when the plan can't fit, a cage warning with fixes is shown.
A7. Totals equal the sum of the items listed.
A8. Grams shown to 1 g, ounces to 1 oz.
A9. Weather follows the band table in R3 (cold: fluid × 1.0).
