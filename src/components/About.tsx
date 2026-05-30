import { C } from "../tokens";
import { Reveal, Label, SectionShell } from "./primitives";

/**
 * About section — narrative ported verbatim from the original source.
 * Kept structurally simple; the interactive richness lives in Projects /
 * Career / Skills.
 */
export function About() {
  return (
    <SectionShell id="about">
      <Reveal><Label>About</Label></Reveal>
      <Reveal delay={0.05}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: C.textBright, marginBottom: 24, lineHeight: 1.2 }}>
          From Mechanical Engineer<br />to AI Architect
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <div style={{ fontSize: 14, lineHeight: 1.9, display: "flex", flexDirection: "column", gap: 16 }}>
          <p>
            I graduated with First Class Honors in Mechanical Engineering from Naresuan University in 2019 —
            not knowing my career would take me from welding inspections at oil refineries to building AI
            disaster warning systems for the Thai government.
          </p>
          <p>
            My path wound through <span style={{ color: C.textBright }}>Bangchack Refinery</span> (ASME welding),{" "}
            <span style={{ color: C.textBright }}>Hitachi refrigerator design</span> (ANSYS &amp; Moldex3D),{" "}
            <span style={{ color: C.textBright }}>nuclear radiopharmaceuticals</span> (I-131 at TINT),
            and <span style={{ color: C.textBright }}>CP Group&apos;s injection molding</span> (300K pieces/day).
            Each role added real-world systems thinking that no bootcamp can teach.
          </p>
          <p>
            Today I work at the intersection of <span style={{ color: C.accent }}>AI agent architecture</span>,{" "}
            <span style={{ color: C.accent }}>engineering simulation</span>, and{" "}
            <span style={{ color: C.accent }}>Thai government digital transformation</span>.
            I&apos;ve shipped 50+ projects on Vercel and 47 Cloudflare Workers across 9 industries — from
            weather forecasting with NVIDIA FourCastNet to BIM carbon calculators and restaurant BI.
          </p>
          <p>
            Outside work, I&apos;m building{" "}
            <a href="https://kidpen.org" target="_blank" rel="noopener noreferrer">kidpen.org</a>
            {" "}— a free, open-source STEM education platform for Thai students.
            Because the skills that changed my career shouldn&apos;t be locked behind paywalls.
          </p>
        </div>
      </Reveal>
    </SectionShell>
  );
}
