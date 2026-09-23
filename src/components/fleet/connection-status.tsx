import { useFleet } from "@/lib/fleet/store";
import { cn } from "@/lib/utils";

export function ConnectionStatus() {
  const online = useFleet((s) => s.online);
  const cloud = useFleet((s) => s.cloud);
  const live = online && cloud;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider",
        live ? "text-ok" : online ? "text-warn" : "text-danger",
      )}
    >
      <span className={cn("size-1.5 rounded-full", live ? "bg-ok" : online ? "bg-warn" : "bg-danger")} />
      {live ? "Live cloud" : online ? "Local only" : "Offline"}
    </span>
  );
}
