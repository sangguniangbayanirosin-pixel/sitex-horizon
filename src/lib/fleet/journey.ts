import { etaMinutes } from "./eta";
import { MUNICIPALITIES } from "./routes";
import type { Bus, Municipality, Weather } from "./types";

const BOARDING_MIN = 8;

export function weatherSpeedFactor(weather: Weather): number {
  if (weather === "typhoon") return 0;
  if (weather === "rain") return 0.72;
  return 1;
}

export function rideMinutes(roadKm: number, cruiseKmh: number, weather: Weather): number | null {
  const speed = cruiseKmh * weatherSpeedFactor(weather);
  if (speed <= 1 || roadKm <= 0) return null;
  return (roadKm / speed) * 60;
}

export type Journey = {
  town: Municipality;
  bus: Bus | null;
  waitMin: number | null;
  rideMin: number | null;
  boardMin: number;
  totalMin: number | null;
  homeAt: number | null;
  suspended: boolean;
};

export function planJourney(
  destName: string,
  buses: Bus[],
  weather: Weather,
  now: number,
): Journey | null {
  const town = MUNICIPALITIES.find((m) => m.name === destName);
  if (!town) return null;
  const suspended = weather === "typhoon";
  const rideMin = rideMinutes(town.roadKm, town.cruiseKmh, weather);
  const candidates = buses
    .filter((b) => b.destination === destName)
    .map((b) => ({
      b,
      eta: b.status === "idle" || b.status === "arrived" ? 0 : etaMinutes(b.remainingKm, b.speedKmh),
    }))
    .sort((a, c) => (a.eta ?? 9999) - (c.eta ?? 9999));
  const next = candidates[0];
  const waitMin = next ? (next.eta ?? null) : null;
  const atBay = next && (next.b.status === "idle" || next.b.status === "arrived");
  const boardMin = atBay ? 5 : BOARDING_MIN;
  let totalMin: number | null = null;
  if (!suspended && rideMin != null && waitMin != null) {
    totalMin = waitMin + boardMin + rideMin;
  } else if (!suspended && rideMin != null && waitMin == null) {
    totalMin = boardMin + rideMin;
  }
  return {
    town,
    bus: next?.b ?? null,
    waitMin,
    rideMin,
    boardMin,
    totalMin,
    homeAt: totalMin != null ? now + totalMin * 60_000 : null,
    suspended,
  };
}

export function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}
