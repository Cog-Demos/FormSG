import { Meta, StoryObj } from '@storybook/react'

import { ResendOtpButton, ResendOtpButtonProps } from './ResendOtpButton'
import {
  ResendOtpButtonContainer,
  ResendOtpButtonContainerProps,
} from './ResendOtpButtonContainer'

export default {
  title: 'Templates/Button/ResendOtpButton',
  component: ResendOtpButton,
  decorators: [],
} as Meta

export const Default: StoryObj<ResendOtpButtonProps> = {
  args: {},
}

export const Loading: StoryObj<ResendOtpButtonProps> = {
  args: {
    isLoading: true,
  },
}

export const InProgress: StoryObj<ResendOtpButtonProps> = {
  args: {
    timer: 30,
    isDisabled: true,
  },
}

export const Playground: StoryObj<ResendOtpButtonContainerProps> = {
  render: (args) => <ResendOtpButtonContainer {...args} />,

  args: {
    onResendOtp: () => new Promise((res) => setTimeout(res, 800)),
  },
}
