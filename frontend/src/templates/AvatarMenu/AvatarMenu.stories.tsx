import { Meta, StoryFn } from '@storybook/react'

import Menu from '../../components/Menu'

import { AvatarMenu, AvatarMenuDivider, AvatarMenuProps } from './AvatarMenu'

const DEFAULT_MENU_ITEMS = (
  <>
    <Menu.Item>Billing</Menu.Item>
    <Menu.Item>Emergency contact</Menu.Item>
    <AvatarMenuDivider />
    <Menu.Item>Log out</Menu.Item>
  </>
)

export default {
  title: 'Templates/AvatarMenu',
  component: AvatarMenu,
  args: {
    name: 'My name',
    menuUsername: 'someuser@email.com',
    hasNotification: false,
    defaultIsOpen: false,
    children: DEFAULT_MENU_ITEMS,
  },
} as Meta<AvatarMenuProps>

export const Default = {}

export const OpenMenu = {
  args: {
    defaultIsOpen: true,
  },
}

export const WithNotification = {
  args: {
    hasNotification: true,
  },
}

export const OpenMenuWithNotification = {
  args: {
    hasNotification: true,
    defaultIsOpen: true,
  },
}
