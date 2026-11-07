# DayOneMap: visualization and query ideas

## Context
Pitch only, nothing gets built yet. The ideas come from the input schema in `dayonemap/src/data.ts`. The app currently shows clustered pins, a country filter and a details sidebar.

## What the data is
A flat array of visits, one record per stop:

| Group | Fields | What it gives you |
|---|---|---|
| Where | `latitude`, `longitude`, `placeName`, `localityName`, `administrativeArea`, `country` | A point, plus a name at four zoom levels |
| When | `arrivalDate`, `departureDate`, `timestamp` | An exact time span |
| Local time | `timeZoneName` | The hour as you experienced it |
| Certainty | `horizontalAccuracy`, `region.radius`, `region.center` | How fuzzy the point is |
| Identity | `uuid`, `region.identifier` | Record keys |

**Can be derived:** time spent at a place, gap between stops, distance and speed between stops, visit order, first and last visit, return visits, weekday and hour.

**Not included:** the route between stops, transport mode, place category, and any reason for the visit. These are stops, not tracks, so any line between two stops is implied.

The most underused fact is that every record has a duration. Pins treat a 5-minute stop and a 5-day stay the same.

## Inside the box
Familiar ideas that fit naturally in the current app.

1. **Time heatmap:** weight heat by hours spent, not visit count. The map changes from "where I've been" to "where my life happened."
2. **Timeline scrubber:** drag through time or press play, and pins light up as you arrive and fade as you leave.
3. **Punchcard:** an hour-by-weekday grid for any place, showing when you tend to be there.
4. **Connection lines:** link consecutive stops, with thickness showing how often you make that trip.
5. **Drill-down stats:** country → region → city → place, with hours and visits at each level.
6. **On this day:** where you were on this date in earlier years.
7. **Your year in review:** a shareable recap of new places, most-returned-to places, farthest point and longest stay.

## Outside the box

### Other ways to see it
8. **Life barcode:** each day is one thin column of 24 hours, coloured by place. Routines become stripes and trips become bursts of colour. It's striking enough to print as a poster.
9. **Time-warped map:** the map stretches so places grow with the time spent there. Your regular neighbourhood becomes a continent, and a country you passed through shrinks to a sliver.
10. **Your-life subway map:** regular places become stations and common trips become lines, drawn in transit-diagram style.
11. **Orbit view:** your most-visited place is the sun. Other places orbit at their real distance, with speed set by how often you return.
12. **Tree rings:** each year is a ring, and the ring's thickness at each angle shows how far from home you were that week.
13. **Typographic map:** no pins or base map, only `placeName` text at its real position, sized by time spent.

### Ideas that play with meaning
14. **Ghost places:** places fade with time since your last visit, so old regulars show up as ghosts. This is the most emotional idea here, a map of the chapters of your life that have ended.
15. **Fog of war:** the world starts dark and each stop uncovers a circle, sized using `region.radius` and `horizontalAccuracy`. You see what you've explored, and what's still dark right next to home.
16. **Your own distance map:** rearrange places by how long it took *you* to get between them, using departure and arrival times, not by kilometres.
17. **Memory blur:** older visits get blurrier and less certain, as if the map were forgetting them.

### Ideas that add something new
18. **Guess my next stop:** learn which place tends to follow which, then let people guess where you go next. It can also generate a fake but believable day.
19. **Sound of a day:** latitude sets pitch, duration sets note length, and each place gets its own instrument. Routine days loop, and trips sound different.
20. **Daylight and weather:** calculate the sun's position from coordinates and time, or fetch historical weather. This answers "how much of my life is after dark?" and "what's the worst weather I went out in?"
21. **Photos on the map:** `photographs.json` in this repo has `date` and `time` but no location. Matching a photo's time to a visit places it on the map without GPS, connecting your gallery to your map.
22. **What a stranger could work out:** a mode that guesses home, work and routines from the data alone, then shows a fuzzed version that's safe to share. This would stand out on a portfolio because it's about privacy as well as maps.

## Questions worth asking the data
- Which place did you take the longest to return to?
- Which regular places did you suddenly stop visiting, and when?
- Which places do you only visit at night, or only on one weekday?
- Which two days of your life were most alike? Which day was least like any other?
- What's your longest run without seeing anywhere new?
- Which place almost always comes right after another?
- What share of places did you visit exactly once?
- What's the shortest stop on record, and the longest?
- Are you exploring more or less each year?
- How much time goes to moving between places compared with staying in them?

## My top picks
1. **Life barcode (8):** the most striking result for the least work, since it needs no map at all.
2. **Ghost places (14):** the idea people will remember, and a simple addition to the existing Leaflet map.
3. **Photos on the map (21):** the most personal, because it joins two of your own projects.

**Easiest first step:** the time heatmap (1), because it adds duration to the current map and takes very little code.
