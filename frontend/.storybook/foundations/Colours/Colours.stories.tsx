import type { Meta, StoryObj } from '@storybook/react'

import { ColourTable } from './ColourTable'

const meta: Meta<typeof ColourTable> = {
  title: 'Foundation/Colours',
  component: ColourTable,
}

export default meta
type Story = StoryObj<typeof ColourTable>

const shadesOf = (palette: string, shades: string[]) =>
  shades.map((shade) => ({ palette, shade }))

export const BrandPrimary: Story = {
  name: 'Brand/Primary',
  args: {
    label: 'Brand primary colours',
    colours: shadesOf('primary', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
    ]),
  },
}

export const BrandSecondary: Story = {
  name: 'Brand/Secondary',
  args: {
    label: 'Brand secondary colours',
    colours: shadesOf('secondary', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
    ]),
  },
}

export const FeedbackSuccess: Story = {
  name: 'Feedback/Success',
  args: {
    label: 'Success colours',
    colours: shadesOf('success', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
    ]),
  },
}

export const FeedbackDanger: Story = {
  name: 'Feedback/Danger',
  args: {
    label: 'Danger colours',
    colours: shadesOf('danger', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
    ]),
  },
}

export const FeedbackWarning: Story = {
  name: 'Feedback/Warning',
  args: {
    label: 'Warning colours',
    colours: shadesOf('warning', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
    ]),
  },
}

export const Neutral: Story = {
  args: {
    label: 'Neutral colours',
    colours: shadesOf('neutral', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
    ]),
  },
}

export const ThemeGreen: Story = {
  name: 'Theme/Green',
  args: {
    label: 'Theme Green colours',
    colours: shadesOf('theme-green', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
    ]),
  },
}

export const ThemeTeal: Story = {
  name: 'Theme/Teal',
  args: {
    label: 'Theme Teal colours',
    colours: shadesOf('theme-teal', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
    ]),
  },
}

export const ThemePurple: Story = {
  name: 'Theme/Purple',
  args: {
    label: 'Theme Purple colours',
    colours: shadesOf('theme-purple', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
    ]),
  },
}

export const ThemeGrey: Story = {
  name: 'Theme/Grey',
  args: {
    label: 'Theme Grey colours',
    colours: shadesOf('theme-grey', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
    ]),
  },
}

export const ThemeYellow: Story = {
  name: 'Theme/Yellow',
  args: {
    label: 'Theme Yellow colours',
    colours: shadesOf('theme-yellow', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
    ]),
  },
}

export const ThemeOrange: Story = {
  name: 'Theme/Orange',
  args: {
    label: 'Theme Orange colours',
    colours: shadesOf('theme-orange', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
    ]),
  },
}

export const ThemeRed: Story = {
  name: 'Theme/Red',
  args: {
    label: 'Theme Red colours',
    colours: shadesOf('theme-red', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
    ]),
  },
}

export const ThemeBrown: Story = {
  name: 'Theme/Brown',
  args: {
    label: 'Theme Brown colours',
    colours: shadesOf('theme-brown', [
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
    ]),
  },
}
