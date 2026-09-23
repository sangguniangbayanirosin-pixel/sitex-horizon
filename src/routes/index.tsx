import { createFileRoute } from "@tanstack/react-router";
import { AdBillboard } from "@/components/fleet/ad-billboard";
import { AnnouncementBanner } from "@/components/fleet/announcement-banner";
import { ConfirmedSigns } from "@/components/fleet/coming-sign";
import { ArrivalBoard } from "@/components/fleet/arrival-board";
import { HotlineStrip } from "@/components/fleet/hotline-strip";
import { JourneyPlanner } from "@/components/fleet/journey-planner";
import { LiveMap } from "@/components/fleet/live-map";
import { MunicipalityBoard } from "@/components/fleet/municipality-board";
import { NextArrivals } from "@/components/fleet/next-arrivals";
import { SitexLiveReel } from "@/components/fleet/sitex-stage";
import { Card } from "@/components/ui/card";
import { useFleet } from "@/lib/fleet/store";

export const Route = createFileRoute("/")({ component: Terminal });

function Terminal() {
  const buses = useFleet((s) => s.buses);
  const now = useFleet((s) => s.now);
  const weather = useFleet((s) => s.weather);
  const active = buses.filter((b) => b.status === "en-route" || b.status === "delayed").length;
  const last = Math.max(...buses.map((b) => b.lastFixAt));
  const age = Math.max(0, Math.round((now - last) / 1000));

  return (
    <div className="flex flex-col gap-4">
      <AnnouncementBanner />
      <ConfirmedSigns huge />

      <section className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-accent">
            Next buses to SITEX
          </p>
          <NextArrivals buses={buses} />
        </Card>

        <aside className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-xl outline outline-1 -outline-offset-1 outline-fg/15">
            <SitexLiveReel className="aspect-video h-36 w-full sm:h-40 lg:h-44" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-sky-200">
                SITEX · SM Sorsogon
              </p>
              <p className="font-display text-sm font-semibold text-white">Terminal view</p>
            </div>
          </div>
          <Card className="p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-accent">Live GPS map</p>
            <LiveMap buses={buses} compact />
          </Card>
        </aside>
      </section>

      <AdBillboard />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-accent">All arrivals</p>
          <ArrivalBoard buses={buses} />
        </Card>
        <JourneyPlanner compact />
      </div>

      <Card>
        <MunicipalityBoard />
      </Card>

      <p className="font-mono text-xs text-muted">
        {active} buses live · GPS {age}s ago · weather {weather}
      </p>

      <HotlineStrip />
    </div>
  );
}
