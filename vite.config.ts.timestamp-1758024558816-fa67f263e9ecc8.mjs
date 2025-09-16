// vite.config.ts
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.js";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
import path from "path";
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8082
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    // Optimize for production
    minify: "esbuild",
    // Use esbuild instead of terser for better compatibility
    minifyOptions: {
      drop: ["console", "debugger"]
      // Remove console logs and debugger statements
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
            "@radix-ui/react-dropdown-menu"
          ],
          router: ["react-router-dom"],
          query: ["@tanstack/react-query"],
          motion: ["framer-motion"]
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1e3
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "framer-motion",
      "lucide-react"
    ]
  },
  // CSS optimization
  css: {
    devSourcemap: mode === "development"
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgyLFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpXS5maWx0ZXIoXG4gICAgQm9vbGVhblxuICApLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgLy8gT3B0aW1pemUgZm9yIHByb2R1Y3Rpb25cbiAgICBtaW5pZnk6IFwiZXNidWlsZFwiLCAvLyBVc2UgZXNidWlsZCBpbnN0ZWFkIG9mIHRlcnNlciBmb3IgYmV0dGVyIGNvbXBhdGliaWxpdHlcbiAgICBtaW5pZnlPcHRpb25zOiB7XG4gICAgICBkcm9wOiBbXCJjb25zb2xlXCIsIFwiZGVidWdnZXJcIl0sIC8vIFJlbW92ZSBjb25zb2xlIGxvZ3MgYW5kIGRlYnVnZ2VyIHN0YXRlbWVudHNcbiAgICB9LFxuICAgIC8vIEVuYWJsZSBzb3VyY2UgbWFwcyBmb3IgYmV0dGVyIGRlYnVnZ2luZ1xuICAgIHNvdXJjZW1hcDogbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiLFxuICAgIC8vIE9wdGltaXplIGNodW5rIHNwbGl0dGluZ1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICB2ZW5kb3I6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCJdLFxuICAgICAgICAgIHVpOiBbXG4gICAgICAgICAgICBcIkBoZXJvdWkvcmVhY3RcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LWRpYWxvZ1wiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtZHJvcGRvd24tbWVudVwiLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgcm91dGVyOiBbXCJyZWFjdC1yb3V0ZXItZG9tXCJdLFxuICAgICAgICAgIHF1ZXJ5OiBbXCJAdGFuc3RhY2svcmVhY3QtcXVlcnlcIl0sXG4gICAgICAgICAgbW90aW9uOiBbXCJmcmFtZXItbW90aW9uXCJdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIC8vIEluY3JlYXNlIGNodW5rIHNpemUgd2FybmluZyBsaW1pdFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcbiAgfSxcbiAgLy8gT3B0aW1pemUgZGVwZW5kZW5jaWVzXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFtcbiAgICAgIFwicmVhY3RcIixcbiAgICAgIFwicmVhY3QtZG9tXCIsXG4gICAgICBcInJlYWN0LXJvdXRlci1kb21cIixcbiAgICAgIFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCIsXG4gICAgICBcImZyYW1lci1tb3Rpb25cIixcbiAgICAgIFwibHVjaWRlLXJlYWN0XCIsXG4gICAgXSxcbiAgfSxcbiAgLy8gQ1NTIG9wdGltaXphdGlvblxuICBjc3M6IHtcbiAgICBkZXZTb3VyY2VtYXA6IG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIixcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sT0FBTyxXQUFXO0FBQzNPLFNBQVMsdUJBQXVCO0FBQ2hDLE9BQU8sVUFBVTtBQUNqQixTQUFTLG9CQUFvQjtBQUg3QixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsaUJBQWlCLGdCQUFnQixDQUFDLEVBQUU7QUFBQSxJQUM5RDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixNQUFNLENBQUMsV0FBVyxVQUFVO0FBQUE7QUFBQSxJQUM5QjtBQUFBO0FBQUEsSUFFQSxXQUFXLFNBQVM7QUFBQTtBQUFBLElBRXBCLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUM3QixJQUFJO0FBQUEsWUFDRjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFVBQ0EsUUFBUSxDQUFDLGtCQUFrQjtBQUFBLFVBQzNCLE9BQU8sQ0FBQyx1QkFBdUI7QUFBQSxVQUMvQixRQUFRLENBQUMsZUFBZTtBQUFBLFFBQzFCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsdUJBQXVCO0FBQUEsRUFDekI7QUFBQTtBQUFBLEVBRUEsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUVBLEtBQUs7QUFBQSxJQUNILGNBQWMsU0FBUztBQUFBLEVBQ3pCO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
