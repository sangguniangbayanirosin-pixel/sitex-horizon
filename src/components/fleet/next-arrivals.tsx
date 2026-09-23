import { MiniBus } from "@/components/fleet/mini-bus";
import { etaMinutes, formatEta, formatKm, formatSpeed } from "@/lib/fleet/eta";
import { colorForRoute } from "@/lib/fleet/colors";
import type { Bus } from "@/lib/fleet/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function NextArrivals({ buses }: { buses: Bus[] }) {
  const rows = [...buses]
    .filter((b) => b.status === "en-route" || b.status === "delayed")
    .sort((a, b) => {
      const ea = etaMinutes(a.remainingKm, a.speedKmh) ?? 9999;
      const eb = etaMinutes(b.remainingKm, b.speedKmh) ?? 9999;
      return ea - eb;
    })
    .slice(0, 6);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted">No live inbound buses. Check weather and announcements.</p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((b, i) => {
        const eta = etaMinutes(b.remainingKm, b.speedKmh);
        const color = colorForRoute(b.routeId);
        return (
          <li
            key={b.id}
            className="rounded-lg border border-border bg-bg/50 px-4 py-4"
            style={{ borderLeft: `4px solid ${color}` }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                {i === 0 ? "Next in" : "Then"}
              </p>
              <Badge tone={b.status === "delayed" ? "warn" : "ok"}>{b.status}</Badge>
            </div>
            <p
              className={cn(
                "mt-1 font-display font-semibold tracking-tight",
                i === 0 ? "text-5xl" : "text-4xl",
              )}
            >
              {formatEta(eta)}
            </p>
            <p className="mt-2 flex items-center gap-2 text-xl font-bold uppercase tracking-wide">
              <MiniBus color={color} size={18} title={b.destination} />
              <span style={{ color }}>{b.destination}</span>
            </p>
            <p className="mt-1 font-mono text-xs text-muted">
              {b.plate} · {formatKm(b.remainingKm)} · {formatSpeed(b.speedKmh)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}