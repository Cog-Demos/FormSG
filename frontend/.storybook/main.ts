import type { StorybookConfig } from '@storybook/react-vite'
import type { Plugin, PluginOption } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

const hasPlugin = (plugins: PluginOption[] | undefined, name: string) =>
  (plugins ?? [])
    .flat(Infinity as 1)
    .some((plugin) =>
      !!plugin && typeof plugin === 'object' && 'name' in plugin
        ? plugin.name === name
        : false,
    )

// Resolves `import { ReactComponent } from './x.svg'` (CRA style) alongside the default URL export.
const svgReactComponentCompat = (): Plugin => ({
  name: 'storybook-svg-react-component-compat',
  enforce: 'pre',
  load(id) {
    if (!id.endsWith('.svg')) return
    const url = JSON.stringify(`${id}?url`)
    const component = JSON.stringify(`${id}?react`)
    return [
      `export { default } from ${url}`,
      `export { default as ReactComponent } from ${component}`,
    ].join('\n')
  },
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
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    'storybook-react-i18next',
    '@storybook/addon-interactions',
  ],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  // Reuses frontend/vite.config.ts when present; only adds the plugins it does not already provide.
  viteFinal: async (viteConfig) => {
    const plugins = viteConfig.plugins ?? []
    if (!hasPlugin(plugins, 'vite-tsconfig-paths')) {
      plugins.push(tsconfigPaths())
    }
    if (!hasPlugin(plugins, 'vite-plugin-svgr')) {
      plugins.push(svgr(), svgReactComponentCompat())
    }
    return { ...viteConfig, plugins }
  },
  // For injecting environment variables into Storybook runs
  env: (config) => ({
    ...config,
    NODE_ENV: 'test',
  }),
}

export default config
