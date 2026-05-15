import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        entryFileNames: "assets/retailrewards-[hash].js",
        chunkFileNames: "assets/retailrewards-chunk-[hash].js",
        assetFileNames: "assets/retailrewards-[hash].[ext]",
        manualChunks: (id) => {
          // Split MUI and emotion into separate vendor chunk
          if (
            id.includes("node_modules/@mui") ||
            id.includes("node_modules/@emotion")
          ) {
            return "mui-vendor";
          }
          // Split React and React-DOM into separate vendor chunk
          if (id.includes("node_modules/react")) {
            return "react-vendor";
          }
          // Split table libraries into separate vendor chunk
          if (
            id.includes("node_modules/@tanstack") ||
            id.includes("node_modules/material-react-table")
          ) {
            return "table-vendor";
          }
        },
      },
    },
  },
});
