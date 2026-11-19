import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: base './' makes assets relative so the app works
// under https://<user>.github.io/<repo>/ without server config.
// PWA is handled via public/manifest.webmanifest + public/sw.js
// (registered in src/main.tsx) to keep the build dependency-free.
export default defineConfig({
  define: {
    __BUILD_STAMP__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')),
  },
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          qr: ['qr-code-styling'],
          exporters: ['jspdf', 'jszip', 'file-saver', 'html2canvas'],
          motion: ['framer-motion', 'cmdk', 'colord'],
        },
      },
    },
  },
  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 4173, allowedHosts: true },
})
