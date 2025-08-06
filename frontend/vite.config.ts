import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // This prevents Vite from trying other ports if 5173 is busy
    host: true, // Allow external connections
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});