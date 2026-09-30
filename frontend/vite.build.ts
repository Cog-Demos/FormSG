import path from 'node:path'
import {
  build,
  type BuildOptions,
  type HtmlTagDescriptor,
  isCSSRequest,
  type Plugin,
  type PluginOption,
  type ResolvedConfig,
  type Rollup,
} from 'vite'

const DATADOG_CHUNK_ENTRY = 'datadog-chunk.ts'

const isStaticallyImportedByEntry = (
  id: string,
  getModuleInfo: Rollup.GetModuleInfo,
  cache: Map<string, boolean>,
  visiting = new Set<string>(),
): boolean => {
  const cached = cache.get(id)
  if (cached !== undefined) return cached
  const mod = getModuleInfo(id)
  if (!mod || visiting.has(id)) return false
  if (mod.isEntry) {
    cache.set(id, true)
    return true
  }
  visiting.add(id)
  const result = mod.importers.some((importer) =>
    isStaticallyImportedByEntry(importer, getModuleInfo, cache, visiting),
  )
  visiting.delete(id)
  cache.set(id, result)
  return result
}

/**
 * Moves node_modules that the entry imports statically into a `vendor` chunk,
 * leaving dependencies of lazy routes in their own chunks. Rendering the
 * sourcemap of a single multi-megabyte entry chunk otherwise exhausts a 4 GB
 * heap.
 */
const vendorChunk = (): Rollup.ManualChunksOption => {
  const cache = new Map<string, boolean>()
  return (id, { getModuleInfo }) =>
    id.includes('/node_modules/') &&
    !isCSSRequest(id) &&
    isStaticallyImportedByEntry(id, getModuleInfo, cache)
      ? 'vendor'
      : undefined
}

export const buildOptions: BuildOptions = {
  outDir: '../dist/frontend',
  emptyOutDir: true,
  // Sourcemaps are uploaded to Datadog and then deleted by Dockerfile.production;
  // 'hidden' omits the sourceMappingURL comment from the served bundles.
  sourcemap: 'hidden',
  // Everything lives under /static so the backend can fall back to the S3
  // static bucket for assets of previous deployments.
  assetsDir: 'static',
  rollupOptions: {
    output: {
      manualChunks: vendorChunk(),
      entryFileNames: 'static/js/[name].[hash].js',
      chunkFileNames: 'static/js/[name].[hash].chunk.js',
      assetFileNames: ({ name }) =>
        name?.endsWith('.css')
          ? 'static/css/[name].[hash][extname]'
          : 'static/media/[name].[hash][extname]',
    },
  },
}

const isAppHtmlBuild = (config: ResolvedConfig): boolean => {
  if (config.build.ssr || config.build.lib) return false
  const appHtml = path.resolve(config.root, 'index.html')
  const { input } = config.build.rollupOptions
  if (input === undefined) return true
  const inputs =
    typeof input === 'string'
      ? [input]
      : Array.isArray(input)
        ? input
        : Object.values(input)
  return inputs.some((entry) => path.resolve(config.root, entry) === appHtml)
}

/**
 * Bundles datadog-chunk.ts into a standalone classic script
 * (static/js/datadog-chunk.[hash].js) and loads it from <head> with a
 * <script src> tag, so Datadog RUM is initialised before the React app.
 * The CSP disallows inline scripts, so the chunk is never inlined.
 */
const datadogChunk = (): Plugin => {
  let config: ResolvedConfig
  let enabled = false
  let scriptFileName: string | undefined

  return {
    name: 'formsg:datadog-chunk',
    apply: (_config, { command, mode }) =>
      command === 'build' && mode === 'production',
    configResolved(resolvedConfig) {
      config = resolvedConfig
      enabled = isAppHtmlBuild(resolvedConfig)
    },
    async buildStart() {
      if (!enabled) return
      const result = await build({
        configFile: false,
        root: config.root,
        mode: config.mode,
        envDir: config.envDir,
        envPrefix: config.envPrefix,
        publicDir: false,
        logLevel: 'warn',
        define: config.env.VITE_APP_VERSION
          ? {}
          : {
              'import.meta.env.VITE_APP_VERSION': JSON.stringify(
                process.env.npm_package_version ?? '',
              ),
            },
        build: {
          write: false,
          copyPublicDir: false,
          modulePreload: false,
          reportCompressedSize: false,
          target: config.build.target,
          minify: config.build.minify,
          sourcemap: config.build.sourcemap,
          rollupOptions: {
            input: path.resolve(config.root, DATADOG_CHUNK_ENTRY),
            output: {
              format: 'iife',
              entryFileNames: 'static/js/datadog-chunk.[hash].js',
            },
          },
        },
      })
      if (!('output' in result)) {
        throw new Error('Datadog chunk build did not return a bundle')
      }
      scriptFileName = undefined
      for (const file of result.output) {
        if (file.type === 'chunk') {
          if (file.isEntry) scriptFileName = file.fileName
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
      if (!scriptFileName) {
        throw new Error('Datadog chunk build emitted no entry chunk')
      }
    },
    transformIndexHtml(_html, { filename }): HtmlTagDescriptor[] {
      if (
        !enabled ||
        !scriptFileName ||
        path.resolve(filename) !== path.resolve(config.root, 'index.html')
      ) {
        return []
      }
      const isRelativeBase = config.base === '' || config.base.startsWith('.')
      const src = `${isRelativeBase ? './' : config.base}${scriptFileName}`
      return [{ tag: 'script', attrs: { src }, injectTo: 'head' }]
    },
  }
}

export const buildPlugins: PluginOption[] = [datadogChunk()]
