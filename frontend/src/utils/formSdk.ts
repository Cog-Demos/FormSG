import formsgPackage from '@opengovsg/formsg-sdk'
import { PackageMode } from '@opengovsg/formsg-sdk/dist/types'

import { TRANSACTION_EXPIRE_AFTER_SECONDS } from '~shared/utils/verification'

/**
 * Typeguard to check if sdkMode is valid PackageMode
 * @param sdkMode defined in VITE_APP_FORMSG_SDK_MODE env var
 * @returns true if sdkMode is valid PackageMode
 */
const isPackageMode = (sdkMode?: string): sdkMode is PackageMode => {
  return (
    !!sdkMode &&
    ['staging', 'production', 'development', 'test'].includes(sdkMode)
  )
}

const formsgSdk = formsgPackage({
  // Either the sdk mode is set in VITE_APP_FORMSG_SDK_MODE env var, or fall back to the Vite mode
  // (development for `vite`, test for vitest, production for `vite build`)
  mode: isPackageMode(import.meta.env.VITE_APP_FORMSG_SDK_MODE)
    ? import.meta.env.VITE_APP_FORMSG_SDK_MODE
    : isPackageMode(import.meta.env.MODE)
      ? import.meta.env.MODE
      : undefined,
  verificationOptions: {
    transactionExpiry: TRANSACTION_EXPIRE_AFTER_SECONDS,
  },
})

export default formsgSdk
