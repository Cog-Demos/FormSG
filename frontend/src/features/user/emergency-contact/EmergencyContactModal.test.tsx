import { composeStories } from '@storybook/react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import parsePhoneNumber from 'libphonenumber-js'

import { MOCK_USER } from '~/mocks/msw/handlers/user'

import { INVALID_NUMBER_ERROR_MSG } from './components/ContactNumberInput'
import * as stories from './EmergencyContactModal.stories'

const { NoContact, WithContact } = composeStories(stories)

describe('User has no verified contact number', () => {
  it('should render with empty contact number details', async () => {
    // Arrange
    await act(async () => {
      await NoContact.load()
      render(<NoContact />)
    })
    // Wait until all async stuff has rendered
    await waitFor(() =>
      expect(screen.queryByPlaceholderText(/loading.*/i)).toBeNull(),
    )
    const input = screen.getByRole('textbox', {
      name: /mobile number/i,
    }) as HTMLInputElement
    const vfnButton = screen.getByRole('button', { name: /verify/i })

    // Assert
    // Should be empty value
    expect(input).toHaveDisplayValue('')
    // Verification button should be enabled.
    expect(vfnButton).not.toBeDisabled()
  })

  it('should update user contact successfully', async () => {
    // Arrange
    const user = userEvent.setup()
    await act(async () => {
      await NoContact.load()
      render(<NoContact />)
    })
    // Wait until all async stuff has rendered
    await waitFor(() =>
      expect(screen.queryByPlaceholderText(/loading.*/i)).toBeNull(),
    )
    const contactNumInput = screen.getByRole('textbox', {
      name: /mobile number/i,
    }) as HTMLInputElement
    const vfnButton = screen.getByRole('button', { name: /verify/i })
    const mockNumber = '98765432'
    const expectedFormattedPhoneNumber = parsePhoneNumber(
      `+65${mockNumber}`,
    )!.formatInternational()

    // Act
    await user.type(contactNumInput, mockNumber)
    await user.tab()
    expect(vfnButton).toHaveTextContent('Verify')
    // Input should now have formatted value.
    expect(contactNumInput).toHaveDisplayValue(expectedFormattedPhoneNumber)
    await user.click(vfnButton)

    // Assert
    // Should now show OTP verification box
    const otpInput = await screen.findByTestId('otp-input')
    const otpSubmitButton = screen.getByRole('button', { name: /submit/i })
    expect(otpInput).toBeInTheDocument()

    // Act
    await user.type(otpInput, '123456')
    await user.click(otpSubmitButton)

    // Assert
    // Wait for button to change to verified
    await waitFor(() => expect(vfnButton.textContent).toMatch(/verified/i), {
      timeout: 2000,
    })
    // Toast should appear.
    expect(screen.getByText(/emergency contact added\./i)).toBeInTheDocument()
    // Should now show updated phone number in input, with verified button
    expect(contactNumInput).toHaveDisplayValue(expectedFormattedPhoneNumber)
    expect(vfnButton).toBeDisabled()
  })
})

describe('User has verified contact number', () => {
  it('should render with verified contact number details', async () => {
    // Arrange
    await act(async () => {
      await WithContact.load()
      render(<WithContact />)
    })
    // Wait until all async stuff has rendered
    await waitFor(() =>
      expect(screen.queryByPlaceholderText(/loading.*/i)).toBeNull(),
    )
    const input = screen.getByRole('textbox', {
      name: /mobile number/i,
    }) as HTMLInputElement
    const vfnButton = screen.getByRole('button', { name: /verified/i })
    const expectedFormattedPhoneNumber = parsePhoneNumber(
      MOCK_USER.contact!,
    )!.formatInternational()

    // Assert
    expect(expectedFormattedPhoneNumber).toBeDefined()
    // Should prefill the input with the user's contact number.
    expect(input).toHaveDisplayValue(expectedFormattedPhoneNumber)
    // Verification button should be disabled.
    expect(vfnButton).toBeDisabled()
  })

  it('should render error if invalid phone number is entered', async () => {
    // Arrange
    const user = userEvent.setup()
    await act(async () => {
      await WithContact.load()
      render(<WithContact />)
    })
    // Wait until all async stuff has rendered
    await waitFor(() =>
      expect(screen.queryByPlaceholderText(/loading.*/i)).toBeNull(),
    )
    const input = screen.getByRole('textbox', {
      name: /mobile number/i,
    }) as HTMLInputElement
    const vfnButton = screen.getByRole('button', { name: /verified/i })

    // Act
    await user.clear(input)
    await user.type(input, '12345')
    // Should change to Verify text since contact number has changed.
    expect(vfnButton).toHaveTextContent(/verify/i)
    await user.click(vfnButton)

    // Assert
    expect(screen.getByText(INVALID_NUMBER_ERROR_MSG)).toBeInTheDocument()
  })
})
