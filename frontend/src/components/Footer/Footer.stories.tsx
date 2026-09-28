import { Meta, StoryFn } from '@storybook/react'

import { viewports } from '~utils/storybook'

import { FooterProps } from './common/types'
import { Footer } from './Footer'

const DEFAULT_ARGS: FooterProps = {
  appName: 'Form',
  appLink: 'https://form.gov.sg',
  footerLinks: [
    {
      label: 'User guide',
      href: '',
    },
    {
      label: 'Privacy',
      href: '',
    },
    {
      label: 'Terms of use',
      href: '',
    },
    {
      label: 'Report vulnerability',
      href: '',
    },
  ],
}

export default {
  title: 'Components/Footer',
  component: Footer,
  decorators: [],
  parameters: {
    layout: 'fullscreen',
  },
  args: DEFAULT_ARGS,
} as Meta<FooterProps>

export const Default = {}

export const CompactVariant = {
  args: {
    ...DEFAULT_ARGS,
    variant: 'compact',
  },
}

export const WithTagline = {
  args: {
    ...DEFAULT_ARGS,
    tagline: 'Build secure government forms in minutes',
  },
}

export const Mobile = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
  },
}

export const Tablet = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    chromatic: { viewports: [viewports.md] },
  },
}
