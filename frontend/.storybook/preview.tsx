/**
 * This file is used to add global decorators and parameters to all storybook stories.
 * It is also applied to stories composed in Vitest via `setProjectAnnotations`.
 * @see https://storybook.js.org/docs/configure#configure-story-rendering
 */
import 'inter-ui/inter.css'
import 'focus-visible/dist/focus-visible.min.js'

import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ChakraProvider } from '@chakra-ui/react'
import type { Decorator, Preview } from '@storybook/react'
import { initialize, mswDecorator, mswLoader } from 'msw-storybook-addon'

import { AuthProvider } from '~contexts/AuthContext'
import * as dayjsUtils from '~utils/dayjs'

import i18n from '../src/i18n/i18n'
import { theme } from '../src/theme'

import { StorybookTheme } from './themes'

initialize()
dayjsUtils.init()

const withReactQuery: Decorator = (storyFn) => {
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
      <AuthProvider>{storyFn()}</AuthProvider>
    </QueryClientProvider>
  )
}

const withChakra: Decorator = (storyFn) => (
  <ChakraProvider resetCSS theme={theme}>
    {storyFn()}
  </ChakraProvider>
)

const withHelmet: Decorator = (storyFn) => (
  <HelmetProvider>{storyFn()}</HelmetProvider>
)

const preview: Preview = {
  // mswDecorator applies `parameters.msw` synchronously so handlers are also
  // active for stories rendered through composeStories(); mswLoader
  // additionally waits for the browser service worker to start.
  decorators: [withReactQuery, withChakra, withHelmet, mswDecorator],
  loaders: [mswLoader],
  parameters: {
    i18n,
    docs: {
      theme: StorybookTheme.docs,
    },
    a11y: {
      element: '#storybook-root',
      manual: false,
    },
  },
  initialGlobals: {
    locale: 'en-SG',
    locales: {
      'en-SG': 'English',
    },
  },
}

export default preview
