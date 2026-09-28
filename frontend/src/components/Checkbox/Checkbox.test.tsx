import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { theme } from '~theme/index'

import { Checkbox } from './Checkbox'

describe('Checkbox.OthersCheckbox', () => {
  it('keeps the checkbox container layout of a regular option', () => {
    render(
      <ChakraProvider theme={theme}>
        <Checkbox value="apple" data-testid="option">
          apple
        </Checkbox>
        <Checkbox.OthersWrapper>
          <Checkbox.OthersCheckbox value="others" data-testid="others" />
        </Checkbox.OthersWrapper>
      </ChakraProvider>,
    )

    const optionLabel = screen.getByTestId('option')
    const othersLabel = screen.getByTestId('others')

    expect(optionLabel.tagName).toBe('LABEL')
    expect(othersLabel.tagName).toBe('LABEL')
    expect(getComputedStyle(optionLabel).display).toBe('inline-flex')
    expect(getComputedStyle(othersLabel).display).toBe('inline-flex')
    expect(getComputedStyle(othersLabel).width).toBe('100%')
  })
})
