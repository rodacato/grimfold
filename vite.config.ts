import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/grimfold/",
  // Only the copies built by tools/art/web_art.mjs ship; the originals and candidates never do.
  publicDir: "assets/web",
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
        icons: [
          { src: "app/icono-192.png", sizes: "192x192", type: "image/png" },
          { src: "app/icono-512.png", sizes: "512x512", type: "image/png" },
          { src: "app/icono-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: { cacheName: "art", expiration: { maxEntries: 800 } },
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
