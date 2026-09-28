import type { BasicField, MyInfoableFieldBase } from './base'
import type { CountryRegion } from '../../constants/countryRegion'

export interface CountryRegionFieldBase extends MyInfoableFieldBase {
  fieldType: BasicField.CountryRegion
  fieldOptions: CountryRegion[]
}
