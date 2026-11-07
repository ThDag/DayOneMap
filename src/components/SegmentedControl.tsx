interface SegmentedControlProps<T extends string> {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export default function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex gap-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={`h-8 min-w-0 flex-1 rounded-md transition-colors ${
            value === option.id
              ? "bg-raised font-medium text-ink"
              : "text-dim hover:bg-raised hover:text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
