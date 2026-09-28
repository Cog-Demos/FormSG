import { Meta, StoryFn, StoryObj } from '@storybook/react'
import { expect, userEvent, waitFor, within } from '@storybook/test'
import dedent from 'dedent'

import { BasicField } from '~shared/types/field'
import {
  FormAuthType,
  FormColorTheme,
  FormResponseMode,
} from '~shared/types/form'

import {
  getPreviewFormErrorResponse,
  getPreviewFormResponse,
} from '~/mocks/msw/handlers/admin-form/preview-form'
import { envHandlers } from '~/mocks/msw/handlers/env'
import {
  postGenerateVfnOtpResponse,
  postVerifyVfnOtpResponse,
  postVfnTransactionResponse,
  PREVENT_SUBMISSION_LOGIC,
  SHOW_FIELDS_ON_YES_LOGIC,
} from '~/mocks/msw/handlers/public-form'

import { ADMINFORM_PREVIEW_ROUTE } from '~constants/routes'
import { getMobileViewParameters, StoryRouter } from '~utils/storybook'

import PreviewFormPage from './PreviewFormPage'

const DEFAULT_MSW_HANDLERS = [
  ...envHandlers,
  getPreviewFormResponse(),
  postVfnTransactionResponse(),
  postGenerateVfnOtpResponse(),
  postVerifyVfnOtpResponse(),
]

const generateMswHandlersForColorTheme = (colorTheme: FormColorTheme) => {
  return [
    ...envHandlers,
    getPreviewFormResponse({
      overrides: {
        form: {
          startPage: {
            colorTheme,
          },
        },
      },
    }),
    postVfnTransactionResponse(),
    postGenerateVfnOtpResponse(),
    postVerifyVfnOtpResponse(),
  ]
}

export default {
  title: 'Pages/PreviewFormPage',
  component: PreviewFormPage,
  decorators: [
    StoryRouter({
      initialEntries: ['/61540ece3d4a6e50ac0cc6ff/preview'],
      path: `/:formId/${ADMINFORM_PREVIEW_ROUTE}`,
    }),
  ],
  parameters: {
    // Required so skeleton "animation" does not hide content.
    chromatic: { pauseAnimationAtEnd: true },
    layout: 'fullscreen',
    msw: DEFAULT_MSW_HANDLERS,
  },
} as Meta

const Template: StoryFn = () => <PreviewFormPage />

export const Default = {
  render: Template,
}

export const WithShortInstructions = {
  render: Template,

  parameters: {
    msw: [
      ...envHandlers,
      getPreviewFormResponse({
        delay: 0,
        overrides: {
          form: {
            startPage: { paragraph: 'Fill in this mock form in this story.' },
          },
        },
      }),
    ],
  },
}

export const WithLongInstructions = {
  render: Template,

  parameters: {
    msw: [
      ...envHandlers,
      getPreviewFormResponse({
        delay: 0,
        overrides: {
          form: {
            startPage: {
              paragraph: dedent`
              Fill in this mock form in this story.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ac tincidunt orci. Vivamus id nisl tellus. Aliquam ullamcorper nec diam id ornare. Praesent mattis ligula egestas magna sagittis, non aliquet mauris sollicitudin. In maximus euismod nunc eget pellentesque. Maecenas sollicitudin lobortis consectetur. Suspendisse potenti. Nam a est risus.

              Aliquam egestas diam in velit pellentesque lacinia. Praesent nunc ex, fermentum sed nunc nec, laoreet dignissim nisi. Vivamus et lorem non velit facilisis luctus. Sed et luctus magna, sed tincidunt odio. Fusce quis pretium eros. Mauris in est ornare, aliquam odio quis, porttitor lacus. Aliquam dignissim laoreet libero, sed pharetra enim. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

              Donec scelerisque eros mattis tempor commodo. Vestibulum massa ante, fermentum nec sollicitudin eu, tincidunt sed lectus. Etiam maximus luctus dapibus. Morbi et mollis nibh. Praesent ante orci, pellentesque vel molestie ut, lobortis nec dui. Aliquam eleifend luctus pharetra. Nullam lacinia eget erat ac commodo. Curabitur suscipit felis a venenatis consectetur. Cras dictum, metus a egestas aliquam, ipsum neque fermentum orci, vitae fermentum neque mi non arcu.`,
            },
          },
        },
      }),
    ],
  },
}

export const WithCaptcha = {
  render: Template,

  parameters: {
    msw: [
      ...envHandlers,
      getPreviewFormResponse({
        delay: 0,
        overrides: {
          form: {
            hasCaptcha: true,
          },
        },
      }),
    ],
  },
}

export const Mobile = {
  render: Template,
  parameters: getMobileViewParameters(),
}

export const ColorThemeGreen = {
  render: Template,

  parameters: {
    msw: generateMswHandlersForColorTheme(FormColorTheme.Green),
  },
}

export const ColorThemeGrey = {
  render: Template,

  parameters: {
    msw: generateMswHandlersForColorTheme(FormColorTheme.Grey),
  },
}

export const ColorThemeBrown = {
  render: Template,

  parameters: {
    msw: generateMswHandlersForColorTheme(FormColorTheme.Brown),
  },
}

export const ColorThemeRed = {
  render: Template,

  parameters: {
    msw: generateMswHandlersForColorTheme(FormColorTheme.Red),
  },
}

export const ColorThemeOrange = {
  render: Template,

  parameters: {
    msw: generateMswHandlersForColorTheme(FormColorTheme.Orange),
  },
}

export const Loading = {
  render: Template,

  parameters: {
    msw: [...envHandlers, getPreviewFormResponse({ delay: 'infinite' })],
  },
}

export const SingpassUnauthorized = {
  render: Template,
  name: 'Singpass/Unauthorized',

  parameters: {
    msw: [
      ...envHandlers,
      getPreviewFormResponse({
        delay: 0,
        overrides: {
          form: {
            title: 'Singpass login form',
            authType: FormAuthType.SP,
            startPage: {
              colorTheme: FormColorTheme.Grey,
            },
          },
        },
      }),
    ],
  },
}

export const UnauthedMobile = {
  render: Template,

  parameters: {
    ...SingpassUnauthorized.parameters,
    ...getMobileViewParameters(),
  },
}

export const SingpassAuthorized = {
  render: Template,
  name: 'Singpass/Authorized',

  parameters: {
    msw: [
      ...envHandlers,
      getPreviewFormResponse({
        delay: 0,
        overrides: {
          form: {
            title: 'Singpass login form',
            authType: FormAuthType.SP,
          },
        },
      }),
    ],
  },
}

export const CorppassUnauthorized = {
  render: Template,
  name: 'Corppass/Unauthorized',

  parameters: {
    msw: [
      ...envHandlers,
      getPreviewFormResponse({
        delay: 0,
        overrides: {
          form: {
            title: 'Corppass login form',
            authType: FormAuthType.CP,
          },
        },
      }),
    ],
  },
}

export const CorppassAuthorized = {
  render: Template,
  name: 'Corppass/Authorized',

  parameters: {
    msw: [
      ...envHandlers,
      getPreviewFormResponse({
        delay: 0,
        overrides: {
          form: {
            title: 'Corppass login form',
            authType: FormAuthType.CP,
          },
        },
      }),
    ],
  },
}

export const SgidUnauthorized = {
  render: Template,
  name: 'SGID/Unauthorized',

  parameters: {
    msw: [
      ...envHandlers,
      getPreviewFormResponse({
        delay: 0,
        overrides: {
          form: {
            title: 'SGID login form',
            authType: FormAuthType.SGID,
          },
        },
      }),
    ],
  },
}

export const SgidAuthorized = {
  render: Template,
  name: 'SGID/Authorized',

  parameters: {
    msw: [
      ...envHandlers,
      getPreviewFormResponse({
        delay: 0,
        overrides: {
          form: {
            title: 'SGID login form',
            authType: FormAuthType.SGID,
          },
        },
      }),
    ],
  },
}

export const VerifiedFieldsExpiry = {
  render: Template,

  parameters: {
    msw: [
      postVfnTransactionResponse({
        expiryMsOverride: 3 * 1000,
      }),
      getPreviewFormResponse({
        overrides: {
          form: {
            form_fields: [
              {
                allowIntlNumbers: true,
                isVerifiable: true,
                title: 'Verifiable Mobile Number',
                description:
                  'Verify with random number and OTP. The field should reset after 3 seconds.',
                required: true,
                disabled: false,
                fieldType: BasicField.Mobile,
                _id: 'some-random-id',
                globalId: 'not-used',
              },
            ],
          },
        },
      }),
      ...DEFAULT_MSW_HANDLERS,
    ],
  },
}

export const WithShowFieldLogic = {
  render: Template,

  parameters: {
    msw: [
      getPreviewFormResponse({
        overrides: {
          form: {
            form_fields: [
              {
                title: '',
                description:
                  'Select "Yes" on the field below to show more fields',
                required: true,
                disabled: false,
                fieldType: BasicField.Statement,
                _id: 'some-random-id',
                globalId: 'not-used',
              },
            ],
            form_logics: [SHOW_FIELDS_ON_YES_LOGIC],
          },
        },
      }),
      ...DEFAULT_MSW_HANDLERS,
    ],
  },
}

export const WithPreventSubmissionLogic: StoryObj = {
  render: Template,

  parameters: {
    msw: [
      getPreviewFormResponse({
        overrides: {
          form: {
            form_fields: [
              {
                title: '',
                description:
                  'Select "Yes" on the field below to prevent submission',
                required: true,
                disabled: false,
                fieldType: BasicField.Statement,
                _id: 'some-random-id',
                globalId: 'not-used',
              },
            ],
            form_logics: [PREVENT_SUBMISSION_LOGIC],
          },
        },
      }),
      ...DEFAULT_MSW_HANDLERS,
    ],
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(
      async () => {
        await userEvent.click(
          canvas.getByTestId(
            `${PREVENT_SUBMISSION_LOGIC.conditions[0].field}-right`,
          ),
        )
      },
      { timeout: 5000 },
    )
    await expect(
      canvas.getByText(
        /this should show up in storybook mock when yes\/no is true/i,
      ),
    ).toBeInTheDocument()
  },
}

export const FormNotFound = {
  render: Template,

  parameters: {
    msw: [getPreviewFormErrorResponse()],
  },
}

export const FormNotFoundMobile = {
  render: Template,

  parameters: {
    ...FormNotFound.parameters,
    ...getMobileViewParameters(),
  },
}

export const WithPayment = {
  render: Template,

  parameters: {
    msw: [
      getPreviewFormResponse({
        overrides: {
          form: {
            responseMode: FormResponseMode.Encrypt,
            payments_field: {
              enabled: true,
              amount_cents: 5000,
              description: 'Mock event registration',
            },
          },
        },
      }),
      ...DEFAULT_MSW_HANDLERS,
    ],
  },
}
