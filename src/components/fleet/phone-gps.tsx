import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  isDriverGpsLive,
  startDriverGps,
  stopDriverGps,
  subscribeDriverGps,
} from "@/lib/fleet/driver-gps";
import { useFleet } from "@/lib/fleet/store";

export function PhoneGps({ busId }: { busId: string }) {
  const bus = useFleet((s) => s.buses.find((b) => b.id === busId));
  const [on, setOn] = useState(isDriverGpsLive);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => subscribeDriverGps((live, error) => {
    setOn(live);
    setErr(error);
  }), []);

  return (
    <div className="rounded-lg border border-border bg-bg/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Phone GPS</p>
      <p className="mt-1 text-sm text-muted">
        Uses this phone’s built-in GPS — latitude, longitude, and speed. Leave this app in the
        background if you open another app. Do not swipe it closed.
      </p>
      <Button
        className="mt-3 w-full"
        variant={on ? "secondary" : "default"}
        onClick={() => {
          if (on) stopDriverGps();
          else startDriverGps(busId);
        }}
      >
        {on ? "Stop sharing location" : "Share live GPS"}
      </Button>
      {on && bus && (
        <p className="mt-2 font-mono text-xs text-accent">
          {bus.lat.toFixed(5)}, {bus.lng.toFixed(5)} · {Math.round(bus.speedKmh)} km/h
          {bus.gpsAccuracyM != null ? ` · ±${Math.round(bus.gpsAccuracyM)} m` : ""}
          {bus.gpsSource === "phone" ? " · live phone" : ""}
        </p>
      )}
      {err && <p className="mt-2 text-sm text-danger">{err}</p>}
    </div>
  );
}
