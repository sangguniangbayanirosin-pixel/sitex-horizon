import { haversineKm, inSorsogon } from "./geo";

export interface PhoneFix {
  lat: number;
  lng: number;
  speedKmh: number;
  accuracyM: number;
  heading: number | null;
  inProvince: boolean;
}

export function startPhoneWatch(
  onFix: (fix: PhoneFix) => void,
  onError: (message: string, fatal: boolean) => void,
): () => void {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onError("This phone has no GPS.", true);
    return () => undefined;
  }

  let last: { t: number; lat: number; lng: number } | null = null;

  const id = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude: lat, longitude: lng, speed, heading, accuracy } = pos.coords;
      const t = pos.timestamp || Date.now();
      let speedKmh = speed != null && Number.isFinite(speed) && speed >= 0 ? speed * 3.6 : -1;
      if (speedKmh < 0 && last) {
        const dtH = (t - last.t) / 3_600_000;
        if (dtH > 0.0003 && dtH < 0.02) {
          speedKmh = haversineKm({ lat: last.lat, lng: last.lng }, { lat, lng }) / dtH;
        }
      }
      if (speedKmh < 0) speedKmh = 0;
      last = { t, lat, lng };
      onFix({
        lat,
        lng,
        speedKmh: Math.min(120, speedKmh),
        accuracyM: accuracy,
        heading: heading != null && Number.isFinite(heading) ? heading : null,
        inProvince: inSorsogon({ lat, lng }),
      });
    },
    (err) => {
      if (err.code === 1) onError("Location permission denied. Turn on GPS and Allow.", true);
      else if (err.code === 2) onError("GPS unavailable. Try again outdoors.", false);
      else onError("GPS is slow. Keep the app open — it will catch up.", false);
    },
    { enableHighAccuracy: true, maximumAge: 4000, timeout: 25000 },
  );

  return () => navigator.geolocation.clearWatch(id);
}
