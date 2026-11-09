import { getPaymentInvoiceDownloadUrlPath } from '~shared/utils/urls'

import { API_BASE_URL } from '~services/ApiService'

export const PAYER_TOKEN_QUERY_PARAM = 'token'

export const getPaymentPageUrl = (
  formId: string,
  paymentId: string,
  payerToken?: string,
) => {
  const path = `/${formId}/payment/${paymentId}`
  if (!payerToken) return path
  return `${path}?${PAYER_TOKEN_QUERY_PARAM}=${encodeURIComponent(payerToken)}`
}

export const getPaymentInvoiceDownloadUrl = (
  formId: string,
  paymentId: string,
  payerToken?: string,
) => {
  return `${API_BASE_URL}/${getPaymentInvoiceDownloadUrlPath(
    formId,
    paymentId,
    payerToken,
  )}` as const
}

export const getPublicFormUrl = (formId: string) => {
  return `/${formId}` as const
}
