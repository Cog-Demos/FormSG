import type { FormDto } from './form'
import type { Merge } from 'type-fest'
import type { DateString } from '../generic'

export type SubmitFormIssueBodyDto = {
  isPreview?: boolean
  issue: string
  email?: string
}

/**
 * Typing for individual form issue
 */
export type FormIssueBase = {
  formId: FormDto['_id']
  issue: string
  email?: string
  created?: Date
  lastModified?: Date
}

// Convert to serialized version.
export type FormIssueDto = Merge<
  FormIssueBase,
  { created?: DateString; lastModified?: DateString }
>

export type ProcessedIssueMeta = {
  index: number
  issue: string
  email?: string
  timestamp: number
}

export type FormIssueMetaDto = {
  count: number
  issues: ProcessedIssueMeta[]
}

export type FormIssueMetaQueryDto = {
  limit: number
}
