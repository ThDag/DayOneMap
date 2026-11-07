import { memo, useCallback, useEffect, useRef } from "react";
import {
  AttributionControl,
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { BASEMAPS, type BasemapId } from "../basemaps";
import type { LocationEntry } from "../data";
import type { HeatSettings } from "../heatmap";
import HeatLayer from "./HeatLayer";

const FOCUS_ZOOM = 13;

const stopIcon = L.divIcon({
  className: "stop-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const selectedIcon = L.divIcon({
  className: "stop-icon stop-icon-selected",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function clusterIcon(cluster: { getChildCount(): number }) {
  const count = cluster.getChildCount();
  return L.divIcon({
    className: "cluster-icon",
    html: `<span>${count}</span>`,
    iconSize: [String(count).length * 8 + 20, 28],
  });
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function latLng(entry: LocationEntry): [number, number] {
  return [entry.location.latitude, entry.location.longitude];
}

/** The part of the map the details panel covers: the right side, or the bottom on phones. */
function panelInset(map: L.Map): [number, number] {
  const { x, y } = map.getSize();
  return x < 640 ? [0, Math.round(y * 0.55)] : [344, 0];
}

/** Fits the map to the visible stops on load and whenever the filter changes them. */
function FitToStops({ entries }: { entries: LocationEntry[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (entries.length === 0) return;
    const bounds = L.latLngBounds(entries.map(latLng));
    const options = { padding: [64, 64] as [number, number], maxZoom: 11 };
    if (fitted.current && !prefersReducedMotion()) {
      map.flyToBounds(bounds, { ...options, duration: 0.8 });
    } else {
      map.fitBounds(bounds, { ...options, animate: false });
    }
    fitted.current = true;
  }, [map, entries]);

  return null;
}

/** Keeps the selected stop visible beside the details panel. */
function FocusSelection({
  selected,
  flyTo,
}: {
  selected: LocationEntry | null;
  flyTo: LocationEntry | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selected) return;
    const target = L.latLng(latLng(selected));
    const [insetX, insetY] = panelInset(map);
    if (flyTo?.uuid === selected.uuid) {
      const zoom = Math.max(map.getZoom(), FOCUS_ZOOM);
      const center = map.unproject(
        map.project(target, zoom).add([insetX / 2, insetY / 2]),
        zoom,
      );
      if (prefersReducedMotion()) map.setView(center, zoom, { animate: false });
      else map.flyTo(center, zoom, { duration: 0.8 });
    } else {
      map.panInside(target, {
        paddingTopLeft: [24, 24],
        paddingBottomRight: [insetX + 24, insetY + 24],
        animate: !prefersReducedMotion(),
      });
    }
  }, [map, selected, flyTo]);

  return null;
}

function MapClick({ onClick }: { onClick: () => void }) {
  useMapEvents({ click: onClick });
  return null;
}

interface StopsProps {
  entries: LocationEntry[];
  onSelect: (entry: LocationEntry) => void;
  onClusterSelect: (entries: LocationEntry[]) => void;
}

/** Memoised so that selecting a stop does not re-render thousands of markers. */
const Stops = memo(function Stops({
  entries,
  onSelect,
  onClusterSelect,
}: StopsProps) {
  const handleClusterClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      const bounds = (e.layer as L.FeatureGroup).getBounds();
      onClusterSelect(entries.filter((entry) => bounds.contains(latLng(entry))));
    },
    [entries, onClusterSelect],
  );

  return (
    <MarkerClusterGroup
      chunkedLoading
      zoomToBoundsOnClick={false}
      showCoverageOnHover={false}
      maxClusterRadius={56}
      iconCreateFunction={clusterIcon}
      onClick={handleClusterClick}
    >
      {entries.map((entry) => (
        <Marker
          key={entry.uuid}
          position={latLng(entry)}
          icon={stopIcon}
          keyboard={false}
          eventHandlers={{ click: () => onSelect(entry) }}
        />
      ))}
    </MarkerClusterGroup>
  );
});

/** One canvas dot per stop, with no grouping. Dots are not clickable, which keeps them cheap to draw. */
const Dots = memo(function Dots({ entries }: { entries: LocationEntry[] }) {
  const map = useMap();

  useEffect(() => {
    const renderer = L.canvas({ padding: 0.5 });
    const layer = L.layerGroup(
      entries.map((entry) =>
        L.circleMarker(latLng(entry), {
          renderer,
          radius: 3,
          stroke: false,
          fillColor: "#fff",
          fillOpacity: 0.85,
          interactive: false,
        }),
      ),
    ).addTo(map);
    return () => {
      layer.remove();
      renderer.remove();
    };
  }, [map, entries]);

  return null;
});

export type MapMode = "clusters" | "dots" | "heatmap";

interface MapViewProps extends StopsProps {
  mode: MapMode;
  basemapId: BasemapId;
  heatSettings: HeatSettings;
  selected: LocationEntry | null;
  placeRadius: number;
  flyTo: LocationEntry | null;
  onBackgroundClick: () => void;
}

export default function MapView({
  mode,
  basemapId,
  heatSettings,
  entries,
  selected,
  placeRadius,
  flyTo,
  onSelect,
  onClusterSelect,
  onBackgroundClick,
}: MapViewProps) {
  const basemap = BASEMAPS.find(({ id }) => id === basemapId)!;

  return (
    <MapContainer
      center={[20, 0]}
      zoom={3}
      className="isolate h-full w-full"
      zoomControl={false}
      attributionControl={false}
    >
      <AttributionControl position="bottomleft" />
      <FitToStops entries={entries} />
      <FocusSelection selected={selected} flyTo={flyTo} />
      <MapClick onClick={onBackgroundClick} />
      {/* The key remounts the layer, because Leaflet can't change a layer's class later. */}
      <TileLayer
        key={basemap.id}
        attribution={basemap.attribution}
        url={basemap.url}
        className={basemap.className}
        maxNativeZoom={basemap.maxNativeZoom}
      />
      {mode === "clusters" && (
        <Stops
          entries={entries}
          onSelect={onSelect}
          onClusterSelect={onClusterSelect}
        />
      )}
      {mode === "dots" && <Dots entries={entries} />}
      {mode === "heatmap" && (
        <HeatLayer entries={entries} settings={heatSettings} />
      )}
      {selected && (
        <>
          <Circle
            center={latLng(selected)}
            radius={placeRadius}
            interactive={false}
            pathOptions={{ color: "#5b9dff", weight: 1, fillOpacity: 0.1 }}
          />
          <Marker
            position={latLng(selected)}
            icon={selectedIcon}
            interactive={false}
            keyboard={false}
            zIndexOffset={10000}
          />
        </>
      )}
    </MapContainer>
  );
}
