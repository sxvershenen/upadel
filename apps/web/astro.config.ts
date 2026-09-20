import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [react()],
  vite: {
    // check/sync optimize production React too; keep their cache out of a running dev server.
    cacheDir: fileURLToPath(new URL(`./node_modules/.vite/${process.env.NODE_ENV === 'production' ? 'production' : 'development'}/`, import.meta.url)),
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['swup', 'framer-motion', 'gsap', 'lucide-react', '@swup/scripts-plugin'],
    },
  },
});
