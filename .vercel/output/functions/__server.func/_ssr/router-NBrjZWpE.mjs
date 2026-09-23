import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createRootRoute, b as useRouter, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, x as require_jsx_runtime, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as object, i as number, o as string, r as literal, s as union } from "../_libs/zod.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { _ as useFleet, c as cn, d as haversineKm, f as inSorsogon, g as startTelemetryLoop, i as Card, r as Button, t as Input } from "./input-Cxa8AIpn.mjs";
import { t as Badge } from "./badge-CZTGAeWG.mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/label-badHpIhu.js
var import_jsx_runtime = require_jsx_runtime();
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted", className),
		...props
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-NBrjZWpE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function ConnectionStatus() {
	const online = useFleet((s) => s.online);
	const cloud = useFleet((s) => s.cloud);
	const live = online && cloud;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider", live ? "text-ok" : online ? "text-warn" : "text-danger"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", live ? "bg-ok" : online ? "bg-warn" : "bg-danger") }), live ? "Live cloud" : online ? "Local only" : "Offline"]
	});
}
function startPhoneWatch(onFix, onError) {
	if (typeof navigator === "undefined" || !navigator.geolocation) {
		onError("This phone has no GPS.", true);
		return () => void 0;
	}
	let last = null;
	const id = navigator.geolocation.watchPosition((pos) => {
		const { latitude: lat, longitude: lng, speed, heading, accuracy } = pos.coords;
		const t = pos.timestamp || Date.now();
		let speedKmh = speed != null && Number.isFinite(speed) && speed >= 0 ? speed * 3.6 : -1;
		if (speedKmh < 0 && last) {
			const dtH = (t - last.t) / 36e5;
			if (dtH > 3e-4 && dtH < .02) speedKmh = haversineKm({
				lat: last.lat,
				lng: last.lng
			}, {
				lat,
				lng
			}) / dtH;
		}
		if (speedKmh < 0) speedKmh = 0;
		last = {
			t,
			lat,
			lng
		};
		onFix({
			lat,
			lng,
			speedKmh: Math.min(120, speedKmh),
			accuracyM: accuracy,
			heading: heading != null && Number.isFinite(heading) ? heading : null,
			inProvince: inSorsogon({
				lat,
				lng
			})
		});
	}, (err) => {
		if (err.code === 1) onError("Location permission denied. Turn on GPS and Allow.", true);
		else if (err.code === 2) onError("GPS unavailable. Try again outdoors.", false);
		else onError("GPS is slow. Keep the app open — it will catch up.", false);
	}, {
		enableHighAccuracy: true,
		maximumAge: 4e3,
		timeout: 25e3
	});
	return () => navigator.geolocation.clearWatch(id);
}
var stopWatch = null;
var busId = null;
var wake = null;
var lastError = null;
var listeners = /* @__PURE__ */ new Set();
function notify() {
	const live = stopWatch != null;
	for (const fn of listeners) fn(live, lastError);
}
async function lockScreen() {
	try {
		wake = await navigator.wakeLock?.request("screen") ?? null;
	} catch {
		wake = null;
	}
}
function isDriverGpsLive() {
	return stopWatch != null;
}
function subscribeDriverGps(fn) {
	listeners.add(fn);
	fn(stopWatch != null, lastError);
	return () => {
		listeners.delete(fn);
	};
}
function startDriverGps(id) {
	stopWatch?.();
	busId = id;
	lastError = null;
	stopWatch = startPhoneWatch((fix) => {
		if (!busId) return;
		lastError = null;
		useFleet.getState().applyPhoneFix(busId, fix);
		notify();
	}, (message, fatal) => {
		lastError = message;
		notify();
		if (fatal) stopDriverGps();
	});
	lockScreen();
	notify();
}
function stopDriverGps() {
	stopWatch?.();
	stopWatch = null;
	if (busId) useFleet.getState().stopPhoneGps(busId);
	busId = null;
	wake?.release().catch(() => void 0);
	wake = null;
	notify();
}
if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === "visible" && stopWatch) lockScreen();
});
function GpsLiveChip() {
	const [live, setLive] = (0, import_react.useState)(isDriverGpsLive);
	(0, import_react.useEffect)(() => subscribeDriverGps(setLive), []);
	if (!live) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "rounded-full bg-ok/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ok",
		children: "GPS live"
	});
}
var NOTICE = "Passengers waiting at the SITEX terminal are still watching your arrival. If you leave this screen for a while to use another app, keep Sitex Horizon running in the background — do not swipe it closed. GPS will keep tracking your speed and arrival time so the board stays accurate.";
function GpsLeaveGuard() {
	const router = useRouter();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [live, setLive] = (0, import_react.useState)(isDriverGpsLive);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [nextHref, setNextHref] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => subscribeDriverGps(setLive), []);
	(0, import_react.useEffect)(() => {
		if (!live) return;
		const onClick = (e) => {
			const a = e.target?.closest?.("a[href]");
			if (!a) return;
			const href = a.getAttribute("href");
			if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
			if (href === "/driver" || href.startsWith("/driver?")) return;
			if (a.target === "_blank") return;
			e.preventDefault();
			e.stopPropagation();
			setNextHref(href);
			setOpen(true);
		};
		const onBeforeUnload = (e) => {
			e.preventDefault();
			e.returnValue = NOTICE;
		};
		document.addEventListener("click", onClick, true);
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => {
			document.removeEventListener("click", onClick, true);
			window.removeEventListener("beforeunload", onBeforeUnload);
		};
	}, [live]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "gps-leave-title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass w-full max-w-md rounded-xl p-5 shadow-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-widest text-accent",
					children: "GPS still live"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "gps-leave-title",
					className: "mt-1 font-display text-2xl font-semibold tracking-tight",
					children: "Passengers are waiting at SITEX"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed text-fg/90",
					children: NOTICE
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						onClick: () => {
							const href = nextHref;
							setOpen(false);
							setNextHref(null);
							if (href && href !== pathname) router.navigate({ href });
						},
						children: "Confirm"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						variant: "secondary",
						onClick: () => {
							setOpen(false);
							setNextHref(null);
						},
						children: "Stay on this screen"
					})]
				})
			]
		})
	});
}
function seed(w, h, n) {
	const out = [];
	for (let i = 0; i < n; i++) out.push({
		x: Math.random() * w,
		y: Math.random() * h,
		vx: (Math.random() - .5) * .15,
		vy: .18 + Math.random() * .45,
		r: i % 5 === 0 ? 3.4 + Math.random() * 2.2 : .7 + Math.random() * 1.6,
		a: .25 + Math.random() * .55,
		kind: i % 5 === 0 ? 1 : 0,
		spin: Math.random() * Math.PI * 2,
		tw: Math.random() * Math.PI * 2
	});
	return out;
}
function flake(ctx, p) {
	ctx.save();
	ctx.translate(p.x, p.y);
	ctx.rotate(p.spin);
	ctx.globalAlpha = p.a;
	ctx.strokeStyle = "rgba(210, 235, 255, 0.95)";
	ctx.lineWidth = .9;
	const arm = p.r;
	for (let i = 0; i < 6; i++) {
		ctx.rotate(Math.PI / 3);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, arm);
		ctx.moveTo(0, arm * .45);
		ctx.lineTo(arm * .22, arm * .62);
		ctx.moveTo(0, arm * .45);
		ctx.lineTo(-arm * .22, arm * .62);
		ctx.stroke();
	}
	ctx.restore();
}
function GlitterField() {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		let w = 0;
		let h = 0;
		let parts = [];
		let mx = -9999;
		let my = -9999;
		let px = -9999;
		let py = -9999;
		let raf = 0;
		let running = true;
		const resize = () => {
			w = window.innerWidth;
			h = window.innerHeight;
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			canvas.width = Math.floor(w * dpr);
			canvas.height = Math.floor(h * dpr);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			parts = seed(w, h, reduce ? 40 : 110);
		};
		const onMove = (e) => {
			mx = e.clientX;
			my = e.clientY;
		};
		const tick = () => {
			if (!running) return;
			ctx.clearRect(0, 0, w, h);
			const dxm = mx - px;
			const dym = my - py;
			px = mx;
			py = my;
			for (const p of parts) {
				const dx = p.x - mx;
				const dy = p.y - my;
				const dist = Math.hypot(dx, dy) || 1;
				const radius = 140;
				if (dist < radius) {
					const force = (radius - dist) / radius * .9;
					p.vx += dx / dist * force + dxm * .012;
					p.vy += dy / dist * force * .55 + dym * .012;
				}
				p.vx *= .94;
				p.vy = p.vy * .94 + .04;
				p.x += p.vx;
				p.y += p.vy;
				p.spin += .01 + p.r * .002;
				p.tw += .05;
				if (p.y > h + 8) {
					p.y = -8;
					p.x = Math.random() * w;
				}
				if (p.x < -8) p.x = w + 8;
				if (p.x > w + 8) p.x = -8;
				if (p.kind === 1) flake(ctx, p);
				else {
					const spark = .45 + Math.sin(p.tw) * .35;
					ctx.globalAlpha = p.a * spark;
					ctx.fillStyle = "rgba(186, 230, 253, 1)";
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
					ctx.fill();
					ctx.globalAlpha = p.a * spark * .45;
					ctx.fillStyle = "rgba(255, 255, 255, 1)";
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.r * .45, 0, Math.PI * 2);
					ctx.fill();
				}
			}
			ctx.globalAlpha = 1;
			raf = requestAnimationFrame(tick);
		};
		resize();
		window.addEventListener("resize", resize);
		window.addEventListener("pointermove", onMove, { passive: true });
		if (reduce) {
			tick();
			cancelAnimationFrame(raf);
		} else raf = requestAnimationFrame(tick);
		return () => {
			running = false;
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", resize);
			window.removeEventListener("pointermove", onMove);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "pointer-events-none fixed inset-0 z-0",
		"aria-hidden": true
	});
}
function DissolveBlobs() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dissolve-blob blob-a" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dissolve-blob blob-b" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dissolve-blob blob-c" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dissolve-blob blob-d" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dissolve-veil" })
	] });
}
function SitexStage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed inset-0 -z-10 overflow-hidden dissolve-stage",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DissolveBlobs, {})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlitterField, {})] });
}
/** Compact SITEX terminal footage for the TV board — not a full-screen hero. */
function SitexLiveReel({ className }) {
	const video = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const el = video.current;
		if (!el) return;
		el.muted = true;
		const play = () => void el.play().catch(() => void 0);
		play();
		el.addEventListener("canplay", play);
		return () => el.removeEventListener("canplay", play);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("terminal-cam relative overflow-hidden rounded-xl", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
			ref: video,
			className: "h-full w-full object-cover object-[center_40%]",
			autoPlay: true,
			muted: true,
			loop: true,
			playsInline: true,
			poster: "/sitex-terminal.jpg",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
				src: "/sitex-terminal.mp4",
				type: "video/mp4"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/sitex-terminal.jpg",
			alt: "",
			className: "terminal-cam-still absolute inset-0 hidden h-full w-full object-cover object-[center_40%]"
		})]
	});
}
var PIN_KEY = "sitex-staff-pin-hash";
var SESSION_KEY = "sitex-staff-session";
var DEFAULT_PIN = "4700";
var IDLE_MS = 6e5;
async function hashPin(pin) {
	const data = new TextEncoder().encode(`sitex-horizon-v1:${pin.trim()}`);
	const buf = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
function sessionValid() {
	if (typeof localStorage === "undefined") return false;
	try {
		const raw = localStorage.getItem(SESSION_KEY);
		if (!raw) return false;
		const at = Number(raw);
		if (!Number.isFinite(at)) return false;
		return Date.now() - at < IDLE_MS;
	} catch {
		return false;
	}
}
var useStaff = create((set, get) => ({
	hydrated: false,
	unlocked: false,
	lastActive: 0,
	hydrate: () => {
		if (get().hydrated) return;
		const ok = sessionValid();
		set({
			hydrated: true,
			unlocked: ok,
			lastActive: ok ? Date.now() : 0
		});
	},
	unlock: async (pin) => {
		if (!/^\d{4}$/.test(pin.trim())) return false;
		const incoming = await hashPin(pin);
		let expected;
		try {
			expected = localStorage.getItem(PIN_KEY) || await hashPin(DEFAULT_PIN);
		} catch {
			expected = await hashPin(DEFAULT_PIN);
		}
		if (incoming !== expected) return false;
		const now = Date.now();
		try {
			localStorage.setItem(SESSION_KEY, String(now));
		} catch {}
		set({
			unlocked: true,
			lastActive: now,
			hydrated: true
		});
		return true;
	},
	lock: () => {
		try {
			localStorage.removeItem(SESSION_KEY);
		} catch {}
		set({
			unlocked: false,
			lastActive: 0
		});
	},
	touch: () => {
		if (!get().unlocked) return;
		const now = Date.now();
		try {
			localStorage.setItem(SESSION_KEY, String(now));
		} catch {}
		set({ lastActive: now });
	},
	checkIdle: () => {
		if (!get().unlocked) return;
		if (Date.now() - get().lastActive > IDLE_MS) get().lock();
	},
	changePin: async (current, next) => {
		const incoming = await hashPin(current);
		let expected;
		try {
			expected = localStorage.getItem(PIN_KEY) || await hashPin(DEFAULT_PIN);
		} catch {
			expected = await hashPin(DEFAULT_PIN);
		}
		if (incoming !== expected) return "bad-current";
		if (!/^\d{4}$/.test(next.trim())) return "bad-next";
		try {
			localStorage.setItem(PIN_KEY, await hashPin(next.trim()));
		} catch {
			return "bad-next";
		}
		return "ok";
	}
}));
var KEYS = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"clear",
	"0",
	"go"
];
function StaffLockButton() {
	const hydrated = useStaff((s) => s.hydrated);
	const unlocked = useStaff((s) => s.unlocked);
	const lock = useStaff((s) => s.lock);
	const hydrate = useStaff((s) => s.hydrate);
	const [open, setOpen] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "size-10",
		"aria-hidden": true
	});
	if (unlocked) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			tone: "live",
			children: "Control"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "h-10 rounded-md px-3 text-sm text-muted hover:text-fg",
			onClick: () => {
				lock();
				navigate({ to: "/" });
			},
			children: "Sign out"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": "Sitex staff sign in",
		className: "inline-flex size-10 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg",
		onClick: () => setOpen(true),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockIcon, {})
	}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffPinDialog, {
		onClose: () => setOpen(false),
		onSuccess: () => {
			setOpen(false);
			navigate({ to: "/admin" });
		}
	})] });
}
function StaffGate() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-md flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-center font-display text-3xl font-semibold tracking-tight",
			children: "Sitex Control"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-center text-sm text-muted",
			children: "Staff only. Passengers on the public board cannot open this. Sitex / SM Sorsogon signs in with the operations PIN."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mx-auto w-full max-w-sm p-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffPinPad, { onSuccess: () => void 0 })
		})]
	});
}
function StaffPinDialog({ onClose, onSuccess }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 z-0 bg-bg/70",
			"aria-label": "Close",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "relative z-10 w-full max-w-sm p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center font-display text-xl font-semibold",
					children: "Staff sign in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-center text-sm text-muted",
					children: "For Sitex operations and SM Sorsogon — not for waiting passengers."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffPinPad, { onSuccess })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4 w-full",
					variant: "ghost",
					onClick: onClose,
					children: "Cancel"
				})
			]
		})]
	});
}
function StaffPinPad({ onSuccess }) {
	const unlock = useStaff((s) => s.unlock);
	const [pin, setPin] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submit(value = pin) {
		if (busy) return;
		setBusy(true);
		setError(null);
		const ok = await unlock(value);
		setBusy(false);
		if (ok) {
			setPin("");
			onSuccess();
			return;
		}
		setPin("");
		setError("Wrong PIN. Ask Sitex operations.");
	}
	function press(key) {
		setError(null);
		if (key === "clear") {
			setPin("");
			return;
		}
		if (key === "go") {
			submit();
			return;
		}
		const next = (pin + key).slice(0, 4);
		setPin(next);
		if (next.length === 4) submit(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto w-full max-w-xs",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				"aria-label": "Staff PIN",
				className: "sr-only",
				inputMode: "numeric",
				autoComplete: "one-time-code",
				autoFocus: true,
				value: pin,
				onChange: (e) => {
					const next = e.target.value.replace(/\D/g, "").slice(0, 4);
					setPin(next);
					setError(null);
					if (next.length === 4) submit(next);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-5 flex items-center justify-center gap-3",
				children: [
					0,
					1,
					2,
					3
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("flex size-14 items-center justify-center rounded-lg border bg-surface font-mono text-2xl font-semibold", pin[i] ? "border-accent text-fg" : "border-border text-subtle"),
					children: pin[i] ?? "•"
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto grid w-full grid-cols-3 gap-2",
				children: KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => press(key),
					className: cn("flex h-14 items-center justify-center rounded-lg border border-border text-lg font-semibold", key === "go" ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg hover:bg-surface"),
					children: key === "clear" ? "Clear" : key === "go" ? "Enter" : key
				}, key))
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-center text-sm text-danger",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-center text-xs text-muted",
				children: "Public TVs stay locked. Staff use this on their own phone or office PC."
			})
		]
	});
}
function ChangeStaffPin() {
	const changePin = useStaff((s) => s.changePin);
	const [current, setCurrent] = (0, import_react.useState)("");
	const [next, setNext] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)(null);
	async function save() {
		const result = await changePin(current, next);
		if (result === "ok") {
			setCurrent("");
			setNext("");
			setNote("PIN updated. Give the new PIN only to Sitex / SM staff.");
			return;
		}
		setNote(result === "bad-current" ? "Current PIN is wrong." : "New PIN must be 4 digits.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-xl font-semibold",
			children: "Staff PIN"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "When Sitex management takes over, they change this PIN. Do not post it on the public board."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "pin-now",
				children: "Current PIN"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: "pin-now",
				inputMode: "numeric",
				maxLength: 4,
				value: current,
				onChange: (e) => setCurrent(e.target.value.replace(/\D/g, "").slice(0, 4))
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "pin-next",
				children: "New 4-digit PIN"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: "pin-next",
				inputMode: "numeric",
				maxLength: 4,
				value: next,
				onChange: (e) => setNext(e.target.value.replace(/\D/g, "").slice(0, 4))
			})] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4",
			variant: "secondary",
			onClick: () => void save(),
			children: "Save new PIN"
		}),
		note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-ok",
			children: note
		})
	] });
}
function LockIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: "18",
		height: "18",
		viewBox: "0 0 24 24",
		fill: "none",
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "5",
			y: "11",
			width: "14",
			height: "10",
			rx: "2",
			stroke: "currentColor",
			strokeWidth: "1.8"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M8 11V8a4 4 0 0 1 8 0v3",
			stroke: "currentColor",
			strokeWidth: "1.8",
			strokeLinecap: "round"
		})]
	});
}
var PUBLIC_NAV = [
	{
		to: "/",
		label: "Terminal"
	},
	{
		to: "/passenger",
		label: "Passenger"
	},
	{
		to: "/driver",
		label: "Driver"
	},
	{
		to: "/report",
		label: "Report"
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [clock, setClock] = (0, import_react.useState)("");
	const unlocked = useStaff((s) => s.unlocked);
	const touch = useStaff((s) => s.touch);
	const checkIdle = useStaff((s) => s.checkIdle);
	const hydrate = useStaff((s) => s.hydrate);
	(0, import_react.useEffect)(() => startTelemetryLoop(), []);
	(0, import_react.useEffect)(() => hydrate(), [hydrate]);
	(0, import_react.useEffect)(() => {
		const onActivity = () => touch();
		window.addEventListener("pointerdown", onActivity);
		window.addEventListener("keydown", onActivity);
		const id = window.setInterval(() => checkIdle(), 15e3);
		return () => {
			window.removeEventListener("pointerdown", onActivity);
			window.removeEventListener("keydown", onActivity);
			window.clearInterval(id);
		};
	}, [touch, checkIdle]);
	(0, import_react.useEffect)(() => {
		const tick = () => setClock((/* @__PURE__ */ new Date()).toLocaleTimeString("en-PH", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit"
		}));
		tick();
		const id = window.setInterval(tick, 1e3);
		return () => window.clearInterval(id);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SitexStage, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GpsLeaveGuard, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col px-4 pb-10 pt-4 md:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "glass mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl font-semibold tracking-tight",
						children: "Sitex Horizon"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Sorsogon Integrated Terminal Exchange · SM Sorsogon"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex flex-wrap gap-1",
						children: [PUBLIC_NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							className: cn("inline-flex h-10 items-center rounded-md px-3 text-sm", pathname === item.to ? "bg-accent/15 text-accent" : "text-muted hover:text-fg"),
							children: item.label
						}, item.to)), unlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/admin",
							className: cn("inline-flex h-10 items-center rounded-md px-3 text-sm", pathname === "/admin" ? "bg-accent/15 text-accent" : "text-muted hover:text-fg"),
							children: "Control"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionStatus, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GpsLiveChip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-sm tabular-nums text-fg",
								children: clock || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffLockButton, {})
						]
					})
				]
			}), children]
		})
	] });
}
var styles_default = "/assets/styles-GJU3Nrbs.css";
var APP_NAME = "Sitex Horizon";
var Route$5 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Live bus arrivals for SITEX, SM Sorsogon. Phone GPS speed updates ETA for every Sorsogon municipality."
			},
			{
				name: "theme-color",
				content: "#e8f3fc"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$4 = () => import("./routes-DB6t5pzl.mjs");
var Route$4 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./admin-BaEs1iVO.mjs");
var Route$3 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./driver-BOa2GJCa.mjs");
var Route$2 = createFileRoute("/driver")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./passenger-CeRpBxuM.mjs");
var Route$1 = createFileRoute("/passenger")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./report-woE1cqVd.mjs");
var Route = createFileRoute("/report")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$4.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$5
	}),
	AdminRoute: Route$3.update({
		id: "/admin",
		path: "/admin",
		getParentRoute: () => Route$5
	}),
	DriverRoute: Route$2.update({
		id: "/driver",
		path: "/driver",
		getParentRoute: () => Route$5
	}),
	PassengerRoute: Route$1.update({
		id: "/passenger",
		path: "/passenger",
		getParentRoute: () => Route$5
	}),
	ReportRoute: Route.update({
		id: "/report",
		path: "/report",
		getParentRoute: () => Route$5
	})
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { SitexLiveReel as a, stopDriverGps as c, useStaff as i, subscribeDriverGps as l, ChangeStaffPin as n, isDriverGpsLive as o, StaffGate as r, startDriverGps as s, router_exports as t, Label as u };
