/**
 * Top-level composition.
 *
 * Receives initialFocus from src/main.tsx — either parsed from URL params
 * (standalone) or from the MCP `show_portfolio` tool's `arguments` (MCP).
 *
 * Tree:
 *
 *   <App>
 *     <TechFocusProvider>    ← cross-section highlight state lives here
 *       <Hero/>
 *       <About/>
 *       <CareerTimeline/>    ← expand-in-place rows
 *       <ProjectGrid/>       ← drill-down modal
 *       <Domains/>
 *       <SkillClusters/>     ← explode-on-click chips
 *       <SideProjects/>
 *       <Footer/>            ← contains <SignaturePad/>
 *     </TechFocusProvider>
 *   </App>
 */
import { useEffect } from "react";
import { C, F } from "./tokens";
import { TechFocusProvider } from "./context/TechFocusContext";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { CareerTimeline } from "./components/CareerTimeline";
import { ProjectGrid } from "./components/ProjectGrid";
import { Domains } from "./components/Domains";
import { SkillClusters } from "./components/SkillClusters";
import { SideProjects } from "./components/SideProjects";
import { Footer } from "./components/Footer";

export interface InitialFocus {
  /** Scroll to a section on mount: hero | about | projects | skills */
  section?: "hero" | "about" | "projects" | "skills" | "career";
  /** Open this project's drill-down modal on mount. */
  project?: string;
  /** Pre-set the tech-focus highlight. */
  tech?: string;
}

export function App({ initialFocus }: { initialFocus?: InitialFocus | null }) {
  useEffect(() => {
    if (!initialFocus?.section) return;
    // Defer one frame so layout has stabilized before scrolling.
    const id = requestAnimationFrame(() => {
      const sec = document.getElementById(initialFocus.section!);
      sec?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, [initialFocus?.section]);

  return (
    <TechFocusProvider>
      <div
        style={{
          background: C.primary,
          color: C.text,
          fontFamily: F.sans,
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <GlobalStyles />
        {/* Skip link for keyboard users — invisible until focused. */}
        <a href="#main" className="khiw-skip-link">Skip to content</a>

        <Hero />
        <main id="main">
          <About />
          <CareerTimeline />
          <ProjectGrid openProjectId={initialFocus?.project ?? null} />
          <Domains />
          <SkillClusters />
          <SideProjects />
        </main>
        <Footer />

        {/* If the MCP tool pre-selects a tech, fire the same event the Pills use. */}
        {initialFocus?.tech && <TechFocusBootstrap tech={initialFocus.tech} />}
      </div>
    </TechFocusProvider>
  );
}

function TechFocusBootstrap({ tech }: { tech: string }) {
  // Done as a child component so it runs *after* TechFocusProvider mounts.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("khiw:hover-tech", { detail: { tech } }));
  }, [tech]);
  return null;
}

/**
 * Page-level CSS rules that need to be global (scrollbar, selection, font import,
 * keyframes for the hero pulse/availability dot).
 */
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      *{margin:0;padding:0;box-sizing:border-box}
      html{scroll-behavior:smooth}
      @media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}}
      ::selection{background:rgba(52,211,153,0.3);color:#e2e8f0}
      ::-webkit-scrollbar{width:6px}
      ::-webkit-scrollbar-track{background:${C.primary}}
      ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
      ::-webkit-scrollbar-thumb:hover{background:${C.accent}}
      a{color:${C.accent};text-decoration:none}
      a:hover{text-decoration:underline}
      button:focus-visible{outline:2px solid ${C.accent};outline-offset:2px}
      .khiw-skip-link{position:absolute;top:8px;left:8px;padding:8px 12px;background:${C.accent};color:${C.primary};font-weight:700;font-size:12px;border-radius:6px;z-index:1000;transform:translateY(-200%);transition:transform 200ms ease}
      .khiw-skip-link:focus{transform:translateY(0)}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
      @keyframes wave{0%,100%{transform:rotate(0deg)}25%{transform:rotate(20deg)}75%{transform:rotate(-15deg)}}
    `}</style>
  );
}

// Skip-link styles live in GlobalStyles (.khiw-skip-link) so the :focus
// transform-back animation can be expressed in plain CSS — inline styles
// can't express pseudo-classes.
