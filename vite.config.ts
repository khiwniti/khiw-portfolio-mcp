import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Two entry points, one config:
//   INPUT=mcp-app.html      → single inlined HTML file in dist/ (for MCP host iframe)
//   INPUT=standalone.html   → normal Vite output in dist-standalone/ (for Vercel/khiw.dev)
const INPUT = process.env.INPUT;
if (!INPUT) {
  throw new Error("INPUT env var is required (mcp-app.html or standalone.html)");
}

const isMcpBuild = INPUT === "mcp-app.html";
const isDevelopment = process.env.NODE_ENV === "development";

export default defineConfig({
  plugins: [
    react(),
    // Only inline everything for the MCP single-file build. The standalone
    // build wants normal asset splitting so Vercel's edge CDN can do its job.
    ...(isMcpBuild ? [viteSingleFile()] : []),
  ],
  build: {
    sourcemap: isDevelopment ? "inline" : false,
    cssMinify: !isDevelopment,
    minify: !isDevelopment,
    outDir: isMcpBuild ? "dist" : "dist-standalone",
    emptyOutDir: false,
    rollupOptions: { input: INPUT },
  },
});
