import { MemoryRouter } from 'react-router-dom'
import { useDisclosure } from '@chakra-ui/react'
import { Meta, StoryFn } from '@storybook/react'

import { fullScreenDecorator } from '~utils/storybook'

import { ShareFormModal, ShareFormModalProps } from './ShareFormModal'

export default {
  title: 'Pages/AdminFormPage/Share/ShareFormModal',
  component: ShareFormModal,
  decorators: [
    (storyFn) => <MemoryRouter>{storyFn()}</MemoryRouter>,
    fullScreenDecorator,
  ],
  parameters: {
    layout: 'fullscreen',
    // Prevent flaky tests due to modal animating in.
    chromatic: { pauseAnimationAtEnd: true },
  },
} as Meta

const Template: StoryFn<ShareFormModalProps> = (args) => {
  const modalProps = useDisclosure({ defaultIsOpen: true })

  return (
    <ShareFormModal
      {...args}
      {...modalProps}
      onClose={() => console.log('close modal')}
    />
  )
}

export const Default = {
  render: Template,

  args: {
    formId: 'mock-storybook-id',
  },
}

export const Loading = {
  render: Template,
}

export const PrivateFormWarning = {
  render: Template,

  args: {
    ...Default.args,
    isFormPrivate: true,
  },
}
