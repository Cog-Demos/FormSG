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
  // The builder merges frontend/vite.config.ts. Drop production-only plugins
  // and run stories in "test" mode, which app code checks to show beta-gated
  // UI and to skip real decryption workers.
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    plugins: (viteConfig.plugins ?? [])
      .flat()
      .filter((plugin) => !isBuildOnlyPlugin(plugin)),
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
      ...viteConfig.define,
      'process.env.NODE_ENV': JSON.stringify('test'),
      'import.meta.env.MODE': JSON.stringify('test'),
    },
  }),
}

export default config
