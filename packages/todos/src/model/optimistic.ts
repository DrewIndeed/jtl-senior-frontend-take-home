import type { Todo } from '@jtl/shared';
import type { TodoRow } from './keys';

// Pure list helpers: unit-testable without React or a QueryClient.
export const insertPending = (
  rows: TodoRow[] | undefined,
  row: TodoRow,
  index?: number
): TodoRow[] => {
  const list = rows ?? [];
  const at = index === undefined ? list.length : Math.min(index, list.length);
  return [...list.slice(0, at), row, ...list.slice(at)];
};
export const removeById = (
  rows: TodoRow[] | undefined,
  id: string
): TodoRow[] | undefined => rows?.filter((r) => r.id !== id);
export const replaceById = (
  rows: TodoRow[] | undefined,
  id: string,
  todo: Todo
): TodoRow[] | undefined => rows?.map((r) => (r.id === id ? todo : r));
export const patchById = (
  rows: TodoRow[] | undefined,
  id: string,
  patch: Partial<Todo>
): TodoRow[] | undefined =>
  rows?.map((r) => (r.id === id ? { ...r, ...patch } : r));
/** Put a row back at its old index unless it is already there (per-item rollback for delete). */
export const restoreAt = (
  rows: TodoRow[] | undefined,
  row: TodoRow,
  index: number
): TodoRow[] | undefined => {
  if (!rows || rows.some((r) => r.id === row.id)) return rows;
  const at = Math.min(index, rows.length);
  return [...rows.slice(0, at), row, ...rows.slice(at)];
};
