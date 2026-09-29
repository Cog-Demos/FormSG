import type { Merge } from 'type-fest'
import type { FieldBase, BasicField } from './base'
import type { DropdownFieldBase } from './dropdownField'
import type { ShortTextFieldBase } from './shortTextField'

// Column types do not have most field base props.
type ColumnBase<T extends FieldBase> = Omit<T, keyof FieldBase> & {
  title: string
  required: boolean
}
export interface ShortTextColumnBase extends ColumnBase<ShortTextFieldBase> {
  columnType: BasicField.ShortText
}
export interface DropdownColumnBase extends ColumnBase<DropdownFieldBase> {
  columnType: BasicField.Dropdown
}

export type Column = ShortTextColumnBase | DropdownColumnBase

export type ColumnDto<C extends Column = Column> = C & { _id: string }

export interface TableFieldBase extends FieldBase {
  fieldType: BasicField.Table
  minimumRows: number | ''
  addMoreRows?: boolean
  maximumRows?: number | ''
  columns: Column[]
}

export type TableFieldDto<T extends TableFieldBase = TableFieldBase> = Merge<
  T,
  { columns: ColumnDto[] }
> & {
  _id: string
}
