import type { LocationEntry } from "./data";

export type HeatCountBy = "time" | "visits";

export interface HeatSettings {
  /** How far each stop spreads, in screen pixels. */
  radius: number;
  /** 0 is a hard-edged disc, 1 fades all the way from the centre to the edge. */
  softness: number;
  countBy: HeatCountBy;
  /** Hours or visits needed to reach the hottest colour. */
  fullAt: number;
  /** 0 keeps colour proportional to the amount, 1 strongly lifts small amounts. */
  lowEndBoost: number;
}

export const DEFAULT_HEAT_SETTINGS: HeatSettings = {
  radius: 18,
  softness: 0.7,
  countBy: "time",
  fullAt: 300,
  lowEndBoost: 0,
};

// Heat builds on a log scale: this is the amount where it starts to climb noticeably.
const LOG_UNIT: Record<HeatCountBy, number> = { time: 1 / 12, visits: 1 };

// One hue, getting lighter as the amount rises, so it reads as "more" on the dark map.
export const HEAT_STOPS: [number, number, number][] = [
  [122, 44, 0],
  [217, 72, 15],
  [255, 146, 43],
  [255, 216, 168],
  [255, 244, 230],
];

export function rampColor(
  t: number,
  stops = HEAT_STOPS,
): [number, number, number] {
  const position = Math.min(1, Math.max(0, t)) * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(position));
  const mix = position - index;
  const [a, b] = [stops[index], stops[index + 1]];
  return [
    a[0] + (b[0] - a[0]) * mix,
    a[1] + (b[1] - a[1]) * mix,
    a[2] + (b[2] - a[2]) * mix,
  ];
}

function exponent(lowEndBoost: number) {
  return 1 - 0.85 * lowEndBoost;
}

/** Colour for a position on the colour scale, from 0 to 1. */
export function heatColor(fraction: number, lowEndBoost: number) {
  return rampColor(Math.min(1, fraction) ** exponent(lowEndBoost));
}

/**
 * Position of an amount on the colour scale, from 0 to 1. A log scale keeps 1 and 50
 * clearly apart while still reaching thousands, which a linear scale can't do.
 */
export function heatFraction(
  amount: number,
  { countBy, fullAt }: Pick<HeatSettings, "countBy" | "fullAt">,
) {
  const unit = LOG_UNIT[countBy];
  return Math.min(1, Math.log1p(amount / unit) / Math.log1p(fullAt / unit));
}

/** The amount that sits at a position on the colour scale, for labelling the legend. */
export function heatAmountAt(
  fraction: number,
  { countBy, fullAt }: Pick<HeatSettings, "countBy" | "fullAt">,
) {
  const unit = LOG_UNIT[countBy];
  return unit * ((1 + fullAt / unit) ** fraction - 1);
}

export const HEAT_LOOKUP_STEPS = 1024;

/** RGBA lookup table indexed by position on the colour scale. */
export function heatLookup(lowEndBoost: number) {
  const table = new Uint8ClampedArray(HEAT_LOOKUP_STEPS * 4);
  for (let i = 0; i < HEAT_LOOKUP_STEPS; i += 1) {
    const t = (i / (HEAT_LOOKUP_STEPS - 1)) ** exponent(lowEndBoost);
    const [r, g, b] = rampColor(t);
    table.set(
      [r, g, b, 255 * Math.min(1, t / 0.02) * (0.45 + 0.5 * t)],
      i * 4,
    );
  }
  return table;
}

/** CSS gradient that matches the current colour calibration, for the legend. */
export function heatLegend(lowEndBoost: number) {
  const steps = Array.from({ length: 9 }, (_, i) => {
    const [r, g, b] = heatColor(i / 8, lowEndBoost);
    return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
  });
  return `linear-gradient(to right, ${steps.join(", ")})`;
}

/** How much one stop adds to the heat. Very short stops still count for a minute. */
export function heatWeight(entry: LocationEntry, countBy: HeatCountBy) {
  if (countBy === "visits") return 1;
  const ms =
    new Date(entry.departureDate).getTime() -
    new Date(entry.arrivalDate).getTime();
  return Number.isNaN(ms) ? 1 / 60 : Math.max(1 / 60, ms / 3600000);
}
