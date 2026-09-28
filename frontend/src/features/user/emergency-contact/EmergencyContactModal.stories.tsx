import { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useDisclosure } from '@chakra-ui/react'
import { Meta, StoryFn } from '@storybook/react'
import { omit } from 'lodash'

import {
  getUser,
  MOCK_USER,
  postGenerateContactOtp,
  postVerifyContactOtp,
  userHandlers,
} from '~/mocks/msw/handlers/user'

import {
  fullScreenDecorator,
  LoggedInDecorator,
  viewports,
} from '~utils/storybook'

import { EmergencyContactModal } from './EmergencyContactModal'

export default {
  title: 'Features/User/EmergencyContactModal',
  component: EmergencyContactModal,
  decorators: [fullScreenDecorator, LoggedInDecorator],
  parameters: {
    layout: 'fullscreen',
    // Prevent flaky tests due to modal animating in.
    chromatic: { pauseAnimationAtEnd: true },
    msw: userHandlers({ delay: 0 }),
  },
} as Meta

const modalRoot = document.createElement('div')
document.body.appendChild(modalRoot)

const Template: StoryFn = () => {
  const modalProps = useDisclosure({ defaultIsOpen: true })

  const el = document.createElement('div')

  useEffect(() => {
    modalRoot.appendChild(el)

    return () => {
      modalRoot.removeChild(el)
    }
  })

  return ReactDOM.createPortal(
    <EmergencyContactModal
      {...modalProps}
      onClose={() => console.log('close modal')}
    />,
    el,
  )
}

export const WithContact = {
  render: Template,
}

export const NoContact = {
  render: Template,

  parameters: {
    msw: [
      getUser({ delay: 0, mockUser: omit(MOCK_USER, 'contact') }),
      postGenerateContactOtp({ delay: 0 }),
      postVerifyContactOtp({ delay: 0 }),
    ],
  },
}

export const Loading = {
  render: Template,

  parameters: {
    msw: userHandlers({ delay: 'infinite' }),
  },
}

export const Mobile = {
  render: Template,

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
  },
}
