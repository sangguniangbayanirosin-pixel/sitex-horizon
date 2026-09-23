import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-CZTGAeWG.mjs";
import { a as formatKm, i as formatEta, n as colorForRoute, o as formatSpeed, r as etaMinutes, t as MiniBus } from "./eta-MZjSs9q9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/arrival-board-CmkrvIi-.js
var import_jsx_runtime = require_jsx_runtime();
var tone = {
	"en-route": "ok",
	delayed: "warn",
	arrived: "muted",
	suspended: "danger",
	idle: "muted"
};
function ArrivalBoard({ buses, compact = false }) {
	const rows = [...buses].sort((a, b) => {
		return (etaMinutes(a.remainingKm, a.speedKmh) ?? 9999) - (etaMinutes(b.remainingKm, b.speedKmh) ?? 9999);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-x-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-xs uppercase tracking-wide text-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-2 pr-3 font-medium",
						children: "Destination"
					}),
					!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-2 pr-3 font-medium",
						children: "Zip"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-2 pr-3 font-medium",
						children: "Bus"
					}),
					!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-2 pr-3 font-medium",
						children: "Left"
					}),
					!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-2 pr-3 font-medium",
						children: "Speed"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-2 pr-3 font-medium",
						children: "ETA"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-2 font-medium",
						children: "Status"
					})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2.5 pr-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBus, {
								routeId: b.routeId,
								size: 30,
								title: b.destination
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-base font-bold uppercase tracking-wide",
								style: { color: colorForRoute(b.routeId) },
								children: b.destination
							}), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-xs text-muted",
								children: b.via
							})] })]
						})
					}),
					!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2.5 pr-3 font-mono text-muted",
						children: b.zip
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2.5 pr-3 font-mono text-xs",
						children: b.plate
					}),
					!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2.5 pr-3 font-mono tabular-nums",
						children: formatKm(b.remainingKm)
					}),
					!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2.5 pr-3 font-mono tabular-nums",
						children: formatSpeed(b.speedKmh)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2.5 pr-3 font-mono tabular-nums",
						children: formatEta(etaMinutes(b.remainingKm, b.speedKmh))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: tone[b.status],
							children: b.status
						})
					})
				]
			}, b.id)) })]
		}), rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-6 text-sm text-muted",
			children: "No buses on this filter."
		})]
	});
}
//#endregion
export { ArrivalBoard as t };
