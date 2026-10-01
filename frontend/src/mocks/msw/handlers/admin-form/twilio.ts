import { delay as mswDelay, http, HttpResponse } from 'msw'

import { SmsCountsDto } from '~shared/types/form'

export const putTwilioCredentials = ({
  delay = 0,
}: {
  delay?: number | 'infinite' | 'real'
} = {}) => {
  return http.put('/api/v3/admin/forms/:formId/twilio', async () => {
    await mswDelay(delay)
    return HttpResponse.json({ message: 'Success' }, { status: 200 })
  })
}

export const getFreeSmsQuota = ({
  delay = 0,
  override,
}: {
  delay?: number | 'infinite' | 'real'
  override?: Partial<SmsCountsDto>
} = {}) => {
  return http.get(
    '/api/v3/admin/forms/:formId/verified-sms/count/free',
    async () => {
      await mswDelay(delay)
      return HttpResponse.json<SmsCountsDto>(
        {
          freeSmsCounts: 45,
          quota: 10000,
          ...override,
        },
        { status: 200 },
      )
    },
  )
}
