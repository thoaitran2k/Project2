import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: "/home",
    proxy: {
      "/provinces-api": {
        target: "https://provinces.open-api.vn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/provinces-api/, ""),
      },
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  optimizeDeps: {
    include: ["xlsx", "file-saver"],
  },
});
