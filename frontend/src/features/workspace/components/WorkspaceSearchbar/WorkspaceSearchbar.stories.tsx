import { StoryObj, Meta, StoryFn } from '@storybook/react'

import {
  WorkspaceSearchbar,
  WorkspaceSearchbarProps,
} from './WorkspaceSearchbar'

export default {
  title: 'Pages/WorkspacePage/WorkspaceSearchbar',
  component: WorkspaceSearchbar,
  decorators: [],
} as Meta

export const Default: StoryObj<WorkspaceSearchbarProps> = {
  render: (args) => {
    return <WorkspaceSearchbar {...args} />
  },
}
