import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import type {
  Advertisement,
  Announcement,
  Bus,
  ComingAsk,
  PassengerReport,
  Weather,
} from "./types";
import { ROUTES, SITEX } from "./routes";

export type BusWire = Omit<Bus, "waypoints">;

export type LiveSnapshot = {
  buses: BusWire[];
  announcement: Announcement;
  weather: Weather;
  reports: PassengerReport[];
  ads: Advertisement[];
  asks: ComingAsk[];
};

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") return Number(v) || 0;
  return 0;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function bool(v: unknown): boolean {
  return v === true || v === "t" || v === "true";
}

const busWire = z.object({
  id: z.string(),
  plate: z.string(),
  operator: z.string(),
  routeId: z.string(),
  destination: z.string(),
  zip: z.string(),
  via: z.string(),
  totalKm: z.number(),
  remainingKm: z.number(),
  speedKmh: z.number(),
  targetSpeedKmh: z.number(),
  cruiseKmh: z.number(),
  status: z.enum(["en-route", "delayed", "arrived", "suspended", "idle"]),
  lat: z.number(),
  lng: z.number(),
  heading: z.number(),
  lastFixAt: z.number(),
  gpsSource: z.enum(["sim", "phone"]),
  gpsAccuracyM: z.number().nullable(),
  driverControlled: z.boolean(),
});

const announcementZ = z.object({
  level: z.enum(["critical", "caution", "info", "none"]),
  title: z.string(),
  body: z.string(),
  showHotlines: z.boolean(),
  updatedAt: z.number(),
});

const adZ = z.object({
  id: z.string(),
  kind: z.enum(["poster", "video"]),
  src: z.string(),
  posterSrc: z.string().optional(),
  sponsor: z.string(),
  headline: z.string(),
  caption: z.string(),
  ctaLabel: z.string(),
  ctaUrl: z.string(),
  dwellSec: z.number(),
  active: z.boolean(),
  updatedAt: z.number(),
});

function rowToBus(r: Record<string, unknown>): BusWire {
  return {
    id: str(r.id),
    plate: str(r.plate),
    operator: str(r.operator),
    routeId: str(r.route_id),
    destination: str(r.destination),
    zip: str(r.zip),
    via: str(r.via),
    totalKm: num(r.total_km),
    remainingKm: num(r.remaining_km),
    speedKmh: num(r.speed_kmh),
    targetSpeedKmh: num(r.target_speed_kmh),
    cruiseKmh: num(r.cruise_kmh),
    status: str(r.status) as BusWire["status"],
    lat: num(r.lat),
    lng: num(r.lng),
    heading: num(r.heading),
    lastFixAt: num(r.last_fix_at),
    gpsSource: str(r.gps_source) === "phone" ? "phone" : "sim",
    gpsAccuracyM: r.gps_accuracy_m == null ? null : num(r.gps_accuracy_m),
    driverControlled: bool(r.driver_controlled),
  };
}

export function attachWaypoints(b: BusWire): Bus {
  const route = ROUTES.find((r) => r.id === b.routeId);
  return { ...b, waypoints: route?.waypoints ?? [SITEX] };
}

export const pullLiveFleet = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const [buses, anns, weatherRows, reports, ads] = await Promise.all([
    sql.query<Record<string, unknown>>("select * from sitex_bus"),
    sql.query<Record<string, unknown>>("select * from sitex_announcement where id = 1"),
    sql.query<Record<string, unknown>>("select * from sitex_weather where id = 1"),
    sql.query<Record<string, unknown>>("select * from sitex_report order by created_at desc limit 40"),
    sql.query<Record<string, unknown>>("select * from sitex_ad"),
  ]);
  let asks: Record<string, unknown>[] = [];
  try {
    asks = await sql.query<Record<string, unknown>>(
      "select * from sitex_ask order by asked_at desc limit 80",
    );
  } catch {
    asks = [];
  }

  const a = anns[0];
  const w = weatherRows[0];
  const snapshot: LiveSnapshot = {
    buses: buses.map(rowToBus),
    announcement: a
      ? {
          level: str(a.level) as Announcement["level"],
          title: str(a.title),
          body: str(a.body),
          showHotlines: bool(a.show_hotlines),
          updatedAt: num(a.updated_at),
        }
      : { level: "none", title: "", body: "", showHotlines: false, updatedAt: 0 },
    weather: (w ? str(w.weather) : "clear") as Weather,
    reports: reports.map((r) => ({
      id: str(r.id),
      ticket: str(r.ticket),
      category: str(r.category) as PassengerReport["category"],
      route: str(r.route),
      description: str(r.issue_note),
      anonymous: true,
      status: str(r.status) as PassengerReport["status"],
      createdAt: num(r.created_at),
      forwardedTo: r.forwarded_to ? str(r.forwarded_to) : undefined,
    })),
    ads: ads.map((r) => ({
      id: str(r.id),
      kind: str(r.kind) === "video" ? "video" : "poster",
      src: str(r.src),
      posterSrc: r.poster_src ? str(r.poster_src) : undefined,
      sponsor: str(r.sponsor),
      headline: str(r.headline),
      caption: str(r.caption),
      ctaLabel: str(r.cta_label),
      ctaUrl: str(r.cta_url),
      dwellSec: num(r.dwell_sec) || 12,
      active: bool(r.active),
      updatedAt: num(r.updated_at),
    })),
    asks: asks.map((r) => ({
      id: str(r.id),
      busId: str(r.bus_id),
      plate: str(r.plate),
      destination: str(r.destination),
      zip: str(r.zip),
      status: str(r.status) as ComingAsk["status"],
      askedAt: num(r.asked_at),
      confirmedAt: r.confirmed_at == null ? null : num(r.confirmed_at),
      updatedAt: r.updated_at == null ? num(r.asked_at) : num(r.updated_at),
    })),
  };
  return snapshot;
});

export const pushBusFix = createServerFn({ method: "POST" })
  .validator(busWire)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql.query(
      `insert into sitex_bus (
        id, plate, operator, route_id, destination, zip, via,
        total_km, remaining_km, speed_kmh, target_speed_kmh, cruise_kmh,
        status, lat, lng, heading, last_fix_at, gps_source, gps_accuracy_m, driver_controlled
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      on conflict (id) do update set
        remaining_km = excluded.remaining_km,
        speed_kmh = excluded.speed_kmh,
        target_speed_kmh = excluded.target_speed_kmh,
        status = excluded.status,
        lat = excluded.lat,
        lng = excluded.lng,
        heading = excluded.heading,
        last_fix_at = excluded.last_fix_at,
        gps_source = excluded.gps_source,
        gps_accuracy_m = excluded.gps_accuracy_m,
        driver_controlled = excluded.driver_controlled`,
      [
        data.id,
        data.plate,
        data.operator,
        data.routeId,
        data.destination,
        data.zip,
        data.via,
        data.totalKm,
        data.remainingKm,
        data.speedKmh,
        data.targetSpeedKmh,
        data.cruiseKmh,
        data.status,
        data.lat,
        data.lng,
        data.heading,
        data.lastFixAt,
        data.gpsSource,
        data.gpsAccuracyM,
        data.driverControlled,
      ],
    );
    return { ok: true as const };
  });

export const pushAnnouncement = createServerFn({ method: "POST" })
  .validator(announcementZ)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql.query(
      `insert into sitex_announcement (id, level, title, body, show_hotlines, updated_at)
       values (1,$1,$2,$3,$4,$5)
       on conflict (id) do update set
         level = excluded.level,
         title = excluded.title,
         body = excluded.body,
         show_hotlines = excluded.show_hotlines,
         updated_at = excluded.updated_at`,
      [data.level, data.title, data.body, data.showHotlines, data.updatedAt],
    );
    return { ok: true as const };
  });

export const pushWeather = createServerFn({ method: "POST" })
  .validator(z.object({ weather: z.enum(["clear", "rain", "typhoon"]) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql.query(
      `insert into sitex_weather (id, weather, updated_at) values (1,$1,$2)
       on conflict (id) do update set weather = excluded.weather, updated_at = excluded.updated_at`,
      [data.weather, Date.now()],
    );
    return { ok: true as const };
  });

export const pushReport = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      ticket: z.string(),
      category: z.string(),
      route: z.string(),
      issueNote: z.string().max(200),
      status: z.string(),
      createdAt: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql.query(
      `insert into sitex_report (id, ticket, category, route, issue_note, status, created_at)
       values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (id) do nothing`,
      [data.id, data.ticket, data.category, data.route, data.issueNote, data.status, data.createdAt],
    );
    return { ok: true as const };
  });

export const forwardReport = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), forwardedTo: z.string() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql.query(
      `update sitex_report set status = 'forwarded', forwarded_to = $2 where id = $1`,
      [data.id, data.forwardedTo],
    );
    return { ok: true as const };
  });

export const pushAd = createServerFn({ method: "POST" })
  .validator(adZ)
  .handler(async ({ data }) => {
    if (data.src.startsWith("idb:")) return { ok: false as const };
    const sql = await getSql();
    await sql.query(
      `insert into sitex_ad (
        id, kind, src, poster_src, sponsor, headline, caption, cta_label, cta_url, dwell_sec, active, updated_at
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      on conflict (id) do update set
        kind = excluded.kind,
        src = excluded.src,
        poster_src = excluded.poster_src,
        sponsor = excluded.sponsor,
        headline = excluded.headline,
        caption = excluded.caption,
        cta_label = excluded.cta_label,
        cta_url = excluded.cta_url,
        dwell_sec = excluded.dwell_sec,
        active = excluded.active,
        updated_at = excluded.updated_at`,
      [
        data.id,
        data.kind,
        data.src,
        data.posterSrc ?? null,
        data.sponsor,
        data.headline,
        data.caption,
        data.ctaLabel,
        data.ctaUrl,
        data.dwellSec,
        data.active,
        data.updatedAt,
      ],
    );
    return { ok: true as const };
  });

const askZ = z.object({
  id: z.string(),
  busId: z.string(),
  plate: z.string(),
  destination: z.string(),
  zip: z.string(),
  status: z.enum(["pending", "confirmed", "revoked", "arrived", "expired"]),
  askedAt: z.number(),
  confirmedAt: z.number().nullable(),
  updatedAt: z.number(),
});

function rowToAsk(r: Record<string, unknown>): ComingAsk {
  return {
    id: str(r.id),
    busId: str(r.bus_id ?? r.busId),
    plate: str(r.plate),
    destination: str(r.destination),
    zip: str(r.zip),
    status: str(r.status) as ComingAsk["status"],
    askedAt: num(r.asked_at ?? r.askedAt),
    confirmedAt: r.confirmed_at == null && r.confirmedAt == null ? null : num(r.confirmed_at ?? r.confirmedAt),
    updatedAt: num(r.updated_at ?? r.updatedAt ?? r.asked_at ?? r.askedAt),
  };
}

export const pushAsk = createServerFn({ method: "POST" })
  .validator(askZ)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql.query(
      `insert into sitex_ask (id, bus_id, plate, destination, zip, status, asked_at, confirmed_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (id) do update set
         status = excluded.status,
         confirmed_at = excluded.confirmed_at,
         updated_at = excluded.updated_at`,
      [
        data.id,
        data.busId,
        data.plate,
        data.destination,
        data.zip,
        data.status,
        data.askedAt,
        data.confirmedAt,
        data.updatedAt,
      ],
    );
    return { ok: true as const };
  });

export const claimAskRemote = createServerFn({ method: "POST" })
  .validator(askZ)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const existing = await sql.query<Record<string, unknown>>(
      `select * from sitex_ask where bus_id = $1 and status in ('pending','confirmed') limit 1`,
      [data.busId],
    );
    if (existing[0]) return rowToAsk(existing[0]);
    try {
      await sql.query(
        `insert into sitex_ask (id, bus_id, plate, destination, zip, status, asked_at, confirmed_at, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          data.id,
          data.busId,
          data.plate,
          data.destination,
          data.zip,
          data.status,
          data.askedAt,
          data.confirmedAt,
          data.updatedAt,
        ],
      );
      return data;
    } catch {
      const again = await sql.query<Record<string, unknown>>(
        `select * from sitex_ask where bus_id = $1 and status in ('pending','confirmed') limit 1`,
        [data.busId],
      );
      if (again[0]) return rowToAsk(again[0]);
      return data;
    }
  });

export const confirmAskRemote = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), confirmedAt: z.number() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql.query(
      `update sitex_ask set status = 'confirmed', confirmed_at = $2, updated_at = $2
       where id = $1 and status = 'pending'`,
      [data.id, data.confirmedAt],
    );
    return { ok: true as const };
  });

export const revokeAskRemote = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), updatedAt: z.number() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql.query(
      `update sitex_ask set status = 'revoked', updated_at = $2
       where id = $1 and status = 'confirmed'`,
      [data.id, data.updatedAt],
    );
    return { ok: true as const };
  });