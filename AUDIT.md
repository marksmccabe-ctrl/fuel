# QA audit · item 62 (fred round · Oct 7)

Run last, after items 59–61. Ground rules: fix bugs, stale wording and alignment only. No new features and no math changes. Design
decisions are listed under **For Mark**. Cache `fred-shell-v87`.

## 1 · Tests

| Suite | Result |
|---|---|
| `npm test`: answer sheet, 63 golden rides (g01–g63), 2,000 random rides, the run scenarios plus 400 random runs | 1,661 pass, 0 fail |
| Full kit (`runall2.sh`): every kit test, regress baselines, layout matrix, contrast | all OK, 0 differ (see `QUEUE_LOG.md` 62) |

Fixed along the way, all in the kit (no app bug behind them):
- **q58, q54 and q49 kit tests** read the Why table's Cap row as `Cold · 8%`. They now read the new format, band over %. The old copies
  are kept as `*.pre-q62.js`.
- **The kit's screen list** now opens the run screens too: Plan (run), How long (run) and Results (run).

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
wording. The scan found **27 hits before the fixes and 1 after**. The one left is historic Journal text (see For Mark).

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

- **The "ResizeObserver loop completed with undelivered notifications" warning is gone.** All 8 observers now run their callback on the
  next animation frame (`roDefer`), so a resize no longer triggers another resize in the same frame. `work-q62/ro.js` reproduced the
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
