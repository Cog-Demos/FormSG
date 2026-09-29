import { TabList, TabPanel, TabPanels, Tabs, TabsProps } from '@chakra-ui/react'
import { Meta, StoryFn } from '@storybook/react'

import { useDraggable } from '~hooks/useDraggable'
import { viewports } from '~utils/storybook'

import { Tab } from './Tab'

export default {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    backgrounds: {
      default: 'tabs-light',
      values: [
        // secondary.100
        { name: 'tabs-light', value: '#F5F6F8' },
      ],
    },
  },
} as Meta

const TabTemplate: StoryFn<TabsProps> = (args) => {
  const { ref, onMouseDown } = useDraggable()

  return (
    <Tabs {...args}>
      <TabList ref={ref} onMouseDown={onMouseDown}>
        <Tab>Create</Tab>
        <Tab>Settings</Tab>
        <Tab>Results</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>Content of Create tab</TabPanel>
        <TabPanel>Content of Settings tab</TabPanel>
        <TabPanel>Content of Results tab</TabPanel>
      </TabPanels>
    </Tabs>
  )
}

export const LightTab = {
  render: TabTemplate,

  args: {
    variant: 'line-light',
  },
}

export const DarkTab = {
  render: TabTemplate,

  args: {
    variant: 'line-dark',
  },
}

export const WithScrollingLight = {
  render: TabTemplate,

  args: {
    variant: 'line-light',
  },

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
  },
}

export const WithScrollingDark = {
  render: TabTemplate,

  args: {
    variant: 'line-dark',
  },

  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [viewports.xs] },
  },
}

export const VerticalLine = {
  render: TabTemplate,

  args: {
    variant: 'line',
    orientation: 'vertical',
  },
}
