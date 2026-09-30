import { Meta, StoryObj } from '@storybook/react'

import * as stories from './IntlPhoneNumberInput.stories'
import { PhoneNumberInput, PhoneNumberInputProps } from './PhoneNumberInput'

export default {
  title: 'Components/PhoneNumberInput/SingleCountry',
  component: PhoneNumberInput,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  decorators: [],
} as Meta

type Story = StoryObj<PhoneNumberInputProps>

export const Default: Story = {
  ...stories.Default,
  args: {
    ...stories.Default.args,
    allowInternational: false,
  },
}

export const Prefilled: Story = {
  ...stories.Prefilled,
  args: {
    ...stories.Prefilled.args,
    allowInternational: false,
    defaultCountry: 'US',
  },
}

export const Error: Story = {
  ...stories.Error,
  args: {
    ...stories.Error.args,
    allowInternational: false,
  },
}

export const Success: Story = {
  ...stories.Success,
  args: {
    ...stories.Success.args,
    allowInternational: false,
  },
}

export const Disabled: Story = {
  ...stories.Disabled,
  args: {
    ...stories.Disabled.args,
    allowInternational: false,
  },
}

export const Playground: Story = {
  ...(stories.Playground as Story),
  args: {
    ...stories.Playground.args,
    allowInternational: false,
  },
}
