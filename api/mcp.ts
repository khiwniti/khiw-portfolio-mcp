/**
 * Vercel serverless entry for the MCP Streamable HTTP transport.
 */
import type { Request, Response } from "express";

let initError: unknown = null;
let appModule: { default: import("express").Express } | null = null;

// Use dynamic imports so any module-level error is captured rather than
// crashing the entire Lambda cold-start silently.
try {
  const [{ createMcpExpressApp }, { StreamableHTTPServerTransport }, { default: cors }, { createServer }] =
    await Promise.all([
      import("@modelcontextprotocol/sdk/server/express.js"),
      import("@modelcontextprotocol/sdk/server/streamableHttp.js"),
      import("cors"),
      import("../server.js"),
    ]);

  const app = createMcpExpressApp({ host: "0.0.0.0" });
  app.use(cors());

  // Express 5 requires named or (.*) wildcards — bare * is rejected by path-to-regexp v8.
  app.all("/(.*)", async (req: Request, res: Response) => {
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
        res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null });
      }
    }
  });

  appModule = { default: app } as unknown as typeof appModule;
} catch (err) {
  initError = err;
  console.error("[mcp init error]", err);
}

export default function handler(req: Request, res: Response) {
  if (initError || !appModule) {
    const e = initError as Error;
    res.status(500).json({ initError: e?.message ?? String(initError), stack: e?.stack });
    return;
  }
  appModule.default(req, res);
}
