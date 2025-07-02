import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/', // Ensure this is set for correct asset paths
  build: {
    outDir: 'dist', // Ensure output directory is 'dist'
    // --- NEW ADDITIONS FOR BUILD CONFIG ---
    copyPublicDir: true, // Explicitly copy public directory contents
    rollupOptions: {
      input: {
        main: 'index.html' // Explicitly set index.html as the main entry point
      },
      output: {
        // Ensure entry files get a hash for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // --- END NEW ADDITIONS ---
  },
});