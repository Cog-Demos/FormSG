import { useDisclosure } from '@chakra-ui/react'
import { Meta, StoryFn } from '@storybook/react'

import { fullScreenDecorator, getMobileViewParameters } from '~utils/storybook'

import {
  DownloadWithAttachmentFlowStates,
  DownloadWithAttachmentModal,
  DownloadWithAttachmentModalProps,
} from './DownloadWithAttachmentModal'

export default {
  title: 'Features/Storage/DownloadWithAttachmentModal',
  component: DownloadWithAttachmentModal,
  decorators: [fullScreenDecorator],
  args: { responsesCount: 12345 },
  parameters: {
    layout: 'fullscreen',
    // Prevent flaky tests due to modal animating in.
    chromatic: { delay: 200 },
  },
} as Meta<DownloadWithAttachmentModalProps>

const Template: StoryFn<DownloadWithAttachmentModalProps> = (args) => {
  const modalProps = useDisclosure({ defaultIsOpen: true })
  return (
    <DownloadWithAttachmentModal
      {...modalProps}
      {...args}
      onDownload={() => console.log('Downloading...')}
      onClose={() => console.log('close modal')}
      onCancel={() => console.log('cancel download')}
    />
  )
}

export const ConfirmationStateDesktop = {
  render: Template,

  args: {
    downloadPercentage: 0,
    isDownloading: false,
    responsesCount: 9001,
  },
}

export const ConfirmationStateMobile = {
  render: Template,
  args: ConfirmationStateDesktop.args,
  parameters: getMobileViewParameters(),
}

export const DownloadingStateDesktop = {
  render: Template,

  args: {
    initialState: [DownloadWithAttachmentFlowStates.Progress, -1],
    downloadPercentage: 30,
    isDownloading: false,
    responsesCount: 12345,
  },
}

export const DownloadingStateMobile = {
  render: Template,
  args: DownloadingStateDesktop.args,
  parameters: getMobileViewParameters(),
}

export const CompleteStateDesktop = {
  render: Template,

  args: {
    downloadMetadata: {
      errorCount: 0,
      successCount: 12345,
      expectedCount: 12345,
    },
  },
}

export const CompleteStateMobile = {
  render: Template,
  args: CompleteStateDesktop.args,
  parameters: getMobileViewParameters(),
}

export const CanceledStateDesktop = {
  render: Template,

  args: {
    downloadMetadata: {
      isCanceled: true,
    },
  },
}

export const PartialSuccessStateDesktop = {
  render: Template,

  args: {
    downloadMetadata: {
      errorCount: 10,
      successCount: 12335,
      expectedCount: 12345,
    },
  },
}

export const PartialSuccessStateMobile = {
  render: Template,

  args: {
    downloadMetadata: {
      errorCount: 1,
      successCount: 1,
      expectedCount: 2,
    },
  },

  parameters: getMobileViewParameters(),
}
