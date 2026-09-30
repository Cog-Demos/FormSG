import { delay, http, HttpResponse } from 'msw'

export const otpGenerationResponse = ({
  isInvalid = false,
}: { isInvalid?: boolean } = {}): ReturnType<(typeof http)['post']> => {
  return http.post<never, { email: string }, string>(
    '/api/v3/auth/otp/generate',
    async ({ request }) => {
      const reqBody = await request.json()
      await delay()
      return HttpResponse.json(
        isInvalid
          ? 'This is not a whitelisted public service email domain. Please log in with your official government or government-linked email address.'
          : `OTP sent to ${reqBody.email}`,
        { status: isInvalid ? 401 : 200 },
      )
    },
  )
}

export const authHandlers = [
  otpGenerationResponse(),
  http.post<never, { email: string; otp: string }>(
    '/api/v3/auth/otp/verify',
    async ({ request }) => {
      const reqBody = await request.json()
      if (reqBody.otp === '123456') {
        await delay()
        return new HttpResponse(null, { status: 200 })
      }
      await delay()
      return HttpResponse.json({ message: 'Wrong OTP' }, { status: 401 })
    },
  ),
  http.get('/api/v3/auth/logout', async () => {
    await delay()
    return HttpResponse.json(
      { message: 'Sign out successful' },
      { status: 200 },
    )
  }),
]
