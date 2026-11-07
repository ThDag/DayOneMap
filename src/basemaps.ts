export type BasemapId = "standard" | "clean" | "satellite";

interface Basemap {
  id: BasemapId;
  label: string;
  url: string;
  attribution: string;
  /** Standard tiles are light, so index.css darkens this class with a filter. */
  className?: string;
  /** The last zoom with its own tiles. Closer zooms enlarge these instead of going blank. */
  maxNativeZoom?: number;
}

const OSM =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// A provider is only contacted while its base map is selected.
export const BASEMAPS: Basemap[] = [
  {
    id: "standard",
    label: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: OSM,
    className: "basemap-darkened",
  },
  {
    id: "clean",
    label: "Clean",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxNativeZoom: 16,
  },
  {
    id: "satellite",
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Imagery &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  },
];
