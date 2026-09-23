import { useEffect, useRef } from "react";
import { GlitterField } from "@/components/fleet/glitter-field";
import { cn } from "@/lib/utils";

export function SitexStage() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 glitter-stage" aria-hidden />
      <GlitterField />
    </>
  );
}

/** Compact SITEX terminal footage for the TV board — not a full-screen hero. */
export function SitexLiveReel({ className }: { className?: string }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    el.muted = true;
    const play = () => void el.play().catch(() => undefined);
    play();
    el.addEventListener("canplay", play);
    return () => el.removeEventListener("canplay", play);
  }, []);

  return (
    <div className={cn("terminal-cam relative overflow-hidden rounded-xl", className)}>
      <video
        ref={video}
        className="h-full w-full object-cover object-[center_40%]"
        autoPlay
        muted
        loop
        playsInline
        poster="/sitex-terminal.jpg"
        aria-hidden
      >
        <source src="/sitex-terminal.mp4" type="video/mp4" />
      </video>
      <img
        src="/sitex-terminal.jpg"
        alt=""
        className="terminal-cam-still absolute inset-0 hidden h-full w-full object-cover object-[center_40%]"
      />
    </div>
  );
}
