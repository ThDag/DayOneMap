import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import MapView, { type MapMode } from "./components/MapView";
import DetailsPanel from "./components/DetailsPanel";
import { loadLocations, type LocationEntry } from "./data";

const MAP_MODES: { id: MapMode; label: string }[] = [
  { id: "clusters", label: "Clusters" },
  { id: "dots", label: "Dots" },
];

function byArrival(a: LocationEntry, b: LocationEntry) {
  return a.arrivalDate.localeCompare(b.arrivalDate);
}

export default function App() {
  const [data, setData] = useState<LocationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [selected, setSelected] = useState<LocationEntry | null>(null);
  const [clusterEntries, setClusterEntries] = useState<LocationEntry[] | null>(
    null,
  );
  const [flyTo, setFlyTo] = useState<LocationEntry | null>(null);
  const [filterCountry, setFilterCountry] = useState("");
  const [mode, setMode] = useState<MapMode>("clusters");

  useEffect(() => {
    loadLocations()
      .then((result) => {
        setData(result.data);
        setUsingMock(result.usingMock);
      })
      .finally(() => setLoading(false));
  }, []);

  const countries = useMemo(
    () => Array.from(new Set(data.map((d) => d.location.country))).sort(),
    [data],
  );

  const filtered = useMemo(
    () =>
      filterCountry
        ? data.filter((d) => d.location.country === filterCountry)
        : data,
    [data, filterCountry],
  );

  const handleClose = useCallback(() => {
    setSelected(null);
    setClusterEntries(null);
    setFlyTo(null);
  }, []);

  const handleBack = useCallback(() => {
    setSelected(null);
    setFlyTo(null);
  }, []);

  // A stop clicked on the map is already in view, and any open cluster list no longer applies.
  const handleMapSelect = useCallback((entry: LocationEntry) => {
    setSelected(entry);
    setClusterEntries(null);
    setFlyTo(null);
  }, []);

  const handleClusterSelect = useCallback((entries: LocationEntry[]) => {
    setClusterEntries([...entries].sort(byArrival));
    setSelected(null);
    setFlyTo(null);
  }, []);

  // A stop picked from a cluster list may be hidden inside the cluster, so the map travels to it.
  const handleListSelect = useCallback((entry: LocationEntry) => {
    setSelected(entry);
    setFlyTo(entry);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selected && clusterEntries) handleBack();
      else handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, clusterEntries, handleBack, handleClose]);

  if (loading) {
    return (
      <div role="status" className="flex h-dvh items-center justify-center text-dim">
        Loading stops…
      </div>
    );
  }

  return (
    <main className="relative isolate h-dvh">
      <MapView
        mode={mode}
        entries={filtered}
        selected={selected}
        flyTo={flyTo}
        onSelect={handleMapSelect}
        onClusterSelect={handleClusterSelect}
        onBackgroundClick={handleClose}
      />

      <div className="absolute top-3 left-3 z-[1000] w-64 max-w-[calc(100%-1.5rem)] overflow-hidden rounded-lg border border-line bg-surface shadow-lg shadow-black/40">
        <div className="flex items-baseline justify-between gap-3 px-3 py-2.5">
          <h1 className="font-semibold">DayOneMap</h1>
          <p className="text-dim">
            {filterCountry
              ? `${filtered.length.toLocaleString()} of ${data.length.toLocaleString()}`
              : data.length.toLocaleString()}{" "}
            {data.length === 1 ? "stop" : "stops"}
          </p>
        </div>
        <div
          role="group"
          aria-label="Map view"
          className="grid grid-cols-2 gap-1 border-t border-line p-1"
        >
          {MAP_MODES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => {
                setMode(id);
                handleClose();
              }}
              className={`h-8 rounded-md transition-colors ${
                mode === id
                  ? "bg-raised font-medium text-ink"
                  : "text-dim hover:bg-raised hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {data.length > 0 ? (
          <div className="relative border-t border-line">
            <select
              aria-label="Filter by country"
              value={filterCountry}
              onChange={(e) => {
                setFilterCountry(e.target.value);
                handleClose();
              }}
              className="h-10 w-full cursor-pointer appearance-none bg-transparent pr-8 pl-3 transition-colors hover:bg-raised"
            >
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-dim"
            />
          </div>
        ) : (
          <p className="border-t border-line px-3 py-2.5 text-dim">
            This file has no stops.
          </p>
        )}
        {usingMock && (
          <p className="border-t border-line px-3 py-2.5 text-dim">
            Sample data. Add your export as{" "}
            <code className="font-[inherit] text-ink">public/places.json</code>.
          </p>
        )}
      </div>

      <DetailsPanel
        entry={selected}
        entries={clusterEntries}
        onClose={handleClose}
        onBack={handleBack}
        onSelectEntry={handleListSelect}
      />
    </main>
  );
}
