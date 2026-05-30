# khiw-portfolio-mcp

Ikkyu's portfolio (`khiw.dev`) as a **hybrid MCP App**: one React codebase, two outputs.

| Surface | Build | Deploy |
|---|---|---|
| Standalone web app (khiw.dev) | `npm run build:standalone` → `dist-standalone/` | Vercel project A — uses `vercel.frontend.json` |
| MCP App (Claude Desktop / basic-host) | `npm run build:ui` → `dist/mcp-app.html` (single file) | Vercel project B — uses `vercel.server.json`, serves `/mcp` |

The same React tree renders in both modes — `src/lib/mcp-bridge.ts` detects the sandboxed iframe and switches the data source from URL params (`?section=projects&project=carbonbim`) to MCP tool arguments.

## What's interactive

- **Project drill-down modal** — click any project card → animated case-study modal (problem / approach / result / tech stack / live link). Focus-trapped, Esc closes, focus restores. Cmd-click bypasses the modal and opens the live URL.
- **Career row expansion** — click a timeline row → inline expansion with tech badges + related-project shortcuts. Arrow keys navigate between rows.
- **Skill cluster explode** — click a category header → chips fly out from a radial origin (golden-angle distribution) with stagger. Click a chip → cross-section tech-focus highlight.
- **Cross-section `tech:focus`** — hovering or clicking any tech badge highlights every matching item across projects, career, skills, and hero pills. Esc clears.
- **Drawable surfaces** — hero cursor-following orb (lerp tracking), footer "leave a mark" canvas pad.
- **Reduced-motion friendly** — all transitions check `prefers-reduced-motion` and degrade gracefully.

## Develop

```bash
npm install                # install all deps
npm run dev                # Vite dev server (standalone mode)
npm run build              # build MCP single-file + compile server
npm run build:standalone   # build standalone version for khiw.dev
npm run serve              # start MCP server on http://localhost:3001/mcp
```

## Deep-link to a section / project / tech

### Standalone (khiw.dev)
```
https://khiw.dev/?section=projects
https://khiw.dev/?project=carbonbim
https://khiw.dev/?tech=LangGraph
```

### MCP tool call
```jsonc
{
  "name": "show_portfolio",
  "arguments": {
    "section": "skills",
    "project": "earthcast",
    "tech": "FourCastNet"
  }
}
```

## Deploy

### A) Frontend (khiw.dev) on Vercel

```bash
cp vercel.frontend.json vercel.json
vercel deploy --prod
```

Or in the Vercel dashboard: set build command `npm run build:standalone`, output dir `dist-standalone/`, no framework preset.

> If you already have a Next.js site at `khiw.dev`, run `npm run build:standalone` and copy `dist-standalone/standalone.html` (renamed to `index.html`) plus its assets into your `public/` folder, or mount this as a subroute (`/portfolio`).

### B) MCP server on Vercel

```bash
cp vercel.server.json vercel.json
vercel deploy --prod
```

Set the deployed domain in your MCP client (e.g. Claude Desktop):

```jsonc
{
  "servers": {
    "khiw-portfolio": {
      "transport": "http",
      "url": "https://khiw-portfolio-mcp.vercel.app/mcp"
    }
  }
}
```

### C) Cloudflare backend (optional)

If you later add a Cloudflare Worker for GitHub-metrics caching / contact-form intake / resume-PDF storage:

1. Deploy the worker (e.g. `https://api.khiw.dev`).
2. Add its origin to `connectDomains` in `server.ts`:
   ```ts
   csp: {
     connectDomains: ["https://api.khiw.dev"],
   }
   ```
3. Re-run `npm run build && vercel deploy --prod`. The CSP travels with the resource — no client change needed.

## Local MCP testing

```bash
# Terminal 1
npm run build
npm run serve
# → http://localhost:3001/mcp

# Terminal 2 (in /tmp/mcp-ext-apps clone)
cd /tmp/mcp-ext-apps/examples/basic-host
npm install
SERVERS='["http://localhost:3001/mcp"]' npm run start
# Open http://localhost:8080 and call show_portfolio
```

## Architecture in one paragraph

`mcp-app.html` and `standalone.html` both load `src/main.tsx`. `main.tsx` detects whether `window.location.origin === "null"` (sandboxed iframe = MCP host) and either renders immediately with URL params (standalone) or waits up to 1.2s for the MCP host's `ontoolinput` (MCP). Either way it eventually calls `<App initialFocus={...} />`. The App composes `<TechFocusProvider>` over the section tree; that single Context replaces what the spec describes as the postMessage bus's `tech:focus` fan-out. When this single-file build later splits into iframe sections, the Context provider becomes a `BroadcastChannel` / postMessage adapter — the component contracts don't change.

## Not built (yet) — explicit gaps vs. the spec

- No `packages/messages` / `packages/tokens` split — tokens live in `src/tokens.ts`.
- No sandboxed-iframe section routes — every section is a sibling in the host tree.
- No graph-RAG adapter / GitHub metrics live fetch — projects/skills are static and verified.
- No contact form / resume export tool — for now the "Resume" link points at the existing `khiw.dev/api/resume` endpoint.
- No AskDock / EvidencePopover — drill-down modal replaces them for this iteration.

These are intentional v1 cuts. The hybrid base is shipped; the spec's larger architecture can land incrementally without breaking what's here.
