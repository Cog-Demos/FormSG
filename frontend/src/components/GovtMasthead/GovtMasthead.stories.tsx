import { Meta, StoryObj } from '@storybook/react'

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

export const MobileDefault: StoryObj<GovtMastheadProps> = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
  },
}

export const MobileExpanded: StoryObj<GovtMastheadProps> = {
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

export const DesktopExpanded: StoryObj<GovtMastheadProps> = {
  name: 'Desktop/Expanded',

  args: {
    defaultIsOpen: true,
  },
}
