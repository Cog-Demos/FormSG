/**
 * This file is used to add global decorators and parameters to all storybook stories.
 * @see https://storybook.js.org/docs/configure#configure-story-rendering
 */
import 'inter-ui/inter.css'
import 'focus-visible/dist/focus-visible.min.js'

import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ChakraProvider } from '@chakra-ui/react'
import type { Decorator, Preview } from '@storybook/react'
import { initialize, mswLoader } from 'msw-storybook-addon'

import { AuthProvider } from '~contexts/AuthContext'
import * as dayjsUtils from '~utils/dayjs'

import i18n from '../src/i18n/i18n'
import { theme } from '../src/theme'

import { StorybookTheme } from './themes'

initialize({ onUnhandledRequest: 'bypass' })
dayjsUtils.init()

const withReactQuery: Decorator = (Story) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        retry: false,
      },
    },
  })
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Story />
      </AuthProvider>
    </QueryClientProvider>
  )
}

const withChakra: Decorator = (Story) => (
  <ChakraProvider resetCSS theme={theme}>
    <Story />
  </ChakraProvider>
)

const withHelmet: Decorator = (Story) => (
  <HelmetProvider>
    <Story />
  </HelmetProvider>
)

const preview: Preview = {
  decorators: [withReactQuery, withChakra, withHelmet],
  loaders: [mswLoader],
  initialGlobals: {
    locale: 'en-SG',
    locales: {
      'en-SG': 'English',
    },
  },
  parameters: {
    i18n,
    a11y: {
      // Run axe checks on every story; failures are shown in the addon panel.
      test: 'error',
    },
    docs: {
      theme: StorybookTheme.docs,
      story: { inline: true },
    },
  },
}

export default preview
