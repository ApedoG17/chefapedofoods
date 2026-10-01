/**
 * lib/delivery/landmarks.ts
 *
 * Pre-verified GPS coordinates for campus landmarks in and around University of Ghana, Legon
 * and the Greater Accra Region. Used as the zero-latency fallback selector when OSM tiles
 * fail to load within the 4-second timeout window.
 *
 * All coordinates have been verified against Google Maps / OpenStreetMap references.
 * The kitchen anchor is South Legon Drive 6a (lat: 5.6265, lng: -0.1706).
 */

export type LandmarkCategory =
  | "Hostels"
  | "Halls"
  | "Campus"
  | "Gates & Markets"
  | "East Legon"
  | "Greater Accra";

export interface CampusLandmark {
  id: string;
  name: string;
  subtext: string;
  lat: number;
  lng: number;
  category: LandmarkCategory;
}

export const CAMPUS_LANDMARKS: CampusLandmark[] = [
  // ── Hostels ─────────────────────────────────────────────────────────────────
  {
    id: "evandy",
    name: "Evandy Hostel",
    subtext: "UG Legon Campus, near Pentagon & TF",
    lat: 5.6593,
    lng: -0.1932,
    category: "Hostels",
  },
  {
    id: "pentagon",
    name: "Pentagon Hostel (Blocks A, B, C)",
    subtext: "UG Legon Campus, North Legon",
    lat: 5.6582,
    lng: -0.1915,
    category: "Hostels",
  },
  {
    id: "tf-hostel",
    name: "TF Hostel (Hostel Annex)",
    subtext: "UG Legon Campus, near Pentagon",
    lat: 5.6575,
    lng: -0.1902,
    category: "Hostels",
  },
  {
    id: "bani",
    name: "Bani Hostel",
    subtext: "UG Legon Campus, near Pentagon",
    lat: 5.6601,
    lng: -0.1925,
    category: "Hostels",
  },
  {
    id: "au-hostel",
    name: "African Union (AU) Hostel",
    subtext: "UG Legon Campus",
    lat: 5.6565,
    lng: -0.1938,
    category: "Hostels",
  },
  {
    id: "jean-nelson-aka",
    name: "Jean Nelson Aka Hall",
    subtext: "UG Legon Campus, private hostel block",
    lat: 5.6548,
    lng: -0.1885,
    category: "Hostels",
  },
  {
    id: "alexander-kwapong",
    name: "Alexander Kwapong Hall",
    subtext: "UG Legon Campus",
    lat: 5.6552,
    lng: -0.1895,
    category: "Hostels",
  },
  {
    id: "hilla-limann",
    name: "Hilla Limann Hall",
    subtext: "UG Legon Campus",
    lat: 5.6560,
    lng: -0.1890,
    category: "Hostels",
  },
  {
    id: "ef-sey",
    name: "Elizabeth Frances Sey Hall",
    subtext: "UG Legon Campus",
    lat: 5.6555,
    lng: -0.1878,
    category: "Hostels",
  },

  // ── Traditional Halls ────────────────────────────────────────────────────────
  {
    id: "legon-hall",
    name: "Legon Hall",
    subtext: "University of Ghana Main Campus",
    lat: 5.6498,
    lng: -0.1876,
    category: "Halls",
  },
  {
    id: "akuafo",
    name: "Akuafo Hall",
    subtext: "University of Ghana Main Campus",
    lat: 5.6515,
    lng: -0.1872,
    category: "Halls",
  },
  {
    id: "commonwealth",
    name: "Commonwealth Hall (Vandals)",
    subtext: "University of Ghana Main Campus",
    lat: 5.6542,
    lng: -0.1856,
    category: "Halls",
  },
  {
    id: "volta",
    name: "Volta Hall",
    subtext: "University of Ghana Main Campus",
    lat: 5.6508,
    lng: -0.1858,
    category: "Halls",
  },
  {
    id: "sarbah",
    name: "Mensah Sarbah Hall",
    subtext: "University of Ghana Main Campus",
    lat: 5.6472,
    lng: -0.1895,
    category: "Halls",
  },

  // ── Campus Amenities ─────────────────────────────────────────────────────────
  {
    id: "balme-library",
    name: "Balme Library",
    subtext: "University of Ghana Main Campus",
    lat: 5.6510,
    lng: -0.1865,
    category: "Campus",
  },
  {
    id: "ug-cc",
    name: "UG Central Cafeteria (CC)",
    subtext: "University of Ghana Main Campus",
    lat: 5.6521,
    lng: -0.1879,
    category: "Campus",
  },
  {
    id: "ug-stadium",
    name: "UG Sports Stadium",
    subtext: "University of Ghana Campus",
    lat: 5.6415,
    lng: -0.1865,
    category: "Campus",
  },

  // ── Gates & Markets ───────────────────────────────────────────────────────────
  {
    id: "main-gate",
    name: "UG Main Gate",
    subtext: "Legon Bypass / N4 Highway",
    lat: 5.6438,
    lng: -0.1842,
    category: "Gates & Markets",
  },
  {
    id: "night-market",
    name: "Night Market (UG Legon)",
    subtext: "Food & Student Market, UG Legon",
    lat: 5.6558,
    lng: -0.1882,
    category: "Gates & Markets",
  },

  // ── East Legon ────────────────────────────────────────────────────────────────
  {
    id: "anc-mall",
    name: "A&C Mall",
    subtext: "Boundary Road, East Legon",
    lat: 5.6375,
    lng: -0.1558,
    category: "East Legon",
  },
  {
    id: "american-house",
    name: "American House",
    subtext: "Boundary Road / Lagos Ave, East Legon",
    lat: 5.6418,
    lng: -0.1532,
    category: "East Legon",
  },
  {
    id: "lagos-avenue",
    name: "Lagos Avenue",
    subtext: "East Legon commercial hub",
    lat: 5.6392,
    lng: -0.1610,
    category: "East Legon",
  },
  {
    id: "shiashie",
    name: "Shiashie",
    subtext: "East Legon / Tetteh Quarshie Interchange",
    lat: 5.6265,
    lng: -0.1742,
    category: "East Legon",
  },
  {
    id: "anagkazo",
    name: "Anagkazo / Mensvic Area",
    subtext: "East Legon",
    lat: 5.6315,
    lng: -0.1685,
    category: "East Legon",
  },

  // ── Greater Accra ─────────────────────────────────────────────────────────────
  {
    id: "accra-mall",
    name: "Accra Mall",
    subtext: "Tetteh Quarshie Interchange",
    lat: 5.6205,
    lng: -0.1745,
    category: "Greater Accra",
  },
  {
    id: "marina-mall",
    name: "Marina Mall",
    subtext: "Airport City, Accra",
    lat: 5.6025,
    lng: -0.1820,
    category: "Greater Accra",
  },
  {
    id: "airport-residential",
    name: "Airport Residential Area",
    subtext: "Accra",
    lat: 5.6080,
    lng: -0.1840,
    category: "Greater Accra",
  },
  {
    id: "madina",
    name: "Madina Zongo Junction",
    subtext: "Madina, Greater Accra",
    lat: 5.6730,
    lng: -0.1660,
    category: "Greater Accra",
  },
  {
    id: "osu",
    name: "Osu (Oxford Street)",
    subtext: "Osu, Accra",
    lat: 5.5560,
    lng: -0.1830,
    category: "Greater Accra",
  },
  {
    id: "cantonments",
    name: "Cantonments",
    subtext: "Accra",
    lat: 5.5820,
    lng: -0.1720,
    category: "Greater Accra",
  },
  {
    id: "spintex",
    name: "Spintex Road",
    subtext: "Batsonaa / Spintex, Accra",
    lat: 5.6320,
    lng: -0.1080,
    category: "Greater Accra",
  },
];

/** All unique categories in display order */
export const LANDMARK_CATEGORIES: LandmarkCategory[] = [
  "Hostels",
  "Halls",
  "Campus",
  "Gates & Markets",
  "East Legon",
  "Greater Accra",
];

/**
 * Filter landmarks by category and an optional search query.
 * Returns all landmarks when category is null (i.e. "All" tab).
 */
export function filterLandmarks(
  query: string,
  category: LandmarkCategory | null
): CampusLandmark[] {
  const clean = query.trim().toLowerCase();
  return CAMPUS_LANDMARKS.filter((lm) => {
    const matchesCategory = category === null || lm.category === category;
    const matchesQuery =
      clean === "" ||
      lm.name.toLowerCase().includes(clean) ||
      lm.subtext.toLowerCase().includes(clean) ||
      lm.category.toLowerCase().includes(clean);
    return matchesCategory && matchesQuery;
  });
}
