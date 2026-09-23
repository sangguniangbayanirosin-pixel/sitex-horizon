import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStaff } from "@/lib/staff/session";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "go"] as const;

export function StaffLockButton() {
  const hydrated = useStaff((s) => s.hydrated);
  const unlocked = useStaff((s) => s.unlocked);
  const lock = useStaff((s) => s.lock);
  const hydrate = useStaff((s) => s.hydrate);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return <span className="size-10" aria-hidden />;
  }

  if (unlocked) {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="live">Control</Badge>
        <button
          type="button"
          className="h-10 rounded-md px-3 text-sm text-muted hover:text-fg"
          onClick={() => {
            lock();
            void navigate({ to: "/" });
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="Sitex staff sign in"
        className="inline-flex size-10 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"
        onClick={() => setOpen(true)}
      >
        <LockIcon />
      </button>
      {open && (
        <StaffPinDialog
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            void navigate({ to: "/admin" });
          }}
        />
      )}
    </>
  );
}

export function StaffGate() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div>
        <h1 className="text-center font-display text-3xl font-semibold tracking-tight">Sitex Control</h1>
        <p className="mt-1 text-center text-sm text-muted">
          Staff only. Passengers on the public board cannot open this. Sitex / SM Sorsogon
          signs in with the operations PIN.
        </p>
      </div>
      <Card className="mx-auto w-full max-w-sm p-6">
        <StaffPinPad onSuccess={() => undefined} />
      </Card>
    </div>
  );
}

function StaffPinDialog({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <button
        type="button"
        className="absolute inset-0 z-0 bg-bg/70"
        aria-label="Close"
        onClick={onClose}
      />
      <Card className="relative z-10 w-full max-w-sm p-6">
        <p className="text-center font-display text-xl font-semibold">Staff sign in</p>
        <p className="mt-1 text-center text-sm text-muted">
          For Sitex operations and SM Sorsogon — not for waiting passengers.
        </p>
        <div className="mt-5">
          <StaffPinPad onSuccess={onSuccess} />
        </div>
        <Button className="mt-4 w-full" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </Card>
    </div>
  );
}

export function StaffPinPad({ onSuccess }: { onSuccess: () => void }) {
  const unlock = useStaff((s) => s.unlock);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(value = pin) {
    if (busy) return;
    setBusy(true);
    setError(null);
    const ok = await unlock(value);
    setBusy(false);
    if (ok) {
      setPin("");
      onSuccess();
      return;
    }
    setPin("");
    setError("Wrong PIN. Ask Sitex operations.");
  }

  function press(key: (typeof KEYS)[number]) {
    setError(null);
    if (key === "clear") {
      setPin("");
      return;
    }
    if (key === "go") {
      void submit();
      return;
    }
    const next = (pin + key).slice(0, 4);
    setPin(next);
    if (next.length === 4) void submit(next);
  }

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <input
        aria-label="Staff PIN"
        className="sr-only"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        value={pin}
        onChange={(e) => {
          const next = e.target.value.replace(/\D/g, "").slice(0, 4);
          setPin(next);
          setError(null);
          if (next.length === 4) void submit(next);
        }}
      />
      <div className="mb-5 flex items-center justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "flex size-14 items-center justify-center rounded-lg border bg-surface font-mono text-2xl font-semibold",
              pin[i] ? "border-accent text-fg" : "border-border text-subtle",
            )}
          >
            {pin[i] ?? "•"}
          </div>
        ))}
      </div>
      <div className="mx-auto grid w-full grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            disabled={busy}
            onClick={() => press(key)}
            className={cn(
              "flex h-14 items-center justify-center rounded-lg border border-border text-lg font-semibold",
              key === "go" ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg hover:bg-surface",
            )}
          >
            {key === "clear" ? "Clear" : key === "go" ? "Enter" : key}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-center text-sm text-danger">{error}</p>}
      <p className="mt-3 text-center text-xs text-muted">
        Public TVs stay locked. Staff use this on their own phone or office PC.
      </p>
    </div>
  );
}

export function ChangeStaffPin() {
  const changePin = useStaff((s) => s.changePin);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [note, setNote] = useState<string | null>(null);

  async function save() {
    const result = await changePin(current, next);
    if (result === "ok") {
      setCurrent("");
      setNext("");
      setNote("PIN updated. Give the new PIN only to Sitex / SM staff.");
      return;
    }
    setNote(result === "bad-current" ? "Current PIN is wrong." : "New PIN must be 4 digits.");
  }

  return (
    <Card>
      <h2 className="font-display text-xl font-semibold">Staff PIN</h2>
      <p className="mt-1 text-sm text-muted">
        When Sitex management takes over, they change this PIN. Do not post it on the public board.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="pin-now">Current PIN</Label>
          <Input
            id="pin-now"
            inputMode="numeric"
            maxLength={4}
            value={current}
            onChange={(e) => setCurrent(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </div>
        <div>
          <Label htmlFor="pin-next">New 4-digit PIN</Label>
          <Input
            id="pin-next"
            inputMode="numeric"
            maxLength={4}
            value={next}
            onChange={(e) => setNext(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </div>
      </div>
      <Button className="mt-4" variant="secondary" onClick={() => void save()}>
        Save new PIN
      </Button>
      {note && <p className="mt-2 text-sm text-ok">{note}</p>}
    </Card>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
