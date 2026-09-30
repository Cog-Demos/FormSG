import { Meta, StoryObj } from '@storybook/react'

import { Banner, BannerProps } from './Banner'

export default {
  title: 'Components/Banner',
  component: Banner,
  decorators: [],
} as Meta

export const Default: StoryObj<BannerProps> = {
  args: {
    children: 'You can insert a normal string here.',
    useMarkdown: false,
  },
}

export const WithMarkdown: StoryObj<BannerProps> = {
  args: {
    children: `**Markdown** is also accepted.`,
    useMarkdown: true,
  },
}

export const Info: StoryObj<BannerProps> = {
  args: {
    variant: 'info',
    children: `Look at this [website](http://localhost:6006) or [Form](https://www.form.gov.sg).`,
    useMarkdown: true,
  },
}

export const Warn: StoryObj<BannerProps> = {
  args: {
    variant: 'warn',
    children: `Look at this [website](http://localhost:6006) or [Form](https://www.form.gov.sg).`,
    useMarkdown: true,
  },
}

export const Error: StoryObj<BannerProps> = {
  args: {
    variant: 'error',
    children: `Look at this [website](http://localhost:6006) or [Form](https://www.form.gov.sg).`,
    useMarkdown: true,
  },
}
