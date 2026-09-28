import { useCallback, useEffect, useMemo } from 'react'
import {
  FieldError,
  useFieldArray,
  useFormContext,
  useFormState,
} from 'react-hook-form'
import { BiTrash } from 'react-icons/bi'
import { CellProps, Column, Renderer, useTable } from 'react-table'
import {
  Box,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VisuallyHidden,
} from '@chakra-ui/react'
import { get, head, omit, uniq } from 'lodash'
import simplur from 'simplur'

import { FormColorTheme } from '~shared/types'

import { useHasChanged } from '~hooks/useHasChanged'
import { useIsMobile } from '~hooks/useIsMobile'
import FormErrorMessage from '~components/FormControl/FormErrorMessage'
import IconButton from '~components/IconButton'

import { BaseFieldProps } from '../FieldContainer'
import {
  TableFieldInputs,
  TableFieldSchema,
  TableRowFieldValue,
} from '../types'

import { createTableRow } from './utils/createRow'
import { AddRowFooter } from './AddRowFooter'
import { ColumnCell } from './ColumnCell'
import { ColumnHeader } from './ColumnHeader'
import { TableFieldContainer } from './TableFieldContainer'

export interface TableFieldProps extends BaseFieldProps {
  schema: TableFieldSchema
  disableRequiredValidation?: boolean
}

/**
 * Field renderer for Table fields.
 * @precondition This component uses `react-hook-form#useFieldArray`, and will require defaultValues to be populated in the parent `useForm` hook.
 * @precondition Must have a parent `react-hook-form#FormProvider` component.
 */
export const TableField = ({
  schema,
  disableRequiredValidation,
  colorTheme = FormColorTheme.Blue,
}: TableFieldProps): JSX.Element => {
  const minimumRows = schema.minimumRows === '' ? 0 : schema.minimumRows
  const hasMinRowsChanged = useHasChanged(minimumRows)
  const isMobile = useIsMobile()

  const columnsData = useMemo<Column<TableRowFieldValue>[]>(() => {
    return schema.columns.map((c) => ({
      Header: (
        <ColumnHeader title={c.title} isRequired={c.required} id={c._id} />
      ),
      accessor: c._id,
      // The remaining ColumnCellProps are supplied via `cell.render('Cell', props)`.
      Cell: ColumnCell as unknown as Renderer<
        CellProps<TableRowFieldValue, string>
      >,
    }))
  }, [schema.columns])

  const formMethods = useFormContext<TableFieldInputs>()
  const { errors } = useFormState({
    control: formMethods.control,
    name: schema._id,
  })

  const tableErrors = get(errors, schema._id)
  const uniqTableError = useMemo(() => {
    // On mobile, errors are shown directly in the individual table cells and
    // would not need to be shown in the table field itself.
    if (isMobile) return
    // Get first available error amongst all column cell errors.
    if (!Array.isArray(tableErrors)) return
    return head(
      uniq(
        tableErrors.flatMap((err = {}) =>
          Object.values(err as Record<string, FieldError | undefined>),
        ),
      ),
    )
  }, [isMobile, tableErrors])

  const { fields, append, remove } = useFieldArray<TableFieldInputs>({
    control: formMethods.control,
    name: schema._id,
  })

  const appendTableRow = useCallback(
    () => append(createTableRow(schema), { shouldFocus: false }),
    [append, schema],
  )

  useEffect(() => {
    // Update field array when min rows changes.
    if (hasMinRowsChanged) {
      const prevRowLength = fields.length
      if (minimumRows > prevRowLength) {
        for (let i = prevRowLength; i < minimumRows; i++) {
          appendTableRow()
        }
      } else {
        // Remove rows from field array
        for (let i = prevRowLength; i > minimumRows; i--) {
          remove(i - 1)
        }
      }
    }
  }, [appendTableRow, fields.length, hasMinRowsChanged, minimumRows, remove])

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns: columnsData, data: fields })

  const handleAddRow = useCallback(() => {
    if (
      !schema.addMoreRows ||
      (!!schema.maximumRows && fields.length >= schema.maximumRows)
    )
      return
    return appendTableRow()
  }, [appendTableRow, fields.length, schema])

  const handleRemoveRow = useCallback(
    (rowIndex: number) => {
      if (fields.length <= minimumRows || rowIndex >= fields.length) {
        return
      }
      return remove(rowIndex)
    },
    [fields.length, minimumRows, remove],
  )

  const ariaTableDescription = useMemo(() => {
    let description = simplur`This is a table field. There [is|are] ${fields.length} row[|s], excluding the header row.`
    if (schema.addMoreRows) {
      description += ` You can add more rows if you'd like by clicking the "Add another row" button below`
      if (schema.maximumRows) {
        description += `, up to ${schema.maximumRows} rows`
      } else {
        description += '.'
      }
    }

    return description
  }, [fields.length, schema.addMoreRows, schema.maximumRows])

  // If a table field with >1 column is present in a form, Chrome and MS Edge sometimes truncate the form in print mode.
  // as it erroneously computes the number of pages to print.
  // We set the height of the table explicitly (based on the number of cols and rows)
  // for use in the media query so that the browser is able to render the full table in print mode
  // calculation = the amount of space taken by each table cell and table cell heading + additional margins for each row
  const printTableHeight =
    schema.columns.length * rows.length * (2.75 + 2.25 + 1.5) + rows.length * 3

  return (
    <TableFieldContainer schema={schema}>
      <Box
        display="block"
        w="100%"
        overflowX="auto"
        sx={{
          '&::-webkit-scrollbar': {
            height: '7px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,.5)',
            borderRadius: '4px',
          },
          '@media print': {
            h: `${printTableHeight}rem`,
            display: 'block !important',
            overflow: 'visible !important',
          },
        }}
      >
        <VisuallyHidden id={`table-desc-${schema._id}`}>
          {ariaTableDescription}
        </VisuallyHidden>
        <Table
          {...getTableProps()}
          aria-describedby={`table-desc-${schema._id}`}
          aria-labelledby={`${schema._id}-label`}
          variant="column-stripe"
          size="sm"
          colorScheme={`theme-${colorTheme}`}
        >
          <Thead display={{ base: 'none', md: 'table-header-group' }}>
            {headerGroups.map((headerGroup) => {
              const { key: headerGroupKey, ...headerGroupProps } =
                headerGroup.getHeaderGroupProps()
              return (
                <Tr key={headerGroupKey} {...headerGroupProps}>
                  {headerGroup.headers.map((column, _idx, array) => {
                    const { key: headerKey, ...headerProps } =
                      column.getHeaderProps()
                    return (
                      <Th
                        key={headerKey}
                        {...headerProps}
                        scope="col"
                        w={{
                          base: 'initial',
                          md: `calc(100%/${array.length})`,
                        }}
                        minW="15rem"
                        display={{ base: 'block', md: 'table-cell' }}
                      >
                        {column.render('Header')}
                      </Th>
                    )
                  })}
                </Tr>
              )
            })}
          </Thead>
          <Tbody {...getTableBodyProps()} verticalAlign="baseline">
            {rows.map((row, rowIndex) => {
              prepareRow(row)
              const rowProps = omit(row.getRowProps(), 'key')
              return (
                // The `key` prop is required for useFieldArray to remove the correct row.
                <Tr {...rowProps} key={row.original.id}>
                  {row.cells.map((cell, j) => {
                    const { key: cellKey, ...cellProps } = cell.getCellProps()
                    return (
                      <Td
                        key={cellKey}
                        {...cellProps}
                        display={{ base: 'block', md: 'table-cell' }}
                        sx={{
                          '@media print': {
                            breakInside: 'avoid',
                          },
                        }}
                      >
                        {cell.render('Cell', {
                          schemaId: schema._id,
                          isDisabled: schema.disabled,
                          disableRequiredValidation,
                          columnSchema: schema.columns[j],
                          colorTheme,
                        })}
                      </Td>
                    )
                  })}

                  {schema.addMoreRows ? (
                    <Td
                      verticalAlign="top"
                      textAlign="end"
                      display={{ base: 'block', md: 'table-cell' }}
                    >
                      <IconButton
                        isDisabled={
                          schema.disabled || fields.length <= minimumRows
                        }
                        variant="clear"
                        colorScheme="danger"
                        aria-label="Remove row"
                        icon={<BiTrash />}
                        onClick={() => handleRemoveRow(rowIndex)}
                      />
                    </Td>
                  ) : null}
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Box>
      {uniqTableError ? (
        <FormErrorMessage my="0.75rem">
          {uniqTableError.message}
        </FormErrorMessage>
      ) : null}
      {schema.addMoreRows && schema.maximumRows !== undefined ? (
        <AddRowFooter
          isDisabled={schema.disabled}
          currentRows={fields.length}
          maxRows={schema.maximumRows}
          handleAddRow={handleAddRow}
        />
      ) : null}
    </TableFieldContainer>
  )
}
