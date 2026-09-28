import { MemoryRouter, Route } from 'react-router'
import { Routes } from 'react-router-dom'
import { Meta, StoryFn } from '@storybook/react'
import { expect, userEvent, waitFor, within } from '@storybook/test'

import { FormResponseMode } from '~shared/types/form'

import {
  createFormBuilderMocks,
  getAdminFormCollaborators,
  getAdminFormSubmissions,
  getStorageSubmissionMetadataResponse,
} from '~/mocks/msw/handlers/admin-form'
import { getUser } from '~/mocks/msw/handlers/user'

import {
  ADMINFORM_RESULTS_SUBROUTE,
  ADMINFORM_ROUTE,
  RESULTS_FEEDBACK_SUBROUTE,
} from '~constants/routes'
import { getMobileViewParameters, viewports } from '~utils/storybook'

import { AdminFormLayout } from './common/AdminFormLayout'
import {
  FeedbackPage,
  FormResultsLayout,
  ResponsesLayout,
  ResponsesPage,
} from './responses'

export default {
  title: 'Pages/AdminFormPage/Results/ResponsesTab',
  parameters: {
    // Required so skeleton "animation" does not hide content.
    chromatic: { pauseAnimationAtEnd: true },
    layout: 'fullscreen',
    msw: [
      ...createFormBuilderMocks({}, 0),
      getAdminFormSubmissions(),
      getUser(),
      getAdminFormCollaborators(),
    ],
  },
} as Meta

// Generated for testing.
const MOCK_KEYPAIR = {
  publicKey: 'lC4uMSTsWDuT6bZGE2cMEevSpIrcDoZOT1uyThWFzno=',
  secretKey: 'xdXNlI2HyZzsVXcvCR/LT4350oW/yRZNx2lMi+555Yk=',
}

const Template: StoryFn = () => {
  return (
    <MemoryRouter
      initialEntries={[
        `${ADMINFORM_ROUTE}/61540ece3d4a6e50ac0cc6ff/${ADMINFORM_RESULTS_SUBROUTE}`,
      ]}
    >
      <Routes>
        <Route
          path={`${ADMINFORM_ROUTE}/:formId`}
          element={<AdminFormLayout />}
        >
          <Route
            path={ADMINFORM_RESULTS_SUBROUTE}
            element={<FormResultsLayout />}
          >
            <Route element={<ResponsesLayout />}>
              <Route index element={<ResponsesPage />} />
            </Route>
            <Route
              path={RESULTS_FEEDBACK_SUBROUTE}
              element={<FeedbackPage />}
            />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

export const EmailForm = {
  render: Template,
}

export const EmailFormLoading = {
  render: Template,

  parameters: {
    msw: [
      ...createFormBuilderMocks({}, 0),
      getAdminFormSubmissions({ delay: 'infinite' }),
      getUser(),
      getAdminFormCollaborators(),
    ],
  },
}

export const EmptyEmailForm = {
  render: Template,

  parameters: {
    msw: [
      ...createFormBuilderMocks({}, 0),
      getAdminFormSubmissions({
        override: 0,
      }),
      getUser(),
      getAdminFormCollaborators(),
    ],
  },
}

export const EmailFormTablet = {
  render: Template,

  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    chromatic: { viewports: [viewports.md] },
  },
}

export const EmailFormMobile = {
  render: Template,
  parameters: getMobileViewParameters(),
}

export const StorageForm = {
  render: Template,

  parameters: {
    msw: [
      ...createFormBuilderMocks(
        {
          responseMode: FormResponseMode.Encrypt,
          publicKey: MOCK_KEYPAIR.publicKey,
        },
        0,
      ),
      getAdminFormSubmissions(),
      getStorageSubmissionMetadataResponse(),
      getUser(),
      getAdminFormCollaborators(),
    ],
  },
}

export const StorageFormUnlocked = {
  render: Template,
  parameters: StorageForm.parameters,

  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)

    await waitFor(
      async () => {
        expect(canvas.getByTestId('secretKey')).not.toBeDisabled()
      },
      { timeout: 5000 },
    )
    await userEvent.type(
      canvas.getByTestId('secretKey'),
      MOCK_KEYPAIR.secretKey,
    )

    await userEvent.click(
      canvas.getByRole('button', { name: /unlock responses/i }),
    )
  },
}

export const StorageFormUnlockedTablet = {
  render: Template,

  parameters: {
    ...EmailFormTablet.parameters,
    ...StorageFormUnlocked.parameters,
  },

  play: StorageFormUnlocked.play,
}

export const StorageFormUnlockedMobile = {
  render: Template,

  parameters: {
    ...EmailFormMobile.parameters,
    ...StorageFormUnlocked.parameters,
  },

  play: StorageFormUnlocked.play,
}

export const StorageFormTablet = {
  render: Template,

  parameters: {
    ...EmailFormTablet.parameters,
    ...StorageForm.parameters,
  },
}

export const StorageFormMobile = {
  render: Template,

  parameters: {
    ...EmailFormMobile.parameters,
    ...StorageForm.parameters,
  },
}

export const StorageFormLoading = {
  render: Template,

  parameters: {
    msw: [
      ...createFormBuilderMocks({ responseMode: FormResponseMode.Encrypt }, 0),
      getAdminFormSubmissions({ delay: 'infinite' }),
      getStorageSubmissionMetadataResponse({}, 'infinite'),
      getUser(),
      getAdminFormCollaborators(),
    ],
  },
}

export const Loading = {
  render: Template,

  parameters: {
    msw: [
      ...createFormBuilderMocks({ responseMode: undefined }, 'infinite'),
      getAdminFormSubmissions({ delay: 'infinite' }),
      getUser(),
      getAdminFormCollaborators(),
    ],
  },
}
