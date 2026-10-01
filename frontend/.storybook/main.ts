import type { StorybookConfig } from '@storybook/react-vite'
import type { Plugin, PluginOption } from 'vite'

// Plugins from vite.config.ts that only apply to the app build.
const EXCLUDED_VITE_PLUGINS = new Set(['formsg:datadog-chunk'])

const REACT_DOCGEN_PLUGIN = 'storybook:react-docgen-plugin'

// react-docgen always parses with the `jsx` babel plugin, which cannot parse
// `<T>value` type assertions in .ts modules (including ones it follows through
// imports). Only run docgen on .tsx/.jsx files and skip files it cannot parse
// instead of failing the build; those components just lack inferred argTypes.
const docgenForJsxOnly = (plugin: Plugin): Plugin => {
  const { transform } = plugin
  if (typeof transform !== 'function') return plugin
  return {
    ...plugin,
    async transform(code, id, options) {
      if (!/\.[jt]sx$/.test(id.split('?')[0])) return
      try {
        return await transform.call(this, code, id, options)
      } catch (e) {
        this.warn(
          `react-docgen skipped: ${(e as Error).message.split('\n')[0]}`,
        )
        return
      }
    },
  }
}

const adaptPlugins = (plugins: PluginOption[]): PluginOption[] =>
  plugins
    .filter(
      (plugin) =>
        !(
          plugin &&
          !Array.isArray(plugin) &&
          'name' in plugin &&
          EXCLUDED_VITE_PLUGINS.has(plugin.name)
        ),
    )
    .map((plugin) => {
      if (Array.isArray(plugin)) return adaptPlugins(plugin)
      if (plugin && 'name' in plugin && plugin.name === REACT_DOCGEN_PLUGIN) {
        return docgenForJsxOnly(plugin)
      }
      return plugin
    })

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
  // frontend/vite.config.ts (aliases, svgr, node polyfills, fs.allow) is
  // loaded automatically by @storybook/react-vite.
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: adaptPlugins(viteConfig.plugins ?? []),
    define: {
      ...viteConfig.define,
      // Stories run the `import.meta.env.MODE === 'test'` code paths.
      'import.meta.env.MODE': JSON.stringify('test'),
    },
  }),
}

export default config
