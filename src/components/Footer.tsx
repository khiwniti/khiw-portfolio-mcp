import { C } from "../tokens";
import { SOCIALS } from "../data";
import { SignaturePad } from "./SignaturePad";

export function Footer() {
  return (
    <footer style={{ padding: "20px 24px 32px", textAlign: "center", borderTop: `1px solid ${C.border}` }}>
      <SignaturePad />
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 6, marginTop: 16 }}>
        {SOCIALS.map((s) => (
          <a
            key={s.t}
            href={s.u}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: C.muted, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; }}
          >
            {s.t}
          </a>
        ))}
      </div>
      <p style={{ fontSize: 11, color: C.faint }}>
        © 2026 · 50 Vercel Projects · 47 Cloudflare Workers · 9 Industries
      </p>
    </footer>
  );
}
