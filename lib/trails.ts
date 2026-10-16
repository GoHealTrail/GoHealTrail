/**
 * Trending trails. Stats and 7-day forecasts are a snapshot from AllTrails
 * (alltrails.com), captured on DATA_AS_OF. Replace with a live data source
 * before launch — forecasts go stale within days.
 */

export const DATA_AS_OF = "15 Oct 2026";

export type Difficulty = "Moderate" | "Hard" | "Strenuous";

export interface Trail {
  id: string;
  name: string;
  location: string;
  /** Exact name as listed on the Jabatan Perhutanan poster, if listed. */
  posterName?: string;
  posterState?: string;
  lengthKm: number;
  gainM: number;
  difficulty: Difficulty;
  rating: number;
  routeType: string;
  tags: string[];
  today: { high: number; low: number };
  heatAlert: boolean;
  url: string;
  /** Illustrative route shape for the topo card (not a real GPS track). */
  route: { d: string; start: [number, number]; end: [number, number]; peak: [number, number]; tilt: number };
}

export const TRAILS: Trail[] = [
  {
    id: "kinabalu",
    name: "Mount Kinabalu Trail",
    location: "Kinabalu Park, Sabah",
    lengthKm: 26.6,
    gainM: 2634,
    difficulty: "Strenuous",
    rating: 4.8,
    routeType: "Out & back",
    tags: ["Via ferrata", "Waterfall", "Birding", "Backpacking"],
    today: { high: 22, low: 16 },
    heatAlert: false,
    url: "https://www.alltrails.com/trail/malaysia/sabah/mount-kinabalu-trail",
    route: { d: "M20 165 C55 158 70 132 98 128 S138 112 150 92 S178 70 192 56 S214 36 231 28", start: [20, 165], end: [231, 28], peak: [228, 34], tilt: -14 },
  },
  {
    id: "datuk",
    name: "Gunung Tampin Utara – Gunung Datuk",
    location: "Negeri Sembilan",
    posterName: "Gunung Datuk",
    posterState: "Negeri Sembilan",
    lengthKm: 17.7,
    gainM: 1417,
    difficulty: "Hard",
    rating: 4.8,
    routeType: "Point to point",
    tags: ["Camping", "Waterfall", "River"],
    today: { high: 31, low: 22 },
    heatAlert: true,
    url: "https://www.alltrails.com/trail/malaysia/negeri-sembilan/gunung-tampin-utara-gunung-datuk",
    route: { d: "M18 128 C52 146 80 104 110 108 S150 134 176 98 S222 62 284 72", start: [18, 128], end: [284, 72], peak: [186, 84], tilt: 12 },
  },
  {
    id: "nuang",
    name: "Mount Nuang via Janda Baik",
    location: "Pahang",
    posterName: "Gunung Nuang",
    posterState: "Pahang",
    lengthKm: 12.7,
    gainM: 1017,
    difficulty: "Hard",
    rating: 4.7,
    routeType: "Out & back",
    tags: ["Waterfall", "River", "Wildlife"],
    today: { high: 30, low: 22 },
    heatAlert: true,
    url: "https://www.alltrails.com/trail/malaysia/pahang/mount-nuang-via-janda-baik",
    route: { d: "M30 152 C70 142 92 112 122 114 S152 72 172 62 S202 46 216 40", start: [30, 152], end: [216, 40], peak: [212, 44], tilt: -20 },
  },
  {
    id: "tabur",
    name: "Bukit Tabur via West Trail",
    location: "Selangor",
    lengthKm: 3.7,
    gainM: 348,
    difficulty: "Hard",
    rating: 4.6,
    routeType: "Out & back",
    tags: ["Ridge", "Lake views"],
    today: { high: 33, low: 23 },
    heatAlert: true,
    url: "https://www.alltrails.com/trail/malaysia/selangor/bukit-tabur-via-west-trail",
    route: { d: "M40 142 C70 122 92 126 112 102 S142 92 152 72 S176 60 184 50", start: [40, 142], end: [184, 50], peak: [166, 74], tilt: 16 },
  },
  {
    id: "mirror-lake",
    name: "Mirror Lake via Jalan Gunung Nuang",
    location: "Bukit Cherakah Forest Reserve, Selangor",
    lengthKm: 4.7,
    gainM: 311,
    difficulty: "Moderate",
    rating: 4.7,
    routeType: "Out & back",
    tags: ["Lake", "Birding"],
    today: { high: 33, low: 24 },
    heatAlert: true,
    url: "https://www.alltrails.com/trail/malaysia/selangor/tasik-cermin-melalui-jalan-gunung-nuang",
    route: { d: "M40 132 C80 122 100 142 140 116 S186 102 208 82", start: [40, 132], end: [208, 82], peak: [112, 66], tilt: -8 },
  },
];

/** Mount Kinabalu Trail 7-day forecast (°C), AllTrails, captured DATA_AS_OF. */
export const KINABALU_WEEK = [
  { d: "Thu", hi: 22, lo: 16 },
  { d: "Fri", hi: 22, lo: 16 },
  { d: "Sat", hi: 22, lo: 17 },
  { d: "Sun", hi: 23, lo: 16 },
  { d: "Mon", hi: 22, lo: 16 },
  { d: "Tue", hi: 22, lo: 16 },
  { d: "Wed", hi: 20, lo: 17 },
];
