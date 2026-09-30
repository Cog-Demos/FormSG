import { MemoryRouter, Route } from 'react-router'
import { Routes } from 'react-router-dom'
import { Meta, StoryFn } from '@storybook/react'

import {
  createFormBuilderMocks,
  getAdminFormCollaborators,
  getAdminFormFeedback,
  getAdminFormIssue,
  getEmptyAdminFormFeedback,
  getEmptyAdminFormIssue,
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
import { FeedbackPage, FormResultsLayout, ResponsesPage } from './responses'

const DEFAULT_MSW_ROUTES = [
  ...createFormBuilderMocks({}, 0),
  getStorageSubmissionMetadataResponse(),
  getAdminFormFeedback(),
  getAdminFormIssue(),
  getUser(),
  getAdminFormCollaborators(),
]

export default {
  title: 'Pages/AdminFormPage/Results/FeedbackTab',
  component: FeedbackPage,
  parameters: {
    // Required so skeleton "animation" does not hide content.
    chromatic: { pauseAnimationAtEnd: true },
    layout: 'fullscreen',
    msw: DEFAULT_MSW_ROUTES,
  },
} as Meta

const Template: StoryFn = () => {
  return (
    <MemoryRouter
      initialEntries={[
        `${ADMINFORM_ROUTE}/61540ece3d4a6e50ac0cc6ff/${ADMINFORM_RESULTS_SUBROUTE}/${RESULTS_FEEDBACK_SUBROUTE}`,
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
            <Route index element={<ResponsesPage />} />
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

export const Default = {
  render: Template,
}

export const EmptyReviewAndIssue = {
  render: Template,

  parameters: {
    msw: [
      getEmptyAdminFormIssue(),
      getEmptyAdminFormFeedback(),
      ...DEFAULT_MSW_ROUTES,
    ],
  },
}

export const EmptyReview = {
  render: Template,

  parameters: {
    msw: [getEmptyAdminFormFeedback(), ...DEFAULT_MSW_ROUTES],
  },
}

export const EmptyIssue = {
  render: Template,

  parameters: {
    msw: [getEmptyAdminFormIssue(), ...DEFAULT_MSW_ROUTES],
  },
}

export const Tablet = {
  render: Template,

  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    chromatic: { viewports: [viewports.md] },
  },
}

export const Mobile = {
  render: Template,
  parameters: getMobileViewParameters(),
}

export const LoadingDesktop = {
  render: Template,
  name: 'Loading/Desktop',

  parameters: {
    msw: [getAdminFormIssue({ delay: 'infinite' }), ...DEFAULT_MSW_ROUTES],
  },
}

export const LoadingMobile = {
  render: Template,
  name: 'Loading/Mobile',

  parameters: {
    ...getMobileViewParameters(),
    ...LoadingDesktop.parameters,
  },
}
