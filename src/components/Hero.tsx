/**
 * Hero section — the first-fold conversion surface. Carries through the
 * original "Hey 👋 I'm Ikkyu / AI-Augmented Full-Stack Developer" composition
 * with one addition: a subtle CursorOrb behind the content (see CursorOrb.tsx).
 *
 * The CTA buttons use `document.getElementById('section-id').scrollIntoView()`
 * which works in both standalone and the MCP iframe (no postMessage detour).
 */
import { C, F, EASE } from "../tokens";
import { STATS, SOCIALS } from "../data";
import { Pill, Reveal } from "./primitives";
import { CursorOrb } from "./CursorOrb";

export function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "0 24px",
      }}
    >
      <CursorOrb />

      {/* All hero children share a stacking context above the orb. */}
      <div style={{ position: "relative", zIndex: 1, display: "contents" }}>
        <Reveal eager>
          <div
            style={{
              fontSize: "clamp(32px,6vw,56px)",
              fontWeight: 700,
              color: C.textBright,
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Hey <span style={{ display: "inline-flex", cursor: "default" }}>👋</span> I&apos;m Ikkyu
          </div>
        </Reveal>

        <Reveal delay={0.1} eager>
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <span
              style={{
                background: C.accent,
                color: C.primary,
                padding: "4px 8px",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              AI-Augmented
            </span>
            <span style={{ color: C.text, fontSize: 17, marginLeft: 8, fontWeight: 500 }}>
              Full-Stack Developer
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.15} eager>
          <p style={{ marginTop: 12, fontSize: 14, color: C.muted }}>
            AI Agent Architect
            <span style={{ color: C.accentDim, marginLeft: 2, animation: "pulse 2s infinite" }}>|</span>
          </p>
        </Reveal>

        <Reveal delay={0.2} eager>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24, fontSize: 12, color: C.muted }}>
            <span>📍 Bangkok, Thailand 🇹🇭</span>
            <span style={{ color: C.border }}>·</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 20,
                background: C.surface,
                border: `1px solid ${C.border}`,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#34d399",
                  animation: "pulse 2s infinite",
                }}
              />
              Available
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div style={{ display: "flex", gap: 24, marginTop: 28 }}>
            {STATS.map((s) => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: C.accentDim,
                    fontFamily: F.mono,
                  }}
                >
                  {s.n}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    marginTop: 2,
                    color: C.muted,
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 6,
              marginTop: 24,
              maxWidth: 420,
            }}
          >
            {["LangGraph", "Claude Sonnet", "Qwen3", "MCP", "FastAPI", "Next.js", "TypeScript", "Cloudflare"].map((t) => (
              <Pill key={t} asTech>{t}</Pill>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.35}>
          <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
            {[
              { l: "About", id: "about" },
              { l: "Projects", id: "projects" },
              { l: "Skills", id: "skills" },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => document.getElementById(b.id)?.scrollIntoView({ behavior: "smooth" })}
                style={{
                  padding: "8px 20px",
                  borderRadius: 6,
                  border: `2px solid ${C.border}`,
                  background: "transparent",
                  color: C.text,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: F.sans,
                  cursor: "pointer",
                  transition: `all 200ms ${EASE.outExpo}`,
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
                {b.l}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
            {SOCIALS.map((s) => (
              <a
                key={s.t}
                href={s.u}
                target="_blank"
                rel="noopener noreferrer"
                title={s.t}
                aria-label={s.t}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${C.border}`,
                  color: C.ghost,
                  fontSize: 11,
                  fontFamily: F.mono,
                  transition: `all 200ms ${EASE.outExpo}`,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.accent;
                  e.currentTarget.style.color = C.accent;
                  e.currentTarget.style.background = C.accentBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.color = C.ghost;
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {s.l}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
