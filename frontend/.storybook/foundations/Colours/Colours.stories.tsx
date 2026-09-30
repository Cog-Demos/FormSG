import { Meta, StoryObj } from '@storybook/react'

import { ColourTable } from './ColourTable'

const meta: Meta<typeof ColourTable> = {
  title: 'Foundation/Colours',
  component: ColourTable,
}

export default meta

type Story = StoryObj<typeof ColourTable>

const toColours = (palette: string, shades: string[]) =>
  shades.map((shade) => ({ palette, shade }))

const NINE_SHADES = [
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
]
const SEVEN_SHADES = NINE_SHADES.slice(0, 7)

export const BrandPrimary: Story = {
  args: {
    label: 'Brand primary colours',
    colours: toColours('primary', NINE_SHADES),
  },
}

export const BrandSecondary: Story = {
  args: {
    label: 'Brand secondary colours',
    colours: toColours('secondary', NINE_SHADES),
  },
}

export const FeedbackSuccess: Story = {
  args: {
    label: 'Success colours',
    colours: toColours('success', NINE_SHADES),
  },
}

export const FeedbackDanger: Story = {
  args: {
    label: 'Danger colours',
    colours: toColours('danger', NINE_SHADES),
  },
}

export const FeedbackWarning: Story = {
  args: {
    label: 'Warning colours',
    colours: toColours('warning', NINE_SHADES),
  },
}

export const Neutral: Story = {
  args: {
    label: 'Neutral colours',
    colours: toColours('neutral', NINE_SHADES),
  },
}

export const ThemeGreen: Story = {
  args: {
    label: 'Theme Green colours',
    colours: toColours('theme-green', SEVEN_SHADES),
  },
}

export const ThemeTeal: Story = {
  args: {
    label: 'Theme Teal colours',
    colours: toColours('theme-teal', SEVEN_SHADES),
  },
}

export const ThemePurple: Story = {
  args: {
    label: 'Theme Purple colours',
    colours: toColours('theme-purple', SEVEN_SHADES),
  },
}

export const ThemeGrey: Story = {
  args: {
    label: 'Theme Grey colours',
    colours: toColours('theme-grey', SEVEN_SHADES),
  },
}

export const ThemeYellow: Story = {
  args: {
    label: 'Theme Yellow colours',
    colours: toColours('theme-yellow', SEVEN_SHADES),
  },
}

export const ThemeOrange: Story = {
  args: {
    label: 'Theme Orange colours',
    colours: toColours('theme-orange', SEVEN_SHADES),
  },
}

export const ThemeRed: Story = {
  args: {
    label: 'Theme Red colours',
    colours: toColours('theme-red', SEVEN_SHADES),
  },
}

export const ThemeBrown: Story = {
  args: {
    label: 'Theme Brown colours',
    colours: toColours('theme-brown', SEVEN_SHADES),
  },
}
