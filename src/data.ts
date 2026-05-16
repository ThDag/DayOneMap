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

export interface LoadResult {
  data: LocationEntry[];
  usingMock: boolean;
}

const mockData: LocationEntry[] = [
  {
    uuid: "mock-1",
    location: {
      region: {
        center: { longitude: -73.9857, latitude: 40.7484 },
        identifier: "<+40.7484,-73.9857> radius 50",
        radius: 50,
      },
      localityName: "New York",
      country: "United States",
      timeZoneName: "America/New_York",
      administrativeArea: "New York",
      longitude: -73.9857,
      placeName: "Empire State Building",
      latitude: 40.7484,
    },
    arrivalDate: "2024-06-15T09:00:00Z",
    departureDate: "2024-06-15T11:30:00Z",
    horizontalAccuracy: 20,
    timestamp: "2024-06-15T11:30:00Z",
  },
  {
    uuid: "mock-2",
    location: {
      region: {
        center: { longitude: -0.1276, latitude: 51.5074 },
        identifier: "<+51.5074,-0.1276> radius 50",
        radius: 50,
      },
      localityName: "London",
      country: "United Kingdom",
      timeZoneName: "Europe/London",
      administrativeArea: "England",
      longitude: -0.1276,
      placeName: "Big Ben",
      latitude: 51.5074,
    },
    arrivalDate: "2024-07-20T14:00:00Z",
    departureDate: "2024-07-20T16:45:00Z",
    horizontalAccuracy: 15,
    timestamp: "2024-07-20T16:45:00Z",
  },
  {
    uuid: "mock-3",
    location: {
      region: {
        center: { longitude: 2.2945, latitude: 48.8584 },
        identifier: "<+48.8584,2.2945> radius 50",
        radius: 50,
      },
      localityName: "Paris",
      country: "France",
      timeZoneName: "Europe/Paris",
      administrativeArea: "Île-de-France",
      longitude: 2.2945,
      placeName: "Eiffel Tower",
      latitude: 48.8584,
    },
    arrivalDate: "2024-08-10T10:00:00Z",
    departureDate: "2024-08-10T13:15:00Z",
    horizontalAccuracy: 10,
    timestamp: "2024-08-10T13:15:00Z",
  },
  {
    uuid: "mock-4",
    location: {
      region: {
        center: { longitude: 139.6917, latitude: 35.6895 },
        identifier: "<+35.6895,139.6917> radius 50",
        radius: 50,
      },
      localityName: "Tokyo",
      country: "Japan",
      timeZoneName: "Asia/Tokyo",
      administrativeArea: "Tokyo",
      longitude: 139.6917,
      placeName: "Shibuya Crossing",
      latitude: 35.6895,
    },
    arrivalDate: "2024-09-05T08:00:00Z",
    departureDate: "2024-09-05T09:30:00Z",
    horizontalAccuracy: 12,
    timestamp: "2024-09-05T09:30:00Z",
  },
  {
    uuid: "mock-5",
    location: {
      region: {
        center: { longitude: 151.2093, latitude: -33.8688 },
        identifier: "<-33.8688,151.2093> radius 50",
        radius: 50,
      },
      localityName: "Sydney",
      country: "Australia",
      timeZoneName: "Australia/Sydney",
      administrativeArea: "New South Wales",
      longitude: 151.2093,
      placeName: "Sydney Opera House",
      latitude: -33.8688,
    },
    arrivalDate: "2024-10-12T15:00:00Z",
    departureDate: "2024-10-12T17:00:00Z",
    horizontalAccuracy: 18,
    timestamp: "2024-10-12T17:00:00Z",
  },
];

export async function loadLocations(): Promise<LoadResult> {
  try {
    const res = await fetch("/places.json");
    if (!res.ok) {
      if (res.status === 404) {
        console.info(
          "No places.json found — using mock data. Add your own at public/places.json",
        );
        return { data: mockData, usingMock: true };
      }
      throw new Error(`Failed to load places.json (${res.status})`);
    }
    return { data: await res.json(), usingMock: false };
  } catch {
    console.info(
      "Could not load places.json — using mock data. Add your own at public/places.json",
    );
    return { data: mockData, usingMock: true };
  }
}