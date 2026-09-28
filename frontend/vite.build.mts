import { fileURLToPath } from 'node:url'
import type { BuildOptions, Plugin, PluginOption } from 'vite'

const DATADOG_ENTRY = 'datadog-chunk'

const resolveFromHere = (file: string) =>
  fileURLToPath(new URL(file, import.meta.url))

// Owned by TICKET-B: production build options and build-only plugins
// (separate Datadog chunk). Consumed by vite.config.mts.
export const buildOptions: BuildOptions = {
  outDir: '../dist/frontend',
  emptyOutDir: true,
  sourcemap: true,
  assetsDir: 'static',
  // The main app entry is ~7 MB minified (kB).
  chunkSizeWarningLimit: 8192,
  // The CSP forbids inline scripts, so no inline modulepreload polyfill.
  modulePreload: { polyfill: false },
  commonjsOptions: { transformMixedEsModules: true },
  rollupOptions: {
    input: {
      main: resolveFromHere('./index.html'),
      [DATADOG_ENTRY]: resolveFromHere('./datadog-chunk.ts'),
    },
    output: {
      entryFileNames: 'static/js/[name]-[hash].js',
      chunkFileNames: 'static/js/[name]-[hash].js',
    },
  },
}

/**
 * Injects the Datadog entry as an external `<script type="module">` into
 * `<head>`, before the main app entry, so that RUM is initialised before the
 * React app runs.
 */
const injectDatadogChunk = (): Plugin => {
  let base = './'
  return {
    name: 'formsg:inject-datadog-chunk',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const chunk = Object.values(ctx.bundle ?? {}).find(
          (output) =>
            output.type === 'chunk' &&
            output.isEntry &&
            output.name === DATADOG_ENTRY,
        )
        if (!chunk) {
          throw new Error(`[${DATADOG_ENTRY}] entry chunk not found in bundle`)
        }
        const tag = `<script type="module" crossorigin src="${base}${chunk.fileName}"></script>`
        const firstModuleScript = html.search(/<script\b[^>]*type="module"/)
        if (firstModuleScript === -1) {
          return html.replace('</head>', `  ${tag}\n  </head>`)
        }
        return `${html.slice(0, firstModuleScript)}${tag}\n    ${html.slice(firstModuleScript)}`
      },
    },
  }
}

export const buildPlugins: PluginOption[] = [injectDatadogChunk()]
