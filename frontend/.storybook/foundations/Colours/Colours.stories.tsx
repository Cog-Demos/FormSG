import { Meta, StoryObj } from '@storybook/react'

import { ColourTable } from './ColourTable'

export default {
  title: 'Foundation/Colours',
  component: ColourTable,
} as Meta<typeof ColourTable>

type Story = StoryObj<typeof ColourTable>

export const BrandPrimary: Story = {
  name: 'Brand/Primary',
  args: {
    label: 'Brand primary colours',
    colours: [
      { palette: 'primary', shade: '100' },
      { palette: 'primary', shade: '200' },
      { palette: 'primary', shade: '300' },
      { palette: 'primary', shade: '400' },
      { palette: 'primary', shade: '500' },
      { palette: 'primary', shade: '600' },
      { palette: 'primary', shade: '700' },
      { palette: 'primary', shade: '800' },
      { palette: 'primary', shade: '900' },
    ],
  },
}

export const BrandSecondary: Story = {
  name: 'Brand/Secondary',
  args: {
    label: 'Brand secondary colours',
    colours: [
      { palette: 'secondary', shade: '100' },
      { palette: 'secondary', shade: '200' },
      { palette: 'secondary', shade: '300' },
      { palette: 'secondary', shade: '400' },
      { palette: 'secondary', shade: '500' },
      { palette: 'secondary', shade: '600' },
      { palette: 'secondary', shade: '700' },
      { palette: 'secondary', shade: '800' },
      { palette: 'secondary', shade: '900' },
    ],
  },
}

export const FeedbackSuccess: Story = {
  name: 'Feedback/Success',
  args: {
    label: 'Success colours',
    colours: [
      { palette: 'success', shade: '100' },
      { palette: 'success', shade: '200' },
      { palette: 'success', shade: '300' },
      { palette: 'success', shade: '400' },
      { palette: 'success', shade: '500' },
      { palette: 'success', shade: '600' },
      { palette: 'success', shade: '700' },
      { palette: 'success', shade: '800' },
      { palette: 'success', shade: '900' },
    ],
  },
}

export const FeedbackDanger: Story = {
  name: 'Feedback/Danger',
  args: {
    label: 'Danger colours',
    colours: [
      { palette: 'danger', shade: '100' },
      { palette: 'danger', shade: '200' },
      { palette: 'danger', shade: '300' },
      { palette: 'danger', shade: '400' },
      { palette: 'danger', shade: '500' },
      { palette: 'danger', shade: '600' },
      { palette: 'danger', shade: '700' },
      { palette: 'danger', shade: '800' },
      { palette: 'danger', shade: '900' },
    ],
  },
}

export const FeedbackWarning: Story = {
  name: 'Feedback/Warning',
  args: {
    label: 'Warning colours',
    colours: [
      { palette: 'warning', shade: '100' },
      { palette: 'warning', shade: '200' },
      { palette: 'warning', shade: '300' },
      { palette: 'warning', shade: '400' },
      { palette: 'warning', shade: '500' },
      { palette: 'warning', shade: '600' },
      { palette: 'warning', shade: '700' },
      { palette: 'warning', shade: '800' },
      { palette: 'warning', shade: '900' },
    ],
  },
}

export const Neutral: Story = {
  args: {
    label: 'Neutral colours',
    colours: [
      { palette: 'neutral', shade: '100' },
      { palette: 'neutral', shade: '200' },
      { palette: 'neutral', shade: '300' },
      { palette: 'neutral', shade: '400' },
      { palette: 'neutral', shade: '500' },
      { palette: 'neutral', shade: '600' },
      { palette: 'neutral', shade: '700' },
      { palette: 'neutral', shade: '800' },
      { palette: 'neutral', shade: '900' },
    ],
  },
}

export const ThemeGreen: Story = {
  name: 'Theme/Green',
  args: {
    label: 'Theme Green colours',
    colours: [
      { palette: 'theme-green', shade: '100' },
      { palette: 'theme-green', shade: '200' },
      { palette: 'theme-green', shade: '300' },
      { palette: 'theme-green', shade: '400' },
      { palette: 'theme-green', shade: '500' },
      { palette: 'theme-green', shade: '600' },
      { palette: 'theme-green', shade: '700' },
    ],
  },
}

export const ThemeTeal: Story = {
  name: 'Theme/Teal',
  args: {
    label: 'Theme Teal colours',
    colours: [
      { palette: 'theme-teal', shade: '100' },
      { palette: 'theme-teal', shade: '200' },
      { palette: 'theme-teal', shade: '300' },
      { palette: 'theme-teal', shade: '400' },
      { palette: 'theme-teal', shade: '500' },
      { palette: 'theme-teal', shade: '600' },
      { palette: 'theme-teal', shade: '700' },
    ],
  },
}

export const ThemePurple: Story = {
  name: 'Theme/Purple',
  args: {
    label: 'Theme Purple colours',
    colours: [
      { palette: 'theme-purple', shade: '100' },
      { palette: 'theme-purple', shade: '200' },
      { palette: 'theme-purple', shade: '300' },
      { palette: 'theme-purple', shade: '400' },
      { palette: 'theme-purple', shade: '500' },
      { palette: 'theme-purple', shade: '600' },
      { palette: 'theme-purple', shade: '700' },
    ],
  },
}

export const ThemeGrey: Story = {
  name: 'Theme/Grey',
  args: {
    label: 'Theme Grey colours',
    colours: [
      { palette: 'theme-grey', shade: '100' },
      { palette: 'theme-grey', shade: '200' },
      { palette: 'theme-grey', shade: '300' },
      { palette: 'theme-grey', shade: '400' },
      { palette: 'theme-grey', shade: '500' },
      { palette: 'theme-grey', shade: '600' },
      { palette: 'theme-grey', shade: '700' },
    ],
  },
}

export const ThemeYellow: Story = {
  name: 'Theme/Yellow',
  args: {
    label: 'Theme Yellow colours',
    colours: [
      { palette: 'theme-yellow', shade: '100' },
      { palette: 'theme-yellow', shade: '200' },
      { palette: 'theme-yellow', shade: '300' },
      { palette: 'theme-yellow', shade: '400' },
      { palette: 'theme-yellow', shade: '500' },
      { palette: 'theme-yellow', shade: '600' },
      { palette: 'theme-yellow', shade: '700' },
    ],
  },
}

export const ThemeOrange: Story = {
  name: 'Theme/Orange',
  args: {
    label: 'Theme Orange colours',
    colours: [
      { palette: 'theme-orange', shade: '100' },
      { palette: 'theme-orange', shade: '200' },
      { palette: 'theme-orange', shade: '300' },
      { palette: 'theme-orange', shade: '400' },
      { palette: 'theme-orange', shade: '500' },
      { palette: 'theme-orange', shade: '600' },
      { palette: 'theme-orange', shade: '700' },
    ],
  },
}

export const ThemeRed: Story = {
  name: 'Theme/Red',
  args: {
    label: 'Theme Red colours',
    colours: [
      { palette: 'theme-red', shade: '100' },
      { palette: 'theme-red', shade: '200' },
      { palette: 'theme-red', shade: '300' },
      { palette: 'theme-red', shade: '400' },
      { palette: 'theme-red', shade: '500' },
      { palette: 'theme-red', shade: '600' },
      { palette: 'theme-red', shade: '700' },
    ],
  },
}

export const ThemeBrown: Story = {
  name: 'Theme/Brown',
  args: {
    label: 'Theme Brown colours',
    colours: [
      { palette: 'theme-brown', shade: '100' },
      { palette: 'theme-brown', shade: '200' },
      { palette: 'theme-brown', shade: '300' },
      { palette: 'theme-brown', shade: '400' },
      { palette: 'theme-brown', shade: '500' },
      { palette: 'theme-brown', shade: '600' },
      { palette: 'theme-brown', shade: '700' },
    ],
  },
}
