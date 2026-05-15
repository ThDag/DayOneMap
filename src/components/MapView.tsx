import { useMemo, useCallback, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import type { LocationEntry } from "../data";

const icon = L.divIcon({
  className: "custom-marker",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="white" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white" stroke="none"/></svg>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const called = useRef(false);
  useEffect(() => {
    if (!called.current) {
      map.flyTo([lat, lng], 5, { duration: 1.5 });
      called.current = true;
    }
  }, [map, lat, lng]);
  return null;
}

interface MapViewProps {
  data: LocationEntry[];
  selected: LocationEntry | null;
  onSelect: (entry: LocationEntry | null) => void;
  filterCountry: string;
}

export default function MapView({
  data,
  onSelect,
  filterCountry,
}: MapViewProps) {
  const filtered = useMemo(
    () =>
      filterCountry
        ? data.filter((d) => d.location.country === filterCountry)
        : data,
    [data, filterCountry],
  );

  const center = useMemo(() => {
    if (filtered.length === 0) return [41.0, 28.9] as [number, number];
    const lat =
      filtered.reduce((s, d) => s + d.location.latitude, 0) / filtered.length;
    const lng =
      filtered.reduce((s, d) => s + d.location.longitude, 0) / filtered.length;
    return [lat, lng] as [number, number];
  }, [filtered]);

  const handleClick = useCallback(
    (entry: LocationEntry) => {
      onSelect(entry);
    },
    [onSelect],
  );

  return (
    <MapContainer
      center={[41.0, 28.9]}
      zoom={4}
      className="h-full w-full"
      zoomControl={false}
    >
      <FlyTo lat={center[0]} lng={center[1]} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading>
        {filtered.map((entry) => (
          <Marker
            key={entry.uuid}
            position={[entry.location.latitude, entry.location.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => handleClick(entry),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <p className="mb-1 text-base font-semibold text-white">
                  {entry.location.placeName}
                </p>
                <p className="text-sm text-gray-400">
                  {entry.location.localityName},{" "}
                  {entry.location.administrativeArea}
                </p>
                <p className="text-sm text-gray-400">{entry.location.country}</p>
                <hr className="my-2 border-gray-700" />
                <p className="text-xs text-gray-500">
                  {formatDate(entry.arrivalDate)} &ndash;{" "}
                  {formatDate(entry.departureDate)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}