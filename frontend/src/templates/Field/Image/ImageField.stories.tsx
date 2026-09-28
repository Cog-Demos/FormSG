import { Meta, StoryFn } from '@storybook/react'
import { merge } from 'lodash'
import { rest } from 'msw'

import { BasicField } from '~shared/types/field'

import { viewports } from '~utils/storybook'

import { ImageFieldSchema } from '../types'

import MockImage from './mocks/img-login.svg'
import {
  ImageField as ImageFieldComponent,
  ImageFieldProps,
} from './ImageField'

export default {
  title: 'Templates/Field/ImageField',
  component: ImageFieldComponent,
  decorators: [],
  parameters: {
    docs: {
      // Required in this story due to react-hook-form conflicting with
      // Storybook somehow.
      // See https://github.com/storybookjs/storybook/issues/12747.
      source: {
        type: 'code',
      },
    },
  },
} as Meta

const baseSchema: ImageFieldSchema = {
  title: 'Some image title',
  description:
    'SVG of our landing page image. See more at [Form](https://form.gov.sg)',
  required: true,
  disabled: false,
  fieldType: BasicField.Image,
  _id: '611b94dfbb9e300012f702a7',
  fileMd5Hash: 'some hash',
  name: 'some name',
  size: '12345',
  url: MockImage,
}

interface StoryImageFieldProps extends ImageFieldProps {
  defaultValue?: string
}

const Template: StoryFn<StoryImageFieldProps> = ({ defaultValue, ...args }) => {
  return <ImageFieldComponent {...args} />
}

export const Default = {
  render: Template,

  args: {
    schema: baseSchema,
  },
}

export const Mobile = {
  render: Template,

  args: {
    schema: baseSchema,
  },

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
  },
}

export const Tablet = {
  render: Template,

  args: {
    schema: baseSchema,
  },

  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    chromatic: { viewports: [viewports.md] },
  },
}

export const Loading = {
  render: Template,

  args: {
    schema: merge({}, baseSchema, { url: '/mock/api' }),
  },

  parameters: {
    msw: [
      rest.get('/mock/api', (_req, res, ctx) => {
        return res(ctx.delay('infinite'))
      }),
    ],
  },
}

export const EmptySrc = {
  render: Template,

  args: {
    schema: merge({}, baseSchema, { url: '' }),
  },
}

export const InvalidSrc = {
  render: Template,

  args: {
    schema: merge({}, baseSchema, { url: 'this is an invalid url' }),
  },
}
