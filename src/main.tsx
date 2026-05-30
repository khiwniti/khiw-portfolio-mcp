/**
 * Entry point.
 *
 * Hybrid mode detection:
 *   • Standalone (e.g. khiw.dev): window.location.origin starts with https:
 *     and is NOT a sandboxed null origin. Parameters read from the URL.
 *   • MCP App (Claude Desktop, basic-host, etc.): sandboxed iframe with
 *     `window.location.origin === "null"`. Parameters arrive via the MCP
 *     tool lifecycle (ontoolinput / ontoolresult).
 *
 * The rendered tree is identical in both modes — only the source of
 * `initialFocus` differs. Host styling, theme, fonts, and safe-area insets
 * are applied only in MCP mode.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App, type InitialFocus } from "./App";
import { detectMcpMode, initMcpHost, parseStandaloneFocus } from "./lib/mcp-bridge";

async function bootstrap() {
  const root = createRoot(document.getElementById("root")!);
  const isMcp = detectMcpMode();

  // Render a fast "Connecting…" pre-state so the iframe isn't blank during
  // the MCP handshake. For standalone mode this is bypassed and we render
  // the real App synchronously.
  if (isMcp) {
    root.render(
      <StrictMode>
        <ConnectingShell />
      </StrictMode>,
    );
    const initialFocus = await initMcpHost();
    root.render(
      <StrictMode>
        <App initialFocus={initialFocus} />
      </StrictMode>,
    );
  } else {
    const initialFocus = parseStandaloneFocus();
    root.render(
      <StrictMode>
        <App initialFocus={initialFocus} />
      </StrictMode>,
    );
  }
}

function ConnectingShell() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e17",
        color: "#94a3b8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        fontSize: 13,
        letterSpacing: 2,
      }}
    >
      <span>connecting…</span>
    </div>
  );
}

bootstrap().catch((err) => {
  console.error("[khiw-portfolio] bootstrap failed:", err);
  // Last-resort fallback so the user still sees content even if the MCP
  // handshake throws.
  const root = createRoot(document.getElementById("root")!);
  root.render(<App initialFocus={null} />);
});

// Quiet the unused-import warning for InitialFocus in some toolchains.
export type { InitialFocus };
