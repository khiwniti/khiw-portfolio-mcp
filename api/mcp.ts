/**
 * Vercel serverless entry for the MCP Streamable HTTP transport.
 *
 * Express 5 uses path-to-regexp v8 which no longer accepts bare `*` wildcards.
 * Use `(.*)` instead.
 */
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import type { Request, Response } from "express";
import { createServer } from "../server.js";

const app = createMcpExpressApp({ host: "0.0.0.0" });
app.use(cors());

// Express 5 requires explicit named or (.*) wildcards — bare * is rejected.
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
    console.error("[mcp]", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

export default app;
