import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import packageJson from './package.json'
import { buildOptions, buildPlugins } from './vite.build.mts'

// Absolute shim paths so injected imports also resolve from ../shared.
const polyfillShimsDir = fileURLToPath(
  new URL('./node_modules/vite-plugin-node-polyfills/shims', import.meta.url),
)
// csv-string's Streamer extends Node's `stream.Transform` at module load.
const polyfills = () =>
  nodePolyfills({
    include: ['stream'],
    globals: { Buffer: false, global: true, process: true },
  })

// Owned by TICKET-A, except `build` (see vite.build.mts, TICKET-B).
export default defineConfig({
  base: './',
  plugins: [react(), tsconfigPaths(), svgr(), polyfills(), ...buildPlugins],
  resolve: {
    alias: [
      {
        find: /^vite-plugin-node-polyfills\/shims\/(global|process)$/,
        replacement: `${polyfillShimsDir}/$1/dist/index.js`,
      },
    ],
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  },
  worker: {
    format: 'es',
    plugins: () => [tsconfigPaths()],
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), '../shared'],
    },
  },
  build: buildOptions,
})
