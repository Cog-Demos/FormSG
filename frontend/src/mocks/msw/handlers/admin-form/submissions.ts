import { delay as mswDelay, http, HttpResponse } from 'msw'

export const getAdminFormSubmissions = ({
  delay = 0,
  override,
}: {
  delay?: number | 'infinite'
  override?: number
} = {}) => {
  return http.get('/api/v3/admin/forms/:formId/submissions/count', async () => {
    await mswDelay(delay)
    return HttpResponse.json(override ?? 20, { status: 200 })
  })
}
