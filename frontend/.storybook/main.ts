import type { StorybookConfig } from '@storybook/react-vite'
import type { PluginOption } from 'vite'

const isBuildOnlyPlugin = (plugin: PluginOption): boolean =>
  !!plugin &&
  typeof plugin === 'object' &&
  'apply' in plugin &&
  plugin.apply === 'build'

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
    '@storybook/addon-interactions',
    'storybook-react-i18next',
  ],
  core: {
    disableTelemetry: true,
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  // Storybook merges frontend/vite.config.mts automatically (it ignores its
  // `build` section and sets its own rollup input); drop production-only
  // plugins and emulate the test environment the stories were written for.
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    plugins: (viteConfig.plugins ?? [])
      .flat()
      .filter((plugin) => !isBuildOnlyPlugin(plugin)),
    optimizeDeps: {
      ...viteConfig.optimizeDeps,
      include: [
        ...(viteConfig.optimizeDeps?.include ?? []),
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
      ...viteConfig.define,
      'process.env.NODE_ENV': JSON.stringify('test'),
      'import.meta.env.MODE': JSON.stringify('test'),
    },
  }),
}

export default config
