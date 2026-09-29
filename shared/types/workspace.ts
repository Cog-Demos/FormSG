import type { Tagged } from 'type-fest'
import type { FormId } from './form'
import type { UserId } from './user'

export type WorkspaceId = Tagged<string, 'WorkspaceId'>

export type Workspace = {
  _id: WorkspaceId
  title: string
  formIds: FormId[]
  admin: UserId
}

export type WorkspaceDto = Workspace
