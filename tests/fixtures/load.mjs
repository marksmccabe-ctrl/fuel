// Loads the test athletes and fills a golden or random ride with the athlete's ride defaults. Shared by the reference calculator's build
// script and the app harness, so both read the same ride. Plain data only: nothing here knows how the app works.
import { readFileSync } from 'node:fs';

const here = new URL('.', import.meta.url);

export function loadAthletes() {
  return JSON.parse(readFileSync(new URL('athletes.json', here), 'utf8')).athletes;
}

const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
function merge(base, over) {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isObj(v) && isObj(base[k]) ? merge(base[k], v) : v;
  return out;
}

// The athlete as this ride sees it: an inline bike joins the bike list, owned bottles can be replaced, and product patches (the
// missing-value rides) change a copy of one product.
export function athleteFor(athletes, ride) {
  const a = JSON.parse(JSON.stringify(athletes[ride.athlete]));
  if (isObj(ride.bike) && !a.bikes.some(b => b.id === ride.bike.id)) a.bikes.push(ride.bike);
  if (Array.isArray(ride.ownedBottles)) a.bottlesOwned = ride.ownedBottles;
  if (isObj(ride.sweatGrid)) a.sweatGrid = ride.sweatGrid; // item 39: the athlete's sweat grid for this ride
  if (typeof ride.planBottleOz === 'number' && ride.planBottleOz > 0) a.planBottleOz = ride.planBottleOz; // the ride's bottle size (Plan › Bottles today)
  for (const p of ride.productPatches || []) {
    for (const list of Object.values(a.products)) {
      const x = list.find(y => y.id === p.id);
      if (x) for (const [k, v] of Object.entries(p)) if (k !== 'id') { if (v === null) delete x[k]; else x[k] = v; }
    }
  }
  return a;
}

// The ride with every field filled from the athlete's defaults (a field the ride gives wins; nested objects merge).
export function fullRide(athletes, ride) {
  const d = athletes[ride.athlete].rideDefaults;
  const r = merge(d, ride);
  r.bikeId = isObj(r.bike) ? r.bike.id : r.bike;
  return r;
}

export function product(athlete, id) {
  if (!id) return null;
  for (const list of Object.values(athlete.products)) { const x = list.find(y => y.id === id); if (x) return x; }
  return null;
}
