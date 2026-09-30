import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'

import { datadogChunk } from './vite/datadogChunk'
import { compilerOptions } from './tsconfig.paths.json'

// Mirrors the `~*` path aliases in tsconfig.paths.json, e.g.
// `~shared/*` -> `../shared/*` and `~components/*` -> `./src/components/*`.
const tsconfigPathAliases = Object.entries(compilerOptions.paths).map(
  ([alias, [target]]) => ({
    find: new RegExp(`^${alias.replace('/*', '/')}`),
    replacement: `${path.resolve(__dirname, target.replace('/*', ''))}/`,
  }),
)

// Node core modules that webpack 4 (CRA 4) used to polyfill automatically,
// e.g. `stream` for csv-string.
const polyfills = () =>
  nodePolyfills({
    include: ['buffer', 'events', 'stream', 'string_decoder', 'util'],
  })

export default defineConfig({
  // Absolute base: the backend serves index.html for every client-side route
  // (e.g. /admin/form/:id), so relative asset URLs would break on nested paths.
  base: '/',
  plugins: [react(), svgr(), polyfills(), datadogChunk()],
  resolve: {
    alias: [
      ...tsconfigPathAliases,
      // Polyfill shims injected into ../shared sources must resolve from here.
      {
        find: /^vite-plugin-node-polyfills\/shims\/(buffer|global|process)$/,
        replacement: path.resolve(
          __dirname,
          'node_modules/vite-plugin-node-polyfills/shims/$1',
        ),
      },
    ],
    // Deps imported by ../shared that are only installed in frontend/node_modules
    // (webpack fell back to the app's node_modules for these).
    dedupe: ['tweetnacl', 'tweetnacl-util'],
  },
  worker: {
    format: 'es',
    plugins: () => [polyfills()],
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
      // Allow serving files from ../shared
      allow: ['..'],
    },
  },
  build: {
    outDir: '../dist/frontend',
    emptyOutDir: true,
    assetsDir: 'static',
    sourcemap: true,
    // The backend CSP disallows inline scripts.
    modulePreload: { polyfill: false },
  },
})
