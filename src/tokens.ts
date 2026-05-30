/**
 * Design tokens lifted verbatim from the existing khiw.dev source
 * (ecpectation_web.jsx). Kept as a typed module so components import the
 * names — no magic strings sprinkled around the tree.
 *
 * When running inside an MCP host, src/main.tsx maps the host's CSS variable
 * palette onto these via document-level overrides. Standalone mode uses the
 * literals below.
 */
export const C = {
  primary: "#0a0e17",
  surface: "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  borderHover: "rgba(52,211,153,0.2)",
  accent: "#34D399",
  accentDim: "rgba(52,211,153,0.5)",
  accentBg: "rgba(52,211,153,0.05)",
  textBright: "#e2e8f0",
  text: "#94a3b8",
  muted: "#64748b",
  faint: "#475569",
  ghost: "rgba(255,255,255,0.15)",
  // Added for drill-down UI
  modalBackdrop: "rgba(0,0,0,0.72)",
  modalSurface: "#0f1521",
} as const;

export const F = {
  sans: "'Quicksand',system-ui,sans-serif",
  mono: "'JetBrains Mono','Geist Mono',monospace",
  thai: "'Sarabun','Noto Sans Thai',sans-serif",
} as const;

/** Standard easing curves we re-use for the explode/expand transitions. */
export const EASE = {
  outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  // The original khiw.dev uses this everywhere — keep it for visual continuity.
  reveal: "cubic-bezier(0.22, 1, 0.36, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;
