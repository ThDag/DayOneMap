# DayMap

Visualise your location history from [Day One](https://dayone.app) on an interactive map.

Day One records a location entry whenever you create a journal entry. This tool reads the exported location data and plots every place you've checked in — clustered, filterable, and browsable.

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Add your Day One data

Export your Day One data (Journal → Export → JSON), then copy the location entries into `public/places.json`. See [`public/places.json.example`](public/places.json.example) for the expected schema:

```json
[
  {
    "uuid": "your-entry-uuid",
    "location": {
      "region": {
        "center": { "longitude": ..., "latitude": ... },
        "identifier": "...",
        "radius": ...
      },
      "localityName": "City",
      "country": "Country",
      "timeZoneName": "Timezone",
      "administrativeArea": "State/Region",
      "longitude": ...,
      "placeName": "Address or POI",
      "latitude": ...
    },
    "arrivalDate": "2024-01-01T12:00:00Z",
    "departureDate": "2024-01-01T14:00:00Z",
    "horizontalAccuracy": 20,
    "timestamp": "2024-01-01T14:00:00Z"
  }
]
```

> ⚠️ **`public/places.json` is gitignored** — your location data won't accidentally be committed.

### Run (development)

```bash
npm run dev
```

### Build (production)

```bash
npm run build
```

Preview the build:

```bash
npm run preview
```

## Mock Data

If no `places.json` is found, the app falls back to built-in mock data showing sample locations (New York, London, Paris, Tokyo, Sydney). A **Mock Data** badge appears in the header so you know real data isn't loaded.

## Privacy

This app is fully self-contained. All data is loaded from a local `public/places.json` file and never leaves your machine. There are no analytics, no telemetry, and no external API calls — map tiles are loaded from OpenStreetMap.

## Features

- **Clustered markers** — locations are automatically clustered at low zoom levels; click a cluster to see all entries in the sidebar
- **Country filter** — filter locations by country
- **Sidebar detail view** — click any marker to see full details (date, time, duration, coordinates, accuracy, timezone)
- **Dark theme** — built-in dark UI

## Tech Stack

- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)
- [Leaflet](https://leafletjs.com) / [react-leaflet](https://react-leaflet.js.org)
- [Tailwind CSS](https://tailwindcss.com) v4
- [lucide-react](https://lucide.dev) icons

## License

MIT
