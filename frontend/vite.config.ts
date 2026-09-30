import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import { datadogChunk } from './vite/datadog'

export default defineConfig({
  base: './',
  plugins: [react(), tsconfigPaths(), svgr(), nodePolyfills(), datadogChunk()],
  server: {
    host: true,
    port: 3000,
    proxy: { '/api': 'http://localhost:5001' },
    fs: { allow: ['.', '../shared'] },
  },
  build: { outDir: '../dist/frontend', emptyOutDir: true, sourcemap: true },
})
