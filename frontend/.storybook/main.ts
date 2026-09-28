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
  // The builder merges frontend/vite.config.mts. Drop production-only plugins
  // and keep NODE_ENV=test, which app code checks to show beta-gated UI and
  // to skip real decryption workers in stories.
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    plugins: (viteConfig.plugins ?? [])
      .flat()
      .filter((plugin) => !isBuildOnlyPlugin(plugin)),
    define: {
      ...viteConfig.define,
      'process.env.NODE_ENV': JSON.stringify('test'),
    },
  }),
}

export default config
