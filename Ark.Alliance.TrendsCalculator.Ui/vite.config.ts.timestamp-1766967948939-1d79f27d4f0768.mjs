// vite.config.ts
import { defineConfig } from "file:///C:/Repos/Ark.Alliance.Trading.Bot-React/Ark.Alliance.TrendsCalculator.Ui/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Repos/Ark.Alliance.Trading.Bot-React/Ark.Alliance.TrendsCalculator.Ui/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Repos/Ark.Alliance.Trading.Bot-React/Ark.Alliance.TrendsCalculator.Ui/node_modules/@tailwindcss/vite/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Repos\\Ark.Alliance.Trading.Bot-React\\Ark.Alliance.TrendsCalculator.Ui";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 3078,
    proxy: {
      "/api": {
        target: "https://localhost:3075",
        changeOrigin: true,
        secure: false
        // Accept self-signed certificates
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxSZXBvc1xcXFxBcmsuQWxsaWFuY2UuVHJhZGluZy5Cb3QtUmVhY3RcXFxcQXJrLkFsbGlhbmNlLlRyZW5kc0NhbGN1bGF0b3IuVWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFJlcG9zXFxcXEFyay5BbGxpYW5jZS5UcmFkaW5nLkJvdC1SZWFjdFxcXFxBcmsuQWxsaWFuY2UuVHJlbmRzQ2FsY3VsYXRvci5VaVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovUmVwb3MvQXJrLkFsbGlhbmNlLlRyYWRpbmcuQm90LVJlYWN0L0Fyay5BbGxpYW5jZS5UcmVuZHNDYWxjdWxhdG9yLlVpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgICByZWFjdCgpLFxyXG4gICAgICAgIHRhaWx3aW5kY3NzKCksXHJcbiAgICBdLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgICBwb3J0OiAzMDc4LFxyXG4gICAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgICAgICcvYXBpJzoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9sb2NhbGhvc3Q6MzA3NScsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZWN1cmU6IGZhbHNlLCAvLyBBY2NlcHQgc2VsZi1zaWduZWQgY2VydGlmaWNhdGVzXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBmczoge1xyXG4gICAgICAgICAgICAvLyBBbGxvdyBzZXJ2aW5nIGZpbGVzIGZyb20gdGhlIGNvbXBvbmVudCBsaWJyYXJ5XHJcbiAgICAgICAgICAgIGFsbG93OiBbXHJcbiAgICAgICAgICAgICAgICAvLyBQcm9qZWN0IHJvb3RcclxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUpLFxyXG4gICAgICAgICAgICAgICAgLy8gUmVhY3QgQ29tcG9uZW50IFVJIGxpYnJhcnlcclxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9BcmsuQWxsaWFuY2UuUmVhY3QuQ29tcG9uZW50LlVJJyksXHJcbiAgICAgICAgICAgICAgICAvLyBOb2RlIG1vZHVsZXNcclxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdub2RlX21vZHVsZXMnKSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgb3V0RGlyOiAnZGlzdCcsXHJcbiAgICAgICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1osU0FBUyxvQkFBb0I7QUFDL2EsT0FBTyxXQUFXO0FBQ2xCLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sVUFBVTtBQUhqQixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsRUFDaEI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN4QztBQUFBLEVBQ0o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNILFFBQVE7QUFBQSxRQUNKLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQTtBQUFBLE1BQ1o7QUFBQSxJQUNKO0FBQUEsSUFDQSxJQUFJO0FBQUE7QUFBQSxNQUVBLE9BQU87QUFBQTtBQUFBLFFBRUgsS0FBSyxRQUFRLGdDQUFTO0FBQUE7QUFBQSxRQUV0QixLQUFLLFFBQVEsa0NBQVcsb0NBQW9DO0FBQUE7QUFBQSxRQUU1RCxLQUFLLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQzFDO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxFQUNmO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
