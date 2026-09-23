import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as useFleet, c as cn, i as Card, r as Button } from "./input-Cxa8AIpn.mjs";
import { n as colorForRoute, t as MiniBus } from "./eta-MZjSs9q9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coming-sign-CB8MyHkP.js
var import_jsx_runtime = require_jsx_runtime();
function liveAsks(asks, now) {
	const cutoff = now - 27e5;
	return asks.filter((a) => {
		if (a.status === "expired") return false;
		if (a.status === "confirmed") return (a.confirmedAt ?? a.askedAt) > cutoff;
		return a.askedAt > now - 72e5;
	});
}
function ConfirmedSigns({ huge = false }) {
	const confirmed = liveAsks(useFleet((s) => s.asks), useFleet((s) => s.now) || Date.now()).filter((a) => a.status === "confirmed");
	if (confirmed.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-3",
		children: confirmed.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: cn("confirm-sign rounded-xl px-5 py-5 md:px-7 md:py-6", huge && "md:py-8"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.22em] text-emerald-100",
					children: "Conductor confirmed"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("mt-1 font-display font-semibold tracking-tight text-white", huge ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"),
					children: ["BUS ", a.plate]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("mt-1 font-bold uppercase tracking-wide text-amber-200", huge ? "text-2xl md:text-4xl" : "text-xl"),
					children: [a.destination, " is coming to SITEX"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-sky-100/85",
					children: [
						"Driver / conductor tapped Confirmed. Plate ",
						a.plate,
						" · zip ",
						a.zip,
						"."
					]
				})
			]
		}, a.id))
	});
}
function PassengerAskPanel({ buses }) {
	const asks = useFleet((s) => s.asks);
	const now = useFleet((s) => s.now) || Date.now();
	const askIfComing = useFleet((s) => s.askIfComing);
	const live = liveAsks(asks, now);
	const rows = buses.filter((b) => b.status === "en-route" || b.status === "delayed" || b.status === "idle");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-wide text-accent",
			children: "Ask the conductor"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl font-semibold tracking-tight",
			children: "Is this bus coming?"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Send a ping to the driver or conductor. When they tap Confirmed, the plate lights up on every SITEX screen."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 flex flex-col gap-2",
			children: rows.map((b) => {
				const mine = live.find((a) => a.busId === b.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-3",
					style: { borderLeft: `4px solid ${colorForRoute(b.routeId)}` },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBus, {
							routeId: b.routeId,
							size: 28
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm font-bold",
							children: b.plate
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-wide text-muted",
							children: b.destination
						})] })]
					}), mine?.status === "confirmed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-ok/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ok",
						children: "Confirmed"
					}) : mine?.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ask-pulse rounded-full bg-warn/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn",
						children: "Waiting…"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => askIfComing(b.id),
						children: "Ask if coming"
					})]
				}, b.id);
			})
		})
	] });
}
function DriverConfirmPanel({ busId }) {
	const asks = useFleet((s) => s.asks);
	const now = useFleet((s) => s.now) || Date.now();
	const confirmAsk = useFleet((s) => s.confirmAsk);
	const pending = liveAsks(asks, now).filter((a) => a.busId === busId && a.status === "pending");
	const confirmed = liveAsks(asks, now).filter((a) => a.busId === busId && a.status === "confirmed");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-wide text-accent",
			children: "Passenger pings"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl font-semibold tracking-tight",
			children: "Confirm you are coming"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Waiting passengers asked if this bus will arrive at SITEX. One tap posts your plate on the public board."
		}),
		pending.length === 0 && confirmed.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-muted",
			children: "No passenger asks right now."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-4 flex flex-col gap-3",
			children: [pending.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-lg border border-warn/35 bg-warn/10 px-4 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-widest text-warn",
						children: "Waiting for you"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-2xl font-semibold",
						children: "Are you coming to SITEX?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							a.destination,
							" · plate ",
							a.plate
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 w-full",
						size: "lg",
						onClick: () => confirmAsk(a.id),
						children: "Confirmed"
					})
				]
			}, a.id)), confirmed.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-lg border border-ok/30 bg-ok/10 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-bold uppercase tracking-wide text-ok",
					children: "Posted on public board"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-lg font-bold",
					children: a.plate
				})]
			}, a.id))]
		})
	] });
}
//#endregion
export { DriverConfirmPanel as n, PassengerAskPanel as r, ConfirmedSigns as t };
