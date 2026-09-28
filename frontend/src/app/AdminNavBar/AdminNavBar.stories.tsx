import { Meta, StoryFn } from '@storybook/react'

import { SeenFlags } from '~shared/types/user'

import { getUser, MOCK_USER } from '~/mocks/msw/handlers/user'

import {
  getMobileViewParameters,
  getTabletViewParameters,
  LoggedInDecorator,
  StoryRouter,
  ViewedEmergencyContactDecorator,
} from '~utils/storybook'

import { FEATURE_UPDATE_LIST } from '~features/whats-new/FeatureUpdateList'

import { AdminNavBar, AdminNavBarProps } from './AdminNavBar'

export default {
  title: 'App/AdminNavBar',
  component: AdminNavBar,
  parameters: {
    layout: 'fullscreen',
    msw: [getUser({ delay: 0 })],
  },
  decorators: [
    StoryRouter({ initialEntries: ['/12345'], path: '/:formId' }),
    LoggedInDecorator,
    ViewedEmergencyContactDecorator,
  ],
} as Meta

export const Default = {}

export const Expanded = {
  args: { isMenuOpen: true },
}

export const Mobile = {
  parameters: getMobileViewParameters(),
}

export const MobileExpanded = {
  parameters: {
    ...Mobile.parameters,
    msw: [
      getUser({
        delay: 0,
        mockUser: {
          ...MOCK_USER,
          email: 'super_super_super_super_super_long_name@example.com',
        },
      }),
    ],
  },

  args: Expanded.args,
}

export const Tablet = {
  parameters: getTabletViewParameters(),
}

export const WhatsNewFeatureNotificationShown = {
  parameters: {
    msw: [
      getUser({
        delay: 0,
        mockUser: {
          ...MOCK_USER,
          flags: new Map(),
        },
      }),
    ],
  },
}

export const WhatsNewFeatureNotificationNotShown = {
  parameters: {
    msw: [
      getUser({
        delay: 0,
        mockUser: {
          ...MOCK_USER,
          flags: new Map([
            [SeenFlags.LastSeenFeatureUpdateVersion, FEATURE_UPDATE_LIST.version],
          ]),
        },
      }),
    ],
  },
}

export const WhatsNewFeatureMobileNotificationShown = {
  parameters: {
    ...Mobile.parameters,
    msw: [
      getUser({
        delay: 0,
        mockUser: {
          ...MOCK_USER,
          flags: new Map(),
        },
      }),
    ],
  },
}
