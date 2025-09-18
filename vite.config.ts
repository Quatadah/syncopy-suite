import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8082,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
    },
    // Optimize for production
    minify: "esbuild", // Use esbuild instead of terser for better compatibility
    minifyOptions: {
      drop: ["console", "debugger"], // Remove console logs and debugger statements
    },
    // Enable source maps for better debugging
    sourcemap: mode === "development",
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: [
            "@heroui/react",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
          ],
          router: ["react-router-dom"],
          query: ["@tanstack/react-query"],
          motion: ["framer-motion"],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "framer-motion",
      "lucide-react",
    ],
  },
  // CSS optimization
  css: {
    devSourcemap: mode === "development",
  },
}));
