import { Meta, StoryFn } from '@storybook/react'

import { viewports } from '~utils/storybook'

import {
  GovtMasthead as GovtMastheadComponent,
  GovtMastheadProps,
} from './GovtMasthead'

export default {
  title: 'Components/GovtMasthead',
  parameters: {
    layout: 'fullscreen',
  },
  component: GovtMastheadComponent,
  decorators: [],
} as Meta

export const MobileDefault = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
  },
}

export const MobileExpanded = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
  },

  name: 'Mobile/Expanded',

  args: {
    defaultIsOpen: true,
  },
}

export const DesktopDefault = {}

export const DesktopExpanded = {
  name: 'Desktop/Expanded',

  args: {
    defaultIsOpen: true,
  },
}
