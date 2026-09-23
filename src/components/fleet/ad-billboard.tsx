import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { resolveAdSrc } from "@/lib/fleet/ads-media";
import { useFleet } from "@/lib/fleet/store";
import type { Advertisement } from "@/lib/fleet/types";
import { cn } from "@/lib/utils";

export function AdBillboard({ compact = false }: { compact?: boolean }) {
  const ads = useFleet((s) => s.ads);
  const live = useMemo(() => ads.filter((a) => a.active && a.src), [ads]);
  const [index, setIndex] = useState(0);
  const [resolved, setResolved] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    void Promise.all(
      live.map(async (ad) => {
        const src = await resolveAdSrc(ad.src);
        const poster = ad.posterSrc ? await resolveAdSrc(ad.posterSrc) : "";
        return [ad.id, src, poster] as const;
      }),
    ).then((rows) => {
      if (cancelled) return;
      const next: Record<string, string> = {};
      for (const [id, src, poster] of rows) {
        if (src) next[id] = src;
        if (poster) next[`${id}-poster`] = poster;
      }
      setResolved(next);
    });
    return () => {
      cancelled = true;
    };
  }, [live]);

  useEffect(() => {
    if (live.length < 2) return;
    const current = live[index % live.length];
    const ms = Math.max(5, current?.dwellSec ?? 12) * 1000;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % live.length), ms);
    return () => window.clearTimeout(t);
  }, [live, index]);

  if (live.length === 0) {
    return (
      <section className="glass overflow-hidden rounded-xl">
        <div className={cn("flex flex-col justify-end p-5", compact ? "min-h-36" : "min-h-44")}>
          <Badge tone="muted" className="w-fit">
            Partner space
          </Badge>
          <p className="mt-3 font-display text-2xl font-semibold tracking-tight">
            This screen is for Sorsogon
          </p>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Sitex admin can upload a poster or HD video here. Every waiting passenger sees it.
          </p>
        </div>
      </section>
    );
  }

  const ad = live[index % live.length];
  const src = resolved[ad.id] || (ad.src.startsWith("idb:") ? "" : ad.src);
  const poster = resolved[`${ad.id}-poster`] || ad.posterSrc;

  return (
    <section className="glass overflow-hidden rounded-xl">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <Badge tone="muted">Advertisement</Badge>
          <p className="truncate text-xs uppercase tracking-widest text-muted">{ad.sponsor}</p>
        </div>
        {live.length > 1 && (
          <div className="flex items-center gap-1.5">
            {live.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ad ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "size-2 rounded-full",
                  i === index % live.length ? "bg-accent" : "bg-fg/25",
                )}
              />
            ))}
          </div>
        )}
      </div>
      <AdCreative ad={ad} src={src} poster={poster} compact={compact} />
    </section>
  );
}

function AdCreative({
  ad,
  src,
  poster,
  compact,
}: {
  ad: Advertisement;
  src: string;
  poster?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-bg", compact ? "aspect-video" : "ad-cinema")}>
      {ad.kind === "video" && src ? (
        <video
          key={src}
          className="absolute inset-0 size-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : src ? (
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-surface-2" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 md:p-5">
        <div className="min-w-0 max-w-2xl">
          <p className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{ad.headline}</p>
          {ad.caption && <p className="mt-1 text-sm text-fg/85">{ad.caption}</p>}
        </div>
        {ad.ctaLabel && (
          <a
            href={ad.ctaUrl || "#"}
            className="inline-flex h-11 shrink-0 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
          >
            {ad.ctaLabel}
          </a>
        )}
      </div>
    </div>
  );
}
