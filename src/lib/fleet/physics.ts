import { alongOfficialRoute } from "./geo";
import type { Bus, Weather } from "./types";

function weatherFactor(weather: Weather): number {
  if (weather === "typhoon") return 0;
  if (weather === "rain") return 0.72;
  return 1;
}

export function stepBus(bus: Bus, dtSec: number, weather: Weather, now: number): Bus {
  if (bus.status === "idle" || bus.status === "arrived") return bus;
  if (weather === "typhoon") {
    return { ...bus, status: "suspended", speedKmh: 0, targetSpeedKmh: 0, lastFixAt: now };
  }

  const factor = weatherFactor(weather);
  const target = bus.driverControlled ? bus.targetSpeedKmh : bus.cruiseKmh * factor;
  const speed = bus.speedKmh + (target - bus.speedKmh) * Math.min(1, dtSec * 1.4);
  const remaining = Math.max(0, bus.remainingKm - (speed * dtSec) / 3600);
  const traveled = bus.totalKm - remaining;
  const pos = alongOfficialRoute(bus.waypoints, traveled, bus.totalKm);
  const delayed = speed < bus.cruiseKmh * 0.72;
  const status: Bus["status"] =
    remaining <= 0.05 ? "arrived" : delayed ? "delayed" : "en-route";

  return {
    ...bus,
    speedKmh: speed,
    remainingKm: remaining,
    lat: pos.lat,
    lng: pos.lng,
    heading: pos.heading,
    lastFixAt: bus.lastFixAt,
    status,
  };
}

export function recycleArrived(bus: Bus, now: number): Bus {
  if (bus.status !== "arrived") return bus;
  if (bus.driverControlled || bus.gpsSource === "phone") return bus;
  const remaining = bus.totalKm * 0.96;
  const pos = alongOfficialRoute(bus.waypoints, bus.totalKm - remaining, bus.totalKm);
  return {
    ...bus,
    remainingKm: remaining,
    status: "en-route",
    speedKmh: bus.cruiseKmh,
    targetSpeedKmh: bus.cruiseKmh,
    lat: pos.lat,
    lng: pos.lng,
    heading: pos.heading,
    lastFixAt: now,
    driverControlled: false,
    gpsSource: "sim",
    gpsAccuracyM: null,
  };
}
