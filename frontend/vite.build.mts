import path from 'node:path'
import {
  build,
  type BuildOptions,
  type Plugin,
  type PluginOption,
  type ResolvedConfig,
} from 'vite'

// Owned by TICKET-B: production build options and build-only plugins
// (separate Datadog chunk). Consumed by vite.config.mts.

const DATADOG_ENTRY = 'datadog-chunk.ts'
const JS_DIR = 'static/js'

// Everything the app emits lives under `static/`, which the backend serves
// from dist/frontend and falls back to the S3 static assets bucket for.
export const buildOptions: BuildOptions = {
  outDir: '../dist/frontend',
  emptyOutDir: true,
  sourcemap: true,
  assetsDir: 'static',
  rollupOptions: {
    output: {
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
 * (static/js/datadog-chunk.[hash].js, IIFE, no imports shared with the app)
 * and references it from <head> of every built HTML page so Datadog RUM is
 * initialised before the app. The chunk is always an external file: the CSP
 * forbids inline scripts.
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

      const result = await build({
        configFile: false,
        root: config.root,
        mode: config.mode,
        envDir: config.envDir,
        envPrefix: config.envPrefix,
        define: config.define,
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
      if (!('output' in result)) {
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
