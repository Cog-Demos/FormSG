import { Meta, StoryObj } from '@storybook/react'

import { ColourTable } from './ColourTable'

export default {
  title: 'Foundation/Colours',
  component: ColourTable,
  tags: ['!autodocs'],
} as Meta<typeof ColourTable>

type Story = StoryObj<typeof ColourTable>

const shades = (palette: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    palette,
    shade: `${(i + 1) * 100}`,
  }))

export const BrandPrimary: Story = {
  name: 'Brand/Primary',
  args: {
    label: 'Brand primary colours',
    colours: shades('primary', 9),
  },
}

export const BrandSecondary: Story = {
  name: 'Brand/Secondary',
  args: {
    label: 'Brand secondary colours',
    colours: shades('secondary', 9),
  },
}

export const FeedbackSuccess: Story = {
  name: 'Feedback/Success',
  args: {
    label: 'Success colours',
    colours: shades('success', 9),
  },
}

export const FeedbackDanger: Story = {
  name: 'Feedback/Danger',
  args: {
    label: 'Danger colours',
    colours: shades('danger', 9),
  },
}

export const FeedbackWarning: Story = {
  name: 'Feedback/Warning',
  args: {
    label: 'Warning colours',
    colours: shades('warning', 9),
  },
}

export const Neutral: Story = {
  args: {
    label: 'Neutral colours',
    colours: shades('neutral', 9),
  },
}

export const ThemeGreen: Story = {
  name: 'Theme/Green',
  args: {
    label: 'Theme Green colours',
    colours: shades('theme-green', 7),
  },
}

export const ThemeTeal: Story = {
  name: 'Theme/Teal',
  args: {
    label: 'Theme Teal colours',
    colours: shades('theme-teal', 7),
  },
}

export const ThemePurple: Story = {
  name: 'Theme/Purple',
  args: {
    label: 'Theme Purple colours',
    colours: shades('theme-purple', 7),
  },
}

export const ThemeGrey: Story = {
  name: 'Theme/Grey',
  args: {
    label: 'Theme Grey colours',
    colours: shades('theme-grey', 7),
  },
}

export const ThemeYellow: Story = {
  name: 'Theme/Yellow',
  args: {
    label: 'Theme Yellow colours',
    colours: shades('theme-yellow', 7),
  },
}

export const ThemeOrange: Story = {
  name: 'Theme/Orange',
  args: {
    label: 'Theme Orange colours',
    colours: shades('theme-orange', 7),
  },
}

export const ThemeRed: Story = {
  name: 'Theme/Red',
  args: {
    label: 'Theme Red colours',
    colours: shades('theme-red', 7),
  },
}

export const ThemeBrown: Story = {
  name: 'Theme/Brown',
  args: {
    label: 'Theme Brown colours',
    colours: shades('theme-brown', 7),
  },
}
