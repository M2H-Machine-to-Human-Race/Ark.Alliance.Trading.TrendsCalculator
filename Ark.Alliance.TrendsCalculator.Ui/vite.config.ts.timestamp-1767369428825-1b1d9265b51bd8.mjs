// vite.config.ts
import { defineConfig } from "file:///C:/Users/Criprtoswiss/source/repos/Ark.Alliance.Trading.TrendsCalculator/Ark.Alliance.TrendsCalculator.Ui/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Criprtoswiss/source/repos/Ark.Alliance.Trading.TrendsCalculator/Ark.Alliance.TrendsCalculator.Ui/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/Criprtoswiss/source/repos/Ark.Alliance.Trading.TrendsCalculator/Ark.Alliance.TrendsCalculator.Ui/node_modules/@tailwindcss/vite/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\Criprtoswiss\\source\\repos\\Ark.Alliance.Trading.TrendsCalculator\\Ark.Alliance.TrendsCalculator.Ui";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@share/trends": path.resolve(__vite_injected_original_dirname, "../Ark.Alliance.TrendsCalculator.Share/src/index.ts")
    }
  },
  server: {
    port: 5173,
    // HTTPS disabled - Chrome has SSL cipher mismatch issues with Vite's auto-generated certs
    // Use HTTP for local development
    proxy: {
      "/api": {
        // Backend runs on HTTP by default (or HTTPS if selected at startup)
        target: process.env.VITE_API_URL || "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        // Accept self-signed certificates from backend
        ws: true
        // Enable WebSocket proxying
      },
      "/socket.io": {
        target: process.env.VITE_API_URL || "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        ws: true
      }
    },
    fs: {
      // Allow serving files from the component library
      allow: [
        // Project root
        path.resolve(__vite_injected_original_dirname),
        // React Component UI library
        path.resolve(__vite_injected_original_dirname, "../Ark.Alliance.React.Component.UI"),
        // Node modules
        path.resolve(__vite_injected_original_dirname, "node_modules")
      ]
    }
  },
  build: {
    outDir: "dist",
    sourcemap: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxDcmlwcnRvc3dpc3NcXFxcc291cmNlXFxcXHJlcG9zXFxcXEFyay5BbGxpYW5jZS5UcmFkaW5nLlRyZW5kc0NhbGN1bGF0b3JcXFxcQXJrLkFsbGlhbmNlLlRyZW5kc0NhbGN1bGF0b3IuVWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXENyaXBydG9zd2lzc1xcXFxzb3VyY2VcXFxccmVwb3NcXFxcQXJrLkFsbGlhbmNlLlRyYWRpbmcuVHJlbmRzQ2FsY3VsYXRvclxcXFxBcmsuQWxsaWFuY2UuVHJlbmRzQ2FsY3VsYXRvci5VaVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQ3JpcHJ0b3N3aXNzL3NvdXJjZS9yZXBvcy9BcmsuQWxsaWFuY2UuVHJhZGluZy5UcmVuZHNDYWxjdWxhdG9yL0Fyay5BbGxpYW5jZS5UcmVuZHNDYWxjdWxhdG9yLlVpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgICByZWFjdCgpLFxyXG4gICAgICAgIHRhaWx3aW5kY3NzKCksXHJcbiAgICBdLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXHJcbiAgICAgICAgICAgICdAc2hhcmUvdHJlbmRzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL0Fyay5BbGxpYW5jZS5UcmVuZHNDYWxjdWxhdG9yLlNoYXJlL3NyYy9pbmRleC50cycpLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgcG9ydDogNTE3MyxcclxuICAgICAgICAvLyBIVFRQUyBkaXNhYmxlZCAtIENocm9tZSBoYXMgU1NMIGNpcGhlciBtaXNtYXRjaCBpc3N1ZXMgd2l0aCBWaXRlJ3MgYXV0by1nZW5lcmF0ZWQgY2VydHNcclxuICAgICAgICAvLyBVc2UgSFRUUCBmb3IgbG9jYWwgZGV2ZWxvcG1lbnRcclxuICAgICAgICBwcm94eToge1xyXG4gICAgICAgICAgICAnL2FwaSc6IHtcclxuICAgICAgICAgICAgICAgIC8vIEJhY2tlbmQgcnVucyBvbiBIVFRQIGJ5IGRlZmF1bHQgKG9yIEhUVFBTIGlmIHNlbGVjdGVkIGF0IHN0YXJ0dXApXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHByb2Nlc3MuZW52LlZJVEVfQVBJX1VSTCB8fCAnaHR0cDovL2xvY2FsaG9zdDozMDAxJyxcclxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsIC8vIEFjY2VwdCBzZWxmLXNpZ25lZCBjZXJ0aWZpY2F0ZXMgZnJvbSBiYWNrZW5kXHJcbiAgICAgICAgICAgICAgICB3czogdHJ1ZSwgLy8gRW5hYmxlIFdlYlNvY2tldCBwcm94eWluZ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnL3NvY2tldC5pbyc6IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogcHJvY2Vzcy5lbnYuVklURV9BUElfVVJMIHx8ICdodHRwOi8vbG9jYWxob3N0OjMwMDEnLFxyXG4gICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHdzOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnM6IHtcclxuICAgICAgICAgICAgLy8gQWxsb3cgc2VydmluZyBmaWxlcyBmcm9tIHRoZSBjb21wb25lbnQgbGlicmFyeVxyXG4gICAgICAgICAgICBhbGxvdzogW1xyXG4gICAgICAgICAgICAgICAgLy8gUHJvamVjdCByb290XHJcbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoX19kaXJuYW1lKSxcclxuICAgICAgICAgICAgICAgIC8vIFJlYWN0IENvbXBvbmVudCBVSSBsaWJyYXJ5XHJcbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vQXJrLkFsbGlhbmNlLlJlYWN0LkNvbXBvbmVudC5VSScpLFxyXG4gICAgICAgICAgICAgICAgLy8gTm9kZSBtb2R1bGVzXHJcbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzJyksXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgICAgIHNvdXJjZW1hcDogdHJ1ZSxcclxuICAgIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJmLFNBQVMsb0JBQW9CO0FBQ3hoQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxVQUFVO0FBSGpCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVM7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxFQUNoQjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3BDLGlCQUFpQixLQUFLLFFBQVEsa0NBQVcscURBQXFEO0FBQUEsSUFDbEc7QUFBQSxFQUNKO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUE7QUFBQTtBQUFBLElBR04sT0FBTztBQUFBLE1BQ0gsUUFBUTtBQUFBO0FBQUEsUUFFSixRQUFRLFFBQVEsSUFBSSxnQkFBZ0I7QUFBQSxRQUNwQyxjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUE7QUFBQSxRQUNSLElBQUk7QUFBQTtBQUFBLE1BQ1I7QUFBQSxNQUNBLGNBQWM7QUFBQSxRQUNWLFFBQVEsUUFBUSxJQUFJLGdCQUFnQjtBQUFBLFFBQ3BDLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLElBQUk7QUFBQSxNQUNSO0FBQUEsSUFDSjtBQUFBLElBQ0EsSUFBSTtBQUFBO0FBQUEsTUFFQSxPQUFPO0FBQUE7QUFBQSxRQUVILEtBQUssUUFBUSxnQ0FBUztBQUFBO0FBQUEsUUFFdEIsS0FBSyxRQUFRLGtDQUFXLG9DQUFvQztBQUFBO0FBQUEsUUFFNUQsS0FBSyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUMxQztBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDSCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsRUFDZjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
