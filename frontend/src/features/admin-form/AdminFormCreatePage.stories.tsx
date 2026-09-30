import { Meta, StoryFn } from '@storybook/react'

import { PaymentChannel, PaymentType, UserId } from '~shared/types'
import {
  AdminFormDto,
  FormAuthType,
  FormColorTheme,
  FormLogoState,
  FormResponseMode,
} from '~shared/types/form'

import {
  createFormBuilderMocks,
  getAdminFormCollaborators,
  getAdminFormSettings,
  getAdminFormSubmissions,
  MOCK_FORM_FIELDS_WITH_MYINFO,
  MOCK_FORM_LOGICS,
} from '~/mocks/msw/handlers/admin-form'
import { getFreeSmsQuota } from '~/mocks/msw/handlers/admin-form/twilio'
import { getUser, MOCK_USER } from '~/mocks/msw/handlers/user'

import {
  AdminFormCreatePageDecorator,
  getMobileViewParameters,
  getTabletViewParameters,
  LoggedInDecorator,
  mockDateDecorator,
  ViewedFeatureTourDecorator,
} from '~utils/storybook'

import { CreatePage } from '~features/admin-form/create/CreatePage'

const buildMswRoutes = (
  overrides?: Partial<AdminFormDto>,
  delay?: number | 'infinite' | 'real',
) => {
  return [
    getAdminFormSettings(),
    getAdminFormCollaborators(),
    getAdminFormSubmissions(),
    ...createFormBuilderMocks(
      {
        ...overrides,
        startPage: {
          logo: { state: FormLogoState.Default },
          colorTheme: FormColorTheme.Blue,
          paragraph: 'Fill in this mock form in this story.',
          estTimeTaken: 300,
        },
      },
      delay,
    ),
    getAdminFormSubmissions(),
    getUser({
      delay: 0,
      mockUser: { ...MOCK_USER, _id: 'adminFormTestUserId' as UserId },
    }),
    getFreeSmsQuota({ delay }),
  ]
}

export default {
  title: 'Pages/AdminFormPage/Create',
  // component: To be implemented,
  decorators: [
    ViewedFeatureTourDecorator,
    AdminFormCreatePageDecorator,
    LoggedInDecorator,
    mockDateDecorator,
  ],
  parameters: {
    // Required so skeleton "animation" does not hide content.
    // Pass a very short delay to avoid bug where Chromatic takes a snapshot before
    // the story has loaded
    chromatic: { pauseAnimationAtEnd: true, delay: 200 },
    layout: 'fullscreen',
    msw: buildMswRoutes(),
    userId: 'adminFormTestUserId',
  },
} as Meta

const Template: StoryFn = () => <CreatePage />

export const DesktopEmpty = {
  render: Template,
}

export const DesktopAllFields = {
  render: Template,

  parameters: {
    msw: buildMswRoutes({
      form_fields: MOCK_FORM_FIELDS_WITH_MYINFO,
      authType: FormAuthType.MyInfo,
      responseMode: FormResponseMode.Email,
    }),
  },
}

export const DesktopLoading = {
  render: Template,

  parameters: {
    msw: buildMswRoutes({}, 'infinite'),
  },
}

export const TabletEmpty = {
  render: Template,
  parameters: getTabletViewParameters(),
}

export const TabletAllFields = {
  render: Template,

  parameters: {
    ...getTabletViewParameters(),
    msw: buildMswRoutes({ form_fields: MOCK_FORM_FIELDS_WITH_MYINFO }),
  },
}

export const TabletLoading = {
  render: Template,

  parameters: {
    ...getTabletViewParameters(),
    mockdate: new Date('2024-09-11T13:00:00.000Z'),
    msw: buildMswRoutes({}, 'infinite'),
  },
}

export const MobileEmpty = {
  render: Template,
  parameters: getMobileViewParameters(),
}

export const MobileAllFields = {
  render: Template,

  parameters: {
    ...getMobileViewParameters(),
    msw: buildMswRoutes({ form_fields: MOCK_FORM_FIELDS_WITH_MYINFO }),
  },
}

export const MobileLoading = {
  render: Template,

  parameters: {
    ...getMobileViewParameters(),
    msw: buildMswRoutes({}, 'infinite'),
  },
}

export const AllFieldsFieldsHiddenByLogic = {
  render: Template,

  parameters: {
    msw: buildMswRoutes({
      form_fields: MOCK_FORM_FIELDS_WITH_MYINFO,
      form_logics: MOCK_FORM_LOGICS,
      authType: FormAuthType.MyInfo,
      responseMode: FormResponseMode.Email,
    }),
  },
}

export const FormWithWebhook = {
  render: Template,

  parameters: {
    msw: [
      getAdminFormSettings({
        overrides: {
          webhook: {
            url: 'some-webhook-url',
            isRetryEnabled: false,
          },
        },
      }),
      ...buildMswRoutes(),
    ],
  },
}

export const FormWithWebhookMobile = {
  render: Template,

  parameters: {
    ...FormWithWebhook.parameters,
    ...getMobileViewParameters(),
  },
}

export const FormWithPayment = {
  render: Template,

  parameters: {
    msw: buildMswRoutes({
      responseMode: FormResponseMode.Encrypt,
      payments_channel: {
        channel: PaymentChannel.Stripe,
        target_account_id: 'acct_sampleid',
        publishable_key: 'pk_samplekey',
      },
      payments_field: {
        enabled: true,
        description: 'Test event registration fee',
        payment_type: PaymentType.Variable,
        min_amount: 1000,
        max_amount: 5000,
      },
    }),
  },
}

export const FormWithPaymentMobile = {
  render: Template,

  parameters: {
    ...FormWithPayment.parameters,
    ...getMobileViewParameters(),
  },
}
