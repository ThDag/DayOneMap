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

`npm run lint` currently reports one existing error: the `as any` cast on the cluster layer in `src/components/MapView.tsx`.

## Architecture

A client-only React 19 + TypeScript SPA with no backend and no router. The app has three layers:

- **Data (`src/data.ts`):** defines `LocationEntry`, which mirrors the Day One export schema, and holds the mock dataset, which makes up most of the file. `loadLocations()` fetches `/places.json` once at startup.
- **State (`src/App.tsx`):** owns all shared state with plain `useState`: the loaded data, the selected entry, the selected cluster's entries, and the country filter. There is no state library. Rendering waits for loading to finish, so `MapView` always mounts with data.
- **Views (`src/components/`):** `MapView` renders clustered markers and `Sidebar` renders either a cluster list or a single entry's details. `App` keeps `selected` and `clusterEntries` mutually exclusive through its handlers, and the sidebar shows whenever either is set.

Each record is one visit (a stop with arrival and departure times), so a place visited repeatedly appears as several records. Records contain no route data or stable place ID.

## Behavior to preserve or watch for

- **Mock fallback:** any failure to load or parse `places.json`, including malformed JSON, silently falls back to mock data and only logs `console.info`. The "Mock Data" header badge is the visible signal, so check it when debugging a data problem. The response is not validated against `LocationEntry`.
- **Filtering lives in `MapView`:** `App` passes `filterCountry` down and `MapView` derives the filtered list, so any new view that needs filtered data requires moving that logic up into `App`.
- **Cluster selection is by bounding box:** `handleClusterClick` selects every filtered entry inside the cluster's bounds rather than the cluster's actual children, so overlapping bounds can pull in entries from neighbouring clusters.
- **`FlyTo` runs once:** a ref guards it, so changing the country filter does not re-centre the map.
- **Times are local to the place:** the helpers in `src/format.ts` format each time in the entry's `timeZoneName`, falling back to the browser's timezone if the name is invalid. Pass the entry's zone when formatting any new time display.

## Styling and map assets

- Tailwind CSS v4 is configured through `@tailwindcss/vite` and `@import "tailwindcss"` in `src/index.css`. There is no `tailwind.config` file. The UI is dark-only.
- Leaflet and MarkerCluster CSS load from unpkg in `index.html`, not from npm imports. Their versions are pinned there separately from `package.json`.
- Leaflet popups and cluster icons are themed by overriding their class names in `src/index.css`.
- Map tiles come from OpenStreetMap.

## Privacy

`public/places.json` is the user's personal location history and is gitignored. Do not commit it or copy its contents into source, docs, or fixtures. Vite copies `public/` into `dist/` at build time, so a build made with real data contains that history.

The README promises no analytics, telemetry, or external API calls beyond map tiles, so keep new features local. It does not mention the unpkg stylesheets in `index.html`.

## Planning docs

- `docs/features-to-build.md`: the chosen, unbuilt features. The weekly hour table (punchcard) is top priority.
- `docs/visualization-ideas.md`: the full list of ideas, with an analysis of what the data can and cannot support.
