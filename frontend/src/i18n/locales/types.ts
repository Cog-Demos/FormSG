import { PartialDeep } from 'type-fest'

import { AdminFormNavbar, Common, Login, PublicForm } from './features'

interface Translation {
  translation: {
    features: {
      adminFormNavbar?: AdminFormNavbar
      common?: Common
      publicForm?: PublicForm
      login?: PartialDeep<Login>
    }
  }
}

export interface FallbackTranslation extends Translation {
  translation: {
    features: Required<
      Omit<Translation['translation']['features'], 'login'>
    > & {
      login: Login
    }
  }
}

export default Translation
