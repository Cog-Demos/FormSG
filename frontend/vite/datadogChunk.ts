import path from 'path'
import { build, Plugin, ResolvedConfig } from 'vite'

const DATADOG_ENTRY = 'datadog-chunk.ts'
const DATADOG_FILE_NAME = 'static/js/datadog-chunk.[hash].js'

const isAppHtmlBuild = (config: ResolvedConfig) => {
  const input = config.build.rollupOptions.input
  if (input === undefined) return true
  const inputs =
    typeof input === 'string'
      ? [input]
      : Array.isArray(input)
        ? input
        : Object.values(input)
  const appHtml = path.resolve(config.root, 'index.html')
  return inputs.some((i) => path.resolve(config.root, i) === appHtml)
}

/**
 * Bundles datadog-chunk.ts as a standalone classic script and loads it from
 * the <head> of index.html, so that Datadog RUM is initialised (and
 * window.DD_RUM is defined) before the app bundle runs.
 * The chunk is an external file since the CSP forbids inline scripts.
 */
export const datadogChunk = (): Plugin => {
  let config: ResolvedConfig
  let chunkFileName: string | undefined

  return {
    name: 'formsg:datadog-chunk',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    async buildStart() {
      if (config.command !== 'build' || !isAppHtmlBuild(config)) return

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
          copyPublicDir: false,
          sourcemap: config.build.sourcemap,
          minify: config.build.minify,
          target: config.build.target,
          rollupOptions: {
            input: path.resolve(config.root, DATADOG_ENTRY),
            output: {
              format: 'iife',
              entryFileNames: DATADOG_FILE_NAME,
            },
          },
        },
      })

      if (!('output' in result)) {
        throw new Error('Unexpected Datadog chunk build result')
      }

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
    transformIndexHtml(_html, ctx) {
      if (ctx.filename !== path.resolve(config.root, 'index.html')) return

      if (config.command === 'serve') {
        return [
          {
            tag: 'script',
            attrs: {
              type: 'module',
              src: `/${DATADOG_ENTRY}`,
            },
            injectTo: 'head',
          },
        ]
      }

      if (!chunkFileName) {
        throw new Error('Datadog chunk was not built')
      }
      return [
        {
          tag: 'script',
          attrs: { src: `${config.base}${chunkFileName}` },
          injectTo: 'head',
        },
      ]
    },
  }
}
