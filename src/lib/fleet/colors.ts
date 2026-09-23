import { MUNICIPALITIES } from "./routes";

const BY_ID = Object.fromEntries(MUNICIPALITIES.map((m) => [m.id, m.color]));
const BY_NAME = Object.fromEntries(MUNICIPALITIES.map((m) => [m.name.toLowerCase(), m.color]));

export const FALLBACK_BUS_COLOR = "#5B9DFF";

export function colorForRoute(routeId: string): string {
  return BY_ID[routeId] ?? FALLBACK_BUS_COLOR;
}

export function colorForTown(name: string): string {
  return BY_NAME[name.toLowerCase()] ?? FALLBACK_BUS_COLOR;
}
