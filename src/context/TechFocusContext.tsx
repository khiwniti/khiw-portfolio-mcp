/**
 * Cross-section "tech focus" state.
 *
 * Two channels, deliberately separated:
 *   • activeTech  — committed/clicked. Lives in React state, drives the
 *                   persistent highlight ring across projects/career/skills.
 *   • hoverTech   — transient, mouse-driven. Lives in a useState too but is
 *                   wired through a window CustomEvent so a hover on one
 *                   element doesn't trigger React reconciliation for the
 *                   *entire* page on every mousemove.
 *
 * In the spec's terms this maps to:
 *   activeTech  ≈ host bus event `tech:focus` (committed, replayable)
 *   hoverTech   ≈ host bus event `hover:tech` / `hover:tech-end` (transient)
 *
 * When this single-file build later splits into iframes, replace the window
 * CustomEvent with a postMessage bus — the component contracts don't change.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

interface TechFocusValue {
  activeTech: string | null;
  hoverTech: string | null;
  setActiveTech: (tech: string | null) => void;
  clearHover: () => void;
}

const TechFocusContext = createContext<TechFocusValue | null>(null);

export function TechFocusProvider({ children }: { children: ReactNode }) {
  const [activeTech, setActiveTechState] = useState<string | null>(null);
  const [hoverTech, setHoverTech] = useState<string | null>(null);
  const clearTimer = useRef<number | null>(null);

  const setActiveTech = useCallback((tech: string | null) => {
    setActiveTechState(tech);
    // Mirror to a CustomEvent so non-React parts of the page (e.g. a canvas
    // background) can react without consuming the Context.
    window.dispatchEvent(new CustomEvent("khiw:active-tech", { detail: { tech } }));
  }, []);

  const clearHover = useCallback(() => {
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
    // 120ms grace prevents flicker when sliding the pointer between adjacent pills.
    clearTimer.current = window.setTimeout(() => setHoverTech(null), 120);
  }, []);

  useEffect(() => {
    function onHover(e: Event) {
      const detail = (e as CustomEvent<{ tech: string }>).detail;
      if (clearTimer.current) window.clearTimeout(clearTimer.current);
      setHoverTech(detail.tech);
    }
    window.addEventListener("khiw:hover-tech", onHover);
    return () => window.removeEventListener("khiw:hover-tech", onHover);
  }, []);

  // Esc clears the committed focus — matches the spec's keyboard-parity
  // requirement and gives users an obvious way to "reset" the highlight.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && activeTech) setActiveTech(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTech, setActiveTech]);

  const value = useMemo<TechFocusValue>(
    () => ({ activeTech, hoverTech, setActiveTech, clearHover }),
    [activeTech, hoverTech, setActiveTech, clearHover],
  );

  return <TechFocusContext.Provider value={value}>{children}</TechFocusContext.Provider>;
}

export function useTechFocus(): TechFocusValue {
  const ctx = useContext(TechFocusContext);
  if (!ctx) throw new Error("useTechFocus must be used inside <TechFocusProvider>");
  return ctx;
}

/**
 * Tiny helper for non-pill components (project card, career row) to decide
 * whether they should visually emphasize themselves. Returns true if ANY of
 * the supplied tech names matches the currently focused/hovered tech.
 */
export function useTechMatch(techs?: string[] | null): boolean {
  const { activeTech, hoverTech } = useTechFocus();
  if (!techs || techs.length === 0) return false;
  const target = activeTech ?? hoverTech;
  if (!target) return false;
  return techs.includes(target);
}
