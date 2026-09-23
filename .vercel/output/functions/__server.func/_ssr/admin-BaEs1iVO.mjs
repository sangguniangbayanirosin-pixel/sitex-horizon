import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as useFleet, c as cn, h as saveAdBlob, i as Card, l as compressImageFile, m as resolveAdSrc, n as ANNOUNCEMENT_TEMPLATES, p as isUploadedSrc, r as Button, t as Input, u as detectKind } from "./input-Cxa8AIpn.mjs";
import { t as Badge } from "./badge-CZTGAeWG.mjs";
import { i as useStaff, n as ChangeStaffPin, r as StaffGate, u as Label } from "./router-NBrjZWpE.mjs";
import { t as Textarea } from "./textarea-CReiwOrL.mjs";
import { t as ArrivalBoard } from "./arrival-board-CmkrvIi-.mjs";
import { t as STAFF_TRIP_CODES } from "./driver-session-DX0DITe2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BaEs1iVO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY = {
	id: "",
	kind: "poster",
	src: "",
	posterSrc: "",
	sponsor: "",
	headline: "",
	caption: "",
	ctaLabel: "Learn more",
	ctaUrl: "",
	dwellSec: 12,
	active: true,
	updatedAt: 0
};
function AdStudio() {
	const ads = useFleet((s) => s.ads);
	const upsertAd = useFleet((s) => s.upsertAd);
	const toggleAd = useFleet((s) => s.toggleAd);
	const removeAd = useFleet((s) => s.removeAd);
	const [draft, setDraft] = (0, import_react.useState)(EMPTY);
	const [preview, setPreview] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		if (!draft.src) {
			setPreview("");
			return;
		}
		resolveAdSrc(draft.src).then((url) => {
			if (!cancelled) setPreview(url);
		});
		return () => {
			cancelled = true;
		};
	}, [draft.src]);
	function edit(ad) {
		setDraft({ ...ad });
		setNote(null);
	}
	function reset() {
		setDraft({
			...EMPTY,
			id: crypto.randomUUID()
		});
		setPreview("");
		setNote(null);
	}
	async function onFile(file) {
		if (!file) return;
		const kind = detectKind(file);
		if (!kind) {
			setNote("Use a poster (JPG, PNG, WebP) or a video (MP4, WebM).");
			return;
		}
		setBusy(true);
		setNote(null);
		try {
			const id = draft.id || crypto.randomUUID();
			const blob = kind === "poster" ? await compressImageFile(file) : file;
			await saveAdBlob(id, blob);
			setDraft((d) => ({
				...d,
				id,
				kind,
				src: `idb:${id}`,
				posterSrc: kind === "video" ? d.posterSrc : void 0
			}));
			setNote(kind === "poster" ? "Poster ready." : "Video ready. It plays muted on the public board.");
		} catch {
			setNote("Could not store that file. Try a smaller one.");
		} finally {
			setBusy(false);
		}
	}
	function publish() {
		if (!draft.headline.trim() || !draft.src) {
			setNote("Add a headline and a poster or video.");
			return;
		}
		const ad = {
			...draft,
			id: draft.id || crypto.randomUUID(),
			sponsor: draft.sponsor.trim() || "SITEX Partner",
			headline: draft.headline.trim(),
			dwellSec: Math.max(5, Math.min(60, Number(draft.dwellSec) || 12)),
			updatedAt: Date.now()
		};
		upsertAd(ad);
		setDraft(ad);
		setNote("Live on the terminal and passenger screens.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-semibold",
				children: "Advertisement studio"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Upload a poster or HD video. It rotates on the public SITEX board."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				onClick: reset,
				children: "New slot"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 flex flex-col gap-2",
			children: ads.map((ad) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: cn("flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-bg/50 px-3 py-2", draft.id === ad.id && "border-accent/40"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "min-w-0 text-left",
					onClick: () => edit(ad),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-medium",
						children: ad.headline || "Untitled"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							ad.kind === "video" ? "Video" : "Poster",
							" · ",
							ad.sponsor,
							" · ",
							ad.dwellSec,
							"s",
							ad.active ? "" : " · off"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => toggleAd(ad.id, !ad.active),
						children: ad.active ? "On" : "Off"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => removeAd(ad.id),
						children: "Remove"
					})]
				})]
			}, ad.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: ["poster", "video"].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setDraft((d) => ({
							...d,
							kind: k
						})),
						className: cn("h-10 flex-1 rounded-md border text-sm capitalize", draft.kind === k ? "border-accent bg-accent/15 text-accent" : "border-border text-muted"),
						children: k
					}, k))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "ad-file",
						children: ["Upload ", draft.kind === "video" ? "video" : "poster"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ad-file",
						type: "file",
						accept: draft.kind === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp",
						disabled: busy,
						onChange: (e) => void onFile(e.target.files?.[0])
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ad-url",
						children: "Or paste a media URL"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ad-url",
						value: isUploadedSrc(draft.src) ? "" : draft.src,
						placeholder: "/sitex-photo.jpg or https://…",
						onChange: (e) => setDraft((d) => ({
							...d,
							src: e.target.value
						}))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ad-sponsor",
						children: "Advertiser / sponsor"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ad-sponsor",
						value: draft.sponsor,
						onChange: (e) => setDraft((d) => ({
							...d,
							sponsor: e.target.value
						}))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ad-head",
						children: "Headline"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ad-head",
						value: draft.headline,
						onChange: (e) => setDraft((d) => ({
							...d,
							headline: e.target.value
						}))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ad-cap",
						children: "Caption"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "ad-cap",
						value: draft.caption,
						onChange: (e) => setDraft((d) => ({
							...d,
							caption: e.target.value
						}))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ad-cta",
						children: "Button label"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ad-cta",
						value: draft.ctaLabel,
						onChange: (e) => setDraft((d) => ({
							...d,
							ctaLabel: e.target.value
						}))
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ad-dwell",
						children: "Seconds on screen"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ad-dwell",
						type: "number",
						min: 5,
						max: 60,
						value: draft.dwellSec,
						onChange: (e) => setDraft((d) => ({
							...d,
							dwellSec: Number(e.target.value)
						}))
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ad-link",
						children: "Button link"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ad-link",
						value: draft.ctaUrl,
						placeholder: "https://…",
						onChange: (e) => setDraft((d) => ({
							...d,
							ctaUrl: e.target.value
						}))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 flex h-11 items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: draft.active,
						onChange: (e) => setDraft((d) => ({
							...d,
							active: e.target.checked
						}))
					}), "Show on public screens"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4 w-full",
					disabled: busy,
					onClick: publish,
					children: busy ? "Preparing media…" : "Publish to terminal"
				}),
				note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-center text-sm text-ok",
					children: note
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-muted",
				children: "Preview"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-2 overflow-hidden rounded-lg border border-border bg-bg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative aspect-video",
					children: draft.kind === "video" && preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						className: "absolute inset-0 size-full object-cover",
						src: preview,
						poster: draft.posterSrc,
						muted: true,
						controls: true,
						playsInline: true
					}, preview) : preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: preview,
						alt: "",
						className: "absolute inset-0 size-full object-cover"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 flex items-center justify-center text-sm text-muted",
						children: "Upload a poster or video to preview"
					})
				}), (draft.headline || draft.sponsor) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-border p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "muted",
							children: "Advertisement"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-xl font-semibold",
							children: draft.headline || "Headline"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: draft.sponsor || "Sponsor"
						})
					]
				})]
			})] })]
		})
	] });
}
function Admin() {
	const hydrated = useStaff((s) => s.hydrated);
	const unlocked = useStaff((s) => s.unlocked);
	const hydrate = useStaff((s) => s.hydrate);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Checking staff session…"
	});
	if (!unlocked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffGate, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlBoard, {});
}
function ControlBoard() {
	const announcement = useFleet((s) => s.announcement);
	const publish = useFleet((s) => s.publishAnnouncement);
	const weather = useFleet((s) => s.weather);
	const setWeather = useFleet((s) => s.setWeather);
	const reports = useFleet((s) => s.reports);
	const updateReport = useFleet((s) => s.updateReport);
	const buses = useFleet((s) => s.buses);
	const [level, setLevel] = (0, import_react.useState)(announcement.level || "caution");
	const [title, setTitle] = (0, import_react.useState)(announcement.title || ANNOUNCEMENT_TEMPLATES.caution.title);
	const [body, setBody] = (0, import_react.useState)(announcement.body || ANNOUNCEMENT_TEMPLATES.caution.body);
	const [hotlines, setHotlines] = (0, import_react.useState)(announcement.showHotlines);
	const [saved, setSaved] = (0, import_react.useState)(false);
	function loadTemplate(key) {
		const t = ANNOUNCEMENT_TEMPLATES[key];
		setLevel(t.level);
		setTitle(t.title);
		setBody(t.body);
		setHotlines(t.showHotlines);
	}
	function publishNow() {
		publish({
			level,
			title,
			body,
			showHotlines: hotlines
		});
		setSaved(true);
		window.setTimeout(() => setSaved(false), 2500);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold tracking-tight",
				children: "Sitex control"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "SM Sorsogon staff publish terminal announcements. Passenger reports go to cooperative heads."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-semibold",
						children: "Live announcement"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [[
							"critical",
							"caution",
							"info"
						].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => loadTemplate(k),
							children: k === "critical" ? "No travel" : k === "caution" ? "Limited buses" : "Resumed"
						}, k)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => {
								setLevel("none");
								setTitle("");
								setBody("");
								publish({
									level: "none",
									title: "",
									body: "",
									showHotlines: false
								});
							},
							children: "Clear"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ann-title",
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "ann-title",
							value: title,
							onChange: (e) => setTitle(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ann-body",
							children: "Message"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "ann-body",
							value: body,
							onChange: (e) => setBody(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 flex h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: hotlines,
							onChange: (e) => setHotlines(e.target.checked)
						}), "Show emergency hotlines"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [
							"critical",
							"caution",
							"info"
						].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setLevel(k),
							className: cn("h-9 rounded-full border px-3 text-xs uppercase", level === k ? "border-accent text-accent" : "border-border text-muted"),
							children: k
						}, k))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4 w-full",
						onClick: publishNow,
						children: "Publish to all screens"
					}),
					saved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-center text-sm text-ok",
						children: "Published to the terminal."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-semibold",
							children: "Weather overlay"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Rain slows GPS speeds. Typhoon suspends trips and posts a critical announcement."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [
								"clear",
								"rain",
								"typhoon"
							].map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: weather === w ? "default" : "secondary",
								onClick: () => setWeather(w),
								children: w
							}, w))
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-display text-xl font-semibold",
						children: "Fleet"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrivalBoard, {
						buses,
						compact: true
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdStudio, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Passenger reports"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Sitex receives reports first, then forwards them to the bus cooperative."
				}),
				reports.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: "No reports yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 flex flex-col gap-2",
					children: reports.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-col gap-2 rounded-lg border border-border bg-bg p-3 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: r.category
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-muted",
									children: r.ticket
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: r.status === "new" ? "warn" : r.status === "forwarded" ? "ok" : "muted",
									children: r.status
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								r.route || "Unspecified route",
								" · ",
								r.description || "No details",
								r.forwardedTo ? ` · sent to ${r.forwardedTo}` : ""
							]
						})] }), r.status !== "forwarded" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => updateReport(r.id, "forwarded", "Cooperative head via Sitex / SM Sorsogon"),
							children: "Forward to cooperative"
						})]
					}, r.id))
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Driver trip codes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Issue these 4-digit codes to drivers and conductors. Passengers never see them. Demo plate: 7G-4821."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid gap-2 sm:grid-cols-2",
					children: buses.map((b) => {
						const row = STAFF_TRIP_CODES.find((c) => c.plate === b.plate);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between rounded-lg border border-border px-3 py-2 font-mono text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [b.plate, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-xs text-muted",
								children: b.destination
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold tracking-widest",
								children: row?.code ?? "—"
							})]
						}, b.id);
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangeStaffPin, {})
		]
	});
}
//#endregion
export { Admin as component };
