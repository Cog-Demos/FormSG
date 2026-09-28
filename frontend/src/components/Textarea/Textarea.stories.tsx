import { useForm } from 'react-hook-form'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'
import { Meta, StoryObj } from '@storybook/react'

import Button from '../Button'

import { Textarea, TextareaProps } from './Textarea'

export default {
  title: 'Components/Textarea',
  component: Textarea,
  decorators: [],
} as Meta

export const Default = {
  args: {
    placeholder: 'Test placeholder',
  },
}

export const Prefilled = {
  args: {
    placeholder: 'Test placeholder',
    defaultValue: 'Prefilled field',
    isPrefilled: true,
  },
}

export const Error = {
  args: {
    isInvalid: true,
    placeholder: 'Test placeholder',
    defaultValue: 'Field error',
  },
}

export const Success = {
  args: {
    isInvalid: false,
    isSuccess: true,
    placeholder: 'Test placeholder',
    defaultValue: 'Field success',
  },
}

export const Disabled = {
  args: {
    defaultValue: 'Some text',
    placeholder: 'Test placeholder',
    isDisabled: true,
  },
}

type PlaygroundArgs = TextareaProps & {
  name: string
  label: string
  isDisabled?: boolean
  isRequired?: boolean
}

export const Playground: StoryObj<PlaygroundArgs> = {
  render: function Render({ name, label, isDisabled, isRequired, ...args }) {
    const {
      handleSubmit,
      register,
      formState: { errors },
    } = useForm<Record<string, string>>()
    const onSubmit = (data: unknown) => alert(JSON.stringify(data))

    return (
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormControl
          isRequired={isRequired}
          isDisabled={isDisabled}
          isInvalid={!!errors[name]}
          mb={6}
        >
          <FormLabel htmlFor={name}>{label}</FormLabel>
          <Textarea
            {...args}
            {...register(name, {
              required: isRequired
                ? { value: true, message: 'Required field' }
                : false,
            })}
          />
          <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        </FormControl>
        <Button variant="solid" type="submit">
          Submit
        </Button>
      </form>
    )
  },

  args: {
    name: 'Test playground Textarea',
    label: 'Field label',
    placeholder: 'Fill in this field',
    isRequired: true,
    isDisabled: false,
  },
}
