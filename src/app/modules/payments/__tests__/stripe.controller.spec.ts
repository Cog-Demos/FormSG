import dbHandler from '__tests__/unit/backend/helpers/jest-db'
import expressHandler from '__tests__/unit/backend/helpers/jest-express'
import { ObjectId } from 'bson'
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import { errAsync, ok, okAsync } from 'neverthrow'
import { PaymentStatus, SubmissionType } from 'shared/types'
import Stripe from 'stripe'
import { MarkRequired } from 'ts-essentials'

import getPaymentModel from 'src/app/models/payment.server.model'
import { getEncryptPendingSubmissionModel } from 'src/app/models/pending_submission.server.model'
import { IPopulatedEncryptedForm, IPopulatedForm } from 'src/types'

import config from '../../../config/config'
import { stripe } from '../../../loaders/stripe'
import { FormNotFoundError } from '../../form/form.errors'
import * as FormService from '../../form/form.service'
import * as EncryptSubmissionService from '../../submission/encrypt-submission/encrypt-submission.service'
import * as StripeController from '../stripe.controller'
import * as StripeService from '../stripe.service'
import * as StripeUtils from '../stripe.utils'

const Payment = getPaymentModel(mongoose)
const EncryptPendingSubmission = getEncryptPendingSubmissionModel(mongoose)

const MOCK_FORM_ID = new ObjectId().toHexString()
const MOCK_PAYER_TOKEN = 'a'.repeat(64)
const MOCK_TARGET_ACCOUNT_ID = 'acct_MOCK_ACCOUNT_ID'

jest.mock('src/app/modules/payments/stripe.utils')
jest.mock('src/app/utils/convert-html-to-pdf')

jest.mock(
  'src/app/modules/submission/encrypt-submission/encrypt-submission.service',
)
const MockEncryptSubmissionService = jest.mocked(EncryptSubmissionService)

jest.mock('../../form/form.service')
const MockFormService = jest.mocked(FormService)

jest.mock('src/app/modules/payments/stripe.service', () => {
  const allAutoMocked = jest.createMockFromModule<typeof StripeService>(
    'src/app/modules/payments/stripe.service',
  )
  const actual = jest.requireActual('src/app/modules/payments/stripe.service')
  return {
    __esModules: true,

    // first start with all the module's functions auto-mocked
    ...allAutoMocked,

    // then override any module's function that we want to use the *real* implementations for
    generatePaymentInvoice: actual.generatePaymentInvoice,
  }
})
const MockStripeService = jest.mocked(StripeService)

describe('stripe.controller', () => {
  beforeAll(async () => await dbHandler.connect())
  afterAll(async () => await dbHandler.closeDatabase())
  beforeEach(() => jest.clearAllMocks())

  describe('_handleConnectOauthCallback', () => {
    beforeEach(async () => {
      await dbHandler.clearCollection(Payment.collection.name)
      await dbHandler.clearCollection(EncryptPendingSubmission.collection.name)
    })
    const mockForm = {
      _id: MOCK_FORM_ID,
    } as IPopulatedForm
    it('should return UNPROCESSABLE_ENTITY when state mismatch', async () => {
      // Arrange
      const mockReq = expressHandler.mockRequest({
        query: { state: 'otherState', code: 'someCode' },
        others: { signedCookies: { stripeState: 'anotherState' } },
      })
      const mockRes = expressHandler.mockResponse()
      // Act
      await StripeController._handleConnectOauthCallbackForTest(
        mockReq,
        mockRes,
        jest.fn(),
      )

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(
        StatusCodes.UNPROCESSABLE_ENTITY,
      )
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid state parameter',
      })
    })

    it('should redirect back to settings/payment page when code is undefined', async () => {
      // Arrange
      const mockReq = expressHandler.mockRequest({
        query: { state: 'otherStates' },
        others: { signedCookies: { stripeState: 'otherStates' } },
      })
      const mockRes = expressHandler.mockResponse()
      // Act
      await StripeController._handleConnectOauthCallbackForTest(
        mockReq,
        mockRes,
        jest.fn(),
      )

      // Assert
      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${config.app.appUrl}/admin/form/otherStates/settings/payments`,
      )
    })

    it('should redirect back to settings/payment page when stripe account linking is successful', async () => {
      // Arrange
      const mockReq = expressHandler.mockRequest({
        query: { state: MOCK_FORM_ID + '.otherState', code: 'someCode' },
        others: {
          signedCookies: { stripeState: MOCK_FORM_ID + '.otherState' },
        },
      })
      MockFormService.retrieveFullFormById.mockReturnValueOnce(
        okAsync(mockForm),
      )
      const mockStripeToken = {
        stripe_user_id: 'user_id',
        stripe_publishable_key: 'publishable_key',
      } as MarkRequired<
        Stripe.OAuthToken,
        'stripe_user_id' | 'stripe_publishable_key'
      >
      MockEncryptSubmissionService.checkFormIsEncryptMode.mockReturnValueOnce(
        ok(mockForm as IPopulatedEncryptedForm),
      )
      MockStripeService.exchangeCodeForAccessToken.mockReturnValueOnce(
        okAsync(mockStripeToken),
      )
      MockStripeService.linkStripeAccountToForm.mockReturnValueOnce(
        okAsync('someId'),
      )
      const mockRes = expressHandler.mockResponse()
      // Act
      await StripeController._handleConnectOauthCallbackForTest(
        mockReq,
        mockRes,
        jest.fn(),
      )

      // Assert
      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${config.app.appUrl}/admin/form/${MOCK_FORM_ID}/settings/payments`,
      )
      expect(
        MockFormService.retrieveFullFormById,
      ).toHaveBeenCalledExactlyOnceWith(MOCK_FORM_ID)
      expect(
        MockStripeService.exchangeCodeForAccessToken,
      ).toHaveBeenCalledExactlyOnceWith('someCode')
      expect(
        MockStripeService.linkStripeAccountToForm,
      ).toHaveBeenCalledExactlyOnceWith(mockForm, {
        accountId: mockStripeToken.stripe_user_id,
        publishableKey: mockStripeToken.stripe_publishable_key,
      })
    })

    it('should redirect back to settings/payment page when DatabaseError occurs', async () => {
      // Arrange
      const mockReq = expressHandler.mockRequest({
        query: { state: 'formId.otherState', code: 'someCode' },
        others: {
          signedCookies: { stripeState: 'formId.otherState' },
        },
      })
      MockFormService.retrieveFullFormById.mockReturnValueOnce(
        errAsync(new FormNotFoundError()),
      )
      const mockRes = expressHandler.mockResponse()
      // Act
      await StripeController._handleConnectOauthCallbackForTest(
        mockReq,
        mockRes,
        jest.fn(),
      )

      // Assert
      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${config.app.appUrl}/admin/form/formId/settings/payments`,
      )
      expect(
        MockFormService.retrieveFullFormById,
      ).toHaveBeenCalledExactlyOnceWith('formId')
      expect(
        MockStripeService.exchangeCodeForAccessToken,
      ).not.toHaveBeenCalledWith()
      expect(
        MockStripeService.linkStripeAccountToForm,
      ).not.toHaveBeenCalledWith()
    })
  })

  describe('payer-authorised public payment endpoints', () => {
    let payment: Awaited<ReturnType<typeof Payment.create>>
    const mockForm = {
      _id: MOCK_FORM_ID,
      payments_channel: {
        publishable_key: 'pk_MOCK',
        target_account_id: MOCK_TARGET_ACCOUNT_ID,
      },
    } as unknown as IPopulatedEncryptedForm

    beforeEach(async () => {
      await dbHandler.clearCollection(Payment.collection.name)
      await dbHandler.clearCollection(EncryptPendingSubmission.collection.name)
      const pendingSubmission = await EncryptPendingSubmission.create({
        submissionType: SubmissionType.Encrypt,
        form: MOCK_FORM_ID,
        encryptedContent: 'some random encrypted content',
        version: 1,
      })
      payment = await Payment.create({
        formId: MOCK_FORM_ID,
        targetAccountId: MOCK_TARGET_ACCOUNT_ID,
        pendingSubmissionId: pendingSubmission._id,
        amount: 12345,
        status: PaymentStatus.Pending,
        paymentIntentId: 'pi_MOCK_PAYMENT_INTENT',
        email: 'formsg@tech.gov.sg',
        gstEnabled: false,
        payerToken: MOCK_PAYER_TOKEN,
      })
      MockFormService.retrieveFullFormById.mockReturnValue(okAsync(mockForm))
      jest
        .mocked(StripeUtils.mapRouteError)
        .mockImplementation(
          jest.requireActual('src/app/modules/payments/stripe.utils')
            .mapRouteError,
        )
      MockEncryptSubmissionService.checkFormIsEncryptMode.mockImplementation(
        (form) => ok(form as IPopulatedEncryptedForm),
      )
    })

    describe('getPaymentInfo', () => {
      it.each([
        ['missing', {}],
        ['incorrect', { token: 'b'.repeat(64) }],
        ['of a different length', { token: 'abc' }],
      ])(
        'should return 404 without the client secret when the payer token is %s',
        async (_desc, query) => {
          // Arrange
          const retrieveSpy = jest.spyOn(stripe.paymentIntents, 'retrieve')
          const mockReq = expressHandler.mockRequest({
            params: { paymentId: payment._id.toString() },
            query,
          })
          const mockRes = expressHandler.mockResponse()

          // Act
          await StripeController.getPaymentInfo(mockReq, mockRes, jest.fn())

          // Assert
          expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND)
          expect(mockRes.json).not.toHaveBeenCalledWith(
            expect.objectContaining({ client_secret: expect.anything() }),
          )
          expect(retrieveSpy).not.toHaveBeenCalled()
        },
      )

      it('should return the client secret for a pending payment with the correct payer token', async () => {
        // Arrange
        const retrieveSpy = jest
          .spyOn(stripe.paymentIntents, 'retrieve')
          .mockResolvedValueOnce({
            client_secret: 'pi_MOCK_secret',
          } as unknown as Stripe.Response<Stripe.PaymentIntent>)
        const mockReq = expressHandler.mockRequest({
          params: { paymentId: payment._id.toString() },
          query: { token: MOCK_PAYER_TOKEN },
        })
        const mockRes = expressHandler.mockResponse()

        // Act
        await StripeController.getPaymentInfo(mockReq, mockRes, jest.fn())

        // Assert
        expect(retrieveSpy).toHaveBeenCalledTimes(1)
        expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            client_secret: 'pi_MOCK_secret',
            payment_status: PaymentStatus.Pending,
          }),
        )
      })

      it('should not return the client secret once the payment has completed', async () => {
        // Arrange
        await Payment.updateOne(
          { _id: payment._id },
          {
            status: PaymentStatus.Succeeded,
            completedPayment: {
              receiptUrl: 'http://form.gov.sg/receipt',
              paymentDate: new Date(),
              submissionId: new ObjectId().toHexString(),
              transactionFee: 0,
            },
          },
        )
        const retrieveSpy = jest.spyOn(stripe.paymentIntents, 'retrieve')
        const mockReq = expressHandler.mockRequest({
          params: { paymentId: payment._id.toString() },
          query: { token: MOCK_PAYER_TOKEN },
        })
        const mockRes = expressHandler.mockResponse()

        // Act
        await StripeController.getPaymentInfo(mockReq, mockRes, jest.fn())

        // Assert
        expect(retrieveSpy).not.toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            client_secret: '',
            payment_status: PaymentStatus.Succeeded,
          }),
        )
      })
    })

    describe('checkPaymentReceiptStatus', () => {
      beforeEach(async () => {
        await Payment.updateOne(
          { _id: payment._id },
          {
            status: PaymentStatus.Succeeded,
            completedPayment: {
              receiptUrl: 'http://form.gov.sg/receipt',
              paymentDate: new Date(),
              submissionId: new ObjectId().toHexString(),
              transactionFee: 0,
            },
          },
        )
      })

      it('should return the receipt status with the correct form id and payer token', async () => {
        // Arrange
        const mockReq = expressHandler.mockRequest({
          params: { formId: MOCK_FORM_ID, paymentId: payment._id.toString() },
          query: { token: MOCK_PAYER_TOKEN },
        })
        const mockRes = expressHandler.mockResponse()

        // Act
        await StripeController.checkPaymentReceiptStatus(
          mockReq,
          mockRes,
          jest.fn(),
        )

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK)
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({ isReady: true }),
        )
      })

      it.each([
        ['the payer token is missing', MOCK_FORM_ID, {}],
        [
          'the payer token is incorrect',
          MOCK_FORM_ID,
          { token: 'b'.repeat(64) },
        ],
        [
          'the form id does not match the payment',
          new ObjectId().toHexString(),
          { token: MOCK_PAYER_TOKEN },
        ],
      ])('should return 404 when %s', async (_desc, formId, query) => {
        // Arrange
        const mockReq = expressHandler.mockRequest({
          params: { formId, paymentId: payment._id.toString() },
          query,
        })
        const mockRes = expressHandler.mockResponse()

        // Act
        await StripeController.checkPaymentReceiptStatus(
          mockReq,
          mockRes,
          jest.fn(),
        )

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND)
        expect(mockRes.json).not.toHaveBeenCalledWith(
          expect.objectContaining({ isReady: true }),
        )
      })
    })
  })
})
