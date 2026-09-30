import type { StorybookConfig } from '@storybook/react-vite'
import { join } from 'path'
import { mergeConfig } from 'vite'

// Resolve node polyfill shims from frontend/node_modules so that files outside
// the Vite root (e.g. ../shared/node_modules) can import them.
const polyfillShim = (name: 'buffer' | 'global' | 'process') =>
  join(
    __dirname,
    '../node_modules/vite-plugin-node-polyfills/shims',
    name,
    'dist/index.js',
  )

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
    './foundations/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    'storybook-react-i18next',
  ],
  // For injecting environment variables into Storybook runs
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  viteFinal: (config) =>
    mergeConfig(config, {
      resolve: {
        alias: {
          'vite-plugin-node-polyfills/shims/buffer': polyfillShim('buffer'),
          'vite-plugin-node-polyfills/shims/global': polyfillShim('global'),
          'vite-plugin-node-polyfills/shims/process': polyfillShim('process'),
        },
      },
    }),
  env: (config) => ({
    ...config,
    NODE_ENV: 'test',
  }),
}

export default config
