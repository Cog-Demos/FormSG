/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  /** Injected from `npm_package_version` via `define` in vite.config.ts */
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_URL?: string
  readonly VITE_APP_BASE_URL?: string
  readonly VITE_APP_GA_TRACKING_ID?: string
  readonly VITE_APP_FORMSG_SDK_MODE?: string
  readonly VITE_APP_GROWTHBOOK_CLIENT_KEY?: string
  readonly VITE_APP_DD_RUM_APP_ID?: string
  readonly VITE_APP_DD_RUM_CLIENT_TOKEN?: string
  readonly VITE_APP_DD_RUM_ENV?: string
  readonly VITE_APP_DD_SAMPLE_RATE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
