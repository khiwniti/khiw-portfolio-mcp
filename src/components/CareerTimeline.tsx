/**
 * Career timeline with click-to-expand rows.
 *
 * Each row is a <button> that toggles an expanded panel below. The panel
 * smoothly grows from height: 0 → measured content height using a CSS
 * transition driven by a <details>-free pattern (we measure with
 * ResizeObserver so nested content reflows still animate cleanly).
 *
 * Keyboard:
 *   • Enter / Space toggles the row under focus
 *   • ArrowDown / ArrowUp move focus to neighboring rows
 *
 * Tech badges inside the expanded panel use `<Pill asTech>` so clicking
 * `Moldex3D` from a 2021 Hitachi row highlights the same chip on every
 * project card that lists it.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { C, F, EASE } from "../tokens";
import { CAREER, PROJECTS, type CareerEntry } from "../data";
import { Pill, Reveal, Label, SectionShell } from "./primitives";
import { useTechMatch } from "../context/TechFocusContext";

export function CareerTimeline() {
  const [openId, setOpenId] = useState<string | null>(null);
  const rowsRef = useRef<HTMLButtonElement[]>([]);

  function focusRow(i: number) {
    const target = rowsRef.current[Math.max(0, Math.min(i, CAREER.length - 1))];
    target?.focus();
  }

  return (
    <SectionShell>
      <Reveal><Label>Career</Label></Reveal>
      <Reveal delay={0.05}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: C.textBright, marginBottom: 8 }}>
          Timeline
        </h2>
      </Reveal>
      <Reveal delay={0.08}>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 24 }}>
          Click any role to expand · arrow keys to navigate
        </p>
      </Reveal>

      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {CAREER.map((c, i) => (
          <Reveal key={c.id} delay={Math.min(0.025 * i, 0.25)}>
            <CareerRow
              entry={c}
              isOpen={openId === c.id}
              onToggle={() => setOpenId(openId === c.id ? null : c.id)}
              registerRef={(el) => {
                if (el) rowsRef.current[i] = el;
              }}
              onArrow={(dir) => focusRow(i + dir)}
              isLast={i === CAREER.length - 1}
            />
          </Reveal>
        ))}
      </ol>

      <Reveal delay={0.3}>
        <div
          style={{
            marginTop: 24,
            padding: "16px 20px",
            borderRadius: 10,
            background: C.accentBg,
            border: "1px solid rgba(52,211,153,0.1)",
          }}
        >
          <div style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>Education</div>
          <div style={{ fontSize: 13, color: C.text, marginTop: 4 }}>
            B.Eng Mechanical Engineering — Naresuan University (2015–2019)
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            GPA 3.50, First Class Honors · EF SET C2 (72/100) · Thai (Native)
          </div>
        </div>
      </Reveal>
    </SectionShell>
  );
}

function CareerRow({
  entry,
  isOpen,
  onToggle,
  registerRef,
  onArrow,
  isLast,
}: {
  entry: CareerEntry;
  isOpen: boolean;
  onToggle: () => void;
  registerRef: (el: HTMLButtonElement | null) => void;
  onArrow: (direction: -1 | 1) => void;
  isLast: boolean;
}) {
  const panelId = useId();
  const matched = useTechMatch(entry.tech);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const reduceMotion = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Measure expanded content so the transition has a concrete target height.
  // ResizeObserver covers font-load shifts and asynchronous content updates.
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const el = panelRef.current;
    setPanelHeight(el.scrollHeight);
    const ro = new ResizeObserver(() => setPanelHeight(el.scrollHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown") { e.preventDefault(); onArrow(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); onArrow(-1); }
  }

  function scrollToProject(projectId: string) {
    // Find the section, then dispatch a focused-card flash via custom event.
    const grid = document.getElementById("projects");
    grid?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.dispatchEvent(new CustomEvent("khiw:flash-project", { detail: { projectId } }));
  }

  return (
    <li style={{ borderBottom: isLast ? "none" : `1px solid ${C.border}` }}>
      <button
        ref={registerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        onKeyDown={onKey}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "grid",
          gridTemplateColumns: "80px 1fr 16px",
          gap: 16,
          padding: "16px 0",
          width: "100%",
          boxSizing: "border-box",
          transition: `background 200ms ${EASE.outExpo}`,
          background: matched ? C.accentBg : "transparent",
          borderRadius: 4,
        }}
        onMouseEnter={(e) => { if (!matched) e.currentTarget.style.background = C.surface; }}
        onMouseLeave={(e) => { if (!matched) e.currentTarget.style.background = "transparent"; }}
        onFocus={(e) => { e.currentTarget.style.outline = `2px solid ${C.accent}`; e.currentTarget.style.outlineOffset = "-2px"; }}
        onBlur={(e) => { e.currentTarget.style.outline = "none"; }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 11,
            color: entry.hi ? C.accent : C.muted,
            fontWeight: 500,
            paddingTop: 3,
          }}
        >
          {entry.y}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textBright }}>{entry.t}</div>
          <div style={{ fontSize: 12, color: entry.hi ? C.accent : C.muted, fontWeight: 500, marginTop: 2 }}>
            {entry.c}
          </div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginTop: 6 }}>{entry.d}</div>
        </div>
        <div
          aria-hidden="true"
          style={{
            color: C.muted,
            fontSize: 12,
            paddingTop: 6,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: `transform 240ms ${EASE.outExpo}`,
          }}
        >
          ▾
        </div>
      </button>

      <div
        id={panelId}
        role="region"
        style={{
          overflow: "hidden",
          height: isOpen ? panelHeight : 0,
          transition: `height ${reduceMotion ? 0 : 320}ms ${EASE.outExpo}`,
        }}
      >
        <div
          ref={panelRef}
          style={{
            padding: "0 0 18px 96px",
            display: "grid",
            gap: 12,
          }}
        >
          {entry.tech && entry.tech.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: F.mono,
                  color: C.accentDim,
                  letterSpacing: 2,
                  marginBottom: 6,
                }}
              >
                STACK
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {entry.tech.map((t) => <Pill key={t} asTech>{t}</Pill>)}
              </div>
            </div>
          )}

          {entry.related && entry.related.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: F.mono,
                  color: C.accentDim,
                  letterSpacing: 2,
                  marginBottom: 6,
                }}
              >
                RELATED PROJECTS
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {entry.related.map((pid) => {
                  const proj = PROJECTS.find((p) => p.id === pid);
                  if (!proj) return null;
                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => scrollToProject(pid)}
                      style={{
                        background: "transparent",
                        border: `1px solid ${C.border}`,
                        color: C.text,
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: F.sans,
                        transition: `all 180ms ${EASE.outExpo}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = C.accent;
                        e.currentTarget.style.color = C.accent;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = C.border;
                        e.currentTarget.style.color = C.text;
                      }}
                    >
                      → {proj.n}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
