import { Meta } from '@storybook/react'

import { BasicField } from '~shared/types/field'

import { viewports } from '~utils/storybook'

import { VerificationBox, VerificationBoxProps } from './VerificationBox'

export default {
  title: 'Features/VerifiableField/VerificationBox',
  component: VerificationBox,
  decorators: [],
  args: {
    handleResendOtp: () => Promise.resolve(console.log('resending otp')),
    handleVfnSuccess: () => Promise.resolve(console.log('vfn success')),
    handleVerifyOtp: () => Promise.resolve('some-mock-signature'),
  },
} as Meta<VerificationBoxProps>

export const MobileVerificationBox = {
  args: {
    fieldType: BasicField.Mobile,
  },
}

export const MobileVerificationBoxMobile = {
  args: {
    fieldType: BasicField.Mobile,
  },

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
  },
}

export const EmailVerificationBox = {
  args: {
    fieldType: BasicField.Email,
  },
}

export const EmailVerificationBoxMobile = {
  args: {
    fieldType: BasicField.Email,
  },

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
  },
}
