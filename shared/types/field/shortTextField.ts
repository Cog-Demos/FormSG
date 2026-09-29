import type { BasicField, FieldBase, MyInfoableFieldBase } from './base'
import type { TextValidationOptions } from './utils'

export interface ShortTextFieldBase extends MyInfoableFieldBase, FieldBase {
  fieldType: BasicField.ShortText
  ValidationOptions: TextValidationOptions
  allowPrefill?: boolean
  lockPrefill?: boolean
}
