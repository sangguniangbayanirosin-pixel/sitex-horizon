export function etaMinutes(remainingKm: number, speedKmh: number): number | null {
  if (speedKmh <= 1 || remainingKm <= 0) return null;
  return (remainingKm / speedKmh) * 60;
}

export function formatEta(mins: number | null): string {
  if (mins == null) return "—";
  if (mins < 1) return "<1 min";
  if (mins < 60) return `${Math.round(mins)} min`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatKm(km: number): string {
  if (km < 0.1) return "<0.1 km";
  return `${km.toFixed(1)} km`;
}

export function formatSpeed(kmh: number): string {
  return `${Math.round(kmh)} km/h`;
}
