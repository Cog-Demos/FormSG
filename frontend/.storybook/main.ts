import type { StorybookConfig } from '@storybook/react-vite'
import { promises as fs } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Plugin, PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

const require = createRequire(import.meta.url)

// Resolve a shim's ESM entry; require.resolve returns the .cjs sibling, which
// breaks Vite's ESM graph, so prefer the .js file next to it.
const polyfillShimPath = (name: string): string =>
  require
    .resolve(`vite-plugin-node-polyfills/shims/${name}`)
    .replace(/index\.cjs$/, 'index.js')

// vite-plugin-node-polyfills injects `shims/*` specifiers into modules that
// reference the corresponding globals; they only resolve when the plugin is
// reachable from the importer (not the case under shared/node_modules).
// Point the specifiers at their absolute paths.
const polyfillShimAliases: Record<string, string> = {
  'vite-plugin-node-polyfills/shims/buffer': polyfillShimPath('buffer'),
  'vite-plugin-node-polyfills/shims/global': polyfillShimPath('global'),
  'vite-plugin-node-polyfills/shims/process': polyfillShimPath('process'),
}

interface SvgrTransform {
  (
    svg: string,
    options: Record<string, unknown>,
    state: { filePath: string; caller: { defaultPlugins: unknown[] } },
  ): Promise<string>
}

// @svgr packages are nested under vite-plugin-svgr (not top-level deps).
const svgrImport = async <T>(name: string): Promise<T> => {
  const resolved = require.resolve(`@svgr/${name}`, {
    paths: [dirname(require.resolve('vite-plugin-svgr'))],
  })
  return import(pathToFileURL(resolved).href)
}

// webpack-era app code does `import { ReactComponent } from './icon.svg'` on
// plain .svg imports (CRA ran both svgr and file-loader, producing a URL
// default export plus a ReactComponent named export). vite-plugin-svgr only
// handles `*.svg?react`, so append the ReactComponent export onto Vite's
// normal asset output here; the default export stays the asset URL.
const svgReactComponent = (): Plugin => ({
  name: 'formsg-svg-react-component',
  enforce: 'post',
  async transform(code, id) {
    const [filePath, rawQuery] = id.split('?', 2)
    if (!filePath.endsWith('.svg')) return null
    if (rawQuery !== undefined && !rawQuery.startsWith('import')) return null
    // Skip when an upstream plugin already produced the component export
    // (e.g. TICKET-A's vite.config.ts covering plain .svg imports).
    if (code.includes('ReactComponent')) return null
    const { transform } = await svgrImport<{ transform: SvgrTransform }>('core')
    const { default: jsx } = await svgrImport<{ default: unknown }>(
      'plugin-jsx',
    )
    const { transformWithEsbuild } = await import('vite')
    const svgCode = await fs.readFile(filePath, 'utf8')
    const componentCode = await transform(
      svgCode,
      { exportType: 'named', ref: true },
      { filePath, caller: { defaultPlugins: [jsx] } },
    )
    const compiled = await transformWithEsbuild(
      componentCode,
      `${filePath}?react`,
      { loader: 'jsx' },
    )
    return { code: `${code}\n${compiled.code}`, map: null }
  },
})

const isBuildOnlyPlugin = (plugin: PluginOption): boolean =>
  !!plugin &&
  typeof plugin === 'object' &&
  'apply' in plugin &&
  plugin.apply === 'build'

// Plugins the app build needs that normally live in frontend/vite.config.ts.
// Storybook's react-vite framework merges that config automatically when the
// file exists; when it does not, add the ones Storybook cannot do without.
const requiredVitePlugins: Record<string, () => PluginOption> = {
  'vite-tsconfig-paths': tsconfigPaths,
  'vite-plugin-svgr': () =>
    svgr({ svgrOptions: { exportType: 'named', ref: true } }),
  'formsg-svg-react-component': svgReactComponent,
  // csv-string's Streamer extends Node's `stream.Transform` at module load.
  'vite-plugin-node-polyfills': () =>
    nodePolyfills({
      include: ['stream'],
      globals: { Buffer: false, global: true, process: true },
    }),
}

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  staticDirs: ['../public'],
  stories: [
    // Introduction stories set first so stories are ordered correctly.
    './introduction/Welcome/Welcome.stories.tsx',
    './introduction/Principles/Principles.stories.tsx',
    './foundations/**/*.mdx',
    './foundations/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    'storybook-react-i18next',
    '@storybook/addon-interactions',
  ],
  core: {
    disableTelemetry: true,
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  // For injecting environment variables into Storybook runs
  // (see: https://github.com/storybookjs/storybook/issues/12270#issuecomment-1139104523)
  env: (config) => ({
    ...config,
    NODE_ENV: 'test',
  }),
  // The builder merges frontend/vite.config.ts when it exists. Drop
  // production-only plugins, backfill missing app plugins (see above), and run
  // stories in "test" mode, which app code checks to show beta-gated UI and to
  // skip real decryption workers.
  viteFinal: async (viteConfig) => {
    const presentPluginNames = new Set(
      (viteConfig.plugins ?? [])
        .flat()
        .map((plugin) =>
          plugin && typeof plugin === 'object' && 'name' in plugin
            ? plugin.name
            : undefined,
        ),
    )
    const missingPlugins = Object.entries(requiredVitePlugins)
      .filter(([name]) => !presentPluginNames.has(name))
      .map(([, plugin]) => plugin())

    const existingAlias = viteConfig.resolve?.alias
    return {
      ...viteConfig,
      plugins: [
        ...(viteConfig.plugins ?? [])
          .flat()
          .filter((plugin) => !isBuildOnlyPlugin(plugin)),
        ...missingPlugins,
      ],
      resolve: {
        ...viteConfig.resolve,
        alias: Array.isArray(existingAlias)
          ? [
              ...existingAlias,
              ...Object.entries({
                ...polyfillShimAliases,
              }).map(([find, replacement]) => ({ find, replacement })),
            ]
          : {
              ...polyfillShimAliases,
              ...(existingAlias ?? {}),
            },
      },
      optimizeDeps: {
        ...viteConfig.optimizeDeps,
        // Pre-bundle preview.tsx deps so the first story load doesn't trigger
        // a re-optimize + full reload.
        include: [
          ...(viteConfig.optimizeDeps?.include ?? []),
          'vite-plugin-node-polyfills/shims/global',
          'vite-plugin-node-polyfills/shims/process',
          'focus-visible/dist/focus-visible.min.js',
          'i18next',
          'i18next-browser-languagedetector',
          'i18next-icu',
          'dayjs/plugin/calendar',
          'dayjs/plugin/updateLocale',
        ],
      },
      define: {
        // CRA-era code reads process.env.*; keep an empty env object so those
        // reads evaluate to undefined instead of crashing on `process`.
        'process.env': {},
        ...viteConfig.define,
        'process.env.NODE_ENV': JSON.stringify('test'),
        'import.meta.env.MODE': JSON.stringify('test'),
      },
    }
  },
}

export default config
