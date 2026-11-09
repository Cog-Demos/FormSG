import express from 'express'
import supertest from 'supertest'
import winston from 'winston'

import { redactUrl } from '../../../utils/request'
import loggingMiddleware from '../logging'

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

  describe('loggingMiddleware', () => {
    it('should not log the payer token from the url, query or referer', async () => {
      const writeSpy = jest
        .spyOn(winston.transports.Console.prototype, 'log')
        .mockImplementation((...args: unknown[]) => (args[1] as () => void)())
      const app = express()
      app.use(loggingMiddleware())
      app.get('/api/v3/payments/:paymentId/getinfo', (_req, res) =>
        res.json({}),
      )

      await supertest(app)
        .get('/api/v3/payments/abc/getinfo?token=supersecrettoken')
        .set('Referer', 'http://localhost/f/payment/abc?token=supersecrettoken')
        .expect(200)

      expect(writeSpy).toHaveBeenCalled()
      const logged = JSON.stringify(writeSpy.mock.calls.map(([info]) => info))
      expect(logged).not.toContain('supersecrettoken')
      expect(logged).toContain('token=[REDACTED]')
      writeSpy.mockRestore()
    })
  })
})
