import type { Todo } from '@jtl/shared'
import type { TodoRow } from './keys'

// Pure list helpers: unit-testable without React or a QueryClient.
export const insertPending = (rows: TodoRow[] | undefined, row: TodoRow): TodoRow[] => [...(rows ?? []), row]
export const removeById = (rows: TodoRow[] | undefined, id: string): TodoRow[] | undefined => rows?.filter((r) => r.id !== id)
export const replaceById = (rows: TodoRow[] | undefined, id: string, todo: Todo): TodoRow[] | undefined =>
  rows?.map((r) => (r.id === id ? todo : r))
