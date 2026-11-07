import type { ReactNode } from "react";
import { ArrowLeft, X } from "lucide-react";
import type { LocationEntry } from "../data";
import {
  formatDate,
  formatDateShort,
  formatDuration,
  formatTime,
} from "../format";
import ClusterSummary from "./ClusterSummary";
import WeekTable from "./WeekTable";

interface DetailsPanelProps {
  entry: LocationEntry | null;
  entries: LocationEntry[] | null;
  allEntries: LocationEntry[];
  placeRadius: number;
  onPlaceRadiusChange: (radius: number) => void;
  onClose: () => void;
  onBack: () => void;
  onSelectEntry: (entry: LocationEntry) => void;
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-8 shrink-0 items-center justify-center rounded-md text-dim transition-colors hover:bg-raised hover:text-ink"
    >
      {children}
    </button>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 border-t border-line py-2.5">
      <dt className="w-24 shrink-0 text-dim">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

function Details({
  entry,
  allEntries,
  placeRadius,
  onPlaceRadiusChange,
}: {
  entry: LocationEntry;
  allEntries: LocationEntry[];
  placeRadius: number;
  onPlaceRadiusChange: (radius: number) => void;
}) {
  const { location } = entry;
  const zone = location.timeZoneName;
  const region = [location.localityName, location.administrativeArea, location.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="overflow-y-auto px-4 pb-2">
      <p className="pb-3 text-dim">{region}</p>
      <WeekTable
        entry={entry}
        allEntries={allEntries}
        radius={placeRadius}
        onRadiusChange={onPlaceRadiusChange}
      />
      <p className="pb-2 font-medium">This stop</p>
      <dl>
        <Fact label="Arrived">{formatDate(entry.arrivalDate, zone)}</Fact>
        <Fact label="Left">{formatDate(entry.departureDate, zone)}</Fact>
        <Fact label="Stayed">
          {formatDuration(entry.arrivalDate, entry.departureDate)}
        </Fact>
        <Fact label="Coordinates">
          {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
        </Fact>
        <Fact label="Accuracy">{entry.horizontalAccuracy.toFixed(1)} m</Fact>
        <Fact label="Timezone">{zone}</Fact>
      </dl>
    </div>
  );
}

function StopList({
  entries,
  onSelectEntry,
}: {
  entries: LocationEntry[];
  onSelectEntry: (entry: LocationEntry) => void;
}) {
  return (
    <ul>
      {entries.map((entry) => {
        const zone = entry.location.timeZoneName;
        return (
          <li key={entry.uuid} className="border-t border-line">
            <button
              type="button"
              onClick={() => onSelectEntry(entry)}
              className="block w-full px-4 py-2.5 text-left transition-colors hover:bg-raised"
            >
              <span className="block font-medium">
                {formatDateShort(entry.arrivalDate, zone)}
                <span aria-hidden="true" className="mx-1.5">
                  •
                </span>
                {formatDuration(entry.arrivalDate, entry.departureDate)}
              </span>
              <span className="block text-dim">
                {formatTime(entry.arrivalDate, zone)}–
                {formatTime(entry.departureDate, zone)}
              </span>
              <span className="block truncate text-dim">
                {entry.location.placeName}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function DetailsPanel({
  entry,
  entries,
  allEntries,
  placeRadius,
  onPlaceRadiusChange,
  onClose,
  onBack,
  onSelectEntry,
}: DetailsPanelProps) {
  const showList = !entry && entries && entries.length > 0;
  if (!entry && !showList) return null;

  return (
    <section
      aria-label={entry ? "Stop details" : "Stops in this cluster"}
      className="absolute top-3 right-3 z-[1000] flex max-h-[calc(100%-1.5rem)] w-80 flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-lg shadow-black/40 max-sm:top-auto max-sm:bottom-3 max-sm:left-3 max-sm:max-h-[55%] max-sm:w-auto"
    >
      <header className="flex items-start gap-1 p-2 pl-4">
        {entry && entries && (
          <IconButton label="Back to list" onClick={onBack}>
            <ArrowLeft size={16} />
          </IconButton>
        )}
        <h2 className="min-w-0 flex-1 py-1 font-semibold break-words">
          {entry
            ? entry.location.placeName
            : `${entries!.length.toLocaleString()} stops`}
        </h2>
        <IconButton label="Close" onClick={onClose}>
          <X size={16} />
        </IconButton>
      </header>
      {entry ? (
        <Details
          entry={entry}
          allEntries={allEntries}
          placeRadius={placeRadius}
          onPlaceRadiusChange={onPlaceRadiusChange}
        />
      ) : (
        <div className="overflow-y-auto">
          <ClusterSummary entries={entries!} radius={placeRadius} />
          <StopList entries={entries!} onSelectEntry={onSelectEntry} />
        </div>
      )}
    </section>
  );
}
