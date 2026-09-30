import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { datadogChunk } from './vite/datadogChunk'

export default defineConfig({
  base: './',
  envPrefix: 'VITE_APP_',
  plugins: [react(), tsconfigPaths(), datadogChunk()],
  build: {
    outDir: '../dist/frontend',
    emptyOutDir: true,
    assetsDir: 'static',
    sourcemap: true,
  },
})
