import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@share/trends': path.resolve(__dirname, '../Ark.Alliance.TrendsCalculator.Share/src/index.ts'),
        },
    },
    server: {
        port: 5173,
        // HTTPS disabled - Chrome has SSL cipher mismatch issues with Vite's auto-generated certs
        // Use HTTP for local development
        proxy: {
            '/api': {
                // Backend runs on HTTP by default (or HTTPS if selected at startup)
                target: process.env.VITE_API_URL || 'http://localhost:3001',
                changeOrigin: true,
                secure: false, // Accept self-signed certificates from backend
                ws: true, // Enable WebSocket proxying
            },
            '/socket.io': {
                target: process.env.VITE_API_URL || 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
                ws: true,
            },
        },
        fs: {
            // Allow serving files from the component library
            allow: [
                // Project root
                path.resolve(__dirname),
                // React Component UI library
                path.resolve(__dirname, '../Ark.Alliance.React.Component.UI'),
                // Node modules
                path.resolve(__dirname, 'node_modules'),
            ],
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
