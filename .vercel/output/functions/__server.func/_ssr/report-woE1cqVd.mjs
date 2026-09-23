import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as useFleet, a as MUNICIPALITIES, c as cn, i as Card, r as Button, t as Input } from "./input-Cxa8AIpn.mjs";
import { u as Label } from "./router-NBrjZWpE.mjs";
import { t as Textarea } from "./textarea-CReiwOrL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/report-woE1cqVd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES = [
	"Late Arrival",
	"Driver/Conductor Behavior",
	"Bus Condition",
	"Overcharging",
	"Safety Concern",
	"Others"
];
function Report() {
	const addReport = useFleet((s) => s.addReport);
	const [category, setCategory] = (0, import_react.useState)("");
	const [route, setRoute] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [anonymous, setAnonymous] = (0, import_react.useState)(true);
	const [ticket, setTicket] = (0, import_react.useState)(null);
	function submit() {
		if (!category) return;
		const t = addReport({
			category,
			route,
			description,
			anonymous
		});
		setTicket(t);
		setDescription("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-lg flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-semibold tracking-tight",
			children: "Passenger report"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Sitex / SM Sorsogon receives this first, then forwards it to the cooperative head."
		})] }), ticket ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-wide text-muted",
				children: "Filed"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-3xl font-semibold",
				children: ticket
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Keep this number. Sitex staff will see it on the admin board."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4 w-full",
				variant: "secondary",
				onClick: () => setTicket(null),
				children: "File another"
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-muted",
				children: "What happened"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setCategory(c),
					className: cn("h-10 rounded-full border px-3 text-sm", category === c ? "border-accent bg-accent/15 text-accent" : "border-border text-muted"),
					children: c
				}, c))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "route",
						children: "Route / destination"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "route",
						list: "lgus",
						value: route,
						onChange: (e) => setRoute(e.target.value),
						placeholder: "Gubat, Irosin, Bulan…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
						id: "lgus",
						children: MUNICIPALITIES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: m.name }, m.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "desc",
					children: "What happened"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "desc",
					value: description,
					onChange: (e) => setDescription(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-3 flex h-11 items-center gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: anonymous,
					onChange: (e) => setAnonymous(e.target.checked)
				}), "Submit anonymously"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4 w-full",
				disabled: !category,
				onClick: submit,
				children: "Submit report"
			})
		] })]
	});
}
//#endregion
export { Report as component };
