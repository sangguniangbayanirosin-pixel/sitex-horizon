import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as useFleet, i as Card, r as Button, t as Input } from "./input-Cxa8AIpn.mjs";
import { t as Badge } from "./badge-CZTGAeWG.mjs";
import { c as stopDriverGps, l as subscribeDriverGps, o as isDriverGpsLive, s as startDriverGps, u as Label } from "./router-NBrjZWpE.mjs";
import { a as formatKm, i as formatEta, o as formatSpeed, r as etaMinutes } from "./eta-MZjSs9q9.mjs";
import { a as saveClaim, i as loadClaim, n as clearClaim, o as verifyTripCode, r as findBusByPlate } from "./driver-session-DX0DITe2.mjs";
import { n as DriverConfirmPanel } from "./coming-sign-CB8MyHkP.mjs";
import { t as InstallAppCard } from "./install-app-CE8PwQu6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/driver-BOa2GJCa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PhoneGps({ busId }) {
	const bus = useFleet((s) => s.buses.find((b) => b.id === busId));
	const [on, setOn] = (0, import_react.useState)(isDriverGpsLive);
	const [err, setErr] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => subscribeDriverGps((live, error) => {
		setOn(live);
		setErr(error);
	}), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-bg/50 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-muted",
				children: "Phone GPS"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Uses this phone’s built-in GPS — latitude, longitude, and speed. Leave this app in the background if you open another app. Do not swipe it closed."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3 w-full",
				variant: on ? "secondary" : "default",
				onClick: () => {
					if (on) stopDriverGps();
					else startDriverGps(busId);
				},
				children: on ? "Stop sharing location" : "Share live GPS"
			}),
			on && bus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-xs text-accent",
				children: [
					bus.lat.toFixed(5),
					", ",
					bus.lng.toFixed(5),
					" · ",
					Math.round(bus.speedKmh),
					" km/h",
					bus.gpsAccuracyM != null ? ` · ±${Math.round(bus.gpsAccuracyM)} m` : "",
					bus.gpsSource === "phone" ? " · live phone" : ""
				]
			}),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-danger",
				children: err
			})
		]
	});
}
function Driver() {
	const buses = useFleet((s) => s.buses);
	const selectBus = useFleet((s) => s.selectBus);
	const [claim, setClaim] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const existing = loadClaim();
		if (existing && buses.some((b) => b.id === existing.busId)) {
			selectBus(existing.busId);
			setClaim(existing);
		}
		setReady(true);
	}, [buses, selectBus]);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Opening driver desk…"
	});
	if (!claim) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DriverUnlock, { onClaim: (next) => {
		saveClaim(next);
		selectBus(next.busId);
		setClaim(next);
	} });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DriverDesk, {
		claim,
		onLeave: () => {
			stopDriverGps();
			clearClaim();
			setClaim(null);
		}
	});
}
function DriverUnlock({ onClaim }) {
	const buses = useFleet((s) => s.buses);
	const [plate, setPlate] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	function submit(e) {
		e.preventDefault();
		const bus = findBusByPlate(buses, plate);
		if (!bus) {
			setError("Plate not found. Check with your cooperative.");
			return;
		}
		if (!verifyTripCode(bus.plate, code)) {
			setError("Wrong trip code. Ask Sitex or your cooperative.");
			return;
		}
		onClaim({
			busId: bus.id,
			plate: bus.plate,
			claimedAt: Date.now()
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-lg flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold tracking-tight",
				children: "Driver / conductor"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Enter your bus plate and the 4-digit trip code from your cooperative. No Gmail. No passenger account."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "plate",
						children: "Bus plate"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "plate",
						autoComplete: "off",
						autoCapitalize: "characters",
						placeholder: "7G-4821",
						value: plate,
						onChange: (e) => {
							setPlate(e.target.value.toUpperCase());
							setError(null);
						}
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "code",
						children: "Trip code"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "code",
						inputMode: "numeric",
						pattern: "[0-9]*",
						maxLength: 4,
						placeholder: "4 digits",
						value: code,
						onChange: (e) => {
							setCode(e.target.value.replace(/\D/g, "").slice(0, 4));
							setError(null);
						}
					})] }),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "lg",
						children: "Unlock this bus"
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallAppCard, { who: "driver" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Cooperatives issue trip codes. Sitex staff can view the list in Control after the staff PIN."
			})
		]
	});
}
function DriverDesk({ claim, onLeave }) {
	const buses = useFleet((s) => s.buses);
	const setDriverSpeed = useFleet((s) => s.setDriverSpeed);
	const startTrip = useFleet((s) => s.startTrip);
	const endTrip = useFleet((s) => s.endTrip);
	const bus = buses.find((b) => b.id === claim.busId);
	if (!bus) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm",
		children: "This bus is no longer on the board."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		className: "mt-3",
		onClick: onLeave,
		children: "Sign out"
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-lg flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold tracking-tight",
				children: "On duty"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: [
					"You unlocked ",
					bus.plate,
					". Share GPS, then you may use other apps — keep this one in the background."
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-lg",
						children: bus.plate
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							bus.destination,
							" · ",
							bus.zip,
							" · ",
							bus.via,
							" · ",
							bus.operator
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: bus.status === "delayed" ? "warn" : bus.status === "en-route" ? "ok" : bus.status === "suspended" ? "danger" : "muted",
						children: bus.status
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-4 grid grid-cols-3 gap-3 font-mono text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-muted",
							children: "Left"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: formatKm(bus.remainingKm) })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-muted",
							children: "Speed"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: formatSpeed(bus.speedKmh) })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-muted",
							children: "ETA"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: formatEta(etaMinutes(bus.remainingKm, bus.speedKmh)) })] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "speed",
						className: "text-xs font-medium uppercase tracking-wide text-muted",
						children: "Speed override (demo)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "speed",
						type: "range",
						min: 0,
						max: 100,
						value: Math.round(bus.speedKmh),
						onChange: (e) => setDriverSpeed(bus.id, Number(e.target.value)),
						className: "mt-2 w-full"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						onClick: () => startTrip(bus.id),
						children: "Start trip"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						variant: "secondary",
						onClick: () => endTrip(bus.id),
						children: "End trip"
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DriverConfirmPanel, { busId: bus.id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneGps, { busId: bus.id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallAppCard, { who: "driver" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: onLeave,
				children: "Sign out this bus"
			})
		]
	});
}
//#endregion
export { Driver as component };
