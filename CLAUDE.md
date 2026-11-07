# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # Type-check (tsc -b), then production build to dist/
npm run lint      # ESLint
npm run preview   # Serve the production build
npx tsc -b        # Type-check only
```

There is no test runner or test suite. Verify changes with the type-check, lint, and by running the app. Without a local `public/places.json`, the app runs on mock data.

## Architecture

A client-only React 19 + TypeScript SPA with no backend and no router. The app has three layers:

- **Data (`src/data.ts`):** defines `LocationEntry`, which mirrors the Day One export schema, and holds the mock dataset, which makes up most of the file. `loadLocations()` fetches `/places.json` once at startup.
- **State (`src/App.tsx`):** owns all shared state with plain `useState`: the loaded data, the selected entry, the selected cluster's entries, the country filter and the derived filtered list. There is no state library. Rendering waits for loading to finish, so `MapView` always mounts with data.
- **Map views:** `App` holds the current `MapMode` and lists the options in `MAP_MODES`, and `MapView` renders the matching layer. To add a view, extend `MapMode` and `MAP_MODES` and add its layer in `MapView`. The Dots layer draws non-interactive canvas circle markers, so it can't open details.
- **Heatmap (`src/heatmap.ts`, `HeatLayer`, `HeatControls`):** the layer adds each stop's hours or visits into a float grid at screen resolution, then maps each amount through a log scale (`heatFraction`) to a colour, so "Full colour at" means real hours or visits at any zoom and small amounts stay distinct from each other. It redraws fully on every map move and setting change, and its cost grows with stops × size².
- **Weekly table (`src/week.ts`, `WeekTable`):** records have no place ID, so a "place" is every stop within the adjustable radius of the selected stop, drawn as a circle on the map. Picking a different stop in the same area can give a slightly different group. Stays are split at hour boundaries in each stop's own timezone. The table only appears in stop details, which the Dots and Heatmap views can't open.
- **Views (`src/components/`):** `MapView` renders the map and its stops, and `DetailsPanel` shows a cluster list or one stop's details. `selected` and `clusterEntries` can both be set: a stop opened from a cluster list keeps the list so Back can return to it.

Each record is one visit (a stop with arrival and departure times), so a place visited repeatedly appears as several records. Records contain no route data or stable place ID.

## Behavior to preserve or watch for

- **Mock fallback:** any failure to load or parse `places.json`, including malformed JSON, silently falls back to mock data and only logs `console.info`. The "Mock Data" header badge is the visible signal, so check it when debugging a data problem. The response is not validated against `LocationEntry`.
- **Selecting moves the map differently by source:** a stop clicked on the map only pans if needed, while one picked from a cluster list flies there through `flyTo`, because it may be hidden inside the cluster.
- **Stop markers must stay memoised:** `Stops` in `MapView` is separate so changing the selection does not re-render thousands of markers.
- **Cluster selection is by bounding box:** `handleClusterClick` selects every filtered entry inside the cluster's bounds rather than the cluster's actual children, so overlapping bounds can pull in entries from neighbouring clusters.
- **Times are local to the place:** the helpers in `src/format.ts` format each time in the entry's `timeZoneName`, falling back to the browser's timezone if the name is invalid. Pass the entry's zone when formatting any new time display.

## Styling and map assets

- Tailwind CSS v4 is configured through `@tailwindcss/vite` and `@import "tailwindcss"` in `src/index.css`, where the colour tokens live in `@theme`. There is no `tailwind.config` file. The UI is dark-only.
- Leaflet and MarkerCluster CSS are bundled from npm through imports in `src/main.tsx`.
- Stop and cluster icons are styled by their class names in `src/index.css`.
- Map tiles come from OpenStreetMap and are darkened by a CSS filter on `.leaflet-tile-pane`, not by a different tile provider.
- `PRODUCT.md` records who the product is for and its constraints.

## Privacy

`public/places.json` is the user's personal location history and is gitignored. Do not commit it or copy its contents into source, docs, or fixtures. Vite copies `public/` into `dist/` at build time, so a build made with real data contains that history.

The README promises no analytics, telemetry, or external API calls beyond map tiles, so keep new features local and add no third-party requests, including fonts and CDNs.

## Planning docs

- `docs/features-to-build.md`: the chosen features and which are built.
- `docs/visualization-ideas.md`: the full list of ideas, with an analysis of what the data can and cannot support.
