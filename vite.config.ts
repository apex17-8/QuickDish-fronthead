// vite.config.ts - UNCOMMENT the proxy section:
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwind()],

  server: {
    port: 5173,
    strictPort: true,
    host: true,

    // 🔥 UNCOMMENT THIS - It will fix CORS in development
    proxy: {
      '/api': {
        target: 'https://quickdish-backend-2b6x.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
    },
  },

  preview: {
    port: 5173,
    host: true,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    sourcemap: false,
  },
});