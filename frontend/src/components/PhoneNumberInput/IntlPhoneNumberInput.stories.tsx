import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/form-control'
import { Args, Meta, StoryFn, StoryObj } from '@storybook/react'
import { isValidPhoneNumber } from 'libphonenumber-js/mobile'

import Button from '../Button'

import { PhoneNumberInput, PhoneNumberInputProps } from './PhoneNumberInput'

export default {
  title: 'Components/PhoneNumberInput/International',
  component: PhoneNumberInput,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  decorators: [],
} as Meta

const Template: StoryFn<PhoneNumberInputProps> = (args) => {
  const [value, setValue] = useState<string | undefined>(args.value ?? '')
  return (
    <PhoneNumberInput
      {...args}
      value={value}
      onChange={(...params) => {
        args.onChange?.(...params)
        setValue(...params)
      }}
    />
  )
}

export const Default = {
  render: Template,
  args: {},
}

export const Prefilled = {
  render: Template,

  args: {
    value: '+12015550123',
    isPrefilled: true,
  },
}

export const Error = {
  render: Template,

  args: {
    isInvalid: true,
    value: '999',
  },
}

export const Success = {
  render: Template,

  args: {
    isInvalid: false,
    isSuccess: true,
    placeholder: 'Enter number',
    value: '+6598765432',
  },
}

export const Disabled = {
  render: Template,

  args: {
    value: '123',
    isDisabled: true,
  },
}

export const Playground: StoryObj = {
  render: function Render({
    name,
    label,
    isDisabled,
    isRequired,
    defaultValue,
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
            control={control}
            name={name}
            defaultValue={defaultValue}
            rules={{
              required: isRequired
                ? { value: true, message: 'Required field' }
                : false,
              validate: (val) => {
                return isValidPhoneNumber(val) || 'Invalid number'
              },
            }}
            render={({ field }) => <PhoneNumberInput {...args} {...field} />}
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
    isRequired: true,
    isDisabled: false,
    defaultValue: '98765432',
  },
}
