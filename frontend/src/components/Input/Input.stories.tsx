import { useForm } from 'react-hook-form'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/form-control'
import { Args, Meta, StoryObj } from '@storybook/react'

import Button from '../Button'

import { Input } from './Input'

export default {
  title: 'Components/Input',
  component: Input,
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

export const PrefilledLocked = {
  args: {
    placeholder: 'Test placeholder',
    defaultValue: 'Prefilled locked field',
    isPrefilled: true,
    isPrefillLocked: true,
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

export const Playground: StoryObj = {
  render: function Render({
    name,
    label,
    isDisabled,
    isRequired,
    ...args
  }: Args) {
    const {
      handleSubmit,
      register,
      formState: { errors },
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
          <Input
            {...args}
            {...register(name, {
              required: isRequired
                ? { value: true, message: 'Required field' }
                : false,
            })}
          />
          <FormErrorMessage>
            {errors[name]?.message?.toString()}
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
