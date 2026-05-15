import { X, MapPin, Calendar, Clock, Crosshair, Globe } from "lucide-react";
import type { LocationEntry } from "../data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
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
  entry: LocationEntry | null;
  onClose: () => void;
}

export default function Sidebar({ entry, onClose }: SidebarProps) {
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