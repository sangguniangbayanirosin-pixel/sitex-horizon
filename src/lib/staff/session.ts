import { create } from "zustand";

const PIN_KEY = "sitex-staff-pin-hash";
const SESSION_KEY = "sitex-staff-session";
const DEFAULT_PIN = "4700";
const IDLE_MS = 10 * 60 * 1000;

async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`sitex-horizon-v1:${pin.trim()}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

interface StaffState {
  hydrated: boolean;
  unlocked: boolean;
  lastActive: number;
  hydrate: () => void;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  touch: () => void;
  checkIdle: () => void;
  changePin: (current: string, next: string) => Promise<"ok" | "bad-current" | "bad-next">;
}

function sessionValid(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < IDLE_MS;
  } catch {
    return false;
  }
}

export const useStaff = create<StaffState>((set, get) => ({
  hydrated: false,
  unlocked: false,
  lastActive: 0,
  hydrate: () => {
    if (get().hydrated) return;
    const ok = sessionValid();
    set({
      hydrated: true,
      unlocked: ok,
      lastActive: ok ? Date.now() : 0,
    });
  },
  unlock: async (pin) => {
    if (!/^\d{4}$/.test(pin.trim())) return false;
    const incoming = await hashPin(pin);
    let expected: string;
    try {
      expected = localStorage.getItem(PIN_KEY) || (await hashPin(DEFAULT_PIN));
    } catch {
      expected = await hashPin(DEFAULT_PIN);
    }
    if (incoming !== expected) return false;
    const now = Date.now();
    try {
      localStorage.setItem(SESSION_KEY, String(now));
    } catch {
      /* ignore */
    }
    set({ unlocked: true, lastActive: now, hydrated: true });
    return true;
  },
  lock: () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    set({ unlocked: false, lastActive: 0 });
  },
  touch: () => {
    if (!get().unlocked) return;
    const now = Date.now();
    try {
      localStorage.setItem(SESSION_KEY, String(now));
    } catch {
      /* ignore */
    }
    set({ lastActive: now });
  },
  checkIdle: () => {
    if (!get().unlocked) return;
    if (Date.now() - get().lastActive > IDLE_MS) get().lock();
  },
  changePin: async (current, next) => {
    const incoming = await hashPin(current);
    let expected: string;
    try {
      expected = localStorage.getItem(PIN_KEY) || (await hashPin(DEFAULT_PIN));
    } catch {
      expected = await hashPin(DEFAULT_PIN);
    }
    if (incoming !== expected) return "bad-current";
    if (!/^\d{4}$/.test(next.trim())) return "bad-next";
    try {
      localStorage.setItem(PIN_KEY, await hashPin(next.trim()));
    } catch {
      return "bad-next";
    }
    return "ok";
  },
}));

export const STAFF_IDLE_MINUTES = 10;
