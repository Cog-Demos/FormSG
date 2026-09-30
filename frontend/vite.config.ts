import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

// csv-string extends `stream.Transform`.
const polyfills = () => nodePolyfills({ include: ['stream'] })

export default defineConfig({
  base: './',
  plugins: [react(), tsconfigPaths(), svgr(), polyfills()],
  resolve: {
    // Resolve polyfill shims injected into ../shared/node_modules from here.
    dedupe: ['vite-plugin-node-polyfills'],
  },
  worker: {
    format: 'es',
    plugins: () => [tsconfigPaths(), polyfills()],
  },
  server: {
    host: true,
    port: 3000,
    proxy: { '/api': 'http://localhost:5001' },
    fs: { allow: ['.', '../shared'] },
  },
  build: { outDir: '../dist/frontend', emptyOutDir: true, sourcemap: true },
})
