import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

// `csv-string` extends `stream.Transform` at module load and several
// dependencies (formsg-sdk, jszip, tweetnacl-util) expect a global `Buffer`.
const polyfills = () =>
  nodePolyfills({
    include: ['buffer', 'events', 'stream', 'string_decoder', 'util'],
    globals: { Buffer: true, global: true, process: false },
  })

// Modules under `../shared/node_modules` cannot resolve the polyfill shims
// injected by vite-plugin-node-polyfills, so pin them to absolute paths.
const require = createRequire(import.meta.url)
const polyfillShims = Object.fromEntries(
  ['buffer', 'global'].map((shim) => [
    `vite-plugin-node-polyfills/shims/${shim}`,
    require.resolve(`vite-plugin-node-polyfills/shims/${shim}`),
  ]),
)

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tsconfigPaths(), svgr(), polyfills()],
  resolve: {
    alias: polyfillShims,
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(
      process.env.npm_package_version ?? '',
    ),
  },
  server: {
    port: 3000,
    proxy: {
      // Replaces the CRA "proxy" field and src/setupProxy.js
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
    fs: {
      allow: [
        fileURLToPath(new URL('.', import.meta.url)),
        fileURLToPath(new URL('../shared', import.meta.url)),
        fileURLToPath(new URL('../node_modules', import.meta.url)),
      ],
    },
  },
  worker: {
    format: 'es',
    plugins: () => [tsconfigPaths(), polyfills()],
  },
  build: {
    outDir: '../dist/frontend',
    emptyOutDir: true,
    sourcemap: true,
    // TICKET-B (MBA-2855): add `rollupOptions` here for the separate Datadog
    // entry (datadog-chunk.ts). Do not add other build options in TICKET-A.
  },
})
