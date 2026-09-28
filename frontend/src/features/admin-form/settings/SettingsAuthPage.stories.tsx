import { Meta, StoryFn } from '@storybook/react'

import { PaymentChannel } from '~shared/types'
import {
  FormAuthType,
  FormResponseMode,
  FormSettings,
  FormStatus,
} from '~shared/types/form'

import {
  createFormBuilderMocks,
  getAdminFormSettings,
  MOCK_FORM_FIELDS_WITH_MYINFO,
  patchAdminFormSettings,
  putFormWhitelistSettingSimulateCsvStringValidationError,
} from '~/mocks/msw/handlers/admin-form'

import { StoryRouter, viewports } from '~utils/storybook'

import { SettingsAuthPage } from './SettingsAuthPage'

const DUMMY_STRIPE_PAYMENT_CHANNEL_VALUE = {
  channel: PaymentChannel.Stripe,
  target_account_id: 'dummy',
  publishable_key: 'dummy',
}

const buildEmailModeMswRoutes = (overrides?: Partial<FormSettings>) => [
  getAdminFormSettings({ overrides }),
  patchAdminFormSettings({ overrides }),
]

const buildEncryptModeMswRoutes = (overrides: Partial<FormSettings>) => [
  getAdminFormSettings({ overrides, mode: FormResponseMode.Encrypt }),
  patchAdminFormSettings({ overrides, mode: FormResponseMode.Encrypt }),
]

export default {
  title: 'Pages/AdminFormPage/Settings/AuthTab',
  component: SettingsAuthPage,
  decorators: [StoryRouter({ initialEntries: ['/12345'], path: '/:formId' })],
  parameters: {
    // Required so skeleton "animation" does not hide content.
    chromatic: { pauseAnimationAtEnd: true },
    msw: buildEmailModeMswRoutes(),
  },
} as Meta

const Template: StoryFn = () => <SettingsAuthPage />

export const PrivateEmailNilAuthForm = {
  render: Template,

  parameters: {
    msw: buildEmailModeMswRoutes({ status: FormStatus.Private }),
  },
}

export const PrivateStorageNilAuthForm = {
  render: Template,

  parameters: {
    msw: buildEncryptModeMswRoutes({
      responseMode: FormResponseMode.Encrypt,
      status: FormStatus.Private,
    }),
  },
}

export const PublicEmailNilAuthForm = {
  render: Template,

  parameters: {
    msw: buildEmailModeMswRoutes({
      responseMode: FormResponseMode.Email,
      status: FormStatus.Public,
    }),
  },
}

export const PublicStorageNilAuthForm = {
  render: Template,

  parameters: {
    msw: buildEncryptModeMswRoutes({
      responseMode: FormResponseMode.Encrypt,
      status: FormStatus.Public,
    }),
  },
}

export const PublicStorageNilAuthFormSubmitterIdCollectionEnabled = {
  render: Template,

  parameters: {
    msw: buildEncryptModeMswRoutes({
      responseMode: FormResponseMode.Encrypt,
      status: FormStatus.Public,
      isSubmitterIdCollectionEnabled: true,
    }),
  },
}

export const PrivateStorageCorppassForm = {
  render: Template,

  parameters: {
    msw: buildEncryptModeMswRoutes({
      status: FormStatus.Private,
      authType: FormAuthType.CP,
      esrvcId: 'STORYBOOK-TEST',
      responseMode: FormResponseMode.Encrypt,
    }),
  },
}

export const PublicEmailSingpassForm = {
  render: Template,

  parameters: {
    msw: buildEmailModeMswRoutes({
      status: FormStatus.Public,
      authType: FormAuthType.SP,
      esrvcId: 'STORYBOOK-TEST',
      responseMode: FormResponseMode.Email,
    }),
  },
}

export const PrivateEmailMyInfoWithoutMyInfoFieldsForm = {
  render: Template,

  parameters: {
    msw: [
      ...buildEmailModeMswRoutes({
        status: FormStatus.Private,
        authType: FormAuthType.MyInfo,
        esrvcId: 'STORYBOOK-TEST',
      }),
      ...createFormBuilderMocks({ form_fields: [] }),
    ],
  },
}

export const PrivateEmailMyinfoForm = {
  render: Template,

  parameters: {
    msw: [
      ...buildEmailModeMswRoutes({
        status: FormStatus.Private,
        authType: FormAuthType.MyInfo,
        esrvcId: 'STORYBOOK-TEST',
      }),
      ...createFormBuilderMocks({ form_fields: MOCK_FORM_FIELDS_WITH_MYINFO }),
    ],
  },
}

export const PublicEmailMyInfoForm = {
  render: Template,

  parameters: {
    msw: [
      ...buildEmailModeMswRoutes({
        status: FormStatus.Public,
        authType: FormAuthType.MyInfo,
        esrvcId: 'STORYBOOK-TEST',
      }),
      ...createFormBuilderMocks({ form_fields: MOCK_FORM_FIELDS_WITH_MYINFO }),
    ],
  },
}

export const PrivateEmailSingpassFormSubmitterIdCollectionEnabled = {
  render: Template,

  parameters: {
    msw: buildEmailModeMswRoutes({
      status: FormStatus.Private,
      authType: FormAuthType.SGID,
      isSubmitterIdCollectionEnabled: true,
    }),
  },
}

export const PrivateEmailMyInfoFormSubmitterIdCollectionEnabled = {
  render: Template,

  parameters: {
    msw: [
      ...buildEmailModeMswRoutes({
        status: FormStatus.Private,
        authType: FormAuthType.MyInfo,
        esrvcId: 'STORYBOOK-TEST',
        isSubmitterIdCollectionEnabled: true,
      }),
      ...createFormBuilderMocks({ form_fields: MOCK_FORM_FIELDS_WITH_MYINFO }),
    ],
  },
}

export const PrivateEmailSingpassFormSingleSubmissionEnabled = {
  render: Template,

  parameters: {
    msw: buildEmailModeMswRoutes({
      status: FormStatus.Private,
      authType: FormAuthType.SGID,
      isSingleSubmission: true,
    }),
  },
}

export const PrivateStorageSingpassFormAllTogglesEnabled = {
  render: Template,

  parameters: {
    msw: buildEncryptModeMswRoutes({
      status: FormStatus.Private,
      authType: FormAuthType.SGID,
      isSingleSubmission: true,
      isSubmitterIdCollectionEnabled: true,
    }),
  },
}

export const PublicEmailCorppassAllTogglesEnabledForm = {
  render: Template,

  parameters: {
    msw: buildEmailModeMswRoutes({
      status: FormStatus.Public,
      authType: FormAuthType.CP,
      isSingleSubmission: true,
      isSubmitterIdCollectionEnabled: true,
    }),
  },
}

export const PrivateStorageMyInfoPaymentEnabledForm = {
  render: Template,

  parameters: {
    msw: [
      ...buildEncryptModeMswRoutes({
        status: FormStatus.Private,
        authType: FormAuthType.MyInfo,
        esrvcId: 'STORYBOOK-TEST',
        responseMode: FormResponseMode.Encrypt,
        payments_channel: DUMMY_STRIPE_PAYMENT_CHANNEL_VALUE,
      }),
      ...createFormBuilderMocks({ form_fields: MOCK_FORM_FIELDS_WITH_MYINFO }),
    ],
  },
}

export const PublicStorageMyInfoPaymentEnabledForm = {
  render: Template,

  parameters: {
    msw: [
      ...buildEncryptModeMswRoutes({
        status: FormStatus.Public,
        authType: FormAuthType.MyInfo,
        esrvcId: 'STORYBOOK-TEST',
        responseMode: FormResponseMode.Encrypt,
        payments_channel: DUMMY_STRIPE_PAYMENT_CHANNEL_VALUE,
      }),
      ...createFormBuilderMocks({ form_fields: MOCK_FORM_FIELDS_WITH_MYINFO }),
    ],
  },
}

export const PrivateStorageSgidPaymentEnabledForm = {
  render: Template,

  parameters: {
    msw: [
      ...buildEncryptModeMswRoutes({
        status: FormStatus.Private,
        authType: FormAuthType.SGID,
        responseMode: FormResponseMode.Encrypt,
        payments_channel: DUMMY_STRIPE_PAYMENT_CHANNEL_VALUE,
      }),
    ],
  },
}

export const PrivateStorageSgidWhitelistEnabledForm = {
  render: Template,

  parameters: {
    msw: [
      ...buildEncryptModeMswRoutes({
        status: FormStatus.Private,
        authType: FormAuthType.SGID,
        responseMode: FormResponseMode.Encrypt,
        whitelistedSubmitterIds: {
          isWhitelistEnabled: true,
        },
      }),
    ],
  },
}

export const PrivateStorageMyInfoUpdateWhitelistValidationErrorForm = {
  render: Template,

  parameters: {
    msw: [
      ...buildEncryptModeMswRoutes({
        status: FormStatus.Private,
        authType: FormAuthType.MyInfo,
        responseMode: FormResponseMode.Encrypt,
        whitelistedSubmitterIds: {
          isWhitelistEnabled: false,
        },
      }),
      putFormWhitelistSettingSimulateCsvStringValidationError('12345'),
    ],
    docs: {
      description: {
        story:
          'Uploading a valid CSV file should display a mock validation error. This story is used to simulate validation errors are displayed correctly in the UI.',
      },
    },
  },
}

export const Tablet = {
  render: Template,

  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    chromatic: { viewports: [viewports.md] },
    msw: PrivateStorageSingpassFormAllTogglesEnabled.parameters.msw,
  },
}

export const Mobile = {
  render: Template,

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
    msw: PrivateStorageSingpassFormAllTogglesEnabled.parameters.msw,
  },
}

export const Loading = {
  render: Template,

  parameters: {
    msw: [getAdminFormSettings({ delay: 'infinite' })],
  },
}
