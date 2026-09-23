import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as useFleet, i as Card, r as Button, t as Input } from "./input-Cxa8AIpn.mjs";
import { t as ArrivalBoard } from "./arrival-board-CmkrvIi-.mjs";
import { r as PassengerAskPanel, t as ConfirmedSigns } from "./coming-sign-CB8MyHkP.mjs";
import { t as InstallAppCard } from "./install-app-CE8PwQu6.mjs";
import { a as LiveMap, i as JourneyPlanner, n as AnnouncementBanner, r as HotlineStrip, t as AdBillboard } from "./live-map-ulkHXB2p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/passenger-CeRpBxuM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Passenger() {
	const buses = useFleet((s) => s.buses);
	const [q, setQ] = (0, import_react.useState)("");
	const filtered = (0, import_react.useMemo)(() => {
		if (!q) return buses;
		const s = q.toLowerCase();
		return buses.filter((b) => b.destination.toLowerCase().includes(s) || b.plate.toLowerCase().includes(s) || b.zip.includes(s) || b.via.toLowerCase().includes(s));
	}, [buses, q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-lg flex-col gap-4 md:max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold tracking-tight",
				children: "Where are you going?"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Pick your town. See when the next bus reaches SITEX and what time you’ll be home."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnnouncementBanner, { compact: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmedSigns, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PassengerAskPanel, { buses: filtered }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JourneyPlanner, { compact: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Search town, zip, or plate",
				"aria-label": "Search destination"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveMap, { buses: filtered })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs font-medium uppercase tracking-wide text-accent",
				children: "Upcoming"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrivalBoard, {
				buses: filtered,
				compact: true
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdBillboard, { compact: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HotlineStrip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallAppCard, { who: "passenger" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/report",
					children: "Report an issue"
				})
			})
		]
	});
}
//#endregion
export { Passenger as component };
