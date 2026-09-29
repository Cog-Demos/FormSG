import { Meta } from '@storybook/react'

import { getUnauthedUser } from '~/mocks/msw/handlers/user'

import {
  getMobileViewParameters,
  LoggedInDecorator,
  LoggedOutDecorator,
  StoryRouter,
} from '~utils/storybook'

import {
  AdminForbiddenErrorPage,
  AdminForbiddenErrorPageProps,
} from './AdminForbiddenErrorPage'

export default {
  title: 'Pages/AdminForbiddenErrorPage',
  component: AdminForbiddenErrorPage,
  decorators: [
    StoryRouter({
      initialEntries: ['/admin-forbidden-error'],
      path: '/admin-forbidden-error',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta<AdminForbiddenErrorPageProps>

export const NotLoggedIn = {
  decorators: [LoggedOutDecorator],

  parameters: {
    msw: [getUnauthedUser()],
  },
}

export const WithMessage = {
  args: {
    message: 'You are not authorized to access this page.',
  },

  decorators: [LoggedInDecorator],
}

export const MobileNotLoggedIn = {
  parameters: getMobileViewParameters(),
  decorators: NotLoggedIn.decorators,
}

export const LoggedIn = {
  decorators: [LoggedInDecorator],
}

export const MobileLoggedIn = {
  parameters: getMobileViewParameters(),
  decorators: LoggedIn.decorators,
}
