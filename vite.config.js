import { defineConfig } from 'vite';

export default defineConfig({
  // relative asset paths so the bundle works from any sub-path, including
  // GitHub Pages project sites served at /<repo>/
  base: './',
  server: {
    host: '0.0.0.0',
    port: 12000,
    strictPort: true,
    // the sandbox proxies this server through a generated *.prod-runtime.all-hands.dev host
    allowedHosts: ['.prod-runtime.all-hands.dev'],
  },
  preview: {
    host: '0.0.0.0',
    port: 12000,
    strictPort: true,
    allowedHosts: ['.prod-runtime.all-hands.dev'],
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
});