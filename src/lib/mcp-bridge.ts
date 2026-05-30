/**
 * MCP host bridge: detection, lifecycle wiring, host-style application.
 *
 * Why this is a separate module: keeping it out of main.tsx means the
 * standalone build can tree-shake the ext-apps SDK if a future Vite config
 * marks it as side-effect-free. (Today it's small enough not to matter, but
 * the separation is the right shape.)
 */
import {
  App as McpApp,
  applyDocumentTheme,
  applyHostStyleVariables,
  applyHostFonts,
} from "@modelcontextprotocol/ext-apps";
import type { InitialFocus } from "../App";

/**
 * Returns true if we're inside an MCP host's sandboxed iframe.
 *
 * The sandboxed iframe always gets `origin === "null"`. We also accept any
 * cross-origin iframe (window.parent !== window) as a defensive fallback for
 * hosts that haven't applied the full sandbox attribute set.
 */
export function detectMcpMode(): boolean {
  try {
    if (window.location.origin === "null") return true;
    // Some hosts iframe us without the null-origin sandbox. If we're in any
    // iframe AND the parent origin differs, assume MCP-mode.
    if (window.parent !== window) {
      // We can't always read parent.origin (cross-origin throw), but the throw
      // itself is the signal we want.
      try {
        const sameOrigin = window.parent.location.origin === window.location.origin;
        return !sameOrigin;
      } catch {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Read deep-link parameters from URL search string when running standalone.
 *
 *   /?section=projects&project=carbonbim&tech=LangGraph
 */
export function parseStandaloneFocus(): InitialFocus | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section") as InitialFocus["section"] | null;
    const project = params.get("project");
    const tech = params.get("tech");
    if (!section && !project && !tech) return null;
    return {
      ...(section ? { section } : {}),
      ...(project ? { project } : {}),
      ...(tech ? { tech } : {}),
    };
  } catch {
    return null;
  }
}

/**
 * MCP lifecycle:
 *   1. Create an App instance.
 *   2. Register handlers BEFORE connect() (this is required by the SDK).
 *   3. Connect via PostMessageTransport.
 *   4. Resolve when we have ontoolinput arguments (the deep-link target).
 *
 * If no ontoolinput arrives within a short timeout, we still resolve with
 * null so the portfolio renders at the hero — the spec is explicit that the
 * UI should never block on a remote handshake.
 */
export async function initMcpHost(): Promise<InitialFocus | null> {
  // SDK constructor takes positional args: (appInfo, capabilities, options).
  const app = new McpApp(
    { name: "Ikkyu — khiw.dev Portfolio", version: "0.1.0" },
    {}, // capabilities — we don't register any of our own tools client-side
    { autoResize: true }, // auto-emit iframe:resize when content height changes
  );

  let resolved = false;
  let resolveFocus: (f: InitialFocus | null) => void = () => {};
  const focusPromise = new Promise<InitialFocus | null>((res) => {
    resolveFocus = res;
  });

  // Register ALL handlers before connect() — the SDK enforces this contract.

  app.ontoolinput = (input) => {
    if (resolved) return;
    resolved = true;
    const args = (input.arguments ?? {}) as Record<string, unknown>;
    resolveFocus(coerceFocus(args));
  };

  app.ontoolresult = (result) => {
    if (resolved) return;
    resolved = true;
    const sc = (result.structuredContent ?? {}) as Record<string, unknown>;
    resolveFocus(coerceFocus(sc));
  };

  app.onhostcontextchanged = (ctx) => {
    if (ctx.theme) applyDocumentTheme(ctx.theme);
    if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
    if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
    if (ctx.safeAreaInsets) {
      const { top, right, bottom, left } = ctx.safeAreaInsets;
      // Apply on body so the orb/hero/skip-link all respect the inset.
      document.body.style.paddingTop = `${top}px`;
      document.body.style.paddingRight = `${right}px`;
      document.body.style.paddingBottom = `${bottom}px`;
      document.body.style.paddingLeft = `${left}px`;
    }
  };

  app.onteardown = async () => {
    // No persistent state to clean up — return empty.
    return {};
  };

  app.onerror = (err) => console.error("[mcp]", err);

  // No transport arg → SDK builds PostMessageTransport(window.parent, window.parent) for us.
  await app.connect();

  // 1.2s safety net: if the host hasn't sent ontoolinput by then, render hero.
  const timeout = new Promise<InitialFocus | null>((res) => {
    setTimeout(() => res(null), 1200);
  });

  return Promise.race([focusPromise, timeout]);
}

/**
 * Tiny coercion helper: accept anything from the host, return only the shape
 * we expect. Bad input becomes a no-op (null) rather than throwing — defensive
 * against schema drift on the server side.
 */
function coerceFocus(raw: Record<string, unknown>): InitialFocus | null {
  const allowedSections: ReadonlyArray<InitialFocus["section"]> = [
    "hero",
    "about",
    "career",
    "projects",
    "skills",
  ];
  const focus: InitialFocus = {};
  if (typeof raw.section === "string" && (allowedSections as readonly string[]).includes(raw.section)) {
    focus.section = raw.section as InitialFocus["section"];
  }
  if (typeof raw.project === "string" && raw.project.length < 64) focus.project = raw.project;
  if (typeof raw.tech === "string" && raw.tech.length < 64) focus.tech = raw.tech;
  return Object.keys(focus).length > 0 ? focus : null;
}
