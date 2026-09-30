import { BiGitMerge } from 'react-icons/bi'
import { ButtonGroup, SimpleGrid, Text } from '@chakra-ui/react'
import { Meta, StoryFn } from '@storybook/react'

import { IconButton, IconButtonProps } from './IconButton'

export default {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: { backgrounds: { default: 'light' } },
} as Meta

const ButtonGroupTemplate: StoryFn<IconButtonProps> = (args) => {
  return (
    <SimpleGrid
      columns={2}
      spacing={8}
      templateColumns="min-content auto"
      alignItems="center"
    >
      <Text>Default</Text>
      <ButtonGroup alignItems="center">
        <IconButton {...args} icon={<BiGitMerge />} size="lg" />
        <IconButton {...args} icon={<BiGitMerge />} size="md" />
      </ButtonGroup>
      <Text>Active</Text>
      <ButtonGroup alignItems="center">
        <IconButton {...args} icon={<BiGitMerge />} isActive size="lg" />
        <IconButton {...args} icon={<BiGitMerge />} isActive size="md" />
      </ButtonGroup>
      <Text>Disabled</Text>
      <ButtonGroup alignItems="center">
        <IconButton {...args} icon={<BiGitMerge />} isDisabled size="lg" />
        <IconButton {...args} icon={<BiGitMerge />} isDisabled size="md" />
      </ButtonGroup>
      <Text>Loading</Text>
      <ButtonGroup alignItems="center">
        <IconButton {...args} icon={<BiGitMerge />} isLoading size="lg" />
        <IconButton {...args} icon={<BiGitMerge />} isLoading size="md" />
      </ButtonGroup>
    </SimpleGrid>
  )
}

export const Default = {
  args: {
    'aria-label': 'Test Storybook Icon Button',
    icon: <BiGitMerge />,
    variant: 'solid',
    size: 'md',
  },
}

export const SolidPrimary = {
  render: ButtonGroupTemplate,

  args: {
    'aria-label': 'Test Storybook Icon Button',
    variant: 'solid',
    colorScheme: 'primary',
  },
}

export const OutlinePrimary = {
  render: ButtonGroupTemplate,

  args: {
    'aria-label': 'Test Storybook Icon Button',
    variant: 'outline',
    colorScheme: 'primary',
  },
}

export const ClearPrimary = {
  render: ButtonGroupTemplate,

  args: {
    'aria-label': 'Test Storybook Icon Button',
    variant: 'clear',
    colorScheme: 'primary',
  },
}

export const ReverseSecondary = {
  render: ButtonGroupTemplate,

  args: {
    'aria-label': 'Test Storybook Icon Button',
    variant: 'reverse',
    colorScheme: 'secondary',
  },
}

export const OutlineSecondary = {
  render: ButtonGroupTemplate,

  args: {
    'aria-label': 'Test Storybook Icon Button',
    variant: 'outline',
    colorScheme: 'secondary',
  },
}

export const ClearSecondary = {
  render: ButtonGroupTemplate,

  args: {
    'aria-label': 'Test Storybook Icon Button',
    variant: 'clear',
    colorScheme: 'secondary',
  },
}

export const SolidDanger = {
  render: ButtonGroupTemplate,

  args: {
    'aria-label': 'Test Storybook Icon Button',
    variant: 'solid',
    colorScheme: 'danger',
  },
}

export const OutlineDanger = {
  render: ButtonGroupTemplate,

  args: {
    'aria-label': 'Test Storybook Icon Button',
    variant: 'outline',
    colorScheme: 'danger',
  },
}

export const ClearDanger = {
  render: ButtonGroupTemplate,

  args: {
    'aria-label': 'Test Storybook Icon Button',
    variant: 'clear',
    colorScheme: 'danger',
  },
}
