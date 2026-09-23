import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as useFleet, a as MUNICIPALITIES, c as cn, i as Card, m as resolveAdSrc, s as SITEX } from "./input-Cxa8AIpn.mjs";
import { t as Badge } from "./badge-CZTGAeWG.mjs";
import { a as formatKm, i as formatEta, n as colorForRoute, r as etaMinutes, s as miniBusSvg, t as MiniBus } from "./eta-MZjSs9q9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-map-ulkHXB2p.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdBillboard({ compact = false }) {
	const ads = useFleet((s) => s.ads);
	const live = (0, import_react.useMemo)(() => ads.filter((a) => a.active && a.src), [ads]);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [resolved, setResolved] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		Promise.all(live.map(async (ad) => {
			const src = await resolveAdSrc(ad.src);
			const poster = ad.posterSrc ? await resolveAdSrc(ad.posterSrc) : "";
			return [
				ad.id,
				src,
				poster
			];
		})).then((rows) => {
			if (cancelled) return;
			const next = {};
			for (const [id, src, poster] of rows) {
				if (src) next[id] = src;
				if (poster) next[`${id}-poster`] = poster;
			}
			setResolved(next);
		});
		return () => {
			cancelled = true;
		};
	}, [live]);
	(0, import_react.useEffect)(() => {
		if (live.length < 2) return;
		const current = live[index % live.length];
		const ms = Math.max(5, current?.dwellSec ?? 12) * 1e3;
		const t = window.setTimeout(() => setIndex((i) => (i + 1) % live.length), ms);
		return () => window.clearTimeout(t);
	}, [live, index]);
	if (live.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "glass overflow-hidden rounded-xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("flex flex-col justify-end p-5", compact ? "min-h-36" : "min-h-44"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "muted",
					className: "w-fit",
					children: "Partner space"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 font-display text-2xl font-semibold tracking-tight",
					children: "This screen is for Sorsogon"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Sitex admin can upload a poster or HD video here. Every waiting passenger sees it."
				})
			]
		})
	});
	const ad = live[index % live.length];
	const src = resolved[ad.id] || (ad.src.startsWith("idb:") ? "" : ad.src);
	const poster = resolved[`${ad.id}-poster`] || ad.posterSrc;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass overflow-hidden rounded-xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 border-b border-border px-4 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "muted",
					children: "Advertisement"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs uppercase tracking-widest text-muted",
					children: ad.sponsor
				})]
			}), live.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1.5",
				children: live.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Show ad ${i + 1}`,
					onClick: () => setIndex(i),
					className: cn("size-2 rounded-full", i === index % live.length ? "bg-accent" : "bg-fg/25")
				}, item.id))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdCreative, {
			ad,
			src,
			poster,
			compact
		})]
	});
}
function AdCreative({ ad, src, poster, compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden bg-bg", compact ? "aspect-video" : "ad-cinema"),
		children: [
			ad.kind === "video" && src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				className: "absolute inset-0 size-full object-cover",
				src,
				poster,
				autoPlay: true,
				muted: true,
				loop: true,
				playsInline: true
			}, src) : src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: "",
				className: "absolute inset-0 size-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-surface-2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 md:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 max-w-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl font-semibold tracking-tight md:text-3xl",
						children: ad.headline
					}), ad.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-fg/85",
						children: ad.caption
					})]
				}), ad.ctaLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: ad.ctaUrl || "#",
					className: "inline-flex h-11 shrink-0 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg",
					children: ad.ctaLabel
				})]
			})
		]
	});
}
var HOTLINES = [
	{
		label: "Emergency",
		n: "911"
	},
	{
		label: "PNP",
		n: "117"
	},
	{
		label: "PDRRMO Sorsogon",
		n: "(056) 421-5074"
	},
	{
		label: "SITEX info",
		n: "(056) 211-1700"
	}
];
function AnnouncementBanner({ compact = false }) {
	const a = useFleet((s) => s.announcement);
	if (a.level === "none" || !a.title) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("rounded-xl border p-5 md:p-6", a.level === "critical" && "border-danger/40 bg-danger/15", a.level === "caution" && "border-warn/40 bg-warn/12", a.level === "info" && "border-accent/35 bg-accent/10"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-widest text-muted",
				children: "Public announcement"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: cn("mt-1 font-display font-semibold tracking-tight", compact ? "text-2xl" : "text-3xl md:text-5xl"),
				children: a.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-2 max-w-3xl text-fg/90", compact ? "text-sm" : "text-base md:text-lg"),
				children: a.body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-display text-lg font-semibold tracking-wide text-accent md:text-xl",
				children: "Ingat po ang lahat"
			}),
			a.showHotlines && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm",
				children: HOTLINES.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: h.label
					}),
					" ",
					h.n
				] }, h.n))
			})
		]
	});
}
function HotlineStrip() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "glass rounded-xl px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-widest text-muted",
			children: "Ingat po ang lahat · emergency hotlines"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm",
			children: HOTLINES.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: h.label
				}),
				" ",
				h.n
			] }, h.n))
		})]
	});
}
var BOARDING_MIN = 8;
function weatherSpeedFactor(weather) {
	if (weather === "typhoon") return 0;
	if (weather === "rain") return .72;
	return 1;
}
function rideMinutes(roadKm, cruiseKmh, weather) {
	const speed = cruiseKmh * weatherSpeedFactor(weather);
	if (speed <= 1 || roadKm <= 0) return null;
	return roadKm / speed * 60;
}
function planJourney(destName, buses, weather, now) {
	const town = MUNICIPALITIES.find((m) => m.name === destName);
	if (!town) return null;
	const suspended = weather === "typhoon";
	const rideMin = rideMinutes(town.roadKm, town.cruiseKmh, weather);
	const next = buses.filter((b) => b.destination === destName).map((b) => ({
		b,
		eta: b.status === "idle" || b.status === "arrived" ? 0 : etaMinutes(b.remainingKm, b.speedKmh)
	})).sort((a, c) => (a.eta ?? 9999) - (c.eta ?? 9999))[0];
	const waitMin = next ? next.eta ?? null : null;
	const boardMin = next && (next.b.status === "idle" || next.b.status === "arrived") ? 5 : BOARDING_MIN;
	let totalMin = null;
	if (!suspended && rideMin != null && waitMin != null) totalMin = waitMin + boardMin + rideMin;
	else if (!suspended && rideMin != null && waitMin == null) totalMin = boardMin + rideMin;
	return {
		town,
		bus: next?.b ?? null,
		waitMin,
		rideMin,
		boardMin,
		totalMin,
		homeAt: totalMin != null ? now + totalMin * 6e4 : null,
		suspended
	};
}
function formatClock(ms) {
	return new Date(ms).toLocaleTimeString("en-PH", {
		hour: "numeric",
		minute: "2-digit"
	});
}
function JourneyPlanner({ compact = false }) {
	const buses = useFleet((s) => s.buses);
	const weather = useFleet((s) => s.weather);
	const now = useFleet((s) => s.now);
	const [dest, setDest] = (0, import_react.useState)("Gubat");
	const journey = (0, import_react.useMemo)(() => planJourney(dest, buses, weather, now || Date.now()), [
		dest,
		buses,
		weather,
		now
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-wide text-accent",
			children: "Going home?"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl font-semibold tracking-tight md:text-3xl",
			children: "Measure your travel time"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Wait at SITEX + ride on the road. Updates as the bus speed changes."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4",
			children: MUNICIPALITIES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setDest(m.name),
				className: cn("flex h-11 items-center justify-center gap-1.5 rounded-md border px-2 text-sm font-bold uppercase tracking-wide", dest === m.name ? "border-transparent text-fg" : "border-border text-muted"),
				style: dest === m.name ? {
					background: `${m.color}33`,
					borderColor: m.color,
					color: m.color
				} : { borderLeft: `4px solid ${m.color}` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBus, {
					color: m.color,
					size: 22
				}), m.name]
			}, m.id))
		}),
		journey && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JourneyResult, {
			journey,
			compact
		})
	] });
}
function JourneyResult({ journey, compact }) {
	const { town, bus, waitMin, rideMin, boardMin, totalMin, homeAt, suspended } = journey;
	if (suspended) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 rounded-lg border border-danger/40 bg-danger/10 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl font-semibold",
			children: "No travel today"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Typhoon / LGU ordinance. Stay safe — Ingat po ang lahat."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 grid gap-3 md:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Bus at SITEX",
				value: formatEta(waitMin),
				hint: bus ? bus.plate : "No unit live"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Loading",
				value: `${boardMin} min`,
				hint: "Bay time before departure"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: `Ride to ${town.name}`,
				value: formatEta(rideMin),
				hint: `${formatKm(town.roadKm)} · zip ${town.zip}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "You'll be home",
				value: homeAt ? formatClock(homeAt) : "—",
				hint: totalMin != null ? `about ${formatEta(totalMin)} from now` : "Waiting for a live bus",
				accent: true
			}),
			!compact && bus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "md:col-span-4 text-sm text-muted",
				children: [
					bus.plate,
					" · ",
					bus.operator,
					" · ",
					formatKm(bus.remainingKm),
					" out · GPS",
					" ",
					bus.gpsSource === "phone" ? "phone" : "live sim",
					" · inbound",
					" ",
					formatEta(etaMinutes(bus.remainingKm, bus.speedKmh)),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: bus.status === "delayed" ? "warn" : "ok",
						children: bus.status
					})
				]
			})
		]
	});
}
function Stat({ label, value, hint, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-bg/50 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-wide text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-1 font-display text-3xl font-semibold tracking-tight", accent && "text-accent"),
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: hint
			})
		]
	});
}
function busHtml(b) {
	const color = colorForRoute(b.routeId);
	return `<div class="bus-marker${b.status === "delayed" ? " is-delayed" : ""}">
    <span class="bus-icon" style="transform:rotate(${Math.round(b.heading - 90)}deg)">${miniBusSvg(color, 42)}</span>
    <span class="bus-plate">${b.plate}</span>
  </div>`;
}
function syncBuses(L, map, layer, buses) {
	const live = buses.filter((b) => b.status === "en-route" || b.status === "delayed");
	const keep = new Set(live.map((b) => b.id));
	for (const [id, marker] of layer) if (!keep.has(id)) {
		marker.remove();
		layer.delete(id);
	}
	for (const b of live) {
		const html = busHtml(b);
		const existing = layer.get(b.id);
		if (existing) {
			existing.setLatLng([b.lat, b.lng]);
			const el = existing.getElement();
			if (el) el.innerHTML = html;
			continue;
		}
		const marker = L.marker([b.lat, b.lng], {
			icon: L.divIcon({
				className: "bus-pin",
				html,
				iconSize: [42, 24],
				iconAnchor: [21, 18]
			}),
			zIndexOffset: 800,
			keyboard: false
		}).addTo(map);
		layer.set(b.id, marker);
	}
}
function LiveMap({ buses, compact = false }) {
	const host = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const leafletRef = (0, import_react.useRef)(null);
	const layerRef = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const busesRef = (0, import_react.useRef)(buses);
	busesRef.current = buses;
	(0, import_react.useEffect)(() => {
		if (!host.current || mapRef.current) return;
		let cancelled = false;
		let ro = null;
		import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.t())).then((mod) => {
			const L = mod.default ?? mod;
			if (cancelled || !host.current || mapRef.current) return;
			const map = L.map(host.current, {
				zoomControl: true,
				attributionControl: true,
				minZoom: 9,
				maxZoom: 16,
				scrollWheelZoom: true
			});
			L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
				attribution: "Tiles © Esri",
				maxZoom: 17
			}).addTo(map);
			L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}", {
				opacity: .9,
				maxZoom: 17
			}).addTo(map);
			const bounds = L.latLngBounds(MUNICIPALITIES.map((m) => [m.lat, m.lng]));
			bounds.extend([SITEX.lat, SITEX.lng]);
			map.fitBounds(bounds.pad(.14));
			for (const m of MUNICIPALITIES) L.marker([m.lat, m.lng], {
				icon: L.divIcon({
					className: "muni-pin",
					html: `<span class="muni-name" style="color:${m.color}">${m.name.toUpperCase()}</span>`,
					iconSize: [0, 0],
					iconAnchor: [0, 0]
				}),
				interactive: false,
				keyboard: false
			}).addTo(map);
			L.marker([SITEX.lat, SITEX.lng], {
				icon: L.divIcon({
					className: "sitex-pin",
					html: `<span class="sitex-dot"></span><span class="sitex-name">SITEX</span>`,
					iconSize: [0, 0],
					iconAnchor: [8, 8]
				}),
				interactive: false,
				keyboard: false,
				zIndexOffset: 500
			}).addTo(map);
			leafletRef.current = L;
			mapRef.current = map;
			syncBuses(L, map, layerRef.current, busesRef.current);
			const resize = () => map.invalidateSize();
			window.setTimeout(resize, 80);
			if (typeof ResizeObserver !== "undefined" && host.current) {
				ro = new ResizeObserver(resize);
				ro.observe(host.current);
			}
		});
		return () => {
			cancelled = true;
			ro?.disconnect();
			mapRef.current?.remove();
			mapRef.current = null;
			layerRef.current.clear();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		const L = leafletRef.current;
		if (!map || !L) return;
		syncBuses(L, map, layerRef.current, buses);
	}, [buses]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: host,
		className: compact ? "live-map live-map-compact" : "live-map",
		role: "img",
		"aria-label": "Sorsogon live satellite map"
	}), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4",
		children: MUNICIPALITIES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBus, {
				color: m.color,
				size: 26,
				title: `${m.name} bus`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate",
				style: { color: m.color },
				children: m.name
			})]
		}, m.id))
	})] });
}
//#endregion
export { LiveMap as a, JourneyPlanner as i, AnnouncementBanner as n, rideMinutes as o, HotlineStrip as r, AdBillboard as t };
