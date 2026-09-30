import { useDisclosure } from '@chakra-ui/react'
import { Meta, StoryFn } from '@storybook/react'

import {
  fullScreenDecorator,
  getMobileViewParameters,
  LoggedInDecorator,
  StoryRouter,
} from '~utils/storybook'

import {
  FormIssueFeedbackModal,
  FormIssueFeedbackProps,
} from './FormIssueFeedbackModal'

export default {
  title: 'Features/PublicForm/PreSubmissionFeedbackModal',
  component: FormIssueFeedbackModal,
  decorators: [
    fullScreenDecorator,
    LoggedInDecorator,
    StoryRouter({ initialEntries: ['/12345'], path: '/:formId' }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: StoryFn<FormIssueFeedbackProps> = (args) => {
  const modalProps = useDisclosure({ defaultIsOpen: true })

  return (
    <FormIssueFeedbackModal
      {...args}
      {...modalProps}
      onClose={() => console.log('close modal')}
    />
  )
}

export const PublicView = {
  render: Template,

  args: {
    isPreview: false,
  },
}

export const MobilePublicView = {
  render: Template,

  parameters: {
    ...getMobileViewParameters(),
  },

  args: {
    isPreview: false,
  },
}

export const AdminPreview = {
  render: Template,

  args: {
    isPreview: true,
  },
}

export const MobileAdminPreView = {
  render: Template,

  parameters: {
    ...getMobileViewParameters(),
  },

  args: {
    isPreview: true,
  },
}
