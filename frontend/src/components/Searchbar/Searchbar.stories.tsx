import { Box, Flex, Text } from '@chakra-ui/react'
import { Meta, StoryFn, StoryObj } from '@storybook/react'

import { Searchbar, SearchbarProps } from './Searchbar'
import { useSearchbar } from './useSearchbar'

export default {
  title: 'Components/Searchbar',
  component: Searchbar,
  decorators: [],
} as Meta

export const Default: StoryObj<SearchbarProps> = {
  args: {
    onChange: (newValue) => console.log('typed: ', newValue),
    onSearch: (query) => console.log(query),
  },
}

const ExpandableClosedTemplate: StoryFn<SearchbarProps> = ({
  isExpanded: isInitiallyExpanded,
  ...args
}) => {
  const { inputRef, isExpanded, handleExpansion, handleCollapse } =
    useSearchbar({
      isInitiallyExpanded,
    })

  return (
    <Searchbar
      ref={inputRef}
      isExpanded={isExpanded}
      onExpandIconClick={handleExpansion}
      onCollapseIconClick={handleCollapse}
      {...args}
    />
  )
}

export const ExpandableClosed: StoryObj<SearchbarProps> = {
  render: ExpandableClosedTemplate,

  args: {
    isExpanded: false,
    onSearch: (query) => console.log(query),
  },

  name: 'Expandable/Closed',
}

const ExpandableOpenTemplate: StoryFn<SearchbarProps> = ({
  isExpanded: isInitiallyExpanded,
  ...args
}) => {
  const { inputRef, isExpanded, handleExpansion, handleCollapse } =
    useSearchbar({
      isInitiallyExpanded,
      isFocusOnExpand: false,
    })

  return (
    <Searchbar
      ref={inputRef}
      isExpanded={isExpanded}
      onExpandIconClick={handleExpansion}
      onCollapseIconClick={handleCollapse}
      {...args}
    />
  )
}

export const ExpandableOpen: StoryObj<SearchbarProps> = {
  render: ExpandableOpenTemplate,

  args: {
    isExpanded: true,
    onSearch: (query) => console.log(query),
  },

  name: 'Expandable/Open',
}

const UnexpandableTemplate: StoryFn<SearchbarProps> = ({
  isExpanded: isInitiallyExpanded,
  ...args
}) => {
  const { inputRef, isExpanded, handleExpansion, handleCollapse } =
    useSearchbar({
      isInitiallyExpanded,
      isFocusOnExpand: false,
    })

  return (
    <Searchbar
      ref={inputRef}
      isExpandable={false}
      isExpanded={isExpanded}
      onExpandIconClick={handleExpansion}
      onCollapseIconClick={handleCollapse}
      {...args}
    />
  )
}

export const Unexpandable: StoryObj<SearchbarProps> = {
  render: UnexpandableTemplate,

  args: {
    isExpandable: false,
    isExpanded: true,
    onSearch: (query) => console.log(query),
  },
}

const PlaygroundTemplate: StoryFn<SearchbarProps> = ({
  isExpanded: isInitiallyExpanded,
  ...args
}) => {
  const { isExpanded, inputRef, handleExpansion, handleCollapse } =
    useSearchbar({ isInitiallyExpanded })

  return (
    <Box
      bg="neutral.100"
      p="2.625rem"
      color="secondary.500"
      transitionProperty="position"
    >
      <Text textStyle="h2">Form examples</Text>
      <Flex justify="space-between">
        <Text textStyle="body-1">Explore forms and use as a template</Text>
        <Flex align="center" maxW="25rem" justify="flex-end">
          <Searchbar
            ref={inputRef}
            isExpanded={isExpanded}
            onExpandIconClick={handleExpansion}
            onCollapseIconClick={handleCollapse}
            {...args}
          />
        </Flex>
      </Flex>
    </Box>
  )
}

export const Playground: StoryObj<SearchbarProps> = {
  render: PlaygroundTemplate,

  args: {
    isExpanded: false,
    onSearch: (query) => alert(`${query} is being searched`),
  },
}
