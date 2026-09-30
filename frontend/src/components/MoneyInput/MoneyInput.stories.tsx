import { Controller, useForm } from 'react-hook-form'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'
import { Args, Meta, StoryObj } from '@storybook/react'

import Button from '../Button'

import { MoneyInput, MoneyInputProps } from './MoneyInput'

export default {
  title: 'Components/MoneyInput',
  component: MoneyInput,
  decorators: [],
} as Meta

type Story = StoryObj<MoneyInputProps & { placeholder?: string }>

export const Default: Story = {
  args: {
    placeholder: 'Test placeholder',
  },
}

export const Prefilled: Story = {
  args: {
    placeholder: 'Test placeholder',
    defaultValue: '3.142',
    isPrefilled: true,
  },
}

export const Error: Story = {
  args: {
    isInvalid: true,
  },
}

export const Success: Story = {
  args: {
    isInvalid: false,
    isSuccess: true,
  },
}

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
}

export const Playground: StoryObj<Args> = {
  render: function Render({
    name,
    label,
    isDisabled,
    isRequired,
    ...args
  }: Args) {
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
            {errors[name]?.message as string | undefined}
          </FormErrorMessage>
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
