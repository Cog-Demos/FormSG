import { redactUrl } from '../logging'

describe('logging', () => {
  describe('redactUrl', () => {
    it('should redact the token query param', () => {
      expect(
        redactUrl('/api/v3/payments/abc/getinfo?token=secret&foo=bar'),
      ).toEqual('/api/v3/payments/abc/getinfo?token=[REDACTED]&foo=bar')
      expect(redactUrl('/payments/f/p/receipt/status?foo=1&token=s')).toEqual(
        '/payments/f/p/receipt/status?foo=1&token=[REDACTED]',
      )
    })

    it('should leave urls without a token unchanged', () => {
      expect(redactUrl('/api/v3/forms/abc?mytoken=x')).toEqual(
        '/api/v3/forms/abc?mytoken=x',
      )
    })
  })
})
