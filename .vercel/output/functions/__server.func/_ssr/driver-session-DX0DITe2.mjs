import { o as PLATES } from "./input-Cxa8AIpn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/driver-session-DX0DITe2.js
var KEY = "sitex-driver-claim";
function normalizePlate(plate) {
	return plate.replace(/[\s-]/g, "").toUpperCase();
}
/** Cooperative-issued 4-digit trip code. Not shown on the public board. */
function tripCodeFor(plate) {
	let h = 2166136261;
	for (const c of normalizePlate(plate)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
	return String(1e3 + Math.abs(h) % 9e3);
}
var STAFF_TRIP_CODES = PLATES.map((plate) => ({
	plate,
	code: tripCodeFor(plate)
}));
function findBusByPlate(buses, plate) {
	const n = normalizePlate(plate);
	return buses.find((b) => normalizePlate(b.plate) === n);
}
function loadClaim() {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed?.busId || !parsed.plate) return null;
		return parsed;
	} catch {
		return null;
	}
}
function saveClaim(claim) {
	try {
		localStorage.setItem(KEY, JSON.stringify(claim));
	} catch {}
}
function clearClaim() {
	try {
		localStorage.removeItem(KEY);
	} catch {}
}
function verifyTripCode(plate, code) {
	const expected = tripCodeFor(plate);
	return code.replace(/\s/g, "") === expected;
}
//#endregion
export { saveClaim as a, loadClaim as i, clearClaim as n, verifyTripCode as o, findBusByPlate as r, STAFF_TRIP_CODES as t };
