import { Meta, StoryFn } from '@storybook/react'

import { FormLabel, FormLabelProps } from './FormLabel'

export default {
  title: 'Components/FormControl/FormLabel',
  component: FormLabel,
  decorators: [],
} as Meta

export const Default = {
  args: {
    children: 'This is a label that is very very very long',
  },
}

export const WithQuestionNumber = {
  args: {
    questionNumber: '1.',
    children: 'This is a label that is very very very long',
  },
}

export const WithIsRequired = {
  args: {
    questionNumber: '1.',
    isRequired: true,
    children: 'This is a label that is very very very long',
  },

  name: 'With isRequired',
}

export const WithDescription = {
  args: {
    questionNumber: '1.',
    description: 'Additional description',
    children: 'This is a label that is very very very long',
  },
}

export const WithMarkdownDescription = {
  args: {
    children: 'This is a label',
    description:
      'Description _can_ **have** [Markdown](https://guides.github.com/features/mastering-markdown/)',
    useMarkdownForDescription: true,
  },
}

export const WithTooltipText = {
  args: {
    questionNumber: '1.',
    tooltipText: 'This is a tooltip',
    children: 'This is a label that is very very very long',
  },
}
