import type { LatLng } from "./types";

const R = 6371;

function rad(d: number) {
  return (d * Math.PI) / 180;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function bearing(a: LatLng, b: LatLng): number {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat));
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function polylineLengthKm(points: LatLng[]): number {
  let km = 0;
  for (let i = 1; i < points.length; i++) km += haversineKm(points[i - 1], points[i]);
  return km;
}

function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

export function alongOfficialRoute(
  waypoints: LatLng[],
  traveledKm: number,
  officialTotalKm: number,
): LatLng & { heading: number } {
  const t = officialTotalKm <= 0 ? 1 : Math.min(1, Math.max(0, traveledKm / officialTotalKm));
  return pointAtFraction(waypoints, t);
}

export function pointAtFraction(waypoints: LatLng[], t: number): LatLng & { heading: number } {
  if (waypoints.length === 0) return { lat: 0, lng: 0, heading: 0 };
  if (waypoints.length === 1) return { ...waypoints[0], heading: 0 };
  const total = polylineLengthKm(waypoints);
  const target = Math.min(1, Math.max(0, t)) * total;
  let acc = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const a = waypoints[i - 1];
    const b = waypoints[i];
    const seg = haversineKm(a, b);
    if (acc + seg >= target || i === waypoints.length - 1) {
      const u = seg > 0 ? (target - acc) / seg : 1;
      const p = lerp(a, b, Math.min(1, Math.max(0, u)));
      return { ...p, heading: bearing(a, b) };
    }
    acc += seg;
  }
  const last = waypoints[waypoints.length - 1];
  const prev = waypoints[waypoints.length - 2];
  return { ...last, heading: bearing(prev, last) };
}

export function nearestOnPolyline(waypoints: LatLng[], p: LatLng) {
  const totalKm = polylineLengthKm(waypoints);
  if (waypoints.length < 2) {
    return { ...waypoints[0], remainingKm: totalKm, totalKm, heading: 0 };
  }
  let bestD = Infinity;
  let bestT = 0;
  let best: LatLng = waypoints[0];
  let bestHeading = 0;
  let acc = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const a = waypoints[i - 1];
    const b = waypoints[i];
    const seg = haversineKm(a, b);
    const samples = Math.max(4, Math.ceil(seg * 4));
    for (let s = 0; s <= samples; s++) {
      const u = s / samples;
      const q = lerp(a, b, u);
      const d = haversineKm(p, q);
      if (d < bestD) {
        bestD = d;
        best = q;
        bestT = acc + seg * u;
        bestHeading = bearing(a, b);
      }
    }
    acc += seg;
  }
  return {
    ...best,
    remainingKm: Math.max(0, totalKm - bestT),
    totalKm,
    heading: bestHeading,
  };
}

/** Sorsogon province envelope for phone GPS sanity. */
export function inSorsogon(p: LatLng): boolean {
  return p.lat >= 12.52 && p.lat <= 13.12 && p.lng >= 123.52 && p.lng <= 124.28;
}
