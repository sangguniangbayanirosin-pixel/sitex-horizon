import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdStudio } from "@/components/fleet/ad-studio";
import { ArrivalBoard } from "@/components/fleet/arrival-board";
import { ChangeStaffPin, StaffGate } from "@/components/fleet/staff-lock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { STAFF_TRIP_CODES } from "@/lib/fleet/driver-session";
import { ANNOUNCEMENT_TEMPLATES, useFleet } from "@/lib/fleet/store";
import { useStaff } from "@/lib/staff/session";
import type { AnnouncementLevel, Weather } from "@/lib/fleet/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  const hydrated = useStaff((s) => s.hydrated);
  const unlocked = useStaff((s) => s.unlocked);
  const hydrate = useStaff((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return <p className="text-sm text-muted">Checking staff session…</p>;
  }
  if (!unlocked) {
    return <StaffGate />;
  }
  return <ControlBoard />;
}

function ControlBoard() {
  const announcement = useFleet((s) => s.announcement);
  const publish = useFleet((s) => s.publishAnnouncement);
  const weather = useFleet((s) => s.weather);
  const setWeather = useFleet((s) => s.setWeather);
  const reports = useFleet((s) => s.reports);
  const updateReport = useFleet((s) => s.updateReport);
  const buses = useFleet((s) => s.buses);

  const [level, setLevel] = useState<AnnouncementLevel>(announcement.level || "caution");
  const [title, setTitle] = useState(announcement.title || ANNOUNCEMENT_TEMPLATES.caution.title);
  const [body, setBody] = useState(announcement.body || ANNOUNCEMENT_TEMPLATES.caution.body);
  const [hotlines, setHotlines] = useState(announcement.showHotlines);
  const [saved, setSaved] = useState(false);

  function loadTemplate(key: Exclude<AnnouncementLevel, "none">) {
    const t = ANNOUNCEMENT_TEMPLATES[key];
    setLevel(t.level);
    setTitle(t.title);
    setBody(t.body);
    setHotlines(t.showHotlines);
  }

  function publishNow() {
    publish({ level, title, body, showHotlines: hotlines });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Sitex control</h1>
        <p className="mt-1 text-sm text-muted">
          SM Sorsogon staff publish terminal announcements. Passenger reports go to cooperative heads.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl font-semibold">Live announcement</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["critical", "caution", "info"] as const).map((k) => (
              <Button key={k} size="sm" variant="secondary" onClick={() => loadTemplate(k)}>
                {k === "critical" ? "No travel" : k === "caution" ? "Limited buses" : "Resumed"}
              </Button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setLevel("none");
                setTitle("");
                setBody("");
                publish({ level: "none", title: "", body: "", showHotlines: false });
              }}
            >
              Clear
            </Button>
          </div>
          <div className="mt-4">
            <Label htmlFor="ann-title">Title</Label>
            <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="mt-3">
            <Label htmlFor="ann-body">Message</Label>
            <Textarea id="ann-body" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <label className="mt-3 flex h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hotlines}
              onChange={(e) => setHotlines(e.target.checked)}
            />
            Show emergency hotlines
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["critical", "caution", "info"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setLevel(k)}
                className={cn(
                  "h-9 rounded-full border px-3 text-xs uppercase",
                  level === k ? "border-accent text-accent" : "border-border text-muted",
                )}
              >
                {k}
              </button>
            ))}
          </div>
          <Button className="mt-4 w-full" onClick={publishNow}>
            Publish to all screens
          </Button>
          {saved && <p className="mt-2 text-center text-sm text-ok">Published to the terminal.</p>}
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="font-display text-xl font-semibold">Weather overlay</h2>
            <p className="mt-1 text-sm text-muted">
              Rain slows GPS speeds. Typhoon suspends trips and posts a critical announcement.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["clear", "rain", "typhoon"] as Weather[]).map((w) => (
                <Button
                  key={w}
                  size="sm"
                  variant={weather === w ? "default" : "secondary"}
                  onClick={() => setWeather(w)}
                >
                  {w}
                </Button>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="mb-3 font-display text-xl font-semibold">Fleet</h2>
            <ArrivalBoard buses={buses} compact />
          </Card>
        </div>
      </div>

      <AdStudio />

      <Card>
        <h2 className="font-display text-xl font-semibold">Passenger reports</h2>
        <p className="mt-1 text-sm text-muted">
          Sitex receives reports first, then forwards them to the bus cooperative.
        </p>
        {reports.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No reports yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {reports.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-bg p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{r.category}</span>
                    <span className="font-mono text-xs text-muted">{r.ticket}</span>
                    <Badge
                      tone={
                        r.status === "new" ? "warn" : r.status === "forwarded" ? "ok" : "muted"
                      }
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted">
                    {r.route || "Unspecified route"} · {r.description || "No details"}
                    {r.forwardedTo ? ` · sent to ${r.forwardedTo}` : ""}
                  </p>
                </div>
                {r.status !== "forwarded" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateReport(r.id, "forwarded", "Cooperative head via Sitex / SM Sorsogon")
                    }
                  >
                    Forward to cooperative
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-xl font-semibold">Driver trip codes</h2>
        <p className="mt-1 text-sm text-muted">
          Issue these 4-digit codes to drivers and conductors. Passengers never see them. Demo
          plate: 7G-4821.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {buses.map((b) => {
            const row = STAFF_TRIP_CODES.find((c) => c.plate === b.plate);
            return (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 font-mono text-sm"
              >
                <span>
                  {b.plate}
                  <span className="ml-2 text-xs text-muted">{b.destination}</span>
                </span>
                <span className="font-bold tracking-widest">{row?.code ?? "—"}</span>
              </li>
            );
          })}
        </ul>
      </Card>

      <ChangeStaffPin />
    </div>
  );
}
