# The written rules the answer sheet checks

This file is the only source for `tests/reference/calc.js`. The calculator is written from these sentences and never imports or copies the
app's code. Each rule says where it was written down first: a QUEUE.md item, or a text the app shows the rider. **[J]** marks a judgment call
left for Mark (see `tests/README.md`). Units: fluid in US fl oz, time in minutes, carbs and powder in g, sodium in mg.

## R1 · Units and constants
- 1 fl oz = 29.5735 mL. Table salt has 393.4 mg sodium per g.
- Concentration (strength) of a bottle = its carbs ÷ (its fill in oz × 29.5735) × 100, in % (g carbs per 100 mL). (Item 23.1)
- The hard ceiling for a mixed bottle is 8%, or today's suggested strength when that is higher (item 56: Settings › Concentration caps
  allow Cold up to 12%, Moderate up to 8%, Hot up to 6%). On the default plan (R19) each bottle's own cap is its limit.

## R2 · Ride length
- Time mode: the duration typed (hours and minutes).
- Distance mode: duration = the larger of 5 and (miles ÷ mph × 60), rounded to the nearest whole minute. 100 mi at 18 mph = 333 min.
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
- Fluid per hour = the sweat grid at the ride's temperature (R4a, item 39), or the fluid override when one is typed. (Before item 39:
  the sweat rate × the band's fluid factor; the band table's fluid column now lives only inside the auto Hot boxes.) Then the rider's fluid limits
  (item 38, Settings › Fluid limits, oz/hr, either may be blank): never below the lowest, never above the highest, whatever the weather,
  sweat rate or override. The plan says which one held it: "at your floor" / "at your ceiling". Blank: no limit.
- Sodium per hour = sweat sodium (mg/L) × fluid per hour in litres (oz × 29.5735 ÷ 1000).
- Ride totals = per hour × H.

## R4a · Sweat rate by weather and effort (item 39)
- The athlete's sweat rate is a 3 × 3 grid of oz/hr: rows by heat band (R3; item 56): Cold · Moderate (the "Mild" row before item 56) ·
  Hot; columns Recovery · Steady · Hard. A starting level sets the auto boxes: Light 16 · Normal 24 · Heavy 32 oz/hr.
- An auto box is fred's model: the level in Cold and Mild, the level × 1.5 in Hot (the old "hot days add 50%"). Effort and cold change
  nothing in that model, so the auto columns match. A box the athlete set is used as set: no heat increase on top.
- The ride's fluid = its effort's box in the row of the ride's heat band (R3: the WBGT when the forecast gives one, else the feels-like; 65 °F
  with no weather). Item 56: one box per band, no blending (items 39 and 54 blended between band centres; item 56's golden ride wants 20 oz/hr
  at WBGT 57.5, the Cold box).
- The fluid limits (R4) apply after it; sodium follows the fluid (R4).
- The label names the box of the ride's band: "your Moderate · Steady" when that box is the athlete's, else "auto"; "your override" with a
  fluid override.
- Migration: a single sweat rate becomes the closest level (a tie goes to Normal) with Mild · Steady set to the rate when it differs.

## R4b · Hour by hour (item 49)
- A ride is planned hour by hour when its forecast gives every ride hour (at the hour's middle; the last hour pro-rated by its minutes) and
  no fluid override is typed (item 56: on every such ride; before it only when the feels-like spread was 8 °F or more and the ride at least
  2 hours). On every ride without that forecast, R4 applies (one band). The screen's "Your ride warms up" card still needs the 8 °F spread.
- Hour k's fluid (oz/hr) = the sweat grid (R4a) box of that hour's band (its WBGT when the forecast gives it, else its feels-like), then the
  fluid limits (R4), each hour on its own.
- The ride's fluid = Σ (hour k's fluid × its fraction: 1, or the last hour's minutes ÷ 60). Fluid per hour = that ÷ H.
- Sodium per hour k = sweat sodium × hour k's fluid; the ride's sodium = their sum (so sodium per hour = sweat sodium × the fluid per hour).
- Carbs per hour stay the target every hour, and the bottles keep one strength (R5's suggestion from the ride's band, as before). Since
  item 52 each bottle has its own strength (R18.6) unless "Same recipe in every bottle" is on (R18.4).
- The plan names the limit that held the most hours ("at your floor" / "at your ceiling", the ceiling when as many), and the source
  "hour by hour".
- With plain water bottles (R12) each hour's mixed fluid = that hour's fluid less the water's even share (never below 0), scaled so the hours
  add up to the ride's mixed fluid.
- The screen: the top card shows "{start}→{finish}°" feels-like; Results shows "Your ride warms up" (finish at or above start) or "Your ride
  cools down" with each hour's feels-like and fluid, then HOUR BY HOUR (time · °F · oz · gels). Clothing is unchanged, and fred never says
  to take layers off or add them during the ride.

## R5 · Strength limits
- **Suggested strength S** for today = the smaller of 12 and (the Strength limit the rider typed, or else the band's %). (The band's % comes
  from Settings: Cold at most 12, Moderate at most 8, Hot at most 6, item 56.)
- **Hard limit L** for the always-true rule = the Strength limit the rider typed (at most 12); else the larger of 8 and S. (q34: "No mixed
  bottle exceeds the strength limit (default 8%)"; item 56: a Cold cap above 8 raises it.) On the default plan (R19) each bottle's own
  cap (R19.2) is the limit instead.
- With plain water bottles or My bottles, the mixed bottles are held at S (item 32.4: "If a mixed bottle would pass the strength limit, add
  gels to stay under it"). **[J1]** Without them, gel rounding may leave the bottles a little over S (but never over L); the app then shows
  "Bottles are over the suggested S%" with an "Add 1 gel" fix.

## R6 · Gels when fred decides (no pins, no My bottles; since item 56 only the rides R19 doesn't plan)
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

## R6b · Gels on a ride planned hour by hour (item 49: "gels fill each hour's carb gap, whole gels only, no two within 15 min")
- R6.1's gap = Σ over the hours of the larger of 0 and (carbs/hr × the hour's fraction − S × the hour's mixed fluid × 29.5735 ÷ 100 × the
  hour's fraction). R6.2–R6.6 then run as written, with R7's spacing at 15 min.

## R7 · Gel times (written in the app: "First at F, then every N min, last … no later than 30 min before the finish")
Since item 52 the gels go by the clock hour (R18): R7's first-gel time and "none in the last 30 min" still hold, inside each hour's window;
the count that fits is R18.2's rooms. The text below is kept as the record of the rule before item 52.
- The first gel at the first-gel time (default 20 min), or at the ride's end if the ride is shorter.
- The last gel no later than 30 min before the finish (if that is before the first gel, everything goes at the first gel time).
- In between, evenly spaced; each time rounded to 5 min; each at least 5 min after the previous one.
- The most gels that fit = the largest count for which every time stays at or before the latest time.
- Every gel is inside the ride (time ≥ 0 and ≤ the ride's length).

## R7b · Gel times on a ride planned hour by hour (item 49; replaced by R18 in item 52, kept as the record)
- When every hour's gap per hour (its gap ÷ its fraction) is the same within 1%, R7 with 15 min between gels (and the most that fit counted
  at 15 min).
- Otherwise gels per hour, as a running total: by the end of hour k, round(n × the gaps so far ÷ all the gaps) gels (all n by the last
  hour); inside an hour its gels are spread evenly: the hour's start + (j + ½) × its minutes ÷ its count, rounded to 5 min.
- Then the window, as in R7: not before the first-gel time (to the nearest 5 min), none after the last 5-min mark at or before 30 min
  before the finish, at least 15 min apart: forward from the first gel (each at least the first-gel time and 15 min after the one before),
  then back from the last (each at most the latest time and 15 min before the next one).
- An extra gel for a short or water-only leg (R12) takes the nearest 5-min mark in its window that is at least 15 min from every other gel;
  with no such mark it is left out (the leg's red warning stands).

## R8 · Caffeine (written in the app's Science text and the code's rule comment; replaced by R18.3 in item 52, kept as the record)
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
- Liquids measured in capfuls (item 47, e.g. Neversecond S200, 200 mg sodium per capful): whole capfuls only, mixed into the bottles. The
  ride gets round(gap ÷ mg per capful) capfuls, handed out bottle by bottle as a running total; sodium = capfuls × mg per capful.
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
- A ride with no bike has 2 cages. Bottles on the bike at the start never number more than its cages; a bottle drunk before the start is
  not on a cage. (Item 58: rides have no stops and no pocket bottle.)
- Plain water bottles: 0, 1 or 2, never the last cage (so at most cages − 1). Each holds only water, the plan bottle size, sipped evenly over
  the whole ride: water oz/hr = n × size ÷ H, but never more than 2/3 of the ride's fluid (app rule, **[J]** not in a queue item). The mixed
  bottles carry the rest of the fluid and all the carbs and sodium.
- Which bottles, their sizes and fills: R21 (item 59). Before item 59: owned bottles of another size never added a round of bottles,
  fewest bottles, no bottle under a third full, the 1 L bottles on the first leg, refills the plan size.
- My bottles: carb + electrolyte bottles fill the cages after the water (electrolyte bottles dropped first when they don't fit, at least
  one bottle). Each carb bottle carries "Carbs in each" g, but never more than S of its fill; electrolyte bottles carry no carbs; gels fill
  the rest of the carb target **[J7]** (whole gels, so up to half a gel off). Carb and electrolyte bottles share the sodium by fluid volume;
  water bottles carry none.

## R13 · Refills
- (Item 58: rides have no stops.) The next bottles start when the bike's cages run dry. (Item 59: every bottle R21 picks is carried; the
  ones after the cages start along the way, however late. **[J4]** applies only to bottle roles and My bottles: a round that would start in
  the last 30 min is skipped and the plan is made on the fluid that is carried.)
- No sliver bottles (a 5:30 ride had a 1 L "fill to 1 oz" bottle, no carbs, starting at 5:30): no mixed bottle after the ride's first holds
  under 2 oz, and none is listed at the finish (R18.5). With bottle roles and My bottles (**[J4]**) no new bottle starts in the last 30 min:
  no round along the way starts there, and a bottle that would hold under 2 oz goes into the bottle before it in its round when that one
  has room (a carb bottle's fluid only into a carb bottle), so the ride keeps its fluid, carbs and sodium. Else (the one before is full, or
  it is its round's first) it is not carried and its fluid is left off the end like a skipped round: the plan is cut by the bottle ÷ its
  role's share of the cages and made again on the fluid that is carried, and Results says "No new bottle in the last 30 min". The default
  plan keeps R21's bottles (item 59: carried however late; A16 holds them to the 2 oz too).
- Hour by hour (item 49): the next round of bottles comes when the bike's bottles run dry on the hours' fluid: when the fluid drunk (hour
  by hour, straight inside each hour) reaches k rounds of cages × the bottle size. Bottle windows use the same curve.

## R14 · Missing label values (q34: "must show 'unknown', never guess")
- A gel (main, second or caffeinated) or drink mix with no carbs value: the plan is refused with "<name>: carbs unknown".
- A gel or drink mix the plan uses with no sodium value: the plan runs, the sodium totals read "unknown", and no top-up is sized from a
  guess.
- A top-up product with no sodium value: left out of the plan with "<name>: sodium per <unit> unknown".

## R15 · Totals and rounding (q34)
- The totals shown equal the sum of the items listed (every bottle, by start time, and the gels).
- Grams are shown to 1 g and ounces to 1 oz (table salt to 0.1 g, **[J8]**).

## R16 · The always-true rules (checked on every golden ride and on 2,000 random rides)
A1. A plain water bottle contains only water.
A2. No mixed bottle is stronger than the hard limit L (R5); with plain water or My bottles, none is stronger than S; on the default plan
    (R19), none is stronger than its own cap (R19.2). Extra carbs go to gels; with "no gels" on, the shortfall is shown instead.
A3. With gels allowed: carbs/hr within ±2 g of the target (R19: the ride within one gel, the planned last-30-min shortfall added back);
    sodium/hr within ±5% of the target (R19: per bottle, A14); fluid/hr within ±1 oz/hr of the target (item 59: or the bottles up to 4 oz
    under the ride's mix fluid, never over, R21).
    (Exceptions listed in the README as judgment calls are reported, not failed.)
A4. Bottle carbs = Σ (powder grams × carbs per gram); powder grams are never counted as carbs.
A5. Whole capsules only; dissolved units in halves; scoops match the grams (R11).
A6. Bottles at the start never number more than the bike's cages; when the plan can't fit, a cage warning with fixes is shown.
A7. Totals equal the sum of the items listed.
A8. Grams shown to 1 g, ounces to 1 oz.
A9. Weather follows the band table in R3 (strength); the fluid matches the reference (R4, R4a).
A10. Fluid per hour is never below the rider's lowest or above their highest (R4, item 38); when one holds it, Results says "at your
    floor" or "at your ceiling" next to the fluid.
A11. The sweat grid (R4a, item 39; item 56: by heat band, no blending): every box, auto or own, is used for its effort and band; an own
    box never gets the heat increase; the floor and ceiling still apply; sodium per hour = fluid × sweat sodium; Results names the source
    ("· your Moderate · Steady" or "· auto").

A12. Hour by hour (item 49; item 56: on every ride with the forecast's hours): every hour's fluid is the grid box of its band within the limits; the ride's fluid is the sum of the hours;
    sodium per hour = sweat sodium × fluid; carbs/hr stay the target and the gels go where R18 puts them (item 52; R7b before it), at
    least 15 min apart; refills follow the hours' fluid.

A14. Hour by hour on the default plan (item 56, R19.6): fluid by hour; caps per bottle; gels per hour; no hour over 90 g; the ride within
    one gel; sodium per bottle.
    The item's own golden ride (tests/golden/rides.json "spec", rule G10) is also held to the numbers the item wrote by hand: fluid by hour,
    the gels, each bottle's strength, the last half hour's planned shortfall, no hour over 90 g.

A15. The ride's bottles (item 59, R21): the sizes and fills R21 picks; never over the need, at most 4 oz under; the 1 L bottles in the
    cages never more than the big cages; the cages first, the rest along the way (their leg starts when the hours' fluid empties the
    cages); a part-fill under a third only with its note; no hour above its grid fluid + 2 oz/hr.

A16. No sliver bottle (R13, R18.5): every mixed bottle after the ride's first holds 2 oz or more and is listed before the finish; with bottle
    roles and My bottles (**[J4]**), no round along the way starts in the last 30 min.

A13. The ride-day plan (item 52, R18; on the default plan since item 56, R19 and A14): whole gels per clock hour, never more than the hour's room, caffeine gels counted in their hour;
    the gels per hour as R18.4 (same recipe) or R18.6 (each bottle its own strength) put them; each bottle's carbs = its stretch's carb
    target − the gels of its stretch (+ what the bottles after it couldn't hold), never stronger than the limit; each hour's carbs within
    ±5 g of the target (**[J15]** where whole gels and the limit can't do better; **[J16]** with one recipe in every bottle); bottle starts
    on the hour within 5 min of it, else to 5 min, where the bottles before them run out; caffeine at R18.3's times, none in the last
    60 min, 45 min apart, within the limit; the totals add up (A7); both states of "Same recipe in every bottle".

## R17 · Runs (item 42, phase 1; checked on four scenarios and 400 random runs)
A run is planned by time or by distance × pace, at Easy · Steady · Hard (the ride efforts recovery · z2 · hard). Carbs/hr come from the
running targets (Settings › Running: 45 · 60 · 75 g by default); fluid/hr from the running sweat grid (R4a) at the run's temperature, then
the fluid limits; sodium/hr = fluid × sweat sodium. The run is cut into legs at each aid stop with water or sports drink.
RN1. Each leg carries min(need, the carry's capacity): what the carry can't hold is warned about, never a bigger flask.
RN2. No flask is stronger than the strength limit (the band's, or the typed one, never above 8%). Mix goes in at the start, and at refills
     only when the runner carries the mix; an aid station's sports drink is not counted (its carbs are unknown).
RN3. Gels make up the rest of the carbs (whole gels, nearest): carbs/hr within half a gel for the run of the target. Gels are timed evenly
     from minute 20 (or half the run) to 15 min before the end, at least 10 min apart; when that spacing caps the count, the shortfall is
     a judgment call, not a failure.
RN4. Sodium/hr within ±5% of the target, or within the electrolyte product's rounding (half a unit, or 0.1 g), or under it when no
     product is chosen or the gap is under 25 mg.
RN5. One refill per aid stop inside the run (every N miles, or the listed miles); each refills min(that leg's need, capacity).
RN6. Fluid/hr is the running sweat grid's box for the effort at the run's temperature, then the floor and ceiling.
RN7. A leg the carry can't cover (short by more than 50 mL and 5%) always shows the carry warning, and only then.

## R18 · The ride-day plan (item 52: bottles by start time, whole gels per hour, caffeine timed)
Minutes from the ride's start; D = the ride's minutes (R2); T = carbs per hour (R4); S = today's strength (R5).

**R18.1 Hours.** Hour k (k = 0, 1, …) runs from 60k to the smaller of 60k + 60 and D; its fraction is its minutes ÷ 60 (the last one
pro-rated). A time t belongs to hour min(last hour, max(0, floor(t ÷ 60))).

**R18.2 Each hour's window and room.** F = the smaller of the first-gel time and D; the latest mark = floor(max(F, D − 30) ÷ 5) × 5; the
first mark = the smaller of round(F ÷ 5) × 5 and the latest mark. Hour k's window runs from the larger of (its start, + 5 min after the first
hour) and the first mark, to the smaller of (its end − 10 min, unless it is the last hour) and the latest mark: so two gels in neighbouring
hours are always 15 min apart. Item 57: the latest mark (30 min before the finish) is allowed, inclusive; when it falls on an hour's start
(a 5:30 ride's 5:00), that hour's window starts at it (and so can hold one gel there) and the hour before ends 15 min before it. Its free marks: the window's 5-min marks from its start, each taken when it is at least 15 min after the last
one taken and at least 15 min from every caffeine time (R18.3). Its room = its caffeine gels + its free marks. The most gels that fit = the
rooms' sum, at least 1.

**R18.3 Caffeine times** (instead of R8). Only when caffeine is on for the ride (R8's first point), gels are allowed and a caffeinated gel
is set. From = the rider's "Caffeine from" (Plan › Advanced, minutes into the ride) or, on Auto, R8's first aim (the first-gel time on rides
of 150 min or less, else the larger of it and D − 150, but no later than 90); to = D − 60. If to < from: no dose (one left out, "window").
Doses n = 1 + floor((to − from) ÷ 150), at most floor(the per-ride limit ÷ the gel's caffeine) (the rest left out, "cap"; no cap when the
gel's caffeine is unknown), and when n > 1 at most the larger of 1 and floor((to − from) ÷ 45) (the rest left out, "window"). Times, on a
grid of 30 min when it fits, else 5 min: dose j at from + (j + ½) × (to − from) ÷ n, to the nearest grid mark (a half rounds down), held
between the first mark at or after from and the last at or before to, and when less than 45 min after the dose before, the first mark at
least 45 min after it. The 30-min grid fits when it has a mark between from and to and its last dose is at or before its last mark; the
5-min grid with no mark gives one dose at the last 5-min mark at or before to. Then a dose after floor(to ÷ 5) × 5 is left out
("window"), and a dose whose clock time (start + minutes, rounded to the minute, on a 24 h clock) is after the "none after" time is left out
("late"). Each dose is a caffeinated gel at its time, counted in its hour (R18.1).

**R18.4 The gel count and the gels per hour with one recipe** ("Same recipe in every bottle", and the rides R18.6 doesn't plan bottle by
bottle). The count N = R6 (rounding, hold, minimum) with R18.2's rooms as the most that fit, never more than that; the gels = the larger of
N and the caffeine doses. Per hour, a running total of the hours' gaps (R6b on a ride planned hour by hour, else each hour's fraction of
R6.1's gap; by the hours' fractions when there is no gap): by the end of hour k, round(gels × the gaps so far ÷ all the gaps) (a half rounds
up; all of them by the last hour). An hour over its room passes the rest to the nearest hour with room (the earlier one first). An hour
with more caffeine doses than gels takes the difference from the nearest hour with a plain gel (the earlier one first). Plain gels per hour
= the hour's gels − its caffeine doses. The bottles share one strength (R6.6, R10).

**R18.5 Bottle start times.** The bike's legs are the rounds of bottles (R13; item 58: no stops). In each leg the mixed bottles are drunk
one after another: the first starts at the leg's start, each other one where the bottles before it in the leg run out (the mixed fluid drunk
since the leg's start reaches their ounces: hour by hour on a ride planned that way, R4b, else at the steady rate). A start (a bottle's, or
a round's) within 5 min of a whole hour is at that hour, else at the nearest 5 min, never before its leg's start and never at the finish or
after it (then the last 5-min mark before the finish; R13: no bottle is listed at the finish). A bottle's
stretch runs to the next one's start in its leg, the last one's to the leg's end (the ride's end for the last leg), at least 5 min. Plain
water bottles start at their leg's start.

**R18.6 Each bottle its own strength** (item 52; replaced by R19 in item 56, kept as the record). Not when: "Same recipe in every bottle" is on; bottle roles; My bottles; an adjusted
plan (pins); no gels; a leftover (R12, carried, drunk or skipped); a stop with water only or an aid table; a leg short of fluid;
gels that didn't fit; no carb bottles (bottle roles). Then R18.4.
- A plan of plain gels per hour gives: each hour's gel carbs g (its caffeine gels, and its plain gels, the plain gels alternating A, B, A, B
  in time order through the ride when a second gel is set); bottle j's target = T × its stretch's minutes ÷ 60, its most = the hard limit
  (R5's L; S with plain water or My bottles, as in A2) × its fill in mL ÷ 100, its gels = Σ over the hours g × (the minutes its stretch
  shares with the hour ÷ the hour's minutes). From the last bottle back: want = target − gels + what the bottle after it passed back; its
  carbs = want, but not below 0 and not above its most; what is over its most is passed back to the bottle before it (by the first bottle:
  "short"). Hour k's carbs = g + Σ each bottle's carbs × (the minutes it shares with the hour ÷ its stretch's minutes); its miss = that −
  T × the hour's fraction. A bottle's carbs over today's strength = its carbs − (S × its fill in mL ÷ 100 + half the main gel's carbs), if
  more than 0 (half a gel over S is allowed, as R6.2's nearest rounding always allowed).
- A plan's key, in order: short (to 0.05 g); the misses beyond ±5 g, summed (to 0.05 g), an hour with no room for a gel (the gel-free
  last 30 min) counted with the hour before it (item 54: only the last bottle can feed it; scored apart, its miss made the plan empty the
  first bottles for more gels); whether any bottle's carbs are over today's strength (item 54);
  the bottles' carbs over today's strength, summed in half gels (÷ half the main gel's carbs, rounded down; item 54: among plans with some
  over, a gel is added for strength only when it takes at least half a gel off them); the number of gels (with the caffeine gels); the sum of the squared misses. A plan beats another when its key is smaller in
  that order (the last by more than 0.5).
- The start: hours k and k + 1 share a bottle when a mixed bottle starts before hour k's end and ends after it; hours that share bottles
  make a group. From the last group back, each group gets the number of gels per hour (0 up to the most room of its hours; a part hour gets
  that × its fraction, rounded; never fewer than an hour's caffeine doses or more than its room) that passes the least back from the group's
  first bottle (to 0.05 g), then has the least beyond ±5 g over its hours (to 0.05 g; a gel-free hour with the hour before it, as in the key), then the least over today's strength (any, then in half gels) in the bottles
  that start in the group (to 0.05 g), then the fewest (the earlier groups at 0 while choosing). Then, while the gels are under R6.4's
  minimum, one gel is added to the hour with room where the key is best.
- Then, one step at a time while it gives a plan that beats this one (the best such step, the first on a tie): move a plain gel from one
  hour to another with room; add one to an hour with room; add one to each hour of a run of 2 or more hours with room; take one away (never
  below the minimum); take one away from each hour of a run of 2 or more hours with plain gels (never below the minimum). The steps are
  tried in that order: moves (from-hour, then to-hour), adds, runs added (by first hour, then length), removals, runs taken away.
- The bottles carry the plan's carbs: the ride's bottle carbs = Σ the bottles' carbs (so the ride lands on the target less "short"); R9's
  sodium and top-up follow from these gels and bottle carbs.

**R18.7 Gel minutes** (During the ride; the plan itself goes by the hour). In each hour its p plain gels go round its caffeine gels: first
the even spots (item 57: in the window that ends at the latest mark, its last gel goes at the latest mark and the others at lo + (j + 1) ×
the window ÷ p, to 5 min, 15 min apart backward: a 5:00 ride's last gel is at 4:30, a 5:20 ride's at 4:50; elsewhere (1 gel: the window's middle, to 5 min; more: lo + (j + ½) × the window ÷ p when that leaves 15 min between them, else from
end to end; to 5 min; then 15 min apart forward and back; inside the window); each takes the nearest 5-min mark to its spot in the window
(the earlier one first) that is 15 min from every caffeine gel and every plain gel placed; if that can't place them all, p of the hour's free
marks (R18.2) spread evenly (index round(j × (marks − 1) ÷ (p − 1)); 1 gel: the middle one, rounding down). With an electrolyte bottle
(bottle roles, My bottles) the gels keep the half-hour marks (item 2) and each caffeine time takes the mark nearest it.

## R19 · Hour by hour: fluid, caps per bottle, gels per hour, sodium per bottle (item 56)
The default plan: every ride except bottle roles, My bottles and no gels (those keep R18.4).
Item 57: "Same recipe in every bottle" and the adjustments (pins) are on the default plan too (R19.7). D, T and the hours as in R18; g = the main gel's carbs.

**R19.1 Fluid by hour.** Each hour's band (R3) comes from its own WBGT when the forecast gives one, else its feels-like; without a forecast
for the ride's hours every hour has the ride's band. Hour k's fluid = the sweat grid box of its band for the effort (R4a, no blending), then
the fluid limits; with a typed override every hour has the override (then the limits). Hour k's mixed fluid m_k = its fluid less the plain
water's even share (R4b's scaling). A bottle lasts as long as its fluid lasts at those rates (R18.5 on the hours' fluid).

**R19.2 Caps.** Hour k's cap c_k = the rider's typed Strength limit, else its band's % (Settings: coldPct, modPct, hotPct). A carb bottle's
cap = the cap of the warmest band (Hot, then Moderate, then Cold) among the hours its stretch (R18.5) shares 30 minutes or more with; with
no such hour, the hour it shares the most minutes with (the later one on a tie). Never the ride's average.

**R19.3 Gels per hour.** For hour k: the bottle at cap A_k = c_k × m_k × its fraction × 29.5735 ÷ 100 (plain water excluded; item 60:
m_k is the fluid really drunk from the bottles that hour: the hours' fluid up to where the last bottle starts (R21.2), then that bottle
spread over the rest of the ride on the same curve, so under the grid when the bottles land under the need; no bottle per hour takes more
than A_k, and an hour short after its whole gels gets its bottle up to A_k first: B_k = min(A_k, T_k − G_k)); its target
T_k = T × its fraction. An hour with no room (R18.2: the gel-free last 30 min) gets no gels. Otherwise its gels n_k = round((T_k − A_k) ÷ g)
by the rounding setting (nearest: a half rounds up; up; down), at least 0, at least the rider's minimum per hour on a full hour, at least
its caffeine doses (R18.3), at most its room. Its gel carbs G_k = its caffeine gels' carbs + its plain gels' carbs (A, B, A, B … through
the ride in hour order when a second gel is set). No hour over 90 g: while G_k > 90 × its fraction and the hour has a plain gel, one plain
gel comes off. The bottles' share B_k = T_k − G_k, at least 0, at most A_k. The ride within one gel: while the hours with room are more than
g short in all (short_k = T_k − G_k − B_k), the most short hour (the earliest on a tie) that has room for another gel gets one more plain
gel, so long as no hour goes over 90 g with it (with a second gel the gels go A, B, A, B …, so the added gel can be the bigger one and the
later hours' gels change too: every hour is checked as the gels then fall) (that hour then lands on T_k: its bottle carries less). So an hour can land up to half a gel short, and the
gel-free last 30 min lands short by T_k − A_k: planned, and said ("No gel in the last 30 min, so the last half hour is about N g under.
That's planned."). There is no ride-level gel count and no extra gel for the strength limit or for plain water.

**R19.4 Each bottle.** Bottle j's carbs C_j = Σ_k B_k × (the minutes its stretch shares with hour k ÷ hour k's minutes). Over its cap
(R19.2 × its fill in mL ÷ 100): held at it. Then each hour's carbs = G_k + Σ_j the bottles' carbs in it (a held bottle in proportion to what
each hour gave it). When an hour with room is more than half a gel short, or the hours with room are more than g short in all, the most
short hour with room for another gel that keeps every hour at or under 90 g (as R19.3 checks it; the earliest on a tie) gets one more plain gel, as long as that
hour is itself more than half a gel short or the hours with room are more than g short in all (a gel never goes to an hour it would not
help), and R19.4 runs again on R19.3's sums with that gel (no new rounding); until neither holds or no hour can take one (at most 4 gels:
the app plans the ride again at most 4 times). Mix grams = C_j ÷ the mix's carbs per gram (the main mix only;
no blend partner on R19).

**R19.5 Sodium per bottle.** Hour k's sodium target = sweat sodium (mg/L) × hour k's whole fluid (plain water included) × its fraction ×
29.5735 ÷ 1000. Bottle j's target = Σ_k hour k's target × (the minutes its stretch shares with hour k ÷ hour k's minutes). Its need = that −
its mix's sodium − the sodium of the gels whose minute falls in its stretch (start ≤ t < end). The top-up per bottle: table salt in grams
(need ÷ 393.4, when the need is over 25 mg); every other unit whole (capsules, capfuls, tablets): round(need ÷ mg per unit), never below 0.
Plain water bottles carry nothing. No top-up product, or a sodium value unknown (R14): no top-up.

**R19.7 Adjustments (item 57: Adjust this ride, and "Same recipe in every bottle").** They change R19's inputs, never go round them:
- Total carbs pinned to P: below the plan, every hour's target in proportion (T_k × P ÷ ΣT); above it, the extra goes to the hours with
  room, evenly by minutes, an hour's target never past 90 g an hour (× its fraction). What the hours can't take is said: "P g is more
  than the hours can take: Hr 1 … are at 90 g an hour. The plan tops out at N g."
- Total gels pinned to N: R19.3's gels, then one at a time to the hours with room (a free slot, every hour still at or under 90 g as the
  gels then fall), the hour with the fewest gels first (so no hour gets 3 while another full hour has 1), then the most room (90 g less the
  hour's carbs), then the earliest; fewer, one at a time from the hour with the most plain gels (the latest on a tie). The bottles carry the
  rest of each hour up to their caps; no ride balance and no R19.4 extra gel.
- Bottle strength pinned (or the drink mix's grams pinned, as the strength that carries them in the ride's mixed fluid), at most 12%:
  every bottle at that strength, each hour's cap that strength, its bottle carrying it whatever the gels; R19.3's gels fill round it, and an
  hour whose gels and bottle together pass 90 g (or its own target, when that is higher) loses a plain gel.
- "Same recipe in every bottle": every hour's cap is the ride's strictest (the smallest of the hours' caps); R19.3 as usual; then every
  bottle at one strength: the hours' bottle carbs over the bottles' mL, no stronger than that cap, each bottle's carbs spread over its
  minutes.
  The salt too is one recipe: R19.5's needs of all the carb bottles added up, each bottle's share in proportion to its water.
- Total sodium pinned: every hour's sodium target in proportion, so it adds up to the pin; R19.5 per bottle as usual.
- Adjust never offers "Add N gels" on the default plan: the gel-free last 30 min is planned and the ride lands within a gel.

**R19.6 Checked (A14).** Every hour's fluid as R19.1; every bottle at or under its cap; no hour over 90 g; each full hour within half a gel
of T (or all its room used, or at 90 g); the ride's carbs within one gel (g) of T × H once the planned last-30-min shortfall is added back;
each carb bottle's sodium within one unit (or 25 mg for table salt) of its R19.5 target, unless its mix and gels alone are over it.

## R21 · The ride's bottles (item 59)
1. Need = the ride's mix fluid (the fluid less the plain water). The sizes are the rider's own bottles (Settings › My bottles, with how many
   of each); none saved: the plan's bottle size, any number, every cage takes it. Owning only 1 L bottles: the plan's size is
   there too (the usual bottles; when it is not itself a 1 L). Bottle roles and My bottles (the carb/electrolyte setup) keep
   their own lists.
2. The first bottles ride in the cages, at most as many 1 L as there are big cages (and as are owned), 1 L first, then the biggest others;
   the rest start along the way, any owned size, 1 L first; a part-filled bottle is always the last. A cage may stay empty while bottles
   start along the way only when no other owned bottle could ride in it.
3. In this order, the fewest bottles first:
   (1) full bottles within 4 oz UNDER the need (never over): the closest, then more 1 L;
   (2) full bottles and one part-filled last bottle that makes it exact, the part at least a third of that bottle (in the smallest owned size
       that holds it): more 1 L among the full ones, then the bigger full bottles;
   (3) a 28 oz swapped for a 1 L, last first, until (1) or (2) fits (the search over every count of each size covers it);
   (4) else the small leftover part-filled anyway, with the note "small fill: no 1 L to swap in" (when there is more than one bottle).
   Examples (28 oz and 1 L owned, 3 cages, 2 big): 128 → 1 L, 1 L, 28, 1 L fill to 32.4; 96 → 1 L, 1 L, 28; 70 → 1 L, 1 L (2.4 under);
   75 → 1 L, 28, 28 fill to 13.2; 130 → 1 L, 1 L, 28, 1 L (0.6 under). Only 28 oz: 100 → 28 × 3 + 16; 92 → 28 × 3 + 8 with the note.
4. Drinking stays at the hours' fluid (R4b): each bottle starts where the one before runs out on that curve; the last runs to the finish
   (a little under the grid when the bottles land under it). No hour is ever planned above its grid fluid + 2 oz/hr.
5. Carbs follow each bottle's hours (R19); a part-filled bottle's cap is on its fill. When the bottles land under, the top-up carries the
   missing fluid's sodium (none set: the gap stands, **[J20]**). Totals show the planned fluid and "(N oz under your grid)".

## R20 · No stops on a ride (item 58)
- A ride has no stops: no stops sheet, no water-only or aid-table legs, no pocket bottle, no water refill. When the ride needs more bottles
  than the bike has cages, the extra ones start where the ones before run out (R13, R18.5) and are listed by start time with the others;
  the summary says "N on the bike · M more along the way". Nothing says where they come from.
- The plan's numbers are R13, R18 and R19 on those rounds of bottles, as before. Runs keep their aid stations (R17).
- The last gel may go at the finish − 30 min, inclusive, never later (R18.2, item 57).
