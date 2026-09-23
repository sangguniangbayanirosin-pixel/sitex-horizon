import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as cn } from "./input-Cxa8AIpn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-CZTGAeWG.js
var import_jsx_runtime = require_jsx_runtime();
var tones = {
	live: "bg-accent/20 text-accent",
	ok: "bg-ok/15 text-ok",
	warn: "bg-warn/15 text-warn",
	danger: "bg-danger/20 text-danger",
	muted: "bg-fg/10 text-muted"
};
function Badge({ className, tone = "muted", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium uppercase tracking-wider", tones[tone], className),
		...props
	});
}
//#endregion
export { Badge as t };
