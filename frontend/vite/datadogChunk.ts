import path from 'path'
import { build, Plugin, ResolvedConfig } from 'vite'

const DATADOG_CHUNK_ENTRY = 'datadog-chunk.ts'

/**
 * Bundles `datadog-chunk.ts` into a standalone IIFE script and loads it from
 * `<head>` via `<script src>` ahead of the app entry, so that Datadog RUM is
 * initialised before the React app. The chunk is never inlined because the
 * backend CSP forbids inline scripts.
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
      const result = await build({
        configFile: false,
        root: config.root,
        mode: config.mode,
        envDir: config.envDir,
        envPrefix: config.envPrefix,
        publicDir: false,
        logLevel: 'warn',
        build: {
          write: false,
          target: config.build.target,
          minify: config.build.minify,
          sourcemap: config.build.sourcemap,
          modulePreload: false,
          rollupOptions: {
            input: path.resolve(config.root, DATADOG_CHUNK_ENTRY),
            output: {
              format: 'iife',
              entryFileNames: path.posix.join(
                config.build.assetsDir,
                'datadog-chunk.[hash].js',
              ),
            },
          },
        },
      })

      const outputs = Array.isArray(result) ? result : [result]
      for (const output of outputs) {
        if (!('output' in output)) {
          throw new Error('Unexpected watcher returned for Datadog chunk build')
        }
        for (const file of output.output) {
          if (file.type === 'chunk') {
            if (file.isEntry) chunkFileName = file.fileName
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

      if (!chunkFileName) {
        throw new Error('Datadog chunk build emitted no entry chunk')
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler() {
        if (!chunkFileName) return
        return [
          {
            tag: 'script',
            attrs: { src: `${config.base}${chunkFileName}` },
            injectTo: 'head-prepend',
          },
        ]
      },
    },
  }
}
