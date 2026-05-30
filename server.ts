/**
 * khiw.dev — Ikkyu's portfolio as an MCP server.
 *
 * Exposes two tools:
 *   • show_portfolio({ section?, project?, tech? })  — opens the inline UI
 *     and optionally deep-links into a section / opens a project drill-down.
 *   • get_project_summary({ projectId })             — text-only fallback the
 *     UI can use, or a non-UI client can call for plain content.
 *
 * Exposes one UI resource:
 *   • ui://khiw-portfolio/main  — the bundled single-file HTML/JS produced by
 *     `npm run build:ui`. CSP allows Google Fonts + the known Vercel/Cloudflare
 *     domains the live links point to, so the user can open them in a new tab
 *     from inside the MCP iframe without the host blocking the navigation.
 */
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { PROJECTS, STATS, CAREER, SKILLS } from "./src/data.js";

// Works both from source (server.ts via tsx) and compiled (dist/server.js).
const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(path.dirname(import.meta.filename), "dist")
  : path.dirname(import.meta.filename);

const RESOURCE_URI = "ui://khiw-portfolio/main";

const PROJECT_IDS = PROJECTS.map((p) => p.id) as [string, ...string[]];
const SECTION_IDS = ["hero", "about", "career", "projects", "skills"] as const;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "khiw.dev — Ikkyu Portfolio",
    version: "0.1.0",
  });

  // ─── show_portfolio ─────────────────────────────────────────────────────
  registerAppTool(
    server,
    "show_portfolio",
    {
      title: "Show Portfolio",
      description:
        "Open Ikkyu's interactive portfolio inline. Optional arguments deep-link to a section, open a project's drill-down case study, or pre-highlight a tech across all sections.",
      inputSchema: {
        section: z
          .enum(SECTION_IDS)
          .optional()
          .describe("Scroll to a section on open."),
        project: z
          .enum(PROJECT_IDS)
          .optional()
          .describe("Open this project's case-study modal on mount."),
        tech: z
          .string()
          .max(64)
          .optional()
          .describe("Pre-highlight a tech (e.g. LangGraph, ANSYS Fluent) across projects, career, and skills."),
      },
      _meta: { ui: { resourceUri: RESOURCE_URI } },
    },
    async (args): Promise<CallToolResult> => {
      const fragment = buildTextSummary(args);
      return {
        content: [{ type: "text", text: fragment }],
        // structuredContent feeds the UI's ontoolresult handler in case the host
        // sends *only* a result (not an input) — defensive double-channel.
        structuredContent: {
          section: args.section ?? null,
          project: args.project ?? null,
          tech: args.tech ?? null,
        },
      };
    },
  );

  // ─── get_project_summary ────────────────────────────────────────────────
  registerAppTool(
    server,
    "get_project_summary",
    {
      title: "Get Project Summary",
      description:
        "Returns a plain-text summary of one of Ikkyu's projects. Useful for non-UI MCP clients or for grounding an answer with verified data.",
      inputSchema: {
        projectId: z.enum(PROJECT_IDS).describe("Stable project slug — see show_portfolio for the list."),
      },
      _meta: { ui: { resourceUri: RESOURCE_URI, visibility: ["model"] } },
    },
    async ({ projectId }): Promise<CallToolResult> => {
      const p = PROJECTS.find((x) => x.id === projectId);
      if (!p) {
        return {
          content: [{ type: "text", text: `No project with id "${projectId}".` }],
          isError: true,
        };
      }
      const lines = [
        `${p.n} — ${p.d}`,
        `Tag: ${p.tag}`,
        `Live: ${p.u}`,
        p.problem ? `Problem: ${p.problem}` : null,
        p.approach ? `Approach: ${p.approach}` : null,
        p.result ? `Result: ${p.result}` : null,
        p.tech && p.tech.length > 0 ? `Tech: ${p.tech.join(", ")}` : null,
      ].filter(Boolean);
      return {
        content: [{ type: "text", text: lines.join("\n") }],
        structuredContent: p as unknown as Record<string, unknown>,
      };
    },
  );

  // ─── UI resource (bundled HTML) ─────────────────────────────────────────
  registerAppResource(
    server,
    "Ikkyu Portfolio UI",
    RESOURCE_URI,
    { description: "Interactive portfolio for Ikkyu (khiw.dev)." },
    async (): Promise<ReadResourceResult> => {
      const htmlPath = path.join(DIST_DIR, "mcp-app.html");
      const html = await fs.readFile(htmlPath, "utf-8");
      return {
        contents: [
          {
            uri: RESOURCE_URI,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
            _meta: {
              ui: {
                // CSP allowlist — every external origin the bundled app touches
                // must be declared here or the request fails silently inside
                // the sandboxed iframe.
                csp: {
                  resourceDomains: [
                    "https://fonts.googleapis.com",
                    "https://fonts.gstatic.com",
                  ],
                  connectDomains: [
                    // The live "Visit" buttons open in a NEW TAB so they don't
                    // need connect-src. We only list domains the iframe itself
                    // calls. Today: none. Reserved here for future use:
                    //   "https://api.github.com",   // GitHub metrics
                    //   "https://www.khiw.dev",     // resume PDF + status
                  ],
                  // No nested iframes for now.
                },
              },
            },
          },
        ],
      };
    },
  );

  return server;
}

/**
 * Build a deterministic plain-text fallback for non-UI hosts. The MCP host
 * shows this to the user when the UI resource can't render.
 */
function buildTextSummary(args: { section?: string; project?: string; tech?: string }): string {
  const lines: string[] = [];
  lines.push("Ikkyu — AI-Augmented Full-Stack Developer & AI Agent Architect");
  lines.push(`Bangkok, Thailand · ${STATS.map((s) => `${s.n} ${s.l}`).join(" · ")}`);
  lines.push("");

  if (args.project) {
    const p = PROJECTS.find((x) => x.id === args.project);
    if (p) {
      lines.push(`Opening project: ${p.n}`);
      lines.push(`  ${p.d}`);
      lines.push(`  → ${p.u}`);
    }
  } else if (args.section) {
    lines.push(`Section focus: ${args.section}`);
  }

  if (args.tech) {
    lines.push(`Tech focus: ${args.tech}`);
  }

  lines.push("");
  lines.push("Current role: Associate Solution Architect — Bangkok Silicon (BKS), 2025–present.");
  lines.push(
    `Top skills: ${SKILLS.flatMap((cat) => cat.s).slice(0, 12).join(", ")}.`,
  );
  lines.push(`Selected projects: ${PROJECTS.slice(0, 6).map((p) => p.n).join(", ")}.`);
  lines.push(`Career highlights: ${CAREER.slice(0, 3).map((c) => `${c.t} @ ${c.c}`).join("; ")}.`);
  lines.push("");
  lines.push("Open the inline UI to drill into projects, expand the career timeline, and explode the skill clusters.");
  return lines.join("\n");
}
