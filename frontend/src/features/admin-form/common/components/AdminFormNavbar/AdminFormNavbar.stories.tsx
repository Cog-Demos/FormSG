import { Meta, StoryFn } from '@storybook/react'

import { DateString } from '~shared/types/generic'

import { createMockForm } from '~/mocks/msw/handlers/admin-form'

import { getMobileViewParameters, StoryRouter } from '~utils/storybook'

import { AdminFormNavbar, AdminFormNavbarProps } from './AdminFormNavbar'

const MOCK_FORM: AdminFormNavbarProps['formInfo'] = createMockForm({
  title: 'Storybook Test Form',
  lastModified: '2020-01-01T00:00:00.000Z' as DateString,
}).form

export default {
  title: 'Features/AdminForm/AdminFormNavbar',
  component: AdminFormNavbar,
  decorators: [StoryRouter({ path: 'test', initialEntries: ['/test'] })],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    formInfo: MOCK_FORM,
    previewFormLink: '/test',
  },
} as Meta<AdminFormNavbarProps>

export const DefaultEditor = {}

export const DefaultViewOnly = {
  args: {
    formInfo: MOCK_FORM,
    viewOnly: true,
    previewFormLink: '/test',
  },
}

export const Skeleton = {
  args: {
    formInfo: undefined,
    previewFormLink: '/test',
  },
}

export const Mobile = {
  args: {
    formInfo: {
      ...MOCK_FORM,
      title:
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    },
    previewFormLink: '/test',
  },

  parameters: getMobileViewParameters(),
}
