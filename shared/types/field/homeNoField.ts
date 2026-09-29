import type { BasicField, MyInfoableFieldBase } from './base'

export interface HomenoFieldBase extends MyInfoableFieldBase {
  fieldType: BasicField.HomeNo
  allowIntlNumbers: boolean
}
