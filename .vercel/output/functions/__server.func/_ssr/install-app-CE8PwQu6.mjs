import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Card, r as Button } from "./input-Cxa8AIpn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/install-app-CE8PwQu6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InstallAppCard({ who }) {
	const [prompt, setPrompt] = (0, import_react.useState)(null);
	const [done, setDone] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const onPrompt = (e) => {
			e.preventDefault();
			setPrompt(e);
		};
		window.addEventListener("beforeinstallprompt", onPrompt);
		return () => window.removeEventListener("beforeinstallprompt", onPrompt);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-accent",
				children: "Use as an app"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-fg/90",
				children: who === "driver" ? "Install Sitex Horizon on this phone like an app. After you sign in with plate and code, you can switch to another app — GPS stays on in the background." : "Install Sitex Horizon on your phone. Open it at the terminal to see live arrivals — no account needed."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: "iPhone: Share → Add to Home Screen. Android: browser menu → Install app."
			}),
			prompt && !done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3 w-full",
				onClick: async () => {
					await prompt.prompt();
					setDone(true);
				},
				children: "Install app"
			})
		]
	});
}
//#endregion
export { InstallAppCard as t };
