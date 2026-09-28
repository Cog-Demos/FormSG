import type { StorybookConfig } from '@storybook/react-vite'
import { resolve } from 'node:path'
import { mergeConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

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
  // Storybook resolves the app's vite.config.ts automatically once it exists;
  // until then the plugins the stories need are added here.
  viteFinal: async (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [
        tsconfigPaths({
          projects: [resolve(__dirname, '../tsconfig.json')],
        }),
        svgr({
          include: '**/*.svg',
          svgrOptions: { exportType: 'named', namedExport: 'ReactComponent' },
        }),
      ],
      resolve: {
        // Removed packages still imported by app code; drop once TICKET-E lands.
        alias: [
          { find: 'react-beautiful-dnd', replacement: '@hello-pangea/dnd' },
          { find: 'p-queue/dist', replacement: 'p-queue' },
        ],
      },
      server: {
        fs: {
          allow: ['..', '../../shared'],
        },
      },
    }),
}

export default config
