import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import { datadogChunk } from './vite/datadogChunk'
import { version } from './package.json'

const polyfills = () =>
  nodePolyfills({
    include: ['buffer', 'events', 'stream', 'url', 'util'],
  })

export default defineConfig({
  base: '/',
  plugins: [react(), tsconfigPaths(), svgr(), polyfills(), datadogChunk()],
  worker: {
    format: 'es',
    plugins: () => [tsconfigPaths(), polyfills()],
  },
  resolve: {
    alias: [
      // Polyfill shims injected into ../shared dependencies must resolve from here
      {
        find: /^vite-plugin-node-polyfills\/shims\/(buffer|global|process)$/,
        replacement: path.resolve(
          __dirname,
          'node_modules/vite-plugin-node-polyfills/shims/$1',
        ),
      },
    ],
  },
  envPrefix: 'VITE_APP_',
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5001',
    },
    fs: {
      // Allow serving files from ../shared
      allow: ['..'],
    },
  },
  build: {
    outDir: '../dist/frontend',
    emptyOutDir: true,
    assetsDir: 'static',
    sourcemap: 'hidden',
  },
})
