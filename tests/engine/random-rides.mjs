// 2,000 random athletes and rides per run (fast-check, fixed seed so a failure can be replayed). The shapes are the fixture shapes
// (tests/fixtures/athletes.json): label values, sweat, bikes, bottles, and every ride setting a rider can choose. The ranges stay inside
// what the app lets a rider enter (whole cages 1–5, water ≤ 2 and never the last cage, 5-minute steps, …), so a failure is about the
// rules, not about impossible input. Missing label values are covered by the golden rides, not here.
import fc from 'fast-check';

export const DEFAULT_SEED = 20261003;

const step = (lo, hi, by) => fc.integer({ min: Math.round(lo / by), max: Math.round(hi / by) }).map(v => Math.round(v * by * 1000) / 1000);
const clock = fc.tuple(fc.integer({ min: 5, max: 14 }), fc.constantFrom(0, 15, 30, 45)).map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);

const products = fc.record({
  gel: fc.record({ carbsG: fc.integer({ min: 15, max: 45 }), sodiumMg: fc.integer({ min: 0, max: 200 }), kcal: fc.integer({ min: 60, max: 180 }) }),
  gel2: fc.option(fc.record({ carbsG: fc.integer({ min: 15, max: 45 }), sodiumMg: fc.integer({ min: 0, max: 200 }) }), { nil: null, freq: 3 }),
  caf: fc.record({ carbsG: fc.integer({ min: 15, max: 45 }), sodiumMg: fc.integer({ min: 0, max: 200 }), caffeineMg: fc.constantFrom(25, 40, 50, 75, 100, 150) }),
  mix: fc.record({ servingG: fc.integer({ min: 20, max: 95 }), carbShare: step(0.6, 1, 0.01), sodiumMg: fc.integer({ min: 0, max: 1200 }), scoopG: fc.option(step(8, 50, 0.5), { nil: null }) }),
  carb: fc.record({ servingG: fc.integer({ min: 20, max: 95 }), carbShare: step(0.8, 1, 0.01) }),
  capMg: fc.integer({ min: 100, max: 400 }),
  stickMg: fc.integer({ min: 150, max: 1000 }),
});

const athleteArb = fc.record({
  carbs: fc.tuple(fc.integer({ min: 30, max: 80 }), fc.integer({ min: 40, max: 110 }), fc.integer({ min: 50, max: 120 })),
  sweat: fc.integer({ min: 12, max: 60 }),
  naL: fc.integer({ min: 300, max: 2000 }),
  cages: fc.integer({ min: 1, max: 5 }),
  bigCages: fc.option(fc.integer({ min: 0, max: 4 }), { nil: null, freq: 4 }),
  plan: fc.constantFrom(20, 21, 24, 26, 28, 28, 28, 33.8),
  ownBig: fc.integer({ min: 0, max: 3 }),
  ownOther: fc.option(fc.record({ oz: fc.constantFrom(20, 21, 24, 26, 25.36), n: fc.integer({ min: 1, max: 4 }) }), { nil: null }),
  p: products,
});

const rideArb = fc.record({
  effort: fc.constantFrom('recovery', 'steady', 'steady', 'hard'),
  dur: fc.oneof({ weight: 5, arbitrary: step(30, 480, 5) }, { weight: 1, arbitrary: fc.integer({ min: 20, max: 480 }) }),
  distance: fc.option(fc.record({ miles: fc.integer({ min: 10, max: 140 }), mph: step(12, 24, 0.5) }), { nil: null, freq: 6 }),
  temp: fc.integer({ min: 25, max: 105 }),
  wbgt: fc.option(fc.integer({ min: 35, max: 92 }), { nil: null, freq: 2 }),
  water: fc.integer({ min: 0, max: 2 }), refill: fc.boolean(),
  mine: fc.option(fc.record({ c: fc.integer({ min: 0, max: 3 }), g: step(5, 120, 5), e: fc.integer({ min: 0, max: 2 }) }), { nil: null, freq: 4 }),
  gelsOn: fc.oneof({ weight: 9, arbitrary: fc.constant(true) }, { weight: 1, arbitrary: fc.constant(false) }),
  useGel2: fc.boolean(),
  rounding: fc.constantFrom('nearest', 'nearest', 'up', 'down'),
  minPerHr: fc.constantFrom(0, 1, 1, 2),
  firstMin: fc.constantFrom(10, 15, 20, 20, 30, 45),
  caf: fc.record({ mode: fc.constantFrom('off', 'off', 'every', 'long'), longHrs: fc.constantFrom(2, 3, 4), maxMg: fc.constantFrom(100, 200, 300, 400), noneAfter: clock }),
  start: clock,
  blend: fc.boolean(),
  topUp: fc.constantFrom('cap', 'stick', 'salt', 'salt', 'none'),
  limit: fc.option(step(3, 8, 0.5), { nil: null, freq: 5 }),
  fluidOver: fc.option(fc.integer({ min: 10, max: 60 }), { nil: null, freq: 9 }),
  heatLower: fc.boolean(),
  stops: fc.option(fc.array(fc.record({ at: step(0.1, 0.95, 0.05), supply: fc.constantFrom('baggies', 'baggies', 'baggies', 'water', 'aid') }), { minLength: 1, maxLength: 3 }), { nil: null, freq: 3 }),
  pocket: fc.boolean(),
});

// one random case → { athletes: {R: athlete}, input: ride } in the fixture shape
function build([a, r]) {
  const P = a.p, bikes = [{ id: 'bike', name: 'Bike', cages: a.cages }];
  if (a.bigCages != null && a.bigCages < a.cages) bikes[0].bigCages = a.bigCages;
  const owned = [];
  if (a.ownBig) owned.push({ oz: 33.814, count: a.ownBig, name: '1 L bottle' });
  if (a.ownOther) owned.push({ oz: a.ownOther.oz, count: a.ownOther.n, name: `${a.ownOther.oz} oz bottle` });
  const athlete = {
    name: 'Random athlete',
    carbsGPerHr: { recovery: a.carbs[0], steady: a.carbs[1], hard: a.carbs[2] },
    sweatOzPerHr: a.sweat, sweatSodiumMgPerL: a.naL, bikes, bottlesOwned: owned, planBottleOz: a.plan,
    products: {
      gels: [
        { id: 'r-gel', name: 'Random Gel', carbsG: P.gel.carbsG, sodiumMg: P.gel.sodiumMg, caffeineMg: 0, kcal: P.gel.kcal },
        ...(P.gel2 ? [{ id: 'r-gel2', name: 'Random Gel 2', carbsG: P.gel2.carbsG, sodiumMg: P.gel2.sodiumMg, caffeineMg: 0, kcal: P.gel2.carbsG * 4 }] : []),
        { id: 'r-caf', name: 'Random Caffeine Gel', carbsG: P.caf.carbsG, sodiumMg: P.caf.sodiumMg, caffeineMg: P.caf.caffeineMg, kcal: P.caf.carbsG * 4 },
      ],
      drinkMixes: [
        { id: 'r-mix', name: 'Random Drink Mix', servingG: P.mix.servingG, carbsG: Math.round(P.mix.servingG * P.mix.carbShare * 10) / 10, sodiumMg: P.mix.sodiumMg, kcal: Math.round(P.mix.servingG * P.mix.carbShare * 4), ...(P.mix.scoopG ? { scoopG: P.mix.scoopG } : {}) },
        { id: 'r-carb', name: 'Random Carb-Only Powder', servingG: P.carb.servingG, carbsG: Math.round(P.carb.servingG * P.carb.carbShare * 10) / 10, sodiumMg: 0, kcal: Math.round(P.carb.servingG * P.carb.carbShare * 4) },
      ],
      electrolytes: [
        { id: 'r-cap', name: 'Random Capsule', unit: 'capsule', sodiumMg: P.capMg, swallow: true },
        { id: 'r-stick', name: 'Random Stick', unit: 'stick', sodiumMg: P.stickMg, swallow: false },
        { id: 'r-salt', name: 'Table salt', unit: 'g', sodiumMg: 393.4, swallow: false },
      ],
    },
  };
  const durMin = r.distance ? Math.max(5, Math.round(r.distance.miles / r.distance.mph * 60)) : r.dur;
  const stops = (r.stops || []).map(s => r.distance ? { atMiles: Math.max(1, Math.round(s.at * r.distance.miles)), supply: s.supply } : { atMin: Math.max(5, Math.round(s.at * durMin / 5) * 5), supply: s.supply })
    .filter((s, k, L) => L.findIndex(x => (x.atMin ?? x.atMiles) === (s.atMin ?? s.atMiles)) === k);
  const mine = r.mine ? { carb: { n: r.mine.c, g: r.mine.g }, elec: { n: r.mine.e } } : null;
  const input = {
    athlete: 'R', effort: r.effort,
    ...(r.distance ? { distance: r.distance } : { durationMin: r.dur }),
    weather: { feelsLikeF: r.temp, wbgtF: r.wbgt },
    bike: 'bike',
    water: { n: Math.min(r.water, 2, Math.max(0, a.cages - 1)), refill: r.refill },
    myBottles: mine,
    gels: { on: r.gelsOn, gel: 'r-gel', second: r.useGel2 && P.gel2 ? 'r-gel2' : null, rounding: r.rounding, minPerHr: r.minPerHr, firstMin: r.firstMin },
    caffeine: { mode: r.caf.mode, longHrs: r.caf.longHrs, maxMg: r.caf.maxMg, noneAfter: r.caf.noneAfter, gel: 'r-caf' },
    startTime: r.start, drinkMix: 'r-mix', blendPartner: r.blend ? 'r-carb' : null,
    topUp: { cap: 'r-cap', stick: 'r-stick', salt: 'r-salt', none: 'none' }[r.topUp],
    strengthLimitPct: r.limit, fluidOverrideOzHr: r.fluidOver, heatLowerCarbs: r.heatLower,
    stops, pocket: r.pocket, productPatches: [],
  };
  athlete.rideDefaults = {}; // every field is set on the ride
  return { athletes: { R: athlete }, input };
}

export function randomRides(n, seed = DEFAULT_SEED) {
  return fc.sample(fc.tuple(athleteArb, rideArb), { numRuns: n, seed }).map(build);
}

// A short plain-words name for a random case, so a failure says which ride it was.
export function describe(k, athlete, ride, durMin) {
  const hm = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const bits = [`${ride.effort} ${hm(durMin)}`, ride.weather.wbgtF != null ? `WBGT ${ride.weather.wbgtF}°F` : `${ride.weather.feelsLikeF}°F`,
    `${athlete.bikes[0].cages} cage(s)`, `${athlete.sweatOzPerHr} oz/hr`, `${athlete.sweatSodiumMgPerL} mg/L`];
  if (ride.water.n) bits.push(`${ride.water.n} water${ride.water.refill ? ' (refill)' : ''}`);
  if (ride.myBottles) bits.push(`My bottles ${ride.myBottles.carb.n} carb × ${ride.myBottles.carb.g} g + ${ride.myBottles.elec.n} elec`);
  if (!ride.gels.on) bits.push('no gels');
  if (ride.stops.length) bits.push(`${ride.stops.length} stop(s)`);
  if (ride.distance) bits.push(`${ride.distance.miles} mi @ ${ride.distance.mph} mph`);
  if (ride.caffeine.mode !== 'off') bits.push(`caffeine ${ride.caffeine.mode}`);
  bits.push(`top-up ${ride.topUp}`);
  return `random #${k} (${bits.join(', ')})`;
}
