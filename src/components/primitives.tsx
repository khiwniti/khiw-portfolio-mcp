/**
 * Atomic visual primitives: Reveal, Label, Pill, SectionShell.
 * Ported from ecpectation_web.jsx (lines 58-71) with TS types and a few
 * additions to support the cross-section tech:focus highlighting.
 */
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { C, F, EASE } from "../tokens";
import { useTechFocus } from "../context/TechFocusContext";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  /**
   * If set, render children immediately on the very first paint instead of
   * waiting for the IntersectionObserver. The MCP host iframe sometimes
   * starts hidden; setting this on the first viewport-visible section
   * avoids a confusing "everything is blank" handshake state.
   */
  eager?: boolean;
}

export function Reveal({ children, delay = 0, eager = false }: RevealProps) {
  const [visible, setVisible] = useState(eager);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) { setVisible(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(18px)",
        transition: `opacity 0.7s ${EASE.reveal} ${delay}s, transform 0.7s ${EASE.reveal} ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: C.accent,
          boxShadow: `0 0 10px ${C.accentDim}`,
        }}
      />
      <span
        style={{
          fontFamily: F.mono,
          fontSize: 10,
          color: C.accentDim,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
    </div>
  );
}

interface PillProps {
  children: string;
  /** Always-on accent style (legacy behavior from the original component). */
  on?: boolean;
  /**
   * If set, the pill participates in tech:focus highlighting. When the user
   * hovers/focuses another pill with the same tech, every matching pill across
   * the page lights up. Click toggles a persistent focus.
   */
  asTech?: boolean;
  /** Extra style overrides for context-specific tweaks. */
  style?: CSSProperties;
}

export function Pill({ children, on, asTech, style }: PillProps) {
  const { activeTech, setActiveTech, hoverTech, clearHover } = useTechFocus();
  const isActive = asTech && (activeTech === children || hoverTech === children);
  const baseOn = on || isActive;

  const interactiveProps = asTech
    ? {
        onMouseEnter: () => hoverTechSet(children, setActiveTech, hoverTech),
        onMouseLeave: () => clearHover(),
        onFocus: () => hoverTechSet(children, setActiveTech, hoverTech),
        onBlur: () => clearHover(),
        onClick: () => setActiveTech(activeTech === children ? null : children),
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setActiveTech(activeTech === children ? null : children);
          }
        },
        tabIndex: 0,
        role: "button" as const,
        "aria-pressed": activeTech === children,
        title: `Highlight ${children} across the page`,
      }
    : {};

  return (
    <span
      {...interactiveProps}
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 9,
        fontFamily: F.mono,
        background: baseOn ? C.accentBg : C.surface,
        border: `1px solid ${baseOn ? "rgba(52,211,153,0.35)" : C.border}`,
        color: baseOn ? C.accent : C.ghost,
        cursor: asTech ? "pointer" : "default",
        transition: `all 200ms ${EASE.outExpo}`,
        transform: isActive ? "scale(1.06)" : "none",
        boxShadow: isActive ? `0 0 12px ${C.accentDim}` : "none",
        outline: "none",
        userSelect: "none",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// Helper so the click handler reads cleanly above. We pass setActiveTech only
// for the keyboard-toggle path; hover should be transient.
function hoverTechSet(
  tech: string,
  _set: (t: string | null) => void,
  _current: string | null,
) {
  // The hover side of the context updates via clearHover/hoverTech in the provider.
  // We forward straight through to that channel here.
  const evt = new CustomEvent("khiw:hover-tech", { detail: { tech } });
  window.dispatchEvent(evt);
}

/**
 * Section landmark wrapper — adds an <section id> for skip-links + scroll-to,
 * applies the consistent max-width/padding that every section uses.
 */
export function SectionShell({
  id,
  children,
  width = 700,
}: {
  id?: string;
  children: ReactNode;
  width?: number;
}) {
  return (
    <section
      id={id}
      style={{
        maxWidth: width,
        margin: "0 auto",
        padding: "40px 24px 80px",
        // Smooth scroll target offset for sticky headers (if added later).
        scrollMarginTop: 80,
      }}
    >
      {children}
    </section>
  );
}
