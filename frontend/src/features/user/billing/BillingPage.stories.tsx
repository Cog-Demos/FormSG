import { StoryObj, Meta, StoryFn } from '@storybook/react'

import {
  getBillingInfo,
  getEmptyBillingInfo,
} from '~/mocks/msw/handlers/billing'

import { BILLING_ROUTE } from '~constants/routes'
import { StoryRouter, viewports } from '~utils/storybook'

import { BillCharges, BillChargesProps } from './BillCharges'
import { BillingPage } from './BillingPage'

const MOCK_ESRVCID = 'MOCK_ESRVCID'
const MOCK_DATE_RANGE = { yr: 2022, mth: 5 }

export default {
  title: 'Pages/BillingPage',
  decorators: [
    StoryRouter({
      initialEntries: [BILLING_ROUTE],
      path: BILLING_ROUTE,
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    chromatic: { delay: 200 },
  },
} as Meta

// BillingPage

const PageTemplate: StoryFn = () => <BillingPage />

export const DesktopDefault = {
  render: PageTemplate,

  parameters: {
    msw: [getEmptyBillingInfo()],
  },
}

export const TabletDefault = {
  render: PageTemplate,

  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    chromatic: { viewports: [viewports.md] },
    msw: [getEmptyBillingInfo()],
  },
}

export const MobileDefault = {
  render: PageTemplate,

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
    msw: [getEmptyBillingInfo()],
  },
}

// BillCharges

const MOCK_BILLCHARGES_ARGS = {
  esrvcId: MOCK_ESRVCID,
  dateRange: MOCK_DATE_RANGE,
  todayDateRange: MOCK_DATE_RANGE,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setDateRange: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onSubmitEsrvcId: async () => {},
}

export const DesktopNoCharges: StoryObj<BillChargesProps> = {
  render: (args) => <BillCharges {...args} />,

  args: MOCK_BILLCHARGES_ARGS,

  parameters: {
    msw: [getEmptyBillingInfo()],
  },
}

export const TabletNoCharges: StoryObj<BillChargesProps> = {
  render: (args) => <BillCharges {...args} />,

  args: MOCK_BILLCHARGES_ARGS,

  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    chromatic: { viewports: [viewports.md] },
    msw: [getEmptyBillingInfo()],
  },
}

export const MobileNoCharges: StoryObj<BillChargesProps> = {
  render: (args) => <BillCharges {...args} />,

  args: MOCK_BILLCHARGES_ARGS,

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
    msw: [getEmptyBillingInfo()],
  },
}

export const DesktopHasCharges: StoryObj<BillChargesProps> = {
  render: (args) => <BillCharges {...args} />,

  args: MOCK_BILLCHARGES_ARGS,

  parameters: {
    msw: [getBillingInfo({ delay: 1000 })],
  },
}

export const TabletHasCharges: StoryObj<BillChargesProps> = {
  render: (args) => <BillCharges {...args} />,

  args: MOCK_BILLCHARGES_ARGS,

  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    chromatic: { viewports: [viewports.md] },
    msw: [getBillingInfo({ delay: 1000 })],
  },
}

export const MobileHasCharges: StoryObj<BillChargesProps> = {
  render: (args) => <BillCharges {...args} />,

  args: MOCK_BILLCHARGES_ARGS,

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
    msw: [getBillingInfo({ delay: 1000 })],
  },
}

export const DesktopLoading: StoryObj<BillChargesProps> = {
  render: (args) => <BillCharges {...args} />,

  args: MOCK_BILLCHARGES_ARGS,

  parameters: {
    msw: [getBillingInfo({ delay: 'infinite' })],
  },
}

export const TabletLoading: StoryObj<BillChargesProps> = {
  render: (args) => <BillCharges {...args} />,

  args: MOCK_BILLCHARGES_ARGS,

  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    chromatic: { viewports: [viewports.md] },
    msw: [getBillingInfo({ delay: 'infinite' })],
  },
}

export const MobileLoading: StoryObj<BillChargesProps> = {
  render: (args) => <BillCharges {...args} />,

  args: MOCK_BILLCHARGES_ARGS,

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
    msw: [getBillingInfo({ delay: 'infinite' })],
  },
}
