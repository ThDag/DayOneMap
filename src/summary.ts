import type { LocationEntry } from "./data";
import { weekHours } from "./week";

function span(entry: LocationEntry) {
  const start = new Date(entry.arrivalDate).getTime();
  const end = new Date(entry.departureDate).getTime();
  return { start, end, ms: end - start };
}

/** Time covered by the stops, counting overlapping stops only once. */
function coveredMs(entries: LocationEntry[]) {
  const spans = entries
    .map(span)
    .filter(({ ms }) => ms > 0)
    .sort((a, b) => a.start - b.start);
  let covered = 0;
  let reached = -Infinity;
  for (const { start, end } of spans) {
    if (end <= reached) continue;
    covered += end - Math.max(start, reached);
    reached = end;
  }
  return covered;
}

function peak(amounts: number[]) {
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  if (total === 0) return null;
  const index = amounts.indexOf(Math.max(...amounts));
  return { index, share: amounts[index] / total };
}

function placeName(entry: LocationEntry) {
  return entry.location.placeName || "Unnamed place";
}

/**
 * Groups stops by distance, because one location often appears under several names.
 * The longest stays come first, so they become the centres of the groups.
 */
function groupIntoPlaces(entries: LocationEntry[], radius: number) {
  const metresPerDegree = 111320;
  const groups: { lat: number; lng: number; scale: number; stops: LocationEntry[] }[] = [];
  const longestFirst = [...entries].sort((a, b) => span(b).ms - span(a).ms);
  for (const entry of longestFirst) {
    const { latitude: lat, longitude: lng } = entry.location;
    const group = groups.find(
      (g) =>
        Math.hypot((lat - g.lat) * metresPerDegree, (lng - g.lng) * g.scale) <=
        radius,
    );
    if (group) group.stops.push(entry);
    else {
      const scale = metresPerDegree * Math.cos((lat * Math.PI) / 180);
      groups.push({ lat, lng, scale, stops: [entry] });
    }
  }
  return groups;
}

/** The name a group of stops spent the most time under. */
function mainName(stops: LocationEntry[]) {
  const times = new Map<string, number>();
  for (const stop of stops) {
    const name = placeName(stop);
    times.set(name, (times.get(name) ?? 0) + Math.max(0, span(stop).ms));
  }
  return [...times].reduce((best, next) => (next[1] > best[1] ? next : best))[0];
}

/** Facts about a group of stops, which must be sorted by arrival. */
export function clusterSummary(entries: LocationEntry[], radius: number) {
  const places = groupIntoPlaces(entries, radius);

  let topPlace = { name: "", ms: 0 };
  for (const { stops } of places) {
    const ms = coveredMs(stops);
    if (ms > topPlace.ms) topPlace = { name: mainName(stops), ms };
  }

  const durations = entries
    .map((entry) => span(entry).ms)
    .filter((ms) => ms > 0)
    .sort((a, b) => a - b);
  const lastLeft = entries.reduce((latest, entry) =>
    span(entry).end > span(latest).end ? entry : latest,
  );

  const { hours, days } = weekHours(entries);
  const hourTotals = hours[0].map((_, hour) =>
    hours.reduce((sum, day) => sum + day[hour], 0),
  );

  return {
    totalMs: coveredMs(entries),
    first: entries[0],
    lastLeft,
    days,
    places: places.length,
    topPlace: topPlace.ms > 0 ? topPlace : null,
    typicalMs: durations[Math.floor(durations.length / 2)] ?? 0,
    busiestDay: peak(hours.map((day) => day.reduce((a, b) => a + b, 0))),
    busiestHour: peak(hourTotals),
  };
}
