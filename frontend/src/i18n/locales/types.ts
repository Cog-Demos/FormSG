import { PartialDeep } from 'type-fest'

import { AdminFormNavbar, Common, Login, PublicForm } from './features'

interface Features {
  adminFormNavbar: AdminFormNavbar
  common: Common
  publicForm: PublicForm
  login: Login
}

interface Translation {
  translation: {
    features: { [K in keyof Features]?: PartialDeep<Features[K]> }
  }
}

export interface FallbackTranslation extends Translation {
  translation: {
    features: Features
  }
}

export default Translation
