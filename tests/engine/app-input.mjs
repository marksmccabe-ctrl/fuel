// Turns a test athlete + ride (tests/fixtures, plain data) into what the app's engine reads: its product library, the settings it reads at
// call time, and the input object readInputs() would build. This is plumbing for the harness only: it knows the app's field names, never
// its math. The expected answers come from tests/reference/calc.js.
const OZ_ML = 29.5735;
const EFFORT = { recovery: 'recovery', steady: 'z2', hard: 'hard' };
const STD_OZ = [28, 33.8]; // the app's US bottle list; any other plan size is added as a saved bottle

const has = v => v !== undefined && v !== null && v !== '';

export function appLibrary(athlete) {
  const P = athlete.products;
  const gels = P.gels.map(g => {
    const x = { id: g.id, name: g.name, form: 'gel' };
    if (has(g.carbsG)) x.carbs = g.carbsG;
    if (has(g.sodiumMg)) x.sodium = g.sodiumMg;
    if (g.caffeineMg > 0) x.caffeine = g.caffeineMg;
    if (has(g.kcal)) x.cal = g.kcal;
    return x;
  });
  const powders = P.drinkMixes.map(p => {
    const x = { id: p.id, name: p.name, form: 'drink-mix', serving: p.servingG, scoopG: has(p.scoopG) ? p.scoopG : 0 };
    if (has(p.carbsG)) x.carbs = p.carbsG;
    if (has(p.sodiumMg)) x.sodium = p.sodiumMg;
    if (has(p.kcal)) x.cal = p.kcal;
    return x;
  });
  const salts = P.electrolytes.map(s => {
    const x = { id: s.id, name: s.name, unit: s.unit, how: s.swallow ? 'swallow' : 'bottle' };
    if (s.whole) x.whole = true; // item 47: whole capfuls in the bottle (S200)
    if (has(s.sodiumMg)) x.na = s.sodiumMg;
    return x;
  });
  const oz = athlete.planBottleOz;
  const bottles = STD_OZ.some(z => Math.abs(z - oz) < 0.05) ? [] : [{ id: 'plan-bottle', name: `${oz} oz bottle`, oz }];
  return { gels, powders, salts, bottles, offered: ['pf30chew', 'pf60bar', 'pilgel30', 'pilelec', 'n2c30p', 'n2s200'] };
}

const capOr = (ride, k, d) => (ride.caps && has(ride.caps[k]) ? ride.caps[k] : d);
export function appSettings(athlete, ride) {
  return {
    units: 'us', rounding: ride.gels.rounding,
    // item 56: Settings › Concentration caps (Cold up to 12, Moderate up to 8, Hot up to 6); the band table's when the ride sets none
    hotAbove: 85, hotPct: capOr(ride, 'hot', 3), coldBelow: 65, coldPct: capOr(ride, 'cold', 8), modPct: capOr(ride, 'mod', 6), wbgtHot: 80, wbgtCold: 60,
    bikes: athlete.bikes.map(b => ({ id: b.id, name: b.name, cages: b.cages, roles: Array(b.cages).fill('carb'), ...(Number.isInteger(b.bigCages) ? { bigCages: b.bigCages } : {}) })),
    bikeId: ride.bikeId,
    myBottles: athlete.bottlesOwned.map(o => ({ oz: o.oz, n: o.count })),
    intensity: EFFORT[ride.effort], intCarbs: { recovery: athlete.carbsGPerHr.recovery, z2: athlete.carbsGPerHr.steady, hard: athlete.carbsGPerHr.hard },
    caf: { mode: ride.caffeine.mode, longHrs: ride.caffeine.longHrs, maxMg: ride.caffeine.maxMg, noneAfter: ride.caffeine.noneAfter, gelId: ride.caffeine.gel || '' },
  };
}

export function durationOf(ride) {
  return ride.distance ? Math.max(5, Math.round(ride.distance.miles / ride.distance.mph * 60)) : ride.durationMin;
}

function hourlyInput(ride) {
  const Hh = ride.weather && ride.weather.hourly, dur = durationOf(ride);
  if (!Hh || !Array.isArray(Hh.hoursF)) return { wxHours: null, wxEnds: null };
  const W = Array.isArray(Hh.hoursW) ? Hh.hoursW : []; // item 56: each hour's WBGT when the forecast gives it
  return { wxHours: Hh.hoursF.map((f, k) => ({ frac: Math.min(60, dur - 60 * k) / 60, f, w: has(W[k]) ? W[k] : null, air: null, dew: null })), wxEnds: { s: has(Hh.startF) ? Hh.startF : null, e: has(Hh.endF) ? Hh.endF : null } };
}
export function appInput(athlete, ride) {
  const bike = athlete.bikes.find(b => b.id === ride.bikeId) || athlete.bikes[0] || null;
  const cages = bike ? bike.cages : 2;
  const fluid = athlete.sweatOzPerHr, conc = athlete.sweatSodiumMgPerL, oz = athlete.planBottleOz;
  const wn = Math.min(ride.water.n || 0, 2, Math.max(0, cages - 1));
  let mine = null;
  if (ride.myBottles) { // the Bottles card fits the counts to the cages left after the water, electrolyte bottles first
    let c = Math.max(0, Math.round(ride.myBottles.carb.n)), e = Math.max(0, Math.round(ride.myBottles.elec.n));
    const room = Math.max(1, cages - wn);
    while (c + e > room) { if (e > 0) e--; else c--; }
    if (c + e < 1) c = 1;
    mine = { carb: { n: c, g: ride.myBottles.carb.g }, elec: { n: e } };
  }
  const dist = !!ride.distance;
  return {
    durMin: durationOf(ride),
    tempF: has(ride.weather.feelsLikeF) ? ride.weather.feelsLikeF : 65,
    wbgtF: has(ride.weather.wbgtF) ? ride.weather.wbgtF : null,
    concOverride: has(ride.strengthLimitPct) ? ride.strengthLimitPct : null,
    heatAdj: !!ride.heatLowerCarbs,
    fluidOverride: has(ride.fluidOverrideOzHr) ? ride.fluidOverrideOzHr : null,
    fluidMin: ride.fluidLimits && has(ride.fluidLimits.minOzPerHr) ? ride.fluidLimits.minOzPerHr : null, // item 38: Settings › Fluid limits
    fluidMax: ride.fluidLimits && has(ride.fluidLimits.maxOzPerHr) ? ride.fluidLimits.maxOzPerHr : null,
    sweat: athlete.sweatGrid ? JSON.parse(JSON.stringify(athlete.sweatGrid)) : null, // item 39: the grid; null → the app migrates the single rate
    fluidOzHr: fluid, sodiumConc: conc, tSodium: Math.round(conc * fluid * OZ_ML / 1000),
    tCarbs: athlete.carbsGPerHr[ride.effort], intensity: EFFORT[ride.effort],
    oz, bph: fluid / oz,
    gelId: ride.gels.gel, gelAltId: ride.gels.second || '', powderId: ride.drinkMix, powderAltId: ride.blendPartner || '', saltId: ride.topUp || 'none',
    firstGel: ride.gels.firstMin, minGels: ride.gels.minPerHr, noGels: !ride.gels.on,
    caf: { mode: ride.caffeine.mode, longHrs: ride.caffeine.longHrs, maxMg: ride.caffeine.maxMg, noneAfter: ride.caffeine.noneAfter, gelId: ride.caffeine.gel || '' },
    cafToday: null, startTime: ride.startTime,
    // item 52: Plan › Advanced: "Caffeine from" (minutes into the ride; '' = Auto) and "Same recipe in every bottle"
    cafFrom: ride.caffeine && has(ride.caffeine.fromMin) ? ride.caffeine.fromMin : '', sameRecipe: !!ride.sameRecipe,
    bikeId: ride.bikeId, roles: null, pins: null, bottleToday: null,
    route: {
      mode: dist ? 'distance' : 'time', miles: dist ? ride.distance.miles : 0, mph: dist ? ride.distance.mph : 0, pocket: !!ride.pocket,
      stops: (ride.stops || []).map(s => ({ at: dist ? s.atMiles : s.atMin, supply: s.supply || 'baggies' })), keep: [],
    },
    water: wn > 0 ? { n: wn, refill: !!ride.water.refill } : null,
    mine,
    bot: { mode: mine ? 'mine' : 'fred', water: wn, refill: !!ride.water.refill, mine },
    wxDate: '2026-10-03',
    // fields readInputs() also returns that only the screen reads (notes, Journal): left empty, as on a fresh install
    rideName: '', meds: [], medsOther: '', wxLoc: '', wbgtSource: '', wxMinF: null, wxMaxF: null, wxRain: null, wxGeo: null,
    // item 49: the forecast's hours, as fetchWeather hands them over (each ride hour's feels-like; the last hour pro-rated), and the start and finish
    ...hourlyInput(ride),
    defGelId: ride.gels.gel, defPowderId: ride.drinkMix, defSaltId: ride.topUp || 'none', cafGelToday: '',
  };
}

export function appCase(athlete, ride) {
  return { lib: appLibrary(athlete), settings: appSettings(athlete, ride), i: appInput(athlete, ride) };
}
