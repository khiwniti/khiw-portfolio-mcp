/**
 * Project grid with drill-down modal.
 *
 * Card click   → opens animated detail modal (scale + fade).
 * Card cmd/ctrl-click → opens the live URL in a new tab (preserves the original
 *                       behavior so users who just want the live site aren't
 *                       trapped in the modal).
 * Modal Esc / backdrop click → closes, restores focus to the originating card.
 *
 * Cards visually emphasize themselves when their tech matches the active
 * `tech:focus` selection from any other section.
 *
 * Accessibility:
 *   • Card is <button> with aria-haspopup="dialog"
 *   • Modal uses role="dialog" + aria-modal + aria-labelledby
 *   • Focus is trapped to the modal while open
 *   • prefers-reduced-motion disables the scale animation
 */
import { useCallback, useEffect, useRef, useState, type MouseEvent, type KeyboardEvent } from "react";
import { C, F, EASE } from "../tokens";
import { PROJECTS, type Project } from "../data";
import { Pill, Reveal, Label, SectionShell } from "./primitives";
import { useTechMatch } from "../context/TechFocusContext";

export function ProjectGrid({ openProjectId }: { openProjectId?: string | null }) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  // Honour the deep-link from the MCP tool argument `{ project: "carbonbim" }`.
  useEffect(() => {
    if (!openProjectId) return;
    const found = PROJECTS.find((p) => p.id === openProjectId);
    if (found) setActiveProject(found);
  }, [openProjectId]);

  const open = useCallback((p: Project, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setActiveProject(p);
  }, []);

  const close = useCallback(() => {
    setActiveProject(null);
    // Restore focus to the card that opened the modal — basic dialog hygiene.
    queueMicrotask(() => lastTriggerRef.current?.focus());
  }, []);

  return (
    <SectionShell id="projects">
      <Reveal><Label>Projects</Label></Reveal>
      <Reveal delay={0.05}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: C.textBright, marginBottom: 8 }}>
          Selected Work
        </h2>
      </Reveal>
      <Reveal delay={0.08}>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 24 }}>
          From 50+ Vercel deployments and 47 Cloudflare Workers · click any card to drill in
        </p>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
        {PROJECTS.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(0.03 * i, 0.3)}>
            <ProjectCard project={p} onOpen={open} />
          </Reveal>
        ))}
      </div>

      {activeProject && <ProjectModal project={activeProject} onClose={close} />}
    </SectionShell>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (p: Project, trigger: HTMLButtonElement) => void;
}) {
  const matched = useTechMatch(project.tech);
  const ref = useRef<HTMLButtonElement | null>(null);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    // Cmd/Ctrl-click jumps straight to the live URL, bypassing the modal.
    if (e.metaKey || e.ctrlKey) {
      window.open(project.u, "_blank", "noopener,noreferrer");
      return;
    }
    if (ref.current) onOpen(project, ref.current);
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      aria-haspopup="dialog"
      aria-label={`${project.n} — open details`}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "block",
        padding: 14,
        borderRadius: 10,
        background: matched ? C.surfaceHover : C.surface,
        border: `1px solid ${matched ? C.accent : C.border}`,
        boxShadow: matched ? `0 0 0 3px ${C.accentBg}` : "none",
        transition: `all 250ms ${EASE.outExpo}`,
        textAlign: "left",
        width: "100%",
        boxSizing: "border-box",
      }}
      onMouseEnter={(e) => {
        if (matched) return;
        e.currentTarget.style.borderColor = C.accent;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.background = C.surfaceHover;
      }}
      onMouseLeave={(e) => {
        if (matched) return;
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.background = C.surface;
      }}
      onFocus={(e) => { e.currentTarget.style.outline = `2px solid ${C.accent}`; e.currentTarget.style.outlineOffset = "2px"; }}
      onBlur={(e) => { e.currentTarget.style.outline = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.textBright }}>{project.n}</div>
        <Pill on>{project.tag}</Pill>
      </div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 6 }}>{project.d}</div>
      <div
        style={{
          fontSize: 9,
          fontFamily: F.mono,
          color: C.faint,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {project.u.replace("https://", "")}
      </div>
    </button>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const headingId = `proj-${project.id}-title`;
  const reduceMotion = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Animation runs once on mount via the `open` class flip below.
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // Defer one frame so the browser registers the "from" state before the
    // class flips to "to" — otherwise the transition skips entirely.
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Focus trap + Esc-to-close.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab" || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first?.focus();
      }
    }
    window.addEventListener("keydown", onKey);

    // Lock body scroll while the modal is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  function onBackdrop(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const detailPanes = [
    project.problem ? { k: "Problem", v: project.problem } : null,
    project.approach ? { k: "Approach", v: project.approach } : null,
    project.result ? { k: "Result", v: project.result } : null,
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <div
      onClick={onBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        background: C.modalBackdrop,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 100,
        opacity: open ? 1 : 0,
        transition: `opacity ${reduceMotion ? 0 : 220}ms ${EASE.outExpo}`,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onKeyDown={(e: KeyboardEvent) => e.stopPropagation()}
        style={{
          position: "relative",
          background: C.modalSurface,
          color: C.text,
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          maxWidth: 640,
          width: "100%",
          maxHeight: "85vh",
          overflow: "auto",
          padding: 28,
          boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${C.accentBg}`,
          transform: open ? "scale(1)" : "scale(0.94)",
          transition: `transform ${reduceMotion ? 0 : 280}ms ${EASE.spring}`,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "transparent",
            border: `1px solid ${C.border}`,
            color: C.muted,
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >×</button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Pill on>{project.tag}</Pill>
          <span style={{ fontSize: 10, fontFamily: F.mono, color: C.accentDim, letterSpacing: 2 }}>
            CASE STUDY
          </span>
        </div>

        <h3 id={headingId} style={{ fontSize: 24, fontWeight: 700, color: C.textBright, marginBottom: 4 }}>
          {project.n}
        </h3>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>{project.d}</p>

        {detailPanes.length > 0 ? (
          <div style={{ display: "grid", gap: 14, marginBottom: 18 }}>
            {detailPanes.map((p) => (
              <div
                key={p.k}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: C.surface,
                  borderLeft: `3px solid ${C.accent}`,
                }}
              >
                <div style={{ fontSize: 10, fontFamily: F.mono, color: C.accent, letterSpacing: 2, marginBottom: 6 }}>
                  {p.k.toUpperCase()}
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{p.v}</div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: 14,
              borderRadius: 10,
              background: C.surface,
              color: C.muted,
              fontSize: 12,
              marginBottom: 18,
              fontStyle: "italic",
            }}
          >
            Detailed case study not published yet — visit the live site to explore.
          </div>
        )}

        {project.tech && project.tech.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontFamily: F.mono, color: C.accentDim, letterSpacing: 2, marginBottom: 8 }}>
              TECH STACK
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {project.tech.map((t) => <Pill key={t} asTech>{t}</Pill>)}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <a
            href={project.u}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: C.accent,
              color: C.primary,
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Visit Live ↗
          </a>
          {project.source && (
            <a href={project.source} target="_blank" rel="noopener noreferrer" style={secondaryButtonStyle}>
              Source
            </a>
          )}
          {project.docs && (
            <a href={project.docs} target="_blank" rel="noopener noreferrer" style={secondaryButtonStyle}>
              Architecture
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const secondaryButtonStyle = {
  padding: "8px 16px",
  borderRadius: 8,
  background: "transparent",
  color: C.text,
  fontSize: 12,
  fontWeight: 700,
  textDecoration: "none",
  border: `1px solid ${C.border}`,
  display: "inline-flex" as const,
  alignItems: "center" as const,
};
