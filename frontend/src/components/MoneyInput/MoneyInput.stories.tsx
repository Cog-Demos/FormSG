import { Controller, useForm } from 'react-hook-form'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/form-control'
import { Meta, StoryObj } from '@storybook/react'

import Button from '../Button'

import { MoneyInput, MoneyInputProps } from './MoneyInput'

export default {
  title: 'Components/MoneyInput',
  component: MoneyInput,
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
    defaultValue: '3.142',
    isPrefilled: true,
  },
}

export const Error = {
  args: {
    isInvalid: true,
  },
}

export const Success = {
  args: {
    isInvalid: false,
    isSuccess: true,
  },
}

export const Disabled = {
  args: {
    isDisabled: true,
  },
}

type PlaygroundArgs = MoneyInputProps & {
  name: string
  label: string
  placeholder?: string
}

export const Playground: StoryObj<PlaygroundArgs> = {
  render: function Render({ name, label, isDisabled, isRequired, ...args }) {
    const {
      handleSubmit,
      formState: { errors },
      control,
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
          <Controller
            name={name}
            control={control}
            rules={{
              required: isRequired
                ? { value: true, message: 'Required field' }
                : false,
            }}
            render={({ field }) => <MoneyInput {...field} {...args} />}
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
    name: 'Test playground input',
    label: 'Field label',
    placeholder: 'Fill in this field',
    isRequired: true,
    isDisabled: false,
  },
}
