import L from "leaflet";
import type { LocationEntry } from "./data";
import { HEAT_STOPS, rampColor } from "./heatmap";

export const DEFAULT_PLACE_RADIUS = 40;
export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// The heatmap's colours, starting from the panel's surface colour (the empty cells),
// so tiny amounts look close to zero.
const WEEK_STOPS: [number, number, number][] = [[26, 29, 33], ...HEAT_STOPS];

const MINUTE = 60000;
const HOUR = 3600000;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    };
    try {
      formatter = new Intl.DateTimeFormat("en-US", { ...options, timeZone });
    } catch {
      // Intl throws on an unrecognised zone name; use browser time, as format.ts does.
      formatter = new Intl.DateTimeFormat("en-US", options);
    }
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

function localSlot(time: number, formatter: Intl.DateTimeFormat) {
  let day = 0;
  let hour = 0;
  let minute = 0;
  for (const { type, value } of formatter.formatToParts(time)) {
    if (type === "weekday") day = WEEK_DAYS.indexOf(value);
    else if (type === "hour") hour = Number(value);
    else if (type === "minute") minute = Number(value);
  }
  return { day, hour, minute };
}

/** Every stop within `radius` metres of the given stop, which counts as one place. */
export function stopsNear(
  entries: LocationEntry[],
  center: LocationEntry,
  radius: number,
) {
  const origin = L.latLng(center.location.latitude, center.location.longitude);
  return entries.filter(
    ({ location }) =>
      origin.distanceTo([location.latitude, location.longitude]) <= radius,
  );
}

/** Hours spent per [day][hour] of the week, using each stop's own local time. */
export function weekHours(entries: LocationEntry[]) {
  const hours = WEEK_DAYS.map(() => new Array<number>(24).fill(0));
  let total = 0;

  for (const entry of entries) {
    const end = new Date(entry.departureDate).getTime();
    const formatter = formatterFor(entry.location.timeZoneName);
    let time = new Date(entry.arrivalDate).getTime();
    // A comparison with an invalid date is false, so bad records add nothing.
    while (time < end) {
      const { day, hour, minute } = localSlot(time, formatter);
      const next = Math.min(end, time + (60 - minute) * MINUTE - (time % MINUTE));
      hours[day][hour] += (next - time) / HOUR;
      total += (next - time) / HOUR;
      time = next;
    }
  }

  return { hours, total, max: Math.max(...hours.flat()) };
}

export function formatHours(amount: number) {
  if (amount >= 10) return Math.round(amount).toLocaleString();
  return amount < 0.05 ? "<.1" : amount.toFixed(1);
}

function linear(channel: number) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/**
 * Cell colours relative to the place's busiest hour. The text flips to whichever of
 * dark or white reads better.
 */
export function weekCellColors(amount: number, max: number) {
  const [r, g, b] = rampColor(amount / max, WEEK_STOPS);
  const luminance =
    0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
  return {
    backgroundColor: `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`,
    color: luminance > 0.19 ? "#111316" : "#fff",
  };
}
