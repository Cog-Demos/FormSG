import { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'

import * as stories from './IntlPhoneNumberInput.stories'
import { PhoneNumberInput, PhoneNumberInputProps } from './PhoneNumberInput'

export default {
  title: 'Components/PhoneNumberInput/SingleCountry',
  component: PhoneNumberInput,
  args: { onChange: fn() },
  decorators: [],
} as Meta

export const Default: StoryObj<PhoneNumberInputProps> = {
  ...stories.Default,
  args: {
    ...stories.Default.args,
    allowInternational: false,
  },
}

export const Prefilled: StoryObj<PhoneNumberInputProps> = {
  ...stories.Prefilled,
  args: {
    ...stories.Prefilled.args,
    allowInternational: false,
    defaultCountry: 'US',
  },
}

export const Error: StoryObj<PhoneNumberInputProps> = {
  ...stories.Error,
  args: {
    ...stories.Error.args,
    allowInternational: false,
  },
}

export const Success: StoryObj<PhoneNumberInputProps> = {
  ...stories.Success,
  args: {
    ...stories.Success.args,
    allowInternational: false,
  },
}

export const Disabled: StoryObj<PhoneNumberInputProps> = {
  ...stories.Disabled,
  args: {
    ...stories.Disabled.args,
    allowInternational: false,
  },
}

export const Playground: StoryObj<PhoneNumberInputProps> = {
  ...stories.Playground,
  args: {
    ...stories.Playground.args,
    allowInternational: false,
  },
}
