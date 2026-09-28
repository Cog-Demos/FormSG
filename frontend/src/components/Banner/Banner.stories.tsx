import { Meta, StoryFn } from '@storybook/react'

import { Banner, BannerProps } from './Banner'

export default {
  title: 'Components/Banner',
  component: Banner,
  decorators: [],
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
    children: `Look at this [website](http://localhost:6006) or [Form](https://www.form.gov.sg).`,
    useMarkdown: true,
  },
}

export const Warn = {
  args: {
    variant: 'warn',
    children: `Look at this [website](http://localhost:6006) or [Form](https://www.form.gov.sg).`,
    useMarkdown: true,
  },
}

export const Error = {
  args: {
    variant: 'error',
    children: `Look at this [website](http://localhost:6006) or [Form](https://www.form.gov.sg).`,
    useMarkdown: true,
  },
}
