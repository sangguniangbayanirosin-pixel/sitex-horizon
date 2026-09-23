import { useEffect, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { isDriverGpsLive, subscribeDriverGps } from "@/lib/fleet/driver-gps";

export function GpsLiveChip() {
  const [live, setLive] = useState(isDriverGpsLive);
  useEffect(() => subscribeDriverGps(setLive), []);
  if (!live) return null;
  return (
    <span className="rounded-full bg-ok/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ok">
      GPS live
    </span>
  );
}

const NOTICE =
  "Passengers waiting at the SITEX terminal are still watching your arrival. If you leave this screen for a while to use another app, keep Sitex Horizon running in the background — do not swipe it closed. GPS will keep tracking your speed and arrival time so the board stays accurate.";

export function GpsLeaveGuard() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [live, setLive] = useState(isDriverGpsLive);
  const [open, setOpen] = useState(false);
  const [nextHref, setNextHref] = useState<string | null>(null);

  useEffect(() => subscribeDriverGps(setLive), []);

  useEffect(() => {
    if (!live) return;

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const a = t?.closest?.("a[href]") as HTMLAnchorElement | null;
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

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gps-leave-title"
    >
      <div className="glass w-full max-w-md rounded-xl p-5 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">GPS still live</p>
        <h2 id="gps-leave-title" className="mt-1 font-display text-2xl font-semibold tracking-tight">
          Passengers are waiting at SITEX
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-fg/90">{NOTICE}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1"
            onClick={() => {
              const href = nextHref;
              setOpen(false);
              setNextHref(null);
              if (href && href !== pathname) {
                void router.navigate({ href });
              }
            }}
          >
            Confirm
          </Button>
          <Button
            className="flex-1"
            variant="secondary"
            onClick={() => {
              setOpen(false);
              setNextHref(null);
            }}
          >
            Stay on this screen
          </Button>
        </div>
      </div>
    </div>
  );
}
