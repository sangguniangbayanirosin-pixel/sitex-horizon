import { MiniBus } from "@/components/fleet/mini-bus";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { etaMinutes, formatEta, formatKm } from "@/lib/fleet/eta";
import { formatClock, planJourney } from "@/lib/fleet/journey";
import { MUNICIPALITIES } from "@/lib/fleet/routes";
import { useFleet } from "@/lib/fleet/store";
import { cn } from "@/lib/utils";

export function JourneyPlanner({ compact = false }: { compact?: boolean }) {
  const buses = useFleet((s) => s.buses);
  const weather = useFleet((s) => s.weather);
  const now = useFleet((s) => s.now);
  const [dest, setDest] = useState<string>("Gubat");

  const journey = useMemo(
    () => planJourney(dest, buses, weather, now || Date.now()),
    [dest, buses, weather, now],
  );

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-accent">Going home?</p>
      <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
        Measure your travel time
      </h2>
      <p className="mt-1 text-sm text-muted">
        Wait at SITEX + ride on the road. Updates as the bus speed changes.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MUNICIPALITIES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setDest(m.name)}
            className={cn(
              "flex h-11 items-center justify-center gap-1.5 rounded-md border px-2 text-sm font-bold uppercase tracking-wide",
              dest === m.name
                ? "border-transparent text-fg"
                : "border-border text-muted",
            )}
            style={
              dest === m.name
                ? { background: `${m.color}33`, borderColor: m.color, color: m.color }
                : { borderLeft: `4px solid ${m.color}` }
            }
          >
            <MiniBus color={m.color} size={16} />
            {m.name}
          </button>
        ))}
      </div>

      {journey && <JourneyResult journey={journey} compact={compact} />}
    </Card>
  );
}

function JourneyResult({
  journey,
  compact,
}: {
  journey: NonNullable<ReturnType<typeof planJourney>>;
  compact?: boolean;
}) {
  const { town, bus, waitMin, rideMin, boardMin, totalMin, homeAt, suspended } = journey;

  if (suspended) {
    return (
      <div className="mt-5 rounded-lg border border-danger/40 bg-danger/10 p-4">
        <p className="font-display text-2xl font-semibold">No travel today</p>
        <p className="mt-1 text-sm text-muted">
          Typhoon / LGU ordinance. Stay safe — Ingat po ang lahat.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-3 md:grid-cols-4">
      <Stat label="Bus at SITEX" value={formatEta(waitMin)} hint={bus ? bus.plate : "No unit live"} />
      <Stat label="Loading" value={`${boardMin} min`} hint="Bay time before departure" />
      <Stat
        label={`Ride to ${town.name}`}
        value={formatEta(rideMin)}
        hint={`${formatKm(town.roadKm)} · zip ${town.zip}`}
      />
      <Stat
        label="You'll be home"
        value={homeAt ? formatClock(homeAt) : "—"}
        hint={totalMin != null ? `about ${formatEta(totalMin)} from now` : "Waiting for a live bus"}
        accent
      />
      {!compact && bus && (
        <p className="md:col-span-4 text-sm text-muted">
          {bus.plate} · {bus.operator} · {formatKm(bus.remainingKm)} out · GPS{" "}
          {bus.gpsSource === "phone" ? "phone" : "live sim"} · inbound{" "}
          {formatEta(etaMinutes(bus.remainingKm, bus.speedKmh))}{" "}
          <Badge tone={bus.status === "delayed" ? "warn" : "ok"}>{bus.status}</Badge>
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg/50 p-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={cn("mt-1 font-display text-3xl font-semibold tracking-tight", accent && "text-accent")}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}
