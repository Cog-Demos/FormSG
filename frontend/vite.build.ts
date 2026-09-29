import path from 'node:path'
import {
  build,
  type BuildOptions,
  isCSSRequest,
  loadEnv,
  type Plugin,
  type PluginOption,
  type ResolvedConfig,
  type Rollup,
} from 'vite'

// Owned by TICKET-B: production build options and build-only plugins
// (separate Datadog chunk). Consumed by vite.config.ts.

const DATADOG_ENTRY = 'datadog-chunk.ts'
const JS_DIR = 'static/js'

const isStaticallyImportedByEntry = (
  id: string,
  getModuleInfo: Rollup.GetModuleInfo,
  cache: Map<string, boolean>,
  importStack: string[] = [],
): boolean => {
  const cached = cache.get(id)
  if (cached !== undefined) return cached
  if (importStack.includes(id)) {
    cache.set(id, false)
    return false
  }
  const mod = getModuleInfo(id)
  if (!mod) {
    cache.set(id, false)
    return false
  }
  if (mod.isEntry) {
    cache.set(id, true)
    return true
  }
  const result = mod.importers.some((importer) =>
    isStaticallyImportedByEntry(
      importer,
      getModuleInfo,
      cache,
      importStack.concat(id),
    ),
  )
  cache.set(id, result)
  return result
}

/**
 * Moves node_modules that the entry imports statically into a `vendor` chunk;
 * dependencies of lazy routes stay in their lazy chunks. Rendering the
 * sourcemap of one ~6.5 MB entry chunk otherwise needs ~7.4 GB of heap.
 */
const createVendorChunks = (): Rollup.ManualChunksOption => {
  const cache = new Map<string, boolean>()
  return (id, { getModuleInfo }) => {
    if (
      id.includes('/node_modules/') &&
      !isCSSRequest(id) &&
      isStaticallyImportedByEntry(id, getModuleInfo, cache)
    ) {
      return 'vendor'
    }
  }
}

// Everything the app emits lives under `static/`, which the backend serves
// from dist/frontend and falls back to the S3 static assets bucket for.
export const buildOptions: BuildOptions = {
  outDir: '../dist/frontend',
  emptyOutDir: true,
  sourcemap: true,
  assetsDir: 'static',
  rollupOptions: {
    output: {
      manualChunks: createVendorChunks(),
      entryFileNames: `${JS_DIR}/[name].[hash].js`,
      chunkFileNames: `${JS_DIR}/[name].[hash].chunk.js`,
      assetFileNames: ({ name }) =>
        name?.endsWith('.css')
          ? 'static/css/[name].[hash][extname]'
          : 'static/media/[name].[hash][extname]',
    },
  },
}

const isRelativeBase = (base: string) => base === '' || base.startsWith('.')

/**
 * Bundles datadog-chunk.ts into a self-contained classic script
 * (static/js/datadog-chunk.[hash].js, IIFE, nothing shared with the app) and
 * references it from <head> of every built HTML page, before the app scripts,
 * so that Datadog RUM is initialised before the app. The chunk is always an
 * external file: the CSP forbids inline scripts.
 */
const datadogChunkPlugin = (): Plugin => {
  let config: ResolvedConfig
  let chunkFileName: string | undefined

  return {
    name: 'formsg:datadog-chunk',
    apply: 'build',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    async buildStart() {
      const entry = path.resolve(config.root, DATADOG_ENTRY)
      this.addWatchFile(entry)

      // The RUM version must match the sourcemap upload's --release-version,
      // so an explicit VITE_APP_VERSION (env or .env file) wins over `define`.
      const { VITE_APP_VERSION } = loadEnv(
        config.mode,
        config.envDir,
        config.envPrefix,
      )

      const result = await build({
        configFile: false,
        root: config.root,
        mode: config.mode,
        envDir: config.envDir,
        envPrefix: config.envPrefix,
        define: {
          ...config.define,
          ...(VITE_APP_VERSION && {
            'import.meta.env.VITE_APP_VERSION':
              JSON.stringify(VITE_APP_VERSION),
          }),
        },
        publicDir: false,
        logLevel: 'warn',
        build: {
          write: false,
          target: config.build.target,
          minify: config.build.minify,
          sourcemap: config.build.sourcemap,
          modulePreload: false,
          copyPublicDir: false,
          reportCompressedSize: false,
          rollupOptions: {
            input: entry,
            output: {
              format: 'iife',
              entryFileNames: `${JS_DIR}/datadog-chunk.[hash].js`,
            },
          },
        },
      })
      if (Array.isArray(result) || !('output' in result)) {
        throw new Error('Unexpected Datadog chunk build result')
      }

      chunkFileName = undefined
      for (const file of result.output) {
        if (file.type === 'chunk' && file.isEntry) {
          chunkFileName = file.fileName
        }
        this.emitFile({
          type: 'asset',
          fileName: file.fileName,
          source: file.type === 'chunk' ? file.code : file.source,
        })
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!chunkFileName) {
          throw new Error('Datadog chunk was not built')
        }
        const src = isRelativeBase(config.base)
          ? `./${path.posix.relative(
              path.posix.dirname(ctx.path),
              `/${chunkFileName}`,
            )}`
          : `${config.base}${chunkFileName}`
        const tag = `<script src="${src}"></script>\n    `

        // Insert before the app's first script / modulepreload in <head>, but
        // after <base>, so that it runs first and resolves against <base>.
        const headEnd = html.indexOf('</head>')
        if (headEnd === -1) {
          throw new Error(`No </head> in ${ctx.path}`)
        }
        const firstScript = html
          .slice(0, headEnd)
          .search(/<script\b|<link\b[^>]*\brel=["']?modulepreload/)
        const insertAt = firstScript === -1 ? headEnd : firstScript
        return html.slice(0, insertAt) + tag + html.slice(insertAt)
      },
    },
  }
}

export const buildPlugins: PluginOption[] = [datadogChunkPlugin()]
