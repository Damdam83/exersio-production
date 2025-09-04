import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Important pour mobile dev
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Optimisations pour mobile
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  },
  // Support pour les anciens navigateurs mobiles
  define: {
    global: 'globalThis'
  }
});
