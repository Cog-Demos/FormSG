import path from 'path'
import { build, type Plugin, type ResolvedConfig, type Rollup } from 'vite'

const DATADOG_ENTRY = 'datadog-chunk.ts'
const DATADOG_FILE_NAMES = 'static/js/datadog-chunk.[hash].js'

/**
 * Bundles `datadog-chunk.ts` into a standalone classic script under
 * `static/js/` and loads it from the `<head>` of `index.html`, so that
 * Datadog RUM is initialised before the React app without inline scripts.
 */
export const datadogChunk = (): Plugin => {
  let config: ResolvedConfig
  let chunkFileName: string | undefined

  return {
    name: 'formsg:datadog-chunk',
    apply: 'build',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    async buildStart() {
      const result = (await build({
        configFile: false,
        root: config.root,
        mode: config.mode,
        envDir: config.envDir,
        envPrefix: config.envPrefix,
        define: config.define,
        logLevel: 'warn',
        publicDir: false,
        build: {
          write: false,
          copyPublicDir: false,
          emptyOutDir: false,
          minify: config.build.minify,
          sourcemap: config.build.sourcemap,
          target: config.build.target,
          modulePreload: false,
          rollupOptions: {
            input: path.resolve(config.root, DATADOG_ENTRY),
            output: {
              format: 'iife',
              entryFileNames: DATADOG_FILE_NAMES,
            },
          },
        },
      })) as Rollup.RollupOutput | Rollup.RollupOutput[]

      const outputs = Array.isArray(result) ? result : [result]
      for (const { output } of outputs) {
        for (const file of output) {
          if (file.type === 'chunk') {
            chunkFileName = file.fileName
            this.emitFile({
              type: 'asset',
              fileName: file.fileName,
              source: file.code,
            })
          } else {
            this.emitFile({
              type: 'asset',
              fileName: file.fileName,
              source: file.source,
            })
          }
        }
      }
    },
    transformIndexHtml() {
      if (!chunkFileName) {
        throw new Error(`[formsg:datadog-chunk] ${DATADOG_ENTRY} was not built`)
      }
      const base = config.base === '' ? './' : config.base
      return [
        {
          tag: 'script',
          attrs: { src: `${base}${chunkFileName}` },
          injectTo: 'head',
        },
      ]
    },
  }
}
