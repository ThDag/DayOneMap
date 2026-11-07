import SegmentedControl from "./SegmentedControl";
import Slider from "./Slider";
import {
  DEFAULT_HEAT_SETTINGS,
  heatAmountAt,
  heatLegend,
  type HeatCountBy,
  type HeatSettings,
} from "../heatmap";

// The "full colour" slider is logarithmic, so it reaches both 1 and thousands.
const FULL_AT_MIN = 1;
const FULL_AT_MAX = 2000;

const COUNT_BY_OPTIONS: { id: HeatCountBy; label: string }[] = [
  { id: "time", label: "Time spent" },
  { id: "visits", label: "Visits" },
];

export default function HeatControls({
  settings,
  onChange,
}: {
  settings: HeatSettings;
  onChange: (settings: HeatSettings) => void;
}) {
  const update = (changes: Partial<HeatSettings>) =>
    onChange({ ...settings, ...changes });
  const unit = settings.countBy === "time" ? "h" : "visits";
  const midpoint = heatAmountAt(0.5, settings);
  const fullAtPosition =
    Math.log(settings.fullAt / FULL_AT_MIN) /
    Math.log(FULL_AT_MAX / FULL_AT_MIN);

  return (
    <div className="space-y-3 border-t border-line p-3">
      <Slider
        label="Size"
        hint="How far each stop spreads on screen"
        display={`${settings.radius} px`}
        value={settings.radius}
        min={2}
        max={60}
        step={1}
        onChange={(radius) => update({ radius })}
      />
      <Slider
        label="Softness"
        hint="Low is crisp and detailed, high is smooth and blobby"
        display={`${Math.round(settings.softness * 100)}%`}
        value={settings.softness}
        min={0}
        max={1}
        step={0.01}
        onChange={(softness) => update({ softness })}
      />

      <div>
        <p className="pb-1">Count by</p>
        <SegmentedControl
          label="Count by"
          options={COUNT_BY_OPTIONS}
          value={settings.countBy}
          onChange={(countBy) => update({ countBy })}
        />
      </div>

      <Slider
        label="Full colour at"
        hint="The amount that reaches the hottest colour"
        display={`${settings.fullAt.toLocaleString()} ${unit}`}
        value={fullAtPosition}
        min={0}
        max={1}
        step={0.005}
        onChange={(position) =>
          update({
            fullAt: Math.round(
              FULL_AT_MIN * (FULL_AT_MAX / FULL_AT_MIN) ** position,
            ),
          })
        }
      />
      <Slider
        label="Low-end boost"
        hint="Higher values make small amounts show up more strongly"
        display={`${Math.round(settings.lowEndBoost * 100)}%`}
        value={settings.lowEndBoost}
        min={0}
        max={1}
        step={0.01}
        onChange={(lowEndBoost) => update({ lowEndBoost })}
      />

      <div>
        <div
          aria-hidden="true"
          className="h-2 rounded-sm"
          style={{ background: heatLegend(settings.lowEndBoost) }}
        />
        <p className="flex justify-between pt-1 text-dim">
          <span>0</span>
          <span>{midpoint < 10 ? midpoint.toFixed(1) : Math.round(midpoint)}</span>
          <span>
            {settings.fullAt.toLocaleString()} {unit}
          </span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(DEFAULT_HEAT_SETTINGS)}
        className="h-8 w-full rounded-md text-dim transition-colors hover:bg-raised hover:text-ink"
      >
        Reset
      </button>
    </div>
  );
}
