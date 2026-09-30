import { Meta } from '@storybook/react'

import { InlineMessage, InlineMessageProps } from './InlineMessage'

export default {
  title: 'Components/InlineMessage',
  component: InlineMessage,
} as Meta

export const Default = {
  args: {
    children: 'You can insert a normal string here.',
    useMarkdown: false,
  },
}

export const WithMarkdown = {
  args: {
    children: `**Markdown** is also accepted.`,
    useMarkdown: true,
  },
}

export const Info = {
  args: {
    variant: 'info',
    children: `View our [complete list](http://localhost:6006) of accepted file types. Please also read our [FAQ on email reliability](http://localhost:6006) relating to unaccepted file types.`,
    useMarkdown: true,
  },
}

export const Warning = {
  args: {
    variant: 'warning',
    children:
      'Highlighted fields below have been pre-filled according to the form link you clicked. You may edit these fields if necessary, except non-editable fields with a lock icon.',
    useMarkdown: false,
  },
}

export const Error = {
  args: {
    variant: 'error',
    children: `Only 30 MyInfo fields are allowed (30/30). [Learn more](http://localhost:6006)`,
    useMarkdown: true,
  },
}
