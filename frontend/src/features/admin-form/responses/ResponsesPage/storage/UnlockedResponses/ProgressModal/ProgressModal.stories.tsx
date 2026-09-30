import { useDisclosure } from '@chakra-ui/react'
import { Meta, StoryFn } from '@storybook/react'

import { fullScreenDecorator, getMobileViewParameters } from '~utils/storybook'

import { ProgressModal, ProgressModalProps } from './ProgressModal'

export default {
  title: 'Features/Storage/ProgressModal',
  component: ProgressModal,
  decorators: [fullScreenDecorator],
  parameters: {
    layout: 'fullscreen',
    // Prevent flaky tests due to modal animating in.
    chromatic: { delay: 200 },
  },
  args: {
    downloadPercentage: 50,
  },
} as Meta<ProgressModalProps>

const Template: StoryFn<ProgressModalProps> = (args) => {
  const modalProps = useDisclosure({ defaultIsOpen: true })
  return (
    <ProgressModal
      {...modalProps}
      {...args}
      onClose={() => console.log('close modal')}
    />
  )
}

export const Desktop = {
  render: Template,
}

export const Mobile = {
  render: Template,
  parameters: getMobileViewParameters(),
}

export const CompleteStateDesktop = {
  render: Template,

  args: {
    downloadMetadata: {
      errorCount: 0,
      expectedCount: 9001,
      successCount: 9001,
    },
  },
}

export const CompleteStateMobile = {
  render: Template,
  args: CompleteStateDesktop.args,
  parameters: getMobileViewParameters(),
}

export const PartialSuccessStateDesktop = {
  render: Template,

  args: {
    downloadMetadata: {
      errorCount: 1,
      expectedCount: 9001,
      successCount: 9000,
    },
  },
}

export const PartialSuccessStateMobile = {
  render: Template,
  args: PartialSuccessStateDesktop.args,
  parameters: getMobileViewParameters(),
}
