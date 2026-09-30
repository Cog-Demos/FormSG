import { Controller, useForm } from 'react-hook-form'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/form-control'
import { Meta, StoryFn, StoryObj } from '@storybook/react'

import Button from '../Button'

import { MoneyInput } from './MoneyInput'

export default {
  title: 'Components/MoneyInput',
  component: MoneyInput,
  decorators: [],
} as Meta

export const Default: StoryObj<typeof MoneyInput> = {
  args: {
    placeholder: 'Test placeholder',
  },
}

export const Prefilled: StoryObj<typeof MoneyInput> = {
  args: {
    placeholder: 'Test placeholder',
    defaultValue: '3.142',
    isPrefilled: true,
  },
}

export const Error: StoryObj<typeof MoneyInput> = {
  args: {
    isInvalid: true,
  },
}

export const Success: StoryObj<typeof MoneyInput> = {
  args: {
    isInvalid: false,
    isSuccess: true,
  },
}

export const Disabled: StoryObj<typeof MoneyInput> = {
  args: {
    isDisabled: true,
  },
}

const PlaygroundTemplate: StoryFn = ({
  name,
  label,
  isDisabled,
  isRequired,
  ...args
}) => {
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm()
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
        <FormErrorMessage>
          {errors[name] && errors[name].message}
        </FormErrorMessage>
      </FormControl>
      <Button variant="solid" type="submit">
        Submit
      </Button>
    </form>
  )
}

export const Playground: StoryObj = {
  render: PlaygroundTemplate,

  args: {
    name: 'Test playground input',
    label: 'Field label',
    placeholder: 'Fill in this field',
    isRequired: true,
    isDisabled: false,
  },
}
