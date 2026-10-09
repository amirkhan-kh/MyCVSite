import { defineConfig } from "astro/config";

export default defineConfig({
  build: {
    inlineStylesheets: "always",
  },
  compressHTML: true,
  vite: {
    optimizeDeps: {
      include: ["motion"],
    },
  },
});
