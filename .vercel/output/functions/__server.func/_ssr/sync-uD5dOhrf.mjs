import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as object, i as number, n as boolean, o as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sync-uD5dOhrf.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var _0002_sitex_live_default = "-- Shared live board: GPS, announcements, reports, ads. Unowned (no user_id).\ncreate table if not exists sitex_bus (\n  id text primary key,\n  plate text not null,\n  operator text not null,\n  route_id text not null,\n  destination text not null,\n  zip text not null,\n  via text not null,\n  total_km double precision not null,\n  remaining_km double precision not null,\n  speed_kmh double precision not null,\n  target_speed_kmh double precision not null,\n  cruise_kmh double precision not null,\n  status text not null,\n  lat double precision not null,\n  lng double precision not null,\n  heading double precision not null,\n  last_fix_at bigint not null,\n  gps_source text not null,\n  gps_accuracy_m double precision,\n  driver_controlled boolean not null default false\n);\n\ncreate table if not exists sitex_announcement (\n  id integer primary key,\n  level text not null,\n  title text not null,\n  body text not null,\n  show_hotlines boolean not null default false,\n  updated_at bigint not null\n);\n\ncreate table if not exists sitex_weather (\n  id integer primary key,\n  weather text not null,\n  updated_at bigint not null\n);\n\ncreate table if not exists sitex_report (\n  id text primary key,\n  ticket text not null,\n  category text not null,\n  route text not null default '',\n  issue_note text not null default '',\n  status text not null,\n  forwarded_to text,\n  created_at bigint not null\n);\n\ncreate table if not exists sitex_ad (\n  id text primary key,\n  kind text not null,\n  src text not null,\n  poster_src text,\n  sponsor text not null default '',\n  headline text not null,\n  caption text not null default '',\n  cta_label text not null default '',\n  cta_url text not null default '',\n  dwell_sec integer not null default 12,\n  active boolean not null default true,\n  updated_at bigint not null\n);\n\ninsert into sitex_announcement (id, level, title, body, show_hotlines, updated_at)\nvalues (1, 'none', '', '', false, 0)\non conflict (id) do nothing;\n\ninsert into sitex_weather (id, weather, updated_at)\nvalues (1, 'clear', 0)\non conflict (id) do nothing;\n";
var _0003_sitex_ask_default = "-- Passenger “is this bus coming?” asks; driver/conductor confirms.\ncreate table if not exists sitex_ask (\n  id text primary key,\n  bus_id text not null,\n  plate text not null,\n  destination text not null,\n  zip text not null,\n  status text not null default 'pending',\n  asked_at bigint not null,\n  confirmed_at bigint\n);\n\ncreate index if not exists sitex_ask_bus_idx on sitex_ask (bus_id, status);\ncreate index if not exists sitex_ask_asked_idx on sitex_ask (asked_at desc);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_sitex_live.sql": _0002_sitex_live_default,
			"/migrations/0003_sitex_ask.sql": _0003_sitex_ask_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
* Sitex live tables: migrations/0002_sitex_live.sql, 0003_sitex_ask.sql
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
function num(v) {
	if (typeof v === "number" && Number.isFinite(v)) return v;
	if (typeof v === "string") return Number(v) || 0;
	return 0;
}
function str(v) {
	return typeof v === "string" ? v : "";
}
function bool(v) {
	return v === true || v === "t" || v === "true";
}
var busWire = object({
	id: string(),
	plate: string(),
	operator: string(),
	routeId: string(),
	destination: string(),
	zip: string(),
	via: string(),
	totalKm: number(),
	remainingKm: number(),
	speedKmh: number(),
	targetSpeedKmh: number(),
	cruiseKmh: number(),
	status: _enum([
		"en-route",
		"delayed",
		"arrived",
		"suspended",
		"idle"
	]),
	lat: number(),
	lng: number(),
	heading: number(),
	lastFixAt: number(),
	gpsSource: _enum(["sim", "phone"]),
	gpsAccuracyM: number().nullable(),
	driverControlled: boolean()
});
var announcementZ = object({
	level: _enum([
		"critical",
		"caution",
		"info",
		"none"
	]),
	title: string(),
	body: string(),
	showHotlines: boolean(),
	updatedAt: number()
});
var adZ = object({
	id: string(),
	kind: _enum(["poster", "video"]),
	src: string(),
	posterSrc: string().optional(),
	sponsor: string(),
	headline: string(),
	caption: string(),
	ctaLabel: string(),
	ctaUrl: string(),
	dwellSec: number(),
	active: boolean(),
	updatedAt: number()
});
function rowToBus(r) {
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
		status: str(r.status),
		lat: num(r.lat),
		lng: num(r.lng),
		heading: num(r.heading),
		lastFixAt: num(r.last_fix_at),
		gpsSource: str(r.gps_source) === "phone" ? "phone" : "sim",
		gpsAccuracyM: r.gps_accuracy_m == null ? null : num(r.gps_accuracy_m),
		driverControlled: bool(r.driver_controlled)
	};
}
var pullLiveFleet_createServerFn_handler = createServerRpc({
	id: "f4d6c6fa48d93281db8f1c64031ccc4443de2fbf4dc38f80f2a11131b0f4d6f9",
	name: "pullLiveFleet",
	filename: "src/lib/fleet/sync.ts"
}, (opts) => pullLiveFleet.__executeServer(opts));
var pullLiveFleet = createServerFn({ method: "GET" }).handler(pullLiveFleet_createServerFn_handler, async () => {
	const sql = await getSql();
	const [buses, anns, weatherRows, reports, ads] = await Promise.all([
		sql.query("select * from sitex_bus"),
		sql.query("select * from sitex_announcement where id = 1"),
		sql.query("select * from sitex_weather where id = 1"),
		sql.query("select * from sitex_report order by created_at desc limit 40"),
		sql.query("select * from sitex_ad")
	]);
	let asks = [];
	try {
		asks = await sql.query("select * from sitex_ask order by asked_at desc limit 80");
	} catch {
		asks = [];
	}
	const a = anns[0];
	const w = weatherRows[0];
	return {
		buses: buses.map(rowToBus),
		announcement: a ? {
			level: str(a.level),
			title: str(a.title),
			body: str(a.body),
			showHotlines: bool(a.show_hotlines),
			updatedAt: num(a.updated_at)
		} : {
			level: "none",
			title: "",
			body: "",
			showHotlines: false,
			updatedAt: 0
		},
		weather: w ? str(w.weather) : "clear",
		reports: reports.map((r) => ({
			id: str(r.id),
			ticket: str(r.ticket),
			category: str(r.category),
			route: str(r.route),
			description: str(r.issue_note),
			anonymous: true,
			status: str(r.status),
			createdAt: num(r.created_at),
			forwardedTo: r.forwarded_to ? str(r.forwarded_to) : void 0
		})),
		ads: ads.map((r) => ({
			id: str(r.id),
			kind: str(r.kind) === "video" ? "video" : "poster",
			src: str(r.src),
			posterSrc: r.poster_src ? str(r.poster_src) : void 0,
			sponsor: str(r.sponsor),
			headline: str(r.headline),
			caption: str(r.caption),
			ctaLabel: str(r.cta_label),
			ctaUrl: str(r.cta_url),
			dwellSec: num(r.dwell_sec) || 12,
			active: bool(r.active),
			updatedAt: num(r.updated_at)
		})),
		asks: asks.map((r) => ({
			id: str(r.id),
			busId: str(r.bus_id),
			plate: str(r.plate),
			destination: str(r.destination),
			zip: str(r.zip),
			status: str(r.status),
			askedAt: num(r.asked_at),
			confirmedAt: r.confirmed_at == null ? null : num(r.confirmed_at)
		}))
	};
});
var pushBusFix_createServerFn_handler = createServerRpc({
	id: "dc9ae814153b12969a8c8ceab5c27eee3f28861de0dbd972e5a9fe53284d19a5",
	name: "pushBusFix",
	filename: "src/lib/fleet/sync.ts"
}, (opts) => pushBusFix.__executeServer(opts));
var pushBusFix = createServerFn({ method: "POST" }).validator(busWire).handler(pushBusFix_createServerFn_handler, async ({ data }) => {
	await (await getSql()).query(`insert into sitex_bus (
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
        driver_controlled = excluded.driver_controlled`, [
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
		data.driverControlled
	]);
	return { ok: true };
});
var pushAnnouncement_createServerFn_handler = createServerRpc({
	id: "7ec4380fe6e150f9ee16aec92980100953d277258a0442db442cf02fd7b03437",
	name: "pushAnnouncement",
	filename: "src/lib/fleet/sync.ts"
}, (opts) => pushAnnouncement.__executeServer(opts));
var pushAnnouncement = createServerFn({ method: "POST" }).validator(announcementZ).handler(pushAnnouncement_createServerFn_handler, async ({ data }) => {
	await (await getSql()).query(`insert into sitex_announcement (id, level, title, body, show_hotlines, updated_at)
       values (1,$1,$2,$3,$4,$5)
       on conflict (id) do update set
         level = excluded.level,
         title = excluded.title,
         body = excluded.body,
         show_hotlines = excluded.show_hotlines,
         updated_at = excluded.updated_at`, [
		data.level,
		data.title,
		data.body,
		data.showHotlines,
		data.updatedAt
	]);
	return { ok: true };
});
var pushWeather_createServerFn_handler = createServerRpc({
	id: "283131b13a5cc3801e1d0593454a6c7cf1019085cbd15a5bcd97b2f84fd448de",
	name: "pushWeather",
	filename: "src/lib/fleet/sync.ts"
}, (opts) => pushWeather.__executeServer(opts));
var pushWeather = createServerFn({ method: "POST" }).validator(object({ weather: _enum([
	"clear",
	"rain",
	"typhoon"
]) })).handler(pushWeather_createServerFn_handler, async ({ data }) => {
	await (await getSql()).query(`insert into sitex_weather (id, weather, updated_at) values (1,$1,$2)
       on conflict (id) do update set weather = excluded.weather, updated_at = excluded.updated_at`, [data.weather, Date.now()]);
	return { ok: true };
});
var pushReport_createServerFn_handler = createServerRpc({
	id: "63a6bdd16e0cb4559efad9d2d472ea7666dd8aad2434b0d85a3a5840145fa802",
	name: "pushReport",
	filename: "src/lib/fleet/sync.ts"
}, (opts) => pushReport.__executeServer(opts));
var pushReport = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	ticket: string(),
	category: string(),
	route: string(),
	issueNote: string().max(200),
	status: string(),
	createdAt: number()
})).handler(pushReport_createServerFn_handler, async ({ data }) => {
	await (await getSql()).query(`insert into sitex_report (id, ticket, category, route, issue_note, status, created_at)
       values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (id) do nothing`, [
		data.id,
		data.ticket,
		data.category,
		data.route,
		data.issueNote,
		data.status,
		data.createdAt
	]);
	return { ok: true };
});
var forwardReport_createServerFn_handler = createServerRpc({
	id: "77a225f315e4c1cafa4566a82bc8689b110924be8a2032bd5e095d3d7d9f5ef7",
	name: "forwardReport",
	filename: "src/lib/fleet/sync.ts"
}, (opts) => forwardReport.__executeServer(opts));
var forwardReport = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	forwardedTo: string()
})).handler(forwardReport_createServerFn_handler, async ({ data }) => {
	await (await getSql()).query(`update sitex_report set status = 'forwarded', forwarded_to = $2 where id = $1`, [data.id, data.forwardedTo]);
	return { ok: true };
});
var pushAd_createServerFn_handler = createServerRpc({
	id: "0b23c2db3a3c8d16ae85327ec0e4def83a4b751c992a186ddc27e13c014230c4",
	name: "pushAd",
	filename: "src/lib/fleet/sync.ts"
}, (opts) => pushAd.__executeServer(opts));
var pushAd = createServerFn({ method: "POST" }).validator(adZ).handler(pushAd_createServerFn_handler, async ({ data }) => {
	if (data.src.startsWith("idb:")) return { ok: false };
	await (await getSql()).query(`insert into sitex_ad (
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
        updated_at = excluded.updated_at`, [
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
		data.updatedAt
	]);
	return { ok: true };
});
var askZ = object({
	id: string(),
	busId: string(),
	plate: string(),
	destination: string(),
	zip: string(),
	status: _enum([
		"pending",
		"confirmed",
		"expired"
	]),
	askedAt: number(),
	confirmedAt: number().nullable()
});
var pushAsk_createServerFn_handler = createServerRpc({
	id: "5f4c0a298e8fa7b1de3e44b1f89dbcd142a8b96790e34a1b9d457b1e9561f1e3",
	name: "pushAsk",
	filename: "src/lib/fleet/sync.ts"
}, (opts) => pushAsk.__executeServer(opts));
var pushAsk = createServerFn({ method: "POST" }).validator(askZ).handler(pushAsk_createServerFn_handler, async ({ data }) => {
	await (await getSql()).query(`insert into sitex_ask (id, bus_id, plate, destination, zip, status, asked_at, confirmed_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (id) do update set
         status = excluded.status,
         confirmed_at = excluded.confirmed_at`, [
		data.id,
		data.busId,
		data.plate,
		data.destination,
		data.zip,
		data.status,
		data.askedAt,
		data.confirmedAt
	]);
	return { ok: true };
});
var confirmAskRemote_createServerFn_handler = createServerRpc({
	id: "ff54cd26aae96580518cdf4a6f8a58c22541fd8da069f7ee566ad2c328b3d904",
	name: "confirmAskRemote",
	filename: "src/lib/fleet/sync.ts"
}, (opts) => confirmAskRemote.__executeServer(opts));
var confirmAskRemote = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	confirmedAt: number()
})).handler(confirmAskRemote_createServerFn_handler, async ({ data }) => {
	await (await getSql()).query(`update sitex_ask set status = 'confirmed', confirmed_at = $2 where id = $1`, [data.id, data.confirmedAt]);
	return { ok: true };
});
//#endregion
export { confirmAskRemote_createServerFn_handler, forwardReport_createServerFn_handler, pullLiveFleet_createServerFn_handler, pushAd_createServerFn_handler, pushAnnouncement_createServerFn_handler, pushAsk_createServerFn_handler, pushBusFix_createServerFn_handler, pushReport_createServerFn_handler, pushWeather_createServerFn_handler };
