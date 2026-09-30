import type { StorybookConfig } from '@storybook/react-vite'
import path from 'path'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
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
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      define: {
        'process.env.NODE_ENV': JSON.stringify('test'),
      },
      resolve: {
        alias: {
          // Lets dependencies outside frontend/ (e.g. shared/node_modules) resolve the node polyfill shims.
          'vite-plugin-node-polyfills/shims': path.resolve(
            __dirname,
            '../node_modules/vite-plugin-node-polyfills/shims',
          ),
        },
      },
    }),
}

export default config
