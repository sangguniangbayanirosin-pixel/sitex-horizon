import { startPhoneWatch } from "./gps";
import { useFleet } from "./store";

type GpsListener = (live: boolean, error: string | null) => void;

let stopWatch: (() => void) | null = null;
let busId: string | null = null;
let wake: WakeLockSentinel | null = null;
let lastError: string | null = null;
const listeners = new Set<GpsListener>();

function notify() {
  const live = stopWatch != null;
  for (const fn of listeners) fn(live, lastError);
}

async function lockScreen() {
  try {
    wake = (await navigator.wakeLock?.request("screen")) ?? null;
  } catch {
    wake = null;
  }
}

export function isDriverGpsLive() {
  return stopWatch != null;
}

export function driverGpsBusId() {
  return busId;
}

export function subscribeDriverGps(fn: GpsListener) {
  listeners.add(fn);
  fn(stopWatch != null, lastError);
  return () => {
    listeners.delete(fn);
  };
}

export function startDriverGps(id: string) {
  stopWatch?.();
  busId = id;
  lastError = null;
  stopWatch = startPhoneWatch(
    (fix) => {
      if (!busId) return;
      lastError = null;
      useFleet.getState().applyPhoneFix(busId, fix);
      notify();
    },
    (message, fatal) => {
      lastError = message;
      notify();
      if (fatal) stopDriverGps();
    },
  );
  void lockScreen();
  notify();
}

export function stopDriverGps() {
  stopWatch?.();
  stopWatch = null;
  if (busId) useFleet.getState().stopPhoneGps(busId);
  busId = null;
  void wake?.release().catch(() => undefined);
  wake = null;
  notify();
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && stopWatch) void lockScreen();
  });
}
