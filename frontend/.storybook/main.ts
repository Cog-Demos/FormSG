import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  stories: [
    // Introduction stories set first so stories are ordered correctly.
    './introduction/Welcome/Welcome.stories.tsx',
    './introduction/Principles/Principles.stories.tsx',
    './foundations/**/*.mdx',
    './foundations/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    'storybook-react-i18next',
  ],
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  // Vite plugins, aliases and polyfills come from ../vite.config.mts, which
  // @storybook/react-vite loads automatically. Only Storybook-specific
  // overrides live here.
  viteFinal: async (viteConfig) => {
    // The app config's multi-entry `rollupOptions.input` (index.html +
    // datadog-chunk) must not leak into the Storybook build.
    delete viteConfig.build?.rollupOptions?.input
    return viteConfig
  },
}

export default config
