import { useEffect, useRef } from "react";

export function GlitterField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let n = 0;
    let x = new Float32Array(0);
    let y = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let hx = new Float32Array(0);
    let hy = new Float32Array(0);
    let r = new Float32Array(0);
    let a = new Float32Array(0);
    let tw = new Float32Array(0);
    let kind = new Uint8Array(0);
    let mx = -4000;
    let my = -4000;
    let px = -4000;
    let py = -4000;
    let raf = 0;
    let running = true;

    const seed = () => {
      const area = w * h;
      n = reduce ? 280 : Math.max(1800, Math.min(4800, Math.floor(area / 220)));
      x = new Float32Array(n);
      y = new Float32Array(n);
      vx = new Float32Array(n);
      vy = new Float32Array(n);
      hx = new Float32Array(n);
      hy = new Float32Array(n);
      r = new Float32Array(n);
      a = new Float32Array(n);
      tw = new Float32Array(n);
      kind = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        const px0 = Math.random() * w;
        const py0 = Math.random() * h;
        x[i] = px0;
        y[i] = py0;
        hx[i] = px0;
        hy[i] = py0;
        vx[i] = 0;
        vy[i] = 0;
        const spark = i % 37 === 0;
        kind[i] = spark ? 1 : 0;
        r[i] = spark ? 1.6 + Math.random() * 1.4 : 0.45 + Math.random() * 0.85;
        a[i] = spark ? 0.55 + Math.random() * 0.4 : 0.18 + Math.random() * 0.45;
        tw[i] = Math.random() * Math.PI * 2;
      }
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const RADIUS = 168;
    const RADIUS2 = RADIUS * RADIUS;

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      const dxm = mx - px;
      const dym = my - py;
      px = mx;
      py = my;
      const wake = Math.min(18, Math.hypot(dxm, dym));

      for (let i = 0; i < n; i++) {
        const dx = x[i] - mx;
        const dy = y[i] - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < RADIUS2) {
          const d = Math.sqrt(d2) || 0.25;
          const fall = 1 - d / RADIUS;
          const f = fall * fall;
          const nx = dx / d;
          const ny = dy / d;
          const push = f * (1.85 + wake * 0.08);
          vx[i] += nx * push + -ny * f * 0.95 + dxm * f * 0.11;
          vy[i] += ny * push + nx * f * 0.95 + dym * f * 0.11;
        }

        vx[i] += (hx[i] - x[i]) * 0.018;
        vy[i] += (hy[i] - y[i]) * 0.018;
        vx[i] *= 0.9;
        vy[i] *= 0.9;
        x[i] += vx[i];
        y[i] += vy[i];
        tw[i] += 0.045 + r[i] * 0.02;

        const sparkle = 0.55 + Math.sin(tw[i]) * 0.45;
        const alpha = a[i] * sparkle;
        const size = r[i] * (kind[i] ? 1 + sparkle * 0.35 : 1);
        ctx.globalAlpha = alpha;
        if (kind[i]) {
          ctx.fillStyle = "rgb(255,255,255)";
          ctx.fillRect(x[i] - size * 0.5, y[i] - size * 0.5, size, size);
          ctx.globalAlpha = alpha * 0.35;
          ctx.fillStyle = "rgb(186,230,253)";
          ctx.fillRect(x[i] - size, y[i] - 0.4, size * 2, 0.8);
          ctx.fillRect(x[i] - 0.4, y[i] - size, 0.8, size * 2);
        } else {
          ctx.fillStyle = i % 5 === 0 ? "rgb(224,242,254)" : "rgb(125,211,252)";
          ctx.fillRect(x[i], y[i], size, size);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    if (reduce) {
      tick();
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}
