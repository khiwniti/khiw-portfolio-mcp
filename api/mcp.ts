/**
 * Vercel serverless entry for the MCP Streamable HTTP transport.
 *
 * Vercel invokes this file per-request (no persistent listen()). We create a
 * fresh McpServer per request — the SDK's stateless mode supports this and
 * it's the safe pattern for serverless environments.
 */
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import type { Request, Response } from "express";
import { createServer } from "../server.js";

const app = createMcpExpressApp({ host: "0.0.0.0" });
app.use(cors());

app.all("/api/mcp", async (req: Request, res: Response) => {
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

app.get("/api/healthz", (_req: Request, res: Response) => {
  res.json({ ok: true, server: "khiw-portfolio-mcp", time: new Date().toISOString() });
});

export default app;
