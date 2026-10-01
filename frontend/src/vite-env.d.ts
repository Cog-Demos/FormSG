/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_VERSION?: string
  readonly VITE_URL?: string
  readonly VITE_BASE_URL?: string
  readonly VITE_GA_TRACKING_ID?: string
  readonly VITE_FORMSG_SDK_MODE?: string
  readonly VITE_DD_RUM_CLIENT_TOKEN?: string
  readonly VITE_DD_RUM_ENV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
