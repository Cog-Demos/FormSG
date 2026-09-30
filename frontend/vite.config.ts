import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import { datadogChunk } from './vite/datadogChunk'

export default defineConfig({
  base: './',
  plugins: [react(), tsconfigPaths(), svgr(), datadogChunk()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:5001', changeOrigin: true },
    },
  },
  build: {
    outDir: '../dist/frontend',
    emptyOutDir: true,
    sourcemap: true,
  },
})
