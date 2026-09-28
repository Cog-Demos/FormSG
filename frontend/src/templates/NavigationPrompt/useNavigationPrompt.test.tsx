import { PropsWithChildren } from 'react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { act, renderHook } from '@testing-library/react'

import { useNavigationPrompt } from './useNavigationPrompt'

const wrapper = ({ children }: PropsWithChildren) => (
  <MemoryRouter initialEntries={['/start']}>{children}</MemoryRouter>
)

const useHarness = (when: boolean) => ({
  prompt: useNavigationPrompt(when),
  navigate: useNavigate(),
  location: useLocation(),
})

describe('useNavigationPrompt', () => {
  it('blocks navigation and shows the prompt when enabled', () => {
    const { result } = renderHook(() => useHarness(true), { wrapper })

    act(() => result.current.navigate('/next'))

    expect(result.current.prompt.isPromptShown).toBe(true)
    expect(result.current.location.pathname).toBe('/start')
  })

  it('navigates to the blocked target on confirm', () => {
    const { result } = renderHook(() => useHarness(true), { wrapper })

    act(() => result.current.navigate('/next'))
    act(() => result.current.prompt.onConfirm())

    expect(result.current.prompt.isPromptShown).toBe(false)
    expect(result.current.location.pathname).toBe('/next')
  })

  it('does not block navigation when disabled', () => {
    const { result } = renderHook(() => useHarness(false), { wrapper })

    act(() => result.current.navigate('/next'))

    expect(result.current.prompt.isPromptShown).toBe(false)
    expect(result.current.location.pathname).toBe('/next')
  })
})
