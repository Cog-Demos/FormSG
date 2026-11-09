import { Request } from 'express'

import { createReqMeta, redactUrl } from '../request'

describe('request utils', () => {
  describe('redactUrl', () => {
    it('should redact the token query param', () => {
      expect(redactUrl('/a/b?foo=1&token=secret#x')).toEqual(
        '/a/b?foo=1&token=[REDACTED]#x',
      )
    })
  })

  describe('createReqMeta', () => {
    it('should redact the payer token from the url and referer header', () => {
      const req = {
        baseUrl: '/api/v3/payments',
        path: '/abc/getinfo',
        originalUrl: '/api/v3/payments/abc/getinfo?token=supersecret',
        headers: {
          referer: 'http://localhost/f/payment/abc?token=supersecret',
          host: 'localhost',
        },
        ip: '1.2.3.4',
        get: () => undefined,
      } as unknown as Request

      const meta = createReqMeta(req)

      expect(JSON.stringify(meta)).not.toContain('supersecret')
      expect(meta.urlWithQueryParams).toEqual(
        '/api/v3/payments/abc/getinfo?token=[REDACTED]',
      )
      expect(meta.headers.referer).toEqual(
        'http://localhost/f/payment/abc?token=[REDACTED]',
      )
      expect(meta.headers.host).toEqual('localhost')
      // Original request must not be mutated
      expect(req.headers.referer).toContain('supersecret')
    })
  })
})
