import { PartialDeep } from 'type-fest'

import { AdminFormNavbar, Common, Login, PublicForm } from './features'

interface Translation {
  translation: {
    features: {
      adminFormNavbar?: PartialDeep<AdminFormNavbar>
      common?: PartialDeep<Common>
      publicForm?: PartialDeep<PublicForm>
      login?: PartialDeep<Login>
    }
  }
}

export interface FallbackTranslation extends Translation {
  translation: {
    features: {
      adminFormNavbar: AdminFormNavbar
      common: Common
      publicForm: PublicForm
      login: Login
    }
  }
}

export default Translation
