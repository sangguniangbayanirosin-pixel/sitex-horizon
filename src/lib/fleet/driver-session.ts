import { PLATES } from "./routes";
import type { Bus } from "./types";

const KEY = "sitex-driver-claim";

export type DriverClaim = {
  busId: string;
  plate: string;
  claimedAt: number;
};

function normalizePlate(plate: string) {
  return plate.replace(/[\s-]/g, "").toUpperCase();
}

/** Cooperative-issued 4-digit trip code. Not shown on the public board. */
export function tripCodeFor(plate: string): string {
  let h = 2166136261;
  for (const c of normalizePlate(plate)) {
    h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  }
  return String(1000 + (Math.abs(h) % 9000));
}

export const STAFF_TRIP_CODES = PLATES.map((plate) => ({
  plate,
  code: tripCodeFor(plate),
}));

export function findBusByPlate(buses: Bus[], plate: string): Bus | undefined {
  const n = normalizePlate(plate);
  return buses.find((b) => normalizePlate(b.plate) === n);
}

export function loadClaim(): DriverClaim | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DriverClaim;
    if (!parsed?.busId || !parsed.plate) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveClaim(claim: DriverClaim) {
  try {
    localStorage.setItem(KEY, JSON.stringify(claim));
  } catch {
    /* quota */
  }
}

export function clearClaim() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function verifyTripCode(plate: string, code: string): boolean {
  const expected = tripCodeFor(plate);
  return code.replace(/\s/g, "") === expected;
}
