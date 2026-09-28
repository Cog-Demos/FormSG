import { ChakraProvider, TagLabel } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { theme } from '~theme/index'

import { Tag, TagCloseButton } from './Tag'

describe('Tag', () => {
  it('renders a close button that reads styles from the parent tag', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <ChakraProvider theme={theme}>
        <Tag>
          <TagLabel>Synthetic option</TagLabel>
          <TagCloseButton onClick={onClick} />
        </Tag>
      </ChakraProvider>,
    )

    await user.click(
      screen.getByRole('button', { name: 'Remove selected option' }),
    )

    expect(screen.getByText('Synthetic option')).toBeInTheDocument()
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
