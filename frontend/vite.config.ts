import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import packageJson from './package.json'
import { buildOptions, buildPlugins } from './vite.build'

// Injected shim imports must resolve from ../shared too, which has no copy of the plugin.
const polyfillShimsDir = path.resolve(
  __dirname,
  'node_modules/vite-plugin-node-polyfills/shims',
)

// Owned by TICKET-A, except `build` and build-only plugins (vite.build.ts, TICKET-B).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tsconfigPaths(),
    svgr(),
    // csv-string's Streamer extends Node's `stream.Transform` at module load.
    nodePolyfills({
      include: ['stream'],
      globals: { Buffer: false, global: true, process: true },
    }),
    ...buildPlugins,
  ],
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
