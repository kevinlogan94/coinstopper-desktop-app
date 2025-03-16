import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    sourcemap: true,
    outDir: '.vite/build',
    target: 'node18',
    minify: false,
    rollupOptions: {
      external: ['electron']
    }
  }
});
