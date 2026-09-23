import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as MUNICIPALITIES, c as cn } from "./input-Cxa8AIpn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/eta-MZjSs9q9.js
var import_jsx_runtime = require_jsx_runtime();
var BY_ID = Object.fromEntries(MUNICIPALITIES.map((m) => [m.id, m.color]));
var BY_NAME = Object.fromEntries(MUNICIPALITIES.map((m) => [m.name.toLowerCase(), m.color]));
function colorForRoute(routeId) {
	return BY_ID[routeId] ?? "#5B9DFF";
}
function colorForTown(name) {
	return BY_NAME[name.toLowerCase()] ?? "#5B9DFF";
}
function miniBusSvg(fill, size = 40) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * .55)}" viewBox="0 0 48 26" aria-hidden="true">
  <rect x="3.2" y="4" width="39.5" height="13.2" rx="3.6" fill="${fill}"/>
  <path d="M3.2 10.2 V17 H1.4 A1.4 1.4 0 0 1 0 15.6 V12.4 Z" fill="${fill}"/>
  <rect x="8" y="6.4" width="8" height="6.2" rx="1.1" fill="#061018" opacity="0.5"/>
  <rect x="18" y="6.4" width="8" height="6.2" rx="1.1" fill="#061018" opacity="0.42"/>
  <rect x="28" y="6.4" width="7.2" height="6.2" rx="1.1" fill="#061018" opacity="0.34"/>
  <rect x="37.4" y="8" width="3.2" height="2.3" rx="0.45" fill="#fff8d6"/>
  <circle cx="13" cy="19.6" r="3.15" fill="#0b1220"/>
  <circle cx="13" cy="19.6" r="1.35" fill="#cbd5e1"/>
  <circle cx="35" cy="19.6" r="3.15" fill="#0b1220"/>
  <circle cx="35" cy="19.6" r="1.35" fill="#cbd5e1"/>
  <rect x="6" y="15.4" width="34" height="1.15" fill="#061018" opacity="0.22"/>
</svg>`;
}
function MiniBus({ color, routeId, town, className, size = 28, title }) {
	const fill = color ?? (routeId ? colorForRoute(routeId) : town ? colorForTown(town) : "#5B9DFF");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex shrink-0 items-center justify-center", className),
		style: {
			width: size,
			height: Math.round(size * .55)
		},
		title,
		"aria-hidden": !title,
		dangerouslySetInnerHTML: { __html: miniBusSvg(fill, size) }
	});
}
function etaMinutes(remainingKm, speedKmh) {
	if (speedKmh <= 1 || remainingKm <= 0) return null;
	return remainingKm / speedKmh * 60;
}
function formatEta(mins) {
	if (mins == null) return "—";
	if (mins < 1) return "<1 min";
	if (mins < 60) return `${Math.round(mins)} min`;
	const h = Math.floor(mins / 60);
	const m = Math.round(mins % 60);
	return m ? `${h}h ${m}m` : `${h}h`;
}
function formatKm(km) {
	if (km < .1) return "<0.1 km";
	return `${km.toFixed(1)} km`;
}
function formatSpeed(kmh) {
	return `${Math.round(kmh)} km/h`;
}
//#endregion
export { formatKm as a, formatEta as i, colorForRoute as n, formatSpeed as o, etaMinutes as r, miniBusSvg as s, MiniBus as t };
