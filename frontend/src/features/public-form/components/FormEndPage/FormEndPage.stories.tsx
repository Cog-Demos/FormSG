import { MemoryRouter } from 'react-router-dom'
import { Meta, StoryFn } from '@storybook/react'

import { FormColorTheme } from '~shared/types'

import { getPublicFormResponse } from '~/mocks/msw/handlers/public-form'

import { getMobileViewParameters } from '~utils/storybook'

import { PublicFormProvider } from '~features/public-form/PublicFormProvider'

import { FormEndPage, FormEndPageProps } from './FormEndPage'

export default {
  title: 'Pages/PublicFormPage/FormEndPage',
  component: FormEndPage,
  decorators: [
    (storyFn) => (
      <MemoryRouter initialEntries={['/12345']}>
        <PublicFormProvider
          formId="61540ece3d4a6e50ac0cc6ff"
          startTime={Date.now()}
        >
          {storyFn()}
        </PublicFormProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'light',
    },
    layout: 'fullscreen',
    msw: [getPublicFormResponse()],
  },
} as Meta<FormEndPageProps>

export const Default = {
  args: {
    endPage: {
      buttonText: 'Continue',
      title:
        'Thank you for your submission with some super long backstory about how important the submission is to them',
      paragraph:
        'We will get back to you shortly.\n\nOnce again,\r\nthank you.',
      paymentTitle: '',
      paymentParagraph: '',
    },
    submissionData: {
      id: 'mockSubmissionId',
      timestamp: 1648545566989,
    },
    handleSubmitFeedback: (inputs: unknown) => console.log(inputs),
  },
}

export const ColorThemeGreen = {
  args: {
    ...Default.args,
    colorTheme: FormColorTheme.Green,
  },
}

export const ColorThemeGrey = {
  args: {
    ...Default.args,
    colorTheme: FormColorTheme.Grey,
  },
}

export const ColorThemeBrown = {
  args: {
    ...Default.args,
    colorTheme: FormColorTheme.Brown,
  },
}

export const ColorThemeRed = {
  args: {
    ...Default.args,
    colorTheme: FormColorTheme.Red,
  },
}

export const ColorThemeOrange = {
  args: {
    ...Default.args,
    colorTheme: FormColorTheme.Orange,
  },
}

export const FeedbackSubmitted = {
  args: {
    ...Default.args,
    isFeedbackSectionHidden: true,
  },
}

export const Mobile = {
  args: {
    ...Default.args,
  },

  parameters: getMobileViewParameters(),
}
