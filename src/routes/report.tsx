import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MUNICIPALITIES } from "@/lib/fleet/routes";
import { useFleet } from "@/lib/fleet/store";
import type { ReportCategory } from "@/lib/fleet/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/report")({ component: Report });

const CATEGORIES: ReportCategory[] = [
  "Late Arrival",
  "Driver/Conductor Behavior",
  "Bus Condition",
  "Overcharging",
  "Safety Concern",
  "Others",
];

function Report() {
  const addReport = useFleet((s) => s.addReport);
  const [category, setCategory] = useState<ReportCategory | "">("");
  const [route, setRoute] = useState("");
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [ticket, setTicket] = useState<string | null>(null);

  function submit() {
    if (!category) return;
    const t = addReport({
      category,
      route,
      description,
      anonymous,
    });
    setTicket(t);
    setDescription("");
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Passenger report</h1>
        <p className="mt-1 text-sm text-muted">
          Sitex / SM Sorsogon receives this first, then forwards it to the cooperative head.
        </p>
      </div>

      {ticket ? (
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Filed</p>
          <p className="mt-2 font-display text-3xl font-semibold">{ticket}</p>
          <p className="mt-2 text-sm text-muted">Keep this number. Sitex staff will see it on the admin board.</p>
          <Button className="mt-4 w-full" variant="secondary" onClick={() => setTicket(null)}>
            File another
          </Button>
        </Card>
      ) : (
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">What happened</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "h-10 rounded-full border px-3 text-sm",
                  category === c ? "border-accent bg-accent/15 text-accent" : "border-border text-muted",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Label htmlFor="route">Route / destination</Label>
            <Input
              id="route"
              list="lgus"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="Gubat, Irosin, Bulan…"
            />
            <datalist id="lgus">
              {MUNICIPALITIES.map((m) => (
                <option key={m.id} value={m.name} />
              ))}
            </datalist>
          </div>
          <div className="mt-3">
            <Label htmlFor="desc">What happened</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <label className="mt-3 flex h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            Submit anonymously
          </label>
          <Button className="mt-4 w-full" disabled={!category} onClick={submit}>
            Submit report
          </Button>
        </Card>
      )}
    </div>
  );
}
