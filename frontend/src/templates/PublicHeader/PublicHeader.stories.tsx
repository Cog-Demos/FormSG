import { Button } from '@chakra-ui/react'
import { Meta, StoryFn } from '@storybook/react'

import { BxsHelpCircle } from '~assets/icons/BxsHelpCircle'
import {
  getMobileViewParameters,
  getTabletViewParameters,
} from '~utils/storybook'

import { PublicHeader, PublicHeaderProps } from './PublicHeader'

const DEFAULT_ARGS: PublicHeaderProps = {
  ctaElement: (
    <Button variant="solid" colorScheme="primary">
      Log in
    </Button>
  ),
  publicHeaderLinks: [
    {
      label: 'Products',
      href: '',
    },
    {
      label: 'Help',
      href: 'https://guide.form.gov.sg',
      showOnMobile: true,
      MobileIcon: BxsHelpCircle,
    },
  ],
}

export default {
  title: 'Templates/PublicHeader',
  component: PublicHeader,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [],
  args: DEFAULT_ARGS,
} as Meta

export const Default = {}

export const WithoutCTA = {
  args: {
    ...DEFAULT_ARGS,
    ctaElement: undefined,
  },
}

export const Mobile = {
  parameters: getMobileViewParameters(),
}

export const Tablet = {
  parameters: getTabletViewParameters(),
}
