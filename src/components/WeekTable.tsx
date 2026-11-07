import { useMemo } from "react";
import type { LocationEntry } from "../data";
import {
  WEEK_DAYS,
  formatHours,
  stopsNear,
  weekCellColors,
  weekHours,
} from "../week";
import Slider from "./Slider";

const HOURS = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);

export default function WeekTable({
  entry,
  allEntries,
  radius,
  onRadiusChange,
}: {
  entry: LocationEntry;
  allEntries: LocationEntry[];
  radius: number;
  onRadiusChange: (radius: number) => void;
}) {
  const stops = useMemo(
    () => stopsNear(allEntries, entry, radius),
    [allEntries, entry, radius],
  );
  const { hours, total, max } = useMemo(() => weekHours(stops), [stops]);

  return (
    <div className="pb-4">
      <p className="flex items-baseline justify-between gap-3 pb-2">
        <span className="font-medium">Weekly hours</span>
        <span className="whitespace-nowrap text-dim">
          {formatHours(total)} h, {stops.length.toLocaleString()}{" "}
          {stops.length === 1 ? "stop" : "stops"}
        </span>
      </p>
      <table className="w-full table-fixed border-collapse text-[11px] leading-none">
        <caption className="sr-only">
          Total hours spent at this place, by hour and day of the week, in
          local time
        </caption>
        <thead>
          <tr>
            <th scope="col" className="w-7 font-normal">
              <span className="sr-only">Hour</span>
            </th>
            {WEEK_DAYS.map((day) => (
              <th
                key={day}
                scope="col"
                className="h-5 border border-line font-normal text-dim"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((label, hour) => (
            <tr key={label}>
              <th
                scope="row"
                className="border border-line font-normal text-dim"
              >
                {label}
              </th>
              {WEEK_DAYS.map((day, dayIndex) => {
                const amount = hours[dayIndex][hour];
                return (
                  <td
                    key={day}
                    title={
                      amount > 0
                        ? `${day} ${label}:00, ${formatHours(amount)} h`
                        : undefined
                    }
                    style={
                      amount > 0 ? weekCellColors(amount, max) : undefined
                    }
                    className="h-[18px] border border-line text-center"
                  >
                    {amount > 0 && formatHours(amount)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pt-3">
        <Slider
          label="Group stops within"
          hint="Stops this close to the selected one count as the same place"
          display={`${radius} m`}
          value={radius}
          min={5}
          max={500}
          step={5}
          onChange={onRadiusChange}
        />
      </div>
    </div>
  );
}
