# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Day One users who have the app's location history feature turned on and want to see where they have been. The author is the first user, and the project is public for anyone else with an export. They come to explore and reminisce: wandering the map and opening places out of curiosity.

## Product Purpose

DayOneMap plots an exported Day One location history on an interactive map, because Day One has no overview of it. Success means someone can load their export and browse their past stops without the interface getting in the way.

## Positioning

It shows the user's own visit history, read from a local file, with no account and no upload.

## Operating Context

The user exports JSON from Day One (Places → View All → Locations → Export Data) and saves it as `public/places.json`, then runs the app locally. See `docs/how-to-export-dayone-data.md`.

## Capabilities and Constraints

- Current functions: clustered markers, a country filter, a cluster list, and visit details (dates, times, duration, coordinates, accuracy, timezone). Times are shown in each visit's own timezone.
- Each record is one stop with arrival and departure times. There is no route, transport mode, or place category.
- Barebone tool for now: no welcome page, wizard, or onboarding flow.
- No new third-party requests, including fonts and CDNs. Map tiles stay on OpenStreetMap unless the user decides otherwise.
- Planned but unbuilt: weekly hour table, time heatmap, timeline scrubber, drill-down stats (`docs/features-to-build.md`).

## Brand Commitments

- Name: DayOneMap.
- The interface stays dark (user decision).

## Evidence on Hand

- Sample data: `public/places.json.example` and the mock dataset in `src/data.ts`, which is badged as mock data in the UI.
- Screenshots of the current UI: `screenshots/`.

## Product Principles

- The map is the product; everything else stays out of its way until asked for.
- Form follows function: add nothing that does not help someone browse their history.
- The user's location history stays on their machine.
