import { FormControl } from '@chakra-ui/form-control'
import { Meta, StoryFn } from '@storybook/react'

import { FormFieldMessage, FormFieldMessageProps } from './FormFieldMessage'

export default {
  title: 'Components/FormControl/FormFieldMessage',
  component: FormFieldMessage,
  decorators: [],
} as Meta

const Template: StoryFn<FormFieldMessageProps> = (args) => (
  // FormControl component required to pass appropriate props into component.
  <FormControl>
    <FormFieldMessage {...args} />
  </FormControl>
)

export const Info = {
  render: Template,

  args: {
    children: 'Date of birth should be in DD/MM/YYYY format.',
    variant: 'info',
  },
}

export const Success = {
  render: Template,

  args: {
    children: 'This is a success message.',
    variant: 'success',
  },
}
