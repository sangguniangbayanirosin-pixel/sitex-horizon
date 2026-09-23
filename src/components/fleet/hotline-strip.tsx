import { HOTLINES } from "@/lib/fleet/hotlines";

export function HotlineStrip() {
  return (
    <aside className="glass rounded-xl px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-widest text-muted">
        Ingat po ang lahat · emergency hotlines
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm">
        {HOTLINES.map((h) => (
          <li key={h.n}>
            <span className="text-muted">{h.label}</span> {h.n}
          </li>
        ))}
      </ul>
    </aside>
  );
}
