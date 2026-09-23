import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  compressImageFile,
  detectKind,
  isUploadedSrc,
  resolveAdSrc,
  saveAdBlob,
} from "@/lib/fleet/ads-media";
import { useFleet } from "@/lib/fleet/store";
import type { AdKind, Advertisement } from "@/lib/fleet/types";
import { cn } from "@/lib/utils";

const EMPTY: Advertisement = {
  id: "",
  kind: "poster",
  src: "",
  posterSrc: "",
  sponsor: "",
  headline: "",
  caption: "",
  ctaLabel: "Learn more",
  ctaUrl: "",
  dwellSec: 12,
  active: true,
  updatedAt: 0,
};

export function AdStudio() {
  const ads = useFleet((s) => s.ads);
  const upsertAd = useFleet((s) => s.upsertAd);
  const toggleAd = useFleet((s) => s.toggleAd);
  const removeAd = useFleet((s) => s.removeAd);

  const [draft, setDraft] = useState<Advertisement>(EMPTY);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!draft.src) {
      setPreview("");
      return;
    }
    void resolveAdSrc(draft.src).then((url) => {
      if (!cancelled) setPreview(url);
    });
    return () => {
      cancelled = true;
    };
  }, [draft.src]);

  function edit(ad: Advertisement) {
    setDraft({ ...ad });
    setNote(null);
  }

  function reset() {
    setDraft({ ...EMPTY, id: crypto.randomUUID() });
    setPreview("");
    setNote(null);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    const kind = detectKind(file);
    if (!kind) {
      setNote("Use a poster (JPG, PNG, WebP) or a video (MP4, WebM).");
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      const id = draft.id || crypto.randomUUID();
      const blob = kind === "poster" ? await compressImageFile(file) : file;
      await saveAdBlob(id, blob);
      setDraft((d) => ({
        ...d,
        id,
        kind,
        src: `idb:${id}`,
        posterSrc: kind === "video" ? d.posterSrc : undefined,
      }));
      setNote(kind === "poster" ? "Poster ready." : "Video ready. It plays muted on the public board.");
    } catch {
      setNote("Could not store that file. Try a smaller one.");
    } finally {
      setBusy(false);
    }
  }

  function publish() {
    if (!draft.headline.trim() || !draft.src) {
      setNote("Add a headline and a poster or video.");
      return;
    }
    const ad: Advertisement = {
      ...draft,
      id: draft.id || crypto.randomUUID(),
      sponsor: draft.sponsor.trim() || "SITEX Partner",
      headline: draft.headline.trim(),
      dwellSec: Math.max(5, Math.min(60, Number(draft.dwellSec) || 12)),
      updatedAt: Date.now(),
    };
    upsertAd(ad);
    setDraft(ad);
    setNote("Live on the terminal and passenger screens.");
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Advertisement studio</h2>
          <p className="mt-1 text-sm text-muted">
            Upload a poster or HD video. It rotates on the public SITEX board.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={reset}>
          New slot
        </Button>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {ads.map((ad) => (
          <li
            key={ad.id}
            className={cn(
              "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-bg/50 px-3 py-2",
              draft.id === ad.id && "border-accent/40",
            )}
          >
            <button type="button" className="min-w-0 text-left" onClick={() => edit(ad)}>
              <p className="truncate font-medium">{ad.headline || "Untitled"}</p>
              <p className="text-xs text-muted">
                {ad.kind === "video" ? "Video" : "Poster"} · {ad.sponsor} · {ad.dwellSec}s
                {ad.active ? "" : " · off"}
              </p>
            </button>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => toggleAd(ad.id, !ad.active)}>
                {ad.active ? "On" : "Off"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => removeAd(ad.id)}>
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="flex gap-2">
            {(["poster", "video"] as AdKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, kind: k }))}
                className={cn(
                  "h-10 flex-1 rounded-md border text-sm capitalize",
                  draft.kind === k
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-muted",
                )}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Label htmlFor="ad-file">Upload {draft.kind === "video" ? "video" : "poster"}</Label>
            <Input
              id="ad-file"
              type="file"
              accept={draft.kind === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"}
              disabled={busy}
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
          </div>
          <div className="mt-3">
            <Label htmlFor="ad-url">Or paste a media URL</Label>
            <Input
              id="ad-url"
              value={isUploadedSrc(draft.src) ? "" : draft.src}
              placeholder="/sitex-photo.jpg or https://…"
              onChange={(e) => setDraft((d) => ({ ...d, src: e.target.value }))}
            />
          </div>
          <div className="mt-3">
            <Label htmlFor="ad-sponsor">Advertiser / sponsor</Label>
            <Input
              id="ad-sponsor"
              value={draft.sponsor}
              onChange={(e) => setDraft((d) => ({ ...d, sponsor: e.target.value }))}
            />
          </div>
          <div className="mt-3">
            <Label htmlFor="ad-head">Headline</Label>
            <Input
              id="ad-head"
              value={draft.headline}
              onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))}
            />
          </div>
          <div className="mt-3">
            <Label htmlFor="ad-cap">Caption</Label>
            <Textarea
              id="ad-cap"
              value={draft.caption}
              onChange={(e) => setDraft((d) => ({ ...d, caption: e.target.value }))}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ad-cta">Button label</Label>
              <Input
                id="ad-cta"
                value={draft.ctaLabel}
                onChange={(e) => setDraft((d) => ({ ...d, ctaLabel: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="ad-dwell">Seconds on screen</Label>
              <Input
                id="ad-dwell"
                type="number"
                min={5}
                max={60}
                value={draft.dwellSec}
                onChange={(e) => setDraft((d) => ({ ...d, dwellSec: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="mt-3">
            <Label htmlFor="ad-link">Button link</Label>
            <Input
              id="ad-link"
              value={draft.ctaUrl}
              placeholder="https://…"
              onChange={(e) => setDraft((d) => ({ ...d, ctaUrl: e.target.value }))}
            />
          </div>
          <label className="mt-3 flex h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
            />
            Show on public screens
          </label>
          <Button className="mt-4 w-full" disabled={busy} onClick={publish}>
            {busy ? "Preparing media…" : "Publish to terminal"}
          </Button>
          {note && <p className="mt-2 text-center text-sm text-ok">{note}</p>}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Preview</p>
          <div className="relative mt-2 overflow-hidden rounded-lg border border-border bg-bg">
            <div className="relative aspect-video">
              {draft.kind === "video" && preview ? (
                <video
                  key={preview}
                  className="absolute inset-0 size-full object-cover"
                  src={preview}
                  poster={draft.posterSrc}
                  muted
                  controls
                  playsInline
                />
              ) : preview ? (
                <img src={preview} alt="" className="absolute inset-0 size-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
                  Upload a poster or video to preview
                </div>
              )}
            </div>
            {(draft.headline || draft.sponsor) && (
              <div className="border-t border-border p-3">
                <Badge tone="muted">Advertisement</Badge>
                <p className="mt-2 font-display text-xl font-semibold">{draft.headline || "Headline"}</p>
                <p className="text-xs text-muted">{draft.sponsor || "Sponsor"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
