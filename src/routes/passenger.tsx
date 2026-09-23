import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdBillboard } from "@/components/fleet/ad-billboard";
import { AnnouncementBanner } from "@/components/fleet/announcement-banner";
import { ConfirmedSigns, PassengerAskPanel } from "@/components/fleet/coming-sign";
import { ArrivalBoard } from "@/components/fleet/arrival-board";
import { HotlineStrip } from "@/components/fleet/hotline-strip";
import { InstallAppCard } from "@/components/fleet/install-app";
import { JourneyPlanner } from "@/components/fleet/journey-planner";
import { LiveMap } from "@/components/fleet/live-map";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFleet } from "@/lib/fleet/store";

export const Route = createFileRoute("/passenger")({ component: Passenger });

function Passenger() {
  const buses = useFleet((s) => s.buses);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q) return buses;
    const s = q.toLowerCase();
    return buses.filter(
      (b) =>
        b.destination.toLowerCase().includes(s) ||
        b.plate.toLowerCase().includes(s) ||
        b.zip.includes(s) ||
        b.via.toLowerCase().includes(s),
    );
  }, [buses, q]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 md:max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Where are you going?</h1>
        <p className="mt-1 text-sm text-muted">
          Pick your town. See when the next bus reaches SITEX and what time you’ll be home.
        </p>
      </div>

      <AnnouncementBanner compact />
      <ConfirmedSigns />
      <PassengerAskPanel buses={filtered} />
      <JourneyPlanner compact />

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search town, zip, or plate"
        aria-label="Search destination"
      />

      <Card className="p-3">
        <LiveMap buses={filtered} />
      </Card>

      <Card>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-accent">Upcoming</p>
        <ArrivalBoard buses={filtered} compact />
      </Card>

      <AdBillboard compact />
      <HotlineStrip />
      <InstallAppCard who="passenger" />

      <Button asChild>
        <Link to="/report">Report an issue</Link>
      </Button>
    </div>
  );
}
