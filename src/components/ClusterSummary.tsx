import { useMemo, type ReactNode } from "react";
import type { LocationEntry } from "../data";
import { formatDateShort, formatSpan } from "../format";
import { clusterSummary } from "../summary";
import { WEEK_DAYS } from "../week";

function Stat({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="text-dim">{label}</dt>
      <dd className="break-words">{children}</dd>
    </div>
  );
}

function percent(share: number) {
  return `${Math.round(share * 100)}%`;
}

export default function ClusterSummary({
  entries,
  radius,
}: {
  entries: LocationEntry[];
  radius: number;
}) {
  const summary = useMemo(
    () => clusterSummary(entries, radius),
    [entries, radius],
  );
  const { first, lastLeft, busiestDay, busiestHour, topPlace } = summary;

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 px-4 pb-3">
      <Stat label="Total time">{formatSpan(summary.totalMs)}</Stat>
      <Stat label="Days visited">{summary.days.toLocaleString()}</Stat>
      <Stat label="First visit">
        {formatDateShort(first.arrivalDate, first.location.timeZoneName)}
      </Stat>
      <Stat label="Last visit">
        {formatDateShort(lastLeft.departureDate, lastLeft.location.timeZoneName)}
      </Stat>
      <Stat label="Places">{summary.places.toLocaleString()}</Stat>
      <Stat label="Typical stay">{formatSpan(summary.typicalMs)}</Stat>
      {busiestDay && (
        <Stat label="Busiest day">
          {WEEK_DAYS[busiestDay.index]}, {percent(busiestDay.share)}
        </Stat>
      )}
      {busiestHour && (
        <Stat label="Busiest hour">
          {String(busiestHour.index).padStart(2, "0")}:00,{" "}
          {percent(busiestHour.share)}
        </Stat>
      )}
      {topPlace && (
        <Stat label="Most time at" wide>
          {topPlace.name}, {formatSpan(topPlace.ms)}
        </Stat>
      )}
    </dl>
  );
}
