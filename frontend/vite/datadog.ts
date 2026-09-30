import path from 'path'
import { build, Plugin, ResolvedConfig } from 'vite'

/**
 * Bundles datadog-chunk.ts as a standalone classic script and loads it from
 * the <head> of index.html, so that Datadog RUM is initialised before the
 * React app. Emitted as an external file because the CSP forbids inline scripts.
 */
export const datadogChunk = (): Plugin => {
  let config: ResolvedConfig
  let chunkFileName: string

  return {
    name: 'formsg:datadog-chunk',
    apply: 'build',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    async buildStart() {
      const result = await build({
        configFile: false,
        envFile: false,
        root: config.root,
        mode: config.mode,
        logLevel: 'warn',
        publicDir: false,
        build: {
          write: false,
          copyPublicDir: false,
          emptyOutDir: false,
          sourcemap: config.build.sourcemap,
          modulePreload: false,
          rollupOptions: {
            input: path.resolve(config.root, 'datadog-chunk.ts'),
            output: {
              format: 'iife',
              entryFileNames: 'static/js/datadog-chunk.[hash].js',
            },
          },
        },
      })
      const outputs = Array.isArray(result) ? result : [result]
      for (const output of outputs) {
        if (!('output' in output)) {
          throw new Error(
            'Unexpected watcher returned from Datadog chunk build',
          )
        }
        for (const file of output.output) {
          if (file.type === 'chunk' && file.isEntry) {
            chunkFileName = file.fileName
          }
          this.emitFile({
            type: 'asset',
            fileName: file.fileName,
            source: file.type === 'chunk' ? file.code : file.source,
          })
        }
      }
      if (!chunkFileName) {
        throw new Error('Datadog chunk build did not emit an entry chunk')
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler: () => [
        {
          tag: 'script',
          attrs: { src: `${config.base}${chunkFileName}` },
          injectTo: 'head',
        },
      ],
    },
  }
}
