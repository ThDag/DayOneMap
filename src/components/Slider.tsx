export default function Slider({
  label,
  hint,
  display,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint: string;
  display: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block" title={hint}>
      <span className="flex justify-between gap-3">
        <span>{label}</span>
        <span className="text-dim">{display}</span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        aria-valuetext={display}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-5 w-full cursor-pointer accent-accent"
      />
    </label>
  );
}
