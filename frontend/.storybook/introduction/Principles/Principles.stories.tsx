import { Meta, StoryObj } from '@storybook/react'

import { Principles as Component } from './Principles'

export default {
  title: 'Introduction/Guiding principles',
  component: Component,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

export const Principles: StoryObj<typeof Component> = {
  name: 'Guiding principles',
}
