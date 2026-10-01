import type { RumGlobal } from '@datadog/browser-rum'
import type { Mock } from 'vitest'

describe('datadogRum', () => {
  describe('DD_RUM is undefined', () => {
    beforeEach(() => {
      window.DD_RUM = undefined
    })

    afterEach(() => {
      vi.resetModules()
    })

    it('should return a noop function for addAction', async () => {
      // Arrange
      const datadogRum = (await import('../datadog')).datadogRum as RumGlobal
      // Assert
      expect(window.DD_RUM).not.toBeDefined()
      expect(datadogRum.addAction).not.toThrow()
    })
  })

  describe('DD_RUM is defined', () => {
    let addActionSpy: Mock
    beforeEach(() => {
      addActionSpy = vi.fn()
      // @ts-expect-error mocking undefined DD_RUM
      window.DD_RUM = {
        addAction: addActionSpy,
      }
    })

    afterEach(() => {
      vi.resetModules()
    })

    it('should call addAction without throwing', async () => {
      // Arrange
      const datadogRum = (await import('../datadog')).datadogRum as RumGlobal

      // Assert
      expect(window.DD_RUM).toBeDefined()
      expect(datadogRum.addAction).not.toThrow()
      expect(addActionSpy).toBeCalledTimes(1)
    })
  })
})
