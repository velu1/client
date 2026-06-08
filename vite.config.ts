import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";

const versionData = JSON.parse(fs.readFileSync("version.json", "utf-8"));
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: [
      "a0f928db6f3d.ngrok-free.app",
      "dd89384d9e57.ngrok-free.app",
      "e40da3e13e32.ngrok-free.app",
      "192.168.1.100",
      "demo.mysoreminds.in",
      "dev.mysoreminds.in",
    ],
  },
  preview: {
    allowedHosts: [
      "a0f928db6f3d.ngrok-free.app",
      "192.168.1.100",
      "demo.mysoreminds.in",
      "dev.mysoreminds.in",
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for node_modules dependencies
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            "@tanstack/react-table",
            "axios",
          ],
          // UI components chunk
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-label",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "class-variance-authority",
            "tailwind-merge",
            "clsx",
            "lucide-react",
          ],
          // Forms related
          forms: ["react-hook-form", "input-otp"],
        },
      },
    },
    // Optionally increase the warning limit if needed
    chunkSizeWarningLimit: 600,
  },
  define: {
    __APP_VERSION__: JSON.stringify(versionData.version),
    __LAST_MERGE_DATE__: JSON.stringify(versionData.lastMergeDate),
  },
});
