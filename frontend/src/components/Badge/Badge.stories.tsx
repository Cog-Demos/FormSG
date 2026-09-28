import { SimpleGrid, Text } from '@chakra-ui/react'
import { Meta, StoryFn } from '@storybook/react'

import { Badge, BadgeProps } from './Badge'

export default {
  title: 'Components/Badge',
  component: Badge,
  decorators: [],
} as Meta<BadgeProps>

export const Solid = {
  args: {
    colorScheme: 'success',
    children: 'Badge name',
    variant: 'solid',
  },
}

export const Subtle = {
  args: {
    children: 'Badge name',
    variant: 'subtle',
  },
}

const TemplateGroup: StoryFn<BadgeProps> = (args) => (
  <SimpleGrid
    columns={2}
    spacing={8}
    templateColumns="max-content max-content"
    alignItems="center"
  >
    <Text>primary</Text>
    <Badge {...args} colorScheme="primary" />
    <Text>secondary</Text>
    <Badge {...args} colorScheme="secondary" />
    <Text>warning</Text>
    <Badge {...args} colorScheme="warning" />
    <Text>success</Text>
    <Badge {...args} colorScheme="success" />
    <Text>neutral</Text>
    <Badge {...args} colorScheme="neutral" />
  </SimpleGrid>
)

export const SubtleColours = {
  render: TemplateGroup,

  args: {
    children: 'Subtle',
    variant: 'subtle',
  },
}

export const SolidColours = {
  render: TemplateGroup,

  args: {
    children: 'Solid',
    variant: 'solid',
  },
}
