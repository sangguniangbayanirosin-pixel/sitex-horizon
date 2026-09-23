import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as useFleet, a as MUNICIPALITIES, c as cn, i as Card } from "./input-Cxa8AIpn.mjs";
import { t as Badge } from "./badge-CZTGAeWG.mjs";
import { a as SitexLiveReel } from "./router-NBrjZWpE.mjs";
import { a as formatKm, i as formatEta, n as colorForRoute, o as formatSpeed, r as etaMinutes, t as MiniBus } from "./eta-MZjSs9q9.mjs";
import { t as ArrivalBoard } from "./arrival-board-CmkrvIi-.mjs";
import { t as ConfirmedSigns } from "./coming-sign-CB8MyHkP.mjs";
import { a as LiveMap, i as JourneyPlanner, n as AnnouncementBanner, o as rideMinutes, r as HotlineStrip, t as AdBillboard } from "./live-map-ulkHXB2p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DB6t5pzl.js
var import_jsx_runtime = require_jsx_runtime();
function MunicipalityBoard() {
	const buses = useFleet((s) => s.buses);
	const weather = useFleet((s) => s.weather);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-3 flex flex-wrap items-end justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-wide text-accent",
			children: "Province coverage"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl font-semibold tracking-tight",
			children: "16 LGUs · accurate road km from SITEX"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-xs text-muted",
			children: "Zip 4700–4715"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
		children: MUNICIPALITIES.map((m) => {
			const next = buses.filter((b) => b.destination === m.name).map((b) => ({
				b,
				eta: etaMinutes(b.remainingKm, b.speedKmh)
			})).sort((a, c) => (a.eta ?? 9999) - (c.eta ?? 9999))[0];
			const ride = rideMinutes(m.roadKm, m.cruiseKmh, weather);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-lg border border-border bg-bg/40 px-3 py-3",
				style: { borderLeft: `4px solid ${m.color}` },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-1.5 text-lg font-bold uppercase tracking-wide",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBus, {
								color: m.color,
								size: 28,
								title: `${m.name} bus`
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { color: m.color },
								children: m.name
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-muted",
							children: m.zip
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-mono text-xs text-muted",
						children: [
							formatKm(m.roadKm),
							" · ride ",
							formatEta(ride)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: cn("mt-2 font-mono text-sm", next?.eta != null ? "text-accent" : "text-muted"),
						children: ["Next ", next ? formatEta(next.eta) : "—"]
					})
				]
			}, m.id);
		})
	})] });
}
function NextArrivals({ buses }) {
	const rows = [...buses].filter((b) => b.status === "en-route" || b.status === "delayed").sort((a, b) => {
		return (etaMinutes(a.remainingKm, a.speedKmh) ?? 9999) - (etaMinutes(b.remainingKm, b.speedKmh) ?? 9999);
	}).slice(0, 6);
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "No live inbound buses. Check weather and announcements."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
		children: rows.map((b, i) => {
			const eta = etaMinutes(b.remainingKm, b.speedKmh);
			const color = colorForRoute(b.routeId);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-lg border border-border bg-bg/50 px-4 py-4",
				style: { borderLeft: `4px solid ${color}` },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-widest text-muted",
							children: i === 0 ? "Next in" : "Then"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: b.status === "delayed" ? "warn" : "ok",
							children: b.status
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mt-1 font-display font-semibold tracking-tight", i === 0 ? "text-5xl" : "text-4xl"),
						children: formatEta(eta)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 flex items-center gap-2 text-xl font-bold uppercase tracking-wide",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBus, {
							color,
							size: 32,
							title: b.destination
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { color },
							children: b.destination
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-mono text-xs text-muted",
						children: [
							b.plate,
							" · ",
							formatKm(b.remainingKm),
							" · ",
							formatSpeed(b.speedKmh)
						]
					})
				]
			}, b.id);
		})
	});
}
function Terminal() {
	const buses = useFleet((s) => s.buses);
	const now = useFleet((s) => s.now);
	const weather = useFleet((s) => s.weather);
	const active = buses.filter((b) => b.status === "en-route" || b.status === "delayed").length;
	const last = Math.max(...buses.map((b) => b.lastFixAt));
	const age = Math.max(0, Math.round((now - last) / 1e3));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnnouncementBanner, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmedSigns, { huge: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs font-medium uppercase tracking-wide text-accent",
					children: "Next buses to SITEX"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NextArrivals, { buses })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative overflow-hidden rounded-xl outline outline-1 -outline-offset-1 outline-fg/15",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SitexLiveReel, { className: "aspect-video h-36 w-full sm:h-40 lg:h-44" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-medium uppercase tracking-[0.18em] text-sky-200",
								children: "SITEX · SM Sorsogon"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-sm font-semibold text-white",
								children: "Terminal view"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-xs font-medium uppercase tracking-wide text-accent",
							children: "Live GPS map"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveMap, {
							buses,
							compact: true
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdBillboard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[1.2fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs font-medium uppercase tracking-wide text-accent",
					children: "All arrivals"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrivalBoard, { buses })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JourneyPlanner, { compact: true })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MunicipalityBoard, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-xs text-muted",
				children: [
					active,
					" buses live · GPS ",
					age,
					"s ago · weather ",
					weather
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HotlineStrip, {})
		]
	});
}
//#endregion
export { Terminal as component };
