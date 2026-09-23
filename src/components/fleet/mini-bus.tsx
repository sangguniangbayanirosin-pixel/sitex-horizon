import { colorForRoute, colorForTown } from "@/lib/fleet/colors";
import { cn } from "@/lib/utils";

export function miniBusSvg(fill: string, size = 40): string {
  const h = Math.round(size * 0.55);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}" viewBox="0 0 48 26" aria-hidden="true">
  <rect x="3.2" y="4" width="39.5" height="13.2" rx="3.6" fill="${fill}"/>
  <path d="M3.2 10.2 V17 H1.4 A1.4 1.4 0 0 1 0 15.6 V12.4 Z" fill="${fill}"/>
  <rect x="8" y="6.4" width="8" height="6.2" rx="1.1" fill="#061018" opacity="0.5"/>
  <rect x="18" y="6.4" width="8" height="6.2" rx="1.1" fill="#061018" opacity="0.42"/>
  <rect x="28" y="6.4" width="7.2" height="6.2" rx="1.1" fill="#061018" opacity="0.34"/>
  <rect x="37.4" y="8" width="3.2" height="2.3" rx="0.45" fill="#fff8d6"/>
  <circle cx="13" cy="19.6" r="3.15" fill="#0b1220"/>
  <circle cx="13" cy="19.6" r="1.35" fill="#cbd5e1"/>
  <circle cx="35" cy="19.6" r="3.15" fill="#0b1220"/>
  <circle cx="35" cy="19.6" r="1.35" fill="#cbd5e1"/>
  <rect x="6" y="15.4" width="34" height="1.15" fill="#061018" opacity="0.22"/>
</svg>`;
}

export function MiniBus({
  color,
  routeId,
  town,
  className,
  size = 16,
  title,
}: {
  color?: string;
  routeId?: string;
  town?: string;
  className?: string;
  size?: number;
  title?: string;
}) {
  const fill = color ?? (routeId ? colorForRoute(routeId) : town ? colorForTown(town) : "#5B9DFF");
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: Math.round(size * 0.55) }}
      title={title}
      aria-hidden={!title}
      dangerouslySetInnerHTML={{ __html: miniBusSvg(fill, size) }}
    />
  );
}
