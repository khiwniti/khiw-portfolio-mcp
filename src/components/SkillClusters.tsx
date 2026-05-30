/**
 * Skill clusters with explode-on-click.
 *
 * Each category renders compactly by default — name + count. Click the header
 * and the chips "explode" outward in a radial-ish stagger animation:
 *
 *   • Chips share a common origin (the centre of the category card).
 *   • On open, each chip transitions from translate(0,0) scale(0) opacity:0
 *     to its final grid position, with a stagger delay based on index.
 *   • Reduced-motion: skip the radial origin, just fade-in.
 *   • Each chip is `<Pill asTech>` so clicking it triggers cross-section
 *     tech:focus highlighting on every matching project card / career row.
 */
import { useState } from "react";
import { C, F, EASE } from "../tokens";
import { SKILLS } from "../data";
import { Pill, Reveal, Label, SectionShell } from "./primitives";

export function SkillClusters() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const reduceMotion = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <SectionShell id="skills">
      <Reveal><Label>Skills</Label></Reveal>
      <Reveal delay={0.05}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: C.textBright, marginBottom: 8 }}>
          Tech Stack
        </h2>
      </Reveal>
      <Reveal delay={0.08}>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 24 }}>
          Click a cluster to explode it · click any chip to highlight it across the page
        </p>
      </Reveal>

      <div style={{ display: "grid", gap: 10 }}>
        {SKILLS.map((cat, i) => (
          <Reveal key={cat.c} delay={Math.min(0.05 * i, 0.3)}>
            <SkillCluster
              category={cat}
              isOpen={openCategory === cat.c}
              onToggle={() => setOpenCategory(openCategory === cat.c ? null : cat.c)}
              reduceMotion={reduceMotion}
            />
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}

function SkillCluster({
  category,
  isOpen,
  onToggle,
  reduceMotion,
}: {
  category: { c: string; s: string[] };
  isOpen: boolean;
  onToggle: () => void;
  reduceMotion: boolean;
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: C.surface,
        border: `1px solid ${isOpen ? C.accent : C.border}`,
        transition: `all 300ms ${EASE.outExpo}`,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
        onFocus={(e) => { e.currentTarget.style.outline = `2px solid ${C.accent}`; e.currentTarget.style.outlineOffset = "4px"; }}
        onBlur={(e) => { e.currentTarget.style.outline = "none"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 10,
              fontFamily: F.mono,
              color: C.accentDim,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {category.c}
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: F.mono,
              color: C.muted,
              padding: "2px 8px",
              borderRadius: 10,
              background: C.surface,
              border: `1px solid ${C.border}`,
            }}
          >
            {category.s.length}
          </span>
        </div>
        <span
          aria-hidden="true"
          style={{
            color: isOpen ? C.accent : C.muted,
            fontSize: 14,
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
            transition: `transform 300ms ${EASE.spring}`,
            display: "inline-block",
            lineHeight: 1,
          }}
        >
          +
        </span>
      </button>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginTop: isOpen ? 14 : 0,
          maxHeight: isOpen ? 400 : 0,
          overflow: "hidden",
          transition: `max-height 360ms ${EASE.outExpo}, margin-top 360ms ${EASE.outExpo}`,
        }}
      >
        {category.s.map((tech, i) => (
          <span
            key={tech}
            style={{
              display: "inline-block",
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? "scale(1) translate(0,0)" : reduceMotion ? "scale(0.95)" : explodeOrigin(i),
              transition: `opacity 320ms ${EASE.outExpo} ${stagger(i)}ms, transform 420ms ${EASE.spring} ${stagger(i)}ms`,
            }}
          >
            <Pill asTech>{tech}</Pill>
          </span>
        ))}
      </div>
    </div>
  );
}

// Each chip flies out from a small radial offset, scaled down and rotated
// slightly. The offsets are deterministic per index so the layout is stable.
function explodeOrigin(i: number): string {
  // Hash the index into a stable but varied angle/distance.
  const angle = ((i * 137.5) % 360) * (Math.PI / 180); // golden-angle spread
  const dist = 18; // px
  const dx = Math.cos(angle) * dist;
  const dy = Math.sin(angle) * dist;
  return `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(0)`;
}

function stagger(i: number): number {
  return Math.min(i * 28, 200); // cap the cumulative delay so big clusters don't drag
}
