import { create } from "zustand";
import type {
  Advertisement,
  Announcement,
  AnnouncementLevel,
  Bus,
  ComingAsk,
  PassengerReport,
  ReportCategory,
  Weather,
} from "./types";
import { createInitialBuses } from "./routes";
import { recycleArrived, stepBus } from "./physics";
import { alongOfficialRoute, nearestOnPolyline } from "./geo";
import type { PhoneFix } from "./gps";
import { deleteAdBlob } from "./ads-media";
import { attachWaypoints, claimAskRemote, confirmAskRemote, forwardReport, pullLiveFleet, pushAd, pushAnnouncement, pushAsk, pushBusFix, pushReport, pushWeather, revokeAskRemote, type BusWire, type LiveSnapshot } from "./sync";

const DEFAULT_ANNOUNCEMENT: Announcement = {
  level: "none",
  title: "",
  body: "",
  showHotlines: false,
  updatedAt: 0,
};

export const DEFAULT_ADS: Advertisement[] = [
  {
    id: "ad-welcome",
    kind: "video",
    src: "/sitex-terminal.mp4",
    posterSrc: "/sitex-terminal.jpg",
    sponsor: "SM Sorsogon",
    headline: "Welcome to SITEX",
    caption: "Sorsogon Integrated Terminal Exchange — live arrivals for every waiting passenger.",
    ctaLabel: "Live board",
    ctaUrl: "/",
    dwellSec: 18,
    active: true,
    updatedAt: 0,
  },
  {
    id: "ad-partners",
    kind: "poster",
    src: "/sitex-photo.jpg",
    sponsor: "SITEX Partners",
    headline: "Your brand. This screen.",
    caption: "Poster or HD video ads reach passengers from all 16 Sorsogon LGUs. Inquire at Sitex admin.",
    ctaLabel: "Partner with us",
    ctaUrl: "/admin",
    dwellSec: 12,
    active: true,
    updatedAt: 0,
  },
];

interface FleetState {
  buses: Bus[];
  announcement: Announcement;
  reports: PassengerReport[];
  ads: Advertisement[];
  asks: ComingAsk[];
  weather: Weather;
  now: number;
  online: boolean;
  selectedBusId: string | null;
  hydrated: boolean;
  cloud: boolean;
  tick: (dtSec: number) => void;
  setOnline: (online: boolean) => void;
  setWeather: (weather: Weather) => void;
  publishAnnouncement: (a: Omit<Announcement, "updatedAt">) => void;
  selectBus: (id: string | null) => void;
  setDriverSpeed: (id: string, kmh: number) => void;
  startTrip: (id: string) => void;
  endTrip: (id: string) => void;
  applyPhoneFix: (id: string, fix: PhoneFix) => void;
  stopPhoneGps: (id: string) => void;
  addReport: (input: {
    category: ReportCategory;
    route: string;
    description: string;
    anonymous: boolean;
  }) => string;
  updateReport: (id: string, status: PassengerReport["status"], forwardedTo?: string) => void;
  upsertAd: (ad: Advertisement) => void;
  toggleAd: (id: string, active: boolean) => void;
  removeAd: (id: string) => void;
  askIfComing: (busId: string) => void;
  confirmAsk: (id: string) => void;
  revokeAsk: (id: string) => void;
}

function loadReports(): PassengerReport[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem("sitex-reports");
    return raw ? (JSON.parse(raw) as PassengerReport[]) : [];
  } catch {
    return [];
  }
}

function loadAnnouncement(): Announcement {
  if (typeof localStorage === "undefined") return DEFAULT_ANNOUNCEMENT;
  try {
    const raw = localStorage.getItem("sitex-announcement");
    return raw ? (JSON.parse(raw) as Announcement) : DEFAULT_ANNOUNCEMENT;
  } catch {
    return DEFAULT_ANNOUNCEMENT;
  }
}

function loadAds(): Advertisement[] {
  if (typeof localStorage === "undefined") return DEFAULT_ADS;
  try {
    const raw = localStorage.getItem("sitex-ads");
    if (!raw) return DEFAULT_ADS;
    const parsed = JSON.parse(raw) as Advertisement[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ADS;
  } catch {
    return DEFAULT_ADS;
  }
}

function loadAsks(): ComingAsk[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem("sitex-asks");
    return raw
      ? (JSON.parse(raw) as ComingAsk[]).map((a) => ({
          ...a,
          updatedAt: a.updatedAt || a.askedAt,
        }))
      : [];
  } catch {
    return [];
  }
}

function persistAsks(asks: ComingAsk[]) {
  try {
    localStorage.setItem("sitex-asks", JSON.stringify(asks.slice(0, 80)));
  } catch {
    /* quota */
  }
}

function isOpenAsk(a: ComingAsk) {
  return a.status === "pending" || a.status === "confirmed";
}

function openAskFor(asks: ComingAsk[], busId: string) {
  return asks.find((a) => a.busId === busId && isOpenAsk(a));
}

function mergeAsks(local: ComingAsk[], remote: ComingAsk[]): ComingAsk[] {
  const byId = new Map<string, ComingAsk>();
  for (const a of [...local, ...remote]) {
    const cur = byId.get(a.id);
    if (!cur || (a.updatedAt || 0) >= (cur.updatedAt || 0)) byId.set(a.id, a);
  }
  const byBus = new Map<string, ComingAsk>();
  const rest: ComingAsk[] = [];
  for (const a of byId.values()) {
    if (!isOpenAsk(a)) {
      rest.push(a);
      continue;
    }
    const cur = byBus.get(a.busId);
    if (!cur) {
      byBus.set(a.busId, a);
      continue;
    }
    if (a.status === "confirmed" && cur.status !== "confirmed") {
      byBus.set(a.busId, a);
      rest.push({ ...cur, status: "expired", updatedAt: a.updatedAt });
    } else if (cur.status === "confirmed" && a.status !== "confirmed") {
      rest.push({ ...a, status: "expired", updatedAt: cur.updatedAt });
    } else if (a.askedAt <= cur.askedAt) {
      byBus.set(a.busId, a);
      rest.push({ ...cur, status: "expired", updatedAt: a.updatedAt });
    } else {
      rest.push({ ...a, status: "expired", updatedAt: cur.updatedAt });
    }
  }
  return [...byBus.values(), ...rest].sort((a, b) => b.askedAt - a.askedAt);
}

function toWire(b: Bus): BusWire {
  const { waypoints: _w, ...wire } = b;
  return wire;
}

function mergeAds(local: Advertisement[], remote: Advertisement[]): Advertisement[] {
  const map = new Map<string, Advertisement>();
  for (const a of local) map.set(a.id, a);
  for (const a of remote) {
    const cur = map.get(a.id);
    if (!cur || a.updatedAt >= cur.updatedAt) map.set(a.id, a);
  }
  return [...map.values()];
}

function applyRemote(remote: LiveSnapshot) {
  const local = useFleet.getState();
  const byId = new Map(local.buses.map((b) => [b.id, b]));
  for (const w of remote.buses) {
    const cur = byId.get(w.id);
    if (preferRemoteBus(cur, w)) {
      byId.set(w.id, attachWaypoints({ ...(cur ?? w), ...w }));
    }
  }
  useFleet.setState({
    cloud: true,
    buses: [...byId.values()],
    announcement:
      remote.announcement.updatedAt >= local.announcement.updatedAt
        ? remote.announcement
        : local.announcement,
    weather: remote.weather || local.weather,
    reports: remote.reports.length ? remote.reports : local.reports,
    ads: mergeAds(local.ads, remote.ads),
    asks: mergeAsks(local.asks, remote.asks ?? []),
  });
  persistAsks(useFleet.getState().asks);
}

async function pullCloud() {
  try {
    applyRemote(await pullLiveFleet());
  } catch (err) {
    console.error("[sitex] live pull failed", err);
    useFleet.setState({ cloud: false });
  }
}

function preferRemoteBus(cur: Bus | undefined, w: BusWire): boolean {
  if (!cur) return true;
  const remotePhone = w.gpsSource === "phone" || w.driverControlled;
  const localPhone = cur.gpsSource === "phone" || cur.driverControlled;
  if (remotePhone && !localPhone) return true;
  if (localPhone && !remotePhone) return false;
  return w.lastFixAt >= cur.lastFixAt;
}

const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();

function pushBusSoon(id: string, immediate = false) {
  const fire = () => {
    pushTimers.delete(id);
    const bus = useFleet.getState().buses.find((b) => b.id === id);
    if (!bus) return;
    void pushBusFix({ data: toWire(bus) }).catch(() => {
      useFleet.setState({ cloud: false });
    });
  };
  const pending = pushTimers.get(id);
  if (pending) clearTimeout(pending);
  if (immediate) {
    fire();
    return;
  }
  pushTimers.set(id, setTimeout(fire, 1600));
}

function persistAds(ads: Advertisement[]) {
  try {
    localStorage.setItem("sitex-ads", JSON.stringify(ads));
  } catch {
    /* quota */
  }
}

function statusFromSpeed(bus: Bus, kmh: number): Bus["status"] {
  if (bus.status === "idle" || bus.status === "arrived" || bus.status === "suspended") {
    return bus.status;
  }
  if (kmh < bus.cruiseKmh * 0.72) return "delayed";
  return "en-route";
}

const seedNow = 0;

export const useFleet = create<FleetState>((set, get) => ({
  buses: createInitialBuses(seedNow),
  announcement: DEFAULT_ANNOUNCEMENT,
  reports: [],
  ads: DEFAULT_ADS,
  asks: [],
  weather: "clear",
  now: seedNow,
  online: true,
  selectedBusId: "7G-4821",
  hydrated: false,
  cloud: false,
  tick: (dtSec) => {
    const now = Date.now();
    const { buses, weather, asks } = get();
    const stepped = buses.map((b) => stepBus(b, dtSec, weather, now));
    const arrivedIds = new Set(stepped.filter((b) => b.status === "arrived").map((b) => b.id));
    let nextAsks = asks;
    if (arrivedIds.size) {
      nextAsks = asks.map((a) =>
        arrivedIds.has(a.busId) && isOpenAsk(a)
          ? { ...a, status: "arrived" as const, updatedAt: now }
          : a,
      );
      if (nextAsks !== asks) persistAsks(nextAsks);
      for (const a of nextAsks) {
        if (arrivedIds.has(a.busId) && a.status === "arrived" && a.updatedAt === now) {
          void pushAsk({ data: a }).catch(() => set({ cloud: false }));
        }
      }
    }
    set({
      now,
      buses: stepped.map((b) => recycleArrived(b, now)),
      asks: nextAsks,
    });
  },
  setOnline: (online) => set({ online }),
  setWeather: (weather) => {
    set({ weather });
    void pushWeather({ data: { weather } }).catch(() => set({ cloud: false }));
    if (weather === "typhoon") {
      get().publishAnnouncement({
        level: "critical",
        title: "No travel today",
        body: "Due to typhoon signal and LGU ordinance, all trips are suspended until further notice.",
        showHotlines: true,
      });
    }
  },
  publishAnnouncement: (a) => {
    const announcement: Announcement = { ...a, updatedAt: Date.now() };
    set({ announcement });
    void pushAnnouncement({ data: announcement }).catch(() => set({ cloud: false }));
    try {
      localStorage.setItem("sitex-announcement", JSON.stringify(announcement));
    } catch {
      /* ignore */
    }
  },
  selectBus: (id) => set({ selectedBusId: id }),
  setDriverSpeed: (id, kmh) => {
    const now = Date.now();
    set({
      now,
      buses: get().buses.map((b) =>
        b.id === id
          ? {
              ...b,
              speedKmh: kmh,
              targetSpeedKmh: kmh,
              driverControlled: true,
              lastFixAt: now,
              status: statusFromSpeed(b, kmh),
            }
          : b,
      ),
    });
    pushBusSoon(id);
  },
  startTrip: (id) => {
    const now = Date.now();
    set({
      now,
      buses: get().buses.map((b) => {
        if (b.id !== id) return b;
        const remaining = b.remainingKm > 1 ? b.remainingKm : b.totalKm * 0.95;
        const pos = alongOfficialRoute(b.waypoints, b.totalKm - remaining, b.totalKm);
        return {
          ...b,
          remainingKm: remaining,
          speedKmh: b.cruiseKmh,
          targetSpeedKmh: b.cruiseKmh,
          status: "en-route" as const,
          driverControlled: true,
          lat: pos.lat,
          lng: pos.lng,
          heading: pos.heading,
          lastFixAt: now,
        };
      }),
    });
    pushBusSoon(id, true);
  },
  endTrip: (id) => {
    const now = Date.now();
    set({
      now,
      buses: get().buses.map((b) =>
        b.id === id
          ? {
              ...b,
              status: "idle" as const,
              speedKmh: 0,
              targetSpeedKmh: 0,
              remainingKm: 0,
              driverControlled: false,
              gpsSource: "sim" as const,
              gpsAccuracyM: null,
              lastFixAt: now,
            }
          : b,
      ),
    });
    pushBusSoon(id, true);
    const asks = get().asks.map((a) =>
      a.busId === id && isOpenAsk(a) ? { ...a, status: "arrived" as const, updatedAt: now } : a,
    );
    set({ asks });
    persistAsks(asks);
    for (const a of asks) {
      if (a.busId === id && a.status === "arrived" && a.updatedAt === now) {
        void pushAsk({ data: a }).catch(() => set({ cloud: false }));
      }
    }
  },
  applyPhoneFix: (id, fix) => {
    const now = Date.now();
    set({
      now,
      buses: get().buses.map((b) => {
        if (b.id !== id) return b;
        const speed = Math.max(0, Math.min(120, fix.speedKmh));
        let remaining = b.remainingKm;
        let lat = b.lat;
        let lng = b.lng;
        let heading = b.heading;
        if (fix.inProvince) {
          const snap = nearestOnPolyline(b.waypoints, { lat: fix.lat, lng: fix.lng });
          const nextRem =
            snap.totalKm > 0 ? b.totalKm * (snap.remainingKm / snap.totalKm) : b.remainingKm;
          if (b.gpsSource !== "phone" || Math.abs(nextRem - b.remainingKm) < 12) {
            remaining = nextRem;
            lat = snap.lat;
            lng = snap.lng;
          } else {
            lat = snap.lat;
            lng = snap.lng;
          }
          if (fix.heading != null) heading = fix.heading;
        }
        const moving = b.status === "idle" || b.status === "arrived" ? "en-route" : b.status;
        return {
          ...b,
          remainingKm: remaining,
          speedKmh: speed,
          targetSpeedKmh: speed,
          driverControlled: true,
          gpsSource: "phone" as const,
          gpsAccuracyM: fix.accuracyM,
          lat,
          lng,
          heading,
          lastFixAt: now,
          status:
            moving === "en-route" || moving === "delayed"
              ? statusFromSpeed({ ...b, status: moving }, speed)
              : moving,
        };
      }),
    });
    pushBusSoon(id);
  },
  stopPhoneGps: (id) => {
    set({
      buses: get().buses.map((b) =>
        b.id === id ? { ...b, gpsSource: "sim" as const, gpsAccuracyM: null } : b,
      ),
    });
  },
  addReport: (input) => {
    const ticket = `SX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const report: PassengerReport = {
      id: crypto.randomUUID(),
      ticket,
      category: input.category,
      route: input.route,
      description: input.description,
      anonymous: input.anonymous,
      status: "new",
      createdAt: Date.now(),
    };
    const reports = [report, ...get().reports];
    set({ reports });
    void pushReport({
      data: {
        id: report.id,
        ticket: report.ticket,
        category: report.category,
        route: report.route,
        issueNote: report.description.slice(0, 200),
        status: report.status,
        createdAt: report.createdAt,
      },
    }).catch(() => set({ cloud: false }));
    try {
      localStorage.setItem("sitex-reports", JSON.stringify(reports));
    } catch {
      /* ignore */
    }
    return ticket;
  },
  updateReport: (id, status, forwardedTo) => {
    const reports = get().reports.map((r) =>
      r.id === id ? { ...r, status, forwardedTo: forwardedTo ?? r.forwardedTo } : r,
    );
    set({ reports });
    if (status === "forwarded") {
      void forwardReport({
        data: { id, forwardedTo: forwardedTo || "Sitex / SM Sorsogon" },
      }).catch(() => set({ cloud: false }));
    }
    try {
      localStorage.setItem("sitex-reports", JSON.stringify(reports));
    } catch {
      /* ignore */
    }
  },
  upsertAd: (ad) => {
    const ads = get().ads;
    const i = ads.findIndex((a) => a.id === ad.id);
    const next = i >= 0 ? ads.map((a) => (a.id === ad.id ? ad : a)) : [...ads, ad];
    set({ ads: next });
    persistAds(next);
    if (!ad.src.startsWith("idb:")) {
      void pushAd({ data: ad }).catch(() => set({ cloud: false }));
    }
  },
  toggleAd: (id, active) => {
    const ads = get().ads.map((a) => (a.id === id ? { ...a, active, updatedAt: Date.now() } : a));
    set({ ads });
    persistAds(ads);
    const ad = ads.find((a) => a.id === id);
    if (ad && !ad.src.startsWith("idb:")) {
      void pushAd({ data: ad }).catch(() => set({ cloud: false }));
    }
  },
  removeAd: (id) => {
    const target = get().ads.find((a) => a.id === id);
    const ads = get().ads.filter((a) => a.id !== id);
    set({ ads });
    persistAds(ads);
    if (target?.src.startsWith("idb:")) {
      void deleteAdBlob(target.src.slice(4));
    }
  },
  askIfComing: (busId) => {
    const bus = get().buses.find((b) => b.id === busId);
    if (!bus) return;
    if (openAskFor(get().asks, busId)) return;
    const now = Date.now();
    const ask: ComingAsk = {
      id: crypto.randomUUID(),
      busId: bus.id,
      plate: bus.plate,
      destination: bus.destination,
      zip: bus.zip,
      status: "pending",
      askedAt: now,
      confirmedAt: null,
      updatedAt: now,
    };
    const asks = [ask, ...get().asks];
    set({ asks });
    persistAsks(asks);
    void claimAskRemote({ data: ask })
      .then((row) => {
        if (!row) return;
        const next = mergeAsks(
          useFleet.getState().asks.filter((a) => a.id !== ask.id || row.id === ask.id),
          [row],
        );
        useFleet.setState({ asks: next, cloud: true });
        persistAsks(next);
      })
      .catch(() => set({ cloud: false }));
  },
  confirmAsk: (id) => {
    const now = Date.now();
    const asks = get().asks.map((a) =>
      a.id === id ? { ...a, status: "confirmed" as const, confirmedAt: now, updatedAt: now } : a,
    );
    set({ asks });
    persistAsks(asks);
    const row = asks.find((a) => a.id === id);
    void confirmAskRemote({ data: { id, confirmedAt: now } }).catch(() => set({ cloud: false }));
    if (row) void pushAsk({ data: row }).catch(() => set({ cloud: false }));
  },
  revokeAsk: (id) => {
    const now = Date.now();
    const asks = get().asks.map((a) =>
      a.id === id && a.status === "confirmed"
        ? { ...a, status: "revoked" as const, updatedAt: now }
        : a,
    );
    set({ asks });
    persistAsks(asks);
    const row = asks.find((a) => a.id === id);
    void revokeAskRemote({ data: { id, updatedAt: now } }).catch(() => set({ cloud: false }));
    if (row) void pushAsk({ data: row }).catch(() => set({ cloud: false }));
  },
}));

export function hydrateFleet() {
  const s = useFleet.getState();
  if (s.hydrated) return;
  const now = Date.now();
  useFleet.setState({
    hydrated: true,
    now,
    buses: createInitialBuses(now),
    reports: loadReports(),
    announcement: loadAnnouncement(),
    ads: loadAds(),
    asks: loadAsks(),
    online: typeof navigator === "undefined" ? true : navigator.onLine,
  });
  void pullCloud();
}

export function startTelemetryLoop() {
  hydrateFleet();
  const g = globalThis as typeof globalThis & { __sitexLoopUsers?: number; __sitexLoopStop?: () => void };
  g.__sitexLoopUsers = (g.__sitexLoopUsers ?? 0) + 1;
  if (g.__sitexLoopStop) {
    return () => {
      g.__sitexLoopUsers = Math.max(0, (g.__sitexLoopUsers ?? 1) - 1);
      if ((g.__sitexLoopUsers ?? 0) === 0) {
        g.__sitexLoopStop?.();
        g.__sitexLoopStop = undefined;
      }
    };
  }

  let last = performance.now();
  let raf = 0;
  const loop = (t: number) => {
    const dt = Math.min(1, (t - last) / 1000);
    last = t;
    useFleet.getState().tick(dt);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  const onOnline = () => {
    useFleet.getState().setOnline(true);
    void pullCloud();
  };
  const onOffline = () => useFleet.getState().setOnline(false);
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  const poll = window.setInterval(() => void pullCloud(), 2500);

  g.__sitexLoopStop = () => {
    cancelAnimationFrame(raf);
    window.clearInterval(poll);
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };

  return () => {
    g.__sitexLoopUsers = Math.max(0, (g.__sitexLoopUsers ?? 1) - 1);
    if ((g.__sitexLoopUsers ?? 0) === 0) {
      g.__sitexLoopStop?.();
      g.__sitexLoopStop = undefined;
    }
  };
}

export const ANNOUNCEMENT_TEMPLATES: Record<
  Exclude<AnnouncementLevel, "none">,
  Omit<Announcement, "updatedAt">
> = {
  critical: {
    level: "critical",
    title: "No travel today",
    body: "Due to typhoon signal and LGU ordinance, all trips are suspended until further notice.",
    showHotlines: true,
  },
  caution: {
    level: "caution",
    title: "Limited service",
    body: "Due to bad weather, only 2–5 buses are operating today on selected routes. Check live arrivals below.",
    showHotlines: false,
  },
  info: {
    level: "info",
    title: "Service update",
    body: "Normal operations have resumed. Thank you for your patience.",
    showHotlines: false,
  },
};
