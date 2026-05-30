/**
 * MCP server entry point.
 *
 * Default mode: Streamable HTTP on PORT (default 3001).
 * Stdio mode: pass `--stdio` for Claude Desktop classic stdio transport.
 *
 * Deploy notes:
 *   • Vercel: this file is the Node entry. Set PORT via env (Vercel injects
 *     it automatically). The Streamable HTTP server stays alive for as long
 *     as the function instance does — fine for warm/serverless-Node.
 *   • Cloudflare Workers: NOT a fit for this file (Workers don't run Express
 *     servers). If you want a Cloudflare backend, expose your data API there
 *     and have this server's tool handlers fetch() against it (add the
 *     Worker's domain to connectDomains in server.ts).
 */
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import type { Request, Response } from "express";
import { createServer } from "./server.js";

async function startStreamableHTTPServer(factory: () => McpServer): Promise<void> {
  const port = parseInt(process.env.PORT ?? "3001", 10);
  const app = createMcpExpressApp({ host: "0.0.0.0" });
  app.use(cors());

  app.all("/mcp", async (req: Request, res: Response) => {
    const server = factory();
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

  // Simple liveness probe — useful for Vercel health checks and the
  // /status route described in the spec.
  app.get("/healthz", (_req, res) => {
    res.json({ ok: true, server: "khiw-portfolio-mcp", time: new Date().toISOString() });
  });

  const httpServer = app.listen(port, (err) => {
    if (err) {
      console.error("Failed to start MCP server:", err);
      process.exit(1);
    }
    console.log(`[mcp] khiw-portfolio listening on http://localhost:${port}/mcp`);
  });

  const shutdown = () => {
    console.log("[mcp] shutting down…");
    httpServer.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function startStdioServer(factory: () => McpServer): Promise<void> {
  await factory().connect(new StdioServerTransport());
}

async function main() {
  if (process.argv.includes("--stdio")) {
    await startStdioServer(createServer);
  } else {
    await startStreamableHTTPServer(createServer);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
