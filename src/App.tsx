import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { BASEMAPS, type BasemapId } from "./basemaps";
import MapView, { type MapMode } from "./components/MapView";
import DetailsPanel from "./components/DetailsPanel";
import HeatControls from "./components/HeatControls";
import ImportButton from "./components/ImportButton";
import SegmentedControl from "./components/SegmentedControl";
import WelcomeDialog from "./components/WelcomeDialog";
import { loadLocations, type LocationEntry } from "./data";
import { DEFAULT_HEAT_SETTINGS } from "./heatmap";
import { REPO_URL } from "./links";
import { DEFAULT_PLACE_RADIUS } from "./week";

const MAP_MODES: { id: MapMode; label: string }[] = [
  { id: "clusters", label: "Clusters" },
  { id: "dots", label: "Dots" },
  { id: "heatmap", label: "Heatmap" },
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
  const [basemapId, setBasemapId] = useState<BasemapId>("standard");
  const [heatSettings, setHeatSettings] = useState(DEFAULT_HEAT_SETTINGS);
  const [placeRadius, setPlaceRadius] = useState(DEFAULT_PLACE_RADIUS);

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

  const handleImport = useCallback(
    (entries: LocationEntry[]) => {
      setData(entries);
      setUsingMock(false);
      setFilterCountry("");
      handleClose();
    },
    [handleClose],
  );

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
        basemapId={basemapId}
        heatSettings={heatSettings}
        entries={filtered}
        selected={selected}
        placeRadius={placeRadius}
        flyTo={flyTo}
        onSelect={handleMapSelect}
        onClusterSelect={handleClusterSelect}
        onBackgroundClick={handleClose}
      />

      <div className="absolute top-3 left-3 z-[1000] max-h-[calc(100%-1.5rem)] w-64 max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-lg border border-line bg-surface shadow-lg shadow-black/40">
        <div className="flex items-baseline justify-between gap-3 px-3 py-2.5">
          <h1 className="font-semibold">DayOneMap</h1>
          <p className="text-dim">
            {filterCountry
              ? `${filtered.length.toLocaleString()} of ${data.length.toLocaleString()}`
              : data.length.toLocaleString()}{" "}
            {data.length === 1 ? "stop" : "stops"}
          </p>
        </div>
        <div className="border-t border-line p-1">
          <SegmentedControl
            label="Map view"
            options={MAP_MODES}
            value={mode}
            onChange={(next) => {
              setMode(next);
              handleClose();
            }}
          />
        </div>
        <div className="border-t border-line p-1">
          <SegmentedControl
            label="Base map"
            options={BASEMAPS}
            value={basemapId}
            onChange={setBasemapId}
          />
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
          <div className="border-t border-line px-3 py-2.5 text-dim">
            Sample data.{" "}
            <ImportButton
              onImport={handleImport}
              className="font-medium text-ink underline decoration-dim underline-offset-2 transition-colors hover:decoration-ink disabled:opacity-60"
            >
              Import your file
            </ImportButton>
          </div>
        )}
        {mode === "heatmap" && (
          <HeatControls settings={heatSettings} onChange={setHeatSettings} />
        )}
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 items-center gap-2 border-t border-line px-3 text-dim transition-colors hover:bg-raised hover:text-ink"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="size-3.5 shrink-0"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <span className="flex-1">View on GitHub</span>
          <ExternalLink size={14} aria-hidden="true" className="shrink-0" />
        </a>
      </div>

      <DetailsPanel
        entry={selected}
        entries={clusterEntries}
        allEntries={data}
        placeRadius={placeRadius}
        onPlaceRadiusChange={setPlaceRadius}
        onClose={handleClose}
        onBack={handleBack}
        onSelectEntry={handleListSelect}
      />

      <WelcomeDialog onImport={handleImport} />
    </main>
  );
}
