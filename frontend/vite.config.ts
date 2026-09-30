/// <reference types="node" />
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'

import { version } from './package.json'
import { datadogChunk } from './vite/datadogChunk'

process.env.VITE_APP_VERSION ??= version

// https://vitejs.dev/config/
export default defineConfig(async () => {
  // vite-tsconfig-paths is ESM-only, and this config is bundled as CommonJS.
  const { default: tsconfigPaths } = await import('vite-tsconfig-paths')

  return {
    base: './',
    plugins: [
      react(),
      tsconfigPaths(),
      svgr(),
      // csv-string imports `stream`.
      nodePolyfills({ include: ['stream'] }),
      datadogChunk(),
    ],
    resolve: {
      // p-queue's "exports" field does not expose the `p-queue/dist` subpath.
      alias: [
        { find: /^p-queue\/dist$/, replacement: 'p-queue' },
        // Lets modules outside this package (e.g. ../shared) resolve the injected polyfill globals.
        {
          find: /^vite-plugin-node-polyfills\/shims\/(buffer|global|process)$/,
          replacement: path.resolve(
            __dirname,
            'node_modules/vite-plugin-node-polyfills/shims/$1/dist/index.js',
          ),
        },
      ],
    },
    worker: {
      format: 'es',
      plugins: () => [tsconfigPaths(), nodePolyfills({ include: ['stream'] })],
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
    },
  }
})
