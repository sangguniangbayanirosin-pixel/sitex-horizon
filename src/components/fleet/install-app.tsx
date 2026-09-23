import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PromptEvent = Event & { prompt: () => Promise<void> };

export function InstallAppCard({ who }: { who: "passenger" | "driver" }) {
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as PromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const copy =
    who === "driver"
      ? "Install Sitex Horizon on this phone like an app. After you sign in with plate and code, you can switch to another app — GPS stays on in the background."
      : "Install Sitex Horizon on your phone. Open it at the terminal to see live arrivals — no account needed.";

  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-accent">Use as an app</p>
      <p className="mt-1 text-sm text-fg/90">{copy}</p>
      <p className="mt-2 text-xs text-muted">
        iPhone: Share → Add to Home Screen. Android: browser menu → Install app.
      </p>
      {prompt && !done && (
        <Button
          className="mt-3 w-full"
          onClick={async () => {
            await prompt.prompt();
            setDone(true);
          }}
        >
          Install app
        </Button>
      )}
    </Card>
  );
}
