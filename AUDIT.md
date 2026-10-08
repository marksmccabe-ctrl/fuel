# Item 63 · Results: numbers and short labels (Oct 8)

Mark's marked-up screenshots, plus his rule: **Results shows numbers and short labels. Explanations live in Details. Warnings, and
anything that changes what the rider does, stay.** Details is unchanged, word for word; the test compares the two builds. Cache
`fred-shell-v88`.

Before (left) and after (right), the Hard 5:30 ride from the screenshots: `audit/q63-results-top.png`, `audit/q63-results-bottom.png`.
The run look: `audit/q63-run.png`.

## What Mark marked (1–12)

| # | Was | Now |
|---|---|---|
| 1 | Hard · 5:30 · 3 on the bike · 1 more along the way · 1 water bottle | Hard · 5:30 |
| 2 | Weather checked just now · ↻ Update weather | Gone. The forecast refreshes on its own (below). |
| 3 | Using your three 1 L bottles: 3 bottles instead of 4. | Gone |
| 4 | Adjust this ride | Adjust |
| 5 | WEATHER · CARMEL, IN · 8:00 AM – 1:30 PM | WEATHER |
| 6 | Feels 66° · WBGT 61° · Moderate band | Feels 66° · WBGT 61° |
| 7 | Changed your plan: Moderate band → bottles ≤ 6% | Gone (Details › Weather keeps the full list) |
| 8 | drink over 1:45 · 19 oz/hr · 30 g carbs/hr · 8% cap from hr 1 | 19 oz/hr · 30 g carbs/hr · 8% cap |
| 9 | 11 gels · ■ plain · ■ caffeine | ■ plain · ■ caffeine |
| 10 | C at 2:30 / C at 4:00 under the tiles | Gone. The C on the gel stays; the minutes are in During the ride. |
| 11 | 1 plain water bottle sipped all ride · mixed bottles carry … · +1 gel for the carbs the plain water doesn't carry | Gone |
| 12 | Carb bottles mix to 5.3%, 5.5% and 5.8%. | Gone (each bottle's tag shows its %) |

**The forecast refresh.** It runs when Results opens and the forecast is more than an hour old: on a Crunch, on going back to the
Plan tab, and when the app comes back to the front. It runs quietly, with no scroll and no toast. It never runs while Adjust is open,
and it tries at most once every 10 minutes (so being offline doesn't make it retry over and over). A planned ride that is open still
gets its "forecast changed" check after the refresh.

**Small changes that go with these:**
- Plain water's row reads "sip all ride · 5 oz/hr". The "(5:30)" went with "drink over".
- "Typical weather · no forecast yet" moved onto the weather card. It used to be in the row cut by #2.
- The Gels per hour tiles' screen-reader label no longer reads out caffeine times.
- The Science page's caffeine text no longer mentions "C at 2:30".
- The "no forecast" weather card loses its "Moderate band" line too, to match #6.

## Extra cuts under the rule (bring any back)

Each was checked against the rule by an independent reviewer. Where a warning carried a "why" tail, the warning and its fix stay and
only the why goes.

**Warnings above the plan:**
- Bottle strength: "Stronger bottles slow fluid delivery, and at 8% the slowdown is clear, which is why 8% is the limit." Kept: the
  warning and "Try it in training first."
- Carbs short (and in Adjust): "…: the bottles are at the 8% most and no hour has room for another gel (15 min apart, none in the last
  30 min)" (also "gels are off and the bottles are at today's 3%"). Kept: "Carbs land at N g/hr, under the M suggested." and the fix
  button.
- Over the suggestion (Adjust): "for a 75° dew point" / "on a Hot day", and "You can keep it." Kept: "Over the suggested 3%.", Back
  to 3% and Keep X%.
- After Keep: the second card ("✓ Keeping X%") under the red Bottle strength card. The red card now says "(you kept it)". Adjust
  still shows "✓ Keeping".
- No gels: the "Carbs land at …" card that repeated the red No gels card. Also, from the red card: "Bottles at the suggested 3% carry
  32 g/hr." Kept: the shortfall and "Cover the rest with chews or real food (~N g), or accept a lighter day."
- Sodium: "The extra drink mix from your adjustment brings the extra sodium." and "so there's nothing to add and the ride lands at N
  mg/hr". Kept: the warning, its numbers and the fix.
- Fluid: "and overheating or dehydration slows emptying further". Kept: the warning and "Lower fluid/hr, or rehearse…".
- Carb type: "One of your products is glucose/maltodextrin only; the gut absorbs that at ~60 g/hr max." Kept: the warning and "Above
  that needs a glucose + fructose product."
- Bottles over with a gel pin: "With your gel count pinned they stay no stronger than the plan's own X%." Kept: the gel-rounding fix.
- No new bottle in the last 30 min: "The plan is made on what you carry: …". Kept: the shortfall.
- Over your carb target: "Your bottles alone carry N g/hr" / "Gels come whole (and your minimum asks for N)". Kept: the numbers and
  "Lower 'Carbs in each' …".
- Sodium unknown: "Sodium reads 'unknown'". Kept: "add it in Settings › Products. No top-up is added until then."

**Cards:**
- Weather, no forecast: "for this ride, so fred planned for 82°F feels-like". Now: "Couldn't get the forecast. Crunch again when
  you're online."
- Bottles · start times:
  - "small fill: no 1 L to swap in" under a part-filled bottle (also in Mix & pack). The Journal and Copy text keep it, and the
    "Do you have any bigger bottles?" card stays.
  - "the last 8 min" on a bottle drunk under 10 minutes.
- Gels per hour: "No gel in the last 30 min, so the last half hour is about 23 g under. That's planned." Details keeps it.
- From your rides: the "Similar = Hard · hot band · 76–96°F · …" definition line. Kept: the fact and the other side ("0 of 2 at 38
  oz/hr or more").
- Gels:
  - "· 9 TOTAL" / "· NONE" in the header.
  - "No gels today: the bottles carry the carbs." is now "No gels today." (likewise "No gels needed.").
- Closet:
  - "· FROM YOUR CLOSET" in the header.
  - "Your closet, Steady tab — change it in Settings."
  - From the rain tip: "; your thresholds don't account for wet".
- Nutrition totals: the "Copies: '…'" preview under Copy. Copy still copies the same text.
- Save bar: "Save it to your Journal to check in after the ride." The buttons stay.
- Troubleshooting: "Everything behind this plan, as text to paste to Claude. Leaves out your medications and stack." The copied text
  says it.
- Adjust:
  - "This ride only · Settings unchanged" under the panel.
  - The panel's own title: "Adjust this ride" is now "Adjust", to match #4.

**Run look:**
- "GELS · 2" is now "GELS".
- "No gels: the flasks cover the carbs." is now "No gels needed."
- "No drink mix picked: the flasks carry water and the gels bring the carbs." is now "No drink mix picked."
- "…its carbs are not counted (unknown); the gels cover them." is now "…not counted (unknown)."

**Kept on purpose:**
- "Left out of the plan until then." It says a picked product is missing from the plan.
- "(2 oz under your grid)" and "at your floor / ceiling". They are numbers and short labels the screen gives nowhere else.
- The fluid's source after the fluid per hour ("· your Moderate · Steady", "· auto", "· hour by hour"), on the ride and the run. It's
  a short label, and the answer sheet's rule A11 (item 39) asks for it. The sweep proposed cutting it; that broke A11, so it stays.
- "Fluid: your override, 24 oz/hr · Use my sweat grid". It has an action.
- "Plain water: sip about 5 oz each hour · finish by 1:30 PM". It's an instruction.
- The run's carry warning, and every "Do you have any bigger bottles?" card.
- The From your rides fact itself.

## Tests

- **Answer sheet:** 1,661 pass, 0 fail.
- **Item 63 kit test (`work-q63/q63.test.js`):** it runs the item-62 build and this one side by side.
  - The golden ride and the Hard 5:30: every removed string shows on the old Results and on none of the new. The header, the button,
    the weather title and line, the bottle rows, the gels key and Mix & pack all match the asks. Details is the same, word for word.
  - Every cut checked over 18 rides (the kit's Results screens, both looks): none shows on the new build. 27 of the 46 cuts
    show on the old build in those rides; the others need rarer plans and are guarded all the same.
  - The forecast refresh: under an hour, no lookup. Over an hour, one lookup from the Plan tab, from the app coming back to the front,
    and from a Crunch. None on another tab, none while Adjust is open, and no scroll.
  - Layout at 320 px with 32 px text and at 390 px, contrast, and no page errors.
- **Older kit tests adapted to the cuts (copies kept as `*.pre-q63.*`):**
  - v3 results, v2 accept;
  - q8, q23, q32, q33, q38, q44, q52, q54, q55, q56, q58, q59;
  - the q13 inventory allow list.

## For Mark

1. "Typical weather · no forecast yet" moved to the weather card. Keep it there?
2. The Adjust panel's title is "Adjust" too. OK?
3. "small fill: no 1 L to swap in" is gone from Results but still in the Journal and the Copy text. Should it go there too?
4. The From your rides card is still a sentence ("On 3 of 4 similar rides …, you marked …"). Keep it?

---

# QA audit · item 62 (fred round · Oct 7)

Run last, after items 59–61. Ground rules: fix bugs, stale wording and alignment only. No new features and no math changes. Design
decisions are listed under **For Mark**. Cache `fred-shell-v87`.

## 1 · Tests

| Suite | Result |
|---|---|
| `npm test`: answer sheet, 63 golden rides (g01–g63), 2,000 random rides, the run scenarios plus 400 random runs | 1,661 pass, 0 fail |
| Full kit (`runall2.sh`): every kit test, regress baselines, layout matrix, contrast | all OK, 0 differ (see `QUEUE_LOG.md` 62) |

Fixed in the app:
- **Pages scrolled sideways at 320 px with 200% text.** q58 and q59 caught it. The cause was this item's own ResizeObserver change: the
  page-wide fit (`fitSoon`) already waits a frame, and wrapping it in `roDefer` added a second one. That observer now calls `fitSoon`
  directly. Its callback only schedules the frame, so it can't cause the loop warning.
- **Mix & pack footnote:** "Bottles mix to 2.3% and 2.5% ." had a space before the period, left over from removing "(today's cap)".
  Found by q23.

Fixed in the kit (no app bug behind these):
- **q58, q54 and q49** read the Why table's Cap row as `Cold · 8%`. They now read the new format, band over %.
- **q23 and q32** looked for the removed wording: "(today's cap: X%)" and "+N gels to stay under 6%".
- **q5** expected the blue logo tile on every screen. On the new run screens the tile is the run look's purple, as designed in item 42.
- **q13 inventory:** its allow list now covers the intentionally removed ride-average phrases.
- **The kit's screen list** now opens the run screens too: Plan (run), How long (run) and Results (run).

The old test copies are kept as `*.pre-q62.*`.

## 2 · Rules check

The answer sheet checks each rule below on the golden ride and on all 2,000 random rides, against the reference calculator
(`tests/reference/calc.js`). Runs are covered by the run scenarios and 400 random runs. **No rule broke.**

| Rule | Where it's checked | Result |
|---|---|---|
| Fluid comes from the sweat grid, hour by hour | A12 / A14, R19 | pass |
| An override changes this ride only | A9 / A10; Adjust pins are plan-only | pass |
| Each bottle is capped by the warmest hour it is drunk 30 min or more in | A2 (R19.2), cap60 kit | pass |
| Gels are rounded per hour, to the nearest | A14 (R19.3), A3c within one gel | pass |
| No hour goes over 90 g | A14, g61 | pass |
| No gel later than 30 min before the finish | A14, G10 golden | pass |
| Sodium is worked out bottle by bottle, at mg/L × liters | A3s (R19.5, A14) | pass |
| Bottle sizes follow TODO 1: never over, at most 4 oz under, part fill last | A15 (R21) | pass |
| No stops, refills or baggies | the words scan across every screen (below); A6 / A15 | pass |

The engine still has the old stop and refill branches. They are internal names, never shown, and since item 58 no ride can reach them.
Removing them would be a code change, not a QA fix, so they stay for now (see For Mark).

## 3 · Stale wording

`work-q62/words.js` opens every screen and sheet, both bike and run. It searches the visible text for old ride-average and stop
wording. It also looks for a space before a period or comma. The scan found **27 hits before the fixes**. What's left after them is
all expected:
- historic Journal text (see For Mark);
- runs' water stops and refills (runs keep aid stations; the no-stops rule is for rides);
- the item 59 pick rule in the My bottles hint;
- a screen-reader-only ", 1 check-in waiting" on the Journal tab.

What was fixed:
- **Removed "held at it" and "held at its 3% cap".** Each bottle in Details now ends "→ capped at X%".
- **Removed "(today's cap: X%)"** from the Mix & pack line on hour-by-hour plans. Each bottle has its own cap now.
- **Removed "fluid ÷ 28.0 oz bottles = 1.29 bottles/hr".** Details now reads "Duration H h; fluid X/hr (Y mL/hr); the bottles hold Z
  (N under)".
- **Removed "by average WBGT … bottles suggested ≤".** The Weather row now reads "Bottle caps by hour: Cold 8% · Mod 6% …" and explains
  the warmest-hour rule.
- **Removed the typed mix grams, "(33.3 g + 3 × 27.6 g)".**
- **Science now says each hour's band is set by that hour's WBGT.** It used to say the average over the ride window.
- **My bottles hint:** now describes the pick rule from TODO 1: the fewest bottles, within 4 oz under and never over, and only the last
  bottle part-filled.
- **Bike roles hint:** "refills included" is now "the bottles along the way included".
- **Water note:** "+N gels for the carbs the plain water doesn't carry".

Before and after, Details at 390 px: `audit/details-before-390-100.png` → `audit/details-after-390-100.png`. Mix & pack:
`audit/mixpack-before-390-100.png` → `audit/mixpack-after-390-100.png`. My bottles: `audit/bottles-before-390-100.png` →
`audit/bottles-after-390-100.png`.

## 4 · Design QA

744 screenshots each before and after the fixes. Every screen and sheet was shot at 375, 390 and 430 px wide, bike and run, with text at
100% and 200%. The layout audit runs on every shot. It checks:
- no sideways scroll;
- nothing clipped or overlapping;
- tap targets of 44 px or more.

**All shots pass, before and after.** The contrast audit (WCAG AA) passes on every screen. Red appears only on warnings and slower times.

Fixed:
- **The Cap row** used to wrap "Cold ·" over "8%". The band is now on one line, the % sits under it, and there is no dot. Screen readers
  still hear "Cold 8%". See `audit/cap-row-390-100.png` (left: before, right: after) and `audit/cap-row-390-200.png` for 200% text,
  where the card view now reads "Cold 8%".

## 5 · Console

- **The "ResizeObserver loop completed with undelivered notifications" warning is gone.** The 7 observers that change layout now run
  their callback on the next animation frame (`roDefer`), so a resize no longer triggers another resize in the same frame. The 8th, the
  page-wide fit, only schedules a frame, so it stays as it was (see Tests). `work-q62/ro.js` reproduced the
  warning before the fix and shows none after it.
- **"Failed to load resource" (ERR_FAILED, ERR_FILE_NOT_FOUND)** shows up only in the test harness, which blocks the network (fonts,
  weather, Firebase). It does not happen in the live app.
- **No page errors on any screen.**

## For Mark

Shortest first.

1. **Fills are always shown in oz now**, for example "fill to 13 oz". Should half-bottle wording come back?
2. **With 200% text, the how-long button takes a row of its own** instead of sharing one with the sport button. Is that OK?
3. **The top card's strength is the average over the bottles' real fill.** Should it show the range instead (say, "3.5–8%")?
4. **Old Journal entries still say "baggie B1".** They are saved history. Should they be reworded on display, or left as they are?
5. **On some rides the gel count moves by one** now that each hour's cap uses the fluid really drunk. For example, the 240 min fixture
   went from 8 gels to 6. Everything stays within one gel of the target.
6. **With no sodium top-up, sodium comes up short** by the share of fluid the bottles land under (judgment J20, up to 4 oz). Should a
   top-up be suggested, or is this fine?
7. **The engine's old stop and refill branches are unreachable.** Should they be deleted? That would be a code clean-up with its own
   test pass.
