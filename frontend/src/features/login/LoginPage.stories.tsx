import { Meta, StoryFn } from '@storybook/react'

import { authHandlers, otpGenerationResponse } from '~/mocks/msw/handlers/auth'

import { LOGIN_ROUTE } from '~constants/routes'
import { StoryRouter, viewports } from '~utils/storybook'

import { LoginPage } from './LoginPage'

export default {
  title: 'Pages/LoginPage',
  component: LoginPage,
  decorators: [
    StoryRouter({
      initialEntries: [LOGIN_ROUTE],
      path: LOGIN_ROUTE,
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: authHandlers,
    chromatic: { delay: 200 },
  },
} as Meta

const Template: StoryFn = () => <LoginPage />

export const Desktop = {
  render: Template,
}

export const Tablet = {
  render: Template,

  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    chromatic: { viewports: [viewports.md] },
  },
}

export const Mobile = {
  render: Template,

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
  },
}

export const InvalidAgencyResponse = {
  render: Template,

  parameters: {
    msw: [otpGenerationResponse({ isInvalid: true }), ...authHandlers.slice(1)],
  },
}
