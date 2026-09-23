import { MiniBus } from "@/components/fleet/mini-bus";
import { etaMinutes, formatEta, formatKm, formatSpeed } from "@/lib/fleet/eta";
import { colorForRoute } from "@/lib/fleet/colors";
import type { Bus } from "@/lib/fleet/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tone = {
  "en-route": "ok" as const,
  delayed: "warn" as const,
  arrived: "muted" as const,
  suspended: "danger" as const,
  idle: "muted" as const,
};

export function ArrivalBoard({ buses, compact = false }: { buses: Bus[]; compact?: boolean }) {
  const rows = [...buses].sort((a, b) => {
    const ea = etaMinutes(a.remainingKm, a.speedKmh) ?? 9999;
    const eb = etaMinutes(b.remainingKm, b.speedKmh) ?? 9999;
    return ea - eb;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="pb-2 pr-3 font-medium">Destination</th>
            {!compact && <th className="pb-2 pr-3 font-medium">Zip</th>}
            <th className="pb-2 pr-3 font-medium">Bus</th>
            {!compact && <th className="pb-2 pr-3 font-medium">Left</th>}
            {!compact && <th className="pb-2 pr-3 font-medium">Speed</th>}
            <th className="pb-2 pr-3 font-medium">ETA</th>
            <th className="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id} className="border-t border-border">
              <td className="py-2.5 pr-3">
                <span className="flex items-center gap-2">
                  <MiniBus routeId={b.routeId} size={18} title={b.destination} />
                  <span>
                    <span
                      className="text-base font-bold uppercase tracking-wide"
                      style={{ color: colorForRoute(b.routeId) }}
                    >
                      {b.destination}
                    </span>
                    {!compact && <span className="block text-xs text-muted">{b.via}</span>}
                  </span>
                </span>
              </td>
              {!compact && <td className="py-2.5 pr-3 font-mono text-muted">{b.zip}</td>}
              <td className="py-2.5 pr-3 font-mono text-xs">{b.plate}</td>
              {!compact && (
                <td className="py-2.5 pr-3 font-mono tabular-nums">{formatKm(b.remainingKm)}</td>
              )}
              {!compact && (
                <td className="py-2.5 pr-3 font-mono tabular-nums">{formatSpeed(b.speedKmh)}</td>
              )}
              <td className="py-2.5 pr-3 font-mono tabular-nums">
                {formatEta(etaMinutes(b.remainingKm, b.speedKmh))}
              </td>
              <td className="py-2.5">
                <Badge tone={tone[b.status]}>{b.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="py-6 text-sm text-muted">No buses on this filter.</p>}
    </div>
  );
}

export function statusClass(status: Bus["status"]) {
  return cn(tone[status]);
}