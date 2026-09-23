import { MiniBus } from "@/components/fleet/mini-bus";
import { MUNICIPALITIES } from "@/lib/fleet/routes";
import { etaMinutes, formatEta, formatKm } from "@/lib/fleet/eta";
import { rideMinutes } from "@/lib/fleet/journey";
import { useFleet } from "@/lib/fleet/store";
import { cn } from "@/lib/utils";

export function MunicipalityBoard() {
  const buses = useFleet((s) => s.buses);
  const weather = useFleet((s) => s.weather);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-accent">
            Province coverage
          </p>
          <p className="font-display text-2xl font-semibold tracking-tight">
            16 LGUs · accurate road km from SITEX
          </p>
        </div>
        <p className="font-mono text-xs text-muted">Zip 4700–4715</p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {MUNICIPALITIES.map((m) => {
          const next = buses
            .filter((b) => b.destination === m.name)
            .map((b) => ({ b, eta: etaMinutes(b.remainingKm, b.speedKmh) }))
            .sort((a, c) => (a.eta ?? 9999) - (c.eta ?? 9999))[0];
          const ride = rideMinutes(m.roadKm, m.cruiseKmh, weather);
          return (
            <li
              key={m.id}
              className="rounded-lg border border-border bg-bg/40 px-3 py-3"
              style={{ borderLeft: `4px solid ${m.color}` }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wide">
                  <MiniBus color={m.color} size={16} title={`${m.name} bus`} />
                  <span style={{ color: m.color }}>{m.name}</span>
                </p>
                <p className="font-mono text-xs text-muted">{m.zip}</p>
              </div>
              <p className="mt-1 font-mono text-xs text-muted">
                {formatKm(m.roadKm)} · ride {formatEta(ride)}
              </p>
              <p className={cn("mt-2 font-mono text-sm", next?.eta != null ? "text-accent" : "text-muted")}>
                Next {next ? formatEta(next.eta) : "—"}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}