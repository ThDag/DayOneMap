import type { LocationEntry } from "./data";

/**
 * Two years of an invented person's life in Istanbul, for trying the app without an export.
 * It uses a fixed seed, so every load gives the same stops. Home, work and the regular
 * spots are made up, and only the landmarks are real places.
 */

interface Place {
  name: string;
  district: string;
  lat: number;
  lng: number;
}

const place = (name: string, district: string, lat: number, lng: number): Place => ({
  name,
  district,
  lat,
  lng,
});

const HOME = place("Moda Apartment", "Kadıköy", 40.9835, 29.0265);
const OFFICE = place("Levent Office", "Beşiktaş", 41.079, 29.012);
const FAMILY = place("Family Home", "Bakırköy", 40.9775, 28.8695);
const OLD_GYM = place("Kadıköy Gym", "Kadıköy", 40.9905, 29.0345);
const NEW_GYM = place("Fenerbahçe Fitness", "Kadıköy", 40.9725, 29.0425);
const PIER_ASIA = place("Kadıköy Ferry Pier", "Kadıköy", 40.9925, 29.0225);
const PIER_EUROPE = place("Beşiktaş Ferry Pier", "Beşiktaş", 41.0415, 29.0065);
const GROCERY = place("Moda Market", "Kadıköy", 40.9855, 29.0285);
const ISLAND = place("Büyükada Guesthouse", "Adalar", 40.8745, 29.1283);
const AIRPORTS = [
  place("Istanbul Airport", "Arnavutköy", 41.2753, 28.7519),
  place("Sabiha Gökçen Airport", "Pendik", 40.8986, 29.3092),
];

const REGULARS = [
  place("Yeldeğirmeni Coffee", "Kadıköy", 40.9965, 29.0295),
  place("Moda Tea Garden", "Kadıköy", 40.9795, 29.0245),
  place("Corner Bookshop", "Beyoğlu", 41.0315, 28.9775),
  place("Karaköy Roastery", "Beyoğlu", 41.0245, 28.9775),
  place("Levent Lunch Hall", "Beşiktaş", 41.0775, 29.0145),
  place("Akaretler Bistro", "Beşiktaş", 41.0425, 29.0015),
];

const LANDMARKS = [
  place("Galata Tower", "Beyoğlu", 41.0256, 28.9741),
  place("Hagia Sophia", "Fatih", 41.0086, 28.9802),
  place("Blue Mosque", "Fatih", 41.0054, 28.9768),
  place("Topkapı Palace", "Fatih", 41.0115, 28.9833),
  place("Grand Bazaar", "Fatih", 41.0107, 28.9681),
  place("Spice Bazaar", "Fatih", 41.0165, 28.9706),
  place("Basilica Cistern", "Fatih", 41.0084, 28.9779),
  place("Balat", "Fatih", 41.0294, 28.9487),
  place("Taksim Square", "Beyoğlu", 41.037, 28.985),
  place("İstiklal Avenue", "Beyoğlu", 41.0336, 28.9777),
  place("Dolmabahçe Palace", "Beşiktaş", 41.0392, 29.0004),
  place("Ortaköy Mosque", "Beşiktaş", 41.0473, 29.027),
  place("Bebek Park", "Beşiktaş", 41.077, 29.0434),
  place("Rumeli Fortress", "Sarıyer", 41.0847, 29.0567),
  place("Emirgan Park", "Sarıyer", 41.1086, 29.0531),
  place("Belgrad Forest", "Sarıyer", 41.1757, 28.9868),
  place("Maiden's Tower", "Üsküdar", 41.0211, 29.0041),
  place("Çamlıca Hill", "Üsküdar", 41.0272, 29.0697),
  place("Haydarpaşa Station", "Kadıköy", 40.9969, 29.0194),
  place("Kadıköy Market", "Kadıköy", 40.9901, 29.0263),
  place("Bağdat Avenue", "Kadıköy", 40.9654, 29.0694),
];

const DISTRICTS: [string, number, number][] = [
  ["Kadıköy", 40.99, 29.03],
  ["Beşiktaş", 41.052, 29.012],
  ["Şişli", 41.06, 28.987],
  ["Beyoğlu", 41.034, 28.977],
  ["Fatih", 41.017, 28.95],
  ["Üsküdar", 41.025, 29.03],
  ["Bakırköy", 40.98, 28.872],
  ["Ataşehir", 40.992, 29.125],
  ["Sarıyer", 41.11, 29.03],
  ["Maltepe", 40.935, 29.13],
  ["Kartal", 40.89, 29.19],
  ["Zeytinburnu", 40.99, 28.905],
  ["Eyüp", 41.05, 28.935],
];

const STREETS = [
  "Çınar",
  "Lale",
  "Menekşe",
  "Gül",
  "Papatya",
  "Karanfil",
  "Ihlamur",
  "Söğüt",
  "Zambak",
  "Akasya",
  "Manolya",
  "Defne",
  "Nergis",
  "Sümbül",
];

const MINUTE = 60000;
const DAY = 24 * 60 * MINUTE;
const DAYS = 730;
const ISTANBUL_OFFSET = 3 * 60 * MINUTE;
const FIRST_MIDNIGHT = Date.UTC(2023, 2, 1) - ISTANBUL_OFFSET;
/** The gym changes partway through, so a regular place can stop being one. */
const GYM_CHANGE_DAY = 420;

function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateIstanbulStops(): LocationEntry[] {
  const random = seededRandom(20230301);
  const between = (min: number, max: number) => min + random() * (max - min);
  const chance = (probability: number) => random() < probability;
  const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];

  const randomStreet = (): Place => {
    const [district, lat, lng] = pick(DISTRICTS);
    return place(
      `${pick(STREETS)} Sk. ${Math.ceil(between(0, 90))}`,
      district,
      lat + between(-0.008, 0.008),
      lng + between(-0.01, 0.01),
    );
  };
  // A pool of streets that get revisited now and then, with some far more often than others.
  const streetPool = Array.from({ length: 220 }, randomStreet);
  const familiarStreet = () =>
    streetPool[Math.floor(random() ** 2 * streetPool.length)];
  const anySpot = () => (chance(0.65) ? familiarStreet() : randomStreet());

  const stops: LocationEntry[] = [];
  let cursor = FIRST_MIDNIGHT + 8 * 60 * MINUTE;

  /** Records a stay from now until `leave`, then moves the clock past the journey onward. */
  const stay = (spot: Place, leave: number) => {
    if (leave - cursor < 2 * MINUTE) return;
    const lat = +(spot.lat + between(-0.00012, 0.00012)).toFixed(5);
    const lng = +(spot.lng + between(-0.00012, 0.00012)).toFixed(5);
    const arrivalDate = new Date(cursor).toISOString().replace(".000", "");
    const departureDate = new Date(leave).toISOString().replace(".000", "");
    stops.push({
      uuid: `mock-istanbul-${stops.length + 1}`,
      location: {
        region: {
          center: { longitude: lng, latitude: lat },
          identifier: `<+${lat},+${lng}> radius 50`,
          radius: 50,
        },
        localityName: spot.district,
        country: "Turkey",
        timeZoneName: "Europe/Istanbul",
        administrativeArea: "Istanbul",
        longitude: lng,
        placeName: spot.name,
        latitude: lat,
      },
      arrivalDate,
      departureDate,
      horizontalAccuracy: +between(5, 40).toFixed(1),
      timestamp: departureDate,
    });
    cursor = leave + Math.round(between(8, 40)) * MINUTE;
  };
  const stayFor = (spot: Place, minutes: number) =>
    stay(spot, cursor + Math.round(minutes) * MINUTE);

  const workday = (midnight: number, day: number, weekday: number) => {
    stay(HOME, midnight + Math.round(between(450, 530)) * MINUTE);
    if (chance(0.3)) {
      stayFor(PIER_ASIA, between(8, 20));
      stayFor(PIER_EUROPE, between(4, 12));
    }
    stay(OFFICE, midnight + Math.round(between(725, 770)) * MINUTE);
    if (chance(0.6)) {
      stayFor(chance(0.6) ? REGULARS[4] : familiarStreet(), between(30, 65));
    }
    stay(OFFICE, midnight + Math.round(between(1050, 1150)) * MINUTE);
    const gymDay = weekday === 1 || weekday === 3 || weekday === 5;
    if (gymDay && chance(0.6)) {
      stayFor(day < GYM_CHANGE_DAY ? OLD_GYM : NEW_GYM, between(50, 90));
    }
    if (chance(weekday === 5 ? 0.6 : 0.2)) {
      stayFor(chance(0.4) ? pick(REGULARS) : anySpot(), between(60, 200));
    }
    if (chance(0.2)) stayFor(GROCERY, between(8, 25));
  };

  const weekend = (midnight: number, weekday: number) => {
    stay(HOME, midnight + Math.round(between(570, 760)) * MINUTE);
    if (weekday === 0 && chance(0.35)) {
      stayFor(FAMILY, between(180, 380));
      return;
    }
    const outings = Math.round(between(1, 4));
    for (let i = 0; i < outings; i += 1) {
      const roll = random();
      if (roll < 0.3) stayFor(pick(REGULARS), between(30, 120));
      else if (roll < 0.5) stayFor(pick(LANDMARKS), between(40, 180));
      else stayFor(anySpot(), between(10, 150));
    }
  };

  for (let day = 0; day < DAYS; day += 1) {
    const midnight = FIRST_MIDNIGHT + day * DAY;
    const weekday = new Date(midnight + ISTANBUL_OFFSET).getUTCDay();

    // Now and then a holiday: the airport, a stretch with no records, then the airport again.
    if (day > 30 && day < DAYS - 20 && chance(0.008)) {
      stay(HOME, midnight + 9 * 60 * MINUTE);
      stayFor(pick(AIRPORTS), between(90, 180));
      const nights = Math.round(between(4, 11));
      day += nights;
      cursor = midnight + nights * DAY + 15 * 60 * MINUTE;
      stayFor(pick(AIRPORTS), between(30, 70));
      continue;
    }
    // A weekend away on the islands, once in a while.
    if (weekday === 6 && chance(0.03)) {
      stay(HOME, midnight + 10 * 60 * MINUTE);
      stay(ISLAND, midnight + DAY + 16 * 60 * MINUTE);
      day += 1;
      continue;
    }
    // Some days aren't recorded at all, as with a real export.
    if (chance(0.02)) {
      cursor = Math.max(cursor, midnight + DAY + 7 * 60 * MINUTE);
      continue;
    }

    if (weekday === 0 || weekday === 6) weekend(midnight, weekday);
    else workday(midnight, day, weekday);
  }

  return stops;
}
