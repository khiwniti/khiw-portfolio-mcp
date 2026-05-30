import { C, F } from "../tokens";
import { SIDE_PROJECTS } from "../data";
import { Reveal, Label, SectionShell } from "./primitives";

/**
 * Open-source / passion projects — kidpen, CarbonScope, FloodSight.
 * Same card pattern as the original; not part of the drill-down modal flow
 * because each links to its own canonical site / hackathon page.
 */
export function SideProjects() {
  return (
    <SectionShell>
      <Reveal><Label>Open Source</Label></Reveal>
      <Reveal delay={0.05}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: C.textBright, marginBottom: 24 }}>
          Passion Projects
        </h2>
      </Reveal>
      {SIDE_PROJECTS.map((p, i) => (
        <Reveal key={p.n} delay={Math.min(0.08 * i, 0.3)}>
          <div
            style={{
              padding: 18,
              borderRadius: 12,
              background: C.surface,
              border: `1px solid ${C.border}`,
              marginBottom: 10,
              borderLeft: `3px solid ${C.accent}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>{p.n}</span>
              <span style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>{p.s}</span>
            </div>
            <p style={{ fontSize: 12, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>{p.d}</p>
            {p.u && (
              <a
                href={p.u}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 10,
                  fontFamily: F.mono,
                  color: C.faint,
                  textDecoration: "none",
                }}
              >
                {p.u.replace("https://", "")} ↗
              </a>
            )}
          </div>
        </Reveal>
      ))}
    </SectionShell>
  );
}
