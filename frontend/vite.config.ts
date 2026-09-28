/* eslint-env node */
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, HtmlTagDescriptor, Plugin } from 'vite'

// Minimal config for TICKET-B. TICKET-A owns everything outside `build`;
// TICKET-G merges the two files.

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

export default defineConfig(async () => {
  // vite-tsconfig-paths@5 is ESM-only and frontend/package.json is CJS, so it
  // has to be loaded with a dynamic import.
  const { default: tsconfigPaths } = await import('vite-tsconfig-paths')

  return {
    base: './',
    plugins: [react(), tsconfigPaths(), datadogHeadChunk()],

    // TICKET-B owns build.* below
    build: {
      outDir: '../dist/frontend',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          [DATADOG_ENTRY]: path.resolve(__dirname, 'datadog-chunk.ts'),
        },
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash][extname]',
        },
      },
    },
  }
})
