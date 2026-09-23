import { HOTLINES } from "@/lib/fleet/hotlines";
import { useFleet } from "@/lib/fleet/store";
import { cn } from "@/lib/utils";

export function AnnouncementBanner({ compact = false }: { compact?: boolean }) {
  const a = useFleet((s) => s.announcement);
  if (a.level === "none" || !a.title) return null;

  return (
    <section
      className={cn(
        "rounded-xl border p-5 md:p-6",
        a.level === "critical" && "border-danger/40 bg-danger/15",
        a.level === "caution" && "border-warn/40 bg-warn/12",
        a.level === "info" && "border-accent/35 bg-accent/10",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-muted">
        Public announcement
      </p>
      <h2
        className={cn(
          "mt-1 font-display font-semibold tracking-tight",
          compact ? "text-2xl" : "text-3xl md:text-5xl",
        )}
      >
        {a.title}
      </h2>
      <p className={cn("mt-2 max-w-3xl text-fg/90", compact ? "text-sm" : "text-base md:text-lg")}>
        {a.body}
      </p>
      <p className="mt-3 font-display text-lg font-semibold tracking-wide text-accent md:text-xl">
        Ingat po ang lahat
      </p>
      {a.showHotlines && (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm">
          {HOTLINES.map((h) => (
            <li key={h.n}>
              <span className="text-muted">{h.label}</span> {h.n}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
