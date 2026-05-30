import { C, F, EASE } from "../tokens";
import { DOMAINS } from "../data";
import { Reveal, Label, SectionShell } from "./primitives";

/**
 * Industry domains — six tiles, two columns. Light hover-lift only; no
 * drill-down here because the actual depth lives in the projects modal.
 */
export function Domains() {
  return (
    <SectionShell>
      <Reveal><Label>Expertise</Label></Reveal>
      <Reveal delay={0.05}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: C.textBright, marginBottom: 24 }}>
          Industry Domains
        </h2>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {DOMAINS.map((d, i) => (
          <Reveal key={d.l} delay={Math.min(0.05 * i, 0.3)}>
            <div
              style={{
                padding: 14,
                borderRadius: 10,
                background: C.surface,
                border: `1px solid ${C.border}`,
                transition: `all 250ms ${EASE.outExpo}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.accent;
                e.currentTarget.style.background = C.surfaceHover;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = C.surface;
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: C.accent }}>{d.i}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.textBright }}>{d.l}</span>
              </div>
              <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, fontFamily: F.mono }}>{d.d}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
