import { delay as mswDelay, http, HttpResponse } from 'msw'
import { PartialDeep } from 'type-fest'

import { GetPaymentInfoDto } from '~shared/types'

const BASE_PAYMENT_INFO = {
  client_secret: 'sample_client_secret',
  publishableKey: 'sample_pub_key',
  payment_intent_id: 'sample_piid',
  submissionId: 'sample_responseid',
}

export const getPaymentInfoResponse = ({
  delay = 0,
  overrides,
}: {
  delay?: number | 'infinite'
  overrides?: PartialDeep<GetPaymentInfoDto>
} = {}) => {
  return http.get('/api/v3/payments/:paymentId/getinfo', async () => {
    await mswDelay(delay)
    return HttpResponse.json({
      ...BASE_PAYMENT_INFO,
      ...overrides,
    })
  })
}

export const getPaymentReceiptStatusResponse = ({
  delay = 0,
}: {
  delay?: number | 'infinite'
} = {}) => {
  return http.get(
    '/api/v3/payments/:formId/:paymentId/receipt/status',
    async () => {
      await mswDelay(delay)
      return HttpResponse.json({ isReady: true })
    },
  )
}
