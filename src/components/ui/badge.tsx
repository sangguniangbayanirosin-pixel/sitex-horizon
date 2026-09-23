import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  live: "bg-accent/20 text-accent",
  ok: "bg-ok/15 text-ok",
  warn: "bg-warn/15 text-warn",
  danger: "bg-danger/20 text-danger",
  muted: "bg-fg/10 text-muted",
};

export function Badge({
  className,
  tone = "muted",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium uppercase tracking-wider",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
