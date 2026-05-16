import { useState, useMemo, useCallback, useEffect } from "react";
import { MapPin, Filter, Loader2, Database } from "lucide-react";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import { loadLocations, type LocationEntry } from "./data";

export default function App() {
  const [data, setData] = useState<LocationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [selected, setSelected] = useState<LocationEntry | null>(null);
  const [clusterEntries, setClusterEntries] = useState<LocationEntry[] | null>(
    null,
  );
  const [filterCountry, setFilterCountry] = useState("");

  useEffect(() => {
    loadLocations()
      .then((result) => {
        setData(result.data);
        setUsingMock(result.usingMock);
      })
      .finally(() => setLoading(false));
  }, []);

  const countries = useMemo(() => {
    const set = new Set(data.map((d) => d.location.country));
    return Array.from(set).sort();
  }, [data]);

const handleSelect = useCallback((entry: LocationEntry | null) => {
    setSelected(entry);
    setClusterEntries(null);
  }, []);

  const handleClusterSelect = useCallback((entries: LocationEntry[]) => {
    setClusterEntries(entries);
    setSelected(null);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSelected(null);
    setClusterEntries(null);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-950">
        <Loader2 size={32} className="animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-gray-950">
      <header className="flex items-center justify-between border-b border-gray-800 bg-gray-900/80 px-5 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-blue-400" />
          <h1 className="text-base font-semibold text-white">
            Places History Map
          </h1>
          <span className="ml-2 rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-400">
            {data.length} locations
          </span>
          {usingMock && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-400">
              <Database size={10} />
              Mock Data
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" />
          <select
            value={filterCountry}
onChange={(e) => {
              setFilterCountry(e.target.value);
              setSelected(null);
              setClusterEntries(null);
            }}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-200 outline-none transition-colors focus:border-blue-500"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
<MapView
            data={data}
            onSelect={handleSelect}
            onClusterSelect={handleClusterSelect}
            filterCountry={filterCountry}
          />
        </div>
        {(selected || clusterEntries) && (
          <Sidebar
            entry={selected}
            entries={clusterEntries}
            onClose={handleCloseSidebar}
            onSelectEntry={handleSelect}
          />
        )}
      </div>
    </div>
  );
}