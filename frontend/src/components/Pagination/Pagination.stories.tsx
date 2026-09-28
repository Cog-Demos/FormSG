import { useEffect, useState } from 'react'
import { Meta, StoryFn } from '@storybook/react'

import { viewports } from '~utils/storybook'

import { Pagination, PaginationProps } from './Pagination'

export default {
  title: 'Components/Pagination',
  component: Pagination,
  decorators: [],
} as Meta

const Template: StoryFn<PaginationProps> = (args) => {
  const [currentPage, setCurrentPage] = useState(args.currentPage)

  useEffect(() => {
    setCurrentPage(args.currentPage)
  }, [args.currentPage])

  return (
    <Pagination
      {...args}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    />
  )
}

export const Default = {
  render: Template,

  args: {
    currentPage: 5,
    totalCount: 1000,
    pageSize: 10,
  },
}

export const Disabled = {
  render: Template,

  args: {
    currentPage: 5,
    totalCount: 1000,
    pageSize: 10,
    isDisabled: true,
  },
}

export const SiblingCountEquals2 = {
  render: Template,

  args: {
    currentPage: 31,
    totalCount: 1000,
    pageSize: 10,
    siblingCount: 2,
  },
}

export const Exactly7Pages = {
  render: Template,

  args: {
    currentPage: 1,
    totalCount: 70,
    pageSize: 10,
    siblingCount: 1,
  },
}

export const Exactly8Pages = {
  render: Template,

  args: {
    currentPage: 1,
    totalCount: 80,
    pageSize: 10,
    siblingCount: 1,
  },
}

export const LessThan7Pages = {
  render: Template,

  args: {
    currentPage: 1,
    totalCount: 60,
    pageSize: 10,
    siblingCount: 1,
  },
}

export const StartOf100Pages = {
  render: Template,

  args: {
    currentPage: 1,
    totalCount: 1000,
    pageSize: 10,
    siblingCount: 1,
  },
}

export const EndOf100Pages = {
  render: Template,

  args: {
    currentPage: 100,
    totalCount: 1000,
    pageSize: 10,
    siblingCount: 1,
  },
}

export const MiddleOf100Pages = {
  render: Template,

  args: {
    currentPage: 31,
    totalCount: 1000,
    pageSize: 10,
    siblingCount: 1,
  },
}

export const Mobile = {
  render: Template,

  args: {
    currentPage: 31,
    totalCount: 1000,
    pageSize: 10,
    siblingCount: 1,
  },

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
  },
}

export const MobileDisabled = {
  render: Template,

  args: {
    currentPage: 31,
    totalCount: 1000,
    pageSize: 10,
    siblingCount: 1,
    isDisabled: true,
  },

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
  },
}
