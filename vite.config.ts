import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

/** GitHub Pages: https://pooloon.github.io/vibeCD/ */
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "연습실 관리",
        short_name: "연습실",
        description: "연습실 월단위 계약·손익·캘린더 관리",
        theme_color: "#1e3a5f",
        background_color: "#f4f6f9",
        display: "standalone",
        orientation: "portrait",
        start_url: base,
        icons: [
          {
            src: `${base}icon.svg`.replace("//", "/"),
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
