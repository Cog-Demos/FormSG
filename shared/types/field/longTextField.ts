import type { BasicField, FieldBase } from './base'
import type { TextValidationOptions } from './utils'

export interface LongTextFieldBase extends FieldBase {
  fieldType: BasicField.LongText
  ValidationOptions: TextValidationOptions
}
