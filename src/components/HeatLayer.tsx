import { useEffect, useMemo, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { LocationEntry } from "../data";
import {
  HEAT_LOOKUP_STEPS,
  heatFraction,
  heatLookup,
  heatWeight,
  type HeatSettings,
} from "../heatmap";

function buildKernel(radius: number, softness: number) {
  const size = radius * 2 + 1;
  const kernel = new Float32Array(size * size);
  const fade = Math.max(softness, 0.02);
  for (let y = -radius; y <= radius; y += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      const edge = 1 - Math.hypot(x, y) / (radius + 0.5);
      if (edge <= 0) continue;
      const t = Math.min(1, edge / fade);
      kernel[(y + radius) * size + x + radius] = t * t * (3 - 2 * t);
    }
  }
  return kernel;
}

function drawHeat(
  canvas: HTMLCanvasElement,
  map: L.Map,
  entries: LocationEntry[],
  weights: number[],
  settings: HeatSettings,
) {
  const { x: width, y: height } = map.getSize();
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  L.DomUtil.setPosition(canvas, map.containerPointToLayerPoint([0, 0]));
  const ctx = canvas.getContext("2d");
  if (!ctx || width === 0 || height === 0) return;

  // Amounts add up in a float grid, so the colours mean real hours or visits at any zoom.
  const { radius, softness, lowEndBoost } = settings;
  const kernel = buildKernel(radius, softness);
  const size = radius * 2 + 1;
  const grid = new Float32Array(width * height);
  entries.forEach((entry, index) => {
    const point = map.latLngToContainerPoint([
      entry.location.latitude,
      entry.location.longitude,
    ]);
    const cx = Math.round(point.x);
    const cy = Math.round(point.y);
    const weight = weights[index];
    const top = Math.max(0, cy - radius);
    const bottom = Math.min(height - 1, cy + radius);
    const left = Math.max(0, cx - radius);
    const right = Math.min(width - 1, cx + radius);
    for (let y = top; y <= bottom; y += 1) {
      const row = (y - cy + radius) * size + radius - cx;
      const gridRow = y * width;
      for (let x = left; x <= right; x += 1) {
        const k = kernel[row + x];
        if (k > 0) grid[gridRow + x] += k * weight;
      }
    }
  });

  const lookup = heatLookup(lowEndBoost);
  const image = ctx.createImageData(width, height);
  for (let i = 0; i < grid.length; i += 1) {
    const value = grid[i];
    if (value <= 0) continue;
    const source =
      Math.ceil(heatFraction(value, settings) * (HEAT_LOOKUP_STEPS - 1)) * 4;
    const target = i * 4;
    image.data[target] = lookup[source];
    image.data[target + 1] = lookup[source + 1];
    image.data[target + 2] = lookup[source + 2];
    image.data[target + 3] = lookup[source + 3];
  }
  ctx.putImageData(image, 0, 0);
}

export default function HeatLayer({
  entries,
  settings,
}: {
  entries: LocationEntry[];
  settings: HeatSettings;
}) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { countBy } = settings;
  const weights = useMemo(
    () => entries.map((entry) => heatWeight(entry, countBy)),
    [entries, countBy],
  );

  useEffect(() => {
    const canvas = L.DomUtil.create(
      "canvas",
      "leaflet-zoom-hide pointer-events-none absolute",
      map.getPanes().overlayPane,
    );
    canvasRef.current = canvas;
    return () => {
      canvas.remove();
      canvasRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    let frame = 0;
    const redraw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (canvasRef.current) {
          drawHeat(canvasRef.current, map, entries, weights, settings);
        }
      });
    };
    redraw();
    map.on("move zoomend resize", redraw);
    return () => {
      cancelAnimationFrame(frame);
      map.off("move zoomend resize", redraw);
    };
  }, [map, entries, weights, settings]);

  return null;
}
