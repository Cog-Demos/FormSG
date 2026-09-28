import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import { buildOptions, buildPlugins } from './vite.build.mts'

const appVersion =
  process.env.npm_package_version ??
  (JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
    .version as string)

// `stream` (and the `process` global readable-stream reads at load time) is
// required by csv-string's Streamer.
const nodePolyfillsOptions = {
  include: ['stream'],
  globals: { Buffer: false, global: false, process: true },
} satisfies Parameters<typeof nodePolyfills>[0]

// The injected shim import must also resolve from files outside this package
// (e.g. `../shared/node_modules`).
const processShimPath = fileURLToPath(
  new URL(
    './node_modules/vite-plugin-node-polyfills/shims/process/dist/index.js',
    import.meta.url,
  ),
)

// Owned by TICKET-A, except `build` (see vite.build.mts, TICKET-B).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tsconfigPaths(),
    svgr(),
    nodePolyfills(nodePolyfillsOptions),
    ...buildPlugins,
  ],
  resolve: {
    alias: {
      'vite-plugin-node-polyfills/shims/process': processShimPath,
    },
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
  },
  optimizeDeps: {
    include: ['p-queue'],
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
    fs: {
      allow: ['.', '..', '../shared'],
    },
  },
  worker: {
    format: 'es',
    plugins: () => [tsconfigPaths(), nodePolyfills(nodePolyfillsOptions)],
  },
  build: buildOptions,
})
