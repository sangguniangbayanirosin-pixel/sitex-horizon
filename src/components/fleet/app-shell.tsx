import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ConnectionStatus } from "@/components/fleet/connection-status";
import { GpsLeaveGuard, GpsLiveChip } from "@/components/fleet/gps-leave-guard";
import { SitexStage } from "@/components/fleet/sitex-stage";
import { StaffLockButton } from "@/components/fleet/staff-lock";
import { startTelemetryLoop } from "@/lib/fleet/store";
import { useStaff } from "@/lib/staff/session";
import { cn } from "@/lib/utils";

const PUBLIC_NAV = [
  { to: "/", label: "Terminal" },
  { to: "/passenger", label: "Passenger" },
  { to: "/driver", label: "Driver" },
  { to: "/report", label: "Report" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [clock, setClock] = useState("");
  const unlocked = useStaff((s) => s.unlocked);
  const touch = useStaff((s) => s.touch);
  const checkIdle = useStaff((s) => s.checkIdle);
  const hydrate = useStaff((s) => s.hydrate);

  useEffect(() => startTelemetryLoop(), []);
  useEffect(() => hydrate(), [hydrate]);

  useEffect(() => {
    const onActivity = () => touch();
    window.addEventListener("pointerdown", onActivity);
    window.addEventListener("keydown", onActivity);
    const id = window.setInterval(() => checkIdle(), 15_000);
    return () => {
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.clearInterval(id);
    };
  }, [touch, checkIdle]);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <SitexStage />
      <GpsLeaveGuard />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col px-4 pb-10 pt-4 md:px-6">
        <header className="glass mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
          <div>
            <p className="font-display text-xl font-semibold tracking-tight">Sitex Horizon</p>
            <p className="text-xs text-muted">Sorsogon Integrated Terminal Exchange · SM Sorsogon</p>
          </div>
          <nav className="flex flex-wrap gap-1">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex h-10 items-center rounded-md px-3 text-sm",
                  pathname === item.to ? "bg-accent/15 text-accent" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            ))}
            {unlocked && (
              <Link
                to="/admin"
                className={cn(
                  "inline-flex h-10 items-center rounded-md px-3 text-sm",
                  pathname === "/admin" ? "bg-accent/15 text-accent" : "text-muted hover:text-fg",
                )}
              >
                Control
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <ConnectionStatus />
            <GpsLiveChip />
            <span className="font-mono text-sm tabular-nums text-fg">{clock || "—"}</span>
            <StaffLockButton />
          </div>
        </header>
        {children}
      </div>
    </>
  );
}
