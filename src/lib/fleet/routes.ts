import type { Bus, LatLng, Municipality, RouteDef } from "./types";
import { alongOfficialRoute } from "./geo";

/** Sitex / SM Sorsogon Integrated Terminal Exchange, Balogo */
export const SITEX: LatLng = { lat: 12.9735, lng: 123.9928 };

/**
 * All Sorsogon LGUs. Road km are official DENR distances from the capital
 * (Sorsogon City / SITEX corridor). Coordinates: poblacion / municipal hall.
 */
export const MUNICIPALITIES: Municipality[] = [
  { id: "sorsogon", name: "Sorsogon", zip: "4700", roadKm: 3.2, lat: 12.9707, lng: 124.0052, via: "City proper", cruiseKmh: 28, color: "#5B9DFF" },
  { id: "bacon", name: "Bacon", zip: "4701", roadKm: 10.7, lat: 13.0378, lng: 124.041, via: "Bacon Rd", cruiseKmh: 40, color: "#FF6B9D" },
  { id: "casiguran", name: "Casiguran", zip: "4702", roadKm: 19.03, lat: 12.8734, lng: 124.0093, via: "Maharlika Hwy", cruiseKmh: 48, color: "#7CFF6B" },
  { id: "juban", name: "Juban", zip: "4703", roadKm: 23.05, lat: 12.8476, lng: 123.9894, via: "Maharlika Hwy", cruiseKmh: 50, color: "#C77DFF" },
  { id: "bulusan", name: "Bulusan", zip: "4704", roadKm: 42.52, lat: 12.7518, lng: 124.1371, via: "Gubat–Barcelona", cruiseKmh: 46, color: "#2EE6C8" },
  { id: "magallanes", name: "Magallanes", zip: "4705", roadKm: 48.13, lat: 12.8271, lng: 123.8371, via: "Juban", cruiseKmh: 48, color: "#FF8A3D" },
  { id: "bulan", name: "Bulan", zip: "4706", roadKm: 63.09, lat: 12.6677, lng: 123.8775, via: "Irosin", cruiseKmh: 52, color: "#6B7CFF" },
  { id: "irosin", name: "Irosin", zip: "4707", roadKm: 43.35, lat: 12.7023, lng: 124.0341, via: "Maharlika Hwy", cruiseKmh: 52, color: "#FFE14A" },
  { id: "matnog", name: "Matnog", zip: "4708", roadKm: 66.64, lat: 12.5861, lng: 124.0856, via: "Irosin", cruiseKmh: 55, color: "#FF3B3B" },
  { id: "sta-magdalena", name: "Sta. Magdalena", zip: "4709", roadKm: 71.97, lat: 12.6463, lng: 124.1079, via: "Bulusan coastal", cruiseKmh: 50, color: "#3DFF8A" },
  { id: "gubat", name: "Gubat", zip: "4710", roadKm: 19.16, lat: 12.9178, lng: 124.1241, via: "Coastal Road", cruiseKmh: 46, color: "#00D4FF" },
  { id: "prieto-diaz", name: "Prieto Diaz", zip: "4711", roadKm: 34.4, lat: 13.0406, lng: 124.1932, via: "Bacon–Pacific", cruiseKmh: 44, color: "#FF4DC4" },
  { id: "barcelona", name: "Barcelona", zip: "4712", roadKm: 27.13, lat: 12.8663, lng: 124.1451, via: "Gubat coastal", cruiseKmh: 46, color: "#3B6BFF" },
  { id: "castilla", name: "Castilla", zip: "4713", roadKm: 25.11, lat: 12.9501, lng: 123.8789, via: "West coastal", cruiseKmh: 48, color: "#B347FF" },
  { id: "pilar", name: "Pilar", zip: "4714", roadKm: 55.69, lat: 12.9231, lng: 123.6741, via: "Castilla", cruiseKmh: 50, color: "#FFB347" },
  { id: "donsol", name: "Donsol", zip: "4715", roadKm: 66.47, lat: 12.9077, lng: 123.5986, via: "Pilar–Castilla", cruiseKmh: 52, color: "#1DB954" },
];

const M = Object.fromEntries(MUNICIPALITIES.map((m) => [m.id, m])) as Record<string, Municipality>;

function town(id: string): LatLng {
  return { lat: M[id].lat, lng: M[id].lng };
}

function toSitex(...ids: string[]): LatLng[] {
  return [...ids.map(town), SITEX];
}

export const TOWNS: { name: string; lat: number; lng: number; zip: string; roadKm: number }[] = [
  { name: "SITEX", lat: SITEX.lat, lng: SITEX.lng, zip: "4700", roadKm: 0 },
  ...MUNICIPALITIES.map((m) => ({
    name: m.name,
    lat: m.lat,
    lng: m.lng,
    zip: m.zip,
    roadKm: m.roadKm,
  })),
];

const VIA: Record<string, string[]> = {
  sorsogon: ["sorsogon"],
  bacon: ["bacon"],
  casiguran: ["casiguran"],
  juban: ["juban", "casiguran"],
  bulusan: ["bulusan", "barcelona", "gubat"],
  magallanes: ["magallanes", "juban", "casiguran"],
  bulan: ["bulan", "irosin", "juban", "casiguran"],
  irosin: ["irosin", "juban", "casiguran"],
  matnog: ["matnog", "irosin", "juban", "casiguran"],
  "sta-magdalena": ["sta-magdalena", "bulusan", "barcelona", "gubat"],
  gubat: ["gubat"],
  "prieto-diaz": ["prieto-diaz", "bacon"],
  barcelona: ["barcelona", "gubat"],
  castilla: ["castilla"],
  pilar: ["pilar", "castilla"],
  donsol: ["donsol", "pilar", "castilla"],
};

export const ROUTES: RouteDef[] = MUNICIPALITIES.map((m) => ({
  id: m.id,
  destination: m.name,
  zip: m.zip,
  via: m.via,
  waypoints: toSitex(...(VIA[m.id] ?? [m.id])),
  cruiseKmh: m.cruiseKmh,
  roadKm: m.roadKm,
}));

const OPERATORS = [
  "Penafrancia Tours",
  "Bicol Isarog",
  "Raymond Transport",
  "Cagsawa",
  "Sorsogon Cooperative",
  "JVH Liner",
  "Pamar Tours",
];

export const PLATES = [
  "7G-4821",
  "SBC-1104",
  "EAA-2209",
  "FBT-3318",
  "GSC-4472",
  "HND-5510",
  "JLP-6623",
  "KMR-7701",
  "LNV-8834",
  "MPQ-9940",
  "NRS-1027",
  "PTU-2156",
  "QVW-3288",
  "RXZ-4311",
  "SYA-5480",
  "TZB-6592",
];

export function createInitialBuses(now: number): Bus[] {
  return ROUTES.map((route, i) => {
    const frac = 0.18 + ((i * 17) % 70) / 100;
    const remaining = Math.max(0.4, route.roadKm * (1 - frac));
    const pos = alongOfficialRoute(route.waypoints, route.roadKm - remaining, route.roadKm);
    const delayed = i % 5 === 2;
    const speed = delayed ? route.cruiseKmh * 0.55 : route.cruiseKmh;
    return {
      id: PLATES[i],
      plate: PLATES[i],
      operator: OPERATORS[i % OPERATORS.length],
      routeId: route.id,
      destination: route.destination,
      zip: route.zip,
      via: route.via,
      totalKm: route.roadKm,
      remainingKm: remaining,
      speedKmh: speed,
      targetSpeedKmh: speed,
      cruiseKmh: route.cruiseKmh,
      status: delayed ? "delayed" : "en-route",
      lat: pos.lat,
      lng: pos.lng,
      heading: pos.heading,
      lastFixAt: now,
      waypoints: route.waypoints,
      driverControlled: false,
      gpsSource: "sim",
      gpsAccuracyM: null,
    } satisfies Bus;
  });
}
