import { StatusCodes } from 'http-status-codes'

import { createLoggerWithLabel } from '../../config/logger'
import { ControllerHandler } from '../core/core.types'
import * as FormService from '../form/form.service'
import { checkFormIsEncryptMode } from '../submission/encrypt-submission/encrypt-submission.service'

import * as PaymentProofService from './payment-proof.service'
import * as PaymentService from './payments.service'

const logger = createLoggerWithLabel(module)
/**
 * Handler for GET /api/v3/payments/:formId/:paymentId/invoice/download?token=<payerToken>
 * Redirects the payer to the invoice PDF of the payment.
 *
 * @returns 302 redirect to the invoice PDF
 * @returns 404 if the PaymentId is not found, does not belong to the FormId,
 * or the payer token does not match
 * @returns 404 if the FormId is not found
 * @returns 404 if payment.completedPayment?.receiptUrl is not found
 */
export const downloadPaymentInvoice: ControllerHandler<
  {
    formId: string
    paymentId: string
  },
  unknown,
  unknown,
  { token?: unknown }
> = (req, res) => {
  const { formId, paymentId } = req.params
  logger.info({
    message: 'downloadPaymentInvoice endpoint called',
    meta: {
      action: 'downloadPaymentInvoice',
      formId,
      paymentId,
    },
  })

  return PaymentService.findPaymentForPayer({
    paymentId,
    payerToken: req.query.token,
    formId,
  })
    .andThen((payment) =>
      FormService.retrieveFullFormById(String(payment.formId))
        .andThen(checkFormIsEncryptMode)
        .map((populatedForm) => [payment, populatedForm] as const),
    )
    .andThen(([payment, populatedForm]) => {
      logger.info({
        message: 'Found paymentId in payment document',
        meta: {
          action: 'downloadPaymentInvoice',
          payment,
        },
      })
      return PaymentProofService.generatePaymentInvoiceUrl(
        payment,
        populatedForm,
      )
    })
    .map((pdfUrl) => {
      logger.info({
        message: `received generated payment invoice url, redirecting to ${pdfUrl}`,
        meta: {
          action: 'downloadPaymentInvoice',
          formId,
          paymentId,
        },
      })
      return res.redirect(pdfUrl)
    })
    .mapErr((error) => {
      logger.error({
        message: 'Error retrieving invoice',
        meta: {
          action: 'downloadPaymentInvoice',
          formId,
          paymentId,
        },
        error,
      })
      return res.status(StatusCodes.NOT_FOUND).json({ message: error })
    })
}
