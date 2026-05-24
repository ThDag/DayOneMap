# How to Export Your Day One Location History

This guide walks you through exporting your location history from the Day One app so you can use it with DayOneMap.

---

## Step 1: Open the Places tab

Open the Day One app and tap the **Today** tab at the bottom of the screen. And open **Places** tab.

<p align="center">
  <img src="../screenshots/export%201.png" alt="Day One Places tab" width="300" />
</p>

---

## Step 2: View all locations

Tap **View All** in the top-left corner to see your full location history.

<p align="center">
  <img src="../screenshots/export%202.png" alt="View all locations" width="300" />
</p>

---

## Step 3: Open location details

Tap the **Locations (i)** to open the details panel.

<p align="center">
  <img src="../screenshots/export%203.png" alt="More menu on locations" width="300" />
</p>

---

## Step 4: Export the data

Tap **Export Data** to export your location entries as a JSON file. Save the file to your computer.

<p align="center">
  <img src="../screenshots/export%204.png" alt="Export data button" width="300" />
</p>

---

## Using the exported file

Once you have the exported JSON:

1. Rename or copy the file to `public/places.json` in the DayOneMap project root.
2. Make sure the entries match the expected schema (see `public/places.json.example`).
3. Run `npm run dev` and your real locations will appear on the map.

> Your `public/places.json` is gitignored, so your location data stays private.

