import { etaMinutes, formatEta } from "@/lib/fleet/eta";
import type { Bus } from "@/lib/fleet/types";
import { cn } from "@/lib/utils";

export function EtaReadout({ bus, className }: { bus: Bus; className?: string }) {
  const eta = etaMinutes(bus.remainingKm, bus.speedKmh);
  return (
    <span className={cn("font-mono tabular-nums", className)}>{formatEta(eta)}</span>
  );
}
