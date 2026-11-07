# DayOneMap

Visualise your location history from [Day One](https://dayoneapp.com) on an interactive map.

Day One records all the places you have been in a day and how long you stayed there (a feature available on iPhones if turned on). Since Day One doesn't include a built-in map overview to see all of this history at once, and no other tool exists to do so, this application fills that gap. It reads your exported location data and plots every place you've been on an interactive map — clustered, filterable, and browsable.

<p align="center">
  <img src="screenshots/screenshot%202%20cluster%20panel.png" alt="Cluster panel showing grouped locations" width="49%" />
  <img src="screenshots/screenshot%203%20location%20details%20panel.png" alt="Location details panel" width="49%" />
</p>

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Add your Day One data

Export your location history from the Day One app (Places → View All → Locations ( i ) → Export Data) and save the JSON file as `public/places.json`. See [`docs/how-to-export-dayone-data.md`](docs/how-to-export-dayone-data.md) for a step-by-step guide with screenshots.

The file should match this schema (see [`public/places.json.example`](public/places.json.example)):

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

If no `places.json` is found, the app falls back to 40 built-in sample stops in cities including New York, London, Tokyo, Sydney, Istanbul and across the Balkans. A **Sample data** note appears in the top-left panel so you know real data isn't loaded.

## Privacy

This app is fully self-contained. All data is loaded from a local `public/places.json` file and never leaves your machine. There are no analytics, no telemetry, and no external API calls — map tiles are loaded from OpenStreetMap.

## Features

- **Clustered map** — stops cluster at low zoom levels; click a cluster to list its stops
- **Dots view** — switch from clusters to one dot for every stop, with no grouping at any zoom level
- **Heatmap view** — heat by time spent or number of visits, with controls for size, softness, the amount that reaches full colour, and low-end boost
- **Country filter** — filter stops by country
- **Weekly hour table** — for any stop opened from the clustered map, a 7-day by 24-hour table of the time spent at that place, with stops within an adjustable radius (40 m by default) counted as one place
- **Stop details** — date, time, duration, coordinates, accuracy and timezone, with times shown in the stop's own timezone
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

## Credits

This project is fully vibecoded.

Taha Dağıstanlı <br>

OpenCode (DeepSeek V4 Flash)
