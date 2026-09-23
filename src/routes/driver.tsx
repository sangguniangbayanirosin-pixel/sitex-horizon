import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { DriverConfirmPanel } from "@/components/fleet/coming-sign";
import { InstallAppCard } from "@/components/fleet/install-app";
import { PhoneGps } from "@/components/fleet/phone-gps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { stopDriverGps } from "@/lib/fleet/driver-gps";
import {
  clearClaim,
  findBusByPlate,
  loadClaim,
  saveClaim,
  verifyTripCode,
  type DriverClaim,
} from "@/lib/fleet/driver-session";
import { etaMinutes, formatEta, formatKm, formatSpeed } from "@/lib/fleet/eta";
import { useFleet } from "@/lib/fleet/store";

export const Route = createFileRoute("/driver")({ component: Driver });

function Driver() {
  const buses = useFleet((s) => s.buses);
  const selectBus = useFleet((s) => s.selectBus);
  const [claim, setClaim] = useState<DriverClaim | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const existing = loadClaim();
    if (existing && buses.some((b) => b.id === existing.busId)) {
      selectBus(existing.busId);
      setClaim(existing);
    }
    setReady(true);
  }, [buses, selectBus]);

  if (!ready) return <p className="text-sm text-muted">Opening driver desk…</p>;
  if (!claim) {
    return (
      <DriverUnlock
        onClaim={(next) => {
          saveClaim(next);
          selectBus(next.busId);
          setClaim(next);
        }}
      />
    );
  }

  return (
    <DriverDesk
      claim={claim}
      onLeave={() => {
        stopDriverGps();
        clearClaim();
        setClaim(null);
      }}
    />
  );
}

function DriverUnlock({ onClaim }: { onClaim: (c: DriverClaim) => void }) {
  const buses = useFleet((s) => s.buses);
  const [plate, setPlate] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const bus = findBusByPlate(buses, plate);
    if (!bus) {
      setError("Plate not found. Check with your cooperative.");
      return;
    }
    if (!verifyTripCode(bus.plate, code)) {
      setError("Wrong trip code. Ask Sitex or your cooperative.");
      return;
    }
    onClaim({ busId: bus.id, plate: bus.plate, claimedAt: Date.now() });
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Driver / conductor</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your bus plate and the 4-digit trip code from your cooperative. No Gmail. No
          passenger account.
        </p>
      </div>
      <Card>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="plate">Bus plate</Label>
            <Input
              id="plate"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="7G-4821"
              value={plate}
              onChange={(e) => {
                setPlate(e.target.value.toUpperCase());
                setError(null);
              }}
            />
          </div>
          <div>
            <Label htmlFor="code">Trip code</Label>
            <Input
              id="code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="4 digits"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 4));
                setError(null);
              }}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" size="lg">
            Unlock this bus
          </Button>
        </form>
      </Card>
      <InstallAppCard who="driver" />
      <p className="text-xs text-muted">
        Cooperatives issue trip codes. Sitex staff can view the list in Control after the staff PIN.
      </p>
    </div>
  );
}

function DriverDesk({ claim, onLeave }: { claim: DriverClaim; onLeave: () => void }) {
  const buses = useFleet((s) => s.buses);
  const setDriverSpeed = useFleet((s) => s.setDriverSpeed);
  const startTrip = useFleet((s) => s.startTrip);
  const endTrip = useFleet((s) => s.endTrip);
  const bus = buses.find((b) => b.id === claim.busId);

  if (!bus) {
    return (
      <Card>
        <p className="text-sm">This bus is no longer on the board.</p>
        <Button className="mt-3" onClick={onLeave}>
          Sign out
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">On duty</h1>
        <p className="mt-1 text-sm text-muted">
          You unlocked {bus.plate}. Share GPS, then you may use other apps — keep this one in the
          background.
        </p>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-lg">{bus.plate}</p>
            <p className="text-sm text-muted">
              {bus.destination} · {bus.zip} · {bus.via} · {bus.operator}
            </p>
          </div>
          <Badge
            tone={
              bus.status === "delayed"
                ? "warn"
                : bus.status === "en-route"
                  ? "ok"
                  : bus.status === "suspended"
                    ? "danger"
                    : "muted"
            }
          >
            {bus.status}
          </Badge>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3 font-mono text-sm">
          <div>
            <dt className="text-xs text-muted">Left</dt>
            <dd>{formatKm(bus.remainingKm)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Speed</dt>
            <dd>{formatSpeed(bus.speedKmh)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">ETA</dt>
            <dd>{formatEta(etaMinutes(bus.remainingKm, bus.speedKmh))}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <label htmlFor="speed" className="text-xs font-medium uppercase tracking-wide text-muted">
            Speed override (demo)
          </label>
          <input
            id="speed"
            type="range"
            min={0}
            max={100}
            value={Math.round(bus.speedKmh)}
            onChange={(e) => setDriverSpeed(bus.id, Number(e.target.value))}
            className="mt-2 w-full"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={() => startTrip(bus.id)}>
            Start trip
          </Button>
          <Button className="flex-1" variant="secondary" onClick={() => endTrip(bus.id)}>
            End trip
          </Button>
        </div>
      </Card>

      <DriverConfirmPanel busId={bus.id} />
      <PhoneGps busId={bus.id} />
      <InstallAppCard who="driver" />
      <Button variant="ghost" onClick={onLeave}>
        Sign out this bus
      </Button>
    </div>
  );
}
