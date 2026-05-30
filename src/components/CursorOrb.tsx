/**
 * Hero background orb that follows the pointer with a lerp delay.
 *
 * Sat behind the hero content, low-opacity, low-saturation. The lerp gives it
 * a "soft trailing" feel — direct pointer-tracking would feel jittery.
 *
 * Reduced motion: orb stays centered, no tracking.
 *
 * MCP iframe note: `pointerEvents: "none"` so it never blocks form fields
 * or buttons in the hero.
 */
import { useEffect, useRef } from "react";
import { C } from "../tokens";

export function CursorOrb() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let current = { ...target };
    let rafId = 0;

    function onMove(e: PointerEvent) {
      target = { x: e.clientX, y: e.clientY };
    }

    function tick() {
      // Simple lerp — pulls 8% of the way toward the target each frame.
      // Higher values = snappier, lower = more lag.
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      if (el) {
        el.style.transform = `translate3d(${current.x.toFixed(1)}px, ${current.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onMove);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 600,
        height: 300,
        background: `radial-gradient(closest-side, rgba(52,211,153,0.08), rgba(52,211,153,0.02) 60%, transparent 80%)`,
        borderRadius: "50%",
        filter: "blur(80px)",
        pointerEvents: "none",
        willChange: "transform",
        zIndex: 0,
        // Initial centered position so SSR / first-paint matches what the JS lerp expects.
        transform: "translate3d(50vw, 50vh, 0) translate(-50%, -50%)",
      }}
    />
  );
}
