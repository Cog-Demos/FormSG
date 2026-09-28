import type { StorybookConfig } from '@storybook/react-vite'
import { resolve } from 'node:path'
import { mergeConfig, Plugin } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * CRA-compatible SVG handling: `import { ReactComponent } from './x.svg'`
 * yields a component while `import url from './x.svg'` keeps the asset URL.
 */
const svgrWithDefaultUrl = (): Plugin => {
  const svgrPlugin = svgr({
    include: '**/*.svg',
    svgrOptions: { exportType: 'named', namedExport: 'ReactComponent' },
  })
  const hook = svgrPlugin.load
  const svgrLoad = typeof hook === 'function' ? hook : hook?.handler
  return {
    name: 'storybook-svgr-with-default-url',
    enforce: 'pre',
    async load(id) {
      if (!svgrLoad || !id.endsWith('.svg')) return null
      const result = await svgrLoad.call(this, id)
      if (!result) return null
      const componentCode = typeof result === 'string' ? result : result.code
      return {
        code: `${componentCode}\nexport { default } from ${JSON.stringify(`${id}?url`)}`,
        map: null,
      }
    },
  }
}

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
        svgrWithDefaultUrl(),
        // csv-string (CsvGenerator) extends Node's stream.Transform.
        nodePolyfills({ include: ['stream', 'buffer', 'events', 'util'] }),
      ],
      // App code still reads CRA-style `process.env.*`; shim until the
      // `import.meta.env` rename lands.
      define: {
        'process.env': JSON.stringify({
          NODE_ENV: 'development',
          PUBLIC_URL: '',
        }),
      },
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
