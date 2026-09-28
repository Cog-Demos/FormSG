import { BiRadioCircleMarked } from 'react-icons/bi'
import { SimpleGrid, Text } from '@chakra-ui/react'
import { Meta, StoryFn } from '@storybook/react'

import { Tag, TagCloseButton, TagLeftIcon, TagProps, TagRightIcon } from './Tag'

export default {
  title: 'Components/Tag',
  component: Tag,
  decorators: [],
} as Meta

export const Subtle = {
  args: {
    children: 'Subtle tag',
    variant: 'subtle',
  },
}

export const Solid = {
  args: {
    children: 'Solid tag',
    variant: 'solid',
    colorScheme: 'secondary',
  },
}

export const WithCloseButton = {
  args: {
    children: (
      <>
        Solid tag
        <TagCloseButton />
      </>
    ),
    variant: 'subtle',
    colorScheme: 'secondary',
  },
}

export const WithLeftRightIcon = {
  args: {
    children: (
      <>
        <TagLeftIcon as={BiRadioCircleMarked} />
        Solid tag
        <TagRightIcon as={BiRadioCircleMarked} />
      </>
    ),
    variant: 'solid',
    colorScheme: 'secondary',
  },
}

const TemplateGroup: StoryFn<TagProps> = (args) => (
  <SimpleGrid
    columns={3}
    spacing={8}
    templateColumns="max-content max-content max-content"
    alignItems="center"
  >
    <Text>primary</Text>
    <Tag {...args} colorScheme="primary" />
    <Tag {...args} aria-disabled colorScheme="primary" />
    <Text>secondary</Text>
    <Tag {...args} colorScheme="secondary" />
    <Tag {...args} aria-disabled colorScheme="secondary" />
    <Text>warning</Text>
    <Tag {...args} colorScheme="warning" />
    <Tag {...args} aria-disabled colorScheme="warning" />
    <Text>success</Text>
    <Tag {...args} colorScheme="success" />
    <Tag {...args} aria-disabled colorScheme="success" />
    <Text>neutral</Text>
    <Tag {...args} colorScheme="neutral" />
    <Tag {...args} aria-disabled colorScheme="neutral" />
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
