import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/grimfold/",
  // The Codex originals are served as-is until the build stage generates web copies.
  publicDir: "assets",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Grimfold",
        short_name: "Grimfold",
        lang: "es-MX",
        description: "Pesca lo que no debería subir.",
        theme_color: "#123f45",
        background_color: "#123f45",
        display: "standalone",
        orientation: "portrait",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: { cacheName: "art", expiration: { maxEntries: 200 } },
          },
        ],
      },
    }),
  ],
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    environment: "node",
  },
});
