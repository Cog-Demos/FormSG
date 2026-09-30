import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import { datadogChunk } from './vite-plugins/datadog'

export default defineConfig({
  base: './',
  envPrefix: 'VITE_APP_',
  plugins: [react(), tsconfigPaths(), svgr(), nodePolyfills(), datadogChunk()],
  server: {
    host: true,
    port: 3000,
    proxy: { '/api': 'http://localhost:5001' },
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
})
