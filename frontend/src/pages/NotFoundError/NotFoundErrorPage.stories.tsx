import { Meta, StoryFn } from '@storybook/react'

import { getUnauthedUser } from '~/mocks/msw/handlers/user'

import {
  getMobileViewParameters,
  LoggedInDecorator,
  LoggedOutDecorator,
  StoryRouter,
} from '~utils/storybook'

import { NotFoundErrorPage } from './NotFoundErrorPage'

export default {
  title: 'Pages/NotFoundErrorPage',
  component: NotFoundErrorPage,
  decorators: [
    StoryRouter({
      initialEntries: ['/not-found-error'],
      path: '/not-found-error',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: StoryFn = () => <NotFoundErrorPage />

export const NotLoggedIn = {
  render: Template,
  decorators: [LoggedOutDecorator],

  parameters: {
    msw: [getUnauthedUser()],
  },
}

export const MobileNotLoggedIn = {
  render: Template,
  parameters: getMobileViewParameters(),
  decorators: NotLoggedIn.decorators,
}

export const LoggedIn = {
  render: Template,
  decorators: [LoggedInDecorator],
}

export const MobileLoggedIn = {
  render: Template,
  parameters: getMobileViewParameters(),
  decorators: LoggedIn.decorators,
}
