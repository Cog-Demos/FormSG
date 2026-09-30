import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import { datadogChunk } from './vite-plugins/datadog'
import { version } from './package.json'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_APP_')
  const appVersion =
    env.VITE_APP_VERSION ?? process.env.npm_package_version ?? version

  return {
    base: './',
    envPrefix: 'VITE_APP_',
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },
    plugins: [
      react(),
      tsconfigPaths(),
      svgr(),
      nodePolyfills(),
      datadogChunk(),
    ],
    resolve: {
      alias: [
        {
          // Lets modules under ../shared/node_modules resolve the polyfill shims
          find: /^vite-plugin-node-polyfills\/shims\/(buffer|global|process)$/,
          replacement: path.resolve(
            __dirname,
            'node_modules/vite-plugin-node-polyfills/shims/$1',
          ),
        },
      ],
    },
    worker: {
      format: 'es',
      plugins: () => [tsconfigPaths(), nodePolyfills()],
    },
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/api': { target: 'http://localhost:5001', changeOrigin: true },
      },
      fs: { allow: ['..'] },
    },
    build: {
      outDir: '../dist/frontend',
      emptyOutDir: true,
      sourcemap: true,
      assetsDir: 'static',
      chunkSizeWarningLimit: 2048,
      rollupOptions: {
        output: {
          entryFileNames: 'static/js/[name].[hash].js',
          chunkFileNames: 'static/js/[name].[hash].chunk.js',
          assetFileNames: ({ name }) =>
            name?.endsWith('.css')
              ? 'static/css/[name].[hash][extname]'
              : 'static/media/[name].[hash][extname]',
        },
      },
    },
  }
})
