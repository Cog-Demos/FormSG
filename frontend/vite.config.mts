import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, HtmlTagDescriptor, Plugin } from 'vite'
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

const DATADOG_ENTRY = 'datadog-chunk'

/**
 * Loads the Datadog RUM chunk from `<head>` as an external module script so it
 * runs before the app bundle. The backend CSP forbids inline scripts, hence a
 * separate file instead of inlined code.
 */
const datadogHeadChunk = (): Plugin => {
  let datadogFileName: string | undefined
  return {
    name: 'formsg:datadog-head-chunk',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (
          chunk.type === 'chunk' &&
          chunk.isEntry &&
          chunk.name === DATADOG_ENTRY
        ) {
          datadogFileName = chunk.fileName
        }
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler: (): HtmlTagDescriptor[] => {
        if (!datadogFileName) return []
        return [
          {
            tag: 'script',
            attrs: {
              type: 'module',
              crossorigin: true,
              src: `./${datadogFileName}`,
            },
            injectTo: 'head-prepend',
          },
        ]
      },
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tsconfigPaths(), svgr(), polyfills(), datadogHeadChunk()],
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
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        [DATADOG_ENTRY]: fileURLToPath(
          new URL('./datadog-chunk.ts', import.meta.url),
        ),
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
})
