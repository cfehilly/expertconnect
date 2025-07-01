import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/',
  // --- ADD THIS LINE ---
  root: './', // This tells Vite to look for index.html in the project root (where public is)
  // --- END ADDITION ---
});