import type { BasicField, FieldBase } from './base'

export interface RadioFieldBase extends FieldBase {
  fieldType: BasicField.Radio
  fieldOptions: string[]
  othersRadioButton: boolean
}
