import { Meta } from '@storybook/react'

import { getMobileViewParameters, mockDateDecorator } from '~utils/storybook'

import { DatePicker, DatePickerProps } from './DatePicker'

export default {
  title: 'Components/DatePicker',
  component: DatePicker,
  decorators: [mockDateDecorator],
  parameters: {
    mockdate: new Date('2021-12-25T06:22:27.219Z'),
  },
} as Meta<DatePickerProps>

export const Default = {}

export const DatePickerWithValue = {
  args: {
    defaultValue: new Date('2001-01-01'),
  },
}

export const DatePickerDisallowManualInput = {
  args: {
    allowManualInput: false,
    defaultValue: new Date('2021-09-13'),
  },
}

export const Mobile = {
  parameters: getMobileViewParameters(),
}

export const Prefilled = {
  args: {
    defaultValue: new Date('2021-09-13'),
    isDisabled: true,
  },
}

export const Error = {
  args: {
    isInvalid: true,
  },
}
