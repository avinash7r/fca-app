// filepath: /d:/VScode/GIT HUB REPOS/full-chatApp/client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: "./postcss.config.js",
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:7777", // backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
