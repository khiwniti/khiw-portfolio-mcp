/**
 * Vercel serverless entry for the MCP Streamable HTTP transport.
 */
import type { Request, Response } from "express";

// Wrap ALL module-level init in try/catch so we can surface errors as JSON
// instead of getting FUNCTION_INVOCATION_FAILED with no detail.
let createMcpExpressApp: typeof import("@modelcontextprotocol/sdk/server/express.js").createMcpExpressApp;
let StreamableHTTPServerTransport: typeof import("@modelcontextprotocol/sdk/server/streamableHttp.js").StreamableHTTPServerTransport;
let cors: typeof import("cors");
let createServer: typeof import("../server.js").createServer;
let initError: Error | null = null;
let app: ReturnType<typeof createMcpExpressApp> | null = null;

try {
  ({ createMcpExpressApp } = await import("@modelcontextprotocol/sdk/server/express.js"));
  ({ StreamableHTTPServerTransport } = await import("@modelcontextprotocol/sdk/server/streamableHttp.js"));
  ({ default: cors } = await import("cors"));
  ({ createServer } = await import("../server.js"));

  app = createMcpExpressApp({ host: "0.0.0.0" });
  app.use(cors());

  app.all("*", async (req: Request, res: Response) => {
    if ((req.method === "GET" || req.method === "HEAD") && req.path.includes("healthz")) {
      res.json({ ok: true, server: "khiw-portfolio-mcp", time: new Date().toISOString() });
      return;
    }

    const server = createServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("[mcp handler]", err);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });
} catch (err) {
  initError = err as Error;
  console.error("[mcp init]", err);
}

export default function handler(req: Request, res: Response) {
  if (initError || !app) {
    res.status(500).json({
      error: initError?.message ?? "Init failed",
      stack: initError?.stack ?? "",
    });
    return;
  }
  app(req, res);
}
