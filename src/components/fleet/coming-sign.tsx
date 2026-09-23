import { MiniBus } from "@/components/fleet/mini-bus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { colorForRoute } from "@/lib/fleet/colors";
import { useFleet } from "@/lib/fleet/store";
import type { Bus, ComingAsk } from "@/lib/fleet/types";
import { cn } from "@/lib/utils";

function isOpenAsk(a: ComingAsk) {
  return a.status === "pending" || a.status === "confirmed";
}

function openAskFor(asks: ComingAsk[], busId: string) {
  return asks.find((a) => a.busId === busId && isOpenAsk(a));
}

export function ConfirmedSigns({ huge = false }: { huge?: boolean }) {
  const asks = useFleet((s) => s.asks);
  const confirmed = asks.filter((a) => a.status === "confirmed");
  if (confirmed.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {confirmed.map((a) => (
        <section
          key={a.id}
          className={cn(
            "confirm-sign rounded-xl px-5 py-5 md:px-7 md:py-6",
            huge && "md:py-8",
          )}
        >
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-100">
            Conductor confirmed
          </p>
          <p
            className={cn(
              "mt-1 font-display font-semibold tracking-tight text-white",
              huge ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl",
            )}
          >
            BUS {a.plate}
          </p>
          <p className={cn("mt-1 font-bold uppercase tracking-wide text-amber-200", huge ? "text-2xl md:text-4xl" : "text-xl")}>
            {a.destination} is coming to SITEX
          </p>
          <p className="mt-2 text-sm text-sky-100/85">
            Locked until this bus arrives. Plate {a.plate} · zip {a.zip}.
          </p>
        </section>
      ))}
    </div>
  );
}

export function PassengerAskPanel({ buses }: { buses: Bus[] }) {
  const asks = useFleet((s) => s.asks);
  const askIfComing = useFleet((s) => s.askIfComing);
  const rows = buses.filter((b) => b.status === "en-route" || b.status === "delayed" || b.status === "idle");

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-accent">Ask the conductor</p>
      <h2 className="font-display text-2xl font-semibold tracking-tight">Is this bus coming?</h2>
      <p className="mt-1 text-sm text-muted">
        One passenger tap is enough. The button stays locked until the bus arrives — or the driver
        revokes. Extra taps do nothing.
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {rows.map((b) => {
          const open = openAskFor(asks, b.id);
          return (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-3"
              style={{ borderLeft: `4px solid ${colorForRoute(b.routeId)}` }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <MiniBus routeId={b.routeId} size={16} />
                <div>
                  <p className="font-mono text-sm font-bold">{b.plate}</p>
                  <p className="text-xs uppercase tracking-wide text-muted">{b.destination}</p>
                </div>
              </div>
              {open?.status === "confirmed" ? (
                <span className="rounded-full bg-ok/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ok">
                  Confirmed · locked
                </span>
              ) : open?.status === "pending" ? (
                <span className="ask-pulse rounded-full bg-warn/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">
                  Asked · waiting
                </span>
              ) : (
                <Button size="sm" onClick={() => askIfComing(b.id)}>
                  Ask if coming
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function DriverConfirmPanel({ busId }: { busId: string }) {
  const asks = useFleet((s) => s.asks);
  const confirmAsk = useFleet((s) => s.confirmAsk);
  const revokeAsk = useFleet((s) => s.revokeAsk);
  const pending = asks.filter((a) => a.busId === busId && a.status === "pending");
  const confirmed = asks.filter((a) => a.busId === busId && a.status === "confirmed");

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-accent">Passenger pings</p>
      <h2 className="font-display text-2xl font-semibold tracking-tight">Confirm you are coming</h2>
      <p className="mt-1 text-sm text-muted">
        One confirm lights the plate on every SITEX screen until you arrive. Revoke if you cannot
        complete the trip.
      </p>
      {pending.length === 0 && confirmed.length === 0 && (
        <p className="mt-4 text-sm text-muted">No passenger asks right now.</p>
      )}
      <ul className="mt-4 flex flex-col gap-3">
        {pending.map((a) => (
          <li key={a.id} className="rounded-lg border border-warn/35 bg-warn/10 px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-widest text-warn">Waiting for you</p>
            <p className="mt-1 font-display text-2xl font-semibold">
              Are you coming to SITEX?
            </p>
            <p className="text-sm text-muted">
              {a.destination} · plate {a.plate}
            </p>
            <Button className="mt-3 w-full" size="lg" onClick={() => confirmAsk(a.id)}>
              Confirmed
            </Button>
          </li>
        ))}
        {confirmed.map((a) => (
          <li key={a.id} className="rounded-lg border border-ok/30 bg-ok/10 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-ok">Posted on public board</p>
            <p className="font-mono text-lg font-bold">{a.plate}</p>
            <p className="mt-1 text-sm text-muted">Locked until arrival. Revoke only if this trip is cancelled.</p>
            <Button className="mt-3 w-full" variant="danger" onClick={() => revokeAsk(a.id)}>
              Revoke confirmation
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
