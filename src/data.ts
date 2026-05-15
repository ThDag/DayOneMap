export interface LocationEntry {
  uuid: string;
  location: {
    region: {
      center: { longitude: number; latitude: number };
      identifier: string;
      radius: number;
    };
    localityName: string;
    country: string;
    timeZoneName: string;
    administrativeArea: string;
    longitude: number;
    placeName: string;
    latitude: number;
  };
  arrivalDate: string;
  departureDate: string;
  horizontalAccuracy: number;
  timestamp: string;
}

export async function loadLocations(): Promise<LocationEntry[]> {
  const res = await fetch("/places.json");
  if (!res.ok) throw new Error(`Failed to load places.json (${res.status})`);
  return res.json();
}