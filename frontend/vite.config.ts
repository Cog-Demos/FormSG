import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import { version } from './package.json'
import { buildOptions, buildPlugins } from './vite.build'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tsconfigPaths(),
    svgr(),
    // csv-string's Streamer extends `stream.Transform` at module load.
    nodePolyfills({
      include: ['stream'],
      globals: { Buffer: false, global: false, process: false },
    }),
    ...buildPlugins,
  ],
  worker: {
    format: 'es',
    plugins: () => [tsconfigPaths()],
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
    fs: {
      allow: ['.', '../shared'],
    },
  },
  build: {
    outDir: '../dist/frontend',
    emptyOutDir: true,
    sourcemap: true,
    ...buildOptions,
  },
})
