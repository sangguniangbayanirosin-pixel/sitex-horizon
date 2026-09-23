import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as object, i as number, n as boolean, o as string, t as _enum } from "../_libs/zod.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/card-aeUZxGA1.js
var import_jsx_runtime = require_jsx_runtime();
var R = 6371;
function rad(d) {
	return d * Math.PI / 180;
}
function haversineKm(a, b) {
	const dLat = rad(b.lat - a.lat);
	const dLng = rad(b.lng - a.lng);
	const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
function bearing(a, b) {
	const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat));
	const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
	return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
function polylineLengthKm(points) {
	let km = 0;
	for (let i = 1; i < points.length; i++) km += haversineKm(points[i - 1], points[i]);
	return km;
}
function lerp(a, b, t) {
	return {
		lat: a.lat + (b.lat - a.lat) * t,
		lng: a.lng + (b.lng - a.lng) * t
	};
}
function alongOfficialRoute(waypoints, traveledKm, officialTotalKm) {
	return pointAtFraction(waypoints, officialTotalKm <= 0 ? 1 : Math.min(1, Math.max(0, traveledKm / officialTotalKm)));
}
function pointAtFraction(waypoints, t) {
	if (waypoints.length === 0) return {
		lat: 0,
		lng: 0,
		heading: 0
	};
	if (waypoints.length === 1) return {
		...waypoints[0],
		heading: 0
	};
	const total = polylineLengthKm(waypoints);
	const target = Math.min(1, Math.max(0, t)) * total;
	let acc = 0;
	for (let i = 1; i < waypoints.length; i++) {
		const a = waypoints[i - 1];
		const b = waypoints[i];
		const seg = haversineKm(a, b);
		if (acc + seg >= target || i === waypoints.length - 1) {
			const u = seg > 0 ? (target - acc) / seg : 1;
			return {
				...lerp(a, b, Math.min(1, Math.max(0, u))),
				heading: bearing(a, b)
			};
		}
		acc += seg;
	}
	const last = waypoints[waypoints.length - 1];
	const prev = waypoints[waypoints.length - 2];
	return {
		...last,
		heading: bearing(prev, last)
	};
}
function nearestOnPolyline(waypoints, p) {
	const totalKm = polylineLengthKm(waypoints);
	if (waypoints.length < 2) return {
		...waypoints[0],
		remainingKm: totalKm,
		totalKm,
		heading: 0
	};
	let bestD = Infinity;
	let bestT = 0;
	let best = waypoints[0];
	let bestHeading = 0;
	let acc = 0;
	for (let i = 1; i < waypoints.length; i++) {
		const a = waypoints[i - 1];
		const b = waypoints[i];
		const seg = haversineKm(a, b);
		const samples = Math.max(4, Math.ceil(seg * 4));
		for (let s = 0; s <= samples; s++) {
			const u = s / samples;
			const q = lerp(a, b, u);
			const d = haversineKm(p, q);
			if (d < bestD) {
				bestD = d;
				best = q;
				bestT = acc + seg * u;
				bestHeading = bearing(a, b);
			}
		}
		acc += seg;
	}
	return {
		...best,
		remainingKm: Math.max(0, totalKm - bestT),
		totalKm,
		heading: bestHeading
	};
}
/** Sorsogon province envelope for phone GPS sanity. */
function inSorsogon(p) {
	return p.lat >= 12.52 && p.lat <= 13.12 && p.lng >= 123.52 && p.lng <= 124.28;
}
/** Sitex / SM Sorsogon Integrated Terminal Exchange, Balogo */
var SITEX = {
	lat: 12.9735,
	lng: 123.9928
};
/**
* All Sorsogon LGUs. Road km are official DENR distances from the capital
* (Sorsogon City / SITEX corridor). Coordinates: poblacion / municipal hall.
*/
var MUNICIPALITIES = [
	{
		id: "sorsogon",
		name: "Sorsogon",
		zip: "4700",
		roadKm: 3.2,
		lat: 12.9707,
		lng: 124.0052,
		via: "City proper",
		cruiseKmh: 28,
		color: "#5B9DFF"
	},
	{
		id: "bacon",
		name: "Bacon",
		zip: "4701",
		roadKm: 10.7,
		lat: 13.0378,
		lng: 124.041,
		via: "Bacon Rd",
		cruiseKmh: 40,
		color: "#FF6B9D"
	},
	{
		id: "casiguran",
		name: "Casiguran",
		zip: "4702",
		roadKm: 19.03,
		lat: 12.8734,
		lng: 124.0093,
		via: "Maharlika Hwy",
		cruiseKmh: 48,
		color: "#7CFF6B"
	},
	{
		id: "juban",
		name: "Juban",
		zip: "4703",
		roadKm: 23.05,
		lat: 12.8476,
		lng: 123.9894,
		via: "Maharlika Hwy",
		cruiseKmh: 50,
		color: "#C77DFF"
	},
	{
		id: "bulusan",
		name: "Bulusan",
		zip: "4704",
		roadKm: 42.52,
		lat: 12.7518,
		lng: 124.1371,
		via: "Gubat–Barcelona",
		cruiseKmh: 46,
		color: "#2EE6C8"
	},
	{
		id: "magallanes",
		name: "Magallanes",
		zip: "4705",
		roadKm: 48.13,
		lat: 12.8271,
		lng: 123.8371,
		via: "Juban",
		cruiseKmh: 48,
		color: "#FF8A3D"
	},
	{
		id: "bulan",
		name: "Bulan",
		zip: "4706",
		roadKm: 63.09,
		lat: 12.6677,
		lng: 123.8775,
		via: "Irosin",
		cruiseKmh: 52,
		color: "#6B7CFF"
	},
	{
		id: "irosin",
		name: "Irosin",
		zip: "4707",
		roadKm: 43.35,
		lat: 12.7023,
		lng: 124.0341,
		via: "Maharlika Hwy",
		cruiseKmh: 52,
		color: "#FFE14A"
	},
	{
		id: "matnog",
		name: "Matnog",
		zip: "4708",
		roadKm: 66.64,
		lat: 12.5861,
		lng: 124.0856,
		via: "Irosin",
		cruiseKmh: 55,
		color: "#FF3B3B"
	},
	{
		id: "sta-magdalena",
		name: "Sta. Magdalena",
		zip: "4709",
		roadKm: 71.97,
		lat: 12.6463,
		lng: 124.1079,
		via: "Bulusan coastal",
		cruiseKmh: 50,
		color: "#3DFF8A"
	},
	{
		id: "gubat",
		name: "Gubat",
		zip: "4710",
		roadKm: 19.16,
		lat: 12.9178,
		lng: 124.1241,
		via: "Coastal Road",
		cruiseKmh: 46,
		color: "#00D4FF"
	},
	{
		id: "prieto-diaz",
		name: "Prieto Diaz",
		zip: "4711",
		roadKm: 34.4,
		lat: 13.0406,
		lng: 124.1932,
		via: "Bacon–Pacific",
		cruiseKmh: 44,
		color: "#FF4DC4"
	},
	{
		id: "barcelona",
		name: "Barcelona",
		zip: "4712",
		roadKm: 27.13,
		lat: 12.8663,
		lng: 124.1451,
		via: "Gubat coastal",
		cruiseKmh: 46,
		color: "#3B6BFF"
	},
	{
		id: "castilla",
		name: "Castilla",
		zip: "4713",
		roadKm: 25.11,
		lat: 12.9501,
		lng: 123.8789,
		via: "West coastal",
		cruiseKmh: 48,
		color: "#B347FF"
	},
	{
		id: "pilar",
		name: "Pilar",
		zip: "4714",
		roadKm: 55.69,
		lat: 12.9231,
		lng: 123.6741,
		via: "Castilla",
		cruiseKmh: 50,
		color: "#FFB347"
	},
	{
		id: "donsol",
		name: "Donsol",
		zip: "4715",
		roadKm: 66.47,
		lat: 12.9077,
		lng: 123.5986,
		via: "Pilar–Castilla",
		cruiseKmh: 52,
		color: "#1DB954"
	}
];
var M = Object.fromEntries(MUNICIPALITIES.map((m) => [m.id, m]));
function town(id) {
	return {
		lat: M[id].lat,
		lng: M[id].lng
	};
}
function toSitex(...ids) {
	return [...ids.map(town), SITEX];
}
[(SITEX.lat, SITEX.lng), ...MUNICIPALITIES.map((m) => ({
	name: m.name,
	lat: m.lat,
	lng: m.lng,
	zip: m.zip,
	roadKm: m.roadKm
}))];
var VIA = {
	sorsogon: ["sorsogon"],
	bacon: ["bacon"],
	casiguran: ["casiguran"],
	juban: ["juban", "casiguran"],
	bulusan: [
		"bulusan",
		"barcelona",
		"gubat"
	],
	magallanes: [
		"magallanes",
		"juban",
		"casiguran"
	],
	bulan: [
		"bulan",
		"irosin",
		"juban",
		"casiguran"
	],
	irosin: [
		"irosin",
		"juban",
		"casiguran"
	],
	matnog: [
		"matnog",
		"irosin",
		"juban",
		"casiguran"
	],
	"sta-magdalena": [
		"sta-magdalena",
		"bulusan",
		"barcelona",
		"gubat"
	],
	gubat: ["gubat"],
	"prieto-diaz": ["prieto-diaz", "bacon"],
	barcelona: ["barcelona", "gubat"],
	castilla: ["castilla"],
	pilar: ["pilar", "castilla"],
	donsol: [
		"donsol",
		"pilar",
		"castilla"
	]
};
var ROUTES = MUNICIPALITIES.map((m) => ({
	id: m.id,
	destination: m.name,
	zip: m.zip,
	via: m.via,
	waypoints: toSitex(...VIA[m.id] ?? [m.id]),
	cruiseKmh: m.cruiseKmh,
	roadKm: m.roadKm
}));
var OPERATORS = [
	"Penafrancia Tours",
	"Bicol Isarog",
	"Raymond Transport",
	"Cagsawa",
	"Sorsogon Cooperative",
	"JVH Liner",
	"Pamar Tours"
];
var PLATES = [
	"7G-4821",
	"SBC-1104",
	"EAA-2209",
	"FBT-3318",
	"GSC-4472",
	"HND-5510",
	"JLP-6623",
	"KMR-7701",
	"LNV-8834",
	"MPQ-9940",
	"NRS-1027",
	"PTU-2156",
	"QVW-3288",
	"RXZ-4311",
	"SYA-5480",
	"TZB-6592"
];
function createInitialBuses(now) {
	return ROUTES.map((route, i) => {
		const frac = .18 + i * 17 % 70 / 100;
		const remaining = Math.max(.4, route.roadKm * (1 - frac));
		const pos = alongOfficialRoute(route.waypoints, route.roadKm - remaining, route.roadKm);
		const delayed = i % 5 === 2;
		const speed = delayed ? route.cruiseKmh * .55 : route.cruiseKmh;
		return {
			id: PLATES[i],
			plate: PLATES[i],
			operator: OPERATORS[i % OPERATORS.length],
			routeId: route.id,
			destination: route.destination,
			zip: route.zip,
			via: route.via,
			totalKm: route.roadKm,
			remainingKm: remaining,
			speedKmh: speed,
			targetSpeedKmh: speed,
			cruiseKmh: route.cruiseKmh,
			status: delayed ? "delayed" : "en-route",
			lat: pos.lat,
			lng: pos.lng,
			heading: pos.heading,
			lastFixAt: now,
			waypoints: route.waypoints,
			driverControlled: false,
			gpsSource: "sim",
			gpsAccuracyM: null
		};
	});
}
function weatherFactor(weather) {
	if (weather === "typhoon") return 0;
	if (weather === "rain") return .72;
	return 1;
}
function stepBus(bus, dtSec, weather, now) {
	if (bus.status === "idle" || bus.status === "arrived") return bus;
	if (weather === "typhoon") return {
		...bus,
		status: "suspended",
		speedKmh: 0,
		targetSpeedKmh: 0,
		lastFixAt: now
	};
	const factor = weatherFactor(weather);
	const target = bus.driverControlled ? bus.targetSpeedKmh : bus.cruiseKmh * factor;
	const speed = bus.speedKmh + (target - bus.speedKmh) * Math.min(1, dtSec * 1.4);
	const remaining = Math.max(0, bus.remainingKm - speed * dtSec / 3600);
	const traveled = bus.totalKm - remaining;
	const pos = alongOfficialRoute(bus.waypoints, traveled, bus.totalKm);
	const delayed = speed < bus.cruiseKmh * .72;
	const status = remaining <= .05 ? "arrived" : delayed ? "delayed" : "en-route";
	return {
		...bus,
		speedKmh: speed,
		remainingKm: remaining,
		lat: pos.lat,
		lng: pos.lng,
		heading: pos.heading,
		lastFixAt: bus.lastFixAt,
		status
	};
}
function recycleArrived(bus, now) {
	if (bus.status !== "arrived") return bus;
	if (bus.driverControlled || bus.gpsSource === "phone") return bus;
	const remaining = bus.totalKm * .96;
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
		gpsAccuracyM: null
	};
}
var DB_NAME = "sitex-ads";
var STORE = "media";
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);
		req.onupgradeneeded = () => {
			if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
async function saveAdBlob(id, blob) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).put(blob, id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
async function loadAdBlob(id) {
	const db = await openDb();
	const blob = await new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
		req.onsuccess = () => resolve(req.result ?? null);
		req.onerror = () => reject(req.error);
	});
	db.close();
	return blob;
}
async function deleteAdBlob(id) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).delete(id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
var objectUrls = /* @__PURE__ */ new Map();
async function resolveAdSrc(src) {
	if (!src.startsWith("idb:")) return src;
	const id = src.slice(4);
	const cached = objectUrls.get(id);
	if (cached) return cached;
	const blob = await loadAdBlob(id);
	if (!blob) return "";
	const url = URL.createObjectURL(blob);
	objectUrls.set(id, url);
	return url;
}
function isUploadedSrc(src) {
	return src.startsWith("idb:");
}
async function compressImageFile(file) {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
	const w = Math.round(bitmap.width * scale);
	const h = Math.round(bitmap.height * scale);
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) return file;
	ctx.drawImage(bitmap, 0, 0, w, h);
	bitmap.close();
	return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", .84)) ?? file;
}
function detectKind(file) {
	if (file.type.startsWith("image/")) return "poster";
	if (file.type.startsWith("video/")) return "video";
	const name = file.name.toLowerCase();
	if (/\.(jpe?g|png|webp|gif)$/.test(name)) return "poster";
	if (/\.(mp4|webm|mov)$/.test(name)) return "video";
	return null;
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
function attachWaypoints(b) {
	const route = ROUTES.find((r) => r.id === b.routeId);
	return {
		...b,
		waypoints: route?.waypoints ?? [SITEX]
	};
}
var pullLiveFleet = createServerFn({ method: "GET" }).handler(createSsrRpc("f4d6c6fa48d93281db8f1c64031ccc4443de2fbf4dc38f80f2a11131b0f4d6f9"));
var pushBusFix = createServerFn({ method: "POST" }).validator(busWire).handler(createSsrRpc("dc9ae814153b12969a8c8ceab5c27eee3f28861de0dbd972e5a9fe53284d19a5"));
var pushAnnouncement = createServerFn({ method: "POST" }).validator(announcementZ).handler(createSsrRpc("7ec4380fe6e150f9ee16aec92980100953d277258a0442db442cf02fd7b03437"));
var pushWeather = createServerFn({ method: "POST" }).validator(object({ weather: _enum([
	"clear",
	"rain",
	"typhoon"
]) })).handler(createSsrRpc("283131b13a5cc3801e1d0593454a6c7cf1019085cbd15a5bcd97b2f84fd448de"));
var pushReport = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	ticket: string(),
	category: string(),
	route: string(),
	issueNote: string().max(200),
	status: string(),
	createdAt: number()
})).handler(createSsrRpc("63a6bdd16e0cb4559efad9d2d472ea7666dd8aad2434b0d85a3a5840145fa802"));
var forwardReport = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	forwardedTo: string()
})).handler(createSsrRpc("77a225f315e4c1cafa4566a82bc8689b110924be8a2032bd5e095d3d7d9f5ef7"));
var pushAd = createServerFn({ method: "POST" }).validator(adZ).handler(createSsrRpc("0b23c2db3a3c8d16ae85327ec0e4def83a4b751c992a186ddc27e13c014230c4"));
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
var pushAsk = createServerFn({ method: "POST" }).validator(askZ).handler(createSsrRpc("5f4c0a298e8fa7b1de3e44b1f89dbcd142a8b96790e34a1b9d457b1e9561f1e3"));
var confirmAskRemote = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	confirmedAt: number()
})).handler(createSsrRpc("ff54cd26aae96580518cdf4a6f8a58c22541fd8da069f7ee566ad2c328b3d904"));
var DEFAULT_ANNOUNCEMENT = {
	level: "none",
	title: "",
	body: "",
	showHotlines: false,
	updatedAt: 0
};
var DEFAULT_ADS = [{
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
	updatedAt: 0
}, {
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
	updatedAt: 0
}];
function loadReports() {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem("sitex-reports");
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function loadAnnouncement() {
	if (typeof localStorage === "undefined") return DEFAULT_ANNOUNCEMENT;
	try {
		const raw = localStorage.getItem("sitex-announcement");
		return raw ? JSON.parse(raw) : DEFAULT_ANNOUNCEMENT;
	} catch {
		return DEFAULT_ANNOUNCEMENT;
	}
}
function loadAds() {
	if (typeof localStorage === "undefined") return DEFAULT_ADS;
	try {
		const raw = localStorage.getItem("sitex-ads");
		if (!raw) return DEFAULT_ADS;
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ADS;
	} catch {
		return DEFAULT_ADS;
	}
}
function loadAsks() {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem("sitex-asks");
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function persistAsks(asks) {
	try {
		localStorage.setItem("sitex-asks", JSON.stringify(asks.slice(0, 80)));
	} catch {}
}
function mergeAsks(local, remote) {
	const map = /* @__PURE__ */ new Map();
	for (const a of local) map.set(a.id, a);
	for (const a of remote) {
		const cur = map.get(a.id);
		const remoteTs = a.confirmedAt ?? a.askedAt;
		const localTs = cur ? cur.confirmedAt ?? cur.askedAt : 0;
		if (!cur || remoteTs >= localTs) map.set(a.id, a);
	}
	return [...map.values()].sort((a, b) => b.askedAt - a.askedAt);
}
function toWire(b) {
	const { waypoints: _w, ...wire } = b;
	return wire;
}
function mergeAds(local, remote) {
	const map = /* @__PURE__ */ new Map();
	for (const a of local) map.set(a.id, a);
	for (const a of remote) {
		const cur = map.get(a.id);
		if (!cur || a.updatedAt >= cur.updatedAt) map.set(a.id, a);
	}
	return [...map.values()];
}
function applyRemote(remote) {
	const local = useFleet.getState();
	const byId = new Map(local.buses.map((b) => [b.id, b]));
	for (const w of remote.buses) {
		const cur = byId.get(w.id);
		if (preferRemoteBus(cur, w)) byId.set(w.id, attachWaypoints({
			...cur ?? w,
			...w
		}));
	}
	useFleet.setState({
		cloud: true,
		buses: [...byId.values()],
		announcement: remote.announcement.updatedAt >= local.announcement.updatedAt ? remote.announcement : local.announcement,
		weather: remote.weather || local.weather,
		reports: remote.reports.length ? remote.reports : local.reports,
		ads: mergeAds(local.ads, remote.ads),
		asks: mergeAsks(local.asks, remote.asks ?? [])
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
function preferRemoteBus(cur, w) {
	if (!cur) return true;
	const remotePhone = w.gpsSource === "phone" || w.driverControlled;
	const localPhone = cur.gpsSource === "phone" || cur.driverControlled;
	if (remotePhone && !localPhone) return true;
	if (localPhone && !remotePhone) return false;
	return w.lastFixAt >= cur.lastFixAt;
}
var pushTimers = /* @__PURE__ */ new Map();
function pushBusSoon(id, immediate = false) {
	const fire = () => {
		pushTimers.delete(id);
		const bus = useFleet.getState().buses.find((b) => b.id === id);
		if (!bus) return;
		pushBusFix({ data: toWire(bus) }).catch(() => {
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
function persistAds(ads) {
	try {
		localStorage.setItem("sitex-ads", JSON.stringify(ads));
	} catch {}
}
function statusFromSpeed(bus, kmh) {
	if (bus.status === "idle" || bus.status === "arrived" || bus.status === "suspended") return bus.status;
	if (kmh < bus.cruiseKmh * .72) return "delayed";
	return "en-route";
}
var seedNow = 0;
var useFleet = create((set, get) => ({
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
		const { buses, weather } = get();
		set({
			now,
			buses: buses.map((b) => recycleArrived(stepBus(b, dtSec, weather, now), now))
		});
	},
	setOnline: (online) => set({ online }),
	setWeather: (weather) => {
		set({ weather });
		pushWeather({ data: { weather } }).catch(() => set({ cloud: false }));
		if (weather === "typhoon") get().publishAnnouncement({
			level: "critical",
			title: "No travel today",
			body: "Due to typhoon signal and LGU ordinance, all trips are suspended until further notice.",
			showHotlines: true
		});
	},
	publishAnnouncement: (a) => {
		const announcement = {
			...a,
			updatedAt: Date.now()
		};
		set({ announcement });
		pushAnnouncement({ data: announcement }).catch(() => set({ cloud: false }));
		try {
			localStorage.setItem("sitex-announcement", JSON.stringify(announcement));
		} catch {}
	},
	selectBus: (id) => set({ selectedBusId: id }),
	setDriverSpeed: (id, kmh) => {
		const now = Date.now();
		set({
			now,
			buses: get().buses.map((b) => b.id === id ? {
				...b,
				speedKmh: kmh,
				targetSpeedKmh: kmh,
				driverControlled: true,
				lastFixAt: now,
				status: statusFromSpeed(b, kmh)
			} : b)
		});
		pushBusSoon(id);
	},
	startTrip: (id) => {
		const now = Date.now();
		set({
			now,
			buses: get().buses.map((b) => {
				if (b.id !== id) return b;
				const remaining = b.remainingKm > 1 ? b.remainingKm : b.totalKm * .95;
				const pos = alongOfficialRoute(b.waypoints, b.totalKm - remaining, b.totalKm);
				return {
					...b,
					remainingKm: remaining,
					speedKmh: b.cruiseKmh,
					targetSpeedKmh: b.cruiseKmh,
					status: "en-route",
					driverControlled: true,
					lat: pos.lat,
					lng: pos.lng,
					heading: pos.heading,
					lastFixAt: now
				};
			})
		});
		pushBusSoon(id, true);
	},
	endTrip: (id) => {
		const now = Date.now();
		set({
			now,
			buses: get().buses.map((b) => b.id === id ? {
				...b,
				status: "idle",
				speedKmh: 0,
				targetSpeedKmh: 0,
				remainingKm: 0,
				driverControlled: false,
				gpsSource: "sim",
				gpsAccuracyM: null,
				lastFixAt: now
			} : b)
		});
		pushBusSoon(id, true);
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
					const snap = nearestOnPolyline(b.waypoints, {
						lat: fix.lat,
						lng: fix.lng
					});
					const nextRem = snap.totalKm > 0 ? b.totalKm * (snap.remainingKm / snap.totalKm) : b.remainingKm;
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
					gpsSource: "phone",
					gpsAccuracyM: fix.accuracyM,
					lat,
					lng,
					heading,
					lastFixAt: now,
					status: moving === "en-route" || moving === "delayed" ? statusFromSpeed({
						...b,
						status: moving
					}, speed) : moving
				};
			})
		});
		pushBusSoon(id);
	},
	stopPhoneGps: (id) => {
		set({ buses: get().buses.map((b) => b.id === id ? {
			...b,
			gpsSource: "sim",
			gpsAccuracyM: null
		} : b) });
	},
	addReport: (input) => {
		const ticket = `SX-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
		const report = {
			id: crypto.randomUUID(),
			ticket,
			category: input.category,
			route: input.route,
			description: input.description,
			anonymous: input.anonymous,
			status: "new",
			createdAt: Date.now()
		};
		const reports = [report, ...get().reports];
		set({ reports });
		pushReport({ data: {
			id: report.id,
			ticket: report.ticket,
			category: report.category,
			route: report.route,
			issueNote: report.description.slice(0, 200),
			status: report.status,
			createdAt: report.createdAt
		} }).catch(() => set({ cloud: false }));
		try {
			localStorage.setItem("sitex-reports", JSON.stringify(reports));
		} catch {}
		return ticket;
	},
	updateReport: (id, status, forwardedTo) => {
		const reports = get().reports.map((r) => r.id === id ? {
			...r,
			status,
			forwardedTo: forwardedTo ?? r.forwardedTo
		} : r);
		set({ reports });
		if (status === "forwarded") forwardReport({ data: {
			id,
			forwardedTo: forwardedTo || "Sitex / SM Sorsogon"
		} }).catch(() => set({ cloud: false }));
		try {
			localStorage.setItem("sitex-reports", JSON.stringify(reports));
		} catch {}
	},
	upsertAd: (ad) => {
		const ads = get().ads;
		const next = ads.findIndex((a) => a.id === ad.id) >= 0 ? ads.map((a) => a.id === ad.id ? ad : a) : [...ads, ad];
		set({ ads: next });
		persistAds(next);
		if (!ad.src.startsWith("idb:")) pushAd({ data: ad }).catch(() => set({ cloud: false }));
	},
	toggleAd: (id, active) => {
		const ads = get().ads.map((a) => a.id === id ? {
			...a,
			active,
			updatedAt: Date.now()
		} : a);
		set({ ads });
		persistAds(ads);
		const ad = ads.find((a) => a.id === id);
		if (ad && !ad.src.startsWith("idb:")) pushAd({ data: ad }).catch(() => set({ cloud: false }));
	},
	removeAd: (id) => {
		const target = get().ads.find((a) => a.id === id);
		const ads = get().ads.filter((a) => a.id !== id);
		set({ ads });
		persistAds(ads);
		if (target?.src.startsWith("idb:")) deleteAdBlob(target.src.slice(4));
	},
	askIfComing: (busId) => {
		const bus = get().buses.find((b) => b.id === busId);
		if (!bus) return;
		if (get().asks.find((a) => a.busId === busId && a.status === "pending")) return;
		const ask = {
			id: crypto.randomUUID(),
			busId: bus.id,
			plate: bus.plate,
			destination: bus.destination,
			zip: bus.zip,
			status: "pending",
			askedAt: Date.now(),
			confirmedAt: null
		};
		const asks = [ask, ...get().asks];
		set({ asks });
		persistAsks(asks);
		pushAsk({ data: ask }).catch(() => set({ cloud: false }));
	},
	confirmAsk: (id) => {
		const confirmedAt = Date.now();
		const asks = get().asks.map((a) => a.id === id ? {
			...a,
			status: "confirmed",
			confirmedAt
		} : a);
		set({ asks });
		persistAsks(asks);
		const row = asks.find((a) => a.id === id);
		confirmAskRemote({ data: {
			id,
			confirmedAt
		} }).catch(() => set({ cloud: false }));
		if (row) pushAsk({ data: row }).catch(() => set({ cloud: false }));
	}
}));
function hydrateFleet() {
	if (useFleet.getState().hydrated) return;
	const now = Date.now();
	useFleet.setState({
		hydrated: true,
		now,
		buses: createInitialBuses(now),
		reports: loadReports(),
		announcement: loadAnnouncement(),
		ads: loadAds(),
		asks: loadAsks(),
		online: typeof navigator === "undefined" ? true : navigator.onLine
	});
	pullCloud();
}
function startTelemetryLoop() {
	hydrateFleet();
	const g = globalThis;
	g.__sitexLoopUsers = (g.__sitexLoopUsers ?? 0) + 1;
	if (g.__sitexLoopStop) return () => {
		g.__sitexLoopUsers = Math.max(0, (g.__sitexLoopUsers ?? 1) - 1);
		if ((g.__sitexLoopUsers ?? 0) === 0) {
			g.__sitexLoopStop?.();
			g.__sitexLoopStop = void 0;
		}
	};
	let last = performance.now();
	let raf = 0;
	const loop = (t) => {
		const dt = Math.min(1, (t - last) / 1e3);
		last = t;
		useFleet.getState().tick(dt);
		raf = requestAnimationFrame(loop);
	};
	raf = requestAnimationFrame(loop);
	const onOnline = () => {
		useFleet.getState().setOnline(true);
		pullCloud();
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
			g.__sitexLoopStop = void 0;
		}
	};
}
var ANNOUNCEMENT_TEMPLATES = {
	critical: {
		level: "critical",
		title: "No travel today",
		body: "Due to typhoon signal and LGU ordinance, all trips are suspended until further notice.",
		showHotlines: true
	},
	caution: {
		level: "caution",
		title: "Limited service",
		body: "Due to bad weather, only 2–5 buses are operating today on selected routes. Check live arrivals below.",
		showHotlines: false
	},
	info: {
		level: "info",
		title: "Service update",
		body: "Normal operations have resumed. Thank you for your patience.",
		showHotlines: false
	}
};
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("liquid-glass relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-40", {
	variants: {
		variant: {
			default: "liquid-glass-accent text-accent-fg",
			secondary: "liquid-glass-clear text-fg",
			ghost: "liquid-glass-ghost text-muted",
			danger: "liquid-glass-danger text-accent-fg"
		},
		size: {
			default: "h-11 rounded-md px-4 text-sm",
			sm: "h-10 min-h-10 rounded-sm px-3 text-sm",
			lg: "h-12 rounded-lg px-6 text-base",
			icon: "size-11 rounded-md"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function spawnRipple(target, clientX, clientY) {
	const rect = target.getBoundingClientRect();
	const span = document.createElement("span");
	const size = Math.max(rect.width, rect.height) * 1.8;
	span.className = "liquid-ripple";
	span.style.width = `${size}px`;
	span.style.height = `${size}px`;
	span.style.left = `${clientX - rect.left - size / 2}px`;
	span.style.top = `${clientY - rect.top - size / 2}px`;
	target.appendChild(span);
	window.setTimeout(() => span.remove(), 650);
}
function Button({ className, variant, size, asChild, onClick, ...props }) {
	const Comp = asChild ? Slot : "button";
	const handleClick = (e) => {
		spawnRipple(e.currentTarget, e.clientX, e.clientY);
		onClick?.(e);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props,
		onClick: handleClick
	});
}
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("glass rounded-xl p-5", className),
		...props
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/input-Cxa8AIpn.js
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg placeholder:text-subtle", className),
		...props
	});
}
//#endregion
export { useFleet as _, MUNICIPALITIES as a, cn as c, haversineKm as d, inSorsogon as f, startTelemetryLoop as g, saveAdBlob as h, Card as i, compressImageFile as l, resolveAdSrc as m, ANNOUNCEMENT_TEMPLATES as n, PLATES as o, isUploadedSrc as p, Button as r, SITEX as s, Input as t, detectKind as u };
