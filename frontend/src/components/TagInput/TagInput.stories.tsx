import { Meta, StoryFn } from '@storybook/react'

import { getMobileViewParameters } from '~utils/storybook'

import { TagInput, TagInputProps } from './TagInput'

export default {
  title: 'Components/TagInput',
  component: TagInput,
  decorators: [],
  parameters: {
    actions: { argTypesRegex: '^on.*' },
  },
} as Meta<TagInputProps>

export const Default = {
  args: {},
}

export const WithValue = {
  args: {
    defaultValue: ['foo', 'bar'],
  },
}

export const Disabled = {
  args: {
    isDisabled: true,
  },
}

export const DisabledWithValue = {
  args: {
    ...WithValue.args,
    ...Disabled.args,
  },
}

export const InvalidField = {
  args: {
    ...WithValue.args,
    isInvalid: true,
  },
}

export const InvalidFieldWithInvalidTags = {
  args: {
    isInvalid: true,
    defaultValue: ['foo', 'bar', 'bazinvalid'],
    tagValidation: (tag) => tag.length <= 3,
  },
}

export const Mobile = {
  args: {
    defaultValue: [
      'somethingreallylong_that_should_overflow_the_input@example.com',
      'test@example.com',
    ],
  },

  parameters: getMobileViewParameters(),
}
