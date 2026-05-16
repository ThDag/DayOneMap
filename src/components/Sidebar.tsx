import { X, MapPin, Calendar, Clock, Crosshair, Globe, ChevronRight } from "lucide-react";
import type { LocationEntry } from "../data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function durationMs(a: string, b: string) {
  return new Date(b).getTime() - new Date(a).getTime();
}

function formatDuration(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

interface SidebarProps {
  entry?: LocationEntry | null;
  entries?: LocationEntry[] | null;
  onClose: () => void;
  onSelectEntry?: (entry: LocationEntry) => void;
}

function ClusterList({
  entries,
  onSelectEntry,
}: {
  entries: LocationEntry[];
  onSelectEntry: (entry: LocationEntry) => void;
}) {
  if (entries.length === 0) return null;

  return (
    <div className="flex-1 overflow-y-auto">
      {entries.map((entry) => {
        const dur = durationMs(entry.arrivalDate, entry.departureDate);
        return (
          <button
            key={entry.uuid}
            onClick={() => onSelectEntry(entry)}
            className="flex w-full items-center gap-3 border-b border-gray-800 px-5 py-3 text-left transition-colors hover:bg-gray-800/50"
          >
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {entry.location.placeName}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {formatDateShort(entry.arrivalDate)}{" "}
                <span className="text-gray-600">|</span>{" "}
                {formatTime(entry.arrivalDate)}&ndash;{formatTime(entry.departureDate)}{" "}
                <span className="text-gray-600">|</span>{" "}
                <span className="text-emerald-400">{formatDuration(dur)}</span>
              </p>
            </div>
            <ChevronRight size={14} className="shrink-0 text-gray-600" />
          </button>
        );
      })}
    </div>
  );
}

export default function Sidebar({
  entry,
  entries,
  onClose,
  onSelectEntry,
}: SidebarProps) {
  const isCluster = entries && entries.length > 0;

  if (isCluster) {
    return (
      <div className="flex h-full w-96 flex-col border-l border-gray-800 bg-gray-900 shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">
            Cluster ({entries.length})
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>
        <ClusterList entries={entries} onSelectEntry={onSelectEntry!} />
      </div>
    );
  }

  if (!entry) return null;

  const dur = durationMs(entry.arrivalDate, entry.departureDate);

  return (
    <div className="flex h-full w-96 flex-col border-l border-gray-800 bg-gray-900 shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">Location Details</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-200"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div>
          <h3 className="text-xl font-bold text-white">
            {entry.location.placeName}
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {entry.location.localityName}
            {entry.location.administrativeArea &&
              `, ${entry.location.administrativeArea}`}
          </p>
          <p className="text-sm text-gray-500">{entry.location.country}</p>
        </div>

        <div className="space-y-3 rounded-lg bg-gray-800/50 p-4">
          <div className="flex items-start gap-3">
            <Calendar size={16} className="mt-0.5 shrink-0 text-blue-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Arrival
              </p>
              <p className="text-sm text-gray-200">
                {formatDate(entry.arrivalDate)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar size={16} className="mt-0.5 shrink-0 text-amber-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Departure
              </p>
              <p className="text-sm text-gray-200">
                {formatDate(entry.departureDate)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={16} className="mt-0.5 shrink-0 text-emerald-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Duration
              </p>
              <p className="text-sm text-gray-200">
                {formatDuration(dur)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-lg bg-gray-800/50 p-4">
          <div className="flex items-start gap-3">
            <MapPin size={16} className="mt-0.5 shrink-0 text-rose-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Coordinates
              </p>
              <p className="text-sm text-gray-200">
                {entry.location.latitude.toFixed(5)},{" "}
                {entry.location.longitude.toFixed(5)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Crosshair size={16} className="mt-0.5 shrink-0 text-purple-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Accuracy
              </p>
              <p className="text-sm text-gray-200">
                {entry.horizontalAccuracy.toFixed(1)} m
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Globe size={16} className="mt-0.5 shrink-0 text-cyan-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Timezone
              </p>
              <p className="text-sm text-gray-200">
                {entry.location.timeZoneName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
